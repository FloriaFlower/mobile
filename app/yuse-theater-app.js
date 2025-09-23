if (typeof window.YuseTheaterApp === 'undefined') {
  window.YuseTheaterRegex = {
    // 1. 保留fullMatch：精准定位<yuse_data>区域（核心！）
    fullMatch: /<yuse_data>([\s\S]*?)<\/yuse_data>/s,
    // 2. 无需再用正则拆HTML，改用DOM解析
    pageSelectors: {
      announcements: '.list-item[data-type="announcement"]',
      customizations: '.list-item[data-type="customization"]',
      theater: '.list-item[data-type="theater"]',
      theaterHot: '.list-item[data-type="theater"]', // 筛选栏对应数据
      theaterNew: '.list-item[data-type="theater"]',
      theaterRecommended: '.list-item[data-type="theater"]',
      theaterPaid: '.list-item[data-type="theater"]',
      shop: '.list-item[data-type="shop"]'
    }
  };

  window.YuseTheaterPages = {
    announcements: { name: "通告拍摄", apiKeyword: "announcements", refreshMsg: "[刷新通告拍摄|请求新通告列表]" },
    customizations: { name: "粉丝定制", apiKeyword: "customizations", refreshMsg: "[刷新粉丝定制|请求新定制列表]" },
    theater: { name: "剧场列表", apiKeyword: "theater", refreshMsg: "[刷新剧场列表|请求新剧场内容]" },
    shop: { name: "欲色商城", apiKeyword: "shop", refreshMsg: "[刷新欲色商城|请求新商品列表]" }
  };

  class YuseTheaterApp {
    constructor() {
      this.currentView = 'announcements';
      this.savedData = {
        announcements: '<div class="loading">加载中...</div>',
        customizations: '<div class="loading">加载中...</div>',
        theater: '<div class="loading">加载中...</div>',
        theaterHot: '<div class="loading">加载中...</div>',
        theaterNew: '<div class="loading">加载中...</div>',
        theaterRecommended: '<div class="loading">加载中...</div>',
        theaterPaid: '<div class="loading">加载中...</div>',
        shop: '<div class="loading">加载中...</div>'
      };
      this.renderCooldown = 300;
      this.lastRenderTime = 0;
      this.init();
    }

    init() {
      console.log('[YuseTheater] 初始化');
      this.setupDOMObserver();
      this.createRefreshButton();
      this.parseNewData(); // 初始化强制解析
    }

    // 保留：创建顶部刷新按钮
    createRefreshButton() {
      const header = document.querySelector('.app-header') || document.querySelector('.header');
      if (!header) return;
      const refreshBtn = document.createElement('button');
      refreshBtn.id = 'yuse-global-refresh';
      refreshBtn.style.cssText = `background: var(--accent-color); color: #fff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; margin-left: auto;`;
      refreshBtn.innerHTML = '🔄 刷新';
      refreshBtn.addEventListener('click', () => this.parseNewData());
      header.appendChild(refreshBtn);
    }

    // 核心修复：用fullMatch+DOM解析HTML数据
    parseNewData() {
      if (Date.now() - this.lastRenderTime < this.renderCooldown) return;
      try {
        const chatData = this.getChatContent();
        // 1. 第一步：用fullMatch提取<yuse_data>内的所有HTML（关键！）
        const fullMatchResult = chatData.match(window.YuseTheaterRegex.fullMatch);
        if (!fullMatchResult) {
          console.warn('[YuseTheater] 未找到<yuse_data>标签');
          this.lastRenderTime = Date.now();
          return;
        }
        const yuseHtml = fullMatchResult[1]; // 拿到<yuse_data>内的完整HTML

        // 2. 第二步：用DOMParser解析HTML（正确处理嵌套结构）
        const parser = new DOMParser();
        const doc = parser.parseFromString(yuseHtml, 'text/html');

        // 3. 第三步：按页面类型提取对应DOM元素，生成渲染内容
        this.savedData.announcements = this.renderPageItems(doc, 'announcements');
        this.savedData.customizations = this.renderPageItems(doc, 'customizations');
        this.savedData.theater = this.renderPageItems(doc, 'theater');
        this.savedData.shop = this.renderPageItems(doc, 'shop');

        // 剧场筛选栏数据（从HTML中提取对应分类，此处示例用默认剧场数据，可按实际HTML结构调整）
        this.savedData.theaterHot = this.savedData.theater;
        this.savedData.theaterNew = this.savedData.theater;
        this.savedData.theaterRecommended = this.savedData.theater;
        this.savedData.theaterPaid = this.savedData.theater;

        this.updateAppContent(); // 解析成功后更新页面
      } catch (error) {
        console.error('[YuseTheater] 解析失败:', error);
      }
      this.lastRenderTime = Date.now();
    }

    // 辅助：从DOM中提取指定页面的列表项，生成渲染HTML
    renderPageItems(doc, pageKey) {
      const selector = window.YuseTheaterRegex.pageSelectors[pageKey];
      const items = doc.querySelectorAll(selector);
      if (items.length === 0) return '<div class="empty-state">暂无数据</div>';

      let html = '';
      items.forEach(item => {
        // 直接从DOM元素获取data-*属性（精准无错）
        const data = {
          type: item.dataset.type,
          title: item.dataset.title || '',
          description: item.dataset.description || '',
          actor: item.dataset.actor || '',
          location: item.dataset.location || '',
          payment: item.dataset.payment || '',
          fanId: item.dataset.fanId || '',
          typeName: item.dataset.typeName || '',
          request: item.dataset.request || '',
          deadline: item.dataset.deadline || '',
          notes: item.dataset.notes || '',
          cover: item.dataset.cover || '',
          popularity: item.dataset.popularity || '',
          favorites: item.dataset.favorites || '',
          views: item.dataset.views || '',
          price: item.dataset.price || '',
          highestBid: item.dataset.highestBid || ''
        };

        // 按类型生成列表项HTML（与你的样板数据结构匹配）
        switch (data.type) {
          case 'announcement':
            html += `
              <div class="list-item" data-type="announcement" data-title="${data.title}" data-description="${data.description}" data-actor="${data.actor}" data-location="${data.location}" data-payment="${data.payment}">
                <div class="item-title">${data.title}</div>
                <div class="item-meta"><span>📍 ${data.location}</span><span>🎬 ${data.actor}</span><span class="item-price">💰 ${data.payment}</span></div>
              </div>
            `;
            break;
          case 'customization':
            html += `
              <div class="list-item" data-type="customization" data-fanId="${data.fanId}" data-typeName="${data.typeName}" data-request="${data.request}" data-deadline="${data.deadline}" data-notes="${data.notes}" data-payment="${data.payment}">
                <div class="item-title">${data.fanId} 的 ${data.typeName} 定制</div>
                <div class="item-meta"><span>⏰ ${data.deadline}</span><span class="item-price">💰 ${data.payment}</span></div>
                <div class="item-actions"><button class="action-button accept-btn">接取</button></div>
              </div>
            `;
            break;
          case 'theater':
            html += `
              <div class="list-item" data-type="theater" data-title="${data.title}" data-cover="${data.cover}" data-description="${data.description}" data-popularity="${data.popularity}" data-favorites="${data.favorites}" data-views="${data.views}" data-price="${data.price}">
                <div class="item-title">${data.title}</div>
                <div class="item-meta"><span>❤️ ${data.popularity}</span><span>⭐ ${data.favorites}</span><span>▶️ ${data.views}</span><span class="item-price">💰 ${data.price}</span></div>
              </div>
            `;
            break;
          case 'shop':
            html += `
              <div class="list-item" data-type="shop" data-name="${data.title}" data-description="${data.description}" data-price="${data.price}" data-highestBid="${data.highestBid}">
                <div class="item-title">${data.title}</div>
                <div class="item-meta"><span class="item-price">💰 ${data.price}</span><span>当前最高价：${data.highestBid}</span></div>
              </div>
            `;
            break;
        }
      });
      return html;
    }

    // 保留：获取对话内容（包含开场白）
    getChatContent() {
      const chatElement = document.querySelector('#chat') || document.querySelector('.mes');
      return chatElement?.innerText || '';
    }

    // 以下方法（switchView、getAppContent、updateAppContent等）保持不变，省略重复代码...
    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey] || this.currentView === pageKey) return;
      this.currentView = pageKey;
      this.updateAppContent();
    }

    getAppContent() {
      const page = window.YuseTheaterPages[this.currentView];
      const data = this.savedData[this.currentView];
      let content = '';
      if (this.currentView === 'theater') {
        content = `
          <div class="theater-filters">
            <button class="filter-btn" data-filter="hot">🔥 最热</button>
            <button class="filter-btn" data-filter="new">🆕 最新</button>
            <button class="filter-btn" data-filter="recommended">❤️ 推荐</button>
            <button class="filter-btn" data-filter="paid">💸 高价定制</button>
          </div>
          <div class="yuse-theater-list" id="theater-list">${data}</div>
        `;
      } else {
        content = `<div class="${page.apiKeyword}-list">${data}</div>`;
      }
      return `
        <div class="yuse-theater-app" style="position: relative; height: 100%; overflow: hidden;">
          <div class="yuse-content-area">${content}</div>
          <div class="yuse-nav-bar" style="position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; border-top: 1px solid #f0f0f0; padding: 10px 0;">
            ${Object.entries(window.YuseTheaterPages).map(([k, v]) => `
              <button class="yuse-nav-btn ${k === this.currentView ? 'active' : ''}" onclick="yuseTheaterApp.switchView('${k}')">
                ${this.getNavIcon(k)} ${v.name}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    getNavIcon(pageKey) {
      return { announcements: '📢', customizations: '💖', theater: '🎬', shop: '🛒' }[pageKey];
    }

    updateAppContent() {
      const appEl = document.getElementById('app-content');
      if (appEl) {
        appEl.innerHTML = this.getAppContent();
        this.bindPageEvents();
      }
    }

    bindPageEvents() {
      // 事件绑定逻辑保持不变，省略重复代码...
    }

    // 其他方法（handleAccept、showItemModal等）保持不变，省略重复代码...
  }

  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
}

// 保留全局函数（兼容手机插件）
window.getYuseTheaterAppContent = () => window.yuseTheaterApp?.getAppContent() || '<div class="error-state">未初始化</div>';
window.bindYuseTheaterEvents = () => window.yuseTheaterApp?.bindPageEvents();
window.refreshYuseTheaterPage = (pageKey) => window.yuseTheaterApp?.parseNewData();
