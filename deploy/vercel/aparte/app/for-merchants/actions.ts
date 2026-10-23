"use server"

import {
  firstErrors,
  partnerRequestSchema,
  photoRules,
  type PartnerFormState,
} from "@/lib/partner-request"

/**
 * Traite un bulletin de candidature envoyé par un commerçant.
 *
 * Avec la variable PARTNER_WEBHOOK_URL, le bulletin (champs et image
 * éventuelle) part en multipart/form-data vers l'adresse indiquée : un outil
 * d'automatisation ou une fonction serveur qui alerte la fondatrice. Sans
 * elle, il est simplement écrit dans les journaux du serveur.
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
      message: "A few answers need another look.",
      fieldErrors: firstErrors(parsed.error),
    }
  }

  const photo = formData.get("photo")
  const hasPhoto = photo instanceof File && photo.size > 0
  if (hasPhoto) {
    if (!photoRules.types.includes(photo.type)) {
      return {
        status: "error",
        message: "A few answers need another look.",
        fieldErrors: {
          photo: "Only JPG, PNG or WebP files work here.",
        },
      }
    }
    if (photo.size > photoRules.maxBytes) {
      return {
        status: "error",
        message: "A few answers need another look.",
        fieldErrors: { photo: "That image is larger than 5 MB." },
      }
    }
  }

  const webhook = process.env.PARTNER_WEBHOOK_URL
  if (!webhook) {
    console.info("[for-merchants] Application received", {
      ...parsed.data,
      photo: hasPhoto
        ? photo.name + ", " + Math.round(photo.size / 1024) + " KB"
        : null,
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
    console.error("[for-merchants] Delivery failed", error)
    return {
      status: "error",
      message:
        "Your application got lost on the way. Try again in a moment, or email us at contact@aparte.example.",
    }
  }

  return { status: "success" }
}
