# Death Note — A Life in Words

A text-only place for people facing the end of life to preserve memories and leave personal messages. Readers can browse published notes without signing in.

## Visibility
- New notes default to **Draft** and are visible only to their author.
- **Hidden** notes are private to their author, including after a previously published note is hidden.
- **Published** notes are readable by anyone. Publishing requires explicit confirmation.
- Admins can hide or delete published notes. They cannot list or read other authors' drafts or hidden notes, or publish another author's private notes.
- No image uploads or photo access routes remain active. Legacy character records and uploaded objects are retained separately, not automatically deleted or reinterpreted as personal notes.

## Connect Supabase Auth
1. Create or select a Supabase project at https://supabase.com/dashboard.
2. In the hosted website's runtime environment, set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `ADMIN_EMAIL`. Use a publishable key (or legacy anon key), never a secret/service-role key. `.env.example` documents the names. Do not commit real configuration or keys.
3. Enable Email authentication and keep email confirmation enabled in Supabase. After configuring custom SMTP, edit the Magic Link email template to display `{{ .Token }}` as a sign-in code. This app uses email OTP for both registration and login.
4. Set the Site URL to https://deathnote-character-journal.starrygleam257.chatgpt.site and configure delivery. Supabase's built-in email sender is restricted and is not suitable for general public sign-ups; connect a supported SMTP provider or email hook. Check its free-tier limits separately.
5. Redeploy after changing hosted runtime environment variables. Sign in with the verified email configured in `ADMIN_EMAIL` to receive the admin dashboard.

No Supabase project has been assumed or created automatically. When project configuration is missing, sign-in fails closed and the website clearly marks setup as pending. Existing ChatGPT login sessions are not accepted as Supabase identities. Old user records are not automatically assigned to new accounts.

Auth is verified server-side against Supabase `/auth/v1/user`. The admin role comes from the server-only configured email and a confirmed email address, never client-supplied roles or editable user metadata. Sessions use HttpOnly, SameSite cookies; state-changing requests require a matching Origin. No Supabase service-role key is needed.

Official setup guides:
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/auth-smtp

## Development
Node >=22.13.0. Install with `npm run install:ci`. Generate schema changes with `npm run db:generate`; never modify previously applied migrations. Build with `npm run build`. Apply pending D1 migrations locally, then start `npm run dev`.

The text-note data lives in Cloudflare D1. Supabase provides identity only, so private note access is enforced in the server routes rather than through Supabase database RLS.

There is no scheduled delivery or automatic release of notes after death. Hiding a note removes it from this website's public list, but cannot recall copies already made by readers.

