import type { CSSProperties, ReactNode } from "react"

import { MarkGlint } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

const sides = [0, 90, 180, -90]

function angle(n: number) {
  return { "--n": `${n}deg` } as CSSProperties
}

/**
 * La boîte cadeau Écrin en CSS 3D : papier teal, ruban or qui croise les
 * faces, l'éclat du symbole dressé en volume sur le couvercle. Pilotée par
 * des variables CSS : --w (taille), --yaw, --pitch, --open.
 *
 * La boîte est dessinée en quatre calques superposés, chacun avec la même
 * perspective : le fond (intérieur, sol), le couvercle, les cartes (enfants),
 * puis les parois avant. Les cartes passent ainsi entre l'intérieur et les
 * parois sans jamais partager un même espace 3D avec la boîte, ce qui évite
 * les erreurs de tri de profondeur des navigateurs.
 */
export function GiftBox({
  className,
  style,
  children,
}: {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <div className={cn("gbox-stack", className)} style={style} aria-hidden="true">
      {/* Fond : ombre portée, sol doré, parois vues de l'intérieur */}
      <div className="gbox gbox--back">
        <div className="gbox__tilt">
          <div className="gbox__f gbox__shadow" />
          <div className="gbox__f gbox__spill" />
          <div className="gbox__spin">
            <div className="gbox__f gbox__floor" />
            {sides.map((n) => (
              <div key={n} className="gbox__f gbox__inner" style={angle(n)} />
            ))}
          </div>
        </div>
      </div>

      {/* Couvercle et éclat */}
      <div className="gbox gbox--lid">
        <div className="gbox__tilt">
          <div className="gbox__lid">
            <div className="gbox__lidspin">
              <div className="gbox__f gbox__lidtop" />
              {sides.map((n) => (
                <div key={n} className="gbox__f gbox__skirt" style={angle(n)} />
              ))}
              <div className="gbox__eclat">
                {[0, 90].map((r) => (
                  <div
                    key={r}
                    className="gbox__eclatplane"
                    style={{ "--r": `${r}deg` } as CSSProperties}
                  >
                    <MarkGlint className="w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ce qui sort de la boîte */}
      {children && (
        <div className="gbox gbox--cards">
          <div className="gbox__tilt">{children}</div>
        </div>
      )}

      {/* Parois extérieures */}
      <div className="gbox gbox--front">
        <div className="gbox__tilt">
          <div className="gbox__spin">
            {sides.map((n) => (
              <div key={n} className="gbox__f gbox__side" style={angle(n)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
