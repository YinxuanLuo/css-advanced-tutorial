# 第 04 章 · Grid 核心：二维布局的正确打开方式

> 上一章你搞定了 Flex——一行/一列内的排列、对齐、伸缩，你已经能随心所欲了。
> 但真实页面里，还有一大类需求 Flex 搞不定：**"行列同时对齐"**。比如"上面是导航、左边是侧栏、中间是内容、右边是广告、下面是页脚"这种页面骨架，它同时有行有列，而且行与行、列与列之间要对齐。
>
> 这一章要解决的，就是这个**二维布局**问题。工具就是 CSS Grid。
>
> 本章你需要记住的就一件事：**Grid 不是"升级版 Flex"，它是另一套心智模型——你先声明"这张表有几行几列、每行每列多宽多高"，再把元素"投放"到由"线"围成的区域里。你画的是网格，不是摆元素。**

---

## 4.1 `display: grid` 与 Flex 的本质区别：一维 vs 二维

**先给结论**：Flex 和 Grid 不是"谁更好"，是"解决不同维度的问题"。

- Flex 是**一维**的：它只有一根主轴。元素沿着这根轴排，要么排成一行，要么排成一列。换行（`flex-wrap`）之后，**每一行是独立的**，第二行根本不知道第一行有多宽、元素在哪。
- Grid 是**二维**的：它同时建立**行**和**列**两根轴。你声明"3 列 × 2 行"之后，就得到了一张真正的表，每个单元格的位置由"第几列 × 第几行"唯一确定。**行列天然对齐。**

这个区别带来一个直接的判断标准：

> **你的布局能不能画成一张"表"（有明确的列边界、行边界，元素要对齐到行列上）？**
> 能，就用 Grid；只是"一堆东西排成一行/一列"，就用 Flex。

看一段最直白的对比。同样是 6 个卡片：

```html
<div class="flex-box">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>

<div class="grid-box">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
```

```css
/* Flex：一维流，换行后各行独立，宽度自己决定 */
.flex-box { display: flex; flex-wrap: wrap; gap: 10px; }
.flex-box .item { flex: 1 1 30%; }  /* 每个 item 自己想占 30%，凑不满就换行 */

/* Grid：二维表，3 列 × 2 行，行列对齐 */
.grid-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
```

**渲染效果**：两个盒子看起来都是"3 列 2 行的卡片"，但达成方式完全不同——

- Flex 那一坨，是每个 item 自己声明"我占 30%、放不下就换行"，浏览器算出来的"恰好 3 列"，**纯属巧合**。你改一个 item 的宽度，或者内容变长，整行就乱。
- Grid 那一坨，是你**明确告诉浏览器"这是 3 列"**，第 4 个元素必然落到第二行第一列。这是**规则，不是巧合**。

**你心里可能在想**：那 Flex 是不是没用了？不是。Flex 的优势恰恰在于它"管一行"——一行内元素数量不定、宽度不定、还要自动伸缩的时候，Flex 的 `flex-grow`/`flex-shrink` 比 Grid 更顺手。**记住分工：Flex 管"一根轴上的流动"，Grid 管"一张表上的摆放"。**

而且它们**经常配合使用**：页面整体骨架用 Grid（有行有列），骨架里某个区域的内部（比如导航栏里的几个按钮、卡片里的标题和价格）再用 Flex。这不是二选一，是"外层二维、内层一维"的分工。

### 4.1.1 Grid 的术语速览（后面每一节都要用）

Grid 有一套自己的名词，先一次性记住，后面不再解释：

| 术语 | 英文 | 是什么 |
|---|---|---|
| 网格容器 | grid container | 设了 `display: grid` 的那个元素 |
| 网格项目 | grid item | 网格容器的**直接子元素** |
| 轨道 | track | 一条"列"或一条"行"（两条相邻线之间的整条空间） |
| 网格线 | grid line | 轨道的边界，定位的基准 |
| 单元格 | cell | 一条列轨道 × 一条行轨道的交叉格子，最小单位 |
| 网格区域 | grid area | 由若干单元格连成的一块矩形区域 |
| 间隙 | gap | 轨道之间的空白（`row-gap` 行间隙 / `column-gap` 列间隙） |

配合这张图看，术语就活了：

```text
             列线1      列线2      列线3
              │          │          │
  行线1 ──────┼──────────┼──────────┤
              │  单元格  │  单元格  │    ← 一行轨道
  行线2 ──────┼──────────┼──────────┤
              │  单元格  │  单元格  │
  行线3 ──────┴──────────┴──────────┘
              └──── 一列轨道 ────┘
```

**一个常被忽略的点**：只有**直接子元素**才是 grid item。子元素的子元素，和 Grid 没有任何关系（除非它自己也 `display: grid`）。这个"只认亲儿子"的规则，和 Flex 一模一样。

### 4.1.2 什么时候该上 Grid？

| 场景 | 用谁 | 理由 |
|---|---|---|
| 顶部导航栏（logo 左、菜单右） | Flex | 一维，沿主轴排 |
| 一行卡片，数量不固定，自动换行 | Flex 或 Grid | 看要不要"列对齐" |
| 页面骨架（header / 侧栏 / 主区 / 页脚） | **Grid** | 有行有列，要严格对齐 |
| 相册、商品墙（行列都要对齐） | **Grid** | 二维对齐是刚需 |
| 表单里一行 label + input | Flex | 一维 |
| 仪表盘（多个卡片，有的宽有的高） | **Grid** | 区域化摆放 |
| 元素要跨列、跨行 | **Grid** | Flex 做不到"跨行" |

那"一行卡片、自动换行"这种，Flex 和 Grid 都能干，到底选谁？答案是：**看你要不要"列对齐"**。如果你希望第二行的卡片和第一行的卡片**列宽严格一致**，选 Grid（`repeat(auto-fill, minmax(200px, 1fr))`，下一章讲）；如果只是"排一排、放不下换行、每个卡片宽度可以各自为政"，Flex 足够。

### 4.1.3 为什么 Grid 从"线"（line）而不是"单元格"来思考？

这是 Grid 最容易被忽略、却最重要的设计。先记住一个事实：

> **一个有 N 列的网格，有 N+1 条"列线"（column line）。**

```text
  1        2        3        4     ← 列线编号（1 到 N+1）
  │        │        │        │
  │  列1   │  列2   │  列3   │
  │        │        │        │
```

3 列，4 条列线。同理，M 行有 M+1 条行线（row line）。

**Grid 里的"位置"不是"第 2 个单元格"，而是"从第几条线到第几条线"。** 这就是为什么你会看到 `grid-column: 1 / 3` 这种写法——它读作"从第 1 条列线，跨到第 3 条列线"，也就是跨了 **2 列**（第 1 列和第 2 列）。

**为什么这么设计？** 因为"区域"在几何上是由"边界"定义的，而边界就是线。用线来描述，三个好处：

1. **表达"跨越"很自然**：`1 / 3` 天然就是"跨两列"，不需要发明"合并单元格"这种新语法。
2. **支持负数**：`-1` 表示"最后一条线"。`grid-column: 1 / -1` 就是"从第一列一直到最后"——一行搞定"占满整行"，你**不用数一共有几列**。
3. **反向也成立**：`3 / 1` 表示"从第 3 条线到第 1 条线"，可以反向跨。

