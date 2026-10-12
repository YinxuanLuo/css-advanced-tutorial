# 第 05 章 · Grid 实战模式与常见坑

> 上一章你学会了 Grid 的全部核心概念：线定位、显式/隐式轨道、`fr`、`grid-template-areas`、对齐。
> 但"会语法"和"能实战"之间还有一道坎——**真实项目里，Grid 怎么组合出经典布局？哪些写法是行业标准？哪些坑一踩一个准？**
>
> 这一章就是来填这道坎的。你会看到三样东西：**经典布局的"标准答案"**（页面骨架、相册、仪表盘）、**一个"无需媒体查询的响应式"配方**（`auto-fit`）、以及**写 Grid 必踩的几个坑和它们的解法**。
>
> 本章你需要记住的就一件事：**Grid 的实战精髓是"声明骨架 + 让浏览器自适应"——你定死"几列、列多宽的下限"，内容多少、屏幕多宽，交给 `fr` 和 `auto-fit` 去算。而踩坑，十有八九是因为"忘了给轨道设下限"或"用了会乱序的特性"。**

---

## 5.1 经典布局一：页面骨架（圣杯 / 双飞翼，Grid 一行搞定）

**先给结论**：如果你还记得上一代布局的痛苦——"圣杯布局""双飞翼布局"这两个名词，背后是一大坨 `float` + 负 `margin` + 额外嵌套 `<div>` 的黑魔法——那么好消息是：**Grid 把这两个传说级布局，压缩成了一行 `grid-template-columns`。**

### 5.1.1 先搞懂：圣杯 / 双飞翼到底在解决什么

这两个布局的目标完全一样，都是一种**三列页面**：

```text
┌────────────────────────────────┐
│            header              │
├──────┬──────────────┬──────────┤
│ 左侧 │   主内容(中间)│  右侧    │
│ 固定 │   自适应      │  固定    │
├──────┴──────────────┴──────────┤
│            footer              │
└────────────────────────────────┘
```

三个硬性要求：

1. **左右两列固定宽度**，中间列自适应。
2. **中间列在 DOM 里排最前面**（`main` 写在 `aside` 前面）——为了 SEO（搜索引擎先抓主要内容）和移动端（小屏时主内容优先展示）。
3. 三列**等高**，footer 贴底。

**为什么以前这么难？** 因为第 2 条——"中间列 DOM 优先"——和"视觉上中间列在中间"是矛盾的。`float` 只能按 DOM 顺序从左往右排，要让 DOM 里的第一个元素（main）视觉上落在中间，就得用负 `margin` 把左右两列"拽"到 main 的两侧。于是诞生了圣杯（padding + 相对定位）和双飞翼（多套一层 div）两套补丁方案。

**而 Grid 之所以优雅，是因为它压根不关心 DOM 顺序。** 你可以在 HTML 里把 `main` 写最前面，然后用 `grid-template-areas` 把它"画"到中间——**DOM 顺序和视觉顺序彻底解耦。**

为了让你直观感受这个差距，看一眼 **float 时代的圣杯布局**（经典实现）到底有多苦：

```html
<div class="container">
  <main class="main">主内容（DOM 最前）</main>
  <aside class="left">左侧栏</aside>
  <aside class="right">右侧栏</aside>
</div>
```

```css
/* float 圣杯：主内容 DOM 优先但视觉居中，全靠负 margin + 相对定位硬拽 */
.container { padding: 0 150px 0 200px; }          /* 左右留出侧栏的坑位 */
.main  { float: left; width: 100%; }              /* 主内容占满，把两侧挤下去 */
.left  { float: left; width: 200px; margin-left: -100%; position: relative; left: -200px; }
.right { float: left; width: 150px; margin-left: -150px; position: relative; right: -150px; }
/* 还有等高问题、清除浮动、移动端重排……每一个都是额外的补丁 */
```

**对比**：上面这坨（还只是核心部分，没算清浮动、等高、移动端），在 Grid 里就是 5.1.2 的 **一行 `grid-template-columns: 200px 1fr 160px` + 几行 areas**。**这个对比本身，就是第 00 章"借用 vs 原生"哲学的最佳注脚。**

### 5.1.2 Grid 版圣杯：一行搞定

```html
<div class="page">
  <header class="hd">header</header>
  <main class="main">main（DOM 里排前面）</main>
  <aside class="left">左侧栏</aside>
  <aside class="right">右侧栏</aside>
  <footer class="ft">footer</footer>
</div>
```

```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr 160px;   /* 左固定、中自适应、右固定 */
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header header header"
    "left   main   right"
    "footer footer footer";
  min-height: 100vh;                        /* 让中间行有"剩余空间"可分 */
  gap: 10px;
}

.hd    { grid-area: header; }
.main  { grid-area: main; }
.left  { grid-area: left; }
.right { grid-area: right; }
.ft    { grid-area: footer; }
```

**渲染效果**：header 横跨三列，中间是"左固定 200px / 主内容自适应 / 右固定 160px"，footer 横跨三列。**注意 `main` 在 HTML 里排在第二个，但视觉上落在中间**——因为 `grid-template-areas` 那行 `"left main right"` 决定了视觉位置，和 HTML 顺序无关。

**对比一下，你要的是不是这个效果？** 三个要求全满足：

1. ✅ 左右固定、中间自适应：`200px 1fr 160px`。
2. ✅ 中间列 DOM 优先：HTML 里 `main` 写在最前，视觉位置由 areas 控制。
3. ✅ 三列等高：Grid 里同一行的列天然等高（都被拉伸到同一行高）。

### 5.1.3 移动端：一行改成单列

响应式时，一行字符串搞定：

```css
@media (max-width: 700px) {
  .page {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"      /* 主内容优先，紧跟 header —— 正好满足"移动端主内容优先" */
      "left"
      "right"
      "footer";
  }
}
```

**渲染效果**：小屏下五个区域竖着堆，而且**主内容排在最上面**（紧跟 header）。这正是"中间列 DOM 优先"诉求的终极兑现——移动端用户第一眼看到的是内容，不是侧栏。

### 5.1.4 三个"免费获得"的细节，以前要手动补丁

用 Grid 做页面骨架，有几个在 `float` 时代要写一堆补丁才能实现的效果，现在**免费附赠**了。了解它们，你才能体会到 Grid 到底替省了多少事：

**① 三列等高，免费。**

在 `float` 布局里，"左右两列要和中间列一样高"是个老大难——因为 float 元素高度互不感知，你得用"假等高"（背景渐变、大 padding + 负 margin、或 JS 算高度）来糊。Grid 里**同一行的列天然等高**（默认 `align-items: stretch`，所有列被拉伸到该行最高元素的高度）。你什么都不用做，三列自动一样高。

**② footer 贴底，一行 `min-height` 搞定。**

"内容少的时候，footer 也要贴住视口底部"是另一个经典需求。Grid 里 `min-height: 100vh` + 中间行 `1fr` 天然实现：

```css
.page {
  display: grid;
  grid-template-rows: 60px 1fr 60px;
  min-height: 100vh;
}
```

