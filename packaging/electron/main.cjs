const { app, BrowserWindow, shell } = require("electron");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

function createServer(root) {
  return http.createServer((req, res) => {
    const raw = decodeURIComponent((req.url || "/").split("?")[0]);
    let rel = raw === "/" ? "/index.html" : raw;
    let file = path.join(root, rel);
    if (!file.startsWith(root)) {
      res.statusCode = 403;
      res.end();
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(root, "index.html");
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end("not found");
        return;
      }
      res.setHeader("content-type", MIME[path.extname(file)] || "application/octet-stream");
      res.end(data);
    });
  });
}

app.commandLine.appendSwitch("disable-gpu-sandbox");

app.whenReady().then(() => {
  const www = path.join(__dirname, "www");
  const server = createServer(www);
  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    const win = new BrowserWindow({
      width: 1280,
      height: 800,
      backgroundColor: "#070b12",
      autoHideMenuBar: true,
      title: "Skybound: Riftkeeper v1.0.0",
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    win.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url);
      return { action: "deny" };
    });
    void win.loadURL(`http://127.0.0.1:${port}/`);
  });
});

app.on("window-all-closed", () => app.quit());
