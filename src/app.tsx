import React from "react";
import "./app.css";

export default function App() {
  return (
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ticket to Ride - Login</title>
    <link rel="icon" href="favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Nunito Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
              rail: {
                paper: '#f8f2e7',
                100: '#efe2c6',
                200: '#e0cda8',
                300: '#c7aa79',
                600: '#8f6b3f',
                700: '#73542f',
                900: '#2f2112',
              },
            },
            boxShadow: {
              card: '0 14px 40px -22px rgba(47, 33, 18, 0.35)',
            },
          },
        },
      };
    </script>
  </head>
  <main>
    App components go here
  </main>
      <footer class="border-t border-rail-300/70 bg-rail-paper/90">
      <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <a
          href="https://github.com/KimballNJardine/startup"
          class="inline-flex items-center gap-2 text-sm font-semibold text-rail-700 underline decoration-rail-300 underline-offset-4 transition hover:text-rail-900"
          >GitHub Repository
          <img
            src="img/GitHub%20Logos/SVG/GitHub_Invertocat_Black.svg"
            alt=""
            aria-hidden="true"
            class="h-4 w-4"
          /></a>
        <p class="text-right text-sm font-semibold text-rail-700">Made by Kimball Jardine</p>
      </div>
    </footer>
  );
}
