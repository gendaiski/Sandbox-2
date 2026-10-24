import Image from "next/image"

import bouquet from "@/public/images/produit-bouquet.jpg"

const iconPaths = {
  back: "m14 6-6 6 6 6",
  share: "M12 15V3m-4 4 4-4 4 4M7 10H4v11h16V10h-3",
  heart:
    "M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  gift: "M3 9h18v4H3V9Zm2 4v8h14v-8M12 9v12M12 9H7a3 3 0 1 1 3-3l2 3Zm0 0h5a3 3 0 1 0-3-3l-2 3Z",
  next: "m9 5 7 7-7 7",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  calendar: "M4 5h16v16H4V5Zm0 5h16M8 3v4m8-4v4",
} as const

function PreviewIcon({ name }: { name: keyof typeof iconPaths }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[1em] shrink-0"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}

/** A static app illustration: its pictured controls are deliberately not interactive. */
export function BoutiquePreview() {
  return (
    <div
      role="img"
      aria-label="The Institut Céladon page in the Aparté app: a bouquet banner, the address at 12 Linden Lane in Orcel Point, gift cards, appointment booking, facials and massage."
      className="@container relative aspect-[900/1834] w-full overflow-hidden rounded-[0.875rem] bg-[#fcfcfa] text-[#0f2324]"
    >
      <div aria-hidden="true" className="absolute inset-0 text-[3cqw] leading-[1.35]">
        <div className="absolute inset-x-0 top-0 h-[26%]">
          <Image
            src={bouquet}
            alt=""
            fill
            sizes="138px"
            quality={90}
            className="object-cover object-[50%_80%]"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-[#fcfcfa]" />
        </div>

        <div className="absolute inset-x-[6.5%] top-[1.6%] flex items-center justify-between text-[3.3cqw] font-semibold text-white">
          <span>9:41</span>
          <svg viewBox="0 0 58 13" fill="currentColor" className="h-[2.8cqw] w-auto">
            <path d="M1 9h3v3H1zm5-3h3v6H6zm5-3h3v9h-3zm5-3h3v12h-3" />
            <path d="M24 4a12 12 0 0 1 16 0m-13 3a8 8 0 0 1 10 0m-7 3a3 3 0 0 1 4 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <rect x="44" y="2" width="11" height="9" rx="2" fill="none" stroke="currentColor" />
            <path d="M46 4h7v5h-7zm11 1h1v3h-1z" />
          </svg>
        </div>

        <div className="absolute inset-x-[3.6%] top-[5.5%] flex items-center gap-[1.8cqw] text-[3.1cqw]">
          {(["back", "share", "heart", "bookmark"] as const).map((name, index) => (
            <span
              key={name}
              className={`flex size-[7.5cqw] items-center justify-center rounded-full bg-[#fcfcfa] ${index === 0 ? "mr-auto" : ""}`}
            >
              <PreviewIcon name={name} />
            </span>
          ))}
        </div>

        <div className="serif absolute top-[21.4%] left-[4.4%] flex size-[14cqw] items-center justify-center rounded-[3cqw] border-[0.2cqw] border-[#c59940]/70 bg-[#f9f6ed] text-[6.3cqw] shadow-[0_1.2cqw_2cqw_rgb(15_35_36/0.18)]">
          I<span className="-ml-[0.9cqw] text-[#c59940] italic">c</span>
        </div>
        <div className="serif absolute top-[30.2%] left-[4.4%] text-[7.1cqw] leading-none font-semibold">
          Institut Céladon
        </div>
        <div className="absolute top-[35.1%] left-[4.4%] h-[0.45cqw] w-[7.5cqw] bg-[#c59940]" />
        <div className="absolute top-[36.9%] left-[4.4%] flex items-center gap-[1.4cqw] text-[2.85cqw] text-[#536060]">
          <PreviewIcon name="pin" />
          <span>12 Linden Lane, Orcel Point</span>
        </div>
        <div className="absolute top-[39.4%] left-[4.4%] text-[2.85cqw] text-[#8d702a]">
          Beauty salon · Face and body care
        </div>
        <div className="serif absolute inset-x-[4.4%] top-[42.2%] line-clamp-2 text-[3.5cqw] leading-[1.3] italic">
          A bright little house on the Morrow River: facials, massage and
          manicures, taking all the time it takes, and not a minute less…
        </div>
        <div className="absolute top-[47.4%] left-[4.4%] text-[2.85cqw] font-medium text-[#1a7971]">
          Read more
        </div>

        <div className="absolute inset-x-[4.4%] top-[50.8%] flex h-[4.3%] items-center gap-[2.3cqw] rounded-full border-[0.2cqw] border-[#c59940]/75 px-[3.5cqw] text-[2.85cqw] font-medium">
          <span className="text-[#8d702a]"><PreviewIcon name="gift" /></span>
          <span>Give a gift card with your note</span>
          <span className="ml-auto"><PreviewIcon name="next" /></span>
        </div>
        <div className="absolute inset-x-[4.4%] top-[56.5%] flex items-center gap-[2cqw] whitespace-nowrap text-[2.6cqw] text-[#536060]">
          <span className="flex items-center gap-[1.2cqw] text-[#357f58]">
            <span className="size-[1.3cqw] rounded-full bg-[#43976b]" />
            Open until 7 PM
          </span>
          <span>24 treatments</span>
          <span>In person or set aside</span>
        </div>
        <div className="absolute top-[59.3%] left-[4.4%] flex h-[4.1%] items-center gap-[2cqw] rounded-full bg-[#1a7971] px-[3.8cqw] text-[2.9cqw] font-medium text-white">
          <PreviewIcon name="calendar" />
          <span>Book a time</span>
          <PreviewIcon name="arrow" />
        </div>

        <div className="absolute inset-x-[4.4%] top-[65.8%] h-[16.2%] overflow-hidden rounded-[3.4cqw] bg-linear-to-br from-[#205c55] to-[#0d302d] text-[#fcfcfa]">
          <span className="serif absolute -top-[1cqw] -right-[2cqw] text-[24cqw] leading-none text-[#c59940]/15 italic">C</span>
          <div className="absolute bottom-[3.5cqw] left-[4cqw]">
            <div className="serif text-[6cqw] leading-none">Facials</div>
            <div className="mt-[1.8cqw] h-[0.45cqw] w-[4.6cqw] bg-[#dabc6f]" />
            <div className="mt-[1.5cqw] text-[2.7cqw] text-white/75">12 treatments</div>
          </div>
          <span className="absolute right-[3.6cqw] bottom-[3.5cqw] flex size-[6.8cqw] items-center justify-center rounded-full bg-[#f9f6ed] text-[2.9cqw] text-[#0f2324]">
            <PreviewIcon name="arrow" />
          </span>
        </div>
        <div className="absolute inset-x-[4.4%] top-[83.2%] h-[16.2%] overflow-hidden rounded-[3.4cqw] bg-linear-to-br from-[#c2a16d] via-[#d6ba8c] to-[#b5935e] text-[#302b19]">
          <div className="absolute bottom-[3.5cqw] left-[4cqw]">
            <div className="serif text-[6cqw] leading-none">Massage</div>
            <div className="mt-[1.8cqw] h-[0.45cqw] w-[5.3cqw] bg-[#edcf83]" />
            <div className="mt-[1.5cqw] text-[2.7cqw]">8 treatments</div>
          </div>
        </div>
      </div>
    </div>
  )
}
