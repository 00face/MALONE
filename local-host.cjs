const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = './'; // Files will be saved relative to where you run this script

console.log(`\n--- MALONE BRIDGE v2.1 (Project Mirror Capable) ---`);
console.log(`[DIR] Target Forge: ${path.resolve(ROOT_DIR)}`);

// MIME Types for file serving
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jsx': 'text/plain', // Serve code as text so it doesn't execute/error in browser
    '.ts': 'text/plain',
    '.tsx': 'text/plain',
    '.md': 'text/plain'
};

const clients = [];

http.createServer((req, res) => {
    // 1. CORS Headers (Allow Titan to talk to us)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // 2. Handle Pre-flight checks
    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        return res.end();
    }

    // 3. Live Reload Subscription
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

    // 4. SAVE ENDPOINT (The Core Logic)
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { filePath, content } = JSON.parse(body);
                
                // Sanitize Path: Remove leading slashes/dots to keep inside ROOT_DIR
                const cleanPath = filePath.replace(/^[\/\\]/, '').replace(/^(\.\.[\/\\])+/, '');
                const fullPath = path.join(__dirname, ROOT_DIR, cleanPath);
                const dirName = path.dirname(fullPath);

                // A. Recursive Directory Creation (The Magic)
                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, { recursive: true });
                    console.log(`[MKDIR] Constructed Sector: ${dirName}`);
                }

                // B. Write File
                fs.writeFile(fullPath, content, err => {
                    if (err) {
                        console.error(`[ERR] Write failed: ${err.message}`);
                        res.writeHead(500, headers);
                        res.end('Write Error');
                    } else {
                        console.log(`[SAVED] ${cleanPath}`);
                        res.writeHead(200, headers);
                        res.end('Saved');
                        
                        // Notify Live Reload Clients
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

    // 5. STATIC FILE SERVER (For "Check Existence" and Status Page)
    // If URL is root '/', serve monaco.html. Otherwise serve the requested file.
    let resourcePath = req.url === '/' ? 'monaco.html' : req.url;
    // Remove query params if any
    resourcePath = resourcePath.split('?')[0];
    
    const fullPath = path.join(__dirname, ROOT_DIR, resourcePath);
    const ext = path.extname(fullPath);

    if (fs.existsSync(fullPath)) {
        // If it's a directory, try to serve index.html or list files (simplified here to 404)
        if (fs.statSync(fullPath).isDirectory()) {
             res.writeHead(404, headers);
             return res.end('Directory listing not supported');
        }

        fs.readFile(fullPath, (err, content) => {
            if (err) {
                res.writeHead(500, headers);
                res.end('Read Error');
            } else {
                res.writeHead(200, { ...headers, 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
                res.end(content);
            }
        });
    } else {
        res.writeHead(404, headers);
        res.end('Not Found');
    }

}).listen(PORT, () => {
    console.log(`[ONLINE] Bridge Active on http://localhost:${PORT}`);
    console.log(`[NOTE]  Do not use this port to Preview your React App.`);
    console.log(`[NOTE]  Use 'npm start' or 'vite' on a different port for previewing.`);
});
