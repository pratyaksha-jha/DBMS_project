import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Navbar from "./Navbar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import SearchableSelect from "../components/SearchableSelect";
import { API_BASE } from "../lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6666", "#4CAF50"];

const LineChart = ({ years, ranks }) => {
  if (!ranks || ranks.length === 0) return <p className="text-gray-400 text-sm">No data available</p>;
  const validRanks = ranks.filter((r) => r !== null);
  if (validRanks.length === 0) return <p className="text-gray-400 text-sm">No ranking data found</p>;
  const minRank = Math.min(...validRanks);
  const maxRank = Math.max(...validRanks);

  return (
    <Line
      data={{
        labels: years,
        datasets: [
          {
            data: ranks,
            fill: false,
            borderColor: "rgb(34, 211, 238)",
            tension: 0,
            spanGaps: true,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: (ctx) => {
              const value = ctx.raw;
              if (value === minRank) return "#157b12";
              if (value === maxRank) return "#FF8042";
              return "rgb(75, 192, 192)";
            },
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (context) => `Rank: ${context.raw}` } },
          title: { display: true, text: "Rank Trend", font: { size: 16 } },
        },
        scales: {
          x: { title: { display: true, text: "Year", font: { size: 14 } } },
          y: {
            reverse: true,
            beginAtZero: false,
            suggestedMin: minRank - 2,
            suggestedMax: maxRank + 2,
            ticks: { stepSize: 1 },
            title: { display: true, text: "NIRF Rank", font: { size: 14 } },
          },
        },
      }}
    />
  );
};

