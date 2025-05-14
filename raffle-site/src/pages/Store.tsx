import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ItemCard from "../components/ItemCard";
import { supabase } from "../lib/supabase";
import { useEvent } from "../lib/context/EventContext";

interface RaffleItem {
  id: string;
  event_id: string;
  item_number: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  sponsor: string | null;
  item_value: number | null;
  is_over_21: boolean;
  is_local_pickup_only: boolean;
  is_available: boolean;
  draw_count: number;
  created_at: string;
}

function Store({ addToCart }: { addToCart: (item: any) => void }) {
  const { selectedEventId } = useEvent();
  const [items, setItems] = useState<RaffleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flyingItem, setFlyingItem] = useState<{
    x: number;
    y: number;
    image: string;
  } | null>(null);

  useEffect(() => {
    if (selectedEventId) {
      fetchItems(selectedEventId);
    } else {
      // Optionally, clear items or show a message if no event is selected
      setItems([]);
      setIsLoading(false);
      setError("Please select an event to see raffle items.");
    }
  }, [selectedEventId]);

  const fetchItems = async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("raffle_items")
        .select("*")
        .eq("event_id", eventId)
        .eq("is_available", true) // Only show available items
        .order("item_number", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (item: any, event: React.MouseEvent) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    setFlyingItem({ x, y, image: item.image_url });
    addToCart(item);

    // Remove the flying item after animation completes
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
      <h1 className="text-2xl font-bold mb-4">Store</h1>
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
