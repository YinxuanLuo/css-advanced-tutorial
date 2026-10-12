# 第 02 章 · Flexbox 核心：一维布局的终局方案

> Flexbox 解决的是一类具体问题：**在一行（或一列）里，把一堆元素排列、对齐、分配空间。**
>
> 本章你需要记住的就一件事：**Flex 是一个"父容器指挥、子元素服从"的系统——方向、对齐、换行是父容器说了算，伸缩、排序、自我对齐是子元素说了算。** 而这一切都建立在一个心智模型上：**主轴和交叉轴**。

---

## 2.1 `display: flex` 到底改变了什么

先给结论：`display: flex` 只做一件事——**把"这个元素"变成一个 flex 容器（flex container），把它的"直接子元素"变成 flex 项目（flex item）。** 从此，这些直接子元素不再按"块级/行内"的老规矩排列，而是进入一套全新的、专为布局设计的规则体系。

看一个最直观的对比：

```html
<div class="box">
  <span>甲</span>
  <span>乙</span>
  <span>丙</span>
</div>
```

```css
/* 不加 flex：三个 span 是行内元素，挤在一行，宽高不生效 */
.box {
  border: 2px solid #2f6fed;
}
.box span {
  width: 80px;      /* 行内元素，width 无效 */
  height: 40px;     /* 行内元素，height 无效 */
  margin: 4px;
  background: #e8f1ff;
}
```

```css
/* 加上 flex：三个 span 变成 flex item，宽高立即生效，自动排成一行 */
.box {
  display: flex;
  border: 2px solid #2f6fed;
}
.box span {
  width: 80px;
  height: 40px;
  margin: 4px;
  background: #e8f1ff;
}
```

**效果**：第一段里，三个 `span` 是行内元素，`width`/`height` 通通被忽略，它们按文字流挤在一起，内容多宽就多宽。第二段里，只要父容器多了 `display: flex` 这一行，三个 `span` 立刻排成一行，`80px × 40px` 的宽高生效，间距也规规矩矩。

为什么会这样？因为 flex item 会经历一个叫 **blockification（块级化）** 的过程：无论你原来是 `span`（行内）、`img`、还是 `button`，一旦成为 flex item，它就按"块级盒子"来参与布局，宽高、margin 这些属性全部可用。

### 2.1.1 `flex` 和 `inline-flex` 的区别

`display: flex` 让容器本身表现得像个**块级元素**（独占一行、宽度撑满父容器）；而 `display: inline-flex` 让容器本身表现得像个**行内元素**（可以和其他行内元素挤在同一行）。

```html
<div class="outer">
  <span>我是一段普通文字</span>
  <div class="inner-inline-flex">
    <span>A</span><span>B</span>
  </div>
  <span>我也是普通文字</span>
</div>
```

```css
.outer { border: 2px solid #999; }
.inner-inline-flex {
  display: inline-flex;   /* 换成 flex 试试，观察它是否换行 */
  gap: 4px;
  background: #e8f1ff;
}
```

**效果**：`inline-flex` 的容器像"一个行内盒子"一样嵌在文字流里，前后的文字和它在同一行。若换成 `display: flex`，这个容器就变成块级，会独占一行，把前后的文字挤到上下两行去。

**记住**：这个区别只影响"容器自己怎么融入外部布局"，**不影响内部子元素的 flex 行为**。内部该怎么 flex 还怎么 flex。绝大多数布局场景用 `flex` 就够了，`inline-flex` 只在"想把一个 flex 布局塞进文字流"时才用。

### 2.1.2 一个容易忽略的事实：只有"直接子元素"是 flex item

这是新手最容易想岔的地方。看代码：

```html
<div class="container">
  <div class="item">我是 item</div>
  <div class="item">我是 item</div>
  <div class="wrapper">
    <div class="item">我是孙元素</div>
    <div class="item">我是孙元素</div>
  </div>
</div>
```

```css
.container { display: flex; }
.item { padding: 8px 16px; background: #e8f1ff; border: 1px solid #2f6fed; }
```

**效果**：`.container` 的三个直接子元素（两个 `.item` 和一个 `.wrapper`）会成为 flex item，横向排成一行。但 `.wrapper` 里的两个孙元素 **不受任何影响**——它们仍然按块级流垂直堆叠在 `.wrapper` 内部。

**换句话说，`display: flex` 只作用于"一层"。** 如果你想连孙元素一起排，那 `.wrapper` 自己也得上 `display: flex`。别指望"祖传"。

**两个相关的边界情况，也值得知道：**

1. **绝对定位的子元素不是 flex item**。如果 `.container` 里有个子元素设了 `position: absolute`，它会从 flex 布局里"抽离"出去（回到 00 章讲的"脱离文档流"），不再参与 flex 排列。`justify-content`、`align-items` 都不管它。
2. **纯文本会被包成匿名 flex item**。如果 `.container` 里直接写了一段裸文本（没包标签），浏览器会自动把它包成一个匿名的 flex item，和其他子元素一起排。所以"容器里既有 div 又有裸文字"时，文字也会占一个 flex item 的位置。

### 2.1.3 父容器 vs 子元素：职责怎么划分

这是 Flexbox 最重要的心智划分。**认清楚"哪些属性写在哪"，你就掌握了一半的 Flexbox。**

| 写在谁身上 | 属性 | 管什么 |
|---|---|---|
| **父容器** | `flex-direction` | 主轴方向（横着排还是竖着排） |
| **父容器** | `justify-content` | 主轴上的对齐 |
| **父容器** | `align-items` | 交叉轴上的对齐（给所有子元素统一设） |
| **父容器** | `align-content` | 多行时，行与行在交叉轴上的对齐 |
| **父容器** | `flex-wrap` | 是否换行 |
| **父容器** | `gap` | 子元素之间的间距 |
| **子元素** | `flex`（`grow`/`shrink`/`basis`） | 自己怎么伸缩、以什么为基准 |
| **子元素** | `align-self` | 自己单独覆盖父容器的 `align-items` |
| **子元素** | `order` | 自己的排列顺序 |

一句话概括这个划分：**父容器管"这群孩子之间的规矩"，子元素管"我自己的表现"。**

这个划分不是随意的，它对应第 00 章讲的"声明关系"哲学：你在父容器上写 `justify-content: space-between`，声明的是"这些孩子首尾贴边、中间均分"这个**关系**，而不是挨个告诉每个孩子"你在 X 像素"。父容器只描述关系，子元素只表达个体诉求，两边各司其职，最后浏览器来算。

### 2.1.4 flex 容器里，哪些老规矩失效了

一旦进入 flex 布局，有几个你之前背过的规则会"悄悄失效"，值得记一下，免得日后 debug 时懵：

- **子元素的 `float` 被无视**：flex item 上写 `float: left` 完全没效果。这很合理——`float` 是"文字环绕"工具（00 章讲过），Flex 里根本没有"浮动"这回事。
- **子元素的 `vertical-align` 失效**：这个属性只对行内元素/表格单元格有意义，flex item 不吃这套。
- **子元素的外边距不会"合并"（margin collapsing）**：相邻 flex item 的 `margin` 是老老实实累加的，不会像块级流里那样"取较大值"。
- **子元素的 `display` 被覆盖**：即使你写 `display: block` 或 `display: inline`，成为 flex item 后都会被块级化，真正生效的是 flex item 的布局规则。

> 一句话记住它：**`display: flex` 把父容器变成 flex container、把直接子元素变成 flex item，只影响一层；方向/对齐/换行写在父容器上，伸缩/排序写在子元素上。**

---

## 2.2 主轴与交叉轴：Flex 最重要的心智模型

