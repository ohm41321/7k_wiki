import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse(JSON.stringify({ message: 'No file uploaded' }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use a promise to handle the Cloudinary upload stream
    const imageUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          // Optional: specify a folder in Cloudinary
          folder: '7k_wiki_uploads',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Cloudinary upload failed without an explicit error.'));
          }
        }
      );

      // Pipe the buffer into the upload stream
      uploadStream.end(buffer);
    });

    return NextResponse.json({ imageUrl }, { status: 201 });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return new NextResponse(JSON.stringify({ message: error.message || 'Internal Server Error' }), { status: 500 });
  }
}