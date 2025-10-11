import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
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

        {/* Featured Listings Section */}
        <FeaturedListings />

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white text-center py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Oda mı Arıyorsunuz?
            </h2>
            <p className="text-white/90 text-lg md:text-xl mb-6 leading-relaxed">
              Profilinizi oluşturun ve size en uygun ev sahipleriyle bağlantı
              kurun. Gerçek, doğrulanmış üyelerle tanışın.
            </p>
            <div className="flex justify-center">
              <a
                href="/create-seeker"
                className="inline-block bg-white text-indigo-700 hover:bg-indigo-100 font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200"
              >
                Profil Oluştur
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
