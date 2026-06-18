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
};

const columns = [
  { id: "todo", label: "To Do", color: "rgba(55,138,221,0.08)", border: "rgba(55,138,221,0.25)", headerColor: "#85B7EB" },
  { id: "in_progress", label: "Doing", color: "rgba(186,117,23,0.08)", border: "rgba(186,117,23,0.25)", headerColor: "#EF9F27" },
  { id: "done", label: "Done", color: "rgba(16,185,117,0.08)", border: "rgba(16,185,117,0.25)", headerColor: "#5DCAA5" },
];

export default function Kanban({
  projectId,
  projectName,
  onBack,
}: {
  projectId: number;
  projectName: string;
  onBack: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit form
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("todo");
  const [editPriority, setEditPriority] = useState("low");
  const [editDueDate, setEditDueDate] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { fetchTasks(); }, [projectId]);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks`);
      setTasks(res.data);
    } catch { console.error("Failed to fetch tasks"); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/projects/${projectId}/tasks`, { title, description, status, priority, due_date: dueDate || null });
      setShowForm(false);
      setTitle(""); setDescription(""); setStatus("todo"); setPriority("low"); setDueDate("");
      fetchTasks();
    } catch { console.error("Failed to create task"); }
    finally { setSaving(false); }
  };

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
      await api.put(`/projects/${projectId}/tasks/${editTask.id}`, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
        due_date: editDueDate || null,
      });
      setEditTask(null);
      fetchTasks();
    } catch { console.error("Failed to update task"); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      fetchTasks();
    } catch { console.error("Failed to delete task"); }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.put(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch { console.error("Failed to update task"); }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority ? task.priority === filterPriority : true;
    return matchSearch && matchPriority;
  });

  const priorityStyle = (p: string): React.CSSProperties => {
    if (p === "high") return { background: "rgba(239,68,68,0.2)", color: "#F09595" };
    if (p === "medium") return { background: "rgba(245,158,11,0.2)", color: "#EF9F27" };
    return { background: "rgba(16,185,129,0.2)", color: "#5DCAA5" };
  };

  if (loading) return <div style={{ color: t.textMuted }}>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div style={s.topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button style={s.backBtn} onClick={onBack}>← Back</button>
          <h2 style={s.title}>{projectName}</h2>
        </div>
        <button style={s.btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add task"}
        </button>
      </div>

      {/* Filter */}
      <div style={s.filterBar}>
        <input style={s.searchInput} placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={s.select} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div style={{ ...s.formCard, background: t.surface, border: `1px solid ${t.border}` }}>
          <h3 style={s.formTitle}>Add task</h3>
          <form onSubmit={handleCreate} style={s.form}>
            <div style={s.fieldWrap}>
              <label style={s.label}>Title</label>
              <input style={s.input} placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} placeholder="Task description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div style={s.row3}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Column</label>
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
        <div style={s.modalOverlay} onClick={() => setEditTask(null)}>
          <div style={{ ...s.modal, background: t.surface, border: `1px solid ${t.border}` }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: t.textPrimary }}>Edit task</h3>
              <button style={s.closeBtn} onClick={() => setEditTask(null)}>✕</button>
            </div>
            <form onSubmit={handleEditSave} style={s.form}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Title</label>
                <input style={s.input} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Description</label>
                <textarea style={s.textarea} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div style={s.row3}>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Column</label>
                  <select style={s.input} value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">Doing</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Priority</label>
                  <select style={s.input} value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Due date</label>
                  <input type="date" style={s.input} value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                </div>
              </div>
              <div style={s.formActions}>
                <button type="submit" style={s.btnPrimary} disabled={editSaving}>{editSaving ? "Saving..." : "Save changes"}</button>
                <button type="button" style={s.btnSecondary} onClick={() => setEditTask(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div style={s.kanban}>
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((task) => task.status === col.id);
          return (
            <div key={col.id} style={{ ...s.col, background: col.color, border: `0.5px solid ${col.border}` }}>
              <div style={s.colHeader}>
                <span style={{ ...s.colTitle, color: col.headerColor }}>{col.label}</span>
                <span style={s.colCount}>{colTasks.length}</span>
              </div>
              {colTasks.length === 0 ? (
                <div style={s.emptyCol}>No tasks</div>
              ) : (
                colTasks.map((task) => (
                  <div key={task.id} style={{ ...s.taskCard, background: t.surface, border: `0.5px solid ${t.border}` }}>
                    <div style={s.taskTitle}>{task.title}</div>
                    {task.description && <div style={s.taskDesc}>{task.description}</div>}
                    <div style={s.taskMeta}>
                      <span style={{ ...s.priority, ...priorityStyle(task.priority) }}>{task.priority}</span>
                      {task.due_date && <span style={s.due}>{task.due_date.slice(0, 10)}</span>}
                    </div>
                    <div style={s.taskActions}>
                      {col.id !== "todo" && (
                        <button style={s.moveBtn} onClick={() => handleStatusChange(task.id, col.id === "in_progress" ? "todo" : "in_progress")}>← Back</button>
                      )}
                      {col.id !== "done" && (
                        <button style={s.moveBtn} onClick={() => handleStatusChange(task.id, col.id === "todo" ? "in_progress" : "done")}>Next →</button>
                      )}
                      <button style={s.editBtn} onClick={() => handleEditOpen(task)}>✏️</button>
                      <button style={s.deleteBtn} onClick={() => handleDelete(task.id)}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" },
  backBtn: { height: "32px", padding: "0 14px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: "6px", color: t.textSecondary, fontSize: "12px", cursor: "pointer" },
  title: { fontSize: "18px", fontWeight: 600, color: t.textPrimary, margin: 0 },
  btnPrimary: { height: "38px", padding: "0 18px", background: t.accent, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", cursor: "pointer", fontWeight: 500 },
  btnSecondary: { height: "38px", padding: "0 18px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: "8px", color: t.textSecondary, fontSize: "13px", cursor: "pointer" },
  filterBar: { display: "flex", gap: "10px", marginBottom: "14px" },
  searchInput: { flex: 1, maxWidth: "240px", height: "36px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "0 12px", fontSize: "13px", color: t.textPrimary, outline: "none" },
  select: { height: "36px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "0 10px", fontSize: "13px", color: t.textPrimary },
  formCard: { borderRadius: "12px", padding: "20px", marginBottom: "16px" },
  formTitle: { fontSize: "15px", fontWeight: 600, color: t.textPrimary, marginBottom: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: { fontSize: "12px", color: t.textSecondary, fontWeight: 500 },
  input: { height: "36px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "0 12px", fontSize: "13px", color: t.textPrimary, outline: "none" },
  textarea: { height: "60px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: t.textPrimary, outline: "none", resize: "none" as const },
  row3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: "12px" },
  formActions: { display: "flex", gap: "8px" },
  kanban: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "12px" },
  col: { borderRadius: "10px", padding: "12px", minHeight: "200px" },
  colHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", paddingBottom: "8px", borderBottom: `0.5px solid ${t.border}` },
  colTitle: { fontSize: "13px", fontWeight: 600 },
  colCount: { fontSize: "11px", background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: "10px", padding: "1px 7px", color: t.textMuted },
  emptyCol: { fontSize: "12px", color: t.textMuted, textAlign: "center" as const, padding: "24px 0" },
  taskCard: { borderRadius: "8px", padding: "10px", marginBottom: "8px" },
  taskTitle: { fontSize: "13px", fontWeight: 500, color: t.textPrimary, marginBottom: "3px" },
  taskDesc: { fontSize: "11px", color: t.textMuted, marginBottom: "6px" },
  taskMeta: { display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" },
  priority: { fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 },
  due: { fontSize: "10px", color: t.textMuted },
  taskActions: { display: "flex", gap: "5px", flexWrap: "wrap" as const },
  moveBtn: { fontSize: "10px", padding: "3px 8px", background: "transparent", border: `0.5px solid ${t.border}`, borderRadius: "4px", color: t.textMuted, cursor: "pointer" },
  editBtn: { fontSize: "11px", padding: "3px 8px", background: "transparent", border: `0.5px solid ${t.border}`, borderRadius: "4px", color: t.accent, cursor: "pointer" },
  deleteBtn: { fontSize: "11px", padding: "3px 6px", background: "transparent", border: `0.5px solid ${t.border}`, borderRadius: "4px", color: t.danger, cursor: "pointer", marginLeft: "auto" },

  // Modal
  modalOverlay: { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { width: "min(500px, 90vw)", borderRadius: "16px", padding: "24px", maxHeight: "90vh", overflowY: "auto" as const },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  closeBtn: { background: "transparent", border: "none", color: t.textMuted, fontSize: "18px", cursor: "pointer" },
};