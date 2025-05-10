import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";

function AdminLayout() {
  return (
    <div className="flex h-screen">
      <AdminNav />
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
