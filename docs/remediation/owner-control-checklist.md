# Owner-control checklist

This checklist is intentionally duplicated from the operational runbook as a compact release gate.

- [x] Native Vercel/TanStack build proven on migration branch
- [x] Native Supabase OAuth code path
- [x] Direct Stripe code path
- [x] Owner-controlled cron auth code path
- [x] Lovable packages removed from package manifest
- [x] Lovable auth integration deleted
- [ ] Owner-controlled ProvisionLoop Supabase project created
- [ ] Schema migrations replayed and verified
- [ ] Production data migrated
- [ ] Google OAuth configured on owner-controlled Supabase
- [ ] Direct Stripe keys/webhooks configured
- [ ] Resend DKIM verified and exposed key rotated
- [ ] Owner-controlled cron secret configured and scheduled run proven
- [ ] End-to-end smoke suite green
- [ ] Production cutover complete
- [ ] Lovable disconnected
