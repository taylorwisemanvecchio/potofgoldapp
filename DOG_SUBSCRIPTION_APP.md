# 🐕 Golden Retriever Toy Subscription Box App

A complete Shopify app for managing a dog toy subscription box business with AI-powered product recommendations.

## Features

### ✨ Core Features

1. **Customer Questionnaire** - Collects detailed information about each dog:
   - Dog's name, gender, size, breed
   - Birthday or adoption day
   - Toy preferences (plush, durable, mix)
   - Allergies (chicken, turkey, beef, none)
   - Email and subscription plan

2. **Automatic Order Integration** - Questionnaire data is automatically added to Shopify order notes

3. **Post-Delivery Feedback** - 1 week after box delivery:
   - Customers receive an email with photos of each item
   - Can rate products on a 1-5 scale
   - Leave comments about what their dog liked/disliked

4. **AI Product Recommendations** - Uses OpenAI to:
   - Analyze dog preferences and size
   - Review previous feedback history
   - Match with available inventory
   - Generate personalized product selections with reasoning

5. **Admin Dashboard** - Manage all subscriptions:
   - View all questionnaires
   - See feedback history
   - Generate AI recommendations
   - Track fulfillment status

## Setup Instructions

### 1. Install Dependencies

All dependencies have been installed. Key packages include:
- `openai` - For AI-powered recommendations
- `@shopify/polaris` - UI components
- `@prisma/client` - Database ORM
- `node-cron` - For scheduled tasks

### 2. Configure Environment Variables

Update the `.env` file with your credentials:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (use SendGrid, Mailgun, or SMTP)
EMAIL_SERVICE_API_KEY=your_email_service_api_key_here
EMAIL_FROM=subscriptions@yourdomain.com

# App Configuration
APP_URL=https://your-app-url.com

# Cron Job Security (generate a random secret)
CRON_SECRET=your_random_secret_here
```

### 3. Database Migration

The database has been set up with the following tables:
- `SubscriptionQuestionnaire` - Customer questionnaire data
- `ProductFeedback` - Customer feedback on products
- `AIRecommendation` - AI-generated product recommendations
- `FulfillmentTracking` - Track deliveries and email scheduling

### 4. Configure Email Service

Edit `/app/services/email.server.ts` to integrate your email service:

**Recommended Services:**
- [SendGrid](https://sendgrid.com/) - Easy to set up, free tier available
- [Mailgun](https://www.mailgun.com/) - Reliable, developer-friendly
- [AWS SES](https://aws.amazon.com/ses/) - Cost-effective for high volume
- [Postmark](https://postmarkapp.com/) - Great deliverability

Example SendGrid integration:
```typescript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: customerEmail }],
      subject: `How did ${dogName} like their box?`,
    }],
    from: { email: process.env.EMAIL_FROM },
    content: [{
      type: 'text/html',
      value: buildFeedbackEmailHtml(dogName, feedbackUrl, products),
    }],
  }),
});
```

### 5. Set Up Automated Feedback Emails

The app includes a background job that sends feedback emails 7 days after delivery.

**Option A: External Cron Service (Recommended)**

Use a service like [EasyCron](https://www.easycron.com/) or [Cron-job.org](https://cron-job.org/):

1. Create a cron job that calls: `POST https://your-app-url.com/api/jobs/send-feedback`
2. Set frequency: Every 1 hour
3. Add header: `Authorization: Bearer YOUR_CRON_SECRET`

