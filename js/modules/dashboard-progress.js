/* ==========================================================================
   QEnglish - Dashboard, Progress Analytics, Adaptive Learning, Settings & App Init
   ========================================================================== */

let activeMainPage = "dashboard";
let skillRadarChartInstance = null;
let weeklyMinutesChartInstance = null;

const DEFAULT_DAILY_PLAN = [
    { id: "vocab", title: "Học 10 từ mới & Luyện 6 bước", duration: "15 phút", icon: "📖", targetPage: "vocabulary", targetSub: "practice" },
    { id: "listening", title: "Listening Practice (Dictation / Choose)", duration: "20 phút", icon: "🎧", targetPage: "listening" },
    { id: "grammar", title: "Grammar Practice (1 chủ điểm)", duration: "15 phút", icon: "📝", targetPage: "grammar" },
    { id: "speaking", title: "Speaking Practice (Topic / Live)", duration: "15 phút", icon: "🎙️", targetPage: "speaking" },
    { id: "reading", title: "Reading Practice (Highlight & Từ mới)", duration: "20 phút", icon: "📄", targetPage: "reading" },
    { id: "writing", title: "Writing Practice (Đoạn văn / Bài luận)", duration: "20 phút", icon: "✍️", targetPage: "writing" }
];

function getDashboardSaved() {
    return safeParseJSON(localStorage.getItem(STORAGE_KEYS.DASHBOARD), { tasksByDate: {} });
}

function saveDashboardSaved(st) {
    safeWriteJSON(STORAGE_KEYS.DASHBOARD, st);
}

/* ==================== NAVIGATION & GLOBAL LEVEL ==================== */
function toggleSidebar(forceClose = false) {
    const sb = document.getElementById("sidebar");
    const ov = document.getElementById("sidebar-overlay");
    if (!sb) return;
    if (forceClose) {
        sb.classList.remove("mobile-open");
        ov?.classList.remove("active");
    } else {
        sb.classList.toggle("mobile-open");
        ov?.classList.toggle("active");
    }
}

function navigateTo(page, subTab = null) {
    activeMainPage = page;
    document.querySelectorAll(".module-page").forEach(el => {
        el.classList.toggle("active", el.id === `page-${page}`);
    });
    document.querySelectorAll(".sidebar-item[data-nav]").forEach(el => {
        const navKey = el.getAttribute("data-nav");
        if (!navKey.startsWith("vocab-")) {
            el.classList.toggle("active", navKey === page);
        }
    });
    document.querySelectorAll(".mob-nav-btn").forEach(el => {
        el.classList.toggle("text-violet-400", el.getAttribute("data-mob") === page);
        el.classList.toggle("text-slate-400", el.getAttribute("data-mob") !== page);
    });

    const vocabSubMenu = document.getElementById("vocab-sub");
    if (vocabSubMenu) vocabSubMenu.classList.toggle("hidden", page !== "vocabulary");

    const titleMap = {
        dashboard: "Dashboard — Trung tâm học tập",
        vocabulary: "Vocabulary — Từ vựng & SRS",
        grammar: "Grammar — Ngữ pháp A1–C2",
        listening: "Listening — Luyện nghe",
        speaking: "Speaking — Hội thoại & Luyện nói",
        reading: "Reading — Đọc hiểu học thuật",
        writing: "Writing — Luyện viết",
        notebook: "English Notebook — Sổ ghi chú cá nhân",
        progress: "Progress — Phân tích tiến độ & Adaptive Learning",
        materials: "My Learning Materials — Kho Học Liệu Của Tôi",
        settings: "Settings & Quản lý Nội dung"
    };
    const titleEl = document.getElementById("page-title");
    if (titleEl) titleEl.textContent = titleMap[page] || "QEnglish";

    toggleSidebar(true);

    // Stop any stray background audio/timers when switching pages
    if (typeof listeningStopAudio === "function") listeningStopAudio();
    if (typeof stopActiveSpeakingCapture === "function") stopActiveSpeakingCapture();
    if (typeof stopSpeech === "function") stopSpeech();
    if (typeof fullTestTimerId !== "undefined") clearInterval(fullTestTimerId);
    if (typeof writingTimerId !== "undefined") clearInterval(writingTimerId);

    // Trigger active module refresh & ensure landing list visibility
    if (page === "dashboard") refreshDashboardUI();
    if (page === "vocabulary") switchVocabTab(subTab || currentVocabSubTab || "flashcards");
    if (page === "grammar") {
        if (typeof closeGrammarLesson === "function") closeGrammarLesson();
        else filterGrammarLessons();
    }
    if (page === "listening") {
        if (typeof closeListeningExercise === "function") closeListeningExercise();
        else filterListeningExercises();
    }
    if (page === "speaking") {
        if (typeof closeSpeakingSession === "function") closeSpeakingSession();
        renderSpeakingTopicsGrid();
    }
    if (page === "reading") {
        if (typeof closeReadingSession === "function") closeReadingSession();
        else filterReadingPassages();
    }
    if (page === "writing") {
        if (typeof closeWritingEditor === "function") closeWritingEditor();
        else filterWritingTopics();
    }
    if (page === "notebook") renderNotebook();
    if (page === "progress") renderProgressAnalyticsPage();
    if (page === "materials") renderMaterialsPageTable();
    if (page === "settings") renderSettingsAndCMSPage();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function onLevelChange(levelVal) {
    const isIelts = String(levelVal).toUpperCase().startsWith("IELTS");
    saveSettings({
        selectedLevel: levelVal,
        levelSystem: isIelts ? "IELTS" : "CEFR"
    });

    // Sync all module level selectors to the chosen Global Level
    const moduleSelectIds = [
        "listening-level-filter",
        "reading-level-filter",
        "writing-level-filter",
        "speaking-level-filter",
        "grammar-level-filter",
        "study-level-select"
    ];
    moduleSelectIds.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        // Check if option exists in this select; if not, add or fall back gracefully
        const hasOpt = [...sel.options].some(o => o.value === levelVal);
        if (hasOpt) sel.value = levelVal;
        else if (levelVal === "all") sel.value = "all";
    });

    const badge = document.getElementById("dash-current-level-badge");
    if (badge) badge.textContent = levelVal === "all" ? "Tất cả trình độ" : levelVal;

    // Refresh current active module
    navigateTo(activeMainPage, currentVocabSubTab);
    showToast(`Đã áp dụng bộ lọc trình độ: ${levelVal === "all" ? "Tất cả" : levelVal}`);
}

