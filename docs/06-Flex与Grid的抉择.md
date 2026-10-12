# 第 06 章 · Flex 与 Grid 的抉择：十个经典布局案例

> 前几章你把 Flex 和 Grid 各自的属性都摸了一遍，现在到了最要命的问题：**眼前这个布局，我到底该用谁？**
> 这一章给你一套 30 秒能跑完的决策框架，再用**十个你天天会遇到的经典布局**，逐个摆出「Flex 怎么写、Grid 怎么写、该推荐哪个、为什么」。
>
> 本章你需要记住的就一件事：**Flex 管"一条线"，Grid 管"一张网"——先判断你的布局是线还是网，剩下的是细节。**

---

## 6.1 先给结论：一个"三问"决策框架

网上关于"Flex 还是 Grid"的争论，大部分都在各说各话。有人说"能不用 Grid 就不用 Grid"，有人说"Grid 是未来"。**这些都不是判断标准。**

真正能帮你做决定的，是问自己三个问题。三个问题问完，答案基本就出来了。

### 第一问：这是"一条线"还是"一张网"？

这是最核心的一问，也是最常被忽略的一问。

- **一条线（一维）**：你只是在**一行上**排东西（从左到右），或者**在一列上**排东西（从上到下）。主轴只有一条。
- **一张网（二维）**：你需要**行和列交叉**。比如"3 行 4 列"的网格，你既要控制"这一行怎么排"，又要控制"这一列和上一列怎么对齐"。

一个很实用的自测方法：**你写 CSS 的时候，脑子里是不是一直在想"下一行怎么和上一行对齐"？** 如果是，这就是二维，Grid 的主场。

```css
/* 一维：我只要它们水平排开，谁高谁矮无所谓 */
.nav { display: flex; }

/* 二维：我要 3 行 × 4 列，每一行每一列都要对齐 */
.board { display: grid; grid-template-columns: repeat(4, 1fr); }
```

**为什么这个判断这么重要？** 因为 Flex 和 Grid 的设计目标从根上就不一样。Flexbox 规范的名字叫 *Flexible Box*，它回答的问题是"**一条线上的几个盒子，剩余空间怎么分、彼此怎么对齐**"；Grid 规范回答的是"**一块区域里，行和列怎么定义、盒子怎么落进格子**"。**一个工具解决一个问题**，你拿错工具，问题就解决得很别扭。

### 第二问：尺寸是"内容说了算"还是"布局说了算"？

这一问决定了"谁在分配空间"。

- **内容驱动**：元素多大，由它自己的内容决定。导航项有多宽，取决于"首页/产品/关于"这几个字有多长；按钮有多宽，取决于按钮上的文字。你只想让它们**排好队、彼此对齐**，不想规定它们具体多宽。
- **布局驱动**：元素多大，由**网格**决定。卡片网格里，每张卡片该占多少宽，是"这一列有多宽"说了算，跟卡片里的文字长短无关。你其实想让它们**填进固定的格子里**。

```css
/* 内容驱动：导航项多宽，由文字长度决定，别规定死 */
.nav { display: flex; gap: 16px; }

/* 布局驱动：每张卡片占 240px~1fr 的格子，跟内容无关 */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
```

**一个信号帮你判断**：如果你发现自己**在数"有几个元素"**，那多半是布局驱动，该用 Grid；如果你**从不关心有几个元素、只想让它们自动排开**，那是内容驱动，该用 Flex。Flex 不需要你预先知道子项数量，Grid 的 `grid-template-columns` 通常要你明确"几列"（`auto-fit`/`auto-fill` 是例外，它们能自动生成列数）。

### 第三问：你需要在"第二条轴"上"分配"还是"对齐"？

Flex 有两条轴：主轴（排布方向）和交叉轴（垂直于主轴）。**关键区别在这**：

- **主轴**：Flex 可以"分配"——`flex: 1` 把剩余空间按比例分给每个子项。
- **交叉轴**：Flex **只能"对齐"**，不能"分配"。你可以 `align-items: center` 让它们居中，但**没法说"这一列我要它占满、那一列占一半"**——那是"分配"，Flex 在交叉轴上做不到。

当你发现**两条轴都需要"分配"**（横着要均分、竖着也要均分或占位）时，就是 Grid 的信号。这也是很多人硬用 Flex 写出别扭代码的根源：**他们想让 Flex 的交叉轴也干"分配"的活，可 Flex 天生没这个能力。**

```css
/* Flex 的交叉轴只能"对齐"：这一列里我让它们顶部对齐，仅此而已 */
.flex-col { display: flex; flex-direction: column; align-items: flex-start; }

/* 但"每一行都占满、每一列都对齐"是两条轴都要分配 → Grid */
.rows { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; }
```

**为什么 Flex 不干脆让交叉轴也能"分配"？** 这得回到 Flex 的定位：它是为"一维"而生，交叉轴只是"顺带"让你对齐。如果交叉轴也能分配，Flex 就变成了一个半吊子的 Grid，两条轴互相干扰，反而更难用。**设计者刻意砍掉了这个能力，把"双轴分配"完整地交给了 Grid。** 这又是一次"工具各司其职"的体现。

### 汇总成一张表

| 信号 | 倾向 Flex | 倾向 Grid |
|---|---|---|
| 维度 | 一行 / 一列 | 行列交叉 |
| 尺寸来源 | 内容决定 | 布局（网格）决定 |
| 第二轴 | 只需对齐 | 需要分配（占满/均分/占位） |

**一句话决策流程**：先看维度（线还是网）→ 线就用 Flex，网就用 Grid；拿不准再看尺寸来源（内容还是布局）；最后看第二轴要不要"分配"。

### 三个流传很广、但都错的直觉

在正式看案例之前，先拆掉三个最容易把你带偏的说法：

**误区一："Flex 是旧的，Grid 是新的，新项目应该全用 Grid。"**
错。两者是**同一代**的布局工具（Flex 2009 草案 / 2012 规范，Grid 2017 全面支持），不是"新旧替代"关系。它们解决**不同维度**的问题，就像螺丝刀和扳手，不存在"扳手更新所以拧螺丝也用扳手"。全用 Grid 做导航栏，你会被 `grid-template-columns: repeat(N, auto)` 的数格子折磨死（见 6.2.8）。

**误区二："能用 Flex 就不用 Grid，因为 Grid 太复杂。"**
错。Grid 的"复杂"是假象——它的核心就一个 `grid-template-columns` / `grid-template-areas`。真正复杂的是**用 Flex 硬模拟二维**（见 6.4 反模式一），那才是一层层嵌套、一行行补丁。判断标准永远是"几维的"，不是"哪个简单"。

**误区三："Flex 和 Grid 只能二选一，用了 Grid 就不能用 Flex。"**
错。这是最常见的误解，也是下一节 6.3 要正面回答的问题。**真实项目里它们永远是嵌套组合的**：外层 Grid 搭骨架，内层 Flex 排细节。一个元素完全可以 `display: grid` 的同时，又让自己的子元素用 Flex 排队。

