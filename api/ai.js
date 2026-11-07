/* ==========================================================================
   Vercel Serverless Entry Point — Routes /api/ai/:task securely
   Configure GEMINI_API_KEY or OPENAI_API_KEY in Vercel Environment Variables.
   ========================================================================== */

"use strict";

const { handleAIRequest } = require("./ai-core");

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
        clientIp
    });

    return res.status(response.statusCode).json(response.json);
};
