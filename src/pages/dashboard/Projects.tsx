import { useEffect, useState } from "react";
import api from "../../api/axios";
import { theme as t } from "../../theme";

type Project = {
  id: number;
  name: string;
  description: string;
  project_type: string;
  status: string;
  start_date: string;
  end_date: string;
};

export default function Projects({
  onOpenProject,
}: {
  onOpenProject: (id: number, name: string) => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("personal");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("personal");
  const [editStatus, setEditStatus] = useState("active");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch {
      console.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/projects", {
        name, description,
        project_type: projectType,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      setShowForm(false);
      setName(""); setDescription(""); setProjectType("personal");
      setStartDate(""); setEndDate("");
      fetchProjects();
    } catch {
      console.error("Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (project: Project) => {
    setEditProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditType(project.project_type);
    setEditStatus(project.status);
    setEditStartDate(project.start_date ? project.start_date.slice(0, 10) : "");
    setEditEndDate(project.end_date ? project.end_date.slice(0, 10) : "");
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;
    setEditSaving(true);
    try {
      await api.put(`/projects/${editProject.id}`, {
        name: editName,
        description: editDescription,
        project_type: editType,
        status: editStatus,
        start_date: editStartDate || null,
        end_date: editEndDate || null,
      });
      setEditProject(null);
      fetchProjects();
    } catch {
      console.error("Failed to update project");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch {
      console.error("Failed to delete project");
    }
  };

  if (loading) return <div style={{ color: t.textMuted }}>Loading...</div>;

  return (
    <div>
      <div style={s.topBar}>
        <h2 style={s.title}>Projects</h2>
        <button style={s.btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create new project"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ ...s.formCard, background: t.surface, border: `1px solid ${t.border}` }}>
          <h3 style={s.formTitle}>Create new project</h3>
          <form onSubmit={handleCreate} style={s.form}>
            <div style={s.fieldWrap}>
              <label style={s.label}>Project name</label>
              <input style={s.input} placeholder="Enter project name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} placeholder="Project description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Project type</label>
              <div style={s.typeGrid}>
                {["personal", "work", "freelance", "study"].map((tp) => (
                  <div key={tp} style={{ ...s.typeOpt, ...(projectType === tp ? s.typeOptSel : {}) }} onClick={() => setProjectType(tp)}>
                    {tp}
                  </div>
                ))}
              </div>
            </div>
            <div style={s.dateRow}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Start date</label>
                <input type="date" style={s.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>End date (optional)</label>
                <input type="date" style={s.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="submit" style={s.btnPrimary} disabled={saving}>{saving ? "Creating..." : "Create project"}</button>
              <button type="button" style={s.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editProject && (
        <div style={s.modalOverlay} onClick={() => setEditProject(null)}>
          <div style={{ ...s.modal, background: t.surface, border: `1px solid ${t.border}` }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: t.textPrimary }}>Edit project</h3>
              <button style={s.closeBtn} onClick={() => setEditProject(null)}>✕</button>
            </div>
            <form onSubmit={handleEditSave} style={s.form}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Project name</label>
                <input style={s.input} value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Description</label>
                <textarea style={s.textarea} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Project type</label>
                <div style={s.typeGrid}>
                  {["personal", "work", "freelance", "study"].map((tp) => (
                    <div key={tp} style={{ ...s.typeOpt, ...(editType === tp ? s.typeOptSel : {}) }} onClick={() => setEditType(tp)}>
                      {tp}
                    </div>
                  ))}
                </div>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Status</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["active", "completed", "archived"].map((st) => (
                    <div key={st} style={{ ...s.typeOpt, ...(editStatus === st ? s.typeOptSel : {}), flex: 1, textAlign: "center" }} onClick={() => setEditStatus(st)}>
                      {st}
                    </div>
                  ))}
                </div>
              </div>
              <div style={s.dateRow}>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Start date</label>
                  <input type="date" style={s.input} value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>End date</label>
                  <input type="date" style={s.input} value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                </div>
              </div>
              <div style={s.formActions}>
                <button type="submit" style={s.btnPrimary} disabled={editSaving}>{editSaving ? "Saving..." : "Save changes"}</button>
                <button type="button" style={s.btnSecondary} onClick={() => setEditProject(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div style={{ ...s.empty, background: t.surface, border: `1px solid ${t.border}` }}>
          <p style={s.emptyText}>No projects yet</p>
          <p style={s.emptySubText}>Create your first project to get started</p>
        </div>
      ) : (
        projects.map((project) => (
          <div key={project.id} style={{ ...s.projCard, background: t.surface, border: `1px solid ${t.border}` }}>
            <div style={s.projHeader}>
              <div>
                <div style={s.projName}>{project.name}</div>
                {project.description && <div style={s.projDesc}>{project.description}</div>}
              </div>
              <span style={{ ...s.badge, ...(project.status === "active" ? s.badgeOpen : s.badgeClosed) }}>
                {project.status}
              </span>
            </div>
            <div style={s.projMeta}>
              <span style={s.metaItem}>📁 {project.project_type}</span>
              {project.start_date && (
                <span style={s.metaItem}>📅 {new Date(project.start_date).toLocaleDateString()}</span>
              )}
              {project.end_date && (
                <span style={s.metaItem}>🏁 {new Date(project.end_date).toLocaleDateString()}</span>
              )}
            </div>
            <div style={s.projFooter}>
              <button style={s.btnOpen} onClick={() => onOpenProject(project.id, project.name)}>Open →</button>
              <button style={s.btnEdit} onClick={() => handleEditOpen(project)}>✏️ Edit</button>
              <button style={s.btnDelete} onClick={() => handleDelete(project.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  title: { fontSize: "18px", fontWeight: 600, color: t.textPrimary, margin: 0 },
  btnPrimary: { height: "38px", padding: "0 18px", background: t.accent, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", cursor: "pointer", fontWeight: 500 },
  btnSecondary: { height: "38px", padding: "0 18px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: "8px", color: t.textSecondary, fontSize: "13px", cursor: "pointer" },
  formCard: { borderRadius: "12px", padding: "20px", marginBottom: "16px" },
  formTitle: { fontSize: "15px", fontWeight: 600, color: t.textPrimary, marginBottom: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "5px", flex: 1 },
  label: { fontSize: "12px", color: t.textSecondary, fontWeight: 500 },
  input: { height: "36px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "0 12px", fontSize: "13px", color: t.textPrimary, outline: "none" },
  textarea: { height: "70px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: t.textPrimary, outline: "none", resize: "none" as const },
  typeGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" },
  typeOpt: { padding: "8px", border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "12px", textAlign: "center" as const, cursor: "pointer", color: t.textMuted, background: t.bg, textTransform: "capitalize" as const },
  typeOptSel: { borderColor: t.accent, color: t.accent, background: "rgba(99,102,241,0.1)" },
  dateRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  formActions: { display: "flex", gap: "8px" },
  empty: { textAlign: "center" as const, padding: "48px 20px", borderRadius: "12px" },
  emptyText: { fontSize: "15px", color: t.textSecondary, marginBottom: "6px" },
  emptySubText: { fontSize: "13px", color: t.textMuted },
  projCard: { borderRadius: "12px", padding: "16px", marginBottom: "12px" },
  projHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" },
  projName: { fontSize: "15px", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" },
  projDesc: { fontSize: "12px", color: t.textMuted },
  badge: { fontSize: "11px", padding: "3px 10px", borderRadius: "6px", fontWeight: 500 },
  badgeOpen: { background: "rgba(16,185,129,0.15)", color: t.success },
  badgeClosed: { background: "rgba(239,68,68,0.15)", color: t.danger },
  projMeta: { display: "flex", gap: "14px", marginBottom: "12px", flexWrap: "wrap" as const },
  metaItem: { fontSize: "12px", color: t.textMuted },
  projFooter: { display: "flex", gap: "8px", flexWrap: "wrap" as const },
  btnOpen: { height: "32px", padding: "0 16px", background: "transparent", border: `1px solid ${t.accent}`, borderRadius: "6px", color: t.accent, fontSize: "12px", cursor: "pointer", fontWeight: 500 },
  btnEdit: { height: "32px", padding: "0 16px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: "6px", color: t.textSecondary, fontSize: "12px", cursor: "pointer" },
  btnDelete: { height: "32px", padding: "0 16px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: "6px", color: t.textMuted, fontSize: "12px", cursor: "pointer" },

  // Modal
  modalOverlay: { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { width: "min(500px, 90vw)", borderRadius: "16px", padding: "24px", maxHeight: "90vh", overflowY: "auto" as const },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  closeBtn: { background: "transparent", border: "none", color: t.textMuted, fontSize: "18px", cursor: "pointer" },
};