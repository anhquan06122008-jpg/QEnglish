/* ==========================================================================
   QEnglish — Secure Backend AI Core (Gemini & OpenAI via Server .env ONLY)
   Enforces Section 9.3 & Section 10:
   - Zero API keys in frontend or responses
   - Per-IP sliding-window rate limiting
   - Input length & output token limits
   - 20-second upstream timeout + structured JSON validation
   ========================================================================== */

"use strict";

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_PER_MIN = parseInt(process.env.RATE_LIMIT_MAX_PER_MIN || "20", 10) || 20;
const MAX_INPUT_CHARS = parseInt(process.env.AI_MAX_INPUT_CHARS || "6000", 10) || 6000;
const MAX_OUTPUT_TOKENS = parseInt(process.env.AI_MAX_OUTPUT_TOKENS || "1400", 10) || 1400;
const UPSTREAM_TIMEOUT_MS = 20000;

const ipBuckets = new Map();

function checkRateLimit(ip) {
    const key = ip || "unknown";
    const now = Date.now();
    const arr = (ipBuckets.get(key) || []).filter(ts => now - ts < RATE_WINDOW_MS);
    if (arr.length >= RATE_MAX_PER_MIN) {
        return false;
    }
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
        message: "Máy chủ Backend đang chạy nhưng chưa cấu hình GEMINI_API_KEY hoặc OPENAI_API_KEY trong file .env."
    };
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
                        temperature: 0.35,
                        maxOutputTokens: MAX_OUTPUT_TOKENS,
                        responseMimeType: "application/json"
                    }
                }),
                signal: ctrl.signal
            });
            clearTimeout(timer);
            if (!resp.ok) {
                throw new Error(`Gemini upstream HTTP ${resp.status}`);
            }
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
                    temperature: 0.35,
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
            if (!resp.ok) {
                throw new Error(`OpenAI upstream HTTP ${resp.status}`);
            }
            const data = await resp.json();
            const text = data?.choices?.[0]?.message?.content || "{}";
            return { provider: `${info.provider} (${info.model})`, result: extractJSONFromText(text) };
        }
    } finally {
        clearTimeout(timer);
    }
}

function buildTaskPrompt(task, payload = {}) {
    if (task === "sentence-check") {
        return {
            system: "You are a supportive English teacher for FPT University students (Level B1). Always reply in valid JSON.",
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
        return {
            system: "You are an academic English writing instructor. Evaluate honestly across 6 criteria (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy, Spelling & Punctuation, Naturalness). CEFR and IELTS estimates are strictly for study reference, never official test scores. Return valid JSON.",
            prompt: `Topic: ${payload.topic || ""}
Prompt: ${payload.prompt || ""}
Target Level: ${payload.targetLevel || "B1"} (Minimum words: ${payload.minWords || 80})
Student Essay:
"""
${String(payload.essay || "").slice(0, 4500)}
"""
Return JSON with exact keys:
{
  "scorePct": number,
  "cefrEstimate": "e.g. B1 (Tham khảo học tập)",
  "ieltsEstimate": "e.g. Band 5.0 - 5.5 (Tham khảo, không phải điểm thi chính thức)",
  "overviewVi": "Vietnamese summary covering all 6 criteria",
  "strengths": ["Vietnamese point 1", "Vietnamese point 2"],
  "weaknesses": ["Vietnamese point 1", "Vietnamese point 2"],
  "corrections": [
    {
      "originalSentence": "...",
      "errorType": "Ngữ pháp / Từ vựng / Chính tả / Tự nhiên",
      "correctedSentence": "...",
      "explanationVi": "Vietnamese explanation why it was wrong and how to fix"
    }
  ],
  "upgradeSuggestions": ["Vietnamese vocabulary/structure upgrade tip 1", "tip 2"],
  "revisedEssay": "Polished improved English version suitable for student's target level"
}`
        };
    }

    if (task === "speaking-chat") {
        return {
            system: "You are a friendly English speaking partner for a first-year FPT University student. Keep replies concise (1-3 sentences) and end with 1 natural follow-up question. Return valid JSON: {\"reply\": \"...\"}.",
            prompt: `Target level: ${payload.level || "B1"}
Recent conversation turns:
${JSON.stringify((payload.history || []).slice(-8))}
Return JSON: { "reply": "Your natural English response + follow-up question" }`
        };
    }

    if (task === "speaking-eval") {
        return {
            system: "You are an English speaking coach. Note honestly that text transcript comes from SpeechRecognition (do NOT claim phonetic IPA/intonation waveform grading). Return valid JSON.",
            prompt: `Topic: ${payload.topic || "Free Conversation"}
Level: ${payload.level || "B1"}, Speaking speed: ${payload.wpm || 100} WPM
Student transcript:
"""
${String(payload.transcript || "").slice(0, 3500)}
"""
Return JSON:
{
  "overallScore": number,
  "errors": [
    {
      "wrongSentence": "...",
      "where": "...",
      "why": "Vietnamese explanation",
      "fixedSentence": "...",
      "naturalWay": "More natural spoken expression"
    }
  ],
  "modelAnswer": "Natural 5-7 sentence model answer for this topic"
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

async function handleAIRequest({ method, task, body, clientIp }) {
    if (method === "GET" && task === "status") {
        return { statusCode: 200, json: { ok: true, ...detectProvider() } };
    }

    if (method !== "POST") {
        return { statusCode: 405, json: { ok: false, error: "Method Not Allowed" } };
    }

    if (!checkRateLimit(clientIp)) {
        return {
            statusCode: 429,
            json: { ok: false, error: "Bạn đang gửi yêu cầu AI quá nhanh (Rate Limit bảo vệ chi phí). Vui lòng đợi 1 phút rồi thử lại." }
        };
    }

    try {
        const { system, prompt } = buildTaskPrompt(task, body || {});
        const out = await callLLMJson(system, prompt);
        return {
            statusCode: 200,
            json: { ok: true, provider: out.provider, result: out.result }
        };
    } catch (err) {
        const code = err.statusCode || (err.name === "AbortError" ? 504 : 500);
        return {
            statusCode: code,
            json: {
                ok: false,
                error: err.name === "AbortError"
                    ? "Yêu cầu tới nhà cung cấp AI vượt quá thời gian chờ (20s)."
                    : (err.message || "Lỗi xử lý từ Backend AI.")
            }
        };
    }
}

module.exports = {
    detectProvider,
    handleAIRequest
};
