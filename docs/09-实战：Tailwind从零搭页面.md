# 第 09 章 · 实战：用 Tailwind 从零搭一个响应式页面

> 本章解决一个问题：**把前 8 章学的 Flexbox、Grid、响应式、Tailwind 原子类，拼成一个真实、可运行、响应式的完整页面。**
>
> 本章你需要记住的就一件事：**用 Tailwind 搭页面，思路和手写 CSS 完全一样——先想"骨架"（二维关系，用 Grid），再填"细节"（一维排列，用 Flex），最后加"响应式"（移动优先，`md:` 前缀往上增强）。Tailwind 只改变了"写法"，没改变"想问题的方式"。**
>
> 配套项目：[`examples/09-tailwind-demo/`](../examples/09-tailwind-demo/)——这是本教程**唯一需要 `npm install` 的地方**（Tailwind 是第三方依赖）。跑起来的方式：

```bash
cd examples/09-tailwind-demo
npm install          # 装 tailwindcss v3.4
npm run build        # 编译出 dist/output.css
# 然后用浏览器打开 index.html
```

---

## 9.1 需求拆解：先想清楚"要搭什么"

**先给结论：动手写代码之前，先用第 06 章的框架问自己一遍"哪是骨架、哪是细节"，这一步决定了后面所有类的选型。**

### 9.1.1 我们要搭的页面

一个典型的产品后台（Dashboard）页面，包含四块：

1. **顶部导航栏**：Logo 在左，通知 + 用户头像在右。
2. **左侧边栏**：导航菜单（仪表盘 / 订单 / 客户 / 报表 / 设置）。
3. **主内容区**：上面一排**统计卡片**（收入、订单、用户、转化率），下面一排**内容卡片**（图表占位 + 最近订单列表）。
4. **页脚**：版权信息。

### 9.1.2 布局骨架图

把页面画成 ASCII 图（这就是"二维关系"的直观表达）：

```text
┌─────────────────────────────────────────────┐
│ 导航栏 header（横跨整行）                       │
├──────────┬──────────────────────────────────┤
│ 侧边栏    │ 主内容 main                        │
│ aside    │  ├─ 统计卡片 ×4 ──┐                │
│ (240px)  │  ├─ 内容卡片 ×2 ──┤                │
│          │  │  （卡片网格）    │                │
├──────────┴──────────────────────────────────┤
│ 页脚 footer（横跨整行）                        │
└─────────────────────────────────────────────┘
```

### 9.1.3 用"第 06 章框架"做选型

第 06 章的核心结论是：**二维的"骨架"用 Grid，一维的"细节"用 Flex。**

套到这个页面：

| 区域 | 是几维问题？ | 用什么 | 为什么 |
|---|---|---|---|
| **整体骨架**（导航/侧栏/内容/页脚） | 二维（行列交错） | **Grid** | 需要"侧边栏定宽 + 内容自适应 + 页脚跨两列"这种行列关系 |
| **导航栏内部**（logo 左、头像右） | 一维（一行内） | **Flex** | `justify-between` 一句搞定首尾贴边 |
| **侧边栏菜单**（纵向堆叠） | 一维（一列内） | **Flex** | `flex-col` 纵向排列 |
| **统计卡片**（4 个排一排） | 一维但会换行 | **Grid** | `grid-cols-4` 自动等分，且响应式改列数比 Flex 更顺手 |
| **页脚**（左版权、右版本号） | 一维（一行内） | **Flex** | `justify-between` |

**这张表就是本章的"作战地图"。** 你会在 9.3、9.4 节看到它一步步变成代码。

### 9.1.4 响应式策略

移动优先，三个断点：

- **手机（默认）**：侧边栏隐藏（汉堡菜单）、统计卡片单列、导航栏纵向。
- **`sm:`（≥640px）**：统计卡片两列。
- **`lg:`（≥1024px）**：侧边栏出现（固定 240px）、统计卡片四列。

> 一句话记住它：**搭页面前先画 ASCII 骨架图，再用"二维用 Grid、一维用 Flex"给每个区域定性。这 5 分钟的画图，省掉后面 2 小时的返工。**

### 9.1.5 为什么选"后台 Dashboard"而不是"落地页"做实战

你可能好奇：教程不是一直说"落地页"吗，怎么实战搭了个后台？

**因为后台 Dashboard 是"布局难度"最浓缩的场景**，它一次性能覆盖：

1. **侧边栏 + 内容区**：二维分栏，逼你用 Grid（落地页没有侧边栏，容易全用 Flex 糊过去）。
2. **卡片网格**：统计卡片、内容卡片，练 Grid 的响应式改列数。
3. **跨列**：图表卡 `col-span-2`，练 Grid 的"占多格"。
4. **响应式的形态切换**：侧边栏在移动端隐藏，练 `hidden lg:flex` 这类"一个类切换显示方式"。

**落地页反而更简单**（纯上下堆叠，`flex flex-col` 就够），适合你搭完后台后自己扩展练习。这也是为什么 9.6.4 会专门对比"后台骨架 vs 落地页骨架"。

> 一句话记住它：**实战选最"浓缩布局知识点"的场景（后台有侧栏 + 卡片 + 跨列 + 响应式切换），而不是最简单的场景。学会难的，简单的是它的特例。**

---

## 9.2 环境搭建：Tailwind 的构建版

**先给结论：生产用 Tailwind 是"构建版"——你写类名，CLI 扫描后编译出一份只包含你用到的类的 CSS。这和第 08 章演示用的 CDN 版是两回事：CDN 是运行时现场生成的，只配演示；构建版是编译时静态生成的，才配生产。**

先看两种引入方式的对比：

| | CDN 版（第 08 章演示页） | 构建版（本章项目） |
|---|---|---|
| 引入方式 | `<script src="https://cdn.tailwindcss.com"></script>` | `npm install` + CLI 编译 |
| 生成时机 | **运行时**：浏览器加载页面后，用 JS 现场生成 CSS | **编译时**：构建阶段静态生成 CSS 文件 |
| 性能 | 差（页面加载要跑一段 JS 才出样式，白屏） | 好（CSS 是现成文件，浏览器直接解析） |
| 体积 | 大（要带一整套 JIT 引擎） | 小（只含用到的类） |
| 适用场景 | **本地演示、学习、原型** | **生产项目** |

**为什么 CDN 版不能上生产？** 因为它把"生成 CSS"这件事推迟到了浏览器运行时——用户打开页面的瞬间，要先下载并执行 Tailwind 的 JIT 引擎，引擎再扫描页面、现场拼出 CSS，然后才渲染出样式。**这期间用户看到的是"无样式的白页"**，网络越慢越明显。构建版则把这件事在开发机上一次做完，产出静态 CSS，浏览器零负担。

**所以本教程的定位很明确**：第 08 章的 `08-Tailwind.html` 用 CDN 是为了让你"零构建、双击即看"地感受类名效果；本章用构建版是为了让你学会"生产里真正在用的方式"。

### 9.2.1 初始化项目

```bash
mkdir 09-tailwind-demo
cd 09-tailwind-demo
npm init -y
npm install -D tailwindcss@3.4
```

装完后的 `package.json`（关键部分）：

```json
{
  "name": "09-tailwind-demo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tailwindcss -i ./src/input.css -o ./dist/output.css",
    "watch": "tailwindcss -i ./src/input.css -o ./dist/output.css --watch",
    "build:min": "tailwindcss -i ./src/input.css -o ./dist/output.css --minify"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0"
  }
}
```

