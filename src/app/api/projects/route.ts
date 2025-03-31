import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// GET /api/projects - Get all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        images: {
          select: {
            id: true,
            url: true,
            selected: true,
            revise: true,
            reject: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      userId, 
      purpose, 
      focus, 
      quantity, 
      concepts 
    } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }
    
    // For testing purposes, first check if there are any users
    let user = await prisma.user.findFirst();
    
    // If no users exist, create a test user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });
      console.log('Created test user:', user.id);
    }
    
    // Create the project with additional metadata
    const newProject = await prisma.project.create({
      data: {
        name,
        // Store additional metadata as JSON in description
        description: JSON.stringify({
          description: description || purpose || '',
          purpose,
          focus,
          quantity,
          concepts
        }),
        // Use the first user or the newly created test user
        userId: user.id
      }
    });
    
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 