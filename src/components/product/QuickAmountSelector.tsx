
interface QuickAmountSelectorProps {
  amounts: string[];
  selectedAmount: string;
  onSelect: (amount: string) => void;
}

export const QuickAmountSelector = ({
  amounts,
  selectedAmount,
  onSelect,
}: QuickAmountSelectorProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">快速选择</div>
        <button 
          className="text-sm text-blue-500"
          onClick={() => window.open('#', '_blank')}
        >
          充值教程
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {amounts.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelect(amount)}
            className={`py-3 rounded-lg ${
              selectedAmount === amount
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {amount}
          </button>
        ))}
      </div>
    </div>
  );
};
