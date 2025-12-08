import { useState } from "react";
import {
  Form,
  FormLayout,
  TextField,
  Button,
  Card,
  Layout,
  Page,
  Banner,
  Text,
  BlockStack,
  InlineStack,
  Box,
} from "@shopify/polaris";

interface Product {
  id: string;
  title: string;
  imageUrl?: string;
}

interface FeedbackQuestionnaireProps {
  dogName: string;
  products: Product[];
  questionnaireId: string;
}

interface ProductFeedback {
  productId: string;
  rating: number;
  comments: string;
}

export function FeedbackQuestionnaire({
  dogName,
  products,
  questionnaireId,
}: FeedbackQuestionnaireProps) {
  const [feedback, setFeedback] = useState<Record<string, ProductFeedback>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateFeedback = (
    productId: string,
    field: keyof ProductFeedback,
    value: any
  ) => {
    setFeedback((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        productId,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionnaireId,
          feedback: Object.values(feedback),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Page title="Feedback Submitted">
        <Layout>
          <Layout.Section>
            <Banner
              title="Thank you for your feedback!"
              tone="success"
              onDismiss={() => setSubmitSuccess(false)}
            >
              <p>
                We appreciate you taking the time to let us know how {dogName}{" "}
                enjoyed their box. This helps us make the next one even better!
              </p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title={`How did ${dogName} like each item? 🐕`}>
      <Layout>
        <Layout.Section>
          {submitError && (
            <Banner title="Error" tone="critical">
              <p>{submitError}</p>
            </Banner>
          )}

          <BlockStack gap="400">
            <Text as="p" variant="bodyMd">
              Please rate each product and share your thoughts. Your feedback
              helps us curate the perfect boxes for {dogName}!
            </Text>

            {products.map((product) => (
              <Card key={product.id}>
                <BlockStack gap="400">
                  {product.imageUrl && (
                    <Box>
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          borderRadius: "8px",
                        }}
                      />
                    </Box>
                  )}

                  <Text as="h2" variant="headingMd">
                    {product.title}
                  </Text>

                  <FormLayout>
                    <div>
                      <Text as="p" variant="bodyMd">
                        Rating (1-5 stars)
                      </Text>
                      <InlineStack gap="200">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={
                              feedback[product.id]?.rating === rating
                                ? "primary"
                                : "secondary"
                            }
                            onClick={() =>
                              updateFeedback(product.id, "rating", rating)
                            }
                          >
                            {rating} ⭐
                          </Button>
                        ))}
                      </InlineStack>
                    </div>

                    <TextField
                      label="Comments (optional)"
                      value={feedback[product.id]?.comments || ""}
                      onChange={(value) =>
                        updateFeedback(product.id, "comments", value)
                      }
                      multiline={3}
                      autoComplete="off"
                      placeholder={`Tell us what ${dogName} thought about this toy...`}
                    />
                  </FormLayout>
                </BlockStack>
              </Card>
            ))}

            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              size="large"
            >
              Submit Feedback
            </Button>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
