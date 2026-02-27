// ═══════════════════════════════════════════════════════════════════
// BROWSE TAB — Gene search + gnomAD-style coverage track
// ═══════════════════════════════════════════════════════════════════

(function() {
  var searchInput = document.getElementById('browseSearch');
  var autocomplete = document.getElementById('browseAutocomplete');
  var coverageSection = document.getElementById('coverageSection');
  var emptyState = document.getElementById('browseEmpty');
  var canvas = document.getElementById('coverageCanvas');
  var tooltip = document.getElementById('coverageTooltip');
  var ctx = canvas.getContext('2d');

  var currentGene = null;
  var currentExons = null;
  var currentCovData = null;
  var highlightIdx = -1;
  var mouseX = -1;
  var mouseY = -1;

  // ── Layout constants ────────────────────────────────────────────
  var PAD = { left: 60, right: 20, top: 20, bottom: 70 };
  var TRACK_H = 20;  // transcript track height
  var TRACK_GAP = 15; // gap between depth chart and transcript track

  // ── Search + Autocomplete ──────────────────────────────────────
  searchInput.addEventListener('input', function() {
    var q = searchInput.value.trim();
    if (q.length < 1) { hideAutocomplete(); return; }
    var results = searchGenes(q, 8);
    showAutocomplete(results);
  });

  searchInput.addEventListener('keydown', function(e) {
    var items = autocomplete.querySelectorAll('.autocomplete-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIdx = Math.min(highlightIdx + 1, items.length - 1);
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIdx = Math.max(highlightIdx - 1, 0);
      updateHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && items[highlightIdx]) {
        var sym = items[highlightIdx].dataset.symbol;
        selectGene(getGeneBySymbol(sym));
      }
    } else if (e.key === 'Escape') {
      hideAutocomplete();
    }
  });

  searchInput.addEventListener('focus', function() {
    if (searchInput.value.trim().length >= 1) {
      var results = searchGenes(searchInput.value.trim(), 8);
      if (results.length) showAutocomplete(results);
    }
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.browse-search-wrap')) hideAutocomplete();
  });

  function showAutocomplete(genes) {
    autocomplete.replaceChildren();
    highlightIdx = -1;
    if (genes.length === 0) { hideAutocomplete(); return; }

    genes.forEach(function(g) {
      var item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.dataset.symbol = g.symbol;

      var sym = document.createElement('span');
      sym.className = 'ac-symbol';
      sym.textContent = g.symbol;

      var name = document.createElement('span');
      name.className = 'ac-name';
      name.textContent = g.name;

      var chr = document.createElement('span');
      chr.className = 'ac-chr';
      chr.textContent = g.chr.replace('chr', '') + ':' + fmtSize(g.end - g.start);

      item.appendChild(sym);
      item.appendChild(name);
      item.appendChild(chr);

      if (APP.isInCart(g.symbol)) {
        var badge = document.createElement('span');
        badge.className = 'ac-cart-badge';
        badge.textContent = 'IN CART';
        item.appendChild(badge);
      }

      item.addEventListener('click', function() { selectGene(g); });
      autocomplete.appendChild(item);
    });

    autocomplete.classList.add('active');
  }

  function hideAutocomplete() {
    autocomplete.classList.remove('active');
    highlightIdx = -1;
  }

  function updateHighlight(items) {
    items.forEach(function(el, i) { el.classList.toggle('highlighted', i === highlightIdx); });
  }

  // ── Gene selection ─────────────────────────────────────────────
  function selectGene(gene) {
    if (!gene) return;
    currentGene = gene;
    currentExons = generateExons(gene);
    currentCovData = generateCoverageData(gene, currentExons, APP.currentDepth);

    searchInput.value = gene.symbol;
    hideAutocomplete();

    emptyState.style.display = 'none';
    coverageSection.classList.add('active');

    renderGeneInfo();
    renderCoverage();
    renderCoverageMetrics();
  }

  function renderGeneInfo() {
    var g = currentGene;
    document.getElementById('browseGeneSymbol').textContent = g.symbol;
    document.getElementById('browseGeneName').textContent = g.name;

    var meta = document.getElementById('browseGeneMeta');
    meta.replaceChildren();
    var items = [
      g.chr.replace('chr', 'Chr '),
      g.start.toLocaleString() + ' \u2013 ' + g.end.toLocaleString(),
      fmtSize(g.end - g.start),
      currentExons.length + ' exons',
      g.cat.join(', ')
    ];
    items.forEach(function(txt) {
      var span = document.createElement('span');
      span.textContent = txt;
      meta.appendChild(span);
    });

    var addBtn = document.getElementById('browseAddBtn');
    updateAddButton(addBtn);
    addBtn.onclick = function() {
      if (!APP.isInCart(g.symbol)) {
        APP.addToCart(g);
        updateAddButton(addBtn);
      }
    };
  }

  function updateAddButton(btn) {
    if (APP.isInCart(currentGene.symbol)) {
      btn.textContent = '\u2713 In Panel';
      btn.className = 'gene-add-btn in-cart';
    } else {
      btn.textContent = '+ Add to Panel';
      btn.className = 'gene-add-btn';
    }
  }

  // ── Coverage track rendering ───────────────────────────────────
  function renderCoverage() {
    if (!currentGene || !currentCovData) return;

    var dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    var W = canvas.offsetWidth;
    var H = canvas.offsetHeight;
    var chartH = H - PAD.top - PAD.bottom - TRACK_H - TRACK_GAP;

    var data = currentCovData.data;
    var gene = currentGene;
    var exons = currentExons;

    // Find max depth for Y scale
    var maxDepth = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].depth > maxDepth) maxDepth = data[i].depth;
    }
    maxDepth = Math.max(maxDepth * 1.15, APP.currentDepth * 1.5);

    // X scale: genomic position -> pixel
    var xScale = function(pos) {
      return PAD.left + ((pos - gene.start) / (gene.end - gene.start)) * (W - PAD.left - PAD.right);
    };
    // Y scale: depth -> pixel (inverted)
    var yScale = function(d) {
      return PAD.top + chartH - (d / maxDepth) * chartH;
    };

    ctx.clearRect(0, 0, W, H);

    // ── Background grid ──────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    var yTicks = [0, 10, 20, 30, 40, 50, 60];
    yTicks.forEach(function(d) {
      if (d > maxDepth) return;
      var y = yScale(d);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(d + 'x', PAD.left - 8, y + 3);
    });

    // ── Threshold lines (dashed) ─────────────────────────────────
    var thresholds = [
      { depth: 10, color: 'rgba(239, 68, 68, 0.4)', label: '10x' },
      { depth: 20, color: 'rgba(245, 158, 11, 0.4)', label: '20x' },
      { depth: 30, color: 'rgba(16, 185, 129, 0.4)', label: '30x' },
    ];
    thresholds.forEach(function(t) {
      if (t.depth > maxDepth) return;
      var y = yScale(t.depth);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = t.color;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(t.label, W - PAD.right + 4, y + 3);
    });

    // ── Coverage area fill ───────────────────────────────────────
    drawCoverageArea(data, xScale, yScale, 30, 'rgba(16, 185, 129, 0.25)', maxDepth);
    drawCoverageArea(data, xScale, yScale, 20, 'rgba(245, 158, 11, 0.2)', 30);
    drawCoverageArea(data, xScale, yScale, 0, 'rgba(239, 68, 68, 0.15)', 20);

    // ── Coverage line ────────────────────────────────────────────
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 1.5;
    for (var i = 0; i < data.length; i++) {
      var x = xScale(data[i].pos);
      var y = yScale(data[i].depth);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ── Transcript track ─────────────────────────────────────────
    var trackY = PAD.top + chartH + TRACK_GAP;

    // Intron line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xScale(gene.start), trackY + TRACK_H / 2);
    ctx.lineTo(xScale(gene.end), trackY + TRACK_H / 2);
    ctx.stroke();

    // Exon blocks
    exons.forEach(function(ex) {
      var ex1 = xScale(ex.start);
      var ex2 = xScale(ex.end);
      var exW = Math.max(2, ex2 - ex1);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(ex1, trackY + 2, exW, TRACK_H - 4);
    });

    // Direction labels
    ctx.fillStyle = '#64748b';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText("5'", xScale(gene.start), trackY + TRACK_H + 12);
    ctx.textAlign = 'right';
    ctx.fillText("3'", xScale(gene.end), trackY + TRACK_H + 12);
    ctx.textAlign = 'center';
    ctx.fillText(currentGene.symbol, (xScale(gene.start) + xScale(gene.end)) / 2, trackY + TRACK_H + 12);

    // ── Hover crosshair ──────────────────────────────────────────
    if (mouseX >= PAD.left && mouseX <= W - PAD.right && mouseY >= PAD.top && mouseY <= PAD.top + chartH) {
      var genomicPos = gene.start + ((mouseX - PAD.left) / (W - PAD.left - PAD.right)) * (gene.end - gene.start);
      var nearest = findNearest(data, genomicPos);

      if (nearest) {
        var nx = xScale(nearest.pos);
        var ny = yScale(nearest.depth);

        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(nx, PAD.top);
        ctx.lineTo(nx, PAD.top + chartH);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

  function drawCoverageArea(data, xScale, yScale, minThresh, color, maxThresh) {
    ctx.beginPath();
    ctx.fillStyle = color;
    var baseY = yScale(minThresh);
    ctx.moveTo(xScale(data[0].pos), baseY);

    for (var i = 0; i < data.length; i++) {
      var x = xScale(data[i].pos);
      var d = Math.min(Math.max(data[i].depth, minThresh), maxThresh);
      ctx.lineTo(x, yScale(d));
    }

    ctx.lineTo(xScale(data[data.length - 1].pos), baseY);
    ctx.closePath();
    ctx.fill();
  }

  function findNearest(data, pos) {
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < data.length; i++) {
      var dist = Math.abs(data[i].pos - pos);
      if (dist < bestDist) { bestDist = dist; best = data[i]; }
    }
    return best;
  }

  // ── Coverage metrics (below track) ─────────────────────────────
  function renderCoverageMetrics() {
    var data = currentCovData.data;
    var total = data.length;
    var sumDepth = 0;
    var above30 = 0;

    for (var i = 0; i < data.length; i++) {
      sumDepth += data[i].depth;
      if (data[i].depth >= 30) above30++;
    }

    var meanDepth = sumDepth / total;
    var m = synthMetrics(currentGene, APP.currentDepth);

    setMetric('covMeanDepth', meanDepth.toFixed(1) + 'x', meanDepth >= 30 ? 'value-green' : meanDepth >= 20 ? 'value-yellow' : 'value-red');
    setMetric('covAbove30', ((above30 / total) * 100).toFixed(1) + '%', above30 / total >= 0.95 ? 'value-green' : 'value-yellow');
    setMetric('covSnvFscore', m.snv_fscore.toFixed(4), m.snv_fscore >= 0.995 ? 'value-green' : m.snv_fscore >= 0.990 ? 'value-yellow' : 'value-red');
    setMetric('covIndelFscore', m.indel_fscore.toFixed(4), m.indel_fscore >= 0.990 ? 'value-green' : m.indel_fscore >= 0.980 ? 'value-yellow' : 'value-red');
  }

  function setMetric(id, value, cls) {
    var el = document.getElementById(id);
    el.textContent = value;
    el.className = 'cov-metric-value ' + cls;
  }

  // ── Mouse tracking for hover tooltip ───────────────────────────
  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (currentCovData) {
      var W = canvas.offsetWidth;
      var H = canvas.offsetHeight;
      var chartH = H - PAD.top - PAD.bottom - TRACK_H - TRACK_GAP;

      if (mouseX >= PAD.left && mouseX <= W - PAD.right && mouseY >= PAD.top && mouseY <= PAD.top + chartH) {
        var gene = currentGene;
        var genomicPos = gene.start + ((mouseX - PAD.left) / (W - PAD.left - PAD.right)) * (gene.end - gene.start);
        var nearest = findNearest(currentCovData.data, genomicPos);

        if (nearest) {
          tooltip.classList.add('active');
          // Build tooltip content safely with DOM
          tooltip.textContent = '';
          tooltip.appendChild(document.createTextNode(gene.chr + ':' + Math.floor(genomicPos).toLocaleString()));
          tooltip.appendChild(document.createElement('br'));
          var strong = document.createElement('strong');
          strong.textContent = 'Depth: ' + nearest.depth.toFixed(1) + 'x';
          tooltip.appendChild(strong);
          tooltip.style.left = (mouseX + 12) + 'px';
          tooltip.style.top = (mouseY - 10) + 'px';
        }
      } else {
        tooltip.classList.remove('active');
      }
      renderCoverage();
    }
  });

  canvas.addEventListener('mouseleave', function() {
    mouseX = -1;
    mouseY = -1;
    tooltip.classList.remove('active');
    if (currentCovData) renderCoverage();
  });

  // ── Depth change handler ───────────────────────────────────────
  APP.on('depthChanged', function(depth) {
    if (currentGene) {
      currentCovData = generateCoverageData(currentGene, currentExons, depth);
      renderCoverage();
      renderCoverageMetrics();
    }
  });

  // ── Cart change handler (update "Add to Panel" button) ─────────
  APP.on('cartChanged', function() {
    if (currentGene) {
      var addBtn = document.getElementById('browseAddBtn');
      updateAddButton(addBtn);
    }
  });

  // ── Window resize ──────────────────────────────────────────────
  window.addEventListener('resize', function() {
    if (currentGene && APP.activeTab === 'browse') renderCoverage();
  });

  // Re-render when tab becomes visible
  APP.on('tabChanged', function(tab) {
    if (tab === 'browse' && currentGene) {
      setTimeout(function() { renderCoverage(); }, 50);
    }
  });

})();
