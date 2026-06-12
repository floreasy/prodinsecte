/* Prod'Insectes — application du thème (palette / typo / texture / densité)
   Chargé en tête de chaque page AVANT le rendu pour éviter tout flash.
   Le panneau Tweaks (theme.jsx) réutilise ces définitions. */
window.PROD_THEME = (function () {
  var PALETTES = {
    "Kraft naturel": {
      swatches: ["#E8DBBD", "#2A2014", "#5F7C47", "#C0712C"],
      vars: {
        "--kraft": "#E8DBBD", "--kraft-2": "#DECDA6", "--paper": "#F7F1E1",
        "--ink": "#2A2014", "--ink-soft": "#5A4A33",
        "--green": "#5F7C47", "--green-deep": "#3E5530",
        "--ocre": "#C0712C", "--ocre-deep": "#9A5417"
      }
    },
    "Vert végétal": {
      swatches: ["#E0DDC6", "#232618", "#55763F", "#C9913C"],
      vars: {
        "--kraft": "#E0DDC6", "--kraft-2": "#D2CFAF", "--paper": "#F3F2E4",
        "--ink": "#232618", "--ink-soft": "#4D5239",
        "--green": "#55763F", "--green-deep": "#324726",
        "--ocre": "#C9913C", "--ocre-deep": "#A06F22"
      }
    },
    "Ocre chaud": {
      swatches: ["#EBD9B4", "#2E1F10", "#6E7E48", "#C2581F"],
      vars: {
        "--kraft": "#EBD9B4", "--kraft-2": "#E1C795", "--paper": "#F8EFDB",
        "--ink": "#2E1F10", "--ink-soft": "#614B2E",
        "--green": "#6E7E48", "--green-deep": "#4A5A2E",
        "--ocre": "#C2581F", "--ocre-deep": "#98400F"
      }
    }
  };

  var FONTS = {
    "Archivo + Karla": { head: "'Archivo', sans-serif", body: "'Karla', sans-serif" },
    "Bricolage + Source Sans": { head: "'Bricolage Grotesque', sans-serif", body: "'Source Sans 3', sans-serif" },
    "Space Grotesk + Work Sans": { head: "'Space Grotesk', sans-serif", body: "'Work Sans', sans-serif" }
  };

  var DEFAULTS = { palette: "Kraft naturel", fonts: "Archivo + Karla", texture: 35, density: 100 };
  var LS_KEY = "prodinsectes-theme";

  function saved() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(t) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        palette: t.palette, fonts: t.fonts, texture: t.texture, density: t.density
      }));
    } catch (e) {}
  }
  function current() {
    var s = saved(), out = {}, k;
    for (k in DEFAULTS) out[k] = (s[k] !== undefined ? s[k] : DEFAULTS[k]);
    return out;
  }
  function apply(t) {
    var root = document.documentElement;
    var p = PALETTES[t.palette] || PALETTES[DEFAULTS.palette];
    Object.keys(p.vars).forEach(function (k) { root.style.setProperty(k, p.vars[k]); });
    var f = FONTS[t.fonts] || FONTS[DEFAULTS.fonts];
    root.style.setProperty("--font-head", f.head);
    root.style.setProperty("--font-body", f.body);
    root.style.setProperty("--tex", String((t.texture != null ? t.texture : DEFAULTS.texture) / 100));
    root.style.setProperty("--sp", String((t.density != null ? t.density : DEFAULTS.density) / 100));
  }

  apply(current());

  return { PALETTES: PALETTES, FONTS: FONTS, DEFAULTS: DEFAULTS, apply: apply, saved: saved, save: save, current: current };
})();
