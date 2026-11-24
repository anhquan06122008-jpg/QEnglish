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
    return safeReadJSON(STORAGE_KEYS.LISTENING, { completedIds: [], history: [] });
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

function getResolvedAudioUrl(ex) {
    if (!ex) return "";
    const sess = window.sessionAudioBlobUrls && ex.id ? window.sessionAudioBlobUrls[ex.id] : "";
    return String(sess || ex.audioUrl || "").trim();
}

let listeningLiveSubOpen = true;
let listeningUserScrollUntil = 0;
let listeningAudioSyncAbort = null;
let listeningAudioRafId = null;
let listeningActiveWordToken = null;
let listeningActiveUtterance = null;
let listeningStartedAt = 0;

function renderSentenceWithWordSpans(sentence, sentIdx) {
    const raw = String(sentence || "");
    const parts = raw.split(/(\s+)/);
    let offset = 0;
    return parts.map(part => {
        const start = offset;
        offset += part.length;
        if (!part.trim()) return part;
        return `<span class="lis-word-span transition-colors duration-100 rounded px-0.5" data-sidx="${sentIdx}" data-wstart="${start}" data-wend="${offset}">${escHtml(part)}</span>`;
    }).join("");
}

function clearMainListeningWordHighlights() {
    if (listeningActiveWordToken) {
        listeningActiveWordToken.classList.remove("bg-cyan-400/35", "text-white", "font-extrabold");
        listeningActiveWordToken = null;
    }
    document.querySelectorAll(".lis-word-span.bg-cyan-400\\/35").forEach(el => {
        el.classList.remove("bg-cyan-400/35", "text-white", "font-extrabold");
    });
}

function highlightMainListeningWordAtChar(sentIdx, charIndex) {
    const row = document.getElementById(`main-lis-trow-${sentIdx}`);
    if (!row) return;
    const spans = row.querySelectorAll(".lis-word-span");
    let matched = null;
    for (const sp of spans) {
        const ws = Number(sp.getAttribute("data-wstart"));
        const we = Number(sp.getAttribute("data-wend"));
        if (charIndex >= ws && charIndex <= we) {
            matched = sp;
            break;
        }
    }
    if (!matched) return;
    if (listeningActiveWordToken && listeningActiveWordToken !== matched) {
        listeningActiveWordToken.classList.remove("bg-cyan-400/35", "text-white", "font-extrabold");
    }
    matched.classList.add("bg-cyan-400/35", "text-white", "font-extrabold");
    listeningActiveWordToken = matched;
}

