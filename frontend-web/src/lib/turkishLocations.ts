import turkeyData from 'turkey-neighbourhoods/data/core/index.json';

export interface City {
  code: string;
  name: string;
}

export interface District {
  name: string;
  neighborhoods: string[];
}

export interface CityData {
  name: string;
  districts: Record<string, District>;
}

const typedTurkeyData = turkeyData as Record<string, CityData>;

export function getCities(): City[] {
  return Object.entries(typedTurkeyData)
    .map(([code, data]) => ({
      code,
      name: data.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

export function getDistricts(cityName: string): string[] {
  const cityEntry = Object.values(typedTurkeyData).find(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );

  if (!cityEntry) return [];

  return Object.keys(cityEntry.districts).sort((a, b) =>
    a.localeCompare(b, 'tr')
  );
}

export function getNeighborhoods(cityName: string, districtName: string): string[] {
  const cityEntry = Object.values(typedTurkeyData).find(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );

  if (!cityEntry) return [];

  const district = Object.entries(cityEntry.districts).find(
    ([name]) => name.toLowerCase() === districtName.toLowerCase()
  );

  if (!district) return [];

  return district[1].neighborhoods.sort((a, b) => a.localeCompare(b, 'tr'));
}

export function validateLocation(
  city: string,
  district?: string,
  neighborhood?: string
): boolean {
  const cities = getCities();
  const cityExists = cities.some(
    (c) => c.name.toLowerCase() === city.toLowerCase()
  );

  if (!cityExists) return false;
  if (!district) return true;

  const districts = getDistricts(city);
  const districtExists = districts.some(
    (d) => d.toLowerCase() === district.toLowerCase()
  );

  if (!districtExists) return false;
  if (!neighborhood) return true;

  const neighborhoods = getNeighborhoods(city, district);
  return neighborhoods.some(
    (n) => n.toLowerCase() === neighborhood.toLowerCase()
  );
}
