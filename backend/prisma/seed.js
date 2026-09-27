import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Web Creator Content
import { HTML_FOUNDATIONS_CONTENT } from '../../frontend/src/data/htmlFoundationsContent.js';
import { CSS_STYLING_CONTENT } from '../../frontend/src/data/cssStylingContent.js';
import { JAVASCRIPT_CORE_CONTENT } from '../../frontend/src/data/javascriptCoreContent.js';
import { REACT_NEXUS_CONTENT } from '../../frontend/src/data/reactNexusContent.js';
import { PROJECT_SHOWCASE_CONTENT } from '../../frontend/src/data/projectShowcaseContent.js';

// C++ Systems Architect Content
import cppSyntaxCoreContent from '../../frontend/src/data/cppSyntaxCoreContent.js';
import cppDataCircuitsContent from '../../frontend/src/data/cppDataCircuitsContent.js';
import cppLogicGatesContent from '../../frontend/src/data/cppLogicGatesContent.js';
import cppFunctionEngineContent from '../../frontend/src/data/cppFunctionEngineContent.js';
import cppArrayMatrixContent from '../../frontend/src/data/cppArrayMatrixContent.js';
import cppMemoryVaultContent from '../../frontend/src/data/cppMemoryVaultContent.js';
import cppObjectForgeContent from '../../frontend/src/data/cppObjectForgeContent.js';
import cppStlCommandContent from '../../frontend/src/data/cppStlCommandContent.js';
import cppFinalSystemContent from '../../frontend/src/data/cppFinalSystemContent.js';

