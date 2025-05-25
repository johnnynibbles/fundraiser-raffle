import { createContext } from "react";

interface Event {
  id: string;
  name: string;
}

export interface EventContextType {
  selectedEventId: string;
  selectedEvent: Event | null;
  setSelectedEventId: (id: string) => void;
}

export const EventContext = createContext<EventContextType | undefined>(
  undefined
);
