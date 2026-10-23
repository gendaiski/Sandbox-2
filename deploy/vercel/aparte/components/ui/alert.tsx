import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/** Alert shadcn, restylé en encadré éditorial : un filet à gauche. */
const alertVariants = cva(
  "group/alert relative grid w-full gap-1 border-l-2 py-1 pl-4 text-left text-[0.9375rem] leading-relaxed has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "border-gold text-ink",
        destructive:
          "border-destructive text-destructive *:data-[slot=alert-description]:text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-medium group-has-[>svg]/alert:col-start-2", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-[0.9375rem] text-ink-soft group-has-[>svg]/alert:col-start-2 [&_a]:text-teal [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
