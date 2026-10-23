"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

/** Checkbox shadcn (Base UI), restylé : un carré fin, coché en teal. */
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-[1.125rem] shrink-0 items-center justify-center rounded-[0.125rem] border border-ink/55 bg-white transition-[background-color,border-color] duration-150 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-checked:border-teal data-checked:bg-teal data-checked:text-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
