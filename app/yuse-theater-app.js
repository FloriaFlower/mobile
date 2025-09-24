if (typeof window.YuseTheaterApp === 'undefined') {
  window.YuseTheaterRegex = {
    // 增强正则：允许标签内换行，优化匹配容错性
    fullMatch: /<yuse_data>[\s\S]*?(?:<announcements>([\s\S]*?)<\/announcements>[\s\S]*?)?(?:<customizations>([\s\S]*?)<\/customizations>[\s\S]*?)?(?:<theater>([\s\S]*?)<\/theater>[\s\S]*?)?(?:<theater_hot>([\s\S]*?)<\/theater_hot>[\s\S]*?)?(?:<theater_new>([\s\S]*?)<\/theater_new>[\s\S]*?)?(?:<theater_recommended>([\s\S]*?)<\/theater_recommended>[\s\S]*?)?(?:<theater_paid>([\s\S]*?)<\/theater_paid>[\s\S]*?)?(?:<shop>([\s\S]*?)<\/shop>[\s\S]*?)?<\/yuse_data>/,
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

  // 全局函数提前定义（解决未定义报错）
  window.getYuseTheaterAppContent = function () {
    if (window.yuseTheaterApp) {
      console.log('[YuseTheater] 全局函数调用：getYuseTheaterAppContent');
      return window.yuseTheaterApp.getAppContent();
    }
    return '<div class="error-state">欲色剧场 app 实例未初始化</div>';
  };

  window.bindYuseTheaterEvents = function () {
    if (window.yuseTheaterApp) {
      console.log('[YuseTheater] 全局函数调用：bindYuseTheaterEvents');
      setTimeout(() => {
        const appElement = document.getElementById('app-content');
        if (appElement) {
          appElement.addEventListener('click', window.yuseTheaterApp.handlePageClick);
        }
      }, 100);
    } else {
      console.warn('[YuseTheater] bindYuseTheaterEvents：app 实例未找到');
    }
  };

  window.bindYuseTheaterAppEvents = window.bindYuseTheaterEvents;

  window.refreshYuseTheaterPage = function (pageKey) {
    if (window.yuseTheaterApp) {
      console.log('[YuseTheater] 全局函数调用：refreshYuseTheaterPage，页面键：', pageKey);
      window.yuseTheaterApp.sendRefreshRequest(pageKey);
    }
  };

  class YuseTheaterApp {
    constructor() {
      this.currentView = 'announcements';
      this.savedData = {};
      this.isAutoRender = true;
      this.lastRenderTime = 0;
      this.renderCooldown = 500;
      this.handlePageClick = this.handlePageClick.bind(this);
      this.nativeHeaderSelector = '.app-header, #app-header, header, .app-top-bar';
      this.init();
    }

    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App（对齐原版）');
      this.loadDefaultData();
      this.setupDOMObserver();
      this.setupEventListeners();
      this.updateAppContent();
      // 初始化时主动解析一次，避免依赖DOM变化
      setTimeout(() => this.parseNewData(), 800);
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
        // 核心优化1：扩展聊天容器选择器，覆盖更多场景
        const chatContainer = document.querySelector('#chat') || 
                             document.querySelector('.mes') || 
                             document.querySelector('.chat-container') || 
                             document.querySelector('.message-list') || 
                             document.querySelector('.chat-message-container');
        if (chatContainer) {
          const observer = new MutationObserver(mutations => {
            let hasNewMsg = false;
            mutations.forEach(mutation => {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                  // 核心优化2：识别AI消息专属类名（常见场景补充）
                  const isAiMsg = node.classList.contains('ai-message') || 
                                 node.classList.contains('bot-message') || 
                                 node.classList.contains('assistant-message') || 
                                 node.classList.contains('mes') || 
                                 node.classList.contains('message');
                  if (node.nodeType === Node.ELEMENT_NODE && isAiMsg) {
                    hasNewMsg = true;
                    console.log('[YuseTheater] 检测到新AI消息节点:', node);
                  }
                });
              }
            });
            if (hasNewMsg) {
              // 延长延迟至1200ms，确保AI消息完全渲染（含HTML标签）
              setTimeout(() => this.parseNewData(), 1200);
            }
          });
          observer.observe(chatContainer, { childList: true, subtree: true });
          console.log('[YuseTheater] DOM观察器设置成功，监听容器:', chatContainer);
        } else {
          console.warn('[YuseTheater] 未找到任何聊天容器，将依赖手动解析');
          // 未找到容器时，每2秒主动解析一次（保底方案）
          setInterval(() => this.parseNewData(), 2000);
        }
      } catch (error) {
        console.warn('[YuseTheater] DOM观察器设置失败:', error);
      }
    }

    setupEventListeners() {
      window.addEventListener('contextUpdate', () => this.parseNewData());
      window.addEventListener('messageUpdate', () => this.parseNewData());
      window.addEventListener('yuseViewSwitch', () => this.parseNewData());
      // 新增：监听输入框发送事件，刷新后主动解析
      const sendBtn = document.querySelector('#send_but') || document.querySelector('.send-btn');
      if (sendBtn) {
        sendBtn.addEventListener('click', () => {
          setTimeout(() => this.parseNewData(), 1500);
        });
      }
    }

    parseNewData() {
      if (!this.isAutoRender) return;
      const currentTime = Date.now();
      const timeDiff = currentTime - this.lastRenderTime;
      let isDataUpdated = false;

      try {
        const chatData = this.getChatContent();
        // 核心优化3：打印关键日志，明确数据获取状态
        console.log('[YuseTheater] 解析数据 - 聊天内容长度:', chatData.length);
        console.log('[YuseTheater] 解析数据 - 包含yuse_data?', chatData.includes('<yuse_data'));
        // 打印前500字符，方便排查数据格式
        if (chatData.length > 0) {
          console.log('[YuseTheater] 聊天内容预览:', chatData.slice(0, 500) + '...');
        }

        const fullMatch = chatData.match(window.YuseTheaterRegex.fullMatch);
        if (fullMatch) {
          console.log('[YuseTheater] 匹配到yuse_data数据，开始更新');
          const [, announcements, customizations, theater, theaterHot, theaterNew, theaterRecommended, theaterPaid, shop] = fullMatch;

          // 非空判断+去空格，确保只更新有效数据
          if (announcements && announcements.trim() !== '') {
            this.savedData.announcements = announcements;
            isDataUpdated = true;
            console.log('[YuseTheater] 更新通告数据，长度:', announcements.length);
          }
          if (customizations && customizations.trim() !== '') {
            this.savedData.customizations = customizations;
            isDataUpdated = true;
            console.log('[YuseTheater] 更新粉丝定制数据，长度:', customizations.length);
          }
          if (theater && theater.trim() !== '') {
            this.savedData.theater = theater;
            isDataUpdated = true;
            console.log('[YuseTheater] 更新剧场数据，长度:', theater.length);
          }
          if (theaterHot && theaterHot.trim() !== '') {
            this.savedData.theaterHot = theaterHot;
            isDataUpdated = true;
          }
          if (theaterNew && theaterNew.trim() !== '') {
            this.savedData.theaterNew = theaterNew;
            isDataUpdated = true;
          }
          if (theaterRecommended && theaterRecommended.trim() !== '') {
            this.savedData.theaterRecommended = theaterRecommended;
            isDataUpdated = true;
          }
          if (theaterPaid && theaterPaid.trim() !== '') {
            this.savedData.theaterPaid = theaterPaid;
            isDataUpdated = true;
          }
          if (shop && shop.trim() !== '') {
            this.savedData.shop = shop;
            isDataUpdated = true;
          }

          // 数据更新时强制渲染，忽略冷却
          if (isDataUpdated) {
            this.lastRenderTime = currentTime;
            this.updateAppContent();
            console.log('[YuseTheater] 数据更新成功，当前视图:', this.currentView);
            // 显示更新成功的toast，让用户直观感知
            this.showToast(`${window.YuseTheaterPages[this.currentView].name}数据更新成功！`);
          }
        } else {
          console.log('[YuseTheater] 未匹配到yuse_data数据（检查数据格式是否正确）');
        }
      } catch (error) {
        console.error('[YuseTheater] 解析数据失败:', error);
      }

      // 非数据更新场景保留冷却
      if (!isDataUpdated && timeDiff < this.renderCooldown) {
        console.log('[YuseTheater] 冷却期内，跳过非必要解析');
        return;
      }
      this.lastRenderTime = currentTime;
    }

    getChatContent() {
      try {
        // 1. 优先获取mobileContext（原生场景）
        const mobileContext = window.mobileContextEditor;
        if (mobileContext) {
          const chatData = mobileContext.getCurrentChatData();
          if (chatData?.messages) {
            const msgStr = chatData.messages.map(msg => msg.mes || '').join('\n');
            console.log('[YuseTheater] 从mobileContext获取聊天数据，长度:', msgStr.length);
            return msgStr;
          }
        }

        // 2. 获取全局chat对象（SillyTavern场景）
        const globalChat = window.chat || window.SillyTavern?.chat;
        if (globalChat && Array.isArray(globalChat)) {
          const msgStr = globalChat.map(msg => msg.mes || msg.content || '').join('\n');
          console.log('[YuseTheater] 从全局chat获取聊天数据，长度:', msgStr.length);
          return msgStr;
        }

        // 3. 从DOM获取（核心优化4：扩展容器+保留完整HTML）
        const chatContainer = document.querySelector('#chat') || 
                             document.querySelector('.mes') || 
                             document.querySelector('.chat-container') || 
                             document.querySelector('.message-list') || 
                             document.querySelector('.chat-message-container');
        if (chatContainer) {
          // 保留完整HTML结构，不替换空格（避免破坏标签）
          const msgStr = chatContainer.innerHTML;
          console.log('[YuseTheater] 从DOM获取聊天数据，长度:', msgStr.length);
          return msgStr;
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
      const sendSuccess = this.sendToSillyTavern(refreshMsg, true);
      if (sendSuccess) {
        this.showToast(`正在刷新${pageConfig.name}...`);
        // 核心优化5：延长主动解析延迟至1500ms，确保AI有足够时间返回数据
        setTimeout(() => this.parseNewData(), 1500);
        // 双重保障：2秒后再解析一次
        setTimeout(() => this.parseNewData(), 2500);
      } else {
        this.showToast(`刷新失败，请检查输入框是否存在`);
      }
    }

    sendToSillyTavern(message, isAutoSend = false) {
      try {
        const textarea = document.querySelector('#send_textarea') || 
                         document.querySelector('.send-textarea') || 
                         document.querySelector('textarea[name="message"]');
        const sendBtn = document.querySelector('#send_but') || 
                        document.querySelector('.send-btn') || 
                        document.querySelector('.submit-btn');
        if (textarea) {
          textarea.value = textarea.value ? `${textarea.value}\n${message}` : message;
          textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          if (isAutoSend && sendBtn) {
            // 模拟真实点击（避免按钮禁用问题）
            sendBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            console.log('[YuseTheater] 已发送刷新请求:', message);
          }
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
      this.updateNativeHeaderRefreshBtn();
      // 切换视图后主动解析，确保显示最新数据
      setTimeout(() => this.parseNewData(), 500);
    }

    updateNativeHeaderRefreshBtn() {
      const nativeHeader = document.querySelector(this.nativeHeaderSelector);
      if (!nativeHeader) return;

      const oldRefreshBtn = nativeHeader.querySelector('.yuse-refresh-btn');
      if (oldRefreshBtn) oldRefreshBtn.remove();

      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'refresh-btn yuse-refresh-btn';
      refreshBtn.dataset.page = this.currentView;
      refreshBtn.innerHTML = '🔄 刷新';
      refreshBtn.style.padding = '6px 12px';
      refreshBtn.style.border = 'none';
      refreshBtn.style.borderRadius = '4px';
      refreshBtn.style.background = '#007bff';
      refreshBtn.style.color = 'white';
      refreshBtn.style.cursor = 'pointer';
      refreshBtn.addEventListener('click', () => {
        this.sendRefreshRequest(this.currentView);
      });

      nativeHeader.style.display = 'flex';
      nativeHeader.style.justifyContent = 'space-between';
      nativeHeader.style.alignItems = 'center';
      nativeHeader.appendChild(refreshBtn);
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
          <div class="yuse-nav-bar" style="position: absolute; bottom: 0; left: 0; width: 100%; box-sizing: border-box; display: flex; gap: 8px; padding: 8px; background: #fff; border-top: 1px solid #eee;">
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
      const appElement = document.getElementById('app-content') || document.querySelector('.app-content');
      if (appElement) {
        appElement.removeEventListener('click', this.handlePageClick);
        appElement.innerHTML = content;

        const contentArea = appElement.querySelector('.yuse-content-area');
        if (contentArea) {
          contentArea.style.padding = '16px 16px 60px';
          contentArea.style.overflowY = 'auto';
          contentArea.style.height = 'calc(100vh - 120px)';
          contentArea.style.boxSizing = 'border-box';
        }

        this.updateNativeHeaderRefreshBtn();
        appElement.addEventListener('click', this.handlePageClick);
        console.log('[YuseTheater] 页面内容更新完成，当前视图:', this.currentView);
      } else {
        console.error('[YuseTheater] 未找到app-content容器，无法更新内容');
        this.showToast('未找到应用容器，请检查页面结构');
      }
    }

    handlePageClick(e) {
      const appContainer = document.getElementById('app-content') || document.querySelector('.app-content');
      if (!appContainer) return;

      // 导航按钮
      const navBtn = e.target.closest('.yuse-nav-btn');
      if (navBtn) {
        const pageKey = navBtn.dataset.page;
        this.switchView(pageKey);
        return;
      }

      // 拒绝按钮
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

      // 定制直接接取
      const acceptBtn = e.target.closest('.accept-btn');
      if (acceptBtn && acceptBtn.closest('.list-item') && acceptBtn.closest('.list-item').dataset.type === 'customization') {
        const listItem = acceptBtn.closest('.list-item');
        const itemData = listItem.dataset;
        this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
        this.showToast(`已添加${itemData.typeName}到输入框`);
        listItem.style.transition = 'all 0.3s ease-out';
        listItem.style.opacity = '0';
        listItem.style.transform = 'translateY(-10px)';
        setTimeout(() => listItem.remove(), 300);
        e.stopPropagation();
        return;
      }

      // 列表项弹窗
      const listItem = e.target.closest('.list-item');
      if (listItem) {
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
        return;
      }

      // 剧场筛选
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
        return;
      }
    }

    showAnnouncementDetail(itemData) {
      console.log('[YuseTheater] 显示通告弹窗', itemData);
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
        <button class="action-button reject-btn" onclick="document.querySelector('.yuse-modal').style.opacity='0';setTimeout(()=>document.querySelector('.yuse-modal').remove(),300)">返回</button>
        <button class="action-button accept-btn" id="accept-announcement-btn">接取</button>
      `;
      this.createOriginalModal(itemData.title, detailHtml, footerHtml);

      const acceptBtn = document.getElementById('accept-announcement-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          this.sendToSillyTavern(`[通告|${itemData.title}|${itemData.description}|${itemData.actor}|${itemData.location}|${itemData.payment}]`);
          this.showToast(`已添加《${itemData.title}》到输入框`);
          document.querySelector('.yuse-modal').style.opacity = '0';
          setTimeout(() => document.querySelector('.yuse-modal').remove(), 300);
        });
      }
    }

    showCustomizationDetail(itemData) {
      console.log('[YuseTheater] 显示定制弹窗', itemData);
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

      const acceptBtn = document.getElementById('accept-custom-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          this.sendToSillyTavern(`[定制|${itemData.typeName}|${itemData.request}|${itemData.fanId}|${itemData.deadline}|${itemData.notes}|${itemData.payment}]`);
          this.showToast(`已添加${itemData.fanId}的定制到输入框`);
          document.querySelector('.yuse-modal').style.opacity = '0';
          setTimeout(() => document.querySelector('.yuse-modal').remove(), 300);
        });
      }
    }

    showTheaterDetail(itemData) {
      console.log('[YuseTheater] 显示剧场弹窗', itemData);
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
        <div class="cover-image" style="background-image: url('${itemData.cover || 'https://picsum.photos/400/200?random=1'}'); height: 180px; background-size: cover; border-radius: 8px; margin-bottom: 12px;"></div>
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
      console.log('[YuseTheater] 显示商城弹窗', itemData);
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
            font-size: 1.1em; font-weight: bold; color: var(--accent-color);
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
      const appElement = document.getElementById('app-content') || document.querySelector('.app-content');
      if (appElement) {
        appElement.removeEventListener('click', this.handlePageClick);
      }
      const nativeHeader = document.querySelector(this.nativeHeaderSelector);
      if (nativeHeader) {
        const refreshBtn = nativeHeader.querySelector('.yuse-refresh-btn');
        if (refreshBtn) refreshBtn.remove();
      }
      console.log('[YuseTheater] 销毁欲色剧场 App');
    }
  }

  // 实例化App
  window.YuseTheaterApp = YuseTheaterApp;
  window.yuseTheaterApp = new YuseTheaterApp();
  console.log('[YuseTheater] app 实例初始化完成（对齐原版）');
  console.log('[YuseTheater] 全局函数状态:', {
    getYuseTheaterAppContent: typeof window.getYuseTheaterAppContent,
    bindYuseTheaterEvents: typeof window.bindYuseTheaterEvents
  });
}

console.log('[YuseTheater] 欲色剧场 App 脚本加载完成');
