import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample professor
  const professorPassword = await bcrypt.hash('professor123', 10);
  const professor = await prisma.user.upsert({
    where: { email: 'professor@example.com' },
    update: {},
    create: {
      email: 'professor@example.com',
      passwordHash: professorPassword,
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      role: 'professor',
    },
  });
  console.log('✅ Created professor:', professor.email);

  // Create sample student
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash: studentPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
    },
  });
  console.log('✅ Created student:', student.email);

  // Create sample articles
  const article1 = await prisma.article.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Habitat Fragmentation and Landscape Connectivity',
      author: 'Fahrig, L.',
      year: 2003,
      learningObjectives: [
        'Define habitat fragmentation and its components.',
        'Explain the difference between structural and functional connectivity.',
        'Analyze the effects of fragmentation on species persistence.',
      ],
      keyConcepts: ['Habitat loss', 'Patch size', 'Edge effects', 'Corridors', 'Matrix quality'],
      content: `Abstract: Habitat fragmentation is the process by which large and continuous habitats get divided into smaller, more isolated patches. This process has two main components: a reduction in the total amount of habitat, and a change in the spatial configuration of the remaining habitat. Historically, research has often confounded these two effects. This review clarifies the distinction and emphasizes that habitat loss has large, consistently negative effects on biodiversity. Fragmentation per se (i.e., the breaking apart of habitat, independent of habitat loss) has much weaker, less consistent effects, which can be positive or negative. The primary threat to biodiversity is habitat loss, and conservation efforts should prioritize its prevention.

Introduction: Landscape ecology provides the theoretical framework for understanding the ecological consequences of spatial heterogeneity. As human activities increasingly alter natural landscapes, understanding the impacts of habitat fragmentation becomes crucial for effective conservation planning. The debate over the relative importance of habitat loss versus fragmentation has significant implications for how we manage landscapes. For example, if fragmentation per se is the main problem, strategies like creating habitat corridors might be prioritized. If habitat loss is the dominant driver, then protecting and restoring large blocks of habitat is paramount.

Methods: This review synthesizes findings from over 100 empirical studies that have attempted to separate the effects of habitat loss from those of a habitat fragmentation. Studies were included if they measured species richness, abundance, or persistence in landscapes with varying levels of habitat amount and fragmentation. A meta-analytical approach was used to identify general patterns across different taxa and ecosystems.

Results: The meta-analysis revealed that habitat amount was the single most important predictor of species response. In over 90% of the studies, a reduction in habitat area had a significant negative impact. The effects of patch size and isolation were generally weaker and more variable. Some species, particularly edge-specialists, even benefited from a certain degree of fragmentation.

Discussion: The persistent focus on fragmentation as a primary driver of biodiversity loss may be misdirecting conservation resources. While connectivity is important, its benefits are often context-dependent and are secondary to the overwhelming need to preserve as much habitat as possible. Future research should focus on identifying the specific landscape contexts and species traits for which fragmentation effects are most pronounced. Conservation strategies should be evidence-based, focusing on stopping habitat loss and initiating large-scale habitat restoration.`,
      isPublic: true,
    },
  });
  console.log('✅ Created article:', article1.title);

  const article2 = await prisma.article.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Scale Concepts in Landscape Ecology',
      author: 'Wiens, J. A.',
      year: 1989,
      learningObjectives: [
        'Define scale, grain, and extent.',
        'Explain why ecological patterns are scale-dependent.',
        'Apply scale concepts to a research question.',
      ],
      keyConcepts: ['Scale', 'Grain', 'Extent', 'Hierarchy Theory', 'Extrapolation'],
      content: `Abstract: Scale is a fundamental concept in ecology, yet its treatment is often implicit or inconsistent. In landscape ecology, spatial and temporal scales are central to understanding pattern and process. This paper explores the components of scale—grain and extent—and discusses how the perception of ecological patterns is contingent on the scale of observation. Failure to explicitly consider scale can lead to misinterpretation of data and flawed management decisions.

Introduction: The world is not homogenous. Ecological systems exhibit patterns across a vast range of spatial and temporal scales. A pattern that is apparent at one scale may disappear or be reversed at another. For example, the distribution of a plant species may appear clumped when observed within a 1-hectare plot but random when viewed across a 1000-square-kilometer landscape. Landscape ecologists must therefore be explicit about the scale at which they are working.

Components of Scale: Scale has two primary components: grain and extent. Grain refers to the finest spatial or temporal resolution of the data (e.g., the pixel size in a satellite image or the duration of a single observation). Extent refers to the overall size of the study area or the total duration of the study. The combination of grain and extent defines the "window" through which we observe an ecological system.

Implications for Research: The choice of scale determines the questions that can be asked and the patterns that can be detected. There is no single "correct" scale for ecological research. The appropriate scale is dictated by the organism or process being studied. This is known as the "organism-centered" view of scale. For example, the scale relevant to a foraging beetle is vastly different from the scale relevant to a migrating caribou.

Conclusion: Explicitly addressing scale is not just a methodological nicety; it is essential for advancing ecological understanding and for applying that understanding to real-world problems. Researchers must justify their choice of scale and be cautious when extrapolating findings from one scale to another. A multi-scale approach is often necessary to gain a comprehensive understanding of complex ecological phenomena.`,
      isPublic: true,
    },
  });
  console.log('✅ Created article:', article2.title);

  // Create sample assignment
  const assignment = await prisma.assignment.create({
    data: {
      professorId: professor.id,
      articleId: article1.id,
      title: 'Critical Analysis: Habitat Fragmentation',
      description: 'Read the Fahrig (2003) article and engage with the AI tutor to explore the key concepts. Focus on distinguishing between habitat loss and fragmentation per se. Your conversation will be graded on the quality of your questions and critical thinking.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      gradingRubric: {
        criteria: [
          {
            name: 'Question Quality',
            maxPoints: 25,
            description: 'Student asks thoughtful, probing questions rather than passively accepting AI responses.',
          },
          {
            name: 'Critical Thinking',
            maxPoints: 25,
            description: 'Student challenges AI claims, identifies gaps, and asks for evidence.',
          },
          {
            name: 'Concept Application',
            maxPoints: 20,
            description: 'Student applies concepts from the article to real-world examples.',
          },
          {
            name: 'Citation Usage',
            maxPoints: 15,
            description: 'Student references specific parts of the article in their discussion.',
          },
          {
            name: 'AI Literacy',
            maxPoints: 15,
            description: 'Student recognizes AI limitations, verifies claims, and uses AI as a tool not an oracle.',
          },
        ],
      },
    },
  });
  console.log('✅ Created assignment:', assignment.title);

  console.log('🌱 Seeding complete!');
  console.log('\n📧 Login credentials:');
  console.log('Professor: professor@example.com / professor123');
  console.log('Student: student@example.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
