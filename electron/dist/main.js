"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var win;
electron_1.app.on("ready", createWindow);
electron_1.app.on("activate", function () {
    if (win === null) {
        createWindow();
    }
});
function createWindow() {
    win = new electron_1.BrowserWindow({ width: 1920, height: 1080 });
    win.loadURL(url.format({
        pathname: path.join(__dirname, "/../../dist/CanvasGrid/index.html"),
        protocol: "file:",
        slashes: true
    }));
    win.webContents.openDevTools();
    win.webContents.on("did-finish-load", function () {
        win.webContents.send("socket_address", "174.138.111.227:8000");
        win.webContents.setZoomFactor(1);
        win.webContents.setVisualZoomLevelLimits(1, 1);
        win.webContents.setLayoutZoomLevelLimits(0, 0);
    });
    win.on("closed", function () {
        win = null;
    });
}
//# sourceMappingURL=main.js.map