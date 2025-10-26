import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function ListingRules() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8 text-gray-800 leading-relaxed">
          {/* Ana Sayfaya Dön */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>

          <h1 className="text-3xl font-bold mb-6 text-indigo-700">
            İlan Yayınlama Kuralları
          </h1>

          <p className="mb-4">
            Bu sayfa, Odanet platformunda ilan yayımlayan bireysel ve kurumsal
            kullanıcılar için geçerli olan temel kuralları içermektedir. Platformu
            kullanan herkes, bu kuralları kabul etmiş sayılır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">1. Kimlik Doğrulama</h2>
          <p className="mb-4">
            Mevzuat gereği, ilan yayımlamadan önce gerçek kişilerin kimlik ve
            iletişim bilgilerinin (ad-soyad, T.C. kimlik numarası, telefon numarası)
            doğrulanması zorunludur. Kimlik doğrulaması yapılmayan kullanıcılar ilan
            veremez.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. Doğruluk ve Güncellik
          </h2>
          <p className="mb-4">
            İlan içeriğinde yer alan bilgiler (fiyat, konum, metrekare, açıklama
            vb.) doğru ve güncel olmalıdır. Gerçeğe aykırı ilanlar, Odanet
            tarafından haber verilmeksizin yayından kaldırılabilir.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">
            3. Görsellerin Kullanımı
          </h2>
          <p className="mb-4">
            Fotoğraflar, yalnızca ilana konu olan oda veya evle ilgili olmalıdır.
            Üzerinde yazı, logo, reklam veya tanıtım içeren görseller yayımlanamaz.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">4. Mükerrer İlanlar</h2>
          <p className="mb-4">
            Aynı oda veya mülk için birden fazla ilan verilmesi yasaktır. Aynı
            içeriğe sahip ilanlar tespit edildiğinde tümü sistemden kaldırılır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">5. Başlık ve Açıklama</h2>
          <p className="mb-4">
            İlan başlığı yalnızca ilgili oda veya konut bilgilerini içermelidir.
            Başlık veya açıklama alanına iletişim bilgisi, marka adı, web adresi
            veya dikkat çekici özel karakterler yerleştirmek yasaktır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">6. Uygunsuz İçerik</h2>
          <p className="mb-4">
            Cinsiyet, ırk, dil, din, inanç, yaş, engellilik veya diğer temellerde
            ayrımcılık içeren ilanlar yasaktır. Bu tür içerikler derhal yayından
            kaldırılır ve kullanıcı hesabı askıya alınabilir.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">
            7. Satılmış veya Kiralanmış Oda
          </h2>
          <p className="mb-4">
            Artık aktif olmayan veya dolmuş odalar için ilan yayında tutulmamalıdır.
            Kullanıcı, bu ilanları arşivlemeli veya yayından kaldırmalıdır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">8. Platform Güvenliği</h2>
          <p className="mb-4">
            Odanet, ilanların güvenilirliğini ve kullanıcı deneyimini korumak
            amacıyla, kurallara aykırı içerikleri önceden bildirim yapılmaksızın
            kaldırma hakkına sahiptir.
          </p>

          <p className="mt-8 text-sm text-gray-500">
            Bu kurallar, {new Date().getFullYear()} yılı itibarıyla yürürlüktedir ve
            Odanet tarafından gerektiğinde güncellenebilir.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
