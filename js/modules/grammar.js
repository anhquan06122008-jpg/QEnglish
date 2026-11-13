/* ==========================================================================
   QEnglish - Grammar Learning Module (A1-C2, 16 Core Topics, 8-Part Lessons)
   ========================================================================== */

let activeGrammarLesson = null;

function getGrammarSavedState() {
    return safeParseJSON(localStorage.getItem(STORAGE_KEYS.GRAMMAR), { completedIds: [], scoresById: {} });
}

function saveGrammarSavedState(st) {
    safeWriteJSON(STORAGE_KEYS.GRAMMAR, st);
}

function filterGrammarLessons() {
    const lvFilter = document.getElementById("grammar-level-filter")?.value || "all";
    const topicFilter = document.getElementById("grammar-topic-filter")?.value || "all";
    const search = (document.getElementById("grammar-search-input")?.value || "").toLowerCase().trim();
    const listEl = document.getElementById("grammar-list");
    if (!listEl) return;

    const allLessons = getAllContentForSkill("grammar");
    const saved = getGrammarSavedState();

    const filtered = allLessons.filter(item => {
        const matchLv = matchesSelectedLevel(item.level || "B1", lvFilter);
        const matchTopic = topicFilter === "all" || String(item.topic || "").toLowerCase() === topicFilter.toLowerCase();
        const matchSearch = !search || `${item.title} ${item.topic} ${item.explanation}`.toLowerCase().includes(search);
        return matchLv && matchTopic && matchSearch;
    });

    if (filtered.length === 0) {
        const isIeltsFilter = lvFilter.toUpperCase().startsWith("IELTS");
        listEl.innerHTML = `
            <div class="col-span-full glass-panel rounded-2xl p-8 text-center space-y-3">
                <div class="text-4xl">📝</div>
                <h4 class="font-bold text-white">Không có bài ngữ pháp khớp với bộ lọc "${escHtml(lvFilter)}"</h4>
                <p class="text-xs text-slate-400 max-w-lg mx-auto">
                    ${isIeltsFilter
                        ? "Hệ thống tuân thủ nguyên tắc tách biệt CEFR và IELTS (không quy đổi cứng). Hệ thống bài học Ngữ pháp nền tảng được phân chia theo chuẩn CEFR A1–C2."
                        : "Hãy chọn 'Tất cả Level' hoặc thêm bài học mới trong Quản lý Học liệu."}
                </p>
                <button onclick="document.getElementById('grammar-level-filter').value='all'; document.getElementById('grammar-topic-filter').value='all'; filterGrammarLessons();" class="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Xem toàn bộ ${allLessons.length} chủ đề Ngữ pháp (A1–C2)</button>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map(lesson => {
        const isDone = (saved.completedIds || []).includes(lesson.id);
        const bestScore = saved.scoresById ? saved.scoresById[lesson.id] : undefined;
        return `
            <div onclick='openGrammarLesson(${JSON.stringify(lesson.id)})' class="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between gap-4 transition">
                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="flex items-center gap-2">
                            ${renderLevelBadge(lesson.level)}
                            <span class="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">${escHtml(lesson.topic || "Grammar")}</span>
                        </div>
                        ${isDone ? `<span class="text-xs font-bold text-emerald-400">✅ Đã học (${bestScore ?? 100}%)</span>` : `<span class="text-xs text-slate-500">${(lesson.exercises || []).length} bài tập</span>`}
                    </div>
                    <h3 class="text-lg font-extrabold text-white">${escHtml(lesson.title)}</h3>
                    <p class="text-xs text-slate-400 line-clamp-2">${escHtml(lesson.intro || lesson.explanation)}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <code class="text-[11px] text-violet-300 truncate max-w-[75%]">${escHtml(lesson.formula)}</code>
                    <span class="font-bold text-violet-400 shrink-0">Học ngay →</span>
                </div>
            </div>
        `;
    }).join("");
}

function openGrammarLesson(lessonId) {
    const allLessons = getAllContentForSkill("grammar");
    const lesson = allLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    activeGrammarLesson = lesson;

    document.getElementById("grammar-list")?.classList.add("hidden");
    document.getElementById("grammar-filter-bar")?.classList.add("hidden");
    const view = document.getElementById("grammar-lesson");
    view?.classList.remove("hidden");
    document.getElementById("grammar-exercise-result")?.classList.add("hidden");

    const contentEl = document.getElementById("grammar-lesson-content");
    contentEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div class="space-y-1">
                <div class="flex items-center gap-2">
                    ${renderLevelBadge(lesson.level)}
                    <span class="text-xs font-bold text-cyan-400">${escHtml(lesson.topic)}</span>
                    ${renderSourceBadge(lesson.source || "built-in")}
                </div>
                <h2 class="text-2xl font-black text-white">${escHtml(lesson.title)}</h2>
            </div>
            <button onclick="saveActiveGrammarToNotebook()" class="px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-200 text-xs font-bold transition">
                📓 Lưu công thức vào Grammar Notebook
            </button>
        </div>

        <!-- 1. Giới thiệu & 2. Giải thích tiếng Việt -->
        <div class="space-y-3">
            <div class="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-violet-300">1. Giới thiệu trọng tâm</span>
                <p class="text-sm text-slate-100 mt-1 font-medium">${escHtml(lesson.intro || "")}</p>
            </div>
            <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">2. Giải thích chi tiết bằng tiếng Việt</span>
                <p class="text-sm text-slate-200 mt-1.5 leading-relaxed">${escHtml(lesson.explanation)}</p>
            </div>
        </div>

        <!-- 3. Công thức -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/90 to-slate-950 border border-indigo-500/30">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block mb-1.5">3. Công thức ghi nhớ</span>
            <p class="font-mono text-sm md:text-base font-bold text-amber-300">${escHtml(lesson.formula)}</p>
        </div>

        <!-- 4. Ví dụ tiếng Anh & 5. Dịch nghĩa -->
        <div class="space-y-2.5">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-300">4 & 5. Ví dụ tiếng Anh và Dịch nghĩa</h4>
            <div class="grid gap-3">
                ${(lesson.examples || []).map((ex, idx) => `
                    <div class="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-start justify-between gap-3">
                        <div class="space-y-1">
                            <p class="text-sm font-bold text-white">${idx + 1}. ${escHtml(ex.en)}</p>
                            <p class="text-xs text-slate-400">🇻🇳 ${escHtml(ex.vi)}</p>
                        </div>
                        <button onclick='speakText(${JSON.stringify(ex.en)}, 1.0)' class="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-cyan-300 text-xs font-bold shrink-0 hover:bg-slate-800">🔊 Nghe</button>
                    </div>
                `).join("")}
            </div>
        </div>

        <!-- 6. Những lỗi thường gặp -->
        <div class="space-y-2.5">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-rose-300">6. Những lỗi sinh viên thường gặp</h4>
            <div class="grid gap-3">
                ${(lesson.commonMistakes || []).map(m => `
                    <div class="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/25 space-y-1.5 text-xs">
                        <p class="text-rose-300 line-through font-medium">❌ Sai: ${escHtml(m.wrong)}</p>
                        <p class="text-emerald-300 font-bold">✅ Đúng: ${escHtml(m.correct)}</p>
                        <p class="text-slate-300">💡 <strong>Vì sao sai:</strong> ${escHtml(m.why || m.explanation || "")}</p>
                    </div>
                `).join("")}
            </div>
        </div>
    `;

    // 7. Bài tập thực hành
    const exEl = document.getElementById("grammar-exercises");
    const exercises = lesson.exercises || [];
    exEl.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 md:p-8 space-y-5">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-black text-white">7. Bài tập thực hành (${exercises.length} câu)</h3>
                <span class="text-xs text-slate-400">${exercises.length > 0 ? "Hoàn thành tất cả câu rồi bấm Chấm bài" : "Tài liệu lý thuyết cá nhân"}</span>
            </div>
            ${exercises.length > 0
                ? `<div class="space-y-5">${exercises.map((ex, i) => renderGrammarExerciseItem(ex, i)).join("")}</div>`
                : `<p class="text-xs text-slate-400 italic">Bài học này chưa có câu hỏi trắc nghiệm đính kèm. Sau khi đọc xong lý thuyết và ví dụ, bạn có thể bấm nút bên dưới để ghi nhận đã hoàn thành.</p>`}
            <button onclick="gradeGrammarExercises()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-violet-600/25 active:scale-99 transition">
                ${exercises.length > 0 ? "✅ Chấm bài & Xem giải thích chi tiết" : "✅ Đánh dấu đã học xong bài ngữ pháp"}
            </button>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderGrammarExerciseItem(ex, i) {
    if (ex.type === "multiple_choice") {
        return `
            <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3" id="g-ex-box-${i}">
                <p class="text-sm font-bold text-white"><span class="text-violet-400 mr-1">Câu ${i + 1}:</span> ${escHtml(ex.question)}</p>
                <div class="grid sm:grid-cols-2 gap-2">
                    ${(ex.options || []).map((opt, optIdx) => `
                        <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-white/10 cursor-pointer hover:border-violet-500/40 text-xs text-slate-200">
                            <input type="radio" name="g-ex-${i}" value="${escHtml(opt)}" class="accent-violet-500">
                            <span>${escHtml(opt)}</span>
                        </label>
                    `).join("")}
                </div>
                <div id="g-ex-fb-${i}" class="hidden text-xs pt-2 border-t border-white/10"></div>
            </div>
        `;
    }
    return `
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3" id="g-ex-box-${i}">
            <p class="text-sm font-bold text-white"><span class="text-cyan-400 mr-1">Câu ${i + 1} (${ex.type === "rewrite" ? "Viết lại / Sửa câu" : "Điền từ"}):</span> ${escHtml(ex.question)}</p>
            <input type="text" id="g-ex-input-${i}" placeholder="Nhập câu trả lời của bạn..." class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500">
            <div id="g-ex-fb-${i}" class="hidden text-xs pt-2 border-t border-white/10"></div>
        </div>
    `;
}

function gradeGrammarExercises() {
    if (!activeGrammarLesson) return;
    const exercises = activeGrammarLesson.exercises || [];
    let correct = 0;

    exercises.forEach((ex, i) => {
        let userAns = "";
        if (ex.type === "multiple_choice") {
            const checked = document.querySelector(`input[name="g-ex-${i}"]:checked`);
            userAns = checked ? checked.value.trim() : "";
        } else {
            userAns = (document.getElementById(`g-ex-input-${i}`)?.value || "").trim();
        }

        const acceptedList = [ex.answer, ...(ex.acceptAlt || [])].map(a => normalizeWords(a));
        const isRight = userAns !== "" && acceptedList.includes(normalizeWords(userAns));
        if (isRight) correct++;
        else {
            autoLogMistake({
                errorCategory: "Sai ngữ pháp",
                wrongText: userAns || `(Chưa trả lời: ${ex.question})`,
                correctText: ex.answer,
                explanation: `[${activeGrammarLesson.title}] ${ex.explanationVi}`,
                skill: "grammar"
            });
        }

        const box = document.getElementById(`g-ex-box-${i}`);
        const fb = document.getElementById(`g-ex-fb-${i}`);
        if (box) {
            box.classList.remove("border-white/10", "border-emerald-500/50", "border-rose-500/50");
            box.classList.add(isRight ? "border-emerald-500/50" : "border-rose-500/50");
        }
        if (fb) {
            fb.classList.remove("hidden");
            fb.innerHTML = `
                <p class="font-bold ${isRight ? "text-emerald-300" : "text-rose-300"}">
                    ${isRight ? "✅ Chính xác!" : `❌ Chưa đúng (Đáp án của bạn: "${escHtml(userAns || "Trống")}") — Đáp án đúng: "${escHtml(ex.answer)}"`}
                </p>
                <p class="text-slate-300 mt-1">💡 <strong>Giải thích:</strong> ${escHtml(ex.explanationVi)}</p>
            `;
        }
    });

    const pct = exercises.length > 0 ? Math.round((correct / exercises.length) * 100) : 100;
    const st = getGrammarSavedState();
    if (!st.completedIds.includes(activeGrammarLesson.id)) st.completedIds.push(activeGrammarLesson.id);
    st.scoresById[activeGrammarLesson.id] = Math.max(st.scoresById[activeGrammarLesson.id] || 0, pct);
    saveGrammarSavedState(st);

    logStudyMetrics(
        {
            grammarDone: 1,
            scoreEntry: { skill: "grammar", scorePct: pct, level: activeGrammarLesson.level, title: activeGrammarLesson.title }
        },
        { type: "grammar", skill: "grammar", title: `Hoàn thành Ngữ pháp: ${activeGrammarLesson.title}`, scorePct: pct }
    );

    const resBox = document.getElementById("grammar-exercise-result");
    if (resBox) {
        resBox.classList.remove("hidden");
        resBox.innerHTML = `
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h4 class="text-xl font-black text-white">8. Kết quả bài thực hành: <span class="${pct >= 70 ? "text-emerald-400" : "text-amber-400"}">${correct}/${exercises.length} (${pct}%)</span></h4>
                    <p class="text-xs text-slate-300 mt-1">${pct >= 80 ? "Xuất sắc! Bạn đã nắm chắc chủ điểm này." : "Các câu sai đã được tự động lưu vào Sổ Lỗi Sai (Mistake Notebook) để bạn ôn lại."}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="saveActiveGrammarToNotebook()" class="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-violet-300">📓 Lưu vào Sổ Ngữ Pháp</button>
                    <button onclick="closeGrammarLesson()" class="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-bold text-white">Danh sách bài học</button>
                </div>
            </div>
        `;
    }
    showToast(`Đã chấm bài Ngữ pháp: ${correct}/${exercises.length} (${pct}%)`);
}

function saveActiveGrammarToNotebook() {
    if (!activeGrammarLesson) return;
    const l = activeGrammarLesson;
    addStructuredNote({
        type: "grammar",
        title: `${l.title} (${l.level})`,
        important: true,
        fields: {
            grammarTopic: l.topic || l.title,
            formula: l.formula || "",
            usage: l.explanation || "",
            examples: (l.examples || []).map(e => `${e.en} (${e.vi})`).join("\n"),
            commonMistakes: (l.commonMistakes || []).map(m => `Sai: ${m.wrong} -> Đúng: ${m.correct}`).join("\n")
        },
        content: `Công thức: ${l.formula}\nCách dùng: ${l.explanation}`
    });
}

function closeGrammarLesson() {
    activeGrammarLesson = null;
    document.getElementById("grammar-lesson")?.classList.add("hidden");
    document.getElementById("grammar-list")?.classList.remove("hidden");
    document.getElementById("grammar-filter-bar")?.classList.remove("hidden");
    filterGrammarLessons();
}

/* ==================== AI GRAMMAR COACH (Sentence Debug & Pair Compare) ==================== */
async function runAIGrammarCoach(action = "debug") {
    const queryEl = document.getElementById("grammar-coach-input");
    const outBox = document.getElementById("grammar-coach-output");
    const query = (queryEl?.value || "").trim();
    if (!outBox) return;
    if (!query) {
        showToast("Hãy nhập câu tiếng Anh muốn kiểm tra hoặc cặp cấu trúc muốn so sánh (VD: used to vs be used to)!", "error");
        return;
    }
    outBox.classList.remove("hidden");
    outBox.innerHTML = `<div class="p-4 rounded-2xl bg-slate-950 border border-violet-500/35 text-xs text-violet-300 font-bold animate-pulse">⏳ AI Grammar Coach đang phân tích cấu trúc & sửa lỗi...</div>`;

    const res = await AIClient.request("grammar-coach", {
        action,
        topic: activeGrammarLesson?.title || "General English Grammar",
        query
    });

    if (!res.ok || !res.data) {
        const localDiag = analyzeEnglishTextLocal(query);
        outBox.innerHTML = `
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                <div class="flex justify-between">
                    <span class="font-extrabold text-amber-300">🛠️ Phân tích quy tắc cục bộ (AI Backend chưa kết nối)</span>
                    <button onclick="document.getElementById('grammar-coach-output').classList.add('hidden')" class="text-slate-400">✕</button>
                </div>
                <p class="text-slate-200">Gợi ý sửa nhanh: <strong class="text-emerald-300">${escHtml(localDiag.correctedText)}</strong></p>
                <p class="text-slate-400">${escHtml(res.error || "Kết nối AI Backend để phân tích sâu ngữ cảnh & so sánh cấu trúc gây nhầm lẫn.")}</p>
            </div>
        `;
        return;
    }

    const d = res.data;
    outBox.innerHTML = `
        <div class="p-5 rounded-2xl bg-slate-950 border border-cyan-500/35 space-y-3 text-xs">
            <div class="flex items-center justify-between">
                <span class="font-extrabold text-cyan-300 text-sm">🤖 Phân Tích Từ AI Grammar Coach</span>
                <div class="flex items-center gap-2">${renderSourceBadge("ai-generated")}<button onclick="document.getElementById('grammar-coach-output').classList.add('hidden')" class="text-slate-400 hover:text-white">✕</button></div>
            </div>
            <p class="text-slate-200 leading-relaxed">${escHtml(d.summaryVi || "")}</p>
            ${d.correctedSentence ? `<div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25"><strong class="text-emerald-300">✅ Câu chuẩn:</strong> <span class="text-white">${escHtml(d.correctedSentence)}</span></div>` : ""}
            ${d.formula ? `<div class="p-2.5 rounded-xl bg-slate-900 font-mono text-amber-300 font-bold">Công thức: ${escHtml(d.formula)}</div>` : ""}
            ${(d.comparisonTable && d.comparisonTable.length) ? `
                <div class="space-y-1.5">
                    <p class="font-bold text-violet-300">So sánh chi tiết:</p>
                    ${d.comparisonTable.map(row => `<div class="p-2.5 rounded-xl bg-slate-900 border border-white/10"><strong class="text-white">${escHtml(row.structure)}</strong>: <span class="text-slate-300">${escHtml(row.usageVi)}</span><p class="text-cyan-300 italic mt-0.5">${escHtml(row.example)}</p></div>`).join("")}
                </div>
            ` : ""}
        </div>
    `;
}
