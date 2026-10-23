import type { Metadata } from "next"

/**
 * Métadonnées d'une page : titre, description, URL canonique et carte de
 * partage (Open Graph) complète, image comprise.
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
      siteName: "Écrin",
      url: path,
      title: shareTitle ?? `${title} | Écrin`,
      description,
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "Écrin, wrapped in mystery: a teal gift box with a gold ribbon, topped with a gold sparkle",
        },
      ],
    },
  }
}
