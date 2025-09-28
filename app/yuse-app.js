if (typeof window.YuseApp === 'undefined') {
  class YuseApp {
    constructor() {
      this.currentActiveModule = null;
      this.isDomReady = false;
      // 核心：确保DOM就绪后再初始化，避免提前执行
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        this.init();
        this.isDomReady = true;
        console.log('[欲色APP] 构造函数：文档已就绪，直接执行init');
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          this.init();
          this.isDomReady = true;
          console.log('[欲色APP] 构造函数：DOMContentLoaded触发，执行init');
        });
      }
    }

    init() {
      console.log('[欲色APP] init：开始初始化主界面');
      // 1. 必检容器，不存在则终止并提示
      this.appContent = document.getElementById('app-content');
      if (!this.appContent) {
        const errorMsg = '关键容器「app-content」未找到，无法渲染界面\n请确认mobile-phone.js已正常加载';
        this.showError(errorMsg);
        console.error(`[欲色APP] init失败：${errorMsg}`);
        return;
      }
      console.log('[欲色APP] init：成功获取app-content容器');

      // 核心修复1：先清空容器再渲染，避免重复叠加DOM
      this.appContent.innerHTML = '';
      // 2. 先渲染卡片，再绑定事件（顺序不可换）
      this.renderMainContent();
      this.bindEntryEvents();
      this.addLocoDecoration();
      this.checkMobilePhoneInstance();
      console.log('[欲色APP] init：初始化+事件绑定完成（自主管理DOM）');
    }

    checkMobilePhoneInstance() {
      if (!window.mobilePhone) {
        const errorMsg = '严重错误：window.mobilePhone实例未找到！\n请先确保mobile-phone.js已加载，或刷新页面重试';
        console.error(`[欲色APP] ${errorMsg}`);
        this.showError(errorMsg);
        const retryBtn = document.createElement('button');
        retryBtn.textContent = '点击重试';
        retryBtn.style.cssText = `
          margin-top: 12px;
          padding: 8px 16px;
          background: #D4AF37;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        `;
        retryBtn.addEventListener('click', () => window.location.reload());
        this.appContent.querySelector('.yuse-error')?.appendChild(retryBtn);
      } else {
        console.log('[欲色APP] ✅ 检测到window.mobilePhone实例');
      }
    }

    renderMainContent() {
      if (!this.appContent) return '';
      console.log('[欲色APP] renderMainContent：开始生成卡片HTML');
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
      this.appContent.innerHTML = mainHtml;
      console.log('[欲色APP] renderMainContent：卡片HTML已插入app-content');
      return mainHtml;
    }

    bindEntryEvents() {
      console.log('[欲色APP] bindEntryEvents：开始绑定卡片点击事件');
      // 必检卡片元素，不存在则提示
      const entryCards = this.appContent.querySelectorAll('.yuse-entry-card');
      if (entryCards.length === 0) {
        const errorMsg = '未找到任何卡片元素（.yuse-entry-card），事件绑定失败';
        console.error(`[欲色APP] ${errorMsg}`);
        this.showError(errorMsg);
        return;
      }
      console.log(`[欲色APP] bindEntryEvents：找到${entryCards.length}个卡片，开始绑定事件`);

      entryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
          // 1. 追踪点击触发（关键日志，确认事件到达）
          const module = e.currentTarget?.dataset?.module;
          console.log(`[欲色APP] 点击卡片：${module}（触发事件回调）`);
          
          if (!module) {
            const errorMsg = '未获取到模块标识，请检查卡片的data-module属性';
            this.showError(errorMsg);
            console.error(`[欲色APP] ${errorMsg}`);
            return;
          }

          // 2. 激活卡片样式（可视化反馈）
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');
          this.currentActiveModule = module;

          // 3. 检查mobilePhone实例（阻断无效操作）
          if (!window.mobilePhone) {
            this.showError('手机核心实例未加载，无法跳转\n请点击下方"点击重试"刷新页面');
            return;
          }

          // 4. 模块逻辑执行（调用mobile-phone.js对应方法）
          try {
            switch (module) {
              case 'theater':
                console.log('[欲色APP] 调用mobilePhone.loadYuseTheaterApp()');
                await window.mobilePhone.loadYuseTheaterApp();
                console.log('[欲色APP] 调用mobilePhone.handleYuseTheaterApp()');
                await window.mobilePhone.handleYuseTheaterApp();
                window.mobilePhone.updateAppHeader({
                  app: 'yuse-theater',
                  title: '欲色剧场',
                  view: 'main'
                });
                console.log('[欲色APP] 剧场模块加载完成');
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
                console.log('[欲色APP] 直播模块加载完成');
                break;
              case 'aoka':
              case 'yucy':
                this.showUnfinishedTip(module);
                break;
              default:
                this.showError(`未知模块：${module}`);
            }
          } catch (error) {
            const errorMsg = `${module === 'theater' ? '剧场' : '直播'}加载失败：${error.message}\n可查看Console控制台获取完整错误信息`;
            console.error(`[欲色APP] 模块${module}加载错误:`, error);
            this.showError(errorMsg);
          }
        });
      });
      console.log('[欲色APP] bindEntryEvents：所有卡片事件绑定完成');
    }

    showUnfinishedTip(module) {
      const tipText = module === 'aoka' ? '嗷咔模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～' : '欲次元模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～';
      const phoneContainer = document.querySelector('.mobile-phone-container') || this.appContent;
      if (!phoneContainer) {
        console.error('[欲色APP] 未找到手机容器，提示无法显示');
        return;
      }
      // 移除旧提示
      const oldTip = document.querySelector('.yuse-tip');
      if (oldTip) oldTip.remove();
      // 创建提示（确保z-index最高，不被遮挡）
      const tip = document.createElement('div');
      tip.className = 'yuse-tip';
      tip.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        z-index: 99999; /* 高于手机容器z-index */
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      `;
      tip.innerHTML = `<div class="tip-icon">🎀</div><p>${tipText}</p>`;
      phoneContainer.appendChild(tip);
      // 2秒后移除
      setTimeout(() => {
        tip.style.opacity = '0';
        tip.style.transition = 'opacity 0.3s ease';
        setTimeout(() => tip.remove(), 300);
      }, 2000);
      console.log(`[欲色APP] 显示${module}模块开发提示`);
    }

    showError(message) {
      if (!this.appContent) return;
      // 移除旧错误
      const oldError = this.appContent.querySelector('.yuse-error');
      if (oldError) oldError.remove();
      // 错误挂载到app-content内（确保用户必见，不被遮挡）
      const errorEl = document.createElement('div');
      errorEl.className = 'yuse-error';
      errorEl.style.cssText = `
        position: relative;
        margin: 20px auto;
        background: rgba(231,76,60,0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 90%;
        text-align: center;
        line-height: 1.6;
      `;
      errorEl.innerHTML = `❌ ${message.replace(/\n/g, '<br>')}`;
      this.appContent.appendChild(errorEl);
      console.log(`[欲色APP] 显示错误：${message}`);
    }

    // 以下方法保持原有逻辑不变（剧场/直播模块加载备用逻辑）
    loadTheaterModule() {
      if (!this.appContent) return;
      this.appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载剧场内容...</p>
        </div>
      `;
      if (!window.getYuseTheaterAppContent || !window.bindYuseTheaterEvents) {
        throw new Error('yuse-theater-app.js 未加载');
      }
      const theaterContent = window.getYuseTheaterAppContent();
      this.appContent.innerHTML = theaterContent;
      window.bindYuseTheaterEvents();
      this.addModuleDecoration('theater');
    }

    loadLiveModule() {
      if (!this.appContent) return;
      this.appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载直播内容...</p>
        </div>
      `;
      if (!window.getLiveAppContent || !window.bindLiveAppEvents) {
        throw new Error('live-app.js 未加载');
      }
      const liveContent = window.getLiveAppContent();
      this.appContent.innerHTML = liveContent;
      window.bindLiveAppEvents();
      this.addModuleDecoration('live');
    }

    addModuleDecoration(module) {
      const container = this.appContent.querySelector('.yuse-theater-app, .live-app');
      if (container) {
        container.classList.add('loco-module-border');
        container.style.borderColor = module === 'theater' ? '#9370DB' : '#E0F7FA';
      }
    }

    addLocoDecoration() {
      const curves = this.appContent.querySelectorAll('.gold-curve');
      curves.forEach((curve, idx) => {
        setInterval(() => {
          curve.style.transform = idx === 0 
            ? `rotateZ(${Math.sin(Date.now()/1000)*5}deg)` 
            : `rotateZ(${-Math.sin(Date.now()/1000)*5}deg)`;
        }, 100);
      });
      const bottomPattern = this.appContent.querySelector('.yuse-bottom-pattern');
      let hue = 30;
      setInterval(() => {
        hue = (hue + 1) % 360;
        bottomPattern.style.background = `linear-gradient(45deg, 
          hsla(${hue}, 70%, 60%, 0.3), 
          hsla(${hue+30}, 70%, 60%, 0.2))`;
      }, 5000);
    }
  }

  // 全局实例化（确保window.YuseApp提前挂载，供mobile-phone.js调用）
  window.YuseApp = new YuseApp();
  console.log('[欲色APP] 全局实例已挂载到window.YuseApp');
}

// 核心修复2：getYuseAppContent不再返回HTML，而是触发init自主渲染
window.getYuseAppContent = () => {
  console.log('[欲色APP] 全局函数getYuseAppContent被调用，触发自主渲染');
  if (window.YuseApp) {
    if (window.YuseApp.isDomReady) {
      window.YuseApp.init(); // 触发init：自己渲染DOM+绑定事件
      return window.YuseApp.appContent.innerHTML; // 仅返回已渲染的HTML（供mobile-phone.js确认，不用于覆盖）
    } else {
      // 延迟重试，确保DOM就绪
      setTimeout(() => window.getYuseAppContent(), 200);
      return '<div class="yuse-loading">等待DOM就绪...</div>';
    }
  } else {
    window.YuseApp = new YuseApp();
    return '<div class="yuse-loading">初始化应用...</div>';
  }
};
