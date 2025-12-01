/**
 * SynergyRules.js
 * Contains hard-coded synergy rules and calculates base synergy points
 */

const SynergyRules = {
  /**
   * Hard-coded synergy rule definitions
   * Each rule has a calculate function that returns synergy points
   */
  rules: [
    {
      rule: "same_race",
      description: "Same-race synergy: both cards of same race get a bonus",
      calculate: (card1, card2, tags1, tags2) => {
        if (card1.race !== card2.race) return 0;
        const raceTag = card1.race;
        const val1 = tags1[raceTag] || 0;
        const val2 = tags2[raceTag] || 0;
        return (val1 + val2) * 2; // shared race multiplier
      }
    },
    {
      rule: "shared_tag",
      description: "Shared tag synergy: if both have same tag, combine values",
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
    {
      rule: "tag_combos",
      description: "Tag combination synergy: specific tag combos get bonus",
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
  ],

  /**
   * Calculate synergy points between two cards based on all rules
   * @param {Object} card1 - First card object
   * @param {Object} card2 - Second card object
   * @param {Object} tags1 - Tags of first card (cardId -> tags mapping)
   * @param {Object} tags2 - Tags of second card (cardId -> tags mapping)
   * @returns {number} Raw synergy points (before multiplier weighting)
   */
  calculateSynergy(card1, card2, tags1, tags2) {
    // Ensure tag values used for numeric calculations are numbers.
    // Some tag sources include non-numeric entries (e.g. "pack": "核心").
    // Convert numeric-like values to numbers and treat others as 0 to avoid NaN.
    const normalizeTags = (tags) => {
      const out = {};
      for (const k in tags) {
        const v = tags[k];
        const n = Number(v);
        out[k] = Number.isFinite(n) ? n : 0;
      }
      return out;
    };

    const nTags1 = normalizeTags(tags1 || {});
    const nTags2 = normalizeTags(tags2 || {});

    let totalSynergy = 0;
    for (const ruleObj of this.rules) {
      const synergy = ruleObj.calculate(card1, card2, nTags1, nTags2);
      totalSynergy += synergy;
    }

    return totalSynergy;
  },

  /**
   * Get all available rules
   * @returns {Array} Array of rule definitions
   */
  getRules() {
    return this.rules;
  }
};

// Global export
window.SynergyRules = SynergyRules;
