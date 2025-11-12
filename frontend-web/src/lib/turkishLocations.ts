import {
  getCities as getTurkeyCities,
  getDistrictsByCityCode,
  getNeighbourhoodsByCityCodeAndDistrict,
  cityCodes,
  cityNames,
} from "turkey-neighbourhoods";

export interface City {
  code: string;
  name: string;
}

export function getCities(): City[] {
  const codes = cityCodes();
  const names = cityNames();

  return codes
    .map((code, index) => ({
      code,
      name: names[index],
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

function getCityCodeByName(cityName: string): string | null {
  const cities = getCities();
  const city = cities.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase(),
  );
  return city?.code || null;
}

export function getDistricts(cityName: string): string[] {
  const cityCode = getCityCodeByName(cityName);
  if (!cityCode) return [];

  const districts = getDistrictsByCityCode(cityCode);
  return Object.keys(districts).sort((a, b) => a.localeCompare(b, "tr"));
}

export function getNeighborhoods(
  cityName: string,
  districtName: string,
): string[] {
  const cityCode = getCityCodeByName(cityName);
  if (!cityCode) return [];

  const neighborhoods = getNeighbourhoodsByCityCodeAndDistrict(
    cityCode,
    districtName,
  );
  return neighborhoods.sort((a, b) => a.localeCompare(b, "tr"));
}

export function validateLocation(
  city: string,
  district?: string,
  neighborhood?: string,
): boolean {
  const cities = getCities();
  const cityExists = cities.some(
    (c) => c.name.toLowerCase() === city.toLowerCase(),
  );

  if (!cityExists) return false;
  if (!district) return true;

  const districts = getDistricts(city);
  const districtExists = districts.some(
    (d) => d.toLowerCase() === district.toLowerCase(),
  );

  if (!districtExists) return false;
  if (!neighborhood) return true;

  const neighborhoods = getNeighborhoods(city, district);
  return neighborhoods.some(
    (n) => n.toLowerCase() === neighborhood.toLowerCase(),
  );
}
