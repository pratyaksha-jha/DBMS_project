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
const IIT_HYDERABAD_NAME = "Indian Institute of Technology Hyderabad";

const NIRF_PARAMETERS_BY_DOMAIN = {
  overall: [
    {
      code: "TLR",
      name: "Teaching, Learning & Resources",
      weightPct: 30,
      factors: [
        {
          code: "SS",
          label: "Student Strength including Doctoral Students.",
          subWeight: 20,
        },
        {
          code: "FSR",
          label: "Faculty Student Ratio.",
          subWeight: 25,
        },
        {
          code: "FQE",
          label: "Faculty Qualification and Experience.",
          subWeight: 20,
        },
        { code: "FRU", label: "Financial Resources and Utilisation.", subWeight: 20 },
        {
          code: "OE",
          label: "Online Education: Online Completion of Syllabus & Exams and Swayam.",
          subWeight: 10,
        },
        {
          code: "MIRS",
          label: "Multiple Entry/Exit, Indian Knowledge System, Regional Languages, and Sustainable Living Practices.",
          subWeight: 5,
        },
      ],
    },
    {
      code: "RP",
      name: "Research and Professional Practice",
      weightPct: 30,
      factors: [
        { code: "PU", label: "Publications", subWeight: 35 },
        { code: "QP", label: "Quality of Publications", subWeight: 35 },
        { code: "IPR", label: "Intellectual Property Rights", subWeight: 15 },
        {
          code: "FPPP",
          label: "Footprint of Projects & Professional Practice",
          subWeight: 15,
        },
      ],
    },
    {
      code: "GO",
      name: "Graduation Outcomes",
      weightPct: 20,
      factors: [
        { code: "GUE", label: "Metric for University Examinations", subWeight: 60 },
        { code: "GPHD", label: "Graduated Ph.D. Students", subWeight: 40 },
      ],
    },
    {
      code: "OI",
      name: "Outreach and Inclusivity",
      weightPct: 10,
      factors: [
        {
          code: "RD",
          label: "Region Diversity: Percentage of Students from other States/Countries ",
          subWeight: 30,
        },
        { code: "WD", label: "Women Diversity: Percentage of Women.", subWeight: 30 },
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
      name: "Perception Ranking",
      weightPct: 10,
      factors: [
        {
          code: "PR",
          label: "Peer Perception: Employers and Academic Peers",
          subWeight: 100,
        },
      ],
    },
  ],
  engineering: [
  {
    code: "TLR",
    name: "Teaching, Learning & Resources",
    weightPct: 30,
    factors: [
      {
        code: "SS",
        label: "Student Strength including Doctoral Students.",
        subWeight: 20,
      },
      {
        code: "FSR",
        label: "Faculty Student Ratio.",
        subWeight: 30, 
      },
      {
        code: "FQE",
        label: "Faculty Qualification and Experience.",
        subWeight: 20,
      },
      { code: "FRU", label: "Financial Resources and Utilisation.", subWeight: 30 },
    ],
  },
  {
    code: "RP",
    name: "Research and Professional Practice",
    weightPct: 30,
    factors: [
      { code: "PU", label: "Publications", subWeight: 35 },
      { code: "QP", label: "Quality of Publications", subWeight: 40 },
      { code: "IPR", label: "Intellectual Property Rights", subWeight: 15 },
      {
        code: "FPPP",
        label: "Footprint of Projects & Professional Practice",
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
      { code: "GUE", label: "Metric for University Examinations", subWeight: 15 },
      { code: "MS", label: "Median Salary (GMS)", subWeight: 25 },
      { code: "GPHD", label: "Graduated Ph.D. Students", subWeight: 20 },
    ],
  },
  {
    code: "OI",
    name: "Outreach and Inclusivity",
    weightPct: 10,
    factors: [
      {
        code: "RD",
        label: "Region Diversity: Percentage of Students from other States/Countries ",
        subWeight: 30,
      },
      { code: "WD", label: "Women Diversity: Percentage of Women.", subWeight: 30 },
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
    name: "Perception Ranking",
    weightPct: 10,
    factors: [
      {
        code: "PR",
        label: "Peer Perception: Employers and Academic Peers",
        subWeight: 100,
      },
    ],
  },
  ],
};

const IITG_BETTER_AREAS = [
  {
    title: "Social media presence",
    points: [
      "First, social media presence needs an overhaul. Top ranked IITs like IIT Madras and IIT Bombay post regularly and strategically on platforms such as Instagram, LinkedIn, X, and YouTube, showcasing student achievements, research breakthroughs, competitions, and campus life. IITG should follow a structured social media calendar, posting more frequently and highlighting student projects, placements, startups, research papers, design competitions, and sports events. This would not only improve perception scores in rankings but also attract better students, faculty, and industry interest.",
    ],
  },
  {
    title: "Institutes main webpage",
    points: [
      "Second, the main webpage of IITG is very bland and outdated compared to top IITs. IIT Bombay, IIT Delhi, and IIT Madras place their major achievements, flagship projects, research centres, and upcoming events right on the homepage, making it easy for visitors to see the institute’s impact at a glance. In contrast, IITG’s homepage still gives space to relatively “low impact” content like the academic calendar and routine notices, which does little to build brand image. The website should be redesigned with a modern, user friendly layout, strong visual hierarchy, and clear sections for research, innovation, industry collaborations, and student achievements to project IITG as a dynamic, research driven campus."],
  },
  {
    title: "Industrial outreach",
    points: [
      "Third, industrial outreach and collaborations at IITG must intensify. Top IITs have formal, continuous partnerships with reputed companies such as Mercedes Benz (with IIT Delhi), John Cockerill and Rishabh Instruments (with IIT Bombay), and many others for joint R&D, sponsored labs, and skill development programmes. These collaborations not only generate revenue and cutting edge research but also improve Perception and Graduation Outcomes in rankings. IITG should create a dedicated industry relations cell to proactively reach out to national and global companies, propose industry specific centres of excellence, and design internship and project based learning opportunities that align with market needs."],
  },
  {
    title: "Student clubs",
    points: [
      "Fourth, student clubs and communities play a surprisingly large role in shaping an institute’s image and depth of expertise. IIT Bombay, for example, splits broad interests into multiple focused clubs—like Quant Club, Finance Club ...etc —so students can dive deep into niche areas. In contrast, IIT Guwahati has broader clubs such as Finance and Economics Club (FEC), which, while valuable, does not allow the same level of specialization and project depth. Expanding and subdividing clubs into domain specific verticals (e.g., Quant, Finance, Data, Policy, Consulting) would help students build sharper skills, create higher quality projects, and look more impressive to recruiters and rankings agencies."],
  },
  {
    title: "Sports and extracuriculars",
    points: [
      "Fifth, sports and extra curricular excellence directly boost perception. IIT Madras has introduced sports quotas, actively recruiting talented athletes and strengthening its inter IIT sports performance, which in turn improves its brand image as a “well balanced” institute. A strong presence in national level tournaments, festivals, and championships generates media coverage and positive word of mouth, both of which feed into the Perception parameter in NIRF and other rankings. IITG should invest in sports infrastructure, coaching, and incentives for athletes, and publicize its sports successes widely on social media and the homepage"],
  },
  {
    title: "Startup Culture",
    points: [
      "IITG must develop a real startup culture instead of relying only on academic excellence. While institutes like IIT Madras and IIT Bombay have thriving ecosystems supported by large incubators and frequent funding readiness workshops, IITG’s Technology Incubation Centre (Tihub) and BioNEST are under utilized and not prominently marketed. To promote a startup culture, IITG should:",
      "Expand incubation centres with more seed funding, mentor networks, and angel investor connects.",
      "Run regular startup bootcamps, hackathons, and demo days featuring industry judges and media coverage.",
      "Integrate entrepreneurship courses and mini MBA style modules into the curriculum so more students view startups as a viable career path.",
      "By improving social media marketing, website design, industry partnerships, specialized clubs, sports outreach, and startup culture, IIT Guwahati can not only increase its TLR and Perception (PR) scores in NIRF but also position itself as a truly competitive, modern institute on par with the top ranked IITs.",
    ],
  },
  {
    title :"Better Utilisation of Funds",
    points:[
      "IIT Guwahati has a budget more than IIT Hyderabad. But even despite this the fund utilisation of IIT Guwahati is lesser and the amount the college spends per student is significantly lower than other top institutes. We need to improve budget utilisation , spend more money on essential amenities and thoroughly monitor the expenditure."
    ]
  }
];
// iitg lib - 13 cr , iith lib - 2 cr 
// equip - 50 cr, iith - 33 cr
// capital assets - 49 cr , 40 cr
//salaries 197 cr , 145 cr
//fac - 460 , 282
// mainte - <
// fru - annual capital expend & annual __ exp per student for prev 3 yrs 
// 18.32 , 25.71



const IITGAnalysis = () => {
  const [openParam, setOpenParam] = useState(null); 
  const [openBetterArea, setOpenBetterArea] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [institute, setInstitute] = useState("");
  const [domain, setDomain] = useState("overall");
  const [chartData, setChartData] = useState(null);
  const [shadowData, setShadowData] = useState(null);
  const currentParams = NIRF_PARAMETERS_BY_DOMAIN[domain] || NIRF_PARAMETERS_BY_DOMAIN.overall;

  const fetchInstitutes = async (selectedDomain) => {
    try {
      const query = new URLSearchParams({ domain: selectedDomain });
      query.append("top_n", "100");

      const res = await fetch(`${API_BASE}/api/institutes?${query.toString()}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setInstitutes(list);

      const defaultInstitute = list.includes(IIT_HYDERABAD_NAME) ? IIT_HYDERABAD_NAME : list[0] ?? "";
      setInstitute(defaultInstitute);
    } catch (err) {
      console.error("Error fetching institutes:", err);
    }
  };
  
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
    setOpenParam(null);
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

    const maxScoreMap = {};
    currentParams.forEach(param => {
      maxScoreMap[param.code] = 100;
      param.factors.forEach(f => {
        maxScoreMap[f.code] = f.subWeight;
      });
    });

    return [...shadowData.metrics]
      .map((m) => {
        const correctMax = maxScoreMap[m.id] || m.max || 1; 
        return {
          code: m.id,
          area: m.domain_label,
          gap: Number((((m.peer - m.guwahati) / correctMax) * 100).toFixed(2)),
        };
      })
      .filter((row) => row.gap > 0)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 4);
  }, [shadowData, currentParams]);

  return (
    <div className="flex w-full flex-col items-center bg-[#0b0f1a]   text-gray-100 sm:px-8">
      <Navbar />
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          IIT Guwahati NIRF Analysis (2021-2025)
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-300">
          This section focuses on what IIT Guwahati can do to improve it's ranking in NIRF and it's comparision with peer institutes.
        </p>
      </header>

      <div className="w-full max-w-5xl space-y-8">
        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-4">
            Comparison controls
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <label className="mb-2 block text-[10px] font-bold uppercase text-gray-500">Peer institute</label>
              <SearchableSelect
                options={institutes}
                value={institute}
                onChange={setInstitute}
                placeholder="Select Institute"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-4">
            NIRF parameters
          </h2>
          <p className="mb-4 text-sm text-gray-300">
            NIRF score is built from five main categories. The table shows the total category
            weight and each sub-parameter's contribution.
          </p>
          <br></br>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentParams.map((param, index) => {
              const isOpen = openParam === index;

              return (
                <button
                  key={param.code}
                  type="button"
                  onClick={() => setOpenParam(isOpen ? null : index)}
                  className={`group rounded-xl border p-4 text-left transition-all duration-300 ${
                    isOpen
                      ? "border-cyan-500/60 bg-[#1f2937] shadow-[0_0_15px_-3px_rgba(34,211,238,0.15)]"
                      : "border-gray-700/50 bg-[#1f2937]/40 hover:border-cyan-500/50 hover:bg-[#1f2937]"
                  }`}
                >
                  <div className="mb-2 bg-gradient-to-br from-cyan-300 to-blue-500 bg-clip-text text-3xl font-black text-transparent">
                    {param.code}
                  </div>
                  <p className="text-sm font-medium text-gray-200 transition-colors group-hover:text-white">
                    {param.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Weight: {param.weightPct}%</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    {isOpen ? "Click to hide description" : "Click to view description"}
                  </p>

                  {isOpen && (
                    <div className="mt-3 space-y-2 border-t border-gray-700/70 pt-3 text-xs text-gray-300">
                      {param.factors.map((f) => (
                        <div key={f.code}>
                          <span className="font-semibold text-cyan-300">{f.code}</span>
                          <span className="text-gray-400"> ({f.subWeight}%)</span>
                          <p className="mt-0.5 leading-relaxed">{f.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">
              Score comparision across years of IITG and other institutes.
            </h2>
            
          </div>
          <div className="h-[340px] w-full">
            {chartData ? <Line data={chartData} options={chartOptions} /> : <p>Loading chart...</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-3">
              Key insights from score trends
          </h2>
          {chartInsights ? (
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-300">
              <li>
                In {chartInsights.endYear}, IIT Guwahati{" "}
                {chartInsights.diff2025 > 0 ? (
                  <>trails {chartInsights.peerName} by <span className="font-bold text-red-400">{chartInsights.diff2025.toFixed(2)} points</span></>
                ) : (
                  <>leads {chartInsights.peerName} by <span className="font-bold text-green-400">{Math.abs(chartInsights.diff2025).toFixed(2)} points</span></>
                )}.
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

        <ShadowMetricsChart
          domain={domain}
          institute={institute}
          onDataChange={setShadowData}
          parameters={currentParams}
        />

        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-3">
            Top improvement areas of IITG
          </h2>
          <p className="mb-4 text-sm text-gray-300">
            These are the biggest current gaps against {shadowData?.peer || "the selected institute"}.
          </p>
          {improvementAreas.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {improvementAreas.map((item) => (
                <div key={item.code} className="rounded-xl border border-gray-700 bg-gray-900/40 p-4">
                  <p className="text-sm font-semibold text-cyan-300">{item.code}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {shadowData?.peer || "Peer institute"} leads by a margin of {item.gap.toFixed(2)}%.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Gap data is loading...</p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-3">
            What can IITG do better?
          </h2>
          <p className="mb-4 text-sm text-gray-300">
            IIT Guwahati must improve how it brands and presents itself to the outside world, not just in terms of research and academics,
            but also in visibility, perception, and ecosystem development—areas where IIT Madras, IIT Bombay, and IIT Delhi are already far ahead.
          </p>
          <br></br>
          <p className="mb-4 text-sm text-gray-300">By improving social media marketing, website design, industry partnerships, specialized clubs, sports outreach, and startup culture,
             IIT Guwahati can not only increase its TLR and Perception (PR) scores in NIRF but also position itself as a truly competitive,
              modern institute on par with the top ranked IITs.</p>
              <br></br>
          <div className="space-y-3">
            {IITG_BETTER_AREAS.map((area, idx) => {
              const isOpen = openBetterArea === idx;
              return (
                <div key={area.title} className="rounded-lg border border-gray-700">
                  <button
                    type="button"
                    onClick={() => setOpenBetterArea(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between bg-gray-800 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-cyan-300">{area.title}</span>
                    <span className="text-xs text-gray-300">{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <ul className="list-disc space-y-2 bg-gray-900 px-8 py-4 text-sm text-gray-300">
                      {area.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default IITGAnalysis;