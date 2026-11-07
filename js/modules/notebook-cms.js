/* ==========================================================================
   QEnglish - Structured English Notebook (PHẦN 6) & Content Studio CMS (PHẦN 5)
   ========================================================================== */

let currentNotebookFilter = "all";
let currentNotebookImportantOnly = false;
let editingNoteId = null;
let noteAutoSaveTimer = null;
let aiGeneratedPreviewCandidate = null;

const NOTEBOOK_SCHEMAS = {
    vocabulary: {
        label: "📖 Vocabulary Notebook",
        badgeCls: "bg-violet-500/15 text-violet-300 border-violet-500/30",
        fields: [
            { key: "word", label: "English Word", placeholder: "VD: Prerequisite" },
            { key: "ipa", label: "IPA", placeholder: "VD: /ˌpriːˈrek.wɪ.zɪt/" },
            { key: "pos", label: "Part of Speech", placeholder: "VD: noun" },
            { key: "meaningVi", label: "Vietnamese Meaning", placeholder: "VD: Điều kiện / Môn tiên quyết" },
            { key: "example", label: "Example Sentence", placeholder: "Câu ví dụ mẫu..." },
            { key: "synonyms", label: "Synonyms (Đồng nghĩa)", placeholder: "requirement, precondition" },
            { key: "antonyms", label: "Antonyms (Trái nghĩa)", placeholder: "optional, elective" },
            { key: "personalSentence", label: "Personal Sentence (Câu tự đặt)", placeholder: "Câu của riêng bạn..." }
        ]
    },
    grammar: {
        label: "📝 Grammar Notebook",
        badgeCls: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        fields: [
            { key: "grammarTopic", label: "Chủ đề ngữ pháp", placeholder: "VD: Present Perfect vs Past Simple" },
            { key: "formula", label: "Công thức", placeholder: "VD: S + have/has + V3/ed" },
            { key: "usage", label: "Cách sử dụng", placeholder: "Diễn tả hành động bắt đầu trong quá khứ kéo dài tới hiện tại...", multiline: true },
            { key: "examples", label: "Ví dụ minh họa", placeholder: "I have studied here since September.", multiline: true },
            { key: "commonMistakes", label: "Lỗi thường gặp", placeholder: "Không dùng với yesterday, last week...", multiline: true }
        ]
    },
    mistake: {
        label: "⚠️ Mistake Notebook",
        badgeCls: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        fields: [
            { key: "errorCategory", label: "Phân loại lỗi", options: ["Sai chính tả", "Sai ngữ pháp", "Dùng sai từ", "Sai cấu trúc câu", "Phát âm chưa rõ"] },
            { key: "wrongText", label: "Nội dung sai gốc", placeholder: "VD: I very like English." },
            { key: "correctText", label: "Cách sửa chính xác", placeholder: "VD: I really like English." },
            { key: "explanation", label: "Giải thích vì sao sai", placeholder: "'Very' không đứng trước động từ thường...", multiline: true }
        ]
    },
    writing: {
        label: "✍️ Writing Notebook",
        badgeCls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        fields: [
            { key: "prompt", label: "Đề bài Writing", placeholder: "Chủ đề / Đề bài..." },
            { key: "originalEssay", label: "Bài viết gốc", placeholder: "Nội dung bài viết ban đầu...", multiline: true },
            { key: "revisedEssay", label: "Phiên bản đã sửa", placeholder: "Phiên bản hoàn thiện...", multiline: true },
            { key: "feedbackSummary", label: "Nhận xét & Điểm cần nhớ", placeholder: "Các lưu ý rút ra...", multiline: true }
        ]
    },
    speaking: {
        label: "🎙️ Speaking Notebook",
        badgeCls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        fields: [
            { key: "topic", label: "Chủ đề Speaking", placeholder: "VD: My University" },
            { key: "transcript", label: "Transcript nội dung đã nói", placeholder: "Lời nói đã ghi nhận...", multiline: true },
            { key: "feedback", label: "Nhận xét độ trôi chảy & ngữ pháp", placeholder: "Tốc độ, độ rõ chữ...", multiline: true },
            { key: "improvements", label: "Các lỗi & từ phát âm cần cải thiện", placeholder: "Những câu/từ cần luyện đọc lại...", multiline: true }
        ]
    }
};

