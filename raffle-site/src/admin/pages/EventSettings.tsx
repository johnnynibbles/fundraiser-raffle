import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useEvent } from "../../lib/context/useEvent";

interface EventSettings {
  id: string;
  event_id: string;
  allow_international_orders: boolean;
  require_age_confirmation: boolean;
  header_image_url: string | null;
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
    header_image_url: null,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const getPreviousEventSettings = useCallback(async () => {
    try {
      const { data: previousEvent, error: eventError } = await supabase
        .from("raffle_events")
        .select("id")
        .lt("start_date", new Date().toISOString())
        .order("start_date", { ascending: false })
        .limit(1)
        .single();

      if (eventError) throw eventError;

      if (previousEvent) {
        const { data: previousSettings, error: settingsError } = await supabase
          .from("event_settings")
          .select("*")
          .eq("event_id", previousEvent.id)
          .single();

        if (settingsError && settingsError.code !== "PGRST116")
          throw settingsError;

        if (previousSettings) {
          const { ...settingsWithoutId } = previousSettings;
          return {
            ...settingsWithoutId,
            event_id: selectedEventId || "",
          };
        }
      }

      return {
        event_id: selectedEventId || "",
        allow_international_orders: false,
        require_age_confirmation: false,
        header_image_url: null,
      };
    } catch (err) {
      console.error("Error fetching previous settings:", err);
      return {
        event_id: selectedEventId || "",
        allow_international_orders: false,
        require_age_confirmation: false,
        header_image_url: null,
      };
    }
  }, [selectedEventId]);

  const fetchSettings = useCallback(async () => {
    try {
      const { data: existingSettings, error: fetchError } = await supabase
        .from("event_settings")
        .select("*")
        .eq("event_id", selectedEventId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingSettings) {
        setSettings(existingSettings);
      } else {
        const defaultSettings = await getPreviousEventSettings();
        setSettings(defaultSettings);

        const { error: upsertError } = await supabase
          .from("event_settings")
          .upsert([defaultSettings], {
            onConflict: "event_id",
            ignoreDuplicates: true,
          });

        if (upsertError) throw upsertError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
    }
  }, [selectedEventId, getPreviousEventSettings]);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchSettings();
    }
  }, [selectedEventId, fetchSettings]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEventId) return;

    try {
      setUploadingImage(true);
      setError(null);

      // Upload image to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedEventId}/header-image.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("event-headers")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("event-headers").getPublicUrl(fileName);

      // Update settings with new image URL
      setSettings((prev) => ({
        ...prev,
        header_image_url: publicUrl,
      }));

      // Save settings to database
      if (settings.id) {
        const { error: updateError } = await supabase
          .from("event_settings")
          .update({ header_image_url: publicUrl })
          .eq("id", settings.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("event_settings")
          .insert([{ ...settings, header_image_url: publicUrl }]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from("event_settings")
        .upsert([settings], {
          onConflict: "event_id",
          ignoreDuplicates: true,
        });

      if (error) throw error;

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
          {/* Header Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Header Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              {settings.header_image_url && (
                <div className="relative w-48 h-16">
                  <img
                    src={settings.header_image_url}
                    alt="Header preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100
                    cursor-pointer"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended size: 1200x400 pixels
                </p>
              </div>
            </div>
          </div>

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
