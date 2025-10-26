import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUse() {
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
            Kullanım Koşulları
          </h1>

          <p className="mb-4">
            Bu Kullanım Koşulları, Odanet ("biz") tarafından işletilen
            www.odanet.com.tr web sitesi ("Site") ve mobil uygulamamızın kullanımına
            ilişkin kuralları ve sorumlulukları belirler. Sitemizi veya
            hizmetlerimizi kullanan her kullanıcı ("Kullanıcı"), bu koşulları kabul
            etmiş sayılır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">1. Hizmetin Tanımı</h2>
          <p className="mb-4">
            Odanet, oda veya ev arkadaşı arayan kullanıcıları bir araya getiren
            dijital bir platformdur. Odanet yalnızca ilan yayınlama, arama ve
            iletişim kurulmasına aracılık eder; taraflar arasındaki kira sözleşmesi
            veya mali ilişkilerden sorumlu değildir.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. Üyelik ve Hesap Güvenliği
          </h2>
          <p className="mb-4">
            Kullanıcı, üyelik oluştururken verdiği bilgilerin doğru ve güncel
            olduğunu beyan eder. Hesap güvenliği (şifre, e-posta erişimi vb.)
            tamamen kullanıcının sorumluluğundadır. Üçüncü kişilerin hesabı kötüye
            kullanmasından doğacak zararlardan Odanet sorumlu tutulamaz.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">3. İlan İçerikleri</h2>
          <p className="mb-4">
            İlan veren kullanıcı, paylaştığı tüm bilgilerin doğruluğundan
            sorumludur. Yanıltıcı, eksik, sahte veya yasalara aykırı ilanlar önceden
            bildirim yapılmaksızın yayından kaldırılabilir. Bu durumda kullanıcı,
            herhangi bir hak veya tazminat talep edemez.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">
            4. Yasal ve Etik Kullanım
          </h2>
          <p className="mb-4">
            Kullanıcılar, platformu yalnızca yasal amaçlarla kullanabilir. İlanlarda
            veya mesajlaşma alanlarında ayrımcı, saldırgan, müstehcen veya yanıltıcı
            içerik kullanmak kesinlikle yasaktır. Bu tür davranışlar hesabın kalıcı
            olarak kapatılmasına neden olabilir.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">
            5. Odanet'in Rolü ve Sorumluluğu
          </h2>
          <p className="mb-4">
            Odanet, taraflar arasında yapılan kira, depozito veya diğer anlaşmalarda
            taraf değildir. Kullanıcıların kendi aralarındaki işlemlerden
            doğabilecek anlaşmazlıklardan veya zararlardan Odanet sorumlu tutulamaz.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">
            6. Fikri Mülkiyet Hakları
          </h2>
          <p className="mb-4">
            Sitede yer alan tüm tasarım, logo, metin, yazılım ve görsel içerikler
            Odanet'e veya lisans sahiplerine aittir. Bu materyaller izinsiz olarak
            kopyalanamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">
            7. Hesap İptali ve İhlaller
          </h2>
          <p className="mb-4">
            Odanet, bu koşullara aykırı davranan kullanıcıların hesaplarını önceden
            bildirim yapmaksızın askıya alma veya silme hakkını saklı tutar. Sistem
            güvenliğini tehlikeye atan veya dolandırıcılığa teşebbüs eden
            kullanıcılar hakkında yasal işlem başlatılabilir.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">8. Sorumluluk Reddi</h2>
          <p className="mb-4">
            Odanet, ilan içeriklerinin doğruluğu, oda/konutların uygunluğu veya
            kullanıcıların beyanları konusunda herhangi bir garanti vermez.
            Platformda yer alan bilgiler yalnızca bilgilendirme amacı taşır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">9. Değişiklik Hakkı</h2>
          <p className="mb-4">
            Odanet, bu koşulları dilediği zaman güncelleme hakkını saklı tutar.
            Güncellenmiş koşullar sitede yayımlandığı anda yürürlüğe girer.
            Kullanıcıların bu değişiklikleri düzenli olarak takip etme sorumluluğu
            vardır.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">10. Uygulanacak Hukuk</h2>
          <p className="mb-4">
            İşbu Kullanım Koşulları, Türkiye Cumhuriyeti yasalarına tabidir. Her
            türlü uyuşmazlıkta İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>

          <p className="mt-8 text-sm text-gray-500">
            Bu kullanım koşulları {new Date().getFullYear()} tarihinde
            güncellenmiştir.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
