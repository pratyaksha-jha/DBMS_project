import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import SearchableSelect from "./SearchableSelect";
import { API_BASE } from "../lib/api";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const IIT_HYDERABAD_NAME = "Indian Institute of Technology Hyderabad";
const ALLOWED_DOMAINS = ["Overall", "Engineering"];

const ShadowMetricsChart = ({ onDataChange }) => {
  const [data, setData] = useState(null);
  const [domains, setDomains] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [domain, setDomain] = useState("");
  const [institute, setInstitute] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/institute_analysis/domains`)
      .then((res) => res.json())
      .then((res) => {
        const list = (res.domains || [])
          .filter((d) => ALLOWED_DOMAINS.some((allowed) => allowed.toLowerCase() === String(d).toLowerCase()))
          .sort((a, b) => a.localeCompare(b));
        setDomains(list);
        const overall = list.find((x) => /^overall$/i.test(String(x)));
        setDomain(overall || list[0] || "");
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!domain) return;
    fetch(`${API_BASE}/api/institutes?domain=${encodeURIComponent(domain)}`)
      .then((res) => res.json())
      .then((res) => {
        const list = (Array.isArray(res) ? res : []).filter(Boolean);
        setInstitutes(list);
        const defaultInstitute = list.includes(IIT_HYDERABAD_NAME) ? IIT_HYDERABAD_NAME : list[0] || "";
        setInstitute(defaultInstitute);
      })
      .catch((err) => {
        console.error(err);
        setInstitutes([]);
        setInstitute("");
      });
  }, [domain]);

  useEffect(() => {
    if (!domain || !institute) return;
    const query = new URLSearchParams({ domain, institute }).toString();
    fetch(`${API_BASE}/api/shadow_metrics?${query}`)
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((err) => console.error(err));
  }, [domain, institute]);

  useEffect(() => {
    if (typeof onDataChange === "function") {
      onDataChange(data);
    }
  }, [data, onDataChange]);

  const labels = useMemo(
    () => (data?.metrics || []).map((m) => m.id),
    [data]
  );

  const chartData = useMemo(
    () =>
      data
        ? {
      labels,
      datasets: [
        {
          label: "IIT Guwahati",
          data: data.metrics.map((m) => Number(((m.guwahati / m.max) * 100).toFixed(2))),
          backgroundColor: "rgba(227, 237, 240, 0.95)",
          borderColor: "rgb(67, 27, 177)",
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 20,
          maxBarThickness: 20,
          grouped: false,
          order: 2,
        },
        {
          label: data.peer || "Peer institute",
          data: data.metrics.map((m) => Number(((m.peer / m.max) * 100).toFixed(2))),
          backgroundColor: "rgba(59, 130, 246, 0.4)",
          borderColor: "rgba(96, 165, 250, 0.8)",
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 32,
          maxBarThickness: 32,
          grouped: false,
          order: 1,
        },
      ],
    }
        : null,
    [data, labels]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#d1d5db", usePointStyle: true },
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items?.[0]?.dataIndex ?? 0;
              const metric = data.metrics[idx];
              return `${metric.id} (${metric.domain})`;
            },
            afterLabel: (context) => {
              const metric = data.metrics[context.dataIndex];
              const rawValue =
                context.dataset.label === "IIT Guwahati" ? metric.guwahati : metric.peer;
              return `Raw: ${rawValue}/${metric.max}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Parameter", color: "#d1d5db" },
          ticks: { color: "#d1d5db" },
          grid: { color: "rgba(255,255,255,0.1)" },
          stacked: false,
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: "Score (% of parameter maximum)", color: "#d1d5db" },
          ticks: { color: "#d1d5db" },
          grid: { color: "rgba(255,255,255,0.1)" },
          stacked: false,
        },
      },
    }),
    [data]
  );

  if (!data || !chartData) return <p>Loading shadow graph...</p>;

  return (
    <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
      <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-3">
        Shadow plot: IIT Guwahati vs selected institute
      </h2>
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase text-gray-500">Domain</label>
          <SearchableSelect
            options={domains}
            value={domain}
            onChange={setDomain}
            placeholder="Select domain"
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase text-gray-500">Peer institute</label>
          <SearchableSelect
            options={institutes}
            value={institute}
            onChange={setInstitute}
            placeholder="Select institute"
          />
        </div>
      </div>
      <p className="text-sm text-gray-300 mb-4">
        Dynamic parameter comparison from para_2025, normalized by each parameter maximum.
      </p>
      <div className="h-[360px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ShadowMetricsChart;