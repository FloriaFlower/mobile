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
      this.renderCooldown = 1000;
      this.init();
    }
    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App（对齐原版）');
      this.loadDefaultData();
      this.setupDOMObserver();
      this.setupEventListeners();
      this.updateAppContent();
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
            if (hasNewMsg) {
              setTimeout(() => this.parseNewData(), 500);
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
          if (announcements) this.savedData.announcements = announcements;
          if (customizations) this.savedData.customizations = customizations;
          if (theater) this.savedData.theater = theater;
          if (theaterHot) this.savedData.theaterHot = theaterHot;
          if (theaterNew) this.savedData.theaterNew = theaterNew;
          if (theaterRecommended) this.savedData.theaterRecommended = theaterRecommended;
          if (theaterPaid) this.savedData.theaterPaid = theaterPaid;
          if (shop) this.savedData.shop = shop;
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
      } catch (error) {
        console.warn('[YuseTheater] 获取对话内容失败:', error);
      }
      return '';
    }
    sendRefreshRequest(pageKey) {
      const pageConfig = window.YuseTheaterPages[pageKey];
      if (!pageConfig) return;
      const refreshMsg = pageConfig.refreshMsg;
      this.sendToSillyTavern(refreshMsg);
      this.showToast(`正在刷新${pageConfig.name}...`);
    }
    sendToSillyTavern(message) {
      try {
        const textarea = document.querySelector('#send_textarea');
        const sendBtn = document.querySelector('#send_but');
        if (textarea && sendBtn) {
          // 隔行追加：已有内容则换行，无内容则直接赋值
          textarea.value = textarea.value ? `${textarea.value}\n${message}` : message;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          sendBtn.click();
          return true;
        }
        const backupTextarea = document.querySelector('textarea');
        if (backupTextarea) {
          // 隔行追加逻辑同上
          backupTextarea.value = backupTextarea.value ? `${backupTextarea.value}\n${message}` : message;
          backupTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          backupTextarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          return true;
        }
      } catch (error) {
        console.error('[YuseTheater] 发送消息失败:', error);
      }
      return false;
    }
    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey]) return;
      this.currentView = pageKey;
      this.updateAppContent();
      this.updateHeader();
    }
    getAppContent() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      const pageData = this.savedData[this.currentView] || '<div class="empty-state">暂无数据</div>';
      const header = `
        <div class="yuse-page-header">
          <h3>${pageConfig.name}</h3>
          <button class="refresh-btn" data-page="${this.currentView}">🔄 刷新</button>
        </div>
      `;
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
      // 核心修改1：导航栏改为绝对定位（相对于app容器），app容器加相对定位
      return `
        <div class="yuse-theater-app" style="position: relative; height: 100%; overflow: hidden;">
          ${header}
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
        appElement.innerHTML = content;
        const contentArea = appElement.querySelector('.yuse-content-area');
        if (contentArea) {
          contentArea.style.paddingBottom = '60px';
          contentArea.style.overflowY = 'auto';
          contentArea.style.height = 'calc(100vh - 120px)';
        }
        setTimeout(() => this.bindPageEvents(), 100);
        console.log('[YuseTheater] 页面内容更新完成（对齐原版）');
      } else {
        console.error('[YuseTheater] 未找到app-content容器，无法更新内容');
      }
    }
    bindPageEvents() {
      const appContainer = document.getElementById('app-content');
      if (!appContainer) {
        console.error('[YuseTheater] bindPageEvents：未找到app-content容器');
        return;
      }
      console.log('[YuseTheater] ✅ 进入bindPageEvents（对齐原版）');
      // 1. 刷新按钮事件
      appContainer.querySelectorAll('.refresh-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const pageKey = e.target.dataset.page;
          console.log('[YuseTheater] 点击刷新按钮，页面：', pageKey);
          this.sendRefreshRequest(pageKey);
        });
      });
      // 2. 导航按钮事件
      appContainer.addEventListener('click', (e) => {
        const navBtn = e.target.closest('.yuse-nav-btn');
        if (navBtn) {
          const pageKey = navBtn.dataset.page;
          console.log('[YuseTheater] 点击导航按钮，切换到：', pageKey);
          this.switchView(pageKey);
        }
      });
      // 3. 列表项交互事件
      appContainer.addEventListener('click', (e) => {
        // 处理拒绝按钮
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
        // 处理定制列表直接接取（核心修改2：粉丝定制接取格式）
        const acceptBtn = e.target.closest('.accept-btn');
        if (acceptBtn && acceptBtn.closest('.list-item') && acceptBtn.closest('.list-item').dataset.type === 'customization') {
          const listItem = acceptBtn.closest('.list-item');
          const itemData = listItem.dataset;
          // 粉丝定制新格式：[定制|定制类型|内容要求|发布人|时间要求|备注信息|奖励]
          this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
          this.showToast(`已接取${itemData.typeName}`);
          listItem.style.transition = 'all 0.3s ease-out';
          listItem.style.opacity = '0';
          listItem.style.transform = 'translateY(-10px)';
          setTimeout(() => listItem.remove(), 300);
          e.stopPropagation();
          return;
        }
        // 处理列表项点击弹窗
        const listItem = e.target.closest('.list-item');
        if (listItem) {
          const itemData = listItem.dataset;
          if (!itemData.type) {
            console.warn('[YuseTheater] 列表项缺少data-type属性');
            this.showToast('列表项数据异常，请刷新重试');
            return;
          }
          console.log('[YuseTheater] 🔍 点击列表项，调用原版弹窗逻辑', itemData.type);
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
        }
        // 4. 剧场筛选按钮
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
            }, 300);
          }
        }
      });
    }
    // 通告详情弹窗（核心修改2：按钮改“接取”+新格式）
    showAnnouncementDetail(itemData) {
      console.log('[YuseTheater] 显示原版通告弹窗', itemData);
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
      // 核心修改：“开始拍摄”改为“接取”
      const footerHtml = `
        <button class="action-button reject-btn" onclick="document.querySelector('.yuse-modal').style.opacity='0';setTimeout(()=>document.querySelector('.yuse-modal').remove(),300)">返回</button>
        <button class="action-button accept-btn" id="accept-announcement-btn">接取</button>
      `;
      this.createOriginalModal(itemData.title, detailHtml, footerHtml);
      // 核心修改：通告接取新格式[通告|片名|剧情简介|合作演员|拍摄地点|奖励]
      const acceptBtn = document.getElementById('accept-announcement-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          this.sendToSillyTavern(`[通告|${itemData.title}|${itemData.description}|${itemData.actor}|${itemData.location}|${itemData.payment}]`);
          this.showToast(`已接取《${itemData.title}》`);
          document.querySelector('.yuse-modal').style.opacity = '0';
          setTimeout(() => document.querySelector('.yuse-modal').remove(), 300);
        });
      }
    }
    // 粉丝定制详情弹窗（核心修改2：接取新格式）
    showCustomizationDetail(itemData) {
      console.log('[YuseTheater] 显示原版定制弹窗', itemData);
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
      // 核心修改：粉丝定制接取新格式
      const acceptBtn = document.getElementById('accept-custom-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
          this.showToast(`已接取${itemData.fanId}的定制`);
          document.querySelector('.yuse-modal').style.opacity = '0';
          setTimeout(() => document.querySelector('.yuse-modal').remove(), 300);
        });
      }
    }
    showTheaterDetail(itemData) {
      console.log('[YuseTheater] 显示原版剧场弹窗', itemData);
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
      console.log('[YuseTheater] 显示原版商城弹窗', itemData);
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
            font-size: 1.1em; font-weight: bold; color: #d63384;
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
      }, 2000);
    }
    destroy() {
      this.isAutoRender = false;
      console.log('[YuseTheater] 销毁欲色剧场 App');
    }
  }
  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] app 实例初始化完成（对齐原版）');
}
window.getYuseTheaterAppContent = function () {
  if (window.yuseTheaterApp) {
    return window.yuseTheaterApp.getAppContent();
  }
  return '<div class="error-state">欲色剧场 app 实例未初始化</div>';
};
window.bindYuseTheaterEvents = function () {
  if (window.yuseTheaterApp) {
    setTimeout(() => window.yuseTheaterApp.bindPageEvents(), 100);
  } else {
    console.warn('[YuseTheater] bindYuseTheaterEvents：app 实例未找到');
  }
};
window.bindYuseTheaterAppEvents = window.bindYuseTheaterEvents;
window.refreshYuseTheaterPage = function (pageKey) {
  if (window.yuseTheaterApp) {
    window.yuseTheaterApp.sendRefreshRequest(pageKey);
  }
};
console.log('[YuseTheater] 欲色剧场 App 脚本加载完成（完全对齐原版）');
