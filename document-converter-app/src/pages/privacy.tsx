import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Document Converter Pro</title>
        <meta name="description" content="Privacy policy for Document Converter Pro. We don't collect personal data and all files are deleted immediately after conversion." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.docs-app.net/privacy" />
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
              <Link href="/about" style={{ color: '#b3b3b3', textDecoration: 'none', fontWeight: '500', fontSize: '14px', padding: '8px 16px', borderRadius: '4px' }}>About</Link>
              <Link href="/privacy" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: '500', fontSize: '14px', padding: '8px 16px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>Privacy</Link>
              <Link href="/billing/login" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: '600', fontSize: '14px', padding: '8px 20px', borderRadius: '4px', background: '#fa0f00', marginLeft: '8px' }}>Client Portal</Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ padding: '48px 0', background: '#ffffff', borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#323232', marginBottom: '16px' }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: '16px', color: '#6e6e6e', lineHeight: '1.6' }}>
              Your privacy is our priority. Learn how we protect your data.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>

          {/* Quick Summary */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: '#2d9d4f', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '8px' }}>Quick Summary</h2>
                <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6', margin: 0 }}>
                  We don't collect your personal data. Files are processed securely and deleted within 60 seconds after conversion.
                  No account required, no tracking, no data storage.
                </p>
              </div>
            </div>
          </div>

          {/* Ad Space */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
            <AdSenseAd
              adSlot="1111111111"
              adFormat="rectangle"
              style={{ display: 'block', width: '336px', height: '280px' }}
            />
          </div>

          {/* Information We Don't Collect */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '20px' }}>Information We Don't Collect</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Personal information (name, email, address)',
                'User accounts or login credentials',
                'File content or metadata',
                'IP addresses or location data',
                'Browsing history or cookies for tracking'
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg style={{ width: '12px', height: '12px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '14px', color: '#6e6e6e' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How We Handle Your Files */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '20px' }}>How We Handle Your Files</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Files are processed in secure, encrypted containers',
                'All files are deleted within 60 seconds after conversion',
                'No file content is stored, cached, or backed up',
                'Processing happens on secure infrastructure',
                'We never view, analyze, or share your documents'
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg style={{ width: '12px', height: '12px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '14px', color: '#6e6e6e' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API Users */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '16px' }}>API Users & Business Accounts</h2>
            <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6', marginBottom: '16px' }}>
              For API users and business accounts with the Client Portal:
            </p>
            <ul style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
              <li>We store account information necessary for billing and service delivery</li>
              <li>API usage is logged for billing purposes (request counts, not file contents)</li>
              <li>Business data is protected and never shared with third parties</li>
              <li>You can request account deletion at any time</li>
            </ul>
          </div>

          {/* Third-Party Services */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '16px' }}>Third-Party Services</h2>
            <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6' }}>
              We use Google AdSense to display advertisements. Google may collect some data for ad personalization.
              You can opt out of personalized ads in your <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#fa0f00', textDecoration: 'none' }}>Google Ad Settings</a>.
            </p>
          </div>

          {/* Your Rights */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '16px' }}>Your Rights</h2>
            <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6', marginBottom: '12px' }}>
              For free tool users: Since we don't collect or store your data, there's nothing to delete, modify, or export.
              Your privacy is protected by design.
            </p>
            <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6', margin: 0 }}>
              For API/business users: You have the right to access, modify, or delete your account data. Contact us to exercise these rights.
            </p>
          </div>

          {/* Contact */}
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#323232', marginBottom: '16px' }}>Contact Us</h2>
            <p style={{ fontSize: '14px', color: '#6e6e6e', lineHeight: '1.6', marginBottom: '16px' }}>
              Questions about privacy? We're here to help.
            </p>
            <a
              href="mailto:accounts@drop-it.tech"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#fa0f00', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              accounts@drop-it.tech
            </a>
          </div>

          {/* Ad Space */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
            <AdSenseAd
              adSlot="2222222222"
              adFormat="horizontal"
              style={{ display: 'block', width: '728px', height: '90px' }}
            />
          </div>

          {/* Last Updated */}
          <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #e5e5e5' }}>
            <p style={{ fontSize: '13px', color: '#959595' }}>
              Last updated: January 5, 2025
            </p>
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
                <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Legal</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/privacy" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>Privacy Policy</Link>
                  <Link href="/terms" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '13px' }}>Terms of Service</Link>
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
