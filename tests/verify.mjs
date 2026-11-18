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
}

// 3. All figures, presets, and corner parameters remain finite
{
  let bad = 0;
  for (const id of D.FIGURE_ORDER) {
    const f = D.FIGURES[id];
    for (const p of [f.nominalParams, f.errorParams]) {
      const r = P.solveTolerance(p);
      if (!Number.isFinite(r.controlledError) || !Number.isFinite(r.flatnessError)) bad++;
    }
  }
  for (const pid of Object.keys(D.LAB_PRESETS)) {
    const r = P.solveTolerance(D.LAB_PRESETS[pid].params);
    if (!Number.isFinite(r.controlledError) || !Number.isFinite(r.flatnessError)) bad++;
  }
  check('All figures (f-i) & 6 lab presets defined and finite',
    D.FIGURE_ORDER.length === 4 && Object.keys(D.LAB_PRESETS).length === 6 && D.TOUR_STOPS.length === 5 && bad === 0,
    `figs=${D.FIGURE_ORDER.length}, presets=${Object.keys(D.LAB_PRESETS).length}, bad=${bad}`);
}

console.log(`\nSummary: ${failed === 0 ? 'ALL CHECKS PASSED' : `${failed} FAILED`}`);
if (failed > 0) process.exit(1);
