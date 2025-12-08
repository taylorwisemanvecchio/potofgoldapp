import { json, type ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { topic, shop, session, payload } = await authenticate.webhook(
      request
    );

    if (!payload) {
      throw new Response("No payload", { status: 400 });
    }

    console.log("📦 Fulfillment created webhook received:", {
      fulfillmentId: payload.id,
      orderId: payload.order_id,
      status: payload.status,
    });

    const fulfillmentId = payload.id.toString();
    const orderId = payload.order_id.toString();

    // Extract products from the fulfillment
    const products = payload.line_items?.map((item: any) => ({
      id: item.product_id?.toString(),
      title: item.name,
      quantity: item.quantity,
      variantId: item.variant_id,
    })) || [];

    // Calculate feedback send date (7 days after fulfillment)
    const feedbackScheduledFor = new Date();
    feedbackScheduledFor.setDate(feedbackScheduledFor.getDate() + 7);

    // Save fulfillment tracking
    const tracking = await prisma.fulfillmentTracking.create({
      data: {
        shopifyFulfillmentId: fulfillmentId,
        orderId: orderId,
        status: "fulfilled",
        fulfilledAt: new Date(),
        feedbackScheduledFor,
        products: JSON.stringify(products),
      },
    });

    console.log("✅ Fulfillment tracking created:", {
      id: tracking.id,
      feedbackScheduledFor: tracking.feedbackScheduledFor,
    });

    // Note: The actual email sending will be handled by a cron job
    // that checks for fulfillments where feedbackScheduledFor <= now

    return json({ success: true, trackingId: tracking.id });
  } catch (error) {
    console.error("Error processing fulfillment webhook:", error);
    return json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