反观"单元格编号"这套思路（像 Excel 的 A1、B2），要表达"跨三列"得写"A1 合并到 C1"，表达"到最后"得先知道表格多宽。**线，是更底层、更灵活的抽象。** 下一节 4.2 就把"线定位"完整落地。

### 4.1.4 一个必须澄清的问题：Grid 会取代 Flex 吗？

学 Grid 的人几乎都会问这句。答案是：**不会，也不该。**

这不是"安慰你 Flex 没白学"的场面话，而是它们解决的问题维度真的不一样：

- **Flex 强在"一行/一列内的内容自适应"**。一行里元素数量不定、每个宽度不定、还要按内容伸缩，Flex 的 `flex-grow`/`flex-shrink`/`flex-basis` 三件套是专门为这个设计的。你用 Grid 去摆一个"不知道几个按钮的导航栏"，反而别扭——你得先声明几列，可列数本身是不确定的。
- **Grid 强在"二维结构"**。行列对齐、跨列跨行、整体骨架，这是 Flex 用 `flex-wrap` 硬凑不出来的。

**一个实用的判断口诀**，来自 W3C 官方文档的原文大意：

> **如果你在"已经定好行和列"的前提下做布局，用 Grid；如果只是让内容"在一根轴上自然流动"，用 Flex。**

**还有更狠的一条**：很多情况下，你根本不用纠结"选哪个"，因为**它们嵌套用**——外层页面骨架用 Grid（定行列），骨架里每个区域的内部再用 Flex（管一行内的细节）。比如：

```css
.page {
  display: grid;
  grid-template-areas: "header" "main" "footer";
}
.navbar {
  display: flex;            /* header 内部的一排按钮，还是 Flex 顺手 */
  justify-content: space-between;
}
```

**"Grid 换掉 Flex"是个伪命题；正确的问题是"这个局部是一维还是二维"。**

> 一句话记住它：**Flex 管一根轴，Grid 管一张表；判断标准是"能不能画成对齐的表"。Grid 不会取代 Flex——外层二维用 Grid，内层一维用 Flex，嵌套着用。而 Grid 内部用"线"定位：N 列有 N+1 条列线，`1 / -1` 就是"从头到尾"。**

---

## 4.2 用"线"定位：`grid-column` / `grid-row` / `span`

**先给结论**：Grid 里"把元素放到哪"，本质就一句话——**用 `grid-column` 指定它占哪两条列线之间，用 `grid-row` 指定它占哪两条行线之间。** 这两个属性是 `grid-template-areas`（4.5 节）的底层实现，也是跨列跨行的根本手段。

### 4.2.1 列线和行线怎么编号

先建一个 3 列 × 2 行的网格，把线号画出来：

```text
        1       2       3       4   ← 列线号
      ┌───────┬───────┬───────┐
   1  │  A    │  B    │  C    │
      ├───────┼───────┼───────┤
   2  │  D    │  E    │  F    │
      ├───────┼───────┼───────┤
   3  │       │       │       │
      └───────┴───────┴───────┘
      ↑ 行线号（左侧数字）
```

- **列线**从左到右编号：`1, 2, 3, 4`（3 列 → 4 条列线）。
- **行线**从上到下编号：`1, 2, 3`（2 行 → 3 条行线）。

元素 A 占据的格子，就是"列线 1~2 × 行线 1~2"这个矩形。

### 4.2.2 `grid-column` / `grid-row` 的基本语法

```html
<div class="grid">
  <div class="a">A</div>
  <div class="b">B</div>
  <div class="c">C</div>
  <div class="d">D</div>
  <div class="e">E</div>
  <div class="f">F</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 80px);
  gap: 10px;
}

/* 让 B 跨两列：从列线 1 到列线 3 */
.b { grid-column: 1 / 3; }

/* 让 D 跨两行：从行线 1 到行线 3 */
.d { grid-row: 1 / 3; }
```

**渲染效果**：B 从"一格"变成"横跨两列"，把 C 挤到第二行；D 竖着跨了两行。注意**其它元素会自动让位**——这就是 Grid 的自动放置：你只显式指定了 B 和 D 的位置，A、C、E、F 由浏览器按顺序塞进剩下的格子。

**语法拆解**：`grid-column: 起点线 / 终点线`。可以只写一个数（只指定起点，终点自动跨一格），也可以写两个。`grid-row` 同理，管的是"行线"。

### 4.2.3 `span`：不数终点，只数"跨几格"

`span` 关键字让你**不指定终点线，只指定"跨几条轨道"**。上面 B 的写法，两种等价：

```css
/* 方式一：指定起点和终点线号 */
.b { grid-column: 1 / 3; }

/* 方式二：指定起点，跨 2 条列轨道 */
.b { grid-column: 1 / span 2; }

/* 方式三：只写 span，起点交给自动放置，跨 2 列 */
.b { grid-column: span 2; }
```

**什么时候用 `span` 更合适？** 当你只关心"这个元素要占多宽"，不关心它具体从第几列开始时，`span` 更省心。比如"每行第一个卡片都占两列宽"，与其挨个算线号，不如直接 `grid-column: span 2`。**`span` 和线号可以混用**（`1 / span 2`），方向一致即可。

### 4.2.4 负数线号：从末尾倒着数

`-1` 是"最后一条列线"，`-2` 是倒数第二条，以此类推。这个能力让你**不用知道网格一共几列**，就能表达"到最后"：

```css
/* 占满整行：从第一列到最后（无论网格几列都成立） */
.full { grid-column: 1 / -1; }

/* 只占最后一列：从倒数第二条线到最后一条线 */
.last { grid-column: -2 / -1; }
```

**为什么负数线号这么好用？** 因为真实项目里，网格列数经常变（响应式、加一列减一列）。写 `1 / -1`，你改了 `grid-template-columns` 之后"占满整行"这条规则**依然成立**；写死 `1 / 4`，加一列就穿帮了。

### 4.2.5 进阶：给线起名字

线号 `1, 2, 3` 是浏览器自动编的，但你也可以**给线起名字**，用起来更可读：

```css
.grid {
  display: grid;
  grid-template-columns: [start] 1fr [middle] 2fr [end];
}
.item { grid-column: start / middle; }  /* 比 1 / 2 好懂 */
```

**渲染效果**：`[start]`、`[middle]`、`[end]` 是给三条列线起的名字，之后可以用名字代替线号定位。线名可以起多个（`[first start]` 表示这条线同时叫 `first` 和 `start`）。不过**老实说，日常开发里命名线用得不多**——因为 `grid-template-areas`（4.5）提供了更好读的替代方案。这里提它是为了让你知道"线号背后是名字"，遇到别人写的 `[col]` 不至于懵。

### 4.2.6 显式放置 vs 自动放置

到这里你已经看到 Grid 的两套摆放方式，把它们分开记：

- **自动放置**：你不写 `grid-column`/`grid-row`，浏览器按 DOM 顺序、按 `grid-auto-flow`（默认"先横后竖"）一个格子一个格子塞。
- **显式放置**：你写了 `grid-column`/`grid-row`，就"钉死"了这个元素的位置，其余元素绕着它自动放置。

**实战心法**：大多数布局里，你**只需要显式放置少数几个"特殊元素"**（比如跨列的横幅、跨行的侧栏），其余交给自动放置。别每个元素都写坐标，那又回到"手动摆位"的老路了。

