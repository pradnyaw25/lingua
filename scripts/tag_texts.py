#!/usr/bin/env python3
"""One-off: backfill section / new / en_title on data/generated.js entries that were
generated before those fields existed. Derives them from scripts/theme_ideas.txt.
Safe to re-run (only fills missing fields)."""

import json
import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import generate_daily as gd  # noqa: E402

GEN = os.path.normpath(os.path.join(HERE, "..", "data", "generated.js"))


def main():
    meta = gd.topic_meta()
    src = open(GEN, encoding="utf-8").read()
    arr = json.loads(re.search(r"window\.GENERATED\s*=\s*(\[.*\]);", src, re.DOTALL).group(1))
    filled = 0
    for it in arr:
        topic = it.get("topic", "")
        tm = meta.get(topic, {"section": "Everyday", "new": False})
        if "section" not in it:
            it["section"] = tm["section"]
            filled += 1
        it.setdefault("new", tm["new"])
        it.setdefault("en_title", gd.title_case(topic) if topic else it["title"])
    body = ("// Generated in batch by scripts/generate_batch.py from scripts/theme_ideas.txt.\n"
            "// Merged into window.TEXTS by js/app.js. Regenerate any time; it's overwritten wholesale.\n"
            "window.GENERATED = " + json.dumps(arr, ensure_ascii=False, indent=2) + ";\n")
    open(GEN, "w", encoding="utf-8").write(body)
    print(f"filled {filled} entries | sections: {dict(Counter(it['section'] for it in arr))} "
          f"| new: {sum(1 for it in arr if it['new'])}")


if __name__ == "__main__":
    main()
