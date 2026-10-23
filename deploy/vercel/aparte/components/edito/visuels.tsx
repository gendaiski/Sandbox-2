import { Mark } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

/*
 * Deux « photos » faites en code, au même traitement que les vraies (classe
 * .photo : dominante chaude et grain). Toutes les mesures sont en unités du
 * conteneur (cqw, %) : le visuel se recadre comme une image, à toutes les
 * largeurs.
 */

const goldLeaf = {
  backgroundImage:
    "linear-gradient(180deg, #f3dc9c 0%, #e3be6b 30%, #b8862f 62%, #e3be6b 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const

/** La vitrine de Maison Ambre, quai des Lavandières : bandeau, vitre, seuil. */
export function Vitrine({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Maison Ambre’s storefront: a bottle-green sign with gold lettering, a window lit by three globe lamps, an “Open” sign and an “On Aparté” sticker."
      data-reveal="vitrine"
      className={cn("vitrine photo @container bg-teal-deep", className)}
    >
      {/* Boiserie peinte : léger modelé de lumière */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgb(0 0 0 / 0.22), transparent 7%, transparent 93%, rgb(0 0 0 / 0.22)), linear-gradient(180deg, #164a45, #123f3b 40%, #0f3633)",
        }}
      />

      {/* Bandeau de l'enseigne */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[5%] top-[7%] flex h-[21%] items-center justify-center border-y border-gold-light/60"
        style={{
          boxShadow:
            "inset 0 0.5cqw 1cqw rgb(0 0 0 / 0.25), 0 0.4cqw 0.8cqw rgb(0 0 0 / 0.25)",
        }}
      >
        <div className="absolute inset-x-[1.2%] inset-y-[9%] border-y border-gold-light/25" />
        <p
          className="font-heading text-[6.4cqw] leading-none font-medium tracking-[0.16em] whitespace-nowrap uppercase"
          style={goldLeaf}
        >
          Maison Ambre
        </p>
      </div>

      {/* La vitre */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[5%] top-[33%] bottom-[17%] overflow-hidden border-[0.6cqw] border-[#0d2e2b]"
        style={{
          background:
            "radial-gradient(70% 90% at 50% 105%, rgb(226 160 82 / 0.55), transparent 70%), radial-gradient(40% 60% at 20% 30%, rgb(226 170 96 / 0.22), transparent 70%), linear-gradient(180deg, #2a3a33, #3b3a2c 55%, #5a4630)",
          boxShadow: "inset 0 0 3cqw rgb(0 0 0 / 0.55)",
        }}
      >
        {/* Pénombre de la boutique avant que les globes s'allument */}
        <span data-dim className="absolute inset-0 bg-[#06100f]/55" />

        {/* Trois globes suspendus */}
        {[
          { left: "15%", cord: "10%" },
          { left: "44%", cord: "17%" },
          { left: "71%", cord: "7%" },
        ].map((globe, i) => (
          <span
            key={globe.left}
            className="absolute top-0 flex h-full -translate-x-1/2 flex-col items-center"
            style={{ left: globe.left }}
          >
            <span
              className="w-px shrink-0 bg-[#e3be6b]/45"
              style={{ height: globe.cord }}
            />
            <span
              data-globe
              className="block size-[3.4cqw] shrink-0 rounded-full"
              style={
                {
                  "--g": i,
                  background:
                    "radial-gradient(circle at 45% 40%, #fff6dc, #f2c879 45%, #c98b3a 100%)",
                  boxShadow:
                    "0 0 2cqw 0.8cqw rgb(242 200 121 / 0.55), 0 0 7cqw 3cqw rgb(226 160 82 / 0.28)",
                } as React.CSSProperties
              }
            />
          </span>
        ))}

        {/* Lettrage d'or sur la vitre */}
        <p
          className="absolute inset-x-0 top-[56%] text-center font-heading text-[2.5cqw] leading-none whitespace-nowrap italic"
          style={goldLeaf}
        >
          Nails · Facials · Massage
        </p>

        {/* Pancarte « Ouvert » : elle se balance au survol de la vitrine */}
        <span
          data-sign
          className="absolute top-0 right-[7%] flex origin-top flex-col items-center"
        >
          <span className="relative h-[3.2cqw] w-[6cqw]">
            <span className="absolute top-0 left-1/2 h-full w-px origin-top -rotate-[38deg] bg-[#e9e4da]/60" />
            <span className="absolute top-0 left-1/2 h-full w-px origin-top rotate-[38deg] bg-[#e9e4da]/60" />
          </span>
          <span
            className="-mt-px bg-cream px-[1.4cqw] py-[0.7cqw] font-heading text-[2cqw] leading-none text-teal-deep italic"
            style={{ boxShadow: "0 0.6cqw 1.2cqw rgb(0 0 0 / 0.35)" }}
          >
            Open
          </span>
        </span>

        {/* Reflets sur la vitre */}
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(112deg, transparent 18%, rgb(255 255 255 / 0.10) 24%, transparent 31%), linear-gradient(112deg, transparent 52%, rgb(255 255 255 / 0.07) 55%, transparent 60%)",
          }}
        />

        {/* Autocollant du partenaire */}
        <span
          className="absolute bottom-[9%] left-[4%] flex items-center gap-[0.9cqw] rounded-[0.6cqw] bg-cream px-[1.2cqw] py-[0.9cqw]"
          style={{ boxShadow: "0 0.3cqw 0.8cqw rgb(0 0 0 / 0.3)" }}
        >
          <Mark className="h-[3.4cqw]" />
          <span className="flex flex-col font-sans leading-[1.1]">
            <span className="text-[1.05cqw] tracking-[0.12em] text-ink-soft uppercase">
              Listed on
            </span>
            <span className="font-heading text-[2cqw] font-semibold text-ink">
              Aparté
            </span>
          </span>
        </span>
      </div>

      {/* Seuil de pierre : la zone claire où le titre vient mordre */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[17%]"
        style={{
          background:
            "linear-gradient(180deg, #cfc7b8 0, #e6e0d4 9%, #efebe3 40%, #f4f1ea 100%)",
          boxShadow: "0 -0.4cqw 0.8cqw rgb(0 0 0 / 0.28)",
        }}
      />
    </div>
  )
}

/** Une carte cadeau de l'Institut Céladon, posée sur son enveloppe. */
export function CarteCadeau({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="A $60 gift card for a treatment at Institut Céladon, resting on a kraft envelope with a gold seal; the sender signs only in the note that comes with it."
      data-reveal="card"
      className={cn("gift-card photo @container", className)}
      style={{
        background:
          "radial-gradient(120% 95% at 28% 18%, #1f5a53 0%, #143f3b 48%, #0b2725 100%)",
      }}
    >
      {/* L'enveloppe, en papier kraft */}
      <div
        aria-hidden="true"
        data-envelope
        className="absolute top-[17%] left-[44%] aspect-[1.55] w-[50%] rotate-[7deg]"
        style={{
          background: "linear-gradient(160deg, #d9bf94, #c7a674)",
          boxShadow: "0 2cqw 4cqw -1cqw rgb(0 0 0 / 0.55)",
        }}
      >
        <span
          className="absolute inset-x-0 top-0 h-[58%]"
          style={{
            background: "linear-gradient(180deg, #cdb083, #bf9d6a)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
        <span
          className="absolute top-[47%] left-1/2 grid size-[6.4cqw] -translate-x-1/2 place-items-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, #f0cf86, #c8962a 60%, #9b7120)",
            boxShadow: "0 0.3cqw 0.6cqw rgb(0 0 0 / 0.35)",
          }}
        >
          <Mark tone="cream" className="h-[3.6cqw] opacity-90" />
        </span>
      </div>

      {/* La carte : elle sort de l'enveloppe à l'arrivée, se soulève au survol */}
      <div
        aria-hidden="true"
        data-card
        className="absolute top-[14%] left-[7%] flex aspect-[1.6] w-[52%] -rotate-[4deg] flex-col bg-cream p-[2.4cqw]"
        style={{
          boxShadow:
            "0 2.6cqw 4.5cqw -1.2cqw rgb(0 0 0 / 0.6), 0 0.2cqw 0.4cqw rgb(0 0 0 / 0.25)",
        }}
      >
        <div className="flex h-full flex-col border border-gold/70 p-[0.5cqw]">
          <div className="flex h-full flex-col border border-gold/35 px-[2.2cqw] py-[1.8cqw]">
            <div className="flex items-start justify-between">
              <span className="font-sans text-[1.15cqw] font-medium tracking-[0.24em] text-gold-ink uppercase">
                Gift card
              </span>
              <Mark className="h-[2.8cqw]" />
            </div>
            <p className="mt-auto font-heading text-[4.3cqw] leading-[0.95] tracking-[-0.01em] text-ink">
              Institut Céladon
            </p>
            <p className="mt-[0.8cqw] font-heading text-[1.8cqw] leading-none text-ink-soft italic">
              One treatment, whenever suits you
            </p>
            <div className="mt-auto flex items-end justify-between border-t border-gold/50 pt-[1.1cqw]">
              <span className="font-sans text-[1.1cqw] leading-[1.35] text-ink-soft">
                Signed
                <span className="block font-heading text-[1.7cqw] text-ink italic">
                  in the note
                </span>
              </span>
              <span className="font-heading text-[4.4cqw] leading-none text-ink tabular-nums">
                $60
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
