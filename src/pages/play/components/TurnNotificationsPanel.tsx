import React from "react";

interface TurnNotificationsPanelProps {
  notifications: string[];
}

export default function TurnNotificationsPanel({
  notifications,
}: TurnNotificationsPanelProps): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
      <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
        Turn Notifications
      </h2>
      <ul
        id="turnNotifications"
        aria-live="polite"
        className="mt-3 space-y-2 rounded-xl bg-rail-paper/70 px-4 py-3 text-sm"
      >
        {notifications
          .slice(-6)
          .reverse()
          .map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
      </ul>
    </section>
  );
}
