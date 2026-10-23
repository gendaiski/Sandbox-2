"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "cn"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-3", className)}
      {...props}
    />
  )
}

/*
 * Le bouton radio est l'œillet d'une étiquette-bagage : un trou cerclé de
 * métal or, qui se remplit d'encre teal quand l'envoi est choisi.
 */
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-7 shrink-0 rounded-full border-[3px] border-gold bg-kraft shadow-[inset_0_2px_3px_rgb(60_38_12/0.45),0_0_0_1px_var(--gold-edge)] transition-colors duration-150 outline-none after:absolute after:-inset-3 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-3 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-gold-light data-checked:bg-teal",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="size-3.5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
