# Prototype guidelines (interview-driven)

**Audience:** Agents building the gemeinnuetzig.li innovation-lab prototype.  
**Sources:** `transcripts/1.txt` (Eschen, First Advisory), `2.txt` (Anna Lamperti), `3.txt` (Konstantin Matt), `4.txt` (Eltern Kind Forum), `5.txt` / `6.txt` (demenz.li).  
**Status:** Prototype only — mock data, no production claims. Active UI: [`web/`](../web/).  
**Live reference:** [gemeinnuetzig.li directory (EN)](https://www.gemeinnuetzig.li/en/directory) — SOS Kinderdorf Liechtenstein initiative; ~57 listed organisations.

---

## Baseline: current gemeinnuetzig.li (as of 2026)

Use the live site as **organisation directory**, not as the project-funding surface we are prototyping.

### What exists today

| Area | Live behaviour | Gap vs interviews |
|------|----------------|-------------------|
| **[Directory](https://www.gemeinnuetzig.li/en/directory)** | 57 NGOs; category filter; grid / alphabetical views | No project-level funding asks, budgets, or impact dashboards |
| **Org profile** (e.g. [Demenz](https://www.gemeinnuetzig.li/en/directory/demenz-liechtenstein), [EKF](https://www.gemeinnuetzig.li/en/directory/eltern-kind-forum)) | Long mission text, category chip, structured **admin block**: field of activity, geography (FL), board, legal form, founding year, address, phone, bank IBAN, commercial register no., tax-exempt flag, association memberships | No fundable **projects**, CHF gaps, track record, or “express interest” for foundations |
| **Articles** | Editorial content (separate nav) | Not tied to matcher or project discovery |
| **Brochure / About** | Awareness & SOS positioning | Low traffic / conversion per team analytics (interviews) |
| **i18n** | `de` / `en` toggle | Prototype should stay aligned |
| **Categories** | 8 sectors (match production labels) | Map 1:1 to `Category` in `web/src/lib/types.ts` |

### Typical org profile fields (preserve or link in prototype)

From live detail pages — funders already expect this block; do **not** drop it when adding project layers:

- Field of activity / thematic scope  
- Geographical area of activity (usually **FL**)  
- Presidium / management board names  
- Legal form (registered non-profit association, foundation, etc.)  
- Founding year, postal address, telephone  
- Commercial register number, tax-exempt institution (yes/no)  
- Bank details (sensitive — on live site in clear text; prototype may show placeholder or “available on request”)  
- Optional: association memberships (e.g. DADO for demenz.li)

### Category mapping (live site → codebase)

| Live (EN) | `types.ts` / `constants.ts` |
|-----------|------------------------------|
| Children, young people and families | `children_youth_families` |
| Senior citizens | `senior_citizens` |
| Education | `education` |
| Social affairs and health | `social_health` |
| Art and culture | `arts_culture` |
| Environment and climate protection | `environment_climate` |
| Sport and leisure | `sport_leisure` |
| Development co-operation | `development` |

### Prototype positioning vs live site

```
Live site today          Prototype adds (do not replace directory wholesale)
─────────────────        ─────────────────────────────────────────────────
Directory list      →    Same org identity + link to canonical profile_url
Org detail (static) →    + Project detail page(s) per org (budget, impact, CTA)
(none)              →    Matchmaker quiz → ranked orgs/projects with reasons
```

- **`profile_url`** in `ngos.json` already points at live paths — keep as “official listing” link on prototype org/project pages.  
- **Improved detail page** in guidelines means **project-centric page**; org admin block can mirror live site or deep-link out.  
- **Matchmaker** is net-new on top of directory data; live site has no equivalent.

### NGO pain points vs live CMS (from transcripts)

- **demenz.li:** changes require roundabout — not self-service.  
- **EKF:** directory helps visibility in principle; **no direct donations yet**; questions whether funders actively search the site.  
- Interviews want **Kickstarter/SOS-Kinderdorf-programme** depth for **projects**, not longer org essays alone.

---

## Product goal (from interviews)

Magdalena / SOS Kinderdorf want **more local funding visibility** and **better matching** between Liechtenstein NGOs and foundations/trustees. Today:

- ~93% of foundation money leaves Liechtenstein (founder mandates, international clients).
- NGOs get few direct leads from [gemeinnuetzig.li](https://gemeinnuetzig.li); NGOs cite **awareness**, **self-service updates**, and **unclear whether funders actually use the site**.
- Funders receive **many inbound proposals**; matching is hard when statutes are **narrow** or beneficiaries are **fixed**.
- A platform helps most when someone is **actively looking** for a project in an **open-scope** foundation — not for every trust mandate.

Build two prototype surfaces:

1. **Improved charity / project detail page** (NGO → funder readability)
2. **Matchmaker tool** (funder or donor → relevant NGOs/projects)

---

## Shared constraints (both prototypes)

| Theme | Implication for design |
|--------|-------------------------|
| **Purpose / statutes first** | Matching and detail views must foreground *thematic fit* (children, health, environment, etc.) and *geography* (LI / DACH / international). Mismatch = automatic dead end. |
| **Project vs organisation** | Funders decide on **concrete projects & budgets**, not logos alone. Operating costs are hard to fund; **named projects with amounts** resonate (demenz.li, Eschen, Konstantin). |
| **Transparency & trust** | Strong proposals show **past impact**, **budget breakdown**, **who runs the project**, **governance** (board, legal form). Konstantin: “transparency differentiates strong from weak.” |
| **Compliance (light touch in UI)** | Real world: KYC, audited accounts, AML country lists, sometimes pay via Swiss partner. Prototype can show **“audit / governance available on request”** badges — not full compliance workflow. |
| **Relationships & incumbents** | Long-term grantees block newcomers; personal networks matter. UI should not promise “guaranteed funding” — only **fit** and **next step** (contact / express interest). |
| **Visibility paradox (LI)** | Local market is small; **too much** public fundraising noise creates backlash (“they always get money”). Prefer **factual, project-level** storytelling over marketing hype. |
| **Low funder time** | Anna: extra login + scroll is a barrier if inbox is full. **Email digest / alerts** and **scannable summaries** beat heavy portals for trustees. |
| **NGO admin burden** | EKF: reporting is integrated in annual cycle; demenz.li: **can’t edit site themselves**. Prototype should hint at **self-service project updates** (even if mocked). |
| **Platform discovery** | Several funders **heard of** gemeinnuetzig.li but **don’t use it** day-to-day. Onboarding and “why open this” matter. |

---

## 1) Improved detail page (charity / project)

### Primary users

- **Foundation board members / trust officers** evaluating a proposal (Eschen, Anna, Konstantin).
- **NGO staff** presenting one initiative clearly (EKF, demenz.li).
- Secondary: engaged citizens, corporate donors (lower priority for v1).

### Page should answer (in order)

1. **What is this project?** Title, 2–3 sentence outcome, thematic tags, geography, SDGs if relevant.
2. **What will money do?** Budget line items, amount sought, **already secured** vs **gap**, timeline (start/end, installments).
3. **Why trust this?** Track record: prior years’ results, people served, concrete metrics (Konstantin: “trees planted, people helped”).
4. **Who is accountable?** Legal form (Verein / Stiftung), responsible person, board president, link to organisation profile.
5. **What happened before?** Past projects, annual report excerpt, photos/video (Eschen: site visits & reports matter for international; LI proposals often already strong).
6. **How to engage?** Contact, apply, “express interest” — written trail preferred (email/postal) for real funds; prototype can use CTA + mock form.

### Recommended sections (wireframe-level)

```
[Hero] Project title + org name + category chips + geography
[Funding ask] CHF target | secured | gap | deadline (optional)
[Summary] Problem → intervention → expected outcome (plain language)
[Budget table] Categories + amounts (mock OK)
[Impact] Last year / cumulative metrics + short narrative
[Track record] 2–3 completed or ongoing sub-projects with outcomes
[Organisation] Legal form, founded, scope, link to org-level directory entry
[Governance] Board snippet, audit/governance badges (prototype labels)
[Documents] Annual report PDF, project brief (placeholder links)
[CTA] Contact foundation / Save to shortlist / Share (prototype)
```

### Content patterns NGOs asked for (demenz.li, EKF)

- **List fundable units** with **annual costs**: day center, outreach, transport, etc.
- **Sponsor “commitment”** metaphor: optional slot for “partial funding” or pledge (prototype only).
- **Messaging hooks** for matchers: reach, uniqueness (“only provider with this portfolio”), demographic facts (dementia prevalence).
- EKF: innovation / new offers need **third-party funds**; core ops via state contracts — surface **“fundable project”** vs **“general org”** clearly.

### Design principles

- **Kickstarter-like clarity** (team idea from Eschen interview): donor sees exactly what they fund.
- **Quality over quantity** (Konstantin): one strong project page beats five vague ones.
- **Minimal marketing fluff** (Eschen): emphasise money reaches beneficiaries, not advertising spend.
- **DE primary**, EN secondary — match existing site/i18n direction in `web/`.
- **Mobile-first** scannable layout; funders may forward a link to a board.

### Explicit non-goals (prototype)

- Full grant application workflow, e-signatures, payment rails.
- Publishing full audited financials publicly (offer **gated / on-request** in copy only).
- Replacing commercial register or STIFA legal advice.

### Acceptance hints for agents

- [ ] Default view is **project-centric**; org info is secondary but linked.
- [ ] Budget and gap visible **above the fold** on desktop and mobile.
- [ ] At least **3 impact metrics** and **1 past success** (mock data fine).
- [ ] Thematic + geographic tags align with matcher vocabulary (see §2).
- [ ] CTA does not imply guaranteed grant.

---

## 2) Matchmaker tool

### Primary users

- **Trust officers / client advisers** with **discretionary** mandate searching LI projects (Eschen, Konstantin — positive).
- **Advisers with fixed beneficiaries** — tool should **filter out** or **de-prioritise** low-fit results and explain why (Anna, Eschen).
- **NGOs** (secondary): “which foundations might fit us?” — lower priority unless dual-mode is cheap.

### What “match” means in interviews

| Signal | Weight | Notes |
|--------|--------|--------|
| Thematic / purpose fit | **Critical** | Must align with foundation statutes (children, cancer, environment, etc.). |
| Geography | **Critical** | LI-only foundations vs international mandates; DACH vs global. |
| Project vs operating | High | Prefer fundable **projects** with budgets. |
| Budget scale | Medium | Anna: annual distribution vs request size; partial funding possible. |
| Open vs fixed mandate | Gate | Fixed beneficiary list → matcher useful for discovery only; board may not decide. |
| Compliance geography | Gate | High-risk countries → indirect routes; prototype can tag “payment route: via CH/EU partner”. |
| Relationship / incumbent | Soft | Deprioritise or label “competitive / existing partners common” in copy only. |

Current quiz in `web/src/lib/quiz-steps.ts` maps to **donor preference** discovery; interviews stress **foundation purpose** from the **funder side**. Prototype should allow framing as:

- **“I represent a foundation with this purpose & geography”** (funder-led), or
- **“I’m exploring who to support”** (citizen/donor-led) — keep both paths if possible.

### Recommended flow (minimum viable)

1. **Profile** — role (foundation adviser / board / individual), thematic areas, geographic focus, optional budget band.
2. **Constraints** — legal form preference, org maturity, SDG priorities (reuse existing quiz fields where possible).
3. **Results** — ranked list with **match %** and **plain-language reasons** (already in `MatchCard` / `matcher.ts`).
4. **Detail drill-down** — link to improved project page (§1).
5. **Save / share** — shortlist in `sessionStorage` (existing pattern) or mock “email digest” preview.

### Features funders valued

| Feature | Source | Prototype suggestion |
|---------|--------|----------------------|
| Structured projects + budget + impact | Anna Q16, Konstantin | Required fields in mock JSON |
| **Explain why matched** | Konstantin dashboard idea | Keep `match_reasons[]`; add “mismatch warnings” |
| **Filter by scope** | Eschen, Konstantin | Toggle “only show fits for narrow mandates” |
| **Newsletter / alerts** | Anna, Konstantin | Mock “subscribe to LI + environment projects” UI |
| **Team / multi-adviser** | Anna | Mock “foundation profile” with thematic filters per officer |
| **Low friction** | Anna | No mandatory account for first results; optional email capture |
| **Reference sites** | Eschen | SOS Kinderdorf-style **country/programme** breakdown as inspiration link in docs, not clone |

### Features NGOs valued

| Feature | Source | Prototype suggestion |
|---------|--------|----------------------|
| AI / navigator highlighting uniqueness | EKF, demenz.li | Bullet “funder-facing highlights” on project model |
| VLGST connection | EKF | Footer note / future integration — no backend required |
| List projects + annual costs | demenz.li | Project cards with CHF/year |
| Transparency of platform itself | EKF | “Who uses this?” — static copy: advisers with open mandates |

### Anti-patterns (do not optimise prototype for)

- Forcing all advisers to browse **all** NGOs when they already have full inboxes (Anna).
- Spamming foundations with blind applications — UI should encourage **targeted** interest.
- Implying AI replaces **board resolution** or **compliance check**.
- Hiding that **founder regulations** cannot be changed post-mortem (Eschen).

### Data model suggestions (extend `web/src/lib/types.ts` mock)

Add optional fields for prototype richness (not all required v1):

```ts
// Illustrative — implement only what the task needs
interface Project {
  id: string;
  org_id: string;
  title: string;
  summary: string;
  thematic_tags: Category[];
  geography: GeographicScope;
  budget_total_chf: number;
  budget_secured_chf: number;
  budget_gap_chf: number;
  timeline_months?: number;
  impact_metrics: { label: string; value: string }[];
  highlights_for_matchers: string[]; // NGO-provided hooks
  governance_badges?: ("audited" | "annual_report" | "board_listed")[];
}
```

### Acceptance hints for agents

- [ ] Results ranked with **≥2 human-readable reasons** per match.
- [ ] Clear **geographic + thematic** filters before or after quiz.
- [ ] Top results link to **project detail** pages (§1).
- [ ] Copy acknowledges **partial funding** and **purpose mismatch** cases.
- [ ] Optional **digest / alert** mock (UI only).
- [ ] Works with static `ngos.json` + mocked projects — no live STIFA/register API.

---

## Personas (quick reference)

| Persona | Needs from detail page | Needs from matcher |
|---------|------------------------|-------------------|
| **Eschen** (trust, LI-focused) | LI projects when mandate allows; avoid wasted proposals to fixed-beneficiary funds | Search when board has **50% discretionary**; SOS-style depth |
| **Anna** (many inbound proposals) | Only opens if **low time** — digest, clear purpose fit | Filters + newsletter; sceptical of extra portal |
| **Konstantin** (open mandates) | Budget, track record, board at a glance | Dashboard + alerts; would use platform |
| **EKF** (NGO) | Showcase **projects**, not only org | Wants VLGST credibility; matcher highlights reach & innovation |
| **demenz.li** (NGO) | **Self-edit**, project list + CHF/year | Funders “order” support for line items (metaphor) |

---

## Copy & tone

- Factual, respectful, bilingual DE/EN.
- Avoid: “guaranteed match”, “replace application”, “increase donations by X%”.
- Prefer: “fits stated purpose”, “may be relevant for foundations with open geographic mandate”, “request introduction”.

---

## Suggested build order for agents

1. Extend mock data with **2–3 projects per NGO** (budget + impact).
2. Implement **project detail route** (e.g. `/projects/[slug]`).
3. Point match results → project detail; add mismatch explanations in matcher.
4. Add **digest subscribe** mock on results page.
5. Polish i18n strings for funder vs donor quiz intro.

---

## Open research (out of prototype scope)

- Interviews with **VLGST** / large foundations (Hilti, etc.) — Anna’s suggestion.
- Magdalena (site maintainer) on analytics, CMS, and edit workflow.
- NGO-side interviews beyond EKF and demenz.li for application-format diversity.

---

*Last updated from transcripts in repo root `transcripts/`. When new interviews land, append a short “Changelog” subsection here.*
