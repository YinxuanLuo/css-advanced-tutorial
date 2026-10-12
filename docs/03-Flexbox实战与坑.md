# 第 03 章 · Flexbox 实战模式与常见坑

> 第 02 章把 Flex 的"零件"都讲完了，这一章干两件事：**用这些零件搭出四个真实布局**，以及**集中处理 Flex 里最容易让人栽跟头的几个坑。**
>
> 本章你需要记住的就一件事：**Flex 的坑，几乎都源于"你忘了它的默认值"——`flex-basis: auto`、`flex-shrink: 1`、`align-items: stretch`、`min-width: auto`。把这些默认值记死，一半的坑自动消失。**

---

## 3.1 导航栏：logo 在左，菜单在右

先给结论：导航栏是 Flex 的"教科书第一题"。它的核心诉求是——**一个容器里，左边一个 logo，右边一组菜单，中间留白**。Flex 有三种写法能达成，各有优劣，本节逐个讲。

### 3.1.1 写法一：`justify-content: space-between`

最直觉的写法，但有个隐藏限制。

```html
<header class="navbar">
  <a class="logo" href="#">LOGO</a>
  <nav class="menu">
    <a href="#">首页</a>
    <a href="#">产品</a>
    <a href="#">关于</a>
  </nav>
</header>
```

```css
.navbar {
  display: flex;
  align-items: center;              /* 垂直居中 */
  justify-content: space-between;   /* logo 贴左，菜单贴右 */
  height: 56px;
  padding: 0 24px;
  background: #1a1d23;
}
.logo {
  color: #fff;
  font-weight: bold;
  text-decoration: none;
}
.menu {
  display: flex;
  gap: 20px;
}
.menu a {
  color: #cbd5e1;
  text-decoration: none;
}
```

**效果**：logo 在最左，菜单整体在最右，中间留白。`justify-content: space-between` 让"第一个子元素贴起点、最后一个贴终点"。

**它的限制**：`space-between` 只有在**恰好两个子元素**时，效果才是"一个左、一个右"。如果你要"logo 左 + 三个菜单按钮右"，且希望第一个按钮就贴着 logo 开始、剩下的靠右，`space-between` 就做不到了——它只能让"最后一个子元素"贴右，中间的几个会挤在一起。

### 3.1.2 写法二：`margin-left: auto`（更推荐）

这是第 02 章 2.7 节讲的"隐藏技能"的实战应用，**更灵活、更符合意图**。

```html
<header class="navbar">
  <a class="logo" href="#">LOGO</a>
  <nav class="menu">
    <a href="#">首页</a>
    <a href="#">产品</a>
    <a href="#">关于</a>
  </nav>
  <a class="login" href="#">登录</a>
</header>
```

```css
.navbar {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 24px;
  background: #1a1d23;
}
.logo { color: #fff; font-weight: bold; text-decoration: none; }
.menu {
  display: flex;
  gap: 20px;
  margin-left: auto;   /* 菜单整体被推到右边 */
}
.login {
  margin-left: 40px;   /* 登录按钮和菜单之间留 40px */
  color: #fff; text-decoration: none;
}
```

**效果**：logo 贴左，`.menu` 因为 `margin-left: auto` 吃掉中间所有剩余空间被推到右边，"登录"按钮跟在菜单后面。**这比 `space-between` 强在哪？** 你可以精确控制"是哪个元素被推、以及推多远"——`.menu` 推到最右，`.login` 用固定的 `margin-left: 40px` 和菜单保持距离。而 `space-between` 只能"一个最左、一个最右"，中间的元素你控制不了。

**最佳实践**：**多元素导航栏（logo + 菜单 + 按钮），用 `margin-left: auto`；只有两个元素的极简导航，用 `space-between` 也行。** 我个人的习惯是统一用 `margin-left: auto`，因为它表达意图更明确。

### 3.1.3 移动端：把横向导航变纵向

导航栏在手机上的常见处理是"折叠成汉堡菜单"，但最简单的响应式做法是**把横向 flex 改成纵向**。这正好复习第 02 章的"轴"概念：

```css
/* 桌面端：横向 */
.navbar { display: flex; flex-direction: row; }

/* 手机端：纵向堆叠 */
@media (max-width: 640px) {
  .navbar {
    flex-direction: column;   /* 主轴从水平变垂直 */
    align-items: flex-start;
  }
  .menu { margin-left: 0; }   /* 纵向时不再需要"推到右边" */
}
```

**效果**：手机端 logo、菜单、登录按钮从上到下堆叠。这就是"记住轴而不是横竖"的实战价值——改一个 `flex-direction`，整个布局的方向就换了，而 `justify-content`/`align-items` 的语义（管主轴/交叉轴）不变。

### 3.1.4 变体：中间搜索框吃满剩余空间

导航栏还有一个超级常见的变体——**logo 固定左、搜索框吃满中间、按钮固定右**。这是"一个固定 + 一个 `flex: 1` + 一个固定"的经典三段式：

```html
<header class="navbar">
  <a class="logo" href="#">LOGO</a>
  <input class="search" type="text" placeholder="搜索…">
  <button class="btn">登录</button>
</header>
```

```css
.navbar {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 56px;
  padding: 0 24px;
  background: #1a1d23;
}
.logo { color: #fff; font-weight: bold; text-decoration: none; }
.search {
  flex: 1;              /* 吃掉所有剩余空间，让搜索框撑满中间 */
  min-width: 0;         /* 防止 placeholder 或输入内容把它撑爆 */
  height: 36px;
  padding: 0 12px;
  border-radius: 18px;
  border: none;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #2f6fed;
  color: #fff;
  cursor: pointer;
}
```

**效果**：logo 在左、登录按钮在右，搜索框用 `flex: 1` 撑满中间。容器变宽变窄，搜索框跟着伸缩，两端固定不动。

**注意那个 `min-width: 0`**：搜索框是 flex item，默认 `min-width: auto`。当用户输入很长内容时，搜索框的 min-content 宽度会变大，可能把它撑得超过剩余空间、挤到按钮。`min-width: 0` 允许它收缩，配合 `input` 自带的滚动/裁剪，长输入不会破坏布局。**这是 3.6 节"min-width: 0"在导航栏里的提前应用**——很多"搜索框把按钮挤掉"的 bug，根因就是漏了 `min-width: 0`。

> 一句话记住它：**导航栏"logo 左、菜单右"，用 `margin-left: auto` 比 `space-between` 更灵活——它能精确控制"哪个元素被推、推多远"，且元素多于两个时依然清晰；"搜索框吃满中间"用 `flex: 1`，记得配 `min-width: 0` 防撑爆。**

---

## 3.2 卡片流：`flex-wrap` + `flex: 1 1 <基准>`

先给结论：卡片流（card grid）是"响应式卡片墙"最常用的模式——**卡片自动换行、每张有最小宽度、铺满整行时自动等宽**。它的核心写法就一行：`flex: 1 1 <基准宽度>`。

### 3.2.1 基本卡片流

```html
<div class="cards">
  <div class="card">卡片 1</div>
  <div class="card">卡片 2</div>
  <div class="card">卡片 3</div>
  <div class="card">卡片 4</div>
  <div class="card">卡片 5</div>
  <div class="card">卡片 6</div>
</div>
```

```css
.cards {
  display: flex;
  flex-wrap: wrap;      /* 放不下就换行 */
  gap: 16px;
}
.card {
  flex: 1 1 220px;      /* grow 1，shrink 1，basis 220px */
  padding: 24px;
  background: #fff;
  border: 1px solid #e4e7ee;
  border-radius: 8px;
}
```

