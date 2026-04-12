import React,{useState,useEffect} from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip , Legend } from 'chart.js';

import { PieChart, Pie, Cell, ResponsiveContainer,Tooltip as RechartsTooltip } from 'recharts';
import SearchableSelect from '../components/SearchableSelect';
import { API_BASE } from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const LineChart = ({ years, ranks }) => {
  if (!ranks || ranks.length === 0) return <p className="text-gray-400">No data available</p>;

  const validRanks = ranks.filter(r => r !== null);
  
  
  if (validRanks.length === 0) return <p className="text-gray-400">No ranking data found</p>;

  const minRank = Math.min(...validRanks);
  const maxRank = Math.max(...validRanks);

  const data = {
    labels: years,
    datasets: [
      {
        data: ranks,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: (ctx) => {
          const value = ctx.raw;
          if (value === minRank) return '#157b12'; // Best rank
          if (value === maxRank) return '#FF8042'; // Worst rank
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
        callbacks: {
          label: (context) => `Rank: ${context.raw}`,
        },
      },
      title: { display: true, text: 'Rank Trend' },
    },
    scales: {
      x: { title: { display: true, text: 'Year' } }, 
      y: {
        reverse: true,
        beginAtZero: false,
        suggestedMin: minRank - 2,
        suggestedMax: maxRank + 2,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'NIRF Rank' }, 
      },
    },
  };

  return <Line data={data} options={options} />;
};







// ==========================================
// 2. UPGRADED PIE (DONUT) CHART COMPONENT
// ==========================================
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6666', '#4CAF50']; 

