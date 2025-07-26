import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RechargeEntry } from "@/types/recharge";
import { useState } from "react";
import { toast } from "sonner";

interface BatchRechargeFormProps {
  entries: RechargeEntry[];
  onEntriesChange: (entries: RechargeEntry[]) => void;
  onSwitchMode: () => void;
}

export const BatchRechargeForm = ({
  entries,
  onEntriesChange,
  onSwitchMode
}: BatchRechargeFormProps) => {
  const [batchText, setBatchText] = useState("");
  const [showBatchInput, setShowBatchInput] = useState(false);

  const handleAddEntry = () => {
    onEntriesChange([...entries, { cardInfo: "", name: "", amount: "" }]);
  };

  const handleRemoveEntry = (index: number) => {
    if (entries.length > 1) {
      onEntriesChange(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index: number, field: keyof RechargeEntry, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    onEntriesChange(newEntries);
  };

  const handleBatchPaste = () => {
    if (!batchText.trim()) {
      toast.error("请输入要批量添加的内容");
      return;
    }

    const lines = batchText.trim().split('\n');
    const newEntries: RechargeEntry[] = [];

    lines.forEach(line => {
      const parts = line.trim().split(/[\s,，\t]+/); // 支持空格、逗号、制表符分割
      
      if (parts.length >= 1 && parts[0]) {
        // 至少有手机号码
        const entry: RechargeEntry = {
          cardInfo: parts[0] || "",
          name: parts[1] || "",
          amount: parts[2] || ""
        };
        
        // 验证手机号码格式
        if (/^1[3-9]\d{9}$/.test(entry.cardInfo)) {
          newEntries.push(entry);
        }
      }
    });

    if (newEntries.length === 0) {
      toast.error("没有识别到有效的手机号码");
      return;
    }

    onEntriesChange(newEntries);
    setBatchText("");
    setShowBatchInput(false);
    toast.success(`成功添加 ${newEntries.length} 个充值项`);
  };

  const getTotalAmount = () => {
    return entries.reduce((sum, entry) => {
      const amount = parseFloat(entry.amount || "0");
      return sum + amount;
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">批量充值</h3>
        <Button 
          variant="outline"
          onClick={onSwitchMode}
        >
          切换单笔充值
        </Button>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <span className="text-blue-700 font-medium">批量添加</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBatchInput(!showBatchInput)}
          >
            {showBatchInput ? "收起" : "批量粘贴"}
          </Button>
        </div>
        
        {showBatchInput && (
          <div className="space-y-3">
            <Textarea
              placeholder={`批量输入格式（每行一个）：
手机号 姓名 金额
例如：
13812345678 张三 100
13987654321 李四 200
或直接粘贴手机号码列表`}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              rows={6}
              className="bg-white"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleBatchPaste}
                className="flex-1"
              >
                解析并添加
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBatchText("");
                  setShowBatchInput(false);
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
      {entries.map((entry, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">充值项 {index + 1}</span>
            {entries.length > 1 && (
              <button
                onClick={() => handleRemoveEntry(index)}
                  className="text-red-500 hover:text-red-700"
              >
                删除
              </button>
            )}
          </div>
          <input
            placeholder="手机号码"
            value={entry.cardInfo}
            onChange={(e) => handleEntryChange(index, "cardInfo", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="姓名(选填)"
            value={entry.name}
            onChange={(e) => handleEntryChange(index, "name", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="充值金额"
            value={entry.amount}
            onChange={(e) => handleEntryChange(index, "amount", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            type="number"
          />
        </div>
      ))}
      </div>
      
      <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleAddEntry}
      >
          + 添加充值项
      </Button>
        
        {entries.length > 0 && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">总计充值项目：</span>
              <span className="font-medium">{entries.length} 个</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-600">总充值金额：</span>
              <span className="font-medium text-orange-600">¥{getTotalAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-600">实付金额 (8折)：</span>
              <span className="font-bold text-green-600">¥{(getTotalAmount() * 0.8).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