### 把三个问题串起来：一张决策树

把三个问题连起来，就得到一张可以贴在脑子里的决策树：

```
拿到一个布局需求
        │
        ▼
① 是"一条线"还是"一张网"？
   ├─ 一条线（一行 / 一列）──────────┐
   │                                 │
   │   ② 尺寸由内容还是布局决定？     │
   │      ├─ 内容（数量不定、宽度随字）→ 用 Flex
   │      └─ 布局（我知道几列几行）   → 用 Grid
   │                                 │
   └─ 一张网（行列交叉、要跨行跨列）──→ 用 Grid
```

再用两个例子走一遍这张树：

**例 A：一个按钮组。**
① 一条线（一排按钮）→ 走到第二步。② 内容驱动（按钮数量不定、宽度随文字）→ **Flex**。完。

**例 B：一个 3 行 × 4 列的照片墙。**
① 一张网（行列交叉，每行每列都要对齐）→ 直接 **Grid**。完。

**例 C（易错）：一个"页头 + 内容 + 页脚"的页面。**
① 乍看是"一条线"（竖着一列），但你细想——它在控制"三行的存在"和"中间行占满剩余高度"，这是**两条轴都在参与**。② 布局驱动（谁占满谁贴底由布局说了算）→ **Grid**（`grid-template-rows: auto 1fr auto`）。完。

**例 C 是这张树最值钱的地方**：它提醒你，"一条线"的直觉有时是错的。判断时别只看"东西是不是排成一列"，要看**你到底在控制几根轴**。

> 一句话记住它：**Flex 是"一维的、内容驱动的、第二轴只能对齐"；Grid 是"二维的、布局驱动的、两条轴都能分配"。三个信号叠加，答案就出来了。**

---

## 6.2 十个经典布局案例

下面十个案例，是你在真实项目里**反复会写**的布局。每个都给 Flex 和 Grid 两种写法，并明确推荐谁、为什么。

**先说一个贯穿十个案例的结论**：这十个里，**7 个推荐 Grid，3 个推荐 Flex，1 个两者皆可（居中），1 个两者都不擅长（瀑布流）**。不是 Grid 比 Flex 厉害，而是"页面骨架"天然更偏二维，而"组件内部细节"更偏一维。看下去你就明白为什么。

**十个案例速查**：

| # | 案例 | 推荐 | 一句话理由 |
|---|---|---|---|
| 1 | 水平导航栏 | **Flex** | 一排内容驱动的元素 |
| 2 | 垂直侧边栏 + 内容 | **Grid** | 页面骨架，两列结构 |
| 3 | 卡片网格 | **Grid** | 二维 + 布局驱动 |
| 4 | 居中一个元素 | 两者皆可 | 都只是"顺手"提供了能力 |
| 5 | 页头页脚布局 | **Grid** | 三行骨架，中间占满 |
| 6 | 圣杯/双飞翼 | **Grid** | 位置与顺序解耦 |
| 7 | 堆叠式表单 | **Flex** | 一列线性流程 |
| 8 | 工具栏（按钮组） | **Flex** | 一排数量不定的按钮 |
| 9 | 画廊（瀑布流） | 都不擅长 | 用 `columns` 或 Grid+JS |
| 10 | 仪表盘 | **Grid** | `grid-template-areas` 主场 |

---

### 6.2.1 水平导航栏

**结论**：推荐 **Flex**。导航项是"一排东西，宽度由文字内容决定"，是标准的一维 + 内容驱动。

```html
<nav class="nav">
  <a class="brand" href="#">Logo</a>
  <ul class="nav-links">
    <li><a href="#">首页</a></li>
    <li><a href="#">产品</a></li>
    <li><a href="#">关于</a></li>
  </ul>
  <a class="login" href="#">登录</a>
</nav>
```

**Flex 写法（推荐）**：

```css
.nav {
  display: flex;
  align-items: center;  /* 交叉轴（垂直方向）居中对齐 */
  gap: 16px;
}
.nav-links {
  display: flex;        /* 链接组内部又是"一条线" */
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.login { margin-left: auto; }  /* 把"登录"推到最右边 */
```

**Grid 写法（能写，但没必要）**：

```css
.nav {
  display: grid;
  grid-template-columns: auto 1fr auto;  /* 左、中、右三列 */
  align-items: center;
  gap: 16px;
}
.nav-links {
  display: flex;              /* 注意：链接组内部还得用 Flex */
  justify-self: center;       /* 让中间的链接组居中 */
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}
```

**效果与为什么推荐 Flex**：

- Flex 版：`margin-left: auto` 把"登录"推到右边，这是 Flex 里最顺手的一个技巧——剩余空间自动堆到它左边。无论导航项有几个、文字多长，布局都成立。
- Grid 版也能实现同样效果，但你发现没有：**`grid-template-columns: auto 1fr auto` 里那个 `1fr` 是"硬挤出来"的中间列，而且链接组内部照样还得再套一层 Flex**。你用 Grid 搭了骨架，细节还是得靠 Flex 填。

导航栏的问题本质是"几个内容驱动的元素排成一行"，Flex 的每一根轴都正好对得上。用 Grid 属于"杀鸡用牛刀"，还多写了一个 `justify-self`。

**变体：导航项要"均分整行宽度"怎么办？**

有的导航栏要求每个链接**等宽**、铺满一行（比如底部 tab 栏）。这时"内容驱动"变成了"布局驱动"，`justify-content: space-between` 或让每个项 `flex: 1` 即可——**依然不用换成 Grid**，因为还是"一条线"：

```css
.nav-equal { display: flex; }
.nav-equal a { flex: 1; text-align: center; }  /* 每个链接均分整行 */
```

注意这个变体里 `flex: 1` 是"在主轴（横轴）上分配"，这是 Flex 允许的。**只要分配只发生在一个方向，Flex 就没问题**——别把它和"两条轴都要分配"（那才是 Grid）混为一谈。

> 一句话记住它：**导航栏 = 一排内容驱动的元素，用 Flex；`margin-left: auto` 是把元素推到对侧最右的万能技巧。**

---

### 6.2.2 垂直侧边栏 + 内容

**结论**：推荐 **Grid**。虽然看起来只是"两栏"，但它是**页面骨架**——侧边栏和内容区往往要**独立滚动、撑满整屏高度**，这是两条轴都要参与的事。

```html
<div class="layout">
  <aside class="sidebar">侧边栏（导航列表，可能很长）</aside>
  <main class="content">主内容区</main>
</div>
```

**Flex 写法（能用）**：

```css
.layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 240px;
  flex-shrink: 0;      /* 防止被压缩（Flex 默认会收缩） */
  overflow-y: auto;
}
.content { flex: 1; overflow-y: auto; }
```

