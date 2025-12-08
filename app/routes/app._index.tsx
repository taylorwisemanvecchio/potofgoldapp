import { useEffect } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const shopify = useAppBridge();

  const navigateToSubscriptions = () => {
    shopify.intents.invoke?.("redirect", {
      path: "/app/subscriptions",
    });
  };

  return (
    <s-page heading="🐕 Golden Retriever Toy Subscription Box">
      <s-button slot="primary-action" onClick={navigateToSubscriptions}>
        View Subscriptions
      </s-button>

      <s-section heading="Welcome to Your Dog Subscription App!">
        <s-paragraph>
          This app helps you manage your golden retriever toy subscription box business with:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>📋 Customer questionnaires for personalized subscriptions</s-list-item>
          <s-list-item>📧 Automated feedback collection after delivery</s-list-item>
          <s-list-item>🤖 AI-powered product recommendations using OpenAI</s-list-item>
          <s-list-item>📊 Subscription management dashboard</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Quick Start Guide">
        <s-paragraph>
          <strong>1. View Subscriptions</strong>
          <br />
          Click "View Subscriptions" above to see all customer questionnaires and feedback.
        </s-paragraph>
        <s-paragraph>
          <strong>2. Share Questionnaire Link</strong>
          <br />
          Send customers to: <code>/questionnaire/[ORDER_ID]</code> after they place an order.
        </s-paragraph>
        <s-paragraph>
          <strong>3. Generate AI Recommendations</strong>
          <br />
          Visit any subscription to generate personalized product recommendations based on preferences and feedback.
        </s-paragraph>
        <s-paragraph>
          <strong>4. Set Up Automated Emails</strong>
          <br />
          Configure the email service and cron job to automatically send feedback requests 7 days after delivery.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Features">
        <s-unordered-list>
          <s-list-item>Customer questionnaire forms</s-list-item>
          <s-list-item>Automatic order notes integration</s-list-item>
          <s-list-item>Fulfillment tracking</s-list-item>
          <s-list-item>Scheduled feedback emails</s-list-item>
          <s-list-item>Product rating system</s-list-item>
          <s-list-item>OpenAI-powered recommendations</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Setup Required">
        <s-paragraph>
          To complete the setup, add these environment variables to your <code>.env</code> file:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item><code>OPENAI_API_KEY</code> - Your OpenAI API key</s-list-item>
          <s-list-item><code>EMAIL_SERVICE_API_KEY</code> - Your email service key</s-list-item>
          <s-list-item><code>EMAIL_FROM</code> - Sender email address</s-list-item>
          <s-list-item><code>APP_URL</code> - Your app's public URL</s-list-item>
          <s-list-item><code>CRON_SECRET</code> - Secret for cron job authentication</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
