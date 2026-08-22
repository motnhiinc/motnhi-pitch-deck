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
assert.equal(slides.length, 12, 'deck must contain exactly 12 slides');

for (const phrase of [
  'Mọt Nhí',
  'Chạm vào trang sách, bước vào câu chuyện.',
  'trẻ 3–8 tuổi',
  'completed first story',
  '20 parent testers',
  'two pilot partners',
]) {
  assert.ok(html.includes(phrase), `missing canonical fact: ${phrase}`);
}

assert.ok(!/Mermail/i.test(html), 'deck must not contain legacy Mermail content');
assert.ok(html.includes('Pre-launch pitch deck'), 'cover must frame the asset as a pre-launch pitch deck');
assert.ok(!/Partner &amp; investor deck/i.test(html), 'cover must not use ambiguous partner/investor framing');
for (const section of ['Problem', 'Solution', 'Product demo', 'Differentiation', 'Market wedge', 'Business model', 'Go-to-market', 'Validation plan', 'Milestones', 'Builder', 'Pilot ask']) {
  assert.ok(html.includes(`>${section}<`), `missing investor-facing section label: ${section}`);
}
assert.equal((html.match(/src="assets\/logo-light\.png"/g) ?? []).length, 12, 'every slide must use logo-light.png');
assert.ok(!html.includes('<use href="#mot-mark"'), 'legacy inline logo mark must not be used');
assert.ok(html.includes('src="assets/toan.jpg"'), 'builder slide must use the supplied portrait');
assert.ok(html.includes('src="assets/toan-linkedin-qr.png"'), 'builder slide must include the generated QR code');
assert.ok(html.includes('href="https://www.linkedin.com/in/toannhu"'), 'builder QR and CTA must point to the verified public profile');
const visibleText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
assert.ok(/60% TARGET/i.test(visibleText), 'activation metric must be labeled as a target');
assert.ok(/30% TARGET/i.test(visibleText), 'retention metric must be labeled as a target');
assert.ok(/10% TARGET/i.test(visibleText), 'conversion metric must be labeled as a target');

assert.match(html, /aria-label="Previous slide"/);
assert.match(html, /aria-label="Next slide"/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /prefers-reduced-motion/);
assert.match(html, /@media print/);
assert.match(html, /ArrowRight/);
assert.match(html, /ArrowLeft/);

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
