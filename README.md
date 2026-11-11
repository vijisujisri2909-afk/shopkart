# ShopKart

ShopKart is a React storefront built with Vite. Firebase Authentication handles customer accounts, and Firestore stores products added by signed-in users.

## Configure Firebase

1. Create a Firebase project and register a Web app.
2. In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Copy `.env.example` to `.env.local` and fill in the Web app config values from **Project settings → Your apps**. Keep `.env.local` out of version control.
5. Add Firestore rules like these, then start the app:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.ownerId == request.auth.uid
        && request.resource.data.name is string
        && request.resource.data.category is string
        && request.resource.data.price is number
        && request.resource.data.price > 0
        && request.resource.data.oldPrice is number
        && request.resource.data.oldPrice >= request.resource.data.price
        && request.resource.data.image is string
        && request.resource.data.description is string
        && request.resource.data.rating == 4.5;
      allow update, delete: if false;
    }
  }
}
```

The app's Firebase settings are read from `NEXT_PUBLIC_FIREBASE_*` variables in `src/firebase.js` (Vite is configured to expose this prefix). Firebase web API keys identify the project; Firestore security rules protect the data. The example rules make the catalog readable to visitors, but only allow signed-in users to add products.

## Run locally

```sh
npm install
npm run dev
```

`npm run build` creates the production build, and `npm run lint` runs Oxlint.
