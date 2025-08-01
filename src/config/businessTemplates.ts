export interface BusinessTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  logo?: string;
  defaultLogo: string;
  isActive: boolean;
  formFields: BusinessTemplateField[];
  settings: {
    exchangeRate: number;
    discountRate: number;
    minAmount: number;
    maxAmount: number;
    quickAmounts: number[];
  };
}

export interface BusinessTemplateField {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type: 'text' | 'tel' | 'email' | 'number' | 'textarea' | 'select' | 'qrcode' | 'link';
  required: boolean;
  isEnabled: boolean;
  order: number;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

// 10个预设业务模板
export const defaultBusinessTemplates: BusinessTemplate[] = [
  {
    id: 'credit-card-template',
    name: 'credit-card',
    displayName: '信用卡代还',
    description: '信用卡账单代还服务',
    category: '金融服务',
    defaultLogo: '💳',
    isActive: true,
    formFields: [
      {
        id: 'cardholder_name',
        name: 'cardholder_name',
        label: '持卡人姓名',
        placeholder: '请输入持卡人姓名',
        type: 'text',
        required: true,
        isEnabled: true,
        order: 1,
        validation: { minLength: 2, maxLength: 20 }
      },
      {
        id: 'card_number',
        name: 'card_number',
        label: '信用卡号',
        placeholder: '请输入信用卡号后四位',
        type: 'text',
        required: true,
        isEnabled: true,
        order: 2,
        validation: { minLength: 4, maxLength: 4 }
      },
      {
        id: 'phone',
        name: 'phone',
        label: '手机号码',
        placeholder: '请输入手机号码',
        type: 'tel',
        required: true,
        isEnabled: true,
        order: 3,
        validation: { minLength: 11, maxLength: 11 }
      },
      {
        id: 'amount',
        name: 'amount',
        label: '代还金额',
        placeholder: '请输入代还金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 4,
        validation: { min: 100, max: 50000 }
      },
      {
        id: 'repay_date',
        name: 'repay_date',
        label: '还款日期',
        placeholder: '请选择还款日期',
        type: 'text',
        required: false,
        isEnabled: true,
        order: 5
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.85,
      minAmount: 100,
      maxAmount: 50000,
      quickAmounts: [1000, 2000, 5000, 10000, 20000]
    }
  },
  {
    id: 'huabei-template',
    name: 'huabei',
    displayName: '花呗代还',
    description: '支付宝花呗账单代还',
    category: '金融服务',
    defaultLogo: '🌸',
    isActive: true,
    formFields: [
      {
        id: 'alipay_account',
        name: 'alipay_account',
        label: '支付宝账号',
        placeholder: '请输入支付宝账号',
        type: 'text',
        required: true,
        isEnabled: true,
        order: 1
      },
      {
        id: 'real_name',
        name: 'real_name',
        label: '真实姓名',
        placeholder: '请输入真实姓名',
        type: 'text',
        required: true,
        isEnabled: true,
        order: 2
      },
      {
        id: 'phone',
        name: 'phone',
        label: '手机号码',
        placeholder: '请输入手机号码',
        type: 'tel',
        required: true,
        isEnabled: true,
        order: 3
      },
      {
        id: 'amount',
        name: 'amount',
        label: '代还金额',
        placeholder: '请输入代还金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 4,
        validation: { min: 100, max: 30000 }
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.75,
      minAmount: 100,
      maxAmount: 30000,
      quickAmounts: [500, 1000, 2000, 5000, 10000]
    }
  },
  {
    id: 'baitiao-template',
    name: 'baitiao',
    displayName: '京东白条',
    description: '京东白条账单代还',
    category: '金融服务',
    defaultLogo: '🛍️',
    isActive: true,
    formFields: [
      {
        id: 'jd_account',
        name: 'jd_account',
        label: '京东账号',
        placeholder: '请输入京东账号',
        type: 'text',
        required: false,
        isEnabled: true,
        order: 1
      },
      {
        id: 'real_name',
        name: 'real_name',
        label: '真实姓名',
        placeholder: '请输入真实姓名',
        type: 'text',
        required: false,
        isEnabled: true,
        order: 2
      },
      {
        id: 'phone',
        name: 'phone',
        label: '手机号码',
        placeholder: '请输入手机号码',
        type: 'tel',
        required: true,
        isEnabled: true,
        order: 3
      },
      {
        id: 'baitiao_link',
        name: 'baitiao_link',
        label: '白条链接',
        placeholder: '请输入白条链接',
        type: 'link',
        required: true,
        isEnabled: true,
        order: 4
      },
      {
        id: 'amount',
        name: 'amount',
        label: '代还金额',
        placeholder: '请输入代还金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 5,
        validation: { min: 100, max: 30000 }
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.8,
      minAmount: 100,
      maxAmount: 30000,
      quickAmounts: [500, 1000, 2000, 5000, 10000]
    }
  },
  {
    id: 'mobile-recharge-template',
    name: 'mobile-recharge',
    displayName: '话费充值',
    description: '手机话费充值服务',
    category: '生活缴费',
    defaultLogo: '📱',
    isActive: true,
    formFields: [
      {
        id: 'phone_number',
        name: 'phone_number',
        label: '手机号码',
        placeholder: '请输入手机号码',
        type: 'tel',
        required: true,
        isEnabled: true,
        order: 1,
        validation: { minLength: 11, maxLength: 11 }
      },
      {
        id: 'operator',
        name: 'operator',
        label: '运营商',
        placeholder: '请选择运营商',
        type: 'select',
        required: true,
        isEnabled: true,
        order: 2,
        options: ['中国移动', '中国联通', '中国电信']
      },
      {
        id: 'amount',
        name: 'amount',
        label: '充值金额',
        placeholder: '请输入充值金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 3,
        validation: { min: 10, max: 1000 }
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.95,
      minAmount: 10,
      maxAmount: 1000,
      quickAmounts: [30, 50, 100, 200, 500]
    }
  },
  {
    id: 'game-recharge-template',
    name: 'game-recharge',
    displayName: '游戏充值',
    description: '各类游戏充值服务',
    category: '游戏娱乐',
    defaultLogo: '🎮',
    isActive: true,
    formFields: [
      {
        id: 'game_name',
        name: 'game_name',
        label: '游戏名称',
        placeholder: '请选择游戏',
        type: 'select',
        required: true,
        isEnabled: true,
        order: 1,
        options: ['王者荣耀', '和平精英', '原神', '网易游戏', '其他']
      },
      {
        id: 'game_id',
        name: 'game_id',
        label: '游戏ID',
        placeholder: '请输入游戏ID',
        type: 'text',
        required: true,
        isEnabled: true,
        order: 2
      },
      {
        id: 'server',
        name: 'server',
        label: '服务器',
        placeholder: '请输入服务器',
        type: 'text',
        required: false,
        isEnabled: true,
        order: 3
      },
      {
        id: 'amount',
        name: 'amount',
        label: '充值金额',
        placeholder: '请输入充值金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 4,
        validation: { min: 10, max: 10000 }
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.9,
      minAmount: 10,
      maxAmount: 10000,
      quickAmounts: [50, 100, 300, 500, 1000]
    }
  },
  {
    id: 'oil-card-template',
    name: 'oil-card',
    displayName: '加油卡充值',
    description: '中石化、中石油加油卡充值',
    category: '生活缴费',
    defaultLogo: '⛽',
    isActive: true,
    formFields: [
      {
        id: 'card_type',
        name: 'card_type',
        label: '卡片类型',
        placeholder: '请选择加油卡类型',
        type: 'select',
        required: true,
        isEnabled: true,
        order: 1,
        options: ['中石化', '中石油']
      },
      {
        id: 'card_number',
        name: 'card_number',
        label: '卡号',
        placeholder: '请输入加油卡号',
        type: 'text',
        required: true,
        isEnabled: true,
        order: 2
      },
      {
        id: 'phone',
        name: 'phone',
        label: '手机号码',
        placeholder: '请输入手机号码',
        type: 'tel',
        required: true,
        isEnabled: true,
        order: 3
      },
      {
        id: 'amount',
        name: 'amount',
        label: '充值金额',
        placeholder: '请输入充值金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 4,
        validation: { min: 100, max: 5000 }
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.92,
      minAmount: 100,
      maxAmount: 5000,
      quickAmounts: [200, 500, 1000, 2000, 3000]
    }
  },
  {
    id: 'utility-payment-template',
    name: 'utility-payment',
    displayName: '水电燃气缴费',
    description: '水费、电费、燃气费缴费',
    category: '生活缴费',
    defaultLogo: '🏠',
    isActive: true,
    formFields: [
      {
        id: 'bill_type',
        name: 'bill_type',
        label: '缴费类型',
        placeholder: '请选择缴费类型',
        type: 'select',
        required: true,
        isEnabled: true,
        order: 1,
        options: ['电费', '水费', '燃气费']
      },
      {
        id: 'account_number',
        name: 'account_number',
        label: '户号',
        placeholder: '请输入户号',
        type: 'text',
        required: true,
        isEnabled: true,
        order: 2
      },
      {
        id: 'address',
        name: 'address',
        label: '地址',
        placeholder: '请输入地址',
        type: 'text',
        required: false,
        isEnabled: true,
        order: 3
      },
      {
        id: 'amount',
        name: 'amount',
        label: '缴费金额',
        placeholder: '请输入缴费金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 4,
        validation: { min: 10, max: 2000 }
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.98,
      minAmount: 10,
      maxAmount: 2000,
      quickAmounts: [100, 200, 300, 500, 1000]
    }
  },
  {
    id: 'loan-repay-template',
    name: 'loan-repay',
    displayName: '网贷代还',
    description: '各类网贷平台代还服务',
    category: '金融服务',
    defaultLogo: '💰',
    isActive: true,
    formFields: [
      {
        id: 'platform_name',
        name: 'platform_name',
        label: '贷款平台',
        placeholder: '请选择贷款平台',
        type: 'select',
        required: true,
        isEnabled: true,
        order: 1,
        options: ['安逸花', '分期乐', '度小满', '招联好期贷', '其他']
      },
      {
        id: 'borrower_name',
        name: 'borrower_name',
        label: '借款人姓名',
        placeholder: '请输入借款人姓名',
        type: 'text',
        required: true,
        isEnabled: true,
        order: 2
      },
      {
        id: 'phone',
        name: 'phone',
        label: '手机号码',
        placeholder: '请输入手机号码',
        type: 'tel',
        required: true,
        isEnabled: true,
        order: 3
      },
      {
        id: 'loan_link',
        name: 'loan_link',
        label: '还款链接',
        placeholder: '请输入还款链接',
        type: 'link',
        required: false,
        isEnabled: true,
        order: 4
      },
      {
        id: 'amount',
        name: 'amount',
        label: '代还金额',
        placeholder: '请输入代还金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 5,
        validation: { min: 100, max: 50000 }
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.75,
      minAmount: 100,
      maxAmount: 50000,
      quickAmounts: [1000, 2000, 5000, 10000, 20000]
    }
  },
  {
    id: 'shopping-card-template',
    name: 'shopping-card',
    displayName: '购物卡充值',
    description: '各类购物卡、礼品卡充值',
    category: '购物消费',
    defaultLogo: '🛒',
    isActive: true,
    formFields: [
      {
        id: 'card_brand',
        name: 'card_brand',
        label: '卡片品牌',
        placeholder: '请选择卡片品牌',
        type: 'select',
        required: true,
        isEnabled: true,
        order: 1,
        options: ['京东E卡', '天猫超市卡', '苏宁卡', '沃尔玛卡', '其他']
      },
      {
        id: 'recipient_name',
        name: 'recipient_name',
        label: '收卡人姓名',
        placeholder: '请输入收卡人姓名',
        type: 'text',
        required: false,
        isEnabled: true,
        order: 2
      },
      {
        id: 'recipient_phone',
        name: 'recipient_phone',
        label: '收卡人手机',
        placeholder: '请输入收卡人手机号',
        type: 'tel',
        required: true,
        isEnabled: true,
        order: 3
      },
      {
        id: 'amount',
        name: 'amount',
        label: '充值金额',
        placeholder: '请输入充值金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 4,
        validation: { min: 50, max: 5000 }
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.95,
      minAmount: 50,
      maxAmount: 5000,
      quickAmounts: [100, 200, 500, 1000, 2000]
    }
  },
  {
    id: 'membership-template',
    name: 'membership',
    displayName: '会员充值',
    description: '各类平台会员充值服务',
    category: '会员服务',
    defaultLogo: '👑',
    isActive: true,
    formFields: [
      {
        id: 'platform',
        name: 'platform',
        label: '平台名称',
        placeholder: '请选择平台',
        type: 'select',
        required: true,
        isEnabled: true,
        order: 1,
        options: ['爱奇艺会员', '腾讯视频会员', '优酷会员', '网易云音乐', 'QQ音乐', '其他']
      },
      {
        id: 'account',
        name: 'account',
        label: '账号',
        placeholder: '请输入账号',
        type: 'text',
        required: true,
        isEnabled: true,
        order: 2
      },
      {
        id: 'membership_type',
        name: 'membership_type',
        label: '会员类型',
        placeholder: '请选择会员类型',
        type: 'select',
        required: true,
        isEnabled: true,
        order: 3,
        options: ['月卡', '季卡', '年卡']
      },
      {
        id: 'amount',
        name: 'amount',
        label: '充值金额',
        placeholder: '请输入充值金额',
        type: 'number',
        required: true,
        isEnabled: true,
        order: 4,
        validation: { min: 10, max: 500 }
      }
    ],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.85,
      minAmount: 10,
      maxAmount: 500,
      quickAmounts: [20, 50, 100, 200, 300]
    }
  }
];