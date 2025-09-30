import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unstable_noStore as noStore } from 'next/cache';
import { marked } from 'marked';

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

    const htmlContent = marked.parse(content);

    return {
      slug,
      title: data.title,
      date: data.date,
      author: data.author,
      category: data.category || null,
      tags: tags,
      imageUrls: data.imageUrls || [],
      content: htmlContent,
    };
  } catch (error) {
    return null;
  }
}
