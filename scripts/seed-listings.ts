import { db } from "../server/db";
import { users, listings, listingImages } from "../shared/schema";
import { hashPassword } from "../server/auth";

const sampleUsers = [
  {
    email: "ahmet@example.com",
    password: "password123",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    phone: "+90 555 123 4567",
    bio: "Yazılım mühendisi, temiz ve düzenli yaşamayı seven biri",
    gender: "erkek",
    verificationStatus: "verified"
  },
  {
    email: "ayse@example.com",
    password: "password123",
    firstName: "Ayşe",
    lastName: "Demir",
    phone: "+90 555 234 5678",
    bio: "Öğrenci, sosyal ve arkadaş canlısı",
    gender: "kadın",
    verificationStatus: "verified"
  },
  {
    email: "mehmet@example.com",
    password: "password123",
    firstName: "Mehmet",
    lastName: "Kaya",
    phone: "+90 555 345 6789",
    bio: "İş insanı, sakin ortamları tercih ederim",
    gender: "erkek",
    verificationStatus: "verified"
  }
];

const sampleListings = [
  {
    title: "Beşiktaş'ta Deniz Manzaralı Geniş Oda",
    description: "Boğaz manzaralı, merkezi konumda, tam eşyalı oda. Toplu taşıma araçlarına 5 dakika yürüme mesafesinde.",
    address: "Beşiktaş Mahallesi, Çırağan Caddesi No: 15",
    suburb: "Beşiktaş",
    city: "İstanbul",
    state: "İstanbul",
    postcode: "34349",
    rentAmount: "8500",
    bondAmount: "8500",
    availableFrom: "2025-01-15",
    roomType: "private",
    propertyType: "apartment",
    furnished: true,
    billsIncluded: true,
    parkingAvailable: false,
    internetIncluded: true,
    status: "active"
  },
  {
    title: "Kadıköy'de Öğrenci Dostu Oda",
    description: "Üniversitelere yakın, canlı bir mahallede, uygun fiyatlı oda. Ev arkadaşları sıcakkanlı ve yardımsever.",
    address: "Moda Mahallesi, Bahariye Caddesi No: 45",
    suburb: "Kadıköy",
    city: "İstanbul",
    state: "İstanbul",
    postcode: "34710",
    rentAmount: "6000",
    bondAmount: "6000",
    availableFrom: "2025-02-01",
    roomType: "shared",
    propertyType: "apartment",
    furnished: true,
    billsIncluded: false,
    parkingAvailable: false,
    internetIncluded: true,
    status: "active"
  },
  {
    title: "Çankaya'da Lüks Daire",
    description: "Modern, yeni yapılmış binada, geniş ve konforlu oda. Güvenlik, otopark ve tüm sosyal olanaklar mevcut.",
    address: "Çankaya Mahallesi, Atatürk Bulvarı No: 120",
    suburb: "Çankaya",
    city: "Ankara",
    state: "Ankara",
    postcode: "06680",
    rentAmount: "7500",
    bondAmount: "7500",
    availableFrom: "2025-01-20",
    roomType: "private",
    propertyType: "apartment",
    furnished: true,
    billsIncluded: true,
    parkingAvailable: true,
    internetIncluded: true,
    status: "active"
  },
  {
    title: "Alsancak'ta Denize Yakın Oda",
    description: "İzmir'in kalbinde, denize 10 dakika yürüme mesafesinde ferah oda. Kafeler, restoranlar ve AVM'lere yakın.",
    address: "Alsancak Mahallesi, Kıbrıs Şehitleri Caddesi No: 78",
    suburb: "Alsancak",
    city: "İzmir",
    state: "İzmir",
    postcode: "35220",
    rentAmount: "5500",
    bondAmount: "5500",
    availableFrom: "2025-01-10",
    roomType: "private",
    propertyType: "house",
    furnished: true,
    billsIncluded: false,
    parkingAvailable: true,
    internetIncluded: true,
    status: "active"
  },
  {
    title: "Bostanlı'da Müstakil Ev",
    description: "Bahçeli, geniş müstakil evde oda. Sakin ve huzurlu bir ortam. Evcil hayvan kabul edilir.",
    address: "Bostanlı Mahallesi, Atatürk Caddesi No: 234",
    suburb: "Bostanlı",
    city: "İzmir",
    state: "İzmir",
    postcode: "35590",
    rentAmount: "6500",
    bondAmount: "6500",
    availableFrom: "2025-02-15",
    roomType: "private",
    propertyType: "house",
    furnished: false,
    billsIncluded: true,
    parkingAvailable: true,
    internetIncluded: true,
    status: "active"
  }
];

async function seed() {
  try {
    console.log("🌱 Seeding database with sample data...");

    console.log("📝 Creating users...");
    const createdUsers: any[] = [];
    for (const userData of sampleUsers) {
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, userData.email)
      });

      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        createdUsers.push(existingUser);
      } else {
        const hashedPassword = await hashPassword(userData.password);
        const [newUser] = await db.insert(users).values({
          ...userData,
          password: hashedPassword
        }).returning();
        console.log(`✅ Created user: ${newUser.email}`);
        createdUsers.push(newUser);
      }
    }

    console.log("\n🏠 Creating listings...");
    for (let i = 0; i < sampleListings.length; i++) {
      const listingData = sampleListings[i];
      const userId = createdUsers[i % createdUsers.length].id;

      const existingListing = await db.query.listings.findFirst({
        where: (listings, { eq }) => eq(listings.title, listingData.title)
      });

      if (existingListing) {
        console.log(`⏭️  Listing "${listingData.title}" already exists, skipping...`);
      } else {
        const [newListing] = await db.insert(listings).values({
          ...listingData,
          userId
        }).returning();
        console.log(`✅ Created listing: ${newListing.title}`);
      }
    }

    console.log("\n✨ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
