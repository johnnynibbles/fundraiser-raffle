interface ItemCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  onAddToCart: (item: any, event: React.MouseEvent) => void;
}

function ItemCard({
  id,
  name,
  description,
  price,
  imageUrl,
  onAddToCart,
}: ItemCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h2 className="text-lg font-semibold mb-2">{name}</h2>
      <p className="text-gray-600 mb-4 flex-grow">{description}</p>
      <div className="flex justify-between items-center mt-auto">
        <p className="text-lg font-medium text-blue-600">${price}</p>
        <button
          onClick={(e) => onAddToCart({ id, name, price, imageUrl }, e)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ItemCard;
