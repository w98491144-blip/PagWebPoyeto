"use client";

import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

const InstagramIcon = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const TikTokIcon = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M15.5 3c.4 2.3 1.9 3.8 4.2 4.2v3.1c-1.8-.1-3.2-.6-4.2-1.3v5.2c0 3.1-2.5 5.6-5.6 5.6S4.3 17.3 4.3 14.2s2.5-5.6 5.6-5.6c.4 0 .8 0 1.2.1v3.1c-.3-.1-.7-.2-1.2-.2-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5V3h3.1z" />
  </svg>
);

const Footer = ({ settings }: { settings: SiteSettings }) => {
  const socials = [
    { label: "Instagram", url: settings.instagram_url },
    { label: "Facebook", url: settings.facebook_url },
    { label: "TikTok", url: settings.tiktok_url },
    { label: "WhatsApp", url: settings.whatsapp_url }
  ].filter((item) => item.url);
  const bookLogoUrl = settings.libro_reclamaciones_logo_url;
  const contactEmail = settings.contact_email
    ? `mailto:${settings.contact_email}`
    : null;
  const primaryLinks = [
    contactEmail
      ? { label: "Contacto", url: contactEmail }
      : { label: "Catalogo", url: "/categorias" },
    { label: "Rappi", url: settings.rappi_url },
    { label: "PedidosYa", url: settings.pedidosya_url }
  ].filter((item) => item.url);

  return (
    <footer>
      <div className="footer-ribbon" />
      <div className="site-footer-band">
        <div className="container-shell grid gap-8 py-8 md:grid-cols-[2fr_1fr_0.9fr] md:gap-6 md:py-10">
          <div className="space-y-3 md:self-start">
            <Link href="/" aria-label="Ir al inicio" className="inline-flex">
              {settings.footer_logo_url || settings.logo_url ? (
                <Image
                  src={settings.footer_logo_url ?? settings.logo_url ?? ""}
                  alt={settings.brand_name ?? "Logo"}
                  width={512}
                  height={512}
                  className="h-40 w-auto md:h-56"
                  unoptimized
                />
              ) : (
                <p className="font-serif text-4xl md:text-5xl">
                  {settings.brand_name ?? "Restaurante"}
                </p>
              )}
            </Link>
          </div>
          <div className="space-y-3 text-base md:justify-self-start md:mt-4 md:self-start">
            <div className="footer-title-block">
              <p className="footer-title">Conócenos</p>
              <div className="footer-divider" />
            </div>
            <ul className="footer-list">
              {primaryLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.url ?? "#"}
                    target={item.url?.startsWith("http") ? "_blank" : undefined}
                    rel={item.url?.startsWith("http") ? "noreferrer" : undefined}
                    className="footer-link"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/legal/privacidad" className="footer-link">
                  Politica de Privacidad
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 text-base md:items-center md:text-center md:justify-self-end md:mt-4 md:self-start">
            <div className="footer-title-block md:items-center">
              <p className="footer-title">Redes sociales</p>
              <div className="footer-divider" />
            </div>
            {socials.length > 0 ? (
              <div className="flex flex-col gap-2 md:items-center">
                {socials.map((item) => (
                  <a
                    key={item.label}
                    href={item.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="footer-link inline-flex items-center gap-2 font-semibold"
                  >
                    {item.label === "Instagram" ? (
                      <InstagramIcon className="h-5 w-5" />
                    ) : item.label === "TikTok" ? (
                      <TikTokIcon className="h-5 w-5" />
                    ) : (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current/40 text-[10px] font-semibold uppercase">
                        {item.label.slice(0, 1)}
                      </span>
                    )}
                    {item.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm">Sin redes configuradas.</p>
            )}
            <Link
              href="/libro-reclamaciones"
              aria-label="Libro de Reclamaciones"
              className="footer-link footer-reclamaciones inline-flex flex-col items-center gap-2 font-semibold"
            >
              {bookLogoUrl ? (
                <Image
                  src={bookLogoUrl}
                  alt="Libro de Reclamaciones"
                  width={360}
                  height={120}
                  className="reclamaciones-logo-img"
                  unoptimized
                />
              ) : (
                <>
                  <span className="footer-reclamaciones-text text-center">
                    <span className="block text-sm uppercase tracking-[0.26em]">
                      Libro de
                    </span>
                    <span className="block text-lg font-semibold uppercase tracking-[0.12em]">
                      Reclamaciones
                    </span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 240 120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="reclamaciones-logo"
                    aria-hidden="true"
                  >
                    <path d="M20 88L64 20Q96 20 120 36V100Q88 92 20 88Z" />
                    <path d="M220 88L176 20Q144 20 120 36V100Q152 92 220 88Z" />
                    <path d="M36 84L72 30Q96 30 120 44" />
                    <path d="M204 84L168 30Q144 30 120 44" />
                    <path d="M120 36V100" />
                    <path d="M20 88Q120 112 220 88" />
                  </svg>
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
