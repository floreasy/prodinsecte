/**
 * Rapatrie les polices Google en local et génère docs/fonts.css.
 *
 * Pourquoi
 * --------
 * Charger les polices depuis Google coûte deux domaines tiers :
 * fonts.googleapis.com pour la feuille — qui bloque le rendu — et
 * fonts.gstatic.com pour les fichiers. Chacun impose une résolution DNS et une
 * négociation TLS avant le premier caractère affiché.
 *
 * Sur pascalantonio.fr, cette seule opération a fait passer le score PageSpeed
 * mobile de 90 à 99 et le premier affichage de 2,74 s à 1,38 s.
 *
 * Ce qu'on ne prend pas
 * ---------------------
 * La feuille demandait six familles ; site.css n'en utilise que deux, Archivo
 * et Karla. Les quatre autres appartiennent aux appariements alternatifs de
 * theme-boot.js, que plus rien ne permet de sélectionner depuis la disparition
 * du panneau theme.jsx. Si ce panneau revient, il faudra les réintégrer ici.
 *
 * Licences : SIL Open Font License et Apache 2.0, qui autorisent explicitement
 * l'auto-hébergement.
 *
 * Usage :  node scripts/polices.mjs
 * Les fichiers produits sont versionnés — Coolify ne construit rien.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..", "docs");

const FEUILLE =
  "https://fonts.googleapis.com/css2" +
  "?family=Archivo:wght@500;700;900" +
  "&family=Karla:wght@400;500;700&display=swap";

// Un site en français n'a besoin que de ces deux sous-ensembles.
const SOUS_ENSEMBLES = new Set(["latin", "latin-ext"]);

// Sans UA moderne, Google renvoie du ttf au lieu du woff2.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const css = await (await fetch(FEUILLE, { headers: { "User-Agent": UA } })).text();
mkdirSync(join(WEB, "fonts"), { recursive: true });

const blocs = [...css.matchAll(/\/\*\s*([a-z0-9-]+)\s*\*\/\s*@font-face\s*\{(.*?)\}/gs)];
const sortie = [
  "/* Polices auto-hébergées — généré par scripts/polices.mjs, ne pas éditer à la main. */",
  "",
];
let gardes = 0,
  octets = 0;

for (const [, sousEnsemble, corps] of blocs) {
  if (!SOUS_ENSEMBLES.has(sousEnsemble)) continue;

  const famille = /font-family:\s*'([^']+)'/.exec(corps)[1];
  const style = /font-style:\s*(\w+)/.exec(corps)[1];
  const poids = /font-weight:\s*(\d+)/.exec(corps)[1];
  const url = /src:\s*url\(([^)]+)\)/.exec(corps)[1];
  const plage = /unicode-range:\s*([^;]+);/.exec(corps)[1].trim();

  const nom =
    `${famille.toLowerCase().replace(/\s+/g, "-")}-${poids}` +
    `${style === "italic" ? "-italic" : ""}-${sousEnsemble}.woff2`;

  const donnees = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(join(WEB, "fonts", nom), donnees);
  octets += donnees.length;
  gardes++;

  sortie.push(
    "@font-face {",
    `  font-family: '${famille}';`,
    `  font-style: ${style};`,
    `  font-weight: ${poids};`,
    "  font-display: swap;",
    `  src: url('fonts/${nom}') format('woff2');`,
    `  unicode-range: ${plage};`,
    "}",
    ""
  );
  console.log(`  ${nom.padEnd(36)} ${String(Math.round(donnees.length / 1024)).padStart(3)} Ko`);
}

writeFileSync(join(WEB, "fonts.css"), sortie.join("\n"), "utf8");
console.log(`→ ${gardes} fichier(s), ${Math.round(octets / 1024)} Ko`);
