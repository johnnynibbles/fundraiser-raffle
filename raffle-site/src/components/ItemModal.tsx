import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

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

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RaffleItem;
  onAddToCart: (item: RaffleItem, event: React.MouseEvent) => void;
}

function ItemModal({ isOpen, onClose, item, onAddToCart }: ItemModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? item.image_urls.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === item.image_urls.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    onAddToCart(item, e);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Image Gallery */}
          <div className="relative mb-6">
            {item.image_urls && item.image_urls.length > 0 ? (
              <>
                <img
                  src={item.image_urls[currentImageIndex]}
                  alt={item.name}
                  className="w-full h-96 object-contain rounded-lg"
                />
                {item.image_urls.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 hover:bg-opacity-100"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  </>
                )}
                {/* Thumbnail Navigation */}
                {item.image_urls.length > 1 && (
                  <div className="flex gap-2 mt-2 justify-center">
                    {item.image_urls.map((url, index) => (
                      <button
                        key={url}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden ${
                          index === currentImageIndex
                            ? "ring-2 ring-blue-500"
                            : "opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`${item.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-1 text-gray-600">{item.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Price</h3>
                <p className="mt-1 text-gray-600">${item.price.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Category</h3>
                <p className="mt-1 text-gray-600">{item.category}</p>
              </div>
              {item.sponsor && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Sponsor</h3>
                  <p className="mt-1 text-gray-600">{item.sponsor}</p>
                </div>
              )}
              {item.item_value !== null && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Value</h3>
                  <p className="mt-1 text-gray-600">
                    ${item.item_value.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {item.is_over_21 && (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">
                  21+ Only
                </span>
              )}
              {item.is_local_pickup_only && (
                <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm">
                  Local Pickup Only
                </span>
              )}
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                {item.draw_count} Draw{item.draw_count > 1 ? "s" : ""}
              </span>
            </div>

            {/* Add to Cart Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors font-medium text-lg shadow-sm hover:shadow-md"
              >
                Add to Cart - ${item.price.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemModal;
