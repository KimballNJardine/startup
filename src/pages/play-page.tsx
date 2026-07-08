import React from "react";

const boardStyle = {
  aspectRatio: "1024 / 683",
};

const overlayStyle = {
  "--pin-width": "3.125%",
  "--pin-height": "1.5625%",
} as React.CSSProperties;

const boardPins = [
  ["bg-slate-700/90", "9.93%", "27.4%", "-68.72deg"],
  ["bg-blue-700/90", "26.16%", "11.47%", "-23.32deg"],
  ["bg-blue-700/90", "29.52%", "10.01%", "-13.85deg"],
  ["bg-green-700/90", "41.1%", "51.79%", "-35.66deg"],
  ["bg-green-700/90", "44.07%", "49.17%", "-24.85deg"],
  ["bg-pink-500/90", "71.09%", "39.53%", "-14.04deg"],
  ["bg-pink-500/90", "74.56%", "38.51%", "-8.75deg"],
  ["bg-pink-500/90", "78.08%", "38.21%", "3.53deg"],
  ["bg-yellow-500/95", "79.55%", "60.12%", "-42.48deg"],
  ["bg-yellow-500/95", "82.17%", "56.72%", "-41.31deg"],
  ["bg-orange-500/90", "57.96%", "79.78%", "-133.38deg"],
  ["bg-red-700/90", "62.22%", "83.06%", "-9.77deg"],
  ["bg-red-700/90", "65.69%", "82.24%", "-9.46deg"],
  ["bg-black/90", "87.89%", "86.6%", "48.56deg"],
  ["bg-black/90", "85.29%", "82.86%", "39.28deg"],
  ["bg-black/90", "72.18%", "81.05%", "-30.96deg"],
  ["bg-white/95 ring-black/30", "24.05%", "74.05%", "13.91deg"],
  ["bg-white/95 ring-black/30", "20.54%", "73.34%", "0.26deg"],
  ["bg-slate-800/90", "71.51%", "60.98%", "-45.1deg"],
  ["bg-slate-800/90", "78.51%", "53.51%", "-10.36deg"],
] as const;

