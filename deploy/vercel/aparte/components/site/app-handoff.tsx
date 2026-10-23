import type { StaticImageData } from "next/image"
import Link from "next/link"
import { AppleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Caption, Container, Photo } from "@/components/edito/primitives"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * Page de repli des liens universels (boutique, produit, liens retirés) et
 * page 404. Sur un téléphone où Aparté est installée, l'app s'ouvre avant
 * d'afficher cette page : elle ne s'affiche donc que sans l'app, ou sur
 * ordinateur.
 */
export function AppHandoff({
  label,
  folio,
  title,
  children,
  showStore = true,
  secondary = { label: "Back to home", href: "/" },
  photo,
}: {
  label: string
  folio?: string
  title: string
  children: React.ReactNode
  showStore?: boolean
  secondary?: { label: string; href: string }
  photo?:
    | {
        src: StaticImageData
        alt: string
        caption: string
        className: string
        position?: string
        crop?: number
      }
    | { visual: React.ReactNode; caption: string }
}) {
  return (
    <section aria-labelledby="fallback-title" className="pb-24 lg:pb-36">
      <Container>
        <div className="flex items-baseline justify-between gap-6 border-t border-gold/70 pt-3 text-[0.8125rem] leading-none text-ink-soft">
          <span>{label}</span>
          {folio ? (
            <span className="serif text-[1.125rem] font-medium text-gold-ink italic tabular-nums">
              {folio}
            </span>
          ) : null}
        </div>

        <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-14 lg:mt-20 lg:min-h-[28rem] lg:items-end">
          <div className={cn("col-span-12", photo && "lg:col-span-7")}>
            <h1
              id="fallback-title"
              className="cover-title-block display max-w-[12em] text-[3.25rem] text-balance sm:text-[4.75rem] lg:text-[6.25rem]"
            >
              {title}
            </h1>
            <div className="mt-8 max-w-[34rem] text-[1.0625rem] leading-[1.7] text-ink-soft [&_p+p]:mt-3">
              {children}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {showStore ? (
                <a href={site.appStoreUrl} className={buttonVariants({ size: "lg" })}>
                  <HugeiconsIcon
                    icon={AppleIcon}
                    strokeWidth={1.6}
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                  Get the app
                </a>
              ) : null}
              <Link
                href={secondary.href}
                className={buttonVariants({
                  variant: showStore ? "outline" : "default",
                  size: "lg",
                })}
              >
                {secondary.label}
              </Link>
            </div>
          </div>

          {photo ? (
            <figure className="cover-reveal col-span-12 sm:col-span-8 lg:col-span-4 lg:col-start-9">
              {"visual" in photo ? (
                photo.visual
              ) : (
                <Photo
                  src={photo.src}
                  alt={photo.alt}
                  sizes="(min-width: 1024px) 30vw, 66vw"
                  position={photo.position}
                  crop={photo.crop}
                  className={photo.className}
                />
              )}
              <Caption className="mt-3">{photo.caption}</Caption>
            </figure>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