**效果**：容器宽 700px、每张卡基础 220px、gap 16px，一行能放 `(700 + 16) / (220 + 16) ≈ 3` 张。于是 6 张卡排成 2 行、每行 3 张。关键在 `flex: 1 1 220px` 的解读：

- `flex-basis: 220px`：每张卡的"理想宽度"是 220px。
- `flex-grow: 1`：如果一行还有剩余空间，卡片会等分吃掉它，让整行铺满、卡片自动变宽。
- `flex-shrink: 1`：如果一行放不下，卡片可以缩到比 220px 更小一点。

**这就是"响应式"的本质**：你只声明"每张卡大概 220px、可以伸缩"，至于一行到底放几张、每张最终多宽，浏览器根据实际容器宽度去算。换到手机上，一行自动变成 1~2 张。

### 3.2.2 为什么不直接用 `width: 220px`

新手常问：我直接 `width: 220px` 加 `flex-wrap: wrap` 不也能换行吗？为什么非要用 `flex`？

```css
/* ❌ 用固定 width：一行放不满时，最后一行右边会留一大块空白 */
.card { width: 220px; }
```

```css
/* ✅ 用 flex: 1 1 220px：卡片自动拉宽铺满整行，不留空白 */
.card { flex: 1 1 220px; }
```

**现象对比**：容器 700px、卡 220px，一行放 3 张需要 `220×3 + 16×2 = 692px`，勉强放下。但如果容器是 690px，`width: 220px` 的卡一行只能放 2 张，右边空 250px；而 `flex: 1 1 220px` 的卡会缩到约 221px 塞下 3 张，**没有浪费的空白**。`flex-grow: 1` 保证"铺满"，`flex-shrink: 1` 保证"塞满"。

### 3.2.3 `flex-basis` 是"理想值"，不是"硬值"

再次强调（呼应第 02 章 2.5 节）：`flex-basis: 220px` **不是** "宽度锁定 220px"，而是"先按 220px 算，再看有没有多/缺的空间来调整"。真正锁死宽度的是 `flex: 0 0 220px`（grow 0、shrink 0）。

```css
/* 锁死 220px：不放大不缩小，一行放不下就换行，放不满就留白 */
.card-fixed { flex: 0 0 220px; }

/* 弹性 220px：优先 220px，但能伸缩铺满整行 */
.card-fluid { flex: 1 1 220px; }
```

**什么时候用哪个？** 卡片流要"铺满整行"，用 `flex: 1 1 220px`；侧边栏要"固定宽度"，用 `flex: 0 0 220px`。分不清这两者，是卡片流最常出 bug 的地方。

### 3.2.4 卡片流的已知缺陷：最后一行被拉宽

卡片流用 Flex 有个**无解的小瑕疵**：最后一行如果不满（比如 7 张卡、每行 3 张），最后那张孤卡会因为 `flex-grow: 1` 被拉宽到占满整行。这是第 02 章 2.9 节讲的"Flex 一维本质"的直接后果。

```html
<div class="cards">
  <div class="card">1</div> <div class="card">2</div> <div class="card">3</div>
  <div class="card">4</div> <div class="card">5</div> <div class="card">6</div>
  <div class="card">7</div>
</div>
```

```css
.cards { display: flex; flex-wrap: wrap; gap: 16px; }
.card { flex: 1 1 220px; }
```

**现象**：7 张卡，前两行各 3 张，最后一行只有第 7 张，而这张会被拉到和整行一样宽。

**正解**：换 Grid（`grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`）。Grid 天然保证"最后一行不满的卡，保持和上一行卡一样的宽度"。这正是第 06 章"Flex vs Grid 选择题"的核心判据之一。

### 3.2.5 卡片流的响应式行为：一行几列由浏览器算

卡片流的精髓是**不用写媒体查询，卡片自动换列**。看同一段代码在不同容器宽度下的表现：

```css
.cards { display: flex; flex-wrap: wrap; gap: 16px; }
.card { flex: 1 1 220px; }
```

| 容器宽度 | 一行放几张 | 每张实际宽度 |
|---|---|---|
| 480px | 2 张 | ≈232px（塞满） |
| 700px | 3 张 | ≈222px（塞满） |
| 940px | 4 张 | ≈223px（塞满） |

**为什么一行能自动变成 2、3、4 张？** 因为 `flex-basis: 220px` 只是"理想值"，`flex-shrink` 让卡片可以缩一点、`flex-grow` 让卡片可以撑一点，于是浏览器在"每张尽量接近 220px"的前提下，自动算出每行能塞几张并铺满。

**这是"声明意图"（00 章哲学一）的最佳示范**：你写的是"每张卡大概 220px、可以伸缩、铺满每行"，具体几列、每列多宽，你**不需要知道**，浏览器按真实屏幕算。

**一个实战建议**：如果你希望卡片"最小 220px、但绝对不能被压到 220px 以下"（比如卡片里有重要内容不能被压窄），那 `flex: 1 1 220px` 的 shrink 会在空间不足时把卡压到 220px 以下。想阻止这种情况，可以加 `min-width: 220px`：

```css
/* 卡片至少 220px，宁可换行也不压窄 */
.card { flex: 1 1 220px; min-width: 220px; }
```

`min-width: 220px` 和 `flex-basis: 220px` 配合，就实现了"理想 220px、可放大、但不缩到 220px 以下"——又是一个"默认值 vs 显式约束"的权衡（呼应 3.6 节的 `min-width` 讨论）。

### 3.2.6 另一种卡片流：用百分比做 basis

除了固定像素（`220px`），`flex-basis` 也常用**百分比**。这是"每行固定 N 列"的经典写法：

```css
/* 每行 3 列：basis 30%（留 10% 给 gap），grow 0 不放大 */
.cards { display: flex; flex-wrap: wrap; gap: 5%; }
.card { flex: 0 0 30%; }
```

```css
/* 每行 3 列且等宽：basis 0% + grow 1，严格三等分 */
.cards { display: flex; flex-wrap: wrap; gap: 20px; }
.card { flex: 1 1 0%; }   /* 或直接 flex: 1 */
```

**两种写法的区别**：

- `flex: 0 0 30%`：卡片宽度严格是容器的 30%，**不放大不缩小**，一行正好 3 列（3×30% + 2×5% gap = 100%）。好处是列宽精确可预测，坏处是 gap 和 basis 要自己凑数（30% + 30% + 30% + 5% + 5% = 100%），改 gap 就得改 basis。
- `flex: 1 1 0%`（即 `flex: 1`）：卡片基准 0、按 grow 均分，配合固定 `gap: 20px` 自动铺满。好处是**不用凑百分比**（`gap` 用像素、basis 用 0%，浏览器自动算每列多宽），坏处是最后一行孤卡会被拉宽（3.2.4 的已知缺陷）。

**最佳实践**：**现代写法一律推荐 `flex: 1`（basis 0%）+ 像素 `gap`**，不要再用 `30% + 5%` 这种凑数的老写法——凑百分比又脆弱又难读，而且一改 gap 全乱。真要"严格 N 列、最后一行也不拉宽"，直接用 Grid（`grid-template-columns: repeat(3, 1fr)`）更省心。

> 一句话记住它：**卡片流用 `flex-wrap + flex: 1 1 220px`——basis 是"理想宽度"不是"硬宽度"，grow 铺满、shrink 塞满，几列由浏览器按真实宽度算；但最后一行不满时卡片会被拉宽，这是 Flex 一维本质的代价，要严格对齐就换 Grid。百分比 basis（`30%`）是"凑数"老写法，现代用 `flex: 1` + 像素 gap 更省心。**