**原理**：`min-height: 100vh` 保证容器**至少**和视口一样高；中间行是 `1fr`，会吃掉所有"多余的高度"；于是当内容不足一屏时，footer 被 `1fr` 行挤到最底部；内容超过一屏时，容器自然长高，footer 跟着内容往下走。**两种状态都正确，不用 JS 判断内容高度。**

**③ DOM 优先的价值，不止 SEO。**

把 `main` 写在 DOM 最前面，除了搜索引擎先抓主内容，还有一个被忽略的好处：**移动端优先的响应式里，你不用 `order` 就能让主内容排在侧栏上面**（5.1.3 已经演示）——因为 DOM 顺序本来就是 main 在前。如果用 `float` 布局，侧栏写在 main 前面，移动端还得靠 `order` 或绝对定位把 main "挪"上去，又是一堆补丁。

### 5.1.5 不用 areas 的等价写法

如果你不喜欢 `grid-template-areas`，用线定位也能一行搞定：

```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr 160px;
  grid-template-rows: 60px 1fr 60px;
  gap: 10px;
  min-height: 100vh;
}
.hd    { grid-column: 1 / -1; }           /* 占满整行 */
.main  { grid-column: 2 / 3; grid-row: 2; }
.left  { grid-column: 1 / 2; grid-row: 2; }
.right { grid-column: 3 / 4; grid-row: 2; }
.ft    { grid-column: 1 / -1; }
```

**渲染效果**：和 areas 版完全一样。但**对比一下可读性**——areas 版里 `"left main right"` 一眼就知道谁在中间，线定位版你得逐个数 `grid-column`。这就是为什么**页面骨架这种"结构性布局"，强烈建议用 areas**（还记得 4.5.6 的结论吗：骨架用 areas，局部微调用线定位）。

> 一句话记住它：**圣杯/双飞翼的难，难在"中间列 DOM 优先 + 视觉居中"的矛盾，Grid 用"DOM 顺序和视觉顺序解耦"直接消解了它。`200px 1fr 160px` 一行就是三列骨架，移动端改一行 areas 字符串就变单列。**

---

## 5.2 经典布局二：相册网格与仪表盘

**先给结论**：相册网格和仪表盘，是 Grid 在真实项目里出场率最高的两个形态——相册考验"内容数量不定时的对齐"，仪表盘考验"区域化、跨行跨列的摆放"。学会这两个，你就覆盖了 90% 的 Grid 实战场景。

### 5.2.1 相册网格：内容不定，也要对齐

相册、商品墙、瀑布流预览……共同点是：**图片数量不定，但必须严格对齐成整齐的网格**。配方（4.6.4 已经剧透过）：

```html
<div class="album">
  <img src="https://picsum.photos/400/300" alt="">
  <img src="https://picsum.photos/400/500" alt="">
  <img src="https://picsum.photos/400/200" alt="">
  <img src="https://picsum.photos/400/400" alt="">
  <img src="https://picsum.photos/400/600" alt="">
  <img src="https://picsum.photos/400/300" alt="">
</div>
```

```css
.album {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 显式骨架：3 列 */
  grid-auto-rows: 200px;                  /* 隐式行：每行固定 200px */
  gap: 12px;
}
.album img {
  width: 100%;
  height: 100%;
  object-fit: cover;   /* 关键：图片按比例裁剪，填满格子，不变形 */
}
```

**渲染效果**：无论图片原本是横是竖、多高多宽，全部被 `object-fit: cover` 裁剪成 `格子大小` 的方块，整齐地排成 3 列。图片 6 张、60 张、600 张都一样——骨架 3 列不变，行数自动增长，每行 200px。

**两个关键点**：

1. **`grid-auto-rows: 200px`** 管的是"自动多出来的行"的高度。图片再多，每行都是 200px 高，不会因为某张图特别高就把整行撑变形。
2. **`object-fit: cover`** 是 Grid 相册的标配搭档。没有它，图片会按原始比例拉伸、变形，或者留白。`cover` 让图片"裁剪填满"，`contain` 让图片"完整放进、可能留白"。

### 5.2.2 仪表盘：区域化 + 跨行跨列

仪表盘是 `grid-template-areas` 的主场——几个卡片，有的宽、有的高、有的跨两行，用 ASCII 一画就出来：

```html
<div class="dash">
  <div class="kpi kpi-a">指标A</div>
  <div class="kpi kpi-b">指标B</div>
  <div class="kpi kpi-c">指标C</div>
  <div class="chart">主图表</div>
  <div class="list">列表</div>
</div>
```

```css
.dash {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 120px;
  grid-template-areas:
    "kpiA kpiB kpiC chart"
    "kpiA kpiB kpiC chart"
    "list list list chart";
  gap: 12px;
}
.kpi-a { grid-area: kpiA; }
.kpi-b { grid-area: kpiB; }
.kpi-c { grid-area: kpiC; }
.chart { grid-area: chart; }
.list  { grid-area: list; }
```

**渲染效果**：左边三个 KPI 卡竖着各占两行（高卡片），右边主图表独占一整列（跨三行），底部列表横跨三列。**这张图你一眼就能从 areas 字符串里"读"出来**，不需要在脑子里换算任何坐标。

**为什么仪表盘最适合 areas？** 因为仪表盘是典型的"**区域布局**"——卡片之间的空间关系（谁在上谁在下、谁宽谁高）比"精确到第几列"更重要。areas 直接表达空间关系，线定位表达精确坐标，前者才是仪表盘的语言。

### 5.2.3 相册的两个进阶变体

**变体一：突出某张图（跨列跨行的相册）**。相册不一定全是一样的方块，可以让第一张图放大：

```html
<div class="album2">
  <img class="feat" src="https://picsum.photos/800/600" alt="">
  <img src="https://picsum.photos/400/300" alt="">
  <img src="https://picsum.photos/400/300" alt="">
  <img src="https://picsum.photos/400/300" alt="">
  <img src="https://picsum.photos/400/300" alt="">
</div>
```

```css
.album2 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 150px;
  gap: 12px;
}
.album2 img { width: 100%; height: 100%; object-fit: cover; }
.feat { grid-column: span 2; grid-row: span 2; }   /* 第一张放大成 2×2 */
```

**渲染效果**：第一张图占据左上角 2×2 的大方块，其余图片绕着它自动填充，形成杂志式的"大小图混排"。**这里又一次体现了"先骨架、后微调"——普通图自动放置，特殊图用 `span` 突出。**

**变体二：想靠 `dense` 做"瀑布流"，要三思。** 很多人看到 `grid-auto-flow: dense` 能"回填空洞"，以为能做 Pinterest 那种瀑布流（masonry）。**这是个误会**——`dense` 只能"回填空洞"，不能让"高度不等的卡片紧凑堆叠"，它打乱的只是**放置顺序**，不是**高度**。真正的高度瀑布流目前要靠 CSS 的多列布局（`columns`）或 JS（比如 Masonry.js），或者等未来的 `masonry` 属性。**相册里有交互内容时，`dense` 直接禁用**（5.6.3 会展开）。

