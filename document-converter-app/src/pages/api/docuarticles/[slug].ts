// API route to fetch a single article by slug
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    const articlesRef = collection(db, 'docuarticles');
    const q = query(
      articlesRef,
      where('slug', '==', slug),
      where('is_published', '==', true)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    const articleDoc = querySnapshot.docs[0];
    const data = articleDoc.data();

    // Increment view count
    try {
      await updateDoc(doc(db, 'docuarticles', articleDoc.id), {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }

    const article = {
      id: articleDoc.id,
      ...data,
      views: (data.views || 0) + 1,
      // Convert Firestore Timestamps to ISO strings
      published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at,
      created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
      updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
    };

    return res.status(200).json({
      success: true,
      article
    });
  } catch (error: any) {
    console.error('Error fetching article:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch article',
      message: error.message
    });
  }
}
