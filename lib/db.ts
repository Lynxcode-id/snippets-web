import { createClient } from "@libsql/client"

const url =
  process.env.LIBSQL_URL ??
  process.env.TURSO_DATABASE_URL ??
  process.env.DATABASE_URL ??
  ""

const authToken =
  process.env.LIBSQL_AUTH_TOKEN ??
  process.env.TURSO_AUTH_TOKEN ??
  process.env.DATABASE_AUTH_TOKEN ??
  undefined

if (!url) {
  throw new Error(
    "Database URL belum diset. Pakai LIBSQL_URL / TURSO_DATABASE_URL / DATABASE_URL."
  )
}

declare global {
  // eslint-disable-next-line no-var
  var __neo_db: ReturnType<typeof createClient> | undefined
  // eslint-disable-next-line no-var
  var __neo_schema_ready: Promise<void> | undefined
}

export const db = globalThis.__neo_db ?? createClient({ url, authToken })
if (!globalThis.__neo_db) globalThis.__neo_db = db

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'OTHER',
    language TEXT NOT NULL DEFAULT 'JavaScript',
    code TEXT NOT NULL,
    example_type TEXT NOT NULL DEFAULT 'NONE',
    is_public INTEGER NOT NULL DEFAULT 1,
    password_hash TEXT DEFAULT NULL,
    tags TEXT NOT NULL DEFAULT '',
    views_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS snippet_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    snippet_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, snippet_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_category ON snippets(category)`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language)`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON snippets(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_name ON snippets(name)`,
  `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`
]

export async function ensureSchema() {
  if (!globalThis.__neo_schema_ready) {
    globalThis.__neo_schema_ready = (async () => {
      for (const sql of SCHEMA) {
        await db.execute(sql)
      }
    })()
  }
  return globalThis.__neo_schema_ready
}
