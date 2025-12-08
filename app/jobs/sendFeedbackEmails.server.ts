import { PrismaClient } from "@prisma/client";
import { sendFeedbackEmail } from "../services/email.server";

const prisma = new PrismaClient();

/**
 * Background job to send feedback questionnaires
 * This should be run periodically (e.g., every hour via cron)
 */
export async function sendScheduledFeedbackEmails() {
  console.log("🔄 Running feedback email job...");

  try {
    const now = new Date();

    // Find all fulfillments that need feedback emails sent
    const pendingFulfillments = await prisma.fulfillmentTracking.findMany({
      where: {
        status: "fulfilled",
        feedbackScheduledFor: {
          lte: now,
        },
        feedbackSentAt: null,
      },
    });

    console.log(
      `Found ${pendingFulfillments.length} fulfillments needing feedback emails`
    );

    for (const fulfillment of pendingFulfillments) {
      try {
        // Find the questionnaire for this order
        const questionnaire =
          await prisma.subscriptionQuestionnaire.findUnique({
            where: {
              orderId: fulfillment.orderId,
            },
          });

        if (!questionnaire) {
          console.log(
            `⚠️  No questionnaire found for order ${fulfillment.orderId}`
          );
          continue;
        }

        // Parse products from fulfillment
        const products = JSON.parse(fulfillment.products);

        // Build feedback URL (customers will access this to provide feedback)
        const feedbackUrl = `${process.env.APP_URL}/feedback/${questionnaire.id}`;

        // Send the feedback email
        const sent = await sendFeedbackEmail({
          customerEmail: questionnaire.email,
          dogName: questionnaire.dogName,
          feedbackUrl,
          products: products.map((p: any) => ({
            id: p.id,
            title: p.title,
            imageUrl: p.imageUrl,
          })),
        });

        if (sent) {
          // Update the fulfillment tracking
          await prisma.fulfillmentTracking.update({
            where: { id: fulfillment.id },
            data: {
              status: "feedback_sent",
              feedbackSentAt: now,
            },
          });

          // Create feedback records for each product
          await Promise.all(
            products.map((product: any) =>
              prisma.productFeedback.create({
                data: {
                  questionnaireId: questionnaire.id,
                  fulfillmentId: fulfillment.shopifyFulfillmentId,
                  productId: product.id || "unknown",
                  productTitle: product.title,
                  productImageUrl: product.imageUrl,
                  emailSentAt: now,
                },
              })
            )
          );

          console.log(
            `✅ Sent feedback email to ${questionnaire.email} for ${questionnaire.dogName}`
          );
        }
      } catch (error) {
        console.error(
          `Error processing fulfillment ${fulfillment.id}:`,
          error
        );
        // Continue with next fulfillment
      }
    }

    console.log("✅ Feedback email job completed");
    return {
      success: true,
      processed: pendingFulfillments.length,
    };
  } catch (error) {
    console.error("Error in feedback email job:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
