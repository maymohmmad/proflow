
import logo from "../../assets/proflowlogo.png";


  import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { theme as t } from "../../theme";

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "projects", label: "Projects" },
  { id: "tasks", label: "Tasks" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
];

export default function DashboardLayout({
  children,
  activePage,
  onNavigate,
}: {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // إغلاق القوائم لما تضغط برا
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Search filter
  const searchResults = search.length > 1
    ? navItems.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const notifications = [
    { id: 1, text: "New task assigned to you", time: "2m ago", read: false },
    { id: 2, text: "Project deadline tomorrow", time: "1h ago", read: false },
    { id: 3, text: "Task completed successfully", time: "3h ago", read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ ...s.app, background: t.bg }}>
      {/* Navbar */}
      <div style={{ ...s.navbar, background: t.surface, borderBottom: `1px solid ${t.border}` }}>

        {/* Logo */}
        <div style={s.logoWrap}>
              <img
            src={logo}
            alt="ProFlow Logo" 
   style={{
    width: "clamp(32px, 5vw, 48px)",  // بين 32 و 48 بكسل
    height: "clamp(32px, 5vw, 48px)",
    objectFit: "contain"
  }}/>

        </div>

        {/* Search — وسط الـ header */}
        <div style={s.searchWrap}>
          <div style={{ position: "relative" }}>
            <span style={s.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...s.search, background: t.bg, border: `1px solid ${t.border}`, color: t.textPrimary }}
            />
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div style={{ ...s.searchDropdown, background: t.surface, border: `1px solid ${t.border}` }}>
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    style={s.searchItem}
                    onClick={() => {
                      onNavigate(item.id);
                      setSearch("");
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: "13px", color: t.textPrimary }}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div style={s.navActions}>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <div
              style={{ ...s.iconBtn, background: t.bg, border: `1px solid ${t.border}` }}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
            >
              🔔
              {unreadCount > 0 && (
                <div style={s.badge}>{unreadCount}</div>
              )}
            </div>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div style={{ ...s.dropdown, background: t.surface, border: `1px solid ${t.border}` }}>
                <div style={s.dropdownHeader}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: t.textPrimary }}>Notifications</span>
                  <span style={{ fontSize: "11px", color: t.accent, cursor: "pointer" }}>Mark all read</span>
                </div>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      ...s.notifItem,
                      background: notif.read ? "transparent" : `${t.accent}10`,
                      borderLeft: notif.read ? "none" : `3px solid ${t.accent}`,
                    }}
                  >
                    <div style={{ fontSize: "13px", color: t.textPrimary }}>{notif.text}</div>
                    <div style={{ fontSize: "11px", color: t.textMuted, marginTop: "3px" }}>{notif.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div ref={userMenuRef} style={{ position: "relative" }}>
            <div
              style={{ ...s.avatar, background: "rgba(99,102,241,0.2)", cursor: "pointer" }}
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ color: t.accent, fontSize: "14px", fontWeight: 600 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div style={{ ...s.dropdown, background: t.surface, border: `1px solid ${t.border}` }}>
                {/* User Info */}
                <div style={s.userInfo}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: t.textPrimary }}>{user?.name}</div>
                  <div style={{ fontSize: "12px", color: t.textMuted }}>{user?.email}</div>
                </div>

                <div style={{ ...s.divider, borderColor: t.border }} />

                {/* Menu Items */}
                {[
                  { icon: "👤", label: "Profile", action: () => { onNavigate("settings"); setShowUserMenu(false); } },
                  { icon: "⚙️", label: "Settings", action: () => { onNavigate("settings"); setShowUserMenu(false); } },
                  { icon: "🎨", label: "Appearance", action: () => { onNavigate("settings"); setShowUserMenu(false); } },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={s.menuItem}
                    onClick={item.action}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>{item.icon}</span>
                    <span style={{ fontSize: "13px", color: t.textPrimary }}>{item.label}</span>
                  </div>
                ))}

                <div style={{ ...s.divider, borderColor: t.border }} />

                {/* Logout */}
                <div
                  style={{ ...s.menuItem, color: t.danger }}
                  onClick={handleLogout}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.dangerBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span>🚪</span>
                  <span style={{ fontSize: "13px", color: t.danger }}>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={s.body}>
        {/* Sidebar */}
        <div style={{ ...s.sidebar, background: t.surface, borderRight: `1px solid ${t.border}` }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              style={{
                ...s.navItem,
                color: activePage === item.id ? t.textPrimary : t.textMuted,
                background: activePage === item.id ? "rgba(99,102,241,0.15)" : "transparent",
                borderLeft: activePage === item.id ? `2px solid ${t.accent}` : "2px solid transparent",
              }}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </div>
          ))}
          <div
            style={{ ...s.navItem, color: t.danger, marginTop: "auto" }}
            onClick={handleLogout}
          >
            Logout
          </div>
        </div>

        {/* Main */}
        <div style={{ ...s.main, background: t.bg }}>{children}</div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  app: { height: "100vh", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" },
  navbar: { height: "56px", display: "flex", alignItems: "center", padding: "0 16px", gap: "8px", flexShrink: 0, position: "relative" },
  logoWrap: { display: "flex", alignItems: "center", gap: "8px", minWidth: "100px" },
  logoDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  logoText: { fontSize: "15px", fontWeight: 600 },

  searchWrap: { flex: 1, display: "flex", justifyContent: "center" },
  searchIcon: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px" },
  search: { width: "min(320px, 100%)", height: "36px", borderRadius: "8px", padding: "0 12px 0 32px", fontSize: "13px", outline: "none" },
  searchDropdown: { position: "absolute", top: "42px", left: 0, width: "min(320px, 90vw)", borderRadius: "8px", zIndex: 100, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" },
  searchItem: { padding: "10px 14px", cursor: "pointer", transition: "background 0.15s" },

  navActions: { display: "flex", alignItems: "center", gap: "8px", minWidth: "80px", justifyContent: "flex-end" },
  iconBtn: { width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", cursor: "pointer", position: "relative", flexShrink: 0 },
  badge: { position: "absolute", top: "-4px", right: "-4px", width: "16px", height: "16px", borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  dropdown: { position: "absolute", top: "44px", right: 0, width: "220px", borderRadius: "10px", zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", overflow: "hidden" },
  dropdownHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" },
  notifItem: { padding: "10px 14px", paddingLeft: "11px" },
  userInfo: { padding: "14px" },
  menuItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", cursor: "pointer", transition: "background 0.15s" },
  divider: { borderTop: "1px solid", margin: "4px 0" },

  body: { flex: 1, display: "flex", overflow: "hidden" },
  sidebar: { width: "190px", padding: "12px 0", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" as const },
  navItem: { padding: "9px 16px", fontSize: "13px", cursor: "pointer", fontWeight: 500, transition: "all 0.15s", whiteSpace: "nowrap" as const },
  main: { flex: 1, overflow: "auto", padding: "16px" },
};