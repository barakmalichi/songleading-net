# Lineup Release Checklist

Target app: `public/lineup`

## Local-first hardening

- Imported `.lineup`, `.lineupbackup`, and share-link payloads must pass strict normalization before entering app state.
- Inline event handlers should stay out of HTML and rendered templates so CSP can be tightened later.
- Full backups should include songs, setlists, folders, lineup items, and active show metadata.
- Any corrupt local state should be preserved under a recovery key before the active storage key is reset.

## Verification

- Run `node --check public/lineup/app.js`.
- Run `npm run test:lineup`.
- Open `/lineup/` locally and verify desktop: add song, add one-time song, add note, save, export, share, backup, restore.
- Verify mobile viewport: tap top actions, open library drawer, add first song, edit note/capo/key, open slides.
- Before deploy, confirm live HTML references the new asset version.

## Release owner tasks

- Confirm public app name, owner name, support email, privacy policy, and terms.
- Decide what user content is allowed: metadata only, notes, slide text, lyrics, or team names.
- Keep account/cloud sync as a separate release decision; this hardening pass does not add a new backend.
