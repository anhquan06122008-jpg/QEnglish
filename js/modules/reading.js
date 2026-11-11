/* ==========================================================================
   QEnglish - Reading Comprehension Workspace
   Split Screen, Mobile Tabs, 4-Color Highlighter, Word Lookup -> Vocab Bank,
   Passage Notes, Question Flagging, All 7 Question Types & Evidence Locator
   ========================================================================== */

let activeReadingPassage = null;
let currentHighlightColor = "highlight-yellow";
let flaggedQuestions = new Set();

function getReadingState() {
    return safeParseJSON(localStorage.getItem(STORAGE_KEYS.READING), {
        completedIds: [],
        scoresById: {},
        highlightsById: {},
        notesById: {}
    });
}

function saveReadingState(st) {
    safeWriteJSON(STORAGE_KEYS.READING, st);
}

function filterReadingPassages() {
    const lvFilter = document.getElementById("reading-level-filter")?.value || "all";
    const listEl = document.getElementById("reading-list");
    if (!listEl) return;

    const allPassages = getAllContentForSkill("reading");
    const st = getReadingState();

    const filtered = allPassages.filter(p => matchesSelectedLevel(p.level || "B1", lvFilter));
    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="col-span-full glass-panel rounded-2xl p-8 text-center space-y-3">
                <div class="text-4xl">📄</div>
                <p class="font-bold text-white">Không có bài đọc ở cấp độ "${escHtml(lvFilter)}"</p>
                <button onclick="document.getElementById('reading-level-filter').value='all'; filterReadingPassages();" class="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Xem tất cả ${allPassages.length} bài đọc (CEFR & IELTS)</button>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map(p => {
        const done = (st.completedIds || []).includes(p.id);
        const best = st.scoresById ? st.scoresById[p.id] : null;
        const wordCount = String(p.passage || "").trim().split(/\s+/).length;
        return `
            <div onclick='openReadingPassage(${JSON.stringify(p.id)})' class="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between gap-4 transition">
                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="flex items-center gap-2">
                            ${renderLevelBadge(p.level)}
                            <span class="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">${escHtml(p.topic || "Academic")}</span>
                        </div>
                        ${done ? `<span class="text-xs font-bold text-emerald-400">✅ Đã đọc (${best ?? 100}%)</span>` : `<span class="text-xs text-slate-400">~${wordCount} từ</span>`}
                    </div>
                    <h3 class="text-lg font-extrabold text-white">${escHtml(p.title)}</h3>
                    <p class="text-xs text-slate-400 line-clamp-2">${escHtml(String(p.passage || "").slice(0, 140))}...</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span class="text-slate-400">${(p.questions || []).length} câu hỏi • ${renderSourceBadge(p.source || "built-in")}</span>
                    <span class="font-bold text-violet-400">Mở bài đọc →</span>
                </div>
            </div>
        `;
    }).join("");
}

function setHighlightColor(cls) {
    currentHighlightColor = cls;
    document.querySelectorAll(".hl-swatch-btn").forEach(b => {
        b.classList.toggle("ring-2", b.getAttribute("data-hl") === cls);
        b.classList.toggle("ring-white", b.getAttribute("data-hl") === cls);
    });
}

function switchReadingMobileTab(tab) {
    const pPane = document.getElementById("reading-passage-pane");
    const qPane = document.getElementById("reading-questions-pane");
    const bPassage = document.getElementById("rmob-btn-passage");
    const bQuestions = document.getElementById("rmob-btn-questions");
    if (!pPane || !qPane) return;

    if (tab === "passage") {
        pPane.classList.remove("hidden-mobile-pane");
        qPane.classList.add("hidden-mobile-pane");
        bPassage?.classList.add("bg-violet-600", "text-white");
        bQuestions?.classList.remove("bg-violet-600", "text-white");
    } else {
        qPane.classList.remove("hidden-mobile-pane");
        pPane.classList.add("hidden-mobile-pane");
        bQuestions?.classList.add("bg-violet-600", "text-white");
        bPassage?.classList.remove("bg-violet-600", "text-white");
    }
}

