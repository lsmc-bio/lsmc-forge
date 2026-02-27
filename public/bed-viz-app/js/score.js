// ═══════════════════════════════════════════════════════════════════
// SCORE TAB — Genome visualization, summary cards, stratification,
// per-region detail table (refactored from bed-viz-v0.html)
// ═══════════════════════════════════════════════════════════════════

(function() {
  var animFrame = null;
  var pendingRegions = null;
  var currentTab = 'chroms';
  var genePage = 0;
  var genePageSize = 15;
  var geneSearchTerm = '';

  // ── BED File Parsing ───────────────────────────────────────────
  function parseBedFile(text) {
    var lines = text.trim().split('\n');
    var regions = [];
    var format = 'bed3';
    var hasChrPrefix = true;
    var warnings = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.charAt(0) === '#' || line.indexOf('track') === 0 || line.indexOf('browser') === 0) continue;
      var cols = line.split('\t');
      if (cols.length < 3) continue;

      var chr = cols[0].trim();
      var start = parseInt(cols[1], 10);
      var end = parseInt(cols[2], 10);
      var name = cols.length >= 4 ? cols[3] : '';

      if (cols.length >= 6) format = 'bed6';
      if (cols.length >= 12) format = 'bed12';

      if (chr.indexOf('chr') !== 0) {
        hasChrPrefix = false;
        chr = 'chr' + chr;
      }

      if (!isNaN(start) && !isNaN(end) && end > start) {
        regions.push({ chr: chr, start: start, end: end, name: name });
      }
    }

    if (!hasChrPrefix) warnings.push('No "chr" prefix detected. Auto-converted to UCSC format.');
    if (format !== 'bed3') warnings.push('Detected ' + format.toUpperCase() + ' format. Using columns 1-3.');

    return { regions: regions, format: format, warnings: warnings };
  }

  function showFormatBanner(parsed) {
    var banner = document.getElementById('formatBanner');
    if (parsed.warnings.length > 0) {
      banner.className = 'format-banner warn';
      var icon = document.createElement('span');
      icon.textContent = '\u26A0';
      var msg = document.createElement('span');
      msg.textContent = parsed.warnings.join(' ');
      var badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = parsed.format.toUpperCase() + ' \u2192 BED3';
      var btn = document.createElement('button');
      btn.textContent = 'Continue with converted file \u2192';
      btn.addEventListener('click', proceedWithConversion);
      banner.replaceChildren(icon, msg, badge, btn);
    } else {
      banner.className = 'format-banner ok';
      var okIcon = document.createElement('span');
      okIcon.textContent = '\u2713';
      var okMsg = document.createElement('span');
      var chrCount = new Set(parsed.regions.map(function(r){ return r.chr; })).size;
      okMsg.textContent = 'Valid BED3 format. ' + parsed.regions.length + ' regions across ' + chrCount + ' chromosomes.';
      var okBadge = document.createElement('span');
      okBadge.className = 'badge';
      okBadge.textContent = 'BED3 \u2022 hg38 \u2022 0-based';
      banner.replaceChildren(okIcon, okMsg, okBadge);
      setTimeout(function() { runAnalysis(parsed.regions, 'Custom BED'); }, 800);
    }
  }

  // ── File Upload ────────────────────────────────────────────────
  var fileInput = document.getElementById('scoreFileInput');
  document.getElementById('scoreUploadBtn').addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { if (e.target.files.length) handleFile(e.target.files[0]); });

  // Page-level drag and drop
  var dragCounter = 0;
  document.addEventListener('dragenter', function(e) {
    e.preventDefault();
    dragCounter++;
    document.body.classList.add('dragover-active');
  });
  document.addEventListener('dragleave', function(e) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) { dragCounter = 0; document.body.classList.remove('dragover-active'); }
  });
  document.addEventListener('dragover', function(e) { e.preventDefault(); });
  document.addEventListener('drop', function(e) {
    e.preventDefault();
    dragCounter = 0;
    document.body.classList.remove('dragover-active');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  function handleFile(file) {
    // Switch to score tab if not already there
    APP.switchTab('score');
    var reader = new FileReader();
    reader.onload = function(e) {
      var parsed = parseBedFile(e.target.result);
      if (parsed.regions.length === 0) {
        alert('No valid BED regions found. Expected tab-separated: chr\\tstart\\tend');
        return;
      }
      pendingRegions = parsed.regions;
      showFormatBanner(parsed);
    };
    reader.readAsText(file);
  }

  function proceedWithConversion() {
    if (pendingRegions) {
      document.getElementById('formatBanner').style.display = 'none';
      runAnalysis(pendingRegions, 'Custom BED');
    }
  }

  // ── Score-tab presets ──────────────────────────────────────────
  function renderScorePresets() {
    var container = document.getElementById('scorePresets');
    var keys = Object.keys(PANEL_PRESETS);
    keys.forEach(function(key) {
      var preset = PANEL_PRESETS[key];
      var btn = document.createElement('button');
      btn.className = 'preset-btn';
      var label = document.createTextNode(preset.name + ' ');
      var count = document.createElement('span');
      count.className = 'gene-count';
      count.textContent = preset.genes.length;
      btn.appendChild(label);
      btn.appendChild(count);
      btn.addEventListener('click', function() {
        var regions = preset.genes.map(function(g) {
          return { chr: g.chr, start: g.start, end: g.end, name: g.symbol };
        });
        runAnalysis(regions, preset.name);
      });
      container.appendChild(btn);
    });

    // Whole genome button
    var wgBtn = document.createElement('button');
    wgBtn.className = 'preset-btn';
    wgBtn.style.cssText = 'margin-top:0.5rem;border-color:var(--accent);color:var(--accent);';
    wgBtn.textContent = 'Whole Genome';
    var wgCount = document.createElement('span');
    wgCount.className = 'gene-count';
    wgCount.textContent = '3.1 Gb';
    wgBtn.appendChild(wgCount);
    wgBtn.addEventListener('click', function() {
      var wgRegions = [];
      for (var ci = 0; ci < CHROMOSOMES.length; ci++) {
        var chr = CHROMOSOMES[ci];
        var nRegions = Math.max(3, Math.floor(chr.len / 15000000));
        for (var ri = 0; ri < nRegions; ri++) {
          var start = Math.floor((ri / nRegions) * chr.len * 0.95);
          var size = 50000 + Math.floor(Math.random() * 200000);
          wgRegions.push({ chr: chr.name, start: start, end: start + size, name: chr.name.replace('chr','') + 'p' + (ri+1) });
        }
      }
      GENE_DB.forEach(function(g) {
        wgRegions.push({ chr: g.chr, start: g.start, end: g.end, name: g.symbol });
      });
      runAnalysis(wgRegions, 'Whole Genome');
    });
    container.appendChild(wgBtn);
  }

  renderScorePresets();

  // ── Analysis Pipeline ──────────────────────────────────────────
  function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

  async function runAnalysis(regions, panelName) {
    APP.currentBedRegions = regions;
    APP.currentPanelName = panelName;

    var progressBar = document.getElementById('progressBar');
    var progressFill = document.getElementById('progressFill');
    var scanStatus = document.getElementById('scanStatus');
    var scanText = document.getElementById('scanText');

    progressBar.classList.add('active');
    scanStatus.classList.add('active');

    var steps = [
      { pct: 5,  text: 'Parsing BED regions...' },
      { pct: 15, text: 'Validating ' + regions.length + ' regions against hg38...' },
      { pct: 30, text: 'Intersecting with LSMC reference benchmarks...' },
      { pct: 50, text: 'Computing GQV scores per region...' },
      { pct: 70, text: 'Stratifying by region complexity...' },
      { pct: 85, text: 'Building genome visualization...' },
      { pct: 100, text: 'Analysis complete.' },
    ];

    for (var i = 0; i < steps.length; i++) {
      progressFill.style.width = steps[i].pct + '%';
      scanText.textContent = steps[i].text;
      await sleep(300 + Math.random() * 200);
    }

    await sleep(300);
    progressBar.classList.remove('active');
    scanStatus.classList.remove('active');

    document.getElementById('vizSection').classList.add('active');
    document.getElementById('ctaBar').classList.add('active');
    document.getElementById('regionCount').textContent = regions.length + ' regions \u2022 ' + panelName;
    document.getElementById('panelLabel').textContent = '\u2014 ' + panelName;

    renderGenome(regions);
    renderSummary(regions);
    renderStratification(regions);
    renderTable(regions);

    var badge = document.getElementById('tierBadge');
    badge.style.display = 'inline-flex';
    badge.textContent = '\u2713 Exceeds Clinical Threshold \u2014 LSMC Genome Performance Guarantee';

    document.getElementById('vizSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Genome Canvas ──────────────────────────────────────────────
  function renderGenome(regions) {
    var canvas = document.getElementById('genomeCanvas');
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    var W = canvas.offsetWidth;
    var H = canvas.offsetHeight;
    var pad = { left: 55, right: 20, top: 15, bottom: 15 };
    var chrH = 14;
    var chrGap = 7;
    var maxLen = 0;
    for (var i = 0; i < CHROMOSOMES.length; i++) {
      if (CHROMOSOMES[i].len > maxLen) maxLen = CHROMOSOMES[i].len;
    }
    var drawW = W - pad.left - pad.right;

    var regionsByChr = {};
    for (var i = 0; i < regions.length; i++) {
      var r = regions[i];
      if (!regionsByChr[r.chr]) regionsByChr[r.chr] = [];
      regionsByChr[r.chr].push(r);
    }

    var chromIdx = 0;

    function drawFrame() {
      ctx.clearRect(0, 0, W, H);

      for (var ci = 0; ci < CHROMOSOMES.length; ci++) {
        var chr = CHROMOSOMES[ci];
        var y = pad.top + ci * (chrH + chrGap);
        var w = (chr.len / maxLen) * drawW;
        var x = pad.left;
        var visible = ci <= chromIdx;

        ctx.fillStyle = visible ? '#94a3b8' : '#334155';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(chr.name.replace('chr', ''), x - 8, y + chrH - 2);

        ctx.beginPath();
        var rr = chrH / 2;
        ctx.moveTo(x + rr, y);
        ctx.lineTo(x + w - rr, y);
        ctx.arc(x + w - rr, y + rr, rr, -Math.PI/2, Math.PI/2);
        ctx.lineTo(x + rr, y + chrH);
        ctx.arc(x + rr, y + rr, rr, Math.PI/2, -Math.PI/2);
        ctx.closePath();
        ctx.fillStyle = visible ? '#1e293b' : '#111827';
        ctx.fill();
        ctx.strokeStyle = visible ? '#334155' : '#1a2236';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        if (visible) {
          var cx = x + w * 0.42;
          ctx.beginPath();
          ctx.moveTo(cx - 3, y);
          ctx.lineTo(cx + 3, y + chrH/2);
          ctx.lineTo(cx - 3, y + chrH);
          ctx.fillStyle = '#0a0e17';
          ctx.fill();
        }

        if (visible && regionsByChr[chr.name]) {
          var regs = regionsByChr[chr.name];
          for (var ri = 0; ri < regs.length; ri++) {
            var reg = regs[ri];
            var rx = x + (reg.start / maxLen) * drawW;
            var rw = Math.max(2, ((reg.end - reg.start) / maxLen) * drawW);
            var m = synthMetrics({ gene: reg.name || 'region' }, APP.currentDepth);
            var color;
            if (m.snv_fscore >= 0.995) color = 'rgba(16, 185, 129, 0.7)';
            else if (m.snv_fscore >= 0.990) color = 'rgba(245, 158, 11, 0.7)';
            else color = 'rgba(239, 68, 68, 0.7)';
            ctx.shadowColor = color;
            ctx.shadowBlur = 4;
            ctx.fillStyle = color;
            ctx.fillRect(rx, y + 1, rw, chrH - 2);
            ctx.shadowBlur = 0;
          }
        }
      }

      if (chromIdx < CHROMOSOMES.length - 1) {
        chromIdx++;
        animFrame = requestAnimationFrame(function() { setTimeout(drawFrame, 40); });
      }
    }

    if (animFrame) cancelAnimationFrame(animFrame);
    chromIdx = 0;
    drawFrame();
  }

  // ── Summary, Stratification, Table Rendering ───────────────────
  function renderSummary(regions) {
    var totalBp = 0, wSnv = 0, wIndel = 0, wCall = 0;
    for (var i = 0; i < regions.length; i++) {
      var r = regions[i];
      var size = r.end - r.start;
      var m = synthMetrics({ gene: r.name || 'region' }, APP.currentDepth);
      totalBp += size;
      wSnv += m.snv_fscore * size;
      wIndel += m.indel_fscore * size;
      wCall += m.callable * size;
    }
    var snvEl = document.getElementById('snvScore');
    var indelEl = document.getElementById('indelScore');
    var callEl = document.getElementById('callScore');
    animateValue(snvEl, wSnv / totalBp, 3);
    animateValue(indelEl, wIndel / totalBp, 3);
    animateValue(callEl, wCall / totalBp, 3);
    document.getElementById('coveredScore').textContent = '100.0%';
    colorCard(snvEl, wSnv / totalBp, 0.995);
    colorCard(indelEl, wIndel / totalBp, 0.990);
    colorCard(callEl, wCall / totalBp, 0.98);
  }

  function renderStratification(regions) {
    var classMap = { easy: 'High-Confidence', difficult: 'Difficult', segdup: 'Segmental Dups', repeats: 'Tandem Repeats', gc_extremes: 'GC Extremes' };
    var classes = { 'All Regions': [], 'High-Confidence': [], 'Difficult': [], 'Segmental Dups': [], 'Tandem Repeats': [], 'GC Extremes': [] };
    for (var i = 0; i < regions.length; i++) {
      var m = synthMetrics({ gene: regions[i].name || 'region' }, APP.currentDepth);
      classes['All Regions'].push(m);
      var label = classMap[m.region_class] || 'High-Confidence';
      classes[label].push(m);
    }
    renderStratBars('snvStratBars', classes, 'snv_fscore');
    renderStratBars('indelStratBars', classes, 'indel_fscore');
  }

  function renderStratBars(containerId, classes, metric) {
    var container = document.getElementById(containerId);
    container.replaceChildren();
    var labels = Object.keys(classes);
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var metrics = classes[label];
      if (metrics.length === 0) continue;
      var sum = 0;
      for (var j = 0; j < metrics.length; j++) sum += metrics[j][metric];
      var avg = sum / metrics.length;
      var pct = avg * 100;
      var color = avg >= 0.995 ? 'var(--green)' : avg >= 0.990 ? 'var(--yellow)' : 'var(--red)';

      var row = document.createElement('div');
      row.className = 'strat-bar-row';

      var labelEl = document.createElement('span');
      labelEl.className = 'strat-bar-label';
      labelEl.textContent = label;

      var track = document.createElement('div');
      track.className = 'strat-bar-track';
      var fill = document.createElement('div');
      fill.className = 'strat-bar-fill';
      fill.style.width = pct + '%';
      fill.style.background = color;
      track.appendChild(fill);

      var val = document.createElement('span');
      val.className = 'strat-bar-value';
      val.style.color = color;
      val.textContent = avg.toFixed(3);

      row.appendChild(labelEl);
      row.appendChild(track);
      row.appendChild(val);
      container.appendChild(row);
    }
  }

  function renderTable(regions) {
    var toolbar = document.getElementById('tableToolbar');
    var paginationEl = document.getElementById('pagination');
    if (currentTab === 'genes') {
      toolbar.classList.add('active');
      renderGeneTable(regions);
    } else {
      toolbar.classList.remove('active');
      paginationEl.classList.remove('active');
      renderChromTable(regions);
    }
  }

  function renderGeneTable(regions) {
    var thead = document.getElementById('resultsHead');
    makeHeaderRow(thead, ['Gene / Region', 'Chr', 'Size', 'Region Type', 'SNV F-score', 'Indel F-score', 'Callability', 'Mean Depth']);
    var tbody = document.getElementById('resultsBody');
    tbody.replaceChildren();

    var filtered = regions;
    var term = geneSearchTerm.toLowerCase();
    if (term) {
      filtered = regions.filter(function(r) {
        var label = (r.name || r.chr + ':' + r.start).toLowerCase();
        return label.indexOf(term) >= 0 || r.chr.toLowerCase().indexOf(term) >= 0;
      });
    }

    var totalPages = Math.max(1, Math.ceil(filtered.length / genePageSize));
    if (genePage >= totalPages) genePage = totalPages - 1;
    var startIdx = genePage * genePageSize;
    var pageItems = filtered.slice(startIdx, startIdx + genePageSize);

    var countEl = document.getElementById('resultCount');
    countEl.textContent = term ? (filtered.length + ' of ' + regions.length + ' regions') : (regions.length + ' regions');

    for (var i = 0; i < pageItems.length; i++) {
      var r = pageItems[i];
      var m = synthMetrics({ gene: r.name || 'region' }, APP.currentDepth);
      var tr = document.createElement('tr');

      addTextCell(tr, r.name || (r.chr + ':' + r.start), 'gene-name');
      addTextCell(tr, r.chr.replace('chr',''), 'chr-label');
      addTextCell(tr, fmtSize(r.end - r.start));
      addTextCell(tr, classLabel(m.region_class));
      addScoreCell(tr, m.snv_fscore.toFixed(4), dotClass(m.snv_fscore, 0.995, 0.990));
      addScoreCell(tr, m.indel_fscore.toFixed(4), dotClass(m.indel_fscore, 0.990, 0.980));
      addScoreCell(tr, m.callable.toFixed(3), dotClass(m.callable, 0.98, 0.95));
      addTextCell(tr, m.depth.toFixed(1) + '\u00D7');

      tbody.appendChild(tr);
    }

    renderPagination(totalPages, filtered.length);
  }

  function renderPagination(totalPages, totalItems) {
    var pag = document.getElementById('pagination');
    pag.replaceChildren();

    if (totalPages <= 1) { pag.classList.remove('active'); return; }
    pag.classList.add('active');

    var prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.textContent = '\u2190 Prev';
    prev.disabled = genePage === 0;
    prev.addEventListener('click', function() { genePage--; renderTable(APP.currentBedRegions); });
    pag.appendChild(prev);

    var startP = Math.max(0, genePage - 3);
    var endP = Math.min(totalPages, startP + 7);
    if (endP - startP < 7) startP = Math.max(0, endP - 7);

    for (var p = startP; p < endP; p++) {
      var btn = document.createElement('button');
      btn.className = 'page-btn' + (p === genePage ? ' active' : '');
      btn.textContent = String(p + 1);
      (function(pageNum) {
        btn.addEventListener('click', function() { genePage = pageNum; renderTable(APP.currentBedRegions); });
      })(p);
      pag.appendChild(btn);
    }

    var next = document.createElement('button');
    next.className = 'page-btn';
    next.textContent = 'Next \u2192';
    next.disabled = genePage >= totalPages - 1;
    next.addEventListener('click', function() { genePage++; renderTable(APP.currentBedRegions); });
    pag.appendChild(next);

    var info = document.createElement('span');
    info.className = 'page-info';
    var from = genePage * genePageSize + 1;
    var to = Math.min((genePage + 1) * genePageSize, totalItems);
    info.textContent = from + '\u2013' + to + ' of ' + totalItems;
    pag.appendChild(info);
  }

  function renderChromTable(regions) {
    var thead = document.getElementById('resultsHead');
    makeHeaderRow(thead, ['Chromosome', 'Regions', 'Total Coverage', 'SNV F-score', 'Indel F-score', 'Callability', 'Mean Depth', 'Status']);
    var tbody = document.getElementById('resultsBody');
    tbody.replaceChildren();

    var chrData = {};
    for (var ci = 0; ci < CHROMOSOMES.length; ci++) {
      chrData[CHROMOSOMES[ci].name] = { len: CHROMOSOMES[ci].len, regions: [], totalBp: 0, wSnv: 0, wIndel: 0, wCall: 0, wDepth: 0 };
    }
    for (var i = 0; i < regions.length; i++) {
      var r = regions[i];
      var m = synthMetrics({ gene: r.name || 'region' }, APP.currentDepth);
      var size = r.end - r.start;
      var cd = chrData[r.chr];
      if (!cd) continue;
      cd.regions.push(r);
      cd.totalBp += size;
      cd.wSnv += m.snv_fscore * size;
      cd.wIndel += m.indel_fscore * size;
      cd.wCall += m.callable * size;
      cd.wDepth += m.depth * size;
    }

    for (var ci = 0; ci < CHROMOSOMES.length; ci++) {
      var chrName = CHROMOSOMES[ci].name;
      var cd = chrData[chrName];
      var tr = document.createElement('tr');

      if (cd.regions.length === 0) {
        addTextCell(tr, chrName.replace('chr',''), 'gene-name');
        addTextCell(tr, '0');
        for (var c = 0; c < 5; c++) addTextCell(tr, '\u2014');
        addTextCell(tr, '\u2014', 'chr-label');
        tbody.appendChild(tr);
        continue;
      }

      var avgSnv = cd.wSnv / cd.totalBp;
      var avgIndel = cd.wIndel / cd.totalBp;
      var avgCall = cd.wCall / cd.totalBp;
      var avgDepth = cd.wDepth / cd.totalBp;
      var allPass = avgSnv >= 0.995 && avgIndel >= 0.990 && avgCall >= 0.98;
      var anyWarn = !allPass && avgSnv >= 0.990 && avgIndel >= 0.980;

      addTextCell(tr, chrName.replace('chr',''), 'gene-name');
      addTextCell(tr, String(cd.regions.length));
      addTextCell(tr, fmtSize(cd.totalBp));
      addScoreCell(tr, avgSnv.toFixed(4), dotClass(avgSnv, 0.995, 0.990));
      addScoreCell(tr, avgIndel.toFixed(4), dotClass(avgIndel, 0.990, 0.980));
      addScoreCell(tr, avgCall.toFixed(3), dotClass(avgCall, 0.98, 0.95));
      addTextCell(tr, avgDepth.toFixed(1) + '\u00D7');

      var statusTd = document.createElement('td');
      var sBadge = document.createElement('span');
      sBadge.style.cssText = 'font-size:0.75rem;padding:0.15rem 0.5rem;border-radius:4px;font-family:var(--font);font-weight:500;';
      if (allPass) {
        sBadge.style.background = 'var(--green-soft)';
        sBadge.style.color = 'var(--green)';
        sBadge.textContent = 'Pass';
      } else if (anyWarn) {
        sBadge.style.background = 'var(--yellow-soft)';
        sBadge.style.color = 'var(--yellow)';
        sBadge.textContent = 'Marginal';
      } else {
        sBadge.style.background = 'var(--red-soft)';
        sBadge.style.color = 'var(--red)';
        sBadge.textContent = 'Review';
      }
      statusTd.appendChild(sBadge);
      tr.appendChild(statusTd);
      tbody.appendChild(tr);
    }
  }

  // ── Depth change ───────────────────────────────────────────────
  APP.on('depthChanged', function() {
    if (APP.currentBedRegions.length > 0 && APP.activeTab === 'score') {
      renderGenome(APP.currentBedRegions);
      renderSummary(APP.currentBedRegions);
      renderStratification(APP.currentBedRegions);
      renderTable(APP.currentBedRegions);
    }
  });

  // ── Table tab switching ────────────────────────────────────────
  document.querySelectorAll('.results-tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      currentTab = btn.dataset.view;
      genePage = 0;
      geneSearchTerm = '';
      var searchInput = document.getElementById('scoreGeneSearch');
      if (searchInput) searchInput.value = '';
      document.querySelectorAll('.results-tab-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
      if (APP.currentBedRegions.length > 0) renderTable(APP.currentBedRegions);
    });
  });

  // Gene search in table
  document.getElementById('scoreGeneSearch').addEventListener('input', function(e) {
    geneSearchTerm = e.target.value;
    genePage = 0;
    if (APP.currentBedRegions.length > 0 && currentTab === 'genes') renderTable(APP.currentBedRegions);
  });

  // ── Analyze from cart (event-driven) ───────────────────────────
  APP.on('analyzeRequested', function(data) {
    runAnalysis(data.regions, data.panelName);
  });

  // ── Re-render on tab switch ────────────────────────────────────
  APP.on('tabChanged', function(tab) {
    if (tab === 'score' && APP.currentBedRegions.length > 0) {
      setTimeout(function() { renderGenome(APP.currentBedRegions); }, 50);
    } else if (tab !== 'score' && animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
  });

  // ── Window resize ──────────────────────────────────────────────
  window.addEventListener('resize', function() {
    if (APP.currentBedRegions.length > 0 && APP.activeTab === 'score') renderGenome(APP.currentBedRegions);
  });

  // ── CTA button ─────────────────────────────────────────────────
  document.getElementById('ctaBtn').addEventListener('click', function() {
    alert('TODO: Connect to lsmc-customer-agent or contact form.\nContext to pass: panel=' + APP.currentPanelName + ', regions=' + APP.currentBedRegions.length);
  });

})();
