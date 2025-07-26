const { StreamTransport } = require('@supabase-community/mcp-utils');

// 1. 连接到 MCP 服务器
const transport = new StreamTransport();

// 2. 监听实时数据
transport.on('data', (data) => {
  const payload = JSON.parse(data);
  console.log('实时更新:', payload);
});

// 3. 发送查询请求（可选）
transport.write(JSON.stringify({
  action: 'query',
  sql: 'SELECT * FROM your_table LIMIT 10'
}));