function filterNotebook(type) {
    currentNotebookFilter = type;
    document.querySelectorAll(".nb-filter-btn").forEach(btn => {
        const active = btn.getAttribute("data-nbtype") === type;
        btn.className = active
            ? "nb-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-violet-600 text-white shadow-md"
            : "nb-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-white/10 hover:text-white";
    });
    renderNotebook();
}

function toggleNotebookImportantFilter() {
    currentNotebookImportantOnly = !currentNotebookImportantOnly;
    const btn = document.getElementById("nb-important-filter-btn");
    if (btn) {
        btn.className = currentNotebookImportantOnly
            ? "px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40"
            : "px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-white/10";
    }
    renderNotebook();
}

function renderNotebook() {
    if (!notebookItems.length) loadNotebook();
    const listEl = document.getElementById("notebook-list");
    if (!listEl) return;

    const search = (document.getElementById("notebook-search")?.value || "").toLowerCase().trim();
    const filtered = notebookItems.filter(n => {
        const matchType = currentNotebookFilter === "all" || n.type === currentNotebookFilter;
        const matchImp = !currentNotebookImportantOnly || Boolean(n.important);
        const hay = `${n.title} ${n.content || ""} ${JSON.stringify(n.fields || {})}`.toLowerCase();
        const matchSearch = !search || hay.includes(search);
        return matchType && matchImp && matchSearch;
    });

    const countEl = document.getElementById("notebook-count-summary");
    if (countEl) countEl.textContent = `${filtered.length} / ${notebookItems.length} ghi chú`;

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="col-span-full glass-panel rounded-2xl p-10 text-center space-y-2 text-slate-400">
                <div class="text-4xl">📓</div>
                <p class="font-bold text-white">Chưa có ghi chú nào trong mục này</p>
                <p class="text-xs">Bấm "➕ Tạo ghi chú mới" hoặc hệ thống sẽ tự động lưu lỗi sai của bạn vào Sổ Lỗi Sai khi luyện tập!</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map(n => {
        const schema = NOTEBOOK_SCHEMAS[n.type] || NOTEBOOK_SCHEMAS.vocabulary;
        const f = n.fields || {};
        return `
            <div class="glass-card p-5 rounded-2xl flex flex-col justify-between gap-3 transition">
                <div class="space-y-2">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${schema.badgeCls}">${schema.label}</span>
                            ${renderSourceBadge(n.source || "local-browser")}
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                            <button onclick='toggleNoteImportant(${JSON.stringify(n.id)})' class="p-1.5 rounded-lg hover:bg-white/5 ${n.important ? "text-amber-400" : "text-slate-500"}" title="Đánh dấu quan trọng">★</button>
                            <button onclick='openNoteEditor(${JSON.stringify(n.id)})' class="p-1.5 rounded-lg hover:bg-white/5 text-cyan-300 text-xs font-bold" title="Chỉnh sửa">✏️</button>
                            <button onclick='deleteNoteById(${JSON.stringify(n.id)})' class="p-1.5 rounded-lg hover:bg-white/5 text-rose-400 text-xs" title="Xóa">🗑</button>
                        </div>
                    </div>
                    <h4 class="font-extrabold text-base text-white">${escHtml(n.title)}</h4>
                    ${renderStructuredFieldsPreview(n.type, f, n.content)}
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-500">
                    <span>Cập nhật: ${new Date(n.updatedAt || n.createdAt).toLocaleString("vi-VN")}</span>
                    ${f.occurrences && f.occurrences > 1 ? `<span class="text-rose-400 font-bold">Lặp lại ${f.occurrences} lần</span>` : ""}
                </div>
            </div>
        `;
    }).join("");
}