---

## 3.3 圣杯布局的 Flex 写法

先给结论：圣杯布局（header + 三列 + footer）是网页最经典的骨架，**用 Flex 写它需要"嵌套两个 flex 容器"——外层 `column` 撑起纵向结构，内层 `row` 撑起三列。** 核心是"两侧固定、中间 `flex: 1` 自适应"。

### 3.3.1 完整的圣杯布局

```html
<div class="layout">
  <header class="header">Header</header>
  <div class="body">
    <aside class="aside left">左侧栏（固定 200px）</aside>
    <main class="main">主内容（自适应）</main>
    <aside class="aside right">右侧栏（固定 240px）</aside>
  </div>
  <footer class="footer">Footer</footer>
</div>
```

```css
.layout {
  display: flex;
  flex-direction: column;   /* 外层：纵向排 header / body / footer */
  min-height: 100vh;
}
.header, .footer {
  height: 56px;
  background: #1a1d23;
  color: #fff;
  display: flex; align-items: center;
  padding: 0 24px;
}
.body {
  display: flex;            /* 内层：横向排 左 / 主 / 右 */
  flex: 1;                  /* 吃掉 header/footer 之外的剩余高度 */
}
.aside.left { width: 200px; background: #e8f1ff; }
.aside.right { width: 240px; background: #e8f1ff; }
.main {
  flex: 1;                  /* 主内容吃掉所有剩余宽度 */
  padding: 24px;
}
```

**效果**：页面从上下分成三段——顶部 header 固定 56px、底部 footer 固定 56px、中间 `.body` 用 `flex: 1` 吃掉剩余高度。而 `.body` 内部又是一个 flex 容器，左右侧栏固定 200/240px，主内容 `flex: 1` 自适应。**整页不需要任何 `position` 或 `float`，纯 Flex 搞定。**

### 3.3.2 关键：为什么中间要用 `flex: 1` 而不是 `flex: 1 1 auto`

`.main { flex: 1 }` 是 `flex: 1 1 0%`。这里用 `0%` 基准（而不是 `auto`）是有讲究的：

```css
/* ❌ 用 flex: auto（1 1 auto）：主内容会先按内容宽度占位，可能把侧栏挤掉 */
.main { flex: auto; }

/* ✅ 用 flex: 1（1 1 0%）：基准 0，主内容严格吃掉"所有剩余空间" */
.main { flex: 1; }
```

**现象**：`.main` 里如果放了一段很长的、不换行的内容（比如一个超长 URL 或一段 `white-space: nowrap` 的代码），`flex: auto` 会让 `.main` 先按这段内容的宽度占位，可能挤得两侧栏溢出；而 `flex: 1`（basis 0%）让 `.main` 的宽度"完全由剩余空间决定"，内容再多也限制在剩余空间内（配合 `min-width: 0`，见 3.6 节）。

**最佳实践**：**"两侧固定、中间自适应"的中间列，一律用 `flex: 1`，不要用 `flex: auto`。** 理由就是上面这条——`auto` 基准会让中间列被内容撑大，破坏"两侧固定"的假设。

### 3.3.3 移动端：三列变一列

圣杯布局在手机上的常见处理是"三列变一列"，同样改 `flex-direction`：

```css
@media (max-width: 768px) {
  .body {
    flex-direction: column;   /* 三列变纵向堆叠 */
  }
  .aside.left, .aside.right {
    width: auto;              /* 纵向时不再需要固定宽度 */
  }
}
```

**效果**：手机端左栏、主内容、右栏从上到下堆叠。这就是 Flex"一维布局"在响应式里的优势——改方向比 `float` 布局那种"重排 DOM 或疯狂改 margin"要轻松得多。

### 3.3.4 圣杯 vs 双飞翼：一段历史，一个教训

你可能听过"圣杯布局"和"双飞翼布局"这两个词，它们其实是**同一个需求（三列、两侧固定、中间自适应、中间列优先渲染）在 `float` 时代的两种 hack 解法**。

- **圣杯布局**：用 `float` + `margin-left` 负值 + 父容器 `padding` 腾出两侧空间。
- **双飞翼布局**：用 `float` + `margin-left` 负值 + 主列内部再套一个 div 用 `margin` 腾空间。

这两种写法的代码**非常晦涩**——充满负 margin、相对定位、嵌套 div，纯粹是"用 `float` 硬凑三列"的产物，也正是 00 章 0.3 节讲的"借来的布局"的典型。

**而用 Flex，上面这一切复杂到掉头发的 hack 全部消失**，就是 3.3.1 那段 20 行不到的代码。**历史意义在于**：圣杯/双飞翼这个名字本身，就是"当年布局工具匮乏、工程师用 hack 硬扛"的纪念碑。今天你不需要背它们的 hack 细节，你只需要知道——**Flex/Grid 出现后，这类"负 margin 拼布局"的黑暗技巧可以彻底退休了**。

这也是本教程反复强调的一个判断标准：**如果一个布局写法让你觉得"反直觉、要背一堆负数 margin"，那它大概率是借来的 hack，现代工具里有更直接的原生解法。**

> 一句话记住它：**圣杯布局 = 外层 `column` + 内层 `row` 两个 flex 容器；两侧固定宽度，中间 `flex: 1`（basis 0%）自适应——中间列用 `flex: 1` 而非 `flex: auto`，防止内容把它撑大。圣杯/双飞翼是 float 时代的 hack，Flex 让它们退休了。**

---

## 3.4 底部固定：`margin-top: auto` 把 footer 推到底

先给结论："页脚贴底"是另一个高频需求——**内容不够一屏时，footer 也要贴在视口底部，而不是悬在半空**。Flex 的解法就一行：给 footer 一个 `margin-top: auto`。

### 3.4.1 经典问题：footer 悬在半空

```html
<div class="page">
  <main class="content">
    <p>页面内容很少，撑不满一屏。</p>
  </main>
  <footer class="footer">我是 footer</footer>
</div>
```

```css
/* ❌ 没有处理：内容不足一屏时，footer 会紧跟在内容下面，悬在半空 */
.page { display: flex; flex-direction: column; min-height: 100vh; }
.content { padding: 24px; }
.footer { height: 56px; background: #1a1d23; color: #fff; }
```

**现象**：`.page` 高 100vh，但内容只占顶部一小块，footer 就贴在内容下方——**视口底部空了一大片**，footer 没贴到底。

### 3.4.2 正解：`margin-top: auto`

```css
/* ✅ 给 footer 一个 margin-top: auto，把它推到底 */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.content { padding: 24px; }
.footer {
  margin-top: auto;   /* 吸收 content 和 footer 之间的所有剩余空间 */
  height: 56px;
  background: #1a1d23;
  color: #fff;
}
```

**效果**：footer 的 `margin-top: auto` 吃掉了它上方所有的剩余空间，于是被推到视口底部。内容够长时（超过一屏），`min-height: 100vh` 会被内容撑大，footer 自然在内容后面，`margin-top: auto` 没有剩余空间可分、就不起作用——**两种情况都正确**。

### 3.4.3 为什么用 `margin-top: auto` 而不是 `flex: 1` 给 content

另一种等价写法是给 `.content` 设 `flex: 1`，让它吃掉剩余空间，从而把 footer 挤到底：

```css
/* ✅ 等价写法：content 吃满剩余高度，footer 自然到底 */
.content { flex: 1; }
```

**两种写法效果一样，选哪个？** 取决于你的语义：

- `margin-top: auto`：语义是"footer 贴在底部"，**意图写在 footer 自己身上**。
- `flex: 1` 给 content：语义是"content 占满剩余空间"，**意图写在 content 身上**。

