import { json, type ActionFunctionArgs } from "react-router";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.json();
    const { questionnaireId, feedback } = formData;

    if (!questionnaireId || !feedback || !Array.isArray(feedback)) {
      return json({ error: "Invalid request data" }, { status: 400 });
    }

    // Verify questionnaire exists
    const questionnaire = await prisma.subscriptionQuestionnaire.findUnique({
      where: { id: questionnaireId },
    });

    if (!questionnaire) {
      return json({ error: "Questionnaire not found" }, { status: 404 });
    }

    // Save feedback for each product
    const savedFeedback = await Promise.all(
      feedback.map((item: any) => {
        return prisma.productFeedback.create({
          data: {
            questionnaireId,
            fulfillmentId: item.fulfillmentId || "unknown",
            productId: item.productId,
            productTitle: item.productTitle || "Unknown Product",
            productImageUrl: item.productImageUrl,
            rating: item.rating,
            comments: item.comments || "",
            respondedAt: new Date(),
          },
        });
      })
    );

    return json({
      success: true,
      feedbackCount: savedFeedback.length,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
