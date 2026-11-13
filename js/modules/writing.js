/* ==========================================================================
   QEnglish - Writing Studio Module (Upgraded 4x2.5 Rubric + PEN301 + 3 Rewrites)
   Topics (A1-C2 & IELTS & PEN301), Split Editor, Auto-Save Drafts, Timer,
   Inline Grammar/Spell Check, Honest 4-Criterion AI Evaluation & Local Diagnostic
   ========================================================================== */

let activeWritingTopic = null;
let writingTimerId = null;
let writingSecondsLeft = 0;
let writingAutoSaveTimeout = null;
let isWritingEvaluating = false;
let writingAttachmentCache = { name: "", text: "" };

const WRITING_MODE_LABELS = {
    internal_10: "Thang nội bộ 10 điểm (4 × 2.5)",
    ielts: "IELTS Writing (Tham khảo Band)",
    cefr: "CEFR (Tham khảo A1–C2)",
    toefl: "TOEFL Writing (Theo Rubric)",
    custom: "Rubric Tùy Chỉnh",
    pen301: "PEN301 (Chấm theo Rubric & Hướng dẫn Giảng viên)"
};

function getWritingState() {
    return safeParseJSON(localStorage.getItem(STORAGE_KEYS.WRITING), { drafts: {}, submissions: [] });
}

function saveWritingState(st) {
    safeWriteJSON(STORAGE_KEYS.WRITING, st);
}

