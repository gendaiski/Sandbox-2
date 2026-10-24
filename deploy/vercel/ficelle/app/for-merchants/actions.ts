"use server"

import {
  firstErrors,
  partnerRequestSchema,
  photoRules,
  type PartnerFormState,
} from "@/lib/partner-request"

/**
 * Handles a merchant sign-up slip.
 *
 * When the PARTNER_WEBHOOK_URL environment variable is set, the slip (fields
 * and optional photo) is posted there as multipart/form-data, so an
 * automation tool can ping the founder. Without it, the slip is only written
 * to the server logs.
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
      message: "A few fields need another look.",
      fieldErrors: firstErrors(parsed.error),
    }
  }

  const photo = formData.get("photo")
  const hasPhoto = photo instanceof File && photo.size > 0
  if (hasPhoto) {
    if (!photoRules.types.includes(photo.type)) {
      return {
        status: "error",
        message: "A few fields need another look.",
        fieldErrors: {
          photo: "We only take JPG, PNG or WebP images.",
        },
      }
    }
    if (photo.size > photoRules.maxBytes) {
      return {
        status: "error",
        message: "A few fields need another look.",
        fieldErrors: { photo: "That image is too large: 5 MB max." },
      }
    }
  }

  const webhook = process.env.PARTNER_WEBHOOK_URL
  if (!webhook) {
    console.info("[ficelle-pro] sign-up received", {
      ...parsed.data,
      photo: hasPhoto ? { name: photo.name, bytes: photo.size } : null,
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
    if (!response.ok) throw new Error("HTTP " + response.status)
  } catch (error) {
    console.error("[ficelle-pro] webhook delivery failed", error)
    return {
      status: "error",
      message:
        "Your slip got lost on the way. Try again in a moment, or email contact@ficelle.example directly.",
    }
  }

  return { status: "success" }
}
