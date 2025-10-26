import React, { useState } from "react";

export default function YardimMerkezi() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Odanet nedir ve nasıl çalışır?",
      answer:
        "Odanet, güvenli oda kiralama ve ev arkadaşı bulma sürecini kolaylaştıran bir platformdur. Kullanıcılar doğrulanmış profillerle ilan verebilir veya oda arayabilir. Şeffaf iletişim ve güvenli eşleşme sistemimizle, herkes için daha güvenli bir barınma deneyimi sunuyoruz.",
    },
    {
      question: "Nasıl ilan verebilirim?",
      answer:
        "Odanet’e giriş yaptıktan sonra ana menüdeki 'İlan Ver' butonuna tıklayarak adım adım yönlendirmeleri izleyebilirsiniz. İlanınız yayınlanmadan önce güvenlik açısından sistem tarafından kontrol edilir.",
    },
    {
      question: "İlanlar doğrulanıyor mu?",
      answer:
        "Evet. Her ilan, sistemimiz tarafından kontrol edilir ve sadece doğrulanmış kullanıcı profilleri üzerinden yayına alınır. Bu, güvenli oda paylaşımı ve güvenilir iletişim sağlar.",
    },
    {
      question: "İlanım neden yayından kaldırıldı?",
      answer:
        "İlanlar, ilan yayınlama kurallarına aykırı olduğu tespit edilirse (örneğin yanlış fiyat, sahte görseller veya uygunsuz içerik gibi), sistem tarafından otomatik olarak kaldırılabilir.",
    },
    {
      question: "Destek ekibine nasıl ulaşabilirim?",
      answer:
        "Herhangi bir sorunuz veya teknik probleminiz için bize e-posta yoluyla ulaşabilirsiniz: info@odanet.com.tr. Ekibimiz en kısa sürede dönüş yapacaktır.",
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-700 leading-relaxed">
      <section className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Yardım Merkezi
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Sık sorulan sorulara buradan ulaşabilir, aklınıza takılan konularla
          ilgili yanıtları kolayca bulabilirsiniz. Eğer çözüm bulamazsanız
          bizimle doğrudan iletişime geçebilirsiniz.
        </p>
      </section>

      <section className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left px-5 py-4"
            >
              <span className="font-medium text-gray-800">{faq.question}</span>
              <span className="text-indigo-600 text-xl">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-5 pb-4 text-gray-600 border-t border-gray-100">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Daha fazla yardıma mı ihtiyacınız var?
        </h2>
        <p className="text-gray-600">
          Bize ulaşın:{" "}
          <a
            href="mailto:info@odanet.com.tr"
            className="text-indigo-600 font-medium hover:underline"
          >
            admin@odanet.com.tr
          </a>
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} MESTOK Bilişim ve E-Ticaret A.Ş. — Odanet
        Tüm Hakları Saklıdır.
      </p>
    </main>
  );
}
