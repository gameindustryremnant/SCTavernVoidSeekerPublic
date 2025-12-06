(function(){
"use strict";

const RACES = ["Protess", "Zerg", "Terran", "Neutral"];

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
      ["expPack7", this.els.expPack7Toggle]
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

  /**
   * Load data using DataLoader module
   */
  async loadData() {
    try {
      const selectedPacks = this.getSelectedPackIndices();
      const data = await window.DataLoader.loadAllData(selectedPacks);

      this.state.cardTags = data.tags;
      this.state.cards = data.cards;

      this.els.datasetInfo.textContent = `已载入 总卡牌数: ${this.state.cards.length}`;
    } catch (error) {
      console.error("Error loading data:", error);
      this.els.datasetInfo.textContent = "加载失败: " + error.message;
    }
  },

  /**
   * Get selected pack indices from UI checkboxes
   */
  getSelectedPackIndices() {
    const packs = [];
    for (let i = 1; i <= 8; i++) {
      const el = this.els[`expPack${i}Toggle`];
      if (el && el.checked) {
        packs.push(i);
      }
    }
    return packs;
  },

  /**
   * Calculate all synergies using SynergyRules and SynergyWeighter modules
   */
  calculateAllSynergies() {
    // Step 1: Find all cards matching each synergy rule
    const ruleMatches = window.SynergyRules.findAllMatches(this.state.cards, this.state.cardTags);

    // Step 2: Calculate synergies from matched rule pairs
    this.state.synergies = window.SynergyWeighter.calculateSynergiesFromRules(
      this.state.cards,
      this.state.cardTags,
      ruleMatches
    );

    console.log("Synergies calculated:", this.state.synergies);

    // Step 3: Build graph using GraphBuilder
    this.buildGraphData();
  },

  /**
   * Build graph data using GraphBuilder module
   */
  buildGraphData() {
    this.state.graph = window.GraphBuilder.buildGraphData(
      this.state.cards,
      this.state.cardTags,
      this.state.synergies
    );
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

  /**
   * Render graph using GraphBuilder and 3d-force-graph library
   */
  renderGraph() {
    if (!window.ForceGraph3D) return; // 3d-force-graph not loaded

    const container = this.els.graphContainer;
    if (!container) return;

    // Get filter values
    const raceFilter = this.els.raceFilter ? this.els.raceFilter.value : "";
    const tagFilter = this.els.tagFilter ? this.els.tagFilter.value : "";

    // Apply filters using GraphBuilder
    const filteredData = window.GraphBuilder.applyFilters(
      this.state.graph,
      raceFilter,
      tagFilter
    );

    const graph = ForceGraph3D()(container)
      .graphData({ nodes: filteredData.nodes, links: filteredData.links })
      .nodeColor(node => node.color)
      .nodeVal(node => node.val)
      .nodeLabel(node => `${node.label} (${node.race}, Lv${node.level})`)
      .linkWidth(link => link.width || 1)
      .linkColor(() => "rgba(200,200,200,0.3)")
      .onNodeClick(node => {
        this.showCardDetails(node.id);
      });
    
    // Configure link distance using d3Force
    graph.d3Force('link').distance(link => link.distance || 30);
  },

  showCardDetails(cardId) {
    const card = this.state.cards.find(c => c.id === cardId);
    if (!card) return;

    const tags = this.state.cardTags[cardId] || {};
    const synergies = this.state.synergies[cardId] || [];

    // Build a map of aggregated synergies between card pairs
    const aggregatedSynergies = new Map();
    
    // Add synergies where this card is the source
    for (const syn of synergies) {
      const key = [cardId, syn.targetId].sort().join("-");
      if (!aggregatedSynergies.has(key)) {
        aggregatedSynergies.set(key, { targetId: syn.targetId, points: 0 });
      }
      aggregatedSynergies.get(key).points += syn.points;
    }
    
    // Add synergies where this card is the target (from other cards)
    for (const otherCardId in this.state.synergies) {
      if (otherCardId === cardId) continue;
      const otherSynergies = this.state.synergies[otherCardId];
      for (const syn of otherSynergies) {
        if (syn.targetId === cardId) {
          const key = [otherCardId, cardId].sort().join("-");
          if (!aggregatedSynergies.has(key)) {
            aggregatedSynergies.set(key, { targetId: otherCardId, points: 0 });
          }
          aggregatedSynergies.get(key).points += syn.points;
        }
      }
    }

    // Convert to array and sort by points descending
    const aggregatedArray = Array.from(aggregatedSynergies.values())
      .sort((a, b) => b.points - a.points);

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
        
        <h4>协同规则</h4>
        <div class="rule-synergies-list">
    `;

    if (aggregatedArray.length > 0) {
      aggregatedArray.slice(0, 10).forEach(syn => {
        const targetCard = this.state.cards.find(c => c.id === syn.targetId);
        if (targetCard) {
          html += `<div class="rule-synergy-item">
            <span><strong>${targetCard.id}</strong></span>
            <span class="synergy-points">协同点: ${Math.round(syn.points)}</span>
          </div>`;
        }
      });
    } else {
      html += `<p>无协同规则</p>`;
    }

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
