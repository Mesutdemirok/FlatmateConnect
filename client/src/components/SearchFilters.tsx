import React from "react";

/**
 * Hero
 * - Adds safe bottom padding so the next section (search box) never touches it
 * - Includes a subtle bottom separator that blends into a light page background
 * - Fully responsive and mobile-first
 */
export default function Hero() {
  return (
    <section
      aria-label="Odanet ana tanıtım alanı"
      className="
        relative isolate overflow-hidden
        bg-gradient-to-b from-indigo-700 via-indigo-600 to-violet-600
        text-white
      "
    >
      {/* Content */}
      <div
        className="
          mx-auto max-w-4xl px-4 sm:px-6
          pt-16 sm:pt-20
          pb-24 sm:pb-28 md:pb-36
          text-center
        "
      >
        <h1
          className="
            text-[32px] leading-[1.15]
            sm:text-5xl md:text-6xl font-extrabold
            mb-4 sm:mb-6
          "
        >
          Odanet ile güvenli, kolay ve şeffaf
          <br className="hidden sm:block" />
          <span className="sm:whitespace-nowrap"> bir oda arama deneyimi</span>
        </h1>

        <p
          className="
            text-base sm:text-xl leading-relaxed
            text-white/90
            mx-auto max-w-3xl
          "
        >
          Doğrulanmış profiller ve gerçek ilanlarla sana en uygun oda ya da ev
          arkadaşını hemen bul.
        </p>
      </div>

      {/* Soft glow across the hero (non-interactive) */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18),transparent_60%)]
        "
      />

      {/* Bottom separator to ensure visual space from the next section */}
      {/* If your page background differs, change the 'text-[#f6f7ff]' to that color */}
      <div aria-hidden className="relative">
        <svg
          className="absolute -bottom-px left-0 h-6 sm:h-8 w-full text-[#f6f7ff]"
          viewBox="0 0 1440 40"
          preserveAspectRatio="none"
        >
          <path d="M0 0h1440v40H0z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
