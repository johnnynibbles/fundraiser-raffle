import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

interface QuantityControlProps {
  quantity: number;
  onUpdate: (delta: number) => void;
}

function QuantityControl({ quantity, onUpdate }: QuantityControlProps) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => onUpdate(-1)}
        className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200"
        disabled={quantity === 0}
      >
        <MinusIcon className="h-3.5 w-3.5" />
      </button>
      <span className="w-10 text-center font-medium py-1 bg-white">
        {quantity}
      </span>
      <button
        onClick={() => onUpdate(1)}
        className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border-l border-gray-200"
      >
        <PlusIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default QuantityControl;
