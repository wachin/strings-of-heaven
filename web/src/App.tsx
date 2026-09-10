import { useEffect } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { selectTheme, toggleTheme } from '@shared/store';
import { useAppDispatch, useAppSelector } from './hooks';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ChordPage } from './pages/ChordPage';
import { ScalesPage } from './pages/ScalesPage';
import { TheoryPage } from './pages/TheoryPage';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/scales', label: 'Scales' },
  { to: '/theory', label: 'Theory' },
];

const NAV_ACTIVE =
  'rounded-md bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-white';
const NAV_IDLE =
  'rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

export default function App() {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <NavLink to="/" className="text-lg font-bold tracking-tight">
            Strings of Heaven
          </NavLink>
          <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => (isActive ? NAV_ACTIVE : NAV_IDLE)}
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle dark mode"
              className="ml-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/chord/:key/:suffix" element={<ChordPage />} />
          <Route path="/scales" element={<ScalesPage />} />
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
          Strings of Heaven — open source, MIT licensed. Chord data from chords-db (MIT).
        </div>
      </footer>
    </div>
  );
}