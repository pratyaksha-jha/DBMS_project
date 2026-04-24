import React, { useEffect, useMemo, useState } from "react";
import Navbar from './Navbar';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";
import ShadowMetricsChart from "../components/ShadowMetricsChart";
import SearchableSelect from "../components/SearchableSelect";
import { API_BASE } from "../lib/api";
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

const DOMAINS = [
  { value: "overall", label: "Overall" },
  { value: "engineering", label: "Engineering" },
];

const NIRF_PARAMETERS = [
  {
    code: "TLR",
    name: "Teaching, Learning & Resources",
    weightPct: 30,
    factors: [
      {
        code: "SS",
        label: "Student Strength including Doctoral Students",
        subWeight: 20,
      },
      {
        code: "FSR",
        label: "Faculty-student ratio (emphasis on permanent faculty)",
        subWeight: 30,
      },
      {
        code: "FQE",
        label: "Faculty with PhD (or equivalent) and experience",
        subWeight: 20,
      },
      { code: "FRU", label: "Financial Resources and Utilisation", subWeight: 30 },
    ],
  },
  {
    code: "RP",
    name: "Research and Professional Practice",
    weightPct: 30,
    factors: [
      { code: "PU", label: "Publications", subWeight: 35 },
      { code: "QP", label: "Quality of Publications", subWeight: 40 },
      { code: "IPR", label: "IPR and Patents: Published and Granted", subWeight: 15 },
      {
        code: "FPPP",
        label: "Footprint of Projects and Professional Practice",
        subWeight: 10,
      },
    ],
  },
  {
    code: "GO",
    name: "Graduation Outcomes",
    weightPct: 20,
    factors: [
      { code: "GPH", label: "Placement and Higher Studies", subWeight: 40 },
      { code: "GUE", label: "University Examinations", subWeight: 15 },
      { code: "MS", label: "Median Salary (GMS)", subWeight: 25 },
      { code: "GPHD", label: "Ph.D. Students Graduated", subWeight: 20 },
    ],
  },
  {
    code: "OI",
    name: "Outreach and Inclusivity",
    weightPct: 10,
    factors: [
      {
        code: "RD",
        label: "Students from other States/Countries (Region Diversity)",
        subWeight: 30,
      },
      { code: "WD", label: "Women (Women Diversity)", subWeight: 30 },
      {
        code: "ESCS",
        label: "Economically and Socially Challenged Students",
        subWeight: 20,
      },
      { code: "PCS", label: "Facilities for Physically Challenged Students", subWeight: 20 },
    ],
  },
  {
    code: "PR",
    name: "Perception",
    weightPct: 10,
    factors: [
      {
        code: "PR",
        label: "Peer Perception: Employers and Academic Peers",
        subWeight: 100,
      },
    ],
  },
];

const tableShell = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "15px",
  textAlign: "left",
};

const thTd = {
  border: "1px solid var(--border)",
  padding: "8px 10px",
  verticalAlign: "top",
};

