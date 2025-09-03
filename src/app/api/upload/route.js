import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');
    const challengeId = data.get('challengeId');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'challenges');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const fileName = `${challengeId || 'challenge'}_${timestamp}_${baseName}${extension}`;
    
    const filePath = path.join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to local storage
    await writeFile(filePath, buffer);

    // Return file info
    const fileInfo = {
      name: originalName,
      fileName: fileName,
      url: `/uploads/challenges/${fileName}`,
      path: filePath,
      size: buffer.length,
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      file: fileInfo 
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to list uploaded files
export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'challenges');
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({ files: [] });
    }

    const fs = require('fs');
    const files = fs.readdirSync(uploadsDir).map(fileName => {
      const filePath = path.join(uploadsDir, fileName);
      const stats = fs.statSync(filePath);
      
      return {
        name: fileName,
        url: `/uploads/challenges/${fileName}`,
        size: stats.size,
        uploadedAt: stats.mtime.toISOString()
      };
    });

    return NextResponse.json({ files });

  } catch (error) {
    console.error('File list error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}