// ═══════════════════════════════════════════════════════════════════
// SHARED — App state, chromosome data, synthetic metrics, utilities
// ═══════════════════════════════════════════════════════════════════

window.APP = {
  // ── State ──────────────────────────────────────────────────────
  cart: JSON.parse(localStorage.getItem('lsmc_cart') || '[]'),
  currentDepth: 30,
  currentBedRegions: [],
  currentPanelName: '',
  activeTab: 'build',

  // ── Event bus (simple pub/sub) ─────────────────────────────────
  _listeners: {},
  on: function(evt, fn) {
    if (!this._listeners[evt]) this._listeners[evt] = [];
    this._listeners[evt].push(fn);
  },
  emit: function(evt, data) {
    (this._listeners[evt] || []).forEach(function(fn) { fn(data); });
  },

  // ── Cart helpers ───────────────────────────────────────────────
  addToCart: function(gene) {
    if (this.cart.some(function(g) { return g.symbol === gene.symbol; })) return false;
    this.cart.push(gene);
    this._saveCart();
    this.emit('cartChanged', this.cart);
    return true;
  },
  removeFromCart: function(symbol) {
    this.cart = this.cart.filter(function(g) { return g.symbol !== symbol; });
    this._saveCart();
    this.emit('cartChanged', this.cart);
  },
  clearCart: function() {
    this.cart = [];
    this._saveCart();
    this.emit('cartChanged', this.cart);
  },
  loadCartPreset: function(genes) {
    this.cart = genes.slice();
    this._saveCart();
    this.emit('cartChanged', this.cart);
  },
  isInCart: function(symbol) {
    return this.cart.some(function(g) { return g.symbol === symbol; });
  },
  _saveCart: function() {
    localStorage.setItem('lsmc_cart', JSON.stringify(this.cart));
  },

  // ── Tab switching ──────────────────────────────────────────────
  switchTab: function(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab-nav-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-pane').forEach(function(pane) {
      pane.classList.toggle('active', pane.id === 'tab-' + tab);
    });
    this.emit('tabChanged', tab);
  },

  // ── Analyze: cart → score tab ──────────────────────────────────
  analyzePanel: function(regions, panelName) {
    this.currentBedRegions = regions;
    this.currentPanelName = panelName;
    this.switchTab('score');
    this.emit('analyzeRequested', { regions: regions, panelName: panelName });
  }
};

// ═══════════════════════════════════════════════════════════════════
// CHROMOSOME DATA (hg38)
// ═══════════════════════════════════════════════════════════════════
var CHROMOSOMES = [
  { name: 'chr1',  len: 248956422 }, { name: 'chr2',  len: 242193529 },
  { name: 'chr3',  len: 198295559 }, { name: 'chr4',  len: 190214555 },
  { name: 'chr5',  len: 181538259 }, { name: 'chr6',  len: 170805979 },
  { name: 'chr7',  len: 159345973 }, { name: 'chr8',  len: 145138636 },
  { name: 'chr9',  len: 138394717 }, { name: 'chr10', len: 133797422 },
  { name: 'chr11', len: 135086622 }, { name: 'chr12', len: 133275309 },
  { name: 'chr13', len: 114364328 }, { name: 'chr14', len: 107043718 },
  { name: 'chr15', len: 101991189 }, { name: 'chr16', len: 90338345 },
  { name: 'chr17', len: 83257441 },  { name: 'chr18', len: 80373285 },
  { name: 'chr19', len: 58617616 },  { name: 'chr20', len: 64444167 },
  { name: 'chr21', len: 46709983 },  { name: 'chr22', len: 50818468 },
  { name: 'chrX',  len: 156040895 }, { name: 'chrY',  len: 57227415 },
];

// ═══════════════════════════════════════════════════════════════════
// REGION CLASSES & SYNTHETIC METRICS
// ═══════════════════════════════════════════════════════════════════
var REGION_CLASSES = ['easy','easy','easy','easy','difficult','segdup','repeats','gc_extremes'];

