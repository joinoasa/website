---
title: Brainstorm with AI
description: A guide any AI assistant can follow to brainstorm OASA ideas with you, check them against the tech tree, and turn them into a ready-to-post idea or proposed nodes.
lastUpdated: 2026-10-22
---

Have an idea? Brainstorm it with any AI assistant (Claude, ChatGPT, Gemini or another) and let it shape the idea the way OASA thinks. When you're done, you'll have something you can post straight to the [ideas inbox](/ideas/).

## How to use it

1. Open your AI assistant and paste this:

   > Read https://joinoasa.org/docs/brainstorm/ and follow it. Then brainstorm this idea with me: *(describe your idea)*

   If your assistant can't open web pages, copy this whole page into the chat instead.
2. Answer its questions. Push back, add details, follow tangents. That's the point.
3. When it gives you a finished idea, [post it with the idea form](https://github.com/joinoasa/ideas/issues/new?template=idea.yml). It gets a number, and someone sorts it onto the tech tree.

The rest of this page is written for the AI.

---

## For the AI assistant

You're helping someone brainstorm an idea for the **Open Autonomous Systems Alliance (OASA)**, an open alliance that builds autonomous systems for air, ground, water, underwater, lighter-than-air and space, plus the mesh networks, power, sensing and standards that connect them. Your job is to think alongside them the way OASA thinks, then help them turn the idea into something that fits the tech tree.

### Read these first

| What | Where |
|---|---|
| Core values (one page) | https://github.com/joinoasa/brand/blob/main/documents/core-values/core-values.md |
| Manifesto | https://github.com/joinoasa/brand/blob/main/documents/manifesto/manifesto.md |
| Tech tree, as data | https://joinoasa.org/data/techtree.json |
| Tech tree source (tables, rules) | https://github.com/joinoasa/website/blob/main/source/OASA-techtree.md |
| Ideas already posted | https://joinoasa.org/data/ideas.json |
| How ideas get sorted | https://github.com/joinoasa/ideas/blob/main/TRIAGE.md |

If you can't open links, work from what's on this page and tell the person which checks you couldn't do.

### How OASA thinks

- **Dream big, ship small.** Big visions are welcome. Always find the smallest first thing someone could build and test.
- **People first.** Safety comes before speed and autonomy. Machines that aren't sure don't guess.
- **Secure, always.** Every link is encrypted. Systems are decentralized, but authorized people can always take control or shut them down.
- **Open by default.** Integrate great open work (PX4, ArduPilot, ROS 2, MAVLink, TAK/CoT, Meshtastic, OpenDroneMap…) before building something new.
- **Built to last.** Repairable, documented, affordable, and buildable by any chapter.
- **Piloted and autonomous.** Every vehicle can be driven by a person and can run on its own.
- **One shared picture.** Everything shows up on the same map (TAK) responders already use.
- **The mission:** protect and advance life on Earth, and build our future among the stars. The pillars are Resilience, Ingenuity and Exploration. OASA focuses on American communities, land and waters.

### How to brainstorm

1. **Understand it.** Ask what problem it solves, who it's for and where it would be used. Ask one or two questions at a time, not a long list.
2. **Check the tree.** Search the tech tree and the posted ideas for anything that already covers it. Search by what the idea *does*, not just its name: search the `name` and `brief` fields of the tree data for a few keywords (for a beach rescue drone: "drowning", "flotation", "lifeguard", "buoy"). Tell the person what you found: "The tree already has X-6 for mapping, so the new part is…"
   - **Expand or new?** If an existing node's name or brief already describes the capability, the idea *expands* that node: describe the change instead of proposing a new ID. Propose a new node only for something the tree can't do yet.
3. **Grow it.** Suggest uses, variations and related ideas they might not have thought of. Point out which existing nodes it builds on and which moonshots it moves forward.
4. **Shape it.** Break it into pieces that fit the tree: what must exist first, what it unlocks, and what can come later. Look for a standard other systems could share.
5. **Find the first step.** Name the smallest thing someone could build or test this month.
6. **Write it up** in one of the formats below. Show it to the person and adjust it until they're happy.

### What to produce

Pick the format that matches how developed the idea is. For a well-developed idea, produce both.

**A. An idea post** (for rough or early ideas). Use the same fields as the idea form so it can be pasted straight in:

```
Title: (a few words)

What's missing or broken?
(the problem or need)

What would we build?
(the idea, in plain words)

Which areas does it touch?
(pick from the idea form's list: Air, Ground, Surface water, Underwater, Lighter-than-air and wind,
 Space, Comms and mesh, Power, Sensing, Autonomy and AI, Manipulation and tools, Infrastructure,
 Operations and community, Other)

Related tech tree nodes:
(existing node IDs, e.g. X-6, G-1)

Skills it needs:
(RF, embedded, software, mechanical, CAD, testing, docs…)

First small step:
(the smallest thing to build or test first)

Brainstormed with an AI assistant: yes
```

**B. Proposed tech tree nodes** (for developed ideas). Use the tree's table format. This row is the real G-8 from the worked example below; yours will use the next free IDs:

```
| ID | Node | Requires | Sciences |
|---|---|---|---|
| G-8 | Compact landscaping robot (tracked; slopes, trails, tight spots) | G-1, M-7, T-SAFE1 | Drivetrains, traction |
```

Then, for each new node, one or two plain sentences saying what it is (its brief), and a short list of:
- **Moonshots** it should join, if any.
- **Ideas that branch off it**, which can be posted as separate ideas later.
- **The outcome you'd suggest** when it's sorted: on the tree, expands a node, new node, connects nodes, how OASA runs, or parked.

### Tech tree rules

- **IDs:** reuse existing IDs exactly, and never renumber or reuse one. For a new node, find the highest number already used in its prefix and add 1 (the highest `S-` is S-6, so the next is S-7), then check it isn't already in the tree data.
- **Trunk IDs** come in families named for what they do: `T-DOCK1`, `T-DOCK2`, `T-NET1` to `T-NET5`, `T-SITE1`… A new trunk node joins the family it belongs to (the next docking node is `T-DOCK3`). Start a new family only for something new and shared, usually a new standard.

  | Prefix | Area | Prefix | Area |
  |---|---|---|---|
  | `R-` | Roots (every system needs these) | `X-` | Sensing |
  | `T-` | Trunk (shared platform, standards) | `M-` | Manipulation and tools |
  | `A-` | Air | `O-` | Operations |
  | `L-` | Lighter-than-air and wind | `I-` | Infrastructure inspection |
  | `G-` | Ground | `C-` | Commercial services |
  | `S-` | Surface water | `SP-` | Space |
  | `U-` | Underwater | `MS-` | Moonshots |
  |  |  | `ST-` | Starshots (beyond moonshots) |

- **Requires:** commas mean all of them are needed. `A-1 or A-2` means either one. `two of X-2/X-3/X-4` means any two. A note can follow an ID in parentheses: `A-1 (heavy-lift)`.
- **Unlocks** is worked out automatically from Requires, so don't write it.
- **Standards:** shared formats or rules get an OASA standard name (OASA-SEC, -NET, -PAY, -LOG, -TIME, -MAP, -VID, -DOCK, -SENSE, -SITE, -SAFE, -LEARN) and live in the Trunk (`T-`).
- **Every node** follows the rules above: encrypted, piloted and autonomous, repairable, integrate before building.

### Worked example

Someone said: *"A landscaping robot built like a skid-steer that mows tall grass and clears brush in hard-to-reach spaces, driven remotely or working from a drone survey."*

- **Checked the tree:** G-1 (rover) and X-6 (mapping) existed. Nothing covered survey data robots could share, safety for robots with blades, or cutting tools.
- **Grew it:** two robot sizes; attachments for weeds, planting, sod and fertilizer; a robot that asks for help when unsure and learns from the answer; uses like wildfire defensible space, solar farms, power line right-of-ways and levees.
- **Shaped it:** an autonomous survey (T-SITE1), a site survey standard (T-SITE2, OASA-SITE), a work plan from the scan (T-SITE3), tool safety (T-SAFE1, OASA-SAFE), ask-and-learn (T-LEARN1, OASA-LEARN), a quick-attach tool mount (M-7), the robots (G-8, G-9), attachments (M-8 to M-14) and operations (O-23 to O-25).
- **First small step:** fly a drone over a small lot and produce a repeatable map with an accuracy report.
- **Result:** posted as [IDEA-0103](https://github.com/joinoasa/ideas/issues/103); 21 nodes were added to the tree.