**Grid 写法（推荐）**：

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;
}
.sidebar { overflow-y: auto; }
.content { overflow-y: auto; }
```

**效果与为什么推荐 Grid**：

两个版本都能出"左边固定 240px、右边占满剩余"的效果。但差别在**意图表达**：

- Grid 版 `grid-template-columns: 240px 1fr` 一眼就看懂：**这个页面是"两列"的骨架**，左列固定、右列自适应。
- Flex 版要多写一个 `flex-shrink: 0`，否则当内容把侧边栏撑得比 240px 宽时，Flex 默认的收缩会把侧边栏挤窄——这是一个真实会踩的坑（见 6.5 坑速查）。你写这行补丁，本质是在用 Flex 硬表达"我不许它收缩"。

**"骨架用 Grid"是本章贯穿的结论**：页面最外层的大结构（几列、几行、谁占满），用 Grid 描述最直白；而每一列**内部**的细节，再用 Flex 去排（6.3 会展开）。

**变体：两栏要"等宽"怎么办？**

如果左右两栏**不需要固定宽度、而是对半分**，`grid-template-columns: 1fr 1fr` 和 Flex 的 `flex: 1` 效果一样。**这种时候选谁都行**，但我仍建议 Grid，理由只有一个：**读代码的人一眼知道"这是两列结构"**，而 `display: flex` 默认是横向的，他得再多看两行才确定"哦原来是竖着的两栏"。布局代码的可读性，很多时候比"谁少写一个字符"更重要。

> 一句话记住它：**"侧边栏 + 内容"是页面骨架，用 Grid 描述"两列结构"最直白；Flex 版本要额外补 `flex-shrink: 0` 防收缩。**

---

### 6.2.3 卡片网格

**结论**：**Grid 完胜**。这是"二维 + 布局驱动"的教科书案例。Flex 硬做会踩一个非常经典的坑——最后一行拉伸。

```html
<div class="cards">
  <div class="card">卡片 1</div>
  <div class="card">卡片 2</div>
  <div class="card">卡片 3</div>
  <div class="card">卡片 4</div>
  <div class="card">卡片 5</div>
</div>
```

**Flex 写法（反例，最后一行会被拉伸）**：

```css
.cards { display: flex; flex-wrap: wrap; gap: 16px; }
.card { flex: 1 1 240px; }  /* ❌ 每张卡片：能长到 240px 就长，不够就换行 */
```

**Grid 写法（推荐）**：

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));  /* ✅ 关键这一行 */
  gap: 16px;
}
.card { /* 什么 flex 属性都不用写 */ }
```

**效果与为什么 Grid 完胜**：

- Grid 版：`repeat(auto-fill, minmax(240px, 1fr))` 一句话搞定"能放几个 240px 的格子就放几个，多出来的空间平分，放不下的自动换到下一行"。**每一行每一列的卡片，宽度严格一致。**
- Flex 版的坑：`flex: 1 1 240px` 的意思是"基准 240px，空间不够就换行，空间有多就长大"。问题在于——**如果最后一行只有 2 张卡片，它们会"长大"去填满整行**，于是最后一行 2 张卡片比上面 3 张的宽了一大截。

你自己复制跑一下就知道：Flex 版 5 张卡片时，最后一行 2 张会撑满整行，看起来像"错版"。这就是用 Flex 硬表达二维布局的代价。

**变体：`auto-fill` 和 `auto-fit` 到底选哪个？**

这两个在第 05 章细讲过，这里只给结论：**卡片要"铺满整行"就选 `auto-fit`，卡片要"严格保持自己那列的宽度、右边留白"就选 `auto-fill`。**

```css
/* auto-fit：空轨道被折叠，现有卡片铺满整行（卡片流最常用） */
.grid-fit  { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
/* auto-fill：保留空轨道，卡片只占自己的格子，右边留白 */
.grid-fill { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
```

两者的区别只在"卡片数量不满一整行时"才看得出来：`auto-fill` 会为"本可以放下、但没放"的空列保留位置，`auto-fit` 则把这些空列折叠掉。**卡片流几乎总用 `auto-fit`。**

> 一句话记住它：**卡片网格是二维 + 布局驱动，`repeat(auto-fit, minmax(240px, 1fr))` 一行搞定；Flex 的 `flex-wrap` 会在最后一行"拉伸"出不齐的卡片。**

---

### 6.2.4 居中一个元素

**结论**：**两者都行，团队统一即可**；若非要选一个，Grid 的 `place-items: center` 是"为居中而生"的一行写法（呼应第 00 章）。

```html
<div class="box">
  <div class="inner">居中内容</div>
</div>
```

**Flex 写法**：

```css
.box { display: flex; align-items: center; justify-content: center; height: 200px; }
```

**Grid 写法**：

```css
.box { display: grid; place-items: center; height: 200px; }  /* place-items 是 align+justify 的合写 */
```

**效果与为什么**：

两个写法效果完全相同：`.inner` 在 `.box` 里水平垂直居中。区别只有两行 vs 一行。

**为什么第 00 章说"居中有十几种写法"、现在又说"两个都能"？** 因为居中本身是个**太简单**的问题——它既不是"一条线"也不是"一张网"，就一个元素。Flex 和 Grid 都把这个能力顺手提供了。这时**选哪个都不重要，重要的是团队统一**：要么都写 `place-items: center`，要么都写 `align-items + justify-content`，别同一个项目里两种混着写，别人维护时要愣一下。

**一个容易踩的细节**：`place-items: center` 里的子元素，如果**内容比容器还宽**，会被居中并**两侧溢出**（不是裁掉，是超出边界、可能被遮挡）。如果需要"溢出时可滚动/可对齐到起点"，要用 `place-items: center` 换成更精细的 `align-items: start; justify-content: center` 这类写法。这是"居中"和"安全居中"的区别：

```css
/* 普通居中：内容过宽时，两侧一起溢出，左边的内容看不到了 */
.box { display: grid; place-items: center; }

/* 安全居中：内容过宽时保持左对齐，保证能从头读 */
.box { display: grid; justify-content: center; align-items: start; }
```

> 一句话记住它：**单个元素居中，Flex 和 Grid 都只是"顺手提供"了能力，效果等价；选谁看团队习惯，关键是一致。`place-items: center` 是最短写法。**

---

### 6.2.5 页头页脚布局（sticky footer）

**结论**：推荐 **Grid**。这是一个**三条"行"**的结构——页头、内容、页脚，内容区要"吃掉所有剩余高度"，页脚永远贴底。经典问题叫"sticky footer"。

```html
<div class="page">
  <header>页头</header>
  <main>内容（可能很少，页脚也要贴底）</main>
  <footer>页脚</footer>
</div>
```

**Flex 写法（能用）**：

```css
.page {
  display: flex;
  flex-direction: column;  /* 竖着排成一条线 */
  min-height: 100vh;
}
main { flex: 1; }           /* 内容区吃掉剩余高度 */
```

**Grid 写法（推荐）**：

```css
.page {
  display: grid;
  grid-template-rows: auto 1fr auto;  /* 头 auto、内容 1fr、脚 auto */
  min-height: 100vh;
}
```

**效果与为什么推荐 Grid**：

两个写法都实现了"页脚贴底"。但看意图：

