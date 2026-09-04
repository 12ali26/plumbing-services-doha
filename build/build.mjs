#!/usr/bin/env node
/**
 * Static site generator for the Plumbing Electric Maintenance Service website.
 * No dependencies — Node stdlib only. Run:  node build/build.mjs
 *
 * Output: /public  (deploy this folder to any static host)
 * All editable business facts live in /site.config.json
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPages } from './content.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'public');

const c = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8'));
const SITE_URL = c.site.url.replace(/\/$/, '');
const BUILD_TIME = new Date().toISOString();

// Prefer a real raster OG image if the owner has added one; SVG is the fallback.
const OG_IMAGE = existsSync(join(SRC, 'assets/img/og.png'))
  ? `${SITE_URL}/assets/img/og.png`
  : `${SITE_URL}/assets/img/og.svg`;

/* ------------------------------------------------------------------ helpers */
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// escape a bare "&" for HTML text without double-escaping existing entities
const amp = (s = '') => String(s).replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
// decode the few entities we hand-write in copy, for use inside JSON-LD values
const deent = (s = '') => String(s).replace(/&amp;/g, '&').replace(/&(?:#39|apos);/g, "'").replace(/&quot;/g, '"');

const telHref = (p) => `tel:${p.replace(/[^+\d]/g, '')}`;
const waHref = (msg) =>
  `https://wa.me/${c.contact.whatsapp}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
const mailHref = () => `mailto:${c.contact.email}`;
const pageUrl = (slug) => (slug === 'index' ? `${SITE_URL}/` : `${SITE_URL}/${slug}/`);
const pagePath = (slug) => (slug === 'index' ? '/' : `/${slug}/`);

const WA_DEFAULT_MSG =
  'Hello, I need plumbing/electrical maintenance in Doha. My issue is: [describe issue]. My area is: [area]. It is: [urgent / not urgent]. I can share photos if needed.';

/* ------------------------------------------------------------------- icons  */
const ICONS = {
  wrench: '<path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4l-2.6 2.6-2-2 2.6-2.6z"/>',
  zap: '<path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z"/>',
  droplet: '<path d="M12 2.7 6.3 9a8 8 0 1 0 11.4 0L12 2.7z"/>',
  flame: '<path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 1.5 2S12 3 12 3z"/><path d="M9.5 15.5a2.5 2.5 0 0 0 5 0c0-1.5-1.2-2.4-1.2-2.4s.1 1.1-.9 1.1-1.2-2.2-1.2-2.2-1.5 1.6-1.5 3.5z"/>',
  gauge: '<path d="M12 13.5 16 8"/><circle cx="12" cy="14" r="8"/><path d="M12 6V4M4.5 14h-2M21.5 14h-2"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
  phone: '<path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L17 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 3-2z"/>',
  chat: '<path d="M4 5h16v11H8l-4 4V5z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  pin: '<path d="M12 22s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  tools: '<path d="M14.5 5.5a3.5 3.5 0 0 0-4.9 4.2L4 15.3V20h4.7l5.6-5.6a3.5 3.5 0 0 0 4.2-4.9l-2.5 2.5-2-2 2.5-2.5z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  drops: '<path d="M7 14a4 4 0 1 0 8 0c0-2.5-4-6-4-6s-4 3.5-4 6z"/><path d="M15.5 6.5a2.5 2.5 0 1 0 3.5 3.5"/>',
  facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1"/>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="m11 9 4 3-4 3V9z"/>',
};
const icon = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* -------------------------------------------------------------- components  */
const SERVICES = [
  ['plumbing-services', 'Plumbing Repairs', 'wrench', 'Leak detection, pipe repairs, blocked drains, bathroom and kitchen plumbing, and general plumbing maintenance.'],
  ['electrical-services', 'Electrical Repairs', 'zap', 'Wiring, switches, sockets, distribution boards, fault finding, and preventive electrical maintenance.'],
  ['water-pumps-tanks', 'Water Pumps & Tanks', 'gauge', 'Booster pumps, pump controllers, pressure problems, tank connections, servicing, installation and repair.'],
  ['water-heater-services', 'Water Heaters', 'flame', 'Electric water-heater faults, no-hot-water diagnosis, pressure-relief valves, replacement and maintenance.'],
  ['emergency-maintenance', 'Emergency Maintenance', 'clock', 'Rapid assistance for urgent plumbing, electrical and essential building-system problems, subject to availability.'],
  ['commercial-maintenance', 'Commercial Maintenance', 'building', 'Planned maintenance and repairs for offices, shops, villas, apartment buildings and small commercial sites.'],
];

const btn = (label, href, kind = 'primary', attrs = '') =>
  `<a class="btn btn--${kind}" href="${href}" ${attrs}>${label}</a>`;

const callBtn = (kind = 'primary', label = 'Call now') =>
  btn(`${icon('phone')}<span>${label}</span>`, telHref(c.contact.phonePrimary), kind,
    'data-analytics="call_click" data-analytics-location="cta"');

const waBtn = (kind = 'whatsapp', label = 'WhatsApp us', msg = WA_DEFAULT_MSG) =>
  btn(`${icon('chat')}<span>${label}</span>`, waHref(msg), kind,
    'data-analytics="whatsapp_click" data-analytics-location="cta" target="_blank" rel="noopener"');

const quoteBtn = (kind = 'ghost', label = 'Request a callback') =>
  btn(`<span>${label}</span>${icon('arrow')}`, `${pagePath('contact')}#request`, kind,
    'data-analytics="quote_click"');

const heading = (eyebrow, title, sub = '') => `
  <div class="head">
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
    <h2>${title}</h2>
    ${sub ? `<p class="head__sub">${sub}</p>` : ''}
  </div>`;

const serviceCards = (items = SERVICES) => `
  <ul class="cards" role="list">
    ${items.map(([slug, title, ic, text]) => `
      <li class="card">
        <span class="card__icon">${icon(ic)}</span>
        <h3 class="card__title"><a href="${pagePath(slug)}">${amp(title)}</a></h3>
        <p class="card__text">${text}</p>
        <a class="card__link" href="${pagePath(slug)}">Learn more ${icon('arrow')}</a>
      </li>`).join('')}
  </ul>`;

const steps = (items) => `
  <ol class="steps" role="list">
    ${items.map(([t, d], i) => `
      <li class="step">
        <span class="step__n">${i + 1}</span>
        <div><h3>${t}</h3><p>${d}</p></div>
      </li>`).join('')}
  </ol>`;

const faqList = (items, withSchema = true) => {
  const html = `
  <div class="faq" data-faq>
    ${items.map(({ q, a }) => `
      <details class="faq__item">
        <summary>${q}${icon('chevron', 'faq__chev')}</summary>
        <div class="faq__a">${a}</div>
      </details>`).join('')}
  </div>`;
  const schema = withSchema
    ? `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(({ q, a }) => ({
          '@type': 'Question',
          name: deent(stripTags(q)),
          acceptedAnswer: { '@type': 'Answer', text: deent(stripTags(a)) },
        })),
      })}</script>`
    : '';
  return html + schema;
};
const stripTags = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const ctaBand = (title = 'Need a plumber or electrician in Doha?', text = 'Tell us what is wrong and we will help you choose the next step.') => `
  <section class="band">
    <div class="wrap band__inner">
      <div>
        <h2>${title}</h2>
        <p>${text}</p>
      </div>
      <div class="band__actions">
        ${callBtn('primary', `Call ${c.contact.phonePrimaryDisplay}`)}
        ${waBtn('whatsapp', 'WhatsApp now')}
        ${quoteBtn('ghost-light', 'Request a callback')}
      </div>
    </div>
  </section>`;

const emergencyBanner = () => `
  <div class="emerg" role="note">
    ${icon('clock')}
    <p><strong>Need urgent help?</strong> ${c.contact.hours247 ? `${esc(c.contact.hoursDisplay)} across ${esc(c.contact.addressLocality)}.` : 'Emergency requests are handled as quickly as possible during operating hours.'}</p>
    <div class="emerg__actions">
      <a class="btn btn--primary btn--sm" href="${telHref(c.contact.phonePrimary)}" data-analytics="call_click" data-analytics-location="emergency_banner">${icon('phone')}<span>Call now</span></a>
      <a class="btn btn--whatsapp btn--sm" href="${waHref(WA_DEFAULT_MSG)}" target="_blank" rel="noopener" data-analytics="whatsapp_click" data-analytics-location="emergency_banner">${icon('chat')}<span>WhatsApp</span></a>
    </div>
  </div>`;

const breadcrumbs = (trail) => {
  const items = [['Home', '/'], ...trail];
  const html = `
  <nav class="crumbs" aria-label="Breadcrumb">
    <ol role="list">
      ${items.map(([label, href], i) =>
        i === items.length - 1
          ? `<li aria-current="page">${amp(label)}</li>`
          : `<li><a href="${href}">${amp(label)}</a>${icon('chevron', 'crumbs__sep')}</li>`
      ).join('')}
    </ol>
  </nav>`;
  const schema = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, href], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: deent(name),
      item: SITE_URL + href,
    })),
  })}</script>`;
  return html + schema;
};

const reviewsPlaceholder = () => {
  if (c.flags.showReviews) return '';
  return `
  <section class="section section--tint">
    <div class="wrap">
      ${heading('Reviews', 'Have we helped you?', 'Share your experience with our team. Verified customer reviews will appear here once collected.')}
      <div class="reviews-cta">
        ${btn('Leave a review', c.social.facebook || '#', 'outline', 'target="_blank" rel="noopener"')}
      </div>
      <p class="fineprint">This site does not display invented testimonials, star ratings or customer counts. Reviews are published only with the customer's permission.</p>
    </div>
  </section>`;
};

const gallery = () => {
  const shots = [
    ['Technician connecting a water-pressure booster pump in Doha.', 'gauge'],
    ['Electric water-heater inspection and pressure-relief valve check.', 'flame'],
    ['Water tank connection and supply-line servicing.', 'droplet'],
    ['Distribution-board maintenance and fault finding.', 'zap'],
    ['Under-sink leak repair in a Doha apartment kitchen.', 'wrench'],
    ['Reverse-osmosis water purification system service.', 'drops'],
  ];
  return `
  <ul class="gallery" role="list">
    ${shots.map(([alt, ic]) => `
      <li class="gallery__item">
        <div class="gallery__ph" role="img" aria-label="${esc(alt)}">${icon(ic)}</div>
        <p class="gallery__cap">${esc(alt)}</p>
      </li>`).join('')}
  </ul>
  <p class="fineprint">Placeholder captions with descriptive alt text. Replace with owner-approved photographs of real completed work before launch.</p>`;
};

const contactForm = () => `
  <form class="form" id="request" data-form novalidate
        action="${esc(c.forms.provider === 'web3forms' && !c.forms.accessKey ? '' : (c.forms.endpoint || ''))}" method="POST">
    <p class="form__intro">Prefer to describe the issue and get a callback? Send the details below.</p>
    ${c.forms.provider === 'web3forms' ? `<input type="hidden" name="access_key" value="${esc(c.forms.accessKey || '')}">` : ''}
    <input type="hidden" name="subject" value="New website enquiry — ${esc(c.business.name)}">
    <input type="hidden" name="from_name" value="${esc(c.business.name)} website">
    <input type="text" name="botcheck" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">

    <div class="form__row">
      <label class="field">
        <span>Name <em>*</em></span>
        <input type="text" name="name" required autocomplete="name">
      </label>
      <label class="field">
        <span>Phone <em>*</em></span>
        <input type="tel" name="phone" required autocomplete="tel" inputmode="tel" placeholder="+974 ...">
      </label>
    </div>

    <div class="form__row">
      <label class="field">
        <span>Email <span class="muted">(optional)</span></span>
        <input type="email" name="email" autocomplete="email">
      </label>
      <label class="field">
        <span>Area / neighbourhood in Doha <em>*</em></span>
        <input type="text" name="area" required placeholder="e.g. Al Sadd, Al Wakrah, The Pearl">
      </label>
    </div>

    <div class="form__row">
      <label class="field">
        <span>Service needed <em>*</em></span>
        <select name="service" required>
          <option value="">Select a service…</option>
          <option>Plumbing repair</option>
          <option>Electrical repair</option>
          <option>Water pump / tank</option>
          <option>Water heater</option>
          <option>Emergency call-out</option>
          <option>Commercial / planned maintenance</option>
          <option>New installation</option>
          <option>Something else</option>
        </select>
      </label>
      <label class="field">
        <span>How urgent is it? <em>*</em></span>
        <select name="urgency" required>
          <option value="">Select urgency…</option>
          <option>Emergency — need help now</option>
          <option>Today if possible</option>
          <option>Within a few days</option>
          <option>Just getting a quote</option>
        </select>
      </label>
    </div>

    <fieldset class="field field--inline">
      <legend>Preferred contact method</legend>
      <label><input type="radio" name="preferred_contact" value="Phone call" checked> Phone call</label>
      <label><input type="radio" name="preferred_contact" value="WhatsApp"> WhatsApp</label>
      <label><input type="radio" name="preferred_contact" value="Email"> Email</label>
    </fieldset>

    <label class="field">
      <span>Describe the problem <em>*</em></span>
      <textarea name="message" rows="4" required placeholder="What is happening, since when, and anything you have already tried."></textarea>
    </label>

    <label class="field">
      <span>Photo <span class="muted">(optional — helps with leaks, panels, pumps, heaters)</span></span>
      <input type="file" name="attachment" accept="image/*">
    </label>

    <label class="check">
      <input type="checkbox" name="consent" required>
      <span>I agree that my details may be used to respond to this enquiry, as described in the <a href="${pagePath('privacy-policy')}">Privacy Policy</a>. <em>*</em></span>
    </label>

    <div class="form__actions">
      <button type="submit" class="btn btn--primary btn--lg" data-analytics="form_submit">Send request</button>
      <a class="btn btn--whatsapp btn--lg" data-wa-fallback href="${waHref(WA_DEFAULT_MSG)}" target="_blank" rel="noopener" data-analytics="whatsapp_click" data-analytics-location="form">${icon('chat')}<span>Send on WhatsApp instead</span></a>
    </div>
    <p class="form__status" data-form-status role="status" aria-live="polite" hidden></p>
    <p class="fineprint">Protected against spam. We do not collect payment details through this form.</p>
  </form>`;

/* --------------------------------------------------------------- structured data */
const localBusinessSchema = () => {
  const s = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness', 'Plumber', 'Electrician'],
    '@id': `${SITE_URL}/#business`,
    name: c.business.name,
    description: c.business.descriptionShort,
    url: `${SITE_URL}/`,
    telephone: c.contact.phonePrimary,
    email: c.contact.email,
    image: `${OG_IMAGE}`,
    logo: `${SITE_URL}/assets/img/logo/primary.svg`,
    priceRange: c.business.priceRange,
    areaServed: { '@type': 'City', name: 'Doha' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: c.contact.addressLocality,
      addressRegion: c.contact.addressRegion,
      addressCountry: c.contact.addressCountry,
      ...(c.flags.publishStreetAddress && c.contact.streetAddress
        ? { streetAddress: c.contact.streetAddress }
        : {}),
    },
    sameAs: [c.social.facebook, c.social.instagram, c.social.youtube].filter(Boolean),
  };
  if (c.contact.hours247) {
    s.openingHoursSpecification = [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00', closes: '23:59',
    }];
  }
  return `<script type="application/ld+json">${JSON.stringify(s)}</script>`;
};

