// Builds the OASA Discord server from scripts/discord/layout.mjs.
//
//   npm run discord:setup              # dry run: shows what would change, changes nothing
//   npm run discord:setup -- --apply   # makes the changes
//
// Needs two environment variables (PowerShell):
//   $env:DISCORD_BOT_TOKEN = "your bot token"
//   $env:DISCORD_GUILD_ID  = "your server ID"
// Safe to re-run: it matches roles and channels by name, creates what's missing and
// updates the rest. It never deletes anything; leftovers are listed at the end.
import { roles, categories, guildSettings, posts } from './layout.mjs';

const API = process.env.DISCORD_API ?? 'https://discord.com/api/v10';
const TOKEN = process.env.DISCORD_BOT_TOKEN?.trim();
const GUILD = process.env.DISCORD_GUILD_ID?.trim();
const APPLY = process.argv.includes('--apply');

if (!TOKEN || !GUILD) {
  console.error('Set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID first. See the README section "Discord server".');
  process.exit(1);
}

// Permission bits (https://discord.com/developers/docs/topics/permissions)
const P = {
  INVITE: 1n << 0n, KICK: 1n << 1n, BAN: 1n << 2n, ADMIN: 1n << 3n, MANAGE_CHANNELS: 1n << 4n,
  ADD_REACTIONS: 1n << 6n, AUDIT: 1n << 7n, STREAM: 1n << 9n, VIEW: 1n << 10n, SEND: 1n << 11n,
  MANAGE_MESSAGES: 1n << 13n, EMBED: 1n << 14n, ATTACH: 1n << 15n, HISTORY: 1n << 16n,
  MENTION_EVERYONE: 1n << 17n, EXT_EMOJI: 1n << 18n, CONNECT: 1n << 20n, SPEAK: 1n << 21n,
  MUTE: 1n << 22n, MOVE: 1n << 24n, VOICE_ACTIVITY: 1n << 25n, NICK: 1n << 26n,
  MANAGE_NICKS: 1n << 27n, MANAGE_ROLES: 1n << 28n, WEBHOOKS: 1n << 29n, APP_CMDS: 1n << 31n,
  MANAGE_THREADS: 1n << 34n, PUBLIC_THREADS: 1n << 35n, PRIVATE_THREADS: 1n << 36n,
  SEND_THREADS: 1n << 38n, TIMEOUT: 1n << 40n,
};
const or = (...bits) => bits.reduce((a, b) => a | b, 0n);

// What everyone in the server can do by default; channel access is then narrowed per category.
const EVERYONE = or(P.VIEW, P.SEND, P.SEND_THREADS, P.PUBLIC_THREADS, P.ADD_REACTIONS, P.HISTORY, P.EMBED,
  P.ATTACH, P.CONNECT, P.SPEAK, P.STREAM, P.VOICE_ACTIVITY, P.APP_CMDS, P.NICK, P.EXT_EMOJI);
const ROLE_PERMS = {
  invite: P.INVITE,
  moderate: or(P.MANAGE_MESSAGES, P.KICK, P.BAN, P.TIMEOUT, P.MANAGE_THREADS, P.AUDIT, P.MANAGE_NICKS,
    P.MUTE, P.MOVE, P.INVITE, P.MENTION_EVERYONE),
  manage: or(P.MANAGE_ROLES, P.MANAGE_CHANNELS, P.WEBHOOKS),
};
const WRITE = or(P.SEND, P.SEND_THREADS, P.PUBLIC_THREADS, P.PRIVATE_THREADS);
const TYPE = { text: 0, voice: 2, category: 4, announcement: 5 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(method, path, body) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(API + path, {
      method,
      headers: {
        Authorization: `Bot ${TOKEN}`,
        'User-Agent': 'DiscordBot (https://joinoasa.org, 1.0)',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      await sleep(Math.ceil((data.retry_after ?? 1) * 1000) + 100);
      continue;
    }
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const hint = res.status === 401 ? ' (bad bot token?)' : res.status === 403 ? ' (is the bot in the server with Administrator?)' : res.status === 404 ? ' (wrong server ID?)' : '';
      throw new Error(`${method} ${path} → ${res.status}${hint}: ${data.message ?? ''}`);
    }
    return data;
  }
  throw new Error(`${method} ${path}: rate limited too many times`);
}

const log = (sign, text) => console.log(`  ${sign} ${text}`);
const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
const colorInt = (hex) => (hex ? parseInt(hex.slice(1), 16) : 0);