先给结论：**Flexbox 里几乎所有"对齐、分配"的概念，都建立在两根轴之上——主轴（main axis）和交叉轴（cross axis）。** 你没搞清这两根轴，后面 `justify-content` 和 `align-items` 你就永远分不清哪个管哪个。

好消息是：这两根轴**不是固定的**，它们由 `flex-direction` 决定，而且**永远互相垂直**。

### 2.2.1 先看一张图：默认 `row` 下的两根轴

```text
             ┌─────────────────────────────┐
 cross start │  A      B      C            │
      │      │  ▲                         │
      │      │  │  主轴 (main axis) ────────►
      │      │  │  A、B、C 沿主轴排列        │
      ▼      │                             │
             │  交叉轴 (cross axis) ▼       │
 cross end   └─────────────────────────────┘
```

在默认的 `flex-direction: row` 下：

- **主轴**是水平的，从 **main start（左）** 指向 **main end（右）**。子元素 A、B、C 沿这条轴排。
- **交叉轴**是垂直的，从 **cross start（上）** 指向 **cross end（下）**。

`justify-content` 管的是"沿主轴的分布"（A、B、C 怎么在横向上摆），`align-items` 管的是"沿交叉轴的对齐"（它们怎么在纵向上摆）。

### 2.2.2 `flex-direction` 的四个值：轴是怎么旋转的

| 值 | 主轴方向 | 交叉轴方向 | 效果 |
|---|---|---|---|
| `row`（**默认**） | 水平，左 → 右 | 垂直，上 → 下 | 子元素横着排，从左往右 |
| `row-reverse` | 水平，右 → 左 | 垂直，上 → 下 | 子元素横着排，但从右往左 |
| `column` | 垂直，上 → 下 | 水平，左 → 右 | 子元素竖着排，从上往下 |
| `column-reverse` | 垂直，下 → 上 | 水平，左 → 右 | 子元素竖着排，但从下往上 |

看代码，四种方向长什么样：

```html
<div class="demo">
  <div class="row"><span>1</span><span>2</span><span>3</span></div>
  <div class="row-reverse"><span>1</span><span>2</span><span>3</span></div>
  <div class="column"><span>1</span><span>2</span><span>3</span></div>
  <div class="column-reverse"><span>1</span><span>2</span><span>3</span></div>
</div>
```

```css
.demo div { display: flex; gap: 8px; margin-bottom: 12px; }
.demo span {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: #2f6fed; color: #fff; border-radius: 6px;
}
.row            { flex-direction: row; }
.row-reverse    { flex-direction: row-reverse; }
.column         { flex-direction: column; }
.column-reverse { flex-direction: column-reverse; }
```

**效果**：四组数字 `1 2 3` 分别按"左到右、右到左、上到下、下到上"排列。注意 `column` 时，数字 1 在最上面；`column-reverse` 时，数字 1 被排到了最下面——**"reverse" 反转的是主轴的方向，不是简单地"倒序输出内容"**。

换成 `column` 后，轴也跟着转，交叉轴变成水平方向：

```text
        cross start
             │
             ▼
   ┌─────────────────┐
   │  主轴(↓)  A      │ ← A 在最上
   │   ▼       B      │
   │           C      │ ← C 在最下
   └─────────────────┘
```

此时 `justify-content` 管的是**垂直方向**（主轴竖起来了），`align-items` 管的是**水平方向**（交叉轴横过来了）。很多"换了 column 之后 `align-items: center` 怎么变成水平居中了"的疑问，答案都在这张图里。

### 2.2.3 一个隐蔽的细节：主轴方向受 `direction` 和 `writing-mode` 影响

"主轴默认从左到右"这句话，其实省略了一个前提：**当书写方向是 LTR（从左到右）时**。CSS 是国际化优先的语言，`flex-direction: row` 的主轴方向，实际由**书写方向**决定：

- 默认 `direction: ltr`（英文、中文）时，`row` 的主轴从左到右。
- 若设 `direction: rtl`（阿拉伯语、希伯来语），`row` 的主轴会**自动变成从右到左**。

```css
.box {
  display: flex;
  direction: rtl;   /* 主轴自动从右到左 */
}
```

**效果**：三个子元素从右往左排列，1 在最右边。这不是 bug，而是 CSS"声明意图、让浏览器按真实环境算"（00 章哲学一）的又一体现——**你声明的是"按书写方向排列"，而不是"从左到右"**。

`writing-mode` 同理会影响 `column` 主轴的走向。这些细节你日常可能用不到，但遇到"为什么我的 flex 在阿拉伯语页面里反了"时，别怀疑人生，是 `direction` 在起作用。

### 2.2.4 为什么非要用"轴"来思考

你可能想问：直接说"横着排、竖着排"不就行了，为什么要引入"主轴/交叉轴"这么抽象的词？

因为**只有"轴"这个抽象，能让你在四个 `flex-direction` 值之间自由切换而不乱套。** 看下面这两个需求：

1. "让子元素在水平方向居中" → 你写 `justify-content: center`。
2. "让子元素在垂直方向居中" → 你写 `align-items: center`。

但请注意：上面两句话成立的前提是**主轴是水平的（`row`）**。一旦你把 `flex-direction` 改成 `column`，事情就反过来了：

- `justify-content: center` 现在管的是**垂直**方向（因为主轴竖起来了）；
- `align-items: center` 现在管的是**水平**方向（因为交叉轴横过来了）。

如果你不用"轴"来记，而是死记"`justify-content` 是水平、`align-items` 是垂直"，那你换一个 `flex-direction` 就会全盘出错。**记住轴，你才不会记错方向。**

### 2.2.5 记住轴的两条铁律

1. **`justify-content` 永远管主轴，`align-items` 永远管交叉轴。** 这个对应关系不随 `flex-direction` 变化而变化。
2. **主轴方向由 `flex-direction` 决定，交叉轴永远垂直于主轴。** 主轴横着，交叉轴就竖着；主轴竖着，交叉轴就横着。

再加一条：**交叉轴的方向不受 `row-reverse` / `column-reverse` 影响**——`row` 和 `row-reverse` 的交叉轴都是"上到下"，`column` 和 `column-reverse` 的交叉轴都是"左到右"。`reverse` 只反转主轴，交叉轴不动。

> 一句话记住它：**主轴由 `flex-direction` 决定、交叉轴永远垂直主轴；`justify-content` 管主轴、`align-items` 管交叉轴，这个对应关系永不改变——记住"轴"而不是"横竖"，换方向时才不会乱。**

---

## 2.3 主轴对齐：`justify-content` 的 6 个值

先给结论：`justify-content` 决定 flex item 在**主轴**上的排列与剩余空间的分配。它有 6 个值，你可以分成两组记——**三个"贴边/居中"型**（`flex-start`、`flex-end`、`center`）和**三个"均匀分布"型**（`space-between`、`space-around`、`space-evenly`）。

下面每个值都配一段可运行代码。统一用同一段 HTML，只改 `justify-content` 那一行：

```html
<div class="row">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>
```

```css
.row {
  display: flex;
  justify-content: flex-start;   /* ← 逐个换成下面 6 个值 */
  width: 480px;
  border: 2px solid #999;
}
.item {
  width: 60px; height: 40px;
  background: #2f6fed; color: #fff;
  display: flex; align-items: center; justify-content: center;
}
```

### 2.3.1 `flex-start`：靠主轴起点（默认值）

```css
justify-content: flex-start;
```

**效果**：四个子元素紧挨着主轴起点（`row` 时就是最左边），剩余的右边空间空着。

```text
[1][2][3][4]____________________
```

这是默认行为——**你不写 `justify-content`，就是这个效果。**

### 2.3.2 `flex-end`：靠主轴终点

