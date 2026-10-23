import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Bouton shadcn (Base UI) restylé « magazine » : pastille fine, Hanken
 * Grotesk en petit, teal pour l'action principale.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border font-sans text-[0.875rem] font-medium tracking-[0.005em] whitespace-nowrap transition-[background-color,border-color,color] duration-200 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal focus-visible:outline-solid active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.05rem]",
  {
    variants: {
      variant: {
        default: "border-teal bg-teal text-white hover:border-teal-hover hover:bg-teal-hover",
        outline:
          "border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper",
        cream:
          "border-cream bg-cream text-teal-deep hover:border-gold-light hover:bg-gold-light focus-visible:outline-gold-light",
        ghost: "border-transparent text-ink hover:bg-paper-deep",
        link: "h-auto rounded-none border-transparent px-0 text-teal underline decoration-teal/45 decoration-1 underline-offset-[0.3em] hover:text-teal-hover hover:decoration-gold",
      },
      size: {
        default:
          "h-11 gap-2 px-5 has-data-[icon=inline-start]:pl-4 has-data-[icon=inline-end]:pr-4",
        sm: "h-9 gap-1.5 px-4 text-[0.8125rem] has-data-[icon=inline-start]:pl-3.5",
        lg: "h-12 gap-2.5 px-6 text-[0.9375rem] has-data-[icon=inline-start]:pl-5",
        icon: "size-10",
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
