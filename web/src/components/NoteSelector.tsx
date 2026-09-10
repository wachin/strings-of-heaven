import { ALL_KEYS } from '@shared/engine/chord_engine';

interface NoteSelectorProps {
  selected: string;
  onSelect: (key: string) => void;
  title?: string;
}

const ACTIVE =
  'rounded-md bg-indigo-600 px-2.5 py-1 text-sm font-semibold text-white dark:bg-indigo-500';
const IDLE =
  'rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300';

export function NoteSelector({ selected, onSelect, title = 'Root note' }: NoteSelectorProps) {
  return (
    <div role="group" aria-label={title} className="flex flex-wrap justify-center gap-1">
      {ALL_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          aria-pressed={key === selected}
          onClick={() => onSelect(key)}
          className={key === selected ? ACTIVE : IDLE}
        >
          {key}
        </button>
      ))}
    </div>
  );
}