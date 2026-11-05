# 前端视觉层：星港手帐

博客使用 **Butterfly 5.7.0** 主题渲染页面结构。主题目录基本保持官方原版，只打了几个小补丁（见下文"主题补丁"）；站点自己的配置放在根目录的 `_config.butterfly.yml`；视觉与交互放在一层独立的自定义代码里。排查问题时，可以把视觉层单独拿掉做对比；升级主题时，只需要整体替换主题目录，再把补丁重新打上。

## 设计方向

- **纸面**：暖白纸张底色，叠一层极淡的 28px 方格纹（呼应手帐和四人立绘那张横幅的方格纸）。
- **三色强调**：灯笼珊瑚红 `--lm-coral`、暮色紫 `--lm-violet`、天空青 `--lm-sky`，都取自现有横幅；三色渐变 `--lm-grad` 只用在细节上，比如标题短线、阅读进度条、头像光环、按钮。
- **横幅**：首页、页面和文章的横幅底部渐隐融进纸面。文章页横幅改为底部加深，保证压在上面的白色标题和元信息清楚可读。
- **手帐条目**：首页没有封面的文章卡片，右侧会显示描边的衬线体编号（01、02……），由 CSS 计数器生成，不需要改模板。
- **标签胶囊**：标签页使用 5.x 的彩色胶囊样式，颜色固定取自配色（`source/tags/index.md` 里的 `custom_colors`），而不是每次构建随机生成。
- **字体**：中文一律使用系统无衬线字体，不额外下载字体文件；衬线体只用于英文和数字的点缀（小标题、编号、年份、404）。
- **深色模式**：所有颜色都来自令牌，深色模式只是重新定义一组令牌值。右下角设置按钮里可以切换。
- **首页「夜航书」版式**：横幅下方是一张杂志式的「封面故事」（最新一篇文章，配图完整显示在自身模糊放大的衬底上），文章列表之后用「星港索引」（标签星云、航线归档、分类舱段）收尾；页头标题下有一条刊号条（文章数、标签数、航行天数）。
- **页脚落款**：5.x 的多栏页脚导航（星港 / 阅读 / 友邻），上方一行衬线体落款「✦ 循此苦旅 · 直抵群星 ✦」。
- **交互**：卡片上有一束跟随鼠标的柔光（仅限鼠标等精确指针）；首页标题随滚动上浮淡出；栏目标题下的细线在进入视口时画出；Pjax 换页时内容短暂柔化；任意位置按 `/` 打开搜索。开启"减少动态效果"时这些动效全部关闭。

## 配置放在哪里

| 位置 | 内容 |
|---|---|
| `_config.butterfly.yml`（根目录） | **所有站点自定义的主题设置**：菜单、横幅、配色 `theme_color`、侧栏、评论、搜索、注入的样式和脚本 `inject` 等。只写和 5.7 默认值不同的部分，Hexo 会把它和主题默认配置合并 |
| `themes/butterfly/_config.yml` | 官方 5.7.0 的默认配置，**不要改**，升级时整体替换 |
| `_config.yml`（根目录） | Hexo 站点配置（网址、永久链接、插件等） |

## 文件结构

