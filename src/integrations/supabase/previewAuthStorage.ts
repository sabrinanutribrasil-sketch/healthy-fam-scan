// Auth storage: uses localStorage directly. The Lovable preview broker has been removed.
export function brokeredPreviewStorage() {
  if (typeof window === 'undefined') return undefined;
  return localStorage;
}
