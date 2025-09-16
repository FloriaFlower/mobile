// 初始默认数据（打开手机时显示）- 修复：新增fullData字段+补全所有剧场分类
window.YuseTheaterDefaultData = {
  // 关键：按原版正则要求，用<yuse_data>包裹所有数据，包含所有子标签
  fullData: `<yuse_data>
    <!-- 通告数据 -->
    <announcements>
      <div class="list-item" data-id="anno_default" data-type="announcement" data-title="【新手引导】《初入剧场》" data-description="作为新人演员，需完成基础拍摄任务，熟悉剧场流程。包含简单肢体互动与镜头适应训练，无复杂剧情要求。" data-actor="指导老师" data-location="基础摄影棚" data-payment="片酬50,000 + 新人礼包">
        <div class="item-title">【新手引导】《初入剧场》</div>
        <div class="item-meta"><span>📍 基础摄影棚</span><span>🎬 指导老师</span><span class="item-tag">新手任务</span><span class="item-price">💰 50,000 + 新人礼包</span></div>
      </div>
    </announcements>

    <!-- 粉丝定制数据 -->
    <customizations>
      <div class="list-item" data-id="cust_default" data-type="customization" data-fan-id="新手粉丝" data-type-name="简单互动视频" data-request="录制一段1分钟的打招呼视频，穿着日常服装即可，无需复杂表演。" data-deadline="24小时内" data-payment="30,000" data-notes="轻松完成，助力新人成长～">
        <div class="item-title">新手粉丝 的 简单互动视频 定制</div>
        <div class="item-meta"><span>⏰ 24小时内</span><span class="item-price">💰 30,000</span></div>
        <div class="item-actions"><button class="action-button reject-btn" data-id="cust_default">拒绝</button><button class="action-button accept-btn" data-id="cust_default">接取</button></div>
      </div>
    </customizations>

    <!-- 默认剧场数据（全部剧场） -->
    <theater>
      <!-- 原有默认剧场 -->
      <div class="list-item" data-id="th_default" data-type="theater" data-title="《剧场入门指南》" data-cover="https://picsum.photos/400/200?random=100" data-description="主演：新人演员 (饰 自己)，指导老师 (饰 导师)。简介：新手演员熟悉剧场拍摄流程的教学影片，包含镜头站位、基础互动等内容，无敏感剧情。" data-popularity="10.2w" data-favorites="5.8w" data-views="88.3w" data-price="¥399" data-reviews='[{"user":"指导老师","text":"认真学习，早日成为优秀演员！"},{"user":"新人观众","text":"跟着学，很实用～"}]'>
        <div class="item-title">《剧场入门指南》</div>
        <div class="item-meta"><span>❤️ 10.2w</span><span>⭐ 5.8w</span><span>▶️ 88.3w</span><span class="item-price">💰 ¥399</span></div>
      </div>
      <!-- 补全：默认剧场包含所有分类的代表作品 -->
      <div class="list-item" data-id="th_all_hot1" data-type="theater" data-title="《夏日海边的约定》" data-cover="https://picsum.photos/400/200?random=101" data-description="主演：新人演员 (饰 夏沫)，资深演员 (饰 阿泽)。简介：夏日海边的治愈系剧情，包含沙滩互动、台词训练，人气TOP1作品。" data-popularity="56.8w" data-favorites="22.3w" data-views="620.5w" data-price="¥599" data-reviews='[{"user":"资深观众","text":"反复看了3遍，海边镜头太治愈！"},{"user":"粉丝A","text":"人气不愧是第一，互动好自然～"}]'>
        <div class="item-title">《夏日海边的约定》</div>
        <div class="item-meta"><span>❤️ 56.8w</span><span>⭐ 22.3w</span><span>▶️ 620.5w</span><span class="item-tag">🔥 热门</span><span class="item-price">💰 ¥599</span></div>
      </div>
      <div class="list-item" data-id="th_all_new1" data-type="theater" data-title="《雨夜的便利店》" data-cover="https://picsum.photos/400/200?random=102" data-description="主演：新人演员 (饰 小雨)，指导老师 (饰 店长)。简介：新上线的温情短剧情，包含室内对话、情绪表达训练，上线不足24小时。" data-popularity="8.5w" data-favorites="3.1w" data-views="45.2w" data-price="¥499" data-reviews='[{"user":"抢先观众","text":"刚上线就看了，剧情好暖！"},{"user":"指导老师","text":"新剧情难度适中，适合练情绪～"}]'>
        <div class="item-title">《雨夜的便利店》</div>
        <div class="item-meta"><span>❤️ 8.5w</span><span>⭐ 3.1w</span><span>▶️ 45.2w</span><span class="item-tag">🆕 最新</span><span class="item-price">💰 ¥499</span></div>
      </div>
    </theater>

    <!-- 补全：热门剧场（theater_hot）- 原版正则要求字段 -->
    <theater_hot>
      <div class="list-item" data-id="th_hot1" data-type="theater" data-title="《夏日海边的约定》" data-cover="https://picsum.photos/400/200?random=101" data-description="主演：新人演员 (饰 夏沫)，资深演员 (饰 阿泽)。简介：夏日海边的治愈系剧情，包含沙滩互动、台词训练，人气TOP1作品，播放量破600w。" data-popularity="56.8w" data-favorites="22.3w" data-views="620.5w" data-price="¥599" data-reviews='[{"user":"资深观众","text":"反复看了3遍，海边镜头太治愈！"},{"user":"粉丝A","text":"人气不愧是第一，互动好自然～"},{"user":"剧场官微","text":"热门榜连续7天第一，值得一看！"}]'>
        <div class="item-title">《夏日海边的约定》</div>
        <div class="item-meta"><span>❤️ 56.8w</span><span>⭐ 22.3w</span><span>▶️ 620.5w</span><span class="item-tag">🔥 热门</span><span class="item-price">💰 ¥599</span></div>
      </div>
      <div class="list-item" data-id="th_hot2" data-type="theater" data-title="《校园音乐节》" data-cover="https://picsum.photos/400/200?random=105" data-description="主演：新人演员 (饰 主唱)，团体演员 (饰 乐队成员)。简介：校园题材高人气剧情，包含舞台表演、团队协作，粉丝应援量破30w。" data-popularity="42.1w" data-favorites="18.7w" data-views="450.3w" data-price="¥559" data-reviews='[{"user":"学生粉丝","text":"校园感拉满！舞台镜头太燃了"},{"user":"音乐指导","text":"演唱片段的情绪表达很到位～"}]'>
        <div class="item-title">《校园音乐节》</div>
        <div class="item-meta"><span>❤️ 42.1w</span><span>⭐ 18.7w</span><span>▶️ 450.3w</span><span class="item-tag">🔥 热门</span><span class="item-price">💰 ¥559</span></div>
      </div>
    </theater_hot>

    <!-- 补全：最新剧场（theater_new）- 原版正则要求字段 -->
    <theater_new>
      <div class="list-item" data-id="th_new1" data-type="theater" data-title="《雨夜的便利店》" data-cover="https://picsum.photos/400/200?random=102" data-description="主演：新人演员 (饰 小雨)，指导老师 (饰 店长)。简介：新上线的温情短剧情，包含室内对话、情绪表达训练，上线不足24小时，评论破万。" data-popularity="8.5w" data-favorites="3.1w" data-views="45.2w" data-price="¥499" data-reviews='[{"user":"抢先观众","text":"刚上线就看了，剧情好暖！"},{"user":"指导老师","text":"新剧情难度适中，适合练情绪～"},{"user":"新人演员B","text":"刚拍完，期待大家的反馈！"}]'>
        <div class="item-title">《雨夜的便利店》</div>
        <div class="item-meta"><span>❤️ 8.5w</span><span>⭐ 3.1w</span><span>▶️ 45.2w</span><span class="item-tag">🆕 最新</span><span class="item-price">💰 ¥499</span></div>
      </div>
      <div class="list-item" data-id="th_new2" data-type="theater" data-title="《职场新人日记》" data-cover="https://picsum.photos/400/200?random=106" data-description="主演：新人演员 (饰 实习生)，资深演员 (饰 部门主管)。简介：今日刚上线的职场剧情，包含职场礼仪、汇报场景，适合新人提升职场表演技巧。" data-popularity="5.2w" data-favorites="1.8w" data-views="28.7w" data-price="¥459" data-reviews='[{"user":"职场观众","text":"很真实！像在看自己的实习生活"},{"user":"导演","text":"最新职场题材，后续会更新续集～"}]'>
        <div class="item-title">《职场新人日记》</div>
        <div class="item-meta"><span>❤️ 5.2w</span><span>⭐ 1.8w</span><span>▶️ 28.7w</span><span class="item-tag">🆕 最新</span><span class="item-price">💰 ¥459</span></div>
      </div>
    </theater_new>

    <!-- 补全：推荐剧场（theater_recommended）- 原版正则要求字段 -->
    <theater_recommended>
      <div class="list-item" data-id="th_rec1" data-type="theater" data-title="《职场初体验》" data-cover="https://picsum.photos/400/200?random=103" data-description="主演：新人演员 (饰 实习生)，资深演员 (饰 主管)。简介：官方推荐的职场剧情，包含职场礼仪、对话技巧训练，新人成长必看，导演亲自指导。" data-popularity="32.1w" data-favorites="15.7w" data-views="310.8w" data-price="¥599" data-reviews='[{"user":"官方小编","text":"新人成长推荐首选！"},{"user":"职场演员","text":"对实际拍摄帮助很大～"},{"user":"导演C","text":"为新人量身定制的职场教学剧情"}]'>
        <div class="item-title">《职场初体验》</div>
        <div class="item-meta"><span>❤️ 32.1w</span><span>⭐ 15.7w</span><span>▶️ 310.8w</span><span class="item-tag">❤️ 推荐</span><span class="item-price">💰 ¥599</span></div>
      </div>
      <div class="list-item" data-id="th_rec2" data-type="theater" data-title="《情绪表达特训营》" data-cover="https://picsum.photos/400/200?random=107" data-description="主演：新人演员 (饰 学员)，表演导师 (饰 教练)。简介：官方力荐的基础训练剧情，包含喜怒哀乐四种情绪切换，提升表演感染力。" data-popularity="28.5w" data-favorites="12.3w" data-views="260.4w" data-price="¥529" data-reviews='[{"user":"表演导师","text":"情绪训练的经典案例，推荐新人反复看"},{"user":"资深演员","text":"当年我也是靠这个剧情入门的～"}]'>
        <div class="item-title">《情绪表达特训营》</div>
        <div class="item-meta"><span>❤️ 28.5w</span><span>⭐ 12.3w</span><span>▶️ 260.4w</span><span class="item-tag">❤️ 推荐</span><span class="item-price">💰 ¥529</span></div>
      </div>
    </theater_recommended>

    <!-- 补全：高价定制剧场（theater_paid）- 原版正则要求字段 -->
    <theater_paid>
      <div class="list-item" data-id="th_paid1" data-type="theater" data-title="《星光颁奖礼》" data-cover="https://picsum.photos/400/200?random=104" data-description="主演：新人演员 (饰 获奖演员)，多位资深演员 (饰 嘉宾/主持人)。简介：高价定制的颁奖礼剧情，包含红毯走秀、获奖致辞、媒体采访，片酬是普通剧情的3倍。" data-popularity="45.3w" data-favorites="18.9w" data-views="480.2w" data-price="¥1299" data-reviews='[{"user":"投资方","text":"高价定制品质有保障！场景超还原"},{"user":"资深演员","text":"片酬高，拍摄体验好，服装都是高定～"},{"user":"造型师","text":"颁奖礼的造型设计超用心，值得一看！"}]'>
        <div class="item-title">《星光颁奖礼》</div>
        <div class="item-meta"><span>❤️ 45.3w</span><span>⭐ 18.9w</span><span>▶️ 480.2w</span><span class="item-tag">💸 高价定制</span><span class="item-price">💰 ¥1299</span></div>
      </div>
      <div class="list-item" data-id="th_paid2" data-type="theater" data-title="《跨国时尚秀》" data-cover="https://picsum.photos/400/200?random=108" data-description="主演：新人演员 (饰 国际模特)，外籍演员 (饰 设计师/秀导)。简介：海外高价定制剧情，包含跨国航班、后台准备、T台走秀，全程双语拍摄，片酬含海外补贴。" data-popularity="38.7w" data-favorites="15.2w" data-views="390.6w" data-price="¥1599" data-reviews='[{"user":"海外制片","text":"跨国拍摄成本高，但呈现效果超预期"},{"user":"模特导师","text":"T台走秀的镜头感训练很专业～"}]'>
        <div class="item-title">《跨国时尚秀》</div>
        <div class="item-meta"><span>❤️ 38.7w</span><span>⭐ 15.2w</span><span>▶️ 390.6w</span><span class="item-tag">💸 高价定制</span><span class="item-price">💰 ¥1599</span></div>
      </div>
    </theater_paid>

    <!-- 商城数据 -->
    <shop>
      <div class="list-item" data-id="shop_default" data-type="shop" data-name="【新人专属】基础演出服套装" data-description="适合新人演员的日常演出服装，包含2件上衣、1条裙子，舒适透气，便于活动，多色可选。" data-tags='["新人专属", "服装"]' data-price="¥1,999" data-highest-bid="¥1,999" data-comments='[{"user":"新手演员","text":"很合身，性价比高！日常拍摄足够用"},{"user":"服装师","text":"基础款必备，推荐新人购买～"},{"user":"演员B","text":"洗了几次没变形，面料不错"}]'>
        <div class="item-title">【新人专属】基础演出服套装</div>
        <div class="item-meta"><span class="item-tag">新人专属</span><span class="item-price">💰 ¥1,999</span></div>
      </div>
      <!-- 补全：商城新增高价定制服装（匹配高价剧场） -->
      <div class="list-item" data-id="shop_paid1" data-type="shop" data-name="【高价定制】星光颁奖礼礼服" data-description="为高价剧场《星光颁奖礼》定制的礼服，丝绒面料+手工钉钻，包含礼服裙、披肩、配饰套装，仅支持定制。" data-tags='["高价定制", "礼服"]' data-price="¥8,999" data-highest-bid="¥12,999" data-comments='[{"user":"获奖演员","text":"穿上超显气质，颁奖礼镜头超上镜"},{"user":"造型师","text":"高定品质，手工细节满分～"}]'>
        <div class="item-title">【高价定制】星光颁奖礼礼服</div>
        <div class="item-meta"><span class="item-tag">高价定制</span><span class="item-price">💰 ¥8,999</span></div>
      </div>
    </shop>
  </yuse_data>`,

  // 保留原有的单独字段（兼容旧逻辑）
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
  </div>`,

  // 补全：单独的剧场分类字段（兼容旧逻辑）
  theater_hot: `<div class="list-item" data-id="th_hot1" data-type="theater" data-title="《夏日海边的约定》" data-cover="https://picsum.photos/400/200?random=101" data-description="主演：新人演员 (饰 夏沫)，资深演员 (饰 阿泽)。简介：夏日海边的治愈系剧情，包含沙滩互动、台词训练，人气TOP1作品。" data-popularity="56.8w" data-favorites="22.3w" data-views="620.5w" data-price="¥599" data-reviews='[{"user":"资深观众","text":"反复看了3遍，海边镜头太治愈！"},{"user":"粉丝A","text":"人气不愧是第一，互动好自然～"}]'>
    <div class="item-title">《夏日海边的约定》</div>
    <div class="item-meta"><span>❤️ 56.8w</span><span>⭐ 22.3w</span><span>▶️ 620.5w</span><span class="item-tag">🔥 热门</span><span class="item-price">💰 ¥599</span></div>
  </div>`,
  theater_new: `<div class="list-item" data-id="th_new1" data-type="theater" data-title="《雨夜的便利店》" data-cover="https://picsum.photos/400/200?random=102" data-description="主演：新人演员 (饰 小雨)，指导老师 (饰 店长)。简介：新上线的温情短剧情，包含室内对话、情绪表达训练，上线不足24小时。" data-popularity="8.5w" data-favorites="3.1w" data-views="45.2w" data-price="¥499" data-reviews='[{"user":"抢先观众","text":"刚上线就看了，剧情好暖！"},{"user":"指导老师","text":"新剧情难度适中，适合练情绪～"}]'>
    <div class="item-title">《雨夜的便利店》</div>
    <div class="item-meta"><span>❤️ 8.5w</span><span>⭐ 3.1w</span><span>▶️ 45.2w</span><span class="item-tag">🆕 最新</span><span class="item-price">💰 ¥499</span></div>
  </div>`,
  theater_recommended: `<div class="list-item" data-id="th_rec1" data-type="theater" data-title="《职场初体验》" data-cover="https://picsum.photos/400/200?random=103" data-description="主演：新人演员 (饰 实习生)，资深演员 (饰 主管)。简介：官方推荐的职场剧情，包含职场礼仪、对话技巧训练，新人成长必看。" data-popularity="32.1w" data-favorites="15.7w" data-views="310.8w" data-price="¥599" data-reviews='[{"user":"官方小编","text":"新人成长推荐首选！"},{"user":"职场演员","text":"对实际拍摄帮助很大～"}]'>
    <div class="item-title">《职场初体验》</div>
    <div class="item-meta"><span>❤️ 32.1w</span><span>⭐ 15.7w</span><span>▶️ 310.8w</span><span class="item-tag">❤️ 推荐</span><span class="item-price">💰 ¥599</span></div>
  </div>`,
  theater_paid: `<div class="list-item" data-id="th_paid1" data-type="theater" data-title="《星光颁奖礼》" data-cover="https://picsum.photos/400/200?random=104" data-description="主演：新人演员 (饰 获奖演员)，多位资深演员 (饰 嘉宾)。简介：高价定制的颁奖礼剧情，包含红毯走秀、获奖致辞，片酬丰厚。" data-popularity="45.3w" data-favorites="18.9w" data-views="480.2w" data-price="¥1299" data-reviews='[{"user":"投资方","text":"高价定制品质有保障！"},{"user":"资深演员","text":"片酬高，拍摄体验好～"}]'>
    <div class="item-title">《星光颁奖礼》</div>
    <div class="item-meta"><span>❤️ 45.3w</span><span>⭐ 18.9w</span><span>▶️ 480.2w</span><span class="item-tag">💸 高价定制</span><span class="item-price">💰 ¥1299</span></div>
  </div>`
};

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
