#!/usr/bin/env python3
"""
generate_daily.py — generate one short bilingual graded story per day, inspired by a
trending topic, and prepend it to data/daily.js (a rolling window merged into the
library by js/app.js). Designed to run from a daily GitHub Actions cron.

It calls the OpenAI API with structured outputs (JSON schema) to get a French +
Spanish story, sentence-aligned 1:1 with English, then validates alignment, length,
and screens for sensitive themes before writing anything.

  python3 scripts/generate_daily.py                 # live (needs OPENAI_API_KEY)
  python3 scripts/generate_daily.py --mock          # no API/network — canned story
  python3 scripts/generate_daily.py --date 2026-07-26

The model defaults to gpt-4.1-mini (override with OPENAI_MODEL). Cost is a few
cents per day.
"""

import argparse
import datetime
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DAILY = os.path.normpath(os.path.join(HERE, "..", "data", "daily.js"))
LEVEL = "A2"
N_MIN, N_MAX = 10, 15
CAP = 40  # keep the newest N text objects (2 per day → ~20 days)

# Light, evergreen fallback themes (seeded by date) if the trend fetch fails or a
# trend is too heavy to use.
FALLBACK_THEMES = [
    "a lost umbrella", "a neighbor's very loud cat", "learning to bake bread",
    "a slow morning train", "a surprise package at the door", "a new coffee shop",
    "a walk in the park after the rain", "a broken alarm clock", "planning a small trip",
    "a plant that refuses to grow", "a forgotten grocery list", "a friendly dog in the street",
    "a rainy day at the market", "a very long queue", "a mysterious key",
]

# Words that, if they appear, mean we drop the story (belt-and-suspenders screen).
BLOCKLIST = re.compile(
    r"\b(war|guerre|guerra|kill|killed|tué|muert|dead|death|mort|weapon|arme|arma|"
    r"attack|attaque|ataque|bomb|shoot|terror|riot|protest|election|président|presidente|"
    r"covid|virus|disease|maladie|enfermedad|suicid|drug|drogue|droga|rape|abuse)\b",
    re.IGNORECASE,
)

SCHEMA = {
    "type": "object",
    "properties": {
        "title_fr": {"type": "string"},
        "title_es": {"type": "string"},
        "title_en": {"type": "string"},
        "level": {"type": "string", "enum": ["A1", "A2", "B1", "B2"]},
        "fr_pairs": {"type": "array", "items": {
            "type": "object",
            "properties": {"target": {"type": "string"}, "en": {"type": "string"}},
            "required": ["target", "en"], "additionalProperties": False}},
        "es_pairs": {"type": "array", "items": {
            "type": "object",
            "properties": {"target": {"type": "string"}, "en": {"type": "string"}},
            "required": ["target", "en"], "additionalProperties": False}},
    },
    "required": ["title_fr", "title_es", "title_en", "level", "fr_pairs", "es_pairs"],
    "additionalProperties": False,
}

SYSTEM = (
    "You write short bilingual graded reading stories for language learners. "
    "The French and Spanish versions tell the SAME story, sentence by sentence, and every "
    "sentence aligns 1:1 with its English translation. Language must be natural and correct."
)


def fetch_topic():
    """Best-effort trending topic; None on any failure (caller falls back)."""
    try:
        req = urllib.request.Request(
            "https://trends.google.com/trending/rss?geo=US",
            headers={"User-Agent": "Mozilla/5.0 lingua-daily"},
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            xml = r.read().decode("utf-8", "replace")
        titles = re.findall(r"<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>", xml)
        titles = [t.strip() for t in titles[1:] if t.strip()]  # skip channel title
        return ", ".join(titles[:5]) or None
    except Exception:
        return None


def user_prompt(topic):
    return (
        f"Write an original, light, evergreen short story for language learners at CEFR level {LEVEL}.\n\n"
        f"Inspiration (theme only, optional): {topic}. Use it loosely for a gentle everyday angle. "
        "If it is heavy, political, tragic, violent, medical, or about real named people or current "
        "events, IGNORE it and invent a simple everyday scene instead. Do not write a news report "
        "and do not state real facts about real people or events.\n\n"
        "Requirements:\n"
        f"- {N_MIN}-{N_MAX} short sentences.\n"
        f"- Present tense, common everyday vocabulary appropriate to {LEVEL}.\n"
        "- A little gentle humour is welcome.\n"
        "- Provide the story in BOTH French and Spanish, telling the same story beat by beat.\n"
        "- fr_pairs and es_pairs must have the SAME number of items, aligned 1:1: fr_pairs[i] and "
        "es_pairs[i] are the same sentence, and each item's 'en' is that sentence's English translation.\n"
        "- Give a short French title, Spanish title, and English title.\n"
        "Return only the structured object."
    )


def generate(topic, model):
    """Call OpenAI; return the parsed dict, or None if it refused."""
    from openai import OpenAI
    client = OpenAI()
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user_prompt(topic)},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "daily_lesson", "strict": True, "schema": SCHEMA},
        },
    )
    msg = resp.choices[0].message
    if getattr(msg, "refusal", None):
        return None
    return json.loads(msg.content) if msg.content else None


