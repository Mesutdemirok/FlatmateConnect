// Footer navigation links organized by category

export type FooterLinkCategory = {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
};

export const FOOTER_LINKS: FooterLinkCategory[] = [
  {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "İletişim", href: "/iletisim" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
      { label: "İlan Yayınlama Kuralları", href: "/ilan-yayinlama-kurallari" },
      { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
      { label: "Çerez Politikası", href: "/cerez-politikasi" },
    ],
  },
  {
    title: "Destek",
    links: [
      { label: "Yardım Merkezi", href: "/yardim-merkezi" },
      { label: "Güvenli İlan Rehberi", href: "/guvenli-ilan-rehberi" },
    ],
  },
];

export const SOCIAL_LINKS = [
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@odanet.com.tr",
    ariaLabel: "TikTok'ta Odanet",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/odanet.com.tr/",
    ariaLabel: "Facebook'ta Odanet",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/odanet.com.tr/",
    ariaLabel: "Instagram'da Odanet",
  },
  {
    name: "Pinterest",
    href: "https://www.pinterest.com/odanet_/",
    ariaLabel: "Pinterest'te Odanet",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@odanet_com_tr",
    ariaLabel: "YouTube'da Odanet",
  },
];
