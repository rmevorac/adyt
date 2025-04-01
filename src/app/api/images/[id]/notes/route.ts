import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { NoteType } from '../../../../../types/image';

// PUT /api/images/[id]/notes - Update notes for a specific image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { type, content } = body as { type: NoteType; content: string };
    
    // Validate input
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Note type and content are required' },
        { status: 400 }
      );
    }
    
    // Ensure type is valid
    if (!['reviseNote', 'rejectNote', 'reelNote'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid note type. Must be reviseNote, rejectNote, or reelNote' },
        { status: 400 }
      );
    }
    
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
    
    // Build update data with proper typing
    const updateData = {
      [type]: content
    } as Record<NoteType, string>;
    
    // Update the image
    const updatedImage = await prisma.image.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ image: updatedImage });
  } catch (error) {
    console.error('Error updating image notes:', error);
    return NextResponse.json(
      { error: 'Failed to update image notes' },
      { status: 500 }
    );
  }
} 