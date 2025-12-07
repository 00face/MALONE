/*
 * MALONE BRIDGE SERVER v3.0
 * acts as the local file system interface for Titan Protocol.
 * * Usage:
 * 1. Place in your project root.
 * 2. Run: node local-host.cjs
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { findAvailablePort } = require('./lib/port-authority');
const { detectFramework, generatePackageJson, generateViteConfig } = require('./lib/tech-scribe');

const app = express();
const PORT = 3000;
const PROJECTS_DIR = path.join(__dirname, 'projects');

// Registry of active deployments
// { uid: { port: number, process: ChildProcess, status: string, name: string } }
const deployments = {};

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public')); // Serve Mission Control UI

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR);

// --- API: DEPLOY PROJECT ---
app.post('/api/deploy', async (req, res) => {
    try {
        const { url, files } = req.body;
        
        // 1. Extract UID from URL (e.g., .../drive/1_VYk_OFdxCPGs...)
        const uidMatch = url.match(/drive\/([a-zA-Z0-9_-]+)/);
        const uid = uidMatch ? uidMatch[1] : 'unknown_' + Date.now();
        const projectPath = path.join(PROJECTS_DIR, uid);

        console.log(`[MAGOS] Incoming Project: ${uid}`);

        // 2. Create Project Sector
        if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath, { recursive: true });

        // 3. Write Files
        files.forEach(f => {
            // Sanitize and write
            const safePath = f.path.replace(/^[\/\\]/, '');
            const fullPath = path.join(projectPath, safePath);
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(fullPath, f.content);
        });

        // 4. Fabricate Configuration if missing
        const framework = detectFramework(files);
        if (!fs.existsSync(path.join(projectPath, 'package.json'))) {
            console.log(`[MAGOS] Fabricating ${framework} chassis...`);
            fs.writeFileSync(path.join(projectPath, 'package.json'), generatePackageJson(framework, uid));
        }

        // 5. Assign Port & Config
        if (!deployments[uid]) {
            const port = await findAvailablePort(3001);
            deployments[uid] = { port, status: 'initializing', name: uid };
            
            // Create vite config with assigned port
            if (!fs.existsSync(path.join(projectPath, 'vite.config.js'))) {
                fs.writeFileSync(path.join(projectPath, 'vite.config.js'), generateViteConfig(framework, port));
            }

            // 6. Ignite Engine (npm install && npm run dev)
            console.log(`[MAGOS] Igniting engines on Port ${port}...`);
            
            // Install dependencies
            const install = spawn('npm', ['install'], { cwd: projectPath, shell: true });
            
            install.on('close', (code) => {
                if (code === 0) {
                    console.log(`[MAGOS] Dependencies installed. Launching Dev Server...`);
                    // Run Dev Server
                    const devServer = spawn('npm', ['run', 'dev'], { cwd: projectPath, shell: true });
                    deployments[uid].process = devServer;
                    deployments[uid].status = 'online';
                    
                    devServer.stdout.on('data', (data) => console.log(`[${uid}] ${data}`));
                } else {
                    deployments[uid].status = 'failed_install';
                }
            });
        }

        res.json({ success: true, uid, port: deployments[uid].port, status: deployments[uid].status });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// --- API: LIST PROJECTS ---
app.get('/api/projects', (req, res) => {
    // Return list without circular process objects
    const list = Object.keys(deployments).map(k => ({
        uid: k,
        port: deployments[k].port,
        status: deployments[k].status
    }));
    res.json(list);
});

app.listen(PORT, () => console.log(`[MISSION CONTROL] Active at http://localhost:${PORT}`));
