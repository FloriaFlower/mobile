if (typeof window.YuseApp === 'undefined') {
  class YuseApp {
    constructor() {
      this.currentActiveModule = null;
      this.init();
    }

    // 初始化：确保DOM渲染稳定后再绑定事件
    init() {
      console.log('[欲色APP] 初始化主界面（进入init）');
      this.renderMainContent();
      // 延迟100ms确保DOM完全挂载到文档树（解决时序问题）
      setTimeout(() => {
        this.bindEntryEvents();
      }, 100);
      this.addLocoDecoration();
    }

    // 渲染主界面：打印DOM结构+确认容器存在
    renderMainContent() {
      const appContent = document.getElementById('app-content');
      if (!appContent) {
        console.error('[欲色APP] 渲染失败：未找到#app-content容器');
        return '';
      }
      console.log('[欲色APP] 开始渲染主界面DOM（app-content存在）');

      // 主界面HTML结构（保持原样式）
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
      // 渲染后验证卡片数量+打印DOM（便于排查结构问题）
      const cards = document.querySelectorAll('.yuse-entry-card');
      console.log(`[欲色APP] 主界面DOM渲染完成，卡片数量：${cards.length}，DOM结构：`, appContent.innerHTML);
      return mainHtml;
    }

    // 事件委托入口：绑定到父容器（避免子元素拦截）
    bindEntryEvents() {
      console.log('[欲色APP] 开始绑定入口事件（事件委托模式）');
      // 找父容器.yuse-entry-grid（所有卡片的统一父级）
      let entryGrid = document.querySelector('.yuse-entry-grid');

      // 重试逻辑：防止DOM查询延迟
      if (!entryGrid) {
        console.warn('[欲色APP] 首次查询未找到.yuse-entry-grid，200ms后重试');
        setTimeout(() => {
          entryGrid = document.querySelector('.yuse-container .yuse-entry-grid');
          if (entryGrid) {
            this.bindGridEvents(entryGrid);
          } else {
            console.error('[欲色APP] 重试后仍未找到父容器，事件绑定失败');
          }
        }, 200);
        return;
      }

      // 绑定父容器的点击事件（核心委托逻辑）
      this.bindGridEvents(entryGrid);
    }

    // 事件委托核心：父容器统一处理所有卡片点击
    bindGridEvents(grid) {
      console.log('[欲色APP] 事件委托已生效，监听.yuse-entry-grid点击');
      
      // 给父容器绑定点击事件（once:false确保重复点击有效）
      grid.addEventListener('click', async (e) => {
        // 1. 阻止事件冒泡到手机框架（防止父元素拦截）
        e.stopPropagation();
        e.preventDefault(); // 阻止默认行为（如文本选中）

        // 2. 精准找到点击的卡片（不管点的是卡片内哪个子元素）
        const targetCard = e.target.closest('.yuse-entry-card');
        if (!targetCard) {
          console.log('[欲色APP] 点击未命中卡片（可能点到空白区域），目标元素：', e.target);
          return;
        }

        // 3. 获取卡片的模块名称（data-module属性）
        const module = targetCard.dataset.module;
        if (!module) {
          console.error('[欲色APP] 卡片缺少data-module属性，目标卡片：', targetCard);
          return;
        }

        // 4. 打印点击详情（关键日志：确认事件触发）
        console.log('[欲色APP] 卡片被点击！', {
          targetModule: module,
          clickedElement: e.target.tagName, // 点击的子元素标签（如DIV/SPAN）
          matchedCard: targetCard,
          isCardActive: targetCard.classList.contains('active')
        });

        // 5. 激活当前卡片样式（视觉反馈）
        const allCards = document.querySelectorAll('.yuse-entry-card');
        allCards.forEach(card => card.classList.remove('active'));
        targetCard.classList.add('active');

        try {
          // 6. 检查手机框架是否存在（核心依赖）
          if (!window.mobilePhone) {
            throw new Error('window.mobilePhone 不存在（手机框架未初始化）');
          }
          console.log('[欲色APP] 开始加载模块：', module);

          // 7. 按模块加载对应功能
          switch (module) {
            case 'theater':
              console.log('[欲色APP] 进入剧场模块加载流程');
              await window.mobilePhone.loadYuseTheaterApp();
              console.log('[欲色APP] 剧场脚本加载完成，开始渲染内容');
              await this.loadTheaterModule();
              break;
            case 'live':
              console.log('[欲色APP] 进入直播模块加载流程');
              await window.mobilePhone.loadLiveApp();
              console.log('[欲色APP] 直播脚本加载完成，开始渲染内容');
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
          // 8. 加载失败处理（显示明确错误）
          console.error(`[欲色APP] ${module === 'theater' ? '剧场' : '直播'}加载失败：`, error);
          const appContent = document.getElementById('app-content');
          appContent.innerHTML = `
            <div class="yuse-error" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; padding: 20px;">
              <div class="error-icon" style="font-size: 36px; color: #ff4757;">❌</div>
              <p style="font-size: 16px; color: #2d3748;">${module === 'theater' ? '剧场' : '直播'}加载失败</p>
              <p style="font-size: 12px; color: #718096; text-align: center;">原因：${error.message}</p>
              <button onclick="window.mobilePhone.handleYuseApp()" style="padding: 6px 12px; border: none; border-radius: 6px; background: #D4AF37; color: white; cursor: pointer;">返回主界面</button>
            </div>
          `;
        }
      }, { once: false });

      console.log('[欲色APP] 事件委托绑定完成，父容器：', grid);
    }

    // 加载剧场模块（保留原功能+日志）
    async loadTheaterModule() {
      const appContent = document.getElementById('app-content');
      // 显示加载动画
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载剧场内容...</p>
        </div>
        <style>
          .gold-spinner { width: 40px; height: 40px; border: 3px solid #D4AF37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      `;

      // 检查剧场全局函数是否存在
      if (!window.getYuseTheaterAppContent || !window.bindYuseTheaterEvents) {
        throw new Error('未找到剧场全局函数（getYuseTheaterAppContent / bindYuseTheaterEvents）');
      }
      console.log('[欲色APP] 剧场全局函数存在，开始获取内容');

      // 获取并渲染剧场内容
      const theaterContent = window.getYuseTheaterAppContent();
      if (!theaterContent || theaterContent.trim() === '') {
        throw new Error('剧场内容为空');
      }
      appContent.innerHTML = theaterContent;
      window.bindYuseTheaterEvents();
      this.addModuleDecoration('theater');
      console.log('[欲色APP] 剧场模块渲染完成');
    }

    // 加载直播模块（保留原功能+日志）
    async loadLiveModule() {
      const appContent = document.getElementById('app-content');
      // 显示加载动画
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载直播内容...</p>
        </div>
        <style>
          .gold-spinner { width: 40px; height: 40px; border: 3px solid #D4AF37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      `;

      // 检查直播全局函数是否存在
      if (!window.getLiveAppContent || !window.bindLiveAppEvents) {
        throw new Error('未找到直播全局函数（getLiveAppContent / bindLiveAppEvents）');
      }
      console.log('[欲色APP] 直播全局函数存在，开始获取内容');

      // 获取并渲染直播内容
      const liveContent = window.getLiveAppContent();
      if (!liveContent || liveContent.trim() === '') {
        throw new Error('直播内容为空');
      }
      appContent.innerHTML = liveContent;
      window.bindLiveAppEvents();
      this.addModuleDecoration('live');
      console.log('[欲色APP] 直播模块渲染完成');
    }

    // 给子模块添加洛可可风边框（保留原样式）
    addModuleDecoration(module) {
      console.log('[欲色APP] 给模块添加装饰：', module);
      const container = document.querySelector('.yuse-theater-app, .live-app');
      if (container) {
        container.classList.add('loco-module-border');
        container.style.borderColor = module === 'theater' ? '#9370DB' : '#E0F7FA';
        container.style.borderWidth = '2px';
        container.style.borderStyle = 'solid';
        container.style.borderRadius = '8px';
      } else {
        console.warn('[欲色APP] 未找到模块容器，无法添加装饰');
      }
    }

    // 洛可可风动态装饰（保留原动画）
    addLocoDecoration() {
      console.log('[欲色APP] 初始化洛可可风装饰');
      // 顶部曲线摆动动画
      const curves = document.querySelectorAll('.gold-curve');
      curves.forEach((curve, idx) => {
        curve.style.transition = 'transform 0.2s ease';
        setInterval(() => {
          const angle = Math.sin(Date.now() / 1000) * 5; // -5° ~ 5°摆动
          curve.style.transform = idx === 0 ? `rotateZ(${angle}deg)` : `rotateZ(${-angle}deg)`;
        }, 100);
      });

      // 底部花纹颜色流动
      const bottomPattern = document.querySelector('.yuse-bottom-pattern');
      if (bottomPattern) {
        bottomPattern.style.height = '40px';
        bottomPattern.style.borderRadius = '0 0 12px 12px';
        let hue = 30; // 初始暖金色
        setInterval(() => {
          hue = (hue + 1) % 360;
          bottomPattern.style.background = `linear-gradient(45deg, 
            hsla(${hue}, 70%, 60%, 0.3), 
            hsla(${hue + 30}, 70%, 60%, 0.2))`;
        }, 5000);
      } else {
        console.warn('[欲色APP] 未找到底部花纹元素，无法添加装饰');
      }
    }

    // 待开发模块提示（保留原样式）
    showUnfinishedTip() {
      console.log('[欲色APP] 显示未完成提示');
      const tip = document.createElement('div');
      tip.className = 'yuse-tip';
      tip.style.position = 'fixed';
      tip.style.top = '50%';
      tip.style.left = '50%';
      tip.style.transform = 'translate(-50%, -50%)';
      tip.style.zIndex = '1000';
      tip.innerHTML = `
        <div style="background: #FFF8E1; border: 2px solid #D4AF37; border-radius: 10px; padding: 15px 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <div style="font-size: 24px; color: #D4AF37; margin-bottom: 5px; text-align: center;">🎀</div>
          <p style="margin: 0; color: #2d3748; text-align: center;">该模块开发中ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧～</p>
        </div>
      `;
      document.body.appendChild(tip);
      // 2秒后自动移除
      setTimeout(() => tip.remove(), 2000);
    }
  }

  // 全局实例化（供外部调用）
  window.YuseApp = new YuseApp();
  console.log('[欲色APP] 全局实例 YuseApp 挂载完成');
}

// 全局函数：供mobile-phone.js调用，重新渲染主界面
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
