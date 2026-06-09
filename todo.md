
## Roger ↔ DCT Integration Hub Enhancements

- [x] Add "Copy as ADO Story" button to each Action Item row in IntegrationSimulation.tsx
- [x] Add multi-topic tab system (Edit Reclass Adjustment + Known Mappings API Defect) to IntegrationSimulation.tsx
- [x] Add integration_questions DB table with topic, question, status, owner, resolved_at fields
- [x] Add tRPC procedures: integrationHub.getQuestions, addQuestion, resolveQuestion, assignQuestion
- [x] Replace static Open Questions section with live DB-backed decision log in IntegrationSimulation.tsx
