import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse(JSON.stringify({ message: 'No file uploaded' }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, uniqueFilename);

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueFilename}`;
    const absoluteUrl = `http://localhost:3000${relativeUrl}`;

    return NextResponse.json({ imageUrl: absoluteUrl }, { status: 201 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
