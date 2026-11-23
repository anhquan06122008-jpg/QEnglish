/* ==========================================================================
   QEnglish — AI PDF TO LEARNING ENGINE ("AI PDF Learning Studio")
   Transforms any English PDF textbook/lesson (text or scanned) into a full
   interactive multi-skill course grounded in a Knowledge Map:
   PDF -> Chapters -> Topics -> Knowledge -> Skills -> Exercises
   + Source PDF Page Viewer ("Xem nguồn PDF")
   + Weakness Detector & Targeted Remedial Drills
   + Chapter / Full Course Comprehensive Exams
   + Visual Lesson Summary Mind-Map Diagram ("Sơ đồ tóm tắt bài học")
   + Full Cloud Sync across Laptop / PC / Phone / iPad via QEnglish CloudClient
   ========================================================================== */

const PDF_STUDIO_MAX_FILE_BYTES = 160 * 1024 * 1024; // 160MB local IndexedDB processing
const PDF_STUDIO_CLOUD_UPLOAD_MAX = 10 * 1024 * 1024; // 10MB Supabase private bucket limit
const PDF_STUDIO_DEFAULT_CHUNK_SIZE = 4; // 4 pages per AI chunk for deep accuracy

const PDF_PIPELINE_STAGES = [
    { id: "upload", label: "1. PDF Upload" },
    { id: "validate", label: "2. File Validation" },
    { id: "extract", label: "3. Text Extraction / OCR" },
    { id: "structure", label: "4. Document Structure" },
    { id: "classify", label: "5. Skill Classification" },
    { id: "knowledge", label: "6. Knowledge Map" },
    { id: "exercises", label: "7. Exercise Generation" },
    { id: "validate_ans", label: "8. Answer Validation" },
    { id: "assemble", label: "9. Course Assembly" },
    { id: "qa", label: "10. Quality Assurance" },
    { id: "publish", label: "11. Preview & Publish" }
];

let pdfStudioState = null;
let pdfStudioPipeline = {
    running: false,
    abortRequested: false,
    docId: null,
    stageIndex: -1,
    stageStatus: "idle", // idle | running | done | error
    statusLabel: "",
    detailText: "",
    progressPct: 0,
    errorMsg: ""
};
let pdfStudioUi = {
    viewMode: "library", // library | folder | course
    openFolderId: null,
    activeTab: "overview", // overview | vocabulary | grammar | reading | listening | writing | speaking | exam | mindmap | weakness
    filterChapter: "all",
    filterLevel: "all",
    filterStatus: "all", // all | todo | done
    filterPage: "",
    vocabMode: "flashcards", // flashcards | match | mcq | fill
    vocabCardIdx: 0,
    vocabFlipped: false,
    vocabMatchState: null,
    activeExam: null,
    activeRemedial: null,
    editCourseMode: false,
    drawerOpen: false,
    drawerDocId: null,
    drawerPage: 1,
    drawerZoom: 1.0,
    drawerShowText: false
};
const pdfCompanionAudioUrls = new Map(); // filename.toLowerCase() -> blob URL (session)
const pdfSignedAudioUrlCache = new Map(); // storagePath -> { url, expiresAt }
const pdfSignedPageUrlCache = new Map(); // storagePath -> { url, expiresAt }
const pdfLoadedJsDocs = new Map(); // docId -> PDFDocumentProxy

async function hydratePdfCloudAudioPlayers() {
    const els = document.querySelectorAll("audio[data-audio-storage-path]");
    if (!els.length || typeof CloudClient === "undefined") return;
    for (const el of els) {
        const storagePath = el.getAttribute("data-audio-storage-path") || "";
        if (!storagePath || el.getAttribute("src")) continue;
        const cached = pdfSignedAudioUrlCache.get(storagePath);
        let url = (cached && cached.expiresAt > Date.now()) ? cached.url : "";
        if (!url && CloudClient.isCloudMode()) {
            url = await CloudClient.getSignedStorageUrl(storagePath);
            if (url) {
                pdfSignedAudioUrlCache.set(storagePath, { url, expiresAt: Date.now() + 45 * 60 * 1000 });
            }
        }
        if (url) {
            el.setAttribute("src", url);
            const statusEl = el.parentElement?.querySelector(".pdf-audio-status");
            if (statusEl) statusEl.textContent = "✅ Sẵn sàng phát giọng bản xứ";
        }
    }
}

function setPdfAudioRate(audioId, rate) {
    const el = document.getElementById(audioId);
    if (el) {
        el.playbackRate = Number(rate) || 1.0;
        showToast(`🎧 Tốc độ phát: ${el.playbackRate}x`);
    }
}

function rewindPdfAudio(audioId, deltaSec = -5) {
    const el = document.getElementById(audioId);
    if (el) {
        el.currentTime = Math.max(0, (el.currentTime || 0) + deltaSec);
        el.play?.().catch(() => {});
    }
}

