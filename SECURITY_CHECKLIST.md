# Security Regression Checklist

Use this checklist before release and in CI.

## Secrets and configuration

- Confirm `JWT_SECRET` is set in environment secrets and not committed to source.
- Confirm `DATABASE_URL` is provided from secrets management.
- Confirm `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` are unset after initial bootstrap.
- Confirm `KNOWN_PROXIES` and/or `KNOWN_NETWORKS_CIDR` are configured in deployed environments.

## Dependency scanning

- Frontend: run `npm audit --audit-level=high` in `frontend`.
- Backend: run `dotnet list package --vulnerable --include-transitive` in `backend`.
- Review and resolve high/critical vulnerabilities before release.

## Auth and abuse controls

- Verify login and protected write endpoints return `429` when rate limits are exceeded.
- Verify lockout behavior after repeated failed sign-in attempts.
- Verify only `Admin` and `staff` can access resident/case-management APIs.

## Input validation and error handling

- Verify invalid payloads return `400` with safe error messages.
- Verify unhandled backend failures return `application/problem+json` without sensitive internals in production.
- Verify frontend displays generic error messages and never shows raw backend payload details.

## Manual spot checks

- Try invalid donation/supporter inputs (missing required, invalid email, negative amount).
- Try invalid resident/process/home-visitation references (unknown IDs).
- Verify fallback banners and retry actions appear when API calls fail.
