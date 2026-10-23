import type { Metadata } from "next"

/**
 * Métadonnées communes : titre, description, adresse canonique et carte de
 * partage Open Graph avec son image.
 */
export function pageMetadata({
  title,
  description,
  path,
  shareTitle,
}: {
  title: string
  description: string
  path: string
  shareTitle?: string
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Passeline",
      url: path,
      title: shareTitle ?? `${title} | Passeline`,
      description,
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "Passeline: on a Wrenhaven quay, a gift tied with a gold bow waits by the Ferris wheel.",
        },
      ],
    },
  }
}
