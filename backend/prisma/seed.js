import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import { HTML_FOUNDATIONS_CONTENT } from '../../frontend/src/data/htmlFoundationsContent.js';
import { CSS_STYLING_CONTENT } from '../../frontend/src/data/cssStylingContent.js';
import { JAVASCRIPT_CORE_CONTENT } from '../../frontend/src/data/javascriptCoreContent.js';
import { REACT_NEXUS_CONTENT } from '../../frontend/src/data/reactNexusContent.js';
import { PROJECT_SHOWCASE_CONTENT } from '../../frontend/src/data/projectShowcaseContent.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('🌱 Starting database seed from frontend curriculum content...');

  // 1. Create or update Web Creator Track
  const webTrack = await prisma.track.upsert({
    where: { slug: 'web-creator' },
    update: {
      title: 'Web Creator',
      description: 'Create beautiful websites, interactive experiences, and modern applications from the ground up.',
      themeColor: '#7c5cff',
      order: 1,
    },
    create: {
      slug: 'web-creator',
      title: 'Web Creator',
      description: 'Create beautiful websites, interactive experiences, and modern applications from the ground up.',
      themeColor: '#7c5cff',
      order: 1,
    },
  });

  console.log(`✅ Track ensured: ${webTrack.title} (${webTrack.slug})`);

  const levelsContent = [
    HTML_FOUNDATIONS_CONTENT,
    CSS_STYLING_CONTENT,
    JAVASCRIPT_CORE_CONTENT,
    REACT_NEXUS_CONTENT,
    PROJECT_SHOWCASE_CONTENT,
  ];

  let totalLessons = 0;
  let totalChallenges = 0;

  for (let lIdx = 0; lIdx < levelsContent.length; lIdx++) {
    const rawLevel = levelsContent[lIdx];
    const levelSlug = rawLevel.slug || rawLevel.id;

    // Upsert Level
    const level = await prisma.level.upsert({
      where: { slug: levelSlug },
      update: {
        title: rawLevel.title,
        subtitle: rawLevel.subtitle || null,
        description: rawLevel.description || null,
        version: rawLevel.version || 1,
        status: rawLevel.status || 'published',
        accent: rawLevel.accent || '#7c5cff',
        estimatedMinutes: rawLevel.estimatedMinutes || 60,
        order: lIdx + 1,
        trackId: webTrack.id,
      },
      create: {
        slug: levelSlug,
        title: rawLevel.title,
        subtitle: rawLevel.subtitle || null,
        description: rawLevel.description || null,
        version: rawLevel.version || 1,
        status: rawLevel.status || 'published',
        accent: rawLevel.accent || '#7c5cff',
        estimatedMinutes: rawLevel.estimatedMinutes || 60,
        order: lIdx + 1,
        trackId: webTrack.id,
      },
    });

    console.log(`  📦 Level: ${level.title} (${level.slug})`);

    // Upsert Lessons
    const lessons = rawLevel.lessons || [];
    for (let i = 0; i < lessons.length; i++) {
      const les = lessons[i];
      const lessonSlug = les.slug || les.id;

      await prisma.lesson.upsert({
        where: {
          levelId_slug: {
            levelId: level.id,
            slug: lessonSlug,
          },
        },
        update: {
          order: les.order || i + 1,
          title: les.title,
          subtitle: les.subtitle || null,
          description: les.description || null,
          difficulty: les.difficulty || 'beginner',
          xp: les.xp || 50,
          estimatedMinutes: les.estimatedMinutes || 10,
          status: les.status || 'published',
          blocks: les.blocks || [],
        },
        create: {
          slug: lessonSlug,
          order: les.order || i + 1,
          title: les.title,
          subtitle: les.subtitle || null,
          description: les.description || null,
          difficulty: les.difficulty || 'beginner',
          xp: les.xp || 50,
          estimatedMinutes: les.estimatedMinutes || 10,
          status: les.status || 'published',
          blocks: les.blocks || [],
          levelId: level.id,
        },
      });
      totalLessons++;
    }

    // Upsert Challenges
    const challenges = rawLevel.challenges || [];
    for (let c = 0; c < challenges.length; c++) {
      const ch = challenges[c];
      const chSlug = ch.slug || ch.id || `challenge-${c + 1}`;

      // Find if exists or create
      const existing = await prisma.challenge.findFirst({
        where: {
          levelId: level.id,
          order: ch.order || c + 1,
        },
      });

      if (existing) {
        await prisma.challenge.update({
          where: { id: existing.id },
          data: {
            title: ch.title || `Challenge ${c + 1}`,
            subtitle: ch.subtitle || null,
            description: ch.description || null,
            difficulty: ch.difficulty || 'beginner',
            xp: ch.xp || 100,
            estimatedMinutes: ch.estimatedMinutes || 15,
            status: ch.status || 'published',
            tasks: ch.tasks || [],
            starterCode: ch.starterCode || null,
            solutionCode: ch.solutionCode || null,
            hints: ch.hints || [],
          },
        });
      } else {
        await prisma.challenge.create({
          data: {
            slug: chSlug,
            order: ch.order || c + 1,
            title: ch.title || `Challenge ${c + 1}`,
            subtitle: ch.subtitle || null,
            description: ch.description || null,
            difficulty: ch.difficulty || 'beginner',
            xp: ch.xp || 100,
            estimatedMinutes: ch.estimatedMinutes || 15,
            status: ch.status || 'published',
            tasks: ch.tasks || [],
            starterCode: ch.starterCode || null,
            solutionCode: ch.solutionCode || null,
            hints: ch.hints || [],
            levelId: level.id,
          },
        });
      }
      totalChallenges++;
    }
  }

  console.log(`\n🎉 Seed completed successfully!`);
  console.log(`   - 1 Track`);
  console.log(`   - ${levelsContent.length} Levels`);
  console.log(`   - ${totalLessons} Lessons transferred to database`);
  console.log(`   - ${totalChallenges} Challenges transferred to database`);

  await pool.end();
}

seed().catch(async (e) => {
  console.error('❌ Error during seeding:', e);
  await pool.end();
  process.exit(1);
});