| 文件 | 作用 |
|---|---|
| `source/_luomo/styles/00-tokens.css` | 设计令牌（颜色、阴影、圆角、字体）的唯一来源。另外负责把 Butterfly 的 CSS 变量映射到令牌，并提供旧变量名的兼容别名 |
| `10-base.css` | 纸面背景、选中色、焦点框、滚动条 |
| `20-chrome.css` | 导航、横幅、页脚、右下角浮动按钮、搜索弹窗 |
| `30-home.css` | 首页文章卡片、分页、星港入口、栏目标题 |
| `35-home-artwork.css` | 首页「夜航书」版式：刊号条、封面故事、星港索引，以及首页专用的版面平衡规则 |
| `40-article.css` | 文章、页面的纸面容器和正文排版，标签胶囊；归档/标签/分类列表的「航线日志」（渐变航线、衬线年份、纸条目） |
| `45-post.css` | 文章页：横幅小标与信息胶囊、小节编号、标签插件（label、btn、hideToggle、timeline、代码块）、结尾标记、目录航线 |
| `50-aside.css` | 侧栏卡片、作者卡、公告、最新评论、目录、访客地图 |
| `60-pages.css` | 项目档案、云服务面板/状态页、建站日志、友链、404。这些类名在 `source/*/index.md` 里直接使用 |
| `70-motion.css` | 入场动画、滚动浮现、阅读进度条、卡片柔光、Pjax 换页柔化、标题随滚动淡出、"减少动态效果"处理 |
| `80-command.css` | 命令面板、快捷键表、`G` 键提示、轻提示、导航栏触发按钮，以及深色切换和换页的 View Transitions |
| `90-banners.css` | 每张横幅的焦点位置 |
| `95-image-credits.css` | 横幅署名标签和图片来源页 |
| `scripts/luomo-styles.js` | 构建时按文件名顺序合并以上文件，输出 `/css/luomo-theme.css` |
| `scripts/luomo-home.js` | 构建时组装首页第一页：刊号条、封面故事、星港入口、「最新手帐」标题、星港索引，不改主题模板 |
| `scripts/luomo-local-assets.js` | 把 `hexo-tag-hint` 的样式改成从本站加载 |
| `scripts/luomo-headings.js` | 给作者自己编了号的文章二级标题加 `lm-own-number`，避免和自动编号重复 |
| `scripts/luomo-tag-order.js` | 让每篇文章的标签保持 front matter 里写的顺序（第一个是主话题）；Hexo 本身按全站标签的入库顺序返回，换 Hexo 版本后顺序会变 |
| `source/_data/home.yml` | 首页各区块的文案、入口链接、标签配色和航行起始日 |
| `source/_data/widget.yml` | 侧栏自定义小组件（访客星图的挂载点） |
| `source/js/luomo-globe.js` | 侧栏「访客星图」：Canvas 绘制的星图地球，数据来自 `/api/visitors` |
| `api/visitors.js`、`lib/visitor-countries.cjs` | 读取 Vercel Web Analytics 的各国访客数，只返回国家代码和人数 |
| `scripts/luomo-analytics.js` | 构建时按环境变量注入 Vercel Web Analytics 的统计脚本 |
| `source/_data/image_credits.json` | 第三方横幅图片的署名信息 |
| `source/js/luomo-ui.js` | 阅读进度条、卡片柔光、`/` 快捷搜索、航行天数实时计算、Pjax 换页柔化与转场、深色模式圆形扩散、轻提示、本地预览时的访客统计标注，以及 Waline 人机验证框的清理补丁 |
| `source/js/luomo-reading.js` | 文章页：目录高亮纠正、航线填充、剩余阅读时间、小节链接、`J`/`K` 跳节 |
| `source/js/luomo-command.js` | 命令面板（`Ctrl/⌘ K`）、快捷键和 `?` 快捷键表 |
| `source/js/luomo-navigation.js` | 导航菜单与搜索的键盘操作和无障碍属性 |
| `source/js/luomo-theme.js` | 项目筛选和状态页检查 |

`source/_luomo/` 以下划线开头，Hexo 不会把它当作页面发布。`tools/check-site.cjs` 会检查每个样式文件都已合并进 bundle，并且没有被单独发布出去。

## 主题补丁

`themes/butterfly/` 是官方 `hexo-theme-butterfly@5.7.0` 的原版文件，只有以下改动。模板里打补丁的地方都留了 `//- luomo:` 注释，方便搜索：

| 文件 | 改动 | 原因 |
|---|---|---|
| `layout/includes/header/menu_item.pug` | 二级菜单的触发器从 `span` 改成 `button`，加上 `data-nav-toggle`、`aria-expanded`、`aria-controls`；接收 `menuScope` 参数生成唯一 ID | 键盘和读屏软件可以操作菜单，由 `luomo-navigation.js` 驱动 |
| `layout/includes/header/nav.pug` | 搜索按钮和手机菜单按钮改成 `button`；调用菜单时传入 `menuScope: 'desktop'`（因此去掉了这个 partial 的缓存） | 同上 |
| `layout/includes/sidebar.pug` | 调用菜单时传入 `menuScope: 'sidebar'` | 同上 |
| `layout/includes/header/index.pug` | 末尾引入 `image-credit.pug` | 第三方横幅图片显示署名 |
| `layout/includes/header/image-credit.pug` | 新增 | 同上 |
| `layout/includes/footer.pug` | 末尾加"图片来源"链接；页脚导航只有站外链接才新开标签页 | 链接到 `/image-credits/`；原版把站内链接也设成了新标签页 |
| `layout/image-credits.pug` | 新增 | 图片来源页的布局 |
| `source/img/wechat.jpg`、`alipay.jpg` | 新增 | 打赏二维码 |

