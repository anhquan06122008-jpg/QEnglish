/* ==========================================================================
   QEnglish — Unified Vercel Serverless Function & Backend AI Core
   Supports both Vercel Serverless (/api/ai) and Local Node.js (server.js)
   Configure GEMINI_API_KEY or OPENAI_API_KEY in Environment Variables (.env).
   ========================================================================== */

"use strict";

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_PER_MIN = parseInt(process.env.RATE_LIMIT_MAX_PER_MIN || "20", 10) || 20;
const MAX_INPUT_CHARS = parseInt(process.env.AI_MAX_INPUT_CHARS || "12000", 10) || 12000;
const MAX_OUTPUT_TOKENS = parseInt(process.env.AI_MAX_OUTPUT_TOKENS || "3600", 10) || 3600;
const UPSTREAM_TIMEOUT_MS = 45000;

const ipBuckets = new Map();

function checkRateLimit(keyId) {
    const key = keyId || "unknown";
    const now = Date.now();
    const arr = (ipBuckets.get(key) || []).filter(ts => now - ts < RATE_WINDOW_MS);
    if (arr.length >= RATE_MAX_PER_MIN) return false;
    arr.push(now);
    ipBuckets.set(key, arr);
    return true;
}

function detectProvider() {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
        return {
            configured: true,
            provider: "Google Gemini",
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
        };
    }
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
        return {
            configured: true,
            provider: "OpenAI",
            model: process.env.OPENAI_MODEL || "gpt-4o-mini"
        };
    }
    return {
        configured: false,
        provider: null,
        model: null,
        message: "Máy chủ Backend đang chạy nhưng chưa cấu hình GEMINI_API_KEY hoặc OPENAI_API_KEY trong biến môi trường."
    };
}

async function verifySupabaseAuth(authHeader) {
    const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
    const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim();
    const requireAuth = process.env.REQUIRE_AUTH_FOR_AI === "true" && Boolean(supabaseUrl && anonKey);

    if (!supabaseUrl || !anonKey) {
        return { enforced: false, authenticated: false, user: null };
    }

    const raw = String(authHeader || "").trim();
    const token = raw.toLowerCase().startsWith("bearer ") ? raw.slice(7).trim() : "";
    if (!token) {
        if (requireAuth) {
            const err = new Error("Vui lòng đăng nhập tài khoản để sử dụng tính năng AI.");
            err.statusCode = 401;
            throw err;
        }
        return { enforced: false, authenticated: false, user: null };
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
        const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
            method: "GET",
            headers: {
                "apikey": anonKey,
                "Authorization": `Bearer ${token}`
            },
            signal: ctrl.signal
        });
        clearTimeout(timer);
        if (!resp.ok) {
            if (requireAuth) {
                const err = new Error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
                err.statusCode = 401;
                throw err;
            }
            return { enforced: false, authenticated: false, user: null };
        }
        const user = await resp.json();
        return { enforced: requireAuth, authenticated: true, user };
    } catch (err) {
        clearTimeout(timer);
        if (err.statusCode) throw err;
        if (requireAuth) {
            const authErr = new Error("Không thể xác thực phiên đăng nhập với máy chủ Cloud Auth.");
            authErr.statusCode = 401;
            throw authErr;
        }
        return { enforced: false, authenticated: false, user: null };
    }
}

function extractJSONFromText(raw) {
    const trimmed = String(raw || "").trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1].trim() : trimmed;
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
    }
    return JSON.parse(candidate);
}

