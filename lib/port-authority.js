// lib/port-authority.js
const net = require('net');

async function findAvailablePort(startPort) {
    const isPortAvailable = (port) => {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.once('error', () => resolve(false));
            server.once('listening', () => {
                server.close();
                resolve(true);
            });
            server.listen(port);
        });
    };

    let port = startPort;
    while (!(await isPortAvailable(port))) {
        port++;
        if (port > 65535) throw new Error("No open ports found in the manufactorum.");
    }
    return port;
}

module.exports = { findAvailablePort };
