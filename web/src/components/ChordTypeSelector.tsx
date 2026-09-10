interface ChordTypeSelectorProps {
  suffixes: string[];
  selected?: string;
  onSelect: (suffix: string) => void;
  title?: string;
}

function suffixLabel(suffix: string): string {
  if (suffix === 'major') return 'Major';
  if (suffix === 'minor') return 'Minor';
  return suffix;
}

const ACTIVE =
  'rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-indigo-500';
const IDLE =
  'rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300';

export function ChordTypeSelector({ suffixes, selected, onSelect, title = 'Chord type' }: ChordTypeSelectorProps) {
  return (
    <div role="group" aria-label={title} className="flex flex-wrap justify-center gap-1">
      {suffixes.map((suffix) => (
        <button
          key={suffix}
          type="button"
          aria-pressed={suffix === selected}
          onClick={() => onSelect(suffix)}
          className={suffix === selected ? ACTIVE : IDLE}
        >
          {suffixLabel(suffix)}
        </button>
      ))}
    </div>
  );
}