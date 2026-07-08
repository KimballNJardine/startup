import React from "react";

export default function LeaderboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-2xl font-extrabold tracking-tight">
          Global Leaderboard
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-rail-700 sm:text-base">
          Current results use placeholder data and will be replaced by a
          database-backed service call later.
        </p>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Most Games Played
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-rail-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-rail-200/70 text-rail-900">
              <tr>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Rank
                </th>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Username
                </th>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Games Played
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/80 text-rail-900">
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3 font-semibold">1</td>
                <td className="px-4 py-3">trainMaster</td>
                <td className="px-4 py-3">238</td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3 font-semibold">2</td>
                <td className="px-4 py-3">routeRunner</td>
                <td className="px-4 py-3">221</td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3 font-semibold">3</td>
                <td className="px-4 py-3">kimba</td>
                <td className="px-4 py-3">198</td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3 font-semibold">4</td>
                <td className="px-4 py-3">ticketCollector</td>
                <td className="px-4 py-3">184</td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3 font-semibold">5</td>
                <td className="px-4 py-3">steelRails</td>
                <td className="px-4 py-3">173</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
