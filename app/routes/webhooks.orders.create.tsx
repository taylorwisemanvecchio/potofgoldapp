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

    console.log("📦 Order created webhook received:", {
      orderId: payload.id,
      orderNumber: payload.order_number,
      email: payload.email,
    });

    // Store order information for later processing
    // When questionnaire is submitted, we'll link it to this order

    return json({ success: true });
  } catch (error) {
    console.error("Error processing order webhook:", error);
    return json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
