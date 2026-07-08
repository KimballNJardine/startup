export default function SetupPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-2xl font-extrabold tracking-tight">
          Game Setup Waiting Room
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-rail-700 sm:text-base">
          Configure your game, invite friends, and wait for players to join
          before starting.
        </p>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Game Configuration
        </h2>
        <div className="mt-4 space-y-1.5">
          <label
            htmlFor="playerCount"
            className="text-sm font-bold uppercase tracking-wide text-rail-700"
          >
            Number of Players
          </label>
          <select
            id="playerCount"
            name="playerCount"
            className="w-full rounded-xl border border-rail-300 bg-rail-paper/60 px-4 py-3 text-base text-rail-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700 sm:max-w-xs"
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5" selected>
              5
            </option>
          </select>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-rail-700 sm:text-base">
          Choose between 2 and 5 players. The game can start after all invited
          players are logged in.
        </p>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Invite Friends (Placeholder)
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-rail-700 sm:text-base">
          This section is a placeholder for future Twilio integration to send
          game invites by text message (or another invite method).
        </p>
        <form
          method="post"
          action="#"
          id="inviteForm"
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="w-full space-y-1.5 sm:max-w-sm">
            <label
              htmlFor="inviteContact"
              className="text-sm font-bold uppercase tracking-wide text-rail-700"
            >
              Friend Contact
            </label>
            <input
              id="inviteContact"
              name="inviteContact"
              type="text"
              placeholder="Phone number or email"
              className="w-full rounded-xl border border-rail-300 bg-rail-paper/60 px-4 py-3 text-base text-rail-900 placeholder:text-rail-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700"
            />
          </div>
          <button
            type="button"
            aria-label="Invite friend"
            className="rounded-xl bg-rail-700 px-5 py-3 text-sm font-extrabold text-rail-paper transition hover:bg-rail-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700"
          >
            Send Invite
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Players Joined
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-rail-700 sm:text-base">
          Waiting for players to log in and join this game session.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-rail-200">
          <table
            id="playerList"
            className="min-w-full border-collapse text-left text-sm"
          >
            <thead className="bg-rail-200/70 text-rail-900">
              <tr>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Player
                </th>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/80 text-rail-900">
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3">Host</td>
                <td className="px-4 py-3">Logged In</td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3">Player 2</td>
                <td className="px-4 py-3">Waiting to Join</td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3">Player 3</td>
                <td className="px-4 py-3">Waiting to Join</td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3">Player 4</td>
                <td className="px-4 py-3">Waiting to Join</td>
              </tr>
              <tr className="odd:bg-rail-paper/45">
                <td className="px-4 py-3">Player 5</td>
                <td className="px-4 py-3">Waiting to Join</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Notifications
        </h2>
        <div
          id="notifications"
          className="mt-4 space-y-3 text-sm text-rail-900 sm:text-base"
        >
          <div
            id="playerJoinNotifications"
            aria-live="polite"
            className="rounded-xl bg-rail-paper/70 px-4 py-3"
          >
            Waiting for player join updates...
          </div>
          <div
            id="playerLeaveNotifications"
            aria-live="polite"
            className="rounded-xl bg-rail-paper/70 px-4 py-3"
          >
            Waiting for player leave updates...
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Start Game
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-rail-700 sm:text-base">
          The Start Game action will eventually validate players and initialize
          the game state.
        </p>
        <form method="get" action="play.html" className="mt-4">
          <button
            id="startGameBtn"
            type="submit"
            aria-label="Start game"
            className="w-full rounded-xl bg-rail-700 px-4 py-3 text-base font-extrabold text-rail-paper transition hover:bg-rail-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700 sm:w-auto"
          >
            Start Game
          </button>
        </form>
      </section>
    </main>
  );
}
