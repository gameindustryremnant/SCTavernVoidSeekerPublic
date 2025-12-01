/**
 * GraphBuilder.js
 * Builds 3D graph data from weighted synergy points
 */

const GraphBuilder = {
  /**
   * Build graph nodes and links from synergies
   * @param {Array} cards - Array of card objects
   * @param {Object} cardTags - Mapping of cardId -> tags
   * @param {Object} synergies - Mapping of cardId -> array of synergy objects
   * @returns {Object} Graph data with nodes and links
   */
  buildGraphData(cards, cardTags, synergies) {
    const nodeMap = new Map();

    // Create nodes for all cards
    for (const card of cards) {
      const tags = cardTags[card.id] || {};
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

    const nodes = Array.from(nodeMap.values());

    // Create links for high-synergy pairs (only top connections per card)
    const links = this.buildLinks(synergies);

    return { nodes, links };
  },

  /**
   * Build links from synergies
   * @param {Object} synergies - Mapping of cardId -> array of synergy objects
   * @returns {Array} Array of link objects for the graph
   */
  buildLinks(synergies) {
    const maxLinksPerCard = 5;
    const linkSet = new Set();
    const links = [];

    for (const cardId in synergies) {
      const synergyList = synergies[cardId].slice(0, maxLinksPerCard);
      for (const synergy of synergyList) {
        const linkKey = [cardId, synergy.targetId].sort().join("-");
        if (!linkSet.has(linkKey) && synergy.points > 0) {
          linkSet.add(linkKey);
          links.push({
            source: cardId,
            target: synergy.targetId,
            value: Math.min(5, synergy.points / 10) // Normalize strength for visualization
          });
        }
      }
    }

    return links;
  },

  /**
   * Get color code for a race
   * @param {string} race - Race name
   * @returns {string} Hex color code
   */
  getColorByRace(race) {
    const colors = {
      "Protess": "#0099FF",   // Blue
      "Zerg": "#FF0099",      // Purple
      "Terran": "#FF9900",    // Orange
      "Neutral": "#CCCCCC"    // Gray
    };
    return colors[race] || "#CCCCCC";
  },

  /**
   * Filter graph nodes by race
   * @param {Array} nodes - Array of node objects
   * @param {string} race - Race filter (empty string for no filter)
   * @returns {Array} Filtered nodes
   */
  filterNodesByRace(nodes, race) {
    if (!race) return nodes;
    return nodes.filter(n => n.race === race);
  },

  /**
   * Filter graph nodes by tag
   * @param {Array} nodes - Array of node objects
   * @param {string} tag - Tag filter (empty string for no filter)
   * @returns {Array} Filtered nodes
   */
  filterNodesByTag(nodes, tag) {
    if (!tag) return nodes;
    return nodes.filter(n => n.tags[tag]);
  },

  /**
   * Filter links based on visible nodes
   * @param {Array} links - Array of link objects
   * @param {Array} visibleNodes - Array of visible node objects
   * @returns {Array} Filtered links
   */
  filterLinks(links, visibleNodes) {
    const nodeIds = new Set(visibleNodes.map(n => n.id));
    return links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
  },

  /**
   * Apply all filters to graph data
   * @param {Object} graphData - Original graph data with nodes and links
   * @param {string} raceFilter - Race filter
   * @param {string} tagFilter - Tag filter
   * @returns {Object} Filtered graph data
   */
  applyFilters(graphData, raceFilter, tagFilter) {
    let filteredNodes = graphData.nodes;

    if (raceFilter) {
      filteredNodes = this.filterNodesByRace(filteredNodes, raceFilter);
    }

    if (tagFilter) {
      filteredNodes = this.filterNodesByTag(filteredNodes, tagFilter);
    }

    const filteredLinks = this.filterLinks(graphData.links, filteredNodes);

    return { nodes: filteredNodes, links: filteredLinks };
  }
};

// Global export
window.GraphBuilder = GraphBuilder;