async function callLLMJson(systemInstruction, userPrompt) {
    const info = detectProvider();
    if (!info.configured) {
        const err = new Error(info.message);
        err.statusCode = 503;
        throw err;
    }

    const safePrompt = String(userPrompt || "").slice(0, MAX_INPUT_CHARS);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);

    try {
        if (info.provider === "Google Gemini") {
            const apiKey = process.env.GEMINI_API_KEY.trim();
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(info.model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: "user", parts: [{ text: safePrompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: MAX_OUTPUT_TOKENS,
                        responseMimeType: "application/json"
                    }
                }),
                signal: ctrl.signal
            });
            clearTimeout(timer);
            if (!resp.ok) throw new Error(`Gemini upstream HTTP ${resp.status}`);
            const data = await resp.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            return { provider: `${info.provider} (${info.model})`, result: extractJSONFromText(text) };
        } else {
            const apiKey = process.env.OPENAI_API_KEY.trim();
            const resp = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: info.model,
                    temperature: 0.3,
                    max_tokens: MAX_OUTPUT_TOKENS,
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: safePrompt }
                    ]
                }),
                signal: ctrl.signal
            });
            clearTimeout(timer);
            if (!resp.ok) throw new Error(`OpenAI upstream HTTP ${resp.status}`);
            const data = await resp.json();
            const text = data?.choices?.[0]?.message?.content || "{}";
            return { provider: `${info.provider} (${info.model})`, result: extractJSONFromText(text) };
        }
    } finally {
        clearTimeout(timer);
    }
}

function clampCriterionScore(val) {
    const num = Number(val);
    if (!Number.isFinite(num)) return 1.5;
    return Math.max(0, Math.min(2.5, Math.round(num * 10) / 10));
}

function normalizeWritingResult(raw, payload = {}) {
    const r = raw && typeof raw === "object" ? raw : {};
    const critSrc = r.criteria && typeof r.criteria === "object" ? r.criteria : {};
    const defaults = [
        ["taskResponse", "Task Achievement / Task Response"],
        ["coherenceCohesion", "Coherence & Cohesion"],
        ["lexicalResource", "Lexical Resource"],
        ["grammarAccuracy", "Grammatical Range & Accuracy"]
    ];

    const normalizedCriteria = {};
    let sum10 = 0;
    for (const [key, fallbackLabel] of defaults) {
        const c = critSrc[key] && typeof critSrc[key] === "object" ? critSrc[key] : {};
        const scoreOutOf2_5 = clampCriterionScore(c.scoreOutOf2_5 ?? c.score ?? 1.5);
        sum10 += scoreOutOf2_5;
        normalizedCriteria[key] = {
            label: String(c.label || fallbackLabel),
            scoreOutOf2_5,
            feedbackVi: String(c.feedbackVi || ""),
            achieved: Array.isArray(c.achieved) ? c.achieved : [],
            missing: Array.isArray(c.missing) ? c.missing : [],
            errors: Array.isArray(c.errors) ? c.errors : []
        };
    }

    const totalScore10 = Math.max(0, Math.min(10, Math.round(sum10 * 10) / 10));
    const scorePct = Math.round(totalScore10 * 10);

    const breakdown = Array.isArray(r.sentenceBreakdown)
        ? r.sentenceBreakdown
        : (Array.isArray(r.corrections) ? r.corrections : []);

    const plan = r.improvementPlan && typeof r.improvementPlan === "object" ? r.improvementPlan : {};
    const rewritten = r.rewrittenVersions && typeof r.rewrittenVersions === "object" ? r.rewrittenVersions : {};
    const essayFallback = String(payload.essay || "");

    const correctedVer = rewritten.corrected && typeof rewritten.corrected === "object"
        ? rewritten.corrected
        : { text: String(r.revisedEssay || essayFallback), changesSummaryVi: "Bản sửa các lỗi ngữ pháp, chính tả và cấu trúc cơ bản." };
    const improvedVer = rewritten.improved && typeof rewritten.improved === "object"
        ? rewritten.improved
        : { text: String(r.revisedEssay || correctedVer.text || essayFallback), changesSummaryVi: "Bản cải thiện mạch lạc, liên kết ý và cách diễn đạt tự nhiên hơn." };
    const advancedVer = rewritten.advanced && typeof rewritten.advanced === "object"
        ? rewritten.advanced
        : { text: String(improvedVer.text || essayFallback), changesSummaryVi: "Bản nâng cao từ vựng học thuật và cấu trúc câu đa dạng (C1+)." };

    const missingFromRubric = Array.isArray(r.missingFromRubric) ? r.missingFromRubric : [];
    const normalizedBreakdown = breakdown.map(item => ({
        originalSentence: String(item.originalSentence || ""),
        correctedSentence: String(item.correctedSentence || ""),
        errorType: String(item.errorType || "Ngữ pháp"),
        severity: String(item.severity || "major"),
        explanationVi: String(item.explanationVi || ""),
        improvementTipVi: String(item.improvementTipVi || ""),
        similarExample: String(item.similarExample || "")
    }));

    return {
        gradingMode: String(payload.gradingMode || r.gradingMode || "internal_10"),
        totalScore10,
        scorePct,
        cefrEstimate: r.cefrEstimate || null,
        ieltsEstimate: r.ieltsEstimate || null,
        modeAssessmentSummary: String(r.modeAssessmentSummary || ""),
        missingFromRubric,
        criteria: normalizedCriteria,
        criteriaScores: {
            taskResponse: `${normalizedCriteria.taskResponse.scoreOutOf2_5}/2.5`,
            coherenceCohesion: `${normalizedCriteria.coherenceCohesion.scoreOutOf2_5}/2.5`,
            lexicalResource: `${normalizedCriteria.lexicalResource.scoreOutOf2_5}/2.5`,
            grammarAccuracy: `${normalizedCriteria.grammarAccuracy.scoreOutOf2_5}/2.5`
        },
        overviewVi: String(r.overviewVi || ""),
        sentenceBreakdown: normalizedBreakdown,
        corrections: normalizedBreakdown,
        improvementPlan: {
            strengths: Array.isArray(plan.strengths) ? plan.strengths : (Array.isArray(r.strengths) ? r.strengths : []),
            weaknesses: Array.isArray(plan.weaknesses) ? plan.weaknesses : (Array.isArray(r.weaknesses) ? r.weaknesses : []),
            priorityErrors: Array.isArray(plan.priorityErrors) ? plan.priorityErrors : [],
            fixGuides: Array.isArray(plan.fixGuides) ? plan.fixGuides : [],
            vocabularyToLearn: Array.isArray(plan.vocabularyToLearn) ? plan.vocabularyToLearn : [],
            grammarToReview: Array.isArray(plan.grammarToReview) ? plan.grammarToReview : [],
            ideaDevelopment: Array.isArray(plan.ideaDevelopment) ? plan.ideaDevelopment : [],
            targetedExercises: Array.isArray(plan.targetedExercises) ? plan.targetedExercises : [],
            nextEssayActionPlan: Array.isArray(plan.nextEssayActionPlan) ? plan.nextEssayActionPlan : []
        },
        strengths: Array.isArray(plan.strengths) ? plan.strengths : (Array.isArray(r.strengths) ? r.strengths : []),
        weaknesses: Array.isArray(plan.weaknesses) ? plan.weaknesses : (Array.isArray(r.weaknesses) ? r.weaknesses : []),
        upgradeSuggestions: Array.isArray(plan.fixGuides) ? plan.fixGuides : (Array.isArray(r.upgradeSuggestions) ? r.upgradeSuggestions : []),
        rewrittenVersions: {
            corrected: correctedVer,
            improved: improvedVer,
            advanced: advancedVer
        },
        revisedEssay: String(improvedVer.text || correctedVer.text || essayFallback)
    };
}

