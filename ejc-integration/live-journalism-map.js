(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Config
  ------------------------------------------------------------------ */
  var TYPES = [
    { key: 'High-production/performance', label: 'Performance', long: 'High-production / performance', color: 'var(--t-perf)', hex: '#2649FF' },
    { key: 'Spoken/Slam',                 label: 'Spoken / slam', long: 'Spoken / slam',                color: 'var(--t-slam)', hex: '#CC79A7' },
    { key: 'Community/participatory',     label: 'Community',   long: 'Community / participatory',     color: 'var(--t-comm)', hex: '#009E73' },
    { key: 'Dialogue/forum',              label: 'Dialogue',    long: 'Dialogue / forum',              color: 'var(--t-dial)', hex: '#E69F00' }
  ];
  var GLYPH = {
    'High-production/performance': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h18M5 4v15c2.5 0 4.5-3.5 4.5-9V4M19 4v15c-2.5 0-4.5-3.5-4.5-9V4M3 20.5h18"/></svg>',
    'Spoken/Slam': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v4M8.5 21.5h7"/></svg>',
    'Community/participatory': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20.5c0-3.6 2.9-6.3 6.5-6.3s6.5 2.7 6.5 6.3"/><circle cx="17.2" cy="8.8" r="2.6"/><path d="M16.6 14.3c2.9.3 4.9 2.8 4.9 6.2"/></svg>',
    'Dialogue/forum': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5.5A2 2 0 0 1 5 3.5h9a2 2 0 0 1 2 2V11a2 2 0 0 1-2 2H8.5L5 16v-3a2 2 0 0 1-2-2z"/><path d="M19 8.5a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2v3l-3.5-3H11a2 2 0 0 1-2-2"/></svg>'
  };
  function icoFor(key, title) {
    var t = TYPE_BY_KEY[key];
    return '<span class="ico" style="background:' + t.hex + '"' + (title ? ' title="' + esc(t.long) + '"' : '') + '>' + GLYPH[key] + '</span>';
  }
  var TYPE_BY_KEY = {};
  TYPES.forEach(function (t) { TYPE_BY_KEY[t.key] = t; });

  var REGIONS = {
    'Europe': ['Albania','Andorra','Armenia','Austria','Azerbaijan','Belarus','Belgium','Bosnia and Herzegovina','Bosnia & Herzegovina','Bulgaria','Croatia','Cyprus','Czechia','Czech Republic','Denmark','Estonia','Finland','France','Georgia','Germany','Greece','Hungary','Iceland','Ireland','Italy','Kosovo','Latvia','Liechtenstein','Lithuania','Luxembourg','Malta','Moldova','Monaco','Montenegro','Netherlands','North Macedonia','Norway','Poland','Portugal','Romania','San Marino','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Turkey','Türkiye','Ukraine','United Kingdom'],
    'Africa': ['Angola','Benin','Botswana','Burkina Faso','Burundi','Cameroon','Cape Verde','Chad','Congo','Côte d’Ivoire','Ivory Coast','DR Congo','Ethiopia','Gabon','Gambia','Ghana','Guinea','Kenya','Lesotho','Liberia','Madagascar','Malawi','Mali','Mauritius','Mozambique','Namibia','Niger','Nigeria','Rwanda','Senegal','Sierra Leone','Somalia','South Africa','South Sudan','Sudan','Tanzania','Togo','Uganda','Zambia','Zimbabwe'],
    'Latin America & Caribbean': ['Argentina','Bolivia','Brazil','Chile','Colombia','Costa Rica','Cuba','Dominican Republic','Ecuador','El Salvador','Guatemala','Haiti','Honduras','Jamaica','Mexico','Nicaragua','Panama','Paraguay','Peru','Puerto Rico','Uruguay','Venezuela'],
    'Middle East & North Africa': ['Algeria','Bahrain','Egypt','Iran','Iraq','Israel','Jordan','Kuwait','Lebanon','Libya','Morocco','Oman','Palestine','Palestinian Territories','Qatar','Saudi Arabia','Syria','Tunisia','United Arab Emirates','Yemen'],
    'North America': ['Canada','United States','United States of America'],
    'Asia & Pacific': ['Afghanistan','Australia','Bangladesh','Cambodia','China','Fiji','Hong Kong','India','Indonesia','Japan','Kazakhstan','Kyrgyzstan','Malaysia','Mongolia','Myanmar','Nepal','New Zealand','Pakistan','Philippines','Singapore','South Korea','Sri Lanka','Taiwan','Thailand','Uzbekistan','Vietnam']
  };
  var REGION_ORDER = ['Europe', 'Africa', 'Latin America & Caribbean', 'Middle East & North Africa', 'North America', 'Asia & Pacific', 'Rest of world'];
  var REGION_OF = {};
  Object.keys(REGIONS).forEach(function (r) { REGIONS[r].forEach(function (c) { REGION_OF[c] = r; }); });

  // Default view: the whole world, at whatever zoom fits this map's current size (phone or desktop).
  var WORLD = [[-56, -170], [76, 190]];   // inhabited latitudes; a little extra east so Pacific pins aren't cut
  var WORLD_CENTER = [20, 10];
  function worldZoom() {
    if (typeof map === 'undefined' || !map) return 1;
    return Math.max(0, map.getBoundsZoom(WORLD, false));
  }
  // The key sits bottom-left over the map. Nudge the default view right just enough that no pin is
  // under it (desktop only: on phones the key is hidden until someone opens it).
  function keyShift(z, center) {
    var lg = document.getElementById('ljm-legend');
    if (!lg || !lg.offsetWidth || typeof entries === 'undefined') return 0;
    var box = map.getContainer().getBoundingClientRect(), r = lg.getBoundingClientRect();
    var keyRight = r.right - box.left + 16, keyTop = r.top - box.top - 8;
    var size = map.getSize(), mid = map.project(center, z);
    var need = 0;
    entries.forEach(function (e) {
      (e.locs && e.locs.length ? e.locs : [e]).forEach(function (l) {
        var p = map.project([l.lat, l.lng], z).subtract(mid).add(size.divideBy(2));
        // pins are 36 px wide, anchored at the bottom centre
        if (p.y > keyTop && p.x - 18 < keyRight) need = Math.max(need, keyRight - (p.x - 18));
      });
    });
    return Math.min(need, size.x * 0.25);
  }
  function homeView() {
    var z = worldZoom();
    if (typeof map === 'undefined' || !map) return { center: WORLD_CENTER, zoom: z };
    var shift = keyShift(z, WORLD_CENTER);
    var c = shift ? map.unproject(map.project(WORLD_CENTER, z).subtract([shift, 0]), z) : WORLD_CENTER;
    return { center: c, zoom: z };
  }
  var MOBILE_Q = window.matchMedia('(max-width: 859px)');

  /* ------------------------------------------------------------------
     Helpers
  ------------------------------------------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) {
    if (!u || typeof u !== 'string') return '';
    u = u.trim();
    if (!u) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u.replace(/^\/+/, '');
    try {
      var p = new URL(u);
      return (p.protocol === 'https:' || p.protocol === 'http:' || p.protocol === 'mailto:') ? p.href : '';
    } catch (e) { return ''; }
  }
  function hostOf(u) { try { return new URL(u).hostname; } catch (e) { return ''; } }
  function decodeOnce(s) { var t = document.createElement('textarea'); t.innerHTML = s || ''; return t.value; }
  var ALLOWED = { P: 1, BR: 1, I: 1, EM: 1, B: 1, STRONG: 1, A: 1, UL: 1, OL: 1, LI: 1, SPAN: 1 };
  var DROP = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, NOSCRIPT: 1, TEMPLATE: 1, SVG: 1, MATH: 1, FORM: 1, INPUT: 1, BUTTON: 1 };
  function sanitize(html) {
    var doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
    var out = document.createElement('div');
    (function walk(src, dst) {
      Array.prototype.forEach.call(src.childNodes, function (n) {
        if (n.nodeType === 3) { dst.appendChild(document.createTextNode(n.textContent)); return; }
        if (n.nodeType !== 1) return;
        var tag = n.tagName.toUpperCase();
        if (DROP[tag]) return;
        if (!ALLOWED[tag]) { walk(n, dst); return; }
        var el = document.createElement(tag.toLowerCase());
        if (tag === 'A') {
          var h = safeUrl(n.getAttribute('href'));
          if (h) { el.href = h; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
        }
        walk(n, el);
        dst.appendChild(el);
      });
    })(doc.body, out);
    return out.innerHTML;
  }
  function textOf(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent || ''; }
  function fold(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function isoDay(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
  var fmtDay = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  var fmtMonth = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });
  function showDay(iso) { return fmtDay.format(new Date(iso.slice(0, 10) + 'T12:00:00')); }
  function showMonth(iso) { return fmtMonth.format(new Date(iso.slice(0, 10) + 'T12:00:00')); }
  function gradientFor(types) {
    var cols = (types.length ? types : [null]).map(function (k) { return k && TYPE_BY_KEY[k] ? TYPE_BY_KEY[k].hex : '#5B636D'; });
    if (cols.length === 1) return cols[0];
    var step = 100 / cols.length;
    return 'conic-gradient(' + cols.map(function (c, i) { return c + ' ' + (i * step) + '% ' + ((i + 1) * step) + '%'; }).join(',') + ')';
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  var toastTimer;
  function toast(msg) {
    var t = $('#ljm-toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2400);
  }

  /* ------------------------------------------------------------------
     Data: same contract as the live page (<script id="pins-data">)
  ------------------------------------------------------------------ */
  var raw = [];
  try { raw = JSON.parse($('#pins-data').textContent || '[]'); } catch (e) { raw = []; }
  var TODAY = isoDay(new Date());

  // Optional fields beyond today's contract (all backwards-compatible; see the Twig comment):
  //   primaryType  one of the four types: the main format, which sets the pin's colour and icon.
  //                Without it, the first type the CMS lists is the main one.
  //   locations    [{city, country, lat, lng, events, note}]: one project in several places.
  //                Without it, the top-level lat/lng/city/country is the only place.
  //   live         "What happens live?": one or two sentences on what the audience experiences.
  function byTypeOrder(a, b) { return TYPES.indexOf(TYPE_BY_KEY[a]) - TYPES.indexOf(TYPE_BY_KEY[b]); }
  function normEvent(x) {
    return {
      title: (x.title || '').trim(),
      short: (x.short || '').trim(),
      url: safeUrl(x.url),
      date: x.dateISO ? String(x.dateISO).slice(0, 10) : null
    };
  }
  function hasContent(x) { return x.title || x.short || x.url || x.date; }
  function isNum(v) { return v !== null && v !== '' && typeof v !== 'boolean' && isFinite(v); }
  function splitDates(events) {
    var dated = events.filter(function (x) { return x.date; }).map(function (x) { return x.date; }).sort();
    return {
      upcoming: events.filter(function (x) { return x.date && x.date >= TODAY; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }),
      past: events.filter(function (x) { return x.date && x.date < TODAY; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; }),
      undated: events.filter(function (x) { return !x.date; }),
      years: dated.map(function (d) { return d.slice(0, 4); }),
      lastDate: dated.length ? dated[dated.length - 1] : null
    };
  }

  var entries = raw.map(function (p) {
    var listed = (p.types || []).filter(function (t) { return TYPE_BY_KEY[t]; });
    var primary = TYPE_BY_KEY[p.primaryType] ? p.primaryType : (listed[0] || null);
    if (primary && listed.indexOf(primary) === -1) listed.unshift(primary);
    var types = listed.slice().sort(byTypeOrder);
    var also = types.filter(function (t) { return t !== primary; });
    var id = String(p.id);

    // places: the locations list when there is one, otherwise the entry's own coordinates
    var src = Array.isArray(p.locations) && p.locations.length ? p.locations
      : [{ city: p.city, country: p.country, lat: p.lat, lng: p.lng }];
    var topEvents = (p.events || []).map(normEvent).filter(hasContent);
    var locs = [];
    src.forEach(function (l) {
      if (!isNum(l.lat) || !isNum(l.lng)) return;
      var country = (l.country || p.country || '').trim(), city = (l.city || '').trim();
      locs.push({
        city: city, country: country,
        place: [city, country].filter(Boolean).join(', '),
        region: REGION_OF[country] || 'Rest of world',
        lat: +l.lat, lng: +l.lng,
        note: (l.note || '').trim(),
        events: (l.events || []).map(normEvent).filter(hasContent)
      });
    });
    if (!locs.length) return null;
    // events listed on the entry itself belong to its first (main) place
    locs[0].events = topEvents.concat(locs[0].events);
    locs.forEach(function (l, i) {
      l.i = i; l.key = id + ':' + i; l.entryId = id;
      l.events.forEach(function (x) { x.loc = i; x.place = l.place; });
      Object.assign(l, splitDates(l.events));
    });
    var events = [].concat.apply([], locs.map(function (l) { return l.events; }));
    var d = splitDates(events);
    var countries = [];
    locs.forEach(function (l) { if (l.country && countries.indexOf(l.country) === -1) countries.push(l.country); });

    var descHtml = sanitize(decodeOnce(p.desc || ''));
    var btn = p.button || {};
    var firstShort = (events.filter(function (x) { return x.short; })[0] || {}).short || '';
    var e = {
      id: id,
      title: (p.title || 'Untitled').trim(),
      country: locs[0].country,
      countries: countries,
      city: locs[0].city,
      place: locs[0].place,
      locs: locs,
      multi: locs.length > 1,
      lat: locs[0].lat, lng: locs[0].lng,
      region: locs[0].region,
      submitted: p.submitted || '',
      sub: firstShort,
      live: (p.live || '').trim(),
      liveSample: !!p.liveSample,
      demoNote: (p.demoNote || '').trim(),
      videoUrl: safeUrl(p.videoUrl),
      imageSource: p.imageSource || '',
      primary: primary,
      also: also,
      types: types,
      descHtml: descHtml,
      image: safeUrl(p.image),
      // YouTube-hosted thumbnails would contact Google before anyone presses play: use a placeholder instead
      thumb: (function (t) { return /(^|\.)(ytimg|youtube|googlevideo)\.com$/i.test(hostOf(t)) ? '' : t; })(safeUrl(p.thumb || p.image)),
      photoCredit: (p.photoCredit || '').trim(),
      embed: p.embed || '',
      website: safeUrl(btn.url),
      websiteText: (btn.text || '').trim(),
      events: events, upcoming: d.upcoming, past: d.past, undated: d.undated,
      years: d.years,
      lastDate: d.lastDate
    };
    e.hay = fold([e.title, e.live, locs.map(function (l) { return l.place + ' ' + l.region; }).join(' '),
      textOf(descHtml), e.websiteText, types.map(function (t) { return TYPE_BY_KEY[t].long; }).join(' '),
      events.map(function (x) { return x.title + ' ' + x.short; }).join(' ')].join(' '));
    return e;
  }).filter(Boolean);
  function typeLabel(k) { return TYPE_BY_KEY[k] ? TYPE_BY_KEY[k].long : ''; }
  function typesText(e) {
    return 'Main format: ' + typeLabel(e.primary) + (e.also.length ? '. Also listed under: ' + e.also.map(typeLabel).join(', ') : '');
  }
  function listJoin(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function placesText(e) { return plural(e.locs.length, 'place', 'places') + ' in ' + listJoin(e.countries); }
  var BY_ID = {};
  entries.forEach(function (e) { BY_ID[e.id] = e; });
  if ($('#snap-n')) $('#snap-n').textContent = entries.length; // banner exists only in the standalone preview

  /* ------------------------------------------------------------------
     State (mirrored in the URL hash so any view can be shared)
  ------------------------------------------------------------------ */
  var state = { q: '', types: [], place: '', when: '', sort: 'latest', entry: null, view: 'map' };

  function readHash() {
    var h = new URLSearchParams(location.hash.replace(/^#/, ''));
    state.q = h.get('q') || '';
    state.types = (h.get('type') || '').split(',').filter(function (k) { return TYPES.some(function (t) { return slug(t.key) === k; }); })
      .map(function (k) { return TYPES.filter(function (t) { return slug(t.key) === k; })[0].key; });
    state.place = h.get('place') || '';
    state.when = h.get('when') || '';
    state.sort = h.get('sort') || 'latest';
    state.entry = h.get('entry') && BY_ID[h.get('entry')] ? h.get('entry') : null;
    state.view = h.get('view') === 'list' ? 'list' : 'map';
  }
  function slug(s) { return fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function hashFor(overrides) {
    var s = Object.assign({}, state, overrides || {});
    var h = new URLSearchParams();
    if (s.q) h.set('q', s.q);
    if (s.types.length) h.set('type', s.types.map(slug).join(','));
    if (s.place) h.set('place', s.place);
    if (s.when) h.set('when', s.when);
    if (s.sort && s.sort !== 'latest') h.set('sort', s.sort);
    if (s.entry) h.set('entry', s.entry);
    if (s.view === 'list') h.set('view', 'list');
    var str = h.toString();
    return str ? '#' + str : '';
  }
  function writeHash() {
    var h = hashFor();
    if (h !== location.hash && !(h === '' && location.hash === '')) {
      history.replaceState(null, '', location.pathname + location.search + h);
    }
  }

  /* ------------------------------------------------------------------
     Filtering + facet counts
  ------------------------------------------------------------------ */
  function matches(e, skip) {
    if (skip !== 'q' && state.q) {
      var terms = fold(state.q).split(/\s+/).filter(Boolean);
      for (var i = 0; i < terms.length; i++) if (e.hay.indexOf(terms[i]) === -1) return false;
    }
    if (skip !== 'types' && state.types.length) {
      if (!state.types.some(function (t) { return e.types.indexOf(t) !== -1; })) return false;
    }
    // a project matches a place or date when ANY of its places or events does; it still counts once
    if (skip !== 'place' && state.place && !e.locs.some(placeOk)) return false;
    if (skip !== 'when' && state.when && !whenOk(e)) return false;
    return true;
  }
  function placeOk(l) {
    if (!state.place) return true;
    var kind = state.place.slice(0, 2), val = state.place.slice(2);
    if (kind === 'r:') return l.region === val;
    if (kind === 'c:') return l.country === val;
    return true;
  }
  function whenOk(x) {   // x = a project or one of its places (both carry upcoming / years)
    if (!state.when) return true;
    if (state.when === 'upcoming') return x.upcoming.length > 0;
    if (state.when === 'undated') return !x.years.length;
    if (/^\d{4}$/.test(state.when)) return x.years.indexOf(state.when) !== -1;
    return true;
  }
  // The pins a matching project shows: its places that fit the place and date filters.
  // (With "No dates listed" every place shows, since the whole project has no dates.)
  // A search that names one of the places ("charleroi") narrows the pins to that place too.
  function visibleLocs(e) {
    var both = e.locs.filter(function (l) { return placeOk(l) && (state.when === 'undated' || whenOk(l)); });
    var out = both.length ? both : e.locs.filter(placeOk);
    if (!out.length) out = e.locs;
    if (state.q && e.multi) {
      var terms = fold(state.q).split(/\s+/).filter(Boolean);
      var named = out.filter(function (l) {
        var h = fold(l.place);
        return terms.some(function (t) { return t.length > 2 && h.indexOf(t) !== -1; });
      });
      if (named.length) out = named;
    }
    return out;
  }
  function sorted(list) {
    var by = state.sort;
    return list.slice().sort(function (a, b) {
      if (by === 'az') return a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });
      if (by === 'country') return a.country.localeCompare(b.country) || a.title.localeCompare(b.title);
      // latest activity: upcoming first (soonest), then most recent past date, then undated
      var au = a.upcoming.length ? a.upcoming[0].date : null, bu = b.upcoming.length ? b.upcoming[0].date : null;
      if (au || bu) { if (!au) return 1; if (!bu) return -1; if (au !== bu) return au < bu ? -1 : 1; }
      if (a.lastDate !== b.lastDate) { if (!a.lastDate) return 1; if (!b.lastDate) return -1; return a.lastDate < b.lastDate ? 1 : -1; }
      if (a.submitted !== b.submitted) return a.submitted < b.submitted ? 1 : -1;
      return a.title.localeCompare(b.title);
    });
  }
  var current = [];

  /* ------------------------------------------------------------------
     Map
  ------------------------------------------------------------------ */
  var ljm = $('#ljm');
  var map = L.map('resourceMap', {
    zoomControl: true,
    scrollWheelZoom: false,
    worldCopyJump: true,
    minZoom: 0,
    zoomSnap: 0.25,   // fractional zoom so the whole world fits any width exactly
    zoomDelta: 1,
    gestureHandling: true,
    gestureHandlingOptions: {
      text: { touch: 'Use two fingers to move the map', scroll: '', scrollMac: '' },
      duration: 1200
    }
  });
  map.setView(homeView().center, homeView().zoom);
  // Don't zoom out much past the whole world. Whole numbers only: markercluster drops pins
  // when the minimum zoom is fractional.
  function setWorldMin() { map.setMinZoom(Math.floor(worldZoom())); }
  setWorldMin();
  map.on('resize', setWorldMin);

  // Tile provider is configurable from the template, as the OSMF tile policy recommends, so EJC can switch
  // to another OpenStreetMap-based provider (or its own tiles) without a code change. Attributes on #resourceMap:
  //   data-tile-url          tile URL template, e.g. https://tile.openstreetmap.org/{z}/{x}/{y}.png
  //   data-tile-attribution  credit shown on the map (must keep "© OpenStreetMap contributors")
  //   data-tile-max-zoom     highest zoom the provider serves (default 19)
  //   data-tile-subdomains   for URLs with {s}, e.g. "abc"
  var mapEl = $('#resourceMap');
  var OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
  var tileOpts = {
    maxZoom: +mapEl.getAttribute('data-tile-max-zoom') || 19,
    attribution: mapEl.getAttribute('data-tile-attribution') || OSM_ATTR
  };
  if (mapEl.getAttribute('data-tile-subdomains')) tileOpts.subdomains = mapEl.getAttribute('data-tile-subdomains');
  // A page opened straight from disk (file://) sends no Referer, and OpenStreetMap's servers answer such
  // requests with an "Access blocked" tile. So in that case don't request OSM tiles at all: say why instead.
  // Never happens on ejc.net, which is served over https.
  var tileUrl = mapEl.getAttribute('data-tile-url') || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  map.setMaxZoom(tileOpts.maxZoom);   // the pin clusters need it even when no tile layer is added
  if (location.protocol === 'file:' && /(^|\.)openstreetmap\.org\//.test(tileUrl.replace(/^https?:\/\//, ''))) {
    var fileNote = L.DomUtil.create('div', 'ljm-file-note', map.getContainer());
    fileNote.setAttribute('role', 'note');
    fileNote.innerHTML = '<strong>The map background can’t load when this page is opened as a file.</strong> ' +
      'OpenStreetMap only serves map tiles to pages with a web address. ' +
      esc(mapEl.getAttribute('data-file-hint') || 'Open the page from a web server instead.') +
      ' The pins, filters and list below still work.';
    L.DomEvent.disableClickPropagation(fileNote);
  } else {
    L.tileLayer(tileUrl, tileOpts).addTo(map);
  }
  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');

  var cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 44,
    iconCreateFunction: function (c) {
      var kids = c.getAllChildMarkers(), counts = {}, total = 0;
      kids.forEach(function (m) { (m.options.ljmTypes || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; total++; }); });
      var acc = 0, stops = [];
      TYPES.forEach(function (t) {
        if (!counts[t.key]) return;
        var from = acc / total * 100; acc += counts[t.key]; var to = acc / total * 100;
        stops.push(t.hex + ' ' + from.toFixed(2) + '% ' + to.toFixed(2) + '%');
      });
      var n = c.getChildCount(), size = n < 5 ? 40 : n < 12 ? 48 : 56;
      return L.divIcon({
        html: '<div class="ljm-cluster__ring" style="background:conic-gradient(' + stops.join(',') + ')"><span>' + n + '</span></div>',
        className: 'ljm-cluster', iconSize: [size, size]
      });
    }
  });
  map.addLayer(cluster);
  // "Solo" view: while a project with several places is open, only its pins are on the map, one by one
  // (no clusters), so you see where that project goes. Closing the project brings everything back.
  var solo = L.layerGroup().addTo(map);
  var soloId = null;
  // Grouping on/off (map button). Off = every pin shown on its own, no clusters.
  var flat = L.layerGroup().addTo(map);
  var grouped = new URLSearchParams(location.search).get('group') !== '0';   // ?group=0 starts ungrouped

  // One marker per place. Every marker of a project opens the same project panel and the same link.
  // Pin colour and icon = main format; small dots on the pin's shoulder = the other formats it's listed under.
  var markers = {};
  var CAN_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Pin style: "drop" (default teardrop), "circle", "ring" or "dot". Set with ?pin=… in the address
  // (for comparing options) or data-pin-style on #ljm.
  var PIN_STYLE = (function () {
    var q = (new URLSearchParams(location.search).get('pin') || ljm.getAttribute('data-pin-style') || '').toLowerCase();
    return ({ circle: 1, ring: 1, dot: 1 })[q] ? q : 'drop';
  })();
  ljm.setAttribute('data-pin-style', PIN_STYLE);
  function pinIcon(e) {
    var bg = e.primary ? TYPE_BY_KEY[e.primary].hex : '#5B636D';
    var glyph = e.primary ? GLYPH[e.primary] : '';
    var dots = e.also.slice(0, 3).map(function (t) { return '<i style="background:' + TYPE_BY_KEY[t].hex + '"></i>'; }).join('');
    var also = dots ? '<span class="ljm-pin__also" aria-hidden="true">' + dots + '</span>' : '';
    if (PIN_STYLE === 'circle') return L.divIcon({ className: 'ljm-pin ljm-pin--circle',
      html: '<span class="ljm-pin__c" style="background:' + bg + '">' + glyph + '</span>' + also,
      iconSize: [34, 34], iconAnchor: [17, 17], tooltipAnchor: [0, -18] });
    if (PIN_STYLE === 'ring') return L.divIcon({ className: 'ljm-pin ljm-pin--ring',
      html: '<span class="ljm-pin__c" style="border-color:' + bg + ';color:' + bg + '">' + glyph + '</span>' + also,
      iconSize: [34, 34], iconAnchor: [17, 17], tooltipAnchor: [0, -18] });
    if (PIN_STYLE === 'dot') return L.divIcon({ className: 'ljm-pin ljm-pin--dot',
      html: '<span class="ljm-pin__c" style="background:' + bg + '"></span>' + also,
      iconSize: [22, 22], iconAnchor: [11, 11], tooltipAnchor: [0, -12] });
    return L.divIcon({ className: 'ljm-pin',
      html: '<span class="ljm-pin__drop" style="background:' + bg + '"></span>' +
        '<span class="ljm-pin__glyph">' + glyph + '</span>' + also,
      iconSize: [36, 44], iconAnchor: [18, 42], tooltipAnchor: [0, -36] });
  }
  entries.forEach(function (e) {
    e.locs.forEach(function (l) {
      var icon = pinIcon(e);
      var m = L.marker([l.lat, l.lng], { icon: icon, keyboard: true, riseOnHover: true, ljmTypes: e.primary ? [e.primary] : [], ljmId: e.id, ljmLoc: l.i });
      if (CAN_HOVER) {
        m.bindTooltip(
          '<strong>' + esc(e.title) + '</strong>' +
          '<span class="ljm-tip__row">' + (e.primary ? icoFor(e.primary) + esc(typeLabel(e.primary)) : '') + '</span>' +
          (e.also.length ? '<span class="ljm-tip__also">Also: ' + esc(e.also.map(typeLabel).join(', ')) + '</span>' : '') +
          '<span class="ljm-tip__place">' + esc(l.place) + (e.multi ? ' · 1 of ' + e.locs.length + ' places' : '') + '</span>',
          { direction: 'top', className: 'ljm-tip', opacity: 1 });
      }
      m.on('click', function () { openEntry(e.id, { fly: false, source: 'map', loc: l.i }); });
      m.on('add', function () {
        var el = m.getElement();
        if (!el) return;
        el.setAttribute('aria-label', e.title + ', ' + l.place + '. ' + typesText(e) +
          (e.multi ? '. One of ' + e.locs.length + ' places for this project' : ''));
        el.classList.toggle('is-active', state.entry === e.id);
        if (!el._ljmKey) {
          el._ljmKey = true;
          el.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openEntry(e.id, { fly: false, source: 'map', loc: l.i }); }
          });
        }
      });
      markers[l.key] = m;
    });
  });
  function markersOf(id) {
    var e = BY_ID[id];
    return e ? e.locs.map(function (l) { return markers[l.key]; }) : [];
  }
  var currentLocs = [];

  function fitTo(list, opts) {
    opts = opts || {};
    if (!list.length) { map.setView(homeView().center, homeView().zoom); return; }
    var b = L.latLngBounds(list.map(function (e) { return [e.lat, e.lng]; }));
    var pad = MOBILE_Q.matches ? [22, 22] : [44, 44];
    map.fitBounds(b, { padding: pad, maxZoom: opts.maxZoom || 6, animate: opts.animate !== false });
  }

  /* custom controls ------------------------------------------------ */
  var ICON = {
    group: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="9.5" cy="10.5" r="1.6" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10.5" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="14.8" r="1.6" fill="currentColor" stroke="none"/></svg>',
    ungroup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="5.5" cy="7" r="2.2" fill="currentColor" stroke="none"/><circle cx="18" cy="5.5" r="2.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12.5" r="2.2" fill="currentColor" stroke="none"/><circle cx="6.5" cy="18.5" r="2.2" fill="currentColor" stroke="none"/><circle cx="18.5" cy="17.5" r="2.2" fill="currentColor" stroke="none"/></svg>',
    fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3Z"/></svg>',
    locate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke-linecap="round"/></svg>',
    fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    fsx: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" stroke="none"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="7" cy="8" r="2.2"/><circle cx="7" cy="16" r="2.2"/><path d="M12 8h8M12 16h8" stroke-linecap="round"/></svg>'
  };
  var Tools = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
      var box = L.DomUtil.create('div', 'ljm-tools');
      box.innerHTML =
        '<button type="button" class="ljm-tool" data-tool="fit" title="Show all results" aria-label="Zoom to show all results">' + ICON.fit + '</button>' +
        '<button type="button" class="ljm-tool" data-tool="group" title="' + (grouped ? 'Show every pin separately' : 'Group nearby pins') + '" aria-label="Group nearby pins" aria-pressed="' + grouped + '">' + (grouped ? ICON.group : ICON.ungroup) + '</button>' +
        '<button type="button" class="ljm-tool" data-tool="tone" title="Colour map" aria-label="Show the map in full colour" aria-pressed="false">' + ICON.tone + '</button>' +
        '<button type="button" class="ljm-tool ljm-legend__toggle" data-tool="key" title="Key" aria-label="Show map key" aria-pressed="false">' + ICON.key + '</button>';
      L.DomEvent.disableClickPropagation(box);
      L.DomEvent.disableScrollPropagation(box);
      return box;
    }
  });
  var formHost = ljm;
  function goToForm() {
    if (ljm.classList.contains('is-fs')) setFullscreen(false);
    if (filters && filters.classList.contains('is-open')) openFilters(false);
    var target = null;
    try { target = document.querySelector(formHost.getAttribute('data-form-target') || '#submit-project'); } catch (err) { target = null; }
    if (!target) { location.href = formHost.getAttribute('data-form-url') || 'https://ejc.net/live-journalism-entry'; return; }
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () {
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      try { target.focus({ preventScroll: true }); } catch (err) {}
      // if a smooth scroll gets cancelled (touch momentum, background tab), finish the jump
      setTimeout(function () {
        if (Math.abs(target.getBoundingClientRect().top) > 60) target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 900);
      target.classList.remove('is-flash'); void target.offsetWidth; target.classList.add('is-flash');
    }, 80);
  }
  var Cta = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
      var a = L.DomUtil.create('a', 'ljm-cta');
      a.href = formHost.getAttribute('data-form-target') || '#submit-project';
      a.setAttribute('role', 'button');
      a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>' +
        '<span class="ljm-cta__long">Add your project</span><span class="ljm-cta__short">Add yours</span>';
      a.setAttribute('aria-label', 'Add your project: go to the submission form below the map');
      L.DomEvent.disableClickPropagation(a);
      L.DomEvent.disableScrollPropagation(a);
      L.DomEvent.on(a, 'click', function (ev) { L.DomEvent.preventDefault(ev); goToForm(); });
      return a;
    }
  });
  // No zooming with the mouse wheel, not even Ctrl/⌘ + wheel: the gesture plugin re-enables it on its
  // own wheel listener, so detach that listener. Two-finger pan and pinch on touch screens stay as they are.
  if (map.gestureHandling) L.DomEvent.off(map.getContainer(), 'wheel', map.gestureHandling._handleScroll, map.gestureHandling);
  map.scrollWheelZoom.disable();

  // Reset button under + / −: zooms back out to the starting view
  var rst = L.DomUtil.create('a', 'ljm-reset-view', map.zoomControl.getContainer());
  rst.href = '#';
  rst.setAttribute('role', 'button');
  rst.title = 'Reset view';
  rst.setAttribute('aria-label', 'Reset the map: zoom back out to the starting view');
  rst.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 3.5v5h5"/></svg>';
  L.DomEvent.disableClickPropagation(rst);
  L.DomEvent.on(rst, 'click', function (ev) {
    L.DomEvent.preventDefault(ev);
    map.flyTo(homeView().center, homeView().zoom, { duration: 0.6 });
  });

  map.addControl(new Cta());
  map.addControl(new Tools());

  function toggleType(k) {
    var i = state.types.indexOf(k);
    if (i === -1) state.types.push(k); else state.types.splice(i, 1);
    update({ fit: true });
  }
  var Legend = L.Control.extend({
    options: { position: 'bottomleft' },
    onAdd: function () {
      var box = L.DomUtil.create('div', 'ljm-legend');
      box.id = 'ljm-legend';
      box.innerHTML = '<b>Type of live journalism</b><p class="ljm-legend__hint">Select a type to filter the map</p><ul>' +
        TYPES.map(function (t) {
          return '<li><button type="button" class="ljm-legend__item" data-type="' + esc(t.key) + '" aria-pressed="false">' +
            icoFor(t.key) + '<span class="lbl">' + esc(t.long) + '</span><span class="n"></span></button></li>';
        }).join('') +
        '</ul><button type="button" class="ljm-legend__clear" hidden>Show all types</button>' +
        '<div class="multi"><span class="ljm-legend__sample" aria-hidden="true">' + icoFor(TYPES[0].key) +
          '<i style="background:' + TYPES[3].hex + '"></i></span>' +
          '<span>Colour and icon show the main format. A small dot means the project is also listed under that type.</span></div>';
      L.DomEvent.disableClickPropagation(box);
      L.DomEvent.disableScrollPropagation(box);
      L.DomEvent.on(box, 'click', function (ev) {
        var item = ev.target.closest('.ljm-legend__item');
        if (item) { toggleType(item.getAttribute('data-type')); return; }
        if (ev.target.closest('.ljm-legend__clear')) { state.types = []; update({ fit: true }); }
      });
      return box;
    }
  });
  map.addControl(new Legend());

  var meLayer = null;
  $all('[data-tool]', map.getContainer()).forEach(function (b) {
    b.addEventListener('click', function () {
      var tool = b.getAttribute('data-tool');
      if (tool === 'fit') fitTo(soloId && BY_ID[soloId] ? visibleLocs(BY_ID[soloId]) : currentLocs);
      if (tool === 'locate') {
        if (!navigator.geolocation) { toast('Your browser can’t share a location'); return; }
        toast('Finding you…');
        map.locate({ setView: true, maxZoom: 7, enableHighAccuracy: false, timeout: 10000 });
      }
      if (tool === 'fs') setFullscreen(!ljm.classList.contains('is-fs'));
      if (tool === 'group') {
        grouped = !grouped;
        b.setAttribute('aria-pressed', String(grouped));
        b.innerHTML = grouped ? ICON.group : ICON.ungroup;
        b.title = grouped ? 'Show every pin separately' : 'Group nearby pins';
        toast(grouped ? 'Nearby pins grouped' : 'Showing every pin separately');
        renderMarkers(false);
        setTimeout(function () { setActiveMarker(state.entry); }, 0);
      }
      if (tool === 'tone') {
        var muted = ljm.classList.toggle('is-muted');
        b.setAttribute('aria-pressed', String(!muted));
        b.title = muted ? 'Colour map' : 'Muted map';
      }
      if (tool === 'key') {
        var lg = $('#ljm-legend'); var open = lg.classList.toggle('is-open');
        b.setAttribute('aria-pressed', String(open));
      }
    });
  });
  map.on('locationfound', function (ev) {
    if (meLayer) map.removeLayer(meLayer);
    meLayer = L.marker(ev.latlng, { icon: L.divIcon({ className: '', html: '<span class="ljm-me" aria-hidden="true"></span>', iconSize: [16, 16] }), keyboard: false, interactive: false }).addTo(map);
    var near = currentLocs.slice().sort(function (a, b) { return ev.latlng.distanceTo([a.lat, a.lng]) - ev.latlng.distanceTo([b.lat, b.lng]); })[0];
    if (near) toast('Nearest: ' + BY_ID[near.entryId].title + ' (' + Math.round(ev.latlng.distanceTo([near.lat, near.lng]) / 1000) + ' km)');
  });
  map.on('locationerror', function () { toast('Location unavailable. Check your browser permissions.'); });
  map.on('click', function () { if (state.entry) closeEntry(); });

  function setFullscreen(on) {
    ljm.classList.toggle('is-fs', on);
    document.body.classList.toggle('ljm-lock', on);
    var b = $('[data-tool="fs"]', map.getContainer());
    if (!b) { setTimeout(function () { map.invalidateSize(); }, 60); return; }
    b.setAttribute('aria-pressed', String(on));
    b.innerHTML = on ? ICON.fsx : ICON.fs;
    b.title = on ? 'Exit full screen' : 'Full screen';
    b.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen map');
    if (map.gestureHandling) { on ? map.gestureHandling.disable() : map.gestureHandling.enable(); }
    setTimeout(function () { map.invalidateSize(); }, 60);
  }

  /* ------------------------------------------------------------------
     Rendering
  ------------------------------------------------------------------ */
  var typesBox = $('#ljm-types');
  TYPES.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.setAttribute('data-type', t.key);
    b.setAttribute('aria-pressed', 'false');
    b.title = t.long;
    b.innerHTML = icoFor(t.key) + esc(t.label) + ' <span class="n"></span>';
    b.addEventListener('click', function () {
      var i = state.types.indexOf(t.key);
      if (i === -1) state.types.push(t.key); else state.types.splice(i, 1);
      update({ fit: true });
    });
    typesBox.appendChild(b);
  });

  function renderFacets() {
    // legend items work as type filters too
    $all('.ljm-legend__item').forEach(function (b) {
      var k = b.getAttribute('data-type');
      var n = entries.filter(function (e) { return matches(e, 'types') && e.types.indexOf(k) !== -1; }).length;
      var on = state.types.indexOf(k) !== -1;
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('.n').textContent = n;
      b.setAttribute('aria-label', TYPE_BY_KEY[k].long + ', ' + plural(n, 'project', 'projects') + (on ? ', filter on' : ''));
    });
    var lgClear = $('.ljm-legend__clear');
    if (lgClear) lgClear.hidden = !state.types.length;
    var lgBox = $('#ljm-legend');
    if (lgBox) lgBox.classList.toggle('has-filter', state.types.length > 0);
    // types
    $all('.chip', typesBox).forEach(function (b) {
      var k = b.getAttribute('data-type');
      var n = entries.filter(function (e) { return matches(e, 'types') && e.types.indexOf(k) !== -1; }).length;
      b.querySelector('.n').textContent = n;
      b.setAttribute('aria-pressed', String(state.types.indexOf(k) !== -1));
      b.setAttribute('aria-label', (TYPE_BY_KEY[k].long) + ', ' + plural(n, 'project', 'projects'));
    });
    // place
    var base = entries.filter(function (e) { return matches(e, 'place'); });
    var sel = $('#ljm-country');
    var html = '<option value="">All countries (' + base.length + ')</option>';
    // counts are projects: a project with places in two countries counts once in each, once overall
    function inRegion(e, r) { return e.locs.some(function (l) { return l.region === r; }); }
    function inCountry(e, c) { return e.locs.some(function (l) { return l.country === c; }); }
    REGION_ORDER.forEach(function (r) {
      var countries = {};
      entries.forEach(function (e) { e.locs.forEach(function (l) { if (l.region === r && l.country) countries[l.country] = 1; }); });
      if (!Object.keys(countries).length) return;
      var nR = base.filter(function (e) { return inRegion(e, r); }).length;
      html += '<optgroup label="' + esc(r) + '"><option value="r:' + esc(r) + '">All ' + esc(r) + ' (' + nR + ')</option>';
      Object.keys(countries).sort().forEach(function (c) {
        var nC = base.filter(function (e) { return inCountry(e, c); }).length;
        html += '<option value="c:' + esc(c) + '">' + esc(c) + ' (' + nC + ')</option>';
      });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
    sel.value = state.place;
    if (sel.value !== state.place) { state.place = ''; sel.value = ''; }
    sel.classList.toggle('is-set', !!state.place);
    // when
    var baseW = entries.filter(function (e) { return matches(e, 'when'); });
    var years = {};
    entries.forEach(function (e) { e.years.forEach(function (y) { years[y] = 1; }); });
    var w = $('#ljm-when');
    var nUp = baseW.filter(function (e) { return e.upcoming.length; }).length;
    var wh = '<option value="">Any date</option>' +
      '<option value="upcoming">Upcoming events (' + nUp + ')</option>';
    Object.keys(years).sort().reverse().forEach(function (y) {
      wh += '<option value="' + y + '">Events in ' + y + ' (' + baseW.filter(function (e) { return e.years.indexOf(y) !== -1; }).length + ')</option>';
    });
    wh += '<option value="undated">No dates listed (' + baseW.filter(function (e) { return !e.years.length; }).length + ')</option>';
    w.innerHTML = wh;
    w.value = state.when;
    if (w.value !== state.when) { state.when = ''; w.value = ''; }
    w.classList.toggle('is-set', !!state.when);
    w.hidden = !Object.keys(years).length;
    $('#ljm-where-h').textContent = w.hidden ? 'Where' : 'Where and when';
    // badge / reset
    var active = state.types.length + (state.place ? 1 : 0) + (state.when ? 1 : 0);
    $('#ljm-badge').textContent = active ? String(active) : '';
    $('#ljm-reset').hidden = !(active || state.q);
    $('#ljm-sort').value = state.sort;
    $('#ljm-q').value = state.q;
    $('#ljm-search-wrap').classList.toggle('has-value', !!state.q);
    $('#ljm-apply').textContent = 'Show ' + plural(current.length, 'project', 'projects');
  }

  function cardMeta(e) {
    var bits = [esc(e.place) + (e.multi ? ' <span class="more-places">+ ' + (e.locs.length - 1) + ' more</span>' : '')];
    if (e.upcoming.length) bits.push('<span class="when-tag">Next: ' + esc(showDay(e.upcoming[0].date)) + '</span>');
    else if (e.lastDate) bits.push('Last event ' + esc(showMonth(e.lastDate)));
    else if (e.submitted) bits.push('Added ' + esc(showMonth(e.submitted)));
    return bits.join(' · ');
  }

  function renderList() {
    var ul = $('#ljm-list');
    ul.innerHTML = current.map(function (e) {
      var img = e.thumb
        ? '<img class="card__img" src="' + esc(e.thumb) + '" alt="" loading="lazy" width="64" height="64">'
        : '<span class="card__ph" style="background:' + gradientFor(e.primary ? [e.primary] : []) + '" aria-hidden="true">' + esc(e.title.charAt(0)) + '</span>';
      var sub = e.live || e.sub;
      return '<li><button type="button" class="card' + (state.entry === e.id ? ' is-active' : '') + '" data-id="' + esc(e.id) + '">' + img +
        '<span><span class="card__title" style="display:block">' + esc(e.title) + '</span>' +
        (sub ? '<span class="card__sub">' + esc(sub) + '</span>' : '') +
        '<span class="card__meta" style="display:block">' + cardMeta(e) + '</span>' +
        '<span class="card__types" aria-label="' + esc(typesText(e)) + '">' +
        (e.primary ? icoFor(e.primary) + '<span class="card__type">' + esc(TYPE_BY_KEY[e.primary].label) + '</span>' : '') +
        (e.also.length ? '<span class="card__also">also</span>' + e.also.map(function (t) { return icoFor(t, true); }).join('') : '') +
        '</span></span></button></li>';
    }).join('');
    $('#ljm-empty').hidden = current.length > 0;
    var c = $('#ljm-count');
    // projects count once, however many places they have
    c.innerHTML = '<strong>' + current.length + '</strong> of ' + plural(entries.length, 'project', 'projects') +
      (currentLocs.length > current.length ? '<span class="ljm-count__places"> · ' + plural(currentLocs.length, 'place', 'places') + ' on the map</span>' : '');
    $('#ljm-list-n').textContent = String(current.length);
  }

  function renderMarkers(fit) {
    cluster.clearLayers();
    solo.clearLayers();
    flat.clearLayers();
    if (soloId && BY_ID[soloId]) visibleLocs(BY_ID[soloId]).forEach(function (l) { solo.addLayer(markers[l.key]); });
    else if (!grouped) currentLocs.forEach(function (l) { flat.addLayer(markers[l.key]); });
    else cluster.addLayers(currentLocs.map(function (l) { return markers[l.key]; }));
    if (fit) fitTo(currentLocs);
  }
  // Turn the solo view on for a project with 2+ visible places, off otherwise. Returns true if it changed.
  function setSolo(e) {
    var want = (e && visibleLocs(e).length > 1) ? e.id : null;
    if (want === soloId) return false;
    soloId = want;
    renderMarkers(false);
    return true;
  }

  function update(opts) {
    opts = opts || {};
    current = sorted(entries.filter(function (e) { return matches(e); }));
    currentLocs = [].concat.apply([], current.map(visibleLocs));
    renderFacets();
    renderList();
    renderMarkers(opts.fit);
    if (state.entry && !current.some(function (e) { return e.id === state.entry; })) closeEntry(true);
    writeHash();
  }

  /* ------------------------------------------------------------------
     Detail panel
  ------------------------------------------------------------------ */
  var detail = $('#ljm-detail');

  function videoBlock(e) {
    var m = /src=["']([^"']+)["']/i.exec(e.embed || '');
    var src = m ? m[1].replace(/&amp;/g, '&') : '';
    if (!src) return '';
    var tm = /title=["']([^"']*)["']/i.exec(e.embed || '');
    var title = tm ? decodeOnce(tm[1]) : 'Video';
    var play = '', host = '';
    try {
      var u = new URL(src);
      if (/youtube\.com|youtu\.be/.test(u.hostname)) {
        var id = (u.pathname.match(/\/embed\/([\w-]{6,})/) || [])[1];
        if (!id) return '';
        var start = u.searchParams.get('start');
        play = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' + (start ? '&start=' + encodeURIComponent(start) : '');
        host = 'YouTube';
      } else if (/vimeo\.com/.test(u.hostname)) {
        var vid = (u.pathname.match(/\/video\/(\d+)/) || [])[1];
        if (!vid) return '';
        play = 'https://player.vimeo.com/video/' + vid + '?autoplay=1&dnt=1';
        host = 'Vimeo';
      } else { return ''; }
    } catch (err) { return ''; }
    var bg = e.image ? ' style="background-image:url(&quot;' + esc(e.image) + '&quot;)"' : '';
    return '<div class="media" data-video="' + esc(play) + '" data-video-title="' + esc(title) + '">' +
      '<button type="button" class="video-poster"' + bg + ' aria-label="Play video: ' + esc(title) + ' (loads ' + host + ')">' +
      '<span class="video-poster__label"><span class="video-poster__play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg></span>' +
      '<span><strong>' + esc(title) + '</strong><br>Plays from ' + host + ' when you press play</span></span></button></div>';
  }

  function eventItem(ev, kind, multi) {
    return '<li class="event' + (kind === 'up' ? ' event--upcoming' : '') + '">' +
      (ev.date ? '<div class="event__date">' + esc(showDay(ev.date)) + '</div>' : '') +
      (multi && ev.place ? '<div class="event__place">' + esc(ev.place) + '</div>' : '') +
      (ev.title ? '<div class="event__title">' + esc(ev.title) + '</div>' : '') +
      (ev.short ? '<div class="event__short">' + esc(ev.short) + '</div>' : '') +
      (ev.url ? '<a href="' + esc(ev.url) + '" target="_blank" rel="noopener noreferrer">Event page ↗</a>' : '') +
      '</li>';
  }

  function renderDetail(e) {
    var idx = current.findIndex(function (x) { return x.id === e.id; });
    var media = videoBlock(e);
    if (!media && e.image) {
      media = '<figure class="media"><img src="' + esc(e.image) + '" alt="" loading="lazy">' +
        ((e.photoCredit || e.imageSource === 'published') ? '<figcaption>' + (e.photoCredit ? 'Photo: ' + esc(e.photoCredit) : '') +
          (e.imageSource === 'published' ? (e.photoCredit ? ' · ' : '') + 'Image from the approved ejc.net entry' : '') + '</figcaption>' : '') + '</figure>';
    }
    var site = e.website
      ? '<a class="btn btn-dark" href="' + esc(e.website) + '" target="_blank" rel="noopener noreferrer">' + esc(e.websiteText || 'Visit website') + ' ↗</a>'
      : '';
    if (e.videoUrl) site += '<a class="btn btn-outline" href="' + esc(e.videoUrl) + '" target="_blank" rel="noopener noreferrer">Watch video ↗</a>';
    var multi = e.multi;
    var otherCount = e.past.length + e.undated.length;
    var events = '<section class="events" aria-label="Events">' +
      '<h3>Upcoming events <span class="n">(' + e.upcoming.length + ')</span></h3>' +
      (e.upcoming.length
        ? '<ul class="event-list">' + e.upcoming.map(function (x) { return eventItem(x, 'up', multi); }).join('') + '</ul>'
        : '<p class="note">No upcoming dates listed' + (e.lastDate ? '. Last listed event: ' + esc(showDay(e.lastDate)) + '.' : '.') + '</p>') +
      (otherCount
        ? '<details class="past"' + (e.upcoming.length ? '' : ' open') + '><summary>Past and undated events (' + otherCount + ')</summary><ul class="event-list">' +
          e.past.map(function (x) { return eventItem(x, 'past', multi); }).join('') +
          e.undated.map(function (x) { return eventItem(x, 'undated', multi); }).join('') + '</ul></details>'
        : '') +
      '</section>';
    if (!e.upcoming.length && !e.past.length) {
      events = e.undated.length
        ? '<section class="events" aria-label="Events"><h3>Events <span class="n">(' + e.undated.length + ')</span></h3><ul class="event-list">' +
          e.undated.map(function (x) { return eventItem(x, 'undated', multi); }).join('') + '</ul></section>'
        : '';
    }

    // one project, several places: list them, each one jumps to its pin
    var places = '';
    if (multi) {
      places = '<section class="places" aria-label="Places">' +
        '<h3>Places <span class="n">(' + e.locs.length + ')</span></h3>' +
        (e.demoNote ? '<p class="note">' + esc(e.demoNote) + '</p>' : '') +
        '<ul class="place-list">' + e.locs.map(function (l) {
          var bits = [];
          if (l.upcoming.length) bits.push('<span class="when-tag">Next: ' + esc(showDay(l.upcoming[0].date)) + '</span>');
          else if (l.lastDate) bits.push('Last event ' + esc(showMonth(l.lastDate)));
          if (l.events.length) bits.push(plural(l.events.length, 'event', 'events'));
          else bits.push('No dates listed');
          return '<li><button type="button" class="place" data-act="loc" data-loc="' + l.i + '" aria-label="Show ' + esc(l.place) + ' on the map">' +
            '<span class="place__name">' + esc(l.place) + '</span>' +
            '<span class="place__meta">' + bits.join(' · ') + '</span>' +
            (l.note ? '<span class="place__note">' + esc(l.note) + '</span>' : '') +
            '</button></li>';
        }).join('') + '</ul></section>';
    }

    var live = e.live
      ? '<section class="live-box" aria-label="What happens live?"><h3>What happens live?</h3><p>' + esc(e.live) + '</p>' +
        (e.liveSample ? '<p class="live-box__note">Sample for this prototype, written from the project’s own description.</p>' : '') + '</section>'
      : '';
    var tags = '<div class="tags">' +
      (e.primary ? '<span class="tag tag--main"><span class="tag__k">Main format</span>' + icoFor(e.primary) + esc(typeLabel(e.primary)) + '</span>' : '') +
      (e.also.length ? '<span class="tags__also">Also listed under</span>' + e.also.map(function (t) { return '<span class="tag">' + icoFor(t) + esc(typeLabel(t)) + '</span>'; }).join('') : '') +
      '</div>';

    detail.innerHTML =
      '<div class="ljm-detail__head">' +
        '<button type="button" class="ljm-handle" data-act="toggle" aria-label="Expand or collapse details"></button>' +
        '<div class="ljm-detail__nav">' +
          '<button type="button" class="btn btn-ghost desktop-only" data-act="close" style="padding:0 10px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>All projects</button>' +
          '<span class="spacer"></span>' +
          '<span class="ljm-detail__pos">' + (idx + 1) + ' / ' + current.length + '</span>' +
          '<button type="button" class="btn btn-ghost btn-icon" data-act="prev" aria-label="Previous project"' + (current.length < 2 ? ' disabled' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<button type="button" class="btn btn-ghost btn-icon" data-act="next" aria-label="Next project"' + (current.length < 2 ? ' disabled' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<button type="button" class="btn btn-ghost btn-icon mobile-only" data-act="close" aria-label="Close details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke-linecap="round"/></svg></button>' +
        '</div>' +
        '<h2 id="ljm-detail-title">' + esc(e.title) + '</h2>' +
        '<p class="ljm-detail__meta">' + esc(multi ? placesText(e) : e.place) + (e.submitted ? ' · Added ' + esc(showDay(e.submitted)) : '') + '</p>' +
        tags +
        '<button type="button" class="btn btn-outline peek-more" data-act="expand">More about this project</button>' +
        '<small class="osm-credit">Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors</small>' +
      '</div>' +
      '<div class="ljm-detail__body">' + live + media +
        '<div class="prose">' + (e.descHtml || '<p>No description yet.</p>') + '</div>' +
        '<div class="detail-actions">' + site +
          '<button type="button" class="btn btn-outline" data-act="copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" stroke-linecap="round"/></svg>Copy link</button>' +
          '<button type="button" class="btn btn-outline" data-act="zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>Show on map</button>' +
        '</div>' + events + places +
      '</div>';
  }

  // every pin of the selected project is highlighted, wherever it is
  function setActiveMarker(id) {
    Object.keys(markers).forEach(function (k) {
      var el = markers[k].getElement();
      if (el) el.classList.toggle('is-active', !!id && markers[k].options.ljmId === id);
    });
    $all('.card').forEach(function (c) { c.classList.toggle('is-active', c.getAttribute('data-id') === id); });
  }

  // Phones: keep the selected pin visible above the bottom sheet.
  // centre=true always recentres it; centre=false only pans when the sheet would hide it.
  function keepAboveSheet(l, centre) {
    if (!l || !MOBILE_Q.matches || !detail.classList.contains('is-open')) return;
    var sheetH = detail.getBoundingClientRect().height || 0;
    var mapH = map.getSize().y;
    var pinY = map.latLngToContainerPoint([l.lat, l.lng]).y;
    var wantY = Math.max(60, (mapH - sheetH) / 2);
    var hidden = pinY > mapH - sheetH - 24 || pinY < 40;
    if (centre ? Math.abs(pinY - wantY) > 8 : hidden) map.panBy([0, pinY - wantY], { animate: true });
  }

  // Only the most recent request may move the map (prevents two fly-tos fighting each other).
  // li = one place to go to; without it, show all of the project's places that fit the filters.
  var focusToken = 0;
  function focusMarker(e, li) {
    var my = ++focusToken;
    var locs = (li != null && e.locs[li]) ? [e.locs[li]] : visibleLocs(e);
    locs = locs.filter(function (l) { var mk = markers[l.key]; return cluster.hasLayer(mk) || solo.hasLayer(mk) || flat.hasLayer(mk); });
    if (!locs.length) return;
    map.stop();
    function settle() { setTimeout(function () { if (my === focusToken) setActiveMarker(state.entry); }, 300); }
    if (locs.length > 1) {
      // Wait a frame: coming from the phone list view, the map has only just been shown and its size
      // (and the sheet's peek height) are stale until then. Fitting with a stale size zooms out to the world.
      setTimeout(function () {
        if (my !== focusToken) return;
        map.invalidateSize({ pan: false });
        var size = map.getSize();
        var mobile = MOBILE_Q.matches && detail.classList.contains('is-open');
        var sheetH = mobile ? Math.min(detail.getBoundingClientRect().height || 0, size.y * 0.6) : 0;
        map.once('moveend', function () { if (my === focusToken) settle(); });
        // pins stand ~44 px above their point, and on desktop the key covers the bottom-left corner
        var lg = document.getElementById('ljm-legend');
        var keyW = (!MOBILE_Q.matches && lg && lg.offsetWidth) ? lg.offsetWidth + 24 : 0;
        map.flyToBounds(L.latLngBounds(locs.map(function (l) { return [l.lat, l.lng]; })), {
          paddingTopLeft: [Math.max(40, keyW), MOBILE_Q.matches ? 110 : 70],   // phones: also clear the CTA button
          paddingBottomRight: [70, 30 + sheetH],                                // 70: the buttons on the right
          maxZoom: 7, duration: 0.8
        });
      }, 80);
      return;
    }
    var l = locs[0], m = markers[l.key];
    function finish() {
      if (my !== focusToken) return;
      keepAboveSheet(l, true);
      settle();
    }
    function reveal() {
      if (my !== focusToken) return;
      if (solo.hasLayer(m) || flat.hasLayer(m)) { finish(); return; }   // these pins are never clustered
      cluster.zoomToShowLayer(m, finish);
    }
    var z = Math.max(map.getZoom(), 6);
    if (map.getZoom() >= 6 && map.getBounds().pad(-0.1).contains(m.getLatLng())) reveal();
    else { map.once('moveend', reveal); map.flyTo([l.lat, l.lng], z, { duration: 0.8 }); }
  }

  function openEntry(id, opts) {
    opts = opts || {};
    var e = BY_ID[id];
    if (!e) return;
    state.entry = id;
    var soloOn = setSolo(e) && soloId === id;   // just switched to this project's solo view
    renderDetail(e);
    detail.classList.add('is-open');
    var mobile = MOBILE_Q.matches;
    detail.classList.toggle('is-peek', mobile && opts.source === 'map');
    setActiveMarker(id);
    if (opts.fly) focusMarker(e, opts.loc);
    else if (soloOn) focusMarker(e);   // opened from a pin: frame all of the project's places
    else {
      setTimeout(function () { setActiveMarker(id); }, 0);
      if (mobile && opts.source === 'map') keepAboveSheet(e.locs[opts.loc || 0], false);
    }
    if (!mobile || opts.source !== 'map') { try { detail.focus({ preventScroll: true }); } catch (err) {} }
    detail.querySelector('.ljm-detail__body') && (detail.querySelector('.ljm-detail__body').scrollTop = 0);
    writeHash();
  }

  function closeEntry(silent) {
    var was = state.entry;
    state.entry = null;
    setSolo(null);
    detail.classList.remove('is-open', 'is-peek');
    setActiveMarker(null);
    if (!silent) {
      writeHash();
      var card = was && $('.card[data-id="' + was + '"]');
      if (card && !MOBILE_Q.matches) card.focus({ preventScroll: false });
    }
  }

  function step(dir) {
    if (!state.entry || !current.length) return;
    var i = current.findIndex(function (x) { return x.id === state.entry; });
    var n = current[(i + dir + current.length) % current.length];
    var peek = detail.classList.contains('is-peek');
    openEntry(n.id, { fly: state.view === 'map' || !MOBILE_Q.matches, source: peek ? 'map' : 'list' });
  }

  detail.addEventListener('click', function (ev) {
    var vid = ev.target.closest('.video-poster');
    if (vid) {
      var box = vid.parentNode;
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-video');
      f.title = box.getAttribute('data-video-title') || 'Video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.setAttribute('allowfullscreen', '');
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      box.innerHTML = '';
      box.appendChild(f);
      return;
    }
    var b = ev.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    var e = BY_ID[state.entry];
    if (act === 'close') closeEntry();
    if (act === 'prev') step(-1);
    if (act === 'next') step(1);
    if (act === 'toggle') detail.classList.toggle('is-peek');
    if (act === 'expand') detail.classList.remove('is-peek');
    if (act === 'copy' && e) share(location.origin + location.pathname + hashFor({ entry: e.id, view: 'map' }), e.title);
    if (act === 'zoom' && e) {
      if (MOBILE_Q.matches) { setView('map'); detail.classList.add('is-peek'); }
      focusMarker(e);
    }
    if (act === 'loc' && e) {
      var li = +b.getAttribute('data-loc');
      var mk = markers[e.locs[li].key];
      if (!cluster.hasLayer(mk) && !solo.hasLayer(mk) && !flat.hasLayer(mk)) {   // that place is hidden by a filter: show it anyway
        (soloId === e.id ? solo : grouped ? cluster : flat).addLayer(mk);
      }
      if (MOBILE_Q.matches) { setView('map'); detail.classList.add('is-peek'); }
      focusMarker(e, li);
    }
  });

  /* ------------------------------------------------------------------
     Toolbar, list, sheets, keyboard
  ------------------------------------------------------------------ */
  var qTimer;
  $('#ljm-q').addEventListener('input', function (ev) {
    clearTimeout(qTimer);
    var v = ev.target.value;
    $('#ljm-search-wrap').classList.toggle('has-value', !!v);
    qTimer = setTimeout(function () { state.q = v.trim(); update({ fit: true }); }, 180);
  });
  $('#ljm-q').addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); ev.target.blur(); } });
  $('#ljm-clear').addEventListener('click', function () { state.q = ''; update({ fit: true }); $('#ljm-q').focus(); });
  $('#ljm-country').addEventListener('change', function (ev) { state.place = ev.target.value; update({ fit: true }); });
  $('#ljm-when').addEventListener('change', function (ev) { state.when = ev.target.value; update({ fit: true }); });
  $('#ljm-sort').addEventListener('change', function (ev) { state.sort = ev.target.value; update(); });

  function resetAll() {
    state.q = ''; state.types = []; state.place = ''; state.when = '';
    update({ fit: false });
    map.setView(homeView().center, homeView().zoom);
  }
  $('#ljm-reset').addEventListener('click', resetAll);
  $('#ljm-reset-m').addEventListener('click', resetAll);
  $all('[data-reset]').forEach(function (b) { b.addEventListener('click', resetAll); });

  $('#ljm-list').addEventListener('click', function (ev) {
    var c = ev.target.closest('.card');
    if (!c) return;
    openEntry(c.getAttribute('data-id'), { fly: !MOBILE_Q.matches, source: 'list' });
  });
  $('#ljm-list').addEventListener('mouseover', function (ev) {
    var c = ev.target.closest('.card');
    Object.keys(markers).forEach(function (k) { var el = markers[k].getElement(); if (el) el.classList.toggle('is-hover', !!c && c.getAttribute('data-id') === markers[k].options.ljmId); });
  });
  $('#ljm-list').addEventListener('mouseleave', function () {
    Object.keys(markers).forEach(function (k) { var el = markers[k].getElement(); if (el) el.classList.remove('is-hover'); });
  });

  function setView(v) {
    state.view = v;
    ljm.setAttribute('data-view', v);
    $all('[data-view-btn]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view-btn') === v)); });
    if (v === 'map') setTimeout(function () { map.invalidateSize(); }, 30);
    writeHash();
  }
  $all('[data-view-btn]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-view-btn');
      if (state.entry && v === 'list') closeEntry(true);
      setView(v);
    });
  });

  var filters = $('#ljm-filters'), scrim = $('#ljm-scrim'), filtersBtn = $('#ljm-filters-btn');
  function openFilters(on) {
    filters.classList.toggle('is-open', on);
    scrim.classList.toggle('is-open', on);
    filtersBtn.setAttribute('aria-expanded', String(on));
    if (on) { var first = filters.querySelector('.chip'); if (first) first.focus({ preventScroll: true }); }
    else if (MOBILE_Q.matches) filtersBtn.focus({ preventScroll: true });
  }
  filtersBtn.addEventListener('click', function () { openFilters(true); });
  $all('[data-close-filters]').forEach(function (b) { b.addEventListener('click', function () { openFilters(false); }); });
  scrim.addEventListener('click', function () { openFilters(false); });

  function share(url, title) {
    url = url || location.href;
    var coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse && navigator.share) {
      navigator.share({ title: title || document.title, url: url }).catch(function () {});
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () { toast('Link copied. It opens this exact view.'); }, function () { window.prompt('Copy this link', url); });
    } else {
      window.prompt('Copy this link', url);
    }
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('[data-goto-form]');
    if (a) { ev.preventDefault(); goToForm(); }
  });
  $all('[data-share]').forEach(function (b) { b.addEventListener('click', function () { writeHash(); share(location.href, 'Mapping Live Journalism'); }); });

  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    if (filters.classList.contains('is-open')) { openFilters(false); return; }
    if (state.entry) { closeEntry(); return; }
    if (ljm.classList.contains('is-fs')) setFullscreen(false);
  });
  detail.addEventListener('keydown', function (ev) {
    if (ev.target.closest('input,select,textarea')) return;
    if (ev.key === 'ArrowRight') step(1);
    if (ev.key === 'ArrowLeft') step(-1);
  });

  window.addEventListener('hashchange', function () {
    readHash();
    ljm.setAttribute('data-view', state.view);
    update({ fit: true });
    if (state.entry) openEntry(state.entry, { fly: true, source: 'list' }); else closeEntry(true);
  });
  MOBILE_Q.addEventListener('change', function () {
    openFilters(false);
    if (!MOBILE_Q.matches) detail.classList.remove('is-peek');
    setTimeout(function () { map.invalidateSize(); }, 60);
  });


  /* ------------------------------------------------------------------
     Entry form (prototype copy of EJC's Live Journalism Entry form; sends nothing)
  ------------------------------------------------------------------ */
  var form = $('#ljm-form');
  if (form) (function () {
  var COUNTRIES = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antigua & Barbuda", "Argentina", "Armenia", "Aruba", "Ascension Island", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia & Herzegovina", "Botswana", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Caribbean Netherlands", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo - Brazzaville", "Congo - Kinshasa", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czechia", "Côte d’Ivoire", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong SAR China", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao SAR China", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "North Macedonia", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territories", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Romania", "Russia", "Rwanda", "Réunion", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "St. Barthélemy", "St. Helena", "St. Kitts & Nevis", "St. Lucia", "St. Martin", "St. Pierre & Miquelon", "St. Vincent & Grenadines", "Sudan", "Suriname", "Svalbard & Jan Mayen", "Sweden", "Switzerland", "Syria", "São Tomé & Príncipe", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad & Tobago", "Tristan da Cunha", "Tunisia", "Turkmenistan", "Turks & Caicos Islands", "Tuvalu", "Türkiye", "U.S. Virgin Islands", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wallis & Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe", "Åland Islands"];
  var done = $('#f-done');
  $all('select[data-countries]', form).forEach(function (sel) {
    sel.innerHTML = '<option value="">Select a country</option>' + COUNTRIES.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
  });
  $all('.f-choice .ico[data-ico]', form).forEach(function (el) { el.outerHTML = icoFor(el.getAttribute('data-ico')); });
  var desc = $('#f-desc');
  desc.addEventListener('input', function () { $('#f-desc-n').textContent = desc.value.length + ' / 600'; });
  // "What happens live?" (proposed new field, 280 characters)
  var liveF = $('#f-live');
  if (liveF) liveF.addEventListener('input', function () { $('#f-live-n').textContent = liveF.value.length + ' / 280'; });
  // Main format: asked only when more than one type is ticked; with one type, that type is the main one
  var mainBox = $('#f-main'), mainChoices = $('#f-main-choices');
  function syncMain() {
    if (!mainBox) return;
    var ticked = $all('input[name="fields[liveJournalismType][]"]:checked', form).map(function (i) { return i.value; });
    var was = (form.querySelector('input[name="fields[primaryLiveJournalismType]"]:checked') || {}).value;
    mainBox.hidden = ticked.length < 2;
    mainChoices.innerHTML = ticked.length < 2 ? '' : ticked.map(function (k) {
      return '<label class="f-choice"><input type="radio" name="fields[primaryLiveJournalismType]" value="' + esc(k) + '" required' +
        (k === was ? ' checked' : '') + '><span class="box" aria-hidden="true"></span>' + icoFor(k) + esc(TYPE_BY_KEY[k].long) + '</label>';
    }).join('');
  }
  function syncMedia() {
    var v = (form.querySelector('input[name="fields[doYouWantToIncludeAnImageOrAVideoYoutubeVimeo]"]:checked') || {}).value;
    $all('[data-media]', form).forEach(function (box) {
      var on = box.getAttribute('data-media') === v;
      box.hidden = !on;
      $all('#f-image, #f-video', box).forEach(function (i) { i.required = on; });
    });
  }
  $all('input[name="fields[doYouWantToIncludeAnImageOrAVideoYoutubeVimeo]"]', form).forEach(function (r) { r.addEventListener('change', syncMedia); });
  var MAX_EVENTS = 5, evBox = $('#f-events'), addBtn = $('#f-add-event');
  function renumber() {
    $all('.f-event', evBox).forEach(function (row, i) {
      row.querySelector('.f-event__n').textContent = 'Event ' + (i + 1);
      $all('[data-col]', row).forEach(function (inp) {
        var col = inp.getAttribute('data-col');
        // col5 / col6 (city, country of this event) are proposed new columns
        inp.name = 'fields[eventDates][' + i + '][' + col + ']' + (col === 'col3' ? '[date]' : '');
        inp.id = 'f-ev' + i + col;
        inp.parentNode.querySelector('label').htmlFor = inp.id;
      });
    });
    addBtn.hidden = $all('.f-event', evBox).length >= MAX_EVENTS;
  }
  function addEvent(focus) {
    var row = document.createElement('div');
    row.className = 'f-event';
    row.innerHTML = '<div class="f-event__head"><span class="f-event__n"></span>' +
      '<button type="button" class="btn btn-ghost" data-remove style="min-height:36px;padding:0 10px">Remove</button></div>' +
      '<div class="f-grid">' +
      '<div class="f-field"><label class="f-l">Event title</label><input type="text" data-col="col1"></div>' +
      '<div class="f-field"><label class="f-l">Date</label><input type="date" data-col="col3"></div>' +
      '<div class="f-field span2"><label class="f-l">Short description</label><input type="text" data-col="col2"></div>' +
      '<div class="f-field span2"><label class="f-l">Link to event page</label><input type="url" data-col="col4" placeholder="https://"></div>' +
      '<div class="f-field"><label class="f-l">City, if not the main location</label><input type="text" data-col="col5" autocomplete="off"></div>' +
      '<div class="f-field"><label class="f-l">Country, if not the main location</label><select data-col="col6"><option value="">Same as the main location</option>' +
        COUNTRIES.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select></div>' +
      '</div>';
    evBox.appendChild(row);
    renumber();
    if (focus) row.querySelector('input').focus();
  }
  addBtn.addEventListener('click', function () { addEvent(true); });
  evBox.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-remove]');
    if (!b) return;
    b.closest('.f-event').remove();
    renumber();
    addBtn.focus();
  });
  function typesOk() {
    var ok = !!form.querySelector('input[name="fields[liveJournalismType][]"]:checked');
    $('#f-types-err').hidden = ok;
    return ok;
  }
  form.addEventListener('change', function (ev) { if (ev.target.name === 'fields[liveJournalismType][]') { typesOk(); syncMain(); } });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var tOk = typesOk();
    if (!form.checkValidity() || !tOk) {
      var bad = form.querySelector(':invalid');
      if (bad) { bad.reportValidity(); bad.focus(); }
      else form.querySelector('input[name="fields[liveJournalismType][]"]').focus();
      return;
    }
    // Prototype: nothing leaves the browser and nothing is stored.
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });
  $('#f-again').addEventListener('click', function () {
    form.reset(); evBox.innerHTML = ''; addEvent(false); syncMedia(); syncMain(); desc.dispatchEvent(new Event('input'));
    if (liveF) liveF.dispatchEvent(new Event('input'));
    $('#f-types-err').hidden = true; done.hidden = true; form.hidden = false; $('#f-title').focus();
  });
  addEvent(false);
  syncMedia();
  })();

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  readHash();
  if (MOBILE_Q.matches) $('#ljm-q').placeholder = 'Search';
  setView(state.view);
  var hasFilter = state.q || state.types.length || state.place || state.when;
  update({ fit: !!hasFilter });
  // the key exists now, so the default view can make room for it
  if (!hasFilter && !state.entry) map.setView(homeView().center, homeView().zoom, { animate: false });
  if (state.entry) openEntry(state.entry, { fly: true, source: 'list' });

  // expose for console checks / integration tests
  window.LJM = { goToForm: goToForm, state: state, entries: entries, map: map, markers: markers, open: openEntry, close: closeEntry, update: update,
    current: function () { return current; }, currentLocs: function () { return currentLocs; }, cluster: cluster };
})();
