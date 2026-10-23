import { z } from "zod"

export const categories = [
  { value: "flowers", label: "Flowers and plants" },
  { value: "sweets", label: "Chocolates and candy" },
  { value: "bakery", label: "Bakery and pastry" },
  { value: "beauty", label: "Beauty and skin care" },
  { value: "wellness", label: "Wellness" },
  { value: "food", label: "Restaurant or café" },
  { value: "jewelry", label: "Jewelry and watches" },
  { value: "fashion", label: "Fashion and leather goods" },
  { value: "books", label: "Books and stationery" },
  { value: "other", label: "Something else" },
] as const

export const wellnessTypes = [
  { value: "massage", label: "Massage" },
  { value: "relaxation", label: "Relaxation, meditation" },
  { value: "yoga", label: "Yoga, Pilates" },
  { value: "coaching", label: "Wellness coaching" },
  { value: "reflexology", label: "Reflexology" },
  { value: "acupuncture", label: "Acupuncture" },
  { value: "other", label: "Another practice" },
] as const

export const roles = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Store manager" },
  { value: "partner", label: "Business partner" },
  { value: "staff", label: "Team member" },
  { value: "other", label: "Another role" },
] as const

/** Les 50 États et le district de Columbia, pour le combobox. */
export const usStates = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
].map(([code, name]) => ({ code, name }))

export type UsState = (typeof usStates)[number]

const stateCodes = usStates.map((state) => state.code)

const required = (message: string) => z.string().trim().min(1, message)
const phone = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(
      (value) =>
        /^(?:\+?1[\s.-]?)?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(
          value
        ),
      "Enter a 10-digit US number, like (360) 555-0142."
    )
const email = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .pipe(z.email("That email address doesn’t look complete."))

export const partnerRequestSchema = z.object({
  shopName: required("Tell us your shop’s name."),
  category: z.enum(
    categories.map((c) => c.value) as [string, ...string[]],
    "Pick the kind of shop you run."
  ),
  wellnessType: z.string().optional(),
  address: required("Add your street address."),
  city: required("Add your city."),
  state: z
    .string()
    .refine((value) => stateCodes.includes(value), "Choose a state."),
  zip: z
    .string()
    .trim()
    .refine(
      (value) => /^\d{5}(?:-\d{4})?$/.test(value),
      "A ZIP code has 5 digits."
    ),
  ein: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{2}-?\d{7}$/.test(value),
      "An EIN has 9 digits, written like 12-3456789."
    )
    .optional(),
  shopPhone: phone("Add the shop’s phone number."),
  shopEmail: email("Add the shop’s email address."),
  firstName: required("Your first name, please."),
  lastName: required("Your last name, please."),
  phone: phone("A number where we can reach you, please."),
  email: email("An email address where we can write to you, please."),
  role: z.string().optional(),
  message: z
    .string()
    .trim()
    .max(2000, "Keep it under 2,000 characters.")
    .optional(),
  consent: z.literal("on", "Without your OK, we can’t call you back."),
})

export type PartnerRequest = z.infer<typeof partnerRequestSchema>
export type PartnerField = keyof PartnerRequest

/** Les champs de chaque étape du formulaire, dans l'ordre. */
export const partnerSteps: { title: string; fields: PartnerField[] }[] = [
  { title: "Your shop", fields: ["shopName", "category", "wellnessType"] },
  { title: "Location", fields: ["address", "city", "state", "zip"] },
  {
    title: "Business and contact",
    fields: ["ein", "shopPhone", "shopEmail"],
  },
  {
    title: "About you",
    fields: ["firstName", "lastName", "phone", "email", "role"],
  },
  { title: "A few words", fields: ["message", "consent"] },
]

export const photoRules = {
  maxBytes: 5 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp"],
}

export type PartnerFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error"
      message: string
      fieldErrors?: Partial<Record<PartnerField | "photo", string>>
    }

export function firstErrors(error: z.ZodError) {
  const result: Partial<Record<string, string>> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0])
    if (!result[key]) result[key] = issue.message
  }
  return result
}
