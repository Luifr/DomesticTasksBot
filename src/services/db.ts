import admin from 'firebase-admin';

const serviceAccount: { projectId: string, privateKey: string, clientEmail: string } = {
  clientEmail: process.env.CLIENT_EMAIL!,
  privateKey: process.env.PRIVATE_KEY!.replace(/\\n/g, '\n'),
  projectId: process.env.PROJECT_ID!
};

const databaseName = process.env.DATABASE_NAME;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${databaseName}.firebaseio.com`
});

export const db = admin.firestore();
