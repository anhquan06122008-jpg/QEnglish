/* ==========================================================================
   QEnglish — Unit-Based Learning LMS Engine for AI PDF Learning Studio
   Hierarchy: Folder -> Course -> Unit -> Skill -> Lesson -> Exercises -> AI Eval
   Features:
   - Normalized multi-level Units & Lessons with Add/Edit/Reorder/Delete CRUD
   - Split-Screen Reading (Desktop 2 independent scroll panes / Mobile 2 tabs)
   - Split-Screen Writing with auto-save draft & /10 AI evaluation
   - Dedicated Listening (Cloud MP3), Speaking (Voice), Vocabulary & Grammar views
   - In-Lesson "TẠO THÊM BÀI TẬP BẰNG AI" (5/10/15 qs, Easier/Same/Harder, 4 modes)
     stored directly inside parent Lesson (AI Practice 1, 2, 3...)
   - Full Graded Result Dashboard + Persistent Attempt History (never overwrites old attempts)
   ========================================================================== */

const LMS_SKILLS_META = [
    { key: "reading", icon: "📄", label: "Reading", desc: "Đọc hiểu chia đôi màn hình & bộ câu hỏi đa dạng", color: "cyan" },
    { key: "listening", icon: "🎧", label: "Listening", desc: "Audio bản xứ, transcript & câu hỏi nghe hiểu", color: "emerald" },
    { key: "writing", icon: "✍️", label: "Writing", desc: "Luyện viết, dịch, sửa lỗi & AI chấm thang 10", color: "violet" },
    { key: "speaking", icon: "🎙️", label: "Speaking", desc: "Hội thoại, phản xạ, thu giọng nói & AI nhận xét", color: "amber" },
    { key: "vocabulary", icon: "📖", label: "Vocabulary", desc: "Flashcards, ghép từ, trắc nghiệm, điền từ & SRS", color: "indigo" },
    { key: "grammar", icon: "📝", label: "Grammar", desc: "Lý thuyết, công thức & bài tập ngữ pháp chuyên sâu", color: "rose" }
];

let pdfLmsUi = {
    level: "units", // units | unit_skills | skill_lessons | lesson | extra_tool
    extraTool: "mindmap", // mindmap | exam | weakness | knowledge_map
    unitId: null,
    skillKey: null,
    lessonId: null,
    practiceSetId: "original", // "original" | aiPracticeSet.id
    mobileReadingPane: "passage", // passage | questions
    questionViewMode: "all", // all | single
    activeQuestionIdx: 0,
    draftAnswers: {}, // key = `${lessonId}::${practiceSetId}` -> { qId: answer }
    startedAtMap: {}, // key -> timestamp ms
    showingResultAttemptId: null,
    searchQuery: "",
    statusFilter: "all", // all | todo | done
    aiGenCount: 5,
    aiGenDifficulty: "same", // easier | same | harder
    aiGenFocus: "mixed", // same_type | mixed | mistakes | deep
    aiGenBusy: false,
    writingDraftTimers: {}
};

/* ==================== 1. NORMALIZE COURSE INTO MULTI-LEVEL UNITS ==================== */
function ensureCourseUnitsNormalized(course) {
    if (!course || typeof course !== "object") return [];
    if (!Array.isArray(course.attempts)) course.attempts = [];
    if (!course.writingDrafts || typeof course.writingDrafts !== "object") course.writingDrafts = {};
    if (Array.isArray(course.units) && course.units.length > 0) {
        // Ensure every unit has all 6 skill arrays & every lesson has aiPracticeSets
        course.units.forEach((u, uIdx) => {
            u.order = Number.isFinite(Number(u.order)) ? Number(u.order) : uIdx;
            u.skills = u.skills || {};
            LMS_SKILLS_META.forEach(sm => {
                if (!Array.isArray(u.skills[sm.key])) u.skills[sm.key] = [];
                u.skills[sm.key].forEach((ls, lIdx) => {
                    ls.order = Number.isFinite(Number(ls.order)) ? Number(ls.order) : lIdx;
                    ls.skill = sm.key;
                    if (!Array.isArray(ls.aiPracticeSets)) ls.aiPracticeSets = [];
                    if (!ls.contentOrigin) ls.contentOrigin = ls.sourceType === "ai_generated_from_pdf" ? "AI_GENERATED" : "PDF_ORIGINAL";
                });
            });
        });
        return course.units;
    }

    // Build initial normalized units strictly from existing knowledgeMap.chapters + course.skills (ZERO data loss!)
    const chapters = Array.isArray(course.knowledgeMap?.chapters) && course.knowledgeMap.chapters.length
        ? course.knowledgeMap.chapters
        : [{ id: "ch-1", title: course.title || "Nội dung chính", pageStart: course.analyzedRange?.start || 1, pageEnd: course.analyzedRange?.end || 1, topics: [] }];

    const matchUnitIdx = (chapterTitle) => {
        const clean = String(chapterTitle || "").trim().toLowerCase();
        if (!clean) return 0;
        const exact = chapters.findIndex(c => String(c.title || "").trim().toLowerCase() === clean);
        if (exact >= 0) return exact;
        const partial = chapters.findIndex(c => String(c.title || "").toLowerCase().includes(clean) || clean.includes(String(c.title || "").toLowerCase()));
        return partial >= 0 ? partial : 0;
    };

    const units = chapters.map((ch, idx) => ({
        id: ch.id || `unit-${idx + 1}`,
        order: idx,
        title: ch.title || `Unit ${idx + 1}`,
        pageStart: Number(ch.pageStart) || 1,
        pageEnd: Number(ch.pageEnd) || Number(ch.pageStart) || 1,
        objectiveVi: (ch.topics || []).map(t => t.objectiveVi).filter(Boolean).slice(0, 2).join(" • "),
        summaryVi: (ch.topics || []).map(t => t.summaryVi).filter(Boolean).slice(0, 2).join(" "),
        topics: Array.isArray(ch.topics) ? ch.topics : [],
        contentOrigin: "PDF_ORIGINAL",
        skills: { reading: [], listening: [], writing: [], speaking: [], vocabulary: [], grammar: [] }
    }));

    const sk = course.skills || {};

    // Reading lessons
    (sk.reading || []).forEach((r, i) => {
        const u = units[matchUnitIdx(r.chapterTitle)];
        u.skills.reading.push({
            id: r.id || `ls-r-${i + 1}`,
            order: u.skills.reading.length,
            skill: "reading",
            extraSkills: ["vocabulary"],
            title: r.title || `Reading Bài ${u.skills.reading.length + 1}`,
            passage: r.passage || "",
            keyVocab: Array.isArray(r.keyVocab) ? r.keyVocab : [],
            questions: Array.isArray(r.questions) ? r.questions : [],
            level: r.level || course.level || "B1",
            sourcePage: Number(r.sourcePage) || u.pageStart,
            contentOrigin: "PDF_ORIGINAL",
            aiPracticeSets: []
        });
    });

    // Listening lessons
    (sk.listening || []).forEach((l, i) => {
        const u = units[matchUnitIdx(l.chapterTitle)];
        u.skills.listening.push({
            id: l.id || `ls-l-${i + 1}`,
            order: u.skills.listening.length,
            skill: "listening",
            extraSkills: [],
            title: l.title || `Listening Bài ${u.skills.listening.length + 1}`,
            mode: l.mode || (l.audioStoragePath ? "audio_matched" : "transcript_only"),
            suggestedAudioFile: l.suggestedAudioFile || "",
            audioStoragePath: l.audioStoragePath || "",
            transcript: l.transcript || "",
            questions: Array.isArray(l.questions) ? l.questions : [],
            level: l.level || course.level || "B1",
            sourcePage: Number(l.sourcePage) || u.pageStart,
            contentOrigin: "PDF_ORIGINAL",
            aiPracticeSets: []
        });
    });

    // Writing lessons
    (sk.writing || []).forEach((w, i) => {
        const u = units[matchUnitIdx(w.chapterTitle)];
        u.skills.writing.push({
            id: w.id || `ls-w-${i + 1}`,
            order: u.skills.writing.length,
            skill: "writing",
            extraSkills: ["grammar"],
            title: w.title || `Writing Bài ${u.skills.writing.length + 1}`,
            taskType: w.taskType || "paragraph",
            promptVi: w.promptVi || "",
            promptEn: w.promptEn || "",
            sourceTextVi: w.sourceTextVi || "",
            targetStructures: Array.isArray(w.targetStructures) ? w.targetStructures : [],
            keyVocab: Array.isArray(w.keyVocab) ? w.keyVocab : [],
            modelAnswer: w.modelAnswer || "",
            level: w.level || course.level || "B1",
            sourcePage: Number(w.sourcePage) || u.pageStart,
            contentOrigin: w.sourceType === "extracted_from_pdf" ? "PDF_ORIGINAL" : "AI_GENERATED",
            aiPracticeSets: []
        });
    });

    // Speaking lessons
    (sk.speaking || []).forEach((sp, i) => {
        const u = units[matchUnitIdx(sp.chapterTitle)];
        u.skills.speaking.push({
            id: sp.id || `ls-s-${i + 1}`,
            order: u.skills.speaking.length,
            skill: "speaking",
            extraSkills: [],
            title: sp.title || `Speaking Bài ${u.skills.speaking.length + 1}`,
            taskType: sp.taskType || "dialogue",
            scenarioVi: sp.scenarioVi || "",
            dialogueLines: Array.isArray(sp.dialogueLines) ? sp.dialogueLines : [],
            questions: Array.isArray(sp.questions) ? sp.questions : [],
            suggestedVocab: Array.isArray(sp.suggestedVocab) ? sp.suggestedVocab : [],
            usefulExpressions: Array.isArray(sp.usefulExpressions) ? sp.usefulExpressions : [],
            modelResponse: sp.modelResponse || "",
            level: sp.level || course.level || "B1",
            sourcePage: Number(sp.sourcePage) || u.pageStart,
            contentOrigin: sp.sourceType === "extracted_from_pdf" ? "PDF_ORIGINAL" : "AI_GENERATED",
            aiPracticeSets: []
        });
    });

    // Vocabulary lessons (group each Unit's vocabulary cleanly into structured Vocabulary lessons of ~8 words)
    const vocabByUnit = new Map();
    (sk.vocabulary || []).forEach(v => {
        const uIdx = matchUnitIdx(v.chapterTitle);
        if (!vocabByUnit.has(uIdx)) vocabByUnit.set(uIdx, []);
        vocabByUnit.get(uIdx).push(v);
    });
    vocabByUnit.forEach((words, uIdx) => {
        const u = units[uIdx];
        const chunkSz = words.length > 10 ? Math.ceil(words.length / 2) : words.length;
        for (let i = 0; i < words.length; i += chunkSz) {
            const slice = words.slice(i, i + chunkSz);
            const partNo = Math.floor(i / chunkSz) + 1;
            u.skills.vocabulary.push({
                id: `ls-v-${u.id}-${partNo}`,
                order: u.skills.vocabulary.length,
                skill: "vocabulary",
                extraSkills: [],
                title: words.length > chunkSz ? `Từ vựng ${u.title} — Phần ${partNo} (${slice.length} từ)` : `Từ vựng trọng tâm ${u.title} (${slice.length} từ)`,
                words: slice,
                level: slice[0]?.level || course.level || "B1",
                sourcePage: Number(slice[0]?.sourcePage) || u.pageStart,
                contentOrigin: "PDF_ORIGINAL",
                aiPracticeSets: []
            });
        }
    });

    // Grammar lessons
    (sk.grammar || []).forEach((g, i) => {
        const u = units[matchUnitIdx(g.chapterTitle)];
        u.skills.grammar.push({
            id: g.id || `ls-g-${i + 1}`,
            order: u.skills.grammar.length,
            skill: "grammar",
            extraSkills: ["writing"],
            title: g.title || `Grammar Bài ${u.skills.grammar.length + 1}`,
            ruleVi: g.ruleVi || "",
            formula: g.formula || "",
            examples: Array.isArray(g.examples) ? g.examples : [],
            commonMistakesVi: Array.isArray(g.commonMistakesVi) ? g.commonMistakesVi : [],
            questions: Array.isArray(g.exercises) ? g.exercises : [],
            level: g.level || course.level || "B1",
            sourcePage: Number(g.sourcePage) || u.pageStart,
            contentOrigin: "PDF_ORIGINAL",
            aiPracticeSets: []
        });
    });

    course.units = units;
    return course.units;
}

/* ==================== 2. NAVIGATION HELPERS ==================== */
function lmsGetUnit(course, unitId) {
    const units = ensureCourseUnitsNormalized(course);
    return units.find(u => u.id === unitId) || units[0] || null;
}

