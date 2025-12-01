(function(){
"use strict";

const RACES = ["Protess", "Zerg", "Terran", "Neutral"];

// Hard-coded synergy rules
// Format: { rule: string, config: object }
const SYNERGY_RULES = [
  // Same-race synergy: both cards of same race get a bonus
  {
    rule: "same_race",
    calculate: (card1, card2, tags1, tags2) => {
      if (card1.race !== card2.race) return 0;
      const raceTag = card1.race;
      const val1 = tags1[raceTag] || 0;
      const val2 = tags2[raceTag] || 0;
      return (val1 + val2) * 2; // shared race multiplier
    }
  },
  // Shared tag synergy: if both have same tag, combine values
  {
    rule: "shared_tag",
    calculate: (card1, card2, tags1, tags2) => {
      let synergy = 0;
      for (const tag in tags1) {
        if (tag in tags2 && tag !== card1.race && tag !== card2.race) {
          synergy += (tags1[tag] + tags2[tag]) * 1.5;
        }
      }
      return synergy;
    }
  },
  // Tag combination synergy: specific tag combos get bonus
  {
    rule: "tag_combos",
    calculate: (card1, card2, tags1, tags2) => {
      let synergy = 0;
      
      // 英雄 + 单位 combo: heroes support units
      if ((tags1["英雄"] && tags2["单位"]) || (tags2["英雄"] && tags1["单位"])) {
        const heroVal = (tags1["英雄"] || 0) + (tags2["英雄"] || 0);
        const unitVal = (tags1["单位"] || 0) + (tags2["单位"] || 0);
        synergy += (heroVal + unitVal) * 1.3;
      }
      
      // 飞行 + 飞行 combo: air superiority
      if (tags1["飞行"] && tags2["飞行"]) {
        synergy += (tags1["飞行"] + tags2["飞行"]) * 2;
      }
      
      // 法术 + 近战 combo: complementary tactics
      if ((tags1["法术"] && tags2["近战"]) || (tags2["法术"] && tags1["近战"])) {
        const spellVal = (tags1["法术"] || 0) + (tags2["法术"] || 0);
        const meleeVal = (tags1["近战"] || 0) + (tags2["近战"] || 0);
        synergy += (spellVal + meleeVal) * 1.2;
      }
      
      // 建筑 + 单位 combo: infrastructure support
      if ((tags1["建筑"] && tags2["单位"]) || (tags2["建筑"] && tags1["单位"])) {
        const buildVal = (tags1["建筑"] || 0) + (tags2["建筑"] || 0);
        const unitVal = (tags1["单位"] || 0) + (tags2["单位"] || 0);
        synergy += (buildVal + unitVal) * 0.8;
      }
      
      return synergy;
    }
  }
];

// Hard-coded value multiplier preferences
// Higher multiplier = higher valued synergy contribution
const VALUE_MULTIPLIERS = {
  "英雄": 2.0,        // Heroes are highly valued
  "飞行": 1.8,        // Air superiority is strong
  "法术": 1.6,        // Magic is valuable
  "近战": 1.4,        // Melee is solid
  "单位": 1.2,        // Units have base value
  "远程": 1.5,        // Ranged support
  "建筑": 1.3,        // Infrastructure support
  "Protess": 1.1,    // Protoss racial bonus
  "Zerg": 1.1,        // Zerg racial bonus
  "Terran": 1.1,      // Terran racial bonus
  "Neutral": 0.9      // Neutral slightly less valuable
};

const SynergyApp = {
  state: {
    cards: [],           // All loaded cards with tags
    cardTags: {},        // Mapping of cardId -> tags
    synergies: {},       // cardId -> array of {targetId, synergyPoints}
    selectedRace: "",
    selectedTag: "",
    graph: {
      nodes: [],
      links: []
    }
  },

  async init() {
    this.cacheEls();
    this.bindEvents();
    await this.loadData();
    this.calculateAllSynergies();
    this.renderAll();
  },

  cacheEls() {
    this.els = {
      coreToggle: document.getElementById("coreToggle"),
      expPack1Toggle: document.getElementById("expPack1Toggle"),
      expPack2Toggle: document.getElementById("expPack2Toggle"),
      expPack3Toggle: document.getElementById("expPack3Toggle"),
      expPack4Toggle: document.getElementById("expPack4Toggle"),
      expPack5Toggle: document.getElementById("expPack5Toggle"),
      expPack6Toggle: document.getElementById("expPack6Toggle"),
      expPack7Toggle: document.getElementById("expPack7Toggle"),
      expPack8Toggle: document.getElementById("expPack8Toggle"),
      datasetInfo: document.getElementById("datasetInfo"),
      raceFilter: document.getElementById("raceFilter"),
      tagFilter: document.getElementById("tagFilter"),
      graphContainer: document.getElementById("graphContainer"),
      cardDetails: document.getElementById("cardDetails"),
      statsPanel: document.getElementById("statsPanel")
    };
  },

  bindEvents() {
    const toggles = [
      ["core", this.els.coreToggle],
      ["expPack1", this.els.expPack1Toggle],
      ["expPack2", this.els.expPack2Toggle],
      ["expPack3", this.els.expPack3Toggle],
      ["expPack4", this.els.expPack4Toggle],
      ["expPack5", this.els.expPack5Toggle],
      ["expPack6", this.els.expPack6Toggle],
      ["expPack7", this.els.expPack7Toggle],
      ["expPack8", this.els.expPack8Toggle]
    ];
    toggles.forEach(([key, el]) => {
      if (!el) return;
      el.addEventListener("change", () => {
        this.loadData().then(() => {
          this.calculateAllSynergies();
          this.renderAll();
        });
      });
    });

    if (this.els.raceFilter) {
      this.els.raceFilter.addEventListener("change", () => {
        this.renderAll();
      });
    }

    if (this.els.tagFilter) {
      this.els.tagFilter.addEventListener("change", () => {
        this.renderAll();
      });
    }
  },

  async loadData() {
    try {
      // Load tags
      const tagsResp = await fetch("../data/tags.json");
      const tagsData = await tagsResp.json();
      this.state.cardTags = tagsData.cardTags || {};

      // Load cards from selected datasets
      const filesToLoad = this.getSelectedDatasets();
      this.state.cards = [];

      for (const file of filesToLoad) {
        const resp = await fetch(file);
        const data = await resp.json();
        if (data.cards && Array.isArray(data.cards)) {
          this.state.cards.push(...data.cards);
        }
      }

      this.els.datasetInfo.textContent = `已载入 总卡牌数: ${this.state.cards.length}`;
    } catch (error) {
      console.error("Error loading data:", error);
      this.els.datasetInfo.textContent = "加载失败: " + error.message;
    }
  },

  getSelectedDatasets() {
    const files = [];
    files.push("../data/core.json"); // always include core

    const packs = [
      ["expPack1", "../data/pack1JunBeiJingSai.json"],
      ["expPack2", "../data/pack2ZuoZhanJiHua.json"],
      ["expPack3", "../data/pack3JuanTuChongLai.json"],
      ["expPack4", "../data/pack4ShiBuWoDai.json"],
      ["expPack5", "../data/pack5ChongZhuangShangZhen.json"],
      ["expPack6", "../data/pack6QiongBingDuWu.json"],
      ["expPack7", "../data/pack7YiNianZhiCha.json"],
      ["expPack8", "../data/pack8MuChangZhiZhan.json"]
    ];

    packs.forEach(([key, file]) => {
      if (this.els[key] && this.els[key].checked) {
        files.push(file);
      }
    });

    return files;
  },

  calculateAllSynergies() {
    this.state.synergies = {};

    for (let i = 0; i < this.state.cards.length; i++) {
      const card1 = this.state.cards[i];
      const tags1 = this.state.cardTags[card1.id] || {};

      if (!this.state.synergies[card1.id]) {
        this.state.synergies[card1.id] = [];
      }

      for (let j = 0; j < this.state.cards.length; j++) {
        if (i === j) continue;

        const card2 = this.state.cards[j];
        const tags2 = this.state.cardTags[card2.id] || {};

        const synergyPoints = this.calculateCardSynergy(card1, card2, tags1, tags2);

        if (synergyPoints > 0) {
          this.state.synergies[card1.id].push({
            targetId: card2.id,
            points: synergyPoints
          });
        }
      }

      // Sort by synergy points descending
      this.state.synergies[card1.id].sort((a, b) => b.points - a.points);
    }

    this.buildGraphData();
  },

  calculateCardSynergy(card1, card2, tags1, tags2) {
    let totalSynergy = 0;

    for (const ruleObj of SYNERGY_RULES) {
      const synergy = ruleObj.calculate(card1, card2, tags1, tags2);
      totalSynergy += synergy;
    }

    // Apply value multipliers based on tags
    let multiplier = 1;
    for (const tag in tags1) {
      if (tags2[tag]) {
        multiplier += (VALUE_MULTIPLIERS[tag] || 1) * 0.1;
      }
    }

    return totalSynergy * multiplier;
  },

  buildGraphData() {
    this.state.graph = { nodes: [], links: [] };
    const nodeMap = new Map();

    // Create nodes for all cards
    for (const card of this.state.cards) {
      const tags = this.state.cardTags[card.id] || {};
      const color = this.getColorByRace(card.race);
      const size = Math.max(10, Math.min(50, card.value / 100)); // Scale by value

      nodeMap.set(card.id, {
        id: card.id,
        label: card.id,
        val: size,
        color: color,
        race: card.race,
        level: card.level,
        value: card.value,
        tags: tags
      });
    }

    this.state.graph.nodes = Array.from(nodeMap.values());

    // Create links for high-synergy pairs (only top connections per card)
    const maxLinksPerCard = 5;
    const linkSet = new Set();

    for (const cardId in this.state.synergies) {
      const synergies = this.state.synergies[cardId].slice(0, maxLinksPerCard);
      for (const synergy of synergies) {
        const linkKey = [cardId, synergy.targetId].sort().join("-");
        if (!linkSet.has(linkKey) && synergy.points > 0) {
          linkSet.add(linkKey);
          this.state.graph.links.push({
            source: cardId,
            target: synergy.targetId,
            value: Math.min(5, synergy.points / 10) // Normalize strength for visualization
          });
        }
      }
    }
  },

  getColorByRace(race) {
    const colors = {
      "Protess": "#0099FF",   // Blue
      "Zerg": "#FF0099",      // Purple
      "Terran": "#FF9900",    // Orange
      "Neutral": "#CCCCCC"    // Gray
    };
    return colors[race] || "#CCCCCC";
  },

  renderAll() {
    this.renderStats();
    this.renderFilters();
    this.renderGraph();
  },

  renderStats() {
    const raceFilter = this.els.raceFilter ? this.els.raceFilter.value : "";
    let filteredCards = this.state.cards;

    if (raceFilter) {
      filteredCards = filteredCards.filter(c => c.race === raceFilter);
    }

    const stats = `
      <p>总卡牌数: <strong>${this.state.cards.length}</strong> | 
      筛选卡牌数: <strong>${filteredCards.length}</strong> | 
      总连接数: <strong>${this.state.graph.links.length}</strong></p>
    `;

    this.els.statsPanel.innerHTML = stats;
  },

  renderFilters() {
    if (!this.els.raceFilter || !this.els.tagFilter) return;

    // Populate race filter
    const raceSelect = this.els.raceFilter;
    if (raceSelect.options.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "所有种族";
      raceSelect.appendChild(option);

      for (const race of RACES) {
        const opt = document.createElement("option");
        opt.value = race;
        opt.textContent = race;
        raceSelect.appendChild(opt);
      }
    }

    // Populate tag filter
    const tagSelect = this.els.tagFilter;
    if (tagSelect.options.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "所有标签";
      tagSelect.appendChild(option);

      const tagsSet = new Set();
      for (const cardId in this.state.cardTags) {
        for (const tag in this.state.cardTags[cardId]) {
          tagsSet.add(tag);
        }
      }

      for (const tag of Array.from(tagsSet).sort()) {
        const opt = document.createElement("option");
        opt.value = tag;
        opt.textContent = tag;
        tagSelect.appendChild(opt);
      }
    }
  },

  renderGraph() {
    if (!window.ForceGraph3D) return; // 3d-force-graph not loaded

    const container = this.els.graphContainer;
    if (!container) return;

    // Filter nodes and links based on selections
    const raceFilter = this.els.raceFilter ? this.els.raceFilter.value : "";
    const tagFilter = this.els.tagFilter ? this.els.tagFilter.value : "";

    let filteredNodes = this.state.graph.nodes;
    let filteredLinks = this.state.graph.links;

    if (raceFilter) {
      filteredNodes = filteredNodes.filter(n => n.race === raceFilter);
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
    }

    if (tagFilter) {
      filteredNodes = filteredNodes.filter(n => n.tags[tagFilter]);
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
    }

    const graph = ForceGraph3D()(container)
      .graphData({ nodes: filteredNodes, links: filteredLinks })
      .nodeColor(node => node.color)
      .nodeVal(node => node.val)
      .nodeLabel(node => `${node.label} (${node.race}, Lv${node.level})`)
      .linkWidth(link => link.value || 1)
      .linkColor(() => "rgba(200,200,200,0.3)")
      .onNodeClick(node => {
        this.showCardDetails(node.id);
      });
  },

  showCardDetails(cardId) {
    const card = this.state.cards.find(c => c.id === cardId);
    if (!card) return;

    const tags = this.state.cardTags[cardId] || {};
    const synergies = this.state.synergies[cardId] || [];

    let html = `
      <div class="card-detail">
        <h3>${card.id}</h3>
        <p><strong>种族:</strong> ${card.race}</p>
        <p><strong>等级:</strong> ${card.level}</p>
        <p><strong>单位数:</strong> ${card.number}</p>
        <p><strong>价值:</strong> ${card.value}</p>
        
        <h4>标签</h4>
        <div class="tags-list">
    `;

    for (const tag in tags) {
      html += `<span class="tag">${tag}: ${tags[tag]}</span>`;
    }

    html += `
        </div>
        
        <h4>协同卡牌 (Top 5)</h4>
        <div class="synergies-list">
    `;

    synergies.slice(0, 5).forEach(syn => {
      const targetCard = this.state.cards.find(c => c.id === syn.targetId);
      if (targetCard) {
        html += `<div class="synergy-item">
          <span>${syn.targetId}</span>
          <span class="synergy-points">+${Math.round(syn.points)}</span>
        </div>`;
      }
    });

    html += `
        </div>
      </div>
    `;

    this.els.cardDetails.innerHTML = html;
  }
};

// Global export
window.SynergyApp = SynergyApp;

})();