function openReadingPassage(id, customPassage = null) {
    const allPassages = getAllContentForSkill("reading");
    if (customPassage) window.lastCustomReadingPassage = customPassage;
    const p = customPassage || allPassages.find(x => x.id === id) ||
        (id.startsWith("custom-r-") ? window.lastCustomReadingPassage : null);
    const allPassages = getAllContentForSkill("reading");
    const p = allPassages.find(x => x.id === id);
    if (!p) return;
    activeReadingPassage = p;
    flaggedQuestions = new Set();

    document.getElementById("reading-list")?.classList.add("hidden");
    document.getElementById("reading-filter-bar")?.classList.add("hidden");
    document.getElementById("reading-session")?.classList.remove("hidden");
    document.getElementById("reading-results")?.classList.add("hidden");
    document.getElementById("reading-lookup-box")?.classList.add("hidden");

    document.getElementById("reading-title").innerHTML = `${renderLevelBadge(p.level)} <span class="ml-1">${escHtml(p.title)}</span>`;

    const st = getReadingState();
    const savedHtml = st.highlightsById && st.highlightsById[p.id];
    const passageContainer = document.getElementById("reading-passage-text");

    if (savedHtml) {
        passageContainer.innerHTML = savedHtml;
    } else {
        const paragraphs = String(p.passage || "").split(/\n\s*\n/).filter(Boolean);
        passageContainer.innerHTML = paragraphs.map((para, idx) => `
            <p id="reading-para-${idx + 1}" class="p-2.5 rounded-xl transition duration-500 leading-7 text-slate-200">
                <span class="text-[10px] font-black uppercase text-violet-400 mr-1.5 select-none">[Đoạn ${idx + 1}]</span>${escHtml(para.trim())}
            </p>
        `).join("");
    }

    // Passage personal note
    const noteArea = document.getElementById("reading-passage-note");
    if (noteArea) {
        noteArea.value = (st.notesById && st.notesById[p.id]) || "";
    }

    renderReadingQuestionsList();
    switchReadingMobileTab("passage");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function applySelectionHighlight() {
    if (!activeReadingPassage) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        showToast("Hãy bôi đen cụm từ hoặc câu trong Bài đọc trước khi bấm Highlight!", "warning");
        return;
    }
    const passageBox = document.getElementById("reading-passage-text");
    if (!passageBox || !passageBox.contains(sel.anchorNode)) {
        showToast("Chỉ có thể Highlight nội dung bên trong khu vực Bài đọc.", "warning");
        return;
    }

    try {
        const range = sel.getRangeAt(0);
        const mark = document.createElement("mark");
        mark.className = `${currentHighlightColor} text-white px-0.5 rounded`;
        mark.appendChild(range.extractContents());
        range.insertNode(mark);
        sel.removeAllRanges();

        const st = getReadingState();
        if (!st.highlightsById) st.highlightsById = {};
        st.highlightsById[activeReadingPassage.id] = passageBox.innerHTML;
        saveReadingState(st);
        showToast("Đã đánh dấu Highlight!");
    } catch (e) {
        showToast("Hãy bôi đen trong phạm vi một đoạn văn để Highlight mượt nhất.", "warning");
    }
}

function clearPassageHighlights() {
    if (!activeReadingPassage) return;
    const st = getReadingState();
    if (st.highlightsById) delete st.highlightsById[activeReadingPassage.id];
    saveReadingState(st);
    openReadingPassage(activeReadingPassage.id);
    showToast("Đã xóa toàn bộ Highlight của bài đọc này.");
}

function saveReadingNote(syncToNotebook = false) {
    if (!activeReadingPassage) return;
    const val = (document.getElementById("reading-passage-note")?.value || "").trim();
    const st = getReadingState();
    if (!st.notesById) st.notesById = {};
    st.notesById[activeReadingPassage.id] = val;
    saveReadingState(st);
    if (syncToNotebook && val) {
        addStructuredNote({
            type: "vocabulary",
            title: `Ghi chú Reading: ${activeReadingPassage.title}`,
            fields: { meaningVi: val, example: activeReadingPassage.topic || "" },
            content: val
        });
    } else {
        showToast("Đã lưu ghi chú bài đọc!");
    }
}

// Instant Word Lookup on Double Click or Selection Button
function handlePassageWordLookup() {
    const sel = window.getSelection();
    const raw = (sel ? sel.toString() : "").trim().replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "");
    if (!raw || raw.split(/\s+/).length > 4) {
        showToast("Hãy bôi đen hoặc nhấp đúp vào 1 từ/cụm từ ngắn trong bài đọc để tra nghĩa!", "warning");
        return;
    }
    showReadingWordPopup(raw);
}

