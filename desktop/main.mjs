import { app, BrowserWindow, dialog } from "electron";
import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import path from "node:path";

let nextServer;
let mainWindow;

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : undefined;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

function waitForServer(url, attempts = 40) {
  return new Promise((resolve, reject) => {
    const tryRequest = (remaining) => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) return resolve();
        if (remaining === 0) return reject(new Error(`Server returned ${response.statusCode}.`));
        setTimeout(() => tryRequest(remaining - 1), 250);
      });
      request.on("error", () => {
        if (remaining === 0) return reject(new Error("The local app server did not start."));
        setTimeout(() => tryRequest(remaining - 1), 250);
      });
      request.setTimeout(2_000, () => request.destroy());
    };
    tryRequest(attempts);
  });
}

async function startNextServer() {
  const port = await findAvailablePort();
  const appRoot = app.getAppPath();
  const nextCli = path.join(appRoot, "node_modules", "next", "dist", "bin", "next");

  nextServer = spawn(process.execPath, [nextCli, "start", "-p", String(port)], {
    cwd: appRoot,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", PORT: String(port) },
    stdio: "ignore",
    windowsHide: true,
  });

  await waitForServer(`http://127.0.0.1:${port}`);
  return `http://127.0.0.1:${port}`;
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1000,
    minHeight: 720,
    show: false,
    backgroundColor: "#020617",
    title: "AI Resume Builder",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadURL(url);
}

app.whenReady().then(async () => {
  app.setAppUserModelId("com.kaywebservice.ai-resume-builder");
  try {
    createWindow(await startNextServer());
  } catch (error) {
    await dialog.showMessageBox({
      type: "error",
      title: "AI Resume Builder could not start",
      message: "The application server could not be started.",
      detail: error instanceof Error ? error.message : String(error),
    });
    app.quit();
  }
});

app.on("window-all-closed", () => app.quit());
app.on("before-quit", () => {
  if (nextServer && !nextServer.killed) nextServer.kill();
});
