import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

/**
 * Input shadcn (Base UI), restylé « bulletin » : un champ souligné d'un
 * filet, qui passe au teal à la saisie.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-none border-0 border-b border-ink/35 bg-transparent px-0.5 text-[1.0625rem] text-ink transition-[border-color,box-shadow,background-color] duration-150 outline-none placeholder:text-ink-soft/65 hover:border-ink/70 focus-visible:border-teal focus-visible:bg-teal/[0.035] focus-visible:shadow-[inset_0_-1px_0_var(--teal)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-[inset_0_-1px_0_var(--destructive)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
