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

    // 渲染主界面：返回HTML字符串（确保DOM正确挂载）
    renderMainContent() {
      const appContentEl = document.getElementById('app-content');
      if (!appContentEl) return '';

      // 主界面HTML（2×2入口网格，洛可可风）
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

      appContentEl.innerHTML = mainHtml;
      return mainHtml;
    }

    // 绑定入口点击事件：调用 mobile-phone.js 正规的 openApp() 方法（核心修复）
    bindEntryEvents() {
      const entryCards = document.querySelectorAll('.yuse-entry-card');
      entryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
          const module = e.currentTarget.dataset.module;
          this.currentActiveModule = module;

          // 激活当前卡片样式
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');

          try {
            // 关键：按模块映射到正确的APP名称（对应 mobile-phone.js 里注册的APP名）
            const appMap = {
              theater: 'yuse-theater', // mobile-phone.js 里注册的剧场APP名
              live: 'live' // mobile-phone.js 里注册的直播APP名
            };
            const targetApp = appMap[module];
            if (!targetApp) {
              this.showUnfinishedTip();
              return;
            }

            // 1. 加载对应APP的脚本（确保依赖就绪）
            if (module === 'theater') {
              await window.mobilePhone.loadYuseTheaterApp();
            } else if (module === 'live') {
              await window.mobilePhone.loadLiveApp();
            }

            // 2. 调用 mobile-phone.js 正规的 openApp() 方法（触发完整跳转流程）
            // 这个方法会自动清空应用栈、设置 currentApp、更新Header、渲染页面
            window.mobilePhone.openApp(targetApp);
            console.log(`[欲色APP] 触发跳转：${targetApp}（通过openApp正规流程）`);

          } catch (error) {
            // 加载失败提示（显示在应用容器内）
            const appContentEl = document.getElementById('app-content');
            appContentEl.innerHTML = `
              <div class="yuse-error" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; padding: 20px;">
                <div class="error-icon" style="font-size: 36px; color: #ff4757;">❌</div>
                <p style="font-size: 16px; color: #2d3748;">${module === 'theater' ? '剧场' : '直播'}跳转失败</p>
                <p style="font-size: 12px; color: #718096;">${error.message}</p>
                <button onclick="window.mobilePhone.handleYuseApp()" style="padding: 6px 12px; border: none; border-radius: 6px; background: #D4AF37; color: white; cursor: pointer;">返回欲色主界面</button>
              </div>
            `;
            console.error(`[欲色APP] ${module}跳转失败:`, error);
          }
        });
      });
    }

    // 洛可可风动态装饰
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

    // 待开发模块提示
    showUnfinishedTip() {
      const tip = document.createElement('div');
      tip.className = 'yuse-tip';
      tip.innerHTML = `
        <div class="tip-content" style="background: #FFF8E1; border: 2px solid #D4AF37; border-radius: 10px; padding: 15px 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <div class="tip-icon" style="font-size: 24px; color: #D4AF37; margin-bottom: 5px; text-align: center;">🎀</div>
          <p style="margin: 0; color: #2d3748; text-align: center;">该模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～</p>
        </div>
      `;
      document.body.appendChild(tip);
      setTimeout(() => tip.remove(), 2000);
    }
  }

  // 全局实例化
  window.YuseApp = new YuseApp();
}

// 全局函数：供 mobile-phone.js 调用，每次重新渲染主界面
window.getYuseAppContent = () => {
  if (window.YuseApp) {
    return window.YuseApp.renderMainContent();
  } else {
    window.YuseApp = new YuseApp();
    return window.YuseApp.renderMainContent();
  }
};
