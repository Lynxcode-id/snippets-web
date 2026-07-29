import { NextRequest, NextResponse } from "next/server"
import { createSessionToken } from "@/lib/auth"
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/queries"

function toFormData(req: NextRequest) {
  return req.formData()
}

export async function POST(request: NextRequest) {
  try {
    const form = await toFormData(request)
    const username = String(form.get("username") ?? "").trim()
    const email = String(form.get("email") ?? "").trim().toLowerCase()
    const password = String(form.get("password") ?? "")
    const avatarUrl = String(form.get("avatarUrl") ?? "").trim()

    if (!username || !email || password.length < 8) {
      return NextResponse.redirect(new URL("/register?error=1", request.url))
    }

    if (await getUserByUsername(username) || await getUserByEmail(email)) {
      return NextResponse.redirect(new URL("/register?error=1", request.url))
    }

    const user = await createUser({ username, email, password, avatarUrl })
    const token = await createSessionToken({
      sub: String(user.id),
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url ?? ""
    })

    const nextUrl = new URL("/profile", request.url)
    const response = NextResponse.redirect(nextUrl)
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
    return NextResponse.redirect(new URL("/register?error=1", request.url))
  }
}
