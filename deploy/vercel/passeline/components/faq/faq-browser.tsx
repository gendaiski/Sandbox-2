"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { Bow } from "@/components/brand/logo"
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
import { Email } from "@/components/site/email"
import { site } from "@/lib/site"
import { typo } from "@/lib/typo"
import { cn } from "@/lib/utils"

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback)
  return () => window.removeEventListener("hashchange", callback)
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

export function FaqBrowser({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = React.useState("")
  // null tant que rien n'a été déplié à la main : l'ancre de l'URL décide.
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
            const haystack = normalize(
              `${item.question} ${item.answer.join(" ")}`
            )
            return terms.every((term) => haystack.includes(term))
          })
        : category.items,
    }))
    .filter((category) => category.items.length > 0)

  const count = results.reduce(
    (total, category) => total + category.items.length,
    0
  )

  // Une ancre comme /faq#delai déplie la question correspondante.
  const linked = categories.some((category) =>
    category.items.some((item) => item.id === hash)
  )
  const expanded = open ?? (linked ? [hash] : [])

  // Le sommaire suit la rubrique visible à l'écran.
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
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20">
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <nav aria-label="FAQ topics" className="hidden lg:block">
          <p className="t-strong mb-4 text-ink">Topics</p>
          <ul className="relative flex flex-col gap-1 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:border-l-[4px] before:border-dotted before:border-gold">
            {categories.map((category) => {
              const visible = results.some(
                (result) => result.id === category.id
              )
              return (
                <li key={category.id}>
                  <a
                    href={`#${category.id}`}
                    aria-current={
                      activeCategory === category.id ? "true" : undefined
                    }
                    className={cn(
                      "group relative flex items-center gap-3 rounded-md py-1.5 pr-2 text-[0.98rem] text-ink-soft transition-colors duration-150 hover:text-ink",
                      "aria-[current=true]:font-[650] aria-[current=true]:text-ink",
                      !visible && "pointer-events-none opacity-40"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="relative z-[1] size-[18px] shrink-0 rounded-full border-[3px] border-tuffeau bg-paper transition-colors duration-200 group-aria-[current=true]:border-gold group-aria-[current=true]:bg-gold-light"
                    />
                    {category.title}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <ContactCard className="mt-10 hidden lg:block" />
      </aside>

      <div className="min-w-0">
        <div className="max-w-xl">
          <label htmlFor="faq-search" className="sr-only">
            Search the answers
          </label>
          <InputGroup className="h-14">
            <InputGroupAddon>
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={1.8}
                className="size-5 text-teal-deep"
              />
            </InputGroupAddon>
            <InputGroupInput
              id="faq-search"
              type="search"
              placeholder="Search: price, neighbor, pickup…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              className="text-base [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-sm"
                  aria-label="Clear the search"
                  onClick={() => setQuery("")}
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
          <p
            aria-live="polite"
            className="mt-3 min-h-6 text-[0.92rem] text-ink-soft"
          >
            {terms.length
              ? count
                ? `${count} ${count > 1 ? "answers match" : "answer matches"}`
                : ""
              : null}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border-2 border-dashed border-gold bg-paper px-7 py-10 md:px-10">
            <p className="t-h3 text-[1.6rem] text-ink">
              Nothing for “{deferredQuery.trim()}”
            </p>
            <p className="mt-3 max-w-md text-ink-soft">
              Try another word, or send your question to{" "}
              <a
                href={`mailto:${site.email}`}
                className="link-under font-[650] text-teal"
              >
                <Email />
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-16">
            {results.map((category) => (
              <section
                key={category.id}
                id={category.id}
                aria-labelledby={`${category.id}-title`}
                className="scroll-mt-6"
              >
                <h2
                  id={`${category.id}-title`}
                  className="t-h3 mb-4 text-[1.8rem] text-ink"
                >
                  {category.title}
                </h2>
                <Accordion
                  className="acc-light"
                  multiple
                  hiddenUntilFound
                  value={
                    terms.length
                      ? category.items.map((item) => item.id)
                      : expanded
                  }
                  onValueChange={(value) => {
                    if (!terms.length) setOpen(value as string[])
                  }}
                >
                  {category.items.map((item) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      id={item.id}
                      className="scroll-mt-6"
                    >
                      <AccordionTrigger>{typo(item.question)}</AccordionTrigger>
                      <AccordionContent>
                        {item.answer.map((paragraph) => (
                          <p key={paragraph}>{typo(paragraph)}</p>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        )}

        <ContactCard className="mt-16 lg:hidden" />
      </div>
    </div>
  )
}

/** L'étiquette de contact, nouée d'or, en bas du sommaire. */
function ContactCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-[1.5rem] bg-teal-deep p-6 text-cream shadow-[0_6px_0_#0a2523] [--focus:var(--color-gold-light)]",
        className
      )}
    >
      <Bow className="absolute -top-4 left-6 w-12" />
      <p className="t-h3 mt-2 text-[1.4rem]">Still wondering?</p>
      <p className="mt-3 text-[0.95rem] text-cream/80">
        Hugo reads every message and writes back himself.
      </p>
      <a
        href={`mailto:${site.email}`}
        className="link-under mt-5 inline-block text-[0.95rem] font-[650] text-gold-light"
      >
        <Email />
      </a>
    </div>
  )
}
