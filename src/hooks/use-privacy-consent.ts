import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "nutricasa_privacy_consent_v1";
const CAMERA_KEY = "nutricasa_camera_consent_v1";

export interface PrivacyConsent {
  privacyPolicy: boolean;
  termsOfUse: boolean;
  dataProcessing: boolean;
  cameraAccess: boolean;
  timestamp: string;
}

export function usePrivacyConsent() {
  const [consent, setConsentState] = useState<PrivacyConsent | null>(null);
  const [cameraConsent, setCameraConsentState] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConsentState(JSON.parse(raw));
      setCameraConsentState(localStorage.getItem(CAMERA_KEY) === "true");
    } catch {
      // ignore
    }
  }, []);

  const saveConsent = useCallback((c: Omit<PrivacyConsent, "timestamp">) => {
    const full = { ...c, timestamp: new Date().toISOString() } as PrivacyConsent;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    setConsentState(full);
  }, []);

  const saveCameraConsent = useCallback((value: boolean) => {
    localStorage.setItem(CAMERA_KEY, String(value));
    setCameraConsentState(value);
  }, []);

  const hasConsent = useCallback(() => {
    return !!consent && consent.privacyPolicy && consent.termsOfUse && consent.dataProcessing;
  }, [consent]);

  const revokeConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CAMERA_KEY);
    setConsentState(null);
    setCameraConsentState(false);
  }, []);

  return {
    consent,
    cameraConsent,
    hasConsent: hasConsent(),
    saveConsent,
    saveCameraConsent,
    revokeConsent,
  };
}
