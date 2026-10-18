 # Luomoの云日常

 洛墨的个人博客，基于 **Hexo + Butterfly** 构建。

 记录技术、AI、服务器、游戏、音乐与生活。

 ## 技术栈

 - [Hexo](https://hexo.io/) 7.x — 静态博客生成器
 - [Butterfly](https://github.com/jerryc127/hexo-theme-butterfly) 5.7 — 主题（官方原版加少量补丁，站点配置在 `_config.butterfly.yml`）
 - [pnpm](https://pnpm.io/) — 包管理器
 - [Vercel](https://vercel.com/) — 托管与部署
 - Markdown / KaTeX / APlayer / Bilibili tag 等

 ## 本地运行

 ```bash
 pnpm install
 pnpm run server
 ```

 然后访问 http://localhost:4000 即可。

 ## 构建

 ```bash
 pnpm run build
 ```

 生成静态文件到 `public/` 目录。

 ## 部署说明

 本博客使用 **Vercel** 自动构建部署。

 - 推送 main 分支后，Vercel 会自动触发构建。
 - 不建议再使用 `hexo deploy` 命令推送。

 ## 域名说明

 | 域名 | 说明 |
 |------|------|
 | https://blog.luomo.moe | 博客正式主域名 |
 | https://luomo.march7th.cn | 旧入口（历史兼容） |
 | https://hexo-nqq9.vercel.app | Vercel 默认域名 |

 > 注意：luomo.moe 不用于本博客跳转，未来可用于个人主页或导航站。
 > 修改域名后需要在 Vercel Domains 页面添加域名并等待 SSL 证书签发完成。

 ## 注意事项

 - 不要提交 `node_modules/`、`public/`、`db.json`、日志文件
 - 不要提交真实 token、appSecret 等敏感凭据
 - 修改文章后需重新构建（Vercel 自动触发）

 ## 后续规划

 - 新增专栏页面：云日常、AI 手记、游戏星海、实验室
 - 完善站点搜索与导航体验
 - 持续优化移动端性能

## AI 协作

- [Codex](https://github.com/codex)（[OpenAI](https://openai.com/codex/)）：协助文章撰写、代码修改、站点检查和部署验证。

## 美化说明

当前视觉层是「星港手帐」：暖白纸面配淡方格纹，珊瑚红、暮紫、天青三色点缀，横幅底部渐隐融进纸面，支持深色模式和"减少动态效果"。

- 样式分模块写在 `source/_luomo/styles/`，构建时由 `scripts/luomo-styles.js` 合并成 `/css/luomo-theme.css`
- 交互脚本：`source/js/luomo-ui.js`（阅读进度条）、`luomo-navigation.js`（菜单与搜索的无障碍操作）、`luomo-theme.js`（项目筛选与状态页）
- 设计说明、文件分工和常见修改方法见 [docs/FRONTEND.md](docs/FRONTEND.md)
