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
      <div class="list-item"
        data-id="th_default_1"
        data-type="theater"
        data-title="《沉沦的家庭教师》"
        data-cover="https://picsum.photos/400/200?random=1"
        data-description="主演：{{user}} (饰 家庭教师-苏琳), 朝刃 (饰 叛逆学生-江野)。简介：苏琳被聘为富家子弟江野的家庭教师，却屡遭叛逆学生的挑逗和骚扰。在一个雷雨夜，江野终于撕下伪装，将苏琳按在书桌上强行侵犯。苏琳从最初的抗拒到逐渐在年轻肉体的冲击下沉沦，身体被一次次操开，淫水浸湿了整套教师制服。结局：苏琳被彻底调教成江野的专属性奴，每天穿着制服在书房里被他内射，小穴再也离不开他的大肉棒。"
        data-popularity="128.5w"
        data-favorites="78.2w"
        data-views="345.1w"
        data-price="¥1288"
        data-reviews='[{"user":"铁锅炖自己","text":"我就喜欢这种禁欲老师被操到哭着喊老公的剧情，朝刃那身腱子肉配上不耐烦的脸，干得老师淫水直流，太顶了！"},{"user":"X","text":"数据分析：心率从75飙升到182，皮肤电反应峰值出现在第28分41秒，穴口收缩频率增加了320%。嗯，表现不错。"}, {"user":"只想舔屏","text":"啊啊啊老婆穿制服的样子太美了，特别是被操到眼镜都歪了，眼角挂着泪，那种破碎感，我直接boki了！"}, {"user":"难言","text":"……（默默刷了10个火箭）"}, {"user":"霍","text":"这种粗鲁的小子有什么好的？{{user}}，如果你愿意，我可以给你提供一个更舒适、更奢华的“教学环境”。"}, {"user":"朝刃","text":"啧，烦死了，拍的时候一直哭，吵死了。"}, {"user":"白羽","text":"要是我的话，一定不会把{{user}}弄哭的，只会让{{user}}舒服地叫出来呢～(｡•́︿•̀｡)"}, {"user":"路人甲","text":"楼上几个别吵了，让我康康！老师被按在桌子上后入的镜头呢？怎么剪了！我花钱不是来看柏拉图的！"}, {"user":"牛牛爆炸了","text":"朝刃的腰也太好了吧，那个驰骋挞伐的劲儿，感觉能把小老师的子宫都给干出来，每次都顶到最深，啧啧，水声真好听。"}, {"user":"18cm纯情男大","text":"只有我注意到老师的白丝被肉棒磨破了吗？细节好评！"}, {"user":"我爱学习","text":"谁能告诉我23:17秒，老师高潮时候喊的那句是什么？是‘不要’还是‘再要一点’？( ͡° ͜ʖ ͡°)"}, {"user":"请和我结婚","text":"老婆的脚也好美，被江野抓着脚踝操的时候，脚趾蜷缩起来的样子，我能看一百遍！"}, {"user":"一滴都不许剩","text":"最后被内射在里面，肚子都鼓起来了，江野还不让流出来，太色了！"}, {"user":"理智评论员","text":"从教育学的角度看，这段关系是不健康的。但从我的几把的角度看，它很健康。"},{"user":"今天也要加油","text":"看完已经冲了三发，感觉身体被掏空。"}, {"user":"爱发电","text":"已下载，准备晚上再看亿遍。"}, {"user":"老衲法号梦遗","text":"贫僧就想问问，这制服哪里有卖？"}, {"user":"我直接进行一个冲","text":"这剧场列表里的片子都这么顶吗？这个就让我顶不住了。"}, {"user":"榨汁机","text":"朝刃你小子别得了便宜还卖乖，有本事放开那个老师让我来！"}]'
        >
        <div class="item-title">《沉沦的家庭教师》</div>
        <div class="item-meta"><span>❤️ 128.5w</span><span>⭐ 78.2w</span><span>▶️ 345.1w</span><span class="item-price">💰 ¥1288</span></div>
      </div>
    <div class="list-item"
        data-id="th_default_2"
        data-type="theater"
        data-title="《总裁的契约情人：探索剧场列表的秘密》"
        data-cover="https://picsum.photos/400/200?random=2"
        data-description="主演：{{user}} (饰 贫穷主角-安然), 温言 (饰 霸道总裁-陆深)。简介：安然为给家人治病，被迫成为陆深的契约情人。陆深外表斯文，床上却是个不折不扣的恶魔。他喜欢看安然穿着昂贵的礼服，却被他在各种豪华场所（落地窗、私人飞机、游艇）操到失禁。每一次的侵犯，都是一次温柔的凌虐。结局：契约结束后，安然发现自己已经离不开陆深的肉棒和精液，主动回去乞求他继续占有自己，最终被锁上金链，成为他笼中的金丝雀。"
        data-popularity="250.3w"
        data-favorites="180.9w"
        data-views="890.2w"
        data-price="¥1599"
        data-reviews='[{"user":"温言","text":"看来你很喜欢我送你的项圈。"}, {"user":"霍","text":"用金钱换来的关系终究是虚假的。{{user}}，我能给你的，远不止这些。"}, {"user":"X","text":"契约期间，{{user}}的平均睡眠时间减少了2.7小时，皮质醇水平上升了48%。这种压力下的性爱，数据模型会更有趣。"}, {"user":"白羽","text":"为什么要把{{user}}弄哭呢？明明可以让{{user}}笑着高潮的呀。温言老师太坏了。"}, {"user":"顾麟","text":"...如果是我，我会把{{user}}养得很好。"}, {"user":"霸总文学爱好者","text":"啊啊啊我死了！温言老师解领带的样子太他妈性感了！斯文败类yyds！"}, {"user":"金钱的味道","text":"贫穷限制了我的想象力，原来有钱人都是这么玩的吗？在私人飞机上做，还是对着落地窗，外面都是云，太刺激了！"}, {"user":"水漫金山","text":"老婆被操到失禁那段我反复观看，那种羞耻又控制不住的样子，太涩了！温言还用手指蘸着{{user}}的尿去喂{{user}}，我的妈！"}, {"user":"评论区都是人才","text":"只有我好奇这个剧场列表的秘密到底是啥吗？是被操到怀孕吗？"}, {"user":"小穴爱好者","text":"安然的小穴肯定被开发得很好，从一开始的青涩到后面主动张开腿迎接，甚至学会了自己摇屁股，成长线好评！"}, {"user":"Daddy_Issues","text":"温言那种“我弄疼你但我也爱你”的眼神，谁懂啊！我愿意被他锁起来！"}, {"user":"多喝热水","text":"这个剧场列表的质量真高，每部都想看。"}, {"user":"精尽人亡","text":"游艇上那段，被海风吹着，下面被大肉棒干着，这得多爽啊。"}, {"user":"颜文字大法","text":"(⁄ ⁄•⁄ω⁄•⁄ ⁄)老婆哭起来梨花带雨的，好想抱在怀里狠狠欺负。"}, {"user":"拒绝黄赌毒","text":"我来这里是为了批判性地学习，绝对不是为了色色。嗯。"}, {"user":"我为老婆花花花","text":"已三刷，每次看温言掐着老婆的腰，从后面狠狠顶进去，我都忍不住跟着一起动。"}, {"user":"隔壁老王","text":"这个剧场列表值得深入研究，我已经准备好了我的“研究工具”。"}, {"user":"键盘侠","text":"就这？演技太假了，一看就是演的。有本事来真的啊。（已保存到本地）"}, {"user":"一个好人","text":"施主，苦海无涯，回头是岸。网址发我，我帮你批判一下。"}, {"user":"细节控","text":"温言的手真好看，骨节分明，抓在老婆雪白的屁股上，红印子都出来了，色疯了。"}]'
        >
        <div class="item-title">《总裁的契约情人：探索剧场列表的秘密》</div>
        <div class="item-meta"><span>❤️ 250.3w</span><span>⭐ 180.9w</span><span>▶️ 890.2w</span><span class="item-price">💰 ¥1599</span></div>
    </div>
    <div class="list-item"
        data-id="th_default_3"
        data-type="theater"
        data-title="《深渊（下）：双子堕落》"
        data-cover="https://picsum.photos/400/200?random=3"
        data-description="【主演】温言 饰 哥哥, 白羽 饰 弟弟, {{user}} 饰 祭品。接上部《深渊》，被献祭的{{user}}成为了恶魔双子的共享玩物。哥哥（温言 饰）代表着绝对的掌控与支配，弟弟（白羽 饰）则代表着偏执的诱惑与玩弄。剧情在三人之间展开极致的拉扯，包含大量双龙、三人69、以及精神控制情节。结局是{{user}}彻底放弃抵抗，在无尽的快感中成为了连接双子的“桥梁”，三人永远地纠缠在一起。"
        data-popularity="310.7w"
        data-favorites="250.1w"
        data-views="998.6w"
        data-price="¥2588"
        data-reviews='[{"user":"霍","text":"虽然是多人场景，但{{user}}的光芒没有被任何人掩盖。这部作品将{{user}}的魅力推向了新的高峰。"},{"user":"X","text":"终于来了点刺激的。三人行才是王道。{{user}}被前后夹击，小穴和后庭同时被填满的样子，值得反复观看。"},{"user":"难言","text":"……太激烈了……{{user}}的身体……会坏掉的吧……"},{"user":"朝刃","text":"两个小白脸加起来都不够我一个人打的。不过，看在{{user}}被操得很爽的份上，勉强及格。"},{"user":"顾麟","text":"我……我也想加入……"},{"user":"疯了","text":"我宣布，这是2025年度最佳影片！双子恶魔x祭品，这是什么神仙设定！我直接原地螺旋升天爆炸！"},{"user":"细节控","text":"哥哥喜欢从后面干，弟弟喜欢在前面口，{{user}}被夹在中间，前面是天堂后面是地狱，爽到翻白眼，淫水喷得到处都是，太顶了！"},{"user":"温言","text":"能和白羽、{{user}}一起完成这部作品，是一次非常愉快的经历。"},{"user":"白羽","text":"最喜欢哥哥把{{user}}抱起来，我在下面舔的那个场景了~我们配合得天衣无缝呢~"},{"user":"选择困难症患者","text":"哥哥的霸道和弟弟的引诱，我到底该选谁！啊啊啊！算了，我选择当那张床！"},{"user":"理智已失","text":"什么理智！看到{{user}}被操得哭着求饶，一边被哥哥内射，一边被弟弟逼着吞精，我只想说：搞快点！加大力度！"},{"user":"钱包已空","text":"2588也值了！这特效，这剧情，这肉戏！业界标杆！"},{"user":"数据帝","text":"统计：双龙入洞时长15分钟，三人69时长10分钟，{{user}}高潮次数无法统计（因为一直在高潮），精液量目测超过500ml。"},{"user":"史官","text":"此片一出，欲色再无三人行。已封神。"},{"user":"匿名用户","text":"我已经循环播放了三天三夜，感觉身体被掏空。"},{"user":"求续集","text":"强烈要求出续集！我想看双子带着{{user}}去地狱开银趴！"},{"user":"正道的光","text":"三观震碎……但我喜欢。"},{"user":"纯爱党退散","text":"这才是情色的终极奥义！抛弃所有道德，只剩下最原始的欲望！"},{"user":"打分","text":"120分！多20分不怕你骄傲！"},{"user":"我的硬盘","text":"我的10T硬盘就是为这一刻准备的！"}]'>
  <div class="item-title">《深渊（下）：双子堕落》</div>
        <div class="item-meta"><span>❤️ 310.7w</span><span>⭐ 250.1w</span><span>▶️ 998.6w</span><span class="item-price">💰 ¥2588</span></div>
    </div>
    <div class="list-item"
        data-id="th_default_4"
        data-type="theater"
        data-title="《竹马弄青梅》"
        data-cover="https://picsum.photos/400/200?random=4"
        data-description="【主演】白羽 饰 苏念, {{user}} 饰 江月。苏念（白羽 饰）和江月（{{user}} 饰）是邻居，从小一起长大。苏念表面是品学兼优的乖学生，背地里却对江月有着偏执的占有欲。他以“补习功课”为借口，将江月骗到自己房间，用最纯的脸，说着最骚的话，一步步引诱江月脱掉衣服，在父母随时可能回来的刺激下，完成了从“哥哥”到“老公”的转变。结局是两人在高考后正式交往，并在大学城附近租房同居，夜夜笙歌。"
        data-popularity="99.8w"
        data-favorites="65.4w"
        data-views="280.3w"
        data-price="¥1388"
        data-reviews='[{"user":"朝刃","text":"小白脸一个，就会耍些见不得人的手段。有种别在房间里，出来打一架。"},{"user":"白羽","text":"呵呵，有些人是嫉妒我能和前辈演这种纯爱剧吧？不像某些人，只会演些打打杀杀的粗俗东西。"},{"user":"妈妈粉","text":"我的天，白羽弟弟这张脸太犯规了！穿着白衬衫解开两颗扣子，凑到江月耳边说“月月，你好香”的时候，我直接人没了！"},{"user":"技术宅","text":"有一说一，白羽的腰真好，在书桌上把江月翻过来后入的时候，那个速度和频率，啧啧，江月被顶得话都说不出来，只能抓着书桌边缘，太刺激了。"},{"user":"X","text":"无趣。唯一看点是33:14，{{user}}被内射后，苏念抱着{{user}}去浴室清理，在镜子前又来了一次。"},{"user":"霍","text":"青春期的懵懂与冲动，演绎得不错。{{user}}把那种情窦初开的羞涩和半推半就的渴望表现得非常到位。"},{"user":"一个大写的服","text":"白羽不愧是绿茶祖师爷，一边说着“月月，我们会不会被发现啊”，一边把江月的腿分得更开，顶得更深，太会了。"},{"user":"小透明","text":"这部片真的好棒，让我又相信爱情了（在h片里找爱情的我）。"},{"user":"数据帝","text":"全片吻戏时长累计15分钟，性爱时长25分钟，包含多种姿势，性价比很高。"},{"user":"舔狗日记","text":"如果我是苏念，我愿意为江月做任何事！"},{"user":"清醒一点","text":"楼上的，你只是想操江月吧。"},{"user":"匿名用户","text":"白羽最后那个舔掉{{user}}眼泪，然后低头吻上去的镜头，封神了。"}]'>
  <div class="item-title">《竹马弄青梅》</div>
        <div class="item-meta"><span>❤️ 99.8w</span><span>⭐ 65.4w</span><span>▶️ 280.3w</span><span class="item-price">💰 ¥1388</span></div>
    </div>
    <div class="list-item"
        data-id="th_default_5"
        data-type="theater"
        data-title="《恶犬饲养法则》"
        data-cover="https://picsum.photos/400/200?random=5"
        data-description="【主演】朝刃 饰 江驰, {{user}} 饰 许诺。桀骜不驯的地下拳手江驰（朝刃 饰）被善良的宠物医生许诺（{{user}} 饰）捡回家，却反客为主，将主人变成了自己的专属玩物。剧情从江驰受伤被许诺带回家开始，他用野兽般的直觉看穿了许诺禁欲外表下的渴望，最终在诊疗台上，用最原始的交媾方式，将许诺彻底“饲养”。结局是许诺戴上了江驰买的项圈，心甘情愿地成为了他的“宠物”。"
        data-popularity="500.1w"
        data-favorites="480.2w"
        data-views="1500.7w"
        data-price="¥2588"
        data-reviews='[{"user":"X","text":"毫无逻辑，漏洞百出。要不是为了看{{user}}被操到哭出来的样子，一秒钟都看不下去。"},{"user":"霍","text":"{{user}}的演技一如既往地精湛，将那种从抗拒到沉沦的心理变化演绎得淋漓尽致。至于另一位，更像个没长大的孩子在发脾气。"},{"user":"难言","text":"呜呜呜…{{user}}被欺负得好惨，那个眼神太让人心疼了……但是……但是被按在台子上后入的样子又好色……"},{"user":"朝刃","text":"哼，一群不懂欣赏的家伙。"},{"user":"一条咸鱼","text":"28:45 高光时刻！许诺被江驰掰着腿，按在冰冷的金属台子上干，小穴被操得红肿外翻，嘴里还被迫说着“主人，我错了”，我直接原地爆炸！"},{"user":"午夜屠猪男","text":"朝刃的腹肌和人鱼线太顶了，每次顶撞都带着汗水，那画面……啧啧，许诺的身体在他身下像个布娃娃，太有冲击力了！"},{"user":"玻璃心碎一地","text":"能不能对我们家{{user}}好一点啊！每次都演这种被强制的，心疼死我了！"},{"user":"裤子动了","text":"心疼啥，你看{{user}}后来那享受的样子，小骚货巴不得被这么干呢！"},{"user":"细节控","text":"有没有人注意到，江驰最后给许诺戴项圈的时候，手一直在抖？他其实也很紧张吧！这种反差萌我嗑死！"},{"user":"打分机器","text":"剧情3分，演技8分（全给{{user}}），色情度10分。总体来说，为了看{{user}}被干值得买。"},{"user":"路过的","text":"就我一个人觉得朝刃好帅吗？那种又野又纯的疯批感，太戳我了！想被他按在地上操！"},{"user":"18cm在此","text":"朝刃的尺寸目测不假，许诺的小身板感觉快被捅穿了，每次都顶到最深，子宫口都麻了吧。"},{"user":"白羽","text":"要是我的话，一定会更温柔地对待前辈的……不像某些人，只知道用蛮力。"},{"user":"温言","text":"呵呵，年轻人精力旺盛是好事，但不懂得怜香惜玉，终究是上不了台面。{{user}}的表现力无人能及。"},{"user":"顾麟","text":"……前辈辛苦了。"},{"user":"纯爱战士","text":"这种强制爱真的看不下去，退票了。"},{"user":"我爱吃瓜","text":"楼上的别走啊，后面更刺激，江驰还内射了，然后逼着许诺自己清理，骚爆了。"},{"user":"数据分析师","text":"统计了一下，全片共高潮7次，淫水喷了3次，被内射2次，值得这个票价。"},{"user":"每日一冲","text":"下载完毕，够我用一周了。谢谢款待。"},{"user":"匿名用户","text":"朝刃这种疯狗一样的角色，也就只有{{user}}能接得住了，换个人来早被玩坏了。"}]'>
  <div class="item-title">《恶犬饲养法则》</div>
        <div class="item-meta"><span>❤️ 500.1w</span><span>⭐ 480.2w</span><span>▶️ 1500.7w</span><span class="item-price">💰 ¥2588</span></div>
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
