export type User = {
  id: number
  username: string
  email: string
  password_hash: string
  avatar_url: string
  bio: string
  created_at: string
}

export type Snippet = {
  id: number
  user_id: number
  name: string
  slug: string
  description: string
  category: string
  language: string
  code: string
  example_type: string
  is_public: number
  password_hash: string | null
  tags: string
  views_count: number
  likes_count: number
  created_at: string
  updated_at: string
}

export type PublicSnippet = Snippet & {
  username: string
  avatar_url: string
}

export type SessionUser = {
  id: number
  username: string
  email: string
  avatar_url: string
}
