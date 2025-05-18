import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useEvent } from "../../lib/context/EventContext";

interface EventSettings {
  id: string;
  event_id: string;
  allow_international_orders: boolean;
  require_age_confirmation: boolean;
}

function EventSettings() {
  const { selectedEventId } = useEvent();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<EventSettings>({
    id: "",
    event_id: selectedEventId || "",
    allow_international_orders: false,
    require_age_confirmation: false,
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchSettings();
    }
  }, [selectedEventId]);

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

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("event_settings")
        .select("*")
        .eq("event_id", selectedEventId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from("event_settings")
          .update(settings)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from("event_settings")
          .insert([settings]);

        if (error) throw error;
      }

      // Refresh settings
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">
        Event Settings
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl bg-white rounded-lg shadow p-6"
      >
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allow_international_orders"
              checked={settings.allow_international_orders}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  allow_international_orders: e.target.checked,
                })
              }
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label
              htmlFor="allow_international_orders"
              className="ml-2 block text-sm text-gray-900"
            >
              Allow International Orders
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="require_age_confirmation"
              checked={settings.require_age_confirmation}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  require_age_confirmation: e.target.checked,
                })
              }
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label
              htmlFor="require_age_confirmation"
              className="ml-2 block text-sm text-gray-900"
            >
              Require Age Confirmation
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EventSettings;