### 5.2.4 补充：Grid 也能做表单——它不只会"大布局"

很多人以为 Grid 只配做页面骨架、相册这种"大件"。其实**表单这种"小件"，Grid 反而比 Flex 更顺手**——因为表单的 label 和 input 天然需要"两列对齐"。

```html
<form class="form">
  <label for="name">姓名</label>
  <input id="name" type="text">
  <label for="email">邮箱</label>
  <input id="email" type="email">
  <label for="msg">留言</label>
  <textarea id="msg"></textarea>
</form>
```

```css
.form {
  display: grid;
  grid-template-columns: 100px 1fr;   /* label 列固定，input 列自适应 */
  gap: 12px 16px;
  align-items: center;                /* 让 label 和 input 垂直居中对齐 */
}
.form label { text-align: right; }
```

**渲染效果**：所有 label 排成整齐的左列（右对齐），所有 input/textarea 排成整齐的右列（自适应宽度），**每行的 label 和 input 严格对齐**。这就是 Grid 的"二维对齐"用在"一维表单"上的好处——你用 Flex 做两列表单，得手动算 label 宽度或额外嵌套；用 Grid，两列轨道天然对齐。

**这给我们一个重要提醒**：**"用 Flex 还是 Grid"的答案不是非黑即白，而是"看你要不要列对齐"**（4.1.2 讲过）。表单要"列对齐"，所以即使它是"一行一行的"，Grid 也常常是更好的选择。**不要被"Grid 是做二维大布局的"这种刻板印象框住。**

### 5.2.5 一个通用心法：先骨架，后微调

相册和仪表盘两个例子，其实体现同一套流程：

1. **先声明骨架**：`grid-template-columns` 定几列、多宽；`grid-auto-rows` 定行高。
2. **再用 areas 或线定位摆放特殊元素**：跨行的、跨列的单独点名。
3. **剩下的交给自动放置**：普通的格子，浏览器顺序塞。

**别反过来**——一上来就给每个元素写 `grid-column: 1/2; grid-row: 3/4`，那又退回"手动摆位"的老路，改一个元素全盘皆乱。

> 一句话记住它：**相册用"`repeat(n, 1fr)` 定列 + `grid-auto-rows` 定行高 + `object-fit: cover` 裁图"；仪表盘用 areas 画区域关系。套路永远是"先骨架、后微调、剩下的自动放置"。**

---

## 5.3 自适应网格：`repeat(auto-fit, minmax(200px, 1fr))`

**先给结论**：这一节是全书最有价值的一行 CSS——它让你**不用写任何媒体查询，就得到一个自动响应式的网格**：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```

**效果**：容器宽，卡片就多列；容器窄，卡片就自动折成少列；每一列的宽度**至少 200px，有剩余空间就均分**。拖动窗口宽度试试，列数会"啪"地跳变，但永远整齐、永远填满。

### 5.3.1 拆解这行代码，每个词都有含义

这行 CSS 是三个概念的叠加，逐个拆：

| 片段 | 含义 |
|---|---|
| `repeat(...)` | 重复一组轨道（第 04 章 4.3.3） |
| `auto-fit` | 重复次数**由容器宽度自动决定**（放得下几列就几列） |
| `minmax(200px, 1fr)` | 每列的宽度：**下限 200px，上限一份剩余空间** |

**它为什么能响应式？** 因为 `minmax(200px, 1fr)` 给每列设了一个"最小宽度下限"。浏览器算了这样一笔账：

> 容器宽 W，每列至少 200px、还要留 gap，最多能放下几列？放下 N 列，就生成 N 列，每列宽度在 [200px, 剩余/N] 之间弹性伸缩。

于是——容器 1000px 宽，能放 4 列（4×200 + 3×gap 勉强装下），就 4 列均分；窗口拖到 600px，放不下 4 列了，自动塌成 2~3 列。**这个"塌列"的过程，就是媒体查询 `@media (max-width: ...)` 干的事，而现在一行 CSS 替你干了。**

### 5.3.2 关键区别：`auto-fit` vs `auto-fill`

这是面试高频题，也是新手最容易懵的点。两者都是"自动决定列数"，但**当 item 数量少于"容器能容纳的列数"时，行为截然不同**。

先记住一句话：

> **`auto-fill` 会保留空轨道（占着空位），`auto-fit` 会把空轨道折叠掉、让现有 item 拉伸填满。**

看这个可复现的例子。容器很宽（能放 5 列），但只有 3 个 item：

```html
<div class="grid fill">   <!-- 左：auto-fill -->
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
<div class="grid fit">    <!-- 右：auto-fit -->
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

```css
.grid {
  display: grid;
  gap: 16px;
  border: 2px dashed #999;
}
/* 能放 5 列，但只有 3 个 item */
.fill { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.fit  { grid-template-columns: repeat(auto-fit,  minmax(200px, 1fr)); }
```

**渲染效果**：

- **`auto-fill`**：容器里有 5 条列轨道（因为能放 5 列就生成 5 列），3 个 item 各占 200px 起跳，**剩下的 2 条空轨道占着位置**——所以 item 挤在左边，右边留了一大片空白。
- **`auto-fit`**：容器先生成 5 列轨道，然后发现后 2 列是空的，**把它们折叠成 0**，剩下的 3 个 item 把整行均分拉伸——所以 item **铺满整个容器**。

### 5.3.3 那到底用哪个？

结论很明确：**绝大多数时候用 `auto-fit`。**

| 场景 | 用谁 |
|---|---|
| 卡片数量不定，希望"现有卡片铺满整行" | **`auto-fit`**（折叠空轨道，铺满） |
| 你希望"轨道数量恒定"，为后续可能动态插入的内容预留空位 | `auto-fill`（保留空轨道） |

`auto-fill` 的经典用途是"**你知道将来会有更多内容，现在先占住坑**"，或者配合**空状态**展示（比如 6 个固定坑位，现在只有 3 个有数据，另外 3 个显示"暂无"的虚线框）。除此之外，日常的相册、商品墙、卡片流，一律 `auto-fit`。

### 5.3.4 这个配方为什么值得背下来

因为它把第 00 章讲的"声明式布局"哲学发挥到了极致：

- **你没写"媒体查询"**，但你声明了意图："每列至少 200px，多了就均分"。
- **浏览器在渲染时**，用真实的容器宽度，算出该放几列。
- 换任何屏幕、任何内容数量，这条规则**都成立**。

这就是"写规则，而不是写坐标"的实战形态。**背下这行，你能扔掉 80% 的网格媒体查询。**

### 5.3.5 三个容易被忽略的边界

这行配方虽好，但有三个边界得心里有数，否则也会翻车：

**① `minmax` 的 `min` 设太大，会在窄屏溢出。**

```css
/* ❌ 下限 400px：手机屏（375px）上，一列都放不下，横向溢出 */
.grid { grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }
```

