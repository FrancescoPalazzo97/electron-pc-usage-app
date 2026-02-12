import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { useStatistics } from './hooks/useStatistics';
import { Chart } from './components/Chart';
import { Header } from './components/Header';
import { SelectOption } from './components/SelectOption';
import { useStaticData } from './hooks/useStaticData';

function App() {
  const staticData = useStaticData();
  const statistics = useStatistics(10);
  const [activeView, setActiveView] = useState<View>("CPU");

  const cpuUsage = useMemo(
    () => statistics.map(stat => stat.cpuUsage),
    [statistics]
  );

  const ramUsage = useMemo(
    () => statistics.map(stat => stat.ramUsage),
    [statistics]
  );

  const storageUsage = useMemo(
    () => statistics.map(stat => stat.storageUsage),
    [statistics]
  );

  const gpuUsage = useMemo(
    () => statistics.map(stat => stat.gpuUsage),
    [statistics]
  );

  const activeUsages = useMemo(() => {
    switch (activeView) {
      case "CPU":
        return cpuUsage;
      case "RAM":
        return ramUsage;
      case "STORAGE":
        return storageUsage;
      case "GPU":
        return gpuUsage;
    }
  }, [activeView, cpuUsage, ramUsage, storageUsage, gpuUsage]);

  useEffect(() => {
    window.electron.subscribeChangeView((view) => setActiveView(view))
  }, []);

  return (
    <>
      <div>

        <Header />

        <div className='main'>
          <div>
            <SelectOption
              title="CPU"
              subTitle={staticData?.cpuModel ?? ''}
              data={cpuUsage}
              onclick={() => setActiveView("CPU")}
              view="CPU"
            />
            <SelectOption
              title="RAM"
              subTitle={`${staticData?.totalMemoryGB.toString() ?? ''} GB`}
              data={ramUsage}
              onclick={() => setActiveView("RAM")}
              view="RAM"
            />
            <SelectOption
              title="STORAGE"
              subTitle={`${staticData?.totalStorage.toString() ?? ''} GB`}
              data={storageUsage}
              onclick={() => setActiveView("STORAGE")}
              view="STORAGE"
            />
            <SelectOption
              title="GPU"
              subTitle={`${staticData?.gpuModel ?? ''} — ${staticData?.totalVramGB ?? ''} GB`}
              data={gpuUsage}
              onclick={() => setActiveView("GPU")}
              view="GPU"
            />
          </div>
          <div className='mainGrid'>
            <Chart
              data={activeUsages}
              maxDataPoints={10}
              selectedView={activeView}
            />
          </div>
        </div>
        {/* <div style={{ height: 120 }}>
          <Chart data={ramUsage} maxDataPoints={10} />
        </div>
        <div style={{ height: 120 }}>
          <Chart data={storageUsage} maxDataPoints={10} />
        </div> */}
      </div>
    </>
  )
}

export default App
