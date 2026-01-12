"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type AppClientProps = {
  email: string;
};

type TaskStatus = "active" | "completed" | "archived";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  created_at: string;
};

export default function AppClient({ email }: AppClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const handleSignOut = async () => {
    setStatus("loading");
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    const loadTasks = async () => {
      setLoadingTasks(true);
      setTaskError(null);
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setTaskError(error.message);
      } else {
        setTasks((data ?? []) as Task[]);
      }
      setLoadingTasks(false);
    };

    loadTasks();
  }, [supabase]);

  const setBusy = (taskId: string, isBusy: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (isBusy) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  };

  const handleAddTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      return;
    }

    setTaskError(null);
    const title = newTitle.trim();
    setNewTitle("");

    const { data, error } = await supabase
      .from("tasks")
      .insert({ title, status: "active" })
      .select("id, title, status, created_at")
      .single();

    if (error) {
      setTaskError(error.message);
      setNewTitle(title);
      return;
    }

    if (data) {
      setTasks((prev) => [data as Task, ...prev]);
    }
  };

  const handleDelete = async (taskId: string) => {
    setBusy(taskId, true);
    setTaskError(null);
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      setTaskError(error.message);
      setBusy(taskId, false);
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setBusy(taskId, false);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setBusy(taskId, true);
    setTaskError(null);
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select("id, title, status, created_at")
      .single();

    if (error) {
      setTaskError(error.message);
      setBusy(taskId, false);
      return;
    }

    if (data) {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? (data as Task) : task))
      );
    }

    setBusy(taskId, false);
  };

  const handleToggleComplete = async (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === "completed" ? "active" : "completed";
    await updateTask(task.id, { status: nextStatus });
  };

  const handleArchive = async (taskId: string) => {
    await updateTask(taskId, { status: "archived" });
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const submitEditing = async (taskId: string) => {
    if (!editingTitle.trim()) {
      return;
    }
    await updateTask(taskId, { title: editingTitle.trim() });
    cancelEditing();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Break It Down
          </p>
          <h1 className="text-2xl font-semibold">Your workspace</h1>
        </div>
        <button
          onClick={handleSignOut}
          disabled={status === "loading"}
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Signing out..." : "Logout"}
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-16">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">{email}</p>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">Add a task</h2>
              <p className="text-sm text-slate-400">
                Keep it top-level. Steps come later.
              </p>
            </div>
            <form onSubmit={handleAddTask} className="flex flex-col gap-3">
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Example: Plan the weekend trip"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-600"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Add task
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your tasks</h2>
            <span className="text-xs text-slate-400">
              {tasks.length} total
            </span>
          </div>

          {taskError ? (
            <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {taskError}
            </p>
          ) : null}

          {loadingTasks ? (
            <p className="mt-4 text-sm text-slate-400">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No tasks yet. Add one above.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {tasks.map((task) => {
                const isBusy = busyIds.has(task.id);
                const isEditing = editingId === task.id;
                return (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <StatusPill status={task.status} />
                          <span className="text-xs text-slate-500">
                            {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {isEditing ? (
                          <input
                            value={editingTitle}
                            onChange={(event) =>
                              setEditingTitle(event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
                          />
                        ) : (
                          <p
                            className={`text-base font-semibold ${
                              task.status === "archived"
                                ? "text-slate-500 line-through"
                                : task.status === "completed"
                                  ? "text-emerald-200 line-through"
                                  : "text-slate-100"
                            }`}
                          >
                            {task.title}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => submitEditing(task.id)}
                              disabled={isBusy}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={isBusy}
                              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(task)}
                              disabled={isBusy || task.status === "archived"}
                              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:text-slate-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleComplete(task)}
                              disabled={isBusy || task.status === "archived"}
                              className="rounded-full border border-emerald-500/50 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:text-slate-500"
                            >
                              {task.status === "completed"
                                ? "Mark active"
                                : "Complete"}
                            </button>
                            <button
                              onClick={() => handleArchive(task.id)}
                              disabled={isBusy || task.status === "archived"}
                              className="rounded-full border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:text-slate-500"
                            >
                              Archive
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              disabled={isBusy}
                              className="rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:text-slate-500"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: TaskStatus }) {
  const styles =
    status === "active"
      ? "bg-sky-500/10 text-sky-200 border-sky-500/40"
      : status === "completed"
        ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/40"
        : "bg-slate-500/10 text-slate-300 border-slate-500/40";

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${styles}`}
    >
      {status}
    </span>
  );
}
