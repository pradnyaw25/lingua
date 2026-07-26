#!/usr/bin/env python3
"""
generate_daily.py — generate one short bilingual graded story per day, inspired by a
topic you seed in scripts/theme_ideas.txt, and prepend it to data/daily.js (a rolling
window merged into the library by js/app.js). Runs from a daily GitHub Actions cron.

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

HERE = os.path.dirname(os.path.abspath(__file__))
DAILY = os.path.normpath(os.path.join(HERE, "..", "data", "daily.js"))
THEMES_FILE = os.path.join(HERE, "theme_ideas.txt")
LEVELS = ["A2", "B1", "B2"]                       # rotated by date
LEVEL_LEN = {"A2": (10, 15), "B1": (12, 16), "B2": (14, 18)}  # sentences per level
CAP = 40  # keep the newest N text objects (2 per day → ~20 days)


def pick_level(date_str):
    """Deterministic A1 → A2 → B1 rotation by calendar day."""
    d = datetime.date.fromisoformat(date_str)
    return LEVELS[d.toordinal() % len(LEVELS)]

# Built-in defaults, used only if scripts/theme_ideas.txt is missing or empty.
FALLBACK_THEMES = [
    "a lost umbrella", "a neighbor's very loud cat", "learning to bake bread",
    "a slow morning train", "a surprise package at the door", "a new coffee shop",
    "a walk in the park after the rain", "a broken alarm clock", "planning a small trip",
    "a plant that refuses to grow", "a forgotten grocery list", "a friendly dog in the street",
    "a rainy day at the market", "a very long queue", "a mysterious key",
]

# Last-ditch screen for clearly graphic/harmful output. Topic-appropriateness (no
# politics, medical advice, violence, current events) is handled by the prompt and the
# curated topic list — so keep this NARROW: don't block ordinary educational vocabulary
# like "virus", "attack", "president", or "true crime".
BLOCKLIST = re.compile(
    r"\b(genocid\w*|génocide|massacre|masacre|terroris\w*|"
    r"rape|viol|violación|suicid\w*|overdose|sobredosis|self-harm)\b",
    re.IGNORECASE,
)

SCHEMA = {
    "type": "object",
    "properties": {
        "format": {"type": "string", "enum": ["story", "explainer"]},
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
    "required": ["format", "title_fr", "title_es", "title_en", "level", "fr_pairs", "es_pairs"],
    "additionalProperties": False,
}

SYSTEM = (
    "You write short bilingual reading pieces for language learners — either a light everyday "
    "STORY or a clear nonfiction EXPLAINER, whichever fits the topic. The French and Spanish "
    "versions say the same thing, sentence by sentence, and every sentence aligns 1:1 with its "
    "English translation. Language must be natural and correct."
)


def load_themes():
    """Your editable fallback ideas (scripts/theme_ideas.txt), else the built-ins."""
    if os.path.exists(THEMES_FILE):
        lines = [ln.strip() for ln in open(THEMES_FILE, encoding="utf-8")]
        ideas = [ln for ln in lines if ln and not ln.startswith("#")]
        if ideas:
            return ideas
    return FALLBACK_THEMES


def pick_topic(date_str):
    """Walk the seeded ideas one per day, cycling through the whole list."""
    themes = load_themes()
    return themes[datetime.date.fromisoformat(date_str).toordinal() % len(themes)]


def user_prompt(topic, level, n_min, n_max):
    return (
        f"Create a short bilingual reading piece for language learners at CEFR level {level}, "
        f"about: {topic}.\n\n"
        "First choose the format that best fits this topic, and set the \"format\" field:\n"
        "- STORY: a light, everyday fictional scene loosely inspired by the topic. Gentle humour welcome.\n"
        "- EXPLAINER: a clear, friendly, accurate nonfiction piece that actually explains the topic simply.\n"
        "Use EXPLAINER for how-things-work, history, science, food, culture, and 'why/how' topics; "
        "use STORY for ordinary everyday scenes. Pick whichever genuinely fits — not everything is a story.\n\n"
        "Rules for either format:\n"
        f"- {n_min}-{n_max} short sentences.\n"
        f"- Vocabulary and grammar appropriate to CEFR {level} "
        "(mostly present tense at A2; past tenses and richer vocabulary at B1/B2).\n"
        "- Provide it in BOTH French and Spanish, saying the same thing beat by beat.\n"
        "- fr_pairs and es_pairs must have the SAME number of items, aligned 1:1: fr_pairs[i] and "
        "es_pairs[i] are the same sentence, and each item's 'en' is that sentence's English translation.\n"
        "- Keep it engaging and appropriate for all ages. Public figures (athletes, artists, "
        "historical figures) and popular sports, culture, and travel topics are welcome — write a "
        "positive, broadly accurate piece, and don't invent specific quotes, scores, or statistics. "
        "Do NOT cover politics or elections, medical advice, tragedy, or anything graphic or hateful.\n"
        "- Give a short French title, Spanish title, and English title.\n"
        "Return only the structured object."
    )


def generate(topic, model, level, n_min, n_max):
    """Call OpenAI; return the parsed dict, or None if it refused."""
    from openai import OpenAI
    client = OpenAI()
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user_prompt(topic, level, n_min, n_max)},
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


def validate(p, n_min, n_max):
    for k in ("title_fr", "title_es", "level", "fr_pairs", "es_pairs"):
        if not p.get(k):
            raise ValueError(f"missing field: {k}")
    fr, es = p["fr_pairs"], p["es_pairs"]
    if len(fr) != len(es):
        raise ValueError(f"fr/es length mismatch: {len(fr)} vs {len(es)}")
    if not (n_min - 2 <= len(fr) <= n_max + 4):
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
    "format": "story",
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
    ap.add_argument("--level", choices=LEVELS, help="force a level (default: rotate A2/B1/B2 by date)")
    ap.add_argument("--model", default=os.environ.get("OPENAI_MODEL", "gpt-4.1-mini"))
    args = ap.parse_args()

    date = args.date or datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
    level = args.level or pick_level(date)
    n_min, n_max = LEVEL_LEN[level]

    try:
        if args.mock:
            payload, topic = dict(MOCK, level=level), "a lost umbrella (mock)"
        else:
            topic = pick_topic(date)
            payload = generate(topic, args.model, level, n_min, n_max)
        if payload is None:
            print("No content generated (model declined). Skipping today.")
            return
        validate(payload, n_min, n_max)
    except Exception as e:
        print(f"Skipping today — {type(e).__name__}: {e}")
        return

    fmt = payload.get("format", "story")
    src = f"Daily {fmt} · {date}"
    fr = {"id": f"fr-daily-{date}", "lang": "fr", "langLabel": "Français",
          "title": payload["title_fr"], "source": src, "level": level,
          "date": date, "pairs": payload["fr_pairs"]}
    es = {"id": f"es-daily-{date}", "lang": "es", "langLabel": "Español",
          "title": payload["title_es"], "source": src, "level": level,
          "date": date, "pairs": payload["es_pairs"]}

    existing = [t for t in load_daily() if t.get("date") != date]
    items = ([fr, es] + existing)[:CAP]
    write_daily(items)
    print(f"Wrote {date} [{level}/{fmt}]: '{payload['title_en']}' (topic: {topic}) — {len(items)} texts in daily.js")


if __name__ == "__main__":
    main()
