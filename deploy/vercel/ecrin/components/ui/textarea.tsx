import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-36 w-full resize-none rounded-xl border border-cream/20 bg-night/60 px-4 py-3.5 text-base leading-relaxed text-cream transition-[border-color,box-shadow] duration-150 ease-(--ease-out) outline-none placeholder:text-cream/45 hover:border-cream/35 focus-visible:border-teal-glow focus-visible:shadow-[0_0_0_4px_rgb(26_121_113/0.35)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
