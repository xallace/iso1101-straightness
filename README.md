# Straightness Lab · ISO 1101 Plane Indicators

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-d94426?style=for-the-badge&logo=github)](https://xallace.github.io/iso1101-straightness/)
[![License: MIT](https://img.shields.io/badge/License-MIT-047857?style=for-the-badge)](LICENSE)
[![Three.js + KaTeX](https://img.shields.io/badge/Three.js_%2B_KaTeX-Offline_Local-181715?style=for-the-badge)](#)

Interactive standalone 3D & 2D inspection lab styled in the 1967 parchment-ink-and-vermilion encyclopedia plate aesthetic, illustrating **DIN EN ISO 1101:2017** straightness tolerances with **Intersection Plane Indicators** (`⟨[ // | A ]`, `⟨[ ⊥ | A ]`) and **Orientation Plane Indicators** (`⟨[ ⊥ | A ]⟩`, `⟨[ // | B ]⟩`).

## Features

- **All 4 Plane Indicator Cases (Plates I–IV):** Interactive Three.js 3D models with ISO 5459 datum flags (`A`, `B`), surface leader dots (`•`) vs. edge arrowheads (`▼`), single-wedge vs. double-wedge Feature Control Frames, translucent cutting planes, parallel `t_G` tolerance zones, and animated stylus probes.
  - **Plate I (`⟨[ // | A ]`):** Intersection planes parallel to Datum `A` — longitudinal straightness along a linear guide bed while transverse cupping remains unconstrained.
  - **Plate II (`⟨[ ⊥ | A ]`):** Intersection planes perpendicular to Datum `A` — transverse cross-section straightness across an extruded mounting rail regardless of longitudinal bow.
  - **Plate III (`⟨[ ⊥ | A ]⟩`):** Orientation planes perpendicular to Datum `A` — locks the rotational DOF of two parallel `t_G` planes around a machined knife edge.
  - **Plate IV (`⟨[ // | B ]⟩`):** Orientation planes parallel to base Datum `B` — vertical height zone along the upper edge relative to mounting face `B`.
- **Exact Chebyshev Minimum-Zone Straightness & Flatness (`physics.js`):** Real-time minimax solver evaluating individual cutting planes, 3D edge excursions, diagonal checks, and the **Ruled Surface Twist Paradox** (where `e_str = 0` in both `// A` and `⊥ A` while Flatness fails).
- **Synchronized 2D Section & Multi-Station Deviation Plots:** Live Chebyshev cut profiles (`I`, `II`), end-on zone sections (`III`, `IV`), and a hoverable multi-station envelope chart.
- **Bilingual UI (`EN` / `DE`), 5-Stop Guided Tour, & KaTeX Derivations.**

## Running Standalone

Open `index.html` directly in any modern browser (`file://` or HTTP). All Three.js and KaTeX assets are bundled locally in `vendor/`.

## Verification

```bash
node tests/verify.mjs
node tests/geometry.mjs
```

## License

Licensed under the **MIT License** ([LICENSE](LICENSE)). Vendored `three.js` and `KaTeX` libraries retain their respective MIT licenses under `vendor/`.
