# OASA Tech Tree

**Status:** Draft v0.2
**Companion docs:** OASA-concept.md (vision and system), OASA-roadmap.md (milestones, tasks, Ideas Inbox)

Like a tech tree in a video game: every system grows from the same **roots**, shares a common **trunk**, and splits into **branches** by domain. Finishing a node unlocks the nodes that depend on it. Small builds lead to big ones.

---

## How to Read This

**Every node has:**

| Field | Meaning |
|---|---|
| **ID** | Short code (e.g., `R-COM2`). Prefix shows where it lives in the tree |
| **Node** | The technology or capability |
| **Requires** | Nodes that must be done first |
| **Unlocks** | Nodes that become possible after |
| **Sciences** | What you learn building it (links to OASA Academy) |
| **Status** | 🟢 Available · 🔒 Locked · 🟡 In progress · ✅ Done |

- In **Requires**, commas mean all of these are needed. "A or B" means either one. "two of A/B/C" means any two.
- **Unlocks** is generated from Requires and the moonshot lists by `npm run techtree:sync`. Edit Requires, not Unlocks.
- Set 🟡 and ✅ by hand. 🟢 and 🔒 are worked out from Requires.

**ID prefixes**

| Prefix | Area |
|---|---|
| `R-` | Roots (every system needs these) |
| `T-` | Trunk (shared platform) |
| `A-` | Air |
| `L-` | Lighter-than-air & wind |
| `G-` | Ground |
| `S-` | Surface water |
| `U-` | Underwater |
| `X-` | Sensing |
| `M-` | Manipulation |
| `O-` | Operations |
| `I-` | Infrastructure inspection |
| `C-` | Commercial services |
| `SP-` | Space |
| `MS-` | Moonshots |
| `ST-` | Starshots (beyond moonshots: space and interstellar) |

**Rules every node follows**

- All communication is **encrypted**, wired or wireless.
- Every vehicle supports **piloted and autonomous** control.
- Designs are **maintainable**: documented, repairable, built from available parts.
- **Integrate first:** if a great open project already does it, the node is about integrating, not rebuilding.

**Hitting a wall?** If your project needs something that isn't done, find the missing node. If the node doesn't exist yet, propose it. That becomes a new project.

---

## 1. Roots

### Communications

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| R-COM1 | Basic radio link (off-the-shelf) | — | R-COM2, R-CTL1, T-PAY1, T-RF1 | RF basics, antennas | 🟢 |
| R-COM2 | Encrypted link (OASA-SEC v0) | R-COM1, R-SEC1 | R-COM4, T-MAP1, T-NET1, U-3, O-2, SP-1, MS-7 | Cryptography basics, networking | 🔒 |
| R-COM3 | Physical links (copper/fiber tether) | — | R-PWR4, L-4, U-1, U-2, I-1, C-3 | Fiber optics, cabling, signal integrity | 🟢 |
| R-COM4 | Laser links (free-space optical, encrypted) with in-flight pointing and tracking | R-COM2, T-RF3 | R-PWR5, SP-2, MS-17 | Optics, tracking control | 🔒 |

### Security

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| R-SEC1 | Device identity, keys, pairing | — | R-COM2, R-SEC2 | Cryptography, key management | 🟢 |
| R-SEC2 | Key rotation and device removal | R-SEC1 | T-NET1, MS-7 | Security engineering | 🔒 |

### Power

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| R-PWR1 | Batteries and BMS basics | — | R-PWR2, R-PWR3, R-PWR4, R-PWR5, T-PAY1, T-DOCK2, T-NODE1 | Electrochemistry, electronics | 🟢 |
| R-PWR2 | Solar charging | R-PWR1 | T-NODE2, A-5, A-9, L-2, L-5, S-2, S-3, O-2, MS-10, MS-20 | Photovoltaics, power electronics | 🔒 |
| R-PWR3 | Wind / kite power | R-PWR1 | L-3, MS-20 | Wind energy, aerodynamics | 🔒 |
| R-PWR4 | Tether power | R-PWR1, R-COM3 | A-4, U-2 | High-voltage DC, cabling | 🔒 |
| R-PWR5 | Wireless power beaming (laser/microwave) to vehicles in flight | R-PWR1, R-COM4 | MS-17 | Optics, photovoltaics, safety engineering | 🔒 |

### Control

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| R-CTL1 | Piloted (manual) control | R-COM1 | R-CTL2, U-1 | Control basics, human factors | 🔒 |
| R-CTL2 | Autonomous waypoint control | R-CTL1, R-NAV1 | T-MAP2, T-DOCK1, T-SIM1, A-1, A-2, L-5, G-1, G-2, S-1 | Control theory, PX4/ArduPilot | 🔒 |

