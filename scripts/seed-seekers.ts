import { db } from '../server/db';
import { seekerProfiles, users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedSeekers() {
  console.log('🌱 Seeding seeker profiles...');

  try {
    // Get all users
    const allUsers = await db.select().from(users);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found. Please run seed-listings.ts first to create users.');
      return;
    }

    // Create seeker profiles
    const seekerData = [
      {
        userId: allUsers[0].id,
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        age: 24,
        gender: 'female',
        about: 'Üniversite öğrencisiyim. Temiz ve düzenli bir ev arıyorum. Sigara içmiyorum ve evcil hayvanım yok.',
        budgetWeekly: '2500',
        preferredLocations: ['Kadıköy', 'Beşiktaş', 'Şişli'],
        moveInDate: new Date('2025-02-01'),
        stayDuration: '12 ay',
        occupation: 'Öğrenci',
        smokingStatus: 'non-smoker',
        petOwner: false,
        isActive: true,
        isFeatured: true,
      },
      {
        userId: allUsers[1]?.id || allUsers[0].id,
        firstName: 'Mehmet',
        lastName: 'Demir',
        age: 28,
        gender: 'male',
        about: 'Yazılım mühendisiyim. Sakin ve huzurlu bir ortamda çalışabileceğim bir oda arıyorum.',
        budgetWeekly: '3500',
        preferredLocations: ['Beşiktaş', 'Levent', 'Maslak'],
        moveInDate: new Date('2025-01-15'),
        stayDuration: '6 ay',
        occupation: 'Yazılım Mühendisi',
        smokingStatus: 'non-smoker',
        petOwner: false,
        isActive: true,
        isFeatured: true,
      },
      {
        userId: allUsers[2]?.id || allUsers[0].id,
        firstName: 'Zeynep',
        lastName: 'Kaya',
        age: 26,
        gender: 'female',
        about: 'Sosyal bir insanım. Ev arkadaşlarımla vakit geçirmeyi severim. Kedim var, evcil hayvan dostu ev arıyorum.',
        budgetWeekly: '3000',
        preferredLocations: ['Kadıköy', 'Moda', 'Caddebostan'],
        moveInDate: new Date('2025-02-15'),
        stayDuration: '12 ay',
        occupation: 'Grafik Tasarımcı',
        smokingStatus: 'non-smoker',
        petOwner: true,
        isActive: true,
        isFeatured: true,
      },
      {
        userId: allUsers[0].id,
        firstName: 'Ahmet',
        lastName: 'Şahin',
        age: 30,
        gender: 'male',
        about: 'Çalışan bir profesyonelim. Sakin ve temiz bir ev arıyorum. Hafta sonları genelde evde olmam.',
        budgetWeekly: '4000',
        preferredLocations: ['Ankara', 'Çankaya', 'Kızılay'],
        moveInDate: new Date('2025-03-01'),
        stayDuration: '24 ay',
        occupation: 'Muhasebeci',
        smokingStatus: 'social-smoker',
        petOwner: false,
        isActive: true,
        isFeatured: true,
      },
    ];

    // Insert seeker profiles
    for (const seeker of seekerData) {
      // Check if seeker already exists for this user
      const existing = await db
        .select()
        .from(seekerProfiles)
        .where(eq(seekerProfiles.userId, seeker.userId));

      if (existing.length > 0) {
        console.log(`⏭️  Seeker profile already exists for user ${seeker.userId}`);
        continue;
      }

      const [inserted] = await db.insert(seekerProfiles).values(seeker).returning();
      console.log(`✅ Created seeker profile: ${seeker.firstName} ${seeker.lastName} (ID: ${inserted.id})`);
    }

    console.log('✨ Seeker profiles seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding seeker profiles:', error);
    throw error;
  }
}

seedSeekers()
  .then(() => {
    console.log('🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
