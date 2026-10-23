import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-cream/20 bg-night/60 px-4 text-base text-cream transition-[border-color,box-shadow,background-color] duration-150 ease-(--ease-out) outline-none placeholder:text-cream/45 hover:border-cream/35 focus-visible:border-teal-glow focus-visible:bg-night/80 focus-visible:shadow-[0_0_0_4px_rgb(26_121_113/0.35)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
