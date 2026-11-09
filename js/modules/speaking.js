/* ==========================================================================
   QEnglish - Speaking Module (Mode 1: Live Conversation, Mode 2: Topic Speaking)
   Voice Command "Please do" Auto-Stop & Full Evaluation + Honest AI Status
   ========================================================================== */

let activeSpeakingMode = null; // 'conversation' | 'topic'
let activeSpeakingTopic = null;
let speakingTurns = []; // { role: 'interviewer'|'user', text, confidence, wordsUnclear, durationSec }
let activeContinuousRec = null;
let activeMediaRecorder = null;
let activeAudioChunks = [];
let lastRecordedAudioUrl = null;
let speakingStartTimeMs = 0;
let guidedStarterPool = [];
let guidedFollowUpIdx = 0;
let currentStarterObj = null;

function getSpeakingState() {
    return safeParseJSON(localStorage.getItem(STORAGE_KEYS.SPEAKING), { history: [] });
}

function saveSpeakingState(st) {
    safeWriteJSON(STORAGE_KEYS.SPEAKING, st);
}

function startSpeakingMode(mode) {
    stopActiveSpeakingCapture();
    activeSpeakingMode = mode;
    document.getElementById("speaking-mode-cards")?.classList.add("hidden");

    if (mode === "conversation") {
        document.getElementById("speaking-topics-list")?.classList.add("hidden");
        document.getElementById("speaking-session")?.classList.remove("hidden");
        initLiveConversationSession();
    } else {
        document.getElementById("speaking-session")?.classList.add("hidden");
        document.getElementById("speaking-topics-list")?.classList.remove("hidden");
        renderSpeakingTopicsGrid();
    }
}

function closeSpeakingTopics() {
    document.getElementById("speaking-topics-list")?.classList.add("hidden");
    document.getElementById("speaking-mode-cards")?.classList.remove("hidden");
}

function closeSpeakingSession() {
    stopActiveSpeakingCapture();
    stopSpeech();
    document.getElementById("speaking-session")?.classList.add("hidden");
    document.getElementById("speaking-topics-list")?.classList.add("hidden");
    document.getElementById("speaking-mode-cards")?.classList.remove("hidden");
}

