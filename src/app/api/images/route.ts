import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// GET /api/images - Get all images (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    // If projectId is provided, filter by project
    const images = projectId 
      ? await prisma.image.findMany({
          where: { projectId },
          orderBy: { createdAt: 'desc' }
        })
      : await prisma.image.findMany({
          orderBy: { createdAt: 'desc' }
        });
    
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST /api/images - Create a new image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, projectId } = body;
    
    if (!url || !projectId) {
      return NextResponse.json(
        { error: 'URL and projectId are required' },
        { status: 400 }
      );
    }
    
    // Create the image
    const newImage = await prisma.image.create({
      data: {
        url,
        projectId,
        selected: false,
        revise: false,
        reject: false
      }
    });
    
    return NextResponse.json({ image: newImage }, { status: 201 });
  } catch (error) {
    console.error('Error creating image:', error);
    return NextResponse.json(
      { error: 'Failed to create image' },
      { status: 500 }
    );
  }
} 