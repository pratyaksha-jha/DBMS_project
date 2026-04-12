import IndiaMap from '../components/IndiaMap';

export default function Dashboard() {
  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-8 sm:px-8">
      <header className="mb-8 max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          National rankings overview
        </h1>
        <p className="mt-3 text-sm text-gray-400 sm:text-base">
          NIRF 2025 overall rankings: hover states for top institutes, markers for located campuses.
        </p>
      </header>
      <div className="w-full max-w-5xl rounded-2xl border border-gray-800 bg-[#111827] p-4 shadow-xl sm:p-6">
        <IndiaMap />
      </div>
    </div>
  );
}
