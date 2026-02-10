import { useEffect, useState } from "react";

export function useStatistics(dataPointCount: number): Statistics[] {
    const [value, setValue] = useState<Statistics[]>([]);

    useEffect(() => {
        const unsub = window.electron.subscribeStatistics(stats => {
            setValue(prev => {
                const newValue = [...prev, stats];

                if (newValue.length > dataPointCount) {
                    newValue.shift();
                }

                return newValue;
            });
        });
        return unsub;
    }, []);

    return value;
}