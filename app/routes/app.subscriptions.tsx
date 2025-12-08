import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Page, Layout, Card, DataTable, Badge, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  // Fetch all subscription questionnaires with related data
  const subscriptions = await prisma.subscriptionQuestionnaire.findMany({
    include: {
      feedbacks: true,
      aiRecommendations: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json({ subscriptions });
}

export default function Subscriptions() {
  const { subscriptions } = useLoaderData<typeof loader>();

  const rows = subscriptions.map((sub) => [
    sub.dogName,
    sub.breed,
    sub.dogSize,
    sub.subscriptionPlan,
    <Badge key={sub.id} tone={sub.toyPreference === "durable" ? "info" : "success"}>
      {sub.toyPreference}
    </Badge>,
    sub.email,
    sub.feedbacks.length > 0 ? `${sub.feedbacks.length} feedbacks` : "No feedback yet",
    new Date(sub.createdAt).toLocaleDateString(),
  ]);

  return (
    <Page
      title="🐕 Dog Subscriptions"
      subtitle="Manage and view all subscription questionnaires"
    >
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={[
                "text",
                "text",
                "text",
                "text",
                "text",
                "text",
                "text",
                "text",
              ]}
              headings={[
                "Dog Name",
                "Breed",
                "Size",
                "Plan",
                "Toy Preference",
                "Email",
                "Feedback",
                "Created",
              ]}
              rows={rows}
            />

            {subscriptions.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <Text as="p" variant="bodyMd">
                  No subscriptions yet. Share the questionnaire link with your customers!
                </Text>
              </div>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
