# Email Alert Setup for SEO Monitor

## Overview
The SEO monitor can send email alerts when issues are detected. This requires Gmail app password setup.

## Setup Steps

### 1. Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security** from the left menu
3. Under "Signing in to Google", enable **2-Step Verification** (if not already enabled)
4. After 2FA is enabled, go back to Security
5. Click on **App passwords** (or search for "app passwords")
6. Create a new app password:
   - App: Mail
   - Device: Custom name (e.g., "Odanet SEO Monitor")
7. Copy the 16-character password

### 2. Add Environment Variables

In Replit, add these secrets:

```
ALERT_EMAIL_USER=your-email@gmail.com
ALERT_EMAIL_PASS=your-16-char-app-password
ALERT_TO_EMAIL=admin@odanet.com.tr
```

**How to add in Replit:**
1. Click the lock icon (🔒) in the left sidebar
2. Click "+ New secret"
3. Add each variable

### 3. Test Email Alerts

Run the monitor and trigger a test alert:

```bash
# This will send an alert if any issues are found
node scripts/seoMonitor.js
```

## Email Alert Triggers

Alerts are sent when:

✅ **URL Issues**
- Critical pages return 404 or 500 errors
- Pages are unreachable

✅ **SEO Issues**  
- Canonical tags point to wrong domain
- Missing meta tags on important pages

✅ **Sitemap Issues**
- Sitemap.xml is inaccessible
- Sitemap has fewer URLs than expected

✅ **Robots.txt Issues**
- Robots.txt missing or malformed
- Missing User-agent directive

## Alert Email Format

```
Subject: 🚨 Odanet SEO Health Alert

SEO monitoring detected the following issues:

• URL Error: /oda-ilan-ver returned 404
• Canonical Mismatch: / has wrong canonical
• Sitemap Warning: Only 5 URLs in sitemap (expected 40+)

Please investigate and resolve these issues.
```

## Troubleshooting

### "Invalid login" Error
- Make sure 2FA is enabled on your Google account
- Use an **App Password**, not your regular password
- Check that ALERT_EMAIL_USER matches the Gmail account

### Email Not Sending
- Verify all 3 environment variables are set
- Check spam folder
- Enable "Less secure app access" if using old Gmail setup

### Test Without Real Issues

To test email without breaking your site, temporarily modify the script to always send an alert:

```javascript
// In seoMonitor.js, after line with issues.length
issues.push({ type: "Test", message: "This is a test alert" });
```

## Production Recommendations

For production monitoring:

1. **Use a dedicated monitoring email** (e.g., seo-monitor@odanet.com.tr)
2. **Set up email filtering** to categorize SEO alerts
3. **Add multiple recipients** by modifying ALERT_TO_EMAIL:
   ```
   ALERT_TO_EMAIL=admin@odanet.com.tr,dev@odanet.com.tr
   ```

4. **Consider SMS alerts** for critical issues using Twilio or similar

## Alternative: Slack/Discord Webhooks

If you prefer Slack or Discord notifications instead of email:

```javascript
// Add to seoMonitor.js
async function sendSlackAlert(issues) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const text = issues.map(i => `• *${i.type}*: ${i.message}`).join("\n");
  
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "🚨 SEO Health Alert",
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text }
        }
      ]
    })
  });
}
```
