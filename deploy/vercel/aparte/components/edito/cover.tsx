import { AppleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Container, Photo } from "@/components/edito/primitives"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import moment from "@/public/images/moment-cadeau.jpg"

/*
 * Couverture. Le titre est placé par rapport à la photo, en unités cqw de la
 * « scène » (largeur de la photo), pour croiser toujours la même zone de
 * l'image, quelle que soit la largeur d'écran.
 *
 * Mobile : deux lignes sur le papier, « coming. » à cheval sur le bord haut de
 * la photo, en encre sur le fond clair de la nouvelle photographie.
 * Très grand écran (xl) : la scène occupe les colonnes 7 à 11 d'une grille de 12
 * (gouttière 24 px), la colonne 1 est donc à -(120cqw + 28,8 px) ; les lignes
 * descendent en escalier et passent, à l'encre, sur le fond clair de la photographie.
 */
const lines = ["She didn’t", "see it", "coming."] as const

const geometry = [
  // mobile : corps 19cqw, photo à 2,33em sous le haut du titre
  "[--l1:0em] [--l2:0.55em] [--l3:0.12em]",
  "[font-size:19cqw] [left:5.2cqw] top-0",
  // très grand écran : composition « couverture » sur 12 colonnes
  "xl:[--l2:2.2em] xl:[--l3:3.95em]",
  "xl:[font-size:27.8cqw] xl:[left:calc(-120cqw-28.8px)] xl:top-[11cqw]",
].join(" ")

export function Cover() {
  return (
    <section aria-labelledby="cover-title" className="pb-20 lg:pb-28">
      <Container>
        <div className="flex items-baseline justify-between gap-6 border-t border-gold/70 pt-3 text-[0.8125rem] leading-none text-ink-soft">
          <span>Gifts delivered by hand in Larch Harbor</span>
          <span className="hidden sm:inline">and 20&nbsp;miles around</span>
        </div>

        <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,34rem)_1fr] lg:items-center lg:gap-x-12 xl:grid-cols-12 xl:items-stretch xl:gap-x-6">
          {/* Scène : photo + titre */}
          <div className="@container -mx-5 sm:-mx-8 md:mx-0 md:max-w-[40rem] lg:max-w-none xl:col-[7/span_5] xl:row-start-1">
            <div className="relative pt-[44.3cqw] xl:pt-0">
              <h1
                id="cover-title"
                className={`display absolute z-10 ${geometry}`}
              >
                {lines.map((line, i) => (
                  <span key={line}>
                    <span
                      className="cover-line whitespace-nowrap"
                      style={{ paddingLeft: `var(--l${i + 1})` }}
                    >
                      <span
                        style={
                          {
                            "--i": i,
                          } as React.CSSProperties
                        }
                      >
                        {line}
                      </span>
                    </span>{" "}
                  </span>
                ))}
              </h1>

              <figure>
                <Photo
                  src={moment}
                  alt="A smiling woman in a brown sweater holds a pink gift box tied with a ribbon."
                  sizes="(min-width: 1280px) 38vw, (min-width: 768px) 640px, 100vw"
                  position="76% 50%"
                  preload
                  className="cover-photo aspect-[775/896]"
                />
                <figcaption className="cover-after px-5 pt-3 text-right text-[0.78125rem] leading-[1.45] text-ink-soft italic sm:px-8 md:px-0 xl:absolute xl:top-0 xl:left-full xl:ml-4 xl:p-0 xl:text-left xl:[writing-mode:vertical-rl]">
                  A little surprise, a lot to say.
                </figcaption>
              </figure>
            </div>
          </div>

          {/*
            Chapô et action. En xl, il démarre sous la 2e ligne du titre :
            0,585 × largeur de la scène (S = 5 colonnes + 4 gouttières),
            plus 48 px d'air.
          */}
          <div className="cover-after mt-12 max-w-[30rem] sm:mt-14 lg:mt-0 lg:pb-1 xl:col-[1/span_4] xl:row-start-1 xl:mt-[calc((min(100vw,1440px)*0.41667_-_60.67px)*0.5854_+_48px)] xl:self-start xl:pb-0">
            <p className="serif text-[1.625rem] leading-[1.15] italic lg:text-[1.875rem]">
              Then came your note.
            </p>
            <p className="mt-5 max-w-[34ch] text-[1rem] leading-[1.6] text-ink-soft lg:text-[1.0625rem]">
              An Aparté courier carries your gift anywhere in Larch Harbor and
              up to 20&nbsp;miles out, then reads the note you wrote by hand.
              That’s the only place your name appears.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={site.appStoreUrl}
                className={buttonVariants({ size: "lg" })}
              >
                <HugeiconsIcon
                  icon={AppleIcon}
                  strokeWidth={1.6}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                Get the app
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
