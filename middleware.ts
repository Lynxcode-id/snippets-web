import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "./lib/auth"

const PROTECTED = ["/create", "/profile", "/settings"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const session = await getSessionFromRequest(request)
  if (session) return NextResponse.next()

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/create/:path*", "/profile/:path*", "/settings/:path*"]
}
