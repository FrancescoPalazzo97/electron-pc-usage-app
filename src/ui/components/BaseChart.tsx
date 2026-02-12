import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

type BaseChartProps = {
    data: { value: number | undefined }[];
    fill: string;
    stroke: string;
}

export const BaseChart = ({ data, fill, stroke }: BaseChartProps) => {
    return (
        <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data}>
                <CartesianGrid stroke="#333" strokeDasharray="5 5" fill="#1C1C1C" />
                <Area
                    fillOpacity={0.3}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={3}
                    type="monotone"
                    dataKey="value"
                    isAnimationActive={false}
                />
                <XAxis stroke="trasparent" height={0} />
                <YAxis domain={[0, 100]} stroke="trasparent" width={0} />
            </AreaChart>
        </ResponsiveContainer>
    );
};
