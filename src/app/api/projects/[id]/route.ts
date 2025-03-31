import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET /api/projects/[id] - Get a specific project with its images
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }
    
    // Check if project exists
    const projectExists = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!projectExists) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        description
      }
    });
    
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project and its images
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if project exists
    const projectExists = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!projectExists) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Delete all images in the project first
    await prisma.image.deleteMany({
      where: { projectId: id }
    });
    
    // Delete the project
    await prisma.project.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 