function lmsGetLesson(unit, skillKey, lessonId) {
    const list = unit?.skills?.[skillKey] || [];
    return list.find(l => l.id === lessonId) || list[0] || null;
}

function lmsGoUnits() {
    pdfLmsUi.level = "units";
    pdfLmsUi.showingResultAttemptId = null;
    renderPdfStudioPage();
}

function lmsOpenUnit(unitId) {
    pdfLmsUi.level = "unit_skills";
    pdfLmsUi.unitId = unitId;
    pdfLmsUi.skillKey = null;
    pdfLmsUi.lessonId = null;
    pdfLmsUi.showingResultAttemptId = null;
    renderPdfStudioPage();
}

function lmsOpenSkill(unitId, skillKey) {
    pdfLmsUi.level = "skill_lessons";
    pdfLmsUi.unitId = unitId;
    pdfLmsUi.skillKey = skillKey;
    pdfLmsUi.lessonId = null;
    pdfLmsUi.showingResultAttemptId = null;
    renderPdfStudioPage();
}

function lmsOpenLesson(unitId, skillKey, lessonId, practiceSetId = "original") {
    pdfLmsUi.level = "lesson";
    pdfLmsUi.unitId = unitId;
    pdfLmsUi.skillKey = skillKey;
    pdfLmsUi.lessonId = lessonId;
    pdfLmsUi.practiceSetId = practiceSetId || "original";
    pdfLmsUi.activeQuestionIdx = 0;
    pdfLmsUi.showingResultAttemptId = null;
    pdfLmsUi.mobileReadingPane = "passage";
    const sessionKey = `${lessonId}::${pdfLmsUi.practiceSetId}`;
    pdfLmsUi.startedAtMap[sessionKey] = Date.now();
    renderPdfStudioPage();
}

function lmsOpenUnitMindMap(unitId) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    if (!u) return;
    pdfStudioUi.filterChapter = u.title;
    lmsOpenExtraTool("mindmap");
}

function lmsOpenUnitExam(unitId) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    if (!u) return;
    startPdfComprehensiveExam(u.title);
    lmsOpenExtraTool("exam");
}

function lmsOpenExtraTool(toolKey) {
    pdfLmsUi.level = "extra_tool";
    pdfLmsUi.extraTool = toolKey;
    if (toolKey === "mindmap") pdfStudioUi.activeTab = "mindmap";
    else if (toolKey === "exam") pdfStudioUi.activeTab = "exam";
    else if (toolKey === "weakness") pdfStudioUi.activeTab = "weakness";
    else pdfStudioUi.activeTab = "overview";
    renderPdfStudioPage();
}

/* ==================== 3. UNIT & LESSON CRUD (ADD, EDIT, REORDER, DELETE, AI CREATE) ==================== */
function lmsAddManualUnit() {
    const course = getActivePdfCourse();
    if (!course) return;
    const title = (prompt("Nhập tên Unit mới (VD: Unit 11: Career Skills):") || "").trim();
    if (!title) return;
    const pageStart = Math.max(1, parseInt(prompt("Trang PDF bắt đầu của Unit này:", "1") || "1", 10) || 1);
    const units = ensureCourseUnitsNormalized(course);
    const newU = {
        id: `unit-${Date.now().toString(36)}`,
        order: units.length,
        title,
        pageStart,
        pageEnd: pageStart,
        objectiveVi: "",
        summaryVi: "Unit do người học tạo mới.",
        topics: [],
        contentOrigin: "PDF_ORIGINAL",
        skills: { reading: [], listening: [], writing: [], speaking: [], vocabulary: [], grammar: [] }
    };
    units.push(newU);
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
    showToast(`✅ Đã thêm "${title}" vào khóa học!`);
}

async function lmsCreateUnitWithAI() {
    const course = getActivePdfCourse();
    if (!course) return;
    const doc = getPdfDocumentById(course.docId);
    const pStart = parseInt(prompt(`Nhập trang PDF bắt đầu để AI tạo Unit mới (1–${doc?.pageCount || 179}):`, String((course.analyzedRange?.end || 15) + 1)) || "", 10);
    if (!pStart || pStart < 1) return;
    const pEnd = Math.min(doc?.pageCount || pStart + 5, Math.max(pStart, parseInt(prompt("Nhập trang PDF kết thúc (tối đa 6 trang/lần):", String(pStart + 3)) || String(pStart), 10) || pStart));
    const unitNameHint = (prompt("Tên gợi ý cho Unit mới (có thể để trống để AI tự đặt theo PDF):") || "").trim();

    showToast(`⏳ AI đang đọc trang ${pStart}–${pEnd} và tạo Unit mới...`);
    let pages = [];
    const pdfDoc = doc ? await getLoadedPdfJsDocument(doc.id).catch(() => null) : null;
    for (let p = pStart; p <= Math.min(pEnd, pStart + 5); p++) {
        if (pdfDoc) {
            const d = await extractPdfPageTextAndOcr(pdfDoc, p, doc?.enableOcr !== false);
            pages.push(d);
        } else {
            const ex = doc?.pageExcerpts?.[String(p)] || "";
            pages.push({ pageNumber: p, text: ex || `Page ${p} of ${course.fileName} (${unitNameHint || "New Unit"})` });
        }
    }

    const res = await AIClient.request("pdf-analyze-chunk", {
        filename: course.fileName,
        chunkIndex: 0,
        totalChunks: 1,
        pages,
        existingChapters: unitNameHint ? [unitNameHint] : [],
        companionAudioNames: doc?.companionAudioNames || []
    });
    if (!res || !res.ok || !res.data) {
        showToast("Không tạo được Unit mới bằng AI: " + (res?.error || "Kiểm tra kết nối AI Backend."), "error");
        return;
    }

    const assembled = validateAndAssemblePdfCourse(doc || { id: course.docId, fileName: course.fileName, pageCount: pEnd }, [res.data], {
        rangeStart: pStart,
        rangeEnd: pEnd,
        provider: res.provider
    });
    const newUnits = ensureCourseUnitsNormalized(assembled);
    const units = ensureCourseUnitsNormalized(course);
    newUnits.forEach(nu => {
        nu.id = `unit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
        if (unitNameHint) nu.title = unitNameHint;
        nu.order = units.length;
        units.push(nu);
    });
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
    showToast(`🎉 AI đã tạo xong ${newUnits.length} Unit mới từ trang ${pStart}–${pEnd} và đồng bộ Cloud!`);
}

function lmsRenameUnit(unitId) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    if (!u) return;
    const next = (prompt("Đổi tên Unit:", u.title) || "").trim();
    if (!next) return;
    u.title = next;
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
    showToast("Đã cập nhật tên Unit!");
}

function lmsMoveUnit(unitId, delta) {
    const course = getActivePdfCourse();
    const units = ensureCourseUnitsNormalized(course);
    const idx = units.findIndex(u => u.id === unitId);
    const to = idx + delta;
    if (idx < 0 || to < 0 || to >= units.length) return;
    const [item] = units.splice(idx, 1);
    units.splice(to, 0, item);
    units.forEach((u, i) => u.order = i);
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
}

function lmsDeleteUnit(unitId) {
    const course = getActivePdfCourse();
    const units = ensureCourseUnitsNormalized(course);
    const u = units.find(x => x.id === unitId);
    if (!u || !confirm(`Xóa "${u.title}" khỏi khóa học này?`)) return;
    course.units = units.filter(x => x.id !== unitId);
    if (pdfLmsUi.unitId === unitId) pdfLmsUi.level = "units";
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
    showToast(`Đã xóa "${u.title}".`);
}

function lmsAddManualLesson(unitId, skillKey) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    if (!u) return;
    const title = (prompt(`Nhập tên bài học ${skillKey.toUpperCase()} mới trong ${u.title}:`) || "").trim();
    if (!title) return;
    const list = u.skills[skillKey] || (u.skills[skillKey] = []);
    const newLs = {
        id: `ls-${skillKey[0]}-${Date.now().toString(36)}`,
        order: list.length,
        skill: skillKey,
        extraSkills: [],
        title,
        level: course.level || "B1",
        sourcePage: u.pageStart || 1,
        contentOrigin: "PDF_ORIGINAL",
        passage: skillKey === "reading" ? (prompt("Dán nội dung đoạn văn Reading (có thể chỉnh sau):") || "") : "",
        promptVi: skillKey === "writing" ? (prompt("Nhập yêu cầu đề bài Writing:") || title) : "",
        scenarioVi: skillKey === "speaking" ? (prompt("Nhập tình huống Speaking:") || title) : "",
        ruleVi: skillKey === "grammar" ? (prompt("Nhập tóm tắt lý thuyết Grammar:") || "") : "",
        words: [],
        questions: [],
        aiPracticeSets: []
    };
    list.push(newLs);
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
    showToast(`✅ Đã thêm bài "${title}"!`);
}

function lmsRenameLesson(unitId, skillKey, lessonId) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    const ls = lmsGetLesson(u, skillKey, lessonId);
    if (!ls) return;
    const next = (prompt("Đổi tên bài học:", ls.title) || "").trim();
    if (!next) return;
    ls.title = next;
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
}

function lmsMoveLesson(unitId, skillKey, lessonId, delta) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    const list = u?.skills?.[skillKey];
    if (!Array.isArray(list)) return;
    const idx = list.findIndex(x => x.id === lessonId);
    const to = idx + delta;
    if (idx < 0 || to < 0 || to >= list.length) return;
    const [it] = list.splice(idx, 1);
    list.splice(to, 0, it);
    list.forEach((x, i) => x.order = i);
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
}

function lmsDeleteLesson(unitId, skillKey, lessonId) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    const ls = lmsGetLesson(u, skillKey, lessonId);
    if (!ls || !confirm(`Xóa bài học "${ls.title}"?`)) return;
    u.skills[skillKey] = (u.skills[skillKey] || []).filter(x => x.id !== lessonId);
    if (pdfLmsUi.lessonId === lessonId) pdfLmsUi.level = "skill_lessons";
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    renderPdfStudioPage();
    showToast("Đã xóa bài học.");
}

/* ==================== 4. PROGRESS & ATTEMPT ANALYTICS HELPERS ==================== */
function lmsGetLessonAttempts(course, lessonId, practiceSetId = null) {
    return (course?.attempts || []).filter(a => a.lessonId === lessonId && (practiceSetId ? a.practiceSetId === practiceSetId : true));
}

function lmsGetLessonBestScore(course, lessonId) {
    const atts = lmsGetLessonAttempts(course, lessonId);
    if (!atts.length) return null;
    return Math.max(...atts.map(a => Number(a.scorePct) || 0));
}

function lmsIsLessonCompleted(course, lesson) {
    const best = lmsGetLessonBestScore(course, lesson.id);
    if (best !== null && best >= 50) return true;
    if ((course?.progress?.completedIds || []).includes(lesson.id)) return true;
    if (lesson.skill === "vocabulary" && Array.isArray(lesson.words) && lesson.words.length) {
        const done = lesson.words.filter(w => (course?.progress?.completedIds || []).includes(w.id)).length;
        return done >= Math.ceil(lesson.words.length * 0.6);
    }
    return false;
}

function lmsComputeUnitStats(course, unit) {
    let totalLessons = 0;
    let completedLessons = 0;
    LMS_SKILLS_META.forEach(sm => {
        const list = unit.skills?.[sm.key] || [];
        totalLessons += list.length;
        completedLessons += list.filter(ls => lmsIsLessonCompleted(course, ls)).length;
    });
    const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { totalLessons, completedLessons, pct };
}

/* ==================== 5. LESSON SUBMISSION, GRADING & ATTEMPT HISTORY ==================== */
function lmsSetDraftAnswer(lessonId, practiceSetId, qId, value) {
    const key = `${lessonId}::${practiceSetId}`;
    if (!pdfLmsUi.draftAnswers[key]) pdfLmsUi.draftAnswers[key] = {};
    pdfLmsUi.draftAnswers[key][qId] = value;
    // Persist draft lightly into course so browser refresh doesn't lose progress!
    const course = getActivePdfCourse();
    if (course) {
        course.progress = course.progress || { completedIds: [], answers: {}, scores: {}, mistakes: [] };
        course.progress.lessonDrafts = course.progress.lessonDrafts || {};
        course.progress.lessonDrafts[key] = pdfLmsUi.draftAnswers[key];
        savePdfStudioState();
    }
    // Lightweight UI counter update without full re-render on typing
    lmsUpdateLiveAnswerCounters(lessonId, practiceSetId);
}

function lmsGetSavedDraft(course, lessonId, practiceSetId) {
    const key = `${lessonId}::${practiceSetId}`;
    if (pdfLmsUi.draftAnswers[key]) return pdfLmsUi.draftAnswers[key];
    const fromStore = course?.progress?.lessonDrafts?.[key];
    if (fromStore && typeof fromStore === "object") {
        pdfLmsUi.draftAnswers[key] = { ...fromStore };
        return pdfLmsUi.draftAnswers[key];
    }
    pdfLmsUi.draftAnswers[key] = {};
    return pdfLmsUi.draftAnswers[key];
}

function lmsGetActiveQuestions(lesson, practiceSetId) {
    if (practiceSetId && practiceSetId !== "original") {
        const ps = (lesson.aiPracticeSets || []).find(p => p.id === practiceSetId);
        return ps ? (ps.questions || []) : [];
    }
    return lesson.questions || [];
}

function lmsUpdateLiveAnswerCounters(lessonId, practiceSetId) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, pdfLmsUi.unitId);
    const ls = lmsGetLesson(u, pdfLmsUi.skillKey, lessonId);
    if (!ls) return;
    const qs = lmsGetActiveQuestions(ls, practiceSetId);
    const draft = lmsGetSavedDraft(course, lessonId, practiceSetId);
    const answered = qs.filter(q => String(draft[q.id] || "").trim() !== "").length;
    const badge = document.getElementById("lms-answered-counter");
    if (badge) badge.textContent = `Đã trả lời: ${answered}/${qs.length} • Chưa làm: ${Math.max(0, qs.length - answered)}`;
    qs.forEach((q, idx) => {
        const pill = document.getElementById(`lms-qpill-${idx}`);
        if (!pill) return;
        const hasAns = String(draft[q.id] || "").trim() !== "";
        pill.classList.toggle("bg-emerald-500/25", hasAns);
        pill.classList.toggle("border-emerald-400/60", hasAns);
        pill.classList.toggle("text-emerald-200", hasAns);
    });
}

function lmsSaveLessonProgressManual() {
    savePdfStudioState();
    if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) CloudClient.syncNow();
    showToast("💾 Đã lưu tiến độ bài làm hiện tại lên Cloud!");
}

function lmsSubmitQuestionLesson(unitId, skillKey, lessonId, practiceSetId) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    const ls = lmsGetLesson(u, skillKey, lessonId);
    if (!course || !u || !ls) return;

    const qs = lmsGetActiveQuestions(ls, practiceSetId);
    if (!qs.length) {
        showToast("Bài học này chưa có câu hỏi nào. Bấm ✨ Tạo thêm bài tập bằng AI để tạo ngay!", "warning");
        return;
    }

    const draft = lmsGetSavedDraft(course, lessonId, practiceSetId);
    const unansweredCount = qs.filter(q => String(draft[q.id] || "").trim() === "").length;
    if (unansweredCount > 0 && !confirm(`Bạn còn ${unansweredCount}/${qs.length} câu chưa trả lời. Bạn vẫn muốn nộp bài ngay chứ?`)) {
        return;
    }

    const key = `${lessonId}::${practiceSetId}`;
    const durationSec = Math.max(1, Math.round((Date.now() - (pdfLmsUi.startedAtMap[key] || Date.now())) / 1000));
    let correctCount = 0;
    const itemResults = [];
    const wrongTopics = new Map();

    qs.forEach(q => {
        const userAnswer = String(draft[q.id] || "").trim();
        const accepted = [q.answer, ...(q.acceptableAnswers || [])].map(normalizeAnswerStr).filter(Boolean);
        const isCorrect = Boolean(userAnswer) && accepted.includes(normalizeAnswerStr(userAnswer));
        if (isCorrect) correctCount++;
        else {
            const tag = q.topicTag || q.type || skillKey;
            wrongTopics.set(tag, (wrongTopics.get(tag) || 0) + 1);
            recordPdfExerciseAttempt(course, { ...q, chapterTitle: u.title }, userAnswer || "(bỏ trống)", false, skillKey);
        }
        itemResults.push({
            qId: q.id,
            question: q.question,
            type: q.type,
            topicTag: q.topicTag || q.type || skillKey,
            userAnswer,
            correctAnswer: q.answer,
            isCorrect,
            explanationVi: q.explanationVi || "Xem lại trang nguồn PDF.",
            evidenceQuote: q.evidenceQuote || "",
            sourcePage: q.sourcePage || ls.sourcePage || u.pageStart || 1,
            sourceType: q.sourceType || "ai_generated_from_pdf"
        });
    });

    const totalCount = qs.length;
    const scorePct = Math.round((correctCount / totalCount) * 100);
    const score10 = Math.round((correctCount / totalCount) * 100) / 10;
    const prevAttempts = lmsGetLessonAttempts(course, lessonId, practiceSetId);

    const attempt = {
        id: `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        courseId: course.id,
        unitId: u.id,
        unitTitle: u.title,
        skill: skillKey,
        lessonId: ls.id,
        lessonTitle: ls.title,
        practiceSetId,
        attemptNo: prevAttempts.length + 1,
        scorePct,
        score10,
        correctCount,
        wrongCount: totalCount - correctCount,
        totalCount,
        durationSec,
        weakTags: Array.from(wrongTopics.entries()).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count })),
        itemResults,
        at: new Date().toISOString()
    };

    course.attempts = course.attempts || [];
    course.attempts.unshift(attempt);
    course.attempts = course.attempts.slice(0, 150);

    if (scorePct >= 50 && !(course.progress?.completedIds || []).includes(ls.id)) {
        course.progress.completedIds.push(ls.id);
    }
    course.progress.scores[ls.id] = Math.max(Number(course.progress.scores[ls.id]) || 0, score10);
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();

    if (typeof logStudyMetrics === "function") {
        logStudyMetrics(
            { scoreEntry: { skill: skillKey, scorePct, level: ls.level || course.level || "B1", title: `${u.title} - ${ls.title}` } },
            { type: "pdf_lesson", skill: skillKey, title: `${u.title} • ${ls.title} (${correctCount}/${totalCount})`, scorePct }
        );
    }
    if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) CloudClient.syncNow();

    pdfLmsUi.showingResultAttemptId = attempt.id;
    renderPdfStudioPage();
    showToast(`🎯 Nộp bài thành công: ${correctCount}/${totalCount} câu đúng (${score10}/10 điểm)!`);
}

