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

      // 主界面HTML（2×2入口网格）
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
      return mainHtml; // 供全局函数使用
    }

    // 绑定入口事件：强制触发脚本加载+日志排查
    bindEntryEvents() {
      const entryCards = document.querySelectorAll('.yuse-entry-card');
      entryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
          const module = e.currentTarget.dataset.module;
          this.currentActiveModule = module;

          // 激活当前卡片样式
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');

          // 关键：先检查window.mobilePhone是否存在（避免调用失败）
          if (!window.mobilePhone) {
            console.error('[欲色APP] 错误：window.mobilePhone 未挂载！无法加载子模块');
            this.showErrorTip(`${module === 'theater' ? '剧场' : '直播'}加载失败：核心模块未就绪`);
            return;
          }

          try {
            console.log(`[欲色APP] 点击${module === 'theater' ? '剧场' : '直播'}，开始加载对应脚本`);
            
            // 1. 强制加载对应子模块脚本（确保触发Network请求）
            switch (module) {
              case 'theater':
                // 检查是否有加载方法，无则报错
                if (typeof window.mobilePhone.loadYuseTheaterApp !== 'function') {
                  throw new Error('mobile-phone.js 中未找到 loadYuseTheaterApp 方法');
                }
                // 执行加载（等待脚本加载完成）
                await window.mobilePhone.loadYuseTheaterApp();
                // 加载完成后，调用mobile-phone的剧场处理器
                window.mobilePhone.handleYuseTheaterApp();
                console.log('[欲色APP] 剧场脚本加载完成，已调用处理器');
                break;

              case 'live':
                // 检查是否有加载方法，无则报错
                if (typeof window.mobilePhone.loadLiveApp !== 'function') {
                  throw new Error('mobile-phone.js 中未找到 loadLiveApp 方法');
                }
                // 执行加载（等待脚本加载完成）
                await window.mobilePhone.loadLiveApp();
                // 加载完成后，调用mobile-phone的直播处理器
                window.mobilePhone.handleLiveApp();
                console.log('[欲色APP] 直播脚本加载完成，已调用处理器');
                break;

              case 'aoka':
              case 'yucy':
                this.showUnfinishedTip();
                break;
            }
          } catch (error) {
            console.error(`[欲色APP] ${module === 'theater' ? '剧场' : '直播'}加载失败：`, error);
            // 显示具体错误信息，便于排查
            document.getElementById('app-content').innerHTML = `
              <div class="yuse-error" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; padding: 20px;">
                <div class="error-icon" style="font-size: 36px; color: #ff4757;">❌</div>
                <p style="font-size: 16px; color: #2d3748;">${module === 'theater' ? '剧场' : '直播'}加载失败</p>
                <p style="font-size: 12px; color: #718096; text-align: center;">${error.message}</p>
                <button onclick="window.mobilePhone.handleYuseApp()" style="padding: 6px 12px; border: none; border-radius: 6px; background: #D4AF37; color: white; cursor: pointer;">返回主界面</button>
              </div>
            `;
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

    // 通用错误提示
    showErrorTip(message) {
      const tip = document.createElement('div');
      tip.className = 'yuse-tip';
      tip.innerHTML = `
        <div class="tip-content" style="background: #ffebee; border: 2px solid #ff4757; border-radius: 10px; padding: 15px 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <div class="tip-icon" style="font-size: 24px; color: #ff4757; margin-bottom: 5px; text-align: center;">❌</div>
          <p style="margin: 0; color: #2d3748; text-align: center;">${message}</p>
        </div>
      `;
      document.body.appendChild(tip);
      setTimeout(() => tip.remove(), 3000);
    }
  }

  // 全局实例化（供外部调用）
  window.YuseApp = new YuseApp();
}

// 关键修复：每次调用都重新渲染，不依赖旧DOM
window.getYuseAppContent = () => {
  console.log('[欲色APP] 调用 getYuseAppContent，重新渲染主界面');
  if (window.YuseApp) {
    // 已存在实例：重新初始化（避免DOM残留问题）
    return window.YuseApp.renderMainContent();
  } else {
    // 不存在实例：创建新实例
    window.YuseApp = new YuseApp();
    return window.YuseApp.renderMainContent();
  }
};
