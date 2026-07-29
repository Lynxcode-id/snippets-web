import { NextRequest, NextResponse } from "next/server"
export const runtime = "nodejs"

import { createSnippet } from "@/lib/queries"
import { getSessionFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.redirect(new URL("/login?next=/create", request.url))
  }

  try {
    const form = await request.formData()
    const name = String(form.get("name") ?? "").trim()
    const description = String(form.get("description") ?? "").trim()
    const category = String(form.get("category") ?? "OTHER").trim()
    const language = String(form.get("language") ?? "JavaScript").trim()
    const code = String(form.get("code") ?? "").trim()
    const exampleType = String(form.get("exampleType") ?? "NONE").trim()
    const isPublic = String(form.get("isPublic") ?? "") === "on"
    const password = String(form.get("password") ?? "").trim()
    const tags = String(form.get("tags") ?? "").trim()

    if (!name || !code) {
      return NextResponse.redirect(new URL("/create?error=1", request.url))
    }

    const snippet = await createSnippet({
      userId: session.id,
      name,
      description,
      category,
      language,
      code,
      exampleType,
      isPublic,
      password: password || undefined,
      tags
    })

    return NextResponse.redirect(new URL(`/snippets/${snippet.slug}`, request.url))
  } catch {
    return NextResponse.redirect(new URL("/create?error=1", request.url))
  }
}
