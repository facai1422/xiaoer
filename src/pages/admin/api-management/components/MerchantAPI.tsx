
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const MerchantAPI = () => {
  const { data: merchantApiKeys, isLoading } = useQuery({
    queryKey: ['merchant-api-keys'],
    queryFn: async () => {
      // This would be replaced with actual API key fetching from Supabase
      // Currently returning mock data
      return [
        {
          id: '1',
          name: '商户API-测试',
          key: 'sk_test_12345678901234567890',
          is_active: true,
          created_at: '2023-08-15T08:00:00Z',
          last_used: '2023-08-20T10:30:00Z',
          permissions: ['read', 'write']
        }
      ];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">商户API管理</h2>
        <Button>生成新API密钥</Button>
      </div>
      
      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">API名称</label>
              <Input placeholder="输入API名称" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">权限设置</label>
              <Select defaultValue="read_write">
                <SelectTrigger>
                  <SelectValue placeholder="选择权限级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">只读</SelectItem>
                  <SelectItem value="write">只写</SelectItem>
                  <SelectItem value="read_write">读写</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <h3 className="text-lg font-medium mt-6">现有API密钥</h3>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">加载中...</div>
        ) : merchantApiKeys?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无API密钥</div>
        ) : (
          merchantApiKeys?.map(apiKey => (
            <Card key={apiKey.id} className="p-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h4 className="font-medium">{apiKey.name}</h4>
                  <div className="text-sm text-gray-500 mt-1">
                    创建时间: {new Date(apiKey.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    最后使用: {new Date(apiKey.last_used).toLocaleString()}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={apiKey.is_active} />
                    <span className="text-sm">{apiKey.is_active ? '启用' : '禁用'}</span>
                  </div>
                  
                  <Button variant="outline" size="sm">查看密钥</Button>
                  <Button variant="destructive" size="sm">删除</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MerchantAPI;
