<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Data comes from an external, user-owned Supabase project through `src/lib/supabase.ts` (lazy `getSupabase()`); do not enable Lovable Cloud or migrate its schema — the user owns the database.
- Dashboard data uses React Query hooks in `src/hooks/use-horta.ts` with Realtime invalidation plus polling fallback — keeps the panel live even if Realtime is off.
- Business thresholds live in `src/lib/horta.ts` and are covered by `src/test/horta.test.ts` — one source of truth for alert rules.