def validate(p):
    for k in ("title_fr", "title_es", "level", "fr_pairs", "es_pairs"):
        if not p.get(k):
            raise ValueError(f"missing field: {k}")
    fr, es = p["fr_pairs"], p["es_pairs"]
    if len(fr) != len(es):
        raise ValueError(f"fr/es length mismatch: {len(fr)} vs {len(es)}")
    if not (N_MIN - 2 <= len(fr) <= N_MAX + 4):
        raise ValueError(f"unexpected length: {len(fr)}")
    for side in (fr, es):
        for pair in side:
            if not pair.get("target", "").strip() or not pair.get("en", "").strip():
                raise ValueError("empty target/en in a pair")
    blob = " ".join(x["target"] + " " + x["en"] for x in fr + es) + " " + \
        p.get("title_en", "") + " " + p["title_fr"] + " " + p["title_es"]
    if BLOCKLIST.search(blob):
        raise ValueError("sensitive-topic screen tripped")


MOCK = {
    "title_fr": "Le parapluie perdu", "title_es": "El paraguas perdido", "title_en": "The Lost Umbrella",
    "level": "A2",
    "fr_pairs": [
        {"target": "Il pleut et Ana cherche son parapluie.", "en": "It's raining and Ana looks for her umbrella."},
        {"target": "Elle regarde partout, mais le parapluie n'est pas là.", "en": "She looks everywhere, but the umbrella isn't there."},
        {"target": "« Où est-il ? » demande-t-elle au chat.", "en": "\"Where is it?\" she asks the cat."},
        {"target": "Le chat dort et ne répond pas.", "en": "The cat is sleeping and doesn't answer."},
        {"target": "Ana sort sous la pluie avec un grand livre sur la tête.", "en": "Ana goes out in the rain with a big book on her head."},
        {"target": "Ses voisins la regardent et sourient.", "en": "Her neighbors look at her and smile."},
        {"target": "Au café, elle voit son parapluie près de la porte.", "en": "At the café, she sees her umbrella near the door."},
        {"target": "Elle l'a oublié ici hier !", "en": "She forgot it here yesterday!"},
        {"target": "Ana prend le parapluie et rit toute seule.", "en": "Ana takes the umbrella and laughs to herself."},
        {"target": "Maintenant, le livre est mouillé, mais Ana est contente.", "en": "Now the book is wet, but Ana is happy."},
    ],
    "es_pairs": [
        {"target": "Llueve y Ana busca su paraguas.", "en": "It's raining and Ana looks for her umbrella."},
        {"target": "Mira por todas partes, pero el paraguas no está.", "en": "She looks everywhere, but the umbrella isn't there."},
        {"target": "—¿Dónde está? —le pregunta al gato.", "en": "\"Where is it?\" she asks the cat."},
        {"target": "El gato duerme y no responde.", "en": "The cat is sleeping and doesn't answer."},
        {"target": "Ana sale bajo la lluvia con un libro grande en la cabeza.", "en": "Ana goes out in the rain with a big book on her head."},
        {"target": "Sus vecinos la miran y sonríen.", "en": "Her neighbors look at her and smile."},
        {"target": "En el café, ve su paraguas cerca de la puerta.", "en": "At the café, she sees her umbrella near the door."},
        {"target": "¡Lo olvidó aquí ayer!", "en": "She forgot it here yesterday!"},
        {"target": "Ana toma el paraguas y se ríe sola.", "en": "Ana takes the umbrella and laughs to herself."},
        {"target": "Ahora el libro está mojado, pero Ana está contenta.", "en": "Now the book is wet, but Ana is happy."},
    ],
}


def load_daily():
    if not os.path.exists(DAILY):
        return []
    src = open(DAILY, encoding="utf-8").read()
    m = re.search(r"window\.DAILY\s*=\s*(\[.*\]);", src, re.DOTALL)
    return json.loads(m.group(1)) if m else []


def write_daily(items):
    body = "// Generated daily by scripts/generate_daily.py — a rolling window of\n" \
           "// auto-generated texts, merged into window.TEXTS by js/app.js.\n" \
           "window.DAILY = " + json.dumps(items, ensure_ascii=False, indent=2) + ";\n"
    open(DAILY, "w", encoding="utf-8").write(body)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--mock", action="store_true", help="skip API/network; use a canned story")
    ap.add_argument("--date", help="YYYY-MM-DD id/date (default: today UTC)")
    ap.add_argument("--model", default=os.environ.get("OPENAI_MODEL", "gpt-4.1-mini"))
    args = ap.parse_args()

    date = args.date or datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    try:
        if args.mock:
            payload, topic = MOCK, "a lost umbrella (mock)"
        else:
            topic = fetch_topic() or FALLBACK_THEMES[sum(map(ord, date)) % len(FALLBACK_THEMES)]
            payload = generate(topic, args.model)
        if payload is None:
            print("No content generated (model declined). Skipping today.")
            return
        validate(payload)
    except Exception as e:
        print(f"Skipping today — {type(e).__name__}: {e}")
        return

    lvl = payload["level"]
    fr = {"id": f"fr-daily-{date}", "lang": "fr", "langLabel": "Français",
          "title": payload["title_fr"], "source": f"Daily (auto) · {date}", "level": lvl,
          "date": date, "pairs": payload["fr_pairs"]}
    es = {"id": f"es-daily-{date}", "lang": "es", "langLabel": "Español",
          "title": payload["title_es"], "source": f"Daily (auto) · {date}", "level": lvl,
          "date": date, "pairs": payload["es_pairs"]}

    existing = [t for t in load_daily() if t.get("date") != date]
    items = ([fr, es] + existing)[:CAP]
    write_daily(items)
    print(f"Wrote {date}: '{payload['title_en']}' (theme: {topic}) — {len(items)} texts in daily.js")


if __name__ == "__main__":
    main()