- Grid 版 `grid-template-rows: auto 1fr auto` 把"这个页面是**三行**的，中间一行占满"这件事**直接写在了脸上**。
- Flex 版的 `flex-direction: column` + `main { flex: 1 }` 是**绕了一圈**：你先把整页变成"一列 flex"，再让 main 去"长大"。

这个案例和 6.2.2 是同一类：**它表面看是一维（一列），实际是"页面骨架"的二维问题**——你在同时控制"三行的存在"和"中间那行的高度分配"。Grid 的三行模型更贴合真实意图。

**为什么用 `min-height` 而不是 `height`？** 因为内容多的时候，页面要能**超过一屏**继续往下长。`height: 100vh` 会把页面**钉死在一屏**，内容溢出直接跑出页脚区域。`min-height: 100vh` 的意思是"至少一屏，内容多了就往下长"，这才是 sticky footer 的正确姿势。

**变体：中间还要再分左右两栏？**

那就"外层 Grid 定三行、中间行再嵌套一个 Grid 定两列"——**这正是 6.3 要讲的嵌套模式**，先留个印象，下一节细讲。

> 一句话记住它：**页头/内容/页脚 = 三行骨架，`grid-template-rows: auto 1fr auto` 直白表达"中间占满、页脚贴底"；记得用 `min-height: 100vh` 而不是 `height`。**

---

### 6.2.6 圣杯 / 双飞翼布局

**结论**：**Grid 完胜**。这是当年让无数人用 `float` + 负 `margin` 写吐血的布局，Grid 三列直接解决。

**先回忆一下它的痛点**：三栏布局——左右固定宽（比如 200px），中间自适应。而且**为了 SEO 和可访问性，HTML 里"主内容"要写在最前面**，但视觉上它在中间。当年（float 时代）为了这个"内容优先"的顺序，得用负 margin 把两侧栏"拉"回同一行，代码极其反人类。

```html
<div class="grail">
  <main class="grail-main">主内容（HTML 里排第一）</main>
  <aside class="grail-left">左栏 200px</aside>
  <aside class="grail-right">右栏 200px</aside>
</div>
```

**Grid 写法（推荐，HTML 顺序不用改）**：

```css
.grail {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
}
.grail-main { grid-column: 2; grid-row: 1; }   /* 内容区占据第 2 列 */
.grail-left { grid-column: 1; grid-row: 1; }   /* 左栏塞到第 1 列 */
.grail-right { grid-column: 3; grid-row: 1; }  /* 右栏塞到第 3 列 */
```

**Flex 写法（需要改 HTML 顺序，或者用 `order` 打补丁）**：

```css
.grail { display: flex; }
.grail-main { flex: 1; order: 2; }   /* ❌ 用 order 硬改视觉顺序 */
.grail-left { width: 200px; order: 1; }
.grail-right { width: 200px; order: 3; }
```

**效果与为什么 Grid 完胜**：

- Grid 版：`grid-column` / `grid-row` 让每个元素**自由指定自己待在网格的哪个格子**。HTML 顺序保持不变（内容在前），视觉顺序由格子决定。这是 Grid 相对 Flex 最本质的优势：**它把"位置"和"文档顺序"解耦了。**
- Flex 版：Flex 没有"指定格子的位置"这种能力，你只能用 `order` 去改顺序。`order` 的问题有两个：一是**键盘焦点和读屏顺序不会跟着 `order` 走**，视觉上是中间、但 Tab 键还是先到左栏；二是三个 `order` 数字散落各处，可读性差。

**圣杯布局是判断"该用 Grid"的一个绝佳试金石**：如果你发现自己要用 `order` 去改视觉顺序，基本就是"位置和顺序要解耦"的信号，那是 Grid 的活。

**变体：用 `grid-template-areas` 更直观**（尤其三栏名字多的时候）：

```css
.grail {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-areas: "left main right";
}
.grail-main { grid-area: main; }
.grail-left { grid-area: left; }
.grail-right { grid-area: right; }
```

`grid-column: 2` 和 `grid-area: main` 是同一个东西的两种写法，前者用**数字**（第几列），后者用**名字**（哪个区域）。**区域一多，命名版完胜**——`grid-area: main` 比 `grid-column: 2` 好读太多。

> 一句话记住它：**圣杯/双飞翼要"内容优先 + 视觉居中"，本质是"位置与文档顺序解耦"，这是 Grid 的 `grid-column` 强项；Flex 只能靠 `order` 打补丁，还会破坏键盘焦点顺序。**

---

### 6.2.7 堆叠式表单

**结论**：推荐 **Flex**（列方向）。表单是一列一列往下排的"一条线"，而且是标准的内容驱动。

```html
<form class="form">
  <label for="name">姓名</label>
  <input id="name" type="text">
  <label for="email">邮箱</label>
  <input id="email" type="email">
  <button type="submit">提交</button>
</form>
```

**Flex 写法（推荐）**：

```css
.form {
  display: flex;
  flex-direction: column;  /* 竖着排 */
  gap: 8px;
  max-width: 320px;
}
```

**Grid 写法（能写，但没必要）**：

```css
.form {
  display: grid;
  gap: 8px;
  max-width: 320px;   /* ❌ 单列 Grid，等于把"一条线"说成"一张 1 列的网" */
}
```

**效果与为什么推荐 Flex**：

两者视觉上几乎一样（单列 `gap: 8px`）。但语义上差别很大：

- 表单是一个**线性流程**：姓名 → 输入 → 邮箱 → 输入 → 提交。它是"一条线"，不是"一张网"。
- Grid 版 `display: grid` 没写任何 `grid-template-columns`，实际上就是"一列网格"——**你用"网格"这个词去描述一个根本没有网格的结构**，只会让读代码的人多想一步："这里是不是以后要变多列？"

**什么时候表单才该用 Grid？** 当你需要"标签在左、输入在右"这种**两列对齐**时。比如：

```css
.form { display: grid; grid-template-columns: 80px 1fr; gap: 8px; align-items: center; }
label { grid-column: 1; }
input { grid-column: 2; }
```

这时它真的有了"行列对齐"（所有标签都对齐成一条竖线，所有输入框对齐成另一条），才是 Grid 的场景。

**一个细节**：上面的表单里，`gap` 会同时控制"标签到输入框"和"输入框到下一个标签"的间距，导致它们一样大。如果你想让"标签紧贴自己的输入框、但和上一个输入框拉开距离"（视觉上分组），就需要把 label+input 包成一个 `.field`，再对 `.field` 用 `gap`：

```html
<div class="form">
  <div class="field"><label>姓名</label><input></div>
  <div class="field"><label>邮箱</label><input></div>
  <button>提交</button>
</div>
```

```css
.form { display: flex; flex-direction: column; gap: 16px; }  /* 组与组之间 16px */
.field { display: flex; flex-direction: column; gap: 4px; }  /* 组内标签到输入框 4px */
```

**注意这里又是一个嵌套**：外层 `form` 是"一列 field"，每个 `field` 内部又是"标签 + 输入"的一小列。两层都是一维，所以两层都用 Flex，没有 Grid 什么事。