```css
justify-content: flex-end;
```

**效果**：四个子元素整体被推到主轴终点（最右边），左边空出来。注意是"整体靠右"，子元素之间的相对顺序不变（还是 1、2、3、4）。

```text
____________________[1][2][3][4]
```

### 2.3.3 `center`：居中

```css
justify-content: center;
```

**效果**：四个子元素作为一个整体，在主轴正中间，左右剩余空间相等。这是"水平居中"最常用的值。

```text
_________[1][2][3][4]__________
```

### 2.3.4 `space-between`：两端贴边，中间均分

```css
justify-content: space-between;
```

**效果**：第一个子元素贴主轴起点，最后一个贴主轴终点，剩下的空间**平均分给子元素之间**。

```text
[1]_____[2]_____[3]_____[4]
```

如果只有两个子元素，就是"一个最左、一个最右"——导航栏 logo 在左、菜单在右的经典写法（第 03 章会展开）。

### 2.3.5 `space-around`：每个子元素两侧都有相等间距

```css
justify-content: space-around;
```

**效果**：每个子元素左右都包着一层相等的间距。因为相邻两个子元素共享中间的间距，所以**"中间间距"是"两端间距"的两倍**。视觉上，两头显得比中间空一点。

```text
_[1]__[2]__[3]__[4]_
```

（两头的间距是中间间距的一半）

### 2.3.6 `space-evenly`：所有间距完全相等

```css
justify-content: space-evenly;
```

**效果**：子元素之间、子元素与容器边缘之间的**所有**间距都严格相等。这是最"公平"的分布。

```text
__[1]__[2]__[3]__[4]__
```

### 2.3.7 一张图记住三兄弟的区别

| 值 | 两端 | 中间 |
|---|---|---|
| `space-between` | 贴边（无间距） | 均分 |
| `space-around` | 半个间距 | 一个间距 |
| `space-evenly` | 一个间距 | 一个间距 |

新手最容易在 `space-around` 和 `space-evenly` 之间选错。记忆口诀：**`around` 是"每个元素四周都有一圈"，所以两头只有半圈；`evenly` 是"所有缝隙一视同仁"，两头也是满的。**

> 一句话记住它：**`justify-content` 管主轴，三组两两对应——`flex-start`/`flex-end`/`center` 是"定位型"，`space-between`/`space-around`/`space-evenly` 是"均分型"；要两头贴边用 `between`，要所有缝隙等宽用 `evenly`。**

---

## 2.4 交叉轴对齐：`align-items`、`align-self` 与 `align-content`

先给结论：交叉轴对齐有三个属性，写在不同的地方、管不同范围：

- **`align-items`**：写在父容器，管**单行**内所有子元素在交叉轴上的对齐。
- **`align-self`**：写在单个子元素，单独覆盖 `align-items` 给自己定的规则。
- **`align-content`**：写在父容器，管**多行**（`flex-wrap: wrap` 换行后）时，行与行在交叉轴上的分布。

新手最容易把 `align-items` 和 `align-content` 搞混，本节会讲清它们的边界。

### 2.4.1 `align-items` 的 4 个值

默认（`row`）情况下，交叉轴是垂直的，所以 `align-items` 管的其实就是"子元素在垂直方向上怎么摆"。

| 值 | 效果（主轴为 `row` 时） |
|---|---|
| `stretch`（**默认**） | 拉伸填满交叉轴（前提是子元素没设固定高度） |
| `flex-start` | 靠交叉轴起点（顶部） |
| `center` | 交叉轴居中（垂直居中） |
| `flex-end` | 靠交叉轴终点（底部） |

看代码（注意父容器设了固定高度，才能看出交叉轴对齐）：

```html
<div class="box">
  <div class="short">短</div>
  <div class="tall">高</div>
  <div class="short">短</div>
</div>
```

```css
.box {
  display: flex;
  align-items: stretch;   /* 依次换成下面 4 个值 */
  height: 120px;
  border: 2px solid #999;
  gap: 8px;
}
.box div {
  width: 80px;
  background: #2f6fed; color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.tall { height: 80px; }
```

**逐个值的渲染效果（`|` 代表容器的上下边界，`■` 代表子元素）：**

**`stretch`（默认）**——子元素被拉满，和容器等高：

```text
┌────────────┐
│  ■  ■  ■  │   ← 三个子元素都被拉伸到 120px 高
│  ■  ■  ■  │      （.tall 设了 80px，反而不被拉伸）
└────────────┘
```

- **`stretch`（默认）**：三个子元素都被拉伸到和容器一样高（120px）。`.tall` 因为显式设了 `height: 80px`，**不会被拉伸**——`stretch` 只拉伸"没有明确高度"的元素。这是默认值，也是"等高列"的天然实现。

**`flex-start`**——贴顶，下方留白：

```text
┌────────────┐
│  ■  ■  ■  │
│  ■        │
│           │   ← 下方留白
└────────────┘
```

- **`flex-start`**：三个子元素都贴顶部，高度各自为内容高度（`.tall` 是 80px，两个 `.short` 是内容高度），下方留白。

**`center`**——垂直居中：

```text
┌────────────┐
│           │
│  ■  ■  ■  │
│           │
└────────────┘
```

- **`center`**：三个子元素在垂直方向居中。这就是"垂直居中"最常用的写法——配合 `justify-content: center` 就是完整的水平垂直居中。

**`flex-end`**——贴底，上方留白：

```text
┌────────────┐
│           │   ← 上方留白
│  ■        │
│  ■  ■  ■  │
└────────────┘
```

- **`flex-end`**：三个子元素都贴底部，上方留白。

### 2.4.2 `stretch` 默认拉伸的细节

`stretch` 是默认值，而且它有个前提很多人不知道：**只有当子元素在交叉轴方向上的尺寸是 `auto` 时，`stretch` 才会把它拉满。** 也就是说：

- `row` 方向（交叉轴垂直）下，子元素**没设 `height`**（`height: auto`），才会被拉高；设了 `height: 80px` 就不会。
- `column` 方向（交叉轴水平）下，子元素**没设 `width`**，才会被拉宽。

这个默认值其实非常有用——**它就是"三列等高"最省事的实现**，不用任何 hack（回忆一下 `float` 时代做等高列有多痛苦）。

### 2.4.3 `align-self`：单个元素翻盘

`align-self` 的值和 `align-items` 完全一样（外加一个 `auto`，表示"听父容器的"），但它只作用于**单个子元素**。典型场景：一堆居中的卡片里，你想让某一张贴顶。

```html
<div class="box">
  <div class="item">A</div>
  <div class="item special">B</div>
  <div class="item">C</div>
</div>
```

```css
.box {
  display: flex;
  align-items: center;   /* 大家都垂直居中 */
  height: 120px;
  gap: 8px;
  border: 2px solid #999;
}
.item {
  width: 60px; height: 40px;
  background: #2f6fed; color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.special {
  align-self: flex-start;  /* 只有 B 贴顶 */
}
```

**效果**：A、C 垂直居中，B 贴顶。这就是 `align-self` 的价值——**父容器定基调，个别元素用 `align-self` 翻盘。**

### 2.4.4 补充：`baseline` 值

`align-items` 其实还有个第 5 个值 `baseline`：让子元素**按文字基线对齐**。它主要用于"字号不同的文字排一行"时，让文字底部对齐而不是盒子对齐。用得少，但遇到时别惊讶它不是 bug。

```css
.box { display: flex; align-items: baseline; }
.big { font-size: 32px; }
.small { font-size: 16px; }
```

**效果**：大号字和小号字的**文字底部（基线）对齐**，而不是盒子的顶或底对齐。这是排版上更专业的对齐方式。

