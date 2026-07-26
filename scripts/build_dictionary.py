#!/usr/bin/env python3
"""
build_dictionary.py — generate data/dictionary.js for the reader's click-to-translate.

Scans every target-language sentence in data/texts.js, tokenizes it the SAME way the
reader does (splitting French elisions like l'/j'/qu'), and builds a compact
word -> English map so clicking a word in the reader pops its meaning.

Lookup priority for each word:
  1. data/vocab.js — the curated top-1000 list (best glosses, incl. hand-written ones);
  2. an optional MUSE bilingual dictionary (--dict-fr / --dict-es) for text words that
     fall outside the top-1000 (proper content words like "corbeau", "fromage").

The output also includes every curated top-1000 word, so common words always resolve
even in texts not yet added. Words with no translation are simply omitted (the reader
shows "not in dictionary" for a miss).

Usage:
    python3 scripts/build_dictionary.py --dict-fr fr-en.tsv --dict-es es-en.tsv
"""

import argparse
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build_vocab import parse_vocab, read_dict, aliases  # noqa: E402

TEXTS = os.path.normpath(os.path.join(HERE, "..", "data", "texts.js"))
VOCAB = os.path.normpath(os.path.join(HERE, "..", "data", "vocab.js"))
OUT = os.path.normpath(os.path.join(HERE, "..", "data", "dictionary.js"))

# Keep this tokenizer in lock-step with tokenize() in js/reader.js.
LET = r"A-Za-zÀ-ÖØ-öø-ÿŒœ"
WORD_RE = re.compile(rf"[{LET}][{LET}'’\-]*")
ELIDE_RE = re.compile(rf"^(qu|[ldjnmtsc])(['’])(.+)$", re.I)
ELIDE_SET = {"l", "d", "j", "n", "m", "t", "s", "c", "qu"}


def norm(w):
    return w.lower().replace("’", "'").replace("`", "'")


def split_elision(w):
    m = ELIDE_RE.match(w)
    if m and m.group(1).lower() in ELIDE_SET:
        return [m.group(1) + m.group(2), m.group(3)]
    return [w]


def tokenize(sentence):
    out = []
    for w in WORD_RE.findall(sentence):
        out.extend(split_elision(w))
    return out


def text_words_by_lang():
    src = open(TEXTS, encoding="utf-8").read()
    marks = [(m.start(), m.group(1)) for m in re.finditer(r'lang:\s*"(\w+)"', src)]
    words = {}
    for i, (pos, lang) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(src)
        region = src[pos:end]
        bag = words.setdefault(lang, set())
        for m in re.finditer(r"target:\s*`([^`]*)`", region):
            for w in tokenize(m.group(1)):
                bag.add(norm(w))
    return words


def read_muse(path):
    """headword -> english, skipping identity pairs (src == tgt) and keeping first sense."""
    d = {}
    if not path:
        return d
    for raw in open(path, encoding="utf-8"):
        parts = raw.split("\t") if "\t" in raw else raw.split()
        if len(parts) < 2:
            continue
        head, en = norm(parts[0]), " ".join(parts[1:]).strip()
        if not head or not en or norm(en) == head:  # drop identity mappings
            continue
        d.setdefault(head, en)
    return d


def build_lookup(vocab, muse_paths):
    """Return (lookup word->gloss, curated_keys). Curated glosses win over MUSE."""
    lookup = {lang: {} for lang in ("fr", "es")}
    curated = {lang: set() for lang in ("fr", "es")}
    for lang, info in vocab.items():
        if lang not in lookup:
            continue
        for w in info["words"]:
            if not w["en"]:
                continue
            for a in aliases(w["word"]):
                lookup[lang].setdefault(a, w["en"])
                curated[lang].add(a)
    for lang, path in muse_paths.items():
        for head, en in read_muse(path).items():
            lookup[lang].setdefault(head, en)
    return lookup, curated


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dict-fr", help="MUSE fr-en TSV (headword<TAB>english)")
    ap.add_argument("--dict-es", help="MUSE es-en TSV")
    ap.add_argument("--override-fr", help="TSV of word<TAB>gloss to force (wins over everything)")
    ap.add_argument("--override-es", help="TSV of word<TAB>gloss to force (wins over everything)")
    ap.add_argument("--out", default=OUT)
    args = ap.parse_args()

    vocab = parse_vocab(VOCAB)
    lookup, curated = build_lookup(vocab, {"fr": args.dict_fr, "es": args.dict_es})
    # Top-priority manual fixes for glosses the machine dictionary gets wrong.
    for lang, path in {"fr": args.override_fr, "es": args.override_es}.items():
        if not path:
            continue
        for raw in open(path, encoding="utf-8"):
            if not raw.strip() or raw.lstrip().startswith("#"):
                continue
            parts = raw.rstrip("\n").split("\t")
            if len(parts) >= 2 and parts[0].strip():
                lookup[lang][norm(parts[0])] = parts[1].strip()
                curated[lang].add(norm(parts[0]))
    text_words = text_words_by_lang()

    result = {}
    for lang in ("fr", "es"):
        keys = set(curated[lang])  # every curated top-1000 word, plus text words below
        found = missing = 0
        tw = text_words.get(lang, set())
        miss_sample = []
        for w in tw:
            if w in lookup[lang]:
                keys.add(w)
                found += 1
            else:
                missing += 1
                if len(miss_sample) < 12:
                    miss_sample.append(w)
        result[lang] = {k: lookup[lang][k] for k in sorted(keys) if k in lookup[lang]}
        if tw:
            print(f"[{lang}] text words: {len(tw)} | in dictionary: {found} "
                  f"({100*found//max(len(tw),1)}%) | missing: {missing}")
            if miss_sample:
                print(f"      missing e.g.: {', '.join(miss_sample)}")
        print(f"[{lang}] dictionary entries written: {len(result[lang])}")

    lines = [
        "// Generated by scripts/build_dictionary.py — word -> English gloss.",
        "// Powers the reader's click-to-translate. Sources: data/vocab.js (curated",
        "// top-1000) + MUSE bilingual dictionary for remaining text words.",
        "window.DICT = {",
    ]
    for li, lang in enumerate(("fr", "es")):
        lines.append(f"  {lang}: {{")
        for k, v in result[lang].items():
            lines.append(f'    "{esc(k)}": "{esc(v)}",')
        lines.append("  }" + ("," if li == 0 else ""))
    lines.append("};")
    open(args.out, "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
