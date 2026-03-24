import { useMemo } from "react";
import { useTaskStore } from "../store/taskStore";
import { useFilters } from "../hooks/useFilters";

export default function TimeLine() {
  const tasks = useTaskStore((s) => s.tasks);
  const { filters } = useFilters();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status.length && !filters.status.includes(task.status)) return false;
      if (filters.priority.length && !filters.priority.includes(task.priority)) return false;
      if (filters.assignee.length && !filters.assignee.includes(task.assignee)) return false;
      if (filters.from && new Date(task.dueDate) < new Date(filters.from)) return false;
      if (filters.to && new Date(task.dueDate) > new Date(filters.to)) return false;
      return true;
    });
  }, [tasks, filters]);

  const { min, max, range, dayWidth } = useMemo(() => {
    if (!filteredTasks.length) return { min: 0, max: 0, range: 1, dayWidth: 100 };
    const timestamps = filteredTasks.map((t) => new Date(t.dueDate).getTime());
    const minDate = Math.min(...timestamps) - 86400000 * 2; // 2 din ka buffer pehle
    const maxDate = Math.max(...timestamps) + 86400000 * 5; // 5 din ka buffer baad mein
    return { 
      min: minDate, 
      max: maxDate, 
      range: maxDate - minDate,
      dayWidth: 120 // Har din ki width pixels mein
    };
  }, [filteredTasks]);

  if (!filteredTasks.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800/60 m-6">
        <div className="text-4xl mb-4">📅</div>
        <p className="italic text-sm font-medium">No tasks match the selected timeline filters.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
      <style>{`
        .gantt-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .gantt-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .grid-bg {
          background-size: ${dayWidth}px 100%;
          background-image: linear-gradient(to right, rgba(51, 65, 85, 0.2) 1px, transparent 1px);
        }
      `}</style>

      <div className="flex-1 overflow-auto gantt-scroll rounded-2xl border border-slate-800/60 bg-slate-900/30 relative grid-bg">
        {/* Timeline Header (Dates) */}
        <div className="sticky top-0 z-20 flex bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
          {Array.from({ length: Math.ceil(range / 86400000) }).map((_, i) => {
            const date = new Date(min + i * 86400000);
            return (
              <div 
                key={i} 
                style={{ width: dayWidth, minWidth: dayWidth }}
                className="px-3 py-3 border-r border-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-tighter"
              >
                {date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
              </div>
            );
          })}
        </div>

        {/* Tasks Rows */}
        <div className="py-6 min-w-max">
          {filteredTasks.map((task) => {
            const due = new Date(task.dueDate).getTime();
            const offset = ((due - min) / range) * 100;

            const priorityStyles = 
              task.priority === "critical" ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" :
              task.priority === "high" ? "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]" :
              task.priority === "medium" ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" :
              "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]";

            return (
              <div key={task.id} className="h-16 relative flex items-center group">
                {/* Horizontal Guide Line */}
                <div className="absolute w-full h-[1px] bg-slate-800/30 group-hover:bg-slate-700/50 transition-colors" />
                
                {/* Task Bar */}
                <div
                  className={`absolute h-9 px-4 rounded-xl ${priorityStyles} flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group/bar`}
                  style={{ left: `${offset}%`, minWidth: '180px' }}
                >
                  <div className="w-5 h-5 rounded-md bg-black/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {task.assignee?.slice(0, 1)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {task.title}
                  </span>

                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-0 mb-3 hidden group-hover/bar:block z-30">
                    <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-2xl min-w-[200px]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{task.status}</div>
                      <div className="text-sm font-semibold text-white mb-2">{task.title}</div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Due: <b className="text-blue-400">{task.dueDate}</b></span>
                        <span className="text-slate-300 font-bold">{task.assignee}</span>
                      </div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45 -mt-1 ml-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}