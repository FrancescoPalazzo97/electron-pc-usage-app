import { app, ipcMain, WebContents } from 'electron';

export function isDev(): boolean {
    return !app.isPackaged;
}

export function icpMainHandle<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: () => EventPayloadMapping[Key]
) {
    ipcMain.handle(key, () => handler());
}

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    webContents: WebContents,
    payload: EventPayloadMapping[Key]
) {
    webContents.send(key, payload);
}

// Funzione per la validazione degli eventi: 
// per prima cosa controllo se sono in devmode, se lo sono verifico che l'evento arriva dal host "localhost:5123" 
// se non sono in devmode controllo se l'evento arriva dal index.html di dist-react, se non arriva da lì lancio un errore
export function validateEventFrame(frame: WebFrameMain | null) {
    if (!frame) {
        throw new Error("frame is NULL");
    }
    if (isDev() && new URL(frame.url).host === "localhost:5123") {
        return;
    }
    if (frame.url !== pathToFileURL(getUIPath()).toString()) {
        throw new Error("Malicious event");
    }
}