import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-full border bg-clip-padding font-medium tracking-[-0.005em] whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-(--ease-out) outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-gold-light focus-visible:outline-solid active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.15em]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gold text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_14px_34px_-14px_rgb(227_190_107/0.75)] hover:bg-gold-light",
        outline:
          "border-cream/28 text-cream hover:border-cream/55 hover:bg-cream/6",
        secondary:
          "border-transparent bg-teal text-cream shadow-[inset_0_1px_0_rgb(255_255_255/0.16)] hover:bg-[#1f8a81]",
        ghost: "border-transparent text-cream hover:bg-cream/8",
        link: "h-auto! rounded-sm border-transparent px-0! text-gold-light underline decoration-gold-light/40 underline-offset-[5px] hover:decoration-gold-light",
      },
      size: {
        default:
          "h-11 gap-2 px-5 text-[0.9375rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        sm: "h-9 gap-1.5 px-4 text-sm",
        lg: "h-13 gap-2.5 px-5.5 text-base has-data-[icon=inline-end]:pr-4.5 has-data-[icon=inline-start]:pl-4.5",
        xs: "h-7 gap-1 px-2.5 text-xs",
        icon: "size-10",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
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
