const { createClient } = require('@supabase/supabase-js');

// 1. 初始化 Supabase 客户端
const supabaseUrl = 
  process.env.SUPABASE_URL || 'https://wjvuuckoasdukmnbrzxk.supabase.co';
const supabaseKey = 
  process.env.SUPABASE_KEY || 'sb_publishable_hjn8uDvuadUNMrM1jg5HHQ_37sGt-pr';

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

// 2. 监听多个重要表的实时变更
const tables = [
    'business_products',    // 业务产品表
    'recharge_orders',      // 充值订单表
    'business_orders',      // 业务订单表
    'user_profiles',        // 用户资料表
    'transactions'          // 交易记录表
];

// 3. 输出函数
function writeOutput(data) {
    const jsonString = JSON.stringify(data);
    console.log(jsonString);
    
    // 如果是 MCP 环境，也写入到 stdout
    if (process.stdout.isTTY === false) {
        process.stdout.write(jsonString + '\n');
    }
}

// 4. 为每个表创建监听通道
const channels = [];

tables.forEach(tableName => {
    const channel = supabase
        .channel(`mcp-realtime-${tableName}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: tableName
        }, (payload) => {
            // 格式化变更数据
            const changeData = {
                timestamp: new Date().toISOString(),
                table: tableName,
                event: payload.eventType,
                old: payload.old,
                new: payload.new,
                schema: payload.schema,
                source: 'supabase-realtime'
            };
            
            // 输出变更数据
            writeOutput(changeData);
            
            // 控制台日志
            console.log(`[${tableName}] ${payload.eventType}:`, {
                id: payload.new?.id || payload.old?.id,
                changes: payload.eventType === 'UPDATE' ? 
                    Object.keys(payload.new || {}).filter(key => 
                        JSON.stringify(payload.new[key]) !== JSON.stringify(payload.old?.[key])
                    ) : undefined
            });
        })
        .subscribe((status) => {
            console.log(`Table ${tableName} subscription status:`, status);
            
            // 输出订阅状态
            writeOutput({
                timestamp: new Date().toISOString(),
                type: 'subscription_status',
                table: tableName,
                status: status,
                source: 'supabase-realtime'
            });
        });
    
    channels.push(channel);
});

// 5. 处理标准输入（用于 MCP 通信）
if (process.stdin.isTTY === false) {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
        try {
            const input = JSON.parse(data.toString().trim());
            
            // 处理 MCP 请求
            if (input.method === 'ping') {
                writeOutput({
                    timestamp: new Date().toISOString(),
                    type: 'pong',
                    source: 'supabase-realtime'
                });
            } else if (input.method === 'status') {
                writeOutput({
                    timestamp: new Date().toISOString(),
                    type: 'status',
                    tables: tables,
                    channels: channels.length,
                    connected: channels.every(ch => ch.state === 'joined'),
                    source: 'supabase-realtime'
                });
            }
        } catch (error) {
            console.error('Error processing input:', error);
        }
    });
}

// 6. 错误处理和优雅退出
function cleanup() {
    console.log('正在关闭 MCP 服务器...');
    
    // 清理所有订阅通道
    channels.forEach(channel => {
        try {
            supabase.removeChannel(channel);
        } catch (error) {
            console.error('Error removing channel:', error);
        }
    });
    
    // 输出关闭状态
    writeOutput({
        timestamp: new Date().toISOString(),
        type: 'shutdown',
        source: 'supabase-realtime'
    });
    
    process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    cleanup();
});

// 7. 启动日志和状态输出
console.log('MCP Supabase 实时服务器已启动');
console.log('监听的表:', tables.join(', '));
console.log('Supabase URL:', supabaseUrl);

// 输出启动状态
writeOutput({
    timestamp: new Date().toISOString(),
    type: 'startup',
    tables: tables,
    supabase_url: supabaseUrl,
    source: 'supabase-realtime'
});

// 8. 保持进程运行
process.stdin.resume();