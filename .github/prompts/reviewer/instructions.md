Reviewer checklist and instructions for enhanced testcases and generated code

1) Open the candidate folder: `automation/generated/<TC-ID>/`.
2) Review `enhanced.json` first: check each enhanced step for correctness, provenance (sources), and confidence.
   - If confidence < 0.6 for a step, the step requires manual validation.
   - If a step has sources empty but looks necessary, add a note and set confidence appropriately.
3) Inspect `manifest.json` and generated POM/test files.
   - Compile: `npx tsc --noEmit` (or run lint/tsc CI job)
   - Run the test locally (prefer a dedicated test environment):
     `npx playwright test automation/generated/<TC-ID>/<tc-id>.spec.ts --headed`
4) Validate selectors: prefer data-testid; if TODO markers exist, ask dev to add stable testids or edit selectors.
5) Approve: move files into the canonical `tests/` area and open a PR with label `AUTOMATION: <TC-ID>`.
6) Reject/regenerate: if enhancer introduced incorrect steps, add comments and request a regeneration with updated docs or higher retrieval precision.

Record your verdict in the review system (TestRail/Jira) and add a one-line reason when rejecting.
