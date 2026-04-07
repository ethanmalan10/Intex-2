# ML Pipeline Deployment Map

This file is the quick verification map for TA review of deployment integration.

## 1) Donor Recurrence and Revenue Forecast
- Notebook: `pipeline/donor-recurrence-forecast.ipynb`
- API endpoints:
  - `POST /api/ml/donor-recurrence`
  - `GET /api/ml/monthly-revenue-forecast`
- Frontend integration:
  - Donor-at-risk table
  - Monthly forecast chart
- Backend route file(s): `TODO-add-path`
- Frontend file(s): `TODO-add-path`
- Verification:
  - Submit a sample donor payload and confirm returned recurrence score.
  - Load forecast page and confirm projected monthly values render.

## 2) Resident Risk Escalation
- Notebook: `pipeline/resident-risk-escalation.ipynb`
- API endpoint: `POST /api/ml/resident-risk-score`
- Frontend integration:
  - Resident profile risk badge
  - Top-factor panel
- Backend route file(s): `TODO-add-path`
- Frontend file(s): `TODO-add-path`
- Verification:
  - Submit a sample resident payload and confirm risk score.
  - Confirm high-risk residents are highlighted in UI.

## 3) Reintegration Readiness
- Notebook: `pipeline/reintegration-readiness.ipynb`
- API endpoint: `POST /api/ml/reintegration-readiness`
- Frontend integration:
  - Case conference prioritization queue
  - Readiness trend widget
- Backend route file(s): `TODO-add-path`
- Frontend file(s): `TODO-add-path`
- Verification:
  - Submit resident payload and confirm readiness probability.
  - Confirm readiness trend widget reflects API output.

## 4) Social Content Donation Impact
- Notebook: `pipeline/social-content-donation-impact.ipynb`
- API endpoint: `POST /api/ml/social-post-impact`
- Frontend integration:
  - Pre-publish planning estimator
- Backend route file(s): `TODO-add-path`
- Frontend file(s): `TODO-add-path`
- Verification:
  - Submit draft post payload and confirm referral/value estimates.
  - Confirm UI updates estimates when content parameters change.

## Database Note
- Current deployed behavior: live model scoring endpoints and UI integration are available.
- Planned enhancement: persist prediction history and audit logs in database.
