/**
 * YuseTheater App - 欲色剧场应用
 * 适配手机模拟器插件，修复初始化日志缺失、数据不更新、仅读样板文本问题
 * 参考 Task App 验证有效的刷新/读取机制（多源监听+手机端适配）
 */
// @ts-nocheck
// 1. 紧急修复：补充缺失的 YuseTheaterDefaultData（解决 mobile-phone.js 检测报错）
if (typeof window.YuseTheaterDefaultData === 'undefined') {
  window.YuseTheaterDefaultData = {
    customizations: [], // 粉丝定制数据
    tags: [], // 标签数据
    functions: [
      { id: 'func1', name: '功能1', desc: '默认功能示例（待实时更新）' },
      { id: 'func2', name: '功能2', desc: '默认功能示例（待实时更新）' },
      { id: 'func3', name: '功能3', desc: '默认功能示例（待实时更新）' },
      { id: 'func4', name: '功能4', desc: '默认功能示例（待实时更新）' }
    ], // 功能列表（初始样板，后续会被实时数据覆盖）
    currentView: 'customizations',
    lastParseTime: 0
  };
  console.log('[YuseTheater] YuseTheaterDefaultData 初始化完成，状态: object');
}

// 避免重复定义应用类
if (typeof window.YuseTheaterApp === 'undefined') {
  class YuseTheaterApp {
    constructor() {
      // 继承默认数据，同时支持实时更新
      this.data = { ...window.YuseTheaterDefaultData };
      this.isAutoParseEnabled = true;
      this.parseCooldown = 3000; // 解析冷却（避免频繁触发）
      this.retryCount = 0;
      this.maxRetry = 5; // 最大重试次数（覆盖2分钟AI输出）
      this.eventListenersSetup = false;
      this.domObserver = null;
      this.contextCheckInterval = null;
      this.init(); // 启动初始化
    }

    // 2. 初始化流程（强化日志，确保可追踪）
    init() {
      console.log('[YuseTheater] 欲色剧场应用初始化开始 - 适配手机端');
      // 立即执行一次初始解析（读取实时聊天数据，覆盖样板）
      this.parseYuseDataFromChat();
      // 异步设置监控（避免阻塞界面，参考 Task App 机制）
      setTimeout(() => {
        this.setupContextMonitor();
        this.setupDOMObserver(); // 监听聊天DOM变化
        this.setupSillyTavernListeners(); // 监听ST事件
      }, 1000); // 延迟1秒，确保手机端DOM加载完成
      console.log('[YuseTheater] 欲色剧场应用初始化完成 - 等待实时数据');
    }

    // 3. 上下文监控（移植 Task App 验证有效的多源监听）
    setupContextMonitor() {
      console.log('[YuseTheater] 设置上下文监控（适配手机端）');
      // 监听手机端常见事件（含自定义视图切换事件）
      const events = ['contextUpdate', 'messageUpdate', 'chatChanged', 'mobileViewSwitch'];
      events.forEach(eventName => {
        window.addEventListener(eventName, (e) => {
          console.log(`[YuseTheater] 监听到${eventName}事件，触发解析`);
          this.scheduleParseYuseData(1000); // 延迟1秒解析，适配AI返回延迟
        });
      });

      // 定时检查（5秒一次，补充监听遗漏）
      this.contextCheckInterval = setInterval(() => {
        if (this.isAutoParseEnabled) {
          this.parseYuseDataFromChat();
        }
      }, 5000);
    }

    // 4. DOM观察器（适配手机端聊天容器与消息类名）
    setupDOMObserver() {
      try {
        // 手机端聊天容器优先级：.mobile-content > #mobile-content > #chat > .mes（参考 Task App 适配逻辑）
        const chatContainers = [
          document.querySelector('.mobile-content'),
          document.querySelector('#mobile-content'),
          document.querySelector('#chat'),
          document.querySelector('.mes')
        ];
        const chatContainer = chatContainers.find(elem => elem !== null);

        if (chatContainer) {
          console.log('[YuseTheater] DOM观察器绑定成功，容器:', chatContainer.className || chatContainer.id);
          this.domObserver = new MutationObserver((mutations) => {
            let hasNewMessage = false;
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                  // 匹配手机端消息类名：.message-item > .chat-item > .mes > .message（覆盖常见场景）
                  const isMessageNode = node.nodeType === Node.ELEMENT_NODE && 
                    (node.classList.contains('message-item') || 
                     node.classList.contains('chat-item') || 
                     node.classList.contains('mes') || 
                     node.classList.contains('message'));
                  if (isMessageNode) {
                    hasNewMessage = true;
                  }
                });
              }
            });

            if (hasNewMessage) {
              console.log('[YuseTheater] DOM观察到新消息，1000ms后解析数据');
              this.scheduleParseYuseData(1000); // 延迟1秒，确保AI消息加载完整
            }
          });

          // 观察DOM子元素变化（深度监听）
          this.domObserver.observe(chatContainer, { childList: true, subtree: true });
        } else {
          console.warn('[YuseTheater] 未找到聊天容器，15秒后重试');
          setTimeout(() => this.setupDOMObserver(), 15000); // 重试机制
        }
      } catch (error) {
        console.error('[YuseTheater] 设置DOM观察器失败:', error);
        setTimeout(() => this.setupDOMObserver(), 15000); // 报错后重试
      }
    }

    // 5. 适配 SillyTavern 事件（参考 Task App 防抖+重试）
    setupSillyTavernListeners() {
      if (this.eventListenersSetup) return;

      try {
        const eventSource = window['eventSource'];
        const eventTypes = window['event_types'];
        if (eventSource && eventTypes) {
          this.eventListenersSetup = true;
          // 防抖解析（避免重复触发）
          const debouncedParse = this.debounce(() => {
            console.log('[YuseTheater] ST事件触发解析（防抖后）');
            this.parseYuseDataFromChat();
          }, 1500);

          // 监听ST核心事件（消息发送/接收/聊天切换）
          if (eventTypes.MESSAGE_SENT) eventSource.on(eventTypes.MESSAGE_SENT, debouncedParse);
          if (eventTypes.MESSAGE_RECEIVED) eventSource.on(eventTypes.MESSAGE_RECEIVED, debouncedParse);
          if (eventTypes.CHAT_CHANGED) eventSource.on(eventTypes.CHAT_CHANGED, debouncedParse);
          console.log('[YuseTheater] SillyTavern事件监听设置完成');
        } else {
          console.warn('[YuseTheater] 未找到ST事件源，5秒后重试');
          setTimeout(() => this.setupSillyTavernListeners(), 5000); // 重试
        }
      } catch (error) {
        console.error('[YuseTheater] 设置ST监听失败:', error);
        setTimeout(() => this.setupSillyTavernListeners(), 5000);
      }
    }

    // 6. 聊天数据获取（适配手机端结构，保留完整标签）
    getChatData() {
      try {
        // 优先从手机端专属容器获取（mobile-phone.js 常用结构）
        const appContent = document.querySelector('#app-content .mobile-content') || document.querySelector('#app-content');
        if (appContent) {
          const messages = appContent.querySelectorAll('.message-item, .chat-item, .mes');
          if (messages.length > 0) {
            const chatData = Array.from(messages).map(node => ({
              mes: node.innerHTML, // 保留完整HTML，不替换换行（避免破坏<yuse_data>标签）
              timestamp: new Date().toLocaleString()
            }));
            console.log('[YuseTheater] 从手机端app-content获取聊天数据，条数:', chatData.length);
            // 打印前300字符预览（方便排查AI返回格式）
            if (chatData.length > 0) {
              const preview = chatData[chatData.length - 1].mes.slice(0, 300);
              console.log('[YuseTheater] 最新聊天数据预览:', preview);
            }
            return chatData;
          }
        }

        // 兼容 Task App 同款数据来源
        const mobileContextEditor = window['mobileContextEditor'];
        if (mobileContextEditor) {
          const chatData = mobileContextEditor.getCurrentChatData();
          if (chatData?.messages?.length > 0) {
            console.log('[YuseTheater] 从mobileContextEditor获取聊天数据，条数:', chatData.messages.length);
            return chatData.messages;
          }
        }

        // 兜底：全局chat变量
        if (window['chat'] && Array.isArray(window['chat'])) {
          console.log('[YuseTheater] 从全局chat获取数据，条数:', window['chat'].length);
          return window['chat'];
        }

        console.warn('[YuseTheater] 未获取到聊天数据，当前仅显示样板文本');
        return [];
      } catch (error) {
        console.error('[YuseTheater] 获取聊天数据失败:', error);
        return [];
      }
    }

    // 7. 解析<yuse_data>数据（强化匹配+重试）
    parseYuseDataFromChat() {
      const currentTime = Date.now();
      // 冷却机制：避免3秒内重复解析
      if (currentTime - this.data.lastParseTime < this.parseCooldown) return;
      this.data.lastParseTime = currentTime;

      try {
        const chatData = this.getChatData();
        if (chatData.length === 0) {
          // 无数据时重试（最多5次）
          if (this.retryCount < this.maxRetry) {
            this.retryCount++;
            console.log(`[YuseTheater] 无聊天数据，第${this.retryCount}/${this.maxRetry}次重试（15秒后）`);
            setTimeout(() => this.parseYuseDataFromChat(), 15000);
          }
          return;
        }

        // 拼接所有聊天内容（保留完整标签）
        const allContent = chatData.map(msg => msg.mes || '').join('\n');
        // 匹配<yuse_data>标签（支持换行/空格）
        const yuseDataRegex = /<yuse_data>([\s\S]*?)<\/yuse_data>/i;
        const match = allContent.match(yuseDataRegex);

        if (match && match[1]) {
          console.log('[YuseTheater] 匹配到yuse_data数据，开始更新');
          const rawData = match[1];
          try {
            // 解析JSON数据（允许注释，增强兼容性）
            const parsedData = JSON.parse(rawData.replace(/\/\/.*/g, ''));
            // 更新应用数据（覆盖样板文本）
            if (parsedData.customizations) this.data.customizations = parsedData.customizations;
            if (parsedData.tags) this.data.tags = parsedData.tags;
            if (parsedData.functions) this.data.functions = parsedData.functions;
            
            console.log('[YuseTheater] 已更新数据 - 定制数:', this.data.customizations.length, '标签数:', this.data.tags.length);
            this.retryCount = 0; // 重置重试次数
            this.updateAppContent(); // 强制更新页面
          } catch (jsonError) {
            console.error('[YuseTheater] 解析yuse_data JSON失败:', jsonError);
            console.log('[YuseTheater] 原始数据:', rawData.slice(0, 500)); // 打印部分原始数据排查
          }
        } else {
          console.log('[YuseTheater] 未匹配到yuse_data标签，当前仅显示样板文本');
          // 未匹配到时重试
          if (this.retryCount < this.maxRetry) {
            this.retryCount++;
            setTimeout(() => this.parseYuseDataFromChat(), 15000);
          }
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据总失败:', error);
      }
    }

    // 8. 页面更新（强制清空DOM，避免缓存）
    updateAppContent() {
      console.log(`[YuseTheater] 页面内容更新完成，当前视图: ${this.data.currentView}`);
      const appElement = document.getElementById('app-content');
      if (!appElement) return;

      // 强制清空容器（解决DOM缓存导致不更新问题）
      appElement.innerHTML = '';
      // 插入新内容
      appElement.innerHTML = this.getAppContent();
      // 重新绑定事件（确保按钮生效）
      setTimeout(() => this.bindEvents(), 500);
    }

    // 9. 渲染页面内容（保留原有功能视图）
    getAppContent() {
      switch (this.data.currentView) {
        case 'customizations':
          return this.renderCustomizations();
        case 'tags':
          return this.renderTags();
        case 'functions':
          return this.renderFunctions();
        default:
          return this.renderCustomizations();
      }
    }

    // 渲染粉丝定制页面
    renderCustomizations() {
      const items = this.data.customizations.length > 0 
        ? this.data.customizations.map(item => `
            <div class="yuse-item">
              <h3>${item.title}</h3>
              <p>${item.desc}</p>
              <span class="tag">${item.tag}</span>
            </div>
          `).join('')
        : '<div class="empty-state">暂无粉丝定制数据（等待AI返回）</div>';

      return `
        <div class="yuse-theater">
          <div class="view-header">
            <h2>粉丝定制</h2>
            <button class="refresh-btn" id="refresh-customizations">刷新数据</button>
          </div>
          <div class="view-tabs">
            <button class="tab active" data-view="customizations">定制</button>
            <button class="tab" data-view="tags">标签</button>
            <button class="tab" data-view="functions">功能</button>
          </div>
          <div class="view-content">${items}</div>
        </div>
      `;
    }

    // 渲染标签页面（简化示例）
    renderTags() {
      const tags = this.data.tags.length > 0 
        ? this.data.tags.map(tag => `<span class="tag-item">${tag}</span>`).join('')
        : '<div class="empty-state">暂无标签数据（等待AI返回）</div>';

      return `
        <div class="yuse-theater">
          <div class="view-header">
            <h2>标签管理</h2>
            <button class="refresh-btn" id="refresh-tags">刷新数据</button>
          </div>
          <div class="view-tabs">
            <button class="tab" data-view="customizations">定制</button>
            <button class="tab active" data-view="tags">标签</button>
            <button class="tab" data-view="functions">功能</button>
          </div>
          <div class="view-content tag-container">${tags}</div>
        </div>
      `;
    }

    // 渲染功能页面（简化示例）
    renderFunctions() {
      const funcs = this.data.functions.map(func => `
        <div class="func-item">
          <h3>${func.name}</h3>
          <p>${func.desc}</p>
        </div>
      `).join('');

      return `
        <div class="yuse-theater">
          <div class="view-header">
            <h2>功能列表</h2>
            <button class="refresh-btn" id="refresh-functions">刷新数据</button>
          </div>
          <div class="view-tabs">
            <button class="tab" data-view="customizations">定制</button>
            <button class="tab" data-view="tags">标签</button>
            <button class="tab active" data-view="functions">功能</button>
          </div>
          <div class="view-content func-container">${funcs}</div>
        </div>
      `;
    }

    // 10. 事件绑定（适配手机端按钮）
    bindEvents() {
      console.log('[YuseTheater] 绑定页面事件（适配手机端）');
      const appElement = document.getElementById('app-content');
      if (!appElement) return;

      // 视图切换按钮
      appElement.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          const view = e.target.dataset.view;
          this.data.currentView = view;
          this.updateAppContent();
          console.log(`[YuseTheater] 切换视图至: ${view}`);
        });
      });

      // 刷新按钮（触发AI请求+解析）
      appElement.querySelectorAll('.refresh-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.showToast('正在刷新（等待AI返回，约1分钟）', 'info');
          console.log('[YuseTheater] 点击刷新按钮，发送刷新指令到AI');
          this.sendRefreshCommand(); // 发送刷新指令
          this.scheduleParseYuseData(5000); // 5秒后开始解析（给AI响应时间）
        });
      });
    }

    // 11. 发送刷新指令（适配手机端输入框）
    sendRefreshCommand() {
      try {
        // 手机端输入框优先级：.mobile-input textarea > #mobile-input > #send_textarea
        const textarea = document.querySelector('.mobile-input textarea') || 
                        document.querySelector('#mobile-input') || 
                        document.querySelector('#send_textarea');
        if (!textarea) {
          console.error('[YuseTheater] 未找到手机端输入框');
          return;
        }

        // 发送刷新指令（触发AI返回<yuse_data>）
        textarea.value = '请返回欲色剧场的最新<yuse_data>数据，包含customizations、tags、functions字段';
        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        // 手机端发送按钮：.send-btn > #mobile-send-btn > #send_but
        const sendBtn = document.querySelector('.send-btn') || 
                        document.querySelector('#mobile-send-btn') || 
                        document.querySelector('#send_but');
        if (sendBtn) {
          sendBtn.click();
          console.log('[YuseTheater] 已触发手机端发送按钮，等待AI响应');
        } else {
          // 备用：触发Enter键
          textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          console.log('[YuseTheater] 已触发Enter键发送，等待AI响应');
        }
      } catch (error) {
        console.error('[YuseTheater] 发送刷新指令失败:', error);
      }
    }

    // 辅助：防抖函数（避免重复触发）
    debounce(func, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

    // 辅助：延迟解析（适配AI返回时间）
    scheduleParseYuseData(delay) {
      setTimeout(() => {
        this.parseYuseDataFromChat();
      }, delay);
    }

    // 辅助：显示提示（手机端可见）
    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `yuse-toast ${type} mobile-toast`; // 适配手机端样式
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 100);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // 销毁：清理资源
    destroy() {
      if (this.domObserver) this.domObserver.disconnect();
      if (this.contextCheckInterval) clearInterval(this.contextCheckInterval);
      console.log('[YuseTheater] 应用已销毁，清理资源完成');
    }
  }

  // 创建全局实例（确保 mobile-phone.js 可调用）
  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] 全局实例创建完成，可通过 window.yuseTheaterApp 访问');
}

