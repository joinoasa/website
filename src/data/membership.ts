// Membership stages and application questions.
// Source: OASA-operations.md, System 1 (Membership Pipeline).
// The home page, /join/ and the docs all use these six stage titles.

import { collectedLabels } from './application';

export const stages: { title: string; body: string }[] = [
  { title: 'Apply or get invited', body: 'Apply here, or ask any member to invite you. Teams and school cohorts can apply together.' },
  { title: 'Review', body: "We look at what you've built or done. A formal portfolio isn't required. Raw ability counts." },
  { title: 'Interview', body: 'A video call about your skills, what drives you and what you want to build.' },
  { title: '30-day trial', body: 'Work on an OASA project or your own, as long as it moves autonomy forward. You can ask the whole community for help.' },
  { title: 'Decision', body: "You're accepted, or you get feedback and an invitation to reapply." },
  { title: 'Onboarding', body: 'Accounts, the contributor agreement and an onboarding buddy.' },
];

// Questions for the email fallback (used when site.apply.formUrl is null).
// The form itself is defined in src/data/application.ts.
export const applicationQuestions: string[] = collectedLabels;
