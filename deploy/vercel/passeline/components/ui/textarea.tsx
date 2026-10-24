import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-36 w-full resize-none rounded-[0.8rem] border-2 border-ink/22 bg-paper px-4 py-3.5 text-base leading-relaxed text-ink shadow-[0_3px_0_rgb(15_35_36/0.07)] transition-[border-color,box-shadow] duration-150 ease-(--ease-out) outline-none placeholder:text-ink-soft/65 hover:border-ink/40 focus-visible:border-teal-deep focus-visible:ring-4 focus-visible:ring-gold-light/70 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
