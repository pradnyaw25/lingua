#!/usr/bin/env python3
"""
generate_batch.py — generate one reading piece for every idea in scripts/theme_ideas.txt
and write them all to data/generated.js (window.GENERATED). Ad-hoc: run it once to build
a whole library at once, review, and commit.

Each topic gets a CEFR level (rotated A2/B1/B2 across the list) and the model picks the
format (story or explainer) that fits it — same engine as the daily generator.

  OPENAI_API_KEY=... python3 scripts/generate_batch.py       # generate the whole list
  python3 scripts/generate_batch.py --mock --limit 3         # offline smoke test
  python3 scripts/generate_batch.py --limit 10               # first 10 topics only
"""

import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import generate_daily as gd  # noqa: E402  (reuse generate/validate/schema/levels)

OUT = os.path.normpath(os.path.join(HERE, "..", "data", "generated.js"))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40]


def write_generated(items):
    body = ("// Generated in batch by scripts/generate_batch.py from scripts/theme_ideas.txt.\n"
            "// Merged into window.TEXTS by js/app.js. Regenerate any time; it's overwritten wholesale.\n"
            "window.GENERATED = " + json.dumps(items, ensure_ascii=False, indent=2) + ";\n")
    open(OUT, "w", encoding="utf-8").write(body)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--mock", action="store_true", help="skip the API; use a canned piece per topic")
    ap.add_argument("--limit", type=int, help="only the first N topics")
    ap.add_argument("--model", default=os.environ.get("OPENAI_MODEL", "gpt-4.1-mini"))
    args = ap.parse_args()

    topics = gd.load_themes()
    if args.limit:
        topics = topics[:args.limit]

    items, made, skipped = [], 0, 0
    for i, topic in enumerate(topics):
        level = gd.LEVELS[i % len(gd.LEVELS)]
        n_min, n_max = gd.LEVEL_LEN[level]
        try:
            payload = dict(gd.MOCK, level=level) if args.mock else \
                gd.generate(topic, args.model, level, n_min, n_max)
            if payload is None:
                print(f"  [{i+1}/{len(topics)}] skip (declined): {topic}")
                skipped += 1
                continue
            gd.validate(payload, n_min, n_max)
        except Exception as e:
            print(f"  [{i+1}/{len(topics)}] skip: {topic} — {type(e).__name__}: {e}")
            skipped += 1
            continue

        fmt = payload.get("format", "story")
        sid = f"{i:02d}-{slug(topic)}"
        src = f"Generated {fmt}"
        items.append({"id": f"fr-lib-{sid}", "lang": "fr", "langLabel": "Français",
                      "title": payload["title_fr"], "source": src, "level": level,
                      "topic": topic, "pairs": payload["fr_pairs"]})
        items.append({"id": f"es-lib-{sid}", "lang": "es", "langLabel": "Español",
                      "title": payload["title_es"], "source": src, "level": level,
                      "topic": topic, "pairs": payload["es_pairs"]})
        made += 1
        print(f"  [{i+1}/{len(topics)}] {level}/{fmt}: {payload['title_en']}")

    write_generated(items)
    print(f"\nWrote {len(items)} texts ({made} topics, {skipped} skipped) -> {OUT}")


if __name__ == "__main__":
    main()
