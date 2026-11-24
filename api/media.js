/* ==========================================================================
   QEnglish — Unified Multi-Cloud Media Storage Backend (/api/media)
   Supports up to 36 GB FREE Cloud Storage seamlessly:
     1. Backblaze B2 (10 GB Free — S3-compatible AWS SigV4, no credit card)
     2. Cloudflare R2 (10 GB Free — S3-compatible AWS SigV4, zero egress)
     3. Google Drive (15 GB Free — OAuth2 Server Refresh Token / Resumable)
     4. Supabase Storage (1 GB Free — handled natively by CloudClient)
   SECURITY:
     - ZERO external npm dependencies (uses Node built-in `crypto` + `fetch`).
     - Every write/presign request MUST pass a valid Supabase Bearer JWT.
     - Strict per-user path isolation (`<user_id>/...`), blocks `..` traversal.
     - Short-lived HMAC-signed stream URLs for Google Drive (never puts JWT in URL).
   ========================================================================== */

"use strict";

const crypto = require("crypto");

const MAX_CLOUD_MEDIA_BYTES = 100 * 1024 * 1024; // 100 MB per file on B2 / R2 / Google Drive

/* ==================== PROVIDER CONFIG DETECTION ==================== */
function getB2Config() {
    const endpoint = (process.env.B2_ENDPOINT || "").trim().replace(/\/+$/, "");
    const bucket = (process.env.B2_BUCKET || "").trim();
    const keyId = (process.env.B2_KEY_ID || "").trim();
    const appKey = (process.env.B2_APP_KEY || "").trim();
    let region = (process.env.B2_REGION || "").trim();
    if (!region && endpoint) {
        const m = endpoint.match(/s3\.([a-z0-9-]+)\.backblazeb2\.com/i);
        if (m) region = m[1];
    }
    return {
        configured: Boolean(endpoint && bucket && keyId && appKey),
        endpoint,
        bucket,
        keyId,
        appKey,
        region: region || "us-west-004"
    };
}

function getR2Config() {
    let endpoint = (process.env.R2_ENDPOINT || "").trim().replace(/\/+$/, "");
    const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
    if (!endpoint && accountId) {
        endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    }
    const bucket = (process.env.R2_BUCKET || "").trim();
    const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
    const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
    return {
        configured: Boolean(endpoint && bucket && accessKeyId && secretAccessKey),
        endpoint,
        bucket,
        accessKeyId,
        secretAccessKey,
        region: "auto"
    };
}

function getGDriveConfig() {
    const clientId = (process.env.GDRIVE_CLIENT_ID || "").trim();
    const clientSecret = (process.env.GDRIVE_CLIENT_SECRET || "").trim();
    const refreshToken = (process.env.GDRIVE_REFRESH_TOKEN || "").trim();
    const folderId = (process.env.GDRIVE_FOLDER_ID || "").trim();
    return {
        serverConfigured: Boolean(clientId && clientSecret && refreshToken),
        clientOAuthReady: Boolean(clientId),
        clientId,
        clientSecret,
        refreshToken,
        folderId
    };
}

function getProvidersPublicSummary() {
    const supabaseConfigured = Boolean((process.env.SUPABASE_URL || "").trim() && (process.env.SUPABASE_ANON_KEY || "").trim());
    const b2 = getB2Config();
    const r2 = getR2Config();
    const gdrive = getGDriveConfig();
    return {
        supabase: {
            id: "supabase",
            label: "Supabase Storage",
            configured: supabaseConfigured,
            quotaGB: 1,
            maxFileMB: 10
        },
        b2: {
            id: "b2",
            label: "Backblaze B2",
            configured: b2.configured,
            quotaGB: 10,
            maxFileMB: 100
        },
        r2: {
            id: "r2",
            label: "Cloudflare R2",
            configured: r2.configured,
            quotaGB: 10,
            maxFileMB: 100
        },
        gdrive: {
            id: "gdrive",
            label: "Google Drive",
            configured: gdrive.serverConfigured,
            clientOAuthReady: gdrive.clientOAuthReady,
            quotaGB: 15,
            maxFileMB: 100
        }
    };
}

