interface Bar {
  label: string;
  value: number;
  toneClass: string;
}

export function SimpleBarChart({ bars }: { bars: Bar[] }) {
  const max = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div className="space-y-3">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3 text-sm">
          <span className="w-40 truncate text-slate-600">{b.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${b.toneClass}`}
              style={{ width: `${(b.value / max) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right font-medium text-slate-700">{b.value}</span>
        </div>
      ))}
      {bars.length === 0 && <p className="text-sm text-slate-400">Belum ada data untuk ditampilkan.</p>}
    </div>
  );
}
