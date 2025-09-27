// 替换原 bindEntryEvents 和 bindCardEvents 方法，用事件委托重构
bindEntryEvents() {
  console.log('[欲色APP] 开始绑定入口事件（事件委托模式）');
  const entryGrid = document.querySelector('.yuse-entry-grid');
  
  // 1. 确认父容器是否存在
  if (!entryGrid) {
    console.error('[欲色APP] 绑定失败：未找到.yuse-entry-grid父容器');
    // 重试查询（防止DOM延迟）
    setTimeout(() => {
      const retryGrid = document.querySelector('.yuse-container .yuse-entry-grid');
      if (retryGrid) this.bindGridEvents(retryGrid);
    }, 200);
    return;
  }

  this.bindGridEvents(entryGrid);
}

// 事件委托核心逻辑
bindGridEvents(grid) {
  console.log('[欲色APP] 事件委托已生效，监听.yuse-entry-grid点击');
  
  // 给父容器绑定单次事件（避免重复绑定）
  grid.addEventListener('click', async (e) => {
    // 阻止事件冒泡（防止父元素拦截）
    e.stopPropagation();
    
    // 2. 精准找到点击的卡片（不管点的是卡片内哪个子元素）
    const targetCard = e.target.closest('.yuse-entry-card');
    if (!targetCard) {
      console.log('[欲色APP] 点击未命中卡片（可能点到空白区域），目标元素：', e.target);
      return;
    }

    // 3. 获取模块名称
    const module = targetCard.dataset.module;
    if (!module) {
      console.error('[欲色APP] 卡片缺少data-module属性，目标卡片：', targetCard);
      return;
    }

    // 4. 打印点击详情（关键日志）
    console.log('[欲色APP] 卡片被点击！', {
      targetModule: module,
      clickedElement: e.target,
      matchedCard: targetCard,
      isCardValid: !!targetCard.dataset.module
    });

    // 5. 激活当前卡片样式
    const allCards = document.querySelectorAll('.yuse-entry-card');
    allCards.forEach(card => card.classList.remove('active'));
    targetCard.classList.add('active');

    try {
      // 6. 加载对应模块（逻辑不变，保留原加载流程）
      if (!window.mobilePhone) {
        throw new Error('window.mobilePhone 不存在（手机框架未初始化）');
      }
      console.log('[欲色APP] 开始加载模块：', module);

      switch (module) {
        case 'theater':
          await window.mobilePhone.loadYuseTheaterApp();
          await this.loadTheaterModule();
          break;
        case 'live':
          await window.mobilePhone.loadLiveApp();
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
  }, { once: false }); // 确保事件能重复触发

  console.log('[欲色APP] 事件委托绑定完成，父容器：', grid);
}
