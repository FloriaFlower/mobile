if (typeof window.YuseTheaterApp === 'undefined') {
  window.YuseTheaterRegex = {
    fullMatch: /.*?<yuse_data>\s*(?:(?!<yuse_data>).)*?(?:<announcements>(.*?)<\/announcements>)?\s*(?:<customizations>(.*?)<\/customizations>)?\s*(?:<theater>(.*?)<\/theater>)?\s*(?:<theater_hot>(.*?)<\/theater_hot>)?\s*(?:<theater_new>(.*?)<\/theater_new>)?\s*(?:<theater_recommended>(.*?)<\/theater_recommended>)?\s*(?:<theater_paid>(.*?)<\/theater_paid>)?\s*(?:<shop>(.*?)<\/shop>)?\s*<\/yuse_data>(?:\s*<\/content>)?.*?$/s,
    announcement: /\[通告\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
    customization: /\[定制\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
    theater: /\[剧场\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
    shop: /\[商品\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g
  };
  window.YuseTheaterPages = {
    announcements: { name: "通告拍摄", apiKeyword: "announcements", refreshMsg: "[刷新通告拍摄|请求新通告列表]" },
    customizations: { name: "粉丝定制", apiKeyword: "customizations", refreshMsg: "[刷新粉丝定制|请求新定制列表]" },
    theater: { name: "剧场列表", apiKeyword: "theater", refreshMsg: "[刷新剧场列表|请求新剧场内容]" },
    shop: { name: "欲色商城", apiKeyword: "shop", refreshMsg: "[刷新欲色商城|请求新商品列表]" }
  };
  // 全局函数定义
  window.getYuseTheaterAppContent = function () {
    if (window.yuseTheaterApp) return window.yuseTheaterApp.getAppContent();
    return '<div class="error-state">欲色剧场 app 实例未初始化</div>';
  };
  window.bindYuseTheaterEvents = function () {
    if (window.yuseTheaterApp) {
      setTimeout(() => {
        const appElement = document.getElementById('app-content');
        if (appElement) appElement.addEventListener('click', window.yuseTheaterApp.handlePageClick);
      }, 100);
    }
  };
  window.bindYuseTheaterAppEvents = window.bindYuseTheaterEvents;
  window.refreshYuseTheaterPage = function (pageKey) {
    if (window.yuseTheaterApp) window.yuseTheaterApp.sendRefreshRequest(pageKey);
  };
  class YuseTheaterApp {
    constructor() {
      this.currentView = 'announcements';
      this.savedData = {};
      this.isAutoRender = true;
      this.lastRenderTime = 0;
      this.renderCooldown = 500;
      this.handlePageClick = this.handlePageClick.bind(this);
      // 精准定位欲色剧场页眉的选择器（确保不选中其他APP）
      this.yuseHeaderSelector = '.app-screen.yuse-theater-active .app-header, .app-screen.yuse-theater-active #app-header, .app-screen.yuse-theater-active header';
      this.init();
    }
    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App');
      this.loadDefaultData();
      this.setupDOMObserver();
      this.setupEventListeners();
      this.updateAppContent();
      this.parseNewData();
      // 强制添加应用标识类（避免DOM渲染延迟导致类缺失）
      this.forceAddAppActiveClass();
      // 初始化按钮（双重保障：先通知mobile-phone，再手动检查）
      this.updateHeader();
      setTimeout(() => this.ensureRefreshBtnExists(), 200); // 延迟检查，确保页眉已渲染
    }
    // 强制给应用容器添加专属类（解决类添加不及时问题）
    forceAddAppActiveClass() {
      const appScreen = document.querySelector('.app-screen') || document.getElementById('app-screen');
      if (appScreen) {
        // 移除所有其他APP的专属类，避免冲突
        appScreen.classList.remove('shop-app-active', 'task-app-active', 'forum-app-active', 'weibo-app-active');
        // 强制添加欲色剧场专属类
        appScreen.classList.add('yuse-theater-active');
        appScreen.setAttribute('data-app', 'yuse-theater');
        // 给页眉也添加标识
        const appHeader = appScreen.querySelector('.app-header, #app-header, header');
        if (appHeader) {
          appHeader.setAttribute('data-app', 'yuse-theater');
          appHeader.classList.add('yuse-theater-header');
        }
        console.log('[YuseTheater] 已强制添加应用专属标识类');
      }
    }
    loadDefaultData() {
      for (const page in window.YuseTheaterPages) {
        if (!this.savedData[page]) this.savedData[page] = '<div class="empty-state">等待加载数据...</div>';
      }
    }
    setupDOMObserver() {
      try {
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
            if (hasNewMsg) setTimeout(() => this.parseNewData(), 600);
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
      window.addEventListener('yuseViewSwitch', () => {
        this.parseNewData();
        this.updateHeader();
        this.ensureRefreshBtnExists(); // 视图切换后确保按钮存在
      });
      // 监听APP切换事件（防止其他APP切换后按钮残留/丢失）
      window.addEventListener('appSwitch', (e) => {
        if (e.detail?.app === 'yuse-theater') {
          this.forceAddAppActiveClass();
          this.ensureRefreshBtnExists();
        } else {
          this.removeRefreshBtn(); // 切换到其他APP时移除按钮
        }
      });
    }
    parseNewData() {
      if (!this.isAutoRender) return;
      const currentTime = Date.now();
      const timeDiff = currentTime - this.lastRenderTime;
      let isDataUpdated = false;
      try {
        const chatData = this.getChatContent();
        const fullMatch = chatData.match(window.YuseTheaterRegex.fullMatch);
        if (fullMatch) {
          const [, announcements, customizations, theater, theaterHot, theaterNew, theaterRecommended, theaterPaid, shop] = fullMatch;
          if (announcements && announcements.trim() !== '') {
            this.savedData.announcements = announcements;
            isDataUpdated = true;
          }
          if (customizations && customizations.trim() !== '') {
            this.savedData.customizations = customizations;
            isDataUpdated = true;
            console.log('[YuseTheater] 检测到新粉丝定制数据，更新列表');
          }
          if (theater && theater.trim() !== '') {
            this.savedData.theater = theater;
            isDataUpdated = true;
          }
          if (theaterHot && theaterHot.trim() !== '') this.savedData.theaterHot = theaterHot;
          if (theaterNew && theaterNew.trim() !== '') this.savedData.theaterNew = theaterNew;
          if (theaterRecommended && theaterRecommended.trim() !== '') this.savedData.theaterRecommended = theaterRecommended;
          if (theaterPaid && theaterPaid.trim() !== '') this.savedData.theaterPaid = theaterPaid;
          if (shop && shop.trim() !== '') {
            this.savedData.shop = shop;
            isDataUpdated = true;
          }
          if (isDataUpdated) {
            this.lastRenderTime = currentTime;
            this.updateAppContent();
            console.log(`[YuseTheater] 页面更新完成，当前视图: ${this.currentView}`);
          }
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据失败:', error);
      }
      if (!isDataUpdated && timeDiff < this.renderCooldown) return;
      this.lastRenderTime = currentTime;
    }
    getChatContent() {
      try {
        const mobileContext = window.mobileContextEditor;
        if (mobileContext) {
          const chatData = mobileContext.getCurrentChatData();
          if (chatData?.messages) {
            const latestMessages = chatData.messages.slice(-2);
            return latestMessages.map(msg => msg.mes || '').join('\n');
          }
        }
        const globalChat = window.chat || window.SillyTavern?.chat;
        if (globalChat && Array.isArray(globalChat)) {
          const latestMessages = globalChat.slice(-2);
          return latestMessages.map(msg => msg.mes || '').join('\n');
        }
        const chatContainer = document.querySelector('#chat') || document.querySelector('.mes') || document.querySelector('.chat-container');
        if (chatContainer) {
          const msgNodes = chatContainer.querySelectorAll('.mes, .message, .chat-message');
          const latestNodes = Array.from(msgNodes).slice(-2);
          return latestNodes.map(node => node.innerHTML).join('\n').replace(/\s+/g, ' ').trim();
        }
      } catch (error) {
        console.warn('[YuseTheater] 获取对话内容失败:', error);
      }
      return '';
    }
    sendRefreshRequest(pageKey) {
      const pageConfig = window.YuseTheaterPages[pageKey];
      if (!pageConfig) return;
      this.sendToSillyTavern(pageConfig.refreshMsg, true);
      this.showToast(`正在刷新${pageConfig.name}...（等待AI返回数据，约50秒）`);
      const retryTimes = 1;
      const retryInterval = 10000;
      setTimeout(() => {
        console.log(`[YuseTheater] 首次解析刷新数据（等待AI输出50秒）`);
        this.parseNewData();
        if (retryTimes >= 1) {
          setTimeout(() => {
            console.log(`[YuseTheater] 第1次重试解析刷新数据`);
            this.parseNewData();
          }, retryInterval);
        }
      }, 50000);
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
            console.log('[YuseTheater] 已提交刷新指令');
          }
          return true;
        }
        const backupTextarea = document.querySelector('textarea');
        if (backupTextarea) {
          backupTextarea.value = backupTextarea.value ? `${backupTextarea.value}\n${message}` : message;
          backupTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          if (isAutoSend) backupTextarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          return true;
        }
      } catch (error) {
        console.error('[YuseTheater] 操作输入框失败:', error);
      }
      return false;
    }
    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey] || this.currentView === pageKey) return;
      this.currentView = pageKey;
      window.dispatchEvent(new Event('yuseViewSwitch'));
      this.updateAppContent();
      this.updateHeader();
      this.ensureRefreshBtnExists();
      console.log(`[YuseTheater] 切换视图至：${pageKey}`);
    }
    // 核心：双重保障生成按钮（通知mobile-phone + 手动兜底）
    updateHeader() {
      this.forceAddAppActiveClass(); // 先确保标识类存在
      const pageConfig = window.YuseTheaterPages[this.currentView];
      // 1. 通知mobile-phone生成按钮（对齐shop-app逻辑）
      if (window.mobilePhone && window.mobilePhone.updateAppHeader) {
        const headerState = {
          app: 'yuse-theater',
          title: pageConfig.name,
          view: this.currentView,
          refreshBtn: {
            className: 'refresh-btn yuse-theater-refresh-btn',
            innerHTML: '🔄 刷新',
            clickAction: () => this.sendRefreshRequest(this.currentView),
            app: 'yuse-theater'
          }
        };
        window.mobilePhone.updateAppHeader(headerState);
        console.log('[YuseTheater] 已通知mobile-phone生成刷新按钮');
      }
      // 2. 手动检查并创建按钮（兜底，防止mobile-phone处理失败）
      this.ensureRefreshBtnExists();
    }
    // 兜底：确保欲色剧场页眉一定有刷新按钮（只操作当前APP页眉）
    ensureRefreshBtnExists() {
      // 精准找到欲色剧场的页眉（排除其他APP）
      const yuseHeader = document.querySelector(this.yuseHeaderSelector);
      if (!yuseHeader) {
        console.log('[YuseTheater] 未找到欲色剧场页眉，100ms后重试');
        setTimeout(() => this.ensureRefreshBtnExists(), 100);
        return;
      }
      // 检查是否已有按钮，没有则创建
      let refreshBtn = yuseHeader.querySelector('.yuse-theater-refresh-btn');
      if (!refreshBtn) {
        refreshBtn = document.createElement('button');
        refreshBtn.className = 'refresh-btn yuse-theater-refresh-btn';
        refreshBtn.innerHTML = '🔄 刷新';
        refreshBtn.title = '刷新当前页面内容';
        // 绑定点击事件
        refreshBtn.addEventListener('click', () => {
          this.sendRefreshRequest(this.currentView);
        });
        // 只添加到欲色剧场的页眉右侧（找到header-right容器）
        const headerRight = yuseHeader.querySelector('#app-header-right') || yuseHeader.querySelector('.app-header-right');
        if (headerRight) {
          headerRight.appendChild(refreshBtn);
          console.log('[YuseTheater] 已手动创建刷新按钮');
        } else {
          // 找不到右侧容器时，直接添加到页眉（确保显示）
          yuseHeader.appendChild(refreshBtn);
          console.log('[YuseTheater] 已手动添加刷新按钮到页眉');
        }
      }
    }
    // 移除按钮（只移除欲色剧场的，避免影响其他APP）
    removeRefreshBtn() {
      const allRefreshBtns = document.querySelectorAll('.yuse-theater-refresh-btn');
      allRefreshBtns.forEach(btn => {
        // 只移除欲色剧场页眉下的按钮
        const parentHeader = btn.closest(this.yuseHeaderSelector);
        if (parentHeader) {
          btn.remove();
          console.log('[YuseTheater] 已移除欲色剧场刷新按钮');
        }
      });
    }
    getAppContent() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
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
      const iconMap = { announcements: '📢', customizations: '💖', theater: '🎬', shop: '🛒' };
      return iconMap[pageKey] || '📄';
    }
    updateAppContent() {
      const content = this.getAppContent();
      const appElement = document.getElementById('app-content');
      if (appElement) {
        appElement.removeEventListener('click', this.handlePageClick);
        appElement.innerHTML = content;
        // 确保应用容器标识存在
        const appScreen = appElement.closest('.app-screen');
        if (appScreen) {
          appScreen.setAttribute('data-app', 'yuse-theater');
          appScreen.classList.add('yuse-theater-active');
        }
        const contentArea = appElement.querySelector('.yuse-content-area');
        if (contentArea) {
          contentArea.style.padding = '16px 16px 60px';
          contentArea.style.overflowY = 'auto';
          contentArea.style.height = 'calc(100vh - 120px)';
        }
        appElement.addEventListener('click', this.handlePageClick);
        if (this.currentView === 'customizations') {
          console.log(`[YuseTheater] 定制页面渲染长度: ${this.savedData.customizations?.length || 0} 字符`);
        }
      }
    }
    handlePageClick(e) {
      const appContainer = document.getElementById('app-content');
      if (!appContainer) return;
      const navBtn = e.target.closest('.yuse-nav-btn');
      if (navBtn) {
        this.switchView(navBtn.dataset.page);
        return;
      }
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
      const acceptBtn = e.target.closest('.accept-btn');
      if (acceptBtn && acceptBtn.closest('.list-item')?.dataset.type === 'customization') {
        const listItem = acceptBtn.closest('.list-item');
        const itemData = listItem.dataset;
        this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
        this.showToast(`已添加${itemData.typeName}到输入框`);
        listItem.style.opacity = '0';
        setTimeout(() => listItem.remove(), 300);
        e.stopPropagation();
        return;
      }
      const listItem = e.target.closest('.list-item');
      if (listItem) {
        const itemData = listItem.dataset;
        if (!itemData.type) {
          this.showToast('数据异常，请刷新');
          return;
        }
        switch (itemData.type) {
          case 'announcement': this.showAnnouncementDetail(itemData); break;
          case 'customization': this.showCustomizationDetail(itemData); break;
          case 'theater': this.showTheaterDetail(itemData); break;
          case 'shop': this.showShopDetail(itemData); break;
        }
        return;
      }
      const filterBtn = e.target.closest('.filter-btn');
      if (filterBtn) {
        const filterType = filterBtn.dataset.filter;
        const theaterList = appContainer.querySelector('#theater-list');
        if (theaterList) {
          theaterList.innerHTML = '<div class="loading">加载中...</div>';
          setTimeout(() => {
            let filteredData = '';
            switch (filterType) {
              case 'hot': filteredData = this.savedData.theaterHot || '<div class="empty-state">暂无最热内容</div>'; break;
              case 'new': filteredData = this.savedData.theaterNew || '<div class="empty-state">暂无最新内容</div>'; break;
              case 'recommended': filteredData = this.savedData.theaterRecommended || '<div class="empty-state">暂无推荐内容</div>'; break;
              case 'paid': filteredData = this.savedData.theaterPaid || '<div class="empty-state">暂无高价定制内容</div>'; break;
              default: filteredData = this.savedData.theater || '<div class="empty-state">暂无剧场内容</div>';
            }
            theaterList.innerHTML = filteredData;
          }, 300);
        }
        return;
      }
    }
    showAnnouncementDetail(itemData) {
      const detailHtml = `
        <div class="detail-section"><h4>剧情简介</h4><p>${itemData.description || '无'}</p></div>
        <div class="detail-section"><h4>拍摄信息</h4>
          <p><strong>地点：</strong>${itemData.location || '无'}</p>
          <p><strong>演员：</strong>${itemData.actor || '无'}</p>
          <p><strong>片酬：</strong>${itemData.payment || '无'}</p>
        </div>
      `;
      const footerHtml = `
        <button class="action-button reject-btn" onclick="document.querySelector('.yuse-modal').remove()">返回</button>
        <button class="action-button accept-btn" id="accept-announcement-btn">接取</button>
      `;
      this.createOriginalModal(itemData.title, detailHtml, footerHtml);
      document.getElementById('accept-announcement-btn')?.addEventListener('click', () => {
        this.sendToSillyTavern(`[通告|${itemData.title}|${itemData.description}|${itemData.actor}|${itemData.location}|${itemData.payment}]`);
        this.showToast(`已添加《${itemData.title}》`);
        document.querySelector('.yuse-modal').remove();
      });
    }
    showCustomizationDetail(itemData) {
      const detailHtml = `
        <div class="detail-section"><h4>定制类型</h4><p>${itemData.typeName || '无'}</p></div>
        <div class="detail-section"><h4>内容要求</h4><p>${itemData.request || '无'}</p></div>
        <div class="detail-section"><h4>时间要求</h4><p>${itemData.deadline || '无'}</p></div>
        <div class="detail-section"><h4>报酬</h4><p>${itemData.payment || '无'}</p></div>
        <div class="detail-section"><h4>备注</h4><p>${itemData.notes || '无'}</p></div>
      `;
      const footerHtml = `
        <button class="action-button reject-btn" onclick="document.querySelector('.yuse-modal').remove()">返回</button>
        <button class="action-button accept-btn" id="accept-custom-btn">接取</button>
      `;
      this.createOriginalModal(`${itemData.fanId} 的定制`, detailHtml, footerHtml);
      document.getElementById('accept-custom-btn')?.addEventListener('click', () => {
        this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
        this.showToast(`已添加${itemData.fanId}的定制`);
        document.querySelector('.yuse-modal').remove();
      });
    }
    showTheaterDetail(itemData) {
      const renderComments = (reviewsStr) => {
        try {
          const reviews = JSON.parse(reviewsStr.replace(/'/g, '"'));
          return reviews.map(rev => `<div class="comment"><span class="comment-user">${rev.user}:</span> ${rev.text}</div>`).join('');
        } catch (e) {
          return '<div class="comment">评论加载失败</div>';
        }
      };
      const detailHtml = `
        <div class="cover-image" style="background-image: url('${itemData.cover || 'https://picsum.photos/400/200?random=1'}')"></div>
        <div class="detail-section"><h4>作品简介</h4><p>${itemData.description || '无'}</p></div>
        <div class="detail-section"><h4>作品数据</h4>
          <p><strong>人气：</strong>${itemData.popularity || '无'}</p>
          <p><strong>收藏：</strong>${itemData.favorites || '无'}</p>
          <p><strong>播放：</strong>${itemData.views || '无'}</p>
          <p><strong>价格：</strong>${itemData.price || '无'}</p>
        </div>
        <div class="detail-section"><h4>粉丝热评</h4>${itemData.reviews ? renderComments(itemData.reviews) : '<div class="comment">暂无评论</div>'}</div>
      `;
      const footerHtml = `<button class="action-button accept-btn" onclick="document.querySelector('.yuse-modal').remove()">返回</button>`;
      this.createOriginalModal(itemData.title, detailHtml, footerHtml);
    }
    showShopDetail(itemData) {
      const renderComments = (commentsStr) => {
        try {
          const comments = JSON.parse(commentsStr.replace(/'/g, '"'));
          return comments.map(comm => `<div class="comment"><span class="comment-user">${comm.user}:</span> ${comm.text}</div>`).join('');
        } catch (e) {
          return '<div class="comment">评论加载失败</div>';
        }
      };
      const detailHtml = `
        <div class="detail-section"><h4>商品卖点</h4><p>${itemData.description || '无'}</p></div>
        <div class="detail-section"><h4>价格信息</h4>
          <p><strong>基础价：</strong>${itemData.price || '无'}</p>
          <p><strong>最高价：</strong>${itemData.highestBid || '无'}</p>
        </div>
        <div class="detail-section"><h4>评论区</h4>${itemData.comments ? renderComments(itemData.comments) : '<div class="comment">暂无评论</div>'}</div>
      `;
      const footerHtml = `<button class="action-button accept-btn" onclick="document.querySelector('.yuse-modal').remove()">返回</button>`;
      this.createOriginalModal(itemData.name, detailHtml, footerHtml);
    }
    createOriginalModal(header, body, footer) {
      const modal = document.createElement('div');
      modal.className = 'yuse-modal';
      modal.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); opacity:0; transition:opacity 0.3s ease;`;
      modal.innerHTML = `
        <div class="modal-content" style="background:#fff; width:95%; max-height:90%; border-radius:20px; flex-direction:column; animation:popIn 0.3s ease-out; box-shadow:0 4px 20px rgba(0,0,0,0.2); display:flex;">
          <div class="modal-header" style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; font-size:1.1em; font-weight:bold; color:var(--accent-color);">
            ${header}
            <button class="close-btn" style="background:none; border:none; font-size:18px; cursor:pointer; color:#666;" onclick="document.querySelector('.yuse-modal').remove()">×</button>
          </div>
          <div class="modal-body" style="flex:1; overflow-y:auto; padding:15px; line-height:1.6;">${body}</div>
          <div class="modal-footer" style="padding:15px; border-top:1px solid #eee; display:flex; justify-content:flex-end; gap:10px;">${footer}</div>
        </div>
      `;
      document.body.appendChild(modal);
      setTimeout(() => modal.style.opacity = '1', 10);
    }
    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'yuse-toast';
      toast.style.cssText = `position:fixed; bottom:70px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:#fff; padding:8px 16px; border-radius:4px; font-size:13px; z-index:1001; opacity:0; transition:all 0.3s ease;`;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.style.opacity = '1', 100);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
    destroy() {
      this.isAutoRender = false;
      const appElement = document.getElementById('app-content');
      if (appElement) appElement.removeEventListener('click', this.handlePageClick);
      // 移除欲色剧场专属按钮（彻底清理）
      this.removeRefreshBtn();
      // 清除应用标识类
      const appScreen = document.querySelector('.app-screen.yuse-theater-active');
      if (appScreen) {
        appScreen.classList.remove('yuse-theater-active');
        appScreen.removeAttribute('data-app');
      }
      console.log('[YuseTheater] 销毁欲色剧场 App');
    }
  }
  // 实例化
  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] 欲色剧场 App 加载完成');
}
