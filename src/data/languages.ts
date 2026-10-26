// Define the interface for a language
interface Language {
  number: number;
  name: string;
  speakers_million: number;
  trends: string;
  isUNLanguage: boolean;
}
// Define the interface for a region
interface Region {
  countries: string[];
  languages: Language[];
}
// Define the interface for the entire data structure
interface WorldRegions {
  [region: string]: Region;
}
// Export the default data object
const worldRegions: WorldRegions = {
  "North Africa": {
    countries: ["Egypt", "Morocco", "Algeria", "Tunisia", "Libya"],
    languages: [
      {
        number: 1,
        isUNLanguage: true,
        name: "Arabic",
        speakers_million: 100,
        trends: "Stable with growth in modern usage and digital communication.",
      },
      {
        number: 2,
        isUNLanguage: false,
        name: "Berber (Tamazight)",
        speakers_million: 30,
        trends: "Increasing due to cultural revitalization.",
      },
      {
        number: 3,
        isUNLanguage: false,
        name: "Hassaniya Arabic",
        speakers_million: 3,
        trends: "Stable in Mauritania and parts of Western Sahara.",
      },
    ],
  },
  "West Africa": {
    countries: ["Nigeria", "Ghana", "Senegal", "Ivory Coast", "Mali"],
    languages: [
      {
        number: 1,
        isUNLanguage: false,
        name: "Hausa",
        speakers_million: 70,
        trends: "Growing as a lingua franca in the region.",
      },
      {
        number: 2,
        isUNLanguage: false,
        name: "Yoruba",
        speakers_million: 45,
        trends: "Cultural and educational resurgence.",
      },
      {
        number: 3,
        isUNLanguage: false,
        name: "Igbo",
        speakers_million: 44,
        trends: "Steady, with increased global diaspora usage.",
      },
      {
        number: 4,
        isUNLanguage: false,
        name: "Fula (Fulani, Fulfulde)",
        speakers_million: 40,
        trends: "Stable, used widely among nomadic communities.",
      },
      {
        number: 5,
        isUNLanguage: false,
        name: "Akan",
        speakers_million: 30,
        trends: "Increasing due to educational and cultural efforts.",
      },
      {
        number: 6,
        isUNLanguage: false,
        name: "Wolof",
        speakers_million: 10,
        trends: "Rising, especially in Senegal's urban areas.",
      },
    ],
  },
  "East Africa": {
    countries: ["Kenya", "Tanzania", "Uganda", "Ethiopia", "Somalia"],
    languages: [
      {
        number: 1,
        isUNLanguage: false,
        name: "Swahili",
        speakers_million: 80,
        trends:
          "Rapid growth due to official language status in multiple countries.",
      },
      {
        number: 2,
        isUNLanguage: false,
        name: "Amharic",
        speakers_million: 35,
        trends: "Stable, used in government and media.",
      },
      {
        number: 3,
        isUNLanguage: false,
        name: "Oromo",
        speakers_million: 35,
        trends: "Increasing visibility and cultural promotion.",
      },
      {
        number: 4,
        isUNLanguage: false,
        name: "Somali",
        speakers_million: 20,
        trends: "Stable, with significant diaspora influence.",
      },
      {
        number: 5,
        isUNLanguage: false,
        name: "Tigrinya",
        speakers_million: 7,
        trends: "Stable with diaspora growth.",
      },
      {
        number: 6,
        isUNLanguage: false,
        name: "Kisii",
        speakers_million: 5,
        trends: "Moderate growth in local contexts.",
      },
    ],
  },
  "Central Africa": {
    countries: [
      "Democratic Republic of the Congo",
      "Central African Republic",
      "Cameroon",
      "Gabon",
      "Equatorial Guinea",
    ],
    languages: [
      {
        number: 1,
        isUNLanguage: false,
        name: "Lingala",
        speakers_million: 15,
        trends: "Increasing in urban areas and media.",
      },
      {
        number: 2,
        isUNLanguage: false,
        name: "Kongo",
        speakers_million: 7,
        trends: "Stable with cultural significance.",
      },
      {
        number: 3,
        isUNLanguage: false,
        name: "Sango",
        speakers_million: 5,
        trends: "Stable as a lingua franca in the Central African Republic.",
      },
    ],
  },
  "Southern Africa": {
    countries: ["South Africa", "Zimbabwe", "Namibia", "Lesotho", "Swaziland"],
    languages: [
      {
        number: 1,
        isUNLanguage: false,
        name: "Zulu",
        speakers_million: 12,
        trends: "Increasing due to cultural pride and media.",
      },
      {
        number: 2,
        isUNLanguage: false,
        name: "Xhosa",
        speakers_million: 10,
        trends: "Stable with slight growth in urban areas.",
      },
      {
        number: 3,
        isUNLanguage: false,
        name: "Shona",
        speakers_million: 15,
        trends: "Stable, predominant in Zimbabwe.",
      },
      {
        number: 4,
        isUNLanguage: false,
        name: "Sesotho",
        speakers_million: 7,
        trends: "Stable with regional significance.",
      },
    ],
  },
  Global: {
    countries: [
      "Asia",
      "Europe",
      "Latin America and the Caribbean",
      "Northern America",
      "Oceania",
    ],
    languages: [
      {
        number: 1,
        isUNLanguage: true,
        name: "Mandarin Chinese",
        speakers_million: 1200,
        trends: "Rapid growth due to economic expansion in China.",
      },
      {
        number: 2,
        isUNLanguage: true,
        name: "Spanish",
        speakers_million: 580,
        trends: "Increasing globally, especially in the Americas and Spain.",
      },
      {
        number: 3,
        isUNLanguage: true,
        name: "English",
        speakers_million: 1500,
        trends: "Dominant in business, technology, and global communication.",
      },
      {
        number: 4,
        isUNLanguage: false,
        name: "Hindi",
        speakers_million: 600,
        trends: "Growing due to India's expanding influence.",
      },
      {
        number: 5,
        isUNLanguage: true,
        name: "Arabic",
        speakers_million: 310,
        trends:
          "Stable with significant use in the Middle East and North Africa.",
      },
      {
        number: 6,
        isUNLanguage: false,
        name: "Bengali",
        speakers_million: 230,
        trends:
          "Growing in South Asia, particularly in Bangladesh and parts of India.",
      },
      {
        number: 7,
        isUNLanguage: false,
        name: "Portuguese",
        speakers_million: 220,
        trends: "Growing due to influence in Brazil and Portugal.",
      },
      {
        number: 8,
        isUNLanguage: true,
        name: "Russian",
        speakers_million: 260,
        trends:
          "Stable with regional influence in Eastern Europe and Central Asia.",
      },
      {
        number: 9,
        isUNLanguage: false,
        name: "Japanese",
        speakers_million: 125,
        trends: "Stable with significant cultural and technological influence.",
      },
      {
        number: 10,
        isUNLanguage: false,
        name: "German",
        speakers_million: 76,
        trends:
          "Stable with strong presence in Europe, particularly in Germany and Austria.",
      },
      {
        number: 11,
        isUNLanguage: true,
        name: "French",
        speakers_million: 300,
        trends:
          "Stable with growing influence in international organizations and diplomacy.",
      },
      {
        number: 12,
        isUNLanguage: false,
        name: "Korean",
        speakers_million: 77,
        trends: "Growing with increased global interest in Korean culture.",
      },
      {
        number: 13,
        isUNLanguage: false,
        name: "Vietnamese",
        speakers_million: 86,
        trends: "Growing due to economic development in Vietnam.",
      },
      {
        number: 14,
        isUNLanguage: false,
        name: "Turkish",
        speakers_million: 85,
        trends: "Growing with increasing geopolitical influence.",
      },
      {
        number: 15,
        isUNLanguage: false,
        name: "Italian",
        speakers_million: 64,
        trends: "Stable with historical significance and cultural influence.",
      },
      {
        number: 16,
        isUNLanguage: false,
        name: "Thai",
        speakers_million: 70,
        trends: "Growing with increased global engagement.",
      },
      {
        number: 17,
        isUNLanguage: false,
        name: "Polish",
        speakers_million: 45,
        trends: "Stable with a growing diaspora in Europe and North America.",
      },
      {
        number: 18,
        isUNLanguage: false,
        name: "Swedish",
        speakers_million: 10,
        trends:
          "Stable with influence in Scandinavia and some international contexts.",
      },
      {
        number: 19,
        isUNLanguage: false,
        name: "Danish",
        speakers_million: 6,
        trends:
          "Stable with influence primarily in Denmark and parts of Greenland.",
      },
      {
        number: 20,
        isUNLanguage: false,
        name: "Dutch",
        speakers_million: 24,
        trends:
          "Stable with influence in the Netherlands and parts of Belgium.",
      },
    ],
  },
};

export default worldRegions;
