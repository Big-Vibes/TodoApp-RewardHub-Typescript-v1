import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import {startOfWeek, endOfWeek} from 'date-fns';

const pool = new Pool({
    connectionString : process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.taskHistory.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'abioduninaolaji@rewardhub.com',
      passwordHash: adminPassword,
      username: 'vibes',
      role: 'ADMIN',
      totalPoints: 1000,
      currentLevel: 5,
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create test users
  console.log('👥 Creating test users...');
  const testUsers = [];

  for (let i = 1; i <= 5; i++) {
    const password = await bcrypt.hash('User123!', 10);
    const user = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        passwordHash: password,
        username: `user${i}`,
        role: 'USER',
        totalPoints: Math.floor(Math.random() * 500) + 100,
        currentLevel: Math.floor(Math.random() * 3) + 1,
        isActive: true,
        isEmailVerified: true,
      },
    });
    testUsers.push(user);
  }

  // Create tasks for each user
  console.log('📝 Creating tasks...');
  const taskTemplates = [
    { title: 'Complete Daily Exercise', description: 'Do 30 minutes of physical activity', pointValue: 20 },
    { title: 'Drink Water', description: 'Drink 8 glasses of water today', pointValue: 20 },
    { title: 'Learn Something New', description: 'Spend 15 minutes learning', pointValue: 20 },
    { title: 'Meditate', description: 'Meditate for at least 5 minutes', pointValue: 20 },
    { title: 'Write in Journal', description: 'Write a short reflection', pointValue: 20 },
  ];

  for (const user of [...testUsers, admin]) {
    for (const template of taskTemplates) {
      await prisma.task.create({
        data: {
          userId: user.id,
          title: template.title,
          description: template.description,
          pointValue: template.pointValue,
          isCompleted: false,
          completedAt: null,
          cooldownUntil: null,
          lastResetAt: new Date(),
        },
      });
    }
  }

  // Create streaks for users
  console.log('🔥 Creating streak data...');
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

  for (const user of [...testUsers, admin]) {
    await prisma.streak.create({
      data: {
        userId: user.id,
        currentStreak: Math.floor(Math.random() * 7) + 1,
        longestStreak: Math.floor(Math.random() * 14) + 5,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        lastCompletedAt: new Date(),
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Admin: abioduninaolaji@rewardhub.com / Admin123!`);
  console.log(`   - Users: ${testUsers.length} test users (user1@test.com - user5@test.com / User123!)`);
  console.log(`   - Tasks: ${taskTemplates.length} tasks per user`);
  console.log(`   - Streaks: Created for all users`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  