const serviceSchema = ({ name, description, slug }) =>
  `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: deent(stripTags(name)),
    name: deent(stripTags(name)),
    description: deent(stripTags(description)),
    provider: { '@type': 'LocalBusiness', name: c.business.name, '@id': `${SITE_URL}/#business` },
    areaServed: { '@type': 'City', name: 'Doha' },
    url: pageUrl(slug),
  })}</script>`;

/* --------------------------------------------------------------------- layout */
const NAV = [
  ['Home', '/'],
  ['Services', pagePath('services'), SERVICES.map(([s, t]) => [t, pagePath(s)])],
  ['About', pagePath('about')],
  ['Projects', pagePath('projects')],
  ['Service Areas', pagePath('service-areas')],
  ['FAQs', pagePath('faqs')],
  ['Contact', pagePath('contact')],
];

const header = (slug) => `
  <a class="skip" href="#main">Skip to content</a>
  <div class="topbar">
    <div class="wrap topbar__inner">
      <span class="topbar__area">${icon('pin')} Serving ${esc(c.business.areaServed)}</span>
      <span class="topbar__contact">
        <a href="${telHref(c.contact.phonePrimary)}" data-analytics="call_click" data-analytics-location="topbar">${icon('phone')} ${esc(c.contact.phonePrimaryDisplay)}</a>
        <a href="${waHref(WA_DEFAULT_MSG)}" target="_blank" rel="noopener" data-analytics="whatsapp_click" data-analytics-location="topbar">${icon('chat')} WhatsApp</a>
      </span>
    </div>
  </div>
  <header class="site-header" data-header>
    <div class="wrap site-header__inner">
      <a class="brand" href="/" aria-label="${esc(c.business.name)} — home">
        <img src="/assets/img/logo/horizontal.svg" alt="" width="220" height="68" class="brand__logo">
        <span class="brand__fallback">${esc(c.business.shortName)}</span>
      </a>
      <button class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="primary-nav">
        ${icon('menu', 'nav-toggle__open')}${icon('x', 'nav-toggle__close')}
        <span class="sr-only">Menu</span>
      </button>
      <nav class="primary-nav" id="primary-nav" data-nav aria-label="Primary">
        <ul role="list">
          ${NAV.map(([label, href, children]) => {
            const active = href === pagePath(slug) ? ' aria-current="page"' : '';
            if (children) {
              return `
              <li class="has-sub" data-sub>
                <a href="${href}"${active}>${label}<button class="sub-toggle" data-sub-toggle aria-expanded="false"><span class="sr-only">Open submenu</span>${icon('chevron')}</button></a>
                <ul class="sub" role="list">
                  <li><a href="${href}">All services</a></li>
                  ${children.map(([ct, ch]) => `<li><a href="${ch}"${ch === pagePath(slug) ? ' aria-current="page"' : ''}>${amp(ct)}</a></li>`).join('')}
                </ul>
              </li>`;
            }
            return `<li><a href="${href}"${active}>${label}</a></li>`;
          }).join('')}
        </ul>
        <div class="primary-nav__cta">
          ${callBtn('primary', 'Call now')}
          ${waBtn('whatsapp', 'WhatsApp')}
        </div>
      </nav>
    </div>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="wrap site-footer__grid">
      <div class="site-footer__brand">
        <img src="/assets/img/logo/reversed-ink.svg" alt="${esc(c.business.name)}" width="200" height="122">
        <p>${esc(c.business.descriptionShort)}</p>
        <p class="site-footer__ar" dir="rtl" lang="ar">${esc(c.business.nameArabic)}</p>
      </div>
      <div>
        <h2>Contact</h2>
        <ul role="list" class="site-footer__list">
          <li>${icon('phone')} <a href="${telHref(c.contact.phonePrimary)}" data-analytics="call_click" data-analytics-location="footer">${esc(c.contact.phonePrimaryDisplay)}</a></li>
          ${c.contact.showSecondaryPhone && c.contact.phoneSecondaryDisplay ? `<li>${icon('phone')} <a href="${telHref(c.contact.phoneSecondary)}">${esc(c.contact.phoneSecondaryDisplay)}</a> <span class="muted">(alt. line)</span></li>` : ''}
          <li>${icon('chat')} <a href="${waHref(WA_DEFAULT_MSG)}" target="_blank" rel="noopener" data-analytics="whatsapp_click" data-analytics-location="footer">WhatsApp us</a></li>
          <li>${icon('mail')} <a href="${mailHref()}">${esc(c.contact.email)}</a></li>
          <li>${icon('pin')} ${esc(c.business.areaServed)}${c.flags.publishStreetAddress && c.contact.streetAddress ? ` — ${esc(c.contact.streetAddress)}` : ''}</li>
          <li>${icon('clock')} ${c.contact.hours247 ? esc(c.contact.hoursDisplay) : 'Contact us for current hours'}</li>
        </ul>
        <div class="site-footer__social">
          ${c.social.facebook ? `<a href="${c.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon('facebook')}</a>` : ''}
          ${c.social.instagram ? `<a href="${c.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram')}</a>` : ''}
          ${c.social.youtube ? `<a href="${c.social.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${icon('youtube')}</a>` : ''}
        </div>
      </div>
      <div>
        <h2>Services</h2>
        <ul role="list" class="site-footer__list">
          ${SERVICES.map(([s, t]) => `<li><a href="${pagePath(s)}">${amp(t)}</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <h2>Company</h2>
        <ul role="list" class="site-footer__list">
          <li><a href="${pagePath('about')}">About</a></li>
          <li><a href="${pagePath('projects')}">Projects</a></li>
          <li><a href="${pagePath('service-areas')}">Service areas</a></li>
          <li><a href="${pagePath('faqs')}">FAQs</a></li>
          <li><a href="${pagePath('contact')}">Contact</a></li>
          <li><a href="${pagePath('privacy-policy')}">Privacy policy</a></li>
          <li><a href="${pagePath('terms')}">Terms</a></li>
          <li><a href="${pagePath('cookie-policy')}">Cookie policy</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap site-footer__bottom">
      <p>&copy; ${new Date().getFullYear()} ${esc(c.business.name)}. All rights reserved.</p>
      ${c.flags.showPendingVerificationNotice ? `<p class="site-footer__note">Some business details on this site are pending final confirmation by the owner. Please call or WhatsApp to confirm before visiting.</p>` : ''}
    </div>
  </footer>
  <div class="mobile-bar" data-mobile-bar>
    <a href="${telHref(c.contact.phonePrimary)}" data-analytics="call_click" data-analytics-location="mobile_bar">${icon('phone')}<span>Call</span></a>
    <a href="${waHref(WA_DEFAULT_MSG)}" target="_blank" rel="noopener" data-analytics="whatsapp_click" data-analytics-location="mobile_bar">${icon('chat')}<span>WhatsApp</span></a>
    <a href="${pagePath('contact')}#request" data-analytics="quote_click" data-analytics-location="mobile_bar">${icon('tools')}<span>Quote</span></a>
  </div>`;

const gaSnippet = () =>
  c.site.gaMeasurementId
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${c.site.gaMeasurementId}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${c.site.gaMeasurementId}');</script>`
    : '';

function layout(page) {
  const { slug, title, description, main, jsonld = [], ogType = 'website', noindex = false } = page;
  const url = pageUrl(slug);
  const fullTitle = slug === 'index' ? title : `${title}`;
  return `<!DOCTYPE html>
<html lang="${c.site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#7A1230">
<meta name="geo.region" content="QA">
<meta name="geo.placename" content="Doha">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(c.business.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${c.site.locale}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/logo/avatar-square.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&amp;family=Noto+Kufi+Arabic:wght@400;700&amp;display=swap">
<link rel="stylesheet" href="/assets/css/styles.css">
${localBusinessSchema()}
${jsonld.join('\n')}
${gaSnippet()}
</head>
<body class="page--${slug}">
${header(slug)}
<main id="main">
${main}
</main>
${footer()}
<script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

/* ------------------------------------------------------------------- render  */
const x = {
  c, icon, esc, btn, callBtn, waBtn, quoteBtn, heading, serviceCards, SERVICES,
  steps, faqList, ctaBand, emergencyBanner, breadcrumbs, reviewsPlaceholder,
  gallery, contactForm, serviceSchema, telHref, waHref, mailHref, pagePath, pageUrl,
  WA_DEFAULT_MSG, SITE_URL,
};

const pages = buildPages(x);

/* -------------------------------------------------------------------- write  */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// copy static assets
cpSync(join(SRC, 'assets'), join(OUT, 'assets'), { recursive: true });
// copy brand logos
mkdirSync(join(OUT, 'assets/img/logo'), { recursive: true });
for (const f of readdirSync(join(ROOT, 'logo'))) {
  if (f.endsWith('.svg')) cpSync(join(ROOT, 'logo', f), join(OUT, 'assets/img/logo', f));
}

for (const page of pages) {
  if (page.slug === '404') continue; // written flat as /404.html below
  const html = layout(page);
  const dir = page.slug === 'index' ? OUT : join(OUT, page.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}
// 404 (GitHub Pages / Netlify serve /404.html for unknown routes)
const notFound = pages.find((p) => p.slug === '404');
if (notFound) writeFileSync(join(OUT, '404.html'), layout(notFound));

/* --------------------------------------------------------- sitemap / robots */
const indexed = pages.filter((p) => !p.noindex && p.slug !== '404');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexed.map((p) => `  <url>
    <loc>${pageUrl(p.slug)}</loc>
    <lastmod>${BUILD_TIME.slice(0, 10)}</lastmod>
    <changefreq>${p.slug === 'index' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${p.slug === 'index' ? '1.0' : p.priority || '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;
writeFileSync(join(OUT, 'sitemap.xml'), sitemap);

writeFileSync(join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

writeFileSync(join(OUT, 'site.webmanifest'), JSON.stringify({
  name: c.business.name,
  short_name: c.business.shortName,
  description: c.business.descriptionShort,
  start_url: '/',
  display: 'standalone',
  background_color: '#F3EEE5',
  theme_color: '#7A1230',
  icons: [
    { src: '/assets/img/logo/avatar-square.svg', sizes: 'any', type: 'image/svg+xml' },
    { src: '/assets/img/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
}, null, 2));

if (c.site.generateCname) {
  try {
    const host = new URL(SITE_URL).host.replace(/^www\./, '');
    writeFileSync(join(OUT, 'CNAME'), host + '\n');
  } catch {}
}

// prevent Jekyll processing on GitHub Pages
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`Built ${pages.length} pages → ${OUT}`);
console.log(indexed.map((p) => `  ${pagePath(p.slug)}`).join('\n'));
