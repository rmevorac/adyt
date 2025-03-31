import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Define product directories
const productDirectories = [
  'Anastasia_Necklace',
  'Madeline_Necklace',
  'Nila_Bracelet',
  'Davina_Lifestyle',
  'Newspaper_Lifestyle',
  'Pippa_Lifestyle',
  'Macaroons',
  'Shopping_Lifestyle'
];

// Function to get all images from a product directory
function getProductImages(productDir: string): { main: string; variations: string[] } {
  const dirPath = path.join(process.cwd(), 'public', 'images', productDir);
  try {
    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.png') || file.endsWith('.jpeg'))
      .map(file => `/images/${productDir}/${file}`);
    
    // Return the first image as main and the rest as variations
    return {
      main: files[0],
      variations: files.slice(1)
    };
  } catch (error) {
    console.error(`Error reading directory ${productDir}:`, error);
    return { main: '', variations: [] };
  }
}

async function main() {
  // Clear existing data
  await prisma.image.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared');

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create a test project
  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      description: 'A demonstration project with sample images',
      userId: user.id,
    },
  });

  console.log(`Created project: ${project.name}`);

  // Create images for each product directory
  for (const productDir of productDirectories) {
    const { main, variations } = getProductImages(productDir);
    if (main) {
      await prisma.image.create({
        data: {
          url: main,
          projectId: project.id,
          selected: false,
          revise: false,
          reject: false,
          variations,
        },
      });
      console.log(`Created image for ${productDir} with ${variations.length} variations`);
    }
  }

  console.log('Finished creating all images');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 