import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Eye, Heart, Plus, Settings2, LogOut, UserRound } from "lucide-react"
import { getSessionFromCookieHeader } from "@/lib/auth"
import { countUserStats, listUserSnippets } from "@/lib/queries"
import { formatDate } from "@/lib/utils"

async function getSession() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ")
  return getSessionFromCookieHeader(cookieHeader)
}

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect("/login?next=/profile")

  const [stats, snippets] = await Promise.all([
    countUserStats(session.id),
    listUserSnippets(session.id)
  ])

  return (
    <div className="neo-shell">
      <section className="neo-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.22em] text-zinc-600">@{session.username}</div>
            <h1 className="mt-2 text-4xl font-black">Your profile</h1>
            <p className="mt-2 max-w-2xl text-zinc-700">
              Kelola snippet, avatar, dan keamanan konten dari dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/create" className="neo-btn-soft">
              <Plus className="h-4 w-4" />
              Add snippet
            </Link>
            <Link href="/api/auth/logout" className="neo-btn-soft">
              <LogOut className="h-4 w-4" />
              Sign out
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="neo-stat">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-black bg-[#fff0bf]">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xl font-black">{stats?.count ?? 0}</div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">Your snippets</div>
            </div>
          </div>
          <div className="neo-stat">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-black bg-[#7ef0d0]">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xl font-black">{stats?.likes ?? 0}</div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">Total likes</div>
            </div>
          </div>
          <div className="neo-stat">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-black bg-[#2f66ff] text-white">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <div className="text-3xl font-black">{stats?.views ?? 0}</div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">Total views</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        <div className="neo-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.22em] text-zinc-600">Settings</div>
              <div className="mt-2 text-2xl font-black">Akun aktif</div>
            </div>
            <Link href="/settings" className="neo-btn-soft">
              <Settings2 className="h-4 w-4" />
              Security settings
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border-[3px] border-black bg-[#fff7dd] p-4 text-sm text-zinc-700">
            Email: <span className="font-black text-zinc-950">{session.email}</span>
          </div>
        </div>

        <div className="grid gap-4">
          {snippets.length ? snippets.map((snippet) => (
            <article key={snippet.id} className="neo-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black">{snippet.name}</h2>
                    <span className="rounded-full border-[2px] border-black bg-[#7ef0d0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                      {snippet.language}
                    </span>
                    {!snippet.is_public ? (
                      <span className="rounded-full border-[2px] border-black bg-[#ffd0d0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                        Private
                      </span>
                    ) : null}
                    {snippet.password_hash ? (
                      <span className="rounded-full border-[2px] border-black bg-[#fff0bf] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                        Locked
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-zinc-700">{snippet.description || "Tanpa deskripsi."}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border-[2px] border-black bg-[#fff7dd] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                      {snippet.category}
                    </span>
                    <span className="rounded-full border-[2px] border-black bg-[#f0f0f0] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">
                      {formatDate(snippet.created_at)}
                    </span>
                  </div>
                </div>
                <Link href={`/snippets/${snippet.slug}`} className="neo-btn-soft">
                  Open
                </Link>
              </div>
            </article>
          )) : (
            <div className="neo-card p-10 text-center">
              <div className="text-2xl font-black">Belum ada snippet.</div>
              <p className="mt-2 text-zinc-700">Mulai dari tombol Add snippet di atas.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