function buildWritingEvalPrompt(payload = {}) {
    const mode = String(payload.gradingMode || "internal_10");
    const modeDescMap = {
        internal_10: "QEnglish Internal 10-point academic rubric (4 equal criteria, 2.5 points each = 10 total).",
        ielts: "IELTS Writing estimation + 4 criteria x 2.5 breakdown. Note honestly that IELTS band is ONLY an educational reference, never an official score.",
        cefr: "CEFR proficiency estimation (A1-C2 reference) + 4 criteria x 2.5 breakdown.",
        toefl: "TOEFL Writing evaluation against provided prompt & standard/custom rubric + 4 criteria x 2.5 breakdown.",
        custom: "Custom user-supplied rubric evaluation + 4 criteria x 2.5 breakdown.",
        pen301: "PEN301 course mode. Evaluate strictly against the user-provided prompt, lecturerInstructions, customRubric, word count target, and attached guidelines. NEVER invent or fabricate undisclosed official PEN301 rules if missing from input; instead list missing rules clearly in missingFromRubric."
    };

    const modeDesc = modeDescMap[mode] || modeDescMap.internal_10;
    const minW = Number(payload.minWords) || 80;
    const maxW = Number(payload.maxWords) || 350;

    return {
        system: `You are a senior English academic writing assessor & IELTS/university instructor.
Return strictly valid JSON matching the exact requested schema.
Honesty rule:
- Each of the 4 criteria MUST be scored strictly between 0.0 and 2.5 (1 decimal place max).
- NEVER fabricate official test certificates or undisclosed institutional rules (especially in PEN301 or Custom mode). If rubric criteria or assignment details are absent from input, state clearly in missingFromRubric what was missing or could not be verified.
- All 3 rewritten essay versions MUST preserve the student's original ideas and core message, while progressively improving accuracy, cohesion, and academic range.
- Respond with explanations written clearly in Vietnamese so a Vietnamese learner understands root causes.`,
        prompt: `Grading Mode: ${mode} (${modeDesc})
Topic Title: ${String(payload.topic || "").slice(0, 300)}
Prompt: ${String(payload.prompt || "").slice(0, 1500)}
Target Level: ${String(payload.targetLevel || "B1")}
Word Count Requirement: ${minW} - ${maxW} words
Lecturer Instructions: ${String(payload.lecturerInstructions || "None provided").slice(0, 1500)}
Custom Rubric / Grading Sheet: ${String(payload.customRubric || "None provided").slice(0, 2000)}
Attached Guideline Excerpt (${String(payload.attachmentName || "none")}): ${String(payload.attachmentText || "None").slice(0, 2500)}

Student Essay:
"""
${String(payload.essay || "").slice(0, 5500)}
"""

Return valid JSON with exact structure:
{
  "cefrEstimate": "e.g. B1+ (Tham khảo học tập)",
  "ieltsEstimate": "e.g. Band 5.5 - 6.0 (Tham khảo học tập, không phải điểm chính thức)",
  "modeAssessmentSummary": "Vietnamese assessment specifically addressing the chosen mode (${mode})",
  "missingFromRubric": ["Requirements from prompt/lecturer/rubric not yet met OR rubric items not provided in input"],
  "criteria": {
    "taskResponse": {
      "label": "1. Task Achievement / Task Response",
      "scoreOutOf2_5": number,
      "feedbackVi": "Vietnamese evaluation",
      "achieved": ["..."],
      "missing": ["..."],
      "errors": [{"issue": "...", "severity": "critical|major|minor", "fix": "..."}]
    },
    "coherenceCohesion": {
      "label": "2. Coherence & Cohesion",
      "scoreOutOf2_5": number,
      "feedbackVi": "Vietnamese evaluation",
      "achieved": ["..."],
      "missing": ["..."],
      "errors": [{"issue": "...", "severity": "critical|major|minor", "fix": "..."}]
    },
    "lexicalResource": {
      "label": "3. Lexical Resource",
      "scoreOutOf2_5": number,
      "feedbackVi": "Vietnamese evaluation",
      "achieved": ["..."],
      "missing": ["..."],
      "errors": [{"issue": "...", "severity": "critical|major|minor", "fix": "..."}]
    },
    "grammarAccuracy": {
      "label": "4. Grammatical Range & Accuracy",
      "scoreOutOf2_5": number,
      "feedbackVi": "Vietnamese evaluation",
      "achieved": ["..."],
      "missing": ["..."],
      "errors": [{"issue": "...", "severity": "critical|major|minor", "fix": "..."}]
    }
  },
  "overviewVi": "Comprehensive Vietnamese overview of essay quality",
  "sentenceBreakdown": [
    {
      "originalSentence": "...",
      "correctedSentence": "...",
      "errorType": "Ngữ pháp / Từ vựng / Chính tả / Liên kết / Diễn đạt",
      "severity": "critical|major|minor",
      "explanationVi": "Why it is problematic in Vietnamese",
      "improvementTipVi": "How to upgrade this sentence structure",
      "similarExample": "A clean parallel example sentence"
    }
  ],
  "improvementPlan": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "priorityErrors": ["Top recurring errors to fix first"],
    "fixGuides": ["Actionable fix rule in Vietnamese"],
    "vocabularyToLearn": [{"word": "...", "meaningVi": "...", "usageExample": "..."}],
    "grammarToReview": [{"topic": "...", "explanationVi": "...", "formula": "..."}],
    "ideaDevelopment": ["How to expand arguments & examples better"],
    "targetedExercises": [
      {
        "prompt": "Mini fix-the-error or rewrite drill tailored to the student's actual mistake",
        "question": "...",
        "answer": "...",
        "explanationVi": "..."
      }
    ],
    "nextEssayActionPlan": ["Step 1 before writing next essay...", "Step 2..."]
  },
  "rewrittenVersions": {
    "corrected": {
      "text": "Grammar & accuracy fixed version preserving student's voice",
      "changesSummaryVi": "Key grammar/spelling fixes made"
    },
    "improved": {
      "text": "Fluent, cohesive, well-structured version preserving original ideas",
      "changesSummaryVi": "Cohesion, phrasing and flow upgrades made"
    },
    "advanced": {
      "text": "High-scoring C1+/academic version preserving original arguments",
      "changesSummaryVi": "Lexical & syntactic upgrades explained"
    }
  }
}`
    };
}