function lmsRetryCurrentLesson() {
    const key = `${pdfLmsUi.lessonId}::${pdfLmsUi.practiceSetId}`;
    pdfLmsUi.draftAnswers[key] = {};
    pdfLmsUi.startedAtMap[key] = Date.now();
    pdfLmsUi.showingResultAttemptId = null;
    pdfLmsUi.activeQuestionIdx = 0;
    const course = getActivePdfCourse();
    if (course?.progress?.lessonDrafts) delete course.progress.lessonDrafts[key];
    savePdfStudioState();
    renderPdfStudioPage();
}

/* ==================== 6. GENERATE AI PRACTICE INSIDE PARENT LESSON (ALL 6 SKILLS!) ==================== */
async function lmsGenerateAiPracticeForLesson(unitId, skillKey, lessonId) {
    if (pdfLmsUi.aiGenBusy) {
        showToast("⏳ AI đang tạo bộ bài tập, vui lòng đợi vài giây...", "warning");
        return;
    }
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    const ls = lmsGetLesson(u, skillKey, lessonId);
    if (!course || !u || !ls) return;

    pdfLmsUi.aiGenBusy = true;
    renderPdfStudioPage();

    try {
        const count = Number(pdfLmsUi.aiGenCount) || 5;
        const difficulty = pdfLmsUi.aiGenDifficulty || "same";
        const focusMode = pdfLmsUi.aiGenFocus || "mixed";

        // Gather ALL existing questions on this lesson + its existing AI practice sets to guarantee ZERO duplicates
        const existingQuestions = [
            ...(ls.questions || []).map(q => q.question || q),
            ...(ls.aiPracticeSets || []).flatMap(ps => (ps.questions || []).map(q => q.question)),
            ...(ls.aiPracticeSets || []).flatMap(ps => (ps.writingTasks || []).map(t => t.title)),
            ...(ls.aiPracticeSets || []).flatMap(ps => (ps.speakingTasks || []).map(t => t.title))
        ].slice(0, 40);

        const wrongHistory = lmsGetLessonAttempts(course, ls.id)
            .flatMap(a => (a.itemResults || []).filter(r => !r.isCorrect))
            .slice(0, 12)
            .map(r => ({ question: r.question, topicTag: r.topicTag, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer }));

        const lessonContent = {
            title: ls.title,
            passage: ls.passage || "",
            transcript: ls.transcript || "",
            ruleVi: ls.ruleVi || "",
            formula: ls.formula || "",
            examples: ls.examples || [],
            promptVi: ls.promptVi || "",
            promptEn: ls.promptEn || "",
            scenarioVi: ls.scenarioVi || "",
            words: (ls.words || []).slice(0, 20),
            keyVocab: ls.keyVocab || [],
            targetStructures: ls.targetStructures || [],
            unitSummary: u.summaryVi || ""
        };

        const res = await AIClient.request("pdf-generate-lesson-practice", {
            skill: skillKey,
            unitTitle: u.title,
            lessonTitle: ls.title,
            sourcePage: ls.sourcePage || u.pageStart || 1,
            count,
            difficulty,
            focusMode,
            lessonContent,
            existingQuestions,
            wrongHistory
        });

        if (!res || !res.ok || !res.data) {
            showToast("Không tạo được bài tập AI: " + (res?.error || "Vui lòng kiểm tra kết nối AI Backend."), "error");
            return;
        }

        const d = res.data;
        const nextNum = (ls.aiPracticeSets || []).length + 1;
        const cleanQs = (Array.isArray(d.questions) ? d.questions : []).map((q, idx) => {
            let opts = Array.isArray(q.options) ? q.options.map(o => String(o || "").trim()).filter(Boolean) : [];
            let ans = String(q.answer || "").trim();
            if (String(q.type || "").toLowerCase() === "tfng" && opts.length < 2) opts = ["True", "False", "Not Given"];
            if (opts.length && ans && !opts.some(o => o.toLowerCase() === ans.toLowerCase())) opts[0] = ans;
            return {
                id: `aiq-${Date.now().toString(36)}-${idx}`,
                type: String(q.type || "mcq").toLowerCase(),
                question: String(q.question || "").trim(),
                options: opts,
                answer: ans || (opts[0] || ""),
                acceptableAnswers: Array.isArray(q.acceptableAnswers) ? q.acceptableAnswers : [],
                explanationVi: String(q.explanationVi || "").trim(),
                evidenceQuote: String(q.evidenceQuote || "").trim(),
                topicTag: String(q.topicTag || ls.title).trim(),
                sourcePage: Number(q.sourcePage) || ls.sourcePage || u.pageStart || 1,
                sourceType: "ai_generated_from_pdf",
                contentOrigin: "AI_GENERATED"
            };
        }).filter(q => q.question);

        const practiceSet = {
            id: `aip-${Date.now().toString(36)}`,
            parentLessonId: ls.id,
            unitId: u.id,
            skill: skillKey,
            label: `AI Practice ${nextNum}`,
            title: String(d.title || `AI Practice ${nextNum} — ${ls.title}`).trim(),
            summaryVi: String(d.summaryVi || "").trim(),
            difficulty,
            focusMode,
            contentOrigin: "AI_GENERATED",
            provider: res.provider || "Google Gemini",
            questions: cleanQs,
            writingTasks: Array.isArray(d.writingTasks) ? d.writingTasks.map((t, i) => ({ ...t, id: `aiw-${Date.now().toString(36)}-${i}`, sourcePage: Number(t.sourcePage) || ls.sourcePage || 1, sourceType: "ai_generated_from_pdf" })) : [],
            speakingTasks: Array.isArray(d.speakingTasks) ? d.speakingTasks.map((t, i) => ({ ...t, id: `ais-${Date.now().toString(36)}-${i}`, sourcePage: Number(t.sourcePage) || ls.sourcePage || 1, sourceType: "ai_generated_from_pdf" })) : [],
            vocabCards: Array.isArray(d.vocabCards) ? d.vocabCards : [],
            createdAt: new Date().toISOString()
        };

        // Also update keyVocab on reading lesson if returned and currently empty
        if (skillKey === "reading" && !(ls.keyVocab || []).length && Array.isArray(d.keyVocab) && d.keyVocab.length) {
            ls.keyVocab = d.keyVocab;
        }

        ls.aiPracticeSets = ls.aiPracticeSets || [];
        ls.aiPracticeSets.push(practiceSet);
        course.updatedAt = new Date().toISOString();
        savePdfStudioState();
        if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) CloudClient.syncNow();

        pdfLmsUi.practiceSetId = practiceSet.id;
        pdfLmsUi.showingResultAttemptId = null;
        pdfLmsUi.activeQuestionIdx = 0;
        pdfLmsUi.startedAtMap[`${ls.id}::${practiceSet.id}`] = Date.now();
        showToast(`✨ Đã tạo "${practiceSet.label}" (${cleanQs.length || practiceSet.writingTasks.length || practiceSet.speakingTasks.length} bài mới) lưu ngay trong "${ls.title}"!`);
    } finally {
        pdfLmsUi.aiGenBusy = false;
        renderPdfStudioPage();
    }
}

