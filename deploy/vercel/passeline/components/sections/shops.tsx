import {
  DuskRoofline,
  ShopStreet,
} from "@/components/illustrations/street-scenes"

const shops = [
  {
    name: "Ciel de Lin",
    text: "Nails, facials and massage by the Orrin River, on Boatmen’s Quay.",
  },
  {
    name: "Institut Albâtre",
    text: "Face and body treatments in Belford, booked by appointment in the app.",
  },
  {
    name: "La Maison Passeline",
    text: "Our own gift boxes, stationery and wrapping, ordered like everything else.",
  },
] as const

const occasions = [
  "Our anniversary",
  "Fresh start",
  "Congratulations",
  "Little something",
  "Comfort",
]

export function Shops() {
  return (
    <section
      id="shops"
      aria-labelledby="shops-title"
      className="relative scroll-mt-4"
    >
      <DuskRoofline className="block aspect-[600/260] w-full md:aspect-[1600/260]" />
      <div className="sky-evening">
        <div className="mx-auto max-w-[1240px] px-4 pt-14 pb-24 sm:px-6 md:pt-20 md:pb-32 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-12">
            <h2
              id="shops-title"
              className="t-h2 text-[clamp(2.75rem,5.4vw,4.75rem)] text-cream"
            >
              Shop windows after dark
            </h2>
            <p className="t-lead max-w-[32rem] text-cream/80">
              When the quay goes dark, the storefronts take over. In the app,
              you wander from one Wrenhaven shop to the next: things to send,
              treatments to book, gift cards to give.
            </p>
          </div>

          <div className="mt-14 md:mt-20">
            <ShopStreet className="h-auto w-full" />
            <ul className="mt-6 grid gap-6 md:mt-8 md:grid-cols-3 md:gap-10">
              {shops.map((shop) => (
                <li key={shop.name} className="md:px-2">
                  <h3 className="t-h3 text-[1.6rem] text-cream">{shop.name}</h3>
                  <p className="mt-2 text-cream/75">{shop.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16 md:mt-20">
            <h3 className="t-strong text-[1.15rem] text-gold-light">
              Or start from the occasion
            </h3>
            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-7">
              {occasions.map((occasion, i) => (
                <li
                  key={occasion}
                  className="occasion"
                  style={{ rotate: `${[-3, 2, -1.5, 3, -2][i]}deg` }}
                >
                  <span className="occasion-tag t-strong text-[1.05rem] text-ink">
                    {occasion}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
