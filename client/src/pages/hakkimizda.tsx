import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Hakkimizda() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Ana Sayfaya Dön */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>

          <section className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Odanet Hakkında
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Odanet, güvenli oda kiralama ve ev arkadaşı bulma sürecini Türkiye'de
              daha şeffaf, güvenilir ve kullanıcı dostu hale getirmek amacıyla
              kurulmuştur. <br />
              <span className="font-medium text-gray-800">
                MESTOK Bilişim ve E-Ticaret A.Ş.
              </span>{" "}
              tarafından geliştirilen platform, modern tasarımı, doğrulanmış
              profilleri ve güçlü altyapısıyla oda paylaşımında yeni bir güven
              standardı getirir.
            </p>
          </section>

          <section className="space-y-8 text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
                Misyonumuz
              </h2>
              <p>
                Odanet olarak misyonumuz, oda paylaşımında güveni, şeffaflığı ve
                erişilebilirliği ön planda tutarak, kullanıcılarımızın güvenli bir
                topluluk içinde yeni yaşam alanları bulmasını sağlamaktır. Herkesin
                konforlu ve güvenli bir ev ortamına ulaşabilmesi için dijital
                teknolojiyi sade, işlevsel ve insan odaklı bir biçimde sunuyoruz.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
                Vizyonumuz
              </h2>
              <p>
                Türkiye'nin en güvenilir, en kullanıcı dostu ve en şeffaf oda
                paylaşım platformu olmak. Odanet, sadece bir oda bulma aracı değil;
                aynı zamanda insanların birbirini güvenle tanıdığı, birlikte yaşama
                kültürünü geliştirdiği bir sosyal platform olmayı hedefler.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
                Değerlerimiz
              </h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <span className="font-medium">Güvenlik:</span> Tüm kullanıcılar
                  kimlik doğrulamasıyla sisteme dahil olur. Güvenli ilan politikamız
                  sayesinde herkes için güvenilir bir ortam oluştururuz.
                </li>
                <li>
                  <span className="font-medium">Şeffaflık:</span> Gerçek ilanlar,
                  doğrulanmış profiller ve açık iletişim. Kullanıcılarımız ne
                  görüyorsa, onu bulur.
                </li>
                <li>
                  <span className="font-medium">Topluluk:</span> Odanet, yalnızca
                  oda paylaşımını değil; güvene dayalı bir topluluk yaşamını
                  destekler.
                </li>
                <li>
                  <span className="font-medium">Yenilikçilik:</span> Kullanıcı
                  deneyimini sürekli geliştirir, modern tasarımı ve teknolojiyi
                  herkes için erişilebilir hale getiririz.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
                Kurumsal Yapı
              </h2>
              <p>
                Odanet markası, İstanbul merkezli{" "}
                <span className="font-medium">
                  MESTOK Bilişim ve E-Ticaret A.Ş.
                </span>{" "}
                çatısı altında geliştirilmiştir. Şirketimiz; dijital güven,
                kullanıcı deneyimi ve yapay zeka tabanlı sistemler üzerine
                çalışmaktadır. Platform, Türkiye'nin oda kiralama kültürünü modern
                teknolojiyle buluşturur.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
                İletişim
              </h2>
              <p>
                Görüş, öneri veya işbirliği talepleriniz için bizimle iletişime
                geçebilirsiniz: <br />
                <a
                  href="mailto:info@odanet.com.tr"
                  className="text-indigo-600 font-medium hover:underline"
                >
                  info@odanet.com.tr
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
