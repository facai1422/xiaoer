
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentPerformance from "./components/AgentPerformance";
import GeographicAnalysis from "./components/GeographicAnalysis";
import CustomAlerts from "./components/CustomAlerts";
import RootCauseAnalysis from "./components/RootCauseAnalysis";

const DataDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("agent-performance");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">数据看板</h1>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="agent-performance">代理绩效</TabsTrigger>
            <TabsTrigger value="geographic-analysis">地理分析</TabsTrigger>
            <TabsTrigger value="custom-alerts">自定义预警</TabsTrigger>
            <TabsTrigger value="root-cause-analysis">根因分析</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agent-performance" className="p-4">
            <AgentPerformance />
          </TabsContent>
          
          <TabsContent value="geographic-analysis" className="p-4">
            <GeographicAnalysis />
          </TabsContent>
          
          <TabsContent value="custom-alerts" className="p-4">
            <CustomAlerts />
          </TabsContent>
          
          <TabsContent value="root-cause-analysis" className="p-4">
            <RootCauseAnalysis />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default DataDashboardPage;
