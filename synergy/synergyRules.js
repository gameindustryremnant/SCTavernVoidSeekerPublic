/**
 * SynergyRules.js
 * Contains hard-coded synergy rules and finds matching cards based on tag criteria
 */

const SynergyRules = {
  /**
   * Hard-coded synergy rule definitions
   * Each rule has a match function that finds all cards matching the rule criteria
   */
  rules: [
    {
      rule: "Terran_race",
      description: "Terran race synergy: cards with Terran race",
      match: (allCards, cardTagsMap) => {
        return allCards.filter(card => card.race === "Terran");
      }
    },
    {
      rule: "任务流",
      description: "Task Chain synergy: cards with 人族任务流 or 人族任务流核心 tags",
      match: (allCards, cardTagsMap) => {
        return allCards.filter(card => {
          const tags = cardTagsMap[card.id] || {};
          return tags["人族任务流"] || tags["人族任务流核心"];
        });
      }
    },
    {
      rule: "人族生化",
      description: "Terran Biotech synergy: cards with 人族生化 tag",
      match: (allCards, cardTagsMap) => {
        return allCards.filter(card => {
          const tags = cardTagsMap[card.id] || {};
          return tags["人族生化"];
        });
      }
    },
    {
      rule: "人族机械化",
      description: "Terran Mechanization synergy: cards with 人族机械化 tag",
      match: (allCards, cardTagsMap) => {
        return allCards.filter(card => {
          const tags = cardTagsMap[card.id] || {};
          return tags["人族机械化"];
        });
      }
    },
    {
      rule: "Zerg_race",
      description: "Zerg race synergy: cards with Zerg race",
      match: (allCards, cardTagsMap) => {
        return allCards.filter(card => card.race === "Zerg");
      }
    },

    {
      rule: "Protess_race",
      description: "Protess race synergy: cards with Protess race",
      match: (allCards, cardTagsMap) => {
        return allCards.filter(card => card.race === "Protess");
      }
    },

    {
      rule: "Neutral_race",
      description: "Neutral race synergy: cards with Neutral race",
      match: (allCards, cardTagsMap) => {
        return allCards.filter(card => card.race === "Neutral");
      }
    },
    {
      rule: "刷牌",
      description: "刷牌 synergy: cards with 刷牌 tag",
      match: (allCards, cardTagsMap) => {
        return allCards.filter(card => {
          const tags = cardTagsMap[card.id] || {};
          return tags["刷牌"];
        });
      }
    }
  ],

  /**
   * Find all cards matching a specific rule
   * @param {string} ruleName - Name of the rule to match
   * @param {Array} allCards - All cards to search through
   * @param {Object} cardTagsMap - Mapping of cardId -> tags
   * @param {Object} focusCard - Optional card to use as context for relative matching
   * @returns {Array} Array of cards matching the rule
   */
  findMatchingCards(ruleName, allCards, cardTagsMap, focusCard = null) {
    const ruleObj = this.rules.find(r => r.rule === ruleName);
    if (!ruleObj) {
      console.warn(`Rule "${ruleName}" not found`);
      return [];
    }

    try {
      return ruleObj.match(allCards, cardTagsMap, focusCard) || [];
    } catch (error) {
      console.error(`Error matching rule "${ruleName}":`, error);
      return [];
    }
  },

  /**
   * Find all cards matching all rules and return grouped results
   * @param {Array} allCards - All cards to search through
   * @param {Object} cardTagsMap - Mapping of cardId -> tags
   * @returns {Object} Object mapping ruleName -> matchedCards array
   */
  findAllMatches(allCards, cardTagsMap) {
    const results = {};
    for (const ruleObj of this.rules) {
      try {
        results[ruleObj.rule] = ruleObj.match(allCards, cardTagsMap) || [];
      } catch (error) {
        console.error(`Error matching rule "${ruleObj.rule}":`, error);
        results[ruleObj.rule] = [];
      }
    }
    return results;
  }
};

// Global export
window.SynergyRules = SynergyRules;
