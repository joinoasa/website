-- The open role an applicant picked on the form (src/data/roles.ts slug), or NULL.
-- Additive only. Applied by deploy.yml (or: npm run db:migrate).
ALTER TABLE applications ADD COLUMN role TEXT;
