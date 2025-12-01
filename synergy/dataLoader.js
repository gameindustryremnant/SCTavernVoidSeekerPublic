/**
 * DataLoader.js
 * Handles loading JSON files (card data, tags, expansion packs)
 */

const DataLoader = {
  /**
   * Load card tags from tags.json
   * @returns {Promise<Object>} Object mapping cardId -> tags
   */
  async loadTags() {
    try {
      const tagsResp = await fetch("../data/tags.json");
      const tagsData = await tagsResp.json();
      return tagsData.cardTags || {};
    } catch (error) {
      console.error("Error loading tags:", error);
      throw error;
    }
  },

  /**
   * Load core cards from core.json
   * @returns {Promise<Array>} Array of card objects
   */
  async loadCoreCards() {
    try {
      const resp = await fetch("../data/core.json");
      const data = await resp.json();
      return (data.cards && Array.isArray(data.cards)) ? data.cards : [];
    } catch (error) {
      console.error("Error loading core cards:", error);
      throw error;
    }
  },

  /**
   * Load expansion pack by index (1-8)
   * @param {number} packIndex - The pack index (1-8)
   * @returns {Promise<Array>} Array of card objects
   */
  async loadExpansionPack(packIndex) {
    const packFiles = {
      1: "../data/pack1JunBeiJingSai.json",
      2: "../data/pack2ZuoZhanJiHua.json",
      3: "../data/pack3JuanTuChongLai.json",
      4: "../data/pack4ShiBuWoDai.json",
      5: "../data/pack5ChongZhuangShangZhen.json",
      6: "../data/pack6QiongBingDuWu.json",
      7: "../data/pack7YiNianZhiCha.json"
    };

    const file = packFiles[packIndex];
    if (!file) {
      console.error(`Invalid pack index: ${packIndex}`);
      return [];
    }

    try {
      const resp = await fetch(file);
      const data = await resp.json();
      return (data.cards && Array.isArray(data.cards)) ? data.cards : [];
    } catch (error) {
      console.error(`Error loading expansion pack ${packIndex}:`, error);
      throw error;
    }
  },

  /**
   * Load all selected expansion packs
   * @param {Array<number>} selectedPackIndices - Array of pack indices (1-8)
   * @returns {Promise<Array>} Combined array of all cards from selected packs
   */
  async loadSelectedPacks(selectedPackIndices) {
    let allCards = [];
    for (const packIndex of selectedPackIndices) {
      const cards = await this.loadExpansionPack(packIndex);
      allCards.push(...cards);
    }
    return allCards;
  },

  /**
   * Load all data: tags + core + selected packs
   * @param {Array<number>} selectedPackIndices - Array of pack indices (1-8)
   * @returns {Promise<Object>} Object with { tags, cards }
   */
  async loadAllData(selectedPackIndices = []) {
    try {
      const tags = await this.loadTags();
      let cards = await this.loadCoreCards();

      if (selectedPackIndices && selectedPackIndices.length > 0) {
        const packCards = await this.loadSelectedPacks(selectedPackIndices);
        cards.push(...packCards);
      }

      return { tags, cards };
    } catch (error) {
      console.error("Error loading all data:", error);
      throw error;
    }
  }
};

// Global export
window.DataLoader = DataLoader;