**最佳实践**：用 `margin-top: auto` 给 footer。因为"footer 贴底"是 footer 的行为，写在它自己身上，代码读起来就是"footer 自己要贴底"，意图更清晰。而且如果未来 content 内部还有别的元素，`flex: 1` 给 content 会把它整个拉高，可能产生副作用。

### 3.4.4 同款技巧：卡片里的按钮组贴底

`margin-top: auto` 不仅能做 footer，还能做"卡片里按钮组永远贴底"：

```html
<div class="card">
  <h3>标题</h3>
  <p>内容，可能很长也可能很短。</p>
  <button>购买</button>
</div>
```

```css
.card {
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.card button {
  margin-top: auto;   /* 无论内容多长，按钮都贴在卡片底部 */
}
```

**效果**：一排等高卡片（`align-items: stretch` 保证），每张卡片的按钮都贴在底部——内容短的卡，按钮和标题之间空出来；内容长的卡，按钮紧随内容。这是"对齐底部操作区"的经典实现。

### 3.4.5 为什么"footer 贴底"在 float 时代那么难

"内容不足一屏时 footer 贴底"这个需求，有一个专门的英文名：**Sticky Footer**。在 `float` 时代，它是著名的"CSS 十大难题"之一，解法通常是这样的 hack：

```css
/* float 时代的 Sticky Footer：负 margin + 幽灵元素，晦涩难懂 */
html, body { height: 100%; }
.wrapper {
  min-height: 100%;
  margin-bottom: -56px;        /* 负 margin 给 footer 腾位 */
}
.wrapper::after {
  content: "";
  display: block;
  height: 56px;                 /* 幽灵占位元素 */
}
.footer { height: 56px; }
```

**这套代码的核心病根**：它要精确地"预留 footer 的高度"——负 margin、幽灵伪元素、高度写死，footer 高度一变，整套 hack 全部要跟着改。

**而 Flex 的解法**（3.4.2）为什么这么优雅？因为它压根不需要知道 footer 多高：`margin-top: auto` 的语义是"**吃掉所有剩余空间**"，剩余空间是多少，由浏览器实时算出来。footer 是 56px 还是 100px，都不影响——**你描述的是"贴底"这个关系，而不是"预留 56px"这个算数**。

这又是 00 章哲学一（声明式）的完美例证：**传统 hack 是在"算"（负 margin、幽灵元素、写死高度），Flex 是在"声明"（margin-top: auto，贴底）。**

> 一句话记住它：**底部固定用 `margin-top: auto` 把 footer/按钮推到容器底部；配合外层 `flex-direction: column + min-height: 100vh`，内容不足一屏时贴底、超过一屏时自然跟随——把"贴底"的意图写在 footer 自己身上，不用算高度，这是声明式布局对 float 时代 hack 的降维打击。**

---

## 3.5 `flex-basis` 与 `width`：谁说了算

先给结论：在主轴方向上（`row` 时是横向），**`flex-basis` 的优先级高于 `width`**——当 `flex-basis` 是一个具体的非 `auto` 值时，`width` 会被无视；只有当 `flex-basis: auto` 时，`width` 才起作用。

### 3.5.1 优先级规则，一张表说清

| `flex-basis` 的值 | `width` 是否生效 | 最终主轴尺寸 |
|---|---|---|
| `auto`（默认） | **生效** | 用 `width` 的值（没设 `width` 就用内容宽度） |
| 具体长度（`200px`） | **被无视** | 用 `flex-basis` 的值 |
| `0` / `0%` | **被无视** | 从 0 开始（配合 grow 均分） |

看代码验证：

```html
<div class="box">
  <div class="a">A</div>
  <div class="b">B</div>
  <div class="c">C</div>
</div>
```

```css
.box { display: flex; width: 600px; }
.a {
  width: 100px;
  flex-basis: 200px;   /* flex-basis 非 auto，width 被无视 → 200px */
}
.b {
  width: 100px;
  flex-basis: auto;    /* flex-basis auto，用 width → 100px */
}
.c {
  width: 100px;
  flex-basis: 0%;      /* flex-basis 0%，width 被无视 → 0 + grow */
  flex-grow: 1;
}
```

**效果**：

- **A**：`flex-basis: 200px` 是非 auto 值，`width: 100px` 被无视，A 的基准是 **200px**。
- **B**：`flex-basis: auto`，回退到 `width: 100px`，B 的基准是 **100px**。
- **C**：`flex-basis: 0%`，`width` 被无视，基准是 0，配合 `flex-grow: 1` 吃掉剩余空间（600 - 200 - 100 = 300px）。

### 3.5.2 为什么这么设计

这背后是 CSS 的"**主轴尺寸由谁决定**"的权衡。`width` 是**通用盒模型**的属性（块级元素、行内元素都认它）；`flex-basis` 是 **flex 专属**的、作用于主轴的属性。当两者同时存在且冲突时，Flex 让**更具体、更贴近当前布局语境**的 `flex-basis` 优先——这符合"更具体的声明盖过更笼统的声明"的层叠直觉（00 章哲学二）。

**一个重要的副作用**：因为 `flex-basis` 作用于**主轴**，而 `width` 是**横向**的，所以：

- `row`（主轴水平）时，`flex-basis` 和 `width` 是"同一个方向"的，会互相竞争，`flex-basis` 赢。
- `column`（主轴垂直）时，`flex-basis` 管的是"高度"，此时和 `height` 竞争（`flex-basis` 赢），而 `width` 管横向、和 `flex-basis` 不冲突。

**这个差异是"轴"心智模型的又一个实战体现**：`flex-basis` 永远跟主轴走，`width`/`height` 永远跟物理方向走。主轴转了，`flex-basis` 的对手就从 `width` 换成了 `height`。

### 3.5.3 实战建议：别让两者打架

既然 `flex-basis` 会覆盖 `width`，最佳实践是**二选一，别同时写**，否则维护时容易懵：

```css
/* ❌ 同时写，width 是死代码，读的人不知道哪个生效 */
.item { width: 100px; flex-basis: 200px; }

/* ✅ 要么只写 flex-basis（语义清晰：主轴基准 200px） */
.item { flex-basis: 200px; }

/* ✅ 要么用 flex 缩写一并表达 grow/shrink/basis */
.item { flex: 1 1 200px; }
```

**唯一合理的"两者共存"场景**：你想让元素在 `row` 时有基准、在 `column` 时又有横向宽度——但这种情况太罕见，绝大多数时候"只写一个"就对了。

### 3.5.4 换成 `column`：`flex-basis` 的对手变成 `height`

这条规则一旦和"轴"联系起来，就豁然开朗。因为 `flex-basis` 作用于**主轴**，所以主轴方向变了，它竞争的对手也变了：

- `row`（主轴水平）：`flex-basis` 和 `width` 竞争，`flex-basis` 赢。
- `column`（主轴垂直）：`flex-basis` 和 **`height`** 竞争，`flex-basis` 赢；而 `width` 此时管的是**交叉轴**，和 `flex-basis` 不冲突。

```html
<div class="col-box">
  <div class="a">A</div>
  <div class="b">B</div>
</div>
```

```css
.col-box {
  display: flex;
  flex-direction: column;   /* 主轴变成垂直 */
  height: 400px;
  border: 2px solid #999;
}
.a {
  height: 100px;           /* column 下，height 是"高度" */
  flex-basis: 200px;       /* flex-basis 也管"高度"，覆盖 height → 200px */
  background: #e8f1ff;
}
.b {
  height: 100px;
  flex-basis: auto;        /* basis auto，回退到 height → 100px */
  background: #ffe8e8;
}
```

