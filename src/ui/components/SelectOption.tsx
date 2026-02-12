import { Chart } from "./Chart";

type SelectOptionProps = {
    title: 'CPU' | 'RAM' | 'STORAGE';
    subTitle: string;
    data: number[];
    onclick: () => void;
    view: View
}

export const SelectOption = ({ title, subTitle, data, onclick, view }: SelectOptionProps) => {
    return (
        <button onClick={onclick} className="selectOption">
            <div className="selectOptionTitle">
                <div>{title}</div>
                <div>{subTitle}</div>
            </div>
            <div className="selectOptionChart">
                <Chart
                    data={data}
                    maxDataPoints={10}
                    selectedView={view}
                />
            </div>
        </button>
    );
};
