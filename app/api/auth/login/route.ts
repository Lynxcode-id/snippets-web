import { NextRequest, NextResponse } from "next/server"
export const runtime = "nodejs"

import { createSessionToken } from "@/lib/auth"
import { authenticateUser } from "@/lib/queries"

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const identity = String(form.get("identity") ?? "").trim()
    const password = String(form.get("password") ?? "")
    const nextPath = String(form.get("next") ?? "/profile")

    const user = await authenticateUser(identity, password)
    if (!user) {
      return NextResponse.redirect(new URL(`/login?error=1&next=${encodeURIComponent(nextPath)}`, request.url))
    }

    const token = await createSessionToken({
      sub: String(user.id),
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url ?? ""
    })

    const response = NextResponse.redirect(new URL(nextPath, request.url))
    response.cookies.set({
      name: "neo_session",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    })
    return response
  } catch {
    return NextResponse.redirect(new URL("/login?error=1", request.url))
  }
}
