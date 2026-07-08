import React from "react";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-6 shadow-card sm:p-8">
        <h2 className="text-2xl font-extrabold tracking-tight">Log In</h2>
        <p className="mt-2 text-sm text-rail-700">
          Jump back into your game room quickly. This layout is portrait-first
          for phone play.
        </p>

        <form method="post" action="#" className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-bold uppercase tracking-wide text-rail-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-rail-300 bg-rail-paper/60 px-4 py-3 text-base text-rail-900 placeholder:text-rail-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-bold uppercase tracking-wide text-rail-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="password"
              required
              className="w-full rounded-xl border border-rail-300 bg-rail-paper/60 px-4 py-3 text-base text-rail-900 placeholder:text-rail-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-rail-700 px-4 py-3 text-base font-extrabold text-rail-paper transition hover:bg-rail-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
