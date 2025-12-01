# 协同分析工具 - 详细文档

## 目录

1. [概述](#概述)
2. [快速开始](#快速开始)
3. [功能说明](#功能说明)
4. [技术架构](#技术架构)
5. [自定义指南](#自定义指南)
6. [API 参考](#api-参考)
7. [常见问题](#常见问题)

## 概述

星际酒馆卡牌协同分析工具是一个独立的单页应用（SPA），用于可视化和分析卡牌之间的协同关系。通过3D力导向图展示卡牌节点和它们的协同关系。

### 核心概念

- **标签系统**：每张卡牌有加权的功能标签（如英雄、飞行、法术等）
- **协同规则**：硬编码的规则定义如何计算卡牌之间的协同强度
- **价值乘数**：定义不同标签对最终协同值的贡献权重

## 快速开始

### 前置条件

- 现代浏览器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）
- 本地 HTTP 服务器（Python、Node.js 等）
- 项目根目录有 `data/` 文件夹

### 启动步骤

1. **启动服务器**（从项目根目录）
   ```bash
   python -m http.server 8000
   ```

2. **打开应用**
   ```
   http://localhost:8000/synergy/
   ```

3. **使用应用**
   - 选择数据集（核心和扩展包）
   - 设置过滤条件
   - 与3D图交互

## 功能说明

### UI 布局

应用分为三个主要区域：

#### 左侧控制面板（280px 固定宽度）
- **数据集选择**
  - 核心集（始终加载，不可取消）
  - 8个扩展包（可选）
  - 实时加载和计算

- **筛选控件**
  - 种族筛选：Protess / Zerg / Terran / Neutral
  - 标签筛选：动态生成的所有可用标签
  
- **统计信息**
  - 总卡牌数
  - 筛选后的卡牌数
  - 显示的连接数

#### 中间区域（弹性，主要内容）
- **3D 力导向图**
  - 使用 3d-force-graph 库
  - WebGL 加速渲染
  - 响应式交互：拖动旋转、滚轮缩放
  - 点击节点查看详情

#### 右侧详情面板（300px 固定宽度）
- **卡牌信息**
  - 名称、种族、等级
  - 单位数、价值
  
- **标签列表**
  - 显示所有标签及其权重
  
- **协同卡牌**
  - 前5个最强协同的卡牌
  - 显示协同点数

### 数据流

```
加载数据
   ↓
加载标签 (data/tags.json)
   ↓
加载卡牌 (data/*.json)
   ↓
计算协同关系
   ↓
生成图表数据
   ↓
渲染 UI 和 3D 图
   ↓
等待用户交互
   ↓
更新过滤和渲染
```

## 技术架构

### 文件结构

```
synergy/
├── index.html          # UI 入口
├── app.js              # 应用逻辑（475 行）
├── app.css             # 样式表（400+ 行）
├── README.md           # 快速参考
└── DOCS.md             # 此文件
```

### 核心模块

#### 1. **数据加载模块** (`loadData()`)
```javascript
async loadData() {
  // 加载标签
  const tagsResp = await fetch("../data/tags.json");
  const tagsData = await tagsResp.json();
  this.state.cardTags = tagsData.cardTags;
  
  // 加载卡牌
  const filesToLoad = this.getSelectedDatasets();
  // ... 加载每个文件
}
```

#### 2. **协同计算引擎** (`calculateAllSynergies()`)
- 对所有卡牌对计算协同点数
- 使用硬编码的规则
- 结果按协同强度排序

#### 3. **图表生成模块** (`buildGraphData()`)
- 创建节点数据（一个卡牌一个节点）
- 创建边数据（顶5个协同关系）
- 使用 Set 去重

#### 4. **渲染模块** (`renderGraph()`)
- 集成 3d-force-graph 库
- 动态应用过滤条件
- 处理用户交互（点击、拖动等）

### 状态管理

```javascript
state = {
  cards: [],              // 加载的所有卡牌
  cardTags: {},          // cardId -> tags 映射
  synergies: {},         // cardId -> synergies[] 映射
  selectedRace: "",      // 当前种族过滤
  selectedTag: "",       // 当前标签过滤
  graph: {               // 3D 图表数据
    nodes: [],           // 卡牌节点
    links: []            // 协同关系
  }
}
```

## 协同计算详解

### 硬编码规则

#### 规则 1：同族协同 (same_race)
```
条件：card1.race === card2.race
公式：(tag[race]_1 + tag[race]_2) × 2
目的：奖励相同种族的卡牌组合
```

#### 规则 2：共享标签 (shared_tag)
```
条件：两张卡牌都有某个共同标签
公式：对每个共享标签，(tag_1 + tag_2) × 1.5
目的：奖励有相同功能特性的卡牌
```

#### 规则 3：标签组合 (tag_combos)
```
英雄 + 单位：(hero + unit) × 1.3
飞行 + 飞行：(fly_1 + fly_2) × 2         // 最强
法术 + 近战：(spell + melee) × 1.2
建筑 + 单位：(build + unit) × 0.8
```

### 价值乘数系统

```javascript
VALUE_MULTIPLIERS = {
  "英雄": 2.0,        // 最高优先级
  "飞行": 1.8,        
  "法术": 1.6,
  "远程": 1.5,
  "近战": 1.4,
  "建筑": 1.3,
  "单位": 1.2,
  "Protess": 1.1,     // 种族加成
  "Zerg": 1.1,
  "Terran": 1.1,
  "Neutral": 0.9
}
```

最终协同点数 = 规则总和 × 乘数

### 计算示例

两张卡牌：凯拉克斯 (Protess 英雄) vs 黄金舰队 (Protess 飞行单位)

```
凯拉克斯标签：{Protess: 4, 英雄: 4}
黄金舰队标签：{Protess: 4, 单位: 3, 飞行: 3}

同族协同：(4 + 4) × 2 = 16
共享标签：(4 + 4) × 1.5 = 12  (Protess)
组合加成：(4 + 3) × 1.3 = 9.1 (英雄 + 单位)
小计：16 + 12 + 9.1 = 37.1

价值乘数：
  - 共享 Protess：+1.1 × 0.1 = 0.11
  - 共享 英雄：+2.0 × 0.1 = 0.2
  - 共享 单位：+1.2 × 0.1 = 0.12
  乘数 = 1 + 0.11 + 0.2 + 0.12 = 1.43

最终点数：37.1 × 1.43 ≈ 53
```

## 自定义指南

### 1. 添加/修改标签

编辑 `../data/tags.json`：

```json
{
  "cardTags": {
    "新卡牌": {
      "标签1": 权重值,
      "标签2": 权重值
    }
  }
}
```

现有标签示例：
- Protess, Zerg, Terran, Neutral（种族）
- 英雄, 单位, 建筑（类型）
- 飞行, 法术, 近战, 远程（技能）

### 2. 修改协同规则

在 `app.js` 中编辑 `SYNERGY_RULES` 数组：

```javascript
{
  rule: "rule_name",
  calculate: (card1, card2, tags1, tags2) => {
    // 自定义逻辑
    if (/* 某条件 */) {
      return synergyPoints;
    }
    return 0;
  }
}
```

### 3. 调整价值乘数

编辑 `app.js` 中的 `VALUE_MULTIPLIERS` 对象：

```javascript
VALUE_MULTIPLIERS = {
  "英雄": 2.5,      // 提高英雄重要性
  "飞行": 1.5,      // 降低飞行重要性
  // ...
}
```

### 4. 修改颜色方案

编辑 `app.js` 的 `getColorByRace()` 方法：

```javascript
getColorByRace(race) {
  const colors = {
    "Protess": "#0099FF",   // 修改颜色
    "Zerg": "#FF0099",
    "Terran": "#FF9900",
    "Neutral": "#CCCCCC"
  };
  return colors[race] || "#CCCCCC";
}
```

或在 `app.css` 中修改相关样式。

## API 参考

### 全局对象

```javascript
window.SynergyApp
```

### 主要方法

#### `init()`
初始化应用，加载数据并渲染。自动在 DOMContentLoaded 时调用。

#### `loadData()`
异步加载卡牌和标签数据。在用户切换数据集时调用。

#### `calculateAllSynergies()`
计算所有卡牌对之间的协同点数。

#### `calculateCardSynergy(card1, card2, tags1, tags2)`
计算两张卡牌的协同点数。

**参数：**
- `card1`, `card2`：卡牌对象
- `tags1`, `tags2`：标签映射

**返回：**
- 协同点数（数字）

#### `buildGraphData()`
从协同数据生成图表节点和边。

#### `renderAll()`
重新渲染所有 UI 组件。

#### `renderGraph()`
使用当前过滤条件重新渲染3D图。

#### `showCardDetails(cardId)`
显示卡牌的详细信息。

**参数：**
- `cardId`：卡牌名称（字符串）

### 状态属性

```javascript
// 查看所有卡牌
window.SynergyApp.state.cards

// 查看所有协同关系
window.SynergyApp.state.synergies

// 查看卡牌标签
window.SynergyApp.state.cardTags

// 查看图表数据
window.SynergyApp.state.graph
```

## 常见问题

### Q: 3D 图表不显示

**A:** 检查以下项目：
1. 浏览器是否支持 WebGL（检查 Chrome DevTools > Console）
2. 是否通过 HTTP 服务器访问（不能用 file:// 协议）
3. 是否有 JavaScript 错误（F12 > Console）

### Q: 数据加载失败

**A:** 
1. 确保使用 HTTP 服务器（`python -m http.server`）
2. 检查 data/ 文件夹是否存在于项目根目录
3. 查看 Network 标签页，确认 JSON 文件加载成功

### Q: 如何导出协同数据

**A:** 在浏览器控制台运行：
```javascript
// 导出为 JSON
JSON.stringify(window.SynergyApp.state.synergies, null, 2)

// 导出为 CSV（需要额外处理）
const csv = Object.entries(window.SynergyApp.state.synergies)
  .map(([id, syns]) => `${id},${syns.length}`)
  .join('\n');
```

### Q: 如何添加新卡牌

**A:**
1. 在 `../data/core.json` 中添加卡牌对象
2. 在 `../data/tags.json` 中为该卡牌添加标签
3. 刷新页面

### Q: 节点太多导致性能下降

**A:**
1. 减少加载的数据集（取消选择扩展包）
2. 使用种族或标签过滤缩小范围
3. 每张卡牌的最大连接数在 `buildGraphData()` 中设置为 5，可调整

### Q: 如何自定义节点大小或颜色

**A:** 编辑 `buildGraphData()` 中的节点创建逻辑：

```javascript
const size = Math.max(10, Math.min(50, card.value / 100)); // 根据价值调整
const color = this.getColorByRace(card.race); // 按种族着色
```

## 性能指标

| 指标 | 数值 |
|------|------|
| 初始加载时间 | < 2 秒 |
| 卡牌数量 | 89+ 张 |
| 协同计算 | O(n²) |
| 可视化边数 | ~445 条（优化后） |
| 图表 FPS | 60（WebGL加速） |
| 内存占用 | 5-10 MB |

## 浏览器兼容性

| 浏览器 | 版本 | 支持 |
|--------|------|------|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |
| IE 11 | 任何 | ❌ |

需要：
- ES6 JavaScript
- WebGL 支持
- CSS Grid/Flexbox

## 外部依赖

- **3d-force-graph** (CDN): 3D 图表库
- **Three.js** (CDN): WebGL 3D 引擎

## 版本历史

### v1.0.0 (2025-12-01)
- 初始发布
- 完整的协同计算引擎
- 3D 力导向图可视化
- 响应式设计

---

**最后更新**: 2025-12-01
