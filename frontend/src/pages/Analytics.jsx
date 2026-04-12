import { useEffect, useState, useMemo } from 'react';
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

function Analytics() {
  const [domains, setDomains] = useState([]);
  const [domain, setDomain] = useState('');
  const [topYear, setTopYear] = useState(2025);
  const [graphYear, setGraphYear] = useState(2025);
  const [metric, setMetric] = useState('rpc');

  const [newInst, setNewInst] = useState([]);
  const [rankChange, setRankChange] = useState([]);
  const [consistent, setConsistent] = useState([]);
  const [topFive, setTopFive] = useState([]);
  const [graphData, setGraphData] = useState([]);

  const years = [2025, 2024, 2023];

  useEffect(() => {
    const fallback = ['Overall', 'Engineering', 'Management', 'Research'];
    fetch(`${API_BASE}/institute_analysis/domains`)
      .then((res) => res.json())
      .then((d) => {
        const list = (d.domains || []).filter(Boolean).sort((a, b) => a.localeCompare(b));
        const next = list.length ? list : fallback;
        setDomains(next);
        setDomain((prev) => {
          if (prev && next.includes(prev)) return prev;
          const overall = next.find((x) => /^overall$/i.test(String(x)));
          return overall || next[0] || '';
        });
      })
      .catch(() => {
        setDomains(fallback);
        setDomain((prev) => {
          if (prev && fallback.includes(prev)) return prev;
          return 'Overall';
        });
      });
  }, []);

  const domainKey = domain ? domain.toLowerCase() : null;

  useEffect(() => {
    if (!domainKey) return;
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

  useEffect(() => {
    if (!domainKey) return;
    fetch(`${API}/top-five?domain=${encodeURIComponent(domainKey)}&year=${topYear}`)
      .then((res) => res.json())
      .then(setTopFive)
      .catch(() => setTopFive([]));
  }, [domainKey, topYear]);

  useEffect(() => {
    if (!domainKey) return;
    fetch(`${API}/graph?domain=${encodeURIComponent(domainKey)}&year=${graphYear}`)
      .then((res) => res.json())
      .then((rows) => {
        setGraphData(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setGraphData([]));
  }, [domainKey, graphYear]);

  const growth = rankChange.filter((i) => i.change > 0).slice(0, 5);
  const drop = rankChange.filter((i) => i.change < 0).slice(0, 5);

  const graphTop100 = useMemo(() => {
    const rows = (graphData || [])
      .filter((r) => r != null && r.rank != null && Number(r.rank) >= 1)
      .map((r) => ({ ...r, rank: Number(r.rank) }))
      .sort((a, b) => a.rank - b.rank);
    return rows.filter((r) => r.rank <= TOP_RANK_LIMIT).slice(0, TOP_RANK_LIMIT);
  }, [graphData]);

  const rankTicks = useMemo(
    () => [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    []
  );

  const metricLabel = METRICS.find((m) => m.key === metric)?.label ?? metric;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#0b0f1a] px-4 py-8 text-gray-100 sm:px-8">
      <header className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Overall analysis
        </h1>
        <p className="mt-3 max-w-xl text-sm text-gray-400">
          Cross-institution trends: top ranks, movers, consistency, and parameter vs rank for the top 100
          (shaded by rank bracket).
        </p>
      </header>

      <div className="flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-cyan-500">
            Filters
          </span>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-gray-500">Domain</label>
              <SearchableSelect
                options={domains}
                value={domain}
                onChange={setDomain}
                placeholder="Select domain"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-gray-500">Top 5 year</label>
              <SearchableSelect
                options={years}
                value={topYear}
                onChange={(v) => setTopYear(Number(v))}
                placeholder="Year"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-gray-500">Graph year</label>
              <SearchableSelect
                options={years}
                value={graphYear}
                onChange={(v) => setGraphYear(Number(v))}
                placeholder="Year"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card title="Top 5" subtitle={`NIRF rank · ${topYear}`}>
            <ul className="space-y-3 text-sm">
              {topFive.length === 0 && <li className="text-gray-500">No data</li>}
              {topFive.map((i, idx) => (
                <li
                  key={`${i.rank}-${i.name}-${idx}`}
                  className="flex justify-between gap-4 border-b border-gray-800/80 pb-2 last:border-0"
                >
                  <span className="font-mono text-cyan-400">#{i.rank}</span>
                  <span className="text-right text-gray-200">{i.name}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="New in 2025" subtitle="vs 2024 list">
            <ul className="max-h-[220px] space-y-2 overflow-y-auto text-sm text-gray-300">
              {newInst.length === 0 && <li className="text-gray-500">None listed</li>}
              {newInst.map((name, idx) => (
                <li key={`${name}-${idx}`} className="border-b border-gray-800/60 pb-1.5 last:border-0">
                  {name}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Largest rank gains" subtitle="2024 → 2025">
            <ul className="space-y-2 text-sm">
              {growth.length === 0 && <li className="text-gray-500">No data</li>}
              {growth.map((i, idx) => (
                <li key={`${i.name}-${idx}`} className="text-gray-300">
                  <span className="font-medium text-white">{i.name}</span>
                  <span className="ml-2 font-mono text-emerald-400">
                    {i.old_rank} → {i.new_rank}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Largest rank drops" subtitle="2024 → 2025">
            <ul className="space-y-2 text-sm">
              {drop.length === 0 && <li className="text-gray-500">No data</li>}
              {drop.map((i, idx) => (
                <li key={`${i.name}-${idx}`} className="text-gray-300">
                  <span className="font-medium text-white">{i.name}</span>
                  <span className="ml-2 font-mono text-rose-400">
                    {i.old_rank} → {i.new_rank}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card title="Consistent top performers" subtitle="Top 10 rank in ≥ 3 years">
          <div className="flex flex-wrap gap-2">
            {consistent.length === 0 && <span className="text-sm text-gray-500">No data</span>}
            {consistent.map((i, idx) => (
              <span
                key={`${i.name}-${idx}`}
                className="rounded-lg border border-gray-700 bg-gray-800/40 px-3 py-1.5 text-xs text-gray-200"
              >
                {i.name}{' '}
                <span className="font-mono text-cyan-400/90">({i.appearances})</span>
              </span>
            ))}
          </div>
        </Card>

        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
          <div className="mb-4 flex flex-col gap-4 border-b border-gray-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">
                Parameter vs rank
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Top {TOP_RANK_LIMIT} ranks · brackets 1–25, 26–50, 51–75, 76–100
              </p>
            </div>
            <div className="min-w-[200px] flex-1 sm:max-w-xs">
              <span className="mb-2 block text-[10px] font-bold uppercase text-gray-500">Metric</span>
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

          <div className="mb-3 flex flex-wrap gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm" style={{ background: RANK_BRACKETS[0].fill }} />
              1–25
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm" style={{ background: RANK_BRACKETS[1].fill }} />
              26–50
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm" style={{ background: RANK_BRACKETS[2].fill }} />
              51–75
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm" style={{ background: RANK_BRACKETS[3].fill }} />
              76–100
            </span>
          </div>

          <div className="h-[400px] w-full">
            {graphTop100.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-700 text-sm text-gray-500">
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
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    label={{ value: 'NIRF rank', position: 'insideBottom', offset: -2, fill: '#6b7280' }}
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
                      borderRadius: 8,
                    }}
                    labelFormatter={(r) => `Rank #${r}`}
                    formatter={(value, _name, item) => {
                      const name = item?.payload?.name;
                      return [
                        `${Number(value).toFixed(2)}${name ? ` · ${name}` : ''}`,
                        metricLabel,
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
                    activeDot={{ r: 5 }}
                    isAnimationActive
                    animationDuration={450}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="mt-3 text-center text-[11px] text-gray-500">
            Curved (monotone) fit across plotted ranks; vertical lines mark bracket boundaries.
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-xl">
      <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">{title}</h2>
      {subtitle && <p className="mt-1 text-[11px] text-gray-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default Analytics;
