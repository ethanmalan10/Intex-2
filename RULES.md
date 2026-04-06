# Team Rules and Implementation Guardrails

## Goal of This File

Define non-negotiable product and engineering rules so the team stays aligned while building fast.

## Product Rules

- Keep the donor persona central in public UX decisions.
- Every public impact metric must be aggregated and anonymized.
- If a feature does not improve donor trust, staff efficiency, or resident safety, deprioritize it.
- Prioritize required rubric features before optional enhancements.

## Access and Privacy Rules

- Never expose resident-level sensitive details on public pages.
- Restrict sensitive note fields to authorized staff only.
- Donor users can only access their own donation history and personal impact summary.
- Admin-only for create/update/delete on protected operational data, unless course requirements explicitly allow otherwise.

## Security Rules

- Enforce HTTPS and redirect HTTP to HTTPS.
- Use role-based authorization on both frontend routes and backend endpoints.
- Implement stronger password policy than framework defaults, aligned with class guidance.
- Use CSP response headers (not meta tags).
- Require confirmation on all delete actions.
- Do not commit credentials or secrets.

## Data and Reporting Rules

- Treat `donations` and `donation_allocations` as the source of truth for donor resource use.
- Keep contribution types unified across UI and reporting:
  - Monetary
  - In-kind
  - Time
  - Skills
  - Social media advocacy
- All dashboard metrics must include clear labels, time range, and definition.

## UX and Quality Rules

- All pages must support desktop and mobile layouts.
- Accessibility target: Lighthouse accessibility score >= 90 per page.
- Provide useful empty states, validation, and error handling.
- Keep navigation role-aware and easy to understand.

## Analytics and Measurement Rules

- Track at least one meaningful OKR metric in-app.
- Prefer decision metrics over vanity metrics (for example, donation referrals over likes).
- Show a clear linkage between donor input (contributions) and program outcomes.

## Delivery Rules

- Document features in demo videos clearly; undocumented features do not count.
- Keep URLs and test credentials accurate in final submission.
- Make repository and deliverables easy for graders to verify quickly.

## Change Management

- Update this file when a requirement interpretation changes.
- If a new feature conflicts with these rules, discuss and resolve before implementation.
