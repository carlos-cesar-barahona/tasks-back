import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const cred = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as admin.ServiceAccount;
    admin.initializeApp({ credential: admin.credential.cert(cred) });
} else {
    const servicePath = path.join(__dirname, "..", "src", "serviceFirebase.json");
    const serviceFirebase = JSON.parse(fs.readFileSync(servicePath, "utf8")) as admin.ServiceAccount;
    admin.initializeApp({
        credential: admin.credential.cert(serviceFirebase),
    });
}

export const db = admin.firestore();