**三个 script 的作用**：

- `build`：一次性编译（`-i` 输入，`-o` 输出）。
- `watch`：监听文件变化，保存即重编译（开发时用）。
- `build:min`：加 `--minify` 压缩，生产发布用（CSS 体积能小一半）。

### 9.2.2 生成配置文件

```bash
npx tailwindcss init
```

生成 `tailwind.config.js`，改 `content` 让它扫描 `index.html`：

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{html,js}"],
  darkMode: 'class',   // 手动切换暗色（第 8.5.4 讲过两种策略）
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};
```

**为什么要配 `content`？** 第 8.6.1 讲过：Tailwind 只编译"出现在 `content` 路径文件里"的类。这里我们把 `./index.html` 和 `./src/**/*.{html,js}` 都列进去，保证页面里的类名被扫到。

**为什么 `brand` 要按 `50~700` 的梯度定义，而不是只定义一两个？** 第 8.6.2 讲过：你迟早需要"浅色版（背景）"和"深色版（hover）"。本章页面里，图表柱子就用了 `bg-brand-100` 到 `bg-brand-700` 一整串梯度做"由浅到深"的渐变效果——如果当初只定义了一个 `brand-500`，这段图表就写不出来。**按梯度定义令牌，是"用的时候才知道缺"的最佳预防。**

> **v3/v4 差异**：v4 自动检测内容，不需要 `content`；v3.4 必须手动配，漏配 = 样式消失。

### 9.2.3 写输入 CSS

`src/input.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 组件层：抽复用组件（第 8.6.3 讲的 @apply） */
@layer components {
  .nav-link {
    @apply flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900;
  }
  .nav-link-active {
    @apply flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-50 text-brand-600 font-medium;
  }
  .stat-card {
    @apply p-5 bg-white rounded-xl border border-gray-200 shadow-sm;
  }
}
```

**为什么把 `.nav-link`、`.stat-card` 放进 `@layer components`？** 第 8.6.4 讲过：放进 layer，原子类才能覆盖它们。而且这几个是"高频复用 + 语义稳定"的组合，符合第 8.6.3 的 `@apply` 使用标准。

### 9.2.4 构建与验证

```bash
npm run build
```

成功后会输出：

```text
Rebuilding...
Done in 384ms.
```

并在 `dist/output.css` 里生成编译结果。你可以打开它确认两件事：

1. 里面**有** `index.html` 用到的类（比如 `.grid`、`.bg-white`）。
2. 里面**没有**你没用过的类（比如你没用 `bg-purple-500`，就搜不到它）——这正是 Tailwind 体积小的秘密。

**一个常见的"翻车现场"**：第一次跑完 `npm run build`，`dist/output.css` 几乎为空，页面一片白。原因十有八九是 `content` 路径没配对，Tailwind 没扫到 `index.html`。排查顺序：先检查 `content` 数组 → 再检查 `index.html` 是否在项目根目录 → 最后确认类名拼写没错。

### 9.2.5 最终的项目目录结构

搭完环境后，整个项目长这样：

```text
09-tailwind-demo/
├── package.json          # 依赖 + 构建脚本
├── package-lock.json     # 锁定依赖版本（npm install 自动生成）
├── tailwind.config.js    # Tailwind 配置（content + 自定义令牌）
├── src/
│   └── input.css         # 输入：@tailwind 指令 + @apply 组件
├── index.html            # 页面（写 Tailwind 类名的地方）
└── dist/
    └── output.css        # 输出：编译后的 CSS（npm run build 生成）
```

**注意 `src/` 和 `dist/` 的分工**：`src/input.css` 是"你写的源文件"（只有几行 `@tailwind` 指令 + `@apply` 组件），`dist/output.css` 是"机器生成的产物"（几千行编译结果）。**你永远只改 `src` 和 `index.html`，永远不手改 `dist/output.css`**——它每次 `npm run build` 都会被重新覆盖。

### 9.2.6 构建报错排查表

| 现象 | 原因 | 解决 |
|---|---|---|
| `npm run build` 报 `tailwindcss: command not found` | 依赖没装或没装在项目里 | `npm install` 重跑一遍 |
| `output.css` 几乎是空的 | `content` 路径没配对，没扫到 `index.html` | 检查 `content` 数组，加上 `./index.html` |
| 某些类生效、某些类不生效 | 不生效的类名拼错，或用了动态拼接 | 检查拼写；动态拼接改用完整字符串或 `clsx` |
| `@apply` 报 `class does not exist` | 在 `@apply` 里引用了没定义/没安装的类 | 确认类名正确，且在 `content` 范围内 |
| 页面有样式但和预期不一样 | 优先级问题（`@layer`）或类名冲突 | 检查自定义类是否放进 `@layer components` |

> 一句话记住它：**生产用构建版（`npx tailwindcss -i input -o output`），CDN 只配演示。`content` 配错是"页面没样式"的头号元凶，先查它。你只改 `src` 和 `index.html`，`dist/output.css` 是机器生成、每次构建覆盖的产物。**

---

## 9.3 布局骨架：把 `grid-template-areas` 思维映射到 Tailwind

**先给结论：Tailwind 没有直接的 `grid-template-areas` 类，但你可以用 `grid-cols` + `col-span` 组合出完全等价的效果。这一节就是把第 04/05 章的"命名区域"思维，"翻译"成 Tailwind 类。**

### 9.3.1 先回忆原生 Grid 怎么写这个骨架

如果手写原生 CSS，你会用 `grid-template-areas`（第 05 章）：

```css
.layout {
  display: grid;
  grid-template-columns: 16rem 1fr;   /* 侧栏 256px + 内容自适应 */
  grid-template-rows: auto 1fr auto;  /* 导航自适应 + 内容撑满 + 页脚自适应 */
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
}
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

```html
<div class="layout">
  <header class="header">导航栏</header>
  <aside class="sidebar">侧边栏</aside>
  <main class="main">内容</main>
  <footer class="footer">页脚</footer>
</div>
```

### 9.3.2 Tailwind 版：用 `col-span` 替代 `grid-area`

Tailwind 的思路是：**不命名区域，直接描述每个元素"占几列"**。`header` 和 `footer` 跨两列（`col-span-2`），`aside` 和 `main` 各占一列：

```html
<div class="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto]">
  <header class="lg:col-span-2 bg-white border-b border-gray-200">导航栏</header>
  <aside class="hidden lg:block bg-white border-r border-gray-200">侧边栏</aside>
  <main class="bg-gray-50">内容</main>
  <footer class="lg:col-span-2 bg-white border-t border-gray-200">页脚</footer>
</div>
```

**逐段解释这个骨架类**：

| 类 | 作用 | 等价原生 CSS |
|---|---|---|
| `min-h-screen` | 容器至少占满一屏高 | `min-height: 100vh` |
| `grid` | 开启 Grid | `display: grid` |
| `grid-cols-1` | 移动端单列 | `grid-template-columns: repeat(1, minmax(0,1fr))` |
| `lg:grid-cols-[16rem_1fr]` | ≥1024px 变成"侧栏 256px + 内容 1fr" | `@media (min-width:1024px){ grid-template-columns: 16rem 1fr }` |
| `grid-rows-[auto_1fr_auto]` | 三行：上下自适应、中间撑满 | `grid-template-rows: auto 1fr auto` |
| `lg:col-span-2` | 导航/页脚跨两列 | `grid-column: span 2 / span 2` |
| `hidden lg:block` | 侧栏移动端隐藏、桌面端显示 | `display:none` → `@media{display:block}` |

