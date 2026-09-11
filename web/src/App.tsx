import { useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { loadChordDatabases } from '@shared/engine/chord_engine';
import { bumpDataEpoch, selectInstrument, selectTheme, toggleTheme } from '@shared/store';
import { useAppDispatch, useAppSelector } from './hooks';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ChordPage } from './pages/ChordPage';
import { ScalesPage } from './pages/ScalesPage';
import { TheoryPage } from './pages/TheoryPage';
import { SongsPage } from './pages/SongsPage';
import { SongViewPage } from './pages/SongViewPage';
import { SubmitSongPage } from './pages/SubmitSongPage';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/songs', label: 'Songs' },
  { to: '/submit', label: 'Submit' },
  { to: '/scales', label: 'Scales' },
  { to: '/theory', label: 'Theory' },
];

const NAV_ACTIVE =
  'rounded-md bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-white';
const NAV_IDLE =
  'rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

export default function App() {
  const theme = useAppSelector(selectTheme);
  const instrument = useAppSelector(selectInstrument);
  const dispatch = useAppDispatch();
  const [loadingInstrument, setLoadingInstrument] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    let active = true;
    setLoadingInstrument(true);
    loadChordDatabases(instrument).then(() => {
      if (!active) return;
      dispatch(bumpDataEpoch());
      setLoadingInstrument(false);
    });
    return () => {
      active = false;
    };
  }, [instrument, dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div
        role="progressbar"
        aria-label="Loading chord data"
        aria-hidden={!loadingInstrument}
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-transparent transition-opacity duration-200 ${
          loadingInstrument ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] bg-indigo-500 dark:bg-indigo-400" />
      </div>
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
          <Route path="/songs" element={<SongsPage />} />
          <Route path="/song/:id" element={<SongViewPage />} />
          <Route path="/submit" element={<SubmitSongPage />} />
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