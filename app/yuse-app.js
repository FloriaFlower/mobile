if (typeof window.YuseApp === 'undefined') {
  class YuseApp {
    constructor() {
      this.currentActiveModule = null; // 记录当前激活的子模块（剧场/直播等）
      this.init();
    }

    // 初始化：渲染主界面+绑定事件
    init() {
      console.log('[欲色APP] 初始化主界面');
      this.renderMainContent();
      this.bindEntryEvents();
      this.addLocoDecoration(); // 添加Rococo风动态装饰
    }

    // 渲染主界面（2×2网格入口）
    renderMainContent() {
      const appContent = document.getElementById('app-content');
      if (!appContent) return;

      // 主界面HTML：带Rococo风容器与卡片
      appContent.innerHTML = `
        <div class="yuse-container">
          <!-- Rococo风顶部装饰 -->
          <div class="yuse-top-decoration">
            <div class="gold-curve left"></div>
            <h1 class="yuse-title">欲色</h1>
            <div class="gold-curve right"></div>
          </div>

          <!-- 入口卡片网格 -->
          <div class="yuse-entry-grid">
            <!-- 嗷咔入口（待开发，占位） -->
            <div class="yuse-entry-card" data-module="aoka">
              <div class="entry-icon">🎀</div>
              <div class="entry-name">嗷咔</div>
              <div class="loco-border"></div>
            </div>

            <!-- 剧场入口（调用现成剧场功能） -->
            <div class="yuse-entry-card" data-module="theater">
              <div class="entry-icon">🎞️</div>
              <div class="entry-name">剧场</div>
              <div class="loco-border"></div>
            </div>

            <!-- 欲次元入口（待开发，占位） -->
            <div class="yuse-entry-card" data-module="yucy">
              <div class="entry-icon">✨</div>
              <div class="entry-name">欲次元</div>
              <div class="loco-border"></div>
            </div>

            <!-- 直播入口（调用现成直播功能） -->
            <div class="yuse-entry-card" data-module="live">
              <div class="entry-icon">📺</div>
              <div class="entry-name">直播</div>
              <div class="loco-border"></div>
            </div>
          </div>

          <!-- Rococo风底部花纹 -->
          <div class="yuse-bottom-pattern"></div>
        </div>
      `;
    }

    // 绑定入口点击事件：跳转对应子模块
    bindEntryEvents() {
      const entryCards = document.querySelectorAll('.yuse-entry-card');
      entryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
          const module = e.currentTarget.dataset.module;
          this.currentActiveModule = module;

          // 移除所有卡片激活态，给当前卡片加激活样式
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');

          // 触发对应子模块加载
          switch (module) {
            case 'theater':
              await this.loadTheaterModule(); // 加载剧场（现成APP）
              break;
            case 'live':
              await this.loadLiveModule(); // 加载直播（现成APP）
              break;
            case 'aoka':
            case 'yucy':
              this.showUnfinishedTip(); // 待开发模块提示
              break;
          }
        });
      });
    }

    // 加载剧场模块：调用yuse-theater-app.js的全局方法
    async loadTheaterModule() {
      const appContent = document.getElementById('app-content');
      // 显示加载中（带Rococo风加载动画）
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载剧场内容...</p>
        </div>
      `;

      try {
        // 确保剧场APP脚本已加载，调用其全局函数
        if (window.getYuseTheaterAppContent && window.bindYuseTheaterEvents) {
          const theaterContent = window.getYuseTheaterAppContent();
          appContent.innerHTML = theaterContent;
          window.bindYuseTheaterEvents(); // 绑定剧场原事件
          this.addModuleDecoration('theater'); // 给剧场加Rococo边框
          console.log('[欲色APP] 剧场模块加载完成');
        } else {
          throw new Error('剧场功能未就绪');
        }
      } catch (error) {
        appContent.innerHTML = `
          <div class="yuse-error">
            <div class="error-icon">❌</div>
            <p>剧场加载失败：${error.message}</p>
          </div>
        `;
      }
    }

    // 加载直播模块：调用live-app.js的全局方法
    async loadLiveModule() {
      const appContent = document.getElementById('app-content');
      // 显示加载中（带暖金闪烁效果）
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载直播内容...</p>
        </div>
      `;

      try {
        // 确保直播APP脚本已加载，调用其全局函数
        if (window.getLiveAppContent && window.bindLiveAppEvents) {
          const liveContent = window.getLiveAppContent();
          appContent.innerHTML = liveContent;
          window.bindLiveAppEvents(); // 绑定直播原事件
          this.addModuleDecoration('live'); // 给直播加Rococo边框
          console.log('[欲色APP] 直播模块加载完成');
        } else {
          throw new Error('直播功能未就绪');
        }
      } catch (error) {
        appContent.innerHTML = `
          <div class="yuse-error">
            <div class="error-icon">❌</div>
            <p>直播加载失败：${error.message}</p>
          </div>
        `;
      }
    }

    // 给子模块添加Rococo风装饰边框
    addModuleDecoration(module) {
      const container = document.querySelector('.yuse-theater-app, .live-app');
      if (container) {
        container.classList.add('loco-module-border');
        // 不同模块用不同装饰色
        if (module === 'theater') container.style.borderColor = '#9370DB';
        if (module === 'live') container.style.borderColor = '#E0F7FA';
      }
    }

    // 添加Rococo风动态装饰（顶部卷草纹、底部花纹动画）
    addLocoDecoration() {
      // 顶部卷草纹左右摆动
      const curves = document.querySelectorAll('.gold-curve');
      curves.forEach((curve, idx) => {
        setInterval(() => {
          curve.style.transform = idx === 0 
            ? `rotateZ(${Math.sin(Date.now()/1000)*5}deg)` 
            : `rotateZ(${-Math.sin(Date.now()/1000)*5}deg)`;
        }, 100);
      });

      // 底部花纹渐变流动
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
        <div class="tip-content">
          <div class="tip-icon">🎀</div>
          <p>该模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～</p>
        </div>
      `;
      document.body.appendChild(tip);
      setTimeout(() => tip.remove(), 2000);
    }
  }

  // 全局实例化，挂载到window供调用
  window.YuseApp = YuseApp;
  window.YuseApp = new YuseApp();

  // 全局函数：供mobile-phone.js调用，获取主界面内容
  window.getYuseAppContent = () => {
    return document.querySelector('.yuse-container')?.outerHTML || '<div class="yuse-error">欲色APP加载失败</div>';
  };
}
