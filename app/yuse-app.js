if (typeof window.YuseApp === 'undefined') {
  class YuseApp {
    constructor() {
      this.currentActiveModule = null;
      this.init();
    }
    // 初始化：渲染+绑定事件（支持重复调用）
    init() {
      console.log('[欲色APP] 初始化主界面');
      this.renderMainContent(); // 每次都重新生成DOM，避免依赖旧元素
      this.bindEntryEvents();
      this.addLocoDecoration();
    }
    // 渲染主界面：返回HTML字符串（确保DOM完全重建）
    renderMainContent() {
      const appContent = document.getElementById('app-content');
      if (!appContent) return ''; // 防止DOM不存在时报错
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
      return mainHtml;
    }
    // 绑定入口事件：对齐mobile-phone.js的嵌套APP逻辑（参考论坛→API的跳转）
    bindEntryEvents() {
      const entryCards = document.querySelectorAll('.yuse-entry-card');
      entryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
          const module = e.currentTarget.dataset.module;
          this.currentActiveModule = module;
          // 激活当前卡片样式
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');

          // 核心修复：1. 确保mobilePhone实例存在 2. 加载脚本后调用对应handle方法（复用已有逻辑）
          if (!window.mobilePhone) {
            this.showError('手机模拟器核心实例未找到，请刷新页面');
            return;
          }

          try {
            switch (module) {
              case 'theater':
                // 步骤1：加载剧场脚本（对齐mobile-phone.js的loadYuseTheaterApp路径）
                console.log('[欲色APP] 触发加载剧场脚本');
                await window.mobilePhone.loadYuseTheaterApp();
                // 步骤2：调用mobile-phone.js中已有的剧场渲染逻辑（避免重复造轮子）
                await window.mobilePhone.handleYuseTheaterApp();
                // 步骤3：更新APP头部标题（对齐整体风格）
                window.mobilePhone.updateAppHeader({
                  app: 'yuse-theater',
                  title: '欲色剧场',
                  view: 'main'
                });
                break;

              case 'live':
                // 步骤1：加载直播脚本（对齐mobile-phone.js的loadLiveApp路径）
                console.log('[欲色APP] 触发加载直播脚本');
                await window.mobilePhone.loadLiveApp();
                // 步骤2：调用mobile-phone.js中已有的直播渲染逻辑
                await window.mobilePhone.handleLiveApp();
                // 步骤3：更新APP头部标题
                window.mobilePhone.updateAppHeader({
                  app: 'live',
                  title: '直播',
                  view: 'start'
                });
                break;

              case 'aoka':
              case 'yucy':
                this.showUnfinishedTip();
                break;
            }
          } catch (error) {
            // 错误捕获：明确提示脚本加载失败（便于排查路径问题）
            this.showError(`${module === 'theater' ? '剧场' : '直播'}加载失败：${error.message}\n请检查脚本路径是否正确`);
            console.error(`[欲色APP] ${module}加载错误:`, error);
          }
        });
      });
    }
    // 加载剧场模块（备用：若需直接调用，确保依赖加载完成）
    async loadTheaterModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载剧场内容...</p>
        </div>
      `;
      // 检查全局函数（确保脚本已加载）
      if (!window.getYuseTheaterAppContent || !window.bindYuseTheaterEvents) {
        throw new Error('yuse-theater-app.js 未加载或全局函数缺失');
      }
      const theaterContent = window.getYuseTheaterAppContent();
      appContent.innerHTML = theaterContent;
      window.bindYuseTheaterEvents();
      this.addModuleDecoration('theater');
      console.log('[欲色APP] 剧场模块渲染完成');
    }
    // 加载直播模块（备用：同上）
    async loadLiveModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载直播内容...</p>
        </div>
      `;
      if (!window.getLiveAppContent || !window.bindLiveAppEvents) {
        throw new Error('live-app.js 未加载或全局函数缺失');
      }
      const liveContent = window.getLiveAppContent();
      appContent.innerHTML = liveContent;
      window.bindLiveAppEvents();
      this.addModuleDecoration('live');
      console.log('[欲色APP] 直播模块渲染完成');
    }
    // 模块装饰样式
    addModuleDecoration(module) {
      const container = document.querySelector('.yuse-theater-app, .live-app');
      if (container) {
        container.classList.add('loco-module-border');
        container.style.borderColor = module === 'theater' ? '#9370DB' : '#E0F7FA';
      }
    }
    // 顶部装饰动画
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
    // 未完成模块提示
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
    // 错误提示（替代原innerHTML直接替换，更友好）
    showError(message) {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-error">
          <div class="error-icon">❌</div>
          <p>${message}</p>
          <button class="retry-btn" onclick="window.YuseApp.init()">重新加载欲色APP</button>
        </div>
      `;
      // 添加错误样式
      const style = document.createElement('style');
      style.textContent = `
        .yuse-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; gap: 16px; padding: 20px; text-align: center; }
        .error-icon { font-size: 48px; color: #ff4444; }
        .retry-btn { padding: 8px 16px; border: none; border-radius: 8px; background: #007AFF; color: white; cursor: pointer; }
      `;
      document.head.appendChild(style);
    }
  }
  // 全局实例化（确保每次调用都能获取到）
  window.YuseApp = new YuseApp();
}
// 全局函数：每次调用都重新渲染（对齐mobile-phone.js的自定义APP逻辑）
window.getYuseAppContent = () => {
  if (window.YuseApp) {
    window.YuseApp.init(); // 重新初始化，确保DOM和事件都生效
    return window.YuseApp.renderMainContent();
  } else {
    window.YuseApp = new YuseApp();
    return window.YuseApp.renderMainContent();
  }
};
