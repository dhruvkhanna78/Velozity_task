type ViewType = "kanban" | "list" | "timeline";

interface Props {
  view: ViewType;
  setView: (view: ViewType) => void;
}

export default function ViewNavbar({ view, setView }: Props) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      
      {/* View Switcher */}
      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
        {(["kanban", "list", "timeline"] as ViewType[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1 text-xs font-bold rounded transition-all ${
              view === v
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Simplified Presence (No External Import needed) */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white ${
                i === 1 ? 'bg-pink-500' : i === 2 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            >
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
          3 Users Live
        </span>
      </div>
    </div>
  );
}