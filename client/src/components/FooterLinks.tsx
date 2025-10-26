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
      { label: "Yardım Merkezi", href: "/yardim" },
      { label: "Güvenli İlan Rehberi", href: "/guvenli-ilan" },
    ],
  },
];

export const SOCIAL_LINKS = [
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
    name: "X",
    href: "https://x.com/odanet_com_tr",
    ariaLabel: "X'te Odanet",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/odanet/",
    ariaLabel: "LinkedIn'de Odanet",
  },
];
