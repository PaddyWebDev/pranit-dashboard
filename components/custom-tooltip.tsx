export default function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: p.color }}
          />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {typeof p.value === "number"
              ? p.value.toLocaleString("en-IN")
              : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}
