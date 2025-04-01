import * as d3 from "d3";
import { worldBankAPI } from "./axiosInstance";

// Define the data types
export type WorldBankData = {
  Rank: number;
  Name: string;
  Symbol: string;
  marketcap: number;
  price: number;
  country: string;
};

export type CountryInfo = {
  code: string;
  name: string;
};

// Available indicators with their codes
export const indicators = {
  "GDP (current US$)": "NY.GDP.MKTP.CD",
  "Population, total": "SP.POP.TOTL",
  "CO2 emissions (metric tons per capita)": "EN.ATM.CO2E.PC",
  "Foreign direct investment": "BX.KLT.DINV.CD.WD",
  "Unemployment rate": "SL.UEM.TOTL.ZS",
};

export type IndicatorKey = keyof typeof indicators;

// List of major countries to fetch data for
export const majorCountries: CountryInfo[] = [
  { code: "US", name: "United States" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
];

// Years available for selection
export const availableYears = ["2020", "2019", "2018", "2017", "2016"];

// Fetch World Bank data for multiple countries
export const fetchWorldBankData = async (
  countries: CountryInfo[],
  indicator: string,
  year: string
): Promise<WorldBankData[]> => {
  try {
    // Fetch data for each country
    const countriesData = await Promise.all(
      countries.map(async (country, index) => {
        try {
          const response = await worldBankAPI.getIndicator(
            country.code,
            indicator,
            year
          );

          // World Bank API returns an array where [0] is metadata and [1] is data
          if (
            response.data &&
            response.data[1] &&
            response.data[1].length > 0
          ) {
            const countryData = response.data[1][0];
            return {
              Rank: index + 1,
              Name: country.name,
              Symbol: country.code,
              marketcap: countryData.value || 0,
              price: countryData.value || 0,
              country: country.name,
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching data for ${country.name}:`, err);
          return null;
        }
      })
    );

    // Filter out null values and sort by value descending
    return countriesData
      .filter((item): item is WorldBankData => item !== null)
      .sort((a, b) => b.marketcap - a.marketcap);
  } catch (error) {
    console.error("Error in fetchWorldBankData:", error);
    throw error;
  }
};

// Format large numbers for display
export const formatNumber = (num: number): string => {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toFixed(0);
};

// Create tooltip for chart
export const createWorldBankTooltip = () => {
  return d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "#1f2937")
    .style("border", "1px solid #374151")
    .style("border-radius", "0.375rem")
    .style("padding", "0.75rem")
    .style("color", "#f3f4f6")
    .style("font-size", "0.875rem")
    .style("pointer-events", "none")
    .style("z-index", "10");
};
