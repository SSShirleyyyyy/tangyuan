# Pourover Coffee Journal Design

**Goal:** Build a responsive web demo for a hand-pour coffee journal that feels polished on mobile and desktop, centers daily brew logging, and showcases a photo-assisted recommendation flow.

## Product Shape

The demo is a responsive web app with two primary entry points on the home screen:

- `Record a Brew`: start a new pour-over log with bean, equipment, brew parameters, tasting notes, and rating
- `Photo Suggestion`: simulate uploading a coffee bag photo, extract bean details, and generate a starting recipe adjusted for the user's equipment profile

The product favors daily logging and review first, while still hinting at future analytics and syncing.

## Core Demo Screens

### Home

- Hero area with strong coffee-tool visual identity
- Quick actions for recording a brew and starting a photo suggestion
- Recent brew cards
- Equipment profile summary

### Brew Composer

- Form sections for bean, equipment, core parameters, bloom and pours, tasting notes, and rating
- If launched from a suggestion, fields are prefilled from the generated starting recipe
- Designed as a guided but lightweight experience, not a dense admin form

### Suggestion Result / Bean Detail

- Mock photo analysis result with extracted bean information
- Recommendation card tuned to the selected dripper, grinder, and taste preference
- One-click action to start a brew from the suggestion
- Related bean history summary for continuity

## Domain Model

- `brewLog`: one coffee session with parameters, notes, rating, and optional origin metadata
- `beanProfile`: reusable bean information inferred from the photo or selected manually
- `equipmentProfile`: dripper, grinder, filters, and taste preference defaults
- `recipeSuggestion`: an AI-style starting recipe based on bean traits and equipment

## Intelligence Scope For Demo

The demo does not perform real image recognition. Instead it uses:

- mock analyzed photo payloads
- local recommendation rules that adapt recipe output to dripper, grinder scale, and taste preference

This keeps the experience believable while remaining fully local and testable.

## Constraints

- No network dependency required to run the demo
- Local static front-end implementation
- Recommendation logic must be covered by automated tests
