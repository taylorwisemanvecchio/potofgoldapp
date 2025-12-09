import { useState } from "react";

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
  productTitle: string;
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
    productTitle: string,
    field: keyof ProductFeedback,
    value: any
  ) => {
    setFeedback((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        productId,
        productTitle,
        [field]: value,
      } as ProductFeedback,
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
      <s-page heading="Feedback Submitted">
        <s-banner tone="success">
          <p>
            Thank you for your feedback! We appreciate you taking the time to
            let us know how {dogName} enjoyed their box. This helps us make the
            next one even better!
          </p>
        </s-banner>
      </s-page>
    );
  }

  return (
    <s-page heading={`How did ${dogName} like each item? 🐕`}>
      {submitError && (
        <s-banner tone="critical">
          <p>{submitError}</p>
        </s-banner>
      )}

      <s-section>
        <p style={{ marginBottom: "1rem" }}>
          Please rate each product and share your thoughts. Your feedback helps
          us curate the perfect boxes for {dogName}!
        </p>

        <s-stack direction="block" gap="large">
          {products.map((product) => (
            <s-box
              key={product.id}
              padding="large"
              borderWidth="base"
              borderRadius="base"
            >
              <s-stack direction="block" gap="base">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "8px",
                    }}
                  />
                )}

                <h3 style={{ margin: "0.5rem 0" }}>{product.title}</h3>

                <div>
                  <p style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                    Rating (1-5 stars)
                  </p>
                  <s-stack direction="inline" gap="small">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <s-button
                        key={rating}
                        variant={
                          feedback[product.id]?.rating === rating
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() =>
                          updateFeedback(
                            product.id,
                            product.title,
                            "rating",
                            rating
                          )
                        }
                      >
                        {rating} ⭐
                      </s-button>
                    ))}
                  </s-stack>
                </div>

                <s-textfield
                  label="Comments (optional)"
                  value={feedback[product.id]?.comments || ""}
                  onInput={(e: any) =>
                    updateFeedback(
                      product.id,
                      product.title,
                      "comments",
                      e.target.value
                    )
                  }
                  multiline
                  placeholder={`Tell us what ${dogName} thought about this toy...`}
                />
              </s-stack>
            </s-box>
          ))}

          <s-button
            variant="primary"
            onClick={handleSubmit}
            {...(isSubmitting ? { loading: true } : {})}
            disabled={isSubmitting}
          >
            Submit Feedback
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}
