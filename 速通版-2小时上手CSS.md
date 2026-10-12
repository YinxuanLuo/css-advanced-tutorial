# 速通版 · 2 小时上手 CSS 现代布局

> 目标：**2 小时内**，从"只会 `float`/`position`"到"能用 Flexbox + Grid 搭出大部分布局，并看懂 Tailwind 的类名"。
> 每个小节末尾都有 `→ 深入：第 XX 章`，觉得不够再跳过去。
> 本速通版假设你已会：选择器、盒模型、`margin`/`padding`、`float`/`position` 基础。

---

## 你需要先记住的三句话

1. **布局的本质是"声明关系、让浏览器算"，不是"手动摆像素"。**
2. **一维（一行/一列）用 Flex，二维（行列网格）用 Grid。**
3. **`flex: 1` 的本质是"分剩余空间"，不是"设宽度"。**

这三句读懂了，后面全是细节。

---

## 第一部分：Flexbox（约 50 分钟）

### 1. 打开 Flex 开关：`display: flex`

```css
.container { display: flex; }
```

一句话，容器里的**直接子元素**就从"竖着排"变成"横着排"。

```html
<div class="container">
  <div>A</div><div>B</div><div>C</div>
</div>
```

渲染结果：`A B C` 水平排成一行。

> 一句话记住它：**`display: flex` 作用在"父容器"上，改变的是"子元素"的排列方式。**

→ 深入：第 02 章 2.1

### 2. 两根轴：主轴 和 交叉轴

Flex 里最重要的心智模型，没有之一：

- **主轴（main axis）**：子元素排列的方向。默认**水平向右**（`flex-direction: row`）。
- **交叉轴（cross axis）**：垂直于主轴。默认**垂直向下**。

| 属性 | 控制 | 作用在 |
|---|---|---|
| `justify-content` | 主轴方向的对齐 | 容器 |
| `align-items` | 交叉轴方向的对齐 | 容器 |
| `flex-direction` | 主轴的方向 | 容器 |

**记法**：`justify` 管主轴（justify 的 j 像主轴那一横），`align` 管交叉轴。

```css
.container {
  display: flex;
  justify-content: center;  /* 水平居中 */
  align-items: center;      /* 垂直居中 */
}
```

**这就是"水平垂直居中"的 Flex 写法。** 一行搞定，不用记 `transform`。

> 一句话记住它：**`justify` 管主轴，`align` 管交叉轴；默认主轴是横的，所以 `justify-content: center` 是水平居中。**

→ 深入：第 02 章 2.2

### 3. `flex: 1` 的真相：分剩余空间

```css
.item { flex: 1; }
```

`flex: 1` 是 `flex: 1 1 0%` 的缩写，三个值分别是：

| 缩写 | 全称 | 默认值 | 含义 |
|---|---|---|---|
| 第一个 `1` | `flex-grow` | 0 | 剩余空间怎么**分**（放大比例） |
| 第二个 `1` | `flex-shrink` | 1 | 空间不够怎么**缩**（缩小比例） |
| 第三个 `0%` | `flex-basis` | auto | 元素**初始尺寸**（分配前的基准） |

**`flex: 1` 的意思是**：基准是 0（无视内容宽度），剩余空间按 1:1 分给你。

所以三个 `flex: 1` 的子元素 = **三等宽**，无论内容多长。

对比：

```css
.a { flex: 1; }        /* 基准 0，纯按比例分 → 三等宽 */
.b { flex: auto; }     /* 基准 auto，先按内容宽，再分剩余 → 内容长的更宽 */
```

> 一句话记住它：**`flex: 1` = 长大 1、缩小 1、基准 0，意思是"无视内容，按比例分剩余空间"。**

→ 深入：第 02 章 2.4

### 4. 经典模式：导航栏 + 卡片流

**导航栏**（logo 靠左，菜单靠右）：

```css
.nav {
  display: flex;
  justify-content: space-between;  /* 首尾贴边，中间均分 */
  align-items: center;
}
```

**卡片流**（自动换行的等宽卡片）：

```css
.card-grid {
  display: flex;
  flex-wrap: wrap;      /* 放不下就换行 */
  gap: 16px;            /* 卡片间距 */
}
.card-grid > * {
  flex: 1 1 200px;      /* 基准 200px，能长能缩 */
}
```

> 一句话记住它：**`flex-wrap: wrap` + `flex: 1 1 <基准>` 是"自适应卡片流"的标准配方。**

→ 深入：第 03 章

---

## 第二部分：Grid（约 50 分钟）

