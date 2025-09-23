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
      this.savedData = {
        announcements: '<div class="loading">加载中...</div>',
        customizations: '<div class="loading">加载中...</div>',
        theater: '<div class="loading">加载中...</div>',
        shop: '<div class="loading">加载中...</div>'
      };
      this.isAutoRender = true;
      this.lastRenderTime = 0;
      this.renderCooldown = 200;
      this.init();
    }

    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App');
      this.setupDOMObserver();
      this.setupEventListeners();
      this.createRefreshButton();
      this.parseNewData(true); // 初始化时强制解析一次
    }

    setupDOMObserver() {
      try {
        const chatContainer = document.querySelector('#chat') || document.querySelector('.mes');
        if (chatContainer) {
          new MutationObserver(mutations => {
            if (mutations.some(m => m.addedNodes.length)) {
              this.parseNewData();
            }
          }).observe(chatContainer, { childList: true, subtree: true });
        }
      } catch (error) {
        console.warn('[YuseTheater] DOM观察器设置失败:', error);
      }
    }

    setupEventListeners() {
      window.addEventListener('popstate', () => this.parseNewData()); // 监听返回按钮
    }

    parseNewData(init = false) {
      const currentTime = Date.now();
      if (!init && currentTime - this.lastRenderTime < this.renderCooldown) return;

      try {
        const chatData = this.getChatContent();
        const fullMatch = chatData.match(window.YuseTheaterRegex.fullMatch);
        if (fullMatch) {
          const [, announcements, customizations, theater, theaterHot, theaterNew, theaterRecommended, theaterPaid, shop] = fullMatch;
          this.savedData = {
            announcements: this.parseList(announcements, 'announcement'),
            customizations: this.parseList(customizations, 'customization'),
            theater: this.parseList(theater, 'theater'),
            theaterHot: this.parseList(theaterHot, 'theater'),
            theaterNew: this.parseList(theaterNew, 'theater'),
            theaterRecommended: this.parseList(theaterRecommended, 'theater'),
            theaterPaid: this.parseList(theaterPaid, 'theater'),
            shop: this.parseList(shop, 'shop')
          };
          this.updateAppContent(); // 数据更新后立即渲染
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据失败:', error);
      }

      this.lastRenderTime = currentTime;
    }

    parseList(data, type) {
      if (!data) return '<div class="empty-state">暂无数据</div>';
      return data.replace(window.YuseTheaterRegex[type], (_, ...groups) => {
        const [id, title, ...rest] = groups;
        const dataset = { id, type, title, ...Object.fromEntries(rest.map((v, i) => [`field${i+1}`, v])) };
        return this.renderListItem(dataset, type);
      });
    }

    renderListItem(data, type) {
      let itemClass = 'list-item';
      let actions = '<div class="item-actions"></div>';
      
      if (type === 'announcement') {
        itemClass += ' announcement-item';
        actions = `
          <button class="action-button reject-btn">× 拒绝</button>
        `;
      } else if (type === 'customization') {
        itemClass += ' customization-item';
        actions = `
          <button class="action-button accept-btn">✅ 接取</button>
          <button class="action-button reject-btn">× 拒绝</button>
        `;
      }

      return `
        <div class="list-item ${itemClass}" data-type="${type}" data-id="${data.id}">
          <div class="item-title">${data.title}</div>
          <div class="item-meta">类型：${data.field1} | 奖励：${data.field5}</div>
          ${actions}
        </div>
      `;
    }

    createRefreshButton() {
      const header = document.querySelector('.app-header, .header');
      if (!header) return;
      
      const refreshBtn = document.createElement('button');
      refreshBtn.innerHTML = '🔄 刷新';
      refreshBtn.className = 'yuse-refresh-btn';
      refreshBtn.style.cssText = `
        background: var(--accent-color); color: white; border: none;
        padding: 4px 10px; border-radius: 6px; margin-left: auto;
      `;
      refreshBtn.addEventListener('click', () => this.sendRefreshRequest(this.currentView));
      header.appendChild(refreshBtn);
    }

    sendRefreshRequest(pageKey) {
      const pageConfig = window.YuseTheaterPages[pageKey];
      if (!pageConfig) return;
      
      this.savedData[pageKey] = '<div class="loading">刷新中...</div>';
      this.updateAppContent();
      
      // 直接发送给AI并等待响应（模拟300ms延迟）
      this.sendToSillyTavern(pageConfig.refreshMsg);
      setTimeout(() => this.parseNewData(), 300);
    }

    sendToSillyTavern(message) {
      const textarea = document.querySelector('#send_textarea');
      if (textarea) {
        textarea.value = textarea.value ? `${textarea.value}\n${message}` : message;
        textarea.dispatchEvent(new Event('input'));
        textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      }
    }

    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey] || this.currentView === pageKey) return;
      
      // 切换前保存当前滚动位置（解决返回空屏的关键）
      const contentArea = document.querySelector('.yuse-content-area');
      this.lastScrollY = contentArea ? contentArea.scrollTop : 0;
      
      this.currentView = pageKey;
      this.updateAppContent();
      
      // 切换后恢复滚动位置（避免iOS空白遮罩）
      setTimeout(() => {
        const contentArea = document.querySelector('.yuse-content-area');
        contentArea.scrollTop = this.lastScrollY || 0;
      }, 100);
    }

    updateAppContent() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      const content = `
        <div class="yuse-content-area">
          ${this.savedData[this.currentView]}
        </div>
        <div class="yuse-nav-bar">
          ${this.renderNav()}
        </div>
      `;

      const appElement = document.getElementById('app-content');
      if (!appElement) return;
      
      appElement.innerHTML = content;
      this.bindPageEvents();
    }

    renderNav() {
      return Object.keys(window.YuseTheaterPages).map(key => `
        <button class="yuse-nav-btn ${key === this.currentView ? 'active' : ''}" data-page="${key}">
          ${this.getNavIcon(key)} ${window.YuseTheaterPages[key].name}
        </button>
      `).join('');
    }

    bindPageEvents() {
      document.querySelector('.yuse-content-area').addEventListener('click', (e) => {
        // 导航按钮
        if (e.target.matches('.yuse-nav-btn')) {
          this.switchView(e.target.dataset.page);
          return;
        }

        // 接取/拒绝按钮
        const listItem = e.target.closest('.list-item');
        if (listItem) {
          if (e.target.matches('.accept-btn')) {
            this.handleAccept(listItem.dataset);
          } else if (e.target.matches('.reject-btn')) {
            listItem.style.opacity = '0';
            setTimeout(() => listItem.remove(), 300);
          }
        }
      });
    }

    handleAccept(data) {
      let message = '';
      if (data.type === 'announcement') {
        message = `[通告|${data.title}|${data.field2}|${data.field3}|${data.field4}|${data.field5}]`;
      } else if (data.type === 'customization') {
        message = `[定制|${data.field1}|${data.field2}|${data.field3}|${data.field4}|${data.field6}|${data.field5}]`;
      }
      
      this.sendToSillyTavern(message);
      this.showToast(`已接取 ${data.title}`);
      data.style.opacity = '0';
      setTimeout(() => data.remove(), 300);
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

// 兼容函数（保留用户原有逻辑）
window.getYuseTheaterAppContent = () => window.yuseTheaterApp?.getAppContent() || '';
window.bindYuseTheaterEvents = () => {};