function renderStructuredFieldsPreview(type, f, fallbackContent) {
    if (type === "vocabulary" && (f.word || f.meaningVi)) {
        return `
            <div class="text-xs space-y-1 text-slate-300">
                <p><strong class="text-cyan-300">${escHtml(f.word || "")}</strong> <span class="font-mono text-slate-400">${escHtml(f.ipa || "")}</span> ${f.pos ? `(${escHtml(f.pos)})` : ""} — <strong class="text-amber-300">${escHtml(f.meaningVi || "")}</strong></p>
                ${f.example ? `<p class="italic text-slate-400">"${escHtml(f.example)}"</p>` : ""}
                ${(f.synonyms || f.antonyms) ? `<p class="text-[11px] text-slate-400">${f.synonyms ? `Syn: ${escHtml(f.synonyms)} ` : ""}${f.antonyms ? `| Ant: ${escHtml(f.antonyms)}` : ""}</p>` : ""}
                ${f.personalSentence ? `<p class="text-emerald-300">✍️ Câu của tôi: "${escHtml(f.personalSentence)}"</p>` : ""}
            </div>
        `;
    }
    if (type === "grammar" && (f.formula || f.usage)) {
        return `
            <div class="text-xs space-y-1 text-slate-300">
                ${f.formula ? `<p class="font-mono text-amber-300 bg-slate-950 px-2 py-1 rounded">${escHtml(f.formula)}</p>` : ""}
                ${f.usage ? `<p class="line-clamp-3">${escHtml(f.usage)}</p>` : ""}
            </div>
        `;
    }
    if (type === "mistake" && (f.wrongText || f.correctText)) {
        return `
            <div class="text-xs space-y-1">
                <p class="text-rose-300 line-through">❌ ${escHtml(f.wrongText || "")}</p>
                <p class="text-emerald-300 font-bold">✅ ${escHtml(f.correctText || "")}</p>
                ${f.explanation ? `<p class="text-slate-400">💡 ${escHtml(f.explanation)}</p>` : ""}
            </div>
        `;
    }
    return `<p class="text-xs text-slate-300 whitespace-pre-line line-clamp-4">${escHtml(fallbackContent || "")}</p>`;
}

function createNote(defaultType = null) {
    editingNoteId = null;
    const chosenType = defaultType || (currentNotebookFilter !== "all" ? currentNotebookFilter : "vocabulary");
    openNoteEditorModalUI({
        id: null,
        type: chosenType,
        title: "",
        important: false,
        fields: {},
        content: ""
    });
}

function openNoteEditor(noteId) {
    const n = notebookItems.find(x => x.id === noteId);
    if (!n) return;
    editingNoteId = n.id;
    openNoteEditorModalUI(n);
}

function openNoteEditorModalUI(noteData) {
    const editor = document.getElementById("note-editor");
    if (!editor) return;
    editor.classList.remove("hidden");

    document.getElementById("note-title").value = noteData.title || "";
    document.getElementById("note-type").value = noteData.type || "vocabulary";
    document.getElementById("note-important-chk").checked = Boolean(noteData.important);
    document.getElementById("note-delete-btn")?.classList.toggle("hidden", !noteData.id);

    renderDynamicNoteFields(noteData.type || "vocabulary", noteData.fields || {});
    document.getElementById("note-content").value = noteData.content || "";
    editor.scrollIntoView({ behavior: "smooth", block: "start" });
}

function onNoteTypeSelectChange(newType) {
    renderDynamicNoteFields(newType, {});
}

function renderDynamicNoteFields(type, values = {}) {
    const container = document.getElementById("note-dynamic-fields");
    if (!container) return;
    const schema = NOTEBOOK_SCHEMAS[type] || NOTEBOOK_SCHEMAS.vocabulary;
    container.innerHTML = schema.fields.map(f => {
        const val = values[f.key] || "";
        if (f.options) {
            return `
                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">${escHtml(f.label)}</label>
                    <select data-nbfield="${escHtml(f.key)}" onchange="triggerNoteAutoSave()" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold focus:outline-none">
                        ${f.options.map(o => `<option value="${escHtml(o)}" ${val === o ? "selected" : ""}>${escHtml(o)}</option>`).join("")}
                    </select>
                </div>
            `;
        }
        if (f.multiline) {
            return `
                <div class="md:col-span-2">
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">${escHtml(f.label)}</label>
                    <textarea data-nbfield="${escHtml(f.key)}" rows="3" oninput="triggerNoteAutoSave()" placeholder="${escHtml(f.placeholder || "")}" class="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500">${escHtml(val)}</textarea>
                </div>
            `;
        }
        return `
            <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1">${escHtml(f.label)}</label>
                <input type="text" data-nbfield="${escHtml(f.key)}" value="${escHtml(val)}" oninput="triggerNoteAutoSave()" placeholder="${escHtml(f.placeholder || "")}" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500">
            </div>
        `;
    }).join("");
}

