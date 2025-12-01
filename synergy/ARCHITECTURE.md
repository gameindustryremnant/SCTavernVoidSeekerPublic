# Synergy 模块化架构与实现细节

本文件合并了原 ARCHITECTURE.md、MODULE_STRUCTURE.md、MODULAR_SPLIT_REPORT.md 的内容，详细说明了 `synergy` 目录下的模块结构、依赖关系、重构过程和自定义方法。

---

## 📦 文件与模块结构

```
synergy/
├── dataLoader.js        # 数据加载模块
├── synergyRules.js      # 协同规则与基础分数
├── synergyWeighter.js   # 权重与乘数应用
├── graphBuilder.js      # 3D图数据构建
├── app.js               # 主流程与UI
├── index.html           # 入口页面
├── app.css              # 样式
├── README.md            # 用户&技术文档
└── ARCHITECTURE.md      # 架构与模块说明（本文件）
```

---

## 🔗 依赖关系与加载顺序

1. Three.js & 3d-force-graph (CDN)
2. dataLoader.js
3. synergyRules.js
4. synergyWeighter.js
5. graphBuilder.js
6. app.js

所有模块通过 `window` 全局对象暴露。

---

## 🧩 各模块职责

### 1. dataLoader.js
- 加载 `../data/` 下的 tags.json、core.json、pack*.json
- 提供 `loadTags()`、`loadCoreCards()`、`loadExpansionPack()`、`loadAllData()` 等方法

### 2. synergyRules.js
- 定义硬编码协同规则（同族、共享标签、标签组合）
- 提供 `calculateSynergy(card1, card2, tags1, tags2)`

### 3. synergyWeighter.js
- 定义标签权重（VALUE_MULTIPLIERS）
- 提供 `applyWeights(rawSynergy, tags1, tags2)`、`getMultiplier(tag)`、`setMultiplier(tag, value)`

### 4. graphBuilder.js
- 构建3D力导向图节点和边
- 提供 `buildGraphData(cards, cardTags, synergies)`、`applyFilters()`、`getColorByRace()` 等

### 5. app.js
- 负责主流程编排、UI渲染、状态管理
- 通过 orchestrate 各模块实现完整功能

---

## 🔄 计算流程

```
calculateAllSynergies()
  ↓
  ├─ Step 1: SynergyRules.calculateSynergy()      [基础协同分]
  ├─ Step 2: SynergyWeighter.applyWeights()       [加权协同分]
  └─ Step 3: GraphBuilder.buildGraphData()        [3D图结构]
```

---

## 🛠️ 常见自定义

### 新增协同规则
在 synergyRules.js 的 rules 数组中添加：
```javascript
{
  rule: "my_custom_rule",
  calculate: (card1, card2, tags1, tags2) => {
    // 自定义逻辑
    return synergy;
  }
}
```

### 修改标签权重
在 synergyWeighter.js 或运行时：
```javascript
window.SynergyWeighter.setMultiplier("新标签", 2.5);
```

### 新增过滤器
在 graphBuilder.js 添加方法并在 applyFilters() 调用：
```javascript
filterNodesByLevel(nodes, level) {
  if (!level) return nodes;
  return nodes.filter(n => n.level === level);
}
```

---

## 📝 API 快速参考

```javascript
// 加载数据
const data = await window.DataLoader.loadAllData([1,2,3]);

// 计算协同
const rawSyn = window.SynergyRules.calculateSynergy(c1, c2, t1, t2);
const wgtSyn = window.SynergyWeighter.applyWeights(rawSyn, t1, t2);

// 构建图表
const graph = window.GraphBuilder.buildGraphData(cards, tags, synergies);
const filtered = window.GraphBuilder.applyFilters(graph, race, tag);

// 获取/设置权重
const m = window.SynergyWeighter.getMultiplier("英雄");
window.SynergyWeighter.setMultiplier("英雄", 2.5);
```

---

## ✅ 重构与验证

- app.js 已拆分为4个独立模块，主文件更精简
- index.html 按依赖顺序加载脚本
- 所有功能与原版一致，便于扩展和维护

---

**状态**: ✅ 完成  
**最后更新**: 2025-12-01
