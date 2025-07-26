
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MerchantScoreModel from "./components/MerchantScoreModel";
import AnomalyDetection from "./components/AnomalyDetection";
import QuotaManagement from "./components/QuotaManagement";
import WhitelistManagement from "./components/WhitelistManagement";

const MerchantRiskControl = () => {
  const [activeTab, setActiveTab] = useState("score-model");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">商户风控系统</h1>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="score-model">评分模型</TabsTrigger>
            <TabsTrigger value="anomaly-detection">异常检测</TabsTrigger>
            <TabsTrigger value="quota-management">配额管理</TabsTrigger>
            <TabsTrigger value="whitelist">白名单机制</TabsTrigger>
          </TabsList>
          
          <TabsContent value="score-model" className="p-4">
            <MerchantScoreModel />
          </TabsContent>
          
          <TabsContent value="anomaly-detection" className="p-4">
            <AnomalyDetection />
          </TabsContent>
          
          <TabsContent value="quota-management" className="p-4">
            <QuotaManagement />
          </TabsContent>
          
          <TabsContent value="whitelist" className="p-4">
            <WhitelistManagement />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default MerchantRiskControl;
