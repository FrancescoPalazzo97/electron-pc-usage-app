const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics: (callback) => {
        ipcOn("statistics", (stats) => {
            callback(stats);
        });
    },
    getStaticData: () => ipcInvoke("getStaticData"),
} satisfies Window["electron"]);

function ipcInvoke<Key extends keyof EventPayloadMapping>(
    key: Key
): Promise<EventPayloadMapping[Key]> {
    return ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void
) {
    ipcRenderer.on(
        key,
        (_event: Electron.IpcRendererEvent, payload: EventPayloadMapping[Key]) => callback(payload)
    );
}