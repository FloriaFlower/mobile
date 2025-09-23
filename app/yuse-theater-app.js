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
        shop: '<div class="loading">加载中...</div>',
        theaterHot: '<div class="loading">加载中...</div>',
        theaterNew: '<div class="loading">加载中...</div>',
        theaterRecommended: '<div class="loading">加载中...</div>',
        theaterPaid: '<div class="loading">加载中...</div>'
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
      this.createRefreshButton(); // 新增：创建刷新按钮
      this.parseNewData(); // 初始化时强制解析一次数据
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
      window.addEventListener('messageUpdate', () => this.parseNewData());
    }

    // 新增：创建顶部刷新按钮
    createRefreshButton() {
      const header = document.querySelector('.app-header') || document.querySelector('.header');
      if (!header) return;
      const refreshBtn = document.createElement('button');
      refreshBtn.id = 'yuse-global-refresh';
      refreshBtn.style.cssText = `
        background: var(--accent-color); color: #fff; border: none; border-radius: 6px;
        padding: 4px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px;
        margin-left: auto;
      `;
      refreshBtn.innerHTML = '🔄 刷新';
      refreshBtn.addEventListener('click', () => this.parseNewData());
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
          this.updateAppContent(); // 数据变更时强制更新
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据失败:', error);
      }
      this.lastRenderTime = currentTime;
    }

    parseList(data, type) {
      if (!data) return '<div class="empty-state">暂无数据</div>';
      const regex = window.YuseTheaterRegex[type === 'theater' ? 'theater' : type];
      return data.replace(regex, (_, ...groups) => this.renderListItem(type, groups));
    }

    renderListItem(type, groups) {
      const [id, title, ...rest] = groups;
      const dataAttrs = { id, type: type };
      switch (type) {
        case 'announcement':
          return `<div class="list-item" data-type="announcement" data-title="${title}" data-description="${rest[0]}" data-actor="${rest[1]}" data-location="${rest[2]}" data-payment="${rest[3]}">
            <div class="item-title">${title}</div>
            <div class="item-meta">片酬：${rest[3]} | 地点：${rest[2]}</div>
          </div>`;
        case 'customization':
          return `<div class="list-item" data-type="customization" data-title="${title}" data-typeName="${rest[0]}" data-request="${rest[1]}" data-fanId="${rest[2]}" data-deadline="${rest[3]}" data-notes="${rest[4]}" data-payment="${rest[5]}">
            <div class="item-title">${title}</div>
            <div class="item-meta">报酬：${rest[5]} | 截止：${rest[3]}</div>
            <div class="item-actions"><button class="accept-btn">接取</button></div>
          </div>`;
        case 'theater':
          return `<div class="list-item" data-type="theater" data-title="${title}" data-cover="${rest[0]}" data-description="${rest[1]}" data-popularity="${rest[2]}" data-favorites="${rest[3]}" data-views="${rest[4]}" data-price="${rest[5]}" data-reviews="${rest[6]}">
            <div class="item-title">${title}</div>
            <div class="item-meta">播放：${rest[4]} | 收藏：${rest[3]}</div>
          </div>`;
        case 'shop':
          return `<div class="list-item" data-type="shop" data-title="${title}" data-description="${rest[0]}" data-price="${rest[1]}" data-highestBid="${rest[2]}" data-comments="${rest[3]}">
            <div class="item-title">${title}</div>
            <div class="item-meta">价格：${rest[1]} | 竞价：${rest[2]}</div>
          </div>`;
        default:
          return '';
      }
    }

    // 确保读取对话开场白的所有内容
    getChatContent() {
      const chatElement = document.querySelector('#chat') || document.querySelector('.mes');
      return chatElement?.innerText || '';
    }

    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey] || this.currentView === pageKey) return;
      this.currentView = pageKey;
      this.updateAppContent(); // 切换时立即更新视图
    }

    getAppContent() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      const pageData = this.savedData[this.currentView] || '<div class="empty-state">暂无数据</div>';
      const content = this.renderPageContent(pageData);
      const nav = this.renderNavBar();
      
      return `
        <div class="yuse-theater-app" style="position: relative; height: 100%; overflow: hidden;">
          ${content}
          ${nav}
        </div>
      `;
    }

    renderPageContent(pageData) {
      switch (this.currentView) {
        case 'theater':
          return `
            <div class="yuse-content-area">
              <div class="theater-filters">
                <button class="filter-btn" data-filter="hot">🔥 最热</button>
                <button class="filter-btn" data-filter="new">🆕 最新</button>
                <button class="filter-btn" data-filter="recommended">❤️ 推荐</button>
                <button class="filter-btn" data-filter="paid">💸 高价定制</button>
              </div>
              <div class="yuse-theater-list" id="theater-list">${pageData}</div>
            </div>
          `;
        default:
          return `<div class="yuse-content-area">${pageData}</div>`;
      }
    }

    renderNavBar() {
      return `
        <div class="yuse-nav-bar" style="position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; border-top: 1px solid #f0f0f0; padding: 10px 0;">
          ${Object.entries(window.YuseTheaterPages).map(([key, cfg]) => `
            <button class="yuse-nav-btn ${key === this.currentView ? 'active' : ''}" data-page="${key}" onclick="yuseTheaterApp.switchView('${key}')">
              ${this.getNavIcon(key)} ${cfg.name}
            </button>
          `).join('')}
        </div>
      `;
    }

    getNavIcon(pageKey) {
      return {
        announcements: '📢',
        customizations: '💖',
        theater: '🎬',
        shop: '🛒'
      }[pageKey];
    }

    updateAppContent() {
      const appElement = document.getElementById('app-content');
      if (!appElement) return;
      
      appElement.innerHTML = this.getAppContent();
      this.bindPageEvents();
      this.scrollToTop();
    }

    bindPageEvents() {
      const app = document.querySelector('.yuse-theater-app');
      app.addEventListener('click', (e) => {
        // 导航按钮
        if (e.target.matches('.yuse-nav-btn')) {
          this.switchView(e.target.dataset.page);
          return;
        }
        // 接取按钮
        if (e.target.matches('.accept-btn')) {
          const item = e.target.closest('.list-item');
          this.handleAccept(item);
        }
        // 列表项点击
        if (e.target.matches('.list-item')) {
          const item = e.target.closest('.list-item');
          this.showItemModal(item);
        }
        // 筛选按钮
        if (e.target.matches('.filter-btn') && this.currentView === 'theater') {
          this.handleFilter(e.target.dataset.filter);
        }
      });
    }

    handleAccept(item) {
      const type = item.dataset.type;
      const data = {
        announcement: () => `[通告|${item.dataset.title}|${item.dataset.description}|${item.dataset.actor}|${item.dataset.location}|${item.dataset.payment}]`,
        customization: () => `[定制|${item.dataset.typeName}|${item.dataset.request}|${item.dataset.fanId}|${item.dataset.deadline}|${item.dataset.notes}|${item.dataset.payment}]`
      }[type]();
      
      this.sendToSillyTavern(data);
      item.style.opacity = '0';
      setTimeout(() => item.remove(), 300);
    }

    showItemModal(item) {
      const type = item.dataset.type;
      const modal = document.createElement('div');
      modal.className = 'yuse-modal';
      modal.innerHTML = this.getModalContent(type, item.dataset);
      document.body.appendChild(modal);
      
      modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    }

    getModalContent(type, data) {
      switch (type) {
        case 'announcement':
          return `
            <div class="modal-content">
              <div class="modal-header">${data.title} <button class="close-btn">×</button></div>
              <div class="modal-body">
                <p>剧情：${data.description}</p>
                <p>地点：${data.location}</p>
                <p>演员：${data.actor}</p>
                <p>片酬：${data.payment}</p>
              </div>
              <div class="modal-footer"><button class="accept-btn" onclick="yuseTheaterApp.handleAccept(this.closest('.list-item'))">接取</button></div>
            </div>
          `;
        case 'customization':
          return `
            <div class="modal-content">
              <div class="modal-header">${data.fanId} 的定制 <button class="close-btn">×</button></div>
              <div class="modal-body">
                <p>类型：${data.typeName}</p>
                <p>要求：${data.request}</p>
                <p>截止：${data.deadline}</p>
                <p>报酬：${data.payment}</p>
                <p>备注：${data.notes}</p>
              </div>
              <div class="modal-footer"><button class="accept-btn">接取</button></div>
            </div>
          `;
        case 'theater':
          const renderReviews = (reviewsStr) => {
            try {
              const reviews = JSON.parse(reviewsStr.replace(/'/g, '"'));
              return reviews.map(rev => `<div class="comment"><span class="comment-user">${rev.user}:</span> ${rev.text}</div>`).join('');
            } catch (e) {
              return '<div class="comment">评论加载失败</div>';
            }
          };
          return `
            <div class="modal-content">
              <div class="modal-header">${data.title} <button class="close-btn">×</button></div>
              <div class="modal-body">
                <div class="cover-image" style="background-image: url('${data.cover || 'https://picsum.photos/400/200?random=1'}')"></div>
                <p>简介：${data.description}</p>
                <p>人气：${data.popularity}</p>
                <p>收藏：${data.favorites}</p>
                <p>播放：${data.views}</p>
                <p>价格：${data.price}</p>
                <h4>粉丝热评</h4>
                ${renderReviews(data.reviews)}
              </div>
              <div class="modal-footer"><button class="action-button" onclick="document.querySelector('.yuse-modal').remove()">返回</button></div>
            </div>
          `;
        case 'shop':
          const renderComments = (commentsStr) => {
            try {
              const comments = JSON.parse(commentsStr.replace(/'/g, '"'));
              return comments.map(comm => `<div class="comment"><span class="comment-user">${comm.user}:</span> ${comm.text}</div>`).join('');
            } catch (e) {
              return '<div class="comment">评论加载失败</div>';
            }
          };
          return `
            <div class="modal-content">
              <div class="modal-header">${data.title} <button class="close-btn">×</button></div>
              <div class="modal-body">
                <p>卖点：${data.description}</p>
                <p>基础价格：${data.price}</p>
                <p>当前最高价：${data.highestBid}</p>
                <h4>评论区</h4>
                ${renderComments(data.comments)}
              </div>
              <div class="modal-footer"><button class="action-button" onclick="document.querySelector('.yuse-modal').remove()">返回</button></div>
            </div>
          `;
        default:
          return '<div class="modal-content">暂无详情</div>';
      }
    }

    handleFilter(filter) {
      const theaterList = document.getElementById('theater-list');
      theaterList.innerHTML = '<div class="loading">加载中...</div>';
      setTimeout(() => {
        theaterList.innerHTML = this.savedData[`theater_${filter}`] || '<div class="empty-state">暂无数据</div>';
      }, 200);
    }

    sendToSillyTavern(message) {
      const textarea = document.querySelector('#send_textarea');
      if (textarea) {
        textarea.value += `\n${message}`;
        textarea.dispatchEvent(new Event('input'));
        textarea.scrollTop = textarea.scrollHeight;
      }
    }

    scrollToTop() {
      const contentArea = document.querySelector('.yuse-content-area');
      contentArea.scrollTop = 0;
    }
  }

  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] 最终修复版初始化完成');
}

// 恢复全局函数，确保手机模拟器插件兼容
window.getYuseTheaterAppContent = function () {
  if (window.yuseTheaterApp) {
    return window.yuseTheaterApp.getAppContent();
  }
  return '<div class="error-state">欲色剧场 app 实例未初始化</div>';
};

window.bindYuseTheaterEvents = function () {
  if (window.yuseTheaterApp) {
    window.yuseTheaterApp.bindPageEvents();
  }
};

window.refreshYuseTheaterPage = function (pageKey) {
  if (window.yuseTheaterApp) {
    window.yuseTheaterApp.parseNewData();
  }
};

console.log('[YuseTheater] 全局函数已恢复，兼容手机模拟器插件');
