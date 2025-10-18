import React from "react";

export default function Hero() {
  return (
    <section
      aria-label="Odanet ana tanıtım alanı"
      className="
        relative
        bg-gradient-to-b from-indigo-700 via-indigo-600 to-violet-600
        text-white text-center
        pt-16 pb-14 sm:pt-20 sm:pb-16
        overflow-hidden
      "
    >
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
          Odanet ile güvenli, kolay ve şeffaf
          <br className="hidden sm:block" /> bir oda arama deneyimi
        </h1>
        {/* İSTENMİYOR: Açıklama metni kaldırıldı */}
      </div>

      {/* very subtle fade at the bottom so it transitions nicely into page background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-transparent" />
    </section>
  );
}
