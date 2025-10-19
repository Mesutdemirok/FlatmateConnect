import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchBox from "@/components/SearchBox";
import CombinedFeed from "@/components/CombinedFeed";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-violet-50 to-fuchsia-50 flex flex-col" data-testid="home-page">
      <SEOHead />
      <Header />
      <main className="flex-grow">
        <Hero />
        <SearchBox />
        <CombinedFeed />
      </main>
      <Footer />
    </div>
  );
}
