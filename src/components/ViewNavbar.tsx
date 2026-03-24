import React from "react";

type ViewType = "kanban" | "list" | "timeline";

interface Props {
  view: ViewType;
  setView: (view: ViewType) => void;
  filter: string;
  setFilter: (value: string) => void;
}

export default function ViewNavbar({
  view,
  setView,
  filter,
  setFilter,
}: Props) {
  return (
    <div style={container}>
      <div style={toggle}>
        {["kanban", "list", "timeline"].map((v) => (
          <button
            key={v}
            style={btn(view === v)}
            onClick={() => setView(v as ViewType)}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={filterStyle}
      >
        <option value="all">All Tasks</option>
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
  );
}

const container: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const toggle: React.CSSProperties = {
  display: "flex",
  background: "#111827",
  borderRadius: 8,
  padding: 4,
};

const btn = (active: boolean): React.CSSProperties => ({
  padding: "6px 14px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontWeight: 500,
  background: active ? "#2563eb" : "transparent",
  color: active ? "#fff" : "#9ca3af",
});

const filterStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
};