function filterWritingTopics() {
    const lvFilter = document.getElementById("writing-level-filter")?.value || "all";
    const typeFilter = document.getElementById("writing-type-filter")?.value || "all";
    const listEl = document.getElementById("writing-topics-list");
    if (!listEl) return;

    const allTopics = getAllContentForSkill("writing");
    const st = getWritingState();

    const filtered = allTopics.filter(t => {
        const matchLv = matchesSelectedLevel(t.level || "B1", lvFilter);
        const matchType = typeFilter === "all" || t.type === typeFilter;
        return matchLv && matchType;
    });

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="col-span-full glass-panel rounded-2xl p-8 text-center space-y-3">
                <div class="text-4xl">✍️</div>
                <p class="font-bold text-white">Không có đề viết khớp bộ lọc hiện tại</p>
                <button onclick="document.getElementById('writing-level-filter').value='all'; document.getElementById('writing-type-filter').value='all'; filterWritingTopics();" class="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Xem tất cả ${allTopics.length} đề Writing</button>
            </div>
        `;
    } else {
        listEl.innerHTML = filtered.map(t => {
            const hasDraft = Boolean(st.drafts && st.drafts[t.id]);
            const subCount = (st.submissions || []).filter(s => s.topicId === t.id).length;
            return `
                <div onclick='openWritingEditor(${JSON.stringify(t.id)})' class="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between gap-4 transition">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between gap-2 flex-wrap">
                            <div class="flex items-center gap-2">
                                ${renderLevelBadge(t.level)}
                                <span class="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">${escHtml(t.type || "paragraph")}</span>
                            </div>
                            <div class="flex items-center gap-1.5 text-xs">
                                ${hasDraft ? `<span class="text-amber-300 font-bold">📝 Có nháp</span>` : ""}
                                ${subCount > 0 ? `<span class="text-emerald-400 font-bold">✅ Đã nộp (${subCount})</span>` : ""}
                            </div>
                        </div>
                        <h3 class="text-lg font-extrabold text-white">${escHtml(t.title)}</h3>
                        <p class="text-xs text-slate-300 line-clamp-2">${escHtml(t.prompt)}</p>
                        <p class="text-[11px] text-slate-400 italic">${escHtml(t.promptVi || "")}</p>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span class="text-slate-400">Yêu cầu: ${t.minWords || 60}–${t.maxWords || 180} từ • ⏱ ${t.timeLimit || 20} phút</span>
                        <span class="font-bold text-violet-400">Viết bài →</span>
                    </div>
                </div>
            `;
        }).join("");
    }

    renderSavedWritingsHistory();
}

function renderSavedWritingsHistory() {
    const box = document.getElementById("writing-saved-history");
    if (!box) return;
    const st = getWritingState();
    const subs = (st.submissions || []).slice(0, 12);
    if (!subs.length) {
        box.innerHTML = `<p class="text-xs text-slate-500 italic">Chưa có bài viết nào được lưu. Bài gốc, điểm 4 tiêu chí, 3 bản viết lại và kế hoạch sửa lỗi sẽ xuất hiện tại đây sau khi bạn bấm Nộp bài.</p>`;
        return;
    }

    const aiGradedSubs = subs.filter(s => typeof s.totalScore10 === "number");
    const avg10 = aiGradedSubs.length
        ? (aiGradedSubs.reduce((sum, s) => sum + s.totalScore10, 0) / aiGradedSubs.length).toFixed(1)
        : null;

    box.innerHTML = `
        ${aiGradedSubs.length >= 2 ? `
            <div class="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                <div>
                    <span class="font-extrabold text-violet-200">📈 Theo dõi tiến bộ qua ${aiGradedSubs.length} bài AI đã chấm:</span>
                    <span class="text-slate-300 ml-2">Trung bình: <strong class="text-cyan-300">${avg10}/10</strong> • Bài gần nhất: <strong class="text-emerald-300">${aiGradedSubs[0].totalScore10}/10</strong></span>
                </div>
                <span class="text-[11px] text-slate-400">So sánh chi tiết trong mục Progress</span>
            </div>
        ` : ""}
        ${subs.map((s, idx) => `
            <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 text-xs">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="font-bold text-white text-sm">${escHtml(s.title)}</span>
                        <span class="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-[10px] font-bold text-cyan-300">${escHtml(WRITING_MODE_LABELS[s.gradingMode] || s.gradingMode || "Thang 10")}</span>
                        ${typeof s.totalScore10 === "number" ? `<span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black">${s.totalScore10}/10</span>` : ""}
                        <span class="text-slate-500">${new Date(s.at).toLocaleString("vi-VN")} • ${s.wordCount} từ</span>
                    </div>
                    <div class="flex items-center gap-2">
                        ${renderSourceBadge(s.evalMode === "ai" ? "ai-generated" : "local-browser")}
                        <button onclick="openWritingSubmissionDetail(${idx})" class="px-3 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/35 text-violet-200 font-bold">Xem bài & kết quả</button>
                    </div>
                </div>
                <p class="text-slate-400 line-clamp-2">${escHtml(s.originalText)}</p>
            </div>
        `).join("")}
    `;
}

function openWritingSubmissionDetail(idx) {
    const st = getWritingState();
    const s = (st.submissions || [])[idx];
    if (!s) return;
    openWritingEditor(s.topicId || "custom-writing", {
        id: s.topicId || "custom-writing",
        title: s.title,
        level: s.level || "B1",
        type: "essay",
        prompt: s.prompt || s.title,
        minWords: s.minWords || 80,
        maxWords: s.maxWords || 300,
        timeLimit: 30,
        gradingMode: s.gradingMode || "internal_10"
    });
    const area = document.getElementById("writing-textarea");
    if (area) area.value = s.originalText;
    updateWritingWordCount();
    const evalBox = document.getElementById("writing-evaluation");
    if (evalBox && s.aiReport) {
        evalBox.classList.remove("hidden");
        evalBox.innerHTML = buildWritingEvaluationHTML(s.originalText, s.wordCount, s.aiReport, s.evalMode || "local");
    } else if (evalBox && s.renderedEvalHtml) {
        evalBox.classList.remove("hidden");
        evalBox.innerHTML = s.renderedEvalHtml;
    }
}

function onCustomGradingModeChange() {
    const mode = document.getElementById("writing-custom-grading-mode")?.value || "internal_10";
    const extraBox = document.getElementById("writing-custom-rubric-fields");
    if (extraBox) {
        const showExtra = mode === "pen301" || mode === "custom" || mode === "toefl";
        extraBox.classList.toggle("hidden", !showExtra);
    }
}

function onEditorGradingModeChange() {
    const mode = document.getElementById("writing-editor-grading-mode")?.value || "internal_10";
    const extraBox = document.getElementById("writing-editor-rubric-box");
    if (extraBox) {
        const showExtra = mode === "pen301" || mode === "custom" || mode === "toefl";
        extraBox.classList.toggle("hidden", !showExtra);
    }
    if (activeWritingTopic) activeWritingTopic.gradingMode = mode;
}

function handleWritingGuidelineUpload(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    const statusEl = document.getElementById("writing-guideline-filename");
    if (file.size > 5 * 1024 * 1024) {
        showToast("File hướng dẫn không được vượt quá 5MB.", "error");
        return;
    }
    const isText = file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name);
    if (isText) {
        const reader = new FileReader();
        reader.onload = (e) => {
            writingAttachmentCache = {
                name: file.name,
                text: String(e.target?.result || "").slice(0, 3000)
            };
            if (statusEl) statusEl.textContent = `📎 Đã đính kèm: ${file.name} (${writingAttachmentCache.text.length} ký tự)`;
            showToast(`Đã đọc nội dung tài liệu hướng dẫn "${file.name}"!`);
        };
        reader.readAsText(file);
    } else {
        writingAttachmentCache = {
            name: file.name,
            text: `[File đính kèm: ${file.name} (${Math.round(file.size / 1024)} KB) — Hãy dán các tiêu chí chấm quan trọng vào ô Rubric nếu là PDF/ảnh scan]`
        };
        if (statusEl) statusEl.textContent = `📎 Đã ghi nhận file: ${file.name} (khuyên dán tiêu chí chính vào ô Rubric)`;
        showToast(`Đã ghi nhận file "${file.name}". Nếu là PDF/ảnh, hãy dán tóm tắt tiêu chí vào ô Rubric để AI chấm chính xác hơn.`, "warning");
    }
}

function openCustomWritingEditor() {
    const prompt = (document.getElementById("writing-custom-prompt")?.value || "").trim();
    const title = (document.getElementById("writing-custom-title")?.value || "").trim() || "Bài viết tự do";
    const mode = document.getElementById("writing-custom-grading-mode")?.value || "internal_10";
    const lecturerInstructions = (document.getElementById("writing-custom-lecturer")?.value || "").trim();
    const customRubric = (document.getElementById("writing-custom-rubric")?.value || "").trim();
    const minW = parseInt(document.getElementById("writing-custom-minwords")?.value || "80", 10) || 80;

    openWritingEditor("custom-writing", {
        id: "custom-writing",
        title,
        level: mode === "ielts" ? "IELTS 6.0" : (mode === "pen301" ? "B2" : "B1"),
        type: "essay",
        prompt: prompt || "Bài viết tự do (chưa nhập đề bài cụ thể — hãy dán đề bài nếu muốn chấm sát Task Response).",
        minWords: minW,
        maxWords: Math.max(minW + 150, 350),
        timeLimit: 30,
        gradingMode: mode,
        lecturerInstructions,
        customRubric,
        guidelines: [],
        sampleOutline: [],
        vocabulary: []
    });
}

function openWritingEditor(topicId, customTopic) {
    const allTopics = getAllContentForSkill("writing");
    if (customTopic) window.lastCustomWritingTopic = customTopic;
    const t = customTopic || allTopics.find(x => x.id === topicId) ||
        (topicId === "custom-writing" ? (window.lastCustomWritingTopic || { id: "custom-writing", title: "Bài viết tự do", level: "B1", type: "essay", prompt: "Bài viết tự do.", minWords: 80, timeLimit: 30 }) : null);
    if (!t) return;
    activeWritingTopic = t;

    document.getElementById("writing-custom-panel")?.classList.add("hidden");
    document.getElementById("writing-topics-list")?.classList.add("hidden");
    document.getElementById("writing-filter-bar")?.classList.add("hidden");
    document.getElementById("writing-history-panel")?.classList.add("hidden");
    document.getElementById("writing-editor")?.classList.remove("hidden");
    document.getElementById("writing-evaluation")?.classList.add("hidden");
    document.getElementById("writing-inline-check-box")?.classList.add("hidden");

    const modeSel = document.getElementById("writing-editor-grading-mode");
    if (modeSel) {
        modeSel.value = t.gradingMode || (String(t.level || "").startsWith("IELTS") ? "ielts" : "internal_10");
        onEditorGradingModeChange();
    }
    const lecEl = document.getElementById("writing-editor-lecturer");
    if (lecEl && t.lecturerInstructions !== undefined) lecEl.value = t.lecturerInstructions || "";
    const rubEl = document.getElementById("writing-editor-rubric");
    if (rubEl && t.customRubric !== undefined) rubEl.value = t.customRubric || "";

    document.getElementById("writing-topic-title").innerHTML = `${renderLevelBadge(t.level)} <span class="ml-1">${escHtml(t.title)}</span>`;
    const wImgSrc = t.imageDataUrl || (window.sessionImageUrls && window.sessionImageUrls[t.id]) || "";
    const wPdfSrc = (window.sessionPdfUrls && window.sessionPdfUrls[t.id]) || "";
    document.getElementById("writing-prompt").innerHTML = `
        ${wImgSrc ? `<div class="mb-2"><img src="${escHtml(wImgSrc)}" alt="Ảnh đề bài Writing" class="w-full max-h-[380px] object-contain rounded-xl border border-white/10 bg-black/40"></div>` : ""}
        ${wPdfSrc ? `<div class="mb-2"><iframe src="${escHtml(wPdfSrc)}" title="Đề bài PDF" class="w-full h-[380px] rounded-xl border border-white/10 bg-white"></iframe></div>` : ""}
        <div class="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1.5">
            <p class="font-semibold text-white whitespace-pre-line">${escHtml(t.prompt)}</p>
            ${t.promptVi ? `<p class="text-xs text-slate-400">🇻🇳 ${escHtml(t.promptVi)}</p>` : ""}
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                <label class="text-[10px] text-slate-400 block">Số từ mục tiêu tối thiểu</label>
                <input id="writing-target-min" type="number" value="${t.minWords || 80}" min="20" class="w-full bg-transparent text-cyan-300 font-bold focus:outline-none">
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                <label class="text-[10px] text-slate-400 block">Thời gian làm bài (phút)</label>
                <div class="flex items-center gap-2">
                    <input id="writing-target-time" type="number" value="${t.timeLimit || 25}" min="5" class="w-16 bg-transparent text-cyan-300 font-bold focus:outline-none">
                    <button onclick="startWritingCountdown()" class="px-2 py-0.5 rounded bg-violet-600/30 text-violet-200 text-[11px] font-bold">▶ Đếm giờ</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("writing-guidelines").innerHTML = `
        <div class="space-y-2">
            <p class="text-xs font-extrabold uppercase text-violet-300">📌 Hướng dẫn viết:</p>
            <ul class="list-disc pl-5 text-xs text-slate-300 space-y-1">
                ${(t.guidelines && t.guidelines.length ? t.guidelines : ["Trả lời trực tiếp trọng tâm đề bài, chia đoạn rõ ràng (Mở bài - Thân bài - Kết bài) và kiểm tra lại ngữ pháp trước khi nộp."]).map(g => `<li>${escHtml(g)}</li>`).join("")}
            </ul>
        </div>
        ${(t.sampleOutline && t.sampleOutline.length) ? `
            <div class="space-y-1.5 pt-2 border-t border-white/10">
                <p class="text-xs font-extrabold uppercase text-cyan-300">🗺️ Dàn ý gợi ý:</p>
                <ol class="list-decimal pl-5 text-xs text-slate-300 space-y-1">
                    ${t.sampleOutline.map(o => `<li>${escHtml(o)}</li>`).join("")}
                </ol>
            </div>
        ` : ""}
        ${(t.vocabulary && t.vocabulary.length) ? `
            <div class="space-y-1.5 pt-2 border-t border-white/10">
                <p class="text-xs font-extrabold uppercase text-amber-300">✨ Từ vựng & Cấu trúc ăn điểm (Bấm để chèn vào bài):</p>
                <div class="flex flex-wrap gap-1.5">
                    ${t.vocabulary.map(v => `<button onclick='insertPhraseIntoWriting(${JSON.stringify(v)})' class="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 hover:border-amber-400/50 text-[11px] text-amber-200 transition">+ ${escHtml(v)}</button>`).join("")}
                </div>
            </div>
        ` : ""}
    `;

    const st = getWritingState();
    const draft = (st.drafts && st.drafts[t.id]) || "";
    const area = document.getElementById("writing-textarea");
    if (area) area.value = draft;
    updateWritingWordCount();
    clearInterval(writingTimerId);
    const timerEl = document.getElementById("writing-timer");
    if (timerEl) timerEl.textContent = `⏱ ${t.timeLimit || 25}:00`;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function insertPhraseIntoWriting(phrase) {
    const area = document.getElementById("writing-textarea");
    if (!area) return;
    const clean = phrase.replace(/\.\.\.$/, " ");
    const start = area.selectionStart || area.value.length;
    const end = area.selectionEnd || area.value.length;
    const prefix = start > 0 && !/\s$/.test(area.value.slice(0, start)) ? " " : "";
    area.value = area.value.slice(0, start) + prefix + clean + area.value.slice(end);
    area.focus();
    updateWritingWordCount();
}

function startWritingCountdown() {
    clearInterval(writingTimerId);
    const mins = parseInt(document.getElementById("writing-target-time")?.value || "20", 10) || 20;
    writingSecondsLeft = mins * 60;
    const timerEl = document.getElementById("writing-timer");
    writingTimerId = setInterval(() => {
        writingSecondsLeft--;
        const m = String(Math.floor(Math.max(0, writingSecondsLeft) / 60)).padStart(2, "0");
        const s = String(Math.max(0, writingSecondsLeft) % 60).padStart(2, "0");
        if (timerEl) timerEl.textContent = `⏳ ${m}:${s}`;
        if (writingSecondsLeft <= 0) {
            clearInterval(writingTimerId);
            showToast("Đã hết thời gian làm bài viết! Hãy kiểm tra lại và bấm Nộp bài.", "warning");
        }
    }, 1000);
    showToast(`Bắt đầu tính giờ ${mins} phút!`);
}

function countWordsInEssay(str) {
    const trimmed = String(str || "").trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
}

function updateWritingWordCount() {
    const text = document.getElementById("writing-textarea")?.value || "";
    const wc = countWordsInEssay(text);
    const minTarget = parseInt(document.getElementById("writing-target-min")?.value || activeWritingTopic?.minWords || "80", 10);
    const el = document.getElementById("writing-word-count");
    if (el) {
        el.textContent = `${wc} / ${minTarget}+ từ`;
        el.className = wc >= minTarget ? "text-emerald-400 font-bold" : "text-amber-300 font-bold";
    }

    clearTimeout(writingAutoSaveTimeout);
    writingAutoSaveTimeout = setTimeout(() => {
        if (!activeWritingTopic) return;
        const st = getWritingState();
        if (!st.drafts) st.drafts = {};
        st.drafts[activeWritingTopic.id] = text;
        saveWritingState(st);
        const autoLabel = document.getElementById("writing-autosave-status");
        if (autoLabel) autoLabel.textContent = "Đã lưu tự động ✓";
    }, 700);
}

function saveWritingDraft() {
    if (!activeWritingTopic) return;
    const text = document.getElementById("writing-textarea")?.value || "";
    const st = getWritingState();
    if (!st.drafts) st.drafts = {};
    st.drafts[activeWritingTopic.id] = text;
    saveWritingState(st);
}

function runInlineWritingCheck() {
    const raw = (document.getElementById("writing-textarea")?.value || "").trim();
    const box = document.getElementById("writing-inline-check-box");
    if (!box) return;
    if (!raw) {
        showToast("Hãy viết ít nhất một câu để kiểm tra!", "error");
        return;
    }

    const sentences = raw.match(/[^.!?]+[.!?]*/g) || [raw];
    const sentenceDiags = sentences.map(s => ({ raw: s.trim(), diag: analyzeEnglishTextLocal(s.trim()) })).filter(x => x.raw);
    const totalIssues = sentenceDiags.reduce((acc, s) => acc + s.diag.issues.length, 0);

    box.classList.remove("hidden");
    if (totalIssues === 0) {
        box.innerHTML = `<div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-bold">✅ Không phát hiện lỗi chính tả, viết hoa hay cấu trúc cơ bản trong ${sentenceDiags.length} câu!</div>`;
        return;
    }

    box.innerHTML = `
        <div class="p-4 rounded-2xl bg-slate-950/95 border border-rose-500/30 space-y-2.5 text-xs">
            <div class="flex items-center justify-between">
                <span class="font-bold text-rose-300">🔍 Phát hiện ${totalIssues} điểm cần sửa trong bài viết:</span>
                <button onclick="document.getElementById('writing-inline-check-box').classList.add('hidden')" class="text-slate-400 hover:text-white">✕</button>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 text-sm leading-relaxed text-white">
                ${sentenceDiags.map(s => s.diag.highlightedHtml).join(" ")}
            </div>
            <ul class="list-disc pl-5 space-y-1 text-rose-200">
                ${sentenceDiags.flatMap(s => s.diag.issues).slice(0, 12).map(iss =>
                    `<li><strong>[${escHtml(iss.errorType)}]</strong> "${escHtml(iss.original)}" → <code class="text-emerald-300">${escHtml(iss.suggestion)}</code> (${escHtml(iss.explanationVi)})</li>`
                ).join("")}
            </ul>
        </div>
    `;
}

