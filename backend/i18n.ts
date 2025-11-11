// Turkish localization for backend error messages

export interface ErrorMessages {
  // Authentication errors
  unauthorized: string;
  invalid_credentials: string;
  session_expired: string;
  
  // Validation errors
  required_field: string;
  invalid_email: string;
  invalid_phone: string;
  invalid_date: string;
  invalid_number: string;
  min_length: string;
  max_length: string;
  
  // Database errors
  database_error: string;
  not_found: string;
  duplicate_entry: string;
  
  // Listing errors
  listing_not_found: string;
  listing_creation_failed: string;
  listing_update_failed: string;
  listing_delete_failed: string;
  
  // User errors
  user_not_found: string;
  profile_update_failed: string;
  
  // Message errors
  message_send_failed: string;
  conversation_not_found: string;
  
  // File upload errors
  file_too_large: string;
  invalid_file_type: string;
  upload_failed: string;
  
  // General errors
  internal_server_error: string;
  bad_request: string;
}

export const turkishErrors: ErrorMessages = {
  // Authentication errors
  unauthorized: "Bu işlem için yetkiniz bulunmuyor",
  invalid_credentials: "Geçersiz giriş bilgileri",
  session_expired: "Oturumunuzin süresi dolmuş",
  
  // Validation errors
  required_field: "Bu alan zorunludur",
  invalid_email: "Geçerli bir e-posta adresi giriniz",
  invalid_phone: "Geçerli bir telefon numarası giriniz", 
  invalid_date: "Geçerli bir tarih giriniz",
  invalid_number: "Geçerli bir sayı giriniz",
  min_length: "En az {{count}} karakter olmalıdır",
  max_length: "En fazla {{count}} karakter olmalıdır",
  
  // Database errors
  database_error: "Veritabanı hatası oluştu",
  not_found: "Kayıt bulunamadı",
  duplicate_entry: "Bu kayıt zaten mevcut",
  
  // Listing errors
  listing_not_found: "İlan bulunamadı",
  listing_creation_failed: "İlan oluşturulamadı",
  listing_update_failed: "İlan güncellenemedi",
  listing_delete_failed: "İlan silinemedi",
  
  // User errors
  user_not_found: "Kullanıcı bulunamadı",
  profile_update_failed: "Profil güncellenemedi",
  
  // Message errors
  message_send_failed: "Mesaj gönderilemedi",
  conversation_not_found: "Konuşma bulunamadı",
  
  // File upload errors  
  file_too_large: "Dosya çok büyük",
  invalid_file_type: "Geçersiz dosya türü",
  upload_failed: "Yükleme başarısız",
  
  // General errors
  internal_server_error: "Sunucu hatası oluştu",
  bad_request: "Geçersiz istek"
};

export function getErrorMessage(key: keyof ErrorMessages, lang: string = 'tr', params?: Record<string, any>): string {
  const messages = lang === 'tr' ? turkishErrors : turkishErrors; // Default to Turkish
  let message = messages[key] || turkishErrors.internal_server_error;
  
  // Simple parameter substitution
  if (params) {
    Object.keys(params).forEach(param => {
      message = message.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
  }
  
  return message;
}

export function detectLanguage(req: any): string {
  // Check Accept-Language header, default to Turkish
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage && acceptLanguage.includes('en')) {
    return 'en';
  }
  return 'tr'; // Default to Turkish for Turkey market
}