### 2.4.5 `align-content`：换行后，管"行与行"的分布

`align-content` 只在**多行**（`flex-wrap: wrap` 且真的换行了）时才生效。单行时它完全不起作用。它管的是：**换行之后，这好几行作为一个整体，在交叉轴方向上怎么分布。**

它的值和 `justify-content` 的 6 个值几乎一一对应（`flex-start`/`flex-end`/`center`/`space-between`/`space-around`/`space-evenly`，外加 `stretch`）。

```html
<div class="box">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  <div class="item">4</div><div class="item">5</div><div class="item">6</div>
</div>
```

```css
.box {
  display: flex;
  flex-wrap: wrap;
  align-content: center;   /* 换成其他值观察 */
  width: 240px;
  height: 200px;           /* 高度固定，才能看出"行"怎么分布 */
  border: 2px solid #999;
}
.item { width: 80px; height: 40px; background: #2f6fed; color: #fff; margin: 4px; }
```

**效果**：容器宽 240px、item 宽 80px + 8px margin，一行放 2 个，6 个 item 共 3 行。`align-content: center` 让这 3 行整体在 200px 高度内垂直居中；换成 `space-between`，则第一行贴顶、最后一行贴底、中间一行居中。

**一句话区分三个属性**：

- `align-items`：**一行之内**，子元素在交叉轴上怎么对齐。
- `align-content`：**多行之间**，行与行在交叉轴上怎么分布。
- `align-self`：单个子元素覆盖 `align-items`。

> 一句话记住它：**`align-items` 写在父容器、管单行内所有子元素的交叉轴对齐（默认 `stretch` 拉满"没设尺寸"的子元素）；`align-self` 单个覆盖；`align-content` 只在换行后管"行与行"的分布。**

---

## 2.5 flex 三件套：`flex-grow` / `flex-shrink` / `flex-basis`

先给结论：Flexbox 最核心、也最常被误解的能力，是**让子元素在主轴方向上自动伸缩**。这个能力由三个属性协同完成，合称"flex 三件套"：

- **`flex-grow`**：有多余空间时，我怎么**分**这些空间（放大）。
- **`flex-shrink`**：空间不够时，我怎么**让**出空间（缩小）。
- **`flex-basis`**：分配空间之前，我的**初始基准尺寸**是多少。

它们三个共同回答一个问题：**"容器空间和子元素尺寸对不上时，差额怎么处理？"** 先按 `flex-basis` 给每个子元素一个初始尺寸，然后：多了，按 `flex-grow` 分掉；少了，按 `flex-shrink` 挤掉。

**理解这一步的先后顺序极其重要**——很多人以为 `flex-grow` 是"我占容器多大比例"，其实它是"基准定完后，多出来的那部分我分多少"。基准不同，结果天差地别（2.6 节详讲）。

### 2.5.1 `flex-basis`：一切计算的起点

`flex-basis` 是子元素在主轴方向上的**初始尺寸**，它是伸缩计算的基准。

```html
<div class="box">
  <div class="item a">A</div>
  <div class="item b">B</div>
  <div class="item c">C</div>
</div>
```

```css
.box { display: flex; width: 600px; border: 2px solid #999; }
.item { height: 60px; background: #2f6fed; color: #fff; }
.a { flex-basis: 100px; }
.b { flex-basis: 200px; }
.c { flex-basis: 100px; }
```

**效果**：A 100px、B 200px、C 100px，加起来 400px，容器 600px，**多出 200px 空着**（默认 `flex-grow: 0`，没人去分）。

`flex-basis` 的值可以是：
- **具体长度**：`200px`、`10rem`、`50%`（相对于父容器）。
- **`auto`**（默认）：看这个元素自己的 `width`（主轴水平时）或 `height`（主轴垂直时）；如果没设，就用**内容撑开的宽度**。
- **`content`**：直接按内容宽度（用得少，可忽略）。

**注意主轴方向**：`flex-basis` 永远作用于**主轴**。`row` 时它是"宽度"的基准，`column` 时它是"高度"的基准。这也是为什么"轴"的心智模型重要。

### 2.5.2 `flex-grow`：分剩余空间

`flex-grow` 的默认值是 **0**（不放大）。它决定"多余空间"怎么分配。

```css
.box { display: flex; width: 600px; }
.a { flex-basis: 100px; flex-grow: 1; }
.b { flex-basis: 100px; flex-grow: 1; }
.c { flex-basis: 100px; flex-grow: 2; }
```

**效果**：三个子元素基准都是 100px，共 300px，剩余 300px。剩余空间按 `1 : 1 : 2` 的比例分：A 得 75px、B 得 75px、C 得 150px。最终宽度：A=175px、B=175px、C=250px。

**计算公式**（理解了它，flex 就不玄了）：

```text
剩余空间 = 容器尺寸 - 所有子元素的 flex-basis 之和
子元素最终尺寸 = flex-basis + 剩余空间 × (自己的 grow / 所有 grow 之和)
```

代入上例：剩余 = 600 - 300 = 300；A 最终 = 100 + 300 × (1/4) = 175；C 最终 = 100 + 300 × (2/4) = 250。

**关键理解**：`flex-grow` 不是"我变成几倍大"，而是"**剩余空间**我按这个比例分"。基准是 100 还是 500，直接影响最终结果——这正是 2.6 节要讲的坑。

**再举一个"基准不同、结果不同"的例子**，体会基准的影响：

```css
.box { display: flex; width: 600px; }
.a { flex-basis: 100px; flex-grow: 1; }
.b { flex-basis: 300px; flex-grow: 1; }
.c { flex-basis: 200px; flex-grow: 1; }
```

**效果**：基准共 600px，剩余 0，grow 根本没机会发挥作用，三个元素就是 100/300/200——**grow 是 1 也白搭，因为没剩余空间可分**。这再次印证：grow 只分"多余出来的"，不是"按比例定宽度"。

### 2.5.3 `flex-shrink`：空间不足时的收缩

`flex-shrink` 的默认值是 **1**（会收缩）。它决定"空间不够"时谁缩、缩多少。

```css
.box { display: flex; width: 400px; }
.a { flex-basis: 200px; flex-shrink: 1; }
.b { flex-basis: 200px; flex-shrink: 1; }
.c { flex-basis: 200px; flex-shrink: 0; }
```

**效果**：三个子元素基准共 600px，容器只有 400px，**缺 200px**。C 的 `flex-shrink: 0` 表示"我不缩"，保持 200px；A、B 各承担一半缺口，各缩 100px，变成 100px。最终：A=100px、B=100px、C=200px。

**收缩的计算公式**（比 grow 复杂一点，因为它按"基准 × shrink 系数"加权）：

```text
缺口 = 所有 flex-basis 之和 - 容器尺寸
每个子元素收缩量 = 缺口 × (自己的 basis × 自己的 shrink / Σ(每个的 basis × 每个的 shrink))
```

代入上例：A 的收缩量 = 200 × (200×1 / (200×1 + 200×1 + 200×0)) = 200 × (200/400) = 100。A 最终 = 200 - 100 = 100。C 因为 shrink 为 0，收缩量为 0。

**注意这个加权**：`flex-shrink` 的收缩是按"basis × shrink"加权的，不是单纯按 shrink 比例。所以同样 `flex-shrink: 1`，基准大的元素收缩得**绝对值更多**（因为它基数大）。这也是很多"为什么这个元素缩得更多"疑问的答案。

### 2.5.4 为什么默认 `flex-shrink: 1` 而不是 0

这是本章最值得想清楚的一个"设计意图"问题。

