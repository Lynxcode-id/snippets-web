import { nanoid } from "nanoid"
import { db, ensureSchema } from "./db"
import { hashPassword, verifyPassword } from "./auth"
import { normalizeList, slugify } from "./utils"

export const CATEGORIES = [
  "ALL",
  "FRONTEND",
  "BACKEND",
  "API",
  "ALGORITHM",
  "DATABASE",
  "CSS",
  "SHELL",
  "CONFIG",
  "UTILITY",
  "OTHER"
] as const

export const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "PHP",
  "Go",
  "Rust",
  "CSS",
  "HTML",
  "Shell",
  "JSON",
  "SQL",
  "Other"
] as const

export const EXAMPLE_TYPES = ["NONE", "TEXT", "IMAGE"] as const

export async function getUserById(id: number) {
  await ensureSchema()
  const res = await db.execute({
    sql: `SELECT id, username, email, password_hash, avatar_url, bio, created_at FROM users WHERE id = ? LIMIT 1`,
    args: [id]
  })
  return (res.rows[0] as any) ?? null
}

export async function getUserByUsername(username: string) {
  await ensureSchema()
  const res = await db.execute({
    sql: `SELECT id, username, email, password_hash, avatar_url, bio, created_at FROM users WHERE username = ? LIMIT 1`,
    args: [username]
  })
  return (res.rows[0] as any) ?? null
}

export async function getUserByEmail(email: string) {
  await ensureSchema()
  const res = await db.execute({
    sql: `SELECT id, username, email, password_hash, avatar_url, bio, created_at FROM users WHERE email = ? LIMIT 1`,
    args: [email]
  })
  return (res.rows[0] as any) ?? null
}

export async function createUser(input: {
  username: string
  email: string
  password: string
  avatarUrl?: string
}) {
  await ensureSchema()
  const existing = await db.execute({
    sql: `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
    args: [input.username, input.email]
  })
  if (existing.rows.length) {
    throw new Error("Username atau email sudah dipakai.")
  }

  const password_hash = await hashPassword(input.password)
  const avatar_url = input.avatarUrl ?? ""
  const res = await db.execute({
    sql: `INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?) RETURNING id, username, email, avatar_url`,
    args: [input.username, input.email, password_hash, avatar_url]
  })
  return res.rows[0] as any
}

export async function authenticateUser(emailOrUsername: string, password: string) {
  await ensureSchema()
  const res = await db.execute({
    sql: `SELECT id, username, email, password_hash, avatar_url, bio, created_at
          FROM users
          WHERE email = ? OR username = ?
          LIMIT 1`,
    args: [emailOrUsername, emailOrUsername]
  })
  const user = res.rows[0] as any | undefined
  if (!user) return null
  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return null
  return user
}

export function parseTags(tags: string) {
  return normalizeList(tags).slice(0, 8)
}

export async function createSnippet(input: {
  userId: number
  name: string
  description: string
  category: string
  language: string
  code: string
  exampleType: string
  isPublic: boolean
  password?: string
  tags: string
}) {
  await ensureSchema()

  const base = slugify(input.name) || "snippet"
  const slug = `${base}-${nanoid(6).toLowerCase()}`
  const password_hash = input.password ? await hashPassword(input.password) : null
  const tags = parseTags(input.tags).join(", ")

  const res = await db.execute({
    sql: `INSERT INTO snippets
      (user_id, name, slug, description, category, language, code, example_type, is_public, password_hash, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *`,
    args: [
      input.userId,
      input.name,
      slug,
      input.description,
      input.category.toUpperCase(),
      input.language,
      input.code,
      input.exampleType,
      input.isPublic ? 1 : 0,
      password_hash,
      tags
    ]
  })

  return res.rows[0] as any
}

export async function updateSnippetLikeCounter(snippetId: number, delta: 1 | -1) {
  await ensureSchema()
  await db.execute({
    sql: `UPDATE snippets SET likes_count = MAX(likes_count + ?, 0), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [delta, snippetId]
  })
}

