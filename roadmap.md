# Smart shopping list
- [x] Add saved per-food replenishment intervals, exclusion and restoration controls; 25 tests passed and authenticated mobile flow verified across reloads.
- [x] Predict replenishment from receipt purchase intervals, without claiming exact stock (unit-tested; current family has insufficient repeated receipts).
- [x] Suggest healthier substitutions respecting household restrictions and compare only observed compatible-unit prices (15 tests passed).
- [x] Save a shared editable shopping checklist and verify authenticated add, substitute, edit quantity, check, reload, download and remove on desktop/mobile.

# Weekly meal planner
- [x] Store household pantry, preferences and latest weekly plan securely by family.
- [x] Generate validated seven-day recipes and missing-ingredient shopping list through authenticated AI.
- [x] Add planner page and entry from Recipes and Dashboard.
- [ ] Verify full flow signed in (needs user sign-in in preview).

# Android (Google Play)
- [x] Capacitor config, camera plugin, RevenueCat purchase flow in Premium page.
- [x] RevenueCat webhook writing to subscriptions.
- [ ] RevenueCat account + Google Play products + Android public key + webhook secret (user).
- [ ] Build .aab in Android Studio (user).

# Later
- [ ] Free plan limits and Premium locks.
- [ ] Photo compression and lazy loading.
