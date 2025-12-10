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
      rule: "Terran_race",
      description: "Terran race weight: bonus for two Terran cards",
      calculate: (card1, card2, tags1, tags2) => {
        if (card1.race === "Terran" && card2.race === "Terran") {
          return 0;
        }
        return 0;
      }
    },
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
      rule: "人族生化",
      description: "Terran Biotech weight: sum of 人族生化 tag values",
      calculate: (card1, card2, tags1, tags2) => {
        const val1 = tags1["人族生化"] || 0;
        const val2 = tags2["人族生化"] || 0;
        return val1 + val2;
      }
    },
    {
      rule: "人族机械化",
      description: "Terran Mechanization weight: sum of 人族机械化 tag values",
      calculate: (card1, card2, tags1, tags2) => {
        const val1 = tags1["人族机械化"] || 0;
        const val2 = tags2["人族机械化"] || 0;
        return val1 + val2;
      }
    },
    {
      rule: "Zerg_race",
      description: "Zerg race weight: bonus for two Zerg cards",
      calculate: (card1, card2, tags1, tags2) => {
        if (card1.race === "Zerg" && card2.race === "Zerg") {
          return 0;
        }
        return 0;
      }
    },
    {
      rule: "Neutral_race",
      description: "Neutral race weight: bonus for two Neutral cards",
      calculate: (card1, card2, tags1, tags2) => {
        if (card1.race === "Neutral" && card2.race === "Neutral") {
          return 0;
        }
        return 0;
      }
    },
    {
      rule: "Protess_race",
      description: "Protess race weight: bonus for two Protess cards",
      calculate: (card1, card2, tags1, tags2) => {
        if (card1.race === "Protess" && card2.race === "Protess") {
          return 0;
        }
        return 0;
      }
    },
    {
      rule: "刷牌",
      description: "刷牌 weight: sum of 刷牌 tag values",
      calculate: (card1, card2, tags1, tags2) => {
        const val1 = tags1["刷牌"] || 0;
        const val2 = tags2["刷牌"] || 0;
        return val1 + val2;
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
  },

  /**
   * Calculate synergies for all card pairs matched by synergy rules
   * @param {Array} allCards - All cards in the dataset
   * @param {Object} cardTagsMap - Mapping of cardId -> tags
   * @param {Object} ruleMatches - Result from SynergyRules.findAllMatches()
   * @returns {Object} Synergies object: cardId -> array of {targetId, points}
   */
  calculateSynergiesFromRules(allCards, cardTagsMap, ruleMatches) {
    const synergies = {};
    const cardPairsWithRules = []; // Array of {pair, ruleName}

    // Build a list of card pairs with their corresponding rule names
    for (const ruleName in ruleMatches) {
      const matchedCards = ruleMatches[ruleName];

      // For each rule, add all pairwise combinations of matched cards
      for (let i = 0; i < matchedCards.length; i++) {
        for (let j = i + 1; j < matchedCards.length; j++) {
          const card1Id = matchedCards[i].id;
          const card2Id = matchedCards[j].id;

          cardPairsWithRules.push({
            pair: `${card1Id}|${card2Id}`,
            ruleName: ruleName
          });
        }
      }
    }

    // Calculate synergy points for all card pairs using their corresponding weight rule
    for (const { pair, ruleName } of cardPairsWithRules) {
      const [card1Id, card2Id] = pair.split('|');

      const card1 = allCards.find(c => c.id === card1Id);
      const card2 = allCards.find(c => c.id === card2Id);

      if (!card1 || !card2) continue;

      const tags1 = cardTagsMap[card1Id] || {};
      const tags2 = cardTagsMap[card2Id] || {};

      // Find and apply the corresponding weight rule
      const weightRule = this.weightRules.find(r => r.rule === ruleName);
      if (!weightRule) {
        console.warn(`Weight rule "${ruleName}" not found`);
        continue;
      }

      let synergy = 0;
      try {
        synergy = weightRule.calculate(card1, card2, tags1, tags2);
      } catch (error) {
        console.error(`Error in weight rule "${ruleName}":`, error);
        continue;
      }

      if (synergy > 0) {
        // Store synergy in both directions
        if (!synergies[card1Id]) {
          synergies[card1Id] = [];
        }
        synergies[card1Id].push({
          targetId: card2Id,
          points: synergy
        });

        if (!synergies[card2Id]) {
          synergies[card2Id] = [];
        }
        synergies[card2Id].push({
          targetId: card1Id,
          points: synergy
        });
      }
    }

    // Sort by synergy points descending for each card
    for (const cardId in synergies) {
      synergies[cardId].sort((a, b) => b.points - a.points);
    }

    return synergies;
  }
};

// Global export
window.SynergyWeighter = SynergyWeighter;
