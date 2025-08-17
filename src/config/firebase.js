const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Initialize Firebase Admin
try {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
    universe_domain: "googleapis.com"
  };

  // Initialize Admin SDK
  const adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  // Initialize regular Firebase SDK
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID
  };

  const firebaseApp = initializeApp(firebaseConfig);
  
  // Export both admin and regular Firebase instances
  module.exports = {
    admin,
    db: getFirestore(firebaseApp),
    adminDb: admin.firestore(adminApp)
  };

} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  process.exit(1);
}