function collectNoteEditorData() {
    const type = document.getElementById("note-type")?.value || "vocabulary";
    const titleRaw = (document.getElementById("note-title")?.value || "").trim();
    const important = Boolean(document.getElementById("note-important-chk")?.checked);
    const content = (document.getElementById("note-content")?.value || "").trim();
    const fields = {};
    document.querySelectorAll("[data-nbfield]").forEach(el => {
        fields[el.getAttribute("data-nbfield")] = el.value.trim();
    });
    const autoTitle = titleRaw || fields.word || fields.grammarTopic || fields.wrongText || fields.topic || fields.prompt || "Ghi chú cá nhân";
    return { type, title: autoTitle, important, fields, content };
}

function triggerNoteAutoSave() {
    if (!editingNoteId) return; // Auto-save immediately updates existing notes
    clearTimeout(noteAutoSaveTimer);
    noteAutoSaveTimer = setTimeout(() => {
        saveNote(true);
    }, 800);
}

function saveNote(isSilentAutoSave = false) {
    const data = collectNoteEditorData();
    if (editingNoteId) {
        const idx = notebookItems.findIndex(n => n.id === editingNoteId);
        if (idx >= 0) {
            notebookItems[idx] = {
                ...notebookItems[idx],
                ...data,
                updatedAt: new Date().toISOString()
            };
            saveNotebook();
        }
    } else {
        const created = addStructuredNote(data, true);
        editingNoteId = created.id;
    }

    const autoLbl = document.getElementById("note-autosave-indicator");
    if (autoLbl) autoLbl.textContent = "Đã tự động lưu ✓";

    renderNotebook();
    if (!isSilentAutoSave) {
        showToast("Đã lưu ghi chú vào English Notebook!");
        closeNoteEditor();
    }
}

function closeNoteEditor() {
    editingNoteId = null;
    document.getElementById("note-editor")?.classList.add("hidden");
}

function toggleNoteImportant(id) {
    const n = notebookItems.find(x => x.id === id);
    if (!n) return;
    n.important = !n.important;
    n.updatedAt = new Date().toISOString();
    saveNotebook();
    renderNotebook();
}

function deleteNoteById(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa ghi chú này khỏi Sổ tay không?")) return;
    notebookItems = notebookItems.filter(n => n.id !== id);
    saveNotebook();
    if (editingNoteId === id) closeNoteEditor();
    renderNotebook();
    showToast("Đã xóa ghi chú!");
}

function deleteCurrentNote() {
    if (editingNoteId) deleteNoteById(editingNoteId);
}

