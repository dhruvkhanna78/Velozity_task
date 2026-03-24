import type { Task } from "../types/task";

const statuses = [
  "todo",
  "inprogress",
  "review",
  "done",
] as const;

const priorities = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

const assignees = ["AB", "RK", "TS", "MK"];

// Random date generator (±30 days window)
const randomDueDate = () => {
  const today = new Date();

  const offset =
    Math.floor(Math.random() * 60) - 30; // -30 to +30 days

  const date = new Date(today);
  date.setDate(today.getDate() + offset);

  return date.toISOString().split("T")[0];
};

export const generateTasks = (
  count: number
): Task[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),

    title: `Task ${i + 1}`,

    status:
      statuses[
        Math.floor(Math.random() * statuses.length)
      ],

    priority:
      priorities[
        Math.floor(Math.random() * priorities.length)
      ],

    assignee:
      assignees[
        Math.floor(Math.random() * assignees.length)
      ],

    dueDate: randomDueDate(),
  }));
};