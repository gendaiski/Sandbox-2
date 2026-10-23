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

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-5 shrink-0 rounded-full border border-cream/40 bg-transparent transition-[border-color,background-color] duration-150 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-gold-light disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-gold-light data-checked:bg-gold-light",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