function speakPdfDialogueMultiVoice(btn) {
    const raw = btn?.getAttribute("data-speak") || "";
    if (!raw || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const voices = (window.speechSynthesis.getVoices() || []).filter(v => /^en/i.test(v.lang));
    const speakerMap = new Map();
    let idx = 0;

    const speakNext = () => {
        if (idx >= lines.length) return;
        const ln = lines[idx++];
        const m = ln.match(/^([A-Za-z0-9\s]{1,22}):\s*(.+)$/);
        const speaker = m ? m[1].trim().toLowerCase() : `line_${idx % 2}`;
        const content = m ? m[2].trim() : ln;
        if (!speakerMap.has(speaker)) speakerMap.set(speaker, speakerMap.size);
        const sIdx = speakerMap.get(speaker);
        const u = new SpeechSynthesisUtterance(content);
        u.lang = "en-US";
        u.rate = (typeof speechRate === "number" ? speechRate : 1.0);
        u.pitch = sIdx % 2 === 0 ? 1.12 : 0.86;
        if (voices.length > 1) u.voice = voices[sIdx % voices.length];
        u.onend = speakNext;
        window.speechSynthesis.speak(u);
    };
    speakNext();
}

/* ==================== 1. LOCAL INDEXEDDB VAULT FOR PDF & AUDIO BINARIES ==================== */
const PdfBinaryVault = {
    _dbPromise: null,
    open() {
        if (this._dbPromise) return this._dbPromise;
        this._dbPromise = new Promise((resolve, reject) => {
            if (typeof indexedDB === "undefined") return resolve(null);
            const req = indexedDB.open("QEnglishPdfVaultDB_v1", 1);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains("pdfs")) db.createObjectStore("pdfs");
                if (!db.objectStoreNames.contains("audios")) db.createObjectStore("audios");
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
        return this._dbPromise;
    },
    async put(storeName, key, blobOrBuffer) {
        const db = await this.open();
        if (!db) return false;
        return new Promise(resolve => {
            try {
                const tx = db.transaction(storeName, "readwrite");
                tx.objectStore(storeName).put(blobOrBuffer, key);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch {
                resolve(false);
            }
        });
    },
    async get(storeName, key) {
        const db = await this.open();
        if (!db) return null;
        return new Promise(resolve => {
            try {
                const tx = db.transaction(storeName, "readonly");
                const req = tx.objectStore(storeName).get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    },
    async del(storeName, key) {
        const db = await this.open();
        if (!db) return false;
        return new Promise(resolve => {
            try {
                const tx = db.transaction(storeName, "readwrite");
                tx.objectStore(storeName).delete(key);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch {
                resolve(false);
            }
        });
    }
};

/* ==================== 2. LAZY PDF.JS LOADER (SECURE, ZERO EVAL) ==================== */
let _pdfJsLoadingPromise = null;
async function ensurePdfJsLoaded() {
    if (window.pdfjsLib && typeof window.pdfjsLib.getDocument === "function") {
        if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
        }
        return window.pdfjsLib;
    }
    if (_pdfJsLoadingPromise) return _pdfJsLoadingPromise;
    _pdfJsLoadingPromise = new Promise((resolve, reject) => {
        const sources = [
            {
                lib: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
                worker: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js"
            },
            {
                lib: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js",
                worker: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js"
            }
        ];
        const tryLoad = (idx) => {
            if (idx >= sources.length) {
                _pdfJsLoadingPromise = null;
                return reject(new Error("Không thể tải thư viện đọc PDF (PDF.js). Vui lòng kiểm tra kết nối mạng."));
            }
            const sc = document.createElement("script");
            sc.src = sources[idx].lib;
            sc.async = true;
            sc.onload = () => {
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = sources[idx].worker;
                    resolve(window.pdfjsLib);
                } else {
                    tryLoad(idx + 1);
                }
            };
            sc.onerror = () => tryLoad(idx + 1);
            document.head.appendChild(sc);
        };
        tryLoad(0);
    });
    return _pdfJsLoadingPromise;
}

/* ==================== 3. STATE PERSISTENCE & CLOUD SYNC ==================== */
function getDefaultPdfStudioState() {
    return {
        folders: [],
        documents: [],
        courses: [],
        activeCourseId: null,
        lastPosition: null,
        updatedAt: new Date().toISOString()
    };
}

function loadPdfStudioState() {
    const saved = safeParseJSON(localStorage.getItem(STORAGE_KEYS.PDF_STUDIO), null);
    if (saved && typeof saved === "object") {
        pdfStudioState = {
            ...getDefaultPdfStudioState(),
            ...saved,
            folders: Array.isArray(saved.folders) ? saved.folders : [],
            documents: Array.isArray(saved.documents) ? saved.documents : [],
            courses: Array.isArray(saved.courses) ? saved.courses : []
        };
    } else {
        pdfStudioState = getDefaultPdfStudioState();
    }
    return pdfStudioState;
}

function savePdfStudioState() {
    if (!pdfStudioState) loadPdfStudioState();
    pdfStudioState.updatedAt = new Date().toISOString();
    safeWriteJSON(STORAGE_KEYS.PDF_STUDIO, pdfStudioState);
}

function resetPdfStudioMemory() {
    pdfStudioState = null;
    pdfStudioUi.activeExam = null;
    pdfStudioUi.activeRemedial = null;
    pdfStudioUi.vocabMatchState = null;
    pdfStudioUi.drawerOpen = false;
    pdfLoadedJsDocs.clear();
}

function getActivePdfCourse() {
    if (!pdfStudioState) loadPdfStudioState();
    if (!pdfStudioState.courses.length) return null;
    return pdfStudioState.courses.find(c => c.id === pdfStudioState.activeCourseId) || pdfStudioState.courses[0];
}

function getPdfDocumentById(docId) {
    if (!pdfStudioState) loadPdfStudioState();
    return pdfStudioState.documents.find(d => d.id === docId) || null;
}

/* ==================== 4. SECURITY HELPERS & FILE VALIDATION ==================== */
async function computeArrayBufferSha256(arrayBuffer) {
    try {
        if (window.crypto && window.crypto.subtle) {
            const hashBuf = await window.crypto.subtle.digest("SHA-256", arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, 25 * 1024 * 1024)));
            return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
        }
    } catch {}
    // Fallback deterministic fingerprint
    const view = new Uint8Array(arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, 4096)));
    let h = 2166136261;
    for (let i = 0; i < view.length; i++) h = Math.imul(h ^ view[i], 16777619);
    return `fp-${(h >>> 0).toString(16)}-${arrayBuffer.byteLength}`;
}

function hasValidPdfMagicHeader(arrayBuffer) {
    if (!arrayBuffer || arrayBuffer.byteLength < 8) return false;
    const head = new Uint8Array(arrayBuffer.slice(0, 1024));
    const str = String.fromCharCode(...head);
    return str.includes("%PDF-");
}

function sanitizePdfExtractedText(raw) {
    return String(raw || "")
        .replace(/\u0000/g, "")
        .replace(/<\/?script\b[^>]*>/gi, "")
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

function formatFileSizeBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/* ==================== 5. UPLOAD & COMPANION AUDIO HANDLERS ==================== */
function handlePdfStudioDrop(event) {
    event.preventDefault();
    event.currentTarget?.classList.remove("border-violet-400", "bg-violet-500/10");
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length) handlePdfStudioFilesSelected(files);
}

function handlePdfStudioDragOver(event) {
    event.preventDefault();
    event.currentTarget?.classList.add("border-violet-400", "bg-violet-500/10");
}

function handlePdfStudioDragLeave(event) {
    event.currentTarget?.classList.remove("border-violet-400", "bg-violet-500/10");
}

function handlePdfStudioFileInput(event) {
    const files = Array.from(event?.target?.files || []);
    if (files.length) handlePdfStudioFilesSelected(files);
    if (event?.target) event.target.value = "";
}

async function handlePdfCompanionAudioInput(event, docId = null) {
    const files = Array.from(event?.target?.files || []);
    if (!files.length) return;
    if (!pdfStudioState) loadPdfStudioState();

    let attached = 0;
    const names = [];
    for (const f of files) {
        if (!/\.(mp3|wav|m4a|ogg)$/i.test(f.name) && !(f.type || "").startsWith("audio/")) continue;
        const lower = f.name.toLowerCase();
        const blobUrl = URL.createObjectURL(f);
        pdfCompanionAudioUrls.set(lower, blobUrl);
        await PdfBinaryVault.put("audios", lower, f);
        names.push(f.name);
        attached++;
    }

    if (docId) {
        const doc = getPdfDocumentById(docId);
        if (doc) {
            const set = new Set([...(doc.companionAudioNames || []), ...names]);
            doc.companionAudioNames = Array.from(set);
            savePdfStudioState();
        }
    } else if (pdfStudioState.documents.length) {
        const latest = pdfStudioState.documents[0];
        const set = new Set([...(latest.companionAudioNames || []), ...names]);
        latest.companionAudioNames = Array.from(set);
        savePdfStudioState();
    }

    if (event?.target) event.target.value = "";
    if (attached > 0) {
        showToast(`🎧 Đã đính kèm ${attached} file âm thanh thật cho bài Listening!`);
        renderPdfStudioPage();
    } else {
        showToast("Không tìm thấy file âm thanh hợp lệ (.mp3, .wav, .m4a, .ogg).", "warning");
    }
}

async function handlePdfStudioFilesSelected(files) {
    if (!pdfStudioState) loadPdfStudioState();
    const audioFiles = files.filter(f => /\.(mp3|wav|m4a|ogg)$/i.test(f.name) || (f.type || "").startsWith("audio/"));
    const pdfFiles = files.filter(f => /\.pdf$/i.test(f.name) || f.type === "application/pdf");

    if (audioFiles.length && !pdfFiles.length) {
        await handlePdfCompanionAudioInput({ target: { files: audioFiles } });
        return;
    }
    if (!pdfFiles.length) {
        showToast("Vui lòng chọn file định dạng .PDF (hoặc kèm file âm thanh .MP3/.WAV).", "error");
        return;
    }

    setPipelineState(0, "running", "Đang tải lên", `Đang kiểm tra ${pdfFiles.length} file PDF...`, 8);
    renderPdfStudioPage();

    let addedDocs = 0;
    for (const file of pdfFiles) {
        if (file.size > PDF_STUDIO_MAX_FILE_BYTES) {
            showToast(`File "${file.name}" vượt quá giới hạn ${Math.round(PDF_STUDIO_MAX_FILE_BYTES / (1024 * 1024))}MB.`, "error");
            continue;
        }
        try {
            const arrayBuffer = await file.arrayBuffer();
            setPipelineState(1, "running", "Đang kiểm tra an toàn", `Xác thực định dạng thực tế & mã băm SHA-256 cho ${file.name}...`, 16);
            if (!hasValidPdfMagicHeader(arrayBuffer)) {
                showToast(`File "${file.name}" không phải định dạng PDF hợp lệ (sai chữ ký %PDF-).`, "error");
                continue;
            }
            const sha256 = await computeArrayBufferSha256(arrayBuffer);
            const dupDoc = pdfStudioState.documents.find(d => d.sha256 === sha256);
            if (dupDoc) {
                await PdfBinaryVault.put("pdfs", dupDoc.id, arrayBuffer.slice(0));
                showToast(`📄 Tài liệu "${file.name}" đã tồn tại (${dupDoc.pageCount} trang). Đã khôi phục bản xem trước, bạn có thể học ngay hoặc bấm Phân tích lại!`, "warning");
                continue;
            }

            // Inspect PDF structure & page count with PDF.js (isEvalSupported: false)
            let pageCount = 0;
            let outlineChapters = [];
            try {
                const pdfjs = await ensurePdfJsLoaded();
                const loadingTask = pdfjs.getDocument({ data: arrayBuffer.slice(0), isEvalSupported: false });
                const pdfDoc = await loadingTask.promise;
                pageCount = pdfDoc.numPages || 0;
                const outline = await pdfDoc.getOutline().catch(() => null);
                if (Array.isArray(outline) && outline.length) {
                    outlineChapters = outline.slice(0, 30).map(it => String(it.title || "").trim()).filter(Boolean);
                }
                pdfLoadedJsDocs.set(`tmp-${sha256}`, pdfDoc);
            } catch (parseErr) {
                showToast(`File PDF "${file.name}" bị lỗi cấu trúc hoặc bị mã hóa mật khẩu: ${parseErr.message || "Không đọc được"}`, "error");
                continue;
            }

            const docId = `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            await PdfBinaryVault.put("pdfs", docId, arrayBuffer.slice(0));
            if (pdfLoadedJsDocs.has(`tmp-${sha256}`)) {
                pdfLoadedJsDocs.set(docId, pdfLoadedJsDocs.get(`tmp-${sha256}`));
                pdfLoadedJsDocs.delete(`tmp-${sha256}`);
            }

            let cloudStoragePath = "";
            if (file.size <= PDF_STUDIO_CLOUD_UPLOAD_MAX && typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) {
                const up = await CloudClient.uploadMaterialFile(file, `pdf-studio/${docId}`);
                if (up && up.ok) cloudStoragePath = up.storagePath || "";
            }

            const defaultEnd = Math.min(pageCount, pageCount <= 20 ? pageCount : 12);
            const activeFolderObj = pdfStudioUi.openFolderId
                ? (pdfStudioState.folders || []).find(f => f.id === pdfStudioUi.openFolderId)
                : null;
            const docRecord = {
                id: docId,
                folderId: activeFolderObj ? activeFolderObj.id : "",
                folderName: activeFolderObj ? activeFolderObj.name : "",
                fileName: file.name,
                fileSize: file.size,
                pageCount,
                sha256,
                cloudStoragePath,
                outlineChapters,
                companionAudioNames: audioFiles.map(a => a.name),
                status: "uploaded", // uploaded | analyzing | building | completed | error
                statusNote: file.size > PDF_STUDIO_CLOUD_UPLOAD_MAX
                    ? "PDF lớn (>10MB): lưu gốc trên thiết bị & đồng bộ toàn bộ khóa học + trích đoạn trang nguồn lên Cloud."
                    : (cloudStoragePath ? "Đã lưu an toàn trên Cloud Storage & thiết bị." : "Đã lưu an toàn trên thiết bị."),
                rangeStart: 1,
                rangeEnd: defaultEnd,
                enableOcr: true,
                pageExcerpts: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            pdfStudioState.documents.unshift(docRecord);
            addedDocs++;

            // Also attach any dropped companion audio files
            if (audioFiles.length) {
                await handlePdfCompanionAudioInput({ target: { files: audioFiles } }, docId);
            }
        } catch (err) {
            showToast(`Lỗi đọc file "${file.name}": ${err.message}`, "error");
        }
    }

    setPipelineState(-1, "idle", "", "", 0);
    if (addedDocs > 0) {
        savePdfStudioState();
        showToast(`✅ Đã tải lên an toàn ${addedDocs} tài liệu PDF! Chọn phạm vi trang rồi bấm "✨ Phân Tích & Tạo Khóa Học".`);
    }
    renderPdfStudioPage();
}

async function deletePdfDocument(docId) {
    if (!pdfStudioState) loadPdfStudioState();
    const doc = getPdfDocumentById(docId);
    if (!doc) return;
    if (!confirm(`Xóa tài liệu "${doc.fileName}" khỏi danh sách? (Các khóa học đã tạo vẫn có thể giữ hoặc xóa riêng.)`)) return;
    pdfStudioState.documents = pdfStudioState.documents.filter(d => d.id !== docId);
    pdfLoadedJsDocs.delete(docId);
    await PdfBinaryVault.del("pdfs", docId);
    savePdfStudioState();
    renderPdfStudioPage();
    showToast("Đã xóa tài liệu PDF.");
}

function updatePdfDocRange(docId, field, value) {
    const doc = getPdfDocumentById(docId);
    if (!doc) return;
    if (field === "enableOcr") {
        doc.enableOcr = Boolean(value);
    } else {
        const num = Math.max(1, Math.min(doc.pageCount || 1, parseInt(value, 10) || 1));
        doc[field] = num;
        if (doc.rangeStart > doc.rangeEnd) {
            if (field === "rangeStart") doc.rangeEnd = doc.rangeStart;
            else doc.rangeStart = doc.rangeEnd;
        }
    }
    savePdfStudioState();
}

function setPdfDocFullRange(docId) {
    const doc = getPdfDocumentById(docId);
    if (!doc) return;
    doc.rangeStart = 1;
    doc.rangeEnd = doc.pageCount || 1;
    savePdfStudioState();
    renderPdfStudioPage();
}

/* ==================== 6. PDF TEXT EXTRACTION + OCR + FULL 11-STAGE PIPELINE ==================== */
function setPipelineState(stageIndex, stageStatus, statusLabel, detailText, progressPct, errorMsg = "") {
    pdfStudioPipeline.stageIndex = stageIndex;
    pdfStudioPipeline.stageStatus = stageStatus;
    pdfStudioPipeline.statusLabel = statusLabel;
    pdfStudioPipeline.detailText = detailText;
    pdfStudioPipeline.progressPct = Math.max(0, Math.min(100, Math.round(progressPct || 0)));
    pdfStudioPipeline.errorMsg = errorMsg;
    renderPdfPipelineBannerOnly();
    hydratePdfCloudAudioPlayers();
}

function renderPdfPipelineBannerOnly() {
    const box = document.getElementById("pdf-pipeline-live-box");
    if (!box) return;
    if (!pdfStudioPipeline.running && pdfStudioPipeline.stageStatus === "idle") {
        box.classList.add("hidden");
        return;
    }
    box.classList.remove("hidden");
    const stagesHtml = PDF_PIPELINE_STAGES.map((st, idx) => {
        const done = idx < pdfStudioPipeline.stageIndex || pdfStudioPipeline.stageStatus === "done";
        const active = idx === pdfStudioPipeline.stageIndex && pdfStudioPipeline.stageStatus === "running";
        const err = idx === pdfStudioPipeline.stageIndex && pdfStudioPipeline.stageStatus === "error";
        const cls = err
            ? "bg-rose-500/20 border-rose-400/50 text-rose-200"
            : active
                ? "bg-violet-600/35 border-violet-400 text-white animate-pulse"
                : done
                    ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                    : "bg-slate-950/70 border-white/10 text-slate-500";
        return `<span class="px-2 py-1 rounded-lg border text-[10px] font-bold ${cls}">${done ? "✓ " : active ? "⏳ " : err ? "✕ " : ""}${st.label}</span>`;
    }).join("");

    box.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
                <p class="text-xs font-extrabold ${pdfStudioPipeline.stageStatus === "error" ? "text-rose-300" : pdfStudioPipeline.stageStatus === "done" ? "text-emerald-300" : "text-cyan-300"}">
                    ${pdfStudioPipeline.stageStatus === "running" ? "⚡" : pdfStudioPipeline.stageStatus === "done" ? "✅" : "⚠️"} ${escHtml(pdfStudioPipeline.statusLabel)} (${pdfStudioPipeline.progressPct}%)
                </p>
                <p class="text-[11px] text-slate-300 mt-0.5">${escHtml(pdfStudioPipeline.detailText)}</p>
                ${pdfStudioPipeline.errorMsg ? `<p class="text-[11px] text-rose-300 font-bold mt-1">${escHtml(pdfStudioPipeline.errorMsg)}</p>` : ""}
            </div>
            ${pdfStudioPipeline.running ? `<button onclick="abortPdfPipeline()" class="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/35 text-rose-200 text-[11px] font-bold">⏹ Dừng an toàn</button>` : ""}
        </div>
        <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-2.5">
            <div class="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-all duration-300" style="width:${pdfStudioPipeline.progressPct}%"></div>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-3">${stagesHtml}</div>
    `;
}

function abortPdfPipeline() {
    pdfStudioPipeline.abortRequested = true;
    showToast("Đang dừng sau lô trang hiện tại (dữ liệu đã xử lý sẽ được giữ lại)...", "warning");
}

async function getLoadedPdfJsDocument(docId) {
    if (pdfLoadedJsDocs.has(docId)) return pdfLoadedJsDocs.get(docId);
    const pdfjs = await ensurePdfJsLoaded();
    let buffer = await PdfBinaryVault.get("pdfs", docId);
    if (!buffer) {
        const doc = getPdfDocumentById(docId);
        if (doc && doc.cloudStoragePath && typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) {
            const signedUrl = await CloudClient.getSignedStorageUrl(doc.cloudStoragePath);
            if (signedUrl) {
                const resp = await fetch(signedUrl);
                if (resp.ok) {
                    buffer = await resp.arrayBuffer();
                    await PdfBinaryVault.put("pdfs", docId, buffer.slice(0));
                }
            }
        }
    }
    if (!buffer) return null;
    const pdfDoc = await pdfjs.getDocument({ data: buffer.slice(0), isEvalSupported: false }).promise;
    pdfLoadedJsDocs.set(docId, pdfDoc);
    return pdfDoc;
}

async function renderPdfPageToBase64Jpeg(pdfDoc, pageNum, scale = 1.3) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const maxDim = 1400;
    let finalScale = scale;
    if (Math.max(viewport.width, viewport.height) > maxDim) {
        finalScale = scale * (maxDim / Math.max(viewport.width, viewport.height));
    }
    const vp = page.getViewport({ scale: finalScale });
    canvas.width = Math.max(1, Math.round(vp.width));
    canvas.height = Math.max(1, Math.round(vp.height));
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
    return dataUrl.split(",")[1] || "";
}

async function extractPdfPageTextAndOcr(pdfDoc, pageNum, enableOcr = true) {
    const page = await pdfDoc.getPage(pageNum);
    const tc = await page.getTextContent();
    // Preserve layout lines by grouping text items with similar Y coordinate
    let lastY = null;
    const lines = [];
    let curLine = [];
    for (const item of (tc.items || [])) {
        const str = String(item.str || "");
        if (!str.trim()) continue;
        const y = item.transform ? Math.round(item.transform[5]) : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 6) {
            if (curLine.length) lines.push(curLine.join(" "));
            curLine = [str.trim()];
        } else {
            curLine.push(str.trim());
        }
        lastY = y;
    }
    if (curLine.length) lines.push(curLine.join(" "));
    let text = sanitizePdfExtractedText(lines.join("\n"));
    let visualSummary = "";
    let usedOcr = false;

    // If scanned / image-only page (< 45 chars of text layer) and OCR enabled -> invoke backend Gemini Vision OCR
    if (text.length < 45 && enableOcr) {
        try {
            const imgB64 = await renderPdfPageToBase64Jpeg(pdfDoc, pageNum, 1.35);
            const ocrRes = await AIClient.request("pdf-ocr", {
                pageNumber: pageNum,
                imageBase64: imgB64,
                mimeType: "image/jpeg"
            });
            if (ocrRes && ocrRes.ok && ocrRes.data) {
                const d = ocrRes.data;
                const ocrText = sanitizePdfExtractedText(d.text || "");
                if (ocrText.length > text.length) {
                    text = ocrText;
                    usedOcr = true;
                }
                const notes = [
                    ...(Array.isArray(d.tables) ? d.tables : []),
                    ...(Array.isArray(d.imageDescriptions) ? d.imageDescriptions : [])
                ].filter(Boolean);
                if (notes.length) visualSummary = notes.join(" | ");
            }
        } catch (err) {
            console.warn(`[PDF OCR] Page ${pageNum} OCR fallback:`, err);
        }
    }

    return { pageNumber: pageNum, text, visualSummary, usedOcr };
}

function buildLocalFallbackChunkAnalysis(pages, filename) {
    // Honest structural extractor when AI Backend is offline — never fabricates unrelated content
    const allLines = [];
    pages.forEach(p => {
        String(p.text || "").split("\n").forEach(ln => {
            const clean = ln.trim();
            if (clean.length > 2) allLines.push({ page: p.pageNumber, text: clean });
        });
    });
    const headingCandidate = allLines.find(l => /^(unit|chapter|lesson|module|part)\s*\d+/i.test(l.text))
        || allLines.find(l => l.text.length >= 6 && l.text.length <= 70)
        || { page: pages[0]?.pageNumber || 1, text: `Trang ${pages[0]?.pageNumber || 1}–${pages[pages.length - 1]?.pageNumber || 1}` };

    const longParagraphs = pages
        .filter(p => String(p.text || "").length >= 260)
        .slice(0, 2)
        .map((p, idx) => ({
            title: `Đoạn văn trích xuất (Trang ${p.pageNumber})`,
            passage: String(p.text || "").slice(0, 1400),
            level: "B1",
            chapterTitle: headingCandidate.text,
            sourcePage: p.pageNumber,
            questions: [
                {
                    type: "main_idea",
                    question: `Nội dung chính của đoạn văn trên trang ${p.pageNumber} xoay quanh chủ đề nào?`,
                    options: [
                        headingCandidate.text,
                        "Một chủ đề không liên quan tới tài liệu",
                        "Chưa đủ thông tin để xác định",
                        "Cả A và B"
                    ],
                    answer: headingCandidate.text,
                    explanationVi: `Chế độ phân tích cục bộ trích xuất trực tiếp từ trang ${p.pageNumber}. Kết nối AI Backend để tạo câu hỏi đọc hiểu chuyên sâu.`,
                    evidenceQuote: String(p.text || "").slice(0, 140),
                    topicTag: headingCandidate.text,
                    sourcePage: p.pageNumber,
                    sourceType: "ai_generated_from_pdf",
                    needsReview: true
                }
            ]
        }));

    return {
        courseTitleSuggestion: filename.replace(/\.pdf$/i, ""),
        detectedLevel: "B1",
        chapters: [{
            title: headingCandidate.text,
            pageStart: pages[0]?.pageNumber || 1,
            pageEnd: pages[pages.length - 1]?.pageNumber || 1,
            topics: [{
                title: `Nội dung trang ${pages[0]?.pageNumber || 1}–${pages[pages.length - 1]?.pageNumber || 1}`,
                sourcePages: pages.map(p => p.pageNumber),
                skills: longParagraphs.length ? ["reading"] : [],
                objectiveVi: "Đọc hiểu nội dung gốc trích xuất cục bộ từ PDF (chưa kết nối AI Backend).",
                summaryVi: (allLines.slice(0, 4).map(l => l.text).join(" • ") || "Trang scan chưa có văn bản.").slice(0, 300),
                keyPoints: allLines.slice(0, 4).map(l => l.text.slice(0, 110)),
                visualOrTableNotes: []
            }]
        }],
        vocabulary: [],
        grammar: [],
        reading: longParagraphs,
        listening: [],
        writing: [],
        speaking: [],
        chunkQualityNotes: {
            confidence: "low",
            ambiguousItems: ["Đang chạy ở chế độ trích xuất cục bộ (AI Backend chưa kết nối). Kết nối Gemini/OpenAI Backend để tạo đầy đủ bài tập 6 kỹ năng."]
        }
    };
}

function validateAndAssemblePdfCourse(doc, rawChunks, meta = {}) {
    // Stage 8 (Answer Validation) + Stage 9 (Course Assembly) + Stage 10 (QA Audit)
    const courseId = meta.existingCourseId || `pdfc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let title = "";
    let detectedLevel = "B1";

    const chapterMap = new Map();
    const vocabMap = new Map();
    const grammarList = [];
    const readingList = [];
    const listeningList = [];
    const writingList = [];
    const speakingList = [];
    const seenQuestions = new Set();
    let duplicatesRemoved = 0;
    let flaggedNeedsReview = 0;
    let extractedCount = 0;
    let aiGeneratedCount = 0;
    const qaWarnings = [];

    const registerProvenance = (item) => {
        if (item.sourceType === "extracted_from_pdf") extractedCount++;
        else aiGeneratedCount++;
        if (item.needsReview) flaggedNeedsReview++;
    };

    const sanitizeQuestion = (q, fallbackPage, defaultType = "mcq") => {
        if (!q || !String(q.question || "").trim()) return null;
        const normQ = String(q.question).trim().toLowerCase();
        if (seenQuestions.has(normQ)) {
            duplicatesRemoved++;
            return null;
        }
        seenQuestions.add(normQ);

        const type = String(q.type || defaultType).toLowerCase();
        let options = Array.isArray(q.options) ? q.options.map(o => String(o || "").trim()).filter(Boolean) : [];
        let answer = String(q.answer || "").trim();
        let needsReview = Boolean(q.needsReview);

        if (type === "tfng" && options.length < 2) {
            options = ["True", "False", "Not Given"];
        }
        if ((type === "mcq" || type === "main_idea" || type === "tfng") && options.length > 0) {
            if (!answer) {
                answer = options[0];
                needsReview = true;
            } else if (!options.some(o => o.toLowerCase() === answer.toLowerCase())) {
                // Ensure the answer key actually appears among selectable options
                options[0] = answer;
                needsReview = true;
            }
        }
        if (!answer) {
            needsReview = true;
        }

        const clean = {
            id: `ex-${Math.random().toString(36).slice(2, 9)}`,
            type,
            question: String(q.question).trim(),
            options,
            answer,
            acceptableAnswers: Array.isArray(q.acceptableAnswers) ? q.acceptableAnswers.map(a => String(a).trim()).filter(Boolean) : [],
            explanationVi: String(q.explanationVi || "Xem lại kiến thức trên trang nguồn PDF.").trim(),
            evidenceQuote: String(q.evidenceQuote || "").trim(),
            topicTag: String(q.topicTag || "General").trim(),
            sourcePage: Number(q.sourcePage) || fallbackPage || 1,
            sourceType: q.sourceType === "extracted_from_pdf" ? "extracted_from_pdf" : "ai_generated_from_pdf",
            needsReview
        };
        registerProvenance(clean);
        return clean;
    };

    rawChunks.forEach(chunk => {
        if (!chunk || typeof chunk !== "object") return;
        if (!title && chunk.courseTitleSuggestion) title = String(chunk.courseTitleSuggestion).trim();
        if (chunk.detectedLevel) detectedLevel = String(chunk.detectedLevel).trim();

        // 1. Knowledge Map Chapters -> Topics
        (Array.isArray(chunk.chapters) ? chunk.chapters : []).forEach(ch => {
            const chTitle = String(ch.title || "Chương tổng hợp").trim();
            const key = chTitle.toLowerCase();
            if (!chapterMap.has(key)) {
                chapterMap.set(key, {
                    id: `ch-${chapterMap.size + 1}`,
                    title: chTitle,
                    pageStart: Number(ch.pageStart) || meta.rangeStart || 1,
                    pageEnd: Number(ch.pageEnd) || meta.rangeEnd || 1,
                    topics: []
                });
            }
            const target = chapterMap.get(key);
            if (Number(ch.pageStart)) target.pageStart = Math.min(target.pageStart, Number(ch.pageStart));
            if (Number(ch.pageEnd)) target.pageEnd = Math.max(target.pageEnd, Number(ch.pageEnd));
            (Array.isArray(ch.topics) ? ch.topics : []).forEach(t => {
                if (!t || !t.title) return;
                if (!target.topics.some(x => x.title.toLowerCase() === String(t.title).trim().toLowerCase())) {
                    target.topics.push({
                        id: `top-${target.topics.length + 1}-${Math.random().toString(36).slice(2, 5)}`,
                        title: String(t.title).trim(),
                        sourcePages: Array.isArray(t.sourcePages) ? t.sourcePages.map(Number).filter(Boolean) : [target.pageStart],
                        skills: Array.isArray(t.skills) ? t.skills.map(s => String(s).toLowerCase()) : [],
                        objectiveVi: String(t.objectiveVi || "").trim(),
                        summaryVi: String(t.summaryVi || "").trim(),
                        keyPoints: Array.isArray(t.keyPoints) ? t.keyPoints.filter(Boolean) : [],
                        visualOrTableNotes: Array.isArray(t.visualOrTableNotes) ? t.visualOrTableNotes.filter(Boolean) : []
                    });
                }
            });
        });

        // 2. Vocabulary
        (Array.isArray(chunk.vocabulary) ? chunk.vocabulary : []).forEach(v => {
            const term = String(v?.term || "").trim();
            if (!term) return;
            const k = term.toLowerCase();
            if (vocabMap.has(k)) {
                duplicatesRemoved++;
                return;
            }
            const item = {
                id: `pv-${Math.random().toString(36).slice(2, 9)}`,
                term,
                ipa: String(v.ipa || "").trim(),
                pos: String(v.pos || "noun").trim(),
                meaningVi: String(v.meaningVi || "").trim() || term,
                example: String(v.example || "").trim(),
                collocations: Array.isArray(v.collocations) ? v.collocations.filter(Boolean) : [],
                phrasalVerbs: Array.isArray(v.phrasalVerbs) ? v.phrasalVerbs.filter(Boolean) : [],
                synonyms: Array.isArray(v.synonyms) ? v.synonyms.filter(Boolean) : [],
                antonyms: Array.isArray(v.antonyms) ? v.antonyms.filter(Boolean) : [],
                level: String(v.level || detectedLevel).trim(),
                chapterTitle: String(v.chapterTitle || "Tổng hợp").trim(),
                sourcePage: Number(v.sourcePage) || 1,
                sourceType: v.sourceType === "extracted_from_pdf" ? "extracted_from_pdf" : "ai_generated_from_pdf",
                needsReview: Boolean(v.needsReview)
            };
            registerProvenance(item);
            vocabMap.set(k, item);
        });

        // 3. Grammar
        (Array.isArray(chunk.grammar) ? chunk.grammar : []).forEach(g => {
            if (!g || !g.title) return;
            const page = Number(g.sourcePage) || 1;
            const validEx = (Array.isArray(g.exercises) ? g.exercises : [])
                .map(ex => sanitizeQuestion(ex, page, "mcq"))
                .filter(Boolean);
            grammarList.push({
                id: `pg-${Math.random().toString(36).slice(2, 9)}`,
                title: String(g.title).trim(),
                ruleVi: String(g.ruleVi || "").trim(),
                formula: String(g.formula || "").trim(),
                examples: Array.isArray(g.examples) ? g.examples.filter(Boolean) : [],
                commonMistakesVi: Array.isArray(g.commonMistakesVi) ? g.commonMistakesVi.filter(Boolean) : [],
                level: String(g.level || detectedLevel).trim(),
                chapterTitle: String(g.chapterTitle || "Tổng hợp").trim(),
                sourcePage: page,
                exercises: validEx
            });
        });

        // 4. Reading
        (Array.isArray(chunk.reading) ? chunk.reading : []).forEach(r => {
            if (!r || (!r.title && !r.passage)) return;
            const page = Number(r.sourcePage) || 1;
            const validQs = (Array.isArray(r.questions) ? r.questions : [])
                .map(q => sanitizeQuestion(q, page, "mcq"))
                .filter(Boolean);
            readingList.push({
                id: `pr-${Math.random().toString(36).slice(2, 9)}`,
                title: String(r.title || `Bài đọc trang ${page}`).trim(),
                passage: String(r.passage || "").trim(),
                level: String(r.level || detectedLevel).trim(),
                chapterTitle: String(r.chapterTitle || "Tổng hợp").trim(),
                sourcePage: page,
                questions: validQs
            });
        });

        // 5. Listening (Strict honesty: check real companion audio match!)
        (Array.isArray(chunk.listening) ? chunk.listening : []).forEach(l => {
            if (!l || (!l.transcript && !(l.questions || []).length)) return;
            const page = Number(l.sourcePage) || 1;
            const suggested = String(l.suggestedAudioFile || "").trim();
            const hasRealAudio = Boolean(suggested && (doc.companionAudioNames || []).some(a => a.toLowerCase() === suggested.toLowerCase()));
            const validQs = (Array.isArray(l.questions) ? l.questions : [])
                .map(q => sanitizeQuestion(q, page, "mcq"))
                .filter(Boolean);
            listeningList.push({
                id: `pl-${Math.random().toString(36).slice(2, 9)}`,
                title: String(l.title || `Bài nghe trang ${page}`).trim(),
                mode: hasRealAudio ? "audio_matched" : "transcript_only",
                suggestedAudioFile: hasRealAudio ? suggested : "",
                transcript: String(l.transcript || "").trim(),
                level: String(l.level || detectedLevel).trim(),
                chapterTitle: String(l.chapterTitle || "Tổng hợp").trim(),
                sourcePage: page,
                questions: validQs
            });
        });

        // 6. Writing
        (Array.isArray(chunk.writing) ? chunk.writing : []).forEach(w => {
            if (!w || (!w.title && !w.promptVi && !w.promptEn)) return;
            const item = {
                id: `pw-${Math.random().toString(36).slice(2, 9)}`,
                title: String(w.title || "Bài luyện viết từ PDF").trim(),
                taskType: String(w.taskType || "paragraph").trim(),
                promptVi: String(w.promptVi || "").trim(),
                promptEn: String(w.promptEn || "").trim(),
                sourceTextVi: String(w.sourceTextVi || "").trim(),
                targetStructures: Array.isArray(w.targetStructures) ? w.targetStructures.filter(Boolean) : [],
                keyVocab: Array.isArray(w.keyVocab) ? w.keyVocab.filter(Boolean) : [],
                modelAnswer: String(w.modelAnswer || "").trim(),
                level: String(w.level || detectedLevel).trim(),
                chapterTitle: String(w.chapterTitle || "Tổng hợp").trim(),
                sourcePage: Number(w.sourcePage) || 1,
                sourceType: w.sourceType === "extracted_from_pdf" ? "extracted_from_pdf" : "ai_generated_from_pdf",
                needsReview: Boolean(w.needsReview)
            };
            registerProvenance(item);
            writingList.push(item);
        });

        // 7. Speaking
        (Array.isArray(chunk.speaking) ? chunk.speaking : []).forEach(sp => {
            if (!sp || (!sp.title && !sp.scenarioVi && !(sp.questions || []).length)) return;
            const item = {
                id: `ps-${Math.random().toString(36).slice(2, 9)}`,
                title: String(sp.title || "Luyện nói theo PDF").trim(),
                taskType: String(sp.taskType || "qa_reflex").trim(),
                scenarioVi: String(sp.scenarioVi || "").trim(),
                dialogueLines: Array.isArray(sp.dialogueLines) ? sp.dialogueLines : [],
                questions: Array.isArray(sp.questions) ? sp.questions.filter(Boolean) : [],
                suggestedVocab: Array.isArray(sp.suggestedVocab) ? sp.suggestedVocab.filter(Boolean) : [],
                usefulExpressions: Array.isArray(sp.usefulExpressions) ? sp.usefulExpressions.filter(Boolean) : [],
                modelResponse: String(sp.modelResponse || "").trim(),
                level: String(sp.level || detectedLevel).trim(),
                chapterTitle: String(sp.chapterTitle || "Tổng hợp").trim(),
                sourcePage: Number(sp.sourcePage) || 1,
                sourceType: sp.sourceType === "extracted_from_pdf" ? "extracted_from_pdf" : "ai_generated_from_pdf",
                needsReview: Boolean(sp.needsReview)
            };
            registerProvenance(item);
            speakingList.push(item);
        });

        if (chunk.chunkQualityNotes?.ambiguousItems?.length) {
            qaWarnings.push(...chunk.chunkQualityNotes.ambiguousItems.map(x => String(x)));
        }
    });

    const chapters = Array.from(chapterMap.values());
    const vocabulary = Array.from(vocabMap.values());

    return {
        id: courseId,
        docId: doc.id,
        folderId: doc.folderId || "",
        folderName: doc.folderName || "",
        fileName: doc.fileName,
        title: title || doc.fileName.replace(/\.pdf$/i, ""),
        descriptionVi: `Khóa học tương tác tạo từ "${doc.fileName}" (Trang ${meta.rangeStart}–${meta.rangeEnd}/${doc.pageCount}).`,
        level: detectedLevel,
        provider: meta.provider || "AI Engine",
        analyzedRange: { start: meta.rangeStart, end: meta.rangeEnd, totalPages: doc.pageCount },
        ocrPagesCount: meta.ocrPagesCount || 0,
        published: false,
        knowledgeMap: {
            chapters,
            totalTopics: chapters.reduce((s, c) => s + (c.topics?.length || 0), 0),
            skillsAvailability: {
                vocabulary: vocabulary.length > 0,
                grammar: grammarList.length > 0,
                reading: readingList.length > 0,
                listening: listeningList.length > 0,
                writing: writingList.length > 0,
                speaking: speakingList.length > 0
            }
        },
        skills: {
            vocabulary,
            grammar: grammarList,
            reading: readingList,
            listening: listeningList,
            writing: writingList,
            speaking: speakingList
        },
        qaReport: {
            pagesProcessed: (meta.rangeEnd - meta.rangeStart) + 1,
            extractedCount,
            aiGeneratedCount,
            duplicatesRemoved,
            flaggedNeedsReview,
            warnings: qaWarnings.slice(0, 12),
            checkedAt: new Date().toISOString()
        },
        progress: {
            completedIds: [],
            answers: {},
            scores: {},
            mistakes: [],
            examHistory: [],
            remedialHistory: [],
            lastTab: "overview",
            lastChapter: "all"
        },
        mindMaps: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

async function runPdfToCoursePipeline(docId, options = {}) {
    if (pdfStudioPipeline.running) {
        showToast("Đang có một tiến trình phân tích PDF đang chạy. Vui lòng đợi hoàn tất hoặc bấm Dừng.", "warning");
        return;
    }
    const doc = getPdfDocumentById(docId);
    if (!doc) {
        showToast("Không tìm thấy tài liệu PDF.", "error");
        return;
    }

    const rangeStart = Math.max(1, Number(options.rangeStart || doc.rangeStart) || 1);
    const rangeEnd = Math.max(rangeStart, Math.min(doc.pageCount || rangeStart, Number(options.rangeEnd || doc.rangeEnd) || doc.pageCount || 1));
    const totalSelected = (rangeEnd - rangeStart) + 1;

    if (totalSelected > 60 && !confirm(`Bạn đang chọn phân tích ${totalSelected} trang (khoảng ${Math.ceil(totalSelected / PDF_STUDIO_DEFAULT_CHUNK_SIZE)} lô AI). Quá trình này có thể mất vài phút. Bạn muốn tiếp tục toàn bộ hay hủy để chọn từng Unit/Chương trước?`)) {
        return;
    }

    pdfStudioPipeline.running = true;
    pdfStudioPipeline.abortRequested = false;
    pdfStudioPipeline.docId = docId;
    doc.status = "analyzing";
    savePdfStudioState();
    renderPdfStudioPage();

    try {
        setPipelineState(1, "running", "Đang kiểm tra tài liệu", `Mở file "${doc.fileName}" (Trang ${rangeStart}–${rangeEnd})...`, 6);
        const pdfDoc = await getLoadedPdfJsDocument(docId);
        if (!pdfDoc) {
            throw new Error("Không tìm thấy dữ liệu PDF trên thiết bị này. Vui lòng tải lại file PDF đó lên để phân tích.");
        }

        // Stage 3: Text Extraction + OCR
        const extractedPages = [];
        let ocrPagesCount = 0;
        for (let p = rangeStart; p <= rangeEnd; p++) {
            if (pdfStudioPipeline.abortRequested) break;
            const donePages = p - rangeStart;
            const pct = 10 + Math.round((donePages / totalSelected) * 28);
            setPipelineState(2, "running", "Đang trích xuất văn bản & OCR", `Đọc trang ${p}/${rangeEnd} (${doc.enableOcr ? "tự động OCR trang scan" : "chỉ lớp văn bản"})...`, pct);
            const pageData = await extractPdfPageTextAndOcr(pdfDoc, p, doc.enableOcr !== false);
            if (pageData.usedOcr) ocrPagesCount++;
            extractedPages.push(pageData);
            doc.pageExcerpts = doc.pageExcerpts || {};
            doc.pageExcerpts[String(p)] = pageData.text.slice(0, 1200);
        }

        if (!extractedPages.length) {
            throw new Error("Không trích xuất được trang nào từ tài liệu.");
        }

        // Stages 4–7: Chunked Knowledge Map + Skill Classification + Exercise Extraction
        const chunks = [];
        for (let i = 0; i < extractedPages.length; i += PDF_STUDIO_DEFAULT_CHUNK_SIZE) {
            chunks.push(extractedPages.slice(i, i + PDF_STUDIO_DEFAULT_CHUNK_SIZE));
        }

        doc.status = "building";
        savePdfStudioState();

        const rawChunkResults = [];
        const knownChapters = [...(doc.outlineChapters || [])];
        let usedProvider = "Local Extractor";
        let aiSucceededAny = false;

        for (let ci = 0; ci < chunks.length; ci++) {
            if (pdfStudioPipeline.abortRequested) break;
            const batch = chunks[ci];
            const pFirst = batch[0].pageNumber;
            const pLast = batch[batch.length - 1].pageNumber;
            const pct = 40 + Math.round((ci / chunks.length) * 42);
            const stageIdx = ci === 0 ? 3 : (ci % 2 === 1 ? 4 : 6);
            setPipelineState(stageIdx, "running", "Đang xây Bản đồ Kiến thức & Tạo Bài học", `Phân tích lô ${ci + 1}/${chunks.length} (Trang ${pFirst}–${pLast})...`, pct);

            let res = null;
            for (let attempt = 1; attempt <= 2; attempt++) {
                res = await AIClient.request("pdf-analyze-chunk", {
                    filename: doc.fileName,
                    chunkIndex: ci,
                    totalChunks: chunks.length,
                    pages: batch,
                    existingChapters: knownChapters.slice(-12),
                    companionAudioNames: doc.companionAudioNames || []
                });
                if (res && res.ok && res.data) break;
                if (res && res.notConnected) break;
                await new Promise(r => setTimeout(r, 1200 * attempt));
            }

            if (res && res.ok && res.data) {
                aiSucceededAny = true;
                usedProvider = res.provider || "Google Gemini";
                rawChunkResults.push(res.data);
                (res.data.chapters || []).forEach(c => {
                    if (c && c.title && !knownChapters.includes(c.title)) knownChapters.push(c.title);
                });
            } else {
                rawChunkResults.push(buildLocalFallbackChunkAnalysis(batch, doc.fileName));
                if (res && res.error && ci === 0) {
                    showToast(`⚠️ AI Backend phản hồi lỗi (${res.error}) — chuyển tạm sang trích xuất cục bộ minh bạch.`, "warning");
                }
            }
        }

        // Stages 8–10: Validation, Course Assembly & QA
        setPipelineState(7, "running", "Đang kiểm tra đáp án & chống trùng lặp", "Xác thực đáp án, số trang nguồn và phân loại nguồn gốc bài tập...", 86);
        await new Promise(r => setTimeout(r, 150));
        setPipelineState(8, "running", "Đang lắp ráp khóa học & QA", "Tổng hợp Bản đồ Kiến thức (Knowledge Map) và kiểm soát chất lượng...", 94);

        const actualEnd = extractedPages[extractedPages.length - 1].pageNumber;
        const course = validateAndAssemblePdfCourse(doc, rawChunkResults, {
            existingCourseId: options.existingCourseId || null,
            rangeStart,
            rangeEnd: actualEnd,
            ocrPagesCount,
            provider: aiSucceededAny ? usedProvider : "Trích xuất cục bộ (AI Backend chưa kết nối)"
        });

        // Upsert course
        const existIdx = pdfStudioState.courses.findIndex(c => c.id === course.id);
        if (existIdx >= 0) {
            course.progress = pdfStudioState.courses[existIdx].progress || course.progress;
            course.mindMaps = pdfStudioState.courses[existIdx].mindMaps || {};
            pdfStudioState.courses[existIdx] = course;
        } else {
            pdfStudioState.courses.unshift(course);
        }
        pdfStudioState.activeCourseId = course.id;
        doc.status = "completed";
        doc.updatedAt = new Date().toISOString();
        savePdfStudioState();

        setPipelineState(10, "done", "Hoàn thành — Sẵn sàng xem trước & xuất bản!", `Đã tạo khóa học "${course.title}" (${course.knowledgeMap.chapters.length} chương, ${course.skills.vocabulary.length} từ vựng, ${course.skills.grammar.length} bài ngữ pháp, ${course.skills.reading.length} bài đọc).`, 100);
        pdfStudioUi.viewMode = "course";
        pdfStudioUi.activeTab = "overview";
        pdfStudioUi.filterChapter = "all";
        pdfStudioUi.filterLevel = "all";
        pdfStudioUi.filterStatus = "all";
        pdfStudioUi.filterPage = "";
        showToast(`🎉 Đã phân tích xong PDF và tạo khóa học "${course.title}"! Xem trước rồi bấm Xuất bản hoặc Học ngay.`);
    } catch (err) {
        doc.status = "error";
        doc.statusNote = err.message || "Lỗi xử lý PDF";
        savePdfStudioState();
        setPipelineState(Math.max(1, pdfStudioPipeline.stageIndex), "error", "Lỗi xử lý PDF", "Bạn có thể kiểm tra lại file hoặc bấm Thử lại.", pdfStudioPipeline.progressPct, err.message || "Lỗi không xác định");
        showToast("Lỗi phân tích PDF: " + (err.message || "Vui lòng thử lại."), "error");
    } finally {
        pdfStudioPipeline.running = false;
        pdfStudioPipeline.abortRequested = false;
        renderPdfStudioPage();
    }
}

/* ==================== 7. COURSE ACTIONS: PUBLISH, EDIT, REGENERATE, DELETE ==================== */
function selectPdfCourse(courseId) {
    if (!pdfStudioState) loadPdfStudioState();
    pdfStudioState.activeCourseId = courseId;
    const course = getActivePdfCourse();
    pdfStudioUi.activeTab = course?.progress?.lastTab || "overview";
    pdfStudioUi.filterChapter = course?.progress?.lastChapter || "all";
    pdfStudioUi.activeExam = null;
    pdfStudioUi.activeRemedial = null;
    pdfStudioUi.editCourseMode = false;
    savePdfStudioState();
    renderPdfStudioPage();
}

function publishPdfCourse(courseId, startLearning = false) {
    const course = pdfStudioState?.courses.find(c => c.id === courseId);
    if (!course) return;
    course.published = true;
    course.updatedAt = new Date().toISOString();
    if (startLearning) {
        const av = course.knowledgeMap?.skillsAvailability || {};
        const firstTab = av.vocabulary ? "vocabulary" : av.grammar ? "grammar" : av.reading ? "reading" : av.writing ? "writing" : "overview";
        pdfStudioUi.activeTab = firstTab;
        course.progress.lastTab = firstTab;
    }
    savePdfStudioState();
    if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) CloudClient.syncNow();
    renderPdfStudioPage();
    showToast(startLearning ? `🚀 Đã xuất bản & mở khóa học "${course.title}"!` : `✅ Đã xuất bản khóa học "${course.title}" và đồng bộ Cloud!`);
}

function toggleEditPdfCourse() {
    pdfStudioUi.editCourseMode = !pdfStudioUi.editCourseMode;
    renderPdfStudioPage();
}

function saveEditedPdfCourseMeta() {
    const course = getActivePdfCourse();
    if (!course) return;
    const newTitle = (document.getElementById("pdf-edit-title")?.value || "").trim();
    const newDesc = (document.getElementById("pdf-edit-desc")?.value || "").trim();
    const newLevel = (document.getElementById("pdf-edit-level")?.value || course.level || "B1").trim();
    if (newTitle) course.title = newTitle;
    if (newDesc) course.descriptionVi = newDesc;
    course.level = newLevel;
    course.updatedAt = new Date().toISOString();
    pdfStudioUi.editCourseMode = false;
    savePdfStudioState();
    renderPdfStudioPage();
    showToast("Đã lưu chỉnh sửa khóa học!");
}

function deletePdfCourse(courseId) {
    if (!pdfStudioState) loadPdfStudioState();
    const c = pdfStudioState.courses.find(x => x.id === courseId);
    if (!c) return;
    if (!confirm(`Xóa khóa học "${c.title}"? (Tài liệu PDF gốc vẫn còn trong thư viện để bạn có thể tạo lại nếu cần.)`)) return;
    pdfStudioState.courses = pdfStudioState.courses.filter(x => x.id !== courseId);
    if (pdfStudioState.activeCourseId === courseId) {
        pdfStudioState.activeCourseId = pdfStudioState.courses[0]?.id || null;
    }
    savePdfStudioState();
    renderPdfStudioPage();
    showToast("Đã xóa khóa học.");
}

async function regeneratePdfCourseExercises(skill = "grammar") {
    const course = getActivePdfCourse();
    if (!course) return;
    const chapter = pdfStudioUi.filterChapter !== "all"
        ? pdfStudioUi.filterChapter
        : (course.knowledgeMap?.chapters?.[0]?.title || course.title);
    const doc = getPdfDocumentById(course.docId);
    const existingQs = [
        ...(course.skills.grammar || []).flatMap(g => (g.exercises || []).map(e => e.question)),
        ...(course.skills.reading || []).flatMap(r => (r.questions || []).map(q => q.question))
    ].slice(0, 25);

    showToast(`⏳ AI đang tạo thêm bài tập ${skill.toUpperCase()} mới từ kiến thức "${chapter}"...`);
    const res = await AIClient.request("pdf-generate-exercises", {
        chapterTitle: chapter,
        skill,
        knowledge: {
            chapters: course.knowledgeMap?.chapters || [],
            pageExcerpts: doc?.pageExcerpts || {},
            vocab: (course.skills.vocabulary || []).slice(0, 20),
            grammar: (course.skills.grammar || []).slice(0, 8)
        },
        existingQuestions: existingQs
    });
    if (!res || !res.ok || !Array.isArray(res.data?.exercises) || !res.data.exercises.length) {
        showToast("Không tạo thêm được bài tập mới: " + (res?.error || "Vui lòng kiểm tra AI Backend."), "error");
        return;
    }
    const newEx = res.data.exercises.map(ex => ({
        id: `ex-${Math.random().toString(36).slice(2, 9)}`,
        type: ex.type || "mcq",
        question: String(ex.question || "").trim(),
        options: Array.isArray(ex.options) ? ex.options : [],
        answer: String(ex.answer || "").trim(),
        acceptableAnswers: Array.isArray(ex.acceptableAnswers) ? ex.acceptableAnswers : [],
        explanationVi: String(ex.explanationVi || "").trim(),
        topicTag: String(ex.topicTag || chapter).trim(),
        sourcePage: Number(ex.sourcePage) || 1,
        sourceType: "ai_generated_from_pdf",
        needsReview: Boolean(ex.needsReview)
    })).filter(x => x.question && x.answer);

    if (skill === "grammar") {
        course.skills.grammar.push({
            id: `pg-${Date.now()}`,
            title: `Bài tập AI tạo thêm — ${chapter}`,
            ruleVi: "Bộ câu hỏi bổ sung do AI sinh thêm dựa trực tiếp trên Knowledge Map và trang nguồn PDF.",
            formula: "",
            examples: [],
            commonMistakesVi: [],
            level: course.level || "B1",
            chapterTitle: chapter,
            sourcePage: newEx[0]?.sourcePage || 1,
            exercises: newEx
        });
        course.knowledgeMap.skillsAvailability.grammar = true;
    }
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
    showToast(`✅ Đã tạo thêm ${newEx.length} bài tập mới bám sát tài liệu gốc!`);
}

/* ==================== 8. INTERACTIVE EXERCISE CHECKER + MISTAKE / WEAKNESS TRACKER ==================== */
function normalizeAnswerStr(s) {
    return String(s || "").trim().toLowerCase().replace(/[.,!?;:'"’`]/g, "").replace(/\s+/g, " ");
}

