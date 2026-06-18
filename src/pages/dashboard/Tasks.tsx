import { useEffect, useState } from "react";
import api from "../../api/axios";
import { theme as t } from "../../theme";

type Task = {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string;
  project_id: number;
};

type Project = {
  id: number;
  name: string;
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);



// Edit states — حط هون
const [editTask, setEditTask] = useState<Task | null>(null);
const [editTitle, setEditTitle] = useState("");
const [editDescription, setEditDescription] = useState("");
const [editStatus, setEditStatus] = useState("todo");
const [editPriority, setEditPriority] = useState("low");
const [editDueDate, setEditDueDate] = useState("");
const [editSaving, setEditSaving] = useState(false);

const handleEditOpen = (task: Task) => {
  setEditTask(task);
  setEditTitle(task.title);
  setEditDescription(task.description || "");
  setEditStatus(task.status);
  setEditPriority(task.priority);
  setEditDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
};

const handleEditSave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editTask) return;
  setEditSaving(true);
  try {
    await api.put(`/projects/${editTask.project_id}/tasks/${editTask.id}`, {
      title: editTitle,
      description: editDescription,
      status: editStatus,
      priority: editPriority,
      due_date: editDueDate || null,
    });
    setEditTask(null);
    fetchData();
  } catch {
    console.error("Failed to update task");
  } finally {
    setEditSaving(false);
  }
};

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setSaving(true);
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title, description, status, priority,
        due_date: dueDate || null,
      });
      setShowForm(false);
      setTitle(""); setDescription(""); setStatus("todo");
      setPriority("low"); setDueDate(""); setProjectId("");
      fetchData();
    } catch {
      console.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (task: Task) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/projects/${task.project_id}/tasks/${task.id}`);
      fetchData();
    } catch {
      console.error("Failed to delete");
    }
  };

  const filtered = tasks.filter((task) => {
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority ? task.priority === filterPriority : true;
    return matchSearch && matchPriority;
  });

  const priorityStyle = (p: string): React.CSSProperties => {
    if (p === "high") return { background: t.dangerBg, color: t.danger };
    if (p === "medium") return { background: t.warningBg, color: "#f59e0b" };
    return { background: t.successBg, color: t.success };
  };

  const statusStyle = (s: string): React.CSSProperties => {
    if (s === "done") return { background: t.successBg, color: t.success };
    if (s === "in_progress") return { background: t.warningBg, color: "#f59e0b" };
    return { background: "rgba(99,102,241,0.15)", color: t.accent };
  };

  const statusLabel = (s: string) => {
    if (s === "in_progress") return "Doing";
    if (s === "done") return "Done";
    return "To Do";
  };

  const getProjectName = (id: number) =>
    projects.find((p) => p.id === id)?.name || "—";

  if (loading) return <div style={{ color: t.textMuted }}>Loading...</div>;

  return (
    <div>
      <div style={s.topBar}>
        <h2 style={s.title}>Tasks</h2>
        <button style={s.btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add task"}
        </button>
      </div>

      {/* Filter */}
      <div style={s.filterBar}>
        <input
          style={s.searchInput}
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={s.select} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>Add task</h3>
          <form onSubmit={handleCreate} style={s.form}>
            <div style={s.row2}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Title</label>
                <input style={s.input} placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Assign to project</label>
                <select style={s.input} value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} placeholder="Task description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div style={s.row3}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Status</label>
                <select style={s.input} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">Doing</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Priority</label>
                <select style={s.input} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Due date</label>
                <input type="date" style={s.input} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="submit" style={s.btnPrimary} disabled={saving}>{saving ? "Saving..." : "Add task"}</button>
              <button type="button" style={s.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
{/* Edit Task Modal */}
{editTask && (
  <div
    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
    onClick={() => setEditTask(null)}
  >
    <div
      style={{ width: "min(500px, 90vw)", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "24px", maxHeight: "90vh", overflowY: "auto" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: t.textPrimary }}>Edit task</h3>
        <button style={{ background: "transparent", border: "none", color: t.textMuted, fontSize: "18px", cursor: "pointer" }} onClick={() => setEditTask(null)}>✕</button>
      </div>
      <form onSubmit={handleEditSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={s.label}>Title</label>
          <input style={s.input} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={s.label}>Description</label>
          <textarea style={{ ...s.input, height: "70px", padding: "8px 12px", resize: "none" as const }} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={s.label}>Status</label>
            <select style={s.input} value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              <option value="todo">To Do</option>
              <option value="in_progress">Doing</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={s.label}>Priority</label>
            <select style={s.input} value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={s.label}>Due date</label>
            <input type="date" style={s.input} value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button type="submit" style={s.btnPrimary} disabled={editSaving}>
            {editSaving ? "Saving..." : "Save changes"}
          </button>
          <button type="button" style={s.btnSecondary} onClick={() => setEditTask(null)}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Table */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: "14px", color: t.textMuted }}>No tasks found</p>
        </div>
      ) : (
        <div style={s.table}>
          <div style={s.tableHeader}>
  <span>Task name</span>
  <span>Project</span>
  <span>Priority</span>
  <span>Status</span>
  <span>Due date</span>
  <span>Actions</span>
</div>
          {filtered.map((task) => (
            <div key={task.id} style={s.tableRow}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: t.textPrimary }}>{task.title}</div>
                {task.description && <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px" }}>{task.description}</div>}
              </div>
              <span style={{ fontSize: "12px", color: t.textSecondary }}>{getProjectName(task.project_id)}</span>
              <span style={{ ...s.badge, ...priorityStyle(task.priority) }}>{task.priority}</span>
              <span style={{ ...s.badge, ...statusStyle(task.status) }}>{statusLabel(task.status)}</span>
              <span style={{ fontSize: "12px", color: t.textMuted }}>{task.due_date ? task.due_date.slice(0, 10) : "—"}</span>
              <div style={{ display: "flex", gap: "6px" }}>
  <button
    style={{ ...s.deleteBtn, color: t.accent, borderColor: t.accent }}
    onClick={() => handleEditOpen(task)}
  >
    ✏️
  </button>
  <button style={s.deleteBtn} onClick={() => handleDelete(task)}>✕</button>
</div>
             
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  title: { fontSize: "18px", fontWeight: 600, color: t.textPrimary, margin: 0 },
  btnPrimary: { height: "38px", padding: "0 18px", background: t.accent, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", cursor: "pointer", fontWeight: 500 },
  btnSecondary: { height: "38px", padding: "0 18px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: "8px", color: t.textSecondary, fontSize: "13px", cursor: "pointer" },
  filterBar: { display: "flex", gap: "10px", marginBottom: "16px" },
  searchInput: { flex: 1, maxWidth: "260px", height: "36px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "0 12px", fontSize: "13px", color: t.textPrimary, outline: "none" },
  select: { height: "36px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "0 10px", fontSize: "13px", color: t.textPrimary },
  formCard: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" },
  formTitle: { fontSize: "15px", fontWeight: 600, color: t.textPrimary, marginBottom: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: { fontSize: "12px", color: t.textSecondary, fontWeight: 500 },
  input: { height: "36px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "0 12px", fontSize: "13px", color: t.textPrimary, outline: "none" },
  textarea: { height: "60px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: t.textPrimary, outline: "none", resize: "none" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" },
  formActions: { display: "flex", gap: "8px" },
  empty: { textAlign: "center", padding: "48px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px" },
  table: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.4fr", gap: "12px", padding: "12px 16px", borderBottom: `1px solid ${t.border}`, fontSize: "12px", fontWeight: 600, color: t.textMuted },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.4fr", gap: "12px", padding: "12px 16px", borderBottom: `1px solid ${t.border}`, alignItems: "center" },
  badge: { fontSize: "11px", padding: "3px 10px", borderRadius: "6px", fontWeight: 600, display: "inline-block", textTransform: "capitalize" },
  deleteBtn: { background: "transparent", border: "none", color: t.danger, cursor: "pointer", fontSize: "14px" },
};