# Modular Architecture - app.js Split

The main `app.js` has been split into 4 separate modular files for better code organization and maintainability.

## Module Breakdown

### 1. **dataLoader.js** - Data Loading
Handles all JSON file loading operations.

**Key Functions:**
- `DataLoader.loadTags()` - Load card tags from `../data/tags.json`
- `DataLoader.loadCoreCards()` - Load core cards from `../data/core.json`
- `DataLoader.loadExpansionPack(packIndex)` - Load a specific expansion pack (1-8)
- `DataLoader.loadSelectedPacks(selectedPackIndices)` - Load multiple packs
- `DataLoader.loadAllData(selectedPackIndices)` - Load tags + core + selected packs

**Usage in app.js:**
```javascript
const data = await window.DataLoader.loadAllData(selectedPacks);
this.state.cardTags = data.tags;
this.state.cards = data.cards;
```

---

### 2. **synergyRules.js** - Synergy Calculation (Step 1)
Contains hard-coded synergy rules and calculates base synergy points.

**Key Components:**
- `SynergyRules.rules` - Array of 3 rule definitions:
  1. **same_race** - Cards of same race get a bonus
  2. **shared_tag** - Cards sharing tags combine values
  3. **tag_combos** - Specific tag combinations get bonuses (英雄+单位, 飞行+飞行, etc.)

**Key Functions:**
- `SynergyRules.calculateSynergy(card1, card2, tags1, tags2)` - Calculate raw synergy points

**Usage in app.js:**
```javascript
const rawSynergy = window.SynergyRules.calculateSynergy(card1, card2, tags1, tags2);
```

---

### 3. **synergyWeighter.js** - Weight Application (Step 2)
Contains hard-coded value multipliers and applies weighted calculations.

**Key Components:**
- `SynergyWeighter.multipliers` - Object with tag-based multipliers:
  - 英雄: 2.0, 飞行: 1.8, 法术: 1.6, 近战: 1.4, etc.

**Key Functions:**
- `SynergyWeighter.calculateTagWeight(tags1, tags2)` - Calculate multiplier based on shared tags
- `SynergyWeighter.applyWeights(rawSynergy, tags1, tags2)` - Apply multiplier to raw synergy
- `SynergyWeighter.getMultiplier(tag)` - Get specific tag multiplier
- `SynergyWeighter.setMultiplier(tag, value)` - Update multiplier

**Usage in app.js:**
```javascript
const weightedSynergy = window.SynergyWeighter.applyWeights(rawSynergy, tags1, tags2);
```

---

### 4. **graphBuilder.js** - Graph Construction (Step 3)
Builds 3D force-directed graph data from weighted synergy points.

**Key Functions:**
- `GraphBuilder.buildGraphData(cards, cardTags, synergies)` - Create nodes and links
- `GraphBuilder.buildLinks(synergies)` - Create links from synergies (max 5 per card)
- `GraphBuilder.getColorByRace(race)` - Get color code for race
- `GraphBuilder.filterNodesByRace(nodes, race)` - Filter nodes by race
- `GraphBuilder.filterNodesByTag(nodes, tag)` - Filter nodes by tag
- `GraphBuilder.filterLinks(links, visibleNodes)` - Filter links to visible nodes
- `GraphBuilder.applyFilters(graphData, raceFilter, tagFilter)` - Apply all filters

**Usage in app.js:**
```javascript
const graphData = window.GraphBuilder.buildGraphData(cards, cardTags, synergies);
const filteredData = window.GraphBuilder.applyFilters(graphData, raceFilter, tagFilter);
```

---

## Calculation Flow (app.js)

The main `app.js` orchestrates the modular flow:

```
calculateAllSynergies()
  ↓
  ├─→ Step 1: SynergyRules.calculateSynergy()      [Raw synergy points]
  │    └─→ Apply 3 hard-coded rules
  │
  ├─→ Step 2: SynergyWeighter.applyWeights()       [Weighted synergy points]
  │    └─→ Apply tag-based multipliers
  │
  └─→ Step 3: GraphBuilder.buildGraphData()        [3D graph structure]
       └─→ Create nodes and links for visualization
```

---

## Script Loading Order (index.html)

Scripts are loaded in dependency order:

1. **Three.js** & **3d-force-graph** (CDN libraries)
2. **dataLoader.js** (no dependencies)
3. **synergyRules.js** (no dependencies)
4. **synergyWeighter.js** (no dependencies)
5. **graphBuilder.js** (no dependencies)
6. **app.js** (depends on all modules above)

---

## Key Features

✅ **Separation of Concerns** - Each module has a single responsibility
✅ **Reusability** - Modules can be tested and modified independently
✅ **Maintainability** - Easy to locate and update specific logic
✅ **Extensibility** - Add new rules or multipliers without touching main logic
✅ **Global Access** - All modules available via `window` object

---

## Customization Examples

### Add a new synergy rule:
```javascript
// In synergyRules.js, add to SynergyRules.rules array
{
  rule: "my_custom_rule",
  calculate: (card1, card2, tags1, tags2) => {
    // Your rule logic
    return synergy;
  }
}
```

### Update a multiplier:
```javascript
// In synergyWeighter.js, or at runtime:
window.SynergyWeighter.setMultiplier("新标签", 2.5);
```

### Add new filter:
```javascript
// In graphBuilder.js, add filter function and call in applyFilters()
filterNodesByLevel(nodes, level) {
  if (!level) return nodes;
  return nodes.filter(n => n.level === level);
}
```

---

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| dataLoader.js | ~70 | Load JSON card data and tags |
| synergyRules.js | ~100 | Define and calculate synergy rules |
| synergyWeighter.js | ~80 | Apply multipliers to synergy points |
| graphBuilder.js | ~130 | Build 3D graph from synergy data |
| app.js | ~350 | Orchestrate modules + UI rendering |
| **Total Modular Code** | **~730** | Modular code (vs 475 in monolithic) |
