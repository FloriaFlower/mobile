// 初始默认数据（打开手机时显示）- 修复：新增fullData字段+补全所有剧场分类
window.YuseTheaterDefaultData = {
  // 关键：按原版正则要求，用<yuse_data>包裹所有数据，包含所有子标签
  fullData: `<yuse_data>
    <!-- 通告数据 -->
    <announcements>
      <div class="list-item" data-id="anno_1" data-type="announcement" data-title="【S级制作】《深海囚笼》双人水下摄影" data-description="与一线男演员温言合作，在特制水下摄影棚完成。剧情涉及人鱼主题，包含大量湿身、束缚、以及水中亲密互动。要求表现出窒息与沉溺的极致美感。拍摄周期3天，需要极佳的水性和镜头表现力。" data-actor="温言" data-location="海蓝市'深海之梦'水下摄影棚" data-payment="片酬200,000 + 15%平台分成">
        <div class="item-title">【S级制作】《深海囚笼》双人水下摄影</div>
        <div class="item-meta"><span>📍 海蓝市'深海之梦'水下摄影棚</span><span>🎬 温言</span><span class="item-tag">人鱼主题</span><span class="item-price">💰 200,000 + 15%分成</span></div>
      </div>
      <div class="list-item" data-id="anno_2" data-type="announcement" data-title="【新人带教】《野犬驯服日记》" data-description="与新人主播顾麟合作，扮演严厉的导师角色。剧情需要{{user}}从零开始，通过身体力行的方式教导顾麟如何取悦观众，包含大量教学式亲密接触、姿势指导和道具使用示范。旨在打造'忠犬养成'爆款。" data-actor="顾麟" data-location="平台专属1号影棚" data-payment="片酬150,000 + 10%平台分成">
        <div class="item-title">【新人带教】《野犬驯服日记》</div>
        <div class="item-meta"><span>📍 平台专属1号影棚</span><span>🎬 顾麟</span><span class="item-tag">教学/养成</span><span class="item-price">💰 150,000 + 10%分成</span></div>
      </div>
      <div class="list-item" data-id="anno_3" data-type="announcement" data-title="【多人企划】《末日审判：最后的狂欢》" data-description="大型多人企划，合作演员包括朝刃、白羽及另外三位一线男演员。剧情背景为末日来临前的最后一夜，{{user}}作为唯一的'神谕'，接受五位信徒的朝拜与献祭。包含大量群体互动、轮流侍奉、以及多重高潮场景。" data-actor="朝刃, 白羽, 陆景深, 等" data-location="'失乐园'废土风主题酒店" data-payment="片酬500,000 + 20%平台分成">
        <div class="item-title">【多人企划】《末日审判：最后的狂欢》</div>
        <div class="item-meta"><span>📍 '失乐园'废土风主题酒店</span><span>🎬 朝刃, 白羽, 等</span><span class="item-tag">多人/末日</span><span class="item-price">💰 500,000 + 20%分成</span></div>
      </div>
      <div class="list-item" data-id="anno_4" data-type="announcement" data-title="《赛博格之恋》科幻主题拍摄" data-description="与新锐演员朝刃合作，在充满未来科技感的场景中，扮演一个拥有人类情感的机器人。朝刃将扮演为其注入'情感'的工程师。剧情涉及冰冷的机械与火热的肉体碰撞，有大量关于'第一次'体验的细腻描写。" data-actor="朝刃" data-location="'奇点'科技影棚" data-payment="片酬180,000 + 12%平台分成">
        <div class="item-title">《赛博格之恋》科幻主题拍摄</div>
        <div class="item-meta"><span>📍 '奇点'科技影棚</span><span>🎬 朝刃</span><span class="item-tag">科幻/机器人</span><span class="item-price">💰 180,000 + 12%分成</span></div>
      </div>
      <div class="list-item" data-id="anno_5" data-type="announcement" data-title="【古风限定】《画中仙》" data-description="与古典美男白羽合作，拍摄古风画卷主题影片。{{user}}扮演被画师白羽倾注所有爱意而化为人形的画中仙。剧情包含笔墨在身体上游走、宣纸半透的湿身诱惑、以及在画室中的极致缠绵。" data-actor="白羽" data-location="'江南春色'古风园林" data-payment="片酬170,000 + 12%平台分成">
        <div class="item-title">【古风限定】《画中仙》</div>
        <div class="item-meta"><span>📍 '江南春色'古风园林</span><span>🎬 白羽</span><span class="item-tag">古风/唯美</span><span class="item-price">💰 170,000 + 12%分成</span></div>
      </div>
      <div class="list-item" data-id="anno_6" data-type="announcement" data-title="《办公室的秘密游戏》" data-description="与资深演员季扬合作，扮演其私人助理。剧情发生在下班后的总裁办公室，包含办公桌、落地窗前的各种羞耻play，以及权力关系下的情欲拉扯。" data-actor="季扬" data-location="市中心CBD顶层写字楼" data-payment="片酬160,000 + 10%平台分成">
        <div class="item-title">《办公室的秘密游戏》</div>
        <div class="item-meta"><span>📍 市中心CBD顶层写字楼</span><span>🎬 季扬</span><span class="item-tag">职场/权力</span><span class="item-price">💰 160,000 + 10%分成</span></div>
      </div>
      <div class="list-item" data-id="anno_7" data-type="announcement" data-title="【三人行】《双子恶魔的祭品》" data-description="与温言、朝刃合作，扮演被一对双子恶魔捕获的祭品。温言代表'色欲'，朝刃代表'嫉妒'。剧情包含双重夹击、同时侍奉、以及在竞争中不断升级的快感体验。" data-actor="温言, 朝刃" data-location="哥特式古堡摄影棚" data-payment="片酬350,000 + 18%平台分成">
        <div class="item-title">【三人行】《双子恶魔的祭品》</div>
        <div class="item-meta"><span>📍 哥特式古堡摄影棚</span><span>🎬 温言, 朝刃</span><span class="item-tag">多人/恶魔</span><span class="item-price">💰 350,000 + 18%分成</span></div>
      </div>
      <div class="list-item" data-id="anno_8" data-type="announcement" data-title="《校园怪谈：体育仓库的传闻》" data-description="与新人顾麟合作，扮演深夜探险校园的学生角色，顾麟扮演体育生学弟。两人被困在体育仓库，从互相试探到干柴烈火。充满青春荷尔蒙气息，大量汗水与肉体碰撞的特写。" data-actor="顾麟" data-location="城郊废弃中学" data-payment="片酬140,000 + 10%平台分成">
        <div class="item-title">《校园怪谈：体育仓库的传闻》</div>
        <div class="item-meta"><span>📍 城郊废弃中学</span><span>🎬 顾麟</span><span class="item-tag">校园/体育生</span><span class="item-price">💰 140,000 + 10%分成</span></div>
      </div>
      <div class="list-item" data-id="anno_9" data-type="announcement" data-title="【多人企划】《深渊祭品》主角招募" data-description="大型古代玄幻题材，{{user}}将扮演被献祭给三位魔神的精灵。需要与朝刃、白羽、顾麟三人同时进行拍摄。包含大量3P/4P情节，精灵的身体会被魔神们用各种方式亵玩，从圣洁到堕落，最终被魔神们的精液彻底灌满，沦为欲望的奴隶。" data-actor="朝刃, 白羽, 顾麟" data-location="平郊外古堡影视基地" data-payment="片酬50万 + 25%平台分红">
        <div class="item-title">【多人企划】《深渊祭品》主角招募</div>
        <div class="item-meta"><span>📍 郊外古堡影视基地</span><span>🎬 朝刃, 白羽, 顾麟</span><span class="item-tag">多人/玄幻/堕落</span><span class="item-price">💰 50万 + 25%分红</span></div>
      </div>
      <div class="list-item" data-id="anno_10" data-type="announcement" data-title="【青春校园】《课后辅导》搭档招募" data-description="与新人演员朝刃搭档，扮演一对表面是师生，私下却在空教室里进行禁忌教学的情侣。朝刃扮演桀骜不驯的体育生，将老师按在讲台上操干。需要主演出被年轻肉体征服的羞耻与快乐，包含大量足交、强制口交和内射场景。" data-actor="朝刃" data-location="废弃中学场景" data-payment="片酬15万 + 10%平台分红">
        <div class="item-title">【青春校园】《课后辅导》搭档招募</div>
        <div class="item-meta"><span>📍废弃中学场景</span><span>🎬 朝刃</span><span class="item-tag">师生/年下/强制</span><span class="item-price">💰 片酬15万 + 10%平台分红</span></div>
      </div>
      <div class="list-item" data-id="anno_11" data-type="announcement" data-title="《迷途羔羊》宗教主题" data-description="与温言合作，扮演迷失的信徒，温言则是禁欲的神父。在忏悔室里，进行一场灵魂与肉体的'救赎'。包含大量的言语挑逗、神圣感与亵渎感的极致反差。" data-actor="温言" data-location="欧洲小镇教堂（布景）" data-payment="片酬190,000 + 12%分成">
        <div class="item-title">《迷途羔羊》宗教主题</div>
        <div class="item-meta"><span>📍 欧洲小镇教堂（布景）</span><span>🎬 温言</span><span class="item-tag">宗教/禁欲</span><span class="item-price">💰 190,000 + 12%分成</span></div>
      </div>
      <div class="list-item" data-id="anno_12" data-type="announcement" data-title="【暗黑童话】《小红帽与三只狼》主角" data-description="颠覆童话，小红帽在森林里被三只“大灰狼”（温言、朝刃、顾麟）捕获。从被轮流口交到小穴被填满，在森林木屋里被连续三天三夜地操干，身体被彻底改造成离不开雄性精液的淫乱状态。需要极强的身体承受能力。" data-actor="朝温言, 朝刃, 顾麟" data-location="森林实景拍摄地" data-payment="片酬60万 + 30%平台分红">
        <div class="item-title">【暗黑童话】《小红帽与三只狼》主角</div>
        <div class="item-meta"><span>📍 森林实景拍摄地</span><span>🎬 温言, 朝刃, 顾麟</span><span class="item-tag">多人/童话改编</span><span class="item-price">💰 片酬60万 + 30%平台分红</span></div>
      </div>
    </announcements>

    <!-- 粉丝定制数据 -->
    <customizations>
      <div class="list-item" data-id="cust_1" data-type="customization" data-fan-id="霍" data-type-name="私人晚宴" data-request="下周五晚，在我私人府邸进行一场一对一的晚宴直播。服装由我提供，主题是'金丝雀的献礼'。直播内容很简单，只需要{{user}}全程穿着我指定的衣服，按照我的指示行动即可。不需要过度表演，自然就好。" data-deadline="下周五晚" data-payment="1,000,000" data-notes="一切开销由我承担，司机会在周五下午六点准时去接。">
  <div class="item-title">霍 的 私人晚宴 定制</div>
  <div class="item-meta"><span>⏰ 下周五晚</span><span class="item-price">💰 1,000,000</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_1">拒绝</button><button class="action-button accept-btn" data-id="cust_1">接取</button></div>
</div>
<div class="list-item" data-id="cust_2" data-type="customization" data-fan-id="X" data-type-name="24小时监控录像" data-request="在你家里安装一个摄像头，我想看你24小时的日常生活，不需要你特意表演什么，吃饭、睡觉、发呆......我只想看着你。作为回报，你每天会收到一笔不菲的“生活费”。当然，如果你愿意在摄像头前自慰，我会支付额外费用，我想看你用我送的那个粉色章鱼形状的玩具，看你被它的触手玩到喷水。" data-deadline="即刻生效，为期一周" data-payment="800,000" data-notes="如果可以，希望镜头角度能更清晰一点。">
  <div class="item-title">X 的 24小时监控录像 定制</div>
  <div class="item-meta"><span>⏰ 即刻生效，为期一周</span><span class="item-price">💰 800,000</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_2">拒绝</button><button class="action-button accept-btn" data-id="cust_2">接取</button></div>
</div>
<div class="list-item" data-id="cust_3" data-type="customization" data-fan-id="难言" data-type-name="专属ASMR" data-request="录一段专属的ASMR音频。穿着你的真丝睡衣，在床上辗转反侧，想象我在你身边，对着麦克风小声地呻吟，叫我的名字......告诉我你有多想要，描述你身体的感觉，下面是不是已经湿了，乳头是不是变硬了。我只想听你的声音，听你为我一个人意乱情迷。" data-deadline="三天内" data-payment="300,000" data-notes="如果觉得为难就算了...但是真的很想要。">
  <div class="item-title">难言 的 专属ASMR 定制</div>
  <div class="item-meta"><span>⏰ 三天内</span><span class="item-price">💰 300,000</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_3">拒绝</button><button class="action-button accept-btn" data-id="cust_3">接取</button></div>
</div>
<div class="list-item" data-id="cust_4" data-type="customization" data-fan-id="DragonSlayer88" data-type-name="游戏陪玩（裸体版）" data-request="陪我打一晚上游戏，输一局脱一件衣服，直到脱光。然后每输一局，就用跳蛋惩罚自己五分钟，我要在语音里听到你压抑不住的呻吟声。如果我赢了，你就得夸我‘老公好厉害’，然后用淫水在肚子上写我的ID。" data-deadline="今晚" data-payment="5万/小时" data-notes="就玩王者1v1单挑">
  <div class="item-title">DragonSlayer88 的 游戏陪玩（裸体版） 定制</div>
  <div class="item-meta"><span>⏰ 今晚</span><span class="item-price">💰 5万/小时</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_4">拒绝</button><button class="action-button accept-btn" data-id="cust_4">接取</button></div>
</div>
<div class="list-item" data-id="cust_5" data-type="customization" data-fan-id="匿名用户" data-type-name="公开羞耻任务" data-request="在人流量大的商场里，穿着那件开叉到腰部的裤子，不穿内裤。在试衣间里自慰，并拍下淫水顺着大腿流下来的照片发给我。任务期间需要和我保持通话，我会随时给你下达新的指令，比如故意弯腰捡东西，或者找男店员问路。" data-deadline="本周六下午" data-payment="50万" data-notes="风险越高，报酬越高。">
  <div class="item-title">匿名用户 的 公开羞耻任务 定制</div>
  <div class="item-meta"><span>⏰ 本周六下午</span><span class="item-price">💰 50万</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_5">拒绝</button><button class="action-button accept-btn" data-id="cust_5">接取</button></div>
</div>
<div class="list-item" data-id="cust_6" data-type="customization" data-fan-id="霍" data-type-name="商务差旅伴游" data-request="下周我需要去欧洲出差一周，希望{{user}}能作为我的“特别助理”陪同。白天你可以自由活动，购物消费全部由我承担。晚上，我希望你能在我处理完工作后，用你的身体帮我放松。地点可以是酒店，也可以是私人飞机上。我保证会提供最高级别的安全和隐私保护。" data-deadline="下周一出发" data-payment="300万 + 无上限消费额度" data-notes="如果您愿意，这可以成为一个长期的合作。">
  <div class="item-title">霍 的 商务差旅伴游 定制</div>
  <div class="item-meta"><span>⏰ 下周一出发</span><span class="item-price">💰300万 + 无上限消费额度</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_6">拒绝</button><button class="action-button accept-btn" data-id="cust_6">接取</button></div>
</div>
<div class="list-item" data-id="cust_7" data-type="customization" data-fan-id="平平无奇的有钱人" data-type-name="重现影片场景" data-request="我想让你和温言老师，重现你们那部《禁闭岛》的经典场景。我想亲眼看着你被温言老师按在地上操，看你的眼泪和淫水一起流出来，听你哭着求他射给你。" data-deadline="两周内" data-payment="200万" data-notes="场地和人员由我安排。">
  <div class="item-title">平平无奇的有钱人 的 重现影片场景 定制</div>
  <div class="item-meta"><span>⏰ 两周内</span><span class="item-price">💰200万</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_7">拒绝</button><button class="action-button accept-btn" data-id="cust_7">接取</button></div>
</div>
<div class="list-item" data-id="cust_8" data-type="customization" data-fan-id="王总的小秘" data-type-name="线上情欲指导" data-request="我老板最近对我好像有点冷淡，想请主播以我的身份，和他进行一周的线上匿名聊天，帮我重新勾起他的兴趣。需要你模仿我的语气，但内容要更骚、更主动。聊天记录需要同步给我学习。" data-deadline="下周一开始" data-payment="100,000" data-notes="成功了有重谢！">
  <div class="item-title">王总的小秘 的 线上情欲指导 定制</div>
  <div class="item-meta"><span>⏰ 下周一开始</span><span class="item-price">💰 100,000</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_8">拒绝</button><button class="action-button accept-btn" data-id="cust_8">接取</button></div>
</div>
<div class="list-item" data-id="cust_9" data-type="customization" data-fan-id="只想给你花钱" data-type-name="原味内衣裤拍卖" data-request="把你刚拍完片穿的那套内裤，带着你的体温和体液，不要清洗，直接寄给我。我想闻闻上面混合着汗水和爱液的味道，想象你被操干时的样子。如果上面能有一点点高潮时的喷出的水渍就更好了。" data-deadline="一周内" data-payment="100,000" data-notes="邮费我出，包装得隐秘一点。">
  <div class="item-title">只想给你花钱 的 原味内衣裤拍卖 定制</div>
  <div class="item-meta"><span>⏰ 一周内</span><span class="item-price">💰 20万</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_9">拒绝</button><button class="action-button accept-btn" data-id="cust_9">接取</button></div>
</div>
<div class="list-item" data-id="cust_10" data-type="customization" data-fan-id="一个剧本编剧" data-type-name="角色扮演对话" data-request="我正在写一个剧本，想请你扮演其中的一个角色'阿芙拉'，和我进行几段关键剧情的对话。阿芙拉是一个周旋于多个男人之间的交际花，需要你演出那种既天真又堕落的感觉。" data-deadline="明晚8点" data-payment="80,000" data-notes="只是为了找灵感，谢谢！">
  <div class="item-title">一个剧本编剧 的 角色扮演对话 定制</div>
  <div class="item-meta"><span>⏰ 明晚8点</span><span class="item-price">💰 80,000</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_10">拒绝</button><button class="action-button accept-btn" data-id="cust_10">接取</button></div>
</div>
<div class="list-item" data-id="cust_11" data-type="customization" data-fan-id="难言" data-type-name="一起打游戏" data-request="就...就是想约你一起打几局游戏，就我们俩。我什么游戏都玩，你定。我不想在直播间看你和别人玩...就...不可以吗？输了赢了都行，我给你刷礼物。" data-deadline="今晚" data-payment="200,000" data-notes="求你了。">
  <div class="item-title">难言 的 一起打游戏 定制</div>
  <div class="item-meta"><span>⏰ 今晚</span><span class="item-price">💰 200,000</span></div>
  <div class="item-actions"><button class="action-button reject-btn" data-id="cust_11">拒绝</button><button class="action-button accept-btn" data-id="cust_11">接取</button></div>
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
