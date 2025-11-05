// src/environments/environment.example.ts
// COPY THIS FILE TO environment.ts AND FILL IN YOUR ACTUAL VALUES
// DO NOT COMMIT environment.ts to version control

export const environment = {
  production: false,
  apiUrl: 'http://localhost:1000/api', // Spring Boot - Auth & User services
  nestApiUrl: 'http://localhost:3001', // NestJS - Recipe service

  // Add your Firebase config from Firebase Console
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.firebasestorage.app',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID',
  },
};
