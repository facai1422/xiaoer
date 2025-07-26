import { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAdminSession } from "@/utils/adminAuth";
import { 
  Search, 
  RefreshCw, 
  Clock, 
  DollarSign, 
  User, 
  FileText,
  Upload,
  Eye,
  Lock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Camera,
  Save
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// 订单类型定义
interface OnlineOrder {
  id: string;
  order_number: string;
  user_account: string;
  user_name: string;
  order_type: string;
  amount: number;
  status: 'pending' | 'grabbed' | 'processing' | 'completed' | 'partially_completed' | 'timeout' | 'cancelled';
  created_at: string;
  updated_at: string;
  processor?: string;
  processor_id?: string;
  grabbed_at?: string;
  completed_amount?: number;
  remaining_amount?: number;
  payment_proof?: string;
  timeout_at?: string;
  description?: string;
  phone_number?: string;
  target_account?: string;
  recharge_amount?: number;
  payment_method?: string;
  payment_channel?: string;
  metadata?: Record<string, string | number | boolean>;
  product_id?: string;
  form_config?: Array<{
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
}

// 订单详情弹窗组件
const OrderDetailModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onUpdateOrder 
}: { 
  order: OnlineOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder: (orderId: string, updates: Partial<OnlineOrder>) => void;
}) => {
  const { toast } = useToast();
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [completedAmount, setCompletedAmount] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (order) {
      setCompletedAmount(order.completed_amount?.toString() || '');
    }
  }, [order]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB限制
        toast({
          variant: "destructive",
          title: "文件过大",
          description: "请选择小于10MB的图片文件"
        });
        return;
      }
      setPaymentProof(file);
    }
  };

  const handleUploadProof = async () => {
    if (!paymentProof || !order) return;

    setIsUploading(true);
    try {
      // 模拟文件上传
      const fileName = `proof_${order.id}_${Date.now()}.${paymentProof.name.split('.').pop()}`;
      
      // 这里应该实际上传到文件存储服务
      setTimeout(() => {
        onUpdateOrder(order.id, {
          payment_proof: fileName,
          status: 'processing'
        });
        
        toast({
          title: "上传成功",
          description: "交易凭证已上传，订单状态已更新"
        });
        
        setIsUploading(false);
        setPaymentProof(null);
      }, 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "请重试"
      });
      setIsUploading(false);
    }
  };

  const handleComplete = (isPartial = false) => {
    if (!order) return;

    if (isPartial) {
      const amount = parseFloat(completedAmount);
      if (isNaN(amount) || amount <= 0 || amount > order.amount) {
        toast({
          variant: "destructive",
          title: "金额错误",
          description: "请输入有效的完成金额"
        });
        return;
      }

      const remaining = order.amount - amount;
      onUpdateOrder(order.id, {
        status: remaining <= 0 ? 'completed' : 'partially_completed',
        completed_amount: amount,
        remaining_amount: remaining
      });

      toast({
        title: "订单已更新",
        description: `已完成 ¥${amount.toFixed(2)}${remaining > 0 ? `，剩余 ¥${remaining.toFixed(2)}` : ''}`
      });
    } else {
      onUpdateOrder(order.id, {
        status: 'completed',
        completed_amount: order.amount,
        remaining_amount: 0
      });

      toast({
        title: "订单完成",
        description: "订单已标记为完成"
      });
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
      >
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-800">订单详情 - {order.order_number}</DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            查看和处理订单详细信息
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">用户账号</label>
                <p className="font-medium text-gray-800">{order.user_account}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">充值号码</label>
                <p className="font-medium text-gray-800">{order.target_account || order.phone_number || order.user_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">订单类型</label>
                <p className="font-medium text-gray-800">{order.order_type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">订单金额</label>
                <p className="font-bold text-lg text-blue-600">¥{order.amount.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">创建时间</label>
                <p className="font-medium text-gray-800">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">更新时间</label>
                <p className="font-medium text-gray-800">{new Date(order.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* 业务订单详情 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">业务订单详情</h3>
            <div className="space-y-3">
              {/* 根据不同业务类型显示相应的表单数据 */}
              {order.metadata && typeof order.metadata === 'object' && (
                <>
                  {/* 话费充值 */}
                  {order.order_type.includes('话费') && (
                    <>
                      {order.metadata.phone && (
                        <div>
                          <label className="text-sm text-gray-600">充值手机号</label>
                          <p className="font-medium text-gray-800">{order.metadata.phone}</p>
                        </div>
                      )}
                      {order.metadata.amount && (
                        <div>
                          <label className="text-sm text-gray-600">充值金额</label>
                          <p className="font-medium text-gray-800">¥{order.metadata.amount}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* 信用卡代还 */}
                  {order.order_type.includes('信用卡') && (
                    <>
                      {order.metadata.name && (
                        <div>
                          <label className="text-sm text-gray-600">持卡人姓名</label>
                          <p className="font-medium text-gray-800">{order.metadata.name}</p>
                        </div>
                      )}
                      {order.metadata.cardNumber && (
                        <div>
                          <label className="text-sm text-gray-600">信用卡号</label>
                          <p className="font-medium text-gray-800">{order.metadata.cardNumber}</p>
                        </div>
                      )}
                      {order.metadata.bankName && (
                        <div>
                          <label className="text-sm text-gray-600">开户银行</label>
                          <p className="font-medium text-gray-800">{order.metadata.bankName}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* 花呗代还 */}
                  {order.order_type.includes('花呗') && (
                    <>
                      {order.metadata.name && (
                        <div>
                          <label className="text-sm text-gray-600">支付宝姓名</label>
                          <p className="font-medium text-gray-800">{order.metadata.name}</p>
                        </div>
                      )}
                      {order.metadata.qrCode && (
                        <div>
                          <label className="text-sm text-gray-600">花呗二维码</label>
                          <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                            {/* 检查是否为图片URL */}
                            {(typeof order.metadata.qrCode === 'string' && (order.metadata.qrCode.startsWith('http') || order.metadata.qrCode.startsWith('data:image') || order.metadata.qrCode.startsWith('blob:'))) ? (
                              <div className="text-center">
                                <img 
                                  src={order.metadata.qrCode} 
                                  alt="花呗二维码" 
                                  className="max-w-full h-auto max-h-48 mx-auto rounded border shadow-sm"
                                  onError={(e) => {
                                    // 如果图片加载失败，显示简洁的错误信息
                                    const imgElement = e.currentTarget as HTMLImageElement;
                                    const parent = imgElement.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="text-center py-3">
                                          <div class="w-12 h-12 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                          </div>
                                          <p class="text-sm text-gray-500">二维码图片</p>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="text-center py-3">
                                <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-500">二维码图片</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* 抖音/快手币充值 */}
                  {(order.order_type.includes('抖') || order.order_type.includes('快')) && (
                    <>
                      {order.metadata.account && (
                        <div>
                          <label className="text-sm text-gray-600">账号</label>
                          <p className="font-medium text-gray-800">{order.metadata.account}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* 网易游戏 */}
                  {order.order_type.includes('网易') && (
                    <>
                      {order.metadata.gameType && (
                        <div>
                          <label className="text-sm text-gray-600">游戏类型</label>
                          <p className="font-medium text-gray-800">{order.metadata.gameType}</p>
                        </div>
                      )}
                      {order.metadata.account && (
                        <div>
                          <label className="text-sm text-gray-600">游戏账号</label>
                          <p className="font-medium text-gray-800">{order.metadata.account}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* 燃气缴费 */}
                  {order.order_type.includes('燃气') && (
                    <>
                      {order.metadata.account && (
                        <div>
                          <label className="text-sm text-gray-600">燃气户号</label>
                          <p className="font-medium text-gray-800">{order.metadata.account}</p>
                        </div>
                      )}
                      {order.metadata.company && (
                        <div>
                          <label className="text-sm text-gray-600">燃气公司</label>
                          <p className="font-medium text-gray-800">{order.metadata.company}</p>
                        </div>
                      )}
                      {order.metadata.customerName && (
                        <div>
                          <label className="text-sm text-gray-600">户主姓名</label>
                          <p className="font-medium text-gray-800">{order.metadata.customerName}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* 通用字段显示 */}
                  {Object.entries(order.metadata).map(([key, value]) => {
                    // 跳过已经显示的字段
                    const skipFields = ['phone', 'amount', 'name', 'cardNumber', 'bankName', 'qrCode', 'account', 'gameType', 'company', 'customerName'];
                    if (skipFields.includes(key) || !value) return null;
                    
                    // 字段标签映射
                    const fieldLabelMap: Record<string, string> = {
                      'discount': '折扣',
                      'exchange_rate': '汇率',
                      'email': '邮箱',
                      'address': '地址',
                      'remark': '备注',
                      'region': '地区',
                      'type': '类型',
                      'description': '说明'
                    };
                    
                    const displayLabel = fieldLabelMap[key] || key;
                    
                    return (
                      <div key={key}>
                        <label className="text-sm text-gray-600">{displayLabel}</label>
                        <p className="font-medium text-gray-800">{String(value)}</p>
                      </div>
                    );
                  })}
                </>
              )}
              
              {/* 原有的基本字段 */}
              {order.phone_number && (
                <div>
                  <label className="text-sm text-gray-600">手机号码</label>
                  <p className="font-medium text-gray-800">{order.phone_number}</p>
                </div>
              )}
              {order.payment_method && (
                <div>
                  <label className="text-sm text-gray-600">支付方式</label>
                  <p className="font-medium text-gray-800">{order.payment_method}</p>
                </div>
              )}
              {order.recharge_amount && (
                <div>
                  <label className="text-sm text-gray-600">订单金额</label>
                  <p className="font-medium text-gray-800">¥{order.recharge_amount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* 处理信息 */}
          {order.status !== 'pending' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">处理信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">处理人</label>
                  <p className="font-medium text-gray-800">{order.processor || '未分配'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">抢单时间</label>
                  <p className="font-medium text-gray-800">
                    {order.grabbed_at ? new Date(order.grabbed_at).toLocaleString() : '未抢单'}
                  </p>
                </div>
                {order.completed_amount !== undefined && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">已完成金额</label>
                      <p className="font-bold text-green-600">¥{order.completed_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">剩余金额</label>
                      <p className="font-bold text-orange-600">¥{(order.remaining_amount || 0).toFixed(2)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 上传凭证 */}
          {order.status === 'grabbed' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">上传交易凭证</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择凭证图片
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="选择交易凭证图片"
                    aria-label="选择交易凭证图片文件"
                  />
                </div>
                {paymentProof && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{paymentProof.name}</span>
                    <button
                      onClick={handleUploadProof}
                      disabled={isUploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isUploading ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          上传中...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          上传凭证
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 完成订单 */}
          {order.status === 'processing' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">完成订单</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    实际完成金额（部分完成时填写）
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={order.amount}
                    step="0.01"
                    value={completedAmount}
                    onChange={(e) => setCompletedAmount(e.target.value)}
                    placeholder={`最大金额：¥${order.amount.toFixed(2)}`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleComplete(false)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    全部完成
                  </button>
                  <button
                    onClick={() => handleComplete(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
                  >
                    <Timer className="h-5 w-5 mr-2" />
                    部分完成
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="pt-6">
          <Button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-base"
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const OnlineOrdersPage = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [autoGrab, setAutoGrab] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    grabbed: 0,
    processing: 0,
    completed: 0,
    timeout: 0
  });

  // 从数据库获取真实订单数据
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const adminSession = getAdminSession();
      if (!adminSession) {
        toast({
          variant: "destructive",
          title: "权限错误",
          description: "请先登录管理员账户"
        });
        return;
      }
      
      // 从recharge_orders获取业务类型的订单（order_type = 'business'）
      const { data: businessOrders, error: businessError } = await supabase
        .from('recharge_orders')
        .select('*')
        .eq('order_type', 'business')  // 只显示业务充值订单
        .order('created_at', { ascending: false });

      if (businessError) {
        console.error('获取业务订单失败:', businessError);
        toast({
          variant: "destructive",
          title: "数据获取失败",
          description: "获取业务订单数据时发生错误"
        });
        return;
      }

      // 获取用户邮箱信息
      const userIds = [...new Set((businessOrders || []).map(order => order.user_id))];
      const userEmailMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        // 从user_profiles表获取用户信息
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, email, username')
          .in('user_id', userIds);
          
        if (profiles) {
          profiles.forEach(profile => {
            // 优先使用邮箱，然后用户名，最后是用户ID
            userEmailMap[profile.user_id] = profile.email || profile.username || `用户${profile.user_id.slice(0, 8)}`;
          });
        }
        
        // 如果user_profiles表没有数据，从users表获取
        const missingUserIds = userIds.filter(id => !userEmailMap[id]);
        if (missingUserIds.length > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('id, email')
            .in('id', missingUserIds);
            
          if (users) {
            users.forEach(user => {
              userEmailMap[user.id] = user.email || `用户${user.id.slice(0, 8)}`;
            });
          }
        }
      }

      // 转换数据格式以匹配OnlineOrder接口
      const formattedOrders: OnlineOrder[] = (businessOrders || []).map(order => {
        // 根据payment_method映射业务名称
        const businessNameMap: Record<string, string> = {
          '话费充值': '话费充值',
          '信用卡还款': '信用卡代还',
          '花呗还款': '花呗代还',
          '抖音币充值': '抖币充值',
          '快手币充值': '快币充值',
          '网易游戏充值': '网易游戏',
          '燃气缴费': '燃气缴费',
          '加油卡充值': '石化加油卡',
          '放心借': '放心借'
        };
        
        const businessName = businessNameMap[order.payment_method] || order.payment_method || '在线业务';
        
        // 安全地解析metadata
        let metadata: Record<string, string | number | boolean> = {};
        if (order.metadata && typeof order.metadata === 'object' && !Array.isArray(order.metadata)) {
          metadata = order.metadata as Record<string, string | number | boolean>;
        }
        
        return {
          id: order.id,
          order_number: order.order_number,
          user_account: userEmailMap[order.user_id] || `用户${order.user_id.slice(0, 8)}`,
          user_name: order.user_name || order.name || '未知',
          order_type: businessName,
          amount: order.amount,
          status: mapOrderStatus(order.status),
          created_at: order.created_at || '',
          updated_at: order.updated_at || '',
          description: order.remark || order.name || `${businessName}订单`,
          phone_number: order.phone_number,
          target_account: order.target_account,
          recharge_amount: order.recharge_amount || order.amount,
          payment_method: order.payment_method,
          payment_channel: order.payment_channel,
          metadata: metadata,
          product_id: order.product_id
        };
      });

      setOrders(formattedOrders);
      
      // 计算统计数据
      const total = formattedOrders.length;
      const pending = formattedOrders.filter(o => o.status === 'pending').length;
      const grabbed = formattedOrders.filter(o => o.status === 'grabbed').length;
      const processing = formattedOrders.filter(o => o.status === 'processing').length;
      const completed = formattedOrders.filter(o => o.status === 'completed' || o.status === 'partially_completed').length;
      const timeout = formattedOrders.filter(o => o.status === 'timeout').length;
      
      setStats({ total, pending, grabbed, processing, completed, timeout });
      
    } catch (error) {
      console.error('获取订单数据异常:', error);
      toast({
        variant: "destructive",
        title: "系统错误",
        description: "获取订单数据时发生异常"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // 映射订单状态
  const mapOrderStatus = (status: string): OnlineOrder['status'] => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'grabbed':
      case 'proof_uploaded':
        return 'grabbed';
      case 'processing':
        return 'processing';
      case 'completed':
      case 'confirmed':
        return 'completed';
      case 'cancelled':
      case 'timeout':
        return 'timeout';
      default:
        return 'pending';
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 自动抢单逻辑
  useEffect(() => {
    if (!autoGrab) return;

    const interval = setInterval(() => {
      setOrders(prevOrders => {
        const pendingOrders = prevOrders.filter(o => o.status === 'pending');
        if (pendingOrders.length > 0) {
          const orderToGrab = pendingOrders[0];
          toast({
            title: "自动抢单成功",
            description: `已自动抢取订单 ${orderToGrab.order_number}`
          });
          
          return prevOrders.map(order => 
            order.id === orderToGrab.id 
              ? {
                  ...order,
                  status: 'grabbed' as const,
                  processor: '自动抢单-管理员',
                  processor_id: 'admin_auto',
                  grabbed_at: new Date().toISOString(),
                  timeout_at: new Date(Date.now() + 20 * 60 * 1000).toISOString()
                }
              : order
          );
        }
        return prevOrders;
      });
    }, 3000); // 每3秒检查一次

    return () => clearInterval(interval);
  }, [autoGrab, toast]);

  // 订单超时检查
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.status === 'grabbed' && order.timeout_at) {
            const timeoutTime = new Date(order.timeout_at).getTime();
            if (Date.now() > timeoutTime) {
              toast({
                variant: "destructive",
                title: "订单超时",
                description: `订单 ${order.order_number} 已超时，自动释放`
              });
              
              return {
                ...order,
                status: 'pending' as const,
                processor: undefined,
                processor_id: undefined,
                grabbed_at: undefined,
                timeout_at: undefined
              };
            }
          }
          return order;
        });
      });
    }, 60000); // 每分钟检查一次

    return () => clearInterval(interval);
  }, [toast]);

  // 抢单操作
  const handleGrabOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('recharge_orders')
        .update({
          status: 'proof_uploaded',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('抢单失败:', error);
        toast({
          variant: "destructive",
          title: "操作失败",
          description: "抢单操作失败"
        });
        return;
      }

      toast({
        title: "抢单成功",
        description: "订单已成功抢取"
      });
      
      fetchOrders();
    } catch (error) {
      console.error('抢单异常:', error);
      toast({
        variant: "destructive",
        title: "系统错误",
        description: "抢单时发生异常"
      });
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('recharge_orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('完成订单失败:', error);
        toast({
          variant: "destructive",
          title: "操作失败",
          description: "完成订单操作失败"
        });
        return;
      }

      toast({
        title: "订单完成",
        description: "订单已标记为完成"
      });
      
      fetchOrders();
    } catch (error) {
      console.error('完成订单异常:', error);
      toast({
        variant: "destructive",
        title: "系统错误",
        description: "完成订单时发生异常"
      });
    }
  };

  // 查看详情
  const handleViewDetail = (order: OnlineOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // 更新订单
  const handleUpdateOrder = (orderId: string, updates: Partial<OnlineOrder>) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, ...updates, updated_at: new Date().toISOString() }
          : order
      )
    );
  };

  // 获取状态标签
  const getStatusBadge = (status: OnlineOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />待处理</Badge>;
      case 'grabbed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Upload className="w-3 h-3 mr-1" />已抢单</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-purple-600 border-purple-600"><Clock className="w-3 h-3 mr-1" />处理中</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>;
             case 'partially_completed':
         return <Badge variant="outline" className="text-orange-600 border-orange-600"><AlertTriangle className="w-3 h-3 mr-1" />部分完成</Badge>;
      case 'timeout':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />已超时</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  // 筛选订单
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.user_account.toLowerCase().includes(searchLower) ||
      order.user_name.toLowerCase().includes(searchLower) ||
      order.order_type.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center p-12 min-h-screen"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="text-center bg-white/95 backdrop-blur-sm p-12 rounded-2xl shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 animate-spin">
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </div>
          <p className="text-xl text-gray-800 font-medium">加载订单数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 neu-fade-in"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}
    >
      <div className="max-w-full mx-auto space-y-8">
        {/* 统计卡片 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="group hover:scale-105 transition-all duration-300 neu-slide-in">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-8 w-8 text-white/80" />
                  <span className="text-3xl font-bold">{stats.total}</span>
                </div>
                <p className="text-white/80 text-sm font-medium">订单总数</p>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-300 neu-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-white/80 animate-pulse" />
                  <span className="text-3xl font-bold">{stats.pending}</span>
                </div>
                <p className="text-white/80 text-sm font-medium">待抢单</p>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-300 neu-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Lock className="h-8 w-8 text-white/80" />
                  <span className="text-3xl font-bold">{stats.grabbed}</span>
                </div>
                <p className="text-white/80 text-sm font-medium">已锁定</p>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-300 neu-slide-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Timer className="h-8 w-8 text-white/80" />
                  <span className="text-3xl font-bold">{stats.processing}</span>
                </div>
                <p className="text-white/80 text-sm font-medium">处理中</p>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-300 neu-slide-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-8 w-8 text-white/80" />
                  <span className="text-3xl font-bold">{stats.completed}</span>
                </div>
                <p className="text-white/80 text-sm font-medium">已完成</p>
              </div>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all duration-300 neu-slide-in" style={{ animationDelay: '0.5s' }}>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-8 w-8 text-white/80" />
                  <span className="text-3xl font-bold">{stats.timeout}</span>
                </div>
                <p className="text-white/80 text-sm font-medium">超时订单</p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和操作栏 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 neu-fade-in">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索订单（订单号、用户账号、姓名、订单类型）..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button 
              onClick={fetchOrders}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>刷新数据</span>
            </button>
          </div>
        </div>

        {/* 订单列表 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden neu-fade-in">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">订单列表</h2>
                <p className="text-gray-600">
                  找到 <span className="font-semibold text-purple-600 text-lg">{filteredOrders.length}</span> 个订单
                  {searchTerm && (
                    <span className="text-gray-500"> (搜索: "<span className="font-medium text-gray-700">{searchTerm}</span>")</span>
                  )}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-xl shadow-lg">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-6 w-6 text-purple-600 animate-pulse" />
                    <span className="font-medium text-gray-800">自动抢单</span>
                    <Switch
                      checked={autoGrab}
                      onCheckedChange={setAutoGrab}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">订单编号</TableHead>
                  <TableHead className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">用户账号</TableHead>
                  <TableHead className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">订单类型</TableHead>
                  <TableHead className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">订单金额</TableHead>
                  <TableHead className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">订单状态</TableHead>
                  <TableHead className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">创建时间</TableHead>
                  <TableHead className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">处理人</TableHead>
                  <TableHead className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-xl text-gray-600 font-medium mb-2">
                          {searchTerm ? '未找到匹配的订单' : '暂无订单数据'}
                        </p>
                        {searchTerm && (
                          <p className="text-gray-500">请尝试其他搜索关键词</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, index) => (
                    <TableRow 
                      key={order.id} 
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-200 neu-slide-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <TableCell className="py-4 px-6">
                        <div className="font-mono font-semibold text-gray-800 text-sm">
                          {order.order_number}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{order.user_account}</div>
                          <div className="text-xs text-gray-500 mt-1">{order.user_name}</div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {order.order_type}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <div>
                          <div className="font-bold text-lg text-gray-800">
                            ¥{order.amount.toFixed(2)}
                          </div>
                          {order.completed_amount !== undefined && (
                            <div className="text-xs text-gray-500 mt-1">
                              已完成: ¥{order.completed_amount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        {getStatusBadge(order.status)}
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <div>
                          <div className="text-sm text-gray-800">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <div>
                          <div className="text-sm text-gray-800">
                            {order.processor || '未分配'}
                          </div>
                          {order.grabbed_at && (
                            <div className="text-xs text-gray-500">
                              {new Date(order.grabbed_at).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleGrabOrder(order.id)}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              抢单
                            </button>
                          )}
                          
                          {order.status === 'grabbed' && (
                            <button
                              onClick={() => handleCompleteOrder(order.id)}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              完成订单
                            </button>
                          )}
                          
                          {order.status === 'processing' && (
                            <button
                              onClick={() => handleCompleteOrder(order.id)}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              确认完成
                            </button>
                          )}
                          
                          {(order.status === 'grabbed' || order.status === 'processing' || order.status === 'completed' || order.status === 'partially_completed') && (
                            <button
                              onClick={() => handleViewDetail(order)}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看详情
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* 订单详情弹窗 */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        onUpdateOrder={handleUpdateOrder}
      />
    </div>
  );
};

export default OnlineOrdersPage;
