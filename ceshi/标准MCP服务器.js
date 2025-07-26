#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// MCP 协议标准实现
class MCPServer {
    constructor() {
        this.requestId = 0;
        const supabaseUrl = 
  process.env.SUPABASE_URL || 'https://wjvuuckoasdukmnbrzxk.supabase.co';
        const supabaseKey = 
  process.env.SUPABASE_KEY || 'sb_publishable_hjn8uDvuadUNMrM1jg5HHQ_37sGt-pr';
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.channels = [];
        this.setupRealtimeSubscriptions();
    }

    // 发送响应
    sendResponse(id, result) {
        const response = {
            jsonrpc: "2.0",
            id: id,
            result: result
        };
        process.stdout.write(JSON.stringify(response) + '\n');
    }

    // 发送错误
    sendError(id, code, message) {
        const response = {
            jsonrpc: "2.0",
            id: id,
            error: {
                code: code,
                message: message
            }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
    }

    // 发送通知
    sendNotification(method, params) {
        const notification = {
            jsonrpc: "2.0",
            method: method,
            params: params
        };
        process.stdout.write(JSON.stringify(notification) + '\n');
    }

    // 处理初始化
    handleInitialize(id, params) {
        this.sendResponse(id, {
            protocolVersion: "2024-11-05",
            capabilities: {
                tools: {
                    listChanged: true
                },
                resources: {
                    subscribe: true,
                    listChanged: true
                }
            },
            serverInfo: {
                name: "supabase-realtime",
                version: "1.0.0"
            }
        });
    }

    // 处理工具列表
    handleListTools(id, params) {
        this.sendResponse(id, {
            tools: [
                {
                    name: "query_database",
                    description: "查询 Supabase 数据库",
                    inputSchema: {
                        type: "object",
                        properties: {
                            table: {
                                type: "string",
                                description: "要查询的表名"
                            },
                            filter: {
                                type: "object",
                                description: "查询过滤条件"
                            }
                        },
                        required: ["table"]
                    }
                },
                {
                    name: "get_table_status",
                    description: "获取表的订阅状态",
                    inputSchema: {
                        type: "object",
                        properties: {
                            table: {
                                type: "string",
                                description: "表名"
                            }
                        }
                    }
                }
            ]
        });
    }

    // 处理工具调用
    async handleCallTool(id, params) {
        try {
            const { name, arguments: args } = params;

            if (name === "query_database") {
                const { table, filter = {} } = args;
                let query = this.supabase.from(table).select('*');
                
                // 应用过滤条件
                Object.entries(filter).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });

                const { data, error } = await query.limit(10);
                
                if (error) {
                    this.sendError(id, -32000, `数据库查询错误: ${error.message}`);
                    return;
                }

                this.sendResponse(id, {
                    content: [
                        {
                            type: "text",
                            text: `查询表 ${table} 的结果:\n${JSON.stringify(data, null, 2)}`
                        }
                    ]
                });
            } else if (name === "get_table_status") {
                const { table } = args;
                const channel = this.channels.find(ch => ch.topic.includes(table));
                
                this.sendResponse(id, {
                    content: [
                        {
                            type: "text",
                            text: `表 ${table} 的状态: ${channel ? channel.state : '未订阅'}`
                        }
                    ]
                });
            } else {
                this.sendError(id, -32601, `未知的工具: ${name}`);
            }
        } catch (error) {
            this.sendError(id, -32000, `工具执行错误: ${error.message}`);
        }
    }

    // 处理资源列表
    handleListResources(id, params) {
        const tables = ['business_products', 'recharge_orders', 'business_orders', 'user_profiles', 'transactions'];
        
        this.sendResponse(id, {
            resources: tables.map(table => ({
                uri: `supabase://table/${table}`,
                name: `${table} 实时数据`,
                description: `${table} 表的实时变更数据`,
                mimeType: "application/json"
            }))
        });
    }

    // 设置实时订阅
    setupRealtimeSubscriptions() {
        const tables = ['business_products', 'recharge_orders', 'business_orders', 'user_profiles', 'transactions'];
        
        tables.forEach(tableName => {
            const channel = this.supabase
                .channel(`mcp-${tableName}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: tableName
                }, (payload) => {
                    // 发送实时数据变更通知
                    this.sendNotification('notifications/resources/updated', {
                        uri: `supabase://table/${tableName}`,
                        data: {
                            timestamp: new Date().toISOString(),
                            table: tableName,
                            event: payload.eventType,
                            old: payload.old,
                            new: payload.new
                        }
                    });
                })
                .subscribe();
            
            this.channels.push(channel);
        });
    }

    // 处理请求
    handleRequest(request) {
        const { id, method, params } = request;

        switch (method) {
            case 'initialize':
                this.handleInitialize(id, params);
                break;
            case 'tools/list':
                this.handleListTools(id, params);
                break;
            case 'tools/call':
                this.handleCallTool(id, params);
                break;
            case 'resources/list':
                this.handleListResources(id, params);
                break;
            default:
                this.sendError(id, -32601, `未知的方法: ${method}`);
        }
    }

    // 启动服务器
    start() {
        process.stdin.setEncoding('utf8');
        
        let buffer = '';
        process.stdin.on('data', (chunk) => {
            buffer += chunk;
            
            // 处理完整的 JSON 行
            const lines = buffer.split('\n');
            buffer = lines.pop(); // 保留不完整的行
            
            lines.forEach(line => {
                if (line.trim()) {
                    try {
                        const request = JSON.parse(line);
                        this.handleRequest(request);
                    } catch (error) {
                        console.error('JSON 解析错误:', error);
                    }
                }
            });
        });

        process.stdin.on('end', () => {
            process.exit(0);
        });

        // 错误处理
        process.on('uncaughtException', (error) => {
            console.error('未捕获的异常:', error);
            process.exit(1);
        });
    }
}

// 启动 MCP 服务器
const server = new MCPServer();
server.start(); 