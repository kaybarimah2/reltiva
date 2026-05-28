import { PrismaClient, Role, PropertyType, ListingType, PropertyStatus, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean existing database
  console.log("Cleaning database...");
  await prisma.passwordResetToken.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.savedProperty.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const agentPassword = await bcrypt.hash("agent123", 10);
  const buyerPassword = await bcrypt.hash("buyer123", 10);

  // 3. Create Amenities
  console.log("Seeding amenities...");
  const amenitiesList = [
    { name: "24/7 Security", icon: "Shield" },
    { name: "Swimming Pool", icon: "Droplets" },
    { name: "Standby Generator", icon: "Zap" },
    { name: "Boys Quarters", icon: "Home" },
    { name: "Air Conditioning", icon: "Wind" },
    { name: "Parking Space", icon: "Car" },
    { name: "Furnished", icon: "Layers" },
    { name: "Gated Community", icon: "Key" },
    { name: "Water Reservoir (Borehole/Polytank)", icon: "Database" },
    { name: "Solar Power System", icon: "Sun" },
  ];

  const amenities: Record<string, any> = {};
  for (const item of amenitiesList) {
    amenities[item.name] = await prisma.amenity.create({
      data: item,
    });
  }

  // 4. Create Users
  console.log("Seeding users...");
  const admin = await prisma.user.create({
    data: {
      name: "Reltiva Admin",
      email: "admin@reltiva.com",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "+233201112222",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
  });

  // Agents
  const agent1 = await prisma.user.create({
    data: {
      name: "Kofi Mensah",
      email: "kofi.mensah@reltiva.com",
      password: agentPassword,
      role: Role.AGENT,
      phone: "+233243334444",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
      profile: {
        create: {
          bio: "Experienced agent focusing on affordable housing in Accra and Tema. 8+ years helping families find homes.",
          agency: "Kofi Mensah Realty",
          licenseNumber: "REA-GH-2023-4882",
          yearsExp: 8,
          verified: true,
        },
      },
      subscriptions: {
        create: {
          plan: SubscriptionPlan.PRO,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paystackRef: "sub_ref_111111",
        },
      },
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: "Ama Serwaa",
      email: "ama.serwaa@reltiva.com",
      password: agentPassword,
      role: Role.AGENT,
      phone: "+233275556666",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      profile: {
        create: {
          bio: "Specializing in residential rentals, compound houses, and land acquisitions in the Ashanti and Eastern regions.",
          agency: "Serwaa Properties & Land Agency",
          licenseNumber: "REA-GH-2024-9102",
          yearsExp: 5,
          verified: true,
        },
      },
      subscriptions: {
        create: {
          plan: SubscriptionPlan.BASIC,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paystackRef: "sub_ref_222222",
        },
      },
    },
  });

  const agent3 = await prisma.user.create({
    data: {
      name: "Kwame Osei",
      email: "kwame.osei@reltiva.com",
      password: agentPassword,
      role: Role.AGENT,
      phone: "+233507778888",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      profile: {
        create: {
          bio: "Real estate broker helping individuals secure affordable apartments and commercial spaces in Accra, Cape Coast, and Takoradi.",
          agency: "Osei Brokerage & Consult",
          licenseNumber: "REA-GH-2025-1033",
          yearsExp: 3,
          verified: false,
        },
      },
      subscriptions: {
        create: {
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
        },
      },
    },
  });

  // Buyers
  const buyer1 = await prisma.user.create({
    data: {
      name: "Yaw Boateng",
      email: "yaw.boateng@reltiva.com",
      password: buyerPassword,
      role: Role.BUYER,
      phone: "+233241113333",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: "Abena Ofori",
      email: "abena.ofori@reltiva.com",
      password: buyerPassword,
      role: Role.BUYER,
      phone: "+233262224444",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    },
  });

  console.log("Users and agents seeded.");

  // 5. Seed 20 Properties across Ghana
  console.log("Seeding 20 properties...");

  const propertiesData = [
    // Greater Accra - Sale & Rent
    {
      title: "Affordable 2-Bedroom Apartment in Adenta",
      description: "Modern and affordable 2-bedroom apartment situated in a peaceful neighborhood of Adenta, Accra. Fitted kitchen, secure compound, constant water supply with polytank reservoir. Ideal for young professionals and small families.",
      price: 350000,
      currency: "GHS",
      type: PropertyType.APARTMENT,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 2,
      bathrooms: 2,
      toilets: 2,
      size: 90,
      region: "Greater Accra",
      city: "Accra",
      neighborhood: "Adenta",
      address: "Off Adenta Barrier Road, Accra",
      latitude: 5.723,
      longitude: -0.165,
      agentId: agent1.id,
      featured: true,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600",
      ],
      amenities: ["Air Conditioning", "Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },
    {
      title: "Cozy Single Chamber and Hall in Madina",
      description: "Affordable self-contained chamber and hall room for rent at Madina. Property features private bathroom, kitchenette, utility meters, and concrete fenced wall. Close to Madina market and transport hubs.",
      price: 800,
      currency: "GHS", // monthly rent
      type: PropertyType.CHAMBER_AND_HALL,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      size: 45,
      region: "Greater Accra",
      city: "Accra",
      neighborhood: "Madina",
      address: "Zongo Junction Street, Madina",
      latitude: 5.679,
      longitude: -0.161,
      agentId: agent1.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
      ],
      amenities: ["Water Reservoir (Borehole/Polytank)", "Parking Space"],
    },
    {
      title: "Beautiful 3-Bedroom House with Boys Quarters",
      description: "Spacious 3-bedroom residential house with a separate boys quarters room, located in Spintex. Complete with security fencing, massive paved compound, standby generator, and modern bathroom fixtures. Price negotiable.",
      price: 1200000,
      currency: "GHS",
      type: PropertyType.HOUSE,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 3,
      bathrooms: 3.5,
      toilets: 4,
      size: 210,
      region: "Greater Accra",
      city: "Accra",
      neighborhood: "Spintex",
      address: "Batsonaa Road, Spintex",
      latitude: 5.626,
      longitude: -0.098,
      agentId: agent1.id,
      featured: true,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
      ],
      amenities: ["24/7 Security", "Standby Generator", "Boys Quarters", "Air Conditioning", "Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },
    {
      title: "Fully Furnished Studio Apartment - East Legon",
      description: "Luxury style yet reasonably priced studio apartment for rent in the heart of East Legon. Features access to a swimming pool, 24/7 corporate security, standby generator, and laundry services. Highly demanded area.",
      price: 6500,
      currency: "GHS", // rent
      type: PropertyType.APARTMENT,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      size: 40,
      region: "Greater Accra",
      city: "Accra",
      neighborhood: "East Legon",
      address: "Lagos Avenue, East Legon",
      latitude: 5.632,
      longitude: -0.155,
      agentId: agent3.id,
      featured: true,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600",
      ],
      amenities: ["24/7 Security", "Swimming Pool", "Standby Generator", "Air Conditioning", "Parking Space", "Furnished", "Water Reservoir (Borehole/Polytank)"],
    },
    {
      title: "Commercial Warehouse & Office space - Tema Area",
      description: "Huge industrial warehouse space with attached multi-room office space located in Tema Community 12. Great road network accessibility for heavy trucks. Includes private high-power transformer and borehole water source.",
      price: 25000,
      currency: "GHS", // rent
      type: PropertyType.COMMERCIAL,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 0,
      bathrooms: 4,
      toilets: 6,
      size: 650,
      region: "Greater Accra",
      city: "Tema",
      neighborhood: "Tema",
      address: "Industrial Area Community 12, Tema",
      latitude: 5.681,
      longitude: -0.015,
      agentId: agent3.id,
      featured: false,
      verified: false,
      images: [
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600",
      ],
      amenities: ["24/7 Security", "Standby Generator", "Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },
    {
      title: "Affordable Plot of Land in Kasoa",
      description: "Registered and serviced half plot of land (35x100 sqft) for quick sale in Kasoa. Electricity close to site, solid flat dry ground requiring no costly piling work. Ready for immediate residential construction.",
      price: 45000,
      currency: "GHS",
      type: PropertyType.LAND,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 0,
      bathrooms: 0,
      toilets: 0,
      size: 325,
      region: "Greater Accra",
      city: "Accra",
      neighborhood: "Kasoa",
      address: "Millennium City, Kasoa",
      latitude: 5.534,
      longitude: -0.421,
      agentId: agent2.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",
      ],
      amenities: [],
    },
    {
      title: "3-Bedroom House for Rent in Dome",
      description: "Decent detached 3-bedroom storey house with a garage and poly-tank water storage. Tiled floors, spacious rooms, located in a highly secured area of Dome. Price is slightly negotiable.",
      price: 3200,
      currency: "GHS",
      type: PropertyType.HOUSE,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 3,
      bathrooms: 2.5,
      toilets: 3,
      size: 160,
      region: "Greater Accra",
      city: "Accra",
      neighborhood: "Dome",
      address: "Dome Pillar 2 Road, Accra",
      latitude: 5.658,
      longitude: -0.221,
      agentId: agent1.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600",
      ],
      amenities: ["Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },
    {
      title: "Traditional Compound House Rooms in Teshie",
      description: "Two separate rooms available in a well-managed compound house at Teshie. Shared kitchen and bathroom, electricity via prepaid meter. Perfect option for students or low-income workers seeking affordable housing.",
      price: 300,
      currency: "GHS",
      type: PropertyType.COMPOUND_HOUSE,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 1,
      bathrooms: 0.5,
      toilets: 1,
      size: 30,
      region: "Greater Accra",
      city: "Accra",
      neighborhood: "Teshie",
      address: "Teshie Lascala area, Teshie",
      latitude: 5.587,
      longitude: -0.102,
      agentId: agent2.id,
      featured: false,
      verified: false,
      images: [
        "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=600",
      ],
      amenities: ["Water Reservoir (Borehole/Polytank)"],
    },

    // Ashanti Region (Kumasi)
    {
      title: "Modern 4-Bedroom House in Nhyiaeso, Kumasi",
      description: "Beautiful executive 4-bedroom house with elegant modern styling in Kumasi’s premier neighborhood, Nhyiaeso. Features boys quarters, solar backup system, electric gate, large garden, and air conditioners in all rooms.",
      price: 1800000,
      currency: "GHS",
      type: PropertyType.HOUSE,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 4,
      bathrooms: 4.5,
      toilets: 5,
      size: 280,
      region: "Ashanti",
      city: "Kumasi",
      neighborhood: "Nhyiaeso",
      address: "Cedar Avenue, Nhyiaeso",
      latitude: 6.682,
      longitude: -1.638,
      agentId: agent2.id,
      featured: true,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
      ],
      amenities: ["24/7 Security", "Boys Quarters", "Air Conditioning", "Parking Space", "Gated Community", "Water Reservoir (Borehole/Polytank)", "Solar Power System"],
    },
    {
      title: "Affordable Chamber and Hall Self Contain - Asokwa",
      description: "Nice and spacious Chamber and Hall Self Contain for rent at Asokwa, Kumasi. Close to Kumasi City Mall. Fenced compound, separate electricity prepaid meter, tiles all around, and secure burglar proof windows.",
      price: 600,
      currency: "GHS",
      type: PropertyType.CHAMBER_AND_HALL,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      size: 50,
      region: "Ashanti",
      city: "Kumasi",
      neighborhood: "Asokwa",
      address: "Behind Kumasi City Mall, Asokwa",
      latitude: 6.669,
      longitude: -1.611,
      agentId: agent2.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600",
      ],
      amenities: ["Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },
    {
      title: "2-Bedroom Flat near KNUST, Kumasi",
      description: "Perfect accommodation choice for students or university workers. 2-bedroom apartment with built-in wardrobes, spacious kitchen with cabinets, gated community, and constant water reservoir supply.",
      price: 1500,
      currency: "GHS",
      type: PropertyType.APARTMENT,
      listingType: ListingType.RENT,
      status: PropertyStatus.UNDER_OFFER,
      bedrooms: 2,
      bathrooms: 2,
      toilets: 2,
      size: 85,
      region: "Ashanti",
      city: "Kumasi",
      neighborhood: "KNUST Area",
      address: "Kotei Road, Kumasi",
      latitude: 6.671,
      longitude: -1.565,
      agentId: agent2.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600",
      ],
      amenities: ["24/7 Security", "Parking Space", "Gated Community", "Water Reservoir (Borehole/Polytank)"],
    },

    // Western Region (Takoradi)
    {
      title: "3-Bedroom House on Acre Land - Beach Road, Takoradi",
      description: "Superb location! Traditional 3-bedroom bungalow sitting on a massive piece of land on Beach Road, Takoradi. Great for development projects or a luxurious family estate. Beautiful sea breeze.",
      price: 2500000,
      currency: "GHS",
      type: PropertyType.HOUSE,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 3,
      size: 350,
      region: "Western",
      city: "Takoradi",
      neighborhood: "Beach Road",
      address: "Beach Road Crescent, Takoradi",
      latitude: 4.887,
      longitude: -1.748,
      agentId: agent3.id,
      featured: true,
      verified: false,
      images: [
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600",
      ],
      amenities: ["Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },
    {
      title: "Commercial Office Spaces in Takoradi Port Area",
      description: "Multiple office spaces ranging from 50sqm to 150sqm for rent in Takoradi. Fitted with split ACs, modern architectural partitions, standby generator, and ample security. Close to the harbour.",
      price: 4500,
      currency: "GHS",
      type: PropertyType.COMMERCIAL,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 0,
      bathrooms: 2,
      toilets: 3,
      size: 90,
      region: "Western",
      city: "Takoradi",
      neighborhood: "Harbour Area",
      address: "Commercial Street, Takoradi",
      latitude: 4.895,
      longitude: -1.751,
      agentId: agent3.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
      ],
      amenities: ["24/7 Security", "Standby Generator", "Air Conditioning", "Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },

    // Central Region (Cape Coast)
    {
      title: "Apartment Building with 6 Compound Units - Cape Coast",
      description: "Investment opportunity! An entire storey building comprising six 2-bedroom apartments. Located in a high-demand student/workers rental area near UCC, Cape Coast. Generates stable rental yield.",
      price: 1350000,
      currency: "GHS",
      type: PropertyType.APARTMENT,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 12,
      bathrooms: 6,
      toilets: 6,
      size: 450,
      region: "Central",
      city: "Cape Coast",
      neighborhood: "UCC Area",
      address: "University Road, Cape Coast",
      latitude: 5.115,
      longitude: -1.278,
      agentId: agent3.id,
      featured: false,
      verified: false,
      images: [
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600",
      ],
      amenities: ["Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },
    {
      title: "Cozy 2-Bedroom Cottage - Elmina Beach Area",
      description: "Charming 2-bedroom home situated just 5 minutes walk from the Elmina beach. Great natural breeze, walled and gated compound, landscaped garden, and solar power support. Excellent vacation home.",
      price: 450000,
      currency: "GHS",
      type: PropertyType.HOUSE,
      listingType: ListingType.SALE,
      status: PropertyStatus.SOLD,
      bedrooms: 2,
      bathrooms: 2,
      toilets: 2,
      size: 110,
      region: "Central",
      city: "Elmina",
      neighborhood: "Elmina Beach",
      address: "Coastal Highway Road, Elmina",
      latitude: 5.084,
      longitude: -1.348,
      agentId: agent2.id,
      featured: true,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1598228723793-52759bba2457?w=600",
      ],
      amenities: ["Air Conditioning", "Parking Space", "Water Reservoir (Borehole/Polytank)", "Solar Power System"],
    },

    // Eastern Region
    {
      title: "Fenced 4-Plot Land in Koforidua",
      description: "A huge flat parcel of land measuring approximately 0.7 acres (4 full plots) located in Koforidua. Suitable for residential estate development or institutional use. Has valid Land Commission registration documents.",
      price: 180000,
      currency: "GHS",
      type: PropertyType.LAND,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 0,
      bathrooms: 0,
      toilets: 0,
      size: 2600,
      region: "Eastern",
      city: "Koforidua",
      neighborhood: "Adweso",
      address: "Adweso Estates Highway, Koforidua",
      latitude: 6.079,
      longitude: -0.258,
      agentId: agent2.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600",
      ],
      amenities: [],
    },

    // Volta Region
    {
      title: "Charming Guesthouse / Commercial Property - Ho",
      description: "Commercial facility with 8 rooms, reception lobby, kitchen, and conference area in Ho, Volta Region. Currently operates as a guesthouse. Magnificent mountain views and serene atmosphere.",
      price: 850000,
      currency: "GHS",
      type: PropertyType.COMMERCIAL,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 8,
      bathrooms: 8,
      toilets: 10,
      size: 380,
      region: "Volta",
      city: "Ho",
      neighborhood: "Ho Estates",
      address: "Mount Sokode Road, Ho",
      latitude: 6.611,
      longitude: 0.471,
      agentId: agent1.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
      ],
      amenities: ["24/7 Security", "Standby Generator", "Air Conditioning", "Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },

    // Northern Region (Tamale)
    {
      title: "Classic 3-Bedroom Compound House in Tamale",
      description: "Extremely spacious compound house with 3 large bedrooms, dynamic local architecture, shaded courtyard patio, and borehole water backup. Located in a family-oriented suburb of Tamale.",
      price: 280000,
      currency: "GHS",
      type: PropertyType.COMPOUND_HOUSE,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 3,
      bathrooms: 2,
      toilets: 2,
      size: 190,
      region: "Northern",
      city: "Tamale",
      neighborhood: "Fuo",
      address: "Fuo Residential Area, Tamale",
      latitude: 9.401,
      longitude: -0.839,
      agentId: agent2.id,
      featured: false,
      verified: false,
      images: [
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=600",
      ],
      amenities: ["Parking Space", "Water Reservoir (Borehole/Polytank)"],
    },
    {
      title: "Single Chamber and Hall Self Contain - Tamale",
      description: "Very budget-friendly chamber and hall room for rent in Tamale. Tiled floor, ceiling fan, independent prepaid meter, and reliable borehole water supply.",
      price: 350,
      currency: "GHS",
      type: PropertyType.CHAMBER_AND_HALL,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      size: 40,
      region: "Northern",
      city: "Tamale",
      neighborhood: "Kalariga",
      address: "Near Kalariga School, Tamale",
      latitude: 9.412,
      longitude: -0.851,
      agentId: agent2.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600",
      ],
      amenities: ["Water Reservoir (Borehole/Polytank)"],
    },

    // Brong Ahafo / Bono
    {
      title: "Commercial Retail Storefront - Sunyani",
      description: "Prime retail storefront location directly on Sunyani main market road. Ideal for shop, bank branch, or customer care center. High foot traffic, secured shutters, and private washroom.",
      price: 2500,
      currency: "GHS",
      type: PropertyType.COMMERCIAL,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 0,
      bathrooms: 1,
      toilets: 1,
      size: 60,
      region: "Bono",
      city: "Sunyani",
      neighborhood: "Sunyani Central",
      address: "Market Road, Sunyani",
      latitude: 7.339,
      longitude: -2.329,
      agentId: agent3.id,
      featured: false,
      verified: true,
      images: [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
      ],
      amenities: ["Parking Space"],
    },
  ];

  for (const prop of propertiesData) {
    const { images, amenities: propAmenities, ...propDetails } = prop;

    // Create property
    const createdProperty = await prisma.property.create({
      data: propDetails,
    });

    // Create image records
    for (let i = 0; i < images.length; i++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: createdProperty.id,
          url: images[i],
          order: i,
        },
      });
    }

    // Connect amenities
    for (const amName of propAmenities) {
      const amObj = amenities[amName];
      if (amObj) {
        await prisma.propertyAmenity.create({
          data: {
            propertyId: createdProperty.id,
            amenityId: amObj.id,
          },
        });
      }
    }
  }

  // 6. Seed some mock enquiries
  console.log("Seeding enquiries...");
  const firstProp = await prisma.property.findFirst({
    where: { title: { contains: "Adenta" } },
  });

  if (firstProp) {
    await prisma.enquiry.create({
      data: {
        propertyId: firstProp.id,
        senderId: buyer1.id,
        agentId: firstProp.agentId,
        message: "Hi, I am very interested in this property. Is the price negotiable? I would like to schedule a viewing this Saturday.",
        status: "NEW",
      },
    });
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
