/**
 * 手机前端框架
 * 可爱的iOS风格手机界面
 */
class MobilePhone {
  constructor() {
    this.isVisible = false;
    this.currentApp = null;
    this.apps = {};
    this.appStack = [];
    this.currentAppState = null;
    this.dragHelper = null;
    this.frameDragHelper = null;
    this._openingApp = null;
    this._goingHome = false;
    this._returningToApp = null;
    this._lastAppIconClick = 0;
    this._lastBackButtonClick = 0;
    this._loadingApps = new Set();
    this._userNavigationIntent = null;
    this._loadingStartTime = {};
    this.init();
  }

  init() {
    this.loadDragHelper();
    this.clearPositionCache();
    this.createPhoneButton();
    this.createPhoneContainer();
    this.registerApps();
    this.startClock();
    setTimeout(() => {
      this.initTextColor();
    }, 1000);
  }

  loadDragHelper() {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '/scripts/extensions/third-party/mobile/drag-helper.css';
    document.head.appendChild(cssLink);

    if (typeof DragHelper === 'undefined') {
      const script = document.createElement('script');
      script.src = '/scripts/extensions/third-party/mobile/drag-helper.js';
      script.onload = () => {
        console.log('[Mobile Phone] 拖拽插件加载成功');
      };
      script.onerror = () => {
        console.error('[Mobile Phone] 拖拽插件加载失败');
      };
      document.head.appendChild(script);
    }
  }

  createPhoneButton() {
    try {
      const existingButton = document.getElementById('mobile-phone-trigger');
      if (existingButton) {
        existingButton.remove();
      }

      const button = document.createElement('button');
      button.id = 'mobile-phone-trigger';
      button.className = 'mobile-phone-trigger';
      button.innerHTML = '📱';
      button.title = '打开手机界面';
      button.addEventListener('click', () => this.togglePhone());

      if (!document.body) {
        console.error('[Mobile Phone] 严重错误：document.body 仍不存在！');
        setTimeout(() => this.createPhoneButton(), 500);
        return;
      }

      document.body.appendChild(button);
      this.initDragForButton(button);
    } catch (error) {
      console.error('[Mobile Phone] 创建按钮时发生错误:', error.stack);
    }
  }

  initDragForButton(button) {
    const tryInitDrag = () => {
      if (typeof DragHelper !== 'undefined') {
        if (this.dragHelper) {
          this.dragHelper.destroy();
        }
        this.dragHelper = new DragHelper(button, {
          boundary: document.body,
          clickThreshold: 8,
          dragClass: 'mobile-phone-trigger-dragging',
          savePosition: false,
          storageKey: 'mobile-phone-trigger-position',
        });
      } else {
        setTimeout(tryInitDrag, 100);
      }
    };
    tryInitDrag();
  }

  clearPositionCache() {
    try {
      localStorage.removeItem('mobile-phone-trigger-position');
      localStorage.removeItem('mobile-phone-frame-position');
    } catch (error) {
      console.warn('[Mobile Phone] 清理位置缓存时发生错误:', error);
    }
  }

  initFrameDrag() {
    const tryInitFrameDrag = () => {
      if (typeof DragHelper !== 'undefined') {
        const phoneFrame = document.querySelector('.mobile-phone-frame');
        if (phoneFrame) {
          if (this.frameDragHelper) {
            this.frameDragHelper.destroy();
          }
          this.frameDragHelper = new DragHelper(phoneFrame, {
            boundary: document.body,
            clickThreshold: 10,
            dragClass: 'mobile-phone-frame-dragging',
            savePosition: false,
            storageKey: 'mobile-phone-frame-position',
            touchTimeout: 300,
            dragHandle: '.mobile-status-bar',
          });
        }
      } else {
        setTimeout(tryInitFrameDrag, 100);
      }
    };
    tryInitFrameDrag();
  }

