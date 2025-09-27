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
      console.log('[欲色APP] 开始渲染主界面DOM');

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
      console.log('[欲色APP] 主界面DOM渲染完成');
      return mainHtml; // 返回HTML，供全局函数使用
    }

    // 绑定入口事件：强制触发加载+详细日志
    bindEntryEvents() {
      const entryCards = document.querySelectorAll('.yuse-entry-card');
      console.log('[欲色APP] 绑定入口事件，卡片数量：', entryCards.length);

      entryCards.forEach(card => {
        card.addEventListener('click', async (e) => {
          const module = e.currentTarget.dataset.module;
          this.currentActiveModule = module;
          console.log('[欲色APP] 点击入口：', module);

          // 激活当前卡片样式
          entryCards.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');

          try {
            // 关键：检查mobilePhone实例和加载方法是否存在
            if (!window.mobilePhone) {
              throw new Error('window.mobilePhone 未找到（手机框架未初始化）');
            }
            console.log('[欲色APP] window.mobilePhone 存在，检查加载方法');

            // 按模块触发加载（强制调用mobile-phone的加载方法）
            switch (module) {
              case 'theater':
                console.log('[欲色APP] 开始加载「欲色剧场」脚本');
                // 强制调用加载方法，打印路径日志
                await window.mobilePhone.loadYuseTheaterApp();
                console.log('[欲色APP] 「欲色剧场」脚本加载完成，开始渲染');
                await this.loadTheaterModule();
                break;

              case 'live':
                console.log('[欲色APP] 开始加载「直播」脚本');
                // 强制调用加载方法，打印路径日志
                await window.mobilePhone.loadLiveApp();
                console.log('[欲色APP] 「直播」脚本加载完成，开始渲染');
                await this.loadLiveModule();
                break;

              case 'aoka':
              case 'yucy':
                this.showUnfinishedTip();
                break;
            }
          } catch (error) {
            console.error(`[欲色APP] ${module === 'theater' ? '剧场' : '直播'}加载失败：`, error);
            // 显示明确的错误提示（含路径排查指引）
            document.getElementById('app-content').innerHTML = `
              <div class="yuse-error" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; padding: 20px;">
                <div class="error-icon" style="font-size: 36px; color: #ff4757;">❌</div>
                <p style="font-size: 16px; color: #2d3748;">${module === 'theater' ? '剧场' : '直播'}加载失败</p>
                <p style="font-size: 12px; color: #718096; text-align: center;">
                  原因：${error.message}<br>
                  建议：检查 mobile-phone.js 中 load${module === 'theater' ? 'YuseTheater' : 'Live'}App 方法的脚本路径
                </p>
                <button onclick="window.mobilePhone.handleYuseApp()" style="padding: 6px 12px; border: none; border-radius: 6px; background: #D4AF37; color: white; cursor: pointer;">返回主界面</button>
              </div>
            `;
          }
        });
      });
    }

    // 加载剧场模块：确保依赖函数存在+日志
    async loadTheaterModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载剧场内容...</p>
        </div>
      `;

      // 检查全局函数是否存在（加载脚本后才会有）
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

    // 加载直播模块：确保依赖函数存在+日志
    async loadLiveModule() {
      const appContent = document.getElementById('app-content');
      appContent.innerHTML = `
        <div class="yuse-loading">
          <div class="gold-spinner"></div>
          <p>加载直播内容...</p>
        </div>
      `;

      // 检查全局函数是否存在（加载脚本后才会有）
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
  console.log('[欲色APP] 全局实例 YuseApp 挂载完成');
}

// 关键修复：每次调用都重新渲染，不依赖旧DOM
window.getYuseAppContent = () => {
  console.log('[欲色APP] 调用 getYuseAppContent，重新渲染主界面');
  // 若实例已存在，重新初始化；若不存在，创建新实例
  if (window.YuseApp) {
    return window.YuseApp.renderMainContent();
  } else {
    window.YuseApp = new YuseApp();
    return window.YuseApp.renderMainContent();
  }
};
console.log('[欲色APP] 全局函数 getYuseAppContent 挂载完成');
