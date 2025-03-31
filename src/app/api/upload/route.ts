import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { mkdir } from 'fs/promises';

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create uploads directory', err);
  }
  return uploadDir;
};

// POST /api/upload - Upload a base64 image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, projectName, userId } = body;
    
    if (!image || !image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Valid base64 image data required' },
        { status: 400 }
      );
    }
    
    // Get the file extension from the mime type
    const mimeMatch = image.match(/data:image\/(\w+);/);
    const fileExtension = mimeMatch ? mimeMatch[1] : 'png';
    
    // Generate a more descriptive filename
    const date = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format
    const projectSegment = projectName ? projectName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20) : 'project';
    const userSegment = userId ? userId.substring(0, 8) : 'user';
    const uniqueId = uuidv4().substring(0, 8);
    
    const filename = `${userSegment}_${projectSegment}_${date}_${uniqueId}.${fileExtension}`;
    
    // Ensure uploads directory exists
    const uploadDir = await ensureUploadsDir();
    const filePath = path.join(uploadDir, filename);
    
    // Remove the data:image/png;base64, part
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Write file to disk
    fs.writeFileSync(filePath, buffer);
    
    // Return the public URL
    const publicUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 