> 一句话记住它：**`grid-column`/`grid-row` 用"线号"定位元素——`起点 / 终点`；`span` 只数跨度不数终点；负数线号从末尾倒着数。只显式放置少数特殊元素，其余交给自动放置。**

---

## 4.3 显式轨道：`grid-template-columns` / `grid-template-rows`、`fr`、`repeat()`

**先给结论**：`grid-template-columns` 和 `grid-template-rows` 是 Grid 的"图纸"——你在这里声明"这张表有几列几行、每一列每一行多宽多高"。凡是写进 `grid-template-*` 里的轨道，都叫**显式轨道**（explicit track）。

```html
<div class="grid">
  <div class="item">A</div>
  <div class="item">B</div>
  <div class="item">C</div>
  <div class="item">D</div>
  <div class="item">E</div>
  <div class="item">F</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: 100px 200px 1fr;  /* 三列：100px 固定、200px 固定、剩余空间一份 */
  grid-template-rows: 60px 60px;           /* 两行：各 60px 高 */
  gap: 10px;
}
```

**渲染效果**：一张 3×2 的网格。前两列是"死"的（100px、200px），第三列是"活"的（`1fr`）——它会吃掉容器剩下的所有宽度。你把浏览器窗口拉宽拉窄，第三列跟着伸缩，前两列纹丝不动。

### 4.3.1 轨道尺寸可以写什么

`grid-template-columns` / `grid-template-rows` 的每一个值，就是一条轨道的尺寸，可以混搭：

| 写法 | 含义 | 例子 |
|---|---|---|
| `100px` | 固定长度 | `100px 200px` |
| `1fr` | 剩余空间的一份 | `1fr 1fr` |
| `auto` | 内容多宽就多宽 | `auto 1fr auto` |
| `50%` | 容器宽/高的百分比 | `50% 50%` |
| `minmax(200px, 1fr)` | 有上下限的弹性 | 见 4.4.3 |
| `repeat(3, 1fr)` | 重复一组轨道 | 见 4.3.3 |

### 4.3.2 `1fr` 的本质：一份"剩余空间"

`fr` 是 **fraction（份额）** 的缩写。它是 Grid 最核心的单位，也是最容易被误读成"平均分"的单位。

**`1fr` 不是"容器宽度的 1/3"，是"剩余空间的一份"。**

这两句话的区别，就是 Grid 里一半的坑的来源。看这个：

```css
grid-template-columns: 200px 1fr 1fr;
```

**不要**把它读成"三列，各占 1/3"。**正确读法**是：

1. 先把固定轨道扣掉：200px 被第一列拿走。
2. 剩下的空间，分给两个 `1fr` 轨道，各拿一半。

所以真实宽度是：第一列 200px，第二列和第三列各 `(容器宽 - 200px) / 2`。

`fr` 的这种"先满足固定尺寸、再分剩余"的顺序，是它区别于百分比的关键。**百分比是相对容器整体算的，`fr` 是相对"扣完固定轨道之后"的剩余算的。** 下一节 4.4 会把这个差别放大成一道必考题。

### 4.3.3 `repeat()`：别把"重复"手写十遍

三列等宽，你可以写 `1fr 1fr 1fr`，但十二列呢？`repeat()` 就是干这个的：

```css
/* 三列等宽 */
grid-template-columns: repeat(3, 1fr);

/* 十二列等宽（栅格系统常用） */
grid-template-columns: repeat(12, 1fr);

/* 一组轨道重复多遍：1fr 2fr 1fr 2fr */
grid-template-columns: repeat(2, 1fr 2fr);

/* 固定 + 弹性混搭：两侧 80px，中间 8 列各 1fr */
grid-template-columns: 80px repeat(8, 1fr) 80px;
```

**渲染效果**：`repeat(3, 1fr)` 就是 `1fr 1fr 1fr`；`repeat(2, 1fr 2fr)` 展开成 `1fr 2fr 1fr 2fr`。语法规则是 `repeat(次数, 一组轨道)`，第二参数可以是一串轨道，整组按次数重复。

`repeat()` 还有一个高级形态 `repeat(auto-fit, ...)` 和 `repeat(auto-fill, ...)`，是"无需媒体查询的响应式"的关键配方，**下一章 5.2 专门讲**，这里先留个印象。

### 4.3.4 行轨道怎么设？

列的写法同理，只是换成 `grid-template-rows`：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 80px 1fr auto;  /* 第一行固定 80px，第二行吃剩余，第三行内容多高就多高 */
  height: 400px;                      /* 行轨道要"有剩余可分"，容器得有确定高度 */
}
```

**渲染效果**：第一行永远是 80px；第三行是 `auto`（内容撑多高就多高）；第二行吃剩下的高度。这个 `80px 1fr auto` 是"页头 / 主体 / 页脚"三段式页面的经典配方——页脚紧跟内容，主体填满中间。

**一个容易懵的点**：为什么列里的 `1fr` 一写就生效，行里的 `1fr` 却常常"没反应"？因为**列的剩余空间来自容器的宽度**（块级容器宽度默认是确定的），而**行的剩余空间来自容器的高度**（块级容器高度默认是 `auto`，由内容决定，没有"剩余"可分）。所以行轨道要用 `1fr`，通常得先给容器设一个确定的高度（`height: 400px` 或 `min-height: 100vh`）。

### 4.3.5 进阶：`grid-template` 简写

`grid-template-columns` + `grid-template-rows` + `grid-template-areas` 可以合并成一条 `grid-template`：

```css
/* 拆开写（三句） */
.page {
  grid-template-columns: 200px 1fr;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header header"
    "side   main"
    "footer footer";
}

/* 合并写（一句）：areas 每行后面直接跟行高，末尾 / 跟列宽 */
.page {
  grid-template:
    "header header" 60px
    "side   main"   1fr
    "footer footer" 60px
    / 200px 1fr;
}
```

**渲染效果**：两句完全等价。简写版里，`grid-template-areas` 的**每一行字符串后面跟着这一行的高度**，最后用 `/` 分隔，写列宽。**读起来顺**："header 那行 60px 高，side/main 那行吃剩余，footer 那行 60px，两列分别是 200px 和 1fr"。

**但我要诚实地说**：`grid-template` 简写虽然省行数，**可读性不如分开写**，而且初学时容易把"行高写在字符串后"和"列宽写在 `/` 后"搞反。我的建议是：**先用分开的三句写熟，等对 Grid 足够顺手了，再决定要不要换简写**——这属于"锦上添花"，不是必学。

### 4.3.6 实际应用：用 Grid 做 12 栅格系统

老一辈前端对 Bootstrap 的 12 栅格（`.col-6`、`.col-4`）再熟不过——那些其实都是 `float` 或 Flex 硬算出来的。用 Grid，栅格系统**一行就写完了**：

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}

/* 占 6 列（一半宽） */
.col-6 { grid-column: span 6; }
/* 占 4 列（三分之一） */
.col-4 { grid-column: span 4; }
/* 占 8 列（三分之二） */
.col-8 { grid-column: span 8; }
```

```html
<div class="grid-12">
  <div class="col-8">主内容（占 8 列）</div>
  <div class="col-4">侧栏（占 4 列）</div>
  <div class="col-6">A（占 6 列）</div>
  <div class="col-6">B（占 6 列）</div>
</div>
```

