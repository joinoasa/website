import type { APIRoute } from 'astro';
import { site, contact } from '../../config/site';

export const GET: APIRoute = () =>
  new Response(
    [
      `Contact: mailto:${contact('security')}`,
      `Expires: ${site.security.securityTxtExpires}`,
      `Policy: ${site.url}/security/`,
      'Preferred-Languages: en',
      `Canonical: ${site.url}/.well-known/security.txt`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
