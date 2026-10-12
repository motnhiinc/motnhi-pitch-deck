import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const deckPath = path.join(root, 'mot-nhi-pitch-deck.html');
const validatorPath = path.join(here, 'validate-mot-nhi-deck.mjs');
const workflowPath = path.join(root, '.github', 'workflows', 'deploy-mot-nhi-pitch-deck.yml');

const deckHtml = await readFile(deckPath, 'utf8');
const workflow = await readFile(workflowPath, 'utf8');

const requiredAssets = ['assets/logo-light.png', 'assets/toan.jpg', 'assets/toan-linkedin-qr.png', 'assets/demo.mp4', 'assets/demo-scan.jpg', 'assets/demo-ar.jpg'];
for (const missingAsset of requiredAssets) {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'mot-nhi-missing-assets-'));
  try {
    const fixtureDeck = path.join(fixtureRoot, 'mot-nhi-pitch-deck.html');
    await writeFile(fixtureDeck, deckHtml);
    await mkdir(path.join(fixtureRoot, 'assets'));
    for (const asset of requiredAssets.filter((candidate) => candidate !== missingAsset)) {
      await copyFile(path.join(root, asset), path.join(fixtureRoot, asset));
    }

    await assert.rejects(
      execFileAsync(process.execPath, [validatorPath, fixtureDeck]),
      (error) => {
        assert.match(`${error.stderr}\n${error.stdout}`, new RegExp(`missing local asset: ${missingAsset}`, 'i'));
        return true;
      },
      `validator must fail when ${missingAsset} is absent`,
    );
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}

const scripts = [...deckHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
assert.equal(scripts.length, 1, 'deck must expose one interaction script for navigation testing');

const slides = Array.from({ length: 9 }, (_, index) => ({
  active: index === 0,
  classList: { toggle: (_name, state) => { slides[index].active = state; } },
  getAttribute: () => `Slide ${index + 1}`,
}));
const progress = { style: {} };
const status = { textContent: '' };
const windowListeners = new Map();
const documentListeners = new Map();
const noopControl = { addEventListener: () => {} };
const context = {
  document: {
    querySelectorAll: () => slides,
    querySelector: (selector) => selector === '.progress-bar' ? progress : noopControl,
    getElementById: () => status,
    addEventListener: (name, callback) => documentListeners.set(name, callback),
  },
  history: { replaceState: () => {} },
  location: { hash: '#1' },
  window: { addEventListener: (name, callback) => windowListeners.set(name, callback) },
};
vm.runInNewContext(scripts[0], context);
context.location.hash = '#-99';
assert.doesNotThrow(() => windowListeners.get('hashchange')(), 'malformed hashes must not crash navigation');
assert.equal(slides.filter((slide) => slide.active).length, 1, 'navigation must leave exactly one active slide');

const keydown = documentListeners.get('keydown');
const buttonTarget = { closest: (selector) => selector === 'button, a' ? {} : null };
keydown({ key: 'ArrowRight', target: buttonTarget, preventDefault: () => {} });
assert.ok(slides[1].active, 'arrow navigation must work after a navigation button receives focus');
keydown({ key: ' ', target: buttonTarget, preventDefault: () => assert.fail('native button activation must not be prevented') });
assert.ok(slides[1].active, 'space on a button must be left to native activation');
keydown({ key: 'End', target: buttonTarget, preventDefault: () => {} });
assert.ok(slides[8].active, 'End must select the final slide');

const mobileStart = deckHtml.indexOf('@media (max-width: 640px)');
const mobileEnd = deckHtml.indexOf('@media (prefers-reduced-motion', mobileStart);
const mobileCss = mobileStart >= 0 && mobileEnd > mobileStart ? deckHtml.slice(mobileStart, mobileEnd) : '';
assert.ok(mobileCss.includes('.columns'), 'mobile layout must stack columns');
assert.ok(deckHtml.includes('assets/demo.mp4'), 'deck must include the supplied demo');

for (const filename of ['README.md', 'AGENTS.md', 'CLAUDE.md']) {
  const contents = await readFile(path.join(root, filename), 'utf8');
  assert.match(contents, /Mọt Nhí/);
  assert.match(contents, /mot-nhi-pitch-deck\.html/);
  assert.doesNotMatch(contents, /mermail-pitch-deck\.html/i);
}

assert.match(workflow, /\bpull_request:/, 'workflow must validate pull requests');
assert.match(workflow, /if:\s*github\.event_name != 'pull_request'/, 'deployment path must skip pull requests');
assert.match(workflow, /-\s+docs\/\*\*/, 'workflow must validate source-of-truth document changes');
assert.match(workflow, /-\s+robots\.txt/, 'workflow must run when robots.txt changes');
assert.match(workflow, /-\s+sitemap\.xml/, 'workflow must run when sitemap.xml changes');
assert.match(workflow, /cp robots\.txt sitemap\.xml site\//, 'deployment artifact must include crawler discovery files');
assert.match(workflow, /actions\/setup-node@/, 'workflow must install a deterministic Node runtime for validators');
assert.doesNotMatch(workflow, /touch site\/\.nojekyll/, 'workflow must not create an artifact that upload-pages excludes');
const actionReferences = [...workflow.matchAll(/uses:\s*(actions\/[\w-]+)@([^\s#]+)/g)];
assert.ok(actionReferences.length >= 4, 'workflow must declare the expected official actions');
for (const [, action, reference] of actionReferences) {
  assert.match(reference, /^[a-f\d]{40}$/, `${action} must be pinned to an immutable commit SHA`);
}

console.log('PASS: regression checks validated');
