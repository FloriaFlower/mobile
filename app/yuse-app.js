if (typeof window.YuseApp === 'undefined') {
  class YuseApp {
    constructor() {
      this.currentActiveModule = null;
      // 标记DOM是否就绪，避免提前操作
      this.isDomReady = false;
      // 等待DOM就绪后再初始化（核心修复：避免app-content未创建时执行）
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        this.init();
        this.isDomReady = true;
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          this.init();
          this.isDomReady = true;
          console.log('[欲色APP] DOM就绪，完成初始化');
        });
      }
    }

    // 初始化：确保DOM和事件都生效（对齐论坛APP的初始化逻辑）
    init() {
      console.log('[欲色APP] 初始化主界面');
      // 1. 优先检查DOM容器（核心修复：避免app-content不存在导致后续失败）
      this.appContent = document.getElementById('app-content');
      if (!this.appContent) {
        this.showError('关键容器「app-content」未找到，无法渲染界面');
        return;
      }
      // 2. 渲染界面+绑定事件
      this.renderMainContent();
      this.bindEntryEvents();
      this.addLocoDecoration();
      // 3. 检查mobilePhone实例（核心修复：加强错误提示，确保用户能看到）
      this.checkMobilePhoneInstance();
    }

    // 检查window.mobilePhone是否存在（核心修复：错误可视化+重试提示）
    checkMobilePhoneInstance() {
      if (!window.mobilePhone) {
        const errorMsg = '严重错误：window.mobilePhone实例未找到！\n请先确保mobile-phone.js已加载，或刷新页面重试';
        console.error(`[欲色APP] ${errorMsg}`);
        this.showError(errorMsg);
        // 添加重试按钮（核心修复：降低用户操作成本）
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

    // 渲染主界面：确保DOM结构正确（参考论坛APP的容器挂载）
    renderMainContent() {
      if (!this.appContent) return '';
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
      return mainHtml;
    }

    // 绑定入口事件（参考论坛APP的事件绑定：先检查实例，再执行逻辑）
    bindEntryEvents() {
      const entryCards = this.appContent.querySelectorAll('.yuse-entry-card');
      if (entryCards.length === 0) {
        const errorMsg = '未找到任何卡片元素，事件绑定失败';
        console.error(`[欲色APP] ${errorMsg}`);
        this.showError(errorMsg);
        return;
      }
      entryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
          // 1. 先获取模块标识（核心修复：确认dataset.module正确获取）
          const module = e.currentTarget?.dataset?.module;
          if (!module) {
            this.showError('未获取到模块标识，请检查卡片的data-module属性');
            return;
          }
          this.currentActiveModule = module;
          // 2. 激活卡片样式（确保点击特效可见）
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');
          console.log(`[欲色APP] 点击卡片：${module}，开始执行逻辑`);

          // 3. 优先检查mobilePhone实例（核心修复：阻断后续错误执行）
          if (!window.mobilePhone) {
            this.showError('手机核心实例未加载，无法跳转\n请点击下方"点击重试"刷新页面');
            return;
          }

          try {
            switch (module) {
              case 'theater':
                // 4. 对齐论坛APP的嵌套逻辑：先加载脚本，再调用渲染
                console.log('[欲色APP] 开始加载剧场模块：调用mobilePhone.loadYuseTheaterApp()');
                await window.mobilePhone.loadYuseTheaterApp();
                console.log('[欲色APP] 开始渲染剧场界面：调用mobilePhone.handleYuseTheaterApp()');
                await window.mobilePhone.handleYuseTheaterApp();
                // 更新头部标题（参考论坛APP的header同步）
                window.mobilePhone.updateAppHeader({
                  app: 'yuse-theater',
                  title: '欲色剧场',
                  view: 'main'
                });
                console.log('[欲色APP] 剧场模块加载完成');
                break;
              case 'live':
                console.log('[欲色APP] 开始加载直播模块：调用mobilePhone.loadLiveApp()');
                await window.mobilePhone.loadLiveApp();
                console.log('[欲色APP] 开始渲染直播界面：调用mobilePhone.handleLiveApp()');
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
                // 修复：嗷咔/欲次元提示挂载到手机容器，避免被遮挡
                this.showUnfinishedTip(module);
                break;
              default:
                this.showError(`未知模块：${module}`);
            }
          } catch (error) {
            // 5. 暴露错误（核心修复：详细日志+用户可见提示）
            const errorMsg = `${module === 'theater' ? '剧场' : '直播'}加载失败：${error.message}\n可查看Console控制台获取完整错误信息`;
            console.error(`[欲色APP] 模块${module}加载错误:`, error);
            this.showError(errorMsg);
          }
        });
      });
    }

    // 修复：嗷咔提示不显示（挂载到手机容器，调整样式确保可见）
    showUnfinishedTip(module) {
      const tipText = module === 'aoka' ? '嗷咔模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～' : '欲次元模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～';
      // 找到手机容器（核心修复：优先挂载到手机容器内）
      const phoneContainer = document.querySelector('.mobile-phone-container') || this.appContent;
      if (!phoneContainer) {
        console.error('[欲色APP] 未找到手机容器，提示无法显示');
        return;
      }
      // 移除旧提示
      const oldTip = document.querySelector('.yuse-tip');
      if (oldTip) oldTip.remove();
      // 创建提示元素（核心修复：确保z-index高于手机界面内部元素）
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
        z-index: 99999; /* 高于手机容器的z-index */
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

    // 错误提示（核心修复：确保挂载到app-content，用户必见）
    showError(message) {
      if (!this.appContent) return;
      // 移除旧错误提示
      const oldError = this.appContent.querySelector('.yuse-error');
      if (oldError) oldError.remove();
      // 创建错误元素（挂载到app-content内，确保在手机界面中显示）
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
      // 支持换行显示错误信息
      errorEl.innerHTML = `❌ ${message.replace(/\n/g, '<br>')}`;
      this.appContent.appendChild(errorEl);
    }

    // 以下方法保持不变（装饰、模块加载备用逻辑）
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

  // 全局实例化（参考论坛APP：确保优先创建实例，但等待DOM就绪后执行）
  window.YuseApp = new YuseApp();
}

// 全局函数（参考论坛APP的getXXXContent逻辑：每次调用重新初始化）
window.getYuseAppContent = () => {
  console.log('[欲色APP] 全局函数调用：重新初始化界面');
  if (window.YuseApp) {
    // 确保DOM就绪后再渲染
    if (window.YuseApp.isDomReady) {
      window.YuseApp.init();
      return window.YuseApp.renderMainContent();
    } else {
      setTimeout(() => window.getYuseAppContent(), 100);
      return '<div class="yuse-loading">等待DOM就绪...</div>';
    }
  } else {
    window.YuseApp = new YuseApp();
    return '<div class="yuse-loading">初始化应用...</div>';
  }
};
