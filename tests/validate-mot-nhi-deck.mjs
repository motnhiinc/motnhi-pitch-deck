import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const deckPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(here, '..', 'mot-nhi-pitch-deck.html');
const deckDirectory = path.dirname(deckPath);
const html = await readFile(deckPath, 'utf8');
const productionOrigin = 'https://pitching.motnhi.vn';
const canonicalUrl = `${productionOrigin}/`;
const socialImageUrl = `${productionOrigin}/assets/mot-nhi-og.png`;
const pageTitle = 'Mọt Nhí | Pre-Launch Pitch Deck for AR Reading App';
const pageDescription = 'Explore the Mọt Nhí pre-launch pitch deck for an AR reading app that adds Vietnamese read-aloud and playful characters to paper books for ages 3–8.';
const socialDescription = 'A pre-launch investor deck for Mọt Nhí, the AR reading app that turns paper books into shared Vietnamese storytime for ages 3–8.';

const localAssetReferences = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((reference) => !reference.startsWith('#'))
  .filter((reference) => !/^[a-z][a-z\d+.-]*:/i.test(reference))
  .map((reference) => reference.split(/[?#]/, 1)[0])
  .filter(Boolean);

for (const reference of new Set(localAssetReferences)) {
  const assetPath = path.resolve(deckDirectory, reference);
  const relativePath = path.relative(deckDirectory, assetPath);
  assert.ok(
    relativePath && !relativePath.startsWith(`..${path.sep}`) && relativePath !== '..' && !path.isAbsolute(relativePath),
    `local asset must stay inside the deck directory: ${reference}`,
  );

  let bytes;
  try {
    bytes = await readFile(assetPath);
  } catch {
    assert.fail(`missing local asset: ${reference}`);
  }

  if (reference.toLowerCase().endsWith('.png')) {
    assert.deepEqual(
      [...bytes.subarray(0, 8)],
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      `local PNG asset has an invalid signature: ${reference}`,
    );
  }

  if (/\.jpe?g$/i.test(reference)) {
    assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff], `local JPEG asset has an invalid signature: ${reference}`);
  }
}

const slides = html.match(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"/g) ?? [];
assert.equal(slides.length, 10, 'deck must contain exactly 10 slides');
assert.deepEqual(
  [...html.matchAll(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*data-slide="(\d+)"/g)].map((match) => Number(match[1])),
  Array.from({ length: 10 }, (_, index) => index + 1),
  'data-slide values must be consecutive',
);
assert.deepEqual(
  [...html.matchAll(/<strong>(\d{2}) \/ 10<\/strong>/g)].map((match) => Number(match[1])),
  Array.from({ length: 10 }, (_, index) => index + 1),
  'visible slide counters must be consecutive and use the 10-slide total',
);

const visibleText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
for (const phrase of [
  'Mọt Nhí',
  'Chạm vào trang sách, bước vào câu chuyện.',
  'trẻ 3–8 tuổi',
  'completed first story',
  '20 parent testers',
  'two pilot partners',
]) {
  assert.ok(visibleText.includes(phrase), `missing canonical fact: ${phrase}`);
}

assert.ok(!/Mermail/i.test(html), 'deck must not contain legacy Mermail content');
assert.ok(html.includes('Pre-launch pitch deck'), 'cover must frame the asset as a pre-launch pitch deck');
assert.ok(!/Partner &amp; investor deck/i.test(html), 'cover must not use ambiguous partner/investor framing');
for (const section of ['Problem', 'Solution', 'Product demo', 'Differentiation', 'Market wedge', 'Business model', 'Go-to-market', 'Builder', 'Pilot ask']) {
  assert.ok(html.includes(`>${section}<`), `missing investor-facing section label: ${section}`);
}
assert.ok(!html.includes('aria-label="Success metrics slide"'), 'removed validation-plan slide must stay absent');
assert.ok(!html.includes('aria-label="Roadmap slide"'), 'removed milestones slide must stay absent');
assert.ok(html.includes('>Slide 1 of 10<'), 'screen-reader fallback must use the 10-slide total');
assert.equal((html.match(/src="assets\/logo-light\.png"/g) ?? []).length, 10, 'every slide must use logo-light.png');
assert.ok(!html.includes('<use href="#mot-mark"'), 'legacy inline logo mark must not be used');
assert.ok(html.includes('src="assets/toan.jpg"'), 'builder slide must use the supplied portrait');
assert.ok(html.includes('src="assets/toan-linkedin-qr.png"'), 'builder slide must include the generated QR code');
assert.ok(html.includes('href="https://www.linkedin.com/in/toannhu"'), 'builder QR and CTA must point to the verified public profile');
assert.match(html, /aria-label="Previous slide"/);
assert.match(html, /aria-label="Next slide"/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /prefers-reduced-motion/);
assert.match(html, /@media print/);
assert.match(html, /ArrowRight/);
assert.match(html, /ArrowLeft/);

for (const metadata of [
  `<title>${pageTitle}</title>`,
  `<meta name="description" content="${pageDescription}" />`,
  `<link rel="canonical" href="${canonicalUrl}" />`,
  '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
  '<meta property="og:type" content="website" />',
  '<meta property="og:site_name" content="Mọt Nhí" />',
  `<meta property="og:title" content="${pageTitle}" />`,
  `<meta property="og:description" content="${socialDescription}" />`,
  `<meta property="og:url" content="${canonicalUrl}" />`,
  `<meta property="og:image" content="${socialImageUrl}" />`,
  '<meta property="og:image:width" content="1200" />',
  '<meta property="og:image:height" content="630" />',
  '<meta property="og:image:alt"',
  '<meta name="twitter:card" content="summary_large_image" />',
  `<meta name="twitter:title" content="${pageTitle}" />`,
  `<meta name="twitter:description" content="${socialDescription}" />`,
  `<meta name="twitter:image" content="${socialImageUrl}" />`,
  '<meta name="twitter:image:alt"',
  '<script type="application/ld+json">',
]) {
  assert.ok(html.includes(metadata), `missing SEO metadata: ${metadata}`);
}

const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(jsonLdMatch, 'deck must include JSON-LD structured data');
const structuredData = JSON.parse(jsonLdMatch[1]);
assert.equal(structuredData['@context'], 'https://schema.org');
assert.ok(Array.isArray(structuredData['@graph']), 'JSON-LD must use an @graph');
for (const type of ['WebSite', 'WebPage', 'SoftwareApplication']) {
  assert.ok(structuredData['@graph'].some((node) => node['@type'] === type), `JSON-LD must include ${type}`);
}
const webPageNode = structuredData['@graph'].find((node) => node['@type'] === 'WebPage');
assert.equal(webPageNode?.name, pageTitle, 'JSON-LD WebPage name must match the page title');
assert.equal(webPageNode?.description, pageDescription, 'JSON-LD WebPage description must match the meta description');
assert.equal(webPageNode?.dateModified, '2026-08-29', 'JSON-LD WebPage should expose the current deck modification date');

const socialImage = await readFile(path.resolve(deckDirectory, 'assets/mot-nhi-og.png'));
assert.deepEqual(
  [...socialImage.subarray(0, 8)],
  [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'Open Graph image must be a valid PNG',
);
assert.equal(socialImage.readUInt32BE(16), 1200, 'Open Graph image must be 1200 px wide');
assert.equal(socialImage.readUInt32BE(20), 630, 'Open Graph image must be 630 px tall');

const robots = await readFile(path.resolve(deckDirectory, 'robots.txt'), 'utf8');
assert.match(robots, /^User-agent: \*$/m);
assert.match(robots, /^Allow: \/$/m);
for (const bot of ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'Bingbot']) {
  assert.match(robots, new RegExp(`^User-agent: ${bot}$`, 'm'), `robots.txt must mention ${bot}`);
}
assert.match(robots, new RegExp(`^Sitemap: ${productionOrigin.replaceAll('.', '\\.')}/sitemap\\.xml$`, 'm'));

const sitemap = await readFile(path.resolve(deckDirectory, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
assert.ok(sitemap.includes(`<loc>${canonicalUrl}</loc>`), 'sitemap must include the canonical production URL');
assert.match(sitemap, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);

const externalLinks = [...html.matchAll(/<a\b[^>]*href="https:\/\/[^\"]+"[^>]*>/g)].map((match) => match[0]);
assert.ok(externalLinks.length >= 2, 'deck must link to both source documents');
assert.ok(externalLinks.every((link) => /target="_blank"/.test(link)), 'external links must open in a new tab');
assert.ok(externalLinks.every((link) => /rel="noopener noreferrer"/.test(link)), 'external links must use safe rel attributes');

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
assert.equal(scripts.length, 1, 'deck must contain one self-contained interaction script');
assert.doesNotThrow(() => new Function(scripts[0]), 'interaction script must parse');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'element IDs must be unique');

console.log(`PASS: ${slides.length} slides validated in ${path.basename(deckPath)}`);
