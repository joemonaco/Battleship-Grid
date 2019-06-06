import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";

let win: BrowserWindow;

app.on("ready", createWindow);

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  win = new BrowserWindow({ width: 1920, height: 1080 });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../../dist/CanvasGrid/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  win.webContents.openDevTools();

  win.webContents.on("did-finish-load", function() {
    win.webContents.send("socket_address", "174.138.111.227:8000");
    win.webContents.setZoomFactor(1);
    win.webContents.setVisualZoomLevelLimits(1, 1);
    win.webContents.setLayoutZoomLevelLimits(0, 0);
  });

  win.on("closed", () => {
    win = null;
  });
}
