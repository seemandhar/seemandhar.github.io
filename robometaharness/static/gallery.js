'use strict';
(() => {
  const root = document.getElementById('gallery');
  if (!root) return;

  const BASE = 'static/gallery/';
  const PAGE = 24;
  const SETTING = { tasks: 'Unseen tasks', scenes: 'Unseen scenes' };
  const POLICIES = ['π0.5', 'π0-FAST', 'OpenVLA'];
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = id => document.getElementById(id);
  const grid = $('clip-grid');
  const status = $('gallery-count');
  const moreWrap = $('gallery-more-wrap');
  const moreBtn = $('gallery-more');
  const allBtn = $('gallery-all');
  const empty = $('gallery-empty');
  const search = $('gallery-search');
  const ratesBody = $('gallery-rates-body');

  const state = { policy: 'all', setting: 'all', q: '' };
  let clips = [];
  let view = [];
  let shown = 0;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const time = s => { s = Math.round(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const pct = x => `${x.toFixed(1)}%`;
  const POLICY_KEY = { 'π0.5': 'pi05', 'π0-FAST': 'pi0fast', OpenVLA: 'openvla' };
  const policyKey = p => POLICY_KEY[p] || 'other';
  const caseShort = id => id.replace(/^libero_[a-z0-9]+_(task|env)_/, '').replace('_', ' · ');

  function matches(c, skip) {
    const q = state.q.trim().toLowerCase();
    return (skip === 'policy' || state.policy === 'all' || c.policy === state.policy)
      && (skip === 'setting' || state.setting === 'all' || c.setting === state.setting)
      && (!q || c.instruction.toLowerCase().includes(q) || c.id.includes(q) || c.suite.toLowerCase().includes(q));
  }

  // ---- cards ---------------------------------------------------------------
  function card(c, i) {
    const li = el('li');
    const btn = el('button', 'clip');
    btn.type = 'button';
    btn.dataset.idx = i;
    btn.setAttribute('aria-label', `Play ${c.policy}, ${SETTING[c.setting]}: ${c.instruction}`);

    const media = el('span', 'clip-media');
    const img = el('img');
    img.src = `${BASE}posters/${c.file}.webp`;
    img.width = 720; img.height = 438;
    img.loading = 'lazy'; img.decoding = 'async'; img.alt = '';
    media.append(img, el('span', 'clip-play'), el('span', 'clip-time', time(c.dur)));
    if (c.note) media.append(el('span', 'clip-flag', 'Scripted re-grasp'));

    const body = el('span', 'clip-body');
    const tags = el('span', 'clip-tags');
    const pol = el('span', `tag tag-${policyKey(c.policy)}`, c.policy);
    tags.append(pol, el('span', 'tag', SETTING[c.setting]), el('span', 'tag tag-quiet', c.suite));
    const instr = el('span', 'clip-instr', `“${c.instruction}”`);
    const foot = el('span', 'clip-foot');
    const rate = el('span', 'clip-rate');
    rate.append(el('span', 'clip-rate-a', pct(c.alone)), el('span', 'clip-rate-arrow', '→'), el('strong', null, pct(c.d1)));
    rate.title = `Cell success on identical seeded cases: policy alone ${pct(c.alone)}, policy + PGD-Ground D1 ${pct(c.d1)} (n = ${c.n})`;
    foot.append(el('code', null, caseShort(c.id)), rate);
    body.append(tags, instr, foot);

    btn.append(media, body);
    btn.addEventListener('click', () => openAt(Number(btn.dataset.idx)));
    if (canHover && !reduceMotion) attachPreview(btn, media, c);
    li.append(btn);
    return li;
  }

  function attachPreview(btn, media, c) {
    let timer = 0;
    let vid = null;
    const stop = () => {
      clearTimeout(timer);
      btn.classList.remove('is-previewing');
      if (vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); vid.remove(); vid = null; }
    };
    btn.addEventListener('pointerenter', () => {
      timer = setTimeout(() => {
        vid = el('video', 'clip-preview');
        vid.muted = true; vid.setAttribute('muted', '');
        vid.loop = true; vid.playsInline = true; vid.setAttribute('playsinline', '');
        vid.preload = 'auto';
        vid.src = `${BASE}small/${c.file}.mp4`;
        vid.addEventListener('playing', () => btn.classList.add('is-previewing'), { once: true });
        media.append(vid);
        vid.play().catch(() => {});
      }, 140);
    });
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('click', stop);
  }

  // ---- filtering & paging --------------------------------------------------
  function apply() {
    view = clips.filter(c => matches(c));
    shown = 0;
    grid.replaceChildren();
    renderMore(PAGE);
    updateFacets();
  }

  function renderMore(k) {
    const frag = document.createDocumentFragment();
    const end = Math.min(view.length, shown + k);
    for (let i = shown; i < end; i++) frag.append(card(view[i], i));
    grid.append(frag);
    shown = end;
    const rem = view.length - shown;
    status.textContent = view.length
      ? `Showing ${shown} of ${view.length} clip${view.length === 1 ? '' : 's'}`
      : 'No clips match these filters';
    moreWrap.hidden = rem <= 0;
    moreBtn.textContent = `Show ${Math.min(PAGE, rem)} more`;
    allBtn.textContent = `Show all ${view.length}`;
    empty.hidden = view.length > 0;
  }

  function updateFacets() {
    for (const group of root.querySelectorAll('.seg[data-filter]')) {
      const key = group.dataset.filter;
      for (const b of group.querySelectorAll('button')) {
        const v = b.dataset.value;
        b.setAttribute('aria-pressed', String(state[key] === v));
        const n = clips.filter(c => matches(c, key) && (v === 'all' || c[key] === v)).length;
        const span = b.querySelector('.seg-n');
        if (span) span.textContent = n;
        b.classList.toggle('is-zero', n === 0);
      }
    }
  }

  for (const group of root.querySelectorAll('.seg[data-filter]')) {
    group.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      state[group.dataset.filter] = b.dataset.value;
      apply();
    });
  }
  let searchTimer = 0;
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = search.value; apply(); }, 120);
  });
  moreBtn.addEventListener('click', () => renderMore(PAGE));
  allBtn.addEventListener('click', () => renderMore(view.length));
  $('gallery-clear').addEventListener('click', () => {
    state.policy = 'all'; state.setting = 'all'; state.q = ''; search.value = '';
    apply();
  });

  // ---- per-cell success table ----------------------------------------------
  function renderRates() {
    const cells = new Map();
    for (const c of clips) {
      if (!cells.has(c.cell)) cells.set(c.cell, { ...c, count: 0 });
      cells.get(c.cell).count++;
    }
    const rows = [...cells.values()].sort((a, b) =>
      (a.setting === b.setting ? 0 : a.setting === 'tasks' ? -1 : 1)
      || POLICIES.indexOf(a.policy) - POLICIES.indexOf(b.policy));
    let lastSetting = '';
    for (const r of rows) {
      if (r.setting !== lastSetting) {
        const tr = el('tr', 'rates-group');
        const th = el('th', null, `LIBERO-Pro ${SETTING[r.setting].toLowerCase()}`);
        th.colSpan = 7; th.scope = 'colgroup';
        tr.append(th);
        ratesBody.append(tr);
        lastSetting = r.setting;
      }
      const tr = el('tr');
      const th = el('th');
      th.scope = 'row';
      th.append(el('span', `tag tag-${policyKey(r.policy)}`, r.policy), el('span', 'rates-detail', `${r.detail} · n = ${r.n}`));
      const bar = el('td', 'rates-bar');
      const track = el('span', 'dumbbell');
      track.style.setProperty('--a', r.alone);
      track.style.setProperty('--b', r.d1);
      track.setAttribute('aria-hidden', 'true');
      track.append(el('i', 'db-line'), el('i', 'db-a'), el('i', 'db-b'));
      bar.append(track);
      tr.append(th, el('td', 'num', pct(r.alone)), el('td', 'num strong', pct(r.d1)),
        el('td', 'num gain', `+${r.delta.toFixed(1)}`), bar,
        el('td', 'num', r.wl ?? '—'), el('td', 'num', String(r.count)));
      ratesBody.append(tr);
    }
  }

  // ---- lightbox --------------------------------------------------------------
  const dlg = $('clip-dialog');
  const dv = $('clip-video');
  let cur = 0;
  let lastFocus = null;
  let rate = 1;

  function openAt(i) {
    if (!dlg.open) { lastFocus = document.activeElement; dlg.showModal(); }
    show(i);
  }

  function show(i) {
    if (!view.length) return;
    cur = (i + view.length) % view.length;
    const c = view[cur];
    $('clip-kicker').replaceChildren(...[c.policy, SETTING[c.setting], ...c.detail.split(' · ')]
      .flatMap((t, k) => (k ? [' · ', el('span', null, t)] : [el('span', null, t)])));
    $('clip-title').textContent = `“${c.instruction}”`;
    $('clip-pos').textContent = `${cur + 1} / ${view.length}`;
    $('clip-case').textContent = c.id;
    $('clip-suite').textContent = c.suite;
    $('clip-cell').replaceChildren(el('span', 'muted', pct(c.alone)), ' → ', el('strong', null, pct(c.d1)), el('span', 'muted', `  (n = ${c.n})`));
    $('clip-wl').textContent = c.wl ?? '—';
    const note = $('clip-note');
    note.hidden = !c.note;
    note.textContent = c.note ? `Scripted re-grasp. ${c.note}` : '';
    const src = `${BASE}full/${c.file}.mp4`;
    dv.poster = `${BASE}posters/${c.file}.webp`;
    dv.src = src;
    dv.defaultPlaybackRate = rate;
    dv.playbackRate = rate;
    dv.play().catch(() => {});
    const dl = $('clip-download');
    dl.href = src;
    dl.setAttribute('download', `${c.cell}_${c.id}.mp4`);
    // Warm the next poster so stepping feels instant.
    const next = view[(cur + 1) % view.length];
    if (next) new Image().src = `${BASE}posters/${next.file}.webp`;
  }

  $('clip-prev').addEventListener('click', () => show(cur - 1));
  $('clip-next').addEventListener('click', () => show(cur + 1));
  $('clip-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', e => {
    if (e.target === dv) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
  });
  dlg.addEventListener('close', () => {
    dv.pause();
    dv.removeAttribute('src');
    dv.load();
    // Keep the grid in sync with how far the viewer stepped.
    if (cur >= shown) renderMore(cur + 1 - shown);
    const target = grid.querySelector(`.clip[data-idx="${cur}"]`) || lastFocus;
    target?.focus({ preventScroll: false });
  });
  $('clip-speed').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    rate = Number(b.dataset.rate);
    dv.defaultPlaybackRate = rate;
    dv.playbackRate = rate;
    for (const x of $('clip-speed').querySelectorAll('button')) x.setAttribute('aria-pressed', String(x === b));
  });

  // ---- boot ------------------------------------------------------------------
  fetch(`${BASE}clips.json`)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      clips = data;
      $('gallery-total').textContent = clips.length;
      renderRates();
      apply();
    })
    .catch(() => { status.textContent = 'The gallery could not be loaded. Please refresh the page.'; });
})();
