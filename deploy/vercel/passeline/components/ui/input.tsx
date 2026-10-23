import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-[0.8rem] border-2 border-ink/22 bg-paper px-4 text-base text-ink shadow-[0_3px_0_rgb(15_35_36/0.07)] transition-[border-color,box-shadow] duration-150 ease-(--ease-out) outline-none file:mr-3 file:inline-flex file:h-8 file:rounded-md file:border-0 file:bg-tuffeau file:px-3 file:text-sm file:font-semibold file:text-ink placeholder:text-ink-soft/65 hover:border-ink/40 focus-visible:border-teal-deep focus-visible:ring-4 focus-visible:ring-gold-light/70 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
