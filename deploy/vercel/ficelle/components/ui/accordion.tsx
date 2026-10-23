import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { cn } from "cn"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

/*
 * Chaque question est une fiche bristol : filet teal en tête, lignes
 * réglées à l'intérieur, fiches empilées légèrement de travers.
 */
function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "relative bg-cream text-ink shadow-[0_1px_0_rgb(90_62_26/0.25),0_10px_20px_-14px_rgb(60_38_12/0.6)] transition-[rotate] duration-200 ease-(--ease-out) before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-teal data-open:z-10 data-open:rotate-0",
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-center justify-between gap-5 px-5 pt-6 pb-5 text-left text-[1.375rem] leading-[1.05] font-extrabold [font-stretch:76%] text-ink outline-none focus-visible:outline-3 focus-visible:outline-solid focus-visible:-outline-offset-3 focus-visible:outline-ink aria-disabled:pointer-events-none aria-disabled:opacity-50 md:px-7 md:text-[1.625rem]",
          className
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-ink/80 text-ink transition-[background-color,color,rotate] duration-200 ease-(--ease-out) group-hover/accordion-trigger:bg-ink/8 group-aria-expanded/accordion-trigger:rotate-45 group-aria-expanded/accordion-trigger:border-teal group-aria-expanded/accordion-trigger:bg-teal group-aria-expanded/accordion-trigger:text-white"
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            strokeWidth={2.2}
            data-slot="accordion-trigger-icon"
            className="pointer-events-none size-4"
          />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-[1.0625rem] text-ink-soft data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) bg-[repeating-linear-gradient(180deg,transparent_0_calc(1.75rem-1px),rgb(26_121_113/0.2)_calc(1.75rem-1px)_1.75rem)] px-5 pt-0 pb-7 leading-[1.75rem] data-ending-style:h-0 data-starting-style:h-0 md:px-7 [&_p]:max-w-[62ch] [&_p:not(:last-child)]:mb-[1.75rem]",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
