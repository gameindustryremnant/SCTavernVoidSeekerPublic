# 项目文件重新组织 - 协同分析工具

## 📁 新的项目结构

```
SCTavernVoidSeekerPublic/
│
├── 原始应用文件（保持不变）
│   ├── index.html                # 原始猜牌应用
│   ├── app.js
│   ├── styles.css
│   └── README.md
│
├── 📦 synergy/                   # ✨ 新增：协同分析工具（独立文件夹）
│   ├── index.html                # 应用入口（改名为 index.html）
│   ├── app.js                    # 应用逻辑（改名为 app.js）
│   ├── app.css                   # 样式表（改名为 app.css）
│   ├── README.md                 # 快速参考
│   └── DOCS.md                   # 详细文档
│
├── data/                         # 数据文件（共享）
│   ├── core.json                 # 核心卡牌
│   ├── pack1-8.json              # 扩展包
│   └── tags.json                 # ✨ 新增：卡牌标签定义
│
└── 其他文件
    ├── README_SYNERGY.md         # 协同工具总览（可选）
    └── ...
```

## 🔄 变更说明

### 原始应用（未修改）
- `index.html` - 保持在根目录，用于猜牌功能
- `app.js`, `styles.css` - 保持在根目录
- 完全独立运行，无任何影响

### 协同分析工具（新增独立文件夹）
- 所有文件移到 `synergy/` 文件夹
- 访问地址：`http://localhost:8000/synergy/`
- 自动生成的 `index.html` 作为该文件夹的入口

### 共享数据文件
- `data/` 文件夹保持在根目录
- 两个应用共享使用
- `tags.json` 新增用于标签定义

## 🚀 如何使用

### 启动原始应用（猜牌工具）
```bash
python -m http.server 8000
# 访问：http://localhost:8000/
```

### 启动协同分析工具
```bash
python -m http.server 8000
# 访问：http://localhost:8000/synergy/
```

### 同时运行两个应用
两个应用可以并行运行，互不影响！

## 📋 文件映射

### 原位置 → 新位置

| 原位置 | 新位置 | 说明 |
|--------|--------|------|
| (根目录) | (保持不变) | 原始猜牌应用 |
| synergy.html | synergy/index.html | 重命名为 index.html |
| synergy.js | synergy/app.js | 重命名为 app.js |
| synergy.css | synergy/app.css | 重命名为 app.css |
| (新增) | synergy/README.md | 快速参考 |
| (新增) | synergy/DOCS.md | 详细文档 |
| (新增) | data/tags.json | 标签定义 |

## 🔧 路径更新

### 在 synergy/app.js 中

旧路径（根目录）：
```javascript
"data/core.json"
```

新路径（synergy 子文件夹）：
```javascript
"../data/core.json"    // 上升一级目录
```

所有数据加载路径都已自动更新！

## 💡 优势

### 组织清晰
- 原始应用和新工具完全隔离
- 易于维护和理解项目结构

### 独立性强
- 协同工具完全独立运行
- 不影响原始应用任何代码
- 可独立更新和扩展

### 易于导航
- 访问 `/synergy/` 即可使用新工具
- 访问 `/` 即可使用原始应用

### 便于部署
- 可单独部署协同工具
- GitHub Pages 完全兼容
- 可通过子文件夹访问

## 📖 文档位置

| 文档 | 位置 | 内容 |
|------|------|------|
| 快速开始 | `synergy/README.md` | 5分钟快速上手 |
| 详细文档 | `synergy/DOCS.md` | 完整技术文档 |
| API 参考 | `synergy/DOCS.md#api-参考` | 方法和属性 |
| 自定义指南 | `synergy/DOCS.md#自定义指南` | 如何修改 |

## 🔍 项目统计

| 项目 | 文件数 | 代码行数 |
|------|--------|---------|
| 原始应用 | 3 | ~458 |
| 协同工具 | 5 | ~475 |
| 文档 | 4 | ~1000+ |
| **总计** | **12** | **~1950+** |

## ✨ 新功能概览

### 加权标签系统
- 每张卡牌有多个加权标签
- `data/tags.json` 中定义

### 三层协同规则
1. **同族协同** - 相同种族
2. **共享标签** - 共同特性
3. **标签组合** - 特定组合奖励

### 价值乘数系统
- 英雄 > 飞行 > 法术 > ...
- 自定义加权

### 3D 可视化
- 3d-force-graph 库
- WebGL 加速
- 交互式探索

## 🎯 后续步骤

1. **启动服务器**
   ```bash
   python -m http.server 8000
   ```

2. **测试原始应用**
   ```
   http://localhost:8000/
   ```

3. **测试新工具**
   ```
   http://localhost:8000/synergy/
   ```

4. **自定义配置**
   - 编辑 `data/tags.json` 调整标签
   - 编辑 `synergy/app.js` 修改规则

## 📞 获取帮助

- **快速问题**：查看 `synergy/README.md`
- **技术问题**：查看 `synergy/DOCS.md`
- **调试技巧**：浏览器 F12 控制台

## ✅ 检查清单

- ✅ 原始应用保持不变
- ✅ 协同工具独立文件夹
- ✅ 所有路径正确更新
- ✅ 完整文档齐全
- ✅ 两个应用可并行运行
- ✅ GitHub Pages 兼容

---

**组织完成日期**: 2025-12-01  
**协同工具版本**: 1.0.0
