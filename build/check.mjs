/* Post-build sanity checks — no server needed. */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
let errors = 0, warns = 0;
const err = (m) => { console.error('  ✗ ' + m); errors++; };
const warn = (m) => { console.warn('  ! ' + m); warns++; };

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}
const htmlFiles = walk(OUT).filter((f) => f.endsWith('.html'));
console.log(`Checking ${htmlFiles.length} HTML files in /public\n`);

const routeExists = (route) => {
  route = route.split('#')[0].split('?')[0];
  if (!route.startsWith('/')) return true; // external / anchor
  if (/\.[a-z0-9]+$/i.test(route)) return existsSync(join(OUT, route));
  const idx = join(OUT, route, 'index.html');
  return existsSync(idx);
};

for (const file of htmlFiles) {
  const rel = file.replace(OUT, '');
  const html = readFileSync(file, 'utf8');
  const tag = (name) => (html.match(new RegExp(`<${name}[ >]`, 'gi')) || []).length;

  if (!html.startsWith('<!DOCTYPE html>')) err(`${rel}: missing doctype`);
  if (tag('html') !== 1) err(`${rel}: <html> count ${tag('html')}`);
  if (tag('main') !== 1) err(`${rel}: <main> count ${tag('main')}`);
  if ((html.match(/<\/body>/g) || []).length !== 1) err(`${rel}: </body> count`);
  if ((html.match(/<h1[ >]/g) || []).length !== 1) warn(`${rel}: h1 count ${(html.match(/<h1[ >]/g) || []).length}`);
  if (html.includes('${')) err(`${rel}: leftover template literal \${`);
  // bare & in HTML text (ignore JSON-LD blocks where raw & is legal)
  const noLd = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const bare = noLd.match(/&(?!(?:amp|lt|gt|quot|apos|nbsp|mdash|ndash|middot|copy|reg|trade|hellip|rsquo|lsquo|ldquo|rdquo|times|#\d+|#x[0-9a-fA-F]+);)[^;\s]{0,10}/g);
  if (bare) err(`${rel}: ${bare.length} bare "&" in markup — e.g. ${JSON.stringify(bare.slice(0, 3))}`);
  if (/>\s*undefined\s*</.test(html) || html.includes('"undefined"')) err(`${rel}: literal "undefined"`);
  if (!/<title>[^<]+<\/title>/.test(html)) err(`${rel}: empty/missing <title>`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) err(`${rel}: weak meta description`);
  if (!/rel="canonical"/.test(html)) err(`${rel}: missing canonical`);

  // JSON-LD blocks must parse
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  ld.forEach((m, i) => {
    try { JSON.parse(m[1]); } catch (e) { err(`${rel}: JSON-LD #${i + 1} invalid — ${e.message}`); }
  });
  if (ld.length < 1) warn(`${rel}: no JSON-LD`);

  // internal links resolve
  const hrefs = [...html.matchAll(/href="(\/[^"#][^"]*)"/g)].map((m) => m[1]);
  new Set(hrefs).forEach((h) => { if (!routeExists(h)) err(`${rel}: dead internal link ${h}`); });

  // crude tag balance for structural elements
  for (const t of ['header', 'footer', 'section', 'nav', 'ul', 'ol', 'form']) {
    const open = (html.match(new RegExp(`<${t}[ >]`, 'g')) || []).length;
    const close = (html.match(new RegExp(`</${t}>`, 'g')) || []).length;
    if (open !== close) err(`${rel}: <${t}> ${open} open / ${close} close`);
  }
}

// shared assets present + non-trivial
for (const a of ['assets/css/styles.css', 'assets/js/main.js', 'sitemap.xml', 'robots.txt', 'site.webmanifest', '404.html', 'assets/img/favicon.svg', 'assets/img/og.svg', 'assets/img/logo/horizontal.svg']) {
  const p = join(OUT, a);
  if (!existsSync(p)) err(`missing asset ${a}`);
  else if (statSync(p).size < 40) err(`asset too small ${a}`);
}
try { JSON.parse(readFileSync(join(OUT, 'site.webmanifest'), 'utf8')); } catch { err('site.webmanifest invalid JSON'); }

console.log(`\n${errors ? '✗' : '✓'} ${errors} error(s), ${warns} warning(s)`);
process.exit(errors ? 1 : 0);