> 一句话记住它：**上下堆叠的表单是"一条线"，用 Flex 列方向；只有当"标签、输入框要左右两列对齐"时，它才变成二维问题，才轮到 Grid。**

---

### 6.2.8 工具栏（按钮组）

**结论**：推荐 **Flex**。一排按钮，典型的一维 + 内容驱动，而且经常要"左边一组、右边一组"。

```html
<div class="toolbar">
  <div class="group">
    <button>加粗</button>
    <button>斜体</button>
    <button>下划线</button>
  </div>
  <div class="group">
    <button>撤销</button>
    <button>重做</button>
  </div>
</div>
```

**Flex 写法（推荐）**：

```css
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.group { display: flex; gap: 4px; }
.group:last-child { margin-left: auto; }  /* 第二组推到右边 */
```

**Grid 写法（别扭）**：

```css
.toolbar {
  display: grid;
  grid-template-columns: auto auto auto 1fr auto auto;  /* ❌ 按钮数量一变就得改 */
  gap: 4px;
}
.group { display: flex; gap: 4px; }
.group:last-child { grid-column: 5 / 7; }
```

**效果与为什么推荐 Flex**：

- Flex 版：`margin-left: auto` 把第二组推到最右，无论按钮数量怎么变都成立——**你不需要预先知道有几列**。
- Grid 版的死穴在于：`grid-template-columns` 要求你**提前声明列数**。工具栏加一个按钮，你就得去改那一长串 `auto auto auto ...`。而工具栏恰恰是**按钮数量经常变**的东西，这是"内容驱动"的典型特征——内容（按钮）的数量和宽度决定了布局，而不是反过来。

**这又回到 6.1 的第二问**：凡是"元素数量、宽度由内容决定，我懒得预先数格子"的场景，就是 Flex；凡是"我明确知道有 3 列 × 4 行"的场景，才是 Grid。

**一个真实的坑**：`.group:last-child { margin-left: auto }` 里，如果你忘了 `margin-left: auto`，第二组按钮会**紧贴着第一组**排在左边，看起来像"两组按钮混成一坨"。这是 Flex 里"分组推到两侧"的标准写法，值得背下来。也可以用 `justify-content: space-between` 代替，但那样**只有两组**时才会正确——如果以后加第三组，`space-between` 会把三组"平均分布"，效果就变了；而 `margin-left: auto` 永远只把"最后一个"推到右边，更稳定。

> 一句话记住它：**工具栏 = 一排数量不定的按钮，用 Flex；`margin-left: auto` 把最后一组推到右边。Grid 要求你预先声明列数，按钮一多就得改 `grid-template-columns`，纯属自找麻烦。**

---

### 6.2.9 画廊（masonry 瀑布流）

**结论**：**两个都不完美**。这个案例是专门用来打破"Flex/Grid 二选一"迷信的——**瀑布流不是它们的本职**。纯 CSS 的诚实答案是 `columns`；Grid 只能做"近似瀑布流"；Flex 直接出局。

先看问题本质：瀑布流要求**每一列独立向下堆叠**，卡片高度不一，下一张卡片要"塞到当前最短的那一列下面"。这是**"列内是一维、列间要互相协调高度"**的混合需求，Flex（一维）和 Grid（严格的行列）都天然不擅长。

```html
<div class="masonry">
  <div class="tile" style="height:120px">1</div>
  <div class="tile" style="height:80px">2</div>
  <div class="tile" style="height:160px">3</div>
  <div class="tile" style="height:100px">4</div>
  <div class="tile" style="height:140px">5</div>
</div>
```

**诚实的纯 CSS 方案：`columns`（CSS 多栏）**：

```css
.masonry { columns: 3; column-gap: 12px; }  /* ✅ 真正的瀑布流，竖向堆叠 */
.tile { break-inside: avoid; margin-bottom: 12px; }  /* 防止卡片被拦腰截断 */
```

**Grid 的"近似瀑布流"（需要知道每张图高度）**：

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 20px;       /* 把每行切成 20px 的小格 */
  gap: 12px;
}
.tile:nth-child(1) { grid-row: span 6; }   /* 120px ÷ 20px = 6 行 */
.tile:nth-child(2) { grid-row: span 4; }
.tile:nth-child(3) { grid-row: span 8; }
.tile:nth-child(4) { grid-row: span 5; }
.tile:nth-child(5) { grid-row: span 7; }
```

**Flex 写法**：放弃。`flex-wrap: wrap` 会让同一"行"里的卡片被强制顶部对齐，根本无法形成瀑布流的错落。

**效果与为什么两个都不完美**：

- `columns` 版：是**真瀑布流**，但它有一个致命缺陷——**卡片是"先从上往下、再从左上到右上"排列的**（阅读顺序是纵向的）。如果你的画廊需要"从左到右"的阅读顺序（比如时间线），它就不合适。
- Grid 版：能保持从左到右的顺序，但你要**手动算每张卡片 `span` 几行**（高度 ÷ `grid-auto-rows`）。真实图片高度你没法在 CSS 里知道，所以**实际项目里这一步要用 JS 去量图高再写 `grid-row: span N`**。CSS Grid Level 3 提案里有个实验性的 `masonry` 关键字，但截至本教程，主流浏览器还没落地。

**结论**：画廊/瀑布流是"Flex/Grid 边界之外"的典型。简单场景用 `columns`（接受纵向阅读顺序），要横向顺序就用 Grid + JS 算 span。**别硬用 Flex 去堆。**

**顺带破除一个迷信**：网上很多教程说"Flex 也能做瀑布流"，实际上那要么是"每列一个 Flex 容器"（本质是 `columns` 的手动版，还要写死列数），要么是视觉上凑巧像、实际有 bug。**真正的瀑布流需要"列间高度协调"，这是 Flex 和 Grid 都没有的一等能力。**

> 一句话记住它：**瀑布流不是 Flex/Grid 的本职：Flex 直接出局，Grid 只能"近似"（需 JS 算高度），纯 CSS 的诚实答案是 `columns`——代价是纵向阅读顺序。**

---

### 6.2.10 仪表盘

**结论**：**Grid 完胜**，而且是 `grid-template-areas` 的封神场景。仪表盘有多个命名区域、跨行跨列，这是二维布局的极致。

```html
<div class="dashboard">
  <header class="dash-header">头部</header>
  <aside class="dash-side">侧栏</aside>
  <section class="dash-stats">数据统计</section>
  <section class="dash-chart">主图表（宽，跨两列）</section>
  <section class="dash-list">列表</section>
  <footer class="dash-footer">底部</footer>