**渲染效果**：第一行是"8 列 + 4 列"，第二行是"6 列 + 6 列"，所有列严格对齐。对比 Bootstrap 时代的实现——`float` 加 `margin` 减间距、或者 Flex 加 `flex-basis` 百分比——Grid 的 `repeat(12, 1fr)` + `span` **简洁且没有百分比算间距的老毛病**（还记得 4.4.1 的 `33.33%` 溢出吗，栅格系统里同样的坑，Grid 用 `fr` 直接绕过了）。

**为什么 `span` 在这里是神队友？** 因为栅格系统里，"占 6 列"是**语义**（我要一半宽），而不是"从第 3 条线到第 9 条线"这种坐标。`span 6` 把这个语义直接说出来了。

> 一句话记住它：**`grid-template-*` 是图纸，`fr` 是"扣完固定轨道后的剩余空间份额"（不是平均分），`repeat(n, 轨道组)` 是省手写的糖。写轨道时，先问"这一列是死的还是活的"——死的用 px，活的用 `fr`。12 栅格 = `repeat(12, 1fr)` + `grid-column: span N`。**

---

## 4.4 `fr` vs 百分比 vs `auto`，以及 `minmax()` 的妙用

**先给结论**：`fr`、`%`、`auto` 都能让轨道"有弹性"，但它们算弹性时参照的**基数**完全不同。搞混这三个，就是"明明写的是等宽，怎么溢出了/怎么没对齐"的根源。

### 4.4.1 `1fr` 为什么优于 `33.33%`：gap 参与计算的问题

最经典的一道题：**三列等宽，中间有间距，怎么写？**

新手的第一反应（Float 时代留下的肌肉记忆）：

```css
/* ❌ 用百分比硬凑 */
.grid {
  display: grid;
  grid-template-columns: 33.33% 33.33% 33.33%;
  gap: 20px;
}
```

**现象**：第三列被挤到下一行，整个网格**横向溢出**了。为什么？

因为 `33.33%` 是**相对容器宽度**算的。假设容器 600px：

- 三列各 `600 × 33.33% ≈ 200px`，加起来 `600px`；
- 但 `gap: 20px` 是**额外加**在列与列之间的，两个 gap 又是 `40px`；
- 总宽度 `600 + 40 = 640px > 600px`，放不下，第三列换行溢出。

**百分比是"先按容器整体算死，gap 再往上叠"，于是永远多出一截。**

正确写法：

```css
/* ✅ 用 fr：gap 先从剩余空间里扣掉，再均分 */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}
```

**渲染效果**：三列真正等宽，且贴住容器两边，没有任何溢出。原因就是 4.3 讲的顺序——浏览器先把 `gap`（40px）从 600px 里扣掉，剩下 560px，再均分给三个 `1fr`，每列 `≈ 186.67px`。**gap 被 `fr` 自动"纳入计算"了，你不需要像 Float 时代那样手动减间距。**

> 一句话记住它：**百分比是"对容器整体算"，gap 会额外溢出；`fr` 是"对扣掉 gap 之后的剩余空间算"，所以天然兼容 gap。多列等宽，永远写 `repeat(n, 1fr)`，别写 `n%`。**

### 4.4.2 `auto`：内容多大，轨道多大

`auto` 和 `fr` 都是"弹性"的，但弹性方向相反：

- `auto`：**内容优先**。轨道宽度 = 内容需要的宽度（最多撑到 `max-content`，最少缩到 `min-content`）。
- `1fr`：**剩余空间优先**。轨道宽度 = 剩余空间的一份，和内容无关。

看这个三列布局的经典配方：

```html
<div class="bar">
  <span class="left">左边</span>
  <span class="mid">中间标题会很长很长很长很长很长</span>
  <span class="right">右</span>
</div>
```

```css
.bar {
  display: grid;
  grid-template-columns: auto 1fr auto;  /* 两边按内容，中间吃剩余 */
  gap: 8px;
}
```

**渲染效果**：左边和右边只占自己文字的宽度，中间那列吃掉所有剩余空间，文字过长时它自己换行（因为轨道宽度被"剩余空间"约束住了）。这就是"左标题、右按钮、中间自适应"的导航栏骨架，一行搞定。

如果反过来写成 `1fr auto 1fr`，中间会按内容撑开，两边均分剩余——语义完全不同。**`auto` 的位置，决定了"谁跟着内容走，谁跟着容器走"。**

这里顺带补两个术语，后面会用到：

- **`min-content`**：内容能缩到的最小宽度（英文里是"最长单词的宽度"）。
- **`max-content`**：内容完全展开、不换行时的最大宽度。

`auto` 轨道的行为，本质就是"宽度在 `min-content` 到 `max-content` 之间，视剩余空间而定"。

为了让你对 `min-content` / `max-content` 有体感，看这个可复现的对比：

```html
<div class="demo">
  <div class="box min">The quick brown fox</div>
  <div class="box max">The quick brown fox</div>
</div>
```

```css
.demo { display: grid; grid-template-columns: min-content max-content; gap: 20px; }
.min { background: #fdecec; }
.max { background: #e8f7ee; }
```

**渲染效果**：

- 第一格 `min-content`：窄到"最长单词 `quick`"那么宽，后面的词全部换行——这就是这块内容**能收缩的最小宽度**。
- 第二格 `max-content`：宽到"整句话一行放得下"那么宽，完全不换行——这就是内容**完全展开的最大宽度**。

**为什么理解这两个概念重要？** 因为 Grid 里所有"内容驱动的尺寸"（`auto`、`1fr` 的最小宽度、`minmax` 里的参数）最终都落在这两个极端之间。搞懂了它俩，你就明白为什么"长单词会撑破 `1fr` 列"（因为 `1fr` 的最小宽度默认是 `min-content`，长单词的 `min-content` 很宽）。

### 4.4.3 `minmax(min, max)`：给弹性套一个"上下限"

`fr` 很灵活，但有时灵活过头了。比如你想让列"至少 200px 宽，最多不要超过一份剩余空间"，或者"最多 300px，再宽就浪费"。`minmax()` 就是给轨道设**下限和上限**的：

```css
/* 列宽在 200px 到 1fr 之间：永远不小于 200px，有空间就均分 */
grid-template-columns: repeat(3, minmax(200px, 1fr));

/* 列宽在 1fr 到 300px 之间：能均分就均分，但封顶 300px */
grid-template-columns: repeat(3, minmax(1fr, 300px));

/* 行高下限 100px，上限 auto（内容高就撑高） */
grid-template-rows: minmax(100px, auto);
```

`minmax(min, max)` 的规则很简单：**轨道尺寸会尽量靠近 `max`，但绝不小于 `min`、绝不超过 `max`。** 它的两个参数各可以填一个长度、`fr`、`auto`、`min-content`、`max-content`。

其中有一个组合你**下一章会反复遇到**，这里先埋个伏笔：

```css
/* ❌ 常见问题写法 */
grid-template-columns: repeat(3, 1fr);

/* ✅ 加了 minmax(0, ...) 后不会溢出 */
grid-template-columns: repeat(3, minmax(0, 1fr));
```

为什么 `1fr` 前面要套个 `minmax(0, ...)`？因为**轨道的最小宽度默认是 `auto`（内容宽度）**，遇到一张超宽的图片或一个不换行的长单词，`1fr` 也会被内容"撑破"。`minmax(0, 1fr)` 把下限强制压到 0，内容就能正常收缩换行。**这个坑和 Flex 里的 `min-width: 0` 是同一个原理**，5.5 节会完整复现，现在先记住有这么个东西。