**效果**：`column` 方向下，A 的 `flex-basis: 200px` 覆盖了 `height: 100px`，A 高 200px；B 的 `flex-basis: auto` 回退到 `height: 100px`，B 高 100px。**同样是"flex-basis 优先"，只是对手从 `width` 换成了 `height`。**

**这再次印证第 02 章的核心心智模型**：`flex-basis` 跟"主轴"走，`width`/`height` 跟"物理方向"走。你记不住"basis 覆盖谁"，就记"basis 永远跟主轴同向，主轴转到哪，basis 就顶替那个方向的尺寸属性"。

### 3.5.5 `min-width`/`max-width` 对伸缩的约束

`flex-grow`/`flex-shrink` 的伸缩，最后还要过一道关——**`min-width` 和 `max-width` 的钳制**。伸缩结果不能超出这两个边界：

```html
<div class="box">
  <div class="grow-item">A</div>
  <div class="grow-item">B</div>
</div>
```

```css
.box { display: flex; width: 600px; gap: 8px; }
.grow-item {
  flex: 1;               /* 1 1 0%，想均分 300px */
  max-width: 100px;      /* 但 max-width 100px 钳住它 */
  background: #2f6fed; color: #fff;
}
```

**效果**：两个 `.grow-item` 都 `flex: 1` 想均分 600px（各 300px），但 `max-width: 100px` 把它们钳在 100px，于是多出来的 400px 成了空白（没人能吃掉，因为 max-width 挡住了 grow）。

**这套钳制规则的优先级**，从高到低是：

1. `min-width` / `max-width`（硬边界，最优先）；
2. `flex-basis`（基准，在其上计算伸缩）；
3. `flex-grow` / `flex-shrink`（在边界内伸缩）。

所以"元素怎么都缩不到比内容小"（3.6 节的坑），本质上就是 `min-width: auto` 这个"硬边界"在钳制 `flex-shrink`。理解了这条优先级链，`min-width: 0` 的作用就不言自明：**它是把"硬边界"下调到 0，让 `flex-shrink` 真正发挥**。

**实战建议**：想"限制某个 flex item 的最大/最小尺寸"，用 `max-width`/`min-width`（或 `max-height`/`min-height`），它们比 `flex-basis` 更"硬"，不会被 grow/shrink 突破。比如"侧栏至少 200px、最多 300px"，就写 `min-width: 200px; max-width: 300px`。

> 一句话记住它：**主轴方向上 `flex-basis` 优先级高于 `width`：basis 非 auto 时 width 被无视，basis 为 auto 时才回退到 width；两者别同时写，用 `flex-basis` 或 `flex` 缩写表达意图。换 `column` 时，basis 的对手从 `width` 变成 `height`，道理不变。**

---

## 3.6 `min-width: 0`：Flex 里最容易踩的坑

先给结论：**flex item 默认的 `min-width` 是 `auto`，不是 `0`。** 这意味着一个 flex item 的宽度**不会缩到比它的内容（尤其是长串不换行文本）更小**，于是"内容把容器撑爆、溢出、其他兄弟被挤"就发生了。解法是显式 `min-width: 0`。

### 3.6.1 现象：一个长文本把整个布局撑爆

```html
<div class="row">
  <div class="avatar">头像</div>
  <div class="text">
    这是一段超级超级超级超级超级超级超级超级超级超级长的、不会换行的文字aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
  </div>
</div>
```

```css
.row {
  display: flex;
  width: 300px;               /* 容器很窄 */
  border: 2px solid #999;
}
.avatar { width: 48px; height: 48px; background: #2f6fed; color: #fff; flex-shrink: 0; }
.text { flex: 1; }
```

**现象**：`.text` 明明是 `flex: 1`（应该自适应剩余宽度），但它里面的超长文本**不会换行**（因为中文长串无空格时浏览器可能不换行，英文长单词也不换行），于是 `.text` 的宽度被内容撑到比剩余空间还大，**溢出 `.row` 容器**，文字跑到了 300px 边框外面。

**为什么会这样？** 因为 `.text` 是 flex item，它的默认 `min-width: auto`。`min-width: auto` 在 flex 里的含义是：**"我的最小宽度不能小于我内容的 min-content 宽度"**。而这段长文本的 min-content 宽度就是它整段不换行的宽度（很大）。所以即使 `flex: 1` 想把它缩到 252px（300 - 48），`min-width: auto` 也不允许，于是溢出。

### 3.6.2 正解：`min-width: 0`

```css
/* ✅ 允许 flex item 缩到比内容更小 */
.text {
  flex: 1;
  min-width: 0;   /* 关键：覆盖默认的 min-width: auto */
}
```

**效果**：`.text` 的宽度被老老实实限制在剩余空间内（252px），超长文本在 `.text` 内部换行（如果设了 `overflow: hidden` / `text-overflow: ellipsis`，还能实现省略号）。

**`min-width: 0` 的完整语义**：它告诉浏览器"这个 flex item 允许缩到 0 宽度"。这样 `flex-shrink` 和 `flex: 1` 的收缩才能真正生效，不再被内容的最小宽度卡住。

### 3.6.3 最经典的实战场景：文本溢出省略号

`min-width: 0` 最常见的用法，就是配合 `text-overflow: ellipsis` 做"单行省略号"：

```html
<div class="row">
  <div class="avatar">头像</div>
  <div class="text">这是一个很长的用户名或者文件标题，需要被省略号截断</div>
</div>
```

```css
.row { display: flex; width: 300px; border: 2px solid #999; align-items: center; }
.avatar { width: 48px; height: 48px; background: #2f6fed; color: #fff; flex-shrink: 0; }
.text {
  flex: 1;
  min-width: 0;            /* ① 允许收缩 */
  white-space: nowrap;     /* ② 强制单行 */
  overflow: hidden;        /* ③ 超出隐藏 */
  text-overflow: ellipsis; /* ④ 超出显示省略号 */
}
```

**效果**：超长文本被截断成"这是一个很长的用户名或者文件标题，需要被省…"。**注意四件套缺一不可**——尤其 `min-width: 0`，很多人忘了它，导致 `text-overflow: ellipsis` 死活不生效，因为元素根本没被允许收缩，也就谈不上"超出"。

### 3.6.4 为什么默认是 `min-width: auto` 而不是 0

这是一个值得想清楚的"设计意图"问题。**如果 flex item 默认 `min-width: 0`**，那么任何内容都可能被压扁到看不见——一个按钮里的文字、一个图标，都可能被 `flex-shrink` 缩成一条缝。这显然不是大多数场景想要的。

所以规范选择了 `min-width: auto` 作为默认：**默认保护内容，宁可溢出也不把内容压没。** 这是"内容优先"的默认策略。

**代价**就是：当你**确实需要**让某个元素收缩到比内容更小（做省略号、做等宽分栏）时，你得**显式声明** `min-width: 0` 来"放弃保护"。这是一个"默认安全、需要时手动放开"的经典设计——和 `flex-shrink: 1` 的"默认适应容器"形成互补：**shrink 管"能缩多少"，min-width 管"至少不能小于多少"**。

### 3.6.5 `min-width: 0` 的其他两个高频场景

场景一：**等宽分栏里的长内容**。你想让 `flex: 1` 的几列严格等宽，但某一列里有长文本，结果那列被撑宽了：

```html
<div class="cols">
  <div class="col">短</div>
  <div class="col">超级超级超级超级超级超级超级超级长的内容aaaaaaaaaaaaaaaa</div>
  <div class="col">短</div>
</div>
```

