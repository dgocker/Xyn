import express from 'express';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Firebase Admin (User needs to provide service account)
// For this test, we assume the user has set up FIREBASE_SERVICE_ACCOUNT_JSON env var
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

app.post('/test-push', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).send('Token is required');
  }

  const message = {
    data: {
      type: 'test_call',
      title: 'Incoming VoIP Call',
      body: 'Incoming call from Test Service'
    },
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    res.send({ success: true, messageId: response });
  } catch (error) {
    res.status(500).send({ success: false, error: error });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
