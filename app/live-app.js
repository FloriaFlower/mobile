/**
 * Live App - 直播应用
 * 基于task-app.js的模式，为mobile-phone.js提供直播功能
 * 监听SillyTavern上下文，解析直播数据，实时显示弹幕和互动
 */

// @ts-nocheck
// 避免重复定义
if (typeof window.LiveApp === 'undefined') {
  /**
   * 直播事件监听器
   * 负责监听SillyTavern的消息事件并触发数据解析
   */
  class LiveEventListener {
    constructor(liveApp) {
      this.liveApp = liveApp;
      this.isListening = false;
      this.lastMessageCount = 0;
      this.pollingInterval = null;
      this.messageReceivedHandler = this.onMessageReceived.bind(this);
    }

    /**
     * 开始监听SillyTavern事件
     */
    startListening() {
      if (this.isListening) {
        console.log('[Live App] 监听器已经在运行中');
        return;
      }

      try {
        console.log('[Live App] 尝试设置事件监听...');
        // 方法1: 优先使用SillyTavern.getContext().eventSource
        if (
          window?.SillyTavern?.getContext &&
          typeof window.SillyTavern.getContext === 'function'
        ) {
          const context = window.SillyTavern.getContext();
          if (context?.eventSource?.on && context.event_types) {
            console.log('[Live App] 使用SillyTavern.getContext().eventSource监听MESSAGE_RECEIVED');
            context.eventSource.on(context.event_types.MESSAGE_RECEIVED, this.messageReceivedHandler);
            this.isListening = true;
            this.updateMessageCount();
            console.log('[Live App] ✅ 成功监听 (context.eventSource)');
            return;
          }
        }

        // 方法2: 备用方案，使用轮询
        console.warn('[Live App] 事件监听设置失败，将使用轮询方案');
        this.startPolling();
      } catch (error) {
        console.error('[Live App] 设置事件监听异常:', error);
        this.startPolling(); // 出错时也退回到轮询
      }
    }

    /**
     * 停止监听
     */
    stopListening() {
      if (!this.isListening) return;

      try {
        if (
          window?.SillyTavern?.getContext &&
          typeof window.SillyTavern.getContext === 'function'
        ) {
          const context = window.SillyTavern.getContext();
          if (context?.eventSource?.off && context.event_types) {
            context.eventSource.off(context.event_types.MESSAGE_RECEIVED, this.messageReceivedHandler);
          }
        }

        if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }

        this.isListening = false;
        console.log('[Live App] 已停止监听SillyTavern事件');
      } catch (error) {
        console.error('[Live App] 停止监听失败:', error);
      }
    }

    /**
     * 启动轮询方案
     */
    startPolling() {
      if (this.pollingInterval) return;
      this.updateMessageCount();
      this.pollingInterval = setInterval(() => this.checkForNewMessages(), 2000);
      this.isListening = true;
      console.log('[Live App] ✅ 启动轮询监听方案');
    }

    /**
     * 轮询检查新消息
     */
    checkForNewMessages() {
      const currentMessageCount = this.getCurrentMessageCount();
      if (currentMessageCount > this.lastMessageCount) {
        console.log(`[Live App] 轮询检测到新消息: ${this.lastMessageCount} → ${currentMessageCount}`);
        this.onMessageReceived(currentMessageCount);
      }
    }

    /**
     * 处理AI消息接收事件
     * @param {any} messageData - 接收到的消息数据
     */
    async onMessageReceived(messageData) {
      if (!this.liveApp || !this.liveApp.isLiveActive) {
        return;
      }
      const currentMessageCount = this.getCurrentMessageCount();
      if (currentMessageCount <= this.lastMessageCount) {
        return;
      }
      this.lastMessageCount = currentMessageCount;
      console.log(`[Live App] 🎯 检测到新消息，触发数据解析...`);
      await this.liveApp.parseNewLiveData();
    }

    /**
     * 获取当前消息总数
     */
    getCurrentMessageCount() {
      try {
        if (
          window?.SillyTavern?.getContext &&
          typeof window.SillyTavern.getContext === 'function'
        ) {
          const context = window.SillyTavern.getContext();
          if (context?.chat && Array.isArray(context.chat)) {
            return context.chat.length;
          }
        }
        return 0;
      } catch (error) {
        console.warn('[Live App] 获取消息数量失败:', error);
        return 0;
      }
    }

    /**
     * 初始化/重置消息计数
     */
    updateMessageCount() {
      this.lastMessageCount = this.getCurrentMessageCount();
      console.log(`[Live App] 初始化消息计数: ${this.lastMessageCount}`);
    }
  }

  /**
   * 直播数据解析器
   */
  class LiveDataParser {
    constructor() {
      this.patterns = {
        viewerCount: /\[直播\|本场人数\|([^\]]+)\]/g,
        liveContent: /\[直播\|直播内容\|([^\]]+)\]/g,
        normalDanmaku: /\[直播\|([^\|]+)\|弹幕\|([^\]]+)\]/g,
        giftDanmaku: /\[直播\|([^\|]+)\|打赏\|([^\]]+)\]/g,
        recommendedInteraction: /\[直播\|推荐互动\|([^\]]+)\]/g,
        pkCover: /\[PK封面\|(.*?)\|(.*?)\|(.*?)\]/g,
        linkCover: /\[连麦封面\|(.*?)\|(.*?)\]/g,
        highLight: /\[PK封面\|高光次数\|(.*?)\]/g,
        linkHighLight: /\[连麦封面\|高光次数\|(.*?)\]/g,
        pkTips: /\[PK封面\|系统提示1\|(.*?)\|系统提示2\|(.*?)\|系统提示3\|(.*?)\]/g,
        linkTips: /\[连麦封面\|系统提示1\|(.*?)\|系统提示2\|(.*?)\|系统提示3\|(.*?)\]/g,
      };
    }

    parseLiveData(content) {
      const liveData = {
        viewerCount: 0,
        liveContent: '',
        danmakuList: [],
        giftList: [],
        recommendedInteractions: [],
        pkCoverData: null,
        linkCoverData: null,
        highLightCount: '0',
        systemTips: { tip1: '', tip2: '', tip3: '' }
      };

      if (!content || typeof content !== 'string') return liveData;

      const liveTheme = content.includes('[PK封面') ? 'pk' : (content.includes('[连麦封面') ? 'link' : '');

      liveData.viewerCount = this.parseViewerCount(content) || liveData.viewerCount;
      liveData.liveContent = this.parseLiveContent(content) || liveData.liveContent;
      const { danmakuList, giftList } = this.parseAllDanmaku(content);
      liveData.danmakuList = danmakuList;
      liveData.giftList = giftList;
      liveData.recommendedInteractions = this.parseRecommendedInteractions(content);

      if (liveTheme === 'pk') {
        liveData.pkCoverData = this.parsePkCover(content);
        liveData.highLightCount = this.parseHighLight(content, 'pk');
        liveData.systemTips = this.parseSystemTips(content, 'pk');
      } else if (liveTheme === 'link') {
        liveData.linkCoverData = this.parseLinkCover(content);
        liveData.highLightCount = this.parseHighLight(content, 'link');
        liveData.systemTips = this.parseSystemTips(content, 'link');
      }

      return liveData;
    }

    parseViewerCount(content) {
      const matches = [...content.matchAll(this.patterns.viewerCount)];
      if (matches.length === 0) return 0;
      const lastMatch = matches[matches.length - 1];
      const viewerStr = lastMatch[1].trim();
      const num = parseInt(viewerStr.replace(/[^\d]/g, ''));
      if (isNaN(num)) return 0;
      if (num >= 10000) return (num / 10000).toFixed(1) + 'W';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }

    parseLiveContent(content) {
      const matches = [...content.matchAll(this.patterns.liveContent)];
      return matches.length > 0 ? matches[matches.length - 1][1].trim() : '';
    }

    parseAllDanmaku(content) {
      const danmakuList = [];
      const giftList = [];
      const allMatches = [];

      [...content.matchAll(this.patterns.normalDanmaku)].forEach(match => allMatches.push({ type: 'normal', match, index: match.index }));
      [...content.matchAll(this.patterns.giftDanmaku)].forEach(match => allMatches.push({ type: 'gift', match, index: match.index }));

      allMatches.sort((a, b) => a.index - b.index);

      allMatches.forEach((item, index) => {
        const [, username, danmakuContent] = item.match;
        const timestamp = new Date().toLocaleString();
        const baseItem = { id: Date.now() + index, username: username.trim(), content: danmakuContent.trim(), timestamp };

        if (item.type === 'normal') {
          danmakuList.push({ ...baseItem, type: 'normal' });
        } else if (item.type === 'gift') {
          danmakuList.push({ ...baseItem, type: 'gift', id: baseItem.id + 10000 });
          giftList.push({ username: baseItem.username, gift: baseItem.content, timestamp });
        }
      });
      return { danmakuList, giftList };
    }

    parsePkCover(content) {
        const matches = [...content.matchAll(this.patterns.pkCover)];
        const pkCovers = matches.map(m => ({ type: m[1]?.trim(), imgUrl: m[2]?.trim(), currency: m[3]?.trim() || '0' }));
        return {
            userPk: pkCovers[0] || { type: '主播', imgUrl: '', currency: '0' },
            rivalPk: pkCovers[1] || { type: '对手', imgUrl: '', currency: '0' }
        };
    }

    parseLinkCover(content) {
        const matches = [...content.matchAll(this.patterns.linkCover)];
        const linkCovers = matches.map(m => ({ type: m[1]?.trim(), imgUrl: m[2]?.trim() }));
        return {
            userLink: linkCovers.find(item => item.type === '洛洛') || { type: '洛洛', imgUrl: '' },
            fanLink: linkCovers.find(item => item.type !== '洛洛') || { type: '粉丝', imgUrl: '' }
        };
    }

    parseHighLight(content, liveTheme) {
        const pattern = liveTheme === 'pk' ? this.patterns.highLight : this.patterns.linkHighLight;
        const matches = [...content.matchAll(pattern)];
        return matches.length > 0 ? matches[matches.length - 1][1].trim() : '0';
    }

    parseSystemTips(content, liveTheme) {
        const pattern = liveTheme === 'pk' ? this.patterns.pkTips : this.patterns.linkTips;
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            return { tip1: lastMatch[1]?.trim(), tip2: lastMatch[2]?.trim(), tip3: lastMatch[3]?.trim() };
        }
        return { tip1: '', tip2: '', tip3: '' };
    }

    parseRecommendedInteractions(content) {
      const interactions = [];
      const matches = [...content.matchAll(this.patterns.recommendedInteraction)];
      matches.slice(-4).forEach(match => {
        const interactionContent = match[1].trim();
        if (!interactions.includes(interactionContent)) {
          interactions.push(interactionContent);
        }
      });
      return interactions;
    }

    getChatContent() {
      try {
        if (window?.SillyTavern?.getContext) {
          const context = window.SillyTavern.getContext();
          if (context?.chat) {
            return context.chat.map(msg => msg.mes || '').join('\n');
          }
        }
        return '';
      } catch (error) {
        console.warn('[Live App] 获取聊天内容失败:', error);
        return '';
      }
    }
  }

  /**
   * 直播状态管理器
   */
  class LiveStateManager {
    constructor() {
      this.liveApp = null;
      this.isLiveActive = false;
      this.currentViewerCount = 0;
      this.currentLiveContent = '';
      this.danmakuList = [];
      this.giftList = [];
      this.recommendedInteractions = [];
      this.pkCoverData = null;
      this.linkCoverData = null;
      this.highLightCount = '0';
      this.systemTips = { tip1: '', tip2: '', tip3: '' };
    }

    startLive() {
      this.isLiveActive = true;
      this.clearAllData(false);
      console.log('[Live App] 直播状态已激活');
    }

    endLive() {
      this.isLiveActive = false;
      console.log('[Live App] 直播状态已停止');
    }

    updateLiveData(liveData) {
        if (!this.isLiveActive) return false;

        let hasChanged = false;

        if (liveData.viewerCount && this.currentViewerCount !== liveData.viewerCount) {
            this.currentViewerCount = liveData.viewerCount;
            hasChanged = true;
        }
        if (liveData.liveContent && this.currentLiveContent !== liveData.liveContent) {
            this.currentLiveContent = liveData.liveContent;
            hasChanged = true;
        }
        if (JSON.stringify(this.recommendedInteractions) !== JSON.stringify(liveData.recommendedInteractions)) {
            this.recommendedInteractions = liveData.recommendedInteractions;
            hasChanged = true;
        }

        const newDanmaku = liveData.danmakuList.filter(d => !this.danmakuList.some(ed => ed.id === d.id));
        if (newDanmaku.length > 0) {
            this.danmakuList.push(...newDanmaku);
            hasChanged = true;
        }

        const newGifts = liveData.giftList.filter(g => !this.giftList.some(eg => JSON.stringify(eg) === JSON.stringify(g)));
        if (newGifts.length > 0) {
            this.giftList.push(...newGifts);
            hasChanged = true;
        }

        if (JSON.stringify(this.pkCoverData) !== JSON.stringify(liveData.pkCoverData)) {
            this.pkCoverData = liveData.pkCoverData;
            hasChanged = true;
        }
        if (JSON.stringify(this.linkCoverData) !== JSON.stringify(liveData.linkCoverData)) {
            this.linkCoverData = liveData.linkCoverData;
            hasChanged = true;
        }
        if (this.highLightCount !== liveData.highLightCount) {
            this.highLightCount = liveData.highLightCount;
            hasChanged = true;
        }
        if (JSON.stringify(this.systemTips) !== JSON.stringify(liveData.systemTips)) {
            this.systemTips = liveData.systemTips;
            hasChanged = true;
        }

        return hasChanged;
    }

    getCurrentState() {
      return {
        isLiveActive: this.isLiveActive,
        viewerCount: this.currentViewerCount,
        liveContent: this.currentLiveContent,
        danmakuList: [...this.danmakuList],
        giftList: [...this.giftList],
        recommendedInteractions: [...this.recommendedInteractions],
        pkCoverData: this.pkCoverData,
        linkCoverData: this.linkCoverData,
        highLightCount: this.highLightCount,
        systemTips: this.systemTips,
      };
    }

    clearAllData(stopLive = true) {
      if(stopLive) this.isLiveActive = false;
      this.currentViewerCount = 0;
      this.currentLiveContent = '';
      this.danmakuList = [];
      this.giftList = [];
      this.recommendedInteractions = [];
      this.pkCoverData = null;
      this.linkCoverData = null;
      this.highLightCount = '0';
      this.systemTips = { tip1: '', tip2: '', tip3: '' };
      console.log('[Live App] 已清空所有直播数据');
    }
  }

  /**
   * 直播应用主类
   */
  class LiveApp {
    constructor() {
      this.eventListener = new LiveEventListener(this);
      this.dataParser = new LiveDataParser();
      this.stateManager = new LiveStateManager();
      this.stateManager.liveApp = this;
      this.handleLiveClickBind = this.handleLiveClick.bind(this);
      this.currentView = 'start';
      this.isInitialized = false;
      this.updateAppContentDebounced = this.debounce(this.updateAppContent, 300);
      this.typingTimer = null;
      this.pendingAppearDanmakuSigs = new Set();
      this.pendingAppearGiftSigs = new Set();

      this.init();
    }

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    init() {
      console.log('[Live App] 初始化...');
      this.detectActiveLive();
      this.isInitialized = true;
    }

    detectActiveLive() {
      try {
        const chatContent = this.dataParser.getChatContent();
        if (this.hasActiveLiveFormats(chatContent)) {
          console.log('[Live App] 🎯 检测到活跃直播，自动恢复状态');
          this.stateManager.startLive();
          this.currentView = 'live';
          const liveData = this.dataParser.parseLiveData(chatContent);
          this.stateManager.updateLiveData(liveData);
          this.eventListener.startListening();
        } else {
          this.stateManager.endLive();
          this.currentView = 'start';
        }
      } catch (error) {
        console.error('[Live App] 检测活跃直播失败:', error);
      }
    }

    hasActiveLiveFormats(content) {
      if (!content) return false;
      const activeLivePatterns = [
        /\[直播\|本场人数\|[^\]]+\]/,
        /\[直播\|直播内容\|[^\]]+\]/,
        /\[直播\|[^|]+\|弹幕\|[^\]]+\]/,
        /\[直播\|[^|]+\|(?:打赏|礼物)\|[^\]]+\]/,
        /\[直播\|推荐互动\|[^\]]+\]/,
        /\[PK封面\|/,
        /\[连麦封面\|/,
      ];
      return activeLivePatterns.some(pattern => pattern.test(content));
    }

    get isLiveActive() {
      return this.stateManager.isLiveActive;
    }

    async startLive(initialInteraction) {
      try {
        console.log('[Live App] 开始直播:', initialInteraction);
        this.stateManager.startLive();
        this.currentView = 'live';
        this.eventListener.startListening();
        const message = `用户开始直播，初始互动为（${initialInteraction}），请按照正确的直播格式要求生成本场人数，直播内容，弹幕，打赏和推荐互动，最后需要生成四条推荐互动。若处于PK或粉丝连麦模式则必须在开头生成封面卡片，禁止使用错误格式。`;
        await this.sendToSillyTavern(message);
        this.updateAppContent();
      } catch (error) {
        console.error('[Live App] 开始直播失败:', error);
      }
    }

    async endLive() {
      try {
        console.log('[Live App] 结束直播');
        this.eventListener.stopListening();
        await this.convertLiveToHistory();
        this.stateManager.endLive();
        this.currentView = 'start';
        this.updateAppContent();
        this.showToast('直播已结束', 'success');
      } catch (error) {
        console.error('[Live App] 结束直播失败:', error);
      }
    }

    async continueInteraction(interaction) {
      if (!this.isLiveActive) return;
      try {
        const message = `用户继续直播，互动为（${interaction}），请按照正确的直播格式要求生成本场人数，直播内容，弹幕，打赏和推荐互动，最后需要生成四条推荐互动。若处于PK或粉丝连麦模式则必须在开头生成封面卡片，禁止使用错误格式。`;
        await this.sendToSillyTavern(message);
      } catch (error) {
        console.error('[Live App] 继续互动失败:', error);
      }
    }

    async parseNewLiveData() {
      try {
        console.log('[Live App] 正在解析新数据...');
        const chatContent = this.dataParser.getChatContent();
        if (!chatContent) return;

        const existingDanmakuSigs = new Set(this.stateManager.danmakuList.map(this.createDanmakuSignature));
        const liveData = this.dataParser.parseLiveData(chatContent);

        liveData.danmakuList.forEach(item => {
            const sig = this.createDanmakuSignature(item);
            if (!existingDanmakuSigs.has(sig)) {
                this.pendingAppearDanmakuSigs.add(sig);
            }
        });

        const hasChanged = this.stateManager.updateLiveData(liveData);

        if (hasChanged) {
            console.log('[Live App] 数据有变化，触发UI更新。');
            this.updateAppContentDebounced();
        } else {
            console.log('[Live App] 数据无变化，不更新UI。');
        }
      } catch (error) {
        console.error('[Live App] 解析直播数据失败:', error);
      }
    }

    updateAppContent() {
      const content = this.getAppContent();
      const appElement = document.getElementById('app-content');
      if (appElement) {
        appElement.innerHTML = content;
        setTimeout(() => {
          this.bindEvents();
          this.updateHeader();
          if (this.currentView === 'live') {
            const state = this.stateManager.getCurrentState();
            const liveContentEl = document.querySelector('.live-content-text');
            if (liveContentEl) {
              this.applyTypingEffect(liveContentEl, state.liveContent || '');
            }
            this.runAppearSequence();
          }
        }, 50);
      }
    }

    getAppContent() {
      return this.currentView === 'live' ? this.renderLiveView() : this.renderStartView();
    }

    renderStartView() {
      return `
        <div class="live-app">
          <div class="live-main-container">
            <div class="live-main-header"><h2>直播中心</h2><p>选择你想要的直播功能</p></div>
            <div class="live-options">
              <div class="live-option-card" id="start-streaming-option"><div class="option-icon">🎥</div><div class="option-content"><h3>自由直播</h3><p>随心所欲，包罗万象</p></div><div class="option-arrow">→</div></div>
              <div class="live-option-card" id="feature-streaming-option"><div class="option-icon">✨</div><div class="option-content"><h3>特色直播</h3><p>PK直播/粉丝连麦模式</p></div><div class="option-arrow">→</div></div>
              <div class="live-option-card" id="watch-streaming-option"><div class="option-icon">📀</div><div class="option-content"><h3>观看直播</h3><p>观看其他主播的精彩直播</p></div><div class="option-arrow">→</div></div>
            </div>
          </div>
          <div class="modal" id="start-live-modal" style="display: none;"><div class="modal-content"><div class="modal-header"><h3>自由直播</h3><button class="modal-close-btn">×</button></div><div class="modal-body"><div class="custom-interaction-section"><textarea id="custom-interaction-input" placeholder="输入自定义互动内容..." rows="3"></textarea></div><div class="preset-interactions"><h4>预设互动</h4><div class="preset-buttons"><button class="preset-btn" data-interaction="和观众打个招呼">👋 和观众打个招呼</button><button class="preset-btn" data-interaction="分享今天的心情">😊 分享今天的心情</button><button class="preset-btn" data-interaction="聊聊最近的趣事">💬 聊聊最近的趣事</button><button class="preset-btn" data-interaction="唱首歌给大家听">🎵 唱首歌给大家听</button></div></div><button class="start-live-btn" id="start-custom-live">开始直播</button></div></div></div>
          <div class="modal" id="feature-live-modal" style="display: none;"><div class="modal-content"><div class="modal-header"><h3>选择特色直播模式</h3><button class="modal-close-btn">×</button></div><div class="modal-body"><div class="feature-mode-buttons"><button class="feature-mode-btn" data-mode="pk">🆚 PK直播模式</button><button class="feature-mode-btn" data-mode="connect">🎙 粉丝连麦模式</button></div><div class="modal" id="pk-input-modal" style="display: none;"><div class="modal-content"><div class="modal-header"><h3>PK直播</h3><button class="modal-close-btn">×</button></div><div class="modal-body"><div class="input-section"><label>输入你要PK的主播</label><input type="text" id="pk-anchor-input" placeholder="例如：嘿嘿"></div><button class="start-live-btn" id="start-pk-live">提交</button></div></div></div><div class="modal" id="connect-select-modal" style="display: none;"><div class="modal-content"><div class="modal-header"><h3>粉丝连麦</h3><button class="modal-close-btn">×</button></div><div class="modal-body"><div class="preset-interactions"><h4>选择连麦对象</h4><div class="preset-buttons"><button class="preset-btn" data-anchor="霍">霍</button><button class="preset-btn" data-anchor="X">X</button><button class="preset-btn" data-anchor="难言">难言</button><button class="preset-btn" data-anchor="神秘人">神秘人</button></div></div><div class="input-section"><label>或输入自定义昵称</label><input type="text" id="connect-anchor-input" placeholder="自定义连麦对象"></div><button class="start-live-btn" id="start-connect-live">提交</button></div></div></div></div></div></div>
        </div>
      `;
    }

    renderLiveView() {
      const state = this.stateManager.getCurrentState();
      const liveTheme = state.pkCoverData ? 'pk' : (state.linkCoverData ? 'link' : '');
      const { pkCoverData, linkCoverData, highLightCount, systemTips } = state;
      let featureCardHtml = '';

      if (pkCoverData) {
        const { userPk, rivalPk } = pkCoverData;
        const userCurrencyNum = parseFloat(userPk.currency) || 0;
        const rivalCurrencyNum = parseFloat(rivalPk.currency) || 0;
        const total = userCurrencyNum + rivalCurrencyNum;
        const userProgress = total > 0 ? Math.round((userCurrencyNum / total) * 100) : 50;

        featureCardHtml = `<div class="feature-card ${liveTheme}-card"><div class="feature-card-toggle" id="pk-card-toggle">🆚 PK封面卡片 <span class="toggle-icon">▼</span></div><div class="feature-card-content" id="pk-card-content" style="display: none; padding: 5px 15px; background: var(--card-gradient);"><div class="pk-streamer-container" style="display: flex; justify-content: space-between; align-items: center;"><div class="streamer-card" style="text-align: center;"><div class="streamer-image"><img src="${userPk.imgUrl}" alt="${userPk.type}"></div><div>${userPk.type}</div></div><div class="pk-vs">PK</div><div class="streamer-card" style="text-align: center;"><div class="streamer-image"><img src="${rivalPk.imgUrl}" alt="${rivalPk.type}"></div><div>${rivalPk.type}</div></div></div><div class="pk-progress-bar"><div class="pk-currency-left">${userPk.currency}</div><div class="pk-progress-container"><div class="pk-progress-left" style="width: ${userProgress}%;"></div></div><div class="pk-currency-right">${rivalPk.currency}</div></div><div class="high-tide-box"><div>🔥 高光次数: <span>${highLightCount}</span></div><div>系统提示：</div><div class="system-tip-line">${systemTips.tip1}</div><div class="system-tip-line">${systemTips.tip2}</div><div class="system-tip-line">${systemTips.tip3}</div></div></div></div>`;
      } else if (linkCoverData) {
        const { userLink, fanLink } = linkCoverData;
        featureCardHtml = `<div class="feature-card ${liveTheme}-card"><div class="feature-card-toggle" id="link-card-toggle">🎤 连麦直播卡片 <span class="toggle-icon">▼</span></div><div class="feature-card-content" id="link-card-content" style="display: none; padding: 5px 15px; background: var(--card-gradient);"><div class="link-streamer-container" style="display: flex; justify-content: space-around; align-items: center;"><div class="streamer-card" style="text-align: center;"><div class="streamer-image"><img src="${userLink.imgUrl}" alt="${userLink.type}"></div><div>${userLink.type}</div></div><div class="link-heart-connector">❤️</div><div class="streamer-card" style="text-align: center;"><div class="streamer-image"><img src="${fanLink.imgUrl}" alt="${fanLink.type}"></div><div>${fanLink.type}</div></div></div><div class="high-tide-box"><div>🔥 高光次数: <span>${highLightCount}</span></div><div>系统提示：</div><div class="system-tip-line">${systemTips.tip1}</div><div class="system-tip-line">${systemTips.tip2}</div><div class="system-tip-line">${systemTips.tip3}</div></div></div></div>`;
      }

      const recommendedButtons = state.recommendedInteractions.map(i => `<button class="rec-btn" data-interaction="${i}">${i}</button>`).join('');
      const danmakuItems = state.danmakuList.map(d => {
          const sig = this.createDanmakuSignature(d);
          const needAppearClass = this.pendingAppearDanmakuSigs.has(sig) ? ' need-appear' : '';
          return d.type === 'gift'
              ? `<div class="danmaku-item gift${needAppearClass}" data-sig="${sig}"><i class="fas fa-gift"></i> <span class="username">${d.username}</span> <span class="content">送出 ${d.content}</span></div>`
              : `<div class="danmaku-item normal${needAppearClass}" data-sig="${sig}"><span class="username">${d.username}:</span> <span class="content">${d.content}</span></div>`;
      }).join('');

      return `<div class="live-app"><div class="live-container">${featureCardHtml}<div class="video-placeholder"><p class="live-content-text">${state.liveContent || '等待直播内容...'}</p><div class="live-status-bottom"><div class="live-dot" style="background: var(--live-danger-red);"></div><span>LIVE</span></div></div><div class="interaction-panel"><div class="interaction-header"><h4>推荐互动：</h4><button class="interact-btn" id="custom-interact-btn"><i class="fas fa-pen-nib"></i> 自定义互动</button></div><div class="recommended-interactions">${recommendedButtons || '<p>等待推荐互动...</p>'}</div></div><div class="danmaku-container" id="danmaku-container"><div class="danmaku-list" id="danmaku-list">${danmakuItems || '<div>等待弹幕...</div>'}</div></div></div></div>`;
    }

    handleLiveClick(e) {
      this.toggleCard(e, '#pk-card-toggle', '#pk-card-content');
      this.toggleCard(e, '#link-card-toggle', '#link-card-content');
    }

    toggleCard(e, toggleSelector, contentSelector) {
        const toggle = e.target.closest(toggleSelector);
        if(toggle) {
            const content = document.querySelector(contentSelector);
            const icon = toggle.querySelector('.toggle-icon');
            if(content && icon) {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                icon.textContent = isHidden ? '▲' : '▼';
            }
        }
    }

    bindEvents() {
      const appContainer = document.getElementById('app-content');
      if (!appContainer) return;

      this.removeOldEventListeners();

      appContainer.addEventListener('click', this.handleLiveClickBind);

      if (this.currentView === 'start') {
        this.bindStartViewEvents(appContainer);
      } else if (this.currentView === 'live') {
        this.bindLiveViewEvents(appContainer);
      }
      this.bindModalEvents(appContainer);
    }

    removeOldEventListeners(){
        const appContainer = document.getElementById('app-content');
        if(appContainer) appContainer.removeEventListener('click', this.handleLiveClickBind);
    }

    bindStartViewEvents(container) {
      container.querySelector('#start-streaming-option')?.addEventListener('click', () => this.showModal('start-live-modal'));
      container.querySelector('#feature-streaming-option')?.addEventListener('click', () => this.showModal('feature-live-modal'));
      container.querySelector('#watch-streaming-option')?.addEventListener('click', () => window.mobilePhone?.openApp('watch-live'));
    }

    bindLiveViewEvents(container) {
      container.querySelectorAll('.rec-btn').forEach(btn => btn.addEventListener('click', () => this.continueInteraction(btn.dataset.interaction)));
      container.querySelector('#custom-interact-btn')?.addEventListener('click', () => this.showModal('interaction-modal'));
    }

    bindModalEvents(container) {
        container.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', () => this.hideAllModals()));
        container.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', e => { if (e.target === modal) this.hideAllModals(); }));
        this.bindFeatureModalEvents(container);
    }

    bindFeatureModalEvents(container){
        container.querySelector('.feature-mode-btn[data-mode="pk"]')?.addEventListener('click', () => this.showModal('pk-input-modal'));
        container.querySelector('.feature-mode-btn[data-mode="connect"]')?.addEventListener('click', () => this.showModal('connect-select-modal'));

        container.querySelector('#start-custom-live')?.addEventListener('click', () => {
            const input = container.querySelector('#custom-interaction-input');
            if (input?.value.trim()) { this.hideModal('start-live-modal'); this.startLive(input.value.trim()); }
        });

        container.querySelector('#start-pk-live')?.addEventListener('click', () => {
            const input = container.querySelector('#pk-anchor-input');
            if (input?.value.trim()) { this.hideAllModals(); this.startLive(`与${input.value.trim()}进行直播PK`); }
        });

        container.querySelector('#start-connect-live')?.addEventListener('click', () => {
            const input = container.querySelector('#connect-anchor-input');
            const anchor = container.querySelector('.preset-btn.active')?.dataset.anchor || input?.value.trim();
            if (anchor) { this.hideAllModals(); this.startLive(`与${anchor}进行直播连麦`); }
        });

        container.querySelectorAll('#feature-live-modal .preset-btn').forEach(btn => {
           btn.addEventListener('click', () => {
               container.querySelectorAll('#feature-live-modal .preset-btn').forEach(b => b.classList.remove('active'));
               btn.classList.add('active');
           });
        });
    }

    jumpToBottomIfNeeded(container) {
      if (container.scrollHeight - (container.scrollTop + container.clientHeight) > 10) {
        container.scrollTop = container.scrollHeight;
      }
    }

    showModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = 'flex';
    }

    hideModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = 'none';
    }

    hideAllModals() {
      document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    }

    async sendToSillyTavern(message) {
      const textarea = document.querySelector('#send_textarea');
      const sendButton = document.querySelector('#send_but');
      if (textarea && sendButton) {
        textarea.value = message;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        sendButton.click();
      } else {
        throw new Error('未找到输入框或发送按钮');
      }
    }

    async convertLiveToHistory() {
      // 省略此实现以保持简洁
    }

    convertLiveFormats(content) {
      // 省略此实现
      return content.replace(/\[直播\|/g, '[直播历史|');
    }

    updateHeader() {
      if (window.mobilePhone && window.mobilePhone.updateAppHeader) {
        window.mobilePhone.updateAppHeader({
          app: 'live',
          title: this.currentView === 'live' ? '直播中' : '直播',
          view: this.currentView,
          viewerCount: this.stateManager.currentViewerCount,
        });
      }
    }

    showToast(message, type = 'info') {
      // 省略此实现
    }

    applyTypingEffect(element, fullText) {
      if (this.typingTimer) clearInterval(this.typingTimer);
      if (element.getAttribute('data-full-text') === fullText) return;
      element.setAttribute('data-full-text', fullText);
      element.textContent = '';
      let index = 0;
      this.typingTimer = setInterval(() => {
        if (index >= fullText.length) {
          clearInterval(this.typingTimer);
          return;
        }
        element.textContent += fullText[index++];
      }, 35);
    }

    destroy() {
      console.log('[Live App] 销毁应用');
      this.eventListener.stopListening();
      if(this.typingTimer) clearInterval(this.typingTimer);
      this.stateManager.clearAllData();
      this.isInitialized = false;
    }

    createDanmakuSignature(item) {
      return `${item.username}|${item.content}|${item.type}`;
    }

    sequentialReveal(nodes) {
        if (!nodes || nodes.length === 0) return;
        nodes.forEach(el => el.style.display = 'none');
        nodes.forEach((el, idx) => {
            setTimeout(() => {
                el.style.display = '';
                el.classList.add('appear-show');
                el.scrollIntoView({ block: 'end', behavior: 'smooth' });
            }, (idx + 1) * 200);
        });
    }

    runAppearSequence() {
      this.sequentialReveal(document.querySelectorAll('.danmaku-item.need-appear'));
      this.pendingAppearDanmakuSigs.clear();
    }
  }

  window.LiveApp = LiveApp;
  if (!window.liveApp) {
    window.liveApp = new LiveApp();
  }

  window.getLiveAppContent = function () {
    if (!window.liveApp) window.liveApp = new LiveApp();
    window.liveApp.detectActiveLive();
    window.liveApp.updateHeader();
    return window.liveApp.getAppContent();
  };

  window.bindLiveAppEvents = function () {
    if (!window.liveApp) return;
    setTimeout(() => {
      window.liveApp.bindEvents();
      window.liveApp.updateHeader();
    }, 100);
  };

  window.liveAppDestroy = function() {
      if(window.liveApp) {
          window.liveApp.destroy();
          window.liveApp = null;
      }
  }

  console.log('[Live App] 直播应用模块已加载');
}
