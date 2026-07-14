import React from "react";
import type { LocalGameState } from "../../../domain";

interface PlayerPublicStatusProps {
  gameState: LocalGameState;
}

export default function PlayerPublicStatus({
  gameState,
}: PlayerPublicStatusProps): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
      <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
        Player Public Status
      </h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-rail-200">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-rail-200/70 text-rail-900">
              <th scope="col" className="px-3 py-2 font-extrabold">
                Trains Left
              </th>
              <th scope="col" className="px-3 py-2 font-extrabold">
                Hand Size
              </th>
              <th scope="col" className="px-3 py-2 font-extrabold">
                Segment Score
              </th>
              <th scope="col" className="px-3 py-2 font-extrabold">
                Destination Tickets
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/80 text-rail-900">
            {gameState.playerOrder.map((playerId) => {
              const player = gameState.playersById[playerId];

              return (
                <tr key={player.id} className="odd:bg-rail-paper/45">
                  <td className="px-3 py-2">{player.trainsLeft}</td>
                  <td className="px-3 py-2">{player.handCardIds.length}</td>
                  <td className="px-3 py-2">{player.score}</td>
                  <td className="px-3 py-2">
                    {player.destinationTicketIds.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