/* ==================== DASHBOARD RENDERING (PHẦN 3.1) ==================== */
function refreshDashboardUI() {
    const stats = computeOverallAnalytics();
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    // A. 9 Core KPIs (100% real data)
    setTxt("dash-days-total", `${stats.totalDaysStudied} ngày`);
    setTxt("dash-streak", `${stats.streak} ngày`);
    setTxt("dash-time", stats.totalMinutes >= 60 ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}p` : `${stats.totalMinutes} phút`);
    setTxt("dash-words", `${stats.wordsLearned} / ${deck.length}`);
    setTxt("dash-words-mastered", `${stats.wordsMastered}`);
    setTxt("dash-listening-done", `${stats.totalListening}`);
    setTxt("dash-reading-done", `${stats.totalReading}`);
    setTxt("dash-writing-done", `${stats.totalWriting}`);
    setTxt("dash-speaking-done", `${stats.totalSpeaking}`);
    setTxt("dash-avg", stats.avgScore !== null ? `${stats.avgScore}%` : "Chưa có");
    setTxt("dash-writing-avg10", stats.writingAvg10 !== null ? `${stats.writingAvg10} / 10` : "Chưa chấm AI");
    setTxt("dash-srs-due", `${(stats.srsCounts?.due || 0) + (stats.srsCounts?.leech || 0)}`);

    // Personal Goal & Overall Mastery Progress
    const authUser = typeof CloudClient !== "undefined" ? CloudClient.getUser() : null;
    const activeAcc = typeof getActiveAccount === "function" ? getActiveAccount() : null;
    const displayUserName = authUser?.user_metadata?.display_name || activeAcc?.name || authUser?.email?.split("@")[0] || "bạn";
    const avgMasteryPct = Math.min(100, Math.max(5, Math.round(
        (stats.skills.listening + stats.skills.speaking + stats.skills.reading + stats.skills.writing + stats.skills.vocabGrammar) / 5
    )));

    const goalBar = document.getElementById("sidebar-goal-bar");
    if (goalBar) goalBar.style.width = `${avgMasteryPct}%`;
    const goalText = document.getElementById("dash-goal-countdown");
    if (goalText) {
        goalText.textContent = `🎯 Mục tiêu cá nhân: ${activeAcc?.goal || "Chinh phục 5 kỹ năng Tiếng Anh"} • Mức độ hoàn thiện tổng thể: ${avgMasteryPct}%`;
    }
    const heroGreeting = document.getElementById("dash-hero-greeting");
    if (heroGreeting) {
        heroGreeting.textContent = `Chào ${displayUserName}! Sẵn sàng bứt phá Tiếng Anh hôm nay?`;
    }
    if (typeof syncAccountBadgesUI === "function") syncAccountBadgesUI();
    if (typeof syncCurrentAccountSnapshot === "function") syncCurrentAccountSnapshot();

    // B. Skill Progress Bars
    const barMap = [
        ["vocab", stats.skills.vocabGrammar],
        ["grammar", stats.skills.grammar],
        ["listen", stats.skills.listening],
        ["speak", stats.skills.speaking],
        ["read", stats.skills.reading],
        ["write", stats.skills.writing]
    ];
    barMap.forEach(([key, pct]) => {
        setTxt(`skill-${key}-pct`, `${pct}%`);
        const bar = document.getElementById(`skill-${key}-bar`);
        if (bar) bar.style.width = `${pct}%`;
    });

    renderDashboardRadarChart(stats.skills);
    renderDailyPlanTasks();
    renderDailyMotivationWidget();
    renderWeeklyStreakBoxes();
}

function renderDashboardRadarChart(skills) {
    const canvas = document.getElementById("dash-radar-chart");
    if (!canvas || typeof Chart === "undefined") return;

    const dataArr = [
        skills.listening,
        skills.speaking,
        skills.reading,
        skills.writing,
        skills.vocabGrammar
    ];

    if (skillRadarChartInstance) {
        skillRadarChartInstance.data.datasets[0].data = dataArr;
        skillRadarChartInstance.update();
        return;
    }

    skillRadarChartInstance = new Chart(canvas.getContext("2d"), {
        type: "radar",
        data: {
            labels: ["Listening", "Speaking", "Reading", "Writing", "Grammar & Vocab"],
            datasets: [{
                label: "Mức độ hoàn thiện (%)",
                data: dataArr,
                backgroundColor: "rgba(139, 92, 246, 0.28)",
                borderColor: "#8B5CF6",
                pointBackgroundColor: "#06B6D4",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 25, display: false },
                    grid: { color: "rgba(255,255,255,0.08)" },
                    angleLines: { color: "rgba(255,255,255,0.08)" },
                    pointLabels: { color: "#cbd5e1", font: { size: 11, weight: "bold" } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderDailyPlanTasks() {
    const container = document.getElementById("daily-tasks");
    if (!container) return;
    const todayKey = getLocalDateKey();
    const dash = getDashboardSaved();
    const doneMap = (dash.tasksByDate && dash.tasksByDate[todayKey]) || {};

    container.innerHTML = DEFAULT_DAILY_PLAN.map(task => {
        const checked = Boolean(doneMap[task.id]);
        return `
            <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/65 border ${checked ? "border-emerald-500/35 bg-emerald-500/5" : "border-white/5"} transition">
                <label class="flex items-center gap-3 cursor-pointer flex-1">
                    <input type="checkbox" class="task-check" ${checked ? "checked" : ""} onchange="toggleDailyTask('${task.id}')">
                    <div>
                        <p class="text-xs md:text-sm font-bold ${checked ? "line-through text-slate-400" : "text-white"}">${task.icon} ${escHtml(task.title)}</p>
                        <p class="text-[11px] text-slate-400">Thời lượng gợi ý: ${task.duration}</p>
                    </div>
                </label>
                <button onclick="navigateTo('${task.targetPage}'${task.targetSub ? `, '${task.targetSub}'` : ""})" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-violet-600/30 border border-white/10 text-[11px] font-bold text-cyan-300 shrink-0">
                    Học →
                </button>
            </div>
        `;
    }).join("");
}

function toggleDailyTask(taskId) {
    const todayKey = getLocalDateKey();
    const dash = getDashboardSaved();
    if (!dash.tasksByDate) dash.tasksByDate = {};
    if (!dash.tasksByDate[todayKey]) dash.tasksByDate[todayKey] = {};
    dash.tasksByDate[todayKey][taskId] = !dash.tasksByDate[todayKey][taskId];
    saveDashboardSaved(dash);
    renderDailyPlanTasks();
}

function renderDailyMotivationWidget() {
    const box = document.getElementById("daily-motivation");
    if (!box) return;
    const quotes = typeof DAILY_QUOTES !== "undefined" ? DAILY_QUOTES : [];
    const daySeed = new Date().getDate();
    const q = quotes[daySeed % Math.max(1, quotes.length)] || {
        en: "Consistency beats intensity.",
        vi: "Sự đều đặn luôn chiến thắng sự bộc phát nhất thời.",
        tip: "Hoàn thành ít nhất 3 nhiệm vụ nhỏ mỗi ngày!"
    };
    const wordOfDay = deck.length > 0 ? deck[daySeed % deck.length] : null;

    box.innerHTML = `
        <p class="text-[11px] text-cyan-400 font-extrabold uppercase tracking-wider">💡 Động lực & Từ vựng trong ngày</p>
        <p class="text-sm text-white font-semibold italic mt-1">"${escHtml(q.en)}"</p>
        <p class="text-xs text-slate-400 mt-0.5">— ${escHtml(q.vi)}</p>
        ${wordOfDay ? `
            <div class="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                <span>🌟 Từ hôm nay: <strong class="text-amber-300">${escHtml(wordOfDay.term)}</strong> (${escHtml(wordOfDay.def)})</span>
                <button onclick='speakText(${JSON.stringify(wordOfDay.term)}, 1.0)' class="text-cyan-300 font-bold">🔊</button>
            </div>
        ` : ""}
    `;
}

function renderWeeklyStreakBoxes() {
    const wrap = document.getElementById("dash-weekly-streak");
    if (!wrap) return;
    const weekly = computeWeeklyComparison();
    const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
    const todayKey = getLocalDateKey();

    wrap.innerHTML = weekly.thisWeek.minutesByDay.map((d, idx) => {
        const active = d.minutes >= 1 || (progressState.days[d.dateKey] && (
            progressState.days[d.dateKey].newWords > 0 ||
            progressState.days[d.dateKey].listeningDone > 0 ||
            progressState.days[d.dateKey].readingDone > 0 ||
            progressState.days[d.dateKey].writingDone > 0 ||
            progressState.days[d.dateKey].speakingSessions > 0 ||
            progressState.days[d.dateKey].grammarDone > 0
        ));
        const isToday = d.dateKey === todayKey;
        return `
            <div class="flex-1 p-3 rounded-2xl text-center border ${active ? "bg-violet-600/25 border-violet-400/50" : "bg-slate-950/60 border-white/5"} ${isToday ? "ring-1 ring-cyan-400" : ""}">
                <p class="text-[11px] font-bold ${isToday ? "text-cyan-300" : "text-slate-400"}">${dayNames[idx]}</p>
                <p class="text-lg my-1">${active ? "🔥" : "⚪"}</p>
                <p class="text-[10px] text-slate-300 font-semibold">${d.minutes}p</p>
            </div>
        `;
    }).join("");
}

/* ==================== PROGRESS ANALYTICS & ADAPTIVE LEARNING (PHẦN 7) ==================== */
function renderProgressAnalyticsPage() {
    const stats = computeOverallAnalytics();
    const todayLog = ensureTodayLog();
    const weekly = computeWeeklyComparison();
    const recs = computeAdaptiveRecommendations();

    const setTxt = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    setTxt("prog-total-days", stats.totalDaysStudied);
    setTxt("prog-total-words", `${stats.wordsLearned} / ${deck.length}`);
    setTxt("prog-total-lessons", stats.totalGrammar + stats.totalListening + stats.totalReading + stats.totalWriting + stats.totalSpeaking);
    setTxt("prog-total-time", stats.totalMinutes >= 60 ? `${(stats.totalMinutes / 60).toFixed(1)}h` : `${stats.totalMinutes}p`);

    // 7.1 Daily Report
    const dailyBox = document.getElementById("prog-daily-report");
    if (dailyBox) {
        const recentMistakes = (todayLog.mistakes || []).slice(-4);
        dailyBox.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5"><span class="text-slate-400 block">Thời gian hôm nay</span><strong class="text-base text-cyan-300">${Math.round(todayLog.minutes || 0)} phút</strong></div>
                <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5"><span class="text-slate-400 block">Từ mới / Ôn tập</span><strong class="text-base text-violet-300">${todayLog.newWords || 0} mới • ${todayLog.reviewedWords || 0} ôn</strong></div>
                <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5"><span class="text-slate-400 block">Nghe / Đọc hôm nay</span><strong class="text-base text-amber-300">${todayLog.listeningDone || 0} Nghe • ${todayLog.readingDone || 0} Đọc</strong></div>
                <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5"><span class="text-slate-400 block">Viết / Speaking</span><strong class="text-base text-emerald-300">${todayLog.writingDone || 0} bài • ${todayLog.speakingMinutes || 0}p nói</strong></div>
            </div>
            <div class="mt-3 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
                <span class="font-bold text-rose-300">⚠️ Các lỗi nổi bật ghi nhận hôm nay:</span>
                ${recentMistakes.length
                    ? `<ul class="list-disc pl-5 mt-1 text-slate-300 space-y-0.5">${recentMistakes.map(m => `<li>[${escHtml(m.category)}] ${escHtml(m.summary)}</li>`).join("")}</ul>`
                    : `<span class="text-slate-400 ml-1">Chưa ghi nhận lỗi sai nào hôm nay.</span>`}
            </div>
        `;
    }

    // 7.2 Weekly Comparison Table (100% Real Data!)
    const weeklyTable = document.getElementById("prog-weekly-comparison");
    if (weeklyTable) {
        const rows = [
            { label: "Listening", last: weekly.lastWeek.listening, cur: weekly.thisWeek.listening },
            { label: "Speaking", last: weekly.lastWeek.speaking, cur: weekly.thisWeek.speaking },
            { label: "Reading", last: weekly.lastWeek.reading, cur: weekly.thisWeek.reading },
            { label: "Writing", last: weekly.lastWeek.writing, cur: weekly.thisWeek.writing },
            { label: "Grammar & Vocabulary", last: weekly.lastWeek.vocabGrammar, cur: weekly.thisWeek.vocabGrammar }
        ];
        weeklyTable.innerHTML = `
            <div class="overflow-x-auto rounded-xl border border-white/10">
                <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-950 text-slate-300">
                        <tr>
                            <th class="p-3 border-b border-white/10">Nhóm Kỹ Năng</th>
                            <th class="p-3 border-b border-white/10">Tuần trước (Thực tế)</th>
                            <th class="p-3 border-b border-white/10">Tuần này (Thực tế)</th>
                            <th class="p-3 border-b border-white/10">Chênh lệch</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        ${rows.map(r => {
                            const diff = r.cur - r.last;
                            const diffStr = diff > 0 ? `+${diff}% ▲` : diff < 0 ? `${diff}% ▼` : "0% —";
                            const diffCls = diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-slate-400";
                            return `
                                <tr>
                                    <td class="p-3 font-bold text-white">${r.label}</td>
                                    <td class="p-3 text-slate-300">${r.last}%</td>
                                    <td class="p-3 font-bold text-cyan-300">${r.cur}%</td>
                                    <td class="p-3 font-extrabold ${diffCls}">${diffStr}</td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">*Tất cả số liệu trên được tính toán trực tiếp từ kết quả làm bài thực tế của riêng tài khoản của bạn, tuyệt đối không tự sinh điểm giả.</p>
        `;
    }

    // 7.2B Writing 4-Criteria Analytics & Common Mistakes (Real Data Only)
    const extraProgBox = document.getElementById("prog-writing-mistakes-summary");
    if (extraProgBox) {
        const wc = stats.writingCriteriaAvg || {};
        const fmtCrit = v => (typeof v === "number" ? `${v}/2.5` : "—");
        const wSaved = safeParseJSON(localStorage.getItem(STORAGE_KEYS.WRITING), { submissions: [] });
        const recentScored = (wSaved.submissions || []).filter(s => typeof s.totalScore10 === "number").slice(0, 5);
        extraProgBox.innerHTML = `
            <div class="grid md:grid-cols-2 gap-4 text-xs">
                <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5">
                    <div class="flex items-center justify-between">
                        <span class="font-extrabold text-violet-300">✍️ Điểm Writing Trung Bình (4 Tiêu Chí × 2.5)</span>
                        <span class="font-black text-cyan-300">${stats.writingAvg10 !== null ? `${stats.writingAvg10} / 10` : "Chưa có bài AI"}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="p-2.5 rounded-xl bg-slate-900 border border-white/5"><span class="text-slate-400 block text-[10px]">Task Response</span><strong class="text-white text-sm">${fmtCrit(wc.taskResponse)}</strong></div>
                        <div class="p-2.5 rounded-xl bg-slate-900 border border-white/5"><span class="text-slate-400 block text-[10px]">Coherence & Cohesion</span><strong class="text-white text-sm">${fmtCrit(wc.coherenceCohesion)}</strong></div>
                        <div class="p-2.5 rounded-xl bg-slate-900 border border-white/5"><span class="text-slate-400 block text-[10px]">Lexical Resource</span><strong class="text-white text-sm">${fmtCrit(wc.lexicalResource)}</strong></div>
                        <div class="p-2.5 rounded-xl bg-slate-900 border border-white/5"><span class="text-slate-400 block text-[10px]">Grammar & Accuracy</span><strong class="text-white text-sm">${fmtCrit(wc.grammarAccuracy)}</strong></div>
                    </div>
                    ${recentScored.length ? `<div class="pt-1 space-y-1"><p class="text-[11px] font-bold text-slate-400">Xu hướng điểm các bài Writing gần đây:</p>${recentScored.map(s => `<div class="flex justify-between text-[11px]"><span class="text-slate-300 truncate max-w-[70%]">${escHtml(s.title)}</span><strong class="text-emerald-300">${s.totalScore10}/10</strong></div>`).join("")}</div>` : ""}
                </div>
                <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5">
                    <span class="font-extrabold text-rose-300 block">⚠️ Nhóm Lỗi Thường Gặp & SRS Cần Ôn Tập</span>
                    <p class="text-slate-300">Từ cần ôn hôm nay (Due): <strong class="text-amber-300">${stats.srsCounts?.due || 0}</strong> • Từ hay sai (Leech): <strong class="text-rose-300">${stats.srsCounts?.leech || 0}</strong></p>
                    ${(stats.topMistakeCategories && stats.topMistakeCategories.length)
                        ? `<div class="space-y-1.5">${stats.topMistakeCategories.map(m => `<div class="flex justify-between p-2 rounded-lg bg-slate-900"><span class="text-slate-200">${escHtml(m.category)}</span><span class="font-black text-rose-300">${m.count} lần</span></div>`).join("")}</div>`
                        : `<p class="text-slate-500 italic">Chưa ghi nhận lỗi sai hệ thống nào.</p>`}
                </div>
            </div>
        `;
    }

    // Weekly Minutes Chart
    const wkCanvas = document.getElementById("prog-weekly-chart");
    if (wkCanvas && typeof Chart !== "undefined") {
        const labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
        const mins = weekly.thisWeek.minutesByDay.map(d => d.minutes);
        if (weeklyMinutesChartInstance) {
            weeklyMinutesChartInstance.data.datasets[0].data = mins;
            weeklyMinutesChartInstance.update();
        } else {
            weeklyMinutesChartInstance = new Chart(wkCanvas.getContext("2d"), {
                type: "bar",
                data: {
                    labels,
                    datasets: [{
                        label: "Phút học tập",
                        data: mins,
                        backgroundColor: "rgba(6, 182, 212, 0.55)",
                        borderColor: "#06B6D4",
                        borderWidth: 1,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.06)" } },
                        x: { ticks: { color: "#cbd5e1" }, grid: { display: false } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    }

    // 7.3 Adaptive Learning Recommendations
    const adaptBox = document.getElementById("prog-adaptive-box");
    window._adaptiveRecs = recs;
    if (adaptBox) {
        const styleByType = {
            urgent: "border-rose-500/40 bg-rose-500/10",
            remedial: "border-amber-500/40 bg-amber-500/10",
            advance: "border-emerald-500/40 bg-emerald-500/10",
            collecting: "border-cyan-500/30 bg-slate-950/80",
            start: "border-white/10 bg-slate-950/60",
            steady: "border-violet-500/30 bg-violet-500/10"
        };
        adaptBox.innerHTML = recs.map((r, i) => `
            <div class="p-4 rounded-2xl border ${styleByType[r.type] || styleByType.start} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div class="space-y-1">
                    <p class="font-extrabold text-white text-sm">${escHtml(r.title)}</p>
                    <p class="text-slate-300">${escHtml(r.advice)}</p>
                </div>
                <button onclick="window._adaptiveRecs[${i}].actionFn()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-violet-600 text-cyan-300 hover:text-white font-bold border border-white/10 shrink-0 transition">
                    ${escHtml(r.actionLabel)} →
                </button>
            </div>
        `).join("");
    }

    // Activity Log
    const actLog = document.getElementById("activity-log");
    const actEmpty = document.getElementById("activity-empty");
    const acts = progressState.activities || [];
    if (acts.length === 0) {
        if (actLog) actLog.innerHTML = "";
        actEmpty?.classList.remove("hidden");
    } else {
        actEmpty?.classList.add("hidden");
        if (actLog) {
            actLog.innerHTML = acts.slice(0, 30).map(a => `
                <div class="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
                    <div>
                        <span class="font-bold text-white">${escHtml(a.title)}</span>
                        <span class="text-slate-500 ml-2">${new Date(a.at).toLocaleString("vi-VN")}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        ${typeof a.scorePct === "number" ? `<span class="font-extrabold text-cyan-300">${a.scorePct}%</span>` : ""}
                        ${renderSourceBadge(a.source || "local-browser")}
                    </div>
                </div>
            `).join("");
        }
    }
}

/* ==================== SETTINGS, SECURITY & ONBOARDING ==================== */
function renderSettingsAndCMSPage() {
    if (!appSettings) loadSettings();
    const backendInput = document.getElementById("setting-backend-url");
    if (backendInput) backendInput.value = appSettings.backendApiUrl || "/api/ai";
    const consentChk = document.getElementById("setting-ai-consent");
    if (consentChk) consentChk.checked = Boolean(appSettings.aiConsentAccepted);
    const dwInput = document.getElementById("setting-daily-words");
    if (dwInput) dwInput.value = appSettings.dailyWordGoal || 10;
    const dtInput = document.getElementById("setting-daily-time");
    if (dtInput) dtInput.value = appSettings.dailyMinutesGoal || 60;

    AIClient.syncStatusBadges();
    renderCMSContentTable();
}

async function saveBackendSettingsAndTest() {
    const backendApiUrl = (document.getElementById("setting-backend-url")?.value || "/api/ai").trim() || "/api/ai";
    const aiConsentAccepted = Boolean(document.getElementById("setting-ai-consent")?.checked);
    saveSettings({ backendApiUrl, aiConsentAccepted });
    showToast("Đang kiểm tra kết nối tới Backend AI...");
    const st = await AIClient.checkStatus();
    showToast(st.message, st.connected ? "success" : "warning");
}

function saveLearningSettings() {
    const dailyWordGoal = Math.max(1, parseInt(document.getElementById("setting-daily-words")?.value || "10", 10) || 10);
    const dailyMinutesGoal = Math.max(15, parseInt(document.getElementById("setting-daily-time")?.value || "60", 10) || 60);
    saveSettings({ dailyWordGoal, dailyMinutesGoal });
    showToast("Đã lưu mục tiêu học tập hàng ngày!");
}

function exportBackup() {
    exportAllBackupJSON();
}

function exportAllData() {
    exportAllBackupJSON();
}

function importBackup(event) {
    const file = event?.target?.files?.[0];
    importAllBackupJSON(file, () => {
        applyStudyFilter();
        renderWordList();
        refreshDashboardUI();
    });
    if (event?.target) event.target.value = "";
}

function importAllData(event) {
    importBackup(event);
}

function clearAllProgress() {
    if (!confirm("Xác nhận xóa lịch sử tiến độ các bài tập nhưng GIỮ NGUYÊN 100% Kho từ vựng (qenglish_deck_v2) và Sổ tay ghi chú?")) return;
    [STORAGE_KEYS.PROGRESS, STORAGE_KEYS.DASHBOARD, STORAGE_KEYS.GRAMMAR, STORAGE_KEYS.LISTENING, STORAGE_KEYS.SPEAKING, STORAGE_KEYS.READING, STORAGE_KEYS.WRITING, STORAGE_KEYS.SRS].forEach(k => {
        localStorage.removeItem(k);
    });
    loadSRSState();
    loadProgressState();
    refreshDashboardUI();
    renderProgressAnalyticsPage();
    showToast("Đã đặt lại tiến độ học tập (Kho từ vựng và Sổ tay được giữ nguyên an toàn)!");
}

function openOnboardingModal() {
    document.getElementById("onboarding-modal")?.classList.remove("hidden");
}

function closeOnboardingModal() {
    document.getElementById("onboarding-modal")?.classList.add("hidden");
    saveSettings({ onboardingCompleted: true });
}

/* ==================== MULTI-ACCOUNT & GROUP LEADERBOARD UI ==================== */
function syncAccountBadgesUI() {
    const authUser = typeof CloudClient !== "undefined" ? CloudClient.getUser() : null;
    const acc = typeof getActiveAccount === "function" ? getActiveAccount() : null;
    const avatar = authUser?.user_metadata?.avatar || acc?.avatar || "🚀";
    const name = authUser?.user_metadata?.display_name || acc?.name || authUser?.email?.split("@")[0] || "Học viên";
    const subLabel = authUser?.email || (acc ? `@${acc.username}` : "");
    const goal = acc?.goal || "Chinh phục 5 kỹ năng Tiếng Anh";

    const headerBtn = document.getElementById("header-account-btn");
    if (headerBtn) {
        headerBtn.innerHTML = `<span>${escHtml(avatar)}</span><span class="max-w-[110px] truncate">${escHtml(name)}</span><span class="text-[10px] text-cyan-300">▾</span>`;
    }
    const sbName = document.getElementById("sidebar-account-name");
    if (sbName) sbName.textContent = `${avatar} ${name}`;
    const sbGoal = document.getElementById("sidebar-account-goal");
    if (sbGoal) sbGoal.textContent = subLabel || goal;
    const dashBadge = document.getElementById("dash-user-badge");
    if (dashBadge) {
        const modeTag = (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) ? "Cloud" : "Local";
        dashBadge.textContent = `${avatar} ${name} (${subLabel || modeTag})`;
    }
    if (typeof updateCloudSyncBadgeUI === "function") updateCloudSyncBadgeUI();
}

function openAccountModal() {
    syncCurrentAccountSnapshot();
    renderAccountModalUI();
    document.getElementById("account-modal")?.classList.remove("hidden");
}

function closeAccountModal() {
    document.getElementById("account-modal")?.classList.add("hidden");
}

function renderAccountModalUI() {
    const store = loadAccountsStore();
    const active = getActiveAccount();
    const allAccounts = Object.values(store.accounts || {});

    const editName = document.getElementById("acc-edit-name");
    if (editName) editName.value = active.name || "";
    const editGoal = document.getElementById("acc-edit-goal");
    if (editGoal) editGoal.value = active.goal || "";
    const editAvatar = document.getElementById("acc-edit-avatar");
    if (editAvatar) editAvatar.value = active.avatar || "🚀";
    const editPin = document.getElementById("acc-edit-pin");
    if (editPin) editPin.value = active.pin || "";

    const listEl = document.getElementById("accounts-leaderboard-list");
    if (listEl) {
        const sorted = [...allAccounts].sort((a, b) => {
            const sa = a.statsSummary || {};
            const sb = b.statsSummary || {};
            return ((sb.wordsMastered || 0) * 10 + (sb.totalMinutes || 0)) - ((sa.wordsMastered || 0) * 10 + (sa.totalMinutes || 0));
        });

        listEl.innerHTML = sorted.map((acc, idx) => {
            const isCurrent = acc.id === store.activeAccountId;
            const st = acc.statsSummary || {};
            const hasPin = Boolean(acc.pin && String(acc.pin).trim());
            return `
                <div class="p-3.5 rounded-2xl border ${isCurrent ? "bg-violet-600/20 border-violet-400/50" : "bg-slate-950/80 border-white/10"} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shrink-0">
                            ${escHtml(acc.avatar || "🌟")}
                        </div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-extrabold text-white text-sm">#${idx + 1} ${escHtml(acc.name)}</span>
                                <span class="text-slate-400">@${escHtml(acc.username)}</span>
                                ${hasPin ? `<span class="text-amber-300" title="Có mã PIN bảo vệ">🔒</span>` : ""}
                                ${isCurrent ? `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">Đang dùng</span>` : ""}
                            </div>
                            <p class="text-[11px] text-slate-400 mt-0.5">${escHtml(acc.goal || "Chinh phục Tiếng Anh")}</p>
                            <div class="flex flex-wrap gap-3 mt-1 text-[11px] font-bold">
                                <span class="text-amber-300">🔥 ${st.streak || 0} ngày</span>
                                <span class="text-violet-300">📖 ${st.wordsLearned || 0} từ học (${st.wordsMastered || 0} thuộc)</span>
                                <span class="text-cyan-300">⏱️ ${st.totalMinutes || 0} phút</span>
                                ${st.avgScore !== null && st.avgScore !== undefined ? `<span class="text-emerald-300">🎯 TB ${st.avgScore}%</span>` : ""}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        ${!isCurrent ? `
                            <button onclick="handleSwitchAccount('${acc.id}')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold hover:opacity-95 transition">
                                Chuyển vào học →
                            </button>
                            <button onclick="handleDeleteAccount('${acc.id}')" class="p-2 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/30" title="Xóa tài khoản này">🗑️</button>
                        ` : `
                            <button onclick="exportActiveAccountJSON()" class="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                                📥 Tải hồ sơ
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join("");
    }
}

function handleSaveActiveAccountProfile() {
    const name = document.getElementById("acc-edit-name")?.value || "";
    const goal = document.getElementById("acc-edit-goal")?.value || "";
    const avatar = document.getElementById("acc-edit-avatar")?.value || "🚀";
    const pin = document.getElementById("acc-edit-pin")?.value || "";
    updateActiveAccountProfile({ name, goal, avatar, pin });
    syncAccountBadgesUI();
    refreshDashboardUI();
    renderAccountModalUI();
    showToast("Đã cập nhật thông tin tài khoản của bạn!");
}

function handleCreateNewAccountSubmit() {
    const name = (document.getElementById("new-acc-name")?.value || "").trim();
    const username = (document.getElementById("new-acc-username")?.value || "").trim();
    const goal = (document.getElementById("new-acc-goal")?.value || "Giao tiếp & Từ vựng toàn diện").trim();
    const avatar = document.getElementById("new-acc-avatar")?.value || "🌟";
    const pin = (document.getElementById("new-acc-pin")?.value || "").trim();

    const res = createNewUserAccount({ name, username, avatar, goal, pin });
    if (!res.ok) {
        showToast(res.error, "error");
        return;
    }

    document.getElementById("new-acc-name").value = "";
    document.getElementById("new-acc-username").value = "";
    document.getElementById("new-acc-pin").value = "";

    applyStudyFilter();
    renderWordList();
    syncAccountBadgesUI();
    refreshDashboardUI();
    renderAccountModalUI();
    closeAccountModal();
    showToast(`🎉 Đã tạo và chuyển sang tài khoản riêng của "${res.account.name}"!`);
}

function handleSwitchAccount(accountId) {
    const res = switchToUserAccount(accountId);
    if (!res.ok) {
        if (!res.cancelled && res.error) showToast(res.error, "error");
        return;
    }
    applyStudyFilter();
    renderWordList();
    syncAccountBadgesUI();
    navigateTo(activeMainPage, currentVocabSubTab);
    renderAccountModalUI();
    closeAccountModal();
    showToast(`👋 Chào mừng quay lại, ${res.account.name}! Dữ liệu riêng của bạn đã được nạp.`);
}

function handleDeleteAccount(accountId) {
    if (!confirm("Bạn có chắc muốn xóa tài khoản này khỏi thiết bị?")) return;
    const res = deleteUserAccount(accountId);
    if (!res.ok) {
        showToast(res.error, "error");
        return;
    }
    renderAccountModalUI();
    showToast("Đã xóa tài khoản.");
}

function handleImportAccountFile(event) {
    const file = event?.target?.files?.[0];
    importUserAccountJSON(file, () => {
        applyStudyFilter();
        renderWordList();
        syncAccountBadgesUI();
        refreshDashboardUI();
        renderAccountModalUI();
    });
    if (event?.target) event.target.value = "";
}

/* ==================== MASTER AUTHENTICATION & APPLICATION BOOTSTRAP ==================== */
function showAuthScreen({ tab = "login", notice = "", error = "" } = {}) {
    const authOverlay = document.getElementById("auth-screen");
    const appShell = document.getElementById("main-app-shell");
    if (authOverlay) authOverlay.classList.remove("hidden");
    if (appShell) appShell.classList.add("hidden");
    switchAuthTab(tab);

    const noticeEl = document.getElementById("auth-mode-banner");
    if (noticeEl && typeof CloudClient !== "undefined") {
        noticeEl.innerHTML = CloudClient.isCloudMode()
            ? `<div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">☁️ <strong>Chế độ Cloud Sync đã bật (Supabase):</strong> Mỗi tài khoản có không gian lưu trữ độc lập và tự động đồng bộ qua nhiều thiết bị.</div>`
            : `<div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">💾 <strong>Chế độ Cục bộ trên thiết bị này:</strong> Chưa cấu hình Supabase Cloud trên máy chủ. Dữ liệu tài khoản lưu an toàn trong trình duyệt hiện tại.</div>`;
    }
    const localContinueWrap = document.getElementById("auth-local-continue-wrap");
    if (localContinueWrap) {
        const hasLegacy = Boolean(localStorage.getItem("qenglish_deck_v2") || localStorage.getItem("qenglish_deck_v1") || localStorage.getItem("fpt_eng_deck_v3") || localStorage.getItem("qenglish_progress_v1"));
        localContinueWrap.classList.toggle("hidden", (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) || !hasLegacy);
    }
    document.getElementById("auth-resend-wrap")?.classList.add("hidden");
    const msgEl = document.getElementById("auth-feedback-box");
    if (msgEl) {
        if (error) {
            msgEl.className = "p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-200 font-bold";
            msgEl.textContent = error;
            msgEl.classList.remove("hidden");
        } else if (notice) {
            msgEl.className = "p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs text-emerald-200 font-bold";
            msgEl.textContent = notice;
            msgEl.classList.remove("hidden");
        } else {
            msgEl.classList.add("hidden");
        }
    }
}

