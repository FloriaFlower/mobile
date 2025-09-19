if (typeof window.YuseTheaterApp === 'undefined') {
   window.YuseTheaterRegex = {
     fullMatch: /<yuse_data>[\s\S]*?<announcements>([\s\S]*?)<\/announcements>[\s\S]*?<customizations>([\s\S]*?)<\/customizations>[\s\S]*?<theater>([\s\S]*?)<\/theater>[\s\S]*?<theater_hot>([\s\S]*?)<\/theater_hot>[\s\S]*?<theater_new>([\s\S]*?)<\/theater_new>[\s\S]*?<theater_recommended>([\s\S]*?)<\/theater_recommended>[\s\S]*?<theater_paid>([\s\S]*?)<\/theater_paid>[\s\S]*?<shop>([\s\S]*?)<\/shop>[\s\S]*?<\/yuse_data>/,
     // 1. 匹配通告：announcement|id|标题|演员|地点|报酬|描述
     announcement: /announcement\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)/g,
     // 2. 匹配定制：customization|id|粉丝ID|类型|截止时间|报酬|需求|备注
     customization: /customization\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)/g,
     // 3. 匹配剧场：theater|id|标题|封面|描述|热度|收藏|观看|价格|评论
     theater: /theater\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)/g,
     // 4. 匹配商品：shop|id|名称|描述|基础价|最高价|评论
     shop: /shop\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)/g
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
      // 状态管理
      this.currentView = 'announcements'; // 当前页面
      this.savedData = {}; // 保存的页面数据
      this.isAutoRender = true;
      this.lastRenderTime = 0;
      this.renderCooldown = 1000;
      // 初始化
      this.init();
    }
    // 初始化：加载默认数据 + 监听
    init() {
      console.log('[YuseTheater] 初始化欲色剧场 App');
      // 加载初始默认数据
      this.loadDefaultData();
      // 初始化DOM监听
      this.setupDOMObserver();
      // 初始化事件监听
      this.setupEventListeners();
      // 初始化页面渲染
      this.updateAppContent();
    }
    // 加载初始默认数据
    loadDefaultData() {
       // 初始化保存数据（无默认数据，直接设为空，等待对话解析）
       for (const page in window.YuseTheaterPages) {
         if (!this.savedData[page]) {
           this.savedData[page] = '<div class="empty-state">等待加载数据...</div>';
         }
      }
    }
    // 设置DOM观察器（监听对话更新）
    setupDOMObserver() {
      try {
        const chatContainer = document.querySelector('#chat') || document.querySelector('.mes');
        if (chatContainer) {
          const observer = new MutationObserver(mutations => {
            let hasNewMsg = false;
            mutations.forEach(mutation => {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                  if (node.nodeType === Node.ELEMENT_NODE && 
                      (node.classList.contains('mes') || node.classList.contains('message'))) {
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
    // 设置事件监听（页面切换、刷新）
    setupEventListeners() {
      // 监听全局上下文更新事件
      window.addEventListener('contextUpdate', () => this.parseNewData());
      window.addEventListener('messageUpdate', () => this.parseNewData());
    }
    
    // 解析对话中的新数据
parseNewData() {
  if (!this.isAutoRender) return;
  const currentTime = Date.now();
  if (currentTime - this.lastRenderTime < this.renderCooldown) return;
  try {
    const chatData = this.getChatContent();
    const fullMatch = chatData.match(window.YuseTheaterRegex.fullMatch);
    if (fullMatch) {
      const [, announcementsStr, customizationsStr, theaterStr, , , , , shopStr] = fullMatch;

      // ========== 1. 解析“通告”：简化字符串→HTML列表项 ==========
      const parseAnnouncements = (str) => {
        if (!str) return '<div class="empty-state">暂无通告</div>';
        let html = '';
        // 用新正则匹配每一行通告
        str.replace(window.YuseTheaterRegex.announcement, (match, id, title, actor, location, payment, description) => {
          // 生成带data-*属性的列表项（弹窗所需属性由JS生成）
          html += `
            <div class="list-item" 
                 data-type="announcement" 
                 data-id="${id || '-'}" 
                 data-title="${title || '-'}" 
                 data-actor="${actor || '-'}" 
                 data-location="${location || '-'}" 
                 data-payment="${payment || '-'}" 
                 data-description="${description || '-'}"
            >
              <div class="item-title">${title || '无标题'}</div>
              <div class="item-meta">
                <span>演员：${actor || '无'}</span>
                <span>报酬：${payment || '无'}</span>
              </div>
              <div class="item-actions">
                <button class="action-button accept-btn">接取</button>
                <button class="action-button reject-btn">拒绝</button>
              </div>
            </div>
          `;
        });
        return html;
      };

      // ========== 2. 解析“粉丝定制”：简化字符串→HTML列表项 ==========
      const parseCustomizations = (str) => {
        if (!str) return '<div class="empty-state">暂无定制</div>';
        let html = '';
        str.replace(window.YuseTheaterRegex.customization, (match, id, fanId, typeName, deadline, payment, request, notes) => {
          html += `
            <div class="list-item" 
                 data-type="customization" 
                 data-id="${id || '-'}" 
                 data-fanId="${fanId || '-'}" 
                 data-typeName="${typeName || '-'}" 
                 data-deadline="${deadline || '-'}" 
                 data-payment="${payment || '-'}" 
                 data-request="${request || '-'}" 
                 data-notes="${notes || '-'}"
            >
              <div class="item-title">${fanId || '匿名粉丝'} 的 ${typeName || '定制'}</div>
              <div class="item-meta">
                <span>截止：${deadline || '无'}</span>
                <span>报酬：${payment || '无'}</span>
              </div>
              <div class="item-actions">
                <button class="action-button accept-btn">接取</button>
                <button class="action-button reject-btn">拒绝</button>
              </div>
            </div>
          `;
        });
        return html;
      };

      // ========== 3. 解析“剧场”：简化字符串→HTML列表项 ==========
      const parseTheater = (str) => {
        if (!str) return '<div class="empty-state">暂无剧场</div>';
        let html = '';
        str.replace(window.YuseTheaterRegex.theater, (match, id, title, cover, description, popularity, favorites, views, price, reviews) => {
          html += `
            <div class="list-item" 
                 data-type="theater" 
                 data-id="${id || '-'}" 
                 data-title="${title || '-'}" 
                 data-cover="${cover || 'https://picsum.photos/400/200?random=200'}" 
                 data-description="${description || '-'}" 
                 data-popularity="${popularity || '-'}" 
                 data-favorites="${favorites || '-'}" 
                 data-views="${views || '-'}" 
                 data-price="${price || '-'}" 
                 data-reviews="${reviews || '[]'}"
            >
              <div class="item-title">${title || '无标题'}</div>
              <div class="item-meta">
                <span>热度：${popularity || '0'}</span>
                <span>价格：${price || '0'}</span>
              </div>
            </div>
          `;
        });
        return html;
      };

      // ========== 4. 解析“商品”：简化字符串→HTML列表项 ==========
      const parseShop = (str) => {
        if (!str) return '<div class="empty-state">暂无商品</div>';
        let html = '';
        str.replace(window.YuseTheaterRegex.shop, (match, id, name, description, price, highestBid, comments) => {
          html += `
            <div class="list-item" 
                 data-type="shop" 
                 data-id="${id || '-'}" 
                 data-name="${name || '-'}" 
                 data-description="${description || '-'}" 
                 data-price="${price || '-'}" 
                 data-highestBid="${highestBid || '-'}" 
                 data-comments="${comments || '[]'}"
            >
              <div class="item-title">${name || '无名称'}</div>
              <div class="item-meta">
                <span>基础价：${price || '0'}</span>
                <span>最高价：${highestBid || '0'}</span>
              </div>
            </div>
          `;
        });
        return html;
      };

      // ========== 5. 赋值解析后的HTML，渲染页面 ==========
      this.savedData.announcements = parseAnnouncements(announcementsStr);
      this.savedData.customizations = parseCustomizations(customizationsStr);
      this.savedData.theater = parseTheater(theaterStr);
      this.savedData.shop = parseShop(shopStr);

      this.updateAppContent();
    }
  } catch (error) {
    console.error('[YuseTheater] 解析AI数据失败（可检查AI输出格式）:', error);
    // 显示错误提示，方便排查AI输出问题
    this.savedData.announcements = `<div class="error-state">通告解析失败：${error.message}</div>`;
    this.updateAppContent();
  }
  this.lastRenderTime = currentTime;
}


  getChatContent() {
    try {
      // 1. 优先从插件上下文获取（原逻辑保留）
      const mobileContext = window.mobileContextEditor;
      if (mobileContext) {
        const chatData = mobileContext.getCurrentChatData();
        if (chatData?.messages) {
          const content = chatData.messages.map(msg => msg.mes || '').join('\n');
          console.log('[YuseTheater] 从 mobileContextEditor 获取数据:', content);
          return content;
        }
      }

      // 2. 备用：从全局聊天变量获取（原逻辑保留）
      const globalChat = window.chat || window.SillyTavern?.chat;
      if (globalChat && Array.isArray(globalChat)) {
        const content = globalChat.map(msg => msg.mes || '').join('\n');
        console.log('[YuseTheater] 从全局变量获取数据:', content);
        return content;
      }

      // 3. 新增：直接从聊天DOM提取（最通用，适配多数环境）
      const chatElements = document.querySelectorAll('.mes, .message, .chat-message');
      if (chatElements.length > 0) {
        const content = Array.from(chatElements)
          .map(el => el.textContent || el.innerText || '')
          .join('\n');
        console.log('[YuseTheater] 从DOM提取数据:', content);
        return content;
      }

      // 4. 所有方式失败，提示用户
      console.warn('[YuseTheater] 所有获取聊天数据的方式均失败，请检查环境');
    } catch (error) {
      console.warn('[YuseTheater] 获取对话内容失败:', error);
    }
    return '';
  }

    // 发送刷新请求（指定页面）
    sendRefreshRequest(pageKey) {
      const pageConfig = window.YuseTheaterPages[pageKey];
      if (!pageConfig) return;
      // 发送对应页面的刷新指令
      const refreshMsg = pageConfig.refreshMsg;
      this.sendToSillyTavern(refreshMsg);
      // 显示刷新提示
      this.showToast(`正在刷新${pageConfig.name}...`);
    }
    // 发送消息到SillyTavern
    sendToSillyTavern(message) {
      try {
        // 找到输入框和发送按钮
        const textarea = document.querySelector('#send_textarea');
        const sendBtn = document.querySelector('#send_but');
        if (textarea && sendBtn) {
          textarea.value = message;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          sendBtn.click();
          return true;
        }
        // 备用：触发Enter键
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
    // 切换页面
    switchView(pageKey) {
      if (!window.YuseTheaterPages[pageKey]) return;
      this.currentView = pageKey;
      this.updateAppContent();
      this.updateHeader();
    }
    // 渲染当前页面内容
    getAppContent() {
      const pageConfig = window.YuseTheaterPages[this.currentView];
      const pageData = this.savedData[this.currentView] || '<div class="empty-state">暂无数据</div>';
      // 页面标题与刷新按钮
      const header = `
        <div class="yuse-page-header">
          <h3>${pageConfig.name}</h3>
          <button class="refresh-btn" data-page="${this.currentView}">🔄 刷新</button>
        </div>
      `;
      // 不同页面内容适配
      let content = '';
      switch (this.currentView) {
        case 'announcements':
          content = `<div class="yuse-announcement-list">${pageData}</div>`;
          break;
        case 'customizations':
          content = `<div class="yuse-customization-list">${pageData}</div>`;
          break;
        case 'theater':
          // 剧场列表添加筛选栏（保留原版功能）
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
      // 底部导航栏
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
    // 获取导航图标
    getNavIcon(pageKey) {
      const iconMap = {
        announcements: '📢',
        customizations: '💖',
        theater: '🎬',
        shop: '🛒'
      };
      return iconMap[pageKey] || '📄';
    }
    // 更新应用内容
    updateAppContent() {
      const content = this.getAppContent();
      const appElement = document.getElementById('app-content');
      if (appElement) {
        appElement.innerHTML = content;
        // 绑定页面事件（延迟确保DOM加载）
        setTimeout(() => this.bindPageEvents(), 100);
      }
    }
    // 绑定页面事件（刷新、导航、列表项交互）
    bindPageEvents() {
  const appContainer = document.getElementById('app-content');
  if (!appContainer) return;

  // 1. 刷新按钮事件（保留原逻辑）
  appContainer.querySelectorAll('.refresh-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pageKey = e.target.dataset.page;
      this.sendRefreshRequest(pageKey);
    });
  });

  // 2. 导航按钮事件【重构：事件委托】
  appContainer.addEventListener('click', (e) => {
    const navBtn = e.target.closest('.yuse-nav-btn');
    if (navBtn) {
      const pageKey = navBtn.dataset.page;
      this.switchView(pageKey);
    }
  });

  // 3. 列表项交互事件【重构：事件委托，解决详情不弹出问题（问题②）】
  appContainer.addEventListener('click', (e) => {
    // 跳过按钮事件（拒绝/接取）
    if (e.target.closest('.action-button')) return;

    // 处理列表项点击（弹详情）
    const listItem = e.target.closest('.list-item');
    if (listItem) {
      const itemData = listItem.dataset;
      console.log('[YuseTheater] 点击列表项，itemData:', itemData);
      if (!itemData.type) {
       console.warn('[YuseTheater] 列表项缺少 data-type 属性，无法弹出详情');
       return;
      }
      this.showItemDetail(itemData);
    }

    // 处理拒绝按钮
    const rejectBtn = e.target.closest('.reject-btn');
    if (rejectBtn) {
      const listItem = rejectBtn.closest('.list-item');
      listItem.style.opacity = '0';
      listItem.style.transform = 'translateY(-10px)';
      setTimeout(() => listItem.remove(), 300);
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
    }
  });

  // 4. 剧场筛选按钮事件（保留原逻辑）
  appContainer.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (filterBtn) {
      const filterType = filterBtn.dataset.filter;
      this.filterTheaterList(filterType);
    }
  });
}

    // 剧场列表筛选（保留原版功能）
    filterTheaterList(filterType) {
      const theaterList = document.querySelector('.yuse-theater-list');
      if (!theaterList) return;
      // 显示加载状态
      theaterList.innerHTML = '<div class="loading">加载筛选结果...</div>';
      // 模拟筛选（实际应从对话解析对应筛选数据，此处简化）
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
    // 显示列表项详情
    showItemDetail(itemData) {
      let detailHtml = '';
      let title = '';
      switch (itemData.type) {
        case 'announcement':
          title = itemData.title;
          detailHtml = `
            <div class="detail-section">
              <h4>剧情简介</h4>
              <p>${itemData.description}</p>
            </div>
            <div class="detail-section">
              <h4>拍摄信息</h4>
              <p>合作演员：${itemData.actor}</p>
              <p>拍摄地点：${itemData.location}</p>
              <p>报酬：${itemData.payment}</p>
            </div>
          `;
          break;
        case 'customization':
          title = `${itemData.fanId} 的定制`;
          detailHtml = `
            <div class="detail-section">
              <h4>定制类型</h4>
              <p>${itemData.typeName}</p>
            </div>
            <div class="detail-section">
              <h4>需求详情</h4>
              <p>${itemData.request}</p>
            </div>
            <div class="detail-section">
              <h4>其他信息</h4>
              <p>截止时间：${itemData.deadline}</p>
              <p>报酬：${itemData.payment}</p>
              <p>备注：${itemData.notes}</p>
            </div>
          `;
          break;
        case 'theater':
          title = itemData.title;
          detailHtml = `
            <div class="cover-image" style="background-image: url('${itemData.cover || 'https://picsum.photos/400/200?random=200'}')"></div>
            <div class="detail-section">
              <h4>作品简介</h4>
              <p>${itemData.description}</p>
            </div>
            <div class="detail-section">
              <h4>数据信息</h4>
              <p>热度：${itemData.popularity}</p>
              <p>收藏：${itemData.favorites}</p>
              <p>观看：${itemData.views}</p>
              <p>价格：${itemData.price}</p>
            </div>
          `;
          // 解析评论
          if (itemData.reviews) {
            try {
              const reviews = JSON.parse(itemData.reviews.replace(/'/g, '"'));
              const reviewHtml = reviews.map(r => `
                <div class="comment">
                  <span class="comment-user">${r.user}：</span>
                  <span>${r.text}</span>
                </div>
              `).join('');
              detailHtml += `<div class="detail-section"><h4>观众评论</h4>${reviewHtml}</div>`;
            } catch (e) {
              console.warn('[YuseTheater] 解析评论失败:', e);
            }
          }
          break;
        case 'shop':
          title = itemData.name;
          detailHtml = `
            <div class="detail-section">
              <h4>商品介绍</h4>
              <p>${itemData.description}</p>
            </div>
            <div class="detail-section">
              <h4>价格信息</h4>
              <p>基础价：${itemData.price}</p>
              <p>当前最高价：${itemData.highestBid}</p>
            </div>
          `;
          // 解析商品评论
          if (itemData.comments) {
            try {
              const comments = JSON.parse(itemData.comments.replace(/'/g, '"'));
              const commentHtml = comments.map(c => `
                <div class="comment">
                  <span class="comment-user">${c.user}：</span>
                  <span>${c.text}</span>
                </div>
              `).join('');
              detailHtml += `<div class="detail-section"><h4>买家评论</h4>${commentHtml}</div>`;
            } catch (e) {
              console.warn('[YuseTheater] 解析商品评论失败:', e);
            }
          }
          break;
      }
      // 创建详情弹窗
      const modal = document.createElement('div');
      modal.className = 'yuse-modal';
      modal.innerHTML = `
        <div class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>${title}</h3>
              <button class="close-btn">×</button>
            </div>
            <div class="modal-body">${detailHtml}</div>
            <div class="modal-footer">
              <button class="close-modal-btn">关闭</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      // 绑定弹窗事件
      setTimeout(() => {
        modal.querySelector('.modal-overlay').classList.add('visible');
        modal.querySelectorAll('.close-btn, .close-modal-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            modal.querySelector('.modal-overlay').classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
          });
        });
      }, 100);
    }
    // 更新头部标题
    updateHeader() {
      if (window.mobilePhone && window.mobilePhone.updateAppHeader) {
        window.mobilePhone.updateAppHeader({
          app: 'yuse-theater',
          title: window.YuseTheaterPages[this.currentView].name,
          view: this.currentView
        });
      }
    }
    // 显示提示消息
    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'yuse-toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 100);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }
    // 销毁应用（清理资源）
    destroy() {
      this.isAutoRender = false;
      console.log('[YuseTheater] 销毁欲色剧场 App');
    }
  }
    // 全局类挂载
  window.YuseTheaterApp = YuseTheaterApp;
  // 初始化示例逻辑
  console.log('[YuseTheater] 初始化 app 实例（依赖已内置）');
  window.yuseTheaterApp = new YuseTheaterApp();
}; 
// 全局调用接口
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
window.refreshYuseTheaterPage = function (pageKey) {
  if (window.yuseTheaterApp) {
    window.yuseTheaterApp.sendRefreshRequest(pageKey);
  }
};
console.log('[YuseTheater] 欲色剧场 App 脚本加载完成（等待依赖初始化）');

