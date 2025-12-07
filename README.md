# ⚙️ MALONE: Mission Control Bridge for Titan Protocol

(ge**M**ini tit**A**n **L**ocal h**O**st mo**N**aco bridg**E**)

> *The Omnissiah does not need worship, but the Omnissiah's plan requires balance. Ritual without understanding leads to stagnation. Efficiency without reverence leads to corruption. The true path lies between these extremes. In the sacred harmony of form and function, unified in perfect balance, a truth that is neither fully machine nor fully human, but something in between, a balance...*
>
> — *Dominus Invictus*

-----

## 1\. Protocol Overview

**MALONE v3.0** is no longer a simple file transport. It is a local **Mission Control Orchestrator** designed to interface with the **Titan Protocol** Userscript.

It transforms your local machine into a Multi-Tenant Forge, capable of:

1.  **Multi-Project Mirroring:** Simultaneously host multiple projects from AI Studio, organizing them by unique Project IDs.
2.  **Auto-Fabrication:** Automatically detects frameworks (React, Angular), creates missing config files (`package.json`, `vite.config.js`), and installs dependencies.
3.  **Port Authority:** Dynamically assigns unique ports (3001, 3002, etc.) to each project to prevent conflicts.
4.  **Mission Control Dashboard:** A live UI on `localhost:3000` to monitor deployment status and launch active projects.

## 2\. Prerequisites

To execute the MALONE bridge, you must have the following components installed and active:

  * **Node.js & NPM:** Must be installed on your machine.
  * A blessed copy of the **Titan Protocol Userscript:** Version **v910.0.22+** is required to support the batch deployment payload.

## 3\. Deployment & Setup

### Step 1: Initialize the Forge

Clone this repository or download the source files into a dedicated folder. Your directory structure should look like this:

```text
/MALONE
├── local-host.cjs       (The Magos Server)
├── package.json         (Dependencies)
├── /lib
│   ├── port-authority.js
│   └── tech-scribe.js
└── /public
    └── index.html       (Mission Control Dashboard)
```

### Step 2: Initiate Dependency Install Linkages 

Open your terminal in the `MALONE` directory and execute the terminal ritual to install the required Node modules:

```bash
npm install
```

*Required Modules: `express`, `cors`, `body-parser`.*

### Step 3: Ignite the MALONE Bridge

Execute the server command:

```bash
node local-host.cjs
```

You should receive the activation signal:

```text
[MISSION CONTROL] Active at http://localhost:3000
```

## 4. Operational Litany

### Phase I: Synchronization

1.  Open **Google AI Studio** and ensure Titan Protocol is active.
2.  Open the project you wish to work on.
3.  Open the Titan HUD and click **[MIRROR PROJECT]**.
4.  Titan will package all active memory files and transmit them to MALONE.

### Phase II: Automation

MALONE will automatically:

1.  Create a directory in `/projects/{UID}`.
2.  Detect if `package.json` is missing and fabricate a generic React/Vite chassis if needed.
3.  Run `npm install` in a background process.
4.  Run `npm run dev` on the next available port (e.g., 3001).

### Phase III: Launch

1.  Open the **Mission Control Dashboard** at [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).
2.  Watch the status indicator. When it turns **ONLINE**, click the **LAUNCH** button to open your running application in a new tab.

## 5\. File Manifest

| File Path | Designation | Purpose |
| :--- | :--- | :--- |
| `local-host.cjs` | **Magos Server** | Central Express server handling routing, child processes, and API endpoints. |
| `public/index.html` | **Mission Control** | The frontend dashboard for monitoring and launching projects. |
| `lib/port-authority.js` | **Logistics** | Scans network interfaces to assign collision-free ports (3001+). |
| `lib/tech-scribe.js` | **Fabricator** | Analyzes code to generate `package.json` and config files dynamically. |
| `/projects` | **Silo** | The storage sector where downloaded projects are isolated and built. |

-----

**REMINDER:** Version control and save often. The Machine Spirit is pleased with your diligence.