### 4.4.4 一个隐藏坑：`fr` 和 `auto` 混用时，`fr` 不是你想的"均分"

看这个容易踩的写法：

```css
/* 你以为是"三列各占剩余空间的三分之一"？ */
grid-template-columns: 1fr auto 1fr;
```

**实际结果**：中间的 `auto` 会**先按内容撑开**（可能很宽），剩下的空间才由两个 `1fr` 均分。如果中间内容特别长，它甚至可能把两边压得很窄，或者把网格撑破。

**正确的"中间自适应、两边均分"应该是**：

```css
/* ✅ 两边固定或均分，中间吃剩余 */
grid-template-columns: 1fr minmax(0, 2fr) 1fr;  /* 或者 auto 1fr auto */
```

关键教训：**`fr` 和 `auto` 混搭时，要清楚"谁先算、谁后算"——固定值和 `auto` 先拿走它们要的，`fr` 分剩下的。** 别默认 `1fr` 一定"均分"，它均分的只是"扣完之后"的剩余。

> 一句话记住它：**`auto` 跟着内容走，`fr` 跟着剩余空间走，`minmax(min, max)` 给弹性套上下限。遇到"等宽但溢出"，先怀疑是不是没写 `minmax(0, 1fr)`；混用 `fr`/`auto` 时，记住"固定和 auto 先拿，fr 分剩下的"。**

---

## 4.5 `grid-template-areas`：用 ASCII 画布局（Grid 最优雅的能力）

**先给结论**：`grid-template-areas` 让你**用文字直接把布局"画"出来**。它是 Grid 最优雅、最应该先学的一个能力，因为它把"声明式布局"体现到了极致——你写的不是一堆坐标，而是一张肉眼就能看懂的地图。

先看成品，再解释。这是一个经典页面骨架：

```html
<div class="page">
  <header class="hd">header</header>
  <nav class="nav">nav</nav>
  <main class="main">main</main>
  <aside class="aside">aside</aside>
  <footer class="ft">footer</footer>
</div>
```

```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr 160px;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  gap: 10px;
  height: 420px;
}

.hd    { grid-area: header; }
.nav   { grid-area: nav; }
.main  { grid-area: main; }
.aside { grid-area: aside; }
.ft    { grid-area: footer; }
```

**渲染效果**：第一行是横跨三列的 header，第二行是 nav / main / aside 三列，第三行是横跨三列的 footer。整个页面骨架，**五行 CSS 画完**。

### 4.5.1 它是怎么工作的？

1. `grid-template-areas` 里的字符串，**一行对应网格的一行**，字符串里用空格分隔的单词对应这一行的每一列。
2. 每个单词是一个**区域名**（随便起，但得是合法的标识符）。
3. **同一个区域名重复出现**（比如 `header` 在一行里出现三次），就表示这个区域"横跨三列"——跨列跨行，靠的是"名字出现在多个格子里"。
4. 子元素通过 `grid-area: 区域名` **认领**一个区域。

**空位怎么办？** 用句点 `.` 占位：

```css
grid-template-areas:
  "header header header"
  "nav    main   aside"
  "footer footer .";        /* 右下角故意空一格 */
```

那最后一个格子就是空的，不放任何东西。

### 4.5.2 两个容易踩的语法规则

1. **每一行的"列数"必须相同**。下面这个就会失效（第一行 3 个词，第二行 2 个词）：

```css
   /* ❌ 列数不一致，areas 整个不生效 */
   grid-template-areas:
     "header header header"
     "nav    main";
```

2. **区域必须是矩形**。`header` 出现成 L 形（第一行三个、第二行第一个）是**不允许的**，网格区域只能是规整的矩形。

### 4.5.3 `grid-area` 的两种用法

`grid-area` 在 Grid 里有两个身份，别搞混：

- **命名身份**（配合 areas）：`grid-area: header`，给元素起个区域名，去认领 areas 里画好的区域。
- **线定位身份**：`grid-area: 行起 / 列起 / 行止 / 列止`，一条属性同时指定行列四条线，等价于 `grid-row` + `grid-column` 的合并写法：

```css
  /* 两条等价：从行线1到行线3，从列线2到列线4 */
  .x { grid-row: 1 / 3; grid-column: 2 / 4; }
  .x { grid-area: 1 / 2 / 3 / 4; }
```

  注意顺序是 `grid-area: <行起点> / <列起点> / <行终点> / <列终点>`，**先行后列，起点在前终点在后**。

### 4.5.4 完整示例：一个响应式仪表盘

areas 真正发光的地方是**响应式**。同一个 HTML，桌面端和移动端是两套完全不同的布局，而你只改 `grid-template-areas` 这一处：

```html
<div class="dash">
  <div class="stat-a">统计A</div>
  <div class="stat-b">统计B</div>
  <div class="chart">主图表</div>
  <div class="list">列表</div>
</div>
```

```css
.dash {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: 120px;
  grid-template-areas:
    "statA statB chart"
    "statA statB list";
  gap: 12px;
}
.stat-a { grid-area: statA; }
.stat-b { grid-area: statB; }
.chart  { grid-area: chart; }
.list   { grid-area: list; }

/* 移动端：全堆成单列 */
@media (max-width: 700px) {
  .dash {
    grid-template-columns: 1fr;
    grid-template-areas:
      "statA"
      "statB"
      "chart"
      "list";
  }
}
```

**渲染效果**：桌面端，两个统计卡竖着排在左边（跨两行），图表和列表在右边上下排列——这是一个左右分栏的仪表盘。缩到 700px 以下，四块自动变成单列竖排。**改布局 = 改那几行 ASCII 字符串，HTML 和元素的 `grid-area` 一字未动。**

### 4.5.5 为什么说它是"最优雅的能力"？

因为它把三件事合并成了一件：

- 不用 `grid-template-areas` 时，你要先设列宽（`grid-template-columns`）、设行高（`grid-template-rows`），再给每个元素写 `grid-column: 1 / 3; grid-row: 1` 这种"线坐标"——**布局和元素是分离的两套描述，改起来要两头同步改**。
- 用了 `grid-template-areas`，布局就"画"在一张图里，元素只写一句"我住 `header` 这个区"。**你想改布局？直接改那串 ASCII 图，改完一眼就知道新布局长什么样。**

这就是声明式布局的威力——**结构（HTML）不变，表现（CSS）随便换。**

### 4.5.6 `grid-template-areas` 和"线定位"，到底选哪个？

你已经有了两套摆元素的工具：`grid-template-areas`（画图认领）和 `grid-column`/`grid-row`（线坐标）。怎么选？给一个明确的建议：

| 场景 | 推荐 | 理由 |
|---|---|---|
| 页面整体骨架、明确的分区 | `grid-template-areas` | 布局一眼看懂，响应式只改字符串 |
| 少量元素跨列/跨行（横幅、卡片跨两列） | 线定位（`span`） | 只动一个元素，不用改全局图 |
| 动态内容、数量不定（相册、列表） | 都不写，靠自动放置 | 让浏览器顺序塞，最省心 |
| 需要精确到"第几条线"的复杂摆放 | 线定位 | areas 表达不了"从第 2 条线到第 5 条线"这种精细控制 |

