'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../public');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = JSON.parse(read('search.json'));
assert.ok(index.length >= 5, 'all existing published articles must remain searchable');
for (const id of ['7a032026', 'fa8c2026', '3d61fa8b', '9f7e31ac', '7c2a4f61']) {
  assert.ok(index.some(entry => entry.url.includes(id)), `missing searchable article ${id}`);
  assert.ok(fs.existsSync(path.join(root, `posts/${id}.html`)), `missing article ${id}`);
}
for (const route of ['projects', 'cloud', 'build-log', 'status']) {
  const html = read(`${route}/index.html`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route} must have one main heading`);
  assert.ok(html.includes('name="description"'), `${route} needs a search description`);
}
assert.ok(/<link\b[^>]*rel="canonical"[^>]*href="https:\/\/blog\.luomo\.moe\/"/.test(read('index.html')), 'canonical homepage should use the directory URL');
// Visual layer: every partial is bundled, none is published on its own.
const theme = read('css/luomo-theme.css');
const partials = fs.readdirSync(path.resolve(__dirname, '../source/_luomo/styles')).filter(name => name.endsWith('.css'));
for (const name of partials) assert.ok(theme.includes(`==== ${name} ====`), `style partial ${name} missing from css/luomo-theme.css`);
assert.equal(fs.existsSync(path.join(root, '_luomo')), false, 'style partials must not be published');
assert.ok(read('index.html').includes('/js/luomo-ui.js'), 'interaction layer must be injected');
// Sidebar widgets from source/_data/widget.yml render as-is (the visitor globe lives there).
assert.ok(/id="user-map"[\s\S]*id="mmvst_globe"/.test(read('index.html')), 'visitor globe widget must render in the sidebar');
// Home sections from source/_data/home.yml render once, on the first home page only.
assert.equal((read('index.html').match(/class="lm-gates"/g) || []).length, 1, 'home must render the starport gates once');
assert.equal(read('archives/index.html').includes('class="lm-gates"'), false, 'gates belong to the home page only');
assert.equal(fs.existsSync(path.join(root, 'status/config.js')), false, 'legacy public configuration must not be deployed');
assert.equal(fs.existsSync(path.join(root, 'status/static')), false, 'legacy status bundles must not be deployed');
// Third-party banners carry a credit; the owner's own images stay unlabelled.
// Check the actual theme selection, including post cover fallbacks.
const imageCreditData = require('../source/_data/image_credits.json');
const imageCredits = imageCreditData.images;
const ownedImages = new Set(imageCreditData.owned_images);
const creditPage = read('image-credits/index.html');
const creditByImage = new Map();
const creditIds = new Set();
for (const image of ownedImages) {
  assert.ok(fs.existsSync(path.join(root, image)), `owned image missing: ${image}`);
  assert.equal(creditPage.includes(image), false, `owned image must not appear on the credits page: ${image}`);
}
for (const credit of imageCredits) {
  assert.ok(/^[a-z0-9-]+$/.test(credit.id) && !creditIds.has(credit.id), `invalid or duplicate image credit id: ${credit.id}`);
  assert.ok(!creditByImage.has(credit.image), `duplicate image credit: ${credit.image}`);
  assert.equal(ownedImages.has(credit.image), false, `image cannot be both owned and third-party: ${credit.image}`);
  assert.ok(fs.existsSync(path.join(root, credit.image)), `credited image missing: ${credit.image}`);
  assert.ok(creditPage.includes(`id="${credit.id}"`), `credit detail anchor missing: ${credit.id}`);
  creditIds.add(credit.id);
  creditByImage.set(credit.image, credit);
}
assert.equal((creditPage.match(/<h1\b/g) || []).length, 1, 'image credits page must have one main heading');
let creditedBanners = 0;
let ownedBanners = 0;
let checked = 0;
function inspect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) inspect(filename);
    else if (/\.(?:html|js|css|json|xml|md)$/i.test(entry.name)) {
      const text = fs.readFileSync(filename, 'utf8');
      assert.equal(/\bm\d{5,}-[A-Za-z0-9]{12,}\b/.test(text), false, 'monitor credentials found in generated assets');
      assert.equal(text.includes('cors.status.org.cn'), false, 'legacy third-party credential forwarding must not ship');
      assert.equal(/yourname\.(?:js|css)/.test(text), false, 'placeholder status assets must not ship');
      if (entry.name.endsWith('.html')) {
        const header = text.match(/<header\b[^>]*\bid="page-header"[^>]*>[\s\S]*?<\/header>/);
        if (header) {
          // Butterfly 4.13 quotes the url ('...'); 5.x writes it bare.
          const match = header[0].match(/background-image:\s*url\((['"]?)([^'")]+)\1\)/);
          const image = match && [match[0], match[2]];
          if (image) {
            if (ownedImages.has(image[1])) {
              assert.equal(header[0].includes('class="banner-credit"'), false, `owned image must not have a banner credit in ${filename}`);
              ownedBanners++;
            } else {
              const credit = creditByImage.get(image[1]);
              assert.ok(credit, `banner missing from image credits registry: ${image[1]} (${filename})`);
              assert.ok(header[0].includes(`href="/image-credits/#${credit.id}"`), `wrong banner credit in ${filename}`);
              creditedBanners++;
            }
          } else {
            assert.equal(header[0].includes('class="banner-credit"'), false, `credit without a banner in ${filename}`);
          }
          if (path.relative(root, filename) !== '404.html') {
            assert.ok(text.includes('class="footer-image-credits"'), `image credits footer link missing in ${filename}`);
          }
        }
      }
      checked++;
    }
  }
}
inspect(root);
console.log(`Build checks passed: ${index.length} articles, four page headings, ${partials.length} style partials, ${creditedBanners} credited banners, ${ownedBanners} unlabelled owned banners, legacy status cleanup, ${checked} text assets.`);
