# Plans and User Management

Published new offers: **Free Reader**, **Legacy Sower $3.33/month**, and
**Covenant Sower $7.77/month** in USD. The new-plan page no longer offers yearly
billing. Stripe/backend validate the actual cents; prices are not rounded from
an unrelated annual amount. Historical annual subscriptions remain available
for billing history/cancellation, not new purchases.

`/admin/users` excludes deleted/tombstoned accounts through the backend's default
filter. **View deleted accounts** opens `/admin/deleted-users`, an admin-only,
read-only archive. Ordinary inactive users are not mistaken for deleted users.
Search, pagination and counts are filtered server-side. No account data is
permanently erased to clean the user list.

English dates use **Nov 17, 2026**. Date storage, input formats and non-English
localization are unchanged.

Verification: 83 test files, 498 tests passed; full production build (including
TypeScript checks) passed. Tests cover archive-only requests, no mutation controls,
date formatting, plus backend regressions for list/count isolation and billing.
