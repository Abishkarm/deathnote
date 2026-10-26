# Death Note — A Life in Words

A text-only place for people facing the end of life to preserve memories and leave personal messages. Readers can browse published notes without signing in.

## Visibility
- New notes default to **Draft** and are visible only to their author.
- **Hidden** notes are private to their author, including after a previously published note is hidden.
- **Published** notes are readable by anyone. Publishing requires explicit confirmation.
- Admins can hide or delete published notes. They cannot list or read other authors' drafts or hidden notes, or publish another author's private notes.
- No image uploads or photo access routes remain active. Legacy character records and uploaded objects are retained separately, not automatically deleted or reinterpreted as personal notes.

## Google sign-in with Supabase
The website uses Google OAuth through Supabase. Email codes and email templates are no longer used, and SMTP is not needed for this sign-in flow.

1. In Google Cloud / Google Auth Platform, configure the consent screen and create an OAuth client of type **Web application**.
2. Add this Authorized JavaScript origin:
   `https://deathnote-character-journal.starrygleam257.chatgpt.site`
3. Add this Authorized redirect URI in Google Cloud:
   `https://ueomjxykgbyjxxpbfhnv.supabase.co/auth/v1/callback`
4. In Supabase, open Authentication > Sign In / Providers > Google. Enable Google and paste the Google Client ID and Client Secret there. Do not put the Google client secret in this repository or the website's client code.
5. In Supabase Authentication > URL Configuration, set Site URL to:
   `https://deathnote-character-journal.starrygleam257.chatgpt.site`
   Add this allowed redirect URL:
   `https://deathnote-character-journal.starrygleam257.chatgpt.site/api/auth/callback`
6. If the Google consent app is still in Testing, add the accounts that need to test it as Google test users, or complete Google's publishing process for general access.
7. Click **Continue with Google** on the website. Use the verified account matching the server-only `ADMIN_EMAIL` to access admin moderation.

Runtime configuration remains `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `ADMIN_EMAIL`. Use a publishable key, never a service-role or secret key. Real values are configured in hosting, not committed to GitHub.

OAuth uses a random PKCE verifier stored in a short-lived HttpOnly cookie and an S256 challenge. The callback exchanges the code on the server, stores session tokens in HttpOnly cookies, clears the verifier, and redirects to a fixed same-origin destination. Tokens are not saved in browser storage or exposed to client JavaScript. The server checks Google provider availability before redirecting and shows a clear setup error if it is disabled.

Admin status is computed from the confirmed email returned by Supabase and the server-only configured admin address. Client roles and editable user metadata cannot grant admin access. Drafts and hidden notes stay private to their author; admin moderation covers published notes only.

Official setup guide: https://supabase.com/docs/guides/auth/social-sign-in/auth-google

## Development
Node >=22.13.0. Install with `npm run install:ci`. Generate schema changes with `npm run db:generate`; never modify previously applied migrations. Build with `npm run build`. Apply pending D1 migrations locally, then start `npm run dev`.

The text-note data lives in Cloudflare D1. Supabase provides identity only, so private note access is enforced in the server routes rather than through Supabase database RLS.

There is no scheduled delivery or automatic release of notes after death. Hiding a note removes it from this website's public list, but cannot recall copies already made by readers.


