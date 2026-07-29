import Link from "next/link"
import { cookies } from "next/headers"
import { ArrowRight, Eye, Heart, Lock, Search, Sparkles, UserRound } from "lucide-react"
import { getSessionFromCookieHeader } from "@/lib/auth"
import { CATEGORIES, LANGUAGES, listSnippets } from "@/lib/queries"
import { formatDate } from "@/lib/utils"

async function getSession() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ")
  return getSessionFromCookieHeader(cookieHeader)
}

export default async function Home({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; category?: string; language?: string }>
}) {
  const params = (await searchParams) ?? {}
  const session = await getSession()

  const snippets = await listSnippets({
    query: params.q,
    category: params.category,
    language: params.language,
    ownerId: session?.id,
    limit: 12
  })

  return (
    <div className="neo-shell">
      <section className="neo-card overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-[#fff0bf] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="h-4 w-4" />
              Snippet vault modern
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-[0.95] sm:text-6xl">
              Simpan, lindungi, dan bagikan code snippet dengan gaya ⚡
            </h1>
            <p className="mt-4 max-w-2xl text-base text-zinc-700 sm:text-lg">
              Punya akun, bikin snippet publik atau terkunci password, lalu kelola semuanya dari satu dashboard.
            </p>

            <form action="/snippets" method="GET" className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="q">Search</label>
              <input
                id="q"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search by name, tag, or category..."
                className="neo-input"
              />
              <button className="neo-btn" type="submit">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/snippets" className={`neo-chip ${!params.category ? "neo-chip-active" : ""}`}>
                ALL
              </Link>
              {CATEGORIES.filter((item) => item !== "ALL").map((category) => (
                <Link
                  key={category}
                  href={`/snippets?category=${category}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                  className={`neo-chip ${params.category?.toUpperCase() === category ? "neo-chip-active" : ""}`}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="neo-stat">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-black bg-[#2f66ff] text-white">
                <Code2Icon />
              </div>
              <div>
                <div className="text-3xl font-black">{snippets.length}</div>
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">Snippet tampil</div>
              </div>
            </div>
            <div className="neo-stat">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-black bg-[#fff0bf]">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-black">Password guard</div>
                <div className="text-sm text-zinc-600">Snippet bisa dikunci per item</div>
              </div>
            </div>
            <div className="neo-stat">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-black bg-[#7ef0d0]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-black">{session ? `Hi, ${session.username}` : "Guest mode"}</div>
                <div className="text-sm text-zinc-600">{session ? "Kelola snippet dari profile." : "Masuk untuk bikin snippet."}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="grid gap-4">
          {snippets.length ? (
            snippets.map((snippet) => (
              <article key={snippet.id} className="neo-card p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black leading-tight">{snippet.name}</h2>
                      <span className="rounded-full border-[2px] border-black bg-[#7ef0d0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                        {snippet.language}
                      </span>
                      {snippet.password_hash ? (
                        <span className="rounded-full border-[2px] border-black bg-[#fff0bf] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                          Protected
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 max-w-3xl text-zinc-700">
                      {snippet.description || "Tanpa deskripsi."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border-[2px] border-black bg-[#fff7dd] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                        {snippet.category}
                      </span>
                      {String(snippet.tags || "")
                        .split(",")
                        .map((tag: string) => tag.trim())
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((tag: string) => (
                          <span key={tag} className="rounded-full border-[2px] border-black bg-[#f0f0f0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                            {tag}
                          </span>
                        ))}
                    </div>

                    <div className="mt-5 flex items-center gap-3 text-sm text-zinc-600">
                      <span className="font-black text-zinc-950">@{snippet.username}</span>
                      <span>•</span>
                      <span>{formatDate(snippet.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <div className="inline-flex items-center gap-2 self-start rounded-full border-[2px] border-black bg-[#7ef0d0] px-4 py-2 text-[12px] font-black uppercase tracking-[0.18em]">
                      {snippet.example_type}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm font-black">
                      <span className="inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-3 py-2">
                        <Eye className="h-4 w-4" /> {snippet.views_count}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-3 py-2">
                        <Heart className="h-4 w-4" /> {snippet.likes_count}
                      </span>
                    </div>
                    <Link href={`/snippets/${snippet.slug}`} className="neo-btn mt-1">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="neo-card p-10 text-center">
              <div className="text-2xl font-black">Belum ada snippet cocok 😼</div>
              <p className="mt-2 text-zinc-600">Coba kata kunci lain atau bikin snippet baru.</p>
              <Link href="/create" className="neo-btn mt-6">
                Create new snippet
              </Link>
            </div>
          )}
        </div>

        <aside className="grid gap-4">
          <div className="neo-card p-5">
            <div className="text-sm font-black uppercase tracking-[0.2em] text-zinc-600">Languages</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {LANGUAGES.slice(0, 8).map((language) => (
                <Link
                  key={language}
                  href={`/snippets?language=${encodeURIComponent(language)}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                  className="rounded-full border-[2px] border-black bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em]"
                >
                  {language}
                </Link>
              ))}
            </div>
          </div>

          <div className="neo-card p-5">
            <div className="text-lg font-black">Security layer</div>
            <p className="mt-2 text-sm text-zinc-700">
              Snippet dapat dibuat publik, privat, atau diproteksi password. Password disimpan dalam hash.
            </p>
          </div>

          <div className="neo-card p-5">
            <div className="text-lg font-black">Quick links</div>
            <div className="mt-4 grid gap-2">
              <Link href="/snippets" className="neo-btn-soft justify-between">
                Browse
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/create" className="neo-btn-soft justify-between">
                Add snippet
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!session ? (
                <Link href="/register" className="neo-btn-soft justify-between">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}

function Code2Icon() {
  return <span className="text-xl font-black">{`</>`}</span>
}
