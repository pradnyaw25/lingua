#!/usr/bin/env python3
"""
build_vocab.py — grow data/vocab.js from an open frequency list.

The site reads words from data/vocab.js (window.VOCAB). This dev-time tool ingests a
frequency list for one language and rewrites that file, up to --limit words, while:

  * PRESERVING every translation already in vocab.js (your hand-verified `en`/`pos`
    survive — matched by the word or any "/"-separated alias, e.g. "le / la" covers
    both "le" and "la");
  * filling `en`/`pos` for new words from an optional bilingual dictionary (--dict);
  * leaving `en`/`pos` empty for anything it can't translate, and writing those words
    to data/missing_<lang>.txt so you know exactly what to fill in by hand.

It never touches the other language's list.

--------------------------------------------------------------------------------
Frequency list (--freq), one word per line. Flexible about extra columns:
    le                      # just words
    le<TAB>9876543          # word + count
    1,le                    # rank,word  (auto-detects the numeric column)
    le,the,article          # word,en,pos  (use --en-col/--pos-col to read them)

Dictionary (--dict), tab- or comma-separated, headword first:
    le<TAB>the<TAB>article
    monde<TAB>world<TAB>noun

Good open sources (CC-licensed), verify before trusting:
  * FreeDict  fra-eng / spa-eng   https://freedict.org/
  * Wiktionary extracts (kaikki.org)
  * OpenSubtitles / Hermit Dave frequency lists (for --freq)
--------------------------------------------------------------------------------

Examples:
    # Preview to a temp file without touching the real vocab.js
    python3 scripts/build_vocab.py --lang fr --freq fr.txt --dict fra-eng.tsv \\
        --limit 1000 --out /tmp/vocab_preview.js

    # Update data/vocab.js in place
    python3 scripts/build_vocab.py --lang es --freq es.txt --dict spa-eng.tsv
"""

import argparse
import os
import re
import sys

LANG_LABELS = {"fr": "Français", "es": "Español"}
HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_VOCAB = os.path.normpath(os.path.join(HERE, "..", "data", "vocab.js"))

# One word entry inside a words: [ ... ] array.
ENTRY_RE = re.compile(
    r'\{\s*rank:\s*\d+\s*,\s*word:\s*"((?:[^"\\]|\\.)*)"\s*,'
    r'\s*en:\s*"((?:[^"\\]|\\.)*)"\s*,\s*pos:\s*"((?:[^"\\]|\\.)*)"\s*\}'
)
# One language block: fr: { langLabel: "...", words: [ ... ] }
LANG_RE = re.compile(
    r'(\w+):\s*\{\s*langLabel:\s*"([^"]*)"\s*,\s*words:\s*\[(.*?)\]\s*\}',
    re.DOTALL,
)


def js_unescape(s):
    return s.replace('\\"', '"').replace("\\\\", "\\")


