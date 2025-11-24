const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

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

async function testAdd() {
  console.log('🚀 Testing Firebase connection and adding test article...\n');

  const articlesRef = collection(db, 'docuarticles');

  const testArticle = {
    title: "Test Article - PDF Management for Small Businesses",
    slug: "test-pdf-management-small-business",
    excerpt: "This is a test article to verify Firebase connection works properly.",
    category: "Business Tools",
    tags: ["test", "PDF management", "small business"],
    author: "Document Converter Pro Team",
    author_bio: "Testing team",
    is_published: true,
    reading_time: 5,
    featured_image: "",
    seo_title: "Test Article",
    seo_description: "Test article for Firebase",
    seo_keywords: ["test"],
    content: "This is test content to verify the system works.",
    published_at: Timestamp.now(),
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
    views: 0
  };

  try {
    const docRef = await addDoc(articlesRef, testArticle);
    console.log(`✅ Success! Test article added with ID: ${docRef.id}\n`);
    console.log('Firebase connection working properly!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error}\n`);
    process.exit(1);
  }
}

testAdd();
