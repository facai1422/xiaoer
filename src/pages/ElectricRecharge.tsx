import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createBusinessOrder } from "@/services/businessOrderService";
import { useProductConfig } from "@/hooks/useProductConfig";

const ElectricRecharge = () => {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  
  // 获取产品配置
  const { config, loading: configLoading } = useProductConfig({
    productSlug: 'electric-recharge',
    productName: '电费充值',
    defaultConfig: {
      title: '电费充值',
      subtitle: '电费充值',
      description: '便民电费充值服务',
      exchangeRate: 7.2,
      discountRate: 0.95,
      quickAmounts: ['50', '100', '200', '300', '500', '1000']
    }
  });

  const quickAmounts = [50, 100, 200, 300, 500, 1000];
  
  const regions = [
    // 直辖市
    { value: "beijing", label: "北京市" },
    { value: "shanghai", label: "上海市" },
    { value: "tianjin", label: "天津市" },
    { value: "chongqing", label: "重庆市" },
    
    // 华北地区
    { value: "hebei", label: "河北省" },
    { value: "shanxi", label: "山西省" },
    { value: "neimenggu", label: "内蒙古自治区" },
    
    // 东北地区
    { value: "liaoning", label: "辽宁省" },
    { value: "jilin", label: "吉林省" },
    { value: "heilongjiang", label: "黑龙江省" },
    
    // 华东地区
    { value: "jiangsu", label: "江苏省" },
    { value: "zhejiang", label: "浙江省" },
    { value: "anhui", label: "安徽省" },
    { value: "fujian", label: "福建省" },
    { value: "jiangxi", label: "江西省" },
    { value: "shandong", label: "山东省" },
    
    // 华中地区
    { value: "henan", label: "河南省" },
    { value: "hubei", label: "湖北省" },
    { value: "hunan", label: "湖南省" },
    
    // 华南地区
    { value: "guangdong", label: "广东省" },
    { value: "guangxi", label: "广西壮族自治区" },
    { value: "hainan", label: "海南省" },
    
    // 西南地区
    { value: "sichuan", label: "四川省" },
    { value: "guizhou", label: "贵州省" },
    { value: "yunnan", label: "云南省" },
    { value: "xizang", label: "西藏自治区" },
    
    // 西北地区
    { value: "shaanxi", label: "陕西省" },
    { value: "gansu", label: "甘肃省" },
    { value: "qinghai", label: "青海省" },
    { value: "ningxia", label: "宁夏回族自治区" },
    { value: "xinjiang", label: "新疆维吾尔自治区" },
    
    // 特别行政区
    { value: "hongkong", label: "香港特别行政区" },
    { value: "macau", label: "澳门特别行政区" },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("请先登录");
      navigate("/login");
      return;
    }
    setUserId(session.user.id);
    
    // 获取用户余额
    try {
      console.log('获取用户余额，用户ID:', session.user.id);
      
      // 从user_profiles表获取余额，使用user_id字段
      const { data, error } = await supabase
        .from('user_profiles')
        .select('balance')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        console.log('从user_profiles获取到余额:', data.balance);
        setUserBalance(data.balance || 0);
      } else {
        console.error('从user_profiles获取余额失败:', error);
        setUserBalance(0);
      }
    } catch (error) {
      console.error("Error fetching user balance:", error);
      setUserBalance(0);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = value.replace(/[^0-9.]/g, '');
    setCustomAmount(numValue);
    if (numValue) {
      setSelectedAmount(null);
    }
  };

  const getActualAmount = () => {
    if (customAmount) {
      return parseFloat(customAmount);
    }
    return selectedAmount || 0;
  };

  const getPayAmount = () => {
    const amount = getActualAmount();
    const discountAmount = amount * config.discountRate; // 使用动态折扣
    const exchangeRate = config.exchangeRate; // 使用动态汇率
    return parseFloat((discountAmount / exchangeRate).toFixed(2)); // 转换为USDT
  };

  const handleSubmit = async () => {
    if (!accountNumber) {
      toast.error("请输入充值户号");
      return;
    }
    
    if (!selectedRegion) {
      toast.error("请选择地区");
      return;
    }

    const amount = getActualAmount();
    if (!amount || amount <= 0) {
      toast.error("请选择或输入充值金额");
      return;
    }

    if (amount < 10) {
      toast.error("充值金额不能小于10元");
      return;
    }

    if (amount > 2000) {
      toast.error("单次充值金额不能超过2000元");
      return;
    }

    // 检查余额是否足够
    const payAmount = getPayAmount();
    if (payAmount > userBalance) {
      toast.error(`余额不足，需要 ${payAmount.toFixed(2)} USDT，当前余额 ${userBalance.toFixed(2)} USDT`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 获取地区名称
      const regionName = regions.find(r => r.value === selectedRegion)?.label || selectedRegion;
      
      // 创建订单
      const order = await createBusinessOrder({
        userId: userId,
        businessType: '电费充值',
        targetAccount: accountNumber,
        amount: amount,
        actualAmount: getPayAmount(),
        accountName: `${regionName}电力`,
        region: selectedRegion,
        metadata: {
          region: selectedRegion,
          regionName: regionName,
          discount: `${(config.discountRate * 10).toFixed(1)}折`
        }
      });
      
      toast.success("订单创建成功！");
      
      // 跳转到订单详情页
      navigate(`/order/${order.id}`);
    } catch (error) {
      console.error("充值失败:", error);
      // 错误提示已经在服务中处理
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-md hover:bg-gray-100"
                title="返回上一页"
                aria-label="返回上一页"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="ml-4 text-lg font-medium">电费充值</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* 充值信息卡片 */}
        <Card className="p-6">
          {/* 头部居中显示 */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <div className="w-16 h-16 mb-3 flex items-center justify-center">
              <img 
                src="/lovable-uploads/IMG_2918.PNG" 
                alt="电费充值"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h2 className="text-lg font-medium">电费充值</h2>
          </div>

          <div className="space-y-4">
            {/* 充值户号输入 */}
            <div>
              <Label htmlFor="account">充值户号</Label>
              <Input
                id="account"
                type="text"
                placeholder="请输入电费户号"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* 地区选择 */}
            <div>
              <Label htmlFor="region">选择地区</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="mt-1 bg-white border-gray-300">
                  <SelectValue placeholder="请选择地区" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                  {regions.map((region) => (
                    <SelectItem 
                      key={region.value} 
                      value={region.value}
                      className="bg-white hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2"
                    >
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 快捷金额选择 */}
            <div>
              <Label>充值金额</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedAmount === amount
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    ¥{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义金额输入 */}
            <div>
              <Label htmlFor="custom-amount">自定义金额</Label>
              <Input
                id="custom-amount"
                type="text"
                placeholder="请输入金额"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                充值范围：10-2000元
              </p>
            </div>
          </div>
        </Card>

        {/* 费用明细 */}
        {(selectedAmount || customAmount) && (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">充值金额</span>
                <span>¥{getActualAmount()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">优惠折扣</span>
                <span className="text-green-600">{(config.discountRate * 10).toFixed(1)}折</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">优惠金额</span>
                <span className="text-green-600">¥{(getActualAmount() * (1 - config.discountRate)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">参考汇率</span>
                <span className="font-medium">{config.exchangeRate}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>实付金额</span>
                <span className="text-lg text-blue-600">{getPayAmount()} USDT</span>
              </div>
            </div>
          </Card>
        )}

        {/* 提交按钮 */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !accountNumber || !selectedRegion || getActualAmount() <= 0}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? "处理中..." : "立即充值"}
        </Button>

        {/* 温馨提示 */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">温馨提示</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 请确保输入正确的电费户号</li>
            <li>• 充值金额将在1-24小时内到账</li>
            <li>• 如有疑问请联系客服</li>
            <li>• 请确保账户余额充足</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ElectricRecharge; 