/* ==================== SUPABASE AUTH VERIFICATION ==================== */
async function verifySupabaseBearer(authHeader) {
    const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
    const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim();
    if (!supabaseUrl || !anonKey) {
        return { ok: false, status: 503, error: "Supabase Auth chưa được cấu hình trên máy chủ." };
    }
    const raw = String(authHeader || "");
    const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : "";
    if (!token) {
        return { ok: false, status: 401, error: "Thiếu phiên đăng nhập (Authorization Bearer token)." };
    }
    try {
        const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
            method: "GET",
            headers: {
                "apikey": anonKey,
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) {
            return { ok: false, status: 401, error: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ." };
        }
        const user = await res.json();
        if (!user || !user.id) {
            return { ok: false, status: 401, error: "Không xác định được danh tính người dùng." };
        }
        return { ok: true, user };
    } catch {
        return { ok: false, status: 502, error: "Không thể xác thực phiên người dùng với Supabase." };
    }
}

/* ==================== PURE NODE.JS AWS SIGNATURE V4 (B2 & R2) ==================== */
function hmacSha256(key, data) {
    return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data) {
    return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

function encodeRfc3986(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

function encodeS3Path(key) {
    return String(key || "")
        .split("/")
        .map(seg => encodeRfc3986(seg))
        .join("/");
}

function presignS3Url({ method = "GET", endpoint, region, bucket, objectKey, accessKeyId, secretAccessKey, expiresSeconds = 3600, contentType = "" }) {
    const parsedUrl = new URL(endpoint);
    const host = parsedUrl.host;
    const basePath = parsedUrl.pathname.replace(/\/+$/, "");
    const canonicalUri = `${basePath}/${encodeRfc3986(bucket)}/${encodeS3Path(objectKey)}`.replace(/\/{2,}/g, "/");

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;

    const signedHeaders = contentType && method === "PUT" ? "content-type;host" : "host";
    const canonicalHeaders = contentType && method === "PUT"
        ? `content-type:${contentType}\nhost:${host}\n`
        : `host:${host}\n`;

    const queryParams = {
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
        "X-Amz-Date": amzDate,
        "X-Amz-Expires": String(Math.max(60, Math.min(86400, Number(expiresSeconds) || 3600))),
        "X-Amz-SignedHeaders": signedHeaders
    };
    const canonicalQuery = Object.keys(queryParams)
        .sort()
        .map(k => `${encodeRfc3986(k)}=${encodeRfc3986(queryParams[k])}`)
        .join("&");

    const canonicalRequest = [
        method.toUpperCase(),
        canonicalUri,
        canonicalQuery,
        canonicalHeaders,
        signedHeaders,
        "UNSIGNED-PAYLOAD"
    ].join("\n");

    const stringToSign = [
        "AWS4-HMAC-SHA256",
        amzDate,
        credentialScope,
        sha256Hex(canonicalRequest)
    ].join("\n");

    const kDate = hmacSha256("AWS4" + secretAccessKey, dateStamp);
    const kRegion = hmacSha256(kDate, region);
    const kService = hmacSha256(kRegion, "s3");
    const kSigning = hmacSha256(kService, "aws4_request");
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

    return `${parsedUrl.protocol}//${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

function sanitizeSegment(raw, fallback = "item") {
    const clean = String(raw || "").replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.{2,}/g, "_").replace(/^_+|_+$/g, "");
    return clean.slice(0, 120) || fallback;
}

function validateUserOwnedKey(objectKey, userId) {
    const clean = String(objectKey || "").replace(/^\/+/, "");
    if (!clean || clean.includes("..") || clean.includes("\\") || clean.includes("\0")) return false;
    return clean.startsWith(`${userId}/`);
}

/* ==================== GOOGLE DRIVE OAUTH2 SERVER ENGINE ==================== */
let _gdriveTokenCache = { accessToken: "", expiresAt: 0 };

async function getGDriveAccessToken() {
    const cfg = getGDriveConfig();
    if (!cfg.serverConfigured) {
        throw new Error("Google Drive Server OAuth chưa được cấu hình (cần GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN).");
    }
    if (_gdriveTokenCache.accessToken && _gdriveTokenCache.expiresAt > Date.now() + 60000) {
        return _gdriveTokenCache.accessToken;
    }
    const body = new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: cfg.refreshToken,
        grant_type: "refresh_token"
    });
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
        throw new Error(data.error_description || data.error || "Không thể làm mới token Google Drive.");
    }
    _gdriveTokenCache = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (Number(data.expires_in) || 3500) * 1000
    };
    return _gdriveTokenCache.accessToken;
}

async function ensureGDriveUserFolder(accessToken, userId) {
    const cfg = getGDriveConfig();
    const parentId = cfg.folderId || "root";
    const folderName = `qenglish_${sanitizeSegment(userId, "user")}`;
    const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`;
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=1`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
    });
    if (searchRes.ok) {
        const d = await searchRes.json().catch(() => ({}));
        if (Array.isArray(d.files) && d.files[0]?.id) return d.files[0].id;
    }
    const createRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentId]
        })
    });
    const created = await createRes.json().catch(() => ({}));
    if (!createRes.ok || !created.id) {
        throw new Error("Không thể tạo thư mục QEnglish trên Google Drive.");
    }
    return created.id;
}

function getStreamSigningSecret() {
    return (
        process.env.MEDIA_SIGNING_SECRET ||
        process.env.GDRIVE_CLIENT_SECRET ||
        process.env.B2_APP_KEY ||
        process.env.R2_SECRET_ACCESS_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        "qenglish-fallback-hmac"
    );
}

function signGDriveStreamParams(fileId, uid, exp) {
    const secret = getStreamSigningSecret();
    return crypto.createHmac("sha256", secret).update(`${fileId}|${uid}|${exp}`).digest("hex").slice(0, 32);
}

/* ==================== BODY PARSER & ROUTER ==================== */
async function readJsonBody(req) {
    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === "string") {
        try { return JSON.parse(req.body); } catch { return {}; }
    }
    const chunks = [];
    for await (const ch of req) chunks.push(ch);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
}

function resolveAction(req) {
    if (req.query && req.query.action) return String(req.query.action).trim().toLowerCase();
    const urlPath = String(req.url || "").split("?")[0];
    const parts = urlPath.split("/").filter(Boolean);
    const idx = parts.indexOf("media");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1].toLowerCase();
    return "status";
}

function pickAutoProvider() {
    if (getR2Config().configured) return "r2";
    if (getB2Config().configured) return "b2";
    if (getGDriveConfig().serverConfigured) return "gdrive";
    return "supabase";
}

module.exports = async function handler(req, res) {
    const origin = process.env.ALLOWED_ORIGIN || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Range");
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    const action = resolveAction(req);

    // 1. Public provider status (non-secret flags only)
    if (action === "status" && req.method === "GET") {
        res.setHeader("Cache-Control", "no-store");
        const providers = getProvidersPublicSummary();
        const totalConfiguredGB = Object.values(providers).reduce((s, p) => s + (p.configured ? p.quotaGB : 0), 0);
        return res.status(200).json({
            ok: true,
            providers,
            activeAutoProvider: pickAutoProvider(),
            totalConfiguredGB,
            maxPotentialFreeGB: 36,
            checkedAt: new Date().toISOString()
        });
    }

    // 2. Signed Google Drive Media Stream Proxy (supports HTTP Range for MP3 scrubbing!)
    if (action === "gdrive-stream" && req.method === "GET") {
        const urlObj = new URL(req.url || "/", "http://localhost");
        const fileId = (req.query?.fileId || urlObj.searchParams.get("fileId") || "").trim();
        const uid = (req.query?.uid || urlObj.searchParams.get("uid") || "").trim();
        const exp = Number(req.query?.exp || urlObj.searchParams.get("exp") || 0);
        const sig = (req.query?.sig || urlObj.searchParams.get("sig") || "").trim();

        if (!fileId || !/^[a-zA-Z0-9_-]{8,128}$/.test(fileId) || !uid || !exp || !sig) {
            return res.status(400).json({ ok: false, error: "Thiếu tham số luồng Google Drive hợp lệ." });
        }
        if (Date.now() > exp) {
            return res.status(403).json({ ok: false, error: "Liên kết phát media đã hết hạn." });
        }
        const expected = signGDriveStreamParams(fileId, uid, exp);
        if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
            return res.status(403).json({ ok: false, error: "Chữ ký xác thực media không hợp lệ." });
        }

        try {
            const token = await getGDriveAccessToken();
            const headers = { "Authorization": `Bearer ${token}` };
            if (req.headers.range) headers["Range"] = req.headers.range;

            const upstream = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, {
                method: "GET",
                headers
            });
            if (!upstream.ok && upstream.status !== 206) {
                return res.status(upstream.status).json({ ok: false, error: `Google Drive HTTP ${upstream.status}` });
            }
            res.status(upstream.status);
            res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
            const cr = upstream.headers.get("content-range");
            const cl = upstream.headers.get("content-length");
            if (cr) res.setHeader("Content-Range", cr);
            if (cl) res.setHeader("Content-Length", cl);
            res.setHeader("Accept-Ranges", "bytes");
            res.setHeader("Cache-Control", "private, max-age=300");

            const arrBuf = await upstream.arrayBuffer();
            return res.send(Buffer.from(arrBuf));
        } catch (err) {
            return res.status(502).json({ ok: false, error: err.message || "Lỗi truyền tải từ Google Drive." });
        }
    }

    // All remaining endpoints require strict Supabase Bearer JWT authentication!
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }
    const auth = await verifySupabaseBearer(req.headers.authorization);
    if (!auth.ok) {
        return res.status(auth.status).json({ ok: false, error: auth.error });
    }
    const userId = auth.user.id;
    const body = await readJsonBody(req);

    // 3. PRESIGN UPLOAD (Backblaze B2 / Cloudflare R2 / Google Drive Resumable Session)
    if (action === "presign-upload") {
        let provider = String(body.provider || "auto").toLowerCase();
        if (provider === "auto") provider = pickAutoProvider();

        const fileName = sanitizeSegment(body.fileName || "file.bin", "file.bin");
        const folder = sanitizeSegment(body.folder || "materials", "materials");
        const contentType = String(body.contentType || "application/octet-stream").slice(0, 120);
        const fileSize = Number(body.fileSize) || 0;

        if (fileSize > MAX_CLOUD_MEDIA_BYTES) {
            return res.status(413).json({ ok: false, error: "File vượt quá giới hạn 100 MB cho mỗi tệp Cloud." });
        }

        const objectKey = `${userId}/${folder}/${Date.now()}_${fileName}`;

        if (provider === "b2") {
            const b2 = getB2Config();
            if (!b2.configured) return res.status(503).json({ ok: false, error: "Backblaze B2 chưa được cấu hình trên máy chủ." });
            const uploadUrl = presignS3Url({
                method: "PUT",
                endpoint: b2.endpoint,
                region: b2.region,
                bucket: b2.bucket,
                objectKey,
                accessKeyId: b2.keyId,
                secretAccessKey: b2.appKey,
                expiresSeconds: 1800,
                contentType
            });
            return res.status(200).json({
                ok: true,
                provider: "b2",
                storagePath: `b2::${objectKey}`,
                uploadUrl,
                method: "PUT",
                headers: { "Content-Type": contentType }
            });
        }

        if (provider === "r2") {
            const r2 = getR2Config();
            if (!r2.configured) return res.status(503).json({ ok: false, error: "Cloudflare R2 chưa được cấu hình trên máy chủ." });
            const uploadUrl = presignS3Url({
                method: "PUT",
                endpoint: r2.endpoint,
                region: r2.region,
                bucket: r2.bucket,
                objectKey,
                accessKeyId: r2.accessKeyId,
                secretAccessKey: r2.secretAccessKey,
                expiresSeconds: 1800,
                contentType
            });
            return res.status(200).json({
                ok: true,
                provider: "r2",
                storagePath: `r2::${objectKey}`,
                uploadUrl,
                method: "PUT",
                headers: { "Content-Type": contentType }
            });
        }

        if (provider === "gdrive") {
            try {
                const token = await getGDriveAccessToken();
                const folderId = await ensureGDriveUserFolder(token, userId);
                const initRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,size,mimeType", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json; charset=UTF-8",
                        "X-Upload-Content-Type": contentType,
                        ...(fileSize > 0 ? { "X-Upload-Content-Length": String(fileSize) } : {})
                    },
                    body: JSON.stringify({
                        name: `${folder}_${Date.now()}_${fileName}`,
                        parents: [folderId],
                        appProperties: { qenglishUid: userId, folder }
                    })
                });
                const uploadUrl = initRes.headers.get("location");
                if (!initRes.ok || !uploadUrl) {
                    const errTxt = await initRes.text().catch(() => "");
                    return res.status(502).json({ ok: false, error: `Google Drive không khởi tạo được phiên tải lên: ${errTxt.slice(0, 180)}` });
                }
                return res.status(200).json({
                    ok: true,
                    provider: "gdrive",
                    uploadUrl,
                    method: "PUT",
                    headers: { "Content-Type": contentType }
                });
            } catch (err) {
                return res.status(503).json({ ok: false, error: err.message });
            }
        }

        return res.status(400).json({ ok: false, error: `Nhà cung cấp lưu trữ "${provider}" chưa hỗ trợ presign hoặc chưa kích hoạt.` });
    }

    // 4. PRESIGN DOWNLOAD (Resolves `b2::...`, `r2::...`, `gdrive::...`)
    if (action === "presign-download") {
        const storagePath = String(body.storagePath || "").trim();
        if (!storagePath) return res.status(400).json({ ok: false, error: "Thiếu storagePath." });

        if (storagePath.startsWith("b2::")) {
            const b2 = getB2Config();
            if (!b2.configured) return res.status(503).json({ ok: false, error: "Backblaze B2 chưa được cấu hình." });
            const objectKey = storagePath.slice(4);
            if (!validateUserOwnedKey(objectKey, userId)) {
                return res.status(403).json({ ok: false, error: "Bạn không có quyền truy cập tệp này." });
            }
            const url = presignS3Url({
                method: "GET",
                endpoint: b2.endpoint,
                region: b2.region,
                bucket: b2.bucket,
                objectKey,
                accessKeyId: b2.keyId,
                secretAccessKey: b2.appKey,
                expiresSeconds: 3600
            });
            return res.status(200).json({ ok: true, provider: "b2", url, expiresIn: 3600 });
        }

        if (storagePath.startsWith("r2::")) {
            const r2 = getR2Config();
            if (!r2.configured) return res.status(503).json({ ok: false, error: "Cloudflare R2 chưa được cấu hình." });
            const objectKey = storagePath.slice(4);
            if (!validateUserOwnedKey(objectKey, userId)) {
                return res.status(403).json({ ok: false, error: "Bạn không có quyền truy cập tệp này." });
            }
            const url = presignS3Url({
                method: "GET",
                endpoint: r2.endpoint,
                region: r2.region,
                bucket: r2.bucket,
                objectKey,
                accessKeyId: r2.accessKeyId,
                secretAccessKey: r2.secretAccessKey,
                expiresSeconds: 3600
            });
            return res.status(200).json({ ok: true, provider: "r2", url, expiresIn: 3600 });
        }

        if (storagePath.startsWith("gdrive::")) {
            const gd = getGDriveConfig();
            if (!gd.serverConfigured) return res.status(503).json({ ok: false, error: "Google Drive Server OAuth chưa được cấu hình." });
            const fileId = storagePath.slice(8).trim();
            if (!/^[a-zA-Z0-9_-]{8,128}$/.test(fileId)) {
                return res.status(400).json({ ok: false, error: "Google Drive fileId không hợp lệ." });
            }
            // Verify file belongs to this user via appProperties before issuing signed URL
            try {
                const token = await getGDriveAccessToken();
                const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,appProperties,trashed`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!metaRes.ok) return res.status(404).json({ ok: false, error: "Không tìm thấy tệp trên Google Drive." });
                const meta = await metaRes.json().catch(() => ({}));
                if (meta.trashed || (meta.appProperties?.qenglishUid && meta.appProperties.qenglishUid !== userId)) {
                    return res.status(403).json({ ok: false, error: "Không có quyền truy cập tệp Google Drive này." });
                }
                const exp = Date.now() + 3600 * 1000;
                const sig = signGDriveStreamParams(fileId, userId, exp);
                const hostBase = req.headers.host ? `https://${req.headers.host}` : "";
                const url = `${hostBase}/api/media/gdrive-stream?fileId=${encodeURIComponent(fileId)}&uid=${encodeURIComponent(userId)}&exp=${exp}&sig=${sig}`;
                return res.status(200).json({ ok: true, provider: "gdrive", url, expiresIn: 3600 });
            } catch (err) {
                return res.status(502).json({ ok: false, error: err.message });
            }
        }

        return res.status(400).json({ ok: false, error: "Định dạng storagePath không hỗ trợ trong /api/media." });
    }

    // 5. DELETE OBJECT (Backblaze B2 / Cloudflare R2 / Google Drive)
    if (action === "delete") {
        const storagePath = String(body.storagePath || "").trim();
        if (storagePath.startsWith("b2::") || storagePath.startsWith("r2::")) {
            const isB2 = storagePath.startsWith("b2::");
            const cfg = isB2 ? getB2Config() : getR2Config();
            if (!cfg.configured) return res.status(503).json({ ok: false, error: "Nhà cung cấp chưa được cấu hình." });
            const objectKey = storagePath.slice(4);
            if (!validateUserOwnedKey(objectKey, userId)) {
                return res.status(403).json({ ok: false, error: "Không có quyền xóa tệp này." });
            }
            const delUrl = presignS3Url({
                method: "DELETE",
                endpoint: cfg.endpoint,
                region: cfg.region,
                bucket: cfg.bucket,
                objectKey,
                accessKeyId: isB2 ? cfg.keyId : cfg.accessKeyId,
                secretAccessKey: isB2 ? cfg.appKey : cfg.secretAccessKey,
                expiresSeconds: 300
            });
            const r = await fetch(delUrl, { method: "DELETE" });
            return res.status(200).json({ ok: r.ok || r.status === 204 || r.status === 404 });
        }
        if (storagePath.startsWith("gdrive::")) {
            const fileId = storagePath.slice(8).trim();
            if (!/^[a-zA-Z0-9_-]{8,128}$/.test(fileId)) return res.status(400).json({ ok: false, error: "fileId không hợp lệ." });
            const token = await getGDriveAccessToken();
            const r = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            return res.status(200).json({ ok: r.ok || r.status === 204 || r.status === 404 });
        }
        return res.status(400).json({ ok: false, error: "storagePath không hợp lệ." });
    }

    return res.status(404).json({ ok: false, error: `Unknown media action: ${action}` });
};

module.exports.getProvidersPublicSummary = getProvidersPublicSummary;
module.exports.presignS3Url = presignS3Url;
