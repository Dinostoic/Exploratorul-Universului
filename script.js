// ===== BG CANVAS: STELE + METEORI =====
(function initBG() {
  const c = document.getElementById('bgCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, stars = [], meteors = [];
  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 220; i++) {
    stars.push({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3,
      base: Math.random() * 0.7 + 0.3, phase: Math.random() * Math.PI * 2, sp: Math.random() * 0.02 + 0.005
    });
  }
  function spawnMeteor() {
    meteors.push({
      x: Math.random() * W, y: Math.random() * H * 0.45,
      len: Math.random() * 140 + 60, speed: Math.random() * 6 + 4, opacity: 1,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3
    });
    setTimeout(spawnMeteor, 2200 + Math.random() * 4500);
  }
  setTimeout(spawnMeteor, 2500);
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.phase += s.sp;
      const a = s.base * (0.5 + 0.5 * Math.sin(s.phase));
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,215,255,${a})`; ctx.fill();
    });
    meteors = meteors.filter(m => m.opacity > 0);
    meteors.forEach(m => {
      const dx = Math.cos(m.angle) * m.len, dy = Math.sin(m.angle) * m.len;
      const g = ctx.createLinearGradient(m.x, m.y, m.x + dx, m.y + dy);
      g.addColorStop(0, `rgba(255,240,180,${m.opacity})`); g.addColorStop(1, 'rgba(255,240,180,0)');
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + dx, m.y + dy);
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke();
      m.x += Math.cos(m.angle) * m.speed; m.y += Math.sin(m.angle) * m.speed; m.opacity -= 0.017;
    });
    requestAnimationFrame(draw);
  })();
})();

// ===== LOADER CANVAS =====  
(function initLoaderCanvas() {
  const c = document.getElementById('loadCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  c.width = window.innerWidth; c.height = window.innerHeight;
  const pts = [];
  for (let i = 0; i < 80; i++) pts.push({
    x: Math.random() * c.width, y: Math.random() * c.height,
    r: Math.random() * 1.2 + 0.2, a: Math.random(),
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
  });
  (function draw() {
    if (!document.getElementById('loading-screen') ||
      document.getElementById('loading-screen').classList.contains('hidden')) return;
    ctx.clearRect(0, 0, c.width, c.height);
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124,92,255,${p.a})`; ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > c.width) p.vx *= -1;
      if (p.y < 0 || p.y > c.height) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  })();
})();

// ===== SUNET =====
let _ctx = null, soundOn = true;
function initAudio() { if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
function playTone(freq, dur, vol) {
  if (!soundOn) return;
  try {
    initAudio();
    if (_ctx.state === 'suspended') _ctx.resume();
    const o = _ctx.createOscillator(), g = _ctx.createGain();
    o.connect(g); g.connect(_ctx.destination);
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.06, _ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, _ctx.currentTime + (dur || 0.1));
    o.start(); o.stop(_ctx.currentTime + (dur || 0.1));
  } catch (e) { }
}
function playClick() { playTone(500, 0.07, 0.05); }
function playSuccess() { [500, 700, 900].forEach((f, i) => setTimeout(() => playTone(f, .12, .07), i * 90)); }
function playError() { [350, 250].forEach((f, i) => setTimeout(() => playTone(f, .14, .07), i * 110)); }
function playNotif() { [660, 880].forEach((f, i) => setTimeout(() => playTone(f, .1, .06), i * 80)); }

// ===== TOAST =====
function toast(msg, type, dur) {
  const w = document.getElementById('toastWrap');
  if (!w) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (type || 'info');
  el.textContent = msg;
  w.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 350);
  }, dur || 3000);
}

