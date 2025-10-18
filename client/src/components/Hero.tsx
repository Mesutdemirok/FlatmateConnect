import React from "react";

// ODANET Revizyon – Hero (font-light, kısa metin)
export default function Hero() {
  return (
    <section
      aria-label="Odanet ana tanıtım alanı"
      className="
        relative
        bg-gradient-to-b from-indigo-700 via-indigo-600 to-violet-600
        text-white text-center
        py-16 md:py-24
        overflow-hidden
      "
    >
      <div className="max-w-prose mx-auto px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-relaxed">
          Güvenilir ve şeffaf oda arama deneyimi
        </h1>
        <p className="mt-4 text-slate-100 text-base md:text-lg font-light">
          Odanet ile doğru ev arkadaşını bul, güvenle paylaş
        </p>
      </div>

      {/* very subtle fade at the bottom so it transitions nicely into page background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-transparent" />
    </section>
  );
}
