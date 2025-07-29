import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { createBusinessOrder } from "@/services/businessOrderService";
import { useAuth } from "@/contexts/AuthContext";

const DiDiFinance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // 表单状态
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [didiAccount, setDidiAccount] = useState<string>("");
  const [didiPassword, setDidiPassword] = useState<string>("");

  // 快捷金额选项
  const quickAmounts = ["5000", "10000", "20000", "30000", "50000"];

  const handleQuickAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount(amount);
  };

  const handleCustomAmountChange = (value: string) => {
    setSelectedAmount("");
    setCustomAmount(value);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    if (!customAmount || parseFloat(customAmount) <= 0) {
      toast.error("请输入有效的金额");
      return;
    }

    if (!didiAccount.trim()) {
      toast.error("请输入滴滴账号");
      return;
    }

    if (!didiPassword.trim()) {
      toast.error("请输入滴滴密码");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        userId: user.id,
        businessType: "滴滴金融",
        targetAccount: didiAccount,
        amount: parseFloat(customAmount),
        actualAmount: parseFloat(customAmount),
        accountName: "",
        metadata: {
          password: didiPassword,
          service_type: "didi_finance"
        }
      };

      await createBusinessOrder(orderData);
      toast.success("订单提交成功！");
      navigate("/orders");
    } catch (error) {
      console.error("提交订单失败:", error);
      toast.error(error instanceof Error ? error.message : "提交订单失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <div className="bg-white p-4 flex items-center shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <h1 className="text-lg font-semibold ml-4">滴滴金融</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 产品信息卡片 */}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">滴滴</span>
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">滴滴金融代还</h3>
              <p className="text-sm text-orange-700">快速便捷的代还服务</p>
            </div>
          </div>
        </Card>

        {/* 快捷金额选择 */}
        <div>
          <Label className="text-base font-medium mb-3 block">快捷金额</Label>
          <div className="grid grid-cols-3 gap-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                className={`py-3 rounded-lg border font-medium transition-all ${
                  selectedAmount === amount
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"
                }`}
                onClick={() => handleQuickAmountSelect(amount)}
              >
                ¥{amount}
              </button>
            ))}
          </div>
        </div>

        {/* 自定义金额 */}
        <div>
          <Label htmlFor="customAmount" className="text-base font-medium mb-3 block">
            自定义金额
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
            <Input
              id="customAmount"
              type="number"
              placeholder="请输入金额"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="pl-8 h-12 text-lg"
            />
          </div>
        </div>

        {/* 表单字段 */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-4">
          <div>
            <Label htmlFor="didiAccount" className="text-base font-medium mb-2 block">
              滴滴账号 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="didiAccount"
              placeholder="请输入滴滴账号"
              value={didiAccount}
              onChange={(e) => setDidiAccount(e.target.value)}
              className="bg-white h-12"
            />
          </div>

          <div>
            <Label htmlFor="didiPassword" className="text-base font-medium mb-2 block">
              滴滴密码 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="didiPassword"
              type="password"
              placeholder="请输入滴滴密码"
              value={didiPassword}
              onChange={(e) => setDidiPassword(e.target.value)}
              className="bg-white h-12"
            />
          </div>
        </div>

        {/* 操作教程 */}
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-3">操作教程</h4>
          <div className="text-sm text-yellow-700 space-y-2 leading-relaxed">
            <p className="font-medium">本代还版块须知:</p>
            <p>滴滴金融可不用自己实名注册，注册有额度后借款提供手机号验证码登录付当天借当天还上号要验证码平台下单后需向平台客服或飞机客服报备订单完成后如未收到第一时间联系专属客服！</p>
            
            <div className="mt-3 space-y-1">
              <p>1. 下单请正确提供提交账号，密码提交前仔细审核</p>
              <p>2. 任何不明白的请您于上级落实了解或在线专属沟通</p>
              <p>3. 还款成功算，非柜等因素不予赔偿</p>
              <p>4. 本业务为网贷上号代还业务</p>
              <p>5. 本版块为色料,开工时间为24小时,晚上9点至早上9点晚间速度飞快，量大!</p>
              <p>6. 需保持在线确认您的到账情况</p>
            </div>
          </div>
        </Card>

        {/* 提交按钮 */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !customAmount || !didiAccount || !didiPassword}
          className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600"
        >
          {isLoading ? "提交中..." : `提交订单 ¥${customAmount || "0"}`}
        </Button>
      </div>
    </div>
  );
};

export default DiDiFinance;