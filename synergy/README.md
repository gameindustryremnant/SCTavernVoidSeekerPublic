# 星际酒馆卡牌协同分析工具

这是一个独立的3D可视化工具，用于分析星际酒馆PVP中的卡牌协同关系。

## 🚀 快速开始

### 启动应用

从项目根目录运行以下命令之一：

**使用 Python 3**:
```bash
python -m http.server 8000
```

**使用 Node.js**:
```bash
npx http-server -p 8000
```

然后在浏览器中访问：
```
http://localhost:8000/synergy/
```

## 📋 文件说明

| 文件 | 说明 |
|------|------|
| **index.html** | 应用入口点 |
| **app.js** | 核心应用逻辑和计算引擎 |
| **app.css** | 样式表 |
| **README.md** | 此文件 |
| **DOCS.md** | 详细技术文档 |

## ✨ 功能特性

### 1. 加权标签系统
- 每张卡牌有多个带值的标签
- 示例：`"凯拉克斯": {"Protess": 4, "英雄": 4}`

### 2. 三层协同规则
- **同族协同**：相同种族的卡牌获得加成
- **共享标签**：拥有相同标签的卡牌获得加成
- **标签组合**：特定组合（英雄+单位、飞行+飞行等）获得额外加成

### 3. 3D 力导向图
- 节点 = 卡牌（颜色按种族）
- 边 = 协同关系
- 交互：旋转、缩放、点击查看详情

## 🎮 使用方式

1. **选择数据集** - 勾选核心和扩展包
2. **设置过滤** - 按种族或标签筛选
3. **观察3D图** - 鼠标交互探索关系
4. **点击节点** - 查看详细信息和协同卡牌

## 📊 文件结构

```
synergy/
├── index.html          # 应用入口
├── app.js              # 核心逻辑
├── app.css             # 样式
├── README.md           # 此文件
└── DOCS.md             # 详细文档

../data/
├── tags.json           # 卡牌标签定义
├── core.json           # 核心卡牌
└── pack*.json          # 扩展包
```

## 🔧 自定义

### 修改标签权重
编辑 `../data/tags.json`

### 修改协同规则
编辑 `app.js` 中的 `SYNERGY_RULES` 数组

### 修改价值乘数
编辑 `app.js` 中的 `VALUE_MULTIPLIERS` 对象

## 📚 文档

详细的技术文档和使用指南请参考 `DOCS.md`

## 🌐 浏览器要求

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

需要 WebGL 和 ES6 JavaScript 支持

## 💡 调试

在浏览器控制台 (F12) 中：

```javascript
// 查看应用状态
window.SynergyApp.state

// 重新计算协同
window.SynergyApp.calculateAllSynergies()

// 重新渲染
window.SynergyApp.renderAll()
```

---

**版本**: 1.0.0  
**最后更新**: 2025-12-01
