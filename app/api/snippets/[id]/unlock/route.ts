import { NextRequest, NextResponse } from "next/server"
import { createUnlockToken, getSessionFromRequest } from "@/lib/auth"
import { verifyPassword } from "@/lib/password"
import { getSnippetById } from "@/lib/queries"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request)
  const { id } = await params
  const snippet = await getSnippetById(Number(id))
  if (!snippet) {
    return NextResponse.redirect(new URL("/snippets", request.url))
  }

  const form = await request.formData()
  const password = String(form.get("password") ?? "")

  const isOwner = session?.id === snippet.user_id
  if (!snippet.password_hash) {
    return NextResponse.redirect(new URL(`/snippets/${snippet.slug}`, request.url))
  }

  if (!isOwner) {
    const ok = await verifyPassword(password, snippet.password_hash)
    if (!ok) {
      return NextResponse.redirect(new URL(`/snippets/${snippet.slug}?error=1`, request.url))
    }
  }

  const token = await createUnlockToken({ snippetId: String(snippet.id) })
  const response = NextResponse.redirect(new URL(`/snippets/${snippet.slug}`, request.url))
  response.cookies.set({
    name: `neo_unlock_${snippet.id}`,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  })
  return response
}
