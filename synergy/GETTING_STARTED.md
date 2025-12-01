# 🚀 如何访问协同分析工具

## 快速启动

### 1. 启动本地服务器

从项目根目录（`SCTavernVoidSeekerPublic`）运行：

```bash
python -m http.server 8000
```

或

```bash
npx http-server -p 8000
```

### 2. 在浏览器中打开

**协同分析工具：**
```
http://localhost:8000/synergy/
```

**原始猜牌应用：**
```
http://localhost:8000/
```

## 📁 文件说明

| 文件 | 作用 |
|------|------|
| **index.html** | 应用入口页面 |
| **app.js** | 核心应用逻辑和计算引擎 |
| **app.css** | 响应式样式表 |
| **README.md** | 快速参考指南 |
| **DOCS.md** | 详细技术文档 |

## 🔗 相关文档

- 📖 **快速参考** → `README.md`
- 📚 **详细文档** → `DOCS.md`
- 📋 **项目组织** → `../ORGANIZATION.md`

## ⚙️ 数据文件

应用使用的数据文件位于项目根目录的 `data/` 文件夹：

- `core.json` - 89张核心卡牌
- `pack1-8.json` - 扩展包卡牌
- `tags.json` - 卡牌标签定义

## 💻 浏览器要求

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

必须支持 WebGL 和 ES6 JavaScript

## 🎯 功能概览

- ✅ 3D 协同关系可视化
- ✅ 加权标签系统
- ✅ 多层协同规则
- ✅ 实时数据集切换
- ✅ 种族和标签过滤
- ✅ 卡牌详情面板

## 🔧 自定义

编辑以下文件来自定义应用：

1. **标签定义** → `../data/tags.json`
2. **协同规则** → `app.js` (SYNERGY_RULES)
3. **价值乘数** → `app.js` (VALUE_MULTIPLIERS)
4. **颜色方案** → `app.css`

## 📞 遇到问题？

1. **应用不加载？** 
   - 检查是否用 HTTP 服务器访问（不能用 file://）
   - 检查浏览器控制台错误信息（F12）

2. **3D 图表不显示？**
   - 检查浏览器是否支持 WebGL
   - 尝试用其他浏览器

3. **数据加载失败？**
   - 确认 `data/` 文件夹存在
   - 检查 Network 标签页

更多帮助见 `DOCS.md`

---

**当前版本**: 1.0.0  
**最后更新**: 2025-12-01
