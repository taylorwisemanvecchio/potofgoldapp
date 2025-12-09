import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, Form } from "react-router";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";
import { getProducts } from "../services/shopify.server";
import { getProductRecommendations } from "../services/openai.server";

const prisma = new PrismaClient();

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  const { id } = params;

  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  // Fetch questionnaire with feedback history
  const questionnaire = await prisma.subscriptionQuestionnaire.findUnique({
    where: { id },
    include: {
      feedbacks: {
        orderBy: {
          createdAt: "desc",
        },
      },
      aiRecommendations: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!questionnaire) {
    throw new Response("Not Found", { status: 404 });
  }

  return Response.json({ questionnaire });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await authenticate.admin(request);

  const { id } = params;

  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    // Fetch questionnaire with feedback
    const questionnaire = await prisma.subscriptionQuestionnaire.findUnique({
      where: { id },
      include: {
        feedbacks: true,
      },
    });

    if (!questionnaire) {
      throw new Response("Not Found", { status: 404 });
    }

    // Get available products from Shopify
    const products = await getProducts(request);

    // Get AI recommendations
    const { recommendations, fullResponse } = await getProductRecommendations({
      dogName: questionnaire.dogName,
      dogGender: questionnaire.dogGender,
      dogSize: questionnaire.dogSize,
      breed: questionnaire.breed,
      toyPreference: questionnaire.toyPreference,
      allergies: questionnaire.allergies,
      previousFeedback: questionnaire.feedbacks.map((fb) => ({
        productTitle: fb.productTitle,
        rating: fb.rating || undefined,
        comments: fb.comments || undefined,
      })),
      availableProducts: products.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description || "",
        tags: p.tags || [],
        productType: p.productType || "",
      })),
    });

    // Save recommendations
    const monthYear = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const savedRecommendation = await prisma.aIRecommendation.upsert({
      where: {
        questionnaireId_monthYear: {
          questionnaireId: id,
          monthYear,
        },
      },
      create: {
        questionnaireId: id,
        monthYear,
        recommendedProducts: JSON.stringify(recommendations),
        openAIResponse: fullResponse,
      },
      update: {
        recommendedProducts: JSON.stringify(recommendations),
        openAIResponse: fullResponse,
      },
    });

    return Response.json({
      success: true,
      recommendations,
      recommendationId: savedRecommendation.id,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export default function Recommendations() {
  const { questionnaire } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const latestRecommendation = questionnaire.aiRecommendations[0];
  const recommendations = latestRecommendation
    ? JSON.parse(latestRecommendation.recommendedProducts)
    : null;

  return (
    <s-page heading={`AI Recommendations for ${questionnaire.dogName}`}>
      <s-link slot="back-action" href="/app/subscriptions">Back</s-link>

      <s-section heading="Dog Profile">
        <s-stack direction="block" gap="small">
          <p><strong>Name:</strong> {questionnaire.dogName}</p>
          <p><strong>Breed:</strong> {questionnaire.breed}</p>
          <p><strong>Size:</strong> {questionnaire.dogSize}</p>
          <p><strong>Toy Preference:</strong> {questionnaire.toyPreference}</p>
          <p><strong>Allergies:</strong> {questionnaire.allergies}</p>
          <p><strong>Plan:</strong> {questionnaire.subscriptionPlan}</p>
        </s-stack>

        {questionnaire.feedbacks.length > 0 && (
          <s-stack direction="block" gap="small" style={{ marginTop: "1rem" }}>
            <h3>Feedback History ({questionnaire.feedbacks.length} items)</h3>
            <ul style={{ marginLeft: "1.5rem" }}>
              {questionnaire.feedbacks.slice(0, 5).map((fb) => (
                <li key={fb.id}>
                  {fb.productTitle} - {fb.rating ? `${fb.rating}⭐` : "No rating"}
                  {fb.comments && ` - "${fb.comments}"`}
                </li>
              ))}
            </ul>
          </s-stack>
        )}
      </s-section>

      <s-section heading="Generate AI Product Recommendations">
        <Form method="post">
          <s-button type="submit" variant="primary">
            🤖 Generate Recommendations with AI
          </s-button>
        </Form>

        {actionData?.error && (
          <s-banner tone="critical" style={{ marginTop: "1rem" }}>
            <p>{actionData.error}</p>
          </s-banner>
        )}

        {actionData?.success && actionData.recommendations && (
          <s-banner tone="success" style={{ marginTop: "1rem" }}>
            <p>
              AI has generated {actionData.recommendations.length} product
              recommendations for {questionnaire.dogName}.
            </p>
          </s-banner>
        )}
      </s-section>

      {(recommendations || actionData?.recommendations) && (
        <s-section heading="Latest AI Recommendations">
          {latestRecommendation && (
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "1rem" }}>
              Generated on{" "}
              {new Date(latestRecommendation.createdAt).toLocaleString()}
            </p>
          )}

          <s-stack direction="block" gap="base">
            {(actionData?.recommendations || recommendations).map(
              (rec: any, index: number) => (
                <s-box
                  key={index}
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                >
                  <h3 style={{ margin: "0 0 0.5rem 0" }}>
                    {index + 1}. {rec.productTitle}
                  </h3>
                  <p style={{ margin: "0 0 0.5rem 0" }}>{rec.reasoning}</p>
                  <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                    Confidence: {Math.round(rec.confidence * 100)}%
                  </p>
                </s-box>
              )
            )}
          </s-stack>
        </s-section>
      )}
    </s-page>
  );
}
