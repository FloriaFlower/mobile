if (typeof window.YuseApp === 'undefined') {
  class YuseApp {
    constructor() {
      this.currentActiveModule = null;
      this.init();
    }

    // 初始化：确保DOM渲染后再绑定事件
    init() {
      console.log('[欲色APP] 初始化主界面（进入init）');
      this.renderMainContent();
      // 关键：延迟100ms确保DOM完全挂载后再绑定事件（解决时序问题）
      setTimeout(() => {
        this.bindEntryEvents();
      }, 100);
      this.addLocoDecoration();
    }

    // 渲染主界面：明确打印DOM结构
    renderMainContent() {
      const appContent = document.getElementById('app-content');
      if (!appContent) {
        console.error('[欲色APP] 渲染失败：未找到app-content容器');
        return '';
      }
      console.log('[欲色APP] 开始渲染主界面DOM（app-content存在）');

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
      // 渲染后打印DOM结构，确认卡片存在
      const cards = document.querySelectorAll('.yuse-entry-card');
      console.log(`[欲色APP] 主界面DOM渲染完成，卡片数量：${cards.length}，卡片HTML：`, appContent.innerHTML);
      return mainHtml;
    }

    // 绑定入口事件：全链路日志+确保每个卡片都绑定
    bindEntryEvents() {
      console.log('[欲色APP] 开始绑定入口事件（进入bindEntryEvents）');
      const entryCards = document.querySelectorAll('.yuse-entry-card');
      
      // 1. 先确认卡片是否获取到
      if (entryCards.length === 0) {
        console.error('[欲色APP] 绑定事件失败：未找到.yuse-entry-card元素');
        // 紧急修复：重新查询一次（防止DOM查询时机问题）
        const retryCards = document.querySelectorAll('.yuse-container .yuse-entry-grid .yuse-entry-card');
        if (retryCards.length > 0) {
          console.warn('[欲色APP] 重试查询后获取到卡片，数量：', retryCards.length);
          this.bindCardEvents(retryCards); // 单独抽离绑定逻辑
        }
        return;
      }

      // 2. 正常绑定事件
      console.log(`[欲色APP] 成功获取到${entryCards.length}个卡片，开始逐个绑定事件`);
      this.bindCardEvents(entryCards);
    }

    // 单独抽离卡片事件绑定逻辑（便于复用）
    bindCardEvents(cards) {
      cards.forEach((card, index) => {
        const module = card.dataset.module;
        console.log(`[欲色APP] 正在绑定第${index+1}个卡片：模块=${module}，卡片DOM：`, card);
        
        // 给卡片添加点击反馈样式（确认可点击）
        card.style.cursor = 'pointer';
        card.style.userSelect = 'none';
        
        // 绑定点击事件
        card.addEventListener('click', async (e) => {
          // 阻止事件冒泡（防止父元素拦截）
          e.stopPropagation();
          console.log('[欲色APP] 卡片被点击！事件触发详情：', {
            targetModule: module,
            targetElement: e.target,
            currentTarget: e.currentTarget,
            isCard: e.currentTarget === card
          });

          // 激活卡片样式
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');

          try {
            // 检查mobilePhone是否存在（核心依赖）
            if (!window.mobilePhone) {
              throw new Error('window.mobilePhone 不存在（手机框架未初始化）');
            }
            console.log('[欲色APP] window.mobilePhone 存在，准备加载对应模块');

            // 按模块加载
            switch (module) {
              case 'theater':
                console.log('[欲色APP] 进入剧场模块加载流程');
                await window.mobilePhone.loadYuseTheaterApp();
                console.log('[欲色APP] 剧场脚本加载完成，调用渲染方法');
                await this.loadTheaterModule();
                break;
              case 'live':
                console.log('[欲色APP] 进入直播模块加载流程');
                await window.mobilePhone.loadLiveApp();
                console.log('[欲色APP] 直播脚本加载完成，调用渲染方法');
                await this.loadLiveModule();
                break;
              case 'aoka':
              case 'yucy':
                this.showUnfinishedTip();
                break;
              default:
                throw new Error(`未知模块：${module}`);
            }
          } catch (error) {
            console.error(`[欲色APP] ${module === 'theater' ? '剧场' : '直播'}加载失败：`, error);
            document.getElementById('app-content').innerHTML = `
              <div class="yuse-error" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; padding: 20px;">
                <div class="error-icon" style="font-size: 36px; color: #ff4757;">❌</div>
                <p style="font-size: 16px; color: #2d3748;">${module === 'theater' ? '剧场' : '直播'}加载失败</p>
                <p style="font-size: 12px; color: #718096; text-align: center;">原因：${error.message}</p>
                <button onclick="window.mobilePhone.handleYuseApp()" style="padding: 6px 12px; border: none; border-radius: 6px; background: #D4AF37; color: white; cursor: pointer;">返回主界面</button>
              </div>
            `;
          }
        });
      });
    }

    // 加载剧场模块（保留原逻辑+日志）
    async loadTheaterModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载剧场内容...</p>
        </div>
      `;

      if (!window.getYuseTheaterAppContent || !window.bindYuseTheaterEvents) {
        throw new Error('未找到剧场全局函数（getYuseTheaterAppContent / bindYuseTheaterEvents）');
      }
      console.log('[欲色APP] 剧场全局函数存在，开始获取内容');
      const theaterContent = window.getYuseTheaterAppContent();
      if (!theaterContent || theaterContent.trim() === '') {
        throw new Error('剧场内容为空');
      }

      appContent.innerHTML = theaterContent;
      window.bindYuseTheaterEvents();
      this.addModuleDecoration('theater');
      console.log('[欲色APP] 剧场模块渲染完成');
    }

    // 加载直播模块（保留原逻辑+日志）
    async loadLiveModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载直播内容...</p>
        </div>
      `;

      if (!window.getLiveAppContent || !window.bindLiveAppEvents) {
        throw new Error('未找到直播全局函数（getLiveAppContent / bindLiveAppEvents）');
      }
      console.log('[欲色APP] 直播全局函数存在，开始获取内容');
      const liveContent = window.getLiveAppContent();
      if (!liveContent || liveContent.trim() === '') {
        throw new Error('直播内容为空');
      }

      appContent.innerHTML = liveContent;
      window.bindLiveAppEvents();
      this.addModuleDecoration('live');
      console.log('[欲色APP] 直播模块渲染完成');
    }

    // 以下方法保持不变（仅加日志）
    addModuleDecoration(module) {
      console.log('[欲色APP] 给模块添加装饰：', module);
      const container = document.querySelector('.yuse-theater-app, .live-app');
      if (container) {
        container.classList.add('loco-module-border');
        container.style.borderColor = module === 'theater' ? '#9370DB' : '#E0F7FA';
      } else {
        console.warn('[欲色APP] 未找到模块容器，无法添加装饰');
      }
    }

    addLocoDecoration() {
      console.log('[欲色APP] 初始化洛可可风装饰');
      const curves = document.querySelectorAll('.gold-curve');
      curves.forEach((curve, idx) => {
        setInterval(() => {
          curve.style.transform = idx === 0 
            ? `rotateZ(${Math.sin(Date.now()/1000)*5}deg)` 
            : `rotateZ(${-Math.sin(Date.now()/1000)*5}deg)`;
        }, 100);
      });

      const bottomPattern = document.querySelector('.yuse-bottom-pattern');
      if (!bottomPattern) {
        console.warn('[欲色APP] 未找到底部花纹元素');
        return;
      }
      let hue = 30;
      setInterval(() => {
        hue = (hue + 1) % 360;
        bottomPattern.style.background = `linear-gradient(45deg, 
          hsla(${hue}, 70%, 60%, 0.3), 
          hsla(${hue+30}, 70%, 60%, 0.2))`;
      }, 5000);
    }

    showUnfinishedTip() {
      console.log('[欲色APP] 显示未完成提示');
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

  // 全局实例化（加日志）
  window.YuseApp = new YuseApp();
  console.log('[欲色APP] 全局实例 YuseApp 挂载完成');
}

// 全局函数（加日志）
window.getYuseAppContent = () => {
  console.log('[欲色APP] 调用 getYuseAppContent，重新渲染主界面');
  if (window.YuseApp) {
    return window.YuseApp.renderMainContent();
  } else {
    window.YuseApp = new YuseApp();
    return window.YuseApp.renderMainContent();
  }
};
console.log('[欲色APP] 全局函数 getYuseAppContent 挂载完成');
