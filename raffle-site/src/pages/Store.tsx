import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ItemCard from "../components/ItemCard";

const items = [
  {
    id: 1,
    name: "Raffle Item 1",
    description:
      "A fantastic prize package including luxury items and exclusive experiences.",
    price: 5,
    imageUrl: "https://placehold.co/400x300?text=Raffle+Item+1",
  },
  {
    id: 2,
    name: "Raffle Item 2",
    description: "An amazing collection of premium products and services.",
    price: 5,
    imageUrl: "https://placehold.co/400x300?text=Raffle+Item+2",
  },
  {
    id: 3,
    name: "Raffle Item 3",
    description:
      "A unique opportunity to win extraordinary prizes and special rewards.",
    price: 1,
    imageUrl: "https://placehold.co/400x300?text=Raffle+Item+3",
  },
  {
    id: 4,
    name: "Raffle Item 4",
    description:
      "A unique opportunity to win extraordinary prizes and special rewards.",
    price: 1,
    imageUrl: "https://placehold.co/400x300?text=Raffle+Item+4",
  },
];

function Store({ addToCart }: { addToCart: (item: any) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [flyingItem, setFlyingItem] = useState<{
    x: number;
    y: number;
    image: string;
  } | null>(null);

  const handleAddToCart = (item: any, event: React.MouseEvent) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    setFlyingItem({ x, y, image: item.imageUrl });
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} {...item} onAddToCart={handleAddToCart} />
        ))}
      </div>
      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No items found matching your search.
        </div>
      )}
    </div>
  );
}

export default Store;