## 文章页、命令面板与转场

**文章页（航海日志）**：横幅标题上方有「✦ 航海日志 · VOYAGE LOG」小标，日期、分类、字数、阅读时长、浏览量是一排玻璃胶囊。正文的二级标题前自动加衬线编号（01、02……）；作者已经自己写了编号的标题（如「1. 先吃个瓜」）由 `scripts/luomo-headings.js` 标记，不再重复编号，目录里也不再显示两遍。鼠标移到二级、三级标题上会出现 `#`，点一下复制本节链接。正文结尾有「✦ 本篇完 ✦」。

主题标签插件统一换成配色里的样式：`{% label %}` 是荧光笔划线，`{% btn %}` 是浅色票根按钮，`{% hideToggle %}` 是折页卡片，`{% timeline %}` 是渐变航线，代码块左上角是珊瑚/暮紫/天青三个圆点。颜色名（blue、green、orange……）映射到 `--lm-sky`、`--lm-moss`、`--lm-amber` 等令牌。

**目录**：画成一条航线，当前小节是发光的节点，渐变线填到当前位置，标题下显示「约 N 分钟读完」。主题原本用 IntersectionObserver 判断当前小节，只在标题穿过屏幕顶部一条窄带时更新，往回滚、拖滚动条或从目录跳转后高亮会停在错误的小节；`luomo-reading.js` 按位置重新计算并纠正。

**归档、标签、分类列表（航线日志）**：一条珊瑚→暮紫→天青的渐变航线，年份是大号衬线斜体，每篇文章是一张纸条目，日期用衬线斜体；悬停时条目右移、对应的航线节点亮起。三个页面共用主题的 `.article-sort` 结构，只改样式。

**结构化数据**：`_config.butterfly.yml` 里开启了主题自带的 `structured_data`，文章页输出 BlogPosting、其他页面输出 WebSite（JSON-LD），帮助搜索引擎理解标题、作者和日期。构建检查会确认它们存在。

**命令面板**：`Ctrl K`（Mac 上 `⌘ K`）或导航栏的指南针按钮打开。可以搜文章（标题、标签、分类和正文，数据来自 `/search.json`，第一次打开时才加载）、跳到页面（直接读导航菜单，改菜单不用改脚本）、跳到本文小节，或执行指令：切换深色、回到顶部、前往评论区、随机读一篇、复制链接、订阅 RSS。`↑` `↓` 选择，`Enter` 打开，`Esc` 关闭。

**快捷键**（在输入框里不会触发，按 `?` 查看）：

| 按键 | 作用 |
|---|---|
| `Ctrl/⌘ K` | 命令面板 |
| `/` | 站内全文搜索 |
| `G` 然后 `H` / `A` / `T` / `C` | 首页 / 归档 / 标签 / 分类 |
| `J` / `K` | 下一节 / 上一节（文章页） |
| `T` | 回到顶部 |
| `C` | 前往评论区 |
| `D` | 切换深色模式 |

**转场**（View Transitions，Chrome/Edge 和 Safari 18 以上；其他浏览器和"减少动态效果"时照常工作，只是没有动画）：切换深色模式时新配色从按钮处圆形扩散；Pjax 换页时旧页面淡出、新页面上浮，导航栏和右下角按钮保持不动；从首页卡片、侧栏、上一篇/下一篇点进文章时，标题会飞到文章横幅的位置。实现方式是把 Pjax 的 `switchSelectors()` 放进 `document.startViewTransition()`，出错时退回整页跳转。动画进行的约半秒里点击不会生效，这是浏览器 View Transitions 的行为。

