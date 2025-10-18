import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchBox from "@/components/SearchBox";
import Footer from "@/components/Footer";
import MixedFeed from "@/components/MixedFeed";

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

        {/* SEARCH */}
        <div className="relative z-10">
          <SearchBox />
        </div>

        {/* MIXED FEED - Listings + Seekers together */}
        <MixedFeed />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