export async function incrementSnippetViews(snippetId: number) {
  await ensureSchema()
  await db.execute({
    sql: `UPDATE snippets SET views_count = views_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [snippetId]
  })
}

export async function getSnippetBySlug(slug: string) {
  await ensureSchema()
  const res = await db.execute({
    sql: `SELECT s.*, u.username, u.avatar_url
          FROM snippets s
          JOIN users u ON u.id = s.user_id
          WHERE s.slug = ?
          LIMIT 1`,
    args: [slug]
  })
  return (res.rows[0] as any) ?? null
}

export async function getSnippetById(id: number) {
  await ensureSchema()
  const res = await db.execute({
    sql: `SELECT s.*, u.username, u.avatar_url
          FROM snippets s
          JOIN users u ON u.id = s.user_id
          WHERE s.id = ?
          LIMIT 1`,
    args: [id]
  })
  return (res.rows[0] as any) ?? null
}

export async function listSnippets(params: {
  query?: string
  category?: string
  language?: string
  ownerId?: number
  limit?: number
}) {
  await ensureSchema()

  const where: string[] = []
  const args: any[] = []

  where.push(`s.is_public = 1`)

  if (params.ownerId) {
    where.push(`(s.is_public = 1 OR s.user_id = ?)`)
    args.push(params.ownerId)
  }

  if (params.query) {
    where.push(`(s.name LIKE ? OR s.description LIKE ? OR s.tags LIKE ?)`)
    const q = `%${params.query}%`
    args.push(q, q, q)
  }

  if (params.category && params.category !== "ALL") {
    where.push(`s.category = ?`)
    args.push(params.category.toUpperCase())
  }

  if (params.language && params.language !== "ALL") {
    where.push(`s.language = ?`)
    args.push(params.language)
  }

  const limit = Math.min(params.limit ?? 20, 50)

  const res = await db.execute({
    sql: `SELECT s.*, u.username, u.avatar_url
          FROM snippets s
          JOIN users u ON u.id = s.user_id
          WHERE ${where.join(" AND ")}
          ORDER BY s.created_at DESC
          LIMIT ${limit}`,
    args
  })

  return res.rows as any[]
}

export async function listUserSnippets(userId: number) {
  await ensureSchema()
  const res = await db.execute({
    sql: `SELECT s.*, u.username, u.avatar_url
          FROM snippets s
          JOIN users u ON u.id = s.user_id
          WHERE s.user_id = ?
          ORDER BY s.created_at DESC`,
    args: [userId]
  })
  return res.rows as any[]
}

export async function countUserStats(userId: number) {
  await ensureSchema()
  const snippets = await db.execute({
    sql: `SELECT COUNT(*) as count, COALESCE(SUM(views_count), 0) as views, COALESCE(SUM(likes_count), 0) as likes
          FROM snippets
          WHERE user_id = ?`,
    args: [userId]
  })
  return snippets.rows[0] as any
}

export async function toggleSnippetLike(snippetId: number, userId: number) {
  await ensureSchema()
  const existing = await db.execute({
    sql: `SELECT id FROM snippet_likes WHERE user_id = ? AND snippet_id = ? LIMIT 1`,
    args: [userId, snippetId]
  })

  if (existing.rows.length) {
    await db.execute({
      sql: `DELETE FROM snippet_likes WHERE user_id = ? AND snippet_id = ?`,
      args: [userId, snippetId]
    })
    await updateSnippetLikeCounter(snippetId, -1)
    return false
  }

  await db.execute({
    sql: `INSERT INTO snippet_likes (user_id, snippet_id) VALUES (?, ?)`,
    args: [userId, snippetId]
  })
  await updateSnippetLikeCounter(snippetId, 1)
  return true
}

export async function hasUserLikedSnippet(snippetId: number, userId: number) {
  await ensureSchema()
  const res = await db.execute({
    sql: `SELECT id FROM snippet_likes WHERE user_id = ? AND snippet_id = ? LIMIT 1`,
    args: [userId, snippetId]
  })
  return res.rows.length > 0
}

export async function updateProfile(userId: number, input: {
  username: string
  email: string
  avatarUrl: string
  bio: string
}) {
  await ensureSchema()
  const existing = await db.execute({
    sql: `SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ? LIMIT 1`,
    args: [input.username, input.email, userId]
  })
  if (existing.rows.length) {
    throw new Error("Username atau email sudah dipakai akun lain.")
  }

  const res = await db.execute({
    sql: `UPDATE users
          SET username = ?, email = ?, avatar_url = ?, bio = ?
          WHERE id = ?
          RETURNING id, username, email, avatar_url, bio, created_at`,
    args: [input.username, input.email, input.avatarUrl, input.bio, userId]
  })
  return res.rows[0] as any
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  await ensureSchema()
  const user = await getUserById(userId)
  if (!user) throw new Error("User tidak ditemukan.")
  const ok = await verifyPassword(currentPassword, user.password_hash)
  if (!ok) throw new Error("Password lama salah.")
  const newHash = await hashPassword(newPassword)
  await db.execute({
    sql: `UPDATE users SET password_hash = ? WHERE id = ?`,
    args: [newHash, userId]
  })
  return true
}
