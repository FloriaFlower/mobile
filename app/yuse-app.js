if (typeof window.YuseApp === 'undefined') {
  class YuseApp {
    constructor() {
      this.currentActiveModule = null; // 记录当前激活模块
      this.init();
    }

    // 初始化：每次调用都重新渲染DOM+绑定事件（支持重复进入）
    init() {
      console.log('[欲色APP] 初始化主界面');
      this.renderMainContent();
      this.bindEntryEvents();
      this.addLocoDecoration();
    }

    // 渲染主界面：直接生成HTML，不依赖残留DOM
    renderMainContent() {
      const appContent = document.getElementById('app-content');
      if (!appContent) return '';

      // 洛可可风主界面HTML（2×2入口网格）
      const mainHtml = `
        <div class="yuse-container">
          <!-- 顶部金色曲线装饰 -->
          <div class="yuse-top-decoration">
            <div class="gold-curve left"></div>
            <h1 class="yuse-title">欲色</h1>
            <div class="gold-curve right"></div>
          </div>

          <!-- 功能入口网格 -->
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

          <!-- 底部流动花纹 -->
          <div class="yuse-bottom-pattern"></div>
        </div>
      `;

      appContent.innerHTML = mainHtml;
      return mainHtml; // 供全局函数调用返回
    }

    // 绑定入口点击事件：加载脚本+调用mobile-phone.js的处理器
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
            // 关键：调用mobile-phone.js的对应模块处理器（复用现有逻辑）
            switch (module) {
              case 'theater':
                // 1. 加载欲色剧场脚本
                await window.mobilePhone.loadYuseTheaterApp();
                // 2. 调用剧场处理器（渲染剧场页面）
                window.mobilePhone.handleYuseTheaterApp();
                break;

              case 'live':
                // 1. 加载直播脚本
                await window.mobilePhone.loadLiveApp();
                // 2. 调用直播处理器（渲染直播页面）
                window.mobilePhone.handleLiveApp();
                break;

              case 'aoka':
              case 'yucy':
                this.showUnfinishedTip();
                break;
            }
          } catch (error) {
            // 加载失败提示
            const appContent = document.getElementById('app-content');
            appContent.innerHTML = `
              <div class="yuse-error" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; padding: 20px;">
                <div class="error-icon" style="font-size: 36px; color: #ff4757;">❌</div>
                <p style="font-size: 16px; color: #2d3748;">${module === 'theater' ? '剧场' : '直播'}加载失败</p>
                <p style="font-size: 12px; color: #718096;">${error.message}</p>
                <button onclick="window.mobilePhone.handleYuseApp()" style="padding: 6px 12px; border: none; border-radius: 6px; background: #D4AF37; color: white; cursor: pointer;">返回主界面</button>
              </div>
            `;
            console.error(`[欲色APP] ${module}加载失败:`, error);
          }
        });
      });
    }

    // 给子模块添加洛可可风边框
    addModuleDecoration(module) {
      const container = document.querySelector('.yuse-theater-app, .live-app');
      if (container) {
        container.classList.add('loco-module-border');
        container.style.borderColor = module === 'theater' ? '#9370DB' : '#E0F7FA';
      }
    }

    // 洛可可风动态装饰（顶部曲线摆动+底部花纹渐变）
    addLocoDecoration() {
      // 顶部曲线左右摆动
      const curves = document.querySelectorAll('.gold-curve');
      curves.forEach((curve, idx) => {
        setInterval(() => {
          curve.style.transform = idx === 0 
            ? `rotateZ(${Math.sin(Date.now()/1000)*5}deg)` 
            : `rotateZ(${-Math.sin(Date.now()/1000)*5}deg)`;
        }, 100);
      });

      // 底部花纹颜色流动
      const bottomPattern = document.querySelector('.yuse-bottom-pattern');
      let hue = 30; // 暖金色调
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

  // 全局实例化（供外部调用）
  window.YuseApp = new YuseApp();
}

// 全局函数：供mobile-phone.js调用，每次都重新渲染主界面
window.getYuseAppContent = () => {
  if (window.YuseApp) {
    // 已存在实例：重新初始化（避免DOM残留问题）
    return window.YuseApp.renderMainContent();
  } else {
    // 不存在实例：创建新实例
    window.YuseApp = new YuseApp();
    return window.YuseApp.renderMainContent();
  }
};