### Navigation

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| R-NAV1 | GNSS positioning | — | R-CTL2, R-NAV2, R-NAV3, R-TIME1, T-MAP1, SP-1 | Satellite navigation | 🟢 |
| R-NAV2 | RTK precision positioning | R-NAV1 | T-DOCK1, G-6, X-6 | Geodesy, RTCM corrections | 🔒 |
| R-NAV3 | GNSS-denied navigation | R-NAV1, X-1 | G-2, G-5, U-5, I-4, SP-5 | Visual odometry, inertial nav | 🔒 |

### Time and Sensing

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| R-TIME1 | Time sync (OASA-TIME) | R-NAV1 | R-TIME2, T-VID1, T-RF2, X-5, MS-7 | Clocks, timing protocols | 🔒 |
| R-TIME2 | Backup timing and positioning network (works when GPS fails) | R-TIME1, T-NET4 | MS-20 | Clocks, radio navigation | 🔒 |
| X-1 | Camera and video streaming | — | R-NAV3, T-AI1, T-VID1, A-8, X-6, O-15, I-1 | Optics, video encoding | 🟢 |

---

## 2. Trunk (Shared Platform)

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| T-MAP1 | TAK bridge (position, battery, status) | R-COM2, R-NAV1 | T-MAP2, T-RF2, O-3, MS-7 | CoT, geospatial data | 🔒 |
| T-MAP2 | Tap-to-control from TAK | T-MAP1, R-CTL2 | T-NET3, T-AI3, T-TSK1 | Mission control, UX | 🔒 |
| T-NET1 | Small encrypted mesh (3–5 nodes) | R-COM2, R-SEC2 | T-NET2, T-NET5, T-NODE1, S-2, I-1 | Mesh networking | 🔒 |
| T-NET2 | Best-path routing + traffic priority | T-NET1 | T-NET3, T-VID1, T-TSK1, A-7, L-6, M-5, SP-3, MS-7 | Routing algorithms, QoS | 🔒 |
| T-NET3 | Multi-GCS handoff, multi-operator control | T-NET2, T-MAP2 | T-NET4, O-4 | Distributed systems | 🔒 |
| T-NET4 | Large mesh scaling (100+ nodes) | T-NET3 | R-TIME2, O-1, O-14, MS-1, MS-10 | Network scaling | 🔒 |
| T-NET5 | Meshtastic / LoRa bridge (encrypted gateway between OASA and Meshtastic networks) | T-NET1 | O-18, O-22, MS-20, MS-23 | LoRa, protocol bridging | 🔒 |
| T-PAY1 | Payload standard (OASA-PAY) | R-COM1, R-PWR1 | T-AI1, L-1, S-4, X-2, X-3, X-4, M-1, M-3, M-4, MS-7 | Mechanical/electrical interfaces | 🔒 |
| T-LOG1 | Black box logs (OASA-LOG) | — | A-9, O-8, SP-1, MS-7, MS-11 | Data formats, reliability | 🟢 |
| T-AI1 | Edge AI module | T-PAY1, X-1 | T-AI2, L-6, G-3, G-7, S-5, U-7, X-7, O-5, O-7, O-11, O-15, O-20, I-5, I-6, C-1, X-13 | Machine learning, computer vision | 🔒 |
| T-AI2 | Mission from a sentence ("survey the north field, find hogs") | T-AI1, T-TSK1 | T-AI3, SP-5, MS-18 | AI planning, language models | 🔒 |
| T-AI3 | Live voice commands mid-mission ("closer," "go further north," "look for thermals within 100 m of me") | T-AI2, T-MAP2 | MS-18 | Speech, spatial reasoning | 🔒 |
| T-VID1 | On-demand video over mesh | T-NET2, X-1, R-TIME1 | MS-2, MS-5, MS-7 | Video compression, streaming | 🔒 |
| T-TSK1 | Tasking, idle status, task handoff | T-MAP2, T-NET2 | T-AI2, T-TSK2, X-8, O-4, I-8, C-2, X-9, MS-5 | Scheduling, operations | 🔒 |
| T-TSK2 | Deploy-scout-return (a carrier launches a scout that comes back with where to go next) | T-TSK1, T-DOCK1 | MS-5 | Cooperative autonomy | 🔒 |
| T-DOCK1 | Precision landing on a dock | R-CTL2, R-NAV2 | T-TSK2, T-DOCK2, M-2 | Sensors, control | 🔒 |
| T-DOCK2 | Auto charging (OASA-DOCK) | T-DOCK1, R-PWR1 | L-7, G-4, S-6, O-4, O-6, O-8, O-17, MS-7 | Power electronics, mechanisms | 🔒 |
| T-SIM1 | Simulator / digital twin | R-CTL2 | SP-4, training | Simulation, physics engines | 🔒 |
| T-BENCH1 | Test bench + test software | — | MS-8, Quality across all nodes | Test engineering | 🟢 |
| T-RF1 | RF scanning in radios | R-COM1 | T-RF2, T-RF3, X-11 | Spectrum analysis, SDR | 🔒 |
| T-RF2 | Direction finding (bearings on TAK) | T-RF1, R-TIME1, T-MAP1 | Interference hunting | Antenna arrays, signal processing | 🔒 |
| T-RF3 | Beamforming | T-RF1 | R-COM4, A-6, MS-1, MS-10, MS-17, Longer links | Phased arrays, DSP | 🔒 |
| T-NODE1 | Backpack node kit | T-NET1, R-PWR1 | T-NODE2, MS-2 | Integration | 🔒 |
| T-NODE2 | Tower / vehicle / home node kits | T-NODE1, R-PWR2 | O-1, MS-1 | Integration, weatherproofing | 🔒 |

