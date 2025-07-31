/**
 * 手机号码余额查询服务
 */

interface PhoneBalanceResponse {
  code: number;
  message: string;
  data?: {
    phone: string;
    balance: string;
    operator: string; // 运营商
    province: string; // 省份
    city: string; // 城市
    area: string; // 地区
  };
}

// API配置
const API_KEY = 'tAooD3C5CtB31AGuW5xb8barX8';
const API_URLS = {
  // 通用查询接口
  general: 'https://api.taolale.com/api/Inquiry_Phone_Charges/get',
  // 运营商特定接口
  mobile: 'https://api.taolale.com/api/Inquiry_Phone_Charges/get_yd', // 移动
  unicom: 'https://api.taolale.com/api/Inquiry_Phone_Charges/get_lt', // 联通
  telecom: 'https://api.taolale.com/api/Inquiry_Phone_Charges/get_dx', // 电信
  // 归属地查询接口
  location: 'https://api.taolale.com/api/Location_inquiry/get'
};

/**
 * 根据手机号前缀判断运营商
 * @param phone 手机号码
 * @returns 运营商类型
 */
const getOperatorType = (phone: string): 'mobile' | 'unicom' | 'telecom' | 'unknown' => {
  const prefix = phone.substring(0, 3);
  
  // 移动号段
  if (['134', '135', '136', '137', '138', '139', '147', '150', '151', '152', '157', '158', '159', '172', '178', '182', '183', '184', '187', '188', '195', '197', '198'].includes(prefix)) {
    return 'mobile';
  }
  
  // 联通号段
  if (['130', '131', '132', '145', '146', '155', '156', '166', '167', '171', '175', '176', '185', '186', '196'].includes(prefix)) {
    return 'unicom';
  }
  
  // 电信号段
  if (['133', '149', '153', '162', '173', '174', '177', '180', '181', '189', '191', '193', '199'].includes(prefix)) {
    return 'telecom';
  }
  
  return 'unknown';
};

/**
 * 查询手机号归属地和运营商信息
 * @param phone 手机号码
 * @returns Promise<{province: string, city: string, operator: string}>
 */
const queryPhoneLocation = async (phone: string): Promise<{province: string, city: string, operator: string}> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    // 使用POST方式，参数放在body中
    const formData = new URLSearchParams();
    formData.append('key', API_KEY);
    formData.append('data', phone);
    
    const response = await fetch(API_URLS.location, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('归属地查询响应:', data);
    
    if (data.code === 200 && data.data) {
      return {
        province: data.data.province || '未知',
        city: data.data.city || '未知',
        operator: data.data.isp || '未知'
      };
    }
    
    throw new Error(data.msg || '查询归属地失败');
  } catch (error) {
    console.warn('查询归属地失败:', error);
    // 返回默认值，不影响余额查询
    return {
      province: '未知',
      city: '未知', 
      operator: '未知'
    };
  }
};

/**
 * 查询运营商特定的余额接口
 * @param phone 手机号码
 * @param operatorType 运营商类型
 * @returns Promise<{balance: string, success: boolean}>
 */
const queryOperatorSpecificBalance = async (phone: string, operatorType: 'mobile' | 'unicom' | 'telecom'): Promise<{balance: string, success: boolean}> => {
  try {
    const apiUrl = API_URLS[operatorType];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时
    
    // 使用POST方式，参数放在body中
    const formData = new URLSearchParams();
    formData.append('key', API_KEY);
    formData.append('mobile', phone);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`${operatorType}余额查询响应:`, data);
    
    if ((data.code === 200 || data.code === 0) && data.data) {
      const balance = data.data.curFee || data.data.mobile_fee || data.data.balance || '0.00';
      return {
        balance: String(balance),
        success: true
      };
    }
    
    throw new Error(data.msg || data.message || '查询失败');
  } catch (error) {
    console.warn(`运营商${operatorType}余额查询失败:`, error);
    return {
      balance: '0.00',
      success: false
    };
  }
};

/**
 * 查询手机号码余额（支持自动重试）
 * @param phone 手机号码
 * @returns Promise<PhoneBalanceResponse>
 */
