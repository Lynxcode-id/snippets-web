import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { Code2, Home, Plus, UserRound } from "lucide-react"
import "./globals.css"
import { getSessionFromCookieHeader } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Lynx Labs — Snippets",
  description: "Snippet vault bergaya komunitas dengan akun, password snippet, dan SQLite-compatible database."
}

async function getSession() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ")
  return getSessionFromCookieHeader(cookieHeader)
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()

  return (
    <html lang="id">
      <body>
        <header className="sticky top-0 z-50 border-b-[3px] border-black bg-[#f9f0df]/95 backdrop-blur">
          <div className="neo-shell !py-3">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-black bg-[#ffd84d] shadow-[4px_4px_0_0_#000]">
                  <Code2 className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-lg font-black leading-none sm:text-2xl">Lynx Labs</div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-600">
                    Community Snippet Vault
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Link href="/snippets" className="neo-btn-soft hidden sm:inline-flex">
                  Explore
                </Link>
                {session ? (
                  <Link href="/profile" className="neo-btn-soft">
                    <UserRound className="h-4 w-4" />
                    <span className="hidden sm:inline">{session.username}</span>
                  </Link>
                ) : (
                  <Link href="/login" className="neo-btn-soft">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <nav className="neo-nav sm:hidden" aria-label="Mobile navigation">
          <Link href="/" className="neo-nav-item">
            <Home className="h-5 w-5" />
          </Link>
          <Link href="/create" className="neo-nav-item">
            <Plus className="h-5 w-5" />
          </Link>
          <Link href="/snippets" className="neo-nav-item neo-nav-item-active">
            <Code2 className="h-5 w-5" />
          </Link>
          <Link href="/profile" className="neo-nav-item">
            <UserRound className="h-5 w-5" />
          </Link>
        </nav>
      </body>
    </html>
  )
}
