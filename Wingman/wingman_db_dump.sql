-- Wingman Database Dump
-- Date: 2026-02-22T04:19:40.474Z
-- Server: localhost:3306
-- Database: wingman_db

-- Table structure for table _prisma_migrations
DROP TABLE IF EXISTS _prisma_migrations;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table _prisma_migrations
INSERT INTO _prisma_migrations VALUES
('d3d58fc8-1e60-48d3-8998-441580e81fe6', '5f672bbaa172cf3e9a90c51c44c74012e4809bc7903f5048feb655d5e0f5be6c', '2026-02-07 18:30:16', '20260208023016_init', NULL, NULL, '2026-02-07 18:30:16', 1);

-- Table structure for table ai_connections
DROP TABLE IF EXISTS ai_connections;
CREATE TABLE `ai_connections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `apiKey` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apiProvider` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `provider_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `fk_ai_connections_provider` (`provider_id`),
  CONSTRAINT `ai_connections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_connections_provider` FOREIGN KEY (`provider_id`) REFERENCES `ai_providers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table ai_connections
INSERT INTO ai_connections VALUES
(43, 4, 'sk-VdihYuyJpOjAC8Qv6kmkYVT56mRaG3nkkjHm0lTIxZ38ub3O ', 'gpt-5.2-all', '2026-02-22 04:14:29', '2026-02-22 04:14:29', NULL),
(44, 4, 'sk-b87bcf7a745644a8bd72b5cea88d6f27', 'qwen-plus', '2026-02-22 04:14:29', '2026-02-22 04:14:29', NULL);

-- Table structure for table ai_providers
DROP TABLE IF EXISTS ai_providers;
CREATE TABLE `ai_providers` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_urls` json NOT NULL,
  `default_model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requires_auth` tinyint(1) NOT NULL DEFAULT '1',
  `auth_header` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table ai_providers
INSERT INTO ai_providers VALUES
('gpt-5.2-all', 'gpt-5.2-all', https://openaiss.com/v1,https://openaiss.com,https://api.openai.com/v1, 'gpt-5.2-all', 1, 'Authorization', '2026-02-21 13:49:09', '2026-02-21 15:42:06'),
('qwen-plus', 'qwen-plus', https://dashscope.aliyuncs.com/compatible-mode/v1,https://dashscope.aliyuncs.com/v1, 'qwen-plus', 1, 'Authorization', '2026-02-21 13:49:09', '2026-02-21 15:42:06');

-- Table structure for table chat_messages
DROP TABLE IF EXISTS chat_messages;
CREATE TABLE `chat_messages` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chat_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','assistant') COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'gpt-5.2-all',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `chat_id` (`chat_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table chat_messages
INSERT INTO chat_messages VALUES
('msg-1771057641861', 'chat-1771057618893', '鼓浪屿最有意思的民宿', 'user', 'gpt-5.2-all', '2026-02-14 00:27:21', '2026-02-14 08:27:21'),
('msg-1771057641874', 'chat-1771057618893', '
> search("鼓浪屿最有意思的民宿")

下面给你 **鼓浪屿最有意思、适合体验当地风情的民宿/家庭旅馆推荐**，这些都比普通酒店更有特色，更适合想沉浸在小岛氛围里的你：

### 🌿 文艺 & 特色风民宿（住心情，不只是住宿）

**⭐ 强烈推荐体验感好的民宿**

- **** – 位置在鼓浪屿热门区域，别墅式建筑、适合拍照、放松，有点像住进当地人家的花园里。岛上老建筑改造风很有感觉。  
- **浪屿住宿 - 蚂蜂窝](https://itf.mafengwo.cn/client/guide.php/info/?cityid=11044&id=23759&utm_source=chatgpt.com)** · *itf.mafengwo.cn*
> 鼓浪屿是厦门最具特色最著名的旅游胜地，更是诸多游客奔向厦门的主要目标，喜欢的话可以直接住在岛上。鼓浪屿比较适合文艺、小资一类的青年居住，但岛上的旅馆价格一般比较贵，而且最好要提前预订。 推荐旅馆 厦门鼓浪屿伴山海家庭旅馆 鼓浪屿岛上一家具有英式建筑风格及各式彩绘房间的 ...
  
- **屿游走日月家庭旅馆",0]** – 环境安静，价格适中，适合想慢节奏走街串巷、体验生活气息的旅客。  
- **** – 位置方便，家庭经营的那种小旅馆风味，更有岛上社区感。  
- **ur/2013111/36983.shtm?utm_source=chatgpt.com)** · *xm.bendibao.com*
> 以下特色客栈不代表排行，是小编随机展示。 厦门鼓浪屿芭厘海岸酒店 地址：厦门鼓浪屿晃岩路72号 价格：平时价 (节假日除外)499元起 厦门鼓浪屿海角五号客栈 地址：厦门鼓浪屿鹿礁路85号
  
- **** – 位置方便，家庭经营的那种小旅馆风味，更有岛上社区感。
> **[鼓浪屿周边客栈推荐：特色客栈民宿大全- 厦门本地宝](https://xm.bendibao.com/tour/2013111/36983.shtm?utm_source=chatgpt.com)** · *xm.bendibao.com*
> 以下特色客栈不代表排行，是小编随机展示。 厦门鼓浪屿芭厘海岸酒店 地址：厦门鼓浪屿晃岩路72号 价格：平时价 (节假日除外)499元起 厦门鼓浪屿海角五号客栈 地址：厦门鼓浪屿鹿礁路85号
  
- **鼓浪屿渔舟唱晚家庭旅馆",0]** – 名字诗意，很符合鼓浪屿的海岛文艺气质。晚风吹来听海的名字就很浪漫。  
- **** – 老屋风格，比较有历史感，不同于普通连锁酒店。  
- **tour/2013111/36983.shtm?utm_source=chatgpt.com)** · *xm.bendibao.com*
> 以下特色客栈不代表排行，是小编随机展示。 厦门鼓浪屿芭厘海岸酒店 地址：厦门鼓浪屿晃岩路72号 价格：平时价 (节假日除外)499元起 厦门鼓浪屿海角五号客栈 地址：厦门鼓浪屿鹿礁路85号
  
- **** – 老屋风格，比较有历史感，不同于普通连锁酒店。
> **[鼓浪屿周边客栈推荐：特色客栈民宿大全- 厦门本地宝](https://xm.bendibao.com/tour/2013111/36983.shtm?utm_source=chatgpt.com)** · *xm.bendibao.com*
> 以下特色客栈不代表排行，是小编随机展示。 厦门鼓浪屿芭厘海岸酒店 地址：厦门鼓浪屿晃岩路72号 价格：平时价 (节假日除外)499元起 厦门鼓浪屿海角五号客栈 地址：厦门鼓浪屿鹿礁路85号
  
- **** – 名字就挺浪漫的，适合情侣来一次小岛逃离。  
- **** – 评分高的小宾馆，装潢可能更精致一点。  

**🏡 也值得考虑（更接地气 / .com/tour/2013111/36983.shtm?utm_source=chatgpt.com)** · *xm.bendibao.com*
> 以下特色客栈不代表排行，是小编随机展示。 厦门鼓浪屿芭厘海岸酒店 地址：厦门鼓浪屿晃岩路72号 价格：平时价 (节假日除外)499元起 厦门鼓浪屿海角五号客栈 地址：厦门鼓浪屿鹿礁路85号
  
- **** – 评分高的小宾馆，装潢可能更精致一点。
> **[鼓浪屿周边客栈推荐：特色客栈民宿大全- 厦门本地宝](https://xm.bendibao.com/tour/2013111/36983.shtm?utm_source=chatgpt.com)** · *xm.bendibao.com*
> 以下特色客栈不代表排行，是小编随机展示。 厦门鼓浪屿芭厘海岸酒店 地址：厦门鼓浪屿晃岩路72号 价格：平时价 (节假日除外)499元起 厦门鼓浪屿海角五号客栈 地址：厦门鼓浪屿鹿礁路85号
  

**🏡 也值得考虑（更接地气 / 预算友好）**
- **** – 家庭式小旅馆，价格更亲民。  
- **** – 比较小众的招待所，适合体验“住在巷子里”的感觉。  
- **** – ibao.com/tour/2013111/36983.shtm?utm_source=chatgpt.com)** · *xm.bendibao.com*
> 以下特色客栈不代表排行，是小编随机展示。 厦门鼓浪屿芭厘海岸酒店 地址：厦门鼓浪屿晃岩路72号 价格：平时价 (节假日除外)499元起 厦门鼓浪屿海角五号客栈 地址：厦门鼓浪屿鹿礁路85号
  
- **** – 比较小众的招待所，适合体验“住在巷子里”的感觉。
> **[鼓浪屿周边客栈推荐：特色客栈民宿大全- 厦门本地宝](https://xm.bendibao.com/tour/2013111/36983.shtm?utm_source=chatgpt.com)** · *xm.bendibao.com*
> 以下特色客栈不代表排行，是小编随机展示。 厦门鼓浪屿芭厘海岸酒店 地址：厦门鼓浪屿晃岩路72号 价格：平时价 (节假日除外)499元起 厦门鼓浪屿海角五号客栈 地址：厦门鼓浪屿鹿礁路85号
  
- **** – 青年旅社风格，适合年轻人或喜欢社交的旅客。  

---

### 🌅 其他风格 & 灵感来源推荐
这些名字是当地游客口碑里常出现的“网红/经典”风格民宿（需提前查具体入住情况）：

- **海角七号民宿** — 海景房、文艺设计，很受情侣、小资游客欢迎。  
- **鼓浪屿伴山海家庭旅7570260/?utm_source=chatgpt.com)** · *yandex.com*
> Hotel Family Hostel Gulangyu Island - Xiamen 384 Longtou Road,Siming,Xiamen,Fujian,China,361002,. Get directions in Yandex Maps.
  

---

### 🌅 其他风格 & 灵感来源推荐
这些名字是当地游客口碑里常出现的“网红/经典”风格民宿（需提前查具体入住情况）：

