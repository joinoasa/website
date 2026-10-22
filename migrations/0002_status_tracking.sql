-- Status tracking, identity and review records for applications.
-- Additive only: the table is not rebuilt. Applied by deploy.yml (or: npm run db:migrate).
-- Written by the apps:* scripts (scripts/apps-*.mjs); the status list is enforced there,
-- because SQLite cannot add a CHECK on status to an existing table without a rebuild.

-- Optional identity from the form (worker/index.ts).
ALTER TABLE applications ADD COLUMN discord_handle   TEXT;
ALTER TABLE applications ADD COLUMN github_username  TEXT;

-- Review dates. Dates only (YYYY-MM-DD) except interview_at, which may include a time.
ALTER TABLE applications ADD COLUMN updated_at   TEXT;   -- last change made by a script
ALTER TABLE applications ADD COLUMN interview_at TEXT;
ALTER TABLE applications ADD COLUMN trial_start  TEXT;   -- set by apps:set when entering trial
ALTER TABLE applications ADD COLUMN trial_end    TEXT;   -- trial_start + 30 days
ALTER TABLE applications ADD COLUMN decision_at  TEXT;   -- when accepted, declined or withdrawn; drives the retention clock

-- Interview rubric, 1 to 5 each (apps:score). NULL until scored.
ALTER TABLE applications ADD COLUMN score_skill         INTEGER CHECK (score_skill         BETWEEN 1 AND 5);
ALTER TABLE applications ADD COLUMN score_talent        INTEGER CHECK (score_talent        BETWEEN 1 AND 5);
ALTER TABLE applications ADD COLUMN score_ambition      INTEGER CHECK (score_ambition      BETWEEN 1 AND 5);
ALTER TABLE applications ADD COLUMN score_initiative    INTEGER CHECK (score_initiative    BETWEEN 1 AND 5);
ALTER TABLE applications ADD COLUMN score_collaboration INTEGER CHECK (score_collaboration BETWEEN 1 AND 5);

-- Existing rows and new ones: updated_at starts equal to created_at.
UPDATE applications SET updated_at = created_at WHERE updated_at IS NULL;
CREATE TRIGGER IF NOT EXISTS applications_set_updated_at
AFTER INSERT ON applications
WHEN NEW.updated_at IS NULL
BEGIN
  UPDATE applications SET updated_at = NEW.created_at WHERE id = NEW.id;
END;

-- History: one row per status change or note. Private; never shown to applicants.
CREATE TABLE IF NOT EXISTS application_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id      INTEGER NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  from_status TEXT,
  to_status   TEXT,
  note        TEXT
);
CREATE INDEX IF NOT EXISTS application_events_app ON application_events (app_id, at);
