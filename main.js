// main.js — India Map BFS/DFS: only path edges shown

const CITIES = [
  { id: 0,  name: "Delhi",         state: "Delhi",       lat: 28.61, lng: 77.20 },
  { id: 1,  name: "Mumbai",        state: "Maharashtra", lat: 19.07, lng: 72.87 },
  { id: 2,  name: "Kolkata",       state: "W. Bengal",   lat: 22.57, lng: 88.36 },
  { id: 3,  name: "Chennai",       state: "Tamil Nadu",  lat: 13.08, lng: 80.27 },
  { id: 4,  name: "Bangalore",     state: "Karnataka",   lat: 12.97, lng: 77.59 },
  { id: 5,  name: "Hyderabad",     state: "Telangana",   lat: 17.38, lng: 78.48 },
  { id: 6,  name: "Ahmedabad",     state: "Gujarat",     lat: 23.02, lng: 72.57 },
  { id: 7,  name: "Pune",          state: "Maharashtra", lat: 18.52, lng: 73.85 },
  { id: 8,  name: "Jaipur",        state: "Rajasthan",   lat: 26.91, lng: 75.78 },
  { id: 9,  name: "Lucknow",       state: "U.P.",        lat: 26.84, lng: 80.94 },
  { id: 10, name: "Bhopal",        state: "M.P.",        lat: 23.25, lng: 77.41 },
  { id: 11, name: "Patna",         state: "Bihar",       lat: 25.59, lng: 85.13 },
  { id: 12, name: "Nagpur",        state: "Maharashtra", lat: 21.14, lng: 79.08 },
  { id: 13, name: "Surat",         state: "Gujarat",     lat: 21.17, lng: 72.83 },
  { id: 14, name: "Kochi",         state: "Kerala",      lat:  9.93, lng: 76.26 },
  { id: 15, name: "Guwahati",      state: "Assam",       lat: 26.14, lng: 91.73 },
  { id: 16, name: "Chandigarh",    state: "Punjab",      lat: 30.73, lng: 76.77 },
  { id: 17, name: "Indore",        state: "M.P.",        lat: 22.71, lng: 75.85 },
  { id: 18, name: "Visakhapatnam", state: "A.P.",        lat: 17.68, lng: 83.21 },
  { id: 19, name: "Amritsar",      state: "Punjab",      lat: 31.63, lng: 74.87 },
];

// [from, to, km, trainHrs, roadHrs]
const EDGES = [
  [19, 16,  229, 3,  4],
  [19,  0,  448, 6,  7],
  [16,  0,  248, 3,  4],
  [ 0,  8,  268, 4,  5],
  [ 0,  9,  497, 6,  8],
  [ 8,  6,  671, 9, 11],
  [ 8, 10,  573, 8, 10],
  [ 6, 13,  263, 4,  5],
  [ 6, 17,  545, 7,  9],
  [13,  1,  263, 4,  5],
  [17, 10,  190, 3,  4],
  [10,  9,  595, 8, 10],
  [10, 12,  357, 5,  7],
  [ 9, 11,  250, 4,  5],
  [11,  2,  530, 7,  9],
  [ 2, 15, 1031,14, 18],
  [ 1,  7,  149, 3,  3],
  [ 7, 12,  900,12, 15],
  [ 7,  5,  560, 8, 10],
  [12,  5,  500, 7,  9],
  [12, 18,  900,12, 15],
  [ 5, 18,  625, 9, 11],
  [ 5,  3,  626, 9, 11],
  [ 5,  4,  570, 8, 10],
  [18,  3,  793,11, 13],
  [ 3,  4,  346, 5,  6],
  [ 3, 14,  683,10, 12],
  [ 4, 14,  478, 7,  9],
];

const TOTAL = CITIES.length;
const GRAPH = Array.from({ length: TOTAL }, () => []);

EDGES.forEach(([a, b]) => {
  if (!GRAPH[a].includes(b)) GRAPH[a].push(b);
  if (!GRAPH[b].includes(a)) GRAPH[b].push(a);
});