function setWritingLoadingState(loading) {
    isWritingEvaluating = loading;
    const btn = document.getElementById("writing-submit-btn");
    if (btn) {
        btn.disabled = loading;
        btn.classList.toggle("opacity-60", loading);
        btn.innerHTML = loading
            ? "⏳ Đang gửi tới AI Backend để chấm 4 tiêu chí & 3 phiên bản..."
            : "✨ Chấm Chi Tiết 4 Tiêu Chí & 3 Bản Viết Lại";
    }
}

async function submitWriting() {
    if (!activeWritingTopic || isWritingEvaluating) return;
    clearInterval(writingTimerId);
    const text = (document.getElementById("writing-textarea")?.value || "").trim();
    const wc = countWordsInEssay(text);
    if (wc < 10) {
        showToast("Bài viết quá ngắn (cần ít nhất 10 từ để đánh giá)!", "error");
        return;
    }

    const gradingMode = document.getElementById("writing-editor-grading-mode")?.value || activeWritingTopic.gradingMode || "internal_10";
    const lecturerInstructions = (document.getElementById("writing-editor-lecturer")?.value || activeWritingTopic.lecturerInstructions || "").trim();
    const customRubric = (document.getElementById("writing-editor-rubric")?.value || activeWritingTopic.customRubric || "").trim();
    const minWords = parseInt(document.getElementById("writing-target-min")?.value || activeWritingTopic.minWords || "80", 10);

    const evalBox = document.getElementById("writing-evaluation");
    evalBox.classList.remove("hidden");
    evalBox.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-950 border border-violet-500/35 text-center space-y-2 text-xs">
            <p class="text-sm text-violet-300 font-extrabold animate-pulse">⏳ Đang phân tích bài viết (${wc} từ) theo chế độ: ${escHtml(WRITING_MODE_LABELS[gradingMode] || gradingMode)}...</p>
            <p class="text-slate-400">Quá trình chấm 4 tiêu chí, bóc từng câu lỗi, kế hoạch 9 bước và tạo 3 phiên bản viết lại cần khoảng 5–15 giây.</p>
        </div>
    `;

    setWritingLoadingState(true);
    let aiRes;
    try {
        aiRes = await AIClient.request("writing-eval", {
            topic: activeWritingTopic.title,
            prompt: activeWritingTopic.prompt,
            gradingMode,
            targetLevel: activeWritingTopic.level,
            minWords,
            maxWords: activeWritingTopic.maxWords || 350,
            lecturerInstructions,
            customRubric,
            attachmentName: writingAttachmentCache.name,
            attachmentText: writingAttachmentCache.text,
            essay: text
        });
    } finally {
        setWritingLoadingState(false);
    }

    if (aiRes.ok && aiRes.data) {
        renderWritingEvaluationResult(text, wc, aiRes.data, "ai", gradingMode);
        return;
    }

    // Honest Local Rule-Based Diagnostic Fallback (Never pretends 10/10 AI rubric grading!)
    const localResult = buildLocalWritingEvaluation(text, wc, activeWritingTopic, aiRes.error, gradingMode);
    renderWritingEvaluationResult(text, wc, localResult, "local", gradingMode);
}

function buildLocalWritingEvaluation(text, wordCount, topic, aiOfflineReason, gradingMode = "internal_10") {
    const minW = parseInt(document.getElementById("writing-target-min")?.value || topic.minWords || "80", 10);
    const sentences = (text.match(/[^.!?]+[.!?]*/g) || [text]).map(s => s.trim()).filter(Boolean);
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
    const connectors = ["however", "therefore", "moreover", "furthermore", "first", "second", "finally", "in conclusion", "because", "although", "for example", "for instance", "on the other hand", "in addition"];
    const lowerText = text.toLowerCase();
    const usedConnectors = connectors.filter(c => lowerText.includes(c));

    const sentenceBreakdown = [];
    const correctedSentences = [];

    sentences.forEach(sent => {
        const d = analyzeEnglishTextLocal(sent);
        correctedSentences.push(d.correctedText);
        if (!d.isValid) {
            d.issues.forEach(iss => {
                sentenceBreakdown.push({
                    originalSentence: sent,
                    correctedSentence: d.correctedText,
                    errorType: iss.errorType,
                    severity: "major",
                    explanationVi: iss.explanationVi,
                    improvementTipVi: `Sửa trực tiếp thành: "${d.correctedText}"`,
                    similarExample: ""
                });
                autoLogMistake({
                    errorCategory: iss.errorType.includes("chính tả") ? "Sai chính tả" : "Sai ngữ pháp",
                    wrongText: sent,
                    correctText: d.correctedText,
                    explanation: iss.explanationVi,
                    skill: "writing"
                });
            });
        }
    });

    const strengths = [];
    const weaknesses = [];
    if (wordCount >= minW) strengths.push(`Đạt yêu cầu độ dài (${wordCount} / tối thiểu ${minW} từ).`);
    else weaknesses.push(`Thiếu độ dài yêu cầu (${wordCount} / tối thiểu ${minW} từ).`);

    if (usedConnectors.length >= 2) strengths.push(`Có sử dụng từ nối: ${usedConnectors.join(", ")}.`);
    else weaknesses.push("Thiếu các từ nối chuyển ý (However, Therefore, For example, In conclusion...).");

    if (paragraphs.length >= 2 || topic.type === "paragraph") strengths.push(`Bố cục đoạn văn rõ (${paragraphs.length} đoạn, ${sentences.length} câu).`);
    else weaknesses.push("Cần tách thành Mở bài - Thân bài - Kết bài rõ ràng.");

    if (sentenceBreakdown.length === 0) strengths.push("Không phát hiện lỗi chính tả / cấu trúc quy tắc cơ bản.");
    else weaknesses.push(`Phát hiện ${sentenceBreakdown.length} lỗi chính tả/quy tắc câu cơ bản cần sửa.`);

    const heuristicScore = Math.max(30, Math.min(92,
        84 - sentenceBreakdown.length * 6 - (wordCount < minW ? 14 : 0) + Math.min(8, usedConnectors.length * 3)
    ));

    return {
        isLocalFallback: true,
        gradingMode,
        offlineNotice: aiOfflineReason || "AI Backend chưa được kết nối.",
        totalScore10: null, // Strictly null: local regex NEVER fakes a 4x2.5 academic AI score!
        scorePct: heuristicScore,
        cefrEstimate: null,
        ieltsEstimate: null,
        missingFromRubric: [
            "Cần kết nối Backend AI để chấm nội dung học thuật theo đề bài, rubric giảng viên và ước lượng CEFR/IELTS thực."
        ],
        criteria: null,
        overviewVi: `Bộ kiểm tra cục bộ đã rà ${wordCount} từ (${sentences.length} câu) về chính tả, viết hoa, từ nối và số từ. Đây KHÔNG phải chấm điểm học thuật bằng AI.`,
        sentenceBreakdown,
        improvementPlan: {
            strengths,
            weaknesses,
            priorityErrors: sentenceBreakdown.slice(0, 3).map(e => `${e.errorType}: ${e.explanationVi}`),
            fixGuides: [
                "Kiểm tra sự hòa hợp Chủ ngữ – Động từ (S + V) và thì của động từ ở mỗi câu.",
                "Bổ sung ít nhất 3 từ nối học thuật (Furthermore, In contrast, Consequently) để tăng mạch lạc.",
                "Kết nối AI Backend trên Vercel (GEMINI_API_KEY / OPENAI_API_KEY) để mở khóa chấm 4 tiêu chí x 2.5 điểm và 3 bản viết lại hoàn chỉnh."
            ],
            vocabularyToLearn: [],
            grammarToReview: [],
            ideaDevelopment: ["Đưa ra 1 luận điểm + 1 giải thích + 1 ví dụ cụ thể cho mỗi đoạn thân bài."],
            targetedExercises: [],
            nextEssayActionPlan: ["Sửa lại toàn bộ các lỗi trong bảng trên rồi nộp lại khi AI Backend hoạt động."]
        },
        rewrittenVersions: {
            corrected: {
                text: correctedSentences.join(" "),
                changesSummaryVi: "Bản tự động sửa lỗi chính tả, viết hoa và cấu trúc quy tắc cơ bản (cục bộ)."
            },
            improved: null,
            advanced: null
        },
        revisedEssay: correctedSentences.join(" ")
    };
}

function switchRewriteVersionTab(tabKey) {
    document.querySelectorAll(".rewrite-tab-btn").forEach(btn => {
        const active = btn.getAttribute("data-rtab") === tabKey;
        btn.className = `rewrite-tab-btn px-3.5 py-2 rounded-xl text-xs font-extrabold border transition ${active
            ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
            : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"}`;
    });
    document.querySelectorAll(".rewrite-tab-panel").forEach(p => {
        p.classList.toggle("hidden", p.id !== `rewrite-panel-${tabKey}`);
    });
}