**核心心法**：`grid-template-areas` 适合"**结构性布局**"（哪里是头、哪里是脚、哪里是侧栏），线定位适合"**局部微调**"（某个元素突出一下、跨一下）。两者可以共存——先用 areas 搭骨架，再用 `grid-column: span 2` 让某个区域里的卡片跨列，互不冲突。

> 一句话记住它：**`grid-template-areas` 用 ASCII 字符串画布局，同一名字重复出现 = 跨列跨行，句点 = 空位。区域必须矩形、各行列数一致。骨架用 areas 画图，局部微调用线定位，两者可共存。**

---

## 4.6 隐式轨道：`grid-auto-rows` / `grid-auto-columns` / `grid-auto-flow`

**先给结论**：写进 `grid-template-*` 的轨道是"显式"的，而**你没写、但内容又放不下时，浏览器自动补出来的轨道，是"隐式"的**。隐式轨道的尺寸和方向，用 `grid-auto-*` 来控制。

先看问题从哪来：

```html
<div class="grid">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>  <!-- 第 4 个，超出显式的 3 列 1 行 -->
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 只声明了 3 列，没声明行 */
  gap: 10px;
}
```

**渲染效果**：前三个元素在第一行，第 4 个自动落到第二行。**问题是：第二行这条轨道，你是没声明过它的高度的。** 它的高度是多少？

答案是 `auto`——**隐式行的默认高度是 `auto`**，也就是"内容多高就多高"。如果你 4 个 item 都设了 `height: 100px`，那第二行也是 100px，看起来没问题；但如果 item 高度不一，隐式行就会被最高的那个撑开，各行参差不齐。

### 4.6.1 `grid-auto-rows` / `grid-auto-columns`：给隐式轨道定尺寸

想让隐式行也有个统一高度，用 `grid-auto-rows`：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 120px;   /* 所有自动补出来的行，统一 120px 高 */
  gap: 10px;
}
```

**渲染效果**：现在不管你有 4 个还是 40 个 item，隐式生成的行全都是 120px。`grid-auto-rows: 120px` 常和 `grid-template-rows` 配合：`grid-template-rows: 200px; grid-auto-rows: 120px;` 意思是"第一行 200px（显式），后面的行都 120px（隐式）"。

同理，`grid-auto-columns` 管的是"自动补出来的列"。它平常很少单独出现，因为默认的隐式流动方向是"向下"（加行），只有当流动方向改成横向时才用得上——见下一小节。

### 4.6.2 `grid-auto-flow`：内容多了，往哪流、怎么流

`grid-auto-flow` 决定**自动放置的方向**，默认值是 `row`：

```css
/* 默认：一行放满，换下一行（横向优先） */
grid-auto-flow: row;

/* 改成一列放满，换下一列（纵向优先） */
grid-auto-flow: column;
```

`grid-auto-flow: column` 配合 `grid-auto-columns` 的例子：

```css
.grid {
  display: grid;
  grid-auto-flow: column;      /* 先往下排，排满一列再开新列 */
  grid-auto-columns: 100px;    /* 自动补出来的列，宽 100px */
  grid-template-rows: repeat(2, 60px);  /* 每列 2 行 */
  gap: 10px;
}
```

**渲染效果**：元素先在第一列从上往下排，排满 2 行后，开第二列继续排。这适合"横向滚动的卡片列表"——列数由内容决定，宽度固定，超出就横向滚动。

### 4.6.3 `dense` 的坑：让网格变"密"，却乱了序

`grid-auto-flow` 还能加一个关键字 `dense`（稠密）。默认是 `sparse`（稀疏）。

**`sparse`（默认）**：自动放置时**按 DOM 顺序**，找"下一个能放下的位置"，**不回头填前面留下的空洞**。
**`dense`**：自动放置时**允许回头**，把元素填进前面留下的空洞里。

什么时候会有空洞？**当某个元素显式跨列、把后面的位置"跳过"时。** 看这个可复现的例子：

```html
<div class="grid">
  <div class="item big">1（跨两列）</div>
  <div class="item skip">2（放第二列）</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.big  { grid-column: span 2; }   /* 1 号占满第一行 */
.skip { grid-column: 2; }        /* 2 号显式放到第二列，导致第二行第一列空出来 */
```

先看默认（sparse）的放置结果：

```text
┌─────────┬─────────┐
│    1    │    1    │   ← 1 号跨两列，占满第一行
├─────────┼─────────┤
│  (空)   │    2    │   ← 2 号显式在第二列，第一列空着
├─────────┼─────────┤
│    3    │    4    │   ← 3、4 号按顺序往下排，不回头填空洞
└─────────┴─────────┘
```

再看加 `grid-auto-flow: dense` 的结果：

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-flow: dense;        /* 允许回填 */
  gap: 10px;
}
```

```text
┌─────────┬─────────┐
│    1    │    1    │
├─────────┼─────────┤
│    3    │    2    │   ← 3 号被"回填"到第二行第一列的空洞！
├─────────┼─────────┤
│    4    │  (空)   │
└─────────┴─────────┘
```

**关键现象**：DOM 顺序是 `1 → 2 → 3 → 4`，但加了 `dense` 后，**视觉顺序变成了 `1 → 3 → 2 → 4`**——3 号被塞到了 2 号左边。

**这个乱序为什么是坑？** 因为**键盘导航、屏幕阅读器、`Tab` 键的焦点顺序，走的是 DOM 顺序，而不是视觉顺序**。用户看到 3 在 2 左边，按 `Tab` 却先从 2 跳到 3，视觉和操作完全对不上。对无障碍和可读性都是灾难。

**`dense` 不是不能用**，它适合"纯粹视觉、无交互、无顺序语义"的砖墙（masonry）式布局，比如纯图片墙。**只要里面有可聚焦、可点击、有阅读顺序的东西，就绝不要用 `dense`。**

### 4.6.4 为什么要分"显式"和"隐式"轨道？

你可能会问：为什么要费劲区分这两个词？直接让浏览器自动处理不就好了。

**因为这个区分决定了两个关键行为**：

1. **`fr` 只能出现在显式轨道里**。你没法写 `grid-auto-rows: 1fr`（隐式行没有"剩余空间"可分，因为容器高度是内容决定的）。这就是为什么隐式行常用固定值或 `auto`，而弹性高度只能写在 `grid-template-rows` 里。
2. **显式轨道是"骨架"，隐式轨道是"溢出缓冲"**。你声明 `grid-template-columns: repeat(3, 1fr)` 是定死"这张表就 3 列宽"；当内容多到 3 列放不下，浏览器**不会破坏你的骨架**，而是往下"追加"隐式行来兜底。骨架不变、缓冲自动长出来——这正是 Grid 比 Flex 更适合"内容数量不确定的相册/列表"的原因。

**一个实用的写法**，相册网格几乎都用它：

```css
.album {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 显式：3 列骨架 */
  grid-auto-rows: 200px;                  /* 隐式：每行 200px，内容多了自动往下加行 */
  gap: 16px;
}
```

**渲染效果**：3 列骨架永远不变，无论放 9 张还是 90 张图，都严格对齐成 3 列，行数自动增长，每行 200px 高。**你写的是"骨架 + 缓冲规则"，不是"每个元素的位置"。**