function edgeInfo(a, b) {
  return EDGES.find(([x, y]) =>
    (x === a && y === b) || (x === b && y === a)
  );
}

// ── DOM ──────────────────────────────────────────────────────
const startSel = document.getElementById('startNode');
const endSel   = document.getElementById('endNode');
const btnBFS   = document.getElementById('btnBFS');
const btnDFS   = document.getElementById('btnDFS');
const btnReset = document.getElementById('btnReset');
const speedEl  = document.getElementById('speed');
const speedLbl = document.getElementById('speedLabel');
const logSteps = document.getElementById('logSteps');
const logBadge = document.getElementById('logType');
const statsRow = document.getElementById('statsRow');
const infoBox  = document.getElementById('pathInfoBox');

let map, gEdges, gCities;
let isRunning = false;
let animTimeout = null;

// ── Init ─────────────────────────────────────────────────────
function init() {
  CITIES.forEach(c => {
    startSel.appendChild(new Option(`${c.name} (${c.state})`, c.id));
    endSel.appendChild(new Option(`${c.name} (${c.state})`, c.id));
  });
  startSel.value = 0;
  endSel.value   = 3;

  speedEl.addEventListener('input', () => speedLbl.textContent = speedEl.value + 'ms');
  btnBFS.addEventListener('click', () => runAlgo('bfs'));
  btnDFS.addEventListener('click', () => runAlgo('dfs'));
  btnReset.addEventListener('click', resetAll);
  startSel.addEventListener('change', refreshDots);
  endSel.addEventListener('change', refreshDots);


  initMap();
}

// ── Leaflet map ───────────────────────────────────────────────
function initMap() {
  map = L.map('mapContainer', { center: [22.5, 82.0], zoom: 5 });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 19
  }).addTo(map);

  L.svg({ padding: 0.1 }).addTo(map);
  const svgEl = document.querySelector('#mapContainer .leaflet-overlay-pane svg');
  svgEl.style.pointerEvents = 'none';

  const root = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  root.setAttribute('class', 'leaflet-zoom-hide');
  svgEl.appendChild(root);

  gEdges  = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gCities = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  root.appendChild(gEdges);
  root.appendChild(gCities);

  drawAll();
  map.on('zoomend moveend', drawAll);
}

function px(lat, lng) { return map.latLngToLayerPoint([lat, lng]); }

// ── Draw cities only (edges hidden by default) ────────────────
function drawAll() {
  gEdges.innerHTML  = '';
  gCities.innerHTML = '';

  // Draw ALL edges but invisible — shown only when needed
  const seen = new Set();
  EDGES.forEach(([a, b, km]) => {
    const key = `${Math.min(a,b)}-${Math.max(a,b)}`;
    if (seen.has(key)) return;
    seen.add(key);

    const pa = px(CITIES[a].lat, CITIES[a].lng);
    const pb = px(CITIES[b].lat, CITIES[b].lng);
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;

    // Line — hidden by default
    const line = sEl('line', {
      x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y,
      class: 'map-edge edge-hidden',
      id: `edge-${key}`
    });
    gEdges.appendChild(line);

    // Distance label — hidden by default
    const lbl = sEl('text', {
      x: mx, y: my - 5,
      class: 'edge-dist',
      id: `edist-${key}`
    });
    lbl.textContent = `${km} km`;
    gEdges.appendChild(lbl);
  });

  // Draw city dots
  CITIES.forEach(c => {
    const p = px(c.lat, c.lng);
    const g = sEl('g', { id: `cg-${c.id}`, style: 'pointer-events:all;cursor:pointer' });

    const ring = sEl('circle', { cx: p.x, cy: p.y, r: 11, class: 'city-ring', id: `ring-${c.id}` });
    const dot  = sEl('circle', { cx: p.x, cy: p.y, r:  6, class: 'city-dot',  id: `dot-${c.id}`  });
    const name = sEl('text',   { x: p.x, y: p.y - 12, class: 'city-lbl', id: `lbl-${c.id}` });
    name.textContent = c.name;

    const badge = sEl('text', { x: p.x + 10, y: p.y - 10, class: 'step-badge', id: `badge-${c.id}`, style: 'display:none' });

    g.appendChild(ring); g.appendChild(dot);
    g.appendChild(name); g.appendChild(badge);
    gCities.appendChild(g);

    g.addEventListener('click', () => {
      if (isRunning) return;
      if (parseInt(startSel.value) === c.id) endSel.value = c.id;
      else startSel.value = c.id;
      refreshDots();
    });
  });

  refreshDots();
}

