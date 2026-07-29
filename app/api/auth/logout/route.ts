import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url))
  response.cookies.set({
    name: "neo_session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  })
  return response
}
