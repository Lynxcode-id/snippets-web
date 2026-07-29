import Link from "next/link"
import { Plus } from "lucide-react"
import { CATEGORIES, EXAMPLE_TYPES, LANGUAGES } from "@/lib/queries"

export default function CreatePage() {
  return (
    <div className="neo-shell max-w-4xl">
      <section className="neo-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.22em] text-zinc-600">Create snippet</div>
            <h1 className="mt-2 text-4xl font-black">Tambah snippet baru</h1>
            <p className="mt-2 text-zinc-700">Form ini mendukung password protection dan visibility publik / privat.</p>
          </div>
          <Link href="/snippets" className="neo-btn-soft">
            Back to explore
          </Link>
        </div>

        <form action="/api/snippets" method="POST" className="mt-8 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="neo-label" htmlFor="name">Snippet Name</label>
              <input id="name" name="name" required className="neo-input" placeholder="useDebounce hook" />
            </div>
            <div>
              <label className="neo-label" htmlFor="category">Category</label>
              <select id="category" name="category" className="neo-input bg-white">
                {CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="neo-label" htmlFor="language">Language</label>
              <select id="language" name="language" className="neo-input bg-white">
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="neo-label" htmlFor="exampleType">Example Response</label>
              <select id="exampleType" name="exampleType" className="neo-input bg-white">
                {EXAMPLE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="neo-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" className="neo-input min-h-[120px]" placeholder="Apa fungsi snippet ini?" />
          </div>

          <div>
            <label className="neo-label" htmlFor="code">Code</label>
            <textarea id="code" name="code" required className="neo-textarea" placeholder="Paste your code here..." />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="neo-label" htmlFor="tags">Tags</label>
              <input id="tags" name="tags" className="neo-input" placeholder="react, hook, utility" />
            </div>
            <div>
              <label className="neo-label" htmlFor="password">Password snippet (optional)</label>
              <input id="password" name="password" type="password" className="neo-input" placeholder="password untuk membuka snippet" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border-[3px] border-black bg-white p-4 font-bold">
              <input type="checkbox" name="isPublic" defaultChecked className="h-5 w-5 accent-black" />
              Public snippet
            </label>
            <div className="rounded-2xl border-[3px] border-black bg-[#fff7dd] p-4 text-sm text-zinc-700">
              Jika public dicentang, semua orang bisa lihat. Jika password diisi, isi code tetap terkunci sampai dibuka.
            </div>
          </div>

          <button className="neo-btn w-full justify-center" type="submit">
            <Plus className="h-4 w-4" />
            Publish snippet
          </button>
        </form>
      </section>
    </div>
  )
}