function buildTaskPrompt(task, payload = {}) {
    if (task === "sentence-check") {
        return {
            system: "You are a supportive English teacher for Vietnamese university students. Always reply in valid JSON.",
            prompt: `Analyze the student's English sentence using the target word "${payload.word || ""}" (meaning: "${payload.meaningVi || ""}").
Student sentence: "${String(payload.sentence || "").slice(0, 600)}"
Return JSON with exact keys:
{
  "isCorrect": boolean,
  "feedbackVi": "Detailed Vietnamese explanation of vocabulary usage, grammar, capitalization, punctuation, and naturalness",
  "correctedSentence": "Corrected English sentence",
  "naturalAlternative": "A more natural everyday/academic way to express it"
}`
        };
    }

    if (task === "writing-eval") {
        return buildWritingEvalPrompt(payload);
    }

    if (task === "speaking-chat") {
        return {
            system: "You are a friendly English speaking partner for a Vietnamese learner. Keep replies concise (1-3 sentences) and end with 1 natural follow-up question. Return valid JSON: {\"reply\": \"...\"}.",
            prompt: `Target level: ${payload.level || "B1"}
Recent conversation turns:
${JSON.stringify((payload.history || []).slice(-8))}
Return JSON: { "reply": "Your natural English response + follow-up question" }`
        };
    }

    if (task === "speaking-eval") {
        return {
            system: "You are an English speaking coach. Be strictly honest: the input is ONLY a text transcript from SpeechRecognition without raw audio waveforms, so do NOT invent IPA/acoustic pitch measurements from audio. Evaluate fluency indicators, grammar, vocabulary, coherence, and natural spoken English. Return valid JSON.",
            prompt: `Topic: ${payload.topic || "Free Conversation"}
Level: ${payload.level || "B1"}, Approximate speed: ${payload.wpm || 100} WPM
Student transcript:
"""
${String(payload.transcript || "").slice(0, 4000)}
"""
Return JSON:
{
  "overallScore": number,
  "pronunciationScore": null,
  "transcriptHonestyNote": "Lưu ý: Phân tích từ văn bản Speech-to-Text; hệ thống không phân tích trực tiếp sóng âm thanh.",
  "fluencyFeedbackVi": "Vietnamese feedback on flow, pacing and sentence length",
  "errors": [
    {
      "wrongSentence": "...",
      "where": "...",
      "why": "Vietnamese explanation",
      "fixedSentence": "...",
      "naturalWay": "More natural spoken expression"
    }
  ],
  "upgradePhrases": ["Natural spoken filler/idiom/transition 1", "phrase 2"],
  "modelAnswer": "Natural 5-7 sentence spoken model answer for this topic"
}`
        };
    }

    if (task === "vocab-coach") {
        const action = payload.action || "enrich";
        if (action === "quiz") {
            return {
                system: "You are an English vocabulary coach. Create short contextual recall questions from the user's difficult/due words. Return valid JSON.",
                prompt: `Create ${Math.min(5, Math.max(2, Number(payload.count) || 4))} contextual fill-in-the-blank or nuance questions for these words:
${JSON.stringify((payload.words || []).slice(0, 12))}
Return JSON:
{
  "questions": [
    {
      "word": "...",
      "question": "Sentence with ____ blank or usage question",
      "options": ["A", "B", "C", "D"],
      "answer": "Exact correct option",
      "explanationVi": "Vietnamese explanation + collocation note"
    }
  ]
}`
            };
        }
        return {
            system: "You are a bilingual English lexicographer & vocabulary coach. Return valid JSON.",
            prompt: `Enrich the English word/phrase "${String(payload.word || "").slice(0, 120)}" (context/meaning hint: "${String(payload.meaningHint || "").slice(0, 200)}").
Return JSON:
{
  "term": "...",
  "ipa": "/.../",
  "pos": "noun / verb / adj / phrase",
  "level": "A1-C2",
  "coreMeaningsVi": ["Nghĩa chính 1", "Nghĩa mở rộng 2"],
  "collocations": ["natural collocation 1", "collocation 2", "collocation 3"],
  "wordFamily": ["noun form", "verb form", "adj form", "adv form"],
  "phrasalOrIdioms": ["related phrasal verb or idiom with Vietnamese meaning"],
  "contextExamples": [
    {"en": "Daily life example", "vi": "..."},
    {"en": "Academic/IELTS example", "vi": "..."},
    {"en": "Work/tech example", "vi": "..."}
  ],
  "commonMistakeVi": "Mistake Vietnamese learners often make with this word and how to avoid it"
}`
        };
    }

    if (task === "grammar-coach") {
        return {
            system: "You are an English grammar coach for Vietnamese learners. Explain clearly, concisely, and contrast confusing structures accurately. Return valid JSON.",
            prompt: `Action: ${payload.action || "debug"}
Topic context: ${String(payload.topic || "").slice(0, 200)}
User query or sentence: "${String(payload.query || "").slice(0, 1200)}"
Return JSON:
{
  "summaryVi": "Clear explanation in Vietnamese",
  "correctedSentence": "If a sentence was submitted, corrected version; else formula/rule example",
  "formula": "Key structure/formula",
  "comparisonTable": [
    {"structure": "...", "usageVi": "...", "example": "..."}
  ],
  "miniExercises": [
    {"question": "...", "options": ["A", "B", "C", "D"], "answer": "Exact matching option", "explanationVi": "..."}
  ]
}`
        };
    }

    if (task === "listening-coach") {
        return {
            system: "You are an English listening coach analyzing a transcript/audio text for a Vietnamese student. Return valid JSON.",
            prompt: `Title: ${String(payload.title || "").slice(0, 200)}
Level: ${payload.level || "B1"}
Transcript:
"""
${String(payload.transcript || "").slice(0, 4000)}
"""
User missed/asked about: ${String(payload.focus || "").slice(0, 600)}
Return JSON:
{
  "summaryVi": "Short summary of what the audio is about in Vietnamese",
  "keyPhrases": [
    {"phrase": "...", "connectedSpeechTip": "Listening/pronunciation tip (linking, weak form, stress)", "meaningVi": "..."}
  ],
  "comprehensionQuestions": [
    {"question": "...", "options": ["A", "B", "C", "D"], "answer": "Exact option", "explanationVi": "Why right and why distractors fail"}
  ]
}`
        };
    }

    if (task === "reading-coach") {
        return {
            system: "You are an academic English reading tutor helping a Vietnamese learner dissect passages accurately. Return valid JSON.",
            prompt: `Title: ${String(payload.title || "").slice(0, 200)}
Action: ${payload.action || "analyze"} (analyze | lookup | summarize)
Target sentence/word: "${String(payload.selection || "").slice(0, 1000)}"
Passage context:
"""
${String(payload.passage || "").slice(0, 4500)}
"""
Return JSON:
{
  "mainIdeaVi": "Main idea or passage structure summary in Vietnamese",
  "sentenceBreakdownVi": "Detailed clause-by-clause grammar/meaning breakdown of selection or complex sentences",
  "keyVocabulary": [
    {"word": "...", "meaningInContextVi": "...", "partOfSpeech": "..."}
  ],
  "practiceQuestion": {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "Exact matching option",
    "evidenceVi": "Which sentence in the passage proves the answer"
  }
}`
        };
    }

    if (task === "learning-assistant") {
        return {
            system: "You are a personalized English learning strategist. Analyze ONLY the provided student telemetry/summary honestly. If data is sparse, say so candidly instead of guessing proficiency. Level estimates are reference-only. Return valid JSON.",
            prompt: `Student profile & real study telemetry (current user only):
${JSON.stringify(payload.summary || {}).slice(0, 5000)}
Return JSON:
{
  "estimatedLevelReference": "e.g. Chưa đủ dữ liệu OR B1 (Tham khảo học tập từ dữ liệu hiện có)",
  "diagnosisVi": "Honest assessment of strengths, weak skills, and error patterns observed",
  "priorityFocus": ["Top 3 weak areas or errors to prioritize"],
  "recommendedNextSteps": [
    {"day": "Hôm nay", "skill": "Writing / Vocabulary / ...", "taskVi": "Concrete actionable task", "minutes": 20}
  ],
  "motivationalNoteVi": "Encouraging personalized note in Vietnamese"
}`
        };
    }

    if (task === "generate-content") {
        const skill = payload.skill || "reading";
        const level = payload.level || "B1";
        const topic = payload.topic || "University Life";
        const count = Math.min(6, Math.max(1, Number(payload.questionCount) || 3));
        return {
            system: "You design original, copyright-safe English learning exercises for university students. Return valid JSON.",
            prompt: `Create 1 new "${skill}" learning item at level "${level}" about "${topic}" with ${count} practice questions.
Return JSON:
{
  "title": "Clear English title",
  "contentText": "Main passage / transcript / writing prompt / grammar explanation (120-220 words)",
  "payload": {
    "type": "${skill === "listening" ? "multiple_choice" : skill === "writing" ? "paragraph" : "academic"}",
    "passage": "Passage text if reading",
    "transcript": "Audio transcript if listening",
    "prompt": "Prompt if writing or speaking",
    "explanation": "Vietnamese explanation if grammar",
    "formula": "Grammar formula if grammar",
    "questions": [
      {
        "type": "multiple_choice",
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Exact matching correct option text",
        "explanation": "Vietnamese explanation"
      }
    ]
  }
}`
        };
    }

    const err = new Error(`Unsupported AI task: ${task}`);
    err.statusCode = 400;
    throw err;
}

