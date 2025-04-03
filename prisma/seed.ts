import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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
function getProductImages(productDir: string): string[] {
  const dirPath = path.join(process.cwd(), 'public', 'images', productDir);
  try {
    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.jpg')) // Added .jpg
      .map(file => `/images/${productDir}/${file}`);
    
    // Return all found image URLs
    return files;
  } catch (error) {
    console.error(`Error reading directory ${productDir}:`, error);
    return []; // Return an empty array on error
  }
}

async function main() {
  // Clear existing data - This might still run, consider if you want this in prod
  // await prisma.image.deleteMany({});
  // await prisma.project.deleteMany({});
  // await prisma.user.deleteMany({});
  // console.log('Database cleared');

  // --- Conditional Seeding based on Environment --- 
  // Vercel automatically sets NODE_ENV to 'production' for production deployments
  // Preview deployments usually have NODE_ENV as 'preview' or 'development'
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running seed script for non-production environment...');

    // Clear data only for non-production seeds
    await prisma.image.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Non-production database cleared');

    // Create a test user with hashed password
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      },
    });
    console.log(`Created test user: ${user.email}`);

    // Create a test project
    const project = await prisma.project.create({
      data: {
        name: 'Demo Project',
        description: 'A demonstration project with sample images',
        userId: user.id,
      },
    });
    console.log(`Created test project: ${project.name}`);

    // Create images for each product directory
    for (const productDir of productDirectories) {
      const imageUrls = getProductImages(productDir); // Get all image URLs for the directory

      // Create an Image record for each URL found
      for (const imageUrl of imageUrls) {
        await prisma.image.create({
          data: {
            url: imageUrl,
            projectId: project.id,
            // The Image model no longer has selected, revise, reject, variations fields
          },
        });
      }

      if (imageUrls.length > 0) {
        console.log(`Created concept for ${project.name} with ${imageUrls.length} images`);
      } else {
        console.log(`No images found in directory ${productDir}`);
      }
    }

    console.log('Finished creating all test images');
  } else {
    console.log('Skipping seed script for production environment.');
    // You could add production-specific seeding here if needed later
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 