</div>
```

**Grid 写法（推荐，命名区域一目了然）**：

```css
.dashboard {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    "header header header"
    "side   stats  stats"
    "side   chart  list"
    "footer footer footer";
  gap: 12px;
  min-height: 100vh;
}
.dash-header { grid-area: header; }
.dash-side   { grid-area: side; }
.dash-stats  { grid-area: stats; }
.dash-chart  { grid-area: chart; }
.dash-list   { grid-area: list; }
.dash-footer { grid-area: footer; }
```

**Flex 写法（能写，但会嵌套成金字塔）**：

```css
.dashboard { display: flex; flex-direction: column; min-height: 100vh; }
.row { display: flex; flex: 1; }                       /* 中间拆成"行" */
.row .side { width: 200px; }
.row .right { display: flex; flex-direction: column; flex: 1; }   /* 右边又拆成"列" */
.row .right .stats-chart { display: flex; }            /* 再拆…… */
```

**效果与为什么 Grid 完胜**：

- Grid 版：那个 `grid-template-areas` 里的 ASCII 图，**直接把整个仪表盘的布局画在了 CSS 里**。谁在哪个位置、谁跨两列，一眼看懂。改布局 = 改这张图。
- Flex 版：为了表达"二维"的结构，你被迫写了 `row` → `right` → `stats-chart` 一层套一层的 div，HTML 被污染了，CSS 也碎成一地。**这是"该用 Grid 却硬用 Flex"的反模式巅峰**，下一节 6.4 专门讲它。

**一个关键细节**：`grid-template-areas` 里的**每一个名字都必须连成矩形**，不能是 L 形、T 形或不规则块。比如你不能让一个区域占"第一行的第 1、2 列 + 第二行的第 2、3 列"——那样它不是一个矩形，Grid 会直接**忽略整条 `grid-template-areas` 声明**，布局就塌回"每个元素一行"的默认状态。这是个隐蔽但真实的坑（见 6.5 坑速查）。

**变体：仪表盘要响应式（窄屏变成单列）？**

这属于第 07 章"响应式"的范畴，这里先剧透一句结论：**`grid-template-areas` 是响应式布局里最好改的东西**——窄屏时你只需要重写一张"单列版"的区域图即可：

```css
@media (max-width: 720px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "stats"
      "chart"
      "list"
      "side"
      "footer";
  }
}
```

改的只是那张 ASCII 图，HTML 和每个 `grid-area` 一个字都不用动。这就是"声明式布局"的威力——下一章你会反复用到它。

> 一句话记住它：**仪表盘是 `grid-template-areas` 的主场——把布局直接"画"在 CSS 里；硬用 Flex 会写出层层嵌套的 div，把 HTML 也污染了。**

---

## 6.3 生产真相：外层 Grid 骨架 + 内层 Flex 细节

读到这里你可能会有一个疑问：**"十个案例推荐了 7 个 Grid，那我是不是以后全用 Grid？"**

**错。真实项目里，Flex 和 Grid 是"上下级"关系，不是"二选一"关系。**

看一个真实页面的骨架：

```
┌─────────────────────────────────────┐
│  header（logo + 导航，内部是 Flex）   │
├──────────┬──────────────────────────┤
│ sidebar  │  main                    │
│ （列）    │  ├ 卡片网格（Grid）       │
│          │  └ 工具栏（Flex）         │
├──────────┴──────────────────────────┤
│  footer（内部是 Flex）                │
└─────────────────────────────────────┘
```

**外层**是"页面分几块、谁在左谁在右"，这是**二维骨架**，用 Grid。**内层**是"这一块里的元素怎么排队"，这是**一维细节**，用 Flex。

```html
<div class="app">
  <header class="app-header">
    <a class="brand" href="#">Logo</a>
    <nav class="app-nav">
      <a href="#">首页</a>
      <a href="#">产品</a>
      <a href="#">关于</a>
    </nav>
  </header>
  <aside class="app-side">侧栏</aside>
  <main class="app-main">
    <div class="toolbar">
      <button>新建</button>
      <button>删除</button>
    </div>
    <div class="card-grid">
      <div class="card">1</div>
      <div class="card">2</div>
      <div class="card">3</div>
    </div>
  </main>
</div>
```

```css
/* ① 外层：Grid 骨架，负责"这个页面分成几块" */
.app {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 56px 1fr;
  grid-template-areas:
    "header header"
    "side   main";
  min-height: 100vh;
}
.app-header { grid-area: header; }
.app-side   { grid-area: side; }
.app-main   { grid-area: main; }

/* ② 内层：Flex 细节，负责"这一块里的元素怎么排队" */
.app-header { display: flex; align-items: center; gap: 24px; }
.app-nav    { display: flex; gap: 16px; margin-left: auto; }
.toolbar    { display: flex; gap: 8px; }

/* ③ 内层也可以再用 Grid：卡片网格本身就是二维的 */
.card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
```

**这就是生产里最真实的写法**：一个元素既可以 `display: grid`（对外，它是骨架里的一个格子），又可以同时给子元素用 Flex（对内，它管理自己内部的排队）。**`grid-area` 决定"我在哪"，`display: flex` 决定"我里面怎么排"，两者完全不冲突。**

为什么会形成这个模式？因为**维度的粒度不同**：

- 页面层级：天然是二维的（几行几列）。
- 组件层级：大多数是一维的（一排按钮、一列菜单）。
- 但**组件里也可能冒出二维**（卡片网格、表头），那就再套一层 Grid。

**所以正确的心理模型不是"Flex 好还是 Grid 好"，而是"这一层是几维的，就用几维的工具"。** 一层一层问下去，答案自然清晰。

**一个判断小技巧**：当你写一个组件时，先问"这个组件自己是骨架，还是被装进骨架里的东西？"——前者大概率要 `display: grid`（或干脆作为 Grid 的一个 `grid-area`），后者大概率要 `display: flex` 排自己的内部。

> 一句话记住它：**Flex 和 Grid 不是敌人，是上下级：外层 Grid 搭骨架（页面分几块），内层 Flex 排细节（块内怎么排队），组件里又冒出二维就再套 Grid。**

---

## 6.4 反模式：用错工具的别扭代码

上一节说了"正确姿势"，这一节专门看三个**最常见的错误姿势**。它们都来自同一个病根：**没先问"这是几维的"，抓起一个工具就硬写。**

### 反模式一：该用 Grid 却硬用 Flex 堆

**病根**：一个二维布局（行列都要对齐），你硬用一维的 Flex 去堆，结果 HTML 里长出层层嵌套的 `row` / `col` div。

```html
<div class="flex-grid">          <!-- ❌ 想用 Flex 模拟 3×3 网格 -->
  <div class="flex-row">
    <div class="cell">1</div><div class="cell">2</div><div class="cell">3</div>
  </div>
  <div class="flex-row">
    <div class="cell">4</div><div class="cell">5</div><div class="cell">6</div>
  </div>
  <div class="flex-row">
    <div class="cell">7</div><div class="cell">8</div><div class="cell">9</div>
  </div>
