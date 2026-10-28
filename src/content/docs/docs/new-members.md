---
title: New member start
description: Your first week as an OASA member. Set up your accounts, learn how OASA fits together and pick something to build.
lastUpdated: 2026-10-28
---

Welcome to the alliance. This page takes about an hour, and you can do it at your own pace. Use AI as much as you like: pointing an agent at a repo is the fastest way to learn it.

## 1. Set up your accounts

1. **Turn on two-factor authentication** on GitHub (an authenticator app, passkey or security key; text messages don't count) and on Discord. The OASA GitHub organization requires it.
2. **Accept your GitHub invite** at [github.com/joinoasa](https://github.com/joinoasa). Then make your membership public: your profile → Organizations → joinoasa → Public. Some automations, like `/claim`, only recognize public members.
3. **Use your GitHub no-reply email for commits** (GitHub → Settings → Emails → "Keep my email addresses private"). Every OASA repo is public, so this keeps your personal email out of the history.
4. **Join the Discord** with the invite in your welcome email, accept the rules and say hello in `#introductions`.
5. **Install the basics:** Git, Node.js 22, Python 3 and an editor. Or skip installing anything and open any code repo in GitHub Codespaces; each one has a ready-made dev container.
6. **Read two short documents:** the [core values](https://github.com/joinoasa/brand/blob/main/documents/core-values/core-values.md) and the [manifesto](https://github.com/joinoasa/brand/blob/main/documents/manifesto/manifesto.md). Everything else follows from them.

### Your OASA email

You get **first.last@joinoasa.org** when your trial starts. Mail to it arrives in your own inbox, and you send from it in the mail app you already use. Your buddy sends you a sending login through a one-time 1Password link and walks you through this:

1. **Gmail:** Settings → See all settings → Accounts and Import → *Send mail as* → *Add another email address*. Untick "Treat as an alias". SMTP server `email-smtp.us-east-1.amazonaws.com`, port 587, TLS, and the login from your buddy. Enter the confirmation code Gmail sends to your new address.
2. **Signature:** make it on the [email signature page](/email-signature/) and paste it into Gmail.
3. **Profile picture:** create a free Google account for your joinoasa.org address (accounts.google.com → Create account → *Use my current email address instead*) and set the [OASA avatar](/email/oasa-avatar-512.png) as its picture. Every OASA account uses the same one. This account is also how you join OASA's shared Drive.
4. **Send your buddy a test email.**

Your login can only send as your own address. Keep it in a password manager and never share it.

## 2. How OASA is organized

Everything lives in the public GitHub organization [joinoasa](https://github.com/joinoasa). Each repo has an `AGENTS.md` that explains it to people and AI alike.

| Repo | What it holds |
|---|---|
| `website` | joinoasa.org, and the source of truth for the [tech tree](/techtree/) |
| `techtree` | One issue per tech tree node: where work is claimed and tracked |
| `ideas` | The numbered [ideas inbox](/ideas/). Anyone can post |
| `brand` | Logos, colors, art, the core values and the manifesto |
| `oasa-sec` | OASA-SEC: the encrypted link every OASA machine uses |
| `oasa-lab` | The test lab: simulated radios, flight simulators and evidence bundles |
| `oasa-radio` | Open radio work, including software-defined radio |

## 3. How work flows

**Idea → triage → tech tree node → claim or task card → work in a project repo → done.**

- **Ideas** come in through the ideas repo, GitHub Discussions or an [AI brainstorm](/docs/brainstorm/). Each gets a number and an automatic first look.
- **Triage** decides where an idea lands: an existing node, a new node, or parked.
- **The tech tree** connects everything from first parts to moonshots. When work is marked done, the next nodes unlock.
- **Claiming:** comment `/claim` on an available node's issue ([how](/docs/claim-a-node/)). Smaller jobs are **task cards**, labeled `agent-ready` when an AI agent can finish them alone.

## 4. Build with an AI agent

1. Clone a repo, or open it in Codespaces.
2. Start your agent (Claude Code, Codex, Cursor or another) in that folder. Claude Code reads `AGENTS.md` automatically; tell other agents to read it first.
3. Try a first prompt like this:

```text
Read AGENTS.md and oasa.toml in this repo, then the rules at joinoasa.org/docs/agents/.
Set up the repo, run the checks, and tell me what this repo does, what is in
progress, and three good first tasks for me.
```

Good places to send an agent: [Building with AI agents](/docs/agents/), the [open agent-ready tasks](https://github.com/search?q=org%3Ajoinoasa+label%3Aagent-ready+state%3Aopen&type=issues), [`/llms.txt`](/llms.txt) and the tree as data at [`/data/techtree.json`](/data/techtree.json).

Agents open pull requests and a person always reviews them. Tick the "AI-assisted" box when one helped.

## 5. Pick somewhere to start

- **Claim a node** on the [tech tree](/techtree/) that excites you.
- **Pick up a task card** from the agent-ready list.
- **Post an idea**, or brainstorm one with AI first.
- **Improve what's here:** docs, the website, the brand documents. Small fixes count.

Not sure? Ask in Discord. Someone will help you find a first task.

## Ground rules

- **No secrets** in code, issues, chat or logs: no tokens, keys or passwords.
- **Small, clear changes.** One topic per pull request, saying what changed and what you checked.
- **Brand:** no weapons in any art, and don't alter the logos. Writing everywhere is short, clear and not wordy.
- **Be a good host.** Follow the [code of conduct](/docs/code-of-conduct/) and lift others up.
