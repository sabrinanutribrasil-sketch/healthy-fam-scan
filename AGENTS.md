# Architecture rules

- Use the managed Stripe gateway through `supabase/functions/_shared/stripe.ts`; never instantiate Stripe directly because managed credentials are gateway identifiers.
- Treat `subscriptions` as the source of truth for Premium access, always filtered by payment environment, because test and live records share the same database.
- Use embedded checkout sessions and authenticated user metadata because purchases must remain linked to the correct family account.