function showReadingWordPopup(wordRaw) {
    const box = document.getElementById("reading-lookup-box");
    if (!box) return;
    const low = wordRaw.toLowerCase();
    // Try exact, or stripped -s/-es/-ed/-ing stem in ACADEMIC_DICTIONARY or user's deck
    const fromDeck = deck.find(d => d.term.toLowerCase() === low);
    const stemCandidates = [low, low.replace(/s$/, ""), low.replace(/es$/, ""), low.replace(/ies$/, "y"), low.replace(/ed$/, ""), low.replace(/ing$/, "")];
    let dictHit = null;
    for (const c of stemCandidates) {
        if (typeof ACADEMIC_DICTIONARY !== "undefined" && ACADEMIC_DICTIONARY[c]) {
            dictHit = ACADEMIC_DICTIONARY[c];
            break;
        }
    }

    const ipa = fromDeck?.ipa || dictHit?.ipa || "/.../";
    const pos = fromDeck?.pos || dictHit?.pos || "vocab";
    const def = fromDeck?.def || dictHit?.def || "";
    const lv = fromDeck?.level || dictHit?.level || activeReadingPassage?.level || "B1";

    box.classList.remove("hidden");
    box.innerHTML = `
        <div class="flex items-start justify-between gap-2">
            <div>
                <div class="flex items-center gap-2">
                    <span class="font-black text-base text-white">${escHtml(wordRaw)}</span>
                    <span class="text-xs font-mono text-cyan-400">${escHtml(ipa)}</span>
                    <span class="text-[10px] text-slate-400">(${escHtml(pos)})</span>
                </div>
                ${def
                    ? `<p class="text-xs font-bold text-amber-300 mt-1">Nghĩa: ${escHtml(def)}</p>`
                    : `<p class="text-[11px] text-slate-400 mt-1">Từ này chưa có sẵn trong từ điển rút gọn — bạn có thể nghe phát âm và tự nhập nghĩa để lưu vào Kho Từ Vựng!</p>`}
            </div>
            <div class="flex items-center gap-1">
                <button onclick='speakText(${JSON.stringify(wordRaw)}, 1.0)' class="px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 text-xs font-bold">🔊</button>
                <button onclick="document.getElementById('reading-lookup-box').classList.add('hidden')" class="px-2 py-1 text-slate-400 hover:text-white text-xs">✕</button>
            </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 pt-2">
            <input id="lookup-custom-def" type="text" value="${escHtml(def)}" placeholder="Nhập/chỉnh nghĩa tiếng Việt để lưu..." class="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500">
            <button onclick='saveLookupWordToBank(${JSON.stringify(wordRaw)}, ${JSON.stringify(ipa)}, ${JSON.stringify(pos)}, ${JSON.stringify(lv)})' class="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shrink-0">
                ➕ Lưu vào Vocabulary Bank
            </button>
        </div>
    `;
}

function saveLookupWordToBank(wordRaw, ipa, pos, level) {
    const defVal = (document.getElementById("lookup-custom-def")?.value || "").trim();
    if (!defVal) {
        showToast("Hãy nhập nghĩa tiếng Việt trước khi lưu vào Vocabulary Bank!", "error");
        return;
    }
    if (deck.some(d => d.term.toLowerCase() === wordRaw.toLowerCase())) {
        showToast(`Từ "${wordRaw}" đã có sẵn trong Vocabulary Bank!`, "warning");
        return;
    }
    // Extract sentence containing this word from active passage if available
    let contextSentence = "";
    if (activeReadingPassage && activeReadingPassage.passage) {
        const sents = activeReadingPassage.passage.match(/[^.!?]+[.!?]+/g) || [];
        const hit = sents.find(s => s.toLowerCase().includes(wordRaw.toLowerCase()));
        if (hit) contextSentence = hit.replace(/\[Paragraph [A-Z]\]/g, "").trim();
    }

    deck.push(normalizeWordItem({
        id: Date.now() + Math.random(),
        day: 1,
        term: wordRaw,
        ipa,
        pos,
        def: defVal,
        example: contextSentence || DYNAMIC_EXAMPLE_TEMPLATES[0](wordRaw).en,
        category: activeReadingPassage?.topic || "Reading",
        level: level.startsWith("IELTS") ? "B2" : level,
        starred: false,
        source: "user-imported"
    }));
    saveDeckToStorage();
    showToast(`Đã lưu "${wordRaw}" vào Vocabulary Bank!`);
}