function hideAuthScreen() {
    document.getElementById("auth-screen")?.classList.add("hidden");
    document.getElementById("main-app-shell")?.classList.remove("hidden");
}

function switchAuthTab(tab) {
    ["login", "signup", "forgot", "recovery"].forEach(t => {
        document.getElementById(`auth-form-${t}`)?.classList.toggle("hidden", t !== tab);
    });
    document.querySelectorAll(".auth-tab-btn").forEach(btn => {
        const active = btn.getAttribute("data-atab") === tab;
        btn.className = `auth-tab-btn flex-1 py-2.5 rounded-xl text-xs font-extrabold transition ${active ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`;
    });
    document.getElementById("auth-feedback-box")?.classList.add("hidden");
}

function setAuthLoading(btnId, loading, idleText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle("opacity-60", loading);
    btn.textContent = loading ? "⏳ Đang xử lý..." : idleText;
}

async function handleAuthLoginSubmit(e) {
    if (e) e.preventDefault();
    const email = document.getElementById("auth-login-email")?.value || "";
    const password = document.getElementById("auth-login-password")?.value || "";
    setAuthLoading("auth-login-submit", true, "🔐 Đăng Nhập Vào QEnglish");
    try {
        const res = await CloudClient.signIn({ email, password });
        if (!res.ok) {
            showAuthScreen({ tab: "login", error: res.error });
            const resendWrap = document.getElementById("auth-resend-wrap");
            if (resendWrap) resendWrap.classList.toggle("hidden", !res.unconfirmed);
            return;
        }
        await bootAuthenticatedWorkspace(res.user);
    } finally {
        setAuthLoading("auth-login-submit", false, "🔐 Đăng Nhập Vào QEnglish");
    }
}

