import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import SearchableSelect from '../components/SearchableSelect';
import { API_BASE } from '../lib/api';

const API = `${API_BASE}/api`;
const TOP_RANK_LIMIT = 100;

const RANK_BRACKETS = [
  { from: 1, to: 25, fill: 'rgba(34, 211, 238, 0.09)' },
  { from: 26, to: 50, fill: 'rgba(139, 92, 246, 0.09)' },
  { from: 51, to: 75, fill: 'rgba(245, 158, 11, 0.09)' },
  { from: 76, to: 100, fill: 'rgba(244, 63, 94, 0.09)' },
];

const METRICS = [
  { key: 'rpc', label: 'RPC' },
  { key: 'tlr', label: 'TLR' },
  { key: 'pr', label: 'PR' },
];

// Helper component for the horizontal Top 5 Grid
function TopFiveGrid({ data }) {
  if (!data || data.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-500">No data available</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {data.map((i, idx) => (
        <div
          key={`${i.rank}-${i.name}-${idx}`}
          className="group flex flex-col items-center justify-center rounded-xl border border-gray-700/50 bg-[#1f2937]/40 p-5 text-center transition-all duration-300 hover:border-cyan-500/50 hover:bg-[#1f2937] hover:shadow-[0_0_15px_-3px_rgba(34,211,238,0.15)]"
        >
          <span className="mb-2 bg-gradient-to-br from-cyan-300 to-blue-500 bg-clip-text text-4xl font-black text-transparent">
            #{i.rank}
          </span>
          <span className="line-clamp-3 text-xs font-medium text-gray-300 group-hover:text-white">
            {i.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function Analytics() {
  const location = useLocation();
  const passedCategory = location.state?.selectedCategory;

  // Global Filter State
  const [domains, setDomains] = useState([]);
  const [domain, setDomain] = useState('');

  // Year-wise Section State
  const [year, setYear] = useState(2025);
  const [metric, setMetric] = useState('rpc');

  // 2025 Specific Data States
  const [topFive2025, setTopFive2025] = useState([]);
  const [newInst, setNewInst] = useState([]);
  const [rankChange, setRankChange] = useState([]);
  const [consistent, setConsistent] = useState([]);

  // Year-wise Data States
  const [topFiveYear, setTopFiveYear] = useState([]);
  const [graphData, setGraphData] = useState([]);

  const years = [2025, 2024, 2023];

  // Fetch Domains on mount and apply Router State
  useEffect(() => {
    const fallback = ['Overall', 'Engineering', 'Management', 'Research'];
    fetch(`${API_BASE}/institute_analysis/domains`)
      .then((res) => res.json())
      .then((d) => {
        const list = (d.domains || []).filter(Boolean).sort((a, b) => a.localeCompare(b));
        const next = list.length ? list : fallback;
        setDomains(next);
        
        setDomain((prev) => {
          // 1. If routed from dashboard card, select that specific category
          if (passedCategory && next.includes(passedCategory)) return passedCategory;
          // 2. Otherwise default behavior
          if (prev && next.includes(prev)) return prev;
          const overall = next.find((x) => /^overall$/i.test(String(x)));
          return overall || next[0] || '';
        });
      })
      .catch(() => {
        setDomains(fallback);
        setDomain((prev) => {
          if (passedCategory && fallback.includes(passedCategory)) return passedCategory;
          if (prev && fallback.includes(prev)) return prev;
          return 'Overall';
        });
      });
  }, [passedCategory]); // Rerun if the user clicks a different card on the dashboard

  const domainKey = domain ? domain.toLowerCase() : null;

  // Fetch 2025-Specific Analytics (Only depends on Domain)
  useEffect(() => {
    if (!domainKey) return;
    
    fetch(`${API}/top-five?domain=${encodeURIComponent(domainKey)}&year=2025`)
      .then((res) => res.json())
      .then(setTopFive2025)
      .catch(() => setTopFive2025([]));

    fetch(`${API}/new?domain=${encodeURIComponent(domainKey)}`)
      .then((res) => res.json())
      .then(setNewInst)
      .catch(() => setNewInst([]));

    fetch(`${API}/rank-change?domain=${encodeURIComponent(domainKey)}`)
      .then((res) => res.json())
      .then(setRankChange)
      .catch(() => setRankChange([]));

    fetch(`${API}/consistent?domain=${encodeURIComponent(domainKey)}`)
      .then((res) => res.json())
      .then(setConsistent)
      .catch(() => setConsistent([]));
  }, [domainKey]);

  // Fetch Year-wise Analytics (Depends on Domain AND Year)
  useEffect(() => {
    if (!domainKey) return;
    
    fetch(`${API}/top-five?domain=${encodeURIComponent(domainKey)}&year=${year}`)
      .then((res) => res.json())
      .then(setTopFiveYear)
      .catch(() => setTopFiveYear([]));

    fetch(`${API}/graph?domain=${encodeURIComponent(domainKey)}&year=${year}`)
      .then((res) => res.json())
      .then((rows) => {
        const data = Array.isArray(rows) ? rows : [];
        setGraphData(data);
      })
      .catch(() => setGraphData([]));
  }, [domainKey, year]);

  const growth = rankChange.filter((i) => i.change > 0).slice(0, 5);
  const drop = rankChange.filter((i) => i.change < 0).slice(0, 5);

  const graphTop100 = useMemo(() => {
    const rows = (graphData || [])
      .filter((r) => r != null && r.rank != null && Number(r.rank) >= 1)
      .map((r) => ({ ...r, rank: Number(r.rank) }))
      .sort((a, b) => a.rank - b.rank);
    return rows.filter((r) => r.rank <= TOP_RANK_LIMIT);
  }, [graphData]);

  const rankTicks = useMemo(
    () => [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    []
  );

  const metricLabel = METRICS.find((m) => m.key === metric)?.label ?? metric;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#0b0f1a] text-gray-100 sm:px-8">
      <Navbar />
      <header className="mb-12 text-center">
        <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
          Overall Analysis
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-gray-400">
          Cross-institution trends: top ranks, movers, consistency, and parameter vs rank analysis.
        </p>
      </header>

      <div className="flex w-full max-w-6xl flex-col gap-12">
        
        {/* GLOBAL DOMAIN FILTER */}
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-gray-800/80 bg-gradient-to-b from-[#111827] to-[#0b0f1a] p-6 text-center shadow-[0_0_30px_-10px_rgba(34,211,238,0.1)]">
          <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
          <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-cyan-400">
            Domain
          </label>
          <div className="mx-auto w-full max-w-xs text-left">
            <SearchableSelect
              options={domains}
              value={domain}
              onChange={setDomain}
              placeholder="Select domain"
            />
          </div>
        </div>

        {/* SECTION 1: 2025 ANALYTICS */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <div className="h-8 w-1 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            <h2 className="!text-3xl font-bold tracking-wide text-white">2025 Snapshot</h2>
          </div>

          <div className="flex flex-col gap-6">
            {/* Top 5 - Full Width Horizontal */}
            <Card title="Top 5 Institutions" subtitle="NIRF Rank · 2025">
              <TopFiveGrid data={topFive2025} />
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="New in 2025" subtitle="vs 2024 list" className="lg:col-span-2">                
            <ul className="max-h-[260px] space-y-2 overflow-y-auto text-sm">
                  {newInst.length === 0 && <li className="text-gray-500">None listed</li>}
                  {newInst.map((name, idx) => (
                    <li key={`${name}-${idx}`} className="flex items-center gap-3 rounded-lg border border-gray-800/50 bg-[#1f2937]/30 px-3 py-2 text-gray-200">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                      {name}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="Largest rank gains" subtitle="2024 → 2025">
                <ul className="space-y-3 text-sm">
                  {growth.length === 0 && <li className="text-gray-500">No data</li>}
                  {growth.map((i, idx) => (
                    <li key={`${i.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-gray-800/50 bg-[#1f2937]/30 px-3 py-2">
                      <span className="truncate pr-2 font-medium text-gray-200">{i.name}</span>
                      <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1">
                        <span className="text-xs font-mono text-emerald-400/70">{i.old_rank}</span>
                        <span className="text-[10px] text-emerald-500">→</span>
                        <span className="text-xs font-bold font-mono text-emerald-400">{i.new_rank}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="Largest rank drops" subtitle="2024 → 2025">
                <ul className="space-y-3 text-sm">
                  {drop.length === 0 && <li className="text-gray-500">No data</li>}
                  {drop.map((i, idx) => (
                    <li key={`${i.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-gray-800/50 bg-[#1f2937]/30 px-3 py-2">
                      <span className="truncate pr-2 font-medium text-gray-200">{i.name}</span>
                      <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1">
                        <span className="text-xs font-mono text-rose-400/70">{i.old_rank}</span>
                        <span className="text-[10px] text-rose-500">→</span>
                        <span className="text-xs font-bold font-mono text-rose-400">{i.new_rank}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card title="Consistent top performers" subtitle="Top 10 rank in ≥ 3 years">
              <div className="flex flex-wrap gap-3">
                {consistent.length === 0 && <span className="text-sm text-gray-500">No data</span>}
                {consistent.map((i, idx) => (
                  <span
                    key={`${i.name}-${idx}`}
                    className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-50 shadow-[0_0_10px_-2px_rgba(34,211,238,0.15)]"
                  >
                    {i.name}
                    <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                      {i.appearances}x
                    </span>
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <hr className="my-2 border-gray-800/60" />

        {/* SECTION 2: YEAR-WISE ANALYSIS */}
        <section>
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <h2 className="!text-3xl font-bold tracking-wide text-white">Year-wise Analysis</h2>
            </div>
            <div className="w-full sm:ml-4 sm:mt-1 sm:w-48">
              <SearchableSelect
                options={years}
                value={year}
                onChange={(v) => setYear(Number(v))}
                placeholder="Select year"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Card title={`Top 5 Institutions`} subtitle={`NIRF Rank · ${year}`}>
              <TopFiveGrid data={topFiveYear} />
            </Card>

            <Card title={`Parameter vs Rank (${year})`} subtitle={`Top ${TOP_RANK_LIMIT} ranks · Shaded by bracket`}>
              <div className="mb-4 flex flex-col gap-4 border-b border-gray-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-5 rounded-sm" style={{ background: RANK_BRACKETS[0].fill }} />
                    1–25
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-5 rounded-sm" style={{ background: RANK_BRACKETS[1].fill }} />
                    26–50
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-5 rounded-sm" style={{ background: RANK_BRACKETS[2].fill }} />
                    51–75
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-5 rounded-sm" style={{ background: RANK_BRACKETS[3].fill }} />
                    76–100
                  </span>
                </div>
                
                <div className="min-w-[200px] flex-1 sm:max-w-xs">
                  <span className="mb-2 block text-[10px] font-bold uppercase text-gray-500">Select Metric</span>
                  <SearchableSelect
                    options={METRICS.map((m) => m.label)}
                    value={METRICS.find((m) => m.key === metric)?.label ?? 'RPC'}
                    onChange={(label) => {
                      const k = METRICS.find((m) => m.label === label)?.key ?? 'rpc';
                      setMetric(k);
                    }}
                    placeholder="Metric"
                  />
                </div>
              </div>

              <div className="h-[450px] w-full pt-4">
                {graphTop100.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/20 text-sm text-gray-500">
                    No graph data for this selection
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphTop100} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                      {RANK_BRACKETS.map((b) => (
                        <ReferenceArea
                          key={`${b.from}-${b.to}`}
                          x1={b.from}
                          x2={b.to}
                          yAxisId={0}
                          fill={b.fill}
                          strokeOpacity={0}
                        />
                      ))}
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                      <XAxis
                        dataKey="rank"
                        type="number"
                        domain={[1, TOP_RANK_LIMIT]}
                        ticks={rankTicks}
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        label={{ value: 'NIRF rank', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
                      />
                      <YAxis
                        yAxisId={0}
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        label={{
                          value: metricLabel,
                          angle: -90,
                          position: 'insideLeft',
                          fill: '#6b7280',
                        }}
                      />
                      {[25, 50, 75].map((x) => (
                        <ReferenceLine
                          key={x}
                          x={x}
                          yAxisId={0}
                          stroke="#4b5563"
                          strokeDasharray="4 4"
                          strokeOpacity={0.85}
                        />
                      ))}
                      <Tooltip
                        contentStyle={{
                          background: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: 12,
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                        }}
                        labelFormatter={(r) => `Rank #${r}`}
                        formatter={(value, _name, item) => {
                          const name = item?.payload?.name;
                          return [
                            <span key="val" className="font-medium text-cyan-300">
                              {Number(value).toFixed(2)}{name ? ` · ${name}` : ''}
                            </span>,
                            <span key="metric" className="text-gray-400">{metricLabel}</span>,
                          ];
                        }}
                      />
                      <Line
                        yAxisId={0}
                        type="monotone"
                        dataKey={metric}
                        stroke="#22d3ee"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6, fill: '#22d3ee', stroke: '#0b0f1a', strokeWidth: 2 }}
                        isAnimationActive
                        animationDuration={600}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <p className="mt-4 text-center text-xs text-gray-500">
                Curved (monotone) fit across plotted ranks; vertical lines mark bracket boundaries.
              </p>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
}

// Upgraded Eye-Catching Card Component
function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-800/80 bg-gradient-to-b from-[#111827] to-[#0f1523] p-6 shadow-xl ${className}`}>
      <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">{title}</h2>
      {subtitle && <p className="mt-1 text-[11px] text-gray-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default Analytics;