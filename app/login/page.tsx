import Link from "next/link"

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; next?: string }>
}) {
  const params = (await searchParams) ?? {}
  const next = params.next ?? "/profile"

  return (
    <div className="neo-shell max-w-2xl">
      <section className="neo-card p-6 sm:p-8">
        <div className="text-sm font-black uppercase tracking-[0.22em] text-zinc-600">Sign in</div>
        <h1 className="mt-2 text-4xl font-black">Masuk ke akun</h1>
        <p className="mt-2 text-zinc-700">
          Login untuk bikin snippet, pakai password protection, dan kelola profile.
        </p>

        {params.error ? (
          <div className="mt-4 rounded-2xl border-[3px] border-black bg-[#ffefef] p-4 font-semibold">
            Email/username atau password salah.
          </div>
        ) : null}

        <form action="/api/auth/login" method="POST" className="mt-6 grid gap-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="neo-label" htmlFor="identity">Email / Username</label>
            <input id="identity" name="identity" required className="neo-input" placeholder="lynxcode@example.com" />
          </div>
          <div>
            <label className="neo-label" htmlFor="password">Password</label>
            <input id="password" name="password" required type="password" className="neo-input" placeholder="••••••••" />
          </div>
          <button className="neo-btn" type="submit">Login</button>
        </form>

        <p className="mt-6 text-sm text-zinc-700">
          Belum punya akun?{" "}
          <Link href="/register" className="font-black underline decoration-2 underline-offset-4">
            Register
          </Link>
        </p>
      </section>
    </div>
  )
}
