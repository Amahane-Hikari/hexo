'use strict';

/*
 * Home page sections without forking the theme templates.
 *
 * Reads source/_data/home.yml and inserts the "星港入口" gates plus a heading
 * at the top of #recent-posts on the first home page only. Styling lives in
 * source/_luomo/styles/30-home.css; see docs/FRONTEND.md.
 */
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ESCAPES[ch]);

// Butterfly 4.13 renders class="recent-posts"; 5.x adds a modifier (class="recent-posts nc").
const ANCHOR = /<div class="recent-posts[^"]*" id="recent-posts">/;

function heading(eyebrow, title, extraClass = '') {
  if (!title) return '';
  const eyebrowHTML = eyebrow ? `<span class="lm-eyebrow">${escapeHTML(eyebrow)}</span>` : '';
  return `<header class="lm-section-head${extraClass}">${eyebrowHTML}<h2>${escapeHTML(title)}</h2></header>`;
}

function gate(item) {
  const icon = item.icon ? `<span class="lm-gate-icon" aria-hidden="true"><i class="${escapeHTML(item.icon)}"></i></span>` : '';
  const desc = item.desc ? `<small>${escapeHTML(item.desc)}</small>` : '';
  return `<a class="lm-gate" href="${escapeHTML(item.link)}">${icon}<span class="lm-gate-text"><strong>${escapeHTML(item.name)}</strong>${desc}</span><i class="fas fa-arrow-right lm-gate-go" aria-hidden="true"></i></a>`;
}

function render(home) {
  const gates = (home.gates || []).filter(item => item && item.name && item.link);
  const gatesHTML = gates.length
    ? `<section class="lm-gates" aria-label="${escapeHTML(home.gates_title || '入口')}">${heading(home.gates_eyebrow, home.gates_title)}<div class="lm-gates-grid">${gates.map(gate).join('')}</div></section>`
    : '';
  return gatesHTML + heading(home.list_eyebrow, home.list_title, ' lm-list-head');
}

hexo.extend.filter.register('after_render:html', function (html, locals) {
  const page = locals && locals.page;
  if (!page || page.__index !== true || (page.current && page.current !== 1)) return html;
  const home = hexo.locals.get('data').home;
  if (!home || !ANCHOR.test(html)) return html;
  return html.replace(ANCHOR, match => match + render(home));
});
