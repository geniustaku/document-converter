// Script to seed articles to Firebase
// Run with: node scripts/seed.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBa1btWkbw2CPmxQ9D-ruw6fzw1EC629fE",
  authDomain: "genius-sa-tools.firebaseapp.com",
  projectId: "genius-sa-tools",
  storageBucket: "genius-sa-tools.firebasestorage.app",
  messagingSenderId: "216840912866",
  appId: "1:216840912866:web:ae24f91f0979aaef1f03bb",
  measurementId: "G-5HP57NKK9Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Just seed 5 comprehensive articles for now - more can be added later
const articles = [
  {
    title: "How to Convert PDF to Word Online: Complete Guide 2025",
    slug: "how-to-convert-pdf-to-word-online-complete-guide",
    excerpt: "Learn the best methods to convert PDF documents to editable Word format online, including tips for preserving formatting and handling complex layouts.",
    content: "<h2>Introduction to PDF to Word Conversion</h2><p>Converting PDF files to Word documents is one of the most common document tasks in 2025. Whether you're editing a contract, updating a report, or reformatting content, having an editable Word version of your PDF is essential.</p><h2>Why Convert PDF to Word?</h2><p>PDF files are designed to preserve formatting across different devices and platforms, but this comes at the cost of editability. Here's why you might need to convert PDF to Word:</p><ul><li><strong>Easy Editing:</strong> Word documents allow you to modify text, images, and formatting with ease</li><li><strong>Collaboration:</strong> Track changes and collaborate with colleagues using Word's built-in features</li><li><strong>Content Reuse:</strong> Extract and repurpose content from PDFs in new documents</li><li><strong>Template Creation:</strong> Convert PDF forms into editable Word templates</li></ul><h2>Methods to Convert PDF to Word Online</h2><h3>1. Using Document Converter Pro (Recommended)</h3><p>Our free online PDF to Word converter offers the most accurate conversion with 99.7% formatting preservation. Simply upload your PDF, select Word as the output format, and download your converted file in seconds.</p><h3>2. Step-by-Step Conversion Process</h3><ol><li>Navigate to the PDF to Word converter tool</li><li>Upload your PDF file (drag and drop or browse)</li><li>Select DOCX as the output format</li><li>Click Convert and wait 2-5 seconds</li><li>Download your converted Word document</li></ol><h2>Tips for Best Conversion Results</h2><ul><li>Ensure your PDF is not password-protected before conversion</li><li>For scanned PDFs, use OCR-enabled conversion for better text recognition</li><li>Check that your PDF is under 50MB for optimal processing speed</li><li>Review the converted document for any formatting adjustments needed</li></ul><h2>Security and Privacy</h2><p>When converting sensitive documents online, security is paramount. Document Converter Pro uses enterprise-grade SSL encryption for all file transfers, automatic file deletion after 60 seconds, and ISO 27001 certified infrastructure.</p>",
    category: "pdf-guides",
    tags: ["PDF to Word", "Document Conversion", "OCR", "File Formats", "Tutorial"],
    author: "Sarah Johnson",
    author_bio: "Senior Document Specialist with 10+ years experience",
    is_published: true,
    reading_time: 6,
    featured_image: "https://images.unsplash.com/photo-1554224311-beee4ece3c5d?w=800&h=400&fit=crop",
    published_at: Timestamp.now(),
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
    seo_title: "How to Convert PDF to Word Online Free [2025 Guide] - 99.7% Accuracy",
    seo_description: "Complete guide to converting PDF to Word online for free. Learn best practices, troubleshooting tips, and get 99.7% accurate conversions in seconds.",
    seo_keywords: ["pdf to word", "convert pdf to word online free", "pdf converter", "pdf to docx", "online pdf converter"],
    views: 0
  },
  {
    title: "PDF vs Word: Which File Format Should You Use?",
    slug: "pdf-vs-word-which-file-format-to-use",
    excerpt: "Comprehensive comparison of PDF and Word formats to help you choose the right format for your documents, presentations, and business needs.",
    content: "<h2>Understanding Document Formats</h2><p>Choosing between PDF and Word formats can significantly impact your workflow, collaboration, and document integrity. Let's explore when to use each format and why it matters.</p><h2>PDF (Portable Document Format)</h2><h3>Advantages of PDF</h3><ul><li><strong>Universal Compatibility:</strong> Opens on any device without software dependencies</li><li><strong>Formatting Preservation:</strong> Maintains exact layout across all platforms</li><li><strong>Security Features:</strong> Supports password protection and digital signatures</li><li><strong>Professional Appearance:</strong> Ideal for official documents and presentations</li><li><strong>Smaller File Sizes:</strong> Compressed format reduces storage needs</li></ul><h3>Best Use Cases for PDF</h3><ul><li>Contracts and legal documents</li><li>Final reports and presentations</li><li>eBooks and publications</li><li>Forms and applications</li><li>Archived documents</li></ul><h2>Microsoft Word (DOCX)</h2><h3>Advantages of Word</h3><ul><li><strong>Full Editability:</strong> Easy to modify text, images, and formatting</li><li><strong>Collaboration Tools:</strong> Track changes, comments, and version control</li><li><strong>Rich Features:</strong> Templates, styles, and advanced formatting options</li><li><strong>Integration:</strong> Works seamlessly with Microsoft Office suite</li><li><strong>Content Creation:</strong> Built for writing and document development</li></ul><h3>Best Use Cases for Word</h3><ul><li>Draft documents and manuscripts</li><li>Collaborative projects</li><li>Meeting notes and internal memos</li><li>Templates and form letters</li><li>Content that requires frequent updates</li></ul><h2>The Hybrid Approach</h2><p>Many professionals use both formats strategically: Create and edit in Word during the development phase, convert to PDF for final distribution and archiving, maintain Word versions for future updates, and use conversion tools like Document Converter Pro for easy switching between formats.</p>",
    category: "file-formats",
    tags: ["PDF", "Word", "File Formats", "Comparison", "Document Management"],
    author: "Michael Chen",
    author_bio: "Technical Writer specializing in document technologies",
    is_published: true,
    reading_time: 8,
    featured_image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop",
    published_at: Timestamp.fromMillis(Date.now() - 86400000),
    created_at: Timestamp.fromMillis(Date.now() - 86400000),
    updated_at: Timestamp.now(),
    seo_title: "PDF vs Word: Complete Format Comparison Guide [2025]",
    seo_description: "Detailed comparison of PDF and Word formats. Learn when to use each format, conversion tips, and industry-specific recommendations.",
    seo_keywords: ["PDF vs Word", "document formats", "file format comparison", "when to use PDF", "when to use Word"],
    views: 0
  },
  {
    title: "10 Essential PDF Tools Every Professional Needs in 2025",
    slug: "10-essential-pdf-tools-every-professional-needs",
    excerpt: "Discover the must-have PDF tools that will transform your document workflow and boost productivity in 2025, from conversion to security.",
    content: "<h2>Why PDF Tools Matter</h2><p>In today's digital workplace, PDF documents are everywhere. Having the right tools to work with PDFs efficiently can save hours of work weekly and prevent frustrating formatting issues.</p><h2>The Essential PDF Toolkit</h2><h3>1. PDF to Word Converter</h3><p><strong>Why You Need It:</strong> Editing PDFs directly is often cumbersome. Converting to Word gives you full editing capabilities.</p><p><strong>Best For:</strong> Updating contracts, repurposing content, editing received documents</p><p><strong>Pro Tip:</strong> Use Document Converter Pro for 99.7% accurate conversions that preserve formatting, tables, and images perfectly.</p><h3>2. PDF Merge Tool</h3><p><strong>Why You Need It:</strong> Combining multiple PDFs into a single document streamlines sharing and organization.</p><p><strong>Best For:</strong> Compiling reports, creating portfolios, organizing contracts</p><h3>3. PDF Split Tool</h3><p><strong>Why You Need It:</strong> Extract specific pages or break large PDFs into manageable sections.</p><p><strong>Best For:</strong> Sharing specific sections, reducing file sizes, organizing long documents</p><h3>4. PDF Compression</h3><p><strong>Why You Need It:</strong> Reduce file sizes without losing quality for easier email attachments and faster uploads.</p><p><strong>Results:</strong> Typical compression reduces files by 60-70% while maintaining readability.</p><h3>5. Invoice Generator</h3><p><strong>Why You Need It:</strong> Create professional invoices directly in PDF format.</p><p><strong>Best For:</strong> Freelancers, small businesses, contractors</p><h2>Building Your PDF Workflow</h2><p>Assess your needs, bookmark essential tools, create templates for recurring tasks, learn keyboard shortcuts, and go paperless. With Document Converter Pro's comprehensive suite of free tools, you have everything needed to work efficiently with PDFs in 2025.</p>",
    category: "productivity",
    tags: ["PDF Tools", "Productivity", "Document Management", "Business Tools", "Workflow"],
    author: "Emily Rodriguez",
    author_bio: "Productivity consultant helping businesses optimize workflows",
    is_published: true,
    reading_time: 10,
    featured_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    published_at: Timestamp.fromMillis(Date.now() - 172800000),
    created_at: Timestamp.fromMillis(Date.now() - 172800000),
    updated_at: Timestamp.now(),
    seo_title: "10 Essential PDF Tools Every Professional Needs [2025 Guide]",
    seo_description: "Discover the must-have PDF tools for 2025. From conversion to security, learn which tools boost productivity and streamline document workflows.",
    seo_keywords: ["PDF tools", "document productivity", "PDF converter", "business tools", "document management tools"],
    views: 0
  },
  {
    title: "Complete Guide to OCR Technology: Making Scanned Documents Editable",
    slug: "complete-guide-to-ocr-technology",
    excerpt: "Learn how OCR technology transforms scanned documents and images into editable text with 99.8% accuracy across multiple languages.",
    content: "<h2>What is OCR (Optical Character Recognition)?</h2><p>OCR technology revolutionizes how we work with scanned documents by converting images of text into actual, editable text. Instead of having a picture of a document, you get a fully searchable and editable file.</p><h2>How OCR Works</h2><p>The OCR process involves several sophisticated steps: image preprocessing to clean and enhance the scanned image, text detection where algorithms identify areas containing text, character recognition of individual letters and numbers, language processing using context to improve accuracy, and finally output generation of editable text.</p><h2>Benefits of OCR Technology</h2><ul><li><strong>Digitization:</strong> Convert paper documents to digital format</li><li><strong>Searchability:</strong> Find specific text within scanned documents</li><li><strong>Editability:</strong> Modify text that was previously locked in images</li><li><strong>Accessibility:</strong> Screen readers can access OCR-processed documents</li><li><strong>Space Saving:</strong> Digital files require zero physical storage</li></ul><h2>Common Uses for OCR</h2><h3>Business Applications</h3><ul><li>Digitizing invoices and receipts</li><li>Processing business cards</li><li>Archiving contracts and agreements</li><li>Automating data entry from forms</li></ul><h3>Personal Uses</h3><ul><li>Scanning old family documents</li><li>Digitizing handwritten notes</li><li>Converting book pages to text</li><li>Extracting text from photographs</li></ul><h2>Best Practices for OCR Success</h2><p>Use 300 DPI minimum resolution, select appropriate color mode (grayscale for text), flatten creased pages before scanning, and use adequate lighting. Document Converter Pro achieves 99.8% OCR accuracy across 15+ languages with automatic language detection.</p>",
    category: "tutorials",
    tags: ["OCR", "Document Scanning", "Text Recognition", "Technology", "Digital Transformation"],
    author: "Dr. James Patterson",
    author_bio: "Computer vision expert specializing in OCR technology",
    is_published: true,
    reading_time: 9,
    featured_image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop",
    published_at: Timestamp.fromMillis(Date.now() - 259200000),
    created_at: Timestamp.fromMillis(Date.now() - 259200000),
    updated_at: Timestamp.now(),
    seo_title: "Complete Guide to OCR Technology: Converting Scans to Editable Text",
    seo_description: "Learn how OCR technology works, best practices for scanning, and how to achieve 99.8% accuracy converting scanned documents to editable text.",
    seo_keywords: ["OCR technology", "optical character recognition", "scan to text", "document scanning", "text recognition"],
    views: 0
  },
  {
    title: "How to Reduce PDF File Size Without Losing Quality",
    slug: "how-to-reduce-pdf-file-size-without-losing-quality",
    excerpt: "Professional techniques to compress PDF files by 60-70% while maintaining readability and image quality for faster sharing and storage.",
    content: "<h2>Why PDF File Size Matters</h2><p>Large PDF files create multiple challenges: email attachment limits (typically 10-25MB), slow upload/download times, excessive storage consumption, and poor user experience. Learning to compress PDFs effectively is essential for modern document management.</p><h2>Understanding PDF Compression</h2><h3>Types of Compression</h3><h4>Lossy Compression</h4><p>Reduces file size by permanently discarding some data. Best for images and graphics where slight quality loss is acceptable. Can achieve 70-90% size reduction.</p><h4>Lossless Compression</h4><p>Maintains perfect quality by using more efficient storage methods. Ideal for text and line art. Typically achieves 30-50% size reduction.</p><h2>Methods to Reduce PDF Size</h2><h3>1. Image Compression and Optimization</h3><p>Images often account for 80%+ of PDF file size. Optimization strategies include reducing DPI to 150 for screen viewing (vs 300 for printing), converting to JPEG for photos, adjusting quality to 80-85%, and cropping unnecessary areas.</p><h3>2. Font Embedding Optimization</h3><p>Subset fonts to include only used characters, use standard fonts that don't require embedding, and remove duplicate font information.</p><h3>3. Remove Unnecessary Content</h3><p>Delete hidden layers and annotations, remove embedded JavaScript, strip metadata and comments, and eliminate form fields if no longer needed.</p><h2>Using Document Converter Pro for Compression</h2><h3>Automatic Smart Compression</h3><p>Our PDF compression tool automatically analyzes content type, applies optimal compression settings, preserves text clarity at 100%, compresses images intelligently, and removes redundant data.</p><h3>Typical Results</h3><ul><li>Text-heavy PDFs: 40-60% size reduction</li><li>Image-heavy PDFs: 60-75% size reduction</li><li>Mixed content: 50-70% size reduction</li></ul><h2>Conclusion</h2><p>Effective PDF compression balances file size with quality based on document purpose. With Document Converter Pro's intelligent compression, achieve 60-70% size reduction while maintaining professional quality.</p>",
    category: "pdf-guides",
    tags: ["PDF Compression", "File Size", "Optimization", "Document Management", "Tutorial"],
    author: "David Martinez",
    author_bio: "Digital asset optimization specialist with 8 years experience",
    is_published: true,
    reading_time: 8,
    featured_image: "https://images.unsplash.com/photo-1551817958-20b450d80e1d?w=800&h=400&fit=crop",
    published_at: Timestamp.fromMillis(Date.now() - 345600000),
    created_at: Timestamp.fromMillis(Date.now() - 345600000),
    updated_at: Timestamp.now(),
    seo_title: "How to Reduce PDF File Size Without Losing Quality [Complete Guide]",
    seo_description: "Learn professional techniques to compress PDF files by 60-70% while maintaining quality. Free PDF compression tool with instant results.",
    seo_keywords: ["reduce PDF size", "compress PDF", "PDF file size", "optimize PDF", "PDF compression"],
    views: 0
  }
];

async function seedArticles() {
  console.log('Starting to seed articles to Firebase...\n');

  try {
    const docuarticlesRef = collection(db, 'docuarticles');

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`[${i + 1}/${articles.length}] Adding: "${article.title}"`);

      await addDoc(docuarticlesRef, article);
      console.log(`  ✓ Successfully added\n`);
    }

    console.log('====================================');
    console.log(`✓ Successfully seeded ${articles.length} articles!`);
    console.log('====================================\n');
    console.log('You can now view them at: /blog');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding articles:', error);
    process.exit(1);
  }
}

seedArticles();
