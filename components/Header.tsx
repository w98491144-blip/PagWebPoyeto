"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { Category, SiteSettings } from "@/lib/types";

const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className={`h-4 w-4 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
  </svg>
);

const Header = ({
  settings,
  categories
}: {
  settings: SiteSettings;
  categories: Category[];
}) => {
  const pathname = usePathname();
  const [hashSlug, setHashSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!pathname?.startsWith("/categorias")) {
      setHashSlug(null);
      return;
    }

    const updateHash = () => {
      const slug = window.location.hash.replace("#", "");
      setHashSlug(slug || null);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  const activeSlug = pathname?.startsWith("/categoria/")
    ? pathname.split("/")[2]
    : hashSlug;
  const orderOptions = [
    {
      label: "PedidosYa",
      url: settings.pedidosya_url,
      provider: "pedidosya"
    },
    { label: "Rappi", url: settings.rappi_url, provider: "rappi" }
  ].filter(
    (
      option
    ): option is {
      label: string;
      url: string;
      provider: "pedidosya" | "rappi";
    } => Boolean(option.url)
  );
  const renderTopBarText = () => {
    if (!settings.top_bar_text) {
      return null;
    }

    const emphasizedWords = ["Rappi", "PedidosYa"];
    const parts = settings.top_bar_text.split(
      new RegExp(`(${emphasizedWords.join("|")})`, "g")
    );

    return parts.map((part, index) => {
      if (!emphasizedWords.includes(part)) {
        return <span key={`${part}-${index}`}>{part}</span>;
      }

      return (
        <strong key={`${part}-${index}`} className="font-bold">
          {part}
        </strong>
      );
    });
  };

  return (
    <header className="shadow-sm">
      {settings.top_bar_text && (
        <div className="site-topbar text-center text-xs font-semibold tracking-wide md:text-sm">
          <div className="container-shell py-1.5">{renderTopBarText()}</div>
        </div>
      )}
      <div className="site-header-band border-b border-ink-100">
        <div className="container-shell flex flex-col gap-4 py-3 md:flex-row md:items-center md:justify-between md:py-4">
          <Link href="/" className="flex items-center gap-3">
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={settings.brand_name ?? "Logo"}
                width={180}
                height={56}
                className="h-12 w-auto drop-shadow-md md:h-14"
                unoptimized
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/90 shadow-sm">
                <span className="font-serif text-xl text-ink-900">R</span>
              </div>
            )}
            {!settings.logo_url && (
              <span className="hidden text-lg font-semibold md:inline">
                {settings.brand_name ?? "Restaurante"}
              </span>
            )}
          </Link>
          <nav className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="nav-dropdown group">
              <Link
                href="/categorias"
                className="nav-pill inline-flex items-center gap-2"
              >
                Categorias
                <ChevronDownIcon />
              </Link>
              {categories.length > 0 && (
                <div className="nav-dropdown-panel group-hover:block group-focus-within:block">
                  <div className="max-h-80 overflow-y-auto">
                    {categories.map((category) => {
                      const isActive = activeSlug === category.slug;

                      return (
                        <Link
                          key={category.id}
                          href={`/categorias#${category.slug}`}
                          className={`nav-dropdown-item ${
                            isActive ? "nav-dropdown-item-active" : ""
                          }`}
                          onClick={() =>
                            trackEvent("click_category", {
                              category_name: category.name,
                              category_slug: category.slug,
                              source: "header_nav"
                            })
                          }
                        >
                          {category.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {orderOptions.length > 0 && (
              <div className="nav-dropdown group">
                <button
                  type="button"
                  className="nav-pill inline-flex items-center gap-2"
                >
                  Pedir
                  <ChevronDownIcon />
                </button>
                <div className="nav-dropdown-panel group-hover:block group-focus-within:block">
                  {orderOptions.map((option) => (
                    <a
                      key={option.label}
                      href={option.url}
                      target="_blank"
                      rel="noreferrer"
                      className="nav-dropdown-item"
                      onClick={() =>
                        trackEvent("click_order", {
                          provider: option.provider,
                          source: "header_nav"
                        })
                      }
                    >
                      {option.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
