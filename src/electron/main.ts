import { app, BrowserWindow } from "electron";
import { icpMainHandle, isDev } from "./utill.js";
import { getStaticData, pollResources } from "./resourceManager.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";

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
});