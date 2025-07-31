-- 创建可配置在线业务服务表
CREATE TABLE IF NOT EXISTS configurable_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL DEFAULT '未配置服务',
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
    
    -- 价格配置
    exchange_rate DECIMAL(10,4) DEFAULT 7.2,
    discount_rate DECIMAL(5,4) DEFAULT 0.8,
    min_amount DECIMAL(10,2) DEFAULT 1.00,
    max_amount DECIMAL(10,2) DEFAULT 10000.00,
    quick_amounts INTEGER[] DEFAULT '{100,200,500,1000,2000,5000}',
    
    -- 教程配置
    tutorial_title VARCHAR(200) DEFAULT '',
    tutorial_content TEXT DEFAULT '',
    show_tutorial BOOLEAN DEFAULT false,
    tutorial_steps JSONB DEFAULT '[]',
    
    -- 表单配置
    form_fields JSONB DEFAULT '[]',
    
    -- 显示配置
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_configurable_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_configurable_services_updated_at
    BEFORE UPDATE ON configurable_services
    FOR EACH ROW
    EXECUTE FUNCTION update_configurable_services_updated_at();

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_configurable_services_status ON configurable_services(status);
CREATE INDEX IF NOT EXISTS idx_configurable_services_sort_order ON configurable_services(sort_order);
CREATE INDEX IF NOT EXISTS idx_configurable_services_slug ON configurable_services(slug);

-- 插入10个空的可配置服务
INSERT INTO configurable_services (slug, name, description, sort_order) VALUES
('custom-service-1', '自定义服务1', '可配置的在线业务服务', 1),
('custom-service-2', '自定义服务2', '可配置的在线业务服务', 2),
('custom-service-3', '自定义服务3', '可配置的在线业务服务', 3),
('custom-service-4', '自定义服务4', '可配置的在线业务服务', 4),
('custom-service-5', '自定义服务5', '可配置的在线业务服务', 5),
('custom-service-6', '自定义服务6', '可配置的在线业务服务', 6),
('custom-service-7', '自定义服务7', '可配置的在线业务服务', 7),
('custom-service-8', '自定义服务8', '可配置的在线业务服务', 8),
('custom-service-9', '自定义服务9', '可配置的在线业务服务', 9),
('custom-service-10', '自定义服务10', '可配置的在线业务服务', 10)
ON CONFLICT (slug) DO NOTHING;

-- 设置RLS策略
ALTER TABLE configurable_services ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取已启用的服务
CREATE POLICY "Allow anonymous read active services" ON configurable_services
    FOR SELECT USING (status = 'active');

-- 允许认证用户读取所有服务
CREATE POLICY "Allow authenticated read all services" ON configurable_services
    FOR SELECT TO authenticated USING (true);

-- 允许管理员进行所有操作
CREATE POLICY "Allow admin all operations" ON configurable_services
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

COMMIT;