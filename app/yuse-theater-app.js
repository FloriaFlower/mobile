if (typeof window.YuseTheaterApp === 'undefined') {
  window.YuseTheaterRegex = {
    fullMatch: /.*?<yuse_data>\s*(?:(?!<yuse_data>).)*?(?:<announcements>(.*?)<\/announcements>)?\s*(?:<customizations>(.*?)<\/customizations>)?\s*(?:<theater>(.*?)<\/theater>)?\s*(?:<theater_hot>(.*?)<\/theater_hot>)?\s*(?:<theater_new>(.*?)<\/theater_new>)?\s*(?:<theater_recommended>(.*?)<\/theater_recommended>)?\s*(?:<theater_paid>(.*?)<\/theater_paid>)?\s*(?:<shop>(.*?)<\/shop>)?\s*<\/yuse_data>(?:\s*<\/content>)?.*?$/s,
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
  // 核心修复1：提前定义全局函数（解决“全局函数未定义”问题）
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
          appElement.addEventListener('click', window.yuseTheaterApp.handlePageClick);
        }
      }, 100);
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
      this.savedData = {};
      this.isAutoRender = true;
      this.lastRenderTime = 0;
      this.renderCooldown = 500;
      this.handlePageClick = this.handlePageClick.bind(this);
      this.nativeHeaderSelector = '.app-header, #app-header, header';
      this.init();
    }
    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App（对齐原版）');
      this.loadDefaultData();
      this.setupDOMObserver();
      this.setupEventListeners();
      this.updateAppContent();
      this.parseNewData();
    }
    loadDefaultData() {
      for (const page in window.YuseTheaterPages) {
        if (!this.savedData[page]) {
          this.savedData[page] = '<div class="empty-state">等待加载数据...</div>';
        }
      }
    }
    setupDOMObserver() {
      try {
        // 核心优化：新增.chat-container选择器，兼容更多聊天容器
        const chatContainer = document.querySelector('#chat') || document.querySelector('.mes') || document.querySelector('.chat-container');
        if (chatContainer) {
          const observer = new MutationObserver(mutations => {
            let hasNewMsg = false;
            mutations.forEach(mutation => {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                  if (node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('mes') || node.classList.contains('message') || node.classList.contains('chat-message'))) {
                    hasNewMsg = true;
                  }
                });
              }
            });
            if (hasNewMsg) {
              // 核心优化：延长延迟至600ms，确保AI消息完全渲染
              console.log('[YuseTheater] DOM观察到新消息，600ms后解析数据');
              setTimeout(() => this.parseNewData(), 600);
            }
          });
          observer.observe(chatContainer, { childList: true, subtree: true });
          console.log('[YuseTheater] DOM观察器设置成功，监听容器:', chatContainer);
        }
      } catch (error) {
        console.warn('[YuseTheater] DOM观察器设置失败:', error);
      }
    }
    setupEventListeners() {
      window.addEventListener('contextUpdate', () => {
        console.log('[YuseTheater] 触发contextUpdate事件，解析数据');
        this.parseNewData();
      });
      window.addEventListener('messageUpdate', () => {
        console.log('[YuseTheater] 触发messageUpdate事件，解析数据');
        this.parseNewData();
      });
      // 核心优化：新增视图切换事件，切换页面主动刷新（适配所有4个功能）
      window.addEventListener('yuseViewSwitch', () => {
        console.log('[YuseTheater] 触发yuseViewSwitch事件，解析当前视图数据');
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
        
        const fullMatch = chatData.match(window.YuseTheaterRegex.fullMatch);
        if (fullMatch) {
          console.log('[YuseTheater] 完整匹配的yuse_data:', fullMatch[0].slice(0, 100) + '...');
          console.log('[YuseTheater] 匹配到yuse_data数据，开始更新');
          const [, announcements, customizations, theater, theaterHot, theaterNew, theaterRecommended, theaterPaid, shop] = fullMatch;
          console.log('[YuseTheater] 捕获到的各模块数据:', {
            announcements: announcements?.slice(0,30) || '空',
            customizations: customizations?.slice(0,30) || '空',
            theater: theater?.slice(0,30) || '空',
            shop: shop?.slice(0,30) || '空'
          });
          // 非空判断，仅更新有效数据（适配所有4个功能）
          if (announcements && announcements.trim() !== '') {
            this.savedData.announcements = announcements;
            isDataUpdated = true;
            console.log('[YuseTheater] 检测到新announcements数据，更新savedData');
          }
          if (customizations && customizations.trim() !== '') {
            this.savedData.customizations = customizations;
            isDataUpdated = true;
            console.log('[YuseTheater] 检测到新customizations数据，更新savedData');
            console.log(`[YuseTheater] customizations新数据长度: ${customizations.length} 字符`);
          }
          if (theater && theater.trim() !== '') {
            this.savedData.theater = theater;
            isDataUpdated = true;
            console.log('[YuseTheater] 检测到新theater数据，更新savedData');
          }
          if (theaterHot && theaterHot.trim() !== '') {
            this.savedData.theaterHot = theaterHot;
            isDataUpdated = true;
          }
          if (theaterNew && theaterNew.trim() !== '') {
            this.savedData.theaterNew = theaterNew;
            isDataUpdated = true;
          }
          if (theaterRecommended && theaterRecommended.trim() !== '') {
            this.savedData.theaterRecommended = theaterRecommended;
            isDataUpdated = true;
          }
          if (theaterPaid && theaterPaid.trim() !== '') {
            this.savedData.theaterPaid = theaterPaid;
            isDataUpdated = true;
          }
          if (shop && shop.trim() !== '') {
            this.savedData.shop = shop;
            isDataUpdated = true;
            console.log('[YuseTheater] 检测到新shop数据，更新savedData');
          }
          // 核心优化：有新数据时忽略冷却，强制更新（适配所有4个功能）
          if (isDataUpdated) {
            this.lastRenderTime = currentTime;
            this.updateAppContent();
            console.log(`[YuseTheater] 数据更新成功，当前视图: ${this.currentView}`);
          } else {
            console.log('[YuseTheater] 匹配到yuse_data，但无新有效数据');
          }
        } else {
          console.log('[YuseTheater] 未匹配到yuse_data数据（可能AI尚未返回新数据）');
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
        // 1. 优先获取mobileContext（原生场景）- 只取最后2条消息，精准排除旧数据
        const mobileContext = window.mobileContextEditor;
        if (mobileContext) {
          const chatData = mobileContext.getCurrentChatData();
          if (chatData?.messages) {
            // 关键修改：slice(-2)只保留最后2条消息（1条刷新指令+1条AI回复）
            const latestMessages = chatData.messages.slice(-2);
            const msgStr = latestMessages.map(msg => msg.mes || '').join('\n');
            console.log('[YuseTheater] 从mobileContext获取最后2条消息数据');
            return msgStr;
          }
        }
        // 2. 获取全局chat对象（SillyTavern场景）- 同样只取最后2条
        const globalChat = window.chat || window.SillyTavern?.chat;
        if (globalChat && Array.isArray(globalChat)) {
          const latestMessages = globalChat.slice(-2);
          const msgStr = latestMessages.map(msg => msg.mes || '').join('\n');
          console.log('[YuseTheater] 从全局chat获取最后2条消息数据');
          return msgStr;
        }
        // 3. 从DOM获取（兼容更多容器）- 只取最后2个消息节点
        const chatContainer = document.querySelector('#chat') || document.querySelector('.mes') || document.querySelector('.chat-container');
        if (chatContainer) {
          const msgNodes = chatContainer.querySelectorAll('.mes, .message, .chat-message');
          const latestNodes = Array.from(msgNodes).slice(-2); // 只取最后2个消息节点
          const msgStr = latestNodes.map(node => node.innerHTML).join('\n').replace(/\s+/g, ' ').trim();
          console.log('[YuseTheater] 从DOM获取最后2条消息数据（保留HTML结构）');
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
      this.sendToSillyTavern(refreshMsg, true);
      // 关键修改：解析延迟从70秒改为60秒，适配AI输出速度
      this.showToast(`正在刷新${pageConfig.name}...（等待AI返回数据，约1分钟）`);
      
      const retryTimes = 3; // 重试次数（保留）
      const retryInterval = 10000; // 重试间隔10秒（保留）
      
      // 关键修改：首次解析延迟从70000ms（70秒）改为60000ms（60秒）
      setTimeout(() => {
        console.log(`[YuseTheater] 首次解析刷新数据（等待AI输出60秒）`);
        this.parseNewData();
        
        // 重试逻辑：若首次未成功，后续每10秒重试
        for (let i = 1; i <= retryTimes; i++) {
          setTimeout(() => {
            console.log(`[YuseTheater] 第${i}次重试解析刷新数据`);
            this.parseNewData();
          }, retryInterval * i);
        }
      }, 60000); // 60秒 = 60000毫秒
    }
    sendToSillyTavern(message, isAutoSend = false) {
      try {
        const textarea = document.querySelector('#send_textarea');
        const sendBtn = document.querySelector('#send_but');
        if (textarea) {
          textarea.value = textarea.value ? `${textarea.value}\n${message}` : message;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          if (isAutoSend && sendBtn) {
            sendBtn.click();
            console.log('[YuseTheater] 已向输入框发送刷新指令并自动提交');
          }
          return true;
        }
        const backupTextarea = document.querySelector('textarea');
        if (backupTextarea) {
          backupTextarea.value = backupTextarea.value ? `${backupTextarea.value}\n${message}` : message;
          backupTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          if (isAutoSend) {
            backupTextarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            console.log('[YuseTheater] 已向备用输入框发送刷新指令并自动提交');
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
      window.dispatchEvent(new Event('yuseViewSwitch'));
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
      // 移除旧按钮
      const oldRefreshBtn = nativeHeader.querySelector('.yuse-refresh-btn');
      if (oldRefreshBtn) oldRefreshBtn.remove();
      // 创建新按钮（适配当前视图，4个功能通用）
      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'refresh-btn yuse-refresh-btn';
      refreshBtn.dataset.page = this.currentView;
      refreshBtn.innerHTML = '🔄 刷新';
      refreshBtn.addEventListener('click', () => {
        console.log(`[YuseTheater] 点击页眉刷新按钮，刷新视图：${this.currentView}`);
        this.sendRefreshRequest(this.currentView);
      });
      // 插入页眉
      nativeHeader.style.display = 'flex';
      nativeHeader.style.justifyContent = 'space-between';
      nativeHeader.style.alignItems = 'center';
      nativeHeader.appendChild(refreshBtn);
      console.log(`[YuseTheater] 已在页眉添加${this.currentView}视图的刷新按钮`);
    }
    getAppContent() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      const pageData = this.savedData[this.currentView] || '<div class="empty-state">暂无数据</div>';
      let content = '';
      // 适配4个功能的页面渲染
      switch (this.currentView) {
        case 'announcements':
          content = `<div class="yuse-announcement-list">${pageData}</div>`;
          break;
        case 'customizations':
          content = `<div class="yuse-customization-list">${pageData}</div>`;
          break;
        case 'theater':
          content = `
            <div class="theater-filters">
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
          <div class="yuse-nav-bar" style="position: absolute; bottom: 0; left: 0; width: 100%; box-sizing: border-box;">
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
        appElement.removeEventListener('click', this.handlePageClick);
        appElement.innerHTML = content;
        const contentArea = appElement.querySelector('.yuse-content-area');
        if (contentArea) {
          contentArea.style.padding = '16px 16px 60px';
          contentArea.style.overflowY = 'auto';
          contentArea.style.height = 'calc(100vh - 120px)';
        }
        this.updateNativeHeaderRefreshBtn();
        appElement.addEventListener('click', this.handlePageClick);
        // 打印当前视图渲染数据长度（适配4个功能）
        if (['announcements', 'customizations', 'theater', 'shop'].includes(this.currentView)) {
          console.log(`[YuseTheater] ${this.currentView}页面渲染数据长度: ${this.savedData[this.currentView]?.length || 0} 字符`);
        }
        console.log(`[YuseTheater] 页面内容更新完成，当前视图: ${this.currentView}`);
      } else {
        console.error('[YuseTheater] 未找到app-content容器，无法更新内容');
      }
    }
    handlePageClick(e) {
      const appContainer = document.getElementById('app-content');
      if (!appContainer) return;
      // 导航按钮点击（适配4个功能切换）
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
          listItem.style.transition = 'all 0.3s ease-out, margin-bottom 0.3s ease-out, padding 0.3s ease-out, max-height 0.3s ease-out';
          listItem.style.opacity = '0';
          listItem.style.transform = 'translateY(-20px) scale(0.95)';
          listItem.style.maxHeight = '0px';
          listItem.style.padding = '0';
          listItem.style.marginBottom = '0px';
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
        listItem.style.transition = 'all 0.3s ease-out';
        listItem.style.opacity = '0';
        listItem.style.transform = 'translateY(-10px)';
        setTimeout(() => listItem.remove(), 300);
        e.stopPropagation();
        return;
      }
      // 列表项点击（显示详情弹窗，适配4个功能）
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
                filteredData = this.savedData.theaterHot || '<div class="empty-state">暂无最热剧场内容</div>';
                break;
              case 'new':
                filteredData = this.savedData.theaterNew || '<div class="empty-state">暂无最新剧场内容</div>';
                break;
              case 'recommended':
                filteredData = this.savedData.theaterRecommended || '<div class="empty-state">暂无推荐剧场内容</div>';
                break;
              case 'paid':
                filteredData = this.savedData.theaterPaid || '<div class="empty-state">暂无高价定制剧场内容</div>';
                break;
              default:
                filteredData = this.savedData.theater || '<div class="empty-state">暂无剧场内容</div>';
            }
            theaterList.innerHTML = filteredData;
            console.log(`[YuseTheater] 剧场筛选完成，筛选类型：${filterType}`);
          }, 300);
        }
        return;
      }
    }
    showAnnouncementDetail(itemData) {
      console.log('[YuseTheater] 显示通告详情弹窗', itemData);
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
      console.log('[YuseTheater] 显示定制详情弹窗', itemData);
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
      console.log('[YuseTheater] 显示剧场详情弹窗', itemData);
      const renderComments = (reviewsStr) => {
        try {
          const reviews = JSON.parse(reviewsStr.replace(/'/g, '"'));
          return reviews.map(rev => `
            <div class="comment">
              <span class="comment-user">${rev.user}:</span> ${rev.text}
            </div>
          `).join('');
        } catch (e) {
          console.error('[YuseTheater] 解析剧场评论失败:', e);
          return '<div class="comment">评论加载失败</div>';
        }
      };
      const detailHtml = `
        <div class="cover-image" style="background-image: url('${itemData.cover || 'https://picsum.photos/400/200?random=1'}')"></div>
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
      console.log('[YuseTheater] 显示商城详情弹窗', itemData);
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
          background: #fff; width: 95%; max-height: 90%; border-radius: 20px;
          display: flex; flex-direction: column; animation: popIn 0.3s ease-out;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        ">
          <div class="modal-header" style="
            padding: 15px; border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
            font-size: 1.1em; font-weight: bold; color: var(--accent-color);
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
        console.log(`[YuseTheater] 已更新原生页眉标题为：${window.YuseTheaterPages[this.currentView].name}`);
      }
    }
    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'yuse-toast';
      toast.style.cssText = `
        position: fixed; bottom: 70px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.8); color: #fff; padding: 8px 16px;
        border-radius: 4px; font-size: 13px; z-index: 1001;
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
  // 验证全局函数是否挂载成功
  console.log('[YuseTheater] 全局函数状态:', {
    getYuseTheaterAppContent: typeof window.getYuseTheaterAppContent,
    bindYuseTheaterEvents: typeof window.bindYuseTheaterEvents,
    refreshYuseTheaterPage: typeof window.refreshYuseTheaterPage
  });
}
console.log('[YuseTheater] 欲色剧场 App 脚本加载完成');