// Algorithm & Data Structures Content
import { ALGO_SECTORS } from '../../frontend/src/data/algorithmWorldLevels.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('🌱 Starting comprehensive database seed for all CodeLand worlds...');

  // =========================================================================
  // 1. TRACK: Web Creator
  // =========================================================================
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

  const webLevelsContent = [
    HTML_FOUNDATIONS_CONTENT,
    CSS_STYLING_CONTENT,
    JAVASCRIPT_CORE_CONTENT,
    REACT_NEXUS_CONTENT,
    PROJECT_SHOWCASE_CONTENT,
  ];

  let totalWebLessons = 0;
  let totalWebChallenges = 0;

  for (let lIdx = 0; lIdx < webLevelsContent.length; lIdx++) {
    const rawLevel = webLevelsContent[lIdx];
    const levelSlug = rawLevel.slug || rawLevel.id;

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

    // Lessons
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
      totalWebLessons++;
    }

    // Challenges
    const challenges = rawLevel.challenges || [];
    for (let c = 0; c < challenges.length; c++) {
      const ch = challenges[c];
      const chSlug = ch.slug || ch.id || `challenge-${c + 1}`;

      const existing = await prisma.challenge.findFirst({
        where: {
          levelId: level.id,
          slug: chSlug,
        },
      });

      if (existing) {
        await prisma.challenge.update({
          where: { id: existing.id },
          data: {
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
      totalWebChallenges++;
    }
  }

  // =========================================================================
  // 2. TRACK: C++ Systems Architect (cpp-developer)
  // =========================================================================
  const cppTrack = await prisma.track.upsert({
    where: { slug: 'cpp-developer' },
    update: {
      title: 'C++ Systems Architect',
      description: 'Master systems programming, high-performance algorithms, pointer memory management, and modern C++ engineering.',
      themeColor: '#00599c',
      order: 2,
    },
    create: {
      slug: 'cpp-developer',
      title: 'C++ Systems Architect',
      description: 'Master systems programming, high-performance algorithms, pointer memory management, and modern C++ engineering.',
      themeColor: '#00599c',
      order: 2,
    },
  });

  console.log(`✅ Track ensured: ${cppTrack.title} (${cppTrack.slug})`);

  const cppLevelsContent = [
    cppSyntaxCoreContent,
    cppDataCircuitsContent,
    cppLogicGatesContent,
    cppFunctionEngineContent,
    cppArrayMatrixContent,
    cppMemoryVaultContent,
    cppObjectForgeContent,
    cppStlCommandContent,
    cppFinalSystemContent,
  ];

  let totalCppLessons = 0;
  let totalCppChallenges = 0;

  for (let lIdx = 0; lIdx < cppLevelsContent.length; lIdx++) {
    const rawLevel = cppLevelsContent[lIdx];
    const levelSlug = rawLevel.slug || rawLevel.id;

    const level = await prisma.level.upsert({
      where: { slug: levelSlug },
      update: {
        title: rawLevel.title,
        subtitle: rawLevel.subtitle || null,
        description: rawLevel.description || null,
        version: rawLevel.version || 1,
        status: rawLevel.status || 'published',
        accent: rawLevel.accent || '#00599c',
        estimatedMinutes: rawLevel.estimatedMinutes || 60,
        order: lIdx + 1,
        trackId: cppTrack.id,
      },
      create: {
        slug: levelSlug,
        title: rawLevel.title,
        subtitle: rawLevel.subtitle || null,
        description: rawLevel.description || null,
        version: rawLevel.version || 1,
        status: rawLevel.status || 'published',
        accent: rawLevel.accent || '#00599c',
        estimatedMinutes: rawLevel.estimatedMinutes || 60,
        order: lIdx + 1,
        trackId: cppTrack.id,
      },
    });

    console.log(`  ⚙️ C++ Level: ${level.title} (${level.slug})`);

    // Lessons
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
      totalCppLessons++;
    }

    // Challenges
    const challenges = rawLevel.challenges || [];
    for (let c = 0; c < challenges.length; c++) {
      const ch = challenges[c];
      const chSlug = ch.slug || ch.id || `challenge-${c + 1}`;

      const existing = await prisma.challenge.findFirst({
        where: {
          levelId: level.id,
          slug: chSlug,
        },
      });

      if (existing) {
        await prisma.challenge.update({
          where: { id: existing.id },
          data: {
            order: ch.order || c + 1,
            title: ch.title || `Challenge ${c + 1}`,
            subtitle: ch.subtitle || null,
            description: ch.description || null,
            difficulty: ch.difficulty || 'intermediate',
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
            difficulty: ch.difficulty || 'intermediate',
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
      totalCppChallenges++;
    }
  }

  // =========================================================================
  // 3. TRACK: Algorithm & Data Structures (algorithm-master)
  // =========================================================================
  const algoTrack = await prisma.track.upsert({
    where: { slug: 'algorithm-master' },
    update: {
      title: 'Algorithm & Data Structures',
      description: 'Master time and space complexity, dynamic structures, search trees, and visual algorithmic problem solving.',
      themeColor: '#10b981',
      order: 3,
    },
    create: {
      slug: 'algorithm-master',
      title: 'Algorithm & Data Structures',
      description: 'Master time and space complexity, dynamic structures, search trees, and visual algorithmic problem solving.',
      themeColor: '#10b981',
      order: 3,
    },
  });

  console.log(`✅ Track ensured: ${algoTrack.title} (${algoTrack.slug})`);

  let totalAlgoLessons = 0;
  let totalAlgoChallenges = 0;

  for (let sIdx = 0; sIdx < ALGO_SECTORS.length; sIdx++) {
    const sector = ALGO_SECTORS[sIdx];
    const levelSlug = sector.id;

    const level = await prisma.level.upsert({
      where: { slug: levelSlug },
      update: {
        title: sector.title,
        subtitle: sector.subtitle || null,
        description: sector.description || null,
        version: 1,
        status: 'published',
        accent: sector.accent || '#10b981',
        estimatedMinutes: (sector.lessons?.length || 1) * 15,
        order: Number(sector.order) || sIdx + 1,
        trackId: algoTrack.id,
      },
      create: {
        slug: levelSlug,
        title: sector.title,
        subtitle: sector.subtitle || null,
        description: sector.description || null,
        version: 1,
        status: 'published',
        accent: sector.accent || '#10b981',
        estimatedMinutes: (sector.lessons?.length || 1) * 15,
        order: Number(sector.order) || sIdx + 1,
        trackId: algoTrack.id,
      },
    });

    console.log(`  🌲 Algo Sector: ${level.title} (${level.slug})`);

    const lessons = sector.lessons || [];
    for (let i = 0; i < lessons.length; i++) {
      const les = lessons[i];
      const lessonSlug = les.id || `algo-lesson-${i + 1}`;

      await prisma.lesson.upsert({
        where: {
          levelId_slug: {
            levelId: level.id,
            slug: lessonSlug,
          },
        },
        update: {
          order: i + 1,
          title: les.title,
          subtitle: les.subtitle || null,
          description: les.concept || les.analogyDescription || null,
          difficulty: 'intermediate',
          xp: 75,
          estimatedMinutes: 15,
          status: 'published',
          blocks: [
            {
              type: 'concept',
              title: les.analogyTitle || les.title,
              content: les.analogyDescription || les.concept,
            },
            {
              type: 'complexity',
              time: les.timeComplexity,
              space: les.spaceComplexity,
            },
            {
              type: 'interactive',
              visualizerType: les.visualizerType,
              steps: les.steps || [],
            },
          ],
        },
        create: {
          slug: lessonSlug,
          order: i + 1,
          title: les.title,
          subtitle: les.subtitle || null,
          description: les.concept || les.analogyDescription || null,
          difficulty: 'intermediate',
          xp: 75,
          estimatedMinutes: 15,
          status: 'published',
          blocks: [
            {
              type: 'concept',
              title: les.analogyTitle || les.title,
              content: les.analogyDescription || les.concept,
            },
            {
              type: 'complexity',
              time: les.timeComplexity,
              space: les.spaceComplexity,
            },
            {
              type: 'interactive',
              visualizerType: les.visualizerType,
              steps: les.steps || [],
            },
          ],
          levelId: level.id,
        },
      });
      totalAlgoLessons++;

      // If the lesson has a quiz/challenge component, seed as challenge too
      if (les.question || les.starterCode) {
        const chSlug = `${lessonSlug}-quiz`;
        const existingCh = await prisma.challenge.findFirst({
          where: { levelId: level.id, slug: chSlug },
        });

        if (existingCh) {
          await prisma.challenge.update({
            where: { id: existingCh.id },
            data: {
              order: i + 1,
              title: `${les.title} (Mastery Test)`,
              subtitle: les.timeComplexity || null,
              description: les.question || les.subtitle || null,
              difficulty: 'intermediate',
              xp: 50,
              estimatedMinutes: 10,
              status: 'published',
              starterCode: les.starterCode || null,
              solutionCode: les.cppCode || null,
              hints: les.explanation ? [les.explanation] : [],
              tasks: les.options ? [{ question: les.question, options: les.options, answer: les.answer }] : [],
            },
          });
        } else {
          await prisma.challenge.create({
            data: {
              slug: chSlug,
              order: i + 1,
              title: `${les.title} (Mastery Test)`,
              subtitle: les.timeComplexity || null,
              description: les.question || les.subtitle || null,
              difficulty: 'intermediate',
              xp: 50,
              estimatedMinutes: 10,
              status: 'published',
              starterCode: les.starterCode || null,
              solutionCode: les.cppCode || null,
              hints: les.explanation ? [les.explanation] : [],
              tasks: les.options ? [{ question: les.question, options: les.options, answer: les.answer }] : [],
              levelId: level.id,
            },
          });
        }
        totalAlgoChallenges++;
      }
    }
  }

  console.log(`\n🎉 Seed completed successfully!`);
  console.log(`   - 3 Tracks (Web Creator, C++ Developer, Algorithm Master)`);
  console.log(`   - Total Levels: ${webLevelsContent.length + cppLevelsContent.length + ALGO_SECTORS.length}`);
  console.log(`   - Web: ${totalWebLessons} Lessons, ${totalWebChallenges} Challenges`);
  console.log(`   - C++: ${totalCppLessons} Lessons, ${totalCppChallenges} Challenges`);
  console.log(`   - Algo: ${totalAlgoLessons} Lessons, ${totalAlgoChallenges} Challenges`);

  await pool.end();
}

seed().catch(async (e) => {
  console.error('❌ Error during seeding:', e);
  await pool.end();
  process.exit(1);
});
