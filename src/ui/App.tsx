import { useMemo, useState } from 'react'
import reactLogo from '../assets/react.svg'
import './App.css'
import { useStatistics } from './hooks/useStatistics';
import { Chart } from './components/Chart';

function App() {
  const [count, setCount] = useState(0);
  const statistics = useStatistics(10);

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

  return (
    <>
      <div>
        <div style={{ height: 120 }}>
          <Chart data={cpuUsage} maxDataPoints={10} />
        </div>
        <div style={{ height: 120 }}>
          <Chart data={ramUsage} maxDataPoints={10} />
        </div>
        <div style={{ height: 120 }}>
          <Chart data={storageUsage} maxDataPoints={10} />
        </div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React 4</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
