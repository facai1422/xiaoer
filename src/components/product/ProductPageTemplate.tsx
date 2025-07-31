import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Loader2 } from 'lucide-react';

interface ProductPageTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  children: ReactNode;
  loading?: boolean;
  lastUpdated?: Date | null;
  onSubmit: () => void;
  submitText?: string;
  showTutorial?: boolean;
  onTutorialClick?: () => void;
  tutorialText?: string;
}

export const ProductPageTemplate: React.FC<ProductPageTemplateProps> = ({
  title,
  subtitle,
  description,
  children,
  loading = false,
  lastUpdated,
  onSubmit,
  submitText = "确认提交",
  showTutorial = false,
  onTutorialClick,
  tutorialText = "查看使用教程 →"
}) => {
  const navigate = useNavigate();
  const [userBalance, setUserBalance] = useState<number>(0);

  // 检查用户登录状态并获取余额
  useEffect(() => {
    const checkAuthAndFetchBalance = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // 不自动跳转，只是显示提示
          console.log("用户未登录，显示默认余额");
          setUserBalance(0);
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('balance')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!error && data) {
          setUserBalance(data.balance || 0);
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
        setUserBalance(0);
      }
    };
    
    checkAuthAndFetchBalance();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // 小于1分钟
      return '刚刚更新';
    } else if (diff < 3600000) { // 小于1小时
      const minutes = Math.floor(diff / 60000);
      return `${minutes}分钟前更新`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md mx-auto">
          {/* 页面头部 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-600 mb-1">{subtitle}</p>
            <p className="text-sm text-gray-500">{description}</p>
            

          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">加载配置中...</span>
            </div>
          )}

          {/* 页面内容 */}
          {!loading && (
            <>
              {/* 查看教程链接 */}
              {showTutorial && (
                <div className="mb-4">
                  <Button
                    variant="link"
                    className="text-blue-500 p-0 h-auto font-normal text-sm"
                    onClick={onTutorialClick}
                  >
                    {tutorialText}
                  </Button>
                </div>
              )}

              <div className="bg-white rounded-lg p-4 shadow-sm">
                {/* 子组件内容 */}
                {children}
                

                
                {/* 提交按钮 */}
                <div>
                  <Button 
                    className="w-full bg-[#1a237e] hover:bg-[#0d47a1] text-white py-3"
                    onClick={onSubmit}
                  >
                    {submitText}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}; 