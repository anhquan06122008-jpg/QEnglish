/* ==========================================================================
   QEnglish — Cloud Auth, Isolated User Workspaces, Cross-Device Sync & Storage
   Supports:
   1. Production Cloud Mode: Supabase Auth + PostgREST RLS + Supabase Storage
   2. Transparent Local Fallback Mode: Salted SHA-256 auth in browser when
      Supabase env vars are not yet configured (file://, GitHub Pages, local)
   ZERO secrets stored on frontend — reads public runtime config via /api/config.
   ========================================================================== */

const CLOUD_SESSION_KEY = "qenglish_cloud_session_v1";
const LOCAL_AUTH_USERS_KEY = "qenglish_local_auth_users_v1";
const LOCAL_AUTH_SESSION_KEY = "qenglish_local_auth_session_v1";
const DEVICE_ID_KEY = "qenglish_device_id_v1";

window.__QENGLISH_ACTIVE_UID = null;
window.__QENGLISH_AUTH_USER = null;

function getOrCreateDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = "dev-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}

async function hashPasswordWithSalt(password, saltHex) {
    const input = `${saltHex}:${String(password || "")}`;
    if (window.crypto && window.crypto.subtle && typeof TextEncoder !== "undefined") {
        const bytes = new TextEncoder().encode(input);
        const buf = await window.crypto.subtle.digest("SHA-256", bytes);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    // Pure JS fallback when crypto.subtle is unavailable (non-HTTPS file:// or insecure HTTP)
    let h1 = 0x811c9dc5;
    let h2 = 0xdeadbeef;
    for (let i = 0; i < input.length; i++) {
        const ch = input.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 0x01000193);
        h2 = Math.imul(h2 ^ ch, 2654435761);
    }
    return ((h1 >>> 0).toString(16).padStart(8, "0")) + ((h2 >>> 0).toString(16).padStart(8, "0"));
}