**现象**：手机屏宽 375px，但每列下限是 400px，连一列都装不下，网格横向溢出、出现横向滚动条。**修复**：`min` 值别超过最小目标屏宽（移动优先时，`min` 取 200~260px 比较稳妥），或者给容器加 `overflow` 处理。

**② `gap` 也参与"能放几列"的计算。**

`repeat(auto-fit, minmax(200px, 1fr))` 里，浏览器算"能放几列"时，`gap` 是要扣掉的。所以实际列数 = `floor((容器宽 + gap) / (min + gap))`。**别把 `min` 恰好卡在容器宽的某个整除点上**——比如容器 1000px、`min` 250px、`gap` 20px，一除正好有小数，列数会比你心算的少一列。多留点余量，别纠结"精确列数"。

**③ `auto-fit` 对"最后一行不满"无能为力。**

这是 `auto-fit` 的一个已知"不完美"：当 item 总数不是列数的整数倍时，**最后一行会填不满，剩下的 item 依然按列宽排，右边留白**（除非最后一行 item 数量刚好等于列数）。

```css
.grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
/* 12 个 item，容器能放 5 列 → 5+5+2，最后一行只有 2 个，右边空 3 列的位置 */
```

**现象**：前两行各 5 个，最后一行只有 2 个，孤零零地排在左边，右边空着。**这个"最后一行不满"是 Grid 自动放置的固有行为，`auto-fit` 无法让最后 2 个拉伸填满整行**（因为它们只是 5 列里的 2 个 item，不是"独立的一行"）。如果你的设计必须"最后一行也撑满"，得换方案（Flex 的 `flex-grow`、或显式控制数量）。

### 5.3.6 完整实战：一个真正的响应式卡片墙

把上面的配方放进真实场景——一个"无需媒体查询"的卡片墙：

```html
<div class="cards">
  <article class="card">
    <h3>标题一</h3>
    <p>一段介绍文字。</p>
  </article>
  <!-- ... 重复 N 个 article.card ... -->
</div>
```

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.card {
  display: flex;                 /* 卡片内部是"一维"的，用 Flex 更顺手 */
  flex-direction: column;
  padding: 20px;
  border: 1px solid #e4e7ee;
  border-radius: 10px;
}
```

**渲染效果**：桌面宽屏下，卡片自动排成 4~5 列；拉到平板，自动塌成 3 列；手机竖屏，自动变 1 列。**全程没有一个 `@media`**。注意这个例子还体现了 4.1 讲的"Grid 和 Flex 配合"——外层卡片墙用 Grid（二维、要列对齐），卡片内部标题+文字用 Flex（一维、纵向流动）。

> 一句话记住它：**`repeat(auto-fit, minmax(200px, 1fr))` = "列宽至少 200px、多了均分、列数自动"——一行免媒体查询的响应式。`auto-fit` 折叠空轨道（铺满），`auto-fill` 保留空轨道（占位），日常用 `auto-fit`。三个边界：`min` 别超最小屏宽、`gap` 参与算列数、最后一行填不满是常态。**

---

## 5.4 跨列跨行实战：`grid-column` / `grid-row` / `span`

**先给结论**：跨列跨行是 Grid 里"做亮点"的能力——普通格子自动放置，特殊元素跨一下，布局立刻有了层次。这一节把 `span` 和线号的各种组合一次讲透。

### 5.4.1 三种"跨"的写法，等价但语义不同

同一个"跨 3 列"，可以写三种：

```css
/* ① 指定起点 + 终点线号 */
.a { grid-column: 1 / 4; }

/* ② 指定起点 + 跨度 */
.b { grid-column: 1 / span 3; }

/* ③ 只写跨度，起点交给自动放置 */
.c { grid-column: span 3; }
```

**渲染效果**：三种都让元素横跨 3 列。区别在于"起点由谁决定"：

- ① 和 ② 钉死了起点（第 1 列线），元素位置固定。
- ③ 不指定起点，元素**从自动放置的下一个可用位置开始**，跨 3 列。

**实战怎么选**：

- **"必须在这个位置"** → 用 ①/②（钉死起点）。
- **"我只是想突出这个元素、占 3 列宽，位置随意"** → 用 ③（`span 3`）。

`span` 还能**和负数混用**，表达"从某条线往前/往后跨"：

```css
/* 从第 2 条线起，跨到末尾（等价于占后面所有列） */
.x { grid-column: 2 / -1; }
```

### 5.4.2 综合例子：杂志式排版

一个能同时看到"跨列 + 跨行 + span"的综合例子，杂志封面式的网格：

```html
<div class="mag">
  <div class="m hero">大图</div>
  <div class="m">2</div>
  <div class="m">3</div>
  <div class="m wide">宽条</div>
  <div class="m tall">高条</div>
  <div class="m">6</div>
</div>
```

```css
.mag {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 100px;
  gap: 12px;
}
.hero { grid-column: span 2; grid-row: span 2; }  /* 大图：跨 2 列 2 行 */
.wide { grid-column: span 2; }                     /* 宽条：跨 2 列 */
.tall { grid-row: span 2; }                        /* 高条：跨 2 行 */
```

**渲染效果**：`hero` 占左上角 2×2 的大方块，其它元素绕着它自动填充——`wide` 横跨两列，`tall` 竖跨两行。**你只给三个特殊元素写了规则，其余 3 个普通格子自动归位。** 这正是"先骨架、后微调"的体现。

### 5.4.3 一个要注意的边界：跨列后可能"顶出"隐式轨道

元素跨列跨行时，如果**超出了显式声明的范围**，浏览器会**自动创建隐式轨道来容纳它**。比如显式只有 2 列，你却写 `grid-column: span 3`——浏览器会补出第 3 列。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* 只有 2 列 */
}
.item { grid-column: span 3; }            /* 却要跨 3 列 */
```

**渲染效果**：第 3 列被**隐式创建**出来，宽度是多少？——由 `grid-auto-columns` 决定，默认是 `auto`（内容宽度）。这往往不是你想要的：你想要的可能是"3 列均分"，但隐式列是 `auto` 宽，导致**前两列按 `1fr` 均分、第三列却按内容撑**，参差不齐。

**正确做法**：要么把显式列数写对，要么给 `grid-auto-columns` 设一个值：

```css
/* ✅ 显式声明 3 列 */
.grid { grid-template-columns: repeat(3, 1fr); }

/* 或者 ✅ 给隐式列兜底 */
.grid { grid-template-columns: repeat(2, 1fr); grid-auto-columns: 1fr; }
```

### 5.4.4 一个真实案例：带"侧边标签"的列表

跨行（`grid-row`）在实际项目里有个高频用途——**让一个标签竖跨好几行内容**。比如时间线、订单列表里"左边的日期"要竖跨"右边的多行详情"：

```html
<div class="timeline">
  <div class="day">1 月 1 日</div>
  <div class="event">上午：开会</div>
  <div class="event">下午：写代码</div>
  <div class="day">1 月 2 日</div>
  <div class="event">上午：评审</div>
  <div class="event">下午：发布</div>
</div>
```