// 3. 提前定义全局函数（确保 mobile-phone.js 加载时可调用）
window.getYuseTheaterAppContent = function () {
  console.log('[YuseTheater] 全局函数 getYuseTheaterAppContent 被调用');
  if (!window.yuseTheaterApp) {
    console.error('[YuseTheater] yuseTheaterApp 实例不存在');
    return '<div class="error-state">欲色剧场加载失败（实例缺失）</div>';
  }
  try {
    return window.yuseTheaterApp.getAppContent();
  } catch (error) {
    console.error('[YuseTheater] 获取应用内容失败:', error);
    return '<div class="error-state">欲色剧场内容加载失败</div>';
  }
};

window.bindYuseTheaterEvents = function () {
  console.log('[YuseTheater] 全局函数 bindYuseTheaterEvents 被调用');
  if (window.yuseTheaterApp) {
    setTimeout(() => window.yuseTheaterApp.bindEvents(), 500);
  }
};

window.yuseTheaterRefresh = function () {
  console.log('[YuseTheater] 全局函数 yuseTheaterRefresh 被调用');
  if (window.yuseTheaterApp) {
    window.yuseTheaterApp.sendRefreshCommand();
  }
};

// 打印全局函数状态（方便验证）
console.log('[YuseTheater] 全局函数状态:', {
  getYuseTheaterAppContent: typeof window.getYuseTheaterAppContent === 'function' ? 'function' : 'missing',
  bindYuseTheaterEvents: typeof window.bindYuseTheaterEvents === 'function' ? 'function' : 'missing',
  yuseTheaterRefresh: typeof window.yuseTheaterRefresh === 'function' ? 'function' : 'missing'
});
console.log('[YuseTheater] 欲色剧场应用模块加载完成（适配手机端）');
