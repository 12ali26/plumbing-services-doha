/**
 * Page content for the Plumbing Electric Maintenance Service website.
 * Each page: { slug, title, description, priority?, noindex?, main, jsonld[] }
 * `x` is the component/helper namespace supplied by build.mjs.
 *
 * COPY NOTE: wording here follows the research brief. Claims about response
 * times, qualifications, pricing, guarantees and coverage are deliberately
 * hedged and must be approved by the owner. See CONFIG.md.
 */
export function buildPages(x) {
  const {
    c, icon, esc, btn, callBtn, waBtn, quoteBtn, heading, serviceCards, SERVICES,
    steps, faqList, ctaBand, emergencyBanner, breadcrumbs, reviewsPlaceholder,
    gallery, contactForm, serviceSchema, telHref, waHref, mailHref, pagePath,
    WA_DEFAULT_MSG,
  } = x;

  const wrap = (inner) => `<div class="wrap">${inner}</div>`;
  const section = (inner, cls = '') => `<section class="section ${cls}">${wrap(inner)}</section>`;

  const pageHero = (eyebrow, title, sub, { crumbs } = {}) => `
    <section class="phero">
      <div class="wrap">
        ${crumbs ? breadcrumbs(crumbs) : ''}
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p class="phero__sub">${sub}</p>
        <div class="phero__actions">
          ${callBtn('primary', `Call ${c.contact.phonePrimaryDisplay}`)}
          ${waBtn('whatsapp', 'WhatsApp us')}
          ${quoteBtn('outline', 'Request a callback')}
        </div>
      </div>
    </section>`;

  // Reusable "what to send us" block for service pages
  const whatToSend = (extra = []) => `
    <div class="panel">
      <h3>${icon('chat')} What to send us on WhatsApp</h3>
      <ul class="ticks" role="list">
        <li>${icon('check')} Your area or neighbourhood in Doha</li>
        <li>${icon('check')} A short description of the problem and when it started</li>
        <li>${icon('check')} One or two photos of the fault, fixture or panel</li>
        <li>${icon('check')} Whether it is an emergency or can wait</li>
        ${extra.map((e) => `<li>${icon('check')} ${e}</li>`).join('')}
      </ul>
      ${waBtn('whatsapp', 'Send a photo on WhatsApp')}
    </div>`;

  const servicePage = ({
    slug, seoTitle, seoDesc, eyebrow, h1, intro, crumbs,
    problems, weHandle, symptoms, safety, sendExtra, faq, priority = '0.8',
  }) => ({
    slug,
    title: seoTitle,
    description: seoDesc,
    priority,
    jsonld: [
      serviceSchema({ name: h1, description: seoDesc, slug }),
      ...(faq ? [] : []),
    ],
    main: `
      ${pageHero(eyebrow, h1, intro, { crumbs })}
      ${emergencyBanner()}
      ${section(`
        ${heading('', 'Common problems we are called for')}
        <div class="split">
          <ul class="ticks ticks--2" role="list">
            ${problems.map((p) => `<li>${icon('check')} ${p}</li>`).join('')}
          </ul>
          ${whatToSend(sendExtra || [])}
        </div>
      `)}
      ${section(`
        ${heading('', 'What the visit usually involves')}
        <ul class="ticks ticks--2" role="list">
          ${weHandle.map((p) => `<li>${icon('check')} ${p}</li>`).join('')}
        </ul>
      `, 'section--tint')}
      ${symptoms ? section(`
        ${heading('', 'Symptoms worth describing when you call')}
        <p class="lead">We do not diagnose remotely, but these details help us bring the right parts and set expectations.</p>
        <ul class="ticks ticks--2" role="list">
          ${symptoms.map((p) => `<li>${icon('check')} ${p}</li>`).join('')}
        </ul>
      `) : ''}
      ${safety ? `<section class="section"><div class="wrap"><div class="notice notice--warn">${icon('shield')}<div><h3>Safety first</h3><p>${safety}</p></div></div></div></section>` : ''}
      ${section(`
        ${heading('', 'How it works')}
        ${steps([
          ['Contact the team', 'Call or send a WhatsApp message with your location and a short description of the issue.'],
          ['Discuss the problem', 'We confirm the situation, how urgent it is, and whether a site visit is needed.'],
          ['Inspect and recommend', 'The technician assesses the system and explains the repair or installation path before starting.'],
          ['Complete the work', 'Approved work is carried out with a clear handover and maintenance guidance where useful.'],
        ])}
      `, 'section--tint')}
      ${faq ? section(`${heading('FAQs', 'Questions about ' + h1.toLowerCase())}${faqList(faq)}`) : ''}
      ${ctaBand()}
    `,
  });

  /* ============================================================= HOME ===== */
  const home = {
    slug: 'index',
    title: `Plumber & Electrician in Doha | ${c.business.name}`,
    description: c.business.descriptionShort,
    priority: '1.0',
    jsonld: [
      `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: c.business.name,
        url: x.SITE_URL + '/',
        potentialAction: {
          '@type': 'SearchAction',
          target: x.SITE_URL + '/?s={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      })}</script>`,
    ],
    main: `
      <section class="hero">
        <div class="wrap hero__inner">
          <div class="hero__copy">
            <p class="eyebrow">${esc(c.business.areaServed)}</p>
            <h1>Reliable Plumbing, Electrical &amp; Maintenance Services in Doha</h1>
            <p class="hero__sub">Fast help for leaks, blockages, water heaters, pumps, wiring and urgent repair needs — for homes and businesses.</p>
            <div class="hero__actions">
              ${callBtn('primary', `Call ${c.contact.phonePrimaryDisplay}`)}
              ${waBtn('whatsapp', 'WhatsApp for quick help')}
            </div>
            <ul class="hero__trust" role="list">
              <li>${icon('pin')} Local Doha service</li>
              <li>${icon('clock')} ${c.contact.hours247 ? 'Emergency support available' : 'Fast response during hours'}</li>
              <li>${icon('building')} Residential &amp; commercial work</li>
            </ul>
          </div>
          <div class="hero__media">
            <div class="hero__ph" role="img" aria-label="Technician working on plumbing and electrical equipment in Doha.">
              ${icon('tools')}
            </div>
            <div class="hero__badge">${icon('clock')} Need urgent help?</div>
          </div>
        </div>
      </section>

      ${section(`
        ${heading('What we do', 'Services for homes and businesses in Doha')}
        ${serviceCards()}
        <div class="center"><a class="btn btn--outline" href="${pagePath('services')}">See all services ${icon('arrow')}</a></div>
      `)}

      ${x.emergencyBanner()}

      ${section(`
        ${heading('Why choose us', 'Practical help, explained clearly')}
        <ul class="feat" role="list">
          <li class="feat__item"><span class="feat__ic">${icon('shield')}</span><h3>Experienced local team</h3><p>Plumbers and electricians serving customers across Doha, focused on doing the job properly the first time.</p></li>
          <li class="feat__item"><span class="feat__ic">${icon('chat')}</span><h3>Clear communication</h3><p>We explain the issue, the recommended work and the expected cost before starting, whenever practical.</p></li>
          <li class="feat__item"><span class="feat__ic">${icon('zap')}</span><h3>Work focused on safety</h3><p>Electrical, water-pressure and hot-water issues are treated carefully and professionally.</p></li>
          <li class="feat__item"><span class="feat__ic">${icon('building')}</span><h3>Homes &amp; commercial</h3><p>Support for apartments, villas, offices, shops and property-maintenance needs where we have capacity.</p></li>
        </ul>
      `, 'section--tint')}

      ${section(`
        ${heading('How it works', 'From first message to finished job')}
        ${steps([
          ['Contact the team', 'Call or send a WhatsApp message with the location and a short description of the issue.'],
          ['Discuss the problem', 'We confirm the situation, urgency and whether a site visit is required.'],
          ['Inspect and recommend', 'The technician assesses the system and explains the repair or installation path.'],
          ['Complete the work', 'Approved work is carried out with a clear handover and maintenance guidance where applicable.'],
        ])}
      `)}

      ${section(`
        ${heading('Recent work', 'A sample of jobs around Doha')}
        ${gallery()}
      `, 'section--tint')}

      ${section(`
        ${heading('Service areas', 'Across Doha and nearby')}
        <p class="lead">We travel to homes and businesses across the city. Tell us your neighbourhood when you contact us and we will confirm timing.</p>
        <ul class="chips" role="list">
          ${['Al Sadd','West Bay','The Pearl','Lusail','Al Wakrah','Al Rayyan','Al Gharrafa','Al Aziziyah','Al Dafna','Old Airport','Al Waab','Msheireb','Al Thumama','Ain Khaled'].map((a) => `<li>${a}</li>`).join('')}
        </ul>
        <div class="center"><a class="btn btn--outline" href="${pagePath('service-areas')}">Service areas ${icon('arrow')}</a></div>
      `)}

      ${section(`
        ${heading('FAQs', 'Quick answers before you call')}
        ${faqList(HOME_FAQ())}
        <div class="center"><a class="btn btn--outline" href="${pagePath('faqs')}">All FAQs ${icon('arrow')}</a></div>
      `, 'section--tint')}

      ${reviewsPlaceholder()}

      ${ctaBand('Need a plumber or electrician in Doha?', 'Tell us what is wrong and we will help you choose the next step.')}
    `,
  };

  function HOME_FAQ() {
    return [
      { q: 'Do you cover emergencies?', a: c.contact.hours247
        ? `Yes. Our stated cover is <strong>${esc(c.contact.hoursDisplay)}</strong> for urgent plumbing and electrical problems in Doha. Call the main number for the fastest response.`
        : 'We handle urgent requests as quickly as possible during operating hours. Call the main number and describe the problem so we can prioritise it.' },
      { q: 'Which areas of Doha do you serve?', a: `We work with homes and businesses across ${esc(c.business.areaServed)}. Share your neighbourhood when you contact us and we will confirm timing.` },
      { q: 'How do I get a price?', a: `Send a description and photos by WhatsApp or use the <a href="${pagePath('contact')}#request">callback form</a>. Where possible we give an indication before the visit and confirm the cost on site before starting work.` },
      { q: 'Do you handle both plumbing and electrical work?', a: 'Yes — plumbing, electrical, water pumps, water tanks and water heaters, plus general building maintenance. Larger installations are quoted after a site assessment.' },
      { q: 'Can you help property managers with recurring maintenance?', a: `Yes. See <a href="${pagePath('commercial-maintenance')}">commercial maintenance</a> for planned inspections and repairs across multiple units or sites.` },
    ];
  }

  /* ========================================================= SERVICES HUB = */
  const servicesHub = {
    slug: 'services',
    title: `Plumbing & Electrical Services in Doha | ${c.business.shortName}`,
    description: 'Full list of plumbing, electrical, water-pump, water-tank, water-heater, emergency and commercial maintenance services in Doha, Qatar.',
    priority: '0.9',
    main: `
      ${pageHero('Services', 'Plumbing, electrical &amp; maintenance services in Doha',
        'Choose the service closest to your problem. Not sure? Call or WhatsApp and describe it — we will point you the right way.',
        { crumbs: [['Services', pagePath('services')]] })}
      ${section(serviceCards())}
      ${section(`
        ${heading('', 'Installations and upgrades')}
        <p class="lead">Alongside repairs we handle new plumbing, electrical, pump, tank and related system installations, subject to a site assessment. Ask for a visit to discuss scope and cost.</p>
        ${waBtn('whatsapp', 'Discuss an installation')}
      `, 'section--tint')}
      ${ctaBand()}
    `,
  };

  /* ======================================================= SERVICE PAGES == */
  const plumbing = servicePage({
    slug: 'plumbing-services',
    seoTitle: 'Plumber in Doha, Qatar | Leak, Blockage & Repair Services',
    seoDesc: 'Plumber in Doha for water leaks, pipe repairs, blocked drains, low pressure, bathroom and kitchen plumbing, fixtures, installations and preventive maintenance.',
    eyebrow: 'Plumbing',
    h1: 'Plumbing repairs &amp; maintenance in Doha',
    intro: 'Leaks, blockages, low pressure and bathroom or kitchen plumbing — for apartments, villas and commercial units.',
    crumbs: [['Services', pagePath('services')], ['Plumbing services', pagePath('plumbing-services')]],
    problems: [
      'Water leaks under sinks, behind walls or from ceilings',
      'Blocked drains, toilets, showers and floor traps',
      'Low or fluctuating water pressure',
      'Dripping taps, faulty mixers and running toilets',
      'Bathroom and kitchen plumbing changes',
      'Water-supply interruptions and pipe damage',
      'Fixture and appliance connections',
      'Leaking or corroded pipwork',
    ],
    weHandle: [
      'Leak detection and tracing the source',
      'Pipe repair and replacement of damaged sections',
      'Clearing blockages and checking the drain run',
      'Tap, mixer, cistern and valve repair or replacement',
      'Reconnecting sinks, basins, showers and appliances',
      'Pressure checks across the property',
      'Advice on preventing repeat problems',
      'Preventive maintenance visits on request',
    ],
    symptoms: [
      'Where the water appears and how fast it collects',
      'Whether it is clean, grey or waste water',
      'Which fixtures are affected and which still work',
      'Any recent work, renovation or appliance changes',
    ],
    safety: 'If water is near electrical fittings or a distribution board, keep clear and switch off the affected circuit at the board if you can do so safely. Call us and mention the electrical risk.',
    sendExtra: ['Whether you can isolate the water supply at the property'],
    faq: [
      { q: 'Can you find a leak inside a wall or slab?', a: 'Yes. We trace leaks by inspection and testing, then agree the least disruptive way to reach and repair the pipe before opening anything up.' },
      { q: 'My drain keeps blocking — can it be fixed permanently?', a: 'Often yes. We clear the immediate blockage and check the run to see whether gradient, buildup or a damaged section is the underlying cause.' },
      { q: 'Do you replace bathroom and kitchen fixtures?', a: 'Yes — supply and fit, or fit items you have already bought. Tell us the model so we bring the right connectors.' },
    ],
  });

  const electrical = servicePage({
    slug: 'electrical-services',
    seoTitle: 'Electrician in Doha | Wiring, Repairs & Electrical Maintenance',
    seoDesc: 'Electrician in Doha for wiring, distribution boards, switches and sockets, lighting faults, fault finding, pump connections and electrical maintenance for homes and businesses.',
    eyebrow: 'Electrical',
    h1: 'Electrical repairs &amp; maintenance in Doha',
    intro: 'Wiring, distribution boards, sockets, lighting faults and fault finding — carried out carefully and explained clearly.',
    crumbs: [['Services', pagePath('services')], ['Electrical services', pagePath('electrical-services')]],
    problems: [
      'Tripping breakers and RCDs that will not reset',
      'Dead sockets, switches and light fittings',
      'Flickering or dimming lights',
      'Burning smell, buzzing or warm faceplates',
      'Distribution-board faults and labelling',
      'Adding or moving sockets, switches and lights',
      'Electrical connections for water pumps',
      'New circuits and small installation work',
    ],
    weHandle: [
      'Fault finding to isolate the circuit at fault',
      'Repair or replacement of switches, sockets and fittings',
      'Distribution-board inspection, tightening and repair',
      'Lighting repairs and replacements',
      'Dedicated circuits for pumps and appliances',
      'Safe make-good of unsafe existing work',
      'Basic safety checks on request',
      'Clear explanation of what was found and fixed',
    ],
    symptoms: [
      'What trips and whether it is immediate or delayed',
      'Which rooms or circuits are affected',
      'Any smell, sound, heat or visible damage',
      'Recent appliances added or work carried out',
    ],
    safety: 'Do not touch exposed wiring, wet fittings or a board that is warm or making noise. If there is smoke, burning or immediate danger, leave the area and call the emergency services first, then contact us.',
    sendExtra: ['A photo of the distribution board with the cover on'],
    faq: [
      { q: 'My breaker keeps tripping — what does that mean?', a: 'It usually means a circuit is overloaded or a fault is present. We test circuit by circuit to find the cause rather than simply resetting it.' },
      { q: 'Can you add sockets or move a light?', a: 'Yes, subject to inspecting the existing circuit and board capacity. We will tell you if an upgrade is needed first.' },
      { q: 'Do you wire electrical connections for water pumps?', a: 'Yes. Pump electrical connections and controllers are a regular part of our work — see the water pumps and tanks page.' },
    ],
  });

  const pumps = servicePage({
    slug: 'water-pumps-tanks',
    seoTitle: 'Water Pump & Tank Services in Doha | Booster Pumps, Controllers, Tanks',
    seoDesc: 'Water pump and tank services in Doha: booster pumps, pump controllers, pressure problems, water tanks, supply issues, installation, repair and preventive maintenance.',
    eyebrow: 'Water pumps &amp; tanks',
    h1: 'Water pump &amp; tank services in Doha',
    intro: 'Booster pumps, controllers, pressure problems and tank connections — a visible specialty for homes and buildings.',
    crumbs: [['Services', pagePath('services')], ['Water pumps & tanks', pagePath('water-pumps-tanks')]],
    problems: [
      'Low or no water pressure at taps and showers',
      'Pump running constantly or cycling on and off',
      'Unusual noise, vibration or overheating',
      'Pump not starting or tripping its supply',
      'Faulty pressure switch or pump controller',
      'Tank overflow, airlocks or loss of supply',
      'New booster pump or controller installation',
      'Preventive servicing for buildings and villas',
    ],
    weHandle: [
      'Checking pump operation, pressure and controls',
      'Repair or replacement of pressure switches and controllers',
      'Booster pump repair or replacement',
      'Tank inlet, outlet and float-valve work',
      'Wiring and electrical connection for the pump',
      'Clearing airlocks and restoring supply',
      'Installation of new pumps and controllers',
      'Scheduled maintenance for shared water systems',
    ],
    symptoms: [
      'Whether the problem is one tap or the whole property',
      'Any noise, smell or heat from the pump',
      'Whether the pump is in a pit, roof or plant room',
      'Make and model on the pump label if visible',
    ],
    safety: 'Pumps combine water and electricity. Do not open a wet pump or its control box. Switch off the pump supply at the board if it is safe to do so, and tell us it involves electrical work.',
    sendExtra: ['A photo of the pump, controller and its wiring'],
    faq: [
      { q: 'Why does my booster pump never switch off?', a: 'Common causes are a failed pressure switch, a waterlogged pressure vessel or a small leak keeping pressure low. We test each in turn.' },
      { q: 'Can you replace just the controller, not the whole pump?', a: 'Often yes. If the pump motor is sound we can replace the pressure switch or electronic controller alone.' },
      { q: 'Do you service building water systems on a schedule?', a: 'Yes — see commercial maintenance for planned pump and tank servicing across a building or portfolio.' },
    ],
  });

  const heaters = servicePage({
    slug: 'water-heater-services',
    seoTitle: 'Water Heater Repair in Doha | Electric Heater Faults & Installation',
    seoDesc: 'Water heater services in Doha: electric water-heater faults, no-hot-water diagnosis, pressure-relief valve issues, replacement and maintenance for homes and businesses.',
    eyebrow: 'Water heaters',
    h1: 'Water heater services in Doha',
    intro: 'No hot water, leaking heaters and pressure-relief valve problems — inspected and repaired by a professional.',
    crumbs: [['Services', pagePath('services')], ['Water heater services', pagePath('water-heater-services')]],
    problems: [
      'No hot water or water not hot enough',
      'Water too hot or temperature swinging',
      'Heater leaking from the body or fittings',
      'Water discharging from the pressure-relief valve',
      'Tripping the circuit when the heater switches on',
      'Discoloured water or smell from the hot tap',
      'Old heater due for replacement',
      'New heater supply and installation',
    ],
    weHandle: [
      'Inspection of the element, thermostat and wiring',
      'Pressure-relief and non-return valve checks',
      'Repair or replacement of failed parts',
      'Full heater replacement where repair is not worthwhile',
      'Checking the electrical supply and isolation',
      'Flushing and basic maintenance',
      'Advice on sizing and placement for a new unit',
      'Safe disposal of the old heater',
    ],
    symptoms: [
      'Whether it is one tap or all hot outlets',
      'Any water around or under the heater',
      'The age of the heater if known',
      'Whether it trips the breaker and when',
    ],
    safety: 'Hot water and electricity together carry a scald and shock risk. Do not open the heater. Switch it off at the board, and if it is discharging hot water, keep people away from the outlet.',
    sendExtra: ['A photo of the heater, its valves and the pipework around it'],
    faq: [
      { q: 'Is it worth repairing an old water heater?', a: 'If the tank itself is leaking, replacement is usually the sensible option. Element, thermostat and valve faults are normally repairable.' },
      { q: 'Water sprays from a valve on the heater — is that normal?', a: 'A little discharge when heating can be normal; a steady flow is not. It often points to a faulty pressure-relief valve or high incoming pressure. Have it checked.' },
      { q: 'Can you supply and fit a new heater the same day?', a: 'Often, depending on the size and type in stock. Send a photo of the current unit so we can match it.' },
    ],
  });

  const emergency = {
    slug: 'emergency-maintenance',
    title: 'Emergency Plumber & Electrician in Doha | Fast Response',
    description: 'Emergency plumbing and electrical maintenance in Doha for leaks, no power, no water, pump failure and water-heater faults. Call or WhatsApp for the fastest response.',
    priority: '0.8',
    jsonld: [serviceSchema({ name: 'Emergency plumbing and electrical maintenance', description: 'Urgent plumbing and electrical call-outs in Doha.', slug: 'emergency-maintenance' })],
    main: `
      ${pageHero('Emergency', 'Emergency plumbing &amp; electrical help in Doha',
        c.contact.hours247
          ? `Our stated cover is <strong>${esc(c.contact.hoursDisplay)}</strong>. For anything urgent, calling is faster than the form.`
          : 'We handle urgent requests as quickly as possible during operating hours. Call and describe the problem so we can prioritise it.',
        { crumbs: [['Services', pagePath('services')], ['Emergency maintenance', pagePath('emergency-maintenance')]] })}
      <section class="section"><div class="wrap">
        <div class="notice notice--warn">${icon('shield')}<div>
          <h3>If there is immediate danger</h3>
          <p>For fire, electric shock, flooding that threatens safety, or a gas smell, contact Qatar's emergency services first. Then call us so we can make the property safe and carry out repairs.</p>
        </div></div>
      </div></section>
      ${section(`
        ${heading('', 'Emergencies we are called for')}
        <ul class="ticks ticks--2" role="list">
          <li>${icon('check')} Burst pipes and major leaks</li>
          <li>${icon('check')} Ceiling leaks between apartments</li>
          <li>${icon('check')} No water to the property</li>
          <li>${icon('check')} Overflowing or backed-up drainage</li>
          <li>${icon('check')} Total loss of power or a circuit that will not reset</li>
          <li>${icon('check')} Burning smell or sparking from a fitting or board</li>
          <li>${icon('check')} Water heater leaking or discharging hot water</li>
          <li>${icon('check')} Booster pump failure leaving a building without supply</li>
        </ul>
      `)}
      ${section(`
        ${heading('', 'While you wait for us')}
        ${steps([
          ['Make it safe', 'Isolate the water at the main valve, or switch off the affected circuit at the distribution board — only if you can do so safely.'],
          ['Contain the damage', 'Move valuables and electricals clear of water. Put down towels or a container under a drip.'],
          ['Call, then message', 'Call the main number first. Then send your area and photos on WhatsApp so we arrive prepared.'],
          ['Keep the line open', 'Stay reachable so the technician can call you for access and directions.'],
        ])}
      `, 'section--tint')}
      <section class="section"><div class="wrap"><div class="panel panel--center">
        <h3>${icon('phone')} Fastest way to reach us now</h3>
        <div class="phero__actions">
          ${callBtn('primary', `Call ${c.contact.phonePrimaryDisplay}`)}
          ${c.contact.showSecondaryPhone && c.contact.phoneSecondaryDisplay ? btn(`${icon('phone')}<span>${esc(c.contact.phoneSecondaryDisplay)}</span>`, telHref(c.contact.phoneSecondary), 'outline') : ''}
          ${waBtn('whatsapp', 'WhatsApp now')}
        </div>
      </div></div></section>
      ${section(`${heading('FAQs', 'Emergency questions')}${faqList([
        { q: 'What counts as an emergency?', a: 'Anything causing damage or making a home unsafe or unusable right now — flooding, no water, no power, a leaking heater, or a burning smell from electrics.' },
        { q: 'Is there a call-out fee?', a: 'Any call-out or after-hours charge is confirmed with you before we are dispatched. <em>The owner should confirm the current policy before launch.</em>' },
        { q: 'How quickly can someone come?', a: 'We prioritise by risk and location and give you a realistic time when you call. We do not publish a fixed response-time guarantee.' },
      ])}`)}
      ${ctaBand('Have an emergency now?', 'Call the main number — it is the quickest way to reach a technician.')}
    `,
  };

  const commercial = {
    slug: 'commercial-maintenance',
    title: 'Commercial Property Maintenance in Doha | Plumbing & Electrical',
    description: 'Planned and reactive plumbing and electrical maintenance in Doha for offices, shops, villas, apartment buildings and small commercial sites. Recurring inspections and repairs.',
    priority: '0.8',
    jsonld: [serviceSchema({ name: 'Commercial property maintenance', description: 'Planned and reactive maintenance for commercial and multi-unit properties in Doha.', slug: 'commercial-maintenance' })],
    main: `
      ${pageHero('Commercial', 'Commercial &amp; property maintenance in Doha',
        'Planned maintenance, recurring inspections and fast reactive repairs for offices, shops, villas and residential buildings.',
        { crumbs: [['Services', pagePath('services')], ['Commercial maintenance', pagePath('commercial-maintenance')]] })}
      ${section(`
        ${heading('', 'Who we support')}
        <ul class="ticks ticks--2" role="list">
          <li>${icon('check')} Offices and business premises</li>
          <li>${icon('check')} Retail units and small shops</li>
          <li>${icon('check')} Villas and villa compounds</li>
          <li>${icon('check')} Apartment buildings and shared facilities</li>
          <li>${icon('check')} Property managers and landlords</li>
          <li>${icon('check')} Facilities and maintenance teams needing extra hands</li>
        </ul>
      `)}
      ${section(`
        ${heading('', 'What a maintenance arrangement can cover')}
        <div class="split">
          <ul class="ticks" role="list">
            <li>${icon('check')} Scheduled plumbing and drainage checks</li>
            <li>${icon('check')} Distribution-board and circuit inspections</li>
            <li>${icon('check')} Booster pump and water-tank servicing</li>
            <li>${icon('check')} Water-heater checks across multiple units</li>
            <li>${icon('check')} Common-area lighting and fittings</li>
            <li>${icon('check')} Priority response for reactive faults</li>
            <li>${icon('check')} A single point of contact for reports and photos</li>
          </ul>
          <div class="panel">
            <h3>Set up a walk-through</h3>
            <p>Tell us the property type, number of units and any known issues. We will arrange a visit and propose a practical scope and schedule.</p>
            ${waBtn('whatsapp', 'Arrange a walk-through')}
            <p class="muted">Prefer email? <a href="${mailHref()}">${esc(c.contact.email)}</a></p>
          </div>
        </div>
      `, 'section--tint')}
      ${section(`${heading('FAQs', 'Commercial questions')}${faqList([
        { q: 'Do you offer a fixed monthly contract?', a: 'We can work to a recurring schedule or on-call. Scope, frequency and pricing are agreed after a site walk-through. <em>Owner to confirm contract terms before launch.</em>' },
        { q: 'Can you hold keys or access cards?', a: 'By arrangement, with a written access and key-handling agreement in place.' },
        { q: 'Do you provide reports after each visit?', a: 'Yes — a short written summary with photos of what was checked, what was done and anything to watch.' },
      ])}`)}
      ${ctaBand('Manage a property in Doha?', 'Let us take routine plumbing and electrical maintenance off your list.')}
    `,
  };

  /* ============================================================= ABOUT ==== */
  const about = {
    slug: 'about',
    title: `About | ${c.business.name}, Doha`,
    description: 'A Doha-based team providing plumbing, electrical, water-pump, water-heater and general maintenance for homes and businesses. Practical work, explained clearly.',
    priority: '0.6',
    main: `
      ${pageHero('About', 'A local Doha maintenance team',
        'We keep essential systems working safely and properly for homes and businesses across Doha.',
        { crumbs: [['About', pagePath('about')]] })}
      ${section(`
        <div class="prose">
          <p>${esc(c.business.name)} provides plumbing, electrical, water-pump, water-tank, water-heater and general repair and maintenance services in Doha, Qatar. Most people contact us with an urgent problem, so the way we work is built around fast communication and a clear explanation before any work starts.</p>
          ${c.flags.showExperienceYears && c.flags.experienceYears
            ? `<p>The team brings ${esc(c.flags.experienceYears)} of hands-on experience across residential and commercial maintenance in Qatar.</p>`
            : `<p>The team brings hands-on experience across residential and commercial maintenance in Qatar. <em class="muted">(A specific years-of-experience figure will be shown here once confirmed by the owner.)</em></p>`}
          <h2>How we work</h2>
          <ul>
            <li><strong>Explain first.</strong> We describe what is wrong, what we recommend and the expected cost before starting, whenever practical.</li>
            <li><strong>Work safely.</strong> Electrical, water-pressure and hot-water problems are treated with care and not rushed.</li>
            <li><strong>Leave it tidy.</strong> A clear handover, and maintenance guidance where it helps you avoid a repeat call.</li>
            <li><strong>Homes and businesses.</strong> Apartments, villas, offices, shops and property-maintenance needs, where we have capacity.</li>
          </ul>
          <h2>Our promise</h2>
          <p>Reliable, practical maintenance with honest advice. If something is outside what we can safely or properly do, we will tell you.</p>
        </div>
      `)}
      ${section(`
        ${heading('', 'What we cover')}
        ${serviceCards()}
      `, 'section--tint')}
      ${reviewsPlaceholder()}
      ${ctaBand()}
    `,
  };

  /* =========================================================== PROJECTS === */
  const projects = {
    slug: 'projects',
    title: 'Projects & Gallery | Plumbing & Electrical Work in Doha',
    description: 'A gallery of plumbing, electrical, water-pump, water-tank and water-heater work carried out for homes and businesses in Doha.',
    priority: '0.5',
    main: `
      ${pageHero('Projects', 'Recent work around Doha',
        'A sample of the plumbing, electrical, pump, tank and water-heater jobs we are called for.',
        { crumbs: [['Projects', pagePath('projects')]] })}
      ${section(gallery())}
      ${section(`
        <div class="notice">${icon('shield')}<div>
          <h3>About these images</h3>
          <p>Placeholders are shown until owner-approved photographs of real completed work are supplied. Every published image will carry descriptive alt text and will only be used with permission. No project dates or outcomes are claimed without evidence.</p>
        </div></div>
      `, 'section--tint')}
      ${ctaBand('Want work like this done?', 'Send a photo of your problem and we will tell you the next step.')}
    `,
  };

  /* ======================================================= SERVICE AREAS = */
  const AREAS = ['Al Sadd','Al Dafna / West Bay','The Pearl','Lusail','Msheireb Downtown','Al Rayyan','Al Gharrafa','Al Waab','Al Aziziyah','Old Airport','Al Thumama','Ain Khaled','Al Wakrah','Al Khor','Al Sailiya','Abu Hamour','Bin Mahmoud','Onaiza','Duhail','Al Kheesa'];
  const serviceAreas = {
    slug: 'service-areas',
    title: 'Service Areas | Plumbing & Electrical Maintenance Across Doha',
    description: 'Plumbing, electrical and maintenance service across Doha neighbourhoods and nearby areas including West Bay, The Pearl, Lusail, Al Sadd, Al Rayyan, Al Wakrah and more.',
    priority: '0.6',
    main: `
      ${pageHero('Service areas', 'Where we work',
        `We travel to homes and businesses across ${esc(c.business.areaServed)}. If your area is not listed, ask — we may still be able to help.`,
        { crumbs: [['Service areas', pagePath('service-areas')]] })}
      ${section(`
        ${heading('', 'Doha neighbourhoods and nearby areas')}
        <ul class="chips chips--lg" role="list">
          ${AREAS.map((a) => `<li>${icon('pin')} ${a}</li>`).join('')}
        </ul>
        <p class="fineprint">Coverage list is indicative and should be confirmed against the areas the team actually serves before launch.</p>
      `)}
      ${section(`
        ${heading('', 'Getting a technician to you')}
        ${steps([
          ['Tell us your area', 'Include the neighbourhood, building or compound name and any access notes.'],
          ['We confirm timing', 'Based on location and how urgent the job is.'],
          ['Technician heads out', 'They call on approach for directions and parking.'],
        ])}
      `, 'section--tint')}
      ${ctaBand()}
    `,
  };

  /* ============================================================== FAQS ==== */
  const faqs = {
    slug: 'faqs',
    title: 'FAQs | Plumbing & Electrical Maintenance in Doha',
    description: 'Answers to common questions about booking a plumber or electrician in Doha: coverage, emergencies, pricing, photos, commercial maintenance and how the visit works.',
    priority: '0.6',
    main: `
      ${pageHero('FAQs', 'Frequently asked questions',
        'If your question is not here, call or WhatsApp us and ask.',
        { crumbs: [['FAQs', pagePath('faqs')]] })}
      ${section(faqList([
        ...HOME_FAQ(),
        { q: 'What should I send when I first contact you?', a: 'Your area in Doha, a short description of the problem, one or two photos, and whether it is urgent. That is usually enough for us to advise the next step.' },
        { q: 'Do you charge a call-out fee?', a: 'Any call-out or after-hours charge is confirmed with you before a technician is dispatched. <em>The owner should confirm the current policy before launch.</em>' },
        { q: 'Can you give a fixed price over the phone?', a: 'For straightforward jobs we can give an indication. Anything involving hidden pipework, boards or pumps is confirmed on site before work starts.' },
        { q: 'Do you guarantee your work?', a: 'Workmanship and any warranty terms will be stated here once confirmed by the owner. Ask the technician what applies to your job.' },
        { q: 'Do you work on weekends and public holidays?', a: c.contact.hours247 ? 'Our stated cover is ' + esc(c.contact.hoursDisplay) + '. Call the main number at any time for urgent problems.' : 'Contact us for current hours, including weekend and holiday availability.' },
        { q: 'Do you supply parts and materials?', a: 'Yes, or we can fit items you have already purchased. Tell us the model so we bring the right fittings.' },
        { q: 'Are you licensed and insured?', a: 'Any licences, registrations or insurance the business holds will be listed here once the owner supplies the details. We do not publish unverified credentials.' },
      ]))}
      ${ctaBand()}
    `,
  };

  /* ============================================================ CONTACT === */
  const contact = {
    slug: 'contact',
    title: 'Contact | Call or WhatsApp a Plumber in Doha',
    description: `Contact ${c.business.name} in Doha. Call ${c.contact.phonePrimaryDisplay}, message on WhatsApp, email ${c.contact.email}, or send a callback request.`,
    priority: '0.7',
    jsonld: [
      `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact',
        url: x.pageUrl('contact'),
      })}</script>`,
    ],
    main: `
      ${pageHero('Contact', 'Contact the team',
        'Call for anything urgent. For quotes and non-urgent jobs, WhatsApp a photo or send the form below.',
        { crumbs: [['Contact', pagePath('contact')]] })}
      ${section(`
        <div class="contact-grid">
          <div class="contact-card">
            <h2>Reach us directly</h2>
            <ul class="contact-list" role="list">
              <li>${icon('phone')}<div><span class="muted">Phone</span><a href="${telHref(c.contact.phonePrimary)}" data-analytics="call_click" data-analytics-location="contact_page">${esc(c.contact.phonePrimaryDisplay)}</a>${c.contact.showSecondaryPhone && c.contact.phoneSecondaryDisplay ? `<br><a href="${telHref(c.contact.phoneSecondary)}">${esc(c.contact.phoneSecondaryDisplay)}</a> <span class="muted">(alt.)</span>` : ''}</div></li>
              <li>${icon('chat')}<div><span class="muted">WhatsApp</span><a href="${waHref(WA_DEFAULT_MSG)}" target="_blank" rel="noopener" data-analytics="whatsapp_click" data-analytics-location="contact_page">Message us on WhatsApp</a></div></li>
              <li>${icon('mail')}<div><span class="muted">Email</span><a href="${mailHref()}">${esc(c.contact.email)}</a></div></li>
              <li>${icon('pin')}<div><span class="muted">Area</span>${esc(c.business.areaServed)}${c.flags.publishStreetAddress && c.contact.streetAddress ? `<br>${esc(c.contact.streetAddress)}` : '<br><span class="muted">Mobile service — we come to you.</span>'}</div></li>
              <li>${icon('clock')}<div><span class="muted">Hours</span>${c.contact.hours247 ? esc(c.contact.hoursDisplay) : 'Contact us for current hours'}</div></li>
            </ul>
            <div class="phero__actions">
              ${callBtn('primary', 'Call now')}
              ${waBtn('whatsapp', 'WhatsApp')}
            </div>
            ${c.contact.mapEmbedUrl ? `<div class="map">${c.contact.mapEmbedUrl}</div>` : `<p class="fineprint">A map will be added once the business confirms a single verified address. Public sources currently list conflicting addresses, so none is published here.</p>`}
          </div>
          <div class="contact-card">
            <h2>Request a callback</h2>
            ${contactForm()}
          </div>
        </div>
      `)}
      ${section(`
        <div class="panel panel--center">
          <h3>${icon('chat')} Prefer WhatsApp? Copy this and fill in the blanks</h3>
          <blockquote class="wa-template">${esc(WA_DEFAULT_MSG)}</blockquote>
          ${waBtn('whatsapp', 'Open WhatsApp with this message')}
        </div>
      `, 'section--tint')}
    `,
  };

  /* ============================================================= LEGAL ==== */
  const legalPage = (slug, title, bodyHtml) => ({
    slug,
    title: `${title} | ${c.business.shortName}`,
    description: `${title} for ${c.business.name}, Doha, Qatar.`,
    priority: '0.2',
    main: `
      ${pageHero('Legal', title, 'Plain-language version. Please confirm with the business for anything specific to your job.',
        { crumbs: [[title, pagePath(slug)]] })}
      ${section(`<div class="prose">${bodyHtml}<p class="muted">Last updated on build: this text is a template and should be reviewed by the owner (and, where needed, a legal adviser) before launch.</p></div>`)}
    `,
  });

  const privacy = legalPage('privacy-policy', 'Privacy Policy', `
    <p>This policy explains what happens to the information you share with ${esc(c.business.name)} through this website.</p>
    <h2>What we collect</h2>
    <p>When you submit the contact form we collect your name, phone number, optional email, area, the service details you provide and any photo you attach. If you call or message us, we keep the contact details and job notes needed to help you.</p>
    <h2>How we use it</h2>
    <p>Only to respond to your enquiry, arrange and carry out work, and keep a basic record of the job. We do not sell your information or share it with third parties for marketing.</p>
    <h2>Analytics</h2>
    <p>${c.site.gaMeasurementId ? 'This site uses privacy-respecting website analytics to understand how pages are used. See the Cookie Policy for details and choices.' : 'This site currently uses no third-party analytics or advertising trackers. If that changes, this policy and the Cookie Policy will be updated.'}</p>
    <h2>Retention</h2>
    <p>Enquiry and job records are kept only as long as needed for the work, follow-up and normal business record-keeping.</p>
    <h2>Your choices</h2>
    <p>You can ask us what we hold about you, ask us to correct it, or ask us to delete it where we are not required to keep it. Contact <a href="${mailHref()}">${esc(c.contact.email)}</a>.</p>
    <h2>Security</h2>
    <p>The site is served over HTTPS. Form submissions are protected against automated spam. We take reasonable steps to protect the information you give us.</p>
  `);

  const terms = legalPage('terms', 'Terms of Use', `
    <p>By using this website you agree to the following.</p>
    <h2>Information on this site</h2>
    <p>Content is provided for general information about our services. Descriptions of work, availability and pricing are indicative and confirmed directly with you before any job. Nothing here is a binding quote or a guaranteed response time.</p>
    <h2>Contacting us</h2>
    <p>Sending an enquiry does not create a contract. A booking is confirmed only when we agree the work with you directly.</p>
    <h2>Work and liability</h2>
    <p>Work is carried out with reasonable skill and care. Any warranty or workmanship terms are those stated to you for your specific job. We are not liable for issues arising from pre-existing faults, unauthorised changes, or work carried out by others.</p>
    <h2>External links</h2>
    <p>Links to other sites (such as social media or a review platform) are provided for convenience. We are not responsible for their content.</p>
    <h2>Changes</h2>
    <p>We may update these terms and the site content at any time.</p>
  `);

  const cookies = legalPage('cookie-policy', 'Cookie Policy', `
    <p>Cookies are small files a website can store in your browser.</p>
    <h2>What this site uses</h2>
    <p>${c.site.gaMeasurementId
      ? 'This site uses analytics cookies to measure page usage in aggregate. These are only set with your consent where required, and you can decline them without losing access to any part of the site.'
      : 'This site does not currently set analytics or advertising cookies. Your browser may store minimal technical data needed to display the pages. If analytics is added later, this policy will be updated and consent requested where required.'}</p>
    <h2>Managing cookies</h2>
    <p>You can block or delete cookies in your browser settings. Doing so does not affect your ability to call, message or email us.</p>
  `);

  /* ============================================================== 404 ===== */
  const notFound = {
    slug: '404',
    title: 'Page not found | ' + c.business.shortName,
    description: 'The page you were looking for could not be found.',
    noindex: true,
    main: `
      ${pageHero('404', 'Page not found',
        'The page you were looking for has moved or no longer exists.')}
      ${section(`
        <p class="lead">Try one of these instead:</p>
        <ul class="chips chips--lg" role="list">
          <li><a href="/">Home</a></li>
          <li><a href="${pagePath('services')}">Services</a></li>
          <li><a href="${pagePath('emergency-maintenance')}">Emergency help</a></li>
          <li><a href="${pagePath('contact')}">Contact</a></li>
        </ul>
        <div class="phero__actions">${callBtn('primary', `Call ${c.contact.phonePrimaryDisplay}`)} ${waBtn('whatsapp', 'WhatsApp us')}</div>
      `)}
    `,
  };

  return [
    home, servicesHub, plumbing, electrical, pumps, heaters, emergency, commercial,
    about, projects, serviceAreas, faqs, contact, privacy, terms, cookies, notFound,
  ];
}