```css
.timeline {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 8px 16px;
}
.day { grid-row: span 2; }   /* 日期标签竖跨 2 行 */
```

**渲染效果**：左列是日期，右列是事件。每个日期标签**竖跨两行事件**，视觉上"一个日期管两个事件"。**这就是 `grid-row: span N` 的实战价值**——它不是花哨技巧，是"把相关的内容用网格绑在一起"。

**为什么用 `span 2` 而不是 `1 / 3`？** 因为这个列表的事件数量是动态的，你不想（也数不清）每条日期到第几条行线。`span 2` 只说"我跨 2 行"，起点让自动放置决定，**内容怎么增删，标签都自动跟着跨**。这是"声明意图"而非"算坐标"的又一个体现。

### 5.4.5 一个必须警惕的"跨列心态"

学会 `span` 之后，新手容易**过度跨列**——每个元素都想 `span` 一下，把网格搞得像拼图。

**克制一点。** 记住 4.2.6 的心法：**跨列跨行是"微调"，不是"常态"**。一个健康的 Grid 布局里，80% 的元素应该靠自动放置各归其位，只有少数"需要突出的元素"才显式 `span`。如果每个元素都在 `span`，说明你的网格设计本身有问题——多半是"骨架没声明对"，而不是"元素该跨列"。

> 一句话记住它：**跨列跨行用 `span`（只写跨度）或线号（钉死位置）；`span N` 起点交给自动放置，适合动态内容。跨出显式范围会触发隐式轨道，记得用 `grid-auto-*` 兜底。但别过度跨列——跨列是微调，自动放置才是常态。**

---

## 5.5 `subgrid`：让子项对齐父网格

**先给结论**：`subgrid` 解决一个 Grid 一直以来的痛——**嵌套的 Grid 里，子网格的列/行无法和父网格对齐。** `subgrid` 让子网格"继承"父网格的轨道，于是孙辈元素能和祖父辈的元素**严格对齐**。

**这是一个较新的能力，浏览器支持情况必须先说清楚**（见 5.5.3）。

### 5.5.1 先看问题：没有 subgrid 时，对齐会歪

假设你有一个页面骨架，主内容区里又套了一个"卡片网格"，你希望**卡片网格的列，和整个页面骨架的列对齐**：

```html
<div class="page">
  <header class="hd">header</header>
  <main class="main">
    <div class="card">卡片A</div>
    <div class="card">卡片B</div>
    <div class="card">卡片C</div>
  </main>
</div>
```

```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr 160px;   /* 页面 3 列 */
  gap: 16px;
}
.main { grid-column: 2; }

/* ❌ 子网格自己声明列，无法和父网格对齐 */
.main {
  display: grid;
  grid-template-columns: repeat(3, 1fr);   /* 3 列均分，和父网格的 200px/1fr/160px 对不上 */
  gap: 16px;
}
```

**现象**：`.main` 里的 3 张卡片，是在 `.main` **内部**重新均分的，它们的列线和页面骨架的列线（200px 的分界、160px 的分界）**完全对不上**。如果父网格的列是 `200px 1fr 160px` 这种不对称的，子网格 `repeat(3, 1fr)` 的列线位置和父网格列线位置必然错位——你无法让"卡片 1 的左边缘"正好落在"父网格第 2 条列线"上。

**根本原因**：Grid 的轨道是**容器私有**的。子网格默认**看不到**父网格的轨道，只能自己重新画一套。

### 5.5.2 `subgrid` 的解法：继承父网格的轨道

`subgrid` 让子网格**直接沿用父网格的列轨道**：

```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr 160px;
  gap: 16px;
}
.main {
  grid-column: 2;
  display: grid;
  grid-template-columns: subgrid;   /* ✅ 继承父网格的列轨道 */
  gap: 16px;
}
```

**渲染效果**：现在 `.main` 内部的网格，**不再自己均分**，而是**沿用父网格的列轨道**——`.main` 占的是父网格第 2 列（`1fr`），所以它内部的卡片，列宽会**精确对齐父网格中间那一列**。更典型的是跨列场景：

```html
<div class="page">
  <div class="hd">header</div>
  <div class="card a">A</div>
  <div class="card b">B</div>
  <div class="card c">C</div>
</div>
```

```css
.page {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.hd { grid-column: 1 / -1; }

/* 每张卡片本身又是一个网格，用 subgrid 让卡片内部的列对齐页面的 4 列 */
.card {
  display: grid;
  grid-column: span 2;              /* 卡片占 2 列 */
  grid-template-columns: subgrid;   /* 卡片内部的列，沿用父网格的 4 列 */
}
```

**渲染效果**：每张卡片占 2 列宽，但卡片**内部**的元素（比如标题、图片、按钮）能对齐到父网格那 4 条列线上——于是"卡片 A 内部的标题"和"卡片 B 内部的标题"**天然对齐**，尽管它们在不同的卡片里。**没有 subgrid 之前，这种"跨层对齐"做不到。**

### 5.5.3 浏览器支持情况（务必标注）

`subgrid` 的浏览器支持**来得比较晚**，而且各家进度不一：

| 浏览器 | 支持版本 | 时间 |
|---|---|---|
| Firefox | 71+ | 2019 年 12 月（最早支持） |
| Safari | 16+ | 2022 年 9 月 |
| Chrome / Edge | 117+ | 2023 年 9 月（最晚） |

**这意味着**：

- 到 2024 年，四大现代浏览器才**全部**支持 `subgrid`（Chrome 117 是最后一个补上的）。
- 如果你的用户里还有**较旧的 Chrome（< 117）或 Safari（< 16）**，`subgrid` 会**静默失效**——浏览器不认识 `subgrid` 这个值，直接忽略，子网格退回"自己重新画轨道"的行为（不报错，只是不对齐）。

**降级策略**：用 `@supports` 检测，不支持时给一个 fallback：

```css
.main {
  display: grid;
  grid-template-columns: repeat(3, 1fr);   /* 先写通用 fallback */
}

@supports (grid-template-columns: subgrid) {
  .main {
    grid-template-columns: subgrid;         /* 支持时覆盖成 subgrid */
  }
}
```

**渲染效果**：支持 `subgrid` 的浏览器走对齐版，不支持的走 `repeat(3, 1fr)` 兜底（虽然不对齐父网格，但至少布局不塌）。

**什么时候用 subgrid？** 当你有**明确的"跨层对齐"需求**——比如"所有卡片内部的某一行必须对齐"、"子组件的列要和页面栅格对齐"。如果没有这种需求，普通 Grid 就够，别为了用而用（它是较新特性，先保证兼容性）。

### 5.5.4 行方向也能 subgrid

前面例子都是 `grid-template-columns: subgrid`（继承列轨道）。行方向同样可以：

```css
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 100px);
}
.child {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;   /* 继承列 */
  grid-template-rows: subgrid;      /* 继承行 */
}
```

