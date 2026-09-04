/* Plumbing Electric Maintenance Service — front-end behaviour
   Vanilla JS, no dependencies. Progressive enhancement only. */
(function () {
  'use strict';
  var d = document;

  /* ---------------------------------------------------- analytics events */
  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, params || {}));
    } catch (e) {}
  }
  d.addEventListener('click', function (e) {
    var el = e.target.closest('[data-analytics]');
    if (!el) return;
    track(el.getAttribute('data-analytics'), {
      location: el.getAttribute('data-analytics-location') || 'unknown',
      href: el.getAttribute('href') || ''
    });
  });

  /* ---------------------------------------------------- mobile navigation */
  var header = d.querySelector('[data-header]');
  var navToggle = d.querySelector('[data-nav-toggle]');
  if (header && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = header.getAttribute('data-open') === 'true';
      header.setAttribute('data-open', String(!open));
      navToggle.setAttribute('aria-expanded', String(!open));
    });
    // submenu toggles (mobile / keyboard)
    d.querySelectorAll('[data-sub-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var li = btn.closest('[data-sub]');
        var open = li.getAttribute('data-open') === 'true';
        li.setAttribute('data-open', String(!open));
        btn.setAttribute('aria-expanded', String(!open));
      });
    });
    // close on outside click / Escape
    d.addEventListener('click', function (e) {
      if (header.getAttribute('data-open') === 'true' && !e.target.closest('[data-header]')) {
        header.setAttribute('data-open', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.getAttribute('data-open') === 'true') {
        header.setAttribute('data-open', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ----------------------------------------------------- FAQ: one at a time */
  d.querySelectorAll('[data-faq]').forEach(function (group) {
    var items = group.querySelectorAll('details');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) {
          items.forEach(function (o) { if (o !== item) o.open = false; });
          track('faq_open', { question: (item.querySelector('summary') || {}).textContent });
        }
      });
    });
  });

  /* --------------------------------------------------------- contact form */
  var form = d.querySelector('[data-form]');
  if (form) {
    var statusEl = form.querySelector('[data-form-status]');
    var waFallback = form.querySelector('[data-wa-fallback]');
    var waBase = waFallback ? waFallback.getAttribute('href') : '';

    function setInvalid(field, on) {
      var wrap = field.closest('.field, .check');
      if (wrap) wrap.classList.toggle('invalid', on);
    }
    function validate() {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var valid = field.type === 'checkbox' ? field.checked : String(field.value).trim() !== '';
        if (field.type === 'email' && field.value) valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value);
        setInvalid(field, !valid);
        if (!valid && ok) { field.focus(); }
        if (!valid) ok = false;
      });
      return ok;
    }

    // keep the WhatsApp fallback message in sync with what the user typed
    function refreshWa() {
      if (!waBase) return;
      var area = (form.area && form.area.value.trim()) || '[area]';
      var svc = (form.service && form.service.value) || 'plumbing/electrical';
      var msg = (form.message && form.message.value.trim()) || '[describe issue]';
      var urg = (form.urgency && form.urgency.value) || '[urgent/not urgent]';
      var text = 'Hello, I need ' + svc.toLowerCase() + ' help in Doha. My issue is: ' + msg +
        '. My area is: ' + area + '. Urgency: ' + urg + '. I can share photos if needed.';
      waFallback.setAttribute('href', waBase.split('?')[0] + '?text=' + encodeURIComponent(text));
    }
    form.addEventListener('input', refreshWa);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (statusEl) { statusEl.hidden = true; statusEl.className = 'form__status'; }

      // honeypot
      if (form.botcheck && form.botcheck.value) return;
      if (!validate()) {
        if (statusEl) { statusEl.hidden = false; statusEl.classList.add('bad'); statusEl.textContent = 'Please complete the highlighted fields.'; }
        return;
      }

      var endpoint = form.getAttribute('action');
      var submitBtn = form.querySelector('button[type="submit"]');

      // No endpoint configured → hand off to WhatsApp / email
      if (!endpoint) {
        track('form_submit', { transport: 'whatsapp_fallback' });
        if (waFallback) { window.open(waFallback.getAttribute('href'), '_blank', 'noopener'); }
        if (statusEl) {
          statusEl.hidden = false; statusEl.classList.add('ok');
          statusEl.textContent = 'Opening WhatsApp so you can send your request. You can also call us directly.';
        }
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.label = submitBtn.textContent; submitBtn.textContent = 'Sending…'; }

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            track('form_submit', { transport: 'endpoint', status: 'success' });
            form.reset();
            if (statusEl) {
              statusEl.hidden = false; statusEl.classList.add('ok');
              statusEl.textContent = 'Thank you — your request has been sent. We will contact you shortly. For anything urgent, please call us.';
            }
          } else {
            throw new Error((res.j && res.j.message) || 'Request failed');
          }
        })
        .catch(function () {
          track('form_submit', { transport: 'endpoint', status: 'error' });
          if (statusEl) {
            statusEl.hidden = false; statusEl.classList.add('bad');
            statusEl.innerHTML = 'Sorry — the form could not be sent. Please call us or use the WhatsApp button above.';
          }
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label || 'Send request'; }
        });
    });
  }
})();
