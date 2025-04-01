import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { ImageUpdateData } from '../../../../types/image';

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
    const updateFields = body as ImageUpdateData;

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
    const updateData: ImageUpdateData = {};
    
    // Only include fields that are explicitly provided
    if (updateFields.selected !== undefined) updateData.selected = updateFields.selected;
    if (updateFields.revise !== undefined) updateData.revise = updateFields.revise;
    if (updateFields.reject !== undefined) updateData.reject = updateFields.reject;
    if (updateFields.reviseNote !== undefined) updateData.reviseNote = updateFields.reviseNote;
    if (updateFields.rejectNote !== undefined) updateData.rejectNote = updateFields.rejectNote;
    if (updateFields.reelNote !== undefined) updateData.reelNote = updateFields.reelNote;
    
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