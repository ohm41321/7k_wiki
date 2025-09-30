import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function getPosts() {
  const postsDirectory = path.join(process.cwd(), 'posts');

  try {
    const filenames = fs.readdirSync(postsDirectory);

    const posts = filenames.map((filename) => {
      const fullPath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      let imageUrls = null;
      if (data.imageUrls) {
        imageUrls = data.imageUrls.map((url: string) => {
          if (url.startsWith('/')) {
            const baseUrl = process.env.NODE_ENV === 'production' 
              ? 'https://your-production-url.com' // Replace with your production URL
              : 'http://localhost:3000';
            return `${baseUrl}${url}`;
          }
          return url;
        });
      }

      return {
        slug: filename.replace(/\.md$/, ''),
        title: data.title,
        date: data.date,
        author: data.author,
        imageUrls: imageUrls,
      };
    });

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch (error: any) {
    console.error('Error reading posts:', error);
    return [];
  }
}
