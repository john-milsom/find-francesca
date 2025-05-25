const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');
const admin = require('firebase-admin');

// Initialize Firestore and Firebase Admin
const firestore = new Firestore();
if (!admin.apps.length) {
  admin.initializeApp();
}
const collection = firestore.collection('locations');

// Allowed users (move to env or secret manager for production)
const ALLOWED_USERS = [
  "john.milsom01@gmail.com",
  "liamdcunliffe@gmail.com"
];

async function verifyFirebaseToken(req) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return null;
  try {
    const decodedToken = await admin.auth().verifyIdToken(match[1]);
    if (!ALLOWED_USERS.includes(decodedToken.email)) return null;
    return decodedToken;
  } catch {
    return null;
  }
}

functions.http('locationHandler', async (req, res) => {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*'); // or specify your domain instead of '*'
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Require authentication for GET and POST
  // const user = await verifyFirebaseToken(req);
  // if (!user) {
  //   res.status(401).send('Unauthorized');
  //   return;
  // }

  try {
    if (req.method === 'POST') {
      const { lat, lng } = req.body;
      await collection.doc('latest').set({ lat, lng, timestamp: new Date() });
      res.status(200).send('Location saved');
    } else if (req.method === 'GET') {
      const doc = await collection.doc('latest').get();
      if (!doc.exists) {
        res.status(404).send('No location found');
      } else {
        res.status(200).json(doc.data());
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
