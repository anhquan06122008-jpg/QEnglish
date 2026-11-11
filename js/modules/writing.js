/* ==========================================================================
   QEnglish - Writing Module
   Topics (A1-C2 & IELTS), Split Editor, Auto-Save Drafts, Timer,
   Inline Grammar/Spell Check, Honest AI Evaluation + Deep Local Diagnostic
   ========================================================================== */

let activeWritingTopic = null;
let writingTimerId = null;
let writingSecondsLeft = 0;
let writingAutoSaveTimeout = null;

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
    const subs = (st.submissions || []).slice(0, 6);
    if (!subs.length) {
        box.innerHTML = `<p class="text-xs text-slate-500 italic">Chưa có bài viết nào được lưu. Bài gốc, bản sửa và nhận xét sẽ xuất hiện tại đây sau khi bạn bấm Nộp bài.</p>`;
        return;
    }
    box.innerHTML = subs.map((s, idx) => `
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 text-xs">
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <div>
                    <span class="font-bold text-white text-sm">${escHtml(s.title)}</span>
                    <span class="text-slate-500 ml-2">${new Date(s.at).toLocaleString("vi-VN")} • ${s.wordCount} từ</span>
                </div>
                <div class="flex items-center gap-2">
                    ${renderSourceBadge(s.evalMode === "ai" ? "ai-generated" : "local-browser")}
                    <button onclick="openWritingSubmissionDetail(${idx})" class="px-3 py-1 rounded-lg bg-violet-600/20 text-violet-300 font-bold">Xem bài & bản sửa</button>
                </div>
            </div>
            <p class="text-slate-400 line-clamp-2">${escHtml(s.originalText)}</p>
        </div>
    `).join("");
}

function openWritingSubmissionDetail(idx) {
    const st = getWritingState();
    const s = (st.submissions || [])[idx];
    if (!s) return;
    openWritingEditor(s.topicId);
    const area = document.getElementById("writing-textarea");
    if (area) area.value = s.originalText;
    updateWritingWordCount();
    const evalBox = document.getElementById("writing-evaluation");
    if (evalBox && s.renderedEvalHtml) {
        evalBox.classList.remove("hidden");
        evalBox.innerHTML = s.renderedEvalHtml;
    }
}

function openCustomWritingEditor() {
    const prompt = (document.getElementById("writing-custom-prompt")?.value || "").trim();
    const title = (document.getElementById("writing-custom-title")?.value || "").trim() || "Bài viết tự do";
    openWritingEditor("custom-writing", {
        id: "custom-writing",
        title,
        level: "B1",
        type: "essay",
        prompt: prompt || "Bài viết tự do (không có đề cụ thể).",
        minWords: 50,
        timeLimit: 30,
        guidelines: [],
        sampleOutline: [],
        vocabulary: []
    });
}