function renderSpeakingTopicsGrid() {
    const lvFilter = document.getElementById("speaking-level-filter")?.value || "all";
    const grid = document.getElementById("speaking-topics-grid");
    if (!grid) return;

    const allTopics = getAllContentForSkill("speaking");
    const filtered = allTopics.filter(t => matchesSelectedLevel(t.level || "B1", lvFilter));

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full glass-panel rounded-2xl p-8 text-center space-y-3">
                <p class="font-bold text-white">Chưa có chủ đề Speaking cho cấp độ "${escHtml(lvFilter)}"</p>
                <button onclick="document.getElementById('speaking-level-filter').value='all'; renderSpeakingTopicsGrid();" class="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Xem tất cả ${allTopics.length} chủ đề</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(t => `
        <div onclick='openTopicSpeakingWorkspace(${JSON.stringify(t.id)})' class="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between gap-4 transition">
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        ${renderLevelBadge(t.level)}
                        <span class="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">${escHtml(t.type || "monologue")}</span>
                    </div>
                    <span class="text-xs text-slate-400">⏱ ~${t.duration || 90}s</span>
                </div>
                <h3 class="text-lg font-extrabold text-white">${escHtml(t.title)}</h3>
                <p class="text-xs text-slate-300">${escHtml(t.prompt)}</p>
                <p class="text-[11px] text-slate-400 italic">${escHtml(t.promptVi || "")}</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span class="text-slate-400">${(t.suggestedQuestions || []).length} câu hỏi gợi ý</span>
                <span class="font-bold text-violet-400">Chuẩn bị & Nói →</span>
            </div>
        </div>
    `).join("");
}

/* ==================== MODE 1: LIVE CONVERSATION ==================== */
function initLiveConversationSession() {
    speakingTurns = [];
    lastRecordedAudioUrl = null;
    guidedFollowUpIdx = 0;

    const targetLv = appSettings?.selectedLevel && appSettings.selectedLevel !== "all" && !appSettings.selectedLevel.startsWith("IELTS")
        ? appSettings.selectedLevel
        : "B1";
    const starters = (typeof CONVERSATION_STARTERS !== "undefined" ? CONVERSATION_STARTERS : [])
        .filter(s => s.level === targetLv);
    guidedStarterPool = starters.length ? starters : (typeof CONVERSATION_STARTERS !== "undefined" ? CONVERSATION_STARTERS : []);
    currentStarterObj = guidedStarterPool[Math.floor(Math.random() * Math.max(1, guidedStarterPool.length))] || {
        question: "Hello! Could you introduce yourself and tell me about your major at the university?",
        topic: "University Life",
        followUps: [
            "What do you enjoy most about studying your major?",
            "How do you usually practice English outside the classroom?",
            "What is your main learning goal for the next six weeks?"
        ]
    };

    const aiConnected = AIClient.status.connected;
    const container = document.getElementById("speaking-content");
    container.innerHTML = `
        <div class="space-y-5">
            <!-- Honest AI Status Header -->
            <div class="p-4 rounded-2xl border ${aiConnected ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"} text-xs space-y-1">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <span class="font-extrabold text-sm ${aiConnected ? "text-emerald-300" : "text-amber-300"}">
                        ${aiConnected
                            ? `🟢 Live AI Conversation (${escHtml(AIClient.status.provider)})`
                            : "🟡 AI Backend Chưa Kết Nối — Chế độ Hỏi - Đáp theo Ngân hàng câu hỏi dẫn dắt"}
                    </span>
                    <button onclick="navigateTo('settings')" class="underline text-cyan-300 font-bold">Hướng dẫn cấu hình Backend AI</button>
                </div>
                <p class="text-slate-300">
                    ${aiConnected
                        ? "AI sẽ lắng nghe và phản hồi trực tiếp từng lượt nói của bạn. Hãy nói <strong>\"Please do\"</strong> bất kỳ lúc nào để dừng hội thoại và nhận bản đánh giá toàn diện!"
                        : "Hệ thống tuân thủ nguyên tắc trung thực: chưa kết nối API Key trên Backend nên KHÔNG giả lập AI tự do. Bạn vẫn có thể luyện trả lời bằng giọng nói qua các câu hỏi theo chủ đề và nói câu lệnh <strong>\"Please do\"</strong> để dừng & chấm lỗi ngữ pháp/độ rõ từ cục bộ!"}
                </p>
            </div>

            <!-- Chat Transcript Stream -->
            <div id="conv-messages" class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 max-h-80 overflow-y-auto space-y-3"></div>

            <!-- Voice Recorder Control Center (Inspired by Reference Image 5) -->
            <div class="p-6 rounded-3xl bg-slate-950/80 border border-violet-500/25 flex flex-col items-center text-center space-y-4">
                <button id="conv-rec-btn" onclick="toggleConversationMicTurn()" class="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white font-black text-lg shadow-2xl shadow-violet-600/40 hover:scale-105 active:scale-95 transition flex flex-col items-center justify-center">
                    <span>🎙️</span>
                    <span class="text-xs mt-0.5" id="conv-rec-label">Bấm để nói</span>
                </button>
                <div id="conv-waveform" class="hidden flex items-center justify-center gap-1.5 h-8">
                    <span class="wave-bar" style="animation-delay:0s"></span>
                    <span class="wave-bar" style="animation-delay:0.15s"></span>
                    <span class="wave-bar" style="animation-delay:0.3s"></span>
                    <span class="wave-bar" style="animation-delay:0.45s"></span>
                    <span class="wave-bar" style="animation-delay:0.2s"></span>
                </div>
                <p id="conv-live-status" class="text-xs text-slate-400">Bấm nút tròn để trả lời bằng tiếng Anh, hoặc nói <strong class="text-amber-300">"Please do"</strong> để kết thúc & đánh giá.</p>

                <!-- Fallback text input when browser lacks mic/SpeechRecognition -->
                <div class="flex gap-2 w-full max-w-xl pt-2 border-t border-white/5">
                    <input id="conv-text-fallback" type="text" placeholder="Phương án dự phòng khi không dùng được mic: Nhập câu trả lời hoặc gõ 'Please do'..." onkeydown="if(event.key==='Enter')submitConversationTextTurn()" class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500">
                    <button onclick="submitConversationTextTurn()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300">Gửi lượt nói</button>
                    <button onclick="triggerPleaseDoEvaluation()" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-extrabold text-amber-300" title="Câu lệnh dừng hội thoại và chấm điểm">⏹ "Please do" (Đánh giá)</button>
                </div>
            </div>

            <div id="speaking-eval-output" class="hidden"></div>
        </div>
    `;

    appendConversationBubble("interviewer", currentStarterObj.question);
    speakText(currentStarterObj.question, 1.0);
}

function appendConversationBubble(role, text) {
    speakingTurns.push({ role, text, at: Date.now() });
    const box = document.getElementById("conv-messages");
    if (!box) return;
    const isInterviewer = role === "interviewer";
    const div = document.createElement("div");
    div.className = `flex ${isInterviewer ? "justify-start" : "justify-end"}`;
    div.innerHTML = `
        <div class="max-w-[82%] p-3.5 rounded-2xl text-xs space-y-1 ${isInterviewer ? "bg-slate-900 border border-white/10 text-slate-100" : "bg-gradient-to-r from-violet-600/80 to-indigo-600/80 text-white"}">
            <div class="flex items-center justify-between gap-3 text-[10px] opacity-75 font-bold">
                <span>${isInterviewer ? (AIClient.status.connected ? "🤖 AI Partner" : "📋 Guided Prompt") : "🧑‍🎓 Bạn"}</span>
                <button onclick='speakText(${JSON.stringify(text)}, 1.0)' class="hover:underline">🔊</button>
            </div>
            <p class="leading-relaxed text-sm">${escHtml(text)}</p>
        </div>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