---

## 3. Branches by Domain

### 3.1 Air

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| A-1 | Reference quad (low cost) | R-CTL2 | A-3, A-4, A-7, A-10, O-5, O-16, I-2, I-3, I-6, I-9, C-1, C-3, X-10, X-11, SP-3 | Aerodynamics, propulsion | 🔒 |
| A-2 | Reference fixed-wing | R-CTL2 | A-3, A-5, A-7, A-8, I-6 | Aerodynamics, stability | 🔒 |
| A-3 | Reference VTOL | A-1, A-2 | O-10, MS-2 | Transition control | 🔒 |
| A-4 | Tethered relay drone | A-1, R-PWR4 | MS-1, MS-2 | Tether dynamics | 🔒 |
| A-5 | Solar fixed-wing | A-2, R-PWR2 | A-6, MS-10 | Solar aircraft design | 🔒 |
| A-6 | High-altitude solar plane / glider | A-5, T-RF3 | A-9, MS-1, MS-6, MS-10 | Long-endurance flight, energy budgeting | 🔒 |
| A-7 | Relay drone (extends small-drone range) | A-1 or A-2, T-NET2 | MS-5 | Network topology | 🔒 |
| A-8 | Autonomous soaring (thermal, ridge, dynamic soaring) | A-2, X-1 or air-data sensors | A-9, MS-10 | Meteorology, glider aerodynamics, energy-aware control | 🔒 |
| A-9 | Perma glider / atmospheric satellite | A-6, A-8, R-PWR2, T-LOG1 | MS-10 | Ultralight structures, day/night energy budgeting, long-duration reliability | 🔒 |
| A-10 | Biomimetic flyer (flapping wing, bird/insect-like) | A-1 | Quiet wildlife monitoring | Biomechanics, unsteady aerodynamics | 🔒 |

### 3.2 Lighter-Than-Air & Wind

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| L-1 | Kite payload platform | T-PAY1 | L-2, L-3, L-4 | Kite aerodynamics, tethers | 🔒 |
| L-2 | Solar kite (powers sensors aloft) | L-1, R-PWR2 | MS-1 | Lightweight solar | 🔒 |
| L-3 | Kite generator (airborne wind power) | L-1, R-PWR3 | MS-1 | Airborne wind energy | 🔒 |
| L-4 | Tethered aerostat | L-1, R-COM3 | L-5, MS-1 | Envelopes, lift gas | 🔒 |
| L-5 | Steerable solar blimp | L-4, R-PWR2, R-CTL2 | L-6, O-7 | Station keeping, envelope design | 🔒 |
| L-6 | Disaster blimp (heavy-lift sensors + repeaters) | L-5, T-NET2, T-AI1 | L-7, MS-2, MS-6 | Payload integration | 🔒 |
| L-7 | Blimp mothership (launch/recover drones) | L-6, T-DOCK2, M-2 | MS-5 | In-air recovery | 🔒 |

### 3.3 Ground

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| G-1 | Wheeled / tracked rover | R-CTL2 | G-3, G-4, G-5, G-6, G-7, O-5, O-10, I-1, C-4 | Mechanical engineering, drivetrains | 🔒 |
| G-2 | Legged robot | R-CTL2, R-NAV3 | G-5, I-4, Rough-terrain missions | Legged locomotion, ROS 2 | 🔒 |
| G-3 | City trash-pickup robot | G-1, T-AI1, M-1 | MS-4 | Manipulation, perception | 🔒 |
| G-4 | Rover mothership (carries/charges drones) | G-1, T-DOCK2 | MS-5 | Integration | 🔒 |
| G-5 | Underground explorer (caves, tunnels, collapsed buildings; autonomous 3D mapping; drops its own relays) | G-1 or G-2, R-NAV3, X-3, M-5 | SP-3, MS-16 | SLAM, confined-space robotics | 🔒 |
| G-6 | Snow and ice robot (sidewalks first, then streets; de-icing) | G-1, R-NAV2 | MS-21 | Winter operations, traction | 🔒 |
| G-7 | Mobility assist robot (guide, delivery for elderly/disabled neighbors) | G-1, T-AI1 | — | Assistive technology, human-robot interaction | 🔒 |

