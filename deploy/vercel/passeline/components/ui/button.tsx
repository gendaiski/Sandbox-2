import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Boutons « découpés » comme les aplats des illustrations : forme pleine,
 * bord inférieur plus sombre qui s'enfonce au clic.
 */
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full border-0 font-[650] whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-150 ease-(--ease-out) select-none [font-variation-settings:'opsz'_18,'wdth'_96] active:translate-y-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-teal-deep text-cream shadow-[0_4px_0_#0a2523] hover:bg-[#174d48] active:shadow-[0_1px_0_#0a2523]",
        light:
          "bg-cream text-ink shadow-[0_4px_0_rgb(15_35_36/0.22)] hover:bg-white active:shadow-[0_1px_0_rgb(15_35_36/0.22)]",
        gold: "bg-gold-light text-ink shadow-[0_4px_0_#a27c2e] hover:bg-[#ebc97c] active:shadow-[0_1px_0_#a27c2e]",
        outline:
          "bg-transparent text-current shadow-[inset_0_0_0_2px_currentColor] hover:bg-current/8 active:translate-y-0",
        ghost:
          "bg-transparent text-current shadow-none hover:bg-current/8 active:translate-y-0",
      },
      size: {
        default: "h-11 px-5 text-[0.98rem]",
        sm: "h-9 gap-2 px-4 text-[0.9rem] [&_svg:not([class*='size-'])]:size-4",
        lg: "h-14 px-7 text-[1.06rem]",
        xs: "h-7 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-11",
        "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-[1.125rem]",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
