const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();
const collection = firestore.collection('locations');

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

  try {
    if (req.method === 'POST') {
      const { lat, lng, postedAt } = req.body;
      await collection.doc('latest').set({ lat, lng, postedAt: postedAt });
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
