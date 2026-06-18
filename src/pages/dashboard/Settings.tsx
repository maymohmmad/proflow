import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { theme as t } from "../../theme";
import { useTheme } from "../../context/ThemeContext";

type Tab = "profile" | "notifications" | "appearance" | "security" | "data";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
    { id: "security", label: "Security" },
    { id: "data", label: "Data & Projects" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, color: t.textPrimary, marginBottom: "20px" }}>
        Settings
      </h2>
      <div style={s.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{
              ...s.tab,
              color: activeTab === tab.id ? t.accent : t.textMuted,
              borderBottom: activeTab === tab.id ? `2px solid ${t.accent}` : "2px solid transparent",
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div style={{ ...s.content, background: t.surface, border: `1px solid ${t.border}` }}>
        {activeTab === "profile" && <ProfileTab user={user} />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "appearance" && <AppearanceTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "data" && <DataTab />}
      </div>
    </div>
  );
}

function ProfileTab({ user }: { user: any }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.put("/auth/profile", { name, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setUploading(true);
    try {
      const res = await api.post("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(res.data.avatar);
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={s.sectionTitle}>Profile information</div>
      <div style={s.field}>
        <label style={s.label}>Full name</label>
        <input style={s.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>
      <div style={s.field}>
        <label style={s.label}>Email address</label>
        <input style={s.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
      </div>
      <div style={s.field}>
        <label style={s.label}>Avatar</label>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ ...s.avatar, background: "rgba(99,102,241,0.2)", color: t.accent }}>
              {name?.charAt(0).toUpperCase()}
            </div>
          )}
          <label style={{ ...s.btnSecondary, cursor: "pointer", display: "flex", alignItems: "center" }}>
            {uploading ? "Uploading..." : "Upload image"}
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </label>
        </div>
      </div>
      {error && <div style={s.errorBox}>{error}</div>}
      {saved && (
        <div style={{ ...s.errorBox, background: t.successBg, borderColor: t.success, color: t.success, marginBottom: "12px" }}>
          ✓ Profile updated successfully!
        </div>
      )}
      <button style={s.btnPrimary} onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    taskReminders: true,
    projectUpdates: true,
    weeklyReport: false,
    emailNotifications: true,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem("notifications", JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={s.sectionTitle}>Notification preferences</div>
      {[
        { key: "taskReminders", label: "Task reminders", sub: "Get notified about upcoming tasks" },
        { key: "projectUpdates", label: "Project updates", sub: "Stay updated on project changes" },
        { key: "weeklyReport", label: "Weekly report", sub: "Receive a weekly summary" },
        { key: "emailNotifications", label: "Email notifications", sub: "Receive notifications via email" },
      ].map((item) => (
        <div key={item.key} style={s.toggleRow}>
          <div>
            <div style={{ fontSize: "14px", color: t.textPrimary, fontWeight: 500 }}>{item.label}</div>
            <div style={{ fontSize: "12px", color: t.textMuted, marginTop: "2px" }}>{item.sub}</div>
          </div>
          <div
            style={{ ...s.toggle, background: prefs[item.key as keyof typeof prefs] ? t.accent : t.border }}
            onClick={() => toggle(item.key as keyof typeof prefs)}
          >
            <div style={{ ...s.toggleDot, left: prefs[item.key as keyof typeof prefs] ? "22px" : "3px" }} />
          </div>
        </div>
      ))}

      {saved && (
        <div style={{ background: t.successBg, border: `1px solid ${t.success}`, borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: t.success, margin: "12px 0" }}>
          ✓ Preferences saved!
        </div>
      )}

      <button style={{ ...s.btnPrimary, marginTop: "16px" }} onClick={handleSave}>
        Save preferences
      </button>
    </div>
  );
}

function AppearanceTab() {
  const { accentColor, setAccentColor, density, setDensity } = useTheme();
  const [themeMode, setThemeMode] = useState(localStorage.getItem("appTheme") || "dark");
  const [saved, setSaved] = useState(false);

  const accents = [
    { id: "indigo", color: "#6366f1" },
    { id: "blue", color: "#3b82f6" },
    { id: "green", color: "#10b981" },
    { id: "red", color: "#ef4444" },
    { id: "amber", color: "#f59e0b" },
    { id: "purple", color: "#8b5cf6" },
  ];

  const handleApply = () => {
    localStorage.setItem("accentColor", accentColor);
    localStorage.setItem("density", density);
    localStorage.setItem("appTheme", themeMode);
    setSaved(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div>
      <div style={s.sectionTitle}>Appearance settings</div>

      <div style={s.field}>
        <label style={s.label}>Theme</label>
        <div style={s.radioGroup}>
          {["light", "dark"].map((th) => (
            <div
              key={th}
              style={{
                ...s.radioOpt,
                borderColor: themeMode === th ? t.accent : t.border,
                background: themeMode === th ? "rgba(99,102,241,0.1)" : t.bg,
              }}
              onClick={() => setThemeMode(th)}
            >
              <div style={{
                width: "14px", height: "14px", borderRadius: "50%",
                border: `2px solid ${themeMode === th ? t.accent : t.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {themeMode === th && (
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.accent }} />
                )}
              </div>
              <span style={{ fontSize: "13px", color: t.textPrimary, textTransform: "capitalize" }}>
                {th} mode
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>Accent color</label>
        <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
          {accents.map((a) => (
            <div
              key={a.id}
              onClick={() => setAccentColor(a.id)}
              style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: a.color, cursor: "pointer",
                border: accentColor === a.id ? `3px solid ${t.textPrimary}` : "3px solid transparent",
                transition: "border 0.2s",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "8px" }}>
          Selected: {accentColor}
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>Layout density</label>
        <div style={s.radioGroup}>
          {["compact", "comfortable"].map((d) => (
            <div
              key={d}
              style={{
                ...s.radioOpt,
                borderColor: density === d ? t.accent : t.border,
                background: density === d ? "rgba(99,102,241,0.1)" : t.bg,
              }}
              onClick={() => setDensity(d)}
            >
              <div style={{
                width: "14px", height: "14px", borderRadius: "50%",
                border: `2px solid ${density === d ? t.accent : t.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {density === d && (
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.accent }} />
                )}
              </div>
              <span style={{ fontSize: "13px", color: t.textPrimary, textTransform: "capitalize" }}>
                {d}
              </span>
            </div>
          ))}
        </div>
      </div>

      {saved && (
        <div style={{ ...s.errorBox, background: t.successBg, borderColor: t.success, color: t.success, marginBottom: "12px" }}>
          ✓ Appearance settings saved!
        </div>
      )}
      <button style={s.btnPrimary} onClick={handleApply}>Apply changes</button>
    </div>
  );
}

function SecurityTab() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError(null);
    try {
      await api.put("/auth/password", {
        current_password: oldPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setSuccess(true);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Current password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={s.sectionTitle}>Change password</div>
      <form onSubmit={handleChangePassword}>
        <div style={s.field}>
          <label style={s.label}>Current password</label>
          <input type="password" style={s.input} placeholder="••••••••" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
        </div>
        <div style={s.field}>
          <label style={s.label}>New password</label>
          <input type="password" style={s.input} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        <div style={s.field}>
          <label style={s.label}>Confirm new password</label>
          <input type="password" style={s.input} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        {success && (
          <div style={{ ...s.errorBox, background: t.successBg, borderColor: t.success, color: t.success, marginBottom: "12px" }}>
            ✓ Password changed successfully!
          </div>
        )}
        <button type="submit" style={s.btnPrimary} disabled={loading}>
          {loading ? "Changing..." : success ? "✓ Changed!" : "Change password"}
        </button>
      </form>

      <div style={{ ...s.divider, borderColor: t.border }} />
      <div style={s.sectionTitle}>Two-factor authentication</div>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "12px" }}>Add an extra layer of security to your account.</p>
      <button style={s.btnSecondary}>Enable 2FA</button>

      <div style={{ ...s.divider, borderColor: t.border }} />
      <div style={s.sectionTitle}>Login sessions</div>
      {[
        { device: "Chrome — Windows", time: "Current session", active: true },
        { device: "Mobile — iPhone", time: "2 days ago", active: false },
      ].map((session) => (
        <div key={session.device} style={{ ...s.sessionRow, background: t.bg, border: `1px solid ${t.border}` }}>
          <div>
            <div style={{ fontSize: "13px", color: t.textPrimary, fontWeight: 500 }}>{session.device}</div>
            <div style={{ fontSize: "11px", color: session.active ? t.success : t.textMuted, marginTop: "2px" }}>{session.time}</div>
          </div>
          {!session.active && (
            <button style={{ ...s.btnSecondary, fontSize: "11px", padding: "4px 10px", height: "auto" }}>Revoke</button>
          )}
        </div>
      ))}
      <button style={{ ...s.btnSecondary, color: t.danger, borderColor: t.danger, marginTop: "10px" }}>
        Logout from all devices
      </button>
    </div>
  );
}

function DataTab() {
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

 const handleDownload = async () => {
  setDownloading(true);
  try {
    const projRes = await api.get("/projects");
    const projects = projRes.data;
    const allTasks: any[] = [];
    for (const proj of projects) {
      const taskRes = await api.get(`/projects/${proj.id}/tasks`);
      allTasks.push(...taskRes.data.map((t: any) => ({ ...t, project_name: proj.name })));
    }

    // إنشاء PDF
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ProFlow", 14, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Project Management Report", 14, 28);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

    // Stats
    const totalTasks = allTasks.length;
    const doneTasks = allTasks.filter((t) => t.status === "done").length;
    const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
    const todoTasks = allTasks.filter((t) => t.status === "todo").length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Stats section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Overview", 14, 52);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);

    const stats = [
      ["Total Projects", projects.length.toString()],
      ["Total Tasks", totalTasks.toString()],
      ["Completed", `${doneTasks} (${completionRate}%)`],
      ["In Progress", inProgress.toString()],
      ["To Do", todoTasks.toString()],
    ];

    autoTable(doc, {
      startY: 56,
      head: [["Metric", "Value"]],
      body: stats,
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { cellWidth: 60 } },
    });

    // Projects section
    const afterStats = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Projects", 14, afterStats);

    const projectRows = projects.map((p: any) => {
      const projTasks = allTasks.filter((t) => t.project_id === p.id);
      const projDone = projTasks.filter((t) => t.status === "done").length;
      const pct = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;
      return [
        p.name,
        p.project_type,
        p.status,
        `${projTasks.length}`,
        `${projDone}/${projTasks.length} (${pct}%)`,
        p.start_date ? p.start_date.slice(0, 10) : "—",
      ];
    });

    autoTable(doc, {
      startY: afterStats + 4,
      head: [["Project", "Type", "Status", "Tasks", "Progress", "Start Date"]],
      body: projectRows,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Tasks section
    const afterProjects = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Tasks", 14, afterProjects);

    const taskRows = allTasks.map((task: any) => [
      task.title,
      task.project_name || "—",
      task.status === "in_progress" ? "In Progress" : task.status === "done" ? "Done" : "To Do",
      task.priority,
      task.due_date ? task.due_date.slice(0, 10) : "—",
    ]);

    autoTable(doc, {
      startY: afterProjects + 4,
      head: [["Task", "Project", "Status", "Priority", "Due Date"]],
      body: taskRows,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      didParseCell: (data: any) => {
        if (data.column.index === 3) {
          if (data.cell.raw === "high") data.cell.styles.textColor = [239, 68, 68];
          if (data.cell.raw === "medium") data.cell.styles.textColor = [245, 158, 11];
          if (data.cell.raw === "low") data.cell.styles.textColor = [16, 185, 129];
        }
        if (data.column.index === 2) {
          if (data.cell.raw === "Done") data.cell.styles.textColor = [16, 185, 129];
          if (data.cell.raw === "In Progress") data.cell.styles.textColor = [245, 158, 11];
        }
      },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `ProFlow Report — Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 8,
        { align: "center" }
      );
    }

    doc.save(`proflow-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error("Failed to generate PDF", err);
  } finally {
    setDownloading(false);
  }
};

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete("/auth/account");
      await logout();
    } catch {
      console.error("Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={s.sectionTitle}>Export data</div>
      <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "12px" }}>
        Download all your projects and tasks data as JSON.
      </p>
     <button style={s.btnSecondary} onClick={handleDownload} disabled={downloading}>
  {downloading ? "Generating PDF..." : "⬇ Download PDF Report"}
</button>

      <div style={{ ...s.divider, borderColor: t.border }} />

      <div style={s.sectionTitle}>Delete account</div>
      <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "16px" }}>
        <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "12px" }}>
          ⚠️ This action is permanent and cannot be undone. All your projects and tasks will be deleted.
        </p>
        {!confirming ? (
          <button
            style={{ ...s.btnSecondary, color: t.danger, borderColor: t.danger }}
            onClick={() => setConfirming(true)}
          >
            Delete account
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: t.textPrimary }}>Are you sure? This cannot be undone.</span>
            <button
              style={{ ...s.btnSecondary, color: t.danger, borderColor: t.danger }}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button style={s.btnSecondary} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  tabs: { display: "flex", borderBottom: `1px solid ${t.border}`, marginBottom: "20px" },
  tab: { padding: "10px 20px", fontSize: "13px", fontWeight: 500, cursor: "pointer", marginBottom: "-1px" },
  content: { borderRadius: "12px", padding: "24px" },
  sectionTitle: { fontSize: "15px", fontWeight: 600, color: t.textPrimary, marginBottom: "16px" },
  field: { marginBottom: "16px" },
  label: { fontSize: "12px", color: t.textSecondary, fontWeight: 500, display: "block", marginBottom: "6px" },
  input: { width: "100%", maxWidth: "400px", height: "38px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "0 12px", fontSize: "13px", color: t.textPrimary, outline: "none" },
  btnPrimary: { height: "38px", padding: "0 20px", background: t.accent, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", cursor: "pointer", fontWeight: 500 },
  btnSecondary: { height: "38px", padding: "0 16px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: "8px", color: t.textSecondary, fontSize: "13px", cursor: "pointer" },
  avatar: { width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 600 },
  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${t.border}` },
  toggle: { width: "44px", height: "24px", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 },
  toggleDot: { position: "absolute", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", top: "3px", transition: "left 0.2s" },
  radioGroup: { display: "flex", gap: "10px", marginTop: "6px" },
  radioOpt: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", border: "1px solid", borderRadius: "8px", cursor: "pointer" },
  errorBox: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: t.danger, marginBottom: "12px" },
  divider: { borderTop: "1px solid", margin: "24px 0" },
  sessionRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: "8px", marginBottom: "8px" },
};