> 一句话记住它：**没写进 `grid-template-*` 的轨道是隐式轨道，尺寸用 `grid-auto-rows`/`grid-auto-columns` 定，流向用 `grid-auto-flow` 定。`fr` 只能用于显式轨道；显式是骨架，隐式是溢出缓冲。`dense` 会"回填空洞"导致视觉顺序 ≠ DOM 顺序，只在纯视觉场景用。**

---

## 4.7 对齐：`justify-items` / `align-items` / `place-items` 与轨道对齐

**先给结论**：Grid 里的对齐要分清楚**两个层面**——"元素在轨道内部的对齐"和"整组轨道在容器里的对齐"。两套属性名字只差一个词，作用对象完全不同，是 Grid 对齐最常混淆的点。

### 4.7.1 元素在格子里的对齐：`justify-items` / `align-items` / `place-items`

- `justify-items`：控制元素在**行内轴**（水平）方向的对齐。
- `align-items`：控制元素在**块轴**（垂直）方向的对齐。
- `place-items`：上面两个的缩写，`place-items: <align> <justify>`。

**先记住 Grid 里的轴**，它和直觉有一处反着的地方，务必看清：

| 轴 | 方向 | 对应属性 | 作用方向 |
|---|---|---|---|
| 行内轴（inline axis） | 水平（从左到右） | `justify-*` | 沿列的方向 |
| 块轴（block axis） | 垂直（从上到下） | `align-*` | 沿行的方向 |

**口诀：`justify` 管水平，`align` 管垂直。** 这个和 Flex 一致，别被 Grid 的"行/列"绕晕。

看代码：

```html
<div class="grid">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 120px;
  gap: 10px;
  justify-items: center;  /* 水平居中 */
  align-items: center;    /* 垂直居中 */
}
/* 上面两行等价于：place-items: center; */
```

**渲染效果**：每个 item 在自己的格子里，水平、垂直都居中。`place-items: center` 一行就能让所有子元素在自己的单元格里水平垂直居中——**这就是第 00 章里"一行搞定居中"的真相**。

各取值的含义：

| 值 | 效果 |
|---|---|
| `stretch`（默认） | 拉伸填满格子（前提是元素没写死宽/高） |
| `start` | 靠行内轴/块轴的起点（左/上） |
| `center` | 居中 |
| `end` | 靠行内轴/块轴的终点（右/下） |

**最容易踩的一个点**：默认是 `stretch`。所以很多时候你什么都没写，元素却"自动填满了格子"——那不是 margin 干的，是 `stretch`。一旦你给元素设了固定 `width`/`height`，`stretch` 就失效，元素退回到对齐位置的默认（start），这时候要居中就得显式写 `place-items: center`。

这个"stretch 悄悄失效"的现象，是可复现的经典坑。先看反例：

```html
<div class="grid">
  <div class="item box">我写了固定宽高</div>
  <div class="item">我没写宽高</div>
</div>
```

```css
/* ❌ 没写任何对齐，且元素写死了宽高 */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 120px;
  gap: 10px;
}
.box { width: 80px; height: 40px; }
```

**现象**：右边那个没写宽高的元素，被默认的 `stretch` 拉满了整个格子；左边那个写了 `80px × 40px` 的元素，**没有填满，而是缩在格子的左上角**。

**原因**：默认 `align-items`/`justify-items` 都是 `stretch`（拉伸）。元素一旦写死 `width`/`height`，`stretch` 就拉不动它，于是它退回**默认对齐 `start`**（左上角）。你看到"元素莫名跑到左上角"，不是 bug，是 `stretch` 失效后回到了 `start`。

修复：显式写对齐：

```css
/* ✅ 显式声明居中，元素写死宽高也会居中 */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 120px;
  gap: 10px;
  place-items: center;
}
.box { width: 80px; height: 40px; }
```

**记住这条规律**：`stretch` 只在"元素没写死尺寸"时生效；写死尺寸后，元素回到 `start`。要居中就**显式写 `place-items: center`**，别指望默认的 `stretch`。

### 4.7.2 单个元素的对齐：`justify-self` / `align-self`

容器级的 `justify-items` / `align-items` 是"一刀切"管所有元素。如果你只想让**某一个**元素特殊对待，用 `justify-self` / `align-self` 单独覆盖：

```css
.grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 120px; gap: 10px; }

/* 只有 2 号元素单独靠右、靠下 */
.item-special { justify-self: end; align-self: end; }
```

**渲染效果**：其它元素照常（默认 stretch 拉满），只有加了 `.item-special` 的那个元素缩到自己的内容大小、贴到格子的右下角。**`-self` 是"单个元素的 `-items`"**，作用范围和优先级都不同：`-self` 写在元素上，只影响自己；`-items` 写在容器上，影响所有子元素（会被 `-self` 覆盖）。

### 4.7.3 整组轨道在容器里的对齐：`justify-content` / `align-content` / `place-content`