// 1. New Custom Label: Draws lines outside the pie and stacks text neatly
const renderCustomizedLabel = ({ cx, cy, x, y, name, value, percent, textAnchor }) => {
  // Hide labels for very tiny slices (under 2%) to prevent text overlap
  if (percent < 0.02) return null; 

  return (
    <g>
      <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central">
        {/* Top line: Category Name (Gray) */}
        <tspan x={x} dy="-0.5em" fill="#9ca3af" fontSize="10px" className="font-medium tracking-wide">
          {name}
        </tspan>
        {/* Bottom line: Currency Amount + Percentage (Cyan) */}
        <tspan x={x} dy="1.4em" fill="#22d3ee" fontSize="12px" className="font-bold">
          ₹ {value.toLocaleString('en-IN')} ({(percent * 100).toFixed(0)}%)
        </tspan>
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f2937] border border-gray-700 p-3 rounded-lg shadow-2xl">
        <p className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
            {payload[0].name}
        </p>
        <p className="text-white font-mono text-sm">
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
              <p className="text-gray-500 text-sm">No budget data available for this selection</p>
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
          innerRadius={50} // Shrunk slightly to leave room for outer text
          outerRadius={80} // Shrunk slightly to leave room for outer text
          fill="#8884d8"
          paddingAngle={4} 
          dataKey="value"
          labelLine={{ stroke: '#4b5563', strokeWidth: 1 }} // Adds the subtle gray connecting lines
          label={renderCustomizedLabel} // Applies our new outer labels
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none"/>
          ))}
        </Pie>
        <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
        {/* Removed the Legend here, because the labels now show the names clearly! */}
      </PieChart>
    </ResponsiveContainer>
  );
};
export default function InstituteAnalysis() {
    const [institutes,setInstitutes]=useState([]);
    const [domains,setDomains]=useState([]);
    const [institute, setInstitute] = useState("");
    const [domain, setDomain] = useState("");
    const [years, setYears] = useState([]);
    const [ranks, setRanks] = useState([]);
    const [year, setYear] = useState("");
    const [parameters,setParameters]=useState({"tlr":0,"rpc":0,"go":0,"oi":0,"pr":0,"score":0})
    const [piedata,setPiedata]=useState({});
    const [finyear,setFinYear]=useState("2023-24");
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
    const param=[{
        "name":"TLR",
        "value":parameters["tlr"],
        "def":"Teaching,Learning and resources"
    },
    {
        "name":"RPC",
        "value":parameters["rpc"],
        "def":"Research,patents and citations",
    },
    {
        "name":"GO",
        "value":parameters["go"],
        "def":"Growth and outcome",
    },
    {
        "name":"OI",
        "value":parameters["oi"],
        "def":"Outreach and inclusivity",
    },
    {
        "name":"PR",
        "value":parameters["pr"],
        "def":"Peer perception",
    },
    {
        "name":"Total score",
        "value":parameters["score"],
        "def":"Total score(This decides the rank)",
    }

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
            const res = await fetch(
                `${API_BASE}/institute_analysis/institutes?domain=${encodeURIComponent(domain)}`
            );
            const data = await res.json();
            setInstitutes(data.institutes);
        };

        fetchInstitutes();
    }, [domain]);

    useEffect(() => {
        if (domains.length > 0) {
            setDomain(domains[0]);
        }
    }, [domains]);

    useEffect(() => {
        if (institutes.length > 0) {
            setInstitute(institutes[0]);
        }
    }, [institutes]);

    const fetchData=async(e)=>{
        e.preventDefault();
        const queryParams = new URLSearchParams({
            institute: institute,
            domain: domain
            }).toString();
            try {
                const response = await fetch(`${API_BASE}/institute_analysis/rank_trend?${queryParams}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                    }
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

    useEffect(()=>{
        fetchParams();
    },[institute,domain,year]);

    const fetchParams=async()=>{
        
        const queryParams = new URLSearchParams({
            institute: institute,
            domain: domain,
            year:year
            }).toString();
            try {
                const response = await fetch(`${API_BASE}/institute_analysis/rank_trend/parameters?${queryParams}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                    }
                });

                if (!response.ok) throw new Error("Network response was not ok");

                const data = await response.json();
                
                
                const empty = { tlr: 0, rpc: 0, go: 0, oi: 0, pr: 0, score: 0 };
                setParameters(data.parameters && typeof data.parameters === 'object' ? data.parameters : empty);
            } catch (error) {
                console.error("Error fetching parameters data:", error);
            }
        
    };

    useEffect(() => {
        const fetchPieData = async () => {
            if (!institute || !domain || !finyear) return;

            
            const queryParams = new URLSearchParams({
                name: institute, 
                domain: domain,
                fin_year: finyear 
            }).toString();

            try {
                const response = await fetch(`${API_BASE}/institute_analysis/budget?${queryParams}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                    }
                });

                if (!response.ok) throw new Error("Network response was not ok");

                const result = await response.json();
                
                
                if (result.parameters) {
                    setPiedata(result.parameters);
                } else {
                    setPiedata({});
                }
                
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
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Institute level analysis
            </h1>
            <p className="mt-3 max-w-xl text-sm text-gray-400">
              Rank trends, NIRF parameter scores, and budget breakdown for a chosen institute.
            </p>
        </header>

        <div className="w-full max-w-4xl flex flex-col gap-8">
            
            {/* Upper Section: Controls & Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Card */}
            <div className="lg:col-span-1 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl h-fit">
                
                <form onSubmit={fetchData} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Domain</label>
                    <SearchableSelect options={domains} value={domain} onChange={setDomain} placeholder="Select Domain" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Institute</label>
                    <SearchableSelect options={institutes} value={institute} onChange={setInstitute} placeholder="Select Institute" />
                </div>
                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-900/20 mt-2">
                    Get results
                </button>
                </form>
            </div>

            {/* Trend Chart Card */}
            <div className="lg:col-span-2 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
                <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-4">Ranking History</h2>
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
                <span className="text-xs font-mono text-gray-500">Current Year:
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
                    
                    {/* Additional rows here */}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pie Chart Card (Placed Directly Below) */}
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl sm:p-8">
                <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">Institute budget distribution</h2>
                <div className="min-w-[200px] sm:max-w-xs">
                <span className="mb-2 block text-[10px] font-bold uppercase text-gray-500">Financial year</span>
                <SearchableSelect 
                        options={["2023-24", "2022-23", "2021-22"]} 
                        value={finyear} 
                        onChange={setFinYear} 
                        placeholder="Select year" 
                        />
                </div>
                </div>
                <div className="h-[350px] w-full">
                    <Piechart data={data}/>
                </div>
                <p className="max-w-md text-center text-[11px] text-gray-500">
                    Share of each expenditure category in the institute budget for the selected year.
                </p>
                </div>
            </div>

            </div>
        </div>
        </div>
    );
}