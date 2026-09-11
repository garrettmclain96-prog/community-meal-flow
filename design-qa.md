# ProvisionLoop — Galveston Movement design QA

- Source visual truth: `/workspace/scratch/f7de8dc72cd5/generated_images/exec-650255b6-4e01-4475-a901-7f28f2c931a5.png`
- Implementation: `http://terminal.local:4173/`
- Browser-rendered evidence: full-page Cloud Browser capture emitted in the September 11, 2026 build run
- Viewport: 1363 × 936 CSS px, device pixel ratio 1
- Source pixels: 852 × 1820 (mobile concept)
- Implementation capture: 1363 px desktop viewport, full-page
- Normalization: responsive desktop interpretation compared by hierarchy, art direction, content order, and component behavior rather than pixel overlay because the selected concept is a mobile composition
- State: public homepage, light theme, anonymous user, founding pilot / empty verified-impact state

## Full-view comparison evidence

The implementation preserves the selected concept's defining visual system: storm navy, sun-faded paper, coral action fields, acid-lime proof/status accents, documentary Galveston collage, confrontational condensed headline scale, and vertical role lanes. The desktop composition expands the mobile poster into a full-width hero without changing the content hierarchy.

## Focused region comparison evidence

- Hero: the generated documentary collage is a real optimized raster asset rather than a CSS approximation. The subject stays right-weighted and the live headline occupies the paper field on the left.
- Primary conversion: “Choose your lane” remains the dominant CTA and scrolls to the role selector.
- Lane selector: role order and labels match the chosen concept; each row is a real route link with keyboard focus behavior.
- Proof state: coral proof section retains the honest empty state and does not invent impact.
- Founder block: the placeholder fingerprint tile was replaced with a deliberate “GM / Built in Galveston” field mark.

## Required fidelity surfaces

- Fonts and typography: Archivo display, Manrope body, and IBM Plex Mono utility text preserve the selected condensed/editorial hierarchy with readable body sizing.
- Spacing and layout rhythm: large poster-like hero, narrow copy measure, compact role rows, and strong solid-color section changes match the concept without nested-card clutter.
- Colors and tokens: storm navy, paper, coral, and lime are scoped as homepage design tokens; contrast is strong in the rendered light theme.
- Image quality and asset fidelity: hero art matches the selected Gulf Coast collage direction and was converted from 3.1 MB PNG to a 253 KB WebP.
- Copy and content: canonical positioning, four role lanes, pilot gating, privacy promise, and zero-until-verified policy are preserved.

## Interaction and browser checks

- “Choose your lane” scrolled to `#choose-your-lane`.
- “I need food” navigated to `/help` and rendered “ASKING FOR FOOD SHOULD NOT BE A MAZE.”
- Fresh-page console check found no application errors or warnings. The only logged error came from the browser's own extension metadata script.
- Typecheck, ESLint, 26 Node tests, and production build passed.

## Comparison history

### Pass 1

- P1: current homepage used repeated cream/orange oversized-heading sections and lacked human/local imagery.
- Fix: introduced the selected Galveston Movement art direction and a documentary hero asset.
- P2: role cards read as four equal feature cards rather than a decisive conversion path.
- Fix: converted them to a vertical action index with one highlighted first lane.
- P2: generated hero asset was 3.1 MB.
- Fix: converted it to a 253 KB WebP with no visible art-direction loss.

### Pass 2

No actionable P0, P1, or P2 visual differences remained in the responsive desktop interpretation. Mobile CSS preserves the selected single-column composition; exact iPhone hardware capture remains a post-deployment device check rather than a blocking implementation mismatch.

## Follow-up polish

- P3: collect original Galveston photography after the pilot begins so the generated documentary subject can eventually be replaced with real ProvisionLoop field imagery.
- P3: validate the final font rendering and safe-area spacing on Garrett's current iPhone after production deployment.

## Palette fidelity iteration

- P1: the first live implementation used a bright lime utility bar and cream navigation, while the selected mockup opened in storm navy.
- Fix: moved global chrome to storm navy, retained coral for the wordmark/action, and eliminated the lime banner.
- P1: “It needs connection” rendered as a clean white-on-coral block rather than the mockup's coral poster type on weathered paper.
- Fix: restored coral display type on paper and reserved lime for the physical underline/proof marker.
- P2: the role section was visually flat.
- Fix: added a low-opacity crop of the actual generated collage asset as physical texture and converted the hero field note into a proof-pending ticket.
- P2: mobile hero art was faded to 32%, weakening the documentary subject.
- Fix: restored the generated asset at full opacity and tuned its crop/scale for the paper-left, portrait-right composition.

final result: passed
