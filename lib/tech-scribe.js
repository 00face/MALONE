// lib/tech-scribe.js
function detectFramework(files) {
    // Basic heuristics to identify the machine spirit
    const hasFile = (name) => files.some(f => f.path.includes(name));
    const hasContent = (str) => files.some(f => f.content.includes(str));

    if (hasFile('angular.json')) return 'ANGULAR';
    if (hasContent('react') || hasFile('App.tsx') || hasFile('App.jsx')) return 'REACT';
    return 'VANILLA'; // Fallback
}

function generatePackageJson(framework, projectName) {
    const base = {
        name: projectName.toLowerCase(),
        version: "0.1.0",
        private: true,
        scripts: { "dev": "vite", "build": "vite build", "preview": "vite preview" },
        dependencies: {},
        devDependencies: { "vite": "^4.4.0" }
    };

    if (framework === 'REACT') {
        base.dependencies = { "react": "^18.2.0", "react-dom": "^18.2.0" };
        base.devDependencies["@types/react"] = "^18.2.0";
        base.devDependencies["@types/react-dom"] = "^18.2.0";
        base.devDependencies["@vitejs/plugin-react"] = "^4.0.0";
    } else if (framework === 'ANGULAR') {
        // Angular requires a more complex CLI setup usually, but we provide a minimal shim
        base.dependencies = { "@angular/core": "^16.0.0", "@angular/platform-browser": "^16.0.0" };
    }

    return JSON.stringify(base, null, 2);
}

function generateViteConfig(framework, port) {
    if (framework === 'REACT') {
        return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: ${port} }
});`;
    }
    // Default config
    return `import { defineConfig } from 'vite';
export default defineConfig({
  server: { port: ${port} }
});`;
}

module.exports = { detectFramework, generatePackageJson, generateViteConfig };
