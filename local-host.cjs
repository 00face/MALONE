/*
 * MALONE BRIDGE SERVER v2.2
 * acts as the local file system interface for Titan Protocol.
 * * Usage:
 * 1. Place in your project root.
 * 2. Run: node local-host.cjs
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = './'; // Files will be saved relative to where this script is run

console.log(`\n--- MALONE BRIDGE v2.2 (Smart Root) ---`);
console.log(`[DIR] Target Forge: ${path.resolve(ROOT_DIR)}`);

// 1. MIME Types Dictionary
// Note: We serve source code (.jsx, .ts) as plain text to prevent
// browsers from trying to execute them and throwing errors.
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.jsx': 'text/plain',
    '.ts': 'text/plain',
    '.tsx': 'text/plain',
    '.md': 'text/plain'
};

// 2. Store Live Reload Clients
const clients = [];

http.createServer((req, res) => {
    // A. CORS Headers (Allow Titan to communicate from AI Studio)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // B. Pre-flight Check
    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        return res.end();
    }

    // C. Live Reload Subscription Endpoint
    if (req.url === '/__live') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
            'Connection': 'keep-alive'
        });
        clients.push(res);
        return;
    }

    // D. SAVE API (The Write Logic)
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { filePath, content } = JSON.parse(body);

                // Sanitize: Prevent directory traversal and remove leading slashes
                const cleanPath = filePath.replace(/^[\/\\]/, '').replace(/^(\.\.[\/\\])+/, '');
                const fullPath = path.join(__dirname, ROOT_DIR, cleanPath);
                const dirName = path.dirname(fullPath);

                // Recursive Directory Creation
                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, { recursive: true });
                    console.log(`[MKDIR] Constructed Sector: ${dirName}`);
                }

                // Write File
                fs.writeFile(fullPath, content, err => {
                    if (err) {
                        console.error(`[ERR] Write failed: ${err.message}`);
                        res.writeHead(500, headers);
                        res.end('Write Error');
                    } else {
                        console.log(`[SAVED] ${cleanPath}`);
                        res.writeHead(200, headers);
                        res.end('Saved');

                        // Notify clients to reload
                        clients.forEach(c => c.write('data:reload\n\n'));
                    }
                });
            } catch (e) {
                console.error(`[ERR] Invalid Payload: ${e.message}`);
                res.writeHead(400, headers);
                res.end('Invalid JSON');
            }
        });
        return;
    }

    // E. STATIC FILE SERVER (Smart Root Logic)

    // Default logic: Requesting root ('/') tries to serve 'index.html'
    let resourcePath = req.url === '/' ? 'index.html' : req.url;
    resourcePath = resourcePath.split('?')[0]; // Remove query params

    let fullPath = path.join(__dirname, ROOT_DIR, resourcePath);

    // SMART FALLBACK:
    // If user requests root ('/') and 'index.html' DOES NOT exist yet,
    // serve 'monaco.html' (The Status/Guide Page) instead.
    if (req.url === '/' && !fs.existsSync(fullPath)) {
        fullPath = path.join(__dirname, ROOT_DIR, 'monaco.html');
    }

    if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
        const ext = path.extname(fullPath);

        fs.readFile(fullPath, (err, content) => {
            if (err) {
                res.writeHead(500, headers);
                res.end('Read Error');
            } else {
                // If serving HTML, inject the Live Reload script
                if (ext === '.html') {
                    const injection = `<script>new EventSource("/__live").onmessage=()=>location.reload()</script>`;
                    // Append before body close, or at end
                    const htmlStr = content.toString() + injection;
                    res.writeHead(200, { ...headers, 'Content-Type': 'text/html' });
                    res.end(htmlStr);
                } else {
                    res.writeHead(200, { ...headers, 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
                    res.end(content);
                }
            }
        });
    } else {
        res.writeHead(404, headers);
        res.end('Not Found (Titan Bridge)');
    }

}).listen(PORT, () => {
    console.log(`[ONLINE] Bridge Listening on http://localhost:${PORT}`);
    console.log(`[NOTE]  Port 3000 is for file transfer.`);
    console.log(`[NOTE]  Run 'npm install && npm run dev' in a new terminal to build the App.`);
});
