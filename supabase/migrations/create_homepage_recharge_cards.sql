-- 创建首页快速充值卡片表
CREATE TABLE IF NOT EXISTS homepage_recharge_cards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  discount VARCHAR(50) NOT NULL,
  discount_rate DECIMAL(4,3) DEFAULT 0.85,
  exchange_rate DECIMAL(5,2) DEFAULT 7.2,
  image_url VARCHAR(500),
  route VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认数据
INSERT INTO homepage_recharge_cards (title, discount, discount_rate, exchange_rate, image_url, route, display_order) VALUES
('普通话费充值', '85折充值', 0.85, 7.2, '/lovable-uploads/IMG_2938.PNG', '/mobile-recharge', 1),
('高折扣话费', '75折充值', 0.75, 7.2, '/lovable-uploads/IMG_2945.PNG', '/mobile-recharge', 2),
('南网电费充值', '80折充值', 0.8, 7.2, '/lovable-uploads/IMG_2943.PNG', '/utilities', 3),
('网易游戏', '85折充值', 0.85, 7.2, '/lovable-uploads/IMG_2941.PNG', '/netease-game', 4);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_homepage_recharge_cards_active ON homepage_recharge_cards (is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_recharge_cards_order ON homepage_recharge_cards (display_order);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_homepage_recharge_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_homepage_recharge_cards_updated_at ON homepage_recharge_cards;
CREATE TRIGGER trigger_update_homepage_recharge_cards_updated_at
    BEFORE UPDATE ON homepage_recharge_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_homepage_recharge_cards_updated_at();

COMMIT;