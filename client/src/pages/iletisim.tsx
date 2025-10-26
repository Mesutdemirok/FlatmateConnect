import React, { useState } from "react";

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
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-700 leading-relaxed">
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
              rows={5}
              required
              value={formData.mesaj}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Gönder
          </button>
        </form>
      </section>

      <section className="mt-12 text-center text-gray-600">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Alternatif İletişim
        </h2>
        <p>
          E-posta:{" "}
          <a
            href="mailto:info@odanet.com.tr"
            className="text-indigo-600 hover:underline"
          >
            admin@odanet.com.tr
          </a>
        </p>
        <p>Adres: Zümrütevler Mah. Maltepe/İstanbul</p>
        <p>Telefon: +90 (534) 824 51 55</p>
      </section>

      <p className="mt-10 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} MESTOK Bilişim ve E-Ticaret A.Ş. — Odanet
        Tüm Hakları Saklıdır.
      </p>
    </main>
  );
}
