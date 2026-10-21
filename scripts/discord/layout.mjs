// The OASA Discord server layout. Edit this file, then re-run `npm run discord:setup`.
// The setup script matches existing roles and channels by name, so renaming here
// creates a new one (rename in Discord too, or both will exist).

// Roles, highest first. Created roles land in this order under the bot's own role.
export const roles = [
  { name: 'Core', color: '#A61E6E', hoist: true, perms: ['moderate', 'manage'] },
  { name: 'Moderator', color: '#B7791F', hoist: true, perms: ['moderate'] },
  { name: 'Lead', color: '#2A5FA8', hoist: true, perms: ['invite'] },
  { name: 'Builder', color: '#1F7A4D', hoist: true, perms: ['invite'] },
  { name: 'Member', color: '#7FA8DE', hoist: true, perms: ['invite'] },
  { name: 'Trial', color: '#8E9AAD', hoist: true, perms: [] },
  // A label only: shows a member is 15 to 17. Keep 18+ spaces (contract work) closed to it.
  { name: 'Youth (15-17)', color: '#F29CCB', hoist: false, perms: [] },
  { name: 'Applicant', color: null, hoist: false, perms: [] },
];

// Who can see each area. "everyone" = anyone who joins the server.
const MEMBERS = ['Trial', 'Member', 'Builder', 'Lead', 'Core', 'Moderator'];
const STAFF = ['Core', 'Moderator'];

// access: 'open' (everyone reads and writes), 'readonly' (everyone reads; writers post),
//         or a list of roles that can see it (everyone else can't).
export const categories = [
  {
    name: 'Start here',
    access: 'open',
    channels: [
      { name: 'welcome', topic: 'What OASA is and how to join. Start here.', access: 'readonly', writers: STAFF, post: 'welcome' },
      { name: 'rules', topic: 'How we treat each other. Read before posting.', access: 'readonly', writers: STAFF, post: 'rules' },
      { name: 'announcements', topic: 'News from the OASA team.', access: 'readonly', writers: STAFF },
      { name: 'lobby', topic: 'Questions about OASA or applying? Ask here.', slowmode: 30 },
      { name: 'applicants', topic: 'For applicants: interview scheduling and questions.', access: ['Applicant', ...MEMBERS] },
    ],
  },
  {
    name: 'Community',
    access: MEMBERS,
    channels: [
      { name: 'general', topic: 'Talk with other members.' },
      { name: 'introductions', topic: 'Say who you are, what you build and what you want to work on.' },
      { name: 'help', topic: 'Stuck on something? Ask the whole community.' },
      { name: 'show-and-tell', topic: 'Builds, flights, tests, failures. Share what you made.' },
      { name: 'off-topic', topic: 'Anything else.' },
      { name: 'Hangout', type: 'voice' },
      { name: 'Build session', type: 'voice' },
    ],
  },
  {
    name: 'Projects',
    access: MEMBERS,
    channels: [
      { name: 'air', topic: 'Quads, VTOL, fixed wing, blimps and kites.' },
      { name: 'ground', topic: 'Wheeled, tracked and legged robots.' },
      { name: 'sea', topic: 'Surface boats, solar boats and cleanup vessels.' },
      { name: 'underwater', topic: 'Subs and ROVs.' },
      { name: 'mesh-radio', topic: 'Encrypted mesh, radios, antennas and links.' },
      { name: 'software-tak', topic: 'Autonomy stack, ground control, TAK integration.' },
      { name: 'tech-tree-ideas', topic: 'New nodes, moonshots and ideas for the tech tree. https://joinoasa.org/techtree/' },
      { name: 'Project call', type: 'voice' },
    ],
  },
  {
    name: 'Staff',
    access: STAFF,
    channels: [
      { name: 'staff', topic: 'Core team and moderators.' },
      // Holds the website's application alerts (names and cities). Core only.
      { name: 'applications', topic: 'New applications from joinoasa.org. Core only.', access: ['Core'] },
      { name: 'mod-log', topic: 'Moderation actions and reports.' },
      { name: 'leads', topic: 'Project and chapter leads with the core team.', access: ['Lead', 'Core'] },
    ],
  },
];

// Server-wide safety settings (applied with --apply).
export const guildSettings = {
  verification_level: 2, // Medium: verified email and on Discord 5+ minutes
  explicit_content_filter: 2, // scan media from all members
  default_message_notifications: 1, // only @mentions by default
};

// First messages, posted only into an empty channel.
export const posts = {
  welcome: [
    '**Welcome to the Open Autonomous Systems Alliance (OASA).**',
    'We are a member-built community designing open, encrypted drones, robots and boats for American communities.',
    '',
    '• **Join:** apply at https://joinoasa.org/join/ (15 and up; members aged 15 to 17 need a parent or guardian\'s consent).',
    '• **Explore:** the tech tree at https://joinoasa.org/techtree/',
    '• **Questions:** ask in #lobby.',
    '',
    'Member channels open once you start your 30-day trial.',
  ].join('\n'),
  rules: [
    '**Rules** (full code of conduct: https://joinoasa.org/docs/code-of-conduct/)',
    '',
    '1. Respect everyone. No harassment or discrimination.',
    '2. Safety first: people, property, airspace and waterways.',
    '3. Follow the law and OASA security rules.',
    '4. Protect youth members. Adults: keep conversations with members aged 15 to 17 in public channels, never in DMs.',
    '5. Keep member and contract information confidential.',
    '',
    'Problem? Tell a Moderator, or email hello@joinoasa.org with "Conduct" in the subject.',
  ].join('\n'),
};
