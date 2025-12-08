import { json, type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { SubscriptionQuestionnaire } from "../components/SubscriptionQuestionnaire";

export async function loader({ params }: LoaderFunctionArgs) {
  const { orderId } = params;

  if (!orderId) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ orderId });
}

export default function QuestionnairePage() {
  const { orderId } = useLoaderData<typeof loader>();

  return <SubscriptionQuestionnaire orderId={orderId} />;
}
