import { useState, useRef, useMemo, useCallback } from "react";
import { useTaskStore } from "../store/taskStore";
import { useFilters } from "../hooks/useFilters";
import type { Status } from "../types/task";

const columns: { key: Status; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "review", label: "In Review" },
  { key: "done", label: "Done" },
];

export default function Kanban() {
  const { tasks, moveTask } = useTaskStore();
  const { filters } = useFilters();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<Status | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragWidth, setDragWidth] = useState(0);

  const offset = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number | null>(null);

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

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragWidth(rect.width);
    setDraggedId(id);
    setPos({ x: rect.left, y: rect.top });
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggedId) return;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(() => {
      setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const col = target?.closest("[data-col]")?.getAttribute("data-col") as Status;
      if (col !== hoverCol) setHoverCol(col ?? null);
    });
  }, [draggedId, hoverCol]);

  const handlePointerUp = () => {
    if (draggedId && hoverCol) moveTask(draggedId, hoverCol);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setDraggedId(null);
    setHoverCol(null);
  };

  return (
    <>
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex gap-5 h-[calc(100vh-140px)] px-6 overflow-x-auto select-none custom-scroll no-scrollbar"
      >
        {columns.map(({ key, label }) => {
          const columnTasks = filteredTasks.filter((t) => t.status === key);

          return (
            <div
              key={key}
              data-col={key}
              className={`flex flex-col w-80 min-w-[320px] rounded-2xl transition-all duration-300 ${
                hoverCol === key 
                  ? "bg-slate-800/80 ring-2 ring-blue-500/50 shadow-2xl" 
                  : "bg-slate-900/60 border border-slate-800/50"
              } p-4 pb-2`}
            >
              {/* HEADER - Increased Contrast */}
              <div className="flex items-center justify-between mb-5 px-1 sticky top-0 bg-inherit z-10 py-1">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    key === "todo" ? "bg-slate-500" : 
                    key === "inprogress" ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" : 
                    key === "review" ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  }`} />
                  <h3 className="text-[12px] font-bold text-slate-100 uppercase tracking-[0.15em]">{label}</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">
                  {columnTasks.length.toString().padStart(2, '0')}
                </span>
              </div>

              {/* TASK LIST */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scroll">
                {columnTasks.map((task) => {
                  const dragging = draggedId === task.id;

                  return (
                    <div key={task.id}>
                      {dragging && (
                        <div className="mb-3 rounded-xl border-2 border-dashed border-slate-700 h-24 bg-slate-800/30" />
                      )}

                      <div
                        onPointerDown={(e) => handlePointerDown(e, task.id)}
                        className={`group bg-slate-800 border border-slate-700/50 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all ${
                          dragging 
                            ? "fixed z-[1000] !m-0 rotate-[2deg] scale-[1.05] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-blue-500 ring-1 ring-blue-400/50 pointer-events-none" 
                            : "hover:bg-slate-700/80 hover:border-slate-500 hover:shadow-xl hover:-translate-y-1"
                        }`}
                        style={dragging ? { left: pos.x, top: pos.y, width: dragWidth } : undefined}
                      >
                        {/* Title - Clean White/Slate text */}
                        <div className="text-[14px] font-medium text-slate-100 mb-4 leading-relaxed group-hover:text-blue-100 transition-colors">
                          {task.title}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-blue-400">
                              {task.assignee?.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">{task.assignee}</span>
                          </div>

                          <div className={`text-[9px] font-black px-2 py-0.5 rounded border tracking-tighter ${
                            task.priority === "critical" ? "text-red-400 border-red-500/30 bg-red-500/10" : 
                            task.priority === "high" ? "text-orange-400 border-orange-500/30 bg-orange-500/10" : 
                            task.priority === "medium" ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : 
                            "text-slate-400 border-slate-500/30 bg-slate-500/10"
                          }`}>
                            {task.priority?.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}