/**
 * 弹窗公告工具函数
 * 用于管理首次访问弹窗的显示状态
 */

export interface PopupStatus {
  hasShownBefore: boolean;
  firstVisitDate: string | null;
  lastShownTime: string | null;
  noRemindUntil: string | null;
  isFirstVisit: boolean;
  lastAnnouncementUpdate: string | null;
}

/**
 * 获取当前弹窗状态
 */
export const getPopupStatus = (): PopupStatus => {
  const hasShownBefore = localStorage.getItem('popup_first_visit_shown') === 'true';
  const firstVisitDate = localStorage.getItem('popup_first_visit_date');
  const lastShownTime = localStorage.getItem('popup_last_shown');
  const noRemindUntil = localStorage.getItem('popup_no_remind_until');
  const lastAnnouncementUpdate = localStorage.getItem('popup_last_announcement_update');
  
  return {
    hasShownBefore,
    firstVisitDate,
    lastShownTime,
    noRemindUntil,
    lastAnnouncementUpdate,
    isFirstVisit: !hasShownBefore
  };
};

/**
 * 重置弹窗状态（用于测试）
 */
export const resetPopupStatus = (): void => {
  localStorage.removeItem('popup_first_visit_shown');
  localStorage.removeItem('popup_first_visit_date');
  localStorage.removeItem('popup_last_shown');
  localStorage.removeItem('popup_no_remind_until');
  localStorage.removeItem('popup_last_announcement_update');
  
  // 清除今日显示记录
  const today = new Date().toISOString().split('T')[0];
  sessionStorage.removeItem(`popup_shown_${today}`);
};

/**
 * 设置弹窗已显示
 */
export const markPopupAsShown = (announcementUpdateTime?: string): void => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('popup_first_visit_shown', 'true');
  localStorage.setItem('popup_first_visit_date', today);
  localStorage.setItem('popup_last_shown', new Date().toISOString());
  
  // 记录公告的更新时间
  if (announcementUpdateTime) {
    localStorage.setItem('popup_last_announcement_update', announcementUpdateTime);
  }
  
  // 在session storage中标记今日已显示
  sessionStorage.setItem(`popup_shown_${today}`, 'true');
};

/**
 * 设置今日不再提示
 */
export const setNoRemindToday = (enabled: boolean = true): void => {
  if (enabled) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('popup_no_remind_until', today);
    // 同时在sessionStorage中标记今日已显示
    sessionStorage.setItem(`popup_shown_${today}`, 'true');
  } else {
    localStorage.removeItem('popup_no_remind_until');
  }
};

/**
 * 检查是否应该显示弹窗
 * 简化逻辑：只在用户首次访问时显示一次
 */
export const shouldShowPopup = (announcementUpdateTime?: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  
  // 1. 检查今日是否已经显示过（最优先检查）
  const shownToday = sessionStorage.getItem(`popup_shown_${today}`);
  if (shownToday) {
    return false; // 今日已显示，不再显示
  }
  
  // 2. 检查是否设置了今日不再提示
  const noRemindUntil = localStorage.getItem('popup_no_remind_until');
  if (noRemindUntil && noRemindUntil >= today) {
    return false; // 用户选择了今日不再提示
  }
  
  // 3. 检查是否是首次访问
  const hasShownBefore = localStorage.getItem('popup_first_visit_shown') === 'true';
  if (!hasShownBefore) {
    return true; // 首次访问，显示弹窗
  }
  
  // 4. 如果管理员更新了公告，也显示弹窗（但仍然遵循今日不重复显示的规则）
  if (announcementUpdateTime) {
    const lastAnnouncementUpdate = localStorage.getItem('popup_last_announcement_update');
    if (lastAnnouncementUpdate) {
      const lastUpdate = new Date(lastAnnouncementUpdate);
      const currentUpdate = new Date(announcementUpdateTime);
      
      if (currentUpdate > lastUpdate) {
        return true; // 公告有更新，显示弹窗
      }
    }
  }
  
  return false; // 默认不显示
};

/**
 * 格式化日期时间显示
 */
export const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return '未设置';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateStr;
  }
}; 