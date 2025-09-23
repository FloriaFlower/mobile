if (typeof window.YuseTheaterApp === 'undefined') {
  window.YuseTheaterApp = class {
    constructor() {
      this.currentView = 'announcements';
      this.savedData = {
        announcements: [],
        customizations: [],
        theater: [],
        theaterHot: [],
        theaterNew: [],
        theaterRecommended: [],
        theaterPaid: [],
        shop: []
      };
      this.init();
    }

    init() {
      this.parseYuseData();
      this.renderApp();
      this.bindEvents();
    }

    parseYuseData() {
      const yuseData = document.querySelector('yuse_data');
      if (!yuseData) return this.showEmptyState();

      // 解析各模块数据（直接读取HTML结构）
      this.savedData.announcements = Array.from(yuseData.querySelectorAll('announcements > .list-item'))
        .map(this.parseListItem.bind(this, 'announcement'));
      
      this.savedData.customizations = Array.from(yuseData.querySelectorAll('customizations > .list-item'))
        .map(this.parseListItem.bind(this, 'customization'));
      
      this.savedData.theater = Array.from(yuseData.querySelectorAll('theater > .list-item'))
        .map(this.parseListItem.bind(this, 'theater'));
      
      this.savedData.theaterHot = Array.from(yuseData.querySelectorAll('theater_hot > .list-item'))
        .map(this.parseListItem.bind(this, 'theater'));
      
      this.savedData.theaterNew = Array.from(yuseData.querySelectorAll('theater_new > .list-item'))
        .map(this.parseListItem.bind(this, 'theater'));
      
      this.savedData.theaterRecommended = Array.from(yuseData.querySelectorAll('theater_recommended > .list-item'))
        .map(this.parseListItem.bind(this, 'theater'));
      
      this.savedData.theaterPaid = Array.from(yuseData.querySelectorAll('theater_paid > .list-item'))
        .map(this.parseListItem.bind(this, 'theater'));
      
      this.savedData.shop = Array.from(yuseData.querySelectorAll('shop > .list-item'))
        .map(this.parseListItem.bind(this, 'shop'));
    }

    parseListItem(type, element) {
      const data = element.dataset;
      return `
        <div class="list-item" data-type="${type}" ${Object.entries(data).map(([k, v]) => `data-${k}="${v}"`).join(' ')}>
          ${element.querySelector('.item-title').innerHTML}
          ${element.querySelector('.item-meta').innerHTML}
          ${element.querySelector('.item-actions')?.outerHTML || ''}
        </div>
      `;
    }

    renderApp() {
      const appHTML = `
        <div class="yuse-theater-app">
          <div class="yuse-content-area">${this.renderCurrentPage()}</div>
          ${this.renderNavBar()}
        </div>
      `;
      
      document.getElementById('app-content') ||= document.createElement('div');
      document.getElementById('app-content').innerHTML = appHTML;
      this.bindEvents();
    }

    renderCurrentPage() {
      switch (this.currentView) {
        case 'announcements':
          return `<div class="yuse-announcement-list">${this.savedData.announcements.join('')}</div>`;
        case 'customizations':
          return `<div class="yuse-customization-list">${this.savedData.customizations.join('')}</div>`;
        case 'theater':
          return `
            <div class="theater-filters">
              <button class="filter-btn" data-filter="hot">🔥 最热</button>
              <button class="filter-btn" data-filter="new">🆕 最新</button>
              <button class="filter-btn" data-filter="recommended">❤️ 推荐</button>
              <button class="filter-btn" data-filter="paid">💸 高价定制</button>
            </div>
            <div class="yuse-theater-list" id="theater-list">${this.savedData.theater.join('')}</div>
          `;
        case 'shop':
          return `<div class="yuse-shop-list">${this.savedData.shop.join('')}</div>`;
        default:
          return '<div class="empty-state">页面未找到</div>';
      }
    }

    renderNavBar() {
      return `
        <div class="yuse-nav-bar">
          ${Object.entries(window.YuseTheaterPages).map(([key, { name, icon }]) => `
            <button class="yuse-nav-btn ${this.currentView === key ? 'active' : ''}" 
                    onclick="yuseTheaterApp.switchView('${key}')">
              ${icon} ${name}
            </button>
          `).join('')}
        </div>
      `;
    }

    switchView(pageKey) {
      this.currentView = pageKey;
      this.renderApp();
      this.scrollToTop();
    }

    bindEvents() {
      document.querySelector('.yuse-theater-app').addEventListener('click', (e) => {
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
          this.showModal(item);
        }

        // 筛选按钮
        if (e.target.matches('.filter-btn') && this.currentView === 'theater') {
          this.filterTheater(e.target.dataset.filter);
        }
      });
    }

    handleAccept(item) {
      const type = item.dataset.type;
      const data = {
        announcement: `[通告|${item.dataset.title}|${item.dataset.description}|${item.dataset.actor}|${item.dataset.location}|${item.dataset.payment}]`,
        customization: `[定制|${item.dataset.typeName}|${item.dataset.request}|${item.dataset.fanId}|${item.dataset.deadline}|${item.dataset.notes}|${item.dataset.payment}]`
      }[type];
      
      if (data) {
        this.sendToInput(data);
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);
      }
    }

    showModal(item) {
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
              <h3>${data.title}</h3>
              <p>剧情：${data.description}</p>
              <p>地点：${data.location}</p>
              <p>演员：${data.actor}</p>
              <p>片酬：${data.payment}</p>
              <button class="accept-btn" onclick="yuseTheaterApp.handleAccept(this.closest('.list-item'))">接取</button>
            </div>
          `;
        case 'customization':
          return `
            <div class="modal-content">
              <h3>${data.fanId} 的定制</h3>
              <p>类型：${data.typeName}</p>
              <p>要求：${data.request}</p>
              <p>截止：${data.deadline}</p>
              <p>报酬：${data.payment}</p>
              <p>备注：${data.notes}</p>
              <button class="accept-btn">接取</button>
            </div>
          `;
        case 'theater':
          return `
            <div class="modal-content">
              <h3>${data.title}</h3>
              <img src="${data.cover}" class="cover-image">
              <p>简介：${data.description}</p>
              <p>人气：${data.popularity}</p>
              <p>收藏：${data.favorites}</p>
              <p>价格：${data.price}</p>
              <div class="comments">${this.renderReviews(data.reviews)}</div>
            </div>
          `;
        case 'shop':
          return `
            <div class="modal-content">
              <h3>${data.name}</h3>
              <p>描述：${data.description}</p>
              <p>价格：${data.price}</p>
              <p>最高竞价：${data.highestBid}</p>
              <div class="comments">${this.renderComments(data.comments)}</div>
            </div>
          `;
        default:
          return '<div class="modal-content">暂无详情</div>';
      }
    }

    renderReviews(reviewsStr) {
      try {
        return JSON.parse(reviewsStr.replace(/'/g, '"')).map(rev => `
          <div class="comment">
            <span class="user">${rev.user}:</span> ${rev.text}
          </div>
        `).join('');
      } catch {
        return '<div class="comment">评论加载失败</div>';
      }
    }

    filterTheater(filter) {
      const theaterList = document.getElementById('theater-list');
      theaterList.innerHTML = this.savedData[`theater${filter.charAt(0).toUpperCase() + filter.slice(1)}`].join('');
    }

    sendToInput(message) {
      const textarea = document.querySelector('#send_textarea');
      if (textarea) {
        textarea.value += `\n${message}`;
        textarea.dispatchEvent(new Event('input'));
        textarea.scrollIntoView({ behavior: 'smooth' });
      }
    }

    scrollToTop() {
      document.querySelector('.yuse-content-area').scrollTop = 0;
    }

    showEmptyState() {
      document.getElementById('app-content').innerHTML = '<div class="empty-state">未检测到欲色剧场数据，请发送样板数据</div>';
    }
  };

  // 初始化配置
  window.YuseTheaterPages = {
    announcements: { name: "通告拍摄", icon: '📢' },
    customizations: { name: "粉丝定制", icon: '💖' },
    theater: { name: "剧场列表", icon: '🎬' },
    shop: { name: "欲色商城", icon: '🛒' }
  };

  window.yuseTheaterApp = new window.YuseTheaterApp();
}

// 兼容手机模拟器插件
window.getYuseTheaterAppContent = () => document.getElementById('app-content')?.innerHTML || '';
window.bindYuseTheaterEvents = () => {};
