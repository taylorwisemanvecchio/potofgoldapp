import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { useLoaderData, useActionData, Form } from "react-router";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  Banner,
  List,
} from "@shopify/polaris";
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

  return json({ questionnaire });
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

    return json({
      success: true,
      recommendations,
      recommendationId: savedRecommendation.id,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return json(
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
    <Page
      title={`AI Recommendations for ${questionnaire.dogName}`}
      backAction={{ url: "/app/subscriptions" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Dog Profile
              </Text>
              <List>
                <List.Item>
                  <strong>Name:</strong> {questionnaire.dogName}
                </List.Item>
                <List.Item>
                  <strong>Breed:</strong> {questionnaire.breed}
                </List.Item>
                <List.Item>
                  <strong>Size:</strong> {questionnaire.dogSize}
                </List.Item>
                <List.Item>
                  <strong>Toy Preference:</strong> {questionnaire.toyPreference}
                </List.Item>
                <List.Item>
                  <strong>Allergies:</strong> {questionnaire.allergies}
                </List.Item>
                <List.Item>
                  <strong>Plan:</strong> {questionnaire.subscriptionPlan}
                </List.Item>
              </List>

              {questionnaire.feedbacks.length > 0 && (
                <>
                  <Text as="h3" variant="headingMd">
                    Feedback History ({questionnaire.feedbacks.length} items)
                  </Text>
                  <List>
                    {questionnaire.feedbacks.slice(0, 5).map((fb) => (
                      <List.Item key={fb.id}>
                        {fb.productTitle} -{" "}
                        {fb.rating ? `${fb.rating}⭐` : "No rating"}
                        {fb.comments && ` - "${fb.comments}"`}
                      </List.Item>
                    ))}
                  </List>
                </>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Generate AI Product Recommendations
              </Text>

              <Form method="post">
                <Button submit variant="primary">
                  🤖 Generate Recommendations with AI
                </Button>
              </Form>

              {actionData?.error && (
                <Banner title="Error" tone="critical">
                  <p>{actionData.error}</p>
                </Banner>
              )}

              {actionData?.success && actionData.recommendations && (
                <Banner title="Recommendations Generated!" tone="success">
                  <p>
                    AI has generated {actionData.recommendations.length}{" "}
                    product recommendations for {questionnaire.dogName}.
                  </p>
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {(recommendations || actionData?.recommendations) && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Latest AI Recommendations
                </Text>

                {latestRecommendation && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    Generated on{" "}
                    {new Date(latestRecommendation.createdAt).toLocaleString()}
                  </Text>
                )}

                {(actionData?.recommendations || recommendations).map(
                  (rec: any, index: number) => (
                    <Card key={index}>
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingSm">
                          {index + 1}. {rec.productTitle}
                        </Text>
                        <Text as="p" variant="bodyMd">
                          {rec.reasoning}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          Confidence: {Math.round(rec.confidence * 100)}%
                        </Text>
                      </BlockStack>
                    </Card>
                  )
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
