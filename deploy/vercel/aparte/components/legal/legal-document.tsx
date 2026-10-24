/** Un document légal, mis en page comme une belle page de lecture. */
export function LegalDocument({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <article className="max-w-[44rem]">
      <header className="border-b border-gold/70 pb-8">
        <h1 className="display text-[2.75rem] text-balance sm:text-[3.75rem] lg:text-[4.5rem]">
          {title}
        </h1>
        <p className="mt-5 text-[0.9375rem] text-ink-soft italic">
          Last updated: {updated}
        </p>
      </header>
      <div className="prose-legal">{children}</div>
    </article>
  )
}
