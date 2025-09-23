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
        announcements: '<div class="loading">初始化加载...</div>',
        customizations: '<div class="loading">初始化加载...</div>',
        theater: '<div class="loading">初始化加载...</div>',
        shop: '<div class="loading">初始化加载...</div>'
      };
      this.isAutoRender = true;
      this.lastRenderTime = 0;
      this.renderCooldown = 300;
      this.init();
    }

    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App');
      this.setupDOMObserver();
      this.setupEventListeners();
      this.updateAppContent();
      this.parseNewData(); // 初始化强制解析
    }

    setupDOMObserver() {
      try {
        const chatContainer = document.querySelector('#chat') || document.querySelector('.mes');
        if (chatContainer) {
          new MutationObserver(() => this.parseNewData()).observe(chatContainer, {
            childList: true,
            subtree: true
          });
        }
      } catch (error) {
        console.warn('[YuseTheater] DOM观察器设置失败:', error);
      }
    }

    setupEventListeners() {
      window.addEventListener('messageUpdate', () => this.parseNewData());
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
          this.savedData = {
            announcements: announcements || '<div class="empty-state">暂无通告</div>',
            customizations: customizations || '<div class="empty-state">暂无定制</div>',
            theater: theater || '<div class="empty-state">暂无剧场</div>',
            theaterHot, theaterNew, theaterRecommended, theaterPaid,
            shop: shop || '<div class="empty-state">暂无商品</div>'
          };
          this.updateAppContent(); // 数据变更立即更新
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据失败:', error);
      }
      this.lastRenderTime = currentTime;
    }

    getChatContent() {
      const chatElement = document.querySelector('#chat') || document.querySelector('.mes');
      return chatElement?.innerText || '';
    }

    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey] || this.currentView === pageKey) return;
      this.currentView = pageKey;
      // 切换时强制显示加载状态，防止空屏
      this.savedData[pageKey] = '<div class="loading">加载中...</div>';
      this.updateAppContent();
      // 延迟解析（模拟数据加载，实际已缓存）
      setTimeout(() => this.updateAppContent(), 50);
    }

    getAppContent() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      const pageData = this.savedData[this.currentView];
      const content = `
        <div class="yuse-content-area">
          ${this.renderPageContent(pageData)}
        </div>
      `;
      const nav = Object.keys(window.YuseTheaterPages).map(key => `
        <button class="yuse-nav-btn ${key === this.currentView ? 'active' : ''}" 
                data-page="${key}" 
                onclick="yuseTheaterApp.switchView('${key}')">
          ${this.getNavIcon(key)} ${window.YuseTheaterPages[key].name}
        </button>
      `).join('');

      return `
        <div class="yuse-theater-app">
          ${content}
          <div class="yuse-nav-bar">${nav}</div>
        </div>
      `;
    }

    renderPageContent(data) {
      return `
        ${this.currentView === 'theater' ? `
          <div class="theater-filters">
            <button class="filter-btn" data-filter="hot">🔥 最热</button>
            <button class="filter-btn" data-filter="new">🆕 最新</button>
            <button class="filter-btn" data-filter="recommended">❤️ 推荐</button>
            <button class="filter-btn" data-filter="paid">💸 高价定制</button>
          </div>
        ` : ''}
        ${data}
      `;
    }

    updateAppContent() {
      const appElement = document.getElementById('app-content');
      if (!appElement) return;

      // 使用文档片段优化DOM更新
      const fragment = document.createDocumentFragment();
      fragment.innerHTML = this.getAppContent();
      
      // 保留滚动位置（关键优化）
      const oldContent = appElement.firstChild;
      const scrollTop = oldContent?.scrollTop || 0;
      
      appElement.replaceChildren(fragment);
      appElement.firstChild.scrollTop = scrollTop;

      // 立即绑定事件（解决点击无响应）
      this.bindPageEvents();
    }

    bindPageEvents() {
      const app = document.getElementById('app-content');
      app?.addEventListener('click', (e) => {
        // 接取按钮事件（直接发送AI，保留用户需求）
        if (e.target.classList.contains('accept-btn')) {
          const item = e.target.closest('.list-item');
          const type = item.dataset.type;
          if (type === 'announcement') {
            this.sendToSillyTavern(`[通告|${item.dataset.title}|${item.dataset.description}|${item.dataset.actor}|${item.dataset.location}|${item.dataset.payment}]`);
          } else if (type === 'customization') {
            this.sendToSillyTavern(`[定制|${item.dataset.typeName}|${item.dataset.request}|${item.dataset.fanId}|${item.dataset.deadline}|${item.dataset.notes}|${item.dataset.payment}]`);
          }
          item.style.opacity = '0';
          setTimeout(() => item.remove(), 300);
          return;
        }

        // 筛选按钮事件
        if (e.target.classList.contains('filter-btn')) {
          const filter = e.target.dataset.filter;
          const theaterList = document.getElementById('theater-list');
          theaterList.innerHTML = this.savedData[`theater_${filter}`] || '<div class="empty-state">暂无数据</div>';
        }
      });
    }

    sendToSillyTavern(message) {
      const textarea = document.querySelector('#send_textarea');
      textarea.value = textarea.value ? `${textarea.value}\n${message}` : message;
      textarea.dispatchEvent(new Event('input'));
      textarea.focus();
    }

    getNavIcon(pageKey) {
      return {
        announcements: '📢',
        customizations: '💖',
        theater: '🎬',
        shop: '🛒'
      }[pageKey];
    }
  }

  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] 终极修复版初始化完成');
}

// 兼容旧版调用
window.getYuseTheaterAppContent = () => window.yuseTheaterApp.getAppContent();
window.bindYuseTheaterEvents = () => {};
