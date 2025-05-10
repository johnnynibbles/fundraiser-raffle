import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AdminNav from "../components/AdminNav";

function Admin() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentSection, setCurrentSection] = useState("dashboard");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to access this page");
        setIsLoading(false);
        return;
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      setIsAdmin(profile?.role === "admin");
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Raffle Events</h2>
              <p className="text-gray-600 mb-4">
                Manage raffle events and schedules
              </p>
              <button
                onClick={() => setCurrentSection("events")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Manage Events
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Raffle Items</h2>
              <p className="text-gray-600 mb-4">
                Manage raffle items and their details
              </p>
              <button
                onClick={() => setCurrentSection("items")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Manage Items
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Orders</h2>
              <p className="text-gray-600 mb-4">
                View and manage raffle orders
              </p>
              <button
                onClick={() => setCurrentSection("orders")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Orders
              </button>
            </div>
          </div>
        );
      case "events":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Raffle Events</h2>
            <p className="text-gray-600">Event management coming soon...</p>
          </div>
        );
      case "items":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Raffle Items</h2>
            <p className="text-gray-600">Item management coming soon...</p>
          </div>
        );
      case "users":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <p className="text-gray-600">User management coming soon...</p>
          </div>
        );
      case "orders":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            <p className="text-gray-600">Order management coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav
        onNavigate={setCurrentSection}
        currentSection={currentSection}
      />
      <div className="lg:ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        {renderSection()}
      </div>
    </div>
  );
}

export default Admin;
