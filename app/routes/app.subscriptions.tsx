import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
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
  const data = useLoaderData<typeof loader>() as any;
  const subscriptions = data.subscriptions;

  return (
    <s-page heading="🐕 Dog Subscriptions">
      <s-section>
        {subscriptions.length === 0 ? (
          <s-banner tone="info">
            <p>
              No subscriptions yet. Share the questionnaire link with your
              customers!
            </p>
          </s-banner>
        ) : (
          <s-box borderWidth="base" borderRadius="base">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e1e3e5" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Dog Name</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Breed</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Size</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Plan</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Toy Pref</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Feedback</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub: any) => (
                  <tr
                    key={sub.id}
                    style={{ borderBottom: "1px solid #f1f2f3" }}
                  >
                    <td style={{ padding: "12px" }}>{sub.dogName}</td>
                    <td style={{ padding: "12px" }}>{sub.breed}</td>
                    <td style={{ padding: "12px" }}>{sub.dogSize}</td>
                    <td style={{ padding: "12px" }}>{sub.subscriptionPlan}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor:
                            sub.toyPreference === "durable"
                              ? "#e3f2fd"
                              : "#e8f5e9",
                          fontSize: "12px",
                        }}
                      >
                        {sub.toyPreference}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>
                      {sub.email}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {sub.feedbacks.length > 0
                        ? `${sub.feedbacks.length} feedbacks`
                        : "None"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Link to={`/app/recommendations/${sub.id}`}>
                        <s-button variant="tertiary">
                          AI Recommendations
                        </s-button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </s-box>
        )}
      </s-section>
    </s-page>
  );
}
