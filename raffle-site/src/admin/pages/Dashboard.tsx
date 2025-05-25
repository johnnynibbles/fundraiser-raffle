import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>;
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Raffle Events</h2>
          <p className="text-gray-600 mb-4">
            Manage raffle events and schedules
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Raffle Items</h2>
          <p className="text-gray-600 mb-4">
            Manage raffle items and their details
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Orders</h2>
          <p className="text-gray-600 mb-4">View and manage raffle orders</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
