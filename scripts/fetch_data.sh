#!/usr/bin/env bash
# Download the source data used to (re)generate data/vocab.js and data/dictionary.js:
#   - frequency lists (Hermit Dave / OpenSubtitles, CC BY-SA 4.0)
#   - bilingual dictionaries (Facebook MUSE, CC BY-NC 4.0)
# Files land in scripts/.data/ (gitignored). Run once per machine, then use regen.sh.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)/.data"
mkdir -p "$DIR"

dl() { curl -sSL --fail --max-time 120 -o "$2" "$1" && echo "  ok  $(basename "$2")"; }

echo "Frequency lists:"
dl "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/fr/fr_50k.txt" "$DIR/fr_50k.txt"
dl "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt" "$DIR/es_50k.txt"

echo "Bilingual dictionaries (MUSE, space-separated -> TSV):"
for l in fr es; do
  dl "https://dl.fbaipublicfiles.com/arrival/dictionaries/${l}-en.txt" "$DIR/${l}-en.raw"
  # "src tgt..." -> "src<TAB>tgt..."
  awk '{h=$1; $1=""; sub(/^ /,""); if (h!="" && $0!="") print h"\t"$0}' "$DIR/${l}-en.raw" > "$DIR/${l}-en.tsv"
  rm -f "$DIR/${l}-en.raw"
done

echo "Done -> $DIR"
