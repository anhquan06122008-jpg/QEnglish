/* ==========================================================================
   QEnglish - Audio Engine, Speech Recognition, Local NLP & Honest Backend AI
   SECURITY RULE: Zero API keys in frontend! All AI calls go through Backend.
   ========================================================================== */

let speechRate = 1.0;
let autoPlay = true;

const escHtml = (s) => String(s === undefined || s === null ? "" : s)
    .replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function showToast(msg, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    const colorCls = type === "error"
        ? "bg-rose-600/95 border-rose-400/30"
        : type === "warning"
            ? "bg-amber-600/95 border-amber-400/30"
            : "bg-gradient-to-r from-violet-600 to-indigo-600 border-white/15";
    const icon = type === "error" ? "❗" : type === "warning" ? "⚠️" : "✅";
    toast.className = `toast-anim px-4 py-3 rounded-2xl text-xs font-extrabold text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5 border max-w-sm ${colorCls}`;
    toast.innerHTML = `<span>${icon}</span><span>${escHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.25s ease";
        setTimeout(() => toast.remove(), 260);
    }, 3000);
}

function renderSourceBadge(source) {
    const map = {
        "built-in": { label: "📦 Mặc định", cls: "bg-slate-800 text-slate-300 border-white/10" },
        "local-browser": { label: "🖥️ Lưu trên trình duyệt", cls: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25" },
        "user-imported": { label: "👤 Người học tự thêm", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25" },
        "ai-generated": { label: "🤖 Tạo bởi AI", cls: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
        "external-link": { label: "🌐 Nguồn bên ngoài", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
        "cloud-synced": { label: "☁️ Đã đồng bộ Cloud", cls: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" }
    };
    const info = map[source] || map["local-browser"];
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${info.cls}">${info.label}</span>`;
}

function renderLevelBadge(level) {
    const lv = String(level || "B1").trim();
    const low = lv.toLowerCase();
    let cls = "level-b1";
    if (low.startsWith("ielts")) cls = "bg-amber-500/15 text-amber-300 border border-amber-500/35";
    else if (low === "a1") cls = "level-a1";
    else if (low === "a2") cls = "level-a2";
    else if (low === "b1") cls = "level-b1";
    else if (low === "b2") cls = "level-b2";
    else if (low === "c1") cls = "level-c1";
    else if (low === "c2") cls = "level-c2";
    return `<span class="level-badge ${cls}">${escHtml(lv)}</span>`;
}

/* ==================== SPEECH SYNTHESIS (TTS) ==================== */
function speakText(text, customRate = null, onEndCallback = null) {
    if (!text || !String(text).trim()) return false;
    if (!("speechSynthesis" in window)) {
        showToast("Trình duyệt không hỗ trợ đọc giọng nói (SpeechSynthesis).", "error");
        return false;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text).trim());
    utterance.lang = "en-US";
    const effectiveRate = customRate !== null ? Number(customRate) : speechRate;
    utterance.rate = Math.min(3.0, Math.max(0.1, effectiveRate || 1.0));

    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const preferred = voices.find(v => /en[-_](US|GB)/i.test(v.lang) && /Natural|Online|Google|Microsoft/i.test(v.name))
        || voices.find(v => /^en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;

    if (typeof onEndCallback === "function") {
        utterance.onend = () => onEndCallback();
        utterance.onerror = () => onEndCallback();
    }
    window.speechSynthesis.speak(utterance);
    return true;
}

function stopSpeech() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function updateSpeechRate(val) {
    speechRate = parseFloat(val) || 1.0;
    if (typeof saveSettings === "function") saveSettings({ speechRate });
    const sel = document.getElementById("speed-select");
    if (sel && sel.value !== String(val)) sel.value = String(val);
    showToast(`Đã đổi tốc độ đọc sang ${speechRate}x`);
}

function toggleAutoPlay() {
    autoPlay = !autoPlay;
    if (typeof saveSettings === "function") saveSettings({ autoPlay });
    const txt = document.getElementById("autoplay-text");
    const btn = document.getElementById("btn-autoplay-toggle");
    if (txt) txt.textContent = autoPlay ? "Tự Đọc: Bật" : "Tự Đọc: Tắt";
    if (btn) {
        btn.classList.toggle("text-emerald-400", autoPlay);
        btn.classList.toggle("text-slate-400", !autoPlay);
    }
}

