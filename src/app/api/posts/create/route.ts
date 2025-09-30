import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { title, author, content, imageUrls, tags: tagsString } = await request.json();

    if (!title || !author) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const slug = uuidv4();
    const date = new Date().toISOString();

    const frontmatterData: { [key: string]: any } = {
      title,
      date,
      author,
    };

    if (imageUrls && imageUrls.length > 0) {
      frontmatterData.imageUrls = imageUrls;
    }

    if (tagsString) {
      const tags = tagsString.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '');
      if (tags.length > 0) {
        frontmatterData.tags = tags;
      }
    }

    const fileContent = matter.stringify(content || '', frontmatterData);
    const postsDirectory = path.join(process.cwd(), 'posts');
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (fs.existsSync(fullPath)) {
      return new NextResponse(JSON.stringify({ message: 'Post with this title already exists' }), { status: 409 });
    }

    fs.writeFileSync(fullPath, fileContent);

    const newPost = { slug, title, date, author, content, imageUrls, tags: frontmatterData.tags || [] };

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(JSON.stringify({ message: message || 'Internal Server Error' }), { status: 500 });
  }
}