**如果 `flex-shrink` 默认是 0**（不收缩），那么一旦子元素的内容/尺寸之和超过容器宽度，它们就会**直接溢出容器**，把布局撑破——而这是网页上最常见的情况：容器宽度你控制不了（手机 320px 到桌面 1920px），内容长度你也控制不了（一条评论可能 3 字可能 300 字）。

**Flexbox 的设计目标之一，就是"内容默认适应容器"。** 所以它把 `flex-shrink: 1` 设为默认——**默认允许收缩**，让内容在空间不足时优先"挤一挤"而不是"撑破"。

代价就是：收缩会导致内容被压缩、换行、甚至溢出（第 03 章讲 `min-width: 0` 时会展开）。**但这个默认值反映的设计意图很清晰：Flex 假定"整体不破"比"每个元素完整"更重要。**

对比 `flex-grow` 默认 0 的设计：如果 grow 默认也大于 0，那一排普通元素会莫名其妙地被拉大去填满整行，反而破坏了你想要的"内容自然宽度"。所以 **grow 默认关、shrink 默认开**，是经过权衡的：**空间多了，默认不抢；空间少了，默认让位。** 这符合直觉——"多出来的别乱动，不够的先挤挤"。

> 一句话记住它：**`flex-basis` 定基准、`flex-grow` 分多余空间（默认 0）、`flex-shrink` 承担缺口（默认 1）；默认"不抢多余、但让位不足"，是 Flex"内容适应容器"设计意图的体现。**

### 2.5.5 综合：三件套如何协同

把三件套放在一起看，能帮你建立完整的"伸缩心智"。下面这个例子里，容器宽度会在不同设备上变化，看三件套如何各司其职：

```html
<div class="box">
  <div class="item side">侧栏</div>
  <div class="item main">主内容</div>
  <div class="item side">侧栏</div>
</div>
```

```css
.box { display: flex; width: 100%; max-width: 900px; }
.side {
  flex: 0 0 200px;    /* grow 0，shrink 0，basis 200px：死活固定 200px */
  background: #e8f1ff;
}
.main {
  flex: 1 1 auto;     /* grow 1，shrink 1，basis auto：占剩余、可伸缩 */
  background: #2f6fed; color: #fff;
}
```

**效果**：两个 `.side` 固定 200px（`flex: 0 0 200px` 意味着"不放大、不缩小、基准 200px"，是"固定宽度"的最明确写法），中间的 `.main` 用 `flex: 1 1 auto` 吃掉所有剩余空间。容器变宽变窄，只有 `.main` 跟着伸缩，两侧纹丝不动。

**三件套的完整语义总结**：

| 值 | grow | shrink | basis | 语义 |
|---|---|---|---|---|
| `flex: 0 0 200px` | 不放大 | 不缩小 | 200px | **固定宽度**（最明确） |
| `flex: 1 1 auto` | 占剩余 | 可缩小 | 内容宽 | **弹性自适应**（最常用） |
| `flex: 0 1 auto` | 不放大 | 可缩小 | 内容宽 | 默认值：内容宽度，空间不足才缩 |

记住这三个"性格模板"，你就不用每次去抠 grow/shrink/basis 的细节，直接套用即可。

---

## 2.6 `flex: 1` 的真相：`1 1 0%` 还是 `1 1 auto`

先给结论：**`flex: 1` 是 `flex: 1 1 0%` 的缩写**，而 **`flex: auto` 是 `flex: 1 1 auto` 的缩写**。两者只差一个 `flex-basis`——但就是这一个 0% 和 auto 的差别，导致渲染结果天差地别。这是新手最常踩的坑，也是面试几乎必考的点。

### 2.6.1 `flex` 缩写到底对应什么

`flex` 是 `flex-grow flex-shrink flex-basis` 三个属性的简写。规范里定死了这几个常用的简写值：

| 简写 | 等价于 | 记忆 |
|---|---|---|
| `flex: 1` | `flex: 1 1 0%` | 一个数字 = grow，shrink 补 1，basis 补 0% |
| `flex: auto` | `flex: 1 1 auto` | |
| `flex: initial` | `flex: 0 1 auto` | **默认值**（不写 `flex` 就是这个） |
| `flex: none` | `flex: 0 0 auto` | 完全僵硬，不放大不缩小 |
| `flex: 2` | `flex: 2 1 0%` | 两个数字同理 |

**最关键的规则**：`flex` 只写**一个数字**时，它代表 `flex-grow`；此时 `flex-shrink` 默认补成 `1`，`flex-basis` 默认补成 **`0%`**（不是 auto！）。所以 `flex: 1` 一定是 `1 1 0%`，**绝不是** `1 1 auto`。

**为什么规范要这么设计？** 因为"只写一个数字"的诉求，绝大多数是"我想让这个元素按比例伸缩、严格均分"，而 `basis: 0%` 恰恰是"忽略内容、从头均分"的语义。把最常用的诉求设为最短的写法，是合理的 API 设计。

**`flex` 缩写支持三种写法**（一个值、两个值、三个值），规则如下：

| 写法 | 示例 | 含义 |
|---|---|---|
| 一个值（数字） | `flex: 2` | grow=2，shrink 补 1，basis 补 0% |
| 一个值（关键字） | `flex: auto` / `none` / `initial` | 直接套用预设 |
| 两个值 | `flex: 1 1` | grow=1，shrink=1，basis 补 0% |
| 两个值（第二个是长度） | `flex: 1 200px` | grow=1，shrink 补 1，basis=200px |
| 三个值 | `flex: 1 1 200px` | grow=1，shrink=1，basis=200px |

**记住两条规则**，就不会写错：

1. **缺省的 `flex-basis` 永远是 `0%`（除非写全三个值或写 `auto`）。**
2. **第二个值如果是"数字"，它是 `flex-shrink`；如果是"长度"，它是 `flex-basis`。** 所以 `flex: 1 200px` 是 `1 1 200px`，而 `flex: 1 1` 是 `1 1 0%`。

这个"缺省 basis 是 0%"的规则，是很多人写出 bug 的根源：他们以为 `flex: 1 1` 的 basis 是 auto，其实不是。**只要不显式写 `auto`，basis 就是 0%。**

### 2.6.2 两者渲染差异：一段代码看清楚

```html
<div class="demo">
  <h4>flex: 1 （basis 0%）</h4>
  <div class="box basis0">
    <div class="item">短</div>
    <div class="item">很长很长很长的内容</div>
    <div class="item">短</div>
  </div>

  <h4>flex: auto （basis auto）</h4>
  <div class="box basisauto">
    <div class="item">短</div>
    <div class="item">很长很长很长的内容</div>
    <div class="item">短</div>
  </div>
</div>
```

```css
.box { display: flex; width: 600px; border: 2px solid #999; margin-bottom: 16px; }
.item { height: 40px; background: #2f6fed; color: #fff; }

/* 基准是 0%，三等分 */
.basis0 .item { flex: 1; }

/* 基准是 auto，先占内容宽度再分剩余 */
.basisauto .item { flex: auto; }
```

**效果**：

- **`flex: 1`（`1 1 0%`）**：三个子元素基准都是 0，容器 600px 全是"剩余空间"，按 grow 比例（1:1:1）平分，**每个严格 200px**——不管内容长短，三个一样宽。
- **`flex: auto`（`1 1 auto`）**：三个子元素先按**内容宽度**占位（"短"占一点，"很长很长很长的内容"占一大块），然后剩余空间再按 1:1:1 分给它们。结果：**内容长的那个明显更宽**，三个宽度不相等。

### 2.6.3 为什么会有这个区别（设计意图）

`flex-basis: 0%` 的语义是：**"忽略内容自身的宽度，一切从头分。"** 它要的效果是"按比例严格均分"，内容多宽跟最终宽度**无关**。

