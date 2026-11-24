/* ==========================================================================
   QEnglish — Unified Learning Hub Engine (Module #23)
   Powers ALL 6 Standalone Skills + AI PDF Learning Studio:
     1. LEARNING HISTORY (Full Attempt Storage, Review, Wrong-Only, Retry, Multi-Delete)
     2. AI – GENERATE EXERCISE (Mandatory CEFR A1-C2 + Skill-Specific Options + Persistence)
     3. AI – GENERATE MORE QUESTIONS & UNLIMITED QUESTION SETS (Bộ câu hỏi 1, 2, 3... N)
        with independent attempt history per set & zero overwrite!
   ========================================================================== */

const LEARNING_HUB_CEFR_LEVELS = [
    { code: "A1", label: "A1 – Beginner", desc: "Cơ bản, câu ngắn, từ vựng nền tảng" },
    { code: "A2", label: "A2 – Elementary", desc: "Giao tiếp hàng ngày quen thuộc" },
    { code: "B1", label: "B1 – Intermediate", desc: "Trung cấp, đoạn văn mạch lạc" },
    { code: "B2", label: "B2 – Upper Intermediate", desc: "Học thuật & chủ đề xã hội đa chiều" },
    { code: "C1", label: "C1 – Advanced", desc: "Nâng cao, lập luận & sắc thái sâu" },
    { code: "C2", label: "C2 – Proficiency", desc: "Thành thạo chuẩn bản xứ học thuật" }
];

const LEARNING_HUB_SKILL_TYPES = {
    reading: [
        { id: "mixed", label: "Mixed Exercises (Hỗn hợp)" },
        { id: "multiple_choice", label: "Multiple Choice" },
        { id: "true_false", label: "True / False / Not Given" },
        { id: "fill_blanks", label: "Fill in the Blanks" },
        { id: "matching", label: "Matching (Nối ý)" },
        { id: "short_answer", label: "Short Answer" }
    ],
    listening: [
        { id: "mixed", label: "Mixed Exercises (Hỗn hợp)" },
        { id: "multiple_choice", label: "Multiple Choice" },
        { id: "fill_blanks", label: "Fill in the Blanks" },
        { id: "true_false", label: "True / False" },
        { id: "short_answer", label: "Short Answer" }
    ],
    grammar: [
        { id: "mixed", label: "Mixed Exercises (Hỗn hợp)" },
        { id: "multiple_choice", label: "Multiple Choice" },
        { id: "fill_blanks", label: "Fill in the Blanks" },
        { id: "error_correction", label: "Error Correction (Sửa lỗi sai)" },
        { id: "sentence_transformation", label: "Sentence Transformation (Viết lại câu)" }
    ],
    vocabulary: [
        { id: "mixed", label: "Mixed Exercises (Hỗn hợp)" },
        { id: "multiple_choice", label: "Multiple Choice (Nghĩa & Ngữ cảnh)" },
        { id: "fill_blanks", label: "Fill in the Blanks (Collocations)" },
        { id: "matching", label: "Matching (Từ đồng nghĩa / Trái nghĩa)" },
        { id: "short_answer", label: "Word Forms & Short Answer" }
    ],
    writing: [
        { id: "essay_paragraph", label: "Essay / Paragraph (Viết đoạn & Bài luận)" },
        { id: "sentence_building", label: "Sentence Building (Xây dựng câu)" },
        { id: "sentence_transformation", label: "Sentence Correction & Transformation" },
        { id: "translation", label: "Translation (Dịch Việt – Anh)" }
    ],
    speaking: [
        { id: "topic_discussion", label: "Topic Discussion (Thảo luận chủ đề)" },
        { id: "dialogue_roleplay", label: "Dialogue / Role-play (Hội thoại tình huống)" },
        { id: "interview_qa", label: "Interview Q&A (Hỏi đáp phản xạ)" },
        { id: "short_response", label: "Short Response (Trả lời nhanh)" }
    ]
};

