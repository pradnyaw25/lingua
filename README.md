# Lingua — Parallel Reading & Frequency Words

A tiny, dependency-free static site for learning **French** and **Spanish** through
side-by-side parallel texts, the 1,000 most common words in each language, and flashcards.

Built for personal use. No build step, no framework, no server required — just open the files.

**Live:** [pradnya.dev/lingua](https://pradnya.dev/lingua/)

## Features

- **Parallel reader** — target language and English side by side, sentence-aligned.
  Hover a sentence to highlight both sides in sync; **tap any word in the target column
  for its meaning** (a popover fed by `data/dictionary.js`). Toggles: swap sides,
  hide English (self-test), font size.
- **Frequency words** — the 1,000 most common words per language with English + part of
  speech. Search/filter, quick-access **category chips** (Numbers, Questions, Adjectives,
  Verbs, Colors, Days, Months, Family, Greetings), and mark words **known**
  (saved in your browser's `localStorage`).
- **Flashcards** — study any set (the frequency list or a category) as a flip-card deck.
  Direction toggle, shuffle, keyboard shortcuts (`Space` flip, `←`/`→` grade). "Got it"
  can mark a card known — shared with the vocab table.
- **Library** — all texts grouped by language, filterable by **CEFR level** (A1–B2)
  *and* by **interest** (Fiction, Travel, Food, Science, Sports, …). Each card shows the
  target-language title with its English title, an interest tag, and a **New** badge on
  fresh topics.
- **About** — project blurb and links.

Everything is theme-aware (light + dark) and works on mobile.

## Run it

Just open `index.html` in a browser — double-click it, or:

```bash
open index.html            # macOS
```

All content loads from local `.js` files (no `fetch`), so it works from `file://`
with no dev server. To serve it instead (nicer URLs, closer to hosting):

```bash
python3 -m http.server 8000    # then visit http://localhost:8000
```

Hosted on GitHub Pages from the repo root — every push to `main` redeploys.

## Project layout

```
lingua/
  index.html         Library + CEFR level filter
  reader.html        Parallel reader (synced highlight, click-a-word)
  vocab.html         Frequency-word tables + category chips
  flashcards.html    Flashcard sessions
  about.html         About page
  css/style.css      All styling (light + dark, book-like serif)
  js/app.js          Shared nav + tiny DOM helper
  js/reader.js       Reader logic (tokenizer, popover, toolbar)
  js/vocab.js        Vocab table, categories, search, "known" tracking
  js/flashcards.js   Flashcard deck logic
  data/texts.js         window.TEXTS      — the parallel texts
  data/vocab.js         window.VOCAB      — the 1,000-word frequency lists
  data/categories.js    window.CATEGORIES — curated thematic word sets
  data/dictionary.js    window.DICT       — word → gloss for click-a-word
  scripts/fetch_data.sh        Download source data into scripts/.data/ (run once)
  scripts/regen.sh             Regenerate dictionary.js (and optionally vocab.js)
  scripts/build_vocab.py       Generate vocab.js from a frequency list + dictionary
  scripts/build_dictionary.py  Generate dictionary.js from texts + dictionary
  scripts/samples/             Supplements, gloss overrides, sample fixtures
```

## The texts

22 sentence-aligned texts (4 × A1, 12 × A2, 4 × B1, 2 × B2), all original or public domain:

- **Pixel, the cat who invested** — an original comedic serial (4 episodes, A2) in French
  and Spanish, mixing everyday life, travel, food, tech and finance.
- Standalone comedies — *The Voice Assistant* (A2), *Café* dialogues (A1) — and
  intermediate stories: *The Secret Recipe* (B1, food/family), *The Suitcase* (B1, mystery),
  *The App* (B2, satire).
- A few classic Aesop fables (A1–A2).

### Adding a text

Edit `data/texts.js` and append an object. The one rule that matters:
**`pairs` must be 1:1** — sentence `target[i]` lines up with `en[i]`.

```js
{
  id: "fr-my-story",          // unique, used in the URL (?id=...)
  lang: "fr",
  langLabel: "Français",
  title: "Mon histoire",
  source: "Original — Lingua",
  level: "A2",                // drives the library's level filter
  pairs: [
    { target: `Première phrase.`, en: `First sentence.` },
    { target: `Deuxième phrase.`, en: `Second sentence.` }
  ]
}
```

After adding a text, regenerate the dictionary so click-a-word covers its words:

```bash
bash scripts/fetch_data.sh   # once per machine — pulls frequency lists + dictionaries
bash scripts/regen.sh        # rebuilds data/dictionary.js
```

Then eyeball the new words for machine-translation mistakes and add a line to
`scripts/samples/overrides_<lang>.tsv` for any that are wrong; re-run `regen.sh`.

**Copyright note:** stick to public-domain works or your own writing. Avoid most
20th-century books — e.g. *Le Petit Prince* is still under copyright in the US.

## The word lists (1,000 per language)

`data/vocab.js` holds the **1,000 most-frequent words** in French and Spanish, each
`{ rank, word, en, pos }`, generated by `scripts/build_vocab.py` from a frequency list
plus a bilingual dictionary. Hand-edits to `en`/`pos` survive re-runs. Coverage is
**~92% FR / ~87% ES**; the rest (rare conjugations, inversions, OCR noise) show as blank
cells and are listed in the script's `data/missing_<lang>.txt` output.

`data/categories.js` holds the curated thematic sets shown as chips on the vocab page —
edit it to add or change a category; new chips appear automatically.

```bash
python3 scripts/build_vocab.py --lang fr \
    --freq fr_50k.txt --dict fra-eng.tsv --limit 1000
```

- `--freq` — a frequency list (`word`, `word<TAB>count`, or `rank,word`).
- `--dict` — a `headword<TAB>english[<TAB>pos]` dictionary. Multiple files concatenated,
  earlier entries win — this is how `scripts/samples/supplement*.tsv` override the machine
  dictionary for common function words it lacks.

## Click-a-word dictionary

`data/dictionary.js` is a compact `word → English` map that powers the reader's
click-a-word popover, generated by `scripts/build_dictionary.py`. It scans every text,
tokenizes each sentence the same way the reader does (splitting French elisions like
`l'`/`j'`/`qu'`), and looks each word up against the curated top-1000 plus a bilingual
dictionary. Machine-translation mistakes for words that appear in the texts are corrected
in `scripts/samples/overrides_<lang>.tsv` (highest priority).

```bash
python3 scripts/build_dictionary.py \
    --dict-fr fr-en.tsv --dict-es es-en.tsv \
    --override-fr scripts/samples/overrides_fr.tsv \
    --override-es scripts/samples/overrides_es.tsv
```

Run this whenever you add or edit a text.

## Auto-generated content

Content is generated from **`scripts/theme_ideas.txt`** — your editable list of topics
(one per line, `#` for comments). No live backend: a GitHub Actions job calls OpenAI and
commits static files, and `js/app.js` merges the results into the library.

**Batch (primary).** `scripts/generate_batch.py` generates a piece for each topic and
writes them all to `data/generated.js`. It's **incremental** — re-running only generates
topics you've *added* to the list and reuses the rest, so adding a few ideas is cheap.
Run it ad hoc from the Actions tab ("Generate library" → Run workflow), or locally:

```bash
OPENAI_API_KEY=sk-… python3 scripts/generate_batch.py     # new topics only
OPENAI_API_KEY=sk-… python3 scripts/generate_batch.py --force   # rebuild everything
python3 scripts/generate_batch.py --mock --limit 3        # offline smoke test
```

**Daily (paused).** `scripts/generate_daily.py` drips one piece per day into a rolling
window (`data/daily.js`). The cron in `.github/workflows/daily-content.yml` is commented
out — re-enable it if you'd rather drip daily than batch.

For each topic the model:
- picks the **format** that fits — a light *story* for everyday scenes, an *explainer* for
  how-things-work / history / science,
- writes it in French **and** Spanish, sentence-aligned 1:1 with English,
- at a CEFR level rotated across A2 / B1 / B2,
- and it's **validated** (alignment, length, a graphic-content screen); topics that fail are skipped.

Then `regen.sh` updates the click-a-word dictionary for the new words.

**To use it:** add an `OPENAI_API_KEY` repo secret (Settings → Secrets → Actions).

**Note:** generated texts skip the hand-QA the curated dictionary gets — their click-a-word
glosses come straight from the machine dictionary, so expect the occasional rough gloss.

## Data sources & credits

The generated word lists and dictionary derive from:

- **Frequency ranking** — [Hermit Dave's *FrequencyWords*](https://github.com/hermitdave/FrequencyWords)
  (OpenSubtitles, CC BY-SA 4.0).
- **Machine translations** — [Facebook *MUSE*](https://github.com/facebookresearch/MUSE)
  bilingual dictionaries (CC BY-NC 4.0 — **non-commercial**).
- Hand-written supplements/overrides and all texts are original or public-domain.

Because MUSE is non-commercial, keep this project non-commercial as long as those
translations are included. Attribution is retained here per those licenses.

## Ideas for later

- Audio (browser speech synthesis) to pronounce any word or sentence.
- A "needs review" flashcard queue that pulls only not-yet-known words.
- More episodes and higher-level texts; per-text reading progress.
- Auto-aligner script to turn a plain bilingual text file into `pairs`.
