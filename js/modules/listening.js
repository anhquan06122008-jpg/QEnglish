/* ==========================================================================
   QEnglish - Listening Module (4 Modes, 0.5x-1.5x Player, History & Accuracy)
   ========================================================================== */

let activeListeningItem = null;
let listeningSpeed = 1.0;
let listeningSentenceCursor = 0;
let listeningIsPlaying = false;
let dictationIdx = 0;
let dictationScores = [];
let fullTestTimerId = null;
let fullTestRemainingSec = 0;

function getListeningState() {
    return safeParseJSON(localStorage.getItem(STORAGE_KEYS.LISTENING), { completedIds: [], history: [] });
}

function saveListeningState(st) {
    safeWriteJSON(STORAGE_KEYS.LISTENING, st);
}

function filterListeningExercises() {
    const lvFilter = document.getElementById("listening-level-filter")?.value || "all";
    const modeFilter = document.getElementById("listening-mode-filter")?.value || "all";
    const listEl = document.getElementById("listening-list");
    if (!listEl) return;

    const allItems = getAllContentForSkill("listening");
    const st = getListeningState();

    // Update Listening overall stats bar
    const statsBar = document.getElementById("listening-stats-summary");
    if (statsBar) {
        const hist = st.history || [];
        const avgAcc = hist.length > 0 ? Math.round(hist.reduce((a, b) => a + b.scorePct, 0) / hist.length) : null;
        statsBar.innerHTML = `
            <span>🎧 Đã hoàn thành: <strong class="text-white">${(st.completedIds || []).length}/${allItems.length}</strong> bài</span>
            <span>🎯 Tỷ lệ đúng trung bình: <strong class="text-cyan-300">${avgAcc !== null ? avgAcc + "%" : "Chưa có"}</strong> (${hist.length} lượt làm)</span>
        `;
    }

    const filtered = allItems.filter(it => {
        const matchLv = matchesSelectedLevel(it.level || "B1", lvFilter);
        const matchMode = modeFilter === "all" || it.type === modeFilter;
        return matchLv && matchMode;
    });

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="col-span-full glass-panel rounded-2xl p-8 text-center space-y-3">
                <div class="text-4xl">🎧</div>
                <p class="font-bold text-white">Chưa có bài nghe khớp với "${escHtml(lvFilter)}" (${escHtml(modeFilter)})</p>
                <p class="text-xs text-slate-400">Bạn có thể chọn "Tất cả Level" hoặc thêm bài nghe mới trong Quản lý Nội dung.</p>
                <button onclick="document.getElementById('listening-level-filter').value='all'; document.getElementById('listening-mode-filter').value='all'; filterListeningExercises();" class="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Hiển thị tất cả ${allItems.length} bài nghe</button>
            </div>
        `;
        return;
    }

    const modeLabels = {
        multiple_choice: { icon: "🎯", name: "Chế độ 1: Listen & Choose" },
        dictation: { icon: "⌨️", name: "Chế độ 2: Daily Dictation" },
        fill_blanks: { icon: "✍️", name: "Chế độ 3: Fill in the Blanks" },
        full_test: { icon: "⏱️", name: "Chế độ 4: Full Listening Test" }
    };

    listEl.innerHTML = filtered.map(ex => {
        const mInfo = modeLabels[ex.type] || modeLabels.multiple_choice;
        const done = (st.completedIds || []).includes(ex.id);
        const lastAttempt = (st.history || []).find(h => h.id === ex.id);
        return `
            <div onclick='openListeningExercise(${JSON.stringify(ex.id)})' class="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between gap-4 transition">
                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="flex items-center gap-2">
                            ${renderLevelBadge(ex.level)}
                            <span class="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">${mInfo.icon} ${mInfo.name}</span>
                        </div>
                        ${done ? `<span class="text-xs font-bold text-emerald-400">✅ ${lastAttempt ? lastAttempt.scorePct + "%" : "Hoàn thành"}</span>` : ""}
                    </div>
                    <h3 class="text-lg font-extrabold text-white">${escHtml(ex.title)}</h3>
                    <p class="text-xs text-slate-400">${(ex.sentences || []).length || 5} câu audio • ${renderSourceBadge(ex.source || "built-in")}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span class="text-slate-400">Tốc độ hỗ trợ: 0.5x – 1.5x</span>
                    <span class="font-bold text-violet-400">Bắt đầu nghe →</span>
                </div>
            </div>
        `;
    }).join("");

    renderListeningHistoryPanel();
}

function renderListeningHistoryPanel() {
    const histBox = document.getElementById("listening-history-box");
    if (!histBox) return;
    const st = getListeningState();
    const hist = (st.history || []).slice(0, 6);
    if (!hist.length) {
        histBox.innerHTML = `<p class="text-xs text-slate-500 italic">Chưa có lịch sử làm bài nghe. Hãy chọn một bài ở trên để bắt đầu!</p>`;
        return;
    }
    histBox.innerHTML = hist.map(h => `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-xs">
            <div>
                <span class="font-bold text-white">${escHtml(h.title)}</span>
                <span class="text-slate-500 ml-2">${new Date(h.at).toLocaleDateString("vi-VN")}</span>
            </div>
            <span class="font-extrabold ${h.scorePct >= 75 ? "text-emerald-400" : "text-amber-400"}">${h.scorePct}%</span>
        </div>
    `).join("");
}

function renderAudioPlayerControls(ex, singleSentenceMode = false) {
    const hasExternalUrl = Boolean(ex.audioUrl && String(ex.audioUrl).trim());
    return `
        <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-3">
            ${hasExternalUrl ? `
                <audio id="ext-audio-el" src="${escHtml(ex.audioUrl)}" controls class="w-full" onerror="handleExternalAudioError()"></audio>
                <div id="ext-audio-error" class="hidden p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 font-semibold">
                    ❗ Không truy cập được nguồn file audio bên ngoài (có thể do mất mạng, CORS hoặc đường dẫn hết hạn). Hệ thống KHÔNG hiển thị bài nghe giả. Bạn có thể chuyển sang chế độ Đọc Transcript bằng Web Speech API bên dưới hoặc kiểm tra lại kết nối.
                </div>
            ` : ""}
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap items-center gap-2">
                    <button onclick="listeningPlayAudio(${singleSentenceMode})" class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-lg">▶ Phát Audio</button>
                    <button onclick="listeningRewindAudio(${singleSentenceMode})" class="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 font-bold text-xs" title="Tua lại câu trước / đầu câu">⏪ Tua lại</button>
                    <button onclick="listeningReplayAudio(${singleSentenceMode})" class="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-cyan-300 font-bold text-xs">↻ Phát lại</button>
                    <button onclick="listeningStopAudio()" class="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-rose-300 font-bold text-xs">⏹ Dừng</button>
                </div>
                <div class="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                    <span class="text-slate-400 font-bold">Tốc độ nghe:</span>
                    <select id="listening-speed-sel" onchange="changeListeningSpeed(this.value)" class="bg-transparent text-cyan-300 font-extrabold focus:outline-none cursor-pointer">
                        <option value="0.5" ${listeningSpeed === 0.5 ? "selected" : ""} class="bg-slate-900">0.5x (Rất chậm)</option>
                        <option value="0.75" ${listeningSpeed === 0.75 ? "selected" : ""} class="bg-slate-900">0.75x (Chậm)</option>
                        <option value="1.0" ${listeningSpeed === 1.0 ? "selected" : ""} class="bg-slate-900">1.0x (Chuẩn)</option>
                        <option value="1.25" ${listeningSpeed === 1.25 ? "selected" : ""} class="bg-slate-900">1.25x (Khá nhanh)</option>
                        <option value="1.5" ${listeningSpeed === 1.5 ? "selected" : ""} class="bg-slate-900">1.5x (Nhanh)</option>
                    </select>
                </div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span id="listening-player-status">Sẵn sàng phát âm thanh (Web Speech API en-US)</span>
                <span id="listening-sentence-indicator"></span>
            </div>
        </div>
    `;
}

function handleExternalAudioError() {
    document.getElementById("ext-audio-error")?.classList.remove("hidden");
    showToast("Nguồn audio bên ngoài không truy cập được!", "error");
}

function changeListeningSpeed(val) {
    listeningSpeed = parseFloat(val) || 1.0;
    const extAudio = document.getElementById("ext-audio-el");
    if (extAudio) extAudio.playbackRate = listeningSpeed;
    showToast(`Tốc độ bài nghe: ${listeningSpeed}x`);
}

function getSentencesOfActiveListening() {
    if (!activeListeningItem) return [];
    if (Array.isArray(activeListeningItem.sentences) && activeListeningItem.sentences.length > 0) {
        return activeListeningItem.sentences;
    }
    return String(activeListeningItem.audioText || activeListeningItem.transcript || "")
        .match(/[^.!?]+[.!?]+/g) || [activeListeningItem.transcript || ""];
}

function listeningPlayAudio(singleSentenceMode = false) {
    if (!activeListeningItem) return;
    if (!("speechSynthesis" in window)) {
        const stEl = document.getElementById("listening-player-status");
        if (stEl) stEl.innerHTML = `<span class="text-rose-400 font-bold">❗ Trình duyệt không hỗ trợ phát giọng nói Web SpeechSynthesis.</span>`;
        showToast("Trình duyệt không hỗ trợ phát âm thanh!", "error");
        return;
    }

    const sentences = getSentencesOfActiveListening();
    if (singleSentenceMode) {
        const sent = sentences[dictationIdx] || "";
        const stEl = document.getElementById("listening-player-status");
        if (stEl) stEl.textContent = `🔊 Đang phát câu ${dictationIdx + 1}/${sentences.length} (${listeningSpeed}x)...`;
        speakText(sent, listeningSpeed, () => {
            if (stEl) stEl.textContent = `Đã phát xong câu ${dictationIdx + 1}/${sentences.length}.`;
        });
        return;
    }

    listeningIsPlaying = true;
    playListeningSequenceFrom(listeningSentenceCursor);
}

function playListeningSequenceFrom(startIdx) {
    const sentences = getSentencesOfActiveListening();
    if (!listeningIsPlaying || startIdx >= sentences.length) {
        listeningIsPlaying = false;
        listeningSentenceCursor = 0;
        const stEl = document.getElementById("listening-player-status");
        if (stEl) stEl.textContent = "✅ Đã phát hết đoạn nghe.";
        return;
    }
    listeningSentenceCursor = startIdx;
    const stEl = document.getElementById("listening-player-status");
    const indEl = document.getElementById("listening-sentence-indicator");
    if (stEl) stEl.textContent = `🔊 Đang phát (${listeningSpeed}x)...`;
    if (indEl) indEl.textContent = `Câu ${startIdx + 1} / ${sentences.length}`;

    speakText(sentences[startIdx], listeningSpeed, () => {
        if (listeningIsPlaying) {
            playListeningSequenceFrom(startIdx + 1);
        }
    });
}

function listeningRewindAudio(singleSentenceMode = false) {
    if (singleSentenceMode) {
        listeningPlayAudio(true);
        return;
    }
    listeningIsPlaying = true;
    const prevIdx = Math.max(0, listeningSentenceCursor - 1);
    playListeningSequenceFrom(prevIdx);
}

function listeningReplayAudio(singleSentenceMode = false) {
    if (singleSentenceMode) {
        listeningPlayAudio(true);
        return;
    }
    listeningIsPlaying = true;
    playListeningSequenceFrom(0);
}

function listeningStopAudio() {
    listeningIsPlaying = false;
    stopSpeech();
    const stEl = document.getElementById("listening-player-status");
    if (stEl) stEl.textContent = "⏹ Đã dừng phát.";
}

function openListeningExercise(id, customItem = null) {
    const allItems = getAllContentForSkill("listening");
    if (customItem) window.lastCustomListeningExercise = customItem;
    const ex = customItem || allItems.find(x => x.id === id) ||
        (id.startsWith("custom-l-") ? window.lastCustomListeningExercise : null);
    const allItems = getAllContentForSkill("listening");
    const ex = allItems.find(x => x.id === id);
    if (!ex) return;

    clearInterval(fullTestTimerId);
    listeningStopAudio();
    activeListeningItem = ex;
    listeningSentenceCursor = 0;

    document.getElementById("listening-list")?.classList.add("hidden");
    document.getElementById("listening-filter-bar")?.classList.add("hidden");
    document.getElementById("listening-exercise")?.classList.remove("hidden");

    if (ex.type === "dictation") {
        dictationIdx = 0;
        dictationScores = new Array(getSentencesOfActiveListening().length).fill(null);
        renderDictationView();
    } else if (ex.type === "fill_blanks") {
        renderFillBlanksView();
    } else if (ex.type === "full_test") {
        renderFullListeningTestView();
    } else {
        renderListenChooseView();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeListeningExercise() {
    clearInterval(fullTestTimerId);
    listeningStopAudio();
    activeListeningItem = null;
    document.getElementById("listening-exercise")?.classList.add("hidden");
    document.getElementById("listening-list")?.classList.remove("hidden");
    document.getElementById("listening-filter-bar")?.classList.remove("hidden");
    filterListeningExercises();
}

/* --- MODE 2: DAILY DICTATION (Inspired by Reference Image 3!) --- */
function renderDictationView() {
    const ex = activeListeningItem;
    const sentences = getSentencesOfActiveListening();
    const content = document.getElementById("listening-exercise-content");
    const total = sentences.length;

    content.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
                <div class="flex items-center gap-2">${renderLevelBadge(ex.level)}<span class="text-xs font-bold text-cyan-400">⌨️ Daily Dictation</span></div>
                <h3 class="text-xl font-black text-white mt-1">${escHtml(ex.title)}</h3>
            </div>
            <div class="flex items-center gap-2 text-sm font-bold">
                <button onclick="moveDictationSentence(-1)" ${dictationIdx === 0 ? "disabled" : ""} class="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 disabled:opacity-40">←</button>
                <span class="px-3 py-1 rounded-xl bg-slate-950 border border-white/10 text-cyan-300">${dictationIdx + 1} / ${total}</span>
                <button onclick="moveDictationSentence(1)" ${dictationIdx >= total - 1 ? "disabled" : ""} class="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 disabled:opacity-40">→</button>
            </div>
        </div>

        ${renderAudioPlayerControls(ex, true)}

        <div class="space-y-3">
            <label class="text-xs font-bold text-slate-300 block">Nghe kỹ và gõ lại chính xác câu bạn vừa nghe:</label>
            <div class="relative">
                <textarea id="dictation-input" rows="3" placeholder="Type what you hear..." onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); checkDictationSentence();}" class="w-full bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 pr-12 text-base text-white focus:outline-none focus:border-violet-500"></textarea>
                <button onclick="dictateWithMic()" title="Nhập bằng giọng nói" class="absolute right-3 bottom-3 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-cyan-300">🎙</button>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2">
                <button onclick="saveDictationSentenceToNotebook()" class="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold text-slate-200">📓 Add note (Lưu câu vào Sổ tay)</button>
                <div class="flex gap-2">
                    <button onclick="checkDictationSentence()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-lg">Kiểm tra câu</button>
                    ${dictationIdx < total - 1
                        ? `<button onclick="moveDictationSentence(1)" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">Câu tiếp (Next) →</button>`
                        : `<button onclick="finishDictationExercise()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">Hoàn thành & Xem Transcript</button>`}
                </div>
            </div>
        </div>

        <div id="dictation-feedback" class="space-y-2"></div>
        <div id="listening-transcript-box" class="hidden p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/25 space-y-2"></div>
    `;
    setTimeout(() => {
        listeningPlayAudio(true);
        document.getElementById("dictation-input")?.focus();
    }, 150);
}

async function dictateWithMic() {
    if (!isSpeechRecognitionSupported()) {
        showToast("Trình duyệt không hỗ trợ nhập giọng nói (hãy dùng Chrome/Edge).", "warning");
        return;
    }
    try {
        showToast("🎙 Đang nghe...");
        const alts = await recognizeSpeechOnce();
        const area = document.getElementById("dictation-input");
        if (area && alts[0]) area.value = alts[0].transcript;
    } catch (err) {
        showToast(String(err), "error");
    }
}

function checkDictationSentence() {
    const sentences = getSentencesOfActiveListening();
    const target = sentences[dictationIdx] || "";
    const typed = (document.getElementById("dictation-input")?.value || "").trim();
    const fb = document.getElementById("dictation-feedback");
    if (!fb) return;

    const cmp = compareTranscriptToTarget(typed, target);
    dictationScores[dictationIdx] = cmp.similarity;

    if (cmp.similarity < 90 && cmp.missing.length) {
        autoLogMistake({
            errorCategory: "Sai chính tả",
            wrongText: typed || "(chưa nghe ra)",
            correctText: target,
            explanation: `Nghe thiếu/nhầm từ trong bài chép chính tả: ${cmp.missing.join(", ")}`,
            skill: "listening"
        });
    }

    fb.innerHTML = `
        <div class="p-4 rounded-2xl ${cmp.similarity >= 90 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"} border space-y-2 text-xs">
            <div class="flex items-center justify-between">
                <span class="font-bold text-sm ${cmp.similarity >= 90 ? "text-emerald-300" : "text-amber-300"}">
                    ${cmp.similarity >= 90 ? "✅ Chính xác tuyệt vời!" : "🔍 Đối chiếu từng từ với Transcript gốc:"}
                </span>
                <span class="font-black text-white bg-slate-900 px-2.5 py-1 rounded-full">Độ khớp: ${cmp.similarity}%</span>
            </div>
            <p class="text-sm leading-relaxed">${cmp.wordDiffHtml}</p>
            <p class="text-slate-300"><strong>Câu chuẩn:</strong> "${escHtml(target)}"</p>
            ${cmp.missing.length ? `<p class="text-rose-300"><strong>Từ sai hoặc thiếu:</strong> ${escHtml(cmp.missing.join(", "))}</p>` : ""}
        </div>
    `;
}

function moveDictationSentence(delta) {
    const sentences = getSentencesOfActiveListening();
    const next = dictationIdx + delta;
    if (next < 0 || next >= sentences.length) return;
    dictationIdx = next;
    renderDictationView();
}

function saveDictationSentenceToNotebook() {
    const sentences = getSentencesOfActiveListening();
    const sent = sentences[dictationIdx] || "";
    addStructuredNote({
        type: "vocabulary",
        title: `Dictation: ${sent.slice(0, 42)}...`,
        important: false,
        fields: {
            word: sent.split(" ").slice(0, 3).join(" "),
            example: sent,
            meaningVi: `Trích từ bài nghe: ${activeListeningItem?.title || ""}`
        },
        content: sent
    });
}

function finishDictationExercise() {
    checkDictationSentence();
    const answered = dictationScores.map(v => v === null ? 0 : v);
    const avg = answered.length ? Math.round(answered.reduce((a, b) => a + b, 0) / answered.length) : 0;
    finalizeListeningCompletion(avg);
}

/* --- MODE 3: LISTEN & FILL IN THE BLANKS --- */
function renderFillBlanksView() {
    const ex = activeListeningItem;
    const content = document.getElementById("listening-exercise-content");
    const answers = ex.answers || [];
    let blankCounter = 0;
    const htmlWithInputs = escHtml(ex.blankedText || ex.transcript).replace(/___\(\d+\)___|_{3,}/g, () => {
        const idx = blankCounter++;
        return `<input type="text" id="l-blank-${idx}" placeholder="(${idx + 1})" class="inline-block w-36 mx-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-200 font-bold text-xs text-center focus:outline-none focus:border-violet-400">`;
    });

    content.innerHTML = `
        <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-2">${renderLevelBadge(ex.level)}<span class="text-xs font-bold text-cyan-400">✍️ Listen & Fill in the Blanks (${answers.length} chỗ trống)</span></div>
            <h3 class="text-xl font-black text-white mt-1">${escHtml(ex.title)}</h3>
        </div>
        ${renderAudioPlayerControls(ex, false)}
        <div class="p-5 rounded-2xl bg-slate-950/70 border border-white/10 text-sm text-slate-200 leading-9">
            ${htmlWithInputs}
        </div>
        <button onclick="gradeFillBlanksListening()" class="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg">Kiểm tra chính tả & Xem Transcript</button>
        <div id="listening-result-box" class="hidden space-y-3"></div>
        <div id="listening-transcript-box" class="hidden p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/25 space-y-2"></div>
    `;
}

function gradeFillBlanksListening() {
    const ex = activeListeningItem;
    const answers = ex.answers || [];
    let correct = 0;
    const details = [];

    answers.forEach((ans, idx) => {
        const inp = document.getElementById(`l-blank-${idx}`);
        const uVal = (inp?.value || "").trim();
        const ok = normalizeWords(uVal) === normalizeWords(ans);
        if (ok) correct++;
        else {
            autoLogMistake({
                errorCategory: "Sai chính tả",
                wrongText: uVal || `(trống ô #${idx + 1})`,
                correctText: ans,
                explanation: `Từ cần điền ở chỗ trống (${idx + 1}) trong bài "${ex.title}" là "${ans}".`,
                skill: "listening"
            });
        }
        if (inp) {
            inp.classList.remove("border-cyan-500/40");
            inp.classList.add(ok ? "border-emerald-500" : "border-rose-500");
        }
        details.push({ idx: idx + 1, user: uVal, expected: ans, ok });
    });

    const pct = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 100;
    const resBox = document.getElementById("listening-result-box");
    if (resBox) {
        resBox.classList.remove("hidden");
        resBox.innerHTML = `
            <div class="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2 text-xs">
                <h4 class="font-black text-base text-white">Kết quả điền từ: <span class="text-cyan-300">${correct}/${answers.length} (${pct}%)</span></h4>
                <div class="grid sm:grid-cols-2 gap-2">
                    ${details.map(d => `
                        <div class="p-2 rounded-lg ${d.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}">
                            (${d.idx}) Bạn điền: <strong>${escHtml(d.user || "—")}</strong> ${d.ok ? "✅" : `→ Đúng: <strong>${escHtml(d.expected)}</strong>`}
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }
    finalizeListeningCompletion(pct);
}

