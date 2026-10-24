import Image, { type StaticImageData } from "next/image"

import { cn } from "@/lib/utils"

/** Gabarit de page : marges du magazine. */
export function Container({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Titre courant de magazine : rubrique à gauche, folio à droite, sur un
 * filet or. Le folio suit l'ordre de lecture de la page. Au défilement, le
 * filet se déroule de gauche à droite et le folio remonte dans son cache.
 */
export function RunningHead({
  label,
  folio,
  tone = "paper",
  className,
}: {
  label: string
  folio: number
  tone?: "paper" | "teal"
  className?: string
}) {
  return (
    <div
      data-reveal="folio"
      className={cn(
        "flex items-baseline justify-between gap-6 border-t pt-3 text-[0.8125rem] leading-none",
        tone === "paper"
          ? "border-gold/70 text-ink-soft"
          : "border-gold-light/50 text-mist",
        className
      )}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "folio-mask serif text-[1.125rem] font-medium italic tabular-nums",
          tone === "paper" ? "text-gold-ink" : "text-gold-light"
        )}
      >
        <span>{folio}</span>
      </span>
    </div>
  )
}

/**
 * Photo HD au traitement commun (dominante chaude, grain). `crop` permet
 * un recadrage éditorial optionnel, sans agrandissement par défaut.
 */
export function Photo({
  src,
  alt,
  sizes,
  className,
  position = "50% 50%",
  crop = 1,
  preload = false,
  zoom = false,
  imgClassName,
}: {
  src: StaticImageData
  alt: string
  sizes: string
  className?: string
  position?: string
  crop?: number
  preload?: boolean
  /** Léger zoom de l'image dans son cadre au survol. */
  zoom?: boolean
  imgClassName?: string
}) {
  return (
    <div className={cn("photo", zoom && "photo-zoom", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={90}
        preload={preload}
        placeholder="blur"
        className={cn("object-cover", imgClassName)}
        style={{ objectPosition: position, scale: crop }}
      />
    </div>
  )
}

/** Légende photo : petite, en italique, précise. */
export function Caption({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <figcaption
      className={cn(
        "text-[0.78125rem] leading-[1.45] text-ink-soft italic",
        className
      )}
    >
      {children}
    </figcaption>
  )
}
