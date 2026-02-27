// ═══════════════════════════════════════════════════════════════════
// BUILD TAB — Panel builder / shopping cart
// ═══════════════════════════════════════════════════════════════════

(function() {
  var searchInput = document.getElementById('buildSearch');
  var autocomplete = document.getElementById('buildAutocomplete');
  var cartList = document.getElementById('cartGeneList');
  var cartEmpty = document.getElementById('cartEmpty');
  var analyzeBtn = document.getElementById('buildAnalyzeBtn');
  var importModal = document.getElementById('importModal');
  var importTextarea = document.getElementById('importTextarea');
  var highlightIdx = -1;

  // ── Initial render ─────────────────────────────────────────────
  renderCart();
  renderCartStats();
  renderPresets();

  // ── Search + Autocomplete ──────────────────────────────────────
  searchInput.addEventListener('input', function() {
    var q = searchInput.value.trim();
    if (q.length < 1) { hideAC(); return; }
    var results = searchGenes(q, 6);
    showAC(results);
  });

  searchInput.addEventListener('keydown', function(e) {
    var items = autocomplete.querySelectorAll('.autocomplete-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIdx = Math.min(highlightIdx + 1, items.length - 1);
      items.forEach(function(el, i) { el.classList.toggle('highlighted', i === highlightIdx); });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIdx = Math.max(highlightIdx - 1, 0);
      items.forEach(function(el, i) { el.classList.toggle('highlighted', i === highlightIdx); });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && items[highlightIdx]) {
        addGeneBySymbol(items[highlightIdx].dataset.symbol);
      }
    } else if (e.key === 'Escape') {
      hideAC();
    }
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.build-search-wrap')) hideAC();
  });

  function showAC(genes) {
    autocomplete.replaceChildren();
    highlightIdx = -1;
    if (genes.length === 0) { hideAC(); return; }

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
        badge.textContent = '\u2713';
        item.appendChild(badge);
      }

      item.addEventListener('click', function() { addGeneBySymbol(g.symbol); });
      autocomplete.appendChild(item);
    });

    autocomplete.classList.add('active');
  }

  function hideAC() {
    autocomplete.classList.remove('active');
    highlightIdx = -1;
  }

  function addGeneBySymbol(symbol) {
    var gene = getGeneBySymbol(symbol);
    if (gene && !APP.isInCart(symbol)) {
      APP.addToCart(gene);
      searchInput.value = '';
      hideAC();
      searchInput.focus();
    }
  }

  // ── Cart rendering ─────────────────────────────────────────────
  function renderCart() {
    cartList.replaceChildren();

    if (APP.cart.length === 0) {
      cartEmpty.style.display = 'block';
      analyzeBtn.disabled = true;
      return;
    }

    cartEmpty.style.display = 'none';
    analyzeBtn.disabled = false;

    APP.cart.forEach(function(gene) {
      var item = document.createElement('div');
      item.className = 'cart-item';

      var sym = document.createElement('span');
      sym.className = 'cart-gene-symbol';
      sym.textContent = gene.symbol;

      var info = document.createElement('span');
      info.className = 'cart-gene-info';
      info.textContent = fmtSize(gene.end - gene.start);

      var chr = document.createElement('span');
      chr.className = 'cart-gene-chr';
      chr.textContent = gene.chr.replace('chr', '');

      var removeBtn = document.createElement('button');
      removeBtn.className = 'cart-remove-btn';
      removeBtn.textContent = '\u2715';
      removeBtn.title = 'Remove ' + gene.symbol;
      removeBtn.addEventListener('click', function() {
        APP.removeFromCart(gene.symbol);
      });

      item.appendChild(sym);
      item.appendChild(info);
      item.appendChild(chr);
      item.appendChild(removeBtn);
      cartList.appendChild(item);
    });
  }

  // ── Cart stats ─────────────────────────────────────────────────
  function renderCartStats() {
    var count = APP.cart.length;
    var totalBp = 0;
    var wSnv = 0, wIndel = 0;

    APP.cart.forEach(function(g) {
      var size = g.end - g.start;
      totalBp += size;
      var m = synthMetrics(g, APP.currentDepth);
      wSnv += m.snv_fscore * size;
      wIndel += m.indel_fscore * size;
    });

    document.getElementById('cartCountStat').textContent = count;
    document.getElementById('cartSizeStat').textContent = totalBp > 0 ? fmtSize(totalBp) : '0 bp';

    var snvEl = document.getElementById('cartSnvStat');
    var indelEl = document.getElementById('cartIndelStat');

    if (count > 0) {
      var avgSnv = wSnv / totalBp;
      var avgIndel = wIndel / totalBp;
      snvEl.textContent = avgSnv.toFixed(4);
      snvEl.className = 'stat-value ' + (avgSnv >= 0.995 ? 'value-green' : avgSnv >= 0.990 ? 'value-yellow' : 'value-red');
      indelEl.textContent = avgIndel.toFixed(4);
      indelEl.className = 'stat-value ' + (avgIndel >= 0.990 ? 'value-green' : avgIndel >= 0.980 ? 'value-yellow' : 'value-red');
    } else {
      snvEl.textContent = '\u2014';
      snvEl.className = 'stat-value';
      indelEl.textContent = '\u2014';
      indelEl.className = 'stat-value';
    }

    // Update tab badge
    var badge = document.getElementById('buildBadge');
    if (badge) badge.textContent = count > 0 ? count : '';
  }

  // ── Cart event listeners ───────────────────────────────────────
  APP.on('cartChanged', function() {
    renderCart();
    renderCartStats();
  });

  APP.on('depthChanged', function() {
    renderCartStats();
  });

  // ── Clear cart ─────────────────────────────────────────────────
  document.getElementById('cartClearBtn').addEventListener('click', function() {
    if (APP.cart.length > 0) APP.clearCart();
  });

  // ── Analyze button ─────────────────────────────────────────────
  analyzeBtn.addEventListener('click', function() {
    if (APP.cart.length === 0) return;
    var regions = APP.cart.map(function(g) {
      return { chr: g.chr, start: g.start, end: g.end, name: g.symbol };
    });
    APP.analyzePanel(regions, 'Custom Panel (' + APP.cart.length + ' genes)');
  });

  // ── Preset panel loading ───────────────────────────────────────
  function renderPresets() {
    var container = document.getElementById('buildPresets');
    var keys = Object.keys(PANEL_PRESETS);
    keys.forEach(function(key) {
      var preset = PANEL_PRESETS[key];
      var btn = document.createElement('button');
      btn.className = 'preset-btn';

      var label = document.createTextNode(preset.name + ' ');
      var count = document.createElement('span');
      count.className = 'gene-count';
      count.textContent = preset.genes.length + ' genes';

      btn.appendChild(label);
      btn.appendChild(count);
      btn.addEventListener('click', function() {
        APP.loadCartPreset(preset.genes);
      });
      container.appendChild(btn);
    });
  }

  // ── Import modal ───────────────────────────────────────────────
  document.getElementById('buildImportBtn').addEventListener('click', function() {
    importTextarea.value = '';
    importModal.classList.add('active');
    setTimeout(function() { importTextarea.focus(); }, 100);
  });

  document.getElementById('importCancelBtn').addEventListener('click', function() {
    importModal.classList.remove('active');
  });

  document.getElementById('importSubmitBtn').addEventListener('click', function() {
    var text = importTextarea.value.trim();
    if (!text) return;

    // Parse gene list: one per line, or comma/tab separated
    var symbols = text.split(/[\n,\t]+/).map(function(s) { return s.trim().toUpperCase(); }).filter(Boolean);
    var added = 0;
    var notFound = [];
    var duplicates = [];

    symbols.forEach(function(sym) {
      var gene = getGeneBySymbol(sym);
      if (gene) {
        if (APP.addToCart(gene)) added++;
        else duplicates.push(sym);
      } else {
        notFound.push(sym);
      }
    });

    importModal.classList.remove('active');

    var parts = ['Added ' + added + ' gene(s).'];
    if (duplicates.length > 0) {
      parts.push('Already in panel (' + duplicates.length + '): ' + duplicates.slice(0, 5).join(', ') + (duplicates.length > 5 ? '...' : ''));
    }
    if (notFound.length > 0) {
      parts.push('Not found (' + notFound.length + '): ' + notFound.slice(0, 10).join(', ') + (notFound.length > 10 ? '...' : ''));
    }
    if (duplicates.length > 0 || notFound.length > 0) {
      alert(parts.join('\n'));
    }
  });

  // Close modal on backdrop click
  importModal.addEventListener('click', function(e) {
    if (e.target === importModal) importModal.classList.remove('active');
  });

})();
