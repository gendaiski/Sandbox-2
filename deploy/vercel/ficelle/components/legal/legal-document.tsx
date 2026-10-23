/**
 * Un document légal : une feuille perforée rangée dans le classeur, avec son
 * tampon dateur.
 */
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
    <article className="paper relative rounded-[2px] px-5 pt-10 pb-14 sm:px-12 sm:pl-20 lg:px-16 lg:pl-24">
      {/* Perforations du classeur */}
      <div aria-hidden="true" className="absolute inset-y-0 left-6 hidden flex-col justify-around py-24 sm:flex lg:left-8">
        {[0, 1, 2].map((hole) => (
          <span
            key={hole}
            className="size-5 rounded-full bg-kraft shadow-[inset_0_2px_3px_rgb(60_38_12/0.5)]"
          />
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-y-0 left-[3.75rem] hidden border-l border-[#e3b9a8] sm:block lg:left-[4.5rem]" />

      <header className="max-w-[44rem] border-b-[3px] border-ink pb-8">
        <h1 className="type-title text-[clamp(2.75rem,7vw,4.75rem)] leading-[0.95] text-ink">{title}</h1>
        <p className="mt-6 inline-flex -rotate-2 flex-col border-2 border-teal px-3 py-1.5 font-mono text-teal">
          <span className="text-[0.6875rem] tracking-[0.12em] uppercase">Last updated</span>
          <span className="text-[1rem] font-semibold tracking-[0.06em] uppercase">{updated}</span>
        </p>
      </header>
      <div className="legal-prose max-w-[44rem] [&>h2:first-child]:mt-10">{children}</div>
    </article>
  )
}
