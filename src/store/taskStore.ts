import { create } from "zustand";
import type { Task, Status } from "../types/task";

type TaskStore = {
  tasks: Task[];
  draggedTaskId: string | null;
  setTasks: (tasks: Task[]) => void;
  setDraggedTask: (id: string | null) => void;
  moveTask: (id: string, status: Status) => void;
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  draggedTaskId: null,

  setTasks: (tasks) => set({ tasks }),

  setDraggedTask: (id) =>
    set({ draggedTaskId: id }),

  moveTask: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, status }
          : task
      ),
    })),
}));