### 5. 打开 Grid 开关：`display: grid` + 列模板

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;  /* 三列：200px + 均分 + 均分 */
  gap: 16px;
}
```

`grid-template-columns` 声明**列**的构成，`1fr` 是 Grid 特有的单位，意思是"**一份剩余空间**"。

- `1fr 1fr` = 两列均分
- `200px 1fr` = 第一列固定 200px，第二列吃掉剩下全部
- `repeat(3, 1fr)` = `1fr 1fr 1fr` 的简写

> 一句话记住它：**`1fr` 是"一份剩余空间"；`repeat(n, 1fr)` 是"n 等分"。**

→ 深入：第 04 章 4.1

### 6. 经典模式：页面骨架（圣杯布局）

最经典的"头 + 侧边栏 + 内容 + 脚"：

```css
.page {
  display: grid;
  grid-template-columns: 240px 1fr;   /* 侧边栏 240px，内容吃剩下 */
  grid-template-rows: auto 1fr auto;  /* 头尾自适应，中间撑满 */
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

**`grid-template-areas` 让你用 ASCII 画布局**——`"header header"` 就是"第一行 header 跨两列"。这是 Grid 最优雅的能力，一眼看清整页结构。

> 一句话记住它：**`grid-template-areas` 让你用文字"画"出页面骨架，跨行跨列一行搞定。**

→ 深入：第 05 章 5.2

### 7. `auto-fit` 与 `minmax`：自适应响应式网格

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```

这一行是 Grid 的"杀手锏"：**自动根据容器宽度决定放几列**。

- `minmax(200px, 1fr)`：每列最小 200px，最大均分剩余
- `auto-fit`：能塞几列塞几列，塞不下的自动换行

**效果**：容器宽，一排放 5 列；容器窄，一排放 2 列——**不需要写任何媒体查询**。

> 一句话记住它：**`repeat(auto-fit, minmax(200px, 1fr))` 是"无需媒体查询的自适应网格"标准配方。**

→ 深入：第 05 章 5.3

---

## 第三部分：Flex 还是 Grid？（约 15 分钟）

### 8. 一个判断标准

| 你的布局是 | 用 | 理由 |
|---|---|---|
| **一行/一列**内的排列、对齐、伸缩 | **Flex** | 一维问题，Flex 最顺手 |
| **行列交错**的网格、整页骨架 | **Grid** | 二维问题，Grid 天生就是干这个的 |
| 先不确定，元素自动流式排列 | **Flex**（`flex-wrap`） | 内容驱动 |
| 结构明确、要"画"出区域 | **Grid**（`grid-template-areas`） | 布局驱动 |

**一句话决策**：**内容推着元素走 → Flex；布局拉着元素归位 → Grid。**

（两者并不互斥：外层 Grid 搭骨架，内层 Flex 排细节，是生产中的常见组合。）

→ 深入：第 06 章

---

## 第四部分：Tailwind 30 秒速览（约 10 分钟）

### 9. 原子类：把 CSS 写成"乐高积木"

传统写法：给元素起个类名，去 CSS 文件写规则。

```css
.card { display: flex; align-items: center; padding: 16px; gap: 12px; }
```

Tailwind：**直接用一堆"原子类"在 HTML 里拼出样式**。

```html
<div class="flex items-center p-4 gap-3">
```

| Tailwind 类 | 等价 CSS |
|---|---|
| `flex` | `display: flex` |
| `items-center` | `align-items: center` |
| `justify-between` | `justify-content: space-between` |
| `p-4` | `padding: 1rem` |
| `gap-3` | `gap: 0.75rem` |
| `grid-cols-3` | `grid-template-columns: repeat(3, minmax(0, 1fr))` |

**响应式前缀**：`md:flex` 表示"中等屏幕及以上才 flex"（移动优先，默认移动端，`md:` 是"往上加"）。

> 一句话记住它：**Tailwind = 把"声明关系"这件事，从"查类名 → 找 CSS 文件"提速成"直接在 HTML 里拼积木"。底层还是 Flex/Grid，只是换了个写法。**

→ 深入：第 08 章

---

## 自测题（5 题，答完对照答案）

1. `display: flex` 应该加在**父容器**还是**子元素**上？它改变的是什么？
2. `flex: 1` 等价于哪三个值？"基准 0"意味着什么？
3. `justify-content` 和 `align-items` 分别管哪根轴？默认主轴是横还是竖？
4. `grid-template-columns: repeat(3, 1fr)` 和 `repeat(auto-fit, minmax(200px, 1fr))` 有什么区别？
5. 什么场景用 Flex，什么场景用 Grid？给出一句话判断标准。

<details>
<summary>参考答案</summary>

1. 加在**父容器**上，改变的是**子元素的排列方式**（从竖排变横排）。
2. `flex: 1 1 0%`——`flex-grow: 1`、`flex-shrink: 1`、`flex-basis: 0%`。"基准 0"意味着无视内容宽度，纯按比例分剩余空间，所以是三等宽。
3. `justify-content` 管**主轴**，`align-items` 管**交叉轴**。默认主轴是**横的**（`flex-direction: row`）。
4. `repeat(3, 1fr)` 是**固定三列**均分；`auto-fit + minmax` 是**根据容器宽度自动决定列数**，列最少 200px，无需媒体查询。
5. 一行/一列内的排列用 **Flex**；行列交错的网格/整页骨架用 **Grid**。一句话：内容推着元素走 → Flex，布局拉着元素归位 → Grid。
</details>

---

## 接下来

- 想系统搞懂"为什么"，从 [第 00 章 · 设计哲学](docs/00-设计哲学.md) 开始。
- 想直接深入 Flex，跳 [第 02 章](docs/02-Flexbox核心.md)。
- 想深入 Grid，跳 [第 04 章](docs/04-Grid核心.md)。
- 想动手做题，打开根目录的 `CSS进阶及最佳实践-练习站.html`。
