import { useFilters } from "../hooks/useFilters";

const statuses = ["todo", "inprogress", "review", "done"];
const priorities = ["low", "medium", "high", "critical"];
const assignees = ["AB", "RK", "TS", "MK"];

export default function FilterBar() {
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useFilters();

  const toggleMulti = (key: string, value: string) => {
    const current = filters[key as keyof typeof filters] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, next);
  };

  return (
    <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl backdrop-blur-md">
      
      {/* STATUS GROUP */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</span>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => toggleMulti("status", s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                filters.status.includes(s)
                  ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-10 w-[1px] bg-slate-800 self-end hidden md:block" />

      {/* PRIORITY GROUP */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority</span>
        <div className="flex gap-2">
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => toggleMulti("priority", p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                filters.priority.includes(p)
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-10 w-[1px] bg-slate-800 self-end hidden md:block" />

      {/* DATE RANGE */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Timeframe</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter("from", e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
          />
          <span className="text-slate-600 text-xs">to</span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter("to", e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
          />
        </div>
      </div>

      {/* CLEAR BUTTON */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="ml-auto self-end px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all"
        >
          RESET ALL
        </button>
      )}
    </div>
  );
}