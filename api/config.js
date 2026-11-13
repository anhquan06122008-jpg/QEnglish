/* ==========================================================================
   QEnglish — Public Runtime Configuration Endpoint (/api/config)
   Exposes ONLY non-secret public flags & Supabase URL/Anon Key for Auth UI.
   NEVER returns GEMINI_API_KEY, OPENAI_API_KEY, or Service Role secrets!
   ========================================================================== */

"use strict";

function getPublicConfig() {
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
    const aiProvider = hasGemini ? "gemini" : (hasOpenAI ? "openai" : "none");
    const aiConfigured = hasGemini || hasOpenAI;

    const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
    const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || "").trim();
    const authConfigured = Boolean(supabaseUrl && supabaseAnonKey);
    const requireAuthForAi = process.env.REQUIRE_AUTH_FOR_AI === "true" && authConfigured;

    return {
        ok: true,
        aiConfigured,
        aiProvider,
        aiModel: hasGemini
            ? (process.env.GEMINI_MODEL || "gemini-2.5-flash")
            : (hasOpenAI ? (process.env.OPENAI_MODEL || "gpt-4o-mini") : null),
        authConfigured,
        supabaseUrl: authConfigured ? supabaseUrl : "",
        supabaseAnonKey: authConfigured ? supabaseAnonKey : "",
        requireAuthForAi,
        storageBucket: "qenglish-materials",
        checkedAt: new Date().toISOString()
    };
}

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Cache-Control", "no-store");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }
    if (req.method !== "GET") {
        return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    return res.status(200).json(getPublicConfig());
};

module.exports.getPublicConfig = getPublicConfig;
