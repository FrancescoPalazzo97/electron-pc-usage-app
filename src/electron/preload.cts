const electron = require('electron') as typeof import('electron');

electron.contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics: (callback) => ipcOn(
        "statistics",
        (stats) => callback(stats)
    ),

    getStaticData: () => ipcInvoke("getStaticData"),

    subscribeChangeView: (callback) => ipcOn(
        "changeView",
        (view) => callback(view)
    )
} satisfies Window["electron"]);

function ipcInvoke<Key extends keyof EventPayloadMapping>(
    key: Key
): Promise<EventPayloadMapping[Key]> {
    return electron.ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void
) {
    const cb = (_event: Electron.IpcRendererEvent, payload: any) => callback(payload)
    electron.ipcRenderer.on(key, cb);
    return () => electron.ipcRenderer.off(key, cb);
}