/* ============================================================
   ComptaChef — Bandeau de consentement cookies (Consent Mode v2)
   Conforme CNIL : refus aussi simple que l'acceptation,
   aucun cookie publicitaire déposé avant consentement.
   Le choix est conservé 6 mois dans le navigateur (localStorage).
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'cc-consent-v1';
  var SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;

  function readChoice() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || !c.ts || (Date.now() - c.ts) > SIX_MONTHS) return null;
      return c;
    } catch (e) { return null; }
  }

  function saveChoice(status) {
    try { localStorage.setItem(KEY, JSON.stringify({ status: status, ts: Date.now() })); } catch (e) {}
  }

  function applyConsent(status) {
    var v = status === 'granted' ? 'granted' : 'denied';
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: v,
        ad_user_data: v,
        ad_personalization: v,
        analytics_storage: v
      });
    }
  }

  var banner = null;

  function closeBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function decide(status) {
    saveChoice(status);
    applyConsent(status);
    closeBanner();
  }

  function showBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.id = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Gestion des cookies');
    banner.innerHTML =
      '<style>' +
      '#cc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:460px;' +
      'margin-inline:auto;background:var(--fond-clair,#fff);color:var(--navy,#2D3282);' +
      'border:1px solid var(--bord-clair,rgba(45,50,130,.18));border-radius:var(--radius,18px);' +
      'box-shadow:0 12px 40px rgba(7,11,34,.18);padding:20px;' +
      "font-family:'Nunito','Outfit',system-ui,sans-serif;font-size:14.5px;line-height:1.5;}" +
      '@media (prefers-color-scheme:dark){#cc-banner{background:#0B1033;color:#E9EBFF;border-color:rgba(122,134,255,.25);}}' +
      '#cc-banner h2{margin:0 0 6px;font-size:16px;font-family:inherit;font-weight:800;}' +
      '#cc-banner p{margin:0 0 14px;}' +
      '#cc-banner a{color:var(--bleu-neon,#5B6CFF);text-decoration:underline;}' +
      '#cc-banner .cc-actions{display:flex;gap:10px;flex-wrap:wrap;}' +
      '#cc-banner button{flex:1 1 120px;cursor:pointer;border-radius:999px;padding:10px 16px;' +
      'font:inherit;font-weight:700;border:1.5px solid var(--navy,#2D3282);}' +
      '@media (prefers-color-scheme:dark){#cc-banner button{border-color:#E9EBFF;}}' +
      '#cc-accept{background:var(--navy,#2D3282);color:#fff;}' +
      '@media (prefers-color-scheme:dark){#cc-accept{background:#5B6CFF;border-color:#5B6CFF;}}' +
      '#cc-refuse{background:transparent;color:inherit;}' +
      '</style>' +
      '<h2>Cookies & mesure</h2>' +
      '<p>Nous utilisons des cookies pour mesurer l’efficacité de nos campagnes publicitaires ' +
      '(Google Ads). Vous pouvez accepter ou refuser librement — votre choix n’affecte pas ' +
      'la navigation. <a href="/confidentialite.html#cookies">En savoir plus</a></p>' +
      '<div class="cc-actions">' +
      '<button type="button" id="cc-refuse">Refuser</button>' +
      '<button type="button" id="cc-accept">Accepter</button>' +
      '</div>';
    document.body.appendChild(banner);
    document.getElementById('cc-accept').addEventListener('click', function () { decide('granted'); });
    document.getElementById('cc-refuse').addEventListener('click', function () { decide('denied'); });
  }

  // Lien "gérer mes cookies" (politique de confidentialité, pied de page…)
  window.ccOpen = function () { closeBanner(); showBanner(); return false; };

  function init() {
    var choice = readChoice();
    if (!choice) { showBanner(); }
    // Si un choix "granted" existe, il a déjà été appliqué dans le <head> avant GTM.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
