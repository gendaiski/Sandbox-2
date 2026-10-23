const NBSP = " "

/**
 * Typographie américaine pour les textes venus des données (FAQ…) :
 * apostrophes et guillemets courbes, espace insécable entre un nombre et
 * son unité (20 mi, 7 days).
 */
export function typo(text: string) {
  return text
    .replace(/'/g, "’")
    .replace(/(^|[\s(])"/g, "$1“")
    .replace(/"/g, "”")
    .replace(/(\d) (mi|miles|days|%)\b/g, `$1${NBSP}$2`)
}
