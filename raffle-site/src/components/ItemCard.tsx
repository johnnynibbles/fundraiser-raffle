import { useState } from "react";
import ItemModal from "./ItemModal";

interface RaffleItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  category: string;
  sponsor: string | null;
  item_value: number | null;
  is_over_21: boolean;
  is_local_pickup_only: boolean;
  draw_count: number;
}

interface ItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  category: string;
  sponsor: string | null;
  item_value: number | null;
  is_over_21: boolean;
  is_local_pickup_only: boolean;
  draw_count: number;
  onAddToCart: (item: RaffleItem, event: React.MouseEvent) => void;
}

function ItemCard({
  id,
  name,
  description,
  price,
  image_urls,
  category,
  sponsor,
  item_value,
  is_over_21,
  is_local_pickup_only,
  draw_count,
  onAddToCart,
}: ItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const item: RaffleItem = {
    id,
    name,
    description,
    price,
    image_urls,
    category,
    sponsor,
    item_value,
    is_over_21,
    is_local_pickup_only,
    draw_count,
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal when clicking the button
    onAddToCart(item, e);
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
        <div className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
          {image_urls && image_urls.length > 0 ? (
            <img
              src={image_urls[0]}
              alt={name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
          <h2 className="text-lg font-semibold mb-1">{name}</h2>
          <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-2">
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
              {category}
            </span>
          </div>
          <p className="text-gray-600 mb-4 flex-grow text-sm line-clamp-2">
            {description}
          </p>
          <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-2">
            {sponsor && (
              <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">
                Sponsor: {sponsor}
              </span>
            )}
            {item_value !== null && (
              <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
                Value: ${item_value}
              </span>
            )}
            {is_over_21 && (
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded">
                21+ Only
              </span>
            )}
            {is_local_pickup_only && (
              <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                Local Pickup
              </span>
            )}
            <span className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded">
              Draws: {draw_count}
            </span>
          </div>
        </div>
        <div className="mt-auto flex justify-between items-center">
          <p className="text-lg font-medium text-blue-600">${price}</p>
          <button
            onClick={handleAddToCart}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
        onAddToCart={onAddToCart}
      />
    </>
  );
}

export default ItemCard;
