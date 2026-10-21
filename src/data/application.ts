// Application form fields. One list drives three things:
//   the form at /join/apply/, the server check in worker/index.ts, and the list on /privacy/.
// Column names in migrations/0001_applications.sql match `name`.
// To add a question: add it here, add a column in a new migration file, then deploy.

export type FieldKind = 'text' | 'email' | 'textarea' | 'radio' | 'checkbox';

export interface Field {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** Max characters accepted (checked in the browser and on the server). */
  max: number;
  hint?: string;
  autocomplete?: string;
  options?: { value: string; label: string }[];
  /** Shown only when this other field has this value; required then too if `required`. */
  showWhen?: { field: string; value: string };
  /** Hidden when this other field has this value (and ignored by the server). */
  hideWhen?: { field: string; value: string };
}

export const YOUTH = '15-17';
export const ADULT = '18+';

export const fields: Field[] = [
  { name: 'name', label: 'Name', kind: 'text', required: true, max: 120, autocomplete: 'name' },
  { name: 'email', label: 'Email', kind: 'email', required: true, max: 254, autocomplete: 'email', hint: 'We use this to reply about your application.' },
  { name: 'city_state', label: 'City and state', kind: 'text', required: true, max: 120, hint: 'For example: Reston, VA' },
  { name: 'nearest_chapter', label: 'Nearest chapter', kind: 'text', max: 120, hint: 'If you know one. Leave it blank if not.' },
  {
    name: 'age_group', label: 'Age group', kind: 'radio', required: true, max: 8,
    options: [{ value: ADULT, label: '18 or older' }, { value: YOUTH, label: '15 to 17' }],
    hint: 'Members must be 15 or older.',
  },
  {
    name: 'guardian_email', label: "Parent or guardian's email", kind: 'email', required: true, max: 254,
    showWhen: { field: 'age_group', value: YOUTH },
    hint: "Members aged 15 to 17 need a parent or guardian's consent. We'll contact them before your trial starts.",
  },
  { name: 'skills', label: 'Skills', kind: 'textarea', required: true, max: 2000, hint: 'What can you do? Code, CAD, electronics, flying, machining, writing, teaching, leading. Anything counts.' },
  { name: 'links', label: 'Links to your work', kind: 'textarea', max: 2000, hint: 'GitHub, builds, photos, videos, anything. One per line.' },
  { name: 'interests', label: 'Tech tree nodes or areas you are interested in', kind: 'textarea', max: 1000, hint: 'Node IDs from the tech tree or plain words are both fine.' },
  { name: 'time_commitment', label: 'Time you can give', kind: 'text', max: 200, hint: 'For example: a few hours a week.' },
  { name: 'why', label: 'Why do you want to join OASA?', kind: 'textarea', required: true, max: 3000 },
  {
    name: 'contract_interest', label: "I'm interested in paid contract work through OASA Engineering", kind: 'checkbox', max: 3,
    hideWhen: { field: 'age_group', value: YOUTH },
    hint: '18 or older only. Optional.',
  },
  { name: 'invited_by', label: 'Invited by a member? Their name', kind: 'text', max: 120 },
  { name: 'consent', label: 'I have read how OASA handles application information', kind: 'checkbox', required: true, max: 3 },
];

/** Labels for the privacy page (skips the consent box itself). */
export const collectedLabels = fields.filter((f) => f.name !== 'consent').map((f) => f.label);
