import { switchInstrument } from '@shared/store';
import { selectInstrument } from '@shared/store';
import type { Instrument } from '@shared/types';
import { useAppDispatch, useAppSelector } from '../hooks';

const INSTRUMENTS: { id: Instrument; label: string }[] = [
  { id: 'guitar', label: 'Guitar' },
  { id: 'piano', label: 'Piano' },
  { id: 'ukulele', label: 'Ukulele' },
];

const ACTIVE =
  'rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow dark:bg-indigo-500';
const IDLE =
  'rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800';

export function InstrumentToggle({ className = '' }: { className?: string }) {
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectInstrument);

  return (
    <div
      role="group"
      aria-label="Instrument"
      className={`inline-flex flex-wrap justify-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900 ${className}`}
    >
      {INSTRUMENTS.map((instrument) => (
        <button
          key={instrument.id}
          type="button"
          aria-pressed={active === instrument.id}
          onClick={() => dispatch(switchInstrument(instrument.id))}
          className={active === instrument.id ? ACTIVE : IDLE}
        >
          {instrument.label}
        </button>
      ))}
    </div>
  );
}