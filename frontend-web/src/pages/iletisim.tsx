import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Iletisim() {
  const [formData, setFormData] = useState({
    adSoyad: "",
    email: "",
    mesaj: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Mesajınız başarıyla gönderildi! En kısa sürede sizinle iletişime geçilecektir.",
    );
    setFormData({ adSoyad: "", email: "", mesaj: "" });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8 text-gray-700 leading-relaxed">
          {/* Ana Sayfaya Dön */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>

          <section className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              İletişim
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Odanet ekibi olarak, kullanıcılarımızın görüş, öneri ve işbirliği
              taleplerini her zaman önemsiyoruz. Aşağıdaki formu doldurarak bize
              ulaşabilir ya da doğrudan e-posta gönderebilirsiniz.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="adSoyad"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ad Soyad
                </label>
                <input
                  id="adSoyad"
                  name="adSoyad"
                  type="text"
                  required
                  value={formData.adSoyad}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  E-posta Adresi
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="mesaj"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mesajınız
                </label>
                <textarea
                  id="mesaj"
                  name="mesaj"
                  rows={6}
                  required
                  value={formData.mesaj}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Gönder
              </button>
            </form>
          </section>

          <section className="mt-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Doğrudan Bize Ulaşın
            </h2>
            <p className="text-gray-600">
              E-posta:{" "}
              <a
                href="mailto:admin@odanet.com.tr"
                className="text-indigo-600 font-medium hover:underline"
              >
                admin@odanet.com.tr
              </a>
            </p>
            <p className="text-gray-600 mt-1">Adres: Zümrütevler Mah. Maltepe/İstanbul</p>
            <p className="text-gray-600">Telefon: +90 (534) 824 51 55</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
