import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
}: QuantityControlProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onDecrement}
        disabled={quantity <= 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MinusIcon className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center">{quantity}</span>
      <button
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
      >
        <PlusIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default QuantityControl;
