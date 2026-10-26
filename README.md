# OrangeQi 知识库

一个以原生 HTML、CSS 和 JavaScript 编写的静态知识库，直接发布到 GitHub Pages。笔记以独立 HTML 文档维护，不依赖博客框架、内容管理框架或浏览器端运行时库。

## 本地预览

需要 Node.js 22 或更高版本，不需要安装 npm 依赖。

```bash
node scripts/build.mjs
node scripts/serve.mjs
```

打开 `http://127.0.0.1:4173/`。构建结果位于 `dist/`，该目录由脚本生成，不要手工编辑。

## 新增笔记

在 `notes/<主题 ID>/` 下创建完整的 HTML5 文档。主题 ID 必须来自 `data/topics.json`，笔记 head 至少提供以下元数据：

```html
<meta name="note:title" content="笔记标题">
<meta name="note:topic" content="chromium">
<meta name="note:date" content="2026-04-18">
<meta name="note:updated" content="2026-04-20">
<meta name="note:summary" content="简明说明笔记讨论的问题和结论。">
<meta name="note:tags" content="V8, JavaScript">
```

`note:date` 是原始记录日期；无法确认时可以留空。`note:updated` 是最近更新日期，必须填写。首页默认按更新日期排序，也可切换为记录日期或标题排序。在正文中使用 `<article class="note-content">`、语义化标题和带语言标记的代码块。`note:tags` 与 `note:featured` 是可选字段。资源使用 `/assets/...` 地址；笔记保存后重新运行构建，索引、全文搜索和兼容旧笔记地址会自动生成。

## 目录

- `index.html`：首页和笔记浏览界面。
- `notes/`：可独立访问的 HTML 笔记。
- `data/topics.json`：学科与主题的唯一清单；金融与商业等零笔记主题保持真实空状态。
- `assets/`：站点样式、交互脚本和图片资源。
- `scripts/build.mjs`：校验元数据、构建搜索索引、旧路径重定向和静态发布目录。
- `scripts/serve.mjs`：用于本地验收的 Node.js 静态 HTTP 服务。
- `AGENTS.md`：设计、内容和部署维护规范。

推送到 `master` 后，GitHub Actions 会构建并发布 `dist/` 到 GitHub Pages。
