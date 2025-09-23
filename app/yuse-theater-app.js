if (typeof window.YuseTheaterApp === 'undefined') {
  window.YuseTheaterRegex = {
    fullMatch: /<yuse_data>.*?<announcements>(.*?)<\/announcements>.*?<customizations>(.*?)<\/customizations>.*?<theater>(.*?)<\/theater>.*?<theater_hot>(.*?)<\/theater_hot>.*?<theater_new>(.*?)<\/theater_new>.*?<theater_recommended>(.*?)<\/theater_recommended>.*?<theater_paid>(.*?)<\/theater_paid>.*?<shop>(.*?)<\/shop>.*?<\/yuse_data>/s,
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

  class YuseTheaterApp {
    constructor() {
      this.currentView = 'announcements';
      this.savedData = {};
      this.isAutoRender = true;
      this.lastRenderTime = 0;
      this.renderCooldown = 200;
      this.init();
    }

    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App');
      this.loadDefaultData();
      this.setupDOMObserver();
      this.setupEventListeners();
      this.createRefreshButton();
      this.updateAppContent(true); // 初始化时强制渲染
    }

    loadDefaultData() {
      for (const page in window.YuseTheaterPages) {
        this.savedData[page] = '<div class="loading">加载中...</div>';
      }
    }

    setupDOMObserver() {
      try {
        const chatContainer = document.querySelector('#chat') || document.querySelector('.mes');
        if (chatContainer) {
          const observer = new MutationObserver(mutations => {
            const hasNewMsg = mutations.some(m => 
              m.type === 'childList' && 
              m.addedNodes.some(n => n.nodeType === Node.ELEMENT_NODE && 
                (n.classList.contains('mes') || n.classList.contains('message'))
              )
            );
            if (hasNewMsg && Date.now() - this.lastRenderTime > this.renderCooldown) {
              this.parseNewData();
            }
          });
          observer.observe(chatContainer, { childList: true, subtree: true });
        }
      } catch (error) {
        console.warn('[YuseTheater] DOM观察器设置失败:', error);
      }
    }

    setupEventListeners() {
      window.addEventListener('contextUpdate', () => this.parseNewData());
      window.addEventListener('messageUpdate', () => this.parseNewData());
    }

    createRefreshButton() {
      const header = document.querySelector('.app-header, .header');
      if (!header) return;
      
      const refreshBtn = document.createElement('button');
      refreshBtn.id = 'yuse-global-refresh';
      refreshBtn.innerHTML = '🔄 刷新';
      refreshBtn.style.cssText = `
        background: var(--accent-color); color: #fff; border: none; border-radius: 6px;
        padding: 4px 10px; font-size: 12px; cursor: pointer; margin-left: auto;
      `;
      refreshBtn.addEventListener('click', () => this.sendRefreshRequest(this.currentView, true));
      header.appendChild(refreshBtn);
    }

    parseNewData() {
      if (!this.isAutoRender) return;
      const currentTime = Date.now();
      if (currentTime - this.lastRenderTime < this.renderCooldown) return;

      try {
        const chatData = this.getChatContent();
        const fullMatch = chatData.match(window.YuseTheaterRegex.fullMatch);
        if (fullMatch) {
          const [, announcements, customizations, theater, theaterHot, theaterNew, theaterRecommended, theaterPaid, shop] = fullMatch;
          // 仅更新有变化的数据
          if (announcements !== this.savedData.announcements) this.savedData.announcements = announcements;
          if (customizations !== this.savedData.customizations) this.savedData.customizations = customizations;
          if (theater !== this.savedData.theater) this.savedData.theater = theater;
          if (theaterHot !== this.savedData.theaterHot) this.savedData.theaterHot = theaterHot;
          if (theaterNew !== this.savedData.theaterNew) this.savedData.theaterNew = theaterNew;
          if (theaterRecommended !== this.savedData.theaterRecommended) this.savedData.theaterRecommended = theaterRecommended;
          if (theaterPaid !== this.savedData.theaterPaid) this.savedData.theaterPaid = theaterPaid;
          if (shop !== this.savedData.shop) this.savedData.shop = shop;
          
          // 切换到当前页时强制更新（核心修复空屏）
          this.updateAppContent(this.currentView === 'announcements');
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据失败:', error);
        this.savedData[this.currentView] = '<div class="empty-state">数据异常，请刷新</div>';
        this.updateAppContent();
      }
      this.lastRenderTime = currentTime;
    }

    getChatContent() {
      try {
        const mobileContext = window.mobileContextEditor;
        if (mobileContext) return mobileContext.getCurrentChatData()?.messages?.map(m => m.mes).join('\n') || '';
        const chatElement = document.querySelector('#chat, .mes');
        return chatElement?.innerText || '';
      } catch (error) {
        return '';
      }
    }

    sendRefreshRequest(pageKey, sendToAI = false) {
      const pageConfig = window.YuseTheaterPages[pageKey];
      if (!pageConfig) return;
      
      this.savedData[pageKey] = '<div class="loading">刷新中...</div>';
      this.updateAppContent();
      
      if (sendToAI) {
        this.sendToSillyTavern(pageConfig.refreshMsg, true);
        setTimeout(() => this.parseNewData(), 500); // 等待AI响应后解析
      }
      this.showToast(`正在刷新${pageConfig.name}...`);
    }

    sendToSillyTavern(message, sendImmediately = false) {
      const textarea = document.querySelector('#send_textarea');
      if (textarea) {
        textarea.value = textarea.value ? `${textarea.value}\n${message}` : message;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        if (sendImmediately) {
          const sendBtn = document.querySelector('#send_but');
          sendBtn?.click();
        }
        return true;
      }
      return false;
    }

    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey] || this.currentView === pageKey) return;
      
      // 切换前保存当前滚动位置（可选优化）
      const contentArea = document.querySelector('.yuse-content-area');
      this.lastScrollY = contentArea?.scrollTop || 0;
      
      this.currentView = pageKey;
      this.updateAppContent(true); // 强制重新渲染
      this.showLoadingIfNoData(); // 预加载状态
    }

    updateAppContent(force = false) {
      const appElement = document.getElementById('app-content');
      if (!appElement) return;

      // 核心修复：每次更新时生成唯一key，避免组件复用缓存
      const content = this.getAppContent(force);
      appElement.innerHTML = content;
      
      const contentArea = appElement.querySelector('.yuse-content-area');
      if (contentArea) {
        contentArea.scrollTop = this.lastScrollY || 0;
        this.bindPageEvents();
      }
    }

    getAppContent(force = false) {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      let pageData = this.savedData[this.currentView];
      
      // 强制更新时重新解析（解决缓存问题）
      if (force && this.savedData[this.currentView]?.includes('<loading>')) {
        pageData = this.parseInitialData(this.currentView);
      }

      const content = `
        <div class="yuse-theater-app" data-key="${Date.now()}">
          <div class="yuse-content-area">
            ${this.renderPageContent(pageConfig, pageData)}
          </div>
          <div class="yuse-nav-bar">${this.renderNavBar()}</div>
        </div>
      `;
      return content;
    }

    renderPageContent(pageConfig, pageData) {
      switch (this.currentView) {
        case 'announcements':
          return `<div class="yuse-announcement-list">${pageData}</div>`;
        case 'customizations':
          return `<div class="yuse-customization-list">${pageData}</div>`;
        case 'theater':
          return `
            <div class="theater-filters">${this.renderTheaterFilters()}</div>
            <div class="yuse-theater-list" id="theater-list">${pageData}</div>
          `;
        case 'shop':
          return `<div class="yuse-shop-list">${pageData}</div>`;
        default:
          return '<div class="empty-state">未知页面</div>';
      }
    }

    renderNavBar() {
      return Object.keys(window.YuseTheaterPages).map(pageKey => `
        <button class="yuse-nav-btn ${this.currentView === pageKey ? 'active' : ''}" data-page="${pageKey}">
          ${this.getNavIcon(pageKey)} ${window.YuseTheaterPages[pageKey].name}
        </button>
      `).join('');
    }

    renderTheaterFilters() {
      return `
        <button class="filter-btn" data-filter="hot">🔥 最热</button>
        <button class="filter-btn" data-filter="new">🆕 最新</button>
        <button class="filter-btn" data-filter="recommended">❤️ 推荐</button>
        <button class="filter-btn" data-filter="paid">💸 高价定制</button>
      `;
    }

    bindPageEvents() {
      const appContainer = document.getElementById('app-content');
      if (!appContainer) return;

      appContainer.addEventListener('click', (e) => {
        const target = e.target.closest('[data-page], .reject-btn, .accept-btn, .filter-btn, .list-item');
        if (!target) return;

        // 导航切换
        if (target.dataset.page) {
          this.switchView(target.dataset.page);
          return;
        }

        // 拒绝/接取按钮
        if (target.classList.contains('reject-btn')) {
          target.closest('.list-item')?.remove();
          return;
        }
        if (target.classList.contains('accept-btn')) {
          this.handleAccept(target.closest('.list-item'));
          return;
        }

        // 筛选按钮
        if (target.classList.contains('filter-btn')) {
          this.handleFilter(target.dataset.filter);
          return;
        }

        // 列表项弹窗
        if (target.closest('.list-item')) {
          this.showItemModal(target.closest('.list-item').dataset);
        }
      });
    }

    handleAccept(listItem) {
      const data = listItem.dataset;
      let msg;
      if (data.type === 'announcement') {
        msg = `[通告|${data.title}|${data.description}|${data.actor}|${data.location}|${data.payment}]`;
      } else if (data.type === 'customization') {
        msg = `[定制|${data.typeName}|${data.request}|${data.fanId}|${data.deadline}|${data.notes}|${data.payment}]`;
      }
      this.sendToSillyTavern(msg);
      listItem.style.opacity = '0';
      setTimeout(() => listItem.remove(), 300);
      this.showToast(`已接取${data.title || data.typeName}`);
    }

    handleFilter(filterType) {
      const theaterList = document.getElementById('theater-list');
      theaterList.innerHTML = '<div class="loading">加载中...</div>';
      const dataMap = {
        hot: this.savedData.theaterHot,
        new: this.savedData.theaterNew,
        recommended: this.savedData.theaterRecommended,
        paid: this.savedData.theaterPaid
      };
      setTimeout(() => {
        theaterList.innerHTML = dataMap[filterType] || '<div class="empty-state">暂无数据</div>';
      }, 200);
    }

    showItemModal(data) {
      const modal = document.createElement('div');
      modal.className = 'yuse-modal';
      modal.innerHTML = this.getModalContent(data);
      document.body.appendChild(modal);
      
      modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => e.target === modal && modal.remove());
    }

    getModalContent(data) {
      let content = '';
      switch (data.type) {
        case 'announcement':
          content = `
            <div class="modal-header">${data.title}</div>
            <div class="modal-body">
              <p>剧情：${data.description}</p>
              <p>地点：${data.location}</p>
              <p>演员：${data.actor}</p>
              <p>片酬：${data.payment}</p>
            </div>
            <div class="modal-footer">
              <button class="accept-btn" onclick="window.yuseTheaterApp.handleAccept(this)">接取</button>
            </div>
          `;
          break;
        case 'customization':
          content = `
            <div class="modal-header">${data.fanId} 的定制</div>
            <div class="modal-body">
              <p>类型：${data.typeName}</p>
              <p>要求：${data.request}</p>
              <p>截止：${data.deadline}</p>
              <p>备注：${data.notes}</p>
              <p>报酬：${data.payment}</p>
            </div>
            <div class="modal-footer">
              <button class="accept-btn" onclick="window.yuseTheaterApp.handleAccept(this)">接取</button>
            </div>
          `;
          break;
        // 其他类型弹窗...
      }
      return `
        <div class="modal-content">
          ${content}
          <button class="close-btn">×</button>
        </div>
      `;
    }

    showLoadingIfNoData() {
      if (!this.savedData[this.currentView]?.trim()) {
        this.savedData[this.currentView] = '<div class="loading">加载中...</div>';
        this.updateAppContent();
      }
    }

    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'yuse-toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  }

  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] 最终修复版初始化完成');
}

// 兼容函数（保持原有接口）
window.getYuseTheaterAppContent = () => window.yuseTheaterApp?.getAppContent();
window.bindYuseTheaterEvents = () => window.yuseTheaterApp?.bindPageEvents();
window.refreshYuseTheaterPage = (pageKey) => window.yuseTheaterApp?.sendRefreshRequest(pageKey, true);
