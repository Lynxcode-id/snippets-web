import Link from "next/link"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { Eye, Heart, Lock, Copy, CalendarDays, ArrowLeft } from "lucide-react"
import { getSessionFromCookieHeader, isSnippetUnlockedFromCookieHeader } from "@/lib/auth"
import { getSnippetBySlug, incrementSnippetViews, hasUserLikedSnippet } from "@/lib/queries"
import { formatDate } from "@/lib/utils"

async function getSession() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ")
  return getSessionFromCookieHeader(cookieHeader)
}

export default async function SnippetDetail({
  params,
  searchParams
}: {
  params: { slug: string }
  searchParams?: { error?: string }
}) {
  const { slug } = params
  const session = await getSession()
  const snippet = await getSnippetBySlug(slug)

  if (!snippet) notFound()
  if (!snippet.is_public && session?.id !== snippet.user_id) notFound()

  const protectedSnippet = Boolean(snippet.password_hash)
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ")
  const unlocked = !protectedSnippet || snippet.user_id === session?.id || (await isSnippetUnlockedFromCookieHeader(cookieHeader, snippet.id))

  await incrementSnippetViews(snippet.id)

  const liked = session ? await hasUserLikedSnippet(snippet.id, session.id) : false

  return (
    <div className="neo-shell max-w-5xl">
      <section className="neo-card p-6 sm:p-8">
        <Link href="/snippets" className="neo-btn-soft mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-4xl font-black">{snippet.name}</h1>
              <span className="rounded-full border-[2px] border-black bg-[#7ef0d0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                {snippet.language}
              </span>
              {protectedSnippet ? (
                <span className="rounded-full border-[2px] border-black bg-[#fff0bf] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                  Protected
                </span>
              ) : null}
              {!snippet.is_public ? (
                <span className="rounded-full border-[2px] border-black bg-[#ffd0d0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                  Private
                </span>
              ) : null}
            </div>
            <p className="mt-2 max-w-3xl text-zinc-700">{snippet.description || "Tanpa deskripsi."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border-[2px] border-black bg-[#fff7dd] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                {snippet.category}
              </span>
              {String(snippet.tags || "")
                .split(",")
                .map((tag: string) => tag.trim())
                .filter(Boolean)
                .map((tag: string) => (
                  <span key={tag} className="rounded-full border-[2px] border-black bg-[#f0f0f0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                    {tag}
                  </span>
                ))}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-4 py-2 text-sm font-black">
              <CalendarDays className="h-4 w-4" />
              {formatDate(snippet.created_at)}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-4 py-2 text-sm font-black">
              <Eye className="h-4 w-4" />
              {snippet.views_count} views
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-4 py-2 text-sm font-black">
              <Heart className="h-4 w-4" />
              {snippet.likes_count} likes
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-700">
          <span className="font-black text-zinc-950">@{snippet.username}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-2">
            <Copy className="h-4 w-4" /> Copy manual dari block code
          </span>
        </div>

        {searchParams?.error ? (
          <div className="mt-6 rounded-2xl border-[3px] border-black bg-[#ffefef] p-4 font-semibold">
            Password salah. Coba lagi.
          </div>
        ) : null}

        <div className="mt-6">
          {protectedSnippet && !unlocked ? (
            <div className="neo-card-inset p-6">
              <div className="flex items-center gap-2 text-xl font-black">
                <Lock className="h-5 w-5" />
                Snippet dikunci
              </div>
              <p className="mt-2 text-zinc-700">
                Masukkan password untuk membuka isi code.
              </p>
              <form action={`/api/snippets/${snippet.id}/unlock`} method="POST" className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input name="password" type="password" required className="neo-input" placeholder="Password snippet" />
                <button className="neo-btn" type="submit">Unlock</button>
              </form>
            </div>
          ) : (
            <pre className="overflow-x-auto rounded-[28px] border-[3px] border-black bg-[#111827] p-5 text-sm leading-7 text-[#d1fae5]">
              <code>{snippet.code}</code>
            </pre>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {session ? (
            <form action={`/api/snippets/${snippet.id}/like`} method="POST">
              <button className="neo-btn-soft" type="submit">
                <Heart className="h-4 w-4" />
                {liked ? "Unlike" : "Like"}
              </button>
            </form>
          ) : (
            <Link href="/login" className="neo-btn-soft">
              Login untuk like
            </Link>
          )}

          {session?.id === snippet.user_id ? (
            <Link href="/profile" className="neo-btn-soft">
              Manage from profile
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  )
}
