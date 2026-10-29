// src/config/site.ts
// Every value the owner must supply or confirm lives here. Search for "TODO(owner)".
// null hides the link or sentence that uses it. Never put a guessed value here.

export type NavLink = { href: string; label: string };

export const site = {
  name: 'Open Autonomous Systems Alliance',
  shortName: 'OASA',
  url: 'https://joinoasa.org', // TODO(owner): confirm production domain before DNS cutover
  description:
    'The Open Autonomous Systems Alliance is a member-built community designing open, encrypted drones, robots and boats for American communities.',
  locale: 'en_US',
  themeColor: '#0b253a',
  phase: 'Phase 0: home base', // from OASA-roadmap.md; update when the phase changes

  email: {
    general: 'hello@joinoasa.org', // the one OASA inbox (Proton; catch-all for @joinoasa.org)
    membership: null as string | null, // null routes to general (hello@)
    chapters: null as string | null, // null routes to general (hello@)
    security: null as string | null, // null routes to general (hello@); also used in /.well-known/security.txt
    press: null as string | null, // TODO(owner): press address; null routes press to general
    partners: null as string | null, // TODO(owner): partnerships address; null routes to general
    engineering: null as string | null, // TODO(owner): OASA Engineering contact (agencies, contracts); null routes to general
  },

  apply: {
    formUrl: '/join/apply/' as string | null, // built-in form (worker/index.ts + D1); null = email application with a question template
    turnstileSiteKey: '0x4AAAAAAFoBr1NfaoqmFMa6' as string | null, // Cloudflare Turnstile site key (public; widget "joinoasa apply form"). The secret goes in TURNSTILE_SECRET. null = no widget
  },

  links: {
    github: 'https://github.com/joinoasa' as string | null,
    websiteRepo: 'https://github.com/joinoasa/website' as string | null, // turns on docs "Edit page"
    ideaBoard: 'https://github.com/orgs/joinoasa/discussions' as string | null,
    ideas: 'https://github.com/joinoasa/ideas' as string | null, // numbered idea inbox; /ideas/ lists it
    ideaForm: 'https://github.com/joinoasa/ideas/issues/new?template=idea.yml' as string | null,
    techtreeIssues: 'https://github.com/joinoasa/techtree' as string | null, // node popups link to a prefilled new issue here when a node has no issue yet
    discord: 'https://discord.gg/v6vTxaKV3' as string | null, // permanent invite; set to never expire in Discord
    share: 'https://share.joinoasa.org' as string | null, // members' shared drive (joinoasa/share), GitHub sign-in
    ledger: null as string | null, // TODO(owner): public ledger (e.g. Open Collective) once the fiscal sponsor is set
    newsletter: null as string | null, // TODO(owner): newsletter signup URL
  },

  social: {
    x: 'https://x.com/joinoasa' as string | null,
    linkedin: null as string | null, // TODO(owner)
    youtube: 'https://www.youtube.com/@joinoasa' as string | null,
    instagram: null as string | null, // TODO(owner)
  },

  org: {
    founderName: null as string | null, // TODO(owner): shown on /about/ when set
    founderBio: null as string | null, // TODO(owner): one or two sentences
    board: [] as string[], // TODO(owner): nonprofit board names once seated
    fiscalSponsor: null as string | null, // TODO(owner): fiscal sponsor name once signed
    mailingAddress: null as string | null, // TODO(owner): nonprofit postal address
  },

  membership: {
    responseTime: null as string | null, // TODO(owner): e.g. 'within two weeks'; null hides the line
    // Owner decision: adult members (18+) only for now. Set true to open 15 to 17 again:
    // the form then offers the age choice and guardian field, and the Worker accepts them.
    // The youth consent steps in docs/membership are still planned, not built; do not flip this before they are.
    youthOpen: false,
  },

  security: {
    responseTime: null as string | null, // TODO(owner): acknowledgement target, e.g. 'within three business days'
    securityTxtExpires: '2027-10-20T00:00:00.000Z', // TODO(owner): renew at least yearly
  },

  policies: {
    draftDate: '2026-10-20', // shown on draft pages (privacy, code of conduct, licensing)
  },
};

export type EmailKind = keyof typeof site.email;

/** Address for an audience, falling back to the general mailbox. */
export const contact = (kind: EmailKind): string => site.email[kind] ?? site.email.general;

/** mailto: URL with optional subject and body (encoded). */
export const mailto = (address: string, subject?: string, body?: string): string => {
  const q = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean).join('&');
  return `mailto:${address}${q ? `?${q}` : ''}`;
};

/** Configured social and community links only (label, href). */
export const socialLinks: NavLink[] = [
  site.links.github && { label: 'GitHub', href: site.links.github },
  site.links.discord && { label: 'Discord', href: site.links.discord },
  site.social.x && { label: 'X', href: site.social.x },
  site.social.linkedin && { label: 'LinkedIn', href: site.social.linkedin },
  site.social.youtube && { label: 'YouTube', href: site.social.youtube },
  site.social.instagram && { label: 'Instagram', href: site.social.instagram },
].filter(Boolean) as NavLink[];

export const nav = {
  primary: [
    // Short on purpose: Moonshots, Chapters, About and Docs live in the footer.
    { href: '/techtree/', label: 'Tech tree' },
    { href: '/ideas/', label: 'Ideas' },
    { href: '/roles/', label: 'Open roles' },
  ] as NavLink[],
  apply: { href: '/join/', label: 'Apply to join', short: 'Apply' },
  footer: [
    { heading: 'Explore', links: [
      { href: '/techtree/', label: 'Tech tree' }, { href: '/moonshots/', label: 'Moonshots' }, { href: '/ideas/', label: 'Ideas' }, { href: '/chapters/', label: 'Chapters' } ] },
    { heading: 'Join', links: [
      { href: '/join/', label: 'Apply to join' }, { href: '/roles/', label: 'Open roles' }, { href: '/docs/membership/', label: 'How membership works' }, { href: '/docs/code-of-conduct/', label: 'Code of conduct' }, { href: '/members/', label: 'Member hub' } ] },
    { heading: 'Learn', links: [
      { href: '/docs/', label: 'Docs' }, { href: '/docs/principles/', label: 'Principles' }, { href: '/docs/standards/', label: 'Standards' }, { href: '/docs/academy/', label: 'Academy' } ] },
    { heading: 'Organization', links: [
      { href: '/about/', label: 'About' }, { href: '/partners/', label: 'Partners' }, { href: '/contact/', label: 'Contact' }, { href: '/security/', label: 'Security' }, { href: '/privacy/', label: 'Privacy' } ] },
  ] as { heading: string; links: NavLink[] }[],
};
