import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unstable_noStore as noStore } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

const postsDirectory = path.join(process.cwd(), 'posts');

interface PostFilter {
  game?: string;
}

// Get all posts, with optional filtering
export function getPosts(filter?: PostFilter) {
  noStore();
  try {
    const filenames = fs.readdirSync(postsDirectory);

    let posts = filenames.map((filename) => {
      const fullPath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug: filename.replace(/\.md$/, ''),
        title: data.title,
        date: data.date,
        author: data.author,
        category: data.category || null,
        tags: data.tags || [],
        imageUrls: data.imageUrls || [],
        game: data.game || null, // Add game property
      };
    });

    // Apply filters
    if (filter?.game) {
      posts = posts.filter(post => post.game === filter.game);
    }

    // Sort by date
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch (error: any) {
    console.error('Error reading posts:', error);
    return [];
  }
}

// Get a single post by slug
export function getPostBySlug(slug: string) {
  noStore();
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      author: data.author,
      category: data.category || null,
      tags: data.tags || [],
      imageUrls: data.imageUrls || [],
      game: data.game || null, // Add game property
      content: content,
    };
  } catch (error) {
    return null;
  }
}

interface PostData {
  title: string;
  author: string;
  content: string;
  imageUrls: string[];
  tags: string;
  game: string; // Make game mandatory for new posts
}

// Create a new post
export function createPost({ title, author, content, imageUrls, tags, game }: PostData) {
  const slug = uuidv4();
  const date = new Date().toISOString();

  const frontmatterData: { [key: string]: any } = {
    title,
    date,
    author,
    game, // Save game to frontmatter
    imageUrls: imageUrls || [],
    tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
  };

  const fileContent = matter.stringify(content || '', frontmatterData);
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  fs.writeFileSync(fullPath, fileContent);

  return { slug, ...frontmatterData, content };
}


interface UpdatePostData {
    slug: string;
    title: string;
    content: string;
    tags: string;
    game?: string; // Allow updating game
}

// Update an existing post
export function updatePost({ slug, title, content, tags, game }: UpdatePostData) {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data: originalData } = matter(fileContents);

        const updatedData = {
            ...originalData,
            title,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        };

        if (game) {
          updatedData.game = game;
        }

        const newFileContents = matter.stringify(content, updatedData);

        fs.writeFileSync(fullPath, newFileContents);

        return { success: true, slug, ...updatedData };
    } catch (error: any) {
        console.error('Error updating post:', error);
        return { success: false, error: error.message };
    }
}
