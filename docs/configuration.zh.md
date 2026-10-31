---
title: 配置
order: 20
---

# 配置

主题通过 [Vited Core](https://github.com/vitedjs/core) 的 `docs` 选项进行配置，
没有主题专属的选项。

```ts
import { defineConfig } from '@vited/core';

export default defineConfig({
  docs: {
    title: 'My Cool Library',
    description: 'Documentation for My Cool Library',
    supportedLocales: ['en', 'zh'],
    theme: '@vited/theme-material',
  },
});
```

## 标题、描述和网站图标

`title` 和 `description` 显示在应用栏中，旁边是 Vited 从文档目录中发现的网站图标。

## 多语言

当 `supportedLocales` 包含多个语言时，应用栏会显示语言选择器，界面文本（搜索、
导航、色彩模式切换）会在内置的英文和简体中文翻译之间切换。

## 搜索

搜索弹窗会索引当前语言下每个页面的标题和内容，支持模糊匹配，包括中文文本。
使用搜索按钮或 `Ctrl+K` / `⌘K` 打开，用方向键在结果间移动，按 `Enter` 确认。

## 色彩模式

在用户通过应用栏按钮选择明暗模式之前，主题跟随系统色彩方案。用户的显式选择会
持久化到 `localStorage`，并通过 MUI 主题调色板应用，因此所有 Material UI 组件
都会自动适配。

## 项目链接

当传给主题的 `package.json` 包含 GitHub `repository` URL 或 `funding` URL 时，
对应的链接会以图标按钮的形式显示在应用栏中。

## 代码高亮

代码块使用 Shiki 的 GitHub 明暗双主题进行高亮。预加载语言：`bash`、`css`、
`diff`、`html`、`javascript`、`json`、`jsx`、`markdown`、`mdx`、`shellscript`、
`typescript`、`tsx` 和 `yaml`；其他语言回退为纯文本。
