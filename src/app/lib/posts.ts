import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unstable_noStore as noStore } from 'next/cache';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getPosts() {
  noStore();
  try {
    const filenames = fs.readdirSync(postsDirectory);

    const posts = filenames.map((filename) => {
      const fullPath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      const tags = Array.isArray(data.tags) ? data.tags : [];

      return {
        slug: filename.replace(/\.md$/, ''),
        title: data.title,
        date: data.date,
        author: data.author,
        category: data.category || null,
        tags: tags,
        imageUrls: data.imageUrls || [],
      };
    });

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch (error: any) {
    console.error('Error reading posts:', error);
    return [];
  }
}

export function getPostBySlug(slug: string) {
  noStore();
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const tags = Array.isArray(data.tags) ? data.tags : [];

    return {
      slug,
      title: data.title,
      date: data.date,
      author: data.author,
      category: data.category || null,
      tags: tags,
      imageUrls: data.imageUrls || [],
      content: content, // Return raw content
    };
  } catch (error) {
    return null;
  }
}

interface UpdatePostData {
    slug: string;
    title: string;
    content: string;
    tags: string;
}

export function updatePost({ slug, title, content, tags }: UpdatePostData) {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data: originalData } = matter(fileContents);

        const updatedData = {
            ...originalData,
            title,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        };

        const newFileContents = matter.stringify(content, updatedData);

        fs.writeFileSync(fullPath, newFileContents);

        return { success: true };
    } catch (error: any) {
        console.error('Error updating post:', error);
        return { success: false, error: error.message };
    }
}