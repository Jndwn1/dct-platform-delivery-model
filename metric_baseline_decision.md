# Locked MVP Metric Baseline

**Decision date:** August 18, 2026  
**Decision owner:** Jenniver Stafford, BA Manager  
**Authoritative source:** User-confirmed ADO baseline supplied in the dashboard review

## Approved Baseline

The current dashboard baseline is **28 total MVP features**, composed of **23 batch features** and **5 active non-batch MVP features**. The mutually exclusive current lifecycle buckets are **15 Complete**, **11 Active / In Development**, **2 In Review**, and **0 Planned**. The completed value is the approved remainder of the confirmed 28-feature population after the 11 Active and 2 In Review features are accounted for.

| Metric | Approved value | Authoritative calculation rule | Display scope |
|---|---:|---|---|
| Total MVP features | 28 | 23 batch features + 5 active non-batch MVP features | Primary dashboard KPI |
| Total batch features | 23 | Batch subset of the MVP feature population | Batch detail only |
| MVP features complete | 15 | 28 total − 11 Active − 2 In Review − 0 Planned | Primary dashboard KPI |
| MVP features active | 11 | Current ADO Active feature list: 6 batch + 5 non-batch features | Primary dashboard KPI |
| MVP features in review | 2 | Two ADO Review Ready B31 records | Primary dashboard KPI |
| MVP features planned | 0 | No current Not Started MVP record in the approved baseline | Primary dashboard KPI |
| Overall MVP readiness | 54% | 15 Complete ÷ 28 Total MVP Features | Primary dashboard KPI |
| Batch readiness | 65% | 15 Complete ÷ 23 batch features | Batch detail only |
| PI delivery | Derived by PI membership | Current batch-feature subset only; never substitute this measure for the MVP portfolio KPI | PI detail |
| QA validation | Separate measure | QA test/readiness state; never substitute this measure for delivery completion | QA / release detail |
| Historical PI3 closures | Separate measure | July 28 baseline plus later dated closures; never substitute this measure for current lifecycle status | Historical reporting |

## ADO Activity Mapping

| ADO activity | Dashboard lifecycle bucket | Rule |
|---|---|---|
| Active | In Development | Applies to the six active batch features and five active non-batch MVP features |
| Review Ready | In Review | Applies to the two B31 records |
| Not Started | Planned | No approved current record is in this bucket |
| Complete | Complete | Approved remaining MVP records |

## Retired Conflicting Definitions

| Prior display | Why it was incorrect | Disposition |
|---|---|---|
| 27 total batches / 32 total MVP features | Included four historical split or excluded records in the current MVP scope | Retired |
| 22 Complete / 3 In Development / 2 In Review | Mixed prior portfolio assumptions with current ADO activity | Retired |
| 20 or 15 completed batches without scope label | Used different batch-only versus overall-MVP populations | Replaced with explicit 15/28 MVP and 15/23 batch labels |
| Active ADO feature count shown as complete delivery | Activity and lifecycle were conflated | Prohibited by the mapping above |

## Change-Control Rule

> No dashboard metric may be changed from this baseline unless the business owner provides a new ADO baseline or explicitly approves a revised population and calculation rule. ADO activity, QA validation, historical closures, and current portfolio lifecycle remain independent dimensions.