function exportNotebookData(format = "json") {
    if (!notebookItems.length) loadNotebook();
    if (!notebookItems.length) {
        showToast("Sổ ghi chú hiện đang trống!", "warning");
        return;
    }
    let blob, filename;
    if (format === "md") {
        const md = `# QEnglish Personal Notebook (${getLocalDateKey()})\n\n` + notebookItems.map((n, i) => {
            return `## ${i + 1}. [${n.type.toUpperCase()}] ${n.title} ${n.important ? "★" : ""}\n- Cập nhật: ${n.updatedAt}\n- Dữ liệu: \`${JSON.stringify(n.fields)}\`\n\n${n.content || ""}\n`;
        }).join("\n---\n\n");
        blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
        filename = `QEnglish-Notebook-${getLocalDateKey()}.md`;
    } else {
        blob = new Blob([JSON.stringify(notebookItems, null, 2)], { type: "application/json" });
        filename = `QEnglish-Notebook-${getLocalDateKey()}.json`;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(`Đã xuất Sổ ghi chú (${format.toUpperCase()})!`);
}

/* ==================== LEARNING CONTENT MANAGEMENT SYSTEM (PHẦN 5) ==================== */
function renderCMSContentTable() {
    if (!cmsItems.length) loadCMSItems();
    const tbody = document.getElementById("cms-items-list");
    if (!tbody) return;

    const extBox = document.getElementById("cms-external-resources-list");
    if (extBox && typeof EXTERNAL_RESOURCES !== "undefined") {
        extBox.innerHTML = EXTERNAL_RESOURCES.map(ext => `
            <a href="${escHtml(ext.url)}" target="_blank" rel="noopener noreferrer" class="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 transition block space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <span class="font-bold text-xs text-white">${escHtml(ext.title)}</span>
                    ${renderSourceBadge("external-link")}
                </div>
                <p class="text-[11px] text-slate-400">${escHtml(ext.description)}</p>
                <p class="text-[10px] text-cyan-400 font-bold">Nguồn: ${escHtml(ext.sourceName)} • Kỹ năng: ${escHtml(ext.skill.toUpperCase())} ↗</p>
            </a>
        `).join("");
    }

    if (cmsItems.length === 0) {
        tbody.innerHTML = `<p class="text-xs text-slate-500 italic py-4 text-center">Chưa có bài học tự thêm nào (Hệ thống đang có sẵn kho bài mặc định cho cả 5 kỹ năng). Bạn hãy dùng biểu mẫu phía trên để thêm bài mới liên tục!</p>`;
        return;
    }

    tbody.innerHTML = cmsItems.map(item => `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
            <div class="space-y-0.5">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-white">${escHtml(item.title)}</span>
                    ${renderLevelBadge(item.level)}
                    <span class="uppercase text-[10px] font-bold text-cyan-300">${escHtml(item.skill)}</span>
                    ${renderSourceBadge(item.source)}
                </div>
                <p class="text-[11px] text-slate-500">ID: ${escHtml(item.id)} • Chủ đề: ${escHtml(item.topic)} • Tạo ngày: ${new Date(item.createdAt).toLocaleDateString("vi-VN")}</p>
            </div>
            <button onclick='deleteCMSItem(${JSON.stringify(item.id)})' class="px-3 py-1 rounded-lg bg-rose-500/15 text-rose-300 font-bold self-end sm:self-center">Xóa</button>
        </div>
    `).join("");
}

function submitAdminCMSImport() {
    const skill = document.getElementById("cms-skill")?.value || "reading";
    const level = document.getElementById("cms-level")?.value || "B1";
    const title = (document.getElementById("cms-title")?.value || "").trim();
    const topic = (document.getElementById("cms-topic")?.value || "Academic").trim();
    const body = (document.getElementById("cms-body")?.value || "").trim();
    const qText = (document.getElementById("cms-question")?.value || "").trim();
    const qAns = (document.getElementById("cms-answer")?.value || "").trim();

    if (!title || !body) {
        showToast("Vui lòng nhập đầy đủ Tiêu đề và Nội dung bài học!", "error");
        return;
    }

    let payload = {};
    if (skill === "reading") {
        payload = {
            passage: body,
            questions: qText ? [{ type: "short_answer", question: qText, answer: qAns || "True", explanation: "Câu hỏi do người học tự biên soạn." }] : []
        };
    } else if (skill === "listening") {
        const sents = (body.match(/[^.!?]+[.!?]+/g) || [body]).map(s => s.trim()).filter(Boolean);
        payload = {
            type: qText ? "multiple_choice" : "dictation",
            transcript: body,
            audioText: body,
            sentences: sents,
            questions: qText ? [{ question: qText, options: [qAns || "Yes", "No", "Not mentioned"], answer: qAns || "Yes", explanationVi: "Đáp án do người học thiết lập." }] : []
        };
    } else if (skill === "writing") {
        payload = {
            type: "essay",
            prompt: body,
            promptVi: qText || "",
            guidelines: ["Triển khai đầy đủ Mở - Thân - Kết.", "Kiểm tra ngữ pháp và chính tả trước khi nộp."],
            minWords: 100,
            maxWords: 220,
            timeLimit: 25
        };
    } else if (skill === "speaking") {
        payload = {
            type: "monologue",
            prompt: body,
            promptVi: qText || "",
            suggestedQuestions: qAns ? qAns.split(";").map(s => s.trim()).filter(Boolean) : ["What is your main idea?", "Can you give a personal example?"],
            usefulPhrases: ["In my opinion...", "For instance..."],
            sampleAnswer: "",
            duration: 90
        };
    } else if (skill === "grammar") {
        payload = {
            intro: topic,
            explanation: body,
            formula: qText || "S + V + O",
            examples: qAns ? [{ en: qAns, vi: "Ví dụ minh họa" }] : [],
            commonMistakes: [],
            exercises: []
        };
    }

    const res = addCMSContent({
        skill,
        level,
        title,
        topic,
        contentText: body,
        source: "user-imported",
        payload
    });

    if (!res.ok) {
        showToast("Chống trùng lặp: " + res.error, "error");
        return;
    }

    ["cms-title", "cms-body", "cms-question", "cms-answer"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    renderCMSContentTable();
    showToast(`Đã thêm bài "${title}" vào kho ${skill.toUpperCase()}!`);
}

async function generateAIContentPreview() {
    const skill = document.getElementById("ai-gen-skill")?.value || "reading";
    const level = document.getElementById("ai-gen-level")?.value || "B1";
    const topic = (document.getElementById("ai-gen-topic")?.value || "").trim();
    const count = parseInt(document.getElementById("ai-gen-count")?.value || "4", 10) || 4;
    const previewBox = document.getElementById("ai-gen-preview");

    if (!topic) {
        showToast("Hãy nhập Chủ đề muốn tạo bài mới!", "error");
        return;
    }

    if (previewBox) {
        previewBox.classList.remove("hidden");
        previewBox.innerHTML = `<p class="text-xs text-violet-300 animate-pulse">🤖 Đang yêu cầu AI Backend tạo bài học mới (có kiểm duyệt trước khi lưu)...</p>`;
    }

    const res = await AIClient.request("generate-content", { skill, level, topic, questionCount: count });
    if (!res.ok) {
        if (previewBox) {
            previewBox.innerHTML = `
                <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                    <p class="font-bold">⚠️ Không thể tạo tự động bằng AI: ${escHtml(res.error)}</p>
                    <p class="text-slate-300">Nguyên tắc Honest AI: Hệ thống không tự sinh nội dung giả lập AI khi chưa kết nối Backend API. Bạn có thể cấu hình <code>.env</code> cho Backend hoặc dùng mục <strong>Phương pháp 1: Admin Import</strong> bên cạnh để dán bài học mới ngay lập tức.</p>
                </div>
            `;
        }
        return;
    }

    aiGeneratedPreviewCandidate = { skill, level, topic, ...res.data };
    previewBox.innerHTML = `
        <div class="p-4 rounded-2xl bg-slate-950 border border-violet-500/35 space-y-2 text-xs">
            <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-300">✨ Bản xem trước từ AI — Vui lòng kiểm tra trước khi Lưu:</span>
                ${renderSourceBadge("ai-generated")}
            </div>
            <p class="font-extrabold text-white text-sm">${escHtml(aiGeneratedPreviewCandidate.title || topic)}</p>
            <p class="text-slate-300 whitespace-pre-line max-h-40 overflow-y-auto">${escHtml(aiGeneratedPreviewCandidate.contentText || JSON.stringify(aiGeneratedPreviewCandidate.payload || {}))}</p>
            <button onclick="confirmSaveAIGeneratedContent()" class="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold">✅ Xác nhận hợp lệ & Lưu vào kho bài học</button>
        </div>
    `;
}

function confirmSaveAIGeneratedContent() {
    if (!aiGeneratedPreviewCandidate) return;
    const c = aiGeneratedPreviewCandidate;
    const saved = addCMSContent({
        skill: c.skill,
        level: c.level,
        title: c.title || `${c.topic} (${c.level})`,
        topic: c.topic,
        contentText: c.contentText || "",
        source: "ai-generated",
        payload: c.payload || {}
    });
    if (!saved.ok) {
        showToast("Chống trùng lặp: " + saved.error, "error");
        return;
    }
    aiGeneratedPreviewCandidate = null;
    document.getElementById("ai-gen-preview")?.classList.add("hidden");
    renderCMSContentTable();
    showToast("Đã lưu bài học AI vào kho nội dung!");
}

function deleteCMSItem(id) {
    if (!confirm("Xóa bài học tự thêm này khỏi kho nội dung?")) return;
    cmsItems = cmsItems.filter(x => x.id !== id);
    saveCMSItems();
    renderCMSContentTable();
    showToast("Đã xóa bài học khỏi kho mở rộng.");
}