### 9.3.3 关于 `lg:grid-cols-[16rem_1fr]` 里的任意值

你可能注意到这里用了任意值 `[16rem_1fr]`。第 8.4 节说过"任意值要克制"，这里是个**合理的例外**，因为"侧边栏固定宽 + 内容自适应"这个布局意图，Tailwind 默认类里没有对应项（没有 `grid-cols-sidebar` 这种类）。

**如果你不想用任意值，更规范的做法是注册成令牌**：

```js
// tailwind.config.js
theme: {
  extend: {
    gridTemplateColumns: {
      "app": "16rem 1fr",   // 注册一个"应用骨架"的列模板
    },
  },
},
```

```html
<!-- 之后就能用语义化的类名替代任意值 -->
<div class="lg:grid-cols-app">
```

本教程的示例项目里，我**故意保留了任意值写法**，是想让你看到：**任意值不是洪水猛兽，在"表达一次性的、特殊的布局结构"时它是合理的**。但当这个结构在项目里反复出现时，就该升级成注册令牌。

### 9.3.4 为什么"移动端单列、桌面端两列"，侧边栏在移动端就没了

注意 `aside` 是 `hidden lg:block`——移动端它直接 `display: none`。这是后台页面的标准做法：**移动端空间有限，侧边栏变成"汉堡菜单"（点击弹出），而不是硬塞进主布局。**

这带来一个 Grid 放置上的细节：

```text
移动端（grid-cols-1，单列）：
  header（一行）
  aside  （hidden，不占位）
  main  （一行）
  footer（一行）
  → 垂直堆叠：导航 / 内容 / 页脚，正是手机上的样子 ✓

桌面端（lg:grid-cols-[16rem_1fr]，两列）：
  header（col-span-2，占满第一行）
  aside （左列）   main（右列）   ← 第二行
  footer（col-span-2，占满第三行）
  → 经典后台布局 ✓
```

**这就是"一份 HTML，两种布局"**——不写两套结构，靠 Grid 的自动放置 + 响应式前缀完成形态切换。这是本章骨架的核心思想。

### 9.3.5 骨架的两种实现：Grid vs 嵌套 Flex

你可能想：**"这个后台骨架，用 Flex 套 Flex 不也能做吗？为什么要用 Grid？"** 能，而且很多老项目就是 Flex 套出来的。把两种写法并排看，差异就清楚了：

```html
<!-- 方案 A：Grid（本教程采用）—— 骨架是"一个二维网格" -->
<div class="grid grid-cols-1 lg:grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto]">
  <header class="lg:col-span-2">…</header>
  <aside class="hidden lg:block">…</aside>
  <main>…</main>
  <footer class="lg:col-span-2">…</footer>
</div>

<!-- 方案 B：嵌套 Flex —— 骨架是"一个大 Flex 里套两个 Flex" -->
<div class="flex flex-col lg:flex-row min-h-screen">
  <header class="lg:hidden">…</header>          <!-- 移动端：导航在顶部 -->
  <aside class="hidden lg:flex lg:w-64 lg:flex-col">…</aside>  <!-- 桌面端：侧栏在左 -->
  <div class="flex-1 flex flex-col">
    <header class="hidden lg:flex">…</header>   <!-- 桌面端：导航在内容区顶部 -->
    <main class="flex-1">…</main>
    <footer>…</footer>
  </div>
</div>
```

**看出差别了吗？** 方案 B 的导航栏出现了**两次**（移动端一次、桌面端一次），因为"移动端导航在顶、桌面端导航在侧栏右侧"这个形态差异，嵌套 Flex 没法用一份 header 表达，只能复制。而方案 A 里 header 只有一份，靠 `lg:col-span-2` 切换它"跨不跨两列"。

**这就是"二维问题用 Grid"的深层含义**：当布局在响应式下会**改换行列结构**（单列堆叠 ↔ 两列并排）时，Grid 的"格子"模型能一份结构走天下；Flex 的一维模型则可能逼你"拆成多份、各写各的"。

### 9.3.6 为什么 `grid-rows-[auto_1fr_auto]` 而不是 `grid-rows-3`

你可能看到 `grid-rows-3` 也能"分三行"，为什么这里要用 `auto_1fr_auto`？

```html
<!-- ❌ grid-rows-3：三行等高（每行 1/3 屏高），导航和页脚被撑得很高 -->
<div class="grid grid-rows-3">

<!-- ✅ auto_1fr_auto：上下行按内容自适应，中间行吃满剩余 -->
<div class="grid grid-rows-[auto_1fr_auto]">
```

**区别**：`grid-rows-3` 编译成 `repeat(3, minmax(0, 1fr))`——三行**等高**。而我们要的是"导航栏和页脚各自只有 64px 高，内容区把剩下的都吃掉"。`auto 1fr auto` 的语义正好是这个：`auto` = 按内容高度，`1fr` = 吃满剩余空间。

**这正是第 04 章 `fr` 单位的心智**：`1fr` 不是"一行"，是"一份剩余空间"。`auto 1fr auto` 读作"上下按内容、中间分走剩余全部"。

> 一句话记住它：**Tailwind 用 `grid-cols` + `col-span` 替代了 `grid-template-areas`：不命名区域，直接描述"几列 + 跨几列"。骨架的响应式靠"单列打底、`lg:` 变两列"完成，侧边栏用 `hidden lg:block` 在移动端藏起来。当响应式会改换行列结构时，Grid 的"格子模型"能用一份结构走天下，嵌套 Flex 则可能逼你复制结构。**

### 9.3.7 先跑通一个"最小骨架"

在填完整内容之前，建议你先用一段**最小可运行代码**验证骨架是对的（骨架错了，后面全白搭）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>骨架验证</title>
  <link rel="stylesheet" href="./dist/output.css">
</head>
<body>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto]">
    <header class="lg:col-span-2 bg-red-100 h-16">导航栏</header>
    <aside class="hidden lg:block bg-blue-100">侧边栏</aside>
    <main class="bg-green-100 p-4">内容区（撑满中间）</main>
    <footer class="lg:col-span-2 bg-yellow-100 h-16">页脚</footer>
  </div>
</body>
</html>
```

**用红蓝绿黄四色块标出四个区域**，一眼就能看出骨架对不对：

- 移动端（缩窄窗口）：红（导航）→ 绿（内容）→ 黄（页脚）纵向堆叠，蓝色侧边栏消失。
- 桌面端（拉宽窗口）：红横跨顶部、蓝在左、绿在右、黄横跨底部，正是后台布局。

**验证骨架是"搭页面"的第一道关卡**：骨架对，往里填内容只是体力活；骨架错，填得越多错得越深。这个"四色块最小骨架"的验证方法，值得你每次搭新页面都用。

---

## 9.4 逐个模块实现

---

## 9.4 逐个模块实现

**先给结论：骨架搭好后，每个模块就是"用 Flex 排一行/一列里的细节"。下面逐个拆，每个都给出 Tailwind 类 + 等价原生 CSS 对照。**

### 9.4.1 顶部导航栏：一维问题，交给 Flex

```html
<header class="lg:col-span-2 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 h-16 bg-white border-b border-gray-200">
  <!-- 左：汉堡按钮 + Logo -->
  <div class="flex items-center gap-3">
    <button class="lg:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="菜单">
      <span class="block w-6 h-0.5 bg-gray-600"></span>
      <span class="block w-6 h-0.5 bg-gray-600 mt-1"></span>
      <span class="block w-6 h-0.5 bg-gray-600 mt-1"></span>
    </button>
    <span class="font-bold text-lg text-gray-900">NovaDash</span>
  </div>

  <!-- 右：通知 + 头像 -->
  <div class="flex items-center gap-4">
    <button class="relative p-2 rounded-full hover:bg-gray-100" aria-label="通知">
      <span class="text-gray-500">🔔</span>
      <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
    </button>
    <div class="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-medium">张</div>
  </div>