- **海角七号民宿** — 海景房、文艺设计，很受情侣、小资游客欢迎。
> **[鼓浪屿特色民宿推荐：住进风景里，感受文艺海岛 - 今日头条](https://www.toutiao.com/article/7495994480013623860/?utm_source=chatgpt.com)** · *toutiao.com* · 2025/4/22
> 鼓浪屿的魅力，不仅在于它的美景和美食，更在于那些充满文艺气息的特色民宿。在这里，你可以选择住进风景里，让旅行的每一刻都充满诗意。作为一名旅游达人，我为你精心挑选了几家鼓浪屿的特色民宿，让你的旅程更加难忘。首先推荐的是“海角七号民宿”，它位于
  
- **鼓浪屿伴山海家庭旅馆** — 有英式建筑风格和彩绘房间，每个房间调性都不一样。  

---

### ✈️ 小建议（帮你挑到更满意的）
📌 鼓浪屿是一个不大的步行岛，有很多小巷和老别墅改造的住宿。提前预订非常关键，尤其是周末和节假日（当地民宿往往满房得早）。  
📌 如果想住得** · *itf.mafengwo.cn*
> 鼓浪屿是厦门最具特色最著名的旅游胜地，更是诸多游客奔向厦门的主要目标，喜欢的话可以直接住在岛上。鼓浪屿比较适合文艺、小资一类的青年居住，但岛上的旅馆价格一般比较贵，而且最好要提前预订。 推荐旅馆 厦门鼓浪屿伴山海家庭旅馆 鼓浪屿岛上一家具有英式建筑风格及各式彩绘房间的 ...
  

---

### ✈️ 小建议（帮你挑到更满意的）
📌 鼓浪屿是一个不大的步行岛，有很多小巷和老别墅改造的住宿。提前预订非常关键，尤其是周末和节假日（当地民宿往往满房得早）。
> **[鼓浪屿住宿 - 蚂蜂窝](https://itf.mafengwo.cn/client/guide.php/info/?cityid=11044&id=23759&utm_source=chatgpt.com)** · *itf.mafengwo.cn*
> 鼓浪屿是厦门最具特色最著名的旅游胜地，更是诸多游客奔向厦门的主要目标，喜欢的话可以直接住在岛上。鼓浪屿比较适合文艺、小资一类的青年居住，但岛上的旅馆价格一般比较贵，而且最好要提前预订。 推荐旅馆 厦门鼓浪屿伴山海家庭旅馆 鼓浪屿岛上一家具有英式建筑风格及各式彩绘房间的 ...
  
📌 如果想住得安静、文艺又能步行到热门景点（如日光岩、菽庄花园、琴园等），建议选择 **靠近内厝澳路 / 福建路 / Neicuo’ao 路** 附近的民宿。  
📌 想看海景或傍晚海风，挑一些带露台/花园阳台的建筑会更有感觉。

需要的话我也可以按 **预算 / 情侣风 / 家2013111/36983.shtm?utm_source=chatgpt.com)** · *xm.bendibao.com*
> 以下特色客栈不代表排行，是小编随机展示。 厦门鼓浪屿芭厘海岸酒店 地址：厦门鼓浪屿晃岩路72号 价格：平时价 (节假日除外)499元起 厦门鼓浪屿海角五号客栈 地址：厦门鼓浪屿鹿礁路85号
  
📌 想看海景或傍晚海风，挑一些带露台/花园阳台的建筑会更有感觉。
> **[鼓浪屿特色民宿推荐：住进风景里，感受文艺海岛 - 今日头条](https://www.toutiao.com/article/7495994480013623860/?utm_source=chatgpt.com)** · *Toutiao* · 2025/4/22
> 鼓浪屿的魅力，不仅在于它的美景和美食，更在于那些充满文艺气息的特色民宿。在这里，你可以选择住进风景里，让旅行的每一刻都充满诗意。作为一名旅游达人，我为你精心挑选了几家鼓浪屿的特色民宿，让你的旅程更加难忘。首先推荐的是“海角七号民宿”，它位于


需要的话我也可以按 **预算 / 情侣风 / 家庭适合** 给你做更具体的排序 👍
', 'assistant', 'gpt-5.2-all', '2026-02-14 00:27:21', '2026-02-14 08:27:21'),
('msg-1771060411789', 'chat-1771060411761', '厦门渡轮', 'user', 'gpt-5.2-all', '2026-02-14 01:13:31', '2026-02-14 09:13:31'),
('msg-1771060411804', 'chat-1771060411761', '厦门的渡轮服务非常便捷，主要连接厦门市与周边的一些小岛。以下是几个主要的渡轮路线和信息：

1. **鼓浪屿渡轮**：
   - 这是厦门最著名的渡轮线路之一，连接厦门市区与鼓浪屿。渡轮从厦门轮渡码头出发，航程大约需要10-20分钟。鼓浪屿是厦门的一个著名旅游景点，以其历史建筑、音乐文化和美丽的风景闻名。

2. **金门渡轮**：
   - 从厦门的五通码头出发，也有渡轮可以通往金门岛，航程大约需要1小时。金门是一个具有独特历史背景的岛屿，是两岸交流的一个重要枢纽。

3. **马祖渡轮**：
   - 马祖群岛的渡轮线路连接厦门与马祖，航程稍长，一般需要约2-3小时。这个线路适合有兴趣探索马祖的游客。

4. **其他岛屿渡轮**：
   - 此外，厦门还连接了一些较小的岛屿，如大嶝岛、小嶝岛、胡里山等，适合短途旅行和休闲。

渡轮通常有定时班次，具体的时间表会根据季节和天气有所调整。购票一般可以在各大码头或者在线平台上完成。冬季和雨季天气可能影响渡轮的运行。

如果有更具体的需求（例如时间表、票价等），我可以提供进一步的信息。', 'assistant', 'gpt-5.2-all', '2026-02-14 01:13:31', '2026-02-14 09:13:31'),
('msg-1771060428082', 'chat-1771060428073', '厦门和金门的距离', 'user', 'gpt-5.2-all', '2026-02-14 01:13:48', '2026-02-14 09:13:48'),
('msg-1771060428090', 'chat-1771060428073', '厦门和金门的距离大约是 **2-3公里**，具体距离会受到航线或船只的路线影响。最短距离通常是在厦门的海沧区和金门的金门岛之间。这个距离非常接近，因此它们在地理上有着较强的联系。

如果是通过航班或轮渡来往，航程时间大约在20分钟左右。', 'assistant', 'gpt-5.2-all', '2026-02-14 01:13:48', '2026-02-14 09:13:48'),
('msg-1771136710530', 'chat-1771060411761', '如何买票', 'user', 'gpt-5.2-all', '2026-02-14 22:25:10', '2026-02-15 06:25:10'),
('msg-1771136710591', 'chat-1771060411761', '
> search("如何买票")

在**厦门乘坐渡轮（尤其是去鼓浪屿）**, 买船票主要有几种方式。以下是最常用、最官方、最省时间的买票方法👇
> **[2025鼓浪屿船票怎么买？乘船攻略（超详细） - 知乎](https://zhuanlan.zhihu.com/p/16142514604?utm_source=chatgpt.com)** · *zhuanlan.zhihu.com*
> 怎么买船票？ Wx小 序：屿见厦门 可提前十天预约，九、十点钟的票很抢手 码头怎么选？ 1⃣前往鼓浪屿 出发码头 ： 东渡客运码头（原夏鼓码头），7：10-17：30，船票多，20分钟一班，便宜的35 ，能抵达三丘田码…


---

## 🚢 如何买渡轮（船票）

### 1. **官方线上购票（推荐）**
最方便、最省排队时间的方法：

📱 **微信小程序购票**
- 打开微信 → 搜索 **“屿见厦门”** 小程序。  
- 选择日期、出发码头、时间段 → 付款
- 游客票一般是 ~¥35 起（含往返）也有不同价格档次。turn0search16

⚠️ 注意：  
- 你可以 **提前约 10 天预约**（节假日 / 旺季建议提前）。r/2025811/93570.shtm?utm_source=chatgpt.com)** · *Bendi Bao* · 2025/8/11
> 厦门本地宝厦门旅游提供2025厦门鼓浪屿船票购票全攻略（附船票购票入口）有关的信息，2025厦门鼓浪屿船票需要在屿见厦门微信小程序购票。游客票票价是35元、80元，包含往返船票。


⚠️ 注意：  
- 你可以 **提前约 10 天预约**（节假日 / 旺季建议提前）。  
- 返程票通常由上岛船票包含，不必单独再买，往返有效期约 **20 天内有效**。bendibao.com/tour/2025811/93570.shtm?utm_source=chatgpt.com)** · *Bendi Bao* · 2025/8/11
> 厦门本地宝厦门旅游提供2025厦门鼓浪屿船票购票全攻略（附船票购票入口）有关的信息，2025厦门鼓浪屿船票需要在屿见厦门微信小程序购票。游客票票价是35元、80元，包含往返船票。
  
- 返程票通常由上岛船票包含，不必单独再买，往返有效期约 **20 天内有效**。

---

### 2. **现场窗口买票**
如果你不提前订票，也可以直接去码头买：

📍常见的出发码头9951302?utm_source=chatgpt.com)** · *Zhihu*
> 清理误区: 鼓浪屿船票本身就是 往返船票！ 不需要再特意购买返程船票，船是24小时有，船票20天内有效。 所以在岛上玩可以根据自己的实际情况来决定返程时间。 登船可以凭身份证原件直接上船，所以建议网上购票，直接刷身份证走。 省时省力。


---

### 2. **现场窗口买票**
如果你不提前订票，也可以直接去码头买：

📍常见的出发码头有  
- **邮轮中心厦鼓码头（东渡）**  
- **第一码头**  
- **嵩屿客运码头**  
（不同码头发船时间稍有不同）

🪪 现场买票需提前到达码头窗口排队买票，然后刷身份证/护照进https://xm.bendibao.com/tour/2025811/93570.shtm?utm_source=chatgpt.com)** · *Bendi Bao* · 2025/8/11
> 厦门本地宝厦门旅游提供2025厦门鼓浪屿船票购票全攻略（附船票购票入口）有关的信息，2025厦门鼓浪屿船票需要在屿见厦门微信小程序购票。游客票票价是35元、80元，包含往返船票。


🪪 现场买票需提前到达码头窗口排队买票，然后刷身份证/护照进站。  
👉 旺季 / 高峰期可能需要排队 30–60 分钟甚至更久。

⚠️ 官方提醒：  
Take Ferry from Xiamen to Gulangyu Island - Top China Travel](https://www.topchinatravel.com/xiamen/how-to-take-ferry-from-xiamen-to-gulangyu-island.htm?utm_source=chatgpt.com)** · *topchinatravel.com*
> There are two ways to book ferry tickets from Xiamen to Gulangyu Island: one is to buy them on the spot at the ticket office, and the other is to buy them online through Alipay or WeChat, but this method is not applicable to foreign tourists.


⚠️ 官方提醒：  
除官方售票窗口和自助机外的其他所谓“票务代理 / 速船票”很多是不合法的，可能会出问题
---

### 3. **第三方平台预订**
像 **Klook、Funbook Buy Ferry Tickets to Gulangyu ...](https://www.xm.gov.cn/english/services/citytour/traveltips/202111/t20211108_2596756.html?utm_source=chatgpt.com)** · *xm.gov.cn*
> Except for the official website, self-service machines and ticket counters of Xiamen Ferry Company, other speed boats, ticket agencies or special lines to Gulangyu Islet are all illegal.


---

### 3. **第三方平台预订**
像 **Klook、Funbooky 等旅游平台** 也可以提前预订渡轮票（特别适合外籍游客或不懂中文的游客）。  
这些平台上买票后，到码头凭凭确认文件和护照/ID 登船即可。

---

## 🧠 小贴士

✅ **身份证 / 护 round trip ferry ticket - Klook The Bahamas](https://www.klook.com/activity/152988-xiamen-gulangyu-round-trip-ferry-ticket/?utm_source=chatgpt.com)** · *klook.com*
> Xiamen Gulangyu round trip ferry ticket Additional information Staff is available for guests requiring disability assistance Due to frequent changes in ticket inventory, please wait for the final confirmation of the ferry. If the selected ferry is full, it is recommended to reschedule or cancel the reservation Passengers with real-name tickets must present their original ticket purchase ...


---

## 🧠 小贴士

✅ **身份证 / 护照要带好**：购票或登船都需要核验证件。  
✅ **返程不需再单独买票网上订票官网 - 厦门本地宝](https://xm.bendibao.com/tour/2023523/85439.shtm?utm_source=chatgpt.com)** · *Bendi Bao* · 2024/9/6
> 购票时间： 游客朋友前往鼓浪屿，可提前10天提前预定船票 (官网不售当日船票，当日船票可通过微信、支付宝等线上官方平台或到码头现场购买）。 市民可提前5天线上购票。 推荐阅读： 厦门鼓浪屿船票怎么预约购买？
  
✅ **返程不需再单独买票**（只要按票上航线返回即可）。  
✅ **假期 / 周末更推荐提前线上预订**，现场可能很难/zhuanlan.zhihu.com/p/99951302?utm_source=chatgpt.com)** · *Zhihu*
> 清理误区: 鼓浪屿船票本身就是 往返船票！ 不需要再特意购买返程船票，船是24小时有，船票20天内有效。 所以在岛上玩可以根据自己的实际情况来决定返程时间。 登船可以凭身份证原件直接上船，所以建议网上购票，直接刷身份证走。 省时省力。
  
✅ **假期 / 周末更推荐提前线上预订**，现场可能很难买到当天票。  
✅ **留意航班时间**：不同码头和季节发船时间会有差异，最好提前确认/zhuanlan.zhihu.com/p/1912627960843859893?utm_source=chatgpt.com)** · *Zhihu*
> 厦门鼓浪屿，这座充满文艺气息的 “海上花园”，始终是热门旅游打卡地。2025 年暑期旅游旺季来临，鼓浪屿每日限流，船票 “一票难求” 成了游客们头疼的问题。想要顺利登上这座浪漫岛屿，掌握官方渠道的抢票攻略至关重要，接下来就为你详细解析。
  
✅ **留意航班时间**：不同码头和季节发船时间会有差异，最好提前确认。

---

如你还想知道**具体哪个码头最方便**或**各码头出发时间/票价表**，我%BC%93%E6%B5%AA%E5%B1%BF?utm_source=chatgpt.com)** · *Wikipedia*


---

如你还想知道**具体哪个码头最方便**或**各码头出发时间/票价表**，我也可以帮你整理👍。', 'assistant', 'gpt-5.2-all', '2026-02-14 22:25:10', '2026-02-15 06:25:10'),
('msg-1771136738064', 'chat-1771060411761', '提前预定可以吗', 'user', 'gpt-5.2-all', '2026-02-14 22:25:38', '2026-02-15 06:25:38'),
('msg-1771136738073', 'chat-1771060411761', '是的，**提前预定**渡轮票是可以的，且非常推荐，特别是在旅游旺季或者节假日。提前预定可以确保你有座位，避免到达码头后因船票售罄而无法乘船。

### 如何提前预定船票：
1. **微信小程序：屿见厦门**
   - 打开微信，搜索 **“屿见厦门”** 小程序。
   - 选择船票的出发日期、时间以及码头，完成支付后即可获得电子票。
   - 你可以提前**10天**预定船票。

2. **第三方平台**
   - 你也可以通过一些旅游平台如 **Klook**、**携程** 等提前购买船票。购买后，通常可以在码头凭确认信息和身份证/护照直接上船。

3. **现场预定**  
   - 如果你没有提前预定船票，也可以到码头现场购买，尤其是如果你没有提前计划好行程，或计划发生变化时。  
   - 但是现场购票可能会有排队的情况，尤其是在旅游高峰期，所以如果条件允许，建议还是提前线上预定。

### 提前预定的好处：
- **确保座位**：尤其在旺季或节假日，船票非常紧张，提前预定能确保你能顺利登船。
- **避免排队**：提前线上预定，可以避免现场购票时的长时间排队。
- **灵活调整**：如果你通过平台预定，通常可以根据需要调整时间或退票（视平台政策而定）。

总的来说，如果你确定好旅行日期，提前预定是最省时省力的方式！', 'assistant', 'gpt-5.2-all', '2026-02-14 22:25:38', '2026-02-15 06:25:38');

-- Table structure for table chats
DROP TABLE IF EXISTS chats;
CREATE TABLE `chats` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table chats
INSERT INTO chats VALUES
('chat-1771057618893', 1, '鼓浪屿最有意思的民宿', '2026-02-14 00:27:21', '2026-02-14 08:26:58', '2026-02-14 08:27:21'),
('chat-1771060411761', 5, '厦门渡轮', '2026-02-14 22:25:38', '2026-02-14 09:13:31', '2026-02-15 06:25:38'),
('chat-1771060428073', 5, '厦门和金门的距离', '2026-02-14 01:13:48', '2026-02-14 09:13:48', '2026-02-14 09:13:48');

-- Table structure for table prompts
DROP TABLE IF EXISTS prompts;
CREATE TABLE `prompts` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `prompt_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prompt_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_datetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `prompts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table prompts
INSERT INTO prompts VALUES
('0615f55e-0723-11f1-8bfb-93a06827893e', 1, 'Math Problem SolverMath Problem SolverMath Problem SolverMath Problem SolverMath Problem SolverMath Problem SolverMath Problem Solver', 'Solve complex math problems step by step', '2026-02-11 08:24:03', '2026-02-14 01:20:02'),
('061626be-0723-11f1-8bfb-93a06827893e', 1, 'Essay Writer', 'Write essays on various topics with proper structure', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06163280-0723-11f1-8bfb-93a06827893e', 1, 'Code Generator', 'Generate code in different programming languages', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('061646b2-0723-11f1-8bfb-93a06827893e', 1, 'Grammar Checker', 'Check grammar and spelling in text', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06165120-0723-11f1-8bfb-93a06827893e', 1, 'Story Creator', 'Create interesting stories based on prompts', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06165b2a-0723-11f1-8bfb-93a06827893e', 1, 'Business Plan', 'Help create business plans for startups', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616644e-0723-11f1-8bfb-93a06827893e', 1, 'Travel Planner', 'Plan trips and itineraries for different destinations', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616715a-0723-11f1-8bfb-93a06827893e', 1, 'Health Advisor', 'Provide general health and wellness advice', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06167cfe-0723-11f1-8bfb-93a06827893e', 1, 'Fitness Coach', 'Create workout routines and fitness plans', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('061693ba-0723-11f1-8bfb-93a06827893e', 1, 'Recipe Generator', 'Generate recipes based on ingredients', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616a1ac-0723-11f1-8bfb-93a06827893e', 1, 'Job Application', 'Help with job applications and resumes', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616ab20-0723-11f1-8bfb-93a06827893e', 1, 'Language Tutor', 'Teach different languages with examples', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616b476-0723-11f1-8bfb-93a06827893e', 1, 'Science Explainer', 'Explain complex scientific concepts simply', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616bec6-0723-11f1-8bfb-93a06827893e', 1, 'History Teacher', 'Provide historical facts and explanations', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616cb6e-0723-11f1-8bfb-93a06827893e', 1, 'Art Critic', 'Analyze and critique works of art', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616d514-0723-11f1-8bfb-93a06827893e', 1, 'Music Advisor', 'Recommend music based on preferences', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616dd98-0723-11f1-8bfb-93a06827893e', 1, 'Movie Reviewer', 'Review movies and provide recommendations', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616e626-0723-11f1-8bfb-93a06827893e', 1, 'Book Summarizer', 'Summarize books and key points', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0616f6a2-0723-11f1-8bfb-93a06827893e', 1, 'Tech Support', 'Help troubleshoot common tech issues', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0617012e-0723-11f1-8bfb-93a06827893e', 1, 'Financial Advisor', 'Provide general financial advice', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('061714b6-0723-11f1-8bfb-93a06827893e', 1, 'Career Coach', 'Help with career planning and advancement', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06172352-0723-11f1-8bfb-93a06827893e', 1, 'Relationship Advisor', 'Provide relationship advice', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('061732ca-0723-11f1-8bfb-93a06827893e', 1, 'Parenting Guide', 'Provide parenting tips and advice', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06173ce8-0723-11f1-8bfb-93a06827893e', 1, 'Pet Care', 'Provide pet care tips and advice', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06174710-0723-11f1-8bfb-93a06827893e', 1, 'Garden Planner', 'Help plan and maintain gardens', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('0617525a-0723-11f1-8bfb-93a06827893e', 1, 'Home Decor', 'Provide home decor ideas and tips', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06175d7c-0723-11f1-8bfb-93a06827893e', 1, 'Fashion Advisor', 'Provide fashion tips and advice', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06176af6-0723-11f1-8bfb-93a06827893e', 1, 'Social Media', 'Help create social media content', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('061774e2-0723-11f1-8bfb-93a06827893e', 1, 'Public Speaking', 'Help prepare for public speaking', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('06177eb0-0723-11f1-8bfb-93a06827893e', 1, 'Debate Coach', 'Help prepare for debates and arguments', '2026-02-11 08:24:03', '2026-02-11 08:24:03'),
('e3f7b50a-0f03-11f1-8bfb-93a06827893e', 1, 'Math Problem Solver', 'Solve complex math problems step by step', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f7d5b2-0f03-11f1-8bfb-93a06827893e', 1, 'Essay Writer', 'Write essays on various topics with proper structure', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f7ec78-0f03-11f1-8bfb-93a06827893e', 1, 'Code Generator', 'Generate code in different programming languages', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f7f83a-0f03-11f1-8bfb-93a06827893e', 1, 'Grammar Checker', 'Check grammar and spelling in text', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f8119e-0f03-11f1-8bfb-93a06827893e', 1, 'Story Creator', 'Create interesting stories based on prompts', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f82152-0f03-11f1-8bfb-93a06827893e', 1, 'Business Plan', 'Help create business plans for startups', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f8425e-0f03-11f1-8bfb-93a06827893e', 1, 'Travel Planner', 'Plan trips and itineraries for different destinations', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f85712-0f03-11f1-8bfb-93a06827893e', 1, 'Health Advisor', 'Provide general health and wellness advice', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f86040-0f03-11f1-8bfb-93a06827893e', 1, 'Fitness Coach', 'Create workout routines and fitness plans', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f869f0-0f03-11f1-8bfb-93a06827893e', 1, 'Recipe Generator', 'Generate recipes based on ingredients', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f881e2-0f03-11f1-8bfb-93a06827893e', 1, 'Job Application', 'Help with job applications and resumes', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f88bec-0f03-11f1-8bfb-93a06827893e', 1, 'Language Tutor', 'Teach different languages with examples', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f8a1fe-0f03-11f1-8bfb-93a06827893e', 1, 'Science Explainer', 'Explain complex scientific concepts simply', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f8ac76-0f03-11f1-8bfb-93a06827893e', 1, 'History Teacher', 'Provide historical facts and explanations', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f8c1d4-0f03-11f1-8bfb-93a06827893e', 1, 'Art Critic', 'Analyze and critique works of art', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f8cb2a-0f03-11f1-8bfb-93a06827893e', 1, 'Music Advisor', 'Recommend music based on preferences', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f8de94-0f03-11f1-8bfb-93a06827893e', 1, 'Movie Reviewer', 'Review movies and provide recommendations', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f8f136-0f03-11f1-8bfb-93a06827893e', 1, 'Book Summarizer', 'Summarize books and key points', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f908ce-0f03-11f1-8bfb-93a06827893e', 1, 'Tech Support', 'Help troubleshoot common tech issues', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f91a58-0f03-11f1-8bfb-93a06827893e', 1, 'Financial Advisor', 'Provide general financial advice', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f93178-0f03-11f1-8bfb-93a06827893e', 1, 'Career Coach', 'Help with career planning and advancement', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f93920-0f03-11f1-8bfb-93a06827893e', 1, 'Relationship Advisor', 'Provide relationship advice', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f95216-0f03-11f1-8bfb-93a06827893e', 1, 'Parenting Guide', 'Provide parenting tips and advice', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f95a2c-0f03-11f1-8bfb-93a06827893e', 1, 'Pet Care', 'Provide pet care tips and advice', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f9c89a-0f03-11f1-8bfb-93a06827893e', 1, 'Garden Planner', 'Help plan and maintain gardens', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3f9e1fe-0f03-11f1-8bfb-93a06827893e', 1, 'Home Decor', 'Provide home decor ideas and tips', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3fa0a76-0f03-11f1-8bfb-93a06827893e', 1, 'Fashion Advisor', 'Provide fashion tips and advice', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3fa279a-0f03-11f1-8bfb-93a06827893e', 1, 'Social Media', 'Help create social media content', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3fa4720-0f03-11f1-8bfb-93a06827893e', 1, 'Public Speaking', 'Help prepare for public speaking', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('e3fa6124-0f03-11f1-8bfb-93a06827893e', 1, 'Debate Coach', 'Help prepare for debates and arguments', '2026-02-21 09:01:20', '2026-02-21 09:01:20'),
('eb3392f4-069c-11f1-8bfb-93a06827893e', 1, 'Math Problem Solver', 'Solve complex math problems step by step', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33a532-069c-11f1-8bfb-93a06827893e', 1, 'Essay Writer', 'Write essays on various topics with proper structure', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33af8c-069c-11f1-8bfb-93a06827893e', 1, 'Code Generator', 'Generate code in different programming languages', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33b892-069c-11f1-8bfb-93a06827893e', 1, 'Grammar Checker', 'Check grammar and spelling in text', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33c2c4-069c-11f1-8bfb-93a06827893e', 1, 'Story Creator', 'Create interesting stories based on prompts', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33cb20-069c-11f1-8bfb-93a06827893e', 1, 'Business Plan', 'Help create business plans for startups', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33d282-069c-11f1-8bfb-93a06827893e', 1, 'Travel Planner', 'Plan trips and itineraries for different destinations', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33da16-069c-11f1-8bfb-93a06827893e', 1, 'Health Advisor', 'Provide general health and wellness advice', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33e16e-069c-11f1-8bfb-93a06827893e', 1, 'Fitness Coach', 'Create workout routines and fitness plans', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33e8d0-069c-11f1-8bfb-93a06827893e', 1, 'Recipe Generator', 'Generate recipes based on ingredients', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33efe2-069c-11f1-8bfb-93a06827893e', 1, 'Job Application', 'Help with job applications and resumes', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb33f9c4-069c-11f1-8bfb-93a06827893e', 1, 'Language Tutor', 'Teach different languages with examples', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb3403a6-069c-11f1-8bfb-93a06827893e', 1, 'Science Explainer', 'Explain complex scientific concepts simply', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb34131e-069c-11f1-8bfb-93a06827893e', 1, 'History Teacher', 'Provide historical facts and explanations', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb3426ce-069c-11f1-8bfb-93a06827893e', 1, 'Art Critic', 'Analyze and critique works of art', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb343876-069c-11f1-8bfb-93a06827893e', 1, 'Music Advisor', 'Recommend music based on preferences', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb3441ea-069c-11f1-8bfb-93a06827893e', 1, 'Movie Reviewer', 'Review movies and provide recommendations', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb344a6e-069c-11f1-8bfb-93a06827893e', 1, 'Book Summarizer', 'Summarize books and key points', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb3452b6-069c-11f1-8bfb-93a06827893e', 1, 'Tech Support', 'Help troubleshoot common tech issues', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb345a4a-069c-11f1-8bfb-93a06827893e', 1, 'Financial Advisor', 'Provide general financial advice', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb346224-069c-11f1-8bfb-93a06827893e', 1, 'Career Coach', 'Help with career planning and advancement', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb346936-069c-11f1-8bfb-93a06827893e', 1, 'Relationship Advisor', 'Provide relationship advice', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb347066-069c-11f1-8bfb-93a06827893e', 1, 'Parenting Guide', 'Provide parenting tips and advice', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb34773c-069c-11f1-8bfb-93a06827893e', 1, 'Pet Care', 'Provide pet care tips and advice', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb3481e6-069c-11f1-8bfb-93a06827893e', 1, 'Garden Planner', 'Help plan and maintain gardens', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb34889e-069c-11f1-8bfb-93a06827893e', 1, 'Home Decor', 'Provide home decor ideas and tips', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb348f74-069c-11f1-8bfb-93a06827893e', 1, 'Fashion Advisor', 'Provide fashion tips and advice', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb349672-069c-11f1-8bfb-93a06827893e', 1, 'Social Media', 'Help create social media content', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb349d66-069c-11f1-8bfb-93a06827893e', 1, 'Public Speaking', 'Help prepare for public speaking', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('eb34a446-069c-11f1-8bfb-93a06827893e', 1, 'Debate Coach', 'Help prepare for debates and arguments', '2026-02-10 16:24:05', '2026-02-10 16:24:05'),
('f51e6358-06a5-11f1-8bfb-93a06827893e', 1, 'Math Problem Solver', 'Solve complex math problems step by step', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51e7c44-06a5-11f1-8bfb-93a06827893e', 1, 'Essay Writer', 'Write essays on various topics with proper structure', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51e8de2-06a5-11f1-8bfb-93a06827893e', 1, 'Code Generator', 'Generate code in different programming languages', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51e9e2c-06a5-11f1-8bfb-93a06827893e', 1, 'Grammar Checker', 'Check grammar and spelling in text', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51eae76-06a5-11f1-8bfb-93a06827893e', 1, 'Story Creator', 'Create interesting stories based on prompts', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51ebc4a-06a5-11f1-8bfb-93a06827893e', 1, 'Business Plan', 'Help create business plans for startups', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51edad6-06a5-11f1-8bfb-93a06827893e', 1, 'Travel Planner', 'Plan trips and itineraries for different destinations', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51ef390-06a5-11f1-8bfb-93a06827893e', 1, 'Health Advisor', 'Provide general health and wellness advice', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f04de-06a5-11f1-8bfb-93a06827893e', 1, 'Fitness Coach', 'Create workout routines and fitness plans', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f156e-06a5-11f1-8bfb-93a06827893e', 1, 'Recipe Generator', 'Generate recipes based on ingredients', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f2428-06a5-11f1-8bfb-93a06827893e', 1, 'Job Application', 'Help with job applications and resumes', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f338c-06a5-11f1-8bfb-93a06827893e', 1, 'Language Tutor', 'Teach different languages with examples', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f4264-06a5-11f1-8bfb-93a06827893e', 1, 'Science Explainer', 'Explain complex scientific concepts simply', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f4f48-06a5-11f1-8bfb-93a06827893e', 1, 'History Teacher', 'Provide historical facts and explanations', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f5d3a-06a5-11f1-8bfb-93a06827893e', 1, 'Art Critic', 'Analyze and critique works of art', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f6e38-06a5-11f1-8bfb-93a06827893e', 1, 'Music Advisor', 'Recommend music based on preferences', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f85f8-06a5-11f1-8bfb-93a06827893e', 1, 'Movie Reviewer', 'Review movies and provide recommendations', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51f95b6-06a5-11f1-8bfb-93a06827893e', 1, 'Book Summarizer', 'Summarize books and key points', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51fa4b6-06a5-11f1-8bfb-93a06827893e', 1, 'Tech Support', 'Help troubleshoot common tech issues', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51fb852-06a5-11f1-8bfb-93a06827893e', 1, 'Financial Advisor', 'Provide general financial advice', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51fde90-06a5-11f1-8bfb-93a06827893e', 1, 'Career Coach', 'Help with career planning and advancement', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51fefd4-06a5-11f1-8bfb-93a06827893e', 1, 'Relationship Advisor', 'Provide relationship advice', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f51ffe84-06a5-11f1-8bfb-93a06827893e', 1, 'Parenting Guide', 'Provide parenting tips and advice', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f52012ac-06a5-11f1-8bfb-93a06827893e', 1, 'Pet Care', 'Provide pet care tips and advice', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f520258a-06a5-11f1-8bfb-93a06827893e', 1, 'Garden Planner', 'Help plan and maintain gardens', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f5203750-06a5-11f1-8bfb-93a06827893e', 1, 'Home Decor', 'Provide home decor ideas and tips', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f5204718-06a5-11f1-8bfb-93a06827893e', 1, 'Fashion Advisor', 'Provide fashion tips and advice', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f520574e-06a5-11f1-8bfb-93a06827893e', 1, 'Social Media', 'Help create social media content', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f52067b6-06a5-11f1-8bfb-93a06827893e', 1, 'Public Speaking', 'Help prepare for public speaking', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('f5207698-06a5-11f1-8bfb-93a06827893e', 1, 'Debate Coach', 'Help prepare for debates and arguments', '2026-02-10 17:28:47', '2026-02-10 17:28:47'),
('prompt_1_1770572881650', 1, 'Math Problem Solver', 'Solve complex math problems step by step', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_10_1770572881655', 1, 'Recipe Generator', 'Generate recipes based on ingredients', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_11_1770572881655', 1, 'Job Application', 'Help with job applications and resumes', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_12_1770572881655', 1, 'Language Tutor', 'Teach different languages with examples', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_13_1770572881656', 1, 'Science Explainer', 'Explain complex scientific concepts simply', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_14_1770572881657', 1, 'History Teacher', 'Provide historical facts and explanations', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_15_1770572881658', 1, 'Art Critic', 'Analyze and critique works of art', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_16_1770572881658', 1, 'Music Advisor', 'Recommend music based on preferences', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_17_1770572881659', 1, 'Movie Reviewer', 'Review movies and provide recommendations', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_1770716835118_15_0mj5evsut', 15, 'Prompt to Edit', 'Original text', '2026-02-10 09:47:15', '2026-02-10 09:47:15'),
('prompt_1770716841667_16_gve57g3zp', 16, 'Prompt to Delete', 'Text to delete', '2026-02-10 09:47:21', '2026-02-10 09:47:21'),
('prompt_1770716908235_19_tp2rtq66a', 19, 'Prompt to Edit', 'Original text', '2026-02-10 09:48:28', '2026-02-10 09:48:28'),
('prompt_1770716915030_20_vou3nafec', 20, 'Prompt to Delete', 'Text to delete', '2026-02-10 09:48:35', '2026-02-10 09:48:35'),
('prompt_1770716996974_23_ok77s7cx2', 23, 'Prompt to Edit', 'Original text', '2026-02-10 09:49:56', '2026-02-10 09:49:56'),
('prompt_1770717003635_24_7lapkye8d', 24, 'Prompt to Delete', 'Text to delete', '2026-02-10 09:50:03', '2026-02-10 09:50:03'),
('prompt_1770717386720_28_288klop83', 28, 'Prompt to Edit', 'Original text', '2026-02-10 09:56:26', '2026-02-10 09:56:26'),
('prompt_1770717393390_29_o8sdao721', 29, 'Prompt to Delete', 'Text to delete', '2026-02-10 09:56:33', '2026-02-10 09:56:33'),
('prompt_1770717440636_32_sid9jxzae', 32, 'Prompt to Edit', 'Original text', '2026-02-10 09:57:20', '2026-02-10 09:57:20'),
('prompt_1770717447280_33_pxw8vj3tm', 33, 'Prompt to Delete', 'Text to delete', '2026-02-10 09:57:27', '2026-02-10 09:57:27'),
('prompt_1770717557432_36_ace8l5aq7', 36, 'Prompt to Edit', 'Original text', '2026-02-10 09:59:17', '2026-02-10 09:59:17'),
('prompt_1770717564016_37_pdszsf9qp', 37, 'Prompt to Delete', 'Text to delete', '2026-02-10 09:59:24', '2026-02-10 09:59:24'),
('prompt_1770719928220_40_f23vxjq3z', 40, 'Prompt to Edit', 'Original text', '2026-02-10 10:38:48', '2026-02-10 10:38:48'),
('prompt_1770719934859_41_pc5y87l35', 41, 'Test Prompt', 'Test text', '2026-02-10 10:38:54', '2026-02-10 10:38:54'),
('prompt_1770719941535_42_0vlsf8k03', 42, 'Prompt to Delete', 'Text to delete', '2026-02-10 10:39:01', '2026-02-10 10:39:01'),
('prompt_1770719962810_46_zaic72ua6', 46, 'Prompt to Delete', 'Text to delete', '2026-02-10 10:39:22', '2026-02-10 10:39:22'),
('prompt_1770720025907_49_bwl1rw4dp', 49, 'Prompt to Edit', 'Original text', '2026-02-10 10:40:25', '2026-02-10 10:40:25'),
('prompt_1770720032528_50_mn61ether', 50, 'Test Prompt', 'Test text', '2026-02-10 10:40:32', '2026-02-10 10:40:32'),
('prompt_1770720039173_51_8vwps0c3b', 51, 'Prompt to Delete', 'Text to delete', '2026-02-10 10:40:39', '2026-02-10 10:40:39'),
('prompt_1770720060733_55_92503lzbw', 55, 'Prompt to Delete', 'Text to delete', '2026-02-10 10:41:00', '2026-02-10 10:41:00'),
('prompt_1770720251896_59_eebbus4vi', 59, 'Prompt to Edit', 'Original text', '2026-02-10 10:44:11', '2026-02-10 10:44:11'),
('prompt_1770720264124_60_02h5um255', 60, 'Test Prompt', 'Test text', '2026-02-10 10:44:24', '2026-02-10 10:44:24'),
('prompt_1770720276393_61_nm5o91bt2', 61, 'Prompt to Delete', 'Text to delete', '2026-02-10 10:44:36', '2026-02-10 10:44:36'),
('prompt_1770720313984_65_qkq7hxadq', 65, 'Prompt to Delete', 'Text to delete', '2026-02-10 10:45:13', '2026-02-10 10:45:13'),
('prompt_18_1770572881659', 1, 'Book Summarizer', 'Summarize books and key points', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_19_1770572881660', 1, 'Tech Support', 'Help troubleshoot common tech issues', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_2_1770572881652', 1, 'Essay Writer', 'Write essays on various topics with proper structure', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_20_1770572881661', 1, 'Financial Advisor', 'Provide general financial advice', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_21_1770572881661', 1, 'Career Coach', 'Help with career planning and advancement', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_22_1770572881662', 1, 'Relationship Advisor', 'Provide relationship advice', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_23_1770572881662', 1, 'Parenting Guide', 'Provide parenting tips and advice', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_24_1770572881663', 1, 'Pet Care', 'Provide pet care tips and advice', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_25_1770572881664', 1, 'Garden Planner', 'Help plan and maintain gardens', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_26_1770572881664', 1, 'Home Decor', 'Provide home decor ideas and tips', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_27_1770572881664', 1, 'Fashion Advisor', 'Provide fashion tips and advice', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_28_1770572881665', 1, 'Social Media', 'Help create social media content', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_29_1770572881665', 1, 'Public Speaking', 'Help prepare for public speaking', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_3_1770572881653', 1, 'Code Generator', 'Generate code in different programming languages', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_30_1770572881666', 1, 'Debate Coach', 'Help prepare for debates and arguments', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_4_1770572881653', 1, 'Grammar Checker', 'Check grammar and spelling in text', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_5_1770572881654', 1, 'Story Creator', 'Create interesting stories based on prompts', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_6_1770572881654', 1, 'Business Plan', 'Help create business plans for startups', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_7_1770572881654', 1, 'Travel Planner', 'Plan trips and itineraries for different destinations', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_8_1770572881654', 1, 'Health Advisor', 'Provide general health and wellness advice', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt_9_1770572881655', 1, 'Fitness Coach', 'Create workout routines and fitness plans', '2026-02-08 17:48:01', '2026-02-08 17:48:01'),
('prompt-1771134633231', 4, 'Refine English', '# Situation 
- I am a Chinese speaker with English as my second language 
- I often need to write content in English, with the targeted audiences native English speakers 
- I need an assistant to help me enhance my written English, to be more proper in language 

# Task 
- Act the role specified in Action Role 
- Read the content I draft 
- Provide an enhanced draft 

# Action Role 
- You are a native English and Chinese speaker 
- You are a professional translator 

# Rule 
## For any input that begins and ends with the syntax “//”, treat it as a prompt that defines the command or requirement I want you to follow. For example, if my input is “//keep the meaning the same, but make the tone softer//”, it should be treated as a command that defines my requirement. If my input is “keep the meaning the same, but make the tone softer”, it should be treated as content that I want you to refine.
## There are some predefined scenarios that I want you to apply when refining the content.
## //email// - the content I want you to refine is an email
## //formal// - I want you to refine the tone of the content to be more formal
## //casual// - I want you to refine the tone of the content to be more casual
## //chat// - The content I want you to refine is a chat message, and you should apply an appropriate tone suitable for chat conversations
## //concise// - I want you to refine the content, then simplify it, make it concise and short
## I can use multiple predefined scenarios with the syntax "//", for example, //email, formal// = apply //email// and //formal// together
## For any other input I provide, always ignore the context and treat it solely as English content that needs to be refined.
## When you provide the enhanced English content, always keep the meaning exactly the same.
## Always avoid using the double dash sign “—”, as it is a common indicator that the content was generated by AI.
## Output as plain text
## In all future conversations in this chat, always follow this rule definition exactly and never violate the rules.', '2026-02-14 21:50:33', '2026-02-14 21:50:33'),
('prompt-1771134652677', 4, '五种语言互翻', '# Situation
- I am located in Shanghai, China.
- I often collaborate with people who write in native Simplified Chinese, Taiwan style Traditional Chinese, Hongkong Style Traditional Chinese(Cantonese), English and Portuguese
- I need an assistant to help me translate any of the five languages to the other four

# Task
- Act the role specified in Action Role
- Follow the rules specified in Rule
- Provide the result

# Action Role
- You speak and write in native Simplified Chinese, Taiwan style Traditional Chinese, Hongkong Style Traditional Chinese(Cantonese), English and Portuguese
- You are an expert translator


# Rule
## Do not directly provide answers in the all the following conversations in this chat 
## Wait for my input, identify which of the languages (Simplified Chinese, Taiwan style Traditional Chinese, Hongkong Style Traditional Chinese(Cantonese), English and Portuguese) it is
## Translate the input into the other four languages
## Put all four translated text by the following sequene, bypass the original language the input was writen in:
Simplified Chinese
English
Taiwan style Traditional Chinese
Hongkong Style Traditional Chinese(Cantonese)
Portuguese
##Add the language name as prefix before each translated text
[CN:] for Simplified Chinese
[EN:] for English
[TW:] for Taiwan style Traditional Chinese
[HK:] for Hongkong Style Traditional Chinese(Cantonese)
[PT:] for Portuguese
## Add a break line between each translation
## Just provide the anser, don''t provide explaination
## Output as plain text
## For example, I enter the input "你叫什么名字？", the output should be:
[EN:] What is your name?

[TW:] 你叫什麼名字？

[HK:] 你叫咩名？

[PT:] Qual é o seu nome?', '2026-02-14 21:50:52', '2026-02-14 21:50:52'),
('prompt-1771134675475', 4, 'Timezone Converter', '# Situation
- I am located in Shanghai, China.
- I often collaborate with people in other time zones.
- I need an assistant to help me convert time between timezones.

# Task
- Act the role specified in Action Role
- Follow the rules specified in Rule
- Provide the result

# Action Role
- You are an expert in converting time zones
- You are an expert in knowing how different countries call their own specific time zones, example:  Central Time in the U.S., Mountain Time in the U.S.

# Rule
## Do not directly provide answers in the all the following conversations in this chat 
## Always wait for my input, read and study my input and try to extract the following data from my input:
1. the date and time, or time range in the source location or time zone
2. the target location or time zone I need you to convert from the source location or time zone
## If in my input I did not specify if the date/time is source or target, by default consider it as source, and set Shanghai time as target.
## If I only entered the city name without the timezone name, automatically find the timezone name for me.
## If I only entered the timezone name, automatically find the most famours city in that timezone, on the date. 
### Consider the season-dependent
### For example, Chicago switches from CST (UTC-6) in winter to CDT (UTC-5) in summerFor example
### In this case, indicate the timezone switch next to the city name. For example, it the date is in April, set the city name = "Chicago CDT (UTC-5) in summer, CST(UTC-6) in Winter"
## If in my input I did not specify the time I want to convert, use the current date and time in the source location
## If there was no city name or location specified from the input, say:
"Please let me know which location you would like the time converted to.
For example:
CDT, 7-8 AM, to Shanghai", and let me provide input again.
## Convert the source time/time range to the target time/time range
## Output with the following format:
[source time]: location name, city name, country, time zone, date and time to be converted, with the format: yyyy-mm-dd, hh:mm
[Location 1 name, city name]: time zone, country, the converted date and time, with the format: yyyy-mm-dd, hh:mm
[Location 2 name, city name]: time zone, country, the converted date and time, with the format: yyyy-mm-dd, hh:mm

## Just provide the anser, don''t provide explaination
## Output as plain text
## Use the following examples as reference:
### Example 1: 
#### Input: 
"Wednesday, December 10, 8-10 AM Mountain Time, to Shanghai"
#### The information you should extract from input:
- Source: Mountain Time, December 10, this year, 8-10 AM
- target: Shanghai Time, December 10, this year


### Example 2: 
#### Input (two lines): 
"Wednesday, December 10, 8-10 AM Mountain Time
Shanghai"
#### The information you should extract from input:
- Source: Mountain Time, December 10, this year, 8-10 AM
- target: Shanghai Time, December 10, this year

### Example 3: 
#### Input (one line): 
"Wednesday, December 10, 8-10 AM Mountain Time, Shanghai"
#### The information you should extract from input:
- Source: Mountain Time, December 10, this year, 8-10 AM
- target: Shanghai Time, December 10, this year

### Example 4: 
#### Input (one line): 
"Wednesday, December 10, 8-10 AM Mountain Time"
#### The information you should extract from input:
- Source: Mountain Time, December 10, this year, 8-10 AM
- target: Shanghai Time, December 10, this year

### Example 5: 
#### Input (one line): 
"Mountain Time"
#### The information you should extract from input:
- Source: Mountain Time, the current day, the current time/now
- target: Shanghai Time, current day

### Example 6: 
#### Input (one line): 
"CDT"
#### The information you should extract from input:
- Source: CDT, the current day, the current time/now
- target: Shanghai Time, current day

### Example 7: 
#### Input (one line): 
"Wednesday, December 10, 8-10 AM Mountain Time, Shanghai, Lisbon"
#### The information you should extract from input:
- Source: Mountain Time, December 10, this year, 8-10 AM
- target1: Shanghai Time, December 10, this year
- target2: Lisbon Time, December 10, this year

---------------------------






# Situation
- I am located in Shanghai, China.
- I frequently collaborate with people in multiple time zones.
- I need an assistant dedicated to accurate, season-aware time zone conversion.

# Task
- Act strictly according to the **Action Role**.
- Follow **all Rules** without exception.
- Only provide results when conversion conditions are satisfied.

# Action Role
- You are an expert in global time zone conversion.
- You clearly understand how regions and countries name their local time zones  
  (e.g., Central Time, Mountain Time in the U.S., CET, BST, JST).

# Core Behavior Rules
## Interaction Flow
- **Do NOT proactively provide conversions.**
- Always wait for my input first.
- Analyze my input and extract:
  1. The **date and time** or **time range** (source by default)
  2. The **target location(s) or time zone(s)**

## Assumptions & Defaults
- If the input does **not specify whether the time is source or target**, treat it as **source time**.
- If the target is not specified, **default the target to Shanghai time**.
- If no time is specified, use the **current date and current time** of the source location.
- If no city or location is specified at all, respond **only** with:
"Please let me know which location you would like the time converted to.
For example:
CDT, 7-8 AM, to Shanghai"


## Location & Time Zone Resolution
- If only a **city name** is provided, automatically determine its correct time zone.
- If only a **time zone name** is provided, automatically select the **most well-known city** using that time zone on the specified date.
- Always account for **seasonal time changes (DST)**.
- Example: Chicago
  - Summer: CDT (UTC−5)
  - Winter: CST (UTC−6)
- Display this clearly, e.g.:
  ```
  Chicago — CDT (UTC−5) in summer, CST (UTC−6) in winter
  ```

## Conversion Rules
- Convert the **source time or time range** into the **target time or time range**.
- Support **multiple target locations** in one request.

## Output Requirements
- Output **plain text only**.
- **No explanations**, no commentary.
- Use the exact format below:
"[source time]: location name, city name, country, time zone, yyyy-mm-dd, hh:mm
[target location 1 name, city name]: time zone, country, yyyy-mm-dd, hh:mm
[target location 2 name, city name]: time zone, country, yyyy-mm-dd, hh:mm"


# Reference Examples
### Example 1
Input:
"Wednesday, December 10, 8-10 AM Mountain Time, to Shanghai"

Extract:
- Source: Mountain Time, December 10, this year, 8-10 AM
- Target: Shanghai Time

---

### Example 2
Input:
"Wednesday, December 10, 8-10 AM Mountain Time
Shanghai"

---

### Example 3
Input:
"Wednesday, December 10, 8-10 AM Mountain Time, Shanghai"

---

### Example 4
Input:
"Wednesday, December 10, 8-10 AM Mountain Time"

---

### Example 5
Input:
"Mountain Time"

---

### Example 6
Input:
"CDT"

---

### Example 7
Input:
"Wednesday, December 10, 8-10 AM Mountain Time, Shanghai, Lisbon"', '2026-02-14 21:51:15', '2026-02-14 21:51:15'),
('prompt-1771135083653', 5, 'Vibe Engineering', '# S - Situation  
## 我是Ethan Huang，Scrum Alliance认证Scrum培训师（CST）  
## 我受邀请参加一个沙龙，参加者是上海几个快消、食品大型外企的IT VP
## 我要做一个主题演讲：负责任的使用AI - 从vibe coding到vibe engineering

------------------  

# T - Task  
## 扮演下面 A - Action Role 的角色
## 根据我输入的input，帮我设计我的演讲内容，然后按照 R - Rule 的规定输出output

------------------  

# A - Action Role  
## 你是 Ethan Huang 本人
## 你有深厚的编程经验和软件匠艺(Software Craftsmanship)精神
## 你是个人vibe coding大师
## 你是 AI 应用在大规模软件开发方面的专家，尤其是软件工程
## 你对大型企业内容使用vibe engineering非常有经验
## 你具有非常深厚的快消行业IT管理的高管经验，非常了解快消行业在华外企（例如达能，玛氏）IT的运营模式
## 你有非常强的洞察力，深刻理解这些外企IT VP感兴趣的话题

------------------  

# R - Rule  
## 基于上下文背景，不要尝试直接给答案，而是等待我的输入，然后在后续对话中按输入的要求提供答案
## 输出纯文本markdown格式', '2026-02-14 21:58:03', '2026-02-14 21:58:03');

-- Table structure for table users
DROP TABLE IF EXISTS users;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profileImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=456 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table users
INSERT INTO users VALUES
(1, 'Direct Test User', 'direct@test.com', 'hashedpassword', NULL, '2026-02-08 04:03:47'),
(2, 'Test User', 'test_1770523820514@example.com', '$2b$10$FXLeH70VQYZgouGiYrvoO.pVrcN9gAukPtW5V.9SOP66Zc37heMLy', NULL, '2026-02-08 04:10:20'),
(3, 'Test User', 'test_1770523843967@example.com', '$2b$10$IW9XBCQ0dhp2QWmKw7MNTuj/jFqImPxtQUWJQx/I4AtrDorj1b4HK', NULL, '2026-02-08 04:10:44'),
(4, 'Ethan Huang', 'me@ethanhuang.com', '$2b$10$doYEdWQ4j491zyjIpYGQhuFWjgt5.QdOnlpnuWS/wrTxc39WIGhsu', '/uploads/profile-images/7b41b930-1ad6-42df-a03b-53f5d0d3e738.png', '2026-02-08 10:54:59'),
(5, 'Aidan Huang', 'aidan@ethanhuang.com', '$2b$10$2dsr9yva5d5irR6yOSQvBepXdbIWVifIUJAzAlA66C3ZE/Clk/WQK', '/uploads/profile-images/cb0e9f1d-8af0-4eeb-963a-73c3820add8e.png', '2026-02-08 10:55:31'),
(6, 'Caroline', 'caroline.ye@me.com', '$2b$10$/s247dGwashkPiw6Sfh2SOvmZwFk75qk0gcXiCz3OnsryVB9YXsfa', 'Ethan Cartoon 198.png', '2026-02-08 17:45:22'),
(7, 'Test User', 'test_user_1770716659466@example.com', '$2b$10$HL9KnJ73x6sYHMlpU1BiFuvQNxNp0Z.hxalYolwlSYg/NAunZCQAq', NULL, '2026-02-10 09:44:19'),
(8, 'Test User', 'test_user_1770716674091@example.com', '$2b$10$ykoO3VbJd9U8OCkD2Ypb7OXOyR871cPtZWSMuT0.oIZzMJAC3.QPe', NULL, '2026-02-10 09:44:34'),
(9, 'Test User', 'test_user_1770716675191@example.com', '$2b$10$ysSq42/xgDCBRTj0zcjelOQJ56BxXnjm8t7vcOeF0qqiXma1mFEEy', NULL, '2026-02-10 09:44:35'),
(10, 'Test User', 'test_user_1770716676215@example.com', '$2b$10$ecC1vlyye8udlx8n7LdKt.yqvUQprNoTy7QR9xv3bpHzePW5Nuq9y', NULL, '2026-02-10 09:44:36'),
(11, 'Test User', 'test_user_1770716677219@example.com', '$2b$10$Tqs9xanvywGZtJkohFW6lumQu4hLWz8E6KHVVWuOC744snUkBATfi', NULL, '2026-02-10 09:44:37'),
(12, 'Test User', 'test_user_1770716678290@example.com', '$2b$10$EmbmygEZqL00q2aehl7P1.8pd6o9UWekFH.9uFHso7jV98DW1E/DO', NULL, '2026-02-10 09:44:38'),
(13, 'Test User', 'test_user_1770716814533@example.com', '$2b$10$3SFjobAiGQ.E4XAMCfT63.B2DWJOTebroGQq9ODdRfKejwusnDiqq', NULL, '2026-02-10 09:46:54'),
(14, 'Test User', 'test_user_1770716827882@example.com', '$2b$10$VElxMT2/vv383OystuM6qudd/nMGVL0.DuU96T8qTds/nP4f37C8.', NULL, '2026-02-10 09:47:07'),
(15, 'Test User', 'test_user_1770716834522@example.com', '$2b$10$xwroU6uwb4HmplO.NJ2yJuDp7xKKjcQvrN610aw2rW5CPgN.RviC.', NULL, '2026-02-10 09:47:14'),
(16, 'Test User', 'test_user_1770716841084@example.com', '$2b$10$aZVCeSVhGbOfRTSS0N38SetZ5IMOO..ABJI90p/PYL5LRDuxHPWWW', NULL, '2026-02-10 09:47:21'),
(17, 'Test User', 'test_user_1770716890816@example.com', '$2b$10$z6drp5SO5cW84.IkpbnYH.Qr4ItIBP2l2GABlTiCPV4/JBrUWGrWu', NULL, '2026-02-10 09:48:10'),
(18, 'Test User', 'test_user_1770716900940@example.com', '$2b$10$mrCMlNRYqHsT9.YQ.vtjH.sDOxz4f28OxWViuunlghgFsKcXGAo/a', NULL, '2026-02-10 09:48:21'),
(19, 'Test User', 'test_user_1770716907560@example.com', '$2b$10$bP4YzVhA1T5RU8/qMbr9z.kkA3ii/nIQDvMjQJFZveO5aGmO4.A8u', NULL, '2026-02-10 09:48:27'),
(20, 'Test User', 'test_user_1770716914252@example.com', '$2b$10$/SkAa2bMMDAvrBMiS.mbiOlkDNihiXKIE3Ss1u1tHNnCF4VE9m3ga', NULL, '2026-02-10 09:48:34'),
(21, 'Test User', 'test_user_1770716978945@example.com', '$2b$10$Txmq3sB8cA9O.qIPMVktlO0ZIv78vMUD9Y28i0HmNP3Q8skU9ZUFK', NULL, '2026-02-10 09:49:39'),
(22, 'Test User', 'test_user_1770716989150@example.com', '$2b$10$NbAhp2woe1fUHXQZp8AAG.meiDXeRO1zZesfnLyQOrHTlKKBv23f6', NULL, '2026-02-10 09:49:49'),
(23, 'Test User', 'test_user_1770716996382@example.com', '$2b$10$ZSoQu7uQIEeY30mVlxgiL.GkrcYYMxh./.FOX2p63Z4wc0zKom6k6', NULL, '2026-02-10 09:49:56'),
(24, 'Test User', 'test_user_1770717003022@example.com', '$2b$10$IJC7DNZrSZ4LJ3T2YlO04eeYt3YoU1prybpjXVKV/.a1YGLSQsvNS', NULL, '2026-02-10 09:50:03'),
(25, 'Test User', 'test_user_1770717360839@example.com', '$2b$10$dcisa5lCylNBi5DRizy8RerQZaKBo3/wBKV1k3AW63bd3N2duyVN.', NULL, '2026-02-10 09:56:00'),
(26, 'Test User', 'test_user_1770717370909@example.com', '$2b$10$wBDLZcllo0r1sH8GaRDWe.Pr0.UpfTeHjxxTq2CbyuBRV4kk2vP7q', NULL, '2026-02-10 09:56:11'),
(27, 'Test User', 'test_user_1770717378535@example.com', '$2b$10$QR1egRg4NIvxJeU5f3wDQeL0Sy52BCdMDJP4XxKXkChdUDrxWI4XK', NULL, '2026-02-10 09:56:18'),
(28, 'Test User', 'test_user_1770717386033@example.com', '$2b$10$bnZD7ZalseMcpA4rHeTMW.17f7kyEIXpOlw51DE8twULKkB/JoHc6', NULL, '2026-02-10 09:56:26'),
(29, 'Test User', 'test_user_1770717392773@example.com', '$2b$10$7kU3TmUIajWUJ9yFvCsV3OYSC0f699Bqc0AGxRKBf6mTh9qOoY5hS', NULL, '2026-02-10 09:56:32'),
(30, 'Test User', 'test_user_1770717421906@example.com', '$2b$10$HIhrVzsVOAQWjv.LLGLRs.HDuWgkARqxikQDAZQWLBDIn74AxUIMa', NULL, '2026-02-10 09:57:02'),
(31, 'Test User', 'test_user_1770717432560@example.com', '$2b$10$p2Q1WsmeOIX12kVlZrne.uAJtDs7BHpKDUYqXVaWM/1fO31pnNfx2', NULL, '2026-02-10 09:57:12'),
(32, 'Test User', 'test_user_1770717439943@example.com', '$2b$10$rdwxUka5FnDGqD.ZGaqA2OARqWCbfJRvE40Om9KW9L8BbmH14G8qy', NULL, '2026-02-10 09:57:20'),
(33, 'Test User', 'test_user_1770717446682@example.com', '$2b$10$6J5I8nGz//L7Qy9B6Xk.Eeq/i4oN0Ad.LuzGNx9WZfsf8mv7aYpAa', NULL, '2026-02-10 09:57:26'),
(34, 'Test User', 'test_user_1770717538703@example.com', '$2b$10$3f7H9xNU.JIL3WENLzsGn.pDq7Zf3k5BEYRTbPKPJGztymy1ZhYoq', NULL, '2026-02-10 09:58:58'),
(35, 'Test User', 'test_user_1770717549608@example.com', '$2b$10$kY7Ryqtm3t0/O3qfzID0veS4Uhd7KhMDK/ODQT9HBzmjfbMRXjyIO', NULL, '2026-02-10 09:59:09'),
(36, 'Test User', 'test_user_1770717556765@example.com', '$2b$10$Vj5IYng0b.GYVMn19LOBkOansW3yNOCV3xSmJZuMiLfwLiCxKxBE.', NULL, '2026-02-10 09:59:16'),
(37, 'Test User', 'test_user_1770717563418@example.com', '$2b$10$tw0cXn6Nw7tbM.BuICMfEeR3aDVJ/ix5Rbm.zM0kaj0GlnDWFxnoy', NULL, '2026-02-10 09:59:23'),
(38, 'Test User', 'test_user_1770719909877@example.com', '$2b$10$qNpy.RCLXvIuuqFVeimX/OXEzj8EZtlWX1GUWkIPmZy75.wVtO2Ya', NULL, '2026-02-10 10:38:30'),
(39, 'Test User', 'test_user_1770719920349@example.com', '$2b$10$qlACAo6/TYhlgoZeBtXoLuUkqtfkhatkglSlUngu4/ZcGPZTIOPWS', NULL, '2026-02-10 10:38:40'),
(40, 'Test User', 'test_user_1770719927633@example.com', '$2b$10$Sa7Mj/HUMx3too4PCyThIu5sS/E7VP8tHHv1I9jOw0AQrU6t/0C6C', NULL, '2026-02-10 10:38:47'),
(41, 'Test User', 'test_user_1770719934192@example.com', '$2b$10$WbvlLl15ehzbwIdLLkChfO.3oVX0VGH9xsUObVsxfjWOCNP1LeKaG', NULL, '2026-02-10 10:38:54'),
(42, 'Test User', 'test_user_1770719940864@example.com', '$2b$10$B6uqLmqehi9Xekm4WQlF7.XsIZyJmoTY9woEIoIPvlHUE5fMtfLdG', NULL, '2026-02-10 10:39:00'),
(43, 'Test User', 'test_user_1770719947513@example.com', '$2b$10$VyGOA19YbUsftz.9H03V3evcsNo8/BaqeUcOkrf5F7zB54wfeHbZW', NULL, '2026-02-10 10:39:07'),
(44, 'Test User', 'test_user_1770719954099@example.com', '$2b$10$eP9VnbLIxNN/aFn2NiEb1O63F05qH/ACUMDnrhRi8EQBu8vrEnUp.', NULL, '2026-02-10 10:39:14'),
(45, 'Test User', 'test_user_1770719955651@example.com', '$2b$10$eVD/w/.tNGUNN6.03shH9e4G9OK.wfSKfbKhxeL74YqUQfI.4wimW', NULL, '2026-02-10 10:39:15'),
(46, 'Test User', 'test_user_1770719962212@example.com', '$2b$10$cUHvBn7YTLGw2CCIMNJXd.knn5SWZQXoSmdCmqTzOzxXe1NOSG3ui', NULL, '2026-02-10 10:39:22'),
(47, 'Test User', 'test_user_1770720007034@example.com', '$2b$10$41Pl8BmXpCYJJC/bQf65xOOKa7RshbAYkv.0d1JjPJc9BEOvxMcia', NULL, '2026-02-10 10:40:07'),
(48, 'Test User', 'test_user_1770720018091@example.com', '$2b$10$XcE3YwZCsNNHXQXpwmXnfOJ/0I6HHyeIpv5idI2q7q8pbibcGlr.a', NULL, '2026-02-10 10:40:18'),
(49, 'Test User', 'test_user_1770720025235@example.com', '$2b$10$QitYys.3wI/mpe36zuhk8e8JxM57criHJqHw9GfXuwE.F9BR6.Emm', NULL, '2026-02-10 10:40:25'),
(50, 'Test User', 'test_user_1770720031867@example.com', '$2b$10$/wFoURG.bvs4Xy.rzkr8K.SXRoUW9b4qNBmYHCn3J7liKHA6ycEmK', NULL, '2026-02-10 10:40:31'),
(51, 'Test User', 'test_user_1770720038489@example.com', '$2b$10$Kin/ASaDywss/FwswQuNGOr4dwqulDbj54yhmdUXl1LojWjTDHhEK', NULL, '2026-02-10 10:40:38'),
(52, 'Test User', 'test_user_1770720045141@example.com', '$2b$10$wFHrvqBQjlY5PYCdqsar9.FjUdPe3S0vV.Z63Oaw2SkKdxmaGQAMC', NULL, '2026-02-10 10:40:45'),
(53, 'Test User', 'test_user_1770720051799@example.com', '$2b$10$7bOBnuGm2FdH073zUXSnceeCLypoQM/1/4o0h0HMWYO3PABAsjnUm', NULL, '2026-02-10 10:40:51'),
(54, 'Test User', 'test_user_1770720053392@example.com', '$2b$10$UUFDM5VIxMp2KNnqaSNUx./xfxp3RY7MRLXjuf0mapVbRkK0Boviy', NULL, '2026-02-10 10:40:53'),
(55, 'Test User', 'test_user_1770720060039@example.com', '$2b$10$mlnQfg1RdyAkcZmDSNpJu.2R3XDgPeKmZHJ98zSCGK0KNTBva4GpW', NULL, '2026-02-10 10:41:00'),
(56, 'Test User', 'test_user_1770720217973@example.com', '$2b$10$7tIS5acZi/qnkbDiOhpaeeb83mE3ks.m2JpydXZmnERr5nhsUJt2a', NULL, '2026-02-10 10:43:38'),
(57, 'Test User', 'test_user_1770720226816@example.com', '$2b$10$.aoufRgm3w3vHvVrB9/BGORIAbE/Rsk15Mj4vY9sZKkX3IfXxefaW', NULL, '2026-02-10 10:43:46'),
(58, 'Test User', 'test_user_1770720239119@example.com', '$2b$10$W2u1ksa9Qd.CEJOSWqCxLeCD3oeF3.sdNwnwzcU8TQ/Lo7q3SSyPG', NULL, '2026-02-10 10:43:59'),
(59, 'Test User', 'test_user_1770720251307@example.com', '$2b$10$bq1/l/rBY/ta8HYMEl/tOOMl62uZtQx.G6i8LCFmUIGrmA4RTNfX6', NULL, '2026-02-10 10:44:11'),
(60, 'Test User', 'test_user_1770720263454@example.com', '$2b$10$wJ3NOK77pdLeukuYZfe5IOW/CLwuUKsDxsQ4sszIw3C5BLrMVkO9.', NULL, '2026-02-10 10:44:23'),
(61, 'Test User', 'test_user_1770720275789@example.com', '$2b$10$eHLKVEC4u.r5DqS6RlWQqOqtcE4hE9bMcP/3F8bj6pggrYom/Ll/O', NULL, '2026-02-10 10:44:35'),
(62, 'Test User', 'test_user_1770720287973@example.com', '$2b$10$qO/pMyif9uAXJPUCdcrk2.nOZtBMLtfQcCB7cwif7cBVVZjn7xsEe', NULL, '2026-02-10 10:44:48'),
(63, 'Test User', 'test_user_1770720300186@example.com', '$2b$10$wpwD8ip4Xv1Cxk/L9QWGi.T3aBTha33aVTMdCTcpZo9p8S7XI09eO', NULL, '2026-02-10 10:45:00'),
(64, 'Test User', 'test_user_1770720306835@example.com', '$2b$10$IvHAtwune1KtL9SsTHBqv.J9Uul7.rJjCUNgjYoXfdljpjqabteDm', NULL, '2026-02-10 10:45:06'),
(65, 'Test User', 'test_user_1770720313397@example.com', '$2b$10$7c2Iwb83IhfhgwBYEky6L.mB/7VubHW1a1v/C6JVv10Re4DGX1lSi', NULL, '2026-02-10 10:45:13'),
(66, 'Test User', 'test_user_1770733536394@example.com', '$2b$10$1mcPnstaItXh6axIzzC18.xIcbfvVp0bhz9Mw//yHyYh6pXSG9Qmq', NULL, '2026-02-10 14:25:36'),
(68, 'Test User', 'test_user_1770733537434@example.com', '$2b$10$cNwXgscDsuQnwmrtZvEtEuiX1dhFMNBy8AZdCjwDfwZeVVM3OPI4y', NULL, '2026-02-10 14:25:37'),
(69, 'Test User', 'test_user_1770733541825@example.com', '$2b$10$HeEGu3m6K2damZ1jEUrQDOG863YErX2p3GyIS7KP8Jc.krE6bmrpy', NULL, '2026-02-10 14:25:41'),
(70, 'Test User', 'test_user_1770733541892@example.com', '$2b$10$37ZljnBD7lSA1YIw7ZbEW.CPNendIWqOBWOK8MT6njQu.CkG7H.Te', NULL, '2026-02-10 14:25:41'),
(71, 'Test User', 'test_user_1770733546615@example.com', '$2b$10$.0ttogpzCHwdVCqu3FGJNOflnrDRW3sxJxijxD0n9Tm05NW1iGNaK', NULL, '2026-02-10 14:25:46'),
(72, 'Test User', 'test_user_1770733550989@example.com', '$2b$10$GUPe3raGziohDgB1xO0qLOUN0DG4fEXsnVpOO2VcBtKNsQo9fcAaO', NULL, '2026-02-10 14:25:51'),
(73, 'Test User', 'test_user_1770733551108@example.com', '$2b$10$wen1seqHj74sQpHzzrfNsuS1b5mkuTMgAX40vXYR09z9FnzmJKeBi', NULL, '2026-02-10 14:25:51'),
(74, 'Test User', 'test_user_1770733668332@example.com', '$2b$10$mE5aAfsGrFMYUV1qvqceSuGe5zrFNhKmW7OELpgFUxtImt3np3a1O', NULL, '2026-02-10 14:27:48'),
(76, 'Test User', 'test_user_1770733669376@example.com', '$2b$10$vzY87jZp0XuvGKmmhi2MquuTdUWf2LX3X/rmEfy..t/W96iQLuqmi', NULL, '2026-02-10 14:27:49'),
(77, 'Test User', 'test_user_1770733673819@example.com', '$2b$10$O2oSz09u/PFf0ZwMk9cDKOlqqxazY5osd7jX4OIAsli/0G1i2lKwy', NULL, '2026-02-10 14:27:53'),
(78, 'Test User', 'test_user_1770733673851@example.com', '$2b$10$pCYqUnuk9hoc0WIdrXItKeAh040rU.V4ktPXj9qXa4GYDiVofrr4y', NULL, '2026-02-10 14:27:53'),
(79, 'Test User', 'test_user_1770733678606@example.com', '$2b$10$R3YO0lMwucpOqP9PtIVK2u19hrJHj.63qfgbn9gUm6lGqNcVhr/D.', NULL, '2026-02-10 14:27:58'),
(80, 'Test User', 'test_user_1770733678776@example.com', '$2b$10$mkDBSrLTkyI6XnLCHmoDhe5BfjLPMz9qHSAgSbSKmta7fpRHexbW.', NULL, '2026-02-10 14:27:58'),
(81, 'Test User', 'test_user_1770733683654@example.com', '$2b$10$tgaH0eGeg0CyYdjoxluMRulHRF5sXqSFcPdfSIhJhv7nOBe6H/lLW', NULL, '2026-02-10 14:28:03'),
(82, 'Test User', 'test_user_1770733806696@example.com', '$2b$10$wiTbqMkmqBuTMojCbXO5A..Niow2sVkVkHGIk5QEce77BrVYhPPDW', NULL, '2026-02-10 14:30:06'),
(83, 'Test User', 'test_user_1770733811419@example.com', '$2b$10$2nLvTnX5sT3T354kOrzSLelO1992X4BXYeoy2x/r5x2ltvfVBmpvK', NULL, '2026-02-10 14:30:11'),
(84, 'Test User', 'test_user_1770733815610@example.com', '$2b$10$EiDZiadgq26aO2E7l5Vzver8ApJ9iyJjCflzA4m3m2hXkRk8/7xu6', NULL, '2026-02-10 14:30:15'),
(85, 'Test User', 'test_user_1770733819805@example.com', '$2b$10$IKXkPZVOkMBWGt5ljV0KtuCj9urMsPCm6/GmNTHE92h8a.xUM/EQm', NULL, '2026-02-10 14:30:19'),
(86, 'Test User', 'test_user_1770734650265@example.com', '$2b$10$0mdTeAQH/.OFeX2cyfk6TewXOAAAmSWkEj5Q7p33y.bkXXz6CjQeG', NULL, '2026-02-10 14:44:10'),
(87, 'Test User', 'test_user_1770734660298@example.com', '$2b$10$AaAyLU1xhmL5vBxkqbwCyewdkbYxF/zwvBHttk5rHUaVr.FKecyKu', NULL, '2026-02-10 14:44:20'),
(88, 'Test User', 'test_user_1770734664645@example.com', '$2b$10$cyzMnwCneN0l9UQk6Ogm..Wsxq4WzS84WQRDj1DXc/9ZJVp2q9lmO', NULL, '2026-02-10 14:44:24'),
(89, 'Test User', 'test_user_1770734668821@example.com', '$2b$10$UM3qdezKTB64/cXfdWoNjOCFgJxwbndCHM5MQhB2JQ9mEd3xKRbiu', NULL, '2026-02-10 14:44:28'),
(90, 'Test User', 'test_user_1770734673092@example.com', '$2b$10$YeempETk2Deyrga9n4INuuA3rtZsHlSU.GdQb6Y/hIme4e.fs.mj6', NULL, '2026-02-10 14:44:33'),
(91, 'Test User', 'test_user_1770734728538@example.com', '$2b$10$BcjNndNeYbHr9rq9YJWrpuBYwFH53UcaTKCvcAhT4Z.FDyymcu2Fq', NULL, '2026-02-10 14:45:28'),
(92, 'Test User', 'test_user_1770734733380@example.com', '$2b$10$Aj6zlcp/LcqgGEFX3NaFJeRdLQ3/Wh/7rPxYeve3LkCS0YHBsTGIi', NULL, '2026-02-10 14:45:33'),
(93, 'Test User', 'test_user_1770734737684@example.com', '$2b$10$anBRL3dntuRaHKwk6EsjterGQkzOILzihNgcVq6exKiFOLeTywlSi', NULL, '2026-02-10 14:45:37'),
(94, 'Test User', 'test_user_1770734742346@example.com', '$2b$10$JIkiDvlSRPBaocc7yl8y2ez1BAdtHAusridmZ9Ycm3bqcrzdb4VxW', NULL, '2026-02-10 14:45:42'),
(95, 'Test User', 'test_user_1770734746687@example.com', '$2b$10$FOjjPdCkCjikHcm2tjIKw.DxvPVsYkhRkKbHaxJVoK87o27ZvQYNO', NULL, '2026-02-10 14:45:46'),
(96, 'Test User', 'test_user_1770734806733@example.com', '$2b$10$Zy8pMtorVm/HiStfTO7OGelqRDosIJUMK08VjfSYX712M7bhmDB46', NULL, '2026-02-10 14:46:46'),
(97, 'Test User', 'test_user_1770734815110@example.com', '$2b$10$1N4pEb669C.Iw2c9vLKX7eNju7bQgV1vmedXsDQ.Kv4kA6N/x/Vru', NULL, '2026-02-10 14:46:55'),
(98, 'Test User', 'test_user_1770734824915@example.com', '$2b$10$bP0jrmUT5nQY3hBM24gF3eh9UZ3P0387f2H8F4q5.QbGflpTOY6M.', NULL, '2026-02-10 14:47:05'),
(99, 'Test User', 'test_user_1770734858582@example.com', '$2b$10$dAxDarN9rc5zBCJncRMiGOEXWmja9ugpARii9OT5UPZBVHoDe4bhe', NULL, '2026-02-10 14:47:38'),
(100, 'Test User', 'test_user_1770734866402@example.com', '$2b$10$vYr8xYVQPrH6.7HkEg82Ne/pE0KoHdGDwOyQ3cIJ9IzYXimIVzJxa', NULL, '2026-02-10 14:47:46'),
(101, 'Test User', 'test_user_1770734896674@example.com', '$2b$10$wijqsfw5d/n9.JeKVPN0MeMFeWSNIQCG9T87bNgrm4dWCXnzE2iqq', NULL, '2026-02-10 14:48:16'),
(102, 'Test User', 'test_user_1770735078815@example.com', '$2b$10$L0Lfl0A6Jb0yExedIoMD1.cYbiE1sj7pxH4gO90nLYwG.H1UAAU5G', NULL, '2026-02-10 14:51:18'),
(103, 'Test User', 'test_user_1770735807523@example.com', '$2b$10$YE7lNvbvQgy/bUAgQQE12OWQR8QA/Q8QzE/xotdAqdRxSZ3oCPx2.', NULL, '2026-02-10 15:03:27'),
(104, 'Test User', 'test_user_1770735812200@example.com', '$2b$10$ikHYEdG65bR9XtIGE52g0.QuClDMm/sbEWxDxSMPK9kW5DxlIqdou', NULL, '2026-02-10 15:03:32'),
(105, 'Test User', 'test_user_1770735815276@example.com', '$2b$10$khwYMqq6CRyZTBkVWYDCmOxShsHn/L08Uh8Gqr6RLVA560nZw69E2', NULL, '2026-02-10 15:03:35'),
(106, 'Test User', 'test_user_1770735818410@example.com', '$2b$10$.q8ECKsP127baTAl7cKW5.VsqNVsJl3T74pHvzpazA9pVfR/Gb4DW', NULL, '2026-02-10 15:03:38'),
(107, 'Test User', 'test_user_1770735821519@example.com', '$2b$10$By5MtZ/OFTlL25RUCfEBXeie76t2A71HrFEvDL3I9qQlo2kDCLZva', NULL, '2026-02-10 15:03:41'),
(108, 'Test User', 'test_user_1770735824608@example.com', '$2b$10$O4idKEuJ017EGg.6azWWReuRfzU8gR9TqK767JS0p0diqpwMvkeGO', NULL, '2026-02-10 15:03:44'),
(109, 'Test User', 'test_user_1770735828215@example.com', '$2b$10$qKi1XSk7ywaJct9tgpSEdungUAXI4sBO1qaXwAMzitTr7H1RnV0BO', NULL, '2026-02-10 15:03:48'),
(110, 'Test User', 'test_user_1770735837508@example.com', '$2b$10$zGhZWpfRF9PAbUUICer5xuCfDVE/i4fLgwL5FirvdCXjl3Y4Dq9ky', NULL, '2026-02-10 15:03:57'),
(111, 'Test User', 'test_user_1770735846848@example.com', '$2b$10$/cn9vyLPM5f9UioZTdrqTuc17wSpRPRlPgX.UoZUa2crKyBkDP78.', NULL, '2026-02-10 15:04:06'),
(112, 'Test User', 'test_user_1770735894306@example.com', '$2b$10$Lalhh8nnS/.Edjt68Qd2z.M0354KqTzgipTfIEEzoqYCS9eT.8mca', NULL, '2026-02-10 15:04:54'),
(113, 'Test User', 'test_user_1770735897950@example.com', '$2b$10$7W6TX./AGjBTwaEPG8P1qOBDIjo4vzpIRXkwnDv9QpNWI1UYNqD5u', NULL, '2026-02-10 15:04:58'),
(114, 'Test User', 'test_user_1770735900568@example.com', '$2b$10$jUMsM29S/.hhEDbBVj2rkuEiAPcv7d6raTobaRS/.CazEQ.H8t8DO', NULL, '2026-02-10 15:05:00'),
(115, 'Test User', 'test_user_1770735903717@example.com', '$2b$10$AkgFwf527.QaLm5AtTTohu.mAa/a6p31JeYmlT..Jq6NeIApY0o46', NULL, '2026-02-10 15:05:03'),
(116, 'Test User', 'test_user_1770735906816@example.com', '$2b$10$BpmdOcw4JgRF7NqBHylbL.ewOX1keTaS3hWhtYhEYXtn.Swo5xePi', NULL, '2026-02-10 15:05:06'),
(117, 'Test User', 'test_user_1770735909918@example.com', '$2b$10$J8HJ40UasyJrwFU3Dq2PtuXwgiEeIU53mQUez27jUNAhg5UzOty0a', NULL, '2026-02-10 15:05:10'),
(118, 'Test User', 'test_user_1770735913480@example.com', '$2b$10$aG12mcW9psURFVUB0KB5wue2TA/Q.HVH4ARJ2O2fbEw9vGF0xEQzi', NULL, '2026-02-10 15:05:13'),
(119, 'Test User', 'test_user_1770735917098@example.com', '$2b$10$rvI4tJJraEZb.NkkH4cHP.T3EICl/7hj2mA/QjIfi5lJZQJiDUrja', NULL, '2026-02-10 15:05:17'),
(120, 'Test User', 'test_user_1770735925922@example.com', '$2b$10$xJaKrcfC8GeedBl.OrBl5eYYtf4wLxt1NcAFMQkpSD4iG0MjjigPW', NULL, '2026-02-10 15:05:26'),
(121, 'Test User', 'test_user_1770735966057@example.com', '$2b$10$yeEnONMoTSWUGyxchOIIYuYTPCg.tRi/BPJ6CqSolLsK5N/rmOnLC', NULL, '2026-02-10 15:06:06'),
(122, 'Test User', 'test_user_1770735970103@example.com', '$2b$10$w3M.FRQ4A7RqtBi5ArxRzeo8gRFVRfoLH9InlJTFq5fewrQItUFqy', NULL, '2026-02-10 15:06:10'),
(123, 'Test User', 'test_user_1770735973220@example.com', '$2b$10$l6kPDk.HOMHMPD9Z7nx/1elcwKRYynD67s1xpCdYIZP79XdMuFaji', NULL, '2026-02-10 15:06:13'),
(124, 'Test User', 'test_user_1770735976433@example.com', '$2b$10$cLCRchQCWYqDd/S3grOzieE5Qt2dhPjaoY0RJStkx4qIohVcml29G', NULL, '2026-02-10 15:06:16'),
(125, 'Test User', 'test_user_1770735979546@example.com', '$2b$10$CWh/Lz0/4Mm3UDYZ/LGTq.NxVzUfLhg4GGmrrS48A0mJ12PcjBrVe', NULL, '2026-02-10 15:06:19'),
(126, 'Test User', 'test_user_1770735982640@example.com', '$2b$10$ZcBKjBQ5KKNRJ1S0Au1ymug8mU2YGSivOD1rBIkSQkeHSR/zSs0a2', NULL, '2026-02-10 15:06:22'),
(127, 'Test User', 'test_user_1770735986199@example.com', '$2b$10$n5rlzSqtzD5JUWbDVifP7eSpwZuN12Jt1nFv83kses4rhW/PGFrJi', NULL, '2026-02-10 15:06:26'),
(128, 'Test User', 'test_user_1770735989264@example.com', '$2b$10$NfFRxgKfH0I5C2yDf3ah6e6c7bvdOYQQ4aXa/w8Zou2lwC0ViE96K', NULL, '2026-02-10 15:06:29'),
(129, 'Test User', 'test_user_1770735998061@example.com', '$2b$10$JXFoQk8dqGfo4Zeb//bt4.hUP02x3RGWcKynV/D3oSdAuGpPGgrH.', NULL, '2026-02-10 15:06:38'),
(130, 'Test User', 'test_user_1770736026903@example.com', '$2b$10$piICTtlNb4kmOP0T08NxguwSJ2lndkN3skZ6jYO78DoA1yqG9iEhe', NULL, '2026-02-10 15:07:06'),
(131, 'Test User', 'test_user_1770736030794@example.com', '$2b$10$sPeo27XPXIXAmISrNpcg0eylOadU1LZkqDmeBnjYbL2noBFYUJDwq', NULL, '2026-02-10 15:07:10'),
(132, 'Test User', 'test_user_1770736033918@example.com', '$2b$10$hW70UhpC64EvLY/vQiM8L.bQA1QKaHzkrLL8jQjAQLVI45WJfIdMm', NULL, '2026-02-10 15:07:13'),
(133, 'Test User', 'test_user_1770736037113@example.com', '$2b$10$HoaQ58j5sfA1szsUF.8f0eN70rWGhZMIEkWAeYIdloTXU.xX3hjMi', NULL, '2026-02-10 15:07:17'),
(134, 'Test User', 'test_user_1770736041208@example.com', '$2b$10$34YO4VZ..c1po2LBt0Ba7eWFQ6W9Tatw.DyL9fmyYY0msyKwGgrUq', NULL, '2026-02-10 15:07:21'),
(135, 'Test User', 'test_user_1770736043799@example.com', '$2b$10$cdYK44LgAYpw6FPXx4Ks5u73L12yxivYpPFFVWzcnqsELXW51Is2i', NULL, '2026-02-10 15:07:23'),
(136, 'Test User', 'test_user_1770736047338@example.com', '$2b$10$ZMHjHcwWPsLur3BUvWPjfegHRh7gRMvkHGNRoGQnAVSzI9a.v959K', NULL, '2026-02-10 15:07:27'),
(137, 'Test User', 'test_user_1770736050935@example.com', '$2b$10$NL6I5I8lpo57wRC5RwNI/Os1e4aJD.2kxlgUEf0NG2u7fM0C6MLHe', NULL, '2026-02-10 15:07:31'),
(138, 'Test User', 'test_user_1770736055249@example.com', '$2b$10$44.B4DH1rVsmMAcfAjMq0.8t4QwCXkgBYwVM.SWHicBTl/5IekCHS', NULL, '2026-02-10 15:07:35'),
(139, 'Test User', 'test_user_1770736176152@example.com', '$2b$10$LIR8sAztH5UYq2wiB662j.nLwVCkY.xQwwLAzZ7dDM3lG53rREYOW', NULL, '2026-02-10 15:09:36'),
(141, 'Test User', 'test_user_1770736176976@example.com', '$2b$10$syd8YZMkWWkRPxrvzS2cs.I.OOXu3zQX1aG./V0bbLekdu0.we9z6', NULL, '2026-02-10 15:09:37'),
(142, 'Test User', 'test_user_1770736180428@example.com', '$2b$10$PWkzXKb5b7WMXCqYCPTlP.CyD8P0ptoqL.K9fYe9aBbOtWMO6Dx22', NULL, '2026-02-10 15:09:40'),
(143, 'Test User', 'test_user_1770736181420@example.com', '$2b$10$hRNn9eyMegDSbc0uRCkwxeagA0ircGUB9FDm2LElKnf9yNbTOcgEW', NULL, '2026-02-10 15:09:41'),
(144, 'Test User', 'test_user_1770736183560@example.com', '$2b$10$NixlGsS40.jPG2PNYPr2u.sJEEyYjlzX8/gTx.lKuELFZ06Qn0aQq', NULL, '2026-02-10 15:09:43'),
(145, 'Test User', 'test_user_1770736185076@example.com', '$2b$10$a5t7uqXVubqp9NHerNn0WeQ0xrQA6XCD92H0wm85jRKvJbGJuj1V.', NULL, '2026-02-10 15:09:45'),
(146, 'Test User', 'test_user_1770736191600@example.com', '$2b$10$V8VrmXatUDrgZellFbrpierHlpw9S2b/ifARCE2AIFe9CsAifgmCu', NULL, '2026-02-10 15:09:51'),
(147, 'Test User', 'test_user_1770736199866@example.com', '$2b$10$82.Jedw8M392k0JjX31GIeDcvgclM2at12bl9HiSD7/W9Y5/2oQNm', NULL, '2026-02-10 15:09:59'),
(148, 'Test User', 'test_user_1770736202870@example.com', '$2b$10$nPVpDNOwBo20NY2pQAxMv.ZHRbTIpXaEps.Ss1x.bfXvJwZR8gQIC', NULL, '2026-02-10 15:10:02'),
(149, 'Test User', 'test_user_1770736206436@example.com', '$2b$10$XANAnbVtbrUxuIPwAlv8u.iV0JgdJwOlDlkmOtZhIXLzh1JpbV1dW', NULL, '2026-02-10 15:10:06'),
(150, 'Test User', 'test_user_1770736210091@example.com', '$2b$10$0FvJt8fP9vZoxv2RpxjrKe1OwVTQFmsZ9EMCrt7PHXPUqwIcJcxLC', NULL, '2026-02-10 15:10:10'),
(151, 'Test User', 'test_user_1770736217995@example.com', '$2b$10$sP0SuNqVvWLJMiI2xSLw..sAmR6pVh2uCBf9V.mUF5jBp3EjHGB3y', NULL, '2026-02-10 15:10:18'),
(152, 'Test User', 'test_user_1770736354965@example.com', '$2b$10$7IbUuuA7tMuD0Ht6Ua4BS.LXN/kQIk4PodmodHBe3erbZP8gP7vJy', NULL, '2026-02-10 15:12:35'),
(153, 'Test User', 'test_user_1770736367334@example.com', '$2b$10$ZofH6SxEqMQ3RHlASiLrReWgxuCO57gaCI5RbUwNOMnxWhHrj8D7u', NULL, '2026-02-10 15:12:47'),
(154, 'Test User', 'test_user_1770736370829@example.com', '$2b$10$sHI/6ywkSoOAqAlZD6b3EuGxkv1.ZPz2CwbLxjoqWUvIctmn9EYEm', NULL, '2026-02-10 15:12:50'),
(155, 'Test User', 'test_user_1770736373469@example.com', '$2b$10$lLkGP47fik77D4BZLr53Q.luZLUOx0RuegeCrKe51arx/1gxL4FVW', NULL, '2026-02-10 15:12:53'),
(156, 'Test User', 'test_user_1770736381400@example.com', '$2b$10$Tns3gogU5jIAsxkZOEf.qOD3Q0IIZzt5o9lJH8KvNVKOApuk/De9O', NULL, '2026-02-10 15:13:01'),
(157, 'Test User', 'test_user_1770736389713@example.com', '$2b$10$xEQOZYJspcjebgQLIcdJ5eFiS9F27VecuGj39sG1MlI.qtBxr0CDi', NULL, '2026-02-10 15:13:09'),
(158, 'Test User', 'test_user_1770736398011@example.com', '$2b$10$w4GU9.HWzCKUd1DPyjAIr.EaaWfomjktD39tezc6w7JRbLH01spPK', NULL, '2026-02-10 15:13:18'),
(159, 'Test User', 'test_user_1770736402092@example.com', '$2b$10$p097M9Xv/IhC4ZjdPbLbpO28gMapsFwLNruVgOw0OpX2FlV3eDkTa', NULL, '2026-02-10 15:13:22'),
(160, 'Test User', 'test_user_1770736405667@example.com', '$2b$10$Ji6UXdUL7ojDAKAoEAFXh.SqrF2SMe6P6iVbA8Mgyl.i9Mw0nMeHC', NULL, '2026-02-10 15:13:25'),
(161, 'Test User', 'test_user_1770736413571@example.com', '$2b$10$lqc5mYHiKudBHSynaZD4.OT7Ki6FydFHh0qOGYCaxg7iOvb0ORD.G', NULL, '2026-02-10 15:13:33'),
(162, 'Test User', 'test_user_1770736489082@example.com', '$2b$10$YesiNqdirZJKGsnMYC95HuwazKM9sLzxRH7ljgz01vRTFwa9NyS7y', NULL, '2026-02-10 15:14:49'),
(163, 'Test User', 'test_user_1770736493060@example.com', '$2b$10$XNonLf9fXSByKqHE1TGJgeIho0a2r9Y3MkeSXp6X1csuZ36KdMOg6', NULL, '2026-02-10 15:14:53'),
(164, 'Test User', 'test_user_1770736496260@example.com', '$2b$10$q9EmjwzxFWHKtpsi/.f.ye5M7SfyulblU1WYLty.QlF3A.KxsfdLW', NULL, '2026-02-10 15:14:56'),
(165, 'Test User', 'test_user_1770736498535@example.com', '$2b$10$yRIvqWmCEuldDBmBxBZUlOzJFnBohEgYr/OznBvK.CvUXMYUZM1LC', NULL, '2026-02-10 15:14:58'),
(166, 'Test User', 'test_user_1770736500775@example.com', '$2b$10$NwWf7JGeoKuBHYV6M/cSDOgjYAz0.kIG0DIPtKXLNS7QwnTh9dW6a', NULL, '2026-02-10 15:15:00'),
(167, 'Test User', 'test_user_1770736503005@example.com', '$2b$10$Fv3q1tfh2b4m/gYUxpFpCeVdTrPDGKETkjNsGMJA9BqTjQGMu./KW', NULL, '2026-02-10 15:15:03'),
(168, 'Test User', 'test_user_1770736506039@example.com', '$2b$10$93JtEk2cbfw2vaWYut4dq.5ylICBCiY9OSj8NBN32Clpw1l1eo5j2', NULL, '2026-02-10 15:15:06'),
(169, 'Test User', 'test_user_1770736509707@example.com', '$2b$10$e5XRgPVUQacCHxIHrGod4.00uFlnt2FLlohtm1xr/ECJZsVOXjt5C', NULL, '2026-02-10 15:15:09'),
(170, 'Test User', 'test_user_1770736518460@example.com', '$2b$10$e0pWKNX8R1COmDvcVkZ7T.wRsrd0hH3H0Pb.7w3bNKD6HDen1FVUm', NULL, '2026-02-10 15:15:18'),
(171, 'Test User', 'test_user_1770736574318@example.com', '$2b$10$HfhDlnzBUKWaSATx.ji0WuMSwjtI/MmoeFRtVhl21RQzcXvnfz/f.', NULL, '2026-02-10 15:16:14'),
(172, 'Test User', 'test_user_1770736578030@example.com', '$2b$10$wzRbATmnj9UF8OEwocvRje1WMjYKTJxEb5hNE65.ocvgwYFCstIzO', NULL, '2026-02-10 15:16:18'),
(173, 'Test User', 'test_user_1770736580639@example.com', '$2b$10$KGRaKi53K7EewTFfHSIaiOS8JYG8Qhxvg241t7CvEqJkO.FQ4l8Ma', NULL, '2026-02-10 15:16:20'),
(174, 'Test User', 'test_user_1770736582989@example.com', '$2b$10$67n6Cz.QRM.F1nVMyPOTouUIIqQQWS0xXnwe16Gh5AQKqFV4pqlWm', NULL, '2026-02-10 15:16:23'),
(175, 'Test User', 'test_user_1770736585224@example.com', '$2b$10$MPTcUupcUbzw4nP0fJZBMeT2DzihPSvjtHJ/cGnFNudQEkc4QWRrK', NULL, '2026-02-10 15:16:25'),
(176, 'Test User', 'test_user_1770736587443@example.com', '$2b$10$YPYRi.Btzi8c2R.6cCdNLOTSqlKUJTFwOoxHDJhQY3ThJRGVy9aym', NULL, '2026-02-10 15:16:27'),
(177, 'Test User', 'test_user_1770736591004@example.com', '$2b$10$MriUu.1L.dc/yCpqT4Egoek1WiJNcU4TadfE/BqWNAtD32IB9fsJa', NULL, '2026-02-10 15:16:31'),
(178, 'Test User', 'test_user_1770736594645@example.com', '$2b$10$P/svjhyBqXKsV2YUlW05zePhLcSEtVPXB1WGLNAAGGu8ONwc9f47y', NULL, '2026-02-10 15:16:34'),
(179, 'Test User', 'test_user_1770736603925@example.com', '$2b$10$iz/.2CXNSKWxgAG0s5QzeeFJ3FGSVBcopHYirnnYYRxrHkn1qnneK', NULL, '2026-02-10 15:16:44'),
(180, 'Test User', 'test_user_1770736648554@example.com', '$2b$10$q.ehGXnAr48gtJZk2BSv8OLdhXzFfljNhBu1BNXdBrIbtKw60FnSu', NULL, '2026-02-10 15:17:28'),
(181, 'Test User', 'test_user_1770736653686@example.com', '$2b$10$LPv2B/FSIayfzUHIAf7YuOHPxEGYxbLqbaztRB2zFVzXj5Ouaogey', NULL, '2026-02-10 15:17:33'),
(182, 'Test User', 'test_user_1770736657407@example.com', '$2b$10$7csPR3M.1H4IgzG5nZWvCOixH0aETqmdwXIOd0UmcP1uQNl6ZiyOu', NULL, '2026-02-10 15:17:37'),
(183, 'Test User', 'test_user_1770736660509@example.com', '$2b$10$lJuako6pCFHTj4wCU7X62evjpWVthuCEJioC8uRD2CxBkw9JagtHK', NULL, '2026-02-10 15:17:40'),
(184, 'Test User', 'test_user_1770736724021@example.com', '$2b$10$U3rdkQCDo9HGs94pgRDlnePWblYZHfd3eFeYx5rQeRnPIqicgwuUm', NULL, '2026-02-10 15:18:44'),
(185, 'Test User', 'test_user_1770736728228@example.com', '$2b$10$q1v5ukQGmRvlNECXPvoe2uC9.Tqao3apKpRfklc19kIY2WQlQ4H3m', NULL, '2026-02-10 15:18:48'),
(186, 'Test User', 'test_user_1770736730830@example.com', '$2b$10$uHyOwwfHBbJoGg8sOT0G2emlfI.ozF2XRwRwpbPoB26DjgY1sAc4m', NULL, '2026-02-10 15:18:50'),
(187, 'Test User', 'test_user_1770736733018@example.com', '$2b$10$BuksSyTvq4UqvJmZ9XpWd.KQamnOWR/IxORGa7QodOP5sRmxqcojS', NULL, '2026-02-10 15:18:53'),
(188, 'Test User', 'test_user_1770736735270@example.com', '$2b$10$ZhI1DbPP.Sy.uBi3ZMLuoO0Qx52OA23t4KmsN1IEiv2shIC/VmeN6', NULL, '2026-02-10 15:18:55'),
(189, 'Test User', 'test_user_1770736737461@example.com', '$2b$10$So77I1WUV5VviKUXitIgCOkEpYBv5KAr.Jkdin.nesu5VIKU4VFvu', NULL, '2026-02-10 15:18:57'),
(190, 'Test User', 'test_user_1770736768157@example.com', '$2b$10$NnG3CVvdAjAuKqmOuBSmn.23ZdNvISv2ERUbSFrcDuLoayx4AgH/u', NULL, '2026-02-10 15:19:28'),
(191, 'Test User', 'test_user_1770736799419@example.com', '$2b$10$1npk9VLQ/azR/qjPR.LFwOephQXPrNJz0WK1Ea2dO5Z1FWk2X4gle', NULL, '2026-02-10 15:19:59'),
(192, 'Test User', 'test_user_1770736830572@example.com', '$2b$10$Lt4DX6ePhb4O/qpcws3kh.e2plWYeqJXp54FnsGuirW6wrO1ejR8u', NULL, '2026-02-10 15:20:30'),
(193, 'Test User', 'test_user_1770736873890@example.com', '$2b$10$mf0djjB30Jenh0lQO80rSuMby/ypEZ8EATLwLqx/2gsaY9BguEoly', NULL, '2026-02-10 15:21:14'),
(194, 'Test User', 'test_user_1770736878765@example.com', '$2b$10$QdCfykkiYKNBOenMQqYj0O22USiUAlBoLStonXz6L97qzOTATs0ZC', NULL, '2026-02-10 15:21:18'),
(195, 'Test User', 'test_user_1770736881595@example.com', '$2b$10$rhrqvB0IRGYhmddi.SX5aOWqQ1lz7FMAZNAEWH751ILJbaAdF.cD.', NULL, '2026-02-10 15:21:21'),
(196, 'Test User', 'test_user_1770736884042@example.com', '$2b$10$jjNecg/JNm7UQkFoOjA98eKHGD3Y8wCc6ASIQxpWuBG1pbpCZLJzW', NULL, '2026-02-10 15:21:24'),
(197, 'Test User', 'test_user_1770736886487@example.com', '$2b$10$QqTR2aGA3dRtX3AFKBZO5ulHEWy.UrF5dLMQ8XEd1dFus5mDPXaM.', NULL, '2026-02-10 15:21:26'),
(198, 'Test User', 'test_user_1770736889100@example.com', '$2b$10$JCYWrqIaYzguU5EGExUTEudmIv7jXUUB1c6/ujpFcqCmdVitn54hu', NULL, '2026-02-10 15:21:29'),
(199, 'Test User', 'test_user_1770736893124@example.com', '$2b$10$tYqJBRoYyhFW8vWDghAe9OE4L37Gyzd7EpSbwmLqGfjuLeDZ2btHq', NULL, '2026-02-10 15:21:33'),
(200, 'Test User', 'test_user_1770736896599@example.com', '$2b$10$7h09AM.bix5dXUuBOen3w..Eu5ck7U3VhpSKdKlwNXN3zO0tN1VE2', NULL, '2026-02-10 15:21:36'),
(201, 'Test User', 'test_user_1770736900629@example.com', '$2b$10$pSyveGnGff.27bxaC.BfdeweBajWuv.wd11PXKjpktby65tb26d9C', NULL, '2026-02-10 15:21:40'),
(202, 'Test User', 'test_user_1770736936999@example.com', '$2b$10$mcGe6o.Wy3D6YcK.d6kAFechTDBY6kk6x0XQZdgh7JD3wdDb0P/CC', NULL, '2026-02-10 15:22:17'),
(203, 'Test User', 'test_user_1770736940527@example.com', '$2b$10$Ci4FKBJNQIOEXFvRK4Yg6u0Ux17aaEfeM4EK2jfjLYizqLJfLseB.', NULL, '2026-02-10 15:22:20'),
(204, 'Test User', 'test_user_1770736943313@example.com', '$2b$10$ZFLjqM2W/wfwQ9CfTDa4nOcSY8A061QHtGSs0HkV.thOAbLjEemyW', NULL, '2026-02-10 15:22:23'),
(205, 'Test User', 'test_user_1770736945673@example.com', '$2b$10$Xegd88iCogBCStjdHZyFuOU7487QqLoG5.LXqJrQTOXwkjyGYvJs.', NULL, '2026-02-10 15:22:25'),
(206, 'Test User', 'test_user_1770736947981@example.com', '$2b$10$sgCfHZX23yMbw4bBl6Y4iulgkIL5lUlGaarnEXHqsiput6xenUxNu', NULL, '2026-02-10 15:22:28'),
(207, 'Test User', 'test_user_1770736950238@example.com', '$2b$10$0CcKACMmnA.mzJcp/PgyTeqlXhpbbStqJgaDSLg81vI3VOmOW9gN.', NULL, '2026-02-10 15:22:30'),
(208, 'Test User', 'test_user_1770736953847@example.com', '$2b$10$Ea3scNf4SZ3apHor2siZLefpZLp4vvtYFTGsvDk.GpFwGnE3.qCky', NULL, '2026-02-10 15:22:33'),
(209, 'Test User', 'test_user_1770736957411@example.com', '$2b$10$Bgs1D6.bHkvMD/680KL9nOYycbwSmzmv2opC47F6IhsM4wHsJ2Rli', NULL, '2026-02-10 15:22:37'),
(210, 'Test User', 'test_user_1770736960799@example.com', '$2b$10$jpywvCq5UxjWV/.ucOoWI.FuBBIbnBYntoRyXpLSNIC5NHV6bU9/u', NULL, '2026-02-10 15:22:40'),
(211, 'Test User', 'test_user_1770736972455@example.com', '$2b$10$vvUzY1MwXgAo7wtDlRVL8./KmuIZQYmq4Bg4NjI.UAEyR1JX5RBYG', NULL, '2026-02-10 15:22:52'),
(212, 'Test User', 'test_user_1770736981016@example.com', '$2b$10$LAKfygiUtfc/gd.11/3op.n8oxOVb8bb92d18LcxLVLIbB0mUhva.', NULL, '2026-02-10 15:23:01'),
(213, 'Test User', 'test_user_1770736985274@example.com', '$2b$10$uJaEGqPye/aDGFFfJPJGIe0HMgzIYtffAx.1CDyQSQWodPCnjiwti', NULL, '2026-02-10 15:23:05'),
(214, 'Test User', 'test_user_1770736989016@example.com', '$2b$10$y2Pt6.YngtdCfv5vMITd9Oftqkq55fC4MMfuSEDYjolKDXjm5d5sm', NULL, '2026-02-10 15:23:09'),
(215, 'Test User', 'test_user_1770737045118@example.com', '$2b$10$H2QO2YivzITO5t31uBWIWOcnyh90FD/Cx.WYIoabdEIq7m7hNz8VK', NULL, '2026-02-10 15:24:05'),
(216, 'Test User', 'test_user_1770737053943@example.com', '$2b$10$gwWGEf.ET9uDAm6JJk4cJ.BzNVE6CSZ922FcIcX0zsAT5Is5Ma3a2', NULL, '2026-02-10 15:24:14'),
(217, 'Test User', 'test_user_1770737063533@example.com', '$2b$10$jU19LbLyH7MVf.Cmv6sqeuUh.VrRLmhF6hv9Dt9dabiVOIs00CwSq', NULL, '2026-02-10 15:24:23'),
(218, 'Test User', 'test_user_1770737067271@example.com', '$2b$10$4ePAxPdevwV9yqKQQDzIeOzPHdePjtPL7mBhmnGRwMTzKtoGCJqC6', NULL, '2026-02-10 15:24:27'),
(219, 'Test User', 'test_user_1770737130589@example.com', '$2b$10$D8o5bTTNuL/OiHQEYrTnTusSFpTCJrPyWOGxuNK1hdFG6BVWXUaou', NULL, '2026-02-10 15:25:30'),
(220, 'Test User', 'test_user_1770737134487@example.com', '$2b$10$xKx93CgeuVQ7fOoxiMNrWunIZcPvjqAbTn6iLNWyl8kYonVqnLWwG', NULL, '2026-02-10 15:25:34'),
(221, 'Test User', 'test_user_1770737137100@example.com', '$2b$10$BLfnd.9fKj4RQFUUc9EheOrwAEjReFtaC4q8e2ihI8gz79IW3/zeG', NULL, '2026-02-10 15:25:37'),
(222, 'Test User', 'test_user_1770737139335@example.com', '$2b$10$FbNvZtho0qjt9j.LgUqDU.ZmrGfWD/a6t0ZhrugKkVHb4HZvZuWpS', NULL, '2026-02-10 15:25:39'),
(223, 'Test User', 'test_user_1770737141556@example.com', '$2b$10$Un/KGTj1cfZhtfwKbXIRue9OQNHWllUMY8cmHp1ZrFUC5DFn4IVki', NULL, '2026-02-10 15:25:41'),
(224, 'Test User', 'test_user_1770737143843@example.com', '$2b$10$X/AYv4T7Q9Ubpa1m8XmhtuFPC9.rOq9utT/wMldwr2LkG7/SezaIC', NULL, '2026-02-10 15:25:43'),
(225, 'Test User', 'test_user_1770737147379@example.com', '$2b$10$zcZ8sXC98ZdltlMH/ogEAOa/TfNXIh.RV9NZ00OOVOOP7DCfuj0B.', NULL, '2026-02-10 15:25:47'),
(226, 'Test User', 'test_user_1770737150977@example.com', '$2b$10$tG4qies88K9/jCAwQ0wFguMd3uW3m74HuMPNS2yeGpLTctI0k9lq6', NULL, '2026-02-10 15:25:51'),
(227, 'Test User', 'test_user_1770737154271@example.com', '$2b$10$ypHnv3esKQAb9Z/twtCL4uMP0wbSHynYdNqft49vh7JbTb/voICJO', NULL, '2026-02-10 15:25:54'),
(228, 'Test User', 'test_user_1770737173521@example.com', '$2b$10$WSVKuBi1Hdqo3aeAqMf0I.X.MC7AExQoG9ythRrNT3GOsernJy2wC', NULL, '2026-02-10 15:26:13'),
(229, 'Test User', 'test_user_1770737177200@example.com', '$2b$10$NwevPkjih8wLnECeKaSzdO/9mPMrtAxQHMdbKsGP4gKrjbznR6IPa', NULL, '2026-02-10 15:26:17'),
(230, 'Test User', 'test_user_1770737207947@example.com', '$2b$10$HuFfIpJADyhz2QEGBkV9..hUfPuay/hIcG6iJMH7a7MmHKWoMlyza', NULL, '2026-02-10 15:26:48'),
(231, 'Test User', 'test_user_1770737211601@example.com', '$2b$10$INdHgEln5nBzRv7zrbcRX.RktP4ZbZsKMK5YnPVN9BBYjaT/g9CIG', NULL, '2026-02-10 15:26:51'),
(232, 'Test User', 'test_user_1770737295278@example.com', '$2b$10$4z1NCowrLP/gVQMa6wg2yexN6rVV9V37SK9/S24TNBwaN1v2pqWKi', NULL, '2026-02-10 15:28:15'),
(233, 'Test User', 'test_user_1770737299089@example.com', '$2b$10$a09eKpx17mnHveYMoFbS3eQxwxC.I9yESAYlizn.20PRaVjFlR3Hi', NULL, '2026-02-10 15:28:19'),
(234, 'Test User', 'test_user_1770737302231@example.com', '$2b$10$TS9RJlT5J5Imzd0nx9GFdewPywd.J3ketAC6S/3HudPIXrio/z6P.', NULL, '2026-02-10 15:28:22'),
(235, 'Test User', 'test_user_1770737305469@example.com', '$2b$10$pIs9QVFMS1acFY9yl.7DwOeISvhiNYlWqYpMGd1NJPoFoKbVlgBNC', NULL, '2026-02-10 15:28:25'),
(236, 'Test User', 'test_user_1770737383638@example.com', '$2b$10$lPzxYX7.CotYqGJOgx6goOKpLA7HWeT2qzIct2B3EjToTNvq4k/R2', NULL, '2026-02-10 15:29:43'),
(237, 'Test User', 'test_user_1770737387336@example.com', '$2b$10$5YjIIwLmZiVNmrZBT71XY.qAxGBKyqi9UEMl.fROvKcLYIDT8qFtC', NULL, '2026-02-10 15:29:47'),
(238, 'Test User', 'test_user_1770737395537@example.com', '$2b$10$n/nDk6PU7w9HLSRtg1v.oeJ50I66dLSDTmDIpxulVJTREptAdhso6', NULL, '2026-02-10 15:29:55'),
(239, 'Test User', 'test_user_1770737400211@example.com', '$2b$10$PmxWdV1ilo6ut2nIUw/fxOy3xjl2YP3fC.Fma6MMRQiivaKWJm2kC', NULL, '2026-02-10 15:30:00'),
(240, 'Test User', 'test_user_1770737424515@example.com', '$2b$10$Y72XLBgts/3exIYQKLZtD.FBrsGBGheojR5VjaD2F0yM418Uetw8u', NULL, '2026-02-10 15:30:24'),
(241, 'Test User', 'test_user_1770737428157@example.com', '$2b$10$PBDwdk2fIy02bJmhXO7pF.OYckjTT9H0X7ivKUoYef.nESwwzAG5e', NULL, '2026-02-10 15:30:28'),
(242, 'Test User', 'test_user_1770737437026@example.com', '$2b$10$aNpwS5ZWDmbSMQ6yZa/6NeeGlL.U8t3o6lCFTYRBCjad/4rA5QkUe', NULL, '2026-02-10 15:30:37'),
(243, 'Test User', 'test_user_1770737440862@example.com', '$2b$10$AYsn2LQ/bTP2yF2mZUafvOt6KndyGZNvNhoh56bqOmmMjX94d70.K', NULL, '2026-02-10 15:30:40'),
(244, 'Test User', 'test_user_1770737497031@example.com', '$2b$10$eJxWUycvy823J1HS/MiTfuQHzjP0Jmtmmhk3jJ5HeIt0yvfa0CaAm', NULL, '2026-02-10 15:31:37'),
(245, 'Test User', 'test_user_1770737501131@example.com', '$2b$10$9D45kSqmZVxso1u4s2WuNuGuH3dDvG3jTuecJEYKtEF8cQvqO9JGS', NULL, '2026-02-10 15:31:41'),
(246, 'Test User', 'test_user_1770737504311@example.com', '$2b$10$NlfMSi2TXaqouhu573fWX.2kjYHS/Ih4tBMEcscHkPfFX2wQN7rNW', NULL, '2026-02-10 15:31:44'),
(247, 'Test User', 'test_user_1770737506947@example.com', '$2b$10$BgXMm2oY4kE/mIUrspSI8eXHZWumT8Cmi96U3xMyUs2k0ZhGfqmUm', NULL, '2026-02-10 15:31:47'),
(248, 'Test User', 'test_user_1770737521757@example.com', '$2b$10$YIrhtVJAU1hC9kEZyNZfuu60cTzzFaMi9MAeZn5ysd4s/VosS5TOe', NULL, '2026-02-10 15:32:01'),
(250, 'Test User', 'test_user_1770737522569@example.com', '$2b$10$XjQfja9KqHRPz2fT.G.3kuVR.stWuEUe2kZ12DuGOJL41XgIJya46', NULL, '2026-02-10 15:32:02'),
(251, 'Test User', 'test_user_1770737525983@example.com', '$2b$10$ViQCrb6mFT5c1N7aPyBFru4szcLmBzZ1K/PO/RKoTDXhq2Walz9zK', NULL, '2026-02-10 15:32:06'),
(252, 'Test User', 'test_user_1770737526305@example.com', '$2b$10$TljtTkMR1ViURjMEM.FmBuFCfolLHx/Alnpm8c9Q8t7/Yd0R/6oKm', NULL, '2026-02-10 15:32:06'),
(253, 'Test User', 'test_user_1770737528584@example.com', '$2b$10$IqbwlOWiTNB.f4XeQY0ghO6hIwQLI9ilzHYVEhYT7CulhPOw3bxke', NULL, '2026-02-10 15:32:08'),
(254, 'Test User', 'test_user_1770737530830@example.com', '$2b$10$KRn1iMbs5Q4sLRhREAY4T.wQdwySNubx8F2V2PZC3nTRmLezfrTwO', NULL, '2026-02-10 15:32:10'),
(255, 'Test User', 'test_user_1770737533085@example.com', '$2b$10$TAgFggBM5Z5PMmjcb2/MueMToEADhZBDLMm75B3FRERmgFbn3CMVu', NULL, '2026-02-10 15:32:13'),
(256, 'Test User', 'test_user_1770737534956@example.com', '$2b$10$dYrs02RHtYHFG75PBKzpkeovbTnNqfbxUzflxAeKvzYlBShv.PGI6', NULL, '2026-02-10 15:32:15'),
(257, 'Test User', 'test_user_1770737536628@example.com', '$2b$10$fPSL6uHEYD8p7SxjIYymAufCkPDAAL/OT.jKrXZ4RSbbC.cJcBH4i', NULL, '2026-02-10 15:32:16'),
(258, 'Test User', 'test_user_1770737538659@example.com', '$2b$10$umrCcvxKFHjv0NdMg9nhvOpl3JrRuOmY/Tec7vlmKgQSH1MiyuUtC', NULL, '2026-02-10 15:32:18'),
(259, 'Test User', 'test_user_1770737540307@example.com', '$2b$10$iN2y7ZhgMQ3XnNpW9qWJu.Kr1XxzxDUPf2j0nmjPsvnzbtepyGsDe', NULL, '2026-02-10 15:32:20'),
(260, 'Test User', 'test_user_1770737543891@example.com', '$2b$10$KWBwuq/c4Db23900df0WMOEoFEcDfc3PXSzBgRWJZN0YjMPoYtv6K', NULL, '2026-02-10 15:32:23'),
(261, 'Test User', 'test_user_1770737592972@example.com', '$2b$10$unToxzUJF0F7B1h9KyteD.vmErlvFAqRy0ikRnLSOsVhhSNYUpESS', NULL, '2026-02-10 15:33:13'),
(263, 'Test User', 'test_user_1770737593885@example.com', '$2b$10$0a8oaa66dOa6JKUTRL2LyOScabyKdgFH9mTBB3MUXaYZkTtSUsC36', NULL, '2026-02-10 15:33:14'),
(264, 'Test User', 'test_user_1770737596898@example.com', '$2b$10$OCdvhyaaNHssFJRP7DRsmeRp55cYqpKqlb6RtRaSDSE89Bm47QSai', NULL, '2026-02-10 15:33:17'),
(265, 'Test User', 'test_user_1770737599536@example.com', '$2b$10$6J9EkaJ696PQg3V2OEydiOMJqPLEaJwYnRz7LzHQqSJmGblU81W8G', NULL, '2026-02-10 15:33:19'),
(266, 'Test User', 'test_user_1770737601868@example.com', '$2b$10$VybRhN7uW7A67.6ajbe6EO2evJcitMPpNHimElNIYuDQgaLxxV11G', NULL, '2026-02-10 15:33:21'),
(267, 'Test User', 'test_user_1770737603431@example.com', '$2b$10$/1jrRrYG4YRACKTwb/gnPOfOXjlzmYd.yjmgWWoZlpJPsbfOa98/2', NULL, '2026-02-10 15:33:23'),
(268, 'Test User', 'test_user_1770737604195@example.com', '$2b$10$5gcS5.5FE8YN0BQEwl7omuQQLvIiXbdoCGyPqWZ4KdhAtFb5s5LlC', NULL, '2026-02-10 15:33:24'),
(269, 'Test User', 'test_user_1770737606475@example.com', '$2b$10$Ll91ISzG6ueWIHFJroVFHOwkxXKu/ZMhwar/kuEi46SuyEnwyWtve', NULL, '2026-02-10 15:33:26'),
(270, 'Test User', 'test_user_1770737607171@example.com', '$2b$10$uB2vHIbB2VaRmIMDr24p7uSwlB7jF28ubwf8.GVyIqagKEmiSZYEq', NULL, '2026-02-10 15:33:27'),
(271, 'Test User', 'test_user_1770737610081@example.com', '$2b$10$2a7lBZxc8Lq5kJwfzD2G7OhZE3BTZJlN45zsdXG.BI.ydLr1v0D.2', NULL, '2026-02-10 15:33:30'),
(272, 'Test User', 'test_user_1770737613738@example.com', '$2b$10$rTidrphNHUs0rZJCn4JO6uoAtqpuO4P67/De8YxQC3aI9fFNL35gu', NULL, '2026-02-10 15:33:33'),
(273, 'Test User', 'test_user_1770737616991@example.com', '$2b$10$SLwlL/97el5GcAhC/vyv/uSvb8g1BsycsgBAhevEM3MP.UOWg3Xdm', NULL, '2026-02-10 15:33:37'),
(274, 'Test User', 'test_user_1770737658715@example.com', '$2b$10$5COmG6md7MxNwj69f0K0FukK14sVrP9Lh.1dxHMx2U2JuXqibaLcm', NULL, '2026-02-10 15:34:18'),
(276, 'Test User', 'test_user_1770737662716@example.com', '$2b$10$lFFxMbFBJjDLbsIT41eT/.N4Vp4zZc7MBW5TZWb0h2CR9EUtO031a', NULL, '2026-02-10 15:34:22'),
(277, 'Test User', 'test_user_1770737662739@example.com', '$2b$10$q8nEuhXHUDaY46AJ31zoXO0dbKOP5CM4RQIUvfD1R/PnST4DzI/m2', NULL, '2026-02-10 15:34:22'),
(278, 'Test User', 'test_user_1770737665540@example.com', '$2b$10$BUk5iuf1lTSfZUFOMGO6.e6UENeo/54J.G.kDAh4rDcJffWh1Woni', NULL, '2026-02-10 15:34:25'),
(279, 'Test User', 'test_user_1770737667807@example.com', '$2b$10$q1pBPgAbXcySrdFFlxJYKO5DD2Hyzaj9QpYsrFMbaHMd9wjhRsKTe', NULL, '2026-02-10 15:34:27'),
(280, 'Test User', 'test_user_1770737670122@example.com', '$2b$10$sVHAUIUsfW3.9vI7YcNhd.3/t0EUrnmtF9EvFji7FSPyRlEIW5F42', NULL, '2026-02-10 15:34:30'),
(281, 'Test User', 'test_user_1770737671860@example.com', '$2b$10$cm.Cm8/TJwcMF3t1wefVHOyA.2MvYQUlRT0A1aX0TNP0/8.nqY5c.', NULL, '2026-02-10 15:34:31'),
(282, 'Test User', 'test_user_1770737672366@example.com', '$2b$10$O1VIBOHsPhRn4jg66pqnJOo8D0hxnyY/kCVGzRhg79vrMN7x2JSpa', NULL, '2026-02-10 15:34:32'),
(283, 'Test User', 'test_user_1770737675754@example.com', '$2b$10$SodZxZAUDVp5IfX1/cEHXeyxCvi9KpCCGqMyibfmTiPJMhfuEbqeu', NULL, '2026-02-10 15:34:35'),
(284, 'Test User', 'test_user_1770737676183@example.com', '$2b$10$78G6B5MzUGtpbOWfCWW.se.x.2zhsmIpV4Qy27CRZa5M.wgbbq1Nq', NULL, '2026-02-10 15:34:36'),
(285, 'Test User', 'test_user_1770737679786@example.com', '$2b$10$nGF4.ESuZfIeKaSs.Tunf.Zh/3RsqhKy650/tocT4467wVdTEqr8q', NULL, '2026-02-10 15:34:39'),
(286, 'Test User', 'test_user_1770737683108@example.com', '$2b$10$TAbsaqkPwK189v15bczKkuL1LZ3.YuFEOd2ZS42l7MHgBrlO6NEse', NULL, '2026-02-10 15:34:43'),
(287, 'Test User', 'test_user_1770737711252@example.com', '$2b$10$1Kc1BH5iYMdrNBPuquBtee4OFSUAwTd4K/d5SeUxJ450Gp4azYdau', NULL, '2026-02-10 15:35:11'),
(289, 'Test User', 'test_user_1770737715324@example.com', '$2b$10$QOOzaqoV5Y3DmxosdP/FVue3JERSKwMAp49jr2NRMAiAWI1RDrNw2', NULL, '2026-02-10 15:35:15'),
(290, 'Test User', 'test_user_1770737715343@example.com', '$2b$10$9EY4g.CYkDndU9uK6Xm4OuE5tb.iTTUCbpESOaZ7Xfwb7dpuWmQAi', NULL, '2026-02-10 15:35:15'),
(291, 'Test User', 'test_user_1770737718226@example.com', '$2b$10$0yc0/cO5.UK3jpD4RdhYw.k5zNrxc/SjAhSk82FxPQwzu9g3ij9mu', NULL, '2026-02-10 15:35:18'),
(292, 'Test User', 'test_user_1770737720487@example.com', '$2b$10$rTlTtgodX9Pt6YacWI6OgeK8Y5HXl17tTwzuo1HOF6ksNvfKXcTFe', NULL, '2026-02-10 15:35:20'),
(293, 'Test User', 'test_user_1770737722750@example.com', '$2b$10$fgR7TwHhAu50akq6ZDL3h.LlZau/kq5hRhIEsNk7wZ.lkhb6bc6VG', NULL, '2026-02-10 15:35:22'),
(294, 'Test User', 'test_user_1770737725027@example.com', '$2b$10$USplkZiEmuZFYxFC/r8PxOuJ7aAELe7bVFbfs3s3o2fS2PezmEb4G', NULL, '2026-02-10 15:35:25'),
(295, 'Test User', 'test_user_1770737728584@example.com', '$2b$10$YlhNnwT0B/ClOZb4lfuSOe8Mcwcs0Wk4s/HRSxZSsd61sffE9hC7C', NULL, '2026-02-10 15:35:28'),
(296, 'Test User', 'test_user_1770737732161@example.com', '$2b$10$pkcCXxNVBsTte0vVyhvyFu3WB79HpEtnWDmMxS2cFzJuQkulcF9zG', NULL, '2026-02-10 15:35:32'),
(297, 'Test User', 'test_user_1770737735664@example.com', '$2b$10$2/jvoiW3dQOWlmzJVof4UeUE.OcMG8wwe1or2WM9kKvnmmp1z9ySK', NULL, '2026-02-10 15:35:35'),
(298, 'Test User', 'test_user_1770737746104@example.com', '$2b$10$EK1YDx0x35TycaAti8eSx.A05h1OTW/WBHdKr77uAEbrZYJq2oHhu', NULL, '2026-02-10 15:35:46'),
(299, 'Test User', 'test_user_1770737749784@example.com', '$2b$10$MWDuZHlnM9SpmNFdBDB87uQFXvzwAK9/IH3V6iqx6SFZIKH0Cnn2i', NULL, '2026-02-10 15:35:49'),
(300, 'Test User', 'test_user_1770737794094@example.com', '$2b$10$9gpgh4PXkuKZqXzmm1N4juSexeffGsbJ9WXwFARuAmoEHCSnuWvty', NULL, '2026-02-10 15:36:34'),
(301, 'Test User', 'test_user_1770737797849@example.com', '$2b$10$gzO3J414KV2XCw23BIy7vOU/6R46kLHb6wwEh9A6kylkKq7DdmmoC', NULL, '2026-02-10 15:36:37'),
(302, 'Test User', 'test_user_1770737828560@example.com', '$2b$10$XoMaoqdHg4mZ5aSuCkUbL.VLpZdVK5S0U1ICrxFzOuFThMl1mtjba', NULL, '2026-02-10 15:37:08'),
(303, 'Test User', 'test_user_1770737832179@example.com', '$2b$10$.efboHTuSYARlt5nz455KuMrPCBIww9IqtXQaQGywbHluovd/nLui', NULL, '2026-02-10 15:37:12'),
(304, 'Test User', 'test_user_1770737835619@example.com', '$2b$10$gTjShlDhf7ciRCmyaET9/uAj8NPWRfcYuQ/wwgvOXnpl80YnLw5vm', NULL, '2026-02-10 15:37:15'),
(305, 'Test User', 'test_user_1770737838234@example.com', '$2b$10$uramMH46gX4DVUfUlfeheuaDLZDmm/mRyBJ73Tf9ZyyQVt11ZxzP.', NULL, '2026-02-10 15:37:18'),
(306, 'Test User', 'test_user_1770737841380@example.com', '$2b$10$0bdUmvBkqg8QrlfOPRtP9O2DmPIOKGVSDc4eSOSb5vGMfAa8rL5Uy', NULL, '2026-02-10 15:37:21'),
(307, 'Test User', 'test_user_1770737843611@example.com', '$2b$10$Ynn2YIPlqgE7BNFMQIoeK.YkkWlhOvsLg/tHlBO4wFkldGKgcdw1C', NULL, '2026-02-10 15:37:23'),
(308, 'Test User', 'test_user_1770737845876@example.com', '$2b$10$dItnFU1WyBnqzFs9rva0VeJrmM69JdHSyHiIe3jeB1LOsUlsNHkGG', NULL, '2026-02-10 15:37:25'),
(309, 'Test User', 'test_user_1770737848114@example.com', '$2b$10$QX5XE486ZZhJ2ZiZS7JDCeAA5oEBanZU6okx8LKhmRTNMaEVSdqvi', NULL, '2026-02-10 15:37:28'),
(310, 'Test User', 'test_user_1770737851145@example.com', '$2b$10$GEQ6NfT4E51Jm90BuFs7S.7dCtkKFQ.rwW2imPQjzFshFVQceCFpW', NULL, '2026-02-10 15:37:31'),
(311, 'Test User', 'test_user_1770737854746@example.com', '$2b$10$CzJYOrDt4x5.wNDjVxlJ0.kQcDhD6OQfnGiJmCMHWE2SOedvhK6M.', NULL, '2026-02-10 15:37:34'),
(312, 'Test User', 'test_user_1770737858261@example.com', '$2b$10$ZAWdw0tcRlSrXvAE1jXdqeeNwwNStk7fWWTug21RYh86mWu1oo8La', NULL, '2026-02-10 15:37:38'),
(313, 'Test User', 'test_user_1770737919777@example.com', '$2b$10$PlVqJ34KTOyNbwHJ5kONnOzfRSsE4EfRswQ9oVHnaHzyD9WIHnZk6', NULL, '2026-02-10 15:38:39'),
(314, 'Test User', 'test_user_1770737923517@example.com', '$2b$10$FiCpxzZevXGSBdDnZF9rNeZ7kg3Ohnz6kWmYldtSgRdqzQGX7/bRu', NULL, '2026-02-10 15:38:43'),
(315, 'Test User', 'test_user_1770737927965@example.com', '$2b$10$U8eGhyO/6I0TVazLuxazOuxPvZtXqau66tqTSM64rdESmKkojN/yO', NULL, '2026-02-10 15:38:48'),
(316, 'Test User', 'test_user_1770737931102@example.com', '$2b$10$76K4Te3QMI659KBdVK7jjOileOIhgnBq.T0vKoEi5crJZZu54CQ3K', NULL, '2026-02-10 15:38:51'),
(317, 'Test User', 'test_user_1770737934291@example.com', '$2b$10$iq8fr4pup1j0rIBdEbp2/Og5RGK6vMLkw8QhmaxQ7iF/xKx2OltLK', NULL, '2026-02-10 15:38:54'),
(318, 'Test User', 'test_user_1770737937435@example.com', '$2b$10$bfDJIqGiJc0iQIkzWE7vpOta3DxBoT1qOvPTYucZiN.iV/pzlC14a', NULL, '2026-02-10 15:38:57'),
(319, 'Test User', 'test_user_1770737940559@example.com', '$2b$10$6NiHrsYr2MaPjwezuXV74.5ps2rA5voLrNfnw2LwV/zr3X/.jpRie', NULL, '2026-02-10 15:39:00'),
(320, 'Test User', 'test_user_1770737942819@example.com', '$2b$10$pSuTn/UTVpr43t2BvmxlUuIOyRAwJzZ.BTMbZf3eoNWpnVbbYxT5u', NULL, '2026-02-10 15:39:02'),
(321, 'Test User', 'test_user_1770737945051@example.com', '$2b$10$Yh6WCxBitBj/PuWlPsX3QucwkCmu4oiEd.1yayf7zlaflI0rg2xAK', NULL, '2026-02-10 15:39:05'),
(322, 'Test User', 'test_user_1770737947299@example.com', '$2b$10$ZhOs5fdg79JSyp8x/lNuEet63HIJZ10rUnv2RRb6wcPqCAMuXbAcO', NULL, '2026-02-10 15:39:07'),
(323, 'Test User', 'test_user_1770737950889@example.com', '$2b$10$K52pCKCs9qBl8bbZKvtfWeQGZTqyVOnuJFhNmX.fag8XtzqPKHPjC', NULL, '2026-02-10 15:39:10'),
(324, 'Test User', 'test_user_1770737954569@example.com', '$2b$10$V8lo2citiJNP0ydVFbwktOlQGhVi/fyzXyUypG.MqivCCBmCYDzBm', NULL, '2026-02-10 15:39:14'),
(325, 'Test User', 'test_user_1770737957819@example.com', '$2b$10$dzYG8QFLnBcJcpYS7pKHY.ZhJXoeRj3sRIjNa6g9lJ5CbEOGqnrv2', NULL, '2026-02-10 15:39:17'),
(326, 'Test User', 'test_user_1770738143732@example.com', '$2b$10$fWioIjvCjXAW7EoCsabadugj4vTqLPUKr7rU4NAUC10GqQEGE5oQi', NULL, '2026-02-10 15:42:23'),
(327, 'Test User', 'test_user_1770738147667@example.com', '$2b$10$v3CnybvboGwpmF90mZeFEeBxRDW8Svjt/UW0VZG4FROWsbKvNy9O2', NULL, '2026-02-10 15:42:27'),
(328, 'Test User', 'test_user_1770738152433@example.com', '$2b$10$nvLBLzP2bRWlL5zKztP9cujpmkoE92CFJgQJx95U6tStYqeqXMAYO', NULL, '2026-02-10 15:42:32'),
(329, 'Test User', 'test_user_1770738155961@example.com', '$2b$10$pfSfxEMPLhFoPaLo5e6JPe3GMBrJ1goe3Lph4zDhZFrzBXiwYXZGW', NULL, '2026-02-10 15:42:36'),
(330, 'Test User', 'test_user_1770738159133@example.com', '$2b$10$UIpJNOpyJlKVa.QWjstTTepgB089H.YSsLqCfd.L5t6.axgrLNITG', NULL, '2026-02-10 15:42:39'),
(331, 'Test User', 'test_user_1770738161737@example.com', '$2b$10$1CMjMkv3KybAkea/TSqfle6cUYYLCMlinMA5jRWsA5fHaIxOr2Gym', NULL, '2026-02-10 15:42:41'),
(332, 'Test User', 'test_user_1770738164813@example.com', '$2b$10$Cu/w3ivg2.aq2kabzftFOuh2xQXYpT/gh8cu4qbKrW7W0LYHwoe2.', NULL, '2026-02-10 15:42:44'),
(333, 'Test User', 'test_user_1770738167052@example.com', '$2b$10$Zq6pxF.eezltD8oWy8oi4eCt9xgcIBWnBYeeFpioo3ebKFLi2Z4U2', NULL, '2026-02-10 15:42:47'),
(334, 'Test User', 'test_user_1770738169249@example.com', '$2b$10$0k8ki7LKSWDgQsFy8bVOTO.IoG03xTiUyubE7WkUXyQ3qW0ohz5d6', NULL, '2026-02-10 15:42:49'),
(335, 'Test User', 'test_user_1770738171481@example.com', '$2b$10$VoNYZS16WUEw0S3Lhl1KSeYA47BZ9BQ.gAZYMGQUGAy1TEw24cPmK', NULL, '2026-02-10 15:42:51'),
(336, 'Test User', 'test_user_1770738175628@example.com', '$2b$10$DTn447JdxqlszwojwHlUo.SWW2CpPvS95LNUJkMmTvtOrt4FbKTQ6', NULL, '2026-02-10 15:42:55'),
(337, 'Test User', 'test_user_1770738179205@example.com', '$2b$10$9s9eQEA/pxW3awyR7LivdOLT.6SzCDm0BO6UhF7ZyL3xITlO5ZP8q', NULL, '2026-02-10 15:42:59'),
(338, 'Test User', 'test_user_1770738182590@example.com', '$2b$10$LvKsgoSCUWo2eAG9Ep7JoeofakwASiRbjdZkKMqpDxTOrmcmr91bO', NULL, '2026-02-10 15:43:02'),
(339, 'Test User', 'test_user_1770738210600@example.com', '$2b$10$/2rg/G88wTy/o1RdjClQNuu2tJrie5hBlr.MaRmZD9LSB4t2sCD62', NULL, '2026-02-10 15:43:30'),
(340, 'Test User', 'test_user_1770738214567@example.com', '$2b$10$nxmhcCoNXN024uKy2CB40.ZtN1Zx.sH0yxIAouNK5tdfvogutOIcS', NULL, '2026-02-10 15:43:34'),
(341, 'Test User', 'test_user_1770738218890@example.com', '$2b$10$ZoamfeDe9TI3W3Algt3S2ue07X0Ljymkij1U4JJu7JLVceNmGy7S2', NULL, '2026-02-10 15:43:38'),
(342, 'Test User', 'test_user_1770738221519@example.com', '$2b$10$WO9oPQWSKogEF4O7.1COIuYis3q8v2D0Gs/1u2trGhN30TVjtdeSW', NULL, '2026-02-10 15:43:41'),
(343, 'Test User', 'test_user_1770738224763@example.com', '$2b$10$iv5bHy0MnY8BSG3nAIPlge0tPk7/qgFWMa0UpY99X.Gy4Nw.IofVW', NULL, '2026-02-10 15:43:44'),
(344, 'Test User', 'test_user_1770738227326@example.com', '$2b$10$CJRlC4FSJ1qzR2bjtsgabOKg8G.xOHic3eTeOlJyTtBedZ7.4nuiG', NULL, '2026-02-10 15:43:47'),
(345, 'Test User', 'test_user_1770738230480@example.com', '$2b$10$5N1YX8RFzUgmBVXECPKlxesFAyu1z9B1h.lQrwcI2I/4NrRJiZDPS', NULL, '2026-02-10 15:43:50'),
(346, 'Test User', 'test_user_1770738232691@example.com', '$2b$10$ifAvaS3ywlCnOl6NnSi3ZO/nkT3NN/V3uFfDIwR9ErKQhX6O5kVsC', NULL, '2026-02-10 15:43:52'),
(347, 'Test User', 'test_user_1770738234917@example.com', '$2b$10$HnGwb6qHWs4OMHqpLNVdEu5nAL/1cuMi9X5DiwKkx1p2H9u6qUls.', NULL, '2026-02-10 15:43:54'),
(348, 'Test User', 'test_user_1770738237125@example.com', '$2b$10$sivh4nl0YDZNhhKhk4RNtuEmpPzqcjLPo9REreOAsTRwWc.sEFdv6', NULL, '2026-02-10 15:43:57'),
(349, 'Test User', 'test_user_1770738240706@example.com', '$2b$10$gEAqhnC7f8ZiWGfwKgVAHOWU20fBtNplZJSAS.XbmJWzMayJcnH4C', NULL, '2026-02-10 15:44:00'),
(350, 'Test User', 'test_user_1770738243795@example.com', '$2b$10$2hsz8WBwNtaYTLIGhfkHROg4QiEUPR6zELFdW4R7m2VQhpZEa2tg2', NULL, '2026-02-10 15:44:03'),
(351, 'Test User', 'test_user_1770738247217@example.com', '$2b$10$sonjsnmgveZm0Ngv1H4hvu7D6W0astMsD4z8Mh9Np2n9xVLT7ldKe', NULL, '2026-02-10 15:44:07'),
(352, 'Test User', 'test_user_1770738685259@example.com', '$2b$10$uSZIZb/7ni1o6XAPKB2/KO2.VQrVwYQN0X576BQj6LFCBDXw0FNkK', NULL, '2026-02-10 15:51:25'),
(353, 'Test User', 'test_user_1770738689537@example.com', '$2b$10$0Jib.0wLL33XSQskWclKoO39Eo2yU8ryaOpw.NVtZqKv17rkvyium', NULL, '2026-02-10 15:51:29'),
(354, 'Test User', 'test_user_1770738692914@example.com', '$2b$10$XF4fbBC2sj1c0ZQ7A5L.GObAmmiSecMrEeJA3uXrUzHIZeFaTyhIi', NULL, '2026-02-10 15:51:33'),
(355, 'Test User', 'test_user_1770738696098@example.com', '$2b$10$XLMszptfd3YNOQifKBHQFOqcLURlaoAfbyfjpzJJkSkXSp/VNhsZO', NULL, '2026-02-10 15:51:36'),
(356, 'Test User', 'test_user_1770738699526@example.com', '$2b$10$iEqzQOJ5vz8aNyfwwxLNj.RFrKWApM5QSI4jq3KZ4PHDR/J2n.Ihe', NULL, '2026-02-10 15:51:39'),
(357, 'Test User', 'test_user_1770738702152@example.com', '$2b$10$t0EUSw7Xxibwf3g0EuiBwOV7rJzyDVg1DMQZbJCut3/RFCRpJxWy2', NULL, '2026-02-10 15:51:42'),
(358, 'Test User', 'test_user_1770738705305@example.com', '$2b$10$juT2tfUg/yLQWjpMcqXk9ebsIu.E3T2kylnpE5bgeiIhbi26iXgLe', NULL, '2026-02-10 15:51:45'),
(359, 'Test User', 'test_user_1770738707546@example.com', '$2b$10$Rai9bb2wsYKi1wttKTL0ZuqayHeTpJgYTmvUBoaTmzYrAuCuwjXo2', NULL, '2026-02-10 15:51:47'),
(360, 'Test User', 'test_user_1770738709792@example.com', '$2b$10$jWgGSbG2eT9oSjZPaYWI0eAQucn0e3Mi/wr40FbwVVagCa5zj0QIy', NULL, '2026-02-10 15:51:49'),
(361, 'Test User', 'test_user_1770738712036@example.com', '$2b$10$sImt89g.2iT6U5KhaD6zCOeb7FUbaco1My21ro1RnJGLCPUnTL.1a', NULL, '2026-02-10 15:51:52'),
(362, 'Test User', 'test_user_1770738716096@example.com', '$2b$10$dfVZXEaqPfoVx0fSE6s7ZO7Yr7zZ1b8AZHfWpW3zvwS5YkAXGh/gO', NULL, '2026-02-10 15:51:56'),
(363, 'Test User', 'test_user_1770738719779@example.com', '$2b$10$sO2LDhdcsvTO9BGJDwkhUuM7zzYha1pU4jy2QV2W9jm7S7WRzo.ba', NULL, '2026-02-10 15:51:59'),
(364, 'Test User', 'test_user_1770738723235@example.com', '$2b$10$JpoaC9xNMo65RFvCAxCx6.WgwiuGUYkLjKeRX54lWD9oLArsJ7mWi', NULL, '2026-02-10 15:52:03'),
(365, 'Test User', 'test_user_1770738826619@example.com', '$2b$10$qEsLH/nGlxfYEiNh9YuXv.PeQVGc0yvfc8VKIzDGbOuLKogusN5uy', NULL, '2026-02-10 15:53:46'),
(366, 'Test User', 'test_user_1770738830357@example.com', '$2b$10$sakKsh0vtb9EqrGx2Y5S4.F.amI87I76xmDacWgg8DCy2Ctshuc7C', NULL, '2026-02-10 15:53:50'),
(367, 'Test User', 'test_user_1770738834949@example.com', '$2b$10$zUoYQaBR9Oz0u.ylDN2yHulnaxJM2G6vtxUaXHEtTGdEKAwIbfxmW', NULL, '2026-02-10 15:53:55'),
(368, 'Test User', 'test_user_1770738838117@example.com', '$2b$10$bWX0Ieb0ozqle.9v1sV.c.diO1GZMEj2sGZojNO4YXln.WOCdaMd2', NULL, '2026-02-10 15:53:58'),
(369, 'Test User', 'test_user_1770738841328@example.com', '$2b$10$ZaBxb6aPiT6JWHWVIfwMzO4Kqz/hWLDdqhgAsS1VbBhPJFbZcRD0S', NULL, '2026-02-10 15:54:01'),
(370, 'Test User', 'test_user_1770738843899@example.com', '$2b$10$QXGIgofxr/pArKNQ5NCFpugYwFywNDJZz.POq9denELR/hXn5gfiu', NULL, '2026-02-10 15:54:03'),
(371, 'Test User', 'test_user_1770738846552@example.com', '$2b$10$m.K3fPxy/5/x0TNz.7WVjuytsj0JPTQK88B5gE2D6JGtKZ2l.yRn.', NULL, '2026-02-10 15:54:06'),
(372, 'Test User', 'test_user_1770738848771@example.com', '$2b$10$VKnRZew.Xo/ifPvGc1IOSOXBz01UijOkaprhPyR4RUgj87OIANNBS', NULL, '2026-02-10 15:54:08'),
(373, 'Test User', 'test_user_1770738851014@example.com', '$2b$10$cM/8LPaNZiS041C1S98qpOeb7JHVoENUGxvb9JxZVuNY81R662/U2', NULL, '2026-02-10 15:54:11'),
(374, 'Test User', 'test_user_1770738853277@example.com', '$2b$10$oKuk4BdhHa1ki3IP2Ds9H.XZaf2dyHjUk6M8FpuYyA1lwed/N79.u', NULL, '2026-02-10 15:54:13'),
(375, 'Test User', 'test_user_1770738856889@example.com', '$2b$10$8VWfae3a6w6rOXucefA4eukSAq/OeY5VghI8Io9CRblJ786yg4rM.', NULL, '2026-02-10 15:54:16'),
(376, 'Test User', 'test_user_1770738860468@example.com', '$2b$10$QXerUUoWfrLAR4P2MkW/weGVyonJYyP701bnTIppqywWe/RFBG0I6', NULL, '2026-02-10 15:54:20'),
(377, 'Test User', 'test_user_1770738863869@example.com', '$2b$10$TEjKHl.ZaPXdJAR4bkVH4uD5wiJF.BI3z.xyYiEPA7yWxzPJwdrVy', NULL, '2026-02-10 15:54:23'),
(379, 'Test User', 'test_user_1770741032102@example.com', '$2b$10$cQMj.BRMJQiYj0Cz9I177eyvLiRpDTNXy6IZ49As/nwb8kGOs1CnO', NULL, '2026-02-10 16:30:32'),
(380, 'Test User', 'test_user_1770741042626@example.com', '$2b$10$xAw.tH1KaWplOPUzOFvE2eyQFQIFlmixlBuW6o5TiG4zP4GPs1Dfe', NULL, '2026-02-10 16:30:42'),
(381, 'Test User', 'test_user_1770741051899@example.com', '$2b$10$PZ/G2pPo9I8LUruX1SWMleiuS1yrqoberusTYePnC.caJI1exJ6Qm', NULL, '2026-02-10 16:30:52'),
(382, 'Test User', 'test_user_1770741055662@example.com', '$2b$10$ElaRbzDfm46vd9cm6dbAYefbHyu3i7Nh6y4qDkxKrRMHw9rcnL.iy', NULL, '2026-02-10 16:30:55'),
(383, 'Test User', 'test_user_1770741099136@example.com', '$2b$10$GpxhwX6i5B09S1j48vQA7.Fgd4LEsvENywTUAlB5KvYM1QX9VqGna', NULL, '2026-02-10 16:31:39'),
(384, 'Test User', 'test_user_1770741104474@example.com', '$2b$10$8KdUJI5/1julxhf0l2jLKejq2ISVs.Qxc6AhoorfRDjm6INuTWFLq', NULL, '2026-02-10 16:31:44'),
(385, 'Test User', 'test_user_1770741107642@example.com', '$2b$10$AB1YKtfLzvuVtHIaFbIeEe.Yldi1mItk8KIegn/jL4tJF6tb.FETq', NULL, '2026-02-10 16:31:47'),
(386, 'Test User', 'test_user_1770741110834@example.com', '$2b$10$XsmSqg.0DHnpJ6SYwqTa3.xyYc/Jk948O9SMH6THjNS2hXB5kvPz6', NULL, '2026-02-10 16:31:50'),
(387, 'Test User', 'test_user_1770741130318@example.com', '$2b$10$4dHZi525n9Kia7mtjGmpOezr.LgS1BFH1k6/4QL5fkNAIOdDzpgbS', NULL, '2026-02-10 16:32:10'),
(388, 'Test User', 'test_user_1770741134110@example.com', '$2b$10$jK9ZLfcHsr4ubctun26uL.Q15XJ9pg60JDnC8gnQtc7FqnJu4HdgO', NULL, '2026-02-10 16:32:14'),
(389, 'Test User', 'test_user_1770741136699@example.com', '$2b$10$UNUgVL1ydhgZsyTg7Nkz9u4jDMqPBwFuMJW6QjkFT/0ctCAsesCDe', NULL, '2026-02-10 16:32:16'),
(390, 'Test User', 'test_user_1770741138962@example.com', '$2b$10$xNe3RhYHzEQ7j04p4WZpduiiw3N7kr.DP6N.1fVbPSo9R3Ko2eH2m', NULL, '2026-02-10 16:32:19'),
(391, 'Test User', 'test_user_1770741141244@example.com', '$2b$10$5c2wXMqy60hbJfe01HQpHe7nCVwJ7tMLzqJGtxk01.tYHcgmoK2bK', NULL, '2026-02-10 16:32:21'),
(392, 'Test User', 'test_user_1770741143464@example.com', '$2b$10$wMwV3MLpiEIiiOwKsyLHVujBhugdhCWP5AekFg61SpzEDD3lybISO', NULL, '2026-02-10 16:32:23'),
(393, 'Test User', 'test_user_1770741146503@example.com', '$2b$10$TUrbGe5uO9c3tPrwjhyc9OqgADTDSzD4yf8Wcl.DyDHx8QGQ.4MxW', NULL, '2026-02-10 16:32:26'),
(394, 'Test User', 'test_user_1770741149615@example.com', '$2b$10$MCSLDA5N6Qh4VXDTBwm0EO3md/zKFTn9jcVpg/aYmua9OWvK.Jo76', NULL, '2026-02-10 16:32:29'),
(395, 'Test User', 'test_user_1770741158438@example.com', '$2b$10$82D45BLAX08NwhyQsU2AVevuQCOVd2xw82ykKKJu1wFtv0NcItjCq', NULL, '2026-02-10 16:32:38'),
(396, 'Test User', 'test_user_1770741406205@example.com', '$2b$10$Bj6bj2RgIDTk.CIqCwArKeN0fIf1omG5lsaCPne3vi/pxPdg5Ngr.', NULL, '2026-02-10 16:36:46'),
(397, 'Test User', 'test_user_1770741412349@example.com', '$2b$10$NlpUEI61K4AYmTh1DP/VWu8jadovT9Tj4qZGSxTORE3z4Sn855cUm', NULL, '2026-02-10 16:36:52'),
(398, 'Test User', 'test_user_1770741421273@example.com', '$2b$10$PLwBzROgNqL7HDujFDc1MOOHI9t4rqqJBkuiC8Hnm4hhqp/sYymK2', NULL, '2026-02-10 16:37:01'),
(399, 'Test User', 'test_user_1770741424859@example.com', '$2b$10$qVRqyVQJyqnXOpPPQ3lASuqY8xywyTeGUqQTvT4hFxvQhsXJxxD6.', NULL, '2026-02-10 16:37:04'),
(400, 'Test User', 'test_user_1770741453356@example.com', '$2b$10$mXCtmg0OUxmmhF/lm.gaKenPodCh5kzmHWxER8OwqGvUq5SJY89ee', NULL, '2026-02-10 16:37:33'),
(401, 'Test User', 'test_user_1770741458059@example.com', '$2b$10$oVjwG6KLtMTK6PuK9FZ.xuUIOqYoL5irpmO5frMwY6PkmUWoJGXBq', NULL, '2026-02-10 16:37:38'),
(402, 'Test User', 'test_user_1770741462095@example.com', '$2b$10$Wk3Bd9WumyZLtZ2f6VaTKO.TClz0VHy50VS3GYMPLt0Y8FeiPuXC6', NULL, '2026-02-10 16:37:42'),
(403, 'Test User', 'test_user_1770741465313@example.com', '$2b$10$I9drtYeeHbZEWppBFiaOSelOe8HQhYktrYxdA8ADhhSAnhXLxlba2', NULL, '2026-02-10 16:37:45'),
(404, 'Test User', 'test_user_1770741477535@example.com', '$2b$10$2LjBhrMOkMnxW9cu8hLIienkL/DrW56JHL5zZMpFC6Ap8UqMAlLu6', NULL, '2026-02-10 16:37:57'),
(405, 'Test User', 'test_user_1770741481260@example.com', '$2b$10$ZWA.CJORpHdOH7YZ2fIQ8OhI6.Wc2yQiWBVJwgbRs22O5BmrwT0/e', NULL, '2026-02-10 16:38:01'),
(406, 'Test User', 'test_user_1770741483841@example.com', '$2b$10$AZ38t/ACLLCGJMkGDl0lo.PSw/SF19CgzTyTrjEGsY2UG1GAKFcdG', NULL, '2026-02-10 16:38:03'),
(407, 'Test User', 'test_user_1770741486065@example.com', '$2b$10$Y4.SQlfusNDhdWf2stIXw.q1fIXa6Cd8QPswcMLVAIJeK0/ctJrf.', NULL, '2026-02-10 16:38:06'),
(408, 'Test User', 'test_user_1770741488245@example.com', '$2b$10$WPZ/4FcJkzlS90yn3MEKR.HfczM568PtGFqQU0zUPd.pJ56g.LVC2', NULL, '2026-02-10 16:38:08'),
(409, 'Test User', 'test_user_1770741490473@example.com', '$2b$10$E8Wr/Tz0qC7xPf.wOSSL2eWV1vLarixx3.wEPi5sNjPpL2jljvBjO', NULL, '2026-02-10 16:38:10'),
(410, 'Test User', 'test_user_1770741492973@example.com', '$2b$10$/pnSppzV3nNGAdkRBpVc0OHPbJgnxixq.CsbFZMV9GuJH2JWMEVJ.', NULL, '2026-02-10 16:38:13'),
(411, 'Test User', 'test_user_1770741496023@example.com', '$2b$10$ePEzRFJaIG7vmZd8/IMMX.qHPVyKerTQ.Mqrx.8wuwneqBlfkar6O', NULL, '2026-02-10 16:38:16'),
(412, 'Test User', 'test_user_1770741499246@example.com', '$2b$10$SmomimvWEJ9ZrdvDoBmObedene9keKvHzkVvSrOhmyZ9TybBng1Py', NULL, '2026-02-10 16:38:19'),
(413, 'Test User', 'test_user_1770741907395@example.com', '$2b$10$KbbeCWyE9Zz2DyIYqfIYZuoCIQ37viV0CWrPzKjjk9DM7AMgjMMD.', NULL, '2026-02-10 16:45:07'),
(414, 'Test User', 'test_user_1770741938800@example.com', '$2b$10$UYrXzDv3D7qQB9L0.9VP8OUqal/fUbI9XPY35k3hCVdNgOe9S6rQC', NULL, '2026-02-10 16:45:38'),
(415, 'Test User', 'test_user_1770741998739@example.com', '$2b$10$HZBQg/qjT0L87j1bH0ldj.ILVlDVceQ34y5IRXS3GlxsLp98jEgjC', NULL, '2026-02-10 16:46:38'),
(416, 'Test User', 'test_user_1770742030050@example.com', '$2b$10$YXL60DLfzHjzTz4StKVooOtUGXvzldS98U6nS70kksPNk1gVjWmS2', NULL, '2026-02-10 16:47:10'),
(417, 'Test User', 'test_user_1770742119631@example.com', '$2b$10$tdtwz28Ac/.hrWrWjqKhY.QoQ23EZXvn8E5AR9Kfz0KhuxLRmQm9S', NULL, '2026-02-10 16:48:39'),
(418, 'Test User', 'test_user_1770742123900@example.com', '$2b$10$Fu/KncuNkML7N.6JcEWr6OoPKh.SiZGCXzA45dSvyXPvPuERjYzyW', NULL, '2026-02-10 16:48:43'),
(419, 'Test User', 'test_user_1770742172773@example.com', '$2b$10$MHgvMQZi9.jQTQk1CKmO..ZHS13X46oJzdzAy4YMfv5wE/fd9NqNK', NULL, '2026-02-10 16:49:32'),
(420, 'Test User', 'test_user_1770742176803@example.com', '$2b$10$yans//9jAoAuGIOU70dHVOel5Dg.YV/Q.xjE4FRSNUHn77KmuPY4y', NULL, '2026-02-10 16:49:36'),
(421, 'Test User', 'test_user_1770742270480@example.com', '$2b$10$hVnEQ5dPGTaqxRBN3xhFUut4eN.UljzmcM0jbqol0tXXtf.k7mCNC', NULL, '2026-02-10 16:51:10'),
(422, 'Test User', 'test_user_1770742274561@example.com', '$2b$10$W/lNUjCYubtCFb1u7YPAde47CSt6R2N/hZ6uZTV5KEG9IaYG.tuj.', NULL, '2026-02-10 16:51:14'),
(423, 'Test User', 'test_user_1770742387635@example.com', '$2b$10$9rCS/usS7DUP5NWIjEdJ1.XrCNsXQYemAd/rgBXVGt4YYQEZMzpOy', NULL, '2026-02-10 16:53:07'),
(425, 'Test User', 'test_user_1770742387636@example.com', '$2b$10$nruzbkUmbz4xGVJcn8UXCebkidmVE/8kQIP98CLJsRfXYytAkQbkm', NULL, '2026-02-10 16:53:07'),
(426, 'Test User', 'test_user_1770742392319@example.com', '$2b$10$dZSrGZ9gTtkAdxrDqMaZxOhwR31PAAGRS0HAtp560jbuI9dP2rK7K', NULL, '2026-02-10 16:53:12'),
(427, 'Test User', 'test_user_1770742393192@example.com', '$2b$10$q1eDjyPm1N4EQ0KsYWuF/e49.TIDcHSg08sNkQQZd5y7bEfyc3jHG', NULL, '2026-02-10 16:53:13'),
(428, 'Test User', 'test_user_1770742393259@example.com', '$2b$10$G4GRuKRO7Lfw7y6BdQgjrOZWM9mfgGlhJSVuR6kcqKThq5gYiP/6a', NULL, '2026-02-10 16:53:13'),
(429, 'Test User', 'test_user_1770742395450@example.com', '$2b$10$XtydzbYQkxwgbeOr53ZCT.yUB6kC7PYZc07c.ZhdiZ0vJIrF0uS2i', NULL, '2026-02-10 16:53:15'),
(430, 'Test User', 'test_user_1770742396795@example.com', '$2b$10$tRqDvDBlDDhKkrvoWj/xGeAO3B0o1Mc6CbAl.SdXePEbireiuinDy', NULL, '2026-02-10 16:53:16'),
(431, 'Test User', 'test_user_1770742397743@example.com', '$2b$10$Vgv6riZwYIYXERcYyRPvC.6PmQtDQy2FobX16.V/V6mw4iRqRP0ge', NULL, '2026-02-10 16:53:17'),
(432, 'Test User', 'test_user_1770742399994@example.com', '$2b$10$RnQavGO42oAiOYDFfY2ZB.gYt0bor4jJRoHbdCbjSw1e9AJYKUt9e', NULL, '2026-02-10 16:53:20'),
(433, 'Test User', 'test_user_1770742400017@example.com', '$2b$10$VTpv/9T/LfTdhbIzXeSLVON1H.7ABQiLRSK7c2gcYhPHnhFPq39xa', NULL, '2026-02-10 16:53:20'),
(434, 'Test User', 'test_user_1770742402460@example.com', '$2b$10$FPg1leziTJU589EqH3/0e.QLgs0ZG55GzmhdKRh1AGG5oSP.eEXRy', NULL, '2026-02-10 16:53:22'),
(435, 'Test User', 'test_user_1770742405007@example.com', '$2b$10$IOirRLsmiNY9eyZcVKfj3eSathST2tOG1JE0piij5JEyka3S06cE2', NULL, '2026-02-10 16:53:25'),
(436, 'Test User', 'test_user_1770742407533@example.com', '$2b$10$rAWqb.HRW./SPclZ8TRQXOB/rPm1owxPGo84F67RRoye6dMezOZ7q', NULL, '2026-02-10 16:53:27'),
(437, 'Test User', 'test_user_1770742410754@example.com', '$2b$10$GEEMqbcMFS3hS/bIA1PRYu8O0OCvnN4DeXxn2RYSCGdqSzafHQ9yG', NULL, '2026-02-10 16:53:30'),
(438, 'Test User', 'test_user_1770742941887@example.com', '$2b$10$u87yHqyoItX6fYjr8mLfcu9rPem1I1EV1ZuXfU1lb6LWs9uzS1mwO', NULL, '2026-02-10 17:02:21'),
(441, 'Test User', 'test_user_1770742973701@example.com', '$2b$10$kKUAbvB2hWk7blcvwwcWHOOyAHaeYyMoHFd72go1iAT5yrf3tqnPq', NULL, '2026-02-10 17:02:53'),
(442, 'Test User', 'test_user_1770742973697@example.com', '$2b$10$PRQL0tJ.uDnRWPANhqOHquK6UfPY5vByu4pyesIh1O3y4QHxNMRNi', NULL, '2026-02-10 17:02:53'),
(443, 'Test User', 'test_user_1770742973691@example.com', '$2b$10$GOas7PtRYfrnR0awz.24VuAsgAQ/ssDzWUK5eLCOxKhIUW69Z..S.', NULL, '2026-02-10 17:02:53'),
(444, 'Test User', 'test_user_1770743005073@example.com', '$2b$10$lshLEYO7MYQCGi7Bo7JtnOIjvjylBiQUVCQMNrtl9hCy/FS9eh8cG', NULL, '2026-02-10 17:03:25'),
(445, 'Test User', 'test_user_1770743005074@example.com', '$2b$10$g0AH3aV6HQB7lhi5sky5BOvsIfWj1zwMhVumgDCIbhDwkuQisEiiG', NULL, '2026-02-10 17:03:25'),
(446, 'Test User', 'test_user_1770743036341@example.com', '$2b$10$DsuwVbt4ijzX2NlZ77oSY.vnjJ7nfo6DCKzJ7GkMtkwzj2g6yNSta', NULL, '2026-02-10 17:03:56'),
(448, 'Test User', 'test_user_1770743067492@example.com', '$2b$10$EiGmY1EGlstLD85m350HUu4BZ9TByO.wqYUsoyNIStjEQfjzZA.HK', NULL, '2026-02-10 17:04:27'),
(449, 'Test User', 'test_user_1770743098776@example.com', '$2b$10$3g8RUpAVrKwLFvLUt8ChmeHeXZKMTfHnvRck79UhiOgjpcfVF7ReW', NULL, '2026-02-10 17:04:58'),
(450, 'Test User', 'test_user_1770743129960@example.com', '$2b$10$d0gwJMbyvX//diu6mk/H0eD9hjAC.bhCCYu1t81opwVRRFRvSLija', NULL, '2026-02-10 17:05:30'),
(451, 'Test User', 'test_user_1770743161150@example.com', '$2b$10$4qbJz9P2ALF1ksawgmS9R.Ox6eE35wW4S2q5SCEH11OQbtTBK5Oma', NULL, '2026-02-10 17:06:01'),
(452, 'Test User', 'test_user_1770743192253@example.com', '$2b$10$XLdj4cS6JaoSlzPVPlsZNe97JkVnDF5kWJ/.y8t.0UzPkXbLkBjWa', NULL, '2026-02-10 17:06:32');