function recordPdfExerciseAttempt(course, ex, userAnswer, isCorrect, skill) {
    course.progress = course.progress || { completedIds: [], answers: {}, scores: {}, mistakes: [], examHistory: [], remedialHistory: [] };
    course.progress.answers[ex.id] = {
        userAnswer,
        isCorrect,
        checkedAt: new Date().toISOString()
    };
    if (isCorrect) {
        if (!course.progress.completedIds.includes(ex.id)) {
            course.progress.completedIds.push(ex.id);
        }
    } else {
        course.progress.mistakes = course.progress.mistakes || [];
        course.progress.mistakes.unshift({
            id: `mk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            exId: ex.id,
            skill,
            topicTag: ex.topicTag || "Chung",
            chapterTitle: ex.chapterTitle || course.title,
            question: ex.question,
            userAnswer,
            correctAnswer: ex.answer,
            sourcePage: ex.sourcePage || 1,
            at: new Date().toISOString()
        });
        course.progress.mistakes = course.progress.mistakes.slice(0, 120);
        if (typeof autoLogMistake === "function") {
            autoLogMistake({
                errorCategory: ex.topicTag || `PDF ${skill}`,
                wrongText: String(userAnswer || "(trống)").slice(0, 160),
                correctText: String(ex.answer || "").slice(0, 160),
                explanation: ex.explanationVi || `Sai câu hỏi trang ${ex.sourcePage || 1} trong "${course.title}"`,
                skill
            });
        }
    }
    if (typeof logStudyMetrics === "function") {
        const m = {};
        if (skill === "grammar") m.grammarDone = 1;
        else if (skill === "reading") m.readingDone = 1;
        else if (skill === "listening") m.listeningDone = 1;
        else if (skill === "writing") m.writingDone = 1;
        else if (skill === "speaking") m.speakingSessions = 1;
        logStudyMetrics(m);
    }
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
}

function findPdfExerciseById(course, exId) {
    for (const g of (course.skills.grammar || [])) {
        const found = (g.exercises || []).find(e => e.id === exId);
        if (found) return { ex: { ...found, chapterTitle: g.chapterTitle }, skill: "grammar" };
    }
    for (const r of (course.skills.reading || [])) {
        const found = (r.questions || []).find(q => q.id === exId);
        if (found) return { ex: { ...found, chapterTitle: r.chapterTitle }, skill: "reading" };
    }
    for (const l of (course.skills.listening || [])) {
        const found = (l.questions || []).find(q => q.id === exId);
        if (found) return { ex: { ...found, chapterTitle: l.chapterTitle }, skill: "listening" };
    }
    if (pdfStudioUi.activeRemedial?.drills) {
        const found = pdfStudioUi.activeRemedial.drills.find(d => d.id === exId);
        if (found) return { ex: found, skill: found.skill || "grammar" };
    }
    return null;
}

function checkPdfSingleExercise(exId) {
    const course = getActivePdfCourse();
    if (!course) return;
    const hit = findPdfExerciseById(course, exId);
    if (!hit) return;
    const { ex, skill } = hit;

    let userAnswer = "";
    const radio = document.querySelector(`input[name="pdf-ex-${exId}"]:checked`);
    const textInp = document.getElementById(`pdf-ex-input-${exId}`);
    if (radio) userAnswer = radio.value;
    else if (textInp) userAnswer = textInp.value.trim();

    if (!userAnswer) {
        showToast("Hãy chọn hoặc nhập câu trả lời trước khi kiểm tra!", "warning");
        return;
    }

    const accepted = [ex.answer, ...(ex.acceptableAnswers || [])].map(normalizeAnswerStr).filter(Boolean);
    const isCorrect = accepted.includes(normalizeAnswerStr(userAnswer));
    recordPdfExerciseAttempt(course, ex, userAnswer, isCorrect, skill);
    renderPdfStudioPage();
    showToast(isCorrect ? "✅ Chính xác! Đã lưu tiến độ lên Cloud." : "❌ Chưa đúng — xem giải thích và nguồn trang PDF bên dưới.", isCorrect ? "success" : "error");
}

function resetPdfSingleExercise(exId) {
    const course = getActivePdfCourse();
    if (!course || !course.progress?.answers) return;
    delete course.progress.answers[exId];
    savePdfStudioState();
    renderPdfStudioPage();
}

/* ==================== 9. VOCABULARY INTERACTIVE ENGINE & PUSH TO QENGLISH SRS ==================== */
function pushPdfVocabToMainSRS(onlySingleId = null) {
    const course = getActivePdfCourse();
    if (!course) return;
    const list = onlySingleId
        ? (course.skills.vocabulary || []).filter(v => v.id === onlySingleId)
        : (course.skills.vocabulary || []);
    if (!list.length) return;

    const existingTerms = new Set((deck || []).map(w => String(w.term || "").trim().toLowerCase()));
    let added = 0;
    const nextDay = Math.max(1, ...(deck || []).map(w => Number(w.day) || 1));

    list.forEach((v, idx) => {
        const key = String(v.term || "").trim().toLowerCase();
        if (!key || existingTerms.has(key)) return;
        existingTerms.add(key);
        deck.push(normalizeWordItem({
            id: Date.now() + idx + Math.random(),
            day: nextDay,
            term: v.term,
            ipa: v.ipa || "/.../",
            pos: v.pos || "",
            def: v.meaningVi,
            example: v.example || "",
            synonyms: (v.synonyms || []).join(", "),
            antonyms: (v.antonyms || []).join(", "),
            category: "PDF Studio",
            level: v.level || course.level || "B1",
            starred: false,
            source: "user-imported"
        }, idx));
        added++;
    });

    if (added > 0) {
        saveDeckToStorage();
        if (typeof renderWordList === "function") renderWordList();
        showToast(`🚀 Đã đẩy ${added} từ vựng từ PDF vào Kho Từ Vựng & SRS QEnglish (đồng bộ đa thiết bị)!`);
    } else {
        showToast("Tất cả từ vựng này đã có trong Kho Từ Vựng QEnglish của bạn rồi!", "warning");
    }
}

function markPdfVocabRemembered(vocabId, remembered) {
    const course = getActivePdfCourse();
    if (!course) return;
    course.progress = course.progress || { completedIds: [], answers: {}, scores: {}, mistakes: [] };
    if (remembered) {
        if (!course.progress.completedIds.includes(vocabId)) course.progress.completedIds.push(vocabId);
    } else {
        course.progress.completedIds = course.progress.completedIds.filter(id => id !== vocabId);
        const v = (course.skills.vocabulary || []).find(x => x.id === vocabId);
        if (v) {
            course.progress.mistakes = course.progress.mistakes || [];
            course.progress.mistakes.unshift({
                id: `mk-${Date.now()}`,
                exId: vocabId,
                skill: "vocabulary",
                topicTag: `Từ vựng: ${v.chapterTitle || course.title}`,
                chapterTitle: v.chapterTitle || course.title,
                question: `Nghĩa của từ "${v.term}"`,
                userAnswer: "Chưa nhớ",
                correctAnswer: v.meaningVi,
                sourcePage: v.sourcePage || 1,
                at: new Date().toISOString()
            });
        }
    }
    pdfStudioUi.vocabFlipped = false;
    pdfStudioUi.vocabCardIdx++;
    savePdfStudioState();
    renderPdfStudioPage();
}

function selectPdfMatchItem(side, id) {
    if (!pdfStudioUi.vocabMatchState) return;
    const st = pdfStudioUi.vocabMatchState;
    if (st.matched.includes(id)) return;
    if (side === "term") st.selTerm = id;
    else st.selDef = id;

    if (st.selTerm && st.selDef) {
        if (st.selTerm === st.selDef) {
            st.matched.push(st.selTerm);
            const course = getActivePdfCourse();
            if (course && !course.progress.completedIds.includes(st.selTerm)) {
                course.progress.completedIds.push(st.selTerm);
                savePdfStudioState();
            }
            showToast("✅ Ghép chính xác!");
        } else {
            st.wrongCount = (st.wrongCount || 0) + 1;
            showToast("❌ Chưa khớp, thử lại nhé!", "error");
        }
        st.selTerm = null;
        st.selDef = null;
    }
    renderPdfStudioPage();
}

/* ==================== 10. WRITING & SPEAKING AI GRADING ==================== */
async function submitPdfOpenResponse(itemId, mode) {
    const course = getActivePdfCourse();
    if (!course) return;
    const item = mode === "speaking"
        ? (course.skills.speaking || []).find(s => s.id === itemId)
        : (course.skills.writing || []).find(w => w.id === itemId);
    if (!item) return;

    const inputEl = document.getElementById(`pdf-open-input-${itemId}`);
    const submission = (inputEl?.value || "").trim();
    if (submission.length < 4) {
        showToast("Hãy nhập hoặc nói câu trả lời của bạn trước khi chấm điểm AI!", "warning");
        return;
    }

    const outEl = document.getElementById(`pdf-open-result-${itemId}`);
    if (outEl) {
        outEl.classList.remove("hidden");
        outEl.innerHTML = `<div class="p-4 rounded-2xl bg-slate-950 border border-violet-500/35 text-xs text-violet-300 font-bold animate-pulse">⏳ AI Giáo viên đang chấm điểm thang 10, sửa từng câu và phân tích lỗi...</div>`;
    }

    const res = await AIClient.request("pdf-grade-open", {
        mode,
        promptVi: item.promptVi || item.scenarioVi || "",
        promptEn: item.promptEn || (item.questions || []).join(" / ") || "",
        targetStructures: item.targetStructures || item.usefulExpressions || [],
        keyVocab: item.keyVocab || item.suggestedVocab || [],
        modelAnswer: item.modelAnswer || item.modelResponse || "",
        submission
    });

    if (!res || !res.ok || !res.data) {
        // Honest fallback when offline
        if (outEl) {
            outEl.innerHTML = `
                <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                    <p class="font-extrabold text-amber-300">🛠️ Chưa kết nối AI Backend (${escHtml(res?.error || "Offline")})</p>
                    <p class="text-slate-300">Hệ thống không bịa điểm AI khi offline. Bài làm của bạn đã được lưu an toàn để đối chiếu với bản mẫu tham khảo:</p>
                    ${item.modelAnswer || item.modelResponse ? `<div class="p-3 rounded-xl bg-slate-950 text-emerald-300">${escHtml(item.modelAnswer || item.modelResponse)}</div>` : ""}
                </div>
            `;
        }
        return;
    }

    const d = res.data;
    const score10 = Number(d.score10) || 0;
    course.progress.answers[itemId] = {
        userAnswer: submission,
        score10,
        report: d,
        provider: res.provider,
        checkedAt: new Date().toISOString()
    };
    course.progress.scores[itemId] = score10;
    if (score10 >= 5 && !course.progress.completedIds.includes(itemId)) {
        course.progress.completedIds.push(itemId);
    }
    if (Array.isArray(d.weakTopicTags) && d.weakTopicTags.length && score10 < 8) {
        d.weakTopicTags.forEach(tag => {
            course.progress.mistakes.unshift({
                id: `mk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                exId: itemId,
                skill: mode,
                topicTag: String(tag),
                chapterTitle: item.chapterTitle || course.title,
                question: item.title,
                userAnswer: submission.slice(0, 140),
                correctAnswer: (d.naturalModel || "").slice(0, 140),
                sourcePage: item.sourcePage || 1,
                at: new Date().toISOString()
            });
        });
    }
    savePdfStudioState();
    renderPdfStudioPage();
    showToast(`✅ AI chấm ${score10}/10 điểm! Đã lưu kết quả lên Cloud.`);
}