### 3.4 Surface Water

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| S-1 | Survey boat | R-CTL2 | S-3, S-4, O-20 | Hull design, buoyancy | 🔒 |
| S-2 | Buoy node (mesh + weather) | T-NET1, R-PWR2 | U-4, MS-1 | Marine engineering, moorings | 🔒 |
| S-3 | Solar boat | S-1, R-PWR2 | S-5, S-6 | Solar marine power | 🔒 |
| S-4 | Water sampling payload | S-1, T-PAY1 | MS-4 | Environmental science | 🔒 |
| S-5 | Cleanup boat (algae, debris) | S-3, T-AI1, M-1 | O-17, MS-4, MS-13 | Collection mechanisms | 🔒 |
| S-6 | Drone carrier boat | S-3, T-DOCK2 | MS-5 | Moving-platform landing | 🔒 |

### 3.5 Underwater

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| U-1 | Tethered ROV (build on ArduSub) | R-COM3, R-CTL1 | U-2 | Waterproofing, pressure | 🔒 |
| U-2 | Strong, light fiber tether (power + data) | R-COM3, R-PWR4, U-1 | U-4 | Fiber optics, tether materials | 🔒 |
| U-3 | Acoustic modem (encrypted) | R-COM2 | U-4 | Underwater acoustics | 🔒 |
| U-4 | Surface gateway (buoy/boat ↔ sub) | S-2, U-2 or U-3 | U-5 | Integration | 🔒 |
| U-5 | Autonomous sub | U-4, R-NAV3 | U-6, U-7, MS-4, MS-5 | Underwater navigation | 🔒 |
| U-6 | Biomimetic sub (fish-like, quiet) | U-5 | Quiet marine monitoring | Biomechanics, fluid dynamics | 🔒 |
| U-7 | Reef and wetland restoration robot (replant coral, remove invasives) | U-5, M-1, T-AI1 | MS-13 | Marine biology, ecology | 🔒 |

---

## 4. Cross-Cutting Branches

### 4.1 Sensing

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| X-1 | Camera and video | — | (see Roots) | Optics | 🟢 |
| X-2 | Thermal core (monocular, gimbal, fixed) | T-PAY1 | X-7, O-5, O-7, O-11, I-2, X-9 | Infrared physics | 🔒 |
| X-3 | Lightweight open LiDAR | T-PAY1 | G-5, X-7, I-3, X-12, MS-16 | Laser ranging | 🔒 |
| X-4 | Small radar | T-PAY1 | X-7, X-13 | Radar fundamentals | 🔒 |
| X-5 | Acoustic triangulation | R-TIME1 | O-15, I-7, MS-3 | Acoustics, TDOA | 🔒 |
| X-6 | Mapping and 3D scenes | X-1, R-NAV2 | X-8, O-11, O-13, O-14, O-19, O-20, I-2, I-3, I-5, I-6, I-8, I-9, C-1, C-2, C-4, X-12, MS-2, MS-3, MS-9, MS-14 | Photogrammetry, AI 3D | 🔒 |
| X-7 | Sensor fusion | T-AI1 + two of X-2/X-3/X-4 | MS-2 | Estimation, data fusion | 🔒 |
| X-8 | Swarm mapping | X-6, T-TSK1 | O-13, X-9, MS-2, MS-3 | Multi-agent coordination | 🔒 |

### 4.2 Manipulation

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| M-1 | Grabber / collector arm | T-PAY1 | G-3, S-5, U-7, M-2, O-8, O-10, C-3 | Mechanisms, kinematics | 🔒 |
| M-2 | In-air capture / recovery | M-1, T-DOCK1 | L-7 | Dynamics, control | 🔒 |
| M-3 | Drop / delivery payload | T-PAY1 | M-5, O-12, O-13, O-16, O-19, O-21, X-10, MS-2 | Mechanisms | 🔒 |
| M-4 | Speaker / deterrent payload | T-PAY1 | O-5 | Acoustics | 🔒 |
| M-5 | Relay dropper (drops mesh nodes as a robot moves) | M-3, T-NET2 | G-5, MS-16 | Mechanisms, networking | 🔒 |
| M-6 | Shore launcher (throws self-inflating flotation device) | — | O-16 | Mechanics, ballistics, inflation systems | 🟢 |

