// ODANET Revizyon — Adres Snippet Yardımcısı
// İlk N kelimeyi alarak kısa adres özeti oluşturur

export function getAddressSnippet(addr: string | null | undefined, words = 3): string {
  if (!addr) return "";
  return addr.trim().split(/\s+/).slice(0, words).join(" ");
}