</header>
```

等价原生 CSS（简化，只列关键）：

```css
header {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1rem; height: 4rem;   /* px-4 h-16 */
  background: #fff; border-bottom: 1px solid #e5e7eb;
}
/* 移动端隐藏汉堡按钮 */
header button.lg\:hidden { display: none; }
@media (min-width: 1024px) {
  header button.lg\:hidden { display: block; }  /* 等等，这里是"桌面端隐藏"？看下面说明 */
}
```

> 等等，`lg:hidden` 的意思是"**桌面端（lg 及以上）隐藏**"，不是"移动端隐藏"。汉堡按钮在移动端显示、桌面端隐藏——因为桌面端侧边栏常驻，不需要汉堡按钮。**这是新手最容易读反的一个类**：`lg:hidden` 读作"在 lg 断点（及以上）隐藏"。

**这里用了哪些第 02 章的知识**：

- `flex` + `justify-between`：首尾贴边（logo 靠左、头像靠右）。
- `items-center`：交叉轴（垂直）居中，让左中右的高度对齐。
- 内层两个 `div` 也是 `flex items-center gap-3`：把"汉堡 + Logo"或"通知 + 头像"排成一行。

### 9.4.2 侧边栏：纵向菜单，`flex-col`

```html
<aside class="hidden lg:flex flex-col p-4 bg-white border-r border-gray-200">
  <nav class="flex flex-col gap-1">
    <a href="#" class="nav-link-active">
      <span>📊</span><span>仪表盘</span>
    </a>
    <a href="#" class="nav-link">
      <span>🛒</span><span>订单</span>
    </a>
    <a href="#" class="nav-link">
      <span>👥</span><span>客户</span>
    </a>
    <a href="#" class="nav-link">
      <span>📈</span><span>报表</span>
    </a>
    <a href="#" class="nav-link">
      <span>⚙️</span><span>设置</span>
    </a>
  </nav>

  <!-- 底部：用户卡片 -->
  <div class="mt-auto flex items-center gap-3 p-3 rounded-lg bg-gray-50">
    <div class="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm">张</div>
    <div class="text-sm">
      <p class="font-medium">张三</p>
      <p class="text-xs text-gray-500">zhangsan@example.com</p>
    </div>
  </div>
</aside>
```

**两个关键技巧**：

1. **`hidden lg:flex`**：移动端隐藏，桌面端以 `display: flex` 显示。注意是 `lg:flex` 不是 `lg:block`——因为侧边栏内部是 `flex-col` 纵向排列，显示方式必须是 flex。
2. **`mt-auto`**：这是把用户卡片"压"到侧边栏底部的经典手法。`aside` 是 `flex-col`，导航菜单在上面，`mt-auto`（`margin-top: auto`）会吸走所有剩余空间，把用户卡片推到最底部——和第 8.3.6 讲的"卡片按钮贴底"是同一个原理。

等价原生 CSS：

```css
aside { display: none; }
@media (min-width: 1024px) {
  aside {
    display: flex; flex-direction: column;
    padding: 1rem; background: #fff;
    border-right: 1px solid #e5e7eb;
  }
  .user-card { margin-top: auto; }  /* mt-auto */
}
```

### 9.4.3 统计卡片：一排四个，`grid-cols-4`

```html
<section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
  <div class="stat-card">
    <p class="text-sm text-gray-500">总收入</p>
    <p class="mt-1 text-2xl font-bold">¥128,430</p>
    <p class="mt-2 text-sm text-green-600">↑ 12.5%</p>
  </div>
  <div class="stat-card">
    <p class="text-sm text-gray-500">订单数</p>
    <p class="mt-1 text-2xl font-bold">2,341</p>
    <p class="mt-2 text-sm text-green-600">↑ 8.2%</p>
  </div>
  <div class="stat-card">
    <p class="text-sm text-gray-500">活跃用户</p>
    <p class="mt-1 text-2xl font-bold">18,902</p>
    <p class="mt-2 text-sm text-red-600">↓ 3.1%</p>
  </div>
  <div class="stat-card">
    <p class="text-sm text-gray-500">转化率</p>
    <p class="mt-1 text-2xl font-bold">3.42%</p>
    <p class="mt-2 text-sm text-green-600">↑ 0.4%</p>
  </div>
