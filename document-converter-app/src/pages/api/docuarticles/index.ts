// API route to fetch all articles
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, limitCount = 50, published = 'true' } = req.query;

    const articlesRef = collection(db, 'docuarticles');

    // Simplified query without index requirement - fetch all and filter in memory
    const q = query(
      articlesRef,
      orderBy('published_at', 'desc'),
      limit(100) // Fetch more to filter client-side
    );

    const querySnapshot = await getDocs(q);

    let articles: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Filter by published status
      if (published === 'true' && !data.is_published) {
        return; // Skip unpublished
      }

      // Filter by category if provided
      if (category && category !== 'all' && category !== '' && data.category !== category) {
        return; // Skip non-matching category
      }

      articles.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings
        published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
      });
    });

    // Apply limit after filtering
    articles = articles.slice(0, Number(limitCount));

    return res.status(200).json({
      success: true,
      articles,
      count: articles.length
    });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
      message: error.message
    });
  }
}
