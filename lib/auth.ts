import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    "change-this-secret-in-production"
)

type SessionPayload = {
  sub: string
  username: string
  email: string
  avatarUrl: string
}

type UnlockPayload = {
  snippetId: string
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ username: payload.username, email: payload.email, avatarUrl: payload.avatarUrl })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function readSessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return {
    id: Number(payload.sub ?? 0),
    username: String(payload.username ?? ""),
    email: String(payload.email ?? ""),
    avatar_url: String(payload.avatarUrl ?? "")
  }
}

export async function createUnlockToken(payload: UnlockPayload) {
  return new SignJWT({ snippetId: payload.snippetId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function readUnlockToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return {
    snippetId: String(payload.snippetId ?? "")
  }
}

export function getCookie(request: NextRequest, name: string) {
  return request.cookies.get(name)?.value ?? ""
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = getCookie(request, "neo_session")
  if (!token) return null
  try {
    return await readSessionToken(token)
  } catch {
    return null
  }
}

export async function getSessionFromCookieHeader(cookieHeader: string) {
  const token = cookieHeader.match(/(?:^|; )neo_session=([^;]+)/)?.[1]
  if (!token) return null
  try {
    return await readSessionToken(decodeURIComponent(token))
  } catch {
    return null
  }
}

export async function isSnippetUnlocked(request: NextRequest, snippetId: number) {
  const token = getCookie(request, `neo_unlock_${snippetId}`)
  if (!token) return false
  try {
    const decoded = await readUnlockToken(token)
    return decoded.snippetId === String(snippetId)
  } catch {
    return false
  }
}

export async function isSnippetUnlockedFromCookieHeader(cookieHeader: string, snippetId: number) {
  const token = cookieHeader.match(new RegExp(`(?:^|; )neo_unlock_${snippetId}=([^;]+)`))?.[1]
  if (!token) return false
  try {
    const decoded = await readUnlockToken(decodeURIComponent(token))
    return decoded.snippetId === String(snippetId)
  } catch {
    return false
  }
}
