import { PrismaClient, ActivityType, TripStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding GlobeTrotter database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "john@globetrotter.dev" },
    update: {},
    create: {
      email: "john@globetrotter.dev",
      name: "John Traveler",
      firstName: "John",
      lastName: "Traveler",
      password: hashedPassword,
      bio: "Passionate traveler exploring the world one city at a time!",
      city: "New York",
      country: "USA",
      currency: "USD",
      image: "https://i.pravatar.cc/150?img=1",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jane@globetrotter.dev" },
    update: {},
    create: {
      email: "jane@globetrotter.dev",
      name: "Jane Explorer",
      firstName: "Jane",
      lastName: "Explorer",
      password: hashedPassword,
      bio: "Adventure seeker & food enthusiast!",
      city: "London",
      country: "UK",
      currency: "GBP",
      image: "https://i.pravatar.cc/150?img=5",
    },
  });

  console.log("✅ Users created");

  const citiesData = [
    {
      name: "Paris",
      country: "France",
      description: "The City of Light - known for its art, fashion, gastronomy, and culture.",
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: "Europe/Paris",
      currency: "EUR",
      language: "French",
      popularity: 95,
      costIndex: 130,
    },
    {
      name: "Tokyo",
      country: "Japan",
      description: "A dazzling mix of ultra-modern and traditional, from neon-lit skyscrapers to historic temples.",
      imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: "Asia/Tokyo",
      currency: "JPY",
      language: "Japanese",
      popularity: 92,
      costIndex: 145,
    },
    {
      name: "New York City",
      country: "USA",
      state: "NY",
      description: "The city that never sleeps - a global hub of culture, finance, and entertainment.",
      imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
      currency: "USD",
      language: "English",
      popularity: 98,
      costIndex: 160,
    },
    {
      name: "Rome",
      country: "Italy",
      description: "The Eternal City - ancient history meets la dolce vita.",
      imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
      latitude: 41.9028,
      longitude: 12.4964,
      timezone: "Europe/Rome",
      currency: "EUR",
      language: "Italian",
      popularity: 90,
      costIndex: 115,
    },
    {
      name: "Bali",
      country: "Indonesia",
      description: "Tropical paradise with stunning beaches, rice terraces, and rich culture.",
      imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
      latitude: -8.4095,
      longitude: 115.1889,
      timezone: "Asia/Makassar",
      currency: "IDR",
      language: "Indonesian",
      popularity: 88,
      costIndex: 55,
    },
    {
      name: "London",
      country: "UK",
      description: "Historic royal city with world-class museums, theater, and culture.",
      imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: "Europe/London",
      currency: "GBP",
      language: "English",
      popularity: 94,
      costIndex: 155,
    },
    {
      name: "Barcelona",
      country: "Spain",
      description: "Gaudí's architectural wonders meet Mediterranean beaches and vibrant nightlife.",
      imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
      latitude: 41.3851,
      longitude: 2.1734,
      timezone: "Europe/Madrid",
      currency: "EUR",
      language: "Spanish",
      popularity: 91,
      costIndex: 110,
    },
    {
      name: "Dubai",
      country: "UAE",
      description: "Futuristic city of skyscrapers, luxury shopping, and desert adventures.",
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
      latitude: 25.2048,
      longitude: 55.2708,
      timezone: "Asia/Dubai",
      currency: "AED",
      language: "Arabic",
      popularity: 89,
      costIndex: 140,
    },
    {
      name: "Bangkok",
      country: "Thailand",
      description: "Vibrant capital with ornate temples, bustling markets, and legendary street food.",
      imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
      latitude: 13.7563,
      longitude: 100.5018,
      timezone: "Asia/Bangkok",
      currency: "THB",
      language: "Thai",
      popularity: 87,
      costIndex: 50,
    },
    {
      name: "Sydney",
      country: "Australia",
      description: "Iconic harbor city with stunning beaches, world-famous opera house, and outdoor lifestyle.",
      imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800",
      latitude: -33.8688,
      longitude: 151.2093,
      timezone: "Australia/Sydney",
      currency: "AUD",
      language: "English",
      popularity: 86,
      costIndex: 140,
    },
    {
      name: "Santorini",
      country: "Greece",
      description: "Picturesque island with white-washed buildings, blue domes, and stunning sunsets.",
      imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
      latitude: 36.3932,
      longitude: 25.4615,
      timezone: "Europe/Athens",
      currency: "EUR",
      language: "Greek",
      popularity: 85,
      costIndex: 135,
    },
    {
      name: "Marrakech",
      country: "Morocco",
      description: "Exotic souks, palaces, and vibrant culture in the heart of Morocco.",
      imageUrl: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800",
      latitude: 31.6295,
      longitude: -7.9811,
      timezone: "Africa/Casablanca",
      currency: "MAD",
      language: "Arabic",
      popularity: 80,
      costIndex: 60,
    },
    {
      name: "Singapore",
      country: "Singapore",
      description: "Ultra-modern city-state blending Gardens by the Bay futurism with hawker-stall food culture.",
      imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
      latitude: 1.3521,
      longitude: 103.8198,
      timezone: "Asia/Singapore",
      currency: "SGD",
      language: "English",
      popularity: 89,
      costIndex: 135,
    },
    {
      name: "Seoul",
      country: "South Korea",
      description: "Neon-lit metropolis where centuries-old palaces sit beside K-pop culture and street food alleys.",
      imageUrl: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800",
      latitude: 37.5665,
      longitude: 126.978,
      timezone: "Asia/Seoul",
      currency: "KRW",
      language: "Korean",
      popularity: 87,
      costIndex: 95,
    },
    {
      name: "Kyoto",
      country: "Japan",
      description: "Japan's ancient capital, home to thousands of temples, geisha districts, and bamboo groves.",
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
      latitude: 35.0116,
      longitude: 135.7681,
      timezone: "Asia/Tokyo",
      currency: "JPY",
      language: "Japanese",
      popularity: 88,
      costIndex: 120,
    },
    {
      name: "Hong Kong",
      country: "Hong Kong",
      description: "Vertical harbor city famous for dim sum, skyline views, and a blend of East and West.",
      imageUrl: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800",
      latitude: 22.3193,
      longitude: 114.1694,
      timezone: "Asia/Hong_Kong",
      currency: "HKD",
      language: "Cantonese",
      popularity: 86,
      costIndex: 130,
    },
    {
      name: "Mumbai",
      country: "India",
      description: "India's financial capital — colonial architecture, Bollywood glamour, and Marine Drive sunsets.",
      imageUrl: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800",
      latitude: 19.076,
      longitude: 72.8777,
      timezone: "Asia/Kolkata",
      currency: "INR",
      language: "Hindi",
      popularity: 82,
      costIndex: 45,
    },
    {
      name: "Jaipur",
      country: "India",
      description: "The Pink City — Rajasthan's palaces, forts, and bazaars set against desert hills.",
      imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
      latitude: 26.9124,
      longitude: 75.7873,
      timezone: "Asia/Kolkata",
      currency: "INR",
      language: "Hindi",
      popularity: 84,
      costIndex: 35,
    },
    {
      name: "Goa",
      country: "India",
      description: "Laid-back beaches, Portuguese-era churches, and legendary nightlife on India's west coast.",
      imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
      latitude: 15.2993,
      longitude: 74.124,
      timezone: "Asia/Kolkata",
      currency: "INR",
      language: "Konkani",
      popularity: 83,
      costIndex: 40,
    },
    {
      name: "Cape Town",
      country: "South Africa",
      description: "Table Mountain, wine country, and windswept coastline at the tip of Africa.",
      imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800",
      latitude: -33.9249,
      longitude: 18.4241,
      timezone: "Africa/Johannesburg",
      currency: "ZAR",
      language: "English",
      popularity: 85,
      costIndex: 65,
    },
    {
      name: "Cairo",
      country: "Egypt",
      description: "Millennia of history along the Nile, from the Pyramids of Giza to the Egyptian Museum.",
      imageUrl: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800",
      latitude: 30.0444,
      longitude: 31.2357,
      timezone: "Africa/Cairo",
      currency: "EGP",
      language: "Arabic",
      popularity: 81,
      costIndex: 35,
    },
    {
      name: "Nairobi",
      country: "Kenya",
      description: "Safari gateway city with a national park at its edge and a buzzing tech and arts scene.",
      imageUrl: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800",
      latitude: -1.2921,
      longitude: 36.8219,
      timezone: "Africa/Nairobi",
      currency: "KES",
      language: "Swahili",
      popularity: 74,
      costIndex: 45,
    },
    {
      name: "Rio de Janeiro",
      country: "Brazil",
      description: "Copacabana beach, Christ the Redeemer, and carnival energy against a mountain backdrop.",
      imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800",
      latitude: -22.9068,
      longitude: -43.1729,
      timezone: "America/Sao_Paulo",
      currency: "BRL",
      language: "Portuguese",
      popularity: 87,
      costIndex: 60,
    },
    {
      name: "Buenos Aires",
      country: "Argentina",
      description: "Tango, steak, and European-style boulevards on the Río de la Plata.",
      imageUrl: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800",
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: "America/Argentina/Buenos_Aires",
      currency: "ARS",
      language: "Spanish",
      popularity: 80,
      costIndex: 55,
    },
    {
      name: "Mexico City",
      country: "Mexico",
      description: "Aztec ruins, world-class museums, and street food in one of the world's largest metropolises.",
      imageUrl: "https://images.unsplash.com/photo-1518659526054-190340b32735?w=800",
      latitude: 19.4326,
      longitude: -99.1332,
      timezone: "America/Mexico_City",
      currency: "MXN",
      language: "Spanish",
      popularity: 83,
      costIndex: 50,
    },
    {
      name: "Toronto",
      country: "Canada",
      description: "Multicultural lakeside city anchored by the CN Tower and a thriving food scene.",
      imageUrl: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800",
      latitude: 43.6532,
      longitude: -79.3832,
      timezone: "America/Toronto",
      currency: "CAD",
      language: "English",
      popularity: 82,
      costIndex: 120,
    },
    {
      name: "San Francisco",
      country: "USA",
      state: "CA",
      description: "Golden Gate Bridge views, steep hills, and the beating heart of tech culture.",
      imageUrl: "https://images.unsplash.com/photo-1521464302861-ce943915d1c3?w=800",
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: "America/Los_Angeles",
      currency: "USD",
      language: "English",
      popularity: 88,
      costIndex: 170,
    },
    {
      name: "Los Angeles",
      country: "USA",
      state: "CA",
      description: "Hollywood glamour, beach boardwalks, and endless sunshine on the Pacific coast.",
      imageUrl: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800",
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: "America/Los_Angeles",
      currency: "USD",
      language: "English",
      popularity: 87,
      costIndex: 150,
    },
    {
      name: "Amsterdam",
      country: "Netherlands",
      description: "Canal-lined streets, world-class museums, and a bike-first way of life.",
      imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800",
      latitude: 52.3676,
      longitude: 4.9041,
      timezone: "Europe/Amsterdam",
      currency: "EUR",
      language: "Dutch",
      popularity: 90,
      costIndex: 125,
    },
    {
      name: "Berlin",
      country: "Germany",
      description: "Cold War history, world-famous nightlife, and a constantly reinventing arts scene.",
      imageUrl: "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=800",
      latitude: 52.52,
      longitude: 13.405,
      timezone: "Europe/Berlin",
      currency: "EUR",
      language: "German",
      popularity: 88,
      costIndex: 100,
    },
    {
      name: "Prague",
      country: "Czech Republic",
      description: "Fairy-tale old town, medieval castle, and some of Europe's best-value beer halls.",
      imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800",
      latitude: 50.0755,
      longitude: 14.4378,
      timezone: "Europe/Prague",
      currency: "CZK",
      language: "Czech",
      popularity: 86,
      costIndex: 70,
    },
    {
      name: "Vienna",
      country: "Austria",
      description: "Imperial palaces, classical music heritage, and coffeehouse culture.",
      imageUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800",
      latitude: 48.2082,
      longitude: 16.3738,
      timezone: "Europe/Vienna",
      currency: "EUR",
      language: "German",
      popularity: 85,
      costIndex: 105,
    },
    {
      name: "Lisbon",
      country: "Portugal",
      description: "Pastel hillside streets, fado music, and pastel de nata straight from the oven.",
      imageUrl: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800",
      latitude: 38.7223,
      longitude: -9.1393,
      timezone: "Europe/Lisbon",
      currency: "EUR",
      language: "Portuguese",
      popularity: 87,
      costIndex: 80,
    },
    {
      name: "Istanbul",
      country: "Turkey",
      description: "Where East meets West — grand bazaars, ancient mosques, and Bosphorus ferry crossings.",
      imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
      latitude: 41.0082,
      longitude: 28.9784,
      timezone: "Europe/Istanbul",
      currency: "TRY",
      language: "Turkish",
      popularity: 88,
      costIndex: 50,
    },
    {
      name: "Reykjavik",
      country: "Iceland",
      description: "Gateway to glaciers, geysers, and the Northern Lights.",
      imageUrl: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800",
      latitude: 64.1466,
      longitude: -21.9426,
      timezone: "Atlantic/Reykjavik",
      currency: "ISK",
      language: "Icelandic",
      popularity: 79,
      costIndex: 150,
    },
    {
      name: "Queenstown",
      country: "New Zealand",
      description: "Adrenaline capital of the world, ringed by the Southern Alps and Lake Wakatipu.",
      imageUrl: "https://images.unsplash.com/photo-1589871173360-3ac1e6ff2d67?w=800",
      latitude: -45.0312,
      longitude: 168.6626,
      timezone: "Pacific/Auckland",
      currency: "NZD",
      language: "English",
      popularity: 78,
      costIndex: 130,
    },
  ];

  const createdCities: { id: string; name: string }[] = [];
  for (const city of citiesData) {
    const existing = await prisma.city.findFirst({
      where: { name: city.name, country: city.country },
    });
    if (existing) {
      createdCities.push({ id: existing.id, name: existing.name });
      continue;
    }
    const c = await prisma.city.create({
      data: {
        ...city,
        latitude: city.latitude as any,
        longitude: city.longitude as any,
      },
    });
    createdCities.push({ id: c.id, name: c.name });
  }
  console.log("✅ Cities created:", createdCities.length);

  const paris = createdCities.find((c) => c.name === "Paris")!;
  const tokyo = createdCities.find((c) => c.name === "Tokyo")!;
  const nyc = createdCities.find((c) => c.name === "New York City")!;
  const rome = createdCities.find((c) => c.name === "Rome")!;
  const bali = createdCities.find((c) => c.name === "Bali")!;
  const london = createdCities.find((c) => c.name === "London")!;
  const barcelona = createdCities.find((c) => c.name === "Barcelona")!;
  const dubai = createdCities.find((c) => c.name === "Dubai")!;
  const bangkok = createdCities.find((c) => c.name === "Bangkok")!;
  const sydney = createdCities.find((c) => c.name === "Sydney")!;
  const santorini = createdCities.find((c) => c.name === "Santorini")!;
  const marrakech = createdCities.find((c) => c.name === "Marrakech")!;
  const singapore = createdCities.find((c) => c.name === "Singapore")!;
  const seoul = createdCities.find((c) => c.name === "Seoul")!;
  const kyoto = createdCities.find((c) => c.name === "Kyoto")!;
  const hongkong = createdCities.find((c) => c.name === "Hong Kong")!;
  const mumbai = createdCities.find((c) => c.name === "Mumbai")!;
  const jaipur = createdCities.find((c) => c.name === "Jaipur")!;
  const goa = createdCities.find((c) => c.name === "Goa")!;
  const capeTown = createdCities.find((c) => c.name === "Cape Town")!;
  const cairo = createdCities.find((c) => c.name === "Cairo")!;
  const nairobi = createdCities.find((c) => c.name === "Nairobi")!;
  const rio = createdCities.find((c) => c.name === "Rio de Janeiro")!;
  const buenosAires = createdCities.find((c) => c.name === "Buenos Aires")!;
  const mexicoCity = createdCities.find((c) => c.name === "Mexico City")!;
  const toronto = createdCities.find((c) => c.name === "Toronto")!;
  const sanFrancisco = createdCities.find((c) => c.name === "San Francisco")!;
  const losAngeles = createdCities.find((c) => c.name === "Los Angeles")!;
  const amsterdam = createdCities.find((c) => c.name === "Amsterdam")!;
  const berlin = createdCities.find((c) => c.name === "Berlin")!;
  const prague = createdCities.find((c) => c.name === "Prague")!;
  const vienna = createdCities.find((c) => c.name === "Vienna")!;
  const lisbon = createdCities.find((c) => c.name === "Lisbon")!;
  const istanbul = createdCities.find((c) => c.name === "Istanbul")!;
  const reykjavik = createdCities.find((c) => c.name === "Reykjavik")!;
  const queenstown = createdCities.find((c) => c.name === "Queenstown")!;

  const activitiesData: { cityId: string; name: string; description?: string; type: ActivityType; duration: number; cost: number; currency: string; rating: number; popularity: number; imageUrl?: string; location?: string }[] = [
    { cityId: paris.id, name: "Eiffel Tower Visit", description: "Skip-the-line access to the second floor and summit of the iconic Eiffel Tower", type: ActivityType.SIGHTSEEING, duration: 120, cost: 26, currency: "EUR", rating: 4.7, popularity: 100, imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600", location: "Champ de Mars, 5 Av. Anatole France, 75007 Paris" },
    { cityId: paris.id, name: "Louvre Museum Tour", description: "Guided tour through the world's largest art museum including the Mona Lisa", type: ActivityType.CULTURE, duration: 180, cost: 22, currency: "EUR", rating: 4.6, popularity: 95, imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600", location: "Rue de Rivoli, 75001 Paris" },
    { cityId: paris.id, name: "Seine River Cruise", description: "Romantic dinner cruise along the Seine with views of illuminated landmarks", type: ActivityType.ENTERTAINMENT, duration: 150, cost: 85, currency: "EUR", rating: 4.5, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=600", location: "Port de la Bourdonnais, 75007 Paris" },
    { cityId: paris.id, name: "Montmartre Walking Tour", description: "Explore the bohemian Montmartre district with Sacré-Cœur Basilica and artists' square", type: ActivityType.CULTURE, duration: 120, cost: 0, currency: "EUR", rating: 4.4, popularity: 85, imageUrl: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=600", location: "Montmartre, 75018 Paris" },
    { cityId: paris.id, name: "French Cooking Class", description: "Hands-on class learning to make classic French dishes with a local chef", type: ActivityType.FOOD, duration: 240, cost: 120, currency: "EUR", rating: 4.8, popularity: 75, imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600", location: "Le Marais, Paris" },
    { cityId: tokyo.id, name: "Shibuya Crossing Experience", description: "Experience the world's busiest pedestrian crossing and explore Shibuya", type: ActivityType.SIGHTSEEING, duration: 90, cost: 0, currency: "JPY", rating: 4.5, popularity: 100, imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600", location: "Shibuya Station, Tokyo" },
    { cityId: tokyo.id, name: "Senso-ji Temple Visit", description: "Explore Tokyo's oldest Buddhist temple in Asakusa and the Nakamise shopping street", type: ActivityType.CULTURE, duration: 90, cost: 0, currency: "JPY", rating: 4.6, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600", location: "2 Chome-3-1 Asakusa, Taito City" },
    { cityId: tokyo.id, name: "Mount Fuji Day Trip", description: "Full-day tour to Mount Fuji including Lake Kawaguchi and hot springs", type: ActivityType.NATURE, duration: 600, cost: 12000, currency: "JPY", rating: 4.7, popularity: 95, imageUrl: "https://images.unsplash.com/photo-1578469645742-46cae010e2d3?w=600", location: "Mount Fuji, Yamanashi" },
    { cityId: tokyo.id, name: "Tsukiji Outer Market Food Tour", description: "Taste fresh sushi, seafood bowls, and street food at the iconic fish market", type: ActivityType.FOOD, duration: 150, cost: 5000, currency: "JPY", rating: 4.7, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600", location: "Tsukiji, Chuo City, Tokyo" },
    { cityId: tokyo.id, name: "TeamLab Borderless", description: "Immersive digital art museum with interactive installations", type: ActivityType.ENTERTAINMENT, duration: 180, cost: 3500, currency: "JPY", rating: 4.6, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600", location: "Aomi, Koto City, Tokyo" },
    { cityId: nyc.id, name: "Statue of Liberty & Ellis Island", description: "Ferry to the Statue of Liberty including pedestal access and Ellis Island museum", type: ActivityType.SIGHTSEEING, duration: 240, cost: 24, currency: "USD", rating: 4.6, popularity: 96, imageUrl: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600", location: "Battery Park, New York" },
    { cityId: nyc.id, name: "Central Park Bike Tour", description: "Guided bike tour through Central Park's iconic landmarks", type: ActivityType.ADVENTURE, duration: 150, cost: 45, currency: "USD", rating: 4.7, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=600", location: "Central Park, New York" },
    { cityId: nyc.id, name: "Broadway Show", description: "Tickets to a top Broadway musical or play in the Theater District", type: ActivityType.ENTERTAINMENT, duration: 180, cost: 120, currency: "USD", rating: 4.7, popularity: 94, imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600", location: "Theater District, Midtown Manhattan" },
    { cityId: nyc.id, name: "9/11 Memorial & Museum", description: "Visit the reflecting pools and museum honoring the 2001 attacks", type: ActivityType.CULTURE, duration: 180, cost: 33, currency: "USD", rating: 4.8, popularity: 85, imageUrl: "https://images.unsplash.com/photo-1564323052781-54d2c114d560?w=600", location: "180 Greenwich St, New York" },
    { cityId: rome.id, name: "Colosseum & Roman Forum Tour", description: "Guided tour of the Colosseum's underground and Roman Forum ruins", type: ActivityType.CULTURE, duration: 240, cost: 59, currency: "EUR", rating: 4.7, popularity: 98, imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600", location: "Piazza del Colosseo, 1, Rome" },
    { cityId: rome.id, name: "Vatican Museums & Sistine Chapel", description: "Skip-the-line tour of Vatican Museums, Raphael's Rooms, and Sistine Chapel", type: ActivityType.CULTURE, duration: 240, cost: 60, currency: "EUR", rating: 4.5, popularity: 96, imageUrl: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600", location: "Viale Vaticano, 00165 Rome" },
    { cityId: rome.id, name: "Trevi Fountain & Pantheon Walk", description: "Walk through Rome's historic center visiting iconic fountains and temples", type: ActivityType.SIGHTSEEING, duration: 120, cost: 0, currency: "EUR", rating: 4.6, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600", location: "Piazza di Trevi, Rome" },
    { cityId: rome.id, name: "Trastevere Food Tour", description: "Wine and dine through the charming Trastevere neighborhood", type: ActivityType.FOOD, duration: 210, cost: 75, currency: "EUR", rating: 4.7, popularity: 82, imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82be738d?w=600", location: "Trastevere, Rome" },
    { cityId: bali.id, name: "Tegalalang Rice Terraces", description: "Visit the iconic cascading rice terraces and take a walk through the fields", type: ActivityType.NATURE, duration: 120, cost: 100000, currency: "IDR", rating: 4.5, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600", location: "Tegalalang, Gianyar, Bali" },
    { cityId: bali.id, name: "Uluwatu Temple & Kecak Dance", description: "Sunset temple visit followed by the famous Kecak fire dance performance", type: ActivityType.CULTURE, duration: 180, cost: 250000, currency: "IDR", rating: 4.6, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=600", location: "Pecatu, South Kuta, Bali" },
    { cityId: bali.id, name: "Nusa Penida Day Trip", description: "Island hopping to Kelingking Beach, Angel's Billabong, and Broken Beach", type: ActivityType.ADVENTURE, duration: 600, cost: 750000, currency: "IDR", rating: 4.7, popularity: 95, imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600", location: "Nusa Penida, Klungkung, Bali" },
    { cityId: bali.id, name: "Seminyak Beach Club", description: "Relaxed beach day at a premium beach club with pool, cocktails, and sunset views", type: ActivityType.ENTERTAINMENT, duration: 300, cost: 300000, currency: "IDR", rating: 4.5, popularity: 85, imageUrl: "https://images.unsplash.com/photo-1540202404-1b927e27fa8f?w=600", location: "Seminyak, Badung, Bali" },
    { cityId: london.id, name: "Tower of London Tour", description: "Yeoman Warder tour of the Tower including the Crown Jewels and White Tower", type: ActivityType.CULTURE, duration: 180, cost: 33, currency: "GBP", rating: 4.7, popularity: 95, imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600", location: "Tower of London, London EC3N 4AB" },
    { cityId: london.id, name: "West End Theatre Show", description: "Tickets to a West End production in London's Theatreland", type: ActivityType.ENTERTAINMENT, duration: 180, cost: 75, currency: "GBP", rating: 4.6, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600", location: "West End, London" },
    { cityId: london.id, name: "British Museum Visit", description: "Free entry to world treasures including the Rosetta Stone and Parthenon sculptures", type: ActivityType.CULTURE, duration: 240, cost: 0, currency: "GBP", rating: 4.7, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600", location: "Great Russell St, Bloomsbury, London" },
    { cityId: barcelona.id, name: "Sagrada Família Tour", description: "Skip-the-line tour of Gaudí's unfinished masterpiece with tower access", type: ActivityType.CULTURE, duration: 180, cost: 36, currency: "EUR", rating: 4.8, popularity: 98, imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600", location: "C/ de Mallorca, 401, Barcelona" },
    { cityId: barcelona.id, name: "Park Güell Visit", description: "Explore Gaudí's colorful park with panoramic views of Barcelona", type: ActivityType.SIGHTSEEING, duration: 120, cost: 12, currency: "EUR", rating: 4.5, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600", location: "Carrer d'Olot, 5, Barcelona" },
    { cityId: barcelona.id, name: "La Rambla & Tapas Tour", description: "Walk down Las Ramblas and enjoy tapas and sangria in the Gothic Quarter", type: ActivityType.FOOD, duration: 210, cost: 65, currency: "EUR", rating: 4.6, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=600", location: "La Rambla, Barcelona" },
    { cityId: dubai.id, name: "Burj Khalifa Observation Deck", description: "Tickets to At The Top - levels 124, 125, and 148 of the world's tallest building", type: ActivityType.SIGHTSEEING, duration: 120, cost: 225, currency: "AED", rating: 4.6, popularity: 96, imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600", location: "Downtown Dubai" },
    { cityId: dubai.id, name: "Desert Safari & Dune Bashing", description: "Adventure-filled desert tour with dune bashing, camel ride, and BBQ dinner", type: ActivityType.ADVENTURE, duration: 420, cost: 250, currency: "AED", rating: 4.7, popularity: 94, imageUrl: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600", location: "Dubai Desert Conservation Reserve" },
    { cityId: dubai.id, name: "Palm Jumeirah Atlantis Aquaventure", description: "Full day at the massive water park on The Palm island", type: ActivityType.ENTERTAINMENT, duration: 480, cost: 345, currency: "AED", rating: 4.6, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600", location: "Atlantis The Palm, Dubai" },
    { cityId: bangkok.id, name: "Grand Palace & Wat Phra Kaew", description: "Visit Bangkok's magnificent royal palace complex and Temple of the Emerald Buddha", type: ActivityType.CULTURE, duration: 180, cost: 500, currency: "THB", rating: 4.5, popularity: 95, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600", location: "Na Phra Lan Rd, Phra Nakhon, Bangkok" },
    { cityId: bangkok.id, name: "Floating Market Tour", description: "Explore Damnoen Saduak Floating Market by longtail boat", type: ActivityType.CULTURE, duration: 360, cost: 1200, currency: "THB", rating: 4.4, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600", location: "Damnoen Saduak, Ratchaburi" },
    { cityId: bangkok.id, name: "Chiang Mai Temples & Nature", description: "Day trip to Chiang Mai visiting Doi Suthep temple and elephant sanctuary", type: ActivityType.NATURE, duration: 600, cost: 2500, currency: "THB", rating: 4.6, popularity: 82, imageUrl: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600", location: "Chiang Mai" },
    { cityId: sydney.id, name: "Sydney Opera House Tour", description: "Guided backstage tour of the world-famous iconic architectural masterpiece", type: ActivityType.CULTURE, duration: 120, cost: 45, currency: "AUD", rating: 4.7, popularity: 94, imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600", location: "Bennelong Point, Sydney" },
    { cityId: sydney.id, name: "Sydney Harbour Bridge Climb", description: "Climb to the top of the Harbour Bridge for breathtaking 360° views", type: ActivityType.ADVENTURE, duration: 210, cost: 198, currency: "AUD", rating: 4.8, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600", location: "5 Cumberland St, The Rocks, Sydney" },
    { cityId: sydney.id, name: "Blue Mountains Day Trip", description: "Visit the Three Sisters rock formation and Scenic World in the Blue Mountains", type: ActivityType.NATURE, duration: 600, cost: 119, currency: "AUD", rating: 4.6, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600", location: "Katoomba, Blue Mountains" },

    { cityId: santorini.id, name: "Oia Sunset Watching", description: "Iconic sunset views over the caldera from the whitewashed village of Oia", type: ActivityType.SIGHTSEEING, duration: 90, cost: 0, currency: "EUR", rating: 4.9, popularity: 98, imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600", location: "Oia, Santorini" },
    { cityId: santorini.id, name: "Catamaran Caldera Cruise", description: "Sail the volcanic caldera with stops for swimming and a BBQ dinner onboard", type: ActivityType.ADVENTURE, duration: 300, cost: 95, currency: "EUR", rating: 4.7, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600", location: "Vlychada Port, Santorini" },
    { cityId: santorini.id, name: "Wine Tasting Tour", description: "Sample volcanic-soil Assyrtiko wines at family-run wineries", type: ActivityType.FOOD, duration: 180, cost: 65, currency: "EUR", rating: 4.6, popularity: 78, imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600", location: "Pyrgos, Santorini" },

    { cityId: marrakech.id, name: "Jemaa el-Fnaa Night Market", description: "Explore the legendary square's food stalls, snake charmers, and storytellers", type: ActivityType.CULTURE, duration: 150, cost: 0, currency: "MAD", rating: 4.6, popularity: 95, imageUrl: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600", location: "Jemaa el-Fnaa, Marrakech" },
    { cityId: marrakech.id, name: "Atlas Mountains Day Trip", description: "Berber villages and valley views on a guided trip into the High Atlas", type: ActivityType.NATURE, duration: 480, cost: 45, currency: "MAD", rating: 4.5, popularity: 82, imageUrl: "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=600", location: "High Atlas Mountains" },
    { cityId: marrakech.id, name: "Traditional Hammam & Spa", description: "Moroccan bathhouse ritual with scrub, steam, and argan oil massage", type: ActivityType.OTHER, duration: 120, cost: 60, currency: "MAD", rating: 4.7, popularity: 70, imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600", location: "Medina, Marrakech" },

    { cityId: singapore.id, name: "Gardens by the Bay", description: "Super Tree Grove light show and Cloud Forest dome", type: ActivityType.SIGHTSEEING, duration: 150, cost: 28, currency: "SGD", rating: 4.7, popularity: 97, imageUrl: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600", location: "18 Marina Gardens Dr, Singapore" },
    { cityId: singapore.id, name: "Hawker Centre Food Crawl", description: "Guided tasting tour through Maxwell and Chinatown hawker stalls", type: ActivityType.FOOD, duration: 180, cost: 45, currency: "SGD", rating: 4.8, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600", location: "Chinatown Complex, Singapore" },
    { cityId: singapore.id, name: "Sentosa Island Day Pass", description: "Beaches, Universal Studios, and cable car rides on Sentosa Island", type: ActivityType.ENTERTAINMENT, duration: 420, cost: 80, currency: "SGD", rating: 4.5, popularity: 85, imageUrl: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600", location: "Sentosa Island, Singapore" },

    { cityId: seoul.id, name: "Gyeongbokgung Palace & Hanbok", description: "Rent a hanbok and tour Seoul's grandest royal palace for free entry", type: ActivityType.CULTURE, duration: 150, cost: 15000, currency: "KRW", rating: 4.7, popularity: 94, imageUrl: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600", location: "161 Sajik-ro, Jongno-gu, Seoul" },
    { cityId: seoul.id, name: "Myeongdong Street Food Tour", description: "Tteokbokki, hotteok, and Korean BBQ crawl through Myeongdong", type: ActivityType.FOOD, duration: 150, cost: 40000, currency: "KRW", rating: 4.6, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600", location: "Myeongdong, Seoul" },
    { cityId: seoul.id, name: "N Seoul Tower & Bukchon Village", description: "Cable car up Namsan followed by a walk through Bukchon Hanok Village", type: ActivityType.SIGHTSEEING, duration: 180, cost: 21000, currency: "KRW", rating: 4.5, popularity: 86, imageUrl: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600", location: "Namsan, Seoul" },

    { cityId: kyoto.id, name: "Fushimi Inari Torii Gates Hike", description: "Walk the thousands of vermillion torii gates up Mount Inari", type: ActivityType.NATURE, duration: 150, cost: 0, currency: "JPY", rating: 4.8, popularity: 96, imageUrl: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600", location: "Fushimi Inari Taisha, Kyoto" },
    { cityId: kyoto.id, name: "Arashiyama Bamboo Grove", description: "Walk through the towering bamboo groves and visit the nearby monkey park", type: ActivityType.NATURE, duration: 120, cost: 500, currency: "JPY", rating: 4.6, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1522547902298-51566e4fb383?w=600", location: "Arashiyama, Kyoto" },
    { cityId: kyoto.id, name: "Gion Geisha District Walk", description: "Evening walking tour through Kyoto's historic geisha entertainment district", type: ActivityType.CULTURE, duration: 120, cost: 3000, currency: "JPY", rating: 4.5, popularity: 80, imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600", location: "Gion, Kyoto" },

    { cityId: hongkong.id, name: "Victoria Peak Tram & Skyline", description: "Peak Tram ride up to Victoria Peak for panoramic harbor views", type: ActivityType.SIGHTSEEING, duration: 120, cost: 99, currency: "HKD", rating: 4.6, popularity: 95, imageUrl: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=600", location: "Victoria Peak, Hong Kong" },
    { cityId: hongkong.id, name: "Dim Sum Breakfast Tour", description: "Traditional trolley-cart dim sum tasting in a historic teahouse", type: ActivityType.FOOD, duration: 120, cost: 250, currency: "HKD", rating: 4.7, popularity: 85, imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600", location: "Central, Hong Kong" },
    { cityId: hongkong.id, name: "Big Buddha & Ngong Ping 360", description: "Cable car to Lantau Island's giant bronze Buddha and Po Lin Monastery", type: ActivityType.CULTURE, duration: 240, cost: 260, currency: "HKD", rating: 4.5, popularity: 80, imageUrl: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=600", location: "Ngong Ping, Lantau Island" },

    { cityId: mumbai.id, name: "Gateway of India & Elephanta Caves", description: "Ferry from the Gateway of India to the ancient rock-cut Elephanta Caves", type: ActivityType.CULTURE, duration: 300, cost: 1200, currency: "INR", rating: 4.5, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600", location: "Gateway of India, Mumbai" },
    { cityId: mumbai.id, name: "Street Food Trail, Mohammed Ali Road", description: "Kebabs, biryani, and dessert crawl through Mumbai's iconic food street", type: ActivityType.FOOD, duration: 150, cost: 800, currency: "INR", rating: 4.7, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", location: "Mohammed Ali Road, Mumbai" },
    { cityId: mumbai.id, name: "Marine Drive Sunset Walk", description: "Stroll the Queen's Necklace promenade as the sun sets over the Arabian Sea", type: ActivityType.SIGHTSEEING, duration: 90, cost: 0, currency: "INR", rating: 4.6, popularity: 82, imageUrl: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600", location: "Marine Drive, Mumbai" },

    { cityId: jaipur.id, name: "Amber Fort & Elephant Gate", description: "Explore the hilltop Amber Fort's mirrored halls and courtyards", type: ActivityType.CULTURE, duration: 180, cost: 500, currency: "INR", rating: 4.7, popularity: 96, imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600", location: "Devisinghpura, Amer, Jaipur" },
    { cityId: jaipur.id, name: "Hawa Mahal & City Palace", description: "Visit the Palace of Winds and the royal City Palace complex", type: ActivityType.SIGHTSEEING, duration: 150, cost: 400, currency: "INR", rating: 4.6, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600", location: "Hawa Mahal Rd, Jaipur" },
    { cityId: jaipur.id, name: "Chokhi Dhani Rural Village Evening", description: "Rajasthani folk dance, camel rides, and a traditional thali dinner", type: ActivityType.ENTERTAINMENT, duration: 240, cost: 900, currency: "INR", rating: 4.5, popularity: 78, imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600", location: "Tonk Road, Jaipur" },

    { cityId: goa.id, name: "Baga & Calangute Beach Day", description: "Water sports, beach shacks, and sunset at Goa's most popular beaches", type: ActivityType.ADVENTURE, duration: 300, cost: 1500, currency: "INR", rating: 4.4, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600", location: "Baga Beach, Goa" },
    { cityId: goa.id, name: "Old Goa Churches Heritage Walk", description: "UNESCO-listed Basilica of Bom Jesus and Se Cathedral walking tour", type: ActivityType.CULTURE, duration: 120, cost: 0, currency: "INR", rating: 4.5, popularity: 75, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600", location: "Old Goa" },
    { cityId: goa.id, name: "Sunset Cruise on the Mandovi", description: "River cruise with live music and dancing as the sun sets", type: ActivityType.ENTERTAINMENT, duration: 90, cost: 600, currency: "INR", rating: 4.3, popularity: 80, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600", location: "Mandovi River, Panaji" },

    { cityId: capeTown.id, name: "Table Mountain Cableway", description: "Rotating cable car to the top of Table Mountain for 360° views", type: ActivityType.NATURE, duration: 150, cost: 420, currency: "ZAR", rating: 4.8, popularity: 97, imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600", location: "Tafelberg Rd, Cape Town" },
    { cityId: capeTown.id, name: "Cape Peninsula & Penguins Tour", description: "Cape Point, Boulders Beach penguin colony, and coastal drive", type: ActivityType.ADVENTURE, duration: 480, cost: 950, currency: "ZAR", rating: 4.7, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600", location: "Cape Peninsula" },
    { cityId: capeTown.id, name: "Stellenbosch Wine Tasting", description: "Full-day wine estate tour through the Cape Winelands", type: ActivityType.FOOD, duration: 360, cost: 850, currency: "ZAR", rating: 4.6, popularity: 82, imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600", location: "Stellenbosch" },

    { cityId: cairo.id, name: "Pyramids of Giza & Sphinx", description: "Guided tour of the Great Pyramid, Sphinx, and Valley Temple", type: ActivityType.SIGHTSEEING, duration: 240, cost: 15, currency: "EGP", rating: 4.8, popularity: 99, imageUrl: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600", location: "Al Haram, Giza" },
    { cityId: cairo.id, name: "Egyptian Museum Tour", description: "Guided walk through Tutankhamun's treasures and royal mummies", type: ActivityType.CULTURE, duration: 150, cost: 12, currency: "EGP", rating: 4.6, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600", location: "Tahrir Square, Cairo" },
    { cityId: cairo.id, name: "Nile Dinner Cruise", description: "Evening felucca or dinner cruise along the Nile with folkloric show", type: ActivityType.ENTERTAINMENT, duration: 150, cost: 25, currency: "EGP", rating: 4.4, popularity: 78, imageUrl: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600", location: "Nile River, Cairo" },

    { cityId: nairobi.id, name: "Nairobi National Park Safari", description: "Half-day game drive minutes from the city center — lions, giraffes, rhinos", type: ActivityType.NATURE, duration: 240, cost: 4300, currency: "KES", rating: 4.6, popularity: 93, imageUrl: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=600", location: "Nairobi National Park" },
    { cityId: nairobi.id, name: "Giraffe Centre & Elephant Orphanage", description: "Hand-feed Rothschild giraffes and visit orphaned baby elephants", type: ActivityType.NATURE, duration: 150, cost: 1500, currency: "KES", rating: 4.7, popularity: 85, imageUrl: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=600", location: "Karen, Nairobi" },

    { cityId: rio.id, name: "Christ the Redeemer & Corcovado", description: "Train up Corcovado Mountain to the iconic Art Deco statue", type: ActivityType.SIGHTSEEING, duration: 180, cost: 110, currency: "BRL", rating: 4.8, popularity: 98, imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600", location: "Parque Nacional da Tijuca, Rio" },
    { cityId: rio.id, name: "Sugarloaf Mountain Cable Car", description: "Two-stage cable car ride for sunset views over Guanabara Bay", type: ActivityType.SIGHTSEEING, duration: 150, cost: 130, currency: "BRL", rating: 4.7, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600", location: "Urca, Rio de Janeiro" },
    { cityId: rio.id, name: "Copacabana & Ipanema Beach Day", description: "Beach day with caipirinhas and a football match on the sand", type: ActivityType.ADVENTURE, duration: 240, cost: 0, currency: "BRL", rating: 4.5, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600", location: "Copacabana, Rio de Janeiro" },

    { cityId: buenosAires.id, name: "Tango Show & Dinner in San Telmo", description: "Live tango performance with a traditional Argentine steak dinner", type: ActivityType.ENTERTAINMENT, duration: 180, cost: 55, currency: "ARS", rating: 4.7, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600", location: "San Telmo, Buenos Aires" },
    { cityId: buenosAires.id, name: "Recoleta Cemetery & La Boca Walk", description: "Ornate mausoleums followed by the colorful Caminito street in La Boca", type: ActivityType.CULTURE, duration: 180, cost: 0, currency: "ARS", rating: 4.5, popularity: 82, imageUrl: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600", location: "Recoleta & La Boca, Buenos Aires" },

    { cityId: mexicoCity.id, name: "Teotihuacan Pyramids Day Trip", description: "Climb the Pyramid of the Sun and Pyramid of the Moon outside the city", type: ActivityType.SIGHTSEEING, duration: 360, cost: 450, currency: "MXN", rating: 4.7, popularity: 94, imageUrl: "https://images.unsplash.com/photo-1518659526054-190340b32735?w=600", location: "Teotihuacan" },
    { cityId: mexicoCity.id, name: "Frida Kahlo Museum (Casa Azul)", description: "Tour the Blue House where Frida Kahlo lived and painted", type: ActivityType.CULTURE, duration: 120, cost: 250, currency: "MXN", rating: 4.6, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1518659526054-190340b32735?w=600", location: "Coyoacán, Mexico City" },
    { cityId: mexicoCity.id, name: "Xochimilco Trajinera Boat Party", description: "Colorful floating gardens boat ride with mariachi and street food", type: ActivityType.ENTERTAINMENT, duration: 180, cost: 350, currency: "MXN", rating: 4.5, popularity: 85, imageUrl: "https://images.unsplash.com/photo-1518659526054-190340b32735?w=600", location: "Xochimilco, Mexico City" },

    { cityId: toronto.id, name: "CN Tower & EdgeWalk", description: "Observation deck views, glass floor, and optional edge walk around the tower", type: ActivityType.ADVENTURE, duration: 120, cost: 43, currency: "CAD", rating: 4.6, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=600", location: "290 Bremner Blvd, Toronto" },
    { cityId: toronto.id, name: "Niagara Falls Day Trip", description: "Boat tour to the base of the falls plus wine country stop", type: ActivityType.NATURE, duration: 600, cost: 140, currency: "CAD", rating: 4.7, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1489447068241-b3490214e879?w=600", location: "Niagara Falls, Ontario" },

    { cityId: sanFrancisco.id, name: "Alcatraz Island Tour", description: "Ferry and audio tour of the infamous former federal prison", type: ActivityType.CULTURE, duration: 180, cost: 45, currency: "USD", rating: 4.8, popularity: 96, imageUrl: "https://images.unsplash.com/photo-1521464302861-ce943915d1c3?w=600", location: "Pier 33, San Francisco" },
    { cityId: sanFrancisco.id, name: "Golden Gate Bridge Bike Ride", description: "Cycle across the bridge to Sausalito with a ferry back", type: ActivityType.ADVENTURE, duration: 240, cost: 40, currency: "USD", rating: 4.7, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1521464302861-ce943915d1c3?w=600", location: "Golden Gate Bridge, San Francisco" },

    { cityId: losAngeles.id, name: "Universal Studios Hollywood", description: "Movie-themed rides and the Studio Tour behind the scenes", type: ActivityType.ENTERTAINMENT, duration: 480, cost: 109, currency: "USD", rating: 4.6, popularity: 93, imageUrl: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=600", location: "Universal City, LA" },
    { cityId: losAngeles.id, name: "Griffith Observatory & Hollywood Sign", description: "Sunset views over the city with the Hollywood Sign in frame", type: ActivityType.SIGHTSEEING, duration: 120, cost: 0, currency: "USD", rating: 4.7, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=600", location: "Griffith Park, LA" },

    { cityId: amsterdam.id, name: "Canal Cruise", description: "Evening canal cruise past the Golden Age merchant houses", type: ActivityType.SIGHTSEEING, duration: 90, cost: 20, currency: "EUR", rating: 4.6, popularity: 95, imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600", location: "Amsterdam canal belt" },
    { cityId: amsterdam.id, name: "Van Gogh Museum", description: "The world's largest collection of Van Gogh paintings and letters", type: ActivityType.CULTURE, duration: 120, cost: 22, currency: "EUR", rating: 4.7, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600", location: "Museumplein, Amsterdam" },

    { cityId: berlin.id, name: "Berlin Wall & East Side Gallery", description: "Guided walk along the longest surviving stretch of the Berlin Wall murals", type: ActivityType.CULTURE, duration: 120, cost: 0, currency: "EUR", rating: 4.6, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=600", location: "Mühlenstraße, Berlin" },
    { cityId: berlin.id, name: "Brandenburg Gate & Reichstag Dome", description: "Free entry to the Reichstag's glass dome (advance booking required)", type: ActivityType.SIGHTSEEING, duration: 120, cost: 0, currency: "EUR", rating: 4.7, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=600", location: "Platz der Republik, Berlin" },

    { cityId: prague.id, name: "Prague Castle & St. Vitus Cathedral", description: "Explore the largest ancient castle complex in the world", type: ActivityType.CULTURE, duration: 180, cost: 250, currency: "CZK", rating: 4.7, popularity: 94, imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600", location: "Hradčany, Prague" },
    { cityId: prague.id, name: "Charles Bridge & Old Town Walk", description: "Sunrise walk across Charles Bridge into the Old Town Square", type: ActivityType.SIGHTSEEING, duration: 120, cost: 0, currency: "CZK", rating: 4.8, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600", location: "Charles Bridge, Prague" },

    { cityId: vienna.id, name: "Schönbrunn Palace Tour", description: "Habsburg imperial summer palace with gardens and gloriette", type: ActivityType.CULTURE, duration: 180, cost: 26, currency: "EUR", rating: 4.7, popularity: 93, imageUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600", location: "Schönbrunner Schloßstraße, Vienna" },
    { cityId: vienna.id, name: "Vienna State Opera Performance", description: "Evening classical performance at one of the world's leading opera houses", type: ActivityType.ENTERTAINMENT, duration: 180, cost: 45, currency: "EUR", rating: 4.8, popularity: 82, imageUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600", location: "Opernring 2, Vienna" },

    { cityId: lisbon.id, name: "Belém Tower & Jerónimos Monastery", description: "UNESCO landmarks from Portugal's Age of Discovery, plus a pastel de nata stop", type: ActivityType.CULTURE, duration: 180, cost: 12, currency: "EUR", rating: 4.7, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600", location: "Belém, Lisbon" },
    { cityId: lisbon.id, name: "Tram 28 & Alfama District", description: "Ride the historic yellow tram through Lisbon's oldest hillside neighborhood", type: ActivityType.SIGHTSEEING, duration: 120, cost: 3, currency: "EUR", rating: 4.6, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600", location: "Alfama, Lisbon" },

    { cityId: istanbul.id, name: "Hagia Sophia & Blue Mosque", description: "Guided tour of two of the world's most significant religious monuments", type: ActivityType.CULTURE, duration: 150, cost: 25, currency: "TRY", rating: 4.8, popularity: 97, imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600", location: "Sultanahmet, Istanbul" },
    { cityId: istanbul.id, name: "Bosphorus Sunset Cruise", description: "Cruise between Europe and Asia with views of Ottoman palaces", type: ActivityType.SIGHTSEEING, duration: 120, cost: 20, currency: "TRY", rating: 4.6, popularity: 88, imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600", location: "Bosphorus Strait, Istanbul" },

    { cityId: reykjavik.id, name: "Golden Circle Tour", description: "Þingvellir National Park, Geysir hot springs, and Gullfoss waterfall in one day", type: ActivityType.NATURE, duration: 480, cost: 90, currency: "ISK", rating: 4.8, popularity: 96, imageUrl: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600", location: "Golden Circle, Iceland" },
    { cityId: reykjavik.id, name: "Blue Lagoon Geothermal Spa", description: "Soak in the milky-blue geothermal waters with a silica mud mask", type: ActivityType.OTHER, duration: 180, cost: 70, currency: "ISK", rating: 4.7, popularity: 92, imageUrl: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600", location: "Grindavík, Iceland" },

    { cityId: queenstown.id, name: "Shotover Jet Boat Ride", description: "High-speed jet boat through the narrow canyons of the Shotover River", type: ActivityType.ADVENTURE, duration: 60, cost: 149, currency: "NZD", rating: 4.7, popularity: 90, imageUrl: "https://images.unsplash.com/photo-1589871173360-3ac1e6ff2d67?w=600", location: "Shotover River, Queenstown" },
    { cityId: queenstown.id, name: "Milford Sound Day Cruise", description: "Full-day trip to the fiord with waterfalls, seals, and dramatic peaks", type: ActivityType.NATURE, duration: 720, cost: 249, currency: "NZD", rating: 4.9, popularity: 94, imageUrl: "https://images.unsplash.com/photo-1589871173360-3ac1e6ff2d67?w=600", location: "Milford Sound, Fiordland" },
  ];

  let activitiesCount = 0;
  for (const a of activitiesData) {
    const existing = await prisma.activity.findFirst({
      where: { cityId: a.cityId, name: a.name },
    });
    if (existing) continue;
    await prisma.activity.create({
      data: {
        ...a,
        cost: a.cost as any,
        rating: a.rating as any,
      },
    });
    activitiesCount++;
  }
  console.log("✅ Activities created:", activitiesCount);

  const trip1 = await prisma.trip.upsert({
    where: { id: "demo-europe-trip-1" },
    update: {},
    create: {
      id: "demo-europe-trip-1",
      userId: user1.id,
      title: "Romantic European Adventure",
      description: "A 10-day honeymoon trip through Paris, Rome, and Barcelona.",
      status: TripStatus.PLANNING,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-10"),
      budget: 5000,
      currency: "EUR",
      isPublic: true,
      shareToken: "europe-2026-romance",
    },
  });

  // Re-running the seed against an already-seeded DB would otherwise hit the
  // unique (tripId, orderIndex) constraint on the demo trip's stops.
  await prisma.tripStop.deleteMany({ where: { tripId: trip1.id } });

  const stop1 = await prisma.tripStop.create({
    data: {
      tripId: trip1.id,
      cityId: paris.id,
      orderIndex: 0,
      arrivalDate: new Date("2026-06-01"),
      departureDate: new Date("2026-06-04"),
      notes: "3 nights at hotel near Champs-Élysées",
    },
  });

  const stop2 = await prisma.tripStop.create({
    data: {
      tripId: trip1.id,
      cityId: rome.id,
      orderIndex: 1,
      arrivalDate: new Date("2026-06-04"),
      departureDate: new Date("2026-06-07"),
      notes: "Stay in Trastevere neighborhood",
    },
  });

  const stop3 = await prisma.tripStop.create({
    data: {
      tripId: trip1.id,
      cityId: barcelona.id,
      orderIndex: 2,
      arrivalDate: new Date("2026-06-07"),
      departureDate: new Date("2026-06-10"),
      notes: "Beachfront hotel in Barceloneta",
    },
  });

  console.log("✅ Sample trip created with 3 stops");

  const communityPostsData = [
    {
      userId: user1.id,
      tripId: trip1.id,
      cityId: paris.id,
      title: "Paris in June was magical",
      content: "Skip-the-line Eiffel Tower tickets saved us hours — go up at sunset for the best light over the city.",
    },
    {
      userId: user2.id,
      cityId: rome.id,
      title: "Rome food tip: Trastevere at night",
      content: "The Trastevere food tour was the highlight of our trip. Book the evening slot to catch the neighborhood lit up.",
    },
    {
      userId: user1.id,
      cityId: barcelona.id,
      title: "Sagrada Família — book weeks ahead",
      content: "Tower access tickets sell out fast in summer. We booked 3 weeks early and still only got a mid-afternoon slot.",
    },
  ];

  for (const post of communityPostsData) {
    const existing = await prisma.communityPost.findFirst({ where: { userId: post.userId, title: post.title } });
    if (existing) continue;
    await prisma.communityPost.create({ data: post });
  }
  console.log("✅ Community posts created");

  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
