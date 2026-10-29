# OrangeQi 知识库协作约定

## 项目目标

这是 OrangeQi 的个人知识库。它是一个可直接托管于 GitHub Pages 的静态网站，不是博客，也不使用博客框架、前端框架、Markdown 内容系统或运行时依赖。站点源文件使用原生 HTML、CSS 和少量原生 JavaScript；笔记正文直接写 HTML。

知识库围绕三个学科长期整理，每个主题未来都可能积累数十篇笔记：

1. **计算机技术**：按以下顺序组织：Chromium 架构与内核、AI 安全、操作系统应用、C++ 与 Rust 语法、大模型算法和 Agent 框架。算法竞赛、开发工具、工程实践等已有内容可以放在明确标识的补充归档区，不能为了贴合新目录而删除旧笔记。
2. **AI 创作**：按以下顺序组织：Web 前端、AI 视频、AI 剪辑、AI 游戏。
3. **金融与商业**：暂时置空，明确展示为待整理领域，不要生成虚构笔记或填充假数据。

主题分类由 `data/topics.json` 维护。顺序即界面展示顺序。零篇笔记是有效状态：所有主题都应可导航，空主题显示清晰的空状态，不能隐藏或伪造计数。

## 目录约定

- `index.html`：笔记库首页，含学科导航、搜索、主题筛选、笔记索引和精选笔记。
- `assets/site.css`：全站样式与响应式布局。
- `assets/app.js`：不依赖框架的浏览器交互，如索引筛选、搜索、排序和主题切换。
- `data/topics.json`：三大学科及其主题的唯一分类清单。
- `notes/<主题 ID>/*.html`：独立笔记源文件。每篇笔记都是完整、语义化、可独立阅读的 HTML 文档；作者直接维护 HTML，不编辑构建产物。
- `scripts/build.mjs`：只使用 Node.js 内置模块扫描笔记、校验元信息、生成搜索索引和旧地址重定向，并复制静态站点到发布目录。
- `scripts/serve.mjs`：只使用 Node.js 内置模块提供发布目录的本地预览服务。
- `.github/workflows/deploy.yml`：推送 `master` 后直接构建并部署静态站点，不安装 npm 包。
- `.github/dependabot.yml`：仅更新 GitHub Actions；本项目不依赖 npm 包。
- `README.md`：面向维护者的简明项目入口与写笔记说明。

## 新增或修改笔记

每篇笔记保存为 `notes/<稳定且唯一的文件名>.html`，使用标准 HTML5 文档，语言设为 `zh-CN`。head 至少包含：

- `<title>`：完整笔记标题。
- `<meta name="note:title" content="...">`：索引标题。
- `<meta name="note:topic" content="topic-id">`：必须引用 `data/topics.json` 中已经存在的主题 ID。
- `<meta name="note:date" content="YYYY-MM-DD">`：原始记录日期；来源无法确认时可留空，不得猜填。
- `<meta name="note:updated" content="YYYY-MM-DD">`：最近更新日期，必须填写。
- `<meta name="note:summary" content="...">`：简明摘要，供首页列表和搜索结果使用。
- `<meta name="note:tags" content="tag-one, tag-two">`：可选，逗号分隔。
- `<meta name="note:featured" content="true">`：可选；如需替换首页精选笔记。
- `<meta name="description" content="...">`、viewport，以及站点共享资源的根路径引用（例如 `/assets/site.css`）。

正文放在 `<main class="note-page"><article class="note-content">...</article></main>`。标题层级从正文 h1 开始，随后按顺序使用 h2/h3；代码放进带语言类名的 `<pre><code>`，表格提供表头，图片提供准确的 alt 文本。编写时使用语义元素，不要复制首页、列表卡片或其他笔记的整套外壳。若迁移自旧地址，可用可选的 `<meta name="note:path" content="旧的/笔记路径.html">` 声明旧路径，构建器会生成重定向。

首页默认按最近更新日期倒序，另可按记录日期或标题排序；列表和笔记页分别显示更新日期与记录日期。来源不明的记录日期显示为“未注明”。保存后运行 `node scripts/build.mjs`。构建器扫描 `notes/` 下的 HTML 文档，首页搜索使用生成的 `dist/data/notes.json`；应验证新笔记出现在正确主题且正文可访问。索引、旧路径重定向和发布产物是生成文件，不手动维护。

## 视觉与交互原则

- 同时以桌面浏览器和手机浏览器为目标。桌面端使用有层次的导航、可扫描的索引和足够宽的阅读栏；手机端单列排布，筛选可触控并能横向滚动，正文、代码和表格不能造成页面横向溢出。
- 搜索、分类、排序、主题切换和笔记链接都必须实际工作，并可使用键盘操作；为表单控件提供可访问名称，为图标按钮提供标签。
- 延续知识库的安静、清晰、长期可阅读气质：中性浅色纸面、墨色正文、少量绿色强调。避免营销落地页、空泛口号、大面积装饰性卡片和单一色相铺满全页。
- 正文宽度、字号、行高、标题层级、引用、表格和代码块优先服务长时间阅读；所有视口均需检查换行、溢出、重叠和触控区域。
- 使用 CSS 自适应布局和断点，不按视口宽度缩放字号。保留 `prefers-reduced-motion` 和系统深色模式支持。

## 验证、提交与部署（强制）

**每次完成一项用户要求的修改，都必须将改动提交并推送到远端，然后从已部署的网站实际确认结果符合预期。只看本地文件、GitHub Actions 绿灯或部署 API 状态不算线上验收。**

1. 检查改动和工作区，运行 `node scripts/build.mjs`，确认所有笔记元信息有效、链接和生成索引正常。
2. 在本地以 HTTP 服务打开 `dist/`，检查首页和至少一篇笔记；桌面和窄屏都要检查，搜索、主题筛选及排序要实测。
3. 运行 `git diff --check` 及适用的 HTML/CSS/JavaScript 检查。修复构建或验收中发现的问题。
4. 明确只暂存本任务相关文件，提交改动并推送当前发布分支；绝不覆盖、丢弃或重置用户已有的工作。
5. 等待对应 GitHub Actions / Pages 部署完成。通过 GitHub Pages URL 直接访问首页和至少一篇笔记，检查响应状态、标题、实际内容、资源加载及刚改的功能；若部署未完成或线上内容不符，继续诊断修复，不能宣称完成。
6. 最终说明推送提交、线上检查过的 URL 和实际验证结果。不得将“已推送”说成“已部署成功”，除非已完成线上检查。

网站域名是 `https://orangeqi-cq.github.io/`。远端 `origin` 的发布分支为 `master`。
