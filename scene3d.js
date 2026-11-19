/* ==========================================================================
   scene3d.js — Three.js 1967 Book-Plate 3D Straightness Models,
                ISO 1101 Intersection & Orientation Plane Zones,
                Datum Badges, Leader Arrows/Dots & Animated CMM Probe
   ========================================================================== */
(function (global) {
  'use strict';

  const THREE = global.THREE;
  const P = global.ISO_PHYSICS;

  const INK_DARK = 0x181715;
  const INK_CHARCOAL = 0x2b2823;
  const PAPER_BG = 0xefe6d3;
  const PAPER_CARD = 0xf6efe0;
  const PAPER_ROAD = 0xfaf5e8;
  const PAPER_SHADE = 0xe4d9c3;
  const VERMILION = 0xd94426;
  const AMBER_WARM = 0xb45309;
  const OK_GREEN = 0x047857;
  const FAIL_RED = 0xb91c1c;

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function formatTolIso(val) {
    if (typeof val === 'string') return val.replace('.', ',');
    const n = Number(val ?? 0.05);
    const s3 = n.toFixed(3);
    return (s3.endsWith('0') ? n.toFixed(2) : s3).replace('.', ',');
  }

  function clearGroup(group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
      if (child.children && child.children.length > 0) clearGroup(child);
    }
  }

  // Create a crisp 1967-plate ink/parchment sprite label (skipped gracefully in Node)
  function makeLabelSprite(drawFn, cw, ch, worldW, worldH) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    drawFn(ctx, cw, ch);
    const tex = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const spr = new THREE.Sprite(mat);
    spr.scale.set(worldW, worldH, 1);
    spr.renderOrder = 20;
    return spr;
  }

  function makeDatumSprite(letter) {
    return makeLabelSprite((ctx, w, h) => {
      ctx.fillStyle = '#faf5e8';
      ctx.strokeStyle = '#181715';
      ctx.lineWidth = 4;
      ctx.fillRect(6, 6, w - 12, h - 12);
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = '#181715';
      ctx.font = 'bold 42px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, w / 2, h / 2 + 2);
    }, 72, 72, 0.22, 0.22);
  }

  function makeFcfSprite(fcf) {
    const tolStr = formatTolIso(fcf.tol ?? '0,05');
    const isOrient = fcf.capType === 'orientation';
    return makeLabelSprite((ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const x0 = 6, y0 = 8, bh = h - 16;
      const b1 = 58, b2 = 110, wedge = 20, b3 = 50, b4 = 50;
      const capX = x0 + b1 + b2;
      const capBody = capX + wedge;
      const midX = capBody + b3;
      const endX = midX + b4;

      // Tolerance box
      ctx.fillStyle = '#faf5e8';
      ctx.strokeStyle = '#181715';
      ctx.lineWidth = 3.5;
      ctx.fillRect(x0, y0, b1 + b2, bh);
      ctx.strokeRect(x0, y0, b1 + b2, bh);
      ctx.beginPath();
      ctx.moveTo(x0 + b1, y0);
      ctx.lineTo(x0 + b1, y0 + bh);
      ctx.stroke();

      // Straightness symbol —
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(x0 + 13, y0 + bh / 2);
      ctx.lineTo(x0 + b1 - 13, y0 + bh / 2);
      ctx.stroke();

      // Tolerance value
      ctx.fillStyle = '#181715';
      ctx.font = `bold ${tolStr.length > 4 ? 24 : 28}px "JetBrains Mono", Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tolStr, x0 + b1 + b2 / 2, y0 + bh / 2 + 2);

      // Plane indicator cap
      ctx.fillStyle = '#f6efe0';
      ctx.strokeStyle = '#d94426';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(capX, y0 + bh / 2);
      ctx.lineTo(capBody, y0);
      ctx.lineTo(endX, y0);
      if (isOrient) {
        ctx.lineTo(endX + wedge, y0 + bh / 2);
        ctx.lineTo(endX, y0 + bh);
      } else {
        ctx.lineTo(endX, y0 + bh);
      }
      ctx.lineTo(capBody, y0 + bh);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(capBody, y0);
      ctx.lineTo(capBody, y0 + bh);
      ctx.moveTo(midX, y0);
      ctx.lineTo(midX, y0 + bh);
      ctx.stroke();

      // // or perp
      ctx.strokeStyle = '#181715';
      ctx.lineWidth = 3.5;
      if (fcf.rel === 'parallel') {
        ctx.beginPath();
        ctx.moveTo(capBody + 14, y0 + bh - 15);
        ctx.lineTo(capBody + 26, y0 + 15);
        ctx.moveTo(capBody + 26, y0 + bh - 15);
        ctx.lineTo(capBody + 38, y0 + 15);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(capBody + 10, y0 + bh - 16);
        ctx.lineTo(capBody + 42, y0 + bh - 16);
        ctx.moveTo(capBody + 26, y0 + bh - 16);
        ctx.lineTo(capBody + 26, y0 + 15);
        ctx.stroke();
      }

      // Datum letter
      ctx.fillStyle = '#181715';
      ctx.fillText(fcf.datum || 'A', midX + b4 / 2, y0 + bh / 2 + 2);
    }, 320, 76, 1.05, 0.25);
  }

  function makeTextTagSprite(text, colorHex = '#d94426') {
    return makeLabelSprite((ctx, w, h) => {
      ctx.fillStyle = 'rgba(250, 245, 232, 0.92)';
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(4, 4, w - 8, h - 8, 10) : ctx.rect(4, 4, w - 8, h - 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colorHex;
      ctx.font = 'bold 24px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2 + 1);
    }, 188, 56, 0.52, 0.155);
  }

  function addLine(group, pts, color, opts = {}) {
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    let mat;
    if (opts.dashed) {
      mat = new THREE.LineDashedMaterial({
        color,
        dashSize: opts.dashSize || 0.08,
        gapSize: opts.gapSize || 0.055,
        transparent: opts.opacity !== undefined,
        opacity: opts.opacity ?? 1.0,
      });
    } else {
      mat = new THREE.LineBasicMaterial({
        color,
        transparent: opts.opacity !== undefined,
        opacity: opts.opacity ?? 1.0,
      });
    }
    const line = new THREE.Line(geo, mat);
    if (opts.dashed) line.computeLineDistances();
    group.add(line);
    return line;
  }

  function addQuad(group, corners, color, opacity, doubleSide = true) {
    const pos = [];
    corners.forEach((c) => pos.push(c.x, c.y, c.z));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.computeVertexNormals();
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
      depthWrite: opacity >= 1,
    });
    const m = new THREE.Mesh(geo, mat);
    group.add(m);
    return m;
  }

  // Build crisp 3D Datum triangle + badge
  function addDatumSymbol(group, anchorPos, dirVec, letter, isWire) {
    const triGeo = new THREE.ConeGeometry(0.052, 0.085, 3);
    const triMat = new THREE.MeshBasicMaterial({ color: INK_DARK, wireframe: isWire });
    const tri = new THREE.Mesh(triGeo, triMat);
    tri.position.copy(anchorPos).addScaledVector(dirVec, 0.042);
    // Point base against surface, apex outward along dirVec
    tri.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirVec.clone().normalize());
    group.add(tri);

    const endPos = anchorPos.clone().addScaledVector(dirVec, 0.24);
    addLine(group, [anchorPos, endPos], INK_DARK);

    const spr = makeDatumSprite(letter);
    if (spr) {
      spr.position.copy(endPos).addScaledVector(dirVec, 0.11);
      group.add(spr);
    } else {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.14, 0.03),
        new THREE.MeshBasicMaterial({ color: PAPER_ROAD, wireframe: isWire })
      );
      box.position.copy(endPos).addScaledVector(dirVec, 0.07);
      group.add(box);
    }
  }

  // Build leader stem with dot (surface) or arrowhead (edge) + FCF sign
  function addLeaderAndFcf(group, targetPos, stemHeight, fcf, isWire) {
    const bendPos = new THREE.Vector3(targetPos.x, targetPos.y + stemHeight, targetPos.z);
    const armEnd = new THREE.Vector3(targetPos.x + 0.20, bendPos.y, targetPos.z);
    addLine(group, [targetPos, bendPos, armEnd], INK_DARK);

    if (fcf.terminator === 'dot') {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 14, 12),
        new THREE.MeshBasicMaterial({ color: INK_DARK, wireframe: isWire })
      );
      dot.position.copy(targetPos);
      group.add(dot);
    } else {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.038, 0.11, 12),
        new THREE.MeshBasicMaterial({ color: INK_DARK, wireframe: isWire })
      );
      cone.position.set(targetPos.x, targetPos.y + 0.055, targetPos.z);
      cone.rotation.z = Math.PI; // point straight down to edge
      group.add(cone);
    }

    const spr = makeFcfSprite(fcf);
    if (spr) {
      spr.position.set(armEnd.x + 0.52, armEnd.y, armEnd.z);
      group.add(spr);
    }
  }

  // --------------------------------------------------------------------------
  // Model Family A: Chamfered Block (Figs. f & g — Intersection Plane)
  // --------------------------------------------------------------------------
  function buildChamferBlock(root, params, result, opts, animTargets) {
    const isWire = opts.displayMode === 'wireframe';
    const isExploded = opts.displayMode === 'exploded';
    const isPlate2d = opts.displayMode === 'plate2d';
    const tierLift = isExploded ? 0.36 : 0.0;
    const isParallel = params.planeRelation === 'parallel';

    const xLeft = -1.25;
    const xShoulder = 0.55;
    const xRight = 1.25;
    const zMin = -0.45;
    const zMax = 0.45;
    const yBase = 0.02;
    const yTopNom = 0.48;
    const yNose = 0.24;

    const visScale = params.exaggeration * 0.0065;
    const devY = (u, v) => yTopNom + P.evalBlockSurfaceY(u, v, params) * visScale;

    const nu = 22;
    const nv = 14;

    // 1. Deformed Top Flat Face (nu x nv grid)
    const topPos = [];
    const topIdx = [];
    const topGrid = [];
    for (let iu = 0; iu <= nu; iu++) {
      const u = iu / nu;
      const x = xLeft + u * (xShoulder - xLeft);
      const row = [];
      for (let iv = 0; iv <= nv; iv++) {
        const v = iv / nv;
        const z = zMin + v * (zMax - zMin);
        const y = devY(u, v);
        row.push(new THREE.Vector3(x, y, z));
        topPos.push(x, y, z);
      }
      topGrid.push(row);
    }
    for (let iu = 0; iu < nu; iu++) {
      for (let iv = 0; iv < nv; iv++) {
        const a = iu * (nv + 1) + iv;
        const b = a + 1;
        const c = (iu + 1) * (nv + 1) + iv;
        const d = c + 1;
        topIdx.push(a, b, d, a, d, c);
      }
    }
    const topGeo = new THREE.BufferGeometry();
    topGeo.setAttribute('position', new THREE.Float32BufferAttribute(topPos, 3));
    topGeo.setIndex(topIdx);
    topGeo.computeVertexNormals();
    const bodyMat = isPlate2d
      ? new THREE.MeshBasicMaterial({ color: PAPER_ROAD, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({
          color: PAPER_ROAD,
          roughness: 0.88,
          metalness: 0.03,
          side: THREE.DoubleSide,
          wireframe: isWire,
          transparent: isWire,
          opacity: isWire ? 0.45 : 1.0,
        });
    const datumHighlightMat = isPlate2d
      ? new THREE.MeshBasicMaterial({ color: PAPER_SHADE, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({
          color: PAPER_SHADE,
          roughness: 0.9,
          metalness: 0.02,
          side: THREE.DoubleSide,
          wireframe: isWire,
        });
    root.add(new THREE.Mesh(topGeo, bodyMat));

    // 2. Chamfer Slope Face (xShoulder..xRight, smoothly matching top edge at u=1)
    const chPos = [];
    const chIdx = [];
    for (let iv = 0; iv <= nv; iv++) {
      const v = iv / nv;
      const z = zMin + v * (zMax - zMin);
      const ys = devY(1, v);
      chPos.push(xShoulder, ys, z, xRight, yNose, z);
    }
    for (let iv = 0; iv < nv; iv++) {
      const a = iv * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      chIdx.push(a, b, d, a, d, c);
    }
    const chGeo = new THREE.BufferGeometry();
    chGeo.setAttribute('position', new THREE.Float32BufferAttribute(chPos, 3));
    chGeo.setIndex(chIdx);
    chGeo.computeVertexNormals();
    root.add(new THREE.Mesh(chGeo, bodyMat));

    // 3. Front Face (Datum A, z = zMax) & Back Face (z = zMin) stitched to deformed top edge
    function buildSideWall(zVal, vConst, mat) {
      const pos = [];
      const idx = [];
      for (let iu = 0; iu <= nu; iu++) {
        const u = iu / nu;
        const x = xLeft + u * (xShoulder - xLeft);
        pos.push(x, yBase, zVal, x, devY(u, vConst), zVal);
      }
      pos.push(xRight, yBase, zVal, xRight, yNose, zVal);
      const totalCols = nu + 1;
      for (let iu = 0; iu < totalCols; iu++) {
        const a = iu * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        idx.push(a, c, d, a, d, b);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      root.add(new THREE.Mesh(g, mat));
    }
    buildSideWall(zMax, 1, datumHighlightMat);
    buildSideWall(zMin, 0, bodyMat);

    // 4. Left End Face (x = xLeft), Right Nose Face (x = xRight), Bottom Face (y = yBase)
    const leftPos = [];
    const leftIdx = [];
    for (let iv = 0; iv <= nv; iv++) {
      const v = iv / nv;
      const z = zMin + v * (zMax - zMin);
      leftPos.push(xLeft, yBase, z, xLeft, devY(0, v), z);
    }
    for (let iv = 0; iv < nv; iv++) {
      const a = iv * 2;
      leftIdx.push(a, a + 2, a + 3, a, a + 3, a + 1);
    }
    const leftGeo = new THREE.BufferGeometry();
    leftGeo.setAttribute('position', new THREE.Float32BufferAttribute(leftPos, 3));
    leftGeo.setIndex(leftIdx);
    leftGeo.computeVertexNormals();
    root.add(new THREE.Mesh(leftGeo, bodyMat));

    addQuad(root, [
      new THREE.Vector3(xRight, yBase, zMin),
      new THREE.Vector3(xRight, yNose, zMin),
      new THREE.Vector3(xRight, yNose, zMax),
      new THREE.Vector3(xRight, yBase, zMax),
    ], PAPER_ROAD, isWire ? 0.25 : 1.0);
    addQuad(root, [
      new THREE.Vector3(xLeft, yBase, zMin),
      new THREE.Vector3(xRight, yBase, zMin),
      new THREE.Vector3(xRight, yBase, zMax),
      new THREE.Vector3(xLeft, yBase, zMax),
    ], PAPER_SHADE, isWire ? 0.2 : 1.0);

    // 5. Crisp Technical Ink Outlines along all block edges
    const frontTopEdge = [];
    const backTopEdge = [];
    for (let iu = 0; iu <= nu; iu++) {
      frontTopEdge.push(topGrid[iu][nv]);
      backTopEdge.push(topGrid[iu][0]);
    }
    const leftTopEdge = topGrid[0].slice();
    const shoulderEdge = topGrid[nu].slice();

    addLine(root, frontTopEdge, INK_DARK);
    addLine(root, backTopEdge, INK_DARK);
    addLine(root, leftTopEdge, INK_DARK);
    addLine(root, shoulderEdge, INK_DARK);
    addLine(root, [
      new THREE.Vector3(xLeft, yBase, zMax),
      new THREE.Vector3(xRight, yBase, zMax),
      new THREE.Vector3(xRight, yNose, zMax),
      topGrid[nu][nv],
    ], INK_DARK);
    addLine(root, [
      new THREE.Vector3(xLeft, yBase, zMin),
      new THREE.Vector3(xRight, yBase, zMin),
      new THREE.Vector3(xRight, yNose, zMin),
      topGrid[nu][0],
    ], INK_DARK);
    addLine(root, [new THREE.Vector3(xLeft, yBase, zMin), new THREE.Vector3(xLeft, yBase, zMax)], INK_DARK);
    addLine(root, [new THREE.Vector3(xLeft, yBase, zMin), topGrid[0][0]], INK_DARK);
    addLine(root, [new THREE.Vector3(xLeft, yBase, zMax), topGrid[0][nv]], INK_DARK);
    addLine(root, [new THREE.Vector3(xRight, yBase, zMin), new THREE.Vector3(xRight, yBase, zMax)], INK_DARK);
    addLine(root, [new THREE.Vector3(xRight, yNose, zMin), new THREE.Vector3(xRight, yNose, zMax)], INK_DARK);

    // 6. Datum A Symbol on Front Vertical Face
    const datumPos = new THREE.Vector3(-0.35, 0.22, zMax);
    addDatumSymbol(root, datumPos, new THREE.Vector3(0, 0, 1), params.datum || 'A', isWire);
    // Subtle surface dot on Datum A
    const datDot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), new THREE.MeshBasicMaterial({ color: INK_DARK }));
    datDot.position.copy(datumPos);
    root.add(datDot);

    // 7. Leader Dot & ISO 1101 Feature Control Frame
    const fcfSpec = {
      sym: 'straightness',
      tol: formatTolIso(params.toleranceMm),
      capType: 'intersection',
      rel: params.planeRelation,
      datum: params.datum || 'A',
      terminator: 'dot',
    };
    const dotTarget = new THREE.Vector3(-0.32, devY(0.51, 0.50) + 0.005, 0.0);
    addLeaderAndFcf(root, dotTarget, 0.31 + tierLift * 0.45, fcfSpec, isWire);

    // 8. Cutting Planes & Extracted Surface Lines
    if (opts.showPlanes) {
      const planeFracs = [0.14, 0.32, 0.50, 0.68, 0.86];
      planeFracs.forEach((f) => {
        const linePts = [];
        for (let k = 0; k <= 24; k++) {
          const t = k / 24;
          const u = isParallel ? t : f;
          const v = isParallel ? f : t;
          const x = xLeft + u * (xShoulder - xLeft);
          const z = zMin + v * (zMax - zMin);
          linePts.push(new THREE.Vector3(x, devY(u, v) + 0.008 + tierLift, z));
        }
        addLine(root, linePts, INK_DARK, { dashed: true, dashSize: 0.09, gapSize: 0.055, opacity: 0.88 });

        // Translucent cutting plane sheet
        const pY0 = yTopNom - 0.08 + tierLift;
        const pY1 = yTopNom + 0.24 + tierLift;
        if (isParallel) {
          const zP = zMin + f * (zMax - zMin);
          addQuad(root, [
            new THREE.Vector3(xLeft - 0.06, pY0, zP),
            new THREE.Vector3(xShoulder + 0.06, pY0, zP),
            new THREE.Vector3(xShoulder + 0.06, pY1, zP),
            new THREE.Vector3(xLeft - 0.06, pY1, zP),
          ], VERMILION, 0.065);
        } else {
          const xP = xLeft + f * (xShoulder - xLeft);
          addQuad(root, [
            new THREE.Vector3(xP, pY0, zMin - 0.06),
            new THREE.Vector3(xP, pY0, zMax + 0.06),
            new THREE.Vector3(xP, pY1, zMax + 0.06),
            new THREE.Vector3(xP, pY1, zMin - 0.06),
          ], VERMILION, 0.065);
        }
      });
    }

    // 9. Active Slice Tolerance Zone Ribbon (t_G) & Live Probed Curve
    if (opts.showZone) {
      const fAct = params.sliceFrac;
      const fit = result.activeSliceFit || { slope: 0, intercept: 0 };
      const halfZone = 0.5 * params.toleranceMm * visScale;
      const spanMm = isParallel ? P.PART_LENGTH_MM : P.PART_WIDTH_MM;

      const lowerPts = [];
      const upperPts = [];
      const actualPts = [];
      const zoneEps = 0.006;
      for (let k = 0; k <= 32; k++) {
        const t = k / 32;
        const u = isParallel ? t : fAct;
        const v = isParallel ? fAct : t;
        const x = xLeft + u * (xShoulder - xLeft);
        const z = zMin + v * (zMax - zMin);
        const midY = yTopNom + (fit.slope * (t * spanMm) + fit.intercept) * visScale + zoneEps + tierLift;
        lowerPts.push(new THREE.Vector3(x, midY - halfZone, z));
        upperPts.push(new THREE.Vector3(x, midY + halfZone, z));
        actualPts.push(new THREE.Vector3(x, devY(u, v) + zoneEps + tierLift, z));
      }

      const zoneColor = result.pass ? OK_GREEN : FAIL_RED;
      addLine(root, lowerPts, VERMILION, { dashed: true, dashSize: 0.06, gapSize: 0.04 });
      addLine(root, upperPts, VERMILION, { dashed: true, dashSize: 0.06, gapSize: 0.04 });
      addLine(root, actualPts, zoneColor);

      // Translucent tolerance zone ribbon between lower & upper bounds
      const rPos = [];
      const rIdx = [];
      for (let k = 0; k < lowerPts.length; k++) {
        rPos.push(lowerPts[k].x, lowerPts[k].y, lowerPts[k].z);
        rPos.push(upperPts[k].x, upperPts[k].y, upperPts[k].z);
      }
      for (let k = 0; k < lowerPts.length - 1; k++) {
        const a = k * 2;
        rIdx.push(a, a + 1, a + 3, a, a + 3, a + 2);
      }
      const rGeo = new THREE.BufferGeometry();
      rGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
      rGeo.setIndex(rIdx);
      root.add(new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({
        color: result.pass ? OK_GREEN : VERMILION,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      })));

      // Active highlight cutting plane frame
      const pY0 = yTopNom - 0.10 + tierLift;
      const pY1 = yTopNom + 0.30 + tierLift;
      if (isParallel) {
        const zP = zMin + fAct * (zMax - zMin);
        addLine(root, [
          new THREE.Vector3(xLeft - 0.08, pY0, zP),
          new THREE.Vector3(xShoulder + 0.08, pY0, zP),
          new THREE.Vector3(xShoulder + 0.08, pY1, zP),
          new THREE.Vector3(xLeft - 0.08, pY1, zP),
          new THREE.Vector3(xLeft - 0.08, pY0, zP),
        ], VERMILION, { opacity: 0.85 });
      } else {
        const xP = xLeft + fAct * (xShoulder - xLeft);
        addLine(root, [
          new THREE.Vector3(xP, pY0, zMin - 0.08),
          new THREE.Vector3(xP, pY0, zMax + 0.08),
          new THREE.Vector3(xP, pY1, zMax + 0.08),
          new THREE.Vector3(xP, pY1, zMin - 0.08),
          new THREE.Vector3(xP, pY0, zMin - 0.08),
        ], VERMILION, { opacity: 0.85 });
      }

      // CMM Stylus Probe gliding along the active extracted profile
      const stylusGroup = new THREE.Group();
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 12, 12),
        new THREE.MeshBasicMaterial({ color: VERMILION })
      );
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8),
        new THREE.MeshBasicMaterial({ color: INK_DARK })
      );
      shaft.position.y = 0.12;
      stylusGroup.add(tip, shaft);
      root.add(stylusGroup);

      animTargets.push({
        type: 'probe_surface',
        mesh: stylusGroup,
        pts: actualPts,
        phase: 0.2,
        speed: 0.28,
      });
    }
  }

  // --------------------------------------------------------------------------
  // Model Family B: Wedge / Knife-Edge Bar (Figs. h & i — Orientation Plane)
  // --------------------------------------------------------------------------
  function buildWedgeBlade(root, params, result, opts, animTargets) {
    const isWire = opts.displayMode === 'wireframe';
    const isExploded = opts.displayMode === 'exploded';
    const isPlate2d = opts.displayMode === 'plate2d';
    const tierLift = isExploded ? 0.34 : 0.0;
    const isDatumB = params.datum === 'B';

    const xMin = -1.15;
    const xMax = 1.15;
    const zMin = -0.22;
    const zMax = 0.22;
    const yBase = isDatumB ? 0.14 : 0.02;
    const yShort = yBase + 0.24;
    const yRidgeNom = yBase + 0.54;
    // In Case III (Datum A front), ridge sits on the front wall (zMax).
    // In Case IV (Datum B underside), ridge sits on the back wall (zMin).
    const ridgeZNom = isDatumB ? zMin : zMax;
    const shortZ = isDatumB ? zMax : zMin;

    const visScale = params.exaggeration * 0.0065;
    const nu = 36;

    const ridgePts = [];
    const frontShortPts = [];
    const frontBotPts = [];
    const backBotPts = [];
    for (let iu = 0; iu <= nu; iu++) {
      const u = iu / nu;
      const x = xMin + u * (xMax - xMin);
      const off = P.evalWedgeEdgeOffset(u, params);
      const ry = yRidgeNom + off.dy * visScale;
      const rz = ridgeZNom + off.dz * visScale;
      ridgePts.push(new THREE.Vector3(x, ry, rz));
      frontShortPts.push(new THREE.Vector3(x, yShort, shortZ));
      frontBotPts.push(new THREE.Vector3(x, yBase, ridgeZNom));
      backBotPts.push(new THREE.Vector3(x, yBase, shortZ));
    }

    const bodyMat = isPlate2d
      ? new THREE.MeshBasicMaterial({ color: PAPER_ROAD, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({
          color: PAPER_ROAD,
          roughness: 0.88,
          metalness: 0.03,
          side: THREE.DoubleSide,
          wireframe: isWire,
          transparent: isWire,
          opacity: isWire ? 0.45 : 1.0,
        });
    const datumMat = isPlate2d
      ? new THREE.MeshBasicMaterial({ color: PAPER_SHADE, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({
          color: PAPER_SHADE,
          roughness: 0.9,
          metalness: 0.02,
          side: THREE.DoubleSide,
          wireframe: isWire,
        });

    function buildStripFace(rowA, rowB, mat) {
      const pos = [];
      const idx = [];
      for (let i = 0; i < rowA.length; i++) {
        pos.push(rowA[i].x, rowA[i].y, rowA[i].z);
        pos.push(rowB[i].x, rowB[i].y, rowB[i].z);
      }
      for (let i = 0; i < rowA.length - 1; i++) {
        const a = i * 2;
        idx.push(a, a + 1, a + 3, a, a + 3, a + 2);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      root.add(new THREE.Mesh(g, mat));
    }

    // Tall vertical wall (Datum A in fig_h), sloped top bevel, short wall, underside (Datum B in fig_i)
    buildStripFace(frontBotPts, ridgePts, isDatumB ? bodyMat : datumMat);
    buildStripFace(ridgePts, frontShortPts, bodyMat);
    buildStripFace(frontShortPts, backBotPts, bodyMat);
    buildStripFace(backBotPts, frontBotPts, isDatumB ? datumMat : bodyMat);

    // End caps at u=0 and u=nu
    [0, nu].forEach((endIdx) => {
      addQuad(root, [
        frontBotPts[endIdx],
        ridgePts[endIdx],
        frontShortPts[endIdx],
        backBotPts[endIdx],
      ], PAPER_ROAD, isWire ? 0.25 : 1.0);
    });

    // Crisp Ink Outlines
    addLine(root, ridgePts, INK_DARK);
    addLine(root, frontShortPts, INK_DARK);
    addLine(root, frontBotPts, INK_DARK);
    addLine(root, backBotPts, INK_DARK);
    [0, nu].forEach((i) => {
      addLine(root, [frontBotPts[i], ridgePts[i], frontShortPts[i], backBotPts[i], frontBotPts[i]], INK_DARK);
    });

    // Datum Marker
    if (!isDatumB) {
      // Datum A on front vertical face (Case III)
      const datAnchor = new THREE.Vector3(0.05, yBase + 0.22, ridgeZNom + 0.005);
      addDatumSymbol(root, datAnchor, new THREE.Vector3(0, 0, 1), 'A', isWire);
    } else {
      // Datum B on bottom underside face with leader line (Case IV)
      const datDotPos = new THREE.Vector3(0.32, yBase - 0.004, 0.02);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), new THREE.MeshBasicMaterial({ color: INK_DARK }));
      dot.position.copy(datDotPos);
      root.add(dot);
      const elbow = new THREE.Vector3(0.0, 0.03, 0.45);
      const foot = new THREE.Vector3(-0.35, 0.03, 0.45);
      addLine(root, [datDotPos, elbow, foot], INK_DARK);
      addDatumSymbol(root, new THREE.Vector3(-0.24, 0.03, 0.45), new THREE.Vector3(0, 1, 0), 'B', isWire);
    }

    // Arrowhead Leader & FCF on Ridge Edge
    const fcfSpec = {
      sym: 'straightness',
      tol: formatTolIso(params.toleranceMm),
      capType: 'orientation',
      rel: params.planeRelation,
      datum: params.datum || 'A',
      terminator: 'arrow',
    };
    const arrowIdx = Math.round(nu * 0.28);
    const arrowTarget = ridgePts[arrowIdx].clone();
    addLeaderAndFcf(root, arrowTarget, 0.29 + tierLift * 0.35, fcfSpec, isWire);

    // Parallel Tolerance Zone Planes (t_G)
    const fit = result.fitCtrl || { slope: 0, intercept: 0 };
    const halfZone = 0.5 * params.toleranceMm * visScale;
    const normAxisY = result.normAxis !== 'Z';

    if (opts.showZone) {
      const planeColor = result.pass ? OK_GREEN : VERMILION;
      const spanW = 0.34;
      const p1Pts = [];
      const p2Pts = [];
      const spanMm = 120;

      // Build two parallel planes spaced by t_G around best-fit centerline
      const zoneEps = 0.006;
      for (const sign of [-1, 1]) {
        const corners = [];
        [0, 1].forEach((u) => {
          const x = xMin + u * (xMax - xMin);
          const ctrVal = (fit.slope * (u * spanMm) + fit.intercept) * visScale;
          if (normAxisY) {
            const yVal = yRidgeNom + ctrVal + sign * halfZone + zoneEps + tierLift;
            corners.push(new THREE.Vector3(x, yVal, ridgeZNom - spanW));
            corners.push(new THREE.Vector3(x, yVal, ridgeZNom + spanW));
          } else {
            const zVal = ridgeZNom + ctrVal + sign * halfZone;
            corners.push(new THREE.Vector3(x, yRidgeNom - spanW * 0.7 + zoneEps + tierLift, zVal));
            corners.push(new THREE.Vector3(x, yRidgeNom + spanW * 0.7 + zoneEps + tierLift, zVal));
          }
        });
        // Reorder corners for quad: (u0, -w), (u1, -w), (u1, +w), (u0, +w)
        const quadCorners = [corners[0], corners[2], corners[3], corners[1]];
        addQuad(root, quadCorners, planeColor, 0.16);
        addLine(root, [quadCorners[0], quadCorners[1], quadCorners[2], quadCorners[3], quadCorners[0]], VERMILION, {
          dashed: true,
          dashSize: 0.08,
          gapSize: 0.05,
        });
        if (sign === -1) p1Pts.push(quadCorners[1], quadCorners[2]);
        else p2Pts.push(quadCorners[1], quadCorners[2]);
      }

      // Highlight the deformed ridge line in green (pass) or vermilion/crimson (fail)
      const liftedRidge = ridgePts.map((pt) => new THREE.Vector3(pt.x, pt.y + tierLift + zoneEps, pt.z));
      addLine(root, liftedRidge, result.pass ? OK_GREEN : FAIL_RED);

      // Mark excursion peaks if failing
      if (!result.pass && result.stations) {
        result.stations.forEach((st, idx) => {
          if (st.outOfTol && idx % 3 === 0) {
            const marker = new THREE.Mesh(
              new THREE.SphereGeometry(0.026, 10, 10),
              new THREE.MeshBasicMaterial({ color: FAIL_RED })
            );
            marker.position.copy(liftedRidge[Math.min(liftedRidge.length - 1, Math.round(st.sFrac * nu))]);
            root.add(marker);
          }
        });
      }

      // Right-angle or Parallel symbol tag next to zone planes
      const tagText = normAxisY ? (isDatumB ? '// B · t_G' : '⊥ A · t_G') : (isDatumB ? '⊥ B · t_G' : '// A · t_G');
      const spr = makeTextTagSprite(tagText, result.pass ? '#047857' : '#d94426');
      if (spr) {
        spr.position.set(xMax + 0.25, yRidgeNom + tierLift, ridgeZNom);
        groupAddSafe(root, spr);
      }

      // Animated stylus probe gliding along the sharp edge
      const probe = new THREE.Mesh(
        new THREE.SphereGeometry(0.030, 12, 12),
        new THREE.MeshBasicMaterial({ color: VERMILION })
      );
      root.add(probe);
      animTargets.push({
        type: 'probe_edge',
        mesh: probe,
        pts: liftedRidge,
        phase: 0.1,
        speed: 0.25,
      });
    }

    // 9. Active Cross-Section Slice Plane Frame (Orientation Planes)
    if (opts.showPlanes) {
      const fAct = params.sliceFrac;
      const xP = xMin + fAct * (xMax - xMin);
      const sY0 = yBase - 0.08;
      const sY1 = yRidgeNom + 0.28 + tierLift;
      addQuad(root, [
        new THREE.Vector3(xP, sY0, zMin - 0.18),
        new THREE.Vector3(xP, sY0, zMax + 0.18),
        new THREE.Vector3(xP, sY1, zMax + 0.18),
        new THREE.Vector3(xP, sY1, zMin - 0.18),
      ], AMBER_WARM, 0.10);
      addLine(root, [
        new THREE.Vector3(xP, sY0, zMin - 0.18),
        new THREE.Vector3(xP, sY0, zMax + 0.18),
        new THREE.Vector3(xP, sY1, zMax + 0.18),
        new THREE.Vector3(xP, sY1, zMin - 0.18),
        new THREE.Vector3(xP, sY0, zMin - 0.18),
      ], AMBER_WARM, { opacity: 0.85 });
    }
  }

  function groupAddSafe(group, child) {
    if (child) group.add(child);
  }

  // --------------------------------------------------------------------------
  // Plate Geometry Builder (Figs. f, g, h, i)
  // --------------------------------------------------------------------------
  function buildFigureGeometry(figId, params, opts, animTargets) {
    const root = new THREE.Group();
    const isWire = opts.displayMode === 'wireframe';

    // Base parchment plate slab (identical 1967 plate style to road-intersections)
    const plateW = 3.2;
    const plateD = 2.4;
    const baseGeo = new THREE.BoxGeometry(plateW, 0.05, plateD);
    const baseMat = new THREE.MeshStandardMaterial({ color: PAPER_CARD, roughness: 0.92, wireframe: isWire });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.025;
    base.userData.isPlate = true;
    root.add(base);

    const baseEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(baseGeo),
      new THREE.LineBasicMaterial({ color: INK_DARK, transparent: true, opacity: 0.45 })
    );
    baseEdges.position.y = -0.025;
    baseEdges.userData.isPlate = true;
    root.add(baseEdges);

    // Subtle survey grid lines on top of the parchment plate
    const gridColor = 0x181715;
    for (let gx = -1.2; gx <= 1.21; gx += 0.4) {
      addLine(root, [new THREE.Vector3(gx, 0.002, -plateD * 0.48), new THREE.Vector3(gx, 0.002, plateD * 0.48)], gridColor, { opacity: 0.08 });
    }
    for (let gz = -0.8; gz <= 0.81; gz += 0.4) {
      addLine(root, [new THREE.Vector3(-plateW * 0.48, 0.002, gz), new THREE.Vector3(plateW * 0.48, 0.002, gz)], gridColor, { opacity: 0.08 });
    }

    const result = P.solveTolerance(params);
    if (result.partFamily === 'chamfer_block') {
      buildChamferBlock(root, result.params, result, opts, animTargets);
    } else {
      buildWedgeBlade(root, result.params, result, opts, animTargets);
    }

    return { root, stats: result };
  }

  // --------------------------------------------------------------------------
  // Scene Manager
  // --------------------------------------------------------------------------
  class StraightnessSceneManager {
    constructor(container, onCalloutProject, onPickFigure) {
      this.container = container;
      this.onCalloutProject = onCalloutProject;
      this.onPickFigure = onPickFigure;

      this.paused = false;
      this.displayMode = 'solid3d'; // 'solid3d' | 'exploded' | 'plate2d' | 'wireframe'
      this.showZone = true;
      this.showPlanes = true;
      this.activeCallouts = [];
      this.overviewAnchors = new Map();
      this.animTargets = [];
      this.pickables = [];
      this.flyAnim = null;
      this.clock = 0;

      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(container.clientWidth || 800, container.clientHeight || 500);
      if (THREE.sRGBEncoding) this.renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(this.renderer.domElement);

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(PAPER_BG);

      const initW = container.clientWidth || 800;
      const initH = container.clientHeight || 500;
      const aspect = initW / initH;
      this.perspCamera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
      this.perspCamera.position.set(0.0, 7.1, 6.9);
      this.orthoCamera = new THREE.OrthographicCamera(-2.4 * aspect, 2.4 * aspect, 2.4, -2.4, -30, 100);
      this.orthoCamera.position.copy(this.perspCamera.position);
      this.camera = this.perspCamera;
      this.lastPartFamily = 'chamfer_block';

      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.minDistance = 1.6;
      this.controls.maxDistance = 18;
      this.controls.maxPolarAngle = Math.PI * 0.49;

      this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      this.dirLight = new THREE.DirectionalLight(0xfffaf0, 0.55);
      this.dirLight.position.set(4, 9, 6);
      this.fillLight = new THREE.DirectionalLight(0xefe6d3, 0.25);
      this.fillLight.position.set(-5, 3, -4);
      this.scene.add(this.ambientLight, this.dirLight, this.fillLight);

      this.worldGroup = new THREE.Group();
      this.scene.add(this.worldGroup);

      this.raycaster = new THREE.Raycaster();
      this.pointerDownPos = { x: 0, y: 0 };

      this.renderer.domElement.addEventListener('pointerdown', (e) => {
        this.pointerDownPos = { x: e.clientX, y: e.clientY };
      });
      this.renderer.domElement.addEventListener('pointerup', (e) => {
        if (Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y) > 6) return;
        this.handleClick(e);
      });

      this._resizeHandler = () => this.resize();
      window.addEventListener('resize', this._resizeHandler);
    }

    syncCameraProjection() {
      const wantOrtho = this.displayMode === 'plate2d';
      const targetCam = wantOrtho ? this.orthoCamera : this.perspCamera;
      if (this.camera !== targetCam) {
        targetCam.position.copy(this.camera.position);
        targetCam.quaternion.copy(this.camera.quaternion);
        this.camera = targetCam;
        this.controls.object = this.camera;
      }
      this.updateCameraFrustum();
    }

    updateCameraFrustum() {
      const w = Math.max(10, this.container.clientWidth);
      const h = Math.max(10, this.container.clientHeight);
      const aspect = w / h;
      this.perspCamera.aspect = aspect;
      this.perspCamera.updateProjectionMatrix();

      const dist = Math.max(1.5, this.camera.position.distanceTo(this.controls.target));
      const halfH = Math.tan(THREE.MathUtils.degToRad(38 * 0.5)) * dist;
      this.orthoCamera.left = -halfH * aspect;
      this.orthoCamera.right = halfH * aspect;
      this.orthoCamera.top = halfH;
      this.orthoCamera.bottom = -halfH;
      this.orthoCamera.updateProjectionMatrix();
    }

    resize() {
      const w = Math.max(10, this.container.clientWidth);
      const h = Math.max(10, this.container.clientHeight);
      this.updateCameraFrustum();
      this.renderer.setSize(w, h);
    }

    showOverview(figures, overviewIds, variantMode) {
      this.syncCameraProjection();
      clearGroup(this.worldGroup);
      this.animTargets = [];
      this.pickables = [];
      this.overviewAnchors.clear();
      this.lastPartFamily = 'overview';

      // 2 x 2 Museum Plate Gallery Floor
      const dx = 3.55;
      const dz = 2.85;
      overviewIds.forEach((fid, idx) => {
        const fig = figures[fid];
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const px = (col - 0.5) * dx;
        const pz = (row - 0.5) * dz;
        const params = variantMode === 'nominal' ? fig.nominalParams : fig.errorParams;

        const { root } = buildFigureGeometry(
          fid,
          params,
          { displayMode: this.displayMode, showZone: this.showZone, showPlanes: this.showPlanes },
          this.animTargets
        );
        root.position.set(px, 0, pz);
        this.worldGroup.add(root);
        this.overviewAnchors.set(fid, [px, 0.04, pz + 1.06]);

        const hitMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(3.2, 2.4),
          new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
        );
        hitMesh.rotation.x = -Math.PI / 2;
        hitMesh.position.set(px, 0.08, pz);
        hitMesh.userData.figId = fid;
        this.worldGroup.add(hitMesh);
        this.pickables.push(hitMesh);
      });
    }

    showSingle(figId, params) {
      this.syncCameraProjection();
      clearGroup(this.worldGroup);
      this.animTargets = [];
      this.pickables = [];
      this.overviewAnchors.clear();

      const { root, stats } = buildFigureGeometry(
        figId,
        params,
        { displayMode: this.displayMode, showZone: this.showZone, showPlanes: this.showPlanes },
        this.animTargets
      );
      this.lastStats = stats;
      this.lastPartFamily = stats.partFamily;
      this.worldGroup.add(root);
    }

    setCallouts(callouts) {
      this.activeCallouts = callouts || [];
    }

    flyTo(pos, target, durationMs = 650) {
      this.flyAnim = {
        startPos: this.camera.position.clone(),
        startTarget: this.controls.target.clone(),
        endPos: new THREE.Vector3(...pos),
        endTarget: new THREE.Vector3(...target),
        elapsed: 0,
        duration: Math.max(0.1, durationMs / 1000),
      };
    }

    handleClick(e) {
      if (this.pickables.length === 0 || !this.onPickFigure) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(ndc, this.camera);
      const hits = this.raycaster.intersectObjects(this.pickables, false);
      if (hits.length > 0 && hits[0].object.userData.figId) {
        this.onPickFigure(hits[0].object.userData.figId);
      }
    }

    stepAndRender(dt) {
      if (this.flyAnim) {
        this.flyAnim.elapsed += dt;
        const t = Math.min(1, this.flyAnim.elapsed / this.flyAnim.duration);
        const ease = 1 - Math.pow(1 - t, 3);
        this.camera.position.lerpVectors(this.flyAnim.startPos, this.flyAnim.endPos, ease);
        this.controls.target.lerpVectors(this.flyAnim.startTarget, this.flyAnim.endTarget, ease);
        if (t >= 1) this.flyAnim = null;
      }

      if (!this.paused) this.clock += dt;

      // Update animated CMM probe styluses along active curves
      for (const item of this.animTargets) {
        if (!item.pts || item.pts.length < 2) continue;
        const u = ((this.clock * item.speed + item.phase) % 1.0);
        // Back-and-forth smooth cosine sweep
        const pingPong = 0.5 - 0.5 * Math.cos(u * Math.PI * 2);
        const fIdx = pingPong * (item.pts.length - 1);
        const i0 = Math.floor(fIdx);
        const i1 = Math.min(item.pts.length - 1, i0 + 1);
        const frac = fIdx - i0;
        item.mesh.position.lerpVectors(item.pts[i0], item.pts[i1], frac);
      }

      this.controls.update();
      if (this.camera === this.orthoCamera) {
        this.updateCameraFrustum();
      }
      this.renderer.render(this.scene, this.camera);

      if (this.onCalloutProject && this.activeCallouts.length > 0) {
        const w = this.container.clientWidth || 800;
        const h = this.container.clientHeight || 500;
        const tmpV = new THREE.Vector3();
        const tierLift = this.displayMode === 'exploded'
          ? (this.lastPartFamily === 'wedge_blade' ? 0.34 : 0.36)
          : 0.0;

        const projected = this.activeCallouts.map((c) => {
          const ov = this.overviewAnchors.get(c.id);
          if (ov) {
            tmpV.set(ov[0], ov[1], ov[2]);
          } else {
            const lift = tierLift * (c.explodeFactor ?? 0);
            tmpV.set(c.anchor[0], c.anchor[1] + lift, c.anchor[2]);
          }
          tmpV.project(this.camera);
          return {
            id: c.id,
            x: (tmpV.x * 0.5 + 0.5) * w,
            y: (-tmpV.y * 0.5 + 0.5) * h,
            visible: tmpV.z > -1 && tmpV.z < 1,
          };
        });
        this.onCalloutProject(projected);
      }
    }
  }

  global.ISO_SCENE3D = {
    StraightnessSceneManager,
    buildFigureGeometry,
  };
})(window);
