/* Celebration Suite Google connection compatibility helper */
(() => {
  'use strict';
  if (window.__CS_GOOGLE_UI__) return;
  window.__CS_GOOGLE_UI__ = true;
  const showResult = () => {
    const q = new URLSearchParams(location.search);
    const state = q.get('google');
    if (!state) return;
    const message = state === 'connected'
      ? 'Google Calendar connected successfully.'
      : (q.get('message') || 'Google Calendar connection needs attention.');
    const host = document.querySelector('#googleStatus,#googleDiagnostics,.google-status,[data-google-status]');
    if (host && !host.dataset.queryHandled) {
      host.dataset.queryHandled = '1';
      if (state === 'connected') host.classList.add('good'); else host.classList.add('warn');
      if (!host.textContent.trim() || /checking|not connected/i.test(host.textContent)) host.textContent = message;
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showResult, {once:true}); else showResult();
})();
