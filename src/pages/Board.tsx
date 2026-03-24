import { useState } from "react";
import ViewNavbar from "../components/ViewNavbar";
import Kanban from "../components/Kanban";
import ListView from "../components/ListView";
import TimeLine from "../components/TimeLine";
import FilterBar from "../components/FilterBar"; // FilterBar ko yahan add kiya hai

type ViewType = "kanban" | "list" | "timeline";

export default function Board() {
  const [view, setView] = useState<ViewType>("kanban");

  return (
    // Main Container: Full screen, Dark Background
    <div className="min-h-screen bg-[#0f172a] flex flex-col font-sans text-slate-200">
      
      {/* Top Navbar */}
      <ViewNavbar view={view} setView={setView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        
        {/* Filter Section - Isko Navbar ke niche rakha hai taaki views clean rahein */}
        <FilterBar />

        {/* Dynamic View Rendering */}
        <div className="flex-1 flex overflow-hidden">
          {view === "kanban" && <Kanban />}
          {view === "list" && <ListView />}
          {view === "timeline" && <TimeLine />}
        </div>
      </main>

    </div>
  );
}