async function handleAuthResendVerification() {
    const email = document.getElementById("auth-login-email")?.value || "";
    const res = await CloudClient.resendVerification(email);
    showAuthScreen({
        tab: "login",
        notice: res.ok ? `Đã gửi lại email xác minh tới ${email}.` : "",
        error: res.ok ? "" : (res.error || "Không gửi lại được email.")
    });
}

async function handleAuthSignUpSubmit(e) {
    if (e) e.preventDefault();
    const displayName = document.getElementById("auth-signup-name")?.value || "";
    const email = document.getElementById("auth-signup-email")?.value || "";
    const password = document.getElementById("auth-signup-password")?.value || "";
    const confirmPw = document.getElementById("auth-signup-confirm")?.value || "";
    const termsAccepted = Boolean(document.getElementById("auth-signup-terms")?.checked);

    if (password !== confirmPw) {
        showAuthScreen({ tab: "signup", error: "Mật khẩu xác nhận không khớp!" });
        return;
    }

    setAuthLoading("auth-signup-submit", true, "🚀 Tạo Tài Khoản Học Tập Riêng");
    try {
        const res = await CloudClient.signUp({ displayName, email, password, termsAccepted });
        if (!res.ok) {
            showAuthScreen({ tab: "signup", error: res.error });
            return;
        }
        if (res.needsVerification) {
            showAuthScreen({ tab: "login", notice: res.message });
            return;
        }
        await bootAuthenticatedWorkspace(res.user);
    } finally {
        setAuthLoading("auth-signup-submit", false, "🚀 Tạo Tài Khoản Học Tập Riêng");
    }
}

