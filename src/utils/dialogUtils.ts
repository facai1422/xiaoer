// 弹窗工具函数 - 禁用拖拽功能

/**
 * 禁用所有弹窗的拖拽功能
 */
export const disableDialogDrag = () => {
  // 防止拖拽开始事件
  const preventDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-radix-dialog-content]') || target.closest('.dialog-content-fixed')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  };

  // 防止鼠标拖拽行为
  const preventMouseDrag = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-radix-dialog-content]') || target.closest('.dialog-content-fixed')) {
      // 如果是在弹窗上按下鼠标，阻止可能的拖拽行为
      if (e.button === 0) { // 只处理左键
        e.stopPropagation();
      }
    }
  };

  // 防止触摸拖拽
  const preventTouchMove = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-radix-dialog-content]') || target.closest('.dialog-content-fixed')) {
      // 允许滚动，但阻止拖拽
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && !element.closest('.overflow-y-auto')) {
          e.preventDefault();
        }
      }
    }
  };

  // 添加全局事件监听器
  document.addEventListener('dragstart', preventDragStart, { capture: true, passive: false });
  document.addEventListener('mousedown', preventMouseDrag, { capture: true });
  document.addEventListener('touchmove', preventTouchMove, { capture: false, passive: false });

  // 返回清理函数
  return () => {
    document.removeEventListener('dragstart', preventDragStart, { capture: true });
    document.removeEventListener('mousedown', preventMouseDrag, { capture: true });
    document.removeEventListener('touchmove', preventTouchMove, { capture: false });
  };
};

/**
 * 为特定的弹窗元素禁用拖拽
 */
export const disableElementDrag = (element: HTMLElement) => {
  if (!element) return;

  // 设置元素属性
  element.draggable = false;
  
  // 添加事件监听器
  const preventDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const preventMouseDrag = (e: MouseEvent) => {
    if (e.button === 0) { // 左键
      e.stopPropagation();
    }
  };

  element.addEventListener('dragstart', preventDrag);
  element.addEventListener('drag', preventDrag);
  element.addEventListener('dragend', preventDrag);
  element.addEventListener('mousedown', preventMouseDrag);

  // 为所有子元素也禁用拖拽
  const children = element.querySelectorAll('*');
  children.forEach((child) => {
    const childElement = child as HTMLElement;
    childElement.draggable = false;
    childElement.addEventListener('dragstart', preventDrag);
  });
};

/**
 * 初始化弹窗拖拽禁用功能
 * 应在应用启动时调用
 */
export const initDialogDragDisable = () => {
  // 立即禁用拖拽
  const cleanup = disableDialogDrag();

  // 监听DOM变化，为新添加的弹窗也禁用拖拽
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          
          // 检查是否是弹窗相关元素
          if (element.matches('[data-radix-dialog-content]') || 
              element.matches('.dialog-content-fixed') ||
              element.querySelector('[data-radix-dialog-content]') ||
              element.querySelector('.dialog-content-fixed')) {
            
            // 为新添加的弹窗禁用拖拽
            const dialogElements = element.matches('[data-radix-dialog-content]') || element.matches('.dialog-content-fixed')
              ? [element]
              : [
                  ...Array.from(element.querySelectorAll('[data-radix-dialog-content]')),
                  ...Array.from(element.querySelectorAll('.dialog-content-fixed'))
                ];
            
            dialogElements.forEach((dialog) => {
              disableElementDrag(dialog as HTMLElement);
            });
          }
        }
      });
    });
  });

  // 开始观察DOM变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 返回清理函数
  return () => {
    cleanup();
    observer.disconnect();
  };
}; 