## 访客星图（Vercel Web Analytics）

侧栏的「访客星图」是自己画的地球：经纬网、从星港（`widget.yml` 里的 `data-home`，默认辽宁）出发到各访客国家的航线弧光、按访客数缩放的光点；可以拖动旋转，悬停光点显示国家和人数，下方是前五名的排行。鼠标进入地球时暂停自转，移开后恢复；提示按当前投影重新定位，并限制在卡片内，拖动时收起。开启"减少动态效果"时停止自转和光点闪烁；卡片不在视口内或页面隐藏时暂停绘制。

世界大陆底图来自 Natural Earth 110m，经 `world-atlas` 转为 GeoJSON，使用 D3 正射投影绘制陆地填色与海岸线；地平线裁剪保证背面陆地不会穿透球体。地图与投影代码打包为本站 `/js/vendor/luomo-geo.min.js`，首次出现地球时才加载，PJAX 换页共用同一份资源。陆地离屏图层约每 64 毫秒更新一次，拖动、尺寸和主题变化会重绘，访客光点与航线仍独立绘制。

更新地图资源时运行 `pnpm run build:globe-map`，再运行正常构建。生成结果随源码提交；生产构建不联网拉取地图，也不需要重新打包。数据与依赖的完整许可在 `/js/vendor/luomo-geo.LICENSE.txt`；Natural Earth 为公有领域数据，底图只绘制自然海岸线。

数据流：浏览器请求 `/api/visitors` → 函数用服务器端令牌查询 Vercel 的 `GET /v1/query/web-analytics/visits/aggregate?by=country`（先查近 90 天，遇 HTTP 400 再依次尝试 30 天、7 天）→ 只把国家代码和访客数返回给浏览器。接口拒绝任何查询参数和 GET/HEAD 以外的方法，令牌和上游错误正文都不会出现在响应里。

