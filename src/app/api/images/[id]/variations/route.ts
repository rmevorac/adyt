import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to read metadata file
async function readMetadata(id: string) {
  const metadataPath = path.join(process.cwd(), 'public/images', id, 'metadata.json');
  try {
    const data = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// Helper function to write metadata file
async function writeMetadata(id: string, metadata: any) {
  const metadataPath = path.join(process.cwd(), 'public/images', id, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const metadata = await readMetadata(id);
    
    if (!metadata) {
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
    }

    // Return variations data
    return NextResponse.json({
      id: metadata.id,
      originalImage: metadata.originalImage,
      variations: metadata.variations
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { selectedVariationId } = await request.json();
    
    const metadata = await readMetadata(id);
    if (!metadata) {
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
    }

    // Update selected variation
    metadata.selectedVariation = selectedVariationId;
    await writeMetadata(id, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 