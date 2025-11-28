# Gmail SMTP Setup Guide

## Overview

Your e-commerce platform now uses **Gmail SMTP** to send email notifications instead of Resend. This allows you to send emails directly from your Gmail account (`trendzone2009@gmail.com`).

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Enable 2-Factor Authentication

Gmail App Passwords require 2-Factor Authentication to be enabled.

1. Go to your Google Account: [https://myaccount.google.com](https://myaccount.google.com)
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google," click **2-Step Verification**
4. Follow the prompts to enable 2FA (you can use SMS or Google Authenticator)

### Step 2: Generate Gmail App Password

1. Go to your Google Account: [https://myaccount.google.com](https://myaccount.google.com)
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google," click **2-Step Verification**
4. Scroll down and click **App passwords** (at the bottom of the page)
5. You may need to sign in again
6. In the "Select app" dropdown, choose **Mail**
7. In the "Select device" dropdown, choose **Other (Custom name)**
8. Enter a name like "E-commerce Store" or "Order Notifications"
9. Click **Generate**
10. Google will show you a 16-character password (e.g., `abcd efgh ijkl mnop`)
11. **Copy this password immediately** - you won't be able to see it again!

### Step 3: Update Your .env File

1. Open `mens-fashion-store/.env`
2. Find the `GMAIL_APP_PASSWORD` line
3. Replace the empty quotes with your App Password (remove spaces):

```bash
# Email Configuration (Gmail SMTP)
GMAIL_USER='trendzone2009@gmail.com'
GMAIL_APP_PASSWORD='abcdefghijklmnop'  # Your 16-character password (no spaces!)
EMAIL_FROM='trendzone2009@gmail.com'
```

**Important:**
- Remove all spaces from the App Password
- Keep the quotes around the password
- Don't share this password with anyone
- If you lose it, just generate a new one

---

## ✅ Testing

### Test the Email System

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Place a test order:**
   - Go to your website
   - Add items to cart
   - Complete checkout with a valid email address
   - Check both the console and your email inbox

3. **Check console logs:**
   ```
   ✅ Look for: "Email sent successfully: <message-id>"
   ❌ If error: Check the error message for details
   ```

4. **Check your email:**
   - The order confirmation should arrive within 1-2 minutes
   - Check your spam folder if you don't see it
   - The email will come from "Men's Fashion Store <trendzone2009@gmail.com>"

---

## 🚨 Troubleshooting

### Email not sending?

**Error: "Gmail credentials not configured"**
```
Solution: Make sure both GMAIL_USER and GMAIL_APP_PASSWORD are set in .env
```

**Error: "Invalid login: 535-5.7.8 Username and Password not accepted"**
```
Solution:
1. Double-check your App Password (no spaces!)
2. Make sure you're using an App Password, NOT your regular Gmail password
3. Verify 2FA is enabled on your Google Account
4. Try generating a new App Password
```

**Error: "Too many login attempts"**
```
Solution:
1. Wait 15-30 minutes
2. Check if you're using the correct App Password
3. Try generating a new App Password
```

**Error: "Less secure app access"**
```
Solution:
This error shouldn't occur with App Passwords. If you see it:
1. Make sure you're using an App Password (16 characters)
2. NOT your regular Gmail password
```

### Emails going to spam?

If your emails are going to the spam folder:

1. **Add to Safe Senders:**
   - Ask customers to add your email to their contacts
   - Or mark your email as "Not Spam"

2. **Warm Up Your Account:**
   - Start by sending a few emails per day
   - Gradually increase volume over 1-2 weeks

3. **Improve Email Content:**
   - Avoid spam trigger words (FREE, URGENT, etc.)
   - Keep a good text-to-image ratio
   - Include an unsubscribe link (if sending marketing emails)

---

## 📊 Gmail Sending Limits

### Free Gmail Account Limits

- **500 emails per day** (rolling 24-hour period)
- **500 recipients per email**
- Limits reset every 24 hours

### What happens if you exceed limits?

- Gmail will temporarily block sending
- You'll see error: "Daily sending quota exceeded"
- Wait 24 hours for the limit to reset
- Or upgrade to Google Workspace for higher limits

### Google Workspace (Paid) Limits

- **2,000 emails per day** (standard plan)
- **10,000 emails per day** (higher tiers)
- More reliable for business use

### Recommendations

- **Small store (< 50 orders/day):** Free Gmail is fine
- **Medium store (50-200 orders/day):** Consider Google Workspace
- **Large store (> 200 orders/day):** Use a dedicated email service (SendGrid, Mailgun, etc.)

---

## 🔐 Security Best Practices

### Protecting Your App Password

**✅ DO:**
- Store App Password in `.env` file only
- Add `.env` to `.gitignore` (already done)
- Use different App Passwords for different apps
- Revoke App Passwords you're not using
- Regenerate if compromised

**❌ DON'T:**
- Commit App Password to Git
- Share App Password publicly
- Use your regular Gmail password in .env
- Store passwords in code files

### Revoking App Passwords

If you need to revoke an App Password:

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Click **2-Step Verification**
3. Scroll to **App passwords**
4. Click the X next to the password you want to revoke
5. Generate a new one if needed

---

## 🎨 Customizing Emails

The email templates are in [mens-fashion-store/lib/email.ts](mens-fashion-store/lib/email.ts).

You can customize:
- Colors and styling
- Email content and text
- Header and footer
- Company name and branding

**Example: Change sender name**

In [email.ts:69](mens-fashion-store/lib/email.ts#L69), change:
```typescript
from: `"Men's Fashion Store" <${fromEmail}>`,
```

To your business name:
```typescript
from: `"TrendZone Fashion" <${fromEmail}>`,
```

---

## 📧 Email Types Being Sent

### 1. Order Confirmation Email
- **Sent when:** Customer completes checkout
- **Contains:** Order details, items, shipping address, total
- **Triggers:** [app/api/orders/route.ts:146-167](app/api/orders/route.ts#L146-L167)

### 2. Order Status Update Email
- **Sent when:** Admin changes order status
- **Contains:** Status change notification, estimated delivery
- **Triggers:** [app/api/admin/orders/[id]/route.ts](app/api/admin/orders/[id]/route.ts)

---

## 🔄 Switching Back to Resend (Optional)

If you want to switch back to Resend in the future:

1. Sign up at [https://resend.com](https://resend.com)
2. Get your API key
3. Update [lib/email.ts](lib/email.ts) to use Resend API
4. Update `.env` with Resend credentials

---

## 💡 Tips for Production

### Before Going Live

1. **Test thoroughly:**
   - Send test orders to different email providers (Gmail, Outlook, Yahoo)
   - Check emails render correctly on mobile
   - Verify all links work
   - Test all order statuses

2. **Monitor sending:**
   - Keep track of daily email count
   - Watch for bounce/spam reports
   - Set up email forwarding to check quality

3. **Consider Google Workspace:**
   - More professional (you@yourdomain.com)
   - Higher sending limits
   - Better deliverability
   - Costs $6/user/month

4. **Or use a dedicated email service:**
   - SendGrid, Mailgun, Postmark, Amazon SES
   - Built for transactional emails
   - Better analytics and tracking
   - Higher deliverability rates

---

## 📚 Additional Resources

### Google Account Help
- [About App Passwords](https://support.google.com/accounts/answer/185833)
- [2-Step Verification](https://support.google.com/accounts/answer/185839)
- [Gmail Sending Limits](https://support.google.com/mail/answer/22839)

### Nodemailer Documentation
- [Nodemailer Docs](https://nodemailer.com/)
- [Gmail Setup](https://nodemailer.com/usage/using-gmail/)
- [SMTP Transport](https://nodemailer.com/smtp/)

### Email Best Practices
- [Email Marketing Best Practices](https://sendgrid.com/blog/email-marketing-best-practices/)
- [Avoiding Spam Filters](https://www.mailgun.com/blog/email/avoiding-spam-filters/)

---

## ✨ Summary

You now have:
- ✅ Gmail SMTP integration for sending emails
- ✅ Working order confirmation emails
- ✅ Automatic status update notifications
- ✅ Professional email templates
- ✅ Secure App Password setup

**Next Steps:**
1. Generate your Gmail App Password (see Step 2 above)
2. Add it to your `.env` file
3. Restart your development server: `npm run dev`
4. Place a test order to verify emails are working
5. Check your inbox for the confirmation email!

---

**Questions?** Check the Troubleshooting section above or refer to Google's [App Password documentation](https://support.google.com/accounts/answer/185833).

**Last Updated:** November 28, 2025
**Status:** ✅ Ready to Use
