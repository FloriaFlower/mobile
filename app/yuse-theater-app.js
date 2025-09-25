if (typeof window.YuseTheaterApp === 'undefined') {
  // 核心修复1：补充缺失的 YuseTheaterDefaultData（适配 mobile-phone.js 加载检测）
  window.YuseTheaterDefaultData = {
    announcements: '<div class="empty-state">等待加载通告数据...</div>',
    customizations: '<div class="empty-state">等待加载定制数据...</div>',
    theater: '<div class="empty-state">等待加载剧场数据...</div>',
    theaterHot: '<div class="empty-state">暂无最热剧场内容</div>',
    theaterNew: '<div class="empty-state">暂无最新剧场内容</div>',
    theaterRecommended: '<div class="empty-state">暂无推荐剧场内容</div>',
    theaterPaid: '<div class="empty-state">暂无高价定制剧场内容</div>',
    shop: '<div class="empty-state">等待加载商城数据...</div>'
  };

  window.YuseTheaterRegex = {
    fullMatch: /<yuse_data>.*?(?:<announcements>(.*?)<\/announcements>.*?)?(?:<customizations>(.*?)<\/customizations>.*?)?(?:<theater>(.*?)<\/theater>.*?)?(?:<theater_hot>(.*?)<\/theater_hot>.*?)?(?:<theater_new>(.*?)<\/theater_new>.*?)?(?:<theater_recommended>(.*?)<\/theater_recommended>.*?)?(?:<theater_paid>(.*?)<\/theater_paid>.*?)?(?:<shop>(.*?)<\/shop>.*?)?<\/yuse_data>/s,
    announcement: /\[通告\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
    customization: /\[定制\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
    theater: /\[剧场\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
    shop: /\[商品\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g
  };

  window.YuseTheaterPages = {
    announcements: {
      name: "通告拍摄",
      apiKeyword: "announcements",
      refreshMsg: "[刷新通告拍摄|请求新通告列表]"
    },
    customizations: {
      name: "粉丝定制",
      apiKeyword: "customizations",
      refreshMsg: "[刷新粉丝定制|请求新定制列表]"
    },
    theater: {
      name: "剧场列表",
      apiKeyword: "theater",
      refreshMsg: "[刷新剧场列表|请求新剧场内容]"
    },
    shop: {
      name: "欲色商城",
      apiKeyword: "shop",
      refreshMsg: "[刷新欲色商城|请求新商品列表]"
    }
  };

  // 核心修复2：提前定义全局函数（确保 mobile-phone.js 调用时已存在）
  window.getYuseTheaterAppContent = function () {
    console.log('[YuseTheater] 全局函数调用：getYuseTheaterAppContent');
    if (window.yuseTheaterApp) {
      return window.yuseTheaterApp.getAppContent();
    }
    return '<div class="error-state">欲色剧场 app 实例未初始化</div>';
  };

  window.bindYuseTheaterEvents = function () {
    console.log('[YuseTheater] 全局函数调用：bindYuseTheaterEvents');
    if (window.yuseTheaterApp) {
      setTimeout(() => {
        const appElement = document.getElementById('app-content');
        if (appElement) {
          // 先移除旧事件再绑定新事件，避免重复绑定
          appElement.removeEventListener('click', window.yuseTheaterApp.handlePageClick);
          appElement.addEventListener('click', window.yuseTheaterApp.handlePageClick);
        }
      }, 200); // 延长延迟，确保 app-content 容器完全渲染
    } else {
      console.warn('[YuseTheater] bindYuseTheaterEvents：app 实例未找到');
    }
  };

  window.bindYuseTheaterAppEvents = window.bindYuseTheaterEvents; // 保持别名一致性

  window.refreshYuseTheaterPage = function (pageKey) {
    console.log('[YuseTheater] 全局函数调用：refreshYuseTheaterPage，页面键：', pageKey);
    if (window.yuseTheaterApp) {
      window.yuseTheaterApp.sendRefreshRequest(pageKey);
    }
  };

  class YuseTheaterApp {
    constructor() {
      this.currentView = 'announcements';
      this.savedData = { ...window.YuseTheaterDefaultData }; // 初始化默认数据
      this.isAutoRender = true;
      this.lastRenderTime = 0;
      this.renderCooldown = 500;
      this.handlePageClick = this.handlePageClick.bind(this);
      this.nativeHeaderSelector = '.app-header, #app-header, header';
      this.init();
    }

    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App（对齐原版）');
      this.setupDOMObserver(); // 优先启动DOM观察器
      this.setupEventListeners();
      this.updateAppContent();
      this.parseNewData(); // 初始解析一次数据
    }

    setupDOMObserver() {
      try {
        // 核心修复3：增强聊天容器匹配（覆盖 mobile-phone.js 中可能的容器类名）
        const chatContainer = document.querySelector('#chat') || 
                             document.querySelector('.mes') || 
                             document.querySelector('.chat-container') || 
                             document.querySelector('.mobile-content') || // 新增手机端容器
                             document.querySelector('#mobile-content'); // 新增手机端主内容容器
        if (chatContainer) {
          const observer = new MutationObserver(mutations => {
            let hasNewMsg = false;
            mutations.forEach(mutation => {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                  // 核心修复4：增强新消息识别（匹配更多手机端消息类名）
                  const isNewMsg = node.nodeType === Node.ELEMENT_NODE && 
                                 (node.classList.contains('mes') || 
                                  node.classList.contains('message') || 
                                  node.classList.contains('chat-message') || 
                                  node.classList.contains('message-item') || // 新增手机端消息类
                                  node.classList.contains('chat-item')); // 新增手机端消息类
                  if (isNewMsg) {
                    hasNewMsg = true;
                    console.log('[YuseTheater] DOM观察到新消息节点:', node.classList);
                  }
                });
              }
            });
            if (hasNewMsg) {
              // 核心修复5：延长DOM解析延迟至1000ms（确保AI消息完全渲染）
              console.log('[YuseTheater] DOM观察到新消息，1000ms后解析数据');
              setTimeout(() => this.parseNewData(), 1000);
            }
          });
          // 观察所有子节点变化（包括嵌套层级）
          observer.observe(chatContainer, { childList: true, subtree: true });
          console.log('[YuseTheater] DOM观察器设置成功，监听容器:', chatContainer);
        } else {
          console.warn('[YuseTheater] 未找到聊天容器，无法监听新消息');
        }
      } catch (error) {
        console.warn('[YuseTheater] DOM观察器设置失败:', error);
      }
    }

    setupEventListeners() {
      // 核心修复6：保留原有事件，新增手机端可能的自定义事件
      window.addEventListener('contextUpdate', () => {
        console.log('[YuseTheater] 触发 contextUpdate 事件，解析数据');
        this.parseNewData();
      });
      window.addEventListener('messageUpdate', () => {
        console.log('[YuseTheater] 触发 messageUpdate 事件，解析数据');
        this.parseNewData();
      });
      window.addEventListener('yuseViewSwitch', () => {
        console.log('[YuseTheater] 触发 yuseViewSwitch 事件，解析数据');
        this.parseNewData();
      });
      // 新增手机端视图切换事件监听（适配 mobile-phone.js 导航）
      window.addEventListener('mobileViewSwitch', () => {
        console.log('[YuseTheater] 触发 mobileViewSwitch 事件，解析数据');
        this.parseNewData();
      });
    }

    parseNewData() {
      if (!this.isAutoRender) {
        console.log('[YuseTheater] 自动渲染已关闭，跳过解析');
        return;
      }
      const currentTime = Date.now();
      const timeDiff = currentTime - this.lastRenderTime;
      let isDataUpdated = false;

      try {
        const chatData = this.getChatContent();
        console.log(`[YuseTheater] 开始解析数据 - 聊天内容长度: ${chatData.length} 字符`);
        
        // 核心修复7：打印原始聊天数据片段（方便排查格式问题）
        if (chatData.length > 0) {
          const preview = chatData.slice(0, 200) + (chatData.length > 200 ? '...' : '');
          console.log(`[YuseTheater] 聊天数据预览: ${preview}`);
        }

        const fullMatch = chatData.match(window.YuseTheaterRegex.fullMatch);
        if (fullMatch) {
          console.log('[YuseTheater] 匹配到 yuse_data 数据，开始更新');
          const [, announcements, customizations, theater, theaterHot, theaterNew, theaterRecommended, theaterPaid, shop] = fullMatch;
          
          // 非空判断，仅更新有效数据（增加前后去空，避免空白数据覆盖）
          if (announcements && announcements.trim() !== '') {
            this.savedData.announcements = announcements.trim();
            isDataUpdated = true;
            console.log('[YuseTheater] 已更新 announcements 数据');
          }
          if (customizations && customizations.trim() !== '') {
            this.savedData.customizations = customizations.trim();
            isDataUpdated = true;
            console.log('[YuseTheater] 已更新 customizations 数据');
          }
          if (theater && theater.trim() !== '') {
            this.savedData.theater = theater.trim();
            isDataUpdated = true;
            console.log('[YuseTheater] 已更新 theater 数据');
          }
          if (theaterHot && theaterHot.trim() !== '') {
            this.savedData.theaterHot = theaterHot.trim();
            isDataUpdated = true;
            console.log('[YuseTheater] 已更新 theaterHot 数据');
          }
          if (theaterNew && theaterNew.trim() !== '') {
            this.savedData.theaterNew = theaterNew.trim();
            isDataUpdated = true;
            console.log('[YuseTheater] 已更新 theaterNew 数据');
          }
          if (theaterRecommended && theaterRecommended.trim() !== '') {
            this.savedData.theaterRecommended = theaterRecommended.trim();
            isDataUpdated = true;
            console.log('[YuseTheater] 已更新 theaterRecommended 数据');
          }
          if (theaterPaid && theaterPaid.trim() !== '') {
            this.savedData.theaterPaid = theaterPaid.trim();
            isDataUpdated = true;
            console.log('[YuseTheater] 已更新 theaterPaid 数据');
          }
          if (shop && shop.trim() !== '') {
            this.savedData.shop = shop.trim();
            isDataUpdated = true;
            console.log('[YuseTheater] 已更新 shop 数据');
          }

          // 有新数据时强制更新页面（忽略冷却）
          if (isDataUpdated) {
            this.lastRenderTime = currentTime;
            this.updateAppContent();
            console.log(`[YuseTheater] 数据更新成功，当前视图: ${this.currentView}`);
          } else {
            console.log('[YuseTheater] 匹配到 yuse_data，但无新有效数据');
          }
        } else {
          console.log('[YuseTheater] 未匹配到 yuse_data 数据（可能AI尚未返回或格式错误）');
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据失败:', error);
      }

      // 非数据更新场景保留冷却
      if (!isDataUpdated && timeDiff < this.renderCooldown) {
        console.log('[YuseTheater] 冷却期内（<500ms），跳过非必要解析');
        return;
      }
      this.lastRenderTime = currentTime;
    }

    getChatContent() {
      try {
        // 核心修复8：优化聊天数据获取逻辑（优先手机端场景）
        // 1. 优先获取 mobile-phone.js 中的聊天数据（如果存在）
        if (window.mobilePhone && window.mobilePhone.currentApp === 'yuse-theater') {
          const appContent = document.getElementById('app-content');
          const chatContainer = appContent?.querySelector('.chat-container') || 
                               appContent?.querySelector('.mes');
          if (chatContainer) {
            const msgStr = chatContainer.innerHTML.replace(/\s+/g, ' ').trim();
            console.log('[YuseTheater] 从手机端 app-content 获取聊天数据');
            return msgStr;
          }
        }

        // 2. 优先获取 mobileContext（原生手机场景）
        const mobileContext = window.mobileContextEditor;
        if (mobileContext) {
          const chatData = mobileContext.getCurrentChatData();
          if (chatData?.messages) {
            const msgStr = chatData.messages.map(msg => msg.mes || '').join('\n');
            console.log('[YuseTheater] 从 mobileContext 获取聊天数据');
            return msgStr;
          }
        }

        // 3. 获取全局 chat 对象（SillyTavern 场景）
        const globalChat = window.chat || window.SillyTavern?.chat;
        if (globalChat && Array.isArray(globalChat)) {
          const msgStr = globalChat.map(msg => msg.mes || '').join('\n');
          console.log('[YuseTheater] 从全局 chat 获取聊天数据');
          return msgStr;
        }

        // 4. 从DOM获取（兼容更多容器，保留HTML结构）
        const chatContainer = document.querySelector('#chat') || 
                             document.querySelector('.mes') || 
                             document.querySelector('.chat-container') || 
                             document.querySelector('.mobile-content') || 
                             document.querySelector('#mobile-content');
        if (chatContainer) {
          // 核心修复9：保留HTML标签，不替换换行（避免破坏 <yuse_data> 结构）
          const msgStr = chatContainer.innerHTML.trim();
          console.log('[YuseTheater] 从DOM获取聊天数据（保留完整HTML）');
          return msgStr;
        }
      } catch (error) {
        console.warn('[YuseTheater] 获取对话内容失败:', error);
      }
      return '';
    }

    sendRefreshRequest(pageKey) {
      const pageConfig = window.YuseTheaterPages[pageKey];
      if (!pageConfig) {
        console.warn(`[YuseTheater] 未找到页面配置：${pageKey}`);
        return;
      }
      const refreshMsg = pageConfig.refreshMsg;
      const isSendSuccess = this.sendToSillyTavern(refreshMsg, true);
      if (isSendSuccess) {
        this.showToast(`正在刷新${pageConfig.name}...（等待AI返回，约1分钟）`);
        
        // 核心修复10：优化解析重试逻辑（适配AI 1分钟输出，增加重试次数）
        const retryTimes = 5; // 重试5次
        const retryInterval = 15000; // 每15秒重试一次（总覆盖 70秒 + 15*4=130秒，共2分钟）
        
        // 首次解析：70秒后（确保AI有足够时间生成）
        setTimeout(() => {
          console.log(`[YuseTheater] 首次解析刷新数据（等待AI输出70秒）`);
          this.parseNewData();
          
          // 重试逻辑：后续每15秒重试一次
          for (let i = 1; i <= retryTimes; i++) {
            setTimeout(() => {
              console.log(`[YuseTheater] 第${i}次重试解析刷新数据`);
              this.parseNewData();
            }, retryInterval * i);
          }
        }, 70000); // 70秒 = 70000毫秒
      } else {
        this.showToast(`刷新失败：无法发送请求`);
      }
    }

    sendToSillyTavern(message, isAutoSend = false) {
      try {
        // 核心修复11：适配 mobile-phone.js 输入框（优先手机端输入框）
        const textarea = document.querySelector('#send_textarea') || 
                         document.querySelector('.mobile-input textarea') || // 手机端输入框
                         document.querySelector('#mobile-input'); // 手机端输入框
        const sendBtn = document.querySelector('#send_but') || 
                        document.querySelector('.send-btn') || // 手机端发送按钮
                        document.querySelector('#mobile-send-btn'); // 手机端发送按钮
        
        if (textarea) {
          textarea.value = textarea.value ? `${textarea.value}\n${message}` : message;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          // 触发输入框滚动到底部（避免手机端输入框内容被遮挡）
          textarea.scrollTop = textarea.scrollHeight;
          
          if (isAutoSend) {
            if (sendBtn) {
              sendBtn.click();
              console.log('[YuseTheater] 已向输入框发送刷新指令并自动提交（通过按钮）');
            } else {
              // 无发送按钮时，模拟Enter提交（适配手机端）
              textarea.dispatchEvent(new KeyboardEvent('keydown', { 
                key: 'Enter', 
                bubbles: true,
                code: 'Enter'
              }));
              console.log('[YuseTheater] 已向输入框发送刷新指令并自动提交（通过Enter）');
            }
          }
          return true;
        }
      } catch (error) {
        console.error('[YuseTheater] 操作输入框失败:', error);
      }
      return false;
    }

    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey] || this.currentView === pageKey) {
        console.log(`[YuseTheater] 无需切换视图：${pageKey}（当前视图已相同或配置不存在）`);
        return;
      }
      this.currentView = pageKey;
      // 触发视图切换事件，通知mobile-phone.js同步状态
      window.dispatchEvent(new Event('yuseViewSwitch'));
      window.dispatchEvent(new Event('mobileViewSwitch')); // 新增手机端事件
      this.updateAppContent();
      this.updateHeader();
      this.updateNativeHeaderRefreshBtn();
      console.log(`[YuseTheater] 切换视图至：${pageKey}`);
    }

    updateNativeHeaderRefreshBtn() {
      const nativeHeader = document.querySelector(this.nativeHeaderSelector);
      if (!nativeHeader) {
        console.warn('[YuseTheater] 未找到原生页眉，无法添加刷新按钮');
        return;
      }
      // 移除旧按钮（避免重复添加）
      const oldRefreshBtn = nativeHeader.querySelector('.yuse-refresh-btn');
      if (oldRefreshBtn) oldRefreshBtn.remove();
      // 创建新按钮（适配手机端样式）
      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'refresh-btn yuse-refresh-btn';
      refreshBtn.dataset.page = this.currentView;
      refreshBtn.innerHTML = '🔄 刷新';
      refreshBtn.style.padding = '6px 12px'; // 适配手机端按钮大小
      refreshBtn.style.borderRadius = '8px';
      refreshBtn.addEventListener('click', () => {
        console.log(`[YuseTheater] 点击页眉刷新按钮，刷新视图：${this.currentView}`);
        this.sendRefreshRequest(this.currentView);
      });
      // 插入页眉（确保手机端显示正常）
      nativeHeader.style.display = 'flex';
      nativeHeader.style.justifyContent = 'space-between';
      nativeHeader.style.alignItems = 'center';
      nativeHeader.appendChild(refreshBtn);
      console.log(`[YuseTheater] 已在页眉添加${this.currentView}视图的刷新按钮`);
    }

    getAppContent() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      const pageData = this.savedData[this.currentView] || window.YuseTheaterDefaultData[this.currentView];
      let content = '';

      switch (this.currentView) {
        case 'announcements':
          content = `<div class="yuse-announcement-list">${pageData}</div>`;
          break;
        case 'customizations':
          content = `<div class="yuse-customization-list">${pageData}</div>`;
          break;
        case 'theater':
          content = `
            <div class="theater-filters" style="margin-bottom: 12px;">
              <button class="filter-btn" data-filter="hot">🔥 最热</button>
              <button class="filter-btn" data-filter="new">🆕 最新</button>
              <button class="filter-btn" data-filter="recommended">❤️ 推荐</button>
              <button class="filter-btn" data-filter="paid">💸 高价定制</button>
            </div>
            <div class="yuse-theater-list" id="theater-list">${pageData}</div>
          `;
          break;
        case 'shop':
          content = `<div class="yuse-shop-list">${pageData}</div>`;
          break;
      }

      // 生成导航栏（适配手机端底部导航）
      const nav = Object.keys(window.YuseTheaterPages).map(pageKey => {
        const navConfig = window.YuseTheaterPages[pageKey];
        return `
          <button class="yuse-nav-btn ${this.currentView === pageKey ? 'active' : ''}" data-page="${pageKey}">
            ${this.getNavIcon(pageKey)} ${navConfig.name}
          </button>
        `;
      }).join('');

      return `
        <div class="yuse-theater-app" style="position: relative; height: 100%; overflow: hidden;">
          <div class="yuse-content-area">${content}</div>
          <div class="yuse-nav-bar" style="position: absolute; bottom: 0; left: 0; width: 100%; box-sizing: border-box; display: flex; gap: 4px; padding: 8px; background: #fff; border-top: 1px solid #eee;">
            ${nav}
          </div>
        </div>
      `;
    }

    getNavIcon(pageKey) {
      const iconMap = {
        announcements: '📢',
        customizations: '💖',
        theater: '🎬',
        shop: '🛒'
      };
      return iconMap[pageKey] || '📄';
    }

    updateAppContent() {
      const content = this.getAppContent();
      const appElement = document.getElementById('app-content');
      if (appElement) {
        // 核心修复12：强制重新渲染（先清空再插入，避免DOM缓存）
        appElement.innerHTML = '';
        setTimeout(() => {
          appElement.innerHTML = content;
          // 重新绑定点击事件（确保事件生效）
          appElement.removeEventListener('click', this.handlePageClick);
          appElement.addEventListener('click', this.handlePageClick);
          
          // 适配手机端内容区域样式
          const contentArea = appElement.querySelector('.yuse-content-area');
          if (contentArea) {
            contentArea.style.padding = '16px 16px 80px'; // 底部留足导航栏空间
            contentArea.style.overflowY = 'auto';
            contentArea.style.height = 'calc(100vh - 140px)'; // 适配手机端屏幕高度
          }
          this.updateNativeHeaderRefreshBtn();
          console.log(`[YuseTheater] 页面内容更新完成，当前视图: ${this.currentView}`);
        }, 100);
      } else {
        console.error('[YuseTheater] 未找到 app-content 容器，无法更新内容');
      }
    }

    handlePageClick(e) {
      const appContainer = document.getElementById('app-content');
      if (!appContainer) return;

      // 导航按钮点击
      const navBtn = e.target.closest('.yuse-nav-btn');
      if (navBtn) {
        const pageKey = navBtn.dataset.page;
        this.switchView(pageKey);
        return;
      }

      // 拒绝按钮点击
      const rejectBtn = e.target.closest('.reject-btn');
      if (rejectBtn) {
        const listItem = rejectBtn.closest('.list-item');
        if (listItem) {
          listItem.style.transition = 'all 0.3s ease-out';
          listItem.style.opacity = '0';
          listItem.style.transform = 'translateY(-20px) scale(0.95)';
          setTimeout(() => listItem.remove(), 300);
        }
        e.stopPropagation();
        return;
      }

      // 定制直接接取按钮点击
      const acceptBtn = e.target.closest('.accept-btn');
      if (acceptBtn && acceptBtn.closest('.list-item') && acceptBtn.closest('.list-item').dataset.type === 'customization') {
        const listItem = acceptBtn.closest('.list-item');
        const itemData = listItem.dataset;
        this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
        this.showToast(`已添加${itemData.typeName}到输入框`);
        listItem.style.opacity = '0';
        setTimeout(() => listItem.remove(), 300);
        e.stopPropagation();
        return;
      }

      // 列表项点击（显示详情弹窗）
      const listItem = e.target.closest('.list-item');
      if (listItem) {
        const itemData = listItem.dataset;
        if (!itemData.type) {
          this.showToast('列表项数据异常，请刷新重试');
          return;
        }
        switch (itemData.type) {
          case 'announcement':
            this.showAnnouncementDetail(itemData);
            break;
          case 'customization':
            this.showCustomizationDetail(itemData);
            break;
          case 'theater':
            this.showTheaterDetail(itemData);
            break;
          case 'shop':
            this.showShopDetail(itemData);
            break;
        }
        return;
      }

      // 剧场筛选按钮点击
      const filterBtn = e.target.closest('.filter-btn');
      if (filterBtn) {
        const filterType = filterBtn.dataset.filter;
        const theaterList = appContainer.querySelector('#theater-list');
        if (theaterList) {
          theaterList.innerHTML = '<div class="loading">加载筛选结果...</div>';
          setTimeout(() => {
            let filteredData = '';
            switch (filterType) {
              case 'hot':
                filteredData = this.savedData.theaterHot || window.YuseTheaterDefaultData.theaterHot;
                break;
              case 'new':
                filteredData = this.savedData.theaterNew || window.YuseTheaterDefaultData.theaterNew;
                break;
              case 'recommended':
                filteredData = this.savedData.theaterRecommended || window.YuseTheaterDefaultData.theaterRecommended;
                break;
              case 'paid':
                filteredData = this.savedData.theaterPaid || window.YuseTheaterDefaultData.theaterPaid;
                break;
              default:
                filteredData = this.savedData.theater || window.YuseTheaterDefaultData.theater;
            }
            theaterList.innerHTML = filteredData;
            console.log(`[YuseTheater] 剧场筛选完成，筛选类型：${filterType}`);
          }, 300);
        }
        return;
      }
    }

    // 以下方法（showAnnouncementDetail、showCustomizationDetail等）保持原有逻辑不变
    showAnnouncementDetail(itemData) {
      console.log('[YuseTheater] 显示通告弹窗', itemData);
      const detailHtml = `
        <div class="detail-section">
          <h4>剧情简介</h4>
          <p>${itemData.description || '无'}</p>
        </div>
        <div class="detail-section">
          <h4>拍摄信息</h4>
          <p><strong>拍摄地点：</strong>${itemData.location || '无'}</p>
          <p><strong>合作演员：</strong>${itemData.actor || '无'}</p>
          <p><strong>片酬待遇：</strong>${itemData.payment || '无'}</p>
        </div>
      `;
      const footerHtml = `
        <button class="action-button reject-btn" onclick="document.querySelector('.yuse-modal').style.opacity='0';setTimeout(()=>document.querySelector('.yuse-modal').remove(),300)">返回</button>
        <button class="action-button accept-btn" id="accept-announcement-btn">接取</button>
      `;
      this.createOriginalModal(itemData.title, detailHtml, footerHtml);
      const acceptBtn = document.getElementById('accept-announcement-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          this.sendToSillyTavern(`[通告|${itemData.title}|${itemData.description}|${itemData.actor}|${itemData.location}|${itemData.payment}]`);
          this.showToast(`已添加《${itemData.title}》到输入框`);
          document.querySelector('.yuse-modal').style.opacity = '0';
          setTimeout(() => document.querySelector('.yuse-modal').remove(), 300);
        });
      }
    }

    showCustomizationDetail(itemData) {
      console.log('[YuseTheater] 显示定制弹窗', itemData);
      const detailHtml = `
        <div class="detail-section">
          <h4>定制类型</h4>
          <p>${itemData.typeName || '无'}</p>
        </div>
        <div class="detail-section">
          <h4>内容要求</h4>
          <p>${itemData.request || '无'}</p>
        </div>
        <div class="detail-section">
          <h4>时间要求</h4>
          <p>${itemData.deadline || '无'}</p>
        </div>
        <div class="detail-section">
          <h4>报酬待遇</h4>
          <p>${itemData.payment || '无'}</p>
        </div>
        <div class="detail-section">
          <h4>备注信息</h4>
          <p>${itemData.notes || '无'}</p>
        </div>
      `;
      const footerHtml = `
        <button class="action-button reject-btn" onclick="document.querySelector('.yuse-modal').style.opacity='0';setTimeout(()=>document.querySelector('.yuse-modal').remove(),300)">返回</button>
        <button class="action-button accept-btn" id="accept-custom-btn">接取</button>
      `;
      this.createOriginalModal(`${itemData.fanId} 的定制`, detailHtml, footerHtml);
      const acceptBtn = document.getElementById('accept-custom-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
          this.showToast(`已添加${itemData.fanId}的定制到输入框`);
          document.querySelector('.yuse-modal').style.opacity = '0';
          setTimeout(() => document.querySelector('.yuse-modal').remove(), 300);
        });
      }
    }

    showTheaterDetail(itemData) {
      console.log('[YuseTheater] 显示剧场弹窗', itemData);
      const renderComments = (reviewsStr) => {
        try {
          const reviews = JSON.parse(reviewsStr.replace(/'/g, '"'));
          return reviews.map(rev => `
            <div class="comment">
              <span class="comment-user">${rev.user}:</span> ${rev.text}
            </div>
          `).join('');
        } catch (e) {
          console.error('[YuseTheater] 解析评论失败:', e);
          return '<div class="comment">评论加载失败</div>';
        }
      };
      const detailHtml = `
        <div class="cover-image" style="background-image: url('${itemData.cover || 'https://picsum.photos/400/200?random=1'}'); height: 180px; background-size: cover; border-radius: 8px; margin-bottom: 12px;"></div>
        <div class="detail-section">
          <h4>作品简介</h4>
          <p>${itemData.description || '无'}</p>
        </div>
        <div class="detail-section">
          <h4>作品数据</h4>
          <p><strong>人气：</strong>${itemData.popularity || '无'}</p>
          <p><strong>收藏：</strong>${itemData.favorites || '无'}</p>
          <p><strong>播放：</strong>${itemData.views || '无'}</p>
          <p><strong>价格：</strong>${itemData.price || '无'}</p>
        </div>
        <div class="detail-section">
          <h4>粉丝热评</h4>
          ${itemData.reviews ? renderComments(itemData.reviews) : '<div class="comment">暂无评论</div>'}
        </div>
      `;
      const footerHtml = `
        <button class="action-button accept-btn" onclick="document.querySelector('.yuse-modal').style.opacity='0';setTimeout(()=>document.querySelector('.yuse-modal').remove(),300)">返回</button>
      `;
      this.createOriginalModal(itemData.title, detailHtml, footerHtml);
    }

    showShopDetail(itemData) {
      console.log('[YuseTheater] 显示商城弹窗', itemData);
      const renderComments = (commentsStr) => {
        try {
          const comments = JSON.parse(commentsStr.replace(/'/g, '"'));
          return comments.map(comm => `
            <div class="comment">
              <span class="comment-user">${comm.user}:</span> ${comm.text}
            </div>
          `).join('');
        } catch (e) {
          console.error('[YuseTheater] 解析商品评论失败:', e);
          return '<div class="comment">评论加载失败</div>';
        }
      };
      const detailHtml = `
        <div class="detail-section">
          <h4>商品卖点</h4>
          <p>${itemData.description || '无'}</p>
        </div>
        <div class="detail-section">
          <h4>价格信息</h4>
          <p><strong>基础价格：</strong>${itemData.price || '无'}</p>
          <p><strong>当前最高价：</strong>${itemData.highestBid || '无'}</p>
        </div>
        <div class="detail-section">
          <h4>评论区</h4>
          ${itemData.comments ? renderComments(itemData.comments) : '<div class="comment">暂无评论</div>'}
        </div>
      `;
      const footerHtml = `
        <button class="action-button accept-btn" onclick="document.querySelector('.yuse-modal').style.opacity='0';setTimeout(()=>document.querySelector('.yuse-modal').remove(),300)">返回</button>
      `;
      this.createOriginalModal(itemData.name, detailHtml, footerHtml);
    }

    createOriginalModal(header, body, footer) {
      const existingModal = document.querySelector('.yuse-modal');
      if (existingModal) existingModal.remove();
      const modal = document.createElement('div');
      modal.className = 'yuse-modal';
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 9999; display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.5); opacity: 0; transition: opacity 0.3s ease;
      `;
      modal.innerHTML = `
        <div class="modal-content" style="
          background: #fff; width: 90%; max-width: 500px; max-height: 80vh; border-radius: 12px;
          display: flex; flex-direction: column; animation: popIn 0.3s ease-out;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        ">
          <div class="modal-header" style="
            padding: 15px; border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
            font-size: 1.1em; font-weight: bold; color: #333;
          ">
            ${header}
            <button class="close-btn" style="
              background: none; border: none; font-size: 18px; cursor: pointer;
              color: #666; transition: color 0.2s ease;
            ">×</button>
          </div>
          <div class="modal-body" style="
            flex: 1; overflow-y: auto; padding: 15px; line-height: 1.6;
          ">
            ${body}
          </div>
          <div class="modal-footer" style="
            padding: 15px; border-top: 1px solid #eee;
            display: flex; justify-content: flex-end; gap: 10px;
          ">
            ${footer}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      setTimeout(() => modal.style.opacity = '1', 10);
      const closeBtn = modal.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.style.opacity = '0';
          setTimeout(() => modal.remove(), 300);
        });
      }
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.opacity = '0';
          setTimeout(() => modal.remove(), 300);
        }
      });
    }

    updateHeader() {
      if (window.mobilePhone && window.mobilePhone.updateAppHeader) {
        window.mobilePhone.updateAppHeader({
          app: 'yuse-theater',
          title: window.YuseTheaterPages[this.currentView].name,
          view: this.currentView
        });
        console.log(`[YuseTheater] 已通知 mobile-phone.js 更新页眉标题为：${window.YuseTheaterPages[this.currentView].name}`);
      }
    }

    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'yuse-toast';
      toast.style.cssText = `
        position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.8); color: #fff; padding: 10px 16px;
        border-radius: 8px; font-size: 14px; z-index: 1001;
        opacity: 0; transition: all 0.3s ease;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.style.opacity = '1', 100);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000); // 延长提示显示时间至3秒
    }

    destroy() {
      this.isAutoRender = false;
      const appElement = document.getElementById('app-content');
      if (appElement) {
        appElement.removeEventListener('click', this.handlePageClick);
      }
      const nativeHeader = document.querySelector(this.nativeHeaderSelector);
      if (nativeHeader) {
        const refreshBtn = nativeHeader.querySelector('.yuse-refresh-btn');
        if (refreshBtn) refreshBtn.remove();
      }
      console.log('[YuseTheater] 销毁欲色剧场 App');
    }
  }

  // 实例化App（确保全局函数已定义后再实例化）
  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] app 实例初始化完成（对齐原版）');
  // 验证全局函数和默认数据是否挂载成功（适配 mobile-phone.js 检测）
  console.log('[YuseTheater] 全局函数状态:', {
    getYuseTheaterAppContent: typeof window.getYuseTheaterAppContent,
    bindYuseTheaterEvents: typeof window.bindYuseTheaterEvents,
    refreshYuseTheaterPage: typeof window.refreshYuseTheaterPage
  });
  console.log('[YuseTheater] YuseTheaterDefaultData 状态:', typeof window.YuseTheaterDefaultData);
}
console.log('[YuseTheater] 欲色剧场 App 脚本加载完成');