export const queryPhoneBalance = async (phone: string): Promise<PhoneBalanceResponse> => {
  try {
    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return {
        code: -1,
        message: '请输入有效的手机号码'
      };
    }

    // 同时查询归属地信息
    const locationPromise = queryPhoneLocation(phone);

    // 先尝试通用接口查询余额
    let balanceResult: {balance: string, success: boolean} = {balance: '0.00', success: false};
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6秒超时
      
      // 使用POST方式，参数放在body中
      const formData = new URLSearchParams();
      formData.append('key', API_KEY);
      formData.append('phone', phone);
      
      const response = await fetch(API_URLS.general, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('通用接口响应状态:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('通用接口查询响应:', data);
        
        if (data.code === 200 || data.code === 0) {
          const balance = data.data?.balance || data.data?.curFee || data.data?.mobile_fee || data.balance || '0.00';
          balanceResult = {
            balance: String(balance),
            success: true
          };
        } else {
          console.warn('通用接口返回错误:', data.msg || data.message);
        }
      }
    } catch (error) {
      console.warn('通用接口查询失败，尝试运营商特定接口:', error);
    }

    // 如果通用接口失败，使用运营商特定接口
    if (!balanceResult.success) {
      const operatorType = getOperatorType(phone);
      if (operatorType !== 'unknown') {
        balanceResult = await queryOperatorSpecificBalance(phone, operatorType);
      }
    }

    // 等待归属地查询完成
    const locationInfo = await locationPromise;

    // 返回结果
    if (balanceResult.success) {
      return {
        code: 0,
        message: '查询成功',
        data: {
          phone: phone,
          balance: balanceResult.balance,
          operator: locationInfo.operator || '未知',
          province: locationInfo.province || '未知',
          city: locationInfo.city || '未知',
          area: `${locationInfo.province} ${locationInfo.city}`.trim() || '未知'
        }
      };
    } else {
      return {
        code: -1,
        message: '查询失败，请稍后重试'
      };
    }
    
  } catch (error) {
    console.error('查询手机余额失败:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          code: -1,
          message: '查询超时，请稍后重试'
        };
      }
      return {
        code: -1,
        message: error.message || '网络错误，请检查网络连接'
      };
    }
    
    return {
      code: -1,
      message: '查询失败，请稍后重试'
    };
  }
};

/**
 * 格式化余额显示
 * @param balance 余额字符串
 * @returns 格式化后的余额显示
 */
export const formatBalance = (balance: string): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) {
    return '0.00元';
  }
  return `${num.toFixed(2)}元`;
};

/**
 * 获取运营商颜色样式
 * @param operator 运营商名称
 * @returns CSS类名
 */
export const getOperatorColor = (operator: string): string => {
  const operatorName = operator.toLowerCase();
  
  if (operatorName.includes('移动') || operatorName.includes('mobile')) {
    return 'text-green-600 bg-green-50';
  } else if (operatorName.includes('联通') || operatorName.includes('unicom')) {
    return 'text-blue-600 bg-blue-50';
  } else if (operatorName.includes('电信') || operatorName.includes('telecom')) {
    return 'text-red-600 bg-red-50';
  } else if (operatorName.includes('广电') || operatorName.includes('cbrtv')) {
    return 'text-purple-600 bg-purple-50';
  }
  return 'text-gray-600 bg-gray-50';
};

/**
 * 测试API连接
 * @param phone 测试手机号
 * @returns Promise<{success: boolean, message: string, details?: any}>
 */
export const testPhoneBalanceAPI = async (phone: string = '13800138000'): Promise<{success: boolean, message: string, details?: any}> => {
  try {
    console.log('🔍 开始测试话费查询API，手机号:', phone);
    
    // 测试通用接口
    console.log('📞 测试通用接口...');
    const formData = new URLSearchParams();
    formData.append('key', API_KEY);
    formData.append('phone', phone);
    
    const response = await fetch(API_URLS.general, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: formData
    });
    
    console.log('🌐 响应状态:', response.status);
    
    if (!response.ok) {
      return {
        success: false,
        message: `HTTP错误: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    }
    
    const data = await response.json();
    console.log('📋 API响应数据:', data);
    
    if (data.code === 200 || data.code === 0) {
      return {
        success: true,
        message: 'API连接正常',
        details: data
      };
    } else {
      return {
        success: false,
        message: `API返回错误: ${data.msg || data.message || '未知错误'}`,
        details: data
      };
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error);
    return {
      success: false,
      message: `连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: error
    };
  }
};