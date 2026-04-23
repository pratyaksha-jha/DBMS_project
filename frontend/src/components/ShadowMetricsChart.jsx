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

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const API_BASE = "http://127.0.0.1:8000";

const ShadowMetricsChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/shadow_metrics`)
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((err) => console.error(err));
  }, []);

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
          label: "IIT Hyderabad",
          data: data.metrics.map((m) => Number(((m.hyderabad / m.max) * 100).toFixed(2))),
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
                context.dataset.label === "IIT Guwahati" ? metric.guwahati : metric.hyderabad;
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
        Shadow plot: IIT Guwahati vs IIT Hyderabad
      </h2>
      <p className="text-sm text-gray-300 mb-4">
        Parameter-wise comparison across all NIRF components, normalized by each parameter maximum.
      </p>
      <div className="h-[360px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ShadowMetricsChart;