function synthMetrics(gene, depth) {
  var seed = 0;
  var gn = gene.gene || gene.symbol || 'region';
  for (var i = 0; i < gn.length; i++) seed += gn.charCodeAt(i);
  seed += depth;
  var r = function(offset) { var x = Math.sin(seed + offset) * 10000; return x - Math.floor(x); };
  var rc = REGION_CLASSES[seed % REGION_CLASSES.length];
  var depthBonus = Math.min((depth - 10) / 40, 1) * 0.015;
  var classPenalty = rc === 'easy' ? 0 : rc === 'difficult' ? 0.015 : rc === 'segdup' ? 0.025 : rc === 'repeats' ? 0.03 : 0.02;
  return {
    region_class: rc,
    snv_fscore:   Math.min(0.9999, 0.985 + depthBonus + r(1)*0.012 - classPenalty),
    indel_fscore: Math.min(0.999,  0.975 + depthBonus + r(2)*0.015 - classPenalty*1.5),
    callable:     Math.min(0.999,  0.975 + depthBonus*0.8 + r(3)*0.015 - classPenalty),
    depth:        depth + (r(4) - 0.5) * 4,
  };
}

// ═══════════════════════════════════════════════════════════════════
// SYNTHETIC EXON GENERATOR
// Generates realistic-looking exon positions for a gene based on
// its coordinates. Deterministic (seeded by gene start position).
// ═══════════════════════════════════════════════════════════════════
function generateExons(gene) {
  var geneLen = gene.end - gene.start;
  var seed = gene.start % 10000;
  var rng = function(i) { var x = Math.sin(seed + i * 127.1) * 43758.5453; return x - Math.floor(x); };

  // Number of exons scales with gene size
  var nExons;
  if (geneLen < 5000) nExons = Math.max(1, Math.floor(2 + rng(0) * 3));
  else if (geneLen < 20000) nExons = Math.max(3, Math.floor(4 + rng(0) * 8));
  else if (geneLen < 100000) nExons = Math.max(5, Math.floor(8 + rng(0) * 15));
  else nExons = Math.max(10, Math.floor(15 + rng(0) * 30));

  var exons = [];
  var codingFraction = 0.02 + rng(1) * 0.08; // 2-10% of gene is coding
  var totalCoding = Math.floor(geneLen * codingFraction);
  var avgExonLen = Math.max(80, Math.floor(totalCoding / nExons));

  // Distribute exons across the gene
  var spacing = geneLen / (nExons + 1);
  for (var i = 0; i < nExons; i++) {
    var center = gene.start + spacing * (i + 1) + (rng(i + 10) - 0.5) * spacing * 0.4;
    var exonLen = Math.max(50, Math.floor(avgExonLen * (0.5 + rng(i + 20) * 1.0)));
    // First and last exons tend to be larger
    if (i === 0 || i === nExons - 1) exonLen = Math.floor(exonLen * (1.2 + rng(i + 30) * 0.5));
    var s = Math.max(gene.start, Math.floor(center - exonLen / 2));
    var e = Math.min(gene.end, s + exonLen);
    exons.push({ start: s, end: e });
  }

  // Sort and deduplicate overlaps
  exons.sort(function(a, b) { return a.start - b.start; });
  var merged = [exons[0]];
  for (var i = 1; i < exons.length; i++) {
    var prev = merged[merged.length - 1];
    if (exons[i].start <= prev.end + 100) {
      prev.end = Math.max(prev.end, exons[i].end);
    } else {
      merged.push(exons[i]);
    }
  }
  return merged;
}

