# 🚀 Quick Start Guide

## Immediate Next Steps

### 1. Configure Environment Variables

Edit `.env` and add your API keys:

```bash
OPENAI_API_KEY=sk-...                    # Get from https://platform.openai.com/api-keys
EMAIL_SERVICE_API_KEY=...                # Get from your email provider
EMAIL_FROM=subscriptions@yourdomain.com  # Your sender email
APP_URL=https://your-app-url.com         # Your app URL after deployment
CRON_SECRET=generate_random_secret_123   # Random string for security
```

### 2. Set Up Email Service

Choose an email provider and integrate in `/app/services/email.server.ts`:

**SendGrid** (Recommended for beginners)
- Sign up: https://sendgrid.com/
- Get API key
- Code example already in the file (commented out)

### 3. Deploy Your App

```bash
# Install Shopify CLI if not installed
npm install -g @shopify/cli

# Deploy to your hosting platform
npm run deploy

# Or use Vercel/Railway/Fly.io
```

### 4. Test the Flow

1. **Create a test order** in your Shopify store
2. **Visit** `/questionnaire/[ORDER_ID]` to fill the questionnaire
3. **Check** Shopify order notes - should show questionnaire data
4. **Mark order as fulfilled** in Shopify
5. **Wait** or manually trigger `/api/jobs/send-feedback`
6. **Visit** `/feedback/[QUESTIONNAIRE_ID]` to test feedback form
7. **Generate AI recommendations** from the admin dashboard

### 5. Set Up Cron Job

Use **EasyCron** or **Cron-job.org**:

- URL: `https://your-app-url.com/api/jobs/send-feedback`
- Method: POST
- Schedule: Every hour (`0 * * * *`)
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

## Key URLs

- **Admin Dashboard**: `/app`
- **Subscriptions**: `/app/subscriptions`
- **Questionnaire** (share with customers): `/questionnaire/[ORDER_ID]`
- **Feedback** (sent via email): `/feedback/[QUESTIONNAIRE_ID]`
- **Manual Cron Trigger**: `/api/jobs/send-feedback`

## File Structure

```
app/
├── components/              # React components
│   ├── SubscriptionQuestionnaire.tsx
│   └── FeedbackQuestionnaire.tsx
├── services/               # Business logic
│   ├── openai.server.ts    # AI recommendations
│   ├── email.server.ts     # Email sending
│   └── shopify.server.ts   # Shopify API
├── jobs/                   # Background tasks
│   └── sendFeedbackEmails.server.ts
└── routes/                 # All app routes
    ├── app._index.tsx      # Dashboard home
    ├── app.subscriptions.tsx
    ├── app.recommendations.$id.tsx
    ├── questionnaire.$orderId.tsx
    ├── feedback.$questionnaireId.tsx
    └── webhooks/
```

## Troubleshooting

**Questionnaire not saving?**
- Check console for errors
- Verify Shopify API permissions
- Test with `console.log()` in the API route

**Emails not sending?**
- Check email service API key
- Verify cron job is running
- Look at logs in `/api/jobs/send-feedback`

**AI recommendations failing?**
- Verify OpenAI API key
- Check API usage/billing
- Review error logs

**Webhooks not working?**
- Verify webhook URLs in Shopify settings
- Check app scopes are granted
- Test with Shopify CLI

## Customer Workflow

1. Customer orders subscription box
2. You send them the questionnaire link
3. They fill out dog info and preferences
4. You fulfill the order in Shopify
5. App tracks fulfillment, schedules email
6. After 7 days, customer gets feedback email
7. They rate products and leave comments
8. You use AI to generate next month's recommendations
9. Repeat!

## Tips

- **Test with fake data first** before going live
- **Review AI recommendations** - they're suggestions, not rules
- **Monitor feedback patterns** to improve product selection
- **Keep inventory updated** for better AI matching
- **Personalize emails** with your brand voice

## Getting Help

1. Read `DOG_SUBSCRIPTION_APP.md` for detailed documentation
2. Check code comments in each file
3. Review Shopify and OpenAI documentation
4. Test each feature individually

---

Need more details? See `DOG_SUBSCRIPTION_APP.md` for complete documentation.
