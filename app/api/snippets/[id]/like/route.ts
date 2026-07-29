import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"
import { getSnippetById, toggleSnippetLike } from "@/lib/queries"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const { id } = params
  const snippet = await getSnippetById(Number(id))
  if (!snippet) {
    return NextResponse.redirect(new URL("/snippets", request.url))
  }

  await toggleSnippetLike(snippet.id, session.id)
  return NextResponse.redirect(new URL(`/snippets/${snippet.slug}`, request.url))
}
