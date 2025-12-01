
# 星际酒馆卡牌协同分析工具

这是一个独立的3D可视化工具，用于分析星际酒馆PVP中的卡牌协同关系。

---

## 🚀 快速开始

1. 启动本地服务器（项目根目录）：
	```bash
	python -m http.server 8000
	# 或
	npx http-server -p 8000
	```
2. 浏览器访问：
	- 协同分析工具：`http://localhost:8000/synergy/`
	- 原始猜牌应用：`http://localhost:8000/`

---

## 📋 文件说明

| 文件 | 作用 |
|------|------|
| **index.html** | 应用入口页面 |
| **app.js** | 核心应用逻辑和UI |
| **app.css** | 响应式样式表 |
| **README.md** | 快速参考指南（本文件） |
| **ARCHITECTURE.md** | 架构与模块说明 |

数据文件位于 `../data/`：
- `core.json` - 核心卡牌
- `pack1-8.json` - 扩展包卡牌
- `tags.json` - 卡牌标签定义

---

## ✨ 功能特性

- 3D 协同关系可视化
- 加权标签系统
- 多层协同规则（同族、共享标签、标签组合）
- 实时数据集切换
- 种族和标签过滤
- 卡牌详情面板

---

## 🛠️ 自定义与扩展

1. **标签定义** → `../data/tags.json`
2. **协同规则** → `app.js` 或 `synergyRules.js` (SYNERGY_RULES)
3. **价值乘数** → `app.js` 或 `synergyWeighter.js` (VALUE_MULTIPLIERS)
4. **颜色方案** → `app.css` 或 `graphBuilder.js`

---

## 🖥️ 浏览器要求

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

需支持 WebGL 和 ES6 JavaScript

---

## 💡 常见问题

1. **应用不加载？**
	- 请确保用 HTTP 服务器访问（不能用 file://）
	- 检查浏览器控制台错误信息（F12）
2. **3D 图表不显示？**
	- 检查浏览器是否支持 WebGL
	- 尝试其他浏览器
3. **数据加载失败？**
	- 确认 `data/` 文件夹存在于项目根目录
	- 检查 Network 标签页

---

## 📚 技术文档

### 核心概念

- **标签系统**：每张卡牌有加权的功能标签（如英雄、飞行、法术等）
- **协同规则**：硬编码规则定义如何计算卡牌间协同强度
- **价值乘数**：定义不同标签对最终协同值的贡献权重

### 主要方法

- `window.SynergyApp.init()` - 初始化应用，加载数据并渲染
- `window.SynergyApp.loadData()` - 异步加载卡牌和标签数据
- `window.SynergyApp.calculateAllSynergies()` - 计算所有卡牌对之间的协同点数
- `window.SynergyApp.buildGraphData()` - 生成3D图表节点和边
- `window.SynergyApp.renderAll()` - 重新渲染所有UI组件
- `window.SynergyApp.showCardDetails(cardId)` - 显示卡牌详细信息

### 状态属性

- `window.SynergyApp.state.cards` - 所有卡牌
- `window.SynergyApp.state.cardTags` - 卡牌标签映射
- `window.SynergyApp.state.synergies` - 卡牌协同关系
- `window.SynergyApp.state.graph` - 3D图表数据

---

## 🧩 模块化架构（简要）

详见 `ARCHITECTURE.md`，包括：
- dataLoader.js - 数据加载
- synergyRules.js - 协同规则
- synergyWeighter.js - 权重应用
- graphBuilder.js - 3D图构建
- app.js - 主流程与UI

---

**版本**: 1.0.0  
**最后更新**: 2025-12-01
