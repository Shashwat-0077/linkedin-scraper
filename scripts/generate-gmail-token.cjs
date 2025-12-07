#!/usr/bin/env node

// Gmail OAuth2 Token Generator
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

// Load .env file if it exists
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ==== GMAIL API CREDENTIALS ====
const CLIENT_ID = process.env.GMAIL_CLIENT_ID || 'your-client-id.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || 'your-client-secret';
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || 'http://localhost';

// Gmail read-only permission
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Where we store the token
const TOKEN_PATH = process.env.TOKEN_FILE || path.join(__dirname, '..', 'token.json');

// Create OAuth2 client
function createOAuth2Client() {
    return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

// Load token.json if it exists
function loadSavedToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return resolve(null);
            try {
                oAuth2Client.setCredentials(JSON.parse(token));
                resolve(oAuth2Client);
            } catch (e) {
                reject(e);
            }
        });
    });
}

// Save token.json
function saveToken(token) {
    return new Promise((resolve, reject) => {
        fs.writeFile(TOKEN_PATH, JSON.stringify(token, null, 2), (err) => {
            if (err) return reject(err);
            console.log('✅ Token stored to', TOKEN_PATH);
            resolve();
        });
    });
}

// Ask user for input
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans.trim());
        }),
    );
}

// Get authenticated client
async function getAuthenticatedClient() {
    const oAuth2Client = createOAuth2Client();

    // Try to load existing token
    const clientWithToken = await loadSavedToken(oAuth2Client);
    if (clientWithToken) {
        console.log('✅ Using saved token from', TOKEN_PATH);
        return clientWithToken;
    }

    // Start OAuth flow
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('\n🔐 Authorize this app by visiting this URL:\n');
    console.log(authUrl, '\n');

    const code = await askQuestion('Paste the code from that page here: ');

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    await saveToken(tokens);

    console.log('\n✅ Token generated successfully!');
    console.log('Copy these values to your .env file:\n');
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GMAIL_ACCESS_TOKEN=${tokens.access_token}\n`);

    return oAuth2Client;
}

// Run
(async () => {
    try {
        await getAuthenticatedClient();
        console.log('✅ Done!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
})();