function refreshDots() {
  CITIES.forEach(c => {
    const d = document.getElementById(`dot-${c.id}`);
    const l = document.getElementById(`lbl-${c.id}`);
    if (d) d.className.baseVal = 'city-dot';
    if (l) l.className.baseVal = 'city-lbl';
  });
  const s = +startSel.value, e = +endSel.value;
  const sd = document.getElementById(`dot-${s}`);
  const ed = document.getElementById(`dot-${e}`);
  const sl = document.getElementById(`lbl-${s}`);
  const el = document.getElementById(`lbl-${e}`);
  if (sd) sd.className.baseVal = 'city-dot dot-start';
  if (ed && s !== e) ed.className.baseVal = 'city-dot dot-end';
  if (sl) sl.className.baseVal = 'city-lbl lbl-on';
  if (el && s !== e) el.className.baseVal = 'city-lbl lbl-on';
}

// ── Run BFS / DFS ─────────────────────────────────────────────
function runAlgo(type) {
  if (isRunning) return;
  resetVisuals();

  const start = +startSel.value;
  const end   = +endSel.value;
  const delay = +speedEl.value;

  const { order, parent } = type === 'bfs'
    ? bfs(start, GRAPH, TOTAL)
    : dfs(start, GRAPH, TOTAL);

  const path = getPath(end, parent);

  // Build a Set of edges that are ON the traversal path
  // Only these edges will be shown during animation
  const pathEdgeSet = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    pathEdgeSet.add(`${Math.min(a,b)}-${Math.max(a,b)}`);
  }

  isRunning = true;
  setButtons(true);
  logSteps.innerHTML = '';
  logBadge.textContent = type.toUpperCase();
  logBadge.className = `log-badge ${type}`;
  statsRow.style.display = 'flex';
  document.getElementById('statTotal').textContent = TOTAL;
  document.getElementById('statEdges').textContent = EDGES.length;
  document.getElementById('statVisited').textContent = '0';
  infoBox.style.display = 'none';

  animate(order, path, pathEdgeSet, type, delay, 0, start, end);
}

// ── Animation — step by step ──────────────────────────────────
function animate(order, path, pathEdgeSet, type, delay, step, start, end) {
  if (step >= order.length) {
    finishPath(path, pathEdgeSet, type);
    isRunning = false;
    setButtons(false);
    document.getElementById('statVisited').textContent = order.length;
    return;
  }

  const cur  = order[step];
  const prev = step > 0 ? order[step - 1] : -1;

  // Previous node: mark visited
  if (prev >= 0) {
    const pd = document.getElementById(`dot-${prev}`);
    if (pd) {
      if (prev === +startSel.value)     pd.className.baseVal = 'city-dot dot-start';
      else if (prev === +endSel.value)  pd.className.baseVal = 'city-dot dot-end';
      else                              pd.className.baseVal = `city-dot dot-visited-${type}`;
    }
  }

  // Current node: highlight
  const dot   = document.getElementById(`dot-${cur}`);
  const badge = document.getElementById(`badge-${cur}`);
  if (dot)   dot.className.baseVal = 'city-dot dot-current';
  if (badge) { badge.textContent = step + 1; badge.style.display = 'block'; }

  // Show ONLY the edge between prev → cur if it's on the path
  if (prev >= 0) {
    const key = `${Math.min(prev, cur)}-${Math.max(prev, cur)}`;
    if (pathEdgeSet.has(key)) {
      const edge = document.getElementById(`edge-${key}`);
      const dist = document.getElementById(`edist-${key}`);
      if (edge) edge.className.baseVal = `map-edge edge-traversing edge-${type}`;
      if (dist) dist.className.baseVal = 'edge-dist dist-on';
    }
  }

  addChip(step + 1, cur, type);
  document.getElementById('statVisited').textContent = step + 1;

  animTimeout = setTimeout(() =>
    animate(order, path, pathEdgeSet, type, delay, step + 1, start, end), delay);
}

