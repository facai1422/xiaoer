
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const Trade = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("sell");
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  
  const tradeData = [
    {
      id: 1,
      name: "速卖宝",
      avatar: "/lovable-uploads/2baefc02-69ab-4bea-83ae-061178e4fcc3.png",
      amount: "472.05",
      limitRange: "20-472",
      price: "7.46",
      paymentMethods: ["微信", "支付宝"]
    },
    {
      id: 2,
      name: "13588329867",
      avatar: "/lovable-uploads/1e1eb59e-049d-45ad-a2ce-5fc38834bc0e.png",
      amount: "31.67",
      limitRange: "10.00-53.67",
      price: "7.40",
      paymentMethods: ["微信", "支付宝"]
    },
    {
      id: 3,
      name: "18932744806",
      avatar: "/lovable-uploads/1e1eb59e-049d-45ad-a2ce-5fc38834bc0e.png",
      amount: "200.00",
      limitRange: "200-200",
      price: "7.35",
      paymentMethods: ["微信"]
    }
  ];

  const handleBuy = (trade: any) => {
    setSelectedTrade(trade);
    setShowBuyDialog(true);
  };

  const confirmBuy = () => {
    if (!buyAmount) {
      toast.error("请输入购买数量");
      return;
    }

    const amount = parseFloat(buyAmount);
    const [min, max] = selectedTrade.limitRange.split("-").map(Number);

    if (amount < min || amount > max) {
      toast.error(`请输入${min}-${max}范围内的数量`);
      return;
    }

    // 创建订单并跳转到订单详情页
    const orderId = Date.now().toString();
    const orderData = {
      id: orderId,
      type: "购买USDT",
      amount: amount,
      price: selectedTrade.price,
      total: (amount * parseFloat(selectedTrade.price)).toFixed(2),
      seller: selectedTrade.name,
      status: "pending",
      paymentMethods: selectedTrade.paymentMethods,
      createTime: new Date().toISOString()
    };

    // 保存订单数据到本地存储
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(orderData);
    localStorage.setItem("orders", JSON.stringify(orders));

    // 关闭弹窗并跳转
    setShowBuyDialog(false);
    navigate(`/orderDetail/${orderId}`);
    toast.success("订单创建成功");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 头部 */}
      <div className="bg-white">
        <div className="flex items-center p-4 border-b">
          <Button 
            variant="ghost" 
            className="mr-2 p-0 hover:bg-transparent"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold flex-1 text-center mr-6">在线交易</h1>
        </div>
        
        {/* 标签页 */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 font-medium ${
              selectedTab === "sell" 
                ? "text-blue-500 border-b-2 border-blue-500" 
                : "text-gray-500"
            }`}
            onClick={() => setSelectedTab("sell")}
          >
            我的出售 ({tradeData.length})
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${
              selectedTab === "orders" 
                ? "text-blue-500 border-b-2 border-blue-500" 
                : "text-gray-500"
            }`}
            onClick={() => navigate("/transaction/orders")}
          >
            交易订单
          </button>
        </div>
      </div>

      {/* 交易列表 */}
      <div className="space-y-2 p-2">
        {tradeData.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex gap-2">
                {item.paymentMethods.map((method) => (
                  <div key={method} className="text-xs px-2 py-1 bg-blue-50 text-blue-500 rounded">
                    {method}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <div className="text-gray-500">出售数量</div>
                <div className="font-medium mt-1">{item.amount}</div>
              </div>
              <div>
                <div className="text-gray-500">数量限制</div>
                <div className="font-medium mt-1">{item.limitRange}</div>
              </div>
              <div>
                <div className="text-gray-500">单价(CNY)</div>
                <div className="font-medium mt-1">{item.price}</div>
              </div>
            </div>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => handleBuy(item)}
            >
              立即查看
            </Button>
          </div>
        ))}
      </div>

      {/* 购买弹窗 */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>USDT购买</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">我要购买(USDT):</label>
              <Input
                type="number"
                placeholder={`请输入${selectedTrade?.limitRange}范围内的数量`}
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            {buyAmount && selectedTrade && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">我要支付(CNY):</label>
                <Input
                  type="text"
                  value={(parseFloat(buyAmount) * parseFloat(selectedTrade.price)).toFixed(2)}
                  readOnly
                  className="text-lg"
                />
              </div>
            )}
            {selectedTrade && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 text-orange-600">
                  <span>支付方式：</span>
                  {selectedTrade.paymentMethods.map((method: string) => (
                    <span key={method} className="px-2 py-1 bg-white rounded text-sm">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              取消
            </Button>
            <Button onClick={confirmBuy} className="bg-blue-500 hover:bg-blue-600">
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trade;
