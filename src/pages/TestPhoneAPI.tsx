import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testPhoneBalanceAPI, queryPhoneBalance } from "@/services/phoneBalanceService";
import { ArrowLeft, TestTube, Phone, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TestPhoneAPI = () => {
  const navigate = useNavigate();
  const [testPhone, setTestPhone] = useState('13800138000');
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [isTestingQuery, setIsTestingQuery] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [queryResult, setQueryResult] = useState<any>(null);

  const handleTestAPI = async () => {
    setIsTestingAPI(true);
    setApiTestResult(null);
    
    try {
      const result = await testPhoneBalanceAPI(testPhone);
      setApiTestResult(result);
    } catch (error) {
      setApiTestResult({
        success: false,
        message: '测试异常',
        details: error
      });
    } finally {
      setIsTestingAPI(false);
    }
  };

  const handleTestQuery = async () => {
    setIsTestingQuery(true);
    setQueryResult(null);
    
    try {
      const result = await queryPhoneBalance(testPhone);
      setQueryResult(result);
    } catch (error) {
      setQueryResult({
        code: -1,
        message: '查询异常',
        error: error
      });
    } finally {
      setIsTestingQuery(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white p-4 flex items-center border-b">
        <Button
          variant="ghost"
          className="p-0 mr-3"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-9">
          话费查询API测试
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 测试配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TestTube className="w-5 h-5 mr-2" />
              测试配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">测试手机号</label>
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="请输入测试手机号"
                maxLength={11}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleTestAPI}
                disabled={isTestingAPI || !testPhone}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isTestingAPI ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    测试中...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    测试API连接
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleTestQuery}
                disabled={isTestingQuery || !testPhone}
                variant="outline"
              >
                {isTestingQuery ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    查询中...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    测试完整查询
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API连接测试结果 */}
        {apiTestResult && (
          <Card>
            <CardHeader>
              <CardTitle className={`${apiTestResult.success ? 'text-green-600' : 'text-red-600'}`}>
                API连接测试结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium mr-2">状态:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    apiTestResult.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {apiTestResult.success ? '成功' : '失败'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">消息:</span>
                  <p className="mt-1 text-sm text-gray-700">{apiTestResult.message}</p>
                </div>
                
                {apiTestResult.details && (
                  <div>
                    <span className="font-medium">详细信息:</span>
                    <pre className="mt-1 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(apiTestResult.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 完整查询测试结果 */}
        {queryResult && (
          <Card>
            <CardHeader>
              <CardTitle className={`${queryResult.code === 0 ? 'text-green-600' : 'text-red-600'}`}>
                完整查询测试结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium mr-2">状态:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    queryResult.code === 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {queryResult.code === 0 ? '成功' : '失败'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">消息:</span>
                  <p className="mt-1 text-sm text-gray-700">{queryResult.message}</p>
                </div>
                
                {queryResult.data && (
                  <div className="space-y-2">
                    <span className="font-medium">查询结果:</span>
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">手机号:</span> {queryResult.data.phone}</div>
                        <div><span className="font-medium">余额:</span> <span className="text-green-600 font-bold">{queryResult.data.balance}元</span></div>
                        <div><span className="font-medium">运营商:</span> {queryResult.data.operator}</div>
                        <div><span className="font-medium">归属地:</span> {queryResult.data.province} {queryResult.data.city}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-xs text-gray-500">原始响应:</span>
                  <pre className="mt-1 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API信息 */}
        <Card>
          <CardHeader>
            <CardTitle>API配置信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">API密钥:</span> tAooD3C5CtB31AGuW5xb8barX8</div>
              <div><span className="font-medium">通用接口:</span> https://api.taolale.com/api/Inquiry_Phone_Charges/get</div>
              <div><span className="font-medium">请求方式:</span> POST</div>
              <div><span className="font-medium">Content-Type:</span> application/x-www-form-urlencoded;charset=utf-8</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPhoneAPI;