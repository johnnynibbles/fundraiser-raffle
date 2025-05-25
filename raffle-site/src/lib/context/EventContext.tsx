import { ReactNode, useState, useEffect } from "react";
import { supabase } from "../supabase";
import { EventContext } from "./eventContext";

interface Event {
  id: string;
  name: string;
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchCurrentEvent = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("raffle_events")
          .select("id, name")
          .lte("start_date", now)
          .gte("end_date", now)
          .eq("status", "active")
          .order("start_date", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setSelectedEventId(data[0].id);
          setSelectedEvent(data[0]);
          document.title = `${data[0].name} - Raffle Fundraising`;
        }
      } catch (err) {
        console.error("Error fetching current event:", err);
      }
    };

    fetchCurrentEvent();
  }, []);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!selectedEventId) {
        setSelectedEvent(null);
        document.title = "Raffle Fundraising";
        return;
      }

      try {
        const { data, error } = await supabase
          .from("raffle_events")
          .select("id, name")
          .eq("id", selectedEventId)
          .single();

        if (error) throw error;

        if (data) {
          setSelectedEvent(data);
          document.title = `${data.name} - Raffle Fundraising`;
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
      }
    };

    fetchEventDetails();
  }, [selectedEventId]);

  return (
    <EventContext.Provider
      value={{ selectedEventId, selectedEvent, setSelectedEventId }}
    >
      {children}
    </EventContext.Provider>
  );
}
