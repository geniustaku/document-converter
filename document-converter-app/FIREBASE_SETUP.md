# Firebase Configuration Guide - Genius SA Tools

This document provides the complete Firebase configuration for connecting your Next.js application to the **genius-sa-tools** Firebase project.

## 📋 Table of Contents
- [Firebase Project Details](#firebase-project-details)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Firebase Configuration File](#firebase-configuration-file)
- [Available Services](#available-services)
- [Usage Examples](#usage-examples)
- [Firestore Collections](#firestore-collections)
- [Security Rules](#security-rules)
- [Troubleshooting](#troubleshooting)

---

## 🔥 Firebase Project Details

**Project Name:** genius-sa-tools
**Project ID:** genius-sa-tools
**Region:** Multi-region (default)

### Services Enabled:
- ✅ Firestore Database
- ✅ Authentication
- ✅ Cloud Storage
- ✅ Analytics
- ✅ Hosting (optional)

---

## 🔐 Environment Variables

Create a `.env.local` file in your project root and add these variables:

```env
# Firebase Configuration - genius-sa-tools
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBa1btWkbw2CPmxQ9D-ruw6fzw1EC629fE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=genius-sa-tools.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=genius-sa-tools
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=genius-sa-tools.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=216840912866
NEXT_PUBLIC_FIREBASE_APP_ID=1:216840912866:web:ae24f91f0979aaef1f03bb
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5HP57NKK9Y
```

**Important Notes:**
- All variables start with `NEXT_PUBLIC_` because they're used in client-side code
- These are public API keys - Firebase security is controlled by Security Rules, not by hiding keys
- Never commit `.env.local` to version control (add to `.gitignore`)

---

## 📦 Installation

### 1. Install Firebase SDK

```bash
npm install firebase
```

### 2. Install Additional Dependencies (if needed)

```bash
# For server-side operations
npm install firebase-admin

# For Authentication (if using NextAuth)
npm install next-auth
```

---

## ⚙️ Firebase Configuration File

Create `lib/firebase.ts` in your project:

```typescript
// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBa1btWkbw2CPmxQ9D-ruw6fzw1EC629fE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "genius-sa-tools.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "genius-sa-tools",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "genius-sa-tools.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "216840912866",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:216840912866:web:ae24f91f0979aaef1f03bb",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-5HP57NKK9Y"
};

// Initialize Firebase (singleton pattern)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
```

---

## 🛠️ Available Services

### 1. Firestore Database (`db`)

**Import:**
```typescript
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
```

**Example Usage:**
```typescript
// Read data
const articlesRef = collection(db, 'articles');
const querySnapshot = await getDocs(articlesRef);

// Add data
const docRef = await addDoc(collection(db, 'articles'), {
  title: 'My Article',
  content: 'Article content',
  created_at: new Date()
});

// Query data
const q = query(
  collection(db, 'articles'),
  where('category', '==', 'Business')
);
const results = await getDocs(q);
```

### 2. Authentication (`auth`)

**Import:**
```typescript
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
```

**Example Usage:**
```typescript
// Sign up
const userCredential = await createUserWithEmailAndPassword(
  auth,
  email,
  password
);

// Sign in
const userCredential = await signInWithEmailAndPassword(
  auth,
  email,
  password
);

// Sign out
await signOut(auth);
```

### 3. Cloud Storage (`storage`)

**Import:**
```typescript
import { storage } from '@/lib/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
```

**Example Usage:**
```typescript
// Upload file
const storageRef = ref(storage, 'images/my-image.jpg');
const snapshot = await uploadBytes(storageRef, file);

// Get download URL
const url = await getDownloadURL(storageRef);

// Delete file
await deleteObject(storageRef);
```

### 4. Analytics (`analytics`)

**Import:**
```typescript
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';
```

**Example Usage:**
```typescript
// Log custom event (client-side only)
if (analytics) {
  logEvent(analytics, 'page_view', {
    page_title: 'Home',
    page_path: '/'
  });
}
```

---

## 📊 Firestore Collections

### Current Database Structure:

#### 1. **articles** Collection
```typescript
interface Article {
  id: string;                    // Auto-generated document ID
  title: string;                 // Article title
  slug: string;                  // URL-friendly slug
  excerpt: string;               // Short description
  content: string;               // Full HTML content
  category: string;              // Category (Business, Banking, etc.)
  author: string;                // Author name
  is_published: boolean;         // Publication status
  reading_time: number;          // Minutes to read
  featured_image: string;        // Image URL
  published_at: Timestamp;       // Publication date
  created_at: Timestamp;         // Creation date
  updated_at: Timestamp;         // Last update date
  source_url: string;            // Original article URL
  source_name: string;           // Source publication name
  seo_title: string;             // SEO title
  seo_description: string;       // SEO description
  seo_keywords: string[];        // SEO keywords array
}
```

#### 2. **analytics** Collection
```typescript
interface Analytics {
  id: string;
  event_type: string;            // 'page_view', 'article_view', etc.
  page_path: string;
  page_title: string;
  article_id?: string;           // Optional for article views
  timestamp: Timestamp;
  user_agent?: string;
  referrer?: string;
}
```

#### 3. **subscribers** Collection
```typescript
interface Subscriber {
  id: string;
  email: string;
  subscribed_at: Timestamp;
  is_active: boolean;
}
```

---

## 🔒 Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Articles - Public read, admin write
    match /articles/{articleId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Analytics - Write only, no public read
    match /analytics/{analyticsId} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow write: if true;
    }

    // Subscribers - Public write (subscribe), admin read
    match /subscribers/{subscriberId} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow create: if true;
      allow update, delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images - Public read, authenticated write
    match /images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Documents - Authenticated access only
    match /documents/{documentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 💡 Usage Examples

### Example 1: Fetch All Articles

```typescript
// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, orderBy('published_at', 'desc'));
    const querySnapshot = await getDocs(q);

    const articles = [];
    querySnapshot.forEach((doc) => {
      articles.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Example 2: Add New Article

```typescript
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

async function createArticle(articleData) {
  const articlesRef = collection(db, 'articles');

  const newArticle = {
    ...articleData,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
    published_at: Timestamp.now()
  };

  const docRef = await addDoc(articlesRef, newArticle);
  return docRef.id;
}
```

### Example 3: Upload Image to Storage

```typescript
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadImage(file: File) {
  const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);

  // Upload file
  const snapshot = await uploadBytes(storageRef, file);

  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}
```

### Example 4: Track Analytics Event

```typescript
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

async function trackPageView(pageData) {
  const analyticsRef = collection(db, 'analytics');

  await addDoc(analyticsRef, {
    event_type: 'page_view',
    page_path: pageData.path,
    page_title: pageData.title,
    timestamp: Timestamp.now(),
    user_agent: navigator.userAgent,
    referrer: document.referrer
  });
}
```

---

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Firebase App already initialized"
**Solution:** The configuration file uses singleton pattern. If you see this error, ensure you're using `getApps()` check.

#### 2. "Insufficient permissions"
**Solution:** Check your Firestore Security Rules. For development, you can temporarily set:
```javascript
allow read, write: if true; // ⚠️ Only for development!
```

#### 3. "Analytics is not available"
**Solution:** Analytics only works in browser. Always check:
```typescript
if (analytics) {
  // Use analytics
}
```

#### 4. "Storage reference not found"
**Solution:** Ensure the storage bucket name is correct and the file path exists.

---

## 🚀 Next Steps

1. **Copy Environment Variables** - Add to your `.env.local`
2. **Install Dependencies** - Run `npm install firebase`
3. **Create Firebase Config** - Copy the `lib/firebase.ts` file
4. **Import and Use** - Import services from `@/lib/firebase`
5. **Test Connection** - Try fetching data from Firestore

---

## 📞 Support

If you encounter any issues:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Verify your environment variables are correct
3. Check Firebase Console for quota limits
4. Review Security Rules in Firebase Console

---

## 🔑 Important Notes

- **API Keys are Public:** Firebase API keys in `NEXT_PUBLIC_*` variables are meant to be public
- **Security via Rules:** All security is managed through Firebase Security Rules
- **Quota Limits:** Free tier has limits - monitor usage in Firebase Console
- **Production Deploy:** Update `NEXT_PUBLIC_SITE_URL` for production

---

**Last Updated:** January 2025
**Firebase SDK Version:** v11.10.0
**Next.js Version:** v15.3.0