async function handleAuthResetRequest(e) {
    if (e) e.preventDefault();
    const email = document.getElementById("auth-forgot-email")?.value || "";
    setAuthLoading("auth-forgot-submit", true, "📧 Gửi Liên Kết Đặt Lại Mật Khẩu");
    try {
        const res = await CloudClient.sendPasswordReset(email);
        showAuthScreen({
            tab: res.ok ? "login" : "forgot",
            notice: res.ok ? res.message : "",
            error: res.ok ? "" : res.error
        });
    } finally {
        setAuthLoading("auth-forgot-submit", false, "📧 Gửi Liên Kết Đặt Lại Mật Khẩu");
    }
}

async function handleAuthNewPasswordSubmit(e) {
    if (e) e.preventDefault();
    const p1 = document.getElementById("auth-recovery-pw1")?.value || "";
    const p2 = document.getElementById("auth-recovery-pw2")?.value || "";
    if (p1 !== p2) {
        showAuthScreen({ tab: "recovery", error: "Mật khẩu xác nhận chưa khớp." });
        return;
    }
    setAuthLoading("auth-recovery-submit", true, "💾 Cập Nhật Mật Khẩu Mới");
    try {
        const res = await CloudClient.updatePasswordWithRecovery(p1);
        if (!res.ok) {
            showAuthScreen({ tab: "recovery", error: res.error });
            return;
        }
        showAuthScreen({ tab: "login", notice: "✅ Đã cập nhật mật khẩu mới thành công! Hãy đăng nhập lại." });
    } finally {
        setAuthLoading("auth-recovery-submit", false, "💾 Cập Nhật Mật Khẩu Mới");
    }
}

async function handleContinueWithExistingLocalDevice() {
    // Safe bridge ONLY in non-cloud offline mode when pre-existing anonymous browser data is present
    const fallbackUser = {
        id: "legacy-device",
        email: "local@device",
        user_metadata: { display_name: "Tài khoản trên thiết bị", avatar: "🚀" }
    };
    await bootAuthenticatedWorkspace(fallbackUser, { useLegacyNamespace: true });
}

async function handleAppLogout() {
    if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) {
        await CloudClient.syncNow();
        await CloudClient.signOut();
    } else if (typeof CloudClient !== "undefined") {
        await CloudClient.signOut();
    }
    resetInMemoryWorkspaceState();
    closeAccountModal();
    showAuthScreen({ tab: "login", notice: "Bạn đã đăng xuất an toàn. Dữ liệu tài khoản đã được bảo vệ riêng tư." });
}

async function bootAuthenticatedWorkspace(user, options = {}) {
    resetInMemoryWorkspaceState();
    window.__QENGLISH_AUTH_USER = user;
    window.__QENGLISH_ACTIVE_UID = options.useLegacyNamespace ? null : user.id;

    hideAuthScreen();

    // Pull cloud data if authenticated against Supabase Cloud
    if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode() && user.id) {
        await CloudClient.upsertProfile(user);
        const cloud = await CloudClient.fetchCloudWorkspace(user.id);
        if (cloud.ok && cloud.snapshot) {
            applyWorkspaceSnapshotToLocal(cloud.snapshot);
            if (cloud.isLegacyTable) {
                CloudClient.scheduleCloudSync();
            }
        }
    }

    loadAccountsStore();
    loadSettings();
    loadDeckFromStorage();
    loadSRSState();
    loadProgressState();
    loadNotebook();
    loadCMSItems();

    // Prompt safe non-destructive migration ONLY if pre-upgrade anonymous browser data exists for first time
    if (window.__QENGLISH_ACTIVE_UID) {
        const legSummary = detectLegacyUnscopedDataSummary(window.__QENGLISH_ACTIVE_UID);
        if (legSummary) {
            window._pendingLegacyMigrationUid = window.__QENGLISH_ACTIVE_UID;
            const summaryTxt = document.getElementById("legacy-migration-summary");
            if (summaryTxt) {
                summaryTxt.textContent = `Phát hiện dữ liệu học tập cũ trên trình duyệt (${legSummary.wordCount} từ vựng, ${legSummary.noteCount} ghi chú, ${legSummary.writingCount} bài Writing, ${legSummary.materialCount} tài liệu).`;
            }
            document.getElementById("legacy-migration-modal")?.classList.remove("hidden");
        }
    }

    syncAccountBadgesUI();
    syncCurrentAccountSnapshot();

    speechRate = appSettings.speechRate || 1.0;
    autoPlay = appSettings.autoPlay !== false;
    const speedSel = document.getElementById("speed-select");
    if (speedSel) speedSel.value = String(speechRate);
    const autoTxt = document.getElementById("autoplay-text");
    if (autoTxt) autoTxt.textContent = autoPlay ? "Tự Đọc: Bật" : "Tự Đọc: Tắt";
    const glSel = document.getElementById("global-level");
    if (glSel && appSettings.selectedLevel) {
        const exists = [...glSel.options].some(o => o.value === appSettings.selectedLevel);
        if (exists) glSel.value = appSettings.selectedLevel;
    }

    applyStudyFilter();
    renderWordList();
    setupRealStudyTimer();
    refreshDashboardUI();
    navigateTo("dashboard");
    AIClient.checkStatus();

    if (!appSettings.onboardingCompleted) {
        openOnboardingModal();
    }
}

function confirmMigrateLegacyToAccount() {
    const uid = window._pendingLegacyMigrationUid || window.__QENGLISH_ACTIVE_UID;
    if (uid) {
        migrateLegacyUnscopedDataToCurrentUser(uid);
        applyStudyFilter();
        renderWordList();
        refreshDashboardUI();
        showToast("✅ Đã gộp an toàn dữ liệu cũ vào tài khoản của bạn mà không mất dữ liệu nào!");
    }
    document.getElementById("legacy-migration-modal")?.classList.add("hidden");
}

function dismissLegacyMigrationModal() {
    const uid = window._pendingLegacyMigrationUid || window.__QENGLISH_ACTIVE_UID;
    if (uid) localStorage.setItem(`qenglish_legacy_prompted_${uid}`, "skipped");
    document.getElementById("legacy-migration-modal")?.classList.add("hidden");
}

