
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSession } from 'next-auth/react';

const commentsFilePath = path.join(process.cwd(), 'data', 'comments.json');

interface Comment {
  id: string;
  slug: string;
  author: string;
  content: string;
  date: string;
}

// Function to read comments from the JSON file
const readComments = (): Comment[] => {
  try {
    const fileContent = fs.readFileSync(commentsFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist or is empty, return an empty array
    return [];
  }
};

// Function to write comments to the JSON file
const writeComments = (comments: Comment[]) => {
  fs.writeFileSync(commentsFilePath, JSON.stringify(comments, null, 2));
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const comments = readComments();
  const postComments = comments.filter((comment) => comment.slug === slug);
  return NextResponse.json(postComments);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { content, author } = await request.json();

  if (!content || !author) {
    return NextResponse.json({ error: 'Missing content or author' }, { status: 400 });
  }

  const newComment: Comment = {
    id: Date.now().toString(),
    slug,
    author,
    content,
    date: new Date().toISOString(),
  };

  const comments = readComments();
  comments.push(newComment);
  writeComments(comments);

  return NextResponse.json(newComment, { status: 201 });
}
