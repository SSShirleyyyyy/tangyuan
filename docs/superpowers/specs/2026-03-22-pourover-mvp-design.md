# Pourover MVP Design

**Goal:** Turn the current visual demo into a locally usable MVP that can save real brew logs, accept a photo upload, and support basic history filtering.

## Scope

- Persist brew logs in browser local storage
- Keep starter sample data only as initial seed state
- Allow users to upload a coffee photo and preview it in the suggestion flow
- Generate a starting bean profile and recipe suggestion from lightweight local heuristics
- Support basic filtering by bean text, dripper, and minimum rating

## User Flow

1. Open the app and see existing saved brews or starter sample entries
2. Record a brew and save it locally
3. See the saved brew appear in recent history immediately
4. Upload a coffee photo and preview it in the suggestion screen
5. Receive a locally generated bean summary and equipment-aware recipe suggestion
6. Apply that suggestion into the brew form and save the result
7. Filter history to review brews by bean, dripper, or rating

## Constraints

- No backend required
- No external AI API required
- Preserve the current editorial visual style
- Keep recommendation rules testable and local
