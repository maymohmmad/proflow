import { useEffect, useState } from "react";
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
};

export default function Analytics() {
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

  // Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const highPriority = tasks.filter((t) => t.priority === "high").length;
  const medPriority = tasks.filter((t) => t.priority === "medium").length;
  const lowPriority = tasks.filter((t) => t.priority === "low").length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Tasks per project
  const tasksByProject = projects.map((p) => ({
    name: p.name,
    total: tasks.filter((task) => task.project_id === p.id).length,
    done: tasks.filter((task) => task.project_id === p.id && task.status === "done").length,
  }));

  if (loading) return <div style={{ color: t.textMuted }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, color: t.textPrimary, marginBottom: "20px" }}>
        Analytics
      </h2>

      {/* Stats Grid */}
      <div style={s.statsGrid}>
        <StatCard label="Total projects" value={totalProjects} sub={`${activeProjects} active`} color={t.accent} />
        <StatCard label="Total tasks" value={totalTasks} sub={`${completionRate}% completed`} color={t.success} />
        <StatCard label="Done" value={doneTasks} sub="tasks completed" color={t.success} />
        <StatCard label="In progress" value={inProgressTasks} sub="tasks doing" color="#f59e0b" />
        <StatCard label="To do" value={todoTasks} sub="tasks pending" color={t.accent} />
        <StatCard label="High priority" value={highPriority} sub="urgent tasks" color={t.danger} />
      </div>

      {/* Three cards in one row */}
      <div style={s.threeColumns}>
        {/* Task Status Breakdown */}
        <div style={{ ...s.card, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={s.cardTitle}>Task status breakdown</div>
          <BarItem label="Done" value={doneTasks} total={totalTasks} color={t.success} />
          <BarItem label="In progress" value={inProgressTasks} total={totalTasks} color="#f59e0b" />
          <BarItem label="To do" value={todoTasks} total={totalTasks} color={t.accent} />
        </div>

        {/* Priority Breakdown - Columns */}
        <div style={{ ...s.card, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={s.cardTitle}>Priority breakdown</div>
          <div style={s.columnsContainer}>
            <ColumnItem 
              label="High" 
              value={highPriority} 
              total={totalTasks} 
              color={t.danger}
              gradient="linear-gradient(135deg, #ef4444, #dc2626)"
            />
            <ColumnItem 
              label="Medium" 
              value={medPriority} 
              total={totalTasks} 
              color="#f59e0b"
              gradient="linear-gradient(135deg, #f59e0b, #d97706)"
            />
            <ColumnItem 
              label="Low" 
              value={lowPriority} 
              total={totalTasks} 
              color={t.success}
              gradient="linear-gradient(135deg, #10b981, #059669)"
            />
          </div>
        </div>

        {/* Projects Progress - Circular */}
        <div style={{ ...s.card, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={s.cardTitle}>Projects progress</div>
          {tasksByProject.length === 0 ? (
            <div style={{ fontSize: "13px", color: t.textMuted, textAlign: "center", padding: "20px 0" }}>
              No projects yet
            </div>
          ) : (
            <div style={s.projectsCircularContainer}>
              {tasksByProject.map((p, i) => {
                const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
                const colors = [t.accent, t.success, "#f59e0b", t.danger, "#8b5cf6"];
                const color = colors[i % colors.length];
                return (
                  <CircularProgress
                    key={p.name}
                    name={p.name}
                    percentage={pct}
                    done={p.done}
                    total={p.total}
                    color={color}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Project Types */}
      <div style={{ ...s.card, background: t.surface, border: `1px solid ${t.border}`, marginTop: "16px" }}>
        <div style={s.cardTitle}>Projects by type</div>
        <div style={s.typeGrid}>
          {["personal", "work", "freelance", "study"].map((type) => {
            const count = projects.filter((p) => p.project_type === type).length;
            const typeColors: Record<string, string> = {
              personal: t.accent,
              work: t.success,
              freelance: "#f59e0b",
              study: "#8b5cf6",
            };
            return (
              <div key={type} style={{ ...s.typeCard, background: t.bg, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: "22px", fontWeight: 600, color: typeColors[type] }}>{count}</div>
                <div style={{ fontSize: "12px", color: t.textMuted, textTransform: "capitalize", marginTop: "4px" }}>{type}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "16px" }}>
      <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "4px" }}>{sub}</div>
    </div>
  );
}

function BarItem({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", color: t.textSecondary }}>{label}</span>
        <span style={{ fontSize: "12px", color: t.textMuted }}>{value} · {pct}%</span>
      </div>
      <div style={{ height: "6px", background: t.border, borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "3px", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function ColumnItem({ label, value, total, color, gradient }: { 
  label: string; 
  value: number; 
  total: number; 
  color: string;
  gradient: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const columnHeight = Math.max(pct * 1.8, 30);
  
  return (
    <div style={s.columnItem}>
      <div style={s.columnBarContainer}>
        <div 
          style={{
            ...s.columnBar,
            height: `${columnHeight}px`,
            background: gradient,
            boxShadow: `0 2px 8px ${color}40`,
          }}
        >
          <span style={s.columnValue}>{value}</span>
        </div>
      </div>
      <div style={s.columnLabel}>{label}</div>
      <div style={s.columnPercent}>{pct}%</div>
    </div>
  );
}

// New Circular Progress Component
function CircularProgress({ name, percentage, done, total, color }: {
  name: string;
  percentage: number;
  done: number;
  total: number;
  color: string;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div style={s.circularItem}>
      <div style={s.circularChart}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={t.border}
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dy=".3em"
            fill={t.textPrimary}
            fontSize="14"
            fontWeight="600"
          >
            {percentage}%
          </text>
        </svg>
      </div>
      <div style={s.circularInfo}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: t.textPrimary }}>{name}</div>
        <div style={{ fontSize: "11px", color: t.textMuted }}>{done}/{total} tasks</div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  threeColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
    marginBottom: "16px",
  },
  card: {
    borderRadius: "12px",
    padding: "20px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: t.textPrimary,
    marginBottom: "16px",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "12px",
  },
  typeCard: {
    borderRadius: "10px",
    padding: "16px",
    textAlign: "center" as const,
  },
  columnsContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "flex-end",
    gap: "16px",
    padding: "20px 0 10px 0",
    minHeight: "180px",
  },
  columnItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "8px",
  },
  columnBarContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    width: "100%",
    height: "130px",
  },
  columnBar: {
    width: "100%",
    maxWidth: "50px",
    minWidth: "40px",
    borderRadius: "8px 8px 4px 4px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: "8px",
    transition: "height 0.5s ease",
    cursor: "pointer",
  },
  columnValue: {
    color: "white",
    fontWeight: "bold" as const,
    fontSize: "13px",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  columnLabel: {
    fontSize: "12px",
    fontWeight: 500,
    color: t.textPrimary,
    textTransform: "capitalize" as const,
  },
  columnPercent: {
    fontSize: "10px",
    color: t.textMuted,
  },
  projectsCircularContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    maxHeight: "350px",
    overflowY: "auto" as const,
    paddingRight: "4px",
  },
  circularItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px",
    background: t.bg,
    borderRadius: "10px",
    border: `1px solid ${t.border}`,
  },
  circularChart: {
    flexShrink: 0,
  },
  circularInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
};