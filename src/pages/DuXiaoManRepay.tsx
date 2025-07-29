import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { createBusinessOrder } from "@/services/businessOrderService";
import { useAuth } from "@/contexts/AuthContext";

const DuXiaoManRepay = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // 表单状态
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [repayDate, setRepayDate] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [repayerIdCard, setRepayerIdCard] = useState<string>("");
  const [repayerName, setRepayerName] = useState<string>("");
  const [repayLink, setRepayLink] = useState<string>("");
  const [repayQRCode, setRepayQRCode] = useState<string>("");

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

    if (!repayDate) {
      toast.error("请选择还款日期");
      return;
    }

    if (!repayerName.trim()) {
      toast.error("请输入代还人姓名");
      return;
    }

    if (!repayerIdCard.trim()) {
      toast.error("请输入代还人身份证");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        userId: user.id,
        businessType: "度小满代还",
        targetAccount: phoneNumber || repayerIdCard,
        amount: parseFloat(customAmount),
        actualAmount: parseFloat(customAmount),
        accountName: repayerName,
        metadata: {
          repay_date: repayDate,
          phone_number: phoneNumber,
          repayer_id_card: repayerIdCard,
          repayer_name: repayerName,
          repay_link: repayLink,
          repay_qrcode: repayQRCode,
          service_type: "duxiaoman_repay"
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
        <h1 className="text-lg font-semibold ml-4">度小满代还</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 产品信息卡片 */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">度小满</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">度小满代还服务</h3>
              <p className="text-sm text-blue-700">专业的代还服务，安全可靠</p>
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
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
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
          {/* 还款日期 - 必填 */}
          <div>
            <Label htmlFor="repayDate" className="text-base font-medium mb-2 block">
              还款日期 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="repayDate"
                type="date"
                value={repayDate}
                onChange={(e) => setRepayDate(e.target.value)}
                className="bg-white h-12 pl-11"
              />
            </div>
          </div>

          {/* 代还人姓名 - 必填 */}
          <div>
            <Label htmlFor="repayerName" className="text-base font-medium mb-2 block">
              代还人姓名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="repayerName"
              placeholder="请输入代还人姓名"
              value={repayerName}
              onChange={(e) => setRepayerName(e.target.value)}
              className="bg-white h-12"
            />
          </div>

          {/* 代还人身份证 - 必填 */}
          <div>
            <Label htmlFor="repayerIdCard" className="text-base font-medium mb-2 block">
              代还人身份证 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="repayerIdCard"
              placeholder="请输入代还人身份证号码"
              value={repayerIdCard}
              onChange={(e) => setRepayerIdCard(e.target.value)}
              className="bg-white h-12"
              maxLength={18}
            />
          </div>

          {/* 手机号 - 可选 */}
          <div>
            <Label htmlFor="phoneNumber" className="text-base font-medium mb-2 block">
              手机号 <span className="text-gray-400">(可选)</span>
            </Label>
            <Input
              id="phoneNumber"
              placeholder="请输入手机号"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-white h-12"
              maxLength={11}
            />
          </div>

          {/* 还款链接 - 可选 */}
          <div>
            <Label htmlFor="repayLink" className="text-base font-medium mb-2 block">
              还款链接 <span className="text-gray-400">(可选)</span>
            </Label>
            <Input
              id="repayLink"
              placeholder="请输入还款链接"
              value={repayLink}
              onChange={(e) => setRepayLink(e.target.value)}
              className="bg-white h-12"
            />
          </div>

          {/* 还款二维码 - 可选 */}
          <div>
            <Label htmlFor="repayQRCode" className="text-base font-medium mb-2 block">
              还款二维码 <span className="text-gray-400">(可选)</span>
            </Label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="repayQRCode"
                placeholder="请输入二维码内容或上传二维码"
                value={repayQRCode}
                onChange={(e) => setRepayQRCode(e.target.value)}
                className="bg-white h-12 pl-11"
              />
            </div>
          </div>
        </div>

        {/* 操作教程 */}
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-3">操作教程</h4>
          <div className="text-sm text-yellow-700 space-y-2 leading-relaxed">
            <p className="font-medium text-red-600">注意：度小满借款20天出账单，账单后只能代还一期</p>
            <p>订单完成后如未收到,第一时间联系专属客服！</p>
            <p className="font-medium text-red-600">10分钟超时强制确认造成不可逆的损失将有您承担！</p>
            
            <div className="mt-3 space-y-1">
              <p>1. 下单请正确提供提交账号,密码提交前仔细审核</p>
              <p>2. 任何不明白的请您于上级落实了解或在线专属沟通</p>
              <p>3. 还款成功算，非柜等因素不予赔偿</p>
              <p>4. 本业务为网贷代还业务</p>
              <p>5. 本版块为色料,开工时间为24小时,晚上9点至早上9点晚间速度飞快，量大！</p>
              <p>6. 需保持在线确认您的到账情况</p>
            </div>
          </div>
        </Card>

        {/* 提交按钮 */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !customAmount || !repayDate || !repayerName || !repayerIdCard}
          className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600"
        >
          {isLoading ? "提交中..." : `提交订单 ¥${customAmount || "0"}`}
        </Button>
      </div>
    </div>
  );
};

export default DuXiaoManRepay;