**渲染效果**：子网格的**行高**也和父网格对齐了——父网格三行各 100px，子网格内部的行也落在同样的 100px 行线上。**一个典型用途**：表单或列表里，"每一行"要跨多个子组件对齐，用 `grid-template-rows: subgrid` 让子组件的行和父容器的行严格对齐。

**语法上可以只继承一个方向**：`grid-template-columns: subgrid` 只继承列，行自己定义；反之亦然。方向可以按需选择。

### 5.5.5 subgrid 的一个限制，提前知道

`subgrid` 继承的是父网格的**轨道尺寸和 gap**，但**它不能继承父网格的 `grid-template-areas`**——`subgrid` 里不能用 areas 名。如果你需要子网格里也用命名区域，得在子网格里重新定义。这是规范目前的一个限制，了解即可，别踩坑。

> 一句话记住它：**`subgrid` 让子网格继承父网格的轨道（列或行可单独继承），解决"嵌套网格无法跨层对齐"的问题。它是较新特性（Chrome 117+ / Safari 16+ 才全支持），用 `@supports` 降级，别默认所有用户都有；且它不能继承父网格的 `grid-template-areas`。**

---

## 5.6 常见坑：隐式行塌陷、`1fr` 溢出、`dense` 乱序，以及另外两个

**先给结论**：Grid 的坑，几乎都集中在五个地方——**隐式轨道的尺寸失控**、**`fr` 的最小宽度没设下限**、**用了会乱序的 `dense`**、**`minmax` 的上下限写反**、**`fr` 和百分比混用**。这一节把每个坑都完整复现，并给出解法。

### 5.6.1 坑一：隐式行高度塌陷

**现象**：你声明了 3 列，没声明行，结果第二行的元素高度"塌"了，或者各行高参差不齐。

```html
<div class="grid">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item tall">4（内容很高）</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

```css
/* ❌ 只声明了列，没声明行，也没设 grid-auto-rows */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.item { background: #e8f0fe; padding: 20px; }
.tall { padding: 80px 20px; }   /* 4 号特别高 */
```

**现象**：第一行被 `tall`（4 号）撑得很高，但第二行（5、6 号）**没有内容可撑，塌成了一小条**。两行高度不一样，网格参差。

**原因**：你没声明任何行轨道，所以**所有行都是隐式行**，而隐式行的默认高度是 `auto`（内容多高就多高）。于是每行各自为政，高的高、矮的矮。

**修复**：给隐式行定一个统一高度：

```css
/* ✅ 统一隐式行高 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 120px;   /* 每一行都固定 120px */
  gap: 10px;
}
```

**渲染效果**：现在每一行都是 120px 高，`tall` 的内容再多，也只是在 120px 里溢出（或用 `overflow: hidden` 裁剪），网格整整齐齐。**记住：只要内容数量可能超过显式行数，就顺手写个 `grid-auto-rows`，别让它默默用 `auto`。**

### 5.6.2 坑二：`1fr` 列被长内容撑破（`minmax(0, 1fr)` 的溢出问题）

**现象**：三列等宽的网格，中间列放了一张超宽图片或一个不换行的长单词，结果**中间列被撑爆，整个网格横向溢出**。

```html
<div class="grid">
  <div class="item">左</div>
  <div class="item mid"><img src="https://picsum.photos/1200/300" alt="超宽图"></div>
  <div class="item">右</div>
</div>
```

```css
/* ❌ 1fr 列的最小宽度默认是 auto（内容宽度），会被超宽图撑破 */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}
.mid img { width: 100%; display: block; }
```

**现象**：三列不再是"各 1/3"，中间列被那张 1200px 宽的图片撑得老宽，左右两列被挤到几乎看不见，整个网格溢出容器。

**原因**：`1fr` 听起来"弹性"，但它的**最小宽度不是 0，而是 `auto`（内容的最小宽度）**。一张 1200px 的图片，它的 `min-content` 就是 1200px，所以中间列的宽度被"锁死"在至少 1200px，`1fr` 的弹性在这个下限之上无从发挥。

**这个坑，和 Flex 里的 `min-width: 0` 是同一个原理**——弹性容器的默认最小尺寸是内容尺寸，你得手动压掉它。

**修复**：把轨道写成 `minmax(0, 1fr)`，把下限强制压到 0：

```css
/* ✅ 下限压到 0，图片就能在轨道内收缩换行 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.mid img { width: 100%; display: block; }
```

**渲染效果**：三列恢复等宽，图片在中间列内收缩到列宽（`width: 100%` 让它正好填满列宽）。**记住这条黄金法则：任何"弹性"的 Grid 列，只要里面可能放图片、长文本、`<pre>`、长单词，就写成 `minmax(0, 1fr)`，而不是光秃秃的 `1fr`。**

### 5.6.3 坑三：`grid-auto-flow: dense` 导致乱序

**现象**：网格里某些元素跨列后，后面的元素"跳"到了前面，视觉顺序和 DOM 顺序不一致。

这个坑在第 04 章 4.6.3 已经完整复现过，这里再点一次"实战中的危害"：

```html
<div class="grid">
  <div class="item big">1（跨两列）</div>
  <div class="item skip">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>
```

```css
/* ❌ dense 会回填空洞，导致 3 号被塞到 2 号左边 */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-flow: dense;
  gap: 10px;
}
.big  { grid-column: span 2; }
.skip { grid-column: 2; }
```

**现象**：视觉顺序是 `1 → 3 → 2 → 4`，DOM 顺序是 `1 → 2 → 3 → 4`。**如果这些是商品卡片、文章列表、带按钮的可交互元素**，用户按 `Tab` 键的焦点顺序会从 2 跳到 3，和眼睛看到的顺序对不上——无障碍和可用性的灾难。

**修复**：去掉 `dense`，用默认的 `sparse`：

```css
/* ✅ 默认 sparse，不回头填空洞，顺序和 DOM 一致 */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
```

**渲染效果**：3 号乖乖排在 2 号后面（第三行），视觉顺序和 DOM 顺序一致。代价是第二行第一列有个空位——**这个空位是"顺序正确"的代价，值得付**。

**什么时候才能用 dense？** 只有当网格里是**纯视觉、无交互、无阅读顺序**的内容（比如纯装饰的图片砖墙、马赛克背景）时。只要里面有文字要读、有按钮要点、有顺序语义，一律别用。

### 5.6.4 坑四：`minmax` 里 `min` 比 `max` 大

`minmax(min, max)` 有个隐含前提：**`min` 必须小于等于 `max`**。写反了会怎样？

```css
/* ❌ min(300px) 比 max(1fr) 大，这条轨道无效，退回 auto */
.grid { grid-template-columns: minmax(300px, 1fr); }
```

**现象**：当容器宽度小于 300px 时，`min`（300px）比 `max`（`1fr` 可能只有 100px）大了。按规范，**`min > max` 时，轨道取 `min` 值**（即 300px），`max` 被忽略——结果这列**固定 300px，不再弹性**，甚至溢出容器。

**修复**：保证 `min <= max`。不确定时，用 `minmax(0, 1fr)` 或 `minmax(auto, 1fr)` 这种下限为 0 或 auto 的安全组合。**一个实用经验：`1fr` 作为 `max` 时，`min` 别用固定长度（px），用 `0` 或 `auto` 最稳。**

### 5.6.5 坑五：`fr` 和百分比混用，比例不可控

`fr` 和 `%` 都想表达"比例"，但**它们的基数不同**，混在一起算出来的比例往往让你意外：

```css
/* ❌ 你以为是"50% + 两个 1fr 各 25%"，实际不是 */
.grid { grid-template-columns: 50% 1fr 1fr; }
```

**现象**：第一列占容器宽度的 50%，剩下 50% 再被两个 `1fr` 均分（各 25%）——**这个例子其实还好**。真正坑的是加了 gap 或固定列之后：

```css
/* ❌ 加了 gap 后，50% 和两个 1fr 的关系就乱了 */
.grid { grid-template-columns: 50% 1fr 1fr; gap: 20px; }
```

**原因**：`50%` 是相对容器整体算的，`1fr` 是相对"扣掉 50% 和 gap 之后"的剩余算的。两个不同基数混在一行里，最终比例很难心算，而且**换了容器宽度，比例关系会变**。

**修复**：比例混排时，**要么全用 `fr`，要么全用百分比**，别混：

```css
/* ✅ 统一用 fr，比例清晰：1 : 2 : 2 */
.grid { grid-template-columns: 1fr 2fr 2fr; gap: 20px; }
```

> 一句话记住它：**Grid 五大坑：① 隐式行默认 `auto` 会塌陷，用 `grid-auto-rows` 兜底；② `1fr` 最小宽度默认是内容宽，会被长图/长词撑破，用 `minmax(0, 1fr)` 压下限；③ `dense` 回填空洞导致乱序，交互内容禁用；④ `minmax` 的 `min > max` 会退化成固定宽；⑤ `fr` 和 `%` 别混用，比例不可控。**

---

## 5.7 综合实战：把本章所学拼成一个真实页面

**先给结论**：单独看每个技巧都懂，但拼成一个真实页面才是真正的考验。这一节用一个"个人作品集页"把本章的页面骨架、自适应网格、Flex 嵌套全串起来，你能看到它们是怎么协作的。

先看目标页面结构：

```text
┌─────────────────────────────┐
│  header（logo + 导航，内部用 Flex）│
├─────────────────────────────┤
│  卡片墙（自适应：auto-fit，数量不定）│
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│  └────┘ └────┘ └────┘ └────┘ │
├─────────────────────────────┤
│  footer                     │
└─────────────────────────────┘
```

```html
<div class="site">
  <header class="site-header">
    <div class="logo">我的作品集</div>
    <nav class="nav">
      <a href="#">首页</a>
      <a href="#">作品</a>
      <a href="#">关于</a>
    </nav>
  </header>

  <main class="gallery">
    <article class="work">作品 1</article>
    <article class="work">作品 2</article>
    <article class="work">作品 3</article>
    <article class="work">作品 4</article>
    <article class="work">作品 5</article>
    <!-- ... 数量不定 ... -->
  </main>

  <footer class="site-footer">© 2026</footer>
