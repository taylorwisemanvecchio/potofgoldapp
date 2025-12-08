import { useState } from "react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <s-page heading="Subscription Questionnaire">
        <s-banner tone="success">
          <p>
            Thank you! Your subscription questionnaire has been submitted
            successfully. We'll use this information to curate the perfect box
            for {formData.dogName}!
          </p>
        </s-banner>
      </s-page>
    );
  }

  return (
    <s-page heading="🐕 Dog Toy Subscription Questionnaire">
      {submitError && (
        <s-banner tone="critical">
          <p>{submitError}</p>
        </s-banner>
      )}

      <s-section>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <s-section heading="About Your Dog">
            <s-stack direction="block" gap="base">
              <s-textfield
                label="Dog's Name *"
                value={formData.dogName}
                onInput={(e: any) =>
                  setFormData({ ...formData, dogName: e.target.value })
                }
                required
              />

              <s-select
                label="Gender"
                value={formData.dogGender}
                onChange={(e: any) =>
                  setFormData({ ...formData, dogGender: e.target.value })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </s-select>

              <s-select
                label="Size"
                value={formData.dogSize}
                onChange={(e: any) =>
                  setFormData({ ...formData, dogSize: e.target.value })
                }
              >
                <option value="small">Small (under 25 lbs)</option>
                <option value="medium">Medium (25-50 lbs)</option>
                <option value="large">Large (over 50 lbs)</option>
              </s-select>

              <s-textfield
                label="Breed *"
                value={formData.breed}
                onInput={(e: any) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
                required
              />
            </s-stack>
          </s-section>

          <s-section heading="Special Dates">
            <s-stack direction="block" gap="base">
              <s-textfield
                label="Birthday (optional)"
                type="date"
                value={formData.birthday}
                onInput={(e: any) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
              />

              <s-textfield
                label="Adoption Day (optional)"
                type="date"
                value={formData.adoptionDay}
                onInput={(e: any) =>
                  setFormData({ ...formData, adoptionDay: e.target.value })
                }
              />
            </s-stack>
          </s-section>

          <s-section heading="Preferences">
            <s-stack direction="block" gap="base">
              <s-select
                label="Preferred Toy Type"
                value={formData.toyPreference}
                onChange={(e: any) =>
                  setFormData({ ...formData, toyPreference: e.target.value })
                }
              >
                <option value="plush">Plush Toys</option>
                <option value="durable">Durable/Tough Toys</option>
                <option value="mix">Mix of Both</option>
              </s-select>

              <s-select
                label="Any Allergies?"
                value={formData.allergies}
                onChange={(e: any) =>
                  setFormData({ ...formData, allergies: e.target.value })
                }
              >
                <option value="none">None</option>
                <option value="chicken">Chicken</option>
                <option value="turkey">Turkey</option>
                <option value="beef">Beef</option>
                <option value="multiple">Multiple (specify in notes)</option>
              </s-select>
            </s-stack>
          </s-section>

          <s-section heading="Contact & Subscription">
            <s-stack direction="block" gap="base">
              <s-textfield
                label="Email Address *"
                type="email"
                value={formData.email}
                onInput={(e: any) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <s-select
                label="Subscription Plan"
                value={formData.subscriptionPlan}
                onChange={(e: any) =>
                  setFormData({ ...formData, subscriptionPlan: e.target.value })
                }
              >
                <option value="monthly">Monthly</option>
                <option value="6-month">6 Month Plan</option>
                <option value="12-month">12 Month Plan</option>
              </s-select>
            </s-stack>
          </s-section>

          <s-button
            variant="primary"
            type="submit"
            {...(isSubmitting ? { loading: true } : {})}
            disabled={
              !formData.dogName ||
              !formData.breed ||
              !formData.email ||
              isSubmitting
            }
          >
            Submit Questionnaire
          </s-button>
        </form>
      </s-section>
    </s-page>
  );
}
