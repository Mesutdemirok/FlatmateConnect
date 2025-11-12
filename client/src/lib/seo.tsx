// src/lib/seo.ts
export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

const BASE_URL = "https://www.odanet.com.tr";
const DEFAULT_TITLE = "Odanet – Güvenli, kolay ve şeffaf oda & ev arkadaşı bul";
const DEFAULT_DESC =
  "Doğrulanmış profiller ve gerçek ilanlarla sana en uygun oda ya da ev arkadaşını hemen bul.";
const DEFAULT_IMAGE = `${BASE_URL}/og/og-home.jpg`;

export const getSEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  path = "/",
}: SEOProps) => {
  const url = `${BASE_URL}${path}`;
  return { title, description, image, url };
};