async function recordPdfSpeakingVoice(itemId) {
    try {
        showToast("🎙️ Đang nghe giọng nói của bạn (nói rõ bằng tiếng Anh)...");
        const alts = await recognizeSpeechOnce(10000);
        const best = alts?.[0]?.transcript || "";
        const inp = document.getElementById(`pdf-open-input-${itemId}`);
        if (inp && best) {
            inp.value = inp.value ? `${inp.value.trim()} ${best}` : best;
            showToast(`✅ Đã nhận diện giọng nói: "${best}"`);
        }
    } catch (err) {
        showToast(String(err || "Không thể thu âm micro."), "error");
    }
}

/* ==================== 11. FEATURE #2: AI WEAKNESS DETECTOR & REMEDIAL DRILLS ==================== */
function computePdfWeaknessClusters(course) {
    const mistakes = Array.isArray(course?.progress?.mistakes) ? course.progress.mistakes : [];
    const map = new Map();
    mistakes.forEach(m => {
        const tag = String(m.topicTag || "Chung").trim();
        const key = `${m.skill || "general"}::${tag.toLowerCase()}`;
        if (!map.has(key)) {
            map.set(key, {
                skill: m.skill || "grammar",
                topicTag: tag,
                chapterTitle: m.chapterTitle || course.title,
                wrongCount: 0,
                sourcePages: new Set(),
                recentMistakes: []
            });
        }
        const entry = map.get(key);
        entry.wrongCount++;
        if (m.sourcePage) entry.sourcePages.add(Number(m.sourcePage));
        if (entry.recentMistakes.length < 4) {
            entry.recentMistakes.push({ question: m.question, userAnswer: m.userAnswer, correctAnswer: m.correctAnswer });
        }
    });
    return Array.from(map.values())
        .map(x => ({ ...x, sourcePages: Array.from(x.sourcePages).sort((a, b) => a - b) }))
        .sort((a, b) => b.wrongCount - a.wrongCount);
}

async function generatePdfRemedialDrills() {
    const course = getActivePdfCourse();
    if (!course) return;
    const clusters = computePdfWeaknessClusters(course);
    if (!clusters.length) {
        showToast("Tuyệt vời! Bạn chưa có lỗi sai nào cần khắc phục trong khóa học này.", "warning");
        return;
    }

    const box = document.getElementById("pdf-remedial-output");
    if (box) {
        box.innerHTML = `<div class="p-4 rounded-2xl bg-slate-950 border border-rose-500/35 text-xs text-rose-200 font-bold animate-pulse">🧠 AI đang phân tích ${clusters.length} lỗ hổng kiến thức và tạo bộ bài tập khắc phục riêng cho bạn...</div>`;
    }

    const refNotes = (course.knowledgeMap?.chapters || []).flatMap(c => (c.topics || []).map(t => ({
        chapter: c.title,
        topic: t.title,
        summaryVi: t.summaryVi,
        keyPoints: t.keyPoints,
        pages: t.sourcePages
    }))).slice(0, 15);

    const res = await AIClient.request("pdf-remedial-drills", {
        courseTitle: course.title,
        weakTopics: clusters.slice(0, 5),
        referenceNotes: refNotes
    });

    if (!res || !res.ok || !res.data) {
        showToast("Không thể tạo bài tập khắc phục: " + (res?.error || "Vui lòng kiểm tra AI Backend."), "error");
        renderPdfStudioPage();
        return;
    }

    pdfStudioUi.activeRemedial = {
        id: `remset-${Date.now()}`,
        at: new Date().toISOString(),
        diagnosisVi: res.data.diagnosisVi || "",
        miniLessonVi: res.data.miniLessonVi || "",
        focusTopics: res.data.focusTopics || [],
        drills: (res.data.drills || []).map((d, i) => ({
            ...d,
            id: `rem-${Date.now()}-${i}`
        }))
    };
    course.progress.remedialHistory = course.progress.remedialHistory || [];
    course.progress.remedialHistory.unshift(pdfStudioUi.activeRemedial);
    course.progress.remedialHistory = course.progress.remedialHistory.slice(0, 10);
    savePdfStudioState();
    renderPdfStudioPage();
    showToast(`🎯 AI đã tạo ${pdfStudioUi.activeRemedial.drills.length} bài tập khắc phục đúng điểm yếu của bạn!`);
}

/* ==================== 12. FEATURE #3: COMPREHENSIVE CHAPTER / COURSE EXAM ==================== */
function startPdfComprehensiveExam(scopeChapter = "all") {
    const course = getActivePdfCourse();
    if (!course) return;

    const pool = [];
    const matchChapter = (ch) => scopeChapter === "all" || String(ch || "").toLowerCase() === scopeChapter.toLowerCase();

    // Pull Grammar exercises
    (course.skills.grammar || []).forEach(g => {
        if (!matchChapter(g.chapterTitle)) return;
        (g.exercises || []).forEach(ex => pool.push({ ...ex, skill: "grammar", chapterTitle: g.chapterTitle }));
    });
    // Pull Reading questions
    (course.skills.reading || []).forEach(r => {
        if (!matchChapter(r.chapterTitle)) return;
        (r.questions || []).forEach(q => pool.push({ ...q, skill: "reading", passageTitle: r.title, chapterTitle: r.chapterTitle }));
    });
    // Pull Listening questions
    (course.skills.listening || []).forEach(l => {
        if (!matchChapter(l.chapterTitle)) return;
        (l.questions || []).forEach(q => pool.push({ ...q, skill: "listening", chapterTitle: l.chapterTitle }));
    });
    // Synthesize Vocabulary MCQ from PDF vocabulary
    const allVocab = course.skills.vocabulary || [];
    const scopeVocab = allVocab.filter(v => matchChapter(v.chapterTitle));
    scopeVocab.slice(0, 8).forEach(v => {
        const distractors = allVocab
            .filter(o => o.id !== v.id && o.meaningVi !== v.meaningVi)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(o => o.meaningVi);
        if (distractors.length >= 2) {
            const opts = [v.meaningVi, ...distractors].sort(() => 0.5 - Math.random());
            pool.push({
                id: `exv-${v.id}`,
                skill: "vocabulary",
                type: "mcq",
                question: `Chọn nghĩa tiếng Việt đúng của từ "${v.term}" ${v.ipa ? `(${v.ipa})` : ""}:`,
                options: opts,
                answer: v.meaningVi,
                explanationVi: `Từ "${v.term}" nghĩa là "${v.meaningVi}". ${v.example ? `VD: ${v.example}` : ""}`,
                topicTag: `Từ vựng: ${v.chapterTitle || course.title}`,
                chapterTitle: v.chapterTitle || course.title,
                sourcePage: v.sourcePage || 1,
                sourceType: v.sourceType || "extracted_from_pdf"
            });
        }
    });

    if (!pool.length) {
        showToast("Phạm vi này chưa có đủ câu hỏi để tạo đề kiểm tra tổng hợp. Hãy chọn 'Toàn bộ khóa học' hoặc tạo thêm bài tập!", "warning");
        return;
    }

    const selected = pool.sort(() => 0.5 - Math.random()).slice(0, 15);
    pdfStudioUi.activeExam = {
        id: `exam-${Date.now()}`,
        scope: scopeChapter === "all" ? "Toàn bộ khóa học" : scopeChapter,
        questions: selected,
        answers: {},
        submitted: false,
        scorePct: 0,
        correctCount: 0,
        weakAreas: [],
        startedAt: new Date().toISOString()
    };
    pdfStudioUi.activeTab = "exam";
    renderPdfStudioPage();
    showToast(`📝 Đã tạo đề kiểm tra tổng hợp (${selected.length} câu) cho "${pdfStudioUi.activeExam.scope}"!`);
}

function submitPdfComprehensiveExam() {
    const course = getActivePdfCourse();
    const exam = pdfStudioUi.activeExam;
    if (!course || !exam || exam.submitted) return;

    let correct = 0;
    const weakMap = new Map();
    exam.questions.forEach(q => {
        const radio = document.querySelector(`input[name="pdf-exam-${q.id}"]:checked`);
        const inp = document.getElementById(`pdf-exam-input-${q.id}`);
        const ans = radio ? radio.value : (inp ? inp.value.trim() : "");
        const accepted = [q.answer, ...(q.acceptableAnswers || [])].map(normalizeAnswerStr).filter(Boolean);
        const ok = Boolean(ans) && accepted.includes(normalizeAnswerStr(ans));
        exam.answers[q.id] = { userAnswer: ans, isCorrect: ok };
        if (ok) {
            correct++;
        } else {
            const k = `${q.skill}: ${q.topicTag || q.chapterTitle}`;
            weakMap.set(k, (weakMap.get(k) || 0) + 1);
            recordPdfExerciseAttempt(course, q, ans || "(bỏ trống)", false, q.skill);
        }
    });

    exam.submitted = true;
    exam.correctCount = correct;
    exam.scorePct = Math.round((correct / exam.questions.length) * 100);
    exam.weakAreas = Array.from(weakMap.entries()).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
    exam.submittedAt = new Date().toISOString();

    course.progress.examHistory = course.progress.examHistory || [];
    course.progress.examHistory.unshift({
        id: exam.id,
        scope: exam.scope,
        correctCount: exam.correctCount,
        total: exam.questions.length,
        scorePct: exam.scorePct,
        weakAreas: exam.weakAreas,
        at: exam.submittedAt
    });
    course.progress.examHistory = course.progress.examHistory.slice(0, 20);
    savePdfStudioState();

    if (typeof logStudyMetrics === "function") {
        logStudyMetrics(
            { scoreEntry: { skill: "reading", scorePct: exam.scorePct, level: course.level || "B1", title: `PDF Exam: ${exam.scope}` } },
            { type: "pdf_exam", skill: "mixed", title: `Kiểm tra tổng hợp PDF (${exam.correctCount}/${exam.questions.length})`, scorePct: exam.scorePct }
        );
    }
    renderPdfStudioPage();
    showToast(`🎓 Hoàn thành đề kiểm tra tổng hợp: ${exam.correctCount}/${exam.questions.length} (${exam.scorePct}%)!`);
}

/* ==================== 13. FEATURE #4: VISUAL LESSON SUMMARY MIND MAP ("SƠ ĐỒ TÓM TẮT BÀI HỌC") ==================== */
function buildLocalMindMapFallback(course, scopeKey) {
    const chapters = scopeKey === "all"
        ? (course.knowledgeMap?.chapters || [])
        : (course.knowledgeMap?.chapters || []).filter(c => c.title === scopeKey);
    const branches = [];
    const colors = ["violet", "cyan", "emerald", "amber", "rose"];
    chapters.forEach((ch, idx) => {
        branches.push({
            id: `b-ch-${idx}`,
            title: ch.title,
            icon: "📘",
            color: colors[idx % colors.length],
            sourcePages: [ch.pageStart, ch.pageEnd],
            nodes: (ch.topics || []).map(t => ({
                label: t.title,
                detailVi: t.summaryVi || t.objectiveVi || (t.keyPoints || []).join("; "),
                example: (t.keyPoints || [])[0] || "",
                sourcePage: (t.sourcePages || [ch.pageStart])[0]
            }))
        });
    });
    if ((course.skills.vocabulary || []).length) {
        const scopedVocab = scopeKey === "all" ? course.skills.vocabulary : course.skills.vocabulary.filter(v => v.chapterTitle === scopeKey);
        if (scopedVocab.length) {
            branches.push({
                id: "b-vocab",
                title: `Từ vựng trọng tâm (${scopedVocab.length} từ)`,
                icon: "📖",
                color: "cyan",
                sourcePages: Array.from(new Set(scopedVocab.map(v => v.sourcePage))).slice(0, 5),
                nodes: scopedVocab.slice(0, 8).map(v => ({
                    label: `${v.term} ${v.ipa || ""}`.trim(),
                    detailVi: v.meaningVi,
                    example: v.example || "",
                    sourcePage: v.sourcePage
                }))
            });
        }
    }
    if ((course.skills.grammar || []).length) {
        const scopedGram = scopeKey === "all" ? course.skills.grammar : course.skills.grammar.filter(g => g.chapterTitle === scopeKey);
        if (scopedGram.length) {
            branches.push({
                id: "b-gram",
                title: `Ngữ pháp cốt lõi (${scopedGram.length} chủ điểm)`,
                icon: "🧩",
                color: "emerald",
                sourcePages: Array.from(new Set(scopedGram.map(g => g.sourcePage))).slice(0, 5),
                nodes: scopedGram.slice(0, 6).map(g => ({
                    label: g.title,
                    detailVi: g.ruleVi,
                    example: g.formula || (g.examples || [])[0] || "",
                    sourcePage: g.sourcePage
                }))
            });
        }
    }
    return {
        rootTitle: scopeKey === "all" ? course.title : scopeKey,
        subtitleVi: "Sơ đồ tóm tắt cấu trúc từ Bản đồ Kiến thức (Knowledge Map) của tài liệu PDF.",
        centralIdeaVi: course.descriptionVi || course.title,
        branches,
        keyTakeawaysVi: [
            `Tổng số chương: ${chapters.length}`,
            `Từ vựng trích xuất: ${(course.skills.vocabulary || []).length} từ • Ngữ pháp: ${(course.skills.grammar || []).length} điểm`,
            "Bấm trực tiếp vào số trang trên từng nhánh để đối chiếu tài liệu PDF gốc."
        ],
        quickReviewChecklist: chapters.slice(0, 4).map(c => `Đã nắm vững các chủ điểm trong "${c.title}"`)
    };
}

async function generatePdfLessonMindMap(scopeKey = "all") {
    const course = getActivePdfCourse();
    if (!course) return;
    const scopeTitle = scopeKey === "all" ? "Toàn bộ khóa học" : scopeKey;

    const outEl = document.getElementById("pdf-mindmap-canvas-wrap");
    if (outEl) {
        outEl.innerHTML = `<div class="p-6 rounded-2xl bg-slate-950 border border-cyan-500/35 text-xs text-cyan-300 font-bold animate-pulse text-center">🗺️ AI đang vẽ Sơ đồ tóm tắt bài học cho "${escHtml(scopeTitle)}"...</div>`;
    }

    const chapters = scopeKey === "all"
        ? (course.knowledgeMap?.chapters || [])
        : (course.knowledgeMap?.chapters || []).filter(c => c.title === scopeKey);
    const vocabSample = (course.skills.vocabulary || [])
        .filter(v => scopeKey === "all" || v.chapterTitle === scopeKey)
        .slice(0, 20)
        .map(v => ({ term: v.term, meaningVi: v.meaningVi, sourcePage: v.sourcePage }));
    const grammarSample = (course.skills.grammar || [])
        .filter(g => scopeKey === "all" || g.chapterTitle === scopeKey)
        .slice(0, 10)
        .map(g => ({ title: g.title, formula: g.formula, ruleVi: g.ruleVi, sourcePage: g.sourcePage }));

    const res = await AIClient.request("pdf-mindmap", {
        courseTitle: course.title,
        chapterTitle: scopeTitle,
        context: { chapters, vocabSample, grammarSample }
    });

    const mindMap = (res && res.ok && res.data && Array.isArray(res.data.branches) && res.data.branches.length)
        ? { ...res.data, generatedBy: res.provider || "AI", generatedAt: new Date().toISOString() }
        : { ...buildLocalMindMapFallback(course, scopeKey), generatedBy: "Bản đồ kiến thức cục bộ", generatedAt: new Date().toISOString() };

    course.mindMaps = course.mindMaps || {};
    course.mindMaps[scopeKey] = mindMap;
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
    showToast(`🗺️ Đã tạo xong Sơ đồ tóm tắt bài học "${scopeTitle}"!`);
}