export default function PlayPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Pick Train Cards and Tickets
        </h2>
        <div className="mt-4">
          <h3 className="text-base font-bold">Train Deck (Face Down)</h3>
          <button type="button" aria-label="Draw from train deck">
            <img
              src="img/split_trains/train_back.png"
              alt="Face-down train deck"
              width="96"
            />
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <h3 className="text-base font-bold">Face-Up Train Cards</h3>
          <table className="mt-2 border-collapse">
            <tr>
              <td>
                <button type="button" aria-label="Select face-up train card 1">
                  <img
                    src="img/split_trains/train_1.png"
                    alt="Face-up train card 1"
                    width="96"
                  />
                </button>
              </td>
              <td>
                <button type="button" aria-label="Select face-up train card 2">
                  <img
                    src="img/split_trains/train_2.png"
                    alt="Face-up train card 2"
                    width="96"
                  />
                </button>
              </td>
              <td>
                <button type="button" aria-label="Select face-up train card 3">
                  <img
                    src="img/split_trains/train_3.png"
                    alt="Face-up train card 3"
                    width="96"
                  />
                </button>
              </td>
              <td>
                <button type="button" aria-label="Select face-up train card 4">
                  <img
                    src="img/split_trains/train_4.png"
                    alt="Face-up train card 4"
                    width="96"
                  />
                </button>
              </td>
              <td>
                <button type="button" aria-label="Select face-up train card 5">
                  <img
                    src="img/split_trains/train_9.png"
                    alt="Face-up train card 5"
                    width="96"
                  />
                </button>
              </td>
            </tr>
          </table>
        </div>
        <div className="mt-4">
          <h3 className="text-base font-bold">Ticket/Route Deck (Face Down)</h3>
          <button
            type="button"
            className="mt-2 rounded-xl bg-rail-700 px-4 py-2 text-sm font-extrabold text-rail-paper transition hover:bg-rail-900"
          >
            Draw Ticket Cards
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Board
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-rail-700 sm:text-base">
          These example trains are mirrored from src/tmp/play-board-pins.json.
          Every route shown here is fully claimed by a player, with no partial
          links.
        </p>
        <div
          className="relative mt-4 overflow-hidden rounded-xl border border-rail-300/70 bg-rail-paper/70"
          style={boardStyle}
        >
          <img
            src="img/USA_map.jpg"
            alt="Ticket to Ride USA board with cities and rail routes"
            className="h-full w-full object-contain"
          />

          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={overlayStyle}
          >
            {boardPins.map(([colorClass, left, top, rotate], index) => (
              <div
                key={`${left}-${top}-${index}`}
                className={`absolute rounded-sm shadow-sm ring-1 ring-white/70 ${colorClass}`}
                style={{
                  left,
                  top,
                  width: "var(--pin-width)",
                  height: "var(--pin-height)",
                  transform: `translate(-50%, -50%) rotate(${rotate})`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Player Public Status
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-rail-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-rail-200/70 text-rail-900">
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Turn Indicator
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Username
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Trains Left
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Longest Route Length
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Train Cards in Hand
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Tickets/Routes in Hand
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Public Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/80 text-rail-900">
              <tr className="odd:bg-rail-paper/45">
                <td className="px-3 py-2">Current Turn</td>
                <td className="px-3 py-2">kimba</td>
                <td className="px-3 py-2">34</td>
                <td className="px-3 py-2">18</td>
                <td className="px-3 py-2">9</td>
                <td className="px-3 py-2">3</td>
                <td className="px-3 py-2">
                  52 (segments 42 + longest route bonus +10)
                </td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-3 py-2">Waiting</td>
                <td className="px-3 py-2">alex</td>
                <td className="px-3 py-2">31</td>
                <td className="px-3 py-2">15</td>
                <td className="px-3 py-2">7</td>
                <td className="px-3 py-2">4</td>
                <td className="px-3 py-2">39 (segments 39)</td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-3 py-2">Waiting</td>
                <td className="px-3 py-2">sam</td>
                <td className="px-3 py-2">29</td>
                <td className="px-3 py-2">12</td>
                <td className="px-3 py-2">11</td>
                <td className="px-3 py-2">2</td>
                <td className="px-3 py-2">44 (segments 44)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Turn Notifications
        </h2>
        <div
          id="turnNotifications"
          aria-live="polite"
          className="mt-3 rounded-xl bg-rail-paper/70 px-4 py-3"
        >
          Waiting for turn updates...
        </div>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Your Private Details (Logged-In Player)
        </h2>
        <div className="mt-4">
          <h3 className="text-base font-bold">Your Tickets/Routes</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Seattle to New York (completed)</li>
            <li>Dallas to Miami (incomplete)</li>
            <li>Denver to El Paso (completed)</li>
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-base font-bold">Your Train Cards</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Red x2</li>
            <li>Blue x3</li>
            <li>Green x1</li>
            <li>Yellow x2</li>
            <li>Locomotive x1</li>
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-base font-bold">Your Actual Score Breakdown</h3>
          <p className="mt-2 font-semibold">Total Score: 60</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Route segments: +42</li>
            <li>Completed tickets/routes: +26</li>
            <li>Incomplete tickets/routes: -8</li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Actions (Placeholder)
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            className="rounded-xl bg-rail-700 px-4 py-2 text-sm font-extrabold text-rail-paper transition hover:bg-rail-900"
          >
            Draw Train Cards
          </button>
          <button
            type="button"
            className="rounded-xl bg-rail-700 px-4 py-2 text-sm font-extrabold text-rail-paper transition hover:bg-rail-900"
          >
            Draw Tickets/Routes
          </button>
          <button
            type="button"
            className="rounded-xl bg-rail-700 px-4 py-2 text-sm font-extrabold text-rail-paper transition hover:bg-rail-900"
          >
            Claim Route
          </button>
          <button
            type="button"
            className="rounded-xl bg-rail-700 px-4 py-2 text-sm font-extrabold text-rail-paper transition hover:bg-rail-900"
          >
            Pass/End Turn
          </button>
        </div>
      </section>
    </main>
  );
}