const renderCustomizedLabel = ({ cx, cy, x, y, name, value, percent, textAnchor }) => {
  if (percent < 0.02) return null; 

  return (
    <g>
      <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central">
        {/* Category Name*/}
        <tspan x={x} dy="-0.5em" fill="#9ca3af" fontSize="12px" className="font-medium tracking-wide">
          {name}
        </tspan>
        {/*Currency Amount + Percentage*/}
        <tspan x={x} dy="1.4em" fill="#22d3ee" fontSize="14px" className="font-bold">
          ₹ {value.toLocaleString('en-IN')} ({(percent * 100).toFixed(0)}%)
        </tspan>
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f2937] border border-gray-700 p-4 rounded-lg shadow-2xl">
        <p className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1">
            {payload[0].name}
        </p>
        <p className="text-white font-mono text-base">
            ₹ {payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
};

const Piechart = ({ data }) => {
  const hasData = data && data.some(item => item.value > 0);

  if (!hasData) {
      return (
          <div className="flex items-center justify-center h-[350px] w-full border border-dashed border-gray-700 rounded-xl">
              <p className="text-gray-400 text-base">No budget data available for this selection</p>
          </div>
      );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%" 
          innerRadius={50} 
          outerRadius={80} 
          fill="#8884d8"
          paddingAngle={4} 
          dataKey="value"
          labelLine={{ stroke: '#4b5563', strokeWidth: 1 }} 
          label={renderCustomizedLabel} 
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none"/>
          ))}
        </Pie>
        <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default function InstituteAnalysis() {
  const [institutes, setInstitutes] = useState([]);
  const [domains, setDomains] = useState([]);
  const [institute, setInstitute] = useState("");
  const [domain, setDomain] = useState("");
  const [years, setYears] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [year, setYear] = useState("");
  const [finyear, setFinYear] = useState("2023-24");
  const [programs, setPrograms] = useState([]);
  const [program, setProgram] = useState("");
  const [parameters, setParameters] = useState({ tlr: 0, rpc: 0, go: 0, oi: 0, pr: 0, score: 0 });
  const [piedata, setPiedata] = useState({});
  const [placement, setPlacement] = useState({ salary: 0, placed: 0, studies: 0, total: 0 });
  const [research, setResearch] = useState({ projects: 0, agencies: 0, amount: 0 });
  const [expandedRow, setExpandedRow] = useState(null);
  const budgetData = [
    { name: "Library", value: piedata?.library || 0 },
    { name: "New equipment", value: piedata?.equipment || 0 },
    { name: "Engineering workshops", value: piedata?.workshops || 0 },
    { name: "Studios", value: piedata?.studios || 0 },
    { name: "Other capital assets", value: piedata?.capital_assets || 0 },
    { name: "Salaries", value: piedata?.salaries || 0 },
    { name: "Maintenance", value: piedata?.maintenance || 0 },
    { name: "Seminars/Conferences", value: piedata?.seminars || 0 },
  ].filter((item) => item.value > 0);

  const param = [
        {
            "name": "TLR",
            "value": parameters["tlr"],
            "def": "Teaching, Learning and resources",
            "desc": [
                "Evaluates the core teaching environment, student strength, and faculty-student ratio.",
                "Measures financial resource utilization and the footprint of online education.",
                "Assesses implementation of multiple entry/exit options and regional language courses."
            ]
        },
        {
            "name": "RPC",
            "value": parameters["rpc"],
            "def": "Research, patents and citations",
            "desc": [
                "Assesses academic output through the quantity and quality of publications and citations.",
                "Evaluates the number of patents that have been published and granted over three years.",
                "Measures the footprint of professional practice via research funding and consultancy earnings."
            ]
        },
        {
            "name": "GO",
            "value": parameters["go"],
            "def": "Growth and outcome",
            "desc": [
                "Measures the percentage of students passing university exams within the stipulated time.",
                "Incorporates the average number of Ph.D. students successfully graduated.",
                "Focuses heavily on overall student success and degree completion rates."
            ]
        },
        {
            "name": "OI",
            "value": parameters["oi"],
            "def": "Outreach and inclusivity",
            "desc": [
                "Examines diversity by tracking women representation among students and faculty.",
                "Measures the percentage of students enrolled from other states and countries.",
                "Evaluates inclusivity through tuition fee reimbursements and physical accessibility facilities."
            ]
        },
        {
            "name": "PR",
            "value": parameters["pr"],
            "def": "Peer perception",
            "desc": [
                "Captures overall institutional reputation based entirely on large-scale surveys.",
                "Reflects the preference for graduates among academic peers and reputed employers.",
                "Provides a comprehensive view of standing in the broader academic and corporate community."
            ]
        },
        {
            "name": "Total score",
            "value": parameters["score"],
            "def": "Total score (This decides the rank)",
            "desc": [
                "Computed based on the specific weights allotted to each of the five broad heads.",
                "Takes a maximum possible value of 100.",
                "Institutions are directly rank-ordered based on this final aggregated score."
            ]
        }
    ];


  useEffect(() => {
    fetch(`${API_BASE}/institute_analysis/domains`)
      .then((res) => res.json())
      .then((data) => setDomains(data.domains || []))
      .catch((error) => console.error("Error fetching domains:", error));
  }, []);

  useEffect(() => {
    if (domains.length > 0) setDomain(domains[0]);
  }, [domains]);

  useEffect(() => {
    if (!domain) return;
    fetch(`${API_BASE}/institute_analysis/institutes?domain=${encodeURIComponent(domain)}`)
      .then((res) => res.json())
      .then((data) => {
        const list = (data.institutes || []).filter(Boolean).sort((a, b) => a.localeCompare(b));
        setInstitutes(list);
      })
      .catch((error) => console.error("Error fetching institutes:", error));
  }, [domain]);

  useEffect(() => {
    if (institutes.length > 0) setInstitute(institutes[0]);
  }, [institutes]);

  const fetchRankTrend = async (e) => {
    e.preventDefault();
    try {
      const queryParams = new URLSearchParams({ institute, domain }).toString();
      const response = await fetch(`${API_BASE}/institute_analysis/rank_trend?${queryParams}`);
      const data = await response.json();
      setYears([...(data.years || [])].reverse());
      setRanks([...(data.ranks || [])].reverse());
      if (data.years?.length) setYear(data.years[0]);
    } catch (error) {
      console.error("Error fetching rank trend:", error);
    }
  };

  useEffect(() => {
    if (!institute || !domain || !year) return;
    const queryParams = new URLSearchParams({ institute, domain, year }).toString();
    fetch(`${API_BASE}/institute_analysis/rank_trend/parameters?${queryParams}`)
      .then((res) => res.json())
      .then((data) => setParameters(data.parameters && typeof data.parameters === "object" ? data.parameters : { tlr: 0, rpc: 0, go: 0, oi: 0, pr: 0, score: 0 }))
      .catch((error) => console.error("Error fetching parameters:", error));
  }, [institute, domain, year]);

  useEffect(() => {
    if (!institute || !domain || !finyear) return;
    const queryParams = new URLSearchParams({ name: institute, domain, fin_year: finyear }).toString();
    fetch(`${API_BASE}/institute_analysis/budget?${queryParams}`)
      .then((res) => res.json())
      .then((result) => setPiedata(result.parameters && typeof result.parameters === "object" ? result.parameters : {}))
      .catch((error) => {
        console.error("Error fetching budget data:", error);
        setPiedata({});
      });
  }, [institute, domain, finyear]);

  useEffect(() => {
    if (!institute || !domain || !finyear) return;
    const queryParams = new URLSearchParams({ name: institute, domain, finyear }).toString();
    fetch(`${API_BASE}/institute_analysis/research?${queryParams}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.research && typeof data.research === "object") {
          setResearch({
            projects: data.research.sponsored_projects || 0,
            agencies: data.research.funding_agencies || 0,
            amount: data.research.research_amount || 0,
          });
        } else {
          setResearch({ projects: 0, agencies: 0, amount: 0 });
        }
      })
      .catch((error) => {
        console.error("Error fetching research data:", error);
        setResearch({ projects: 0, agencies: 0, amount: 0 });
      });
  }, [institute, domain, finyear]);

  // CHANGED: Fixed the response mapping from data.programs to data.program_types
  useEffect(() => {
    if (!institute || !domain || !finyear) return;
    const queryParams = new URLSearchParams({ name: institute, domain, finyear }).toString();
    fetch(`${API_BASE}/institute_analysis/placement/program_types?${queryParams}`)
      .then((res) => res.json())
      .then((data) => {
        const list = (data.program_types || []).filter(Boolean); // <-- Change is here
        setPrograms(list);
        setProgram((prev) => (list.includes(prev) ? prev : list[0] || ""));
      })
      .catch((error) => {
        console.error("Error fetching placement programs:", error);
        setPrograms([]);
        setProgram("");
      });

      
  }, [institute, domain, finyear]);

  useEffect(() => {
    if (!institute || !domain || !finyear || !program) {
      setPlacement({ salary: 0, placed: 0, studies: 0, total: 0 });
      return;
    }
    const queryParams = new URLSearchParams({ name: institute, domain, finyear, program }).toString();
    fetch(`${API_BASE}/institute_analysis/placement?${queryParams}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.placement && typeof data.placement === "object") {
          setPlacement({
            total: data.placement.grad_students || 0,
            placed: data.placement.placed_students || 0,
            salary: data.placement.median_salary || 0,
            studies: data.placement.higher_studies || 0,
          });
        } else {
          setPlacement({ salary: 0, placed: 0, studies: 0, total: 0 });
        }
      })
      .catch((error) => {
        console.error("Error fetching placement data:", error);
        setPlacement({ salary: 0, placed: 0, studies: 0, total: 0 });
      });
  }, [institute, domain, finyear, program]);

