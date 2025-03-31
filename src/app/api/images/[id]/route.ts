import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// GET /api/images/[id] - Get a specific image
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const image = await prisma.image.findUnique({
      where: { id }
    });
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ image });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

// PUT /api/images/[id] - Update a specific image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { selected, revise, reject, reviseNote, rejectNote, reelNote } = body;

    // Check if image exists
    const imageExists = await prisma.image.findUnique({
      where: { id }
    });
    
    if (!imageExists) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Define update data based on provided fields
    const updateData: any = {};
    
    // Only include fields that are explicitly provided
    if (selected !== undefined) updateData.selected = selected;
    if (revise !== undefined) updateData.revise = revise;
    if (reject !== undefined) updateData.reject = reject;
    if (reviseNote !== undefined) updateData.reviseNote = reviseNote;
    if (rejectNote !== undefined) updateData.rejectNote = rejectNote;
    if (reelNote !== undefined) updateData.reelNote = reelNote;
    
    // Update the image
    const updatedImage = await prisma.image.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ image: updatedImage });
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

// DELETE /api/images/[id] - Delete a specific image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if image exists
    const imageExists = await prisma.image.findUnique({
      where: { id }
    });
    
    if (!imageExists) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Delete the image
    await prisma.image.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
} 