import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DocArticle } from '@/types/article';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [article, setArticle] = useState<DocArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle(slug as string);
    }
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/docuarticles/${articleSlug}`);
      const data = await response.json();

      if (data.success) {
        setArticle(data.article);
      } else {
        setError('Article not found');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#718096' }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
          <p style={{ fontSize: '20px', color: '#718096', marginBottom: '32px' }}>
            {error || 'Article not found'}
          </p>
          <Link href="/blog" style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.seo_title || article.title}</title>
        <meta name="description" content={article.seo_description || article.excerpt} />
        <meta name="keywords" content={article.seo_keywords?.join(', ')} />
        <meta name="author" content={article.author} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://docs-app.net/blog/${article.slug}`} />

        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://docs-app.net/blog/${article.slug}`} />
        {article.featured_image && <meta property="og:image" content={article.featured_image} />}

        <meta property="article:published_time" content={String(article.published_at)} />
        <meta property="article:author" content={article.author} />
        <meta property="article:section" content={article.category} />
        {article.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        {article.featured_image && <meta name="twitter:image" content={article.featured_image} />}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": article.title,
              "description": article.excerpt,
              "image": article.featured_image,
              "author": {
                "@type": "Person",
                "name": article.author
              },
              "publisher": {
                "@type": "Organization",
                "name": "Document Converter Pro",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://docs-app.net/logo.png"
                }
              },
              "datePublished": article.published_at,
              "dateModified": article.updated_at,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://docs-app.net/blog/${article.slug}`
              }
            })
          }}
        />
      </Head>

      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '72px'
            }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  D
                </div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1a202c',
                  letterSpacing: '-0.5px'
                }}>
                  Document Converter Pro
                </h1>
              </Link>

              <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <Link href="/" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
                <Link href="/blog" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Blog</Link>
                <Link href="/about" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500' }}>About</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#718096' }}>
              <Link href="/" style={{ color: '#718096', textDecoration: 'none' }}>Home</Link>
              <span>/</span>
              <Link href="/blog" style={{ color: '#718096', textDecoration: 'none' }}>Blog</Link>
              <span>/</span>
              <span style={{ color: '#1a202c' }}>{article.title}</span>
            </div>
          </div>
        </div>

        {/* Article Hero */}
        <section style={{ padding: '60px 20px', background: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: '#edf2f7',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#667eea',
              marginBottom: '20px'
            }}>
              {article.category}
            </div>

            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#1a202c',
              marginBottom: '20px',
              lineHeight: '1.2',
              letterSpacing: '-1px'
            }}>
              {article.title}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '16px',
              color: '#718096',
              paddingBottom: '24px',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', color: '#1a202c' }}>{article.author}</span>
              </div>
              <span>•</span>
              <span>{formatDate(String(article.published_at))}</span>
              <span>•</span>
              <span>{article.reading_time} min read</span>
              {article.views && (
                <>
                  <span>•</span>
                  <span>{article.views.toLocaleString()} views</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {article.featured_image && (
          <section style={{ padding: '0 20px 60px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <img
                src={article.featured_image}
                alt={article.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>
          </section>
        )}

        {/* Article Content */}
        <article style={{ padding: '0 20px 80px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                color: '#2d3748'
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="article-content"
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '6px 16px',
                        background: '#f7fafc',
                        borderRadius: '16px',
                        fontSize: '14px',
                        color: '#4a5568',
                        fontWeight: '500'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog */}
            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <Link href="/blog" style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                ← Back to Blog
              </Link>
            </div>
          </div>
        </article>

        {/* Footer */}
        <footer style={{
          background: '#1a202c',
          color: 'white',
          padding: '48px 20px 32px 20px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#a0aec0' }}>
              © 2025 Document Converter Pro. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .article-content h2 {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin-top: 48px;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .article-content h3 {
          font-size: 24px;
          font-weight: 600;
          color: #2d3748;
          margin-top: 36px;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .article-content p {
          margin-bottom: 20px;
        }

        .article-content ul,
        .article-content ol {
          margin-bottom: 20px;
          padding-left: 28px;
        }

        .article-content li {
          margin-bottom: 12px;
        }

        .article-content a {
          color: #667eea;
          text-decoration: underline;
        }

        .article-content a:hover {
          color: #764ba2;
        }

        .article-content strong {
          font-weight: 700;
          color: #1a202c;
        }

        .article-content code {
          background: #f7fafc;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 16px;
          color: #e53e3e;
        }

        .article-content pre {
          background: #2d3748;
          color: #e2e8f0;
          padding: 20px;
          border-radius: 12px;
          overflow-x: auto;
          margin-bottom: 24px;
        }

        .article-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          font-size: 14px;
        }

        .article-content blockquote {
          border-left: 4px solid #667eea;
          padding-left: 20px;
          margin: 24px 0;
          font-style: italic;
          color: #4a5568;
        }

        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 24px 0;
        }
      `}</style>
    </>
  );
}
