// Geometry checks for scene3d.js (loads vendored Three.js in Node, no browser needed)
// Run with: node tests/geometry.mjs
import { readFileSync } from 'node:fs';

globalThis.window = globalThis;
const load = (rel) => (0, eval)(readFileSync(new URL(rel, import.meta.url), 'utf8'));
load('../vendor/three/three.min.js');
load('../physics.js');
load('../data.js');
load('../scene3d.js');

const THREE = globalThis.THREE;
const D = window.ISO_DATA;
const S = window.ISO_SCENE3D;

let failed = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}: ${detail}`);
  if (!ok) failed++;
}

const TOL = 0.02;

for (const key of D.FIGURE_ORDER) {
  const fig = D.FIGURES[key];
  for (const variant of ['nominal', 'error']) {
    for (const mode of ['solid3d', 'exploded', 'wireframe']) {
      const params = variant === 'nominal' ? fig.nominalParams : fig.errorParams;
      const anim = [];
      const { root, stats } = S.buildFigureGeometry(
        key,
        params,
        { displayMode: mode, showZone: true, showPlanes: true },
        anim
      );
      root.updateMatrixWorld(true);

      const plate = root.children.find((c) => c.isMesh && c.userData.isPlate);
      const pb = new THREE.Box3().setFromObject(plate);
      const lim = { x: pb.max.x, z: pb.max.z };

      const over = [];
      root.children.forEach((c, i) => {
        if (c.userData.isPlate) return;
        const b = new THREE.Box3().setFromObject(c);
        if (b.isEmpty()) return;
        const dx = Math.max(b.max.x - lim.x, -lim.x - b.min.x);
        const dz = Math.max(b.max.z - lim.z, -lim.z - b.min.z);
        if (dx > TOL || dz > TOL) {
          over.push(`#${i} ${c.type} x[${b.min.x.toFixed(2)},${b.max.x.toFixed(2)}] z[${b.min.z.toFixed(2)},${b.max.z.toFixed(2)}]`);
        }
      });
      check(`${key} (${variant}, ${mode}) inside plate ±${lim.x.toFixed(2)}×±${lim.z.toFixed(2)}`,
        over.length === 0 && Number.isFinite(stats.controlledError),
        over.length ? `${over.length} outside: ${over.slice(0, 3).join('; ')}` : `${root.children.length} objects, anim=${anim.length}`);
    }
  }
}

console.log(`\nSummary: ${failed === 0 ? 'ALL CHECKS PASSED' : `${failed} FAILED`}`);
if (failed > 0) process.exit(1);
