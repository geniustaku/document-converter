// types/article.ts - Type definitions for blog articles
import { Timestamp } from 'firebase/firestore';

export interface DocArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  author_bio?: string;
  is_published: boolean;
  reading_time: number;
  featured_image: string;
  published_at: Timestamp | Date;
  created_at: Timestamp | Date;
  updated_at: Timestamp | Date;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  views?: number;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  {
    id: '1',
    name: 'PDF Guides',
    slug: 'pdf-guides',
    description: 'Complete guides for working with PDF documents',
    icon: '📄'
  },
  {
    id: '2',
    name: 'Productivity Tips',
    slug: 'productivity',
    description: 'Tips and tricks to boost your productivity',
    icon: '⚡'
  },
  {
    id: '3',
    name: 'Document Management',
    slug: 'document-management',
    description: 'Best practices for managing documents',
    icon: '📁'
  },
  {
    id: '4',
    name: 'Business Tools',
    slug: 'business-tools',
    description: 'Professional tools for business needs',
    icon: '💼'
  },
  {
    id: '5',
    name: 'How-To Tutorials',
    slug: 'tutorials',
    description: 'Step-by-step tutorials for common tasks',
    icon: '🎓'
  },
  {
    id: '6',
    name: 'File Formats',
    slug: 'file-formats',
    description: 'Understanding different file formats',
    icon: '🔄'
  }
];
