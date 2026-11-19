/* ==========================================================================
   physics.js — Exact ISO 1101 Minimum-Zone (Chebyshev) Straightness &
                Flatness Solver for Intersection & Orientation Plane Indicators
   ========================================================================== */
(function (global) {
  'use strict';

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  // Exact 1D Minimum-Zone Straightness (Chebyshev minimax parallel-line corridor)
  // Points are { t, y } in mm. Returns { error, slope, intercept, lowerLine, upperLine }.
  function solveMinZoneStraightness1D(pts) {
    if (!pts || pts.length < 2) {
      return { error: 0, slope: 0, intercept: 0 };
    }
    const n = pts.length;

    // Evaluate vertical band width at candidate slope m, and perpendicular width / sqrt(1 + m^2)
    function evalSlope(m) {
      let minR = Infinity;
      let maxR = -Infinity;
      for (let i = 0; i < n; i++) {
        const r = pts[i].y - m * pts[i].t;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
      }
      const span = maxR - minR;
      const perp = span / Math.sqrt(1 + m * m);
      return { perp, span, mid: 0.5 * (minR + maxR), minR, maxR };
    }

    // Coarse-to-fine golden-section / grid search around least-squares slope
    let sumT = 0, sumY = 0, sumTT = 0, sumTY = 0;
    for (let i = 0; i < n; i++) {
      sumT += pts[i].t;
      sumY += pts[i].y;
      sumTT += pts[i].t * pts[i].t;
      sumTY += pts[i].t * pts[i].y;
    }
    const meanT = sumT / n;
    const meanY = sumY / n;
    const denom = sumTT - n * meanT * meanT;
    const mOLS = Math.abs(denom) > 1e-12 ? (sumTY - n * meanT * meanY) / denom : 0;

    // Also evaluate zero-slope & endpoint-chord slope to bound the minimax optimum
    const mEnd = Math.abs(pts[n - 1].t - pts[0].t) > 1e-12
      ? (pts[n - 1].y - pts[0].y) / (pts[n - 1].t - pts[0].t)
      : 0;
    const spanT = Math.max(1e-6, Math.abs(pts[n - 1].t - pts[0].t));
    const maxAmp = pts.reduce((acc, p) => Math.max(acc, Math.abs(p.y - meanY)), 0);
    const maxSlopeSwing = Math.max(0.02, (4 * maxAmp) / spanT + Math.abs(mOLS - mEnd) * 2);

    let lo = Math.min(mOLS, mEnd, 0) - maxSlopeSwing;
    let hi = Math.max(mOLS, mEnd, 0) + maxSlopeSwing;

    // Grid seed + golden section (convex unimodal in m for small slopes)
    let bestM = mOLS;
    let best = evalSlope(bestM);
    const steps = 32;
    for (let k = 0; k <= steps; k++) {
      const m = lo + ((hi - lo) * k) / steps;
      const ev = evalSlope(m);
      if (ev.perp < best.perp) {
        best = ev;
        bestM = m;
      }
    }
    const stepW = (hi - lo) / steps;
    lo = bestM - stepW;
    hi = bestM + stepW;
    const phi = (Math.sqrt(5) - 1) / 2;
    let x1 = hi - phi * (hi - lo);
    let x2 = lo + phi * (hi - lo);
    let f1 = evalSlope(x1);
    let f2 = evalSlope(x2);
    for (let iter = 0; iter < 36; iter++) {
      if (f1.perp < f2.perp) {
        hi = x2;
        x2 = x1;
        f2 = f1;
        x1 = hi - phi * (hi - lo);
        f1 = evalSlope(x1);
      } else {
        lo = x1;
        x1 = x2;
        f1 = f2;
        x2 = lo + phi * (hi - lo);
        f2 = evalSlope(x2);
      }
    }
    const mStar = 0.5 * (lo + hi);
    const evStar = evalSlope(mStar);
    if (evStar.perp < best.perp) {
      best = evStar;
      bestM = mStar;
    }

    return {
      error: best.perp < 1e-12 ? 0 : best.perp,
      slope: bestM,
      intercept: best.mid,
      minR: best.minR,
      maxR: best.maxR,
      halfBand: 0.5 * best.span,
    };
  }

  // Minimum-Zone Flatness over 3D points { x, y, z } (y is height deviation)
  function solveMinZoneFlatness(pts) {
    if (!pts || pts.length < 3) return 0;
    const n = pts.length;

    function evalPlane(a, b) {
      let minR = Infinity;
      let maxR = -Infinity;
      for (let i = 0; i < n; i++) {
        const r = pts[i].y - a * pts[i].x - b * pts[i].z;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
      }
      return (maxR - minR) / Math.sqrt(1 + a * a + b * b);
    }

    // Seed with OLS plane
    let sx = 0, sz = 0, sy = 0;
    for (let i = 0; i < n; i++) {
      sx += pts[i].x;
      sz += pts[i].z;
      sy += pts[i].y;
    }
    const mx = sx / n, mz = sz / n, my = sy / n;
    let sxx = 0, sxz = 0, szz = 0, sxy = 0, szy = 0;
    for (let i = 0; i < n; i++) {
      const dx = pts[i].x - mx;
      const dz = pts[i].z - mz;
      const dy = pts[i].y - my;
      sxx += dx * dx;
      sxz += dx * dz;
      szz += dz * dz;
      sxy += dx * dy;
      szy += dz * dy;
    }
    const det = sxx * szz - sxz * sxz;
    let a = Math.abs(det) > 1e-12 ? (sxy * szz - szy * sxz) / det : 0;
    let b = Math.abs(det) > 1e-12 ? (sxx * szy - sxz * sxy) / det : 0;
    let bestErr = evalPlane(a, b);

    // Coordinate pattern search refinement for exact Chebyshev flatness
    let step = 0.004;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (let iter = 0; iter < 28; iter++) {
      let improved = false;
      for (let d = 0; d < dirs.length; d++) {
        const ca = a + dirs[d][0] * step;
        const cb = b + dirs[d][1] * step;
        const err = evalPlane(ca, cb);
        if (err < bestErr - 1e-12) {
          bestErr = err;
          a = ca;
          b = cb;
          improved = true;
        }
      }
      if (!improved) step *= 0.55;
    }
    return bestErr < 1e-12 ? 0 : bestErr;
  }

  // Smooth profile shape function in [0, 1], normalized to unit peak-to-valley at harmonic=1
  // For harmonic = 1: parabola-like bow 4*t*(1-t) -> range [0, 1], straightness = 1.0 * amp (wait: chord tilts 0, max=1, min=0 -> error = |amp|)
  // For harmonic >= 2: sin(harmonic * pi * t) scaled so peak-to-valley = 1
  function profileWave(t, harmonic) {
    const h = Math.max(1, Math.round(harmonic || 1));
    if (h === 1) {
      // Zero-mean centered parabolic bow: range [-0.5, +0.5], exact peak-to-valley = 1.0
      return 4 * t * (1 - t) - 0.5;
    }
    // Centered multi-lobe wave: amplitude 0.5 -> peak-to-valley = 1.0
    return 0.5 * Math.sin(h * Math.PI * t);
  }

  // Surface height deviation (mm) on the chamfered block top face (u along Datum A, v perp to Datum A)
  function evalBlockSurfaceY(u, v, params) {
    const h = params.harmonics || 1;
    const bowLong = params.bowLong || 0;
    const bowTrans = params.bowTrans || 0;
    const twist = params.twist || 0;
    return (
      bowLong * profileWave(u, h) +
      bowTrans * profileWave(v, 1) +
      twist * 0.5 * (2 * u - 1) * (2 * v - 1)
    );
  }

  // Wedge edge deviation (mm) along length u in [0, 1]:
  // dy = deviation in Y (along Datum A, normal to Datum B)
  // dz = deviation in Z (normal to Datum A, parallel to Datum B)
  function evalWedgeEdgeOffset(u, params) {
    const h = params.harmonics || 1;
    const bowVert = params.bowVert || 0;
    const bowLat = params.bowLat || 0;
    return {
      dy: bowVert * profileWave(u, h),
      dz: bowLat * profileWave(u, h),
    };
  }

  const PART_LENGTH_MM = 100;
  const PART_WIDTH_MM = 45;

  // Solve complete ISO 1101 inspection for a figure/configuration
  function solveTolerance(rawParams) {
    const p = {
      indicatorType: rawParams.indicatorType || 'intersection', // 'intersection' | 'orientation'
      planeRelation: rawParams.planeRelation || 'parallel',     // 'parallel' | 'perp'
      datum: rawParams.datum || 'A',                            // 'A' | 'B'
      toleranceMm: clamp(Number(rawParams.toleranceMm ?? 0.05), 0.005, 0.25),
      bowLong: Number(rawParams.bowLong ?? 0),
      bowTrans: Number(rawParams.bowTrans ?? 0),
      twist: Number(rawParams.twist ?? 0),
      bowVert: Number(rawParams.bowVert ?? 0),
      bowLat: Number(rawParams.bowLat ?? 0),
      harmonics: clamp(Math.round(Number(rawParams.harmonics ?? 1)), 1, 4),
      sliceFrac: clamp(Number(rawParams.sliceFrac ?? 0.5), 0, 1),
      exaggeration: clamp(Number(rawParams.exaggeration ?? 220), 20, 800),
    };

    const isIntersection = p.indicatorType === 'intersection';
    const isParallel = p.planeRelation === 'parallel';

    if (isIntersection) {
      // Chamfered block top surface: u along X (parallel to Datum A), v along Z (perp to Datum A)
      const nStations = 25;
      const nSamples = 33;
      const stations = [];
      const allSurfacePts = [];

      // Grid for flatness calculation
      for (let iu = 0; iu <= 12; iu++) {
        const u = iu / 12;
        for (let iv = 0; iv <= 12; iv++) {
          const v = iv / 12;
          allSurfacePts.push({
            x: u * PART_LENGTH_MM,
            z: v * PART_WIDTH_MM,
            y: evalBlockSurfaceY(u, v, p),
          });
        }
      }
      const flatnessError = solveMinZoneFlatness(allSurfacePts);

      let maxStraightness = 0;
      let worstStationFrac = 0.5;
      for (let sIdx = 0; sIdx < nStations; sIdx++) {
        const sFrac = sIdx / (nStations - 1);
        const pts = [];
        for (let k = 0; k < nSamples; k++) {
          const t = k / (nSamples - 1);
          const u = isParallel ? t : sFrac;
          const v = isParallel ? sFrac : t;
          const distMm = t * (isParallel ? PART_LENGTH_MM : PART_WIDTH_MM);
          pts.push({ t: distMm, y: evalBlockSurfaceY(u, v, p), frac: t });
        }
        const fit = solveMinZoneStraightness1D(pts);
        stations.push({ sFrac, error: fit.error, fit, pts });
        if (fit.error > maxStraightness) {
          maxStraightness = fit.error;
          worstStationFrac = sFrac;
        }
      }

      // Evaluate exact active slice at p.sliceFrac
      const activePts = [];
      const sliceSpanMm = isParallel ? PART_LENGTH_MM : PART_WIDTH_MM;
      for (let k = 0; k < nSamples; k++) {
        const t = k / (nSamples - 1);
        const u = isParallel ? t : p.sliceFrac;
        const v = isParallel ? p.sliceFrac : t;
        activePts.push({ t: t * sliceSpanMm, y: evalBlockSurfaceY(u, v, p), frac: t });
      }
      const activeFit = solveMinZoneStraightness1D(activePts);

      // Diagonal cut check comparing diagonal straightness against axial straightness
      const diagPts = [];
      const diagLen = Math.hypot(PART_LENGTH_MM, PART_WIDTH_MM);
      for (let k = 0; k < nSamples; k++) {
        const t = k / (nSamples - 1);
        diagPts.push({ t: t * diagLen, y: evalBlockSurfaceY(t, t, p), frac: t });
      }
      const diagFit = solveMinZoneStraightness1D(diagPts);

      const pass = maxStraightness <= p.toleranceMm + 1e-9;
      const utilizationPct = (maxStraightness / p.toleranceMm) * 100;

      return {
        mode: 'intersection',
        partFamily: 'chamfer_block',
        params: p,
        sliceSpanMm,
        controlledError: maxStraightness,
        orthogonalError: diagFit.error,
        flatnessError,
        diagonalError: diagFit.error,
        activeSliceError: activeFit.error,
        activeSlicePts: activePts,
        activeSliceFit: activeFit,
        stations,
        worstStationFrac,
        pass,
        utilizationPct,
        dofNote: isParallel ? 'Transverse bow & twist unconstrained' : 'Longitudinal bow & twist unconstrained',
        dofNoteEn: isParallel ? 'Transverse bow & twist unconstrained' : 'Longitudinal bow & twist unconstrained',
        dofNoteDe: isParallel ? 'Querwölbung & Verwindung frei' : 'Längswölbung & Verwindung frei',
      };
    }

    // Orientation Plane Indicator (h & i): Wedge / Knife-Edge Bar
    // Datum A = vertical front face (normal along Z). Orientation ⊥ A => planes normal to Y (vertical height along A).
    // Datum B = horizontal bottom face (normal along Y). Orientation // B => planes normal to Y (height normal to B).
    // Wait: If user flips planeRelation in Lab on Datum A (// A) or Datum B (⊥ B), handle the geometric normal consistently!
    const normAxisIsY =
      (p.datum === 'A' && p.planeRelation === 'perp') ||
      (p.datum === 'B' && p.planeRelation === 'parallel');

    const nSamples = 49;
    const edgeLenMm = 120;
    const ptsControlled = [];
    const ptsFree = [];
    const edgeSamples = [];

    for (let k = 0; k < nSamples; k++) {
      const u = k / (nSamples - 1);
      const off = evalWedgeEdgeOffset(u, p);
      const ctrlVal = normAxisIsY ? off.dy : off.dz;
      const freeVal = normAxisIsY ? off.dz : off.dy;
      const xMm = u * edgeLenMm;
      ptsControlled.push({ t: xMm, y: ctrlVal, frac: u });
      ptsFree.push({ t: xMm, y: freeVal, frac: u });
      edgeSamples.push({ u, xMm, dy: off.dy, dz: off.dz, ctrlVal, freeVal });
    }

    const fitCtrl = solveMinZoneStraightness1D(ptsControlled);
    const fitFree = solveMinZoneStraightness1D(ptsFree);
    const total3DExcursion = Math.hypot(fitCtrl.error, fitFree.error);
    const slopeNorm = Math.sqrt(1 + fitCtrl.slope * fitCtrl.slope);

    // Compute per-station perpendicular residual from minimum-zone midplane for plotting
    const stations = edgeSamples.map((s) => {
      const midY = fitCtrl.slope * s.xMm + fitCtrl.intercept;
      const residual = (s.ctrlVal - midY) / slopeNorm;
      const outOfTol = Math.abs(residual) > p.toleranceMm * 0.5 + 1e-9;
      return {
        sFrac: s.u,
        error: Math.abs(residual) * 2, // equivalent bilateral band required at station u
        residual,
        freeVal: s.freeVal,
        outOfTol,
      };
    });

    const activeIdx = Math.min(nSamples - 1, Math.max(0, Math.round(p.sliceFrac * (nSamples - 1))));
    const activeStation = stations[activeIdx];
    const pass = fitCtrl.error <= p.toleranceMm + 1e-9;
    const utilizationPct = (fitCtrl.error / p.toleranceMm) * 100;

    return {
      mode: 'orientation',
      partFamily: 'wedge_blade',
      params: p,
      sliceSpanMm: edgeLenMm,
      normAxis: normAxisIsY ? 'Y' : 'Z',
      controlledError: fitCtrl.error,
      orthogonalError: fitFree.error,
      flatnessError: total3DExcursion,
      activeSliceError: activeStation ? activeStation.error : 0,
      activeStation,
      edgeSamples,
      fitCtrl,
      fitFree,
      stations,
      pass,
      utilizationPct,
      dofNote: normAxisIsY
        ? 'Lateral Z-waviness stays between parallel planes'
        : 'Vertical Y-waviness stays between parallel planes',
      dofNoteEn: normAxisIsY
        ? 'Lateral Z-waviness stays between parallel planes'
        : 'Vertical Y-waviness stays between parallel planes',
      dofNoteDe: normAxisIsY
        ? 'Seitenschlag (Z) bleibt zwischen parallelen Ebenen'
        : 'Höhenwelligkeit (Y) bleibt zwischen parallelen Ebenen',
    };
  }

  global.ISO_PHYSICS = {
    PART_LENGTH_MM,
    PART_WIDTH_MM,
    solveMinZoneStraightness1D,
    solveMinZoneFlatness,
    profileWave,
    evalBlockSurfaceY,
    evalWedgeEdgeOffset,
    solveTolerance,
  };
})(window);
