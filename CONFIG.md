# Owner verification checklist & configuration

Everything the site says about the business comes from **`site.config.json`**.
Edit that one file, run `npm run build`, and redeploy `public/`.

The research brief (`Custom Website Build Brief.md`) found **inconsistent public
information**. The site has been built with the least‑bad defaults and with
anything unverifiable either hedged in the copy or hidden behind a flag. Confirm
the items below before you point the domain at it.

---

## 1. Must confirm before launch

| Field in `site.config.json` | Current default | Why it needs checking |
|---|---|---|
| `business.name` | `Plumbing Electric Maintenance Service` | Google Maps, Facebook and the old website all use different names. Pick the public-facing brand. |
| `business.nameArabic` | `خدمات صيانة السباكة والكهرباء` | Confirm spelling / wording. |
| `contact.phonePrimary` / `…Display` | `+974 3139 4550` | Appears on Google Maps **and** Facebook, so it is the safest default — but confirm it is current. |
| `contact.phoneSecondary` | `+974 3147 5159` | The old website shows this too. Is it a second line or outdated? Set `contact.showSecondaryPhone` to `false` if it should not appear. |
| `contact.whatsapp` | `97431394550` | Digits only, international format, no `+`. Confirm this is the WhatsApp line. |
| `contact.email` | `contact@dohaplumberservices.com` | Confirm spelling and that the inbox is monitored. |
| `contact.streetAddress` | *(empty — not published)* | Facebook, the site header and the site footer show **three different addresses**. Until one is confirmed, no street address is shown and no map is embedded. Once confirmed, fill this in and set `flags.publishStreetAddress` to `true`. |
| `contact.hours247` / `hoursDisplay` | `true` / `24/7 emergency response` | Facebook and the old site both claim 24/7. Confirm whether that means phone availability, dispatch, or both. If it is not accurate, set `hours247` to `false` — the copy switches to "handled as quickly as possible during operating hours". |
| `business.areaServed` | `Doha and surrounding areas, Qatar` | Do not imply all‑Qatar coverage unless true. |
| `site.url` | `https://dohaplumberservices.com` | Used for canonical URLs, sitemap, Open Graph and the `CNAME` file. Set to the real domain. |

## 2. Claims that stay OFF until you have proof

| Flag | Default | Effect |
|---|---|---|
| `flags.showExperienceYears` + `flags.experienceYears` | `false` / `""` | The brief's "25+ years" claim is **not** shown. Set the flag `true` and fill the value only if it can be substantiated. |
| `flags.showReviews` | `false` | No testimonials or star ratings are shown (the Facebook page has 0 reviews). The About and Home pages show a neutral "leave a review" prompt instead. Flip to `true` only when you have real, permitted reviews to add. |
| `flags.publishStreetAddress` | `false` | Keeps the address and map hidden until a single verified address exists. |
| `flags.showPendingVerificationNotice` | `true` | Shows a small "some details are pending confirmation" line in the footer. Remove once everything above is verified. |

Also review, in the page copy, anything about call‑out fees, warranties,
licences, insurance and response times — these are written as "confirmed with
you directly" / "stated once the owner supplies details" and should be made
concrete or left as‑is.

## 3. Contact form delivery

`forms` in `site.config.json`:

```json
"forms": { "provider": "web3forms", "endpoint": "https://api.web3forms.com/submit", "accessKey": "" }
```

- **Until `accessKey` is set**, the form falls back to opening WhatsApp with the
  details pre‑filled (and the page tells the user to call). Nothing is lost.
- To receive form submissions by email, create a free access key at
  <https://web3forms.com> (just enter the destination email — no signup), paste
  it into `accessKey`, rebuild. Submissions then arrive at that address.
- Any provider that accepts a plain `multipart/form-data` POST and returns JSON
  works — set `provider` to something other than `web3forms`, put its URL in
  `endpoint`, and remove the `access_key` hidden field expectation.

## 4. Analytics (optional)

Set `site.gaMeasurementId` to a `G-XXXXXXX` ID to load Google Analytics 4 and
start recording the events the site already fires: `call_click`,
`whatsapp_click`, `quote_click`, `form_submit`, `faq_open` — each with a
`location` (topbar, hero, mobile_bar, footer, emergency_banner, …). Leave empty
for no tracking and no cookie banner obligation.

## 5. Images

- **Logo**: taken from `logo/` (committed to the repo). No action needed.
- **Photos**: the hero and the Projects gallery use captioned placeholders.
  Replace them with owner‑approved photographs of real work. Drop files in
  `src/assets/img/` and swap the `.hero__ph` / `.gallery__ph` blocks in
  `build/content.mjs` for `<img>` tags with the existing descriptive alt text.
- **Social share image**: `src/assets/img/og.svg` is used for link previews. For
  best support on Facebook/LinkedIn, export it to `src/assets/img/og.png`
  (1200×630) — the build picks up the PNG automatically if present.
