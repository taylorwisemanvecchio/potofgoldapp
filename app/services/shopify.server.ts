import { authenticate } from "../shopify.server";

/**
 * Add a note to a Shopify order
 */
export async function addOrderNote(
  request: Request,
  orderId: string,
  note: string
): Promise<boolean> {
  try {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
      mutation orderUpdate($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            note
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: {
            id: orderId,
            note: note,
          },
        },
      }
    );

    const data = await response.json();

    if (data.data?.orderUpdate?.userErrors?.length > 0) {
      console.error("Order update errors:", data.data.orderUpdate.userErrors);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to add order note:", error);
    return false;
  }
}

/**
 * Get products from Shopify inventory
 */
export async function getProducts(request: Request) {
  try {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              description
              productType
              tags
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }`,
      {
        variables: {
          first: 50,
        },
      }
    );

    const data = await response.json();

    return (
      data.data?.products?.edges?.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        description: edge.node.description,
        productType: edge.node.productType,
        tags: edge.node.tags,
        price: edge.node.variants?.edges?.[0]?.node?.price,
        imageUrl: edge.node.images?.edges?.[0]?.node?.url,
      })) || []
    );
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

/**
 * Get order details from Shopify
 */
export async function getOrder(request: Request, orderId: string) {
  try {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          name
          email
          createdAt
          note
          customer {
            id
            email
            firstName
            lastName
          }
          lineItems(first: 10) {
            edges {
              node {
                id
                title
                quantity
                variant {
                  id
                  product {
                    id
                    title
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      {
        variables: {
          id: orderId,
        },
      }
    );

    const data = await response.json();
    return data.data?.order || null;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

/**
 * Get fulfillment details
 */
export async function getFulfillment(
  request: Request,
  fulfillmentId: string
) {
  try {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
      query getFulfillment($id: ID!) {
        fulfillment(id: $id) {
          id
          status
          createdAt
          deliveredAt
          estimatedDeliveryAt
          trackingInfo {
            number
            url
          }
          fulfillmentLineItems(first: 10) {
            edges {
              node {
                id
                quantity
                lineItem {
                  id
                  title
                  variant {
                    product {
                      id
                      title
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      {
        variables: {
          id: fulfillmentId,
        },
      }
    );

    const data = await response.json();
    return data.data?.fulfillment || null;
  } catch (error) {
    console.error("Failed to fetch fulfillment:", error);
    return null;
  }
}

/**
 * Format questionnaire data as order note
 */
export function formatQuestionnaireAsNote(data: {
  dogName: string;
  dogGender: string;
  dogSize: string;
  breed: string;
  birthday?: Date;
  adoptionDay?: Date;
  toyPreference: string;
  allergies: string;
  subscriptionPlan: string;
}): string {
  const parts = [
    "🐕 SUBSCRIPTION QUESTIONNAIRE",
    `Dog Name: ${data.dogName}`,
    `Gender: ${data.dogGender}`,
    `Size: ${data.dogSize}`,
    `Breed: ${data.breed}`,
  ];

  if (data.birthday) {
    parts.push(`Birthday: ${data.birthday.toLocaleDateString()}`);
  }

  if (data.adoptionDay) {
    parts.push(`Adoption Day: ${data.adoptionDay.toLocaleDateString()}`);
  }

  parts.push(
    `Toy Preference: ${data.toyPreference}`,
    `Allergies: ${data.allergies}`,
    `Subscription Plan: ${data.subscriptionPlan}`
  );

  return parts.join("\n");
}