function isBlockedHost(hostname) {
    const h = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
    if (!h) return true;
    return (
        h === "localhost" ||
        h === "127.0.0.1" ||
        h === "::1" ||
        h === "0.0.0.0" ||
        h.startsWith("192.168.") ||
        h.startsWith("10.") ||
        h.startsWith("169.254.") ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
        /^fe80:/i.test(h) ||
        /^fc00:|^fd[0-9a-f]{2}:/i.test(h) ||
        h.endsWith(".local") ||
        h.endsWith(".internal")
    );
}

async function extractFromPublicUrl(targetUrl) {
    let parsed;
    try {
        parsed = new URL(targetUrl);
    } catch {
        const err = new Error("Địa chỉ URL không hợp lệ.");
        err.statusCode = 400;
        throw err;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        const err = new Error("Chỉ hỗ trợ giao thức HTTP hoặc HTTPS.");
        err.statusCode = 400;
        throw err;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (isBlockedHost(hostname)) {
        const err = new Error("Không được phép truy cập địa chỉ mạng nội bộ (SSRF Protection).");
        err.statusCode = 403;
        throw err;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
        const resp = await fetch(parsed.toString(), {
            method: "GET",
            redirect: "manual",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) QEnglish-LearningBot/2.0",
                "Accept": "text/html,text/plain,application/xhtml+xml;q=0.9"
            },
            signal: ctrl.signal
        });
        clearTimeout(timer);
        if (resp.status >= 300 && resp.status < 400) {
            const loc = resp.headers.get("location") || "";
            const err = new Error(`Website nguồn chuyển hướng sang địa chỉ khác (${loc ? "vui lòng dùng URL đích trực tiếp" : "Redirect bị chặn để bảo vệ SSRF"}).`);
            err.statusCode = 400;
            throw err;
        }
        if (!resp.ok) {
            const err = new Error(`Máy chủ nguồn phản hồi mã lỗi HTTP ${resp.status}. Không thể trích xuất nội dung.`);
            err.statusCode = resp.status >= 500 ? 502 : 400;
            throw err;
        }

        const rawHtml = await resp.text();
        const clean = rawHtml
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
            .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
            .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
            .replace(/<!--[\s\S]*?-->/g, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, " ")
            .trim();

        const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const pageTitle = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : parsed.hostname;
        const snippet = clean.slice(0, 4500);
        if (snippet.length < 50) {
            const err = new Error("Trang web không chứa văn bản tiếng Anh đọc được hoặc bị chặn bởi JavaScript render.");
            err.statusCode = 422;
            throw err;
        }

        return {
            title: pageTitle,
            url: parsed.toString(),
            hostname,
            extractedText: snippet,
            wordCount: snippet.split(/\s+/).filter(Boolean).length
        };
    } catch (err) {
        clearTimeout(timer);
        if (err.statusCode) throw err;
        const e = new Error(err.name === "AbortError" ? "Hết thời gian chờ phản hồi từ website (12s)." : (err.message || "Không thể kết nối tới website nguồn."));
        e.statusCode = 504;
        throw e;
    }
}