/* --- MODE 1 & MODE 4: LISTEN & CHOOSE / TIMED FULL LISTENING TEST --- */
function renderListenChooseView(isFullTest = false) {
    const ex = activeListeningItem;
    const questions = ex.questions || [];
    const content = document.getElementById("listening-exercise-content");

    content.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
                <div class="flex items-center gap-2">
                    ${renderLevelBadge(ex.level)}
                    <span class="text-xs font-bold text-cyan-400">${isFullTest ? "⏱️ Full Listening Test" : "🎯 Listen & Choose"}</span>
                </div>
                <h3 class="text-xl font-black text-white mt-1">${escHtml(ex.title)}</h3>
            </div>
            ${isFullTest ? `
                <div class="px-4 py-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono font-black text-sm" id="full-test-timer">
                    ⏳ 06:00
                </div>
            ` : ""}
        </div>

        ${isFullTest ? `
            <div class="space-y-1">
                <div class="flex justify-between text-xs text-slate-400"><span>Tiến độ trả lời câu hỏi</span><span id="l-test-prog-label">0 / ${questions.length}</span></div>
                <div class="h-2 bg-slate-950 rounded-full overflow-hidden"><div id="l-test-prog-bar" class="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all" style="width:0%"></div></div>
            </div>
        ` : ""}

        ${renderAudioPlayerControls(ex, false)}

        <div class="space-y-4">
            ${questions.map((q, qi) => `
                <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5" id="l-qbox-${qi}">
                    <p class="text-sm font-bold text-white"><span class="text-violet-400 mr-1">Question ${qi + 1}:</span> ${escHtml(q.question)}</p>
                    <div class="grid gap-2">
                        ${(q.options || []).map(opt => `
                            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-white/10 cursor-pointer hover:border-violet-500/40 text-xs text-slate-200">
                                <input type="radio" name="l-mc-${qi}" value="${escHtml(opt)}" onchange="updateListeningTestProgress()" class="accent-violet-500">
                                <span>${escHtml(opt)}</span>
                            </label>
                        `).join("")}
                    </div>
                    <div id="l-qfb-${qi}" class="hidden text-xs pt-2 border-t border-white/10"></div>
                </div>
            `).join("")}
        </div>

        <button id="l-submit-mc-btn" onclick="gradeListeningMCQuestions()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg">
            Nộp bài nghe & Xem đáp án + Transcript
        </button>
        <div id="listening-result-box" class="hidden"></div>
        <div id="listening-transcript-box" class="hidden p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/25 space-y-2"></div>
    `;
}

function renderFullListeningTestView() {
    renderListenChooseView(true);
    fullTestRemainingSec = activeListeningItem.durationSeconds || 360;
    updateFullTestTimerUI();
    clearInterval(fullTestTimerId);
    fullTestTimerId = setInterval(() => {
        fullTestRemainingSec--;
        updateFullTestTimerUI();
        if (fullTestRemainingSec <= 0) {
            clearInterval(fullTestTimerId);
            showToast("Hết giờ làm bài nghe! Hệ thống tự động chấm bài.", "warning");
            gradeListeningMCQuestions();
        }
    }, 1000);
}

function updateFullTestTimerUI() {
    const el = document.getElementById("full-test-timer");
    if (!el) return;
    const m = String(Math.floor(Math.max(0, fullTestRemainingSec) / 60)).padStart(2, "0");
    const s = String(Math.max(0, fullTestRemainingSec) % 60).padStart(2, "0");
    el.textContent = `⏳ ${m}:${s}`;
}

function updateListeningTestProgress() {
    if (!activeListeningItem) return;
    const total = (activeListeningItem.questions || []).length;
    if (!total) return;
    let answered = 0;
    for (let i = 0; i < total; i++) {
        if (document.querySelector(`input[name="l-mc-${i}"]:checked`)) answered++;
    }
    const lbl = document.getElementById("l-test-prog-label");
    const bar = document.getElementById("l-test-prog-bar");
    if (lbl) lbl.textContent = `${answered} / ${total}`;
    if (bar) bar.style.width = `${Math.round((answered / total) * 100)}%`;
}

function gradeListeningMCQuestions() {
    clearInterval(fullTestTimerId);
    if (!activeListeningItem) return;
    const questions = activeListeningItem.questions || [];
    let correct = 0;

    questions.forEach((q, qi) => {
        const picked = document.querySelector(`input[name="l-mc-${qi}"]:checked`)?.value || "";
        const ok = picked.trim().toLowerCase() === String(q.answer).trim().toLowerCase();
        if (ok) correct++;

        const box = document.getElementById(`l-qbox-${qi}`);
        const fb = document.getElementById(`l-qfb-${qi}`);
        if (box) {
            box.classList.remove("border-white/10");
            box.classList.add(ok ? "border-emerald-500/50" : "border-rose-500/50");
        }
        if (fb) {
            fb.classList.remove("hidden");
            fb.innerHTML = `
                <p class="font-bold ${ok ? "text-emerald-300" : "text-rose-300"}">
                    ${ok ? "✅ Chính xác!" : `❌ Bạn chọn: "${escHtml(picked || "Chưa chọn")}" — Đáp án đúng: "${escHtml(q.answer)}"`}
                </p>
                <p class="text-slate-300 mt-1">💡 ${escHtml(q.explanationVi || q.explanation || "")}</p>
            `;
        }
    });

    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 100;
    const resBox = document.getElementById("listening-result-box");
    if (resBox) {
        resBox.classList.remove("hidden");
        resBox.innerHTML = `
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <h4 class="text-lg font-black text-white">Điểm bài nghe: <span class="text-amber-300">${correct} / ${questions.length} (${pct}%)</span></h4>
            </div>
        `;
    }
    finalizeListeningCompletion(pct);
}

function finalizeListeningCompletion(scorePct) {
    if (!activeListeningItem) return;
    // Reveal full transcript upon completion (PHẦN 3.3.D)
    const trBox = document.getElementById("listening-transcript-box");
    if (trBox) {
        trBox.classList.remove("hidden");
        trBox.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold uppercase tracking-wider text-cyan-300">📜 Transcript bài nghe (Mở khóa sau khi hoàn thành)</span>
                <button onclick="listeningReplayAudio(false)" class="text-xs font-bold text-violet-300 hover:underline">🔊 Nghe lại toàn bài</button>
            </div>
            <p class="text-sm text-slate-200 leading-relaxed whitespace-pre-line">${escHtml(activeListeningItem.transcript)}</p>
        `;
    }

    const st = getListeningState();
    if (!st.completedIds.includes(activeListeningItem.id)) st.completedIds.push(activeListeningItem.id);
    st.history.unshift({
        id: activeListeningItem.id,
        title: activeListeningItem.title,
        level: activeListeningItem.level,
        mode: activeListeningItem.type,
        scorePct,
        at: new Date().toISOString()
    });
    if (st.history.length > 50) st.history = st.history.slice(0, 50);
    saveListeningState(st);

    logStudyMetrics(
        {
            listeningDone: 1,
            scoreEntry: { skill: "listening", scorePct, level: activeListeningItem.level, title: activeListeningItem.title }
        },
        { type: "listening", skill: "listening", title: `Hoàn thành bài nghe: ${activeListeningItem.title}`, scorePct }
    );
    showToast(`Hoàn thành bài nghe (${scorePct}%)! Đã mở Transcript.`);
}