/* ==================== SPEECH RECOGNITION & MEDIA RECORDER ==================== */
function isSpeechRecognitionSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function isMediaRecorderSupported() {
    return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
}

function normalizeWords(str) {
    return String(str || "")
        .toLowerCase()
        .replace(/[’']/g, "'")
        .replace(/[^a-z0-9'\s]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

function compareTranscriptToTarget(spokenRaw, targetRaw) {
    const spokenNorm = normalizeWords(spokenRaw);
    const targetNorm = normalizeWords(targetRaw);
    const sWords = spokenNorm ? spokenNorm.split(" ") : [];
    const tWords = targetNorm ? targetNorm.split(" ") : [];
    if (!tWords.length) return { similarity: 0, matched: [], missing: [], wordDiffHtml: "" };

    // LCS DP for sequence similarity
    const dp = Array.from({ length: sWords.length + 1 }, () => new Array(tWords.length + 1).fill(0));
    for (let i = 1; i <= sWords.length; i++) {
        for (let j = 1; j <= tWords.length; j++) {
            dp[i][j] = sWords[i - 1] === tWords[j - 1]
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    const lcsLen = dp[sWords.length][tWords.length];
    const similarity = Math.round((lcsLen / Math.max(tWords.length, sWords.length, 1)) * 100);

    // Backtrack matched target indices
    const matchedTargetIdx = new Set();
    let i = sWords.length, j = tWords.length;
    while (i > 0 && j > 0) {
        if (sWords[i - 1] === tWords[j - 1]) {
            matchedTargetIdx.add(j - 1);
            i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    const rawTargetTokens = String(targetRaw || "").trim().split(/\s+/);
    const missing = [];
    const wordDiffHtml = rawTargetTokens.map((tok, idx) => {
        if (matchedTargetIdx.has(idx)) {
            return `<span class="text-emerald-300 font-semibold">${escHtml(tok)}</span>`;
        }
        missing.push(tok.replace(/[.,!?;:"]/g, ""));
        return `<span class="text-rose-300 underline decoration-wavy decoration-rose-400 font-semibold" title="Từ chưa nhận diện rõ">${escHtml(tok)}</span>`;
    }).join(" ");

    return {
        similarity,
        spokenText: spokenRaw,
        missing: missing.filter(Boolean),
        wordDiffHtml,
        honestDisclaimer: "Lưu ý minh bạch: Kết quả dựa trên Web Speech Recognition (nhận diện từ qua giọng nói), phản ánh độ rõ chữ khi phát âm, KHÔNG thay thế máy chấm âm vị IPA, trọng âm từ hay ngữ điệu chuyên sâu."
    };
}

function recognizeSpeechOnce(timeoutMs = 9000) {
    return new Promise((resolve, reject) => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            return reject("Trình duyệt hiện tại không hỗ trợ Web Speech Recognition. Vui lòng dùng Google Chrome hoặc Microsoft Edge.");
        }
        const rec = new SR();
        rec.lang = "en-US";
        rec.interimResults = false;
        rec.maxAlternatives = 5;
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                try { rec.stop(); } catch (e) {}
                reject("Hết thời gian chờ micro. Hãy bấm thu và đọc to, rõ chữ hơn.");
            }
        }, timeoutMs);

        rec.onresult = (ev) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            const res = ev.results[0];
            const alternatives = [...res].map(a => ({ transcript: a.transcript, confidence: a.confidence || 0 }));
            resolve(alternatives);
        };
        rec.onerror = (ev) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
                reject("Trình duyệt chưa được cấp quyền sử dụng Micro cho trang này.");
            } else if (ev.error === "no-speech") {
                reject("Không phát hiện giọng nói. Hãy kiểm tra micro và thử lại.");
            } else {
                reject("Không nhận diện rõ giọng nói (" + ev.error + "). Hãy thử lại.");
            }
        };
        rec.onend = () => {
            if (!settled) {
                settled = true;
                clearTimeout(timer);
                reject("Chưa nghe thấy nội dung, vui lòng bấm đọc lại.");
            }
        };
        try {
            rec.start();
        } catch (err) {
            settled = true;
            clearTimeout(timer);
            reject("Không thể khởi động nhận diện giọng nói.");
        }
    });
}

/* ==================== DEEP LOCAL ENGLISH DIAGNOSTIC ENGINE ==================== */
const COMMON_TYPOS_DICT = {
    teh: "the", recieve: "receive", beleive: "believe", definately: "definitely",
    seperate: "separate", occured: "occurred", untill: "until", wich: "which",
    alot: "a lot", tommorow: "tomorrow", freind: "friend", goverment: "government",
    enviroment: "environment", adress: "address", begining: "beginning", thier: "their",
    becuase: "because", neccessary: "necessary", studnet: "student", lerning: "learning",
    helo: "hello", hllo: "hello", thnk: "thank", yuor: "your", diffrent: "different",
    usefull: "useful", successfull: "successful", beautifull: "beautiful", carefull: "careful",
    knowlege: "knowledge", accomodation: "accommodation", oppinion: "opinion",
    importan: "important", univeristy: "university", langauge: "language", vocabuary: "vocabulary",
    grammer: "grammar", pronounciation: "pronunciation", writting: "writing", comming: "coming",
    studing: "studying", dont: "don't", cant: "can't", doesnt: "doesn't", didnt: "didn't",
    isnt: "isn't", wont: "won't", im: "I'm", ive: "I've", id: "I'd"
};

const UNCOUNTABLE_PLURAL_ERRORS = {
    informations: "information",
    advices: "advice",
    homeworks: "homework",
    feedbacks: "feedback",
    equipments: "equipment",
    knowledges: "knowledge",
    researches: "research",
    furnitures: "furniture",
    vocabularies: "vocabulary"
};

const COMMON_BASE_VERBS = [
    "go", "have", "do", "like", "love", "enjoy", "want", "need", "play", "work",
    "study", "live", "make", "take", "know", "think", "eat", "say", "come", "see",
    "get", "feel", "look", "speak", "write", "read", "help", "use", "try", "learn",
    "agree", "depend", "belong", "happen", "occur", "consist", "contain", "mean"
];

const STANDALONE_ADJECTIVES = [
    "happy", "sad", "nervous", "afraid", "excited", "bored", "tired", "important",
    "useful", "helpful", "difficult", "easy", "good", "bad", "busy", "ready", "interested", "famous"
];

function analyzeEnglishTextLocal(rawText, options = {}) {
    const text = String(rawText || "").trim();
    const requiredWord = options.requiredWord ? String(options.requiredWord).trim() : null;
    const issues = [];
    const naturalTips = [];

    if (!text) {
        return { isValid: false, issues: [{ start: 0, end: 0, original: "", errorType: "Trống", suggestion: "", explanationVi: "Vui lòng nhập nội dung tiếng Anh." }], correctedText: "", naturalTips: [] };
    }

    // 1. Required target vocabulary check
    if (requiredWord) {
        const escaped = requiredWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Match root or common inflected forms (s, es, ed, ing, ies)
        const stem = requiredWord.length > 4 ? requiredWord.slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : escaped;
        const hasExactOrInflected = new RegExp(`\\b(${escaped}(s|es|ed|ing)?|${stem}(ies|ied|ing|ed))\\b`, "i").test(text);
        if (!hasExactOrInflected) {
            issues.push({
                start: 0,
                end: 0,
                original: text,
                errorType: "Thiếu từ mục tiêu",
                suggestion: `Hãy đưa từ "${requiredWord}" vào câu của bạn.`,
                explanationVi: `Câu chưa chứa từ vựng đang học là "${requiredWord}".`
            });
        }
    }

    // 2. First letter capitalization & ending punctuation
    if (/^[a-z]/.test(text)) {
        issues.push({
            start: 0,
            end: 1,
            original: text[0],
            errorType: "Viết hoa",
            suggestion: text[0].toUpperCase(),
            explanationVi: "Chữ cái đầu tiên của câu phải được viết hoa."
        });
    }
    if (!/[.!?]["')]*$/.test(text)) {
        issues.push({
            start: text.length,
            end: text.length,
            original: "(cuối câu)",
            errorType: "Dấu câu",
            suggestion: text + ".",
            explanationVi: "Cuối câu hoàn chỉnh cần có dấu chấm (.), dấu chấm hỏi (?) hoặc dấu chấm than (!)."
        });
    }

    // 3. Capitalization after comma error — e.g. "Hello teacher, My name's Quan."
    const commaCapRegex = /,\s+([A-Z][a-z']+)\b/g;
    let m;
    const properWhitelist = new Set(["I", "I'm", "I've", "I'd", "I'll", "FPT", "English", "Vietnamese", "Vietnam", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "IELTS"]);
    while ((m = commaCapRegex.exec(text)) !== null) {
        const capWord = m[1];
        if (!properWhitelist.has(capWord)) {
            const wordStart = m.index + m[0].lastIndexOf(capWord);
            issues.push({
                start: wordStart,
                end: wordStart + capWord.length,
                original: capWord,
                errorType: "Viết hoa & Dấu câu",
                suggestion: capWord.toLowerCase(),
                explanationVi: `Sau dấu phẩy (,), từ "${capWord}" không phải danh từ riêng nên không viết hoa chữ cái đầu (viết "${capWord.toLowerCase()}"), hoặc bạn nên tách thành hai câu riêng bằng dấu chấm (.).`
            });
        }
    }

    // Specific naturalness check for "Hello teacher..."
    if (/\b(hello|hi)\s+teacher\b/i.test(text)) {
        naturalTips.push(
            `💡 Diễn đạt tự nhiên hơn: Người bản xứ thường không gọi trực tiếp "Hello teacher" (trừ trẻ nhỏ). Ở bậc đại học, bạn nên viết có dấu phẩy gọi tên: "Hello, Professor! My name is..." hoặc "Hello, Ms./Mr. [Tên], my name is...".`
        );
    }

    // 4. Pattern rules (Grammar & Structure)
    const patternRules = [
        {
            re: /\b(I|we|you|they|he|she)\s+very\s+(like|likes|love|loves|enjoy|enjoys|want|wants|need|needs|appreciate)\b/gi,
            errorType: "Sai cấu trúc trạng từ",
            fixFn: (match, subj, verb) => `${subj} really ${verb}`,
            whyFn: (match, subj, verb) => `"Very" không bổ nghĩa trực tiếp trước động từ "${verb}". Hãy đổi thành "${subj} really ${verb}..." hoặc "${subj} ${verb} ... very much".`
        },
        {
            re: /\b(I\s+am|You\s+are|We\s+are|They\s+are|He\s+is|She\s+is|It\s+is)\s+(study|go|work|play|learn|agree|depend|belong|know|understand|want|need|like|live|make|use)\b/gi,
            errorType: "Thừa động từ to be",
            fixFn: (match, subjBe, verb) => {
                const subj = subjBe.split(/\s+/)[0];
                const addS = /^(he|she|it)$/i.test(subj);
                const inflected = addS ? (verb.toLowerCase() === "go" ? "goes" : verb.toLowerCase() === "study" ? "studies" : verb + "s") : verb;
                return `${subj} ${inflected}`;
            },
            whyFn: (match, subjBe, verb) => `Không ghép trực tiếp động từ to be ("${subjBe.split(/\s+/)[1]}") với động từ nguyên mẫu "${verb}". Bỏ to be nếu diễn tả sự thật/thói quen.`
        },
        {
            re: /\b(I|He|She|We|They|You)\s+(nervous|happy|excited|afraid|bored|tired|busy|ready|interested)\b/gi,
            errorType: "Thiếu động từ to be",
            fixFn: (match, subj, adj) => {
                const sLow = subj.toLowerCase();
                const be = sLow === "i" ? "am" : (sLow === "he" || sLow === "she" ? "is" : "are");
                return `${subj} ${be} ${adj}`;
            },
            whyFn: (match, subj, adj) => `"${adj}" là tính từ (Adjective), không phải động từ, nên cần có động từ to be (am/is/are) đứng giữa chủ ngữ "${subj}" và "${adj}".`
        },
        {
            re: /\b(although|even though|though)\s+([^.!?]+?),\s*but\s+/gi,
            errorType: "Thừa liên từ (Double Conjunction)",
            fixFn: (match, conj, clause) => `${conj} ${clause}, `,
            whyFn: () => `Trong tiếng Anh, đã dùng "Although / Even though" thì TUYỆT ĐỐI không dùng thêm "but" ở mệnh đề sau.`
        },
        {
            re: /\bbecause\s+([^.!?]+?),\s*so\s+/gi,
            errorType: "Thừa liên từ (Double Conjunction)",
            fixFn: (match, clause) => `Because ${clause}, `,
            whyFn: () => `Đã dùng "Because" ở mệnh đề nguyên nhân thì không dùng thêm "so" ở mệnh đề kết quả.`
        },
        {
            re: /\b(can|could|should|must|will|would|may|might)\s+to\s+([a-z]+)\b/gi,
            errorType: "Sai động từ khuyết thiếu",
            fixFn: (match, modal, verb) => `${modal} ${verb}`,
            whyFn: (match, modal, verb) => `Sau động từ khuyết thiếu "${modal}" là động từ nguyên mẫu không "to" ("${modal} ${verb}").`
        },
        {
            re: /\b(can|could|should|must|will|would|may|might)\s+([a-z]+s)\b/gi,
            guardFn: (m) => !/\b(always|sometimes|perhaps|class|bus|focus|process|status|campus|analysis)\b/i.test(m[2]),
            errorType: "Chia sai sau Modal Verb",
            fixFn: (match, modal, verbS) => `${modal} ${verbS.replace(/ies$/i, "y").replace(/(es|s)$/i, "")}`,
            whyFn: (match, modal, verbS) => `Sau động từ khuyết thiếu "${modal}", động từ giữ nguyên mẫu không thêm -s/-es.`
        },
        {
            re: /\ban\s+(university|useful|European|uniform|unique|unit|user)\b/gi,
            errorType: "Sai mạo từ a/an",
            fixFn: (match, noun) => `a ${noun}`,
            whyFn: (match, noun) => `"${noun}" bắt đầu bằng phụ âm phát âm /j/, nên phải dùng "a ${noun}" thay vì "an".`
        },
        {
            re: /\ba\s+(hour|honest|honor|honour)\b/gi,
            errorType: "Sai mạo từ a/an",
            fixFn: (match, noun) => `an ${noun}`,
            whyFn: (match, noun) => `"${noun}" có âm "h" câm, bắt đầu bằng nguyên âm nên phải dùng "an ${noun}".`
        },
        {
            re: /\b(was|were)\s+(happened|occurred)\b/gi,
            errorType: "Sai bị động với nội động từ",
            fixFn: (match, be, v) => v,
            whyFn: (match, be, v) => `"${v}" là nội động từ (tự xảy ra), không bao giờ dùng ở thể bị động "${be} ${v}".`
        }
    ];

    patternRules.forEach(rule => {
        let pm;
        while ((pm = rule.re.exec(text)) !== null) {
            if (rule.guardFn && !rule.guardFn(pm)) continue;
            issues.push({
                start: pm.index,
                end: pm.index + pm[0].length,
                original: pm[0],
                errorType: rule.errorType,
                suggestion: rule.fixFn(...pm),
                explanationVi: rule.whyFn(...pm)
            });
        }
    });

    // 5. Token-level checks: Typos, Uncountable nouns, pronoun 'i', S-V agreement
    const tokens = [];
    const wordRe = /[A-Za-z’']+/g;
    while ((m = wordRe.exec(text)) !== null) {
        tokens.push({ word: m[0], index: m.index });
    }

    tokens.forEach((tok, idx) => {
        const cleanLow = tok.word.toLowerCase().replace("’", "'");
        const nextTok = tokens[idx + 1];
        const prevTok = tokens[idx - 1];

        if (tok.word === "i") {
            issues.push({
                start: tok.index,
                end: tok.index + 1,
                original: "i",
                errorType: "Viết hoa đại từ",
                suggestion: "I",
                explanationVi: "Đại từ nhân xưng ngôi thứ nhất 'I' (tôi) luôn phải viết hoa ở mọi vị trí trong câu."
            });
        }

        if (Object.prototype.hasOwnProperty.call(COMMON_TYPOS_DICT, cleanLow)) {
            const fixed = COMMON_TYPOS_DICT[cleanLow];
            issues.push({
                start: tok.index,
                end: tok.index + tok.word.length,
                original: tok.word,
                errorType: "Sai chính tả",
                suggestion: tok.index === 0 ? fixed.charAt(0).toUpperCase() + fixed.slice(1) : fixed,
                explanationVi: `Từ "${tok.word}" viết sai chính tả hoặc thiếu dấu nháy đơn → sửa thành "${fixed}".`
            });
        }

        if (Object.prototype.hasOwnProperty.call(UNCOUNTABLE_PLURAL_ERRORS, cleanLow)) {
            const singular = UNCOUNTABLE_PLURAL_ERRORS[cleanLow];
            issues.push({
                start: tok.index,
                end: tok.index + tok.word.length,
                original: tok.word,
                errorType: "Danh từ không đếm được",
                suggestion: singular,
                explanationVi: `"${singular}" là danh từ không đếm được trong tiếng Anh, không được thêm đuôi số nhiều (-s/-es).`
            });
        }

        // Duplicate consecutive word (e.g. "the the")
        if (nextTok && cleanLow === nextTok.word.toLowerCase() && cleanLow !== "had" && cleanLow !== "that" && (nextTok.index - (tok.index + tok.word.length) <= 2)) {
            issues.push({
                start: nextTok.index,
                end: nextTok.index + nextTok.word.length,
                original: `${tok.word} ${nextTok.word}`,
                errorType: "Lặp từ thừa",
                suggestion: tok.word,
                explanationVi: `Từ "${tok.word}" bị lặp lại hai lần liên tiếp.`
            });
        }

        // Subject-Verb Agreement for he/she/it/everyone/everybody + base verb (unless preceded by did/does/doesn't/didn't/will/can/to)
        if (nextTok && /^(he|she|it|everyone|everybody|someone|nobody)$/i.test(cleanLow)) {
            const prevLow = prevTok ? prevTok.word.toLowerCase().replace("’", "'") : "";
            const isQuestionAuxBefore = /^(does|did|will|can|could|should|would|may|might)$/i.test(prevLow);
            const vLow = nextTok.word.toLowerCase();
            if (!isQuestionAuxBefore && COMMON_BASE_VERBS.includes(vLow) && (nextTok.index - (tok.index + tok.word.length) <= 2)) {
                const thirdPerson = vLow === "have" ? "has"
                    : vLow === "do" ? "does"
                    : vLow === "go" ? "goes"
                    : vLow === "study" ? "studies"
                    : vLow === "try" ? "tries"
                    : vLow + "s";
                issues.push({
                    start: nextTok.index,
                    end: nextTok.index + nextTok.word.length,
                    original: `${tok.word} ${nextTok.word}`,
                    errorType: "Hòa hợp Chủ ngữ - Động từ",
                    suggestion: `${tok.word} ${thirdPerson}`,
                    explanationVi: `Chủ ngữ ngôi thứ ba số ít "${tok.word}" ở thì Hiện tại đơn đi với động từ chia ngôi thứ ba: "${nextTok.word}" → "${thirdPerson}".`
                });
            }
        }
    });

    // Build inline highlighted HTML & auto-corrected preview
    const spanIssues = issues.filter(it => it.end > it.start).sort((a, b) => a.start - b.start);
    let highlightedHtml = "";
    let corrected = text;
    let cursor = 0;
    const nonOverlapping = [];
    spanIssues.forEach(iss => {
        if (iss.start < cursor) return;
        nonOverlapping.push(iss);
        highlightedHtml += escHtml(text.slice(cursor, iss.start)) + `<u class="err text-rose-300 font-semibold" title="${escHtml(iss.explanationVi)}">${escHtml(text.slice(iss.start, iss.end))}</u>`;
        cursor = iss.end;
    });
    highlightedHtml += escHtml(text.slice(cursor));

    // Apply non-overlapping replacements from right to left for suggested sentence
    [...nonOverlapping].reverse().forEach(iss => {
        if (iss.suggestion) {
            corrected = corrected.slice(0, iss.start) + iss.suggestion + corrected.slice(iss.end);
        }
    });
    if (/^[a-z]/.test(corrected)) corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
    if (!/[.!?]["')]*$/.test(corrected)) corrected += ".";

    if (issues.length === 0 && naturalTips.length === 0 && tokens.length < 6) {
        naturalTips.push("💡 Gợi ý mở rộng câu: Bạn có thể thêm cụm chỉ thời gian, lý do (because...) hoặc ví dụ thực tế tại trường để câu văn phong phú và đạt chuẩn B1–B2 hơn.");
    }

    return {
        isValid: issues.length === 0,
        issues,
        highlightedHtml,
        correctedText: corrected,
        wordCount: tokens.length,
        naturalTips
    };
}

/* ==================== HONEST BACKEND AI CLIENT (PHẦN 3.5.D, 9.3, 10) ==================== */
const AIClient = {
    status: {
        checked: false,
        connected: false,
        provider: null,
        message: "Chưa kiểm tra kết nối Backend AI."
    },

    getEndpointBase() {
        const cfg = (typeof appSettings !== "undefined" && appSettings && appSettings.backendApiUrl)
            ? appSettings.backendApiUrl.trim()
            : "/api/ai";
        return cfg.replace(/\/+$/, "");
    },

    async checkStatus() {
        // When opened directly via file:// without a custom http(s) backend URL, relative /api/ai cannot exist
        const base = this.getEndpointBase();
        if (window.location.protocol === "file:" && base.startsWith("/")) {
            this.status = {
                checked: true,
                connected: false,
                provider: null,
                message: "Đang mở ở chế độ File tĩnh (Offline/Local). Chưa kết nối Backend AI Server."
            };
            this.syncStatusBadges();
            return this.status;
        }

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 5000);
        try {
            const res = await fetch(`${base}/status`, { method: "GET", signal: ctrl.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.status = {
                checked: true,
                connected: Boolean(data && data.configured),
                provider: data.provider || null,
                message: data.configured
                    ? `Đã kết nối AI Backend (${data.provider || "Server"}).`
                    : (data.message || "Backend đang chạy nhưng chưa cấu hình GEMINI_API_KEY / OPENAI_API_KEY trong biến môi trường (.env).")
            };
        } catch (err) {
            clearTimeout(timer);
            this.status = {
                checked: true,
                connected: false,
                provider: null,
                message: "Chưa kết nối tới Backend AI (/api/ai). Các tính năng đang hoạt động ở chế độ Phân tích cục bộ minh bạch."
            };
        }
        this.syncStatusBadges();
        return this.status;
    },

    syncStatusBadges() {
        const dot = document.getElementById("ai-status-icon");
        const txt = document.getElementById("ai-status-text");
        const settingsBanner = document.getElementById("settings-ai-status-box");
        const headerBadge = document.getElementById("header-ai-badge");

        if (dot) {
            dot.className = `w-3 h-3 rounded-full ${this.status.connected ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-amber-500"}`;
        }
        if (txt) {
            txt.textContent = this.status.connected
                ? `AI Backend Đã Kết Nối (${this.status.provider})`
                : "AI Backend Chưa Kết Nối — Chế độ Phân tích cục bộ (Local Mode)";
        }
        if (headerBadge) {
            headerBadge.className = `hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${this.status.connected ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : "bg-slate-900 text-slate-400 border-white/10"}`;
            headerBadge.innerHTML = `<span class="w-2 h-2 rounded-full ${this.status.connected ? "bg-emerald-400" : "bg-amber-400"}"></span>${this.status.connected ? "AI Live" : "Local Mode"}`;
        }
        if (settingsBanner) {
            settingsBanner.innerHTML = `
                <div class="flex items-start gap-3">
                    <span class="text-lg">${this.status.connected ? "🟢" : "🟡"}</span>
                    <div>
                        <p class="text-sm font-bold ${this.status.connected ? "text-emerald-300" : "text-amber-300"}">${escHtml(this.status.message)}</p>
                        <p class="text-xs text-slate-400 mt-1">Bảo mật chuẩn Thiết kế: API Key <strong>TUYỆT ĐỐI KHÔNG</strong> lưu ở frontend hay trình duyệt. API Key chỉ được nạp qua biến môi trường <code>.env</code> trên máy chủ Backend (<code>server.js</code> hoặc Vercel Serverless <code>api/ai.js</code>).</p>
                    </div>
                </div>
            `;
        }
    },

    async request(task, payload) {
        if (task !== "extract-url" && (!appSettings || !appSettings.aiConsentAccepted)) {
            return { ok: false, notConnected: false, consentRequired: true, error: "Vui lòng bật xác nhận đồng ý gửi văn bản tới Backend AI trong phần Cài đặt (Settings) trước khi dùng AI." };
        }
        const base = this.getEndpointBase();
        if (window.location.protocol === "file:" && base.startsWith("/")) {
            return { ok: false, notConnected: true, error: "Chưa kết nối Backend Server (đang chạy file tĩnh cục bộ)." };
        }
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 22000); // 22s timeout cap
        try {
            const res = await fetch(`${base}/${task}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: ctrl.signal
            });
            clearTimeout(timer);
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                return {
                    ok: false,
                    notConnected: res.status === 404 || res.status === 503,
                    error: data.error || `Lỗi từ AI Backend (HTTP ${res.status}).`
                };
            }
            return { ok: true, data: data.result, provider: data.provider };
        } catch (err) {
            clearTimeout(timer);
            return {
                ok: false,
                notConnected: true,
                error: err.name === "AbortError"
                    ? "Yêu cầu AI quá thời gian giới hạn (22 giây). Vui lòng thử lại."
                    : "Không thể kết nối tới AI Backend Server."
            };
        }
    }
};
