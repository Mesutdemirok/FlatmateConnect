import React from "react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-indigo-600 via-violet-600 to-fuchsia-600 text-center text-white py-16 md:py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in">
          Odanet ile güvenle ara, kolayca iletişime geçiniz.
        </h1>
        <p className="text-lg sm:text-xl text-white/90 mb-8 animate-fade-in-delay">
          Gerçek profillerle eşleş, doğrulanmış ilanlar arasında sana en uygun
          oda veya ev arkadaşını bul.
        </p>
      </div>

      {/* Soft overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
    </section>
  );
}