### 4.3 Operations

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| O-1 | Living Network coverage map | T-NET4, T-NODE2 | MS-1 | Geospatial, RF planning | 🔒 |
| O-2 | Persistent low-power sensor nodes (OASA-SENSE) | R-PWR2, R-COM2 | O-14, O-18, O-22, I-7, I-9, MS-1, MS-3, MS-7 | Low-power electronics | 🔒 |
| O-3 | Weather nodes + go/no-go | T-MAP1 | MS-3 | Meteorology | 🔒 |
| O-4 | Fleet management | T-TSK1, T-NET3, T-DOCK2 | O-6, O-10, MS-2, MS-3, MS-5, MS-13 | Operations research | 🔒 |
| O-5 | Feral hog detection + deterrence | T-AI1, X-2, M-4, G-1 or A-1 | MS-3 | Wildlife behavior, AI | 🔒 |
| O-6 | Mobile hive (truck + trailer) | T-DOCK2, O-4 | MS-2 | Vehicle integration | 🔒 |
| O-7 | Wildfire watch (anchored or roaming solar blimp, thermal/smoke detection) | L-5, X-2, T-AI1 | MS-9 | Fire science, remote sensing | 🔒 |
| O-8 | Field repair cell (prints parts and swaps them on site) | T-DOCK2, M-1, T-LOG1 | O-9, MS-11 | Additive manufacturing, robotic assembly | 🔒 |
| O-9 | Automated repair center | O-8 | MS-11 | Manufacturing automation | 🔒 |
| O-10 | Autonomous logistics fleet (carries damaged devices to repair, brings parts out) | O-4, G-1 or A-3, M-1 | MS-11 | Logistics, routing | 🔒 |
| O-11 | Wildfire risk mapping (fuel load, dry vegetation near communities) | X-2, X-6, T-AI1 | O-12, MS-12 | Fire ecology | 🔒 |
| O-12 | Controlled burn support (with fire agencies) | O-11, M-3 | MS-12 | Prescribed fire, ecology | 🔒 |
| O-13 | Seed-planting and regrowth tracking | X-6, M-3, X-8 | MS-12 | Forestry, ecology | 🔒 |
| O-14 | City sensing platform (intelligent sensors that talk to each other and the map) | O-2, X-6, T-NET4 | MS-14 | Urban systems, IoT | 🔒 |
| O-15 | Drowning detection (vision + acoustic, e.g., screams) | T-AI1, X-1, X-5 | O-16, MS-15 | AI, acoustics, water safety | 🔒 |
| O-16 | Lifeguard assist kit (shore launcher with self-inflating float, drone flotation drop, two-way speaker to lifeguard station; budget tiers) | O-15, M-3, M-6, A-1 | MS-15 | Rescue engineering | 🔒 |
| O-17 | Ocean cleanup base (unload, recharge, relaunch) | S-5, T-DOCK2 | MS-13 | Marine logistics | 🔒 |
| O-18 | Utility-pole sensor network (air quality, weather, mosquito; solar + radio; partner with utilities) | O-2, T-NET5 | O-19, MS-23 | Environmental monitoring | 🔒 |
| O-19 | Mosquito control (map standing water, larvicide drops with county programs) | X-6, M-3, O-18 | MS-23 | Public health, entomology | 🔒 |
| O-20 | Invasive species patrol (land and water) | T-AI1, X-6, S-1 | MS-13 | Ecology | 🔒 |
| O-21 | Ski patrol support (slope watch, beacon search, supply drops) | X-11, M-3 | — | Mountain safety | 🔒 |
| O-22 | Citizen science sensor kits + open map (anyone can host a node) | O-2, T-NET5 | MS-23 | Citizen science, data | 🔒 |

### 4.4 Infrastructure Inspection (seed branch — to grow into its own tree)

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| I-1 | Pipe and sewer crawler | G-1, R-COM3 or T-NET1, X-1 | — | Confined-space robotics | 🔒 |
| I-2 | Powerline inspection (drone + line-crawling robot) | A-1, X-2, X-6 | I-8 | Electrical infrastructure | 🔒 |
| I-3 | Bridge and structure inspection | A-1, X-3, X-6 | — | Structural engineering | 🔒 |
| I-4 | Mountainous / rough-terrain robot | G-2, R-NAV3 | — | Terrain mobility | 🔒 |
| I-5 | Inspection reports + defect AI | T-AI1, X-6 | Commercial services | Data analysis | 🔒 |
| I-6 | Road condition patrol (potholes, wear on major and suburban roads; flags clogged storm drains and culverts) | A-1 or A-2, X-6, T-AI1 | MS-21 | Civil engineering, pavement | 🔒 |
| I-7 | Water main leak sensors (acoustic, strategically placed) | O-2, X-5 | MS-21 | Hydraulics, acoustics | 🔒 |
| I-8 | Grid pre-mapping + autonomous line and substation inspection | I-2, X-6, T-TSK1 | MS-21 | Power systems | 🔒 |
| I-9 | Dam and levee watch (persistent sensors + autonomous or assisted inspection) | O-2, X-6, A-1 | MS-21 | Geotechnical engineering | 🔒 |

