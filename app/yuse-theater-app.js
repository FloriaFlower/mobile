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
      this.renderCooldown = 300;
      this.init();
    }

    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App');
      this.setupDOMObserver();
      this.setupEventListeners();
      this.createRefreshButton();
      this.forceRenderAllPages(); // 初始化时强制渲染所有页面数据
    }

    forceRenderAllPages() {
      // 主动解析一次所有数据，确保切换时有预加载内容
      const chatData = this.getChatContent();
      const fullMatch = chatData.match(window.YuseTheaterRegex.fullMatch);
      if (fullMatch) {
        const [, announcements, customizations, theater, theaterHot, theaterNew, theaterRecommended, theaterPaid, shop] = fullMatch;
        this.savedData = {
          announcements: announcements || '<div class="empty-state">暂无通告</div>',
          customizations: customizations || '<div class="empty-state">暂无定制</div>',
          theater: theater || '<div class="empty-state">暂无剧场</div>',
          shop: shop || '<div class="empty-state">暂无商品</div>',
          theaterHot, theaterNew, theaterRecommended, theaterPaid
        };
      }
      this.updateAppContent();
    }

    setupDOMObserver() {
      try {
        const chatContainer = document.querySelector('#chat') || document.querySelector('.mes');
        if (chatContainer) {
          const observer = new MutationObserver(mutations => {
            if (Date.now() - this.lastRenderTime > this.renderCooldown) {
              this.parseNewData(true); // 强制更新标识
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
      if (header) {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'yuse-refresh-btn';
        refreshBtn.innerHTML = '🔄 刷新';
        refreshBtn.style.cssText = `
          background: var(--accent-color); color: #fff; border: none; border-radius: 6px;
          padding: 4px 10px; font-size: 12px; cursor: pointer; margin-left: auto;
        `;
        refreshBtn.addEventListener('click', () => this.sendRefreshRequest(this.currentView));
        header.appendChild(refreshBtn);
      }
    }

    parseNewData(force = false) {
      const currentTime = Date.now();
      if (!force && currentTime - this.lastRenderTime < this.renderCooldown) return;

      try {
        const chatData = this.getChatContent();
        const fullMatch = chatData.match(window.YuseTheaterRegex.fullMatch);
        if (fullMatch) {
          const [, announcements, customizations, theater, theaterHot, theaterNew, theaterRecommended, theaterPaid, shop] = fullMatch;
          this.savedData = {
            announcements: announcements || this.savedData.announcements,
            customizations: customizations || this.savedData.customizations,
            theater: theater || this.savedData.theater,
            shop: shop || this.savedData.shop,
            theaterHot, theaterNew, theaterRecommended, theaterPaid
          };
          this.updateAppContent(); // 数据更新后立即渲染
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据失败:', error);
      }
      this.lastRenderTime = currentTime;
    }

    getChatContent() {
      try {
        const chatElement = document.querySelector('#chat, .mes');
        return chatElement ? chatElement.innerText : '';
      } catch (error) {
        return '';
      }
    }

    sendRefreshRequest(pageKey) {
      const pageConfig = window.YuseTheaterPages[pageKey];
      if (!pageConfig) return;
      
      // 切换前显示加载状态
      this.savedData[pageKey] = '<div class="loading">刷新中...</div>';
      this.updateAppContent();
      
      const refreshMsg = pageConfig.refreshMsg;
      this.sendToSillyTavern(refreshMsg);
      this.showToast(`正在刷新${pageConfig.name}...`);
    }

    sendToSillyTavern(message) {
      const textarea = document.querySelector('#send_textarea, textarea');
      if (textarea) {
        textarea.value = textarea.value ? `${textarea.value}\n${message}` : message;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
        return true;
      }
      return false;
    }

    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey] || this.currentView === pageKey) return;
      
      // 切换时强制显示已保存的数据（核心修复）
      this.currentView = pageKey;
      this.updateAppContent(); // 立即渲染已保存的数据
      this.scrollToTop(); // 切换页面自动回顶
    }

    getAppContent() {
      const pageData = this.savedData[this.currentView] || '<div class="empty-state">暂无数据</div>';
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
            <div class="theater-filters">
              ${this.renderFilterButtons()}
            </div>
            <div class="yuse-theater-list" id="theater-list">${this.getFilteredTheater()}</div>
          `;
          break;
        case 'shop':
          content = `<div class="yuse-shop-list">${pageData}</div>`;
          break;
      }

      return `
        <div class="yuse-theater-app" style="position: relative; height: 100%; overflow: hidden;">
          <div class="yuse-content-area">${content}</div>
          <div class="yuse-nav-bar" style="position: absolute; bottom: 0; left: 0; width: 100%;">
            ${this.renderNavButtons()}
          </div>
        </div>
      `;
    }

    renderNavButtons() {
      return Object.keys(window.YuseTheaterPages).map(key => `
        <button class="yuse-nav-btn ${this.currentView === key ? 'active' : ''}" 
                data-page="${key}" onclick="window.yuseTheaterApp.switchView('${key}')">
          ${this.getNavIcon(key)} ${window.YuseTheaterPages[key].name}
        </button>
      `).join('');
    }

    renderFilterButtons() {
      return [
        { filter: 'hot', text: '🔥 最热' },
        { filter: 'new', text: '🆕 最新' },
        { filter: 'recommended', text: '❤️ 推荐' },
        { filter: 'paid', text: '💸 高价定制' }
      ].map(({ filter, text }) => `
        <button class="filter-btn" data-filter="${filter}">${text}</button>
      `).join('');
    }

    getFilteredTheater() {
      const filter = this.currentFilter || 'all';
      switch (filter) {
        case 'hot': return this.savedData.theaterHot || '<div class="empty-state">暂无最热剧场</div>';
        case 'new': return this.savedData.theaterNew || '<div class="empty-state">暂无最新剧场</div>';
        case 'recommended': return this.savedData.theaterRecommended || '<div class="empty-state">暂无推荐剧场</div>';
        case 'paid': return this.savedData.theaterPaid || '<div class="empty-state">暂无高价定制</div>';
        default: return this.savedData.theater || '<div class="empty-state">暂无剧场</div>';
      }
    }

    updateAppContent() {
      const appElement = document.getElementById('app-content');
      if (!appElement) return;

      const fragment = document.createDocumentFragment();
      fragment.innerHTML = this.getAppContent();
      
      // 保留滚动位置（优化体验）
      const oldContent = appElement.firstChild;
      const scrollTop = oldContent ? oldContent.scrollTop : 0;
      
      appElement.innerHTML = '';
      appElement.appendChild(fragment);
      
      // 恢复滚动位置（非剧场页）
      if (this.currentView !== 'theater') {
        appElement.firstChild.scrollTop = scrollTop;
      }

      this.bindPageEvents();
    }

    bindPageEvents() {
      const app = document.getElementById('app-content');
      if (!app) return;

      app.addEventListener('click', (e) => {
        // 导航按钮
        if (e.target.matches('.yuse-nav-btn')) {
          this.switchView(e.target.dataset.page);
          return;
        }

        // 筛选按钮
        if (e.target.matches('.filter-btn')) {
          this.currentFilter = e.target.dataset.filter;
          const theaterList = app.querySelector('#theater-list');
          theaterList.innerHTML = '<div class="loading">加载中...</div>';
          setTimeout(() => {
            theaterList.innerHTML = this.getFilteredTheater();
          }, 200);
          return;
        }

        // 接取/拒绝按钮
        if (e.target.matches('.accept-btn, .reject-btn')) {
          const listItem = e.target.closest('.list-item');
          if (listItem) {
            if (e.target.classList.contains('reject-btn')) {
              listItem.style.opacity = '0';
              setTimeout(() => listItem.remove(), 300);
            } else {
              this.handleAcceptButton(listItem);
            }
            e.stopPropagation();
          }
        }

        // 列表项点击
        if (e.target.closest('.list-item')) {
          const item = e.target.closest('.list-item');
          this.showItemDetail(item.dataset);
        }
      });
    }

    handleAcceptButton(listItem) {
      const type = listItem.dataset.type;
      const data = { ...listItem.dataset };
      
      let message = '';
      switch (type) {
        case 'announcement':
          message = `[通告|${data.title}|${data.description}|${data.actor}|${data.location}|${data.payment}]`;
          break;
        case 'customization':
          message = `[定制|${data.typeName}|${data.request}|${data.fanId}|${data.deadline}|${data.notes}|${data.payment}]`;
          break;
      }
      
      this.sendToSillyTavern(message);
      this.showToast(`已接取${type === 'announcement' ? `《${data.title}》` : data.typeName}`);
      listItem.style.opacity = '0';
      setTimeout(() => listItem.remove(), 300);
    }

    showItemDetail(data) {
      let header = '', body = '', footer = '';

      switch (data.type) {
        case 'announcement':
          header = data.title;
          body = `
            <div class="detail-section"><p>${data.description}</p></div>
            <div class="detail-section">
              <p>📍 拍摄地点：${data.location}</p>
              <p>👥 合作演员：${data.actor}</p>
              <p>💵 片酬：${data.payment}</p>
            </div>
          `;
          footer = '<button class="accept-btn" onclick="closeModal()">接取</button>';
          break;
          
        case 'customization':
          header = `${data.fanId} 的${data.typeName}`;
          body = `
            <div class="detail-section"><p>${data.request}</p></div>
            <div class="detail-section">
              <p>⏰ 截止时间：${data.deadline}</p>
              <p>📝 备注：${data.notes}</p>
              <p>💵 报酬：${data.payment}</p>
            </div>
          `;
          footer = '<button class="accept-btn" onclick="closeModal()">接取</button>';
          break;
          
        case 'theater':
          header = data.title;
          body = `
            <div class="cover-image" style="background-image: url('${data.cover}')"></div>
            <div class="detail-section"><p>${data.description}</p></div>
            <div class="detail-section">
              <p>🔥 人气：${data.popularity}</p>
              <p>❤️ 收藏：${data.favorites}</p>
              <p>🎬 播放：${data.views}</p>
              <p>💸 价格：${data.price}</p>
            </div>
            <div class="detail-section">${this.renderComments(data.reviews)}</div>
          `;
          footer = '<button class="accept-btn" onclick="closeModal()">返回</button>';
          break;
          
        case 'shop':
          header = data.name;
          body = `
            <div class="detail-section"><p>${data.description}</p></div>
            <div class="detail-section">
              <p>💰 基础价：${data.price}</p>
              <p>🏆 最高价：${data.highestBid}</p>
            </div>
            <div class="detail-section">${this.renderComments(data.comments)}</div>
          `;
          footer = '<button class="accept-btn" onclick="closeModal()">返回</button>';
          break;
      }

      const modal = document.createElement('div');
      modal.className = 'yuse-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            ${header}
            <button class="close-btn" onclick="closeModal()">×</button>
          </div>
          <div class="modal-body">${body}</div>
          <div class="modal-footer">${footer}</div>
        </div>
      `;
      document.body.appendChild(modal);
      
      window.closeModal = () => {
        modal.remove();
        document.body.style.overflow = 'auto';
      };
      document.body.style.overflow = 'hidden';
    }

    renderComments(commentsStr) {
      try {
        return JSON.parse(commentsStr.replace(/'/g, '"')).map(comm => `
          <div class="comment">
            <span class="comment-user">${comm.user}:</span> ${comm.text}
          </div>
        `).join('');
      } catch {
        return '<div class="comment">评论加载失败</div>';
      }
    }

    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'yuse-toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    scrollToTop() {
      const contentArea = document.querySelector('.yuse-content-area');
      contentArea.scrollTop = 0;
    }
  }

  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();

  // 兼容函数
  window.getYuseTheaterAppContent = () => window.yuseTheaterApp.getAppContent();
  window.bindYuseTheaterEvents = () => window.yuseTheaterApp.bindPageEvents();
}