**Option B: Vercel Cron (if deploying to Vercel)**

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/jobs/send-feedback",
    "schedule": "0 * * * *"
  }]
}
```

## How It Works

### Workflow

1. **Customer Places Order**
   - Order webhook fires → stored in database

2. **Customer Fills Questionnaire**
   - Visits `/questionnaire/[ORDER_ID]`
   - Fills out dog information and preferences
   - Data saved to database
   - Automatically added to order notes in Shopify

3. **Order is Fulfilled**
   - Fulfillment webhook fires
   - System schedules feedback email for 7 days later

4. **Feedback Email Sent**
   - Cron job runs hourly
   - Finds fulfillments ready for feedback
   - Sends email with product photos
   - Customer visits `/feedback/[QUESTIONNAIRE_ID]`

5. **Customer Provides Feedback**
   - Rates each product 1-5 stars
   - Adds comments
   - Feedback saved to database

6. **AI Generates Recommendations**
   - Admin visits subscription in dashboard
   - Clicks "Generate AI Recommendations"
   - OpenAI analyzes preferences + feedback + inventory
   - Returns 3-5 personalized product recommendations with reasoning

## App Routes

### Admin Routes (Shopify Embedded)

- `/app` - Dashboard home
- `/app/subscriptions` - View all subscriptions
- `/app/recommendations/:id` - Generate AI recommendations for a subscription

### Public Routes (Customer-Facing)

- `/questionnaire/:orderId` - Initial questionnaire form
- `/feedback/:questionnaireId` - Post-delivery feedback form

### API Routes

- `POST /api/questionnaire/submit` - Submit questionnaire data
- `POST /api/feedback/submit` - Submit product feedback
- `POST /api/jobs/send-feedback` - Trigger feedback email job (cron)

### Webhook Routes

- `POST /webhooks/orders/create` - Order creation webhook
- `POST /webhooks/fulfillments/create` - Fulfillment webhook

## Database Schema

### SubscriptionQuestionnaire
- Dog information (name, gender, size, breed)
- Special dates (birthday, adoption day)
- Preferences (toy type, allergies)
- Contact (email)
- Subscription plan

### ProductFeedback
- Links to questionnaire
- Product details
- Rating (1-5)
- Comments
- Timestamps

### AIRecommendation
- Links to questionnaire
- Month/year for tracking
- Recommended products (JSON)
- Full OpenAI response

### FulfillmentTracking
- Shopify fulfillment ID
- Order ID
- Status tracking
- Scheduled email date
- Products (JSON)

## Using the App

### For Store Admins

1. **View Subscriptions**
   - Navigate to "View Subscriptions" from the home page
   - See all questionnaires, feedback, and customer info

2. **Generate AI Recommendations**
   - Click on any subscription
   - Click "Generate AI Recommendations"
   - Review the AI's product suggestions with reasoning
   - Use these to curate the next month's box

3. **Monitor Feedback**
   - Track customer satisfaction
   - Identify popular and unpopular products
   - Use insights to improve curation

### For Customers

1. **Fill Initial Questionnaire**
   - Share the questionnaire link after order placement
   - Takes 2-3 minutes to complete
   - Helps personalize their box

2. **Provide Feedback**
   - Receive email 1 week after delivery
   - Click link to feedback form
   - Rate and comment on each product
   - Helps improve future boxes

## AI Recommendation System

The AI system uses OpenAI's GPT-4 to analyze:

1. **Dog Profile**
   - Size (small/medium/large) - affects toy durability needs
   - Breed - some breeds have specific play styles
   - Toy preference - customer's stated preference

2. **Feedback History**
   - Previous product ratings
   - Customer comments
   - Patterns in likes/dislikes

3. **Available Inventory**
   - Product titles and descriptions
   - Product types and tags
   - Current stock

4. **Allergies**
   - Filters out products with allergens
   - Ensures safe recommendations

The AI returns:
- 3-5 recommended products
- Reasoning for each recommendation
- Confidence score (0-1)

Example output:
```json
{
  "productId": "gid://shopify/Product/123",
  "productTitle": "Super Tough Rope Toy",
  "reasoning": "Given Max's large size and preference for durable toys, plus positive feedback on similar rope toys, this would be an excellent choice.",
  "confidence": 0.92
}
```

## Customization

### Email Templates

Edit `/app/services/email.server.ts` to customize:
- Email styling
- Subject lines
- Content and messaging

### Questionnaire Fields

Edit `/app/components/SubscriptionQuestionnaire.tsx` to:
- Add new questions
- Change field options
- Modify validation

### Feedback Form

Edit `/app/components/FeedbackQuestionnaire.tsx` to:
- Change rating scale
- Add custom questions
- Modify layout

### AI Prompt

Edit `/app/services/openai.server.ts` to:
- Adjust recommendation criteria
- Change number of recommendations
- Modify AI instructions

## Development

### Running Locally

```bash
npm run dev
```

### Database Changes

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

### Testing Webhooks

Use Shopify CLI to test webhooks:

```bash
shopify app dev
```

## Deployment

1. **Set Environment Variables** in your hosting platform

2. **Deploy the App** (Vercel, Railway, Fly.io, etc.)

3. **Configure Webhooks** in Shopify Partner Dashboard

4. **Set Up Cron Job** for automated emails

5. **Test the Flow**:
   - Create test order
   - Fill questionnaire
   - Mark as fulfilled
   - Verify email scheduling
   - Test feedback form
   - Generate AI recommendations

## Support

For issues or questions:
1. Check the code comments in each file
2. Review Shopify app documentation
3. Check OpenAI API documentation
4. Test with sample data first

## Future Enhancements

Potential additions:
- SMS notifications option
- Customer portal for subscription management
- Analytics dashboard
- A/B testing for product selections
- Gift subscriptions
- Referral program
- Multi-pet households support

## License

MIT License - Feel free to customize for your business!
