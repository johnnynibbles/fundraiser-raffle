import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ItemCard from "../components/ItemCard";
import { supabase } from "../../lib/supabase";
import { useEvent } from "../../lib/context/useEvent";
import { MouseEvent } from "react";
import { RaffleItem } from "../types/store";

interface EventSettings {
  header_image_url: string | null;
}

function Store({ addToCart }: { addToCart: (item: RaffleItem) => void }) {
  const { selectedEventId } = useEvent();
  const [items, setItems] = useState<RaffleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventSettings, setEventSettings] = useState<EventSettings | null>(
    null
  );
  const [flyingItem, setFlyingItem] = useState<{
    x: number;
    y: number;
    image: string;
  } | null>(null);

  useEffect(() => {
    if (selectedEventId) {
      fetchItems(selectedEventId);
      fetchEventSettings(selectedEventId);
    } else {
      setItems([]);
      setIsLoading(false);
      setError("Please select an event to see raffle items.");
    }
  }, [selectedEventId]);

  const fetchEventSettings = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_settings")
        .select("header_image_url")
        .eq("event_id", eventId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        throw error;
      }

      setEventSettings(data);
    } catch (err) {
      console.error("Error fetching event settings:", err);
    }
  };

  const fetchItems = async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("raffle_items")
        .select("*")
        .eq("event_id", eventId)
        .eq("is_available", true)
        .order("item_number", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (item: RaffleItem, event: MouseEvent<Element>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setFlyingItem({
      x,
      y,
      image:
        item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : "",
    });
    addToCart(item);
    setTimeout(() => {
      setFlyingItem(null);
    }, 1000);
  };

  const filteredItems = items.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4">
      {flyingItem && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: flyingItem.x,
            top: flyingItem.y,
            transform: "translate(-50%, -50%)",
            animation: "flyToCart 1s ease-in-out forwards",
          }}
        >
          <img
            src={flyingItem.image}
            alt="Flying item"
            className="w-16 h-16 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}
      <style>
        {`
          @keyframes flyToCart {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(calc(-50% + 100px), calc(-50% - 100px)) scale(0.5);
              opacity: 0;
            }
          }
        `}
      </style>

      {/* Header Image */}
      {eventSettings?.header_image_url && (
        <div className="mb-8 relative w-auto h-48 flex justify-center">
          <img
            src={eventSettings.header_image_url}
            alt="Event header"
            className="h-full object-contain rounded-lg shadow-md"
          />
        </div>
      )}

      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && selectedEventId && (
        <div className="text-center text-gray-500 mt-8">
          No items available for the selected event.
        </div>
      )}

      {!isLoading && !error && !selectedEventId && (
        <div className="text-center text-gray-500 mt-8">
          Please select an event from the admin panel to view items.
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} {...item} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}

      {!isLoading &&
        !error &&
        items.length > 0 &&
        filteredItems.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No items found matching your search for the selected event.
          </div>
        )}
    </div>
  );
}

export default Store;
