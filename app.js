(function () {
  "use strict";

  const CLOSE_THRESHOLD = 200;
  const RACES = ["Protess", "Zerg", "Terran", "Neutral"];

  /** @typedef {{ id:string, race:'Protess'|'Zerg'|'Terran'|'Neutral', level:number, number:number, value:number }} Card */

  // Built-in dataset file paths
  const BUILTIN_SET_FILES = {
    core: 'data/core.json',
    expPack1: 'data/pack1JunBeiJingSai.json',
    expPack2: 'data/pack2ZuoZhanJiHua.json',
    expPack3: 'data/pack3JuanTuChongLai.json',
    expPack4: 'data/pack4ShiBuWoDai.json',
    expPack5: 'data/pack5ChongZhuangShangZhen.json',
    expPack6: 'data/pack6QiongBingDuWu.json',
    expPack7: 'data/pack7YiNianZhiCha.json',
    expPack8: 'data/pack8MuChangZhiZhan.json',
    expPack9: 'data/pack9ShenJingBaiZhan.json',
    expPackDuo1: 'data/packDuo1TongLuanShuangGou.json'
  };

  const App = {
    state: {
      cards: /** @type {Card[]} */([]),
      guesses: /** @type {{cardId:string, feedback:'close'|'not_close'}[]} */([]),
      sortBy: 'race',
      selectedRace: '',
      selectedLevel: ''
    },

    init() {
      this.cacheEls();
      this.bindEvents();
      this.restoreFromUrlOrStorage();
      this.renderAll();
    },

    cacheEls() {
      this.els = {
        coreToggle: document.getElementById('coreToggle'),
        expPack1Toggle: document.getElementById('expPack1Toggle'),
        expPack2Toggle: document.getElementById('expPack2Toggle'),
        expPack3Toggle: document.getElementById('expPack3Toggle'),
        expPack4Toggle: document.getElementById('expPack4Toggle'),
        expPack5Toggle: document.getElementById('expPack5Toggle'),
        expPack6Toggle: document.getElementById('expPack6Toggle'),
        expPack7Toggle: document.getElementById('expPack7Toggle'),
        expPack8Toggle: document.getElementById('expPack8Toggle'),
        expPack9Toggle: document.getElementById('expPack9Toggle'),
        expPackDuo1Toggle: document.getElementById('expPackDuo1Toggle'),
        datasetInfo: document.getElementById('datasetInfo'),
        raceRow: document.getElementById('raceRow'),
        levelRow: document.getElementById('levelRow'),
        cardSelect: document.getElementById('cardSelect'),
        cardRow: document.getElementById('cardRow'),
        addGuessBtn: document.getElementById('addGuessBtn'),
        historyTableBody: document.querySelector('#historyTable tbody'),
        resetBtn: document.getElementById('resetBtn'),
        candidatesTableBody: document.querySelector('#candidatesTable tbody'),
        candidateStats: document.getElementById('candidateStats'),
        sortSelect: document.getElementById('sortSelect')
      };
    },

    bindEvents() {
      const toggles = [
        ['core', this.els.coreToggle],
        ['expPack1', this.els.expPack1Toggle],
        ['expPack2', this.els.expPack2Toggle],
        ['expPack3', this.els.expPack3Toggle],
        ['expPack4', this.els.expPack4Toggle],
        ['expPack5', this.els.expPack5Toggle],
        ['expPack6', this.els.expPack6Toggle],
        ['expPack7', this.els.expPack7Toggle],
        ['expPack8', this.els.expPack8Toggle],
        ['expPack9', this.els.expPack9Toggle],
        ['expPackDuo1Toggle', this.els.expPackDuo1Toggle],
      ];
      toggles.forEach(([key, el]) => {
        if (!el) return;
        el.addEventListener('change', () => {
          this.handleCombineSets();
        });
      });
      // local file loader removed
      // search box removed
      // Remove old select event listeners for raceSelect and levelSelect
      // Race/level button events are handled in renderRaceLevelSelectors
      this.els.addGuessBtn.addEventListener('click', () => {
        const cardId = this.els.cardSelect.value;
        if (!cardId) return;
        const feedback = /** @type {HTMLInputElement} */(document.querySelector('input[name="feedback"]:checked')).value;
        this.addGuess(cardId, feedback);
      });
      this.els.resetBtn.addEventListener('click', () => {
        if (confirm('Reset guesses?')) {
          this.state.guesses = [];
          this.persist();
          this.renderAll();
        }
      });
    },

    async handleCombineSets() {
      this.els.datasetInfo.textContent = 'Loading...';
      // core is mandatory
      const selectedKeys = ['core'];
      if (this.els.expPack1Toggle && this.els.expPack1Toggle.checked) selectedKeys.push('expPack1');
      if (this.els.expPack2Toggle && this.els.expPack2Toggle.checked) selectedKeys.push('expPack2');
      if (this.els.expPack3Toggle && this.els.expPack3Toggle.checked) selectedKeys.push('expPack3');
      if (this.els.expPack4Toggle && this.els.expPack4Toggle.checked) selectedKeys.push('expPack4');
      if (this.els.expPack5Toggle && this.els.expPack5Toggle.checked) selectedKeys.push('expPack5');
      if (this.els.expPack6Toggle && this.els.expPack6Toggle.checked) selectedKeys.push('expPack6');
      if (this.els.expPack7Toggle && this.els.expPack7Toggle.checked) selectedKeys.push('expPack7');
      if (this.els.expPack8Toggle && this.els.expPack8Toggle.checked) selectedKeys.push('expPack8');
      if (this.els.expPack9Toggle && this.els.expPack9Toggle.checked) selectedKeys.push('expPack9');
      if (this.els.expPackDuo1Toggle && this.els.expPackDuo1Toggle.checked) selectedKeys.push('expPackDuo1');

      try {
        const datasets = await Promise.all(selectedKeys.map(async (k) => {
          const res = await fetch(BUILTIN_SET_FILES[k], { cache: 'no-cache' });
          if (!res.ok) throw new Error(`HTTP ${res.status} for ${k}`);
          const data = await res.json();
          // Only support {name, cards} format
          const cards = data.cards;
          cards.forEach(card => {
            card.isCoreSet = (k === 'core');
          });
          return { cards, name: data.name || k };
        }));
        // merge and de-duplicate by id
        const mergedMap = new Map();
        datasets.flatMap(d => d.cards).forEach(card => {
          mergedMap.set(String(card.id), card);
        });
        const merged = Array.from(mergedMap.values());
        const packNames = datasets.map(d => d.name).filter(Boolean);
        this.setCards(merged, packNames);
        this.state.selectedRace = '';
        this.state.selectedLevel = '';
        this.renderAll();
      } catch (err) {
        this.els.datasetInfo.textContent = 'Loading failed';
        console.error('Failed to load selected packs', err);
        alert('Failed to load selected packs. Ensure you are serving the site via a local server or GitHub Pages.');
      }
    },

    // Load from file. Not in use.
    async loadFile(file) {
      const text = await file.text();
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        // Only support {name, cards} format
        const cards = data.cards;
        this.setCards(cards);
      } else if (file.name.endsWith('.csv')) {
        const cards = this.parseCsv(text);
        this.setCards(cards);
      } else {
        alert('Unsupported file type. Use .json or .csv');
      }
    },

    /**
     * @param {string} csv
     * @returns {Card[]}
     */
    parseCsv(csv) {
      const lines = csv.split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) return [];
      const header = lines[0].split(',').map(s => s.trim().toLowerCase());
      const idx = {
        id: header.indexOf('id'),
        race: header.indexOf('race'),
        level: header.indexOf('level'),
        number: header.indexOf('number'),
        value: header.indexOf('value')
      };
      return lines.slice(1).map((line) => {
        const cols = line.split(',');
        const id = idx.id >= 0 ? cols[idx.id] : `${cols[idx.race]}-${cols[idx.number]}`;
        const race = normalizeRace(String(cols[idx.race]));
        const level = normalizeLevel(Number(idx.level >= 0 ? cols[idx.level] : ''));
        return {
          id: String(id).trim(),
          race: race,
          level: level,
          number: Number(cols[idx.number]), value: Number(cols[idx.value])
        };
      }).filter(c => c.id && c.race && Number.isFinite(c.level) && c.level >= 1 && c.level <= 6 && Number.isFinite(c.number) && Number.isFinite(c.value));
    },

    setCards(cards, packNames) {
      // normalize
      const normalized = cards.map(c => {
        const race = normalizeRace(String(c.race));
        const level = normalizeLevel(Number(c.level));
        return {
          id: String(c.id ?? `${c.race}-${c.number}`),
          race: race,
          level: level,
          number: Number(c.number),
          value: Number(c.value),
          isCoreSet: c.isCoreSet
        };
      }).filter(c => RACES.includes(c.race) && Number.isFinite(c.level) && c.level >= 0 && c.level <= 6 && Number.isFinite(c.number) && Number.isFinite(c.value));
      const dropped = cards.length - normalized.length;
      this.state.cards = normalized;
      this.state.guesses = [];
      this.persist();
      this.renderAll();
      const packsText = Array.isArray(packNames) && packNames.length ? `牌组: ${packNames.join(', ')}` : '';
      this.els.datasetInfo.textContent = `${packsText} 已载入 总卡牌数:${this.state.cards.length} ${dropped > 0 ? ` (${dropped} invalid dropped)` : ''}`;
    },

    addGuess(cardId, feedback) {
      this.state.guesses.push({ cardId, feedback });
      this.persist();
      this.renderAll();
    },

    removeGuess(index) {
      this.state.guesses.splice(index, 1);
      this.persist();
      this.renderAll();
    },

    // Filtering logic according to rules
    /** @param {Card} candidate */
    candidateConsistent(candidate) {
      // For every guess, feedback must match what would happen if candidate was hidden
      for (const g of this.state.guesses) {
        const picked = this.state.cards.find(c => c.id === g.cardId);
        if (!picked) return false;
        const isClose = this.isClose(picked, candidate);
        if (g.feedback === 'close' && !isClose) return false;
        if (g.feedback === 'not_close' && isClose) return false;
      }
      return true;
    },

    /** @param {Card} a @param {Card} b */
    isClose(a, b) {
      return a.race === b.race || a.number === b.number || Math.abs(a.value - b.value) <= CLOSE_THRESHOLD;
    },

    getCandidates() {
      return this.state.cards.filter(c =>
        this.candidateConsistent(c) && c.isCoreSet
      );
    },

    renderAll() {
      this.renderRaceLevelSelectors();
      this.renderCardSelect();
      this.renderHistory();
      this.renderCandidates();
    },

    renderRaceLevelSelectors() {
      // Race buttons
      const racesInData = Array.from(new Set(this.state.cards.map(c => c.race))).filter(Boolean);
      const selectedRace = this.state.selectedRace && racesInData.includes(this.state.selectedRace) ? this.state.selectedRace : '';
      this.els.raceRow.innerHTML =
        `<button type="button" class="race-btn${!selectedRace ? ' selected' : ''}" data-race="">任意种族</button>` +
        racesInData.sort((a, b) => a.localeCompare(b)).map(r =>
          `<button type="button" class="race-btn${r === selectedRace ? ' selected' : ''}" data-race="${r}">${r}</button>`
        ).join('');
      this.els.raceRow.querySelectorAll('button.race-btn').forEach(btn => {
        btn.onclick = (e) => {
          this.state.selectedRace = btn.getAttribute('data-race');
          // Do NOT reset selectedLevel here
          this.renderRaceLevelSelectors();
          this.renderCardSelect();
        };
      });

      // Level buttons
      const levelsSet = new Set(
        this.state.cards
          .filter(c => !selectedRace || c.race === selectedRace)
          .map(c => c.level)
          .filter(v => Number.isFinite(v))
      );
      const levels = Array.from(levelsSet).sort((a, b) => a - b);
      const selectedLevel = (this.state.selectedLevel && levels.includes(Number(this.state.selectedLevel))) ? String(this.state.selectedLevel) : '';
      this.els.levelRow.innerHTML =
        `<button type="button" class="level-btn${!selectedLevel ? ' selected' : ''}" data-level="">任意等级</button>` +
        levels.map(l =>
          `<button type="button" class="level-btn${String(l) === selectedLevel ? ' selected' : ''}" data-level="${l}">${l}</button>`
        ).join('');
      this.els.levelRow.querySelectorAll('button.level-btn').forEach(btn => {
        btn.onclick = (e) => {
          this.state.selectedLevel = btn.getAttribute('data-level');
          this.renderRaceLevelSelectors();
          this.renderCardSelect();
        };
      });
    },

    renderCardSelect() {
      const sel = this.els.cardSelect;
      const cardRow = this.els.cardRow;
      const options = this.state.cards
        .filter(c => {
          // filter by race and level first
          if (this.state.selectedRace && c.race !== this.state.selectedRace) return false;
          if (this.state.selectedLevel && String(c.level) !== String(this.state.selectedLevel)) return false;
          return true;
        })
        .sort((a, b) => {
          if (a.race !== b.race) return a.race.localeCompare(b.race);
          if (a.level !== b.level) return a.level - b.level;
          if (a.number !== b.number) return a.number - b.number;
          return a.value - b.value;
        });
      sel.innerHTML = '<option value="">在此选择卡牌...</option>' + options.map(c => {
        const label = `${c.id}`;
        return `<option value="${c.id}">${label}</option>`;
      }).join('');

      // Card row: only show if both race and level are selected
      if (this.state.selectedRace && this.state.selectedLevel) {
        const selectedCardId = sel.value;
        cardRow.innerHTML = options.map(c =>
          `<button type="button" class="card-btn${c.id === selectedCardId ? ' selected' : ''}" data-cardid="${c.id}">${c.id}</button>`
        ).join('');
        cardRow.querySelectorAll('button.card-btn').forEach(btn => {
          btn.onclick = () => {
            sel.value = btn.getAttribute('data-cardid');
            // Highlight selected button
            cardRow.querySelectorAll('button.card-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          };
        });
        // Sync button highlight when cardSelect changes
        sel.onchange = () => {
          const val = sel.value;
          cardRow.querySelectorAll('button.card-btn').forEach(btn => {
            if (btn.getAttribute('data-cardid') === val) {
              btn.classList.add('selected');
            } else {
              btn.classList.remove('selected');
            }
          });
        };
      } else {
        cardRow.innerHTML = '';
        sel.onchange = null;
      }
    },

    renderHistory() {
      const tbody = this.els.historyTableBody;
      tbody.innerHTML = this.state.guesses.map((g, idx) => {
        const c = this.state.cards.find(x => x.id === g.cardId);
        if (!c) return '';
        return `
        <tr>
          <td>${idx + 1}</td>
          <td>${c.id}</td>
          <td>${c.race}</td>
          <td>${Number.isFinite(c.level) ? c.level : ''}</td>
          <td>${c.number}</td>
          <td>${c.value}</td>
          <td>${g.feedback === 'close' ? '获得' : '没有'}</td>
          <td><button data-action="remove" data-index="${idx}" class="danger">移除此行</button></td>
        </tr>
      `;
      }).join('');
      tbody.querySelectorAll('button[data-action="remove"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const i = Number(e.currentTarget.getAttribute('data-index'));
          this.removeGuess(i);
        });
      });
    },

    renderCandidates() {
      const tbody = this.els.candidatesTableBody;
      const sortBy = this.state.sortBy;
      let list = this.getCandidates();
      list.sort((a, b) => {
        if (sortBy === 'race') {
          if (a.race !== b.race) return a.race.localeCompare(b.race);
          if (a.number !== b.number) return a.number - b.number;
          return a.value - b.value;
        }
        if (sortBy === 'number') {
          if (a.number !== b.number) return a.number - b.number;
          if (a.race !== b.race) return a.race.localeCompare(b.race);
          return a.value - b.value;
        }
        // value
        if (a.value !== b.value) return a.value - b.value;
        if (a.race !== b.race) return a.race.localeCompare(b.race);
        return a.number - b.number;
      });
      tbody.innerHTML = list.map(c => {
        const closeSignals = this.state.guesses.some(g => {
          const picked = this.state.cards.find(x => x.id === g.cardId);
          return picked && this.isClose(picked, c);
        });
        return `
        <tr class="${closeSignals ? 'close-signal' : ''}">
          <td>${c.id}</td>
          <td>${c.race}</td>
          <td>${Number.isFinite(c.level) ? c.level : ''}</td>
          <td>${c.number}</td>
          <td>${c.value}</td>
        </tr>
      `;
      }).join('');
      const total = this.state.cards.length;
      const remaining = list.length;
      this.els.candidateStats.textContent = `${remaining}/${total}`;
    },

    persist() {
      const data = {
        cards: this.state.cards,
        guesses: this.state.guesses,
        sortBy: this.state.sortBy
      };
      try {
        localStorage.setItem('gac_state_v1', JSON.stringify(data));
      } catch (e) {/* ignore */ }
    },

    restoreFromUrlOrStorage() {
      try {
        const raw = localStorage.getItem('gac_state_v1');
        if (raw) {
          const restored = JSON.parse(raw);
          this.state.guesses = restored.guesses || [];
          this.state.sortBy = restored.sortBy || 'race';
        }
      } catch (e) {/* noop */ }
    }
  };

  function normalizeRace(input) {
    const v = String(input).trim().toLowerCase();
    if (v === 'protess' || v === 'protoss') return 'Protess';
    if (v === 'zerg') return 'Zerg';
    if (v === 'terran') return 'Terran';
    if (v === 'neutral') return 'Neutral';
    return null;
  }

  function normalizeLevel(n) {
    const x = Math.floor(Number(n));
    if (!Number.isFinite(x)) return NaN;
    if (x <= 0) return 0;
    if (x > 6) return 6;
    return x;
  }

  window.App = App;
})();


