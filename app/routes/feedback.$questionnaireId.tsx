import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { PrismaClient } from "@prisma/client";
import { FeedbackQuestionnaire } from "../components/FeedbackQuestionnaire";

const prisma = new PrismaClient();

export async function loader({ params }: LoaderFunctionArgs) {
  const { questionnaireId } = params;

  if (!questionnaireId) {
    throw new Response("Not Found", { status: 404 });
  }

  // Fetch questionnaire and pending feedback
  const questionnaire = await prisma.subscriptionQuestionnaire.findUnique({
    where: { id: questionnaireId },
    include: {
      feedbacks: {
        where: {
          respondedAt: null, // Only get feedback that hasn't been filled out yet
        },
      },
    },
  });

  if (!questionnaire) {
    throw new Response("Not Found", { status: 404 });
  }

  // Get products from feedback records
  const products = questionnaire.feedbacks.map((fb) => ({
    id: fb.productId,
    title: fb.productTitle,
    imageUrl: fb.productImageUrl || undefined,
  }));

  return Response.json({
    questionnaireId,
    dogName: questionnaire.dogName,
    products,
  });
}

export default function FeedbackPage() {
  const { questionnaireId, dogName, products } =
    useLoaderData<typeof loader>();

  if (products.length === 0) {
    return (
      <s-page heading="Feedback">
        <s-banner tone="info">
          <p>
            There are no items waiting for feedback at this time. Thank you for
            being a valued customer!
          </p>
        </s-banner>
      </s-page>
    );
  }

  return (
    <FeedbackQuestionnaire
      dogName={dogName}
      products={products}
      questionnaireId={questionnaireId}
    />
  );
}