当**所有轨道的总宽（或总高）小于容器**时，多出来的空白怎么分，就是 `-content` 系列管的事：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 100px);  /* 三列固定共 300px */
  justify-content: space-between;           /* 容器更宽时，三列均匀散开 */
  width: 600px;
}
```

**渲染效果**：三列各 100px，加起来 300px，但容器 600px。`justify-content: space-between` 让第一列贴左、第三列贴右、中间那列居中，多出的 300px 被"分"到两段间隙里。

`-content` 的取值和 Flex 的 `justify-content` 几乎一样：`start` / `center` / `end` / `space-between` / `space-around` / `space-evenly`。

### 4.7.4 两套属性一张表分清

| 属性 | 管的是 | 什么时候生效 |
|---|---|---|
| `justify-items` / `align-items` | 每个**格子里的元素** | 元素比格子小（没被 stretch 拉满） |
| `justify-self` / `align-self` | **单个**格子里的元素 | 同上，且只影响指定元素 |
| `justify-content` / `align-content` | **整组轨道**在容器里的位置 | 轨道总尺寸 < 容器尺寸 |
| `place-items` / `place-content` | 上面几组的缩写 | 同上 |

**一句话区分**：`-items` 是"元素在格子里的姿势"，`-content` 是"整张表在容器里的位置"，`-self` 是"单个元素自己说了算"。绝大多数居中需求用的是 `place-items`（元素居中），只有当你刻意让网格比容器小、想控制它整体靠哪边时，才用 `-content`。

> 一句话记住它：**`justify-*` 管水平、`align-*` 管垂直；`-items` 管"格子里的元素"，`-self` 管"单个元素"，`-content` 管"整组轨道"。默认 `stretch` 会悄悄把元素拉满，写死宽高后它就失效，居中记得显式写 `place-items: center`。**

---

## 4.8 本章常见坑速查

| 坑 | 现象 | 原因 | 正确做法 |
|---|---|---|---|
| 用 `33.33%` 做三列 | 第三列换行、横向溢出 | 百分比对容器整体算，gap 额外叠加 | `repeat(3, 1fr)`，fr 先扣 gap 再分 |
| 把 `1fr` 当成"平均分" | 固定列 + `1fr` 时算错宽度 | `1fr` 是"剩余空间"的份额，不是容器的份额 | 先扣固定轨道，再分剩余 |
| 隐式行高度塌陷/不齐 | 超出显式行的内容行高参差不齐 | 隐式行默认 `auto`，由内容撑 | `grid-auto-rows: 固定值` |
| `1fr` 列被长内容撑破 | 超宽图片/长单词把列撑出容器 | 轨道最小宽默认 `auto`（内容宽） | `minmax(0, 1fr)` |
| `grid-auto-flow: dense` 乱序 | 视觉顺序 ≠ DOM 顺序，Tab 焦点乱跳 | dense 回填空洞，打乱放置顺序 | 交互/可读内容别用 dense |
| `justify-content` 和 `justify-items` 混用 | 对齐没生效 | 一个管整组轨道，一个管格内元素 | 认清对象：`-items` 管元素，`-content` 管轨道 |
| 行轨道 `1fr` 不生效 | 行没按预期分剩余高度 | 容器高度是 auto，没有"剩余"可分 | 给容器设确定高度（`height`/`min-height`） |
| `grid-template-areas` 每行列数不一致 | 整个 areas 布局失效 | areas 要求各行词数相同、区域为矩形 | 补齐每行词数，用 `.` 占空位 |
| `fr` 和 `auto` 混用想当然 | 以为均分，实际被 auto 挤变形 | `fr` 分的是"扣完 auto/固定后"的剩余 | 明确谁先拿：固定和 auto 先，fr 分剩余 |

---

## 4.9 本章小结

- **Flex 管一维（一根轴），Grid 管二维（一张表）**；判断标准是"布局能不能画成行列对齐的表"；两者常配合——外层二维用 Grid，内层一维用 Flex。
- **Grid 用"线"定位**：N 列有 N+1 条列线，`grid-column: 1 / -1` 表示"从头到尾"；负数线号 = 从末尾数。
- **`grid-column` / `grid-row` 用"线号"定位**：`起点 / 终点`；`span` 只数跨度；只显式放置少数特殊元素，其余交给自动放置。
- **`grid-template-columns`/`rows` 是图纸**，写进去的是显式轨道；`grid-template` 是三者的简写（可选学）。
- **`1fr` 是"扣完固定轨道后的剩余空间份额"**，不是平均分；它天然兼容 gap，多列等宽请写 `repeat(n, 1fr)`。
- **`auto` 跟着内容走，`fr` 跟着剩余空间走**；`minmax(min, max)` 给弹性套上下限，`minmax(0, 1fr)` 防溢出。
- **`grid-template-areas` 用 ASCII 画布局**：同名重复 = 跨列跨行，句点 = 空位；改布局只改这张图，响应式只改这一处。
- **隐式轨道**用 `grid-auto-rows`/`columns` 定尺寸、`grid-auto-flow` 定流向；`dense` 会乱序。
- **对齐**：`justify` 管水平、`align` 管垂直，`-items` 管格内元素、`-self` 管单个元素、`-content` 管整组轨道，默认 `stretch`。

---

## 4.10 动手练习

1. **一张 3 列 2 行的网格，中间有 20px 间距，要求三列等宽且不溢出。** 写出两种 CSS：一种用百分比（故意让它溢出），一种用 `fr`（正确）。跑一遍，确认溢出现象和 `fr` 的修复。

   <details><summary>参考答案</summary>

```css
   /* ❌ 溢出 */
   .grid { display: grid; grid-template-columns: 33.33% 33.33% 33.33%; gap: 20px; }

   /* ✅ 正确 */
   .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
```
   </details>

2. **用 `grid-template-areas` 画一个"header / 侧栏 / 主区 / footer"的页面骨架**，然后加一条 `@media` 规则，让它在小于 600px 时变成单列堆叠。

   <details><summary>参考答案</summary>

```css
   .page {
     display: grid;
     grid-template-columns: 200px 1fr;
     grid-template-areas:
       "header header"
       "side   main"
       "footer footer";
   }
   .hd { grid-area: header; } .side { grid-area: side; }
   .main { grid-area: main; } .ft { grid-area: footer; }

   @media (max-width: 600px) {
     .page { grid-template-columns: 1fr; grid-template-areas: "header" "side" "main" "footer"; }
   }
```
   </details>

3. **解释 `grid-column: 1 / -1` 的含义**，并说明"负线号"为什么成立。

   <details><summary>参考答案</summary>

   表示"从第 1 条列线到第 -1 条列线"，即占满整行所有列。`-1` 是"最后一条列线"，负数线号从网格末尾倒着数，所以 `1 / -1` 等价于"从第一条到最后一条"。它成立是因为 Grid 用"线"而不是"单元格"定位，线号天然支持负索引。

   </details>

4. **写一个 2 列网格，让 1 号元素 `span 2`、2 号元素显式 `grid-column: 2`，再放 3、4 号**。分别用默认（sparse）和 `grid-auto-flow: dense` 跑一遍，观察 3 号的位置变化，并说出为什么 dense 是坑。

   <details><summary>参考答案</summary>

   见 4.6 节代码。默认下 3 号排到第三行第一列（不回头填第二行第一列的空洞）；dense 下 3 号被回填到第二行第一列，视觉顺序变成 `1 → 3 → 2 → 4`，和 DOM 顺序不一致，导致 Tab 焦点顺序与视觉顺序对不上。

   </details>

5. **说出 `place-items: center` 的完整展开写法**，以及它作用在"谁"身上；再说明它和 `place-content: center` 的区别。

   <details><summary>参考答案</summary>

   `place-items: center` 展开为 `align-items: center; justify-items: center;`（注意 `place-*` 的语法顺序是 `<align> <justify>`，先垂直后水平）。它作用在"每个格子内部的元素"上，让元素在各自的单元格里水平垂直居中。

   `place-content: center` 展开为 `align-content: center; justify-content: center;`，作用在"整组轨道"上，当轨道总尺寸小于容器时，让整张表在容器里居中。两者作用对象完全不同。

   </details>

6. **一个 3 列网格，中间列 `1fr` 里放了一张超宽图片，图片把整列撑破、横向溢出。** 写出修复方案，并解释原理。

   <details><summary>参考答案</summary>

   原因是 `1fr` 轨道的最小宽度默认是 `auto`（内容的最小宽度），超宽图片把轨道的最小宽度顶大，导致溢出。修复：把轨道写成 `minmax(0, 1fr)`，把下限压到 0，图片就能在轨道内正常收缩：

```css
   .grid { grid-template-columns: 200px minmax(0, 1fr) 200px; }
```
   </details>

7. **用 Grid 实现一个 12 栅格系统**：写出 `.col-3`（四分之一宽）、`.col-6`（二分之一宽）、`.col-9`（四分之三宽）三个类，并让它们能在一行里组合对齐。

   <details><summary>参考答案</summary>

```css
   .grid-12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
   .col-3 { grid-column: span 3; }
   .col-6 { grid-column: span 6; }
   .col-9 { grid-column: span 9; }
```

   因为 `repeat(12, 1fr)` 把剩余空间按 `fr` 均分成 12 份（gap 已被自动扣掉），`span N` 就精确地占了"12 分之 N"的宽度，且天然兼容 gap，不会像百分比那样溢出。

   </details>

---

> 📖 **本章的代码示例**：`examples/04-Grid核心.html`（可视化演示 `fr` 单位、`grid-template-areas`、隐式轨道、对齐）
> 🚀 **下一章**：第 05 章会把 Grid 用进真实场景——页面骨架、自适应相册、跨列跨行、`subgrid`，以及那些"写 Grid 必踩"的坑。
