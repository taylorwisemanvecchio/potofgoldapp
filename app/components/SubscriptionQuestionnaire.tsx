import { useState } from "react";
import {
  Form,
  FormLayout,
  TextField,
  Select,
  Button,
  Card,
  Layout,
  Page,
  Banner,
} from "@shopify/polaris";

interface SubscriptionQuestionnaireProps {
  orderId: string;
  onSubmit?: (data: QuestionnaireData) => void;
}

export interface QuestionnaireData {
  orderId: string;
  dogName: string;
  dogGender: string;
  dogSize: string;
  breed: string;
  birthday: string;
  adoptionDay: string;
  toyPreference: string;
  allergies: string;
  email: string;
  subscriptionPlan: string;
}

export function SubscriptionQuestionnaire({
  orderId,
  onSubmit,
}: SubscriptionQuestionnaireProps) {
  const [formData, setFormData] = useState<QuestionnaireData>({
    orderId,
    dogName: "",
    dogGender: "male",
    dogSize: "medium",
    breed: "",
    birthday: "",
    adoptionDay: "",
    toyPreference: "mix",
    allergies: "none",
    email: "",
    subscriptionPlan: "monthly",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit questionnaire");
      }

      setSubmitSuccess(true);
      if (onSubmit) {
        onSubmit(formData);
      }
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
      <Page title="Subscription Questionnaire">
        <Layout>
          <Layout.Section>
            <Banner
              title="Thank you!"
              tone="success"
              onDismiss={() => setSubmitSuccess(false)}
            >
              <p>
                Your subscription questionnaire has been submitted
                successfully. We'll use this information to curate the perfect
                box for {formData.dogName}!
              </p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="🐕 Dog Toy Subscription Questionnaire">
      <Layout>
        <Layout.Section>
          {submitError && (
            <Banner title="Error" tone="critical">
              <p>{submitError}</p>
            </Banner>
          )}

          <Card>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <FormLayout.Group title="About Your Dog">
                  <TextField
                    label="Dog's Name"
                    value={formData.dogName}
                    onChange={(value) =>
                      setFormData({ ...formData, dogName: value })
                    }
                    autoComplete="off"
                    requiredIndicator
                  />

                  <Select
                    label="Gender"
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" },
                    ]}
                    value={formData.dogGender}
                    onChange={(value) =>
                      setFormData({ ...formData, dogGender: value })
                    }
                  />

                  <Select
                    label="Size"
                    options={[
                      { label: "Small (under 25 lbs)", value: "small" },
                      { label: "Medium (25-50 lbs)", value: "medium" },
                      { label: "Large (over 50 lbs)", value: "large" },
                    ]}
                    value={formData.dogSize}
                    onChange={(value) =>
                      setFormData({ ...formData, dogSize: value })
                    }
                  />

                  <TextField
                    label="Breed"
                    value={formData.breed}
                    onChange={(value) =>
                      setFormData({ ...formData, breed: value })
                    }
                    autoComplete="off"
                    requiredIndicator
                  />
                </FormLayout.Group>

                <FormLayout.Group title="Special Dates">
                  <TextField
                    label="Birthday (optional)"
                    type="date"
                    value={formData.birthday}
                    onChange={(value) =>
                      setFormData({ ...formData, birthday: value })
                    }
                    autoComplete="off"
                  />

                  <TextField
                    label="Adoption Day (optional)"
                    type="date"
                    value={formData.adoptionDay}
                    onChange={(value) =>
                      setFormData({ ...formData, adoptionDay: value })
                    }
                    autoComplete="off"
                  />
                </FormLayout.Group>

                <FormLayout.Group title="Preferences">
                  <Select
                    label="Preferred Toy Type"
                    options={[
                      { label: "Plush Toys", value: "plush" },
                      { label: "Durable/Tough Toys", value: "durable" },
                      { label: "Mix of Both", value: "mix" },
                    ]}
                    value={formData.toyPreference}
                    onChange={(value) =>
                      setFormData({ ...formData, toyPreference: value })
                    }
                  />

                  <Select
                    label="Any Allergies?"
                    options={[
                      { label: "None", value: "none" },
                      { label: "Chicken", value: "chicken" },
                      { label: "Turkey", value: "turkey" },
                      { label: "Beef", value: "beef" },
                      {
                        label: "Multiple (specify in notes)",
                        value: "multiple",
                      },
                    ]}
                    value={formData.allergies}
                    onChange={(value) =>
                      setFormData({ ...formData, allergies: value })
                    }
                  />
                </FormLayout.Group>

                <FormLayout.Group title="Contact & Subscription">
                  <TextField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(value) =>
                      setFormData({ ...formData, email: value })
                    }
                    autoComplete="email"
                    requiredIndicator
                  />

                  <Select
                    label="Subscription Plan"
                    options={[
                      { label: "Monthly", value: "monthly" },
                      { label: "6 Month Plan", value: "6-month" },
                      { label: "12 Month Plan", value: "12-month" },
                    ]}
                    value={formData.subscriptionPlan}
                    onChange={(value) =>
                      setFormData({ ...formData, subscriptionPlan: value })
                    }
                  />
                </FormLayout.Group>

                <Button
                  variant="primary"
                  submit
                  loading={isSubmitting}
                  disabled={
                    !formData.dogName ||
                    !formData.breed ||
                    !formData.email ||
                    isSubmitting
                  }
                >
                  Submit Questionnaire
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
