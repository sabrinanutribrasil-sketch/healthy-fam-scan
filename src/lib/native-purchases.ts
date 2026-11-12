import { Capacitor } from "@capacitor/core";

export type NativePlan = "monthly" | "yearly";

const androidKey = (import.meta.env.VITE_REVENUECAT_ANDROID_KEY as string | undefined) || "goog_jANtOhsWoXsUmtGqtRXFRcxZKwI";

/** True when running inside the Android app; store rules require Google Play Billing there. */
export const isNativeAndroid = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
export const isNativeBillingConfigured = () => isNativeAndroid() && Boolean(androidKey);

let configuredFor: string | null = null;

async function ensureConfigured(userId: string) {
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  if (!androidKey) throw new Error("Compras pelo Google Play ainda não foram configuradas.");
  if (configuredFor === null) {
    await Purchases.configure({ apiKey: androidKey, appUserID: userId });
  } else if (configuredFor !== userId) {
    await Purchases.logIn({ appUserID: userId });
  }
  configuredFor = userId;
  return Purchases;
}

/** Buys the plan via Google Play; access is activated by the RevenueCat webhook writing to subscriptions. */
export async function purchaseNativePlan(userId: string, plan: NativePlan) {
  const Purchases = await ensureConfigured(userId);
  const { current } = await Purchases.getOfferings();
  const pkg = plan === "monthly" ? current?.monthly : current?.annual;
  if (!pkg) throw new Error("Plano indisponível no Google Play no momento.");
  await Purchases.purchasePackage({ aPackage: pkg });
}

export async function restoreNativePurchases(userId: string) {
  const Purchases = await ensureConfigured(userId);
  await Purchases.restorePurchases();
}
