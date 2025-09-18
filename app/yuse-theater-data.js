// 初始默认数据（打开手机时显示）- 修复：新增fullData字段+补全所有剧场分类
window.YuseTheaterDefaultData = {
  // 关键：按原版正则要求，用<yuse_data>包裹所有数据，包含所有子标签
  fullData: `<yuse_data>
  <announcements><div class="list-item">测试通告</div></announcements>
  <customizations><div class="list-item">测试定制</div></customizations>
  <theater><div class="list-item">测试剧场</div></theater>
  <theater_hot></theater_hot>
  <theater_new></theater_new>
  <theater_recommended></theater_recommended>
  <theater_paid></theater_paid>
  <shop><div class="list-item">测试商品</div></shop>
  </yuse_data>`,

// 数据格式正则（保留原版所有功能，无修改）
window.YuseTheaterRegex = {
  fullMatch: /<yuse_data>.*?<announcements>(.*?)<\/announcements>.*?<customizations>(.*?)<\/customizations>.*?<theater>(.*?)<\/theater>.*?<theater_hot>(.*?)<\/theater_hot>.*?<theater_new>(.*?)<\/theater_new>.*?<theater_recommended>(.*?)<\/theater_recommended>.*?<theater_paid>(.*?)<\/theater_paid>.*?<shop>(.*?)<\/shop>.*?<\/yuse_data>/s,
  announcement: /\[通告\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
  customization: /\[定制\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
  theater: /\[剧场\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g,
  shop: /\[商品\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g
};

// 页面标识与接口映射（保留原版，无修改）
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
