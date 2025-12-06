const http = require('http'),
    fs = require('fs'),
    path = require('path');

const PORT = 3000;
const ROOT_DIR = './';

// Store client connections for Live Reload (Server-Sent Events)
const clients = [];
let fsWait = false;

try {
    // Watch for file changes in the root directory (with 100ms debounce)
    fs.watch(ROOT_DIR, (eventType, filename) => {
        if (filename && !filename.startsWith('.') && filename !== 'local-host.js') {
            if (fsWait) return;
            fsWait = setTimeout(() => {
                fsWait = false;
            }, 100);
            
            // Send reload command to all connected clients
            clients.forEach(res => res.write('data:r\n\n'));
        }
    });
} catch (e) {
    console.log('Watch Error: File watching may not work on some platforms.', e.message);
}

// MIME Types for serving files
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.txt': 'text/plain',
    '.ts': 'text/plain'
};

http.createServer((req, res) => {
    // Standard CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        return res.end();
    }

    // --- LIVE RELOAD ENDPOINT ---
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

    // --- API: GET FILES LIST ---
    if (req.url === '/api/files' && req.method === 'GET') {
        try {
            const fileList = fs.readdirSync(ROOT_DIR).filter(f => !f.startsWith('.') && f !== 'node_modules');
            headers['Content-Type'] = 'application/json';
            res.writeHead(200, headers);
            res.end(JSON.stringify(fileList));
        } catch (e) {
            res.writeHead(500, headers);
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // --- API: GET SINGLE FILE CONTENT ---
    if (req.url.startsWith('/api/file?') && req.method === 'GET') {
        const filePath = new URLSearchParams(req.url.split('?')[1]).get('path');
        if (!filePath) {
            res.writeHead(400, headers);
            res.end('No path provided');
            return;
        }
        // Sanitize path to prevent directory traversal
        const safePath = path.join(__dirname, ROOT_DIR, path.normalize(filePath).replace(/^(\.\.[\/\\])+/, ''));
        
        fs.readFile(safePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, headers);
                res.end('Not Found');
            } else {
                headers['Content-Type'] = 'text/plain';
                res.writeHead(200, headers);
                res.end(data);
            }
        });
        return;
    }

    // --- API: SAVE/WRITE FILE (Titan Sync Target) ---
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { filePath, content } = JSON.parse(body);
                // Sanitize path
                const safePath = path.join(__dirname, ROOT_DIR, path.normalize(filePath).replace(/^(\.\.[\/\\])+/, ''));
                
                fs.writeFile(safePath, content, err => {
                    if (err) {
                        res.writeHead(500, headers);
                        res.end('Write Error');
                    } else {
                        res.writeHead(200, headers);
                        res.end('Saved');
                        console.log('[SAVED] ' + filePath);
                    }
                });
            } catch (e) {
                res.writeHead(400, headers);
                res.end('Invalid JSON');
            }
        });
        return;
    }

    // --- STATIC FILE SERVER (Fallback) ---
    let resourcePath = req.url === '/' ? 'index.html' : req.url.split('?')[0];
    const fullPath = path.join(__dirname, ROOT_DIR, resourcePath);
    const ext = path.extname(fullPath);

    if (MIME_TYPES[ext]) headers['Content-Type'] = MIME_TYPES[ext];
    else headers['Content-Type'] = 'text/plain';

    fs.readFile(fullPath, (err, content) => {
        if (err) {
            res.writeHead(404, headers);
            res.end('404 Not Found');
        } else {
            // Inject Live Reload script into HTML files
            if (ext === '.html') {
                content += '<script>new EventSource("/__live").onmessage=()=>location.reload()</script>';
            }
            res.writeHead(200, headers);
            res.end(content);
        }
    });

}).listen(PORT, () => console.log(`\n--- BRIDGE ONLINE ---\nEditor: http://localhost:${PORT}`));