function saveMindMapToNotebook(scopeKey = "all") {
    const course = getActivePdfCourse();
    const mm = course?.mindMaps?.[scopeKey];
    if (!mm) return;
    const lines = [
        `🗺️ SƠ ĐỒ TÓM TẮT: ${mm.rootTitle}`,
        mm.subtitleVi || "",
        "",
        ...(mm.branches || []).map(b =>
            `▸ ${b.icon || "•"} ${b.title} (Trang ${(b.sourcePages || []).join(", ") || "?"})\n` +
            (b.nodes || []).map(n => `   - ${n.label}: ${n.detailVi}${n.example ? ` (VD: ${n.example})` : ""} [Tr.${n.sourcePage || "?"}]`).join("\n")
        ),
        "",
        "📌 Điểm chốt cần nhớ:",
        ...(mm.keyTakeawaysVi || []).map(t => `• ${t}`)
    ].join("\n");

    if (typeof notebookItems !== "undefined" && typeof saveNotebook === "function") {
        notebookItems.unshift({
            id: `nb-mm-${Date.now()}`,
            type: "summary",
            title: `🗺️ Sơ đồ: ${mm.rootTitle}`,
            content: lines,
            tags: ["PDF Studio", "Sơ đồ tóm tắt", course.level || "B1"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        saveNotebook();
        showToast("📓 Đã lưu Sơ đồ tóm tắt vào English Notebook (đồng bộ Cloud)!");
    }
}

/* ==================== 14. FEATURE #1: "XEM NGUỒN PDF" SLIDE-OVER PAGE VIEWER ==================== */
async function openPdfSourcePage(docId, pageNumber = 1) {
    pdfStudioUi.drawerOpen = true;
    pdfStudioUi.drawerDocId = docId;
    pdfStudioUi.drawerPage = Math.max(1, Number(pageNumber) || 1);
    const drawer = document.getElementById("pdf-source-drawer");
    if (drawer) drawer.classList.remove("hidden");
    await renderPdfSourceDrawerCanvas();
}

function closePdfSourceDrawer() {
    pdfStudioUi.drawerOpen = false;
    document.getElementById("pdf-source-drawer")?.classList.add("hidden");
}

async function changePdfSourceDrawerPage(delta) {
    const doc = getPdfDocumentById(pdfStudioUi.drawerDocId);
    const maxP = doc?.pageCount || 999;
    pdfStudioUi.drawerPage = Math.max(1, Math.min(maxP, pdfStudioUi.drawerPage + delta));
    await renderPdfSourceDrawerCanvas();
}

async function zoomPdfSourceDrawer(delta) {
    pdfStudioUi.drawerZoom = Math.max(0.7, Math.min(2.2, Math.round((pdfStudioUi.drawerZoom + delta) * 100) / 100));
    await renderPdfSourceDrawerCanvas();
}

function togglePdfSourceTextMode() {
    pdfStudioUi.drawerShowText = !pdfStudioUi.drawerShowText;
    renderPdfSourceDrawerCanvas();
}

async function renderPdfSourceDrawerCanvas() {
    const doc = getPdfDocumentById(pdfStudioUi.drawerDocId);
    const titleEl = document.getElementById("pdf-drawer-title");
    const pageBadge = document.getElementById("pdf-drawer-page-badge");
    const canvasWrap = document.getElementById("pdf-drawer-canvas-wrap");
    const textWrap = document.getElementById("pdf-drawer-text-wrap");
    if (!canvasWrap || !textWrap) return;

    const pNum = Math.max(1, Number(pdfStudioUi.drawerPage) || 1);
    if (titleEl) titleEl.textContent = doc ? `📖 ${doc.fileName}` : "📖 Xem nguồn PDF gốc";
    if (pageBadge) pageBadge.textContent = `Trang ${pNum}${doc?.pageCount ? ` / ${doc.pageCount}` : ""}`;

    const excerpt = doc?.pageExcerpts?.[String(pNum)] || "";
    textWrap.innerHTML = excerpt
        ? `<div class="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed"><p class="text-[11px] font-extrabold text-cyan-300 mb-2">📝 Văn bản trích xuất từ Trang ${pNum}:</p>${escHtml(excerpt)}</div>`
        : `<div class="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs text-slate-400">Chưa có văn bản trích xuất lưu cho trang ${pNum}.</div>`;

    if (pdfStudioUi.drawerShowText) {
        canvasWrap.classList.add("hidden");
        textWrap.classList.remove("hidden");
        return;
    }

    canvasWrap.classList.remove("hidden");
    textWrap.classList.add("hidden");
    canvasWrap.innerHTML = `<div class="p-8 text-center text-xs text-cyan-300 animate-pulse">⏳ Đang kết xuất trang ${pNum} từ file PDF gốc...</div>`;

    try {
        const pdfDoc = await getLoadedPdfJsDocument(pdfStudioUi.drawerDocId);
        if (pdfDoc) {
            const safeP = Math.max(1, Math.min(pdfDoc.numPages, pNum));
            const page = await pdfDoc.getPage(safeP);
            const vp = page.getViewport({ scale: Math.max(0.8, pdfStudioUi.drawerZoom * 1.15) });
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(vp.width);
            canvas.height = Math.round(vp.height);
            canvas.className = "mx-auto rounded-xl shadow-2xl bg-white max-w-full h-auto";
            await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
            canvasWrap.innerHTML = "";
            canvasWrap.appendChild(canvas);
            return;
        }

        // Cloud Rendered Page Image Fallback (works 24/7 on Laptop & Phone even for >100MB textbooks!)
        if (doc && doc.cloudPagesPrefix && typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) {
            const padded = String(pNum).padStart(3, "0");
            const imgPath = `${doc.cloudPagesPrefix}/page-${padded}.jpg`;
            const cached = pdfSignedPageUrlCache.get(imgPath);
            let signedUrl = (cached && cached.expiresAt > Date.now()) ? cached.url : "";
            if (!signedUrl) {
                signedUrl = await CloudClient.getSignedStorageUrl(imgPath);
                if (signedUrl) {
                    pdfSignedPageUrlCache.set(imgPath, { url: signedUrl, expiresAt: Date.now() + 45 * 60 * 1000 });
                }
            }
            if (signedUrl) {
                const zoomPct = Math.round(Math.max(0.6, Math.min(2.0, pdfStudioUi.drawerZoom)) * 100);
                canvasWrap.innerHTML = `
                    <div class="flex flex-col items-center space-y-2">
                        <span class="text-[11px] font-bold text-emerald-300">☁️ Trang sách gốc độ nét cao (Trang ${pNum}) — Đồng bộ Cloud</span>
                        <div class="w-full overflow-x-auto flex justify-center">
                            <img src="${signedUrl}" alt="Trang ${pNum} - ${escHtml(doc.fileName)}" style="width:${zoomPct}%; max-width:none;" class="rounded-xl shadow-2xl bg-white border border-white/10" onerror="this.parentElement.innerHTML='<p class=\\'text-xs text-amber-300 p-4\\'>Trang ${pNum} nằm ngoài phạm vi ảnh sách đã đồng bộ (Trang ${doc.cloudPagesStart || 15}–${doc.cloudPagesEnd || 134}). Bấm nút Text / Trang để xem văn bản.</p>'">
                        </div>
                    </div>
                `;
                return;
            }
        }

        canvasWrap.innerHTML = `
            <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                <p class="font-extrabold">📱 Chưa có ảnh trang ${pNum} trên thiết bị này.</p>
                <p class="text-slate-300">Bạn vẫn có thể xem văn bản trích xuất của Trang ${pNum} bên dưới hoặc tải file PDF gốc lên thiết bị này.</p>
            </div>
            <div class="mt-3">${textWrap.innerHTML}</div>
        `;
    } catch (err) {
        canvasWrap.innerHTML = `<div class="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-200">Không thể hiển thị trang PDF: ${escHtml(err.message)}</div><div class="mt-3">${textWrap.innerHTML}</div>`;
    }
}

/* ==================== 15. MAIN UI RENDERER ==================== */
function setPdfStudioTab(tab) {
    pdfStudioUi.activeTab = tab;
    const course = getActivePdfCourse();
    if (course) {
        course.progress = course.progress || { completedIds: [], answers: {}, scores: {}, mistakes: [] };
        course.progress.lastTab = tab;
        savePdfStudioState();
    }
    renderPdfStudioPage();
}

function setPdfStudioFilter(field, val) {
    pdfStudioUi[field] = val;
    if (field === "filterChapter") {
        const course = getActivePdfCourse();
        if (course && course.progress) {
            course.progress.lastChapter = val;
            savePdfStudioState();
        }
    }
    renderPdfStudioPage();
}

function itemPassesPdfFilters(item, course, idForStatus = null) {
    if (pdfStudioUi.filterChapter !== "all" && String(item.chapterTitle || "").toLowerCase() !== pdfStudioUi.filterChapter.toLowerCase()) {
        return false;
    }
    if (pdfStudioUi.filterLevel !== "all" && String(item.level || course.level || "B1").toUpperCase() !== pdfStudioUi.filterLevel.toUpperCase()) {
        return false;
    }
    if (pdfStudioUi.filterPage && String(pdfStudioUi.filterPage).trim() !== "") {
        const wantPage = Number(pdfStudioUi.filterPage);
        if (Number.isFinite(wantPage) && Number(item.sourcePage) !== wantPage) return false;
    }
    if (pdfStudioUi.filterStatus !== "all" && idForStatus) {
        const isDone = (course.progress?.completedIds || []).includes(idForStatus);
        if (pdfStudioUi.filterStatus === "done" && !isDone) return false;
        if (pdfStudioUi.filterStatus === "todo" && isDone) return false;
    }
    return true;
}

function renderPdfProvenanceBadges(item, docId) {
    const isExtracted = item.sourceType === "extracted_from_pdf";
    const pageNum = Number(item.sourcePage) || 1;
    return `
        <div class="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
            <span class="px-2 py-0.5 rounded-full border ${isExtracted ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-violet-500/15 text-violet-300 border-violet-500/30"}">
                ${isExtracted ? "📄 Trích từ PDF" : "🤖 AI tạo từ PDF"}
            </span>
            ${item.needsReview ? `<span class="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">⚠️ Cần kiểm tra</span>` : ""}
            <button type="button" onclick="openPdfSourcePage('${escHtml(docId)}', ${pageNum})" class="px-2.5 py-0.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition">
                📖 Xem nguồn PDF (Trang ${pageNum})
            </button>
        </div>
    `;
}

function renderPdfInteractiveExerciseCard(ex, course, indexNum) {
    const saved = course.progress?.answers?.[ex.id];
    const isDone = (course.progress?.completedIds || []).includes(ex.id);
    const hasOptions = Array.isArray(ex.options) && ex.options.length > 0;
    const typeLabel = { mcq: "Trắc nghiệm", fill_blank: "Điền từ", error_correction: "Sửa lỗi sai", rewrite: "Viết lại câu", tfng: "True / False / Not Given", main_idea: "Ý chính" }[ex.type] || ex.type;

    return `
        <div class="p-4 rounded-2xl bg-slate-950/90 border ${saved ? (saved.isCorrect ? "border-emerald-500/40" : "border-rose-500/40") : "border-white/10"} space-y-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-extrabold">Câu ${indexNum} • ${escHtml(typeLabel)}</span>
                    ${ex.topicTag ? `<span class="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 text-[10px] font-bold">#${escHtml(ex.topicTag)}</span>` : ""}
                    ${isDone ? `<span class="text-[10px] font-extrabold text-emerald-400">✓ Đã đạt</span>` : ""}
                </div>
                ${renderPdfProvenanceBadges(ex, course.docId)}
            </div>

            <p class="text-xs md:text-sm font-bold text-white leading-relaxed">${escHtml(ex.question)}</p>

            ${hasOptions ? `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${ex.options.map((opt, oi) => {
                        const checked = saved && saved.userAnswer === opt ? "checked" : "";
                        return `
                            <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-violet-500/40 cursor-pointer text-xs text-slate-200 transition">
                                <input type="radio" name="pdf-ex-${ex.id}" value="${escHtml(opt)}" ${checked} class="accent-violet-500">
                                <span><strong class="text-slate-400 mr-1">${String.fromCharCode(65 + oi)}.</strong> ${escHtml(opt)}</span>
                            </label>
                        `;
                    }).join("")}
                </div>
            ` : `
                <input id="pdf-ex-input-${ex.id}" type="text" value="${escHtml(saved?.userAnswer || "")}" placeholder="Nhập câu trả lời của bạn..." class="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500">
            `}

            <div class="flex flex-wrap items-center gap-2">
                <button type="button" onclick="checkPdfSingleExercise('${ex.id}')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-extrabold shadow">
                    ✅ Kiểm tra đáp án
                </button>
                ${saved ? `<button type="button" onclick="resetPdfSingleExercise('${ex.id}')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold">🔄 Làm lại</button>` : ""}
            </div>

            ${saved ? `
                <div class="p-3 rounded-xl text-xs space-y-1 ${saved.isCorrect ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200" : "bg-rose-500/10 border border-rose-500/30 text-rose-200"}">
                    <p class="font-extrabold">${saved.isCorrect ? "🎉 Chính xác!" : `❌ Chưa đúng — Đáp án chuẩn: ${escHtml(ex.answer)}`}</p>
                    <p class="text-slate-200 leading-relaxed"><strong>Giải thích:</strong> ${escHtml(ex.explanationVi)}</p>
                    ${ex.evidenceQuote ? `<p class="text-[11px] text-cyan-300 italic">Dẫn chứng PDF: "${escHtml(ex.evidenceQuote)}"</p>` : ""}
                </div>
            ` : ""}
        </div>
    `;
}

function renderPdfMissingSkillNotice(skillLabel) {
    return `
        <div class="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/25 text-center space-y-2">
            <p class="text-sm font-extrabold text-amber-300">ℹ️ Chưa có dữ liệu ${escHtml(skillLabel)} trong phạm vi PDF đã phân tích</p>
            <p class="text-xs text-slate-400 max-w-xl mx-auto">Hệ thống tuân thủ nguyên tắc minh bạch: KHÔNG tự bịa nội dung rồi gán là có trong PDF. Nếu phần ${escHtml(skillLabel)} nằm ở các trang khác của sách, bạn hãy chọn dải trang đó ở phần Tài liệu phía trên rồi bấm Phân tích.</p>
        </div>
    `;
}

function handlePdfSpeakBtn(btn) {
    const txt = btn?.getAttribute("data-speak") || "";
    if (txt && typeof speakText === "function") speakText(txt);
}

function handlePdfChapterMindMap(chapterIdx) {
    const course = getActivePdfCourse();
    const ch = course?.knowledgeMap?.chapters?.[chapterIdx];
    if (!ch) return;
    pdfStudioUi.filterChapter = ch.title;
    setPdfStudioTab("mindmap");
    generatePdfLessonMindMap(ch.title);
}

function handlePdfChapterExam(chapterIdx) {
    const course = getActivePdfCourse();
    const ch = course?.knowledgeMap?.chapters?.[chapterIdx];
    if (!ch) return;
    startPdfComprehensiveExam(ch.title);
}

function handlePdfVocabMcqClick(vocabId, btn) {
    const course = getActivePdfCourse();
    const v = (course?.skills?.vocabulary || []).find(x => x.id === vocabId);
    if (!course || !v) return;
    const chosen = btn?.getAttribute("data-opt") || "";
    const exId = `vmcq-${v.id}`;
    const ok = normalizeAnswerStr(chosen) === normalizeAnswerStr(v.meaningVi);
    recordPdfExerciseAttempt(course, {
        id: exId,
        answer: v.meaningVi,
        question: v.term,
        topicTag: `Từ vựng: ${v.chapterTitle || course.title}`,
        chapterTitle: v.chapterTitle || course.title,
        sourcePage: v.sourcePage || 1
    }, chosen, ok, "vocabulary");
    renderPdfStudioPage();
}

function handlePdfVocabFillSubmit(vocabId) {
    const course = getActivePdfCourse();
    const v = (course?.skills?.vocabulary || []).find(x => x.id === vocabId);
    if (!course || !v) return;
    const exId = `vfill-${v.id}`;
    const vIn = (document.getElementById(`pdf-vfill-${exId}`)?.value || "").trim();
    if (!vIn) return;
    const ok = normalizeAnswerStr(vIn) === normalizeAnswerStr(v.term);
    recordPdfExerciseAttempt(course, {
        id: exId,
        answer: v.term,
        question: `Điền từ: ${v.meaningVi}`,
        topicTag: `Từ vựng: ${v.chapterTitle || course.title}`,
        chapterTitle: v.chapterTitle || course.title,
        sourcePage: v.sourcePage || 1
    }, vIn, ok, "vocabulary");
    renderPdfStudioPage();
}

function handleSaveActiveMindMap() {
    const scope = pdfStudioUi.filterChapter !== "all" ? pdfStudioUi.filterChapter : "all";
    saveMindMapToNotebook(scope);
}

function renderPdfCourseTabContent(course) {
    const tab = pdfStudioUi.activeTab;

    // 1. OVERVIEW & KNOWLEDGE MAP
    if (tab === "overview") {
        const km = course.knowledgeMap || { chapters: [], skillsAvailability: {} };
        const qa = course.qaReport || {};
        const skillBadges = [
            ["vocabulary", "📖 Vocabulary", (course.skills.vocabulary || []).length, "từ"],
            ["grammar", "📝 Grammar", (course.skills.grammar || []).length, "chủ điểm"],
            ["reading", "📄 Reading", (course.skills.reading || []).length, "bài đọc"],
            ["listening", "🎧 Listening", (course.skills.listening || []).length, "bài nghe"],
            ["writing", "✍️ Writing", (course.skills.writing || []).length, "bài viết"],
            ["speaking", "🎙️ Speaking", (course.skills.speaking || []).length, "tình huống"]
        ];
        const totalExCount =
            (course.skills.vocabulary || []).length +
            (course.skills.grammar || []).reduce((s, g) => s + (g.exercises?.length || 0), 0) +
            (course.skills.reading || []).reduce((s, r) => s + (r.questions?.length || 0), 0) +
            (course.skills.listening || []).reduce((s, l) => s + (l.questions?.length || 0), 0) +
            (course.skills.writing || []).length +
            (course.skills.speaking || []).length;
        const doneCount = (course.progress?.completedIds || []).length;
        const pct = totalExCount > 0 ? Math.min(100, Math.round((doneCount / totalExCount) * 100)) : 0;

        return `
            <div class="space-y-5">
                <!-- Preview / Publish Banner -->
                <div class="p-4 rounded-2xl border ${course.published ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"} flex flex-wrap items-center justify-between gap-3">
                    <div class="text-xs">
                        <span class="font-extrabold ${course.published ? "text-emerald-300" : "text-amber-300"}">
                            ${course.published ? "✅ Khóa học đã xuất bản & đồng bộ Cloud" : "👀 Chế độ Xem Trước Khóa Học (Chưa xuất bản)"}
                        </span>
                        <p class="text-slate-300 mt-0.5">Nguồn: <strong>${escHtml(course.fileName)}</strong> (Trang ${course.analyzedRange?.start || 1}–${course.analyzedRange?.end || 1}/${course.analyzedRange?.totalPages || "?"}) • AI: ${escHtml(course.provider || "Gemini")} • Tiến độ: <strong class="text-cyan-300">${doneCount}/${totalExCount} (${pct}%)</strong></p>
                    </div>
                    <div class="flex flex-wrap gap-2 text-xs">
                        ${!course.published ? `<button onclick="publishPdfCourse('${course.id}', false)" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold">🚀 Xuất bản</button>` : ""}
                        <button onclick="publishPdfCourse('${course.id}', true)" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold">▶ Học ngay</button>
                        <button onclick="toggleEditPdfCourse()" class="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold">✏️ Chỉnh sửa</button>
                        <button onclick="regeneratePdfCourseExercises('grammar')" class="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold">♻️ Tạo lại / Thêm bài tập</button>
                        <button onclick="deletePdfCourse('${course.id}')" class="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold">🗑️ Xóa</button>
                    </div>
                </div>

                ${pdfStudioUi.editCourseMode ? `
                    <div class="p-4 rounded-2xl bg-slate-950 border border-violet-500/35 space-y-3 text-xs">
                        <p class="font-extrabold text-violet-300">✏️ Chỉnh sửa thông tin khóa học</p>
                        <div class="grid sm:grid-cols-3 gap-2.5">
                            <input id="pdf-edit-title" type="text" value="${escHtml(course.title)}" class="sm:col-span-2 bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-bold">
                            <select id="pdf-edit-level" class="bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-cyan-300 font-bold">
                                ${["A1", "A2", "B1", "B2", "C1", "C2"].map(lv => `<option value="${lv}" ${course.level === lv ? "selected" : ""}>Level ${lv}</option>`).join("")}
                            </select>
                        </div>
                        <textarea id="pdf-edit-desc" rows="2" class="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-slate-200">${escHtml(course.descriptionVi || "")}</textarea>
                        <div class="flex gap-2">
                            <button onclick="saveEditedPdfCourseMeta()" class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold">💾 Lưu thay đổi</button>
                            <button onclick="toggleEditPdfCourse()" class="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold">Hủy</button>
                        </div>
                    </div>
                ` : ""}

                <!-- Skill Coverage Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    ${skillBadges.map(([key, label, count, unit]) => `
                        <button onclick="setPdfStudioTab('${key}')" class="p-3 rounded-2xl text-left border transition ${count > 0 ? "bg-slate-950/90 border-white/10 hover:border-violet-400/50" : "bg-slate-950/40 border-white/5 opacity-60"}">
                            <p class="text-xs font-extrabold text-white">${label}</p>
                            <p class="text-lg font-black ${count > 0 ? "text-cyan-300" : "text-slate-500"} mt-1">${count} <span class="text-[10px] font-bold">${unit}</span></p>
                            <p class="text-[10px] ${count > 0 ? "text-emerald-400" : "text-amber-400"} mt-0.5">${count > 0 ? "Sẵn sàng học →" : "Chưa có trong PDF"}</p>
                        </button>
                    `).join("")}
                </div>

                <!-- Quality Assurance Audit Summary -->
                <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><p class="text-[10px] text-slate-400">Trang đã phân tích</p><p class="font-black text-white text-base">${qa.pagesProcessed || 0} trang ${course.ocrPagesCount ? `<span class="text-[10px] text-cyan-300">(${course.ocrPagesCount} OCR)</span>` : ""}</p></div>
                    <div><p class="text-[10px] text-slate-400">Nguồn gốc bài tập</p><p class="font-bold text-emerald-300">📄 ${qa.extractedCount || 0} trích PDF • <span class="text-violet-300">🤖 ${qa.aiGeneratedCount || 0} AI tạo</span></p></div>
                    <div><p class="text-[10px] text-slate-400">Chống trùng lặp QA</p><p class="font-bold text-cyan-300">Đã lọc ${qa.duplicatesRemoved || 0} câu trùng</p></div>
                    <div><p class="text-[10px] text-slate-400">Mục cần kiểm tra</p><p class="font-bold ${qa.flaggedNeedsReview ? "text-amber-300" : "text-emerald-300"}">${qa.flaggedNeedsReview || 0} mục</p></div>
                </div>

                <!-- KNOWLEDGE MAP (PDF -> Chapters -> Topics -> Knowledge -> Skills -> Exercises) -->
                <div class="space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h4 class="text-sm font-extrabold text-white">🧭 Bản Đồ Kiến Thức (Knowledge Map)</h4>
                            <p class="text-[11px] text-slate-400">PDF → Chương → Chủ đề → Kiến thức → Kỹ năng → Bài tập (đối chiếu trực tiếp trang gốc)</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="setPdfStudioTab('mindmap')" class="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">🗺️ Xem Sơ đồ tóm tắt</button>
                            <button onclick="startPdfComprehensiveExam('all')" class="px-3 py-1.5 rounded-xl bg-violet-600/25 border border-violet-500/40 text-violet-200 text-xs font-bold">🎓 Kiểm tra tổng hợp</button>
                        </div>
                    </div>

                    ${(km.chapters || []).map((ch, idx) => `
                        <div class="p-4 rounded-2xl bg-slate-950/85 border border-white/10 space-y-3">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="px-2.5 py-0.5 rounded-full bg-violet-600/30 text-violet-200 text-[11px] font-extrabold">Module ${idx + 1}</span>
                                    <h5 class="text-sm font-extrabold text-white">${escHtml(ch.title)}</h5>
                                    <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${ch.pageStart || 1})" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">📖 Trang ${ch.pageStart || 1}–${ch.pageEnd || ch.pageStart || 1}</button>
                                </div>
                                <div class="flex gap-1.5 text-[11px]">
                                    <button onclick="handlePdfChapterMindMap(${idx})" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 font-bold">🗺️ Sơ đồ chương</button>
                                    <button onclick="handlePdfChapterExam(${idx})" class="px-2.5 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-200 font-bold">📝 Test chương</button>
                                </div>
                            </div>
                            <div class="grid md:grid-cols-2 gap-2.5">
                                ${(ch.topics || []).map(t => `
                                    <div class="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5 text-xs">
                                        <div class="flex items-center justify-between gap-2">
                                            <span class="font-extrabold text-white">${escHtml(t.title)}</span>
                                            <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${(t.sourcePages || [ch.pageStart || 1])[0]})" class="text-[10px] text-cyan-300 hover:underline shrink-0">Tr.${(t.sourcePages || [ch.pageStart || 1]).join(",")}</button>
                                        </div>
                                        ${t.objectiveVi ? `<p class="text-[11px] text-emerald-300">🎯 ${escHtml(t.objectiveVi)}</p>` : ""}
                                        ${t.summaryVi ? `<p class="text-[11px] text-slate-300 leading-relaxed">${escHtml(t.summaryVi)}</p>` : ""}
                                        ${(t.keyPoints || []).length ? `<ul class="list-disc pl-4 text-[11px] text-slate-400 space-y-0.5">${t.keyPoints.slice(0, 4).map(kp => `<li>${escHtml(kp)}</li>`).join("")}</ul>` : ""}
                                        ${(t.visualOrTableNotes || []).length ? `<p class="text-[10px] text-amber-300">📊 Bảng/Hình PDF: ${escHtml(t.visualOrTableNotes.join(" • "))}</p>` : ""}
                                        <div class="flex flex-wrap gap-1 pt-1">
                                            ${(t.skills || []).map(sk => `<button onclick="setPdfStudioTab('${escHtml(sk)}')" class="px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 text-[10px] font-bold uppercase">${escHtml(sk)}</button>`).join("")}
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    // 2. VOCABULARY TAB (Flashcards, Match, MCQ, Fill + Push to Main SRS)
    if (tab === "vocabulary") {
        const list = (course.skills.vocabulary || []).filter(v => itemPassesPdfFilters(v, course, v.id));
        if (!(course.skills.vocabulary || []).length) return renderPdfMissingSkillNotice("Vocabulary");
        if (!list.length) return `<div class="p-6 text-center text-xs text-slate-400">Không có từ vựng nào khớp bộ lọc hiện tại.</div>`;

        const mode = pdfStudioUi.vocabMode || "flashcards";
        let modeBody = "";

        if (mode === "flashcards") {
            const idx = pdfStudioUi.vocabCardIdx % list.length;
            const cur = list[idx];
            const isRem = (course.progress?.completedIds || []).includes(cur.id);
            modeBody = `
                <div class="max-w-xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-violet-500/35 text-center space-y-4 shadow-xl">
                    <div class="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Thẻ ${idx + 1} / ${list.length} ${isRem ? "• <strong class='text-emerald-400'>✓ Đã nhớ</strong>" : ""}</span>
                        ${renderPdfProvenanceBadges(cur, course.docId)}
                    </div>
                    <div onclick="pdfStudioUi.vocabFlipped = !pdfStudioUi.vocabFlipped; renderPdfStudioPage();" class="cursor-pointer py-6 px-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2.5">
                        <p class="text-2xl font-black text-white">${escHtml(cur.term)}</p>
                        <p class="text-xs text-cyan-300 font-mono">${escHtml(cur.ipa || "")} ${cur.pos ? `(${escHtml(cur.pos)})` : ""} • ${escHtml(cur.level || course.level)}</p>
                        ${pdfStudioUi.vocabFlipped ? `
                            <div class="pt-3 border-t border-white/10 space-y-2 text-left">
                                <p class="text-base font-extrabold text-emerald-300 text-center">${escHtml(cur.meaningVi)}</p>
                                ${cur.example ? `<p class="text-xs text-slate-200 italic">💬 "${escHtml(cur.example)}"</p>` : ""}
                                ${(cur.collocations || []).length ? `<p class="text-[11px] text-violet-300"><strong>Collocations:</strong> ${escHtml(cur.collocations.join(", "))}</p>` : ""}
                                ${(cur.synonyms || []).length ? `<p class="text-[11px] text-cyan-300"><strong>Synonyms:</strong> ${escHtml(cur.synonyms.join(", "))}</p>` : ""}
                            </div>
                        ` : `<p class="text-[11px] text-slate-500 pt-2">👆 Bấm vào thẻ để lật xem nghĩa tiếng Việt, ví dụ & collocations</p>`}
                    </div>
                    <div class="flex flex-wrap justify-center gap-2 text-xs">
                        <button data-speak="${escHtml(cur.term)}" onclick="handlePdfSpeakBtn(this)" class="px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">🔊 Nghe phát âm</button>
                        <button onclick="markPdfVocabRemembered('${cur.id}', false)" class="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold">❌ Chưa nhớ</button>
                        <button onclick="markPdfVocabRemembered('${cur.id}', true)" class="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold">✅ Đã nhớ</button>
                        <button onclick="pushPdfVocabToMainSRS('${cur.id}')" class="px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-200 font-bold">+ Lưu SRS</button>
                    </div>
                </div>
            `;
        } else if (mode === "match") {
            const slice = list.slice(0, 6);
            if (!pdfStudioUi.vocabMatchState || pdfStudioUi.vocabMatchState.seed !== slice.map(x => x.id).join(",")) {
                pdfStudioUi.vocabMatchState = {
                    seed: slice.map(x => x.id).join(","),
                    terms: [...slice],
                    defs: [...slice].sort(() => 0.5 - Math.random()),
                    matched: [],
                    selTerm: null,
                    selDef: null,
                    wrongCount: 0
                };
            }
            const st = pdfStudioUi.vocabMatchState;
            modeBody = `
                <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-3">
                    <div class="flex items-center justify-between text-xs">
                        <span class="font-extrabold text-white">🔗 Ghép Từ tiếng Anh với Nghĩa tiếng Việt (${st.matched.length}/${st.terms.length})</span>
                        <button onclick="pdfStudioUi.vocabMatchState = null; renderPdfStudioPage();" class="text-cyan-300 font-bold hover:underline">🔄 Xáo trộn lại</button>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div class="space-y-2">
                            ${st.terms.map(t => {
                                const m = st.matched.includes(t.id);
                                const sel = st.selTerm === t.id;
                                return `<button onclick="selectPdfMatchItem('term','${t.id}')" class="w-full p-3 rounded-xl border text-left font-bold transition ${m ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 opacity-60" : sel ? "bg-violet-600/35 border-violet-400 text-white" : "bg-slate-900 border-white/10 text-white hover:border-cyan-400/50"}">${m ? "✓ " : ""}${escHtml(t.term)}</button>`;
                            }).join("")}
                        </div>
                        <div class="space-y-2">
                            ${st.defs.map(d => {
                                const m = st.matched.includes(d.id);
                                const sel = st.selDef === d.id;
                                return `<button onclick="selectPdfMatchItem('def','${d.id}')" class="w-full p-3 rounded-xl border text-left transition ${m ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 opacity-60" : sel ? "bg-cyan-600/35 border-cyan-400 text-white" : "bg-slate-900 border-white/10 text-slate-200 hover:border-cyan-400/50"}">${m ? "✓ " : ""}${escHtml(d.meaningVi)}</button>`;
                            }).join("")}
                        </div>
                    </div>
                </div>
            `;
        } else if (mode === "mcq" || mode === "fill") {
            const allV = course.skills.vocabulary || [];
            modeBody = `<div class="space-y-3">${list.slice(0, 12).map((v, idx) => {
                const exId = `v${mode}-${v.id}`;
                const saved = course.progress?.answers?.[exId];
                if (mode === "mcq") {
                    const dist = allV.filter(o => o.id !== v.id && o.meaningVi !== v.meaningVi).slice(0, 3).map(o => o.meaningVi);
                    const opts = Array.from(new Set([v.meaningVi, ...dist])).sort();
                    return `
                        <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2.5 text-xs">
                            <div class="flex justify-between items-center flex-wrap gap-2">
                                <span class="font-extrabold text-white">${idx + 1}. Nghĩa của "${escHtml(v.term)}" ${escHtml(v.ipa || "")} là gì?</span>
                                ${renderPdfProvenanceBadges(v, course.docId)}
                            </div>
                            <div class="grid sm:grid-cols-2 gap-2">
                                ${opts.map(opt => `
                                    <button data-opt="${escHtml(opt)}" onclick="handlePdfVocabMcqClick('${v.id}', this)" class="p-2.5 rounded-xl border text-left transition ${saved ? (opt === v.meaningVi ? "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold" : saved.userAnswer === opt ? "bg-rose-500/20 border-rose-500 text-rose-200" : "bg-slate-900 border-white/5 text-slate-400") : "bg-slate-900 border-white/10 hover:border-violet-400 text-slate-200"}">${escHtml(opt)}</button>
                                `).join("")}
                            </div>
                        </div>
                    `;
                }
                const masked = v.example
                    ? v.example.replace(new RegExp(v.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "_______")
                    : `Điền từ tiếng Anh có nghĩa là "${v.meaningVi}": _______`;
                return `
                    <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2.5 text-xs">
                        <div class="flex justify-between items-center flex-wrap gap-2">
                            <span class="font-extrabold text-white">${idx + 1}. Điền từ vào câu (${escHtml(v.meaningVi)})</span>
                            ${renderPdfProvenanceBadges(v, course.docId)}
                        </div>
                        <p class="text-slate-200 italic">${escHtml(masked)}</p>
                        <div class="flex gap-2">
                            <input id="pdf-vfill-${exId}" type="text" value="${escHtml(saved?.userAnswer || "")}" placeholder="Gõ từ tiếng Anh..." class="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white">
                            <button onclick="handlePdfVocabFillSubmit('${v.id}')" class="px-3.5 py-2 rounded-xl bg-violet-600 text-white font-extrabold">Kiểm tra</button>
                        </div>
                        ${saved ? `<p class="font-bold ${saved.isCorrect ? "text-emerald-300" : "text-rose-300"}">${saved.isCorrect ? "✅ Chính xác!" : `❌ Đáp án: ${escHtml(v.term)}`}</p>` : ""}
                    </div>
                `;
            }).join("")}</div>`;
        }

        return `
            <div class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex flex-wrap gap-1.5 text-xs">
                        ${[["flashcards", "🃏 Flashcards"], ["match", "🔗 Ghép từ–nghĩa"], ["mcq", "🎯 Trắc nghiệm"], ["fill", "✍️ Điền vào câu"]].map(([k, lbl]) => `
                            <button onclick="pdfStudioUi.vocabMode='${k}'; renderPdfStudioPage();" class="px-3 py-1.5 rounded-xl font-bold border transition ${mode === k ? "bg-violet-600 text-white border-violet-400" : "bg-slate-950 text-slate-300 border-white/10 hover:text-white"}">${lbl}</button>
                        `).join("")}
                    </div>
                    <button onclick="pushPdfVocabToMainSRS()" class="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-extrabold">
                        ➕ Đẩy tất cả (${list.length} từ) vào Kho Từ Vựng SRS QEnglish
                    </button>
                </div>
                ${modeBody}
                <!-- Full Vocab Table -->
                <div class="p-4 rounded-2xl bg-slate-950/75 border border-white/10 space-y-2">
                    <p class="text-xs font-extrabold text-slate-300">📚 Toàn bộ từ vựng đã trích xuất (${list.length} từ)</p>
                    <div class="grid sm:grid-cols-2 gap-2">
                        ${list.map(v => `
                            <div class="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs space-y-1">
                                <div class="flex items-center justify-between gap-2">
                                    <button data-speak="${escHtml(v.term)}" onclick="handlePdfSpeakBtn(this)" class="font-extrabold text-white hover:text-cyan-300 text-left">🔊 ${escHtml(v.term)} <span class="text-cyan-300 font-mono text-[10px]">${escHtml(v.ipa || "")}</span></button>
                                    <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${v.sourcePage || 1})" class="text-[10px] text-cyan-400 hover:underline">Tr.${v.sourcePage || 1}</button>
                                </div>
                                <p class="text-emerald-300 font-semibold">${escHtml(v.meaningVi)}</p>
                                ${v.example ? `<p class="text-[11px] text-slate-400 italic">${escHtml(v.example)}</p>` : ""}
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    // 3. GRAMMAR TAB
    if (tab === "grammar") {
        const list = (course.skills.grammar || []).filter(g => itemPassesPdfFilters(g, course));
        if (!(course.skills.grammar || []).length) return renderPdfMissingSkillNotice("Grammar");
        if (!list.length) return `<div class="p-6 text-center text-xs text-slate-400">Không có điểm ngữ pháp nào khớp bộ lọc.</div>`;
        return `
            <div class="space-y-5">
                ${list.map((g, gi) => `
                    <div class="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
                        <div class="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <span class="text-[10px] font-extrabold text-violet-300 uppercase">${escHtml(g.chapterTitle || "Grammar")} • ${escHtml(g.level || course.level)}</span>
                                <h4 class="text-base font-extrabold text-white mt-0.5">${gi + 1}. ${escHtml(g.title)}</h4>
                            </div>
                            <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${g.sourcePage || 1})" class="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">📖 Xem nguồn PDF (Trang ${g.sourcePage || 1})</button>
                        </div>
                        ${g.formula ? `<div class="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 font-mono text-xs text-violet-200 font-bold">📐 Công thức: ${escHtml(g.formula)}</div>` : ""}
                        ${g.ruleVi ? `<p class="text-xs md:text-sm text-slate-200 leading-relaxed">${escHtml(g.ruleVi)}</p>` : ""}
                        ${(g.examples || []).length ? `<div class="p-3 rounded-xl bg-slate-950/75 border border-white/5 text-xs space-y-1"><p class="font-bold text-cyan-300">Ví dụ minh họa:</p>${g.examples.map(ex => `<p class="text-slate-200">• ${escHtml(ex)}</p>`).join("")}</div>` : ""}
                        ${(g.commonMistakesVi || []).length ? `<div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">⚠️ <strong>Lỗi thường gặp:</strong> ${escHtml(g.commonMistakesVi.join(" • "))}</div>` : ""}
                        <div class="space-y-3 pt-1">
                            ${(g.exercises || []).filter(ex => itemPassesPdfFilters({ ...ex, chapterTitle: g.chapterTitle, level: g.level }, course, ex.id)).map((ex, ei) => renderPdfInteractiveExerciseCard(ex, course, ei + 1)).join("")}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // 4. READING TAB
    if (tab === "reading") {
        const list = (course.skills.reading || []).filter(r => itemPassesPdfFilters(r, course));
        if (!(course.skills.reading || []).length) return renderPdfMissingSkillNotice("Reading");
        if (!list.length) return `<div class="p-6 text-center text-xs text-slate-400">Không có bài đọc nào khớp bộ lọc.</div>`;
        return `
            <div class="space-y-5">
                ${list.map((r, ri) => `
                    <div class="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <span class="text-[10px] font-extrabold text-cyan-300 uppercase">${escHtml(r.chapterTitle || "Reading")} • ${escHtml(r.level || course.level)}</span>
                                <h4 class="text-base font-extrabold text-white">${ri + 1}. ${escHtml(r.title)}</h4>
                            </div>
                            <div class="flex gap-2">
                                <button data-speak="${escHtml((r.passage || "").slice(0, 600))}" onclick="handlePdfSpeakBtn(this)" class="px-3 py-1 rounded-full bg-white/5 text-slate-200 border border-white/10 text-[11px] font-bold">🔊 Đọc đoạn văn</button>
                                <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${r.sourcePage || 1})" class="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">📖 Xem nguồn PDF (Trang ${r.sourcePage || 1})</button>
                            </div>
                        </div>
                        <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">${escHtml(r.passage)}</div>
                        <div class="space-y-3">
                            ${(r.questions || []).map((q, qi) => renderPdfInteractiveExerciseCard(q, course, qi + 1)).join("")}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // 5. LISTENING TAB (Strict honesty: real Cloud/local MP3 audio vs transcript-only!)
    if (tab === "listening") {
        const list = (course.skills.listening || []).filter(l => itemPassesPdfFilters(l, course));
        if (!(course.skills.listening || []).length) return renderPdfMissingSkillNotice("Listening");
        if (!list.length) return `<div class="p-6 text-center text-xs text-slate-400">Không có bài nghe nào khớp bộ lọc.</div>`;
        return `
            <div class="space-y-5">
                ${list.map((l, li) => {
                    const audioKey = (l.suggestedAudioFile || "").toLowerCase();
                    const blobUrl = audioKey ? pdfCompanionAudioUrls.get(audioKey) : null;
                    const cloudPath = String(l.audioStoragePath || "").trim();
                    const hasRealAudio = Boolean(blobUrl || cloudPath);
                    const audioElId = `pdf-audio-${l.id}`;
                    return `
                        <div class="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <span class="text-[10px] font-extrabold text-cyan-300 uppercase">${escHtml(l.chapterTitle || "Listening")} • ${escHtml(l.level || course.level)}</span>
                                    <h4 class="text-base font-extrabold text-white">${li + 1}. ${escHtml(l.title)}</h4>
                                </div>
                                <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${l.sourcePage || 1})" class="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">📖 Xem nguồn PDF (Trang ${l.sourcePage || 1})</button>
                            </div>

                            ${hasRealAudio ? `
                                <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 space-y-2.5">
                                    <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                                        <span class="font-extrabold text-emerald-300">🎧 Audio bản xứ gốc: <code class="text-white">${escHtml(l.suggestedAudioFile || "Audio MP3")}</code></span>
                                        <span class="pdf-audio-status text-[11px] font-bold text-cyan-300">${blobUrl ? "✅ Sẵn sàng phát giọng bản xứ" : "⏳ Đang nạp audio từ Cloud..."}</span>
                                    </div>
                                    <audio id="${audioElId}" controls preload="metadata" ${blobUrl ? `src="${blobUrl}"` : `data-audio-storage-path="${escHtml(cloudPath)}"`} class="w-full h-10"></audio>
                                    <div class="flex flex-wrap items-center gap-1.5 text-[11px]">
                                        <button type="button" onclick="rewindPdfAudio('${audioElId}', -5)" class="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-white/10 text-slate-200 font-bold">⏪ -5 giây</button>
                                        <button type="button" onclick="setPdfAudioRate('${audioElId}', 0.75)" class="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-white/10 text-cyan-300 font-bold">0.75x (Chậm)</button>
                                        <button type="button" onclick="setPdfAudioRate('${audioElId}', 1.0)" class="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-white/10 text-emerald-300 font-bold">1.0x (Chuẩn)</button>
                                        <button type="button" onclick="setPdfAudioRate('${audioElId}', 1.25)" class="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-white/10 text-violet-300 font-bold">1.25x (Nhanh)</button>
                                    </div>
                                </div>
                            ` : `
                                <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <div>
                                        <p class="font-extrabold text-amber-300">📝 Bài tập dựa trên Transcript trong PDF (chưa đính kèm file MP3)</p>
                                        <p class="text-slate-300 mt-0.5">Hỗ trợ đọc tách giọng từng nhân vật bằng TTS hoặc bấm <strong>🎧 Đính kèm Audio MP3</strong> ở trên để nghe file gốc.</p>
                                    </div>
                                    <button data-speak="${escHtml((l.transcript || "").slice(0, 1400))}" onclick="speakPdfDialogueMultiVoice(this)" class="px-3.5 py-2 rounded-xl bg-cyan-600 text-white font-extrabold shrink-0">🔊 Nghe tách giọng TTS</button>
                                </div>
                            `}

                            ${l.transcript ? `
                                <details class="p-3.5 rounded-2xl bg-slate-950/85 border border-white/10 text-xs">
                                    <summary class="cursor-pointer font-bold text-slate-300">📜 Xem / Ẩn Transcript gốc từ PDF</summary>
                                    <p class="mt-2.5 text-slate-200 whitespace-pre-wrap leading-relaxed">${escHtml(l.transcript)}</p>
                                </details>
                            ` : ""}

                            <div class="space-y-3">
                                ${(l.questions || []).map((q, qi) => renderPdfInteractiveExerciseCard(q, course, qi + 1)).join("")}
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    // 6. WRITING TAB
    if (tab === "writing") {
        const list = (course.skills.writing || []).filter(w => itemPassesPdfFilters(w, course, w.id));
        if (!(course.skills.writing || []).length) return renderPdfMissingSkillNotice("Writing");
        if (!list.length) return `<div class="p-6 text-center text-xs text-slate-400">Không có bài viết nào khớp bộ lọc.</div>`;
        return `
            <div class="space-y-5">
                ${list.map((w, wi) => {
                    const saved = course.progress?.answers?.[w.id];
                    return `
                        <div class="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-3.5">
                            <div class="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <span class="text-[10px] font-extrabold text-violet-300 uppercase">${escHtml(w.chapterTitle || "Writing")} • ${escHtml(w.taskType)} • ${escHtml(w.level || course.level)}</span>
                                    <h4 class="text-base font-extrabold text-white">${wi + 1}. ${escHtml(w.title)}</h4>
                                </div>
                                ${renderPdfProvenanceBadges(w, course.docId)}
                            </div>
                            ${w.promptVi ? `<p class="text-xs md:text-sm text-slate-200">${escHtml(w.promptVi)}</p>` : ""}
                            ${w.promptEn ? `<p class="text-xs text-cyan-200 italic bg-slate-950/75 p-3 rounded-xl border border-white/5">${escHtml(w.promptEn)}</p>` : ""}
                            ${w.sourceTextVi ? `<div class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-100"><strong>Đoạn tiếng Việt cần dịch:</strong> ${escHtml(w.sourceTextVi)}</div>` : ""}
                            ${(w.targetStructures || []).length || (w.keyVocab || []).length ? `
                                <div class="flex flex-wrap gap-1.5 text-[11px]">
                                    ${(w.targetStructures || []).map(s => `<span class="px-2 py-0.5 rounded-lg bg-violet-500/15 text-violet-300 font-bold">📐 ${escHtml(s)}</span>`).join("")}
                                    ${(w.keyVocab || []).map(v => `<span class="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 font-bold">📖 ${escHtml(v)}</span>`).join("")}
                                </div>
                            ` : ""}
                            <textarea id="pdf-open-input-${w.id}" rows="4" placeholder="Nhập bài viết tiếng Anh của bạn tại đây..." class="w-full bg-slate-950 border border-white/15 rounded-2xl p-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-violet-500">${escHtml(saved?.userAnswer || "")}</textarea>
                            <button onclick="submitPdfOpenResponse('${w.id}', 'writing')" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-extrabold shadow-lg">🤖 Nộp bài & AI Chấm Thang 10</button>
                            <div id="pdf-open-result-${w.id}" class="${saved?.report ? "" : "hidden"}">
                                ${saved?.report ? renderPdfOpenGradeReport(saved.report, saved.provider) : ""}
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    // 7. SPEAKING TAB
    if (tab === "speaking") {
        const list = (course.skills.speaking || []).filter(s => itemPassesPdfFilters(s, course, s.id));
        if (!(course.skills.speaking || []).length) return renderPdfMissingSkillNotice("Speaking");
        if (!list.length) return `<div class="p-6 text-center text-xs text-slate-400">Không có bài nói nào khớp bộ lọc.</div>`;
        return `
            <div class="space-y-5">
                ${list.map((sp, si) => {
                    const saved = course.progress?.answers?.[sp.id];
                    return `
                        <div class="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-3.5">
                            <div class="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <span class="text-[10px] font-extrabold text-emerald-300 uppercase">${escHtml(sp.chapterTitle || "Speaking")} • ${escHtml(sp.taskType)}</span>
                                    <h4 class="text-base font-extrabold text-white">${si + 1}. ${escHtml(sp.title)}</h4>
                                </div>
                                ${renderPdfProvenanceBadges(sp, course.docId)}
                            </div>
                            ${sp.scenarioVi ? `<p class="text-xs md:text-sm text-slate-200">${escHtml(sp.scenarioVi)}</p>` : ""}
                            ${(sp.dialogueLines || []).length ? `
                                <div class="p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-1.5 text-xs">
                                    <p class="font-bold text-cyan-300">💬 Hội thoại mẫu trong PDF:</p>
                                    ${sp.dialogueLines.map(dl => `<p class="text-slate-200"><strong class="text-violet-300">${escHtml(dl.speaker || "Speaker")}:</strong> ${escHtml(dl.text || "")} <button data-speak="${escHtml(dl.text || "")}" onclick="handlePdfSpeakBtn(this)" class="ml-1 text-cyan-400 hover:underline">🔊</button></p>`).join("")}
                                </div>
                            ` : ""}
                            ${(sp.questions || []).length ? `
                                <div class="space-y-1 text-xs">
                                    <p class="font-bold text-emerald-300">🎤 Câu hỏi luyện nói / phản xạ:</p>
                                    ${sp.questions.map((q, qi) => `<p class="text-white">${qi + 1}. ${escHtml(q)} <button data-speak="${escHtml(q)}" onclick="handlePdfSpeakBtn(this)" class="ml-1 text-cyan-400">🔊</button></p>`).join("")}
                                </div>
                            ` : ""}
                            ${(sp.usefulExpressions || []).length ? `<div class="flex flex-wrap gap-1.5 text-[11px]">${sp.usefulExpressions.map(e => `<span class="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold">💡 ${escHtml(e)}</span>`).join("")}</div>` : ""}
                            <textarea id="pdf-open-input-${sp.id}" rows="3" placeholder="Bấm 🎙️ Thu giọng nói hoặc nhập câu trả lời giao tiếp của bạn..." class="w-full bg-slate-950 border border-white/15 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500">${escHtml(saved?.userAnswer || "")}</textarea>
                            <div class="flex flex-wrap gap-2">
                                <button onclick="recordPdfSpeakingVoice('${sp.id}')" class="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/35 text-cyan-200 text-xs font-extrabold">🎙️ Thu giọng nói (Voice)</button>
                                <button onclick="submitPdfOpenResponse('${sp.id}', 'speaking')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold">🤖 AI Nhận Xét Câu Nói</button>
                            </div>
                            <div id="pdf-open-result-${sp.id}" class="${saved?.report ? "" : "hidden"}">
                                ${saved?.report ? renderPdfOpenGradeReport(saved.report, saved.provider) : ""}
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    // 8. COMPREHENSIVE EXAM TAB (Feature #3)
    if (tab === "exam") {
        const chapters = course.knowledgeMap?.chapters || [];
        const exam = pdfStudioUi.activeExam;
        return `
            <div class="space-y-5">
                <div class="p-4 rounded-2xl bg-slate-950/90 border border-violet-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h4 class="text-sm font-extrabold text-white">🎓 Đề Kiểm Tra Tổng Hợp Từ Tài Liệu PDF</h4>
                        <p class="text-xs text-slate-400">Chọn 1 chương hoặc toàn bộ khóa học để tạo bài kiểm tra chấm điểm & chẩn đoán điểm yếu.</p>
                    </div>
                    <div class="flex flex-wrap gap-2 text-xs">
                        <select id="pdf-exam-scope-sel" class="bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-cyan-300 font-bold">
                            <option value="all">Toàn bộ khóa học</option>
                            ${chapters.map(c => `<option value="${escHtml(c.title)}">${escHtml(c.title)}</option>`).join("")}
                        </select>
                        <button onclick="startPdfComprehensiveExam(document.getElementById('pdf-exam-scope-sel')?.value || 'all')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold">⚡ Tạo đề ngay</button>
                    </div>
                </div>

                ${exam ? `
                    <div class="space-y-4">
                        ${exam.submitted ? `
                            <div class="p-5 rounded-3xl bg-gradient-to-r from-violet-950/80 to-slate-950 border border-emerald-500/40 space-y-2.5 text-xs">
                                <p class="text-lg font-black text-emerald-300">🎯 Kết quả: ${exam.correctCount} / ${exam.questions.length} (${exam.scorePct}%)</p>
                                <p class="text-slate-300">Phạm vi: <strong>${escHtml(exam.scope)}</strong></p>
                                ${exam.weakAreas.length ? `
                                    <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-1">
                                        <p class="font-extrabold">⚠️ Phần bạn còn yếu trong đề này:</p>
                                        <p>${exam.weakAreas.map(w => `${escHtml(w.label)} (${w.count} câu sai)`).join(" • ")}</p>
                                        <button onclick="setPdfStudioTab('weakness'); generatePdfRemedialDrills();" class="mt-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-extrabold">🧠 Tạo bài tập khắc phục điểm yếu ngay</button>
                                    </div>
                                ` : `<p class="text-emerald-300 font-bold">🌟 Xuất sắc! Bạn không mắc lỗi nào trong bài kiểm tra này.</p>`}
                            </div>
                        ` : ""}

                        ${exam.questions.map((q, qi) => {
                            const ans = exam.answers?.[q.id];
                            const hasOpts = Array.isArray(q.options) && q.options.length > 0;
                            return `
                                <div class="p-4 rounded-2xl bg-slate-950/90 border ${exam.submitted ? (ans?.isCorrect ? "border-emerald-500/40" : "border-rose-500/40") : "border-white/10"} space-y-2.5 text-xs">
                                    <div class="flex justify-between items-center flex-wrap gap-2">
                                        <span class="font-extrabold text-violet-300">Câu ${qi + 1} (${escHtml(q.skill.toUpperCase())})</span>
                                        <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${q.sourcePage || 1})" class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">📖 Xem nguồn PDF (Tr.${q.sourcePage || 1})</button>
                                    </div>
                                    <p class="text-sm font-bold text-white">${escHtml(q.question)}</p>
                                    ${hasOpts ? `
                                        <div class="grid sm:grid-cols-2 gap-2">
                                            ${q.options.map(opt => `
                                                <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-white/10 cursor-pointer">
                                                    <input type="radio" name="pdf-exam-${q.id}" value="${escHtml(opt)}" ${ans?.userAnswer === opt ? "checked" : ""} ${exam.submitted ? "disabled" : ""} class="accent-violet-500">
                                                    <span class="text-slate-200">${escHtml(opt)}</span>
                                                </label>
                                            `).join("")}
                                        </div>
                                    ` : `<input id="pdf-exam-input-${q.id}" type="text" value="${escHtml(ans?.userAnswer || "")}" ${exam.submitted ? "disabled" : ""} placeholder="Nhập đáp án..." class="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white">`}
                                    ${exam.submitted ? `
                                        <p class="${ans?.isCorrect ? "text-emerald-300" : "text-rose-300"} font-bold">
                                            ${ans?.isCorrect ? "✅ Đúng" : `❌ Sai — Đáp án đúng: ${escHtml(q.answer)}`}
                                        </p>
                                        <p class="text-slate-300">${escHtml(q.explanationVi)}</p>
                                    ` : ""}
                                </div>
                            `;
                        }).join("")}

                        ${!exam.submitted ? `<button onclick="submitPdfComprehensiveExam()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-xl">✅ Nộp Bài & Chấm Điểm Tổng Hợp</button>` : ""}
                    </div>
                ` : `
                    <div class="p-6 rounded-2xl bg-slate-950/75 border border-white/10 space-y-3 text-xs">
                        <p class="font-extrabold text-slate-300">📊 Lịch sử kiểm tra tổng hợp (${(course.progress?.examHistory || []).length})</p>
                        ${(course.progress?.examHistory || []).length ? course.progress.examHistory.map(h => `
                            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                                <span><strong>${escHtml(h.scope)}</strong> • ${new Date(h.at).toLocaleString("vi-VN")}</span>
                                <span class="font-black text-emerald-300">${h.correctCount}/${h.total} (${h.scorePct}%)</span>
                            </div>
                        `).join("") : `<p class="text-slate-400">Chưa có bài kiểm tra nào. Bấm <strong>⚡ Tạo đề ngay</strong> ở trên để bắt đầu!</p>`}
                    </div>
                `}
            </div>
        `;
    }

    // 9. VISUAL MIND MAP / LESSON SUMMARY DIAGRAM TAB (Feature #4)
    if (tab === "mindmap") {
        const chapters = course.knowledgeMap?.chapters || [];
        const selectedScope = pdfStudioUi.filterChapter !== "all" ? pdfStudioUi.filterChapter : "all";
        const mm = course.mindMaps?.[selectedScope] || buildLocalMindMapFallback(course, selectedScope);
        const colorStyles = {
            violet: "border-violet-500/40 bg-violet-500/10 text-violet-200",
            cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
            emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
            amber: "border-amber-500/40 bg-amber-500/10 text-amber-200",
            rose: "border-rose-500/40 bg-rose-500/10 text-rose-200"
        };

        return `
            <div class="space-y-5">
                <div class="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h4 class="text-sm font-extrabold text-white">🗺️ Sơ Đồ Tóm Tắt Bài Học (Visual Mind Map)</h4>
                        <p class="text-xs text-slate-400">Trực quan hóa toàn bộ ý chính, từ vựng, ngữ pháp và số trang gốc PDF thành sơ đồ tư duy dễ ôn.</p>
                    </div>
                    <div class="flex flex-wrap gap-2 text-xs">
                        <select id="pdf-mm-scope-sel" onchange="setPdfStudioFilter('filterChapter', this.value)" class="bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-cyan-300 font-bold">
                            <option value="all" ${selectedScope === "all" ? "selected" : ""}>Toàn bộ khóa học</option>
                            ${chapters.map(c => `<option value="${escHtml(c.title)}" ${selectedScope === c.title ? "selected" : ""}>${escHtml(c.title)}</option>`).join("")}
                        </select>
                        <button onclick="generatePdfLessonMindMap(document.getElementById('pdf-mm-scope-sel')?.value || 'all')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-extrabold">✨ AI Vẽ Sơ Đồ Chuyên Sâu</button>
                        <button onclick="handleSaveActiveMindMap()" class="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">📓 Lưu vào Notebook</button>
                    </div>
                </div>

                <div id="pdf-mindmap-canvas-wrap" class="p-5 rounded-3xl bg-slate-950/90 border border-white/10 space-y-6">
                    <!-- Central Mind Map Root Node -->
                    <div class="flex flex-col items-center text-center">
                        <div class="px-6 py-4 rounded-3xl bg-gradient-to-r from-violet-600/40 via-indigo-600/35 to-cyan-600/35 border-2 border-violet-400/60 shadow-2xl max-w-2xl">
                            <p class="text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider">Chủ đề trung tâm</p>
                            <h3 class="text-lg md:text-xl font-black text-white mt-0.5">${escHtml(mm.rootTitle)}</h3>
                            <p class="text-xs text-slate-200 mt-1">${escHtml(mm.subtitleVi || mm.centralIdeaVi || "")}</p>
                        </div>
                        <div class="w-0.5 h-6 bg-gradient-to-b from-violet-400 to-cyan-400/50"></div>
                    </div>

                    <!-- Mind Map Branches Grid -->
                    <div class="grid md:grid-cols-2 gap-4">
                        ${(mm.branches || []).map(br => {
                            const cStyle = colorStyles[br.color] || colorStyles.violet;
                            return `
                                <div class="p-4 rounded-2xl border ${cStyle} space-y-3">
                                    <div class="flex items-center justify-between gap-2">
                                        <h5 class="text-sm font-extrabold text-white">${escHtml(br.icon || "📌")} ${escHtml(br.title)}</h5>
                                        ${(br.sourcePages || []).length ? `<button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${br.sourcePages[0] || 1})" class="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/80 text-cyan-300 border border-cyan-500/30 font-bold">📖 Tr.${br.sourcePages.join(",")}</button>` : ""}
                                    </div>
                                    <div class="pl-3 border-l-2 border-white/20 space-y-2.5">
                                        ${(br.nodes || []).map(n => `
                                            <div class="p-2.5 rounded-xl bg-slate-950/85 border border-white/10 text-xs space-y-1">
                                                <div class="flex items-center justify-between gap-2">
                                                    <span class="font-extrabold text-white">${escHtml(n.label)}</span>
                                                    ${n.sourcePage ? `<button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${n.sourcePage})" class="text-[10px] text-cyan-400 hover:underline shrink-0">Tr.${n.sourcePage}</button>` : ""}
                                                </div>
                                                ${n.detailVi ? `<p class="text-slate-300 text-[11px]">${escHtml(n.detailVi)}</p>` : ""}
                                                ${n.example ? `<p class="text-[11px] text-emerald-300 italic">VD: ${escHtml(n.example)}</p>` : ""}
                                            </div>
                                        `).join("")}
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>

                    <!-- Key Takeaways + Review Checklist -->
                    <div class="grid md:grid-cols-2 gap-4 pt-2">
                        <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-1.5">
                            <p class="font-extrabold text-emerald-300">📌 Điểm chốt bắt buộc nhớ</p>
                            <ul class="list-disc pl-4 text-slate-200 space-y-1">
                                ${(mm.keyTakeawaysVi || []).map(t => `<li>${escHtml(t)}</li>`).join("")}
                            </ul>
                        </div>
                        <div class="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-xs space-y-1.5">
                            <p class="font-extrabold text-violet-300">✅ Checklist tự kiểm tra nhanh</p>
                            <ul class="space-y-1 text-slate-200">
                                ${(mm.quickReviewChecklist || []).map(c => `<li>☐ ${escHtml(c)}</li>`).join("")}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 10. WEAKNESS DETECTOR & REMEDIAL DRILLS TAB (Feature #2)
    if (tab === "weakness") {
        const clusters = computePdfWeaknessClusters(course);
        const rem = pdfStudioUi.activeRemedial;
        return `
            <div class="space-y-5">
                <div class="p-4 rounded-2xl bg-slate-950/90 border border-rose-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h4 class="text-sm font-extrabold text-white">🧠 AI Phát Hiện Lỗ Hổng Kiến Thức & Luyện Khắc Phục</h4>
                        <p class="text-xs text-slate-400">Hệ thống tự gom các lỗi bạn hay sai trong khóa học PDF này để tạo bài tập chuyên biệt thay vì bắt học lại từ đầu.</p>
                    </div>
                    <button onclick="generatePdfRemedialDrills()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 text-white text-xs font-extrabold shadow-lg">⚡ AI Tạo Bài Tập Khắc Phục Điểm Yếu</button>
                </div>

                ${clusters.length ? `
                    <div class="grid md:grid-cols-2 gap-3">
                        ${clusters.slice(0, 8).map(c => `
                            <div class="p-4 rounded-2xl bg-slate-950/90 border border-rose-500/25 text-xs space-y-2">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-extrabold text-white">${escHtml(c.topicTag)} <span class="text-violet-300 uppercase text-[10px]">(${escHtml(c.skill)})</span></span>
                                    <span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold">${c.wrongCount} lần sai</span>
                                </div>
                                ${c.sourcePages.length ? `<button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${c.sourcePages[0]})" class="text-[10px] text-cyan-300 hover:underline">📖 Ôn lại trang gốc PDF: Tr.${c.sourcePages.join(", ")}</button>` : ""}
                                <div class="space-y-1 text-[11px] text-slate-400">
                                    ${c.recentMistakes.slice(0, 2).map(m => `<p>• ${escHtml(m.question || "")}: <span class="text-rose-300 line-through">${escHtml(m.userAnswer || "")}</span> → <span class="text-emerald-300">${escHtml(m.correctAnswer || "")}</span></p>`).join("")}
                                </div>
                            </div>
                        `).join("")}
                    </div>
                ` : `
                    <div class="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center text-xs text-emerald-200">
                        🌟 Chưa phát hiện lỗ hổng kiến thức nào! Hãy làm bài tập ở các tab Vocabulary, Grammar, Reading, Writing hoặc Kiểm tra tổng hợp — mọi câu sai sẽ tự động được phân tích tại đây.
                    </div>
                `}

                <div id="pdf-remedial-output" class="space-y-4">
                    ${rem ? `
                        <div class="p-5 rounded-3xl bg-slate-900/90 border border-violet-500/35 space-y-3 text-xs">
                            <h5 class="text-sm font-extrabold text-violet-300">🎯 Chẩn đoán lỗ hổng & Mini-Lesson khắc phục</h5>
                            <p class="text-slate-200 leading-relaxed"><strong>Chẩn đoán:</strong> ${escHtml(rem.diagnosisVi)}</p>
                            ${rem.miniLessonVi ? `<div class="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-100 leading-relaxed">💡 ${escHtml(rem.miniLessonVi)}</div>` : ""}
                            <div class="space-y-3 pt-2">
                                ${(rem.drills || []).map((dr, di) => renderPdfInteractiveExerciseCard(dr, course, di + 1)).join("")}
                            </div>
                        </div>
                    ` : ""}
                </div>
            </div>
        `;
    }

    return "";
}

function renderPdfOpenGradeReport(d, provider = "") {
    return `
        <div class="p-4 rounded-2xl bg-slate-950 border border-emerald-500/35 space-y-3 text-xs mt-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-base font-black text-emerald-300">🎯 Điểm AI: ${escHtml(String(d.score10 ?? "—"))}/10</span>
                ${provider ? `<span class="text-[10px] text-slate-400">Chấm bởi: ${escHtml(provider)}</span>` : ""}
            </div>
            <p class="text-slate-200 leading-relaxed">${escHtml(d.overviewVi || "")}</p>
            ${(d.strengthsVi || []).length ? `<p class="text-emerald-300"><strong>Điểm tốt:</strong> ${escHtml(d.strengthsVi.join(" • "))}</p>` : ""}
            ${(d.sentenceFixes || []).length ? `
                <div class="space-y-2">
                    <p class="font-extrabold text-violet-300">🔍 Sửa lỗi từng câu (chấp nhận mọi cách diễn đạt hợp lệ):</p>
                    ${d.sentenceFixes.map(sf => `
                        <div class="p-2.5 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">${escHtml(sf.errorType || "Gợi ý")}</span>
                            <p class="text-rose-300">Gốc: ${escHtml(sf.original || "")}</p>
                            <p class="text-emerald-300 font-semibold">Chuẩn: ${escHtml(sf.corrected || "")}</p>
                            <p class="text-slate-300">${escHtml(sf.explanationVi || "")}</p>
                        </div>
                    `).join("")}
                </div>
            ` : ""}
            ${d.naturalModel ? `<div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25"><p class="font-bold text-emerald-300 mb-1">✨ Bản mẫu tự nhiên:</p><p class="text-slate-100 leading-relaxed">${escHtml(d.naturalModel)}</p></div>` : ""}
            ${d.nextTipVi ? `<p class="text-cyan-300">💡 <strong>Mẹo nâng điểm:</strong> ${escHtml(d.nextTipVi)}</p>` : ""}
        </div>
    `;
}

function openPdfLibraryRoot() {
    pdfStudioUi.viewMode = "library";
    pdfStudioUi.openFolderId = null;
    renderPdfStudioPage();
}

function openPdfFolder(folderId) {
    pdfStudioUi.viewMode = "folder";
    pdfStudioUi.openFolderId = folderId;
    renderPdfStudioPage();
}

function openPdfCourseView(courseId) {
    if (!pdfStudioState) loadPdfStudioState();
    const course = pdfStudioState.courses.find(c => c.id === courseId) || getActivePdfCourse();
    if (!course) return;
    pdfStudioState.activeCourseId = course.id;
    pdfStudioUi.viewMode = "course";
    if (course.folderId) pdfStudioUi.openFolderId = course.folderId;
    pdfStudioUi.activeTab = course.progress?.lastTab || "overview";
    if (typeof pdfLmsUi !== "undefined") {
        pdfLmsUi.level = "units";
        pdfLmsUi.showingResultAttemptId = null;
    }
    savePdfStudioState();
    renderPdfStudioPage();
}

function createPdfStudioFolder() {
    if (!pdfStudioState) loadPdfStudioState();
    const name = (prompt("Nhập tên thư mục mới (VD: PEN-LV4, IELTS, TOEIC...):") || "").trim();
    if (!name) return;
    pdfStudioState.folders = pdfStudioState.folders || [];
    if (pdfStudioState.folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
        showToast(`Thư mục "${name}" đã tồn tại!`, "warning");
        return;
    }
    const newFolder = {
        id: `fld-${Date.now().toString(36)}`,
        name,
        descriptionVi: `Thư mục giáo trình & bài học ${name}`,
        icon: "📁",
        createdAt: new Date().toISOString()
    };
    pdfStudioState.folders.push(newFolder);
    savePdfStudioState();
    openPdfFolder(newFolder.id);
    showToast(`📁 Đã tạo thư mục "${name}" và đồng bộ Cloud!`);
}

function deletePdfStudioFolder(folderId) {
    if (!pdfStudioState) loadPdfStudioState();
    const f = (pdfStudioState.folders || []).find(x => x.id === folderId);
    if (!f) return;
    const hasItems = (pdfStudioState.documents || []).some(d => d.folderId === folderId) || (pdfStudioState.courses || []).some(c => c.folderId === folderId);
    if (hasItems && !confirm(`Thư mục "${f.name}" đang có tài liệu/khóa học. Xóa thư mục sẽ chuyển tài liệu ra ngoài Thư viện chính (không mất dữ liệu). Tiếp tục?`)) {
        return;
    }
    pdfStudioState.folders = (pdfStudioState.folders || []).filter(x => x.id !== folderId);
    (pdfStudioState.documents || []).forEach(d => { if (d.folderId === folderId) { d.folderId = ""; d.folderName = ""; } });
    (pdfStudioState.courses || []).forEach(c => { if (c.folderId === folderId) { c.folderId = ""; c.folderName = ""; } });
    if (pdfStudioUi.openFolderId === folderId) {
        pdfStudioUi.openFolderId = null;
        pdfStudioUi.viewMode = "library";
    }
    savePdfStudioState();
    renderPdfStudioPage();
    showToast(`Đã xóa thư mục "${f.name}".`);
}

function renderPdfUploadPanelHtml(targetFolderName = "") {
    return `
        <div class="glass-panel p-5 rounded-3xl border border-violet-500/20 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-sm font-extrabold text-white">➕ Tải PDF mới ${targetFolderName ? `vào thư mục <span class="text-cyan-300">${escHtml(targetFolderName)}</span>` : "vào AI PDF Learning Studio"}</p>
                    <p class="text-[11px] text-slate-400">Hỗ trợ PDF văn bản, PDF scan OCR (>100MB) và đính kèm file Audio MP3 bản xứ.</p>
                </div>
                <div class="flex flex-wrap gap-2 text-xs">
                    <label class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold cursor-pointer shadow-lg">
                        📄 Chọn file PDF
                        <input type="file" accept=".pdf,application/pdf" multiple onchange="handlePdfStudioFileInput(event)" class="hidden">
                    </label>
                    <label class="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold cursor-pointer">
                        🎧 Đính kèm Audio MP3
                        <input type="file" accept="audio/*,.mp3,.wav,.m4a" multiple onchange="handlePdfCompanionAudioInput(event)" class="hidden">
                    </label>
                </div>
            </div>
            <div ondragover="handlePdfStudioDragOver(event)" ondragleave="handlePdfStudioDragLeave(event)" ondrop="handlePdfStudioDrop(event)" onclick="document.getElementById('pdf-studio-hidden-picker')?.click()" class="cursor-pointer p-5 rounded-2xl border-2 border-dashed border-white/15 hover:border-violet-400/60 bg-slate-950/65 text-center space-y-1.5 transition">
                <input id="pdf-studio-hidden-picker" type="file" accept=".pdf,application/pdf" multiple onchange="handlePdfStudioFileInput(event)" class="hidden">
                <p class="text-xs md:text-sm font-extrabold text-white">📕 Kéo thả file PDF bài học vào đây hoặc bấm để chọn từ thiết bị</p>
                <p class="text-[11px] text-slate-400">AI tự phân tích đủ 6 kỹ năng (Vocabulary • Grammar • Reading • Listening • Writing • Speaking) + Knowledge Map + Sơ đồ tóm tắt</p>
            </div>
            <div id="pdf-pipeline-live-box" class="${pdfStudioPipeline.running || pdfStudioPipeline.stageStatus !== "idle" ? "" : "hidden"} p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/35"></div>
        </div>
    `;
}

function renderPdfDocumentCardHtml(d, courses) {
    const linkedCourse = courses.find(c => c.docId === d.id);
    const statusMap = {
        uploaded: ["bg-slate-800 text-slate-300", "Sẵn sàng phân tích"],
        analyzing: ["bg-cyan-500/20 text-cyan-300 animate-pulse", "Đang phân tích"],
        building: ["bg-violet-500/20 text-violet-300 animate-pulse", "Đang tạo bài học"],
        completed: ["bg-emerald-500/20 text-emerald-300", "Hoàn thành"],
        error: ["bg-rose-500/20 text-rose-300", "Lỗi"]
    };
    const [sCls, sTxt] = statusMap[d.status] || statusMap.uploaded;
    return `
        <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 hover:border-violet-500/40 transition space-y-3 text-xs">
            <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 flex-1 ${linkedCourse ? "cursor-pointer" : ""}" ${linkedCourse ? `onclick="openPdfCourseView('${linkedCourse.id}')"` : ""}>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-extrabold text-white text-sm md:text-base">📕 ${escHtml(d.fileName)}</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${sCls}">${sTxt}</span>
                        ${d.cloudPagesPrefix ? `<span class="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">☁️ Trang sách gốc HD</span>` : ""}
                    </div>
                    <p class="text-[11px] text-slate-400 mt-1">
                        ${formatFileSizeBytes(d.fileSize)} • <strong>${d.pageCount} trang</strong>
                        ${linkedCourse ? ` • <span class="text-violet-300 font-bold">${linkedCourse.knowledgeMap?.chapters?.length || 0} Units • ${linkedCourse.skills?.vocabulary?.length || 0} từ vựng • ${linkedCourse.skills?.listening?.length || 0} bài nghe</span>` : ""}
                        ${(d.companionAudioNames || []).length ? ` • <span class="text-emerald-300">🎧 ${d.companionAudioNames.length} MP3</span>` : ""}
                    </p>
                    ${d.statusNote ? `<p class="text-[10.5px] text-slate-400 mt-1">${escHtml(d.statusNote)}</p>` : ""}
                </div>
                <div class="flex flex-wrap items-center gap-1.5">
                    ${linkedCourse ? `<button onclick="openPdfCourseView('${linkedCourse.id}')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-lg">▶ Mở Khóa Học</button>` : ""}
                    <button onclick="openPdfSourcePage('${d.id}', ${d.rangeStart || 1})" class="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold">📖 Xem Sách PDF</button>
                    <button onclick="runPdfToCoursePipeline('${d.id}')" ${pdfStudioPipeline.running ? "disabled" : ""} class="px-3 py-2 rounded-xl bg-violet-600/25 hover:bg-violet-600/40 border border-violet-500/35 text-violet-200 font-bold">✨ Phân Tích</button>
                    <button onclick="deletePdfDocument('${d.id}')" class="p-2 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25" title="Xóa tài liệu">🗑️</button>
                </div>
            </div>
            <details class="pt-2 border-t border-white/5 text-[11px]">
                <summary class="cursor-pointer text-slate-400 hover:text-slate-200 font-bold">⚙️ Tùy chọn phạm vi trang & OCR (Trang ${d.rangeStart || 1}–${d.rangeEnd || d.pageCount || 1})</summary>
                <div class="flex flex-wrap items-center gap-3 pt-2">
                    <div class="flex items-center gap-1.5">
                        <span class="text-slate-400">Phạm vi trang:</span>
                        <input type="number" min="1" max="${d.pageCount || 1}" value="${d.rangeStart || 1}" onchange="updatePdfDocRange('${d.id}','rangeStart',this.value)" class="w-16 bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-white font-bold text-center">
                        <span class="text-slate-400">đến</span>
                        <input type="number" min="1" max="${d.pageCount || 1}" value="${d.rangeEnd || d.pageCount || 1}" onchange="updatePdfDocRange('${d.id}','rangeEnd',this.value)" class="w-16 bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-white font-bold text-center">
                        <button onclick="setPdfDocFullRange('${d.id}')" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 font-bold">Toàn bộ (${d.pageCount})</button>
                    </div>
                    <label class="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input type="checkbox" ${d.enableOcr !== false ? "checked" : ""} onchange="updatePdfDocRange('${d.id}','enableOcr',this.checked)" class="accent-violet-500">
                        <span>Bật OCR tự động cho trang scan</span>
                    </label>
                </div>
            </details>
        </div>
    `;
}

function renderPdfStudioPage() {
    const root = document.getElementById("pdf-studio-root");
    if (!root) return;
    if (!pdfStudioState) loadPdfStudioState();

    const folders = pdfStudioState.folders || [];
    const docs = pdfStudioState.documents || [];
    const courses = pdfStudioState.courses || [];
    const activeCourse = getActivePdfCourse();
    const activeFolder = pdfStudioUi.openFolderId ? folders.find(f => f.id === pdfStudioUi.openFolderId) : null;

    // Fallback gracefully if viewMode is folder/course but item no longer exists
    if (pdfStudioUi.viewMode === "folder" && !activeFolder) pdfStudioUi.viewMode = "library";
    if (pdfStudioUi.viewMode === "course" && !activeCourse) pdfStudioUi.viewMode = activeFolder ? "folder" : "library";

    // ==================== VIEW 3: INSIDE INTERACTIVE COURSE (UNIT-BASED LMS) ====================
    if (pdfStudioUi.viewMode === "course" && activeCourse) {
        if (typeof renderLmsCourseWorkspace === "function") {
            root.innerHTML = renderLmsCourseWorkspace(activeCourse, folders);
            renderPdfPipelineBannerOnly();
            hydratePdfCloudAudioPlayers();
            return;
        }
        const chapters = activeCourse?.knowledgeMap?.chapters || [];
        const courseFolder = activeCourse.folderId ? folders.find(f => f.id === activeCourse.folderId) : null;
        const courseTabs = [
            ["overview", "🧭 Tổng quan & Bản đồ"],
            ["vocabulary", `📖 Vocabulary (${activeCourse?.skills?.vocabulary?.length || 0})`],
            ["grammar", `📝 Grammar (${activeCourse?.skills?.grammar?.length || 0})`],
            ["reading", `📄 Reading (${activeCourse?.skills?.reading?.length || 0})`],
            ["listening", `🎧 Listening (${activeCourse?.skills?.listening?.length || 0})`],
            ["writing", `✍️ Writing (${activeCourse?.skills?.writing?.length || 0})`],
            ["speaking", `🎙️ Speaking (${activeCourse?.skills?.speaking?.length || 0})`],
            ["exam", "🎓 Kiểm tra tổng hợp"],
            ["mindmap", "🗺️ Sơ đồ tóm tắt"],
            ["weakness", `🧠 Lỗ hổng (${computePdfWeaknessClusters(activeCourse).length})`]
        ];

        root.innerHTML = `
            <!-- Breadcrumb Navigation Bar -->
            <div class="glass-panel px-4 py-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-1.5 flex-wrap font-bold">
                    <button onclick="openPdfLibraryRoot()" class="text-cyan-300 hover:underline">📁 Thư Mục Giáo Trình PDF</button>
                    ${courseFolder ? `<span class="text-slate-500">›</span><button onclick="openPdfFolder('${courseFolder.id}')" class="text-violet-300 hover:underline">${escHtml(courseFolder.icon || "📘")} ${escHtml(courseFolder.name)}</button>` : ""}
                    <span class="text-slate-500">›</span>
                    <span class="text-white truncate">📕 ${escHtml(activeCourse.fileName || activeCourse.title)}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="openPdfSourcePage('${escHtml(activeCourse.docId)}', ${activeCourse.analyzedRange?.start || 15})" class="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">📖 Mở Sách PDF Gốc</button>
                    <button onclick="${courseFolder ? `openPdfFolder('${courseFolder.id}')` : "openPdfLibraryRoot()"}" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold">← Quay lại ${courseFolder ? escHtml(courseFolder.name) : "Thư mục"}</button>
                </div>
            </div>

            <div class="glass-panel p-5 rounded-3xl space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="min-w-0">
                        <span class="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">Khóa học tương tác từ PDF (Đồng bộ Cloud 24/7)</span>
                        <h3 class="text-lg font-black text-white truncate">${escHtml(activeCourse.title)}</h3>
                    </div>
                    ${courses.length > 1 ? `
                        <select onchange="openPdfCourseView(this.value)" class="bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-violet-300 max-w-xs">
                            ${courses.map(c => `<option value="${c.id}" ${c.id === activeCourse.id ? "selected" : ""}>📘 ${escHtml(c.title)}</option>`).join("")}
                        </select>
                    ` : ""}
                </div>

                <!-- Course Navigation Tabs -->
                <div class="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-slate-950/80 border border-white/10">
                    ${courseTabs.map(([k, lbl]) => `
                        <button onclick="setPdfStudioTab('${k}')" class="px-3 py-2 rounded-xl text-xs font-extrabold transition ${pdfStudioUi.activeTab === k ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-white/5"}">${lbl}</button>
                    `).join("")}
                </div>

                <!-- Filter Bar (Chapter, Level, Status, PDF Page) -->
                ${["vocabulary", "grammar", "reading", "listening", "writing", "speaking"].includes(pdfStudioUi.activeTab) ? `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <select onchange="setPdfStudioFilter('filterChapter', this.value)" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 font-bold">
                            <option value="all">Tất cả Chương (${chapters.length})</option>
                            ${chapters.map(c => `<option value="${escHtml(c.title)}" ${pdfStudioUi.filterChapter === c.title ? "selected" : ""}>${escHtml(c.title)}</option>`).join("")}
                        </select>
                        <select onchange="setPdfStudioFilter('filterLevel', this.value)" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-violet-300 font-bold">
                            <option value="all">Mọi độ khó</option>
                            ${["A1", "A2", "B1", "B2", "C1", "C2"].map(lv => `<option value="${lv}" ${pdfStudioUi.filterLevel === lv ? "selected" : ""}>Level ${lv}</option>`).join("")}
                        </select>
                        <select onchange="setPdfStudioFilter('filterStatus', this.value)" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-emerald-300 font-bold">
                            <option value="all" ${pdfStudioUi.filterStatus === "all" ? "selected" : ""}>Mọi trạng thái</option>
                            <option value="todo" ${pdfStudioUi.filterStatus === "todo" ? "selected" : ""}>⏳ Chưa hoàn thành</option>
                            <option value="done" ${pdfStudioUi.filterStatus === "done" ? "selected" : ""}>✅ Đã hoàn thành</option>
                        </select>
                        <input type="number" min="1" value="${escHtml(pdfStudioUi.filterPage || "")}" oninput="setPdfStudioFilter('filterPage', this.value)" placeholder="Lọc theo số trang PDF..." class="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-cyan-300 font-bold">
                    </div>
                ` : ""}

                <!-- Active Course Tab Body -->
                <div>${renderPdfCourseTabContent(activeCourse)}</div>
            </div>
        `;
        renderPdfPipelineBannerOnly();
        hydratePdfCloudAudioPlayers();
        return;
    }

    // ==================== VIEW 2: INSIDE A SPECIFIC FOLDER (e.g., PEN-LV3) ====================
    if (pdfStudioUi.viewMode === "folder" && activeFolder) {
        const folderDocs = docs.filter(d => d.folderId === activeFolder.id);
        root.innerHTML = `
            <div class="glass-panel p-5 rounded-3xl border border-violet-500/25 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="space-y-1">
                        <div class="flex items-center gap-1.5 text-xs font-bold">
                            <button onclick="openPdfLibraryRoot()" class="text-cyan-300 hover:underline">📁 Thư Mục Giáo Trình PDF</button>
                            <span class="text-slate-500">›</span>
                            <span class="text-white">${escHtml(activeFolder.icon || "📘")} ${escHtml(activeFolder.name)}</span>
                        </div>
                        <h2 class="text-xl font-black text-white">${escHtml(activeFolder.icon || "📘")} Thư mục ${escHtml(activeFolder.name)}</h2>
                        <p class="text-xs text-slate-400">${escHtml(activeFolder.descriptionVi || "")}</p>
                    </div>
                    <button onclick="openPdfLibraryRoot()" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200">← Quay lại Thư mục lớn</button>
                </div>

                ${folderDocs.length ? `
                    <div class="space-y-3">
                        ${folderDocs.map(d => renderPdfDocumentCardHtml(d, courses)).join("")}
                    </div>
                ` : `
                    <div class="p-6 rounded-2xl bg-slate-950/75 border border-white/10 text-center text-xs text-slate-400">
                        Thư mục <strong>${escHtml(activeFolder.name)}</strong> chưa có file PDF nào. Kéo thả file PDF ở khung bên dưới để thêm vào thư mục này!
                    </div>
                `}
            </div>

            ${renderPdfUploadPanelHtml(activeFolder.name)}
        `;
        renderPdfPipelineBannerOnly();
        return;
    }

    // ==================== VIEW 1: ROOT BIG FOLDER LIBRARY ====================
    const rootDocs = docs.filter(d => !d.folderId || !folders.some(f => f.id === d.folderId));
    root.innerHTML = `
        <!-- 1. BIG MASTER FOLDER LIBRARY ("THƯ MỤC LỚN") -->
        <div class="glass-panel p-6 rounded-3xl border border-violet-500/25 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-lg md:text-xl font-black text-white">📁 Thư Mục Giáo Trình & Khóa Học PDF</h2>
                        <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[10px] font-extrabold">AI PDF Studio</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">Chọn thư mục giáo trình của bạn để mở sách PDF & khóa học tương tác, hoặc tạo thư mục mới để lưu thêm tài liệu.</p>
                </div>
                <button onclick="createPdfStudioFolder()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-extrabold shadow-lg">➕ Tạo Thư Mục Mới</button>
            </div>

            ${folders.length ? `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${folders.map(f => {
                        const fDocs = docs.filter(d => d.folderId === f.id);
                        const fCourses = courses.filter(c => c.folderId === f.id);
                        return `
                            <div onclick="openPdfFolder('${f.id}')" class="group cursor-pointer p-5 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-950 to-indigo-950/60 border border-violet-500/30 hover:border-cyan-400/70 transition shadow-xl space-y-3">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="w-12 h-12 rounded-2xl bg-violet-600/25 border border-violet-400/40 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                                        ${escHtml(f.icon || "📁")}
                                    </div>
                                    <button onclick="event.stopPropagation(); deletePdfStudioFolder('${f.id}')" class="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs" title="Xóa thư mục">🗑️</button>
                                </div>
                                <div>
                                    <h3 class="text-base font-black text-white group-hover:text-cyan-300 transition">${escHtml(f.name)}</h3>
                                    <p class="text-[11px] text-slate-400 mt-0.5 line-clamp-2">${escHtml(f.descriptionVi || "Nhấn để mở thư mục tài liệu PDF")}</p>
                                </div>
                                <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-[11px]">
                                    <span class="text-cyan-300 font-bold">📕 ${fDocs.length} sách PDF • 🎓 ${fCourses.length} khóa học</span>
                                    <span class="text-emerald-300 font-extrabold group-hover:translate-x-0.5 transition">Mở →</span>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            ` : `
                <div class="p-6 rounded-2xl bg-slate-950/70 border border-white/10 text-center space-y-2">
                    <p class="text-sm font-extrabold text-white">📂 Chưa có thư mục giáo trình nào</p>
                    <p class="text-xs text-slate-400">Bấm <strong>➕ Tạo Thư Mục Mới</strong> hoặc tải trực tiếp file PDF bài học ở khung bên dưới để AI tự tạo khóa học cho riêng bạn.</p>
                </div>
            `}

            ${rootDocs.length ? `
                <div class="space-y-2.5 pt-2 border-t border-white/10">
                    <p class="text-xs font-extrabold text-slate-300">📄 Tài liệu PDF ngoài thư mục (${rootDocs.length})</p>
                    ${rootDocs.map(d => renderPdfDocumentCardHtml(d, courses)).join("")}
                </div>
            ` : ""}
        </div>

        <!-- 2. UPLOAD NEW PDF PANEL -->
        ${renderPdfUploadPanelHtml("")}
    `;

    renderPdfPipelineBannerOnly();
}

function initPdfStudioPage() {
    loadPdfStudioState();
    renderPdfStudioPage();
}