</section>
```

**为什么统计卡片用 Grid 而不是 Flex？** 三个理由：

1. **等宽**：`grid-cols-4` 让四个卡片严格等宽，Flex 要等宽得给每个加 `flex-1`，不如 Grid 直观。
2. **换行可控**：响应式从 4 列 → 2 列 → 1 列，Grid 改一个 `grid-cols-*` 就完成，Flex 换行要 `flex-wrap` + 算宽度。
3. **语义匹配**：卡片网格是"二维"的（行列都要管），本就是 Grid 的主场（第 06 章结论）。

等价的原生 CSS（含响应式）：

```css
.stats {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}
@media (min-width: 640px) {
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1280px) {
  .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

/* 卡片本体用 @apply 抽过（stat-card），等价于手写： */
.stat-card {
  padding: 1.25rem;
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
}
```

**注意 `p-5` 编译成 `1.25rem`（20px）**，这是第 8.4 节 4px 比例尺的一环（`5 × 4px = 20px`）。你不必背，但要习惯"类名数字 × 4px"这个心算。

### 9.4.4 内容卡片：图表占位 + 订单列表

主内容区的第二排，左边大图表、右边订单列表：

```html
<section class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
  <!-- 左：图表占位（占 2 列） -->
  <div class="lg:col-span-2 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="flex items-center justify-between">
      <h2 class="font-semibold">销售趋势</h2>
      <span class="text-sm text-gray-400">最近 7 天</span>
    </div>
    <div class="mt-4 flex items-end gap-2 h-48">
      <!-- 用几个柱子模拟图表 -->
      <div class="flex-1 bg-brand-100 rounded-t" style="height: 40%"></div>
      <div class="flex-1 bg-brand-200 rounded-t" style="height: 65%"></div>
      <div class="flex-1 bg-brand-300 rounded-t" style="height: 50%"></div>
      <div class="flex-1 bg-brand-400 rounded-t" style="height: 80%"></div>
      <div class="flex-1 bg-brand-500 rounded-t" style="height: 60%"></div>
      <div class="flex-1 bg-brand-600 rounded-t" style="height: 90%"></div>
      <div class="flex-1 bg-brand-700 rounded-t" style="height: 70%"></div>
    </div>
  </div>

  <!-- 右：最近订单 -->
  <div class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
    <h2 class="font-semibold">最近订单</h2>
    <ul class="mt-4 flex flex-col divide-y divide-gray-100">
      <li class="flex items-center justify-between py-3">
        <span class="text-sm">#1001 · 张三</span>
        <span class="text-sm font-medium text-green-600">已支付</span>
      </li>
      <li class="flex items-center justify-between py-3">
        <span class="text-sm">#1002 · 李四</span>
        <span class="text-sm font-medium text-amber-600">待发货</span>
      </li>
      <li class="flex items-center justify-between py-3">
        <span class="text-sm">#1003 · 王五</span>
        <span class="text-sm font-medium text-gray-400">已取消</span>
      </li>
    </ul>
  </div>
</section>
```

**三个值得注意的类**：

1. **`lg:col-span-2`**：图表卡在桌面端占 2 列（3 列网格里的 2/3），订单卡占 1 列。移动端两者都回落到单列（`grid-cols-1`）。
2. **`divide-y divide-gray-100`**：给列表项之间加分隔线，等价于手写 `.list > * + * { border-top: 1px solid #f3f4f6 }`。这是 Tailwind 里做"列表分隔线"最省事的类，比手动给每个 `li` 加 `border-b` 干净得多。
3. **图表柱子的 `style="height: 40%"`**：这里用了内联样式控制柱子高度——因为"柱状图的高度"是**数据驱动的动态值**（真实项目里由 JS 算出），不该用 Tailwind 类写死。这正好呼应 8.7.5 的结论：**动态值用 JS + 内联，静态样式用原子类，各司其职。**

`divide-y` 的等价 CSS（让你看清它做了什么）：

```css
/* divide-y：给"后面的兄弟"加 top 边框（第一个不加） */
.list > * + * { border-top: 1px solid #f3f4f6; }
/* divide-gray-100 指定了颜色 #f3f4f6 */
```

**为什么 `divide-y` 比"给每个 `li` 加 `border-b`"更好？** 因为 `border-b` 会给最后一个 `li` 也加上下边框（多一条线），你还要写 `last:border-b-0` 去掉；而 `divide-y` 用"兄弟选择器 `+`"天然跳过第一个，只在**项与项之间**画线。**这又是一个"Tailwind 把最佳实践内置成默认"的例子**——它替你处理了"最后一项别画线"这个手写时最容易漏的细节。

### 9.4.5 页脚：又一行一维，Flex

```html
<footer class="lg:col-span-2 flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-t border-gray-200 text-sm text-gray-500">
  <span>© 2026 NovaDash · 保留所有权利</span>
  <div class="flex gap-4">
    <a href="#" class="hover:text-gray-900">隐私政策</a>
    <a href="#" class="hover:text-gray-900">服务条款</a>
  </div>
</footer>
```

**页脚和导航栏是同一个套路**：`flex justify-between` 首尾贴边。这也印证了第 06 章的结论——**"一行内首尾贴边"这种需求，Flex 的 `space-between` 是标准答案，无论它是导航栏还是页脚。**

### 9.4.6 完整源码一览：把四块拼起来

到这里，`index.html` 的完整内容可以一次性看全了（这份代码就是配套项目里的真实文件）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NovaDash · 数据看板</title>
  <link rel="stylesheet" href="./dist/output.css">
</head>
<body class="bg-gray-50 text-gray-900">

  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto]">

    <!-- ===== 顶部导航栏 ===== -->
    <header class="lg:col-span-2 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 h-16 bg-white border-b border-gray-200">
      <div class="flex items-center gap-3">
        <button class="lg:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="菜单">
          <span class="block w-6 h-0.5 bg-gray-600"></span>
          <span class="block w-6 h-0.5 bg-gray-600 mt-1"></span>
          <span class="block w-6 h-0.5 bg-gray-600 mt-1"></span>
        </button>
        <span class="font-bold text-lg text-gray-900">NovaDash</span>
      </div>
      <div class="flex items-center gap-4">
        <button class="relative p-2 rounded-full hover:bg-gray-100" aria-label="通知">
          <span class="text-gray-500">🔔</span>
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div class="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-medium">张</div>
      </div>
    </header>

    <!-- ===== 侧边栏 ===== -->
    <aside class="hidden lg:flex flex-col p-4 bg-white border-r border-gray-200">
      <nav class="flex flex-col gap-1">
        <a href="#" class="nav-link-active"><span>📊</span><span>仪表盘</span></a>
        <a href="#" class="nav-link"><span>🛒</span><span>订单</span></a>
        <a href="#" class="nav-link"><span>👥</span><span>客户</span></a>
        <a href="#" class="nav-link"><span>📈</span><span>报表</span></a>
        <a href="#" class="nav-link"><span>⚙️</span><span>设置</span></a>
      </nav>
      <div class="mt-auto flex items-center gap-3 p-3 rounded-lg bg-gray-50">
        <div class="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm">张</div>
        <div class="text-sm">
          <p class="font-medium">张三</p>
          <p class="text-xs text-gray-500">zhangsan@example.com</p>
        </div>
      </div>
    </aside>

    <!-- ===== 主内容区 ===== -->
    <main class="p-4 sm:p-6 lg:p-8">
      <h1 class="text-2xl font-bold">仪表盘</h1>

      <!-- 统计卡片 -->
      <section class="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="stat-card">
          <p class="text-sm text-gray-500">总收入</p>
          <p class="mt-1 text-2xl font-bold">¥128,430</p>
          <p class="mt-2 text-sm text-green-600">↑ 12.5%</p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-gray-500">订单数</p>
          <p class="mt-1 text-2xl font-bold">2,341</p>
          <p class="mt-2 text-sm text-green-600">↑ 8.2%</p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-gray-500">活跃用户</p>
          <p class="mt-1 text-2xl font-bold">18,902</p>
          <p class="mt-2 text-sm text-red-600">↓ 3.1%</p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-gray-500">转化率</p>
          <p class="mt-1 text-2xl font-bold">3.42%</p>
          <p class="mt-2 text-sm text-green-600">↑ 0.4%</p>
        </div>
      </section>

      <!-- 内容卡片 -->
      <section class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">销售趋势</h2>
            <span class="text-sm text-gray-400">最近 7 天</span>
          </div>
          <div class="mt-4 flex items-end gap-2 h-48">
            <div class="flex-1 bg-brand-100 rounded-t" style="height: 40%"></div>
            <div class="flex-1 bg-brand-200 rounded-t" style="height: 65%"></div>
            <div class="flex-1 bg-brand-300 rounded-t" style="height: 50%"></div>
            <div class="flex-1 bg-brand-400 rounded-t" style="height: 80%"></div>
            <div class="flex-1 bg-brand-500 rounded-t" style="height: 60%"></div>
            <div class="flex-1 bg-brand-600 rounded-t" style="height: 90%"></div>
            <div class="flex-1 bg-brand-700 rounded-t" style="height: 70%"></div>
          </div>
        </div>
        <div class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h2 class="font-semibold">最近订单</h2>
          <ul class="mt-4 flex flex-col divide-y divide-gray-100">
            <li class="flex items-center justify-between py-3">
              <span class="text-sm">#1001 · 张三</span>
              <span class="text-sm font-medium text-green-600">已支付</span>
            </li>
            <li class="flex items-center justify-between py-3">
              <span class="text-sm">#1002 · 李四</span>
              <span class="text-sm font-medium text-amber-600">待发货</span>
            </li>
            <li class="flex items-center justify-between py-3">
              <span class="text-sm">#1003 · 王五</span>
              <span class="text-sm font-medium text-gray-400">已取消</span>
            </li>
          </ul>
        </div>
      </section>
    </main>

    <!-- ===== 页脚 ===== -->
    <footer class="lg:col-span-2 flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-t border-gray-200 text-sm text-gray-500">
      <span>© 2026 NovaDash · 保留所有权利</span>
      <div class="flex gap-4">
        <a href="#" class="hover:text-gray-900">隐私政策</a>
        <a href="#" class="hover:text-gray-900">服务条款</a>
      </div>
    </footer>

  </div>
</body>
</html>
```

**这份代码里，HTML 结构只用了 5 种标签**：`div` / `header` / `aside` / `main` / `footer` / `nav` / `section` / `ul` / `li` / `a` / `span` / `button` / `p` / `h1` / `h2`——全是**语义化标签**，没有任何一个 `class` 是"为了布局硬起的名字"。这正是 Tailwind 和"语义化 HTML"并不冲突的证明：**结构层（标签语义）和表现层（原子类）各司其职，谁也不越界。**

> 一句话记住它：**模块级细节清一色是 Flex 的主场（一行内的排列/对齐/首尾贴边），而"一排卡片""跨列的图表"这类行列关系才用 Grid。`divide-y` 做列表分隔线、`mt-auto` 做贴底、`col-span` 做跨列，是三个高频组合拳。**

---

## 9.5 响应式：移动优先，`md:`/`lg:` 逐步增强

**先给结论：整个页面的响应式，就是"无前缀打底（手机单列）+ 几个前缀往上增强"。你不需要写任何 `@media` 查询——前缀就是媒体查询。**

### 9.5.1 三档形态一览

把前面散落的响应式类集中看一遍：

| 区域 | 手机（默认） | `sm:`（≥640px） | `lg:`（≥1024px） | `xl:`（≥1280px） |
|---|---|---|---|---|
| 整体骨架 | 单列 `grid-cols-1` | — | 两列 `lg:grid-cols-[16rem_1fr]` | — |
| 侧边栏 | `hidden` | — | 显示 `lg:flex` | — |
| 导航栏内边距 | `px-4` | `px-6` | — | — |
| 统计卡片 | 1 列 | 2 列 `sm:grid-cols-2` | — | 4 列 `xl:grid-cols-4` |
| 内容卡片 | 1 列 | — | 3 列 `lg:grid-cols-3` | — |
| 图表卡 | 1 列 | — | 跨 2 列 `lg:col-span-2` | — |

### 9.5.2 为什么"统计卡片"跳过 `md:` 直接到 `xl:`

你可能注意到统计卡片是 `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`，**跳过了 `md` 和 `lg`**。这是有意的：

- 手机（<640px）：1 列，卡片纵向堆叠。
- `sm`（≥640px）：2 列，两两一排。
- `xl`（≥1280px）：4 列，一排放四个。

**为什么不在 `md`/`lg` 就变成 4 列？** 因为 4 个统计卡片每个需要约 250px 才不拥挤，而 `lg`（1024px）减去侧边栏 256px 后，内容区只剩约 768px，放 4 列每列不到 200px，会挤。到 `xl`（1280px）内容区约 1024px，4 列才舒展。

**这就是"响应式不是机械套断点，而是根据内容算"**——断点选在哪，取决于"内容在哪个宽度下放得下"，而不是"我有 5 个断点就都要用一遍"。

### 9.5.3 一个容易踩的坑：移动端侧边栏"消失"但菜单入口在哪

侧边栏 `hidden lg:block` 后，移动端用户怎么导航？答案是导航栏左侧那个汉堡按钮（`lg:hidden`）。但**本示例项目只做了按钮的"样子"，没做"点击展开菜单"的交互**——因为那需要 JavaScript。

生产里的完整方案是：

```html
<!-- 移动端侧边栏：用 JS 控制 hidden/显示，做成"抽屉" -->
<aside id="mobile-menu" class="hidden fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 shadow-xl lg:hidden">
  <!-- 同款菜单 -->
</aside>
```

```js
// 汉堡按钮点击时，切换抽屉的 hidden
menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});
```

**本教程是 CSS 教程，交互（点击展开）交给 JS，正文不展开**。但你要知道：**CSS 只负责"在不同屏幕下长什么样"，"点击之后变什么"是 JS 的活——这正是第 00 章"分离关注点"的又一体现。**

### 9.5.4 如何亲手验证响应式

写完响应式，**必须亲手验证**，而不是"看着类名觉得对了"。最方便的工具是浏览器 DevTools 的设备模拟：

1. 打开 `index.html`，按 `F12` 打开 DevTools。
2. 点左上角的**设备工具栏**图标（手机/平板图标），或按 `Ctrl + Shift + M`。
3. 在顶部选择一个预设设备，或直接拖拽窗口宽度。

**重点验证这几个宽度**（对应断点）：

| 宽度 | 应该看到什么 |
|---|---|
| < 640px（如 iPhone SE 375px） | 侧边栏隐藏、统计卡片单列、导航栏紧凑 |
| 640~767px（如 720px） | 统计卡片两列 |
| 768~1023px（如 820px） | 统计卡片仍两列（没到 xl）、侧边栏仍隐藏 |
| ≥1024px（如 1280px） | 侧边栏出现、内容卡片三列、图表跨两列 |
| ≥1280px | 统计卡片四列 |

**验证时最容易暴露的两类问题**：

1. **某个断点下元素挤成一团**：说明你漏配了中间档（比如只写了 `grid-cols-1 xl:grid-cols-4`，中间 640~1279px 还是单列，浪费了空间）。
2. **某个断点下侧边栏把内容挤没了**：说明侧边栏的固定宽度和内容区的 `min-width` 冲突，需要给内容区加 `min-w-0`（Grid 里防止子项被撑破，对应第 04 章 `minmax(0,1fr)` 的坑）。

### 9.5.5 关于 `min-w-0`：Grid 里的一个隐藏坑

第 04 章讲过 `minmax(0, 1fr)` 为什么重要，Tailwind 里对应一个类：**`min-w-0`**。看一个会翻车的例子：

```html
<!-- ❌ 反例：侧边栏里的长文本（如邮箱），会把内容区挤爆 -->
<div class="grid lg:grid-cols-[16rem_1fr]">
  <aside class="hidden lg:block">...一个超长的菜单项文本...</aside>
  <main class="p-4">
    <p>内容区应该占剩余空间，但可能被侧边栏的 min-content 撑破</p>
  </main>
