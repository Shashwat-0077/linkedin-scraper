import { google } from 'googleapis';

export interface GmailCredentials {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    refreshToken: string;
    accessToken: string;
    silent?: boolean;
}

export class GmailService {
    private oauth2Client: any;
    private silent: boolean;

    constructor(credentials: GmailCredentials) {
        if (
            !credentials.clientId ||
            !credentials.clientSecret ||
            !credentials.redirectUri ||
            !credentials.refreshToken ||
            !credentials.accessToken
        ) {
            throw new Error(
                'All Gmail credentials are required: clientId, clientSecret, redirectUri, refreshToken, accessToken',
            );
        }

        // Initialize OAuth2 client with credentials
        this.oauth2Client = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            credentials.redirectUri,
        );

        // Set credentials (access token and refresh token)
        this.oauth2Client.setCredentials({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
        });

        // Silent mode
        this.silent = credentials.silent ?? false;
    }

    /**
     * Helper method for logging that respects silent mode
     */
    private log(...args: any[]): void {
        if (!this.silent) {
            console.log(...args);
        }
    }

    /**
     * Fetch LinkedIn verification code from Gmail using Gmail API
     * @returns Verification code or null if not found
     */
    async fetchVerificationCode(): Promise<string | null> {
        try {
            this.log('   📧 Fetching verification code from Gmail...');

            const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

            // Search for LinkedIn verification emails
            const res = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 5,
                q: 'from:security-noreply@linkedin.com subject:"verification code"',
            });

            const messages = res.data.messages || [];

            if (!messages.length) {
                this.log('   ⚠ No verification emails found');
                return null;
            }

            // Get the most recent message
            const latestMessageId = messages[0].id;
            if (!latestMessageId) {
                this.log('   ⚠ No message ID found');
                return null;
            }

            this.log('   ✓ Found verification email');

            // Fetch the full message
            const msgRes = await gmail.users.messages.get({
                userId: 'me',
                id: latestMessageId,
                format: 'full',
            });

            const msg = msgRes.data;
            const headers = msg.payload?.headers || [];

            // Get subject to verify it's a verification email
            const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || '';
            this.log(`   📄 Subject: ${subject}`);

            // Extract email body
            const body = this.getPlainTextBody(msg.payload);

            if (body) {
                const code = this.extractCode(body);
                if (code) {
                    this.log(`   ✓ Extracted code: ${code}`);
                    return code;
                }
            }

            this.log('   ⚠ Could not extract code from email');
            return null;
        } catch (error) {
            this.log('   ⚠ Gmail API error:', (error as Error).message);
            return null;
        }
    }

    /**
     * Decode Gmail base64url encoded data
     */
    private decodeBase64Url(data: string): string {
        if (!data) return '';
        const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
        const buff = Buffer.from(normalized, 'base64');
        return buff.toString('utf8');
    }

    /**
     * Extract plain text body from Gmail message payload
     */
    private getPlainTextBody(payload: any): string {
        if (!payload) return '';

        if (payload.mimeType === 'text/plain' && payload.body && payload.body.data) {
            return this.decodeBase64Url(payload.body.data);
        }

        if (payload.parts && payload.parts.length) {
            for (const part of payload.parts) {
                const text = this.getPlainTextBody(part);
                if (text) return text;
            }
        }

        return '';
    }

    /**
     * Extract 6-digit verification code from email body
     */
    private extractCode(text: string | null): string | null {
        if (!text) return null;

        // Look for 6-digit code
        const match = text.match(/\b(\d{6})\b/);
        if (match) {
            return match[1];
        }

        // Try alternative patterns
        const altMatch = text.match(/verification code[:\s]+(\d{6})/i);
        if (altMatch) {
            return altMatch[1];
        }

        return null;
    }
}
