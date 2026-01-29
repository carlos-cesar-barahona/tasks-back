import * as admin from "firebase-admin";
import * as serviceFirebase from "./serviceFirebase.json";

admin.initializeApp({
    credential: admin.credential.cert(serviceFirebase as admin.ServiceAccount),
});

export const db = admin.firestore();
