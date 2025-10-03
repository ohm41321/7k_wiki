import { createSupabaseAdminClient } from '@/lib/supabase/utils';
import { NextResponse, type NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const runtime = 'nodejs'; // Necessary for Supabase admin client

export async function POST(req: NextRequest) {
  // Debug: Check if environment variables are loaded
  console.log('Checking environment variables...');
  console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);


  // Check for required environment variables for the admin client
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Server configuration error: Missing Supabase environment variables for storage.');
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
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (uploadError || !data?.path) {
      console.error('Supabase upload error:', uploadError);
      throw new Error('Failed to upload file to Supabase.');
    }

    const objectPath = data.path; // e.g. "my-file.png"

    // Try to get a public URL first (works if bucket is public)
    const publicRes = supabaseAdmin.storage.from('images').getPublicUrl(objectPath as string);
    const publicUrl = publicRes?.data?.publicUrl || null;

    // If bucket is private, create a signed URL (valid for 7 days)
    let signedUrl: string | null = null;
    try {
      const signedRes = await supabaseAdmin.storage.from('images').createSignedUrl(objectPath as string, 60 * 60 * 24 * 7);
      signedUrl = signedRes.data?.signedUrl || null;
    } catch (e) {
      // ignore signed URL errors, we'll fallback to publicUrl if present
      console.warn('Failed to create signed URL (may be a public bucket):', e);
    }

    // Prefer publicUrl when available (simpler), otherwise use signedUrl
    const finalUrl = publicUrl || signedUrl;

    if (!finalUrl) {
      console.error('No public or signed URL available for uploaded file.', { objectPath, publicUrl, signedUrl });
      throw new Error('Failed to produce an accessible URL for uploaded file. Check bucket permissions.');
    }

    // Return both urls for debugging but keep `url` for clients expecting that key
    return NextResponse.json({ url: finalUrl, publicUrl, signedUrl, path: objectPath });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Upload API error:', errorMessage);
    return NextResponse.json({ error: `Upload failed: ${errorMessage}` }, { status: 500 });
  }
}