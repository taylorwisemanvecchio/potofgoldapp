import { json, type ActionFunctionArgs } from "react-router";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../shopify.server";
import {
  addOrderNote,
  formatQuestionnaireAsNote,
} from "../services/shopify.server";

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Authenticate the request
    await authenticate.admin(request);

    const formData = await request.json();

    const {
      orderId,
      dogName,
      dogGender,
      dogSize,
      breed,
      birthday,
      adoptionDay,
      toyPreference,
      allergies,
      email,
      subscriptionPlan,
    } = formData;

    // Validate required fields
    if (!orderId || !dogName || !breed || !email) {
      return json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save questionnaire to database
    const questionnaire = await prisma.subscriptionQuestionnaire.create({
      data: {
        orderId,
        dogName,
        dogGender,
        dogSize,
        breed,
        birthday: birthday ? new Date(birthday) : null,
        adoptionDay: adoptionDay ? new Date(adoptionDay) : null,
        toyPreference,
        allergies,
        email,
        subscriptionPlan,
      },
    });

    // Format as order note
    const noteText = formatQuestionnaireAsNote({
      dogName,
      dogGender,
      dogSize,
      breed,
      birthday: birthday ? new Date(birthday) : undefined,
      adoptionDay: adoptionDay ? new Date(adoptionDay) : undefined,
      toyPreference,
      allergies,
      subscriptionPlan,
    });

    // Add note to Shopify order
    // Note: We need to convert the orderId to the proper Shopify GID format
    const shopifyOrderId = orderId.startsWith("gid://")
      ? orderId
      : `gid://shopify/Order/${orderId}`;

    await addOrderNote(request, shopifyOrderId, noteText);

    return json({
      success: true,
      questionnaireId: questionnaire.id,
    });
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
    return json(
      { error: "Failed to submit questionnaire" },
      { status: 500 }
    );
  }
}
