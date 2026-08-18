
## Roger ↔ DCT Integration Hub Enhancements

- [x] Add "Copy as ADO Story" button to each Action Item row in IntegrationSimulation.tsx
- [x] Add multi-topic tab system (Edit Reclass Adjustment + Known Mappings API Defect) to IntegrationSimulation.tsx
- [x] Add integration_questions DB table with topic, question, status, owner, resolved_at fields
- [x] Add tRPC procedures: integrationHub.getQuestions, addQuestion, resolveQuestion, assignQuestion
- [x] Replace static Open Questions section with live DB-backed decision log in IntegrationSimulation.tsx
- [x] Mark Batch 8 and Batch 29 closed in PI3 as of August 11 across delivery highlights, dashboard metrics, platform readiness, active/recently closed lists, and the Batch Control Panel
- [x] Resolve the PI3 closure refresh validation issue and confirm no new TypeScript errors were introduced
- [x] Stabilize the PI3 closure refresh and deliver a single verified completion update
- [x] Replace unsupported Roger readiness labels with valid delivered-state values and restore the baseline validation result
- [x] Apply the minimal five-value readiness-label repair and verify the baseline error count
- [x] Update all remaining stale B8/B29 references that still show active, planned, or not-started delivery status
- [x] Save a final verified checkpoint after the PI3 closure refresh and provide one confirmed completion update
- [x] Prepare the verified completion update summarizing the PI3 closure refresh, validation baseline, tests, and checkpoint
- [x] Reconcile the completed-batch total to the expected 20 and correct PI2, PI3, and MVP readiness metrics across dashboard and Control Panel views
- [x] Verify and align Batch Control Panel rollups with 20 complete, PI2 12/13, PI3 3/13, and 57% MVP readiness
- [x] Re-run the full Vitest suite and TypeScript baseline after final metric reconciliation