</div>
```

**现象**：当侧边栏里有一个"不换行的长字符串"（比如超长邮箱、长 URL），Grid 列的默认最小宽度是 `min-content`，导致侧边栏被撑宽，挤占内容区。

**解决**：给可能"被内容撑破"的格子加 `min-w-0`：

```html
<main class="p-4 min-w-0">
```

`min-w-0`（`min-width: 0`）的作用，就是手动完成 Tailwind 的 `grid-cols-*` 里那个 `minmax(0,1fr)` 做的事——**让格子允许收缩到 0，而不是被内容的最小宽度卡住**。在你用**自定义的 `grid-cols-[...]` 任意值**（如本项目的 `lg:grid-cols-[16rem_1fr]`）时，`minmax(0,1fr)` 不会被自动加，所以要自己补 `min-w-0`。

> 一句话记住它：**响应式 = 无前缀打底 + 前缀增强，前缀就是媒体查询的语法糖。断点选在哪不是机械套用，而是"内容在那个宽度下放得下才启用"。侧边栏的"移动端抽屉"是 CSS + JS 的合作：CSS 管形态，JS 管交互。用自定义 `grid-cols-[...]` 时记得给内容格加 `min-w-0` 防撑破。**

### 9.5.6 加分项：给这个页面加上暗色模式

第 8.5.4 讲了 `dark:` 前缀，这里把它落到实战——给后台页面加暗色模式。**先给结论：加暗色模式的成本，主要不在"写类"，而在"系统性地给每个颜色都配一个暗色版"。**

做法分两步：

**第一步：改配置，让暗色模式走 `class` 策略（手动切换）**

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',   // 从默认的 'media' 改成 'class'
  // ...
};
```

