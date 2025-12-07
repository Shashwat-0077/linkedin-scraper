#!/usr/bin/env node

// Gmail OAuth2 Token Generator
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

// Find and load linkedin-scraper.config.cjs
function findConfigFile() {
    let currentDir = process.cwd();
    const root = path.parse(currentDir).root;

    // Search upward from current directory to root
    while (currentDir !== root) {
        const configPath = path.join(currentDir, 'linkedin-scraper.config.cjs');
        if (fs.existsSync(configPath)) {
            return configPath;
        }
        currentDir = path.dirname(currentDir);
    }

    // Check root directory
    const rootConfigPath = path.join(root, 'linkedin-scraper.config.cjs');
    if (fs.existsSync(rootConfigPath)) {
        return rootConfigPath;
    }

    return null;
}

function loadConfig() {
    const configPath = findConfigFile();

    if (!configPath) {
        console.log('⚠️  Warning: linkedin-scraper.config.cjs not found.');
        console.log('   Falling back to environment variables or defaults.\n');
        return null;
    }

    try {
        console.log(`✓ Loading config from: ${configPath}\n`);
        const config = require(configPath);
        return config;
    } catch (error) {
        console.error(`❌ Failed to load config: ${error.message}`);
        console.log('   Falling back to environment variables or defaults.\n');
        return null;
    }
}

// Load configuration
const config = loadConfig();

// ==== GMAIL API CREDENTIALS ====
// Priority: config file > environment variables > defaults
const CLIENT_ID =
    (config && config.gmailClientId) || process.env.GMAIL_CLIENT_ID || 'your-client-id.apps.googleusercontent.com';
const CLIENT_SECRET = (config && config.gmailClientSecret) || process.env.GMAIL_CLIENT_SECRET || 'your-client-secret';
const REDIRECT_URI = (config && config.gmailRedirectUri) || process.env.GMAIL_REDIRECT_URI || 'http://localhost';

// Gmail read-only permission
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Where we store the token
const TOKEN_PATH =
    (config && config.tokenFile) || process.env.TOKEN_FILE || path.join(process.cwd(), 'sessions', 'gmail-token.json');

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
    console.log('Copy these values to your linkedin-scraper.config.cjs file:\n');
    console.log(`    gmailRefreshToken: '${tokens.refresh_token}',`);
    console.log(`    gmailAccessToken: '${tokens.access_token}',\n`);

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