### 4.5 Commercial Services (seed branch)

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| C-1 | Automatic roof inspection | A-1, X-6, T-AI1 | C-5 | Building science | 🔒 |
| C-2 | Construction progress tracking | X-6, T-TSK1 | C-4 | Construction management | 🔒 |
| C-3 | Pressure-washing / cleaning drone | A-1 (heavy-lift), R-COM3, M-1 | — | Fluid systems, tethers | 🔒 |
| C-4 | Site survey + build monitoring robots | G-1, X-6, C-2 | — | Construction | 🔒 |
| C-5 | Automated home inspection kit (roof, chimney, foundation) | C-1 | — | Building science | 🔒 |

### 4.6 Search and Safety

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| X-9 | Autonomous thermal search grid | X-2, X-8, T-TSK1 | X-11, MS-2, MS-9 | Search theory, multi-agent planning | 🔒 |
| X-10 | Water rescue drop (lines or flotation to people stranded in floods) | A-1, M-3 | MS-2, MS-15 | Swift water rescue | 🔒 |
| X-11 | Avalanche beacon and phone detection (supports ski patrol) | A-1, T-RF1, X-9 | O-21, MS-2 | Snow science, RF search | 🔒 |
| X-12 | LiDAR survey (archaeology, terrain, under-canopy mapping) | X-3, X-6 | X-13, MS-22 | Archaeology, geomatics | 🔒 |
| X-13 | Buried hazard sensing (UXO on former military sites, abandoned mines; LiDAR, magnetometer, ground-penetrating radar + AI) | X-12, X-4, T-AI1 | MS-22 | Geophysics | 🔒 |

---

### 4.7 Space

Plan from the start for OASA systems to work beyond Earth. Stepping stones begin on Earth.

| ID | Node | Requires | Unlocks | Sciences | Status |
|---|---|---|---|---|---|
| SP-1 | High-altitude balloon to near space (sensors, OASA link, recovery) | R-COM2, R-NAV1, T-LOG1 | SP-2, MS-19 | Atmospheric science, recovery systems | 🔒 |
| SP-2 | OASA CubeSat (encrypted link, laser comms test) | SP-1, R-COM4 | MS-19, ST-1 | Orbital mechanics, space-rated electronics | 🔒 |
| SP-3 | Planetary analog missions (deserts, caves, ice) | G-5, A-1, T-NET2 | SP-4, MS-19 | Planetary science, field operations | 🔒 |
| SP-4 | Thin-atmosphere / low-gravity vehicle concepts (Mars and Moon) | SP-3, T-SIM1 | MS-19, ST-2 | Aerospace, extreme environments | 🔒 |
| SP-5 | Space-rated autonomy (long delays, no human in the loop) | T-AI2, R-NAV3 | MS-19, ST-2, ST-3, ST-5 | Fault tolerance, autonomy | 🔒 |

---

## 5. Moonshots

| ID | Moonshot | Key nodes required |
|---|---|---|
| MS-1 | **Living Network** — self-sustaining regional mesh; private networks ride encrypted inside it | T-NET4, T-NODE2, O-1, O-2, S-2, L-2/L-3/L-4, A-4, A-6, T-RF3 |
| MS-2 | **Autonomous Disaster Response** — mobile hive truck, auto-launch, mapping, thermal search, supply drops, temporary mesh | O-6, O-4, X-6, X-7, X-8, M-3, L-6, A-3, T-VID1, T-NODE1, A-4, X-9, X-10, X-11 |
| MS-3 | **Self-Running Farm** — sensors, scouting, hog watch, rovers, docks | O-2, O-3, O-4, O-5, X-5, X-6, X-8 |
| MS-4 | **Clean Waters & Streets** — river surveys, sampling, cleanup boats, trash robots | S-4, S-5, U-5, G-3 |
| MS-5 | **Multi-Domain Teams** — air, ground, surface and underwater on one mission | T-TSK1, O-4, A-7, G-4, S-6, U-5, L-7, T-VID1, T-TSK2 |
| MS-6 | **High-Altitude Platform** — "poor man's satellite" for coverage and imaging | A-6, L-6 |
| MS-7 | **Open Autonomy Stack** — the open baseline everyone builds on | R-COM2, R-SEC2, T-NET2, T-PAY1, T-LOG1, R-TIME1, T-MAP1, T-VID1, T-DOCK2, O-2, partner adoption |
| MS-8 | **Build Anywhere** — any chapter can build any design | T-BENCH1, reference builds, Academy, chapter kits |
| MS-9 | **Wildfire Watch Network** — modern fire towers in the sky, plus search and mapping when fires start | O-7, X-9, X-6, MS-1 nodes |
| MS-10 | **Atmospheric Satellites / Perma Gliders** — aircraft that stay aloft indefinitely on solar by day, stored energy and soaring by night, acting as relays, cameras and sensor platforms | A-5, A-6, A-8, A-9, R-PWR2, T-RF3, T-NET4 |
| MS-11 | **Self-Repairing Fleet** — field repair cells print and swap parts; logistics fleet carries damaged devices to automated repair centers | O-8, O-9, O-10, T-LOG1 |
| MS-12 | **Reforestation & Wildfire Prevention** — map fire risk around communities, support controlled burns with fire agencies, plant and track regrowth | O-11, O-12, O-13, MS-9 nodes |
| MS-13 | **Ocean Cleanup & Restoration Armada** — autonomous fleets clearing waterways and restoring reefs and wetlands | S-5, O-17, U-7, O-4, O-20 |
| MS-14 | **City Digital Twin & Automation** — a living model of the city from intelligent sensors that interact with the world around them | O-14, X-6, MS-1 nodes |
| MS-15 | **Lifeguard Assist Network** — supports (never replaces) lifeguards; detection, shore launchers, drone drops, two-way speaker; tiers for every budget | O-15, O-16, X-10 |
| MS-16 | **Underground Explorers** — autonomous 3D mapping of collapsed buildings, caves and tunnels | G-5, M-5, X-3 |
| MS-17 | **Light-Speed Links** — vehicles that aim lasers at each other in flight for encrypted comms and power | R-COM4, R-PWR5, T-RF3 |
| MS-18 | **Talk to Your Fleet** — plan missions from a sentence and steer them by voice | T-AI2, T-AI3 |
| MS-19 | **Off-World Ready** — OASA systems proven in planetary analogs and near space | SP-1 to SP-5 |
| MS-20 | **National Resilience Mesh** — a self-sustaining encrypted mesh with backup comms, timing and power that keeps communities connected when everything else fails | MS-1, R-TIME2, T-NET5, R-PWR2, R-PWR3 |
| MS-21 | **Smart Infrastructure Watch** — roads, storm drains, water mains, the grid, dams and levees inspected autonomously | I-6, I-7, I-8, I-9, G-6 |
| MS-22 | **Hidden Hazards & Discovery** — finding unexploded ordnance on former U.S. military sites, abandoned mines and buried hazards; the same LiDAR tools reveal American archaeology | X-12, X-13 |
| MS-23 | **Citizen Science Network** — anyone can host a sensor and add to a shared open map, bridged with Meshtastic | O-18, O-22, T-NET5, O-19 |

