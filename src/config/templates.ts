import { FormTemplate } from '@/types/template';

export const FORM_TEMPLATES: FormTemplate[] = [
  // 话费充值模板
  {
    id: 'mobile-recharge',
    name: '话费充值模板',
    description: '适用于手机话费充值业务',
    category: 'recharge',
    businessType: '话费充值',
    exchangeRate: 7.2,
    quickAmounts: [30, 50, 100, 200],
    showTutorial: true,
    tutorialText: '查看充值教程 →',
    fields: [
      {
        name: 'phone',
        label: '手机号码',
        type: 'text',
        placeholder: '请输入手机号码',
        required: true,
        validation: {
          pattern: '^1[3-9]\\d{9}$'
        }
      },
      {
        name: 'amount',
        label: '充值金额',
        type: 'number',
        placeholder: '请输入充值金额',
        required: true,
        validation: {
          min: 10,
          max: 500
        }
      }
    ],
    submitButtonText: '立即充值',
    successMessage: '话费充值提交成功！',
    customContent: {
      title: '话费充值',
      subtitle: '快速充值',
      description: '支持三大运营商，到账迅速',
      discount: '9.5'
    }
  },

  // 信用卡代还模板
  {
    id: 'credit-card-repayment',
    name: '信用卡代还模板',
    description: '适用于信用卡账单代还业务',
    category: 'repayment',
    businessType: '信用卡还款',
    exchangeRate: 7.2,
    quickAmounts: [1000, 3000, 5000, 10000, 20000, 50000],
    showTutorial: true,
    tutorialText: '查看还款教程 →',
    fields: [
      {
        name: 'name',
        label: '持卡人姓名',
        type: 'text',
        placeholder: '请输入持卡人姓名',
        required: true
      },
      {
        name: 'cardNumber',
        label: '信用卡号',
        type: 'text',
        placeholder: '请输入信用卡号',
        required: true
      },
      {
        name: 'bankName',
        label: '开户银行',
        type: 'text',
        placeholder: '请输入开户银行',
        required: true
      },
      {
        name: 'amount',
        label: '还款金额',
        type: 'number',
        placeholder: '请输入还款金额',
        required: true,
        validation: {
          min: 100,
          max: 50000
        }
      }
    ],
    submitButtonText: '立即还款',
    successMessage: '还款提交成功！',
    customContent: {
      title: '信用卡还款',
      subtitle: '1-5万信用卡代还',
      description: '快速还款安全可靠，支持各大银行信用卡',
      discount: '6.5'
    }
  },

  // 二维码代还模板
  {
    id: 'qrcode-repayment',
    name: '二维码代还模板',
    description: '适用于扫码代还业务（花呗、借呗等）',
    category: 'qrcode',
    businessType: '二维码代还',
    exchangeRate: 7.2,
    quickAmounts: [500, 1000, 2000, 5000, 10000],
    showTutorial: true,
    tutorialText: '查看代还教程 →',
    fields: [
      {
        name: 'amount',
        label: '代还金额',
        type: 'number',
        placeholder: '请输入代还金额',
        required: true,
        validation: {
          min: 100,
          max: 20000
        }
      },
      {
        name: 'qrcode',
        label: '收款二维码',
        type: 'file',
        placeholder: '请上传收款二维码图片',
        required: true
      },
      {
        name: 'remark',
        label: '备注信息',
        type: 'textarea',
        placeholder: '请输入备注信息（可选）',
        required: false
      }
    ],
    submitButtonText: '提交代还',
    successMessage: '代还订单提交成功！',
    customContent: {
      title: '二维码代还',
      subtitle: '扫码代还服务',
      description: '支持花呗、借呗等各类扫码代还',
      discount: '7.5'
    }
  },

  // 卡密类模板
  {
    id: 'card-secret',
    name: '卡密类模板',
    description: '适用于各类卡密充值业务',
    category: 'card',
    businessType: '卡密充值',
    exchangeRate: 7.2,
    quickAmounts: [50, 100, 200, 500, 1000],
    showTutorial: true,
    tutorialText: '查看使用教程 →',
    fields: [
      {
        name: 'cardType',
        label: '卡密类型',
        type: 'select',
        placeholder: '请选择卡密类型',
        required: true,
        options: ['游戏点卡', '购物卡', '充值卡', '其他']
      },
      {
        name: 'amount',
        label: '购买金额',
        type: 'number',
        placeholder: '请输入购买金额',
        required: true,
        validation: {
          min: 10,
          max: 5000
        }
      },
      {
        name: 'quantity',
        label: '购买数量',
        type: 'number',
        placeholder: '请输入购买数量',
        required: true,
        validation: {
          min: 1,
          max: 100
        }
      },
      {
        name: 'email',
        label: '接收邮箱',
        type: 'text',
        placeholder: '请输入接收卡密的邮箱',
        required: true
      }
    ],
    submitButtonText: '立即购买',
    successMessage: '卡密购买成功，请查收邮箱！',
    customContent: {
      title: '卡密充值',
      subtitle: '各类卡密在线购买',
      description: '支持多种卡密类型，自动发货',
      discount: '9.0'
    }
  },

  // 电费缴费模板
  {
    id: 'electricity-bill',
    name: '电费缴费模板',
    description: '适用于电费缴费业务',
    category: 'utility',
    businessType: '电费缴费',
    exchangeRate: 7.2,
    quickAmounts: [100, 200, 300, 500, 1000],
    showTutorial: true,
    tutorialText: '查看缴费教程 →',
    fields: [
      {
        name: 'region',
        label: '缴费地区',
        type: 'select',
        placeholder: '请选择缴费地区',
        required: true,
        options: ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '其他']
      },
      {
        name: 'accountNumber',
        label: '用户编号',
        type: 'text',
        placeholder: '请输入电费户号',
        required: true
      },
      {
        name: 'customerName',
        label: '户主姓名',
        type: 'text',
        placeholder: '请输入户主姓名',
        required: true
      },
      {
        name: 'amount',
        label: '缴费金额',
        type: 'number',
        placeholder: '请输入缴费金额',
        required: true,
        validation: {
          min: 50,
          max: 2000
        }
      }
    ],
    submitButtonText: '立即缴费',
    successMessage: '电费缴费提交成功！',
    customContent: {
      title: '电费缴费',
      subtitle: '便民缴费服务',
      description: '支持全国各地电费缴费，快速到账',
      discount: '9.8'
    }
  }
];

// 根据模板ID获取模板
export const getTemplateById = (templateId: string): FormTemplate | undefined => {
  return FORM_TEMPLATES.find(template => template.id === templateId);
};

// 根据分类获取模板列表
export const getTemplatesByCategory = (category: string): FormTemplate[] => {
  return FORM_TEMPLATES.filter(template => template.category === category);
};

// 获取所有模板选项（用于下拉选择）
export const getTemplateOptions = () => {
  return FORM_TEMPLATES.map(template => ({
    value: template.id,
    label: template.name,
    description: template.description
  }));
}; 