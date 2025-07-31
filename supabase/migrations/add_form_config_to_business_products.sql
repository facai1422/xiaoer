-- 为business_products表添加form_config字段
ALTER TABLE IF EXISTS business_products 
ADD COLUMN IF NOT EXISTS form_config JSONB DEFAULT '[]';

-- 为现有记录设置默认的表单配置
UPDATE business_products 
SET form_config = '[
  {
    "id": "account",
    "name": "account",
    "label": "账号",
    "type": "text",
    "placeholder": "请输入账号",
    "required": true,
    "validation": {"minLength": 1, "maxLength": 50}
  },
  {
    "id": "name",
    "name": "name",
    "label": "姓名", 
    "type": "text",
    "placeholder": "请输入姓名",
    "required": false,
    "validation": {"minLength": 2, "maxLength": 20}
  },
  {
    "id": "amount",
    "name": "amount",
    "label": "金额",
    "type": "number",
    "placeholder": "请输入金额",
    "required": true,
    "validation": {"min": 100, "max": 50000}
  }
]'::jsonb 
WHERE form_config IS NULL OR form_config = '[]'::jsonb;

-- 创建索引以优化form_config查询
CREATE INDEX IF NOT EXISTS idx_business_products_form_config ON business_products USING GIN (form_config);

COMMIT;