`flex-basis: auto` 的语义是：**"先尊重内容自身的宽度，剩下的再按比例分。"** 它要的效果是"内容优先，其次才均分"。

哪个对？**取决于你的需求**：

- 你想要"**三等分、绝对等宽**"（比如三个并排的卡片、导航里的三个等宽按钮）→ 用 `flex: 1`。
- 你想要"**内容自适应，但能一起伸缩**"（比如一个工具栏，图标按钮按内容宽、搜索框占剩下的）→ 用 `flex: auto` 或 `flex: 1 1 auto`。

**新手翻车的典型场景**：写了 `flex: 1` 想三等分，结果发现三个元素宽度不一样，于是百思不得其解。原因几乎都是：**他把 `flex: 1` 写成了 `flex: auto`，或者以为自己写的是 `flex: auto` 的效果**。记住：**要严格等宽，用 `flex: 1`（`0%` 基准），别碰 `auto`。**

### 2.6.4 再看两个实战组合

**组合一：一个固定，一个吃满剩余**

```html
<div class="box">
  <div class="logo">LOGO</div>
  <div class="search">搜索框（吃满剩余空间）</div>
</div>
```

```css
.box { display: flex; width: 600px; border: 2px solid #999; }
.logo { width: 80px; height: 40px; background: #12a150; color: #fff; }
.search { flex: auto; height: 40px; background: #e8f1ff; }
```

**效果**：LOGO 固定 80px，搜索框用 `flex: auto` 吃满剩余的 520px。这里的 `flex-basis: auto` 会让搜索框先按内容宽度占位（内容为空，占 0），然后 grow 吃掉全部剩余空间，效果等同"占满"。

**组合二：真正的 1:2:1 黄金分割**

```css
.a { flex: 1; }   /* 1 1 0% */
.b { flex: 2; }   /* 2 1 0% */
.c { flex: 1; }   /* 1 1 0% */
```

**效果**：三个元素按 1:2:1 严格均分容器宽度。因为 basis 都是 0%，比例就是纯 grow 的比例。若换成 `flex: auto`，比例会被各自的内容宽度干扰，就不再是 1:2:1 了。

> 一句话记住它：**`flex: 1` = `1 1 0%`（忽略内容宽度，严格按比例均分），`flex: auto` = `1 1 auto`（先占内容宽度再分剩余）；要三等分就用 `flex: 1`，要内容自适应就用 `flex: auto`。**

---

## 2.7 `margin: auto` 在 flex 里的隐藏技能

先给结论：**在 flex 容器里，子元素的 `margin: auto` 有一个老布局里没有的特殊能力——它会"吸收"主轴和交叉轴上的剩余空间。** 这是一个"隐藏技能"，很多人不知道，但它比 `justify-content` 更早、更底层地参与空间分配，能实现一些 `justify-content` 做不到的精细布局。

### 2.7.1 `margin-left: auto`：把元素推到主轴另一端

这是**导航栏"logo 在左、菜单在右"的底层原理**。

```html
<nav class="navbar">
  <div class="logo">LOGO</div>
  <div class="menu">菜单</div>
</nav>
```

```css
.navbar {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 56px;
  background: #1a1d23;
  color: #fff;
}
.logo { font-weight: bold; }
.menu { margin-left: auto; }   /* ← 关键：把菜单推到最右 */
```

**效果**：`.menu` 的 `margin-left: auto` 把它左边的所有剩余空间都"吃掉"，于是菜单被顶到最右，logo 留在最左。**你不需要 `justify-content: space-between`，而且这个写法在"多于两个元素"时更灵活**（比如 logo + 两个菜单，可以让第一个菜单 `margin-left: auto`，第二第三正常排）。

### 2.7.2 为什么 `margin: auto` 能这么干

在块级布局里，`margin: auto` 只能用于"水平居中"（`margin-left: auto; margin-right: auto` 配合固定宽度）。但在 flex 里，**主轴方向上的 `auto` margin 会吸收剩余空间**，交叉轴方向上的 `auto` margin 也会吸收剩余空间——所以它既能水平居中、又能垂直居中。

**关键细节：`margin: auto` 的优先级高于 `justify-content`。** 当 flex item 有 `auto` margin 时，剩余空间会**先被 auto margin 吸收**，`justify-content` 就"没空间可分"了，看起来像失效了。

```css
.box {
  display: flex;
  justify-content: center;   /* 这个会被下面的 auto margin "架空" */
}
.item { margin-left: auto; }  /* auto margin 先吃掉左边所有空间 */
```

**效果**：子元素被 `margin-left: auto` 推到最右，`justify-content: center` 看起来没起作用。这不是 bug，是规范规定的优先级：**auto margin 先分，`justify-content` 后分。**

### 2.7.3 交叉轴的 `margin: auto`：另一种垂直居中

```html
<div class="box">
  <div class="item">我居中了</div>
</div>
```

```css
.box {
  display: flex;
  height: 200px;
  border: 2px solid #999;
}
.item {
  margin: auto;   /* 水平 + 垂直都自动 */
}
```

**效果**：`.item` 的 `margin: auto` 在主轴和交叉轴两个方向都吸收剩余空间，实现**完美的水平垂直居中**——甚至不用写 `justify-content: center` 和 `align-items: center`。

**什么时候用 `margin: auto`，什么时候用 `justify-content`？**

- 想"一个元素单独被推到一边/单独居中" → `margin: auto`（更精细、按元素控制）。
- 想"一组元素整体对齐/分布" → `justify-content`（更省事、按组控制）。

两者不冲突，`margin: auto` 是对"单个元素"的微调，`justify-content` 是对"整组元素"的宏观控制。

> 一句话记住它：**flex 里子元素的 `margin: auto` 会吸收主轴/交叉轴的剩余空间，优先级高于 `justify-content`；`margin-left: auto` 是"推到最右"的经典写法，`margin: auto` 是另一种完美居中。**

---

## 2.8 换行、间距、排序：`flex-wrap` / `gap` / `order`

先给结论：这三个属性补全了 Flexbox 的"工程可用性"——`flex-wrap` 解决"一行放不下怎么办"，`gap` 解决"元素之间间距怎么设才不互相打架"，`order` 解决"视觉顺序和 DOM 顺序不一致"。

### 2.8.1 `flex-wrap`：一行放不下就换行

`flex-wrap` 默认是 **`nowrap`（不换行）**——所有 flex item 死命挤在一行，哪怕溢出。这跟 2.5.4 讲的"默认允许收缩"是配套的：默认行为是"挤一挤"，而不是"换行"。

```css
.box { display: flex; flex-wrap: nowrap; }        /* 默认 */
.box { display: flex; flex-wrap: wrap; }
.box { display: flex; flex-wrap: wrap-reverse; }
```

| 值 | 效果 |
|---|---|
| `nowrap`（默认） | 所有子元素挤在一行，超出就收缩/溢出 |
| `wrap` | 放不下就换到下一行，按正常顺序 |
| `wrap-reverse` | 放不下就换行，但**行的顺序反转**（第一行在最下面） |

```html
<div class="box">
  <div class="item">1</div> <div class="item">2</div> <div class="item">3</div>
  <div class="item">4</div> <div class="item">5</div> <div class="item">6</div>
</div>
```

```css
.box { display: flex; flex-wrap: wrap; width: 300px; border: 2px solid #999; }
.item { width: 120px; height: 40px; background: #2f6fed; color: #fff; margin: 4px; }
```

**效果**：每个 item 120px + 8px margin = 128px，容器 300px 一行只能放 2 个。于是 1、2 在第一行，3、4 在第二行，5、6 在第三行。

