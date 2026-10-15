#!/bin/sh
# UPGRADE V3 · reproduce the whole pass from the pre-v3 tree.
#
#   ./upgrade-v3/run-all.sh
#
# The three generic passes are idempotent (each one marks what it did), so this is
# safe to re-run over the current tree; `git checkout 9f7339d -- proto/` first if you
# want to watch it work from the start.
set -e
cd "$(dirname "$0")/.."
python3 upgrade-v3/implement-v3.py        # app surfaces: mast, flow/rail, cards, tables, TOC
python3 upgrade-v3/build-auth.py         # the eight auth pages, composed from scratch
python3 upgrade-v3/implement-v3-pub.py   # hub + 13 marketing pages
python3 upgrade-v3/hand-edits.py         # the two pages a generic pass cannot reach
python3 upgrade-v3/check.py --root proto --json upgrade-v3/integrity.json --quiet
python3 upgrade-v3/measure.py --root proto --baseline /tmp/base/proto \
  --csv upgrade-v3/PAGE_REVIEW_V3_DATA.csv --fail-on-shrink
python3 upgrade-v3/ledger.py
