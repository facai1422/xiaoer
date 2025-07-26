export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'file';
  placeholder?: string;
  required: boolean;
  options?: string[]; // 用于select类型
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: 'recharge' | 'repayment' | 'qrcode' | 'card' | 'utility';
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
  businessType: string;
  exchangeRate?: number;
  quickAmounts?: number[];
  showTutorial?: boolean;
  tutorialText?: string;
  customContent?: {
    title?: string;
    subtitle?: string;
    description?: string;
    discount?: string;
    features?: string[];
  };
}

export interface ProductTemplate {
  id: string;
  name: string;
  slug: string;
  template_id: string;
  custom_config: {
    title: string;
    subtitle: string;
    description: string;
    discount: string;
    submitButtonText: string;
    successMessage: string;
    quickAmounts: number[];
    exchangeRate: number;
    businessType: string;
    showTutorial: boolean;
    tutorialText: string;
    features: string[];
  };
  status: 'active' | 'inactive';
}

export interface ProductConfig {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  logo_url?: string;
  base_rate?: number;
  discount_rate?: number;
  status: string;
  min_amount?: number;
  max_amount?: number;
  quick_amounts?: number[];
  sort_order?: number;
  template_id?: string;
  form_config?: any;
  workflow_config?: any;
  created_at?: string;
  updated_at?: string;
} 