# Email Notifications Setup Guide (Gmail)

## Overview

The e-commerce platform now includes automated email notifications using **Gmail SMTP** (completely free!):
- ✅ Order confirmations (sent when customer places order)
- ✅ Order status updates (sent when admin changes order status)

Emails are sent using **Nodemailer** with Gmail's SMTP server - no paid service required!

---

## 🚀 Quick Setup (10 minutes)

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on **2-Step Verification**
3. Follow the prompts to enable it (if not already enabled)

### Step 2: Generate App Password

1. Still in Google Account Security, search for **App passwords**
2. Or go directly to: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Click **Select app** → Choose "Mail"
4. Click **Select device** → Choose "Other (Custom name)"
5. Enter name: `Mens Fashion Store`
6. Click **Generate**
7. Copy the 16-character app password (format: `xxxx xxxx xxxx xxxx`)

**Important:** Save this password - you won't see it again!

### Step 3: Configure Environment Variables

1. Open `mens-fashion-store/.env.local`
2. Add these lines:

```bash
# Email Configuration (Gmail SMTP)
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=your.email@gmail.com
```

**Replace:**
- `your.email@gmail.com` - Your actual Gmail address
- `xxxx xxxx xxxx xxxx` - The 16-character app password from Step 2

### Step 4: Install Dependencies (Already Done!)

The required packages are already installed:
- ✅ `nodemailer` - SMTP email client
- ✅ `@types/nodemailer` - TypeScript types

### Step 5: Test It!

1. Start your dev server:
   ```bash
   cd mens-fashion-store
   npm run dev
   ```

2. Place a test order on your site

3. Check the console for:
   ```
   ✅ "Order confirmation email sent successfully"
   ✅ "Email sent successfully: <message-id>"
   ```

4. Check your email inbox for the confirmation!

---

## 📧 How It Works

### Technical Flow

```
Customer Places Order
    ↓
POST /api/orders
    ↓
Order Saved to Database
    ↓
Nodemailer connects to Gmail SMTP
    ↓
Email sent from your Gmail
    ↓
Customer receives email
```

### Gmail SMTP Details

- **Host:** `smtp.gmail.com`
- **Port:** 465 (SSL) or 587 (TLS)
- **Authentication:** App Password (not your regular Gmail password)
- **Daily Limit:** 500 emails per day (free tier)
- **Cost:** FREE!

---

## 🎨 Email Examples

### 1. Order Confirmation Email

**When:** Customer completes checkout
**Subject:** `Order Confirmation - ORD-20251128-00001`

**Contains:**
- Beautiful gradient header
- Order number prominently displayed
- Product items table with images
- Shipping address
- Order summary (subtotal, shipping, total)
- Payment method
- Estimated delivery date
- Support contact information

### 2. Order Status Update Email

**When:** Admin changes order status
**Subject:** `Order Shipped - ORD-20251128-00001`

**Contains:**
- Status-based colored header
- Old status → New status visualization
- Status-specific message
- Estimated delivery (if shipped)
- Continue shopping button

**Status Colors:**
- 🟡 Pending (Yellow)
- 🔵 Processing (Blue)
- 🟣 Shipped (Purple)
- 🟢 Delivered (Green)
- 🔴 Cancelled (Red)

---

## 💰 Cost & Limits

### Gmail Free Tier

**Completely FREE with limits:**
- ✅ 500 emails per day
- ✅ Unlimited recipients per email
- ✅ No monthly costs
- ✅ Professional delivery

**Good for:**
- Up to 250 orders per day (2 emails per order)
- Small to medium stores
- Development and testing

**When to upgrade:**
- If you exceed 250 orders/day
- Consider professional email services:
  - SendGrid (3,000 free emails/month)
  - Mailgun (5,000 free emails/month)
  - AWS SES ($0.10 per 1,000 emails)

---

## 🔐 Security Best Practices

### ✅ DO:

1. **Use App Passwords** (Never your regular Gmail password)
2. **Enable 2FA** on your Gmail account
3. **Store credentials in .env.local** (never commit to Git)
4. **Use a dedicated email** for the store (e.g., `orders@` or `notifications@`)
5. **Keep .env.local in .gitignore**

### ❌ DON'T:

1. **Don't use your personal Gmail password**
2. **Don't commit credentials to Git**
3. **Don't share app passwords**
4. **Don't disable 2FA**
5. **Don't use the same app password for multiple apps**

