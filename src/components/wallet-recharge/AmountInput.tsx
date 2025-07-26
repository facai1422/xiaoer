
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface AmountInputProps {
  amount: string;
  setAmount: (amount: string) => void;
}

export const AmountInput = ({ amount, setAmount }: AmountInputProps) => {
  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  return (
    <Card className="p-4 bg-white border border-gray-200">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          充值金额 (USDT)
        </label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="请输入充值金额"
          className="text-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {quickAmounts.map((quickAmount) => (
          <Button
            key={quickAmount}
            variant="outline"
            onClick={() => setAmount(quickAmount.toString())}
            className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
          >
            {quickAmount}
          </Button>
        ))}
      </div>
    </Card>
  );
};
