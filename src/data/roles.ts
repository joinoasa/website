// Open roles. One list drives the board at /roles/, the "Role" question on /join/apply/
// and the server check in worker/index.ts. Private access details: admin repo, access/roles.md.
// Slugs are stored with applications (D1 column `role`), so never rename one; retire it instead.

export type Track = 'Build' | 'Community' | 'Coordination' | 'Operations';

export interface Role {
  slug: string;
  title: string;
  track: Track;
  /** Who can hold it. */
  who: string;
  hours: string;
  /** 'always': standing role, many holders. 'open': looking for people. 'invite': by invite only. */
  status: 'always' | 'open' | 'invite';
  /** True when applicants can pick it on the application form. */
  apply: boolean;
  purpose: string;
  duties: string[];
  fits?: string;
  needs?: string;
}

export const roles: Role[] = [
  {
    slug: 'researcher', title: 'Researcher', track: 'Build', who: 'Any member', hours: 'Any', status: 'always', apply: true,
    purpose: 'Push one discipline forward: RF, autonomy, power, navigation, sensing or any other field in the tech tree.',
    duties: [
      'Pick up tech tree nodes in your field and claim them.',
      'Write down what you learn so it can become an Academy course.',
      "Review other people's work in your field and refine its estimates.",
    ],
    fits: 'Students, hobbyists and professionals in any engineering or science field.',
  },
  {
    slug: 'systems-engineer', title: 'Systems engineer', track: 'Build', who: 'Any member', hours: 'Any', status: 'always', apply: true,
    purpose: 'Make the parts fit together into vehicles, nodes and kits that work.',
    duties: [
      'Own the interfaces between nodes: power, data, mounting and timing.',
      'Write integration tests and full-build checklists.',
      'Keep the standards current as designs change.',
    ],
    fits: 'People who like the whole picture as much as the parts.',
  },
  {
    slug: 'network-engineer', title: 'Network engineer', track: 'Build', who: 'Any member', hours: 'Any', status: 'always', apply: true,
    purpose: "Build OASA's encrypted mesh and the shared research grid.",
    duties: [
      'Design and test mesh links, routing and the TAK map connection.',
      'Build lab network nodes: one sign-in, encrypted links, simple monitoring.',
      'Hold to the rule: every link encrypted.',
    ],
    fits: 'Networking, radio and distributed systems people.',
  },
  {
    slug: 'web-developer', title: 'Front-end web developer', track: 'Build', who: 'Any member', hours: 'Any', status: 'always', apply: true,
    purpose: 'Keep joinoasa.org clear, fast and useful.',
    duties: [
      'Build pages and features in Astro, including the interactive tech tree.',
      'Keep every page working on phones and without JavaScript.',
      'Turn member feedback into small, reviewed pull requests.',
    ],
    fits: 'HTML, CSS, TypeScript and design people.',
  },
  {
    slug: 'discord-moderator', title: 'Discord moderator', track: 'Community', who: 'Members', hours: '1–3 a week', status: 'open', apply: true,
    purpose: 'Keep the Discord friendly, safe and on topic.',
    duties: [
      'Enforce the code of conduct and welcome new people.',
      'Log every moderation action.',
      'Escalate anything serious to an admin the same day.',
    ],
    needs: 'Two-factor authentication on Discord.',
  },
  {
    slug: 'github-triager', title: 'GitHub moderator and triager', track: 'Community', who: 'Members', hours: '1–3 a week', status: 'open', apply: true,
    purpose: 'Keep ideas and issues sorted so builders find work fast.',
    duties: [
      'Sort new ideas with the triage guide and link duplicates.',
      'Label issues, close stale ones and point people to the right repo.',
      'Keep discussions on topic and within the code of conduct.',
    ],
  },
  {
    slug: 'people-coordinator', title: 'People coordinator', track: 'Community', who: 'Members', hours: '2–5 a week', status: 'open', apply: true,
    purpose: 'Help every new member find their feet and stay active.',
    duties: [
      'Run onboarding: welcome calls, first-week checklists and a first task.',
      "Check in during trials and with members who've gone quiet.",
      'Tell admins when someone is ready for a new tier or role.',
    ],
    needs: 'Sees names and handles, never application data.',
  },
  {
    slug: 'project-manager', title: 'Project manager', track: 'Coordination', who: 'Builders', hours: '3–6 a week', status: 'open', apply: false,
    purpose: 'Get a moonshot, or a group of nodes, from plan to done.',
    duties: [
      'Break the work into nodes and task cards and keep the status current.',
      'Run short check-ins and clear blockers.',
      'Track estimates against real hours and report progress.',
    ],
    needs: 'Builder tier.',
  },
  {
    slug: 'access-admin', title: 'Access admin', track: 'Operations', who: 'Members for 30+ days', hours: '2–4 a week', status: 'invite', apply: false,
    purpose: 'Make sure everyone has the access their role needs, and nothing more.',
    duties: [
      'Grant and remove access on GitHub, Discord and Cloudflare from access requests.',
      'Log every change the same day.',
      'Run the quarterly access review.',
    ],
  },
  {
    slug: 'security-admin', title: 'Identity and security admin', track: 'Operations', who: 'Members for 30+ days', hours: '2–4 a week', status: 'invite', apply: false,
    purpose: "Keep every member's accounts secure and the security standard followed.",
    duties: [
      'Run the OASA password manager: invites, vaults, recovery and removals.',
      'Help members set up two-factor authentication and security keys.',
      'Check new members meet the security rules before access is granted.',
    ],
  },
  {
    slug: 'network-admin', title: 'Network admin', track: 'Operations', who: 'Members for 30+ days', hours: '3–6 a week', status: 'invite', apply: false,
    purpose: 'Run the shared research grid day to day.',
    duties: [
      'Keep lab sign-ins, encrypted tunnels and monitoring working.',
      'Bring new labs and equipment onto the grid under the lab rules.',
      'Approve bookings and make sure equipment is off when not in use.',
    ],
  },
];

export const STATUS_LABEL: Record<Role['status'], string> = { always: 'Always open', open: 'Open', invite: 'By invite' };

/** Roles an applicant can pick on the form. */
export const applyRoles = roles.filter((r) => r.apply);

export const roleTitle = (slug: string): string => roles.find((r) => r.slug === slug)?.title ?? slug;