function checkTargetedWritingExercise(btnEl, expectedAnswer) {
    const wrap = btnEl.closest(".targeted-ex-card");
    const input = wrap?.querySelector("input");
    const fb = wrap?.querySelector(".targeted-ex-fb");
    if (!input || !fb) return;
    const ans = input.value.trim().toLowerCase();
    const exp = String(expectedAnswer || "").trim().toLowerCase();
    fb.classList.remove("hidden");
    const isClose = ans && (ans === exp || exp.includes(ans) || textSimilarityBasic(ans, exp) >= 0.75);
    fb.innerHTML = isClose
        ? `<p class="text-emerald-300 font-bold mt-1">✅ Chính xác / Gần chuẩn! Đáp án tham khảo: "${escHtml(expectedAnswer)}"</p>`
        : `<p class="text-amber-300 font-bold mt-1">💡 Đáp án gợi ý: <span class="text-white">"${escHtml(expectedAnswer)}"</span></p>`;
}

function quickSaveWritingVocab(word, meaningVi, example) {
    const clean = String(word || "").trim();
    if (!clean) return;
    if (deck.some(d => d.term.toLowerCase() === clean.toLowerCase())) {
        showToast(`Từ "${clean}" đã có trong Kho Từ Vựng!`, "warning");
        return;
    }
    deck.unshift(normalizeWordItem({
        id: Date.now() + Math.random(),
        day: 1,
        term: clean,
        ipa: "/.../",
        pos: "vocab",
        def: meaningVi || clean,
        example: example || "",
        category: "Writing Upgrade",
        level: activeWritingTopic?.level || "B2",
        starred: true,
        source: "ai-generated"
    }));
    saveDeckToStorage();
    showToast(`Đã lưu "${clean}" vào Kho Từ Vựng cá nhân!`);
}

