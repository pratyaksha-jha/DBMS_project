import { NavLink, Outlet } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  [
    'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
    isActive
      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
      : 'text-gray-400 hover:bg-gray-800 hover:text-cyan-300',
  ].join(' ');

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f1a] text-gray-100">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#111827]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            NIRF Explorer
          </span>
          <nav className="flex flex-wrap gap-2" aria-label="Main">
            <NavLink to="/" end className={linkClass}>
              India map
            </NavLink>
            <NavLink to="/institute_analysis" className={linkClass}>
              Institute analysis
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex w-full flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
