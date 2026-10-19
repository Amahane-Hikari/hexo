/* 星港手帐 · interaction layer: reading progress, card spotlight, "/" search, voyage days, Pjax fade, local-preview counter label, Waline captcha fix. Pjax-safe, no dependencies. */
(function () {
  'use strict';

  if (window.LuomoUI) return;

  var bar = null;
  var article = null;
  var frame = 0;

  function isPost() {
    var site = window.GLOBAL_CONFIG_SITE;
    // Butterfly 4.13 sets isPost; 5.x sets pageType: 'post'.
    return Boolean(site && (site.isPost || site.pageType === 'post'));
  }

  function update() {
    frame = 0;
    if (!bar || !article) return;
    var rect = article.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 1;
    bar.style.setProperty('--lm-progress', progress.toFixed(4));
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  function initProgress() {
    article = isPost() ? document.getElementById('article-container') : null;
    if (!article) {
      if (bar) bar.hidden = true;
      return;
    }
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'lm-progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
    }
    bar.hidden = false;
    update();
  }

  /*
   * Waline (3.1.2, unchanged through 3.16.1) renders a Turnstile widget into
   * .wl-captcha-container on every submit and never removes it. The widget
   * stays on screen, and Turnstile rejects the next render into the same
   * container, so a second comment waits forever. Clear the container before
   * each render and shortly after a token is issued.
   */
  var CAPTCHA = '.wl-captcha-container';

  function clearCaptcha(ts) {
    var box = document.querySelector(CAPTCHA);
    if (box && box.children.length) {
      try { ts.remove(CAPTCHA); } catch (error) { /* already gone */ }
    }
  }

  function patchTurnstile() {
    var ts = window.turnstile;
    if (!ts || typeof ts.render !== 'function' || ts.luomoPatched) return;
    var render = ts.render;
    ts.render = function (container, options) {
      if (container === CAPTCHA && options) {
        clearCaptcha(ts);
        var done = options.callback;
        options = Object.assign({}, options, {
          callback: function (token) {
            if (typeof done === 'function') done(token);
            setTimeout(function () { clearCaptcha(ts); }, 900);
          }
        });
      }
      return render.call(ts, container, options);
    };
    ts.luomoPatched = true;
  }

  // Waline injects the Turnstile script on first submit; a capturing load
  // listener runs before Waline's own handler goes on to call render().
  document.addEventListener('load', function (event) {
    var src = event.target && event.target.src;
    if (src && src.indexOf('challenges.cloudflare.com/turnstile') !== -1) patchTurnstile();
  }, true);

  /*
   * Spotlight: cards carry a soft light that follows the pointer
   * (--lm-mx / --lm-my, drawn in 70-motion.css). Fine pointers only, and
   * skipped when the reader prefers reduced motion.
   */
  var SPOTLIT = '.lm-feature, .lm-gate, .lm-starmap-panel, #recent-posts .recent-post-item, #aside-content .card-widget';
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var lit = null;

  document.addEventListener('pointermove', function (event) {
    if (!finePointer.matches || calm.matches) return;
    var card = event.target.closest && event.target.closest(SPOTLIT);
    if (lit && lit !== card) lit.classList.remove('lm-lit');
    lit = card;
    if (!card) return;
    var rect = card.getBoundingClientRect();
    card.style.setProperty('--lm-mx', (event.clientX - rect.left) + 'px');
    card.style.setProperty('--lm-my', (event.clientY - rect.top) + 'px');
    card.classList.add('lm-lit');
  }, { passive: true });

  document.addEventListener('pointerleave', function () {
    if (lit) lit.classList.remove('lm-lit');
    lit = null;
  });

  // "/" opens search from anywhere outside a text field.
  document.addEventListener('keydown', function (event) {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    var field = event.target;
    if (field && (field.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(field.tagName))) return;
    var button = document.querySelector('#search-button .search');
    if (!button) return;
    event.preventDefault();
    button.click();
  });

  // Keep the hero's "days afloat" current between deploys.
  function updateVoyageDays() {
    document.querySelectorAll('[data-lm-days-since]').forEach(function (node) {
      var since = Date.parse(node.getAttribute('data-lm-days-since'));
      if (Number.isFinite(since)) node.textContent = String(Math.floor((Date.now() - since) / 86400000));
    });
  }

  /*
   * Busuanzi keys its counters by the page's host, so every local preview in
   * the world shares one "localhost" bucket (tens of millions of visits).
   * On local hosts, label the counters instead of showing those numbers.
   */
  var LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|.+\.localhost|.+\.test)$/i;
  var LOCAL_LABEL = '本地预览';

  function maskLocalCounters() {
    if (!LOCAL_HOST.test(location.hostname)) return;
    document.querySelectorAll('[id^="busuanzi_value_"]').forEach(function (node) {
      if (node.dataset.lmMasked) return;
      node.dataset.lmMasked = 'true';
      node.title = '本地预览时不蒜子返回的是所有人共用的 localhost 计数，不代表本站数据';
      var mask = function () {
        if (node.textContent !== LOCAL_LABEL) node.textContent = LOCAL_LABEL;
      };
      new MutationObserver(mask).observe(node, { childList: true, characterData: true, subtree: true });
      mask();
    });
  }

  // Soft fade of the content while Pjax swaps pages.
  document.addEventListener('pjax:send', function () {
    document.documentElement.classList.add('lm-swapping');
  });

  function init() {
    document.documentElement.classList.remove('lm-swapping');
    initProgress();
    patchTurnstile();
    updateVoyageDays();
    maskLocalCounters();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('pjax:complete', init);
  document.addEventListener('pjax:error', function () {
    document.documentElement.classList.remove('lm-swapping');
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.LuomoUI = { init: init };
})();
