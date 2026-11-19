// Chebyshev Minimum-Zone Straightness, Flatness & ISO 1101 Verification
// Run with: node tests/verify.mjs
import { readFileSync } from 'node:fs';

globalThis.window = globalThis;
(0, eval)(readFileSync(new URL('../physics.js', import.meta.url), 'utf8'));
(0, eval)(readFileSync(new URL('../data.js', import.meta.url), 'utf8'));

const P = window.ISO_PHYSICS;
const D = window.ISO_DATA;

let failed = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}: ${detail}`);
  if (!ok) failed++;
}

// 1. Exact Minimum-Zone Straightness invariants
{
  const tiltedLine = Array.from({ length: 21 }, (_, i) => {
    const t = i * 5;
    return { t, y: 0.0023 * t - 0.14 };
  });
  const fit0 = P.solveMinZoneStraightness1D(tiltedLine);
  check('Exact tilted line has 0 straightness error', fit0.error < 1e-9, `err=${fit0.error}`);

  const bowed = Array.from({ length: 41 }, (_, i) => {
    const u = i / 40;
    return { t: u * 100, y: 0.05 * P.profileWave(u, 1) + 0.001 * u };
  });
  const fitB = P.solveMinZoneStraightness1D(bowed);
  check('Parabolic bow 0.05 mm + tilt yields exact ~0.050 mm Chebyshev span', Math.abs(fitB.error - 0.05) < 0.002,
    `err=${fitB.error.toFixed(4)} mm`);
}

// 2. ISO 1101 physical behaviors (Intersection // A, perp A, Orientation perp A, // B & Twist Paradox)
{
  // Fig. f: Transverse cupping passes // A while failing flatness
  const resF = P.solveTolerance(D.FIGURES.fig_f.errorParams);
  check('Fig. f passes // A straightness despite strong transverse cupping',
    resF.pass && resF.controlledError <= 0.015 && resF.flatnessError > 0.06,
    `e_str=${resF.controlledError.toFixed(3)}, flatness=${resF.flatnessError.toFixed(3)}`);

  // Fig. g: Longitudinal bow passes perp A while failing flatness
  const resG = P.solveTolerance(D.FIGURES.fig_g.errorParams);
  check('Fig. g passes perp A straightness despite longitudinal camber',
    resG.pass && resG.controlledError <= 0.015 && resG.flatnessError > 0.06,
    `e_str=${resG.controlledError.toFixed(3)}, flatness=${resG.flatnessError.toFixed(3)}`);

  // Twist paradox: zero error along BOTH // A and perp A, yet non-zero flatness & diagonal error
  const resTwPar = P.solveTolerance(D.LAB_PRESETS.twist_paradox.params);
  const resTwPerp = P.solveTolerance({ ...D.LAB_PRESETS.twist_paradox.params, planeRelation: 'perp' });
  check('Ruled twist passes // A and perp A with zero line error while Flatness & Diagonal > 0',
    resTwPar.controlledError < 1e-7 && resTwPerp.controlledError < 1e-7 && resTwPar.flatnessError > 0.04 && resTwPar.diagonalError > 0.04,
    `e_par=${resTwPar.controlledError.toFixed(4)}, e_perp=${resTwPerp.controlledError.toFixed(4)}, flat=${resTwPar.flatnessError.toFixed(3)}, diag=${resTwPar.diagonalError.toFixed(3)}`);

  // Fig. h: Lateral sway normal to A stays inside perp-A parallel planes
  const resH = P.solveTolerance(D.FIGURES.fig_h.errorParams);
  check('Fig. h passes 0.02 mm perp-A zone while unconstrained lateral sway is 0.052 mm',
    resH.pass && resH.controlledError < 0.02 && resH.orthogonalError > 0.045,
    `e_ctrl=${resH.controlledError.toFixed(3)}, e_free=${resH.orthogonalError.toFixed(3)}`);

  // Fig. i: Vertical wave normal to B fails 0.03 mm // B zone
  const resI = P.solveTolerance(D.FIGURES.fig_i.errorParams);
  check('Fig. i fails 0.03 mm //-B zone when vertical crest exceeds tolerance',
    !resI.pass && resI.controlledError > 0.035,
    `e_ctrl=${resI.controlledError.toFixed(3)} > 0.030`);

  // Preset carrier_fail ("Longitudinal Ripple (Fail I)") must actually fail
  const resCF = P.solveTolerance(D.LAB_PRESETS.carrier_fail.params);
  check('Preset carrier_fail ("Fail I") actually fails 0.050 mm zone',
    !resCF.pass && resCF.controlledError > 0.05,
    `e_ctrl=${resCF.controlledError.toFixed(4)} > 0.050`);
}

// 3. All figures, presets, slider bounds, callout anchors, and ISO 1101 references remain consistent
{
  let bad = 0;
  for (const id of D.FIGURE_ORDER) {
    const f = D.FIGURES[id];
    for (const p of [f.nominalParams, f.errorParams]) {
      const r = P.solveTolerance(p);
      if (!Number.isFinite(r.controlledError) || !Number.isFinite(r.flatnessError)) bad++;
      if (!r.dofNoteEn || !r.dofNoteDe) bad++;
    }
  }
  for (const pid of Object.keys(D.LAB_PRESETS)) {
    const r = P.solveTolerance(D.LAB_PRESETS[pid].params);
    if (!Number.isFinite(r.controlledError) || !Number.isFinite(r.flatnessError)) bad++;
  }
  check('All figures (f-i) & 6 lab presets defined, finite, and bilingual',
    D.FIGURE_ORDER.length === 4 && Object.keys(D.LAB_PRESETS).length === 6 && D.TOUR_STOPS.length === 5 && bad === 0,
    `figs=${D.FIGURE_ORDER.length}, presets=${Object.keys(D.LAB_PRESETS).length}, bad=${bad}`);

  // Slider bounds & step alignment check for all presets
  const sliderBounds = {
    toleranceMm: { min: 0.01, max: 0.10, step: 0.005 },
    sliceFrac: { min: 0.0, max: 1.0, step: 0.02 },
    exaggeration: { min: 80, max: 450, step: 20 },
    bowLong: { min: -0.08, max: 0.08, step: 0.002 },
    bowTrans: { min: -0.08, max: 0.08, step: 0.002 },
    twist: { min: -0.10, max: 0.10, step: 0.002 },
    bowVert: { min: -0.08, max: 0.08, step: 0.002 },
    bowLat: { min: -0.08, max: 0.08, step: 0.002 },
    harmonics: { min: 1, max: 4, step: 1 },
  };
  const boundErrs = [];
  for (const [pid, pr] of Object.entries(D.LAB_PRESETS)) {
    for (const [k, b] of Object.entries(sliderBounds)) {
      if (pr.params[k] === undefined) continue;
      const v = pr.params[k];
      if (v < b.min - 1e-9 || v > b.max + 1e-9) {
        boundErrs.push(`${pid}.${k}=${v} out of [${b.min},${b.max}]`);
      }
      const steps = (v - b.min) / b.step;
      if (Math.abs(steps - Math.round(steps)) > 1e-6) {
        boundErrs.push(`${pid}.${k}=${v} off step ${b.step}`);
      }
    }
  }
  check('All presets lie within Lab slider min/max bounds and exact steps',
    boundErrs.length === 0,
    boundErrs.length ? boundErrs.join('; ') : 'all 6 presets aligned');

  // EN/DE callout anchor parity & above-plate check
  const anchorErrs = [];
  for (const id of D.FIGURE_ORDER) {
    const f = D.FIGURES[id];
    if (f.en.callouts.length !== f.de.callouts.length) {
      anchorErrs.push(`${id} count mismatch`);
      continue;
    }
    f.en.callouts.forEach((ce, idx) => {
      const cd = f.de.callouts[idx];
      if (JSON.stringify(ce.anchor) !== JSON.stringify(cd.anchor)) {
        anchorErrs.push(`${id}.${ce.id} EN/DE anchor mismatch`);
      }
      if (ce.anchor[1] < 0) {
        anchorErrs.push(`${id}.${ce.id} y=${ce.anchor[1]} below plate`);
      }
    });
  }
  check('EN & DE 3D callout anchors match identically and sit above base plate',
    anchorErrs.length === 0,
    anchorErrs.length ? anchorErrs.join('; ') : 'all 16 callouts aligned');

  // ISO 1101:2017 normative references check
  const std0 = D.FURTHER_READING.standards[0];
  const badUrls = D.FURTHER_READING.standards.filter((s) => /40368|46416/.test(s.url));
  check('ISO 1101:2017 clauses (§13, §14) & standard URLs valid',
    std0.source.includes('§13') && std0.source.includes('§14') && badUrls.length === 0,
    `source="${std0.source}", badUrls=${badUrls.length}`);

  // formatTol preserves 0.005 increments
  check('formatTol preserves 3rd decimal on 0.025 while formatting 0.05 cleanly',
    D.formatTol(0.025, true) === '0,025' && D.formatTol(0.05, true) === '0,05',
    `0.025->${D.formatTol(0.025, true)}, 0.05->${D.formatTol(0.05, true)}`);
}

console.log(`\nSummary: ${failed === 0 ? 'ALL CHECKS PASSED' : `${failed} FAILED`}`);
if (failed > 0) process.exit(1);
