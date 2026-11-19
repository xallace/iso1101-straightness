/* ==========================================================================
   data.js — Curated Engineering Cases for DIN EN ISO 1101:2017 Straightness
             with Intersection ⟨[...|...] & Orientation ⟨[...]⟩ Plane Indicators
             Full bilingual EN / DE catalog & Feature Control Frame SVG renderer.
   ========================================================================== */
(function (global) {
  'use strict';

  const FIGURE_ORDER = ['fig_f', 'fig_g', 'fig_h', 'fig_i'];
  const OVERVIEW_IDS = ['fig_f', 'fig_g', 'fig_h', 'fig_i'];

  const UI_TEXT = {
    en: {
      brandTitle: 'STRAIGHTNESS LAB',
      brandSub: 'ISO 1101 Plane Indicators',
      sourceRef: 'DIN EN ISO 1101:2017 · Intersection & Orientation Plane Indicators',
      tabAtlas: '3D Plate Atlas & Tour',
      tabLab: 'Parametric Tolerance Lab',
      tabConcepts: 'Laws & Engineering Notes',
      tabReading: 'Standards & Reading',
      btnTour: 'Guided Tour',
      btnPlay: 'Probe',
      btnOverview: 'Overview (4 Plates)',
      stateNominal: 'a · Nominal Ideal',
      stateError: 'b · Exaggerated Error',
      modeSolid: '3D Book Plate',
      modeExploded: 'Section & Zone',
      modePlate2d: 'Ortho Top/End',
      modeWireframe: 'Ink Wireframe',
      togCallouts: 'Call-Outs',
      togZone: 'Tolerance Zone',
      togPlanes: 'Cut Planes',
      btnResetCam: 'Reset Cam',
      camIso: '3D Perspective',
      camTop: 'Plan View',
      camFront: 'Front / Datum A',
      camEnd: 'End Section (t_G)',
      legendSurface: 'Tolerated Line',
      legendCut: 'Plane Indicator',
      legendZone: 't_G Zone',
      legendFail: 'Out of Tol',
      legendDatum: 'Datum A/B',
      overviewCode: 'PLATES I–IV · OVERVIEW',
      overviewTitle: 'Straightness Plane Indicators',
      overviewCat: 'ISO 1101:2017',
      overviewSummary:
        'Click any 3D plate in the gallery or select Plates I–IV above to inspect how Intersection Plane Indicators (// A, ⊥ A) and Orientation Plane Indicators (⟨[...]⟩) remove spatial ambiguity on 3D CAD surfaces and edges.',
      overviewQuoteTag: 'ISO 1101 Design Principle',
      overviewQuote:
        'A straightness callout on a 3D surface or edge needs a plane indicator whenever projection-plane conventions would be ambiguous or accidentally impose full 3D flatness across every diagonal.',
      listHeadingOverview: 'All 4 Plane Indicator Cases (Plates I–IV)',
      listHeadingSingle: 'Active Plate Call-Outs',
      snapshotHeading: 'Computed ISO 1101 Snapshot',
      ctaOpenLab: 'Open & Simulate in Tolerance Lab →',
      labKicker: 'INTERACTIVE ISO 1101 SANDBOX',
      labTitle: 'Parametric Tolerance Lab',
      btnResetLab: 'Reset',
      groupIndicator: 'ISO 1101 Indicator & Tolerance',
      labelIndType: 'Indicator',
      indIntersection: 'Intersection ⟨[...]',
      indOrientation: 'Orientation ⟨[...]⟩',
      labelRelation: 'Plane',
      relParallel: '// Parallel',
      relPerp: '⊥ Perp',
      labelDatum: 'Datum',
      datA: 'A (Front)',
      datB: 'B (Base)',
      groupDeform: 'Manufacturing Form Deviation',
      conceptsKicker: 'GEOMETRIC PRODUCT SPECIFICATION (ISO 1101:2017)',
      conceptsTitle: 'Straightness Laws & Engineering Notes',
      conceptsIntro:
        'Minimum-zone Chebyshev straightness, intersection-plane slicing versus orientation-plane rotational locking, and why directional line tolerances differ fundamentally from flatness.',
      lawsHeading: 'Mathematical & Geometric Laws',
      bookHeaderLeft: 'ISO GPS · FORM TOLERANCING',
      bookHeaderRight: 'ISO 1101:2017 · PLATES I–IV',
      bookTitle: 'DIRECTIONAL STRAIGHTNESS IN 3D MBD',
      bookNote: 'Summary notes with direct jump links to each 3D plate model.',
      readingKicker: 'NORMATIVE & TEXTBOOK REFERENCES',
      readingTitle: 'Standards & Further Reading',
      readingIntro:
        'ISO GPS standards governing intersection and orientation plane indicators alongside authoritative European and ASME geometric tolerancing literature.',
      readingCol1: 'ISO GPS & Companion Standards',
      readingCol2: 'Textbooks & Engineering References',
      tryInLab: 'Simulate in Tolerance Lab →',
      showIn3d: 'Inspect in 3D →',
      kpiStraight: 'Max Straightness',
      kpiFlatness: 'Flatness',
      kpiStatus: 'Zone Status',
      kpiSlice: 'Active Slice e(s)',
      kpiSliceEdge: 'Local Band 2|r(s)|',
      kpiOrtho: 'Unconstrained Dir.',
      overviewOpt: 'Overview — All 4 Plates',
      passWord: 'PASS',
      failWord: 'FAIL',
      prevStop: '← Prev',
      nextStop: 'Next →',
      autoPlay: '▶ Auto',
      pausePlay: '⏸ Pause',
      finishTour: 'Open in Lab →',
      titlePrevFig: 'Previous Plate',
      titleNextFig: 'Next Plate',
      titleSelectFig: 'Select Plate Case (I–IV)',
      titleDisplayMode: '3D Display Layering',
      titlePlayPause: 'Pause or resume probe sweep animation (Space)',
    },
    de: {
      brandTitle: 'GERADHEITSLABOR',
      brandSub: 'ISO 1101 Ebenenindikatoren',
      sourceRef: 'DIN EN ISO 1101:2017 · Schnitt- & Orientierungsebenenindikatoren',
      tabAtlas: '3D-Tafelatlas & Führung',
      tabLab: 'Parametrisches Toleranzlabor',
      tabConcepts: 'Grundlagen & Fachnotizen',
      tabReading: 'Normen & Literatur',
      btnTour: 'Führung starten',
      btnPlay: 'Taster',
      btnOverview: 'Übersicht (4 Tafeln)',
      stateNominal: 'a · Soll-Geometrie',
      stateError: 'b · Überhöhte Formabweichung',
      modeSolid: '3D-Buchtafel',
      modeExploded: 'Schnitt & Zone',
      modePlate2d: 'Drauf-/Seitenansicht',
      modeWireframe: 'Tusche-Drahtgitter',
      togCallouts: 'Hinweise',
      togZone: 'Toleranzzone',
      togPlanes: 'Schnittebenen',
      btnResetCam: 'Kamera Reset',
      camIso: '3D-Perspektive',
      camTop: 'Draufsicht',
      camFront: 'Front / Bezug A',
      camEnd: 'Querschnitt (t_G)',
      legendSurface: 'Toleriertes Element',
      legendCut: 'Ebenenindikator',
      legendZone: 't_G-Zone',
      legendFail: 'Außer Tol.',
      legendDatum: 'Bezug A/B',
      overviewCode: 'TAFELN I–IV · ÜBERSICHT',
      overviewTitle: 'Geradheit mit Ebenenindikatoren',
      overviewCat: 'ISO 1101:2017',
      overviewSummary:
        'Klicke eine 3D-Tafel an oder wähle Tafel I–IV oben aus, um den Unterschied zwischen Schnittebenenindikator (// A, ⊥ A) und Orientierungsebenenindikator (⟨[...]⟩) am 3D-Modell zu prüfen.',
      overviewQuoteTag: 'ISO-1101-Grundprinzip',
      overviewQuote:
        'Verlangt die Bauteilfunktion nur gerade Einzellinien in einer bestimmten Richtung statt Ebenheit der gesamten Fläche, legt der Indikator die Schnittebene bzw. Zonenorientierung eindeutig im 3D-Raum fest.',
      listHeadingOverview: 'Alle 4 Indikator-Fälle (Tafeln I–IV)',
      listHeadingSingle: 'Aktive Konstruktionshinweise',
      snapshotHeading: 'Berechneter ISO-1101-Befund',
      ctaOpenLab: 'Im Toleranzlabor simulieren →',
      labKicker: 'INTERAKTIVE ISO-1101-SIMULATION',
      labTitle: 'Parametrisches Toleranzlabor',
      btnResetLab: 'Zurücksetzen',
      groupIndicator: 'ISO-1101-Indikator & Toleranz',
      labelIndType: 'Indikator',
      indIntersection: 'Schnittebene ⟨[...]',
      indOrientation: 'Orientierung ⟨[...]⟩',
      labelRelation: 'Ebene',
      relParallel: '// Parallel',
      relPerp: '⊥ Rechtwinklig',
      labelDatum: 'Bezug',
      datA: 'A (Vorn)',
      datB: 'B (Boden)',
      groupDeform: 'Geometrische Formabweichung',
      conceptsKicker: 'GEOMETRISCHE PRODUKTSPEZIFIKATION (ISO 1101:2017)',
      conceptsTitle: 'Geradheitsgesetze & Fachnotizen',
      conceptsIntro:
        'Tschebyscheff-Geradheit (Minimum-Zone), Schnitt- versus Orientierungsebenenindikator und warum Linientoleranzen mit Ebenenbezug keine Ebenheit fordern.',
      lawsHeading: 'Mathematische & geometrische Regeln',
      bookHeaderLeft: 'ISO GPS · FORMTOLERIERUNG',
      bookHeaderRight: 'ISO 1101:2017 · TAFELN I–IV',
      bookTitle: 'GERICHTETE GERADHEIT IM 3D-MODELL',
      bookNote: 'Kompakte Übersicht mit direktem Sprung zum jeweiligen 3D-Tafelmodell.',
      readingKicker: 'NORMEN & FACHLITERATUR',
      readingTitle: 'Normen & weiterführende Literatur',
      readingIntro:
        'Relevante ISO-GPS-Normen zu Schnitt- und Orientierungsebenenindikatoren sowie Standardwerke der Form- und Lagetolerierung.',
      readingCol1: 'ISO-GPS- & Bezugsnormen',
      readingCol2: 'Fachbücher & Vergleiche',
      tryInLab: 'Im Toleranzlabor testen →',
      showIn3d: 'In 3D ansehen →',
      kpiStraight: 'Max. Geradheit',
      kpiFlatness: 'Ebenheit',
      kpiStatus: 'Zonenbefund',
      kpiSlice: 'Aktiver Schnitt e(s)',
      kpiSliceEdge: 'Lokalband 2|r(s)|',
      kpiOrtho: 'Freie Richtung',
      overviewOpt: 'Übersicht — Alle 4 Tafeln',
      passWord: 'IO (PASS)',
      failWord: 'NIO (FAIL)',
      prevStop: '← Zurück',
      nextStop: 'Weiter →',
      autoPlay: '▶ Auto',
      pausePlay: '⏸ Pause',
      finishTour: 'Im Labor öffnen →',
      titlePrevFig: 'Vorherige Tafel',
      titleNextFig: 'Nächste Tafel',
      titleSelectFig: 'Tafelfall wählen (I–IV)',
      titleDisplayMode: '3D-Darstellungsmodus',
      titlePlayPause: 'Tastbewegung pausieren oder fortsetzen (Leertaste)',
    },
  };

  const FIGURES = {
    fig_f: {
      id: 'fig_f',
      code: 'PLATE I',
      codeDe: 'TAFEL I',
      plate: 'Plate I · // A',
      plateDe: 'Tafel I · // A',
      relTag: '// A',
      fcf: { sym: 'straightness', tol: '0,05', capType: 'intersection', rel: 'parallel', datum: 'A', terminator: 'dot' },
      en: {
        name: 'Intersection Plane Parallel to Datum A',
        subtitle: 'Single-Wedge ⟨[ // | A ] · Longitudinal Surface Lines',
        category: 'Intersection Plane',
        summary:
          'Applies a 0.05 mm straightness tolerance to every individual line extracted by intersecting the top surface with cutting planes parallel to front Datum A.',
        bookNote:
          'Ideal when function only requires straight travel tracks along one axis—such as a linear roller guide bed—avoiding tight full-surface flatness tolerances.',
        bookPage: 'Plate I · Case // A',
        callouts: [
          {
            id: 'ff_dot',
            title: 'Surface Leader Dot (•)',
            badge: '3D Face Target',
            anchor: [-0.32, 0.52, 0.0],
            explodeFactor: 0,
            body: 'In ISO 1101 / 3D MBD, a filled dot ending on the face (rather than an arrow on an edge) identifies the entire planar surface from which line elements are cut.',
          },
          {
            id: 'ff_cap',
            title: 'Intersection Cap ⟨[ // | A ]',
            badge: 'Single Left Wedge',
            anchor: [0.68, 0.84, 0.0],
            explodeFactor: 0.45,
            body: 'One left-pointing triangular cap denotes an Intersection Plane Indicator. All cutting planes are oriented parallel to Datum A.',
          },
          {
            id: 'ff_lines',
            title: 'Longitudinal Dashed Elements',
            badge: 'Parallel to A',
            anchor: [-0.75, 0.51, -0.22],
            explodeFactor: 1.0,
            body: 'Only lines running lengthwise along A must stay straight within 0.05 mm. Transverse cupping across the width is unconstrained!',
          },
          {
            id: 'ff_datum',
            title: 'Datum A Front Face',
            badge: 'Reference Plane',
            anchor: [-0.35, 0.22, 0.46],
            explodeFactor: 0,
            body: 'Front vertical face established as Datum A aligns the family of parallel inspection planes.',
          },
        ],
      },
      de: {
        name: 'Schnittebenenindikator parallel zu Bezug A',
        subtitle: 'Einfachspitze ⟨[ // | A ] · Längslinien der Deckfläche',
        category: 'Schnittebene',
        summary:
          'Toleriert die Geradheit (0,05 mm) jeder einzelnen Linie, die durch Schnittebenen parallel zum vorderen Bezug A aus der oberen Fläche geschnitten wird.',
        bookNote:
          'Sinnvoll, wenn die Funktion nur gerade Einzellinien in einer Richtung verlangt – etwa auf dem Laufbett einer Linearführung –, ohne enge Ebenheit der gesamten Fläche zu fordern.',
        bookPage: 'Tafel I · Fall // A',
        callouts: [
          {
            id: 'ff_dot',
            title: 'Flächenpunkt am Pfeilende (•)',
            badge: '3D-Flächenbezug',
            anchor: [-0.32, 0.52, 0.0],
            explodeFactor: 0,
            body: 'Der ausgefüllte Punkt direkt auf der Fläche zeigt im 3D-Modell an, dass Linien auf dieser Fläche durch Schnittebenen definiert werden.',
          },
          {
            id: 'ff_cap',
            title: 'Schnittebenenindikator ⟨[ // | A ]',
            badge: 'Linke Spitze',
            anchor: [0.68, 0.84, 0.0],
            explodeFactor: 0.45,
            body: 'Das linksseitig zugespitzte Kästchen kennzeichnet die Schnittebene: alle Schnitte erfolgen parallel zur Bezugsebene A.',
          },
          {
            id: 'ff_lines',
            title: 'Tolerierte Längslinien',
            badge: 'Parallel zu A',
            anchor: [-0.75, 0.51, -0.22],
            explodeFactor: 1.0,
            body: 'Nur Linien in Längsrichtung parallel zu A müssen innerhalb 0,05 mm gerade sein. Eine Querwölbung der Fläche bleibt frei!',
          },
          {
            id: 'ff_datum',
            title: 'Bezugsfläche A (Vorderseite)',
            badge: 'Bezugsebene',
            anchor: [-0.35, 0.22, 0.46],
            explodeFactor: 0,
            body: 'Die vordere Vertikalfläche A legt die Ausrichtung der parallelen Schnittebenen fest.',
          },
        ],
      },
      nominalParams: {
        indicatorType: 'intersection',
        planeRelation: 'parallel',
        datum: 'A',
        toleranceMm: 0.05,
        bowLong: 0.0,
        bowTrans: 0.0,
        twist: 0.0,
        harmonics: 1,
        sliceFrac: 0.5,
        exaggeration: 240,
      },
      errorParams: {
        indicatorType: 'intersection',
        planeRelation: 'parallel',
        datum: 'A',
        toleranceMm: 0.05,
        bowLong: 0.012,
        bowTrans: 0.072,
        twist: 0.0,
        harmonics: 1,
        sliceFrac: 0.5,
        exaggeration: 240,
      },
      cameraFocus: { pos: [2.55, 2.05, 2.70], target: [0.0, 0.25, 0.0] },
    },

    fig_g: {
      id: 'fig_g',
      code: 'PLATE II',
      codeDe: 'TAFEL II',
      plate: 'Plate II · ⊥ A',
      plateDe: 'Tafel II · ⊥ A',
      relTag: '⊥ A',
      fcf: { sym: 'straightness', tol: '0,05', capType: 'intersection', rel: 'perp', datum: 'A', terminator: 'dot' },
      en: {
        name: 'Intersection Plane Perpendicular to Datum A',
        subtitle: 'Single-Wedge ⟨[ ⊥ | A ] · Transverse Cross-Sections',
        category: 'Intersection Plane',
        summary:
          'Applies a 0.05 mm straightness tolerance to every transverse line obtained by slicing the top surface perpendicular to front Datum A.',
        bookNote:
          'Typical for extruded mounting channels or seal seating rails: every transverse cross-section ⊥ A must stay straight within 0.05 mm, regardless of longitudinal camber along the bar.',
        bookPage: 'Plate II · Case ⊥ A',
        callouts: [
          {
            id: 'fg_dot',
            title: 'Surface Leader Dot (•)',
            badge: '3D Face Target',
            anchor: [-0.32, 0.52, 0.0],
            explodeFactor: 0,
            body: 'Leader ends in a filled dot on the top face, pairing with the intersection plane box to define transverse surface slices.',
          },
          {
            id: 'fg_cap',
            title: 'Intersection Cap ⟨[ ⊥ | A ]',
            badge: 'Perpendicular Cuts',
            anchor: [0.68, 0.84, 0.0],
            explodeFactor: 0.45,
            body: 'Cutting planes stand at 90° to Datum A, slicing across the width of the chamfered block.',
          },
          {
            id: 'fg_lines',
            title: 'Transverse Dashed Elements',
            badge: 'Cross-Section ⊥ A',
            anchor: [-0.45, 0.52, 0.16],
            explodeFactor: 1.0,
            body: 'Even if the bar bows lengthwise along its span, every transverse slice remains straight and passes within 0.05 mm!',
          },
          {
            id: 'fg_datum',
            title: 'Datum A Front Face',
            badge: 'Reference Plane',
            anchor: [-0.35, 0.22, 0.46],
            explodeFactor: 0,
            body: 'Normal to front face A defines the direction of the transverse cutting planes.',
          },
        ],
      },
      de: {
        name: 'Schnittebenenindikator rechtwinklig zu Bezug A',
        subtitle: 'Einfachspitze ⟨[ ⊥ | A ] · Querschnittslinien',
        category: 'Schnittebene',
        summary:
          'Toleriert die Geradheit (0,05 mm) jeder einzelnen Querlinie, die durch Schnittebenen rechtwinklig zu Bezug A aus der Deckfläche geschnitten wird.',
        bookNote:
          'Typisch für stranggepresste Schienen oder Dichtungsauflagen: Jeder beliebige Profilquerschnitt rechtwinklig zu A muss innerhalb 0,05 mm gerade sein – unabhängig von einer Krümmung in Längsrichtung.',
        bookPage: 'Tafel II · Fall ⊥ A',
        callouts: [
          {
            id: 'fg_dot',
            title: 'Flächenpunkt am Pfeilende (•)',
            badge: '3D-Flächenbezug',
            anchor: [-0.32, 0.52, 0.0],
            explodeFactor: 0,
            body: 'Der Punkt auf der oberen Fläche zeigt an, dass aus dieser Fläche Schnittlinien extrahiert werden.',
          },
          {
            id: 'fg_cap',
            title: 'Schnittebenenindikator ⟨[ ⊥ | A ]',
            badge: 'Querschnitte ⊥ A',
            anchor: [0.68, 0.84, 0.0],
            explodeFactor: 0.45,
            body: 'Die Schnittebenen stehen rechtwinklig (90°) auf der vorderen Bezugsfläche A.',
          },
          {
            id: 'fg_lines',
            title: 'Tolerierte Querlinien',
            badge: 'Profilquerschnitt',
            anchor: [-0.45, 0.52, 0.16],
            explodeFactor: 1.0,
            body: 'Selbst bei starker Längsdurchbiegung bleibt jeder Querschnitt ⊥ A gerade – die Spezifikation wird erfüllt!',
          },
          {
            id: 'fg_datum',
            title: 'Bezugsfläche A (Vorderseite)',
            badge: 'Bezugsebene',
            anchor: [-0.35, 0.22, 0.46],
            explodeFactor: 0,
            body: 'Die Bezugsebene A definiert die Flächennormale für alle orthogonalen Schnitte.',
          },
        ],
      },
      nominalParams: {
        indicatorType: 'intersection',
        planeRelation: 'perp',
        datum: 'A',
        toleranceMm: 0.05,
        bowLong: 0.0,
        bowTrans: 0.0,
        twist: 0.0,
        harmonics: 1,
        sliceFrac: 0.5,
        exaggeration: 240,
      },
      errorParams: {
        indicatorType: 'intersection',
        planeRelation: 'perp',
        datum: 'A',
        toleranceMm: 0.05,
        bowLong: 0.072,
        bowTrans: 0.010,
        twist: 0.0,
        harmonics: 1,
        sliceFrac: 0.5,
        exaggeration: 240,
      },
      cameraFocus: { pos: [2.55, 2.05, 2.70], target: [0.0, 0.25, 0.0] },
    },

    fig_h: {
      id: 'fig_h',
      code: 'PLATE III',
      codeDe: 'TAFEL III',
      plate: 'Plate III · ⊥ A',
      plateDe: 'Tafel III · ⊥ A',
      relTag: '⊥ A',
      fcf: { sym: 'straightness', tol: '0,02', capType: 'orientation', rel: 'perp', datum: 'A', terminator: 'arrow' },
      en: {
        name: 'Orientation Plane Perpendicular to Datum A',
        subtitle: 'Double-Wedge ⟨[ ⊥ | A ]⟩ · Two Parallel Planes ⊥ A',
        category: 'Orientation Plane',
        summary:
          'Applies a 0.02 mm straightness zone to the sharp ridge edge. The double-wedge Orientation Plane Indicator fixes the pair of parallel boundary planes perpendicular to Datum A.',
        bookNote:
          'Without an orientation plane indicator in 3D MBD, a pair of parallel planes containing a 1D line would rotate freely around it. Specifying ⊥ A locks the roll orientation while keeping straightness pitch tilt free (note: ISO 1101:2017 §14 formally defines orientation planes for median lines, extended here to a 1D knife-edge illustration).',
        bookPage: 'Plate III · Case ⊥ A',
        callouts: [
          {
            id: 'fh_arrow',
            title: 'Edge Arrowhead (▼)',
            badge: '1D Edge Feature',
            anchor: [-0.51, 0.57, 0.24],
            explodeFactor: 0,
            body: 'Unlike Plates I & II, the leader ends in a sharp arrowhead touching the top ridge edge—tolerating that 1D line directly.',
          },
          {
            id: 'fh_cap',
            title: 'Orientation Cap ⟨[ ⊥ | A ]⟩',
            badge: 'Double Wedge',
            anchor: [0.50, 0.86, 0.24],
            explodeFactor: 0.35,
            body: 'Pointed caps on BOTH sides signify an Orientation Plane Indicator: the two parallel planes t_G apart are oriented ⊥ to A.',
          },
          {
            id: 'fh_zone',
            title: 'Parallel Planes t_G = 0.02 mm',
            badge: '90° to Datum A',
            anchor: [0.68, 0.57, 0.24],
            explodeFactor: 1.0,
            body: 'Vertical edge height waviness along A is constrained within 0.02 mm, while sideways sway normal to A stays between the planes.',
          },
          {
            id: 'fh_datum',
            title: 'Datum A Front Face',
            badge: 'Orientation Reference',
            anchor: [0.05, 0.24, 0.24],
            explodeFactor: 0,
            body: 'Front face A fixes the 90° roll orientation of the tolerance-zone planes (note the right-angle symbol in the end section).',
          },
        ],
      },
      de: {
        name: 'Orientierungsebenenindikator rechtwinklig zu A',
        subtitle: 'Doppelspitze ⟨[ ⊥ | A ]⟩ · Parallele Ebenen ⊥ A',
        category: 'Orientierung',
        summary:
          'Begrenzt die Geradheit der oberen Prismenkante auf 0,02 mm zwischen zwei parallelen Ebenen, deren Lage durch die Doppelspitze rechtwinklig zu Bezug A fixiert wird.',
        bookNote:
          'Im 3D-Modell fehlt eine eindeutige Zeichenebene. Der Orientierungsebenenindikator fixiert die Rollrichtung der beiden parallelen Ebenen (⊥ A), während die Längsneigung für Geradheit frei bleibt (Hinweis: ISO 1101:2017 §14 definiert Orientierungsebenen formal für abgeleitete Linien, hier anschaulich an einer Schneidkante dargestellt).',
        bookPage: 'Tafel III · Fall ⊥ A',
        callouts: [
          {
            id: 'fh_arrow',
            title: 'Pfeilspitze auf Kante (▼)',
            badge: 'Linien-/Kantenbezug',
            anchor: [-0.51, 0.57, 0.24],
            explodeFactor: 0,
            body: 'Der Toleranzpfeil endet mit einer Pfeilspitze direkt auf der oberen Kante – toleriert wird diese Kante als Linie.',
          },
          {
            id: 'fh_cap',
            title: 'Orientierungsebenenindikator ⟨[ ⊥ | A ]⟩',
            badge: 'Doppelspitze',
            anchor: [0.50, 0.86, 0.24],
            explodeFactor: 0.35,
            body: 'Spitzen auf BEIDEN Seiten kennzeichnen den Orientierungsebenenindikator: Die Begrenzungsebenen stehen rechtwinklig auf A.',
          },
          {
            id: 'fh_zone',
            title: 'Parallele Ebenen t_G = 0,02 mm',
            badge: '90° zu Bezug A',
            anchor: [0.68, 0.57, 0.24],
            explodeFactor: 1.0,
            body: 'Höhenwelligkeit entlang A wird auf 0,02 mm begrenzt; seitliches Ausweichen quer zu A bleibt innerhalb der unendlichen Ebenen.',
          },
          {
            id: 'fh_datum',
            title: 'Bezugsfläche A (Vorderseite)',
            badge: 'Orientierungsbezug',
            anchor: [0.05, 0.24, 0.24],
            explodeFactor: 0,
            body: 'Fläche A bestimmt die 90°-Rollausrichtung der parallelen Zonenebenen (im Querschnitt mit Rechtwinkelsymbol markiert).',
          },
        ],
      },
      nominalParams: {
        indicatorType: 'orientation',
        planeRelation: 'perp',
        datum: 'A',
        toleranceMm: 0.02,
        bowVert: 0.0,
        bowLat: 0.0,
        harmonics: 1,
        sliceFrac: 0.5,
        exaggeration: 280,
      },
      errorParams: {
        indicatorType: 'orientation',
        planeRelation: 'perp',
        datum: 'A',
        toleranceMm: 0.02,
        bowVert: 0.014,
        bowLat: 0.052,
        harmonics: 1,
        sliceFrac: 0.5,
        exaggeration: 280,
      },
      cameraFocus: { pos: [2.55, 1.72, 2.70], target: [0.0, 0.28, 0.0] },
    },

    fig_i: {
      id: 'fig_i',
      code: 'PLATE IV',
      codeDe: 'TAFEL IV',
      plate: 'Plate IV · // B',
      plateDe: 'Tafel IV · // B',
      relTag: '// B',
      fcf: { sym: 'straightness', tol: '0,03', capType: 'orientation', rel: 'parallel', datum: 'B', terminator: 'arrow' },
      en: {
        name: 'Orientation Plane Parallel to Datum B',
        subtitle: 'Double-Wedge ⟨[ // | B ]⟩ · Roll-Locked Zone // B',
        category: 'Orientation Plane',
        summary:
          'Applies a 0.03 mm straightness zone to the upper ridge edge using an orientation plane parallel to underside Datum B to lock the roll orientation while keeping straightness pitch tilt free.',
        bookNote:
          'Referencing bottom Datum B with // locks the same vertical height-control direction as ⊥ A in Plate III. Because the callout is straightness (—) with no datum in the tolerance frame, longitudinal pitch tilt remains free—unlike parallelism [ // | 0,03 | B ].',
        bookPage: 'Plate IV · Case // B',
        callouts: [
          {
            id: 'fi_arrow',
            title: 'Edge Arrowhead (▼)',
            badge: 'Top Ridge Edge',
            anchor: [-0.51, 0.69, -0.21],
            explodeFactor: 0,
            body: 'Points squarely onto the top sharp edge of the wedge bar so straightness of that ridge is controlled.',
          },
          {
            id: 'fi_cap',
            title: 'Orientation Cap ⟨[ // | B ]⟩',
            badge: 'Double Wedge',
            anchor: [0.50, 0.98, -0.21],
            explodeFactor: 0.35,
            body: 'Double-pointed indicator aligns the roll orientation of the parallel-plane zone to bottom Datum B while leaving longitudinal straightness pitch tilt free.',
          },
          {
            id: 'fi_zone',
            title: 'Parallel Zone t_G = 0.03 mm',
            badge: 'Height Control',
            anchor: [0.55, 0.68, -0.22],
            explodeFactor: 1.0,
            body: 'Any vertical crest exceeding the 0.03 mm minimum-zone corridor fails immediately (highlighted in vermilion).',
          },
          {
            id: 'fi_datum',
            title: 'Datum B Underside Face',
            badge: 'Mounting Base',
            anchor: [-0.24, 0.18, 0.45],
            explodeFactor: 0,
            body: 'Datum triangle attached via leader dot to the bottom planar surface B; the // marks in the end section align the zone roll orientation to B.',
          },
        ],
      },
      de: {
        name: 'Orientierungsebenenindikator parallel zu B',
        subtitle: 'Doppelspitze ⟨[ // | B ]⟩ · Roll-fixierte Zone // B',
        category: 'Orientierung',
        summary:
          'Begrenzt die Geradheit der oberen Schneidkante auf 0,03 mm zwischen zwei parallelen Ebenen, deren Rollausrichtung über Bezug B festgelegt wird (Längsneigung bleibt für Geradheit frei).',
        bookNote:
          'Der Bezug auf die Unterseite B mit // erzeugt dieselbe vertikale Prüfrichtung wie ⊥ A in Tafel III. Da im Toleranzrahmen Geradheit (—) ohne Bezug steht, bleibt die Längsneigung der Zone frei – im Unterschied zur Parallelität [ // | 0,03 | B ].',
        bookPage: 'Tafel IV · Fall // B',
        callouts: [
          {
            id: 'fi_arrow',
            title: 'Pfeilspitze auf Oberkante (▼)',
            badge: 'Tolerierte Kante',
            anchor: [-0.51, 0.69, -0.21],
            explodeFactor: 0,
            body: 'Trifft direkt auf die obere Kante des Keilkörpers und weist ihr die Geradheitstoleranz 0,03 mm zu.',
          },
          {
            id: 'fi_cap',
            title: 'Orientierungsebenenindikator ⟨[ // | B ]⟩',
            badge: 'Doppelspitze',
            anchor: [0.50, 0.98, -0.21],
            explodeFactor: 0.35,
            body: 'Die beidseitige Spitze legt die Rollausrichtung der Zonenebenen zur Grundfläche B fest, ohne eine starre Parallelität in Längsrichtung zu erzwingen.',
          },
          {
            id: 'fi_zone',
            title: 'Parallele Zonenebenen t_G = 0,03 mm',
            badge: 'Höhenkontrolle',
            anchor: [0.55, 0.68, -0.22],
            explodeFactor: 1.0,
            body: 'Überschreitet die Kantenwelligkeit vertikal den 0,03-mm-Minimum-Zone-Korridor, wird die Verletzung zinnoberrot markiert.',
          },
          {
            id: 'fi_datum',
            title: 'Bezugsfläche B (Unterseite)',
            badge: 'Auflagefläche',
            anchor: [-0.24, 0.18, 0.45],
            explodeFactor: 0,
            body: 'Bezugszeichen B auf der Bodenfläche; die //-Striche im Querschnitt zeigen die Ausrichtung der Zonenebenen zu B.',
          },
        ],
      },
      nominalParams: {
        indicatorType: 'orientation',
        planeRelation: 'parallel',
        datum: 'B',
        toleranceMm: 0.03,
        bowVert: 0.0,
        bowLat: 0.0,
        harmonics: 1,
        sliceFrac: 0.5,
        exaggeration: 280,
      },
      errorParams: {
        indicatorType: 'orientation',
        planeRelation: 'parallel',
        datum: 'B',
        toleranceMm: 0.03,
        bowVert: 0.052,
        bowLat: 0.016,
        harmonics: 3,
        sliceFrac: 0.5,
        exaggeration: 280,
      },
      cameraFocus: { pos: [2.55, 1.58, 2.75], target: [0.0, 0.25, 0.0] },
    },
  };

  const LAB_PRESETS = {
    fig_f: {
      id: 'fig_f',
      labelEn: 'I) // A · Guide Rail',
      labelDe: 'I) // A · Führungsschiene',
      params: { ...FIGURES.fig_f.errorParams },
    },
    fig_g: {
      id: 'fig_g',
      labelEn: 'II) ⊥ A · Extruded Bar',
      labelDe: 'II) ⊥ A · Strangpressprofil',
      params: { ...FIGURES.fig_g.errorParams },
    },
    fig_h: {
      id: 'fig_h',
      labelEn: 'III) ⊥ A · Knife Edge (Pass)',
      labelDe: 'III) ⊥ A · Kante (IO)',
      params: { ...FIGURES.fig_h.errorParams },
    },
    fig_i: {
      id: 'fig_i',
      labelEn: 'IV) // B · Edge (Fail)',
      labelDe: 'IV) // B · Kante (NIO)',
      params: { ...FIGURES.fig_i.errorParams },
    },
    twist_paradox: {
      id: 'twist_paradox',
      labelEn: 'Twisted Saddle Paradox',
      labelDe: 'Verwindungs-Paradoxon',
      params: {
        indicatorType: 'intersection',
        planeRelation: 'parallel',
        datum: 'A',
        toleranceMm: 0.05,
        bowLong: 0.0,
        bowTrans: 0.0,
        twist: 0.088,
        harmonics: 1,
        sliceFrac: 0.5,
        exaggeration: 240,
      },
    },
    carrier_fail: {
      id: 'carrier_fail',
      labelEn: 'Longitudinal Ripple (Fail I)',
      labelDe: 'Längswelle (Fall I NIO)',
      params: {
        indicatorType: 'intersection',
        planeRelation: 'parallel',
        datum: 'A',
        toleranceMm: 0.05,
        bowLong: 0.078,
        bowTrans: 0.02,
        twist: 0.0,
        harmonics: 2,
        sliceFrac: 0.5,
        exaggeration: 240,
      },
    },
  };

  const TOUR_STOPS = [
    {
      fig: 'overview',
      variant: 'error',
      titleEn: '1 · Why 3D Straightness Needs Plane Indicators',
      titleDe: '1 · Warum 3D-Geradheit Ebenenindikatoren braucht',
      summaryEn:
        'In classic 2D drawings, the projection plane implicitly oriented straightness zones. On 3D models (MBD), ISO 1101 requires explicit plane indicators so surfaces and edges stay unambiguous.',
      summaryDe:
        'In 2D-Zeichnungen bestimmte früher die Zeichenebene die Ausrichtung. Auf 3D-Modellen legt ISO 1101 die Schnitt- oder Orientierungsebene explizit per Indikator fest.',
      takeawayEn: 'Left-wedge caps ⟨[...|...] cut surfaces into lines; double-wedge caps ⟨[...]⟩ orient two parallel planes.',
      takeawayDe: 'Einfachspitze ⟨[...|...] schneidet Flächen in Einzellinien; Doppelspitze ⟨[...]⟩ richtet zwei Zonenebenen aus.',
    },
    {
      fig: 'fig_f',
      variant: 'error',
      titleEn: '2 · Plate I: Intersection Plane Parallel to A',
      titleDe: '2 · Tafel I: Schnittebene parallel zu Bezug A',
      summaryEn:
        'Notice the dot (•) on the top face and the single-wedge cap ⟨[ // | A ]. Even with strong transverse cupping across the width, every longitudinal line parallel to A remains straight and passes 0.05 mm.',
      summaryDe:
        'Punkt (•) auf der Fläche plus Einfachspitze ⟨[ // | A ]: Trotz deutlicher Querwölbung bleiben alle Längslinien parallel zu A gerade und innerhalb von 0,05 mm.',
      takeawayEn: 'Linear guide rail application: straight along slider travel, avoiding overly strict full-surface flatness.',
      takeawayDe: 'Linearführungs-Beispiel: gerade entlang der Laufrichtung, ohne unnötige Gesamtebenheit.',
    },
    {
      fig: 'fig_g',
      variant: 'error',
      titleEn: '3 · Plate II: Intersection Plane Perpendicular to A',
      titleDe: '3 · Tafel II: Schnittebene rechtwinklig zu Bezug A',
      summaryEn:
        'Switching from // A to ⊥ A rotates all cutting planes by 90°. Now longitudinal bow along the part passes cleanly because every transverse profile cross-section stays straight.',
      summaryDe:
        'Der Wechsel von // A auf ⊥ A dreht alle Schnittebenen um 90°. Jetzt darf sich das Bauteil längs biegen, solange jeder Querschnitt rechtwinklig zu A gerade bleibt.',
      takeawayEn: 'Typical for extruded mounting channels: every cross-section seats flat despite axial camber.',
      takeawayDe: 'Typisch für Strangpress-Profile: jeder Querschnitt liegt gerade auf, trotz leichter Längskrümmung.',
    },
    {
      fig: 'fig_h',
      variant: 'error',
      titleEn: '4 · Plate III: Orientation Plane Perpendicular to A',
      titleDe: '4 · Tafel III: Orientierungsebene rechtwinklig zu A',
      summaryEn:
        'Here the arrowhead touches the top sharp edge and the double-wedge ⟨[ ⊥ | A ]⟩ appears. The tolerance zone consists of two parallel planes spaced t_G = 0.02 mm apart, fixed at 90° to Datum A.',
      summaryDe:
        'Hier trifft die Pfeilspitze die Oberkante, ergänzt durch die Doppelspitze ⟨[ ⊥ | A ]⟩. Zwei parallele Ebenen im Abstand t_G = 0,02 mm stehen rechtwinklig zu A.',
      takeawayEn: 'Lateral sway perpendicular to A slides inside the infinite width of those planes without failing.',
      takeawayDe: 'Seitliches Ausweichen quer zu A bleibt innerhalb der unendlich breiten Ebenen zulässig.',
    },
    {
      fig: 'fig_i',
      variant: 'error',
      titleEn: '5 · Plate IV: Orientation Plane Parallel to B',
      titleDe: '5 · Tafel IV: Orientierungsebene parallel zu B',
      summaryEn:
        'Mounting on underside Datum B with ⟨[ // | B ]⟩ aligns the 0.03 mm parallel zone planes horizontally to B. Vertical wave peaks piercing above or below t_G immediately trigger a failure.',
      summaryDe:
        'Bezug B auf der Unterseite mit ⟨[ // | B ]⟩ richtet den 0,03-mm-Korridor horizontal parallel zu B aus. Vertikale Kantenwellen durchstoßen die Zone sofort (NIO).',
      takeawayEn: 'Next: test the Twisted Saddle Paradox and live CMM probe sweeping in the Tolerance Lab!',
      takeawayDe: 'Als Nächstes: Verwindungs-Paradoxon und Live-Tastschnitt im Toleranzlabor testen!',
    },
  ];

  const CONCEPTS = [
    {
      id: 'mzs_1d',
      preset: 'fig_f',
      titleEn: 'Minimum-Zone Straightness (Chebyshev)',
      titleDe: 'Minimum-Zone-Geradheit (Tschebyscheff)',
      bodyEn:
        'Each extracted line is bracketed by two parallel straight lines minimizing their perpendicular separation inside the active plane.',
      bodyDe:
        'Jede extrahierte Profillinie wird von zwei parallelen Geraden minimalen senkrechten Abstands in der jeweiligen Ebene eingeschlossen.',
      math: 'e_{\\text{str}} = \\min_{m}\\; \\frac{\\max_i (y_i - m t_i) - \\min_i (y_i - m t_i)}{\\sqrt{1 + m^2}} \\le t_G',
    },
    {
      id: 'inter_vs_orient',
      preset: 'fig_g',
      titleEn: 'Intersection vs. Orientation Cap',
      titleDe: 'Schnitt- vs. Orientierungsebenenindikator',
      bodyEn:
        'A single left wedge ⟨[...|...] slices a surface into inspected 1D lines. A double wedge ⟨[...]⟩ rotates two parallel bounding planes around a line.',
      bodyDe:
        'Einfachspitze ⟨[...|...] zerlegt eine Fläche in Einzellinien; Doppelspitze ⟨[...]⟩ legt die Drehrichtung zweier paralleler Ebenen fest.',
      math: '\\begin{aligned} \\langle[\\,\\parallel\\,|\\,A\\,] &\\quad\\text{(Surface Cuts)} \\\\ \\langle[\\,\\perp\\,|\\,A\\,]\\rangle &\\quad\\text{(Zone Planes)} \\end{aligned}',
    },
    {
      id: 'dot_vs_arrow',
      preset: 'fig_h',
      titleEn: 'Leader Dot (•) vs. Arrowhead (▼)',
      titleDe: 'Flächenpunkt (•) vs. Pfeilspitze (▼)',
      bodyEn:
        'A filled dot lands inside a face to select all planar surface cuts; a sharp arrowhead lands directly on an edge or generatrix line.',
      bodyDe:
        'Ein Punkt auf der Fläche wählt alle Schnittlinien auf dieser Fläche; eine Pfeilspitze auf der Kante toleriert gezielt die Kante.',
      math: '\\begin{aligned} \\bullet \\in \\text{Face} &\\;\\Rightarrow\\; \\text{Family of Lines} \\\\ \\blacktriangledown \\in \\text{Edge} &\\;\\Rightarrow\\; \\text{Single 3D Curve} \\end{aligned}',
    },
    {
      id: 'twist_paradox',
      preset: 'twist_paradox',
      titleEn: 'Straightness Is Not Flatness (Ruled Twist)',
      titleDe: 'Geradheit ≠ Ebenheit (Verwindungsfläche)',
      bodyEn:
        'On a bilinearly twisted surface y = (τ/2)(2u−1)(2v−1), every cut parallel to A and every cut perpendicular to A is identically straight (e = 0)—yet minimum-zone flatness equals |τ|!',
      bodyDe:
        'Auf einer verwundenen Regelfläche y = (τ/2)(2u−1)(2v−1) sind alle Schnitte // A und ⊥ A exakt gerade (e = 0), doch die Minimum-Zone-Ebenheit beträgt exakt |τ|!',
      math: 'e_{\\text{str}}(\\parallel A) = 0, \\quad e_{\\text{str}}(\\perp A) = 0, \\quad e_{\\text{flat}} = |\\tau| > 0',
    },
    {
      id: 'dof_orient',
      preset: 'fig_i',
      titleEn: 'Rotational DOF of a 3D Edge Zone',
      titleDe: 'Rotations-Freiheitsgrad einer 3D-Kante',
      bodyEn:
        'Two parallel planes along direction û retain one roll angle θ around û. Setting ⊥ A or // B locks that roll direction while leaving longitudinal pitch tilt free (unlike parallelism [// | t | B]).',
      bodyDe:
        'Zwei parallele Ebenen entlang û behalten einen Rollwinkel θ um die Kante. Erst ⊥ A oder // B fixiert die Rollrichtung, während die Längsneigung frei bleibt (anders als bei Parallelität [// | t | B]).',
      math: '\\hat{\\mathbf{n}}_{\\text{zone}} \\perp \\hat{\\mathbf{z}} \\quad \\text{(roll locked by }\\perp A\\text{ or }\\parallel B\\text{; pitch free)}',
    },
    {
      id: 'diagonal_warn',
      preset: 'twist_paradox',
      titleEn: 'Why Diagonal Checking Breaks Intent',
      titleDe: 'Warum Diagonalprüfung unzulässig ist',
      bodyEn:
        'Checking diagonally across a bowed or twisted surface mixes longitudinal and transverse curvature, turning directional line straightness effectively into full flatness.',
      bodyDe:
        'Diagonalprüfungen über eine gewölbte oder verwundene Fläche vermischen Längs- und Querkrümmung – damit würde faktisch Ebenheit statt gerichteter Geradheit geprüft.',
      math: 'e_{\\text{str}}(\\text{diag}) \\le e_{\\text{flat}}, \\qquad e_{\\text{str}}(\\text{diag}) \\not\\le \\max(e_\\parallel, e_\\perp)',
    },
  ];

  const BOOK_PARAGRAPHS = [
    {
      tagEn: '01 · View-Plane Rule vs. 3D CAD Ambiguity',
      tagDe: '01 · Zeichenebene vs. 3D-Eindeutigkeit',
      fig: 'fig_f',
      en: 'Classical 2D orthographic drawings implicitly orient line straightness parallel to the active projection view. Without explicit plane indicators in 3D CAD (MBD), inspectors cannot distinguish axial tracks from transverse or diagonal checks—and checking diagonally inadvertently imposes surface flatness rather than functional 1D track straightness.',
      de: 'In klassischen 2D-Ansichten ergab sich die Prüfrichtung implizit aus der Zeichenebene. Im 3D-Modell (MBD) verhindert erst der Ebenenindikator Verwechslungen mit Quer- oder Diagonallinien, da eine Diagonalprüfung faktisch Ebenheit statt einer gerichteten Geradheit erzwingen würde.',
    },
    {
      tagEn: '02 · Intersection Plane Indicators ⟨[ // | A ] & ⟨[ ⊥ | A ]',
      tagDe: '02 · Schnittebenenindikatoren ⟨[ // | A ] & ⟨[ ⊥ | A ]',
      fig: 'fig_g',
      en: 'Attached to a filled surface dot (•), an intersection plane indicator (single left wedge) slices a planar feature along planes oriented // A or ⊥ A. Choosing // A isolates longitudinal slider tracks while leaving cross-width bowing free; choosing ⊥ A keeps every extruded profile cross-section straight regardless of axial camber.',
      de: 'In Verbindung mit dem Flächenpunkt (•) zerlegt der Schnittebenenindikator (Einfachspitze) eine Fläche in Einzellinien parallel (// A) oder rechtwinklig (⊥ A) zu Bezug A. So bleiben je nach Einbaulage entweder Längsbahnen oder Querprofile ohne unnötige Gesamtebenheit toleriert.',
    },
    {
      tagEn: '03 · Orientation Plane Indicators ⟨[ ⊥ | A ]⟩ & ⟨[ // | B ]⟩',
      tagDe: '03 · Orientierungsebenenindikatoren ⟨[ ⊥ | A ]⟩ & ⟨[ // | B ]⟩',
      fig: 'fig_h',
      en: 'When an arrowhead selects a 1D edge, two parallel planes spaced t_G apart would still retain a free rotational angle around the edge axis. Adding a double-wedge orientation plane indicator locks that rotation relative to front Datum A (⊥ A) or mounting base B (// B), constraining edge excursion exclusively normal to the functional seating plane.',
      de: 'Zeigt die Pfeilspitze auf eine Kante, besitzen zwei parallele Zonenebenen im Abstand t_G zunächst einen freien Drehwinkel um diese Kante. Erst der Orientierungsebenenindikator (Doppelspitze) fixiert die Ebene rechtwinklig zu A oder parallel zu Auflage B.',
    },
  ];

  const FURTHER_READING = {
    standards: [
      {
        source: 'ISO 1101:2017 · §13, §14 & §17.2',
        titleEn: 'Geometrical Product Specifications (GPS) — Geometrical Tolerancing',
        titleDe: 'Geometrische Produktspezifikation (GPS) — Geometrische Tolerierung',
        descEn: 'Normative definition of Intersection Plane Indicators (§13), Orientation Plane Indicators (§14), and Straightness (§17.2) for 3D MBD and 2D drawings.',
        descDe: 'Normative Festlegung von Schnittebenenindikator (§13), Orientierungsebenenindikator (§14) und Geradheit (§17.2) im 3D- und 2D-Bereich.',
        url: 'https://www.iso.org/standard/66777.html',
      },
      {
        source: 'ISO 5459:2011 / 2024',
        titleEn: 'Geometrical Tolerancing — Datums and Datum Systems',
        titleDe: 'Geometrische Tolerierung — Bezüge und Bezugssysteme',
        descEn: 'Defines datum features A and B and datum surface indicators (filled triangle + leader dot) used to orient plane indicators.',
        descDe: 'Definiert Bezugselemente A und B sowie die Kennzeichnung von Bezugsflächen im 3D-Modell (Dreieck und Flächenpunkt).',
        url: 'https://www.iso.org/obp/ui/#iso:std:iso:5459:ed-3:v1:en',
      },
      {
        source: 'ISO 12780-1 / -2',
        titleEn: 'Straightness Vocabulary, Parameters & Verification Operators',
        titleDe: 'Geradheit — Begriffe, Kenngrößen und Prüfoperatoren',
        descEn: 'Formalizes peak-to-valley straightness STRt with Minimum-Zone Reference Straight Line (MZLI) and extraction strategies along specified intersection lines.',
        descDe: 'Beschreibt die Gesamtabweichung der Geradheit STRt mit Minimum-Zone-Referenzgerade (MZLI) sowie Messstrategien entlang definierter Schnittlinien.',
        url: 'https://www.iso.org/obp/ui/#iso:std:iso:12780:-1:ed-1:v1:en',
      },
    ],
    books: [
      {
        source: 'Engineering Literature · Reference Only',
        titleEn: 'Jorden & Schütte — Form- und Lagetoleranzen (Carl Hanser Verlag)',
        titleDe: 'Jorden & Schütte — Form- und Lagetoleranzen (Carl Hanser Verlag)',
        descEn: 'Recommended German reference textbook on DIN EN ISO 1101 form, orientation, and location tolerancing.',
        descDe: 'Weiterführendes deutsches Standardwerk zur DIN EN ISO 1101 (Form-, Richtungs- und Lagetoleranzen).',
        url: 'https://www.hanser-fachbuch.de/',
      },
      {
        source: 'ISO vs. ASME Y14.5-2018',
        titleEn: 'Plane Indicator Differences Between ISO 1101 and ASME Y14.5',
        titleDe: 'Unterschiede zwischen ISO 1101 und ASME Y14.5',
        descEn: 'While ISO 1101 uses explicit ⟨[...|...] and ⟨[...]⟩ caps attached to the feature control frame, ASME Y14.5 primarily relies on view orientation or "EACH ELEMENT" notes.',
        descDe: 'Während ISO 1101 explizite Indikatorkästchen an den Toleranzrahmen hängt, nutzt ASME Y14.5 vorwiegend Ansichtsebenen oder Textzusätze.',
        url: 'https://www.asme.org/codes-standards/find-codes-standards/y14-5-dimensioning-tolerancing',
      },
    ],
  };

  // Format tolerance cleanly without rounding away 0.005 mm increments (e.g., 0.025 -> "0,025", 0.05 -> "0,05")
  function formatTol(val, useComma = true) {
    const n = Number(val ?? 0.05);
    const s3 = n.toFixed(3);
    const str = s3.endsWith('0') ? n.toFixed(2) : s3;
    return useComma ? str.replace('.', ',') : str;
  }

  function formatNum(val, decimals, lang = 'en') {
    const s = Number(val ?? 0).toFixed(decimals);
    return lang === 'de' ? s.replace('.', ',') : s;
  }

  // Generate razor-sharp ISO 1101:2017 Feature Control Frame SVG string
  function renderFcfSvg(fcf, opts = {}) {
    const compact = Boolean(opts.compact);
    const h = 34;
    const x0 = 2;
    const y0 = 2;
    const box1W = 34;
    const box2W = 58;
    const capX = x0 + box1W + box2W;
    const wedge = 11;
    const relW = 28;
    const datW = 26;
    const capBodyStart = capX + wedge;
    const capMidX = capBodyStart + relW;
    const capEnd = capMidX + datW;
    const rightPoint = fcf.capType === 'orientation';
    const totalW = capEnd + (rightPoint ? wedge : 0) + 4;
    const tolText = typeof fcf.tol === 'number'
      ? formatTol(fcf.tol, true)
      : String(fcf.tol ?? '0,05').replace('.', ',');
    const relSym = fcf.rel === 'parallel'
      ? `<line x1="${capBodyStart + 8}" y1="${y0 + 25}" x2="${capBodyStart + 15}" y2="${y0 + 9}" stroke="#181715" stroke-width="2"/><line x1="${capBodyStart + 15}" y1="${y0 + 25}" x2="${capBodyStart + 22}" y2="${y0 + 9}" stroke="#181715" stroke-width="2"/>`
      : `<line x1="${capBodyStart + 6}" y1="${y0 + 24}" x2="${capBodyStart + 22}" y2="${y0 + 24}" stroke="#181715" stroke-width="2"/><line x1="${capBodyStart + 14}" y1="${y0 + 24}" x2="${capBodyStart + 14}" y2="${y0 + 9}" stroke="#181715" stroke-width="2"/>`;

    const capPoly = rightPoint
      ? `${capX},${y0 + h / 2} ${capBodyStart},${y0} ${capEnd},${y0} ${capEnd + wedge},${y0 + h / 2} ${capEnd},${y0 + h} ${capBodyStart},${y0 + h}`
      : `${capX},${y0 + h / 2} ${capBodyStart},${y0} ${capEnd},${y0} ${capEnd},${y0 + h} ${capBodyStart},${y0 + h}`;

    const cls = compact ? 'fcf-svg compact' : 'fcf-svg';
    return `
      <svg class="${cls}" viewBox="0 0 ${totalW} ${h + 4}" width="${compact ? Math.round(totalW * 0.85) : totalW}" height="${compact ? Math.round((h + 4) * 0.85) : h + 4}" aria-label="ISO 1101 Feature Control Frame">
        <rect x="${x0}" y="${y0}" width="${box1W + box2W}" height="${h}" fill="#faf5e8" stroke="#181715" stroke-width="1.8"/>
        <line x1="${x0 + box1W}" y1="${y0}" x2="${x0 + box1W}" y2="${y0 + h}" stroke="#181715" stroke-width="1.6"/>
        <line x1="${x0 + 8}" y1="${y0 + h / 2}" x2="${x0 + box1W - 8}" y2="${y0 + h / 2}" stroke="#181715" stroke-width="2.2"/>
        <text x="${x0 + box1W + box2W / 2}" y="${y0 + 22.5}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13.5" font-weight="700" fill="#181715">${tolText}</text>
        <polygon points="${capPoly}" fill="#f6efe0" stroke="#d94426" stroke-width="1.8" stroke-linejoin="round"/>
        <line x1="${capBodyStart}" y1="${y0}" x2="${capBodyStart}" y2="${y0 + h}" stroke="#d94426" stroke-width="1.3"/>
        <line x1="${capMidX}" y1="${y0}" x2="${capMidX}" y2="${y0 + h}" stroke="#d94426" stroke-width="1.3"/>
        ${relSym}
        <text x="${capMidX + datW / 2}" y="${y0 + 22.5}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="#181715">${fcf.datum}</text>
      </svg>`;
  }

  global.ISO_DATA = {
    FIGURE_ORDER,
    OVERVIEW_IDS,
    UI_TEXT,
    FIGURES,
    LAB_PRESETS,
    TOUR_STOPS,
    CONCEPTS,
    BOOK_PARAGRAPHS,
    FURTHER_READING,
    formatTol,
    formatNum,
    renderFcfSvg,
  };
})(window);
