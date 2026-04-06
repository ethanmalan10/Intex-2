# Requirements Checklist

Use this as the single source of truth for coverage and completion status.

Status key:
- `[ ]` Not started
- `[-]` In progress
- `[x]` Completed

## IS401 - Project Management and Systems Design

### Monday - Requirements
- [ ] Scrum Master and Product Owner identified
- [ ] Two customer personas created and justified
- [ ] Journey map with current steps and pain points
- [ ] Problem statement finalized
- [ ] MoSCoW table completed
- [ ] At least five nice-to-have ideas added
- [ ] One feature intentionally not built, with reason
- [ ] Product backlog with product goal and at least 12 cards
- [ ] Monday sprint backlog with at least 8 cards, point estimates, and one owner per card
- [ ] Monday sprint backlog screenshot captured before work starts
- [ ] Burndown chart initialized
- [ ] Wireframes for 3 most important desktop screens

### Tuesday - Design
- [ ] Tuesday sprint backlog with at least 8 cards, points, and one owner each
- [ ] Tuesday sprint backlog screenshot captured before work starts
- [ ] 3 UI options generated
- [ ] 3 screenshots for each UI option (9 total)
- [ ] 5 AI questions documented for each UI option
- [ ] Takeaways documented for each UI option
- [ ] Final design selected and justified
- [ ] Three changes from original AI output documented
- [ ] Tech stack diagram completed (frontend, backend, database)

### Wednesday - One Working Page
- [ ] Wednesday sprint backlog with at least 8 cards, points, and one owner each
- [ ] Wednesday sprint backlog screenshot captured before work starts
- [ ] Current-state screenshots of at least 5 pages in desktop and mobile
- [ ] One page deployed to cloud and persisting data in DB
- [ ] User feedback session completed
- [ ] Five specific changes from user feedback documented
- [ ] Burndown chart updated

### Thursday - Iterate
- [ ] Thursday sprint backlog with at least 8 cards, points, and one owner each
- [ ] Thursday sprint backlog screenshot captured before work starts
- [ ] One meaningful OKR metric tracked and displayed in-app
- [ ] Accessibility score >= 90 on every page
- [ ] Responsiveness validated for all pages
- [ ] Team retrospective completed (per-person reflections + team reflection)

## IS413 - Enterprise Application Development

### Required Public Pages
- [ ] Home/Landing page with modern design and clear CTAs
- [ ] Impact/Donor-facing dashboard with anonymized aggregate impact
- [ ] Login page with validation and error handling
- [ ] Privacy policy page linked in footer
- [ ] Cookie consent notification implemented

### Required Authenticated Pages
- [ ] Admin dashboard command center
- [ ] Donors and Contributions page with supporter profile management
- [ ] Support for all contribution types: Monetary, InKind, Time, Skills, SocialMedia
- [ ] Donation allocation visibility by safehouse and program area
- [ ] Caseload Inventory page
- [ ] Process Recording page with chronological history
- [ ] Home Visitation and Case Conferences page
- [ ] Reports and Analytics page

### Platform/Implementation
- [ ] Backend uses .NET 10 / C#
- [ ] Frontend uses React + TypeScript (Vite)
- [ ] Relational DB selected and implemented
- [ ] App deployed publicly
- [ ] Database deployed
- [ ] Validation and error handling implemented

## IS414 - Security

### Confidentiality
- [ ] HTTPS enabled with valid certificate
- [ ] HTTP redirected to HTTPS

### Authentication and Authorization
- [ ] Username/password authentication implemented
- [ ] Password policy configured to class-required values (not default)
- [ ] Public pages accessible without authentication where appropriate
- [ ] Authenticated pages protected appropriately
- [ ] API endpoints protected appropriately
- [ ] RBAC enforced
- [ ] Admin-only CUD operations
- [ ] Donor-only access to own donation history/impact

### Integrity and Credentials
- [ ] Data changes/deletes restricted to authorized users
- [ ] Delete confirmation required
- [ ] Credentials handled securely (no secrets in repo)

### Privacy and Mitigations
- [ ] GDPR-compliant privacy policy populated and linked
- [ ] GDPR cookie consent implemented and documented
- [ ] CSP header configured as HTTP response header

### Availability and Extras
- [ ] Site publicly accessible
- [ ] At least one additional security/privacy feature implemented

## IS455 - Machine Learning

### Pipeline Expectations
- [ ] At least one complete predictive pipeline
- [ ] At least one complete explanatory/causal analysis pipeline
- [ ] Each pipeline addresses a different business problem
- [ ] Each pipeline includes full lifecycle sections from framing to deployment
- [ ] Proper validation used (train/test split or cross-validation)
- [ ] Feature selection rationale documented
- [ ] Results interpreted in business terms
- [ ] Deployment/integration into web app demonstrated

### Notebook and Repo Expectations
- [ ] Notebooks placed in `ml-pipelines/`
- [ ] Notebook names are descriptive
- [ ] Notebooks are executable top-to-bottom
- [ ] Data paths are reproducible in repo structure

## Final Submission and Presentation

- [ ] Website URL verified and correct
- [ ] GitHub URL verified and correct branch/repo visibility
- [ ] Pipeline notebook links verified
- [ ] Class-specific video links verified and public/unlisted
- [ ] Video evidence includes all required features
- [ ] Credentials provided: admin (no MFA), donor (no MFA), one MFA-enabled account
- [ ] Presentation demo flow rehearsed (business value + substantive tech demo)
- [ ] Peer evaluation submitted on time