function generateSaltHex() {
    if (window.crypto && window.crypto.getRandomValues) {
        const arr = new Uint8Array(12);
        window.crypto.getRandomValues(arr);
        return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const CloudClient = {
    config: {
        loaded: false,
        authConfigured: false,
        aiConfigured: false,
        aiProvider: "none",
        supabaseUrl: "",
        supabaseAnonKey: "",
        storageBucket: "qenglish-materials",
        requireAuthForAi: false
    },
    session: null, // { access_token, refresh_token, expires_at, user }
    syncStatus: {
        state: "idle", // idle | syncing | synced | offline | conflict | error
        message: "Chưa đồng bộ",
        lastSyncedAt: null,
        revision: 0
    },
    _syncTimer: null,
    _syncInFlight: false,
    _pendingSyncAfterFlight: false,
    _recoveryAccessToken: null,

    async initConfig() {
        if (window.location.protocol === "file:") {
            this.config.loaded = true;
            this.config.authConfigured = false;
            return this.config;
        }
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 5000);
            const res = await fetch("/api/config", { method: "GET", cache: "no-store", signal: ctrl.signal });
            clearTimeout(timer);
            if (res.ok) {
                const data = await res.json();
                if (data && data.ok) {
                    this.config = { ...this.config, ...data, loaded: true };
                    return this.config;
                }
            }
        } catch {
            // Static host without serverless endpoints
        }
        this.config.loaded = true;
        return this.config;
    },

    isCloudMode() {
        return Boolean(this.config.authConfigured && this.config.supabaseUrl && this.config.supabaseAnonKey);
    },

    getAccessToken() {
        return this.session?.access_token || "";
    },

    getUser() {
        return window.__QENGLISH_AUTH_USER || this.session?.user || null;
    },

    getHeaders(useAuth = true) {
        const h = {
            "Content-Type": "application/json",
            "apikey": this.config.supabaseAnonKey
        };
        if (useAuth && this.session?.access_token) {
            h["Authorization"] = `Bearer ${this.session.access_token}`;
        }
        return h;
    },

    parseUrlAuthHash() {
        const hash = String(window.location.hash || "").replace(/^#/, "");
        const search = String(window.location.search || "").replace(/^\?/, "");
        const params = new URLSearchParams(hash || search);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");
        const errorDesc = params.get("error_description") || params.get("error");
        if (hash && (accessToken || errorDesc || type)) {
            try {
                history.replaceState(null, "", window.location.pathname + window.location.search);
            } catch {}
        }
        return { accessToken, refreshToken, type, errorDesc };
    },

    saveSessionToStorage(sessionObj) {
        this.session = sessionObj || null;
        if (sessionObj) {
            safeWriteJSON(CLOUD_SESSION_KEY, sessionObj);
        } else {
            localStorage.removeItem(CLOUD_SESSION_KEY);
        }
    },

    async restoreSession() {
        await this.initConfig();
        const urlAuth = this.parseUrlAuthHash();

        if (this.isCloudMode()) {
            if (urlAuth.errorDesc) {
                return { restored: false, recoveryMode: false, error: decodeURIComponent(urlAuth.errorDesc) };
            }
            if (urlAuth.type === "recovery" && urlAuth.accessToken) {
                this._recoveryAccessToken = urlAuth.accessToken;
                return { restored: false, recoveryMode: true };
            }
            if (urlAuth.accessToken && urlAuth.refreshToken) {
                const user = await this.fetchAuthUser(urlAuth.accessToken);
                if (user) {
                    const sess = {
                        access_token: urlAuth.accessToken,
                        refresh_token: urlAuth.refreshToken,
                        expires_at: Math.floor(Date.now() / 1000) + 3500,
                        user
                    };
                    this.saveSessionToStorage(sess);
                    return { restored: true, user, emailConfirmed: urlAuth.type === "signup" };
                }
            }

            const saved = safeParseJSON(localStorage.getItem(CLOUD_SESSION_KEY), null);
            if (saved && saved.access_token) {
                const nowSec = Math.floor(Date.now() / 1000);
                if (saved.expires_at && saved.expires_at - 90 < nowSec && saved.refresh_token) {
                    const refreshed = await this.refreshToken(saved.refresh_token);
                    if (refreshed.ok) return { restored: true, user: refreshed.user };
                } else {
                    const user = await this.fetchAuthUser(saved.access_token);
                    if (user) {
                        saved.user = user;
                        this.saveSessionToStorage(saved);
                        return { restored: true, user };
                    }
                    if (saved.refresh_token) {
                        const refreshed = await this.refreshToken(saved.refresh_token);
                        if (refreshed.ok) return { restored: true, user: refreshed.user };
                    }
                }
                this.saveSessionToStorage(null);
            }
            return { restored: false };
        }

        // Local-browser fallback auth session
        const localSess = safeParseJSON(localStorage.getItem(LOCAL_AUTH_SESSION_KEY), null);
        const usersMap = safeParseJSON(localStorage.getItem(LOCAL_AUTH_USERS_KEY), {});
        if (localSess && localSess.userId && usersMap[localSess.userId]) {
            const u = usersMap[localSess.userId];
            return {
                restored: true,
                localMode: true,
                user: {
                    id: u.id,
                    email: u.email,
                    user_metadata: { display_name: u.displayName, avatar: u.avatar || "🚀" }
                }
            };
        }
        return { restored: false, localMode: true };
    },

    async fetchAuthUser(accessToken) {
        try {
            const res = await fetch(`${this.config.supabaseUrl}/auth/v1/user`, {
                method: "GET",
                headers: {
                    "apikey": this.config.supabaseAnonKey,
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    },

    async refreshToken(refreshTokenVal) {
        try {
            const res = await fetch(`${this.config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
                method: "POST",
                headers: this.getHeaders(false),
                body: JSON.stringify({ refresh_token: refreshTokenVal })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.access_token || !data.user) {
                this.saveSessionToStorage(null);
                return { ok: false };
            }
            const sess = {
                access_token: data.access_token,
                refresh_token: data.refresh_token || refreshTokenVal,
                expires_at: Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600),
                user: data.user
            };
            this.saveSessionToStorage(sess);
            return { ok: true, user: data.user };
        } catch {
            return { ok: false };
        }
    },

    async signUp({ displayName, email, password, termsAccepted }) {
        const cleanEmail = String(email || "").trim().toLowerCase();
        const cleanName = String(displayName || "").trim();
        if (!cleanName) return { ok: false, error: "Vui lòng nhập Tên hiển thị." };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { ok: false, error: "Email không đúng định dạng." };
        if (String(password || "").length < 6) return { ok: false, error: "Mật khẩu phải có ít nhất 6 ký tự." };
        if (!termsAccepted) return { ok: false, error: "Bạn cần đồng ý với Điều khoản sử dụng để đăng ký." };

        if (this.isCloudMode()) {
            try {
                const res = await fetch(`${this.config.supabaseUrl}/auth/v1/signup`, {
                    method: "POST",
                    headers: this.getHeaders(false),
                    body: JSON.stringify({
                        email: cleanEmail,
                        password,
                        data: {
                            display_name: cleanName,
                            avatar: "🚀",
                            terms_accepted_at: new Date().toISOString()
                        },
                        options: {
                            emailRedirectTo: window.location.origin + window.location.pathname
                        }
                    })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    const msg = data.msg || data.error_description || data.error || "Đăng ký thất bại.";
                    return { ok: false, error: this.translateAuthError(msg) };
                }
                if (data.access_token && data.user) {
                    const sess = {
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        expires_at: Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600),
                        user: data.user
                    };
                    this.saveSessionToStorage(sess);
                    await this.upsertProfile(data.user, cleanName);
                    return { ok: true, needsVerification: false, user: data.user };
                }
                return {
                    ok: true,
                    needsVerification: true,
                    email: cleanEmail,
                    message: `Đăng ký thành công! Vui lòng mở hộp thư ${cleanEmail} và nhấn vào liên kết xác minh email trước khi đăng nhập.`
                };
            } catch {
                return { ok: false, error: "Không thể kết nối tới máy chủ xác thực Supabase." };
            }
        }

        // Local-browser fallback registration with hashed password
        const usersMap = safeParseJSON(localStorage.getItem(LOCAL_AUTH_USERS_KEY), {});
        if (Object.values(usersMap).some(u => u.email === cleanEmail)) {
            return { ok: false, error: "Email này đã được đăng ký trên trình duyệt." };
        }
        const salt = generateSaltHex();
        const passwordHash = await hashPasswordWithSalt(password, salt);
        const uid = "local-" + cleanEmail.replace(/[^a-z0-9]/g, "") + "-" + Date.now().toString(36);
        usersMap[uid] = {
            id: uid,
            displayName: cleanName,
            email: cleanEmail,
            avatar: "🚀",
            salt,
            passwordHash,
            termsAcceptedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        safeWriteJSON(LOCAL_AUTH_USERS_KEY, usersMap);
        safeWriteJSON(LOCAL_AUTH_SESSION_KEY, { userId: uid, signedInAt: new Date().toISOString() });
        return {
            ok: true,
            localMode: true,
            needsVerification: false,
            user: { id: uid, email: cleanEmail, user_metadata: { display_name: cleanName, avatar: "🚀" } }
        };
    },

    async signIn({ email, password }) {
        const cleanEmail = String(email || "").trim().toLowerCase();
        if (!cleanEmail || !password) return { ok: false, error: "Vui lòng nhập đầy đủ Email và Mật khẩu." };

        if (this.isCloudMode()) {
            try {
                const res = await fetch(`${this.config.supabaseUrl}/auth/v1/token?grant_type=password`, {
                    method: "POST",
                    headers: this.getHeaders(false),
                    body: JSON.stringify({ email: cleanEmail, password })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.access_token || !data.user) {
                    const rawMsg = data.error_description || data.msg || data.error || "Email hoặc mật khẩu chưa chính xác.";
                    return {
                        ok: false,
                        unconfirmed: /not confirmed|confirm/i.test(rawMsg),
                        error: this.translateAuthError(rawMsg)
                    };
                }
                const sess = {
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    expires_at: Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600),
                    user: data.user
                };
                this.saveSessionToStorage(sess);
                return { ok: true, user: data.user };
            } catch {
                return { ok: false, error: "Lỗi kết nối mạng tới máy chủ đăng nhập." };
            }
        }

        // Local-browser hashed verification
        const usersMap = safeParseJSON(localStorage.getItem(LOCAL_AUTH_USERS_KEY), {});
        const found = Object.values(usersMap).find(u => u.email === cleanEmail);
        if (!found) {
            return { ok: false, error: "Tài khoản chưa tồn tại trên trình duyệt này. Vui lòng Đăng ký." };
        }
        const computed = await hashPasswordWithSalt(password, found.salt);
        if (computed !== found.passwordHash) {
            return { ok: false, error: "Email hoặc mật khẩu chưa đúng." };
        }
        safeWriteJSON(LOCAL_AUTH_SESSION_KEY, { userId: found.id, signedInAt: new Date().toISOString() });
        return {
            ok: true,
            localMode: true,
            user: { id: found.id, email: found.email, user_metadata: { display_name: found.displayName, avatar: found.avatar || "🚀" } }
        };
    },

    async resendVerification(email) {
        if (!this.isCloudMode()) return { ok: false, error: "Chỉ khả dụng khi đã kết nối Supabase Cloud." };
        try {
            const res = await fetch(`${this.config.supabaseUrl}/auth/v1/resend`, {
                method: "POST",
                headers: this.getHeaders(false),
                body: JSON.stringify({ type: "signup", email: String(email || "").trim().toLowerCase() })
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                return { ok: false, error: d.msg || "Không gửi lại được email xác minh." };
            }
            return { ok: true };
        } catch {
            return { ok: false, error: "Lỗi mạng khi gửi email xác minh." };
        }
    },

    async sendPasswordReset(email) {
        const cleanEmail = String(email || "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return { ok: false, error: "Vui lòng nhập Email hợp lệ." };
        }
        if (!this.isCloudMode()) {
            return {
                ok: false,
                error: "Tính năng gửi email đặt lại mật khẩu yêu cầu kết nối Supabase Cloud. Ở chế độ Offline, dữ liệu tài khoản được lưu trực tiếp trong trình duyệt này."
            };
        }
        try {
            const redirectTo = window.location.origin + window.location.pathname;
            const res = await fetch(`${this.config.supabaseUrl}/auth/v1/recover`, {
                method: "POST",
                headers: this.getHeaders(false),
                body: JSON.stringify({ email: cleanEmail, redirect_to: redirectTo })
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                return { ok: false, error: this.translateAuthError(d.msg || "Không thể gửi yêu cầu đặt lại mật khẩu.") };
            }
            return { ok: true, message: `Đã gửi liên kết đặt lại mật khẩu tới ${cleanEmail}. Hãy kiểm tra hộp thư (kể cả mục Spam).` };
        } catch {
            return { ok: false, error: "Lỗi mạng khi gửi yêu cầu khôi phục mật khẩu." };
        }
    },

    async updatePasswordWithRecovery(newPassword) {
        if (String(newPassword || "").length < 6) {
            return { ok: false, error: "Mật khẩu mới phải có ít nhất 6 ký tự." };
        }
        const token = this._recoveryAccessToken || this.session?.access_token;
        if (!this.isCloudMode() || !token) {
            return { ok: false, error: "Liên kết khôi phục đã hết hạn hoặc thiếu token hợp lệ." };
        }
        try {
            const res = await fetch(`${this.config.supabaseUrl}/auth/v1/user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": this.config.supabaseAnonKey,
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword })
            });
            const d = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { ok: false, error: this.translateAuthError(d.msg || "Đặt lại mật khẩu thất bại.") };
            }
            this._recoveryAccessToken = null;
            return { ok: true };
        } catch {
            return { ok: false, error: "Lỗi kết nối khi cập nhật mật khẩu." };
        }
    },

    async signOut() {
        clearTimeout(this._syncTimer);
        if (this.isCloudMode() && this.session?.access_token) {
            try {
                await fetch(`${this.config.supabaseUrl}/auth/v1/logout`, {
                    method: "POST",
                    headers: this.getHeaders(true)
                });
            } catch {}
            this.saveSessionToStorage(null);
        }
        localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
        window.__QENGLISH_ACTIVE_UID = null;
        window.__QENGLISH_AUTH_USER = null;
        this.syncStatus = { state: "idle", message: "Đã đăng xuất", lastSyncedAt: null, revision: 0 };
    },

    translateAuthError(raw) {
        const msg = String(raw || "");
        if (/invalid login credentials/i.test(msg)) return "Email hoặc mật khẩu chưa chính xác.";
        if (/email not confirmed/i.test(msg)) return "Email chưa được xác minh. Vui lòng kiểm tra hộp thư và nhấn link xác nhận.";
        if (/already registered|user already/i.test(msg)) return "Email này đã được đăng ký tài khoản.";
        if (/rate limit/i.test(msg)) return "Bạn thao tác quá nhanh, vui lòng đợi vài giây rồi thử lại.";
        if (/password/i.test(msg) && /weak|short|6/i.test(msg)) return "Mật khẩu chưa đủ mạnh (tối thiểu 6 ký tự).";
        return msg || "Có lỗi xác thực xảy ra.";
    },

    async upsertProfile(user, displayNameOverride = "") {
        if (!this.isCloudMode() || !user?.id || !this.session?.access_token) return;
        try {
            const body = {
                user_id: user.id,
                display_name: displayNameOverride || user.user_metadata?.display_name || user.email?.split("@")[0] || "Học viên",
                email: user.email || "",
                avatar: user.user_metadata?.avatar || "🚀",
                terms_accepted_at: user.user_metadata?.terms_accepted_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            await fetch(`${this.config.supabaseUrl}/rest/v1/user_profiles?on_conflict=user_id`, {
                method: "POST",
                headers: {
                    ...this.getHeaders(true),
                    "Prefer": "resolution=merge-duplicates,return=minimal"
                },
                body: JSON.stringify(body)
            });
        } catch (err) {
            console.warn("[QEnglish Cloud] upsertProfile skipped:", err);
        }
    },

    async fetchCloudWorkspace(userId) {
        if (!this.isCloudMode() || !userId || !this.session?.access_token) {
            return { ok: false, offline: true };
        }
        try {
            const url = `${this.config.supabaseUrl}/rest/v1/user_study_snapshots?user_id=eq.${encodeURIComponent(userId)}&select=*`;
            const res = await fetch(url, { method: "GET", headers: this.getHeaders(true) });
            if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
            const rows = await res.json();
            if (Array.isArray(rows) && rows.length > 0) {
                this.syncStatus = {
                    state: "synced",
                    message: "Đã đồng bộ Cloud",
                    lastSyncedAt: rows[0].updated_at || new Date().toISOString(),
                    revision: Number(rows[0].revision) || 1
                };
                return { ok: true, snapshot: rows[0] };
            }
            // Fallback: check legacy qenglish_user_snapshots table for seamless migration
            const legUrl = `${this.config.supabaseUrl}/rest/v1/qenglish_user_snapshots?user_id=eq.${encodeURIComponent(userId)}&select=*`;
            const legRes = await fetch(legUrl, { method: "GET", headers: this.getHeaders(true) });
            if (legRes.ok) {
                const legRows = await legRes.json();
                if (Array.isArray(legRows) && legRows.length > 0) {
                    return { ok: true, snapshot: legRows[0], isLegacyTable: true };
                }
            }
            this.syncStatus = { state: "synced", message: "Tài khoản Cloud mới", lastSyncedAt: null, revision: 0 };
            return { ok: true, snapshot: null };
        } catch (err) {
            this.syncStatus = { state: "error", message: "Mất kết nối đồng bộ Cloud", lastSyncedAt: this.syncStatus.lastSyncedAt, revision: this.syncStatus.revision };
            return { ok: false, error: err.message };
        }
    },

    mergeSnapshotData(localSnap, remoteSnap) {
        const mergeByKey = (arrA, arrB, keyFn) => {
            const map = new Map();
            (Array.isArray(arrB) ? arrB : []).forEach(it => { if (it) map.set(keyFn(it), it); });
            (Array.isArray(arrA) ? arrA : []).forEach(it => {
                if (!it) return;
                const k = keyFn(it);
                const prev = map.get(k);
                if (!prev) {
                    map.set(k, it);
                } else {
                    const tA = new Date(it.updatedAt || it.at || it.createdAt || 0).getTime();
                    const tB = new Date(prev.updatedAt || prev.at || prev.createdAt || 0).getTime();
                    map.set(k, tA >= tB ? it : prev);
                }
            });
            return Array.from(map.values());
        };

        const mergedDeck = mergeByKey(localSnap.deck_v2, remoteSnap.deck_v2, w => String(w.term || w.id).toLowerCase());
        const mergedNotebook = mergeByKey(localSnap.notebook, remoteSnap.notebook, n => String(n.id || n.title));
        const mergedCms = mergeByKey(localSnap.cms_items, remoteSnap.cms_items, c => String(c.id || c.title));

        const mergedSRS = { ...(remoteSnap.srs_state || {}) };
        Object.entries(localSnap.srs_state || {}).forEach(([k, v]) => {
            const r = mergedSRS[k];
            if (!r || (v.lastReviewedAt || 0) >= (r.lastReviewedAt || 0)) mergedSRS[k] = v;
        });

        const localW = localSnap.writing_state || { drafts: {}, submissions: [] };
        const remoteW = remoteSnap.writing_state || { drafts: {}, submissions: [] };
        const mergedWriting = {
            drafts: { ...(remoteW.drafts || {}), ...(localW.drafts || {}) },
            submissions: mergeByKey(localW.submissions, remoteW.submissions, s => String(s.id || s.at))
                .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
                .slice(0, 60)
        };

        const localP = localSnap.progress_state || { days: {}, activities: [], skillHistory: {} };
        const remoteP = remoteSnap.progress_state || { days: {}, activities: [], skillHistory: {} };
        const mergedDays = { ...(remoteP.days || {}) };
        Object.entries(localP.days || {}).forEach(([dayKey, lv]) => {
            const rv = mergedDays[dayKey];
            if (!rv) mergedDays[dayKey] = lv;
            else {
                mergedDays[dayKey] = {
                    ...rv,
                    ...lv,
                    minutes: Math.max(rv.minutes || 0, lv.minutes || 0),
                    newWords: Math.max(rv.newWords || 0, lv.newWords || 0),
                    reviewedWords: Math.max(rv.reviewedWords || 0, lv.reviewedWords || 0),
                    listeningDone: Math.max(rv.listeningDone || 0, lv.listeningDone || 0),
                    readingDone: Math.max(rv.readingDone || 0, lv.readingDone || 0),
                    writingDone: Math.max(rv.writingDone || 0, lv.writingDone || 0),
                    speakingSessions: Math.max(rv.speakingSessions || 0, lv.speakingSessions || 0),
                    grammarDone: Math.max(rv.grammarDone || 0, lv.grammarDone || 0),
                    scores: mergeByKey(lv.scores, rv.scores, s => `${s.skill}-${s.at}`),
                    mistakes: mergeByKey(lv.mistakes, rv.mistakes, m => `${m.category}-${m.at}`)
                };
            }
        });

        return {
            settings: { ...(remoteSnap.settings || {}), ...(localSnap.settings || {}) },
            deck_v2: mergedDeck,
            srs_state: mergedSRS,
            progress_state: {
                days: mergedDays,
                activities: mergeByKey(localP.activities, remoteP.activities, a => String(a.id || a.at))
                    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
                    .slice(0, 120),
                skillHistory: { ...(remoteP.skillHistory || {}), ...(localP.skillHistory || {}) }
            },
            dashboard_state: { ...(remoteSnap.dashboard_state || {}), ...(localSnap.dashboard_state || {}) },
            grammar_state: localSnap.grammar_state || remoteSnap.grammar_state || {},
            listening_state: localSnap.listening_state || remoteSnap.listening_state || {},
            speaking_state: localSnap.speaking_state || remoteSnap.speaking_state || {},
            reading_state: localSnap.reading_state || remoteSnap.reading_state || {},
            writing_state: mergedWriting,
            notebook: mergedNotebook,
            cms_items: mergedCms
        };
    },

    scheduleCloudSync() {
        if (!this.isCloudMode() || !window.__QENGLISH_ACTIVE_UID || !this.session?.access_token) return;
        clearTimeout(this._syncTimer);
        this.syncStatus.state = "syncing";
        updateCloudSyncBadgeUI();
        this._syncTimer = setTimeout(() => {
            this.syncNow().catch(() => {});
        }, 1200);
    },

    async syncNow(localSnapshotBuilder = null) {
        if (!this.isCloudMode() || !window.__QENGLISH_ACTIVE_UID || !this.session?.access_token) {
            return { ok: false, offline: true };
        }
        if (this._syncInFlight) {
            this._pendingSyncAfterFlight = true;
            return { ok: true, queued: true };
        }
        this._syncInFlight = true;
        this.syncStatus.state = "syncing";
        updateCloudSyncBadgeUI();

        try {
            const uid = window.__QENGLISH_ACTIVE_UID;
            const buildFn = localSnapshotBuilder || (typeof collectCurrentWorkspaceSnapshot === "function" ? collectCurrentWorkspaceSnapshot : null);
            if (!buildFn) return { ok: false };
            let localSnap = buildFn();

            // Check remote revision first to prevent silent multi-device overwrite
            const checkRes = await fetch(`${this.config.supabaseUrl}/rest/v1/user_study_snapshots?user_id=eq.${encodeURIComponent(uid)}&select=*`, {
                method: "GET",
                headers: this.getHeaders(true)
            });
            let nextRevision = (this.syncStatus.revision || 0) + 1;
            if (checkRes.ok) {
                const rows = await checkRes.json();
                if (Array.isArray(rows) && rows.length > 0) {
                    const remoteRow = rows[0];
                    const remoteRev = Number(remoteRow.revision) || 1;
                    if (remoteRev > (this.syncStatus.revision || 0) && remoteRow.device_id !== getOrCreateDeviceId()) {
                        localSnap = this.mergeSnapshotData(localSnap, remoteRow);
                        if (typeof applyWorkspaceSnapshotToLocal === "function") {
                            applyWorkspaceSnapshotToLocal(localSnap);
                        }
                    }
                    nextRevision = remoteRev + 1;
                }
            }

            const payload = {
                user_id: uid,
                revision: nextRevision,
                device_id: getOrCreateDeviceId(),
                ...localSnap,
                updated_at: new Date().toISOString()
            };

            const res = await fetch(`${this.config.supabaseUrl}/rest/v1/user_study_snapshots?on_conflict=user_id`, {
                method: "POST",
                headers: {
                    ...this.getHeaders(true),
                    "Prefer": "resolution=merge-duplicates,return=representation"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            this.syncStatus = {
                state: "synced",
                message: "Đã đồng bộ Cloud",
                lastSyncedAt: payload.updated_at,
                revision: nextRevision
            };
            updateCloudSyncBadgeUI();
            return { ok: true, revision: nextRevision };
        } catch (err) {
            this.syncStatus = {
                state: "error",
                message: "Lỗi đồng bộ: " + (err.message || "Mạng"),
                lastSyncedAt: this.syncStatus.lastSyncedAt,
                revision: this.syncStatus.revision
            };
            updateCloudSyncBadgeUI();
            return { ok: false, error: err.message };
        } finally {
            this._syncInFlight = false;
            if (this._pendingSyncAfterFlight) {
                this._pendingSyncAfterFlight = false;
                setTimeout(() => this.syncNow(), 600);
            }
        }
    },

    async syncWritingSubmissionRecord(sub) {
        if (!this.isCloudMode() || !window.__QENGLISH_ACTIVE_UID || !this.session?.access_token || !sub) return;
        try {
            const record = {
                id: String(sub.id),
                user_id: window.__QENGLISH_ACTIVE_UID,
                topic_id: String(sub.topicId || ""),
                title: String(sub.title || "Writing"),
                grading_mode: String(sub.gradingMode || "internal_10"),
                target_level: String(sub.level || "B1"),
                prompt: String(sub.prompt || "").slice(0, 4000),
                essay_text: String(sub.originalText || ""),
                word_count: Number(sub.wordCount) || 0,
                total_score_10: typeof sub.totalScore10 === "number" ? sub.totalScore10 : null,
                score_pct: typeof sub.scorePct === "number" ? sub.scorePct : null,
                criteria_scores: sub.criteria || {},
                ai_report: sub.aiReport || {},
                eval_mode: String(sub.evalMode || "local"),
                created_at: sub.at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            await fetch(`${this.config.supabaseUrl}/rest/v1/user_writing_submissions?on_conflict=user_id,id`, {
                method: "POST",
                headers: { ...this.getHeaders(true), "Prefer": "resolution=merge-duplicates,return=minimal" },
                body: JSON.stringify(record)
            });
        } catch (err) {
            console.warn("[QEnglish Cloud] syncWritingSubmissionRecord skipped:", err);
        }
    },

    async uploadMaterialFile(file, materialId) {
        if (!this.isCloudMode() || !window.__QENGLISH_ACTIVE_UID || !this.session?.access_token || !file) {
            return { ok: false, offline: true };
        }
        if (file.size > 10 * 1024 * 1024) {
            return { ok: false, error: "File vượt quá giới hạn 10MB trên Cloud Storage." };
        }
        const safeName = String(file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
        const objectPath = `${window.__QENGLISH_ACTIVE_UID}/${materialId}/${safeName}`;
        try {
            const url = `${this.config.supabaseUrl}/storage/v1/object/${this.config.storageBucket}/${objectPath}`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "apikey": this.config.supabaseAnonKey,
                    "Authorization": `Bearer ${this.session.access_token}`,
                    "Content-Type": file.type || "application/octet-stream",
                    "x-upsert": "true"
                },
                body: file
            });
            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                return { ok: false, error: errJson.message || `Upload HTTP ${res.status}` };
            }
            return { ok: true, storagePath: objectPath };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    },

    async getSignedStorageUrl(storagePath) {
        if (!this.isCloudMode() || !this.session?.access_token || !storagePath) return "";
        try {
            const res = await fetch(`${this.config.supabaseUrl}/storage/v1/object/sign/${this.config.storageBucket}/${storagePath}`, {
                method: "POST",
                headers: this.getHeaders(true),
                body: JSON.stringify({ expiresIn: 3600 })
            });
            if (!res.ok) return "";
            const d = await res.json();
            if (d?.signedURL) {
                return d.signedURL.startsWith("http")
                    ? d.signedURL
                    : `${this.config.supabaseUrl}/storage/v1${d.signedURL}`;
            }
            return "";
        } catch {
            return "";
        }
    }
};

function updateCloudSyncBadgeUI() {
    const el = document.getElementById("cloud-sync-badge");
    if (!el) return;
    const isCloud = CloudClient.isCloudMode();
    if (!isCloud) {
        el.className = "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/25 cursor-pointer";
        el.innerHTML = `<span>💾</span><span>Lưu Cục Bộ</span>`;
        el.title = "Đang lưu trên trình duyệt này (chưa cấu hình Supabase Cloud)";
        return;
    }
    const st = CloudClient.syncStatus.state;
    const map = {
        synced: ["bg-emerald-500/10 text-emerald-300 border-emerald-500/30", "☁️", "Đã đồng bộ Cloud"],
        syncing: ["bg-cyan-500/10 text-cyan-300 border-cyan-500/30 animate-pulse", "⏳", "Đang đồng bộ..."],
        error: ["bg-rose-500/15 text-rose-300 border-rose-500/30", "⚠️", "Lỗi đồng bộ"],
        idle: ["bg-slate-900 text-slate-300 border-white/10", "☁️", "Cloud Sẵn sàng"]
    };
    const [cls, icon, label] = map[st] || map.idle;
    el.className = `hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border cursor-pointer ${cls}`;
    el.innerHTML = `<span>${icon}</span><span>${label}</span>`;
    el.title = CloudClient.syncStatus.lastSyncedAt
        ? `Đồng bộ gần nhất: ${new Date(CloudClient.syncStatus.lastSyncedAt).toLocaleTimeString("vi-VN")} (Bấm để đồng bộ ngay)`
        : "Bấm để đồng bộ ngay lên Cloud";
}

async function handleManualCloudSync() {
    if (!CloudClient.isCloudMode()) {
        showToast("Chế độ hiện tại lưu cục bộ trên trình duyệt. Để đồng bộ đa thiết bị, hãy cấu hình SUPABASE_URL và SUPABASE_ANON_KEY trên Server/Vercel.", "warning");
        return;
    }
    const res = await CloudClient.syncNow();
    if (res.ok) showToast("☁️ Đã đồng bộ toàn bộ dữ liệu học tập lên Cloud thành công!");
    else showToast("Không thể đồng bộ Cloud: " + (res.error || "Vui lòng thử lại."), "error");
}