async function handleAIRequest({ method, task, body, clientIp, authHeader = "" }) {
    if (method === "GET" && task === "status") {
        return { statusCode: 200, json: { ok: true, ...detectProvider() } };
    }
    if (method !== "POST") {
        return { statusCode: 405, json: { ok: false, error: "Method Not Allowed" } };
    }

    let authResult = { authenticated: false, user: null };
    try {
        authResult = await verifySupabaseAuth(authHeader);
    } catch (err) {
        return { statusCode: err.statusCode || 401, json: { ok: false, error: err.message } };
    }

    const rateKey = authResult.user?.id ? `uid:${authResult.user.id}` : `ip:${clientIp || "unknown"}`;
    if (!checkRateLimit(rateKey)) {
        return {
            statusCode: 429,
            json: { ok: false, error: "Bạn đang gửi yêu cầu quá nhanh (Rate Limit). Vui lòng đợi 1 phút rồi thử lại." }
        };
    }

    if (task === "extract-url") {
        try {
            const targetUrl = String(body.url || "").trim();
            if (!targetUrl) {
                return { statusCode: 400, json: { ok: false, error: "Vui lòng cung cấp URL bài học cần trích xuất." } };
            }
            const extracted = await extractFromPublicUrl(targetUrl);
            return {
                statusCode: 200,
                json: { ok: true, provider: "QEnglish-UrlScraper", result: extracted }
            };
        } catch (err) {
            return {
                statusCode: err.statusCode || 500,
                json: { ok: false, error: err.message || "Lỗi trích xuất URL." }
            };
        }
    }

    try {
        const { system, prompt } = buildTaskPrompt(task, body || {});
        const out = await callLLMJson(system, prompt);
        const finalResult = task === "writing-eval"
            ? normalizeWritingResult(out.result, body || {})
            : out.result;
        return {
            statusCode: 200,
            json: {
                ok: true,
                provider: out.provider,
                userId: authResult.user?.id || null,
                result: finalResult
            }
        };
    } catch (err) {
        const code = err.statusCode || (err.name === "AbortError" ? 504 : 500);
        return {
            statusCode: code,
            json: {
                ok: false,
                error: err.name === "AbortError"
                    ? "Yêu cầu tới nhà cung cấp AI vượt quá thời gian chờ (45s)."
                    : (err.message || "Lỗi xử lý từ Backend AI.")
            }
        };
    }
}

async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    const urlPath = (req.url || "").split("?")[0];
    const parts = urlPath.split("/").filter(Boolean);
    const task = req.query?.task || parts[parts.length - 1] || "status";
    const clientIp = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "vercel-client";

    const response = await handleAIRequest({
        method: req.method,
        task,
        body: req.body || {},
        clientIp,
        authHeader: req.headers.authorization || ""
    });

    return res.status(response.statusCode).json(response.json);
}

handler.detectProvider = detectProvider;
handler.handleAIRequest = handleAIRequest;
handler.normalizeWritingResult = normalizeWritingResult;

module.exports = handler;
