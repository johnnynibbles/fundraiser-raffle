interface ItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  sponsor: string | null;
  item_value: number | null;
  is_over_21: boolean;
  is_local_pickup_only: boolean;
  draw_count: number;
  onAddToCart: (item: any, event: React.MouseEvent) => void;
}

function ItemCard({
  id,
  name,
  description,
  price,
  image_url,
  category,
  sponsor,
  item_value,
  is_over_21,
  is_local_pickup_only,
  draw_count,
  onAddToCart,
}: ItemCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <img
        src={image_url}
        alt={name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h2 className="text-lg font-semibold mb-1">{name}</h2>
      <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-2">
        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
          {category}
        </span>
      </div>
      <p className="text-gray-600 mb-4 flex-grow text-sm">{description}</p>
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
      <div className="flex justify-between items-center mt-auto">
        <p className="text-lg font-medium text-blue-600">${price}</p>
        <button
          onClick={(e) =>
            onAddToCart(
              {
                id,
                name,
                price,
                image_url,
                category,
                sponsor,
                item_value,
                is_over_21,
                is_local_pickup_only,
                draw_count,
              },
              e
            )
          }
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ItemCard;