</div>
```

```css
.flex-grid { display: flex; flex-direction: column; }
.flex-row  { display: flex; }        /* ❌ 手动造"行"，每行还得再 flex 一次 */
.cell      { flex: 1; margin: 4px; }
```

**为什么别扭**：

1. **HTML 被污染**：你被迫加了 `flex-row` 这一层**毫无语义**的包裹 div。屏幕阅读器、维护者都要多读一层"纯布局的垃圾"。
2. **CSS 碎成两处**：先 `flex-direction: column` 造列，再每行 `display: flex` 造行，你在**手动模拟** Grid 天生就有的"行列"。
3. **改起来痛苦**：想把第 5 个格子跨两列？Flex 版你得拆开重排 HTML；Grid 版一个 `grid-column: span 2` 完事。

**正确写法**：

```css
.flex-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* ✅ 一行搞定 3 列 */
  gap: 8px;
}
.cell { /* 啥都不用写，自己会进格子 */ }
```

```html
<div class="flex-grid">
  <div class="cell">1</div><div class="cell">2</div><div class="cell">3</div>
  <div class="cell">4</div><div class="cell">5</div><div class="cell">6</div>
  <div class="cell">7</div><div class="cell">8</div><div class="cell">9</div>
</div>
```

> 一句话记住它：**当你开始写 `flex-row`、`flex-col` 这种"模拟行列"的包裹 div 时，停下来——那是 Grid 的本职，你在手动复刻一个更烂的 Grid。**

### 反模式二：该用 Flex 却硬用 Grid

**病根**：一个一维、内容驱动的布局（元素数量不定、宽度随内容），你硬用二维的 Grid 去套，结果给自己添了"数格子"的负担。

```html
<div class="grid-nav">  <!-- ❌ 想用 Grid 做导航栏 -->
  <a href="#">首页</a>
  <a href="#">产品</a>
  <a href="#">一个很长很长的导航项</a>
  <a href="#">关于</a>
</div>
```

```css
.grid-nav {
  display: grid;
  grid-template-columns: repeat(4, auto);  /* ❌ 数了 4 个导航项 */
  gap: 16px;
}
```

**为什么别扭**：

1. **导航项数量一变，`grid-template-columns` 就得改**。加了第 5 个导航项，布局直接坏掉（第 5 个掉到第二行）。
2. **`auto` 列宽是"猜"的**：你写 `repeat(4, auto)`，本质是在用 Grid 模拟"让内容自己决定宽度"——可这**本来就是 Flex 的默认行为**，你绕了一圈。

**正确写法**：

```css
.grid-nav {
  display: flex;       /* ✅ 一维 + 内容驱动，Flex 默认就是"内容定宽、排成一排" */
  gap: 16px;
}
```

### 反模式三：把对齐属性散落在每个子项上

**病根**：容器上的对齐规则（该在哪对齐）被你拆成每个子项上的 `align-self` / `justify-self` / `margin`，这是"手动摆位"思维，和本教程第 00 章的"声明关系"背道而驰。

```html
<div class="spread">
  <div class="a">A</div>
  <div class="b">B</div>
  <div class="c">C</div>
</div>
```

```css
.spread { display: flex; }
.a { margin-right: 10px; }   /* ❌ 每个子项各管各的间距 */
.b { margin-right: 20px; }
.c { margin-right: 30px; }
```

**为什么别扭**：

1. **规则散落**：间距规则被拆到三个子项里，你没法一眼看出"这三个的间距规则是什么"。
2. **一改全崩**：想统一改成"等距 16px"，你得改三处，还容易漏。

**正确写法**：

```css
.spread { display: flex; gap: 16px; }   /* ✅ 容器声明"间距 16px"，一条搞定 */
```

这个反模式和"手动造行列 / 手动数格子"是同一病根的两面：**所有规则都应该尽量声明在容器上（关系），而不是散落在子项上（个体）。** 这是第 00 章"声明式"哲学在布局里的具体落地。

### 三个反模式的统一诊断法

遇到纠结，问一句：**"我是不是在手动数格子 / 手动造行列 / 手动摆间距？"**

- 手动造行列（`flex-row` 包裹）→ 这是二维，用 Grid。
- 手动数格子（`repeat(4, auto)`）→ 这是一维 + 内容驱动，用 Flex。
- 手动摆间距（每个子项 `margin-right`）→ 改用容器上的 `gap`。

**凡是需要你"数"、"造"或"摆"的，都是用错了工具或写错了层的信号。**

> 一句话记住它：**"手动造行列"是 Grid 的活被 Flex 抢了；"手动数格子"是 Flex 的活被 Grid 抢了；"手动摆间距"是容器 `gap` 的活被每个子项抢了。需要你数、造或摆，就是信号。**

---

## 6.5 本章常见坑速查

| 坑 | 现象 | 原因 | 正确做法 |
|---|---|---|---|
| 用 `flex-wrap` 做卡片网格 | 最后一行卡片比前面宽，被拉伸占满整行 | `flex: 1 1 240px` 里 `flex-grow: 1` 让最后一行不足的卡片"长大" | 卡片网格用 `repeat(auto-fit, minmax(240px, 1fr))` |
| Flex 两栏布局，侧边栏被挤窄 | 侧边栏内容变宽时，它反而变窄了 | Flex 默认 `flex-shrink: 1`，空间不够就收缩 | 侧边栏加 `flex-shrink: 0`，或直接用 Grid 骨架 |
| 用 `order` 改圣杯布局的视觉顺序 | 视觉上中间了，但 Tab 键/读屏还是先到左栏 | `order` 只改视觉，不改 DOM 顺序和焦点顺序 | 用 Grid 的 `grid-column`，让"位置"与"顺序"解耦 |
| 用 Grid 做导航栏/工具栏 | 加一个导航项，布局就乱（掉到第二行） | `grid-template-columns: repeat(4, auto)` 写死了列数 | 一维 + 内容驱动用 Flex |
| 用 Flex 模拟网格，加 `flex-row` 包裹 div | HTML 里多出无语义的包裹层，改跨度要重排 | 手动造"行列"，是在复刻 Grid | 直接用 `display: grid` |
| 瀑布流硬用 Flex | 同一行卡片被强制顶部对齐，没有错落 | `flex-wrap` 是"行内对齐"，瀑布流要"列内堆叠" | 用 `columns`（接受纵向顺序）或 Grid+JS 算 span |
| `grid-template-areas` 里写错区域名 | 某些格子空白，元素挤到一起 | 区域名拼写和 `grid-area` 对不上 | 让 `areas` 字符串里的名字与每个 `grid-area` 严格一致 |
| `grid-template-areas` 区域不是矩形 | 整个 `grid-template-areas` 失效，布局塌回单列 | Grid 要求每个命名区域必须是连续的矩形 | 保证每个名字在 ASCII 图里连成一个矩形块 |
| 用 `height: 100vh` 做 sticky footer | 内容多时溢出，跑到页脚区域之外 | `height` 把页面钉死在一屏 | 改用 `min-height: 100vh` + `grid-template-rows: auto 1fr auto` |
| 每个子项各写 `margin-right` 控制间距 | 间距规则散落各处，改起来漏改 | 手动摆间距，违反"声明关系" | 容器上统一 `gap` |

---

## 6.6 本章小结

- **决策三问**：一维还是二维？内容驱动还是布局驱动？第二轴要"对齐"还是"分配"？——三问叠加，答案自明。
- **Flex 的本职**：一条线、内容驱动、第二轴只能对齐（导航栏、工具栏、堆叠表单、居中）。
- **Grid 的本职**：一张网、布局驱动、两条轴都能分配（卡片网格、仪表盘、圣杯、页头页脚、侧边栏骨架）。
- **十个案例的推荐**：Flex × 3（导航栏、堆叠表单、工具栏），Grid × 7（侧边栏、卡片网格、页头页脚、圣杯、仪表盘），居中两者皆可，瀑布流两者都不擅长（用 `columns` 或 Grid+JS）。
- **组合模式**：外层 Grid 骨架 + 内层 Flex 细节，组件里再冒二维就再套 Grid。
- **反模式诊断**："手动造行列"（`flex-row` 包裹）是抢了 Grid 的活；"手动数格子"（`repeat(4, auto)`）是抢了 Flex 的活；"手动摆间距"是抢了容器 `gap` 的活。
- **一句话**：Flex 管"一条线"，Grid 管"一张网"，先判断线还是网。

---

## 6.7 动手练习

1. **改错**：下面的"卡片网格"用了 Flex，5 张卡片时最后一行会拉伸。请改成 Grid 写法，并解释 `auto-fill` 和 `auto-fit` 在这里该选哪个、为什么。

```css
   .cards { display: flex; flex-wrap: wrap; gap: 16px; }
   .card { flex: 1 1 240px; }
