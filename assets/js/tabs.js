/*
 * Turns the long single-column homepage into tabs.
 *
 * index.md stays plain Markdown: each "## Heading" (and the multi-agent viz block)
 * starts a section, and TABS below says which sections go in which tab. Without
 * JavaScript the page renders as one long page, exactly as before.
 */
(function () {
  var TABS = [
    { id: 'about',        label: 'About',              sections: ['about-me', 'research-interests'] },
    { id: 'news',         label: 'News',               sections: ['news'] },
    { id: 'publications', label: 'Publications',       sections: ['publications'] },
    { id: 'experience',   label: 'Experience & Service', sections: ['services', 'affiliations'] },
    { id: 'awards',       label: 'Awards & Media',     sections: ['highlights', 'honors--awards', 'media-coverage'] },
    { id: 'gallery',      label: 'Gallery',            sections: ['gallery'] }
  ];

  var main = document.querySelector('.wrapper > section');
  if (!main) return;

  // 1. Cut the section's children into chunks, one per heading / viz block.
  var chunks = {};
  var current = null;
  Array.prototype.slice.call(main.childNodes).forEach(function (node) {
    var startsChunk = node.nodeType === 1 &&
      ((node.tagName === 'H2' && node.id) || node.id === 'multiagent-section');
    if (startsChunk) { current = node.id; chunks[current] = []; }
    if (current) chunks[current].push(node);
  });

  // Any heading not listed in TABS goes into the About tab rather than vanishing.
  var listed = {};
  TABS.forEach(function (t) { t.sections.forEach(function (s) { listed[s] = true; }); });
  Object.keys(chunks).forEach(function (id) { if (!listed[id]) TABS[0].sections.push(id); });

  // 2. Build the tab bar and one panel per tab.
  var nav = document.createElement('nav');
  nav.className = 'site-tabs';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Sections');

  var panels = {};
  var buttons = {};
  var firstChild = main.firstChild;

  TABS.forEach(function (tab) {
    var panel = document.createElement('div');
    panel.className = 'tab-panel';
    panel.id = 'tab-' + tab.id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', 'tabbtn-' + tab.id);
    tab.sections.forEach(function (s) {
      (chunks[s] || []).forEach(function (n) { panel.appendChild(n); });
    });
    if (!panel.childNodes.length) return;

    var a = document.createElement('a');
    a.href = '#' + tab.id;
    a.id = 'tabbtn-' + tab.id;
    a.className = 'site-tab';
    a.setAttribute('role', 'tab');
    a.textContent = tab.label;
    nav.appendChild(a);

    panels[tab.id] = panel;
    buttons[tab.id] = a;
    main.insertBefore(panel, firstChild);
  });

  var cv = document.querySelector('header a .ai-cv');
  if (cv) {
    var cvLink = document.createElement('a');
    cvLink.href = cv.parentNode.href;
    cvLink.className = 'site-tab site-tab-external';
    cvLink.target = '_blank';
    cvLink.rel = 'noopener';
    cvLink.textContent = 'CV ↗';
    nav.appendChild(cvLink);
  }

  main.insertBefore(nav, main.firstChild);
  document.documentElement.classList.add('tabs-ready');

  // 3. Switching.
  function tabFor(hash) {
    var id = decodeURIComponent((hash || '').replace(/^#/, ''));
    if (!id) return { tab: 'about' };
    if (panels[id]) return { tab: id };
    var target = document.getElementById(id);
    for (var t in panels) {
      if (target && panels[t].contains(target)) return { tab: t, target: target };
    }
    return { tab: 'about' };
  }

  function show(hash, scroll) {
    var r = tabFor(hash);
    for (var t in panels) {
      var on = t === r.tab;
      panels[t].hidden = !on;
      buttons[t].classList.toggle('active', on);
      buttons[t].setAttribute('aria-selected', on ? 'true' : 'false');
      buttons[t].tabIndex = on ? 0 : -1;
    }
    // Canvas and lazy images in a newly shown panel need a size recalculation.
    window.dispatchEvent(new Event('resize'));
    if (!scroll) return;
    if (r.target) {
      r.target.scrollIntoView({ block: 'start' });
    } else if (nav.getBoundingClientRect().top < 0) {
      nav.scrollIntoView({ block: 'start' });
    }
  }

  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a.site-tab');
    if (!a || a.classList.contains('site-tab-external')) return;
    e.preventDefault();
    var id = a.getAttribute('href');
    if (location.hash !== id) history.pushState(null, '', location.href.split('#')[0] + (id === '#about' ? '' : id));
    show(id, true);
  });

  // Arrow keys move between tabs, as the ARIA tabs pattern expects.
  nav.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var tabs = Array.prototype.slice.call(nav.querySelectorAll('a.site-tab:not(.site-tab-external)'));
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    next.click();
  });

  window.addEventListener('popstate', function () { show(location.hash, true); });
  window.addEventListener('hashchange', function () { show(location.hash, true); });

  show(location.hash, !!location.hash);
})();
