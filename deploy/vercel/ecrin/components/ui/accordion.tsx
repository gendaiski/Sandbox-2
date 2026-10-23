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

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group/accordion-item relative border-b border-cream/12 first:border-t",
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
          "group/accordion-trigger flex flex-1 items-center justify-between gap-6 rounded-md py-6 text-left text-[1.0625rem] leading-snug font-medium text-cream transition-colors duration-200 outline-none hover:text-gold-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light focus-visible:outline-solid aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-expanded:text-gold-light md:text-[1.1875rem]",
          className
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-cream/22 text-cream transition-[transform,border-color,background-color,color] duration-300 ease-(--ease-out) group-hover/accordion-trigger:border-gold-light/60 group-aria-expanded/accordion-trigger:rotate-45 group-aria-expanded/accordion-trigger:border-gold/0 group-aria-expanded/accordion-trigger:bg-gold group-aria-expanded/accordion-trigger:text-ink motion-reduce:transition-none"
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            strokeWidth={1.8}
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
      className="h-(--accordion-panel-height) overflow-hidden text-[1rem] text-cream/78 transition-[height] duration-300 ease-(--ease-out) data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div
        className={cn(
          "max-w-[62ch] pr-14 pb-7 leading-relaxed [&_a]:font-medium [&_a]:text-gold-light [&_a]:underline [&_a]:underline-offset-4 [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
