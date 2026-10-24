import * as React from "react"
import { cn } from "cn"

/**
 * Textarea shadcn restylé en papier ligné : les lignes suivent l'interligne
 * du texte (1,75rem).
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[10.5rem] w-full resize-none rounded-none border-0 border-b border-ink/35 bg-[linear-gradient(transparent_calc(1.75rem-1px),color-mix(in_oklab,var(--ink)_12%,transparent)_calc(1.75rem-1px))] bg-[length:100%_1.75rem] bg-local px-0.5 pt-0 pb-0 text-[1.0625rem] leading-[1.75rem] text-ink transition-[border-color,box-shadow,background-color] duration-150 outline-none placeholder:text-ink-soft/65 hover:border-ink/70 focus-visible:border-teal focus-visible:shadow-[inset_0_-1px_0_var(--teal)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