</div>
```

```css
/* ① 页面骨架：Grid，纵向三段 */
.site {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 24px;
}

/* ② header 内部：Flex（一维，logo 左、导航右） */
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}
.nav { display: flex; gap: 16px; }

/* ③ 卡片墙：Grid 自适应（二维，列对齐 + 免媒体查询） */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  padding: 0 24px;
}

.work {
  display: flex;              /* 卡片内部（标题、描述）用 Flex 纵向排 */
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  border: 1px solid #e4e7ee;
  border-radius: 10px;
}
```

**渲染效果**：

1. **骨架**（Grid）：`grid-template-rows: auto 1fr auto` + `min-height: 100vh`，让 header 和 footer 固定、中间画廊吃掉剩余高度，footer 内容少时也贴底。
2. **header 内部**（Flex）：logo 和导航一左一右，`justify-content: space-between` 一行搞定。
3. **卡片墙**（Grid `auto-fit`）：作品数量不定、屏幕宽度不定，卡片自动换列、列宽自适应，**没有一行媒体查询**。
4. **卡片内部**（Flex）：标题和描述纵向排，`gap` 控制间距。

**这一页就是"Grid + Flex 分工"的标准答案**：外层骨架和卡片墙是"二维"的（有行有列、要列对齐），用 Grid；header 和卡片内部是"一维"的（一条轴上的流动），用 Flex。**你不是在"选 Grid 还是 Flex"，而是在"每一层选对工具"。**

> 一句话记住它：**真实页面 = 外层 Grid（骨架、卡片墙）+ 内层 Flex（header、卡片内部）。判断每一层是"一维还是二维"，一层层选工具，别想着"整个页面只用一个"。**

---

## 5.8 本章常见坑速查

| 坑 | 现象 | 原因 | 正确做法 |
|---|---|---|---|
| 隐式行高度塌陷 | 内容多的行高、内容少的行塌成一条 | 隐式行默认 `auto`，由内容撑 | `grid-auto-rows: 固定值` |
| `1fr` 列被撑破 | 超宽图/长单词撑爆列，网格溢出 | `1fr` 最小宽度默认是内容宽 | `minmax(0, 1fr)` |
| `dense` 乱序 | 视觉顺序 ≠ DOM 顺序，Tab 焦点乱跳 | dense 回填空洞 | 交互内容用默认 sparse |
| `auto-fill` 留白 | item 少时右边空一大片 | auto-fill 保留空轨道占位 | 日常用 `auto-fit` |
| 跨列跨出显式范围 | 超出显式的列宽参差不齐 | 隐式列默认 `auto` 宽 | 写对列数，或 `grid-auto-columns` 兜底 |
| 子网格对不齐父网格 | 嵌套网格的列线错位 | 子网格轨道是私有的 | 用 `subgrid`（注意 `@supports` 降级） |
| 相册图片变形/留白 | 图片被拉伸或没填满 | 没设 `object-fit` | `object-fit: cover` + 图片 `width/height: 100%` |
| 页面骨架不用 areas | 线坐标可读性差、难维护 | 结构布局用线定位太啰嗦 | 骨架用 `grid-template-areas` |
| `minmax` 的 `min > max` | 轨道退化成固定宽、可能溢出 | 违反 `min <= max` 规则 | `min` 用 `0` 或 `auto` |
| `fr` 与 `%` 混用 | 比例不可控，换宽度就变 | 两者基数不同（整体 vs 剩余） | 统一用 `fr` 或统一用 `%` |
| `auto-fit` 的 `min` 设太大 | 窄屏一列都放不下，横向溢出 | `min` 超过最小屏宽 | `min` 取 200~260px，别超最小屏宽 |

---

## 5.9 本章小结

- **圣杯/双飞翼用 Grid 一行搞定**：`grid-template-columns: 200px 1fr 160px` + areas，中间列 DOM 优先、视觉居中、三列等高、footer 贴底，全自动满足。
- **相册网格**：`repeat(n, 1fr)` 定列 + `grid-auto-rows` 定行高 + `object-fit: cover` 裁图。
- **仪表盘**：`grid-template-areas` 画区域，跨行跨列一眼看懂。
- **自适应网格**：`repeat(auto-fit, minmax(200px, 1fr))` 一行免媒体查询。
- **`auto-fit` vs `auto-fill`**：前者折叠空轨道（铺满），后者保留空轨道（占位）；日常用 `auto-fit`。
- **跨列跨行**：`span N`（只写跨度）或线号（钉死位置）；跨出显式范围要用 `grid-auto-*` 兜底。
- **`subgrid`**：让子网格继承父网格轨道，解决跨层对齐；较新特性（Chrome 117+ / Safari 16+ 才全支持），用 `@supports` 降级。
- **五大坑**：隐式行塌陷（`grid-auto-rows` 兜底）、`1fr` 溢出（`minmax(0, 1fr)` 压下限）、`dense` 乱序（交互内容禁用）、`minmax` 的 `min > max`（用 `0`/`auto` 当下限）、`fr` 与 `%` 混用（统一用 `fr`）。
- **Grid 不只做"大布局"**：表单等"要列对齐"的小件，Grid 也常比 Flex 顺手。
- **真实页面 = Grid + Flex 分工**：外层骨架/卡片墙用 Grid（二维），header/卡片内部用 Flex（一维），一层层选工具。

---

## 5.10 动手练习

1. **用 Grid 实现一个三列页面骨架**：左右固定（200px / 160px）、中间自适应，`main` 在 HTML 里排最前面，footer 贴底。要求用 `grid-template-areas` 写，并加一条移动端单列堆叠的媒体查询。

   <details><summary>参考答案</summary>

```css
   .page {
     display: grid;
     grid-template-columns: 200px 1fr 160px;
     grid-template-rows: 60px 1fr 60px;
     grid-template-areas:
       "header header header"
       "left   main   right"
       "footer footer footer";
     min-height: 100vh;
     gap: 10px;
   }
   .hd { grid-area: header; } .main { grid-area: main; }
   .left { grid-area: left; } .right { grid-area: right; } .ft { grid-area: footer; }

   @media (max-width: 700px) {
     .page {
       grid-template-columns: 1fr;
       grid-template-areas: "header" "main" "left" "right" "footer";
     }
   }