```css
.cols { display: flex; width: 600px; gap: 8px; }
/* ❌ 没有 min-width: 0：中间那列被长内容撑宽，三等分失败 */
.col { flex: 1; border: 1px solid #999; }
```

```css
/* ✅ 加了 min-width: 0：三列严格等宽，长内容在列内换行 */
.col { flex: 1; min-width: 0; border: 1px solid #999; }
```

**现象**：`flex: 1` 想让三列等宽，但中间列的长内容让它的 `min-width: auto` 生效，把它撑得比另外两列宽。加了 `min-width: 0` 后，三列严格 200px，长内容在列内换行。

场景二：**`overflow: hidden` 也能顺带解决（但语义不同）**。规范规定：当 flex item 的 `overflow` 不是 `visible` 时，它的自动最小尺寸（`min-width: auto`）会解析为 0。所以：

```css
/* ✅ 也能解决溢出：overflow 非 visible 时，自动最小尺寸变成 0 */
.col { flex: 1; overflow: hidden; }
```

**但两者的语义不同**：`min-width: 0` 是"我声明允许收缩"（更精确），`overflow: hidden` 是"超出隐藏"（顺带触发了收缩）。**最佳实践是显式写 `min-width: 0`**——它表达意图更明确，不依赖"副作用"。`overflow: hidden` 该留给"真的需要裁掉溢出内容"的场景。

### 3.6.6 快速诊断口诀

遇到"flex 布局里内容溢出/撑爆"，按这个顺序排查：

1. 溢出的那个元素是不是 flex item？→ 是。
2. 它的内容是不是"不换行的长文本"（长 URL、长单词、`white-space: nowrap`）？→ 是。
3. 它有没有 `min-width: 0`（或非 visible 的 `overflow`）？→ 没有。

三条全中，问题就是 `min-width: auto` 在作祟，加 `min-width: 0` 即可。

> 一句话记住它：**flex item 默认 `min-width: auto`（保护内容不被压没），导致长文本/省略号/等宽分栏场景溢出；显式 `min-width: 0` 才能让它真正收缩——省略号四件套 `min-width: 0 + white-space: nowrap + overflow: hidden + text-overflow: ellipsis` 一个都不能少。**

---

## 3.7 居中 N 种写法里，Flex 的地位

先给结论：水平垂直居中是 CSS 被搜索次数最多的需求（00 章 0.1 节提过）。在 N 种写法里，**Flex 的 `justify-content: center + align-items: center` 是"为居中而生"的官方答案**，它对大多数场景是最优解。但要知道它和另外几个老方法的区别，才能选对。

### 3.7.1 Flex 居中：两行搞定

```html
<div class="parent">
  <div class="child">我要居中</div>
</div>
```

```css
.parent {
  display: flex;
  justify-content: center;   /* 主轴居中（水平） */
  align-items: center;       /* 交叉轴居中（垂直） */
  width: 300px;
  height: 200px;
  border: 2px solid #999;
}
.child {
  padding: 8px 16px;
  background: #2f6fed; color: #fff;
}
```

**效果**：`.child` 在 `.parent` 里水平垂直都居中。**无论 `.child` 是固定宽高还是内容自适应，都能居中**——这是它比"绝对定位 + transform"强的地方。

### 3.7.2 对比其他几种写法

| 写法 | 核心代码 | 局限 |
|---|---|---|
| **Flex** | `display: flex; justify-content: center; align-items: center` | 无（几乎万能） |
| **Grid** | `display: grid; place-items: center` | 无（更短，一行） |
| 绝对定位 + transform | `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)` | 子元素脱离文档流；需要父容器 `position: relative` |
| 绝对定位 + margin auto | `position: absolute; inset: 0; margin: auto` + 固定宽高 | 需要子元素固定宽高 |
| `line-height` 法 | `line-height: 200px; text-align: center` | 只能居中单行文本 |

**Flex 和 Grid 是"官方居中"**，其他都是"借来的能力"（00 章哲学一）。那 Flex 和 Grid 之间怎么选？

```css
/* Flex：两行 */
.parent { display: flex; justify-content: center; align-items: center; }

/* Grid：一行（place-items 是 align-items + justify-items 的缩写） */
.parent { display: grid; place-items: center; }
```

**两者效果完全一样。** 选哪个纯看习惯和上下文：

- 容器里**只居中一个元素**，用 Grid 的 `place-items: center` 最简洁。
- 容器里**还要做其他一维排列**（比如居中多个元素、居中 + 分布），用 Flex 更顺。

**最佳实践**：**"居中"这个单一需求，Flex 和 Grid 都行，别再用绝对定位 + transform 了**——它需要子元素脱离文档流、需要父容器定位、还带一个 `translate` 的"魔法偏移"，维护成本高、语义也差。除非你要让居中元素"覆盖在别的元素之上"（这是绝对定位的额外能力），否则一律 Flex/Grid。

### 3.7.3 Flex 居中的两个边界情况

**边界一：子元素比容器还大时，`center` 会"裁掉两边"。** 当居中元素比容器宽/高时，`justify-content: center` 会让元素**从中间向两边溢出**，左右两边同时被裁掉（而非只裁一边）：

```css
.parent {
  display: flex;
  justify-content: center;
  width: 200px;
  overflow: hidden;
}
.child { width: 400px; }   /* 比父容器宽一倍 */
```

**现象**：400px 宽的 `.child` 在 200px 容器里居中，结果是**左边 100px 和右边 100px 都被裁掉**，只剩中间 200px。如果你希望"从左边开始显示、右边裁掉"（比如图片缩略图），应该用 `justify-content: flex-start` 而不是 `center`。这是 `center` 的一个容易忽略的行为。

**边界二：多行文本的"垂直居中"。** `align-items: center` 居中的是"元素的盒子"，不是"里面的文字"。对多行文本来说，盒子居中通常也就够了；但如果你要的是"文字块内行与行也居中"，那是 `text-align` 和行高的活，别指望 `align-items`：

```css
/* align-items: center 只居中"这个 div 盒子" */
/* 盒子内部的文字对齐，靠 text-align（水平）和 line-height（垂直单行） */
.box {
  display: flex;
  align-items: center;
  justify-content: center;
}
.box p {
  text-align: center;   /* 盒子内的文字水平居中 */
}
```

**关键认知**：Flex 的 `align-items`/`justify-content` 操作的是 **flex item（盒子）**，不是 item 内部的**内容（文字）**。要区分"居中盒子"和"居中盒子里面的文字"这两个不同的需求。

### 3.7.4 多元素居中：`gap` 让它们既居中又有间距

前面都是"单个元素居中"，如果是"多个元素要居中且彼此有间距"，Flex 是唯一能一行搞定的：

```html
<div class="parent">
  <button>按钮1</button>
  <button>按钮2</button>
  <button>按钮3</button>
</div>
```

```css
.parent {
  display: flex;
  justify-content: center;   /* 整组水平居中 */
  align-items: center;       /* 垂直居中 */
  gap: 12px;                 /* 元素之间 12px，且首尾不额外留白 */
  height: 120px;
  border: 2px solid #999;
}
```

**效果**：三个按钮作为一个整体水平居中，彼此间距 12px。**这里 `gap` 的价值就体现出来了**——如果用 `margin` 给每个按钮设间距，首尾会多出 margin，居中的"整组"就会因为首尾 margin 而偏移。`gap` 只在元素之间起作用，整组居中的位置才是"视觉上真居中"。

