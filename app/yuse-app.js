if (typeof window.YuseApp === 'undefined') {
  class YuseApp {
    constructor() {
      this.currentActiveModule = null;
      this.init();
    }

    // 初始化：确保DOM和事件都生效（对齐论坛APP的初始化逻辑）
    init() {
      console.log('[欲色APP] 初始化主界面');
      this.renderMainContent();
      this.bindEntryEvents();
      this.addLocoDecoration();
      // 初始化时检查mobilePhone实例（关键：论坛APP会提前确保实例存在）
      this.checkMobilePhoneInstance();
    }

    // 检查window.mobilePhone是否存在（核心修复：避免调用不存在的实例）
    checkMobilePhoneInstance() {
      if (!window.mobilePhone) {
        console.error('[欲色APP] 严重错误：window.mobilePhone实例未找到！');
        this.showError('手机模拟器核心未加载，请刷新页面重试');
      } else {
        console.log('[欲色APP] ✅ 检测到window.mobilePhone实例');
      }
    }

    // 渲染主界面：确保DOM结构正确（参考论坛APP的容器挂载）
    renderMainContent() {
      const appContent = document.getElementById('app-content');
      if (!appContent) {
        console.error('[欲色APP] app-content容器未找到');
        return '';
      }
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

    // 绑定入口事件（参考论坛APP的事件绑定：先检查实例，再执行逻辑）
    bindEntryEvents() {
      const entryCards = document.querySelectorAll('.yuse-entry-card');
      if (entryCards.length === 0) {
        console.error('[欲色APP] 未找到任何卡片元素，事件绑定失败');
        return;
      }

      entryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
          const module = e.currentTarget.dataset.module;
          this.currentActiveModule = module;
          // 激活卡片样式（有特效说明这步生效）
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');

          // 1. 优先检查mobilePhone实例（论坛APP会先确保实例存在）
          if (!window.mobilePhone) {
            this.showError('手机核心实例未加载，无法跳转');
            return;
          }

          try {
            console.log(`[欲色APP] 触发模块：${module}，开始执行逻辑`);
            switch (module) {
              case 'theater':
                // 2. 对齐论坛APP的嵌套逻辑：先加载脚本，再调用渲染（关键）
                console.log('[欲色APP] 调用mobilePhone.loadYuseTheaterApp()');
                await window.mobilePhone.loadYuseTheaterApp();
                console.log('[欲色APP] 调用mobilePhone.handleYuseTheaterApp()');
                await window.mobilePhone.handleYuseTheaterApp();
                // 更新头部标题（参考论坛APP的header同步）
                window.mobilePhone.updateAppHeader({
                  app: 'yuse-theater',
                  title: '欲色剧场',
                  view: 'main'
                });
                break;

              case 'live':
                console.log('[欲色APP] 调用mobilePhone.loadLiveApp()');
                await window.mobilePhone.loadLiveApp();
                console.log('[欲色APP] 调用mobilePhone.handleLiveApp()');
                await window.mobilePhone.handleLiveApp();
                window.mobilePhone.updateAppHeader({
                  app: 'live',
                  title: '直播',
                  view: 'start'
                });
                break;

              case 'aoka':
              case 'yucy':
                // 3. 修复嗷咔/欲次元的提示不显示问题：挂载到手机容器内，避免被遮挡
                this.showUnfinishedTip(module);
                break;

              default:
                this.showError(`未知模块：${module}`);
            }
          } catch (error) {
            // 4. 暴露错误（之前隐藏了错误，导致不知道没加载脚本）
            console.error(`[欲色APP] 模块${module}加载错误:`, error);
            this.showError(`${module === 'theater' ? '剧场' : '直播'}加载失败：${error.message}`);
          }
        });
      });
    }

    // 修复：嗷咔提示不显示（挂载到手机容器，调整样式确保可见）
    showUnfinishedTip(module) {
      const tipText = module === 'aoka' ? '嗷咔模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～' : '欲次元模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～';
      // 找到手机容器（参考论坛APP的弹窗挂载）
      const phoneContainer = document.querySelector('.mobile-phone-container') || document.body;
      // 移除旧提示
      const oldTip = document.querySelector('.yuse-tip');
      if (oldTip) oldTip.remove();

      const tip = document.createElement('div');
      tip.className = 'yuse-tip';
      // 样式调整：确保在手机界面内居中显示，不被遮挡
      tip.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      `;
      tip.innerHTML = `
        <div class="tip-icon">🎀</div>
        <p>${tipText}</p>
      `;
      // 挂载到手机容器内（避免被body的overflow隐藏）
      phoneContainer.appendChild(tip);
      // 2秒后移除
      setTimeout(() => {
        tip.style.opacity = '0';
        tip.style.transition = 'opacity 0.3s ease';
        setTimeout(() => tip.remove(), 300);
      }, 2000);
    }

    // 错误提示（参考论坛APP的toast样式）
    showError(message) {
      const appContent = document.getElementById('app-content');
      if (!appContent) return;

      const errorEl = document.createElement('div');
      errorEl.className = 'yuse-error';
      errorEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(231,76,60,0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 99999;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      `;
      errorEl.textContent = `❌ ${message}`;
      appContent.appendChild(errorEl);

      setTimeout(() => {
        errorEl.style.opacity = '0';
        errorEl.style.transition = 'opacity 0.3s ease';
        setTimeout(() => errorEl.remove(), 300);
      }, 3000);
    }

    // 以下方法保持不变（装饰、模块加载备用逻辑）
    loadTheaterModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载剧场内容...</p>
        </div>
      `;
      if (!window.getYuseTheaterAppContent || !window.bindYuseTheaterEvents) {
        throw new Error('yuse-theater-app.js 未加载');
      }
      const theaterContent = window.getYuseTheaterAppContent();
      appContent.innerHTML = theaterContent;
      window.bindYuseTheaterEvents();
      this.addModuleDecoration('theater');
    }

    loadLiveModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载直播内容...</p>
        </div>
      `;
      if (!window.getLiveAppContent || !window.bindLiveAppEvents) {
        throw new Error('live-app.js 未加载');
      }
      const liveContent = window.getLiveAppContent();
      appContent.innerHTML = liveContent;
      window.bindLiveAppEvents();
      this.addModuleDecoration('live');
    }

    addModuleDecoration(module) {
      const container = document.querySelector('.yuse-theater-app, .live-app');
      if (container) {
        container.classList.add('loco-module-border');
        container.style.borderColor = module === 'theater' ? '#9370DB' : '#E0F7FA';
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
  }

  // 全局实例化（参考论坛APP：确保优先创建实例）
  window.YuseApp = new YuseApp();
}

// 全局函数（参考论坛APP的getXXXContent逻辑：每次调用重新初始化）
window.getYuseAppContent = () => {
  console.log('[欲色APP] 全局函数调用：重新初始化界面');
  if (window.YuseApp) {
    window.YuseApp.init();
    return window.YuseApp.renderMainContent();
  } else {
    window.YuseApp = new YuseApp();
    return window.YuseApp.renderMainContent();
  }
};
