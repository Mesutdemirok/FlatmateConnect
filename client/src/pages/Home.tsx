import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
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
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Featured Seekers Section */}
        <div className="bg-gradient-to-b from-white via-slate-50 to-violet-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturedRoomSeekers />
          </div>
        </div>

        {/* Featured Listings Section */}
        <FeaturedListings />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
