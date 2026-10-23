import { Caption, Container, Photo, RunningHead } from "@/components/edito/primitives"
import detail from "@/public/images/moment-detail.jpg"

export function Moment() {
  return (
    <section
      id="the-moment"
      aria-labelledby="the-moment-title"
      className="scroll-mt-6 pb-24 lg:pb-36"
    >
      <Container>
        <RunningHead label="The moment" folio={2} />

        <div className="mt-12 grid grid-cols-12 gap-x-4 lg:mt-16 lg:gap-x-6">
          <h2
            id="the-moment-title"
            className="display col-span-12 text-[3.25rem] text-balance sm:text-[4.5rem] lg:col-span-9 lg:text-[6.5rem]"
          >
            The second before it sinks in.
          </h2>

          {/* Détail photo, décalé vers le bas comme un médaillon */}
          <figure className="order-2 col-span-7 col-start-6 mt-12 sm:col-span-5 sm:col-start-8 lg:order-none lg:col-span-3 lg:col-start-1 lg:mt-28">
            <Photo
              src={detail}
              alt="Hands hold a gift wrapped in deep green paper, tied with a satin ribbon and a sprig of eucalyptus."
              sizes="(min-width: 1024px) 240px, 50vw"
              crop={1}
              zoom
              className="aspect-[330/410] w-full max-w-[240px]"
            />
            <Caption className="mt-3 max-w-[240px]">
              The care is in the details.
            </Caption>
          </figure>

          {/* Récit */}
          <div className="col-span-12 mt-10 text-[1.0625rem] leading-[1.7] sm:col-span-10 lg:col-span-5 lg:col-start-6 lg:mt-16 lg:text-[1.125rem]">
            <p className="lettrine">
              A knock at the door. A courier hands you a box with your name on
              it, then unfolds a card and reads it to you, softly. The words
              are tender, and the handwriting looks familiar.
            </p>
            <p className="mt-5">
              The signature comes last, at the very bottom of the card. It’s
              the only place the sender wrote their name.
            </p>
            <p className="mt-5">
              Then the courier slips away, leaving you the paper to tear, the
              box to open, and the smile that shows up before the words do.
            </p>
          </div>
        </div>

        {/* Citation en exergue, reprise du texte */}
        <blockquote className="mt-16 grid grid-cols-12 gap-x-4 lg:mt-24 lg:gap-x-6">
          <div className="col-span-12 border-t border-gold/70 pt-8 lg:col-span-9 lg:col-start-3 lg:pt-10">
            <p
              data-reveal="wipe"
              className="display text-[2.25rem] leading-[1.02] italic sm:text-[3rem] lg:text-[4.25rem]"
            >
              <span className="-ml-[0.36em]">“</span>You’ll find their name at
              the bottom of the note.”
            </p>
          </div>
        </blockquote>

        <div className="mt-12 grid grid-cols-12 gap-x-4 lg:mt-16 lg:gap-x-6">
          <p className="col-span-12 text-[1.0625rem] leading-[1.7] sm:col-span-10 lg:col-span-5 lg:col-start-6 lg:text-[1.125rem]">
            Aparté exists for the instant it all clicks. The trip matters
            less than the door that opens at the end of it.
          </p>
        </div>
      </Container>
    </section>
  )
}
