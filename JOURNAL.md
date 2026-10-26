# Death Note Character Journal

A private, fan-inspired character notebook built with React, Vinext, Cloudflare D1, and R2.

## Features
- Platform-managed ChatGPT sign-in and sign-out.
- Personal account-owned notebook entries.
- Create, search, filter, edit, and permanently delete profiles.
- JPG, PNG, and WebP photo uploads, limited to 5 MB, checked by file signature.
- Server-side ownership checks on every record and photo access.
- Same-origin checks on mutations and private, uncached API responses.
- Required fictional-character / consenting-participant confirmation.

Entries are private. There is no public directory or public profile sharing. This is a character journal, with no real-world harm features.

## Development
Node >=22.13.0. Run `npm run install:ci`, `npm run db:generate`, and `npm run build`. Apply the generated SQL migrations locally using the commands in the starter README, then use `npm run dev`.

Hosted authentication is supplied by Sites. Local loopback development has a test sign-in flow; it is not included in production.

DB and BUCKET bindings are declared in `.openai/hosting.json`. Never commit secrets or local runtime state. Hosted publication applies the schema migration and provisions storage.