---

## 5.1 Starshots (Beyond Moonshots)

Farther than a moonshot. Not expected soon — these give members something huge to dream toward, and every one depends on the moonshots above.

| ID | Starshot | Builds on |
|---|---|---|
| ST-1 | **OASA in Orbit** — a constellation of OASA CubeSats extending the encrypted mesh into space | SP-2, MS-1, MS-17 |
| ST-2 | **Off-World Scout Teams** — air, ground and underground robots exploring the Moon or Mars together | SP-4, SP-5, MS-5, MS-16 |
| ST-3 | **Deep-Space Robotic Prospectors** — autonomous robots surveying asteroids and moons | ST-2, SP-5 |
| ST-4 | **Self-Sustaining Robot Outposts** — off-world bases where robots build, repair and power themselves | ST-2, MS-11, MS-1 |
| ST-5 | **Interstellar Probes** — contributing open autonomy, comms and power ideas toward probes that leave the solar system | ST-1, MS-17, SP-5 |

---

## 5.2 Government Applications (Company Track)

Not open-community nodes. These are applications OASA Engineering can offer by combining existing nodes. Members join by choice.

| ID | Application | Built from |
|---|---|---|
| GOV-1 | **Border & remote area awareness** — towers, aerostats, sensor fusion, drone response, river and rough-terrain patrol | T-NODE2, L-4, L-5, X-7, T-AI1, T-TSK1, G-2, S-1, MS-20 nodes |
| GOV-2 | **Border search and rescue** — finding people lost in desert and remote terrain | X-9, X-2, M-3 |
| GOV-3 | **Counter-UAS and red teaming** | T-RF1, T-RF2, X-4, X-5, T-AI1 |
| GOV-4 | **Ports and coastline security** — surface and underwater inspection, harbor watch | S-1, U-5, X-7 |
| GOV-5 | **Critical infrastructure protection** — perimeter watch and patrol | O-2, G-1, A-1, X-7, MS-21 nodes |
| GOV-6 | **Emergency management** — mobile hives, resilience mesh, damage mapping | O-6, MS-2, MS-20 |
| GOV-7 | **All-in-one deployable sensor kit** — case-sized solar node with mesh, thermal, radar; up in an hour | T-NODE1, X-2, X-4, R-PWR2 |
| GOV-8 | **Fiber perimeter sensing** — buried fiber detects footsteps and vehicles (distributed acoustic sensing) | R-COM3, X-5, T-AI1 |
| GOV-9 | **Persistent remote watch** — low-power seismic, acoustic, magnetic ground sensors reporting over mesh | O-2, X-5, T-NET5 |
| GOV-10 | **Maritime domain awareness** — persistent solar boats and buoys tracking small craft | S-3, S-2, X-7 |
| GOV-11 | **Event security support** — temporary mesh, overwatch, drone detection | T-NODE1, GOV-3 |
| GOV-12 | **Hazmat sensing** — drones and robots measure chemical or radiation hazards before people go in | T-PAY1, A-1, G-1 |
| GOV-13 | **Rail inspection robot** — fast autonomous track, tie and bridge inspection | G-1, X-3, X-6, T-AI1 |
| GOV-14 | **Crash and crime scene mapping** — rapid 3D scans for law enforcement | X-6, X-12 |
| GOV-15 | **CUAS sensor network** — RF, Remote ID, acoustic, radar and optical/thermal nodes fused by edge AI; detections with confidence on TAK | GOV-3, X-7, T-AI1, T-NET2 |
| GOV-16 | **Directional (beamformed) mitigation research** — only with authorized federal partners at approved ranges; affects the threat, keeps the community online | GOV-15, T-RF3 |
| GOV-17 | **Railway network live map** — rail robots and drones build a live map of track condition | GOV-13, T-MAP1 |
| GOV-18 | **Coverage planning map** — interactive map to plan where nodes, blimps, towers and boats go (e.g., "solar blimp on this hill launches during disasters") | O-1, T-MAP1 |
| GOV-19 | **Persistent sentinel boats** — solar boats running day and night, detecting suspicious activity on waterways | S-3, X-7, T-AI1 |

