const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');
const admin = require('firebase-admin');

// Initialize Firestore and Firebase Admin
const firestore = new Firestore();
if (!admin.apps.length) {
  admin.initializeApp();
}
const collection = firestore.collection('locations');
const calendarCollection = firestore.collection('calendar');

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
    console.log("Decoded token:", decodedToken.email);
    if (!ALLOWED_USERS.includes(decodedToken.email)) return null;
    return decodedToken;
  } catch {
    return null;
  }
}

async function locationHandler(req, res) {
  console.log("Entered locationHandler:", req.method, req.route, req.path, req.body);
  try {
    if (req.method === 'POST') {
      console.log("locationHandler: POST request");
      const { lat, lng } = req.body;
      await collection.doc('latest').set({ lat, lng, timestamp: new Date() });
      res.status(200).send('Location saved');
    } else if (req.method === 'GET') {
      console.log("locationHandler: GET request");
      const doc = await collection.doc('latest').get();
      if (!doc.exists) {
        res.status(404).send('No location found');
      } else {
        res.status(200).json(doc.data());
      }
    } else {
      console.log("locationHandler: Method Not Allowed");
      res.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    console.error("locationHandler: Error", error);
    res.status(500).send('Internal Server Error');
  }
}

async function calendarHandler(req, res) {
  console.log("Entered calendarHandler:", req.method);

  try {
    if (req.method === 'GET') {
      console.log("calendarHandler: GET request");
      const snapshot = await calendarCollection.orderBy('from').get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(items);
    } else if (req.method === 'POST') {
      console.log("calendarHandler: POST request");
      const { from, to, name } = req.body;
      if (!from || !to || !name) {
        console.log("calendarHandler: Missing fields");
        res.status(400).send('Missing fields');
        return;
      }
      await calendarCollection.add({ from, to, name });
      res.status(200).send('Calendar entry added');
    } else if (req.method === 'DELETE') {
      console.log("calendarHandler: DELETE request");
      const { id } = req.body;
      if (!id) {
        console.log("calendarHandler: Missing id for delete");
        res.status(400).send('Missing id');
        return;
      }
      await calendarCollection.doc(id).delete();
      res.status(200).send('Calendar entry deleted');
    } else {
      console.log("calendarHandler: Method Not Allowed");
      res.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    console.error("calendarHandler: Error", error);
    res.status(500).send('Internal Server Error');
  }
}


functions.http('mainHandler', async (req, res) => {
  console.log("Entered mainHandler:", req.method, req.route, req.path, req.body);

  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log("findFrancesca: OPTIONS request");
    res.status(204).send('');
    return;
  }

  //Authenticate
  // const user = await verifyFirebaseToken(req);
  // if (!user) {
  //   console.log("Unauthorized access");
  //   res.status(401).send('Unauthorized');
  //   return;
  // }

  // Route requests to the appropriate method
  if (req.path === '/location') {
    await locationHandler(req, res);
  } else if (req.path === '/calendar') {
    await calendarHandler(req, res);
  } else {
    console.log("mainHandler: Unknown route", req.path);
    res.status(404).send('Not Found');
  }
});
