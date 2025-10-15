import React from "react";

export default function Hero() {
  return (
    <section
      aria-label="Odanet ana tanıtım alanı"
      className="relative bg-gradient-to-b from-indigo-700 via-indigo-600 to-violet-600 text-white text-center py-20 md:py-28 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in">
          Odanet ile güvenli, kolay ve şeffaf
          <br className="hidden sm:block" /> bir oda arama deneyimi
        </h1>

        <p className="text-lg sm:text-xl leading-relaxed text-white/90 animate-fade-in-delay">
          Doğrulanmış profiller ve gerçek ilanlarla sana en uygun oda ya da ev
          arkadaşını hemen bul.
        </p>
      </div>

      {/* Subtle top fade for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
    </section>
  );
}
