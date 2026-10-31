---
title: 安装
order: 10
---

# 安装

将主题与 Vited 的核心和 CLI 一起安装：

```bash
pnpm add -D @vited/core @vited/cli @vited/theme-material
```

然后在 `vited.config.ts` 中选择主题：

```ts
import { defineConfig } from '@vited/core';

export default defineConfig({
  docs: {
    title: 'My Cool Library',
    theme: '@vited/theme-material',
  },
});
```

在 `package.json` 中添加用于开发和构建文档站点的脚本：

```json
{
  "scripts": {
    "docs:build": "vited build",
    "docs:dev": "vited dev"
  }
}
```

运行 `pnpm docs:dev` 启动开发服务器，运行 `pnpm docs:build` 将静态站点输出到
`docs_dist/`。
