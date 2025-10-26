import React from "react";

export default function GuvenliIlanRehberi() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-700 leading-relaxed">
      <section className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Güvenli İlan Rehberi
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Odanet, kullanıcılarının güvenliğini her şeyin önünde tutar. Bu
          rehber, oda kiralama ve paylaşım süreçlerinde hem ilan verenlerin hem
          de ilan arayanların kendilerini koruyabilmesi için hazırlanmıştır.
        </p>
      </section>

      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
            1. Gerçek Bilgiler Kullanın
          </h2>
          <p>
            Profilinizi oluştururken adınız, e-posta adresiniz ve ilan
            detaylarınızın doğru olduğundan emin olun. Sahte veya yanıltıcı
            bilgiler hem hesabınızın kapatılmasına hem de güven kaybına neden
            olabilir.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
            2. Şüpheli Taleplere Dikkat Edin
          </h2>
          <p>
            Kimseye kişisel bilgilerinizi (TC kimlik numarası, banka bilgisi
            vb.) paylaşmayın. Kira veya depozito ödemesini daima resmi yollarla
            yapın, elden veya şüpheli linkler üzerinden ödeme yapmayın.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
            3. Görüşmeden Önce Profili İnceleyin
          </h2>
          <p>
            Görüşme yapmadan önce karşı tarafın profil bilgilerini dikkatlice
            inceleyin. Odanet üzerinde “doğrulanmış profil” etiketi bulunan
            kullanıcılar sistemimiz tarafından kimlik doğrulamasından
            geçirilmiştir.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
            4. Sadece Platform Üzerinden İletişim Kurun
          </h2>
          <p>
            Güvenliğiniz için iletişimi Odanet platformu üzerinden sürdürün.
            Platform dışı iletişim, dolandırıcılık riskini artırabilir ve destek
            ekibimizin size yardımcı olmasını zorlaştırır.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
            5. Şüpheli Durumları Bildirin
          </h2>
          <p>
            Karşılaştığınız şüpheli davranış, sahte ilan veya uygunsuz içeriği
            hemen bize bildirin. Her bildirim titizlikle incelenir ve gerekli
            işlemler ivedilikle yapılır.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
            6. Topluluk Kurallarına Uyun
          </h2>
          <p>
            Odanet topluluğu; saygı, güven ve dürüstlük üzerine kuruludur.
            Başkalarının haklarına saygı gösterin, iletişimde nezaket
            kurallarını ihmal etmeyin.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl mt-10 shadow-sm">
          <h3 className="text-xl font-semibold text-indigo-700 mb-3">
            Odanet Güvenlik Politikası
          </h3>
          <p>
            Odanet, tüm kullanıcılarını kimlik doğrulaması, e-posta onayı ve
            aktif izleme sistemleri aracılığıyla korur. Platformda yapılan tüm
            ilan işlemleri kayıt altındadır ve gerektiğinde incelenir. Bu sayede
            sahte ilanların ve kötüye kullanımın önüne geçilir.
          </p>
        </div>
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Şüpheli bir durum fark ettiniz mi?
        </h2>
        <p className="text-gray-600">
          Hemen bize bildirin:{" "}
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
