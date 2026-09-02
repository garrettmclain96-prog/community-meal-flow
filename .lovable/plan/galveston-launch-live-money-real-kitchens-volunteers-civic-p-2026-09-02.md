# Galveston Launch: Live Money, Real Kitchens, Volunteers, Civic Planning

Four workstreams. Galveston, Texas is the launch city.

## 1. Prove the money loop end to end

Run the full flow against the live sandbox rather than assuming it works:

- Sign in as a sponsor on `/impact`, fund meals at a real Galveston kitchen with test card `4242 4242 4242 4242`, and confirm the checkout returns paid.
- Verify the webhook confirmed the checkout, that the funded order and impact event only appear after payment, and that the public ledger count moves by exactly the paid meals.
- Sign in as that kitchen on `/kitchen`, complete payout onboarding, advance the order to delivered, and confirm the payout transfer is created and its status tracked.
- Fix whatever breaks along the way, and report the exact numbers observed at each step instead of a general "it works".
- Also clear the outstanding database security warnings on the payment functions flagged by the last migration, and re-run the linter until clean.

## 2. Real Galveston kitchens

- Research actual Galveston-area community kitchens, food pantries, churches with feeding programs, school cafeterias and restaurants that participate in meal programs.
- Seed each with real name, street address, neighborhood (Galveston has distinct areas — East End, Downtown/Strand, Fish Village, Lasker Park, Bolivar, La Marque/Texas City edge), kitchen type, daily meal capacity and a realistic cost per meal.
- Every seeded kitchen is marked **unclaimed**: it appears in the network and can receive sponsorship, but shows a "this listing is unverified — are you this kitchen? claim it" state until a real operator signs up and takes ownership.
- Add a claim flow: an operator signing up as a kitchen can claim an unclaimed listing, which transfers ownership and unlocks payouts. Money cannot move to an unclaimed listing.
- Add addresses and coordinates to kitchens so both the civic map and volunteer routing have real geography.

## 3. Volunteers — profiles, shifts, dispatch

New volunteer surface at `/volunteer`, plus kitchen-side controls in `/kitchen`.

- **Sign-up and profile**: name, contact, neighborhoods they can serve, whether they can drive, skills (prep, cook, serve, deliver, host), recurring weekly availability, and background-check/agreement acknowledgement.
- **Shifts**: kitchens post shifts (prep, cook, serve, cleanup) with date, time window, role and number of volunteers needed. Volunteers browse open shifts near them and claim a slot; kitchens see the roster and can release a slot.
- **Delivery dispatch**: when a funded order is marked prepared, it becomes a delivery run — pickup kitchen, drop-off area, meal count, time window. Volunteers claim a run, mark picked up, then delivered. Delivered runs advance the order and fire the same impact event and payout the manual path does.
- **Credit**: each volunteer sees hours served, shifts completed, meals delivered, and the kitchens they've supported. Kitchens see reliability (claimed vs completed) for their own roster only.
- Privacy: volunteers never see household identities — runs are to a kitchen or a partner drop point, not to a family's door.

## 4. Civic dashboard with real geography

Rebuild `/civic` from a totals list into a planning tool:

- **Demand map**: Galveston neighborhoods rendered with meals requested, funded, delivered and unmet, colour-scaled, with a hotspot drill-down per area.
- **Capacity vs demand**: each neighborhood's kitchen capacity per week against committed orders, surfacing coverage gaps — demand with no kitchen within range.
- **Sponsor allocation**: where sponsorship dollars are landing versus where the unmet demand is, so the mismatch is explicit.
- **Volunteer coverage**: delivery capacity by area, and where runs go unclaimed.
- **Time filters** (7/30/90 days), trend lines, and CSV export for public reporting.
- Aggregate-only with a minimum-cohort threshold: areas too small to anonymize are suppressed, never shown.

## Technical notes

- New tables: `volunteers`, `volunteer_shifts`, `shift_signups`, `delivery_runs`, plus `kitchen_claims`; kitchens gain address, lat/lng and a claimed flag. All with GRANTs, RLS scoped by owner/role, and updated-at triggers.
- Delivery completion routes through a security-definer function so it reuses the existing `advance_order` payout path rather than duplicating it.
- Galveston kitchen seed rows ship as literal inserts in the migration, not runtime seeding.
- Civic reads come from aggregate server functions over the ledger; no household row ever reaches that surface.

## Build order

1. Verify and repair the payment/payout loop, clear the security warnings.
2. Galveston kitchen seed + claim flow.
3. Volunteer schema, `/volunteer` screens, kitchen shift management, delivery dispatch.
4. Civic dashboard on top of the resulting geography and volunteer data.
