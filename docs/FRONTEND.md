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
| `40-article.css` | 文章、页面、归档的纸面容器和正文排版，标签胶囊 |
| `50-aside.css` | 侧栏卡片、作者卡、公告、最新评论、目录、访客地图 |
| `60-pages.css` | 项目档案、云服务面板/状态页、建站日志、友链、404。这些类名在 `source/*/index.md` 里直接使用 |
| `70-motion.css` | 入场动画、滚动浮现、阅读进度条、卡片柔光、Pjax 换页柔化、标题随滚动淡出、"减少动态效果"处理 |
| `90-banners.css` | 每张横幅的焦点位置 |
| `95-image-credits.css` | 横幅署名标签和图片来源页 |
| `scripts/luomo-styles.js` | 构建时按文件名顺序合并以上文件，输出 `/css/luomo-theme.css` |
| `scripts/luomo-home.js` | 构建时组装首页第一页：刊号条、封面故事、星港入口、「最新手帐」标题、星港索引，不改主题模板 |
| `scripts/luomo-local-assets.js` | 把 `hexo-tag-hint` 的样式改成从本站加载 |
| `source/_data/home.yml` | 首页各区块的文案、入口链接、标签配色和航行起始日 |
| `source/_data/widget.yml` | 侧栏自定义小组件（目前是 MapMyVisitors 访客地图） |
| `source/_data/image_credits.json` | 第三方横幅图片的署名信息 |
| `source/js/luomo-ui.js` | 阅读进度条、卡片柔光、`/` 快捷搜索、航行天数实时计算、Pjax 换页柔化、本地预览时的访客统计标注，以及 Waline 人机验证框的清理补丁 |
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
