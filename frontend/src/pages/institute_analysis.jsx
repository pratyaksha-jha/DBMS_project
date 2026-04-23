import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import SearchableSelect from '../components/SearchableSelect';
import { API_BASE } from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ years, ranks }) => {
  if (!ranks || ranks.length === 0) return <p className="text-gray-400 text-sm">No data available</p>;

  const validRanks = ranks.filter(r => r !== null);
  
  if (validRanks.length === 0) return <p className="text-gray-400 text-sm">No ranking data found</p>;

  const minRank = Math.min(...validRanks);
  const maxRank = Math.max(...validRanks);

  const data = {
    labels: years,
    datasets: [
      {
        data: ranks,
        fill: false,
        borderColor: 'rgb(34, 211, 238)',
        tension: 0,
        spanGaps: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: (ctx) => {
          const value = ctx.raw;
          if (value === minRank) return '#157b12'; 
          if (value === maxRank) return '#FF8042'; 
          return 'rgb(75, 192, 192)';
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { size: 14 },
        titleFont: { size: 14 },
        callbacks: {
          label: (context) => `Rank: ${context.raw}`,
        },
      },
      title: { display: true, text: 'Rank Trend', font: { size: 16 } },
    },
    scales: {
      x: { 
        title: { display: true, text: 'Year', font: { size: 14 } },
        ticks: { font: { size: 12 } }
      }, 
      y: {
        reverse: true,
        beginAtZero: false,
        suggestedMin: minRank - 2,
        suggestedMax: maxRank + 2,
        ticks: { stepSize: 1, font: { size: 12 } },
        title: { display: true, text: 'NIRF Rank', font: { size: 14 } }, 
      },
    },
  };

  return <Line data={data} options={options} />;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6666', '#4CAF50']; 

const renderCustomizedLabel = ({ cx, cy, x, y, name, value, percent, textAnchor }) => {
  if (percent < 0.02) return null; 

  return (
    <g>
      <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central">
        <tspan x={x} dy="-0.5em" fill="#9ca3af" fontSize="12px" className="font-medium tracking-wide">
          {name}
        </tspan>
        <tspan x={x} dy="1.4em" fill="#22d3ee" fontSize="14px" className="font-bold">
          ₹ {value.toLocaleString('en-IN')} {(percent * 100).toFixed(0)}%
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
    const [parameters, setParameters] = useState({"tlr":0,"rpc":0,"go":0,"oi":0,"pr":0,"score":0});
    const [piedata, setPiedata] = useState({});
    
    // Financial Year and Placement States
    const [finyear, setFinYear] = useState("2023-24");
    const [program, setProgram] = useState("ug 4 year");
    const [placement, setPlacement] = useState({"salary":0,"placed":0,"studies":0,"total":0});
    const [research, setResearch] = useState({"projects":0,"agencies":0,"amount":0});
    
    const data = [
        { name: 'Library', value: piedata?.library || 0 },
        { name: 'New equipment', value: piedata?.equipment || 0 },
        { name: 'Engineering workshops', value: piedata?.workshops || 0 },
        { name: 'Studios', value: piedata?.studios || 0 },
        { name: 'Other capital assets', value: piedata?.capital_assets || 0 },
        { name: 'Salaries', value: piedata?.salaries || 0 },
        { name: 'Maintenance', value: piedata?.maintenance || 0 },
        { name: 'Seminars/Conferences', value: piedata?.seminars || 0 },
    ].filter(item => item.value > 0);
    
    const param = [
        { "name": "TLR", "value": parameters["tlr"], "def": "Teaching, Learning and resources", "desc": ["Evaluates the core teaching environment, student strength, and faculty-student ratio."] },
        { "name": "RPC", "value": parameters["rpc"], "def": "Research, patents and citations", "desc": ["Assesses academic output through the quantity and quality of publications and citations."] },
        { "name": "GO", "value": parameters["go"], "def": "Growth and outcome", "desc": ["Measures the percentage of students passing university exams within the stipulated time."] },
        { "name": "OI", "value": parameters["oi"], "def": "Outreach and inclusivity", "desc": ["Examines diversity by tracking women representation among students and faculty."] },
        { "name": "PR", "value": parameters["pr"], "def": "Peer perception", "desc": ["Captures overall institutional reputation based entirely on large-scale surveys."] },
        { "name": "Total score", "value": parameters["score"], "def": "Total score (This decides the rank)", "desc": ["Computed based on the specific weights allotted to each of the five broad heads."] }
    ];

    useEffect(() => {
        const fetchDomains = async () => {
            const res = await fetch(`${API_BASE}/institute_analysis/domains`);
            const data = await res.json();
            setDomains(data.domains);
        };
        fetchDomains();
    }, []);

    useEffect(() => {
        if (!domain) return;  
        const fetchInstitutes = async () => {
            const res = await fetch(`${API_BASE}/institute_analysis/institutes?domain=${encodeURIComponent(domain)}`);
            const data = await res.json();
            const list = (data.institutes || []).filter(Boolean);
            setInstitutes(list.slice().sort((a, b) => a.localeCompare(b)));
        };
        fetchInstitutes();
    }, [domain]);

    useEffect(() => {
        if (domains.length > 0) setDomain(domains[0]);
    }, [domains]);

    useEffect(() => {
        if (institutes.length > 0) setInstitute(institutes[0]);
    }, [institutes]);

    const fetchData = async (e) => {
        e.preventDefault();
        const queryParams = new URLSearchParams({ institute, domain }).toString();
        try {
            const response = await fetch(`${API_BASE}/institute_analysis/rank_trend?${queryParams}`, {
                method: "GET", headers: { "Accept": "application/json" }
            });
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            setYears([...data.years].reverse());
            setRanks([...data.ranks].reverse());
            if (data.years && data.years.length > 0) {
                setYear(data.years[0]);
            }
        } catch (error) {
            console.error("Error fetching rank data:", error);
        }
    };

    // Dependent effect for Parameters
    useEffect(() => {
        const fetchParams = async () => {
            if (!institute || !domain || !year) return;
            const queryParams = new URLSearchParams({ institute, domain, year }).toString();
            try {
                const response = await fetch(`${API_BASE}/institute_analysis/rank_trend/parameters?${queryParams}`, {
                    method: "GET", headers: { "Accept": "application/json" }
                });
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                const empty = { tlr: 0, rpc: 0, go: 0, oi: 0, pr: 0, score: 0 };
                setParameters(data.parameters && typeof data.parameters === 'object' ? data.parameters : empty);
            } catch (error) {
                console.error("Error fetching parameters data:", error);
            }
        };
        fetchParams();
    }, [institute, domain, year]);

// Dependent effect for Research 
    useEffect(() => {
        const fetchResearch = async () => {
            if (!institute || !domain || !finyear) return;
            
            // Changed 'institute' to 'name' to match FastAPI parameters
            const queryParams = new URLSearchParams({ name: institute, domain, finyear }).toString(); 
            
            try {
                const response = await fetch(`${API_BASE}/institute_analysis/research?${queryParams}`, {
                    method: "GET", 
                    headers: { "Accept": "application/json" }
                });
                
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                
                const empty = { projects: 0, agencies: 0, amount: 0 };
                
                // Map backend keys to frontend state keys
                if (data.research && typeof data.research === 'object') {
                    setResearch({
                        projects: data.research.sponsored_projects || 0,
                        agencies: data.research.funding_agencies || 0,
                        amount: data.research.research_amount || 0
                    });
                } else {
                    setResearch(empty);
                }
            } catch (error) {
                console.error("Error fetching research data:", error);
                setResearch({ projects: 0, agencies: 0, amount: 0 }); // Fallback on error
            }
        };
        fetchResearch();
    }, [institute, domain, finyear]);

    // Dependent effect for Placement
    useEffect(() => {
        const fetchPlacement = async () => {
            if (!institute || !domain || !finyear || !program) return;
            
            // Changed 'institute' to 'name' to match FastAPI parameters
            const queryParams = new URLSearchParams({ name: institute, domain, finyear, program }).toString(); 
            
            try {
                const response = await fetch(`${API_BASE}/institute_analysis/placement?${queryParams}`, {
                    method: "GET", 
                    headers: { "Accept": "application/json" }
                });
                
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                
                const empty = { salary: 0, placed: 0, studies: 0, total: 0 };
                
                // Map backend keys to frontend state keys
                if (data.placement && typeof data.placement === 'object') {
                    setPlacement({
                        total: data.placement.grad_students || 0,
                        studies: data.placement.higher_studies || 0,
                        placed: data.placement.placed_students || 0,
                        salary: data.placement.median_salary || 0
                    });
                } else {
                    setPlacement(empty);
                }
            } catch (error) {
                console.error("Error fetching placement data:", error);
                setPlacement({ salary: 0, placed: 0, studies: 0, total: 0 }); // Fallback on error
            }
        };
        fetchPlacement();
    }, [institute, domain, finyear, program]);

    // Dependent effect for Budget (Pie Chart)
    useEffect(() => {
        const fetchPieData = async () => {
            if (!institute || !domain || !finyear) return;
            const queryParams = new URLSearchParams({ name: institute, domain, fin_year: finyear }).toString();
            try {
                const response = await fetch(`${API_BASE}/institute_analysis/budget?${queryParams}`, {
                    method: "GET", headers: { "Accept": "application/json" }
                });
                if (!response.ok) throw new Error("Network response was not ok");
                const result = await response.json();
                setPiedata(result.parameters ? result.parameters : {});
            } catch (error) {
                console.error("Error fetching budget data:", error);
                setPiedata({});
            }
        };
        fetchPieData();
    }, [institute, domain, finyear]); 

    return (
        <div className="flex w-full flex-col items-center bg-[#0b0f1a] px-4 py-8 text-gray-100 sm:px-8">
            <header className="mb-10 text-center">
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Institute level analysis
                </h1>
                <p className="mt-4 max-w-xl text-base text-gray-400">
                    Rank trends, NIRF parameter scores, and budget breakdown for a chosen institute.
                </p>
            </header>

            <div className="w-full max-w-6xl flex flex-col gap-8">
                {/* Upper Section: Controls & Trend Chart */}
                <div className="flex flex-col gap-8">
                    {/* Control Card */}
                    <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl h-fit">
                        <form onSubmit={fetchData} className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Domain</label>
                                <SearchableSelect options={domains} value={domain} onChange={setDomain} placeholder="Select Domain" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Institute</label>
                                <SearchableSelect options={institutes} value={institute} onChange={setInstitute} placeholder="Select Institute" />
                            </div>
                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-900/20 mb-0.5">
                                Get results
                            </button>
                        </form>
                    </div>

                    {/* Trend Chart Card */}
                    <div className="lg:col-span-2 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-500 mb-4">Ranking History</h2>
                        <div className="h-[280px] w-full">
                            <LineChart years={years} ranks={ranks}/>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Parameters Table Card */}
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">NIRF Parameter Scores</h2>
                            <span className="text-xs font-mono text-gray-500">Year:
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
                                    <tr className="bg-gray-800/30 text-gray-400 text-[11px] uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Parameter</th>
                                        <th className="px-6 py-4 font-semibold text-center">Value</th>
                                        <th className="px-6 py-4 font-semibold">Definition</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {param.map((p, index) => (
                                        <tr key={index} className="hover:bg-gray-800/40 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                {p.name}
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-cyan-400 text-lg">
                                                {p.value}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {p.def}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Shared Financial Year Selector Container */}
                    <div className="sticky top-4 z-50">
    {/* Dark overlay with blur effect behind the box */}
    <div className="absolute -inset-4 z-[-1] rounded-[2rem] bg-[#0b0f1a]/80 backdrop-blur-md" aria-hidden="true"></div>
    
    {/* The Financial Year Box */}
    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
        <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-500">Financial Year</h2>
            <p className="text-xs text-gray-500 mt-1">Select year for Research, Placements, and Budget stats</p>
        </div>
        <div className="min-w-[200px] sm:max-w-xs">
            <SearchableSelect 
                options={["2023-24", "2022-23", "2021-22"]} 
                value={finyear} 
                onChange={setFinYear} 
                placeholder="Select year" 
            />
        </div>
    </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Research Stats */}
                        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Research
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Funding Agencies</span>
                                    <span className="font-mono text-cyan-400 bg-gray-800/50 px-3 py-1 rounded-lg text-sm border border-gray-700/50">
                                        {research.agencies || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Sponsored Projects</span>
                                    <span className="font-mono text-cyan-400 bg-gray-800/50 px-3 py-1 rounded-lg text-sm border border-gray-700/50">
                                        {research.projects || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Total Amount Received</span>
                                    <span className="font-mono text-cyan-400 bg-gray-800/50 px-3 py-1 rounded-lg text-sm border border-gray-700/50">
                                        ₹ {research.amount?.toLocaleString('en-IN') || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Placement Stats */}
                        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Placements
                                </h3>
                                <div className="min-w-[200px] sm:max-w-xs">
                                    <SearchableSelect 
                                        options={["UG 4 year", "UG 5 year", "PG 2 year", "PG 3 year"]} 
                                        value={program} 
                                        onChange={setProgram} 
                                        placeholder="Program" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Students Graduated</span>
                                    <span className="font-mono text-green-400 bg-gray-800/50 px-3 py-1 rounded-lg text-sm border border-gray-700/50">
                                        {placement.total || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Selected for Higher Studies</span>
                                    <span className="font-mono text-green-400 bg-gray-800/50 px-3 py-1 rounded-lg text-sm border border-gray-700/50">
                                        {placement.studies || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Students Placed</span>
                                    <span className="font-mono text-green-400 bg-gray-800/50 px-3 py-1 rounded-lg text-sm border border-gray-700/50">
                                        {placement.placed || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Median Salary</span>
                                    <span className="font-mono text-green-400 bg-gray-800/50 px-3 py-1 rounded-lg text-sm border border-gray-700/50">
                                        ₹ {placement.salary?.toLocaleString('en-IN') || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart Card (Budget) */}
                    <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl sm:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="border-b border-gray-800 pb-6">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-500">Institute budget distribution</h2>
                                <p className="text-xs text-gray-500 mt-1">For financial year {finyear}</p>
                            </div>
                        </div>
                        <div className="h-[350px] w-full mt-4">
                            <Piechart data={data}/>
                        </div>
                        <p className="text-sm text-gray-400 text-center mt-4">
                            Share of each expenditure category in the institute budget for the selected year.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}