---

## 🐛 Troubleshooting

### Issue 1: "Email service not configured"

**Check:**
```bash
# Verify environment variables are set
cat mens-fashion-store/.env.local | grep GMAIL
```

**Solution:**
Ensure both `GMAIL_USER` and `GMAIL_APP_PASSWORD` are in `.env.local`

---

### Issue 2: "Invalid login" or "Authentication failed"

**Causes:**
- Using regular Gmail password instead of app password
- 2FA not enabled on Gmail account
- App password typed incorrectly

**Solution:**
1. Enable 2FA on Gmail
2. Generate new app password
3. Copy it exactly (including spaces or without - both work)
4. Update `.env.local`

---

### Issue 3: Email not sending

**Check console logs:**
```
✅ Look for: "Email sent successfully"
❌ Look for: Error messages
```

**Check Gmail:**
1. Go to [Gmail Sent folder](https://mail.google.com/mail/u/0/#sent)
2. Check if email was sent from your account

**Common fixes:**
```bash
# 1. Restart dev server
npm run dev

# 2. Check environment variables are loaded
console.log(process.env.GMAIL_USER)

# 3. Test with simple Nodemailer script
```

---

### Issue 4: "Daily sending quota exceeded"

**Cause:** Sent more than 500 emails in 24 hours

**Solutions:**
1. Wait 24 hours for quota reset
2. Use multiple Gmail accounts (not recommended)
3. Upgrade to professional email service
4. Use Google Workspace (2,000 emails/day per user)

---

### Issue 5: Emails going to spam

**Solutions:**
1. **Ask recipients to whitelist your email**
2. **Use a custom domain** (instead of @gmail.com):
   - Set up Google Workspace
   - Use your own domain (orders@yourstore.com)
3. **Avoid spam trigger words**:
   - "Free", "Click here", "Limited time"
4. **Test with [Mail Tester](https://www.mail-tester.com/)**:
   - Send test email to their address
   - Get spam score and recommendations

---

## ✅ Testing Checklist

### Development Testing

- [ ] Environment variables configured
- [ ] Dev server running
- [ ] Place test order
- [ ] Check console logs for success message
- [ ] Check email inbox for confirmation
- [ ] Verify all order details correct
- [ ] Test status update email
- [ ] Change order status in admin panel
- [ ] Verify status update email received

### Email Content Testing

- [ ] Order number displays correctly
- [ ] Product images load
- [ ] Prices formatted correctly (₹)
- [ ] Shipping address complete
- [ ] Links work (if any)
- [ ] Mobile responsive (check on phone)
- [ ] Renders in Gmail
- [ ] Renders in Outlook
- [ ] Renders in Apple Mail

---

## 🎯 Production Deployment

### Pre-Production Checklist

1. **Create dedicated Gmail account**
   ```
   Example: orders@yourstore-notifications.gmail.com
   OR use Google Workspace with your domain
   ```

2. **Enable 2FA and create app password**

3. **Update production environment variables**
   ```bash
   # In your hosting platform (Vercel, Railway, etc.)
   GMAIL_USER=orders@yourstore.com
   GMAIL_APP_PASSWORD=your_app_password
   EMAIL_FROM=orders@yourstore.com
   ```

4. **Test in production**
   - Place test order
   - Monitor email delivery
   - Check spam folders
   - Verify all recipients receive emails

5. **Monitor usage**
   - Track daily email count
   - Stay under 500/day limit
   - Set up alerts if approaching limit

---

## 📊 Monitoring

### Daily Checks

1. **Gmail Sent Folder**
   - Verify emails are sending
   - Check for any bounces

2. **Application Logs**
   ```
   Look for:
   ✅ "Email sent successfully: <message-id>"
   ❌ "Error sending email: ..."
   ```

3. **Customer Reports**
   - Ask if emails are received
   - Check spam folder issues

### Weekly Reviews

1. **Email Count** - Are you approaching 500/day?
2. **Delivery Rate** - Are all emails delivering?
3. **Bounce Rate** - Any invalid email addresses?
4. **Customer Feedback** - Any issues reported?

---

## 🚀 Advanced Configuration

### Using Google Workspace (for custom domain)

**Benefits:**
- Use your own domain (orders@yourstore.com)
- 2,000 emails/day per user
- Better deliverability
- Professional appearance

**Cost:** $6/user/month

**Setup:**
1. Sign up for Google Workspace
2. Verify your domain
3. Create email account (e.g., orders@yourstore.com)
4. Generate app password
5. Update environment variables

---

### Alternative Email Services

If Gmail limits are too restrictive:

| Service | Free Tier | Cost | Best For |
|---------|-----------|------|----------|
| **Gmail** | 500/day | Free | Small stores |
| **SendGrid** | 100/day | Free then $20/mo | Medium stores |
| **Mailgun** | 5,000/month | Free then $35/mo | Growing stores |
| **AWS SES** | 62,000/month | $0.10/1000 | Large volume |
| **Resend** | 3,000/month | Free then $20/mo | Developers |

---

## 📋 Environment Variables Reference

```bash
# Email Configuration
GMAIL_USER=your.email@gmail.com          # Your Gmail address
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   # 16-char app password
EMAIL_FROM=your.email@gmail.com          # "From" address (usually same as GMAIL_USER)

# Optional: App URL for links in emails
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎨 Customizing Email Templates

Email templates are in `lib/email.ts`. You can customize:

### Colors

```typescript
// Find and replace these hex codes:
#667eea  // Primary purple
#764ba2  // Secondary purple
#10b981  // Success green
#f59e0b  // Warning yellow
#ef4444  // Error red
```

### Content

```typescript
// In generateOrderConfirmationEmail():
- Header text: "Order Confirmed!"
- Greeting: "Hi ${customerName}"
- Messages: "Your order has been confirmed..."

// In generateOrderStatusEmail():
- Status messages
- Estimated delivery text
- Button text
```

### Layout

```html
<!-- Email uses HTML table layout for compatibility -->
<table width="600" ...>  <!-- Change width -->
  <tr>
    <td style="padding: 32px">  <!-- Adjust padding -->
      <!-- Content here -->
    </td>
  </tr>
</table>
```

---

## 🎓 Example: Complete Setup

Let's do a complete setup from scratch:

### 1. Enable Gmail App Password

```
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if not enabled)
3. Go to https://myaccount.google.com/apppasswords
4. Create app password for "Mail" → "Other (Custom name)"
5. Name it: "Mens Fashion Store"
6. Copy password: "abcd efgh ijkl mnop"
```

### 2. Configure Environment

```bash
# Open mens-fashion-store/.env.local
# Add:
GMAIL_USER=mystore@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=mystore@gmail.com
```

### 3. Start Server

```bash
cd mens-fashion-store
npm run dev
```

### 4. Test

```bash
# 1. Go to http://localhost:3000
# 2. Add products to cart
# 3. Go through checkout
# 4. Place order
# 5. Check console:
✅ "Order confirmation email sent successfully"
# 6. Check email inbox
```

### 5. Verify

```bash
# Check:
1. Email received?
2. Order details correct?
3. Images loading?
4. Links working?
```

**Done! 🎉**

---

## 📞 Support Resources

### Gmail Help

- [App Passwords Help](https://support.google.com/accounts/answer/185833)
- [2-Step Verification](https://support.google.com/accounts/answer/185839)
- [Gmail SMTP Settings](https://support.google.com/a/answer/176600)

### Nodemailer Documentation

- [Nodemailer Docs](https://nodemailer.com/about/)
- [Gmail Setup](https://nodemailer.com/usage/using-gmail/)
- [Troubleshooting](https://nodemailer.com/usage/troubleshooting/)

### Testing Tools

- [Mail Tester](https://www.mail-tester.com/) - Test spam score
- [Litmus](https://www.litmus.com/) - Test email rendering
- [Email on Acid](https://www.emailonacid.com/) - Email testing

---

## ✨ Summary

You now have:
- ✅ Free email notifications via Gmail
- ✅ Professional order confirmation emails
- ✅ Automated status update emails
- ✅ Beautiful, responsive templates
- ✅ No monthly costs (Gmail is free!)

**Next Steps:**
1. ✅ Enable 2FA on Gmail
2. ✅ Generate app password
3. ✅ Add to .env.local
4. ✅ Test with an order
5. ✅ Enjoy automatic emails!

---

**Questions?** Check the troubleshooting section above!

**Last Updated:** November 28, 2025
**Version:** 2.0 (Gmail SMTP)
**Status:** ✅ Production Ready
**Cost:** FREE! 🎉
