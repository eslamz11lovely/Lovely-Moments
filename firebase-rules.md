# Firebase Firestore Security Rules

## Instructions to Apply Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **lovely-link**
3. Go to **Firestore Database**
4. Click on **Rules** tab
5. Replace the existing rules with the rules below
6. Click **Publish**

---

## Temporary Development Rules (Allow All)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all read and write operations - FOR DEVELOPMENT ONLY
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Recommended Production Rules (After Testing)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow public read access to pricing and examples
    match /pricing/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /examples/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders - Public can create, only authenticated can read/update
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
    
    // Messages - Public can create, only authenticated can read/delete
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if true;
      allow delete: if request.auth != null;
    }

    // Reviews - Anyone can read approved reviews and create new ones
    match /reviews/{reviewId} {
      // Public can read approved reviews
      allow read: if resource.data.approved == true;
      // Public can create (submit form) — always pending, never auto-approved
      allow create: if request.resource.data.approved == false
                    && request.resource.data.status == 'pending';
      // Only authenticated admin can update or delete
      allow update, delete: if request.auth != null;
    }
  }
}
```

---

## Storage Rules (For Image Uploads)

If using Firebase Storage for you're images, also update storage rules:

1. Go to **Storage** in Firebase Console
2. Click on **Rules**
3. Use these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        || request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```