const LearningHub = {
    _state: null,
    _selectedHistoryIds: new Set(),
    _genFormBySkill: {}, // skill -> { cefrLevel, cefrConfirmed, difficulty, count, topicMode, topicInput, exerciseType, busy }
    _activeSetByLesson: {}, // `${skill}::${lessonId}` -> questionSetId
    _draftAnswersBySet: {}, // `${skill}::${lessonId}::${setId}` -> { qId: answer }
    _startedAtBySet: {}, // `${skill}::${lessonId}::${setId}` -> ms
    _modalState: {
        open: false,
        skill: "reading",
        lessonId: "",
        lessonTitle: "",
        lessonLevel: "B1",
        lessonContent: null,
        originalQuestions: [],
        cefrLevel: "",
        cefrConfirmed: false,
        difficultyMode: "same",
        count: 10,
        busy: false,
        onCreated: null
    },
    _activeVocabExercise: null,

    getDefaultState() {
        return {
            history: [],
            aiExercises: [],
            questionSetsByLesson: {},
            deletedHistoryIds: [],
            deletedExerciseIds: [],
            updatedAt: new Date().toISOString()
        };
    },

    resetMemory() {
        this._state = null;
        this._selectedHistoryIds.clear();
        this._activeSetByLesson = {};
        this._draftAnswersBySet = {};
        this._activeVocabExercise = null;
    },

    load() {
        if (this._state) return this._state;
        const saved = safeReadJSON(STORAGE_KEYS.LEARNING_HUB, null);
        if (saved && typeof saved === "object") {
            this._state = {
                ...this.getDefaultState(),
                ...saved,
                history: Array.isArray(saved.history) ? saved.history : [],
                aiExercises: Array.isArray(saved.aiExercises) ? saved.aiExercises : [],
                questionSetsByLesson: (saved.questionSetsByLesson && typeof saved.questionSetsByLesson === "object") ? saved.questionSetsByLesson : {},
                deletedHistoryIds: Array.isArray(saved.deletedHistoryIds) ? saved.deletedHistoryIds : [],
                deletedExerciseIds: Array.isArray(saved.deletedExerciseIds) ? saved.deletedExerciseIds : []
            };
        } else {
            this._state = this.getDefaultState();
        }
        return this._state;
    },

    reloadFromStorage() {
        this._state = null;
        return this.load();
    },

    save() {
        const st = this.load();
        st.updatedAt = new Date().toISOString();
        safeWriteJSON(STORAGE_KEYS.LEARNING_HUB, st);
    },

    getStateForSnapshot() {
        return this.load();
    },

    getLessonKey(skill, lessonId) {
        return `${String(skill || "reading").toLowerCase()}::${String(lessonId || "default")}`;
    },

    resolveMcqAnswer(opts, rawAns) {
        const ans = String(rawAns || "").trim();
        if (!Array.isArray(opts) || !opts.length) return ans;
        const exact = opts.find(o => o.toLowerCase() === ans.toLowerCase());
        if (exact) return exact;
        if (/^[A-Da-d]$/.test(ans)) {
            const idx = ans.toUpperCase().charCodeAt(0) - 65;
            if (opts[idx]) return opts[idx];
        }
        const m = ans.match(/^([A-Da-d])[\.\)\:\-]\s*(.+)$/);
        if (m) {
            const byBody = opts.find(o => o.toLowerCase() === m[2].trim().toLowerCase());
            const byIdx = opts[m[1].toUpperCase().charCodeAt(0) - 65];
            if (byBody || byIdx) return byBody || byIdx;
        }
        const partial = opts.find(o => ans && (o.toLowerCase().includes(ans.toLowerCase()) || ans.toLowerCase().includes(o.toLowerCase())));
        return partial || opts[0];
    },

    normalizeQuestionsList(rawList, prefix = "q") {
        if (!Array.isArray(rawList)) return [];
        return rawList.map((q, idx) => {
            if (!q || typeof q !== "object") return null;
            let opts = Array.isArray(q.options) ? q.options.map(o => String(o || "").trim()).filter(Boolean) : [];
            const qType = String(q.type || (opts.length ? "mcq" : "fill_blank")).toLowerCase();
            if ((qType === "tfng" || qType === "true_false") && opts.length < 2) {
                opts = qType === "tfng" ? ["True", "False", "Not Given"] : ["True", "False"];
            }
            const ans = this.resolveMcqAnswer(opts, q.answer);
            return {
                id: String(q.id || `${prefix}-${Date.now().toString(36)}-${idx}`),
                type: qType,
                question: String(q.question || "").trim(),
                options: opts,
                answer: ans,
                acceptableAnswers: Array.isArray(q.acceptableAnswers || q.acceptAlt) ? (q.acceptableAnswers || q.acceptAlt) : [],
                explanationVi: String(q.explanationVi || q.explanation || "").trim(),
                evidenceQuote: String(q.evidenceQuote || "").trim(),
                topicTag: String(q.topicTag || "").trim(),
                paragraphRef: q.paragraphRef || null
            };
        }).filter(q => q && q.question);
    },

    /* ==================== 1. UNIFIED LEARNING HISTORY ==================== */
    recordAttempt(entry) {
        const st = this.load();
        const skill = String(entry.skill || "reading").toLowerCase();
        const lessonId = String(entry.lessonId || "unknown");
        const qSetId = String(entry.questionSetId || "set-1");
        const prevSameSet = st.history.filter(h => h.skill === skill && String(h.lessonId) === lessonId && String(h.questionSetId || "set-1") === qSetId);

        const totalCount = Math.max(0, Number(entry.totalCount) || 0);
        const correctCount = Math.max(0, Number(entry.correctCount) || 0);
        const scorePct = typeof entry.scorePct === "number"
            ? Math.round(entry.scorePct)
            : (totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0);
        const score10 = typeof entry.score10 === "number"
            ? Math.round(entry.score10 * 10) / 10
            : Math.round((scorePct / 10) * 10) / 10;

        const answers = Array.isArray(entry.answers) ? entry.answers : [];
        const wrongItems = Array.isArray(entry.wrongItems)
            ? entry.wrongItems
            : answers.filter(a => a && a.isCorrect === false);

        const rec = {
            id: entry.id || `lh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            skill,
            sourceScope: entry.sourceScope || "standalone",
            courseId: entry.courseId ? String(entry.courseId) : "",
            unitId: entry.unitId ? String(entry.unitId) : "",
            lessonId,
            lessonTitle: String(entry.lessonTitle || "Bài tập").trim(),
            questionSetId: qSetId,
            questionSetLabel: String(entry.questionSetLabel || (qSetId === "set-1" || qSetId === "original" ? "Bộ câu hỏi 1 (Gốc)" : qSetId)),
            attemptNumber: prevSameSet.length + 1,
            exerciseType: String(entry.exerciseType || skill),
            cefrLevel: String(entry.cefrLevel || "B1").toUpperCase(),
            score10,
            scorePct,
            correctCount,
            totalCount,
            durationSec: Math.max(1, Number(entry.durationSec) || 1),
            status: "completed",
            answers,
            wrongItems,
            aiFeedback: entry.aiFeedback || null,
            userText: String(entry.userText || "").slice(0, 6000),
            completedAt: entry.completedAt || new Date().toISOString()
        };

        st.history.unshift(rec);
        if (st.history.length > 500) st.history = st.history.slice(0, 500);
        this.save();
        this.refreshSkillWidgets(skill);
        return rec;
    },

    getHistoryBySkill(skill, { sourceScope = "all" } = {}) {
        const st = this.load();
        const sk = String(skill || "all").toLowerCase();
        return st.history.filter(h => {
            if (sk !== "all" && h.skill !== sk) return false;
            if (sourceScope !== "all" && h.sourceScope !== sourceScope) return false;
            return true;
        });
    },

    getHistoryForQuestionSet(skill, lessonId, questionSetId) {
        const st = this.load();
        const sk = String(skill || "").toLowerCase();
        return st.history.filter(h => h.skill === sk && String(h.lessonId) === String(lessonId) && String(h.questionSetId || "set-1") === String(questionSetId));
    },

    deleteHistoryRecords(ids) {
        const list = Array.isArray(ids) ? ids.map(String).filter(Boolean) : [String(ids || "")].filter(Boolean);
        if (!list.length) return false;
        const msg = list.length === 1
            ? "Bạn có chắc muốn xóa bản ghi lịch sử làm bài này? (Bài học gốc và các bộ câu hỏi vẫn được giữ nguyên 100%)."
            : `Bạn có chắc muốn xóa ${list.length} bản ghi lịch sử đã chọn? (Bài học gốc và các bộ câu hỏi vẫn được giữ nguyên 100%).`;
        if (!confirm(msg)) return false;

        const st = this.load();
        const delSet = new Set(list);
        const affectedSkills = new Set();
        st.history = st.history.filter(h => {
            if (delSet.has(String(h.id))) {
                affectedSkills.add(h.skill);
                return false;
            }
            return true;
        });
        const tomb = new Set([...(st.deletedHistoryIds || []), ...list]);
        st.deletedHistoryIds = Array.from(tomb).slice(-400);
        list.forEach(id => this._selectedHistoryIds.delete(id));
        this.save();
        if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) CloudClient.scheduleCloudSync();
        affectedSkills.forEach(sk => this.refreshSkillWidgets(sk));
        this.refreshAllVisibleHistoryWidgets();
        showToast(`🗑️ Đã xóa ${list.length} bản ghi lịch sử (bài tập gốc được giữ nguyên).`);
        return true;
    },

    toggleSelectHistory(id, checked) {
        if (checked) this._selectedHistoryIds.add(String(id));
        else this._selectedHistoryIds.delete(String(id));
        this.refreshAllVisibleHistoryWidgets();
    },

    toggleSelectAllSkillHistory(skill, checked) {
        const items = this.getHistoryBySkill(skill);
        items.forEach(h => {
            if (checked) this._selectedHistoryIds.add(String(h.id));
            else this._selectedHistoryIds.delete(String(h.id));
        });
        this.refreshSkillWidgets(skill);
    },

    deleteSelectedSkillHistory(skill) {
        const items = this.getHistoryBySkill(skill);
        const toDel = items.map(h => String(h.id)).filter(id => this._selectedHistoryIds.has(id));
        if (!toDel.length) {
            showToast("Hãy tích chọn ít nhất 1 bản ghi lịch sử cần xóa.", "warning");
            return;
        }
        this.deleteHistoryRecords(toDel);
    },

    renderLearningHistoryPanel(skill, optsOrContainerId = "") {
        const opts = (optsOrContainerId && typeof optsOrContainerId === "object")
            ? optsOrContainerId
            : { containerId: String(optsOrContainerId || ""), sourceScope: "all" };
        const targetId = opts.containerId || `lh-history-${skill}`;
        const sourceScope = opts.sourceScope || "all";
        const box = document.getElementById(targetId);
        if (!box) return;
        const rows = this.getHistoryBySkill(skill, { sourceScope });
        const selectedInSkill = rows.filter(r => this._selectedHistoryIds.has(String(r.id)));
        const allSelected = rows.length > 0 && selectedInSkill.length === rows.length;

        box.innerHTML = `
            <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/20 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <span class="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">Learning History • Không ghi đè lượt làm cũ</span>
                        <h4 class="text-base sm:text-lg font-black text-white mt-0.5">📜 Lịch Sử Học Tập — ${escHtml(skill.toUpperCase())} (${rows.length} lượt nộp)</h4>
                    </div>
                    ${rows.length ? `
                        <div class="flex flex-wrap items-center gap-2 text-xs">
                            <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 cursor-pointer font-bold">
                                <input type="checkbox" ${allSelected ? "checked" : ""} onchange="LearningHub.toggleSelectAllSkillHistory('${skill}', this.checked)" class="accent-violet-500 rounded">
                                <span>Chọn tất cả</span>
                            </label>
                            ${selectedInSkill.length ? `
                                <button type="button" onclick="LearningHub.deleteSelectedSkillHistory('${skill}')" class="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 font-extrabold">
                                    🗑️ Xóa đã chọn (${selectedInSkill.length})
                                </button>
                            ` : ""}
                        </div>
                    ` : ""}
                </div>

                ${!rows.length ? `
                    <div class="p-5 rounded-2xl bg-slate-950/70 border border-white/5 text-xs text-slate-400 text-center">
                        Chưa có bản ghi lịch sử nào cho kỹ năng <strong>${escHtml(skill.toUpperCase())}</strong>. Sau khi bạn hoàn thành và bấm <strong>Nộp bài</strong>, điểm số, đáp án, lỗi sai và nhận xét AI sẽ tự động lưu tại đây!
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs min-w-[680px]">
                            <thead>
                                <tr class="border-b border-white/10 text-[11px] text-slate-400 uppercase">
                                    <th class="py-2.5 px-2 w-8"></th>
                                    <th class="py-2.5 px-2">Tên bài &amp; Bộ câu hỏi</th>
                                    <th class="py-2.5 px-2">Ngày làm</th>
                                    <th class="py-2.5 px-2">Điểm số</th>
                                    <th class="py-2.5 px-2">Số câu đúng</th>
                                    <th class="py-2.5 px-2">Cấp độ</th>
                                    <th class="py-2.5 px-2">Trạng thái</th>
                                    <th class="py-2.5 px-2 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                ${rows.slice(0, 40).map(r => {
                                    const checked = this._selectedHistoryIds.has(String(r.id));
                                    const wrongCnt = (r.wrongItems || []).length;
                                    return `
                                        <tr class="hover:bg-white/[0.03] transition ${checked ? "bg-violet-500/10" : ""}">
                                            <td class="py-3 px-2 align-middle">
                                                <input type="checkbox" ${checked ? "checked" : ""} onchange="LearningHub.toggleSelectHistory('${escHtml(r.id)}', this.checked)" class="accent-violet-500 rounded">
                                            </td>
                                            <td class="py-3 px-2">
                                                <div class="font-extrabold text-white">${escHtml(r.lessonTitle)}</div>
                                                <div class="text-[10.5px] text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                                                    <span class="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 font-bold">${escHtml(r.questionSetLabel || "Bộ câu hỏi 1")}</span>
                                                    <span>Lần #${r.attemptNumber || 1}</span>
                                                    ${r.sourceScope === "pdf_studio" ? `<span class="text-cyan-300">• AI PDF Studio</span>` : ""}
                                                </div>
                                            </td>
                                            <td class="py-3 px-2 text-slate-300 whitespace-nowrap">${new Date(r.completedAt).toLocaleString("vi-VN")}</td>
                                            <td class="py-3 px-2 whitespace-nowrap">
                                                <span class="px-2.5 py-0.5 rounded-full font-black ${r.score10 >= 7 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : r.score10 >= 5 ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"}">${r.score10}/10</span>
                                            </td>
                                            <td class="py-3 px-2 font-bold text-cyan-300 whitespace-nowrap">${r.totalCount > 0 ? `${r.correctCount}/${r.totalCount}` : "Chấm AI"}</td>
                                            <td class="py-3 px-2 whitespace-nowrap">${renderLevelBadge(r.cefrLevel || "B1")}</td>
                                            <td class="py-3 px-2 whitespace-nowrap"><span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">✅ Đã hoàn thành</span></td>
                                            <td class="py-3 px-2 text-right whitespace-nowrap">
                                                <div class="inline-flex items-center gap-1">
                                                    <button type="button" onclick="LearningHub.openHistoryDetailModal('${escHtml(r.id)}', false)" class="px-2.5 py-1 rounded-lg bg-violet-600/25 hover:bg-violet-600/40 text-violet-200 font-bold" title="Xem lại bài làm & đáp án">👁️ Xem lại</button>
                                                    ${wrongCnt > 0 ? `<button type="button" onclick="LearningHub.openHistoryDetailModal('${escHtml(r.id)}', true)" class="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 font-bold" title="Xem phân tích lỗi sai">❌ ${wrongCnt}</button>` : ""}
                                                    <button type="button" onclick="LearningHub.retryFromHistory('${escHtml(r.id)}')" class="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 font-bold" title="Làm lại bài này">🔄</button>
                                                    <button type="button" onclick="LearningHub.deleteHistoryRecords(['${escHtml(r.id)}'])" class="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 font-bold" title="Xóa bản ghi lịch sử này">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    openHistoryDetailModal(recordId, wrongOnly = false) {
        const st = this.load();
        const rec = st.history.find(h => String(h.id) === String(recordId));
        if (!rec) return;
        const items = wrongOnly ? (rec.wrongItems || []) : (rec.answers || []);
        const modal = this.ensureModalHost("lh-review-modal");
        modal.classList.remove("hidden");
        modal.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5" onclick="if(event.target===this) LearningHub.closeModal('lh-review-modal')">
                <div class="w-full max-w-3xl max-h-[88vh] overflow-y-auto glass-panel rounded-3xl border border-violet-500/40 p-5 sm:p-6 space-y-4 text-xs shadow-2xl">
                    <div class="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/10">
                        <div>
                            <div class="flex flex-wrap items-center gap-2">
                                ${renderLevelBadge(rec.cefrLevel || "B1")}
                                <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-200 font-bold">${escHtml(rec.questionSetLabel)} • Lần #${rec.attemptNumber}</span>
                                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-black">${rec.score10}/10 (${rec.scorePct}%)</span>
                            </div>
                            <h3 class="text-lg font-black text-white mt-1.5">${escHtml(rec.lessonTitle)}</h3>
                            <p class="text-[11px] text-slate-400">Hoàn thành: ${new Date(rec.completedAt).toLocaleString("vi-VN")} • Đúng: ${rec.correctCount}/${rec.totalCount}</p>
                        </div>
                        <button type="button" onclick="LearningHub.closeModal('lh-review-modal')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 font-bold">✕ Đóng</button>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <button type="button" onclick="LearningHub.openHistoryDetailModal('${escHtml(rec.id)}', false)" class="px-3 py-1.5 rounded-xl font-bold ${!wrongOnly ? "bg-violet-600 text-white" : "bg-slate-900 text-slate-300 border border-white/10"}">📋 Toàn bộ câu (${(rec.answers || []).length})</button>
                        <button type="button" onclick="LearningHub.openHistoryDetailModal('${escHtml(rec.id)}', true)" class="px-3 py-1.5 rounded-xl font-bold ${wrongOnly ? "bg-rose-600 text-white" : "bg-slate-900 text-rose-300 border border-rose-500/30"}">❌ Chỉ câu sai (${(rec.wrongItems || []).length})</button>
                        <button type="button" onclick="LearningHub.closeModal('lh-review-modal'); LearningHub.retryFromHistory('${escHtml(rec.id)}')" class="ml-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold">🔄 Làm lại bộ câu hỏi này</button>
                    </div>

                    ${rec.userText ? `
                        <div class="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-1.5">
                            <p class="font-extrabold text-cyan-300">✍️ Bài làm bạn đã nộp:</p>
                            <p class="text-slate-200 whitespace-pre-wrap leading-relaxed">${escHtml(rec.userText)}</p>
                        </div>
                    ` : ""}

                    ${rec.aiFeedback?.overviewVi ? `
                        <div class="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/30 space-y-1.5">
                            <p class="font-extrabold text-violet-200">🤖 Nhận xét &amp; Phân tích của AI:</p>
                            <p class="text-slate-200 leading-relaxed">${escHtml(rec.aiFeedback.overviewVi)}</p>
                        </div>
                    ` : ""}

                    ${items.length ? `
                        <div class="space-y-2.5">
                            ${items.map((it, idx) => `
                                <div class="p-3.5 rounded-2xl bg-slate-950/90 border ${it.isCorrect ? "border-emerald-500/35" : "border-rose-500/40"} space-y-1.5">
                                    <p class="font-bold text-white">${it.isCorrect ? "✅" : "❌"} Câu ${idx + 1}: ${escHtml(it.question || "")}</p>
                                    <div class="flex flex-wrap gap-3">
                                        <span>Bạn trả lời: <strong class="${it.isCorrect ? "text-emerald-300" : "text-rose-300 line-through"}">${escHtml(it.userAnswer || "(Bỏ trống)")}</strong></span>
                                        <span>Đáp án đúng: <strong class="text-emerald-300">${escHtml(it.correctAnswer || "")}</strong></span>
                                    </div>
                                    ${it.explanationVi ? `<p class="text-slate-300">💡 ${escHtml(it.explanationVi)}</p>` : ""}
                                </div>
                            `).join("")}
                        </div>
                    ` : (!rec.userText ? `<p class="text-slate-400 italic text-center py-4">Không có câu sai nào trong lượt làm này!</p>` : "")}
                </div>
            </div>
        `;
    },

    retryFromHistory(recordId) {
        const st = this.load();
        const rec = st.history.find(h => String(h.id) === String(recordId));
        if (!rec) return;
        const lKey = this.getLessonKey(rec.skill, rec.lessonId);
        this._activeSetByLesson[lKey] = rec.questionSetId || "set-1";

        if (rec.sourceScope === "pdf_studio") {
            navigateTo("pdf-studio");
            if (rec.unitId && rec.lessonId && typeof lmsOpenLesson === "function") {
                const psId = (rec.questionSetId === "set-1" || !rec.questionSetId) ? "original" : rec.questionSetId;
                lmsOpenLesson(rec.unitId, rec.skill, rec.lessonId, psId);
            } else {
                showToast(`🔄 Đã mở lại AI PDF Studio — chọn "${rec.lessonTitle}" để làm lại!`);
            }
            return;
        }
        if (String(rec.lessonId || "").startsWith("trans-") && typeof selectTranslationLesson === "function") {
            const tid = Number(String(rec.lessonId).replace(/^trans-/, ""));
            if (typeof switchWritingHubMode === "function") switchWritingHubMode("translation");
            if (tid) selectTranslationLesson(tid);
            return;
        }
        const aiEx = st.aiExercises.find(e => String(e.id) === String(rec.lessonId));
        if (aiEx) {
            this.openAiExercise(aiEx.id, rec.questionSetId);
            return;
        }
        if (rec.skill === "reading" && typeof openReadingPassage === "function") openReadingPassage(rec.lessonId);
        else if (rec.skill === "listening" && typeof openListeningExercise === "function") openListeningExercise(rec.lessonId);
        else if (rec.skill === "grammar" && typeof openGrammarLesson === "function") openGrammarLesson(rec.lessonId);
        else if (rec.skill === "writing" && typeof openWritingEditor === "function") openWritingEditor(rec.lessonId);
        else if (rec.skill === "speaking" && typeof openTopicSpeakingWorkspace === "function") openTopicSpeakingWorkspace(rec.lessonId);
        else if (rec.skill === "vocabulary") navigateTo("vocabulary", "practice");
    },

    /* ==================== 2. AI – GENERATE EXERCISE (ALL 6 STANDALONE SKILLS) ==================== */
    getGenForm(skill) {
        if (!this._genFormBySkill[skill]) {
            const types = LEARNING_HUB_SKILL_TYPES[skill] || LEARNING_HUB_SKILL_TYPES.reading;
            this._genFormBySkill[skill] = {
                cefrLevel: "",
                cefrConfirmed: false,
                difficulty: "medium",
                count: "10",
                topicMode: "current", // current | free | custom
                topicInput: "",
                exerciseType: types[0].id,
                busy: false
            };
        }
        return this._genFormBySkill[skill];
    },

    selectGenCefr(skill, code) {
        const f = this.getGenForm(skill);
        f.cefrLevel = code;
        f.cefrConfirmed = true;
        this.renderAiGenerateExercisePanel(skill);
    },

    getAiExercisesBySkill(skill) {
        const st = this.load();
        return st.aiExercises.filter(e => e.skill === skill);
    },

    deleteAiExercise(exId, skill) {
        if (!confirm("Xóa bài tập AI này khỏi danh sách? (Lịch sử làm bài trước đó vẫn được giữ riêng trong Learning History).")) return;
        const st = this.load();
        st.aiExercises = st.aiExercises.filter(e => String(e.id) !== String(exId));
        const tomb = new Set([...(st.deletedExerciseIds || []), String(exId)]);
        st.deletedExerciseIds = Array.from(tomb).slice(-400);
        this.save();
        if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) CloudClient.scheduleCloudSync();
        this.renderAiGenerateExercisePanel(skill);
        showToast("🗑️ Đã xóa bài tập AI khỏi thư viện.");
    },

    renderAiGenerateExercisePanel(skill, containerId = "") {
        const targetId = containerId || `lh-aigen-${skill}`;
        const box = document.getElementById(targetId);
        if (!box) return;
        const f = this.getGenForm(skill);
        const types = LEARNING_HUB_SKILL_TYPES[skill] || LEARNING_HUB_SKILL_TYPES.reading;
        const savedList = this.getAiExercisesBySkill(skill);

        box.innerHTML = `
            <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-emerald-950/20 space-y-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">AI – Generate Exercise • Chuẩn hóa CEFR A1–C2</span>
                        <h4 class="text-base sm:text-lg font-black text-white mt-0.5">✨ Tạo Bài Tập ${escHtml(skill.toUpperCase())} Mới Bằng AI</h4>
                        <p class="text-xs text-slate-400 mt-0.5">Chọn chính xác trình độ CEFR, độ khó, số câu và dạng bài — AI sẽ tạo bài hoàn chỉnh, lưu vĩnh viễn vào kho &amp; đồng bộ Cloud.</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-[11px] font-extrabold border ${f.cefrConfirmed ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/35" : "bg-amber-500/15 text-amber-300 border-amber-500/35"}">
                        ${f.cefrConfirmed ? `✅ Đã chọn: CEFR ${f.cefrLevel}` : "⚠️ Bắt buộc chọn CEFR A1–C2"}
                    </span>
                </div>

                <!-- STEP 1: MANDATORY CEFR LEVEL SELECTION -->
                <div class="space-y-2">
                    <p class="text-xs font-extrabold text-cyan-300 uppercase tracking-wide">Bước 1: SELECT YOUR ENGLISH LEVEL (Bắt buộc chọn trước khi tạo) *</p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        ${LEARNING_HUB_CEFR_LEVELS.map(lv => {
                            const active = f.cefrLevel === lv.code;
                            return `
                                <button type="button" data-cefr-btn="${skill}-${lv.code}" onclick="LearningHub.selectGenCefr('${skill}','${lv.code}')" class="p-2.5 rounded-2xl border text-left transition ${active ? "bg-emerald-600/25 border-emerald-400 ring-1 ring-emerald-400/60 text-white shadow-lg" : "bg-slate-950/80 border-white/10 hover:border-cyan-400/50 text-slate-300"}">
                                    <div class="font-black text-xs ${active ? "text-emerald-300" : "text-white"}">${lv.label}</div>
                                    <div class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">${lv.desc}</div>
                                </button>
                            `;
                        }).join("")}
                    </div>
                </div>

                <!-- STEP 2: SKILL-FILTERED OPTIONS -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                        <label class="text-[11px] font-bold text-slate-300 block mb-1">Độ khó bài tập:</label>
                        <select onchange="LearningHub.getGenForm('${skill}').difficulty=this.value;" class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-cyan-300 font-bold">
                            <option value="easy" ${f.difficulty === "easy" ? "selected" : ""}>🟢 Dễ (Easy)</option>
                            <option value="medium" ${f.difficulty === "medium" ? "selected" : ""}>🟡 Trung bình (Medium)</option>
                            <option value="hard" ${f.difficulty === "hard" ? "selected" : ""}>🟠 Khó (Hard)</option>
                            <option value="challenging" ${f.difficulty === "challenging" ? "selected" : ""}>🔴 Thử thách (Challenging)</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-slate-300 block mb-1">Số lượng câu / độ dài:</label>
                        <select onchange="LearningHub.getGenForm('${skill}').count=this.value;" class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-violet-300 font-bold">
                            <option value="5" ${f.count === "5" ? "selected" : ""}>5 câu</option>
                            <option value="10" ${f.count === "10" ? "selected" : ""}>10 câu</option>
                            <option value="15" ${f.count === "15" ? "selected" : ""}>15 câu</option>
                            <option value="20" ${f.count === "20" ? "selected" : ""}>20 câu</option>
                            <option value="full" ${f.count === "full" ? "selected" : ""}>Một bài hoàn chỉnh</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-slate-300 block mb-1">Loại bài (${escHtml(skill.toUpperCase())}):</label>
                        <select onchange="LearningHub.getGenForm('${skill}').exerciseType=this.value;" class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-emerald-300 font-bold">
                            ${types.map(t => `<option value="${t.id}" ${f.exerciseType === t.id ? "selected" : ""}>${escHtml(t.label)}</option>`).join("")}
                        </select>
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-slate-300 block mb-1">Nguồn chủ đề:</label>
                        <select onchange="LearningHub.getGenForm('${skill}').topicMode=this.value; LearningHub.renderAiGenerateExercisePanel('${skill}');" class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-amber-300 font-bold">
                            <option value="current" ${f.topicMode === "current" ? "selected" : ""}>📚 Theo nội dung đang học</option>
                            <option value="free" ${f.topicMode === "free" ? "selected" : ""}>🎲 Chủ đề tự do (AI đề xuất)</option>
                            <option value="custom" ${f.topicMode === "custom" ? "selected" : ""}>✍️ Chủ đề do bạn nhập</option>
                        </select>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center text-xs">
                    <input id="lh-aigen-topic-${skill}" type="text" value="${escHtml(f.topicInput || "")}" oninput="LearningHub.getGenForm('${skill}').topicInput=this.value;" placeholder="${f.topicMode === "custom" ? "Nhập chủ đề cụ thể bạn muốn học (VD: Remote Work, Climate Change, Travel...)..." : "Tùy chọn: ghi thêm từ khóa chủ đề muốn AI nhấn mạnh..."}" class="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400">
                    <button id="lh-aigen-submit-${skill}" type="button" onclick="LearningHub.runGenerateExercise('${skill}')" ${f.busy ? "disabled" : ""} class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold shadow-lg disabled:opacity-60 whitespace-nowrap">
                        ${f.busy ? "⏳ AI đang tạo bài tập..." : `✨ AI – Generate ${skill.charAt(0).toUpperCase() + skill.slice(1)} Exercise`}
                    </button>
                </div>

                ${savedList.length ? `
                    <div class="pt-3 border-t border-white/10 space-y-2.5">
                        <p class="text-xs font-extrabold text-emerald-300">🤖 Bài tập AI đã lưu trong ${escHtml(skill.toUpperCase())} (${savedList.length} bài):</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            ${savedList.map(ex => {
                                const qSets = this.getQuestionSetsForLesson(skill, ex.id, ex.questions || ex.exercises || []);
                                const hist = this.getHistoryBySkill(skill).filter(h => String(h.lessonId) === String(ex.id));
                                const best = hist.length ? Math.max(...hist.map(h => h.score10)) : null;
                                return `
                                    <div class="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/25 hover:border-emerald-400/60 transition flex flex-col justify-between gap-3 text-xs">
                                        <div class="space-y-1.5">
                                            <div class="flex items-center justify-between gap-1.5 flex-wrap">
                                                <div class="flex items-center gap-1.5">
                                                    ${renderLevelBadge(ex.cefrLevel)}
                                                    <span class="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 text-[10px] font-bold">🤖 AI • ${escHtml(ex.difficulty || "medium")}</span>
                                                </div>
                                                <button type="button" onclick="LearningHub.deleteAiExercise('${escHtml(ex.id)}','${skill}')" title="Xóa bài tập AI này" class="px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 font-bold">🗑️</button>
                                            </div>
                                            <h5 class="font-extrabold text-white text-sm leading-snug">${escHtml(ex.title)}</h5>
                                            <p class="text-[11px] text-slate-400">
                                                ${qSets.length} bộ câu hỏi • ${new Date(ex.createdAt).toLocaleDateString("vi-VN")}
                                                ${best !== null ? ` • <strong class="text-emerald-300">Cao nhất ${best}/10</strong>` : ""}
                                            </p>
                                        </div>
                                        <button type="button" onclick="LearningHub.openAiExercise('${escHtml(ex.id)}')" class="w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 text-white font-extrabold">▶ Vào làm bài →</button>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                ` : ""}

                ${skill === "vocabulary" ? `<div id="lh-vocab-ai-workspace" class="hidden pt-2"></div>` : ""}
            </div>
        `;
    },

    async runGenerateExercise(skill) {
        const f = this.getGenForm(skill);
        if (!f.cefrConfirmed || !f.cefrLevel) {
            showToast("⚠️ Vui lòng chọn trình độ CEFR (A1 – C2) ở Bước 1 trước khi tạo bài tập!", "warning");
            return;
        }
        if (f.topicMode === "custom" && !String(f.topicInput || "").trim()) {
            showToast("Vui lòng nhập chủ đề bạn muốn AI tạo bài!", "warning");
            return;
        }
        if (f.busy) return;
        f.busy = true;
        this.renderAiGenerateExercisePanel(skill);

        try {
            let learningContext = "";
            if (f.topicMode === "current") {
                const vocabSample = (Array.isArray(deck) ? deck : []).slice(0, 18).map(w => w.term).join(", ");
                const activeCourse = typeof getActivePdfCourse === "function" ? getActivePdfCourse() : null;
                const unitTitles = (activeCourse?.units || []).slice(0, 5).map(u => u.title).join("; ");
                learningContext = `Learner's active vocabulary: ${vocabSample}. Active course units: ${unitTitles}.`;
            }
            const topicVal = String(f.topicInput || "").trim() || (f.topicMode === "current" ? "Active QEnglish Curriculum Topics" : "Modern Real-World & Academic Life");
            showToast(`✨ AI đang tạo bài ${skill.toUpperCase()} trình độ ${f.cefrLevel} (${f.difficulty})...`);

            const res = await AIClient.request("generate-skill-exercise", {
                skill,
                cefrLevel: f.cefrLevel,
                difficulty: f.difficulty,
                count: f.count,
                topicMode: f.topicMode,
                topic: topicVal,
                exerciseType: f.exerciseType,
                learningContext
            });

            if (!res || !res.ok || !res.data) {
                showToast("Không tạo được bài tập AI: " + (res?.error || "Vui lòng kiểm tra kết nối AI Backend."), "error");
                return;
            }

            const d = res.data;
            const exId = `aiex-${skill}-${Date.now().toString(36)}`;
            const qs = this.normalizeQuestionsList(d.questions || d.exercises || [], `q-${exId}`);

            const record = {
                id: exId,
                skill,
                cefrLevel: f.cefrLevel,
                level: f.cefrLevel,
                difficulty: f.difficulty,
                exerciseType: f.exerciseType,
                topic: String(d.topic || topicVal),
                title: String(d.title || `[${f.cefrLevel}] ${topicVal}`).trim(),
                source: "ai-generated",
                provider: res.provider || "Google Gemini",
                createdAt: new Date().toISOString()
            };

            if (skill === "reading") {
                record.passage = String(d.passage || "").trim();
                record.keyVocab = Array.isArray(d.keyVocab) ? d.keyVocab : [];
                record.questions = qs;
            } else if (skill === "listening") {
                const tLines = Array.isArray(d.transcriptLines)
                    ? d.transcriptLines.map(ln => ({
                        speaker: String(ln?.speaker || "").trim(),
                        text: String(ln?.text || ln || "").trim(),
                        translationVi: String(ln?.translationVi || "").trim()
                    })).filter(l => l.text)
                    : [];
                record.type = "multiple_choice";
                record.transcriptLines = tLines;
                record.transcript = tLines.map(l => l.speaker ? `${l.speaker}: ${l.text}` : l.text).join("\n");
                record.audioText = record.transcript;
                record.sentences = tLines.map(l => l.speaker ? `${l.speaker}: ${l.text}` : l.text);
                record.questions = qs;
            } else if (skill === "writing") {
                record.type = d.taskType || "essay";
                record.prompt = String(d.prompt || d.promptEn || "").trim();
                record.promptVi = String(d.promptVi || "").trim();
                record.sourceTextVi = String(d.sourceTextVi || "").trim();
                record.minWords = Number(d.minWords) || 100;
                record.maxWords = Number(d.maxWords) || 220;
                record.timeLimit = Number(d.timeLimit) || 25;
                record.targetStructures = Array.isArray(d.targetStructures) ? d.targetStructures : [];
                record.keyVocab = Array.isArray(d.keyVocab) ? d.keyVocab : [];
                record.rubricVi = Array.isArray(d.rubricVi) ? d.rubricVi : [];
                record.modelAnswer = String(d.modelAnswer || "").trim();
                record.questions = qs;
            } else if (skill === "speaking") {
                record.type = "monologue";
                record.scenarioVi = String(d.scenarioVi || "").trim();
                record.prompt = String(d.prompt || record.title).trim();
                record.promptVi = String(d.promptVi || d.scenarioVi || "").trim();
                record.duration = Number(d.duration) || 90;
                record.dialogueLines = Array.isArray(d.dialogueLines)
                    ? d.dialogueLines.map(dl => ({ speaker: String(dl?.speaker || "Speaker").trim(), text: String(dl?.text || dl || "").trim() })).filter(l => l.text)
                    : [];
                record.suggestedQuestions = (Array.isArray(d.suggestedQuestions) ? d.suggestedQuestions : []).map(q => typeof q === "string" ? q : String(q?.question || "")).filter(Boolean);
                record.usefulPhrases = Array.isArray(d.usefulPhrases) ? d.usefulPhrases : [];
                record.suggestedVocab = Array.isArray(d.suggestedVocab) ? d.suggestedVocab : [];
                record.sampleAnswer = String(d.sampleAnswer || "").trim();
                record.questions = qs;
            } else if (skill === "vocabulary") {
                record.words = (Array.isArray(d.words) ? d.words : []).map((w, wi) => ({
                    id: `aivw-${exId}-${wi}`,
                    term: String(w?.term || "").trim(),
                    ipa: String(w?.ipa || "").trim(),
                    pos: String(w?.pos || "").trim(),
                    meaningVi: String(w?.meaningVi || "").trim(),
                    example: String(w?.example || "").trim(),
                    collocations: Array.isArray(w?.collocations) ? w.collocations : [],
                    synonyms: Array.isArray(w?.synonyms) ? w.synonyms : [],
                    antonyms: Array.isArray(w?.antonyms) ? w.antonyms : []
                })).filter(w => w.term);
                record.questions = qs;
            } else {
                record.intro = String(d.intro || record.topic).trim();
                record.explanation = String(d.explanation || "").trim();
                record.formula = String(d.formula || "").trim();
                record.examples = Array.isArray(d.examples) ? d.examples : [];
                record.commonMistakes = Array.isArray(d.commonMistakes) ? d.commonMistakes : [];
                record.exercises = qs.map(q => ({
                    ...q,
                    type: q.options?.length ? "multiple_choice" : (q.type || "fill_blank"),
                    acceptAlt: q.acceptableAnswers || []
                }));
                record.questions = record.exercises;
            }

            const st = this.load();
            st.aiExercises.unshift(record);
            this.save();
            if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) CloudClient.syncNow();

            showToast(`🎉 Đã tạo & lưu bài "${record.title}" (CEFR ${f.cefrLevel})!`);
            this.openAiExercise(record.id);
        } finally {
            f.busy = false;
            this.renderAiGenerateExercisePanel(skill);
        }
    },

    openAiExercise(exId, targetSetId = "set-1") {
        const st = this.load();
        const ex = st.aiExercises.find(e => String(e.id) === String(exId));
        if (!ex) return;
        const lKey = this.getLessonKey(ex.skill, ex.id);
        this._activeSetByLesson[lKey] = targetSetId || "set-1";

        if (ex.skill === "reading" && typeof openReadingPassage === "function") {
            openReadingPassage(ex.id, ex);
        } else if (ex.skill === "listening" && typeof openListeningExercise === "function") {
            openListeningExercise(ex.id, ex);
        } else if (ex.skill === "grammar" && typeof openGrammarLesson === "function") {
            openGrammarLesson(ex.id, ex);
        } else if (ex.skill === "writing" && typeof openWritingEditor === "function") {
            if (typeof switchWritingHubMode === "function") switchWritingHubMode("studio");
            openWritingEditor(ex.id, ex);
        } else if (ex.skill === "speaking" && typeof openTopicSpeakingWorkspace === "function") {
            openTopicSpeakingWorkspace(ex.id, ex);
        } else if (ex.skill === "vocabulary") {
            this._activeVocabExercise = ex;
            this.renderVocabAiExerciseWorkspace();
        }
    },

    renderVocabAiExerciseWorkspace() {
        const ex = this._activeVocabExercise;
        const host = document.getElementById("lh-vocab-ai-workspace");
        if (!host) return;
        if (!ex) {
            host.classList.add("hidden");
            return;
        }
        host.classList.remove("hidden");
        const activeSet = this.getActiveQuestionSet("vocabulary", ex.id, ex.questions || []);
        const draft = this.getSetDraft("vocabulary", ex.id, activeSet.id);
        const qs = activeSet.questions || [];

        host.innerHTML = `
            <div class="p-5 rounded-3xl bg-slate-950/95 border border-indigo-500/40 space-y-5 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div>
                        <div class="flex items-center gap-2">${renderLevelBadge(ex.cefrLevel)} <span class="text-indigo-300 font-bold">🤖 AI Vocabulary Exercise</span></div>
                        <h4 class="text-lg font-black text-white mt-1">${escHtml(ex.title)}</h4>
                    </div>
                    <div class="flex gap-2">
                        <button type="button" onclick="LearningHub.saveVocabExerciseWordsToBank('${escHtml(ex.id)}')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold">➕ Lưu toàn bộ từ vào Kho SRS</button>
                        <button type="button" onclick="LearningHub._activeVocabExercise=null; LearningHub.renderVocabAiExerciseWorkspace();" class="px-3 py-2 rounded-xl bg-white/5 text-slate-300 font-bold">✕ Đóng</button>
                    </div>
                </div>

                <!-- LEFT/TOP: FLASHCARDS GRID -->
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${(ex.words || []).map(w => `
                        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1.5">
                            <button type="button" onclick='speakText(${JSON.stringify(w.term)})' class="font-black text-sm text-white hover:text-cyan-300 text-left">🔊 ${escHtml(w.term)} <span class="font-mono text-cyan-300 text-[11px] font-normal">${escHtml(w.ipa || "")}</span></button>
                            <p class="text-emerald-300 font-bold">${escHtml(w.meaningVi)} ${w.pos ? `<span class="text-slate-400 font-normal">(${escHtml(w.pos)})</span>` : ""}</p>
                            ${w.example ? `<p class="text-slate-300 italic text-[11px]">"${escHtml(w.example)}"</p>` : ""}
                            ${(w.collocations || []).length ? `<p class="text-[10.5px] text-violet-300"><strong>Collocations:</strong> ${escHtml(w.collocations.join(", "))}</p>` : ""}
                        </div>
                    `).join("")}
                </div>

                <!-- QUESTION SETS SWITCHER + INTERACTIVE QUIZ -->
                <div id="lh-qsets-vocabulary-${escHtml(ex.id)}"></div>

                <div class="space-y-3">
                    ${qs.map((q, qi) => this.renderGenericQuestionCard("vocabulary", ex.id, activeSet.id, q, qi, qs.length, draft[q.id])).join("")}
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <span class="text-slate-400">Bộ đang làm: <strong class="text-cyan-300">${escHtml(activeSet.label)} (${qs.length} câu)</strong></span>
                    <button type="button" onclick="LearningHub.submitStandaloneSet('vocabulary', '${escHtml(ex.id)}', '${escHtml(ex.title)}', '${escHtml(ex.cefrLevel)}', '${escHtml(activeSet.id)}')" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-lg">✅ Nộp bài &amp; Lưu Lịch Sử</button>
                </div>
                <div id="lh-set-result-vocabulary-${escHtml(ex.id)}" class="hidden"></div>
            </div>
        `;
        this.renderQuestionSetsBar("vocabulary", ex.id, ex.questions || [], `lh-qsets-vocabulary-${ex.id}`, {
            lessonTitle: ex.title,
            lessonLevel: ex.cefrLevel,
            lessonContent: { title: ex.title, words: ex.words },
            onSelect: () => this.renderVocabAiExerciseWorkspace()
        });
    },

    saveVocabExerciseWordsToBank(exId) {
        const ex = this.load().aiExercises.find(e => String(e.id) === String(exId));
        if (!ex || !Array.isArray(ex.words)) return;
        const existing = new Set((deck || []).map(w => String(w.term || "").trim().toLowerCase()));
        let added = 0;
        ex.words.forEach(w => {
            const key = String(w.term || "").trim().toLowerCase();
            if (!key || existing.has(key)) return;
            existing.add(key);
            deck.unshift(normalizeWordItem({
                id: Date.now() + Math.random(),
                term: w.term,
                ipa: w.ipa || "",
                pos: w.pos || "",
                def: w.meaningVi || w.term,
                example: w.example || "",
                level: ex.cefrLevel || "B1",
                category: ex.topic || "AI Vocab",
                day: 1,
                source: "ai-generated"
            }));
            added++;
        });
        if (added > 0) {
            saveDeckToStorage();
            if (typeof applyStudyFilter === "function") applyStudyFilter();
            if (typeof renderWordList === "function") renderWordList();
            showToast(`✅ Đã lưu thêm ${added} từ vựng mới vào Kho SRS cá nhân!`);
        } else {
            showToast("Tất cả các từ này đã có sẵn trong Kho từ vựng của bạn rồi!");
        }
    },

    /* ==================== 3. QUESTION SETS & AI – GENERATE MORE QUESTIONS (UNLIMITED SETS 1..N) ==================== */
    getQuestionSetsForLesson(skill, lessonId, originalQuestions = []) {
        const st = this.load();
        const lKey = this.getLessonKey(skill, lessonId);
        const origNorm = this.normalizeQuestionsList(originalQuestions, `orig-${lessonId}`);
        const set1 = {
            id: "set-1",
            setNumber: 1,
            label: "Bộ câu hỏi 1",
            sourceType: "original",
            cefrLevel: "",
            questions: origNorm
        };
        const aiSets = Array.isArray(st.questionSetsByLesson[lKey]) ? st.questionSetsByLesson[lKey] : [];
        return [set1, ...aiSets.map((s, idx) => ({
            ...s,
            setNumber: Number(s.setNumber) || (idx + 2),
            label: s.label || `Bộ câu hỏi ${Number(s.setNumber) || (idx + 2)}`
        }))];
    },

    getActiveQuestionSet(skill, lessonId, originalQuestions = []) {
        const sets = this.getQuestionSetsForLesson(skill, lessonId, originalQuestions);
        const lKey = this.getLessonKey(skill, lessonId);
        const activeId = this._activeSetByLesson[lKey] || "set-1";
        return sets.find(s => s.id === activeId) || sets[0];
    },

    setActiveQuestionSet(skill, lessonId, setId) {
        const lKey = this.getLessonKey(skill, lessonId);
        this._activeSetByLesson[lKey] = setId;
        this._startedAtBySet[`${lKey}::${setId}`] = Date.now();
    },

    getSetDraft(skill, lessonId, setId) {
        const k = `${this.getLessonKey(skill, lessonId)}::${setId}`;
        if (!this._draftAnswersBySet[k]) this._draftAnswersBySet[k] = {};
        return this._draftAnswersBySet[k];
    },

    setDraftAnswer(skill, lessonId, setId, qId, val) {
        const d = this.getSetDraft(skill, lessonId, setId);
        d[qId] = val;
    },

    renderQuestionSetsBar(skill, lessonId, originalQuestions, containerId, opts = {}) {
        const host = document.getElementById(containerId);
        if (!host) return;
        const sets = this.getQuestionSetsForLesson(skill, lessonId, originalQuestions);
        const activeSet = this.getActiveQuestionSet(skill, lessonId, originalQuestions);
        this._qsetCallbacks = this._qsetCallbacks || {};
        this._qsetCallbacks[containerId] = { skill, lessonId, originalQuestions, opts };

        host.innerHTML = `
            <div class="p-3.5 rounded-2xl bg-slate-950/90 border border-violet-500/30 space-y-2.5 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-[10.5px] font-black uppercase tracking-wider text-violet-300">📚 QUESTION SETS (${sets.length} bộ câu hỏi độc lập)</span>
                    <button type="button" data-gen-more-btn="${skill}" onclick="LearningHub.openGenerateMoreModalFromContainer('${escHtml(containerId)}')" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold text-[11px] shadow">
                        ➕ AI – Generate More Questions
                    </button>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${sets.map(s => {
                        const isCur = s.id === activeSet.id;
                        const hList = this.getHistoryForQuestionSet(skill, lessonId, s.id);
                        const lastRec = hList[0] || null;
                        const statusText = lastRec
                            ? `✅ ${lastRec.score10}/10 (${hList.length} lần)`
                            : "⏳ Chưa làm";
                        return `
                            <button type="button" data-qset-pill="${escHtml(s.id)}" onclick="LearningHub.selectQuestionSetFromContainer('${escHtml(containerId)}','${escHtml(s.id)}')" class="px-3 py-2 rounded-xl border text-left transition ${isCur ? "bg-violet-600/25 border-violet-400 ring-1 ring-violet-400/60 text-white" : "bg-slate-900/90 border-white/10 hover:border-cyan-400/50 text-slate-300"}">
                                <div class="font-extrabold flex items-center gap-1.5">
                                    <span>${escHtml(s.label)}</span>
                                    <span class="text-[10px] px-1.5 py-0.5 rounded ${s.sourceType === "original" ? "bg-cyan-500/15 text-cyan-300" : "bg-emerald-500/15 text-emerald-300"}">${s.sourceType === "original" ? "Original" : `AI • ${escHtml(s.cefrLevel || "B1")}`}</span>
                                </div>
                                <div class="text-[10px] text-slate-400 mt-0.5">${(s.questions || []).length} câu • <span class="${lastRec ? "text-emerald-300 font-bold" : "text-slate-400"}">${statusText}</span></div>
                            </button>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    },

    selectQuestionSetFromContainer(containerId, setId) {
        const meta = this._qsetCallbacks && this._qsetCallbacks[containerId];
        if (!meta) return;
        this.setActiveQuestionSet(meta.skill, meta.lessonId, setId);
        this.renderQuestionSetsBar(meta.skill, meta.lessonId, meta.originalQuestions, containerId, meta.opts);
        if (typeof meta.opts?.onSelect === "function") {
            meta.opts.onSelect(this.getActiveQuestionSet(meta.skill, meta.lessonId, meta.originalQuestions));
        }
    },

    openGenerateMoreModalFromContainer(containerId) {
        const meta = this._qsetCallbacks && this._qsetCallbacks[containerId];
        if (!meta) return;
        this.openGenerateMoreQuestionsModal({
            skill: meta.skill,
            lessonId: meta.lessonId,
            lessonTitle: meta.opts?.lessonTitle || "Bài học",
            lessonLevel: meta.opts?.lessonLevel || "B1",
            lessonContent: meta.opts?.lessonContent || {},
            originalQuestions: meta.originalQuestions || [],
            onCreated: (newSet) => {
                this.setActiveQuestionSet(meta.skill, meta.lessonId, newSet.id);
                this.renderQuestionSetsBar(meta.skill, meta.lessonId, meta.originalQuestions, containerId, meta.opts);
                if (typeof meta.opts?.onSelect === "function") meta.opts.onSelect(newSet);
            }
        });
    },

    openGenerateMoreQuestionsModal({ skill, lessonId, lessonTitle, lessonLevel, lessonContent, originalQuestions = [], onCreated = null }) {
        const suggestedCefr = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(String(lessonLevel || "").toUpperCase())
            ? String(lessonLevel).toUpperCase()
            : "B1";
        this._modalState = {
            open: true,
            skill,
            lessonId,
            lessonTitle,
            lessonLevel: suggestedCefr,
            lessonContent,
            originalQuestions,
            cefrLevel: "", // Force explicit user confirmation before generating!
            suggestedCefr,
            cefrConfirmed: false,
            difficultyMode: "same",
            count: 10,
            busy: false,
            onCreated
        };
        this.renderGenerateMoreQuestionsModal();
    },

    renderGenerateMoreQuestionsModal() {
        const m = this._modalState;
        const modal = this.ensureModalHost("lh-genmore-modal");
        if (!m.open) {
            modal.classList.add("hidden");
            return;
        }
        const existingSets = this.getQuestionSetsForLesson(m.skill, m.lessonId, m.originalQuestions);
        const nextSetNum = existingSets.length + 1;

        modal.classList.remove("hidden");
        modal.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5" onclick="if(event.target===this && !LearningHub._modalState.busy) LearningHub.closeModal('lh-genmore-modal')">
                <div class="w-full max-w-xl glass-panel rounded-3xl border border-emerald-500/40 p-5 sm:p-6 space-y-5 text-xs shadow-2xl">
                    <div class="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
                        <div>
                            <span class="text-[10px] font-extrabold uppercase text-emerald-400">AI – Generate More Questions • Không ghi đè bộ cũ</span>
                            <h3 class="text-lg font-black text-white mt-0.5">➕ Tạo Bộ Câu Hỏi ${nextSetNum} cho "${escHtml(m.lessonTitle)}"</h3>
                            <p class="text-[11px] text-slate-400 mt-0.5">Đã có ${existingSets.length} bộ câu hỏi. Bộ mới sẽ được lưu độc lập thành <strong>Bộ câu hỏi ${nextSetNum}</strong> với lịch sử chấm điểm riêng.</p>
                        </div>
                        <button type="button" onclick="LearningHub.closeModal('lh-genmore-modal')" ${m.busy ? "disabled" : ""} class="px-2.5 py-1 rounded-xl bg-white/5 text-slate-300 font-bold">✕</button>
                    </div>

                    <!-- MANDATORY CEFR LEVEL CONFIRMATION -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <p class="font-extrabold text-cyan-300 uppercase">Bước 1: SELECT QUESTION LEVEL (Đề xuất: ${m.suggestedCefr}) *</p>
                            <span class="text-[10.5px] font-bold ${m.cefrConfirmed ? "text-emerald-300" : "text-amber-300"}">${m.cefrConfirmed ? `✅ Đã xác nhận: ${m.cefrLevel}` : "⚠️ Chưa xác nhận cấp độ"}</span>
                        </div>
                        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            ${LEARNING_HUB_CEFR_LEVELS.map(lv => {
                                const isSel = m.cefrLevel === lv.code;
                                const isSug = !m.cefrConfirmed && lv.code === m.suggestedCefr;
                                return `
                                    <button type="button" data-qmodal-cefr="${lv.code}" onclick="LearningHub._modalState.cefrLevel='${lv.code}'; LearningHub._modalState.cefrConfirmed=true; LearningHub.renderGenerateMoreQuestionsModal();" class="py-2.5 px-2 rounded-xl border font-black transition ${isSel ? "bg-emerald-600/30 border-emerald-400 text-white ring-1 ring-emerald-400" : isSug ? "bg-cyan-500/10 border-cyan-400/50 text-cyan-200" : "bg-slate-950 border-white/10 text-slate-300 hover:border-white/30"}">
                                        ${lv.code}${isSug ? " ★" : ""}
                                    </button>
                                `;
                            }).join("")}
                        </div>
                    </div>

                    <!-- DIFFICULTY ADJUSTMENT & COUNT -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="text-[11px] font-bold text-slate-300 block mb-1">Chế độ độ khó so với bài gốc:</label>
                            <select onchange="LearningHub._modalState.difficultyMode=this.value;" class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2.5 text-cyan-300 font-bold">
                                <option value="same" ${m.difficultyMode === "same" ? "selected" : ""}>🎯 Giữ nguyên trình độ bài gốc</option>
                                <option value="harder" ${m.difficultyMode === "harder" ? "selected" : ""}>🔥 Tăng độ khó</option>
                                <option value="easier" ${m.difficultyMode === "easier" ? "selected" : ""}>🌱 Giảm độ khó</option>
                                <option value="exact_cefr" ${m.difficultyMode === "exact_cefr" ? "selected" : ""}>📐 Đúng chuẩn cấp độ CEFR đã chọn</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[11px] font-bold text-slate-300 block mb-1">Số lượng câu hỏi mới:</label>
                            <select onchange="LearningHub._modalState.count=Number(this.value);" class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2.5 text-violet-300 font-bold">
                                ${[5, 10, 15, 20, 30].map(n => `<option value="${n}" ${Number(m.count) === n ? "selected" : ""}>${n} câu hỏi mới</option>`).join("")}
                            </select>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                        <button type="button" onclick="LearningHub.closeModal('lh-genmore-modal')" ${m.busy ? "disabled" : ""} class="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 font-bold">Hủy</button>
                        <button id="lh-genmore-confirm-btn" type="button" onclick="LearningHub.executeGenerateMoreQuestions()" ${m.busy ? "disabled" : ""} class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold shadow-lg disabled:opacity-60">
                            ${m.busy ? `⏳ AI đang phân tích &amp; tạo Bộ ${nextSetNum}...` : `✨ Xác nhận &amp; Tạo Bộ câu hỏi ${nextSetNum}`}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    async executeGenerateMoreQuestions() {
        const m = this._modalState;
        if (!m.cefrConfirmed || !m.cefrLevel) {
            showToast("⚠️ Vui lòng bấm chọn cấp độ CEFR (A1–C2) trước khi tạo bộ câu hỏi mới!", "warning");
            return;
        }
        if (m.busy) return;
        m.busy = true;
        this.renderGenerateMoreQuestionsModal();

        try {
            const existingSets = this.getQuestionSetsForLesson(m.skill, m.lessonId, m.originalQuestions);
            const nextSetNum = existingSets.length + 1;
            const existingQuestions = existingSets.flatMap(s => (s.questions || []).map(q => q.question)).filter(Boolean);

            const res = await AIClient.request("generate-more-questions", {
                skill: m.skill,
                lessonTitle: m.lessonTitle,
                lessonContent: m.lessonContent,
                cefrLevel: m.cefrLevel,
                difficultyMode: m.difficultyMode,
                count: m.count,
                setNumber: nextSetNum,
                existingQuestions
            });

            if (!res || !res.ok || !res.data) {
                showToast("Không tạo được bộ câu hỏi mới: " + (res?.error || "Kiểm tra kết nối AI Backend."), "error");
                return;
            }

            const d = res.data;
            const cleanQs = this.normalizeQuestionsList(d.questions || [], `qs${nextSetNum}`);
            if (!cleanQs.length) {
                showToast(d.insufficientReasonVi || "Nội dung nguồn hiện chưa đủ dữ kiện để tạo thêm câu hỏi chất lượng.", "warning");
                return;
            }

            const newSet = {
                id: `qs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
                lessonId: String(m.lessonId),
                skill: m.skill,
                setNumber: nextSetNum,
                label: `Bộ câu hỏi ${nextSetNum}`,
                title: String(d.title || `Bộ câu hỏi ${nextSetNum} (${m.cefrLevel} • AI)`),
                sourceType: "ai_generated",
                cefrLevel: m.cefrLevel,
                difficultyMode: m.difficultyMode,
                questionCount: cleanQs.length,
                questions: cleanQs,
                insufficientSource: Boolean(d.insufficientSource),
                insufficientReasonVi: String(d.insufficientReasonVi || ""),
                createdAt: new Date().toISOString()
            };

            const st = this.load();
            const lKey = this.getLessonKey(m.skill, m.lessonId);
            if (!Array.isArray(st.questionSetsByLesson[lKey])) st.questionSetsByLesson[lKey] = [];
            st.questionSetsByLesson[lKey].push(newSet);
            this.save();
            if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) CloudClient.syncNow();

            m.open = false;
            this.renderGenerateMoreQuestionsModal();
            if (d.insufficientSource && d.insufficientReasonVi) {
                showToast(`ℹ️ ${d.insufficientReasonVi} (Đã tạo ${cleanQs.length} câu chất lượng cao vào Bộ câu hỏi ${nextSetNum})`, "warning");
            } else {
                showToast(`✨ Đã tạo thành công Bộ câu hỏi ${nextSetNum} (${cleanQs.length} câu mới • ${m.cefrLevel})!`);
            }
            if (typeof m.onCreated === "function") m.onCreated(newSet);
        } finally {
            m.busy = false;
            if (m.open) this.renderGenerateMoreQuestionsModal();
        }
    },

    renderGenericQuestionCard(skill, lessonId, setId, q, qi, total, draftVal = "") {
        const hasOpts = Array.isArray(q.options) && q.options.length > 0;
        const radioName = `lh-q-${skill}-${setId}-${qi}`;
        return `
            <div id="lh-qbox-${skill}-${qi}" class="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2.5 text-xs">
                <div class="flex items-center justify-between gap-2">
                    <span class="px-2 py-0.5 rounded-lg bg-violet-600/25 text-violet-200 font-extrabold text-[10px]">Câu ${qi + 1}/${total} • ${escHtml(q.type || "mcq")}</span>
                    ${q.topicTag ? `<span class="text-[10px] text-cyan-300 font-bold">#${escHtml(q.topicTag)}</span>` : ""}
                </div>
                <p class="text-sm font-bold text-white leading-relaxed">${escHtml(q.question)}</p>
                ${hasOpts ? `
                    <div class="space-y-1.5">
                        ${q.options.map((opt, oi) => {
                            const checked = draftVal === opt ? "checked" : "";
                            return `
                                <label class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/90 border ${checked ? "border-violet-400 bg-violet-500/15" : "border-white/10 hover:border-violet-500/40"} cursor-pointer text-slate-200">
                                    <input type="radio" name="${radioName}" value="${escHtml(opt)}" ${checked} onchange="LearningHub.setDraftAnswer('${skill}','${escHtml(lessonId)}','${escHtml(setId)}','${escHtml(q.id)}', this.value)" class="mt-0.5 accent-violet-500">
                                    <span><strong class="text-cyan-300 mr-1">${String.fromCharCode(65 + oi)}.</strong> ${escHtml(opt)}</span>
                                </label>
                            `;
                        }).join("")}
                    </div>
                ` : `
                    <input type="text" value="${escHtml(draftVal || "")}" oninput="LearningHub.setDraftAnswer('${skill}','${escHtml(lessonId)}','${escHtml(setId)}','${escHtml(q.id)}', this.value)" placeholder="Nhập câu trả lời của bạn..." class="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500">
                `}
                <div id="lh-qfb-${skill}-${qi}" class="hidden pt-2 border-t border-white/10"></div>
            </div>
        `;
    },

    submitStandaloneSet(skill, lessonId, lessonTitle, cefrLevel, setId, customQuestions = null) {
        const sets = this.getQuestionSetsForLesson(skill, lessonId, customQuestions || []);
        const activeSet = sets.find(s => s.id === setId) || sets[0];
        const qs = activeSet?.questions || [];
        if (!qs.length) return;
        const draft = this.getSetDraft(skill, lessonId, activeSet.id);
        const lKey = `${this.getLessonKey(skill, lessonId)}::${activeSet.id}`;
        const durationSec = Math.max(1, Math.round((Date.now() - (this._startedAtBySet[lKey] || Date.now())) / 1000));

        let correct = 0;
        const answers = [];
        qs.forEach((q, qi) => {
            const userAns = String(draft[q.id] || "").trim();
            const accepted = [q.answer, ...(q.acceptableAnswers || [])].map(a => normalizeWords(a)).filter(Boolean);
            const normU = normalizeWords(userAns);
            const isCorrect = Boolean(normU) && (accepted.includes(normU) || (q.type === "short_answer" && normU.length >= 4 && accepted.some(a => a.includes(normU) || normU.includes(a))));
            if (isCorrect) correct++;
            answers.push({
                question: q.question,
                userAnswer: userAns,
                correctAnswer: q.answer,
                isCorrect,
                explanationVi: q.explanationVi || ""
            });
            const box = document.getElementById(`lh-qbox-${skill}-${qi}`);
            const fb = document.getElementById(`lh-qfb-${skill}-${qi}`);
            if (box) {
                box.classList.remove("border-white/10");
                box.classList.add(isCorrect ? "border-emerald-500/50" : "border-rose-500/50");
            }
            if (fb) {
                fb.classList.remove("hidden");
                fb.innerHTML = `
                    <p class="font-bold ${isCorrect ? "text-emerald-300" : "text-rose-300"}">${isCorrect ? "✅ Chính xác!" : `❌ Bạn trả lời: "${escHtml(userAns || "Trống")}" — Đáp án đúng: "${escHtml(q.answer)}"`}</p>
                    ${q.explanationVi ? `<p class="text-slate-300 mt-1">💡 ${escHtml(q.explanationVi)}</p>` : ""}
                `;
            }
        });

        const scorePct = Math.round((correct / qs.length) * 100);
        const score10 = Math.round((correct / qs.length) * 100) / 10;
        const rec = this.recordAttempt({
            skill,
            sourceScope: "standalone",
            lessonId,
            lessonTitle,
            questionSetId: activeSet.id,
            questionSetLabel: activeSet.label,
            exerciseType: activeSet.sourceType === "original" ? skill : "ai_question_set",
            cefrLevel: activeSet.cefrLevel || cefrLevel || "B1",
            score10,
            scorePct,
            correctCount: correct,
            totalCount: qs.length,
            durationSec,
            answers
        });

        const resHost = document.getElementById(`lh-set-result-${skill}-${lessonId}`) || document.getElementById(`lh-set-result-${skill}`);
        if (resHost) {
            resHost.classList.remove("hidden");
            resHost.innerHTML = `
                <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                        <p class="font-black text-white text-sm">🎯 Kết quả ${escHtml(activeSet.label)} (Lần #${rec.attemptNumber}): <span class="text-emerald-300">${score10}/10</span> (${correct}/${qs.length} câu đúng • ${scorePct}%)</p>
                        <p class="text-slate-300 mt-0.5">Đã lưu chi tiết câu đúng/sai vào Learning History!</p>
                    </div>
                    <button type="button" onclick="LearningHub.openHistoryDetailModal('${escHtml(rec.id)}', false)" class="px-3.5 py-2 rounded-xl bg-violet-600 text-white font-extrabold">👁️ Xem phân tích chi tiết</button>
                </div>
            `;
        }
        // Refresh any mounted Question Sets switcher for this lesson so status updates immediately
        if (this._qsetCallbacks) {
            Object.entries(this._qsetCallbacks).forEach(([cid, meta]) => {
                if (meta && meta.skill === skill && String(meta.lessonId) === String(lessonId)) {
                    this.renderQuestionSetsBar(meta.skill, meta.lessonId, meta.originalQuestions, cid, meta.opts);
                }
            });
        }
        showToast(`✅ Đã chấm ${activeSet.label}: ${score10}/10 (${correct}/${qs.length}) & lưu vào Learning History!`);
    },

    ensureModalHost(id) {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement("div");
            el.id = id;
            el.className = "hidden";
            document.body.appendChild(el);
        }
        return el;
    },

    closeModal(id) {
        if (id === "lh-genmore-modal") this._modalState.open = false;
        document.getElementById(id)?.classList.add("hidden");
    },

    refreshSkillWidgets(skill) {
        this.renderAiGenerateExercisePanel(skill);
        this.renderLearningHistoryPanel(skill);
    },

    refreshAllVisibleHistoryWidgets() {
        ["reading", "listening", "writing", "speaking", "vocabulary", "grammar"].forEach(sk => {
            if (document.getElementById(`lh-history-${sk}`)) this.renderLearningHistoryPanel(sk);
            if (document.getElementById(`lh-aigen-${sk}`)) this.renderAiGenerateExercisePanel(sk);
            if (document.getElementById(`lh-history-pdf-skill-${sk}`)) {
                this.renderLearningHistoryPanel(sk, { containerId: `lh-history-pdf-skill-${sk}`, sourceScope: "pdf_studio" });
            }
        });
        if (document.getElementById("lh-history-pdf-studio-all")) {
            this.renderLearningHistoryPanel("all", { containerId: "lh-history-pdf-studio-all", sourceScope: "pdf_studio" });
        }
    }
};
