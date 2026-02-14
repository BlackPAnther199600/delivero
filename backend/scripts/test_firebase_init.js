#!/usr/bin/env node
/**
 * Quick Firebase Push Test
 * Tests if Firebase is properly initialized and can send messages
 */

import admin from 'firebase-admin';
import fs from 'fs';

console.log('🧪 Firebase Push Initialization Test\n');

const svcPath = '/app/firebase-key.json';

try {
    console.log('📂 Reading Firebase key from:', svcPath);

    if (!fs.existsSync(svcPath)) {
        console.log('❌ File not found:', svcPath);
        console.log('📁 Files in /app:', fs.readdirSync('/app').filter(f => f.includes('firebase')));
        process.exit(1);
    }

    const fileContent = fs.readFileSync(svcPath, 'utf-8');
    const cred = JSON.parse(fileContent);

    console.log('✅ Firebase key file read successfully');
    console.log('📊 Project ID:', cred.project_id);
    console.log('📊 Service Account Email:', cred.client_email);

    // Initialize Firebase
    if (!admin.apps.length) {
        admin.initializeApp({ credential: admin.credential.cert(cred) });
        console.log('\n✅ Firebase Admin SDK Initialized');
    } else {
        console.log('\n✅ Firebase Admin SDK Already Initialized');
    }

    // Test sending a message to a non-existent token (to check if service works)
    console.log('\n📤 Testing message sending...');

    const message = {
        notification: {
            title: 'Test Push',
            body: 'Firebase is working!'
        },
        webpush: {
            fcmOptions: {
                link: 'https://delivero.app'
            }
        },
        token: 'test-token-invalid' // This will fail, but shows if Firebase is reachable
    };

    admin.messaging().send(message)
        .then((response) => {
            console.log('✅ Message sent successfully:', response);
        })
        .catch((error) => {
            if (error.code === 'messaging/invalid-argument') {
                console.log('⚠️ Invalid token (expected for test), but Firebase is responding correctly');
                console.log('✅ Firebase is properly configured and reachable');
            } else {
                console.log('❌ Firebase error:', error.message);
            }
        })
        .finally(() => {
            console.log('\n✅ Test Complete');
            process.exit(0);
        });

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
}
