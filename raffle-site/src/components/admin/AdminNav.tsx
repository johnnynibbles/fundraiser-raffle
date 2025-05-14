import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useEvent } from "../../lib/context/EventContext";

interface AdminNavProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

interface Event {
  id: string;
  name: string;
}

function AdminNav({ onNavigate, currentSection }: AdminNavProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedEventId, setSelectedEventId } = useEvent();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("raffle_events")
        .select("id, name")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      if (data && data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "events", label: "Events", icon: "🎉" },
    { id: "items", label: "Raffle Items", icon: "🎁" },
    { id: "orders", label: "Orders", icon: "🛍️" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const renderEventSelector = () => (
    <div className="pl-4 mt-2">
      <select
        value={selectedEventId}
        onChange={(e) => {
          const newEventId = e.target.value;
          setSelectedEventId(newEventId);
        }}
        className="w-full px-3 py-2 rounded-md border border-pink-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? (
          <option>Loading events...</option>
        ) : events.length === 0 ? (
          <option>No events available</option>
        ) : (
          events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))
        )}
      </select>
    </div>
  );

  return (
    <nav className="w-64 bg-gradient-to-b from-pink-50 to-purple-50 border-r border-pink-100 h-screen fixed">
      <div className="p-4">
        <h2 className="text-xl font-bold text-purple-600 mb-6">Admin Panel</h2>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors cursor-pointer ${
                  currentSection === item.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
              {item.id === "events" && renderEventSelector()}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default AdminNav;