**注意**：换行后，**每一行各自独立**——`justify-content` 只作用于**当前行内**的元素，不会跨行均分。这也是第 03 章要讲的 `space-between` 最后一行不满的坑的根源。

### 2.8.2 `gap`：给 flex item 之间设间距

`gap` 直接设 flex item **之间**的间距，不碰首尾（首尾不会有额外的 `gap`）。它解决了老方法的一个经典痛点：用 `margin` 设间距，会导致**每个元素都有 margin，首尾也多出一块，还得给最后一个元素 `margin-right: 0` 去补**。

```css
.box {
  display: flex;
  gap: 16px;              /* 行列间距都是 16px */
  /* 等价于： */
  /* row-gap: 16px; column-gap: 16px; */
}
```

```css
/* 只设列间距（水平方向），行间距为 0 */
.box { display: flex; flex-wrap: wrap; column-gap: 12px; row-gap: 24px; }
```

**效果**：`gap` 只出现在相邻元素**之间**。三个元素就有两个 16px 的缝隙；首尾和容器边缘之间**没有**额外的间距。这是 `gap` 和 `margin` 最本质的区别。

**为什么 `gap` 是更优解？** 用 `margin` 设间距时，你设的是"每个元素的 margin"，于是：

```css
/* ❌ 老方法：每个元素都有右 margin，最后一个要多一个补丁 */
.item { margin-right: 16px; }
.item:last-child { margin-right: 0; }
```

```css
/* ✅ 新方法：声明"元素之间的缝隙是 16px"，浏览器自己算 */
.box { display: flex; gap: 16px; }
```

`gap` 的语义是"**缝隙**"，它描述的是元素之间的**关系**，而不是某个元素的**属性**——这正是"声明关系"哲学（00 章）的体现。而且 `gap` 自动处理换行后的行列间距，`margin` 方案在换行时会彻底乱掉。

### 2.8.3 `order`：改变视觉顺序，但不改 DOM 顺序

`order` 默认是 **0**，值越小越靠前（可以是负数）。它只改**视觉上的排列顺序**，**不动 DOM 的真实顺序**。

```html
<div class="box">
  <div class="item" style="order: 3;">A（order 3）</div>
  <div class="item" style="order: 1;">B（order 1）</div>
  <div class="item" style="order: 2;">C（order 2）</div>
</div>
```

```css
.box { display: flex; gap: 8px; }
.item { padding: 8px 16px; background: #2f6fed; color: #fff; }
```

**效果**：视觉顺序是 B（1）、C（2）、A（3），但 DOM 里仍然是 A、B、C。

**这个坑要小心**：`order` 只改视觉，不改 DOM。这意味着：

- 屏幕阅读器（无障碍）仍然按 **DOM 顺序**读，不会跟着 `order` 走；
- 键盘 Tab 聚焦顺序也按 **DOM 顺序**走。

所以 `order` 只适合"视觉重排"（比如响应式下把侧边栏挪到内容上方），**不要用 `order` 去改变"语义上重要"的元素的顺序**——那会骗过屏幕阅读器和键盘用户。这是"分离关注点"（00 章哲学三）在实践中的体现：视觉归视觉，结构归结构，别为了好看打乱结构。

> 一句话记住它：**`flex-wrap` 默认不换行（挤不下就收缩），`gap` 只在元素之间设间距（不碰首尾、换行也自动），`order` 只改视觉顺序不改 DOM 顺序——别用它打乱语义。**

---

## 2.9 一个需要牢记的边界：Flex 是"一维"的

先给结论：**Flexbox 名字里的"Flex"是 flexible（弹性），但它的本质是"一维布局"——同一时刻，它只精确控制"一根轴"（主轴）上的排列，交叉轴只是辅助对齐。** 这个边界决定了它什么时候好用、什么时候吃力。

### 2.9.1 什么叫"一维"

在 `flex-direction: row` 下，主轴是水平的。Flex 能精确控制的是：**这一行里，元素怎么排、怎么分宽度、怎么对齐。** 至于"这一行和下一行之间怎么对齐"（垂直方向的整体协调），Flex 只能靠 `align-content` 粗粒度地管，做不到"每一列的每一行都对齐"。

看这个经典对比，你会立刻理解"一维 vs 二维"：

```text
Flex 的视角（一维）：           Grid 的视角（二维）：
┌──────────────┐              ┌──────────────┐
│ A  B  C      │              │ A    B    C  │
│ D    E  F    │  ← 行与行     │ D    E    F  │
│ G  H         │     对不齐    │ G    H    I  │
└──────────────┘              └──────────────┘
```

左边是 Flex 换行后的样子：每行独立，第一行的 B 和第二行的 E **不在同一条垂直线上**，因为每行各自按自己的内容分配宽度。右边是 Grid：A/D/G 严格对齐成一列，B/E/H 对齐，C/F/I 对齐。

**这就是 Flex 和 Grid 最本质的分工**（第 06 章会系统展开）：

- **只有"一行/一列"要管** → Flex，简单直接。
- **"行和列要同时精确对齐"** → Grid，Flex 干不了这个。

### 2.9.2 Flex 硬做二维布局的样子（提前看一眼）

很多人会用 Flex + `flex-wrap` 去硬拼一个"卡片网格"，结果就遇到了第 03 章会讲的坑：

```html
<div class="grid">
  <div class="card">卡片 1</div>
  <div class="card">卡片 2</div>
  <div class="card">卡片 3</div>
  <div class="card">卡片 4</div>
  <div class="card">卡片 5</div>
</div>
```

```css
/* ❌ 用 Flex 硬拼网格：换行后每行独立，列对不齐，最后一行还散开 */
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.card {
  flex: 1 1 200px;   /* 想让它"自适应撑满每行" */
}
```

**现象**：前两行各有 2 张卡，最后一行只剩 1 张卡，而这张卡因为 `flex-grow: 1` 会被**拉宽到占满整行**——和其他行的卡宽度不一致。这就是 Flex 一维本质的必然结果：**它没法让"最后一行那张卡"保持和上一行卡一样的宽度**。

**正解预览**（Grid 一行解决，第 04 章展开）：

```css
/* ✅ Grid：天然的行列对齐，最后一行不满也不会被拉宽 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
```

这不是说 Flex 差，而是说**工具和场景要匹配**。记住这个边界，你在第 06 章做"Flex 还是 Grid"的选择题时，就已经赢了一半。

> 一句话记住它：**Flex 是"一维"的——精确管一根轴、交叉轴只做辅助；遇到"行列都要精确对齐"的二维需求，别硬拗 Flex，那是 Grid 的主场。**

---

## 2.10 本章常见坑速查

