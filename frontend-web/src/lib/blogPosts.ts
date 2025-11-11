export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
  author?: string;
  imageUrl?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "oda-kiralamada-guvenlik",
    title: "Türkiye'de Oda Kiralamada Güvenlik Rehberi",
    description: "Kimlik doğrulama ve dolandırıcılıktan korunma ipuçları ile güvenli oda kiralama rehberi.",
    date: "2025-11-07",
    author: "Odanet Ekibi",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    content: `
      <h2>Güvenli Oda Kiralama İçin Temel Kurallar</h2>
      
      <p>Oda kiralama sürecinde güvenliğinizi korumak için bazı temel kurallara dikkat etmeniz gerekir. Bu rehber, dolandırıcılıktan korunmanıza ve güvenli bir kiralama süreci yaşamanıza yardımcı olacak.</p>

      <h3>1. Kimlik Doğrulama Yapın</h3>
      <p>Potansiyel ev arkadaşınızın veya ev sahibinin kimliğini mutlaka doğrulayın. Odanet platformunda doğrulanmış profillere öncelik verin. Kimlik belgesi talep etmekten çekinmeyin.</p>

      <h3>2. Platform Dışında Ödeme Yapmayın</h3>
      <p>Güvenliğiniz için ödeme işlemlerini mutlaka güvenilir platformlar üzerinden yapın. Doğrudan banka havalesi veya elden ödeme taleplerinden kaçının.</p>

      <h3>3. Evi Görün ve İnceleyin</h3>
      <p>Kontrat imzalamadan önce evi mutlaka görün. Video aramayla yetinmeyin, fiziksel olarak evi ziyaret edin ve çevreyi inceleyin.</p>

      <h3>4. Kontratı Dikkatli Okuyun</h3>
      <p>Kira sözleşmesini imzalamadan önce tüm maddeleri dikkatlice okuyun. Anlamadığınız noktalar için hukuki destek alın.</p>

      <h3>5. Şüpheli Durumları Bildirin</h3>
      <p>Herhangi bir şüpheli durum veya dolandırıcılık girişimiyle karşılaşırsanız, bunu hemen Odanet destek ekibine bildirin.</p>

      <div class="bg-orange-50 border-l-4 border-orange-500 p-4 my-6">
        <p class="font-semibold text-orange-800">💡 Önemli Not:</p>
        <p class="text-orange-700">Güvenliğiniz bizim önceliğimiz. Odanet üzerinden yapılan tüm işlemler kayıt altındadır ve destek ekibimiz her zaman yardımınıza hazırdır.</p>
      </div>
    `
  },
  {
    slug: "ev-arkadasiyla-yasam",
    title: "Ev Arkadaşıyla Yaşamda Dikkat Edilmesi Gerekenler",
    description: "Uyumlu bir ev paylaşımı için pratik öneriler ve iletişim ipuçları.",
    date: "2025-11-08",
    author: "Odanet Ekibi",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    content: `
      <h2>Başarılı Bir Ev Paylaşımı İçin Altın Kurallar</h2>
      
      <p>Ev arkadaşıyla yaşamak hem sosyal hem de ekonomik açıdan avantajlı olabilir. Ancak uyumlu bir yaşam için bazı kurallara dikkat etmek önemlidir.</p>

      <h3>1. Açık ve Dürüst İletişim</h3>
      <p>Ev arkadaşınızla açık iletişim kurun. Beklentilerinizi, rahatsızlıklarınızı ve tercihlerinizi net bir şekilde ifade edin. İletişim eksikliği çoğu sorunun kaynağıdır.</p>

      <h3>2. Temizlik Sorumluluklarını Belirleyin</h3>
      <p>Ortak alanların temizliği için bir program oluşturun. Kimin hangi günlerde hangi işleri yapacağını önceden belirleyin ve bu programa uyun.</p>

      <h3>3. Gider Paylaşımını Netleştirin</h3>
      <p>Kira, elektrik, su, internet gibi ortak giderlerin nasıl paylaşılacağını baştan belirleyin. Ödeme tarihlerini ve yöntemini netleştirin.</p>

      <h3>4. Özel Alan ve Zamanınıza Saygı Gösterin</h3>
      <p>Herkesin özel alanına ve zamanına saygı duyun. Gürültü seviyesi, misafir ağırlama kuralları ve uyku saatleri konusunda anlaşın.</p>

      <h3>5. Empati Kurun</h3>
      <p>Herkesin farklı yaşam tarzı ve alışkanlıkları olduğunu unutmayın. Anlayışlı ve hoşgörülü olmaya çalışın.</p>

      <h3>6. Sorunları Ertelemeyin</h3>
      <p>Küçük rahatsızlıkları biriktirmek yerine, sorunları nazik ama açık bir şekilde konuşun. Ertelenen sorunlar büyük çatışmalara dönüşebilir.</p>

      <div class="bg-turkuaz-50 border-l-4 border-turkuaz-500 p-4 my-6">
        <p class="font-semibold text-turkuaz-800">🏠 İpucu:</p>
        <p class="text-turkuaz-700">Aylık ev toplantıları düzenleyerek sorunları ve önerileri paylaşabilir, ev yaşamınızı daha düzenli hale getirebilirsiniz.</p>
      </div>
    `
  },
  {
    slug: "dolandiricilik-ipuclari",
    title: "Oda İlanı Yayınlarken Dolandırıcılıktan Korunma İpuçları",
    description: "Güvenli ilan oluşturmak ve dolandırıcılıktan korunmak için dikkat edilmesi gerekenler.",
    date: "2025-11-09",
    author: "Odanet Ekibi",
    imageUrl: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&q=80",
    content: `
      <h2>İlan Verirken Güvenliğinizi Nasıl Sağlarsınız?</h2>
      
      <p>Oda ilanı yayınlarken güvenliğinizi korumak ve dolandırıcılardan uzak durmak için bu ipuçlarını takip edin.</p>

      <h3>1. Gerçek Fotoğraflar Kullanın</h3>
      <p>İlanınızda mutlaka kendi odanızın gerçek fotoğraflarını kullanın. İnternetten indirilen veya başka ilanlardan alınan fotoğraflar hem dolandırıcılık izi bırakır hem de güven kaybına neden olur.</p>

      <h3>2. Kişisel Bilgilerinizi Koruyun</h3>
      <p>İlanınızda tam adresinizi, telefon numaranızı veya çok özel bilgilerinizi paylaşmayın. İlk iletişimi platform üzerinden yapın.</p>

      <h3>3. Sahte Tekliflere Dikkat Edin</h3>
      <p>Çok düşük fiyat teklifleri veya peşin ödeme talepleri şüpheli olabilir. Piyasa değerinden çok uzak tekliflerden kaçının.</p>

      <h3>4. Platform Dışı İletişime Geçmeyin</h3>
      <p>İlk görüşmeleri mutlaka Odanet platformu üzerinden yapın. Platform dışına çıkmak dolandırıcılık riskini artırır.</p>

      <h3>5. Kimlik Doğrulaması Yapın</h3>
      <p>Odanet'in kimlik doğrulama özelliğini kullanın. Doğrulanmış profiller daha güvenilirdir ve daha fazla görünürlük sağlar.</p>

      <h3>6. Şüpheli Mesajları Bildirin</h3>
      <p>Rahatsız edici, tehdit içeren veya dolandırıcılık amacı taşıyan mesajları hemen platforma bildirin. Destek ekibimiz 7/24 sizinle.</p>

      <h3>7. Güvenli Ödeme Yöntemleri Kullanın</h3>
      <p>Ödeme işlemlerini mutlaka güvenli ve kayıt altına alınabilen yöntemlerle yapın. Nakit ödeme yerine banka transferi veya platform üzerinden ödeme tercih edin.</p>

      <div class="bg-red-50 border-l-4 border-red-500 p-4 my-6">
        <p class="font-semibold text-red-800">⚠️ Uyarı:</p>
        <p class="text-red-700">Eğer bir dolandırıcılık girişimiyle karşılaşırsanız, polise başvurabilir ve Odanet destek ekibine bildirebilirsiniz. Tüm mesaj kayıtları delil olarak kullanılabilir.</p>
      </div>

      <h3>8. Kontrat Hazırlayın</h3>
      <p>Ev arkadaşınızla mutlaka yazılı bir kira sözleşmesi imzalayın. Sözleşmede tüm şartları, ödeme planını ve sorumlulukları net bir şekilde belirtin.</p>
    `
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getAllBlogPosts = (): BlogPost[] => {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
