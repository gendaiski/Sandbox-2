import { Estimateur } from "@/components/edito/estimateur"
import { Caption, Container, Photo, RunningHead } from "@/components/edito/primitives"
import { formatUsd, pricing } from "@/lib/pricing"
import livreur from "@/public/images/livreur.jpg"

const tarifs = [
  { label: "Base fare, in person", value: pricing.base.inPerson },
  { label: "Base fare, set aside", value: pricing.base.setAside },
  { label: "Per mile", value: pricing.perMile },
  { label: "Return, if no one comes", value: pricing.returnFee },
] as const

export function Arrivee() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-6 pb-24 lg:pb-36"
    >
      <Container>
        <RunningHead label="How it works" folio={3} />

        <h2
          id="how-it-works-title"
          className="display mt-12 max-w-[11em] text-[3.25rem] text-balance sm:text-[4.5rem] lg:mt-16 lg:text-[6.5rem]"
        >
          Brought to the door, or set aside.
        </h2>

        <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-14 lg:mt-20 lg:gap-x-6">
          {/* Photo du coursier */}
          <figure className="col-span-11 sm:col-span-8 lg:col-span-5 lg:row-span-2">
            <Photo
              src={livreur}
              alt="A smiling courier carries cardboard parcels and padded envelopes outdoors."
              sizes="(min-width: 1024px) 38vw, (min-width: 640px) 66vw, 92vw"
              position="50% 0%"
              zoom
              className="aspect-[3/5] w-full"
            />
            <Caption className="mt-3">
              A parcel, carried with care. An illustration of the personal touch
              behind every delivery.
            </Caption>
          </figure>

          {/* Deux colonnes d'article */}
          <div className="col-span-12 grid gap-12 sm:grid-cols-2 sm:gap-0 lg:col-span-7 lg:col-start-6">
            <article className="sm:pr-8 lg:pr-10">
              <h3 className="display text-[2.75rem] lg:text-[3.5rem]">
                In person
              </h3>
              <p className="serif mt-2 text-[1.25rem] text-ink-soft italic">
                With a note, read softly.
              </p>
              <div className="mt-6 space-y-4 text-[1rem] leading-[1.65]">
                <p>
                  A courier rings the bell of the person you’re spoiling and
                  hands them the gift, no one in between.
                </p>
                <p>
                  If you’d like, they then read the note you wrote by hand.
                  Your name appears nowhere else.
                </p>
              </div>
            </article>

            <article className="sm:border-l sm:border-gold/70 sm:pl-8 lg:pl-10">
              <h3 className="display text-[2.75rem] lg:text-[3.5rem]">
                Set aside
              </h3>
              <p className="serif mt-2 text-[1.25rem] text-ink-soft italic">
                With a keeper down the street.
              </p>
              <div className="mt-6 text-[1rem] leading-[1.65]">
                <p>
                  Nobody home? The gift waits with a keeper, either a partner
                  shop or a vetted neighbor. Then the recipient:
                </p>
                <ol className="mt-4 space-y-2.5">
                  {[
                    "gets a digital card announcing the surprise;",
                    "stops by the keeper whenever it suits them;",
                    "gives their code, good for 7 days, and walks off with it.",
                  ].map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="serif w-4 shrink-0 text-[1.0625rem] text-gold-ink italic tabular-nums"
                      >
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4">
                  If no one shows up, the gift finds its way back to you.
                </p>
              </div>
            </article>
          </div>

          {/* Encart tarifs */}
          <aside
            id="pricing"
            aria-labelledby="pricing-title"
            className="col-span-12 scroll-mt-6 self-end bg-paper-deep px-6 py-8 sm:px-10 sm:py-10 lg:col-span-7 lg:col-start-6"
          >
            <div className="grid gap-10 md:grid-cols-[1.15fr_1fr] md:gap-12">
              <div>
                <h3
                  id="pricing-title"
                  className="display text-[2rem] lg:text-[2.375rem]"
                >
                  What it costs
                </h3>
                <dl data-reveal="leaders" className="mt-6 space-y-3 text-[0.9375rem]">
                  {tarifs.map((row, i) => (
                    <div
                      key={row.label}
                      className="flex items-baseline gap-2"
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      <dt className="shrink-0">{row.label}</dt>
                      <span
                        aria-hidden="true"
                        data-leader
                        className="min-w-6 flex-1 translate-y-[-0.28em] border-b border-dotted border-gold"
                      />
                      <dd className="serif shrink-0 text-[1.125rem] tabular-nums">
                        {formatUsd(row.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="md:border-l md:border-gold/70 md:pl-10">
                <p className="text-[0.875rem] leading-[1.6] text-ink-soft">
                  These figures give you a ballpark: the app shows the exact
                  total before you confirm. Pay with Visa, Mastercard,
                  American Express or Apple Pay.
                </p>
                <Estimateur />
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  )
}
