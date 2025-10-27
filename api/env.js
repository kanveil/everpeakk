export default function handler(request, response) {
  const envVars = {
     FIREBASE_API_KEY: process.env.AIzaSyAvvhMpf_WitusAfR-sqI8pMLIAPqygOOY,
    FIREBASE_AUTH_DOMAIN: process.env.everpeak-df533.firebaseapp.com,
    FIREBASE_PROJECT_ID: process.env.everpeak-df533,
    FIREBASE_STORAGE_BUCKET: process.env.everpeak-df533.firebasestorage.app,
    FIREBASE_MESSAGING_SENDER_ID: process.env.314009845647,
    FIREBASE_APP_ID: process.env.1:314009845647:web:60381fba9cbecb51c395fa
    };
  
  response.status(200).json(envVars);
}
