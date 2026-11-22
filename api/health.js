/* ==========================================================================
   QEnglish — 24/7 Cloud Health Check & Diagnostics Endpoint (/api/health)
   Returns non-secret service readiness for uptime monitoring & client probes.
   ========================================================================== */

"use strict";

const { getPublicConfig } = require("./config");

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

    const cfg = getPublicConfig();
    let supabaseReachable = null;
    if (cfg.authConfigured && cfg.supabaseUrl) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 3500);
        try {
            const probe = await fetch(`${cfg.supabaseUrl}/auth/v1/settings`, {
                method: "GET",
                headers: { apikey: cfg.supabaseAnonKey },
                signal: ctrl.signal
            });
            supabaseReachable = probe.ok;
        } catch {
            supabaseReachable = false;
        } finally {
            clearTimeout(timer);
        }
    }

    const status = cfg.authConfigured && supabaseReachable === false ? "degraded" : "healthy";
    return res.status(200).json({
        ok: true,
        status,
        runtime: process.env.VERCEL ? "vercel-serverless" : "node-http",
        ai: {
            configured: cfg.aiConfigured,
            provider: cfg.aiProvider,
            model: cfg.aiModel
        },
        supabase: {
            configured: cfg.authConfigured,
            reachable: supabaseReachable
        },
        checkedAt: new Date().toISOString()
    });
};
