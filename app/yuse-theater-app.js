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
      this.renderCooldown = 500; // 优化：缩短冷却时间，提升响应速度
      this.init();
    }
    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App（对齐原版）');
      this.loadDefaultData();
      this.setupDOMObserver();
      this.setupEventListeners();
      this.createGlobalHeader(); // 新增：创建全局统一页眉
      this.updateAppContent();
      this.parseNewData(); // 新增：初始化时主动解析已有对话框内容
    }
    // 新增：创建全局统一页眉（仅保留一个，包含刷新按钮）
    createGlobalHeader() {
      let globalHeader = document.getElementById('yuse-global-header');
      if (globalHeader) return; // 避免重复创建
      
      globalHeader = document.createElement('div');
      globalHeader.id = 'yuse-global-header';
      globalHeader.style.cssText = `
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 16px; background: #fff; border-bottom: 1px solid var(--border-color);
        box-shadow: 0 2px 4px var(--shadow-color); z-index: 100;
      `;
      // 标题（随页面切换更新）
      globalHeader.innerHTML = `
        <h3 id="yuse-global-title" style="margin: 0; font-size: 16px; color: var(--accent-color);">
          ${window.YuseTheaterPages[this.currentView].name}
        </h3>
        <button id="yuse-global-refresh" class="refresh-btn" data-page="${this.currentView}" style="
          background: var(--accent-color); color: #fff; border: none; border-radius: 6px;
          padding: 4px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px;
        ">
          🔄 刷新
        </button>
      `;
      // 插入到app容器最前面
      const appElement = document.getElementById('app-content');
      if (appElement) appElement.parentNode.insertBefore(globalHeader, appElement);
      
      // 绑定全局刷新按钮事件
      document.getElementById('yuse-global-refresh').addEventListener('click', (e) => {
        this.sendRefreshRequest(e.target.dataset.page);
      });
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
        const chatContainer = document.querySelector('#chat') || document.querySelector('.mes');
        if (chatContainer) {
          const observer = new MutationObserver(mutations => {
            let hasNewMsg = false;
            mutations.forEach(mutation => {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                  if (node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('mes') || node.classList.contains('message'))) {
                    hasNewMsg = true;
                  }
                });
              }
            });
            if (hasNewMsg && Date.now() - this.lastRenderTime > this.renderCooldown) {
              this.parseNewData(); // 优化：去掉不必要的setTimeout，提升响应
            }
          });
          observer.observe(chatContainer, { childList: true, subtree: true });
          console.log('[YuseTheater] DOM观察器设置成功');
        }
      } catch (error) {
        console.warn('[YuseTheater] DOM观察器设置失败:', error);
      }
    }
    setupEventListeners() {
      window.addEventListener('contextUpdate', () => this.parseNewData());
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
          // 优化：仅在数据变化时更新，减少DOM操作
          if (announcements && this.savedData.announcements !== announcements) this.savedData.announcements = announcements;
          if (customizations && this.savedData.customizations !== customizations) this.savedData.customizations = customizations;
          if (theater && this.savedData.theater !== theater) this.savedData.theater = theater;
          if (theaterHot && this.savedData.theaterHot !== theaterHot) this.savedData.theaterHot = theaterHot;
          if (theaterNew && this.savedData.theaterNew !== theaterNew) this.savedData.theaterNew = theaterNew;
          if (theaterRecommended && this.savedData.theaterRecommended !== theaterRecommended) this.savedData.theaterRecommended = theaterRecommended;
          if (theaterPaid && this.savedData.theaterPaid !== theaterPaid) this.savedData.theaterPaid = theaterPaid;
          if (shop && this.savedData.shop !== shop) this.savedData.shop = shop;
          this.updateAppContent();
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据失败:', error);
      }
      this.lastRenderTime = currentTime;
    }
    getChatContent() {
      try {
        const mobileContext = window.mobileContextEditor;
        if (mobileContext) {
          const chatData = mobileContext.getCurrentChatData();
          if (chatData?.messages) {
            return chatData.messages.map(msg => msg.mes || '').join('\n');
          }
        }
        const globalChat = window.chat || window.SillyTavern?.chat;
        if (globalChat && Array.isArray(globalChat)) {
          return globalChat.map(msg => msg.mes || '').join('\n');
        }
        // 新增：直接读取对话框现有文本（解决预先放置的fullMatch无法读取问题）
        const chatElement = document.querySelector('#chat') || document.querySelector('.mes');
        if (chatElement) {
          return chatElement.innerText;
        }
      } catch (error) {
        console.warn('[YuseTheater] 获取对话内容失败:', error);
      }
      return '';
    }
    sendRefreshRequest(pageKey) {
      const pageConfig = window.YuseTheaterPages[pageKey];
      if (!pageConfig) return;
      const refreshMsg = pageConfig.refreshMsg;
      this.sendToSillyTavern(refreshMsg); // 刷新消息仍需发送，其余接取仅填输入框
      this.showToast(`正在刷新${pageConfig.name}...`);
    }
    // 核心修改1：仅将内容填入输入框，不自动发送（解决“直接发送AI”问题）
    sendToSillyTavern(message) {
      try {
        const textarea = document.querySelector('#send_textarea');
        if (textarea) {
          // 隔行追加逻辑保留
          textarea.value = textarea.value ? `${textarea.value}\n${message}` : message;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          // 聚焦输入框，提升用户体验
          textarea.focus();
          return true;
        }
        const backupTextarea = document.querySelector('textarea');
        if (backupTextarea) {
          backupTextarea.value = backupTextarea.value ? `${backupTextarea.value}\n${message}` : message;
          backupTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          backupTextarea.focus();
          return true;
        }
      } catch (error) {
        console.error('[YuseTheater] 填入输入框失败:', error);
      }
      return false;
    }
    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey] || this.currentView === pageKey) return; // 优化：避免重复切换
      this.currentView = pageKey;
      // 优化：先更新标题和刷新按钮，再更新内容，减少视觉卡顿
      this.updateGlobalHeader();
      this.updateAppContent();
    }
    // 新增：更新全局页眉的标题和刷新按钮绑定
    updateGlobalHeader() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      const titleElement = document.getElementById('yuse-global-title');
      const refreshBtn = document.getElementById('yuse-global-refresh');
      if (titleElement) titleElement.textContent = pageConfig.name;
      if (refreshBtn) refreshBtn.dataset.page = this.currentView;
    }
    getAppContent() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      const pageData = this.savedData[this.currentView] || '<div class="empty-state">暂无数据</div>';
      let content = '';
      // 核心修改2：移除页面内重复页眉，仅保留全局页眉
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
        // 优化：使用DocumentFragment减少DOM重绘
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        fragment.appendChild(tempDiv.firstChild);
        appElement.innerHTML = '';
        appElement.appendChild(fragment);
        
        const contentArea = appElement.querySelector('.yuse-content-area');
        if (contentArea) {
          contentArea.style.paddingBottom = '60px';
          contentArea.style.overflowY = 'auto';
          contentArea.style.height = 'calc(100vh - 180px)'; // 适配全局页眉高度
        }
        // 优化：缩短延迟，提升事件绑定速度
        setTimeout(() => this.bindPageEvents(), 30);
        console.log('[YuseTheater] 页面内容更新完成');
      } else {
        console.error('[YuseTheater] 未找到app-content容器，无法更新内容');
      }
    }
    // 核心优化：事件委托统一绑定，避免重复绑定导致卡顿
    bindPageEvents() {
      const appContainer = document.getElementById('app-content');
      if (!appContainer) return;
      
      // 移除现有事件监听，避免重复（解决卡顿核心）
      appContainer.removeEventListener('click', this.handlePageClick);
      // 绑定统一事件处理函数
      this.handlePageClick = (e) => this.pageClickHandler(e);
      appContainer.addEventListener('click', this.handlePageClick);
    }
    // 新增：统一事件处理函数，减少重复绑定
    pageClickHandler(e) {
      const target = e.target;
      // 1. 导航按钮事件
      const navBtn = target.closest('.yuse-nav-btn');
      if (navBtn) {
        this.switchView(navBtn.dataset.page);
        e.stopPropagation();
        return;
      }
      // 2. 拒绝按钮事件
      const rejectBtn = target.closest('.reject-btn');
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
      // 3. 接取按钮事件（列表直接接取）
      const acceptBtn = target.closest('.accept-btn');
      if (acceptBtn && acceptBtn.closest('.list-item')?.dataset.type === 'customization') {
        const listItem = acceptBtn.closest('.list-item');
        const itemData = listItem.dataset;
        this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
        this.showToast(`已接取${itemData.typeName}`);
        listItem.style.transition = 'all 0.3s ease-out';
        listItem.style.opacity = '0';
        setTimeout(() => listItem.remove(), 300);
        e.stopPropagation();
        return;
      }
      // 4. 列表项弹窗事件
      const listItem = target.closest('.list-item');
      if (listItem && !acceptBtn && !rejectBtn) {
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
        e.stopPropagation();
        return;
      }
      // 5. 剧场筛选按钮事件
      const filterBtn = target.closest('.filter-btn');
      if (filterBtn) {
        const filterType = filterBtn.dataset.filter;
        const theaterList = document.querySelector('#theater-list');
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
          }, 200); // 优化：缩短筛选加载延迟
        }
        e.stopPropagation();
        return;
      }
    }
    showAnnouncementDetail(itemData) {
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
        <button class="action-button reject-btn" onclick="document.querySelector('.yuse-modal').remove()">返回</button>
        <button class="action-button accept-btn" id="accept-announcement-btn">接取</button>
      `;
      this.createOriginalModal(itemData.title, detailHtml, footerHtml);
      const acceptBtn = document.getElementById('accept-announcement-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          this.sendToSillyTavern(`[通告|${itemData.title}|${itemData.description}|${itemData.actor}|${itemData.location}|${itemData.payment}]`);
          this.showToast(`已接取《${itemData.title}》`);
          document.querySelector('.yuse-modal').remove();
        });
      }
    }
    showCustomizationDetail(itemData) {
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
        <button class="action-button reject-btn" onclick="document.querySelector('.yuse-modal').remove()">返回</button>
        <button class="action-button accept-btn" id="accept-custom-btn">接取</button>
      `;
      this.createOriginalModal(`${itemData.fanId} 的定制`, detailHtml, footerHtml);
      const acceptBtn = document.getElementById('accept-custom-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
          this.showToast(`已接取${itemData.fanId}的定制`);
          document.querySelector('.yuse-modal').remove();
        });
      }
    }
    showTheaterDetail(itemData) {
      const renderComments = (reviewsStr) => {
        try {
          const reviews = JSON.parse(reviewsStr.replace(/'/g, '"'));
          return reviews.map(rev => `
            <div class="comment">
              <span class="comment-user">${rev.user}:</span> ${rev.text}
            </div>
          `).join('');
        } catch (e) {
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
        <button class="action-button accept-btn" onclick="document.querySelector('.yuse-modal').remove()">返回</button>
      `;
      this.createOriginalModal(itemData.title, detailHtml, footerHtml);
    }
    showShopDetail(itemData) {
      const renderComments = (commentsStr) => {
        try {
          const comments = JSON.parse(commentsStr.replace(/'/g, '"'));
          return comments.map(comm => `
            <div class="comment">
              <span class="comment-user">${comm.user}:</span> ${comm.text}
            </div>
          `).join('');
        } catch (e) {
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
        <button class="action-button accept-btn" onclick="document.querySelector('.yuse-modal').remove()">返回</button>
      `;
      this.createOriginalModal(itemData.name, detailHtml, footerHtml);
    }
    createOriginalModal(header, body, footer) {
      // 移除旧弹窗，避免叠加
      document.querySelector('.yuse-modal')?.remove();
      const modal = document.createElement('div');
      modal.className = 'yuse-modal';
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 9999; display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.5);
      `;
      modal.innerHTML = `
        <div class="modal-content" style="
          background: #fff; width: 95%; max-height: 90%; border-radius: 20px;
          display: flex; flex-direction: column; animation: popIn 0.3s ease-out;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        ">
          <div class="modal-header" style="
            padding: 15px; border-bottom: 1px solid var(--border-color);
            display: flex; justify-content: space-between; align-items: center;
            font-size: 1.1em; font-weight: bold; color: var(--accent-color);
          ">
            ${header}
            <button class="close-btn" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">×</button>
          </div>
          <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 15px; line-height: 1.6;">
            ${body}
          </div>
          <div class="modal-footer" style="
            padding: 15px; border-top: 1px solid var(--border-color);
            display: flex; justify-content: flex-end; gap: 10px;
          ">
            ${footer}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      // 绑定关闭按钮事件
      modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => e.target === modal && modal.remove());
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
      }, 2000);
    }
    destroy() {
      this.isAutoRender = false;
      document.getElementById('yuse-global-header')?.remove();
      console.log('[YuseTheater] 销毁欲色剧场 App');
    }
  }
  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] app 实例初始化完成');
}
window.getYuseTheaterAppContent = function () {
  if (window.yuseTheaterApp) {
    return window.yuseTheaterApp.getAppContent();
  }
  return '<div class="error-state">欲色剧场 app 实例未初始化</div>';
};
window.bindYuseTheaterEvents = function () {
  if (window.yuseTheaterApp) {
    setTimeout(() => window.yuseTheaterApp.bindPageEvents(), 30);
  }
};
window.bindYuseTheaterAppEvents = window.bindYuseTheaterEvents;
window.refreshYuseTheaterPage = function (pageKey) {
  if (window.yuseTheaterApp) {
    window.yuseTheaterApp.sendRefreshRequest(pageKey);
  }
};
console.log('[YuseTheater] 欲色剧场 App 脚本加载完成');
