import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Translation resources
const resources = {
  tr: {
    translation: {
      // Home Page
      home: {
        welcome_back: "Tekrar hoş geldin, {{name}}!",
        subtitle: "Mükemmel ev arkadaşını bul veya odanı kiraya ver"
      },
      
      // Navigation
      nav: {
        home: "Ana Sayfa",
        search: "Arama",
        browse_rooms: "Oda Arama İlanı Ver",
        list_room: "Oda İlanı Ver",
        messages: "Mesajlar",
        profile: "Profil",
        login: "Giriş Yap",
        logout: "Çıkış Yap",
        sign_up: "Üye Ol",
        create_listing: "İlan Ver",
        favorites: "Favoriler"
      },
      
      // Hero Section
      hero: {
        title: "Mükemmel Ev Arkadaşını Bul",
        subtitle: "Türkiye'nin en güvenilir ev arkadaşı ve kiralık oda platformu",
        search_placeholder: "Şehir, bölge veya adres ara...",
        search_button: "Ara",
        filters: {
          price: "Fiyat",
          room_type: "Oda Tipi",
          property_type: "Mülk Tipi",
          features: "Özellikler"
        },
        price_ranges: {
          any: "Herhangi Bir Fiyat",
          "100-200": "₺100 - ₺200",
          "200-300": "₺200 - ₺300", 
          "300-500": "₺300 - ₺500",
          "500+": "₺500+"
        },
        room_types: {
          any: "Herhangi Oda Tipi",
          private: "Özel Oda",
          shared: "Ortak Oda",
          ensuite: "Banyolu Oda",
          studio: "Stüdyo"
        },
        property_types: {
          any: "Herhangi Mülk",
          house: "Ev",
          apartment: "Daire",
          townhouse: "Müstakil Ev",
          unit: "Apartman Dairesi"
        },
        feature_options: {
          any: "Herhangi Özellik",
          furnished: "Eşyalı",
          bills_included: "Faturalar Dahil",
          parking: "Otopark Mevcut",
          internet: "İnternet Dahil"
        }
      },
      
      // Search Filters
      filters: {
        title: "Filtreler",
        clear: "Temizle",
        apply: "Uygula",
        location: "Konum",
        price_range: "Fiyat Aralığı",
        room_type: "Oda Tipi", 
        property_type: "Mülk Tipi",
        availability: "Müsaitlik",
        features: "Özellikler",
        min: "Min",
        max: "Maks"
      },
      
      // Search Results
      search: {
        results: "Arama Sonuçları",
        listing_found: "ilan bulundu",
        listings_found: "ilan bulundu",
        no_results_title: "İlan Bulunamadı",
        no_results_message: "Arama filtrelerinizi ayarlayın veya yeni ilanlar için daha sonra tekrar kontrol edin.",
        failed_to_load: "İlanlar yüklenemedi. Lütfen daha sonra tekrar deneyin."
      },
      
      // Listings
      listings: {
        featured: "Öne Çıkan İlanlar",
        recent: "Son İlanlar",
        per_week: "/hafta",
        per_month: "/ay",
        available_from: "Müsait:",
        view_details: "Detayları Gör",
        contact: "İletişim",
        favorite: "Favorile",
        share: "Paylaş",
        report: "Şikayet Et",
        featured_rooms: "Öne Çıkan Odalar",
        popular_listings: "Bölgenizdeki popüler ilanlar",
        view_all: "Hepsini Gör",
        unable_to_load: "İlanlar Yüklenemedi",
        trouble_loading: "Öne çıkan ilanları yüklerken sorun yaşıyoruz. Lütfen daha sonra tekrar deneyin.",
        try_again: "Tekrar Dene",
        no_listings_available: "İlan Bulunamadı",
        no_listings_message: "Şu anda hiç oda ilanı bulunmuyor. Yeni ilanlar için tekrar kontrol edin!",
        list_your_room: "Odanızı İlan Verin",
        back_to_search: "Aramaya Geri Dön",
        description: "Açıklama",
        features_amenities: "Özellikler ve Olanaklar",
        bills_included: "Faturalar Dahil",
        internet_included: "İnternet Dahil",
        parking_available: "Otopark Mevcut",
        furnished: "Eşyalı",
        bond: "depozito",
        contact_owner: "Sahibiyle İletişime Geç",
        property_owner: "Mülk Sahibi",
        verified: "Doğrulanmış",
        safety_first: "Güvenlik Öncelikli",
        safety_message: "Herhangi bir ödeme yapmadan önce mutlaka şahsen görüşün. Mülkü görmeden asla para göndermeyin.",
        not_found_title: "İlan Bulunamadı",
        not_found_message: "Aradığınız ilan mevcut değil veya kaldırılmış olabilir.",
        browse_other_listings: "Diğer İlanları İncele",
        add_to_favorites: "Favorilere Ekle",
        remove_from_favorites: "Favorilerden Kaldır",
        available_now: "Şimdi Müsait",
        rating_reviews: "puan • değerlendirme"
      },
      
      // Create Listing Form
      create_listing: {
        title: "Yeni İlan Oluştur",
        basic_info: "Temel Bilgiler",
        listing_title: "İlan Başlığı",
        description: "Açıklama",
        room_type: "Oda Tipi",
        property_type: "Mülk Tipi",
        location: "Konum",
        address: "Adres",
        city: "Şehir",
        state: "İl",
        postcode: "Posta Kodu",
        pricing: "Fiyat Bilgileri",
        weekly_rent: "Haftalık Kira",
        bond: "Depozito",
        bills_included: "Faturalar dahil mi?",
        availability: "Müsaitlik",
        available_from: "Müsait Tarih",
        min_stay: "Minimum Kalış",
        max_stay: "Maksimum Kalış",
        features: "Özellikler",
        furnished: "Eşyalı",
        parking: "Otopark",
        internet: "İnternet",
        air_conditioning: "Klima",
        heating: "Isıtma",
        washing_machine: "Çamaşır Makinesi",
        dishwasher: "Bulaşık Makinesi",
        balcony: "Balkon",
        garden: "Bahçe",
        gym: "Spor Salonu",
        pool: "Havuz",
        images: "Görseller",
        upload_images: "Görsel Yükle",
        max_images: "Maksimum 10 görsel yükleyebilirsiniz",
        property_images: "Mülk Görselleri",
        drop_images_here: "Görselleri buraya sürükleyin veya düğmeyle yükleyin",
        file_size_limit: "PNG, JPG veya WebP, maksimum {{maxMB}}MB",
        choose_images: "Fotoğraf Seç",
        uploaded_images: "Yüklenen Görseller",
        primary_image: "Ana Görsel",
        first_image_info: "İlk görsel ana görsel olarak kullanılacaktır. Herhangi bir görseli ana yapmak için yıldız simgesine tıklayın.",
        roommate_preferences: "Ev Arkadaşı Tercihleri",
        age_range: "Yaş Aralığı",
        gender_preference: "Cinsiyet Tercihi",
        smoking: "Sigara",
        pets: "Evcil Hayvan",
        occupation: "Meslek",
        lifestyle: "Yaşam Tarzı",
        create_button: "İlan Oluştur",
        cancel: "İptal"
      },
      
      // Profile
      profile: {
        title: "Profilim",
        personal_info: "Kişisel Bilgiler",
        first_name: "Ad",
        last_name: "Soyad",
        email: "E-posta",
        phone: "Telefon",
        age: "Yaş",
        occupation: "Meslek",
        bio: "Hakkımda",
        preferences: "Tercihlerim",
        smoking: "Sigara",
        pets: "Evcil Hayvan",
        cleanliness: "Temizlik",
        social_level: "Sosyallik",
        work_schedule: "Çalışma Saatleri",
        gender_preference: "Cinsiyet Tercihi",
        my_listings: "İlanlarım",
        favorites: "Favorilerim",
        messages: "Mesajlarım",
        save_changes: "Değişiklikleri Kaydet"
      },
      
      // Messages
      messages: {
        title: "Mesajlar",
        conversations: "Konuşmalar",
        new_message: "Yeni Mesaj",
        type_message: "Mesajınızı yazın...",
        send: "Gönder",
        no_messages: "Henüz mesajınız yok",
        start_conversation: "Konuşma başlat"
      },
      
      // Authentication
      auth: {
        welcome: "Hoş Geldiniz",
        sign_in: "Giriş Yapın",
        sign_out: "Çıkış Yap",
        get_started: "Başla",
        login: "Giriş Yap",
        sign_up: "Üye Ol",
        logout: "Çıkış Yap",
        email: "E-posta",
        password: "Şifre",
        confirm_password: "Şifre Tekrar",
        first_name: "Ad",
        last_name: "Soyad",
        login_description: "Hesabınıza giriş yapın",
        register_description: "Yeni hesap oluşturun",
        no_account: "Hesabınız yok mu?",
        already_have_account: "Zaten hesabınız var mı?",
        login_success: "Giriş Başarılı",
        welcome_back: "Tekrar hoş geldiniz!",
        login_failed: "Giriş Başarısız",
        invalid_credentials: "Geçersiz e-posta veya şifre",
        registration_success: "Kayıt Başarılı",
        registration_failed: "Kayıt Başarısız",
        registration_error: "Kayıt işlemi sırasında bir hata oluştu",
        password_mismatch: "Şifreler Uyuşmuyor",
        password_mismatch_description: "Girdiğiniz şifreler eşleşmiyor",
        password_too_short: "Şifre Çok Kısa",
        password_min_length: "Şifre en az 8 karakter olmalıdır",
        password_requirements: "En az 8 karakter olmalıdır",
        logging_in: "Giriş yapılıyor...",
        registering: "Kaydediliyor..."
      },
      
      // Features Section
      features: {
        title: "Neden Odanet?",
        subtitle: "Güvenliğiniz için doğrulanmış ve güvenli bağlantılar",
        verified_profiles: {
          title: "Doğrulanmış Profiller",
          description: "Tüm kullanıcılar güvenliğiniz için kimlik doğrulamasından geçer"
        },
        smart_matching: {
          title: "Akıllı Eşleştirme",
          description: "Yaşam tarzı tercihleri ve alışkanlıklarınıza göre uyumlu ev arkadaşları bulun"
        },
        secure_messaging: {
          title: "Güvenli Mesajlaşma",
          description: "Uygulama içi mesajlaşma sistemimiz aracılığıyla güvenle bağlantı kurun"
        }
      },
      
      // CTA Section
      cta: {
        title: "Eşinizi Bulmaya Hazır mısınız?",
        subtitle: "Mükemmel ev arkadaşlarını bulan binlerce doğrulanmış kullanıcıya katılın",
        looking_for_room: "Oda mu Arıyorsunuz?",
        browse_verified_listings: "Doğrulanmış ilanları inceleyin ve uyumlu ev arkadaşlarıyla bağlantı kurun",
        start_searching: "Aramaya Başla",
        have_room: "Odanız var mı?",
        list_your_space: "Alanınızı listeleyin ve mükemmel ev arkadaşı eşleşmesi bulun",
        list_your_room: "Odanızı İlan Verin"
      },
      
      // Footer Section
      footer: {
        description: "Güvenli, güvenilir ortak konaklama için insanları birbirine bağlar.",
        platform: "Platform",
        support: "Destek",
        legal: "Yasal",
        all_rights_reserved: "Tüm hakları saklıdır.",
        available_on: "Şurada mevcut:",
        links: {
          browse_rooms: "Oda Ara",
          list_room: "Oda İlan Ver",
          how_it_works: "Nasıl Çalışır",
          safety_tips: "Güvenlik İpuçları",
          help_center: "Yardım Merkezi",
          contact_us: "Bize Ulaşın",
          report_issue: "Sorun Bildir",
          verification: "Doğrulama",
          privacy_policy: "Gizlilik Politikası",
          terms_of_service: "Hizmet Şartları",
          cookie_policy: "Çerez Politikası",
          community_guidelines: "Topluluk Kuralları"
        }
      },
      
      // Common
      common: {
        loading: "Yükleniyor...",
        save: "Kaydet",
        cancel: "İptal",
        edit: "Düzenle",
        delete: "Sil",
        confirm: "Onayla",
        yes: "Evet",
        no: "Hayır",
        close: "Kapat",
        next: "İleri",
        previous: "Geri",
        search: "Ara",
        filter: "Filtrele",
        sort: "Sırala",
        view_all: "Hepsini Gör",
        show_more: "Daha Fazla Göster",
        show_less: "Daha Az Göster",
        user: "Kullanıcı",
        not_provided: "Belirtilmemiş",
        unverified: "Doğrulanmamış",
        select_preference: "Tercih seçin",
        select_level: "Seviye seçin",
        select_schedule: "Program seçin",
        yesterday: "Dün"
      },
      
      // Options
      options: {
        smoking: {
          "non-smoker": "Sigara içmeyen",
          "smoker": "Sigara içen",
          "social-smoker": "Sosyal içici",
          "no-preference": "Fark etmez"
        },
        pets: {
          "no-pets": "Evcil hayvan yok",
          "cat-friendly": "Kedi dostu",
          "dog-friendly": "Köpek dostu", 
          "all-pets": "Tüm evcil hayvanlar"
        },
        cleanliness: {
          "very-clean": "Çok temiz",
          "clean": "Temiz",
          "average": "Ortalama",
          "relaxed": "Rahat"
        },
        social_level: {
          "very-social": "Çok sosyal",
          "social": "Sosyal",
          "balanced": "Dengeli",
          "quiet": "Sessiz"
        },
        work_schedule: {
          "9-to-5": "9-5 mesaisi",
          "shift-work": "Vardiya",
          "student": "Öğrenci",
          "work-from-home": "Evden çalışan",
          "unemployed": "Çalışmıyor"
        },
        gender_preference: {
          "male": "Sadece erkek",
          "female": "Sadece kadın",
          "no-preference": "Fark etmez"
        },
        states: {
          "NSW": "Yeni Güney Galler",
          "VIC": "Victoria", 
          "QLD": "Queensland",
          "WA": "Batı Avustralya",
          "SA": "Güney Avustralya",
          "TAS": "Tazmanya",
          "ACT": "Avustralya Başkent Bölgesi",
          "NT": "Kuzey Bölgesi"
        }
      },
      
      // Error Messages
      errors: {
        page_not_found: "404 Sayfa Bulunamadı",
        page_not_found_description: "Aradığınız sayfa mevcut değil.",
        required: "Bu alan zorunludur",
        invalid_email: "Geçerli bir e-posta adresi giriniz",
        min_length: "En az {{count}} karakter olmalıdır",
        max_length: "En fazla {{count}} karakter olmalıdır",
        invalid_phone: "Geçerli bir telefon numarası giriniz",
        invalid_number: "Geçerli bir sayı giriniz",
        network_error: "Ağ hatası, lütfen tekrar deneyiniz",
        unauthorized: "Bu işlem için yetkiniz bulunmuyor",
        not_found: "Sayfa bulunamadı",
        server_error: "Sunucu hatası, lütfen daha sonra tekrar deneyiniz",
        unauthorized_description: "Oturumunuz kapandı. Tekrar giriş yapılıyor...",
        favorite_update_failed: "Favoriler güncellenemedi",
        invalid_file_type: "Geçersiz dosya türü",
        invalid_file_type_description: "Lütfen {{types}} formatında resim yükleyin",
        file_too_large: "Dosya çok büyük",
        file_too_large_description: "Lütfen {{maxMB}}MB'dan küçük resimler yükleyin",
        too_many_images: "Çok fazla resim",
        too_many_images_description: "Maksimum {{max}} resim yükleyebilirsiniz",
        failed_to_update_preferences: "Tercihler güncellenemedi. Lütfen tekrar deneyin."
      },
      
      // Success Messages
      success: {
        listing_created: "İlan başarıyla oluşturuldu",
        listing_updated: "İlan başarıyla güncellendi",
        listing_deleted: "İlan başarıyla silindi",
        profile_updated: "Profil başarıyla güncellendi",
        message_sent: "Mesaj gönderildi",
        favorite_added: "Favorilere eklendi",
        favorite_removed: "Favorilerden kaldırıldı",
        favorite_added_description: "İlan favorilerinize eklendi",
        favorite_removed_description: "İlan favorilerinizden kaldırıldı",
        removed_from_favorites: "Favorilerden kaldırıldı",
        added_to_favorites: "Favorilere eklendi",
        listing_removed_from_favorites: "İlan favorilerinizden kaldırıldı",
        listing_added_to_favorites: "İlan favorilerinize eklendi"
      }
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    lng: 'tr', // Set Turkish as default language
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;