// ── Final path highlight ──────────────────────────────────────
function finishPath(path, pathEdgeSet, type) {
  if (path.length < 2) {
    infoBox.innerHTML = `<span style="color:#f87171">❌ No path found between selected cities.</span>`;
    infoBox.style.display = 'block';
    return;
  }

  let totalKm = 0, totalTrain = 0, totalRoad = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    const key = `${Math.min(a,b)}-${Math.max(a,b)}`;

    // Make final path edge glow yellow
    const edge = document.getElementById(`edge-${key}`);
    const dist = document.getElementById(`edist-${key}`);
    if (edge) edge.className.baseVal = 'map-edge edge-final';
    if (dist) dist.className.baseVal = 'edge-dist dist-final';

    const info = edgeInfo(a, b);
    if (info) { totalKm += info[2]; totalTrain += info[3]; totalRoad += info[4]; }
  }

  // Glow path city dots
  path.forEach(id => {
    const d = document.getElementById(`dot-${id}`);
    if (d) d.classList.add('dot-path');
  });

  const route = path.map(id => CITIES[id].name).join(' → ');
  infoBox.innerHTML = `
    <div class="info-title">📍 ${type.toUpperCase()} Path: ${CITIES[path[0]].name} → ${CITIES[path[path.length-1]].name}</div>
    <div class="info-route">${route}</div>
    <div class="info-stats">
      <div class="info-stat"><span>🛣️ ${totalKm} km</span><small>Distance</small></div>
      <div class="info-stat"><span>🚂 ~${totalTrain} hrs</span><small>By Train</small></div>
      <div class="info-stat"><span>🚗 ~${totalRoad} hrs</span><small>By Road</small></div>
      <div class="info-stat"><span>🏙️ ${path.length} cities</span><small>Stops</small></div>
    </div>`;
  infoBox.style.display = 'block';
}

function addChip(n, id, type) {
  const c = CITIES[id];
  const chip = document.createElement('div');
  chip.className = `log-chip ${type}`;
  chip.innerHTML = `<span class="num">${n}</span><span class="city-name">${c.name}</span><span class="state-name">${c.state}</span>`;
  logSteps.appendChild(chip);
  logSteps.scrollTop = logSteps.scrollHeight;
}

function resetAll() {
  if (animTimeout) clearTimeout(animTimeout);
  isRunning = false;
  setButtons(false);
  resetVisuals();
  logSteps.innerHTML = '<p class="log-placeholder">Select cities and run BFS or DFS</p>';
  logBadge.textContent = '';
  logBadge.className = 'log-badge';
  statsRow.style.display = 'none';
  infoBox.style.display = 'none';
}

function resetVisuals() {
  // Hide all edges
  document.querySelectorAll('.map-edge').forEach(e => {
    e.className.baseVal = 'map-edge edge-hidden';
  });
  document.querySelectorAll('.edge-dist').forEach(e => {
    e.className.baseVal = 'edge-dist';
  });
  // Reset all city dots
  CITIES.forEach(c => {
    const d = document.getElementById(`dot-${c.id}`);
    if (d) { d.className.baseVal = 'city-dot'; d.classList.remove('dot-path'); }
    const b = document.getElementById(`badge-${c.id}`);
    if (b) { b.style.display = 'none'; b.textContent = ''; }
  });
  refreshDots();
}

function setButtons(r) {
  btnBFS.disabled = r; btnDFS.disabled = r; btnReset.disabled = r;
}

function sEl(tag, attrs = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

init();
