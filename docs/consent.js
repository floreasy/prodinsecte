/* Prod'Insectes — bannière de consentement (Google Consent Mode v2).
   Tant que l'utilisateur n'a pas choisi, analytics_storage reste « denied »
   (déclaré dans le <head> de chaque page). Le choix est mémorisé en localStorage.
   Le lien « Gérer les cookies » (footer) permet de revenir sur son choix à tout moment. */
(function () {
  var KEY = 'prodinsectes-consent';

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function gtagSafe() {
    window.dataLayer = window.dataLayer || [];
    return window.gtag || function () { window.dataLayer.push(arguments); };
  }

  function build() {
    if (document.querySelector('.cookie-banner')) return; // déjà ouverte
    var bar = document.createElement('div');
    bar.className = 'cookie-banner';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Consentement aux cookies de mesure d’audience');
    bar.innerHTML =
      '<p class="cookie-text">Nous utilisons des cookies de <strong>mesure d’audience</strong> ' +
      '(Google Analytics) pour comprendre la fréquentation du site et l’améliorer. ' +
      'Aucune mesure n’est effectuée sans votre accord.</p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn btn-outline" data-consent="deny">Refuser</button>' +
      '<button type="button" class="btn btn-primary" data-consent="accept">Accepter</button>' +
      '</div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add('in'); });

    bar.addEventListener('click', function (e) {
      var t = e.target.closest('[data-consent]');
      if (!t) return;
      var accepted = t.getAttribute('data-consent') === 'accept';
      write(accepted ? 'granted' : 'denied');
      gtagSafe()('consent', 'update', {
        'analytics_storage': accepted ? 'granted' : 'denied'
      });
      bar.classList.remove('in');
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 350);
    });
  }

  // Lien « Gérer les cookies » présent dans le footer de chaque page.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-cookie-settings]');
    if (!link) return;
    e.preventDefault();
    build();
  });

  // Première visite (aucun choix mémorisé) → on affiche la bannière.
  if (!read()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', build);
    } else {
      build();
    }
  }
})();
