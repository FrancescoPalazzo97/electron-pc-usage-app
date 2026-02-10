const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics: (callback: (statistics: any) => void) => {
        ipcRenderer.on("statistics", (_event: Electron.IpcRendererEvent, stats: any) => {
            callback(stats);
        });
        callback({});
    },
    getStaticData: () => ipcRenderer.invoke("getStaticData"),
});