// ═══════════════════════════════════════════════════════════════════
// SYNTHETIC COVERAGE DATA GENERATOR
// Generates per-window depth values for gnomAD-style coverage track.
// Returns array of { pos, depth } for 100bp windows across a gene.
// ═══════════════════════════════════════════════════════════════════
function generateCoverageData(gene, exons, depth) {
  var geneLen = gene.end - gene.start;
  var windowSize = Math.max(100, Math.floor(geneLen / 500)); // ~500 data points max
  var nWindows = Math.ceil(geneLen / windowSize);
  var data = [];

  var seed = gene.start % 10000 + depth;
  var rng = function(i) { var x = Math.sin(seed + i * 31.7) * 43758.5453; return x - Math.floor(x); };

  // Build exon lookup for quick intersection
  var isExonic = function(pos) {
    for (var e = 0; e < exons.length; e++) {
      if (pos >= exons[e].start && pos < exons[e].end) return true;
    }
    return false;
  };

  // GC-content simulation (smooth wave pattern)
  var gcWave = function(i) { return Math.sin(i * 0.03) * 0.15 + Math.sin(i * 0.007) * 0.1; };

  // Generate coverage with realistic noise
  var prevDepth = depth;
  for (var i = 0; i < nWindows; i++) {
    var pos = gene.start + i * windowSize;
    var baseDepth = depth;

    // Exonic regions: slightly higher coverage (even in WGS, mappability is better)
    if (isExonic(pos)) baseDepth *= (1.05 + rng(i * 3) * 0.05);

    // GC bias effect
    baseDepth *= (1 + gcWave(i));

    // Random walk noise (correlated between adjacent windows)
    var noise = (rng(i) - 0.5) * depth * 0.15;
    var walkNoise = (prevDepth - depth) * 0.3; // mean reversion
    var d = baseDepth + noise - walkNoise;

    // Occasional dips (mappability issues, repetitive regions)
    if (rng(i * 7 + 3) < 0.03) d *= (0.2 + rng(i * 7 + 4) * 0.3);

    d = Math.max(0, d);
    prevDepth = d;

    data.push({ pos: pos, depth: d });
  }
  // Final point at gene end
  data.push({ pos: gene.end, depth: data[data.length - 1].depth });

  return { data: data, windowSize: windowSize };
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
function fmtSize(bp) {
  return bp > 1e6 ? (bp/1e6).toFixed(1) + ' Mb' : bp > 1e3 ? (bp/1e3).toFixed(1) + ' kb' : bp + ' bp';
}

function dotClass(val, greenThresh, yellowThresh) {
  return val >= greenThresh ? 'dot-green' : val >= yellowThresh ? 'dot-yellow' : 'dot-red';
}

function classLabel(rc) {
  return rc === 'easy' ? 'High-confidence' :
         rc === 'difficult' ? 'Difficult' :
         rc === 'segdup' ? 'Seg. duplication' :
         rc === 'repeats' ? 'Tandem repeat' :
         rc === 'gc_extremes' ? 'GC extreme' : rc;
}

function animateValue(el, target, decimals) {
  var duration = 1200;
  var startTime = performance.now();
  function tick(now) {
    var t = Math.min((now - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (eased * target).toFixed(decimals);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function colorCard(el, value, threshold) {
  var card = el.closest('.summary-card');
  if (value >= threshold) {
    el.className = 'card-value value-green';
    card.className = 'summary-card pass';
  } else if (value >= threshold - 0.005) {
    el.className = 'card-value value-yellow';
    card.className = 'summary-card warn';
  } else {
    el.className = 'card-value value-red';
    card.className = 'summary-card';
  }
}

function addScoreCell(tr, val, dotCls) {
  var td = document.createElement('td');
  var span = document.createElement('span');
  span.className = 'score-cell';
  var dot = document.createElement('span');
  dot.className = 'score-dot ' + dotCls;
  span.appendChild(dot);
  span.appendChild(document.createTextNode(val));
  td.appendChild(span);
  tr.appendChild(td);
}

function addTextCell(tr, text, cls) {
  var td = document.createElement('td');
  if (cls) {
    var s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    td.appendChild(s);
  } else {
    td.textContent = text;
  }
  tr.appendChild(td);
}

function makeHeaderRow(thead, cols) {
  thead.replaceChildren();
  var tr = document.createElement('tr');
  for (var i = 0; i < cols.length; i++) {
    var th = document.createElement('th');
    th.textContent = cols[i];
    tr.appendChild(th);
  }
  thead.appendChild(tr);
}
