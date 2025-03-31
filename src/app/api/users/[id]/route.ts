import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET /api/users/[id] - Get a specific user with their projects
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            _count: {
              select: { images: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name } = body;
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name }
    });
    
    return NextResponse.json({ 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user and all associated data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find all projects for this user
    const userProjects = await prisma.project.findMany({
      where: { userId: id },
      select: { id: true }
    });
    
    const projectIds = userProjects.map((project: { id: string }) => project.id);
    
    // Delete all images in user's projects
    if (projectIds.length > 0) {
      await prisma.image.deleteMany({
        where: { projectId: { in: projectIds } }
      });
    }
    
    // Delete all projects for this user
    await prisma.project.deleteMany({
      where: { userId: id }
    });
    
    // Delete the user
    await prisma.user.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 