import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSessionFromCookieHeader } from "@/lib/auth"

async function getSession() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ")
  return getSessionFromCookieHeader(cookieHeader)
}

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/login?next=/settings")

  return (
    <div className="neo-shell max-w-2xl">
      <section className="neo-card p-6 sm:p-8">
        <div className="text-sm font-black uppercase tracking-[0.22em] text-zinc-600">Security</div>
        <h1 className="mt-2 text-4xl font-black">Password & akun</h1>
        <p className="mt-2 text-zinc-700">
          Halaman ini disiapkan untuk update password akun. Untuk versi ini, data utama disimpan aman dengan hash.
        </p>

        <div className="mt-6 rounded-2xl border-[3px] border-black bg-[#fff7dd] p-5">
          <div className="text-sm font-black uppercase tracking-[0.18em] text-zinc-600">Current login</div>
          <div className="mt-2 text-xl font-black">{session.username}</div>
          <div className="text-sm text-zinc-700">{session.email}</div>
        </div>
      </section>
    </div>
  )
}
