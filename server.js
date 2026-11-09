/* ==========================================================================
   QEnglish — Zero-Dependency Local & Cloud Node.js Server (Node 18+)
   - Automatically loads .env without external npm packages
   - Serves frontend static files safely
   - Hosts /api/ai/* endpoints keeping API keys 100% off the frontend
   ========================================================================== */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

// Built-in .env loader (no dotenv dependency required)
(function loadDotEnv() {
    const envPath = path.join(__dirname, ".env");
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
        if (key && !(key in process.env)) {
            process.env[key] = val;
        }
    }
})();

const { handleAIRequest, detectProvider } = require("./api/ai");

const PORT = parseInt(process.env.PORT || "3000", 10) || 3000;
const ROOT_DIR = __dirname;
const MAX_BODY_BYTES = 32 * 1024;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon"
};

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let raw = "";
        let bytes = 0;
        req.on("data", chunk => {
            bytes += chunk.length;
            if (bytes > MAX_BODY_BYTES) {
                reject(new Error("Payload vượt quá 32KB cho phép."));
                req.destroy();
                return;
            }
            raw += chunk.toString("utf8");
        });
        req.on("end", () => {
            if (!raw.trim()) return resolve({});
            try {
                resolve(JSON.parse(raw));
            } catch (e) {
                reject(new Error("JSON body không hợp lệ."));
            }
        });
        req.on("error", reject);
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // CORS headers for optional local dev port separation
    res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    // Secure Backend AI API routes
    if (pathname.startsWith("/api/ai/")) {
        const task = pathname.slice("/api/ai/".length).replace(/\/+$/, "");
        const clientIp = req.socket.remoteAddress || "local";
        let body = {};
        if (req.method === "POST") {
            try {
                body = await readJsonBody(req);
            } catch (err) {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                return res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        }
        const out = await handleAIRequest({ method: req.method, task, body, clientIp });
        res.writeHead(out.statusCode, { "Content-Type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify(out.json));
    }

    // Block sensitive server files from ever being served statically
    const lowerPath = pathname.toLowerCase();
    if (
        lowerPath.includes(".env") ||
        lowerPath.startsWith("/api/") ||
        lowerPath.endsWith("server.js") ||
        lowerPath.endsWith(".sql")
    ) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("403 Forbidden");
    }

    // Static file serving with path traversal guard
    const relPath = pathname === "/" ? "/index.html" : pathname;
    const absPath = path.resolve(ROOT_DIR, "." + relPath);
    if (!absPath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("403 Forbidden");
    }

    fs.stat(absPath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            return res.end("404 Not Found");
        }
        const ext = path.extname(absPath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
        fs.createReadStream(absPath).pipe(res);
    });
});

server.listen(PORT, () => {
    const info = detectProvider();
    console.log("==============================================================");
    console.log(`🚀 QEnglish Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`🔐 Trạng thái AI Backend: ${info.configured ? `Đã kích hoạt (${info.provider} - ${info.model})` : "Chưa cấu hình API Key trong .env (Chế độ Local Mode)"}`);
    console.log("==============================================================");
});
