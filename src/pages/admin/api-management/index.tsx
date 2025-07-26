
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MerchantAPI from "./components/MerchantAPI";
import AgentAPI from "./components/AgentAPI";
import APISettings from "./components/APISettings";
import APILogs from "./components/APILogs";

const ApiManagementPage = () => {
  const [activeTab, setActiveTab] = useState("merchant-api");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API管理</h1>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="merchant-api">商户API</TabsTrigger>
            <TabsTrigger value="agent-api">代理API</TabsTrigger>
            <TabsTrigger value="api-settings">API设置</TabsTrigger>
            <TabsTrigger value="api-logs">调用日志</TabsTrigger>
          </TabsList>
          
          <TabsContent value="merchant-api" className="p-4">
            <MerchantAPI />
          </TabsContent>
          
          <TabsContent value="agent-api" className="p-4">
            <AgentAPI />
          </TabsContent>
          
          <TabsContent value="api-settings" className="p-4">
            <APISettings />
          </TabsContent>
          
          <TabsContent value="api-logs" className="p-4">
            <APILogs />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ApiManagementPage;
