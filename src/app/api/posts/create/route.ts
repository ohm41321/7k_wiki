import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as matter from 'gray-matter';

export async function POST(request: Request) {
  try {
    const { title, author, content, imageUrls } = await request.json();

    if (!title || !author) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const date = new Date().toISOString();

        const frontmatterData: { [key: string]: any } = {
          title,
          date,
          author,
        };
    
        if (imageUrls && imageUrls.length > 0) {
          frontmatterData.imageUrls = imageUrls;
        }
    
        const fileContent = matter.stringify(content || '', frontmatterData);
    const postsDirectory = path.join(process.cwd(), 'posts');
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (fs.existsSync(fullPath)) {
      return new NextResponse(JSON.stringify({ message: 'Post with this title already exists' }), { status: 409 });
    }

    fs.writeFileSync(fullPath, fileContent);

    const newPost = { slug, title, date, author, content, imageUrls };

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(JSON.stringify({ message: message || 'Internal Server Error' }), { status: 500 });
  }
}
