# Honzíkův Dinopark

**Hrát online:** https://veselylab.github.io/honzikuv-dinopark/

Budovatelská hra v prohlížeči. Na ostrově postavíš vlastní dinopark, vylíhneš 16 druhů dinosaurů, přilákáš návštěvníky a dokupuješ nové pozemky, dokud nebude celý ostrov tvůj.

Hru vymyslel a testoval Honza, naprogramovaná je s pomocí AI Claude. Běží v každém moderním prohlížeči (Chrome, Edge, Firefox, Safari) i na Chromebooku, nic se neinstaluje.

## Jak hrát

1. Postav **výběh** a **líheň**.
2. Klikni na líheň, vyber vejce a pak klikni na **výběh, kam má dinosaurus jít**. Zelené výběhy jsou volné, červené ne.
3. Nakresli **cestu** od vchodu k výběhům. Návštěvníci chodí jen po cestách a za každý pohled na dinosaury platí.
4. Za mince kupuj další druhy, stromy a **nové pozemky**. Nástroj Pozemek kupuje zarostlé kusy ostrova vedle tvého parku.
5. Splň všech 10 úkolů vpravo nahoře.

**Pravidla parku**

- Masožravec smí bydlet jen s dinosaury svého druhu. S býložravci by je snědl.
- Obři (Brachiosaurus a Diplodocus) se vejdou jen do velkého výběhu 5 × 5.
- Hvězdy hodnocení odemykají nové druhy. Poslední přijde Tyrannosaurus.
- Dinosaura můžeš kdykoli přestěhovat: klikni na něj a zvol „Přestěhovat do jiného výběhu“.

**Ovládání**

| Co | Jak |
| --- | --- |
| Posun mapy | táhni myší s nástrojem Prohlížet, nebo šipky / W A S D |
| Přiblížení | kolečko myši, klávesy + a −, nebo tlačítka u minimapy |
| Nástroje | klávesy 1 až 8 |
| Zrušit výběr | Esc nebo pravé tlačítko myši |
| Přes vodu | nástroj Cesta postaví na vodě most |

## Ukládání

Hra se ukládá sama každých 10 sekund do prohlížeče. Když stránku zavřeš a znovu otevřeš, pokračuješ tam, kde jsi skončil.

V menu s disketou (vlevo dole) je:

- **Uložit teď**
- **Stáhnout zálohu**: uloží hru do souboru, který přeneseš na jiný počítač nebo schováš
- **Nahrát zálohu**: vrátí hru ze souboru
- **Začít novou hru**

Uložená hra patří jednomu prohlížeči na jednom počítači. Když hraješ jinde, přenes si ji zálohou.

## Jak hru dát na internet přes GitHub Pages

1. Přihlas se na [github.com](https://github.com) (účet je zdarma).
2. Vpravo nahoře klikni na **+** a pak **New repository**.
3. Jako název napiš třeba `dinopark`, nech zvolené **Public** a klikni **Create repository**.
4. Na stránce nového repozitáře klikni na odkaz **uploading an existing file**.
5. Přetáhni do okna **všechno ze složky `honzikuv-dinopark`**: soubory `index.html`, `favicon.svg`, `README.md` a složky `css` a `js`. Nahrávej rozbalené soubory, ne zip.
6. Dole klikni **Commit changes**.
7. Otevři **Settings**, v levém menu **Pages**. U položky *Source* vyber **Deploy from a branch**, u *Branch* vyber **main** a složku **/ (root)** a klikni **Save**.
8. Asi za minutu až dvě je hra na adrese `https://TVOJE-JMENO.github.io/dinopark/`. Přesnou adresu ukáže stránka Pages nahoře.

Když později něco změníš, stačí nahrát změněné soubory znovu stejným způsobem. Web se sám aktualizuje.

## Co je v jakém souboru

| Soubor | Co dělá |
| --- | --- |
| `index.html` | stránka hry: nápisy, tlačítka, okna |
| `css/style.css` | vzhled: barvy, písma, rozložení |
| `js/dinosauri.js` | kreslení všech dinosaurů (každý druh je popsaný čísly: tvar těla, hlava, barvy, ozdoby) |
| `js/hra.js` | pravidla a průběh hry: ostrov, stavění, líheň, návštěvníci, úkoly, ukládání |
| `favicon.svg` | ikonka v záložce prohlížeče |

**Jak přidat nový druh:** v `js/dinosauri.js` přidej druh do seznamu `SPECIES` (nejsnáz zkopírováním podobného druhu a změnou barev a tvaru) a v `js/hra.js` ho přidej do seznamu `CATALOG` s cenou, časem líhnutí, počtem hvězd a zajímavostí.

## Poznámky

- Písma se načítají z Google Fonts. Bez internetu hra funguje taky, jen s obyčejným písmem.
- Všechny obrázky kreslí kód přímo v prohlížeči, hra nepoužívá žádné stažené obrázky.
