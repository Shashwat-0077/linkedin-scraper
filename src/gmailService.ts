import { Page, BrowserContext } from 'playwright';

export class GmailService {
    private page: Page | null = null;

    /**
     * Login to Gmail and fetch LinkedIn verification code using browser automation
     * @param context - Browser context to create new page in
     * @param gmailEmail - Gmail email address
     * @param gmailPassword - Gmail password
     * @returns Verification code or null if not found
     */
    async loginAndFetchCode(
        context: BrowserContext,
        gmailEmail: string,
        gmailPassword: string,
    ): Promise<string | null> {
        try {
            // Open Gmail in new page
            this.page = await context.newPage();

            console.log('   📧 Opening Gmail...');
            await this.page.goto('https://mail.google.com', {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            });
            await this.page.waitForTimeout(2000);

            // Check if already logged in
            const searchBox = await this.page.$('input[aria-label="Search mail"]');
            if (!searchBox) {
                // Not logged in, perform login
                console.log('   🔐 Logging into Gmail...');

                // Email step
                const emailInput = await this.page.$('input[type="email"]');
                if (emailInput) {
                    await emailInput.fill(gmailEmail);
                    await this.page.click('#identifierNext');
                    await this.page.waitForTimeout(3000);

                    // Password step
                    const passwordInput = await this.page.$('input[type="password"]');
                    if (passwordInput) {
                        await passwordInput.fill(gmailPassword);
                        await this.page.click('#passwordNext');
                        await this.page.waitForTimeout(5000);
                    } else {
                        console.log('   ⚠ Password input not found');
                        await this.closePage();
                        return null;
                    }
                } else {
                    console.log('   ⚠ Email input not found');
                    await this.closePage();
                    return null;
                }
            } else {
                console.log('   ✓ Already logged into Gmail');
            }

            // Search for LinkedIn verification email
            console.log('   🔍 Searching for verification email...');

            // Use search box to find LinkedIn emails
            const searchInput =
                (await this.page.$('input[aria-label="Search mail"]')) ||
                (await this.page.$('input[placeholder="Search mail"]'));

            if (searchInput) {
                await searchInput.fill('from:security-noreply@linkedin.com');
                await searchInput.press('Enter');
                await this.page.waitForTimeout(4000);

                // Click first email (most recent)
                const firstEmail = await this.page.$('tr.zA, tr[role="row"]');
                if (firstEmail) {
                    console.log('   ✓ Found verification email');
                    await firstEmail.click();
                    await this.page.waitForTimeout(3000);

                    // Extract code from email body
                    const emailBodySelectors = ['.a3s', '.ii.gt', '[data-message-id]', '.gmail_quote'];

                    let code: string | null = null;
                    for (const selector of emailBodySelectors) {
                        const emailBody = await this.page.$(selector);
                        if (emailBody) {
                            const text = await emailBody.textContent();
                            code = this.extractCode(text);
                            if (code) {
                                console.log(`   ✓ Extracted code: ${code}`);
                                break;
                            }
                        }
                    }

                    await this.closePage();
                    return code;
                } else {
                    console.log('   ⚠ No verification emails found');
                }
            } else {
                console.log('   ⚠ Search box not found');
            }

            await this.closePage();
            return null;
        } catch (error) {
            console.log('   ⚠ Gmail error:', (error as Error).message);
            await this.closePage();
            return null;
        }
    }

    /**
     * Extract 6-digit verification code from text
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

    /**
     * Close Gmail page safely
     */
    private async closePage(): Promise<void> {
        try {
            if (this.page && !this.page.isClosed()) {
                await this.page.close();
            }
            this.page = null;
        } catch (error) {
            // Ignore errors when closing
        }
    }
}
