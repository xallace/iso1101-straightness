/* ==========================================================================
   draw2d.js — 1967 Book-Plate 2D Cross-Section View
               & Multi-Station Straightness Envelope Plot
   ========================================================================== */
(function (global) {
  'use strict';

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function prepareCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(240, Math.round(rect.width));
    const h = Math.max(130, Math.round(rect.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function drawPlateGrid(ctx, w, h) {
    ctx.fillStyle = '#f3ebda';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(24, 23, 21, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 26) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawDimArrow(ctx, x1, y1, x2, y2, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const sz = 5.5;
    for (const [px, py, a] of [[x1, y1, ang + Math.PI], [x2, y2, ang]]) {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - Math.cos(a - 0.35) * sz, py - Math.sin(a - 0.35) * sz);
      ctx.lineTo(px - Math.cos(a + 0.35) * sz, py - Math.sin(a + 0.35) * sz);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function renderSliceCanvas(canvas, res, timeSec, lang = 'en') {
    if (!canvas || !res) return;
    const { ctx, w, h } = prepareCanvas(canvas);
    drawPlateGrid(ctx, w, h);

    const p = res.params;
    const isDe = lang === 'de';

    if (res.mode === 'intersection') {
      const pts = res.activeSlicePts || [];
      const fit = res.activeSliceFit || { slope: 0, intercept: 0, error: 0 };
      const padL = 46, padR = 22, padT = 32, padB = 26;
      const plotW = Math.max(40, w - padL - padR);
      const plotH = Math.max(40, h - padT - padB);
      const midY = padT + plotH * 0.52;

      const maxAbsDev = Math.max(
        p.toleranceMm * 0.85,
        pts.reduce((m, pt) => {
          const base = fit.slope * pt.t + fit.intercept;
          return Math.max(m, Math.abs(pt.y - base));
        }, 0) * 1.25
      );
      const yScale = (plotH * 0.40) / maxAbsDev;
      const halfZonePx = (p.toleranceMm * 0.5) * yScale;

      // Shaded tolerance corridor
      ctx.fillStyle = res.activeSliceError <= p.toleranceMm + 1e-9
        ? 'rgba(4, 120, 87, 0.13)'
        : 'rgba(217, 68, 38, 0.14)';
      ctx.fillRect(padL, midY - halfZonePx, plotW, halfZonePx * 2);

      // Chebyshev zone dashed rails
      ctx.save();
      ctx.strokeStyle = '#d94426';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, midY - halfZonePx);
      ctx.lineTo(padL + plotW, midY - halfZonePx);
      ctx.moveTo(padL, midY + halfZonePx);
      ctx.lineTo(padL + plotW, midY + halfZonePx);
      ctx.stroke();
      ctx.restore();

      // Extracted surface line (deviation relative to Chebyshev mid-line)
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#181715';
      ctx.beginPath();
      pts.forEach((pt, idx) => {
        const px = padL + pt.frac * plotW;
        const dev = pt.y - (fit.slope * pt.t + fit.intercept);
        const py = midY - dev * yScale;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Highlight out-of-tolerance points
      pts.forEach((pt) => {
        const dev = pt.y - (fit.slope * pt.t + fit.intercept);
        if (Math.abs(dev) > p.toleranceMm * 0.5 + 1e-9) {
          const px = padL + pt.frac * plotW;
          const py = midY - dev * yScale;
          ctx.fillStyle = '#d94426';
          ctx.beginPath();
          ctx.arc(px, py, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Moving probe marker
      const pulse = 0.5 - 0.5 * Math.cos((timeSec * 1.4) % (Math.PI * 2));
      const pIdx = Math.min(pts.length - 1, Math.round(pulse * (pts.length - 1)));
      if (pts[pIdx]) {
        const pt = pts[pIdx];
        const dev = pt.y - (fit.slope * pt.t + fit.intercept);
        const px = padL + pt.frac * plotW;
        const py = midY - dev * yScale;
        ctx.fillStyle = '#d94426';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#faf5e8';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // Dimension bracket for t_G on left
      drawDimArrow(ctx, padL - 12, midY - halfZonePx, padL - 12, midY + halfZonePx, '#d94426');
      ctx.fillStyle = '#d94426';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('t_G', padL - 16, midY + 3);

      // Header labels
      const relStr = p.planeRelation === 'parallel' ? `// ${p.datum}` : `⊥ ${p.datum}`;
      ctx.fillStyle = '#181715';
      ctx.font = 'bold 10.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        isDe
          ? `SCHNITTLINIE (${relStr} · s=${Math.round(p.sliceFrac * 100)}%)`
          : `CUT PROFILE (${relStr} · s=${Math.round(p.sliceFrac * 100)}%)`,
        10,
        16
      );
      ctx.textAlign = 'right';
      const ok = res.activeSliceError <= p.toleranceMm + 1e-9;
      ctx.fillStyle = ok ? '#047857' : '#b91c1c';
      ctx.fillText(`e = ${res.activeSliceError.toFixed(3)} / ${p.toleranceMm.toFixed(2)} mm`, w - 10, 16);

      ctx.fillStyle = '#4b463e';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`0 mm`, padL, h - 8);
      ctx.fillText(`${res.sliceSpanMm} mm`, padL + plotW, h - 8);
      return;
    }

    // Orientation Plane Mode: Broken End-Section Diagram (Cases III / IV)
    const cx = w * 0.50;
    const cy = h * 0.56;
    const normAxisY = res.normAxis !== 'Z';
    const isDatumB = p.datum === 'B';

    // Header
    ctx.fillStyle = '#181715';
    ctx.font = 'bold 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    const relTag = p.planeRelation === 'parallel' ? `// ${p.datum}` : `⊥ ${p.datum}`;
    ctx.fillText(
      isDe ? `QUERSCHNITT TOLERANZZONE (${relTag})` : `END-ON SECTION ZONE (${relTag})`,
      10,
      16
    );
    ctx.textAlign = 'right';
    ctx.fillStyle = res.pass ? '#047857' : '#b91c1c';
    ctx.fillText(`e = ${res.controlledError.toFixed(3)} / ${p.toleranceMm.toFixed(2)} mm`, w - 10, 16);

    // Draw broken wedge cross-section (Cases III / IV)
    const tipX = cx + 26;
    const tipY = cy - 28;

    ctx.save();
    // Broken cross-section silhouette
    ctx.fillStyle = '#faf5e8';
    ctx.strokeStyle = '#181715';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    if (!isDatumB) {
      // Fig h style: tall steep right face = Datum A
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - 6, tipY + 72);
      ctx.quadraticCurveTo(tipX - 24, tipY + 66, tipX - 38, tipY + 72);
      ctx.bezierCurveTo(tipX - 44, tipY + 52, tipX - 32, tipY + 38, tipX - 40, tipY + 24);
      ctx.lineTo(tipX, tipY);
    } else {
      // Fig i style: flat bottom face = Datum B
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - 8, tipY + 62);
      ctx.lineTo(tipX - 46, tipY + 62);
      ctx.bezierCurveTo(tipX - 44, tipY + 42, tipX - 34, tipY + 26, tipX - 42, tipY + 18);
      ctx.lineTo(tipX, tipY);
    }
    ctx.fill();
    ctx.stroke();

    // Datum reference line + filled triangle + [A] / [B] box
    if (!isDatumB) {
      // Extend Datum A upward-right
      ctx.save();
      ctx.strokeStyle = '#181715';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + 4, tipY - 40);
      ctx.stroke();
      ctx.restore();

      // Datum [A] flag on right face
      const dx = tipX - 3;
      const dy = tipY + 42;
      ctx.fillStyle = '#181715';
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 10, dy - 5);
      ctx.lineTo(dx + 10, dy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#181715';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(dx + 10, dy);
      ctx.lineTo(dx + 24, dy);
      ctx.stroke();
      ctx.fillStyle = '#faf5e8';
      ctx.fillRect(dx + 24, dy - 10, 18, 20);
      ctx.strokeRect(dx + 24, dy - 10, 18, 20);
      ctx.fillStyle = '#181715';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('A', dx + 33, dy + 4);
    } else {
      // Extend Datum B horizontally left/right
      const by = tipY + 62;
      ctx.save();
      ctx.strokeStyle = '#181715';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(tipX - 66, by);
      ctx.lineTo(tipX + 36, by);
      ctx.stroke();
      ctx.restore();

      // Parallel // marks on Datum B line if // B
      if (normAxisY) {
        ctx.strokeStyle = '#181715';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(tipX - 60, by + 4);
        ctx.lineTo(tipX - 53, by - 4);
        ctx.moveTo(tipX - 55, by + 4);
        ctx.lineTo(tipX - 48, by - 4);
        ctx.stroke();
      }

      // Datum [B] flag below bottom face
      const bx = tipX - 24;
      ctx.fillStyle = '#181715';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 5, by + 9);
      ctx.lineTo(bx + 5, by + 9);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#181715';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(bx, by + 9);
      ctx.lineTo(bx, by + 18);
      ctx.stroke();
      ctx.fillStyle = '#faf5e8';
      ctx.fillRect(bx - 9, by + 18, 18, 18);
      ctx.strokeRect(bx - 9, by + 18, 18, 18);
      ctx.fillStyle = '#181715';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('B', bx, by + 31);
    }

    // Parallel t_G dashed lines oriented per normAxisY
    const scalePx = 560; // 0.03 mm -> ~16.8 px
    const halfGapPx = clamp((p.toleranceMm * 0.5) * scalePx, 7, 30);

    ctx.save();
    ctx.strokeStyle = '#d94426';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    if (normAxisY) {
      const y1 = tipY - halfGapPx;
      const y2 = tipY + halfGapPx;
      ctx.beginPath();
      ctx.moveTo(tipX - 74, y1);
      ctx.lineTo(tipX + 54, y1);
      ctx.moveTo(tipX - 74, y2);
      ctx.lineTo(tipX + 54, y2);
      ctx.stroke();
      ctx.restore();

      // Dimension t_G arrows
      drawDimArrow(ctx, tipX + 44, y1, tipX + 44, y2, '#d94426');
      ctx.fillStyle = '#d94426';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('t_G', tipX + 50, tipY + 3);

      // Right-angle symbol (for A) or // marks (for B)
      if (!isDatumB) {
        ctx.strokeStyle = '#181715';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(tipX + 2, y1, 9, -Math.PI / 2, 0);
        ctx.stroke();
        ctx.fillStyle = '#181715';
        ctx.beginPath();
        ctx.arc(tipX + 6, y1 - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        for (const yy of [y1, y2]) {
          ctx.strokeStyle = '#d94426';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(tipX - 66, yy + 4);
          ctx.lineTo(tipX - 59, yy - 4);
          ctx.moveTo(tipX - 61, yy + 4);
          ctx.lineTo(tipX - 54, yy - 4);
          ctx.stroke();
        }
      }
    } else {
      // Vertical tolerance planes (// A or ⊥ B)
      const x1 = tipX - halfGapPx;
      const x2 = tipX + halfGapPx;
      ctx.beginPath();
      ctx.moveTo(x1, tipY - 36);
      ctx.lineTo(x1, tipY + 46);
      ctx.moveTo(x2, tipY - 36);
      ctx.lineTo(x2, tipY + 46);
      ctx.stroke();
      ctx.restore();

      drawDimArrow(ctx, x1, tipY - 28, x2, tipY - 28, '#d94426');
      ctx.fillStyle = '#d94426';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('t_G', tipX, tipY - 33);
    }

    // End-on projected locus of the edge along u in [0, 1]
    const samples = res.edgeSamples || [];
    const fitC = res.fitCtrl || { slope: 0, intercept: 0 };
    const fitF = res.fitFree || { slope: 0, intercept: 0 };
    ctx.strokeStyle = res.pass ? '#047857' : '#b91c1c';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    samples.forEach((s, idx) => {
      const cOff = s.ctrlVal - (fitC.slope * s.xMm + fitC.intercept);
      const fOff = s.freeVal - (fitF.slope * s.xMm + fitF.intercept);
      const px = normAxisY ? tipX + fOff * scalePx : tipX + cOff * scalePx;
      const py = normAxisY ? tipY - cOff * scalePx : tipY - fOff * scalePx;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Active probe dot on end-on locus
    const aIdx = Math.min(samples.length - 1, Math.max(0, Math.round(p.sliceFrac * (samples.length - 1))));
    if (samples[aIdx]) {
      const s = samples[aIdx];
      const cOff = s.ctrlVal - (fitC.slope * s.xMm + fitC.intercept);
      const fOff = s.freeVal - (fitF.slope * s.xMm + fitF.intercept);
      const px = normAxisY ? tipX + fOff * scalePx : tipX + cOff * scalePx;
      const py = normAxisY ? tipY - cOff * scalePx : tipY - fOff * scalePx;
      ctx.fillStyle = '#d94426';
      ctx.beginPath();
      ctx.arc(px, py, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#faf5e8';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderEnvelopePlotCanvas(canvas, res, lang = 'en') {
    if (!canvas || !res) return;
    const { ctx, w, h } = prepareCanvas(canvas);
    drawPlateGrid(ctx, w, h);

    const p = res.params;
    const isDe = lang === 'de';
    const stations = res.stations || [];
    const padL = 44, padR = 16, padT = 30, padB = 26;
    const plotW = Math.max(40, w - padL - padR);
    const plotH = Math.max(40, h - padT - padB);

    const refSecond = res.mode === 'intersection' ? res.flatnessError : res.orthogonalError;
    const maxVal = Math.max(
      p.toleranceMm * 1.45,
      res.controlledError * 1.15,
      refSecond * 1.08,
      0.03
    );

    const toX = (frac) => padL + frac * plotW;
    const toY = (val) => padT + plotH - clamp(val / maxVal, 0, 1.04) * plotH;

    // Axes
    ctx.strokeStyle = '#181715';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Horizontal threshold line t_G
    const yTol = toY(p.toleranceMm);
    ctx.save();
    ctx.strokeStyle = '#d94426';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, yTol);
    ctx.lineTo(padL + plotW, yTol);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#d94426';
    ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`t_G=${p.toleranceMm.toFixed(2)}`, padL + plotW - 4, Math.max(padT + 10, yTol - 4));

    // Secondary reference line (Flatness in f/g, or Orthogonal Unconstrained Sway in h/i)
    const yRef = toY(refSecond);
    ctx.save();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, yRef);
    ctx.lineTo(padL + plotW, yRef);
    ctx.stroke();
    ctx.restore();

    const refLbl = res.mode === 'intersection'
      ? (isDe ? `Ebenheit=${refSecond.toFixed(3)}` : `Flatness=${refSecond.toFixed(3)}`)
      : (isDe ? `Frei=${refSecond.toFixed(3)}` : `Unconstr=${refSecond.toFixed(3)}`);
    const lw = ctx.measureText(refLbl).width + 8;
    const ly = Math.max(padT + 10, yRef - 4);
    ctx.fillStyle = 'rgba(243, 235, 218, 0.88)';
    ctx.fillRect(padL + 3, ly - 9, lw, 12);
    ctx.fillStyle = '#b45309';
    ctx.textAlign = 'left';
    ctx.fillText(refLbl, padL + 6, ly);

    // Main station deviation curve
    if (stations.length > 1) {
      ctx.strokeStyle = '#181715';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      stations.forEach((st, i) => {
        const x = toX(st.sFrac);
        const y = toY(st.error);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Shaded red zone above t_G
      stations.forEach((st) => {
        if (st.error > p.toleranceMm + 1e-9) {
          ctx.fillStyle = 'rgba(217, 68, 38, 0.8)';
          ctx.beginPath();
          ctx.arc(toX(st.sFrac), toY(st.error), 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Active slice cursor
    const xCur = toX(p.sliceFrac);
    ctx.save();
    ctx.strokeStyle = 'rgba(217, 68, 38, 0.7)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(xCur, padT);
    ctx.lineTo(xCur, padT + plotH);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#d94426';
    ctx.beginPath();
    ctx.arc(xCur, toY(res.activeSliceError), 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Header & axis labels
    ctx.fillStyle = '#181715';
    ctx.font = 'bold 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      res.mode === 'intersection'
        ? (isDe ? 'GERADHEIT ÜBER ALLE SCHNITTE (HOVER = TASTEN)' : 'STRAIGHTNESS ACROSS ALL CUTS (HOVER TO PROBE)')
        : (isDe ? 'KANTENABWEICHUNG ENTLANG LÄNGE (HOVER = TASTEN)' : 'EDGE BAND EXCURSION ALONG LENGTH (HOVER TO PROBE)'),
      10,
      16
    );

    ctx.fillStyle = '#4b463e';
    ctx.font = '9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${maxVal.toFixed(2)}`, padL - 5, padT + 6);
    ctx.fillText('0.00', padL - 5, padT + plotH + 3);
    ctx.textAlign = 'center';
    ctx.fillText('0%', padL, h - 8);
    ctx.fillText('50%', padL + plotW * 0.5, h - 8);
    ctx.fillText('100%', padL + plotW, h - 8);
  }

  global.ISO_DRAW2D = {
    renderSliceCanvas,
    renderEnvelopePlotCanvas,
  };
})(window);
