import { createSupabaseAdminClient } from '@/lib/supabase/utils';
import { NextResponse, type NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const runtime = 'nodejs'; // Necessary for Supabase admin client

export async function POST(req: NextRequest) {
  // Check for required environment variables for the admin client
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration error: Missing Supabase environment variables for storage.' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Create a Supabase admin client to upload files with service_role permissions
    const supabaseAdmin = createSupabaseAdminClient();

    // Generate a unique file name
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;

    // Upload the file to the 'images' bucket
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error('Failed to upload file to Supabase.');
    }

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(data.path);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for the uploaded file.');
    }

    // Return the public URL to the client
    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Upload API error:', errorMessage);
    return NextResponse.json({ error: `Upload failed: ${errorMessage}` }, { status: 500 });
  }
}