async function runAILearningAssistant() {
    const outBox = document.getElementById("dash-ai-assistant-output");
    if (!outBox) return;
    outBox.classList.remove("hidden");
    outBox.innerHTML = `<div class="p-4 rounded-2xl bg-slate-950 border border-violet-500/35 text-xs text-violet-300 font-bold animate-pulse">⏳ Trợ lý học tập AI đang phân tích riêng dữ liệu học tập thực tế của bạn...</div>`;

    const stats = computeOverallAnalytics();
    const res = await AIClient.request("learning-assistant", {
        summary: {
            totalDaysStudied: stats.totalDaysStudied,
            streak: stats.streak,
            totalMinutes: stats.totalMinutes,
            wordsLearned: stats.wordsLearned,
            wordsMastered: stats.wordsMastered,
            srsDue: stats.srsCounts?.due || 0,
            srsLeech: stats.srsCounts?.leech || 0,
            skillsCompletionPct: stats.skills,
            writingAvg10: stats.writingAvg10,
            writingCriteriaAvg: stats.writingCriteriaAvg,
            topMistakeCategories: stats.topMistakeCategories,
            targetLevel: appSettings?.selectedLevel || "B1"
        }
    });

    if (!res.ok || !res.data) {
        outBox.innerHTML = `
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
                <div class="flex justify-between">
                    <span class="font-extrabold text-amber-300">🛠️ Đề xuất cục bộ từ dữ liệu thực (AI Backend chưa kết nối)</span>
                    <button onclick="document.getElementById('dash-ai-assistant-output').classList.add('hidden')" class="text-slate-400">✕</button>
                </div>
                <p class="text-slate-200">Từ cần ôn SRS: <strong class="text-amber-300">${stats.srsCounts?.due || 0}</strong> • Bài Writing đã chấm: <strong class="text-cyan-300">${stats.writingSubmissionsCount}</strong></p>
                <p class="text-slate-400">${escHtml(res.error || "Kết nối AI Backend để nhận lộ trình học 7 ngày cá nhân hóa.")}</p>
            </div>
        `;
        return;
    }

    const d = res.data;
    outBox.innerHTML = `
        <div class="p-5 rounded-2xl bg-slate-950 border border-violet-500/35 space-y-3 text-xs">
            <div class="flex items-center justify-between gap-2 flex-wrap">
                <div>
                    <span class="font-extrabold text-violet-300 text-sm">🤖 Trợ Lý AI Cá Nhân Hóa</span>
                    <span class="ml-2 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold">Tham khảo: ${escHtml(d.estimatedLevelReference || "—")}</span>
                </div>
                <button onclick="document.getElementById('dash-ai-assistant-output').classList.add('hidden')" class="text-slate-400 hover:text-white">✕</button>
            </div>
            <p class="text-slate-200 leading-relaxed">${escHtml(d.diagnosisVi || "")}</p>
            ${(d.priorityFocus && d.priorityFocus.length) ? `<p class="text-amber-300"><strong>Ưu tiên trọng tâm:</strong> ${d.priorityFocus.map(p => escHtml(p)).join(" • ")}</p>` : ""}
            ${(d.recommendedNextSteps && d.recommendedNextSteps.length) ? `
                <div class="grid sm:grid-cols-2 gap-2">
                    ${d.recommendedNextSteps.map(st => `<div class="p-2.5 rounded-xl bg-slate-900 border border-white/10"><strong class="text-emerald-300">${escHtml(st.day)} (${escHtml(st.skill)} • ${st.minutes || 20}p):</strong> <span class="text-slate-300">${escHtml(st.taskVi)}</span></div>`).join("")}
                </div>
            ` : ""}
        </div>
    `;
}

window.addEventListener("DOMContentLoaded", async () => {
    setupVocabularyKeyboardShortcuts();
    const readingTextEl = document.getElementById("reading-passage-text");
    if (readingTextEl) {
        readingTextEl.addEventListener("dblclick", () => handlePassageWordLookup());
    }

    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && typeof CloudClient !== "undefined" && CloudClient.isCloudMode() && window.__QENGLISH_ACTIVE_UID) {
            CloudClient.syncNow();
        }
    });
    window.addEventListener("online", () => {
        if (typeof CloudClient !== "undefined" && CloudClient.isCloudMode() && window.__QENGLISH_ACTIVE_UID) {
            CloudClient.syncNow();
        }
    });

    if (typeof CloudClient !== "undefined") {
        const sess = await CloudClient.restoreSession();
        if (sess.recoveryMode) {
            showAuthScreen({ tab: "recovery", notice: "Xác thực liên kết thành công. Hãy nhập mật khẩu mới của bạn." });
            return;
        }
        if (sess.error) {
            showAuthScreen({ tab: "login", error: sess.error });
            return;
        }
        if (sess.restored && sess.user) {
            await bootAuthenticatedWorkspace(sess.user);
            if (sess.emailConfirmed) showToast("✅ Email của bạn đã được xác minh thành công!");
            return;
        }
    }

    showAuthScreen({ tab: "login" });
});





/* ==========================================================================
   MY LEARNING MATERIALS & RESOURCE IMPORT (HẠNG MỤC 4, 5, 6, 7)
   Central Hub for Teacher Homework, Personal Passages, Audio, Prompts & URL Extractor
   ========================================================================== */

function renderMaterialsPageTable() {
    if (!cmsItems.length) loadCMSItems();
    const list = document.getElementById("materials-explorer-list");
    if (!list) return;

    const search = (document.getElementById("mat-filter-search")?.value || "").toLowerCase().trim();
    const skillFilter = document.getElementById("mat-filter-skill")?.value || "all";
    const statusFilter = document.getElementById("mat-filter-status")?.value || "all";

    const filtered = cmsItems.filter(item => {
        const hay = `${item.title} ${item.topic} ${item.skill} ${item.contentText || ""}`.toLowerCase();
        const matchesSearch = !search || hay.includes(search);
        const matchesSkill = skillFilter === "all" || item.skill === skillFilter;
        const matchesStatus = statusFilter === "all" || (item.studyStatus || "not_started") === statusFilter;
        return matchesSearch && matchesSkill && matchesStatus;
    });

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="p-8 text-center glass-panel rounded-2xl space-y-2">
                <div class="text-4xl">📚</div>
                <p class="font-bold text-white">Chưa có tài liệu cá nhân nào phù hợp bộ lọc</p>
                <p class="text-xs text-slate-400">Hãy dùng các ô tải file, dán bài hoặc trích xuất URL ở phía trên để thêm học liệu riêng của bạn!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(item => {
        const status = item.studyStatus || "not_started";
        const statusBadge = status === "completed"
            ? '<span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/25">✅ Đã hoàn thành</span>'
            : (status === "in_progress"
                ? '<span class="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/25">⏳ Đang học</span>'
                : '<span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-white/10">🆕 Chưa học</span>');

        return `
            <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3 hover:border-violet-500/40 transition">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-extrabold text-white text-sm">${escHtml(item.title)}</span>
                        ${renderLevelBadge(item.level)}
                        <span class="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">${escHtml(item.skill)}</span>
                        ${renderSourceBadge(item.source)}
                        ${statusBadge}
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5">
                        <button onclick='launchMaterialPracticeSession(${JSON.stringify(item.id)})' class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-violet-500 hover:to-indigo-500 transition">
                            🚀 Vào Luyện Tập Ngay
                        </button>
                        <button onclick='cycleMaterialStatus(${JSON.stringify(item.id)})' class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-emerald-300 text-xs font-bold hover:bg-slate-800 transition" title="Đổi trạng thái học">
                            ✓
                        </button>
                        <button onclick='openEditMaterialModal(${JSON.stringify(item.id)})' class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-cyan-300 text-xs font-bold hover:bg-slate-800 transition" title="Sửa tên, nội dung hoặc phân loại">
                            ✏️
                        </button>
                        <button onclick='deleteMaterialItem(${JSON.stringify(item.id)})' class="px-2.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition">
                            ✕
                        </button>
                    </div>
                </div>
                <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">${escHtml(item.contentText || (item.payload && (item.payload.passage || item.payload.prompt || item.payload.transcript)) || "")}</p>
                <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-white/5">
                    <span>Thư mục: <strong class="text-slate-300">${escHtml(item.topic || "General")}</strong>${item.payload?.cloudStoragePath ? ` • <span class="text-emerald-400">☁️ Cloud Storage</span>` : ""}</span>
                    <span>Thêm ngày: ${new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
            </div>
        `;
    }).join("");
}

function cycleMaterialStatus(id) {
    const item = cmsItems.find(x => x.id === id);
    if (!item) return;
    const order = ["not_started", "in_progress", "completed"];
    const nextIdx = (order.indexOf(item.studyStatus || "not_started") + 1) % order.length;
    item.studyStatus = order[nextIdx];
    item.updatedAt = new Date().toISOString();
    saveCMSItems();
    renderMaterialsPageTable();
}

function openEditMaterialModal(id) {
    const item = cmsItems.find(x => x.id === id);
    if (!item) return;
    window._editingMaterialId = id;
    const modal = document.getElementById("material-edit-modal");
    if (!modal) return;
    document.getElementById("mat-edit-title").value = item.title || "";
    document.getElementById("mat-edit-topic").value = item.topic || "";
    document.getElementById("mat-edit-level").value = item.level || "B1";
    document.getElementById("mat-edit-body").value = item.contentText || item.payload?.passage || item.payload?.prompt || item.payload?.transcript || "";
    modal.classList.remove("hidden");
}

