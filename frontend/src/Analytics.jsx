import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const API = "http://127.0.0.1:8000/api";
const domains = ["Overall", "Engineering", "Management", "Research"];
const years = [2025, 2024, 2023];

function Analytics() {
  const [domain, setDomain] = useState("Overall");
  const [topYear, setTopYear] = useState(2025);

  const [newInst, setNewInst] = useState([]);
  const [rankChange, setRankChange] = useState([]);
  const [consistent, setConsistent] = useState([]);
  const [topFive, setTopFive] = useState([]);

  const [graphData, setGraphData] = useState([]);
  const [graphYear, setGraphYear] = useState(2025);
  const [metric, setMetric] = useState("rpc");

  useEffect(() => {
    fetch(`${API}/new?domain=${domain.toLowerCase()}`).then(res => res.json()).then(setNewInst);
    fetch(`${API}/rank-change?domain=${domain.toLowerCase()}`).then(res => res.json()).then(setRankChange);
    fetch(`${API}/consistent?domain=${domain.toLowerCase()}`).then(res => res.json()).then(setConsistent);
  }, [domain]);

  useEffect(() => {
    fetch(`${API}/top-five?domain=${domain.toLowerCase()}&year=${topYear}`)
      .then(res => res.json())
      .then(setTopFive);
  }, [domain, topYear]);

  useEffect(() => {
    fetch(`${API}/graph?domain=${domain.toLowerCase()}&year=${graphYear}`)
      .then(res => res.json())
      .then(setGraphData);
  }, [domain, graphYear]);

  const growth = rankChange.filter(i => i.change > 0).slice(0, 5);
  const drop = rankChange.filter(i => i.change < 0).slice(0, 5);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", background: "#f9f9f9",textAlign:"left" }}>
      
      <h1 style={{ color: "#2c3e50" }}>NIRF Dashboard</h1>

      <select value={domain} onChange={(e) => setDomain(e.target.value)}>
        {domains.map(d => <option key={d}>{d}</option>)}
      </select>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px",textAlign: "left" }}>

        <div>
          <h2 style={{ marginBottom: "10px" }}>Top 5</h2>
          {topFive.map((i, idx) => (
            <div key={idx}>#{i.rank} - {i.name}</div>
          ))}
        </div>

        <div>
          <h2 style={{ marginBottom: "10px" }}>New</h2>
          {newInst.map((i, idx) => <div key={idx}>{i}</div>)}
        </div>

        <div>
          <h2 style={{ marginBottom: "10px" }}>Growth</h2>
          {growth.map((i, idx) => (
            <div key={idx}>{i.name}: {i.old_rank} → {i.new_rank}</div>
          ))}
        </div>

        <div>
          <h2 style={{ marginBottom: "10px" }}>Drop</h2>
          {drop.map((i, idx) => (
            <div key={idx}>{i.name}: {i.old_rank} → {i.new_rank}</div>
          ))}
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <h2 style={{ marginBottom: "10px" }}>Consistent</h2>
          {consistent.map((i, idx) => (
            <span key={idx} style={{ margin: "5px" }}>
              {i.name} ({i.appearances})
            </span>
          ))}
        </div>
      </div>
      

      <h2 style={{ marginTop: "40px" }}>Graph</h2>

      <select onChange={(e) => setMetric(e.target.value)}>
        <option value="rpc">RPC</option>
        <option value="tlr">TLR</option>
        <option value="pr">PR</option>
      </select>

      <select onChange={(e) => setGraphYear(Number(e.target.value))}>
        {years.map(y => <option key={y}>{y}</option>)}
      </select>

      <LineChart width={700} height={350} data={graphData}>
        <XAxis dataKey="rank" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={metric} stroke="#8884d8" />
      </LineChart>

    </div>
  );
}

export default Analytics;