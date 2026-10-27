// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { site as cfg, socialLinks } from './src/config/site.ts';

// Docs social icons come from src/config/site.ts; only configured links appear.
const socialIcons = { GitHub: 'github', Discord: 'discord', X: 'x.com', LinkedIn: 'linkedin', YouTube: 'youtube', Instagram: 'instagram' };
const social = socialLinks.map((l) => ({ icon: socialIcons[l.label], label: l.label, href: l.href }));

export default defineConfig({
  site: cfg.url,
  integrations: [
    starlight({
      title: 'OASA Docs',
      titleDelimiter: '·',
      disable404Route: true,
      description: 'Guides, standards and Academy material from the Open Autonomous Systems Alliance.',
      logo: { light: './src/assets/oasa-mark.svg', dark: './src/assets/oasa-mark-dark.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/fonts.css', './src/styles/starlight.css'],
      social,
      ...(cfg.links.websiteRepo ? { editLink: { baseUrl: `${cfg.links.websiteRepo}/edit/main/` } } : {}),
      components: {
        SocialIcons: './src/components/docs/SocialIcons.astro',
        Footer: './src/components/docs/Footer.astro',
        Head: './src/components/docs/Head.astro',
      },
      sidebar: [
        { label: 'Start here', items: [
          { label: 'Overview', slug: 'docs' },
          { label: 'Principles', slug: 'docs/principles' },
          { label: 'Governance', slug: 'docs/governance' },
          { label: 'Code of conduct', slug: 'docs/code-of-conduct' },
          { label: 'Glossary', slug: 'docs/glossary' },
        ] },
        { label: 'Membership', items: [
          { label: 'How membership works', slug: 'docs/membership' },
          { label: 'New member start', slug: 'docs/new-members' },
          { label: 'Projects', slug: 'docs/projects' },
          { label: 'Claim a node', slug: 'docs/claim-a-node' },
        ] },
        { label: 'Building', items: [
          { label: 'Standards', slug: 'docs/standards' },
          { label: 'Software standard', slug: 'docs/software-standard' },
          { label: 'Update standard', slug: 'docs/update-standard' },
          { label: 'Adopting software', slug: 'docs/adopting-software' },
          { label: 'Software register', slug: 'docs/software-register' },
          { label: 'Licensing', slug: 'docs/licensing' },
          { label: 'Academy', slug: 'docs/academy' },
          { label: 'Contributing', slug: 'docs/contributing' },
          { label: 'Brainstorm with AI', slug: 'docs/brainstorm' },
          { label: 'Building with AI agents', slug: 'docs/agents' },
          { label: 'OASA-FILES', slug: 'docs/oasa-files' },
        ] },
        { label: 'Chapters', items: [{ label: 'Start a chapter', slug: 'docs/start-a-chapter' }] },
      ],
    }),
  ],
});
