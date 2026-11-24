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

    const b2Configured = Boolean(
        (process.env.B2_ENDPOINT || "").trim() &&
        (process.env.B2_BUCKET || "").trim() &&
        (process.env.B2_KEY_ID || "").trim() &&
        (process.env.B2_APP_KEY || "").trim()
    );
    const r2Configured = Boolean(
        ((process.env.R2_ENDPOINT || "").trim() || (process.env.R2_ACCOUNT_ID || "").trim()) &&
        (process.env.R2_BUCKET || "").trim() &&
        (process.env.R2_ACCESS_KEY_ID || "").trim() &&
        (process.env.R2_SECRET_ACCESS_KEY || "").trim()
    );
    const gdriveClientId = (process.env.GDRIVE_CLIENT_ID || "").trim();
    const gdriveServerConfigured = Boolean(
        gdriveClientId &&
        (process.env.GDRIVE_CLIENT_SECRET || "").trim() &&
        (process.env.GDRIVE_REFRESH_TOKEN || "").trim()
    );

    return {
        ok: true,
        aiConfigured,
        aiProvider,
        aiModel: hasGemini
            ? (process.env.GEMINI_MODEL || "gemini-3.5-flash-lite")
            : (hasOpenAI ? (process.env.OPENAI_MODEL || "gpt-4o-mini") : null),
        authConfigured,
        supabaseUrl: authConfigured ? supabaseUrl : "",
        supabaseAnonKey: authConfigured ? supabaseAnonKey : "",
        requireAuthForAi,
        storageBucket: "qenglish-materials",
        gdriveClientId,
        cloudStorageProviders: {
            supabase: { configured: authConfigured, quotaGB: 1, maxFileMB: 10 },
            b2: { configured: b2Configured, quotaGB: 10, maxFileMB: 100 },
            r2: { configured: r2Configured, quotaGB: 10, maxFileMB: 100 },
            gdrive: { configured: gdriveServerConfigured, clientOAuthReady: Boolean(gdriveClientId), quotaGB: 15, maxFileMB: 100 }
        },
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
