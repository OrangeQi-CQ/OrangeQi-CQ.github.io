# OrangeQi 的知识库

基于 [Quartz 5](https://quartz.jzhao.xyz/) 构建的个人数字花园，承载多学科知识笔记。

## 本地开发

```bash
# 安装依赖
npm install

# 安装插件
npx quartz plugin install --from-config

# 本地预览
npx quartz build --serve
```

站点运行在 http://localhost:8080

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

## 内容结构

笔记存放在 `content/` 目录，按学科分类：

- `AI 算法/` — 大模型、推理、算法设计
- `C++ 语法/` — 语言核心、STL、类型系统
- `Linux 内核/` — 并发、内存管理、内核机制
- `算法竞赛/` — LeetCode、博弈论、数据结构
- `应用开发/` — 框架原理、工程实践
- `开发工具/` — Git、构建系统、效率工具

笔记使用 Markdown 编写，支持双向链接 `[[笔记名]]`、数学公式、代码高亮等。