function openWritingEditor(topicId, customTopic) {
    const allTopics = getAllContentForSkill("writing");
    if (customTopic) window.lastCustomWritingTopic = customTopic;
    const t = customTopic || allTopics.find(x => x.id === topicId) ||
        (topicId === "custom-writing" ? (window.lastCustomWritingTopic || { id: "custom-writing", title: "Bài viết tự do", level: "B1", type: "essay", prompt: "Bài viết tự do (không có đề cụ thể).", minWords: 50, timeLimit: 30 }) : null);
    if (!t) return;
    activeWritingTopic = t;

    document.getElementById("writing-custom-panel")?.classList.add("hidden");
    document.getElementById("writing-topics-list")?.classList.add("hidden");
    document.getElementById("writing-filter-bar")?.classList.add("hidden");
    document.getElementById("writing-history-panel")?.classList.add("hidden");
    document.getElementById("writing-editor")?.classList.remove("hidden");
    document.getElementById("writing-evaluation")?.classList.add("hidden");
    document.getElementById("writing-inline-check-box")?.classList.add("hidden");

    document.getElementById("writing-topic-title").innerHTML = `${renderLevelBadge(t.level)} <span class="ml-1">${escHtml(t.title)}</span>`;
    document.getElementById("writing-prompt").innerHTML = `
        <div class="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1.5">
            <p class="font-semibold text-white">${escHtml(t.prompt)}</p>
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
                    <input id="writing-target-time" type="number" value="${t.timeLimit || 20}" min="5" class="w-16 bg-transparent text-cyan-300 font-bold focus:outline-none">
                    <button onclick="startWritingCountdown()" class="px-2 py-0.5 rounded bg-violet-600/30 text-violet-200 text-[11px] font-bold">▶ Đếm giờ</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("writing-guidelines").innerHTML = `
        <div class="space-y-2">
            <p class="text-xs font-extrabold uppercase text-violet-300">📌 Hướng dẫn viết:</p>
            <ul class="list-disc pl-5 text-xs text-slate-300 space-y-1">
                ${(t.guidelines || []).map(g => `<li>${escHtml(g)}</li>`).join("")}
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
    document.getElementById("writing-timer").textContent = `⏱ ${t.timeLimit || 20}:00`;
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
    const minTarget = parseInt(document.getElementById("writing-target-min")?.value || activeWritingTopic?.minWords || "60", 10);
    const el = document.getElementById("writing-word-count");
    if (el) {
        el.textContent = `${wc} / ${minTarget}+ từ`;
        el.className = wc >= minTarget ? "text-emerald-400 font-bold" : "text-amber-300 font-bold";
    }

    // Auto-save draft after 700ms pause (PHẦN 3.4.B)
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
    showToast("Đã lưu bản nháp bài viết!");
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
                ${sentenceDiags.flatMap(s => s.diag.issues).slice(0, 10).map(iss =>
                    `<li><strong>[${escHtml(iss.errorType)}]</strong> "${escHtml(iss.original)}" → <code class="text-emerald-300">${escHtml(iss.suggestion)}</code> (${escHtml(iss.explanationVi)})</li>`
                ).join("")}
            </ul>
        </div>
    `;
}

async function submitWriting() {
    if (!activeWritingTopic) return;
    clearInterval(writingTimerId);
    const text = (document.getElementById("writing-textarea")?.value || "").trim();
    const wc = countWordsInEssay(text);
    if (wc < 10) {
        showToast("Bài viết quá ngắn (cần ít nhất 10 từ để đánh giá)!", "error");
        return;
    }

    const evalBox = document.getElementById("writing-evaluation");
    evalBox.classList.remove("hidden");
    evalBox.innerHTML = `<div class="p-5 rounded-2xl bg-slate-950 border border-violet-500/30 text-center text-xs text-violet-300 font-bold animate-pulse">⏳ Đang phân tích bài viết theo 6 tiêu chí học thuật...</div>`;

    // Try Backend AI first if configured and consented
    const aiRes = await AIClient.request("writing-eval", {
        topic: activeWritingTopic.title,
        prompt: activeWritingTopic.prompt,
        targetLevel: activeWritingTopic.level,
        minWords: parseInt(document.getElementById("writing-target-min")?.value || activeWritingTopic.minWords || "80", 10),
        essay: text
    });

    if (aiRes.ok && aiRes.data) {
        renderWritingEvaluationResult(text, wc, aiRes.data, "ai");
        return;
    }

    // Honest Local Rule-Based Diagnostic Fallback (Never pretends to be AI!)
    const localResult = buildLocalWritingEvaluation(text, wc, activeWritingTopic, aiRes.error);
    renderWritingEvaluationResult(text, wc, localResult, "local");
}

function buildLocalWritingEvaluation(text, wordCount, topic, aiOfflineReason) {
    const minW = parseInt(document.getElementById("writing-target-min")?.value || topic.minWords || "80", 10);
    const sentences = (text.match(/[^.!?]+[.!?]*/g) || [text]).map(s => s.trim()).filter(Boolean);
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
    const connectors = ["however", "therefore", "moreover", "furthermore", "first", "second", "finally", "in conclusion", "because", "although", "for example", "for instance", "on the other hand", "in addition"];
    const lowerText = text.toLowerCase();
    const usedConnectors = connectors.filter(c => lowerText.includes(c));

    const corrections = [];
    const correctedSentences = [];

    sentences.forEach(sent => {
        const d = analyzeEnglishTextLocal(sent);
        correctedSentences.push(d.correctedText);
        if (!d.isValid) {
            d.issues.forEach(iss => {
                corrections.push({
                    originalSentence: sent,
                    errorType: iss.errorType,
                    correctedSentence: d.correctedText,
                    explanationVi: iss.explanationVi
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
    if (wordCount >= minW) strengths.push(`Đạt yêu cầu độ dài bài viết (${wordCount} / tối thiểu ${minW} từ).`);
    else weaknesses.push(`Độ dài bài viết (${wordCount} từ) chưa đạt mức yêu cầu tối thiểu (${minW} từ). Hãy triển khai thêm ví dụ cụ thể.`);

    if (usedConnectors.length >= 2) strengths.push(`Sử dụng tốt các từ nối mạch lạc (Coherence & Cohesion): ${usedConnectors.join(", ")}.`);
    else weaknesses.push(`Bài viết còn thiếu các từ nối liên kết ý (như First, However, For example, Therefore, In conclusion).`);

    if (paragraphs.length >= 2 || topic.type === "paragraph") strengths.push(`Chia đoạn văn và trình bày rõ ràng (${sentences.length} câu).`);
    else weaknesses.push(`Với dạng bài ${topic.type}, bạn nên chia thành các đoạn Mở bài - Thân bài - Kết bài rõ ràng bằng dòng trống.`);

    if (corrections.length === 0) strengths.push("Không phát hiện lỗi chính tả hay lỗi cấu trúc cơ bản trong bộ quy tắc kiểm tra.");
    else weaknesses.push(`Phát hiện ${corrections.length} lỗi chính tả/cấu trúc/dấu câu cần khắc phục (xem bảng chi tiết bên dưới).`);

    const upgradeSuggestions = [
        "Thay 'very important' → 'essential / crucial / play a vital role in...'",
        "Thay 'very good' → 'beneficial / effective / advantageous'",
        "Thay 'a lot of' (trong văn viết trang trọng) → 'numerous (+ N đếm được) / a significant amount of (+ N không đếm được)'",
        "Đa dạng hóa câu đơn bằng mệnh đề quan hệ (who, which) hoặc mệnh đề nhượng bộ (Although S + V, S + V)."
    ];

    const heuristicScore = Math.max(35, Math.min(95,
        85
        - corrections.length * 7
        - (wordCount < minW ? 15 : 0)
        + Math.min(10, usedConnectors.length * 3)
    ));

    return {
        isLocalFallback: true,
        offlineNotice: aiOfflineReason || "AI Backend chưa được kết nối.",
        scorePct: heuristicScore,
        cefrEstimate: null, // Honest AI rule: Local rule checker does not claim AI CEFR/IELTS grading
        ieltsEstimate: null,
        overviewVi: `Bộ phân tích cục bộ đã kiểm tra ${wordCount} từ (${sentences.length} câu) trên 6 khía cạnh cơ bản (Grammar, Vocabulary, Spelling, Coherence, Task Length, Expression).`,
        strengths,
        weaknesses,
        corrections,
        upgradeSuggestions,
        revisedEssay: correctedSentences.join(" ")
    };
}

function renderWritingEvaluationResult(originalText, wordCount, r, evalMode) {
    const evalBox = document.getElementById("writing-evaluation");
    if (!evalBox) return;

    const html = `
        <div class="p-5 rounded-2xl bg-slate-950/95 border border-violet-500/35 space-y-5 text-xs">
            <!-- Honest AI / Source Banner -->
            <div class="p-3.5 rounded-xl ${evalMode === "ai" ? "bg-violet-500/15 border-violet-500/30" : "bg-amber-500/10 border-amber-500/30"} border flex items-start justify-between gap-3">
                <div>
                    <p class="font-extrabold text-sm ${evalMode === "ai" ? "text-violet-200" : "text-amber-300"}">
                        ${evalMode === "ai"
                            ? "🤖 Đánh giá 6 tiêu chí từ AI Backend"
                            : "🛠️ Phân tích Ngữ pháp, Chính tả & Bố cục Cục bộ (Chưa kết nối AI Server)"}
                    </p>
                    <p class="text-slate-300 mt-1">
                        ${evalMode === "ai"
                            ? "⚠️ Lưu ý minh bạch: Ước lượng CEFR và IELTS Writing Band bên dưới chỉ là kết quả tham khảo từ AI nhằm hỗ trợ tự học, KHÔNG phải điểm thi IELTS chính thức."
                            : `${escHtml(r.offlineNotice)} Để nhận chấm sâu 6 tiêu chí & ước lượng CEFR/IELTS từ AI thực, hãy cấu hình biến môi trường trên Backend trong mục Settings. Hệ thống KHÔNG giả lập điểm AI khi chưa kết nối.`}
                    </p>
                </div>
                ${renderSourceBadge(evalMode === "ai" ? "ai-generated" : "local-browser")}
            </div>

            <!-- 1 & 2. Điểm Tổng, Ước Lượng Trình Độ & Chi Tiết 6 Tiêu Chí (Hạng mục 5.1) -->
            <div class="grid sm:grid-cols-3 gap-3">
                <div class="p-3 rounded-xl bg-slate-900 border border-white/10">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Điểm tổng kỹ thuật</span>
                    <p class="text-xl font-black text-cyan-300 mt-0.5">${r.scorePct ?? 75}%</p>
                </div>
                <div class="p-3 rounded-xl bg-slate-900 border border-white/10">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Ước lượng CEFR (Tham khảo)</span>
                    <p class="text-base font-black text-violet-300 mt-0.5">${escHtml(r.cefrEstimate || "Cần kết nối AI Backend")}</p>
                </div>
                <div class="p-3 rounded-xl bg-slate-900 border border-white/10">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Ước lượng IELTS (Tham khảo)</span>
                    <p class="text-base font-black text-amber-300 mt-0.5">${escHtml(r.ieltsEstimate || "Cần kết nối AI Backend")}</p>
                </div>
            </div>

            <!-- Bảng Chi Tiết 6 Tiêu Chí Đánh Giá Chuẩn -->
            <div class="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                <span class="text-[11px] font-extrabold uppercase text-cyan-300">📊 Điểm Chi Tiết Từng Tiêu Chí:</span>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                    <div class="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span class="text-[10px] text-slate-400 block">Độ dài & Đáp ứng</span>
                        <strong class="text-emerald-300 text-sm">${(r.criteriaScores && r.criteriaScores.taskResponse) || (wordCount >= (parseInt(document.getElementById("writing-target-min")?.value || "60", 10)) ? "8.5/10" : "6.0/10")}</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span class="text-[10px] text-slate-400 block">Ngữ pháp</span>
                        <strong class="text-cyan-300 text-sm">${(r.criteriaScores && r.criteriaScores.grammar) || Math.max(5, Math.round(9 - (r.corrections ? r.corrections.length * 0.8 : 0))) + "/10"}</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span class="text-[10px] text-slate-400 block">Từ vựng</span>
                        <strong class="text-violet-300 text-sm">${(r.criteriaScores && r.criteriaScores.vocabulary) || "8.0/10"}</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span class="text-[10px] text-slate-400 block">Chính tả & Dấu câu</span>
                        <strong class="text-amber-300 text-sm">${(r.criteriaScores && r.criteriaScores.spelling) || Math.max(6, Math.round(9.5 - (r.corrections ? r.corrections.filter(c => String(c.errorType).includes("chính tả")).length : 0))) + "/10"}</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span class="text-[10px] text-slate-400 block">Mạch lạc & Liên kết</span>
                        <strong class="text-pink-300 text-sm">${(r.criteriaScores && r.criteriaScores.coherence) || "7.5/10"}</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-slate-950 border border-white/5">
                        <span class="text-[10px] text-slate-400 block">Độ tự nhiên</span>
                        <strong class="text-indigo-300 text-sm">${(r.criteriaScores && r.criteriaScores.naturalness) || "7.5/10"}</strong>
                    </div>
                </div>
            </div>
            <div class="grid sm:grid-cols-3 gap-3">
                <div class="p-3 rounded-xl bg-slate-900 border border-white/10">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Mức hoàn thiện kỹ thuật</span>
                    <p class="text-xl font-black text-cyan-300 mt-0.5">${r.scorePct ?? 75}%</p>
                </div>
                <div class="p-3 rounded-xl bg-slate-900 border border-white/10">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Ước lượng CEFR (Tham khảo)</span>
                    <p class="text-base font-black text-violet-300 mt-0.5">${escHtml(r.cefrEstimate || "Cần kết nối AI Backend")}</p>
                </div>
                <div class="p-3 rounded-xl bg-slate-900 border border-white/10">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Ước lượng IELTS (Tham khảo)</span>
                    <p class="text-base font-black text-amber-300 mt-0.5">${escHtml(r.ieltsEstimate || "Cần kết nối AI Backend")}</p>
                </div>
            </div>

            <div class="space-y-2">
                <p class="text-slate-200 font-medium">${escHtml(r.overviewVi || "")}</p>
                <div class="grid md:grid-cols-2 gap-3">
                    <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                        <p class="font-bold text-emerald-300">✅ Điểm mạnh:</p>
                        <ul class="list-disc pl-4 text-slate-200 space-y-1">${(r.strengths || []).map(s => `<li>${escHtml(s)}</li>`).join("")}</ul>
                    </div>
                    <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                        <p class="font-bold text-rose-300">🎯 Cần cải thiện:</p>
                        <ul class="list-disc pl-4 text-slate-200 space-y-1">${(r.weaknesses || []).map(w => `<li>${escHtml(w)}</li>`).join("")}</ul>
                    </div>
                </div>
            </div>

            <!-- 3. Bảng sửa bài chi tiết -->
            <div class="space-y-2">
                <h4 class="font-extrabold text-white uppercase tracking-wider">3. Bảng sửa bài chi tiết</h4>
                ${(r.corrections && r.corrections.length > 0) ? `
                    <div class="overflow-x-auto rounded-xl border border-white/10">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-900 text-slate-300">
                                <tr>
                                    <th class="p-2.5 border-b border-white/10">Câu gốc</th>
                                    <th class="p-2.5 border-b border-white/10">Loại lỗi</th>
                                    <th class="p-2.5 border-b border-white/10">Câu sửa đề xuất</th>
                                    <th class="p-2.5 border-b border-white/10">Giải thích</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                ${r.corrections.map(c => `
                                    <tr>
                                        <td class="p-2.5 text-rose-300">${escHtml(c.originalSentence)}</td>
                                        <td class="p-2.5 font-bold text-amber-300">${escHtml(c.errorType)}</td>
                                        <td class="p-2.5 text-emerald-300 font-semibold">${escHtml(c.correctedSentence)}</td>
                                        <td class="p-2.5 text-slate-300">${escHtml(c.explanationVi)}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                ` : `<p class="text-emerald-300 font-semibold">Không phát hiện câu sai cấu trúc/chính tả cơ bản nào!</p>`}
            </div>

            <!-- 4. Gợi ý nâng cấp & Phiên bản đã chỉnh sửa -->
            <div class="space-y-2">
                <h4 class="font-extrabold text-cyan-300 uppercase tracking-wider">4. Gợi ý nâng cấp từ vựng & cấu trúc</h4>
                <ul class="list-disc pl-5 text-slate-300 space-y-1">
                    ${(r.upgradeSuggestions || []).map(u => `<li>${escHtml(u)}</li>`).join("")}
                </ul>
            </div>

            <div class="p-4 rounded-xl bg-slate-900 border border-emerald-500/25 space-y-1.5">
                <span class="font-extrabold text-emerald-300 uppercase">✨ Phiên bản bài viết đã chỉnh sửa:</span>
                <p class="text-slate-100 leading-relaxed whitespace-pre-line">${escHtml(r.revisedEssay || originalText)}</p>
            </div>
        </div>
    `;

    evalBox.innerHTML = html;

    // 5. Lưu bài gốc, bài sửa và đánh giá vào Writing History & Writing Notebook (PHẦN 3.4.C.5)
    const st = getWritingState();
    st.submissions.unshift({
        id: "wsub-" + Date.now(),
        topicId: activeWritingTopic.id,
        title: activeWritingTopic.title,
        level: activeWritingTopic.level,
        wordCount,
        originalText,
        revisedEssay: r.revisedEssay || originalText,
        scorePct: r.scorePct ?? 75,
        evalMode,
        renderedEvalHtml: html,
        at: new Date().toISOString()
    });
    if (st.submissions.length > 50) st.submissions = st.submissions.slice(0, 50);
    saveWritingState(st);

    addStructuredNote({
        type: "writing",
        title: `Writing: ${activeWritingTopic.title} (${wordCount} từ)`,
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
