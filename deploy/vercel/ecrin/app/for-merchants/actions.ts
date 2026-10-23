"use server"

import {
  firstErrors,
  partnerRequestSchema,
  photoRules,
  type PartnerFormState,
} from "@/lib/partner-request"

/**
 * Receives a merchant application.
 *
 * When PARTNER_WEBHOOK_URL is set, the application (fields + optional photo)
 * is forwarded there as multipart/form-data, for example to an automation
 * tool or a serverless function that alerts the founder. Otherwise it is
 * only logged on the server.
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
      message: "A few fields need a second look.",
      fieldErrors: firstErrors(parsed.error),
    }
  }

  const photo = formData.get("photo")
  const hasPhoto = photo instanceof File && photo.size > 0
  if (hasPhoto) {
    if (!photoRules.types.includes(photo.type)) {
      return {
        status: "error",
        message: "A few fields need a second look.",
        fieldErrors: {
          photo: "Use a JPG, PNG, or WebP image.",
        },
      }
    }
    if (photo.size > photoRules.maxBytes) {
      return {
        status: "error",
        message: "A few fields need a second look.",
        fieldErrors: { photo: "That photo is too large: 5 MB max." },
      }
    }
  }

  const webhook = process.env.PARTNER_WEBHOOK_URL
  if (!webhook) {
    console.info("[merchants] application received", {
      ...parsed.data,
      photo: hasPhoto ? { file: photo.name, bytes: photo.size } : null,
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
    console.error("[merchants] forwarding failed", error)
    return {
      status: "error",
      message:
        "Your application didn’t go through. Try again in a minute, or email contact@ecrin.example directly.",
    }
  }

  return { status: "success" }
}
