import { useMemo } from "react";
import { BaseChart } from "./BaseChart";

type ChartProps = {
    data: number[];
    maxDataPoints: number;
    selectedView: 'CPU' | 'RAM' | 'STORAGE';
}

const COLOR_MAP = {
    CPU: {
        stroke: '#5DD4EE',
        fill: '#0A4D5C',
    },
    RAM: {
        stroke: '#E99311',
        fill: '#5F3C07',
    },
    STORAGE: {
        stroke: '#1ACF4D',
        fill: '#0B5B22',
    },
}

export const Chart = ({ data, maxDataPoints, selectedView }: ChartProps) => {
    const color = useMemo(() => COLOR_MAP[selectedView], [selectedView]);
    const preparedData = useMemo(() => {
        const points = data.map(point => ({ value: point * 100 }));
        return [
            ...points,
            ...Array.from({ length: maxDataPoints - points.length })
                .map(() => ({ value: undefined }))
        ];
    }, [data, maxDataPoints]);

    return <BaseChart
        data={preparedData}
        fill={color.fill}
        stroke={color.stroke}
    />;
};
