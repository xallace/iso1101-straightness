/* ==========================================================================
   app.js — Straightness Lab State, Figure Selector, Guided Tour,
            Parametric ISO 1101 Sliders, 3D Call-Outs, EN/DE Localization
   ========================================================================== */
(function (global) {
  'use strict';

  const D = global.ISO_DATA;
  const P = global.ISO_PHYSICS;
  const S3D = global.ISO_SCENE3D;
  const D2 = global.ISO_DRAW2D;

  const state = {
    lang: 'en',                  // 'en' | 'de'
    activeTab: 'atlas',          // 'atlas' | 'lab' | 'concepts' | 'reading'
    atlasFigure: 'overview',     // 'overview' | 'fig_f' .. 'fig_i'
    variantState: 'error',       // 'nominal' | 'error'
    selectedCalloutId: null,
    displayMode: 'solid3d',      // 'solid3d' | 'exploded' | 'plate2d' | 'wireframe'
    showCallouts: true,
    showZone: true,
    showPlanes: true,
    paused: false,

    // Tour
    tourActive: false,
    tourIndex: 0,
    tourAuto: false,
    tourTimer: null,

    // Lab
    activePresetId: 'fig_f',
    labParams: { ...D.LAB_PRESETS.fig_f.params },
    labResult: null,
    simClock: 0,
  };

  let sceneMgr = null;
  let calloutDomMap = new Map();

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function t() {
    return D.UI_TEXT[state.lang] || D.UI_TEXT.en;
  }

  function applyStaticTranslations() {
    const txt = t();
    $('#ui-brand-title').textContent = txt.brandTitle;
    $('#ui-brand-sub').textContent = txt.brandSub;
    $('#ui-source-ref').textContent = txt.sourceRef;
    $('#tab-btn-atlas').textContent = txt.tabAtlas;
    $('#tab-btn-lab').textContent = txt.tabLab;
    $('#tab-btn-concepts').textContent = txt.tabConcepts;
    $('#tab-btn-reading').textContent = txt.tabReading;
    $('#ui-btn-tour').textContent = txt.btnTour;
    $('#play-label').textContent = txt.btnPlay;
    $('#btn-overview').textContent = txt.btnOverview;
    $('#btn-vstate-nom').textContent = txt.stateNominal;
    $('#btn-vstate-err').textContent = txt.stateError;
    $('#opt-solid').textContent = txt.modeSolid;
    $('#opt-exploded').textContent = txt.modeExploded;
    $('#opt-plate2d').textContent = txt.modePlate2d;
    $('#opt-wire').textContent = txt.modeWireframe;
    $('#btn-toggle-callouts').textContent = txt.togCallouts;
    $('#btn-toggle-zone').textContent = txt.togZone;
    $('#btn-toggle-planes').textContent = txt.togPlanes;
    $('#btn-reset-cam').textContent = txt.btnResetCam;
    $('#cam-iso').textContent = txt.camIso;
    $('#cam-top').textContent = txt.camTop;
    $('#cam-front').textContent = txt.camFront;
    $('#cam-end').textContent = txt.camEnd;
    $('#leg-surf').textContent = txt.legendSurface;
    $('#leg-cut').textContent = txt.legendCut;
    $('#leg-zone').textContent = txt.legendZone;
    $('#leg-fail').textContent = txt.legendFail;
    $('#leg-dat').textContent = txt.legendDatum;
    $('#atlas-snapshot-heading').textContent = txt.snapshotHeading;
    $('#btn-open-in-lab').textContent = txt.ctaOpenLab;

    $('#ui-lab-kicker').textContent = txt.labKicker;
    $('#ui-lab-title').textContent = txt.labTitle;
    $('#btn-reset-lab').textContent = txt.btnResetLab;
    $('#ui-grp-ind').textContent = txt.groupIndicator;
    $('#ui-lbl-ind').textContent = txt.labelIndType;
    $('#btn-ind-inter').textContent = txt.indIntersection;
    $('#btn-ind-orient').textContent = txt.indOrientation;
    $('#ui-lbl-rel').textContent = txt.labelRelation;
    $('#btn-rel-par').textContent = txt.relParallel;
    $('#btn-rel-perp').textContent = txt.relPerp;
    $('#ui-lbl-dat').textContent = txt.labelDatum;
    $('#ui-grp-def').textContent = txt.groupDeform;

    $('#ui-concepts-kicker').textContent = txt.conceptsKicker;
    $('#ui-concepts-title').textContent = txt.conceptsTitle;
    $('#ui-concepts-intro').textContent = txt.conceptsIntro;
    $('#ui-laws-heading').textContent = txt.lawsHeading;
    $('#ui-book-head-l').textContent = txt.bookHeaderLeft;
    $('#ui-book-head-r').textContent = txt.bookHeaderRight;
    $('#ui-book-title').textContent = txt.bookTitle;
    $('#ui-book-note').textContent = txt.bookNote;
    $('#ui-reading-kicker').textContent = txt.readingKicker;
    $('#ui-reading-title').textContent = txt.readingTitle;
    $('#ui-reading-intro').textContent = txt.readingIntro;
    $('#ui-read-col1').textContent = txt.readingCol1;
    $('#ui-read-col2').textContent = txt.readingCol2;

    populateFigureDropdown();
    buildPresetButtons();
    buildLabControls();
    buildEditorialViews();
    if (state.tourActive) renderTourCard();
  }

  // --------------------------------------------------------------------------
  // Tab Switching
  // --------------------------------------------------------------------------
  function setActiveTab(tab) {
    state.activeTab = tab;
    $$('.tab-btn').forEach((b) => {
      const on = b.dataset.tab === tab;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    const isInteractive = tab === 'atlas' || tab === 'lab';
    $('#interactive-shell').classList.toggle('hidden', !isInteractive);
    $('#concepts-view').classList.toggle('hidden', tab !== 'concepts');
    $('#reading-view').classList.toggle('hidden', tab !== 'reading');

    if (isInteractive) {
      const isLab = tab === 'lab';
      $('#atlas-figure-bar').classList.toggle('hidden', isLab);
      $('#lab-status-bar').classList.toggle('hidden', !isLab);
      $('#atlas-panel').classList.toggle('hidden', isLab);
      $('#lab-panel').classList.toggle('hidden', !isLab);
      $('#flow2d-strip').classList.toggle('hidden', !isLab);

      if (isLab && state.tourActive) stopTour();
      refresh3DScene(true);
      setTimeout(() => {
        sceneMgr.resize();
        render2DCanvases();
      }, 30);
    }
  }

  // --------------------------------------------------------------------------
  // 3D Scene & Call-Out Projection
  // --------------------------------------------------------------------------
  function refresh3DScene(resetCam) {
    if (!sceneMgr) return;
    sceneMgr.displayMode = state.displayMode;
    sceneMgr.showZone = state.showZone;
    sceneMgr.showPlanes = state.showPlanes;

    if (state.activeTab === 'lab') {
      state.labResult = P.solveTolerance(state.labParams);
      const figRef = state.labParams.indicatorType === 'intersection' ? 'fig_f' : 'fig_h';
      sceneMgr.showSingle(figRef, state.labParams);
      sceneMgr.setCallouts([]);
      syncCalloutDom();
      updateLabUI();
      if (resetCam) {
        const camPos = state.labParams.indicatorType === 'intersection'
          ? [2.75, 2.15, 2.95]
          : [2.75, 1.80, 2.95];
        sceneMgr.flyTo(camPos, [0.0, 0.34, 0.0], 600);
      }
      return;
    }

    const fid = state.atlasFigure;
    if (fid === 'overview') {
      sceneMgr.showOverview(D.FIGURES, D.OVERVIEW_IDS, state.variantState);
      sceneMgr.setCallouts(state.showCallouts ? D.OVERVIEW_IDS.map((id) => ({ id })) : []);
      syncCalloutDom();
      if (resetCam) {
        sceneMgr.flyTo([0.0, 7.1, 6.9], [0.0, 0.05, 0.0], 650);
      }
    } else {
      const fig = D.FIGURES[fid];
      const params = state.variantState === 'nominal' ? fig.nominalParams : fig.errorParams;
      sceneMgr.showSingle(fig.id, params);
      const loc = fig[state.lang] || fig.en;
      sceneMgr.setCallouts(state.showCallouts ? loc.callouts : []);
      syncCalloutDom();
      if (resetCam) {
        sceneMgr.flyTo(fig.cameraFocus.pos, fig.cameraFocus.target, 650);
      }
    }
    updateAtlasInspector();
  }

  function syncCalloutDom() {
    const svg = $('#callout-svg');
    const layer = $('#callout-layer');
    svg.innerHTML = '';
    layer.innerHTML = '';
    calloutDomMap.clear();

    if (!state.showCallouts || state.activeTab === 'lab') return;

    if (state.atlasFigure === 'overview') {
      D.OVERVIEW_IDS.forEach((fid) => {
        const fig = D.FIGURES[fid];
        const btn = document.createElement('button');
        btn.className = 'callout-pin overview-pin';
        const capTag = fig.fcf.capType === 'intersection' ? '⟨' : '⟨⟩';
        const relSym = fig.fcf.rel === 'parallel' ? '//' : '⊥';
        btn.innerHTML = `<span class="pin-num">${fig.code}</span> ${relSym} ${fig.fcf.datum} ${capTag}`;
        btn.addEventListener('click', () => selectAtlasFigure(fid));
        layer.appendChild(btn);
        calloutDomMap.set(fid, { btn, line: null, dot: null, offsetY: 0 });
      });
      return;
    }

    const fig = D.FIGURES[state.atlasFigure];
    const loc = fig[state.lang] || fig.en;
    loc.callouts.forEach((c, idx) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', '#d94426');
      line.setAttribute('stroke-width', '1.4');
      line.setAttribute('stroke-dasharray', '3 2');
      svg.appendChild(line);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3.5');
      dot.setAttribute('fill', '#d94426');
      svg.appendChild(dot);

      const btn = document.createElement('button');
      btn.className = 'callout-pin' + (state.selectedCalloutId === c.id ? ' selected' : '');
      btn.innerHTML = `<span class="pin-num">${idx + 1}</span> ${c.title}`;
      btn.addEventListener('click', () => selectCallout(c.id));
      layer.appendChild(btn);

      const offsetY = idx % 2 === 0 ? -34 : 34;
      calloutDomMap.set(c.id, { btn, line, dot, offsetY });
    });
  }

  function handleProjectedCallouts(items) {
    items.forEach((item) => {
      const entry = calloutDomMap.get(item.id);
      if (!entry) return;
      if (!item.visible) {
        entry.btn.style.display = 'none';
        if (entry.line) entry.line.style.display = 'none';
        if (entry.dot) entry.dot.style.display = 'none';
        return;
      }
      entry.btn.style.display = 'inline-flex';
      const bx = item.x;
      const by = item.y + entry.offsetY;
      entry.btn.style.left = `${bx.toFixed(1)}px`;
      entry.btn.style.top = `${by.toFixed(1)}px`;

      if (entry.line && entry.dot) {
        entry.line.style.display = '';
        entry.dot.style.display = '';
        entry.line.setAttribute('x1', item.x.toFixed(1));
        entry.line.setAttribute('y1', item.y.toFixed(1));
        entry.line.setAttribute('x2', bx.toFixed(1));
        entry.line.setAttribute('y2', by.toFixed(1));
        entry.dot.setAttribute('cx', item.x.toFixed(1));
        entry.dot.setAttribute('cy', item.y.toFixed(1));
      }
    });
  }

  function selectCallout(cid) {
    state.selectedCalloutId = state.selectedCalloutId === cid ? null : cid;
    $$('#callout-layer .callout-pin').forEach((p, i) => {
      const fig = D.FIGURES[state.atlasFigure];
      if (!fig) return;
      const loc = fig[state.lang] || fig.en;
      const c = loc.callouts[i];
      if (c) p.classList.toggle('selected', c.id === state.selectedCalloutId);
    });
    updateAtlasInspector();
  }

  // --------------------------------------------------------------------------
  // Atlas Inspector & Figure Selector
  // --------------------------------------------------------------------------
  function populateFigureDropdown() {
    const sel = $('#select-figure');
    const current = sel.value || state.atlasFigure;
    sel.innerHTML = '';
    D.FIGURE_ORDER.forEach((fid) => {
      const fig = D.FIGURES[fid];
      const loc = fig[state.lang] || fig.en;
      const opt = document.createElement('option');
      opt.value = fid;
      opt.textContent = `${fig.code} — ${loc.name}`;
      sel.appendChild(opt);
    });
    if (D.FIGURES[current]) sel.value = current;
  }

  function selectAtlasFigure(fid) {
    state.atlasFigure = fid;
    state.selectedCalloutId = null;

    const isOverview = fid === 'overview';
    $('#btn-overview').classList.toggle('active', isOverview);
    if (!isOverview) $('#select-figure').value = fid;

    refresh3DScene(true);
  }

  function updateAtlasInspector() {
    const txt = t();
    const fid = state.atlasFigure;
    const fcfWrap = $('#atlas-fcf-wrap');
    const listWrap = $('#callout-detail-list');
    const kpiWrap = $('#atlas-metrics');
    listWrap.innerHTML = '';
    kpiWrap.innerHTML = '';

    if (fid === 'overview') {
      $('#atlas-code').textContent = txt.overviewCode;
      $('#atlas-title').textContent = txt.overviewTitle;
      $('#atlas-cat-tag').textContent = txt.overviewCat;
      $('#atlas-summary').textContent = txt.overviewSummary;
      $('#atlas-quote').innerHTML = `<span class="book-note-tag">${txt.overviewQuoteTag}</span>${txt.overviewQuote}`;
      $('#atlas-list-heading').textContent = txt.listHeadingOverview;
      fcfWrap.innerHTML = '';

      D.OVERVIEW_IDS.forEach((id) => {
        const f = D.FIGURES[id];
        const loc = f[state.lang] || f.en;
        const item = document.createElement('div');
        item.className = 'callout-item';
        item.innerHTML = `
          <div class="callout-item-head">
            <span>${f.code} · ${loc.name}</span>
            <span class="callout-badge">${f.plate}</span>
          </div>
          <div class="callout-item-body">${loc.subtitle}</div>
        `;
        item.addEventListener('click', () => selectAtlasFigure(id));
        listWrap.appendChild(item);
      });

      const cards = [
        { lbl: state.lang === 'de' ? 'Ebenenindikatoren' : 'Plane Types', val: '2 (⟨ / ⟨⟩)', cls: 'accent' },
        { lbl: state.lang === 'de' ? 'Toleranzfälle' : 'Indicator Cases', val: 'I · II · III · IV', cls: '' },
        { lbl: state.lang === 'de' ? 'Normbezug' : 'Standard', val: 'ISO 1101', cls: 'good' },
      ];
      cards.forEach((c) => {
        kpiWrap.innerHTML += `<div class="kpi-card"><div class="kpi-label">${c.lbl}</div><div class="kpi-val ${c.cls}">${c.val}</div></div>`;
      });
      return;
    }

    const fig = D.FIGURES[fid];
    const loc = fig[state.lang] || fig.en;
    const params = state.variantState === 'nominal' ? fig.nominalParams : fig.errorParams;
    const res = P.solveTolerance(params);

    $('#atlas-code').textContent = `${fig.code} · ${fig.plate.toUpperCase()}`;
    $('#atlas-title').textContent = loc.name;
    $('#atlas-cat-tag').textContent = loc.category;
    $('#atlas-summary').textContent = loc.summary;
    $('#atlas-quote').innerHTML = `<span class="book-note-tag">${loc.bookPage}</span>${loc.bookNote}`;
    $('#atlas-list-heading').textContent = txt.listHeadingSingle;

    fcfWrap.innerHTML = `
      <div class="fcf-specimen-card">
        <div class="fcf-specimen-meta">
          <strong>${fig.plate}</strong>
          <span>${fig.fcf.terminator === 'dot' ? (state.lang === 'de' ? '• Flächenbezug' : '• Surface Target') : (state.lang === 'de' ? '▼ Kantenbezug' : '▼ Edge Target')}</span>
        </div>
        ${D.renderFcfSvg(fig.fcf)}
      </div>`;

    loc.callouts.forEach((c, idx) => {
      const el = document.createElement('div');
      el.className = 'callout-item' + (state.selectedCalloutId === c.id ? ' selected' : '');
      el.innerHTML = `
        <div class="callout-item-head">
          <span>${idx + 1}. ${c.title}</span>
          <span class="callout-badge">${c.badge}</span>
        </div>
        <div class="callout-item-body">${c.body}</div>
      `;
      el.addEventListener('click', () => selectCallout(c.id));
      listWrap.appendChild(el);
    });

    const cards = [
      {
        lbl: txt.kpiStraight,
        val: `${res.controlledError.toFixed(3)} mm`,
        cls: res.pass ? 'good' : 'warn',
      },
      {
        lbl: res.mode === 'intersection' ? txt.kpiFlatness : txt.kpiOrtho,
        val: `${(res.mode === 'intersection' ? res.flatnessError : res.orthogonalError).toFixed(3)} mm`,
        cls: 'accent',
      },
      {
        lbl: txt.kpiStatus,
        val: `${res.pass ? txt.passWord : txt.failWord} (${Math.round(res.utilizationPct)}%)`,
        cls: res.pass ? 'good' : 'warn',
      },
    ];
    cards.forEach((c) => {
      kpiWrap.innerHTML += `<div class="kpi-card"><div class="kpi-label">${c.lbl}</div><div class="kpi-val ${c.cls}">${c.val}</div></div>`;
    });
  }

  // --------------------------------------------------------------------------
  // Guided Tour
  // --------------------------------------------------------------------------
  function startTour(idx = 0) {
    state.tourActive = true;
    $('#tour-card').classList.remove('hidden');
    goToTourStop(idx);
  }

  function stopTour() {
    state.tourActive = false;
    state.tourAuto = false;
    if (state.tourTimer) {
      clearInterval(state.tourTimer);
      state.tourTimer = null;
    }
    $('#tour-card').classList.add('hidden');
  }

  function renderTourCard() {
    const stop = D.TOUR_STOPS[state.tourIndex];
    const txt = t();
    const isDe = state.lang === 'de';
    $('#tour-badge').textContent = isDe
      ? `Station ${state.tourIndex + 1} von ${D.TOUR_STOPS.length}`
      : `Stop ${state.tourIndex + 1} of ${D.TOUR_STOPS.length}`;
    $('#tour-title').textContent = isDe ? stop.titleDe : stop.titleEn;
    $('#tour-summary').textContent = isDe ? stop.summaryDe : stop.summaryEn;
    $('#tour-takeaway').textContent = isDe ? stop.takeawayDe : stop.takeawayEn;
    $('#btn-tour-prev').textContent = txt.prevStop;
    $('#btn-tour-auto').textContent = state.tourAuto ? '⏸ Pause' : txt.autoPlay;
    $('#btn-tour-next').textContent = state.tourIndex === D.TOUR_STOPS.length - 1 ? txt.finishTour : txt.nextStop;

    const dots = $('#tour-dots');
    dots.innerHTML = '';
    D.TOUR_STOPS.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'tour-dot' + (i === state.tourIndex ? ' active' : '');
      d.addEventListener('click', () => goToTourStop(i));
      dots.appendChild(d);
    });
  }

  function goToTourStop(idx) {
    state.tourIndex = (idx + D.TOUR_STOPS.length) % D.TOUR_STOPS.length;
    const stop = D.TOUR_STOPS[state.tourIndex];
    if (stop.variant) {
      state.variantState = stop.variant;
      $$('#variant-state-group .mini-btn').forEach((b) => b.classList.toggle('active', b.dataset.vstate === stop.variant));
    }
    selectAtlasFigure(stop.fig);
    renderTourCard();
  }

  function toggleTourAuto() {
    state.tourAuto = !state.tourAuto;
    if (state.tourTimer) {
      clearInterval(state.tourTimer);
      state.tourTimer = null;
    }
    if (state.tourAuto) {
      state.tourTimer = setInterval(() => {
        if (state.tourIndex >= D.TOUR_STOPS.length - 1) stopTour();
        else goToTourStop(state.tourIndex + 1);
      }, 5200);
    }
    renderTourCard();
  }

  // --------------------------------------------------------------------------
  // Parametric Tolerance Lab
  // --------------------------------------------------------------------------
  function getDeformSliderSpecs() {
    const isDe = state.lang === 'de';
    const isInter = state.labParams.indicatorType === 'intersection';
    const commonTol = [
      { key: 'toleranceMm', label: isDe ? 'Toleranzwert t_G' : 'Tolerance Value (t_G)', min: 0.01, max: 0.10, step: 0.005, unit: ' mm', decimals: 3 },
      { key: 'sliceFrac', label: isDe ? 'Aktive Schnittebene s' : 'Active Probe Slice (s)', min: 0.0, max: 1.0, step: 0.02, unit: '%', decimals: 0, pct: true },
      { key: 'exaggeration', label: isDe ? 'Visuelle Überhöhung' : 'Visual Exaggeration', min: 80, max: 450, step: 20, unit: '×', decimals: 0 },
    ];
    const deform = isInter
      ? [
          { key: 'bowLong', label: isDe ? 'Längswölbung (// A)' : 'Longitudinal Bow (// A)', min: -0.08, max: 0.08, step: 0.002, unit: ' mm', decimals: 3 },
          { key: 'bowTrans', label: isDe ? 'Querwölbung (⊥ A)' : 'Transverse Cupping (⊥ A)', min: -0.08, max: 0.08, step: 0.002, unit: ' mm', decimals: 3 },
          { key: 'twist', label: isDe ? 'Flächenverwindung (Twist)' : 'Ruled Surface Twist', min: -0.08, max: 0.08, step: 0.002, unit: ' mm', decimals: 3 },
          { key: 'harmonics', label: isDe ? 'Wellenordnung (Lobes)' : 'Wave Harmonics', min: 1, max: 4, step: 1, unit: '', decimals: 0 },
        ]
      : [
          { key: 'bowVert', label: isDe ? 'Höhenwelligkeit (entlang A / ⊥ B)' : 'Vertical Wave (along A / ⊥ B)', min: -0.08, max: 0.08, step: 0.002, unit: ' mm', decimals: 3 },
          { key: 'bowLat', label: isDe ? 'Seitenschlag (⊥ A / // B)' : 'Lateral Sway (⊥ A / // B)', min: -0.08, max: 0.08, step: 0.002, unit: ' mm', decimals: 3 },
          { key: 'harmonics', label: isDe ? 'Wellenordnung (Lobes)' : 'Wave Harmonics', min: 1, max: 4, step: 1, unit: '', decimals: 0 },
        ];
    return { tol: commonTol, deform };
  }

  function renderSliderList(containerSel, specs) {
    const wrap = $(containerSel);
    wrap.innerHTML = '';
    specs.forEach((s) => {
      const val = state.labParams[s.key] ?? 0;
      const disp = s.pct ? `${Math.round(val * 100)}${s.unit}` : `${Number(val).toFixed(s.decimals)}${s.unit}`;
      const row = document.createElement('div');
      row.className = 'slider-row';
      row.innerHTML = `
        <div class="slider-head">
          <span class="slider-label">${s.label}</span>
          <span class="slider-val" id="sval-${s.key}">${disp}</span>
        </div>
        <input type="range" id="slider-${s.key}" min="${s.min}" max="${s.max}" step="${s.step}" value="${val}">
      `;
      const input = row.querySelector('input');
      input.addEventListener('input', () => {
        state.labParams[s.key] = parseFloat(input.value);
        const v = state.labParams[s.key];
        row.querySelector('.slider-val').textContent = s.pct
          ? `${Math.round(v * 100)}${s.unit}`
          : `${Number(v).toFixed(s.decimals)}${s.unit}`;
        state.activePresetId = null;
        syncPresetButtons();
        onLabParameterChange();
      });
      wrap.appendChild(row);
    });
  }

  function buildPresetButtons() {
    const pWrap = $('#lab-presets');
    pWrap.innerHTML = '';
    Object.values(D.LAB_PRESETS).forEach((pr) => {
      const b = document.createElement('button');
      b.className = 'preset-btn' + (state.activePresetId === pr.id ? ' active' : '');
      b.dataset.preset = pr.id;
      b.textContent = state.lang === 'de' ? pr.labelDe : pr.labelEn;
      b.addEventListener('click', () => loadLabPreset(pr.id));
      pWrap.appendChild(b);
    });
  }

  function syncPresetButtons() {
    $$('#lab-presets .preset-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.preset === state.activePresetId);
    });
  }

  function loadLabPreset(pid) {
    const pr = D.LAB_PRESETS[pid];
    if (!pr) return;
    state.activePresetId = pid;
    state.labParams = {
      bowLong: 0,
      bowTrans: 0,
      twist: 0,
      bowVert: 0,
      bowLat: 0,
      harmonics: 1,
      sliceFrac: 0.5,
      exaggeration: 240,
      ...pr.params,
    };
    syncPresetButtons();
    buildLabControls();
    if (state.activeTab === 'lab') {
      refresh3DScene(true);
      render2DCanvases();
    }
  }

  function buildLabControls() {
    const { tol, deform } = getDeformSliderSpecs();
    renderSliderList('#tolerance-sliders', tol);
    renderSliderList('#deform-sliders', deform);
    syncIndicatorSwitches();
  }

  function syncIndicatorSwitches() {
    $$('#ind-type-group .mini-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.ind === state.labParams.indicatorType);
    });
    $$('#plane-rel-group .mini-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.rel === state.labParams.planeRelation);
    });
    const isInter = state.labParams.indicatorType === 'intersection';
    $('#datum-row').classList.toggle('hidden', isInter);
    $$('#datum-group .mini-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.dat === state.labParams.datum);
    });
  }

  function onLabParameterChange() {
    if (state.activeTab === 'lab') {
      refresh3DScene(false);
      render2DCanvases();
    }
  }

  function updateLabUI() {
    const res = state.labResult;
    if (!res) return;
    const p = res.params;
    const txt = t();
    const isInter = res.mode === 'intersection';

    // Top Lab Status Badges
    const statusPill = $('#badge-status');
    statusPill.textContent = `${res.pass ? txt.passWord : txt.failWord} · ${res.controlledError.toFixed(3)} / ${p.toleranceMm.toFixed(3)} mm`;
    statusPill.className = 'status-pill ' + (res.pass ? 'good' : 'warn');

    $('#badge-flatness').textContent = isInter
      ? `${state.lang === 'de' ? 'Ebenheit' : 'Flatness'} ${res.flatnessError.toFixed(3)} mm`
      : `${state.lang === 'de' ? 'Freie Dir.' : 'Unconstr.'} ${res.orthogonalError.toFixed(3)} mm`;
    $('#badge-dof').textContent = res.dofNote;

    // Live FCF preview card
    const fcfSpec = {
      sym: 'straightness',
      tol: p.toleranceMm.toFixed(2).replace('.', ','),
      capType: p.indicatorType,
      rel: p.planeRelation,
      datum: isInter ? 'A' : (p.datum || 'A'),
      terminator: isInter ? 'dot' : 'arrow',
    };
    $('#lab-fcf-wrap').innerHTML = `
      <div class="fcf-specimen-card">
        <div class="fcf-specimen-meta">
          <strong>ISO 1101:2017</strong>
          <span>${isInter ? (state.lang === 'de' ? '• Schnittlinien auf Fläche' : '• Surface Cut Lines') : (state.lang === 'de' ? '▼ Parallele Ebenen auf Kante' : '▼ Parallel Planes on Edge')}</span>
        </div>
        ${D.renderFcfSvg(fcfSpec, { compact: true })}
      </div>`;

    const kpis = [
      { lbl: txt.kpiStraight, val: `${res.controlledError.toFixed(3)} mm`, cls: res.pass ? 'good' : 'warn' },
      { lbl: isInter ? txt.kpiFlatness : txt.kpiOrtho, val: `${(isInter ? res.flatnessError : res.orthogonalError).toFixed(3)} mm`, cls: 'accent' },
      { lbl: txt.kpiSlice, val: `${res.activeSliceError.toFixed(3)} mm`, cls: res.activeSliceError <= p.toleranceMm + 1e-9 ? 'good' : 'warn' },
    ];
    $('#lab-kpis').innerHTML = kpis
      .map((k) => `<div class="kpi-card"><div class="kpi-label">${k.lbl}</div><div class="kpi-val ${k.cls}">${k.val}</div></div>`)
      .join('');
  }

  function render2DCanvases() {
    if (state.activeTab !== 'lab' || !state.labResult) return;
    D2.renderSliceCanvas($('#canvas-slice'), state.labResult, state.simClock, state.lang);
    D2.renderEnvelopePlotCanvas($('#canvas-plots'), state.labResult, state.lang);
  }

  // --------------------------------------------------------------------------
  // Editorial Views (Concepts + Book Summary + Standards)
  // --------------------------------------------------------------------------
  function buildEditorialViews() {
    const isDe = state.lang === 'de';
    const txt = t();
    const cGrid = $('#concepts-grid');
    cGrid.innerHTML = '';

    D.CONCEPTS.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'concept-card';
      card.innerHTML = `
        <h4>${isDe ? c.titleDe : c.titleEn}</h4>
        <p>${isDe ? c.bodyDe : c.bodyEn}</p>
        <div class="concept-math"></div>
        <button class="try-btn">${txt.tryInLab}</button>
      `;
      const mathEl = card.querySelector('.concept-math');
      if (global.katex) {
        try {
          global.katex.render(c.math, mathEl, { displayMode: true, throwOnError: false });
        } catch {
          mathEl.textContent = c.math;
        }
      } else {
        mathEl.textContent = c.math;
      }
      card.querySelector('.try-btn').addEventListener('click', () => {
        loadLabPreset(c.preset);
        setActiveTab('lab');
      });
      cGrid.appendChild(card);
    });

    const bWrap = $('#book-paragraphs');
    bWrap.innerHTML = '';
    D.BOOK_PARAGRAPHS.forEach((bp) => {
      const pEl = document.createElement('div');
      pEl.className = 'book-para';
      pEl.innerHTML = `
        <div class="book-para-head">
          <span class="book-para-tag">${isDe ? bp.tagDe : bp.tagEn}</span>
          <button class="book-jump-btn">${txt.showIn3d}</button>
        </div>
        <p>${isDe ? bp.de : bp.en}</p>
      `;
      pEl.querySelector('.book-jump-btn').addEventListener('click', () => {
        setActiveTab('atlas');
        selectAtlasFigure(bp.fig);
      });
      bWrap.appendChild(pEl);
    });

    const rStd = $('#reading-standards-list');
    rStd.innerHTML = '';
    D.FURTHER_READING.standards.forEach((item) => {
      const el = document.createElement('a');
      el.className = 'reading-card';
      el.href = item.url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.innerHTML = `<div class="reading-meta">${item.source} ↗</div><h4>${isDe ? item.titleDe : item.titleEn}</h4><p>${isDe ? item.descDe : item.descEn}</p>`;
      rStd.appendChild(el);
    });

    const rBooks = $('#reading-books-list');
    rBooks.innerHTML = '';
    D.FURTHER_READING.books.forEach((item) => {
      const el = document.createElement('a');
      el.className = 'reading-card';
      el.href = item.url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.innerHTML = `<div class="reading-meta">${item.source} ↗</div><h4>${isDe ? item.titleDe : item.titleEn}</h4><p>${isDe ? item.descDe : item.descEn}</p>`;
      rBooks.appendChild(el);
    });
  }

  // --------------------------------------------------------------------------
  // Events & Render Loop
  // --------------------------------------------------------------------------
  function bindUI() {
    $$('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });

    $$('#lang-toggle-group .mini-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.lang = btn.dataset.lang;
        $$('#lang-toggle-group .mini-btn').forEach((b) => b.classList.toggle('active', b === btn));
        applyStaticTranslations();
        refresh3DScene(false);
        render2DCanvases();
      });
    });

    $('#btn-overview').addEventListener('click', () => selectAtlasFigure('overview'));

    $('#select-figure').addEventListener('change', (e) => {
      selectAtlasFigure(e.target.value);
    });

    $('#btn-prev-fig').addEventListener('click', () => {
      if (state.atlasFigure === 'overview') {
        selectAtlasFigure('fig_i');
      } else {
        const idx = D.FIGURE_ORDER.indexOf(state.atlasFigure);
        if (idx <= 0) selectAtlasFigure('overview');
        else selectAtlasFigure(D.FIGURE_ORDER[idx - 1]);
      }
    });

    $('#btn-next-fig').addEventListener('click', () => {
      if (state.atlasFigure === 'overview') {
        selectAtlasFigure('fig_f');
      } else {
        const idx = D.FIGURE_ORDER.indexOf(state.atlasFigure);
        if (idx >= D.FIGURE_ORDER.length - 1) selectAtlasFigure('overview');
        else selectAtlasFigure(D.FIGURE_ORDER[idx + 1]);
      }
    });

    $$('#variant-state-group .mini-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.variantState = btn.dataset.vstate;
        $$('#variant-state-group .mini-btn').forEach((b) => b.classList.toggle('active', b === btn));
        refresh3DScene(false);
      });
    });

    $('#btn-start-tour').addEventListener('click', () => startTour(0));
    $('#btn-tour-close').addEventListener('click', stopTour);
    $('#btn-tour-prev').addEventListener('click', () => goToTourStop(state.tourIndex - 1));
    $('#btn-tour-next').addEventListener('click', () => {
      if (state.tourIndex === D.TOUR_STOPS.length - 1) {
        stopTour();
        loadLabPreset('fig_f');
        setActiveTab('lab');
      } else {
        goToTourStop(state.tourIndex + 1);
      }
    });
    $('#btn-tour-auto').addEventListener('click', toggleTourAuto);

    $('#btn-play-pause').addEventListener('click', () => {
      state.paused = !state.paused;
      sceneMgr.paused = state.paused;
      $('#play-icon').textContent = state.paused ? '▶' : '⏸';
    });

    $('#select-display-mode').addEventListener('change', (e) => {
      state.displayMode = e.target.value;
      refresh3DScene(false);
    });

    $('#btn-toggle-callouts').addEventListener('click', (e) => {
      state.showCallouts = !state.showCallouts;
      e.currentTarget.classList.toggle('active', state.showCallouts);
      refresh3DScene(false);
    });

    $('#btn-toggle-zone').addEventListener('click', (e) => {
      state.showZone = !state.showZone;
      e.currentTarget.classList.toggle('active', state.showZone);
      refresh3DScene(false);
    });

    $('#btn-toggle-planes').addEventListener('click', (e) => {
      state.showPlanes = !state.showPlanes;
      e.currentTarget.classList.toggle('active', state.showPlanes);
      refresh3DScene(false);
    });

    $('#btn-reset-cam').addEventListener('click', () => {
      if (state.activeTab === 'lab') {
        const camPos = state.labParams.indicatorType === 'intersection'
          ? [2.75, 2.15, 2.95]
          : [2.75, 1.80, 2.95];
        sceneMgr.flyTo(camPos, [0.0, 0.34, 0.0], 600);
      } else if (state.atlasFigure === 'overview') {
        sceneMgr.flyTo([0.0, 7.1, 6.9], [0.0, 0.05, 0.0], 600);
      } else {
        const f = D.FIGURES[state.atlasFigure];
        sceneMgr.flyTo(f.cameraFocus.pos, f.cameraFocus.target, 600);
      }
    });

    $$('#cam-presets-bar .cam-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isOverview = state.activeTab === 'atlas' && state.atlasFigure === 'overview';
        const dist = isOverview ? 6.2 : 2.9;
        const m = btn.dataset.cam;
        if (m === 'top') sceneMgr.flyTo([0.0, dist * 1.15, 0.15], [0.0, 0.1, 0.0], 600);
        else if (m === 'front') sceneMgr.flyTo([0.0, 0.7, dist * 1.05], [0.0, 0.25, 0.0], 600);
        else if (m === 'end') sceneMgr.flyTo([dist * 1.05, 0.65, 0.25], [0.0, 0.28, 0.0], 600);
        else sceneMgr.flyTo([dist * 0.78, dist * 0.62, dist * 0.82], [0.0, 0.24, 0.0], 600);
      });
    });

    $('#btn-open-in-lab').addEventListener('click', () => {
      const target = D.LAB_PRESETS[state.atlasFigure] ? state.atlasFigure : 'fig_f';
      loadLabPreset(target);
      setActiveTab('lab');
    });

    $('#btn-reset-lab').addEventListener('click', () => {
      loadLabPreset(state.activePresetId || 'fig_f');
    });

    $$('#ind-type-group .mini-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.labParams.indicatorType = btn.dataset.ind;
        if (state.labParams.indicatorType === 'intersection') {
          state.labParams.datum = 'A';
        }
        state.activePresetId = null;
        syncPresetButtons();
        buildLabControls();
        refresh3DScene(true);
        render2DCanvases();
      });
    });

    $$('#plane-rel-group .mini-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.labParams.planeRelation = btn.dataset.rel;
        state.activePresetId = null;
        syncPresetButtons();
        syncIndicatorSwitches();
        onLabParameterChange();
      });
    });

    $$('#datum-group .mini-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.labParams.datum = btn.dataset.dat;
        state.activePresetId = null;
        syncPresetButtons();
        syncIndicatorSwitches();
        onLabParameterChange();
      });
    });

    // Interactive probe across multi-station plot
    const plotCanvas = $('#canvas-plots');
    plotCanvas.addEventListener('pointermove', (e) => {
      const rect = plotCanvas.getBoundingClientRect();
      const padL = 44, padR = 16;
      const usable = Math.max(20, rect.width - padL - padR);
      const frac = Math.max(0, Math.min(1, (e.clientX - rect.left - padL) / usable));
      state.labParams.sliceFrac = Math.round(frac * 50) / 50;
      const sInput = $('#slider-sliceFrac');
      const sVal = $('#sval-sliceFrac');
      if (sInput) sInput.value = state.labParams.sliceFrac;
      if (sVal) sVal.textContent = `${Math.round(state.labParams.sliceFrac * 100)}%`;
      onLabParameterChange();
    });

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        $('#btn-play-pause').click();
      } else if (state.tourActive && e.key === 'ArrowRight') {
        goToTourStop(state.tourIndex + 1);
      } else if (state.tourActive && e.key === 'ArrowLeft') {
        goToTourStop(state.tourIndex - 1);
      }
    });
  }

  function startLoop() {
    let lastTs = performance.now();
    function tick(now) {
      const rawDt = ((now || performance.now()) - lastTs) / 1000;
      const dt = Math.max(0, Math.min(rawDt, 0.05));
      lastTs = now || performance.now();
      if (!state.paused) state.simClock += dt;

      if (state.activeTab === 'atlas' || state.activeTab === 'lab') {
        sceneMgr.stepAndRender(dt);
        if (state.activeTab === 'lab' && !state.paused) {
          D2.renderSliceCanvas($('#canvas-slice'), state.labResult, state.simClock, state.lang);
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function init() {
    populateFigureDropdown();
    state.labResult = P.solveTolerance(state.labParams);

    sceneMgr = new S3D.StraightnessSceneManager(
      $('#three-container'),
      handleProjectedCallouts,
      (fid) => {
        if (state.activeTab === 'atlas' && D.FIGURES[fid]) {
          selectAtlasFigure(fid);
        }
      }
    );

    buildPresetButtons();
    buildLabControls();
    buildEditorialViews();
    bindUI();
    refresh3DScene(true);
    startLoop();
  }

  window.addEventListener('DOMContentLoaded', init);
})(window);