async function main() {
  const me = await api('GET', '/users/@me');
  const guild = await api('GET', `/guilds/${GUILD}`);
  console.log(`${APPLY ? 'Applying to' : 'Dry run for'} "${guild.name}" as ${me.username}\n`);

  // ---- Server settings and @everyone
  console.log('Server');
  log('~', 'safety: Medium verification, scan media from all members, notify on @mentions only');
  if (APPLY) await api('PATCH', `/guilds/${GUILD}`, guildSettings);
  log('~', '@everyone: chat, react, voice; no invites (members invite)');
  if (APPLY) await api('PATCH', `/guilds/${GUILD}/roles/${GUILD}`, { permissions: EVERYONE.toString() });

  // ---- Roles
  console.log('\nRoles');
  const existingRoles = await api('GET', `/guilds/${GUILD}/roles`);
  const roleId = { everyone: GUILD };
  for (const r of roles) {
    const perms = or(...r.perms.map((p) => ROLE_PERMS[p]));
    const body = { name: r.name, color: colorInt(r.color), hoist: r.hoist, mentionable: false, permissions: perms.toString() };
    const found = existingRoles.find((x) => same(x.name, r.name));
    if (found) {
      roleId[r.name] = found.id;
      log('~', `${r.name} (update)`);
      if (APPLY) await api('PATCH', `/guilds/${GUILD}/roles/${found.id}`, body);
    } else {
      log('+', `${r.name} (create)`);
      roleId[r.name] = APPLY ? (await api('POST', `/guilds/${GUILD}/roles`, body)).id : `new:${r.name}`;
    }
  }

  // ---- Channels
  const overwrites = (access, writers, voice) => {
    if (!access || access === 'open') return [];
    if (access === 'readonly') {
      return [
        { id: GUILD, type: 0, allow: '0', deny: WRITE.toString() },
        ...(writers ?? []).map((n) => ({ id: roleId[n], type: 0, allow: WRITE.toString(), deny: '0' })),
      ];
    }
    const see = voice ? or(P.VIEW, P.CONNECT) : P.VIEW;
    return [
      { id: GUILD, type: 0, allow: '0', deny: P.VIEW.toString() },
      ...access.map((n) => {
        if (!roleId[n]) throw new Error(`layout.mjs: unknown role "${n}"`);
        return { id: roleId[n], type: 0, allow: see.toString(), deny: '0' };
      }),
    ];
  };

  let channels = await api('GET', `/guilds/${GUILD}/channels`);
  const used = new Set();
  const channelId = {};
  let position = 0;
  for (const cat of categories) {
    console.log(`\n${cat.name}`);
    const catBody = { name: cat.name, type: TYPE.category, position: position++, permission_overwrites: overwrites(cat.access) };
    let cat0 = channels.find((c) => c.type === TYPE.category && same(c.name, cat.name));
    if (cat0) {
      log('~', `category ${cat.name}`);
      if (APPLY) await api('PATCH', `/channels/${cat0.id}`, catBody);
    } else {
      log('+', `category ${cat.name}`);
      cat0 = APPLY ? await api('POST', `/guilds/${GUILD}/channels`, catBody) : { id: `new:${cat.name}` };
    }
    used.add(cat0.id);

    let inner = 0;
    for (const ch of cat.channels) {
      const voice = ch.type === 'voice';
      const access = ch.access ?? (cat.access === 'open' ? undefined : cat.access);
      const body = {
        name: ch.name,
        type: voice ? TYPE.voice : TYPE.text,
        parent_id: cat0.id,
        position: inner++,
        permission_overwrites: overwrites(access, ch.writers, voice),
        ...(voice ? {} : { topic: ch.topic ?? '', rate_limit_per_user: ch.slowmode ?? 0 }),
      };
      const found = channels.find((c) => !used.has(c.id) && (voice ? c.type === TYPE.voice : [TYPE.text, TYPE.announcement].includes(c.type)) && same(c.name, ch.name));
      const label = voice ? `🔊 ${ch.name}` : `#${ch.name}`;
      let id;
      if (found) {
        log('~', `${label}${found.parent_id !== cat0.id ? ' (move here)' : ''}`);
        if (APPLY) { const { type, ...patch } = body; await api('PATCH', `/channels/${found.id}`, patch); }
        id = found.id;
      } else {
        log('+', label);
        id = APPLY ? (await api('POST', `/guilds/${GUILD}/channels`, body)).id : `new:${ch.name}`;
      }
      used.add(id);
      channelId[ch.name] = id;
    }
  }

  // ---- First posts
  console.log('\nPosts');
  for (const cat of categories) for (const ch of cat.channels) {
    if (!ch.post) continue;
    const id = channelId[ch.name];
    const content = posts[ch.post].replace(/#([a-z0-9-]+)/g, (m, name) => (channelId[name] && !channelId[name].startsWith('new:') ? `<#${channelId[name]}>` : m));
    if (!id.startsWith('new:')) {
      const last = await api('GET', `/channels/${id}/messages?limit=1`);
      if (last.length) { log('=', `#${ch.name} already has messages (skipped)`); continue; }
    }
    log('+', `#${ch.name}: ${ch.post} message`);
    if (APPLY) await api('POST', `/channels/${id}/messages`, { content, allowed_mentions: { parse: [] } });
  }

  // ---- Leftovers
  channels = await api('GET', `/guilds/${GUILD}/channels`);
  const extra = channels.filter((c) => !used.has(c.id));
  if (extra.length) {
    console.log('\nNot in the layout (left alone; delete them in Discord if you don\'t need them)');
    for (const c of extra) log('?', c.type === TYPE.category ? `category ${c.name}` : c.type === TYPE.voice ? `🔊 ${c.name}` : `#${c.name}`);
  }

  console.log(APPLY
    ? '\nDone. In Discord, give yourself the Core role, and drag the bot\'s role to the top of the role list if any role update failed.'
    : '\nDry run only. Run again with --apply to make these changes:  npm run discord:setup -- --apply');
}

main().catch((err) => {
  console.error(`\nStopped: ${err.message}`);
  process.exit(1);
});