function saveEditedMaterialModal() {
    const id = window._editingMaterialId;
    const item = cmsItems.find(x => x.id === id);
    if (!item) return;
    const newTitle = (document.getElementById("mat-edit-title")?.value || "").trim();
    const newTopic = (document.getElementById("mat-edit-topic")?.value || "").trim() || "Personal";
    const newLevel = document.getElementById("mat-edit-level")?.value || "B1";
    const newBody = (document.getElementById("mat-edit-body")?.value || "").trim();
    if (!newTitle) {
        showToast("Tên tài liệu không được để trống!", "error");
        return;
    }
    item.title = newTitle;
    item.topic = newTopic;
    item.level = newLevel;
    item.contentText = newBody;
    item.updatedAt = new Date().toISOString();
    if (item.payload) {
        item.payload.title = newTitle;
        item.payload.topic = newTopic;
        item.payload.level = newLevel;
        if (item.skill === "reading") item.payload.passage = newBody;
        if (item.skill === "writing" || item.skill === "speaking") item.payload.prompt = newBody;
        if (item.skill === "listening") {
            item.payload.transcript = newBody;
            item.payload.audioText = newBody;
            item.payload.sentences = (newBody.match(/[^.!?]+[.!?]+/g) || [newBody]).map(s => s.trim()).filter(Boolean);
        }
        if (item.skill === "grammar") item.payload.explanation = newBody;
    }
    saveCMSItems();
    document.getElementById("material-edit-modal")?.classList.add("hidden");
    renderMaterialsPageTable();
    showToast("Đã cập nhật tài liệu thành công!");
}

async function launchMaterialPracticeSession(id) {
    if (!cmsItems.length) loadCMSItems();
    const item = cmsItems.find(x => x.id === id);
    if (!item) return;

    item.studyStatus = "in_progress";
    saveCMSItems();

    // Resolve signed URL if asset was stored on Supabase Cloud Storage
    if (item.payload?.cloudStoragePath && typeof CloudClient !== "undefined" && CloudClient.isCloudMode()) {
        const signed = await CloudClient.getSignedStorageUrl(item.payload.cloudStoragePath);
        if (signed) {
            if (item.payload.isPdfUpload) {
                if (!window.sessionPdfUrls) window.sessionPdfUrls = {};
                window.sessionPdfUrls[item.id] = signed;
            } else if (item.skill === "listening") {
                if (!window.sessionAudioBlobUrls) window.sessionAudioBlobUrls = {};
                window.sessionAudioBlobUrls[item.id] = signed;
            } else {
                if (!window.sessionImageUrls) window.sessionImageUrls = {};
                window.sessionImageUrls[item.id] = signed;
            }
        }
    }

    const skill = item.skill;
    if (skill === "writing") {
        navigateTo("writing");
        openWritingEditor(item.id, item.payload || {
            id: item.id,
            title: item.title,
            level: item.level,
            prompt: item.contentText,
            minWords: 80,
            timeLimit: 25
        });
    } else if (skill === "reading") {
        navigateTo("reading");
        openReadingPassage(item.id, item.payload || null);
    } else if (skill === "listening") {
        navigateTo("listening");
        openListeningExercise(item.id, item.payload || null);
    } else if (skill === "speaking") {
        navigateTo("speaking");
        openTopicSpeakingWorkspace(item.id, item.payload || null);
    } else if (skill === "grammar") {
        navigateTo("grammar");
        openGrammarLesson(item.id);
    }
}

function deleteMaterialItem(id) {
    if (!confirm("Xóa tài liệu này khỏi kho học liệu cá nhân của bạn?")) return;
    cmsItems = cmsItems.filter(x => x.id !== id);
    saveCMSItems();
    renderMaterialsPageTable();
    showToast("Đã xóa tài liệu khỏi kho cá nhân.");
}

async function extractContentFromUrlChannel() {
    const url = (document.getElementById("mat-url-input")?.value || "").trim();
    const skill = document.getElementById("mat-url-skill")?.value || "reading";
    const level = document.getElementById("mat-url-level")?.value || "B1";
    const previewBox = document.getElementById("mat-url-preview-box");

    if (!url) {
        showToast("Vui lòng nhập địa chỉ URL bài học cần trích xuất!", "error");
        return;
    }

    if (previewBox) {
        previewBox.classList.remove("hidden");
        previewBox.innerHTML = `<p class="text-xs text-cyan-300 font-bold animate-pulse">🌐 Đang kiểm tra URL và trích xuất nội dung bài học an toàn...</p>`;
    }

    const res = await AIClient.request("extract-url", { url });
    if (!res.ok || !res.data) {
        if (previewBox) {
            previewBox.innerHTML = `
                <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                    <p class="font-bold">⚠️ Trích xuất trực tiếp chưa hoàn tất: ${escHtml(res.error || "Không thể tải từ URL.")}</p>
                    <p class="text-slate-300">Lưu ý kỹ thuật: Tính năng trích xuất URL cần chạy qua Backend Server (Vercel <code>/api/ai/extract-url</code> hoặc <code>node server.js</code>) và không vượt qua trang yêu cầu đăng nhập/paywall. Bạn luôn có thể sao chép văn bản bài học và dán trực tiếp vào ô <strong>Phương thức 2: Dán Đề Bài Thủ Công</strong> bên cạnh để luyện tập ngay lập tức!</p>
                </div>
            `;
        }
        return;
    }

    const ext = res.data;
    const textBody = String(ext.extractedText || "").trim();
    const sents = (textBody.match(/[^.!?]+[.!?]+/g) || [textBody]).map(s => s.trim()).filter(Boolean);
    let urlPayload = { questions: [] };
    if (skill === "reading") {
        urlPayload = { passage: textBody, questions: [] };
    } else if (skill === "listening") {
        urlPayload = { type: "dictation", transcript: textBody, audioText: textBody, sentences: sents, questions: [] };
    } else if (skill === "writing") {
        urlPayload = { type: "essay", prompt: `Dựa vào tài liệu từ "${ext.title}":\n\n${textBody}`, minWords: 80, timeLimit: 25 };
    } else if (skill === "speaking") {
        urlPayload = { type: "monologue", prompt: `Tóm tắt và nêu quan điểm của bạn về bài đọc "${ext.title}": ${textBody.slice(0, 400)}`, suggestedQuestions: ["What is the main point of this article?", "Do you agree with the key ideas? Why?"], duration: 90 };
    } else if (skill === "grammar") {
        urlPayload = { intro: ext.hostname || "Web Resource", explanation: textBody, formula: "Tài liệu ngữ pháp từ URL", examples: [], commonMistakes: [], exercises: [] };
    }

    const candidatePayload = {
        skill,
        level,
        title: ext.title || "Tài liệu học từ URL",
        topic: ext.hostname || "Web Resource",
        contentText: textBody,
        source: "external-link",
        sourceUrl: ext.url,
        payload: urlPayload
    };

    window.lastExtractedCandidate = candidatePayload;

    if (previewBox) {
        previewBox.innerHTML = `
            <div class="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2.5 text-xs">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-emerald-300">✅ Đã trích xuất thành công (${ext.wordCount} từ)</span>
                    <span class="text-slate-400 font-mono text-[10px]">${escHtml(ext.hostname)}</span>
                </div>
                <p class="font-extrabold text-white text-sm">${escHtml(ext.title)}</p>
                <p class="text-slate-300 line-clamp-3 leading-relaxed">${escHtml(ext.extractedText)}</p>
                <div class="flex items-center gap-2 pt-1">
                    <button onclick="confirmSaveExtractedMaterial()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition">
                        💾 Lưu Ngay Vào Kho Học Liệu
                    </button>
                    <button onclick="document.getElementById('mat-url-preview-box').classList.add('hidden')" class="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition">
                        Đóng
                    </button>
                </div>
            </div>
        `;
    }
}

function confirmSaveExtractedMaterial() {
    if (!window.lastExtractedCandidate) return;
    const c = window.lastExtractedCandidate;
    const saved = addCMSContent(c);
    if (!saved.ok) {
        showToast("Chống trùng lặp: " + saved.error, "error");
        return;
    }
    window.lastExtractedCandidate = null;
    document.getElementById("mat-url-preview-box")?.classList.add("hidden");
    const input = document.getElementById("mat-url-input");
    if (input) input.value = "";
    renderMaterialsPageTable();
    showToast(`Đã lưu tài liệu "${c.title}" vào kho của bạn!`);
}

function saveManualMaterialChannel() {
    const title = (document.getElementById("mat-manual-title")?.value || "").trim();
    const skill = document.getElementById("mat-manual-skill")?.value || "writing";
    const level = document.getElementById("mat-manual-level")?.value || "B1";
    const folder = (document.getElementById("mat-manual-folder")?.value || "Bài tập cá nhân").trim();
    const body = (document.getElementById("mat-manual-body")?.value || "").trim();

    if (!title || !body) {
        showToast("Vui lòng nhập đầy đủ Tên tài liệu và Nội dung!", "error");
        return;
    }

    let payload = {};
    if (skill === "reading") {
        payload = { passage: body, questions: [] };
    } else if (skill === "listening") {
        const sents = (body.match(/[^.!?]+[.!?]+/g) || [body]).map(s => s.trim()).filter(Boolean);
        payload = {
            type: "dictation",
            transcript: body,
            audioText: body,
            sentences: sents,
            questions: []
        };
    } else if (skill === "writing") {
        payload = {
            type: "essay",
            prompt: body,
            minWords: 60,
            maxWords: 250,
            timeLimit: 30
        };
    } else if (skill === "speaking") {
        payload = {
            type: "monologue",
            prompt: body,
            suggestedQuestions: ["Can you explain your perspective on this topic?", "Give a specific example from your experience."],
            duration: 90
        };
    } else if (skill === "grammar") {
        payload = {
            intro: folder,
            explanation: body,
            formula: "Grammar Formula",
            examples: [],
            commonMistakes: [],
            exercises: []
        };
    }

    const res = addCMSContent({
        skill,
        level,
        title,
        topic: folder,
        contentText: body,
        source: "user-imported",
        payload
    });

    if (!res.ok) {
        showToast("Chống trùng lặp: " + res.error, "error");
        return;
    }

    const titleEl = document.getElementById("mat-manual-title");
    const bodyEl = document.getElementById("mat-manual-body");
    if (titleEl) titleEl.value = "";
    if (bodyEl) bodyEl.value = "";

    renderMaterialsPageTable();
    showToast(`Đã lưu "${title}" vào kho tài liệu ${skill.toUpperCase()}!`);
}

