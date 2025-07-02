import * as admin from "firebase-admin";
import { appSettings } from "./appsettings";

const credential = appSettings.firebase;

admin.initializeApp({
  credential: admin.credential.cert(credential as any),
  // storageBucket: process.env.FB_STORAGE_BUCKET,
});

export default admin;