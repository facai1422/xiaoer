import React, { useState } from 'react'
import CustomerChat from '@/components/CustomerChat'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Users, 
  Settings, 
  Monitor,
  Smartphone,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

export default function CustomerServiceDemo() {
  const [customerInfo, setCustomerInfo] = useState({
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000'
  })
  const [showChat, setShowChat] = useState(false)

  const handleStartChat = () => {
    setShowChat(true)
  }

  const handleCloseChat = () => {
    setShowChat(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">智能客服系统</h1>
                <p className="text-sm text-gray-500">实时在线客服解决方案</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                系统正常
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                设置
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧功能介绍 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 系统特性 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-blue-500" />
                  <span>系统特性</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">实时消息</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        基于WebSocket的实时消息推送，确保消息即时送达
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <Users className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">多客服支持</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        支持多个客服同时在线，智能分配客户会话
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <Globe className="w-6 h-6 text-purple-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">多渠道接入</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        支持网站、APP、微信等多种渠道统一管理
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                    <Smartphone className="w-6 h-6 text-orange-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">移动端适配</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        完美适配移动端设备，随时随地提供客服服务
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card>
              <CardHeader>
                <CardTitle>使用说明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">客户端集成</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        在您的网站中集成客服聊天组件，客户可以随时发起咨询
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">客服工作台</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        客服人员通过工作台接收和处理客户消息，支持会话管理
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">实时通信</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        基于Supabase实时数据库，确保消息实时同步
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 技术架构 */}
            <Card>
              <CardHeader>
                <CardTitle>技术架构</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">R</span>
                    </div>
                    <h4 className="font-medium text-gray-900">React</h4>
                    <p className="text-xs text-gray-500 mt-1">前端框架</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">S</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Supabase</h4>
                    <p className="text-xs text-gray-500 mt-1">后端服务</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">T</span>
                    </div>
                    <h4 className="font-medium text-gray-900">TypeScript</h4>
                    <p className="text-xs text-gray-500 mt-1">类型安全</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-cyan-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">T</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Tailwind</h4>
                    <p className="text-xs text-gray-500 mt-1">样式框架</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧演示区域 */}
          <div className="space-y-6">
            {/* 客户信息设置 */}
            <Card>
              <CardHeader>
                <CardTitle>客户信息设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">客户姓名</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入客户姓名"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="请输入邮箱地址"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">手机号码</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="请输入手机号码"
                  />
                </div>
                
                <Button 
                  onClick={handleStartChat} 
                  className="w-full"
                  disabled={!customerInfo.name || !customerInfo.email}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  开始客服对话
                </Button>
              </CardContent>
            </Card>

            {/* 系统状态 */}
            <Card>
              <CardHeader>
                <CardTitle>系统状态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">数据库连接</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      正常
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">实时通信</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      正常
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">在线客服</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      <Users className="w-3 h-3 mr-1" />
                      1 人在线
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">响应时间</span>
                    <Badge variant="outline" className="text-gray-600 border-gray-200">
                      <Clock className="w-3 h-3 mr-1" />
                      &lt; 1s
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速链接 */}
            <Card>
              <CardHeader>
                <CardTitle>快速链接</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/admin/customer-service" target="_blank">
                      <Monitor className="w-4 h-4 mr-2" />
                      客服工作台
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Settings className="w-4 h-4 mr-2" />
                    系统设置
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Users className="w-4 h-4 mr-2" />
                    客服管理
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 客服聊天组件 */}
      {showChat && (
        <CustomerChat 
          customerInfo={customerInfo}
          onClose={handleCloseChat}
        />
      )}
    </div>
  )
} 