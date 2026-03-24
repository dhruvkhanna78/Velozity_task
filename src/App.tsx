import { useEffect, useState } from "react";
import { generateTasks } from "./data/generateTasks";
import { useTaskStore } from "./store/taskStore";

import Kanban from "./components/Kanban";
import ListView from "./components/ListView";
import Timeline from "./components/TimeLine";
import FilterBar from "./components/FilterBar";

function App() {
  const setTasks = useTaskStore((s) => s.setTasks);
  const [view, setView] = useState("kanban");

  useEffect(() => {
    setTasks(generateTasks(500)); // requirement: test with 500 tasks
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-900">

      {/* Navbar */}
      <div className="p-4 flex gap-3">
        <button
          onClick={() => setView("kanban")}
          className="px-3 py-1 rounded bg-slate-700 text-white"
        >
          Kanban
        </button>

        <button
          onClick={() => setView("list")}
          className="px-3 py-1 rounded bg-slate-700 text-white"
        >
          List
        </button>

        <button
          onClick={() => setView("timeline")}
          className="px-3 py-1 rounded bg-slate-700 text-white"
        >
          Timeline
        </button>
      </div>

      {/* Filters */}
      <div className="px-4">
        <FilterBar />
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {view === "kanban" && <Kanban />}
        {view === "list" && <ListView />}
        {view === "timeline" && <Timeline />}
      </div>

    </div>
  );
}

export default App;