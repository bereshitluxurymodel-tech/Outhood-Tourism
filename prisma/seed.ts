import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// All accounts and data created here are DEVELOPMENT/DEMO ONLY.
// Passwords below are placeholders for local testing — never reuse them
// anywhere real, and never seed this data against a production database.
const DEMO_PASSWORD = "Outhood!Demo1";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Demo accounts ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@outhood.dev" },
    update: {},
    create: { name: "Outhood Admin", email: "admin@outhood.dev", passwordHash, role: "ADMIN" },
  });

  const supplierUser = await prisma.user.upsert({
    where: { email: "supplier@outhood.dev" },
    update: {},
    create: { name: "Maasai Mara Camps Ltd (Demo)", email: "supplier@outhood.dev", passwordHash, role: "SUPPLIER" },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@outhood.dev" },
    update: {},
    create: { name: "Demo Traveller", email: "customer@outhood.dev", passwordHash, role: "CUSTOMER" },
  });

  const supplier = await prisma.supplier.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: {
      userId: supplierUser.id,
      businessName: "Maasai Mara Camps Ltd (Demo Supplier)",
      contactPerson: "Jane Wanjiru",
      category: "Lodge",
      location: "Maasai Mara, Narok County",
      description: "Demo supplier account for the Outhood simulation — not a real business.",
      registrationInfo: "TO BE VERIFIED — placeholder for simulation only",
      verificationStatus: "VERIFIED",
    },
  });

  // --- Destinations (demo) ---
  const destinationNames: { name: string; region: string; description: string; imageUrl: string }[] = [
    {
      name: "Maasai Mara",
      region: "Narok County",
      description: "Kenya's most famous safari destination, known for the wildebeest migration.",
      // Wikimedia Commons, public domain (self-published, PD-self license) —
      // https://commons.wikimedia.org/wiki/File:Mara_River_Massai_Mara.jpg
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Mara_River_Massai_Mara.jpg?width=800",
    },
    {
      name: "Diani Beach",
      region: "Kwale County",
      description: "White-sand coastal getaway on the south coast.",
      // Wikimedia Commons —
      // https://commons.wikimedia.org/wiki/File:Diani_Beach_Sunrise_Kenya.jpg
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Diani_Beach_Sunrise_Kenya.jpg?width=800",
    },
    {
      name: "Naivasha",
      region: "Nakuru County",
      description: "Lake-side escape close to Nairobi, popular for weekend trips.",
      // Wikimedia Commons, CC BY 2.0 (Flickr-sourced, verified) —
      // https://commons.wikimedia.org/wiki/File:Lake_Naivasha_sunset_(7234100570).jpg
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Lake_Naivasha_sunset_%287234100570%29.jpg?width=800",
    },
    {
      name: "Amboseli",
      region: "Kajiado County",
      description: "Safari destination known for elephant herds and Kilimanjaro views.",
      // Wikimedia Commons, CC BY 2.0 (Flickr-sourced, verified) —
      // https://commons.wikimedia.org/wiki/File:Elephants_fight_Amboseli_(7234358288)_(2).jpg
      imageUrl:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Elephants_fight_Amboseli_%287234358288%29_%282%29.jpg?width=800",
    },
  ];

  const destinations: Awaited<ReturnType<typeof prisma.destination.upsert>>[] = [];
  for (const d of destinationNames) {
    destinations.push(
      await prisma.destination.upsert({
        where: { name: d.name },
        update: { imageUrl: d.imageUrl, description: d.description, region: d.region },
        create: { ...d, isSeedData: true },
      })
    );
  }

  // --- Demo listings across destinations & types (labeled clearly as demo) ---
  function findDestination(name: string) {
    const match = destinations.find((d) => d.name === name);
    if (!match) throw new Error(`Seed error: destination "${name}" was not created above.`);
    return match;
  }
  const mara = findDestination("Maasai Mara");
  const diani = findDestination("Diani Beach");
  const naivasha = findDestination("Naivasha");
  const amboseli = findDestination("Amboseli");

  async function createListingIfMissing(data: Parameters<typeof prisma.listing.create>[0]["data"] & { title: string }) {
    const existing = await prisma.listing.findFirst({ where: { title: data.title } });
    if (!existing) {
      await prisma.listing.create({ data });
    }
  }

  await createListingIfMissing({
    supplierId: supplier.id,
    destinationId: mara.id,
    type: "ACCOMMODATION",
    title: "Mara Acacia Tented Camp (Demo Listing)",
    description: "Sample listing for demonstration purposes only — not an actual bookable property.",
    basePriceCents: 1500000, // KSh 15,000.00
    currency: "KES",
    status: "APPROVED",
    cancellationPolicy: "Free cancellation up to 48 hours before check-in. TO BE VERIFIED for production use.",
    instantConfirm: true,
    isSeedData: true,
  });

  await createListingIfMissing({
    supplierId: supplier.id,
    destinationId: diani.id,
    type: "ACCOMMODATION",
    title: "Diani Beachfront Cottages (Demo Listing)",
    description: "Sample beachfront accommodation listing for demonstration purposes only.",
    basePriceCents: 900000, // KSh 9,000.00
    currency: "KES",
    status: "APPROVED",
    cancellationPolicy: "Free cancellation up to 72 hours before check-in. TO BE VERIFIED for production use.",
    instantConfirm: true,
    isSeedData: true,
  });

  await createListingIfMissing({
    supplierId: supplier.id,
    destinationId: naivasha.id,
    type: "EXPERIENCE",
    title: "Lake Naivasha Boat & Bike Half-Day (Demo Listing)",
    description: "Sample half-day experience combining a boat ride with cycling near giraffes. Demo only.",
    basePriceCents: 450000, // KSh 4,500.00
    currency: "KES",
    status: "APPROVED",
    cancellationPolicy: "Free cancellation up to 24 hours before the activity. TO BE VERIFIED for production use.",
    instantConfirm: true,
    isSeedData: true,
  });

  await createListingIfMissing({
    supplierId: supplier.id,
    destinationId: amboseli.id,
    type: "TOUR_PACKAGE",
    title: "3-Day Amboseli Safari Package (Demo Listing)",
    description: "Sample multi-day safari package with full-board accommodation and daily game drives. Demo only.",
    basePriceCents: 4500000, // KSh 45,000.00
    currency: "KES",
    status: "APPROVED",
    cancellationPolicy: "Free cancellation up to 7 days before departure. TO BE VERIFIED for production use.",
    instantConfirm: true,
    isSeedData: true,
    itineraryItems: {
      create: [
        { dayNumber: 1, activity: "Depart Nairobi, arrive Amboseli, afternoon game drive", meals: "Lunch, dinner" },
        { dayNumber: 2, activity: "Full-day game drive with Kilimanjaro views", meals: "Breakfast, lunch, dinner" },
        { dayNumber: 3, activity: "Morning game drive, return to Nairobi", meals: "Breakfast" },
      ],
    },
  });

  console.log("Seed complete.");
  console.log(`Demo accounts (password for all: ${DEMO_PASSWORD}):`);
  console.log(`  Admin:    ${admin.email}`);
  console.log(`  Supplier: ${supplierUser.email}`);
  console.log(`  Customer: ${customer.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
