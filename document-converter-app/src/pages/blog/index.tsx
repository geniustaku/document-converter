import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DocArticle } from '@/types/article';
import { ARTICLE_CATEGORIES } from '@/types/article';

export default function Blog() {
  const [articles, setArticles] = useState<DocArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchArticles(selectedCategory);
  }, [selectedCategory]);

  const fetchArticles = async (category: string) => {
    setLoading(true);
    try {
      const categoryParam = category === 'all' ? '' : `&category=${category}`;
      const response = await fetch(`/api/docuarticles?${categoryParam}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
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

  return (
    <>
      <Head>
        <title>Document Conversion Blog | Expert Tips, Guides & Tutorials</title>
        <meta name="description" content="Expert guides on PDF conversion, document management, productivity tips, and file format tutorials. Learn from professionals to optimize your document workflow." />
        <meta name="keywords" content="PDF guides, document conversion tips, productivity tutorials, file format guides, document management, PDF to Word tips, office productivity" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://docs-app.net/blog" />
        <meta property="og:title" content="Document Conversion Blog | Expert Tips & Guides" />
        <meta property="og:description" content="Expert guides on PDF conversion, document management, and productivity tips." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://docs-app.net/blog" />
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

        {/* Hero Section */}
        <section style={{ padding: '60px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              marginBottom: '16px',
              letterSpacing: '-1px'
            }}>
              Document Conversion Blog
            </h1>
            <p style={{
              fontSize: '20px',
              opacity: 0.95,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Expert guides, tips, and tutorials for mastering PDF conversion, document management, and productivity
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section style={{ padding: '32px 20px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: selectedCategory === 'all' ? 'none' : '2px solid #e2e8f0',
                  background: selectedCategory === 'all' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  color: selectedCategory === 'all' ? 'white' : '#4a5568',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                All Articles
              </button>
              {ARTICLE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '20px',
                    border: selectedCategory === cat.slug ? 'none' : '2px solid #e2e8f0',
                    background: selectedCategory === cat.slug ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                    color: selectedCategory === cat.slug ? 'white' : '#4a5568',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
                <p style={{ marginTop: '20px', color: '#718096' }}>Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h3 style={{ fontSize: '24px', color: '#1a202c', marginBottom: '12px' }}>No articles yet</h3>
                <p style={{ color: '#718096' }}>Check back soon for expert guides and tutorials!</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '32px'
              }}>
                {articles.map(article => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <article style={{
                      background: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      {article.featured_image && (
                        <div style={{
                          width: '100%',
                          height: '200px',
                          background: `url(${article.featured_image}) center/cover`,
                          backgroundColor: '#f7fafc'
                        }}></div>
                      )}
                      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: '#edf2f7',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#667eea',
                          marginBottom: '12px',
                          width: 'fit-content'
                        }}>
                          {article.category}
                        </div>
                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: '#1a202c',
                          marginBottom: '12px',
                          lineHeight: '1.4'
                        }}>
                          {article.title}
                        </h3>
                        <p style={{
                          fontSize: '15px',
                          color: '#718096',
                          lineHeight: '1.6',
                          marginBottom: '16px',
                          flex: 1
                        }}>
                          {article.excerpt}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                          color: '#a0aec0',
                          paddingTop: '16px',
                          borderTop: '1px solid #e2e8f0'
                        }}>
                          <span>{formatDate(String(article.published_at))}</span>
                          <span>{article.reading_time} min read</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

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

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
