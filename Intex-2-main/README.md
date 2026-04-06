# INTEX - Donor-Driven Safehouse Platform

This repository contains a web application for a nonprofit that supports girls in safehouses.
The product is designed to be data-driven, secure, and useful for both public donors and
internal staff.

## Product Goal

Build a secure platform that:
- helps donors understand how their money is used,
- helps staff run donor and case-management workflows,
- communicates anonymized impact clearly,
- satisfies IS 401/413/414/455 case requirements.

## Primary Persona

- A donor who wants to help but does not know how.
- She needs clear calls to action, trust signals, and visible proof of impact.

## Key User Views

### Public (Non-Authenticated)
- Landing page with mission, trust, and conversion CTAs.
- Impact/Donor-Facing dashboard with aggregated and anonymized outcomes.
- Privacy policy and cookie consent.
- Login entry point.

### Authenticated (Staff/Admin + Donor)
- Admin dashboard command center.
- Donors and contributions management (all contribution types).
- Caseload and case documentation pages.
- Reports and analytics.
- Donor personal history/impact tracking (role-scoped, own data only).

## Data Domains

- Donor and support domain: supporters, donations, allocations, partners.
- Case management domain: residents, recordings, visits, interventions, incidents.
- Outreach domain: social posts, engagement, donation referrals, public snapshots.

## Security Baseline

- HTTPS everywhere and HTTP to HTTPS redirect.
- Authentication + role-based authorization.
- Protected APIs with least privilege.
- CSP header and secure credential handling.
- Restricted handling of sensitive resident notes.

## Planning Docs

- Architecture details: `ARCHITECTURE.md`
- Team/product guardrails: `RULES.md`

## Project Status

Planning and wireframe refinement.