function renderAudioPlayerControls(ex, singleSentenceMode = false) {
    const resolvedUrl = getResolvedAudioUrl(ex);
    const hasExternalUrl = Boolean(resolvedUrl);
    const sentences = getSentencesOfActiveListening();
    const hasTranscript = Boolean(sentences.length || String(ex.audioText || ex.transcript || "").trim());
    const tLines = Array.isArray(ex.transcriptLines) && ex.transcriptLines.length ? ex.transcriptLines : null;
    return `
        <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-3">
            ${hasExternalUrl ? `
                <audio id="ext-audio-el" src="${escHtml(resolvedUrl)}" controls class="w-full" onerror="handleExternalAudioError()"></audio>
                <div id="ext-audio-error" class="hidden p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 font-semibold">
                    ❗ Không truy cập được file audio (có thể file tạm của phiên trước đã hết hạn sau khi tải lại trang, mất mạng hoặc CORS). Hãy tải lại file âm thanh từ máy của bạn hoặc dùng transcript bên dưới.
                </div>
            ` : ""}
            ${!singleSentenceMode && sentences.length > 1 ? `
                <div class="flex items-center gap-2.5 text-[11px]">
                    <span id="listening-seek-label" class="font-mono text-cyan-300 shrink-0">Câu ${Math.min(sentences.length, listeningSentenceCursor + 1)}/${sentences.length}</span>
                    <input id="listening-sentence-seek" type="range" min="0" max="${Math.max(0, sentences.length - 1)}" step="1" value="${Math.min(Math.max(0, sentences.length - 1), listeningSentenceCursor)}" oninput="listeningJumpToSentence(Number(this.value), false)" onchange="listeningJumpToSentence(Number(this.value), true)" class="flex-1 accent-cyan-400 cursor-pointer" title="Kéo để tua đến bất kỳ câu nào">
                </div>
            ` : ""}
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap items-center gap-2">
                    <button id="listening-play-toggle-btn" onclick="listeningTogglePlay(${singleSentenceMode})" class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-lg">${listeningIsPlaying ? "⏸ Tạm dừng" : "▶ Phát Audio"}</button>
                    <button onclick="listeningRewindAudio(${singleSentenceMode})" class="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 font-bold text-xs" title="Tua lại câu trước">⏮ Câu trước</button>
                    ${!singleSentenceMode && sentences.length > 1 ? `<button onclick="listeningNextSentence()" class="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 font-bold text-xs" title="Câu tiếp theo">⏭ Câu tiếp</button>` : ""}
                    <button onclick="listeningReplayAudio(${singleSentenceMode})" class="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-cyan-300 font-bold text-xs">↻ Phát lại</button>
                    <button onclick="listeningStopAudio()" class="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-rose-300 font-bold text-xs">⏹ Dừng</button>
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
            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span id="listening-player-status">${hasExternalUrl && !hasTranscript ? "Đang dùng trình phát tệp âm thanh gốc của bạn (không tự bịa transcript)" : "Sẵn sàng phát âm thanh (Đồng bộ thực theo sự kiện onstart / onboundary)"}</span>
                <div class="flex items-center gap-2">
                    <span id="listening-sentence-indicator"></span>
                    ${!singleSentenceMode && sentences.length ? `<button type="button" onclick="toggleMainListeningLiveSubtitles()" class="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold">📜 Hiện/Ẩn Phụ Đề Phát Sáng</button>` : ""}
                    ${hasTranscript ? `<button onclick="runAIListeningCoach()" class="px-2.5 py-1 rounded-lg bg-violet-600/25 hover:bg-violet-600/40 border border-violet-400/30 text-violet-200 font-bold">🤖 AI Giải thích cụm từ khó</button>` : ""}
                </div>
            </div>
            ${!singleSentenceMode && sentences.length ? `
                <div id="main-listening-live-subtitles" onwheel="listeningUserScrollUntil = Date.now() + 4000" ontouchmove="listeningUserScrollUntil = Date.now() + 4000" class="${listeningLiveSubOpen ? "" : "hidden"} pt-2 border-t border-white/10 space-y-1.5 max-h-60 overflow-y-auto pr-1 text-xs">
                    ${sentences.map((s, idx) => {
                        const viLine = tLines && tLines[idx]?.translationVi ? tLines[idx].translationVi : "";
                        return `
                            <div id="main-lis-trow-${idx}" data-main-lis-trow="${idx}" onclick="listeningJumpToSentence(${idx}, true)" class="cursor-pointer p-2.5 rounded-xl border border-white/5 bg-slate-900/70 hover:border-cyan-500/40 transition-all duration-200">
                                <div class="flex items-start gap-2">
                                    <span class="main-lis-dot hidden text-cyan-300 animate-pulse shrink-0">🔊</span>
                                    <span class="text-[10px] font-mono text-slate-500 shrink-0 mt-0.5">${idx + 1}.</span>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-slate-200 leading-relaxed">${renderSentenceWithWordSpans(s, idx)}</p>
                                        ${viLine ? `<p class="text-[11px] text-slate-400 italic mt-0.5">${escHtml(viLine)}</p>` : ""}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            ` : ""}
            <div id="listening-coach-output" class="hidden pt-1"></div>
        </div>
    `;
}

function toggleMainListeningLiveSubtitles() {
    listeningLiveSubOpen = !listeningLiveSubOpen;
    const box = document.getElementById("main-listening-live-subtitles");
    if (box) box.classList.toggle("hidden", !listeningLiveSubOpen);
}

function highlightMainListeningSentence(activeIdx, { skipScroll = false } = {}) {
    clearMainListeningWordHighlights();
    const rows = document.querySelectorAll("[data-main-lis-trow]");
    rows.forEach(row => {
        const idx = Number(row.getAttribute("data-main-lis-trow"));
        const isActive = idx === activeIdx;
        const isSpoken = activeIdx >= 0 && idx < activeIdx;
        row.classList.toggle("border-cyan-400", isActive);
        row.classList.toggle("bg-cyan-500/20", isActive);
        row.classList.toggle("shadow-[0_0_20px_rgba(34,211,238,0.28)]", isActive);
        row.classList.toggle("ring-1", isActive);
        row.classList.toggle("ring-cyan-400/60", isActive);
        row.classList.toggle("audio-line-active", isActive);
        row.classList.toggle("audio-line-spoken", isSpoken);
        row.classList.toggle("opacity-70", isSpoken);
        row.classList.toggle("border-white/5", !isActive);
        row.classList.toggle("bg-slate-900/70", !isActive);
        const dot = row.querySelector(".main-lis-dot");
        if (dot) dot.classList.toggle("hidden", !isActive);
        if (isActive && !skipScroll && Date.now() > listeningUserScrollUntil) {
            try { row.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch {}
        }
    });
    const seek = document.getElementById("listening-sentence-seek");
    if (seek && activeIdx >= 0) seek.value = String(activeIdx);
    const seekLbl = document.getElementById("listening-seek-label");
    const total = getSentencesOfActiveListening().length;
    if (seekLbl && total > 0) seekLbl.textContent = `Câu ${Math.max(1, Math.min(total, activeIdx + 1))}/${total}`;
}

function listeningTogglePlay(singleSentenceMode = false) {
    if (listeningIsPlaying) {
        listeningStopAudio();
    } else {
        listeningPlayAudio(singleSentenceMode);
    }
}

function listeningJumpToSentence(idx, autoPlayNow = true) {
    const sentences = getSentencesOfActiveListening();
    if (!sentences.length) return;
    const safeIdx = Math.max(0, Math.min(sentences.length - 1, idx));
    listeningSentenceCursor = safeIdx;
    highlightMainListeningSentence(safeIdx);
    if (autoPlayNow) {
        listeningIsPlaying = true;
        playListeningSequenceFrom(safeIdx);
    }
}

function listeningNextSentence() {
    const sentences = getSentencesOfActiveListening();
    if (!sentences.length) return;
    const nextIdx = Math.min(sentences.length - 1, listeningSentenceCursor + 1);
    listeningJumpToSentence(nextIdx, true);
}

function handleExternalAudioError() {
    document.getElementById("ext-audio-error")?.classList.remove("hidden");
    showToast("Nguồn audio bên ngoài không truy cập được!", "error");
}

function changeListeningSpeed(val) {
    listeningSpeed = parseFloat(val) || 1.0;
    const extAudio = document.getElementById("ext-audio-el");
    if (extAudio) extAudio.playbackRate = listeningSpeed;
    if (listeningIsPlaying) {
        playListeningSequenceFrom(listeningSentenceCursor);
    }
    showToast(`Tốc độ bài nghe: ${listeningSpeed}x`);
}

function getSentencesOfActiveListening() {
    if (!activeListeningItem) return [];
    if (Array.isArray(activeListeningItem.sentences) && activeListeningItem.sentences.length > 0) {
        return activeListeningItem.sentences;
    }
    const raw = String(activeListeningItem.audioText || activeListeningItem.transcript || "").trim();
    if (!raw) return [];
    return raw.match(/[^.!?]+[.!?]+/g) || [raw];
}

function listeningPlayAudio(singleSentenceMode = false) {
    if (!activeListeningItem) return;
    const extAudio = document.getElementById("ext-audio-el");
    const sentences = getSentencesOfActiveListening();
    if (extAudio && sentences.length === 0) {
        extAudio.playbackRate = listeningSpeed;
        extAudio.play().catch(() => showToast("Không thể tự phát audio; hãy bấm nút Play trên trình phát.", "warning"));
        const stEl = document.getElementById("listening-player-status");
        if (stEl) stEl.textContent = `🔊 Đang phát file âm thanh của bạn (${listeningSpeed}x)...`;
        return;
    }
    if (!("speechSynthesis" in window)) {
        const stEl = document.getElementById("listening-player-status");
        if (stEl) stEl.innerHTML = `<span class="text-rose-400 font-bold">❗ Trình duyệt không hỗ trợ phát giọng nói Web SpeechSynthesis.</span>`;
        showToast("Trình duyệt không hỗ trợ phát âm thanh!", "error");
        return;
    }

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
    const toggleBtn = document.getElementById("listening-play-toggle-btn");
    if (!listeningIsPlaying || startIdx >= sentences.length) {
        listeningIsPlaying = false;
        listeningActiveUtterance = null;
        listeningSentenceCursor = 0;
        clearMainListeningWordHighlights();
        highlightMainListeningSentence(-1, { skipScroll: true });
        if (toggleBtn) toggleBtn.textContent = "▶ Phát Audio";
        const stEl = document.getElementById("listening-player-status");
        if (stEl) stEl.textContent = "✅ Đã phát hết đoạn nghe.";
        return;
    }
    listeningSentenceCursor = startIdx;
    highlightMainListeningSentence(startIdx);
    if (toggleBtn) toggleBtn.textContent = "⏸ Tạm dừng";
    const stEl = document.getElementById("listening-player-status");
    const indEl = document.getElementById("listening-sentence-indicator");
    if (stEl) stEl.textContent = `🔊 Đang phát câu ${startIdx + 1}/${sentences.length} (${listeningSpeed}x)...`;
    if (indEl) indEl.textContent = `Câu ${startIdx + 1} / ${sentences.length}`;

    // Real event-driven SpeechSynthesis (onstart + onboundary word highlight + onend) — ZERO fake setInterval!
    const textToSpeak = String(sentences[startIdx] || "").trim();
    if (!("speechSynthesis" in window) || !textToSpeak) {
        if (listeningIsPlaying) playListeningSequenceFrom(startIdx + 1);
        return;
    }
    try { window.speechSynthesis.cancel(); } catch {}
    const utt = new SpeechSynthesisUtterance(textToSpeak);
    utt.lang = "en-US";
    utt.rate = Math.max(0.5, Math.min(1.6, Number(listeningSpeed) || 1.0));
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const enVoice = voices.find(v => /^en[-_]US/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
    if (enVoice) utt.voice = enVoice;

    listeningActiveUtterance = utt;
    utt.onstart = () => {
        if (listeningActiveUtterance !== utt) return;
        highlightMainListeningSentence(startIdx);
    };
    utt.onboundary = (e) => {
        if (listeningActiveUtterance !== utt || !listeningIsPlaying) return;
        if (!e.name || e.name === "word") {
            highlightMainListeningWordAtChar(startIdx, Number(e.charIndex) || 0);
        }
    };
    utt.onend = () => {
        if (listeningActiveUtterance !== utt) return;
        clearMainListeningWordHighlights();
        if (listeningIsPlaying) {
            playListeningSequenceFrom(startIdx + 1);
        }
    };
    utt.onerror = () => {
        if (listeningActiveUtterance !== utt) return;
        clearMainListeningWordHighlights();
        if (listeningIsPlaying) {
            listeningIsPlaying = false;
            if (toggleBtn) toggleBtn.textContent = "▶ Phát Audio";
        }
    };
    window.speechSynthesis.speak(utt);
}

function listeningBindExternalAudioSync() {
    if (listeningAudioSyncAbort) {
        try { listeningAudioSyncAbort.abort(); } catch {}
        listeningAudioSyncAbort = null;
    }
    if (listeningAudioRafId) {
        cancelAnimationFrame(listeningAudioRafId);
        listeningAudioRafId = null;
    }
    const audioEl = document.getElementById("ext-audio-el");
    const tLines = Array.isArray(activeListeningItem?.transcriptLines) ? activeListeningItem.transcriptLines : [];
    if (!audioEl || !tLines.length) return;
    const hasRealTimestamps = tLines.some(l => typeof l.startTime === "number" && typeof l.endTime === "number");
    if (!hasRealTimestamps) return;

    const ac = new AbortController();
    listeningAudioSyncAbort = ac;
    let lastActive = -2;

    const syncNow = () => {
        const t = Number(audioEl.currentTime) || 0;
        let idx = -1;
        for (let i = 0; i < tLines.length; i++) {
            const st = Number(tLines[i].startTime);
            const en = Number(tLines[i].endTime);
            if (Number.isFinite(st) && Number.isFinite(en) && t >= st && t < en) {
                idx = i;
                break;
            }
        }
        if (idx !== lastActive) {
            lastActive = idx;
            highlightMainListeningSentence(idx);
        }
    };

    const tick = () => {
        if (ac.signal.aborted) return;
        syncNow();
        if (!audioEl.paused && !audioEl.ended) {
            listeningAudioRafId = requestAnimationFrame(tick);
        }
    };

    audioEl.addEventListener("play", () => {
        if (listeningAudioRafId) cancelAnimationFrame(listeningAudioRafId);
        listeningAudioRafId = requestAnimationFrame(tick);
    }, { signal: ac.signal });
    audioEl.addEventListener("pause", () => {
        if (listeningAudioRafId) { cancelAnimationFrame(listeningAudioRafId); listeningAudioRafId = null; }
        syncNow();
    }, { signal: ac.signal });
    audioEl.addEventListener("seeked", syncNow, { signal: ac.signal });
    audioEl.addEventListener("timeupdate", syncNow, { signal: ac.signal });
    audioEl.addEventListener("ended", () => {
        if (listeningAudioRafId) { cancelAnimationFrame(listeningAudioRafId); listeningAudioRafId = null; }
        lastActive = -1;
        highlightMainListeningSentence(-1, { skipScroll: true });
    }, { signal: ac.signal });
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
    listeningActiveUtterance = null;
    if (listeningAudioSyncAbort) {
        try { listeningAudioSyncAbort.abort(); } catch {}
        listeningAudioSyncAbort = null;
    }
    if (listeningAudioRafId) {
        cancelAnimationFrame(listeningAudioRafId);
        listeningAudioRafId = null;
    }
    clearMainListeningWordHighlights();
    stopSpeech();
    const extAudio = document.getElementById("ext-audio-el");
    if (extAudio && !extAudio.paused) extAudio.pause();
    const toggleBtn = document.getElementById("listening-play-toggle-btn");
    if (toggleBtn) toggleBtn.textContent = "▶ Phát Audio";
    const stEl = document.getElementById("listening-player-status");
    if (stEl) stEl.textContent = "⏹ Đã dừng phát.";
}

function openListeningExercise(id, customItem = null) {
    const allItems = getAllContentForSkill("listening");
    const targetId = String(id || "");
    if (customItem) window.lastCustomListeningExercise = customItem;
    const ex = customItem || allItems.find(x => x.id === id) ||
        (targetId.startsWith("custom-l-") ? window.lastCustomListeningExercise : null);
    if (!ex) return;

    clearInterval(fullTestTimerId);
    listeningStopAudio();
    activeListeningItem = ex;
    listeningSentenceCursor = 0;
    listeningStartedAt = Date.now();

    document.getElementById("listening-custom-panel")?.classList.add("hidden");
    document.getElementById("listening-list")?.classList.add("hidden");
    document.getElementById("listening-filter-bar")?.classList.add("hidden");
    if (typeof LearningHub !== "undefined") LearningHub.setSkillOuterPanelsVisible("listening", false);
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
    document.getElementById("listening-custom-panel")?.classList.remove("hidden");
    document.getElementById("listening-list")?.classList.remove("hidden");
    document.getElementById("listening-filter-bar")?.classList.remove("hidden");
    if (typeof LearningHub !== "undefined") LearningHub.setSkillOuterPanelsVisible("listening", true);
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
    const sentences = getSentencesOfActiveListening();
    const answered = dictationScores.map(v => v === null ? 0 : v);
    const avg = answered.length ? Math.round(answered.reduce((a, b) => a + b, 0) / answered.length) : 0;
    const answers = sentences.map((s, i) => ({
        question: `Nghe & chép lại câu ${i + 1}`,
        userAnswer: `Độ chính xác ${answered[i] || 0}%`,
        correctAnswer: s,
        isCorrect: (answered[i] || 0) >= 85,
        explanationVi: `Câu chuẩn: "${s}"`
    }));
    finalizeListeningCompletion(avg, {
        questionSetId: "set-1",
        questionSetLabel: "Daily Dictation",
        correctCount: answers.filter(a => a.isCorrect).length,
        totalCount: answers.length,
        answers
    });
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
    finalizeListeningCompletion(pct, {
        questionSetId: "set-1",
        questionSetLabel: "Fill in the Blanks",
        correctCount: correct,
        totalCount: answers.length,
        answers: details.map(d => ({
            question: `Chỗ trống (${d.idx}) trong "${ex.title}"`,
            userAnswer: d.user,
            correctAnswer: d.expected,
            isCorrect: d.ok,
            explanationVi: `Từ cần điền: "${d.expected}"`
        }))
    });
}

/* --- MODE 1 & MODE 4: LISTEN & CHOOSE / TIMED FULL LISTENING TEST --- */
function getActiveListeningQuestionSet() {
    const ex = activeListeningItem;
    if (!ex) return { id: "set-1", label: "Bộ câu hỏi 1", sourceType: "original", cefrLevel: "B1", questions: [] };
    if (typeof LearningHub !== "undefined") {
        return LearningHub.getActiveQuestionSet("listening", ex.id, ex.questions || []);
    }
    return { id: "set-1", label: "Bộ câu hỏi 1", sourceType: "original", cefrLevel: ex.level || "B1", questions: ex.questions || [] };
}

function onListeningDraftInput(qi, val) {
    if (activeListeningItem && typeof LearningHub !== "undefined") {
        const activeSet = getActiveListeningQuestionSet();
        const q = (activeSet.questions || [])[qi];
        if (q) LearningHub.setDraftAnswer("listening", activeListeningItem.id, activeSet.id, q.id || `lq-${qi}`, val);
    }
    updateListeningTestProgress();
}

function renderListeningQuestionsSectionOnly() {
    const ex = activeListeningItem;
    const host = document.getElementById("listening-questions-wrap");
    if (!ex || !host) return;
    const activeSet = getActiveListeningQuestionSet();
    const questions = activeSet.questions || [];
    const draft = (typeof LearningHub !== "undefined")
        ? LearningHub.getSetDraft("listening", ex.id, activeSet.id)
        : {};

    host.innerHTML = questions.length > 0 ? `
        <div class="space-y-4">
            ${questions.map((q, qi) => {
                const hasOpts = Array.isArray(q.options) && q.options.length > 0;
                const savedVal = draft[q.id || `lq-${qi}`] || "";
                return `
                    <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5" id="l-qbox-${qi}">
                        <p class="text-sm font-bold text-white"><span class="text-violet-400 mr-1">Question ${qi + 1}:</span> ${escHtml(q.question)}</p>
                        ${hasOpts ? `
                            <div class="grid gap-2">
                                ${(q.options || []).map(opt => `
                                    <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border ${savedVal === opt ? "border-violet-400 bg-violet-500/15" : "border-white/10"} cursor-pointer hover:border-violet-500/40 text-xs text-slate-200">
                                        <input type="radio" name="l-mc-${qi}" value="${escHtml(opt)}" ${savedVal === opt ? "checked" : ""} onchange="onListeningDraftInput(${qi}, this.value)" class="accent-violet-500">
                                        <span>${escHtml(opt)}</span>
                                    </label>
                                `).join("")}
                            </div>
                        ` : `
                            <input type="text" id="l-mc-input-${qi}" value="${escHtml(savedVal)}" oninput="onListeningDraftInput(${qi}, this.value)" placeholder="Nhập câu trả lời của bạn..." class="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500">
                        `}
                        <div id="l-qfb-${qi}" class="hidden text-xs pt-2 border-t border-white/10"></div>
                    </div>
                `;
            }).join("")}
        </div>
        <button id="l-submit-mc-btn" onclick="gradeListeningMCQuestions()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg mt-4">
            Nộp ${escHtml(activeSet.label)} &amp; Xem đáp án + Transcript
        </button>
    ` : `
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
            <label class="text-xs font-extrabold uppercase text-cyan-300 block">📝 Ghi chép nội dung bạn nghe được (hoặc bấm ➕ AI – Generate More Questions phía trên):</label>
            <textarea id="custom-listening-notes" rows="5" placeholder="Nghe đoạn âm thanh phía trên và ghi lại ý chính, câu thoại hoặc từ mới bạn nghe được..." class="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"></textarea>
            <div class="flex flex-wrap gap-2">
                <button onclick="finalizeListeningCompletion(100); showToast('Đã đánh dấu hoàn thành bài nghe cá nhân!');" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs">
                    ✅ Đánh dấu đã hoàn thành
                </button>
            </div>
        </div>
    `;
    updateListeningTestProgress();
}

function renderListenChooseView(isFullTest = false) {
    const ex = activeListeningItem;
    const activeSet = getActiveListeningQuestionSet();
    const questions = activeSet.questions || [];
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

        <div id="listening-qsets-bar"></div>
        <div id="listening-questions-wrap"></div>

        <div id="listening-result-box" class="hidden"></div>
        <div id="listening-transcript-box" class="hidden p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/25 space-y-2"></div>
    `;

    listeningBindExternalAudioSync();
    if (typeof LearningHub !== "undefined") {
        LearningHub.renderQuestionSetsBar("listening", ex.id, ex.questions || [], "listening-qsets-bar", {
            lessonTitle: ex.title,
            lessonLevel: ex.level || "B1",
            lessonContent: { title: ex.title, transcript: ex.transcript || ex.audioText || (ex.sentences || []).join(" ") },
            onSelect: () => {
                listeningStartedAt = Date.now();
                document.getElementById("listening-result-box")?.classList.add("hidden");
                renderListeningQuestionsSectionOnly();
            }
        });
    }
    renderListeningQuestionsSectionOnly();
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
    const questions = getActiveListeningQuestionSet().questions || [];
    const total = questions.length;
    if (!total) return;
    let answered = 0;
    questions.forEach((q, i) => {
        if (Array.isArray(q.options) && q.options.length > 0) {
            if (document.querySelector(`input[name="l-mc-${i}"]:checked`)) answered++;
        } else {
            if ((document.getElementById(`l-mc-input-${i}`)?.value || "").trim() !== "") answered++;
        }
    });
    const lbl = document.getElementById("l-test-prog-label");
    const bar = document.getElementById("l-test-prog-bar");
    if (lbl) lbl.textContent = `${answered} / ${total}`;
    if (bar) bar.style.width = `${Math.round((answered / total) * 100)}%`;
}

function gradeListeningMCQuestions() {
    clearInterval(fullTestTimerId);
    if (!activeListeningItem) return;
    const activeSet = getActiveListeningQuestionSet();
    const questions = activeSet.questions || [];
    let correct = 0;
    const detailedAnswers = [];

    questions.forEach((q, qi) => {
        const hasOpts = Array.isArray(q.options) && q.options.length > 0;
        const picked = hasOpts
            ? (document.querySelector(`input[name="l-mc-${qi}"]:checked`)?.value || "")
            : ((document.getElementById(`l-mc-input-${qi}`)?.value || "").trim());
        const accepted = [q.answer, ...(q.acceptableAnswers || [])].map(a => normalizeWords(a)).filter(Boolean);
        const normP = normalizeWords(picked);
        const ok = Boolean(normP) && accepted.includes(normP);
        if (ok) correct++;
        const expText = q.explanationVi || q.explanation || "";
        detailedAnswers.push({
            question: q.question,
            userAnswer: picked,
            correctAnswer: q.answer,
            isCorrect: ok,
            explanationVi: expText
        });

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
                <p class="text-slate-300 mt-1">💡 ${escHtml(expText)}</p>
            `;
        }
    });

    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 100;
    const resBox = document.getElementById("listening-result-box");
    if (resBox) {
        resBox.classList.remove("hidden");
        resBox.innerHTML = `
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <h4 class="text-lg font-black text-white">Điểm ${escHtml(activeSet.label)}: <span class="text-amber-300">${correct} / ${questions.length} (${pct}%)</span></h4>
            </div>
        `;
    }
    finalizeListeningCompletion(pct, {
        questionSetId: activeSet.id,
        questionSetLabel: activeSet.label,
        cefrLevel: activeSet.cefrLevel || activeListeningItem.level || "B1",
        correctCount: correct,
        totalCount: questions.length,
        answers: detailedAnswers
    });
    if (typeof LearningHub !== "undefined") {
        LearningHub.renderQuestionSetsBar("listening", activeListeningItem.id, activeListeningItem.questions || [], "listening-qsets-bar", {
            lessonTitle: activeListeningItem.title,
            lessonLevel: activeListeningItem.level || "B1",
            lessonContent: { title: activeListeningItem.title, transcript: activeListeningItem.transcript || activeListeningItem.audioText || "" },
            onSelect: () => {
                listeningStartedAt = Date.now();
                document.getElementById("listening-result-box")?.classList.add("hidden");
                renderListeningQuestionsSectionOnly();
            }
        });
    }
}

function finalizeListeningCompletion(scorePct, meta = {}) {
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
    if (typeof LearningHub !== "undefined") {
        const durationSec = Math.max(1, Math.round((Date.now() - (listeningStartedAt || Date.now())) / 1000));
        LearningHub.recordAttempt({
            skill: "listening",
            sourceScope: "standalone",
            lessonId: activeListeningItem.id,
            lessonTitle: activeListeningItem.title,
            questionSetId: meta.questionSetId || "set-1",
            questionSetLabel: meta.questionSetLabel || "Bộ câu hỏi 1",
            exerciseType: activeListeningItem.type || "listening",
            cefrLevel: meta.cefrLevel || activeListeningItem.level || "B1",
            score10: Math.round((scorePct / 10) * 10) / 10,
            scorePct,
            correctCount: Number.isFinite(meta.correctCount) ? meta.correctCount : 1,
            totalCount: Number.isFinite(meta.totalCount) ? meta.totalCount : 1,
            durationSec,
            answers: Array.isArray(meta.answers) ? meta.answers : []
        });
    }
    showToast(`Hoàn thành bài nghe (${scorePct}%)! Đã lưu vào Learning History & mở Transcript.`);
}

/* ==================== AI LISTENING COACH ==================== */
async function runAIListeningCoach() {
    if (!activeListeningItem) return;
    const tr = String(activeListeningItem.transcript || activeListeningItem.audioText || "").trim();
    const outBox = document.getElementById("listening-coach-output");
    if (!outBox || !tr) {
        showToast("Bài nghe này chưa có transcript văn bản để AI phân tích cụm từ.", "warning");
        return;
    }
    outBox.classList.remove("hidden");
    outBox.innerHTML = `<div class="p-3 rounded-xl bg-slate-900 border border-violet-500/30 text-xs text-violet-300 font-bold animate-pulse">⏳ AI Listening Coach đang bóc cụm từ nối âm / dễ nghe nhầm & câu hỏi nghe hiểu...</div>`;

    const res = await AIClient.request("listening-coach", {
        title: activeListeningItem.title,
        level: activeListeningItem.level || "B1",
        transcript: tr,
        focus: activeListeningItem.sentences?.[dictationIdx] || ""
    });

    if (!res.ok || !res.data) {
        outBox.innerHTML = `<div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex justify-between items-center"><span>${escHtml(res.error || "Cần kết nối AI Backend để phân tích cụm từ nối âm & câu hỏi nghe hiểu.")}</span><button onclick="document.getElementById('listening-coach-output').classList.add('hidden')" class="ml-2">✕</button></div>`;
        return;
    }

    const d = res.data;
    outBox.innerHTML = `
        <div class="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2.5 text-xs">
            <div class="flex items-center justify-between">
                <span class="font-extrabold text-cyan-300">🎧 AI Listening Coach — Phân Tích Transcript</span>
                <button onclick="document.getElementById('listening-coach-output').classList.add('hidden')" class="text-slate-400 hover:text-white">✕</button>
            </div>
            <p class="text-slate-200">${escHtml(d.summaryVi || "")}</p>
            ${(d.keyPhrases && d.keyPhrases.length) ? `
                <div class="space-y-1">
                    <p class="font-bold text-amber-300">Cụm từ & Mẹo nghe nối âm:</p>
                    ${d.keyPhrases.map(p => `<div class="p-2 rounded-lg bg-slate-950 border border-white/5"><strong class="text-white">${escHtml(p.phrase)}</strong> (${escHtml(p.meaningVi || "")}) — <span class="text-cyan-300">${escHtml(p.connectedSpeechTip || "")}</span></div>`).join("")}
                </div>
            ` : ""}
        </div>
    `;
}
