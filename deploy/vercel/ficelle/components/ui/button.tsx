import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/*
 * Boutons « coupon » : angles presque vifs, pointillé intérieur comme une
 * vignette à découper, ombre basse franche. À l'appui, le bouton s'enfonce.
 */
const buttonStyles = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-[3px] border border-transparent font-semibold whitespace-nowrap [font-stretch:92%] transition-[background-color,box-shadow,translate,color] duration-100 ease-(--ease-out) outline-none select-none focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-3 focus-visible:outline-ink active:not-aria-[haspopup]:translate-y-[2px] active:not-aria-[haspopup]:shadow-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.15em]",
  {
    variants: {
      variant: {
        default:
          "bg-teal text-white shadow-[0_3px_0_var(--teal-deep)] before:pointer-events-none before:absolute before:inset-[4px] before:rounded-[2px] before:border before:border-dashed before:border-white/45 hover:bg-[#166a63]",
        paper:
          "border-ink/80 bg-paper text-ink shadow-[0_3px_0_rgb(15_35_36/0.75)] hover:bg-cream",
        ink: "bg-ink text-cream shadow-[0_3px_0_#000] hover:bg-teal-deep",
        ghost: "text-ink hover:bg-ink/8",
        link: "h-auto px-0 text-ink underline decoration-2 underline-offset-4 shadow-none hover:decoration-teal",
      },
      size: {
        default: "h-11 gap-2 px-5 text-[0.9375rem]",
        sm: "h-9 gap-1.5 px-3.5 text-sm",
        lg: "h-[3.25rem] gap-2.5 px-6 text-[1.0625rem]",
        xs: "h-7 gap-1 px-2.5 text-xs",
        icon: "size-11",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/** Classes du bouton, fusionnées (les classes passées l'emportent). */
function buttonVariants({
  className,
  ...variants
}: VariantProps<typeof buttonStyles> & { className?: string } = {}) {
  return cn(buttonStyles(variants), className)
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonStyles>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={(state) =>
        buttonVariants({
          variant,
          size,
          className: typeof className === "function" ? className(state) : className,
        })
      }
      {...props}
    />
  )
}

export { Button, buttonVariants }
