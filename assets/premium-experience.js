(() => {
  'use strict';
  if (window.__CS_PREMIUM_EXPERIENCE__) return;
  window.__CS_PREMIUM_EXPERIENCE__ = true;

  const root = document.documentElement;
  root.classList.add('cs-page-enter');
  const ready = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove('cs-page-enter');
      root.classList.add('cs-page-ready');
    }));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once:true}); else ready();
  window.addEventListener('pageshow', () => root.classList.remove('cs-page-leaving'));

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const plannerPages = new Set([
    'planner-dashboard.html','app.html','settings.html','onboarding.html','getting-started.html','event-workspace.html','event-workspace.html',
    'crm.html','calendar.html','documents.html','inventory.html','inventory-admin.html','guests.html','communications.html',
    'financials.html','proposals.html','questionnaires.html','approvals.html','team.html','support.html','commerce.html'
  ]);
  const eventScopedPages = new Set([
    'event-workspace.html','event-workspace.html','event-day.html','event-day-command.html','event-closeout.html','event-book.html',
    'event-inventory.html','inventory-event-sheet.html','floorplan.html','inspiration.html','guests.html','guests-admin.html',
    'guest-checkin.html','documents.html','appointments.html','questionnaires.html','approvals.html','change-orders.html','financials.html'
  ]);
  const contextKeys = ['event_id','event','id','tenant','tenant_id','client_id','booking_reference','ref'];
  const current = new URLSearchParams(location.search);

  function enhanceContextLinks() {
    document.querySelectorAll('a[href]').forEach((a) => {
      const raw = a.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(mailto:|tel:|sms:|javascript:|data:)/i.test(raw)) return;
      let u;
      try { u = new URL(raw, location.href); } catch { return; }
      if (u.origin !== location.origin) return;
      const targetPage = (u.pathname.split('/').pop() || '').toLowerCase();
      if (!eventScopedPages.has(targetPage)) return;
      let changed = false;
      contextKeys.forEach((key) => {
        if (!u.searchParams.has(key) && current.has(key)) {
          u.searchParams.set(key, current.get(key));
          changed = true;
        }
      });
      if (changed) a.setAttribute('href', u.pathname + u.search + u.hash);
    });
  }

  function safeMessage(value, fallback = 'We could not complete that action. Please refresh and try again.') {
    const raw = typeof value === 'string' ? value : (value && (value.message || value.error || value.details)) || '';
    const text = String(raw || '');
    if (!text) return fallback;
    if (/\{\s*"?(code|details|hint|message)"?\s*:/i.test(text) || /column\s+[\w.]+\s+does not exist/i.test(text) || /postgres|supabase|sqlstate|stack trace/i.test(text)) return fallback;
    return text.length > 280 ? fallback : text;
  }
  window.CelebrationSuiteSafeError = safeMessage;

  function sanitizeVisibleErrors(rootNode = document) {
    const candidates = rootNode.querySelectorAll ? rootNode.querySelectorAll('[role="alert"], .toast, .error, .alert, .snackbar, [data-error]') : [];
    candidates.forEach((el) => {
      const before = (el.textContent || '').trim();
      const after = safeMessage(before, 'Something did not load correctly. Refresh the page or try again.');
      if (before && after !== before) {
        el.textContent = after;
        el.classList.add('cs-safe-error');
      }
    });
  }

  const professionalTargets = new Set([
    'accounting.html','analytics.html','audit.html','automations.html','backup.html','business-analytics.html','custom-domains.html',
    'integration-center.html','integration-health.html','integrations-admin.html','quickbooks-admin.html','reconciliation.html','referrals.html',
    'staff-operations.html','time-tracking.html','vendor-operations.html','vendor-quotes.html','vendor-reviews.html','purchasing.html',
    'commercial-admin.html','platform-admin.html','launch-readiness.html','system-health.html'
  ]);
  const modeKey = 'celebration_suite_experience_mode';
  let mode = localStorage.getItem(modeKey) || 'professional';
  if (!['diy','professional'].includes(mode)) mode = 'professional';
  root.dataset.csAudience = mode;

  function markProfessionalLinks() {
    document.querySelectorAll('a[href]').forEach((a) => {
      let target = '';
      try { target = new URL(a.getAttribute('href'), location.href).pathname.split('/').pop().toLowerCase(); } catch { return; }
      if (professionalTargets.has(target)) a.classList.add('cs-pro-only');
    });
  }

  function updateMode(next) {
    mode = next === 'diy' ? 'diy' : 'professional';
    localStorage.setItem(modeKey, mode);
    root.dataset.csAudience = mode;
    root.dataset.csShowPro = 'false';
    document.querySelectorAll('[data-cs-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.csMode === mode)));
    const hint = document.querySelector('.cs-experience-hint');
    if (hint) hint.textContent = mode === 'diy'
      ? 'Guided essentials are shown. Professional tools remain available whenever you need them.'
      : 'All agency, team, financial, automation, and integration tools are visible.';
  }

  function mountExperienceSwitcher() {
    if (!plannerPages.has(page) || document.querySelector('.cs-experience-switcher')) return;
    const host = document.querySelector('[data-cs-experience-mount], main, .main, .content, body');
    if (!host) return;
    const box = document.createElement('section');
    box.className = 'cs-experience-switcher';
    box.setAttribute('aria-label', 'Planning experience');
    box.innerHTML = '<span class="cs-mode-label">Workspace:</span>' +
      '<button type="button" data-cs-mode="diy">DIY Party Planner</button>' +
      '<button type="button" data-cs-mode="professional">Professional Planner</button>' +
      '<button type="button" class="cs-show-pro-tools">Show professional tools</button>' +
      '<p class="cs-experience-hint"></p>';
    if (host === document.body) host.insertBefore(box, host.firstChild); else host.insertBefore(box, host.firstChild);
    box.querySelectorAll('[data-cs-mode]').forEach((b) => b.addEventListener('click', () => updateMode(b.dataset.csMode)));
    box.querySelector('.cs-show-pro-tools').addEventListener('click', () => {
      root.dataset.csShowPro = root.dataset.csShowPro === 'true' ? 'false' : 'true';
    });
    updateMode(mode);
  }

  function init() {
    enhanceContextLinks();
    markProfessionalLinks();
    mountExperienceSwitcher();
    sanitizeVisibleErrors();
    const observer = new MutationObserver((records) => {
      records.forEach((r) => r.addedNodes.forEach((n) => { if (n.nodeType === 1) sanitizeVisibleErrors(n); }));
      enhanceContextLinks();
      markProfessionalLinks();
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();

  document.addEventListener('click', (event) => {
    const a = event.target.closest && event.target.closest('a[href]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (a.target && a.target !== '_self' || a.hasAttribute('download')) return;
    let u;
    try { u = new URL(a.href, location.href); } catch { return; }
    if (u.origin !== location.origin || u.href === location.href || u.hash && u.pathname === location.pathname && u.search === location.search) return;
    root.classList.add('cs-page-leaving');
  }, true);
})();
