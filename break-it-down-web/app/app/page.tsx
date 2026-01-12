import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Step, Task } from "@/lib/types";
import AppClient from "./AppClient";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false });

  const taskIds = (tasks ?? []).map((task) => task.id);
  let steps: Step[] = [];
  if (taskIds.length > 0) {
    const { data: stepsData } = await supabase
      .from("steps")
      .select("id, task_id, step_index, text, done")
      .in("task_id", taskIds)
      .order("step_index", { ascending: true });
    steps = (stepsData ?? []) as Step[];
  }

  return (
    <AppClient
      email={user.email ?? ""}
      initialTasks={(tasks ?? []) as Task[]}
      initialSteps={steps}
    />
  );
}
