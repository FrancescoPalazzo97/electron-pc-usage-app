import { app } from "electron";
import path from "path";
import { isDev } from "./utill.js";

export function getPreloadPath() {
    return path.join(
        app.getAppPath(),
        isDev() ? "." : "..",
        "/dist-electron/preload.cjs"
    );
}