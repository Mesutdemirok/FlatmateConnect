export interface Location {
  name: string;
  slug: string;
  districts?: District[];
}

export interface District {
  name: string;
  slug: string;
  neighborhoods?: Neighborhood[];
}

export interface Neighborhood {
  name: string;
  slug: string;
}

export function normalizeTurkish(str: string): string {
  return str
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/[^a-z0-9]/g, '');
}

export function generateSlug(name: string): string {
  return normalizeTurkish(name);
}

export const turkeyLocations: Location[] = [
  {
    name: "İstanbul",
    slug: "istanbul",
    districts: [
      { name: "Adalar", slug: "adalar" },
      { name: "Arnavutköy", slug: "arnavutkoy" },
      { name: "Ataşehir", slug: "atasehir" },
      { name: "Avcılar", slug: "avcilar" },
      { name: "Bağcılar", slug: "bagcilar" },
      { name: "Bahçelievler", slug: "bahcelievler" },
      { name: "Bakırköy", slug: "bakirkoy" },
      { name: "Başakşehir", slug: "basaksehir" },
      { name: "Bayrampaşa", slug: "bayrampasa" },
      { name: "Beşiktaş", slug: "besiktas" },
      { name: "Beykoz", slug: "beykoz" },
      { name: "Beylikdüzü", slug: "beylikduzu" },
      { name: "Beyoğlu", slug: "beyoglu" },
      { name: "Büyükçekmece", slug: "buyukcekmece" },
      { name: "Çatalca", slug: "catalca" },
      { name: "Çekmeköy", slug: "cekmekoy" },
      { name: "Esenler", slug: "esenler" },
      { name: "Esenyurt", slug: "esenyurt" },
      { name: "Eyüpsultan", slug: "eyupsultan" },
      { name: "Fatih", slug: "fatih" },
      { name: "Gaziosmanpaşa", slug: "gaziosmanpasa" },
      { name: "Güngören", slug: "gungoren" },
      { name: "Kadıköy", slug: "kadikoy" },
      { name: "Kağıthane", slug: "kagithane" },
      { name: "Kartal", slug: "kartal" },
      { name: "Küçükçekmece", slug: "kucukcekmece" },
      { name: "Maltepe", slug: "maltepe" },
      { name: "Pendik", slug: "pendik" },
      { name: "Sancaktepe", slug: "sancaktepe" },
      { name: "Sarıyer", slug: "sariyer" },
      { name: "Silivri", slug: "silivri" },
      { name: "Sultanbeyli", slug: "sultanbeyli" },
      { name: "Sultangazi", slug: "sultangazi" },
      { name: "Şile", slug: "sile" },
      { name: "Şişli", slug: "sisli" },
      { name: "Tuzla", slug: "tuzla" },
      { name: "Ümraniye", slug: "umraniye" },
      { name: "Üsküdar", slug: "uskudar" },
      { name: "Zeytinburnu", slug: "zeytinburnu" }
    ]
  },
  {
    name: "Ankara",
    slug: "ankara",
    districts: [
      { name: "Altındağ", slug: "altindag" },
      { name: "Çankaya", slug: "cankaya" },
      { name: "Keçiören", slug: "kecioren" },
      { name: "Mamak", slug: "mamak" },
      { name: "Sincan", slug: "sincan" },
      { name: "Yenimahalle", slug: "yenimahalle" },
      { name: "Etimesgut", slug: "etimesgut" },
      { name: "Gölbaşı", slug: "golbasi" },
      { name: "Pursaklar", slug: "pursaklar" }
    ]
  },
  {
    name: "İzmir",
    slug: "izmir",
    districts: [
      { name: "Konak", slug: "konak" },
      { name: "Karşıyaka", slug: "karsiyaka" },
      { name: "Bornova", slug: "bornova" },
      { name: "Buca", slug: "buca" },
      { name: "Çiğli", slug: "cigli" },
      { name: "Gaziemir", slug: "gaziemir" },
      { name: "Balçova", slug: "balcova" },
      { name: "Bayraklı", slug: "bayrakli" },
      { name: "Narlıdere", slug: "narlidere" }
    ]
  },
  {
    name: "Antalya",
    slug: "antalya",
    districts: [
      { name: "Muratpaşa", slug: "muratpasa" },
      { name: "Kepez", slug: "kepez" },
      { name: "Konyaaltı", slug: "konyaalti" },
      { name: "Aksu", slug: "aksu" },
      { name: "Döşemealtı", slug: "dosemealti" },
      { name: "Alanya", slug: "alanya" },
      { name: "Manavgat", slug: "manavgat" },
      { name: "Serik", slug: "serik" }
    ]
  },
  {
    name: "Bursa",
    slug: "bursa",
    districts: [
      { name: "Osmangazi", slug: "osmangazi" },
      { name: "Nilüfer", slug: "nilufer" },
      { name: "Yıldırım", slug: "yildirim" },
      { name: "Mudanya", slug: "mudanya" },
      { name: "Gemlik", slug: "gemlik" }
    ]
  },
  {
    name: "Adana",
    slug: "adana",
    districts: [
      { name: "Seyhan", slug: "seyhan" },
      { name: "Çukurova", slug: "cukurova" },
      { name: "Sarıçam", slug: "saricam" },
      { name: "Yüreğir", slug: "yuregir" }
    ]
  },
  { name: "Gaziantep", slug: "gaziantep", districts: [] },
  { name: "Konya", slug: "konya", districts: [] },
  { name: "Mersin", slug: "mersin", districts: [] },
  { name: "Diyarbakır", slug: "diyarbakir", districts: [] },
  { name: "Kayseri", slug: "kayseri", districts: [] },
  { name: "Eskişehir", slug: "eskisehir", districts: [] },
  { name: "Samsun", slug: "samsun", districts: [] },
  { name: "Denizli", slug: "denizli", districts: [] },
  { name: "Şanlıurfa", slug: "sanliurfa", districts: [] }
];

export function findLocationBySlug(citySlug: string): Location | undefined {
  return turkeyLocations.find(loc => loc.slug === citySlug);
}

export function findDistrictBySlug(citySlug: string, districtSlug: string): District | undefined {
  const city = findLocationBySlug(citySlug);
  return city?.districts?.find(dist => dist.slug === districtSlug);
}

export function searchLocations(query: string): Array<{type: 'city' | 'district', city: string, district?: string, slug: string}> {
  const normalized = normalizeTurkish(query);
  const results: Array<{type: 'city' | 'district', city: string, district?: string, slug: string}> = [];
  
  turkeyLocations.forEach(city => {
    if (city.slug.includes(normalized) || city.name.toLowerCase().includes(query.toLowerCase())) {
      results.push({ type: 'city', city: city.name, slug: city.slug });
    }
    
    city.districts?.forEach(district => {
      if (district.slug.includes(normalized) || district.name.toLowerCase().includes(query.toLowerCase())) {
        results.push({ 
          type: 'district', 
          city: city.name, 
          district: district.name, 
          slug: `${city.slug}/${district.slug}` 
        });
      }
    });
  });
  
  return results.slice(0, 10);
}
