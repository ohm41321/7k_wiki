
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // IMPORTANT: Use service_role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileExtension = file.name.split('.').pop();
    // Generate a unique file name with the original extension
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `public/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images') // The bucket name you created
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    if (!publicUrlData) {
        return NextResponse.json({ error: 'Could not get public URL.' }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (e) {
    console.error('Upload API error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
