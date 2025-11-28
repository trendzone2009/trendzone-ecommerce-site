# Email Notifications Setup Guide

## Overview

The e-commerce platform now includes automated email notifications for:
- ✅ Order confirmations (sent when customer places order)
- ✅ Order status updates (sent when admin changes order status)

Emails are sent using **Resend** - a modern, developer-friendly email API.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key

1. Log in to Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Copy the API key (starts with `re_`)

### Step 3: Configure Environment Variables

1. Open `mens-fashion-store/.env.local`
2. Add these lines:

```bash
# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=orders@yourdomain.com
```

**Important:**
- Replace `re_your_api_key_here` with your actual Resend API key
- Replace `orders@yourdomain.com` with your actual email address

### Step 4: Verify Domain (For Production)

**Development/Testing:**
- Use any email address (Resend will send to verified addresses only)
- Add your test email to "Verified Recipients" in Resend dashboard

**Production:**
1. Go to Resend dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `mensfashion.com`)
4. Add the DNS records shown by Resend to your domain
5. Wait for verification (usually 1-5 minutes)
6. Now you can send from `orders@mensfashion.com`

---

## 📧 Email Types

### 1. Order Confirmation Email

**Sent when:** Customer completes checkout

**Triggers:** `/api/orders` POST endpoint

**Contains:**
- Order number
- Order items (with images)
- Shipping address
- Order summary (subtotal, shipping, total)
- Payment method
- Estimated delivery date

**Example:**
```
Subject: Order Confirmation - ORD-20251128-00001

Hi John Doe,

Your order has been confirmed and will be shipped soon.

Order Number: ORD-20251128-00001

[Product items table with images, sizes, quantities, prices]

Shipping Address:
John Doe
123 Main Street
Mumbai, Maharashtra 400001

Total: ₹2,500

Payment Method: Cash on Delivery

What's Next?
We're processing your order and will send you a shipping confirmation
email once it's on the way. Estimated delivery: 3-5 business days.
```

### 2. Order Status Update Email

**Sent when:** Admin updates order status

**Triggers:** `/api/admin/orders/[id]` PATCH endpoint

**Contains:**
- Order number
- Status change (old → new)
- Estimated delivery (if shipped)
- Status-specific message

**Status-specific colors and messages:**
- **Pending** (Yellow) - "We have received your order and will start processing it soon."
- **Processing** (Blue) - "Your order is being prepared for shipment."
- **Shipped** (Purple) - "Your order is on its way! You should receive it soon."
- **Delivered** (Green) - "Your order has been delivered. We hope you enjoy your purchase!"
- **Cancelled** (Red) - "Your order has been cancelled. If you have any questions, please contact us."

---

## 🎨 Email Templates

### Design Features

- Modern, professional design
- Responsive (mobile-friendly)
- Beautiful gradient header
- Product images included
- Status-based color coding
- Clear call-to-action buttons
- Footer with support contact

### Customization

To customize email templates, edit:
```
mens-fashion-store/lib/email.ts
```

**Available functions:**
- `generateOrderConfirmationEmail(data)` - Creates HTML for order confirmation
- `generateOrderStatusEmail(data)` - Creates HTML for status update
- `sendEmail({ to, subject, html })` - Sends email via Resend API

---

## 🔧 Technical Implementation

### Files Created/Modified

**New Files:**
1. `lib/email.ts` - Email service and templates (~550 lines)

**Modified Files:**
1. `app/api/orders/route.ts` - Added email sending after order creation
2. `app/api/admin/orders/[id]/route.ts` - Added PATCH endpoint and email sending
3. `app/admin/orders/[id]/page.tsx` - Updated to use new PATCH endpoint

### Code Flow

#### Order Confirmation:
```
Customer Checkout
    ↓
POST /api/orders
    ↓
Create Order in Database
    ↓
Send Confirmation Email (async, non-blocking)
    ↓
Return Success Response
```

#### Status Update:
```
Admin Changes Status
    ↓
PATCH /api/admin/orders/[id]
    ↓
Update Order in Database
    ↓
Send Status Update Email (async, non-blocking)
    ↓
Return Success Response
```

**Note:** Email failures don't cause order creation/update to fail.

---

## ✅ Testing

### Test Order Confirmation

1. Place a test order on your site
2. Check console logs for: `"Order confirmation email sent successfully"`
3. Check your email inbox
4. Verify all details are correct

### Test Status Update

1. Go to `/admin/orders`
2. Click on any order
3. Change status (e.g., "Pending" → "Processing")
4. Click "Update Status"
5. Check email for status update notification

### Development Testing

If you don't have a domain yet:

1. Add your email to "Verified Recipients" in Resend dashboard
2. Use that email when placing test orders
3. You'll receive all emails for testing