function renderReadingQuestionsList() {
    const p = activeReadingPassage;
    if (!p) return;
    const qWrap = document.getElementById("reading-questions");
    const questions = p.questions || [];

    const typeLabels = {
        multiple_choice: "Multiple Choice",
        true_false_notgiven: "True / False / Not Given",
        true_false_ng: "True / False / Not Given",
        matching_headings: "Matching Headings",
        matching_info: "Matching Information",
        fill_blank: "Sentence Completion",
        sentence_completion: "Sentence Completion",
        summary_completion: "Summary Completion",
        short_answer: "Short Answer"
    };

    qWrap.innerHTML = questions.map((q, qi) => {
        const hasOptions = Array.isArray(q.options) && q.options.length > 0;
        const badge = typeLabels[q.type] || "Question";
        return `
            <div class="p-4 rounded-2xl bg-slate-950/85 border border-white/10 space-y-2.5 transition" id="r-qbox-${qi}">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/15 text-violet-300">${escHtml(badge)}</span>
                    <button onclick="toggleReadingFlag(${qi})" id="r-flag-btn-${qi}" class="text-[11px] font-bold text-slate-500 hover:text-amber-300 transition" title="Đánh dấu câu chưa chắc chắn">
                        🏳️ Xem lại sau
                    </button>
                </div>
                <p class="text-sm font-bold text-white"><span class="text-cyan-400 mr-1">Q${qi + 1}.</span> ${escHtml(q.question)}</p>
                ${hasOptions ? `
                    <div class="grid gap-2">
                        ${q.options.map(opt => `
                            <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-white/10 cursor-pointer hover:border-violet-500/40 text-xs text-slate-200">
                                <input type="radio" name="r-q-${qi}" value="${escHtml(opt)}" onchange="updateReadingProgressUI()" class="accent-violet-500">
                                <span>${escHtml(opt)}</span>
                            </label>
                        `).join("")}
                    </div>
                ` : `
                    <input type="text" id="r-q-input-${qi}" oninput="updateReadingProgressUI()" placeholder="Nhập câu trả lời ngắn từ bài đọc..." class="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500">
                `}
                <div id="r-qfb-${qi}" class="hidden text-xs pt-2 border-t border-white/10 space-y-1"></div>
            </div>
        `;
    }).join("");

    updateReadingProgressUI();
}

function toggleReadingFlag(qi) {
    const btn = document.getElementById(`r-flag-btn-${qi}`);
    const box = document.getElementById(`r-qbox-${qi}`);
    if (flaggedQuestions.has(qi)) {
        flaggedQuestions.delete(qi);
        if (btn) { btn.textContent = "🏳️ Xem lại sau"; btn.className = "text-[11px] font-bold text-slate-500 hover:text-amber-300"; }
        box?.classList.remove("border-amber-400/50");
    } else {
        flaggedQuestions.add(qi);
        if (btn) { btn.textContent = "🚩 Đã đánh dấu xem lại"; btn.className = "text-[11px] font-bold text-amber-300"; }
        box?.classList.add("border-amber-400/50");
    }
}

function updateReadingProgressUI() {
    if (!activeReadingPassage) return;
    const questions = activeReadingPassage.questions || [];
    let answered = 0;
    questions.forEach((q, qi) => {
        if (Array.isArray(q.options) && q.options.length > 0) {
            if (document.querySelector(`input[name="r-q-${qi}"]:checked`)) answered++;
        } else {
            if ((document.getElementById(`r-q-input-${qi}`)?.value || "").trim() !== "") answered++;
        }
    });
    const progText = document.getElementById("reading-progress");
    const progBar = document.getElementById("reading-progress-bar");
    if (progText) progText.textContent = `${answered} / ${questions.length} đã trả lời`;
    if (progBar) progBar.style.width = questions.length ? `${Math.round((answered / questions.length) * 100)}%` : "0%";
}

