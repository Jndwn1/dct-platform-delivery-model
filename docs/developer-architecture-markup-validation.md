# Developer Architecture Markup Validation — August 20, 2026

The `/architecture/developer` page renders each API contract row as a focusable `role="button"` container and renders the endpoint copy action as a separate sibling native button. The browser accessibility tree shows six contract triggers and six separate copy buttons, rather than a native button nested inside another native button.

The interaction preserves contract-row expansion, keyboard activation through Enter/Space, and endpoint-copy behavior without allowing copy clicks to toggle the parent contract row.