return (
    <div className="flex w-full flex-col items-center bg-[#0b0f1a] text-gray-100 sm:px-8">
      <Navbar />
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Institute level analysis
        </h1>
      </header>

      <div className="w-full max-w-6xl flex flex-col gap-8">
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl h-fit">
          <form onSubmit={fetchRankTrend} className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Domain</label>
              <SearchableSelect options={domains} value={domain} onChange={setDomain} placeholder="Select Domain" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Institute</label>
              <SearchableSelect options={institutes} value={institute} onChange={setInstitute} placeholder="Select Institute" />
            </div>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all">
              Get results
            </button>
          </form>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-500 mb-4">Ranking History</h2>
          <div className="h-[280px] w-full">
            <LineChart years={years} ranks={ranks} />
          </div>
        </div>

            {/* Parameters Table Card */}
            
            <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                {/*Table Title */}
                <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-500">NIRF Parameter Scores</h2>
                {/*Year Label */}
                <span className="text-sm font-mono text-gray-500 flex items-center gap-2">Year:
                    <SearchableSelect 
                        options={years || []} 
                        value={year} 
                        onChange={setYear} 
                        placeholder="Select Year" 
                        />
                    </span>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    {/* Table Header*/}
                    <tr className="bg-gray-800/30 text-gray-400 text-sm uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Parameter</th>
                        <th className="px-6 py-4 font-semibold text-center">Value</th>
                    </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-gray-800">
                    {param.map((p, index) => (
                        <React.Fragment key={index}>
                            {/* Main Clickable Row */}
                            <tr 
                                className="hover:bg-gray-800/40 transition-colors group cursor-pointer"
                                onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                            >
                                <td className="px-6 py-4 font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-3">
                                    <svg 
                                        className={`w-5 h-5 shrink-0 transition-transform duration-200 ${expandedRow === index ? 'rotate-180 text-cyan-400' : 'text-gray-500'}`} 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <div className="flex flex-col">
                                        {/*Acronym */}
                                        <span className="text-lg">{p.name}</span>
                                        {/* Full Form */}
                                        <span className="text-sm font-normal text-gray-400 group-hover:text-cyan-600 transition-colors mt-0.5">{p.def}</span>
                                    </div>
                                </td>
                                {/* Value Score */}
                                <td className="px-6 py-4 text-center font-mono text-cyan-400 text-2xl">
                                    {p.value}
                                </td>
                            </tr>
                            
                            {/* Expanded Content Row */}
                            {expandedRow === index && (
                                <tr className="bg-[#0f1523] border-t-0">
                                    <td colSpan="2" className="px-6 py-4">
                                        {/* Increased Dropdown List Font */}
                                        <ul className="list-disc list-outside text-sm text-gray-300 space-y-2 ml-10 max-w-2xl">
                                            {p.desc.map((line, i) => (
                                                <li key={i} className="leading-relaxed">{line}</li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

        {/* --- STICKY FINANCIAL YEAR BLOCK --- */}
        <div className="sticky top-4 z-50 bg-[#0b0f1a]/80 backdrop-blur-md border border-gray-800 p-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <label className="text-xs font-bold text-gray-300 uppercase mb-2 block drop-shadow-md">Financial year</label>
          <div className="max-w-xs relative z-50">
            <SearchableSelect options={["2023-24", "2022-23", "2021-22"]} value={finyear} onChange={setFinYear} placeholder="Select year" />
          </div>
        </div>

        {/* --- SIDE-BY-SIDE GRID WRAPPER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Research Block */}
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-500 mb-5">Research Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4">
                <p className="text-xs text-gray-400 uppercase">Number of funding agencies</p>
                <p className="text-2xl font-semibold text-cyan-400 mt-2">{research.agencies || 0}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4">
                <p className="text-xs text-gray-400 uppercase">Number of sponsored projects</p>
                <p className="text-2xl font-semibold text-cyan-400 mt-2">{research.projects || 0}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4 sm:col-span-2">
                <p className="text-xs text-gray-400 uppercase">Total amount received</p>
                <p className="text-2xl font-semibold text-cyan-400 mt-2">₹ {research.amount?.toLocaleString("en-IN") || 0}</p>
              </div>
            </div>
          </div>

          {/* Placement Block */}
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-500">Placement Overview</h2>
              <div className="w-full sm:min-w-[180px] sm:w-auto">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Program</label>
                <SearchableSelect options={programs} value={program} onChange={setProgram} placeholder={programs.length ? "Select program" : "No program found"} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4">
                <p className="text-xs text-gray-400 uppercase">Total students graduated</p>
                <p className="text-2xl font-semibold text-cyan-400 mt-2">{placement.total || 0}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4">
                <p className="text-xs text-gray-400 uppercase">Total students placed</p>
                <p className="text-2xl font-semibold text-cyan-400 mt-2">{placement.placed || 0}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4">
                <p className="text-xs text-gray-400 uppercase">Median salary</p>
                <p className="text-2xl font-semibold text-cyan-400 mt-2">₹ {placement.salary?.toLocaleString("en-IN") || 0}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-[#0f172a] p-4">
                <p className="text-xs text-gray-400 uppercase">Selected for higher studies</p>
                <p className="text-2xl font-semibold text-cyan-400 mt-2">{placement.studies || 0}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Budget Block */}
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl relative z-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-500 mb-4">Institute budget distribution</h2>
          <p className="text-xs text-gray-500 mb-6">For financial year {finyear}</p>
          <div className="h-[350px] w-full">
            <Piechart data={budgetData} />
          </div>
        </div>

      </div>
    </div>
  );
}