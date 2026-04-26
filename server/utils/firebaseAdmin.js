import admin from "firebase-admin";

const buildServiceAccount = () => {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return null;
  }

  try {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch {
    return null;
  }
};

if (!admin.apps.length) {
  const serviceAccount = buildServiceAccount();
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminFieldValue = admin.firestore.FieldValue;
