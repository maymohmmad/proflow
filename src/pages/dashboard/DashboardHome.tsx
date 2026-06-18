import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { theme as t } from "../../theme";

type Project = {
  id: number;
  name: string;
  status: string;
  project_type: string;
};

type Task = {
  id: number;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  project_id: number;
  title: string;
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projRes = await api.get("/projects");
      setProjects(projRes.data);
      const allTasks: Task[] = [];
      for (const proj of projRes.data) {
        const taskRes = await api.get(`/projects/${proj.id}/tasks`);
        allTasks.push(...taskRes.data);
      }
      setTasks(allTasks);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  // Real stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Recent projects with progress
  const recentProjects = projects.slice(0, 5).map((p) => {
    const projTasks = tasks.filter((task) => task.project_id === p.id);
    const projDone = projTasks.filter((task) => task.status === "done").length;
    const pct = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;
    return { ...p, pct, total: projTasks.length, done: projDone };
  });

  // Recent tasks
  const recentTasks = tasks.slice(0, 5);

  const getProjectName = (id: number) =>
    projects.find((p) => p.id === id)?.name || "—";

  const priorityStyle = (p: string): React.CSSProperties => {
    if (p === "high") return { background: t.dangerBg, color: t.danger };
    if (p === "medium") return { background: t.warningBg, color: "#f59e0b" };
    return { background: t.successBg, color: t.success };
  };

  const projColors = [t.accent, t.success, "#f59e0b", t.danger, "#8b5cf6"];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
        <div style={{ fontSize: "14px", color: t.textMuted }}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>
        Welcome back, {user?.name} 👋
      </h2>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "24px" }}>
        Here's what's happening with your projects today.
      </p>

      {/* Stats */}
      <div style={s.statsGrid}>
        <div style={{ ...s.statCard, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={s.statIcon}>📁</div>
          <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "6px" }}>Total projects</div>
          <div style={{ fontSize: "30px", fontWeight: 700, color: t.accent }}>{totalProjects}</div>
          <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "4px" }}>{activeProjects} active</div>
        </div>

        <div style={{ ...s.statCard, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={s.statIcon}>✅</div>
          <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "6px" }}>Tasks completed</div>
          <div style={{ fontSize: "30px", fontWeight: 700, color: t.success }}>{doneTasks}</div>
          <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "4px" }}>of {totalTasks} total</div>
        </div>

        <div style={{ ...s.statCard, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={s.statIcon}>⚡</div>
          <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "6px" }}>In progress</div>
          <div style={{ fontSize: "30px", fontWeight: 700, color: "#f59e0b" }}>{inProgressTasks}</div>
          <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "4px" }}>tasks doing</div>
        </div>

        <div style={{ ...s.statCard, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={s.statIcon}>📊</div>
          <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "6px" }}>Completion rate</div>
          <div style={{ fontSize: "30px", fontWeight: 700, color: t.accent }}>{completionRate}%</div>
          <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "4px" }}>overall progress</div>
        </div>
      </div>

      <div style={s.grid2}>
        {/* Recent Projects */}
        <div style={{ ...s.card, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={s.cardHeader}>
            <div style={s.cardTitle}>Recent projects</div>
            <span style={{ fontSize: "12px", color: t.accent, cursor: "pointer" }}>View all</span>
          </div>

          {recentProjects.length === 0 ? (
            <div style={{ fontSize: "13px", color: t.textMuted, textAlign: "center", padding: "24px 0" }}>
              No projects yet
            </div>
          ) : (
            recentProjects.map((p, i) => (
              <div key={p.id} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: projColors[i % projColors.length], flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: t.textPrimary }}>{p.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: t.textMuted }}>{p.done}/{p.total} tasks</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: projColors[i % projColors.length] }}>{p.pct}%</span>
                  </div>
                </div>
                <div style={{ height: "5px", background: t.border, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.pct}%`, background: projColors[i % projColors.length], borderRadius: "3px", transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Tasks */}
        <div style={{ ...s.card, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={s.cardHeader}>
            <div style={s.cardTitle}>Recent tasks</div>
            <span style={{ fontSize: "12px", color: t.accent, cursor: "pointer" }}>View all</span>
          </div>

          {recentTasks.length === 0 ? (
            <div style={{ fontSize: "13px", color: t.textMuted, textAlign: "center", padding: "24px 0" }}>
              No tasks yet
            </div>
          ) : (
            recentTasks.map((task) => (
              <div key={task.id} style={{ ...s.taskRow, borderBottom: `1px solid ${t.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: t.textPrimary }}>{task.title}</div>
                  <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px" }}>{getProjectName(task.project_id)}</div>
                </div>
                <span style={{ ...s.badge, ...priorityStyle(task.priority) }}>{task.priority}</span>
                <span style={{
                  ...s.badge,
                  background: task.status === "done" ? t.successBg : task.status === "in_progress" ? t.warningBg : "rgba(99,102,241,0.15)",
                  color: task.status === "done" ? t.success : task.status === "in_progress" ? "#f59e0b" : t.accent,
                }}>
                  {task.status === "in_progress" ? "Doing" : task.status === "done" ? "Done" : "To Do"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      {totalTasks > 0 && (
        <div style={{ ...s.card, background: t.surface, border: `1px solid ${t.border}`, marginTop: "14px" }}>
          <div style={s.cardTitle}>Overall completion</div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ flex: 1, height: "10px", background: t.border, borderRadius: "5px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${completionRate}%`, background: `linear-gradient(90deg, ${t.accent}, ${t.success})`, borderRadius: "5px", transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontSize: "16px", fontWeight: 700, color: t.textPrimary, minWidth: "44px" }}>{completionRate}%</span>
          </div>
          <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.success }} />
              <span style={{ fontSize: "12px", color: t.textMuted }}>Done: {doneTasks}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ fontSize: "12px", color: t.textMuted }}>In progress: {inProgressTasks}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.accent }} />
              <span style={{ fontSize: "12px", color: t.textMuted }}>To do: {tasks.filter(t => t.status === "todo").length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  statCard: {
    borderRadius: "12px",
    padding: "16px",
  },
  statIcon: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "14px",
  },
  card: {
    borderRadius: "12px",
    padding: "20px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: t.textPrimary,
  },
  taskRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    flexWrap: "wrap" as const,
  },
  badge: {
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "5px",
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
    textTransform: "capitalize" as const,
  },
};