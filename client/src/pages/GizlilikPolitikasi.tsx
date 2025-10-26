import React from "react";

export default function GizlilikPolitikasi() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        Gizlilik Politikası
      </h1>

      <p className="mb-4">
        Bu Gizlilik Politikası, Odanet (“biz”) tarafından işletilen
        www.odanet.com.tr web sitesi ve mobil uygulamamız (“Platform”) üzerinden
        elde edilen kişisel verilerin işlenmesi, saklanması ve korunmasına
        ilişkin esasları açıklar.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        1. Kişisel Verilerin Korunması
      </h2>
      <p className="mb-4">
        Odanet, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)
        hükümlerine uygun şekilde kullanıcı verilerini işler. Platformu kullanan
        her kullanıcı, KVKK uyarınca bilgilendirilmiş sayılır.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Toplanan Bilgiler</h2>
      <p className="mb-4">
        Üyelik, ilan verme veya iletişim formlarının doldurulması sırasında; ad,
        soyad, telefon numarası, e-posta adresi, konum bilgisi ve tercih
        bilgileri toplanabilir. Ayrıca, kullanıcı deneyimini iyileştirmek
        amacıyla çerez (cookie) teknolojileri kullanılmaktadır.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        3. Verilerin Kullanım Amacı
      </h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Platform hizmetlerinin sunulması ve geliştirilmesi,</li>
        <li>Kullanıcı doğrulama ve güvenlik kontrollerinin sağlanması,</li>
        <li>
          Kullanıcılara uygun oda veya ev arkadaşı önerilerinin sunulması,
        </li>
        <li>İstatistiksel analiz ve sistem geliştirmesi,</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        4. Verilerin Paylaşımı
      </h2>
      <p className="mb-4">
        Kişisel veriler, yalnızca yasal zorunluluk halinde veya kullanıcı
        onayıyla üçüncü kişilerle paylaşılır. Odanet, kullanıcı verilerini
        hiçbir koşulda satmaz veya izinsiz şekilde üçüncü taraflara aktarmaz.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        5. Çerez (Cookie) Kullanımı
      </h2>
      <p className="mb-4">
        Odanet, kullanıcı deneyimini geliştirmek ve site performansını analiz
        etmek amacıyla çerezler kullanır. Tarayıcı ayarları üzerinden çerez
        tercihlerinizi değiştirebilir veya çerezleri engelleyebilirsiniz. Daha
        fazla bilgi için{" "}
        <a href="/cerez-politikasi" className="text-indigo-600 hover:underline">
          Çerez Politikası
        </a>{" "}
        sayfamızı inceleyebilirsiniz.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        6. Veri Saklama Süresi
      </h2>
      <p className="mb-4">
        Kişisel veriler, yasal yükümlülüklerin gerektirdiği süre boyunca veya
        işleme amacının ortadan kalkmasına kadar saklanır. Süresi dolan veriler
        güvenli şekilde silinir veya anonimleştirilir.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Kullanıcı Hakları</h2>
      <p className="mb-4">
        KVKK kapsamında her kullanıcı, kişisel verilerine ilişkin aşağıdaki
        haklara sahiptir:
      </p>
      <ul className="list-disc ml-6 mb-4">
        <li>Verilerinin işlenip işlenmediğini öğrenme,</li>
        <li>Eksik veya hatalı işlenmiş verilerin düzeltilmesini talep etme,</li>
        <li>Verilerinin silinmesini veya anonim hale getirilmesini isteme,</li>
        <li>Verilerin aktarıldığı üçüncü tarafları öğrenme.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. İletişim</h2>
      <p className="mb-4">
        Gizlilik politikasıyla ilgili taleplerinizi ve KVKK kapsamındaki
        başvurularınızı
        <a
          href="mailto:info@odanet.com.tr"
          className="text-indigo-600 hover:underline"
        >
          {" "}
          info@odanet.com.tr
        </a>{" "}
        adresine iletebilirsiniz.
      </p>

      <p className="mt-8 text-sm text-gray-500">
        Bu gizlilik politikası {new Date().getFullYear()} yılı itibarıyla
        yürürlüktedir ve Odanet tarafından güncellenebilir.
      </p>
    </main>
  );
}
