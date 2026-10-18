/* 星港手帐 · small interaction layer (reading progress, Waline captcha fix). Pjax-safe, no dependencies. */
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

  function init() {
    initProgress();
    patchTurnstile();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('pjax:complete', init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.LuomoUI = { init: init };
})();