/* ==================== 7. WRITING / SPEAKING OPEN SUBMISSION WITH AUTO-SAVE DRAFT ==================== */
function lmsOnWritingDraftInput(draftKey, textVal) {
    const course = getActivePdfCourse();
    if (!course) return;
    course.writingDrafts = course.writingDrafts || {};
    course.writingDrafts[draftKey] = textVal;
    const wcEl = document.getElementById("lms-writing-wc");
    if (wcEl) {
        const words = String(textVal || "").trim().split(/\s+/).filter(Boolean).length;
        wcEl.textContent = `${words} từ • Đã tự động lưu nháp`;
    }
    clearTimeout(pdfLmsUi.writingDraftTimers[draftKey]);
    pdfLmsUi.writingDraftTimers[draftKey] = setTimeout(() => {
        savePdfStudioState();
    }, 600);
}

async function lmsSubmitOpenTask(unitId, skillKey, lessonId, taskObjId, mode) {
    const course = getActivePdfCourse();
    const u = lmsGetUnit(course, unitId);
    const ls = lmsGetLesson(u, skillKey, lessonId);
    if (!course || !u || !ls) return;

    // Resolve task (either original lesson or an AI Practice writing/speaking sub-task)
    let taskObj = ls;
    if (pdfLmsUi.practiceSetId !== "original") {
        const ps = (ls.aiPracticeSets || []).find(p => p.id === pdfLmsUi.practiceSetId);
        const list = mode === "speaking" ? (ps?.speakingTasks || []) : (ps?.writingTasks || []);
        taskObj = list.find(t => t.id === taskObjId) || list[0] || ls;
    }

    const inputEl = document.getElementById(`lms-open-textarea-${taskObjId}`);
    const submission = (inputEl?.value || "").trim();
    if (submission.length < 5) {
        showToast("Hãy nhập hoặc thu giọng nói câu trả lời trước khi nộp!", "warning");
        return;
    }
    const hasVoiceData = Boolean(inputEl?.getAttribute("data-used-voice") === "1");

    const outBox = document.getElementById(`lms-open-grade-box-${taskObjId}`);
    if (outBox) {
        outBox.classList.remove("hidden");
        outBox.innerHTML = `<div class="p-4 rounded-2xl bg-slate-950 border border-violet-500/35 text-xs text-violet-300 font-bold animate-pulse">⏳ AI Giáo viên đang chấm điểm thang 10, sửa từng câu và giải thích chi tiết...</div>`;
    }

    const res = await AIClient.request("pdf-grade-open", {
        mode,
        hasVoiceData,
        promptVi: taskObj.promptVi || taskObj.scenarioVi || "",
        promptEn: taskObj.promptEn || (taskObj.questions || []).join(" / ") || "",
        targetStructures: taskObj.targetStructures || taskObj.usefulExpressions || [],
        keyVocab: taskObj.keyVocab || taskObj.suggestedVocab || [],
        modelAnswer: taskObj.modelAnswer || taskObj.modelResponse || "",
        submission
    });

    if (!res || !res.ok || !res.data) {
        if (outBox) {
            outBox.innerHTML = `<div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">🛠️ Chưa kết nối AI Backend (${escHtml(res?.error || "Offline")}). Bản nháp của bạn đã được lưu an toàn!</div>`;
        }
        return;
    }

    const d = res.data;
    const score10 = Number(d.score10) || 0;
    const scorePct = Math.round(score10 * 10);
    const prevAttempts = lmsGetLessonAttempts(course, ls.id, pdfLmsUi.practiceSetId);
    const attempt = {
        id: `att-${Date.now().toString(36)}`,
        courseId: course.id,
        unitId: u.id,
        unitTitle: u.title,
        skill: skillKey,
        lessonId: ls.id,
        lessonTitle: taskObj.title || ls.title,
        practiceSetId: pdfLmsUi.practiceSetId,
        taskObjId,
        attemptNo: prevAttempts.length + 1,
        scorePct,
        score10,
        correctCount: score10 >= 5 ? 1 : 0,
        wrongCount: score10 >= 5 ? 0 : 1,
        totalCount: 1,
        durationSec: 0,
        userSubmission: submission,
        aiReport: d,
        provider: res.provider || "Google Gemini",
        at: new Date().toISOString()
    };

    course.attempts = course.attempts || [];
    course.attempts.unshift(attempt);
    if (score10 >= 5 && !(course.progress?.completedIds || []).includes(ls.id)) {
        course.progress.completedIds.push(ls.id);
    }
    course.progress.scores[ls.id] = Math.max(Number(course.progress.scores[ls.id]) || 0, score10);
    course.updatedAt = new Date().toISOString();
    savePdfStudioState();
    if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) CloudClient.syncNow();
    renderPdfStudioPage();
    showToast(`✅ AI chấm ${score10}/10 điểm! Đã lưu kết quả và lịch sử làm bài lên Cloud.`);
}

async function lmsRecordSpeakingVoice(taskObjId) {
    try {
        showToast("🎙️ Đang thu giọng nói tiếng Anh của bạn...");
        const alts = await recognizeSpeechOnce(10000);
        const best = alts?.[0]?.transcript || "";
        const inp = document.getElementById(`lms-open-textarea-${taskObjId}`);
        if (inp && best) {
            inp.value = inp.value ? `${inp.value.trim()} ${best}` : best;
            inp.setAttribute("data-used-voice", "1");
            showToast(`✅ Đã ghi nhận: "${best}"`);
        }
    } catch (err) {
        showToast(String(err || "Không thu được micro."), "error");
    }
}

/* ==================== 8. UI RENDERERS FOR MULTI-LEVEL UNIT-BASED LMS ==================== */
function renderLmsAiPracticeGeneratorBar(u, ls) {
    const busy = pdfLmsUi.aiGenBusy;
    const sets = ls.aiPracticeSets || [];
    return `
        <div class="p-4 rounded-2xl bg-gradient-to-r from-violet-950/80 via-indigo-950/70 to-slate-950 border border-violet-500/35 space-y-3 text-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p class="font-extrabold text-white text-sm">✨ Tạo Thêm Bài Tập Bằng AI (Lưu ngay trong bài học gốc)</p>
                    <p class="text-[11px] text-slate-300">AI phân tích lại nội dung bài này + lỗi bạn từng sai để sinh bộ câu hỏi mới hoàn toàn, không trùng lặp.</p>
                </div>
                ${sets.length ? `<span class="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-extrabold text-[11px]">Đã có ${sets.length} bộ AI Practice</span>` : ""}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select onchange="pdfLmsUi.aiGenCount=Number(this.value)" class="bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-cyan-300 font-bold">
                    <option value="5" ${pdfLmsUi.aiGenCount === 5 ? "selected" : ""}>5 câu hỏi</option>
                    <option value="10" ${pdfLmsUi.aiGenCount === 10 ? "selected" : ""}>10 câu hỏi</option>
                    <option value="15" ${pdfLmsUi.aiGenCount === 15 ? "selected" : ""}>15 câu hỏi</option>
                </select>
                <select onchange="pdfLmsUi.aiGenDifficulty=this.value" class="bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-violet-300 font-bold">
                    <option value="easier" ${pdfLmsUi.aiGenDifficulty === "easier" ? "selected" : ""}>Độ khó: Dễ hơn</option>
                    <option value="same" ${pdfLmsUi.aiGenDifficulty === "same" ? "selected" : ""}>Độ khó: Tương đương</option>
                    <option value="harder" ${pdfLmsUi.aiGenDifficulty === "harder" ? "selected" : ""}>Độ khó: Khó hơn</option>
                </select>
                <select onchange="pdfLmsUi.aiGenFocus=this.value" class="bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-emerald-300 font-bold">
                    <option value="same_type" ${pdfLmsUi.aiGenFocus === "same_type" ? "selected" : ""}>Giữ nguyên dạng bài</option>
                    <option value="mixed" ${pdfLmsUi.aiGenFocus === "mixed" ? "selected" : ""}>Bài tập hỗn hợp</option>
                    <option value="mistakes" ${pdfLmsUi.aiGenFocus === "mistakes" ? "selected" : ""}>Tập trung vào lỗi sai</option>
                    <option value="deep" ${pdfLmsUi.aiGenFocus === "deep" ? "selected" : ""}>Luyện chuyên sâu</option>
                </select>
                <button type="button" ${busy ? "disabled" : ""} onclick="lmsGenerateAiPracticeForLesson('${u.id}','${ls.skill}','${ls.id}')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-95 text-white font-extrabold shadow-lg ${busy ? "opacity-60 animate-pulse" : ""}">
                    ${busy ? "⏳ AI đang tạo..." : "⚡ Tạo thêm bài tập AI"}
                </button>
            </div>
        </div>
    `;
}

function renderLmsPracticeSetSwitcher(u, ls) {
    const sets = ls.aiPracticeSets || [];
    if (!sets.length) return "";
    return `
        <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <span class="text-slate-400 font-bold mr-1">Bộ bài tập:</span>
            <button onclick="lmsOpenLesson('${u.id}','${ls.skill}','${ls.id}','original')" class="px-3 py-1.5 rounded-xl font-extrabold border transition ${pdfLmsUi.practiceSetId === "original" ? "bg-emerald-600 text-white border-emerald-400" : "bg-slate-950 text-slate-300 border-white/10 hover:text-white"}">📄 Bài gốc</button>
            ${sets.map(ps => `
                <button onclick="lmsOpenLesson('${u.id}','${ls.skill}','${ls.id}','${ps.id}')" class="px-3 py-1.5 rounded-xl font-extrabold border transition ${pdfLmsUi.practiceSetId === ps.id ? "bg-violet-600 text-white border-violet-400" : "bg-slate-950 text-violet-300 border-violet-500/30 hover:bg-violet-500/15"}">🤖 ${escHtml(ps.label)}</button>
            `).join("")}
        </div>
    `;
}

