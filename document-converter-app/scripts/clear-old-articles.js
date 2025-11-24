const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function clearOldArticles() {
  console.log('🗑️  Clearing old articles from Firestore...\n');

  const articlesRef = collection(db, 'docuarticles');
  const snapshot = await getDocs(articlesRef);

  console.log(`Found ${snapshot.size} existing articles to delete\n`);

  for (const document of snapshot.docs) {
    const title = document.data().title || 'Untitled';
    console.log(`  Deleting: ${title}`);
    await deleteDoc(doc(db, 'docuarticles', document.id));
  }

  console.log('\n✅ All old articles cleared!\n');
  process.exit(0);
}

clearOldArticles().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
