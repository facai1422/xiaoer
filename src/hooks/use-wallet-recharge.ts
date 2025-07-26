import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { createRechargeOrder, getPaymentAddresses } from "@/services/rechargeService";
import { useAuth } from "./useAuth";

interface PaymentAddress {
  id: string;
  address: string;
  type: string;
  is_active: boolean;
}

interface RechargeOrderData {
  id: string;
  order_number: string;
  amount: number;
  status: string;
  created_at: string;
}

export const useWalletRecharge = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<PaymentAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<RechargeOrderData | null>(null);
  const [addresses, setAddresses] = useState<PaymentAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const isMounted = useRef(true);
  const lastSubmitTime = useRef(0);

  // 获取支付地址
  const loadAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    try {
      const result = await getPaymentAddresses();
      if (isMounted.current) {
        setAddresses(result || []);
        // 如果还没有选中地址且有可用地址，自动选择第一个
        if (!selectedAddress && result && result.length > 0) {
          setSelectedAddress(result[0]);
        }
      }
    } catch (error) {
      console.error('获取支付地址错误:', error);
      if (isMounted.current) {
        setAddresses([]);
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingAddresses(false);
      }
    }
  }, []); // 移除selectedAddress依赖，避免循环

  // 初始加载地址
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user, loadAddresses]);

  const refreshAddresses = useCallback(() => {
    loadAddresses();
  }, [loadAddresses]);

  // 处理充值
  const handleRecharge = useCallback(async () => {
    if (!isMounted.current) return;
    
    if (!user) {
      toast.error("请先登录");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("请输入有效的充值金额");
      return;
    }

    if (!selectedAddress) {
      toast.error("请选择支付地址");
      return;
    }

    // 防止重复提交（2秒内）
    const now = Date.now();
    if (isSubmitting || (now - lastSubmitTime.current < 2000)) {
      return;
    }

    setIsSubmitting(true);
    lastSubmitTime.current = now;
    
    try {
      const order = await createRechargeOrder({
        userId: user.id,
        phone: user.phone || "",
        amount: parseFloat(amount),
        type: "USDT充值"
      });

      if (isMounted.current && order) {
        setCurrentOrder(order);
        setOrderDialogOpen(true);
        toast.success("充值订单创建成功");
      }
    } catch (error) {
      console.error("创建充值订单失败:", error);
      if (isMounted.current) {
        toast.error("创建充值订单失败，请重试");
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }, [user, amount, selectedAddress, isSubmitting]);

  // 清理函数
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    amount,
    setAmount,
    selectedAddress,
    setSelectedAddress,
    isSubmitting,
    orderDialogOpen,
    setOrderDialogOpen,
    currentOrder,
    addresses,
    isLoadingAddresses,
    handleRecharge,
    refreshAddresses
  };
};
