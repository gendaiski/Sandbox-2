import { Container, Photo, RunningHead } from "@/components/edito/primitives"
import quai from "@/public/images/quai.jpg"

export function LarchHarbor() {
  return (
    <section
      id="larch-harbor"
      aria-labelledby="larch-harbor-title"
      className="scroll-mt-6 pb-24 lg:pb-36"
    >
      <Container>
        <RunningHead label="Larch Harbor" folio={4} />
      </Container>

      <div className="relative mt-8 lg:mt-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
          <Container>
            <h2
              id="larch-harbor-title"
              className="display text-cream [text-shadow:0_2px_18px_#0f2324] pt-8 text-[3.5rem] sm:pt-12 sm:text-[5.5rem] lg:pt-16 lg:text-[8.5rem]"
            >
              Aparté,
              <br />
              made here.
            </h2>
          </Container>
        </div>
        <figure>
          <Photo
            src={quai}
            alt="Sailboats in Flensburg harbor at dusk, with waterfront houses reflected in the still water."
            sizes="100vw"
            crop={1}
            position="50% 45%"
            className="aspect-[4/5] w-full sm:aspect-[3/2] lg:aspect-[2/1] lg:max-h-[50rem]"
          />
          <Container>
            <figcaption className="mt-4 text-[0.78125rem] leading-[1.45] text-ink-soft italic">
              A harbor at the close of day. Flensburg, photographed by Carsten
              Ruthemann, stands in for our imaginary Larch Harbor.
            </figcaption>
          </Container>
        </figure>
      </div>

      <Container>
        <div className="mt-8 grid grid-cols-12 gap-x-4 lg:-mt-1 lg:gap-x-6">
          <p className="col-span-12 text-[1.0625rem] leading-[1.7] sm:col-span-9 lg:col-span-5 lg:col-start-7 lg:text-[1.125rem]">
            Aparté was born here, between the Morrow and Market Hall Square. Our
            couriers and keepers cover the whole town and every place within
            20&nbsp;miles, and the shops in the app are the ones on your street.
            Address too far out? The app tells you as you type it.
          </p>
        </div>
      </Container>
    </section>
  )
}
