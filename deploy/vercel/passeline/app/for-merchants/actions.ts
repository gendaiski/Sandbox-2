"use server"

import {
  firstErrors,
  partnerRequestSchema,
  photoErrors,
  photoRules,
  type PartnerFormState,
} from "@/lib/partner-request"
import { site } from "@/lib/site"

const FIX_FIELDS = "A few fields need another look."

/**
 * Traite une candidature de boutique.
 *
 * Avec la variable d'environnement PARTNER_WEBHOOK_URL, la candidature
 * (champs et photo éventuelle) part en multipart/form-data vers l'outil
 * d'automatisation de votre choix. Sans elle, on l'écrit dans les journaux
 * du serveur.
 */
export async function submitPartnerRequest(
  _previous: PartnerFormState,
  formData: FormData
): Promise<PartnerFormState> {
  const fields = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === "string")
  )
  const parsed = partnerRequestSchema.safeParse(fields)
  if (!parsed.success) {
    return {
      status: "error",
      message: FIX_FIELDS,
      fieldErrors: firstErrors(parsed.error),
    }
  }

  const photo = formData.get("photo")
  const hasPhoto = photo instanceof File && photo.size > 0
  if (hasPhoto) {
    if (!photoRules.types.includes(photo.type)) {
      return {
        status: "error",
        message: FIX_FIELDS,
        fieldErrors: { photo: photoErrors.type },
      }
    }
    if (photo.size > photoRules.maxBytes) {
      return {
        status: "error",
        message: FIX_FIELDS,
        fieldErrors: { photo: photoErrors.size },
      }
    }
  }

  const webhook = process.env.PARTNER_WEBHOOK_URL
  if (!webhook) {
    console.info("[for-merchants] Application received", {
      ...parsed.data,
      photo: hasPhoto ? `${photo.name} (${photo.size} bytes)` : null,
    })
    return { status: "success" }
  }

  const body = new FormData()
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) body.append(key, String(value))
  }
  body.append("submittedAt", new Date().toISOString())
  if (hasPhoto) body.append("photo", photo, photo.name)

  try {
    const response = await fetch(webhook, { method: "POST", body })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (error) {
    console.error("[for-merchants] Webhook failed", error)
    return {
      status: "error",
      message: `Your application didn’t go through. Give it a moment and try again, or write to ${site.email}.`,
    }
  }

  return { status: "success" }
}