> 一句话记住它：**水平垂直居中，用 `justify-content: center + align-items: center`（Flex）或 `place-items: center`（Grid）；它们是为居中而生的官方能力，绝对定位 + transform 只在"需要覆盖层"时才用。注意 Flex 居中操作的是"盒子"不是"盒子里的文字"，且子元素比容器大时 `center` 会两边都裁。**

---

## 3.8 三个高频坑：三等分、stretch、space-between 末行

先给结论：这一节把 Flex 三个最高频的实战坑集中复盘。它们有一个共同点——**都是"默认值"惹的祸**。记死默认值，这三个坑全消失。

### 3.8.1 坑一：`flex: 1` 三等分，但内容长短不一

**需求**：三个按钮三等分一行。**写法**：三个都 `flex: 1`。**但**，如果你写成了 `flex: auto`，就会翻车：

```html
<div class="row">
  <div class="col">保存</div>
  <div class="col">这是一个超级长的按钮名字</div>
  <div class="col">取消</div>
</div>
```

```css
.row { display: flex; width: 600px; }
/* ❌ flex: auto（1 1 auto）：先按内容宽度占位，内容长的那个更宽 */
.col { flex: auto; border: 1px solid #999; }
```

```css
/* ✅ flex: 1（1 1 0%）：忽略内容宽度，严格三等分 */
.col { flex: 1; border: 1px solid #999; }
```

**现象**：用 `flex: auto` 时，"这是一个超级长的按钮名字"明显更宽，三个不等宽；用 `flex: 1` 时，三个严格 200px 等宽（长文本在内部换行或溢出）。

**为什么**：这是第 02 章 2.6 节的核心结论——`flex-basis: auto` 尊重内容宽度，`flex-basis: 0%` 忽略内容宽度。**要"严格等宽"，`flex-basis` 必须是 0%，也就是写 `flex: 1`。**

### 3.8.2 坑二：`align-items: stretch` 默认拉伸

`align-items` 的默认值是 `stretch`，它会**把没有固定高度的 flex item 拉到和容器一样高**。这个"等高"有时是你要的（等高卡片），有时是意外：

```html
<div class="row">
  <div class="box-a">矮内容</div>
  <div class="box-b">高内容<br>高内容<br>高内容<br>高内容</div>
</div>
```

```css
.row { display: flex; border: 2px solid #999; }
.box-a { background: #e8f1ff; }   /* 没设高度 */
.box-b { background: #ffe8e8; }   /* 没设高度 */
```

**现象**：`.box-a` 内容只有一行，但因为 `align-items: stretch`（默认），它被拉伸到和 `.box-b` 一样高——**背景色充满了整个容器高度**。如果你本来想要 `.box-a` 只占内容高度（贴顶），这就是个意外。

**正解**：

```css
/* ✅ 想要"各自内容高度、顶部对齐"，覆盖默认 stretch */
.row { display: flex; align-items: flex-start; }

/* 或者单个元素覆盖 */
.box-a { align-self: flex-start; }
```

**关键认知**：`stretch` 默认拉伸的是"**交叉轴方向**没设尺寸"的元素。`row` 时是高度，`column` 时是宽度。所以"为什么我这个元素被拉高了/拉宽了"的答案，十有八九是忘了 `align-items` 默认 `stretch`。

### 3.8.3 坑三：`space-between` 最后一行不满

这是卡片流（3.2 节）最常遇到的可视化瑕疵：`flex-wrap: wrap` + `justify-content: space-between`，最后一行元素不满时，会被"两端贴边"撑开。

```html
<div class="row">
  <div class="card">1</div><div class="card">2</div><div class="card">3</div>
  <div class="card">4</div><div class="card">5</div><div class="card">6</div>
  <div class="card">7</div>
</div>
```

```css
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;   /* 每行两端贴边 */
  width: 700px;
}
.card { width: 200px; height: 80px; background: #2f6fed; color: #fff; margin-bottom: 16px; }
```

**现象**：容器 700px、卡 200px，一行放 3 张（3×200 = 600，剩 100 分给两个间隙）。前两行 1-2-3、4-5-6 两端贴边正常；最后一行只有第 7 张，它贴左，右边空着 500px——**"最后一行散开"**。

**为什么 Flex 无解**：`justify-content` 是**每行独立**作用的，它不知道"这是最后一行、只有 1 个元素"，只能按"1 个元素 + space-between"处理，于是贴左。**Flex 没有"让最后一行不满的元素保持固定宽度"的能力**（这是它一维本质的必然，第 02 章 2.9 节讲过）。

**对比 Grid 天然规避**：

```css
/* ✅ Grid：repeat + minmax 让每一列的宽度固定，最后一行不满也不散 */
.row {
  display: grid;
  grid-template-columns: repeat(3, 200px);   /* 3 列，每列固定 200px */
  justify-content: space-between;
  gap: 16px;
}
```

**现象**：Grid 里每一列宽度由 `grid-template-columns` 严格定义，第 7 张卡只会占第一列的位置、保持 200px 宽，**不会散开也不会被拉宽**。这就是第 06 章"卡片墙用 Grid"的核心理由。

**Flex 的补救办法**（如果必须用 Flex）：给最后一行"塞几个看不见的占位元素"补齐，或者用 `::after` 伪元素占位：

```css
/* Flex 的 hack：用伪元素补足最后一行 */
.row::after {
  content: "";
  width: 200px;   /* 和卡片等宽，占住最后一行的剩余位置 */
}
```

但这个 hack 脆弱、不通用，**不如直接换 Grid**。

### 3.8.4 三个坑的诊断自查表

遇到 Flex 布局"不对劲"，先别乱试，按这张表定位：

| 症状 | 先怀疑 | 检查 |
|---|---|---|
| 元素宽度不一样，内容长的更宽 | `flex-basis: auto` | 是不是写了 `flex: auto` 而不是 `flex: 1`？ |
| 元素被拉高/拉宽了 | `align-items: stretch` | 是不是没设 `align-items`（默认就是 stretch）？ |
| 最后一行散开/被拉宽 | Flex 一维本质 | 是不是用了 `flex-wrap` + `space-between`/`flex-grow`？ |
| 内容溢出、撑爆容器 | `min-width: auto` | 溢出的元素有没有 `min-width: 0`？ |
| 宽度和预期不符 | `flex-basis` vs `width` | 是不是同时写了 `width` 和 `flex-basis`？ |
| 元素没被推到想要的位置 | `justify-content` 被架空 | 是不是子元素有 `margin: auto`？ |

**一个总的诊断心法**：Flex 的坑 90% 是"默认值"和"优先级"两类——要么忘了默认值（`auto`/`1`/`stretch`/`auto`），要么搞混了优先级（`flex-basis` > `width`、`margin: auto` > `justify-content`）。**把第 02 章和第 03 章的默认值、优先级各背一遍，绝大部分 bug 不需要 debug，直接就能看出来。**

> 一句话记住它：**三个坑的根源都是默认值——`flex: auto` 的 basis 是内容宽（要等宽用 `flex: 1`）、`align-items` 默认 `stretch`（要各自高度用 `flex-start`）、`space-between` 末行散开（Flex 无解，换 Grid）。诊断时先查"默认值"和"优先级"两类。**

---

## 3.9 本章常见坑速查