---

## 🚨 Troubleshooting

### Email not sending?

**Check 1: API Key**
```bash
# Verify RESEND_API_KEY is set
echo $RESEND_API_KEY  # On Mac/Linux
# or check .env.local file
```

**Check 2: Console Logs**
```
Look for:
✅ "Order confirmation email sent successfully"
✅ "Order status update email sent successfully"
❌ "Failed to send email: [error]"
```

**Check 3: Resend Dashboard**
- Go to [Resend Dashboard](https://resend.com/emails)
- Check "Emails" tab for send attempts
- Look for errors or bounces

### Common Errors

**Error: "API key not configured"**
```bash
# Solution: Add to .env.local
RESEND_API_KEY=re_your_actual_key
```

**Error: "Invalid recipient"**
```
# Solution (Development):
1. Go to Resend → Settings → Verified Recipients
2. Add your test email address
3. Verify it via email link
4. Try again

# Solution (Production):
1. Verify your domain in Resend
2. Update EMAIL_FROM to use your domain
```

**Error: "Rate limit exceeded"**
```
# Resend Free Tier Limits:
- 100 emails per day
- 3000 emails per month

# Solution:
- Upgrade Resend plan
- Or wait for limit reset
```

---

## 📊 Monitoring

### Check Email Delivery

1. Go to [Resend Dashboard](https://resend.com/emails)
2. View all sent emails
3. Check delivery status:
   - ✅ Delivered
   - ⏳ Processing
   - ❌ Bounced/Failed

### Email Analytics

Resend provides:
- Open rates (if enabled)
- Click tracking (if enabled)
- Bounce rates
- Delivery status

---

## 🎯 Best Practices

### 1. Error Handling

- Emails send asynchronously (won't block orders)
- Failures are logged but don't break checkout
- Always check console logs in development

### 2. Testing

- Test both confirmation and status update emails
- Test with multiple email providers (Gmail, Outlook, etc.)
- Check spam folders
- Verify mobile rendering

### 3. Production Checklist

- [ ] Domain verified in Resend
- [ ] DNS records configured
- [ ] EMAIL_FROM uses your domain
- [ ] RESEND_API_KEY is production key
- [ ] Test email delivery
- [ ] Monitor Resend dashboard

### 4. Customization

Want to customize emails?

**Edit templates in `lib/email.ts`:**
- Change colors (search for hex codes like `#667eea`)
- Update text content
- Add/remove sections
- Modify layout

**Example: Change brand colors**
```typescript
// Find this in generateOrderConfirmationEmail:
style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"

// Replace with your brand colors:
style="background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%)"
```

---

## 🔐 Security

### API Key Security

**✅ DO:**
- Store RESEND_API_KEY in `.env.local`
- Add `.env.local` to `.gitignore`
- Use different keys for development and production
- Rotate keys regularly

**❌ DON'T:**
- Commit API keys to Git
- Share API keys publicly
- Use production keys in development

### Email Content

- Don't include sensitive data (passwords, full card numbers)
- Use HTTPS links only
- Validate email addresses before sending

---

## 💰 Pricing

### Resend Pricing (as of 2024)

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for testing and small stores

**Pro Plan ($20/month):**
- 50,000 emails/month
- Unlimited daily sending
- Email analytics
- Priority support

**Business/Enterprise:**
- Custom volume
- Dedicated IP
- SLA guarantee

**Recommendation:**
- Start with Free tier
- Upgrade to Pro when you exceed 100 orders/day

---

## 📚 Additional Resources

### Resend Documentation
- [Resend Docs](https://resend.com/docs)
- [Node.js Integration](https://resend.com/docs/send-with-nodejs)
- [Email Best Practices](https://resend.com/docs/knowledge-base/email-best-practices)

### Email Testing Tools
- [Litmus](https://www.litmus.com/) - Test email rendering
- [Email on Acid](https://www.emailonacid.com/) - Email testing
- [MailTrap](https://mailtrap.io/) - Email sandbox for testing

### Alternative Email Services
- **SendGrid** - Enterprise option
- **Postmark** - Transactional emails
- **AWS SES** - Cheap, complex setup
- **Mailgun** - Developer-friendly

---

## 🎉 Summary

You now have:
- ✅ Professional order confirmation emails
- ✅ Automated status update notifications
- ✅ Beautiful, responsive email templates
- ✅ Production-ready email infrastructure

**Next Steps:**
1. Set up Resend account
2. Add API key to `.env.local`
3. Test with a sample order
4. Verify domain for production
5. Monitor Resend dashboard

---

**Questions?** Check the troubleshooting section or Resend's excellent documentation.

**Last Updated:** November 28, 2025
**Version:** 1.0
**Status:** ✅ Production Ready
