import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "General",
    question: "Is Document Converter Pro really free?",
    answer: "Yes! Document Converter Pro is 100% free with no hidden fees, subscriptions, or registration requirements. We believe professional document tools should be accessible to everyone."
  },
  {
    category: "General",
    question: "Do I need to create an account?",
    answer: "No account needed! Simply visit our site, upload your file, and convert. We designed our service to be as frictionless as possible."
  },
  {
    category: "General",
    question: "How many files can I convert?",
    answer: "There's no daily limit. You can convert as many files as you need, one at a time, completely free."
  },
  {
    category: "PDF to Word",
    question: "How accurate is the PDF to Word conversion?",
    answer: "We achieve 99.7% formatting accuracy using advanced LibreOffice technology. This includes preserving fonts, layouts, tables, images, and complex formatting."
  },
  {
    category: "PDF to Word",
    question: "Can you convert scanned PDFs to Word?",
    answer: "Yes! Our OCR (Optical Character Recognition) technology automatically detects scanned documents and converts them to editable text with 99.8% accuracy across 15+ languages."
  },
  {
    category: "PDF to Word",
    question: "What if my converted document looks different?",
    answer: "While we achieve 99.7% accuracy, some complex layouts may need minor adjustments. Try using 'Save As' in Word and select 'Maintain compatibility', or manually adjust spacing and alignment."
  },
  {
    category: "Security & Privacy",
    question: "Is my document secure?",
    answer: "Absolutely. We use enterprise-grade SSL encryption for all transfers, process files in encrypted containers, and automatically delete all files after 60 seconds. We never store, view, or analyze your documents."
  },
  {
    category: "Security & Privacy",
    question: "What happens to my files after conversion?",
    answer: "Your files are permanently deleted from our servers 60 seconds after processing. We maintain zero long-term storage of user documents."
  },
  {
    category: "Security & Privacy",
    question: "Can I convert confidential documents?",
    answer: "Yes. We use ISO 27001 certified infrastructure with zero-knowledge processing, meaning we cannot access your file contents. However, for extremely sensitive documents, consider using offline tools."
  },
  {
    category: "File Formats",
    question: "What file formats do you support?",
    answer: "We support PDF, Word (DOC/DOCX), Excel (XLS/XLSX), PowerPoint (PPT/PPTX), LibreOffice formats (ODT/ODS/ODP), RTF, TXT, and image formats (JPG, PNG, WebP, BMP)."
  },
  {
    category: "File Formats",
    question: "Should I use DOCX or DOC format?",
    answer: "DOCX is recommended for modern compatibility (Word 2007+). Use DOC only if you need compatibility with older Word versions (2003 and earlier)."
  },
  {
    category: "File Formats",
    question: "What's the difference between PDF and Word?",
    answer: "PDFs preserve exact formatting across all devices and are ideal for final documents. Word files are editable and better for drafts and collaboration. Check our blog for a detailed comparison article."
  },
  {
    category: "Technical",
    question: "What's the maximum file size?",
    answer: "We support files up to 50MB. This accommodates most documents while ensuring fast processing. For larger files, consider compressing or splitting them first."
  },
  {
    category: "Technical",
    question: "How long does conversion take?",
    answer: "Average conversion time is 3.2 seconds. Small files (under 5MB) typically complete in 2-3 seconds. Larger files may take up to 10 seconds."
  },
  {
    category: "Technical",
    question: "Why did my conversion fail?",
    answer: "Common causes include: password-protected PDFs, corrupted files, unsupported formats, or connection issues. Try unlocking the PDF, ensuring the file isn't corrupted, and checking your internet connection."
  },
  {
    category: "Technical",
    question: "Can I convert password-protected PDFs?",
    answer: "No, you must remove password protection before conversion. This is a security measure to ensure you have rightful access to the document."
  },
  {
    category: "Features",
    question: "Can I merge multiple PDFs?",
    answer: "Yes! Use our PDF Merge tool to combine multiple PDF files into a single document while preserving quality and formatting."
  },
  {
    category: "Features",
    question: "Can I split a PDF into multiple files?",
    answer: "Yes! Our PDF Split tool lets you extract specific pages or divide a PDF into separate documents."
  },
  {
    category: "Features",
    question: "Do you have a PDF compression tool?",
    answer: "Yes! Our PDF compression tool reduces file size by 60-70% on average while maintaining readability and professional quality."
  },
  {
    category: "Features",
    question: "Can I edit PDFs directly?",
    answer: "We offer a PDF Form Filler for completing and signing PDF forms. For extensive editing, convert to Word first, make changes, then convert back to PDF."
  },
  {
    category: "OCR & Scanned Documents",
    question: "What is OCR?",
    answer: "OCR (Optical Character Recognition) is technology that converts images of text into actual, editable text. It's essential for digitizing scanned documents and making them searchable."
  },
  {
    category: "OCR & Scanned Documents",
    question: "What languages does OCR support?",
    answer: "Our OCR supports 15+ languages including English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Russian, Arabic, and more."
  },
  {
    category: "OCR & Scanned Documents",
    question: "How can I improve OCR accuracy?",
    answer: "Use high-quality scans (300+ DPI), ensure good lighting and contrast, flatten wrinkled pages, align documents straight, and use clean scanner glass."
  },
  {
    category: "Business Use",
    question: "Can I use this for commercial purposes?",
    answer: "Yes! Our service is free for both personal and commercial use. Process business documents, client files, and invoices without restrictions."
  },
  {
    category: "Business Use",
    question: "Do you offer an API for developers?",
    answer: "Not currently, but we're considering this for future releases. Contact us if you're interested in API access for your business."
  },
  {
    category: "Business Use",
    question: "Can multiple team members use the service?",
    answer: "Absolutely! Since no registration is required, any team member can access our tools directly. Consider bookmarking our site for quick access."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];
  const filteredFAQs = selectedCategory === "All"
    ? faqs
    : faqs.filter(f => f.category === selectedCategory);

  return (
    <>
      <Head>
        <title>Frequently Asked Questions | Document Converter Pro Help Center</title>
        <meta name="description" content="Find answers to common questions about PDF to Word conversion, document security, file formats, OCR technology, and more. Complete FAQ and help center." />
        <meta name="keywords" content="PDF converter FAQ, document conversion help, PDF to Word questions, converter support, how to convert PDF" />
        <link rel="canonical" href="https://docs-app.net/faq" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
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
                <Link href="/faq" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>FAQ</Link>
                <Link href="/about" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500' }}>About</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '60px 20px', color: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>
              Frequently Asked Questions
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.9 }}>
              Get instant answers to common questions about document conversion
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section style={{ padding: '32px 20px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '20px',
                    border: selectedCategory === cat ? 'none' : '2px solid #e2e8f0',
                    background: selectedCategory === cat ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                    color: selectedCategory === cat ? 'white' : '#4a5568',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1a202c'
                  }}
                >
                  <span>{faq.question}</span>
                  <span style={{
                    fontSize: '24px',
                    color: '#667eea',
                    transition: 'transform 0.2s',
                    transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}>
                    +
                  </span>
                </button>
                {openIndex === index && (
                  <div style={{
                    padding: '0 24px 24px 24px',
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#4a5568',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '20px'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section style={{ padding: '60px 20px', background: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
              Still Have Questions?
            </h2>
            <p style={{ fontSize: '18px', color: '#718096', marginBottom: '32px' }}>
              Can't find the answer you're looking for? Get in touch with our team.
            </p>
            <a
              href="mailto:genius@drop-it.tech"
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '18px'
              }}
            >
              Contact Support
            </a>
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
