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

        // Step 1: Calculate raw synergy points using SynergyRules
        const rawSynergy = window.SynergyRules.calculateSynergy(card1, card2, tags1, tags2);

        // Step 2: Apply weights using SynergyWeighter to get final weighted synergy
        const weightedSynergy = window.SynergyWeighter.applyWeights(rawSynergy, tags1, tags2);

        if (weightedSynergy > 0) {
          this.state.synergies[card1.id].push({
            targetId: card2.id,
            points: weightedSynergy
          });
        }
      }

      // Sort by synergy points descending
      this.state.synergies[card1.id].sort((a, b) => b.points - a.points);
    }

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
