# Research

Goal: bring in current external facts only where they can change the design.

## When

Run only if the tier's research budget is above zero and at least one open item is an external, changeable fact: a library or platform API, a security or compliance rule, a benchmark, a standard, or community experience with an approach. Repository facts are never research. Record `stopping_reason: "no design-changing external unknowns"` when skipping.

## How

- Library and SDK questions: current official documentation first (a docs tool such as context7 when available, otherwise the vendor site). One call usually closes the item.
- Everything else: one research delegate per independent question, within the budget. The delegate gets the question, the decision it will change, the date rule below, and the output contract.
- Date rule: every query carries the current year; every cited page has a verifiable date; prefer primary sources and issue trackers over listicles. Undated or stale sources are not cited.
- Balance: for a recommended approach, look for at least one skeptical source. If none appears after two searches, say so.
- Never invent citations. If `verify-internet-research.py` is available, run it on the delegate's report and drop `URL_DEAD`, `NO_DATE`, and `NOT_FOUND` items.

## Output

Append `## Research — iteration N` to the plan file: per question, the conclusion, the decision it changes, sources with dates, confidence, and disagreements. Update `evidence[]` with the resolved items. Stop per the convergence rule.
