/**
 * SynergyWeighter.js
 * Contains custom weight calculation rules and calculates weighted synergy for card groups
 */

const SynergyWeighter = {
  /**
   * Custom weight calculation rules
   * Each rule calculates synergy between two cards based on their tags
   * The calculate function takes (card1, card2, tags1, tags2) and returns synergy points
   */
  weightRules: [
    {
      rule: "任务流",
      description: "Task Chain weight: 人族任务流 tag value + 人族任务流核心 * 2",
      calculate: (card1, card2, tags1, tags2) => {
        const val1 = (tags1["人族任务流"] || 0) + (tags1["人族任务流核心"] || 0) * 2;
        const val2 = (tags2["人族任务流"] || 0) + (tags2["人族任务流核心"] || 0) * 2;
        return val1 + val2;
      }
    },
 
 
    {
      rule: "same_race",
      description: "Same race weight: race bonus for cards of same race",
      calculate: (card1, card2, tags1, tags2) => {
        if (card1.race !== card2.race) return 0;
        // Base bonus for same race match
        return 50;
      }
    }
  ],

  /**
   * Calculate synergy between two cards based on all applicable weight rules
   * @param {Object} card1 - First card object
   * @param {Object} card2 - Second card object
   * @param {Object} tags1 - Tags of first card
   * @param {Object} tags2 - Tags of second card
   * @returns {number} Total weighted synergy points
   */
  calculatePairSynergy(card1, card2, tags1, tags2) {
    let totalSynergy = 0;
    for (const rule of this.weightRules) {
      try {
        const synergy = rule.calculate(card1, card2, tags1, tags2);
        totalSynergy += synergy;
      } catch (error) {
        console.error(`Error in weight rule "${rule.rule}":`, error);
      }
    }
    return totalSynergy;
  },



  /**
   * Get all weight rules
   * @returns {Array} Array of weight rule definitions
   */
  getWeightRules() {
    return this.weightRules;
  },

  /**
   * Add a new weight rule dynamically
   * @param {string} ruleName - Unique name for the rule
   * @param {string} description - Human-readable description
   * @param {Function} calculateFunction - Function(card1, card2, tags1, tags2) -> synergy points
   */
  addWeightRule(ruleName, description, calculateFunction) {
    this.weightRules.push({
      rule: ruleName,
      description: description,
      calculate: calculateFunction
    });
  }
};

// Global export
window.SynergyWeighter = SynergyWeighter;
