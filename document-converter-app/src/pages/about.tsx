import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function About() {
  return (
    <>
      <Head>
        <title>About Document Converter Pro | Professional Document Solutions</title>
        <meta name="description" content="Learn about Document Converter Pro - the professional document conversion service trusted by businesses worldwide. Free tools, enterprise APIs, and dedicated support." />
        <meta name="keywords" content="document converter, about us, company, PDF conversion, document API, enterprise solutions" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.docs-app.net/about" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#f4f4f4' }}>
        {/* Header */}
        <header style={{ background: '#323232', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ width: '36px', height: '36px', background: '#fa0f00', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                D
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Document Converter Pro</span>
            </Link>
            <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link href="/" style={{ color: '#b3b3b3', textDecoration: 'none', fontWeight: '500', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' }}>Home</Link>
              <Link href="/blog" style={{ color: '#b3b3b3', textDecoration: 'none', fontWeight: '500', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' }}>Blog</Link>
              <Link href="/about" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: '500', fontSize: '14px', padding: '8px 16px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>About</Link>
              <Link href="/billing/login" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: '600', fontSize: '14px', padding: '8px 20px', borderRadius: '4px', background: '#fa0f00', marginLeft: '8px' }}>Client Portal</Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ padding: '64px 0', background: '#ffffff', borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '700', color: '#323232', marginBottom: '20px', letterSpacing: '-0.5px' }}>
              Professional Document Solutions
            </h1>
            <p style={{ fontSize: '18px', color: '#6e6e6e', lineHeight: '1.7', maxWidth: '640px', margin: '0 auto' }}>
              We provide enterprise-grade document conversion tools and APIs trusted by businesses worldwide.
              Free for individuals, powerful solutions for enterprises.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px' }}>

          {/* Ad Space */}
          <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'center' }}>
            <AdSenseAd
              adSlot="5555555555"
              adFormat="rectangle"
              style={{ display: 'block', width: '336px', height: '280px' }}
            />
          </div>

          {/* What We Do */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '48px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#323232', marginBottom: '32px', textAlign: 'center' }}>
              What We Offer
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: '#fa0f00', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>
                  📄
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '12px' }}>Free Conversion Tools</h3>
                <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6' }}>
                  Convert PDFs, Word documents, images, and more with no registration required.
                  No watermarks, no file size limits on core features.
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: '#0d66d0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>
                  🔌
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '12px' }}>API Integration</h3>
                <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6' }}>
                  Integrate our conversion capabilities into your applications.
                  RESTful APIs with comprehensive documentation and dedicated support.
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: '#2d9d4f', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>
                  🏢
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '12px' }}>Enterprise Solutions</h3>
                <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6' }}>
                  Custom integrations, dedicated infrastructure, SLA guarantees,
                  and priority support for business-critical document workflows.
                </p>
              </div>
            </div>
          </div>

          {/* API Section */}
          <div style={{ background: '#323232', borderRadius: '8px', padding: '48px', marginBottom: '32px', color: 'white' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
              Document Conversion API
            </h2>
            <p style={{ fontSize: '15px', color: '#b3b3b3', textAlign: 'center', maxWidth: '600px', margin: '0 auto 32px', lineHeight: '1.6' }}>
              Automate your document workflows with our powerful API. Process thousands of documents programmatically with enterprise-grade reliability.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#fa0f00', marginBottom: '4px' }}>50+</div>
                <div style={{ fontSize: '13px', color: '#959595' }}>Supported Formats</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#fa0f00', marginBottom: '4px' }}>99.9%</div>
                <div style={{ fontSize: '13px', color: '#959595' }}>Uptime SLA</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#fa0f00', marginBottom: '4px' }}>&lt;3s</div>
                <div style={{ fontSize: '13px', color: '#959595' }}>Avg Processing</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#fa0f00', marginBottom: '4px' }}>24/7</div>
                <div style={{ fontSize: '13px', color: '#959595' }}>API Support</div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a href="mailto:accounts@drop-it.tech" style={{ display: 'inline-block', background: '#fa0f00', color: 'white', padding: '14px 32px', borderRadius: '4px', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}>
                Request API Access
              </a>
            </div>
          </div>

          {/* Core Values */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '48px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#323232', marginBottom: '32px', textAlign: 'center' }}>
              Our Commitment
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ borderLeft: '3px solid #fa0f00', paddingLeft: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Privacy First</h3>
                <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6' }}>
                  Your documents are processed in encrypted containers and automatically deleted within 60 seconds.
                  We never store, analyze, or share your files.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid #0d66d0', paddingLeft: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Reliability</h3>
                <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6' }}>
                  Enterprise-grade infrastructure ensures consistent performance.
                  Our systems automatically scale to handle any volume of requests.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid #2d9d4f', paddingLeft: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Accuracy</h3>
                <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6' }}>
                  Industry-leading conversion accuracy preserves formatting, fonts, images, and layouts.
                  Your documents look exactly as intended.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid #e68619', paddingLeft: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Support</h3>
                <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6' }}>
                  Dedicated support for API customers and enterprise clients.
                  We're here to help you succeed with your document workflows.
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '48px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#323232', marginBottom: '32px', textAlign: 'center' }}>
              Who Uses Our Services
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#fafafa', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Legal Firms</h3>
                <p style={{ fontSize: '13px', color: '#6e6e6e', lineHeight: '1.5' }}>
                  Convert contracts, briefs, and case documents while maintaining strict confidentiality.
                </p>
              </div>

              <div style={{ background: '#fafafa', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Healthcare</h3>
                <p style={{ fontSize: '13px', color: '#6e6e6e', lineHeight: '1.5' }}>
                  Digitize patient records, forms, and medical documentation securely.
                </p>
              </div>

              <div style={{ background: '#fafafa', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Finance</h3>
                <p style={{ fontSize: '13px', color: '#6e6e6e', lineHeight: '1.5' }}>
                  Process invoices, statements, and financial reports at scale.
                </p>
              </div>

              <div style={{ background: '#fafafa', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Education</h3>
                <p style={{ fontSize: '13px', color: '#6e6e6e', lineHeight: '1.5' }}>
                  Help students and educators convert research papers, assignments, and materials.
                </p>
              </div>

              <div style={{ background: '#fafafa', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Real Estate</h3>
                <p style={{ fontSize: '13px', color: '#6e6e6e', lineHeight: '1.5' }}>
                  Convert property documents, leases, and contracts efficiently.
                </p>
              </div>

              <div style={{ background: '#fafafa', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Developers</h3>
                <p style={{ fontSize: '13px', color: '#6e6e6e', lineHeight: '1.5' }}>
                  Integrate document conversion into applications via our API.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '48px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#323232', marginBottom: '16px' }}>
              Get in Touch
            </h2>
            <p style={{ fontSize: '15px', color: '#6e6e6e', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
              Have questions about our services? Need API access or enterprise solutions? We'd love to hear from you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <a
                href="mailto:accounts@drop-it.tech"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fa0f00', color: 'white', padding: '14px 32px', borderRadius: '4px', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                accounts@drop-it.tech
              </a>
              <p style={{ fontSize: '13px', color: '#959595' }}>
                Response time: Within 24 hours
              </p>
            </div>
          </div>

          {/* Ad Space */}
          <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
            <AdSenseAd
              adSlot="6666666666"
              adFormat="horizontal"
              style={{ display: 'block', width: '728px', height: '90px' }}
            />
          </div>
        </main>

        {/* Footer */}
        <footer style={{ background: '#323232', color: 'white', padding: '48px 0 32px 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#fa0f00', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                    D
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>Document Converter Pro</span>
                </div>
                <p style={{ fontSize: '13px', color: '#959595', lineHeight: '1.6' }}>
                  Professional document conversion tools and APIs.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tools</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/pdf-to-word" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>PDF to Word</Link>
                  <Link href="/word-to-pdf" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>Word to PDF</Link>
                  <Link href="/ocr" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>OCR Scanner</Link>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/about" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>About Us</Link>
                  <Link href="/blog" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>Blog</Link>
                  <a href="mailto:accounts@drop-it.tech" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>Contact</a>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/billing/login" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>Client Portal</Link>
                  <a href="mailto:accounts@drop-it.tech" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>API Access</a>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #4a4a4a', paddingTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#959595' }}>
                © 2025 Document Converter Pro. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