function renderLmsResultDashboard(course, u, ls, attempt) {
    const allAttempts = lmsGetLessonAttempts(course, ls.id, attempt.practiceSetId);
    const mins = Math.floor((attempt.durationSec || 0) / 60);
    const secs = (attempt.durationSec || 0) % 60;
    const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    return `
        <div class="space-y-5">
            <!-- Score Summary Header -->
            <div class="p-5 rounded-3xl bg-gradient-to-r from-violet-950/90 via-slate-900 to-emerald-950/60 border border-emerald-500/40 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <span class="text-[11px] font-extrabold text-cyan-300 uppercase">Kết quả lần làm thứ #${attempt.attemptNo} • ${new Date(attempt.at).toLocaleString("vi-VN")}</span>
                        <h3 class="text-xl font-black text-white mt-0.5">${escHtml(ls.title)}</h3>
                    </div>
                    <div class="flex flex-wrap gap-2 text-xs">
                        <button onclick="lmsRetryCurrentLesson()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold">🔄 Làm lại bài</button>
                        <button onclick="lmsOpenSkill('${u.id}','${ls.skill}')" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold">← Danh sách bài</button>
                    </div>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
                    <div class="p-3 rounded-2xl bg-slate-950/80 border border-white/10"><p class="text-slate-400">Điểm số</p><p class="text-2xl font-black text-emerald-300">${attempt.score10}/10</p></div>
                    <div class="p-3 rounded-2xl bg-slate-950/80 border border-white/10"><p class="text-slate-400">Câu đúng</p><p class="text-2xl font-black text-emerald-400">${attempt.correctCount}</p></div>
                    <div class="p-3 rounded-2xl bg-slate-950/80 border border-white/10"><p class="text-slate-400">Câu sai</p><p class="text-2xl font-black text-rose-400">${attempt.wrongCount}</p></div>
                    <div class="p-3 rounded-2xl bg-slate-950/80 border border-white/10"><p class="text-slate-400">Hoàn thành</p><p class="text-2xl font-black text-cyan-300">${attempt.scorePct}%</p></div>
                    <div class="p-3 rounded-2xl bg-slate-950/80 border border-white/10"><p class="text-slate-400">Thời gian</p><p class="text-2xl font-black text-violet-300">${timeStr}</p></div>
                </div>
                ${(attempt.weakTags || []).length ? `
                    <div class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 space-y-1">
                        <p class="font-extrabold">🧠 Kiến thức cần ôn lại:</p>
                        <p>${attempt.weakTags.map(w => `<strong>${escHtml(w.tag)}</strong> (${w.count} câu sai)`).join(" • ")}</p>
                        <p class="text-cyan-300">💡 Gợi ý tiếp theo: Chọn chế độ <strong>"Tập trung vào lỗi sai"</strong> ở khung Tạo thêm bài tập AI bên dưới để luyện đúng điểm yếu!</p>
                    </div>
                ` : `<div class="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-xs text-emerald-200 font-bold">🌟 Tuyệt vời! Bạn làm đúng 100% — hãy thử nâng độ khó lên "Khó hơn" bằng AI để bứt phá!</div>`}
            </div>

            <!-- AI Practice Generator right on Result Screen -->
            ${renderLmsAiPracticeGeneratorBar(u, ls)}

            <!-- Question-by-Question Detailed Analysis -->
            <div class="space-y-3">
                <h4 class="text-sm font-extrabold text-white">📋 Phân tích chi tiết từng câu hỏi & dẫn chứng PDF</h4>
                ${(attempt.itemResults || []).map((r, idx) => `
                    <div class="p-4 rounded-2xl bg-slate-950/90 border ${r.isCorrect ? "border-emerald-500/35" : "border-rose-500/40"} space-y-2 text-xs">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <span class="font-extrabold ${r.isCorrect ? "text-emerald-300" : "text-rose-300"}">
                                ${r.isCorrect ? "✅" : "❌"} Câu ${idx + 1} (${escHtml(r.topicTag || r.type)})
                            </span>
                            <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${r.sourcePage || 1})" class="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold text-[10px]">📖 Xem nguồn PDF (Trang ${r.sourcePage || 1})</button>
                        </div>
                        <p class="text-sm font-bold text-white">${escHtml(r.question)}</p>
                        <div class="flex flex-wrap gap-3">
                            <span>Bạn chọn: <strong class="${r.isCorrect ? "text-emerald-300" : "text-rose-300 line-through"}">${escHtml(r.userAnswer || "(Bỏ trống)")}</strong></span>
                            <span>Đáp án chuẩn: <strong class="text-emerald-300">${escHtml(r.correctAnswer)}</strong></span>
                        </div>
                        <p class="text-slate-200 leading-relaxed"><strong>Giải thích:</strong> ${escHtml(r.explanationVi)}</p>
                        ${r.evidenceQuote ? `<p class="text-[11px] text-cyan-300 italic bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">📌 Trích dẫn trong bài: "${escHtml(r.evidenceQuote)}"</p>` : ""}
                    </div>
                `).join("")}
            </div>

            <!-- Attempt History Comparison -->
            ${allAttempts.length > 1 ? `
                <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 text-xs">
                    <p class="font-extrabold text-slate-200">📈 Lịch sử & So sánh các lần làm bài (${allAttempts.length} lần — không xóa kết quả cũ)</p>
                    <div class="space-y-1.5">
                        ${allAttempts.map(a => `
                            <div class="flex items-center justify-between p-2.5 rounded-xl ${a.id === attempt.id ? "bg-violet-500/20 border border-violet-500/40" : "bg-slate-900 border border-white/5"}">
                                <span><strong>Lần #${a.attemptNo}</strong> • ${new Date(a.at).toLocaleString("vi-VN")} • ${a.correctCount}/${a.totalCount} đúng</span>
                                <div class="flex items-center gap-2">
                                    <span class="font-black text-emerald-300">${a.score10}/10 (${a.scorePct}%)</span>
                                    ${a.id !== attempt.id ? `<button onclick="pdfLmsUi.showingResultAttemptId='${a.id}'; renderPdfStudioPage();" class="text-cyan-300 font-bold hover:underline">Xem lại</button>` : `<span class="text-[10px] text-violet-300 font-bold">Đang xem</span>`}
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            ` : ""}
        </div>
    `;
}

function renderLmsQuestionCardHtml(q, idx, total, lessonId, practiceSetId, draftVal, docId) {
    const typeLabels = {
        main_idea: "Main Idea (Ý chính)",
        detail: "Detail (Chi tiết)",
        vocab_in_context: "Vocab in Context",
        reference: "Reference (Quy chiếu)",
        tfng: "True / False / Not Given",
        inference: "Inference (Suy luận)",
        author_purpose: "Author's Purpose",
        sentence_completion: "Sentence Completion",
        mcq: "Multiple Choice",
        fill_blank: "Fill in the Blank",
        error_correction: "Error Correction",
        rewrite: "Sentence Transformation"
    };
    const hasOpts = Array.isArray(q.options) && q.options.length > 0;
    const isOrig = q.sourceType === "extracted_from_pdf";
    return `
        <div id="lms-qcard-${idx}" class="p-4 rounded-2xl bg-slate-950/95 border border-white/10 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold">
                <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2 py-0.5 rounded-lg bg-violet-600/30 text-violet-200 font-extrabold">Question ${idx + 1} / ${total}</span>
                    <span class="px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-300">${escHtml(typeLabels[q.type] || q.type || "Question")}</span>
                    <span class="px-2 py-0.5 rounded-full border ${isOrig ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-violet-500/15 text-violet-300 border-violet-500/30"}">${isOrig ? "📄 Câu gốc PDF" : "🤖 AI bổ sung"}</span>
                </div>
                <button type="button" onclick="openPdfSourcePage('${escHtml(docId)}', ${q.sourcePage || 1})" class="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">📖 Tr.${q.sourcePage || 1}</button>
            </div>

            <p class="text-xs md:text-sm font-bold text-white leading-relaxed">${escHtml(q.question)}</p>

            ${hasOpts ? `
                <div class="space-y-1.5">
                    ${q.options.map((opt, oi) => {
                        const checked = draftVal === opt ? "checked" : "";
                        return `
                            <label class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border ${checked ? "border-violet-400 bg-violet-500/15" : "border-white/10 hover:border-violet-500/40"} cursor-pointer text-xs text-slate-200 transition">
                                <input type="radio" name="lms-q-${q.id}" value="${escHtml(opt)}" ${checked} onchange="lmsSetDraftAnswer('${lessonId}','${practiceSetId}','${q.id}', this.value)" class="mt-0.5 accent-violet-500 shrink-0">
                                <span><strong class="text-cyan-300 mr-1">${String.fromCharCode(65 + oi)}.</strong> ${escHtml(opt)}</span>
                            </label>
                        `;
                    }).join("")}
                </div>
            ` : `
                <input type="text" value="${escHtml(draftVal || "")}" oninput="lmsSetDraftAnswer('${lessonId}','${practiceSetId}','${q.id}', this.value)" placeholder="Nhập câu trả lời của bạn..." class="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500">
            `}
        </div>
    `;
}

function renderLmsReadingSplitWorkspace(course, u, ls) {
    const qs = lmsGetActiveQuestions(ls, pdfLmsUi.practiceSetId);
    const draft = lmsGetSavedDraft(course, ls.id, pdfLmsUi.practiceSetId);
    const answered = qs.filter(q => String(draft[q.id] || "").trim() !== "").length;
    const singleMode = pdfLmsUi.questionViewMode === "single";
    const curIdx = Math.max(0, Math.min(Math.max(0, qs.length - 1), pdfLmsUi.activeQuestionIdx));

    return `
        <div class="space-y-4">
            ${renderLmsPracticeSetSwitcher(u, ls)}

            <!-- Mobile 2-Tab Switcher (< 1024px) -->
            <div class="lg:hidden grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-white/10 text-xs font-extrabold">
                <button onclick="pdfLmsUi.mobileReadingPane='passage'; renderPdfStudioPage();" class="py-2.5 rounded-xl transition ${pdfLmsUi.mobileReadingPane === "passage" ? "bg-cyan-600 text-white" : "text-slate-400"}">📖 Nội dung bài đọc</button>
                <button onclick="pdfLmsUi.mobileReadingPane='questions'; renderPdfStudioPage();" class="py-2.5 rounded-xl transition ${pdfLmsUi.mobileReadingPane === "questions" ? "bg-violet-600 text-white" : "text-slate-400"}">❓ Câu hỏi (${answered}/${qs.length})</button>
            </div>

            <!-- SPLIT-SCREEN READING LAYOUT (Desktop 2 independent scroll columns) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <!-- LEFT PANE: FULL READING PASSAGE + KEY VOCAB -->
                <div class="${pdfLmsUi.mobileReadingPane === "passage" ? "block" : "hidden lg:block"} lg:col-span-6 p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/25 lg:max-h-[74vh] lg:overflow-y-auto space-y-4">
                    <div class="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-white/10">
                        <div>
                            <span class="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">PASSAGE • ${escHtml(u.title)} • ${escHtml(ls.level || course.level)}</span>
                            <h3 class="text-base md:text-lg font-black text-white mt-0.5">${escHtml(ls.title)}</h3>
                        </div>
                        <div class="flex flex-wrap gap-1.5 text-[11px]">
                            <button data-speak="${escHtml((ls.passage || "").slice(0, 1200))}" onclick="handlePdfSpeakBtn(this)" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold">🔊 Nghe đọc</button>
                            <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${ls.sourcePage || 1})" class="px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">📖 Xem nguồn PDF (Tr.${ls.sourcePage || 1})</button>
                        </div>
                    </div>

                    <div class="text-xs md:text-sm text-slate-100 leading-7 whitespace-pre-wrap font-normal">${escHtml(ls.passage || "Chưa có nội dung đoạn văn.")}</div>

                    ${(ls.keyVocab || []).length ? `
                        <div class="pt-3 border-t border-white/10 space-y-2">
                            <p class="text-[11px] font-extrabold text-amber-300">🔑 Từ vựng quan trọng trong bài đọc:</p>
                            <div class="flex flex-wrap gap-2">
                                ${ls.keyVocab.map(kv => `
                                    <div class="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-[11px]">
                                        <strong class="text-cyan-300">${escHtml(kv.term || "")}</strong>
                                        ${kv.ipa ? `<span class="text-slate-400 font-mono text-[10px]">${escHtml(kv.ipa)}</span>` : ""}
                                        <span class="text-slate-300">— ${escHtml(kv.meaningVi || "")}</span>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    ` : ""}
                </div>

                <!-- RIGHT PANE: INTERACTIVE QUESTION SET + NAVIGATOR + SUBMIT -->
                <div class="${pdfLmsUi.mobileReadingPane === "questions" ? "block" : "hidden lg:block"} lg:col-span-6 p-5 rounded-3xl bg-slate-900/90 border border-violet-500/25 lg:max-h-[74vh] lg:overflow-y-auto space-y-4">
                    <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                        <div>
                            <span class="text-[10px] font-extrabold text-violet-400 uppercase tracking-wider">QUESTIONS (${qs.length} câu hỏi)</span>
                            <p id="lms-answered-counter" class="text-xs font-extrabold text-emerald-300 mt-0.5">Đã trả lời: ${answered}/${qs.length} • Chưa làm: ${Math.max(0, qs.length - answered)}</p>
                        </div>
                        <button onclick="pdfLmsUi.questionViewMode = pdfLmsUi.questionViewMode === 'all' ? 'single' : 'all'; renderPdfStudioPage();" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 font-bold">
                            ${singleMode ? "📑 Xem tất cả câu" : "🎯 Xem từng câu"}
                        </button>
                    </div>

                    <!-- Question Navigator Pills -->
                    ${qs.length ? `
                        <div class="flex flex-wrap items-center gap-1.5">
                            ${qs.map((q, idx) => {
                                const hasAns = String(draft[q.id] || "").trim() !== "";
                                const isCur = singleMode && idx === curIdx;
                                return `<button id="lms-qpill-${idx}" type="button" onclick="pdfLmsUi.activeQuestionIdx=${idx}; ${singleMode ? "renderPdfStudioPage();" : `document.getElementById('lms-qcard-${idx}')?.scrollIntoView({behavior:'smooth',block:'nearest'});`}" class="w-8 h-8 rounded-xl border text-xs font-extrabold transition ${isCur ? "ring-2 ring-cyan-400 " : ""}${hasAns ? "bg-emerald-500/25 border-emerald-400/60 text-emerald-200" : "bg-slate-950 border-white/15 text-slate-300 hover:border-violet-400"}">${idx + 1}</button>`;
                            }).join("")}
                        </div>
                    ` : `<div class="p-5 rounded-2xl bg-slate-950 text-center text-xs text-slate-400">Chưa có câu hỏi. Hãy bấm "⚡ Tạo thêm bài tập AI" ở bên dưới!</div>`}

                    <!-- Questions List or Single Question -->
                    <div class="space-y-3">
                        ${singleMode && qs.length
                            ? renderLmsQuestionCardHtml(qs[curIdx], curIdx, qs.length, ls.id, pdfLmsUi.practiceSetId, draft[qs[curIdx].id], course.docId)
                            : qs.map((q, idx) => renderLmsQuestionCardHtml(q, idx, qs.length, ls.id, pdfLmsUi.practiceSetId, draft[q.id], course.docId)).join("")
                        }
                    </div>

                    ${singleMode && qs.length > 1 ? `
                        <div class="flex items-center justify-between gap-2 text-xs">
                            <button onclick="pdfLmsUi.activeQuestionIdx=Math.max(0,${curIdx - 1}); renderPdfStudioPage();" ${curIdx === 0 ? "disabled" : ""} class="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold disabled:opacity-40">◀ Câu trước</button>
                            <button onclick="pdfLmsUi.activeQuestionIdx=Math.min(${qs.length - 1},${curIdx + 1}); renderPdfStudioPage();" ${curIdx === qs.length - 1 ? "disabled" : ""} class="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold disabled:opacity-40">Câu tiếp theo ▶</button>
                        </div>
                    ` : ""}

                    <!-- Sticky Action Footer -->
                    <div class="sticky bottom-0 pt-3 pb-1 bg-slate-900/95 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                        <button type="button" onclick="lmsSaveLessonProgressManual()" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-cyan-300 text-xs font-extrabold">💾 Lưu tiến độ</button>
                        <button type="button" onclick="lmsSubmitQuestionLesson('${u.id}','reading','${ls.id}','${pdfLmsUi.practiceSetId}')" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs md:text-sm font-extrabold shadow-lg">✅ Nộp bài & Chấm điểm</button>
                    </div>
                </div>
            </div>

            <!-- AI Practice Generator -->
            ${renderLmsAiPracticeGeneratorBar(u, ls)}
        </div>
    `;
}

