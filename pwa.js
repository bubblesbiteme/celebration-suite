/* Celebration Suite compatibility PWA runtime */
(() => {
  'use strict';
  if (window.__CS_PWA_RUNTIME__) return;
  window.__CS_PWA_RUNTIME__ = true;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}), {once:true});
  }
  let promptEvent = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    promptEvent = event;
    document.documentElement.dataset.installable = '1';
    window.dispatchEvent(new CustomEvent('celebration:installable'));
  });
  window.CSInstallApp = window.CSInstallApp || (async () => {
    if (!promptEvent) return false;
    promptEvent.prompt();
    await promptEvent.userChoice.catch(() => null);
    promptEvent = null;
    document.documentElement.dataset.installable = '0';
    return true;
  });
})();
