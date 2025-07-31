import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ConfigurableServiceForm } from "@/components/product/ConfigurableServiceForm";
import { TutorialDialog } from "@/components/product/TutorialDialog";
import { toast } from "sonner";
import { 
  getConfigurableServiceBySlug,
  type ConfigurableService 
} from "@/services/configurableServicesService";

const ConfigurableServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [service, setService] = useState<ConfigurableService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    loadService();
  }, [slug]);

  const loadService = async () => {
    if (!slug) return;
    
    try {
      setIsLoading(true);
      const serviceData = await getConfigurableServiceBySlug(slug);
      
      if (!serviceData) {
        toast.error("服务不存在或已下线");
        navigate(-1);
        return;
      }
      
      setService(serviceData);
    } catch (error) {
      console.error('加载服务失败:', error);
      toast.error("加载失败，请重试");
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTutorialOpen = () => {
    setIsTutorialOpen(true);
  };

  const handleSubmitSuccess = () => {
    navigate("/orders");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">服务不存在</p>
          <Button onClick={handleGoBack} className="mt-4">
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white p-4 flex items-center">
        <Button
          variant="ghost"
          className="p-0 mr-3"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-9">
          {service.name}
        </h1>
      </div>

      {/* 主要内容 */}
      <div className="p-4">
        {/* 查看教程链接 */}
        {service.show_tutorial && (
          <div className="mb-4">
            <Button
              variant="link"
              className="text-blue-500 p-0 h-auto font-normal text-sm"
              onClick={handleTutorialOpen}
            >
              查看操作教程 →
            </Button>
          </div>
        )}

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <ConfigurableServiceForm 
            service={service}
            onSubmitSuccess={handleSubmitSuccess}
          />
        </div>
      </div>

      {/* 教程对话框 */}
      {service.show_tutorial && (
        <TutorialDialog 
          open={isTutorialOpen} 
          onOpenChange={setIsTutorialOpen}
          type="custom"
          tutorialContent={{
            title: service.tutorial_title || service.name,
            steps: service.tutorial_steps.map(step => ({
              title: step.title,
              items: [step.description],
              type: step.type
            }))
          }}
          productName={service.name}
          productSlug={service.slug}
        />
      )}
    </div>
  );
};

export default ConfigurableServicePage;