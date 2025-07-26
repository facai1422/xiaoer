import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  Info 
} from "lucide-react";

// 自定义教程内容类型定义
interface CustomTutorialStep {
  title: string;
  items: string[];
  type?: 'info' | 'warning' | 'success' | 'default';
}

interface CustomTutorialContent {
  title: string;
  steps: CustomTutorialStep[];
}

interface TutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: string; // 保留向下兼容
  tutorialContent?: CustomTutorialContent; // 新增自定义教程内容
  productName?: string; // 产品名称，用于生成默认教程
  productSlug?: string; // 产品标识符，用于判断是否显示开发中提示
}

export const TutorialDialog = ({ 
  open, 
  onOpenChange, 
  type = "creditCard", 
  tutorialContent,
  productName = "产品",
  productSlug
}: TutorialDialogProps) => {
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  const handleClose = () => {
    if (neverShowAgain) {
      localStorage.setItem(`hideTutorial_${type}`, "true");
    }
    onOpenChange(false);
  };

  // 获取步骤图标
  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-600" />;
      default:
        return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
          {getStepNumber(stepType)}
        </span>;
    }
  };

  // 获取步骤编号
  const getStepNumber = (stepType: string) => {
    if (stepType === 'default') return '1';
    return '1';
  };

  // 获取步骤颜色类
  const getStepColorClass = (stepType: string) => {
    switch (stepType) {
      case 'warning':
        return 'text-orange-600';
      case 'success':
        return 'text-green-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-blue-600';
    }
  };

  // 渲染自定义教程内容
  const renderCustomTutorialContent = () => {
    if (!tutorialContent) return null;

    return (
      <div className="space-y-6 mt-6">
        {tutorialContent.steps.map((step, stepIndex) => (
          <div key={stepIndex} className="space-y-4">
            <h3 className={`font-medium flex items-center space-x-2 ${getStepColorClass(step.type || 'default')}`}>
              {getStepIcon(step.type || 'default')}
              <span>{step.title}</span>
            </h3>
            <div className="ml-8 space-y-2 text-gray-600">
              {step.items.map((item, itemIndex) => (
                <p key={itemIndex} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Content based on tutorial type (保留原有的默认教程内容)
  const renderDefaultTutorialContent = () => {
    switch (type) {
      case "creditCard":
        return (
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-blue-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
                  1
                </span>
                <span>信用卡还款步骤</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>输入正确的信用卡卡号</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>填写持卡人姓名及开户行信息</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>选择或输入还款金额</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>确认无误后提交订单</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-red-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm text-red-600">
                  !
                </span>
                <span>注意事项</span>
              </h3>
              <p className="ml-8 text-gray-600">
                请确保卡号和持卡人信息准确无误，系统将在1-24小时内完成还款操作
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-green-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
                  ✓
                </span>
                <span>优惠信息</span>
              </h3>
              <p className="ml-8 text-gray-600">
                信用卡还款享受6.5折优惠，比官方渠道更划算
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-purple-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm text-purple-600">
                  i
                </span>
                <span>其他信息</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center justify-between">
                  <span>处理时间：</span>
                  <span className="font-medium">1-24小时</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>最低还款：</span>
                  <span className="font-medium">500元</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>支持银行：</span>
                  <span className="font-medium">工商银行、建设银行、招商银行等</span>
                </p>
              </div>
            </div>
          </div>
        );
        
      case "phoneRecharge":
        return (
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-blue-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
                  1
                </span>
                <span>充值操作步骤</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>确认充值手机号码</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>选择或输入充值金额</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>系统将在10-30分钟内完成充值</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-orange-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-sm text-orange-600">
                  !
                </span>
                <span>注意事项</span>
              </h3>
              <p className="ml-8 text-gray-600">
                充值仅限实名认证的手机号码，确保号码无欠费状态
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-green-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
                  ✓
                </span>
                <span>优惠信息</span>
              </h3>
              <p className="ml-8 text-gray-600">
                全国三网手机充值，享受98折优惠
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-purple-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm text-purple-600">
                  i
                </span>
                <span>其他信息</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center justify-between">
                  <span>处理时间：</span>
                  <span className="font-medium">10-30分钟</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>支持运营商：</span>
                  <span className="font-medium">移动、联通、电信</span>
                </p>
              </div>
            </div>
          </div>
        );
        
      case "utilities":
        return (
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-blue-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
                  1
                </span>
                <span>缴费操作步骤</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>输入正确的户号和户名</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>填写缴费单位名称</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>选择或输入缴费金额</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>系统会在24小时内完成缴费</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-yellow-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-sm text-yellow-600">
                  !
                </span>
                <span>注意事项</span>
              </h3>
              <p className="ml-8 text-gray-600">
                请确保户号和户名准确无误，系统将根据您提供的信息进行缴费
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-green-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
                  ✓
                </span>
                <span>服务优势</span>
              </h3>
              <p className="ml-8 text-gray-600">
                支持全国主要城市的水电气费缴纳，享受8折优惠
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-purple-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm text-purple-600">
                  i
                </span>
                <span>其他信息</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center justify-between">
                  <span>处理时间：</span>
                  <span className="font-medium">1-24小时</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>支持城市：</span>
                  <span className="font-medium">全国主要城市</span>
                </p>
              </div>
            </div>
          </div>
        );
      
      case "douyinCoin":
        return (
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-blue-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
                  1
                </span>
                <span>抖币充值步骤</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>输入正确的抖音账号</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>选择或输入充值金额</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>系统会在30分钟内完成充值</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-red-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm text-red-600">
                  !
                </span>
                <span>注意事项</span>
              </h3>
              <p className="ml-8 text-gray-600">
                抖币充值仅限已实名的账号，请确保账号状态正常
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-green-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
                  ✓
                </span>
                <span>优惠信息</span>
              </h3>
              <p className="ml-8 text-gray-600">
                充值抖币最高享受7折优惠，比官方渠道更划算
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-purple-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm text-purple-600">
                  i
                </span>
                <span>其他信息</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center justify-between">
                  <span>处理时间：</span>
                  <span className="font-medium">10-30分钟</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>最低充值：</span>
                  <span className="font-medium">100元</span>
                </p>
              </div>
            </div>
          </div>
        );
        
      case "kuaishouCoin":
        return (
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-blue-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
                  1
                </span>
                <span>快币充值步骤</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>输入正确的快手账号</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>选择或输入充值金额</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>系统会在30分钟内完成充值</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-red-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm text-red-600">
                  !
                </span>
                <span>注意事项</span>
              </h3>
              <p className="ml-8 text-gray-600">
                快币充值仅限已登录的账号，请确保账号状态正常
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-green-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
                  ✓
                </span>
                <span>优惠信息</span>
              </h3>
              <p className="ml-8 text-gray-600">
                充值快币享受7折优惠，充值越多优惠越大
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-purple-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm text-purple-600">
                  i
                </span>
                <span>其他信息</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center justify-between">
                  <span>处理时间：</span>
                  <span className="font-medium">10-30分钟</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>最低充值：</span>
                  <span className="font-medium">100元</span>
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-blue-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
                  1
                </span>
                <span>充值操作说明</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>填写必要的账户信息</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>选择或输入充值金额</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>确认信息无误后提交订单</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-yellow-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-sm text-yellow-600">
                  !
                </span>
                <span>温馨提示</span>
              </h3>
              <p className="ml-8 text-gray-600">
                请确保提供的信息准确无误，以免影响充值
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-purple-600 font-medium flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm text-purple-600">
                  i
                </span>
                <span>其他信息</span>
              </h3>
              <div className="ml-8 space-y-2 text-gray-600">
                <p className="flex items-center justify-between">
                  <span>处理时间：</span>
                  <span className="font-medium">1-24小时</span>
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  // 获取教程标题
  const getTutorialTitle = () => {
    // 优先使用自定义教程标题
    if (tutorialContent?.title) {
      return tutorialContent.title;
    }

    // 使用产品名称生成标题
    if (productName && productName !== "产品") {
      return `${productName}使用教程`;
    }

    // 根据类型返回默认标题
    switch (type) {
      case "creditCard": return "信用卡还款教程";
      case "phoneRecharge": return "话费充值教程";
      case "utilities": return "水电气费缴纳教程";
      case "douyinCoin": return "抖币充值教程";
      case "kuaishouCoin": return "快币充值教程";
      default: return "充值操作教程";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[90%] max-h-[90vh] overflow-y-auto p-6 rounded-xl bg-gradient-to-b from-white to-gray-50 border-0 shadow-xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
            {getTutorialTitle()}
          </DialogTitle>
        </DialogHeader>
        
        {/* 优先显示自定义教程内容，否则显示默认内容 */}
        {tutorialContent ? renderCustomTutorialContent() : renderDefaultTutorialContent()}

        <DialogFooter className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="neverShow"
              checked={neverShowAgain}
              onCheckedChange={(checked) => setNeverShowAgain(!!checked)}
              className="border-gray-400"
            />
            <label
              htmlFor="neverShow"
              className="text-sm text-gray-500 cursor-pointer"
            >
              已查看，以后都不再显示
            </label>
          </div>
          <Button
            onClick={handleClose}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
