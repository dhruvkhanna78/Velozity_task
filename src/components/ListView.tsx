import { useState, useMemo, useRef } from "react";
import { useTaskStore } from "../store/taskStore";
import { useFilters } from "../hooks/useFilters";
import type { Status, Task } from "../types/task";

type SortConfig = {
  key: keyof Task;
  direction: "asc" | "desc";
};

const ROW_HEIGHT = 56;
const BUFFER = 5;

const PRIORITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const normalizePriority = (p?: string) =>
  PRIORITY_ORDER[p?.toLowerCase() ?? ""] ?? 0;

export default function ListView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tasks = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const { filters } = useFilters();
  const [scrollTop, setScrollTop] = useState(0);

  /* FILTER LOGIC */
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

  /* SORT LOGIC */
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "dueDate",
    direction: "asc",
  });

  const requestSort = (key: keyof Task) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedTasks = useMemo(() => {
    const items = [...filteredTasks];
    items.sort((a, b) => {
      const A = a[sortConfig.key];
      const B = b[sortConfig.key];

      if (sortConfig.key === "priority") {
        const diff = normalizePriority(B as string) - normalizePriority(A as string);
        return sortConfig.direction === "asc" ? diff : -diff;
      }

      if (sortConfig.key === "dueDate") {
        const diff = new Date(A as string).getTime() - new Date(B as string).getTime();
        return sortConfig.direction === "asc" ? diff : -diff;
      }

      const diff = String(A ?? "").localeCompare(String(B ?? ""), undefined, { numeric: true, sensitivity: "base" });
      return sortConfig.direction === "asc" ? diff : -diff;
    });
    return items;
  }, [filteredTasks, sortConfig]);

  /* VIRTUAL SCROLL */
  const visibleRange = useMemo(() => {
    const viewportHeight = containerRef.current?.clientHeight ?? 600;
    const visibleRowCount = Math.ceil(viewportHeight / ROW_HEIGHT);
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
    const endIndex = Math.min(sortedTasks.length, startIndex + visibleRowCount + BUFFER * 2);
    return { startIndex, endIndex };
  }, [scrollTop, sortedTasks.length]);

  const visibleItems = sortedTasks.slice(visibleRange.startIndex, visibleRange.endIndex);
  const topSpacerHeight = visibleRange.startIndex * ROW_HEIGHT;
  const bottomSpacerHeight = (sortedTasks.length - visibleRange.endIndex) * ROW_HEIGHT;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] px-6 overflow-hidden">
      {/* Scrollbar Style */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      <div
        ref={containerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        className="flex-1 overflow-auto custom-scroll rounded-2xl border border-slate-800/60 bg-slate-900/40"
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.05)]">
            <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <SortableHeader label="Task Name" sortKey="title" config={sortConfig} onSort={requestSort} />
              <SortableHeader label="Priority" sortKey="priority" config={sortConfig} onSort={requestSort} />
              <th className="px-6 py-4 text-left">Assignee</th>
              <th className="px-6 py-4 text-left">Status</th>
              <SortableHeader label="Due Date" sortKey="dueDate" config={sortConfig} onSort={requestSort} />
            </tr>
          </thead>

          <tbody className="text-sm">
            {topSpacerHeight > 0 && <tr><td style={{ height: topSpacerHeight }} colSpan={5} /></tr>}

            {visibleItems.map((task) => (
              <tr
                key={task.id}
                style={{ height: ROW_HEIGHT }}
                className="group border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-6 py-3 font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                  {task.title}
                </td>

                <td className="px-6 py-3">
                  <PriorityBadge priority={task.priority} />
                </td>

                <td className="px-6 py-3 text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-blue-400">
                      {task.assignee?.slice(0, 2).toUpperCase()}
                    </div>
                    {task.assignee}
                  </div>
                </td>

                <td className="px-6 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => moveTask(task.id, e.target.value as Status)}
                    className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none hover:border-slate-500 transition-all"
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </td>

                <td className="px-6 py-3 font-mono text-xs text-slate-500">
                  {task.dueDate}
                </td>
              </tr>
            ))}

            {bottomSpacerHeight > 0 && <tr><td style={{ height: bottomSpacerHeight }} colSpan={5} /></tr>}
          </tbody>
        </table>

        {visibleItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic">
            No tasks found matching current filters.
          </div>
        )}
      </div>
    </div>
  );
}

function SortableHeader({ label, sortKey, config, onSort }: any) {
  const isActive = config.key === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="px-6 py-4 text-left cursor-pointer group transition-colors"
    >
      <div className={`flex items-center gap-2 ${isActive ? "text-blue-400" : "group-hover:text-slate-200"}`}>
        {label}
        <span className="text-[10px] font-normal opacity-50">
          {isActive ? (config.direction === "asc" ? "↑" : "↓") : "⇅"}
        </span>
      </div>
    </th>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const map: any = {
    critical: "text-red-400 border-red-500/30 bg-red-500/10",
    high: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    medium: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    low: "text-slate-400 border-slate-500/30 bg-slate-500/10",
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border ${map[priority ?? "low"]}`}>
      {priority ?? "Low"}
    </span>
  );
}