  createPhoneContainer() {
    try {
      const existingContainer = document.getElementById('mobile-phone-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      const container = document.createElement('div');
      container.id = 'mobile-phone-container';
      container.className = 'mobile-phone-container';
      container.style.display = 'none';
      container.innerHTML = `
                <div class="mobile-phone-overlay"></div>
                <div class="mobile-phone-frame">
                    <div class="mobile-phone-screen">
                        <div class="mobile-status-bar">
                            <div class="status-left">
                                <span class="time" id="mobile-time">08:08</span>
                            </div>
                            <div class="status-center">
                                <div class="dynamic-island"></div>
                            </div>
                            <div class="status-right">
                                <span class="battery">
                                    <span class="battery-icon">🔋</span>
                                    <span class="battery-text">100%</span>
                                </span>
                            </div>
                        </div>
                        <div class="mobile-content" id="mobile-content">
                            <div class="home-screen" id="home-screen">
                                <div class="weather-card">
                                    <div class="weather-time">
                                        <span class="current-time" id="home-time">08:08</span>                                  
                                    </div>
                                </div>
                                <div class="app-grid">
                                    <div class="app-row">
                                        <div class="app-icon" data-app="shop">
                                            <div class="app-icon-bg purple">🛍</div>
                                            <span class="app-label">购物</span>
                                        </div>
                                        <div class="app-icon" data-app="task">
                                            <div class="app-icon-bg purple">📝</div>
                                            <span class="app-label">手帐</span>
                                        </div>
                                        <div class="app-icon" data-app="messages">
                                            <div class="app-icon-bg pink">💬</div>
                                            <span class="app-label">信息</span>
                                        </div>                                  
                                    </div>
                                    <div class="app-row">
                                        <div class="app-icon" data-app="aoka">
                                            <div class="app-icon-bg orange">🐾</div>
                                            <span class="app-label">嗷咔</span>
                                        </div>
                                        <div class="app-icon" data-app="live">
                                            <div class="app-icon-bg red">🎥</div>
                                            <span class="app-label">直播</span>
                                        </div>
                                        <div class="app-icon" data-app="yuse-theater">
                                            <div class="app-icon-bg pink">🎬</div>
                                            <span class="app-label">欲色剧场</span>
                                        </div>
                                    </div>
                                    <div class="app-row">
                                        <div class="app-icon" data-app="forum">
                                            <div class="app-icon-bg red">📰</div>
                                            <span class="app-label">论坛</span>
                                        </div>
                                        <div class="app-icon" data-app="weibo">
                                            <div class="app-icon-bg orange" style="font-size: 22px;color:rgba(0,0,0,0.4)">🧣</div>
                                            <span class="app-label">微博</span>
                                        </div>                         
                                        <div class="app-icon" data-app="redbook">
                                            <div class="app-icon-bg purple">🍠</div>
                                            <span class="app-label">小红书</span>
                                        </div>
                                    </div>
                                    <div class="app-row">
                                        <div class="app-icon" data-app="browser">
                                            <div class="app-icon-bg orange">💻</div>
                                            <span class="app-label">浏览器</span>
                                        </div>
                                        <div class="app-icon" data-app="api">
                                            <div class="app-icon-bg orange" style="font-size: 22px;color:rgba(0,0,0,0.4)">AI</div>
                                            <span class="app-label">API</span>
                                        </div>
                                        <div class="app-icon" data-app="settings">
                                            <div class="app-icon-bg purple">⚙️</div>
                                            <span class="app-label">设置</span>
                                        </div>
                                    </div>
                                    <div style="display: none;">
                                        <div class="app-icon" data-app="gallery">
                                            <div class="app-icon-bg blue">📸</div>
                                            <span class="app-label">相册</span>
                                        </div>
                                        <div class="app-icon" data-app="mail">
                                            <div class="app-icon-bg orange">✉️</div>
                                            <span class="app-label">邮件</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="bottom-decoration">
                                    <div class="cute-animal">🐱</div>
                                    <div class="cute-animal">🐶</div>
                                </div>
                            </div>
                            <div class="app-screen" id="app-screen" style="display: none;">
                                <div class="app-header" id="app-header">
                                    <button class="back-button" id="back-button">
                                        <span class="back-icon">←</span>
                                    </button>
                                    <h1 class="app-title" id="app-title">应用</h1>
                                    <div class="app-header-right" id="app-header-right">
                                    </div>
                                </div>
                                <div class="app-content" id="app-content">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

      if (!document.body) {
        console.error('[Mobile Phone] document.body 不存在，延迟创建容器');
        setTimeout(() => this.createPhoneContainer(), 100);
        return;
      }

      document.body.appendChild(container);
      this.bindEvents();
      this.initFrameDrag();
    } catch (error) {
      console.error('[Mobile Phone] 创建容器时发生错误:', error);
    }
  }

  bindEvents() {
    document.querySelector('.mobile-phone-overlay').addEventListener('click', () => {
      const isCompatibilityMode =
        window.MobileContextPlugin &&
        window.MobileContextPlugin.getSettings &&
        window.MobileContextPlugin.getSettings().tavernCompatibilityMode;
      if (!isCompatibilityMode) {
        this.hidePhone();
      }
    });

    document.getElementById('back-button').addEventListener('click', () => {
      if (this._lastBackButtonClick && Date.now() - this._lastBackButtonClick < 300) {
        return;
      }
      this._lastBackButtonClick = Date.now();
      this.handleBackButton();
    });

    document.querySelectorAll('.app-icon').forEach(icon => {
      icon.addEventListener('click', e => {
        const appName = e.currentTarget.getAttribute('data-app');
        if (this._lastAppIconClick && Date.now() - this._lastAppIconClick < 300) {
          return;
        }
        this._lastAppIconClick = Date.now();
        this.openApp(appName);
      });
    });
  }

  handleBackButton() {
    this._userNavigationIntent = null;

    if (!this.currentAppState) {
      this.goHome();
      return;
    }

    const currentApp = this.currentAppState.app;
    const atRoot = this.isCurrentlyAtAppRoot(currentApp, this.currentAppState);

    if (this.currentApp && this.currentApp !== currentApp) {
      this.currentApp = currentApp;
    }

    if (!atRoot) {
      this.returnToAppMain(currentApp);
      return;
    }

    this.goHome();
  }

  returnToForumMainList() {
    const forumMainState = {
      app: 'forum',
      title: '论坛',
      view: 'main',
    };
    this.appStack = [forumMainState];
    this.currentAppState = forumMainState;
    this.currentApp = 'forum';
    this.updateAppHeader(forumMainState);

    if (window.getForumAppContent && window.bindForumEvents) {
      const forumContent = window.getForumAppContent();
      if (forumContent) {
        document.getElementById('app-content').innerHTML = forumContent;
        window.bindForumEvents();
        if (window.forumUI) {
          window.forumUI.currentThreadId = null;
          if (window.forumUI.resetState) {
            window.forumUI.resetState();
          }
        }
      } else {
        this.handleForumApp();
      }
    } else {
      this.handleForumApp();
    }
  }

  returnToMessageList() {
    const messageListState = {
      app: 'messages',
      title: '信息',
      view: 'messageList',
    };
    this.appStack = [messageListState];
    this.currentAppState = messageListState;
    this.updateAppHeader(messageListState);

    if (window.messageApp && window.messageApp.showMessageList) {
      window.messageApp.currentView = 'messageList';
      window.messageApp.currentFriendId = null;
      window.messageApp.currentFriendName = null;
      window.messageApp.showMessageList();
    }
  }

  isAppRootPage(state) {
    if (!state) return false;

    if (state.app === 'messages') {
      return state.view === 'messageList' || state.view === 'main' || state.view === 'list';
    }

    if (state.app === 'forum') {
      return state.view === 'main' || !state.view || state.view === 'list';
    }

    return state.view === 'main';
  }

  restoreAppState(state) {
    this.currentAppState = state;
    this.updateAppHeader(state);

    if (state.app === 'messages') {
      if (state.view === 'messageList' || state.view === 'list') {
        if (window.messageApp) {
          window.messageApp.currentView = 'list';
          window.messageApp.currentFriendId = null;
          window.messageApp.currentFriendName = null;
          window.messageApp.updateAppContent();
        }
      } else if (state.view === 'messageDetail') {
        if (window.messageApp) {
          window.messageApp.currentView = 'messageDetail';
          window.messageApp.currentFriendId = state.friendId;
          window.messageApp.currentFriendName = state.friendName;
          window.messageApp.updateAppContent();
        }
      } else if (state.view === 'addFriend') {
        if (window.messageApp) {
          window.messageApp.currentView = 'addFriend';
          window.messageApp.currentTab = 'add';
          window.messageApp.updateAppContent();
        }
      } else if (state.view === 'friendsCircle') {
        if (window.messageApp) {
          window.messageApp.currentMainTab = 'circle';
          window.messageApp.currentView = 'list';
          if (window.messageApp.friendsCircle) {
            window.messageApp.friendsCircle.activate();
          } else {
            window.messageApp.initFriendsCircle();
            setTimeout(() => {
              if (window.messageApp.friendsCircle) {
                window.messageApp.friendsCircle.activate();
              }
            }, 100);
          }
          window.messageApp.updateAppContent();
          setTimeout(() => {
            const circleState = {
              app: 'messages',
              view: 'friendsCircle',
              title: '朋友圈',
              showBackButton: false,
              showAddButton: true,
              addButtonIcon: 'fas fa-camera',
              addButtonAction: () => {
                if (window.friendsCircle) {
                  window.friendsCircle.showPublishModal();
                }
              },
            };
            this.currentAppState = circleState;
            this.updateAppHeader(circleState);
          }, 200);
        }
      }
    } else if (state.app === 'forum') {
      if (state.view === 'threadDetail' && state.threadId) {
        if (window.forumUI) {
          window.forumUI.currentThreadId = state.threadId;
          const forumContent = document.getElementById('forum-content');
          if (forumContent) {
            forumContent.innerHTML = window.forumUI.getThreadDetailHTML(state.threadId);
            window.forumUI.bindReplyEvents();
          }
        }
      } else if (state.view === 'forumControl') {
        this.handleForumApp();
      } else {
        if (window.forumUI) {
          window.forumUI.currentThreadId = null;
          const forumContent = document.getElementById('forum-content');
          if (forumContent) {
            forumContent.innerHTML = window.forumUI.getThreadListHTML();
            if (window.bindForumEvents) {
              window.bindForumEvents();
            }
          }
        } else {
          this.handleForumApp();
        }
      }
    }
  }

  updateAppHeader(state) {
    const titleElement = document.getElementById('app-title');
    const headerRight = document.getElementById('app-header-right');
    if (!state) {
      titleElement.textContent = '应用';
      headerRight.innerHTML = '';
      return;
    }

    titleElement.textContent = state.title || this.apps[state.app]?.name || '应用';

    const appScreen = document.getElementById('app-screen');
    const appContent = document.getElementById('app-content');
    const appHeader = document.getElementById('app-header');
    if (appScreen) {
      appScreen.setAttribute('data-app', state.app || '');
      appScreen.setAttribute('data-view', state.view || 'main');
      Array.from(appScreen.classList).forEach(c => {
        if (c.startsWith('app-root-')) appScreen.classList.remove(c);
      });
      if (this.isAppRootPage(state)) {
        appScreen.classList.add(`app-root-${state.app}`);
      }
    }
    if (appContent) {
      appContent.setAttribute('data-app', state.app || '');
      appContent.setAttribute('data-view', state.view || 'main');
    }
    if (appHeader) {
      appHeader.setAttribute('data-app', state.app || '');
      appHeader.setAttribute('data-view', state.view || 'main');
    }

    headerRight.innerHTML = '';

    // 欲色剧场专属页眉按钮逻辑（状态驱动+即时销毁）
    if (state.app === 'yuse-theater') {
      // 1. 清理残留按钮（即时销毁）
      const existingRefreshBtn = document.getElementById('yuse-refresh-btn');
      if (existingRefreshBtn) existingRefreshBtn.remove();
      
      // 2. 创建刷新按钮（状态驱动）
      const refreshBtn = document.createElement('button');
      refreshBtn.id = 'yuse-refresh-btn';
      refreshBtn.className = 'app-header-btn yuse-theater-btn';
      refreshBtn.innerHTML = '<<i class="fas fa-sync-alt"></</i>';
      refreshBtn.title = '刷新剧场内容';
      
      // 3. 绑定点击事件（触发自定义刷新方法）
      refreshBtn.addEventListener('click', () => {
        if (window.yuseTheaterApp && typeof window.yuseTheaterApp.refreshTheater === 'function') {
          window.yuseTheaterApp.refreshTheater();
        }
      });
      
      headerRight.appendChild(refreshBtn);
      console.log('[YuseTheater] 激活专属按钮: yuse-refresh-btn');
    } 
    // Task应用原有逻辑
    else if (state.app === 'task') {
      const viewBtn = document.createElement('button');
      viewBtn.className = 'app-header-btn';
      viewBtn.innerHTML = '查看';
      viewBtn.title = '查看任务';
      viewBtn.addEventListener('click', () => {
        if (window.taskAppSendViewMessage) {
          window.taskAppSendViewMessage();
        }
      });
      headerRight.appendChild(viewBtn);
    }
    // 其他应用原有逻辑
    else if (state.app === 'messages') {
      if (state.view === 'messageList' || state.view === 'list') {
        const textColorBtn = document.createElement('button');
        textColorBtn.className = 'app-header-btn text-color-toggle';
        textColorBtn.innerHTML = this.getCurrentTextColor() === 'white' ? '黑' : '白';
        textColorBtn.title = '切换文字颜色';
        textColorBtn.addEventListener('click', () => this.toggleTextColor());
        headerRight.appendChild(textColorBtn);

        const imageConfigBtn = document.createElement('button');
        imageConfigBtn.className = 'app-header-btn';
        imageConfigBtn.innerHTML = '<<i class="fas fa-image"></</i>';
        imageConfigBtn.title = '图片设置';
        imageConfigBtn.addEventListener('click', () => this.showImageConfigModal());
        headerRight.appendChild(imageConfigBtn);

        const addFriendBtn = document.createElement('button');
        addFriendBtn.className = 'app-header-btn';
        addFriendBtn.innerHTML = '➕';
        addFriendBtn.title = '添加好友';
        addFriendBtn.addEventListener('click', () => this.showAddFriend());
        headerRight.appendChild(addFriendBtn);
      } else if (state.view === 'messageDetail') {
        if (state.friendId && !this.isGroupChat(state.friendId)) {
          const photoBtn = document.createElement('button');
          photoBtn.className = 'app-header-btn';
          photoBtn.innerHTML = '<<i class="fas fa-image"></</i>';
          photoBtn.title = '相片设置';
          photoBtn.addEventListener('click', () => this.showFriendImageConfigModal(state.friendId, state.friendName));
          headerRight.appendChild(photoBtn);
        }

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'app-header-btn';
        refreshBtn.innerHTML = '<<i class="fas fa-sync-alt"></</i>';
        refreshBtn.title = '刷新消息';
        refreshBtn.addEventListener('click', () => this.refreshMessageDetail());
        headerRight.appendChild(refreshBtn);
      } else if (state.view === 'addFriend') {
        const saveBtn = document.createElement('button');
        saveBtn.className = 'app-header-btn';
        saveBtn.innerHTML = '✅';
        saveBtn.title = '保存';
        saveBtn.addEventListener('click', () => this.saveAddFriend());
        headerRight.appendChild(saveBtn);
      } else if (state.view === 'friendsCircle') {
        const generateBtn = document.createElement('button');
        generateBtn.className = 'app-header-btn';
        generateBtn.innerHTML = '<<i class="fas fa-sync-alt"></</i>';
        generateBtn.title = '生成朋友圈';
        generateBtn.addEventListener('click', () => {
          this.generateFriendsCircleContent();
        });
        headerRight.appendChild(generateBtn);

        const cameraBtn = document.createElement('button');
        cameraBtn.className = 'app-header-btn';
        cameraBtn.innerHTML = '<<i class="fas fa-camera"></</i>';
        cameraBtn.title = '发布朋友圈';
        cameraBtn.addEventListener('click', () => {
          if (window.friendsCircle) {
            window.friendsCircle.showPublishModal();
          }
        });
        headerRight.appendChild(cameraBtn);
      }
    } else if (state.app === 'gallery') {
      const selectBtn = document.createElement('button');
      selectBtn.className = 'app-header-btn';
      selectBtn.innerHTML = '✓';
      selectBtn.title = '选择';
      selectBtn.addEventListener('click', () => this.toggleGallerySelect());
      headerRight.appendChild(selectBtn);
    } else if (state.app === 'forum') {
      if (state.view === 'threadDetail') {
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'app-header-btn';
        refreshBtn.innerHTML = '刷新';
        refreshBtn.title = '刷新';
        refreshBtn.style.background = '#e5c9c7';
        refreshBtn.style.color = 'white';
        refreshBtn.addEventListener('click', () => {
          if (window.forumUI) {
            window.forumUI.refreshForum();
          }
        });
        headerRight.appendChild(refreshBtn);
      } else {
        const generateBtn = document.createElement('button');
        generateBtn.className = 'app-header-btn';
        generateBtn.innerHTML = '生成';
        generateBtn.title = '立即生成论坛';
        generateBtn.style.background = '#e5c9c7';
        generateBtn.style.color = 'white';
        generateBtn.addEventListener('click', () => {
          if (window.forumManager) {
            if (window.showMobileToast) {
              window.showMobileToast('🚀 正在生成论坛内容...', 'info');
            }
            window.forumManager
              .generateForumContent(true)
              .then(() => {
                if (window.showMobileToast) {
                  window.showMobileToast('✅ 论坛内容生成完成', 'success');
                }
              })
              .catch(error => {
                console.error('[Mobile Phone] 生成论坛内容失败:', error);
                if (window.showMobileToast) {
                  window.showMobileToast('❌ 生成失败: ' + error.message, 'error');
                }
              });
          }
        });
        headerRight.appendChild(generateBtn);

        const postBtn = document.createElement('button');
        postBtn.className = 'app-header-btn';
        postBtn.innerHTML = '发帖';
        postBtn.title = '发帖';
        postBtn.style.background = '#e5c9c7';
        postBtn.style.color = 'white';
        postBtn.addEventListener('click', () => {
          if (window.forumUI) {
            window.forumUI.showPostDialog();
          }
        });
        headerRight.appendChild(postBtn);

        const styleBtn = document.createElement('button');
        styleBtn.className = 'app-header-btn';
        styleBtn.innerHTML = '风格';
        styleBtn.title = '论坛风格设置';
        styleBtn.style.background = '#e5c9c7';
        styleBtn.style.color = 'white';
        styleBtn.addEventListener('click', () => {
          window.mobilePhone.openApp('api');
          setTimeout(() => {
            const forumStylesTab = document.querySelector('[data-tab="forum-styles"]');
            if (forumStylesTab) {
              forumStylesTab.click();
            }
          }, 300);
        });
        headerRight.appendChild(styleBtn);

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'app-header-btn';
        refreshBtn.innerHTML = '刷新';
        refreshBtn.title = '刷新';
        refreshBtn.style.background = '#e5c9c7';
        refreshBtn.style.color = 'white';
        refreshBtn.addEventListener('click', () => {
          if (window.forumUI) {
            window.forumUI.refreshForum();
          }
        });
        headerRight.appendChild(refreshBtn);
      }
    } else if (state.app === 'weibo') {
      const generateBtn = document.createElement('button');
      generateBtn.className = 'app-header-btn';
      generateBtn.innerHTML = '生成';
      generateBtn.title = '立即生成微博';
      generateBtn.style.background = '#ff8500';
      generateBtn.style.color = 'white';
      generateBtn.addEventListener('click', async () => {
        if (window.weiboManager) {
          MobilePhone.showToast('🔄 开始生成微博内容...', 'processing');
          try {
            const result = await window.weiboManager.generateWeiboContent(true);
            if (result) {
              MobilePhone.showToast('✅ 微博内容生成成功！已插入到第1楼层', 'success');
            } else {
              MobilePhone.showToast('⚠️ 微博内容生成失败或被跳过', 'warning');
            }
          } catch (error) {
            console.error('[Mobile Phone] 生成微博内容出错:', error);
            MobilePhone.showToast(`❌ 生成失败: ${error.message}`, 'error');
          }
        } else {
          console.error('[Mobile Phone] 微博管理器未找到');
        }
      });
      headerRight.appendChild(generateBtn);

      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'app-header-btn';
      refreshBtn.innerHTML = '刷新';
      refreshBtn.title = '刷新';
      refreshBtn.style.background = '#ff8500';
      refreshBtn.style.color = 'white';
      refreshBtn.addEventListener('click', () => {
        if (window.weiboUI && window.weiboUI.refreshWeiboList) {
          window.weiboUI.refreshWeiboList();
        } else {
          console.error('[Mobile Phone] 微博UI未找到');
        }
      });
      headerRight.appendChild(refreshBtn);

      const postBtn = document.createElement('button');
      postBtn.className = 'app-header-btn';
      postBtn.innerHTML = '发博';
      postBtn.title = '发博';
      postBtn.style.background = '#ff8500';
      postBtn.style.color = 'white';
      postBtn.addEventListener('click', () => {
        if (window.weiboControlApp && window.weiboControlApp.showPostDialog) {
          window.weiboControlApp.showPostDialog();
        } else {
          console.error('[Mobile Phone] 微博控制应用未就绪');
        }
      });
      headerRight.appendChild(postBtn);

      const switchAccountBtn = document.createElement('button');
      switchAccountBtn.className = 'app-header-btn';
      const isMainAccount = window.weiboManager ? window.weiboManager.currentAccount.isMainAccount : true;
      switchAccountBtn.innerHTML = isMainAccount ? '切小号' : '切大号';
      switchAccountBtn.title = isMainAccount ? '切换到小号' : '切换到大号';
      switchAccountBtn.style.background = '#ff8500';
      switchAccountBtn.style.color = 'white';
      switchAccountBtn.addEventListener('click', () => {
        if (window.weiboManager && window.weiboManager.switchAccount) {
          const newIsMainAccount = window.weiboManager.switchAccount();
          switchAccountBtn.innerHTML = newIsMainAccount ? '切小号' : '切大号';
          switchAccountBtn.title = newIsMainAccount ? '切换到小号' : '切换到大号';
          if (window.weiboUI && window.weiboUI.updateUsernameDisplay) {
            window.weiboUI.updateUsernameDisplay();
          }
          if (window.weiboUI) {
            window.weiboUI.refreshWeiboList();
          }
          MobilePhone.showToast(`✅ 已切换到${newIsMainAccount ? '大号' : '小号'}`, 'success');
        } else {
          console.error('[Mobile Phone] 微博管理器未就绪');
        }
      });
      headerRight.appendChild(switchAccountBtn);
    } else if (state.app === 'settings') {
      const searchBtn = document.createElement('button');
      searchBtn.className = 'app-header-btn';
      searchBtn.innerHTML = '🔍';
      searchBtn.title = '搜索';
      searchBtn.addEventListener('click', () => this.showSettingsSearch());
      headerRight.appendChild(searchBtn);
    } else if (state.app === 'shop') {
      const viewBtn = document.createElement('button');
      viewBtn.className = 'app-header-btn shop-accent-btn';
      viewBtn.innerHTML = '查看';
      viewBtn.title = '查看商品';
      viewBtn.addEventListener('click', () => {
        if (window.shopAppSendViewMessage) {
          window.shopAppSendViewMessage();
        }
      });
      headerRight.appendChild(viewBtn);

      const categoryBtn = document.createElement('button');
      categoryBtn.className = 'app-header-btn shop-accent-btn';
      categoryBtn.innerHTML = '分类';
      categoryBtn.title = '展开分类';
      categoryBtn.addEventListener('click', () => {
        if (window.shopAppToggleCategories) {
          window.shopAppToggleCategories();
        } else if (window.shopAppShowCategories) {
          window.shopAppShowCategories();
        }
      });
      headerRight.appendChild(categoryBtn);
    } else if (state.app === 'backpack') {
      const categoryBtn = document.createElement('button');
      categoryBtn.className = 'app-header-btn';
      categoryBtn.innerHTML = '分类';
      categoryBtn.title = '展开分类';
      categoryBtn.addEventListener('click', () => {
        if (window.backpackAppToggleCategories) {
          window.backpackAppToggleCategories();
        }
      });
      headerRight.appendChild(categoryBtn);

      const searchBtn = document.createElement('button');
      searchBtn.className = 'app-header-btn';
      searchBtn.innerHTML = '🔍';
      searchBtn.title = '搜索物品';
      searchBtn.addEventListener('click', () => {
        if (window.backpackAppToggleSearch) {
          window.backpackAppToggleSearch();
        }
      });
      headerRight.appendChild(searchBtn);

      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'app-header-btn';
      refreshBtn.innerHTML = '<<i class="fas fa-sync-alt"></</i>';
      refreshBtn.title = '刷新背包';
      refreshBtn.addEventListener('click', () => {
        if (window.backpackAppRefresh) {
          window.backpackAppRefresh();
        }
      });
      headerRight.appendChild(refreshBtn);
    } else if (state.app === 'live') {
      const viewerBadge = document.createElement('div');
      viewerBadge.className = 'viewer-count';
      viewerBadge.title = '本场人数';
      viewerBadge.innerHTML = `<<i class="fas fa-user-friends"></</i><span class="viewer-count-num">${
        state.viewerCount || '-'
      }</span>`;
      headerRight.appendChild(viewerBadge);

      const giftBtn = document.createElement('button');
      giftBtn.className = 'app-header-btn gift-log-btn';
      giftBtn.title = '礼物流水';
      giftBtn.innerHTML = '🎁';
      giftBtn.addEventListener('click', () => {
        if (window.liveAppShowModal) {
          window.liveAppShowModal('gift-modal');
        }
      });
      headerRight.appendChild(giftBtn);

      const endBtn = document.createElement('button');
      endBtn.className = 'app-header-btn end-stream-btn';
      endBtn.title = '结束直播';
      endBtn.innerHTML = '⭕️';
      endBtn.addEventListener('click', () => {
        if (window.liveAppEndLive) {
          window.liveAppEndLive();
        }
      });
      headerRight.appendChild(endBtn);
    } else if (state.app === 'watch-live') {
      const viewerBadge = document.createElement('div');
      viewerBadge.className = 'viewer-count';
      viewerBadge.title = '本场人数';
      viewerBadge.innerHTML = `<<i class="fas fa-user-friends"></</i><span class="viewer-count-num">${
        state.viewerCount || '-'
      }</span>`;
      headerRight.appendChild(viewerBadge);

      const exitBtn = document.createElement('button');
      exitBtn.className = 'app-header-btn end-stream-btn';
      exitBtn.title = '退出直播间';
      exitBtn.innerHTML = '🚪';
      exitBtn.addEventListener('click', () => {
        if (window.watchLiveAppEndLive) {
          window.watchLiveAppEndLive();
        }
      });
      headerRight.appendChild(exitBtn);
    }
  }

  pushAppState(state) {
    if (!state || !state.app) {
      console.warn('[Mobile Phone] 推送状态无效，跳过:', state);
      return;
    }

    const currentState = this.currentAppState;
    if (currentState && this.isSameAppState(currentState, state)) {
      return;
    }

    const topState = this.appStack[this.appStack.length - 1];
    if (topState && this.isSameAppState(topState, state)) {
      return;
    }

    this.appStack.push(state);
    this.currentAppState = state;
    this.currentApp = state.app;
    this.updateAppHeader(state);
  }

  isSameAppState(state1, state2) {
    if (!state1 || !state2) return false;
    return state1.app === state2.app &&
           state1.view === state2.view &&
           state1.friendId === state2.friendId &&
           state1.threadId === state2.threadId &&
           state1.title === state2.title;
  }

  refreshMessages() {
    if (window.messageApp && window.messageApp.refreshMessageList) {
      window.messageApp.refreshMessageList();
    }
  }

  refreshMessageDetail() {
    if (window.messageApp && window.messageApp.refreshMessageDetail) {
      window.messageApp.refreshMessageDetail();
    }
  }

  showMessageList() {
    if (window.messageApp && window.messageApp.showMessageList) {
      window.messageApp.showMessageList();
    } else {
      console.error('[Mobile Phone] messageApp实例不存在或showMessageList方法不可用');
    }
  }

  showMessageDetail(friendId, friendName) {
    if (window.messageApp && window.messageApp.showMessageDetail) {
      window.messageApp.showMessageDetail(friendId, friendName);
    } else {
      console.error('[Mobile Phone] messageApp实例不存在或showMessageDetail方法不可用');
    }
  }

  toggleGallerySelect() {
    console.log('[Mobile Phone] 切换相册选择模式');
  }

  showSettingsSearch() {
    console.log('[Mobile Phone] 显示设置搜索');
  }

  showAddFriend() {
    if (window.messageApp && window.messageApp.showAddFriend) {
      window.messageApp.showAddFriend();
    } else {
      console.error('[Mobile Phone] messageApp实例不存在或showAddFriend方法不可用');
    }
  }

  async generateFriendsCircleContent() {
    try {
      if (window.showMobileToast) {
        window.showMobileToast('🎭 正在生成朋友圈内容...', 'info');
      }

      const message =
        '用户正在查看朋友圈，请根据朋友圈规则系统，生成3-5个正确的朋友圈格式，根据角色间的关系为每条朋友圈生成0-5条回复。回复请使用与原楼层相同id。请使用正确的三位数楼层id,楼层id不能与历史楼层id重复。请正确使用前缀s或w。严禁代替用户回复。禁止发表情包或颜文字，可以使用emoji。';

      if (window.friendsCircle && window.friendsCircle.sendToAI) {
        await window.friendsCircle.sendToAI(message);
        if (window.showMobileToast) {
          window.showMobileToast('✅ 朋友圈内容生成完成', 'success');
        }
      } else {
        console.error('[Mobile Phone] 朋友圈功能未就绪');
        if (window.showMobileToast) {
          window.showMobileToast('❌ 朋友圈功能未就绪', 'error');
        }
      }
    } catch (error) {
      console.error('[Mobile Phone] 生成朋友圈内容失败:', error);
      if (window.showMobileToast) {
        window.showMobileToast('❌ 生成失败: ' + error.message, 'error');
      }
    }
  }

  saveAddFriend() {
    if (window.messageApp && window.messageApp.addFriend) {
      window.messageApp.addFriend();
    } else {
      console.error('[Mobile Phone] messageApp实例不存在或addFriend方法不可用');
    }
  }

  registerApps() {
    this.apps = {
      messages: {
        name: '信息',
        content: null,
        isCustomApp: true,
        customHandler: this.handleMessagesApp.bind(this),
      },
      gallery: {
        name: '相册',
        content: `
                    <div class="gallery-app">
                        <div class="photo-grid">
                            <div class="photo-item">🖼️</div>
                            <div class="photo-item">🌸</div>
                            <div class="photo-item">🌙</div>
                            <div class="photo-item">⭐</div>
                            <div class="photo-item">🎀</div>
                            <div class="photo-item">💐</div>
                        </div>
                    </div>
                `,
      },
      settings: {
        name: '设置',
        content: null,
        isCustomApp: true,
        customHandler: this.handleSettingsApp.bind(this),
      },
      forum: {
        name: '论坛',
        content: null,
        isCustomApp: true,
        customHandler: this.handleForumApp.bind(this),
      },
      weibo: {
        name: '微博',
        content: null,
        isCustomApp: true,
        customHandler: this.handleWeiboApp.bind(this),
      },
      api: {
        name: 'API设置',
        content: null,
        isCustomApp: true,
        customHandler: this.handleApiApp.bind(this),
      },
      diary: {
        name: '日记',
        content: `
                    <div class="diary-app">
                        <div class="diary-header">
                            <h3>我的日记 📝</h3>
                        </div>
                        <div class="diary-content">
                            <div class="diary-entry">
                                <div class="entry-date">今天</div>
                                <div class="entry-text">今天天气很好，心情也很棒！在SillyTavern里遇到了很多有趣的角色～</div>
                            </div>
                            <div class="diary-entry">
                                <div class="entry-date">昨天</div>
                                <div class="entry-text">学习了新的前端技术，感觉很有成就感。</div>
                            </div>
                        </div>
                    </div>
                `,
      },
      mail: {
        name: '邮件',
        content: `
                    <div class="mail-app">
                        <div class="mail-list">
                            <div class="mail-item unread">
                                <div class="mail-sender">SillyTavern</div>
                                <div class="mail-subject">欢迎使用手机界面</div>
                                <div class="mail-preview">这是一个可爱的手机界面框架...</div>
                                <div class="mail-time">1小时前</div>
                            </div>
                            <div class="mail-item">
                                <div class="mail-sender">系统通知</div>
                                <div class="mail-subject">插件更新提醒</div>
                                <div class="mail-preview">Mobile Context插件已更新...</div>
                                <div class="mail-time">2小时前</div>
                            </div>
                        </div>
                    </div>
                `,
      },
      shop: {
        name: '购物',
        content: null,
        isCustomApp: true,
        customHandler: this.handleShopApp.bind(this),
      },
      backpack: {
        name: '背包',
        content: null,
        isCustomApp: true,
        customHandler: this.handleBackpackApp.bind(this),
      },
      task: {
        name: '任务',
        content: null,
        isCustomApp: true,
        customHandler: this.handleTaskApp.bind(this),
      },
      live: {
        name: '直播',
        content: null,
        isCustomApp: true,
        customHandler: this.handleLiveApp.bind(this),
      },
      browser: {
      name: '浏览器',
      content: '<div style="padding:20px; text-align:center;">浏览器应用正在开发中...</div>',
      },
      journal: {
      name: '手帐',
      content: '<div style="padding:20px; text-align:center;">手帐应用正在开发中...</div>',
      },
      'yuse-theater': {
      name: '欲色剧场',
      content: null,
      isCustomApp: true,
      customHandler: this.handleYuseTheaterApp.bind(this),
      },
      redbook: {
      name: '小红书',
      content: '<div style="padding:20px; text-align:center;">小红书应用正在开发中...</div>',
      },
      aoka: {
      name: '嗷咔',
      content: '<div style="padding:20px; text-align:center;">嗷咔应用正在开发中...</div>',
      },
      'watch-live': {
        name: '观看直播',
        content: null,
        isCustomApp: true,
        customHandler: this.handleWatchLiveApp.bind(this),
      },
      'parallel-events': {
        name: '平行事件',
        content: null,
        isCustomApp: true,
        customHandler: this.handleParallelEventsApp.bind(this),
      },
    };
  }

  togglePhone() {
    if (this.isVisible) {
      this.hidePhone();
    } else {
      this.showPhone();
    }
  }

  showPhone() {
    const container = document.getElementById('mobile-phone-container');
    container.style.display = 'flex';
    setTimeout(() => {
      container.classList.add('active');
    }, 10);
    this.isVisible = true;
    this.isPhoneActive = true;

    this.initStyleConfigManager();

    if (this.currentAppState) {
      document.getElementById('home-screen').style.display = 'none';
      document.getElementById('app-screen').style.display = 'block';
      this.restoreAppState(this.currentAppState);
    }

    this.startStateSyncLoop();

    if (window.MobileContextPlugin && window.MobileContextPlugin.updatePointerEventsSettings) {
      window.MobileContextPlugin.updatePointerEventsSettings();
    }
  }

  hidePhone() {
    const container = document.getElementById('mobile-phone-container');
    container.classList.remove('active');
    setTimeout(() => {
      container.style.display = 'none';
    }, 300);
    this.isVisible = false;
    this.isPhoneActive = false;

    // 欲色剧场退出时清理（即时销毁）
    const yuseRefreshBtn = document.getElementById('yuse-refresh-btn');
    if (yuseRefreshBtn) {
      yuseRefreshBtn.remove();
      console.log('[YuseTheater] 隐藏界面触发按钮清理');
    }

    this.stopStateSyncLoop();
  }

  initStyleConfigManager() {
    if (
      window.styleConfigManager &&
      window.styleConfigManager.isConfigReady &&
      window.styleConfigManager.isConfigReady()
    ) {
      return;
    }

    if (window.StyleConfigManager && !window.styleConfigManager) {
      try {
        window.styleConfigManager = new window.StyleConfigManager();
      } catch (error) {
        console.error('[Mobile Phone] ❌ 创建样式配置管理器实例失败:', error);
      }
    } else if (!window.StyleConfigManager) {
      this.loadStyleConfigManager();
    }
  }

  async loadStyleConfigManager() {
    try {
      const existingScript = document.querySelector('script[src*="style-config-manager.js"]');
      if (existingScript) {
        setTimeout(() => {
          if (window.StyleConfigManager && !window.styleConfigManager) {
            window.styleConfigManager = new window.StyleConfigManager();
          }
        }, 1000);
        return;
      }

      const script = document.createElement('script');
      script.src = '/scripts/extensions/third-party/mobile/app/style-config-manager.js';
      script.type = 'text/javascript';
      script.onload = () => {
        setTimeout(() => {
          if (window.StyleConfigManager && !window.styleConfigManager) {
            try {
              window.styleConfigManager = new window.StyleConfigManager();
            } catch (error) {
              console.error('[Mobile Phone] ❌ 创建样式配置管理器实例失败:', error);
            }
          }
        }, 500);
      };
      script.onerror = error => {
        console.error('[Mobile Phone] ❌ 样式配置管理器脚本加载失败:', error);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('[Mobile Phone] ❌ 动态加载样式配置管理器失败:', error);
    }
  }

  openApp(appName) {
    if (this._openingApp === appName) {
      return;
    }

    const app = this.apps[appName];
    if (!app) {
      console.warn('[Mobile Phone] 应用不存在:', appName);
      return;
    }

    if (this.currentApp === appName &&
        this.currentAppState &&
        this.currentAppState.app === appName &&
        this.isAppRootPage(this.currentAppState)) {
      return;
    }

    // 切换应用时清理欲色剧场按钮（即时销毁）
    if (this.currentApp === 'yuse-theater' && appName !== 'yuse-theater') {
      const yuseBtn = document.getElementById('yuse-refresh-btn');
      if (yuseBtn) {
        yuseBtn.remove();
        console.log(`[YuseTheater] 切换到${appName}，清理剧场按钮`);
      }
    }

    this._userNavigationIntent = {
      targetApp: appName,
      timestamp: Date.now(),
      fromApp: this.currentApp
    };

    this._openingApp = appName;
    try {
      const needsAsyncLoading = ['forum', 'weibo', 'api'].includes(appName);
      if (needsAsyncLoading) {
        this.showAppLoadingState(appName, app.name);
        this._loadingApps.add(appName);
        this._loadingStartTime[appName] = Date.now();
      }

      this.currentApp = appName;

      const appState = {
        app: appName,
        title: app.name,
        view: appName === 'messages' ? 'messageList' : 'main',
      };

      this.appStack = [appState];
      this.currentAppState = appState;
      this.updateAppHeader(appState);

      if (app.isCustomApp && app.customHandler) {
        app.customHandler();
      } else {
        document.getElementById('app-content').innerHTML = app.content;
      }

      document.getElementById('home-screen').style.display = 'none';
      document.getElementById('app-screen').style.display = 'block';

      document.getElementById('app-screen').classList.add('slide-in');
      setTimeout(() => {
        document.getElementById('app-screen').classList.remove('slide-in');
      }, 300);
    } finally {
      setTimeout(() => {
        this._openingApp = null;
      }, 500);
    }
  }

  showAppLoadingState(appName, appTitle) {
    const loadingContent = `
      <div class="app-loading-container">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <div class="loading-text">正在加载 ${appTitle}...</div>
        <div class="loading-tip">首次加载可能需要几秒钟</div>
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill" id="loading-progress-${appName}"></div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('app-content').innerHTML = loadingContent;
    this.simulateLoadingProgress(appName);
  }

  simulateLoadingProgress(appName) {
    const progressBar = document.getElementById(`loading-progress-${appName}`);
    if (!progressBar) return;

    let progress = 0;
    const interval = setInterval(() => {
      if (!this._loadingApps.has(appName) || this._userNavigationIntent?.targetApp !== appName) {
        clearInterval(interval);
        return;
      }

      progress += Math.random() * 15 + 5;
      if (progress > 90) progress = 90;
      progressBar.style.width = `${progress}%`;
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
    }, 10000);
  }

  isUserNavigationIntentValid(appName) {
    if (!this._userNavigationIntent) return false;

    const intent = this._userNavigationIntent;
    const now = Date.now();

    if (now - intent.timestamp > 30000) {
      return false;
    }

    if (intent.targetApp !== appName) {
      return false;
    }

    if (this.currentApp !== appName) {
      return false;
    }

    return true;
  }

  completeAppLoading(appName) {
    this._loadingApps.delete(appName);

    if (this._loadingStartTime[appName]) {
      const loadTime = Date.now() - this._loadingStartTime[appName];
      console.log(`[Mobile Phone] ${appName} 加载耗时: ${loadTime}ms`);
      delete this._loadingStartTime[appName];
    }

    if (!this.isUserNavigationIntentValid(appName)) {
      return false;
    }

    const progressBar = document.getElementById(`loading-progress-${appName}`);
    if (progressBar) {
      progressBar.style.width = '100%';
    }

    return true;
  }

  async handleForumApp() {
    try {
      document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载论坛...</div>
                </div>
            `;

      const loadWithTimeout = (promise, timeout = 15000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('论坛模块加载超时')), timeout)),
        ]);
      };

      try {
        await loadWithTimeout(this.loadForumApp());
      } catch (error) {
        console.error('[Mobile Phone] 论坛模块加载失败，尝试重新加载:', error);
        window._forumAppLoading = null;
        await loadWithTimeout(this.loadForumApp());
      }

      if (!this.completeAppLoading('forum')) {
        return;
      }

      let currentState = this.appStack[this.appStack.length - 1];
      if (!currentState || currentState.app !== 'forum') {
        const initialState = {
          app: 'forum',
          title: '论坛',
          view: 'main',
        };
        this.pushAppState(initialState);
        currentState = initialState;
      }

      const view = currentState.view || 'main';
      let content = '';
      if (view === 'forumControl') {
        if (!window.getForumControlAppContent) {
          throw new Error('getForumControlAppContent 函数未找到');
        }
        content = window.getForumControlAppContent();
      } else {
        if (!window.getForumAppContent) {
          throw new Error('getForumAppContent 函数未找到');
        }
        content = window.getForumAppContent();
      }

      if (!content || content.trim() === '') {
        throw new Error(`论坛${view === 'forumControl' ? '控制' : '主界面'}内容为空`);
      }

      document.getElementById('app-content').innerHTML = content;

      if (view === 'forumControl') {
        if (window.bindForumControlEvents) {
          window.bindForumControlEvents();
        }
      } else {
        if (window.bindForumEvents) {
          window.bindForumEvents();
        }
      }

      setTimeout(() => {
        const forumStyleSelect = document.getElementById('forum-style-select');
        if (forumStyleSelect) {
          this.initializeForumStyleSelector(forumStyleSelect);
        }
      }, 500);
    } catch (error) {
      console.error('[Mobile Phone] 处理论坛应用失败:', error);
      this._loadingApps.delete('forum');
      document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">论坛加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleForumApp()" class="retry-button">重试</button>
                </div>
            `;
    }
  }

  async handleWeiboApp() {
    try {
      document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载微博...</div>
                </div>
            `;

      const loadWithTimeout = (promise, timeout = 15000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('微博模块加载超时')), timeout)),
        ]);
      };

      try {
        await loadWithTimeout(this.loadWeiboApp());
      } catch (error) {
        console.error('[Mobile Phone] 微博模块加载失败，尝试重新加载:', error);
        window._weiboAppLoading = null;
        await loadWithTimeout(this.loadWeiboApp());
      }

      if (!this.completeAppLoading('weibo')) {
        return;
      }

      const currentState = this.appStack[this.appStack.length - 1] || { view: 'main' };
      const view = currentState.view || 'main';
      let content = '';

      if (view === 'weiboControl') {
        if (!window.getWeiboControlAppContent) {
          throw new Error('getWeiboControlAppContent 函数未找到');
        }
        content = window.getWeiboControlAppContent();
      } else {
        if (!window.getWeiboAppContent) {
          throw new Error('getWeiboAppContent 函数未找到');
        }
        content = window.getWeiboAppContent();
      }

      if (!content || content.trim() === '') {
        throw new Error(`微博${view === 'weiboControl' ? '控制' : '主界面'}内容为空`);
      }

      document.getElementById('app-content').innerHTML = content;

      if (view === 'weiboControl') {
        if (window.bindWeiboControlEvents) {
          window.bindWeiboControlEvents();
        }
      } else {
        if (window.bindWeiboEvents) {
          window.bindWeiboEvents();
        }
      }
    } catch (error) {
      console.error('[Mobile Phone] 处理微博应用失败:', error);
      this._loadingApps.delete('weibo');
      document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">微博加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleWeiboApp()" class="retry-button">重试</button>
                </div>
            `;
    }
  }

  async handleSettingsApp() {
    try {
      document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载样式设置...</div>
                </div>
            `;

      await this.loadStyleConfigApp();

      if (!window.getStyleConfigAppContent) {
        throw new Error('getStyleConfigAppContent 函数未找到');
      }

      const content = window.getStyleConfigAppContent();
      if (!content || content.trim() === '') {
        throw new Error('样式配置应用内容为空');
      }

      document.getElementById('app-content').innerHTML = content;

      if (window.bindStyleConfigEvents) {
        window.bindStyleConfigEvents();
      }

      if (window.styleConfigManager && !window.styleConfigManager.isConfigReady()) {
        const loadingHint = document.createElement('div');
        loadingHint.className = 'config-loading-hint';
        loadingHint.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #2196F3;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 20px;
                        font-size: 14px;
                        z-index: 10000;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    ">
                        ⏳ 正在初始化样式配置管理器...
                    </div>
                `;
        document.body.appendChild(loadingHint);

        window.styleConfigManager
          .waitForReady()
          .then(() => {
            if (loadingHint.parentNode) {
              loadingHint.remove();
            }
          })
          .catch(error => {
            console.error('[Mobile Phone] 等待样式配置管理器失败:', error);
            if (loadingHint.parentNode) {
              loadingHint.innerHTML = `
                            <div style="
                                position: fixed;
                                top: 20px;
                                left: 50%;
                                transform: translateX(-50%);
                                background: #ff4444;
                                color: white;
                                padding: 10px 20px;
                                border-radius: 20px;
                                font-size: 14px;
                                z-index: 10000;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                            ">
                                ❌ 样式配置管理器初始化失败
                            </div>
                        `;
              setTimeout(() => loadingHint.remove(), 3000);
            }
          });
      }
    } catch (error) {
      console.error('[Mobile Phone] 处理设置应用失败:', error);
      document.getElementById('app-content').innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">设置应用加载失败</div>
                    <div class="error-message">${error.message}</div>
                    <button onclick="window.mobilePhone.handleSettingsApp()" class="retry-button">重试</button>
                </div>
            `;
    }
  }

  async handleMessagesApp() {
    try {
      document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载消息应用...</div>
                </div>
            `;

      await this.loadMessageApp();

      if (!window.getMessageAppContent) {
        throw new Error('getMessageAppContent 函数未找到');
      }

      const content = window.getMessageAppContent();
      if (!content || content.trim() === '') {
        throw new Error('消息应用内容为空');
      }

      document.getElementById('app-content').innerHTML = content;

      if (window.bindMessageAppEvents) {
        window.bindMessageAppEvents();
      }

      if (!this.currentAppState || this.currentAppState.app !== 'messages') {
        const messageState = {
          app: 'messages',
          title: '信息',
          view: 'messageList',
        };
        this.currentAppState = messageState;
        this.appStack = [messageState];
        this.updateAppHeader(messageState);
      }
    } catch (error) {
      console.error('[Mobile Phone] 加载消息应用失败:', error);
      document.getElementById('app-content').innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">加载失败</div>
                    <div class="error-details">${error.message}</div>
                    <button class="retry-button" onclick="window.MobilePhone.openApp('messages')">
                        重试
                    </button>
                </div>
            `;
    }
  }

  async handleYuseTheaterApp() {
    try {
      document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载欲色剧场...</div>
                </div>
            `;

      await this.loadYuseTheaterApp();

      if (!window.getYuseTheaterAppContent) {
        throw new Error('getYuseTheaterAppContent 函数未找到');
      }

      const content = window.getYuseTheaterAppContent();
      if (!content || content.trim() === '') {
        throw new Error('欲色剧场应用内容为空');
      }

      document.getElementById('app-content').innerHTML = content;

      if (window.bindYuseTheaterAppEvents) {
        window.bindYuseTheaterAppEvents();
      }

      // 初始化时触发状态同步（确保按钮显示）
      if (this.currentAppState && this.currentAppState.app === 'yuse-theater') {
        this.updateAppHeader(this.currentAppState);
      }
    } catch (error) {
      console.error('[Mobile Phone] 处理欲色剧场应用失败:', error);
      document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">欲色剧场加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleYuseTheaterApp()" class="retry-button">重试</button>
                </div>
            `;
    }
  }

  async handleShopApp() {
    try {
      document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载购物应用...</div>
                </div>
            `;

      await this.loadShopApp();

      if (!window.getShopAppContent) {
        throw new Error('getShopAppContent 函数未找到');
      }

      const content = window.getShopAppContent();
      if (!content || content.trim() === '') {
        throw new Error('购物应用内容为空');
      }

      document.getElementById('app-content').innerHTML = content;

      if (window.bindShopAppEvents) {
        window.bindShopAppEvents();
      }
    } catch (error) {
      console.error('[Mobile Phone] 处理购物应用失败:', error);
      document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">购物应用加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleShopApp()" class="retry-button">重试</button>
                </div>
            `;
    }
  }

  async handleBackpackApp() {
    try {
      document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载背包应用...</div>
</div>
            `;

      await this.loadBackpackApp();

      if (!window.getBackpackAppContent) {
        throw new Error('getBackpackAppContent 函数未找到');
      }

      const content = window.getBackpackAppContent();
      if (!content || content.trim() === '') {
        throw new Error('背包应用内容为空');
      }

      document.getElementById('app-content').innerHTML = content;

      if (window.bindBackpackAppEvents) {
        window.bindBackpackAppEvents();
      }
    } catch (error) {
      console.error('[Mobile Phone] 处理背包应用失败:', error);
      document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">背包应用加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleBackpackApp()" class="retry-button">重试</button>
                </div>
            `;
    }
  }

  async handleTaskApp() {
    try {
      document.getElementById('app-content').innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-icon">⏳</div>
                    <div class="loading-text">正在加载任务应用...</div>
                </div>
            `;

      await this.loadTaskApp();

      if (!window.getTaskAppContent) {
        throw new Error('getTaskAppContent 函数未找到');
      }

      const content = window.getTaskAppContent();
      if (!content || content.trim() === '') {
        throw new Error('任务应用内容为空');
      }

      document.getElementById('app-content').innerHTML = content;

      if (window.bindTaskAppEvents) {
        window.bindTaskAppEvents();
      }
    } catch (error) {
      console.error('[Mobile Phone] 处理任务应用失败:', error);
      document.getElementById('app-content').innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">❌</div>
                    <div class="error-text">任务应用加载失败</div>
                    <div class="error-detail">${error.message}</div>
                    <button onclick="window.mobilePhone.handleTaskApp()" class="retry-button">重试</button>
                </div>
            `;
    }
  }

  async handleLiveApp() {
