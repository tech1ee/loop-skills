# Explore

Goal: a closed impact map for the change, with `path:line` evidence, before anyone asks the user anything.

## Fan-out

Delegate read-only work to the tier's number of explorers in one message. Each gets one scope, explicit paths or symbols, the budget, a stop condition, and this output contract: concise claims, each with `path:line`, plus `(unverified)` markers when the turn cap is near. Partial report beats no report. Never tell an explorer to re-read every cited file before returning.

Scopes, in priority order:

1. Similar features and alternate execution paths.
2. Architecture: modules, callers, downstream consumers, configuration, persistence, data flow.
3. Tests, fixtures, mocks, coverage gaps, error paths.
4. Boundary sweep (high-risk only): concurrency, retries, cancellation, empty or malformed input, permissions, migrations, platform differences.

Use a stack explorer when one exists (see `references/platforms.md`); otherwise the generic read-only explorer. While they run, inspect the central files yourself.

## Evidence ledger

Every material claim goes to `evidence[]` as `{id, claim, source, status}` with status `open`, `supported`, or `contradicted`. A claim without a source stays `open`. Conflicting claims stay `contradicted` until a targeted probe resolves them; they never enter the plan silently.

## Impact closure

After each round, reconcile the ledger and set `impact_closure`:

- `entry_points`: every entry point that reaches the touched code is listed.
- `callers_consumers`: direct callers and downstream consumers of every touched module are mapped.
- `similar_cases`: same-class implementations were searched and classified.
- `tests_fixtures_config`: tests, mocks, fixtures, config, docs, and generated boundaries were checked.
- `edge_cases`: relevant boundaries are enumerated with a disposition.

Any `false` item drives the next targeted search, run by you or one follow-up explorer. Stop per the convergence rule in `SKILL.md` and write `stopping_reason`. Report coverage and residual unknowns honestly; never claim "no blind spots".

## Citation check

If `verify-code-research.py` is available (see `references/platforms.md` for the helper path), run it on each explorer report. It matches claim text against the cited line, so paraphrased claims fail even when the citation is right: re-open each `FAIL` yourself, keep those the line supports, and list the rest as gaps.

## Output

Write one paragraph per scope to `## Exploration` in the plan file, then the closure checklist and residual unknowns.
