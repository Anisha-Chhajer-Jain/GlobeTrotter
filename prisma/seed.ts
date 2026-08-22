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
      password: hashedPassword,
      bio: "Passionate traveler exploring the world one city at a time!",
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
      password: hashedPassword,
      bio: "Adventure seeker & food enthusiast!",
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
