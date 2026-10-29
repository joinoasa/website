---
title: Setup checklist
description: Everything a new OASA member sets up, in order. Tick it off with your buddy in your first week.
lastUpdated: 2026-10-29
head:
  - tag: script
    content: |
      document.addEventListener('DOMContentLoaded', () => {
        const key = 'oasa-setup-checklist';
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
        document.querySelectorAll('.sl-markdown-content input[type="checkbox"]').forEach((box, i) => {
          box.disabled = false;
          box.checked = !!saved[i];
          box.setAttribute('aria-label', (box.parentElement.textContent || 'Item').trim());
          box.addEventListener('change', () => {
            saved[i] = box.checked;
            try { localStorage.setItem(key, JSON.stringify(saved)); } catch {}
          });
        });
      });
---

Work through this in your first week. Tick each box as you go (your progress is saved in this browser). Your buddy goes through it with you, and the details for each step are on [New member start](/docs/new-members/). Stuck on a step? Ask your buddy or in Discord.

## Day 1: accounts

- [ ] Two-factor sign-in on **GitHub** (authenticator app, passkey or security key; not text messages)
- [ ] Two-factor sign-in on **Discord**
- [ ] Accept the **GitHub invite** at [github.com/joinoasa](https://github.com/joinoasa), then make your membership public
- [ ] Join **Discord**, accept the rules and say hello in `#introductions`
- [ ] Bookmark the **[Member hub](/members/)**

## Your OASA email

Your buddy sends your sending login through a one-time 1Password link.

- [ ] Mail to `first.last@joinoasa.org` arrives in your inbox
- [ ] **Send mail as** your OASA address in Gmail (or your mail app)
- [ ] Gmail filter: **To** `joinoasa.org` → label **OASA**, **never send to Spam**
- [ ] Your **signature** from the [signature page](/email-signature/)
- [ ] The **OASA avatar** on the Google account for your address
- [ ] Test email to your buddy, **from a different address** than your own

## Files and tools

- [ ] Sign in to the **shared drive** at [share.joinoasa.org](https://share.joinoasa.org) with GitHub, and read *00 Start Here*
- [ ] Use your **GitHub no-reply email** for commits (only if you'll write code)

## Your first work

- [ ] Read the [core values](https://github.com/joinoasa/brand/blob/main/documents/core-values/core-values.md) and the [manifesto](https://github.com/joinoasa/brand/blob/main/documents/manifesto/manifesto.md)
- [ ] Read [How work gets done](/docs/how-work-gets-done/), and if you don't write code, [Start without code](/docs/start-without-code/)
- [ ] Agree a **first task** with your buddy or mentor, and note it in Discord
- [ ] Know your **weekly check-in** time

When every box is ticked, tell your buddy. They tick it off on your trial checklist.
