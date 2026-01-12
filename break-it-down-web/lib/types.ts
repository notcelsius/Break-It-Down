export type TaskStatus = "active" | "completed" | "archived";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  created_at: string;
};

export type Step = {
  id: string;
  task_id: string;
  step_index: number;
  text: string;
  done: boolean;
};