function renderLmsQuestionBasedWorkspace(course, u, ls, skillKey) {
    // Shared rich layout for Listening (with Cloud MP3 player) & Grammar (with theory/formula)
    const qs = lmsGetActiveQuestions(ls, pdfLmsUi.practiceSetId);
    const draft = lmsGetSavedDraft(course, ls.id, pdfLmsUi.practiceSetId);
    const answered = qs.filter(q => String(draft[q.id] || "").trim() !== "").length;

    let topMaterialHtml = "";
    if (skillKey === "listening") {
        const audioKey = (ls.suggestedAudioFile || "").toLowerCase();
        const blobUrl = audioKey ? pdfCompanionAudioUrls.get(audioKey) : null;
        const cloudPath = String(ls.audioStoragePath || "").trim();
        const hasRealAudio = Boolean(blobUrl || cloudPath);
        const audioElId = `pdf-audio-${ls.id}`;
        topMaterialHtml = `
            <div class="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-3.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-base md:text-lg font-black text-white">🎧 ${escHtml(ls.title)}</h3>
                    <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${ls.sourcePage || 1})" class="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold">📖 Xem nguồn PDF (Tr.${ls.sourcePage || 1})</button>
                </div>
                ${hasRealAudio ? `
                    <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 space-y-2.5">
                        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span class="font-extrabold text-emerald-300">🎧 Audio bản xứ gốc: <code class="text-white">${escHtml(ls.suggestedAudioFile || "Audio MP3")}</code></span>
                            <span class="pdf-audio-status text-[11px] font-bold text-cyan-300">${blobUrl ? "✅ Sẵn sàng phát giọng bản xứ" : "⏳ Đang nạp audio từ Cloud..."}</span>
                        </div>
                        <audio id="${audioElId}" controls preload="metadata" ${blobUrl ? `src="${blobUrl}"` : `data-audio-storage-path="${escHtml(cloudPath)}"`} class="w-full h-10"></audio>
                        <div class="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <button type="button" onclick="rewindPdfAudio('${audioElId}', -5)" class="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-slate-200 font-bold">⏪ -5 giây</button>
                            <button type="button" onclick="setPdfAudioRate('${audioElId}', 0.75)" class="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-cyan-300 font-bold">0.75x</button>
                            <button type="button" onclick="setPdfAudioRate('${audioElId}', 1.0)" class="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-emerald-300 font-bold">1.0x</button>
                            <button type="button" onclick="setPdfAudioRate('${audioElId}', 1.25)" class="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-violet-300 font-bold">1.25x</button>
                        </div>
                    </div>
                ` : `
                    <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                            <p class="font-extrabold text-amber-300">📝 Bài tập dựa trên Transcript trong PDF (chưa có file MP3 gốc)</p>
                            <p class="text-slate-300">Hỗ trợ nghe đọc tách giọng bằng TTS trình duyệt.</p>
                        </div>
                        <button data-speak="${escHtml((ls.transcript || "").slice(0, 1400))}" onclick="speakPdfDialogueMultiVoice(this)" class="px-3.5 py-2 rounded-xl bg-cyan-600 text-white font-extrabold">🔊 Nghe tách giọng TTS</button>
                    </div>
                `}
                ${ls.transcript ? `
                    <details class="p-3.5 rounded-2xl bg-slate-950/85 border border-white/10 text-xs">
                        <summary class="cursor-pointer font-bold text-slate-300">📜 Xem / Ẩn Transcript gốc từ PDF</summary>
                        <p class="mt-2.5 text-slate-200 whitespace-pre-wrap leading-relaxed">${escHtml(ls.transcript)}</p>
                    </details>
                ` : ""}
            </div>
        `;
    } else {
        // Grammar theory box
        topMaterialHtml = `
            <div class="p-5 rounded-3xl bg-slate-900/90 border border-violet-500/30 space-y-3 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-base md:text-lg font-black text-white">📝 ${escHtml(ls.title)}</h3>
                    <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${ls.sourcePage || 1})" class="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">📖 Xem nguồn PDF (Tr.${ls.sourcePage || 1})</button>
                </div>
                ${ls.formula ? `<div class="p-3 rounded-xl bg-violet-500/15 border border-violet-500/35 font-mono text-violet-200 font-bold">📐 Công thức: ${escHtml(ls.formula)}</div>` : ""}
                ${ls.ruleVi ? `<p class="text-sm text-slate-200 leading-relaxed">${escHtml(ls.ruleVi)}</p>` : ""}
                ${(ls.examples || []).length ? `<div class="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1"><p class="font-bold text-cyan-300">Ví dụ minh họa:</p>${ls.examples.map(e => `<p class="text-slate-200">• ${escHtml(e)}</p>`).join("")}</div>` : ""}
                ${(ls.commonMistakesVi || []).length ? `<div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200">⚠️ <strong>Lỗi thường gặp:</strong> ${escHtml(ls.commonMistakesVi.join(" • "))}</div>` : ""}
            </div>
        `;
    }

    return `
        <div class="space-y-4">
            ${renderLmsPracticeSetSwitcher(u, ls)}
            ${topMaterialHtml}
            <div class="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h4 class="text-sm font-extrabold text-white">🎯 Bộ câu hỏi luyện tập (${qs.length} câu)</h4>
                    <span id="lms-answered-counter" class="text-xs font-extrabold text-emerald-300">Đã trả lời: ${answered}/${qs.length} • Chưa làm: ${Math.max(0, qs.length - answered)}</span>
                </div>
                <div class="space-y-3">
                    ${qs.map((q, idx) => renderLmsQuestionCardHtml(q, idx, qs.length, ls.id, pdfLmsUi.practiceSetId, draft[q.id], course.docId)).join("")}
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button type="button" onclick="lmsSaveLessonProgressManual()" class="px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-cyan-300 text-xs font-extrabold">💾 Lưu tiến độ</button>
                    <button type="button" onclick="lmsSubmitQuestionLesson('${u.id}','${skillKey}','${ls.id}','${pdfLmsUi.practiceSetId}')" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs md:text-sm font-extrabold shadow-lg">✅ Nộp bài & Chấm điểm</button>
                </div>
            </div>
            ${renderLmsAiPracticeGeneratorBar(u, ls)}
        </div>
    `;
}

function renderLmsOpenSkillSplitWorkspace(course, u, ls, mode) {
    // Split-Screen Writing / Speaking workspace with auto-save draft + /10 AI evaluation + Attempt History
    const isSpeaking = mode === "speaking";
    let tasks = [ls];
    if (pdfLmsUi.practiceSetId !== "original") {
        const ps = (ls.aiPracticeSets || []).find(p => p.id === pdfLmsUi.practiceSetId);
        const sub = isSpeaking ? (ps?.speakingTasks || []) : (ps?.writingTasks || []);
        if (sub.length) tasks = sub;
    }
    const pastAttempts = lmsGetLessonAttempts(course, ls.id, pdfLmsUi.practiceSetId);

    return `
        <div class="space-y-4">
            ${renderLmsPracticeSetSwitcher(u, ls)}
            ${tasks.map((t, ti) => {
                const draftKey = `${ls.id}::${pdfLmsUi.practiceSetId}::${t.id}`;
                const savedDraft = (course.writingDrafts && course.writingDrafts[draftKey]) || "";
                const latestAtt = pastAttempts.find(a => a.taskObjId === t.id) || (ti === 0 ? pastAttempts[0] : null);
                const wc = String(savedDraft).trim().split(/\s+/).filter(Boolean).length;
                return `
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        <!-- LEFT: PROMPT, STRUCTURES & KEY VOCAB -->
                        <div class="lg:col-span-5 p-5 rounded-3xl bg-slate-900/90 border border-violet-500/25 space-y-3 text-xs">
                            <div class="flex items-start justify-between gap-2">
                                <div>
                                    <span class="text-[10px] font-extrabold text-cyan-300 uppercase">${isSpeaking ? "SPEAKING" : "WRITING"} • ${escHtml(t.taskType || "task")}</span>
                                    <h3 class="text-base font-black text-white mt-0.5">${escHtml(t.title || ls.title)}</h3>
                                </div>
                                <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${t.sourcePage || ls.sourcePage || 1})" class="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold text-[10px] shrink-0">📖 Tr.${t.sourcePage || ls.sourcePage || 1}</button>
                            </div>
                            ${t.promptVi || t.scenarioVi ? `<p class="text-sm text-slate-100 leading-relaxed">${escHtml(t.promptVi || t.scenarioVi)}</p>` : ""}
                            ${t.promptEn ? `<div class="p-3 rounded-xl bg-slate-950 border border-white/10 text-cyan-200 italic">${escHtml(t.promptEn)}</div>` : ""}
                            ${t.sourceTextVi ? `<div class="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-100"><strong>Đoạn tiếng Việt cần dịch:</strong> ${escHtml(t.sourceTextVi)}</div>` : ""}
                            ${(t.dialogueLines || []).length ? `
                                <div class="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                                    <p class="font-bold text-cyan-300">💬 Hội thoại mẫu:</p>
                                    ${t.dialogueLines.map(dl => `<p class="text-slate-200"><strong class="text-violet-300">${escHtml(dl.speaker)}:</strong> ${escHtml(dl.text)} <button data-speak="${escHtml(dl.text)}" onclick="handlePdfSpeakBtn(this)" class="text-cyan-400 ml-1">🔊</button></p>`).join("")}
                                </div>
                            ` : ""}
                            ${(t.questions || []).length ? `
                                <div class="space-y-1">
                                    <p class="font-bold text-emerald-300">🎤 Câu hỏi gợi ý:</p>
                                    ${t.questions.map((q, qi) => `<p class="text-white">${qi + 1}. ${escHtml(q)} <button data-speak="${escHtml(q)}" onclick="handlePdfSpeakBtn(this)" class="text-cyan-400 ml-1">🔊</button></p>`).join("")}
                                </div>
                            ` : ""}
                            ${(t.targetStructures || t.usefulExpressions || []).length ? `<div class="flex flex-wrap gap-1.5">${(t.targetStructures || t.usefulExpressions).map(s => `<span class="px-2 py-0.5 rounded-lg bg-violet-500/15 text-violet-300 font-bold">📐 ${escHtml(s)}</span>`).join("")}</div>` : ""}
                            ${(t.keyVocab || t.suggestedVocab || []).length ? `<div class="flex flex-wrap gap-1.5">${(t.keyVocab || t.suggestedVocab).map(v => `<span class="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 font-bold">📖 ${escHtml(v)}</span>`).join("")}</div>` : ""}
                        </div>

                        <!-- RIGHT: EDITOR + AUTO-SAVE + AI GRADING -->
                        <div class="lg:col-span-7 p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-extrabold text-white">${isSpeaking ? "🎙️ Câu trả lời luyện nói của bạn" : "✍️ Khu vực làm bài viết (Tự động lưu nháp)"}</span>
                                <span id="lms-writing-wc" class="text-[11px] font-bold text-emerald-300">${wc} từ • Tự động lưu nháp</span>
                            </div>
                            <textarea id="lms-open-textarea-${t.id}" rows="7" oninput="lmsOnWritingDraftInput('${draftKey}', this.value)" placeholder="${isSpeaking ? "Bấm 🎙️ Thu giọng nói hoặc nhập câu trả lời của bạn..." : "Viết câu trả lời tiếng Anh của bạn tại đây..."}" class="w-full bg-slate-950 border border-white/15 rounded-2xl p-4 text-xs md:text-sm text-white leading-relaxed focus:outline-none focus:border-violet-500">${escHtml(savedDraft || latestAtt?.userSubmission || "")}</textarea>
                            <div class="flex flex-wrap items-center gap-2">
                                ${isSpeaking ? `<button type="button" onclick="lmsRecordSpeakingVoice('${t.id}')" class="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/35 text-cyan-200 text-xs font-extrabold">🎙️ Thu giọng nói (Voice)</button>` : ""}
                                <button type="button" onclick="lmsSubmitOpenTask('${u.id}','${mode}','${ls.id}','${t.id}','${mode}')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-extrabold shadow-lg">🤖 Nộp bài & AI Chấm Thang 10</button>
                            </div>
                            <div id="lms-open-grade-box-${t.id}" class="${latestAtt?.aiReport ? "" : "hidden"}">
                                ${latestAtt?.aiReport ? renderPdfOpenGradeReport(latestAtt.aiReport, latestAtt.provider) : ""}
                            </div>
                        </div>
                    </div>
                `;
            }).join("")}
            ${renderLmsAiPracticeGeneratorBar(u, ls)}
        </div>
    `;
}

function renderLmsVocabularyLessonWorkspace(course, u, ls) {
    // If an AI Practice set is selected, run the multi-question quiz; otherwise show Flashcards + Word Table + SRS Push!
    if (pdfLmsUi.practiceSetId !== "original") {
        return renderLmsQuestionBasedWorkspace(course, u, ls, "vocabulary");
    }
    const words = ls.words || [];
    return `
        <div class="space-y-4">
            ${renderLmsPracticeSetSwitcher(u, ls)}
            <div class="p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h3 class="text-base md:text-lg font-black text-white">📖 ${escHtml(ls.title)}</h3>
                        <p class="text-xs text-slate-400">Nghe phát âm, đánh dấu từ đã nhớ, đẩy vào hệ thống SRS QEnglish hoặc tạo thêm bài kiểm tra từ vựng bằng AI.</p>
                    </div>
                    <button onclick="pushPdfVocabToMainSRS()" class="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-extrabold">➕ Đẩy vào Kho Từ Vựng SRS QEnglish</button>
                </div>
                <div class="grid sm:grid-cols-2 gap-3">
                    ${words.map(v => {
                        const done = (course.progress?.completedIds || []).includes(v.id);
                        return `
                            <div class="p-4 rounded-2xl bg-slate-950/90 border ${done ? "border-emerald-500/40" : "border-white/10"} space-y-1.5 text-xs">
                                <div class="flex items-center justify-between gap-2">
                                    <button data-speak="${escHtml(v.term)}" onclick="handlePdfSpeakBtn(this)" class="font-black text-sm text-white hover:text-cyan-300 text-left">🔊 ${escHtml(v.term)} <span class="text-cyan-300 font-mono text-[11px] font-normal">${escHtml(v.ipa || "")}</span></button>
                                    <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${v.sourcePage || 1})" class="text-[10px] text-cyan-400 hover:underline shrink-0">📖 Tr.${v.sourcePage || 1}</button>
                                </div>
                                <p class="text-emerald-300 font-bold">${escHtml(v.meaningVi)} ${v.pos ? `<span class="text-slate-400 font-normal">(${escHtml(v.pos)})</span>` : ""}</p>
                                ${v.example ? `<p class="text-slate-300 italic text-[11px]">"${escHtml(v.example)}"</p>` : ""}
                                ${(v.collocations || []).length ? `<p class="text-[10.5px] text-violet-300"><strong>Collocations:</strong> ${escHtml(v.collocations.join(", "))}</p>` : ""}
                                <div class="pt-1.5 flex items-center gap-2">
                                    <button onclick="markPdfVocabRemembered('${v.id}', ${!done})" class="px-2.5 py-1 rounded-lg font-bold text-[11px] ${done ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-white/5 text-slate-300 border border-white/10 hover:text-white"}">${done ? "✅ Đã nhớ" : "○ Đánh dấu đã nhớ"}</button>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
            ${renderLmsAiPracticeGeneratorBar(u, ls)}
        </div>
    `;
}

/* ==================== 9. MASTER LMS COURSE RENDERER (PLUGS INTO renderPdfStudioPage) ==================== */
function renderLmsCourseWorkspace(course, folders) {
    const units = ensureCourseUnitsNormalized(course);
    const courseFolder = course.folderId ? folders.find(f => f.id === course.folderId) : null;
    const activeUnit = pdfLmsUi.unitId ? lmsGetUnit(course, pdfLmsUi.unitId) : null;
    const activeSkillMeta = LMS_SKILLS_META.find(s => s.key === pdfLmsUi.skillKey) || null;
    const activeLesson = (activeUnit && activeSkillMeta && pdfLmsUi.lessonId) ? lmsGetLesson(activeUnit, activeSkillMeta.key, pdfLmsUi.lessonId) : null;

    // Build exact hierarchical breadcrumb: AI PDF Studio > PEN-LV3 > Unit 1 > Reading > Bài 1
    const crumbs = [
        `<button onclick="openPdfLibraryRoot()" class="text-cyan-300 hover:underline">📁 AI PDF Studio</button>`,
        courseFolder ? `<span class="text-slate-500">›</span><button onclick="openPdfFolder('${courseFolder.id}')" class="text-violet-300 hover:underline">${escHtml(courseFolder.name)}</button>` : "",
        `<span class="text-slate-500">›</span><button onclick="lmsGoUnits()" class="${pdfLmsUi.level === "units" ? "text-white font-black" : "text-slate-300 hover:text-white hover:underline"}">${escHtml(course.title)}</button>`,
        (activeUnit && ["unit_skills", "skill_lessons", "lesson"].includes(pdfLmsUi.level))
            ? `<span class="text-slate-500">›</span><button onclick="lmsOpenUnit('${activeUnit.id}')" class="${pdfLmsUi.level === "unit_skills" ? "text-white font-black" : "text-slate-300 hover:text-white hover:underline"}">${escHtml(activeUnit.title)}</button>` : "",
        (activeUnit && activeSkillMeta && ["skill_lessons", "lesson"].includes(pdfLmsUi.level))
            ? `<span class="text-slate-500">›</span><button onclick="lmsOpenSkill('${activeUnit.id}','${activeSkillMeta.key}')" class="${pdfLmsUi.level === "skill_lessons" ? "text-white font-black" : "text-slate-300 hover:text-white hover:underline"}">${activeSkillMeta.icon} ${activeSkillMeta.label}</button>` : "",
        (activeLesson && pdfLmsUi.level === "lesson")
            ? `<span class="text-slate-500">›</span><span class="text-emerald-300 font-black truncate">${escHtml(activeLesson.title)}</span>` : ""
    ].filter(Boolean).join(" ");

    let backAction = courseFolder ? `openPdfFolder('${courseFolder.id}')` : "openPdfLibraryRoot()";
    let backLabel = courseFolder ? `← Về ${courseFolder.name}` : "← Về Thư mục";
    if (pdfLmsUi.level === "unit_skills" || pdfLmsUi.level === "extra_tool") { backAction = "lmsGoUnits()"; backLabel = "← Danh sách Unit"; }
    else if (pdfLmsUi.level === "skill_lessons" && activeUnit) { backAction = `lmsOpenUnit('${activeUnit.id}')`; backLabel = `← Về ${activeUnit.title}`; }
    else if (pdfLmsUi.level === "lesson" && activeUnit && activeSkillMeta) { backAction = `lmsOpenSkill('${activeUnit.id}','${activeSkillMeta.key}')`; backLabel = `← Danh sách bài ${activeSkillMeta.label}`; }

    let bodyHtml = "";

    // LEVEL A: EXTRA TOOLS (Mind Map, Comprehensive Exam, Weakness Detector, Knowledge Map)
    if (pdfLmsUi.level === "extra_tool") {
        bodyHtml = `<div class="glass-panel p-5 rounded-3xl">${renderPdfCourseTabContent(course)}</div>`;
    }
    // LEVEL B: COURSE UNITS LIST (Step 4)
    else if (pdfLmsUi.level === "units") {
        const q = (pdfLmsUi.searchQuery || "").trim().toLowerCase();
        const filteredUnits = units.filter(u => !q || u.title.toLowerCase().includes(q) || (u.summaryVi || "").toLowerCase().includes(q));
        const totalLessonsAll = units.reduce((s, u) => s + lmsComputeUnitStats(course, u).totalLessons, 0);
        const doneLessonsAll = units.reduce((s, u) => s + lmsComputeUnitStats(course, u).completedLessons, 0);
        const coursePct = totalLessonsAll > 0 ? Math.round((doneLessonsAll / totalLessonsAll) * 100) : 0;

        bodyHtml = `
            <div class="glass-panel p-5 md:p-6 rounded-3xl space-y-5">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div class="space-y-1">
                        <span class="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">Unit-Based Learning • Course → Unit → Skill → Lesson</span>
                        <h2 class="text-xl font-black text-white">${escHtml(course.title)}</h2>
                        <p class="text-xs text-slate-400">${units.length} Units • ${totalLessonsAll} bài học • Hoàn thành <strong class="text-emerald-300">${doneLessonsAll}/${totalLessonsAll} (${coursePct}%)</strong></p>
                    </div>
                    <div class="flex flex-wrap gap-2 text-xs">
                        <button onclick="lmsOpenExtraTool('mindmap')" class="px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">🗺️ Sơ đồ tóm tắt</button>
                        <button onclick="lmsOpenExtraTool('exam')" class="px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-200 font-bold">🎓 Kiểm tra tổng hợp</button>
                        <button onclick="lmsOpenExtraTool('weakness')" class="px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 font-bold">🧠 Lỗ hổng (${computePdfWeaknessClusters(course).length})</button>
                        <button onclick="lmsCreateUnitWithAI()" class="px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-extrabold">✨ Tạo Unit bằng AI</button>
                        <button onclick="lmsAddManualUnit()" class="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold">➕ Thêm Unit</button>
                    </div>
                </div>

                <!-- Overall Progress Bar & Search -->
                <div class="flex flex-wrap items-center gap-3">
                    <div class="flex-1 min-w-[200px] h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div class="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-all" style="width:${coursePct}%"></div>
                    </div>
                    <input type="text" value="${escHtml(pdfLmsUi.searchQuery || "")}" oninput="pdfLmsUi.searchQuery=this.value; renderPdfStudioPage();" placeholder="🔍 Tìm nhanh Unit..." class="bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white w-56">
                </div>

                <!-- Unit Cards Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${filteredUnits.map((u, idx) => {
                        const st = lmsComputeUnitStats(course, u);
                        return `
                            <div onclick="lmsOpenUnit('${u.id}')" class="group cursor-pointer p-5 rounded-3xl bg-slate-950/90 border border-white/10 hover:border-violet-400/60 transition shadow-lg space-y-3">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="min-w-0">
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <span class="px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-200 text-[10px] font-extrabold">Unit ${idx + 1}</span>
                                            <button onclick="event.stopPropagation(); openPdfSourcePage('${escHtml(course.docId)}', ${u.pageStart || 1})" class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">📖 Tr.${u.pageStart}–${u.pageEnd}</button>
                                        </div>
                                        <h3 class="text-base font-black text-white group-hover:text-cyan-300 transition mt-1.5">${escHtml(u.title)}</h3>
                                    </div>
                                    <div class="flex items-center gap-1 text-[11px] shrink-0" onclick="event.stopPropagation()">
                                        <button onclick="lmsMoveUnit('${u.id}', -1)" class="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400" title="Lên">▲</button>
                                        <button onclick="lmsMoveUnit('${u.id}', 1)" class="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400" title="Xuống">▼</button>
                                        <button onclick="lmsRenameUnit('${u.id}')" class="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300" title="Đổi tên">✏️</button>
                                        <button onclick="lmsDeleteUnit('${u.id}')" class="p-1 rounded bg-rose-500/15 text-rose-300" title="Xóa">🗑️</button>
                                    </div>
                                </div>

                                <div class="flex flex-wrap gap-1.5 text-[10.5px] font-bold">
                                    ${LMS_SKILLS_META.map(sm => {
                                        const cnt = (u.skills?.[sm.key] || []).length;
                                        return `<span class="px-2 py-0.5 rounded-lg ${cnt > 0 ? "bg-slate-900 text-slate-200 border border-white/10" : "bg-slate-950 text-slate-600 border border-white/5"}">${sm.icon} ${sm.label}: ${cnt}</span>`;
                                    }).join("")}
                                </div>

                                <div class="flex items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
                                    <div class="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                        <div class="h-full bg-emerald-400" style="width:${st.pct}%"></div>
                                    </div>
                                    <span class="text-[11px] font-extrabold text-emerald-300 shrink-0">${st.completedLessons}/${st.totalLessons} bài • Mở →</span>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }
    // LEVEL C: UNIT SKILLS VIEW (Step 5 & 6)
    else if (pdfLmsUi.level === "unit_skills" && activeUnit) {
        const st = lmsComputeUnitStats(course, activeUnit);
        bodyHtml = `
            <div class="glass-panel p-5 md:p-6 rounded-3xl space-y-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <span class="text-[10px] font-extrabold text-violet-400 uppercase tracking-wider">Chọn kỹ năng để học trong Unit này</span>
                        <h2 class="text-xl font-black text-white mt-0.5">${escHtml(activeUnit.title)}</h2>
                        ${activeUnit.summaryVi ? `<p class="text-xs text-slate-300 mt-1 max-w-3xl">${escHtml(activeUnit.summaryVi)}</p>` : ""}
                    </div>
                    <div class="flex flex-wrap gap-2 text-xs">
                        <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${activeUnit.pageStart || 1})" class="px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">📖 Xem trang PDF (${activeUnit.pageStart}–${activeUnit.pageEnd})</button>
                        <button onclick="lmsOpenUnitMindMap('${activeUnit.id}')" class="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-cyan-300 font-bold">🗺️ Sơ đồ Unit</button>
                        <button onclick="lmsOpenUnitExam('${activeUnit.id}')" class="px-3 py-2 rounded-xl bg-violet-600/25 border border-violet-500/40 text-violet-200 font-bold">🎓 Test Unit này</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${LMS_SKILLS_META.map(sm => {
                        const list = activeUnit.skills?.[sm.key] || [];
                        const done = list.filter(l => lmsIsLessonCompleted(course, l)).length;
                        const aiSetsCount = list.reduce((s, l) => s + (l.aiPracticeSets?.length || 0), 0);
                        const pct = list.length ? Math.round((done / list.length) * 100) : 0;
                        return `
                            <div onclick="lmsOpenSkill('${activeUnit.id}','${sm.key}')" class="group cursor-pointer p-5 rounded-3xl bg-slate-950/90 border ${list.length ? "border-white/10 hover:border-cyan-400/60" : "border-white/5 opacity-75"} transition shadow-lg space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-3xl">${sm.icon}</span>
                                    <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold ${list.length ? "bg-violet-500/20 text-violet-200" : "bg-slate-800 text-slate-400"}">${list.length} bài ${aiSetsCount ? `+ ${aiSetsCount} AI` : ""}</span>
                                </div>
                                <div>
                                    <h3 class="text-base font-black text-white group-hover:text-cyan-300 transition">${sm.label}</h3>
                                    <p class="text-[11px] text-slate-400 mt-0.5">${sm.desc}</p>
                                </div>
                                <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                    <span class="${list.length ? "text-emerald-300" : "text-amber-300"} font-bold">${list.length ? `Hoàn thành ${done}/${list.length} (${pct}%)` : "Chưa có bài (có thể thêm)"}</span>
                                    <span class="text-cyan-300 font-extrabold">Vào học →</span>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }
    // LEVEL D: SKILL LESSON LIST (Step 7 & 8)
    else if (pdfLmsUi.level === "skill_lessons" && activeUnit && activeSkillMeta) {
        const list = activeUnit.skills?.[activeSkillMeta.key] || [];
        const filtered = list.filter(ls => {
            if (pdfLmsUi.statusFilter === "done") return lmsIsLessonCompleted(course, ls);
            if (pdfLmsUi.statusFilter === "todo") return !lmsIsLessonCompleted(course, ls);
            return true;
        });

        bodyHtml = `
            <div class="glass-panel p-5 md:p-6 rounded-3xl space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <span class="text-[10px] font-extrabold text-cyan-400 uppercase">${escHtml(activeUnit.title)} • ${activeSkillMeta.icon} ${activeSkillMeta.label}</span>
                        <h2 class="text-xl font-black text-white mt-0.5">Danh sách bài ${activeSkillMeta.label} (${list.length} bài)</h2>
                    </div>
                    <div class="flex flex-wrap gap-2 text-xs">
                        <select onchange="pdfLmsUi.statusFilter=this.value; renderPdfStudioPage();" class="bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-emerald-300 font-bold">
                            <option value="all" ${pdfLmsUi.statusFilter === "all" ? "selected" : ""}>Tất cả trạng thái</option>
                            <option value="todo" ${pdfLmsUi.statusFilter === "todo" ? "selected" : ""}>⏳ Chưa hoàn thành</option>
                            <option value="done" ${pdfLmsUi.statusFilter === "done" ? "selected" : ""}>✅ Đã hoàn thành</option>
                        </select>
                        <button onclick="lmsAddManualLesson('${activeUnit.id}','${activeSkillMeta.key}')" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-bold">➕ Thêm bài học</button>
                    </div>
                </div>

                ${filtered.length ? `
                    <div class="space-y-3">
                        ${filtered.map((ls, idx) => {
                            const done = lmsIsLessonCompleted(course, ls);
                            const best = lmsGetLessonBestScore(course, ls.id);
                            const attCnt = lmsGetLessonAttempts(course, ls.id).length;
                            const qCount = ls.skill === "vocabulary" ? (ls.words?.length || 0) : (ls.questions?.length || 0);
                            const aiSets = ls.aiPracticeSets || [];
                            return `
                                <div class="p-4 rounded-2xl bg-slate-950/90 border ${done ? "border-emerald-500/35" : "border-white/10 hover:border-violet-400/60"} transition space-y-3">
                                    <div class="flex flex-wrap items-start justify-between gap-3">
                                        <div onclick="lmsOpenLesson('${activeUnit.id}','${activeSkillMeta.key}','${ls.id}','original')" class="cursor-pointer flex-1 min-w-0">
                                            <div class="flex items-center gap-2 flex-wrap">
                                                <span class="px-2 py-0.5 rounded-lg bg-violet-600/30 text-violet-200 text-[10px] font-extrabold">Bài ${idx + 1}</span>
                                                <h3 class="text-sm md:text-base font-black text-white hover:text-cyan-300 transition">${escHtml(ls.title)}</h3>
                                                ${done ? `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">✅ Hoàn thành</span>` : ""}
                                                ${best !== null ? `<span class="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-bold">Cao nhất: ${best}% (${attCnt} lần)</span>` : ""}
                                            </div>
                                            <p class="text-[11px] text-slate-400 mt-1">
                                                ${ls.skill === "vocabulary" ? `${qCount} từ vựng` : qCount > 0 ? `${qCount} câu hỏi` : (ls.skill === "writing" || ls.skill === "speaking" ? "Bài thực hành AI chấm thang 10" : "Bài học tương tác")}
                                                • Nguồn: Trang ${ls.sourcePage || activeUnit.pageStart}
                                                ${ls.audioStoragePath ? ` • <span class="text-emerald-300 font-bold">🎧 Có Audio bản xứ</span>` : ""}
                                            </p>
                                        </div>
                                        <div class="flex flex-wrap items-center gap-1.5 text-xs">
                                            <button onclick="lmsOpenLesson('${activeUnit.id}','${activeSkillMeta.key}','${ls.id}','original')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold shadow">▶ Làm bài</button>
                                            <button onclick="lmsMoveLesson('${activeUnit.id}','${activeSkillMeta.key}','${ls.id}',-1)" class="p-1.5 rounded-lg bg-white/5 text-slate-400">▲</button>
                                            <button onclick="lmsMoveLesson('${activeUnit.id}','${activeSkillMeta.key}','${ls.id}',1)" class="p-1.5 rounded-lg bg-white/5 text-slate-400">▼</button>
                                            <button onclick="lmsRenameLesson('${activeUnit.id}','${activeSkillMeta.key}','${ls.id}')" class="p-1.5 rounded-lg bg-white/5 text-slate-300">✏️</button>
                                            <button onclick="lmsDeleteLesson('${activeUnit.id}','${activeSkillMeta.key}','${ls.id}')" class="p-1.5 rounded-lg bg-rose-500/15 text-rose-300">🗑️</button>
                                        </div>
                                    </div>
                                    ${aiSets.length ? `
                                        <div class="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-[11px]">
                                            <span class="text-violet-300 font-bold">🤖 Bài AI đã tạo trong bài này:</span>
                                            ${aiSets.map(ps => `<button onclick="lmsOpenLesson('${activeUnit.id}','${activeSkillMeta.key}','${ls.id}','${ps.id}')" class="px-2.5 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/30 border border-violet-500/35 text-violet-200 font-bold">${escHtml(ps.label)} (${ps.questions?.length || ps.writingTasks?.length || ps.speakingTasks?.length || 0}) →</button>`).join("")}
                                        </div>
                                    ` : ""}
                                </div>
                            `;
                        }).join("")}
                    </div>
                ` : `
                    <div class="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/25 text-center space-y-2 text-xs">
                        <p class="font-extrabold text-amber-300">ℹ️ Chưa có bài ${activeSkillMeta.label} nào trong ${escHtml(activeUnit.title)}</p>
                        <p class="text-slate-400">Bạn có thể bấm <strong>➕ Thêm bài học</strong> ở góc trên để tự tạo bài học mới cho kỹ năng này.</p>
                    </div>
                `}
            </div>
        `;
    }
    // LEVEL E: ACTIVE INTERACTIVE LESSON OR RESULT SCREEN (Step 9 & 10)
    else if (pdfLmsUi.level === "lesson" && activeUnit && activeSkillMeta && activeLesson) {
        const resultAttempt = pdfLmsUi.showingResultAttemptId
            ? (course.attempts || []).find(a => a.id === pdfLmsUi.showingResultAttemptId)
            : null;
        if (resultAttempt) {
            bodyHtml = renderLmsResultDashboard(course, activeUnit, activeLesson, resultAttempt);
        } else if (activeSkillMeta.key === "reading") {
            bodyHtml = renderLmsReadingSplitWorkspace(course, activeUnit, activeLesson);
        } else if (activeSkillMeta.key === "listening" || activeSkillMeta.key === "grammar") {
            bodyHtml = renderLmsQuestionBasedWorkspace(course, activeUnit, activeLesson, activeSkillMeta.key);
        } else if (activeSkillMeta.key === "writing" || activeSkillMeta.key === "speaking") {
            bodyHtml = renderLmsOpenSkillSplitWorkspace(course, activeUnit, activeLesson, activeSkillMeta.key);
        } else if (activeSkillMeta.key === "vocabulary") {
            bodyHtml = renderLmsVocabularyLessonWorkspace(course, activeUnit, activeLesson);
        }
    }

    return `
        <!-- Persistent Multi-Level Breadcrumb Bar -->
        <div class="glass-panel px-4 py-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-1.5 flex-wrap font-bold min-w-0">${crumbs}</div>
            <div class="flex items-center gap-2 shrink-0">
                <button onclick="openPdfSourcePage('${escHtml(course.docId)}', ${activeLesson?.sourcePage || activeUnit?.pageStart || course.analyzedRange?.start || 15})" class="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">📖 Xem Sách PDF</button>
                <button onclick="${backAction}" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold">${backLabel}</button>
            </div>
        </div>
        ${bodyHtml}
    `;
}