def js_escape(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def parse_vocab(path):
    """Return {lang: {"label": str, "words": [ {word, en, pos}, ... ]}}."""
    data = {}
    if not os.path.exists(path):
        return data
    src = open(path, encoding="utf-8").read()
    for lang, label, body in LANG_RE.findall(src):
        words = [
            {"word": js_unescape(w), "en": js_unescape(e), "pos": js_unescape(p)}
            for w, e, p in ENTRY_RE.findall(body)
        ]
        data[lang] = {"label": label, "words": words}
    return data


def aliases(word):
    """Lookup keys for an entry: the whole string plus each '/'-separated part."""
    keys = {word.strip().lower()}
    for part in word.split("/"):
        part = part.replace("…", " ").strip().lower()
        if part:
            keys.add(part)
    return keys


def read_freq(path, delimiter, word_col, en_col, pos_col):
    """Yield (word, en, pos) in file order; en/pos are '' unless columns given."""
    seen = set()
    out = []
    for raw in open(path, encoding="utf-8"):
        line = raw.rstrip("\n")
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if delimiter:
            fields = line.split(delimiter)
        else:
            fields = re.split(r"[\t,;]|\s{2,}|\s+", line.strip())
        fields = [f.strip() for f in fields if f.strip() != ""]
        if not fields:
            continue

        if word_col is not None:
            if word_col >= len(fields):
                continue
            word = fields[word_col]
        else:
            # Auto: skip a leading rank/count number, take the first word-like field.
            word = next((f for f in fields if not f.replace(".", "").isdigit()), None)
            if word is None:
                continue

        word = word.strip().lower()
        if not word or word in seen:
            continue
        seen.add(word)
        en = fields[en_col].strip() if en_col is not None and en_col < len(fields) else ""
        pos = fields[pos_col].strip() if pos_col is not None and pos_col < len(fields) else ""
        out.append((word, en, pos))
    return out


def read_dict(path):
    """headword(lowercased) -> (en, pos)."""
    d = {}
    if not path:
        return d
    for raw in open(path, encoding="utf-8"):
        line = raw.rstrip("\n")
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        fields = re.split(r"\t|,", line)
        fields = [f.strip() for f in fields]
        if len(fields) < 2 or not fields[0]:
            continue
        head = fields[0].lower()
        if head not in d:  # keep first (best) sense
            d[head] = (fields[1], fields[2] if len(fields) > 2 else "")
    return d


def render(vocab):
    """Serialize the whole {lang: {...}} structure back to a vocab.js file."""
    header = (
        "// Frequency vocabulary. Common words per language, ordered by frequency.\n"
        "// Generated / updated by scripts/build_vocab.py — but hand-edits to en/pos are\n"
        "// preserved on the next run. Empty en/pos means \"needs a translation\".\n"
        "window.VOCAB = {\n"
    )
    lang_blocks = []
    for lang, info in vocab.items():
        lines = [f"  {lang}: {{", f'    langLabel: "{info["label"]}",', "    words: ["]
        for i, w in enumerate(info["words"], start=1):
            lines.append(
                f'      {{ rank: {i}, word: "{js_escape(w["word"])}", '
                f'en: "{js_escape(w["en"])}", pos: "{js_escape(w["pos"])}" }}'
            )
        # join entries with commas
        entries = ",\n".join(lines[3:]) if len(lines) > 3 else ""
        block = "\n".join(lines[:3]) + ("\n" + entries if entries else "") + "\n    ]\n  }"
        lang_blocks.append(block)
    return header + ",\n".join(lang_blocks) + "\n};\n"


def main():
    ap = argparse.ArgumentParser(
        description="Grow data/vocab.js from a frequency list.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    ap.add_argument("--lang", required=True, choices=sorted(LANG_LABELS), help="language to update")
    ap.add_argument("--freq", required=True, help="frequency list file")
    ap.add_argument("--dict", help="bilingual dictionary file (headword, en, [pos])")
    ap.add_argument("--limit", type=int, default=1000, help="max words to keep (default 1000)")
    ap.add_argument("--vocab", default=DEFAULT_VOCAB, help="vocab.js to read (default data/vocab.js)")
    ap.add_argument("--out", help="where to write (default: overwrite --vocab in place)")
    ap.add_argument("--delimiter", help="force freq-file delimiter (default: auto)")
    ap.add_argument("--word-col", type=int, help="0-indexed word column in --freq")
    ap.add_argument("--en-col", type=int, help="0-indexed English column in --freq")
    ap.add_argument("--pos-col", type=int, help="0-indexed part-of-speech column in --freq")
    args = ap.parse_args()

    lang = args.lang
    vocab = parse_vocab(args.vocab)
    existing = vocab.get(lang, {"label": LANG_LABELS[lang], "words": []})
    existing["label"] = existing.get("label") or LANG_LABELS[lang]

    # Index existing entries by every alias so curated translations are reused, not lost.
    by_alias = {}
    for w in existing["words"]:
        for key in aliases(w["word"]):
            by_alias.setdefault(key, w)

    dictionary = read_dict(args.dict)
    freq = read_freq(args.freq, args.delimiter, args.word_col, args.en_col, args.pos_col)
    if not freq:
        sys.exit(f"No words read from {args.freq}. Check the format / --word-col.")

    merged = []
    used_ids = set()
    missing = []
    reused = filled = new = 0

    for word, freq_en, freq_pos in freq:
        if len(merged) >= args.limit:
            break
        hit = by_alias.get(word)
        if hit is not None and id(hit) not in used_ids:
            merged.append(hit)  # keep curated display + translation
            used_ids.add(id(hit))
            reused += 1
            continue
        if hit is not None:
            continue  # already placed via another alias (e.g. both "le" and "la")
        en, pos = freq_en, freq_pos
        if not en and word in dictionary:
            en, pos = dictionary[word]
            pos = pos or freq_pos
        entry = {"word": word, "en": en, "pos": pos}
        merged.append(entry)
        if en:
            filled += 1
        else:
            missing.append(word)
        new += 1

    # Don't silently drop curated words whose alias never appeared in the freq list.
    appended = 0
    if len(merged) < args.limit:
        for w in existing["words"]:
            if id(w) not in used_ids and len(merged) < args.limit:
                merged.append(w)
                used_ids.add(id(w))
                appended += 1

    vocab[lang] = {"label": existing["label"], "words": merged}
    out_path = args.out or args.vocab
    open(out_path, "w", encoding="utf-8").write(render(vocab))

    # Report + a to-do file of untranslated words.
    miss_path = os.path.join(os.path.dirname(out_path) or ".", f"missing_{lang}.txt")
    if missing:
        open(miss_path, "w", encoding="utf-8").write("\n".join(missing) + "\n")

    print(f"[{lang}] wrote {len(merged)} words -> {out_path}")
    print(f"      reused curated: {reused} | translated from dict: {filled} | "
          f"new untranslated: {len(missing)} | curated appended (no freq match): {appended}")
    if missing:
        print(f"      {len(missing)} still need a translation -> {miss_path}")
        print(f"      e.g. {', '.join(missing[:8])}{' …' if len(missing) > 8 else ''}")
    else:
        print("      every word has a translation ✓")


if __name__ == "__main__":
    main()
