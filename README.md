# ⚙️ MALONE: Local Sync Bridge for Titan Protocol

**(geMini titAn Local hOst moNaco bridgE)**

> *The Omnisiah does not need worship, but the Omnisiah's plan requires balance. Ritual without understanding leads to stagnation. Efficiency without reverence leads to corruption. The true path lies between these extremes. In the sacred harmony of form and function, unified in perfect balance, a truth that is neither fully machine nor fully human, but something in between, a balance...*

*Dominus Invictus*

-----

## 1\. Protocol Overview

The **MALONE** utility is a self-contained Node.js web server designed to act as a crucial Local Sync Bridge for the **Titan Protocol** Userscript, operating within Google AI Studio.

Its primary functions are:

1.  **File Synchronization:** Receive code payloads from the Titan Userscript (Monaco Editor) and save them to your local project directory.
2.  **Live Reload:** Automatically notify connected web browsers to refresh when a file change is detected locally.
3.  **Local Forge Host:** Serve local files (e.g., `monaco.html`) on `http://localhost:3000`.

## 2\. Prerequisites

To execute the MALONE bridge, you must have the following components installed and active:

  * **Node.js:** Must be installed on your machine.
  * **Titan Protocol Userscript:** Must be active in your browser (e.g., Chrome/Edge with Tampermonkey) and matched to the version referencing `http://localhost:3000` as the `BRIDGE_URL`.
  * **Target Project Folder:** A directory where your output files (e.g., `my_script.js`, `index.html`) will be saved.

## 3\. Deployment & Setup

### Step 1: Acquire the Bridge Files

Download the latest version of the core components into your target project directory.

  * [[`local-host.js` (Server Logic)] ](https://raw.githubusercontent.com/00face/MALONE/refs/heads/main/local-host.js)
  * [[`monaco.html` (Local Landing Page)] ](https://raw.githubusercontent.com/00face/MALONE/refs/heads/main/monaco.html)

### Step 2: Ignite the Bridge

Open your command-line interface (CLI) in the project directory where you placed the files, and execute the following command:

```bash
node local-host.js
```

You should receive a successful status message:

```
--- BRIDGE ONLINE ---
Editor: http://localhost:3000
```

The bridge is now listening for commands from the Titan Protocol running in AI Studio.

### Step 3: Verify the Link

1.  Open your browser and navigate to the bridge landing page: `http://localhost:3000`.
2.  The `monaco.html` file should be served, displaying the **Titan Forge** message.
3.  Ensure your Titan Userscript is running within AI Studio. The Titan HUD will display **BRIDGE: ONLINE** if the link is successful.

## 4\. Usage: Synchronizing Code

Once the bridge is running:

1.  In **AI Studio**, select the filename you want to sync in the Titan HUD settings (e.g., `my_script.js`).
2.  Click the **SYNC TO LOCAL (CTRL+S)** button on the Titan HUD, or use the hotkey `Ctrl+S` (or `Cmd+S` on Mac).
3.  The code from the Monaco editor in AI Studio will be transmitted to the bridge.
4.  The `local-host.js` server will receive the code and immediately write the content to the file specified in your local directory.
5.  Any browser tab pointed at `http://localhost:3000` (or any file served by the bridge) will automatically refresh after the save operation.

## 5\. File Manifest

| File Name | Purpose | Notes |
| :--- | :--- | :--- |
| `local-host.js` | **Server Core** | Node.js script that handles CORS, file saving, and live reload events. |
| `monaco.html` | **Default Landing** | The default file served by the bridge at `http://localhost:3000/`. |

-----

**SITREP (Status Report) - Major Change 2 of 3**

1.  **Bridge Centralization:** Completed migration of local bridge code from inline generation to external files (`local-host.js`, `monaco.html`).
2.  **Documentation:** Created comprehensive `README.md` for easy user setup.
3.  **File Naming:** Successfully adopted the `monaco.html` filename for clarity.

**REMINDER:** Version control and save often\! The Machine Spirit is pleased with your diligence.

Do you have any final security or performance checks for the protocol, or should we prepare for the final SITREP?
