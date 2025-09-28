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

    // 绑定入口事件：复用mobile-phone的openApp跳转（同论坛→API的逻辑）
    bindEntryEvents() {
      const entryCards = document.querySelectorAll('.yuse-entry-card');
      entryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
          const module = e.currentTarget.dataset.module;
          this.currentActiveModule = module;
          // 激活当前卡片样式
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');

          // 核心修改：参考论坛跳API的方式，直接调用mobile-phone的openApp打开对应子应用
          try {
            // 确保mobilePhone实例存在
            if (!window.mobilePhone || !window.mobilePhone.openApp) {
              throw new Error('手机模拟器核心实例未加载');
            }

            switch (module) {
              case 'theater':
                // 打开「欲色剧场」应用（复用mobile-phone已注册的app）
                window.mobilePhone.openApp('yuse-theater');
                console.log('[欲色APP] 跳转至欲色剧场应用');
                break;
              case 'live':
                // 打开「直播」应用（复用mobile-phone已注册的app）
                window.mobilePhone.openApp('live');
                console.log('[欲色APP] 跳转至直播应用');
                break;
              case 'aoka':
              case 'yucy':
                this.showUnfinishedTip();
                break;
            }
          } catch (error) {
            // 显示错误提示
            document.getElementById('app-content').innerHTML = `
              <div class="yuse-error">
                <div class="error-icon">❌</div>
                <p>跳转失败：${error.message}</p>
                <button class="retry-btn" onclick="window.YuseApp.init()">重试</button>
              </div>
            `;
            console.error('[欲色APP] 跳转错误:', error);
          }
        });
      });
    }

    // 装饰效果：保持原有逻辑
    addModuleDecoration(module) {
      const container = document.querySelector('.yuse-theater-app, .live-app');
      if (container) {
        container.classList.add('loco-module-border');
        if (module === 'theater') container.style.borderColor = '#9370DB';
        if (module === 'live') container.style.borderColor = '#E0F7FA';
      }
    }

    // 装饰效果：保持原有逻辑
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

    // 未完成提示：保持原有逻辑
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

// 关键修复：每次调用都重新渲染，不依赖旧DOM（保持原有逻辑）
window.getYuseAppContent = () => {
  if (window.YuseApp) {
    return window.YuseApp.renderMainContent();
  } else {
    window.YuseApp = new YuseApp();
    return window.YuseApp.renderMainContent();
  }
};