function locateEvidenceParagraph(paraNum) {
    switchReadingMobileTab("passage");
    const el = document.getElementById(`reading-para-${paraNum}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("bg-amber-500/25", "ring-2", "ring-amber-400");
    setTimeout(() => {
        el.classList.remove("bg-amber-500/25", "ring-2", "ring-amber-400");
    }, 2400);
}

function detectParagraphForAnswer(passageText, answerStr, explanationStr) {
    const paragraphs = String(passageText || "").split(/\n\s*\n/).filter(Boolean);
    const ansClean = normalizeWords(answerStr);
    for (let i = 0; i < paragraphs.length; i++) {
        if (ansClean && ansClean.length >= 3 && normalizeWords(paragraphs[i]).includes(ansClean)) {
            return i + 1;
        }
    }
    return 1;
}

function submitReadingAnswers() {
    if (!activeReadingPassage) return;
    const questions = activeReadingPassage.questions || [];
    let correct = 0;

    questions.forEach((q, qi) => {
        let userAns = "";
        if (Array.isArray(q.options) && q.options.length > 0) {
            userAns = document.querySelector(`input[name="r-q-${qi}"]:checked`)?.value || "";
        } else {
            userAns = (document.getElementById(`r-q-input-${qi}`)?.value || "").trim();
        }

        const normU = normalizeWords(userAns);
        const normExp = normalizeWords(q.answer);
        const ok = normU !== "" && (normU === normExp || (q.type === "short_answer" && normU.length >= 4 && (normExp.includes(normU) || normU.includes(normExp))));
        if (ok) correct++;

        const paraIdx = q.paragraphRef || detectParagraphForAnswer(activeReadingPassage.passage, q.answer, q.explanation);
        const box = document.getElementById(`r-qbox-${qi}`);
        const fb = document.getElementById(`r-qfb-${qi}`);
        if (box) {
            box.classList.remove("border-white/10", "border-amber-400/50");
            box.classList.add(ok ? "border-emerald-500/50" : "border-rose-500/50");
        }
        if (fb) {
            fb.classList.remove("hidden");
            fb.innerHTML = `
                <p class="font-bold ${ok ? "text-emerald-300" : "text-rose-300"}">
                    ${ok ? "✅ Chính xác!" : `❌ Bạn trả lời: "${escHtml(userAns || "Trống")}" — Đáp án chuẩn: "${escHtml(q.answer)}"`}
                </p>
                <p class="text-slate-300">💡 ${escHtml(q.explanation || "")}</p>
                <button onclick="locateEvidenceParagraph(${paraIdx})" class="text-[11px] font-bold text-cyan-300 hover:underline">
                    🔎 Xem đoạn chứa thông tin: [Đoạn ${paraIdx}]
                </button>
            `;
        }
    });

    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 100;
    const st = getReadingState();
    if (!st.completedIds.includes(activeReadingPassage.id)) st.completedIds.push(activeReadingPassage.id);
    st.scoresById[activeReadingPassage.id] = Math.max(st.scoresById[activeReadingPassage.id] || 0, pct);
    saveReadingState(st);

    // Extract key vocabulary from passage
    const keyWords = Array.isArray(activeReadingPassage.keyVocab) && activeReadingPassage.keyVocab.length > 0
        ? activeReadingPassage.keyVocab
        : extractKeyVocabFromPassage(activeReadingPassage.passage);

    const resEl = document.getElementById("reading-results");
    if (resEl) {
        resEl.classList.remove("hidden");
        resEl.innerHTML = `
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div class="flex items-center justify-between">
                    <h4 class="text-lg font-black text-white">Điểm Đọc Hiểu: <span class="text-amber-300">${correct} / ${questions.length} (${pct}%)</span></h4>
                    <span class="text-xs text-slate-300">Bấm "🔎 Xem đoạn chứa thông tin" ở từng câu để đối chiếu</span>
                </div>
                ${keyWords.length ? `
                    <div class="pt-2 border-t border-white/10 space-y-2">
                        <p class="text-xs font-extrabold uppercase text-cyan-300">📚 Từ vựng học thuật quan trọng trong bài đọc:</p>
                        <div class="grid gap-2">
                            ${keyWords.map(kv => `
                                <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 text-xs">
                                    <div>
                                        <strong class="text-white">${escHtml(kv.word)}</strong>
                                        <span class="font-mono text-cyan-400 ml-1">${escHtml(kv.ipa || "")}</span>:
                                        <span class="text-amber-200 ml-1">${escHtml(kv.vi)}</span>
                                    </div>
                                    <button onclick='showReadingWordPopup(${JSON.stringify(kv.word)})' class="text-[11px] font-bold text-violet-300 hover:underline shrink-0">+ Lưu từ</button>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
    }

    logStudyMetrics(
        {
            readingDone: 1,
            scoreEntry: { skill: "reading", scorePct: pct, level: activeReadingPassage.level, title: activeReadingPassage.title }
        },
        { type: "reading", skill: "reading", title: `Hoàn thành Reading: ${activeReadingPassage.title}`, scorePct: pct }
    );
    showToast(`Hoàn thành bài đọc: ${correct}/${questions.length} (${pct}%)!`);
}

function extractKeyVocabFromPassage(passageText) {
    if (typeof ACADEMIC_DICTIONARY === "undefined") return [];
    const words = new Set(normalizeWords(passageText).split(" "));
    const found = [];
    Object.keys(ACADEMIC_DICTIONARY).forEach(k => {
        if (words.has(k) && found.length < 5) {
            found.push({ word: k, ipa: ACADEMIC_DICTIONARY[k].ipa, vi: ACADEMIC_DICTIONARY[k].def });
        }
    });
    return found;
}

function closeReadingSession() {
    activeReadingPassage = null;
    document.getElementById("reading-session")?.classList.add("hidden");
    document.getElementById("reading-list")?.classList.remove("hidden");
    document.getElementById("reading-filter-bar")?.classList.remove("hidden");
    filterReadingPassages();
}
