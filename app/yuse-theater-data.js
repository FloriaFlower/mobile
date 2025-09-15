// 初始默认数据（打开手机时显示）
window.YuseTheaterDefaultData = {
  announcements: `<div class="list-item" data-id="anno_default" data-type="announcement" data-title="【新手引导】《初入剧场》" data-description="作为新人演员，需完成基础拍摄任务，熟悉剧场流程。包含简单肢体互动与镜头适应训练，无复杂剧情要求。" data-actor="指导老师" data-location="基础摄影棚" data-payment="片酬50,000 + 新人礼包">
    <div class="item-title">【新手引导】《初入剧场》</div>
    <div class="item-meta"><span>📍 基础摄影棚</span><span>🎬 指导老师</span><span class="item-tag">新手任务</span><span class="item-price">💰 50,000 + 新人礼包</span></div>
  </div>`,
  customizations: `<div class="list-item" data-id="cust_default" data-type="customization" data-fan-id="新手粉丝" data-type-name="简单互动视频" data-request="录制一段1分钟的打招呼视频，穿着日常服装即可，无需复杂表演。" data-deadline="24小时内" data-payment="30,000" data-notes="轻松完成，助力新人成长～">
    <div class="item-title">新手粉丝 的 简单互动视频 定制</div>
    <div class="item-meta"><span>⏰ 24小时内</span><span class="item-price">💰 30,000</span></div>
    <div class="item-actions"><button class="action-button reject-btn" data-id="cust_default">拒绝</button><button class="action-button accept-btn" data-id="cust_default">接取</button></div>
  </div>`,
  theater: `<div class="list-item" data-id="th_default" data-type="theater" data-title="《剧场入门指南》" data-cover="https://picsum.photos/400/200?random=100" data-description="主演：新人演员 (饰 自己)，指导老师 (饰 导师)。简介：新手演员熟悉剧场拍摄流程的教学影片，包含镜头站位、基础互动等内容，无敏感剧情。" data-popularity="10.2w" data-favorites="5.8w" data-views="88.3w" data-price="¥399" data-reviews='[{"user":"指导老师","text":"认真学习，早日成为优秀演员！"},{"user":"新人观众","text":"跟着学，很实用～"}]'>
    <div class="item-title">《剧场入门指南》</div>
    <div class="item-meta"><span>❤️ 10.2w</span><span>⭐ 5.8w</span><span>▶️ 88.3w</span><span class="item-price">💰 ¥399</span></div>
  </div>`,
  shop: `<div class="list-item" data-id="shop_default" data-type="shop" data-name="【新人专属】基础演出服套装" data-description="适合新人演员的日常演出服装，包含2件上衣、1条裙子，舒适透气，便于活动。" data-tags='["新人专属", "服装"]' data-price="¥1,999" data-highest-bid="¥1,999" data-comments='[{"user":"新手演员","text":"很合身，性价比高！"},{"user":"服装师","text":"基础款必备，推荐新人购买～"}]'>
    <div class="item-title">【新人专属】基础演出服套装</div>
    <div class="item-meta"><span class="item-tag">新人专属</span><span class="item-price">💰 ¥1,999</span></div>
  </div>`
};

// 数据格式正则（保留原版所有功能）
window.YuseTheaterRegex = {
  fullMatch: /<yuse_data>.*?<announcements>(.*?)<\/announcements>.*?<customizations>(.*?)<\/customizations>.*?<theater>(.*?)<\/theater>.*?<theater_hot>(.*?)<\/theater_hot>.*?<theater_new>(.*?)<\/theater_new>.*?<theater_recommended>(.*?)<\/theater_recommended>.*?<theater_paid>(.*?)<\/theater_paid>.*?<shop>(.*?)<\/shop>.*?<\/yuse_data>/s,
  announcement: /\[通告\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
  customization: /\[定制\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
  theater: /\[剧场\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
  shop: /\[商品\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g
};

// 页面标识与接口映射
window.YuseTheaterPages = {
  announcements: {
    name: "通告拍摄",
    apiKeyword: "announcements",
    refreshMsg: "[刷新通告拍摄|请求新通告列表]"
  },
  customizations: {
    name: "粉丝定制",
    apiKeyword: "customizations",
    refreshMsg: "[刷新粉丝定制|请求新定制列表]"
  },
  theater: {
    name: "剧场列表",
    apiKeyword: "theater",
    refreshMsg: "[刷新剧场列表|请求新剧场内容]"
  },
  shop: {
    name: "欲色商城",
    apiKeyword: "shop",
    refreshMsg: "[刷新欲色商城|请求新商品列表]"
  }
};