```

   <details><summary>参考答案</summary>

```css
   .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
```

   选 `auto-fit`：卡片数量不满一行时，`auto-fit` 会把空轨道折叠，让现有卡片铺满整行；`auto-fill` 会保留空轨道，卡片只能占自己的 240px 格子、右边留白。卡片流场景要"铺满"，所以用 `auto-fit`。
   </details>

2. **选型**：一个页面是"顶部导航 + 左侧菜单 + 右侧内容区 + 底部状态栏"，内容区里还有一排操作按钮和一张 4 列的表格。请说出：外层用什么、导航内部用什么、按钮组用什么、表格用什么，以及为什么。

   <details><summary>参考答案</summary>

   - 外层（导航/菜单/内容/状态栏）：**Grid**，这是页面骨架，四块区域二维排布，用 `grid-template-areas` 表达最直白。
   - 导航内部（logo + 链接）：**Flex**，一排内容驱动的元素。
   - 操作按钮组：**Flex**，一排数量不定的按钮。
   - 表格：**Grid**（或语义化 `<table>` 配合 CSS Grid 样式），行列严格对齐，是二维。
   </details>

3. **诊断**：同事写了一个布局，HTML 里出现了 `div.row`、`div.col` 的嵌套包裹，CSS 里 `display: flex` 和 `flex-direction` 反复出现。请指出他的问题，并给出改法。

   <details><summary>参考答案</summary>

   他在用 Flex 手动模拟二维网格，这是"该用 Grid 却硬用 Flex"的反模式。`div.row` / `div.col` 是无语义的布局垃圾层。改法：把外层换成 `display: grid` + `grid-template-columns`，删掉所有 `row`/`col` 包裹层，让格子直接作为 Grid 的子项。
   </details>

4. **写一遍圣杯**：三栏布局，左右各 200px 固定、中间自适应，且 HTML 里主内容必须排在最前面。分别用 Grid 和 Flex 实现，并说明 Flex 版本的两个缺陷。

   <details><summary>参考答案</summary>

   Grid 版：`grid-template-columns: 200px 1fr 200px` + 每个元素用 `grid-column` 指定列（内容 `grid-column: 2`），HTML 顺序不用改。

   Flex 版：`main { flex: 1; order: 2 }` 加左右栏 `order: 1/3`。缺陷一：`order` 只改视觉顺序，键盘焦点和读屏顺序仍是 DOM 顺序（先左栏）；缺陷二：三个 `order` 数字散落，可读性差、易写错。
   </details>

5. **判断**：下面的说法对不对？"因为 Grid 比 Flex 新、能力更强，所以新项目的所有布局都应该用 Grid。"

   <details><summary>参考答案</summary>

   错。Flex 和 Grid 是同一代工具，解决不同维度的问题（一维 vs 二维），不是新旧替代。全用 Grid 会在"一维 + 内容驱动"的场景（导航栏、工具栏）被迫写死列数，元素一多就坏。正确做法是"线用 Flex、网用 Grid、骨架用 Grid、细节用 Flex"。
   </details>

6. **实战**：一个"博客文章页"的骨架是：顶部是标题栏（标题 + 点赞按钮）、中间是正文区（左 70% 正文 + 右 30% 目录）、底部是"上一篇/下一篇"两个链接。请给外层、标题栏内部、底部链接组分别选型，并写出外层骨架的 CSS。

   <details><summary>参考答案</summary>

   - 外层（标题 / 正文 / 底部）：**Grid**，三行骨架，`grid-template-rows: auto 1fr auto`。
   - 标题栏内部（标题 + 点赞按钮）：**Flex**，一排内容驱动，`margin-left: auto` 把按钮推右。
   - 底部链接组（上一篇/下一篇）：**Flex**，两个链接 + `justify-content: space-between` 或一个 `margin-left: auto`。

```css
   .article {
     display: grid;
     grid-template-rows: auto 1fr auto;
     min-height: 100vh;
   }
   .article-body { display: grid; grid-template-columns: 7fr 3fr; gap: 24px; }
   .article-header { display: flex; align-items: center; }
   .article-header button { margin-left: auto; }
   .article-footer { display: flex; justify-content: space-between; }
```

   注意：中间正文区（左 70% + 右 30%）是**二维**，所以在三行骨架内部又嵌套了一层 Grid。
   </details>

7. **反模式识别**：下面是三段 CSS，分别判断它们错在哪、该用什么改。

```css
   /* A */
   .menu { display: grid; grid-template-columns: repeat(5, auto); }

   /* B */
   .photos { display: flex; }
   .photos .row { display: flex; flex-wrap: wrap; }

   /* C */
   .btns { display: flex; }
   .btns button:nth-child(1) { margin-right: 8px; }
   .btns button:nth-child(2) { margin-right: 8px; }
   .btns button:nth-child(3) { margin-right: 0; }
```

   <details><summary>参考答案</summary>

   - A：**该用 Flex**。菜单是一排内容驱动的项，`repeat(5, auto)` 写死了数量，加一项就坏。改成 `display: flex; gap: 16px`。
   - B：**该用 Grid**。照片墙是二维，`.row` 包裹层是"手动造行列"。改成 `display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`，删掉 `.row`。
   - C：**该用容器 `gap`**。间距规则散落在每个 `button` 上，是"手动摆间距"。改成 `.btns { display: flex; gap: 8px }`，删掉那三条 `margin-right`。
   </details>

---

> 📖 **本章的代码示例**：`examples/06-布局案例.html`（十个案例的 Flex vs Grid 可视化对比，每个都能在浏览器里看到两种写法的渲染差异）
> 🚀 **下一章**：第 07 章讲**响应式布局最佳实践**——媒体查询、容器查询、移动优先、`clamp()` 流式排版。布局会选了，还得让它在不同屏幕上都成立。