| 坑 | 现象 | 原因 | 正确做法 |
|---|---|---|---|
| `flex: 1` 想三等分却宽度不一 | 内容长的更宽 | 误写 `flex: auto`（basis auto） | 严格等宽用 `flex: 1`（basis 0%） |
| 圣杯中间列被内容撑大 | 两侧栏被挤掉 | 中间列用了 `flex: auto` | 中间列用 `flex: 1`（basis 0%） |
| 长文本撑爆容器、溢出边框 | 文字跑出容器 | flex item 默认 `min-width: auto`，不许缩到比内容小 | 该元素加 `min-width: 0` |
| `text-overflow: ellipsis` 不生效 | 没有省略号 | 缺了 `min-width: 0`，元素没被允许收缩 | 四件套：`min-width: 0 + nowrap + hidden + ellipsis` |
| footer 悬在半空 | 内容不足一屏时页脚没贴底 | 没处理剩余空间 | footer 加 `margin-top: auto`，外层 `min-height: 100vh` |
| 元素莫名被拉高/拉宽 | 背景充满容器 | `align-items` 默认 `stretch` | 想要各自尺寸用 `align-items: flex-start` 或 `align-self` |
| 卡片流最后一行卡片被拉宽 | 孤卡占满整行 | `flex-grow: 1` + 最后一行不满 | 换 Grid（`auto-fill + minmax`） |
| `space-between` 最后一行散开 | 最后一行元素贴左 | `justify-content` 每行独立作用 | 换 Grid，或用伪元素占位 hack |
| 同时写 `width` 和 `flex-basis` | 宽度和预期不符 | `flex-basis` 非 auto 时覆盖 `width` | 二选一，别同时写 |
| 卡片流留白/塞不满 | 一行右边空一块 | 用固定 `width` 而非弹性 `flex` | 用 `flex: 1 1 220px`（grow 铺满、shrink 塞满） |

---

## 3.10 本章小结

- 导航栏"logo 左、菜单右"，`margin-left: auto` 比 `space-between` 更灵活，能精确控制哪个元素被推。
- 卡片流 = `flex-wrap + flex: 1 1 220px`：basis 是理想宽度，grow 铺满、shrink 塞满。
- 圣杯布局 = 外层 `column` + 内层 `row`；两侧固定、中间 `flex: 1`（basis 0%）自适应。
- 底部固定用 `margin-top: auto`，配合 `flex-direction: column + min-height: 100vh`。
- **`flex-basis` 优先级高于 `width`**：basis 非 auto 时 width 被无视，basis 为 auto 时才回退到 width。
- **flex item 默认 `min-width: auto`**（保护内容不被压没），长文本/省略号场景必须显式 `min-width: 0`。
- 水平垂直居中用 `justify-content: center + align-items: center`（或 Grid 的 `place-items: center`），是官方能力。
- 三个高频坑都是默认值惹的祸：`flex: auto`（basis 内容宽）、`align-items: stretch`、`space-between` 末行。

---

## 3.11 动手练习

1. 写一个"logo 左 + 三个菜单项 + 登录按钮右"的导航栏，要求登录按钮和菜单之间固定 32px 间距。你会怎么写？

   <details><summary>参考答案</summary>
   `.navbar { display: flex; align-items: center; }`；`.menu { display: flex; gap: 20px; margin-left: auto; }`（菜单推到右）；`.login { margin-left: 32px; }`（登录按钮和菜单固定 32px）。关键是用 `margin-left: auto` 而不是 `space-between`，因为这里有多个子元素。
   </details>

2. 一段很长的、不换行的 URL 放在一个 `flex: 1` 的 div 里，结果把容器撑爆了。写出正解（要求显示省略号）。

   <details><summary>参考答案</summary>
```css
   .url {
     flex: 1;
     min-width: 0;            /* 关键，允许收缩 */
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
   }
```
   根因是 flex item 默认 `min-width: auto`，禁止缩到比内容小。`min-width: 0` 放开这个限制。
   </details>

3. 判断对错：`flex-basis: 200px` 和 `width: 200px` 同时写，元素的宽度是 `width` 的 200px。

   <details><summary>参考答案</summary>
   错。主轴方向（row）上，`flex-basis` 非 auto 时优先级高于 `width`，所以宽度是 `flex-basis` 的 200px（假设两者相等就看不出来，改成不同值就能验证）。`width` 只在 `flex-basis: auto` 时才生效。
   </details>

4. 圣杯布局的中间主内容列，为什么推荐 `flex: 1` 而不是 `flex: auto`？

   <details><summary>参考答案</summary>
   `flex: auto` 是 `1 1 auto`，basis 是内容宽度，主内容里的长文本会把主列撑大，挤掉两侧固定栏。`flex: 1` 是 `1 1 0%`，basis 是 0，主列宽度完全由剩余空间决定，内容再多也限制在剩余空间内，两侧栏保持固定。
   </details>

5. 卡片流用 `flex: 1 1 220px`，为什么最后一行不满的卡片会被拉宽？换成 Grid 怎么写？

   <details><summary>参考答案</summary>
   因为 `flex-grow: 1` 让最后一行那孤卡吃掉整行剩余空间被拉宽，这是 Flex 一维本质的必然。Grid 写法：`.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }`，最后一行不满的卡会保持和其他卡一样的列宽。
   </details>

6. "等高卡片 + 每张卡片按钮贴底"这个组合，用 Flex 怎么实现？涉及哪两个 flex 关键属性？

   <details><summary>参考答案</summary>
   外层容器 `display: flex; align-items: stretch;`（默认就 stretch，保证卡片等高）；每张卡片内部 `display: flex; flex-direction: column;`，按钮 `margin-top: auto;` 贴底。涉及的关键属性：`align-items: stretch`（等高）和 `margin-top: auto`（按钮贴底）。
   </details>

7. 你同事说："`min-width: 0` 这个属性好怪，为什么要手动告诉浏览器可以缩到 0？默认缩到 0 不好吗？" 请解释默认 `min-width: auto` 的设计意图。

   <details><summary>参考答案</summary>
   默认 `min-width: auto` 是为了"保护内容"——如果默认就能缩到 0，一个按钮里的文字、一个图标都可能被 `flex-shrink` 压扁成一条缝看不见，这不符合大多数场景的预期。所以规范默认"宁可溢出也不压没内容"，当你确实需要收缩（省略号、等宽分栏）时，再显式 `min-width: 0` 手动放开。这是"默认安全、需要时放开"的设计。
   </details>

8. 一个导航栏"logo 左 + 搜索框中间 + 按钮右"，搜索框用了 `flex: 1`。用户输入很长内容后，搜索框把按钮挤出了容器。为什么？怎么修？

   <details><summary>参考答案</summary>
   搜索框是 flex item，默认 `min-width: auto`，输入长内容后它的 min-content 宽度变大，`min-width: auto` 禁止它缩到比内容小，于是撑爆、挤出按钮。修复：给搜索框加 `min-width: 0`，允许它收缩，配合 input 自带的滚动/裁剪。
   </details>

9. 两个 `flex: 1` 的子元素想均分 600px，但其中一个设了 `max-width: 100px`。最终它们各多宽？多出的空间去哪了？

   <details><summary>参考答案</summary>
   设了 `max-width: 100px` 的那个被钳在 100px。flex 算法会把它"冻结"在 100px，然后把剩余空间重新分给"还能伸缩"的另一个元素——它吃掉全部剩余，最终宽度 = 600 - 100 - gap ≈ 492px。关键认知：`max-width`/`min-width` 是硬边界，优先于 grow/shrink；某个元素被钳住后，多出的空间交给其他还能伸缩的兄弟。
   </details>

---

> 📖 **本章的代码示例**：`examples/03-Flexbox实战.html`（导航栏、卡片流、圣杯、底部固定、min-width:0 的坑的可视化演示）
> 🚀 **下一章**：第 04 章进入 CSS Grid——Flex 一维解决不了的问题，Grid 用二维网格一次搞定。
