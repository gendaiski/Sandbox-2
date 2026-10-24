"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Mail01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { Stamp } from "@/components/colis/stamp"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { FaqCategory } from "@/lib/faq"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback)
  return () => window.removeEventListener("hashchange", callback)
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

const tilts = ["-rotate-[0.5deg]", "rotate-[0.4deg]", "-rotate-[0.25deg]", "rotate-[0.6deg]"]

/** L'enveloppe « write to us », en bas du fichier. */
function WriteToUs({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "kraft-pale relative overflow-hidden rounded-[3px] p-6 shadow-[0_14px_22px_-14px_rgb(60_38_12/0.6)]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(28deg,transparent_49.6%,rgb(124_90_48/0.2)_50%,transparent_50.4%),linear-gradient(-28deg,transparent_49.6%,rgb(124_90_48/0.2)_50%,transparent_50.4%)]"
      />
      <div aria-hidden="true" className="postage absolute top-4 right-4 w-14 rotate-[4deg] bg-paper">
        <div className="grid aspect-[4/5] place-items-center bg-teal text-white">
          <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.8} className="size-6" />
        </div>
      </div>
      <p className="type-heading relative max-w-[12ch] text-[1.75rem]">Still not sure?</p>
      <p className="relative mt-3 text-[1rem] leading-[1.5] text-ink-soft">
        Just send an email: the founder reads every message herself.
      </p>
      <a
        href={"mailto:" + site.email}
        className="relative mt-5 inline-block bg-paper px-2.5 py-1 font-mono text-[0.9375rem] font-medium text-ink underline decoration-2 underline-offset-4 hover:decoration-teal"
      >
        {site.email}
      </a>
    </div>
  )
}

export function FaqBrowser({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = React.useState("")
  // null : l'utilisateur n'a encore rien ouvert, on suit le lien direct.
  const [open, setOpen] = React.useState<string[] | null>(null)
  const hash = React.useSyncExternalStore(
    subscribeToHash,
    () => decodeURIComponent(window.location.hash.slice(1)),
    () => ""
  )
  const [activeCategory, setActiveCategory] = React.useState(categories[0]?.id)
  const deferredQuery = React.useDeferredValue(query)
  const terms = normalize(deferredQuery).split(/\s+/).filter(Boolean)

  const results = categories
    .map((category) => ({
      ...category,
      items: terms.length
        ? category.items.filter((item) => {
            const haystack = normalize(`${item.question} ${item.answer.join(" ")}`)
            return terms.every((term) => haystack.includes(term))
          })
        : category.items,
    }))
    .filter((category) => category.items.length > 0)

  const count = results.reduce((total, category) => total + category.items.length, 0)

  // Ouvre la question visée par un lien direct (/faq#service-area).
  const linked = categories.some((category) =>
    category.items.some((item) => item.id === hash)
  )
  const expanded = open ?? (linked ? [hash] : [])

  // Met en avant la rubrique en cours de lecture dans le sommaire.
  React.useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(category.id))
      .filter((node): node is HTMLElement => node !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveCategory(visible.target.id)
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [categories, deferredQuery])

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
      {/* Sommaire : les intercalaires du fichier */}
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <nav aria-label="FAQ sections" className="hidden lg:block">
          <ul className="flex flex-col gap-1.5">
            {categories.map((category) => {
              const visible = results.some((result) => result.id === category.id)
              const found = results.find((result) => result.id === category.id)?.items.length ?? 0
              return (
                <li key={category.id}>
                  <a
                    href={"#" + category.id}
                    aria-current={activeCategory === category.id ? "true" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-r-[10px] border-l-[5px] border-transparent bg-kraft-pale/70 py-2.5 pr-3 pl-3.5 text-[1rem] font-semibold text-ink transition-[background-color,translate] duration-150 hover:translate-x-1 hover:bg-kraft-pale",
                      "aria-[current=true]:translate-x-2 aria-[current=true]:border-teal aria-[current=true]:bg-paper aria-[current=true]:shadow-[0_6px_12px_-8px_rgb(60_38_12/0.6)]",
                      !visible && "pointer-events-none opacity-45"
                    )}
                  >
                    {category.title}
                    <span className="font-mono text-[0.75rem] font-medium text-ink-soft">{found}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <WriteToUs className="mt-10 hidden lg:block" />
      </aside>

      <div className="min-w-0">
        <div className="max-w-[40rem]">
          <label htmlFor="faq-search" className="type-field text-[0.75rem] text-ink">
            Search the cards
          </label>
          <InputGroup className="mt-2 h-14 border-2 border-ink bg-paper">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.8} className="size-5 text-ink" />
            </InputGroupAddon>
            <InputGroupInput
              id="faq-search"
              type="search"
              placeholder="Price, drop-off, pickup code…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              className="text-[1.125rem] [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-sm" aria-label="Clear search" onClick={() => setQuery("")}>
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
          <p aria-live="polite" className="mt-3 min-h-6 font-mono text-[0.8125rem] text-ink">
            {terms.length
              ? count
                ? count + (count > 1 ? " cards found" : " card found")
                : ""
              : null}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="relative mt-8 max-w-[40rem] overflow-hidden bg-cream px-7 pt-9 pb-10 shadow-[0_14px_22px_-14px_rgb(60_38_12/0.6)] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-teal">
            <p className="type-heading text-[1.75rem]">
              No card for “{deferredQuery.trim()}”
            </p>
            <p className="mt-3 max-w-[40ch] text-[1.0625rem] leading-[1.55] text-ink-soft">
              Try another word, or send us your question as is at{" "}
              <a
                href={"mailto:" + site.email}
                className="font-semibold text-ink underline decoration-2 underline-offset-4 hover:decoration-teal"
              >
                {site.email}
              </a>
              .
            </p>
            <Stamp r={-8} className="absolute top-5 right-5 hidden text-[1.4rem] sm:block">
              Not found
            </Stamp>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-16">
            {results.map((category) => (
              <section
                key={category.id}
                id={category.id}
                aria-labelledby={`${category.id}-title`}
                className="scroll-mt-8"
              >
                {/* Intercalaire de rubrique, avec son onglet */}
                <div className="relative mb-6">
                  <h2
                    id={`${category.id}-title`}
                    className="type-heading kraft-pale relative inline-block rounded-t-[10px] px-5 pt-3 pb-2 text-[1.75rem] text-ink sm:text-[2rem]"
                  >
                    {category.title}
                  </h2>
                  <div aria-hidden="true" className="kraft-pale h-3 rounded-r-[4px] shadow-[0_6px_10px_-8px_rgb(60_38_12/0.7)]" />
                </div>
                <Accordion
                  multiple
                  hiddenUntilFound
                  value={terms.length ? category.items.map((item) => item.id) : expanded}
                  onValueChange={(value) => {
                    if (!terms.length) setOpen(value as string[])
                  }}
                >
                  {category.items.map((item, i) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      id={item.id}
                      className={cn("scroll-mt-8", tilts[i % tilts.length], i > 0 && "-mt-1.5")}
                    >
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>
                        {item.answer.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        )}

        <WriteToUs className="mt-16 lg:hidden" />
      </div>
    </div>
  )
}
