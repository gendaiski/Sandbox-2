import { site } from "@/lib/site"

/** L'adresse de contact, qui peut passer à la ligne après l'arobase. */
export function Email() {
  const [local, domain] = site.email.split("@")
  return (
    <>
      {local}@<wbr />
      {domain}
    </>
  )
}