`since`、`until` 使用完整 UTC ISO 时间，范围截止到请求时刻，包含当天已发生的访问；响应也返回相同时间范围和实际 `windowDays`。Vercel 的[官方接口说明](https://vercel.com/docs/rest-api/web-analytics/aggregates-page-views)将这两个参数定义为包含边界的日期时间，不能把 `until` 截成当天零点。有数据时 CDN 缓存 1 小时并允许后台刷新；空数据只缓存 60 秒，不启用过期内容复用。

**需要在 Vercel 里完成的配置**（都在 `hexo-nqq9` 项目里）：

1. **开启 Web Analytics**：项目页 → Analytics → Enable。开启后页面会给出一个本项目专用的脚本路径，形如 `/<一串字符>/script.js`。
2. **添加环境变量**（Settings → Environment Variables，环境选 Production）：
   - `VERCEL_WEB_ANALYTICS_SCRIPT`：上一步的脚本路径（以 `/` 开头、以 `.js` 结尾），构建时会注入到每个页面，开始收集访问数据。
   - `VERCEL_ANALYTICS_TOKEN`：在 Account Settings → Tokens 新建的访问令牌，Scope 选 `luomo66ccff's projects`，建议设置有效期并标记为 Sensitive。
   - `VERCEL_ANALYTICS_PROJECT`：`hexo-nqq9`（或项目 ID）。
   - `VERCEL_ANALYTICS_TEAM`：团队 ID（`team_` 开头，在团队 Settings → General 可以看到）。
3. **重新部署**一次。之后每有访客，数据会在 Vercel 里累计；首次数据可在空结果的 60 秒缓存过期、上游统计可查后显示，有数据后的更新按 1 小时缓存刷新。

状态：令牌或项目标识缺失时，接口返回 `unconfigured`，地球显示"访客星图 · 暂不可用"；配置了但查询失败（令牌过期、权限不对、超时）时返回 `unavailable`，地球显示"统计数据暂时取不到"，安全的 `reason` 错误码会返回浏览器并记录到函数日志。缺失或非数组的 `data`、带有错误信封的上游 JSON 返回 `upstream_invalid`，读取响应体超时保留 `upstream_timeout`，不会冒充正常零数据；合法空数组正常返回 `ok`。未知国家或缺失国家的行仍按现有归一化规则处理，不据此把整个响应判为错误。配置正常但还没有可展示的数据时显示"近期还没有访客数据"。

## 访客统计（不蒜子）

- 不蒜子按页面的域名分别计数：`blog.luomo.moe` 是本站当前的数据；迁移前的旧域名 `luomo.march7th.cn` 另有一份独立计数（约 182 访客 / 191 访问，迁移后已不再增长），两边无法合并。
- 在 `localhost`、`127.0.0.1` 等本地地址预览时，不蒜子返回的是全世界共用的 localhost 计数（数千万），并不是本站数据。`luomo-ui.js` 会在本地地址上把这些数字替换为「本地预览」，鼠标悬停有说明。
- 文章阅读量是按每篇文章的完整网址统计的：不蒜子的请求自己设置了 `referrerPolicy`，不受站点 `Referrer-Policy` 响应头影响。
- 自动化测试、截图会给线上计数加数，尽量对本地预览做测试。

## 第三方资源全部本站加载

- `CDN.third_party_provider: local` 加上插件 `hexo-butterfly-extjs`（主题作者官方维护，版本要和主题匹配）：主题用到的 Font Awesome、Fancybox、Pjax、Waline 客户端、KaTeX 等都从本站的 `/pluginsSrc/` 加载，页面不再依赖 jsDelivr。
- extjs 会把 `plugins.yml` 里列出的所有库都生成出来（包括没用到的 Twikoo、MathJax 等，约 11MB）。它们只会增加部署体积，不会被页面加载。
- 其他插件自己写死的 CDN 地址需要单独处理，目前只有 `hexo-tag-hint`，由 `scripts/luomo-local-assets.js` 改写。
- **升级主题时要同时升级 `hexo-butterfly-extjs`**，否则 `plugins.yml` 里的文件路径可能对不上。构建检查会核对页面引用的 `/pluginsSrc/` 文件都存在。

## 升级主题

1. 从 npm 下载新版 `hexo-theme-butterfly` 的压缩包，解压后整体替换 `themes/butterfly/`。
2. 把上面"主题补丁"表里的改动重新打上（新增的文件直接复制，修改的地方按注释找到对应位置）。
3. 对照新版 `themes/butterfly/_config.yml` 的更新说明，检查 `_config.butterfly.yml` 里有没有改名或删掉的键。
4. 如果主题的 `package.json` 里新增了依赖，在根目录 `package.json` 里也加上；同时把 `hexo-butterfly-extjs` 升到对应版本。
5. 运行下面的"验证"。`tools/check-site.cjs` 会检查首页入口区、横幅署名、图片来源页标题、访客地图等，结构变化导致这些东西消失时，构建会直接失败。

视觉层和脚本对主题结构有几处依赖，升级到 5.x 时已经改成同时兼容 4.13 和 5.x，以后再升级时可以优先检查这些地方：

- 文章卡片：5.x 多了一层 `.recent-post-items`，所以选择器写成 `#recent-posts .recent-post-item`（不用 `>`）。
- 首页入口区的插入点：5.x 的文章列表是 `class="recent-posts nc"`，`luomo-home.js` 用正则匹配。
- 判断文章页：4.13 用 `GLOBAL_CONFIG_SITE.isPost`，5.x 用 `pageType === 'post'`。
- 搜索输入框：4.13 是 `#local-search-input`，5.x 是 `.local-search-input`。
- 404：4.13 是 `.error404 #error-wrap`，5.x 是 `.type-404`。
- 上一篇/下一篇：5.x 是 `a.pagination-related`。
- 横幅地址：5.x 写成不带引号的 `url(...)`。

## 升级 Hexo

当前是 **Hexo 8.1**，需要 Node.js 20.19 以上（Vercel 的 20/22/24 都满足；Node 18 已不能用）。

1. `pnpm add hexo@^新版本`，同时看一眼 `hexo-generator-*`、`hexo-renderer-*` 有没有对应的新大版本。
2. 升级前后各构建一次（先 `pnpm run clean`），逐个对比 `public/` 里的文件。版本号、`orderby: random` 的侧栏标签云、音乐播放器的随机 id 会变，这些是正常的；文章正文、注音（`{文字|注音}`）、标签顺序不应该变。
3. 运行下面的"验证"。`tools/check-site.cjs` 会核对每篇文章的标签顺序和 front matter 一致。

Hexo 8 的两处输出变化：Open Graph 的 `article:tag` 改为按字母排序（Hexo 自己的改动，不影响页面显示）；文章列表、搜索索引、站点地图里标签和文章的先后取决于处理顺序，本来就不固定。

## 首页与侧栏布局

- **首页**（只在第一页）：横幅（标题下有刊号条）→「封面故事」（自动取最新一篇）→「星港入口」（4 个现有页面）→「最新手帐」文章列表（封面故事那篇不再重复）→「星港索引」（标签星云、航线归档、分类舱段）。文案、入口、标签配色、航行起始日都在 `source/_data/home.yml`；删掉 `gates` 下的内容即可隐藏入口区。
- **首页的版面平衡**：星港索引已经承担了标签、分类、归档的导航，最新文章也已在正文里，所以首页侧栏会隐藏这四张卡片，只留作者卡、公告、最新评论、网站资讯、访客地图，左右两栏高度大致相当。这些规则用 `#body-wrap:has(.lm-starmap)` 判断"是不是首页"，而不是给 `<body>` 加类名——Pjax 换页只替换 `#body-wrap`，`<body>` 上的类名会残留到别的页面。
- **其他页面的侧栏**：作者卡、公告，然后是会跟随滚动的一组卡片：最新文章、最新评论、标签、分类、归档、网站资讯、访客地图。这组卡片的顺序由 `_config.butterfly.yml` 里各卡片的 `sort_order`（1–6）和 `widget.yml` 的 `order: 7` 决定。
- **页脚**：`_config.butterfly.yml` 的 `footer.nav` 定义三栏链接，样式在 `20-chrome.css`。
- **最新评论**：5.x 里是 `aside.card_newest_comments`（4.13 是顶层的 `newest_comments`）；数据来自 Waline。
- **公告**：在 `_config.butterfly.yml` 的 `aside.card_announcement.content` 里写，支持 HTML。
- `sort_order` 会被编译进主题的 Stylus 样式。本地修改后要先 `pnpm run clean` 再构建，否则会继续用缓存的旧样式；Vercel 每次都是全新构建，不受影响。

## 常见修改

**换配色**：改 `00-tokens.css` 里 `:root`（浅色）和 `[data-theme="dark"]`（深色）两组值，再把主色同步到 `_config.butterfly.yml` 的 `theme_color`，以及 `source/tags/index.md` 的 `custom_colors`。

**加一张横幅**：
1. 把图片压成 WebP（大横幅宽 1920–2560px），放进 `source/img/banner/`。
2. 在 `_config.butterfly.yml` 里指向它（`index_img`、`default_top_img` 等），或者写在页面的 front matter `top_img` 里。
3. 在 `90-banners.css` 加一行焦点位置。`background-position` 的百分比越大，看到的越偏右（越偏下）；先用手机竖屏校准横向，再用桌面校准纵向。
4. 如果是别人的作品，在 `source/_data/image_credits.json` 里登记署名，否则构建检查会失败。

**加或改首页入口**：编辑 `source/_data/home.yml`，图标用 Font Awesome 6 的类名。

**加一种卡片动效**：把选择器加进 `70-motion.css` 的两个列表（入场动画、滚动浮现）。动画的填充模式要保持 `backwards`，否则动画结束后残留的 `transform` 会让里面的 fixed/sticky 元素（比如手机端目录）定位错乱。

**发布前**：改过样式或脚本以后，在 `_config.butterfly.yml` 的 `inject` 里把对应的 `?v=` 版本号更新一下，避免浏览器和 CDN 继续用旧缓存。

## 验证

```bash
pnpm run clean
pnpm run build   # 构建，并运行 tools/check-site.cjs
pnpm test        # 状态接口测试
pnpm run preview:local
```

视觉验收至少看以下几种情况：桌面 1440px、手机 390px、深色模式，以及首页、文章页、标签/分类/归档、友链、项目、状态、建站日志、404 这几类页面。
