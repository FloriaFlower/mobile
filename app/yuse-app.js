if (typeof window.YuseApp === 'undefined') {
  class YuseApp {
    constructor() {
      this.currentActiveModule = null;
      this.init();
    }
    // 初始化：渲染+绑定事件（支持重复调用）
    init() {
      console.log('[欲色APP] 初始化主界面');
      this.renderMainContent(); // 每次都重新渲染DOM
      this.bindEntryEvents();
      this.addLocoDecoration();
    }
    // 渲染主界面：返回HTML字符串（而非依赖现有DOM）
    renderMainContent() {
      const appContent = document.getElementById('app-content');
      if (!appContent) return ''; // 防止DOM不存在时报错
      // 主界面HTML（直接返回字符串，供getYuseAppContent调用）
      const mainHtml = `
        <div class="yuse-container">
          <div class="yuse-top-decoration">
            <div class="gold-curve left"></div>
            <h1 class="yuse-title">欲色</h1>
            <div class="gold-curve right"></div>
          </div>
          <div class="yuse-entry-grid">
            <div class="yuse-entry-card" data-module="aoka">
              <div class="entry-icon">🎀</div>
              <div class="entry-name">嗷咔</div>
              <div class="loco-border"></div>
            </div>
            <div class="yuse-entry-card" data-module="theater">
              <div class="entry-icon">🎞️</div>
              <div class="entry-name">剧场</div>
              <div class="loco-border"></div>
            </div>
            <div class="yuse-entry-card" data-module="yucy">
              <div class="entry-icon">✨</div>
              <div class="entry-name">欲次元</div>
              <div class="loco-border"></div>
            </div>
            <div class="yuse-entry-card" data-module="live">
              <div class="entry-icon">📺</div>
              <div class="entry-name">直播</div>
              <div class="loco-border"></div>
            </div>
          </div>
          <div class="yuse-bottom-pattern"></div>
        </div>
      `;
      appContent.innerHTML = mainHtml;
      return mainHtml; // 返回HTML，供全局函数使用
    }
    // 绑定入口事件：复用openApp跳转
    bindEntryEvents() {
      const entryCards = document.querySelectorAll('.yuse-entry-card');
      entryCards.forEach(card => {
        card.addEventListener('click', (e) => {
          const module = e.currentTarget.dataset.module;
          this.currentActiveModule = module;
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');

          // 核心：直接调用openApp打开目标APP，框架自动加载脚本+渲染
          switch (module) {
            case 'theater':
              window.mobilePhone.openApp('yuse-theater');
              break;
            case 'live':
              window.mobilePhone.openApp('live');
              break;
            case 'aoka':
            case 'yucy':
              this.showUnfinishedTip();
              break;
          }
        });
      });
    }

    // 加载剧场模块：确保依赖函数存在
    async loadTheaterModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载剧场内容...</p>
        </div>
      `;
      // 检查全局函数是否存在（加载脚本后才会有）
      if (!window.getYuseTheaterAppContent || !window.bindYuseTheaterEvents) {
        throw new Error('剧场脚本未加载完成');
      }
      const theaterContent = window.getYuseTheaterAppContent();
      appContent.innerHTML = theaterContent;
      window.bindYuseTheaterEvents();
      this.addModuleDecoration('theater');
      console.log('[欲色APP] 剧场模块加载完成');
    }
    // 加载直播模块：确保依赖函数存在
    async loadLiveModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载直播内容...</p>
        </div>
      `;
      // 检查全局函数是否存在（加载脚本后才会有）
      if (!window.getLiveAppContent || !window.bindLiveAppEvents) {
        throw new Error('直播脚本未加载完成');
      }
      const liveContent = window.getLiveAppContent();
      appContent.innerHTML = liveContent;
      window.bindLiveAppEvents();
      this.addModuleDecoration('live');
      console.log('[欲色APP] 直播模块加载完成');
    }
    // 以下方法（addModuleDecoration、addLocoDecoration、showUnfinishedTip）保持不变
    addModuleDecoration(module) {
      const container = document.querySelector('.yuse-theater-app, .live-app');
      if (container) {
        container.classList.add('loco-module-border');
        if (module === 'theater') container.style.borderColor = '#9370DB';
        if (module === 'live') container.style.borderColor = '#E0F7FA';
      }
    }
    addLocoDecoration() {
      const curves = document.querySelectorAll('.gold-curve');
      curves.forEach((curve, idx) => {
        setInterval(() => {
          curve.style.transform = idx === 0 
            ? `rotateZ(${Math.sin(Date.now()/1000)*5}deg)` 
            : `rotateZ(${-Math.sin(Date.now()/1000)*5}deg)`;
        }, 100);
      });
      const bottomPattern = document.querySelector('.yuse-bottom-pattern');
      let hue = 30;
      setInterval(() => {
        hue = (hue + 1) % 360;
        bottomPattern.style.background = `linear-gradient(45deg, 
          hsla(${hue}, 70%, 60%, 0.3), 
          hsla(${hue+30}, 70%, 60%, 0.2))`;
      }, 5000);
    }
    showUnfinishedTip() {
      const tip = document.createElement('div');
      tip.className = 'yuse-tip';
      tip.innerHTML = `
        <div class="tip-content">
          <div class="tip-icon">🎀</div>
          <p>该模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～</p>
        </div>
      `;
      document.body.appendChild(tip);
      setTimeout(() => tip.remove(), 2000);
    }
  }
  // 全局实例化
  window.YuseApp = new YuseApp();
}
// 关键修复：每次调用都重新渲染，不依赖旧DOM
window.getYuseAppContent = () => {
  // 若实例已存在，重新初始化；若不存在，创建新实例
  if (window.YuseApp) {
    return window.YuseApp.renderMainContent();
  } else {
    window.YuseApp = new YuseApp();
    return window.YuseApp.renderMainContent();
  }
};
