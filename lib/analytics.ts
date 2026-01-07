export const COOKIE_CONSENT_KEY = "cookie-consent";

export type EventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type MetaStandardEvent = "ViewContent" | "InitiateCheckout";

type Fbq = (action: string, event: string, params?: EventParams) => void;
type Gtag = (action: string, event: string, params?: EventParams) => void;

declare global {
  interface Window {
    fbq?: Fbq;
    gtag?: Gtag;
  }
}

const hasConsent = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
};

const cleanParams = (params?: EventParams) => {
  if (!params) return undefined;
  const cleaned: EventParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    cleaned[key] = value;
  });
  return cleaned;
};

export const trackEvent = (name: string, params?: EventParams) => {
  if (typeof window === "undefined") return;
  if (!hasConsent()) return;
  const payload = cleanParams(params);

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", name, payload);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }
};

export const trackMetaEvent = (
  name: MetaStandardEvent,
  params?: EventParams
) => {
  if (typeof window === "undefined") return;
  if (!hasConsent()) return;
  const payload = cleanParams(params);

  if (typeof window.fbq === "function") {
    window.fbq("track", name, payload);
  }
};
