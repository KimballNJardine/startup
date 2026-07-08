import React from "react";
import "./app.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LeaderboardPage from "./pages/leaderboard-page";
import LoginPage from "./pages/login-page";
import PlayPage from "./pages/play-page";
import SetupPage from "./pages/setup-page";
import NotFoundPage from "./pages/notfound-page";

export default function App() {
  return (
    <BrowserRouter>
      <header className="border-b border-rail-300/70 bg-rail-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6">
          <h1 className="text-xl font-extrabold tracking-wide sm:text-2xl">
            Ticket to Ride React
          </h1>
          <nav aria-label="Primary navigation">
            <menu className="m-0 flex list-none gap-2 overflow-x-auto p-0">
              <li>
                <a
                  href="index.html"
                  aria-current="page"
                  className="block whitespace-nowrap rounded-full bg-rail-700 px-3 py-1.5 text-sm font-semibold text-rail-paper"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="setup.html"
                  className="block whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-rail-700 transition hover:bg-rail-200 hover:text-rail-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700"
                >
                  Setup
                </a>
              </li>
              <li>
                <a
                  href="play.html"
                  className="block whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-rail-700 transition hover:bg-rail-200 hover:text-rail-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700"
                >
                  Play
                </a>
              </li>
              <li>
                <a
                  href="leaderboard.html"
                  className="block whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-rail-700 transition hover:bg-rail-200 hover:text-rail-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rail-700"
                >
                  Leaderboard
                </a>
              </li>
            </menu>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/index" element={<LoginPage />} />
        <Route path="/index.html" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login.html" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/setup.html" element={<SetupPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/play.html" element={<PlayPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/leaderboard.html" element={<LeaderboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="border-t border-rail-300/70 bg-rail-paper/90">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <a
            href="https://github.com/KimballNJardine/startup"
            className="inline-flex items-center gap-2 text-sm font-semibold text-rail-700 underline decoration-rail-300 underline-offset-4 transition hover:text-rail-900"
          >
            GitHub Repository
            <img
              src="/img/GitHub%20Logos/SVG/GitHub_Invertocat_Black.svg"
              alt=""
              aria-hidden="true"
              className="h-4 w-4"
            />
          </a>
          <p className="text-right text-sm font-semibold text-rail-700">
            Made by Kimball Jardine
          </p>
        </div>
      </footer>
    </BrowserRouter>
  );
}
