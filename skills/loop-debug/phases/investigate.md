# Investigate

Goal: one confirmed cause that explains the signature, every affected entry point classified, and the tests that should have caught it identified.

## Fan-out

Read-only investigators per tier, in one message, each with the signature and `red_evidence` by value, a scope, a budget, and the evidence contract from `../../loop-plan/phases/explore.md`:

1. **Root-cause trace** — from the symptom backward to where the bad value or state is first produced; every hop cited. Returns ranked hypotheses, each with evidence and one cheap discriminator (a check that would prove or disprove it).
2. **Impact scope** — direct and transitive callers, external entry points (routes, jobs, intents, deep links), shared state, and where the same data shape or invariant appears elsewhere.
3. **Test audit** (standard+) — tests covering the path; why they did not fail; verdict per test: proves, partially proves, characterizes only, tautological, missing; oracle independence; fixture realism; the smallest regression set and the prevention tests that would catch the class.

## Discriminate

Reconcile into `hypotheses[]`. Run the discriminators yourself, cheapest first. A hypothesis with a failed discriminator is `disproven`; one whose discriminator reproduces the signature is `confirmed`. Continue until exactly one is confirmed, or all are disproven (then widen the trace), or the budget is spent (then surface the ranked list with what each discriminator would cost). Never ask the user to pick a hypothesis the repository can discriminate.

## Similar cases

Search the codebase for the same invariant, pattern, or call shape as the confirmed cause. Each hit is dispositioned: same defect (goes into the fix or a follow-up), safe because of X (cite X), or unknown (listed as residual). This list feeds the prevention guard.

## Closure

Set `impact_closure` as in loop-plan; stop per the convergence rule; write `stopping_reason`. Write `## Investigation` in the plan file: causal chain with citations, hypotheses table, impact matrix, test-audit verdicts, similar-case dispositions.
