/* Prod'Insectes — comportements partagés : reveal au scroll, jauges, nav mobile */
(function () {
  // Menu mobile
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
  }

  // Diaporama du hero (Accueil)
  var heroSlides = document.querySelectorAll('.hero-slides img');
  if (heroSlides.length > 1) {
    var si = 0;
    setInterval(function () {
      heroSlides[si].classList.remove('active');
      si = (si + 1) % heroSlides.length;
      heroSlides[si].classList.add('active');
    }, 4500);
  }

  // Économie circulaire — roue interactive : cliquer une étape (ou un point)
  // affiche son détail dans le panneau. Sur mobile, le panneau passe sous la roue.
  // Amélioration progressive : sans JS, toutes les étapes restent visibles (empilées).
  Array.prototype.forEach.call(document.querySelectorAll('.cycle-interactive'), function (ci) {
    var panel = ci.querySelector('.cycle-panel');
    if (!panel) return;
    var nodes = ci.querySelectorAll('.cycle-node');
    var slides = panel.querySelectorAll('.cp-slide');
    var dots = panel.querySelectorAll('.cp-dot');
    panel.classList.add('is-enhanced');

    function activate(step) {
      step = String(step);
      Array.prototype.forEach.call(nodes, function (n) {
        var on = n.getAttribute('data-step') === step;
        n.classList.toggle('is-active', on);
        n.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      Array.prototype.forEach.call(slides, function (s) {
        s.classList.toggle('is-active', s.getAttribute('data-step') === step);
      });
      Array.prototype.forEach.call(dots, function (d) {
        d.classList.toggle('is-active', d.getAttribute('data-step') === step);
      });
    }

    Array.prototype.forEach.call(nodes, function (n) {
      n.addEventListener('click', function () { activate(n.getAttribute('data-step')); });
    });
    Array.prototype.forEach.call(dots, function (d) {
      d.addEventListener('click', function () { activate(d.getAttribute('data-step')); });
    });
  });

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Détection des transitions CSS gelées (certains environnements d'aperçu) :
  // un élément-test anime son opacité ; si rien n'a bougé après 800 ms,
  // on désactive toutes les transitions via html.no-anim.
  (function detectFrozenTransitions() {
    var t = document.createElement('div');
    t.style.cssText = 'position:absolute;left:-9999px;top:0;width:10px;height:10px;opacity:0;transition:opacity 0.25s linear;pointer-events:none;';
    document.body.appendChild(t);
    void getComputedStyle(t).opacity;
    setTimeout(function () { t.style.opacity = '1'; }, 60);
    setTimeout(function () {
      if (parseFloat(getComputedStyle(t).opacity) < 0.9) {
        document.documentElement.classList.add('no-anim');
      }
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 900);
  })();

  function fillGauges(el, instant) {
    el.querySelectorAll('.g-fill').forEach(function (f) {
      if (instant) f.style.transition = 'none';
      f.style.width = (f.getAttribute('data-w') || '0') + '%';
    });
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal, .cycle'));
  var gauges = Array.prototype.slice.call(document.querySelectorAll('.gauges'));

  if (reduced) {
    reveals.forEach(function (el) { el.classList.add('in'); });
    gauges.forEach(function (el) { fillGauges(el, true); });
    return;
  }

  // Révélation basée sur getBoundingClientRect — fiable partout (l'IO peut ne
  // jamais se déclencher dans certains iframes). Throttlé via requestAnimationFrame.
  function inView(el, margin) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh - (margin || 60) && r.bottom > 0;
  }

  function check() {
    for (var i = reveals.length - 1; i >= 0; i--) {
      if (inView(reveals[i])) {
        reveals[i].classList.add('in');
        reveals.splice(i, 1);
      }
    }
    for (var j = gauges.length - 1; j >= 0; j--) {
      if (inView(gauges[j], 100)) {
        fillGauges(gauges[j], false);
        gauges.splice(j, 1);
      }
    }
    if (!reveals.length && !gauges.length) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }

  // Throttle temporel simple — pas de requestAnimationFrame (peut être gelé
  // dans certains iframes) : appel direct au plus toutes les 90 ms + débordement
  // différé pour capter la position finale du scroll.
  var last = 0;
  var trailing = null;
  function onScroll() {
    var now = Date.now();
    if (now - last > 90) {
      last = now;
      check();
    } else if (!trailing) {
      trailing = setTimeout(function () {
        trailing = null;
        last = Date.now();
        check();
      }, 110);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', check);
  check();
  // Filet de sécurité : re-vérifie après la mise en page initiale / chargement
  // des polices et images.
  setTimeout(check, 400);
  setTimeout(check, 1200);
})();
