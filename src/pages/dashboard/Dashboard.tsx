import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import DashboardHome from "./DashboardHome";
import Projects from "./Projects";
import Tasks from "./Tasks";
import Analytics from "./Analytics";
import Settings from "./Settings";
import Kanban from "./Kanban";

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [activeProjectName, setActiveProjectName] = useState("");

const handleOpenProject = (id: number, name: string) => {
  setActiveProjectId(id);
  setActiveProjectName(name);
  setActivePage("kanban");
};

 const renderPage = () => {
  switch (activePage) {
    case "dashboard":
      return <DashboardHome />;
  case "projects":
  return <Projects onOpenProject={handleOpenProject} />;
    case "kanban":
      return (
        <Kanban
          projectId={activeProjectId!}
          projectName={activeProjectName}
          onBack={() => setActivePage("projects")}
        />
      );
    case "tasks":
      return <Tasks />;
    default:
      return (
        <div style={{ color: "#555", fontSize: "14px", paddingTop: "20px" }}>
          🚧 {activePage} — coming soon
        </div>
      );
      
      case "analytics":
  return <Analytics />;
  case "settings":
  return <Settings />;
  }

  
};

  return (
    <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </DashboardLayout>


  );
  
  
}