// ===== CONFETTI =====
function confetti(colors) {
  colors = colors || ['#FFD966', '#7c5cff', '#2ecc71', '#00e5ff', '#ff6b9d'];
  const cv = document.createElement('canvas');
  Object.assign(cv.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '9990' });
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  // Confetti tip sampanie(sau ce o fi)
  const cx = cv.width / 2;
  const ps = Array.from({ length: 200 }, () => ({
    x: cx + (Math.random() - 0.5) * 80,
    y: cv.height + Math.random() * 40,
    w: Math.random() * 11 + 4, h: Math.random() * 7 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 9,
    vy: -(Math.random() * 14 + 8),
    rot: Math.random() * 360, rv: (Math.random() - 0.5) * 8,
    gravity: 0.35, opacity: 1
  }));
  const t0 = Date.now();
  (function draw() {
    if (Date.now() - t0 > 4000) { if (cv.parentNode) document.body.removeChild(cv); return; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    ps.forEach(p => {
      p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.rot += p.rv;
      if (p.y > cv.height + 20) { p.opacity = 0; }
      ctx.save(); ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    requestAnimationFrame(draw);
  })();
}

// ===== TYPEWRITER =====
function typewriter(el, text, speed) {
  el.textContent = ''; let i = 0;
  const t = setInterval(() => { el.textContent += text[i++]; if (i >= text.length) clearInterval(t); }, speed || 55);
}

// ===== COUNTER ANIMATION =====
function animCount(el, to, dur) {
  const from = parseInt(el.textContent) || 0, t0 = Date.now(), d = dur || 700;
  (function tick() {
    const p = Math.min((Date.now() - t0) / d, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(tick);
  })();
}

// ===== BARA DE PROGRES =====
function updateReadBar() {
  const rb = document.getElementById('readBar');
  if (!rb) return;
  const h = document.documentElement, b = document.body;
  const st = h.scrollTop || b.scrollTop, sh = h.scrollHeight - h.clientHeight;
  rb.style.width = (sh > 0 ? (st / sh) * 100 : 0) + '%';
}

function debounce(fn, wait) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ===== FAPTE COSMICE =====
const FACTS = [
  { icon: 'fa-sun', text: 'Lumina Soarelui parcurge 149.6 milioane km pana pe Pamant in aproximativ 8 minute si 20 de secunde.' },
  { icon: 'fa-moon', text: 'Luna se indeparteaza de Pamant cu 3.8 cm pe an datorita efectului de maree, iar ziua Lunii este egala cu luna sinodica (29.5 zile).' },
  { icon: 'fa-star', text: 'Betelgeuse este atat de mare incat, daca ar inlocui Soarele, ar inghiti orbitele lui Mercur, Venus, Pamant si Marte.' },
  { icon: 'fa-infinity', text: 'Calea Lactee contine intre 100 si 400 de miliarde de stele si are un diametru de aproximativ 100.000 de ani-lumina.' },
  { icon: 'fa-rocket', text: 'Voyager 1, lansata in 1977, se afla la peste 24 de miliarde de km de Pamant, in spatiul interstelar - cel mai indepartat obiect uman.' },
  { icon: 'fa-meteor', text: 'Pamantul colecteaza zilnic aproximativ 100 de tone de material cosmic sub forma de praf si mici meteoriti, fara niciun efect vizibil.' },
  { icon: 'fa-circle-dot', text: 'Inelele lui Saturn se intind pe 282.000 km in diametru, dar au doar cateva zeci de metri grosime - proportional mai subtiri decat o foaie de hartie.' },
  { icon: 'fa-circle', text: 'Gaura neagra supermasiva din centrul Caii Lactee, Sgr A*, are masa de 4.3 milioane de ori mai mare decat a Soarelui nostru.' },
  { icon: 'fa-earth-europe', text: 'Sistemul TRAPPIST-1 contine 7 planete de marimea Pamantului, dintre care 3 se afla in zona locuibila, la doar 40 de ani-lumina distanta.' },
  { icon: 'fa-bolt', text: 'Big Bang-ul s-a produs acum 13.8 miliarde de ani. In primele 3 minute s-au format hidrogenul si heliul care alcatuiesc 98% din materia normala a universului.' },
  { icon: 'fa-binoculars', text: 'Telescopul Spatial James Webb poate detecta caldura unui bondar aflat la Luna si a fotografiat galaxii formate la doar 300 milioane de ani dupa Big Bang.' },
  { icon: 'fa-satellite', text: 'ISS orbiteaza Pamantul la ~408 km altitudine cu 27.600 km/h, completand 15-16 orbite pe zi. Echipajul vede 16 rasarituri si apusuri in fiecare zi.' }
];

// ===== LECTII =====
const LESSONS = [
  {
    id: 1, title: 'Sistemul Solar', icon: 'fa-circle-nodes', diff: 'easy', readTime: 10,
    desc: 'O privire de ansamblu asupra sistemului nostru stelar - de la Soare la Norul Oort',
    keyFacts: [
      { l: 'Distanta Soare-Pamant', v: '149.6 milioane km (1 UA)' },
      { l: 'Numar planete', v: '8 planete oficiale' },
      { l: 'Varsta sistemului', v: '4.57 miliarde ani' },
      { l: 'Diametru heliosfera', v: '~300 UA' },
      { l: 'Masa Soarelui', v: '99.86% din total' },
      { l: 'Voyager 1 (2024)', v: '>24 miliarde km' }
    ],
    content: "<h3><i class='fas fa-globe'></i> Structura generala</h3><p>Sistemul Solar este un sistem planetar format din <strong>Soare</strong> si toate corpurile ceresti care il orbiteaza: 8 planete, 5 planete pitice, peste 200 de sateliti naturali, milioane de asteroizi si comete. Se intinde pe ~100.000 UA pana la limita Norului Oort.</p><div class='info-box ib-gold'><div class='ib-title'>Impartire principala</div><p>Planetele <em>terestre</em> (interioare): Mercur, Venus, Pamant, Marte. Planetele <em>gigante</em> (exterioare): Jupiter, Saturn, Uranus, Neptun. Intre ele se afla <strong>Centura de Asteroizi</strong> (2.1-3.3 UA).</p></div><h3><i class='fas fa-ruler'></i> Dimensiuni cosmice</h3><p>Distantele din Sistemul Solar sunt greu de imaginat. Daca Soarele ar fi o bila de baschet, Pamantul ar fi un bob de mazare la 26 de metri distanta, iar Neptun - la 800 de metri.</p><div class='data-grid'><div class='dg-item'><div class='dg-label'>Diametru Soare</div><div class='dg-val'>1,392,700 km</div><div class='dg-sub'>De 109x Pamantul</div></div><div class='dg-item'><div class='dg-label'>Distanta Soare-Neptun</div><div class='dg-val'>30.07 UA</div><div class='dg-sub'>~4.5 miliarde km</div></div><div class='dg-item'><div class='dg-label'>Viteza orbitala Pamant</div><div class='dg-val'>29.8 km/s</div><div class='dg-sub'>107,280 km/h</div></div><div class='dg-item'><div class='dg-label'>Norul Oort</div><div class='dg-val'>~50,000 UA</div><div class='dg-sub'>Limita sistemului</div></div></div><h3><i class='fas fa-history'></i> Formarea sistemului</h3><p>Sistemul Solar s-a format acum <strong>4.57 miliarde de ani</strong> prin contractia gravitationala a unui nor molecular de gaz si praf (nebuloasa solara). Materialul s-a adunat formand <em>Protosoarele</em>, iar restul a format un disc de acretie din care s-au format planetele.</p><div class='info-box ib-cyan'><div class='ib-title'>Explorare umana</div><p>Sonda <strong>Voyager 1</strong> (lansata 1977) a depasit heliosfera in 2012 si se afla acum in spatiu interstelar la >24 miliarde km. <strong>New Horizons</strong> a fotografiat Pluto in 2015. <strong>Parker Solar Probe</strong> zboara prin coroana Soarelui.</p></div>"
  },
  {
    id: 2, title: 'Soarele', icon: 'fa-sun', diff: 'easy', readTime: 11,
    desc: 'Steaua care ne da viata - structura, cicluri solare si efectele asupra Pamantului',
    keyFacts: [
      { l: 'Temperatura nucleu', v: '15 milioane °C' },
      { l: 'Temperatura suprafata', v: '~5,500 °C' },
      { l: 'Temperatura coroana', v: '>1,000,000 °C' },
      { l: 'Masa', v: '1.989 × 10^30 kg' },
      { l: 'Compozitie', v: '75% H, 25% He' },
      { l: 'Durata de viata', v: '~10 miliarde ani' }
    ],
    content: "<h3><i class='fas fa-sun'></i> O stea obisnuita</h3><p>Soarele este o <strong>stea de tip G2V</strong> (pitice galbena), o stea de secventa principala de marime medie. Contine <em>99.86%</em> din toata masa Sistemului Solar. In fiecare secunda transforma 600 de milioane de tone de hidrogen in heliu prin fuziune nucleara.</p><div class='info-box ib-gold'><div class='ib-title'>Fuziunea nucleara - sursa energiei</div><p>La 15 milioane de grade Celsius, 4 nuclei de hidrogen (protoni) fuzioneaza in 1 nucleu de heliu, eliberand energie conform formulei lui Einstein: E=mc². In fiecare secunda, 4 milioane de tone de masa sunt convertite in energie pura.</p></div><h3><i class='fas fa-layer-group'></i> Structura stratificata</h3><div class='data-grid'><div class='dg-item'><div class='dg-label'>Nucleu</div><div class='dg-val'>0-25% R</div><div class='dg-sub'>15M °C, fuziune nucleara</div></div><div class='dg-item'><div class='dg-label'>Zona radiativa</div><div class='dg-val'>25-70% R</div><div class='dg-sub'>Fotonii: 100.000 ani</div></div><div class='dg-item'><div class='dg-label'>Zona convectiva</div><div class='dg-val'>70-100% R</div><div class='dg-sub'>Celule de convectie</div></div><div class='dg-item'><div class='dg-label'>Fotosfera</div><div class='dg-val'>Suprafata</div><div class='dg-sub'>5,500 °C, vizibila</div></div></div><h3><i class='fas fa-bolt'></i> Activitate solara</h3><p>Soarele are un <strong>ciclu de activitate de ~11 ani</strong>. In perioadele de maxim solar apar mai multe pete solare, eruptii si expulzii de masa coronala. Acestea pot afecta satelitii, GPS-ul si retelele electrice de pe Pamant.</p><div class='info-box ib-red'><div class='ib-title'>Atentie: Furtuni solare</div><p>O <strong>expulsie de masa coronala (CME)</strong> puternica poate induce curentii electrici uriasi in retelele de distributie. Furtuna <em>Carrington (1859)</em> a distrus linii telegrafice. O astfel de furtuna azi ar putea cauza pierderi de trilioane de dolari.</p></div><div class='tl-mini'><div class='tl-item'><span class='tl-year'>Acum 4.6 mld ani</span><div class='tl-text'>Formarea Soarelui din nebulosa solara</div></div><div class='tl-item'><span class='tl-year'>Acum 5 mld ani</span><div class='tl-text'>Soarele va deveni giganta rosie</div></div><div class='tl-item'><span class='tl-year'>Acum 7.5 mld ani</span><div class='tl-text'>Soarele va inghiti Pamantul</div></div><div class='tl-item'><span class='tl-year'>Acum 8 mld ani</span><div class='tl-text'>Soarele va deveni o pitica alba</div></div></div>"
  },
  {
    id: 3, title: 'Planetele Terestre', icon: 'fa-globe', diff: 'med', readTime: 12,
    desc: 'Mercur, Venus, Pamant si Marte - lumi stancoase cu personalitati unice',
    keyFacts: [
      { l: 'Numar planete', v: '4 (Mercur - Marte)' },
      { l: 'Cea mai fierbinte', v: 'Venus: 470 °C' },
      { l: 'Cea mai rece', v: 'Marte: -125 °C' },
      { l: 'Singura cu viata', v: 'Pamantul' },
      { l: 'Distante', v: '0.39 - 1.52 UA' },
      { l: 'Nuclee', v: 'Fier + nichel' }
    ],
    content: "<h3><i class='fas fa-mountain'></i> Ce sunt planetele terestre?</h3><p>Planetele terestre (sau <em>stancoase</em>) sunt primele 4 planete ale Sistemului Solar. Sunt mici, dense, cu suprafata solida si nuclee metalice. Se formeaza mai aproape de Soare, acolo unde temperatura ridicata a permis condensarea rocilor si metalelor, dar nu a gazelor usoare.</p><table class='comp-table'><tr><th>Planeta</th><th>Diametru</th><th>Temperatura</th><th>Atm.</th></tr><tr><td>Mercur</td><td>4,879 km</td><td>-180 / +430 °C</td><td>Inexistenta</td></tr><tr><td>Venus</td><td>12,104 km</td><td>+470 °C</td><td>CO2 (92 atm)</td></tr><tr><td>Pamant</td><td>12,742 km</td><td>-88 / +58 °C</td><td>N2 + O2</td></tr><tr><td>Marte</td><td>6,779 km</td><td>-125 / +20 °C</td><td>CO2 (0.01 atm)</td></tr></table><h3><i class='fas fa-temperature-full'></i> Venus - paradoxul gemenei Pamantului</h3><p>Venus are dimensiuni aproape identice cu Pamantul, dar este <strong>cea mai fierbinte planeta</strong> din Sistemul Solar - mai calda decat Mercur, desi e mai departe de Soare! Motivul: un efect de sera extrem cauzat de atmosfera groasa de CO2. Presiunea la suprafata echivaleaza cu adancimea de 900m in ocean.</p><div class='info-box ib-green'><div class='ib-title'>Pamantul - planeta speciala</div><p>Pamantul este singura planeta cu <strong>apa lichida</strong> la suprafata, <strong>viata confirmata</strong> si o <strong>tectonica a placilor</strong> activa. Luna stabilizeaza axa la 23.5 grade - fara ea, oscilatii haotice ar face clima impredictibila pentru viata complexa.</p></div><h3><i class='fas fa-mars'></i> Marte - urmatoarea frontiera</h3><p>Marte gazduieste <strong>Olympus Mons</strong> - cel mai inalt vulcan din Sistemul Solar (27 km, de 3x Everest) si <strong>Valles Marineris</strong> - un canion de 4,000 km lungime. Misiunile Curiosity si Perseverance cauta urme de viata fosila in sedimentele lacustre antice.</p>"
  },
  {
    id: 4, title: 'Gigantii Gazosi', icon: 'fa-circle-dot', diff: 'med', readTime: 12,
    desc: 'Jupiter, Saturn, Uranus si Neptun - colosii Sistemului Solar cu inele si luni fascinante',
    keyFacts: [
      { l: 'Cel mai mare', v: 'Jupiter: 142,984 km' },
      { l: 'Cel mai mic gigant', v: 'Neptun: 49,244 km' },
      { l: 'Inele celebre', v: 'Saturn (282,000 km)' },
      { l: 'Viteza vant Neptun', v: '2,100 km/h' },
      { l: 'Luni totale', v: '>140 sateliti' },
      { l: 'Ganymede', v: 'Mai mare ca Mercur' }
    ],
    content: "<h3><i class='fas fa-expand'></i> Giganti fara suprafata</h3><p>Planetele exterioare nu au o suprafata solida distincta. Sunt formate predominant din hidrogen si heliu cu nuclee compacte de roca si metal. Sunt clasificate in <em>giganti gazosi</em> (Jupiter, Saturn) si <em>giganti de gheata</em> (Uranus, Neptun).</p><div class='info-box ib-purple'><div class='ib-title'>Jupiter - parintele planetelor</div><p>Jupiter este de <strong>2.5x mai masiv decat toate celelalte planete la un loc</strong>. Campul sau gravitational a protejat Pamantul de impacturi de comete timp de miliarde de ani. Marea Pata Rosie este o furtuna activa de peste 400 de ani, cat doua Pamanturi in diametru.</p></div><h3><i class='fas fa-circle-notch'></i> Saturn si inelele sale</h3><p>Inelele lui Saturn sunt formate din <strong>miliarde de particule de gheata si roca</strong>, de la microni la metri. Se intind pe 282,000 km dar au doar 10-20 metri grosime. Sunt vizibile cu un binoclu de pe Pamant. Titan, luna lui Saturn, are o atmosfera groasa de azot si lacuri de metan lichid.</p><div class='data-grid'><div class='dg-item'><div class='dg-label'>Jupiter - luni</div><div class='dg-val'>95</div><div class='dg-sub'>Io, Europa, Ganymede, Callisto</div></div><div class='dg-item'><div class='dg-label'>Saturn - luni</div><div class='dg-val'>146</div><div class='dg-sub'>Titan, Enceladus, Mimas</div></div><div class='dg-item'><div class='dg-label'>Uranus - inclinatie</div><div class='dg-val'>97.77°</div><div class='dg-sub'>Se rostogoleste pe orbita</div></div><div class='dg-item'><div class='dg-label'>Neptun - vant</div><div class='dg-val'>2,100 km/h</div><div class='dg-sub'>Cele mai rapide din Sist. Solar</div></div></div><h3><i class='fas fa-snowflake'></i> Gigantii de gheata</h3><p><strong>Uranus</strong> este inclinat la aproape 98 grade - se crede ca a suferit o coliziune masiva in trecut. Culoarea sa turcoaz provine din metanul din atmosfera care absoarbe lumina rosie. <strong>Neptun</strong> are cea mai activa atmosfera - furtuna Marea Pata Intunecata si vanturi de 2100 km/h.</p><div class='info-box ib-cyan'><div class='ib-title'>Europa - candidata la viata</div><p>Luna <strong>Europa</strong> a lui Jupiter are un ocean de apa lichida sub o crusta de gheata de 10-30 km. Misiunea <em>Europa Clipper</em> (lansata 2024) va investiga daca acest ocean ascunde viata.</p></div>"
  },
  {
    id: 5, title: 'Centura de Asteroizi', icon: 'fa-meteor', diff: 'med', readTime: 9,
    desc: 'Roci cosmice intre Marte si Jupiter - resturi din formarea Sistemului Solar',
    keyFacts: [
      { l: 'Locatie', v: '2.1 - 3.3 UA' },
      { l: 'Asterozi catalogati', v: '>600,000' },
      { l: 'Cel mai mare', v: 'Ceres (~940 km)' },
      { l: 'Masa totala', v: '< 4% din Luna' },
      { l: 'Tipuri principale', v: 'C, S, M' },
      { l: 'Origine', v: 'Disc protoplanetary' }
    ],
    content: "<h3><i class='fas fa-meteor'></i> Ce este centura de asteroizi?</h3><p>Centura principala de asteroizi se afla intre orbitele lui Marte si Jupiter, la 2.1-3.3 UA de Soare. Contine milioane de corpuri stancoase - resturi din formarea Sistemului Solar care nu au putut forma o planeta din cauza perturbatiei gravitationale a lui Jupiter.</p><div class='info-box ib-gold'><div class='ib-title'>Mitul centurii dense</div><p>Spre deosebire de filmele SF, centura de asteroizi este extrem de rara. Daca ai zbura prin ea, probabilitatea de a lovi ceva este extrem de mica. Sondele Voyager, Pioneer si New Horizons au traversat-o fara incidente. Spatiul mediu intre asteroizi este de sute de mii de km.</p></div><h3><i class='fas fa-layer-group'></i> Tipuri de asteroizi</h3><table class='comp-table'><tr><th>Tip</th><th>%</th><th>Compozitie</th><th>Locatie</th></tr><tr><td>Carbonacei (C)</td><td>75%</td><td>Carbon, silicat</td><td>Marginea centurii</td></tr><tr><td>Silicati (S)</td><td>17%</td><td>Roca, nichel, fier</td><td>Centrul centurii</td></tr><tr><td>Metalici (M)</td><td>5%</td><td>Nichel, fier pur</td><td>Centrul centurii</td></tr></table><h3><i class='fas fa-star'></i> Ceres - planeta pitica</h3><p><strong>Ceres</strong> este cel mai mare corp din centura (~940 km diametru) si singurul clasificat planeta pitica. Sonda <em>Dawn</em> a orbitat Ceres in 2015-2018 si a descoperit pete luminoase misterioase - depozite de saruri carbonatice din activitate hidrotermala veche.</p><div class='info-box ib-purple'><div class='ib-title'>Asteroizi potentiali periculosi</div><p>NASA monitorizeaza <strong>~2300 de asteroizi potentiali periculosi</strong> (PHA) cu diametrului > 140m care se apropie de Pamant. Misiunea DART (2022) a reusit prima deviatie artificiala a unui asteroid, schimband orbita lui Dimorphos - o demonstratie a apararii planetare.</p></div>"
  },
  {
    id: 6, title: 'Gaurile Negre', icon: 'fa-circle', diff: 'hard', readTime: 14,
    desc: 'Monstri gravitationali ai cosmosului - de la formarea lor pana la primele imagini',
    keyFacts: [
      { l: 'Prima imagine', v: 'M87* (2019, EHT)' },
      { l: 'Sgr A*', v: '4.3 milioane M☉' },
      { l: 'TON 618', v: '66 miliarde M☉' },
      { l: 'Raza Schwarzschild', v: '3km per M☉' },
      { l: 'Viteza limita', v: 'c = 299,792 km/s' },
      { l: 'Radiatie Hawking', v: 'Teoretic nedetectata' }
    ],
    content: "<h3><i class='fas fa-circle'></i> Ce este o gaura neagra?</h3><p>O gaura neagra este o regiune a spatiu-timpului cu o <strong>gravitatie atat de intensa</strong> incat nimic - nici macar lumina - nu poate scapa dincolo de <em>orizontul evenimentelor</em>. Se formeaza prin colapsul gravitational al stelelor masive (>20 mase solare) la sfarsitul vietii lor.</p><div class='info-box ib-red'><div class='ib-title'>Orizontul evenimentelor - punctul de neintoarcere</div><p>Orizontul evenimentelor nu este o suprafata fizica, ci o <strong>granita matematica</strong> dincolo de care viteza de scapare depaseste viteza luminii. <em>Raza Schwarzschild</em> pentru o gaura neagra de masa M este: r = 2GM/c². Pentru Soare: ~3 km. Pentru Pamant: ~9 mm.</p></div><h3><i class='fas fa-layer-group'></i> Tipuri de gauri negre</h3><div class='data-grid'><div class='dg-item'><div class='dg-label'>Stelare</div><div class='dg-val'>3-20 M☉</div><div class='dg-sub'>Din colapsul stelelor masive</div></div><div class='dg-item'><div class='dg-label'>Intermediare</div><div class='dg-val'>100-10k M☉</div><div class='dg-sub'>In roiuri globulare?</div></div><div class='dg-item'><div class='dg-label'>Supermasive</div><div class='dg-val'>Milioane-miliarde M☉</div><div class='dg-sub'>In centrul fiecarei galaxii</div></div><div class='dg-item'><div class='dg-label'>Primordiale</div><div class='dg-val'>Variate</div><div class='dg-sub'>Ipotetice, din Big Bang</div></div></div><h3><i class='fas fa-camera'></i> Prima fotografie a unei gauri negre</h3><p>In <strong>2019</strong>, colaborarea <em>Event Horizon Telescope (EHT)</em> - o retea globala de radiotelescop - a publicat prima imagine a umbrei gaurii negre din galaxia <strong>M87</strong> (55 milioane al, 6.5 miliarde M☉). In <strong>2022</strong> a urmat imaginea lui <em>Sgr A*</em>, gaura neagra din centrul Caii Lactee.</p><div class='info-box ib-purple'><div class='ib-title'>Paradoxul spaghettificarii si radiatia Hawking</div><p>Daca ai cadea intr-o gaura neagra, <strong>spaghettificarea</strong> ar intinde corpul tau in fire subtiri. Fizicianul Stephen Hawking a prezis teoretic ca gaurile negre emit incet <em>radiatie cuantica</em> (Radiatia Hawking) si se evaporeaza in miliarde de ani. Prea slaba pentru a fi detectata inca.</p></div>"
  },
  {
    id: 7, title: 'Galaxii', icon: 'fa-infinity', diff: 'med', readTime: 11,
    desc: 'Insule de stele in oceanul cosmic - tipuri, structura si coliziuni galactice',
    keyFacts: [
      { l: 'Galaxii observabile', v: '~2 trilioane' },
      { l: 'Calea Lactee', v: '100-400 mld stele' },
      { l: 'Diametru CL', v: '~100,000 ani-lumina' },
      { l: 'Andromeda', v: '2.537 milioane al' },
      { l: 'Viteza Andromeda', v: '110 km/s spre noi' },
      { l: 'Coliziune CL+Andromeda', v: '~4.5 mld ani' }
    ],
    content: "<h3><i class='fas fa-star'></i> Ce este o galaxie?</h3><p>O galaxie este un sistem masiv de <strong>stele, gaz, praf si materie intunecata</strong>, legate gravitational. Universul observabil contine aproximativ <em>2 trilioane de galaxii</em>. Calea Lactee - galaxia noastra - contine 100-400 miliarde de stele si are un diametru de ~100,000 ani-lumina.</p><table class='comp-table'><tr><th>Tip</th><th>Forma</th><th>Stele</th><th>Exemplu</th></tr><tr><td>Spiralate</td><td>Brate spiralate</td><td>Tinere si batrane</td><td>Calea Lactee, M31</td></tr><tr><td>Eliptice</td><td>Oval/sfera</td><td>Predominant batrane</td><td>M87, ESO 325-G004</td></tr><tr><td>Neregulate</td><td>Fara forma fixa</td><td>Formare activa</td><td>Norii lui Magellan</td></tr><tr><td>Lenticulare</td><td>Disc fara brate</td><td>Batrane, putin gaz</td><td>NGC 5866</td></tr></table><h3><i class='fas fa-map-marker-alt'></i> Pozitia noastra in Calea Lactee</h3><p>Sistemul Solar se afla in <strong>Bratul Orion</strong>, un brat minor al Caii Lactee, la ~27,000 de ani-lumina de centrul galactic. Ne rotim in jurul centrului cu ~230 km/s, completand o orbita in ~225-250 milioane de ani (un <em>an cosmic</em>). Ultima data cand Pamantul era pe aceasta pozitie existau dinozaurii!</p><div class='info-box ib-purple'><div class='ib-title'>Coliziunea Caii Lactee cu Andromeda</div><p>Galaxia Andromeda (M31) se apropie de Calea Lactee cu 110 km/s. In aproximativ <strong>4.5 miliarde de ani</strong>, cele doua galaxii se vor ciocni si vor fuziona intr-o galaxie eliptica numita uneori <em>Milkomeda</em>. Probabilitatea de coliziune stea-stea este minima datorita distantelor uriase, dar Sistemul Solar va fi probabil aruncat intr-o orbita diferita.</p></div>"
  },
  {
    id: 8, title: 'Big Bang-ul', icon: 'fa-bolt', diff: 'hard', readTime: 14,
    desc: 'Nasterea universului acum 13.8 miliarde de ani - dovezi, cronologie si intrebari deschise',
    keyFacts: [
      { l: 'Varsta universului', v: '13.8 miliarde ani' },
      { l: 'Temperatura CMB', v: '2.725 K (-270.4 °C)' },
      { l: 'Compozitie primara', v: '75% H, 25% He' },
      { l: 'Energie intunecata', v: '~68% din univers' },
      { l: 'Materie intunecata', v: '~27% din univers' },
      { l: 'Materie normala', v: 'doar ~5%' }
    ],
    content: "<h3><i class='fas fa-bolt'></i> Ce a fost Big Bang-ul?</h3><p>Big Bang-ul <strong>nu a fost o explozie in spatiu</strong>, ci o expansiune a spatiului insusi dintr-o stare de densitate si temperatura infinit de mare (singularitate). Nu exista un centru al expansiunii - fiecare punct din univers se indeparteaza de celelalte, ca punctele de pe un balon umflat.</p><div class='tl-mini'><div class='tl-item'><span class='tl-year'>t = 0</span><div class='tl-text'>Singularitatea - Big Bang. Timp, spatiu, energie incep sa existe.</div></div><div class='tl-item'><span class='tl-year'>t = 10^-35 s</span><div class='tl-text'>Inflatie cosmica exponentiala: universul se mareste de 10^78 ori</div></div><div class='tl-item'><span class='tl-year'>t = 3 min</span><div class='tl-text'>Nucleosinteza primordiale: H, D, He, Li se formeaza</div></div><div class='tl-item'><span class='tl-year'>t = 380,000 ani</span><div class='tl-text'>Recombinare: electronii se leaga de nuclei. Universul devine transparent. CMB emis.</div></div><div class='tl-item'><span class='tl-year'>t = 200 mil ani</span><div class='tl-text'>Epurarea intunericului: primele stele si galaxii se aprind</div></div><div class='tl-item'><span class='tl-year'>t = 9.2 mld ani</span><div class='tl-text'>Formarea Sistemului Solar</div></div><div class='tl-item'><span class='tl-year'>t = 13.8 mld ani</span><div class='tl-text'>Azi - acum citesti aceasta lectie!</div></div></div><h3><i class='fas fa-satellite-dish'></i> Dovezile observationale</h3><p>Teoria Big Bang este sustinuta de 3 dovezi independente majore care o confirma cu precizie remarcabila:</p><div class='info-box ib-cyan'><div class='ib-title'>1. Radiatia Cosmica de Fond (CMB)</div><p>Descoperita accidental in 1965 de Penzias si Wilson (Nobel 1978). Este <em>ecoul luminii Big Bang-ului</em> - fotonii emisi cand universul a devenit transparent. Astazi are temperatura uniforma de <strong>2.725 K</strong> cu variatii de numai 1/100,000 de grad.</p></div><div class='info-box ib-gold'><div class='ib-title'>2. Legea lui Hubble - Expansiunea Universului</div><p>In 1929, Edwin Hubble a demonstrat ca <strong>galaxiile se indeparteaza proportional cu distanta</strong> (v = H0 x d). Universul se extinde. Proiectand inapoi in timp, toate galaxiile convergeau intr-un punct cu ~13.8 miliarde ani in urma.</p></div><div class='info-box ib-green'><div class='ib-title'>3. Abundenta elementelor usoare</div><p>Big Bang a prezis ca universul primordial trebuie sa contina <strong>75% hidrogen, 25% heliu</strong> si cantitati mici de litiu - exact proportiile masurate in stele batrane si nori interstelar necontaminati.</p></div>"
  },
  {
    id: 9, title: 'Exoplanete', icon: 'fa-earth-europe', diff: 'med', readTime: 11,
    desc: 'Lumi dincolo de Sistemul Solar - descoperire, metode si cautarea vietii',
    keyFacts: [
      { l: 'Confirmate (2024)', v: '>5,600 exoplanete' },
      { l: 'Prima confirmata', v: '51 Peg b (1995)' },
      { l: 'Metoda principala', v: 'Tranzit (Kepler/TESS)' },
      { l: 'Cea mai apropiata', v: 'Proxima Cen b (4.2 al)' },
      { l: 'TRAPPIST-1', v: '7 planete, 3 locuibile' },
      { l: 'Estimare CL', v: '~100 mld planete' }
    ],
    content: "<h3><i class='fas fa-search'></i> Cum descoperim exoplanete?</h3><p>O exoplaneta este orice planeta care orbiteaza alta stea decat Soarele. Prima exoplaneta confirmata in jurul unei stele de tip solar a fost <strong>51 Pegasi b</strong> (1995, Mayor si Queloz - Nobel 2019). Azi cunoastem >5,600 de exoplanete confirmate si mii de candidati.</p><table class='comp-table'><tr><th>Metoda</th><th>Principiu</th><th>Planete gasite</th></tr><tr><td>Tranzit</td><td>Planeta blocheaza partial lumina stelei</td><td>>4,000 (Kepler/TESS)</td></tr><tr><td>Viteza radiala</td><td>Planeta oscileaza gravitational steaua</td><td>>1,000</td></tr><tr><td>Imagistica directa</td><td>Fotografie directa a planetei</td><td>~60</td></tr><tr><td>Microlentile</td><td>Amplificarea gravitationala a luminii</td><td>~200</td></tr></table><h3><i class='fas fa-temperature-half'></i> Zona locuibila - Goldilocks Zone</h3><p>Zona locuibila (<em>habitable zone</em>) este distanta de la o stea la care temperatura permite existenta apei lichide la suprafata unei planete. Nu e prea cald, nu e prea rece - ca in povestea cu Goldilocks.</p><div class='info-box ib-green'><div class='ib-title'>TRAPPIST-1 - cel mai interesant sistem</div><p>La <strong>39 de ani-lumina</strong>, stea ultrarece TRAPPIST-1 are 7 planete de marimea Pamantului. <strong>Planetele e, f, g</strong> se afla in zona locuibila. Telescopul James Webb a inceput analiza atmosferelor lor in 2023.</p></div><h3><i class='fas fa-star'></i> Exoplanete celebre</h3><div class='data-grid'><div class='dg-item'><div class='dg-label'>Proxima Cen b</div><div class='dg-val'>4.24 al</div><div class='dg-sub'>Cea mai apropiata exoplaneta</div></div><div class='dg-item'><div class='dg-label'>Kepler-452b</div><div class='dg-val'>1,400 al</div><div class='dg-sub'>&ldquo;Varul Pamantului&rdquo;</div></div><div class='dg-item'><div class='dg-label'>HD 209458b</div><div class='dg-val'>150 al</div><div class='dg-sub'>Prima cu atmosfera analizata</div></div><div class='dg-item'><div class='dg-label'>55 Cancri e</div><div class='dg-val'>41 al</div><div class='dg-sub'>Posibil acoperita de lava</div></div></div>"
  },
  {
    id: 10, title: 'Stele si Constelatii', icon: 'fa-star', diff: 'med', readTime: 12,
    desc: 'Ciclul vietii stelelor, clasificare spectrala si cele 88 de constelatii oficiale',
    keyFacts: [
      { l: 'Cea mai apropiata', v: 'Proxima Cen (4.24 al)' },
      { l: 'Cea mai stralucitoare', v: 'Sirius (-1.46 mag)' },
      { l: 'Constelatii oficiale', v: '88 (UAI)' },
      { l: 'Clasificare', v: 'O-B-A-F-G-K-M' },
      { l: 'Soarele', v: 'Tip G2V' },
      { l: 'Supernova', v: 'La >8 mase solare' }
    ],
    content: "<h3><i class='fas fa-star'></i> Clasificarea stelelor</h3><p>Stelele sunt clasificate dupa temperatura suprafetei in <strong>7 clase spectrale</strong>: O (albastre, >30,000K), B (albastre-albe, 10-30k K), A (albe, 7.5-10k K), F (galben-albe, 6-7.5k K), G (galbene, 5.2-6k K), K (portocalii, 3.7-5.2k K), M (rosii, <3.7k K). Mnemonic: <em>Oh Be A Fine Girl, Kiss Me</em>.</p><div class='info-box ib-gold'><div class='ib-title'>Marimea aparenta si absoluta</div><p><strong>Marimea aparenta</strong> masoara cat de stralucitoare pare o stea de pe Pamant. Sirius (-1.46) este cea mai stralucitoare. <strong>Marimea absoluta</strong> masoara luminozitatea intrinseca la 10 parseci distanta. Scara este logaritmica: diferenta de 5 magnitudini = factor 100 in luminozitate.</p></div><h3><i class='fas fa-sync'></i> Ciclul vietii unei stele</h3><div class='tl-mini'><div class='tl-item'><span class='tl-year'>1. Nebuloasa</span><div class='tl-text'>Nor molecular de gaz si praf se contracta gravitational</div></div><div class='tl-item'><span class='tl-year'>2. Protostea</span><div class='tl-text'>Temperatura creste. La 15M °C incepe fuziunea H → He</div></div><div class='tl-item'><span class='tl-year'>3. Secventa principala</span><div class='tl-text'>Stea stabila miliarde de ani (Soarele e in aceasta faza)</div></div><div class='tl-item'><span class='tl-year'>4A. Stele mici/medii</span><div class='tl-text'>Giganta rosie → Nebuloasa planetara → Pitica alba → Pitica neagra</div></div><div class='tl-item'><span class='tl-year'>4B. Stele masive (>8 M☉)</span><div class='tl-text'>Supergiganta → Supernova → Stea neutronica sau Gaura neagra</div></div></div><h3><i class='fas fa-compass'></i> Constelatii - harti ale cerului</h3><p>Cele <strong>88 de constelatii oficiale</strong> (stabilite de UAI in 1930) impart cerul in regiuni. Nu sunt grupuri fizice de stele - stelele unui aceeasi constelatii pot fi la distante foarte diferite. <strong>Orion</strong> (Centura cu 3 stele), <strong>Ursa Major</strong> (Carul Mare), <strong>Cassiopeia</strong> (forma de W) sunt usor de recunoscut.</p><div class='info-box ib-cyan'><div class='ib-title'>Supernovele - fabricile de elemente</div><p>Elementele mai grele decat fierul (aur, argint, platina, uraniu) se sintetizeaza numai in <strong>supernovele si fuziunile de stele neutronice</strong>. Aurul din bijuteriile tale a fost creat intr-o explozie stelara de miliarde de ani in urma. Suntem cu adevarat <em>praf de stele</em>.</p></div>"
  },
  {
    id: 11, title: 'Luna', icon: 'fa-moon', diff: 'easy', readTime: 10,
    desc: 'Singurul satelit natural al Pamantului - origini, faze si explorarea umana',
    keyFacts: [
      { l: 'Distanta medie', v: '384,400 km' },
      { l: 'Diametru', v: '3,474 km (1/4 Pamant)' },
      { l: 'Faze lunare', v: 'Ciclu de 29.5 zile' },
      { l: 'Origine', v: 'Ipoteza Theia (4.5 mld ani)' },
      { l: 'Indepartare', v: '3.8 cm/an' },
      { l: 'Apollo 11', v: '20 iulie 1969' }
    ],
    content: "<h3><i class='fas fa-moon'></i> Originea Lunii</h3><p>Conform teoriei dominante, Luna s-a format acum <strong>4.5 miliarde de ani</strong> dintr-o coliziune titanica intre Pamantul tanar si un corp de marimea lui Marte numit <em>Theia</em>. Fragmentele aruncate in orbita s-au adunat gravitational formand Luna. Aceasta explica de ce Luna are un nucleu mic si densitate mai mica decat Pamantul.</p><div class='info-box ib-purple'><div class='ib-title'>Luna stabilizeaza Pamantul</div><p>Luna stabilizeaza axa de rotatie a Pamantului la ~23.5 grade. Fara aceasta stabilizare, axa ar oscila haotic intre 0 si 85 de grade in milioane de ani, facand clima impredictibila pentru viata complexa. Luna este de 5x mai mare relativ la planeta sa decat orice alt satelit din Sistemul Solar.</p></div><h3><i class='fas fa-circle-half-stroke'></i> Fazele Lunii</h3><div class='data-grid'><div class='dg-item'><div class='dg-label'>Luna Noua</div><div class='dg-val'>Invizibila</div><div class='dg-sub'>Luna intre Soare si Pamant</div></div><div class='dg-item'><div class='dg-label'>Primul Patrar</div><div class='dg-val'>Jumatate luminata</div><div class='dg-sub'>7.4 zile dupa Luna Noua</div></div><div class='dg-item'><div class='dg-label'>Luna Plina</div><div class='dg-val'>Complet iluminata</div><div class='dg-sub'>14.8 zile dupa Luna Noua</div></div><div class='dg-item'><div class='dg-label'>Ultimul Patrar</div><div class='dg-val'>Jumatate luminata</div><div class='dg-sub'>22.1 zile dupa Luna Noua</div></div></div><h3><i class='fas fa-user-astronaut'></i> Programul Apollo</h3><p>Intre <strong>1969 si 1972</strong>, 12 astronauti au pasit pe Luna in cadrul programului Apollo. Apollo 11 (Neil Armstrong si Buzz Aldrin) a realizat prima aselenizare pe 20 iulie 1969. Au fost adusi 382 kg de roci lunare. Misiunile au pus retele de seismografe si retroreflectori laser care masoara si azi distanta Pamant-Luna cu precizie de milimetri.</p><div class='info-box ib-cyan'><div class='ib-title'>Programul Artemis - revenirea la Luna</div><p>NASA lucreaza la <strong>programul Artemis</strong> pentru a reveni la Luna si a stabili o prezenta umana durabila. Artemis I (2022) a testat racheta SLS fara echipaj. Urmata de misiuni cu echipaj, scopul este construirea <em>Lunar Gateway</em> - o statie spatiala orbitala lunara - si baze permanente pe suprafata, pregatind misiunile spre Marte.</p></div>"
  },
  {
    id: 12, title: 'Explorarea Spatiala', icon: 'fa-rocket', diff: 'med', readTime: 13,
    desc: 'De la Sputnik la James Webb - istoria cuceririi spatiului si viitorul explorarilor',
    keyFacts: [
      { l: 'Sputnik 1', v: '4 oct. 1957 (URSS)' },
      { l: 'Primul om in spatiu', v: 'Gagarin, 12 apr. 1961' },
      { l: 'Prima Luna', v: 'Apollo 11, 1969' },
      { l: 'ISS', v: 'Functionala din 2000' },
      { l: 'James Webb', v: 'Lansat dec. 2021' },
      { l: 'Perseverance pe Marte', v: 'Feb. 2021' }
    ],
    content: "<h3><i class='fas fa-satellite'></i> Era spatiala - inceputurile</h3><p>Cursa spatiala intre SUA si URSS a accelerat enorm progresul tehnologic. <strong>Sputnik 1</strong> (4 oct 1957) a fost primul satelit artificial, dovedind ca un obiect poate orbita Pamantul. Un an mai tarziu, <strong>Sputnik 2</strong> il lansa in orbita pe Laika - primul vietator in spatiu.</p><div class='tl-mini'><div class='tl-item'><span class='tl-year'>1957</span><div class='tl-text'>Sputnik 1 - primul satelit artificial. Laika - prima fiinta in spatiu</div></div><div class='tl-item'><span class='tl-year'>1961</span><div class='tl-text'>Yuri Gagarin - primul om in spatiu (108 minute, 1 orbita)</div></div><div class='tl-item'><span class='tl-year'>1969</span><div class='tl-text'>Apollo 11 - prima aselenizare umana (Armstrong, Aldrin, Collins)</div></div><div class='tl-item'><span class='tl-year'>1977</span><div class='tl-text'>Voyager 1 si 2 lansate spre planetele exterioare</div></div><div class='tl-item'><span class='tl-year'>1990</span><div class='tl-text'>Telescopul Spatial Hubble lansat, revolutioneaza astronomia</div></div><div class='tl-item'><span class='tl-year'>2000</span><div class='tl-text'>ISS devine functionala cu echipaj permanent</div></div><div class='tl-item'><span class='tl-year'>2021</span><div class='tl-text'>James Webb Space Telescope si Perseverance pe Marte</div></div></div><div class='info-box ib-gold'><div class='ib-title'>James Webb Space Telescope</div><p>Lansat pe 25 decembrie 2021, <strong>JWST</strong> este cel mai avansat telescop stiintific construit vreodata. Opereaza la -233°C, in punctul Lagrange L2 (1.5 milioane km de Pamant). Poate detecta caldura unui bondar la Luna si a fotografiat galaxii existente la 320 milioane de ani dupa Big Bang. A revolutionat studiul exoplanetelor si cosmologiei.</p></div><h3><i class='fas fa-mars'></i> Viitorul explorarii spatiale</h3><div class='data-grid'><div class='dg-item'><div class='dg-label'>Artemis (NASA)</div><div class='dg-val'>2026+</div><div class='dg-sub'>Baza lunara permanenta</div></div><div class='dg-item'><div class='dg-label'>Mars (NASA/SpaceX)</div><div class='dg-val'>~2035-2040</div><div class='dg-sub'>Prima misiune umana pe Marte</div></div><div class='dg-item'><div class='dg-label'>Europa Clipper</div><div class='dg-val'>2030</div><div class='dg-sub'>Cauta viata sub gheata Europei</div></div><div class='dg-item'><div class='dg-label'>SETI / Technosemnaturi</div><div class='dg-val'>Continuu</div><div class='dg-sub'>Cautarea vietii inteligente</div></div></div><div class='info-box ib-purple'><div class='ib-title'>Paradoxul lui Fermi - unde sunt toti?</div><p>Daca viata extraterestra inteligenta este probabila statistic, <strong>de ce nu am detectat-o inca?</strong> Poate civilizatiile se autodistrugu, poate comunicarea e imposibila la distante cosmice, poate suntem unici sau intr-un <em>zoo galactic</em>. Raspunsul la aceasta intrebare este una din cele mai mari mistere ale stiintei.</p></div>"
  }
];

// ===== QUIZ 54(intrebari)=====
const QUIZ_Q = [

  // ── SISTEMUL SOLAR (Lectia 1) ──
  {
    q: "Care este cea mai apropiata stea de Soare?",
    opts: ["Alpha Centauri A", "Proxima Centauri", "Sirius", "Betelgeuse"], c: 1,
    exp: "Proxima Centauri este la 4.24 ani-lumina de Soare, face parte din sistemul triplu Alpha Centauri. Sirius este cea mai stralucitoare stea pe cerul noptii, dar se afla la 8.6 ani-lumina."
  },

  {
    q: "Cate planete are Sistemul Solar conform definitiei oficiale UAI din 2006?",
    opts: ["7", "8", "9", "10"], c: 1,
    exp: "In 2006, UAI a redefinit planeta, excludand Pluto (reclasificat planeta pitica). Sistemul Solar are 8 planete: Mercur, Venus, Pamant, Marte, Jupiter, Saturn, Uranus, Neptun."
  },

  {
    q: "Cat reprezinta masa Soarelui din totalul Sistemului Solar?",
    opts: ["75%", "86%", "99.86%", "50%"], c: 2,
    exp: "Soarele contine 99.86% din toata masa Sistemului Solar. Jupiter detine cea mai mare parte din restul de 0.14%. Aceasta dominanta gravitationala determina orbitele tuturor corpurilor."
  },

  {
    q: "Ce este Norul Oort?",
    opts: ["Centura de asteroizi intre Marte si Jupiter", "Sfera de comete inghetate la 2000-100,000 UA", "Atmosfera exterioara a Soarelui", "O nebuloasa planetara"], c: 1,
    exp: "Norul Oort este o sfera de miliarde de nuclee de comete la 2,000-100,000 UA de Soare — limita gravitationala a Sistemului Solar. Cometele cu perioada lunga vin de acolo. Nu a fost observat direct, dar existenta sa e dedusa din traiectoriile cometelor."
  },

  {
    q: "La ce distanta se afla Pamantul de Soare?",
    opts: ["100 milioane km", "149.6 milioane km (1 UA)", "200 milioane km", "50 milioane km"], c: 1,
    exp: "Pamantul se afla la 149.6 milioane km de Soare, distanta definita ca 1 Unitate Astronomica (UA). Lumina parcurge aceasta distanta in aproximativ 8 minute si 20 de secunde."
  },

  {
    q: "Ce este centura Kuiper?",
    opts: ["Centura de asteroizi intre Marte si Jupiter", "Zona de obiecte inghetate dincolo de orbita lui Neptun", "Norul Oort interior", "O regiune a spatiului interstelar"], c: 1,
    exp: "Centura Kuiper se intinde de la ~30 la ~50 UA de Soare, dincolo de orbita lui Neptun. Contine mii de obiecte inghetate — inclusiv Pluto. Sonda New Horizons a fotografiat Pluto (2015) si Arrokoth (2019)."
  },

  // ── SOARELE (Lectia 2) ──
  {
    q: "Ce tip de stea este Soarele?",
    opts: ["Pitica rosie (tip M)", "Pitica galbena (tip G2V)", "Giganta albastra (tip O)", "Pitica alba"], c: 1,
    exp: "Soarele este o stea de tip G2V — o pitica galbena de secventa principala. Temperatura suprafetei este de ~5,500 C. Are inca aproximativ 5 miliarde de ani de combustibil de hidrogen."
  },

  {
    q: "Ce temperatura are nucleul Soarelui?",
    opts: ["1 milion grade C", "5,500 grade C", "15 milioane grade C", "100 milioane grade C"], c: 2,
    exp: "Nucleul Soarelui are temperatura de ~15 milioane grade Celsius, suficienta pentru fuziunea nucleara a hidrogenului in heliu. La suprafata (fotosfera) temperatura scade la ~5,500 C, iar coroana ajunge paradoxal la peste 1 milion C."
  },

  {
    q: "Ce fenomen cauzeaza aurorele boreale?",
    opts: ["Radiatia cosmica", "Vantul solar interactionand cu campul magnetic al Pamantului", "Campul magnetic al Lunii", "Eruptii vulcanice subacvatice"], c: 1,
    exp: "Particulele incarcate din vantul solar (electroni si protoni) sunt captate de campul magnetic terestru si ghidate spre poli, unde ciocnindu-se cu atmosfera emit lumina colorata — aurora boreala (nord) si australa (sud)."
  },

  {
    q: "Cat dureaza un ciclu de activitate solara?",
    opts: ["5 ani", "11 ani", "22 ani", "100 ani"], c: 1,
    exp: "Ciclul de activitate solara (numar de pete solare, eruptii) are o durata de ~11 ani. Ciclul magnetic complet dureaza 22 ani (polaritatea se inverseaza la fiecare 11 ani). Eruptiile solare puternice pot afecta satelitii si retelele electrice."
  },

  // ── PLANETELE TERESTRE (Lectia 3) ──
  {
    q: "Care este cea mai fierbinte planeta din Sistemul Solar si de ce?",
    opts: ["Mercur — cel mai aproape de Soare", "Venus — efect de sera extrem", "Marte — eruptii vulcanice", "Jupiter — caldura interna"], c: 1,
    exp: "Venus are temperatura medie de 470 C datorita efectului de sera extrem al atmosferei groase de CO2 la 92 atm. Mercur, desi mai aproape de Soare, nu are atmosfera si se raceste noaptea la -180 C."
  },

  {
    q: "Care dintre planetele terestre nu are sateliti naturali?",
    opts: ["Pamantul", "Marte", "Venus", "Niciuna — toate au luni"], c: 2,
    exp: "Venus si Mercur nu au sateliti naturali. Pamantul are Luna, iar Marte are doua luni mici — Phobos si Deimos — probabil asteroizi capturati gravitational."
  },

  {
    q: "Ce face Pamantul unic printre planetele terestre?",
    opts: ["Este cel mai mare", "Este singurul cu apa lichida la suprafata si viata confirmata", "Are cei mai multi sateliti", "Are cele mai mari vulcani"], c: 1,
    exp: "Pamantul este singurul cu apa lichida stabila la suprafata, viata confirmata si tectonica a placilor activa. Luna stabilizeaza axa la 23.5 grade — fara ea, oscilatii haotice ar face clima impredictibila pentru viata complexa."
  },

  {
    q: "Ce este cel mai inalt vulcan din Sistemul Solar si unde se afla?",
    opts: ["Mauna Kea pe Pamant", "Olympus Mons pe Marte", "Maxwell Montes pe Venus", "Rheasilvia pe Vesta"], c: 1,
    exp: "Olympus Mons pe Marte este cel mai inalt vulcan din Sistemul Solar — 27 km inaltime (de 3 ori Everest) si 600 km diametru. Pe Marte nu exista tectonica a placilor, asa ca magma s-a acumulat in acelasi loc milioane de ani."
  },

  // ── GIGANTII GAZOSI (Lectia 4) ──
  {
    q: "Care planeta are densitate mai mica decat a apei?",
    opts: ["Jupiter", "Saturn", "Uranus", "Neptun"], c: 1,
    exp: "Saturn are densitatea medie de 0.687 g/cm3, mai mica decat a apei (1 g/cm3). Teoretic, daca ar exista un ocean suficient de mare, Saturn ar pluti! Aceasta se datoreaza compozitiei predominant gazoase (H si He)."
  },

  {
    q: "Cate luni are Jupiter (2024)?",
    opts: ["48", "62", "79", "95"], c: 3,
    exp: "Jupiter are 95 de luni confirmate (2023-2024). Cei 4 galileeni descoperiti de Galileo in 1610 (Io, Europa, Ganymede, Callisto) sunt cei mai importanti. Ganymede este mai mare decat planeta Mercur."
  },

  {
    q: "De ce are Uranus axa de rotatie inclinata la ~98 grade?",
    opts: ["Din cauza campului magnetic puternic", "Probabil dintr-o coliziune uriasa in trecut", "Din cauza gravitatiei lui Saturn", "Este o caracteristica normala a planetelor gazoase"], c: 1,
    exp: "Uranus are axa inclinata la 97.77 grade, probabil din cauza unei coliziuni cu un corp de marimea Pamantului in trecut. Aceasta inseamna ca se rostogoleste practic pe orbita, cu polii indicand spre Soare alternativ la fiecare ~42 de ani."
  },

  {
    q: "Ce a descoperit sonda Cassini la luna Enceladus a lui Saturn?",
    opts: ["Lacuri de lava", "Gheysere de apa sarata cu molecule organice", "Atmosfera de oxigen", "Cratere de impact uriase"], c: 1,
    exp: "Cassini a descoperit gheysere uriase care arunca in spatiu apa sarata cu molecule organice si hidrogen molecular — ingrediente compatibile cu viata. Sub crusta de gheata exista un ocean de apa lichida in contact cu roca calda — unul din cei mai buni candidati pentru viata extraterestra."
  },

  {
    q: "Care planeta are cele mai rapide vanturi din Sistemul Solar?",
    opts: ["Jupiter", "Saturn", "Uranus", "Neptun"], c: 3,
    exp: "Neptun are vanturi de pana la 2,100 km/h — cele mai rapide din Sistemul Solar, paradoxal pentru planeta cea mai departata si rece. Marea Pata Intunecata, o furtuna observata de Voyager 2 in 1989, a disparut pana in 1994 — gaurile negre ale furtunilor neptuniene sunt instabile."
  },

  // ── CENTURA DE ASTEROIZI (Lectia 5) ──
  {
    q: "Care este cea mai mare planeta pitica din Centura de Asteroizi?",
    opts: ["Pluto", "Eris", "Ceres", "Makemake"], c: 2,
    exp: "Ceres este singura planeta pitica din Centura de Asteroizi, cu diametrul de ~940 km. Toate celelalte planete pitice (Pluto, Eris, Makemake, Haumea) se afla in Centura Kuiper, dincolo de orbita lui Neptun."
  },

  {
    q: "De ce nu s-a format o planeta in Centura de Asteroizi?",
    opts: ["Nu era suficient material", "Gravitatia lui Jupiter a impiedicat acretia", "Era prea cald", "Soarele a absorbit materialul"], c: 1,
    exp: "Gravitatia uriasa a lui Jupiter a perturbat permanent orbitele corpurilor din zona 2.1-3.3 UA, impiedicand acretia intr-o planeta. Masa totala a centurii e mai mica decat 4% din masa Lunii — mult mai putin decat o planeta normala."
  },

  {
    q: "Ce a descoperit sonda Dawn pe suprafata lui Ceres in 2015?",
    opts: ["Rauri de apa lichida", "Pete luminoase de saruri carbonatice", "Cratere cu gheata pura", "Urme de meteoriti recenti"], c: 1,
    exp: "Sonda Dawn (2015-2018) a descoperit pete luminoase misterioase in craterul Occator — depozite de saruri carbonatice (natriu carbonat), probabil din activitate hidrotermala veche sau posibil chiuveta activa din interior."
  },

  // ── GAURILE NEGRE (Lectia 6) ──
  {
    q: "Ce este orizontul evenimentelor unei gauri negre?",
    opts: ["Marginea fizica a gaurii negre", "Granita de unde viteza de scapare depaseste viteza luminii", "Suprafata unei stele neutronice", "Centrul gaurii negre"], c: 1,
    exp: "Orizontul evenimentelor este granita matematica a unei gauri negre dincolo de care viteza de scapare depaseste viteza luminii (c). Nu este o suprafata fizica. Raza Schwarzschild pentru o gaura neagra de masa Soarelui ar fi ~3 km."
  },

  {
    q: "In ce an a fost publicata prima fotografie directa a unei gauri negre?",
    opts: ["2015", "2017", "2019", "2022"], c: 2,
    exp: "In aprilie 2019, colaborarea Event Horizon Telescope a publicat prima fotografie a umbrei gaurii negre din galaxia M87, la 55 milioane ani-lumina, cu masa de 6.5 miliarde ori masa Soarelui. In 2022 a urmat imaginea lui Sagittarius A* din centrul Caii Lactee."
  },

  {
    q: "Cum se numeste gaura neagra supermasiva din centrul Caii Lactee?",
    opts: ["TON 618", "M87*", "Sagittarius A*", "Cygnus X-1"], c: 2,
    exp: "Sagittarius A* (Sgr A*) are masa de 4.3 milioane ori masa Soarelui. Prima imagine directa a fost publicata in mai 2022 de colaborarea Event Horizon Telescope, la 3 ani dupa imaginea lui M87*. Se afla la ~27,000 ani-lumina de Pamant."
  },

  {
    q: "Ce este spaghettificarea in contextul gaurior negre?",
    opts: ["O teorie despre forma galaxiilor", "Intinderea unui obiect in fire subtiri de fortele de maree ale gaurii negre", "Efectul de lentila gravitationala", "Evaporarea materie la orizontul evenimentelor"], c: 1,
    exp: "Spaghettificarea apare cand un obiect se apropie de o gaura neagra — forta gravitationala este mult mai puternica la picioare decat la cap, intinzand corpul ca o spagheta. Efectul e mai puternic la gaurile negre stelare mici decat la cele supermasive."
  },

  // ── GALAXII (Lectia 7) ──
  {
    q: "Ce tip de galaxie este Calea Lactee?",
    opts: ["Galaxie eliptica", "Galaxie spiralata barara", "Galaxie neregulata", "Galaxie lenticulara"], c: 1,
    exp: "Calea Lactee este o galaxie spiralata barata — are un nucleu central cu o bara de stele din care pornesc bratele spiralate. Sistemul Solar se afla in Bratul Orion, la ~27,000 ani-lumina de centru."
  },

  {
    q: "La ce distanta se afla galaxia Andromeda si ce se va intampla cu ea?",
    opts: ["1 milion al, se indeparteaza", "2.537 milioane al, se apropie cu 110 km/s si va fuziona", "10 milioane al, sta pe loc", "500,000 al, orbiteaza Calea Lactee"], c: 1,
    exp: "Andromeda (M31) se afla la 2.537 milioane ani-lumina si se apropie de Calea Lactee cu 110 km/s. In ~4.5 miliarde ani vor fuziona intr-o galaxie eliptica numita uneori Milkomeda. Ciocnirile directe stea-stea vor fi rare datorita distantelor uriase."
  },

  {
    q: "Cat dureaza un an cosmic (orbita Soarelui in jurul Caii Lactee)?",
    opts: ["11 milioane ani", "50 milioane ani", "225-250 milioane ani", "1 miliard ani"], c: 2,
    exp: "Sistemul Solar orbiteaza centrul Caii Lactee cu ~230 km/s, completand o orbita in 225-250 milioane ani — un an cosmic. Ultima data cand eram pe aceasta pozitie existau dinozaurii triasici. De la formarea Pamantului, am completat ~20 de ani cosmici."
  },

  {
    q: "Cate galaxii sunt estimate in universul observabil?",
    opts: ["Cateva miliarde", "~200 miliarde", "~2 trilioane", "Nedeterminat"], c: 2,
    exp: "Conform unui studiu din 2016 bazat pe date Hubble Deep Field, universul observabil contine aproximativ 2 trilioane de galaxii (2 x 10^12). Majoritatea sunt prea mici si departe pentru a fi detectate cu telescoapele actuale."
  },

  // ── BIG BANG (Lectia 8) ──
  {
    q: "Cat de vechi este universul conform masuratorilor ESA Planck?",
    opts: ["4.5 miliarde ani", "10 miliarde ani", "13.8 miliarde ani", "20 miliarde ani"], c: 2,
    exp: "Satelitul Planck al ESA a masurat cu precizie temperatura radiatiei cosmice de fond (CMB), determinand varsta universului la 13.799 miliarde ani. Sistemul Solar s-a format la 9.2 miliarde ani dupa Big Bang — deci universul avea deja 9 miliarde ani cand s-a format Pamantul."
  },

  {
    q: "Ce este Radiatia Cosmica de Fond (CMB)?",
    opts: ["Lumina stelelor din Calea Lactee", "Fosila luminoasa a Big Bang-ului emisa la 380,000 ani", "Radiatia emisa de gauri negre", "Radiatia ultravioleta a Soarelui"], c: 1,
    exp: "CMB este radiatia electromagnetica emisa cand universul a devenit transparent la 380,000 ani dupa Big Bang (recombinarea). Astazi are temperatura uniforma de 2.725 K si umple uniform tot cerul. Descoperita accidental in 1965 de Penzias si Wilson (Nobel 1978)."
  },

  {
    q: "Ce a demonstrat Edwin Hubble in 1929 si ce importanta are?",
    opts: ["Ca Pamantul orbiteaza Soarele", "Ca universul se extinde — galaxiile se indeparteaza proportional cu distanta", "Ca exista gauri negre", "Ca Luna a fost formata prin impact"], c: 1,
    exp: "Hubble a descoperit ca galaxiile se indeparteaza de noi proportional cu distanta (v = H0 x d). Proiectand inapoi, toate galaxiile convergeau intr-un punct acum ~13.8 miliarde ani — dovada cheie pentru Big Bang. Constanta Hubble H0 = 67.4 km/s/Mpc (ESA Planck 2018)."
  },

  {
    q: "Ce proportie din universul observabil o reprezinta materia normala (barionica)?",
    opts: ["50%", "27%", "68%", "Doar ~5%"], c: 3,
    exp: "Universul este format din ~68% energie intunecata (expansiune accelerata), ~27% materie intunecata (nu emite lumina) si doar ~5% materie normala din care sunt facute stelele, planetele si noi. Aceasta structura a fost confirmata de satelitul Planck al ESA."
  },

  {
    q: "Ce s-a intamplat in primele 3 minute dupa Big Bang?",
    opts: ["S-au format primele galaxii", "S-au format nucleele de hidrogen si heliu (nucleosinteza primordiale)", "S-au format primele stele", "Universul era complet rece si intuneric"], c: 1,
    exp: "In primele 3 minute, la temperaturi de miliarde de grade, protonii si neutronii au fuzionat formand nucleele usoare: hidrogen (75%), heliu-4 (25%), urme de deuteriu si litiu. Aceste proportii, masurate in stele batrane, confirma modelul Big Bang."
  },

  // ── EXOPLANETE (Lectia 9) ──
  {
    q: "Ce metoda a descoperit cele mai multe exoplanete?",
    opts: ["Viteza radiala", "Imagistica directa", "Tranzit (Kepler/TESS)", "Microlentile gravitationale"], c: 2,
    exp: "Metoda tranzitului masoara scaderea periodica a luminozitatii stelei cand o planeta trece prin fata ei. Misiunea Kepler (2009-2018) a descoperit >2,700 de exoplanete astfel. TESS continua aceasta abordare din 2018, iar JWST analizeaza acum atmosferele celor mai interesante."
  },

  {
    q: "Cate planete are sistemul TRAPPIST-1 si cate sunt in zona locuibila?",
    opts: ["5 planete, 1 locuibila", "7 planete, 3 locuibile", "9 planete, 2 locuibile", "4 planete, toate locuibile"], c: 1,
    exp: "TRAPPIST-1, la 39 ani-lumina, are 7 planete de marimea Pamantului. Planetele e, f si g se afla in zona locuibila. JWST analizeaza atmosferele lor din 2023. Este unul dintre cele mai studiate sisteme exoplanetare."
  },

  {
    q: "Ce este zona locuibila a unei stele?",
    opts: ["Zona cu oxigen in atmosfera", "Distanta la care temperatura permite apa lichida la suprafata", "Zona cu campul magnetic protector", "Orice planeta cu atmosfera"], c: 1,
    exp: "Zona locuibila (Goldilocks Zone) este intervalul de distante de la o stea la care temperatura de suprafata permite existenta apei lichide — considerata esentiala pentru viata. Depinde de luminozitatea stelei. Pamantul se afla in centrul zonei locuibile a Soarelui."
  },

  {
    q: "Care este cea mai apropiata exoplaneta de Sistemul Solar?",
    opts: ["Kepler-452b", "Proxima Centauri b", "51 Pegasi b", "HD 209458b"], c: 1,
    exp: "Proxima Centauri b a fost descoperita in 2016, orbitand in zona locuibila a stelei Proxima Centauri — cea mai apropiata stea de Soare, la 4.24 ani-lumina. Este una din cele mai studiate exoplanete, desi steaua sa emite fulgere intense."
  },

  {
    q: "In ce an a fost descoperita prima exoplaneta confirmata in jurul unei stele de tip solar?",
    opts: ["1985", "1992", "1995", "2001"], c: 2,
    exp: "In 1995, Mayor si Queloz au confirmat 51 Pegasi b prin metoda vitezei radiale — un Jupiter fierbinte care orbiteaza in 4.2 zile. Descoperirea le-a adus Premiul Nobel pentru Fizica in 2019."
  },

  // ── STELE SI CONSTELATII (Lectia 10) ──
  {
    q: "Care este cea mai stralucitoare stea de pe cerul noptii (magnitudine aparenta)?",
    opts: ["Polaris (Steaua Polara)", "Sirius (-1.46)", "Betelgeuse", "Vega"], c: 1,
    exp: "Sirius are magnitudinea aparenta de -1.46, cea mai mare stralucire pe cerul noptii (excluzand Soarele, Luna si planete). Se afla la 8.6 ani-lumina, este o stea de tip A1V. Are o stea companion pitica alba (Sirius B)."
  },

  {
    q: "Ce inseamna clasificarea spectrala 'M' pentru o stea?",
    opts: ["Stea albastra fierbinte >30,000 K", "Stea galbena ~5500 K (ca Soarele)", "Pitica rosie rece <3700 K", "Giganta portocalie ~4500 K"], c: 2,
    exp: "Clasa M reprezinta stelele cele mai reci si rosii — pitice rosii cu temperatura <3700 K. Sunt cele mai numeroase stele din univers (~70-75% din total) dar prea slabe pentru ochiul liber. Proxima Centauri si TRAPPIST-1 sunt pitice rosii de tip M."
  },

  {
    q: "Ce se intampla cu o stea masiva (>8 mase solare) la sfarsitul vietii?",
    opts: ["Devine pitica alba", "Devine giganta rosie si se stinge", "Explodeaza ca supernova si lasa o stea neutronica sau gaura neagra", "Se transforma in pulsar direct"], c: 2,
    exp: "Stelele masive (>8 M solare) isi consuma combustibilul rapid (milioane de ani vs miliarde pentru Soare) si explodeaza ca supernovae. Nucleul colapsat devine stea neutronica (daca masa < ~20 M solare) sau gaura neagra (daca masa > ~20-25 M solare)."
  },

  {
    q: "Cate constelatii oficiale exista conform UAI?",
    opts: ["48", "72", "88", "120"], c: 2,
    exp: "Uniunea Astronomica Internationala (UAI) recunoaste oficial 88 de constelatii, limitele lor fiind stabilite in 1930 de astronomul belgian Eugene Delporte. Acestea acopera tot cerul si sunt folosite ca regiuni de referinta, nu ca grupuri fizice de stele."
  },

  {
    q: "De unde provin elementele grele cum ar fi aurul si platina?",
    opts: ["Din Big Bang", "Din Soare", "Din fuziunea stelelor neutronice si supernovae", "Din centura de asteroizi"], c: 2,
    exp: "Elementele mai grele decat fierul (aur, argint, platina, uraniu) nu se pot forma in stele obisnuite. Se sintetizeaza in supernovae si mai ales in fuziunile de stele neutronice (confirmat prin kilonova GW170817, 2017). Aurul din bijuterii a fost creat intr-o catastrofa cosmica de miliarde de ani."
  },

  // ── LUNA (Lectia 11) ──
  {
    q: "Cum s-a format Luna conform teoriei stiintifice dominante?",
    opts: ["S-a format concomitent cu Pamantul", "A fost capturata gravitational", "Prin impactul cu proto-planeta Theia acum 4.5 mld ani", "A fost ejectata din Pamant prin rotatie"], c: 2,
    exp: "Teoria marii coliziuni propune ca Pamantul a colizonat cu proto-planeta Theia (marimea lui Marte) acum ~4.5 miliarde ani. Fragmentele aruncate in orbita s-au acretat formand Luna. Aceasta explica compozitia izotopica similara si nucleul mic al Lunii."
  },

  {
    q: "Cu cat se indeparteaza Luna de Pamant in fiecare an?",
    opts: ["1 cm", "3.8 cm", "10 cm", "38 cm"], c: 1,
    exp: "Luna se indeparteaza de Pamant cu 3.8 cm pe an datorita transferului de moment angular prin forte de maree. Aceasta incetineste treptat rotatia Pamantului (ziua creste cu ~1.7 ms pe secol) si mareste orbita Lunii."
  },

  {
    q: "Ce rol are Luna in stabilitatea axei Pamantului?",
    opts: ["Niciun rol", "Stabilizeaza axa la ~23.5 grade, prevenind oscilatii haotice", "Cauzeaza inclinarea axei", "Controleaza campul magnetic"], c: 1,
    exp: "Luna stabilizeaza axa de rotatie a Pamantului la ~23.5 grade. Fara Luna, axa ar oscila haotic intre 0 si 85 grade pe perioade de milioane de ani, facand clima extrem de instabila — probabil incompatibila cu viata complexa."
  },

  {
    q: "In ce an a pus primul om piciorul pe Luna si cum se numea?",
    opts: ["1961, Yuri Gagarin", "1965, Ed White", "1969, Neil Armstrong", "1972, Gene Cernan"], c: 2,
    exp: "Neil Armstrong a pus piciorul pe Luna pe 20 iulie 1969, in cadrul misiunii Apollo 11, urmand de Buzz Aldrin. Michael Collins a ramas in orbita lunara. Ultima misiune Apollo a fost Apollo 17 in decembrie 1972, cu Gene Cernan ca ultim om pe Luna pana in prezent."
  },

  // ── EXPLORAREA SPATIALA (Lectia 12) ──
  {
    q: "Cand a fost lansata statia spatiala ISS si cati astronauti are in mod normal?",
    opts: ["1995, 3 astronauti", "2000, 6-7 astronauti", "2005, 10 astronauti", "1998, 2 astronauti"], c: 1,
    exp: "Primul modul al ISS a fost lansat in 1998, iar primul echipaj permanent a urcat in 2000. In mod normal adaposteste 6-7 astronauti simultan. Este o colaborare intre SUA, Rusia, ESA, Japonia si Canada si orbiteaza la ~408 km altitudine cu 27,600 km/h."
  },

  {
    q: "Ce sonda a ajuns prima in spatiul interstelar?",
    opts: ["Voyager 2", "Pioneer 10", "New Horizons", "Voyager 1"], c: 3,
    exp: "Voyager 1, lansata in septembrie 1977, a depasit heliopausa (limita heliosferei) in august 2012, intrando in spatiu interstelar la ~121 UA de Soare. In 2024 se afla la >24 miliarde km de Pamant — cel mai indepartat obiect construit de om."
  },

  {
    q: "Ce a fotografiat Telescopul Spatial James Webb dupa lansarea din 2021?",
    opts: ["Doar planete din Sistemul Solar", "Galaxii formate la 300-500 milioane ani dupa Big Bang si atmosfere de exoplanete", "Numai gauri negre", "Exclusiv stele din Calea Lactee"], c: 1,
    exp: "JWST (lansat 25 decembrie 2021, operational din 2022) a fotografiat galaxii existente la 300-500 milioane ani dupa Big Bang, a analizat atmosfere de exoplanete si a oferit imagini fara precedent ale nebuloaselor si galaxiilor. Opereaza la -233 C in punctul Lagrange L2."
  },

  {
    q: "Care a fost primul om in spatiu si in ce an?",
    opts: ["Neil Armstrong, 1969", "Buzz Aldrin, 1969", "Yuri Gagarin, 1961", "Alan Shepard, 1961"], c: 2,
    exp: "Yuri Gagarin (URSS) a devenit primul om in spatiu pe 12 aprilie 1961, intr-un zbor de 108 minute la bordul navei Vostok 1, completand o orbita in jurul Pamantului. Alan Shepard (SUA) a efectuat un zbor suborbital la 5 mai 1961."
  },

  {
    q: "Ce este programul Artemis al NASA?",
    opts: ["Un program de explorare a Marte", "Programul de revenire a astronautilor pe Luna si stabilire a unei prezente permanente", "Un program de telescoape spatiale", "Un program de aparare planetara impotriva asteroizilor"], c: 1,
    exp: "Artemis este programul NASA de revenire a astronautilor pe Luna, vizand si prima femeie si prima persoana de culoare pe suprafata lunara. Artemis I (2022) a testat racheta SLS fara echipaj. Artemis II vizeaza un zbor cu echipaj in jurul Lunii. Scopul final este o baza lunara permanenta ca trambulina spre Marte."
  }

];

// ===== REALIZARI =====
const ACHIEVEMENTS = [
  { id: 'first', icon: '🚀', name: 'Primul Pas', desc: 'Ai finalizat prima lectie. Calatoria incepe!', check: s => s.done.length >= 1 },
  { id: 'half', icon: '🌙', name: 'Jumatate de Drum', desc: '6 din 12 lectii finalizate. Continua!', check: s => s.done.length >= 6 },
  { id: 'scholar', icon: '🎓', name: 'Erudit Cosmic', desc: 'Toate cele 12 lectii finalizate!', check: s => s.done.length >= 12 },
  { id: 'quiz1', icon: '⭐', name: 'Prima Incercare', desc: 'Ai completat primul tau quiz.', check: s => s.attempts >= 1 },
  { id: 'quiz100', icon: '🏅', name: 'Explorator Cosmic', desc: '100% la quiz! Cunostinte perfecte!', check: s => s.best >= 100 },
  { id: 'quiz5', icon: '🔁', name: 'Perseverent', desc: '5 incercari la quiz. Niciodata nu renunta!', check: s => s.attempts >= 5 },
  { id: 'speed', icon: '⚡', name: 'Cititor Rapid', desc: '3 lectii finalizate in aceeasi sesiune.', check: s => s.sessionDone >= 3 },
  { id: 'facts', icon: '💡', name: 'Curios Cosmic', desc: 'Ai vazut toate cele 12 fapte cosmice.', check: s => s.factsViewed >= 12 },
  { id: 'allach', icon: '👑', name: 'Explorator Stelar', desc: 'Ai deblocat toate celelalte realizari!', check: s => s.achCount >= 8 },
  { id: 'night', icon: '🌌', name: 'Veghetorul Cosmic', desc: 'Ai studiat dupa ora 22:00.', check: s => s.nightStudy }
];

// ===== APLICATIE PRINCIPALA =====
document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('click', () => { try { initAudio(); } catch (e) { } }, { once: true });
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => p.querySelectorAll(s);
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const byId = id => document.getElementById(id);
  const setText = (id, txt) => { const el = byId(id); if (el) el.textContent = txt; };
  const setDisplay = (id, val) => { const el = byId(id); if (el) el.style.display = val; };

  // ── LOADER ──
  (function runLoader() {
    const fill = document.getElementById('loaderFill');
    const msg = document.getElementById('loaderMsg');
    const ls = document.getElementById('loading-screen');
    if (!ls) return;
    const msgs = ['Initializare sistem...', 'Calibrare telescop...', 'Cartografiere galaxii...', 'Calculare orbite...', 'Sistem pregatit! 🚀'];
    let step = 0;
    const fb = setTimeout(() => ls.classList.add('hidden'), 4500);
    const iv = setInterval(() => {
      const pct = ((step + 1) / msgs.length) * 100;
      if (fill) fill.style.width = pct + '%';
      if (msg) msg.textContent = msgs[step];
      step++;
      if (step >= msgs.length) {
        clearInterval(iv); clearTimeout(fb);
        setTimeout(() => ls.classList.add('hidden'), 400);
      }
    }, 260);
  })();

  // ── stare ──
  let state = {
    done: JSON.parse(localStorage.getItem('eu_done') || '[]'),
    attempts: parseInt(localStorage.getItem('eu_qa') || '0'),
    best: parseInt(localStorage.getItem('eu_best') || '0'),
    factsViewed: parseInt(localStorage.getItem('eu_fv') || '0'),
    sessionDone: 0,
    achCount: 0,
    nightStudy: false,
    studyMin: parseInt(localStorage.getItem('eu_min') || '0'),
    theme: localStorage.getItem('eu_theme') || 'dark',
    unlocked: JSON.parse(localStorage.getItem('eu_ach') || '[]'),
    sessionStart: Date.now()
  };
  if (new Date().getHours() >= 22) state.nightStudy = true;

  function saveState() {
    const map = {
      eu_done: JSON.stringify(state.done),
      eu_qa: state.attempts,
      eu_best: state.best,
      eu_fv: state.factsViewed,
      eu_min: state.studyMin,
      eu_ach: JSON.stringify(state.unlocked),
      eu_theme: state.theme
    };
    Object.entries(map).forEach(([k, v]) => localStorage.setItem(k, v));
  }

  // ── TEME ──
  // Tema se aplica complet prin applyTheme() definita mai jos
  const themeBtn = document.getElementById('themeBtn');

  // ── SOUND ──
  const soundBtn = document.getElementById('soundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundOn = !soundOn;
      soundBtn.innerHTML = soundOn ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
      soundBtn.classList.toggle('muted', !soundOn);
    });
  }

  // ──KB MODAL──
  const kbBtn = document.getElementById('kbBtn');
  const kbMod = document.getElementById('kbModal');
  const kbCls = document.getElementById('kbClose');
  if (kbBtn) kbBtn.addEventListener('click', () => { playClick(); if (kbMod) kbMod.style.display = 'flex'; });
  if (kbCls) kbCls.addEventListener('click', () => { if (kbMod) kbMod.style.display = 'none'; });
  if (kbMod) kbMod.addEventListener('click', e => { if (e.target === kbMod) kbMod.style.display = 'none'; });

  // ── NAVIGATION ──
  const navBtns = document.querySelectorAll('.nav-btn[data-page]');
  const allPages = document.querySelectorAll('.page');
  const lessonsGrid = document.getElementById('lessonsGrid');
  const recentList = document.getElementById('recentList');
  const missionList = document.getElementById('missionList');
  let currentPage = 'dashboard';
  let currentLessonId = null;

  function showPage(id) {
    // Opreste animatia hartii cand navigam spre alta pagina (evita ruleaza in background)
    if (currentPage === 'harta' && id !== 'harta' && hartaAnimId) {
      cancelAnimationFrame(hartaAnimId);
      hartaAnimId = null;
      hartaPaused = false;
    }
    allPages.forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    const target = document.getElementById('page-' + id);
    if (target) {
      target.classList.add('active');
      target.style.display = 'block';
      currentPage = id;
    }
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.page === id));
    const pageActions = {
      carte: () => renderLessonsGrid('all', searchInput ? searchInput.value.trim() : ''),
      misiuni: renderMissions,
      quiz: resetQuizUI,
      realizari: renderAchievements,
      jurnal: renderJurnal,
      despre: renderDespre,
      calculator: renderCalculator,
      comparator: renderComparator,
      dashboard: updateDashboard
    };
    if (id === 'cer') {
      renderCer();
      const cerCv = document.getElementById('cerCanvas');
      if (cerCv && cerCv.dataset.rendered) {
        // Redimensioneaza canvas daca s-a schimbat fereastra
        const newW = cerCv.parentElement ? cerCv.parentElement.clientWidth : 800;
        const newH = Math.min(500, window.innerHeight * 0.55);
        if (Math.abs(cerCv.width - newW) > 20 || Math.abs(cerCv.height - newH) > 20) {
          cerCv.width = newW;
          cerCv.height = newH;
          cerCv._bgstars = null; // regenereaza stelele de fundal
        }
        drawCer(cerCv, cerFilter);
      }
    }
    if (id === 'harta') {
      if (hartaAnimId) { cancelAnimationFrame(hartaAnimId); hartaAnimId = null; }
      hartaPaused = false;
      const pBtn = document.getElementById('pauseOrbit');
      if (pBtn) pBtn.innerHTML = '<i class="fas fa-pause"></i> Pauza';
      renderHarta();
    }
    (pageActions[id] || (() => { }))();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (kbMod) kbMod.style.display = 'none';
  }

  navBtns.forEach(btn => on(btn, 'click', () => { playClick(); showPage(btn.dataset.page); }));

  // ── PAGINILE LECȚIILOR ──
  const lessonPagesWrap = document.getElementById('lessonPagesWrap');
  LESSONS.forEach(l => {
    const div = document.createElement('div');
    div.className = 'page lesson-pg glass';
    div.id = 'page-lesson-' + l.id;
    lessonPagesWrap.appendChild(div);
    renderLessonPage(l, div);
  });

  function showLesson(id) {
    allPages.forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    const target = document.getElementById('page-lesson-' + id);
    if (target) {
      target.classList.add('active');
      target.style.display = 'block';
      currentLessonId = id;
    }
    navBtns.forEach(b => b.classList.remove('active'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const rb = document.getElementById('readBar');
    if (rb) rb.style.width = '0%';
    target._studyStart = Date.now();
  }

  function renderLessonPage(l, div) {
    const prev = l.id > 1 ? l.id - 1 : null;
    const next = l.id < 12 ? l.id + 1 : null;
    const diffLabel = l.diff === 'easy' ? 'Incepator' : l.diff === 'med' ? 'Intermediar' : 'Avansat';
    const diffCls = l.diff === 'easy' ? 't-easy' : l.diff === 'med' ? 't-med' : 't-hard';
    const kfHTML = l.keyFacts.map(k =>
      `<div class="kf-row"><span class="kf-l">${k.l}</span><span class="kf-v">${k.v}</span></div>`
    ).join('');
    div.innerHTML = `
      <div class="lesson-hero">
        <div class="lesson-nav">
          <button class="lesson-back" data-backto="carte"><i class="fas fa-arrow-left"></i> Carte Cosmica</button>
          <div class="lesson-arrows">
            <button class="arr-btn" id="arr-prev-${l.id}" ${!prev ? 'disabled' : ''} title="Lectia anterioara"><i class="fas fa-chevron-left"></i></button>
            <button class="arr-btn" id="arr-next-${l.id}" ${!next ? 'disabled' : ''} title="Urmatoarea lectie"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
        <h1 class="lesson-title"><i class="fas ${l.icon}"></i> ${l.title}</h1>
        <p class="lesson-desc-hero">${l.desc}</p>
        <div class="lesson-chips">
          <div class="lchip"><i class="fas fa-clock"></i> ~${l.readTime} min citire</div>
          <div class="lchip tag ${diffCls}">${diffLabel}</div>
          <div class="lchip"><i class="fas fa-bookmark"></i> Lectia ${l.id} din 12</div>
        </div>
      </div>
      <div class="lesson-body">
        <div class="lesson-content">${l.content}</div>
        <div class="lesson-sidebar">
          <div class="sb-card">
            <div class="sb-title"><i class="fas fa-eye"></i> Vizualizare</div>
            <div class="vis-icon"><i class="fas ${l.icon}"></i></div>
          </div>
          <div class="sb-card">
            <div class="sb-title"><i class="fas fa-table"></i> Date cheie</div>
            <div class="key-facts-list">${kfHTML}</div>
          </div>
          <div class="sb-card" style="text-align:center;padding:1.5rem">
            <div style="font-size:.75rem;color:var(--txt2);margin-bottom:.8rem;text-transform:uppercase;letter-spacing:.1em">Lectia ${l.id} / 12</div>
            <div style="font-size:.8rem;color:var(--txt2);margin-bottom:1rem">Ai citit tot? Marcheaza lectia ca finalizata!</div>
            <label class="complete-lbl" id="complete-lbl-${l.id}">
              <input type="checkbox" class="lesson-checkbox" data-lid="${l.id}" ${state.done.includes(l.id) ? 'checked' : ''}>
              <span id="complete-span-${l.id}">${state.done.includes(l.id) ? 'Finalizata ✅' : 'Marcheaza finalizata'}</span>
            </label>
          </div>
        </div>
      </div>`;

    // Butonul de "inapoi"
    div.querySelector('.lesson-back').addEventListener('click', () => {
      playClick();
      if (currentLessonId && div._studyStart) {
        state.studyMin += Math.round((Date.now() - div._studyStart) / 60000);
        saveState();
      }
      showPage('carte');
    });

    // Navigatorile cu sageti (in stanga si dreapta)
    const ap = div.querySelector('#arr-prev-' + l.id);
    const an = div.querySelector('#arr-next-' + l.id);
    if (ap && prev) ap.addEventListener('click', () => { playClick(); showLesson(prev); });
    if (an && next) an.addEventListener('click', () => { playClick(); showLesson(next); });

    // Checkbox (de finalizat lectia)
    const cb = div.querySelector('.lesson-checkbox');
    cb.addEventListener('change', function () {
      const id = parseInt(this.dataset.lid);
      const span = document.getElementById('complete-span-' + id);
      if (this.checked) {
        if (!state.done.includes(id)) {
          state.done.push(id);
          state.sessionDone++;
        }
        if (span) span.textContent = 'Finalizata \u2705';
        toast('\u2705 Lectia finalizata!', 'ok');
        playSuccess();
        showLessonSummary(id, div);
      } else {
        state.done = state.done.filter(x => x !== id);
        if (span) span.textContent = 'Marcheaza finalizata';
        const sc = div.querySelector('.lesson-summary-card');
        if (sc) sc.remove();
        toast('Lectie debifata.', 'info');
        playClick();
      }
      saveState(); updateDashboard(); checkAchievements();
    });
  }

  function showLessonSummary(id, container) {
    if (container.querySelector('.lesson-summary-card')) return;
    const l = LESSONS.find(x => x.id === id);
    if (!l) return;
    const facts = l.keyFacts.slice(0, 3);
    const card = document.createElement('div');
    card.className = 'lesson-summary-card';
    const nextId = id < 12 ? id + 1 : null;
    const nextL = nextId ? LESSONS.find(x => x.id === nextId) : null;
    const factsHTML = facts.map(f =>
      '<div class="ls-fact"><i class="fas fa-circle" style="font-size:.4rem"></i><span><strong>' + f.l + ':</strong> ' + f.v + '</span></div>'
    ).join('');
    const nextBtn = nextL
      ? '<button class="btn-glow" id="sum-next-' + id + '"><i class="fas fa-arrow-right"></i> ' + nextL.title + '</button>'
      : '';
    card.innerHTML =
      '<div class="ls-title"><i class="fas fa-star"></i> Rezumat — ' + l.title + '</div>' +
      '<div class="ls-facts">' + factsHTML + '</div>' +
      '<div class="ls-btns">' + nextBtn +
      '<button class="btn-outline" id="sum-quiz-' + id + '"><i class="fas fa-star"></i> Mergi la Quiz</button>' +
      '</div>';
    const sbCard = container.querySelector('.sb-card:last-child');
    if (sbCard) sbCard.after(card);
    const nBtn = card.querySelector('#sum-next-' + id);
    if (nBtn) nBtn.addEventListener('click', () => { playClick(); showLesson(nextId); });
    const qBtn = card.querySelector('#sum-quiz-' + id);
    if (qBtn) qBtn.addEventListener('click', () => { playClick(); showPage('quiz'); });
  }

  // ── Realizari ──
  function checkAchievements() {
    state.achCount = state.unlocked.length;
    ACHIEVEMENTS.forEach(a => {
      if (!state.unlocked.includes(a.id) && a.check(state)) {
        state.unlocked.push(a.id);
        state.achCount++;
        setTimeout(() => {
          toast(a.icon + ' Realizare noua: ' + a.name + '!', 'gold', 5000);
          playNotif();
          if (a.id === 'scholar' || a.id === 'quiz100') confetti();
        }, 300);
        saveState();
      }
    });
  }

  function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    grid.innerHTML = ACHIEVEMENTS.map(a => {
      const ok = state.unlocked.includes(a.id);
      return `<div class="ach-card ${ok ? 'unlocked' : ''}">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        <div class="${ok ? 'ach-lbl-ok' : 'ach-lbl-locked'}">${ok ? 'Deblocat \u2713' : 'Blocat'}</div>
      </div>`;
    }).join('');
  }

  // ── TABLOUL DE BORD ──
  let factIdx = 0;
  function updateDashboard() {
    // Mesaj de intampinare
    const ht = document.getElementById('heroTitle');
    if (ht && !ht._typed) {
      const hr = new Date().getHours();
      const gr = hr < 12 ? 'Buna dimineata, Explorator! \uD83C\uDF05' : hr < 18 ? 'Buna ziua, Explorator! \u2600\uFE0F' : 'Buna seara, Explorator! \uD83C\uDF0C';
      typewriter(ht, gr, 45);
      ht._typed = true;
    }

    // Statistici
    const total = LESSONS.length, done = state.done.length;
    const pct = Math.round(done / total * 100);
    const stL = document.getElementById('stLectii');
    const stQ = document.getElementById('stQuiz');
    const stT = document.getElementById('stTime');
    const stB = document.getElementById('stBadge');
    if (stL) animCount(stL, done);
    if (stQ) stQ.textContent = state.best > 0 ? state.best + '%' : '--';
    if (stT) stT.textContent = Math.max(state.studyMin, done * 8) + ' min';
    if (stB) animCount(stB, state.unlocked.length);

    // Progres cerc
    const ring = document.getElementById('ringFillSvg');
    const rPct = document.getElementById('ringPct');
    if (ring) {
      const circ = 351.9;
      ring.style.strokeDashoffset = circ - (pct / 100) * circ;
    }
    if (rPct) rPct.textContent = pct + '%';

    const pd = document.getElementById('progDone');
    const pl = document.getElementById('progLeft');
    if (pd) pd.textContent = done + ' finalizate';
    if (pl) pl.textContent = (total - done) + ' ramase';

    // INDICATOARE LECȚII
    const ld = document.getElementById('lessonDots');
    if (ld) {
      ld.innerHTML = LESSONS.map(l =>
        `<div class="ldot ${state.done.includes(l.id) ? 'done' : ''}" title="${l.title}" data-lid="${l.id}">${l.id}</div>`
      ).join('');
      ld.querySelectorAll('.ldot').forEach(d => {
        d.addEventListener('click', () => { playClick(); showLesson(parseInt(d.dataset.lid)); });
      });
    }

    // Numărul de misiuni(lectii finalizate)
    const mn = document.getElementById('missionNum');
    if (mn) animCount(mn, done);

    // Afisarea emblemelor(badge-uri)
    const db = document.getElementById('dashBadge');
    if (db) {
      const badges = state.unlocked.map(id => {
        const a = ACHIEVEMENTS.find(x => x.id === id);
        return a ? `<span title="${a.name}">${a.icon}</span>` : '';
      }).join('');
      db.innerHTML = badges || '<span style="color:var(--txt2);font-size:.8rem">Niciun badge inca - completeaza lectii!</span>';
    }

    // Faptul zilei
    renderFact(factIdx);

    // Lectiile recente
    renderRecent();
  }

  function renderFact(i) {
    const f = FACTS[i];
    const fi = byId('factIconEl');
    setText('factCounter', (i + 1) + ' / ' + FACTS.length);
    if (fi) fi.innerHTML = '<i class="fas ' + f.icon + '"></i>';
    setText('factText', f.text);
    // TINE MINTE FAPTUL ZILEI
    if (i >= state.factsViewed) {
      state.factsViewed = i + 1;
      saveState();
    }
  }

  const prevFact = document.getElementById('prevFact');
  const nextFact = document.getElementById('nextFact');
  on(prevFact, 'click', () => {
    playClick(); factIdx = (factIdx - 1 + FACTS.length) % FACTS.length; renderFact(factIdx);
  });
  on(nextFact, 'click', () => {
    playClick(); factIdx = (factIdx + 1) % FACTS.length; renderFact(factIdx);
  });

  function renderRecent() {
    const el = recentList;
    if (!el) return;
    const items = state.done.length > 0
      ? state.done.slice(-6).reverse().map(id => {
        const l = LESSONS.find(x => x.id === id);
        return l ? `<div class="ri" data-lid="${l.id}">
            <i class="fas ${l.icon} ri-icon"></i>
            <div class="ri-info"><h4>${l.title}</h4><p>${l.desc.substring(0, 50)}...</p></div>
            <span class="ri-status" style="color:var(--green)">&#10003;</span>
          </div>` : '';
      }).join('')
      : LESSONS.slice(0, 4).map(l =>
        `<div class="ri" data-lid="${l.id}">
            <i class="fas ${l.icon} ri-icon"></i>
            <div class="ri-info"><h4>${l.title}</h4><p>${l.desc.substring(0, 50)}...</p></div>
            <span class="ri-status" style="color:var(--txt2)">&#9711;</span>
          </div>`).join('');
    el.innerHTML = items;
  }

  const contBtn = document.getElementById('continueBtn');
  const quikBtn = document.getElementById('quizQuickBtn');
  const goMiss = document.getElementById('goMissions');
  on(contBtn, 'click', () => { playClick(); showPage('carte'); });
  on(quikBtn, 'click', () => { playClick(); showPage('quiz'); });
  on(goMiss, 'click', () => { playClick(); showPage('misiuni'); });
  const rndBtn = document.getElementById('randomLessonBtn');
  on(rndBtn, 'click', () => {
    playClick();
    const unread = LESSONS.filter(l => !state.done.includes(l.id));
    const pool = unread.length > 0 ? unread : LESSONS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    showLesson(pick.id);
    toast('\uD83C\uDFB2 Lectie aleatorie: ' + pick.title, 'info', 2500);
  });

  // ── CARTE ──
  let activeFilter = 'all';
  function renderLessonsGrid(filter, search) {
    activeFilter = filter || activeFilter;
    const grid = lessonsGrid;
    const cDone = document.getElementById('cDone');
    const cTodo = document.getElementById('cTodo');
    if (!grid) return;
    const doneCnt = state.done.length;
    const doneSet = new Set(state.done);
    const searchLower = search ? search.toLowerCase() : '';
    if (cDone) cDone.textContent = doneCnt;
    if (cTodo) cTodo.textContent = (12 - doneCnt);

    let items = LESSONS.filter(l => {
      const isDone = doneSet.has(l.id);
      if (activeFilter === 'done' && !isDone) return false;
      if (activeFilter === 'todo' && isDone) return false;
      if (activeFilter === 'easy' && l.diff !== 'easy') return false;
      if (activeFilter === 'med' && l.diff !== 'med') return false;
      if (activeFilter === 'hard' && l.diff !== 'hard') return false;
      if (searchLower) {
        if (!l.title.toLowerCase().includes(searchLower) && !l.desc.toLowerCase().includes(searchLower)) return false;
      }
      return true;
    });

    if (!items.length) {
      grid.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--txt2)">Nicio lectie gasita.</p>';
      return;
    }
    grid.innerHTML = items.map((l, i) => {
      const done = doneSet.has(l.id);
      const diffLabel = l.diff === 'easy' ? 'Incepator' : l.diff === 'med' ? 'Intermediar' : 'Avansat';
      const diffCls = 't-' + l.diff;
      const prog = done ? 100 : 0;
      return `<div class="lcard ${done ? 'done' : ''}" data-lid="${l.id}" style="animation-delay:${i * .04}s">
        <div class="lcard-top">
          <i class="fas ${l.icon} lcard-icon"></i>
          <div class="lcard-info">
            <div class="lcard-title">${l.title}</div>
            <div class="lcard-desc">${l.desc.substring(0, 65)}...</div>
          </div>
          <span class="lcard-badge">${done ? '\u2705' : '\u26AA'}</span>
        </div>
        <div class="lcard-tags">
          <span class="tag ${diffCls}">${diffLabel}</span>
          <span class="tag t-time"><i class="fas fa-clock"></i> ~${l.readTime} min</span>
        </div>
        <div class="lcard-bar"><div class="lcard-bar-fill" style="width:${prog}%"></div></div>
      </div>`;
    }).join('');
  }

  // Filtrele alea de sus
  const lessonFilterChips = document.querySelectorAll('.chip[data-f]');
  lessonFilterChips.forEach(chip => {
    chip.addEventListener('click', function () {
      lessonFilterChips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      playClick();
      renderLessonsGrid(this.dataset.f, document.getElementById('searchInput')?.value || '');
    });
  });

  // ── MISSIUNI ──
  function renderMissions() {
    const fill = document.getElementById('mbarFill');
    const label = document.getElementById('mbarLabel');
    const list = missionList;
    const done = state.done.length, total = LESSONS.length;
    if (fill) fill.style.width = (done / total * 100) + '%';
    if (label) label.textContent = done + ' / ' + total + ' completate';
    if (!list) return;
    const doneSet = new Set(state.done);
    list.innerHTML = LESSONS.map(l => {
      const ok = doneSet.has(l.id);
      return `<li class="mi ${ok ? 'done' : ''}" data-lid="${l.id}" style="cursor:pointer">
        <i class="fas fa-${ok ? 'check-circle' : 'circle'}"></i>
        <span>Finalizeaza: ${l.title}</span>
        <span style="margin-left:auto;font-size:.78rem;color:var(--txt2)">${l.readTime} min</span>
      </li>`;
    }).join('');
  }

  // ── QUIZ ──
  let quizQs = [], qIdx = 0, qScore = 0, qActive = false, qAnswered = false;
  let qTimer = null, qTimeLeft = 30, qHistory = [];
  const qaOptionsEl = document.getElementById('qaOptions');

  function lockQuizOptions() {
    if (!qaOptionsEl) return;
    qaOptionsEl.querySelectorAll('.qopt').forEach(o => o.classList.add('locked'));
  }

  function submitQuizAnswer(sel) {
    if (qAnswered || !qActive || !quizQs[qIdx]) return;
    qAnswered = true;
    clearInterval(qTimer);
    lockQuizOptions();

    const q = quizQs[qIdx];
    const qf = document.getElementById('qaFeedback');
    const qe = document.getElementById('qaExplain');
    const nb = document.getElementById('nextQBtn');
    const selectedEl = qaOptionsEl ? qaOptionsEl.querySelector(`.qopt[data-i="${sel}"]`) : null;
    const correctEl = qaOptionsEl ? qaOptionsEl.querySelector(`.qopt[data-i="${q.c}"]`) : null;

    if (sel === q.c) {
      if (selectedEl) selectedEl.classList.add('correct');
      if (qf) { qf.textContent = '✅ Corect! Bine jucat!'; qf.style.color = 'var(--green)'; }
      qScore++;
      playSuccess();
    } else {
      if (selectedEl) selectedEl.classList.add('wrong');
      if (correctEl) correctEl.classList.add('correct');
      if (qf) { qf.textContent = '❌ Gresit. Raspuns corect: ' + q.opts[q.c]; qf.style.color = 'var(--red)'; }
      playError();
    }

    if (qe && q.exp) { qe.textContent = '💡 ' + q.exp; qe.classList.add('show'); }
    qHistory.push({ q: q.q, opts: q.opts, correct: q.c, selected: sel });
    if (qIdx === 9) setTimeout(finishQuiz, 1600);
    else if (nb) nb.style.display = 'flex';
  }

  if (qaOptionsEl) {
    qaOptionsEl.addEventListener('click', e => {
      const option = e.target.closest('.qopt');
      if (!option) return;
      playClick();
      submitQuizAnswer(parseInt(option.dataset.i, 10));
    });
  }

  function resetQuizUI() {
    setDisplay('quizIntro', 'block');
    setDisplay('quizActive', 'none');
    setDisplay('quizResult', 'none');
    setDisplay('quizReview', 'none');
    setText('quizPrevScore', state.attempts > 0
      ? 'Ultimul scor: ' + state.best + '% | ' + state.attempts + ' incercari'
      : 'Nicio incercare inca. Esti gata?');
    qActive = false;
    if (qTimer) clearInterval(qTimer);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function shuffleQ(q) {
    const opts = [...q.opts], ans = opts[q.c];
    const sh = shuffle(opts);
    return { q: q.q, opts: sh, c: sh.indexOf(ans), exp: q.exp };
  }

  function startQuiz() {
    playTone(660, .1, .07);
    quizQs = shuffle([...QUIZ_Q]).slice(0, 10).map(shuffleQ);
    qIdx = 0; qScore = 0; qActive = true; qAnswered = false; qHistory = [];
    setDisplay('quizIntro', 'none');
    setDisplay('quizActive', 'block');
    displayQ();
  }

  function displayQ() {
    const q = quizQs[qIdx];
    // bara de progres
    const pf = document.getElementById('qaFill');
    if (pf) pf.style.width = (qIdx / 10 * 100) + '%';
    const qn = document.getElementById('qNum');
    const qs = document.getElementById('qScore');
    const qt = document.getElementById('qTimer');
    const qtw = document.getElementById('qTimerWrap');
    if (qn) qn.textContent = qIdx + 1;
    if (qs) qs.textContent = qScore * 10;
    if (qt) qt.textContent = '30';
    if (qtw) qtw.classList.remove('urgent');
    const qq = document.getElementById('qaQuestion');
    const qo = qaOptionsEl;
    const qf = document.getElementById('qaFeedback');
    const qe = document.getElementById('qaExplain');
    if (qq) qq.textContent = q.q;
    if (qf) { qf.textContent = ''; qf.style.color = ''; }
    if (qe) { qe.textContent = ''; qe.classList.remove('show'); }
    if (qo) {
      qo.innerHTML = q.opts.map((opt, i) =>
        `<div class="qopt" data-i="${i}">${opt}</div>`
      ).join('');
    }
    const nb = document.getElementById('nextQBtn');
    if (nb) nb.style.display = 'none';
    qAnswered = false;
    startTimer();
  }

  function startTimer() {
    qTimeLeft = 30;
    const tb = document.getElementById('timerBar');
    const qt = document.getElementById('qTimer');
    const qtw = document.getElementById('qTimerWrap');
    if (tb) { tb.style.transition = 'none'; tb.style.width = '100%'; setTimeout(() => { if (tb) tb.style.transition = 'width 1s linear'; }, 50); }
    if (qTimer) clearInterval(qTimer);
    qTimer = setInterval(() => {
      qTimeLeft--;
      if (qt) qt.textContent = qTimeLeft;
      if (tb) tb.style.width = (qTimeLeft / 30 * 100) + '%';
      if (qtw && qTimeLeft <= 10) qtw.classList.add('urgent');
      if (qTimeLeft <= 0) {
        clearInterval(qTimer);
        if (!qAnswered) {
          qAnswered = true;
          if (qaOptionsEl) {
            lockQuizOptions();
            const correctEl = qaOptionsEl.querySelector(`.qopt[data-i="${quizQs[qIdx].c}"]`);
            if (correctEl) correctEl.classList.add('correct');
          }
          const qf = document.getElementById('qaFeedback');
          if (qf) { qf.textContent = '\u23F0 Timp expirat! Raspuns: ' + quizQs[qIdx].opts[quizQs[qIdx].c]; qf.style.color = 'var(--gold)'; }
          qHistory.push({ q: quizQs[qIdx].q, opts: quizQs[qIdx].opts, correct: quizQs[qIdx].c, selected: -1 });
          playError();
          if (qIdx === 9) setTimeout(finishQuiz, 1400);
          else {
            const nb = document.getElementById('nextQBtn');
            if (nb) nb.style.display = 'flex';
          }
        }
      }
    }, 1000);
  }

  function finishQuiz() {
    qActive = false;
    clearInterval(qTimer);
    setDisplay('quizActive', 'none');
    setDisplay('quizResult', 'block');
    state.attempts++;
    const pct = qScore * 10;
    if (pct > state.best) state.best = pct;
    saveState();

    const badge = byId('qrBadge');
    const title = byId('qrTitle');
    const sub = byId('qrSub');
    const brk = byId('qrBreakdown');
    setText('qrPts', pct);

    if (qScore === 10) {
      if (badge) badge.textContent = '\uD83C\uDFC5';
      if (title) title.textContent = 'Perfect! Esti un adevarat Explorator Cosmic!';
      if (sub) sub.textContent = 'Scor maxim! Badge deblocat!';
      confetti(['#FFD966', '#7c5cff', '#fff']);
      playSuccess();
    } else if (qScore >= 7) {
      if (badge) badge.textContent = '\u2B50';
      if (title) title.textContent = 'Bine! ' + qScore + '/10 raspunsuri corecte.';
      if (sub) sub.textContent = 'Mai ai de invatat - reciteste lectiile pentru 100%!';
      playTone(550, .15, .07);
    } else {
      if (badge) badge.textContent = '\uD83D\uDCDA';
      if (title) title.textContent = qScore + '/10 - Revino la lectii!';
      if (sub) sub.textContent = 'Exploreaza lectiile si incearca din nou!';
      playTone(380, .15, .07);
    }
    if (brk) {
      brk.innerHTML = qHistory.map((h, i) =>
        `<span class="qrb-item ${h.selected === h.correct ? 'qrb-ok' : 'qrb-err'}">${i + 1}: ${h.selected === h.correct ? '\u2705' : '\u274C'}</span>`
      ).join('');
    }
    checkAchievements();
  }

  const startBtn = document.getElementById('startQuizBtn');
  const nextBtn = document.getElementById('nextQBtn');
  const retryBtn = document.getElementById('retryBtn');
  const reviewBtn = document.getElementById('reviewBtn');
  const backRes = document.getElementById('backToResult');
  on(startBtn, 'click', startQuiz);
  on(nextBtn, 'click', () => { playClick(); qIdx++; displayQ(); });
  on(retryBtn, 'click', () => { playClick(); resetQuizUI(); setTimeout(startQuiz, 100); });
  on(reviewBtn, 'click', () => {
    playClick();
    const rl = byId('reviewList');
    setDisplay('quizResult', 'none');
    setDisplay('quizReview', 'block');
    if (rl) rl.innerHTML = qHistory.map((h, i) => {
      const ok = h.selected === h.correct;
      return `<div class="review-item">
        <div class="review-q">${i + 1}. ${h.q}</div>
        <div class="review-ans">
          <span class="${ok ? 'ra-ok' : 'ra-err'}">${ok ? '\u2705' : '\u274C'} Raspunsul tau: ${h.selected >= 0 ? h.opts[h.selected] : '(expirat)'}</span>
          ${!ok ? '<span class="ra-ok">\u2714 Corect: ' + h.opts[h.correct] + '</span>' : ''}
        </div>
      </div>`;
    }).join('');
  });
  on(backRes, 'click', () => {
    playClick();
    setDisplay('quizResult', 'block');
    setDisplay('quizReview', 'none');
  });

  // ── JURNAL ──
  function renderJurnal() {
    const sum = document.getElementById('journalSummary');
    const tl = document.getElementById('timeline');
    if (sum) sum.innerHTML = `
      <div class="js-item"><div class="js-num">${state.done.length}</div><div class="js-lbl">Lectii citite</div></div>
      <div class="js-item"><div class="js-num">${state.attempts}</div><div class="js-lbl">Quiz-uri</div></div>
      <div class="js-item"><div class="js-num">${state.best}%</div><div class="js-lbl">Scor maxim</div></div>
      <div class="js-item"><div class="js-num">${Math.max(state.studyMin, state.done.length * 8)}</div><div class="js-lbl">Min studiu</div></div>
      <div class="js-item"><div class="js-num">${state.unlocked.length}</div><div class="js-lbl">Badge-uri</div></div>
    `;
    if (!tl) return;
    if (state.done.length === 0 && state.attempts === 0) {
      tl.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--txt2)">Jurnalul este gol. Incepe explorarea pentru a vedea activitatea ta!</div>';
      return;
    }
    const today = new Date().toLocaleDateString('ro-RO');
    let html = '';
    state.done.slice().reverse().forEach(id => {
      const l = LESSONS.find(x => x.id === id);
      if (l) html += `<div class="te"><div class="te-title"><i class="fas ${l.icon}" style="color:var(--gold);margin-right:.5rem"></i>${l.title} <span style="color:var(--green);font-size:.78rem">finalizata</span></div><div class="te-time">${today}</div></div>`;
    });
    if (state.attempts > 0) {
      html += `<div class="te"><div class="te-title"><i class="fas fa-trophy" style="color:var(--gold);margin-right:.5rem"></i>Quiz completat x${state.attempts} | Scor max: ${state.best}%</div><div class="te-time">${today}</div></div>`;
    }
    state.unlocked.forEach(id => {
      const a = ACHIEVEMENTS.find(x => x.id === id);
      if (a) html += `<div class="te"><div class="te-title">${a.icon} Realizare deblocata: <strong>${a.name}</strong></div><div class="te-time">${today}</div></div>`;
    });
    tl.innerHTML = html || '<div style="padding:2rem;color:var(--txt2)">Nicio activitate inregistrata.</div>';
  }

  // ── DESPRE ──
  const DESPRE_INFO = {
    elev: 'Gaşpar Daniel Cătălin',
    clasa: '12D',
    scoala: 'Liceul Teoretic „Traian Lalescu” Orșova',
    prof: 'Papavă Gabi'
  };
  function renderDespre() {
    const el = id => document.getElementById(id);
    const dn = el('despreNume');
    if (dn && !dn._typed) { typewriter(dn, DESPRE_INFO.elev + ' — Exploratorul Universului', 35); dn._typed = true; }
    const map = {
      'di-elev': DESPRE_INFO.elev,
      'di-clasa': DESPRE_INFO.clasa,
      'di-scoala': DESPRE_INFO.scoala,
      'di-prof': DESPRE_INFO.prof
    };
    Object.entries(map).forEach(([id, value]) => { const node = el(id); if (node) node.textContent = value; });
  }

  // ── SEARCH (bara de cautare din header) ──
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  function doSearch() {
    const val = searchInput ? searchInput.value.trim() : '';
    if (currentPage !== 'carte') showPage('carte');
    renderLessonsGrid('all', val);
  }
  on(searchBtn, 'click', () => { playClick(); doSearch(); });
  if (searchInput) {
    on(searchInput, 'keydown', e => { if (e.key === 'Enter') doSearch(); });
    const debouncedSearch = debounce(() => {
      if (currentPage === 'carte') {
        renderLessonsGrid(activeFilter, searchInput.value.trim());
      }
    }, 120);
    on(searchInput, 'input', debouncedSearch);
  }

  // ── BUTON INAPOI SUS ──
  const btt = document.getElementById('backToTop');
  let scrollFramePending = false;
  function handleScrollUI() {
    scrollFramePending = false;
    if (btt) btt.style.display = window.scrollY > 300 ? 'flex' : 'none';
    updateReadBar();
  }
  window.addEventListener('scroll', () => {
    if (scrollFramePending) return;
    scrollFramePending = true;
    requestAnimationFrame(handleScrollUI);
  }, { passive: true });
  on(btt, 'click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); playClick(); });

  const bindLessonNav = (root, sel) => on(root, 'click', e => {
    const item = e.target.closest(sel);
    if (!item) return;
    playClick();
    showLesson(parseInt(item.dataset.lid, 10));
  });
  bindLessonNav(lessonsGrid, '.lcard');
  bindLessonNav(recentList, '.ri');
  bindLessonNav(missionList, '.mi');

  // ── SCURTĂTURI (Tastatura) ──
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (kbMod && kbMod.style.display === 'flex') {
      if (e.key === 'Escape') kbMod.style.display = 'none';
      return;
    }
    const key = e.key.toUpperCase();
    const keyActions = {
      D: () => showPage('dashboard'),
      L: () => showPage('carte'),
      Q: () => showPage('quiz'),
      T: () => {
        applyTheme(THEMES[(THEMES.indexOf(state.theme) + 1) % THEMES.length]);
        toast('Tema: ' + themeNames[state.theme], 'info', 1800);
      },
      S: () => { soundOn = !soundOn; },
      F: () => {
        factIdx = (factIdx + 1) % FACTS.length;
        renderFact(factIdx);
        toast('\uD83D\uDCA1 Fapt nou!', 'info', 2000);
      },
      '?': () => { if (kbMod) kbMod.style.display = 'flex'; },
      ESCAPE: () => { if (currentLessonId) { showPage('carte'); currentLessonId = null; } },
      ARROWLEFT: () => { if (currentLessonId && currentLessonId > 1) showLesson(currentLessonId - 1); },
      ARROWRIGHT: () => { if (currentLessonId && currentLessonId < 12) showLesson(currentLessonId + 1); }
    };
    if (keyActions[key]) { playClick(); keyActions[key](); }
  });

  // ── TRACK TIMPUL PETRECUT ──
  setInterval(() => {
    if (!document.hidden) {
      state.studyMin++;
      if (state.studyMin % 5 === 0) saveState();
    }
  }, 60000);

  // ── INITIALIZARE ──
  updateDashboard();
  checkAchievements();
  showPage('dashboard');
  setTimeout(() => {
    const hint = document.createElement('div');
    hint.className = 'kb-hint-pulse';
    hint.innerHTML = '<i class="fas fa-keyboard"></i> Apasa <kbd>?</kbd> pentru scurtaturi';
    document.body.appendChild(hint);
    setTimeout(() => { if (hint.parentNode) hint.remove(); }, 4200);
  }, 2500);

  // ══════════════════════════════════════════════════
  // TEME DE CULOARE
  // ══════════════════════════════════════════════════
  const THEMES = ['dark', 'light', 'nebula', 'aurora', 'mars'];
  const themeNames = { dark: 'Dark', light: 'Light', nebula: 'Nebula', aurora: 'Aurora', mars: 'Marte' };

  function applyTheme(t) {
    THEMES.forEach(th => document.body.classList.remove(th));
    if (t !== 'dark') document.body.classList.add(t);
    // Light theme e special, asa ca e separat!
    document.body.classList.toggle('light', t === 'light');
    state.theme = t;
    $$('.tpick').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
    const tBtn = document.getElementById('themeBtn');
    const icons = { dark: 'fa-moon', light: 'fa-sun', nebula: 'fa-star', aurora: 'fa-leaf', mars: 'fa-circle' };
    if (tBtn) tBtn.innerHTML = '<i class="fas ' + (icons[t] || 'fa-moon') + '"></i>';
    // Actualizează bara de sus din browser (theme-color)
    const mc = document.querySelector('meta[name="theme-color"]');
    const colors = { dark: '#05091a', light: '#e8edf8', nebula: '#0d0520', aurora: '#051a0d', mars: '#1a0800' };
    if (mc) mc.content = colors[t] || '#05091a';
    saveState();
  }

  // Aplică tema salvată
  applyTheme(localStorage.getItem('eu_theme') || 'dark');

  $$('.tpick').forEach(btn => on(btn, 'click', () => { playClick(); applyTheme(btn.dataset.theme); }));

  // Inlocuiește vechiul buton de temă pentru a cicla temele
  if (themeBtn) {
    themeBtn.onclick = () => {
      const cur = THEMES.indexOf(state.theme);
      applyTheme(THEMES[(cur + 1) % THEMES.length]);
      playClick();
      toast('Tema: ' + themeNames[state.theme], 'info', 1800);
    };
  }

  // ══════════════════════════════════════════════════
  // SCREENSAVER
  // ══════════════════════════════════════════════════
  const SS_QUOTES = [
    '"Universul este mai mare decat orice ai putea imagina." — Carl Sagan',
    '"Nu suntem decat praf de stele." — Carl Sagan',
    '"Daca stelele ar fi vizibile doar o noapte la fiecare mie de ani, oamenii ar privi cerul cu uimire." — Emerson',
    '"Undeva, ceva incredibil asteapta sa fie descoperit." — Carl Sagan',
    '"Priveste din nou acel punct. Acesta este acasa. Acesta suntem noi." — Carl Sagan',
    '"Cosmosul este tot ce a fost, tot ce este si tot ce va fi." — Carl Sagan',
    '"Doua lucruri sunt infinite: universul si prostia omeneasca. Despre univers nu sunt sigur." — Einstein',
    '"Astronomia ne umileste si ne formeaza caracterul mai mult decat orice alta stiinta." — Carl Sagan',
    '"Suntem un mod al cosmosului de a se cunoaste pe sine." — Carl Sagan',
    '"Cerul incepe acolo unde se termina Pamantul tau." — Romain Rolland'
  ];
  let ssTimeout = null, ssInterval = null, ssActive = false, ssQuoteIdx = 0;
  const SS_DELAY = 3 * 60 * 1000; // 3 minute

  function startScreensaver() {
    if (ssActive) return;
    ssActive = true;
    const ss = document.getElementById('screensaver');
    const cv = document.getElementById('ssCanvas');
    const qEl = document.getElementById('ssQuote');
    if (!ss || !cv) return;
    ss.style.display = 'flex';
    // Canvas stars
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    const ctx = cv.getContext('2d');
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height,
      r: Math.random() * 1.8 + .2, a: Math.random(), sp: Math.random() * .015 + .003,
      ph: Math.random() * Math.PI * 2
    }));
    // Nebula blobs
    const blobs = [
      { x: cv.width * .2, y: cv.height * .3, r: 200, c: 'rgba(124,92,255,.06)' },
      { x: cv.width * .8, y: cv.height * .7, r: 180, c: 'rgba(0,229,255,.05)' },
      { x: cv.width * .5, y: cv.height * .5, r: 250, c: 'rgba(255,217,102,.04)' }
    ];
    (function draw() {
      if (!ssActive) return;
      ctx.fillStyle = 'rgba(0,0,10,.3)'; ctx.fillRect(0, 0, cv.width, cv.height);
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      });
      stars.forEach(s => {
        s.ph += s.sp;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,220,255,' + (0.3 + 0.7 * Math.abs(Math.sin(s.ph))) + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    })();
    // Rotația citatelor
    ssQuoteIdx = 0;
    if (qEl) qEl.textContent = SS_QUOTES[0];
    ssInterval = setInterval(() => {
      ssQuoteIdx = (ssQuoteIdx + 1) % SS_QUOTES.length;
      if (qEl) qEl.textContent = SS_QUOTES[ssQuoteIdx];
    }, 7000);
  }

  function stopScreensaver() {
    if (!ssActive) return;
    ssActive = false;
    clearInterval(ssInterval);
    const ss = document.getElementById('screensaver');
    if (ss) ss.style.display = 'none';
    resetSsTimer();
  }

  function resetSsTimer() {
    clearTimeout(ssTimeout);
    ssTimeout = setTimeout(startScreensaver, SS_DELAY);
  }

  let ssResetDebounce = null;
  function queueSsTimerReset() {
    clearTimeout(ssResetDebounce);
    ssResetDebounce = setTimeout(resetSsTimer, 150);
  }

  document.getElementById('screensaver')?.addEventListener('click', stopScreensaver);
  document.addEventListener('keydown', e => { if (ssActive) { stopScreensaver(); return; } });
  ['mousemove', 'mousedown', 'touchstart', 'scroll'].forEach(ev => {
    document.addEventListener(ev, queueSsTimerReset, { passive: true });
  });
  resetSsTimer();

  // ══════════════════════════════════════════════════
  // CALCULATOR COSMIC
  // ══════════════════════════════════════════════════
  const CALCS = [
    {
      icon: '🪐', title: 'Varsta pe alte planete',
      desc: 'Cat de batran ai fi daca te-ai fi nascut pe alta planeta?',
      inputLabel: 'Varsta ta (ani pamanteni)', unit: 'ani', min: 1, max: 120, step: 1, default: 16,
      calc: function (v) {
        const orbits = { Mercur: 0.241, Venus: 0.615, Marte: 1.881, Jupiter: 11.86, Saturn: 29.46, Uranus: 84.01, Neptun: 164.8 };
        let res = '';
        for (const [p, o] of Object.entries(orbits)) {
          res += p + ': <strong>' + (v / o).toFixed(1) + ' ani</strong> | ';
        }
        return {
          main: 'Pe Mercur ai avea ' + (v / 0.241).toFixed(0) + ' ani!',
          sub: res.slice(0, -3)
        };
      }
    },
    {
      icon: '⚖️', title: 'Greutatea pe alte planete',
      desc: 'Cat ai cantari pe fiecare planeta din Sistemul Solar?',
      inputLabel: 'Greutatea ta pe Pamant', unit: 'kg', min: 1, max: 300, step: 1, default: 65,
      calc: function (v) {
        const g = { Mercur: 0.376, Venus: 0.889, Luna: 0.166, Marte: 0.379, Jupiter: 2.528, Saturn: 1.065, Uranus: 0.905, Neptun: 1.137 };
        let res = '';
        for (const [p, f] of Object.entries(g)) {
          res += p + ': <strong>' + (v * f).toFixed(1) + ' kg</strong> | ';
        }
        return {
          main: 'Pe Jupiter ai cantari ' + (v * 2.528).toFixed(1) + ' kg!',
          sub: res.slice(0, -3)
        };
      }
    },
    {
      icon: '🚀', title: 'Timp de calatorie spre planete',
      desc: 'Cat dureaza o calatorie spre celelalte planete la viteza maxima a rachetelor actuale?',
      inputLabel: 'Viteza navetei (km/s)', unit: 'km/s', min: 1, max: 50, step: 0.1, default: 17.5,
      calc: function (v) {
        const dist = { Luna: 384400, Marte: 225e6, Jupiter: 628e6, Saturn: 1275e6, Uranus: 2724e6, Neptun: 4351e6 };
        let res = '';
        for (const [p, d] of Object.entries(dist)) {
          const sec = d / v;
          const zile = Math.floor(sec / 86400);
          const ani = (zile / 365).toFixed(1);
          res += p + ': <strong>' + (zile > 365 ? ani + ' ani' : zile + ' zile') + '</strong> | ';
        }
        return {
          main: 'Spre Marte: ' + Math.floor(225e6 / v / 86400) + ' zile!',
          sub: res.slice(0, -3)
        };
      }
    },
    {
      icon: '💡', title: 'Viteza luminii — distante',
      desc: 'In cat timp ar ajunge lumina la diverse corpuri ceresti?',
      inputLabel: 'Distanta in ani-lumina', unit: 'al', min: 0.001, max: 10000, step: 0.001, default: 4.24,
      calc: function (v) {
        const sec = v * 365.25 * 24 * 3600;
        const ani = v, luni = v * 12, zile = v * 365.25, ore = v * 8766;
        return {
          main: v + ' ani-lumina = ' + (v * 9.461e12).toExponential(2) + ' km',
          sub: 'Lumina parcurge aceasta distanta in: <strong>' + ani.toFixed(2) + ' ani</strong> = <strong>' + Math.floor(zile) + ' zile</strong> = <strong>' + Math.floor(ore).toLocaleString() + ' ore</strong>'
        };
      }
    },
    {
      icon: '☄️', title: 'Energia unui impact de asteroid',
      desc: 'Cat de distructiv ar fi impactul unui asteroid cu Pamantul?',
      inputLabel: 'Diametrul asteroidului', unit: 'm', min: 1, max: 10000, step: 1, default: 100,
      calc: function (v) {
        // TNT equivalent: E = 0.5 * m * v^2, density ~2000 kg/m3, speed 20km/s
        const mass = (4 / 3) * Math.PI * Math.pow(v / 2, 3) * 2000;
        const energy = 0.5 * mass * Math.pow(20000, 2); // joules
        const tnt = energy / 4.184e9; // kg TNT
        let desc = '';
        if (tnt < 1000) desc = 'Impact local mic';
        else if (tnt < 1e6) desc = 'Impact regional - distrugere orase';
        else if (tnt < 1e9) desc = 'Impact continental - catastrofa';
        else desc = 'Impact global - extinctie in masa';
        return {
          main: (tnt / 1e6).toExponential(2) + ' megatone TNT',
          sub: '<strong>' + desc + '</strong>. Bomba din Hiroshima = 0.015 kt. Impactul care a ucis dinozaurii = ~100 Tt TNT.'
        };
      }
    },
    {
      icon: '🌌', title: 'Expansiunea universului',
      desc: 'Cat de repede se indeparteaza o galaxie de noi?',
      inputLabel: 'Distanta galaxiei', unit: 'Mpc', min: 1, max: 10000, step: 1, default: 100,
      calc: function (v) {
        const H0 = 67.4; // km/s/Mpc
        const viteza = H0 * v;
        const pct = (viteza / 299792 * 100).toFixed(2);
        return {
          main: (viteza).toLocaleString() + ' km/s',
          sub: 'O galaxie la ' + v + ' Mpc se indeparteaza cu <strong>' + pct + '% din viteza luminii</strong>. Constantele Hubble: H\u2080 = ' + H0 + ' km/s/Mpc.'
        };
      }
    }
  ];

  function renderCalculator() {
    const grid = document.getElementById('calcGrid');
    if (!grid || grid.dataset.rendered) return;
    grid.dataset.rendered = '1';
    grid.innerHTML = CALCS.map((c, i) => `
      <div class="calc-card">
        <div class="calc-icon">${c.icon}</div>
        <div class="calc-title">${c.title}</div>
        <div class="calc-desc">${c.desc}</div>
        <div>
          <div style="font-size:.75rem;color:var(--txt2);margin-bottom:.4rem">${c.inputLabel}</div>
          <div class="calc-input-wrap">
            <input type="number" class="calc-input" id="ci${i}" value="${c.default}" min="${c.min}" max="${c.max}" step="${c.step}">
            <span class="calc-unit">${c.unit}</span>
            <button class="calc-btn" data-ci="${i}">Calculeaza</button>
          </div>
        </div>
        <div class="calc-result" id="cr${i}">
          <div class="cr-main" id="crm${i}"></div>
          <div class="cr-sub" id="crs${i}"></div>
        </div>
      </div>`).join('');

    const runCalc = i => {
      playClick();
      const val = parseFloat(byId('ci' + i).value);
      if (isNaN(val)) return;
      const res = CALCS[i].calc(val);
      const rm = byId('crm' + i), rs = byId('crs' + i), rc = byId('cr' + i);
      if (rm) rm.textContent = res.main;
      if (rs) rs.innerHTML = res.sub;
      if (rc) rc.classList.add('show');
      playSuccess();
    };
    on(grid, 'click', e => {
      const btn = e.target.closest('.calc-btn');
      if (!btn) return;
      runCalc(parseInt(btn.dataset.ci, 10));
    });
    on(grid, 'keydown', e => {
      if (e.key !== 'Enter' || !e.target.classList.contains('calc-input')) return;
      const btn = e.target.parentElement && e.target.parentElement.querySelector('.calc-btn');
      if (!btn) return;
      runCalc(parseInt(btn.dataset.ci, 10));
    });
  }

  // ══════════════════════════════════════════════════
  // COMPARATOR PLANETE
  // ══════════════════════════════════════════════════
  const PLANETS_DATA = [
    {
      name: 'Mercur', icon: '\u263F', color: '#aaa',
      stats: { diametru: '4,879 km', masa: '3.3×10²³ kg', gravitate: '3.7 m/s²', temp: '-180 / +430 °C', orbita: '87.97 zile', luni: '0', atmosfera: 'Practic inexistenta', viteza_orb: '47.9 km/s' }
    },
    {
      name: 'Venus', icon: '\u2640', color: '#e8c060',
      stats: { diametru: '12,104 km', masa: '4.87×10²⁴ kg', gravitate: '8.87 m/s²', temp: '+470 °C', orbita: '224.7 zile', luni: '0', atmosfera: 'CO₂ dens (92 atm)', viteza_orb: '35.0 km/s' }
    },
    {
      name: 'Pamant', icon: '\u2641', color: '#4b8dd9',
      stats: { diametru: '12,742 km', masa: '5.97×10²⁴ kg', gravitate: '9.8 m/s²', temp: '-88 / +58 °C', orbita: '365.25 zile', luni: '1', atmosfera: 'N₂ + O₂', viteza_orb: '29.8 km/s' }
    },
    {
      name: 'Marte', icon: '\u2642', color: '#c1440e',
      stats: { diametru: '6,779 km', masa: '6.39×10²³ kg', gravitate: '3.72 m/s²', temp: '-125 / +20 °C', orbita: '686.97 zile', luni: '2', atmosfera: 'CO₂ slab (0.01 atm)', viteza_orb: '24.1 km/s' }
    },
    {
      name: 'Jupiter', icon: '♃', color: '#c88b3a',
      stats: { diametru: '142,984 km', masa: '1.9×10²⁷ kg', gravitate: '24.8 m/s²', temp: '-110 °C (nori)', orbita: '11.86 ani', luni: '95', atmosfera: 'H₂ + He', viteza_orb: '13.1 km/s' }
    },
    {
      name: 'Saturn', icon: '♄', color: '#e8d5a3',
      stats: { diametru: '120,536 km', masa: '5.68×10²⁶ kg', gravitate: '10.4 m/s²', temp: '-140 °C (nori)', orbita: '29.46 ani', luni: '146', atmosfera: 'H₂ + He', viteza_orb: '9.7 km/s' }
    },
    {
      name: 'Uranus', icon: '♅', color: '#7de8e8',
      stats: { diametru: '51,118 km', masa: '8.68×10²⁵ kg', gravitate: '8.69 m/s²', temp: '-195 °C', orbita: '84.01 ani', luni: '28', atmosfera: 'H₂ + He + CH₄', viteza_orb: '6.8 km/s' }
    },
    {
      name: 'Neptun', icon: '♆', color: '#5b7fde',
      stats: { diametru: '49,244 km', masa: '1.02×10²⁶ kg', gravitate: '11.2 m/s²', temp: '-200 °C', orbita: '164.8 ani', luni: '16', atmosfera: 'H₂ + He + CH₄', viteza_orb: '5.4 km/s' }
    },
    {
      name: 'Luna', icon: '\uD83C\uDF19', color: '#aaa',
      stats: { diametru: '3,474 km', masa: '7.34×10²² kg', gravitate: '1.62 m/s²', temp: '-173 / +127 °C', orbita: '27.3 zile (Pamant)', luni: '0', atmosfera: 'Practic inexistenta', viteza_orb: '1.02 km/s' }
    },
    {
      name: 'Pluto', icon: '\u2647', color: '#c8aa8a',
      stats: { diametru: '2,376 km', masa: '1.3×10²² kg', gravitate: '0.62 m/s²', temp: '-230 °C', orbita: '248 ani', luni: '5', atmosfera: 'N₂ slab', viteza_orb: '4.7 km/s' }
    }
  ];
  const STAT_LABELS = { diametru: 'Diametru', masa: 'Masa', gravitate: 'Gravitatie', temp: 'Temperatura', orbita: 'Orbita', luni: 'Luni', atmosfera: 'Atmosfera', viteza_orb: 'Viteza orbitala' };

  function renderComparator() {
    const s1 = document.getElementById('compSel1');
    const s2 = document.getElementById('compSel2');
    if (!s1 || s1.dataset.rendered) return;
    s1.dataset.rendered = '1';
    const opts = PLANETS_DATA.map((p, i) => `<option value="${i}">${p.icon} ${p.name}</option>`).join('');
    s1.innerHTML = opts; s2.innerHTML = opts;
    s1.value = '2'; s2.value = '3'; // Pamant vs Marte default
    const makeRows = (planet, keys) => keys.map(k =>
      `<div class="cpc-row"><span class="cpc-lbl">${STAT_LABELS[k]}</span><span class="cpc-val">${planet.stats[k] || '-'}</span></div>`
    ).join('');
    function update() {
      const p1 = PLANETS_DATA[parseInt(s1.value)];
      const p2 = PLANETS_DATA[parseInt(s2.value)];
      const res = document.getElementById('compResult');
      if (!res) return;
      const keys = Object.keys(STAT_LABELS);
      const p1rows = makeRows(p1, keys);
      const p2rows = makeRows(p2, keys);
      const labels = keys.map(k => `<div class="cm-row">${STAT_LABELS[k]}</div>`).join('');
      res.innerHTML = `<div class="comp-result-grid">
        <div class="comp-planet-card">
          <div class="cpc-icon" style="color:${p1.color}">${p1.icon}</div>
          <div class="cpc-name" style="color:${p1.color}">${p1.name}</div>
          <div class="cpc-stats">${p1rows}</div>
        </div>
        <div class="comp-middle">${labels}</div>
        <div class="comp-planet-card">
          <div class="cpc-icon" style="color:${p2.color}">${p2.icon}</div>
          <div class="cpc-name" style="color:${p2.color}">${p2.name}</div>
          <div class="cpc-stats">${p2rows}</div>
        </div>
      </div>`;
      playClick();
    }
    s1.addEventListener('change', update);
    s2.addEventListener('change', update);
    update();
  }

  // ══════════════════════════════════════════════════
  // CER DE NOAPTE
  // ══════════════════════════════════════════════════
  const CONSTELLATIONS = [
    { name: 'Orion', type: 'south', stars: [[350, 200], [380, 240], [410, 200], [370, 270], [370, 310], [340, 350], [400, 350], [340, 180], [410, 180]], lines: [[0, 2], [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [4, 6], [0, 7], [2, 8]], mainStar: 1, desc: 'Cea mai recunoscuta constelatie. Centura cu 3 stele (Mintaka, Alnilam, Alnitak) e usor de identificat.', bright: 'Rigel, Betelgeuse, Bellatrix' },
    { name: 'Ursa Major', type: 'north', stars: [[100, 150], [140, 140], [180, 150], [220, 160], [250, 130], [230, 90], [190, 80]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4]], mainStar: 6, desc: 'Carul Mare - 7 stele formand o cupa cu coada. Stelele de capat indica spre Steaua Polara.', bright: 'Dubhe, Merak, Alioth, Mizar' },
    { name: 'Cassiopeia', type: 'north', stars: [[550, 100], [590, 130], [630, 100], [670, 130], [710, 100]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]], mainStar: 2, desc: 'Forma de W sau M. Usor de gasit in emisfera nordica, mereu vizibila in Romania.', bright: 'Schedar, Caph, Gamma Cas, Ruchbah' },
    { name: 'Leo', type: 'zodiac', stars: [[200, 300], [230, 270], [260, 290], [280, 320], [240, 350], [200, 360], [170, 340]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [2, 4]], mainStar: 0, desc: 'Leul zodiacal. Capul e format din stele in forma de secera. Regulus e inima leului.', bright: 'Regulus, Denebola, Gamma Leo' },
    { name: 'Scorpius', type: 'zodiac', stars: [[600, 300], [630, 320], [650, 350], [630, 390], [600, 420], [570, 440], [560, 470], [590, 490], [620, 480]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]], mainStar: 0, desc: 'Scorpionul zodiacal cu Antares (inima rosie). Vizibil vara in emisfera sudica.', bright: 'Antares, Sargas, Shaula' },
    { name: 'Lyra', type: 'south', stars: [[500, 200], [520, 230], [480, 240], [490, 260], [530, 260], [515, 280]], lines: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 1], [3, 5], [4, 5]], mainStar: 0, desc: 'Harpa cereasca cu Vega - una din cele mai stralucitoare stele. Parte din Triunghiul de Vara.', bright: 'Vega (5a stea ca stralucire)' },
    { name: 'Cygnus', type: 'north', stars: [[650, 220], [620, 250], [650, 280], [680, 250], [650, 310], [650, 180]], lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [0, 5]], mainStar: 0, desc: 'Lebada cereasca, numita si Crucea Nordului. Deneb e una din stelele mai indepartate vizibile cu ochiul liber.', bright: 'Deneb, Albireo, Sadr' },
    { name: 'Gemini', type: 'zodiac', stars: [[280, 150], [260, 180], [240, 210], [310, 160], [290, 190], [270, 220]], lines: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5]], mainStar: 0, desc: 'Gemenii - Castor si Pollux. Castor este de fapt un sistem cu 6 stele. Vizibili iarna.', bright: 'Pollux, Castor, Alhena' },
  ];

  let cerFilter = 'all', cerSelected = null;

  function renderCer() {
    const cv = document.getElementById('cerCanvas');
    if (!cv || cv.dataset.rendered) return;
    cv.dataset.rendered = '1';
    cv.width = cv.parentElement.clientWidth;
    cv.height = Math.min(500, window.innerHeight * 0.55);
    drawCer(cv, cerFilter);
    cv.addEventListener('click', e => {
      const rect = cv.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (cv.width / rect.width);
      const my = (e.clientY - rect.top) * (cv.height / rect.height);
      const scaleX = cv.width / 800, scaleY = cv.height / 500;
      let hit = null, minDist = 30;
      CONSTELLATIONS.forEach((con, ci) => {
        if (cerFilter !== 'all' && con.type !== cerFilter) return;
        con.stars.forEach(([sx, sy]) => {
          const d = Math.hypot(mx - sx * scaleX, my - sy * scaleY);
          if (d < minDist) { minDist = d; hit = ci; }
        });
      });
      cerSelected = hit;
      drawCer(cv, cerFilter);
      const ib = document.getElementById('cerInfoBox');
      if (hit !== null) {
        const c = CONSTELLATIONS[hit];
        document.getElementById('cibName').textContent = c.name;
        document.getElementById('cibDesc').textContent = c.desc;
        document.getElementById('cibStars').textContent = 'Stele principale: ' + c.bright;
        if (ib) ib.style.display = 'block';
        playClick();
      } else {
        if (ib) ib.style.display = 'none';
      }
    });
    document.querySelectorAll('.cer-controls .chip').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.cer-controls .chip').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        cerFilter = this.dataset.const;
        cerSelected = null;
        document.getElementById('cerInfoBox').style.display = 'none';
        drawCer(cv, cerFilter);
        playClick();
      });
    });
  }

  function drawCer(cv, filter) {
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const sx = W / 800, sy = H / 500;
    ctx.fillStyle = '#000814'; ctx.fillRect(0, 0, W, H);
    // Draw bg stars
    if (!cv._bgstars) {
      cv._bgstars = Array.from({ length: 200 }, () => ({ x: Math.random() * 800, y: Math.random() * 500, r: Math.random() * .8 + .1, a: Math.random() * .5 + .2 }));
    }
    cv._bgstars.forEach(s => {
      ctx.beginPath(); ctx.arc(s.x * sx, s.y * sy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,220,255,' + s.a + ')'; ctx.fill();
    });
    // Draw constellations
    CONSTELLATIONS.forEach((con, ci) => {
      if (filter !== 'all' && con.type !== filter) return;
      const isSelected = cerSelected === ci;
      const alpha = isSelected ? 1 : 0.7;
      const lineColor = isSelected ? 'rgba(0,229,255,0.7)' : 'rgba(124,92,255,0.45)';
      // Lines
      ctx.strokeStyle = lineColor; ctx.lineWidth = isSelected ? 1.5 : 1;
      ctx.setLineDash([4, 4]);
      con.lines.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(con.stars[a][0] * sx, con.stars[a][1] * sy);
        ctx.lineTo(con.stars[b][0] * sx, con.stars[b][1] * sy);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      // Stars
      con.stars.forEach(([x, y], si) => {
        const isMain = si === con.mainStar;
        const r = isMain ? (isSelected ? 5 : 4) : (isSelected ? 3 : 2);
        ctx.beginPath(); ctx.arc(x * sx, y * sy, r, 0, Math.PI * 2);
        ctx.fillStyle = isMain ? (isSelected ? '#00e5ff' : '#FFD966') : 'rgba(200,220,255,' + alpha + ')';
        ctx.fill();
        if (isMain && isSelected) {
          ctx.beginPath(); ctx.arc(x * sx, y * sy, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0,229,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
        }
      });
      // Label
      const cx = con.stars.reduce((s, [x]) => s + x, 0) / con.stars.length;
      const cy = Math.min(...con.stars.map(([, y]) => y)) - 14;
      ctx.fillStyle = isSelected ? '#00e5ff' : 'rgba(255,217,102,0.85)';
      ctx.font = (isSelected ? 'bold ' : '') + Math.round(11 * Math.min(sx, sy) * 1.2) + 'px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(con.name, cx * sx, cy * sy);
    });
  }

  // ══════════════════════════════════════════════════
  // HARTA SISTEM SOLAR
  // ══════════════════════════════════════════════════
  let hartaAnimId = null, hartaPaused = false, hartaAngle = 0, hartaSpeed = 1;

  function renderHarta() {
    const cv = document.getElementById('hartaCanvas');
    if (!cv) return;
    
    if (hartaAnimId) { cancelAnimationFrame(hartaAnimId); hartaAnimId = null; }
    
    cv.width = 900;
    cv.height = 550;
    cv._bg = null;
    hartaAngle = 0;

    const ctx = cv.getContext('2d');
    const cx = cv.width / 2;
    const cy = cv.height / 2;

    const PLANETS_DATA = [
      { name: 'Soare', r: 35, color: '#FFD966', glow: '#ff8800', period: 0,
        facts: { Tip: 'Stea G2V - Pitica Galbena', Diametru: '1,392,700 km', Masa: '1.99×10³⁰ kg', Temperatura: '5,500°C suprafata', Compozitie: '75% Hidrogen, 25% Heliu' }},
      { name: 'Mercur', r: 5, color: '#aaa', glow: '#888', period: 4,
        facts: { Diametru: '4,879 km', Distanta: '57.9 milioane km', Temp: '-180°C / +430°C', Sateliti: '0', Atm: 'Foarte subtire' }},
      { name: 'Venus', r: 7, color: '#e8c060', glow: '#ffaa00', period: 8,
        facts: { Diametru: '12,104 km', Distanta: '108.2 milioane km', Temp: '+470°C (cea mai calda)', Sateliti: '0', Atm: 'CO₂ (92 atm)' }},
      { name: 'Pamant', r: 8, color: '#4b8dd9', glow: '#0066ff', period: 12,
        facts: { Diametru: '12,742 km', Distanta: '149.6 milioane km', Temp: '-88°C / +58°C', Sateliti: '1 (Luna)', Atm: 'N₂ + O₂' }},
      { name: 'Marte', r: 6, color: '#c1440e', glow: '#ff4400', period: 18,
        facts: { Diametru: '6,779 km', Distanta: '227.9 milioane km', Temp: '-125°C / +20°C', Sateliti: '2 (Phobos, Deimos)', Atm: 'CO₂ (foarte subtire)' }},
      { name: 'Jupiter', r: 20, color: '#c88b3a', glow: '#ff8844', period: 35,
        facts: { Diametru: '142,984 km', Distanta: '778.5 milioane km', Temp: '-110°C (nori)', Sateliti: '95', Atm: 'H² + He' }},
      { name: 'Saturn', r: 17, color: '#e8d5a3', glow: '#ddaa66', period: 55,
        facts: { Diametru: '120,536 km', Distanta: '1.43 miliarde km', Temp: '-140°C', Sateliti: '146 (incl. Titan)', Atm: 'H² + He + inele spectaculoase' }},
      { name: 'Uranus', r: 12, color: '#7de8e8', glow: '#00cccc', period: 80,
        facts: { Diametru: '51,118 km', Distanta: '2.87 miliarde km', Temp: '-195°C', Sateliti: '28', Atm: 'H² + He + CH₄ (inclinat 98°)' }},
      { name: 'Neptun', r: 11, color: '#5b7fde', glow: '#3355cc', period: 100,
        facts: { Diametru: '49,244 km', Distanta: '4.5 miliarde km', Temp: '-200°C', Sateliti: '16', Atm: 'H² + He + CH₄' }}
    ];

    const ORBITS = [0, 60, 90, 125, 165, 230, 290, 345, 390];
    cv._planetState = PLANETS_DATA;

    if (!cv._listenersAdded) {
      cv._listenersAdded = true;
      
      cv.addEventListener('click', function(e) {
        const rect = cv.getBoundingClientRect();
        const scaleX = cv.width / rect.width;
        const scaleY = cv.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        
        let hit = null;
        let minDist = 40;
        const planets = cv._planetState || PLANETS_DATA;
        planets.forEach((p, i) => {
          const px = p._x || 0;
          const py = p._y || 0;
          const d = Math.hypot(mx - px, my - py);
          if (d < p.r + 25 && d < minDist) { 
            minDist = d; 
            hit = i; 
          }
        });
        if (hit !== null) {
          const p = planets[hit];
          const info = document.getElementById('hartaInfo');
          if (info) {
            document.getElementById('hiName').textContent = '☀️ ' + p.name;
            let factsHtml = '';
            for (let [key, value] of Object.entries(p.facts)) {
              factsHtml += '<div class="hi-row"><span class="hi-lbl">' + key + '</span><span class="hi-val">' + value + '</span></div>';
            }
            document.getElementById('hiFacts').innerHTML = factsHtml;
            info.style.display = 'block';
          }
          playClick();
        } else {
          document.getElementById('hartaInfo').style.display = 'none';
        }
      });
      
      cv.addEventListener('mousemove', function(e) {
        const rect = cv.getBoundingClientRect();
        const scaleX = cv.width / rect.width;
        const scaleY = cv.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        
        let hit = false;
        const planets = cv._planetState || PLANETS_DATA;
        planets.forEach((p) => {
          const px = p._x || 0;
          const py = p._y || 0;
          const d = Math.hypot(mx - px, my - py);
          if (d < p.r + 25) hit = true;
        });
        
        cv.style.cursor = hit ? 'pointer' : 'default';
      });
    }

    const slider = document.getElementById('orbitSpeed');
    if (slider) {
      slider.oninput = function() { hartaSpeed = parseFloat(this.value); };
    }

    const pBtn = document.getElementById('pauseOrbit');
    if (pBtn) {
      pBtn.onclick = function() {
        hartaPaused = !hartaPaused;
        this.innerHTML = hartaPaused ? '<i class="fas fa-play"></i> Reia' : '<i class="fas fa-pause"></i> Pauza';
        if (!hartaPaused) loop();
      };
    }

    const hc = document.getElementById('hartaClose');
    if (hc) {
      hc.onclick = function() {
        document.getElementById('hartaInfo').style.display = 'none';
      };
    }

    function loop() {
      ctx.fillStyle = '#000814';
      ctx.fillRect(0, 0, cv.width, cv.height);

      if (!cv._bg) {
        cv._bg = [];
        for (let i = 0; i < 150; i++) {
          cv._bg.push({
            x: Math.random() * cv.width,
            y: Math.random() * cv.height,
            r: Math.random() * 1.5 + 0.3,
            a: Math.random() * 0.5 + 0.3
          });
        }
      }
      cv._bg.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,220,255,' + s.a + ')';
        ctx.fill();
      });

      if (!hartaPaused) hartaAngle += 0.005 * hartaSpeed;

      PLANETS_DATA.forEach((p, i) => {
        const orb = ORBITS[i];

        if (i === 0) {
          const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.r * 2);
          sg.addColorStop(0, '#fffbe0');
          sg.addColorStop(0.5, p.color);
          sg.addColorStop(1, 'transparent');
          ctx.fillStyle = sg;
          ctx.beginPath(); ctx.arc(cx, cy, p.r * 2, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(cx, cy, p.r, 0, Math.PI * 2); ctx.fill();
          p._x = cx; p._y = cy;
          return;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, orb, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const angle = hartaAngle / p.period;
        const px = cx + Math.cos(angle) * orb;
        const py = cy + Math.sin(angle) * orb;

        if (p.name === 'Saturn') {
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(1, 0.3);
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(232,213,163,0.6)';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '11px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, px, py + p.r + 12);

        p._x = px;
        p._y = py;
      });

      if (!hartaPaused) {
        hartaAnimId = requestAnimationFrame(loop);
      }
    }

    loop();
  }

}); // END DOMContentLoaded
