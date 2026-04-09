import React,{useState,useEffect} from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import SearchableSelect from '../components/SearchableSelect'
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

const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Piechart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={0} 
        outerRadius={80}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

export default function InstituteAnalysis() {
    const [institutes,setInstitutes]=useState([]);
    const [domains,setDomains]=useState([]);
    const [financialYear,setFinancialYear]=useState('2025-2024');
    const [institute, setInstitute] = useState("");
    const [domain, setDomain] = useState("");
    const [chartData, setChartData] = useState(null);
    const [years, setYears] = useState([]);
    const [ranks, setRanks] = useState([]);
    const [year, setYear] = useState("");
    

    useEffect(() => {
        const fetchDomains = async () => {
            const res = await fetch("http://127.0.0.1:8000/institute_analysis/domains");
            const data = await res.json();
            setDomains(data.domains);
        };

        fetchDomains();
    }, []);

    useEffect(() => {
        if (!domain) return;  

        const fetchInstitutes = async () => {
            const res = await fetch(
                `http://127.0.0.1:8000/institute_analysis/institutes?domain=${domain}`
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
                const response = await fetch(`http://127.0.0.1:8000/institute_analysis/rank_trend?${queryParams}`, {
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

    return (
        <div className="bg-[#0b0f1a] text-gray-100 min-h-screen p-8 flex flex-col items-center">
        {/* Header Section */}
        <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Institute Level Analysis
            </h1>
            <p className="text-gray-400 mt-2">Comprehensive performance metrics and trend analysis</p>
        </header>

        <div className="w-full max-w-4xl flex flex-col gap-8">
            
            {/* Upper Section: Controls & Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Card */}
            <div className="lg:col-span-1 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl h-fit">
                <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-6">Configuration</h2>
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
                    Generate Report
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

            {/* Lower Section: Data Stack (Table then Pie Chart) */}
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
                    <tr className="hover:bg-gray-800/40 transition-colors group">
                        <td className="px-6 py-4 font-bold text-white group-hover:text-cyan-400 transition-colors">TLR</td>
                        <td className="px-6 py-4 text-center font-mono text-cyan-400 text-lg">34.00</td>
                        <td className="px-6 py-4 text-sm text-gray-400">Teaching, Learning & Resources</td>
                    </tr>
                    {/* Additional rows here */}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pie Chart Card (Placed Directly Below) */}
            <div className="bg-[#111827] border border-gray-800 p-8 rounded-2xl shadow-xl">
                <div className="flex flex-col items-center">
                <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-8 self-start">Score Distribution</h2>
                <div className="w-full h-[350px]">
                    <Piechart />
                </div>
                <p className="text-[11px] text-gray-500 mt-6 text-center max-w-md">
                    The distribution above reflects the weighted contribution of each NIRF parameter to the total institutional score.
                </p>
                </div>
            </div>

            </div>
        </div>
        </div>
    );
}