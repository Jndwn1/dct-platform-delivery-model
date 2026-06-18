# DCT Gate Dashboard — Cleanup Recommendations Report

**Prepared for:** Jenniver Stafford, Sr. Business Analyst — CATT / RSM  
**Date:** June 18, 2026  
**Scope:** Analysis of all sections currently displayed beneath the Executive Delivery Dashboard on the DCT Delivery Model landing page.  
**Purpose:** Identify duplicate content, obsolete material, sections better suited for dedicated pages, and sections with limited executive value. No content has been deleted; this is analysis only.

---

## Summary

The DCT Delivery Model landing page has evolved through multiple iterations and now contains nine collapsible accordion sections beneath the Executive Delivery Dashboard. Several of these sections serve important reference and governance functions but may not belong on the primary executive command center view. The table below provides a structured recommendation for each section.

---

## Section-by-Section Analysis

| # | Section | Recommendation | Action | Reason |
|---|---------|---------------|--------|--------|
| 1 | **Purpose** | Keep | Keep — collapsed default | Provides essential governance context for first-time users and stakeholders. Compact and non-redundant with the Executive Summary panel. Collapsed by default is appropriate. |
| 2 | **Batch Portfolio Overview** | Keep | Keep — consider default open | The most-referenced section for delivery teams. Contains the full PI 2 + PI 3 batch inventory with search and expand-on-click detail. Directly supports the "What is active / complete?" question. Consider opening by default. |
| 3 | **End-to-End Delivery Model** | Move | Move to Architecture page | The flow diagram (Tax Portal → Service Bus → PDC → Orchestrator → TDC → Roger) is a static architecture visual. It adds limited executive value on the landing page but is highly valuable in an architecture reference or onboarding context. |
| 4 | **System Ownership Model** | Move | Move to Architecture page | The ownership table (Layer / System / Responsibility) is a governance reference artifact. It is more appropriate as a dedicated architecture or governance page than a landing page accordion. Duplication risk with the Roger vs. DCT Roles page. |
| 5 | **What Must Be True — Foundation Invariants** | Keep | Keep — collapsed | The eight invariants are the non-negotiable governance rules of the platform. They are not duplicated elsewhere and are important for architects, engineers, and governance reviewers. Collapsed by default is appropriate. |
| 6 | **What This Enables — Platform Capabilities** | Move | Move to Architecture or Capabilities page | This section describes what the platform enables (deterministic lineage, replay, API-first, etc.). It is informational and better suited to an onboarding guide or capabilities reference page. Limited executive value on the command center. |
| 7 | **Architecture Guardrails** | Move | Move to Architecture page | The guardrail rules (no direct writes, no state in Orchestrator, etc.) are developer and architect reference material. They are already partially covered by the Foundation Invariants. Consider consolidating or moving to a dedicated architecture governance page. |
| 8 | **Roger Connection** | Keep | Keep — collapsed | This section explains the Roger read-only integration model and dependency chain. It is directly relevant to stakeholders asking "How does Roger consume DCT data?" and is not duplicated elsewhere on the landing page. |
| 9 | **Failure Modes** | Keep | Keep — collapsed | Failure mode documentation is important for QA leads, architects, and delivery teams. It is not duplicated elsewhere and supports governance conversations. Collapsed by default is appropriate. |

---

## Duplicate Content Identified

The following content appears in more than one location and should be reviewed for consolidation:

| Content | Location 1 | Location 2 | Recommendation |
|---------|-----------|-----------|----------------|
| System ownership table (Layer / System / Responsibility) | Home.tsx — System Ownership accordion | RogerVsDCTRoles page | Consolidate into RogerVsDCTRoles or a dedicated Architecture page. Remove from landing page. |
| End-to-end flow diagram | Home.tsx — End-to-End Flow accordion | IntegrationAlignmentHub page | Keep on IntegrationAlignmentHub; remove from landing page accordion. |
| Governance Note (non-production disclaimer) | Home.tsx — Purpose accordion | GovernanceBanner component (appears at page bottom) | GovernanceBanner already handles this. Consider removing from Purpose accordion body. |

---

## Sections with Limited Executive Value on Landing Page

The following sections contain content that is valuable but better suited to a dedicated reference page rather than the executive command center:

- **End-to-End Delivery Model** — Architecture diagram; belongs on an architecture or onboarding page.
- **System Ownership Model** — Reference table; belongs on a governance or architecture page.
- **Platform Capabilities** — Informational narrative; belongs on a capabilities or onboarding page.
- **Architecture Guardrails** — Developer/architect rules; belongs on an architecture governance page.

---

## Recommended Landing Page Accordion Footprint (Post-Cleanup)

If the four move candidates are relocated to dedicated pages, the landing page accordion stack would reduce to five sections, all of which directly answer executive questions:

| # | Section | Executive Question Answered |
|---|---------|---------------------------|
| 1 | Purpose | What is DCT and why does it exist? |
| 2 | Batch Portfolio Overview | What is complete, active, and planned? |
| 3 | Foundation Invariants | What are the non-negotiable governance rules? |
| 4 | Roger Connection | How does Roger consume DCT data? |
| 5 | Failure Modes | What can go wrong and how is it governed? |

---

## Next Steps

This report is analysis only. No content has been deleted or moved. Recommended actions for the team to consider:

1. **Review the four "Move" candidates** with the architecture and delivery team before relocating them.
2. **Confirm whether an Architecture Reference page** should be created to house the End-to-End Flow, System Ownership, Platform Capabilities, and Architecture Guardrails sections.
3. **Evaluate the duplicate content** in the System Ownership table and Governance Note before any consolidation.
4. **Consider opening Batch Portfolio by default** given its high usage frequency among delivery teams.

---

*This report was generated as part of the DCT Delivery Model executive dashboard refinement initiative. All content remains in the codebase and can be restored or relocated at any time.*
