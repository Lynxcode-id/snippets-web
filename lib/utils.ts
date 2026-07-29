export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function safeJson(value: unknown) {
  return JSON.parse(JSON.stringify(value))
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date))
}

export function normalizeList(text: string) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function boolFromFormValue(v: FormDataEntryValue | null) {
  return String(v ?? "") === "on" || String(v ?? "") === "true" || String(v ?? "") === "1"
}
