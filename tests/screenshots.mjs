// Headless Edge/Chrome CDP verification & visual screenshot script
// Run: node tests/screenshots.mjs <outDir>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const url = new URL('../index.html', import.meta.url).href;
const outDir = process.argv[2] || path.join(process.env.TEMP || '.', 'iso1101_shots');
const port = 9620 + Math.floor(Math.random() * 200);
const prof = path.join(process.env.TEMP, 'edge-iso1101-' + port);
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserBin = fs.existsSync(chrome) ? chrome : edge;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn(
  browserBin,
  [
    '--headless=new',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${prof}`,
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--window-size=1440,920',
    'about:blank',
  ],
  { detached: true, stdio: 'ignore' }
);
proc.unref();

async function getJSON(p) {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}${p}`);
      return await r.json();
    } catch {
      await sleep(150);
    }
  }
  throw new Error('CDP unreachable');
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const handlers = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    } else {
      handlers.forEach((h) => h(m));
    }
  };
  return new Promise((res) => {
    ws.onopen = () =>
      res({
        send: (method, params = {}) =>
          new Promise((r) => {
            const i = ++id;
            pending.set(i, r);
            ws.send(JSON.stringify({ id: i, method, params }));
          }),
        on: (h) => handlers.push(h),
        close: () => ws.close(),
      });
  });
}

(async () => {
  try {
    const list = await getJSON('/json/list');
    const page = list.find((t) => t.type === 'page');
    const c = await connect(page.webSocketDebuggerUrl);
    const errors = [];

    c.on((m) => {
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        errors.push('console.error: ' + m.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
      }
      if (m.method === 'Runtime.exceptionThrown') {
        const ed = m.params.exceptionDetails;
        errors.push('EXCEPTION: ' + (ed.exception?.description || ed.text));
      }
    });

    await c.send('Runtime.enable');
    await c.send('Page.enable');
    await c.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 920, deviceScaleFactor: 1, mobile: false });
    await c.send('Page.navigate', { url });

    for (let i = 0; i < 40; i++) {
      const r = await c.send('Runtime.evaluate', {
        expression: 'document.readyState === "complete" && document.querySelectorAll("#callout-detail-list .callout-item").length === 4 && document.querySelectorAll("#three-container canvas").length === 1',
        returnByValue: true,
      });
      if (r?.result?.result?.value) break;
      await sleep(200);
    }
    await sleep(600);

    fs.mkdirSync(outDir, { recursive: true });

    async function shot(name) {
      await sleep(900);
      const check = await c.send('Runtime.evaluate', {
        expression: '({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, canvasCount: document.querySelectorAll("canvas").length })',
        returnByValue: true,
      });
      const res = await c.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(res.result.data, 'base64'));
      console.log(`[${name}]`, check.result.result.value);
    }

    // 1. Overview (4-Plate Gallery)
    await shot('01_overview_4plates');

    // 2. Fig. f Intersection Plane Parallel to A
    await c.send('Runtime.evaluate', { expression: `document.getElementById('select-figure').value = 'fig_f'; document.getElementById('select-figure').dispatchEvent(new Event('change'));` });
    await shot('02_fig_f_intersection_parallel');

    // 3. Fig. h Orientation Plane Perp to A + German language check
    await c.send('Runtime.evaluate', { expression: `document.querySelector('[data-lang="de"]').click(); document.getElementById('select-figure').value = 'fig_h'; document.getElementById('select-figure').dispatchEvent(new Event('change'));` });
    await shot('03_fig_h_orientation_de');

    // 4. Parametric Tolerance Lab (back to EN, Fig. i failing edge + 2D end-on section)
    await c.send('Runtime.evaluate', { expression: `document.querySelector('[data-lang="en"]').click(); document.querySelector('[data-tab="lab"]').click(); document.querySelector('[data-preset="fig_i"]').click();` });
    await shot('04_lab_fig_i_fail');

    // 5. Concepts & Engineering Notes (KaTeX + GPS notes)
    await c.send('Runtime.evaluate', { expression: `document.querySelector('[data-tab="concepts"]').click();` });
    await shot('05_concepts_katex');

    console.log('ERRORS:', errors.length, errors);
    c.close();
    if (errors.length > 0) process.exitCode = 1;
  } finally {
    try { proc.kill('SIGKILL'); } catch {}
    await sleep(400);
    try { fs.rmSync(prof, { recursive: true, force: true }); } catch {}
  }
})();
