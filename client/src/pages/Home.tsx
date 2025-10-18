import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchBox from "@/components/SearchBox";
import FeaturedRoomSeekers from "@/components/FeaturedRoomSeekers";
import FeaturedListings from "@/components/FeaturedListings";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-indigo-50 via-violet-50 to-fuchsia-50 flex flex-col"
      data-testid="home-page"
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main id="main" className="flex-grow">
        {/* HERO */}
        <Hero />

        {/* SEARCH (now with positive spacing so it never collides with Hero) */}
        <div className="relative z-10">
          <SearchBox />
        </div>

        {/* FEATURED LISTINGS */}
        <section
          aria-labelledby="featured-listings-heading"
          className="py-10 sm:py-12"
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              id="featured-listings-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 sm:mb-8"
            >
              Güncel İlanlar
            </h2>
            <FeaturedListings />
          </div>
        </section>

        {/* FEATURED ROOM SEEKERS */}
        <section
          aria-labelledby="featured-seekers-heading"
          className="bg-gradient-to-b from-white via-slate-50 to-violet-50 py-10 sm:py-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              id="featured-seekers-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 sm:mb-8"
            >
              Oda Arayanlar
            </h2>
            <FeaturedRoomSeekers />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