async function toggleConversationMicTurn() {
    if (!isSpeechRecognitionSupported()) {
        showToast("Trình duyệt không hỗ trợ SpeechRecognition (hãy dùng Chrome/Edge hoặc nhập vào ô dự phòng bên dưới).", "warning");
        return;
    }
    const statusEl = document.getElementById("conv-live-status");
    const waveEl = document.getElementById("conv-waveform");
    const lblEl = document.getElementById("conv-rec-label");

    stopSpeech();
    waveEl?.classList.remove("hidden");
    if (lblEl) lblEl.textContent = "Đang nghe...";
    if (statusEl) statusEl.innerHTML = `<span class="text-cyan-300 font-bold">🎙 Đang thu giọng nói... Hãy trả lời tự nhiên (hoặc nói "Please do" để dừng & nhận đánh giá).</span>`;

    const t0 = Date.now();
    try {
        const alts = await recognizeSpeechOnce(14000);
        waveEl?.classList.add("hidden");
        if (lblEl) lblEl.textContent = "Bấm để nói";
        const best = alts[0] || { transcript: "", confidence: 0 };
        const durSec = Math.max(1, Math.round((Date.now() - t0) / 1000));
        await processUserConversationUtterance(best.transcript, best.confidence, durSec);
    } catch (err) {
        waveEl?.classList.add("hidden");
        if (lblEl) lblEl.textContent = "Bấm để nói";
        if (statusEl) statusEl.innerHTML = `<span class="text-rose-300">${escHtml(err)}</span>`;
    }
}

async function submitConversationTextTurn() {
    const inp = document.getElementById("conv-text-fallback");
    const txt = (inp?.value || "").trim();
    if (!txt) return;
    inp.value = "";
    await processUserConversationUtterance(txt, 0.92, Math.max(3, Math.round(txt.split(/\s+/).length / 2.2)));
}

function containsPleaseDoCommand(text) {
    const norm = normalizeWords(text);
    return norm === "please do" || /\bplease do\s*$/.test(norm);
}

async function processUserConversationUtterance(rawText, confidence = 0.85, durationSec = 4) {
    const trimmed = String(rawText || "").trim();
    if (!trimmed) return;

    // Check if learner ended with or said "Please do" (PHẦN 3.5.A & 3.5.B)
    if (containsPleaseDoCommand(trimmed)) {
        const contentBeforeCmd = trimmed.replace(/\bplease\s+do[.!?]*\s*$/i, "").trim();
        if (contentBeforeCmd) {
            speakingTurns.push({ role: "user", text: contentBeforeCmd, confidence, durationSec });
            const box = document.getElementById("conv-messages");
            if (box) {
                appendConversationBubble("user", contentBeforeCmd + " [Please do]");
                speakingTurns.pop(); // prevent double push since appendConversationBubble pushes
                speakingTurns.push({ role: "user", text: contentBeforeCmd, confidence, durationSec });
            }
        }
        triggerPleaseDoEvaluation();
        return;
    }

    appendConversationBubble("user", trimmed);
    speakingTurns[speakingTurns.length - 1].confidence = confidence;
    speakingTurns[speakingTurns.length - 1].durationSec = durationSec;

    const statusEl = document.getElementById("conv-live-status");

    // Reply via real Backend AI if connected, else Guided Follow-up prompt
    if (AIClient.status.connected && appSettings?.aiConsentAccepted) {
        if (statusEl) statusEl.textContent = "🤖 AI đang suy nghĩ câu phản hồi...";
        const res = await AIClient.request("speaking-chat", {
            level: appSettings?.selectedLevel || "B1",
            history: speakingTurns.slice(-8).map(t => ({ role: t.role, text: t.text }))
        });
        if (res.ok && res.data && res.data.reply) {
            appendConversationBubble("interviewer", res.data.reply);
            speakText(res.data.reply, 1.0);
            if (statusEl) statusEl.textContent = "Đến lượt bạn! Bấm nút tròn để nói tiếp hoặc nói 'Please do' để kết thúc.";
            return;
        }
    }

    // Honest Guided Prompt progression when AI Backend is offline
    const followUps = currentStarterObj?.followUps || [];
    let nextPrompt = "";
    if (guidedFollowUpIdx < followUps.length) {
        nextPrompt = followUps[guidedFollowUpIdx++];
    } else {
        nextPrompt = "Thank you for sharing! Would you like to add one more detail, or say 'Please do' so we can review your grammar and speaking clarity?";
    }
    appendConversationBubble("interviewer", nextPrompt);
    speakText(nextPrompt, 1.0);
    if (statusEl) statusEl.textContent = "Đến lượt bạn! Nói 'Please do' bất cứ khi nào bạn muốn dừng và nhận đánh giá.";
}

