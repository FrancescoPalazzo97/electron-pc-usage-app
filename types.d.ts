type Statistics = {
    cpuUsage: number;
    ramUsage: number;
    storageUsage: number;
    gpuUsage: number;
};

type StaticData = {
    totalStorage: number;
    cpuModel: string;
    totalMemoryGB: number;
    gpuModel: string;
    totalVramGB: number;
};

type View = "CPU" | "RAM" | "STORAGE" | "GPU";

type FrameWindowAction = "CLOSE" | "MAXIMIZE" | "MINIMIZE";

type EventPayloadMapping = {
    statistics: Statistics;
    getStaticData: StaticData;
    changeView: View;
    sendFrameAction: FrameWindowAction;
};

type UnsubscribeFunction = () => void;

interface Window {
    electron: {
        subscribeStatistics: (callback: (statistics: Statistics) => void) => UnsubscribeFunction;
        getStaticData: () => Promise<StaticData>;
        subscribeChangeView: (callback: (view: View) => void) => UnsubscribeFunction;
        sendFrameAction: (payload: FrameWindowAction) => void;
    }
};