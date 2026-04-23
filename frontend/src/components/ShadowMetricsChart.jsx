import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
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
    () => (data?.metrics || []).map((m) => `${m.domain}-${m.id}`),
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
          backgroundColor: "rgba(229, 57, 53, 0.1)",
          borderColor: "#e53935",
          pointBackgroundColor: "#e53935",
          borderWidth: 3,
          tension: 0.25,
          spanGaps: true,
        },
        {
          label: "IIT Hyderabad",
          data: data.metrics.map((m) => Number(((m.hyderabad / m.max) * 100).toFixed(2))),
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          borderColor: "#2196F3",
          pointBackgroundColor: "#2196F3",
          borderWidth: 2,
          borderDash: [5, 4],
          tension: 0.25,
          spanGaps: true,
        },
      ],
    }
        : null,
    [data, labels]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#d1d5db", usePointStyle: true },
        },
        tooltip: {
          callbacks: {
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
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: "Score (% of parameter maximum)", color: "#d1d5db" },
          ticks: { color: "#d1d5db" },
          grid: { color: "rgba(255,255,255,0.1)" },
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ShadowMetricsChart;