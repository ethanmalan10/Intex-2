# Architecture Overview

## Purpose

This document defines the working architecture for the INtex W26 nonprofit platform.
It is planning-focused and should be updated as implementation decisions are finalized.

## High-Level System

- Frontend: React + TypeScript (Vite)
- Backend API: .NET 10 / ASP.NET Core
- Data: relational database (Azure SQL, PostgreSQL, or MySQL)
- Identity: ASP.NET Identity (same DB or separate identity DB)
- Hosting: cloud deployment (publicly accessible)

## Core Architecture Principles

- Donor trust first: make impact and resource use transparent.
- Privacy by design: only aggregated/anonymized data in public views.
- Least privilege: strict role and endpoint access controls.
- Data consistency: one source of truth for donations, allocations, and outcomes.
- Operational clarity: staff workflows should reduce manual tracking overhead.

## User Roles and Access

- Public (unauthenticated)
  - View landing, impact dashboard (anonymized), privacy, and login.
- Donor (authenticated)
  - View own donation history and personal impact summary.
- Staff/Admin (authenticated, role-restricted)
  - Full workflow access; CUD operations limited to admin per project rules.

## Feature Modules

### 1) Public Experience
- Landing page (mission + CTA)
- Public Impact Dashboard (aggregated metrics, trends, allocation usage)
- Privacy Policy
- Cookie Consent

### 2) Donor Operations
- Supporter profiles
- Donations (monetary, in-kind, time, skills, social media)
- Donation allocations by safehouse and program area
- Donor segmentation and lifecycle status

### 3) Case Management
- Caseload inventory
- Process recording
- Home visitation and case conference tracking
- Intervention and incident tracking

### 4) Analytics and Reporting
- Operational trends (donations, outcomes, safehouse metrics)
- Public impact snapshots
- Social media effectiveness and donation attribution

## Data Flow (Conceptual)

1. Staff records donation/contribution events.
2. Donations are allocated to safehouse/program areas.
3. Case operations generate ongoing outcome records.
4. Aggregation pipeline produces public-safe impact metrics.
5. Public dashboard and donor views consume role-appropriate outputs.

## API Boundary (Planning)

- Public endpoints
  - Landing content
  - Published impact snapshots and aggregate trends
  - Authentication endpoints (`/login`, `/auth/me`)
- Protected endpoints
  - All staff/admin CRUD
  - Donor personal data endpoints (ownership-checked)

## Security Architecture Notes

- Enforce HTTPS and HTTP->HTTPS redirect.
- Use secure password policies (course-aligned).
- Apply RBAC on UI and API layers.
- Add CSP header with explicit sources only.
- Require delete confirmations for destructive actions.
- Store secrets out of source control.

## Suggested Primary Screens

- Public: Landing, Impact Dashboard, Privacy/Login
- Donor: Personal Donation + Impact page
- Staff/Admin: Admin dashboard, Donors & Contributions, Caseload pages

## Open Decisions

- Final cloud provider topology for app + DB.
- Identity DB co-located vs separate.
- Which single OKR metric is shown in-app first.
- Which ML pipeline is integrated first in production.
