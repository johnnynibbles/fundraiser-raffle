import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminNav from "./AdminNav";
import { useState, useEffect } from "react";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState("dashboard");

  useEffect(() => {
    // Extract section from path, defaulting to "dashboard" for root admin route
    const pathParts = location.pathname.split("/");
    const section = pathParts.length > 2 ? pathParts[2] : "dashboard";
    setCurrentSection(section);
  }, [location]);

  const handleNavigate = (section: string) => {
    if (section === "dashboard") {
      navigate("/admin");
    } else {
      navigate(`/admin/${section}`);
    }
  };

  return (
    <div className="flex h-screen">
      <AdminNav onNavigate={handleNavigate} currentSection={currentSection} />
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
