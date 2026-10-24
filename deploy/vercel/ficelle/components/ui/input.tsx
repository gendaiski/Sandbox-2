import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-[2px] border-[1.5px] border-ink/55 bg-paper px-3.5 text-[1.0625rem] text-ink transition-[border-color,box-shadow,background-color] duration-150 ease-(--ease-out) outline-none file:mr-3 file:inline-flex file:h-8 file:rounded-[2px] file:border-0 file:bg-kraft-pale file:px-3 file:text-sm file:font-semibold file:text-ink placeholder:text-ink-soft/55 hover:border-ink focus-visible:border-teal focus-visible:shadow-[inset_0_-3px_0_var(--teal)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-teal/35 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:bg-[#fdf3ef] aria-invalid:shadow-[inset_0_-3px_0_var(--destructive)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
