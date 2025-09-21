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
      console.log('[YuseTheater] 初始化欲色剧场 App');
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
          const [, announcements, customizations, theater, , , , , shop] = fullMatch;
          if (announcements) this.savedData.announcements = announcements;
          if (customizations) this.savedData.customizations = customizations;
          if (theater) this.savedData.theater = theater;
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
          textarea.value = message;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          sendBtn.click();
          return true;
        }
        const backupTextarea = document.querySelector('textarea');
        if (backupTextarea) {
          backupTextarea.value = message;
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
            <div class="yuse-theater-list">${pageData}</div>
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
        <div class="yuse-theater-app">
          ${header}
          <div class="yuse-content-area">${content}</div>
          <div class="yuse-nav-bar">${nav}</div>
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
        setTimeout(() => this.bindPageEvents(), 100);
        console.log('[YuseTheater] 页面内容更新完成，等待绑定事件');
      } else {
        console.error('[YuseTheater] 未找到app-content容器，无法更新内容');
      }
    }

    // 绑定页面事件（加详细日志，确认是否进入）
    bindPageEvents() {
      const appContainer = document.getElementById('app-content');
      if (!appContainer) {
        console.error('[YuseTheater] bindPageEvents：未找到app-content容器，无法绑定事件');
        return;
      }
      console.log('[YuseTheater] ✅ 进入bindPageEvents，开始绑定所有事件');

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

      // 3. 列表项交互事件（核心：列表项点击触发弹窗）
      appContainer.addEventListener('click', (e) => {
        // 处理拒绝按钮
        const rejectBtn = e.target.closest('.reject-btn');
        if (rejectBtn) {
          const listItem = rejectBtn.closest('.list-item');
          if (listItem) {
            listItem.style.opacity = '0';
            listItem.style.transform = 'translateY(-10px)';
            setTimeout(() => listItem.remove(), 300);
          }
          e.stopPropagation();
          return;
        }

        // 处理接取按钮
        const acceptBtn = e.target.closest('.accept-btn');
        if (acceptBtn) {
          const listItem = acceptBtn.closest('.list-item');
          const itemData = listItem.dataset;
          let acceptMsg = '';
          if (itemData.type === 'customization') {
            acceptMsg = `[接取定制|${itemData.id}|${itemData.fanId}|${itemData.typeName}]`;
          } else if (itemData.type === 'announcement') {
            acceptMsg = `[接取通告|${itemData.id}|${itemData.title}|${itemData.actor}]`;
          }
          if (acceptMsg) {
            this.sendToSillyTavern(acceptMsg);
            this.showToast(`已接取${itemData.type === 'customization' ? '定制' : '通告'}`);
            listItem.style.opacity = '0';
            setTimeout(() => listItem.remove(), 300);
          }
          e.stopPropagation();
          return;
        }

        // 处理列表项点击（按钮之外区域，触发弹窗）
        const listItem = e.target.closest('.list-item');
        if (listItem) {
          const itemData = listItem.dataset;
          console.log('[YuseTheater] 🔍 点击列表项，准备调用showItemDetail，itemData：', itemData);
          this.showItemDetail(itemData);
        }
      });

      // 4. 剧场筛选按钮事件
      appContainer.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('.filter-btn');
        if (filterBtn) {
          const filterType = filterBtn.dataset.filter;
          console.log('[YuseTheater] 点击筛选按钮，类型：', filterType);
          this.filterTheaterList(filterType);
        }
      });
    }

    filterTheaterList(filterType) {
      const theaterList = document.querySelector('.yuse-theater-list');
      if (!theaterList) return;
      theaterList.innerHTML = '<div class="loading">加载筛选结果...</div>';
      setTimeout(() => {
        const regexMap = {
          hot: /<theater_hot>(.*?)<\/theater_hot>/s,
          new: /<theater_new>(.*?)<\/theater_new>/s,
          recommended: /<theater_recommended>(.*?)<\/theater_recommended>/s,
          paid: /<theater_paid>(.*?)<\/theater_paid>/s
        };
        const chatData = this.getChatContent();
        const match = chatData.match(regexMap[filterType]);
        theaterList.innerHTML = match ? match[1] : '<div class="empty-state">暂无对应剧场内容</div>';
      }, 500);
    }

    // 显示详情弹窗（加日志确认是否进入）
    showItemDetail(itemData) {
      console.log('[YuseTheater] 🚪 进入showItemDetail方法，itemData：', itemData);
      if (!itemData || typeof itemData !== 'object') {
        console.error('[YuseTheater] 弹窗数据异常：', itemData);
        this.showToast('数据错误，无法显示详情');
        return;
      }

      let detailHtml = '';
      let title = '';
      switch (itemData.type) {
        case 'customization':
          title = '定制详情';
          detailHtml = `
            <p><strong>ID：</strong>${itemData.id || '无'}</p>
            <p><strong>粉丝ID：</strong>${itemData.fanId || '无'}</p>
            <p><strong>定制类型：</strong>${itemData.typeName || '无'}</p>
            <p><strong>内容：</strong>${itemData.content || '无'}</p>
          `;
          break;
        case 'announcement':
          title = '通告详情';
          detailHtml = `
            <p><strong>ID：</strong>${itemData.id || '无'}</p>
            <p><strong>标题：</strong>${itemData.title || '无'}</p>
            <p><strong>演员：</strong>${itemData.actor || '无'}</p>
            <p><strong>描述：</strong>${itemData.desc || '无'}</p>
          `;
          break;
        default:
          title = '详情';
          detailHtml = '<p>暂无该类型的详情数据</p>';
          break;
      }

      // 强制创建弹窗并显示
      const modal = document.createElement('div');
      modal.className = 'yuse-modal';
      modal.style.zIndex = '9999'; // 确保弹窗在最上层
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.innerHTML = `
        <div class="modal-overlay" style="position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;">
          <div class="modal-content" style="background:white; padding:20px; border-radius:10px; width:80%; max-width:400px; z-index:10000;">
            <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
              <h3 style="margin:0;">${title}</h3>
              <button class="close-btn" style="border:none; background:transparent; font-size:20px; cursor:pointer;">×</button>
            </div>
            <div class="modal-body" style="margin-bottom:15px;">${detailHtml}</div>
            <div class="modal-footer" style="text-align:right;">
              <button class="close-modal-btn" style="padding:8px 16px; border:none; background:#eee; border-radius:5px; cursor:pointer;">关闭</button>
            </div>
          </div>
        </div>
      `;

      // 移除旧弹窗，添加新弹窗
      const existingModal = document.querySelector('.yuse-modal');
      if (existingModal) existingModal.remove();
      document.body.appendChild(modal);
      console.log('[YuseTheater] 📌 弹窗已添加到页面');

      // 绑定关闭事件
      modal.querySelectorAll('.close-btn, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.style.opacity = '0';
          setTimeout(() => modal.remove(), 300);
        });
      });
      modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === modal.querySelector('.modal-overlay')) {
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
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = 'rgba(0,0,0,0.7)';
      toast.style.color = 'white';
      toast.style.padding = '10px 20px';
      toast.style.borderRadius = '5px';
      toast.style.zIndex = '9999';
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

  // 全局类挂载
  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] app 实例初始化完成');
}

window.getYuseTheaterAppContent = function () {
  if (window.yuseTheaterApp) {
    console.log('[YuseTheater] 调用getYuseTheaterAppContent，返回页面内容');
    return window.yuseTheaterApp.getAppContent();
  }
  return '<div class="error-state">欲色剧场 app 实例未初始化</div>';
};

// 函数名从bindYuseTheaterEvents → bindYuseTheaterAppEvents
window.bindYuseTheaterAppEvents = function () {
  if (window.yuseTheaterApp) {
    console.log('[YuseTheater] 调用bindYuseTheaterAppEvents，开始绑定事件');
    setTimeout(() => window.yuseTheaterApp.bindPageEvents(), 100);
  } else {
    console.warn('[YuseTheater] bindYuseTheaterAppEvents：app 实例未找到');
  }
};

window.refreshYuseTheaterPage = function (pageKey) {
  if (window.yuseTheaterApp) {
    window.yuseTheaterApp.sendRefreshRequest(pageKey);
  }
};

console.log('[YuseTheater] 欲色剧场 App 脚本加载完成');
