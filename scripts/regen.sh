#!/usr/bin/env bash
# Regenerate the generated data files from the fetched source data.
# Run scripts/fetch_data.sh first (populates scripts/.data/).
#
#   bash scripts/regen.sh          # regenerate data/dictionary.js (the common case,
#                                  #   e.g. after adding a text to data/texts.js)
#   bash scripts/regen.sh --vocab  # ALSO rebuild data/vocab.js from the frequency lists
#                                  #   (only needed if the frequency data changes; your
#                                  #   hand-edited glosses in vocab.js are preserved)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DIR="$HERE/.data"
ROOT="$(cd "$HERE/.." && pwd)"
S="$HERE/samples"

[ -f "$DIR/fr-en.tsv" ] || { echo "Missing source data. Run: bash scripts/fetch_data.sh"; exit 1; }
cd "$ROOT"

if [ "${1:-}" = "--vocab" ]; then
  echo "Rebuilding data/vocab.js (frequency lists + supplements + MUSE)…"
  for l in fr es; do
    python3 scripts/build_vocab.py --lang "$l" \
      --freq "$DIR/${l}_50k.txt" \
      --dict <(cat "$S/supplement_${l}.tsv" "$S/supplement2_${l}.tsv" "$DIR/${l}-en.tsv") \
      --limit 1000
  done
fi

echo "Rebuilding data/dictionary.js (texts + vocab + MUSE + overrides)…"
python3 scripts/build_dictionary.py \
  --dict-fr "$DIR/fr-en.tsv" --dict-es "$DIR/es-en.tsv" \
  --override-fr "$S/overrides_fr.tsv" --override-es "$S/overrides_es.tsv"

echo "Done."
