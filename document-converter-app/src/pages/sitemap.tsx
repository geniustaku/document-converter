import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Sitemap() {
  const siteStructure = [
    {
      title: "Document Conversion Tools",
      icon: "🔄",
      links: [
        { name: "PDF to Word Converter", url: "/pdf-to-word", description: "Convert PDF documents to editable Word format" },
        { name: "Word to PDF Converter", url: "/word-to-pdf", description: "Create professional PDF from Word files" },
        { name: "General Document Converter", url: "/converter", description: "Convert between multiple document formats" },
        { name: "Image Converter", url: "/image-converter", description: "Convert images between JPG, PNG, WebP formats" }
      ]
    },
    {
      title: "PDF Tools",
      icon: "📄",
      links: [
        { name: "PDF Merge", url: "/pdf-merge", description: "Combine multiple PDFs into one" },
        { name: "PDF Split", url: "/pdf-split", description: "Extract pages or divide PDF files" },
        { name: "PDF Compress", url: "/pdf-compress", description: "Reduce PDF file size" },
        { name: "PDF Form Filler", url: "/pdf-filler", description: "Fill and sign PDF forms online" }
      ]
    },
    {
      title: "Business Tools",
      icon: "💼",
      links: [
        { name: "Invoice Generator", url: "/invoice-generator", description: "Create professional invoices with VAT" }
      ]
    },
    {
      title: "Resources & Information",
      icon: "📚",
      links: [
        { name: "Blog", url: "/blog", description: "Expert guides and tutorials" },
        { name: "FAQ", url: "/faq", description: "Frequently asked questions" },
        { name: "PDF to Word Guide", url: "/guides/pdf-to-word-guide", description: "Complete conversion tutorial" },
        { name: "About Us", url: "/about", description: "Learn about our mission and technology" }
      ]
    },
    {
      title: "Legal & Privacy",
      icon: "⚖️",
      links: [
        { name: "Privacy Policy", url: "/privacy", description: "How we protect your data" },
        { name: "Terms of Service", url: "/terms", description: "Terms and conditions of use" }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Sitemap | Document Converter Pro - All Tools and Pages</title>
        <meta name="description" content="Complete sitemap of all Document Converter Pro tools, guides, and resources. Find PDF converters, document tools, tutorials, and support pages." />
        <meta name="keywords" content="sitemap, document converter tools, PDF converter, site navigation, all tools" />
        <link rel="canonical" href="https://docs-app.net/sitemap" />
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
                <span style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1a202c'
                }}>
                  Document Converter Pro
                </span>
              </Link>

              <nav style={{ display: 'flex', gap: '24px' }}>
                <Link href="/" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
                <Link href="/blog" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500' }}>Blog</Link>
                <Link href="/faq" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500' }}>FAQ</Link>
                <Link href="/about" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500' }}>About</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '60px 20px', color: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>
              Site Navigation
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.9 }}>
              Explore all our free document conversion tools, guides, and resources
            </p>
          </div>
        </section>

        {/* Sitemap Content */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '32px'
            }}>
              {siteStructure.map((section, sectionIndex) => (
                <div
                  key={sectionIndex}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px'
                  }}>
                    <span style={{ fontSize: '32px' }}>{section.icon}</span>
                    <h2 style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#1a202c',
                      margin: 0
                    }}>
                      {section.title}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {section.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        href={link.url}
                        style={{
                          textDecoration: 'none',
                          padding: '16px',
                          background: '#f7fafc',
                          borderRadius: '12px',
                          transition: 'all 0.2s',
                          border: '1px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#edf2f7';
                          e.currentTarget.style.borderColor = '#cbd5e0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f7fafc';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#667eea',
                          marginBottom: '4px'
                        }}>
                          {link.name}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#718096',
                          lineHeight: '1.5'
                        }}>
                          {link.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section style={{ padding: '60px 20px', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px'
                }}>
                  15+
                </div>
                <div style={{ fontSize: '18px', color: '#718096' }}>
                  Free Tools Available
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px'
                }}>
                  99.7%
                </div>
                <div style={{ fontSize: '18px', color: '#718096' }}>
                  Conversion Accuracy
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px'
                }}>
                  3.2s
                </div>
                <div style={{ fontSize: '18px', color: '#718096' }}>
                  Average Processing Time
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px'
                }}>
                  100%
                </div>
                <div style={{ fontSize: '18px', color: '#718096' }}>
                  Free Forever
                </div>
              </div>
            </div>
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
    </>
  );
}
