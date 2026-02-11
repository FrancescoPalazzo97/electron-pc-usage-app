import { app, BrowserWindow, Tray } from "electron";
import { icpMainHandle, isDev } from "./utill.js";
import { getStaticData, pollResources } from "./resourceManager.js";
import { getAssetPath, getPreloadPath, getUIPath } from "./pathResolver.js";
import path from "path";

app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath()
        }
    });
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    } else {
        mainWindow.loadFile(getUIPath());
    }

    pollResources(mainWindow);

    icpMainHandle("getStaticData", () => {
        return getStaticData();
    });

    new Tray(path.join(getAssetPath(), "logo-react@5x.png"));
});