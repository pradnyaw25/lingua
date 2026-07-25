# Lingua — Parallel Reading & Frequency Words

A tiny, dependency-free static site for learning **French** and **Spanish** through
side-by-side parallel texts and the most common words in each language.

Built for personal use. No build step, no server required — just open the files.

## Features

- **Parallel reader** — target language and English side by side, sentence-aligned.
  Hover a sentence to highlight both sides in sync; click to pin it while you study.
  Toggles: swap sides, hide English (self-test mode), font size.
- **Frequency words** — the most common words per language with English + part of speech.
  Search/filter, and mark words as **known** (saved in your browser's `localStorage`).

## Run it

Just open `index.html` in a browser — double-click it, or:

```bash
open index.html            # macOS
```

Everything loads from local `.js` files (no `fetch`), so it works from `file://`
with no dev server. If you'd rather serve it (nicer URLs, closer to hosting):

```bash
python3 -m http.server 8000    # then visit http://localhost:8000
```

## Project layout

```
lingua/
  index.html        Library — lists all texts
  reader.html       Parallel reader
  vocab.html        Frequency-word tables
  css/style.css     All styling (light + dark, print-friendly serif)
  js/app.js         Shared nav + tiny DOM helper
  js/reader.js      Reader logic (alignment, synced highlight, toolbar)
  js/vocab.js       Vocab table, search, "known" tracking
  data/texts.js     window.TEXTS — the parallel texts
  data/vocab.js     window.VOCAB — the frequency word lists
```

## Adding a text

Edit `data/texts.js` and append an object. The only rule that matters:
**`pairs` must be 1:1** — sentence `target[i]` lines up with `en[i]`.

```js
{
  id: "fr-my-story",          // unique, used in the URL (?id=...)
  lang: "fr",
  langLabel: "Français",
  title: "Mon histoire",
  source: "…public domain / your own text…",
  level: "A2",
  pairs: [
    { target: "Première phrase.", en: "First sentence." },
    { target: "Deuxième phrase.", en: "Second sentence." }
  ]
}
```

**Copyright note:** stick to public-domain works (Aesop, folk tales, older texts) or
your own writing. Avoid most 20th-century books — e.g. *Le Petit Prince* is still under
copyright in the US.

## Growing the word lists toward 1,000

`data/vocab.js` ships a curated seed (~70 words per language). Append more objects:

```js
{ rank: 71, word: "monde", en: "world", pos: "noun" }
```

Keep them roughly frequency-ordered and **verify translations** before adding.
Good open sources for frequency data: OpenSubtitles frequency lists, Tatoeba (CC-BY).

## Ideas for later

- Click a single **word** → pop its dictionary translation.
- **Flashcard mode** over the frequency lists.
- Reading progress per text; audio for each sentence.
- Auto-aligner script to turn a plain bilingual text file into `pairs`.
