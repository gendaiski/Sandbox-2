import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-40 w-full resize-none rounded-[2px] border-[1.5px] border-ink/55 bg-paper bg-[repeating-linear-gradient(180deg,transparent_0_calc(1.75rem-1px),rgb(26_121_113/0.18)_calc(1.75rem-1px)_1.75rem)] bg-[position:0_0.875rem] bg-local px-3.5 py-3.5 text-[1.0625rem] leading-[1.75rem] text-ink transition-[border-color,box-shadow] duration-150 ease-(--ease-out) outline-none placeholder:text-ink-soft/55 hover:border-ink focus-visible:border-teal focus-visible:shadow-[inset_0_-3px_0_var(--teal)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-teal/35 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[inset_0_-3px_0_var(--destructive)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
