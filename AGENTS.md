# Architecture rules

- Render share cards locally from observed receipt scores, with explicit opt-in for the family name; use Capacitor Share/Filesystem on native and Web Share with PNG-download fallback on web so private health data is never uploaded for sharing.

- Compute replenishment from distinct receipt dates and substitutions from the food catalog; compare only recent observed per-kg/per-liter prices, never guessed package costs, to avoid false savings and stock guarantees.
- Persist the intelligent shopping checklist and per-food interval/exclusion settings in family_meal_planning through authenticated meal-planner actions with shared payload validation; preserve forecast settings on older-client item-only writes so Android updates cannot erase them, and retain existing family RLS.

- Use the managed Stripe gateway through `supabase/functions/_shared/stripe.ts`; never instantiate Stripe directly because managed credentials are gateway identifiers.
- Treat `subscriptions` as the source of truth for Premium access, always filtered by payment environment, because test and live records share the same database.
- Use embedded checkout sessions and authenticated user metadata because purchases must remain linked to the correct family account.
- Inside the Android app (Capacitor) Premium is sold only through Google Play via RevenueCat (`src/lib/native-purchases.ts`), because store rules forbid Stripe for digital goods there; the `revenuecat-webhook` function writes those purchases into the same `subscriptions` table.
