# Jídelna – pracovní MVP

Lokální aplikace pro vedoucí školní jídelny. Umožňuje zapisovat rodičovské náměty, spojit je s recepturou, vložit návrh do měsíčního jídelníčku, zkontrolovat část pravidel skladby a připravit odpověď rodiči. Schválení i odeslání zůstává na člověku.

## Spuštění

```bash
npm install
npm run dev
```

Otevřete `http://localhost:3000`. Pro kontrolu projektu použijte `npm run check` a `npm run build`.

## Jak začít

1. V záložce **Jídelníček** upravte ukázkový měsíční plán. Výchozí položky jsou pracovní vzor inspirovaný dodanými jídelníčky, nikoli schválený plán skutečné jídelny.
2. V **Recepturách** doplňte složení a gramáže. Výchozí katalog obsahuje jen názvy a odhadované složky; žádná gramáž nebyla v podkladech.
3. V **Námětech rodičů** vložte větu, zvolte nebo vytvořte recepturu, prohlédněte vhodný termín a rozhodněte o vložení.
4. Připravte odpověď rodiči a případně ji zkopírujte. Aplikace nic neposílá.
5. Exportujte plán jako JSON. Stejný formát lze znovu načíst.

## Současný rozsah kontrol

Deterministicky se kontroluje bezmasá volba u výběrového oběda, četnost červeného masa v jednotlivých volbách a nabídka rybího pokrmu v dvoutýdenních úsecích. K příslušným nálezům aplikace uvádí důvod.

Měsíční spotřební koš, finanční limity, alergeny, provozní kapacita, počty porcí podle věku a režim flexibilních norem zatím **nejsou ověřovány**. Ani vyplnění gramáží samo o sobě není úplným podkladem pro koš: chybí přepočty na čistou hmotnost, koeficienty započtení, polévky, doplňky, skutečně vydané počty porcí a cena surovin. Rozhraní proto uvádí „nelze ověřit“ a nesmí se používat jako potvrzení právního souladu.

Data se ukládají do `localStorage` v daném prohlížeči. Není zde přihlášení, serverová databáze ani sdílení mezi uživateli. Před změnou měsíce exportujte rozpracovaný plán, protože aplikace uchovává vždy jeden otevřený měsíc.

Další implementační kroky jsou popsány ve specifikaci v `docs/Specifikace_aplikace_skolni_jidelna.docx`.
