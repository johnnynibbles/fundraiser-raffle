import { Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Orders from "./pages/Orders";
import AdminRaffleItems from "./pages/RaffleItems";
import EventSettings from "./pages/EventSettings";

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="events" element={<Events />} />
    <Route path="event-settings" element={<EventSettings />} />
    <Route path="items" element={<AdminRaffleItems />} />
    <Route path="orders" element={<Orders />} />
    <Route path="users" element={<div>Users Management</div>} />
  </Route>
);
