"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { COOKIE_CONSENT_KEY } from "@/lib/analytics";

type ConsentState = "unset" | "granted" | "denied";

type AnalyticsManagerProps = {
  metaPixelId?: string | null;
  googleTagId?: string | null;
};

const normalizeId = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const isGtmId = (value: string) => value.startsWith("GTM-");

const AnalyticsManager = ({ metaPixelId, googleTagId }: AnalyticsManagerProps) => {
  const pixelId = useMemo(() => normalizeId(metaPixelId), [metaPixelId]);
  const tagId = useMemo(() => normalizeId(googleTagId), [googleTagId]);
  const [consent, setConsent] = useState<ConsentState>("unset");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored === "granted" || stored === "denied") {
        setConsent(stored);
      }
    } catch {
      setConsent("unset");
    }
  }, []);

  const allowTracking = consent === "granted";
  const isBlocked = consent !== "granted";

  const handleConsent = (value: "granted" | "denied") => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
    }
    setConsent(value);
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    const { body, documentElement } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = documentElement.style.overflow;

    if (isBlocked) {
      body.style.overflow = "hidden";
      documentElement.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isBlocked]);

  return (
    <>
      {allowTracking && pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {allowTracking && tagId && !isGtmId(tagId) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${tagId}');`}
          </Script>
        </>
      )}

      {allowTracking && tagId && isGtmId(tagId) && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${tagId}');`}
        </Script>
      )}

      {isBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 px-4">
          <div
            className="w-full max-w-xl space-y-4 rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-soft"
            role="dialog"
            aria-modal="true"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                Preferencias de medicion
              </p>
              <h2 className="text-xl font-semibold text-ink-900">
                Necesitas aceptar cookies para continuar
              </h2>
              <p className="text-sm text-ink-700">
                Usamos herramientas de analitica para medir visitas y clics en
                Rappi/PedidosYa. Lee nuestra{" "}
                <a href="/legal/privacidad" className="font-semibold underline">
                  Politica de Privacidad
                </a>
                .
              </p>
              {consent === "denied" && (
                <p className="text-sm text-ink-600">
                  Has rechazado las cookies. Para ingresar, acepta el uso de
                  analitica.
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="button-outline"
                onClick={() => handleConsent("denied")}
              >
                Rechazar
              </button>
              <button
                type="button"
                className="button"
                onClick={() => handleConsent("granted")}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsManager;
