import osUtils from "os-utils";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import { BrowserWindow } from "electron";
import { ipcWebContentsSend } from "./utill.js";

const POLLING_INTERVAL = 500;
const GPU_POLLING_INTERVAL = 1000;

let cachedGpuUsage = 0;

export function pollResources(mainWindow: BrowserWindow) {
    const gpuInterval = setInterval(async () => {
        if (mainWindow.isDestroyed()) return;
        cachedGpuUsage = await getGpuUsage();
    }, GPU_POLLING_INTERVAL);

    const mainInterval = setInterval(async () => {
        if (mainWindow.isDestroyed()) return;
        const cpuUsage = await getCpuUsage();
        const ramUsage = getRamUsage();
        const storageData = getStorageData();
        const data = { cpuUsage, ramUsage, storageUsage: storageData.usage, gpuUsage: cachedGpuUsage };
        ipcWebContentsSend("statistics", mainWindow.webContents, data);
    }, POLLING_INTERVAL);

    mainWindow.on("closed", () => {
        clearInterval(mainInterval);
        clearInterval(gpuInterval);
    });
}

export async function getStaticData(): Promise<StaticData> {
    const totalStorage = getStorageData().total;
    const cpuModel = os.cpus()[0].model;
    const totalMemoryGB = Math.floor(osUtils.totalmem() / 1024);

    const gpuInfo = await getNvidiaSmiOutput(
        "name,memory.total",
        "gpu_name,memory.total [MiB]"
    );
    const parts = gpuInfo.split(", ");
    const gpuModel = parts[0] ?? "Unknown";
    const vramMiB = parseInt(parts[1] ?? "0", 10);
    const totalVramGB = Math.round(vramMiB / 1024);

    return {
        totalStorage,
        cpuModel,
        totalMemoryGB,
        gpuModel,
        totalVramGB,
    }
}

function getCpuUsage(): Promise<number> {
    return new Promise(resolve => {
        osUtils.cpuUsage(resolve);
    });
}

function getRamUsage() {
    return 1 - osUtils.freememPercentage();
}

async function getGpuUsage(): Promise<number> {
    const output = await getNvidiaSmiOutput("utilization.gpu", "utilization.gpu [%]");
    const value = parseInt(output, 10);
    return isNaN(value) ? 0 : value / 100;
}

function getNvidiaSmiOutput(
    queryFields: string,
    _expectedHeader: string
): Promise<string> {
    return new Promise((resolve) => {
        execFile(
            "nvidia-smi",
            ["--query-gpu=" + queryFields, "--format=csv,noheader,nounits"],
            { timeout: 2000 },
            (error, stdout) => {
                if (error) {
                    resolve("");
                    return;
                }
                resolve(stdout.trim());
            }
        );
    });
}

function getStorageData() {
    const stats = fs.statfsSync(process.platform === "win32" ? "C://" : "/");
    const total = stats.bsize * stats.blocks;
    const free = stats.bsize * stats.bfree;

    return {
        total: Math.floor(total / 1_000_000_000),
        usage: 1 - free / total
    }
}