function attachCloudUploadAsync(file, record) {
    if (!file || !record || typeof CloudClient === "undefined" || !CloudClient.isCloudMode()) return;
    CloudClient.uploadMaterialFile(file, record.id).then(up => {
        if (up.ok && up.storagePath) {
            record.payload = { ...(record.payload || {}), cloudStoragePath: up.storagePath, mimeType: file.type || "", fileSize: file.size };
            saveCMSItems();
            renderMaterialsPageTable();
        }
    }).catch(() => {});
}

function handleMaterialFileUpload(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;

    // File limit check (10MB Cloud / 15MB Local)
    if (file.size > 15 * 1024 * 1024) {
        showToast("Dung lượng file vượt quá giới hạn 15MB cho phép!", "error");
        if (event?.target) event.target.value = "";
        return;
    }

    const name = file.name;
    const lowerName = name.toLowerCase();
    const baseTitle = name.replace(/\.[^.]+$/, "");
    const isWriting = /writing|essay|task|de\s*bai/i.test(name);

    // 1. Plain UTF-8 text formats
    if (/\.(txt|md|csv|srt|vtt)$/i.test(lowerName)) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const cleanText = String(e.target.result || "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ").trim();
            if (!cleanText) {
                showToast("Tệp văn bản trống!", "error");
                return;
            }
            const skill = isWriting ? "writing" : "reading";
            const res = addCMSContent({
                skill,
                level: "B1",
                title: `[Tập tin] ${baseTitle}`,
                topic: "Tài liệu tải lên",
                contentText: cleanText.slice(0, 5000),
                source: "user-imported",
                payload: skill === "writing"
                    ? { type: "essay", prompt: cleanText.slice(0, 3000), minWords: 80, timeLimit: 25 }
                    : { passage: cleanText.slice(0, 5000), questions: [] }
            });
            if (!res.ok) { showToast("Chống trùng lặp: " + res.error, "error"); return; }
            renderMaterialsPageTable();
            showToast(`Đã tải lên và lưu tài liệu "${baseTitle}"!`);
        };
        reader.readAsText(file, "utf-8");
    } else if (lowerName.endsWith(".pdf")) {
        // Honest PDF viewer support via session Blob URL (avoids garbled binary readAsText)
        const itemId = `cms-${isWriting ? "writing" : "reading"}-${Date.now()}`;
        if (!window.sessionPdfUrls) window.sessionPdfUrls = {};
        window.sessionPdfUrls[itemId] = URL.createObjectURL(file);
        const skill = isWriting ? "writing" : "reading";
        const noteText = `Tài liệu PDF cá nhân: ${name} (${Math.round(file.size / 1024)} KB). Bấm Vào Luyện Tập Ngay để xem trực tiếp file PDF trong phiên làm việc này (copy-paste đoạn văn vào Dán Đề Bài Thủ Công nếu muốn tra từ hoặc chấm AI).`;
        const res = addCMSContent({
            id: itemId,
            skill,
            level: "B1",
            title: `[PDF] ${baseTitle}`,
            topic: "Tài liệu PDF tải lên",
            contentText: noteText,
            source: "user-imported",
            payload: skill === "writing"
                ? { type: "essay", prompt: noteText, isPdfUpload: true, minWords: 80, timeLimit: 25 }
                : { passage: noteText, isPdfUpload: true, questions: [] }
        });
        if (!res.ok) { showToast("Chống trùng lặp: " + res.error, "error"); return; }
        attachCloudUploadAsync(file, res.record);
        renderMaterialsPageTable();
        showToast(`Đã thêm "${baseTitle}" (.pdf). Mở ngay trong phiên này để xem PDF trực tiếp!`);
    } else if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx")) {
        // Honest Word handling: do not store corrupted binary ZIP bytes
        const manualTitle = document.getElementById("mat-manual-title");
        const manualBody = document.getElementById("mat-manual-body");
        if (manualTitle && !manualTitle.value.trim()) manualTitle.value = baseTitle;
        if (manualBody) manualBody.focus();
        showToast("File .doc/.docx là định dạng nén Word: vui lòng copy nội dung trong Word và dán vào ô 'Dán Đề Bài Thủ Công' ngay bên cạnh để tránh lỗi font!", "warning");
    } else if (/\.(mp3|wav|ogg|m4a)$/i.test(lowerName)) {
        const itemId = `cms-listening-${Date.now()}`;
        const saveAudioItem = (audioUrl, persistent) => {
            const res = addCMSContent({
                id: itemId,
                skill: "listening",
                level: "B1",
                title: `[Audio] ${baseTitle}`,
                topic: "File âm thanh cá nhân",
                contentText: `File âm thanh thật: ${name} (${Math.round(file.size / 1024)} KB)${persistent ? " — Đã lưu ngoại tuyến trên trình duyệt." : " — Phát trực tiếp trong phiên hiện tại."}`,
                source: "user-imported",
                payload: {
                    type: "multiple_choice",
                    audioUrl,
                    isLocalAudioOnly: true,
                    audioText: "",
                    transcript: "",
                    sentences: [],
                    questions: []
                }
            });
            if (!res.ok) { showToast("Chống trùng lặp: " + res.error, "error"); return; }
            attachCloudUploadAsync(file, res.record);
            renderMaterialsPageTable();
            showToast(`Đã thêm file nghe "${baseTitle}" vào mục Listening!`);
        };

        if (file.size <= 1.8 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = String(e.target.result || "");
                saveAudioItem(dataUrl, true);
            };
            reader.readAsDataURL(file);
        } else {
            if (!window.sessionAudioBlobUrls) window.sessionAudioBlobUrls = {};
            window.sessionAudioBlobUrls[itemId] = URL.createObjectURL(file);
            saveAudioItem(window.sessionAudioBlobUrls[itemId], false);
        }
    } else if (file.type && file.type.startsWith("image/")) {
        const skill = isWriting ? "writing" : "reading";
        const itemId = `cms-${skill}-${Date.now()}`;
        const saveImgItem = (imgUrl, persistent) => {
            const noteText = `Ảnh đề bài: ${name} (${Math.round(file.size / 1024)} KB). Mở để xem trực tiếp ảnh và làm bài.`;
            const res = addCMSContent({
                id: itemId,
                skill,
                level: "B1",
                title: `[Ảnh] ${baseTitle}`,
                topic: "Ảnh chụp đề bài giáo viên",
                contentText: noteText,
                source: "user-imported",
                payload: skill === "writing"
                    ? { type: "essay", prompt: noteText, imageDataUrl: persistent ? imgUrl : "", minWords: 80, timeLimit: 25 }
                    : { passage: noteText, imageDataUrl: persistent ? imgUrl : "", questions: [] }
            });
            if (!res.ok) { showToast("Chống trùng lặp: " + res.error, "error"); return; }
            attachCloudUploadAsync(file, res.record);
            renderMaterialsPageTable();
            showToast(`Đã thêm ảnh đề bài "${baseTitle}"!`);
        };

        if (file.size <= 1.5 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = (e) => saveImgItem(String(e.target.result || ""), true);
            reader.readAsDataURL(file);
        } else {
            if (!window.sessionImageUrls) window.sessionImageUrls = {};
            window.sessionImageUrls[itemId] = URL.createObjectURL(file);
            saveImgItem(window.sessionImageUrls[itemId], false);
        }
    } else {
        showToast("Định dạng file chưa được hỗ trợ trực tiếp. Hãy dùng .txt, .pdf, ảnh (.png/.jpg) hoặc audio (.mp3/.wav).", "warning");
    }

    if (event?.target) event.target.value = "";
}

/* ==================== CUSTOM PASSAGE / TOPIC LAUNCHERS FOR SKILLS ==================== */
function openCustomReadingPassage() {
    const title = (document.getElementById("reading-custom-title")?.value || "").trim() || "Bài đọc của tôi";
    const body = (document.getElementById("reading-custom-body")?.value || "").trim();
    if (!body) {
        showToast("Vui lòng dán đoạn văn bản tiếng Anh để bắt đầu đọc!", "error");
        return;
    }
    const customId = "custom-r-" + Date.now();
    const customPassage = {
        id: customId,
        title,
        level: "B1",
        topic: "Tài liệu của tôi",
        passage: body,
        questions: []
    };
    window.lastCustomReadingPassage = customPassage;
    openReadingPassage(customId, customPassage);
}

function openCustomListeningExercise() {
    const title = (document.getElementById("listening-custom-title")?.value || "").trim() || "Bài nghe của tôi";
    const body = (document.getElementById("listening-custom-transcript")?.value || "").trim();
    if (!body) {
        showToast("Vui lòng dán transcript hoặc lời thoại để hệ thống phát âm luyện nghe!", "error");
        return;
    }
    const sents = (body.match(/[^.!?]+[.!?]+/g) || [body]).map(s => s.trim()).filter(Boolean);
    const customId = "custom-l-" + Date.now();
    const customItem = {
        id: customId,
        title,
        level: "B1",
        type: "dictation",
        topic: "Tài liệu của tôi",
        audioText: body,
        transcript: body,
        sentences: sents,
        questions: []
    };
    window.lastCustomListeningExercise = customItem;
    openListeningExercise(customId, customItem);
}

function openCustomSpeakingTopic() {
    const title = (document.getElementById("speaking-custom-title")?.value || "").trim() || "Chủ đề nói của tôi";
    const prompt = (document.getElementById("speaking-custom-prompt")?.value || "").trim() || title;
    const customId = "custom-s-" + Date.now();
    const customTopic = {
        id: customId,
        title,
        level: "B1",
        type: "monologue",
        prompt,
        promptVi: "",
        duration: 90,
        suggestedQuestions: [
            "What are the main aspects of this topic?",
            "Can you provide a concrete example?",
            "How does this impact your daily life or studies?"
        ],
        usefulPhrases: ["From my perspective...", "A prime example is...", "In conclusion..."],
        sampleAnswer: ""
    };
    window.lastCustomSpeakingTopic = customTopic;
    openTopicSpeakingWorkspace(customId, customTopic);
}