**第二步：给元素加 `dark:` 前缀**

```html
<body class="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
  <header class="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">…</header>
  <aside class="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">…</aside>
  <div class="stat-card dark:bg-gray-900 dark:border-gray-800">
    <p class="text-gray-500 dark:text-gray-400">总收入</p>
  </div>
</body>
```

**切换逻辑（JS，正文点到为止）**：给 `<html>` 挂/摘 `.dark` 类：

```js
document.documentElement.classList.toggle('dark');
```

**暗色模式的"工作量真相"**：上面的代码看起来简单，但**真正的成本是"你要为每个颜色都找到它的暗色搭档"**——`bg-white` 配 `dark:bg-gray-900`、`text-gray-500` 配 `dark:text-gray-400`、`border-gray-200` 配 `dark:border-gray-800`……这是一套**成对出现的决策**，页面越大、颜色越多，成本越高。

**这就是设计令牌的又一次价值体现**：如果你在项目一开始就把"明暗两套配色"作为令牌固定下来（甚至封装成组件类），加暗色模式就是"给组件类加几个 `dark:` 前缀"的机械劳动；而如果当初颜色是"各写各的 hex"，现在就要一个个去翻、去配对。**约束（令牌）在前期看似限制了自由，后期却换回了"系统性地批量改"的能力。**

> 一句话记住它：**加暗色模式 = `darkMode: 'class'` + 给每个颜色配 `dark:` 搭档。真正的成本是"成对决策"，设计令牌能让这件事从"逐个翻查"变成"批量机械劳动"。**

---

## 9.6 关键决策复盘：哪里用了 Grid、哪里用了 Flex、为什么

**先给结论：复盘不是"复盘代码"，是"复盘决策"。这一节把本章所有的选型决策列成一张表，让你将来自己搭页面时有个对照。**

### 9.6.1 决策总表

| 区域 | 选型 | 核心类 | 为什么这么选（呼应第 06 章） |
|---|---|---|---|
| 整体骨架 | **Grid** | `grid grid-cols-1 lg:grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto]` | 二维：要同时管"列（侧栏+内容）"和"行（导航/内容/页脚）" |
| 导航栏内部 | **Flex** | `flex items-center justify-between` | 一维：一行内的首尾贴边 |
| 侧边栏菜单 | **Flex** | `flex flex-col` + `mt-auto` | 一维：一列内的纵向堆叠 + 贴底 |
| 统计卡片 | **Grid** | `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` | 二维换行：等宽 + 响应式改列数最顺手 |
| 内容卡片 | **Grid** | `grid-cols-1 lg:grid-cols-3` + `lg:col-span-2` | 二维：跨列（图表占 2/3）是 Grid 的强项 |
| 订单列表项 | **Flex** | `flex items-center justify-between` | 一维：每行的"左名称右状态" |
| 页脚 | **Flex** | `flex items-center justify-between` | 一维：首尾贴边 |

### 9.6.2 三个"反直觉"的决策，值得单独说

**① 骨架为什么用 Grid 而不是"整页都是 Flex 套 Flex"？**

完全可以用"一个大 Flex 套两个 Flex"实现同样的外观：

```html
<div class="flex">
  <aside class="w-64 flex flex-col">...</aside>
  <div class="flex-1 flex flex-col">
    <header>...</header>
    <main class="flex-1">...</main>
    <footer>...</footer>
  </div>
</div>
```

**两种都成立，但 Grid 版意图更清晰。** 因为"侧边栏固定宽 + 内容自适应 + 页脚跨整行"这个需求，本质上是在描述**行列关系**（两列三行），Grid 的 `grid-cols`/`grid-rows` 把它**显式**地写了出来；Flex 版则是把"两列"和"三行"拆成两个嵌套的 Flex，读代码的人要脑内展开两层才能还原骨架。

**这也回应了第 06 章的核心判断标准：优先问"这是不是二维问题"。是，就用 Grid；哪怕 Flex 也能凑出来，但 Grid 表达意图更直接。**

**② 统计卡片为什么用 Grid 而不是 Flex？**

同样能凑：`flex flex-wrap` + 每个卡片 `w-full sm:w-1/2 xl:w-1/4`。但这样每个卡片的宽度是"算出来的百分比"，改断点要动每个卡片；而 `grid-cols-*` 把"几列"这个意图**集中写在容器上**，改起来一处生效。**Grid 描述的是"容器想让子项排成几列"，Flex 描述的是"每个子项自己多宽"——前者更符合"声明关系"的哲学（第 00 章）。**

**③ 为什么用 `col-span-2` 让图表跨列，而不是给图表设 `lg:w-2/3`？**

`col-span-2` 和 `w-2/3` 在"3 列网格"里效果接近，但**语义完全不同**：

- `col-span-2` 说"我占 2 个格子"，格子宽度由容器决定，自适应。
- `w-2/3` 说"我占容器的 2/3 宽"，是硬编码的百分比，和 Grid 的 gap 对齐会打架。

**在 Grid 里，跨列永远优先用 `col-span`，而不是用 `w-*` 百分比**——因为 Grid 的 `gap` 会从"格子"的间隙里算，`w-*` 的百分比算的是"含 gap 的总宽"，两者混用会差一个 gap 的宽度，导致对不齐。

### 9.6.3 从"骨架图"到"类名"的完整映射

最后把 9.1 的 ASCII 骨架图，和最终代码对应起来，形成闭环：

```text
┌─────────────────────────────────────────────┐
│ header  lg:col-span-2                        │ ← 跨两列
├──────────┬──────────────────────────────────┤
│ aside    │ main（内部两个 grid section）        │
│ hidden   │   ├─ 统计卡片 grid-cols-1/2/4      │
│ lg:flex  │   └─ 内容卡片 lg:grid-cols-3        │
├──────────┴──────────────────────────────────┤
│ footer  lg:col-span-2                        │ ← 跨两列
└─────────────────────────────────────────────┘
    ↑
  grid-cols-1 → lg:grid-cols-[16rem_1fr]
```

> 一句话记住它：**决策的核心就一条——"这是不是二维问题"。骨架、卡片网格、跨列布局用 Grid；导航、菜单、列表项、页脚这些"一行内"的细节用 Flex。Grid 里跨列用 `col-span`，别用 `w-*` 百分比去硬凑。**

### 9.6.4 这套骨架的复用性：换个产品照样用

搭完这个后台页面，你可能会问："我学的是这套具体页面，换一个产品落地页，这套东西还有用吗？"

**有用，因为"骨架"和"内容"是解耦的。** 把 9.3 的骨架单独拎出来：

```html
<div class="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto]">
  <header class="lg:col-span-2">…</header>
  <aside class="hidden lg:block">…</aside>
  <main>…</main>
  <footer class="lg:col-span-2">…</footer>
</div>
```

**这套骨架是"后台布局"的通用解**，几乎所有的 Admin / Dashboard 都是这个结构。换成落地页呢？落地页通常**没有侧边栏**，结构更简单：

