# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, Supabase (Postgres + Auth),
Dodo Payments for subscriptions, Resend (or equivalent) for transactional email.
Deploy target: Vercel. Chosen by the user, not delegated.

## Users

A solo operator doing manual outreach — cold email, cold calls, DMs, LinkedIn —
who contacts people one at a time in their own tools and needs to remember who
to circle back to. They open the product for roughly three minutes a day: once
in the morning to see today's follow-ups, and briefly after each conversation to
log what happened. They are not living inside the app, and they are not managing
a team. Single-user accounts only; no teams, no shared pipelines.

## Product Purpose

Log who you contacted, and get told exactly who needs a follow-up today.
Success is the user opening the Today view, seeing a correct and short list,
clearing it, and closing the tab. The daily digest email is the retention
mechanism: it is what brings them back on days they would otherwise forget.

## Positioning

Explicitly not a CRM. The product's position is defined as much by what it
refuses as by what it does: no pipelines, no deal stages, no kanban boards, no
deal value, no custom fields, no analytics dashboard. A neighboring CRM cannot
truthfully copy this position because its business depends on adding those
surfaces. The mechanism is a single derived queue — prospects whose
next_follow_up_date has arrived — plus a structured log of every touch.

## Operating Context

The actual outreach happens elsewhere: in the user's own inbox, phone, LinkedIn,
or DM tool. This product never sends outreach and never integrates with those
channels. It is the record and the reminder alongside them. Two moments of use:
the morning queue (often prompted by the digest email) and a few seconds of
logging immediately after a call or a sent message.

## Capabilities and Constraints

**Data model — deliberately flat, two tables plus a profile.**

`prospects`: id, user_id (FK auth.users), name (required), contact_info (text,
freeform email/phone/handle, required), channel (enum: email, call, dm,
linkedin, other — the primary channel), status (enum), next_follow_up_date
(date, nullable), created_at, updated_at.

`touches`: id, prospect_id (FK), user_id (FK), touch_date (date, defaults to
today), channel (enum: email, call, dm, linkedin, other — per-touch, may differ
from the prospect's primary channel), outcome (enum: no_answer,
answered_not_interested, answered_interested, callback_requested, voicemail,
sent, replied, no_reply, other — required on every touch), note (text,
optional), created_at.

`status` enum is the five stored values: contacted, replied, cold, won, lost.
Confirmed decision: `new` was dropped as unreachable (Add Prospect writes an
initial touch and sets contacted), and `follow_up_due` was dropped as derived —
"due today" is computed from next_follow_up_date <= today, never stored, so the
date remains the single source of truth.

Every touch must carry a structured `outcome`. This is the one field kept
strictly disciplined, because week-over-week comparison in a later version
depends on it existing on historical rows. The UI for that comparison is not
built now; the data for it is collected from day one.

A `profiles` table is required because Supabase `auth.users` cannot be extended
directly. It carries: plan, subscription_status, trial_ends_at, timezone,
default_follow_up_interval, digest_enabled, and the Dodo customer/subscription
identifiers. The `plan` field exists now even though there is a single tier, so
later tiers do not require a migration.

**Access and billing.** One paid plan, monthly and annual. Confirmed decision:
a 7-day trial with no card required — trial_ends_at is set at signup, access is
full during the trial, and after expiry creating prospects and touches is
blocked until an active subscription exists. Dodo Payments hosted checkout plus
a webhook that updates subscription_status.

**Daily digest.** Confirmed decision: sent at 7am in each user's local time. A
`timezone` column on the profile is captured from the browser at signup and
editable in Settings; an hourly scheduled job sends to users whose local time
has just reached 7am. Content is the count of follow-ups due, a short list of
name / days overdue / last note, and a link to the Today view. Users with zero
follow-ups due receive nothing at all — an empty digest trains people to ignore
the email, which would defeat its only purpose.

**Screens, in build order:** Auth; Today (home, and the most important screen);
Add Prospect; Log a Touch (modal, shared between Today and Prospect Detail);
Full List (filter by status and channel, search by name); Prospect Detail
(info plus reverse-chronological touch history); Settings (default follow-up
interval, digest on/off, subscription management link).

Navigation is exactly three destinations: Today, All Prospects, Settings.

**Out of scope for this version, by explicit decision — not by omission:**
analytics or week-over-week dashboards, email sending or channel integrations,
CSV import/export, teams or multi-user accounts, AI features of any kind, push
notifications, and per-prospect follow-up cadences (a single global default
only). These are refusals to preserve, not gaps to fill.

## Brand Commitments

Working name: FollowUp. The name is not final and no logo, wordmark, palette,
or typographic commitment exists yet. Nothing here is binding on future naming
or identity work.

## Evidence on Hand

None. There are no customers, testimonials, case studies, benchmarks, press
mentions, screenshots, or usage data. No pricing figure has been set beyond the
structure (single tier, monthly and annual). Future work must not fabricate any
of these, and must not imply existing users where there are none.

## Product Principles

1. **The queue is the product.** Anything that does not help the user answer
   "who do I contact today" is a candidate for removal, not addition.
2. **Refuse CRM surface area.** Pipelines, stages, deal values, and custom
   fields are permanently rejected, not deferred. The flat schema is a promise.
3. **Three minutes, not all day.** Optimize for entering, clearing the list, and
   leaving. Speed of logging beats completeness of record.
4. **Collect structured outcomes now, analyze later.** Every touch records a
   typed outcome even though nothing reads it yet, because history cannot be
   backfilled.
5. **The email earns its send.** The digest goes out only when there is real
   work in it. Silence on empty days is what keeps it credible on full ones.

## Accessibility & Inclusion

No product-specific standard was established. General baseline expectations
apply: keyboard-operable logging flow, since the core loop is repetitive data
entry performed many times a day.
