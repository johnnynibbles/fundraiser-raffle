import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminNav from "../../components/admin/AdminNav";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentSection = location.pathname.split("/")[2] || "dashboard";

  const handleNavigate = (section: string) => {
    navigate(`/admin/${section}`);
  };

  return (
    <div className="flex">
      <AdminNav onNavigate={handleNavigate} currentSection={currentSection} />
      <div className="flex-1 ml-64">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