```html
<!-- 落地页骨架：导航 / 主内容 / 页脚，纵向堆叠，无需 Grid 的行列结构 -->
<div class="flex flex-col min-h-screen">
  <header class="sticky top-0 z-10">…</header>
  <main class="flex-1">…</main>
  <footer>…</footer>
</div>
```

**看出来了吗？落地页是"纯一维"（只有"上中下"一条轴），所以它反而用 Flex 更合适。** 这又印证了那个判断标准：**骨架有"左右分栏"（二维）→ Grid；骨架只有"上下堆叠"（一维）→ Flex。** 后台有侧边栏所以是二维用 Grid，落地页没侧边栏所以是一维用 Flex。

**所以你要学的不是"这一个页面的代码"，而是"判断骨架是几维 → 选 Grid 还是 Flex → 用对应的类表达"这套决策流程。** 它换任何页面都通用。

### 9.6.5 生产部署前：体积优化

开发时用 `npm run build`（不压缩），方便调试；**上线前换 `npm run build:min`**：

```bash
npm run build:min   # 等价于 tailwindcss -i ... -o ... --minify
```

对比一下体积（本示例项目实测量级）：

| 命令 | 输出 | 适用 |
|---|---|---|
| `npm run build` | 约 20+ KB（含注释、换行） | 开发调试 |
| `npm run build:min` | 约 8~12 KB（压缩后） | 生产部署 |

**为什么 Tailwind 生产 CSS 能这么小？** 因为"按需生成"——`content` 扫描到的类才会被编译，你写了 30 个类，CSS 里就 30 个类（外加 base 重置），不像传统框架那样塞一整套没人用的组件样式。**这也是第 8.1.2 说的"没有死代码"的直接体现：没用的类根本不进产物。**

> 一句话记住它：**决策的最终心法是"判断几维"：骨架有左右分栏（二维）用 Grid，只有上下堆叠（一维）用 Flex。学会这套流程，而不是背这一页代码，你就能搭任何页面。上线前用 `--minify` 压缩，Tailwind 按需生成让生产 CSS 天然很小。**

---

## 9.7 本章小结

- **搭页面三步走**：先画 ASCII 骨架图 → 用"二维 Grid、一维 Flex"给区域定性 → 移动优先逐步加前缀。
- **骨架用 Grid**：`grid-cols` + `col-span` 等价于 `grid-template-areas`，靠"单列打底、`lg:` 变两列"完成形态切换。
- **细节用 Flex**：`justify-between`（首尾贴边）、`items-center`（垂直居中）、`flex-col`（纵向）、`mt-auto`（贴底）是最常用的四个组合拳。
- **响应式 = 前缀**：断点选在哪取决于"内容放得下"，不是机械套用所有断点。
- **环境是构建版**：`npm i -D tailwindcss@3.4` + `content` 配置 + `npx tailwindcss -i ... -o ...`；CDN 只配演示。
- **决策复盘**：Grid 管"容器想让子项排几列"（声明关系），Flex 管"一行内的排列"；跨列用 `col-span` 不用 `w-*`。

---

## 9.8 动手练习

1. 跑通配套项目：`cd examples/09-tailwind-demo && npm install && npm run build`，然后用浏览器打开 `index.html`，缩放窗口观察三个断点（<640 / ≥640 / ≥1280）下统计卡片列数的变化。

   <details><summary>参考答案</summary>
   缩放浏览器窗口（或按 F12 切设备模拟）会看到：宽度 <640px 时统计卡片单列堆叠；≥640px 两列；≥1280px 四列。侧边栏在 <1024px 隐藏、≥1024px 出现。这正是移动优先 + 前缀系统的效果。
   </details>

2. 打开编译出的 `dist/output.css`，搜索 `bg-purple-500`——你会搜不到。为什么？请解释 Tailwind 的"按需生成"机制。

   <details><summary>参考答案</summary>
   因为 `bg-purple-500` 没出现在 `content` 配置的任何文件里，Tailwind 扫描后不生成这个类。这正是 Tailwind 体积小的秘密：只编译用到的类，没用的类根本不进入最终 CSS。
   </details>

3. 给统计卡片区加一个"在 ≥768px 时变成 3 列"的中间档，你该怎么改？

   <details><summary>参考答案</summary>

```html
   <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
```

   在 `sm:` 和 `xl:` 之间插入 `md:grid-cols-3`，让 640~767px 两列、768~1279px 三列、≥1280px 四列。注意 `md:` 是 ≥768px。
   </details>

4. 为什么页脚和导航栏都用 `flex justify-between`，而不是 Grid？请用第 06 章的"一维 vs 二维"框架回答。

   <details><summary>参考答案</summary>
   因为它们都是"一行内的首尾贴边"——只有一维（主轴方向）需要处理，没有行列交错。Flex 的 `justify-content: space-between` 是这种需求的标准答案。Grid 虽然也能做（`grid-cols-[1fr_auto]`），但杀鸡用牛刀，且表达意图不如 Flex 直接。
   </details>

5. 把侧边栏菜单里的 `.nav-link` 用 `@apply` 抽成组件类（如果还没做），并说明为什么它要放进 `@layer components`。

   <details><summary>参考答案</summary>

```css
   @layer components {
     .nav-link {
       @apply flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900;
     }
   }
```

   放进 `@layer components` 是为了让原子类（如 `bg-red-500`）能覆盖它。若它成为"无层" CSS，优先级会高于所有层内样式，导致局部覆盖失效（第 8.6.4 的坑）。
   </details>

6. 汉堡按钮的"三条横线"是用什么实现的？请读 9.4.1 的代码，解释每个 `span` 的类分别起了什么作用。

   <details><summary>参考答案</summary>
   三个 `<span class="block w-6 h-0.5 bg-gray-600 mt-1">`：`block` 让它占一整行（span 默认 inline）、`w-6` 宽 24px、`h-0.5` 高 2px（`0.5 × 4px = 2px`）、`bg-gray-600` 深灰。后两个 `span` 加 `mt-1`（`margin-top: 4px`）与上面的横线拉开间距。三根横线竖排，就是汉堡图标。注意按钮上挂的是 `lg:hidden`（桌面端隐藏），因为桌面端侧边栏常驻、不需要汉堡按钮。
   </details>

7. 把骨架的 `lg:grid-cols-[16rem_1fr]` 改成 `theme.extend.gridTemplateColumns` 里的注册令牌写法，并解释为什么长期项目更推荐后者。

   <details><summary>参考答案</summary>

```js
   // tailwind.config.js
   theme: {
     extend: {
       gridTemplateColumns: {
         "app": "16rem 1fr",
       },
     },
   },
```

```html
   <div class="grid grid-cols-1 lg:grid-cols-app ...">
```

   注册成令牌后，`grid-cols-app` 有了语义化名字，项目里多处复用"侧栏 + 内容"骨架时，改一处令牌即可全局生效；而任意值 `[16rem_1fr]` 散落在各处，改起来要逐个替换。这正是第 8.4.3 讲"任意值是逃生舱、长期使用的值要注册成令牌"的落地。
   </details>

---

> 📖 **本章的配套项目**：`examples/09-tailwind-demo/`（`npm install && npm run build` 可编译）。
> 🚀 **下一步**：回到 [README](../README.md)，进入第 10 章做分级测试，检验你是否真的掌握了 Flex/Grid/Tailwind。
