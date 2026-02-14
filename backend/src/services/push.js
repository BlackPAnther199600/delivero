import admin from 'firebase-admin';
import db from '../config/db.js';
import fs from 'fs';

let initialized = false;

export function initPush() {
    if (initialized) return;
    const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    try {
        if (svcPath) {
            const fileContent = fs.readFileSync(svcPath, 'utf-8');
            const cred = JSON.parse(fileContent);
            admin.initializeApp({ credential: admin.credential.cert(cred) });
            initialized = true;
            console.log('✅ Firebase admin initialized from path:', svcPath);
            return;
        }
        if (svcJson) {
            const obj = JSON.parse(svcJson);
            admin.initializeApp({ credential: admin.credential.cert(obj) });
            initialized = true;
            console.log('✅ Firebase admin initialized from JSON env');
            return;
        }
    } catch (e) {
        console.warn('❌ Firebase admin init failed:', e.message);
    }
}

export async function sendPushToUser(userId, payload) {
    try {
        if (!initialized) initPush();
        if (!admin.apps.length) {
            console.log('FCM not configured; skipping push');
            return false;
        }
        const res = await db.query('SELECT push_token FROM users WHERE id = $1', [userId]);
        const token = res.rows[0]?.push_token;
        if (!token) {
            console.log('No push token for user', userId);
            return false;
        }
        const message = {
            token,
            notification: {
                title: payload.title || 'Delivero',
                body: payload.body || ''
            },
            data: payload.data || {}
        };
        const r = await admin.messaging().send(message);
        console.log('Push sent, result:', r);
        return true;
    } catch (e) {
        console.warn('sendPushToUser failed:', e.message);
        return false;
    }
}

export default { initPush, sendPushToUser };