const IITGAnalysis = () => {
  const [institutes, setInstitutes] = useState([]);
  const [institute, setInstitute] = useState("");
  const [domain, setDomain] = useState("overall");
  const [chartData, setChartData] = useState(null);
  const [shadowData, setShadowData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/shadow_metrics`)
      .then((res) => res.json())
      .then((res) => setShadowData(res))
      .catch((err) => console.error("Error fetching shadow metrics:", err));
  }, []);

  const fetchInstitutes = async (selectedDomain) => {
    try {
      const query = new URLSearchParams({ domain: selectedDomain });
      query.append("top_n", "10");

      const res = await fetch(`${API_BASE}/api/institutes?${query.toString()}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setInstitutes(list);

      const iitHydName = "Indian Institute of Technology Hyderabad";
      const defaultInstitute = list.includes(iitHydName) ? iitHydName : list[0] ?? "";
      setInstitute(defaultInstitute);
    } catch (err) {
      console.error("Error fetching institutes:", err);
    }
  };

  // Fetch graph data
  const fetchGraph = async (selectedInstitute, selectedDomain) => {
    if (!selectedInstitute) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/line_graph?institute=${encodeURIComponent(selectedInstitute)}&domain=${selectedDomain}`
      );
      if (!res.ok) {
        throw new Error(`Graph API failed: ${res.status}`);
      }

      const data = await res.json();

      const rawYears = Array.isArray(data.years) ? data.years : [];
      const iitgRaw = Array.isArray(data.iitg) ? data.iitg : [];
      const otherRaw = Array.isArray(data.other) ? data.other : [];
      const filteredRows = rawYears
        .map((year, idx) => ({
          year: Number(year),
          iitg: iitgRaw[idx] == null || iitgRaw[idx] === "" ? null : Number(iitgRaw[idx]),
          other: otherRaw[idx] == null || otherRaw[idx] === "" ? null : Number(otherRaw[idx]),
        }))
        .filter((row) => row.year >= 2021 && row.year <= 2025);

      setChartData({
        labels: filteredRows.map((row) => String(row.year)),
        datasets: [
          {
            label: "Indian Institute of Technology Guwahati",
            data: filteredRows.map((row) => row.iitg),
            borderColor: "#e53935",
            backgroundColor: "rgba(229, 57, 53, 0.08)",
            pointBackgroundColor: "#e53935",
            pointRadius: 4,
            pointHitRadius: 12,
            borderWidth: 3,
            tension: 0.25,
            spanGaps: true,
          },
          {
            label: selectedInstitute,
            data: filteredRows.map((row) => row.other),
            borderColor: "#2196F3",
            backgroundColor: "rgba(33, 150, 243, 0.08)",
            pointBackgroundColor: "#2196F3",
            pointRadius: 4,
            pointHitRadius: 12,
            borderWidth: 2,
            borderDash: [6, 4],
            tension: 0.25,
            spanGaps: true,
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching graph:", err);
    }
  };

  useEffect(() => {
    fetchInstitutes(domain);
  }, [domain]);

  useEffect(() => {
    if (institute) {
      fetchGraph(institute, domain);
    }
  }, [institute, domain]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: { usePointStyle: true, padding: 16, color: "#d1d5db" },
        },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: {
          title: { display: true, text: "Year", color: "#d1d5db" },
          ticks: { color: "#d1d5db" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
        y: {
          title: { display: true, text: "NIRF score", color: "#d1d5db" },
          ticks: { color: "#d1d5db" },
          grid: { color: "rgba(255,255,255,0.1)" },
          suggestedMin: 0,
        },
      },
    }),
    []
  );

  const chartInsights = useMemo(() => {
    if (!chartData || !chartData.labels?.length || chartData.datasets?.length < 2) return null;
    const years = chartData.labels;
    const iitgScores = chartData.datasets[0].data;
    const otherScores = chartData.datasets[1].data;
    const validPairs = years
      .map((year, idx) => ({ year, iitg: iitgScores[idx], other: otherScores[idx] }))
      .filter((row) => row.iitg != null && row.other != null);
    if (!validPairs.length) return null;

    const first = validPairs[0];
    const last = validPairs[validPairs.length - 1];
    const diff2025 = Number(last.other) - Number(last.iitg);

    return {
      startYear: first.year,
      endYear: last.year,
      iitgTrend: Number(last.iitg) - Number(first.iitg),
      peerTrend: Number(last.other) - Number(first.other),
      peerName: chartData.datasets[1].label,
      diff2025,
    };
  }, [chartData]);

  const improvementAreas = useMemo(() => {
    if (!shadowData?.metrics) return [];
    return [...shadowData.metrics]
      .map((m) => ({
        code: m.id,
        area: m.domain_label,
        gap: Number((((m.hyderabad - m.guwahati) / m.max) * 100).toFixed(2)),
      }))
      .filter((row) => row.gap > 0)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 4);
  }, [shadowData]);

  return (
    <div className="flex w-full flex-col items-center bg-[#0b0f1a]   text-gray-100 sm:px-8">
      <Navbar />
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          IIT Guwahati NIRF Analysis (2021-2025)
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-300">
          This section focuses on one core question: why IIT Guwahati fell below IIT Hyderabad in
          2025, and what practical improvements can raise future NIRF performance.
        </p>
      </header>

      <div className="w-full max-w-5xl space-y-8">
        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-4">
            What NIRF parameters mean
          </h2>
          <p className="mb-4 text-sm text-gray-300">
            NIRF score is built from five main categories. The table shows the total category
            weight and each sub-parameter's contribution.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-800/40 text-gray-300 text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Main Parameter</th>
                  <th className="px-4 py-3 font-semibold">Total Weight</th>
                  <th className="px-4 py-3 font-semibold">Sub-Parameter</th>
                  <th className="px-4 py-3 font-semibold">Sub Weight</th>
                  <th className="px-4 py-3 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {NIRF_PARAMETERS.map((p) =>
                  p.factors.map((f, i) => (
                    <tr key={`${p.code}-${f.code}-${i}`} className="hover:bg-gray-800/40">
                      {i === 0 && (
                        <td rowSpan={p.factors.length} className="px-4 py-3 font-bold text-cyan-300">
                          {p.code} ({p.name})
                        </td>
                      )}
                      {i === 0 && (
                        <td rowSpan={p.factors.length} className="px-4 py-3 text-gray-200 font-mono">
                          {p.weightPct}%
                        </td>
                      )}
                      <td className="px-4 py-3 font-mono text-cyan-400">{f.code}</td>
                      <td className="px-4 py-3 font-mono text-gray-200">{f.subWeight}%</td>
                      <td className="px-4 py-3 text-gray-300">{f.label}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">
              Score trend: IIT Guwahati vs Top 10 peer
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Comparison defaults to IIT Hyderabad and uses only Top 10 peer institutes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-5">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase text-gray-500">Domain</label>
              <SearchableSelect
                options={DOMAINS.map((d) => d.value)}
                value={domain}
                onChange={setDomain}
                placeholder="Select Domain"
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase text-gray-500">Peer institute (Top 10 only)</label>
              <SearchableSelect
                options={institutes}
                value={institute}
                onChange={setInstitute}
                placeholder="Select Institute"
              />
            </div>
          </div>
          <div className="h-[340px] w-full">
            {chartData ? <Line data={chartData} options={chartOptions} /> : <p>Loading chart...</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-3">
            Why IIT Guwahati dropped below IIT Hyderabad in 2025
          </h2>
          {chartInsights ? (
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-300">
              <li>
                In {chartInsights.endYear}, IIT Guwahati trails {chartInsights.peerName} by{" "}
                <span className="font-bold text-red-300">{chartInsights.diff2025.toFixed(2)} points</span>.
              </li>
              <li>
                IIT Guwahati trend ({chartInsights.startYear}-{chartInsights.endYear}) is{" "}
                {chartInsights.iitgTrend.toFixed(2)} points, while {chartInsights.peerName} changes by{" "}
                {chartInsights.peerTrend.toFixed(2)} points.
              </li>
              <li>
                Parameter-level comparison suggests the largest performance gaps come from specific
                sub-parameters listed below.
              </li>
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Waiting for score trend data...</p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-3">
            What IIT Guwahati can improve next
          </h2>
          <p className="mb-4 text-sm text-gray-300">
            These are the biggest current gaps against IIT Hyderabad (higher gap means stronger
            immediate opportunity).
          </p>
          {improvementAreas.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {improvementAreas.map((item) => (
                <div key={item.code} className="rounded-xl border border-gray-700 bg-gray-900/40 p-4">
                  <p className="text-sm font-semibold text-cyan-300">
                    {item.code} ({item.area})
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Gap vs IIT Hyderabad: {item.gap.toFixed(2)}% of the parameter maximum
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Gap data is loading...</p>
          )}
          <ul className="list-disc pl-6 mt-4 space-y-1 text-sm text-gray-300">
            <li>Strengthen high-impact research quality and citation visibility.</li>
            <li>Improve faculty quality and sustained research output per faculty member.</li>
            <li>Increase national/international perception through stronger industry-academic signaling.</li>
            <li>Set yearly KPI targets aligned to NIRF sub-parameters rather than only final rank.</li>
          </ul>
        </section>

        <ShadowMetricsChart />
      </div>
    </div>
  );
};

export default IITGAnalysis;