function buildWritingEvaluationHTML(originalText, wordCount, r, evalMode) {
    const isAi = evalMode === "ai";
    const severityColors = {
        critical: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        major: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        minor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
    };

    const critList = r.criteria
        ? [r.criteria.taskResponse, r.criteria.coherenceCohesion, r.criteria.lexicalResource, r.criteria.grammarAccuracy].filter(Boolean)
        : [];
    const breakdown = Array.isArray(r.sentenceBreakdown) ? r.sentenceBreakdown : (r.corrections || []);
    const plan = r.improvementPlan || {};
    const rw = r.rewrittenVersions || {};

    return `
        <div class="p-5 sm:p-6 rounded-3xl bg-slate-950/95 border border-violet-500/35 space-y-6 text-xs">
            <!-- Honest AI / Source Banner -->
            <div class="p-4 rounded-2xl ${isAi ? "bg-violet-500/15 border-violet-500/30" : "bg-amber-500/10 border-amber-500/30"} border flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-1 max-w-3xl">
                    <p class="font-extrabold text-sm ${isAi ? "text-violet-200" : "text-amber-300"}">
                        ${isAi
                            ? `🤖 Kết Quả Chấm Bài AI — ${escHtml(WRITING_MODE_LABELS[r.gradingMode] || r.gradingMode || "Thang 10")}`
                            : "🛠️ Kiểm Tra Cục Bộ Cơ Bản (Chưa kết nối AI Server)"}
                    </p>
                    <p class="text-slate-300 leading-relaxed">
                        ${isAi
                            ? (r.modeAssessmentSummary ? escHtml(r.modeAssessmentSummary) : "⚠️ Lưu ý minh bạch: Điểm số thang 10, CEFR và IELTS Band là đánh giá tham khảo phục vụ học tập, không thay thế chứng chỉ thi chính thức.")
                            : `${escHtml(r.offlineNotice)} Hệ thống KHÔNG tự bịa điểm AI 10/10 hay 3 bản viết lại khi Backend AI chưa kết nối. Hãy cấu hình GEMINI_API_KEY hoặc OPENAI_API_KEY trong Settings/Vercel để chấm sâu.`}
                    </p>
                </div>
                ${renderSourceBadge(isAi ? "ai-generated" : "local-browser")}
            </div>

            <!-- 1. Tổng Điểm /10 & Tham Khảo CEFR / IELTS -->
            <div class="grid sm:grid-cols-3 gap-3">
                <div class="p-4 rounded-2xl bg-slate-900 border border-white/10">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">${isAi ? "Tổng điểm Rubric (4 × 2.5)" : "Chỉ số kỹ thuật cục bộ"}</span>
                    <p class="text-2xl font-black text-cyan-300 mt-1">
                        ${typeof r.totalScore10 === "number" ? `${r.totalScore10} / 10` : `${r.scorePct ?? 0}% (Kỹ thuật)`}
                    </p>
                </div>
                <div class="p-4 rounded-2xl bg-slate-900 border border-white/10">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Ước lượng CEFR (Tham khảo)</span>
                    <p class="text-base font-black text-violet-300 mt-1">${escHtml(r.cefrEstimate || "Cần kết nối AI Backend")}</p>
                </div>
                <div class="p-4 rounded-2xl bg-slate-900 border border-white/10">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Ước lượng IELTS (Tham khảo)</span>
                    <p class="text-base font-black text-amber-300 mt-1">${escHtml(r.ieltsEstimate || "Cần kết nối AI Backend")}</p>
                </div>
            </div>

            ${(r.missingFromRubric && r.missingFromRubric.length) ? `
                <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                    <p class="font-extrabold text-rose-300">📌 Điểm thiếu so với Đề bài / Rubric / Yêu cầu giảng viên:</p>
                    <ul class="list-disc pl-5 text-slate-200 space-y-1">
                        ${r.missingFromRubric.map(m => `<li>${escHtml(m)}</li>`).join("")}
                    </ul>
                </div>
            ` : ""}

            <!-- 2. 4 Tiêu Chí Học Thuật (2.5đ / Tiêu Chí) -->
            ${critList.length > 0 ? `
                <div class="space-y-3">
                    <h4 class="font-extrabold text-white uppercase tracking-wider">📊 Bảng Điểm Chi Tiết 4 Tiêu Chí (Mỗi tiêu chí tối đa 2.5 điểm = 10 điểm)</h4>
                    <div class="grid md:grid-cols-2 gap-3.5">
                        ${critList.map(c => `
                            <div class="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2.5">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-extrabold text-white text-sm">${escHtml(c.label)}</span>
                                    <span class="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-black text-sm">${Number(c.scoreOutOf2_5).toFixed(1)} / 2.5</span>
                                </div>
                                <p class="text-slate-300 leading-relaxed">${escHtml(c.feedbackVi || "")}</p>
                                ${c.achieved?.length ? `<div class="text-emerald-300"><strong>✅ Đạt được:</strong> ${c.achieved.map(a => escHtml(a)).join(" • ")}</div>` : ""}
                                ${c.missing?.length ? `<div class="text-amber-300"><strong>⚠️ Còn thiếu:</strong> ${c.missing.map(m => escHtml(m)).join(" • ")}</div>` : ""}
                                ${c.errors?.length ? `
                                    <div class="space-y-1 pt-1">
                                        ${c.errors.map(er => `
                                            <div class="flex items-start gap-2">
                                                <span class="px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${severityColors[er.severity] || severityColors.major}">${escHtml(er.severity || "major")}</span>
                                                <span class="text-slate-300">${escHtml(er.issue)} → <strong class="text-emerald-300">${escHtml(er.fix)}</strong></span>
                                            </div>
                                        `).join("")}
                                    </div>
                                ` : ""}
                            </div>
                        `).join("")}
                    </div>
                </div>
            ` : ""}

            <!-- Nhận xét tổng quan -->
            <div class="p-4 rounded-2xl bg-slate-900 border border-white/10">
                <p class="font-bold text-slate-200 leading-relaxed">${escHtml(r.overviewVi || "")}</p>
            </div>

            <!-- 3. Bảng Sửa Từng Câu Chi Tiết -->
            <div class="space-y-2.5">
                <h4 class="font-extrabold text-white uppercase tracking-wider">🔎 Phân Tích Lỗi Từng Câu & Hướng Dẫn Sửa</h4>
                ${breakdown.length > 0 ? `
                    <div class="overflow-x-auto rounded-2xl border border-white/10">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-900 text-slate-300">
                                <tr>
                                    <th class="p-3 border-b border-white/10">Câu gốc</th>
                                    <th class="p-3 border-b border-white/10">Loại / Mức độ</th>
                                    <th class="p-3 border-b border-white/10">Câu sửa chuẩn</th>
                                    <th class="p-3 border-b border-white/10">Giải thích & Cách nâng cấp</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                ${breakdown.map(c => `
                                    <tr>
                                        <td class="p-3 text-rose-300 align-top">${escHtml(c.originalSentence)}</td>
                                        <td class="p-3 align-top space-y-1">
                                            <span class="block font-bold text-amber-300">${escHtml(c.errorType)}</span>
                                            <span class="inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${severityColors[c.severity] || severityColors.major}">${escHtml(c.severity || "major")}</span>
                                        </td>
                                        <td class="p-3 text-emerald-300 font-semibold align-top">${escHtml(c.correctedSentence)}</td>
                                        <td class="p-3 text-slate-300 align-top space-y-1">
                                            <p>${escHtml(c.explanationVi)}</p>
                                            ${c.improvementTipVi ? `<p class="text-cyan-300">💡 Nâng cấp: ${escHtml(c.improvementTipVi)}</p>` : ""}
                                            ${c.similarExample ? `<p class="text-slate-400 italic">Ví dụ tương tự: "${escHtml(c.similarExample)}"</p>` : ""}
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                ` : `<p class="text-emerald-300 font-bold">✅ Không phát hiện lỗi câu nghiêm trọng nào!</p>`}
            </div>

            <!-- 4. 3 Phiên Bản Viết Lại Hoàn Chỉnh -->
            <div class="space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h4 class="font-extrabold text-emerald-300 uppercase tracking-wider">✨ 3 Phiên Bản Viết Lại (Giữ Nguyên Ý Gốc)</h4>
                    <div class="flex flex-wrap gap-1.5">
                        <button data-rtab="corrected" onclick="switchRewriteVersionTab('corrected')" class="rewrite-tab-btn px-3.5 py-2 rounded-xl text-xs font-extrabold border bg-emerald-500/20 border-emerald-400/50 text-emerald-200">1. Corrected (Chuẩn ngữ pháp)</button>
                        <button data-rtab="improved" onclick="switchRewriteVersionTab('improved')" class="rewrite-tab-btn px-3.5 py-2 rounded-xl text-xs font-extrabold border bg-slate-950 border-white/10 text-slate-400 hover:text-white ${!rw.improved ? "opacity-50" : ""}">2. Improved (Mượt & Mạch lạc)</button>
                        <button data-rtab="advanced" onclick="switchRewriteVersionTab('advanced')" class="rewrite-tab-btn px-3.5 py-2 rounded-xl text-xs font-extrabold border bg-slate-950 border-white/10 text-slate-400 hover:text-white ${!rw.advanced ? "opacity-50" : ""}">3. Advanced (Học thuật C1+)</button>
                    </div>
                </div>

                ${["corrected", "improved", "advanced"].map((key, idx) => {
                    const ver = rw[key];
                    const hiddenCls = idx === 0 ? "" : "hidden";
                    if (!ver || !ver.text) {
                        return `<div id="rewrite-panel-${key}" class="rewrite-tab-panel ${hiddenCls} p-4 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 italic">Phiên bản này yêu cầu kết nối AI Backend thực để tái cấu trúc toàn văn theo đúng ý của bạn.</div>`;
                    }
                    return `
                        <div id="rewrite-panel-${key}" class="rewrite-tab-panel ${hiddenCls} p-4 rounded-2xl bg-slate-900 border border-emerald-500/25 space-y-3">
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-[11px] font-bold text-cyan-300">Thay đổi chính: ${escHtml(ver.changesSummaryVi || "")}</span>
                                <button onclick='speakText(${JSON.stringify(ver.text)}, 1.0)' class="px-3 py-1 rounded-lg bg-slate-950 border border-white/10 text-cyan-300 font-bold shrink-0">🔊 Nghe đọc bản này</button>
                            </div>
                            <p class="text-sm text-slate-100 leading-relaxed whitespace-pre-line">${escHtml(ver.text)}</p>
                        </div>
                    `;
                }).join("")}
            </div>

            <!-- 5. Kế Hoạch Sửa Bài 9 Phần & Luyện Lỗi Thực Tế -->
            <div class="space-y-4 pt-2 border-t border-white/10">
                <h4 class="font-extrabold text-cyan-300 uppercase tracking-wider">🧭 Kế Hoạch Cải Thiện 9 Điểm Từ Bài Viết Của Bạn</h4>
                <div class="grid md:grid-cols-2 gap-3">
                    <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                        <p class="font-bold text-emerald-300">1. Điểm mạnh đã đạt:</p>
                        <ul class="list-disc pl-4 text-slate-200 space-y-1">${(plan.strengths || []).map(s => `<li>${escHtml(s)}</li>`).join("") || "<li>Chưa có dữ liệu.</li>"}</ul>
                    </div>
                    <div class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                        <p class="font-bold text-rose-300">2. Điểm yếu cần khắc phục:</p>
                        <ul class="list-disc pl-4 text-slate-200 space-y-1">${(plan.weaknesses || []).map(w => `<li>${escHtml(w)}</li>`).join("") || "<li>Chưa có dữ liệu.</li>"}</ul>
                    </div>
                    <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                        <p class="font-bold text-amber-300">3. Lỗi ưu tiên sửa trước:</p>
                        <ul class="list-disc pl-4 text-slate-200 space-y-1">${(plan.priorityErrors || []).map(e => `<li>${escHtml(e)}</li>`).join("") || "<li>Không có lỗi nghiêm trọng nổi bật.</li>"}</ul>
                    </div>
                    <div class="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                        <p class="font-bold text-cyan-300">4. Quy tắc sửa từng lỗi cụ thể:</p>
                        <ul class="list-disc pl-4 text-slate-300 space-y-1">${(plan.fixGuides || []).map(g => `<li>${escHtml(g)}</li>`).join("") || "<li>Áp dụng kiểm tra S-V & dấu câu cuối câu.</li>"}</ul>
                    </div>
                </div>

                ${(plan.vocabularyToLearn && plan.vocabularyToLearn.length) ? `
                    <div class="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                        <p class="font-bold text-violet-300">5. Từ vựng / Collocation nên học từ bài này (Bấm để lưu vào Kho Từ):</p>
                        <div class="grid sm:grid-cols-2 gap-2">
                            ${plan.vocabularyToLearn.map(v => `
                                <div class="p-2.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-2">
                                    <div>
                                        <span class="font-extrabold text-white">${escHtml(v.word)}</span>
                                        <span class="text-amber-300 ml-1">— ${escHtml(v.meaningVi || "")}</span>
                                        ${v.usageExample ? `<p class="text-[11px] text-slate-400 italic">${escHtml(v.usageExample)}</p>` : ""}
                                    </div>
                                    <button onclick='quickSaveWritingVocab(${JSON.stringify(v.word)}, ${JSON.stringify(v.meaningVi || "")}, ${JSON.stringify(v.usageExample || "")})' class="px-2.5 py-1 rounded-lg bg-violet-600/30 text-violet-200 font-bold shrink-0">➕ Lưu</button>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}

                <div class="grid md:grid-cols-2 gap-3">
                    <div class="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1.5">
                        <p class="font-bold text-cyan-300">6. Điểm ngữ pháp cần ôn:</p>
                        ${(plan.grammarToReview && plan.grammarToReview.length)
                            ? plan.grammarToReview.map(g => `<div class="p-2 rounded-lg bg-slate-950 border border-white/5"><strong class="text-white">${escHtml(g.topic)}</strong>: <span class="text-slate-300">${escHtml(g.explanationVi || "")}</span> ${g.formula ? `<code class="text-amber-300 block">${escHtml(g.formula)}</code>` : ""}</div>`).join("")
                            : `<p class="text-slate-400">Xem lại các thì cơ bản, mệnh đề quan hệ và từ nối.</p>`}
                    </div>
                    <div class="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1.5">
                        <p class="font-bold text-amber-300">7 & 9. Phát triển ý & Kế hoạch bài sau:</p>
                        <ul class="list-disc pl-4 text-slate-300 space-y-1">
                            ${(plan.ideaDevelopment || []).concat(plan.nextEssayActionPlan || []).map(x => `<li>${escHtml(x)}</li>`).join("") || "<li>Lập dàn ý 2 phút trước khi viết để đảm bảo đủ ý & dẫn chứng.</li>"}
                        </ul>
                    </div>
                </div>

                ${(plan.targetedExercises && plan.targetedExercises.length) ? `
                    <div class="p-4 rounded-2xl bg-violet-950/25 border border-violet-500/30 space-y-3">
                        <p class="font-extrabold text-violet-200">8. Bài Tập Luyện Tập Ngay Từ Lỗi Sai Của Bạn:</p>
                        <div class="space-y-2.5">
                            ${plan.targetedExercises.map((ex, i) => `
                                <div class="targeted-ex-card p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1.5">
                                    <p class="font-bold text-white">Câu ${i + 1}: ${escHtml(ex.prompt || "")} — <span class="text-cyan-300">${escHtml(ex.question || "")}</span></p>
                                    <div class="flex flex-wrap gap-2">
                                        <input type="text" placeholder="Nhập câu sửa lại của bạn..." class="flex-1 min-w-[200px] bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-white">
                                        <button onclick='checkTargetedWritingExercise(this, ${JSON.stringify(ex.answer || "")})' class="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">Kiểm tra</button>
                                    </div>
                                    <div class="targeted-ex-fb hidden text-[11px]"></div>
                                    ${ex.explanationVi ? `<p class="text-[11px] text-slate-400">💡 ${escHtml(ex.explanationVi)}</p>` : ""}
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
            </div>
        </div>
    `;
}

function renderWritingEvaluationResult(originalText, wordCount, r, evalMode, gradingMode = "internal_10") {
    const evalBox = document.getElementById("writing-evaluation");
    if (!evalBox) return;

    const html = buildWritingEvaluationHTML(originalText, wordCount, r, evalMode);
    evalBox.innerHTML = html;

    const sub = {
        id: "wsub-" + Date.now(),
        topicId: activeWritingTopic.id,
        title: activeWritingTopic.title,
        level: activeWritingTopic.level,
        gradingMode: r.gradingMode || gradingMode,
        prompt: activeWritingTopic.prompt || "",
        minWords: activeWritingTopic.minWords || 80,
        maxWords: activeWritingTopic.maxWords || 350,
        wordCount,
        originalText,
        revisedEssay: r.revisedEssay || originalText,
        totalScore10: typeof r.totalScore10 === "number" ? r.totalScore10 : null,
        scorePct: r.scorePct ?? 75,
        criteria: r.criteria || null,
        aiReport: r,
        evalMode,
        at: new Date().toISOString()
    };

    const st = getWritingState();
    if (!Array.isArray(st.submissions)) st.submissions = [];
    st.submissions.unshift(sub);
    if (st.submissions.length > 60) st.submissions = st.submissions.slice(0, 60);
    saveWritingState(st);

    if (typeof CloudClient !== "undefined") {
        CloudClient.syncWritingSubmissionRecord(sub);
    }

    addStructuredNote({
        type: "writing",
        title: `Writing: ${activeWritingTopic.title}${typeof r.totalScore10 === "number" ? ` (${r.totalScore10}/10)` : ""} (${wordCount} từ)`,
        important: false,
        source: evalMode === "ai" ? "ai-generated" : "local-browser",
        fields: {
            prompt: activeWritingTopic.prompt,
            originalEssay: originalText,
            revisedEssay: r.revisedEssay || originalText,
            feedbackSummary: r.overviewVi || ""
        },
        content: `[Bài gốc]\n${originalText}\n\n[Bản đã chỉnh sửa]\n${r.revisedEssay || originalText}`
    }, true);

    logStudyMetrics(
        {
            writingDone: 1,
            scoreEntry: { skill: "writing", scorePct: r.scorePct ?? 75, level: activeWritingTopic.level, title: activeWritingTopic.title }
        },
        { type: "writing", skill: "writing", title: `Nộp bài Writing: ${activeWritingTopic.title} (${wordCount} từ)`, scorePct: r.scorePct ?? 75 }
    );
    showToast("Đã đánh giá và lưu bài viết vào Lịch sử & Writing Notebook!");
}

function closeWritingEditor() {
    clearInterval(writingTimerId);
    activeWritingTopic = null;
    document.getElementById("writing-editor")?.classList.add("hidden");
    document.getElementById("writing-custom-panel")?.classList.remove("hidden");
    document.getElementById("writing-topics-list")?.classList.remove("hidden");
    document.getElementById("writing-filter-bar")?.classList.remove("hidden");
    document.getElementById("writing-history-panel")?.classList.remove("hidden");
    filterWritingTopics();
}
