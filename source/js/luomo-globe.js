/*
 * 星港手帐 · visitor star-map globe (sidebar "访客星图").
 * Draws an orthographic globe on <canvas>: Natural Earth land, graticule, voyage
 * arcs from the home port, and glowing points sized by visitors.
 * Data: /api/visitors (Vercel Web Analytics, aggregated server-side).
 * Markup: <div class="lm-globe" data-endpoint="/api/visitors" data-home="41.8,123.4">
 * (source/_data/widget.yml). Pjax-safe; loads its map bundle locally on demand.
 */
(function () {
  'use strict';

  if (window.LuomoGlobe) return;

  // Country centroids [lat, lon] (Google DSPL canonical countries table).
  var CENTROIDS = {"AD":[42.5,1.6],"AE":[23.4,53.8],"AF":[33.9,67.7],"AG":[17.1,-61.8],"AI":[18.2,-63.1],"AL":[41.2,20.2],"AM":[40.1,45],"AN":[12.2,-69.1],"AO":[-11.2,17.9],"AQ":[-75.3,-0.1],"AR":[-38.4,-63.6],"AS":[-14.3,-170.1],"AT":[47.5,14.6],"AU":[-25.3,133.8],"AW":[12.5,-70],"AZ":[40.1,47.6],"BA":[43.9,17.7],"BB":[13.2,-59.5],"BD":[23.7,90.4],"BE":[50.5,4.5],"BF":[12.2,-1.6],"BG":[42.7,25.5],"BH":[25.9,50.6],"BI":[-3.4,29.9],"BJ":[9.3,2.3],"BM":[32.3,-64.8],"BN":[4.5,114.7],"BO":[-16.3,-63.6],"BR":[-14.2,-51.9],"BS":[25,-77.4],"BT":[27.5,90.4],"BV":[-54.4,3.4],"BW":[-22.3,24.7],"BY":[53.7,28],"BZ":[17.2,-88.5],"CA":[56.1,-106.3],"CC":[-12.2,96.9],"CD":[-4,21.8],"CF":[6.6,20.9],"CG":[-0.2,15.8],"CH":[46.8,8.2],"CI":[7.5,-5.5],"CK":[-21.2,-159.8],"CL":[-35.7,-71.5],"CM":[7.4,12.4],"CN":[35.9,104.2],"CO":[4.6,-74.3],"CR":[9.7,-83.8],"CU":[21.5,-77.8],"CV":[16,-24],"CX":[-10.4,105.7],"CY":[35.1,33.4],"CZ":[49.8,15.5],"DE":[51.2,10.5],"DJ":[11.8,42.6],"DK":[56.3,9.5],"DM":[15.4,-61.4],"DO":[18.7,-70.2],"DZ":[28,1.7],"EC":[-1.8,-78.2],"EE":[58.6,25],"EG":[26.8,30.8],"EH":[24.2,-12.9],"ER":[15.2,39.8],"ES":[40.5,-3.7],"ET":[9.1,40.5],"FI":[61.9,25.7],"FJ":[-16.6,179.4],"FK":[-51.8,-59.5],"FM":[7.4,150.6],"FO":[61.9,-6.9],"FR":[46.2,2.2],"GA":[-0.8,11.6],"GB":[55.4,-3.4],"GD":[12.3,-61.6],"GE":[42.3,43.4],"GF":[3.9,-53.1],"GG":[49.5,-2.6],"GH":[7.9,-1],"GI":[36.1,-5.3],"GL":[71.7,-42.6],"GM":[13.4,-15.3],"GN":[9.9,-9.7],"GP":[17,-62.1],"GQ":[1.7,10.3],"GR":[39.1,21.8],"GS":[-54.4,-36.6],"GT":[15.8,-90.2],"GU":[13.4,144.8],"GW":[11.8,-15.2],"GY":[4.9,-58.9],"GZ":[31.4,34.3],"HK":[22.4,114.1],"HM":[-53.1,73.5],"HN":[15.2,-86.2],"HR":[45.1,15.2],"HT":[19,-72.3],"HU":[47.2,19.5],"ID":[-0.8,113.9],"IE":[53.4,-8.2],"IL":[31,34.9],"IM":[54.2,-4.5],"IN":[20.6,79],"IO":[-6.3,71.9],"IQ":[33.2,43.7],"IR":[32.4,53.7],"IS":[65,-19],"IT":[41.9,12.6],"JE":[49.2,-2.1],"JM":[18.1,-77.3],"JO":[30.6,36.2],"JP":[36.2,138.3],"KE":[0,37.9],"KG":[41.2,74.8],"KH":[12.6,105],"KI":[-3.4,-168.7],"KM":[-11.9,43.9],"KN":[17.4,-62.8],"KP":[40.3,127.5],"KR":[35.9,127.8],"KW":[29.3,47.5],"KY":[19.5,-80.6],"KZ":[48,66.9],"LA":[19.9,102.5],"LB":[33.9,35.9],"LC":[13.9,-61],"LI":[47.2,9.6],"LK":[7.9,80.8],"LR":[6.4,-9.4],"LS":[-29.6,28.2],"LT":[55.2,23.9],"LU":[49.8,6.1],"LV":[56.9,24.6],"LY":[26.3,17.2],"MA":[31.8,-7.1],"MC":[43.8,7.4],"MD":[47.4,28.4],"ME":[42.7,19.4],"MG":[-18.8,46.9],"MH":[7.1,171.2],"MK":[41.6,21.7],"ML":[17.6,-4],"MM":[21.9,96],"MN":[46.9,103.8],"MO":[22.2,113.5],"MP":[17.3,145.4],"MQ":[14.6,-61],"MR":[21,-10.9],"MS":[16.7,-62.2],"MT":[35.9,14.4],"MU":[-20.3,57.6],"MV":[3.2,73.2],"MW":[-13.3,34.3],"MX":[23.6,-102.6],"MY":[4.2,102],"MZ":[-18.7,35.5],"NA":[-23,18.5],"NC":[-20.9,165.6],"NE":[17.6,8.1],"NF":[-29,168],"NG":[9.1,8.7],"NI":[12.9,-85.2],"NL":[52.1,5.3],"NO":[60.5,8.5],"NP":[28.4,84.1],"NR":[-0.5,166.9],"NU":[-19.1,-169.9],"NZ":[-40.9,174.9],"OM":[21.5,55.9],"PA":[8.5,-80.8],"PE":[-9.2,-75],"PF":[-17.7,-149.4],"PG":[-6.3,144],"PH":[12.9,121.8],"PK":[30.4,69.3],"PL":[51.9,19.1],"PM":[46.9,-56.3],"PN":[-24.7,-127.4],"PR":[18.2,-66.6],"PS":[32,35.2],"PT":[39.4,-8.2],"PW":[7.5,134.6],"PY":[-23.4,-58.4],"QA":[25.4,51.2],"RE":[-21.1,55.5],"RO":[45.9,25],"RS":[44,21],"RU":[61.5,105.3],"RW":[-1.9,29.9],"SA":[23.9,45.1],"SB":[-9.6,160.2],"SC":[-4.7,55.5],"SD":[12.9,30.2],"SE":[60.1,18.6],"SG":[1.4,103.8],"SH":[-24.1,-10],"SI":[46.2,15],"SJ":[77.6,23.7],"SK":[48.7,19.7],"SL":[8.5,-11.8],"SM":[43.9,12.5],"SN":[14.5,-14.5],"SO":[5.2,46.2],"SR":[3.9,-56],"ST":[0.2,6.6],"SV":[13.8,-88.9],"SY":[34.8,39],"SZ":[-26.5,31.5],"TC":[21.7,-71.8],"TD":[15.5,18.7],"TF":[-49.3,69.3],"TG":[8.6,0.8],"TH":[15.9,101],"TJ":[38.9,71.3],"TK":[-9,-171.9],"TL":[-8.9,125.7],"TM":[39,59.6],"TN":[33.9,9.5],"TO":[-21.2,-175.2],"TR":[39,35.2],"TT":[10.7,-61.2],"TV":[-7.1,177.6],"TW":[23.7,121],"TZ":[-6.4,34.9],"UA":[48.4,31.2],"UG":[1.4,32.3],"US":[37.1,-95.7],"UY":[-32.5,-55.8],"UZ":[41.4,64.6],"VA":[41.9,12.5],"VC":[13,-61.3],"VE":[6.4,-66.6],"VG":[18.4,-64.6],"VI":[18.3,-64.9],"VN":[14.1,108.3],"VU":[-15.4,167],"WF":[-13.8,-177.2],"WS":[-13.8,-172.1],"XK":[42.6,20.9],"YE":[15.6,48.5],"YT":[-12.8,45.2],"ZA":[-30.6,22.9],"ZM":[-13.1,27.8],"ZW":[-19,29.2]};

  var TAU = Math.PI * 2;
  var RAD = Math.PI / 180;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var instance = null;
  var geoPromise = null;

  function geoReady() {
    var geo = window.LuomoGeo;
    return geo && typeof geo.geoOrthographic === 'function' && typeof geo.geoPath === 'function' && geo.land;
  }

  // Shared across PJAX instances, including a failed request: never fetch twice.
  function loadGeo() {
    if (geoReady()) return Promise.resolve(window.LuomoGeo);
    if (!geoPromise) {
      geoPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = '/js/vendor/luomo-geo.min.js';
        script.async = true;
        script.onload = function () {
          script.onload = script.onerror = null;
          geoReady() ? resolve(window.LuomoGeo) : reject(new Error('Globe map unavailable'));
        };
        script.onerror = function () {
          script.onload = script.onerror = null;
          reject(new Error('Globe map unavailable'));
        };
        document.head.appendChild(script);
      });
    }
    return geoPromise;
  }

  // Short forms for names Intl renders long (e.g. 中国香港特别行政区).
  var SHORT_NAMES = { HK: '香港', MO: '澳门', TW: '台湾', US: '美国', GB: '英国', KR: '韩国', RU: '俄罗斯', AE: '阿联酋' };

  function regionName(code) {
    if (SHORT_NAMES[code]) return SHORT_NAMES[code];
    try {
      return new Intl.DisplayNames(['zh-CN'], { type: 'region' }).of(code) || code;
    } catch (_) {
      return code;
    }
  }

  function token(name, fallback) {
    var value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function palette() {
    return {
      ink: token('--lm-ink', '#1f2440'),
      ink3: token('--lm-ink-3', '#7c8199'),
      line: token('--lm-line-strong', 'rgba(31,36,64,0.18)'),
      violet: token('--lm-violet', '#6656d8'),
      coral: token('--lm-coral', '#e8665b'),
      sky: token('--lm-sky', '#2f97c1'),
      dark: document.documentElement.getAttribute('data-theme') === 'dark'
    };
  }

  // Orthographic projection with rotation (lambda0) and tilt (phi0).
  function project(lat, lon, view) {
    var phi = lat * RAD;
    var lambda = (lon - view.lon) * RAD;
    var phi0 = view.tilt * RAD;
    var cosc = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda);
    return {
      x: Math.cos(phi) * Math.sin(lambda),
      y: Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda),
      front: cosc
    };
  }

  // Points along the great circle between two [lat, lon] pairs.
  function arc(a, b, steps) {
    var p1 = [a[0] * RAD, a[1] * RAD];
    var p2 = [b[0] * RAD, b[1] * RAD];
    var v1 = [Math.cos(p1[0]) * Math.cos(p1[1]), Math.cos(p1[0]) * Math.sin(p1[1]), Math.sin(p1[0])];
    var v2 = [Math.cos(p2[0]) * Math.cos(p2[1]), Math.cos(p2[0]) * Math.sin(p2[1]), Math.sin(p2[0])];
    var dot = Math.min(1, Math.max(-1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
    var omega = Math.acos(dot);
    var out = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var s1 = omega ? Math.sin((1 - t) * omega) / Math.sin(omega) : 1 - t;
      var s2 = omega ? Math.sin(t * omega) / Math.sin(omega) : t;
      var x = s1 * v1[0] + s2 * v2[0];
      var y = s1 * v1[1] + s2 * v2[1];
      var z = s1 * v1[2] + s2 * v2[2];
      var lift = 1 + Math.sin(Math.PI * t) * Math.min(0.1, omega * 0.06);
      out.push({ lat: Math.atan2(z, Math.sqrt(x * x + y * y)) / RAD, lon: Math.atan2(y, x) / RAD, lift: lift });
    }
    return out;
  }

  function Globe(root) {
    this.root = root;
    this.home = (root.getAttribute('data-home') || '41.8,123.4').split(',').map(Number);
    this.view = { lon: this.home[1] - 20, tilt: 22 };
    this.points = [];
    this.state = 'loading';
    this.visible = true;
    this.frame = 0;
    this.last = 0;
    this.hover = null;
    this.pointer = null;
    this.destroyed = false;
    this.landDirty = true;
    this.landLast = 0;
    this.build();
    this.observe();
    this.loadLand();
    this.load();
  }

  Globe.prototype.build = function () {
    var root = this.root;
    root.innerHTML = '';
    root.classList.add('is-loading');
    var stage = document.createElement('div');
    stage.className = 'lm-globe-stage';
    this.stage = stage;
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.title = '陆地数据：Natural Earth 110m';
    this.landCanvas = document.createElement('canvas');
    this.landCtx = this.landCanvas.getContext('2d');
    this.tip = document.createElement('div');
    this.tip.className = 'lm-globe-tip';
    this.tip.setAttribute('role', 'tooltip');
    this.tip.hidden = true;
    this.status = document.createElement('p');
    this.status.className = 'lm-globe-status';
    this.status.setAttribute('role', 'status');
    stage.append(this.canvas, this.tip, this.status);
    this.list = document.createElement('ol');
    this.list.className = 'lm-globe-list';
    this.meta = document.createElement('p');
    this.meta.className = 'lm-globe-meta';
    root.append(stage, this.list, this.meta);
    this.ctx = this.canvas.getContext('2d');
    this.colors = palette();
    this.resize();
  };

  Globe.prototype.observe = function () {
    var self = this;
    this.onResize = function () { self.resize(); self.draw(); };
    window.addEventListener('resize', this.onResize, { passive: true });
    if ('ResizeObserver' in window) {
      this.ro = new ResizeObserver(this.onResize);
      this.ro.observe(this.root);
    }
    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver(function (entries) {
        if (self.destroyed) return;
        self.visible = entries[0].isIntersecting;
        if (self.visible) self.start();
      });
      this.io.observe(this.root);
    }
    this.themeObserver = new MutationObserver(function () {
      if (self.destroyed) return;
      self.colors = palette();
      self.landDirty = true;
      self.draw();
    });
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this.onMotionChange = function () {
      if (self.destroyed) return;
      if (calm.matches) {
        if (self.frame) cancelAnimationFrame(self.frame);
        self.frame = 0;
        self.draw();
      } else self.start();
    };
    if (calm.addEventListener) calm.addEventListener('change', this.onMotionChange);
    else if (calm.addListener) calm.addListener(this.onMotionChange);

    // Pause rotation while inspecting the globe; drag to turn it manually.
    var drag = null;
    this.canvas.addEventListener('pointerenter', function (event) {
      if (!self.destroyed && event.pointerType !== 'touch') self.pick(event);
    });
    this.canvas.addEventListener('pointerdown', function (event) {
      if (self.destroyed || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, lon: self.view.lon, tilt: self.view.tilt };
      self.canvas.setPointerCapture(event.pointerId);
      self.root.classList.add('is-dragging');
      self.hover = null;
      self.tip.hidden = true;
    });
    this.canvas.addEventListener('pointermove', function (event) {
      if (self.destroyed) return;
      if (drag) {
        var k = 180 / self.radius / Math.PI;
        self.view.lon = drag.lon - (event.clientX - drag.x) * k;
        self.view.tilt = Math.max(-60, Math.min(60, drag.tilt + (event.clientY - drag.y) * k));
        self.draw();
        return;
      }
      self.pick(event);
    });
    var release = function (event) {
      if (self.destroyed || !drag) return;
      drag = null;
      self.root.classList.remove('is-dragging');
      self.landDirty = true;
      if (event.type === 'pointerup' && event.pointerType !== 'touch') self.pick(event);
      else { self.pointer = null; self.draw(); }
    };
    this.canvas.addEventListener('pointerup', release);
    this.canvas.addEventListener('pointercancel', release);
    this.canvas.addEventListener('lostpointercapture', release);
    this.canvas.addEventListener('pointerleave', function () {
      if (self.destroyed) return;
      self.pointer = null;
      self.hover = null;
      self.tip.hidden = true;
      self.draw();
    });
  };

  Globe.prototype.resize = function () {
    if (this.destroyed) return;
    var size = Math.max(160, Math.round(this.root.clientWidth || 240));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.size === size && this.dpr === dpr) return;
    this.size = size;
    this.dpr = dpr;
    this.radius = size * 0.4;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.landCanvas.width = this.canvas.width;
    this.landCanvas.height = this.canvas.height;
    this.landCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.landDirty = true;
  };

  Globe.prototype.loadLand = function () {
    var self = this;
    loadGeo().then(function (geo) {
      if (self.destroyed || !document.contains(self.root)) return;
      self.landProjection = geo.geoOrthographic().clipAngle(90).precision(0.3);
      self.landPath = geo.geoPath().projection(self.landProjection).context(self.landCtx);
      self.land = geo.land;
      self.landDirty = true;
      self.draw();
    }).catch(function () { /* The visitor globe remains usable without its map. */ });
  };

  Globe.prototype.drawLand = function () {
    if (!this.land || !this.landPath) return;
    var now = performance.now();
    var previous = this.landView;
    // Longitude can keep increasing during rotation; compare across the dateline.
    var longitude = previous ? Math.abs(((this.view.lon - previous.lon) % 360 + 540) % 360 - 180) : 360;
    var angle = previous ? Math.max(longitude, Math.abs(this.view.tilt - previous.tilt)) : 360;
    if (this.landDirty || (angle > 0.001 && (now - this.landLast >= 64 || angle >= 1.5))) {
      var ctx = this.landCtx;
      var c = this.size / 2;
      var r = this.radius;
      ctx.clearRect(0, 0, this.size, this.size);
      ctx.save();
      try {
        // geoPath clips spherical polygons at the horizon before drawing them.
        // Canvas clipping also keeps the antialiased coast inside the sphere.
        ctx.beginPath(); ctx.arc(c, c, r, 0, TAU); ctx.clip();
        this.landProjection.rotate([-this.view.lon, -this.view.tilt]).translate([c, c]).scale(r);
        ctx.beginPath();
        this.landPath(this.land);
        ctx.fillStyle = this.colors.dark ? 'rgba(130,137,183,0.38)' : 'rgba(158,154,202,0.48)';
        ctx.strokeStyle = this.colors.dark ? 'rgba(186,193,234,0.5)' : 'rgba(101,94,158,0.52)';
        ctx.lineWidth = 0.7;
        ctx.lineJoin = 'round';
        ctx.fill();
        ctx.stroke();
        this.landView = { lon: this.view.lon, tilt: this.view.tilt };
        this.landLast = now;
        this.landDirty = false;
      } catch (_) {
        // A bad optional bundle must not interrupt visitor points or animation.
        this.land = null;
      } finally {
        ctx.restore();
      }
      if (!this.land) { ctx.clearRect(0, 0, this.size, this.size); return; }
    }
    this.ctx.drawImage(this.landCanvas, 0, 0, this.size, this.size);
  };

  Globe.prototype.load = function () {
    var self = this;
    var endpoint = this.root.getAttribute('data-endpoint') || '/api/visitors';
    fetch(endpoint, { headers: { Accept: 'application/json' } })
      .then(function (response) { return response.ok ? response.json() : { status: 'unavailable' }; })
      .catch(function () { return { status: 'unavailable' }; })
      .then(function (data) {
        if (!self.destroyed && document.contains(self.root)) self.apply(data || {});
      });
  };

  Globe.prototype.apply = function (data) {
    if (this.destroyed) return;
    var self = this;
    var countries = data.status === 'ok' && Array.isArray(data.countries) ? data.countries : [];
    var max = countries.reduce(function (m, c) { return Math.max(m, c.visitors); }, 1);
    var colors = ['violet', 'coral', 'sky'];
    this.points = countries.filter(function (c) { return CENTROIDS[c.code]; }).map(function (c, i) {
      var at = CENTROIDS[c.code];
      return {
        code: c.code,
        name: regionName(c.code),
        visitors: c.visitors,
        lat: at[0],
        lon: at[1],
        weight: Math.sqrt(c.visitors / max),
        tone: colors[i % colors.length],
        path: arc(self.home, at, 48),
        phase: Math.random()
      };
    });
    this.state = this.points.length ? 'ok' : (data.status === 'ok' ? 'empty' : 'unavailable');
    this.root.classList.remove('is-loading');
    this.root.classList.toggle('is-unavailable', this.state !== 'ok');

    if (this.state === 'ok') {
      this.status.textContent = '';
      this.list.innerHTML = this.points.slice(0, 5).map(function (p) {
        return '<li><span class="lm-globe-name"></span><span class="lm-globe-bar" style="--lm-share:' +
          (p.visitors / self.points[0].visitors).toFixed(3) + '"></span><b>' + p.visitors + '</b></li>';
      }).join('');
      this.list.querySelectorAll('.lm-globe-name').forEach(function (node, i) { node.textContent = self.points[i].name; });
      this.meta.textContent = '近 ' + (data.windowDays || 90) + ' 天 · ' + this.points.length + ' 个国家和地区 · ' + data.total + ' 位访客';
    } else {
      var lines = {
        empty: ['访客星图', '近期还没有访客数据'],
        unconfigured: ['访客星图 · 暂不可用', '等待接入 Vercel Web Analytics'],
        unavailable: ['访客星图 · 暂不可用', '统计数据暂时取不到']
      }[this.state === 'empty' ? 'empty' : (data.status === 'unconfigured' ? 'unconfigured' : 'unavailable')];
      this.status.innerHTML = '<b></b><span></span>';
      this.status.firstChild.textContent = lines[0];
      this.status.lastChild.textContent = lines[1];
      // Safe upstream status (e.g. upstream_403) for whoever is debugging.
      this.status.title = data.reason ? '诊断码：' + data.reason : '';
      this.list.innerHTML = '';
      this.meta.textContent = '';
    }
    this.start();
  };

  Globe.prototype.start = function () {
    var self = this;
    if (this.destroyed || this.frame || !this.visible) return;
    if (calm.matches || document.hidden) { this.draw(); return; }
    var tick = function (time) {
      self.frame = 0;
      if (self.destroyed || !self.visible || document.hidden || !document.contains(self.root)) return;
      if (calm.matches) { self.draw(); return; }
      var dt = self.last ? Math.min(64, time - self.last) : 16;
      self.last = time;
      if (!self.pointer && !self.root.classList.contains('is-dragging')) self.view.lon += dt * 0.006;
      self.time = time;
      self.draw();
      self.frame = requestAnimationFrame(tick);
    };
    this.last = 0;
    this.frame = requestAnimationFrame(tick);
  };

  Globe.prototype.screen = function (lat, lon, lift) {
    var p = project(lat, lon, this.view);
    var r = this.radius * (lift || 1);
    var c = this.size / 2;
    return { x: c + p.x * r, y: c - p.y * r, front: p.front };
  };

  Globe.prototype.draw = function () {
    if (this.destroyed) return;
    var ctx = this.ctx;
    var s = this.size;
    var c = s / 2;
    var r = this.radius;
    var k = this.colors;
    ctx.clearRect(0, 0, s, s);

    // Halo and sphere.
    var halo = ctx.createRadialGradient(c, c, r * 0.9, c, c, r * 1.25);
    halo.addColorStop(0, k.dark ? 'rgba(165,150,255,0.22)' : 'rgba(102,86,216,0.16)');
    halo.addColorStop(1, 'rgba(102,86,216,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(c, c, r * 1.25, 0, TAU); ctx.fill();

    var sea = ctx.createRadialGradient(c - r * 0.35, c - r * 0.4, r * 0.1, c, c, r);
    if (k.dark) {
      sea.addColorStop(0, '#2a2d52'); sea.addColorStop(0.7, '#171a33'); sea.addColorStop(1, '#0e1024');
    } else {
      sea.addColorStop(0, '#ffffff'); sea.addColorStop(0.65, '#eceafb'); sea.addColorStop(1, '#d9d4f6');
    }
    ctx.fillStyle = sea;
    ctx.beginPath(); ctx.arc(c, c, r, 0, TAU); ctx.fill();
    this.drawLand();

    // Graticule (front hemisphere only).
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = k.dark ? 'rgba(200,200,255,0.16)' : 'rgba(70,60,160,0.16)';
    for (var lon = -180; lon < 180; lon += 30) this.line(function (t) { return [t, lon]; }, -90, 90);
    for (var lat = -60; lat <= 60; lat += 30) this.line(function (t) { return [lat, t]; }, -180, 180);

    // Rim light.
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = k.dark ? 'rgba(165,150,255,0.45)' : 'rgba(102,86,216,0.35)';
    ctx.beginPath(); ctx.arc(c, c, r, 0, TAU); ctx.stroke();

    var t = (this.time || 0) / 1000;
    var self = this;

    // Voyage arcs from the home port, with a travelling spark.
    this.points.forEach(function (p) {
      ctx.strokeStyle = k[p.tone];
      ctx.lineWidth = 0.6 + p.weight * 1.2;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      var open = false;
      p.path.forEach(function (q) {
        var pt = self.screen(q.lat, q.lon, q.lift);
        if (pt.front > 0.02) { open ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y); open = true; } else open = false;
      });
      ctx.stroke();
      if (!calm.matches) {
        var idx = Math.floor(((t * 0.25 + p.phase) % 1) * (p.path.length - 1));
        var q = p.path[idx];
        var sp = self.screen(q.lat, q.lon, q.lift);
        if (sp.front > 0) {
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = k[p.tone];
          ctx.beginPath(); ctx.arc(sp.x, sp.y, 1.6, 0, TAU); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    });

    // Visitor points.
    this.points.forEach(function (p) {
      var pt = self.screen(p.lat, p.lon);
      p.screen = pt;
      if (pt.front <= 0) return;
      var size = 2 + p.weight * 5;
      var pulse = calm.matches ? 0 : (Math.sin(t * 2 + p.phase * TAU) + 1) / 2;
      var glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, size * (2.6 + pulse));
      glow.addColorStop(0, k[p.tone]);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.35 * Math.min(1, pt.front * 3);
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, size * (2.6 + pulse), 0, TAU); ctx.fill();
      ctx.globalAlpha = Math.min(1, pt.front * 3);
      ctx.fillStyle = k[p.tone];
      ctx.beginPath(); ctx.arc(pt.x, pt.y, size, 0, TAU); ctx.fill();
      ctx.strokeStyle = k.dark ? 'rgba(255,255,255,0.7)' : '#fff';
      ctx.lineWidth = p === self.hover ? 2 : 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // The home port: a four-point star.
    var home = this.screen(this.home[0], this.home[1]);
    if (home.front > 0) {
      ctx.save();
      ctx.translate(home.x, home.y);
      ctx.fillStyle = k.coral;
      ctx.globalAlpha = Math.min(1, home.front * 3);
      ctx.beginPath();
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4;
        var rr = i % 2 ? 1.6 : 5.5;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    this.updateHover();
  };

  Globe.prototype.line = function (at, from, to) {
    var ctx = this.ctx;
    var open = false;
    ctx.beginPath();
    for (var v = from; v <= to; v += 3) {
      var ll = at(v);
      var pt = this.screen(ll[0], ll[1]);
      if (pt.front > 0) { open ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y); open = true; } else open = false;
    }
    ctx.stroke();
  };

  Globe.prototype.pick = function (event) {
    if (this.destroyed) return;
    this.pointer = { x: event.clientX, y: event.clientY };
    this.draw();
  };

  Globe.prototype.updateHover = function () {
    if (!this.pointer || this.root.classList.contains('is-dragging')) {
      this.hover = null;
      this.tip.hidden = true;
      return;
    }
    var rect = this.canvas.getBoundingClientRect();
    // Convert CSS pixels to drawing coordinates (also works during scaling).
    var x = (this.pointer.x - rect.left) * this.size / rect.width;
    var y = (this.pointer.y - rect.top) * this.size / rect.height;
    if (!rect.width || !rect.height || x < 0 || y < 0 || x > this.size || y > this.size) {
      this.pointer = null;
      this.hover = null;
      this.tip.hidden = true;
      return;
    }
    var best = null;
    var bestDist = Infinity;
    this.points.forEach(function (p) {
      if (!p.screen || p.screen.front <= 0) return;
      var d = Math.hypot(p.screen.x - x, p.screen.y - y);
      if (d <= 8 + p.weight * 5 && d < bestDist) { best = p; bestDist = d; }
    });
    this.hover = best;
    if (best) {
      this.tip.textContent = best.name + ' · ' + best.visitors + ' 位访客';
      this.tip.hidden = false;
      var half = this.tip.offsetWidth / 2;
      var left = this.canvas.offsetLeft + best.screen.x;
      this.tip.style.left = Math.max(half + 4, Math.min(this.stage.clientWidth - half - 4, left)) + 'px';
      this.tip.style.top = Math.max(this.tip.offsetHeight + 4, best.screen.y - 12) + 'px';
    } else {
      this.tip.hidden = true;
    }
  };

  Globe.prototype.destroy = function () {
    this.destroyed = true;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    window.removeEventListener('resize', this.onResize);
    if (this.io) this.io.disconnect();
    if (this.ro) this.ro.disconnect();
    if (this.themeObserver) this.themeObserver.disconnect();
    if (calm.removeEventListener) calm.removeEventListener('change', this.onMotionChange);
    else if (calm.removeListener) calm.removeListener(this.onMotionChange);
  };

  function init() {
    var root = document.querySelector('.lm-globe');
    if (instance && instance.root === root) return;
    if (instance) instance.destroy();
    instance = root ? new Globe(root) : null;
  }

  document.addEventListener('visibilitychange', function () { if (instance && !document.hidden) instance.start(); });
  document.addEventListener('pjax:complete', init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.LuomoGlobe = { init: init };
})();