| 坑 | 现象 | 原因 | 正确做法 |
|---|---|---|---|
| 把 `align-items` 当水平对齐用 | 元素在错误方向对齐 | `align-items` 管交叉轴，不是水平 | 水平用 `justify-content`，垂直用 `align-items` |
| `flex: 1` 想三等分却宽度不一 | 内容长的元素更宽 | 误写成了 `flex: auto`（`1 1 auto`） | 严格等宽用 `flex: 1`（`1 1 0%`） |
| 改了 `flex-direction: column` 后居中失效 | 原本的"水平垂直居中"变成只在一个方向生效 | 轴转了，`justify-content`/`align-items` 的作用方向跟着转 | 用"轴"思考：`justify-content` 管主轴、`align-items` 管交叉轴 |
| `gap` 设了却首尾还有间距 | 首尾多出空白 | 用 `margin` 设间距，而非 `gap` | 元素间间距用 `gap`，首尾不会多块 |
| 给孙元素加 `display: flex` 却指望祖容器管它 | 孙元素没排进 flex 流 | flex container 只管直接子元素 | 每一层要 flex，就自己加 `display: flex` |
| 用 `order` 重排后键盘 Tab 顺序"乱"了 | Tab 聚焦顺序和视觉不一致 | `order` 不改 DOM 顺序 | 视觉重排可以，语义重要元素别用 `order` |
| `flex-wrap: wrap` 后每行 `space-between` 最后一行很散 | 最后一行不满却两端贴边 | `space-between` 只作用于当前行 | 见第 03 章，或换 Grid |
| 子元素设了 `height` 后 `stretch` 不生效 | 没被拉伸 | `stretch` 只拉伸交叉轴尺寸为 auto 的元素 | 去掉固定高度，或用 `align-self` 显式控制 |
| 换了 `column` 方向后 `gap` 没换行效果 | 元素还是竖着排 | `flex-wrap` 配合 `column` 时按"高度"换行，不是宽度 | 竖排多列场景用 Grid 更合适 |
| 以为 `flex-shrink: 1` 是"平均缩" | 基准大的元素缩得更多 | 收缩按 `basis × shrink` 加权 | 理解加权公式，或显式设 shrink 比例 |
| `justify-content: center` 没生效 | 元素还是贴边 | 子元素有 `margin: auto`，先吃掉了剩余空间 | 去掉 auto margin，或改用 margin 方案 |

---

## 2.11 本章小结

- `display: flex` 把父容器变 flex container、直接子元素变 flex item，**只影响一层**。
- 职责划分：**父容器管方向/对齐/换行/间距，子元素管伸缩/排序/自我对齐**。
- **主轴由 `flex-direction` 决定，交叉轴永远垂直主轴**；`justify-content` 管主轴、`align-items` 管交叉轴——记住"轴"，不要记"横竖"。
- `justify-content` 6 个值：`flex-start`/`flex-end`/`center`（定位型）+ `space-between`/`space-around`/`space-evenly`（均分型）。
- `align-items` 默认 `stretch`，只拉伸"没设尺寸"的子元素；`align-self` 单独覆盖；`align-content` 只在多行时管"行与行"。
- flex 三件套：`flex-basis` 定基准、`flex-grow` 分多余（默认 0）、`flex-shrink` 承担缺口（默认 1）。
- `flex-shrink` 默认 1 反映 Flex 的设计意图：**内容默认适应容器，优先收缩而不是撑破**。
- `flex: 1` = `1 1 0%`（严格均分），`flex: auto` = `1 1 auto`（内容优先）；要三等分用 `flex: 1`。
- flex 里 `margin: auto` 会吸收剩余空间（优先级高于 `justify-content`），`margin-left: auto` 是"推到最右"的经典写法。
- `flex-wrap` 默认不换行；`gap` 只在元素之间；`order` 只改视觉不改 DOM。
- **Flex 是"一维"布局**：精确管主轴、交叉轴只做辅助；行列都要精确对齐的二维需求交给 Grid。

---

## 2.12 动手练习

1. 写一个容器，里面三个等宽卡片，水平排列，两边贴边、中间均分。你会怎么写 `justify-content`？如果要改成"所有缝隙（含两端）等宽"，又怎么写？

   <details><summary>参考答案</summary>
   两边贴边中间均分是 `justify-content: space-between`；所有缝隙等宽（含两端）是 `justify-content: space-evenly`。注意 `space-around` 会让两端只有中间间距的一半，不是"所有缝隙等宽"。
   </details>

2. 三个子元素，`flex-basis` 都是 100px，容器宽 600px。给 A、B、C 分别设 `flex-grow: 1 / 2 / 3`，最终它们的宽度各是多少？

   <details><summary>参考答案</summary>
   基准共 300px，剩余 300px。按 1:2:3 分：A 得 50px、B 得 100px、C 得 150px。最终 A=150px、B=200px、C=250px。关键点：`flex-grow` 分的是**剩余空间**，不是"总宽度的比例"。
   </details>

3. 判断对错：`flex: 1` 等价于 `flex: 1 1 auto`。如果错，正确的是什么？

   <details><summary>参考答案</summary>
   错。`flex: 1` 等价于 `flex: 1 1 0%`。`flex: auto` 才等价于 `flex: 1 1 auto`。两者 `flex-basis` 不同，`flex: 1` 严格均分、`flex: auto` 内容优先。
   </details>

4. 一个容器 `flex-direction: column`，你想让子元素"水平居中"，应该用哪个属性？

   <details><summary>参考答案</summary>
   `align-items: center`。因为 `column` 时主轴是垂直的、交叉轴是水平的，而 `align-items` 管交叉轴（此时是水平方向）。如果你写 `justify-content: center`，那管的是主轴（垂直方向），就是垂直居中而非水平居中。
   </details>

5. 为什么 `align-items: stretch`（默认）能实现"等高列"，但给子元素设了 `height` 后就不拉高了？

   <details><summary>参考答案</summary>
   `stretch` 只作用于交叉轴尺寸为 `auto` 的子元素。设了固定 `height`（主轴水平时），该元素交叉轴尺寸不再是 auto，就不会被拉伸。这是设计使然——固定尺寸表示"我明确要求这么高"，拉伸不应覆盖它。
   </details>

6. 三个子元素 `flex-basis` 都是 200px，`flex-shrink` 都是 1，容器只有 450px。问：收缩是怎么分配的？最终每个多宽？

   <details><summary>参考答案</summary>
   总基准 600px，缺口 150px。三者 basis 相同、shrink 相同，加权后等额收缩，各缩 50px，最终每个 150px。若某个元素 `flex-basis` 是 400px 而其他两个是 100px，同样 shrink 1，则基准大的会按 `basis × shrink` 加权、缩得更多——这是"按基数加权"的体现。
   </details>

7. 导航栏要"logo 在左、登录按钮在右"，有哪两种写法？各自适用什么场景？

   <details><summary>参考答案</summary>
   ① `justify-content: space-between`：适合"只有两个元素"的场景；② `.login { margin-left: auto }`：适合"多于两个元素、只想把最后一个推到右边"的场景，且能精确控制是哪个元素被推。两种都对，但 margin 方案在元素多于两个时更灵活。
   </details>

8. `flex: 1 200px` 和 `flex: 1 1` 分别等价于什么？它们的 `flex-basis` 各是多少？

   <details><summary>参考答案</summary>
   `flex: 1 200px` 等价于 `flex: 1 1 200px`（第二个值是长度，所以它是 basis，shrink 补 1）；`flex: 1 1` 等价于 `flex: 1 1 0%`（缺省的 basis 永远是 0%，不是 auto）。两者的 basis 分别是 200px 和 0%。
   </details>

9. 你想做一个"卡片流"：卡片自动换行，每行尽可能多放几张，卡片之间有间距。用 Flex 写出来后，发现最后一行不满时卡片被拉宽了。为什么？这暴露了 Flex 的什么本质限制？

   <details><summary>参考答案</summary>
   因为你用了 `flex: 1 1 200px`（grow 为 1），最后一行那张卡会把剩余空间吃掉、被拉宽。这暴露了 Flex 的"一维"本质：它只管每一行的主轴分配，无法让"最后一行不满的卡"保持和上一行卡一样的宽度。要严格的行列对齐，应该用 Grid（第 04、06 章）。
   </details>

---

> 📖 **本章的代码示例**：`examples/02-Flexbox核心.html`（两根轴可视化、对齐值对比、flex 三件套交互演示）
> 🚀 **下一章**：第 03 章用这些基础搭真实布局，并集中处理 `min-width: 0`、`space-between` 末行、`flex-basis` 与 `width` 优先级这些实战坑。
