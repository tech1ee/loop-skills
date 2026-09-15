# State file

`<plan dir>/<slug>.state.json`, schema version 2. Write atomically (temp file, then rename). The controller is the only writer.

```json
{
  "schema_version": 2,
  "skill": "loop-plan",
  "slug": "offline-feed-caching",
  "status": "active",
  "phase": "explore",
  "iteration": 1,
  "tier": "standard",
  "goal": "Feed renders from cache within 200 ms when offline",
  "must_haves": {
    "truths": ["Opening the feed with networking disabled shows the last fetched items"],
    "artifacts": [{"path": "src/feed/cache.ts", "provides": "TTL-bounded item cache"}],
    "key_links": [{"from": "FeedScreen", "to": "cache.ts", "via": "useFeed() fallback branch"}]
  },
  "impact_closure": {
    "entry_points": true,
    "callers_consumers": true,
    "similar_cases": false,
    "tests_fixtures_config": true,
    "edge_cases": false
  },
  "evidence": [
    {"id": "E1", "claim": "Feed is fetched only in useFeed()", "source": "src/feed/useFeed.ts:18-41", "status": "supported"}
  ],
  "open_questions": [],
  "budget": {"explorers_used": 2, "rounds_used": 1, "research_calls_used": 0},
  "stopping_reason": {"explore": null, "research": null},
  "review": {"current_high": 0, "prev_high": null, "cycles": 1, "stall_reentries": 0},
  "tasks": [
    {"id": "T1", "status": "done", "attempt": 1, "checkpoint": "2026-09-15T10:12:00Z", "result": "DONE"},
    {"id": "T2", "status": "running", "attempt": 1, "checkpoint": "2026-09-15T10:20:00Z", "result": null}
  ],
  "verification": {"status": null, "gaps": []},
  "created_at": "2026-09-15T09:40:00Z",
  "updated_at": "2026-09-15T10:20:00Z"
}
```

Field rules:

- `status`: `active` | `shipped` | `aborted`. `shipped` only after `verification.status == "passed"` or a user-signed `human_needed`.
- `phase`: `seed` | `explore` | `clarify` | `research` | `plan` | `gate` | `execute` | `verify` | `done`.
- `tier`: `quick` | `standard` | `high-risk`. Changing it requires a `tier_reason` field.
- `evidence[].status`: `open` | `supported` | `contradicted`.
- `tasks[].status`: `pending` | `running` | `done` | `blocked`. `tasks[].result`: `DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED` | null.
- `review.current_high` comes from the last line of the latest review, never from counting the plan file.

loop-debug adds `bug_signature`, `hypotheses[]` (`{id, claim, discriminator, status}` with status `open` | `confirmed` | `disproven`), `red_evidence` (command and failure output), and `fix_attempts`.

Version 1 files (from releases ≤ 0.6) are read as-is: `current_phase` maps to `phase`, `rigor` maps to `tier` (`minimal` → quick, `tdd-only` → standard, `full` → high-risk), `completion_state` maps to `status`. Do not rewrite them unless the loop continues.
