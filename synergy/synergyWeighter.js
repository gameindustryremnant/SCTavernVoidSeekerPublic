/**
 * SynergyWeighter.js
 * Contains hard-coded value multipliers and calculates weighted synergy points
 */

const SynergyWeighter = {
  /**
   * Hard-coded value multiplier preferences
   * Higher multiplier = higher valued synergy contribution
   */
  multipliers: {
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
  },

  /**
   * Calculate tag weight based on shared tags between two cards
   * @param {Object} tags1 - Tags of first card
   * @param {Object} tags2 - Tags of second card
   * @returns {number} Multiplier value (starts at 1.0)
   */
  calculateTagWeight(tags1, tags2) {
    let multiplier = 1;
    for (const tag in tags1) {
      if (tags2[tag]) {
        multiplier += (this.multipliers[tag] || 1) * 0.1;
      }
    }
    return multiplier;
  },

  /**
   * Calculate weighted synergy points
   * Takes raw synergy points and applies tag-based multiplier
   * @param {number} rawSynergy - Base synergy points from rules
   * @param {Object} tags1 - Tags of first card
   * @param {Object} tags2 - Tags of second card
   * @returns {number} Weighted synergy points
   */
  applyWeights(rawSynergy, tags1, tags2) {
    const weight = this.calculateTagWeight(tags1, tags2);
    return rawSynergy * weight;
  },

  /**
   * Get multiplier for a specific tag
   * @param {string} tag - Tag name
   * @returns {number} Multiplier value for the tag
   */
  getMultiplier(tag) {
    return this.multipliers[tag] || 1;
  },

  /**
   * Get all multipliers
   * @returns {Object} All tag multipliers
   */
  getMultipliers() {
    return this.multipliers;
  },

  /**
   * Update a multiplier value
   * @param {string} tag - Tag name
   * @param {number} value - New multiplier value
   */
  setMultiplier(tag, value) {
    this.multipliers[tag] = value;
  }
};

// Global export
window.SynergyWeighter = SynergyWeighter;
