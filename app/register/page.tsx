import Link from "next/link"

export default async function RegisterPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = (await searchParams) ?? {}

  return (
    <div className="neo-shell max-w-2xl">
      <section className="neo-card p-6 sm:p-8">
        <div className="text-sm font-black uppercase tracking-[0.22em] text-zinc-600">Create account</div>
        <h1 className="mt-2 text-4xl font-black">Bikin akun baru</h1>
        <p className="mt-2 text-zinc-700">
          Username unik, email valid, dan password aman untuk akses dashboard.
        </p>

        {params.error ? (
          <div className="mt-4 rounded-2xl border-[3px] border-black bg-[#ffefef] p-4 font-semibold">
            Gagal register. Cek data yang kamu isi.
          </div>
        ) : null}

        <form action="/api/auth/register" method="POST" className="mt-6 grid gap-4">
          <div>
            <label className="neo-label" htmlFor="username">Username</label>
            <input id="username" name="username" required className="neo-input" placeholder="lynxcode" />
          </div>
          <div>
            <label className="neo-label" htmlFor="email">Email</label>
            <input id="email" name="email" required type="email" className="neo-input" placeholder="lynx@example.com" />
          </div>
          <div>
            <label className="neo-label" htmlFor="password">Password</label>
            <input id="password" name="password" required type="password" minLength={8} className="neo-input" placeholder="minimal 8 karakter" />
          </div>
          <div>
            <label className="neo-label" htmlFor="avatarUrl">Avatar URL (opsional)</label>
            <input id="avatarUrl" name="avatarUrl" className="neo-input" placeholder="https://..." />
          </div>
          <button className="neo-btn" type="submit">Register</button>
        </form>

        <p className="mt-6 text-sm text-zinc-700">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-black underline decoration-2 underline-offset-4">
            Login
          </Link>
        </p>
      </section>
    </div>
  )
}