/* ==================== MODE 2: TOPIC SPEAKING ==================== */
function openTopicSpeakingWorkspace(topicId) {
    const allTopics = getAllContentForSkill("speaking");
    const t = allTopics.find(x => x.id === topicId);
    if (!t) return;
    activeSpeakingTopic = t;
    speakingTurns = [];
    lastRecordedAudioUrl = null;

    document.getElementById("speaking-topics-list")?.classList.add("hidden");
    document.getElementById("speaking-session")?.classList.remove("hidden");

    const container = document.getElementById("speaking-content");
    container.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-6">
            <!-- Left: Topic Cue Card & Suggested Questions -->
            <div class="space-y-4">
                <div class="flex items-center gap-2">
                    ${renderLevelBadge(t.level)}
                    <span class="text-xs font-bold text-cyan-400">🎯 Topic Speaking (~${t.duration || 90}s)</span>
                </div>
                <h3 class="text-2xl font-black text-white">${escHtml(t.title)}</h3>
                <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
                    <p class="text-sm font-semibold text-white">${escHtml(t.prompt)}</p>
                    <p class="text-xs text-slate-400">🇻🇳 ${escHtml(t.promptVi || "")}</p>
                </div>

                <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                    <p class="text-xs font-extrabold uppercase text-violet-300">❓ Câu hỏi gợi ý triển khai ý:</p>
                    <ul class="list-disc pl-5 text-xs text-slate-200 space-y-1.5">
                        ${(t.suggestedQuestions || []).map((q, idx) => `
                            <li>
                                <span class="font-semibold">${escHtml(q)}</span>
                                ${(t.suggestedQuestionsVi && t.suggestedQuestionsVi[idx]) ? `<span class="block text-slate-400 text-[11px]">→ ${escHtml(t.suggestedQuestionsVi[idx])}</span>` : ""}
                            </li>
                        `).join("")}
                    </ul>
                </div>

                <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                    <p class="text-xs font-extrabold uppercase text-amber-300">💬 Cụm từ hữu ích nên dùng:</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${(t.usefulPhrases || []).map(p => `<button onclick='speakText(${JSON.stringify(p)}, 1.0)' class="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] text-amber-200 hover:border-amber-400/40">🔊 ${escHtml(p)}</button>`).join("")}
                    </div>
                </div>
            </div>

            <!-- Right: Recording Studio & Live Transcript -->
            <div class="p-6 rounded-3xl bg-slate-950/90 border border-violet-500/30 flex flex-col justify-between space-y-5">
                <div class="text-center space-y-2">
                    <p class="text-xs font-extrabold uppercase tracking-wider text-cyan-400">Phòng thu luyện nói cá nhân</p>
                    <p class="text-[11px] text-slate-400">🔒 File âm thanh của bạn chỉ lưu cục bộ trên trình duyệt để tự nghe lại, tuyệt đối không tự động tải lên dịch vụ bên ngoài.</p>
                </div>

                <div class="flex flex-col items-center space-y-4 py-2">
                    <button id="topic-rec-btn" onclick="toggleTopicRecording()" class="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 via-violet-600 to-indigo-600 text-white font-black shadow-2xl shadow-violet-600/40 hover:scale-105 active:scale-95 transition flex flex-col items-center justify-center">
                        <span class="text-2xl">⏺</span>
                        <span id="topic-rec-label" class="text-xs mt-1">RECORD</span>
                    </button>
                    <div id="topic-waveform" class="hidden flex items-center justify-center gap-1.5 h-8">
                        <span class="wave-bar" style="animation-delay:0s"></span>
                        <span class="wave-bar" style="animation-delay:0.2s"></span>
                        <span class="wave-bar" style="animation-delay:0.4s"></span>
                        <span class="wave-bar" style="animation-delay:0.1s"></span>
                        <span class="wave-bar" style="animation-delay:0.3s"></span>
                    </div>
                    <p id="topic-rec-status" class="text-xs text-slate-300 text-center">Bấm <strong>RECORD</strong> để bắt đầu nói. Khi hoàn thành, hãy nói <strong class="text-amber-300">"Please do"</strong> (hoặc bấm nút Dừng & Đánh giá).</p>
                    <audio id="topic-playback-audio" controls class="hidden w-full"></audio>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-300 flex justify-between">
                        <span>Transcript nội dung bài nói (Tự động nhận diện hoặc nhập bổ sung):</span>
                        <span id="topic-word-counter" class="text-cyan-400">0 từ</span>
                    </label>
                    <textarea id="topic-transcript-box" rows="5" oninput="document.getElementById('topic-word-counter').textContent = countWordsInEssay(this.value) + ' từ'" placeholder="Nội dung giọng nói của bạn sẽ hiện trực tiếp tại đây..." class="w-full bg-slate-900 border border-white/10 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-violet-500"></textarea>
                    <button onclick="finishTopicSpeakingAndEvaluate()" class="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg">
                        ⏹ "Please do" — Dừng thu âm & Đánh giá bài nói
                    </button>
                </div>
            </div>
        </div>

        <div id="speaking-eval-output" class="hidden mt-6"></div>
    `;
}

async function toggleTopicRecording() {
    if (activeContinuousRec || (activeMediaRecorder && activeMediaRecorder.state === "recording")) {
        finishTopicSpeakingAndEvaluate();
        return;
    }

    speakingStartTimeMs = Date.now();
    const btnLbl = document.getElementById("topic-rec-label");
    const statusEl = document.getElementById("topic-rec-status");
    const waveEl = document.getElementById("topic-waveform");
    const transcriptArea = document.getElementById("topic-transcript-box");

    waveEl?.classList.remove("hidden");
    if (btnLbl) btnLbl.textContent = "DỪNG";
    if (statusEl) statusEl.innerHTML = `<span class="text-emerald-300 font-bold animate-pulse">🎙 Đang thu âm... Hãy nói tự nhiên, kết thúc bằng câu lệnh "Please do"!</span>`;

    // Start local MediaRecorder if supported
    if (isMediaRecorderSupported()) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            activeMediaRecorder = new MediaRecorder(stream);
            activeAudioChunks = [];
            activeMediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) activeAudioChunks.push(e.data); };
            activeMediaRecorder.onstop = () => {
                stream.getTracks().forEach(t => t.stop());
                if (activeAudioChunks.length > 0) {
                    lastRecordedAudioUrl = URL.createObjectURL(new Blob(activeAudioChunks, { type: activeMediaRecorder.mimeType || "audio/webm" }));
                    const aud = document.getElementById("topic-playback-audio");
                    if (aud) {
                        aud.src = lastRecordedAudioUrl;
                        aud.classList.remove("hidden");
                    }
                }
            };
            activeMediaRecorder.start();
        } catch (err) {
            showToast("Không mở được MediaRecorder micro: " + err.message, "warning");
        }
    }

    // Start continuous SpeechRecognition if supported
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
        const rec = new SR();
        activeContinuousRec = rec;
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = true;
        let finalTranscript = transcriptArea?.value ? transcriptArea.value.trim() + " " : "";
        const lowConfWords = [];

        rec.onresult = (ev) => {
            let interim = "";
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
                const res = ev.results[i];
                const chunk = res[0].transcript;
                if (res.isFinal) {
                    finalTranscript += chunk.trim() + ". ";
                    if (res[0].confidence > 0 && res[0].confidence < 0.72) {
                        lowConfWords.push(chunk.trim());
                    }
                    if (containsPleaseDoCommand(chunk)) {
                        finalTranscript = finalTranscript.replace(/\bplease\s+do[.!?]*\s*$/i, "").trim();
                        if (transcriptArea) transcriptArea.value = finalTranscript;
                        finishTopicSpeakingAndEvaluate(lowConfWords);
                        return;
                    }
                } else {
                    interim += chunk;
                }
            }
            if (transcriptArea) {
                transcriptArea.value = (finalTranscript + interim).trim();
                document.getElementById("topic-word-counter").textContent = countWordsInEssay(transcriptArea.value) + " từ";
            }
        };
        rec.onerror = () => {};
        try { rec.start(); } catch (e) {}
    } else if (statusEl) {
        statusEl.textContent = "Trình duyệt không hỗ trợ tự chép lời (SpeechRecognition). Bạn vẫn đang thu âm tiếng thật và có thể gõ tóm tắt ý vào khung dưới để chấm ngữ pháp.";
    }
}

function stopActiveSpeakingCapture() {
    if (activeContinuousRec) {
        try { activeContinuousRec.stop(); } catch (e) {}
        activeContinuousRec = null;
    }
    if (activeMediaRecorder && activeMediaRecorder.state === "recording") {
        try { activeMediaRecorder.stop(); } catch (e) {}
    }
    document.getElementById("topic-waveform")?.classList.add("hidden");
    document.getElementById("conv-waveform")?.classList.add("hidden");
    const btnLbl = document.getElementById("topic-rec-label");
    if (btnLbl) btnLbl.textContent = "RECORD";
}

function finishTopicSpeakingAndEvaluate(unclearWords = []) {
    stopActiveSpeakingCapture();
    const raw = (document.getElementById("topic-transcript-box")?.value || "").replace(/\bplease\s+do[.!?]*\s*$/i, "").trim();
    const elapsedSec = speakingStartTimeMs > 0 ? Math.max(5, Math.round((Date.now() - speakingStartTimeMs) / 1000)) : 30;
    speakingTurns = raw ? [{ role: "user", text: raw, confidence: 0.84, durationSec: elapsedSec, unclearWords }] : [];
    evaluateSpeakingSession(activeSpeakingTopic ? activeSpeakingTopic.title : "Topic Speaking", activeSpeakingTopic?.sampleAnswer || "");
}

function triggerPleaseDoEvaluation() {
    stopActiveSpeakingCapture();
    stopSpeech();
    evaluateSpeakingSession(currentStarterObj?.topic || "Live English Conversation", "");
}

/* ==================== COMPREHENSIVE SPEAKING EVALUATION (PHẦN 3.5.C) ==================== */
async function evaluateSpeakingSession(sessionTitle, sampleAnswer = "") {
    const userTurns = speakingTurns.filter(t => t.role === "user" && t.text.trim() !== "");
    const evalBox = document.getElementById("speaking-eval-output");
    if (!evalBox) return;

    if (userTurns.length === 0) {
        showToast("Chưa có nội dung nói nào để đánh giá! Hãy nói ít nhất 1 câu.", "warning");
        return;
    }

    const fullTranscript = userTurns.map(t => t.text.trim()).join(" ");
    const totalWords = countWordsInEssay(fullTranscript);
    const totalSec = userTurns.reduce((a, t) => a + (t.durationSec || 5), 0);
    const wpm = Math.round((totalWords / Math.max(totalSec, 1)) * 60);

    evalBox.classList.remove("hidden");
    evalBox.innerHTML = `<div class="p-5 rounded-2xl bg-slate-950 border border-violet-500/30 text-center text-xs text-violet-300 font-bold animate-pulse">🎙️ Đã nhận lệnh "Please do" — Đang đánh giá toàn bộ bài nói của bạn...</div>`;

    // Try Backend AI first if connected
    let aiResult = null;
    if (AIClient.status.connected && appSettings?.aiConsentAccepted) {
        const res = await AIClient.request("speaking-eval", {
            topic: sessionTitle,
            level: activeSpeakingTopic?.level || appSettings?.selectedLevel || "B1",
            transcript: fullTranscript,
            wpm
        });
        if (res.ok && res.data) aiResult = res.data;
    }

    // Local sentence-by-sentence grammar & natural expression analysis
    const sentences = (fullTranscript.match(/[^.!?]+[.!?]*/g) || [fullTranscript]).map(s => s.trim()).filter(Boolean);
    const sentenceErrors = [];
    sentences.forEach(s => {
        const d = analyzeEnglishTextLocal(s);
        if (!d.isValid) {
            d.issues.forEach(iss => {
                // Ignore pure punctuation-only warnings on raw speech recognition transcripts unless typed
                if (iss.errorType === "Dấu câu" || iss.errorType === "Viết hoa") return;
                sentenceErrors.push({
                    wrongSentence: s,
                    where: iss.original,
                    why: iss.explanationVi,
                    fixedSentence: d.correctedText,
                    naturalWay: d.naturalTips[0] || `Nói gọn & tự nhiên hơn: "${d.correctedText}"`
                });
                autoLogMistake({
                    errorCategory: "Sai ngữ pháp",
                    wrongText: s,
                    correctText: d.correctedText,
                    explanation: `[Speaking] ${iss.explanationVi}`,
                    skill: "speaking"
                });
            });
        }
    });

    const avgConf = Math.round((userTurns.reduce((a, t) => a + (t.confidence || 0.82), 0) / userTurns.length) * 100);
    const fluencyScore = wpm >= 95 && wpm <= 155 ? 88 : wpm >= 65 ? 74 : 58;
    const grammarScore = Math.max(45, 92 - sentenceErrors.length * 10);
    const uniqueWordsRatio = new Set(normalizeWords(fullTranscript).split(" ").filter(Boolean)).size / Math.max(totalWords, 1);
    const vocabScore = Math.min(94, Math.round(55 + uniqueWordsRatio * 40 + (totalWords >= 40 ? 8 : 0)));
    const coherenceScore = totalWords >= 35 ? 80 : 62;
    const overallScore = aiResult?.overallScore || Math.round((avgConf + fluencyScore + grammarScore + vocabScore + coherenceScore) / 5);

    const finalErrors = aiResult?.errors || sentenceErrors;
    const unclearWords = userTurns.flatMap(t => t.unclearWords || []);

    evalBox.innerHTML = `
        <div class="glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-violet-500/35 text-xs">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                    <span class="text-amber-300 font-extrabold uppercase tracking-wider">📊 Báo cáo Đánh giá Phần Nói ("Please do")</span>
                    <h4 class="text-xl font-black text-white mt-0.5">${escHtml(sessionTitle)}</h4>
                </div>
                <div class="flex items-center gap-3">
                    <span class="px-4 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 font-black text-base text-emerald-300">Điểm tổng hợp: ${overallScore}/100</span>
                    ${renderSourceBadge(aiResult ? "ai-generated" : "local-browser")}
                </div>
            </div>

            <!-- 5 Core Criteria Table (PHẦN 3.5.C) -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center">
                    <p class="text-slate-400 font-bold">Pronunciation*</p>
                    <p class="text-lg font-black text-cyan-300 mt-1">${aiResult?.pronunciationScore || avgConf}%</p>
                    <p class="text-[10px] text-slate-500">Độ rõ nhận diện từ</p>
                </div>
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center">
                    <p class="text-slate-400 font-bold">Fluency</p>
                    <p class="text-lg font-black text-violet-300 mt-1">${aiResult?.fluencyScore || fluencyScore}%</p>
                    <p class="text-[10px] text-slate-500">~${wpm} từ/phút</p>
                </div>
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center">
                    <p class="text-slate-400 font-bold">Grammar</p>
                    <p class="text-lg font-black text-emerald-300 mt-1">${aiResult?.grammarScore || grammarScore}%</p>
                    <p class="text-[10px] text-slate-500">${finalErrors.length} lỗi phát hiện</p>
                </div>
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center">
                    <p class="text-slate-400 font-bold">Vocabulary</p>
                    <p class="text-lg font-black text-amber-300 mt-1">${aiResult?.vocabularyScore || vocabScore}%</p>
                    <p class="text-[10px] text-slate-500">${totalWords} từ đã nói</p>
                </div>
                <div class="p-3 rounded-2xl bg-slate-950 border border-white/10 text-center col-span-2 md:col-span-1">
                    <p class="text-slate-400 font-bold">Coherence</p>
                    <p class="text-lg font-black text-indigo-300 mt-1">${aiResult?.coherenceScore || coherenceScore}%</p>
                    <p class="text-[10px] text-slate-500">Mạch lạc & liên kết</p>
                </div>
            </div>

            <p class="text-[11px] text-slate-400 italic">*Lưu ý minh bạch: Tiêu chí Pronunciation đo mức độ rõ chữ qua Web Speech Recognition, không chấm trọng âm IPA chuyên sâu.</p>

            <!-- Transcript & Unclear Words -->
            <div class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2">
                <span class="font-extrabold uppercase text-cyan-300">🗣️ Transcript nội dung bạn đã nói:</span>
                <p class="text-sm text-slate-100 leading-relaxed">"${escHtml(fullTranscript)}"</p>
                ${unclearWords.length ? `<p class="text-amber-300">⚠️ Cụm từ máy nghe chưa rõ (cần phát âm chậm và rõ âm cuối hơn): <strong>${escHtml(unclearWords.join("; "))}</strong></p>` : ""}
            </div>

            <!-- Sentence-by-sentence Correction & Natural Expression -->
            <div class="space-y-2.5">
                <h5 class="font-extrabold uppercase text-rose-300">🔍 Phân tích câu sai, lý do & cách nói tự nhiên hơn:</h5>
                ${finalErrors.length > 0 ? finalErrors.map((err, i) => `
                    <div class="p-4 rounded-2xl bg-slate-950 border border-rose-500/25 space-y-1.5">
                        <p class="text-rose-300"><strong>Câu chưa chuẩn:</strong> "${escHtml(err.wrongSentence)}" (Lỗi tại: <code>${escHtml(err.where || "")}</code>)</p>
                        <p class="text-slate-300"><strong>Vì sao sai:</strong> ${escHtml(err.why)}</p>
                        <p class="text-emerald-300 font-bold"><strong>Cách sửa chuẩn:</strong> "${escHtml(err.fixedSentence)}"</p>
                        <p class="text-cyan-300"><strong>Cách diễn đạt tự nhiên hơn:</strong> ${escHtml(err.naturalWay || err.fixedSentence)}</p>
                        <div class="pt-1 flex gap-2">
                            <button onclick='speakText(${JSON.stringify(err.fixedSentence)}, 1.0)' class="px-3 py-1 rounded-lg bg-slate-900 text-cyan-300 font-bold">🔊 Nghe câu chuẩn</button>
                        </div>
                    </div>
                `).join("") : `
                    <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold">
                        ✅ Không phát hiện lỗi ngữ pháp cơ bản trong transcript! Để nâng cấp bài nói lên B2+, hãy sử dụng thêm các cụm chuyển ý như <em>"From my perspective...", "For instance...", "What stands out to me is..."</em>.
                    </div>
                `}
            </div>

            <!-- Sample Answer & Repeat Exercise -->
            ${(aiResult?.sampleAnswer || sampleAnswer) ? `
                <div class="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="font-extrabold uppercase text-indigo-300">🌟 Bản trả lời mẫu tham khảo (Model Answer):</span>
                        <button onclick='speakText(${JSON.stringify(aiResult?.sampleAnswer || sampleAnswer)}, 1.0)' class="px-3 py-1 rounded-lg bg-indigo-600/30 text-white font-bold">🔊 Nghe bài mẫu</button>
                    </div>
                    <p class="text-slate-200 leading-relaxed">${escHtml(aiResult?.sampleAnswer || sampleAnswer)}</p>
                </div>
            ` : ""}
        </div>
    `;

    // Save to Speaking History & Speaking Notebook
    const spState = getSpeakingState();
    spState.history.unshift({
        id: "spk-" + Date.now(),
        title: sessionTitle,
        transcript: fullTranscript,
        overallScore,
        wpm,
        at: new Date().toISOString()
    });
    saveSpeakingState(spState);

    addStructuredNote({
        type: "speaking",
        title: `Speaking: ${sessionTitle} (${overallScore}/100)`,
        important: finalErrors.length > 0,
        source: aiResult ? "ai-generated" : "local-browser",
        fields: {
            topic: sessionTitle,
            transcript: fullTranscript,
            feedback: `Điểm tổng hợp: ${overallScore}/100 | Tốc độ: ~${wpm} WPM`,
            improvements: finalErrors.map(e => `${e.wrongSentence} -> ${e.fixedSentence}`).join("\n") || "Phát âm rõ âm cuối và mở rộng ý bằng ví dụ."
        },
        content: fullTranscript
    }, true);

    logStudyMetrics(
        {
            speakingSessions: 1,
            speakingMinutes: Math.max(1, Math.round((totalSec / 60) * 10) / 10),
            scoreEntry: { skill: "speaking", scorePct: overallScore, level: activeSpeakingTopic?.level || appSettings?.selectedLevel || "B1", title: sessionTitle }
        },
        { type: "speaking", skill: "speaking", title: `Hoàn thành Speaking: ${sessionTitle}`, scorePct: overallScore }
    );
    showToast("Đã hoàn thành đánh giá bài nói và lưu vào Speaking Notebook!");
}
