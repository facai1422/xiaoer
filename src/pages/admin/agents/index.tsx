
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentList from "./components/AgentList";
import AgentApproval from "./components/AgentApproval";
import AgentTeam from "./components/AgentTeam";
import AgentSecurity from "./components/AgentSecurity";

const AgentsPage = () => {
  const [activeTab, setActiveTab] = useState("agent-list");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">代理商管理</h1>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="agent-list">代理列表</TabsTrigger>
            <TabsTrigger value="agent-approval">审批流程</TabsTrigger>
            <TabsTrigger value="agent-team">团队管理</TabsTrigger>
            <TabsTrigger value="agent-security">安全与权限</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agent-list" className="p-4">
            <AgentList />
          </TabsContent>
          
          <TabsContent value="agent-approval" className="p-4">
            <AgentApproval />
          </TabsContent>
          
          <TabsContent value="agent-team" className="p-4">
            <AgentTeam />
          </TabsContent>
          
          <TabsContent value="agent-security" className="p-4">
            <AgentSecurity />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AgentsPage;
