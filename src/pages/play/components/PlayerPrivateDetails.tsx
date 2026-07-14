import React from "react";

interface PlayerPrivateDetailsProps {
  trainsLeft: number;
  handSize: number;
  segmentScore: number;
  fulfilledPoints: number;
  unfulfilledPoints: number;
  netScoreExcludingLongestRoute: number;
  claimedRouteIds: string[];
}

export default function PlayerPrivateDetails({
  trainsLeft,
  handSize,
  segmentScore,
  fulfilledPoints,
  unfulfilledPoints,
  netScoreExcludingLongestRoute,
  claimedRouteIds,
}: PlayerPrivateDetailsProps): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
      <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
        Current Player Private Details
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
                Tickets Completed Score
              </th>
              <th scope="col" className="px-3 py-2 font-extrabold">
                Tickets Not Completed Score
              </th>
              <th scope="col" className="px-3 py-2 font-extrabold">
                Net Score (No Longest Route)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/80 text-rail-900">
            <tr className="odd:bg-rail-paper/45">
              <td className="px-3 py-2">{trainsLeft}</td>
              <td className="px-3 py-2">{handSize}</td>
              <td className="px-3 py-2">{segmentScore}</td>
              <td className="px-3 py-2">+{fulfilledPoints}</td>
              <td className="px-3 py-2">-{unfulfilledPoints}</td>
              <td className="px-3 py-2">{netScoreExcludingLongestRoute}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <h3 className="text-base font-bold">Claimed Routes</h3>
        {claimedRouteIds.length === 0 ? (
          <p className="mt-2 text-sm text-rail-700">No claimed routes yet.</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {claimedRouteIds.map((routeId) => (
              <li key={routeId}>{routeId}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
