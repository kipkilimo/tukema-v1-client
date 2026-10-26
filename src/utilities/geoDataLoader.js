// utils/geoDataLoader.js
export const loadKenyanGeoData = async () => {
  const data =
    await import("@/assets/data/Kenya_counties_subcounties_constituencies_wards.json");
  return data.default || data;
};

export const extractCounties = (data) => {
  const counties = [];
  const seen = new Set();

  if (data && Array.isArray(data)) {
    data.forEach((item) => {
      if (!seen.has(item.county_code)) {
        seen.add(item.county_code);
        counties.push({
          id: item.county_code,
          name: item.county,
          code: item.county_code,
        });
      }
    });
  }
  return counties;
};

export const extractSubCounties = (data, countyCode) => {
  const subCounties = [];
  const seen = new Set();

  if (data && Array.isArray(data)) {
    data.forEach((item) => {
      if (item.county_code === countyCode && !seen.has(item.sub_county_code)) {
        seen.add(item.sub_county_code);
        subCounties.push({
          id: item.sub_county_code,
          name: item.sub_county,
          code: item.sub_county_code,
          countyId: item.county_code,
          countyName: item.county,
        });
      }
    });
  }
  return subCounties;
};

// Skip constituencies - go directly to wards
export const extractWards = (data, subCountyCode) => {
  const wards = [];
  const seen = new Set();

  if (data && Array.isArray(data)) {
    data.forEach((item) => {
      if (item.sub_county_code === subCountyCode && !seen.has(item.ward_code)) {
        seen.add(item.ward_code);
        wards.push({
          id: item.ward_code,
          name: item.ward,
          code: item.ward_code,
          subCountyId: item.sub_county_code,
          subCountyName: item.sub_county,
          countyId: item.county_code,
          countyName: item.county,
        });
      }
    });
  }
  return wards;
};

// Get EOC centers for a location
export const getEOCsForLocation = (eocs, level, identifier) => {
  switch (level) {
    case "county":
      return eocs.filter((eoc) => eoc.county === identifier);
    case "subcounty":
      return eocs.filter((eoc) => eoc.subCounty === identifier);
    case "ward":
      return eocs.filter((eoc) => eoc.ward === identifier);
    default:
      return [];
  }
};