```
   </details>

2. **写出 `repeat(auto-fit, minmax(220px, 1fr))` 的逐词含义**，并说明 `auto-fit` 和 `auto-fill` 在"容器能放 5 列、但只有 3 个 item"时的视觉差异。

   <details><summary>参考答案</summary>

   逐词：`repeat` 重复轨道；`auto-fit` 列数由容器宽度自动决定；`minmax(220px, 1fr)` 每列宽度下限 220px、上限一份剩余空间。

   视觉差异：`auto-fit` 折叠空的 2 条轨道，3 个 item 拉伸铺满整行；`auto-fill` 保留空的 2 条轨道占位，3 个 item 挤在左边、右边留白。

   </details>

3. **一个相册网格，3 列，图片高低不一，要求整齐且不变形**。写出 CSS，重点说明 `grid-auto-rows` 和 `object-fit: cover` 各起什么作用。

   <details><summary>参考答案</summary>

```css
   .album { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 200px; gap: 12px; }
   .album img { width: 100%; height: 100%; object-fit: cover; }
```

   `grid-auto-rows: 200px` 让自动生成的每一行都固定 200px 高，行高不被某张高图撑变形；`object-fit: cover` 让图片按比例裁剪填满格子，不变形。

   </details>

4. **一个 4 列网格，中间某列放了一张超宽图片导致溢出**。写出反例（`1fr`）和正例（`minmax(0, 1fr)`），并解释原理。

   <details><summary>参考答案</summary>

```css
   /* ❌ 溢出 */
   .grid { grid-template-columns: repeat(4, 1fr); }

   /* ✅ 修复 */
   .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
```

   原因：`1fr` 的最小宽度默认是 `auto`（内容的最小宽度），超宽图把该列的最小宽度顶大导致溢出；`minmax(0, 1fr)` 把下限压到 0，图片才能在列内收缩。这对应 Flex 的 `min-width: 0`。

   </details>

5. **什么是 `subgrid`？它解决什么问题？浏览器支持情况如何？** 写出一个"卡片内部列对齐父网格"的完整例子。

   <details><summary>参考答案</summary>

   `subgrid` 让子网格继承父网格的轨道，解决"嵌套网格的列/行无法跨层对齐"的问题。支持情况：Firefox 71+、Safari 16+、Chrome/Edge 117+。

```css
   .page { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
   .card { display: grid; grid-column: span 2; grid-template-columns: subgrid; }
```

   </details>

6. **什么情况下可以用 `grid-auto-flow: dense`？什么情况下绝不能碰？** 结合 5.6.3 的例子说明。

   <details><summary>参考答案</summary>

   只有当网格内容是**纯视觉、无交互、无阅读顺序**（如纯装饰图片砖墙）时可以用 `dense`。只要里面有文字要读、按钮要点、有顺序语义（商品列表、文章卡片、表单），就绝不能碰——`dense` 会回填空洞导致视觉顺序 ≠ DOM 顺序，Tab 焦点和无障碍全乱。

   </details>

7. **写一个"带侧边标签的列表"**：左列是日期标签（每个跨 2 行），右列是事件。要求日期标签用 `grid-row: span 2` 实现，并说明为什么这里用 `span` 而不是写死线号。

   <details><summary>参考答案</summary>

```css
   .timeline { display: grid; grid-template-columns: 100px 1fr; gap: 8px 16px; }
   .day { grid-row: span 2; }
```

   因为事件数量是动态的，写死线号（`1 / 3`）无法适应内容的增删。`span 2` 只声明"跨 2 行"，起点交给自动放置，内容怎么变标签都自动跟着跨——这是"声明意图"而非"算坐标"。

   </details>

8. **一个三列等宽网格，中间列放超宽图片导致溢出**。写出 `1fr` 反例和 `minmax(0, 1fr)` 正例，并说明这和 Flex 的哪个概念对应。

   <details><summary>参考答案</summary>

```css
   /* ❌ 溢出：1fr 最小宽度默认是内容宽，被超宽图撑破 */
   .grid { grid-template-columns: 1fr 1fr 1fr; }

   /* ✅ 修复：下限压到 0，图片能在列内收缩 */
   .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
```

   这对应 Flex 里的 `min-width: 0`——弹性容器的默认最小尺寸是内容尺寸，需要手动压掉才能让内容收缩。

   </details>

---

> 📖 **本章的代码示例**：`examples/05-Grid实战.html`（演示页面骨架、自适应网格 auto-fit、跨列跨行、subgrid）
> 🚀 **下一章**：第 06 章会把 Flex 和 Grid 放到一起，正面回答那个最常被问的问题——"到底什么时候用 Flex、什么时候用 Grid"，并用十种经典布局案例逐一裁决。
