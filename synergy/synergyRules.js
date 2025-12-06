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
      rule: "same_race",
      description: "Same-race synergy: cards of the same race",
      match: (allCards, cardTagsMap, focusCard) => {
        if (!focusCard) return [];
        return allCards.filter(card => card.race === focusCard.race);
      }
    },
    {
      rule: "shared_tag",
      description: "Shared tag synergy: cards sharing a common tag",
      match: (allCards, cardTagsMap, focusCard) => {
        if (!focusCard) return [];
        const focusTags = cardTagsMap[focusCard.id] || {};
        return allCards.filter(card => {
          const cardTags = cardTagsMap[card.id] || {};
          for (const tag in focusTags) {
            if (tag in cardTags && tag !== focusCard.race && tag !== "pack") {
              return true;
            }
          }
          return false;
        });
      }
    },
    {
      rule: "air_superiority",
      description: "Air superiority synergy: cards with 飞行 tag",
      match: (allCards, cardTagsMap) => {
        return allCards.filter(card => {
          const tags = cardTagsMap[card.id] || {};
          return tags["飞行"];
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