### Government Moonshots

| ID | Moonshot | Builds on |
|---|---|---|
| GMS-1 | **Resilient Homeland** — large-scale deployment keeping comms, timing and power up through attacks and disasters, planned on the coverage map | MS-20, GOV-18, L-6, T-NODE2 |
| GMS-2 | **Community Drone Awareness** — affordable fused detection networks for stadiums, schools, prisons, plants and towns | GOV-15 |
| GMS-3 | **Critical Infrastructure Guardian** — fiber sensing, drones and robots watching substations, water, dams, pipelines and rail | GOV-8, GOV-13, MS-21 |
| GMS-4 | **Coastal & Waterway Shield** — persistent solar boats, buoys and underwater sensors | GOV-10, GOV-19, U-5 |
| GMS-5 | **Secure Domestic Supply Chain** — U.S.-made, audited radios, flight controllers, motors, batteries; partner with vendors and fill the gaps | All hardware nodes |
| GMS-6 | **GPS-Free Navigation** — vision, terrain matching, signals of opportunity, inertial | R-NAV3, R-TIME2 |
| GMS-7 | **Rapid Response Logistics** — autonomous resupply after disasters or attacks | O-10, MS-11 |
| GMS-8 | **One Network, Every System** — the live map connects all autonomous systems on a network so they share data and work together | T-MAP2, T-TSK2, MS-5 |

---

## 6. Critical Path

The nodes that unlock the most of the tree. Start here.

1. **R-SEC1 → R-COM2** (encrypted link): needed by nearly everything
2. **R-NAV1 + R-CTL1 → R-CTL2** (autonomous control): unlocks every vehicle branch
3. **T-MAP1 → T-MAP2** (TAK bridge and control): the shared picture
4. **T-NET1 → T-NET2** (mesh): the backbone of every moonshot
5. **T-PAY1** (payload standard): unlocks sensing, manipulation and AI
6. **R-PWR1 → R-PWR2** (batteries and solar): unlocks long-endurance everything

These map closely to **Rung 1 and Rung 2** in OASA-roadmap.md.

---

## 7. Sciences Map (links to OASA Academy)

| Science / discipline | Where it appears in the tree |
|---|---|
| Physics fundamentals | Everywhere |
| Electronics | R-PWR, R-COM, T-PAY1, T-BENCH1 |
| RF engineering | R-COM, T-RF, T-NET, U-3 |
| Cryptography & security | R-SEC, R-COM2 |
| Networking & distributed systems | T-NET, T-MAP, O-1 |
| Aerospace engineering | A-, L- |
| Mechanical engineering | G-, M-, T-DOCK |
| Marine / naval engineering | S-, U- |
| Energy & power electronics | R-PWR, A-5, L-2, L-3, S-3 |
| Controls & autonomy | R-CTL, T-DOCK1, M-2 |
| Navigation | R-NAV, R-TIME1 |
| Sensors & signal processing | X-, T-RF2, X-5 |
| AI & computer vision | T-AI1, X-6, X-7, O-5 |
| Environmental science | S-4, S-5, O-3 |
| Systems integration | T-NODE, O-4, O-6, all moonshots |

---

## 8. Growing the Tree

- **Propose a node:** any Builder-tier member can propose a new node with its requires, unlocks and sciences.
- **Integrate, don't duplicate:** if an existing open project covers a node, mark it as an **integration node** and link the project.
- **Update status:** project leads update node status as work progresses.
- **Later:** turn this into an interactive tech tree on joinoasa.org, where clicking a node shows its project, team, tasks and Academy workshops.
