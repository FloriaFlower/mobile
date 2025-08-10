/**
 * 论坛UI管理器
 * 负责论坛界面的显示和数据处理
 */
class ForumUI {
    constructor() {
        this.currentThreadId = null;
        this.init();
    }

    init() {
        console.log('[Forum UI] 论坛UI管理器初始化');
    }

    /**
     * 从消息中实时解析论坛内容
     */
    parseForumContent(content) {
        // 提取论坛标记之间的内容
        const forumRegex = /<!-- FORUM_CONTENT_START -->([\s\S]*?)<!-- FORUM_CONTENT_END -->/;
        const match = content.match(forumRegex);

        if (!match) {
            console.log('[Forum UI] 未找到论坛内容');
            return { threads: [], replies: {} };
        }

        const forumContent = match[1];
        const threads = [];
        const replies = {};

        // 解析标题格式: [标题|发帖人昵称|帖子id|标题内容|帖子详情]
        const titleRegex = /\[标题\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
        // 解析回复格式: [回复|回帖人昵称|帖子id|回复内容]
        const replyRegex = /\[回复\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
        // 解析楼中楼格式: [楼中楼|回帖人昵称|帖子id|父楼层|回复内容]
        const subReplyRegex = /\[楼中楼\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;

        let match_title;
        let match_reply;
        let match_subreply;

        // 解析标题
        while ((match_title = titleRegex.exec(forumContent)) !== null) {
            const thread = {
                id: match_title[2],
                author: match_title[1],
                title: match_title[3],
                content: match_title[4],
                replies: [],
                timestamp: new Date().toLocaleString()
            };

            threads.push(thread);
            replies[thread.id] = [];
        }

        // 解析普通回复
        while ((match_reply = replyRegex.exec(forumContent)) !== null) {
            const reply = {
                id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                threadId: match_reply[2],
                author: match_reply[1],
                content: match_reply[3],
                timestamp: new Date().toLocaleString(),
                type: 'reply',
                subReplies: []
            };

            if (!replies[reply.threadId]) {
                replies[reply.threadId] = [];
            }
            replies[reply.threadId].push(reply);
        }

        // 解析楼中楼
        while ((match_subreply = subReplyRegex.exec(forumContent)) !== null) {
            const subReply = {
                id: `subreply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                threadId: match_subreply[2],
                author: match_subreply[1],
                parentFloor: match_subreply[3],
                content: match_subreply[4],
                timestamp: new Date().toLocaleString(),
                type: 'subreply'
            };

            if (!replies[subReply.threadId]) {
                replies[subReply.threadId] = [];
            }

            // 找到对应的父楼层并添加到其subReplies中
            const parentReply = replies[subReply.threadId].find(r =>
                r.author === subReply.parentFloor ||
                r.id === subReply.parentFloor ||
                replies[subReply.threadId].indexOf(r) + 2 === parseInt(subReply.parentFloor)
            );

            if (parentReply) {
                if (!parentReply.subReplies) {
                    parentReply.subReplies = [];
                }
                parentReply.subReplies.push(subReply);
            } else {
                // 如果找不到父楼层，作为普通回复处理
                subReply.type = 'reply';
                subReply.subReplies = [];
                replies[subReply.threadId].push(subReply);
            }
        }

        // 更新对应帖子的回复数
        threads.forEach(thread => {
            if (replies[thread.id]) {
                thread.replies = replies[thread.id];
            }
        });

        console.log('[Forum UI] 解析完成，帖子数:', threads.length);
        return { threads, replies };
    }

    /**
     * 获取论坛主界面HTML
     */
    getForumMainHTML() {
        return `
            <div class="forum-app">
                <!-- 论坛头部 -->
                <div class="forum-header">
                    <div class="forum-nav">
                        <div class="nav-item active" data-tab="hot">🔥 热门</div>
                    </div>

                </div>

                <!-- 论坛内容 -->
                <div class="forum-content" id="forum-content">
                    ${this.getThreadListHTML()}
                </div>

                <!-- 发帖对话框 -->
                <div class="post-dialog" id="post-dialog" style="display: none;">
                    <div class="dialog-overlay" id="dialog-overlay"></div>
                    <div class="dialog-content">
                        <div class="dialog-header">
                            <h3>发新帖</h3>
                            <button class="close-btn" id="close-dialog-btn">×</button>
                        </div>
                        <div class="dialog-body">
                            <input type="text" class="post-title-input" id="post-title" placeholder="请输入帖子标题...">
                            <textarea class="post-content-input" id="post-content" placeholder="分享你的想法..."></textarea>
                        </div>
                        <div class="dialog-footer">
                            <button class="cancel-btn" id="cancel-post-btn">取消</button>
                            <button class="submit-btn" id="submit-post-btn">✈</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取帖子列表HTML
     */
    getThreadListHTML() {
        // 实时从消息中提取论坛数据
        const forumData = this.getCurrentForumData();

        if (forumData.threads.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <div class="empty-text">暂无帖子</div>
                    <div class="empty-hint">点击右上角发帖按钮开始讨论吧～</div>
                </div>
            `;
        }

        return forumData.threads.map(thread => `
            <div class="thread-item" data-thread-id="${thread.id}">
                <div class="thread-header">
                    <div class="thread-author">
                        <div class="author-avatar">${thread.author[0]}</div>
                        <span class="author-name">${thread.author}</span>
                    </div>
                    <div class="thread-id">ID: ${thread.id}</div>
                    <div class="thread-time">${thread.timestamp}</div>
                </div>
                <div class="thread-title">${thread.title}</div>
                <div class="thread-content">${this.formatContent(thread.content)}</div>
                <div class="thread-stats">
                    <span class="reply-count">💬 ${thread.replies.length} 回复</span>
                    <span class="view-count">👀 ${Math.floor(Math.random() * 100) + 10} 浏览</span>
                    <button class="thread-action-btn">💭 回复</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * 从消息中获取当前论坛数据
     */
    getCurrentForumData() {
        try {
            if (window.mobileContextEditor) {
                const chatData = window.mobileContextEditor.getCurrentChatData();
                if (chatData && chatData.messages && chatData.messages.length > 0) {
                    // 检查第一条消息是否包含论坛内容
                    const firstMessage = chatData.messages[0];
                    if (firstMessage && firstMessage.mes) {
                        return this.parseForumContent(firstMessage.mes);
                    }
                }
            }
        } catch (error) {
            console.warn('[Forum UI] 获取论坛数据失败:', error);
        }

        return { threads: [], replies: {} };
    }

    /**
     * 获取帖子详情HTML
     */
    getThreadDetailHTML(threadId) {
        // 实时从消息中提取论坛数据
        const forumData = this.getCurrentForumData();
        const thread = forumData.threads.find(t => t.id === threadId);
        if (!thread) return '<div class="error">帖子不存在</div>';

        const replies = forumData.replies[threadId] || [];

        return `
            <div class="thread-detail">
                <!-- 主帖 -->
                <div class="main-post">
                    <div class="post-header">
                        <div class="post-author">
                            <div class="author-avatar large">${thread.author[0]}</div>
                            <div class="author-info">
                                <div class="author-name">${thread.author}</div>
                                <div class="author-title">楼主</div>
                            </div>
                        </div>
                        <div class="post-meta">
                            <div class="post-id">ID: ${thread.id}</div>
                            <div class="post-time">${thread.timestamp}</div>
                        </div>
                    </div>
                    <div class="post-title">${thread.title}</div>
                    <div class="post-content">${this.formatContent(thread.content)}</div>
                    <div class="post-actions">
                        <button class="action-btn like">👍 赞 (${Math.floor(Math.random() * 20)})</button>
                        <button class="action-btn reply" data-action="reply">💭 回复</button>
                        <button class="action-btn share">📤 分享</button>
                    </div>
                </div>

                <!-- 回复列表 -->
                <div class="reply-list">
                    <div class="reply-header">
                        <h4>全部回复 (${replies.length})</h4>
                        <div class="sort-options">
                            <span class="sort-item active">时间顺序</span>
                            <span class="sort-item">热度排序</span>
                        </div>
                    </div>
                    ${this.getRepliesHTML(replies)}
                </div>

                <!-- 回复输入框 -->
                <div class="reply-input-container">
                    <div class="reply-input-box">
                        <textarea class="reply-input" id="reply-input" placeholder="写下你的想法..."></textarea>
                        <div class="reply-actions">
                            <button class="submit-reply-btn" id="submit-reply-btn">✈</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取回复列表HTML
     */
    getRepliesHTML(replies) {
        if (replies.length === 0) {
            return `
                <div class="no-replies">
                    <div class="no-replies-icon">💭</div>
                    <div class="no-replies-text">暂无回复，来抢沙发吧～</div>
                </div>
            `;
        }

        return replies.map((reply, index) => {
            const floorNumber = index + 2;
            return `
                <div class="reply-item" data-floor="${floorNumber}" data-reply-id="${reply.id}">
                    <div class="reply-header">
                        <div class="reply-author">
                            <div class="author-avatar">${reply.author[0]}</div>
                            <span class="author-name">${reply.author}</span>
                        </div>
                        <div class="reply-meta">
                            <span class="floor-number">${floorNumber}楼</span>
                            <span class="reply-time">${reply.timestamp}</span>
                        </div>
                    </div>
                    <div class="reply-content">${this.formatContent(reply.content)}</div>
                    <div class="reply-actions">
                        <button class="action-btn like-reply">👍 ${Math.floor(Math.random() * 10)}</button>
                        <button class="action-btn reply-to-reply" data-reply-to="${reply.author}" data-floor="${floorNumber}" data-reply-id="${reply.id}">回复</button>
                    </div>

                    <!-- 楼中楼回复 -->
                    ${this.getSubRepliesHTML(reply.subReplies || [], floorNumber)}

                    <!-- 楼中楼回复输入框 -->
                    <div class="sub-reply-input-container" id="sub-reply-input-${reply.id}" style="display: none;">
                        <div class="sub-reply-input-box">
                            <div class="sub-reply-target">回复 ${reply.author}:</div>
                            <textarea class="sub-reply-input" placeholder="写下你的回复..." rows="2"></textarea>
                            <div class="sub-reply-actions">
                                <button class="cancel-sub-reply-btn" data-reply-id="${reply.id}">取消</button>
                                <button class="submit-sub-reply-btn" data-reply-id="${reply.id}" data-parent-floor="${floorNumber}" data-parent-author="${reply.author}">✈</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 获取楼中楼回复HTML
     */
    getSubRepliesHTML(subReplies, parentFloor) {
        if (!subReplies || subReplies.length === 0) {
            return '';
        }

        return `
            <div class="sub-replies-container">
                <div class="sub-replies-header">
                    <span class="sub-replies-count">${subReplies.length} 条回复</span>
                </div>
                <div class="sub-replies-list">
                    ${subReplies.map(subReply => `
                        <div class="sub-reply-item" data-sub-reply-id="${subReply.id}">
                            <div class="sub-reply-author">
                                <div class="author-avatar small">${subReply.author[0]}</div>
                                <span class="author-name">${subReply.author}</span>
                                <span class="sub-reply-time">${subReply.timestamp}</span>
                            </div>
                            <div class="sub-reply-content">${this.formatContent(subReply.content)}</div>
                            <div class="sub-reply-actions">
                                <button class="action-btn like-sub-reply">👍 ${Math.floor(Math.random() * 5)}</button>
                                <button class="action-btn reply-to-sub-reply" data-reply-to="${subReply.author}" data-parent-floor="${parentFloor}">回复</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 格式化内容（处理表情包等）
     */
    formatContent(content) {
        // 处理表情包标记
        let formatted = content.replace(/表情:\s*([^,\s]+)/g, '<span class="emoji-placeholder">[$1]</span>');

        // 处理链接（如果有）
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="forum-link">$1</a>');

        // 处理@用户（如果有）
        formatted = formatted.replace(/@([^\s]+)/g, '<span class="mention">@$1</span>');

        // 处理换行
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 移除之前的事件监听器（如果存在）
        if (this.clickHandler) {
            document.removeEventListener('click', this.clickHandler);
        }

        // 帖子点击事件
        this.clickHandler = (e) => {
            // 只处理论坛内容区域的点击事件
            const forumContent = document.getElementById('forum-content');
            if (!forumContent || !forumContent.contains(e.target)) {
                return;
            }

            if (e.target.closest('.thread-item')) {
                const threadItem = e.target.closest('.thread-item');
                const threadId = threadItem.dataset.threadId;
                this.showThreadDetail(threadId);
            }
        };

        document.addEventListener('click', this.clickHandler);

        // 发帖按钮
        const newPostBtn = document.getElementById('new-post-btn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => this.showPostDialog());
        }

        // 刷新按钮
        const refreshBtn = document.getElementById('refresh-forum-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshForum());
        }

        // 论坛设置按钮
        const forumControlBtn = document.getElementById('forum-control-btn');
        if (forumControlBtn) {
            forumControlBtn.addEventListener('click', () => this.showForumControl());
        }

        // 生成演示内容按钮
        const generateBtn = document.getElementById('generate-demo-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateDemoContent());
        }

        // 对话框相关事件
        this.bindDialogEvents();

        // 楼中楼相关事件
        this.bindSubReplyEvents();
    }

    /**
     * 绑定对话框事件
     */
    bindDialogEvents() {
        // 关闭对话框
        const closeBtn = document.getElementById('close-dialog-btn');
        const cancelBtn = document.getElementById('cancel-post-btn');
        const overlay = document.getElementById('dialog-overlay');

        [closeBtn, cancelBtn, overlay].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.hidePostDialog());
            }
        });

        // 提交发帖
        const submitBtn = document.getElementById('submit-post-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitNewPost());
        }
    }

    /**
     * 显示帖子详情
     */
    showThreadDetail(threadId) {
        this.currentThreadId = threadId;

        // 推送新状态到应用栈（只在状态发生变化时推送）
        if (window.mobilePhone) {
            const currentState = window.mobilePhone.currentAppState;
            const shouldPushState = !currentState ||
                                  currentState.app !== 'forum' ||
                                  currentState.view !== 'threadDetail' ||
                                  currentState.threadId !== threadId;

            if (shouldPushState) {
                const state = {
                    app: 'forum',
                    title: '帖子详情',
                    view: 'threadDetail',
                    threadId: threadId
                };
                window.mobilePhone.pushAppState(state);
                console.log('[Forum UI] 推送帖子详情状态:', state);
            }
        }

        // 更新内容
        const forumContent = document.getElementById('forum-content');
        if (forumContent) {
            forumContent.innerHTML = this.getThreadDetailHTML(threadId);
        } else {
            console.error('[Forum UI] 找不到forum-content元素');
        }

        // 绑定回复事件
        this.bindReplyEvents();
    }

    /**
     * 绑定回复事件
     */
    bindReplyEvents() {
        const submitBtn = document.getElementById('submit-reply-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitReply());
        }

        // 楼中楼事件已在 bindEvents() 中绑定，无需重复绑定
        // this.bindSubReplyEvents();
    }

    /**
     * 绑定楼中楼回复事件
     */
    bindSubReplyEvents() {
        // 避免重复绑定事件监听器
        if (this.subReplyEventsbound) {
            return;
        }
        this.subReplyEventsbound = true;

        // 回复按钮点击事件
        this.subReplyClickHandler = (e) => {
            if (e.target.classList.contains('reply-to-reply')) {
                const replyId = e.target.dataset.replyId;
                this.showSubReplyInput(replyId);
            }

            if (e.target.classList.contains('cancel-sub-reply-btn')) {
                const replyId = e.target.dataset.replyId;
                this.hideSubReplyInput(replyId);
            }

            if (e.target.classList.contains('submit-sub-reply-btn')) {
                const replyId = e.target.dataset.replyId;
                const parentFloor = e.target.dataset.parentFloor;
                const parentAuthor = e.target.dataset.parentAuthor;
                this.submitSubReply(replyId, parentFloor, parentAuthor);
            }
        };

        document.addEventListener('click', this.subReplyClickHandler);
    }

    /**
     * 显示楼中楼回复输入框
     */
    showSubReplyInput(replyId) {
        // 隐藏所有其他的回复输入框
        document.querySelectorAll('.sub-reply-input-container').forEach(container => {
            container.style.display = 'none';
        });

        // 显示当前的回复输入框
        const container = document.getElementById(`sub-reply-input-${replyId}`);
        if (container) {
            container.style.display = 'block';
            // 聚焦到输入框
            const textarea = container.querySelector('.sub-reply-input');
            if (textarea) {
                textarea.focus();
            }
        }
    }

    /**
     * 隐藏楼中楼回复输入框
     */
    hideSubReplyInput(replyId) {
        const container = document.getElementById(`sub-reply-input-${replyId}`);
        if (container) {
            container.style.display = 'none';
            // 清空输入框
            const textarea = container.querySelector('.sub-reply-input');
            if (textarea) {
                textarea.value = '';
            }
        }
    }

    /**
     * 提交楼中楼回复
     */
    submitSubReply(replyId, parentFloor, parentAuthor) {
        const container = document.getElementById(`sub-reply-input-${replyId}`);
        if (!container) return;

        const textarea = container.querySelector('.sub-reply-input');
        if (!textarea) return;

        const content = textarea.value.trim();
        if (!content) {
            alert('请输入回复内容');
            return;
        }

        // 获取当前论坛数据，找到被回复的评论信息
        const forumData = this.getCurrentForumData();
        const currentReplies = forumData.replies[this.currentThreadId] || [];

        // 查找被回复的评论
        let parentReply = null;
        for (const reply of currentReplies) {
            if (reply.id === replyId || reply.author === parentAuthor) {
                parentReply = reply;
                break;
            }
        }

        if (!parentReply) {
            alert('无法找到被回复的评论信息');
            return;
        }

        // 构建评论前缀：我回复评论'作者|帖子id|评论内容'
        const commentPrefix = `我回复评论'${parentReply.author}|${this.currentThreadId}|${parentReply.content}'`;

        // 构建楼中楼回复格式：[回复|我|帖子id|回复作者：回复内容]
        const replyFormat = `[回复|我|${this.currentThreadId}|回复${parentReply.author}：${content}]`;

        const subReplyData = {
            type: 'subreply',
            threadId: this.currentThreadId,
            parentFloor: parentFloor,
            parentAuthor: parentAuthor,
            content: content,
            prefix: commentPrefix,
            replyFormat: replyFormat
        };

        // 调用论坛管理器发送楼中楼回复
        this.sendReplyToForum(subReplyData);

        // 隐藏输入框
        this.hideSubReplyInput(replyId);
    }

    /**
     * 显示发帖对话框
     */
    showPostDialog() {
        const dialog = document.getElementById('post-dialog');
        if (dialog) {
            dialog.style.display = 'flex';
            // 清空输入框
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
        }
    }

    /**
     * 隐藏发帖对话框
     */
    hidePostDialog() {
        const dialog = document.getElementById('post-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    /**
     * 提交新帖
     */
    submitNewPost() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();

        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }

        // 隐藏对话框
        this.hidePostDialog();

        if (!window.forumManager) {
            alert('论坛管理器未初始化，请稍后再试');
            return;
        }

        // 构建发帖格式：[标题|我|帖子id|标题内容|帖子详情]
        // 帖子id固定为四个字，让模型自己编
        const postFormat = `[标题|我|帖子|${title}|${content}]`;

        console.log('[Forum UI] 用户发帖:', { title, content, postFormat });

        // 询问用户是否确认发帖
        const choice = confirm('确认发布帖子？\n\n点击"确定"：发布帖子（插入论坛内容并发送给模型）\n点击"取消"：取消发布');

        if (choice) {
            // 调用论坛管理器的发帖API
            if (window.forumManager.sendPostToAPI) {
                window.forumManager.sendPostToAPI(postFormat).then(() => {
                    console.log('[Forum UI] 帖子已发布');
                    // 刷新论坛内容
                    setTimeout(() => {
                        this.refreshThreadList();
                    }, 1000);
                }).catch(error => {
                    console.error('[Forum UI] 发帖失败:', error);
                    alert('发帖失败，请重试');
                });
            } else {
                alert('发帖功能不可用，请检查论坛管理器配置');
                console.error('[Forum UI] sendPostToAPI方法不存在');
            }
        } else {
            // 用户取消发帖
            console.log('[Forum UI] 用户取消发帖');
        }
    }

    /**
     * 提交回复
     */
    submitReply() {
        if (!this.currentThreadId) return;

        const content = document.getElementById('reply-input').value.trim();
        if (!content) {
            alert('请输入回复内容');
            return;
        }

        // 清空输入框
        document.getElementById('reply-input').value = '';

        // 获取当前帖子信息
        const forumData = this.getCurrentForumData();
        const currentThread = forumData.threads.find(t => t.id === this.currentThreadId);

        if (!currentThread) {
            alert('无法找到当前帖子信息');
            return;
        }

        // 构建回复前缀：我回复帖子'作者|帖子id|帖子标题和内容'
        const threadPrefix = `我回复帖子'${currentThread.author}|${currentThread.id}|${currentThread.title}'`;

        // 构建普通回复格式：[回复|我|帖子id|回复内容]
        const replyFormat = `回复我道${this.currentThreadId}|${content}`;

        const replyData = {
            type: 'reply',
            threadId: this.currentThreadId,
            content: content,
            prefix: threadPrefix,
            replyFormat: replyFormat
        };

        // 调用论坛管理器发送回复
        this.sendReplyToForum(replyData);
    }

    /**
     * 发送回复到论坛管理器
     */
    sendReplyToForum(replyData) {
        if (!window.forumManager) {
            alert('论坛管理器未初始化，请稍后再试');
            return;
        }

        console.log('[Forum UI] 发送回复到论坛管理器:', replyData);

        // 询问用户是否确认发送回复
        const choice = confirm('确认发送回复？\n\n点击"确定"：发送回复（既插入论坛内容，又发送给模型）\n点击"取消"：取消回复');

        if (choice) {
            // 先插入回复到第一层
            if (window.forumManager.insertReplyToFirstLayer) {
                window.forumManager.insertReplyToFirstLayer(replyData.prefix, replyData.replyFormat).then(() => {
                    console.log('[Forum UI] 回复已插入到第一层');

                    // 然后通过API发送回复给模型
                    if (window.forumManager.sendReplyToAPI) {
                        const fullReply = `${replyData.prefix}\n${replyData.replyFormat}`;
                                                 window.forumManager.sendReplyToAPI(fullReply).then(() => {
                             console.log('[Forum UI] 回复已通过API发送给模型');
                         }).catch(error => {
                            console.error('[Forum UI] API发送回复失败:', error);
                            console.warn('[Forum UI] 回复已插入但未能通知模型');
                        });
                    } else {
                        console.warn('[Forum UI] API发送功能不可用，回复仅插入到论坛内容');
                    }

                    // 刷新论坛内容
                    setTimeout(() => {
                        this.refreshThreadList();
                    }, 500);
                }).catch(error => {
                    console.error('[Forum UI] 插入回复失败:', error);
                    alert('发送回复失败，请重试');
                });
            } else {
                // 如果没有插入功能，提示用户使用论坛管理器
                alert('回复功能需要通过论坛管理器重新生成论坛内容来实现。请使用论坛管理器功能。');
                console.log('[Forum UI] 用户尝试回复:', replyData);
            }
        } else {
            // 用户取消回复
            console.log('[Forum UI] 用户取消回复');
        }
    }

    /**
     * 刷新论坛
     */
    refreshForum() {
        console.log('[Forum UI] 刷新论坛内容');
        this.refreshThreadList();
    }

    /**
     * 刷新帖子列表
     */
    refreshThreadList() {
        const content = document.getElementById('forum-content');
        if (content) {
            content.innerHTML = this.getThreadListHTML();
        }
    }

    /**
     * 生成演示内容
     */
    generateDemoContent() {
        if (window.forumManager) {
            console.log('[Forum UI] 调用论坛管理器生成内容');
            window.forumManager.generateForumContent().then(() => {
                // 生成完成后刷新界面
                setTimeout(() => {
                    this.refreshThreadList();
                }, 1000);
            });
        } else {
            console.warn('[Forum UI] 论坛管理器未找到');
            alert('论坛管理器未初始化，请稍后再试');
        }
    }

    /**
     * 返回主列表
     */
    showMainList() {
        this.currentThreadId = null;

        // 更新状态到论坛主列表
        if (window.mobilePhone) {
            const currentState = window.mobilePhone.currentAppState;
            if (currentState && currentState.app === 'forum' && currentState.view !== 'main') {
                const mainState = {
                    app: 'forum',
                    title: '论坛',
                    view: 'main'
                };
                // 替换当前状态而不是推送新状态
                window.mobilePhone.currentAppState = mainState;
                window.mobilePhone.updateAppHeader(mainState);
                console.log('[Forum UI] 更新状态到论坛主列表:', mainState);
            }
        }

        const forumContent = document.getElementById('forum-content');
        if (forumContent) {
            forumContent.innerHTML = this.getThreadListHTML();
            // 重新绑定主列表事件
            if (window.bindForumEvents) {
                window.bindForumEvents();
            }
        }
    }

    /**
     * 显示论坛控制面板
     */
    showForumControl() {
        // 推送新状态到应用栈，切换到论坛控制页面
        if (window.mobilePhone) {
            const state = {
                app: 'forum',
                title: '论坛设置',
                view: 'forumControl'
            };
            window.mobilePhone.pushAppState(state);
        }

        // 如果没有手机框架，回退到原有的弹出面板
        if (!window.mobilePhone && window.forumManager) {
            window.forumManager.showForumPanel();
        }
    }

    // 重置论坛UI状态
    resetState() {
        console.log('[Forum UI] 重置论坛UI状态');
        this.currentThreadId = null;
        this.currentView = 'main';

        // 重置到主列表视图
        this.showMainList();

        console.log('[Forum UI] 论坛UI状态重置完成');
    }
}

// 创建全局实例
window.ForumUI = ForumUI;
window.forumUI = new ForumUI();

// 获取论坛应用内容的全局函数
window.getForumAppContent = function() {
    return window.forumUI.getForumMainHTML();
};

// 绑定论坛应用事件的全局函数
window.bindForumEvents = function() {
    if (window.forumUI) {
        window.forumUI.bindEvents();
        console.log('[Forum UI] 事件绑定完成');
    }
};

console.log('[Forum UI] 论坛UI模块加载完成');
